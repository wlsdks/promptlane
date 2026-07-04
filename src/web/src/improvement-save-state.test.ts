import { describe, expect, it } from "vitest";

import { improvementSaveState } from "./improvement-save-state.js";

describe("improvementSaveState", () => {
  it("allows unsaved generated drafts to be saved", () => {
    expect(improvementSaveState("copy", false)).toEqual({
      disabled: false,
      label: "Save draft",
    });
  });

  it("shows generated drafts as saved after persistence succeeds", () => {
    expect(improvementSaveState("copy", true)).toEqual({
      disabled: false,
      label: "Saved",
    });
  });

  it("prevents reopened saved drafts from being saved again", () => {
    expect(improvementSaveState("saved-draft", false)).toEqual({
      disabled: true,
      label: "Already saved",
    });
  });
});
