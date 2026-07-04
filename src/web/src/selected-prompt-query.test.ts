import { describe, expect, it } from "vitest";

import {
  getSelectedPromptQuery,
  shouldClearSelectedPrompt,
} from "./selected-prompt-query.js";

describe("selected prompt query", () => {
  it("requests a prompt only for detail views", () => {
    expect(getSelectedPromptQuery({ name: "detail", id: "prmt_123" })).toEqual({
      id: "prmt_123",
    });
    expect(getSelectedPromptQuery({ name: "list" })).toBeUndefined();
    expect(getSelectedPromptQuery({ name: "dashboard" })).toBeUndefined();
  });

  it("clears the selected prompt when leaving detail views", () => {
    expect(shouldClearSelectedPrompt({ name: "list" })).toBe(true);
    expect(shouldClearSelectedPrompt({ name: "detail", id: "prmt_123" })).toBe(
      false,
    );
  });
});
