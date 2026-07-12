import { randomUUID } from "node:crypto";
import type Database from "better-sqlite3";

import { CONTINUATION_POLICY_VERSION } from "../loop/continuation.js";
import { detectSensitiveValues } from "../redaction/detectors.js";

export type ContinuationReceiptStatus =
  | "generated"
  | "copied"
  | "delivered"
  | "followed"
  | "partial"
  | "ignored";

export type ContinuationReceipt = {
  id: string;
  snapshot_id: string;
  project_id: string;
  policy_version: string;
  created_at: string;
  status: ContinuationReceiptStatus;
  copied_at?: string;
  delivered_at?: string;
  used_at?: string;
  target_correct?: boolean;
  first_action_correct?: boolean;
  deviation_reason?: string;
  first_value_seconds?: number;
  friction_score?: number;
  privacy: {
    local_only: true;
    stores_prompt_bodies: false;
    stores_raw_paths: false;
    stores_transcripts: false;
  };
};

export type RecordContinuationReceiptInput = {
  snapshot_id: string;
  policy_version?: string;
};

export type UpdateContinuationReceiptInput = {
  status: Exclude<ContinuationReceiptStatus, "generated">;
  target_correct?: boolean;
  first_action_correct?: boolean;
  deviation_reason?: string;
  first_value_seconds?: number;
  friction_score?: number;
};

export function applyContinuationReceiptMigration(db: Database.Database): void {
  if (db.prepare("SELECT 1 FROM schema_migrations WHERE version = ?").get(21))
    return;

  db.exec(`
    CREATE TABLE IF NOT EXISTS continuation_receipts (
      id TEXT PRIMARY KEY,
      snapshot_id TEXT NOT NULL,
      project_id TEXT NOT NULL,
      policy_version TEXT NOT NULL,
      created_at TEXT NOT NULL,
      status TEXT NOT NULL,
      copied_at TEXT,
      delivered_at TEXT,
      used_at TEXT,
      target_correct INTEGER,
      first_action_correct INTEGER,
      deviation_reason TEXT,
      first_value_seconds INTEGER,
      friction_score INTEGER,
      privacy_json TEXT NOT NULL,
      FOREIGN KEY(snapshot_id) REFERENCES loop_snapshots(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_continuation_receipts_snapshot_created
      ON continuation_receipts(snapshot_id, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_continuation_receipts_project_created
      ON continuation_receipts(project_id, created_at DESC);
  `);
  db.prepare(
    "INSERT INTO schema_migrations(version, name, applied_at) VALUES (?, ?, ?)",
  ).run(21, "021_continuation_receipts", new Date().toISOString());
}

export function recordContinuationReceipt(
  db: Database.Database,
  input: RecordContinuationReceiptInput,
  now: Date,
): ContinuationReceipt {
  const snapshot = db
    .prepare("SELECT project_id FROM loop_snapshots WHERE id = ?")
    .get(input.snapshot_id) as { project_id: string } | undefined;
  if (!snapshot) throw new Error("Continuation receipt snapshot not found.");

  const receipt: ContinuationReceipt = {
    id: `brief_${randomUUID().replaceAll("-", "").slice(0, 24)}`,
    snapshot_id: input.snapshot_id,
    project_id: snapshot.project_id,
    policy_version: input.policy_version ?? CONTINUATION_POLICY_VERSION,
    created_at: now.toISOString(),
    status: "generated",
    privacy: receiptPrivacy(),
  };
  db.prepare(
    `INSERT INTO continuation_receipts
      (id, snapshot_id, project_id, policy_version, created_at, status, privacy_json)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    receipt.id,
    receipt.snapshot_id,
    receipt.project_id,
    receipt.policy_version,
    receipt.created_at,
    receipt.status,
    JSON.stringify(receipt.privacy),
  );
  return receipt;
}

export function updateContinuationReceipt(
  db: Database.Database,
  id: string,
  input: UpdateContinuationReceiptInput,
  now: Date,
): ContinuationReceipt | undefined {
  const existing = getContinuationReceipt(db, id);
  if (!existing) return undefined;
  validateUpdate(existing, input);

  const timestamp = now.toISOString();
  const next: ContinuationReceipt = {
    ...existing,
    status: input.status,
    ...(input.status === "copied" && !existing.copied_at
      ? { copied_at: timestamp }
      : {}),
    ...(input.status === "delivered" && !existing.delivered_at
      ? { delivered_at: timestamp }
      : {}),
    ...(["followed", "partial", "ignored"].includes(input.status)
      ? { used_at: timestamp }
      : {}),
    ...(input.target_correct === undefined
      ? {}
      : { target_correct: input.target_correct }),
    ...(input.first_action_correct === undefined
      ? {}
      : { first_action_correct: input.first_action_correct }),
    ...(input.deviation_reason
      ? { deviation_reason: input.deviation_reason.trim() }
      : {}),
    ...(input.first_value_seconds === undefined
      ? {}
      : { first_value_seconds: input.first_value_seconds }),
    ...(input.friction_score === undefined
      ? {}
      : { friction_score: input.friction_score }),
  };

  db.prepare(
    `UPDATE continuation_receipts SET
      status = ?, copied_at = ?, delivered_at = ?, used_at = ?,
      target_correct = ?, first_action_correct = ?, deviation_reason = ?,
      first_value_seconds = ?, friction_score = ?
     WHERE id = ?`,
  ).run(
    next.status,
    next.copied_at ?? null,
    next.delivered_at ?? null,
    next.used_at ?? null,
    toSqlBoolean(next.target_correct),
    toSqlBoolean(next.first_action_correct),
    next.deviation_reason ?? null,
    next.first_value_seconds ?? null,
    next.friction_score ?? null,
    id,
  );
  return next;
}

export function getContinuationReceipt(
  db: Database.Database,
  id: string,
): ContinuationReceipt | undefined {
  const row = db
    .prepare("SELECT * FROM continuation_receipts WHERE id = ?")
    .get(id) as ContinuationReceiptRow | undefined;
  return row ? receiptFromRow(row) : undefined;
}

export function listContinuationReceipts(
  db: Database.Database,
  input: { snapshotId?: string; projectId?: string; limit?: number } = {},
): ContinuationReceipt[] {
  const limit = Math.min(Math.max(input.limit ?? 50, 1), 100);
  const rows = input.snapshotId
    ? db
        .prepare(
          "SELECT * FROM continuation_receipts WHERE snapshot_id = ? ORDER BY created_at DESC, id DESC LIMIT ?",
        )
        .all(input.snapshotId, limit)
    : input.projectId
      ? db
          .prepare(
            "SELECT * FROM continuation_receipts WHERE project_id = ? ORDER BY created_at DESC, id DESC LIMIT ?",
          )
          .all(input.projectId, limit)
      : db
          .prepare(
            "SELECT * FROM continuation_receipts ORDER BY created_at DESC, id DESC LIMIT ?",
          )
          .all(limit);
  return (rows as ContinuationReceiptRow[]).map(receiptFromRow);
}

function validateUpdate(
  existing: ContinuationReceipt,
  input: UpdateContinuationReceiptInput,
): void {
  const rank: Record<ContinuationReceiptStatus, number> = {
    generated: 0,
    copied: 1,
    delivered: 2,
    followed: 3,
    partial: 3,
    ignored: 3,
  };
  if (
    !["copied", "delivered", "followed", "partial", "ignored"].includes(
      input.status as string,
    )
  ) {
    throw new Error("Continuation receipt status is not supported.");
  }
  if (rank[input.status] < rank[existing.status]) {
    throw new Error("Continuation receipt status must not move backwards.");
  }
  if (rank[existing.status] === 3 && input.status !== existing.status) {
    throw new Error("A final continuation receipt status is immutable.");
  }
  validateBoolean(input.target_correct, "target correct");
  validateBoolean(input.first_action_correct, "first action correct");
  if (
    ["partial", "ignored"].includes(input.status) &&
    !input.deviation_reason?.trim()
  ) {
    throw new Error(
      "Partial or ignored continuation receipts require a deviation reason.",
    );
  }
  const reason = input.deviation_reason?.trim();
  if (reason && reason.length > 500) {
    throw new Error(
      "Continuation receipt deviation reason must be at most 500 characters.",
    );
  }
  if (reason && detectSensitiveValues(reason).length > 0) {
    throw new Error(
      "Continuation receipt deviation reason must not include secrets or raw local paths.",
    );
  }
  validateInteger(input.first_value_seconds, "first value seconds", 0);
  validateInteger(input.friction_score, "friction score", 0, 3);
}

function validateBoolean(value: boolean | undefined, label: string): void {
  if (value !== undefined && typeof value !== "boolean") {
    throw new Error(`Continuation receipt ${label} must be a boolean.`);
  }
}

function validateInteger(
  value: number | undefined,
  label: string,
  minimum: number,
  maximum = Number.MAX_SAFE_INTEGER,
): void {
  if (
    value !== undefined &&
    (!Number.isInteger(value) || value < minimum || value > maximum)
  ) {
    throw new Error(
      `Continuation receipt ${label} must be an integer from ${minimum} to ${maximum}.`,
    );
  }
}

type ContinuationReceiptRow = {
  id: string;
  snapshot_id: string;
  project_id: string;
  policy_version: string;
  created_at: string;
  status: ContinuationReceiptStatus;
  copied_at: string | null;
  delivered_at: string | null;
  used_at: string | null;
  target_correct: number | null;
  first_action_correct: number | null;
  deviation_reason: string | null;
  first_value_seconds: number | null;
  friction_score: number | null;
  privacy_json: string;
};

function receiptFromRow(row: ContinuationReceiptRow): ContinuationReceipt {
  return {
    id: row.id,
    snapshot_id: row.snapshot_id,
    project_id: row.project_id,
    policy_version: row.policy_version,
    created_at: row.created_at,
    status: row.status,
    ...(row.copied_at ? { copied_at: row.copied_at } : {}),
    ...(row.delivered_at ? { delivered_at: row.delivered_at } : {}),
    ...(row.used_at ? { used_at: row.used_at } : {}),
    ...(row.target_correct === null
      ? {}
      : { target_correct: row.target_correct === 1 }),
    ...(row.first_action_correct === null
      ? {}
      : { first_action_correct: row.first_action_correct === 1 }),
    ...(row.deviation_reason ? { deviation_reason: row.deviation_reason } : {}),
    ...(row.first_value_seconds === null
      ? {}
      : { first_value_seconds: row.first_value_seconds }),
    ...(row.friction_score === null
      ? {}
      : { friction_score: row.friction_score }),
    privacy: receiptPrivacy(),
  };
}

function receiptPrivacy(): ContinuationReceipt["privacy"] {
  return {
    local_only: true,
    stores_prompt_bodies: false,
    stores_raw_paths: false,
    stores_transcripts: false,
  };
}

function toSqlBoolean(value: boolean | undefined): number | null {
  return value === undefined ? null : value ? 1 : 0;
}
