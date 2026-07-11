import { describe, expect, it } from "vitest";

import { recommendAgentStrategy } from "./recommendation.js";

describe("adaptive agent guide", () => {
  it("recommends a planning profile before implementation for an ambiguous request", () => {
    const guide = recommendAgentStrategy({
      taskType: "ambiguous_request",
      matchingRuns: [],
    });

    expect(guide).toMatchObject({
      role: "plan",
      primary: { tool: "codex", model: "gpt-5.6-sol" },
      alternative: { tool: "claude-code", model: "opus" },
      confidence: "low",
      switch_condition:
        "After the missing decision is explicit, switch to implementation.",
      privacy: {
        local_only: true,
        external_calls: false,
        auto_switches_model: false,
      },
    });
    expect(guide.reasons).toContain(
      "The request is ambiguous, so resolve the missing decision before implementation.",
    );
  });

  it("escalates repeated failed attempts ahead of a mechanical-task default", () => {
    const guide = recommendAgentStrategy({
      taskType: "mechanical",
      failedAttempts: 2,
      matchingRuns: [],
    });

    expect(guide.role).toBe("plan");
    expect(guide.primary.model).toBe("gpt-5.6-sol");
    expect(guide.reasons).toContain(
      "Two or more failed or blocked attempts need a higher-reasoning recovery pass.",
    );
  });

  it("uses fast-path profiles only for a narrow mechanical task", () => {
    const guide = recommendAgentStrategy({
      taskType: "mechanical",
      matchingRuns: [],
    });

    expect(guide).toMatchObject({
      role: "fast_path",
      primary: { tool: "codex", model: "gpt-5.6-luna" },
      alternative: { tool: "claude-code", model: "haiku" },
    });
  });

  it("reports evidence counts and raises confidence only after matching completed runs", () => {
    const guide = recommendAgentStrategy({
      taskType: "implementation",
      matchingRuns: [
        { outcomeStatus: "passed" },
        { outcomeStatus: "failed" },
        { outcomeStatus: "passed" },
      ],
    });

    expect(guide).toMatchObject({
      role: "implement",
      confidence: "medium",
      evidence: {
        completed_runs: 3,
        passing_runs: 2,
        non_passing_runs: 1,
      },
    });
  });
});
