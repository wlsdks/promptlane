import { describe, expect, it } from "vitest";

import {
  LOOPRELAY_MCP_TOOL_DEFINITIONS,
  LOOPRELAY_MCP_TOOL_REGISTRY,
  getLoopRelayMcpToolHandler,
  listLoopRelayMcpToolNames,
} from "./tool-registry.js";

describe("LoopRelay MCP tool registry", () => {
  it("owns one unique handler for every listed tool definition", () => {
    const names = listLoopRelayMcpToolNames();

    expect(LOOPRELAY_MCP_TOOL_REGISTRY).toHaveLength(24);
    expect(LOOPRELAY_MCP_TOOL_DEFINITIONS).toHaveLength(24);
    expect(new Set(names).size).toBe(names.length);
    expect(names).toContain("get_paired_benchmark_candidates");
    for (const definition of LOOPRELAY_MCP_TOOL_DEFINITIONS) {
      expect(getLoopRelayMcpToolHandler(definition.name)).toEqual(
        expect.any(Function),
      );
    }
    expect(getLoopRelayMcpToolHandler("unknown_tool")).toBeUndefined();
  });
});
