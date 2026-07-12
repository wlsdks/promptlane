import { randomUUID } from "node:crypto";
import type Database from "better-sqlite3";

import {
  failureEpisodePrivacy,
  parseFailureEpisodeInput,
  type FailureEpisode,
  type FailureEpisodePatternCounts,
  type FailureEpisodeCategory,
  type FailureEpisodeStatus,
  type RecordFailureEpisodeInput,
} from "../loop/failure-episode.js";

export function applyFailureEpisodeMigration(db: Database.Database): void {
  if (db.prepare("SELECT 1 FROM schema_migrations WHERE version = ?").get(22))
    return;
  db.exec(`
    CREATE TABLE IF NOT EXISTS loop_failure_episodes (
      id TEXT PRIMARY KEY,
      snapshot_id TEXT NOT NULL UNIQUE,
      project_id TEXT NOT NULL,
      category TEXT NOT NULL,
      status TEXT NOT NULL,
      intervention TEXT NOT NULL,
      resolution TEXT,
      confirmed_by TEXT NOT NULL,
      confirmed_at TEXT NOT NULL,
      resolved_at TEXT,
      privacy_json TEXT NOT NULL,
      FOREIGN KEY(snapshot_id) REFERENCES loop_snapshots(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_failure_episodes_project_confirmed
      ON loop_failure_episodes(project_id, confirmed_at DESC);
    CREATE INDEX IF NOT EXISTS idx_failure_episodes_status_confirmed
      ON loop_failure_episodes(status, confirmed_at DESC);
  `);
  db.prepare(
    "INSERT INTO schema_migrations(version, name, applied_at) VALUES (?, ?, ?)",
  ).run(22, "022_failure_episodes", new Date().toISOString());
}

export function recordFailureEpisode(
  db: Database.Database,
  rawInput: RecordFailureEpisodeInput,
  now: Date,
): FailureEpisode {
  const parsed = parseFailureEpisodeInput(rawInput);
  if (!parsed.ok) throw new Error(parsed.message);
  const input = parsed.input;
  const snapshot = db
    .prepare(
      "SELECT project_id, json_extract(outcome_json, '$.status') AS outcome_status FROM loop_snapshots WHERE id = ?",
    )
    .get(input.snapshot_id) as SnapshotFailureRow | undefined;
  if (!snapshot) throw new Error("Failure episode snapshot not found.");
  if (!["failed", "blocked"].includes(snapshot.outcome_status)) {
    throw new Error("Failure episodes require a failed or blocked snapshot.");
  }
  const existing = getFailureEpisodeBySnapshot(db, input.snapshot_id);
  const timestamp = now.toISOString();
  const episode: FailureEpisode = {
    id: existing?.id ?? `fail_${randomUUID().replaceAll("-", "").slice(0, 24)}`,
    snapshot_id: input.snapshot_id,
    project_id: snapshot.project_id,
    category: input.category,
    status: input.status,
    intervention: input.intervention,
    ...(input.resolution ? { resolution: input.resolution } : {}),
    confirmed_by: input.confirmed_by,
    confirmed_at: existing?.confirmed_at ?? timestamp,
    ...(input.status === "resolved" ? { resolved_at: timestamp } : {}),
    privacy: failureEpisodePrivacy(),
  };
  db.prepare(
    `INSERT INTO loop_failure_episodes
      (id, snapshot_id, project_id, category, status, intervention, resolution,
       confirmed_by, confirmed_at, resolved_at, privacy_json)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(snapshot_id) DO UPDATE SET
       category = excluded.category,
       status = excluded.status,
       intervention = excluded.intervention,
       resolution = excluded.resolution,
       confirmed_by = excluded.confirmed_by,
       resolved_at = excluded.resolved_at,
       privacy_json = excluded.privacy_json`,
  ).run(
    episode.id,
    episode.snapshot_id,
    episode.project_id,
    episode.category,
    episode.status,
    episode.intervention,
    episode.resolution ?? null,
    episode.confirmed_by,
    episode.confirmed_at,
    episode.resolved_at ?? null,
    JSON.stringify(episode.privacy),
  );
  return episode;
}

export function listFailureEpisodes(
  db: Database.Database,
  options: {
    projectId?: string;
    status?: FailureEpisodeStatus;
    limit?: number;
  } = {},
): FailureEpisode[] {
  const clauses: string[] = [];
  const params: Array<string | number> = [];
  if (options.projectId) {
    clauses.push("project_id = ?");
    params.push(options.projectId);
  }
  if (options.status) {
    clauses.push("status = ?");
    params.push(options.status);
  }
  const where = clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "";
  const limit = Math.min(Math.max(options.limit ?? 50, 1), 100);
  const rows = db
    .prepare(
      `SELECT * FROM loop_failure_episodes ${where}
       ORDER BY confirmed_at DESC, id DESC LIMIT ?`,
    )
    .all(...params, limit) as FailureEpisodeRow[];
  return rows.map(failureEpisodeFromRow);
}

export function getFailureEpisodePatternCounts(
  db: Database.Database,
  options: { projectId?: string } = {},
): FailureEpisodePatternCounts[] {
  const clauses: string[] = [];
  const params: string[] = [];
  if (options.projectId) {
    clauses.push("episodes.project_id = ?");
    params.push(options.projectId);
  }
  const where = clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "";
  const rows = db
    .prepare(
      `SELECT episodes.category,
        COUNT(*) AS total,
        COUNT(DISTINCT NULLIF(snapshots.session_id, '')) AS session_count,
        SUM(CASE WHEN episodes.status = 'open' THEN 1 ELSE 0 END) AS open,
        SUM(CASE WHEN episodes.status = 'resolved' THEN 1 ELSE 0 END) AS resolved,
        SUM(CASE WHEN episodes.status = 'wont_fix' THEN 1 ELSE 0 END) AS wont_fix,
        MAX(episodes.confirmed_at) AS last_confirmed_at
       FROM loop_failure_episodes AS episodes
       INNER JOIN loop_snapshots AS snapshots ON snapshots.id = episodes.snapshot_id
       ${where}
       GROUP BY episodes.category
       ORDER BY total DESC, last_confirmed_at DESC, episodes.category ASC`,
    )
    .all(...params) as FailureEpisodePatternCounts[];
  return rows;
}

function getFailureEpisodeBySnapshot(
  db: Database.Database,
  snapshotId: string,
): FailureEpisode | undefined {
  const row = db
    .prepare("SELECT * FROM loop_failure_episodes WHERE snapshot_id = ?")
    .get(snapshotId) as FailureEpisodeRow | undefined;
  return row ? failureEpisodeFromRow(row) : undefined;
}

type SnapshotFailureRow = { project_id: string; outcome_status: string };
type FailureEpisodeRow = {
  id: string;
  snapshot_id: string;
  project_id: string;
  category: FailureEpisodeCategory;
  status: FailureEpisodeStatus;
  intervention: string;
  resolution: string | null;
  confirmed_by: string;
  confirmed_at: string;
  resolved_at: string | null;
};

function failureEpisodeFromRow(row: FailureEpisodeRow): FailureEpisode {
  return {
    id: row.id,
    snapshot_id: row.snapshot_id,
    project_id: row.project_id,
    category: row.category,
    status: row.status,
    intervention: row.intervention,
    ...(row.resolution ? { resolution: row.resolution } : {}),
    confirmed_by: row.confirmed_by,
    confirmed_at: row.confirmed_at,
    ...(row.resolved_at ? { resolved_at: row.resolved_at } : {}),
    privacy: failureEpisodePrivacy(),
  };
}
