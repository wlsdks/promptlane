import type Database from "better-sqlite3";

import {
  LoopOutcomeAttributionError,
  parseLoopOutcomeInput,
} from "../loop/outcome.js";
import type { LoopSnapshot } from "../loop/types.js";
import type { LoopOutcomeUpdate, LoopSnapshotListResult } from "./ports.js";
import {
  parseJsonValue,
  readNumberRecord,
  readStringArray,
} from "./sqlite-json.js";

export function createLoopSnapshot(
  db: Database.Database,
  input: LoopSnapshot,
): LoopSnapshot {
  db.prepare(
    `
    INSERT OR REPLACE INTO loop_snapshots (
      id,
      created_at,
      tool,
      source,
      session_id,
      thread_id,
      cwd_label,
      project_id,
      git_root_hash,
      branch,
      worktree_label,
      prompt_ids_json,
      event_counts_json,
      quality_json,
      outcome_json,
      next_brief_json,
      privacy_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
  ).run(
    input.id,
    input.created_at,
    input.tool,
    input.source,
    input.session_id ?? null,
    input.thread_id ?? null,
    input.cwd_label,
    input.project_id,
    input.git_root_hash ?? null,
    input.branch ?? null,
    input.worktree_label ?? null,
    JSON.stringify(input.prompt_ids),
    JSON.stringify(input.event_counts),
    JSON.stringify(input.quality),
    JSON.stringify(input.outcome),
    JSON.stringify(input.next_brief),
    JSON.stringify(input.privacy),
  );

  return input;
}

export function getLatestLoopSnapshot(
  db: Database.Database,
): LoopSnapshot | undefined {
  const row = db
    .prepare(
      "SELECT * FROM loop_snapshots ORDER BY created_at DESC, id DESC LIMIT 1",
    )
    .get() as LoopSnapshotRow | undefined;

  return row ? loopSnapshotFromRow(row) : undefined;
}

export function listLoopSnapshots(
  db: Database.Database,
  options: { limit?: number },
): LoopSnapshotListResult {
  const limit = normalizeLoopSnapshotLimit(options.limit);
  const rows = db
    .prepare(
      "SELECT * FROM loop_snapshots ORDER BY created_at DESC, id DESC LIMIT ?",
    )
    .all(limit) as LoopSnapshotRow[];

  return { items: rows.map(loopSnapshotFromRow) };
}

export function recordLoopOutcome(
  db: Database.Database,
  snapshotId: string,
  outcome: LoopOutcomeUpdate,
): LoopSnapshot | undefined {
  const parsed = parseLoopOutcomeInput({
    status: outcome.status,
    summary: outcome.summary,
    evidenceRefs: outcome.evidence_refs,
    usedImprovementPromptIds: outcome.used_improvement_prompt_ids,
  });
  if (!parsed.ok) {
    throw new Error(parsed.message);
  }

  const existing = db
    .prepare("SELECT prompt_ids_json FROM loop_snapshots WHERE id = ?")
    .get(snapshotId) as { prompt_ids_json: string } | undefined;
  if (!existing) return undefined;

  const allowedPromptIds = new Set(readStringArray(existing.prompt_ids_json));
  if (
    parsed.outcome.used_improvement_prompt_ids?.some(
      (promptId) => !allowedPromptIds.has(promptId),
    )
  ) {
    throw new LoopOutcomeAttributionError();
  }

  db.prepare("UPDATE loop_snapshots SET outcome_json = ? WHERE id = ?").run(
    JSON.stringify(parsed.outcome),
    snapshotId,
  );

  const row = db
    .prepare("SELECT * FROM loop_snapshots WHERE id = ?")
    .get(snapshotId) as LoopSnapshotRow | undefined;

  return row ? loopSnapshotFromRow(row) : undefined;
}

type LoopSnapshotRow = {
  id: string;
  created_at: string;
  tool: LoopSnapshot["tool"];
  source: LoopSnapshot["source"];
  session_id: string | null;
  thread_id: string | null;
  cwd_label: string;
  project_id: string;
  git_root_hash: string | null;
  branch: string | null;
  worktree_label: string | null;
  prompt_ids_json: string;
  event_counts_json: string;
  quality_json: string;
  outcome_json: string;
  next_brief_json: string;
  privacy_json: string;
};

function loopSnapshotFromRow(row: LoopSnapshotRow): LoopSnapshot {
  return {
    id: row.id,
    created_at: row.created_at,
    tool: row.tool,
    source: row.source,
    session_id: row.session_id ?? undefined,
    thread_id: row.thread_id ?? undefined,
    cwd_label: row.cwd_label,
    project_id: row.project_id,
    git_root_hash: row.git_root_hash ?? undefined,
    branch: row.branch ?? undefined,
    worktree_label: row.worktree_label ?? undefined,
    prompt_ids: readStringArray(row.prompt_ids_json),
    event_counts: readEventCounts(row.event_counts_json),
    quality: readQuality(row.quality_json),
    outcome: readOutcome(row.outcome_json),
    next_brief: readNextBrief(row.next_brief_json),
    privacy: loopSnapshotPrivacy(),
  };
}

function readEventCounts(value: string): LoopSnapshot["event_counts"] {
  const counts = readNumberRecord(value);
  return {
    prompts: counts.prompts ?? 0,
    ...(counts.tool_calls === undefined
      ? {}
      : { tool_calls: counts.tool_calls }),
    ...(counts.files_changed === undefined
      ? {}
      : { files_changed: counts.files_changed }),
    ...(counts.tests_run === undefined ? {} : { tests_run: counts.tests_run }),
    ...(counts.errors === undefined ? {} : { errors: counts.errors }),
  };
}

function readQuality(value: string): LoopSnapshot["quality"] {
  const record = readRecord(value);
  return {
    ...(typeof record.average_prompt_score === "number"
      ? { average_prompt_score: record.average_prompt_score }
      : {}),
    top_gaps: readStringArrayFromRecord(record.top_gaps),
    unresolved_questions: readStringArrayFromRecord(
      record.unresolved_questions,
    ),
  };
}

function readOutcome(value: string): LoopSnapshot["outcome"] {
  const record = readRecord(value);
  const status = isOutcomeStatus(record.status) ? record.status : "unknown";
  return {
    status,
    summary: typeof record.summary === "string" ? record.summary : "",
    evidence_refs: readStringArrayFromRecord(record.evidence_refs),
    ...(Array.isArray(record.used_improvement_prompt_ids)
      ? {
          used_improvement_prompt_ids: readStringArrayFromRecord(
            record.used_improvement_prompt_ids,
          ),
        }
      : {}),
  };
}

function readNextBrief(value: string): LoopSnapshot["next_brief"] {
  const record = readRecord(value);
  return {
    generated: record.generated === true,
    ...(typeof record.prompt_id === "string"
      ? { prompt_id: record.prompt_id }
      : {}),
    summary: typeof record.summary === "string" ? record.summary : "",
  };
}

function readRecord(value: string): Record<string, unknown> {
  const parsed = parseJsonValue(value);
  return parsed && typeof parsed === "object" && !Array.isArray(parsed)
    ? (parsed as Record<string, unknown>)
    : {};
}

function readStringArrayFromRecord(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function isOutcomeStatus(
  value: unknown,
): value is LoopSnapshot["outcome"]["status"] {
  return [
    "unknown",
    "in_progress",
    "passed",
    "failed",
    "blocked",
    "abandoned",
  ].includes(value as string);
}

function loopSnapshotPrivacy(): LoopSnapshot["privacy"] {
  return {
    local_only: true,
    stores_prompt_bodies: false,
    stores_raw_paths: false,
  };
}

function normalizeLoopSnapshotLimit(limit: number | undefined): number {
  if (!limit || !Number.isInteger(limit)) {
    return 20;
  }

  return Math.min(Math.max(limit, 1), 100);
}
