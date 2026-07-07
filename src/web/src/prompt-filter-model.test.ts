import { describe, expect, it } from "vitest";

import {
  activeFilterChips,
  clearFilterPatch,
  emptyFilters,
} from "./prompt-filter-model.js";

describe("prompt filter model", () => {
  it("resets to an all-sensitivity empty filter", () => {
    expect(emptyFilters()).toEqual({ isSensitive: "all" });
  });

  it("clears sensitivity back to all while removing other filters", () => {
    expect(clearFilterPatch("isSensitive")).toEqual({ isSensitive: "all" });
    expect(clearFilterPatch("query")).toEqual({ query: undefined });
  });

  it("builds active chips without exposing raw local paths", () => {
    const chips = activeFilterChips({
      cwdPrefix: "/Users/example/private-project",
      focus: "quality-gap",
      isSensitive: "true",
      qualityGap: "output_format",
      query: "  loop brief  ",
      tag: "Needs verification",
      tool: "codex",
    });

    expect(chips).toContainEqual({
      key: "query",
      label: "Search",
      value: "loop brief",
    });
    expect(chips).toContainEqual({
      key: "cwdPrefix",
      label: "Path",
      value: "[local path]/private-project",
    });
    expect(JSON.stringify(chips)).not.toContain("/Users/example");
  });
});
