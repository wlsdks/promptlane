import { describe, expect, it } from "vitest";

import {
  PROMPTLANE_MCP_TOOL_DEFINITIONS,
  PROMPTLANE_MCP_TOOL_REGISTRY,
  getPromptLaneMcpToolHandler,
  listPromptLaneMcpToolNames,
} from "./tool-registry.js";

describe("PromptLane MCP tool registry", () => {
  it("owns one unique handler for every listed tool definition", () => {
    const names = listPromptLaneMcpToolNames();

    expect(PROMPTLANE_MCP_TOOL_REGISTRY).toHaveLength(22);
    expect(PROMPTLANE_MCP_TOOL_DEFINITIONS).toHaveLength(22);
    expect(new Set(names).size).toBe(names.length);
    expect(names).toContain("get_paired_benchmark_candidates");
    for (const definition of PROMPTLANE_MCP_TOOL_DEFINITIONS) {
      expect(getPromptLaneMcpToolHandler(definition.name)).toEqual(
        expect.any(Function),
      );
    }
    expect(getPromptLaneMcpToolHandler("unknown_tool")).toBeUndefined();
  });
});
