import { describe, expect, it } from "vitest";

import {
  recordAgentRunTool,
  recommendAgentStrategyTool,
} from "./agent-guide-tool.js";

describe("agent guide MCP tools", () => {
  it("classifies unsupported guide metadata as invalid input before opening storage", () => {
    const result = recordAgentRunTool({
      cwd: "/safe/project",
      task_type: "implementation",
      tool: "codex",
      model: "not-a-profile" as never,
      role: "implement",
      outcome_status: "passed",
    });

    expect(result).toEqual({
      is_error: true,
      error_code: "invalid_input",
      message: "Agent run model must be a supported profile.",
    });
  });

  it("does not mislabel an invalid recommendation task as a storage failure", () => {
    const result = recommendAgentStrategyTool({
      cwd: "/safe/project",
      task_type: "unknown" as never,
    });

    expect(result).toMatchObject({
      is_error: true,
      error_code: "invalid_input",
    });
  });

  it("rejects malformed raw-free metadata before it can reach local storage", () => {
    const record = recordAgentRunTool({
      cwd: "",
      task_type: "implementation",
      tool: "codex",
      model: "gpt-5.6-terra",
      role: "implement",
      outcome_status: "passed",
      attempts: 0,
      accepted_recommendation: "yes" as never,
    });
    const recommend = recommendAgentStrategyTool({
      cwd: "/safe/project",
      task_type: "implementation",
      failed_attempts: -1,
    });

    expect(record).toMatchObject({
      is_error: true,
      error_code: "invalid_input",
    });
    expect(recommend).toMatchObject({
      is_error: true,
      error_code: "invalid_input",
    });
  });
});
