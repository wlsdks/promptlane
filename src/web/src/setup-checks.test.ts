import { describe, expect, it } from "vitest";

import type { QualityDashboard, SettingsResponse } from "./api.js";
import { buildSetupChecks } from "./setup-checks.js";

describe("setup checks", () => {
  it("keeps a first-run workspace pointed at setup and one real prompt", () => {
    const checks = buildSetupChecks({});

    expect(checks.map((check) => [check.label, check.status])).toEqual([
      ["Local server", "pending"],
      ["Local storage", "pending"],
      ["Redaction", "pending"],
      ["Hook Capture", "pending"],
      ["First prompt stored", "pending"],
      ["Reuse loop", "pending"],
    ]);
    expect(
      checks.find((check) => check.label === "Hook Capture"),
    ).toMatchObject({
      detail:
        "Run promptlane setup --profile coach, then send one Codex or Claude Code prompt.",
    });
    expect(
      checks.find((check) => check.label === "First prompt stored"),
    ).toMatchObject({
      detail: "Send one Codex or Claude Code prompt after setup.",
    });
  });

  it("summarizes ready local setup without exposing the raw data directory", () => {
    const checks = buildSetupChecks({
      dashboard: dashboardFixture({
        total_prompts: 3,
        useful_prompts: [
          {
            bookmarked: false,
            copied_count: 1,
            cwd: "/Users/example/private-project",
            id: "prompt-1",
            quality_gaps: [],
            received_at: "2026-07-08T00:00:00.000Z",
            tags: [],
            tool: "codex",
          },
        ],
      }),
      health: { ok: true, version: "1.2.3" },
      settings: settingsFixture({
        data_dir: "/Users/example/.promptlane",
        last_ingest_status: {
          checked_at: "2026-07-08T00:00:00.000Z",
          ok: true,
          status: 200,
        },
        redaction_mode: "mask",
      }),
    });

    expect(checks.find((check) => check.label === "Local server")).toEqual({
      detail: "version 1.2.3",
      label: "Local server",
      status: "good",
    });
    expect(checks.find((check) => check.label === "Local storage")).toEqual({
      detail: "[local path]/.promptlane",
      label: "Local storage",
      status: "good",
    });
    expect(JSON.stringify(checks)).not.toContain("/Users/example");
    expect(checks.find((check) => check.label === "Reuse loop")).toMatchObject({
      detail: "1 reuse candidates",
      status: "good",
    });
  });

  it("marks raw redaction and failed hook delivery as needing attention", () => {
    const checks = buildSetupChecks({
      settings: settingsFixture({
        last_ingest_status: {
          checked_at: "2026-07-08T00:00:00.000Z",
          ok: false,
          status: 500,
        },
        redaction_mode: "raw",
      }),
    });

    expect(checks.find((check) => check.label === "Redaction")).toMatchObject({
      detail: "raw mode",
      status: "attention",
    });
    expect(
      checks.find((check) => check.label === "Hook Capture"),
    ).toMatchObject({
      detail: "last delivery failed 500",
      status: "attention",
    });
  });
});

function dashboardFixture(
  overrides: Partial<QualityDashboard> = {},
): QualityDashboard {
  return {
    distribution: { by_project: [], by_tool: [] },
    duplicate_prompt_groups: [],
    instruction_suggestions: [],
    missing_items: [],
    patterns: [],
    project_profiles: [],
    quality_score: {
      average: 0,
      band: "weak",
      max: 100,
      scored_prompts: 0,
    },
    recent: { last_7_days: 0, last_30_days: 0 },
    sensitive_prompts: 0,
    sensitive_ratio: 0,
    total_prompts: 0,
    trend: { daily: [] },
    useful_prompts: [],
    ...overrides,
  };
}

function settingsFixture(
  overrides: Partial<SettingsResponse> = {},
): SettingsResponse {
  return {
    data_dir: "",
    excluded_project_roots: [],
    redaction_mode: "",
    server: { host: "127.0.0.1", port: 17373 },
    ...overrides,
  };
}
