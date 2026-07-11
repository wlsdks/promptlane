import { randomUUID } from "node:crypto";
import type Database from "better-sqlite3";

export type LoopMergeDecisionValue = "merge" | "continue" | "defer";

export type LoopMergeDecision = {
  id: string;
  snapshot_id: string;
  project_id: string;
  worktree: string;
  decision: LoopMergeDecisionValue;
  reason: string;
  decided_by: string;
  created_at: string;
  privacy: {
    local_only: true;
    stores_prompt_bodies: false;
    stores_raw_paths: false;
    writes_git_state: false;
    external_calls: false;
  };
};

export type RecordLoopMergeDecisionInput = {
  snapshot_id: string;
  project_id: string;
  worktree: string;
  decision: LoopMergeDecisionValue;
  reason: string;
  decided_by: string;
};

export type LoopMergeDecisionListResult = {
  items: LoopMergeDecision[];
};

export function applyLoopMergeDecisionMigration(db: Database.Database): void {
  const applied = db
    .prepare("SELECT 1 FROM schema_migrations WHERE version = ?")
    .get(19);
  if (applied) return;

  db.exec(`
    CREATE TABLE IF NOT EXISTS loop_merge_decisions (
      id TEXT PRIMARY KEY,
      snapshot_id TEXT NOT NULL,
      project_id TEXT NOT NULL,
      worktree_label TEXT NOT NULL,
      decision TEXT NOT NULL,
      reason TEXT NOT NULL,
      decided_by TEXT NOT NULL,
      created_at TEXT NOT NULL,
      privacy_json TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_loop_merge_decisions_created_at
      ON loop_merge_decisions(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_loop_merge_decisions_project_created
      ON loop_merge_decisions(project_id, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_loop_merge_decisions_worktree_created
      ON loop_merge_decisions(worktree_label, created_at DESC);
  `);

  db.prepare(
    "INSERT INTO schema_migrations(version, name, applied_at) VALUES (?, ?, ?)",
  ).run(19, "019_loop_merge_decisions", new Date().toISOString());
}

export function recordLoopMergeDecision(
  db: Database.Database,
  input: RecordLoopMergeDecisionInput,
  now: Date,
): LoopMergeDecision {
  const reason = input.reason.trim();
  if (!reason) {
    throw new Error("Loop merge decision reason must not be empty.");
  }
  if (looksUnsafe(reason)) {
    throw new Error(
      "Loop merge decision reason must not include raw paths or secrets.",
    );
  }

  const decision: LoopMergeDecision = {
    id: createLoopMergeDecisionId(),
    snapshot_id: input.snapshot_id,
    project_id: input.project_id,
    worktree: input.worktree.trim(),
    decision: input.decision,
    reason,
    decided_by: input.decided_by.trim() || "user",
    created_at: now.toISOString(),
    privacy: loopMergeDecisionPrivacy(),
  };

  db.prepare(
    `
    INSERT INTO loop_merge_decisions (
      id,
      snapshot_id,
      project_id,
      worktree_label,
      decision,
      reason,
      decided_by,
      created_at,
      privacy_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
  ).run(
    decision.id,
    decision.snapshot_id,
    decision.project_id,
    decision.worktree,
    decision.decision,
    decision.reason,
    decision.decided_by,
    decision.created_at,
    JSON.stringify(decision.privacy),
  );

  return decision;
}

export function listLoopMergeDecisions(
  db: Database.Database,
  options: { limit?: number; projectId?: string; worktree?: string } = {},
): LoopMergeDecisionListResult {
  const limit = normalizeLimit(options.limit);
  const clauses: string[] = [];
  const params: Array<string | number> = [];
  if (options.projectId) {
    clauses.push("project_id = ?");
    params.push(options.projectId);
  }
  if (options.worktree) {
    clauses.push("worktree_label = ?");
    params.push(options.worktree);
  }

  const where = clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "";
  const rows = db
    .prepare(
      `
      SELECT *
      FROM loop_merge_decisions
      ${where}
      ORDER BY created_at DESC, id DESC
      LIMIT ?
      `,
    )
    .all(...params, limit) as LoopMergeDecisionRow[];

  return { items: rows.map(loopMergeDecisionFromRow) };
}

type LoopMergeDecisionRow = {
  id: string;
  snapshot_id: string;
  project_id: string;
  worktree_label: string;
  decision: LoopMergeDecisionValue;
  reason: string;
  decided_by: string;
  created_at: string;
  privacy_json: string;
};

function loopMergeDecisionFromRow(
  row: LoopMergeDecisionRow,
): LoopMergeDecision {
  return {
    id: row.id,
    snapshot_id: row.snapshot_id,
    project_id: row.project_id,
    worktree: row.worktree_label,
    decision: row.decision,
    reason: row.reason,
    decided_by: row.decided_by,
    created_at: row.created_at,
    privacy: loopMergeDecisionPrivacy(),
  };
}

function loopMergeDecisionPrivacy(): LoopMergeDecision["privacy"] {
  return {
    local_only: true,
    stores_prompt_bodies: false,
    stores_raw_paths: false,
    writes_git_state: false,
    external_calls: false,
  };
}

function looksUnsafe(value: string): boolean {
  return (
    /(?:^|\s)\/Users\/[^\s]+/.test(value) ||
    /(?:^|\s)\/home\/[^\s]+/.test(value) ||
    /sk-[a-z0-9_-]{6,}/i.test(value) ||
    /gh[pousr]_[a-z0-9_]{12,}/i.test(value)
  );
}

function normalizeLimit(limit: number | undefined): number {
  if (!limit || !Number.isInteger(limit)) return 20;
  return Math.min(Math.max(limit, 1), 100);
}

function createLoopMergeDecisionId(): string {
  return `mdec_${randomUUID().replaceAll("-", "").slice(0, 24)}`;
}
