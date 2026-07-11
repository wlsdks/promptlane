import { randomUUID } from "node:crypto";
import { rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import { createSqlitePromptStorage } from "./sqlite.js";

const dirs: string[] = [];
afterEach(() =>
  dirs
    .splice(0)
    .forEach((dir) => rmSync(dir, { recursive: true, force: true })),
);

describe("agent run storage", () => {
  it("persists only declared raw-free run metadata and filters by task type", () => {
    const dataDir = join(tmpdir(), `looprelay-agent-runs-${randomUUID()}`);
    dirs.push(dataDir);
    const storage = createSqlitePromptStorage({
      dataDir,
      hmacSecret: "test-secret",
      now: () => new Date("2026-07-11T00:00:00.000Z"),
    });
    const recorded = storage.recordAgentRun({
      project_id: "proj_test",
      tool: "codex",
      model: "gpt-5.6-terra",
      role: "implement",
      task_type: "implementation",
      outcome_status: "passed",
      accepted_recommendation: true,
      attempts: 1,
      first_value_seconds: 12,
      focused_test_count: 3,
    });

    expect(recorded.id).toMatch(/^arun_/);
    expect(
      storage.listAgentRuns({
        projectId: "proj_test",
        taskType: "implementation",
      }),
    ).toEqual([recorded]);
    expect(storage.getAppliedMigrations()).toContainEqual({
      version: 20,
      name: "020_agent_runs",
    });
    storage.close();
  });
});
