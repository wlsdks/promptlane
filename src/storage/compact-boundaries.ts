import { createHmac, randomUUID } from "node:crypto";
import type Database from "better-sqlite3";

import { createProjectKey } from "./project-id.js";
import { projectLabel } from "./project-label.js";

export type CompactBoundaryTool = "claude-code" | "codex";
export type CompactBoundaryEventName = "PreCompact" | "PostCompact";
export type CompactBoundaryTrigger = "manual" | "auto" | "unknown";

export type CompactBoundary = {
  id: string;
  created_at: string;
  tool: CompactBoundaryTool;
  event_name: CompactBoundaryEventName;
  trigger: CompactBoundaryTrigger;
  session_id?: string;
  turn_id?: string;
  cwd_label: string;
  project_id: string;
  content_hash?: string;
  privacy: {
    local_only: true;
    stores_prompt_bodies: false;
    stores_raw_paths: false;
    stores_compact_content: false;
  };
};

export type RecordCompactBoundaryInput = {
  tool: CompactBoundaryTool;
  event_name: CompactBoundaryEventName;
  trigger?: string;
  session_id?: string;
  turn_id?: string;
  cwd: string;
  content?: string;
};

export type CompactBoundaryListResult = {
  items: CompactBoundary[];
};

export function applyCompactBoundaryMigration(db: Database.Database): void {
  const applied = db
    .prepare("SELECT 1 FROM schema_migrations WHERE version = ?")
    .get(17);
  if (applied) return;

  db.exec(`
    CREATE TABLE IF NOT EXISTS compact_boundaries (
      id TEXT PRIMARY KEY,
      created_at TEXT NOT NULL,
      tool TEXT NOT NULL,
      event_name TEXT NOT NULL,
      trigger TEXT NOT NULL,
      session_id TEXT,
      turn_id TEXT,
      cwd_label TEXT NOT NULL,
      project_id TEXT NOT NULL,
      content_hash TEXT,
      privacy_json TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_compact_boundaries_created_at
      ON compact_boundaries(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_compact_boundaries_project_created
      ON compact_boundaries(project_id, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_compact_boundaries_session_created
      ON compact_boundaries(session_id, created_at DESC);
  `);

  db.prepare(
    "INSERT INTO schema_migrations(version, name, applied_at) VALUES (?, ?, ?)",
  ).run(17, "017_compact_boundaries", new Date().toISOString());
}

export function recordCompactBoundary(
  db: Database.Database,
  input: RecordCompactBoundaryInput,
  options: { hmacSecret: string; now: Date },
): CompactBoundary {
  const boundary: CompactBoundary = {
    id: createCompactBoundaryId(),
    created_at: options.now.toISOString(),
    tool: input.tool,
    event_name: input.event_name,
    trigger: normalizeTrigger(input.trigger),
    session_id: input.session_id,
    turn_id: input.turn_id,
    cwd_label: projectLabel(input.cwd),
    project_id: createProjectKey(input.cwd, options.hmacSecret),
    content_hash: input.content
      ? hashCompactContent(input.content, options.hmacSecret)
      : undefined,
    privacy: compactBoundaryPrivacy(),
  };

  db.prepare(
    `
    INSERT INTO compact_boundaries (
      id,
      created_at,
      tool,
      event_name,
      trigger,
      session_id,
      turn_id,
      cwd_label,
      project_id,
      content_hash,
      privacy_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
  ).run(
    boundary.id,
    boundary.created_at,
    boundary.tool,
    boundary.event_name,
    boundary.trigger,
    boundary.session_id ?? null,
    boundary.turn_id ?? null,
    boundary.cwd_label,
    boundary.project_id,
    boundary.content_hash ?? null,
    JSON.stringify(boundary.privacy),
  );

  return boundary;
}

export function listCompactBoundaries(
  db: Database.Database,
  options: { limit?: number },
): CompactBoundaryListResult {
  const rows = db
    .prepare(
      "SELECT * FROM compact_boundaries ORDER BY created_at DESC, id DESC LIMIT ?",
    )
    .all(normalizeLimit(options.limit)) as CompactBoundaryRow[];

  return { items: rows.map(compactBoundaryFromRow) };
}

type CompactBoundaryRow = {
  id: string;
  created_at: string;
  tool: CompactBoundaryTool;
  event_name: CompactBoundaryEventName;
  trigger: CompactBoundaryTrigger;
  session_id: string | null;
  turn_id: string | null;
  cwd_label: string;
  project_id: string;
  content_hash: string | null;
  privacy_json: string;
};

function compactBoundaryFromRow(row: CompactBoundaryRow): CompactBoundary {
  return {
    id: row.id,
    created_at: row.created_at,
    tool: row.tool,
    event_name: row.event_name,
    trigger: row.trigger,
    session_id: row.session_id ?? undefined,
    turn_id: row.turn_id ?? undefined,
    cwd_label: row.cwd_label,
    project_id: row.project_id,
    content_hash: row.content_hash ?? undefined,
    privacy: compactBoundaryPrivacy(),
  };
}

function compactBoundaryPrivacy(): CompactBoundary["privacy"] {
  return {
    local_only: true,
    stores_prompt_bodies: false,
    stores_raw_paths: false,
    stores_compact_content: false,
  };
}

function normalizeTrigger(value: string | undefined): CompactBoundaryTrigger {
  return value === "manual" || value === "auto" ? value : "unknown";
}

function normalizeLimit(limit: number | undefined): number {
  if (!limit || !Number.isInteger(limit)) return 20;
  return Math.min(Math.max(limit, 1), 100);
}

function hashCompactContent(content: string, hmacSecret: string): string {
  return `compact_${createHmac("sha256", hmacSecret)
    .update(content)
    .digest("hex")
    .slice(0, 16)}`;
}

function createCompactBoundaryId(): string {
  return `cmp_${randomUUID().replaceAll("-", "").slice(0, 24)}`;
}
