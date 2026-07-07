import { describe, expect, it } from "vitest";

import { selectPromptIds, togglePromptSelection } from "./prompt-selection.js";

describe("prompt selection", () => {
  it("toggles one prompt id without mutating the current selection", () => {
    const current = new Set(["prompt-1"]);
    const removed = togglePromptSelection(current, "prompt-1");
    const added = togglePromptSelection(current, "prompt-2");

    expect([...current]).toEqual(["prompt-1"]);
    expect([...removed]).toEqual([]);
    expect([...added].sort()).toEqual(["prompt-1", "prompt-2"]);
  });

  it("selects the visible prompt ids", () => {
    expect(selectPromptIds([{ id: "prompt-1" }, { id: "prompt-2" }])).toEqual(
      new Set(["prompt-1", "prompt-2"]),
    );
  });
});
