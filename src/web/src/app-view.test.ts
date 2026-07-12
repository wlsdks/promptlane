import { describe, expect, it } from "vitest";

import { getQueueNavigation, getVisibleChrome } from "./app-view.js";

describe("app view model", () => {
  it("labels the visible page chrome from the current route", () => {
    expect(getVisibleChrome({ name: "list" })).toEqual({
      eyebrow: "Local prompt archive",
      title: "Prompt archive",
    });
    expect(getVisibleChrome({ name: "loops" })).toEqual({
      eyebrow: "Agent loop memory",
      title: "Loops",
    });
    expect(getVisibleChrome({ name: "actions" })).toEqual({
      eyebrow: "Operator-local outcomes and debt",
      title: "Actions",
    });
    expect(getVisibleChrome({ name: "mcp" })).toEqual({
      eyebrow: "Agent-native coach tools",
      title: "MCP tools",
    });
    expect(getVisibleChrome({ name: "dashboard" })).toEqual({
      eyebrow: "Local continuity and evidence layer",
      title: "Overview",
    });
    expect(getVisibleChrome({ name: "scores" })).toEqual({
      eyebrow: "Observed outcomes and coverage",
      title: "Evidence",
    });
    expect(getVisibleChrome({ name: "project", id: "proj_local123" })).toEqual({
      eyebrow: "Project continuity workspace",
      title: "Project workspace",
    });
  });

  it("derives detail queue navigation from visible prompts", () => {
    const prompts = [
      { id: "prompt-1" },
      { id: "prompt-2" },
      { id: "prompt-3" },
    ];

    expect(
      getQueueNavigation({ name: "detail", id: "prompt-2" }, prompts),
    ).toEqual({
      current: 2,
      next: { id: "prompt-3" },
      previous: { id: "prompt-1" },
      total: 3,
    });
  });

  it("omits queue navigation outside matching detail views", () => {
    const prompts = [{ id: "prompt-1" }];

    expect(getQueueNavigation({ name: "list" }, prompts)).toEqual({
      current: undefined,
      next: undefined,
      previous: undefined,
    });
    expect(
      getQueueNavigation({ name: "detail", id: "missing" }, prompts),
    ).toEqual({
      current: undefined,
      next: undefined,
      previous: undefined,
    });
  });
});
