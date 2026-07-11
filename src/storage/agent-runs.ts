import { randomUUID } from "node:crypto";
import type Database from "better-sqlite3";

import type {
  AgentGuideModel,
  AgentGuideRole,
  AgentGuideTaskType,
  AgentGuideTool,
} from "../agent-guide/recommendation.js";
import type { LoopOutcomeStatus } from "../loop/types.js";

export type AgentRun = {
  id: string;
  created_at: string;
  project_id: string;
  snapshot_id?: string;
  tool: AgentGuideTool;
  model: AgentGuideModel;
  role: AgentGuideRole;
  task_type: AgentGuideTaskType;
  outcome_status: LoopOutcomeStatus;
  accepted_recommendation: boolean;
  attempts: number;
  first_value_seconds?: number;
  focused_test_count: number;
};
export type RecordAgentRunInput = Omit<AgentRun, "id" | "created_at">;

export function applyAgentRunMigration(db: Database.Database): void {
  if (db.prepare("SELECT 1 FROM schema_migrations WHERE version = ?").get(20))
    return;
  db.exec(
    "CREATE TABLE IF NOT EXISTS agent_runs (id TEXT PRIMARY KEY, created_at TEXT NOT NULL, project_id TEXT NOT NULL, snapshot_id TEXT, tool TEXT NOT NULL, model TEXT NOT NULL, role TEXT NOT NULL, task_type TEXT NOT NULL, outcome_status TEXT NOT NULL, accepted_recommendation INTEGER NOT NULL, attempts INTEGER NOT NULL, first_value_seconds INTEGER, focused_test_count INTEGER NOT NULL, FOREIGN KEY(snapshot_id) REFERENCES loop_snapshots(id)); CREATE INDEX IF NOT EXISTS idx_agent_runs_project_task_created ON agent_runs(project_id, task_type, created_at DESC);",
  );
  db.prepare(
    "INSERT INTO schema_migrations(version, name, applied_at) VALUES (?, ?, ?)",
  ).run(20, "020_agent_runs", new Date().toISOString());
}

export function recordAgentRun(
  db: Database.Database,
  input: RecordAgentRunInput,
  now: Date,
): AgentRun {
  if (!Number.isInteger(input.attempts) || input.attempts < 1)
    throw new Error("Agent run attempts must be a positive integer.");
  if (
    !Number.isInteger(input.focused_test_count) ||
    input.focused_test_count < 0
  )
    throw new Error(
      "Agent run focused test count must be a non-negative integer.",
    );
  const run: AgentRun = {
    ...input,
    id: `arun_${randomUUID().replace(/-/g, "")}`,
    created_at: now.toISOString(),
  };
  db.prepare(
    "INSERT INTO agent_runs (id, created_at, project_id, snapshot_id, tool, model, role, task_type, outcome_status, accepted_recommendation, attempts, first_value_seconds, focused_test_count) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
  ).run(
    run.id,
    run.created_at,
    run.project_id,
    run.snapshot_id ?? null,
    run.tool,
    run.model,
    run.role,
    run.task_type,
    run.outcome_status,
    run.accepted_recommendation ? 1 : 0,
    run.attempts,
    run.first_value_seconds ?? null,
    run.focused_test_count,
  );
  return run;
}

export function listAgentRuns(
  db: Database.Database,
  input: { projectId: string; taskType?: AgentGuideTaskType; limit?: number },
): AgentRun[] {
  const rows = input.taskType
    ? db
        .prepare(
          "SELECT * FROM agent_runs WHERE project_id = ? AND task_type = ? ORDER BY created_at DESC LIMIT ?",
        )
        .all(input.projectId, input.taskType, input.limit ?? 50)
    : db
        .prepare(
          "SELECT * FROM agent_runs WHERE project_id = ? ORDER BY created_at DESC LIMIT ?",
        )
        .all(input.projectId, input.limit ?? 50);
  return rows.map((row) => ({
    ...(row as Omit<AgentRun, "snapshot_id" | "accepted_recommendation"> & {
      snapshot_id: string | null;
      accepted_recommendation: number;
    }),
    snapshot_id:
      (row as { snapshot_id: string | null }).snapshot_id ?? undefined,
    accepted_recommendation:
      (row as { accepted_recommendation: number }).accepted_recommendation ===
      1,
  }));
}
