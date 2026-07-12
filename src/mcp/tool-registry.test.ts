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

    expect(LOOPRELAY_MCP_TOOL_REGISTRY).toHaveLength(25);
    expect(LOOPRELAY_MCP_TOOL_DEFINITIONS).toHaveLength(25);
    expect(new Set(names).size).toBe(names.length);
    expect(names).toContain("get_paired_benchmark_candidates");
    expect(names).toContain("record_continuation_receipt");
    for (const definition of LOOPRELAY_MCP_TOOL_DEFINITIONS) {
      expect(getLoopRelayMcpToolHandler(definition.name)).toEqual(
        expect.any(Function),
      );
    }
    expect(getLoopRelayMcpToolHandler("unknown_tool")).toBeUndefined();
  });
});
