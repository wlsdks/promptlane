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

  it("rejects unsupported model metadata before it can calibrate a guide", () => {
    const dataDir = join(tmpdir(), `looprelay-agent-runs-${randomUUID()}`);
    dirs.push(dataDir);
    const storage = createSqlitePromptStorage({
      dataDir,
      hmacSecret: "test-secret",
    });

    expect(() =>
      storage.recordAgentRun({
        project_id: "proj_test",
        tool: "codex",
        model: "unknown" as never,
        role: "implement",
        task_type: "implementation",
        outcome_status: "passed",
        accepted_recommendation: false,
        attempts: 1,
        focused_test_count: 0,
      }),
    ).toThrow("Agent run model must be a supported profile.");
    storage.close();
  });

  it("rejects malformed boolean and first-value metadata", () => {
    const dataDir = join(tmpdir(), `looprelay-agent-runs-${randomUUID()}`);
    dirs.push(dataDir);
    const storage = createSqlitePromptStorage({
      dataDir,
      hmacSecret: "test-secret",
    });
    const input = {
      project_id: "proj_test",
      tool: "codex" as const,
      model: "gpt-5.6-terra" as const,
      role: "implement" as const,
      task_type: "implementation" as const,
      outcome_status: "passed" as const,
      attempts: 1,
      focused_test_count: 0,
    };

    expect(() =>
      storage.recordAgentRun({
        ...input,
        accepted_recommendation: "true" as never,
      }),
    ).toThrow("Agent run accepted recommendation must be a boolean.");
    expect(() =>
      storage.recordAgentRun({
        ...input,
        accepted_recommendation: false,
        first_value_seconds: -1,
      }),
    ).toThrow(
      "Agent run first value seconds must be an integer of at least 0.",
    );
    storage.close();
  });
});
