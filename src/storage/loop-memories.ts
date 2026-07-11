import { randomUUID } from "node:crypto";
import type Database from "better-sqlite3";

import { readStringArray } from "./sqlite-json.js";

export type LoopMemory = {
  id: string;
  snapshot_id: string;
  title: string;
  statement: string;
  evidence_refs: string[];
  approved_by: string;
  created_at: string;
  privacy: {
    local_only: true;
    stores_prompt_bodies: false;
    stores_raw_paths: false;
    writes_instruction_files: false;
    external_calls: false;
  };
};

export type RecordLoopMemoryInput = {
  snapshot_id: string;
  title: string;
  statement: string;
  evidence_refs: string[];
  approved_by: string;
};

export type LoopMemoryListResult = {
  items: LoopMemory[];
};

export function applyLoopMemoryMigration(db: Database.Database): void {
  const applied = db
    .prepare("SELECT 1 FROM schema_migrations WHERE version = ?")
    .get(18);
  if (applied) return;

  db.exec(`
    CREATE TABLE IF NOT EXISTS loop_memories (
      id TEXT PRIMARY KEY,
      snapshot_id TEXT NOT NULL,
      title TEXT NOT NULL,
      statement TEXT NOT NULL,
      evidence_refs_json TEXT NOT NULL,
      approved_by TEXT NOT NULL,
      created_at TEXT NOT NULL,
      privacy_json TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_loop_memories_created_at
      ON loop_memories(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_loop_memories_snapshot_created
      ON loop_memories(snapshot_id, created_at DESC);
  `);

  db.prepare(
    "INSERT INTO schema_migrations(version, name, applied_at) VALUES (?, ?, ?)",
  ).run(18, "018_loop_memories", new Date().toISOString());
}

export function recordLoopMemory(
  db: Database.Database,
  input: RecordLoopMemoryInput,
  now: Date,
): LoopMemory {
  const statement = input.statement.trim();
  if (!statement) {
    throw new Error("Loop memory statement must not be empty.");
  }
  if (looksUnsafe(statement)) {
    throw new Error(
      "Loop memory statement must not include raw paths or secrets.",
    );
  }
  const evidenceRefs = input.evidence_refs
    .map((ref) => ref.trim())
    .filter(Boolean);
  if (evidenceRefs.length === 0) {
    throw new Error("Loop memory evidence refs must not be empty.");
  }
  if (evidenceRefs.some(looksUnsafe)) {
    throw new Error(
      "Loop memory evidence refs must not include raw paths or secrets.",
    );
  }

  const memory: LoopMemory = {
    id: createLoopMemoryId(),
    snapshot_id: input.snapshot_id,
    title: input.title.trim() || "Loop memory",
    statement,
    evidence_refs: evidenceRefs,
    approved_by: input.approved_by.trim() || "user",
    created_at: now.toISOString(),
    privacy: loopMemoryPrivacy(),
  };

  db.prepare(
    `
    INSERT INTO loop_memories (
      id,
      snapshot_id,
      title,
      statement,
      evidence_refs_json,
      approved_by,
      created_at,
      privacy_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
  ).run(
    memory.id,
    memory.snapshot_id,
    memory.title,
    memory.statement,
    JSON.stringify(memory.evidence_refs),
    memory.approved_by,
    memory.created_at,
    JSON.stringify(memory.privacy),
  );

  return memory;
}

export function listLoopMemories(
  db: Database.Database,
  options: { limit?: number; projectId?: string },
): LoopMemoryListResult {
  const limit = normalizeLimit(options.limit);
  if (options.projectId) {
    const rows = db
      .prepare(
        `
        SELECT loop_memories.*
        FROM loop_memories
        INNER JOIN loop_snapshots
          ON loop_snapshots.id = loop_memories.snapshot_id
        WHERE loop_snapshots.project_id = ?
        ORDER BY loop_memories.created_at DESC, loop_memories.id DESC
        LIMIT ?
        `,
      )
      .all(options.projectId, limit) as LoopMemoryRow[];

    return { items: rows.map(loopMemoryFromRow) };
  }

  const rows = db
    .prepare(
      "SELECT * FROM loop_memories ORDER BY created_at DESC, id DESC LIMIT ?",
    )
    .all(limit) as LoopMemoryRow[];

  return { items: rows.map(loopMemoryFromRow) };
}

type LoopMemoryRow = {
  id: string;
  snapshot_id: string;
  title: string;
  statement: string;
  evidence_refs_json: string;
  approved_by: string;
  created_at: string;
  privacy_json: string;
};

function loopMemoryFromRow(row: LoopMemoryRow): LoopMemory {
  return {
    id: row.id,
    snapshot_id: row.snapshot_id,
    title: row.title,
    statement: row.statement,
    evidence_refs: readStringArray(row.evidence_refs_json),
    approved_by: row.approved_by,
    created_at: row.created_at,
    privacy: loopMemoryPrivacy(),
  };
}

function loopMemoryPrivacy(): LoopMemory["privacy"] {
  return {
    local_only: true,
    stores_prompt_bodies: false,
    stores_raw_paths: false,
    writes_instruction_files: false,
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

function createLoopMemoryId(): string {
  return `mem_${randomUUID().replaceAll("-", "").slice(0, 24)}`;
}
