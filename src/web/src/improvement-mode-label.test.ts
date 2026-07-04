import { describe, expect, it } from "vitest";

import { improvementModeLabel } from "./improvement-mode-label.js";

describe("improvementModeLabel", () => {
  it("keeps generated copy drafts concise", () => {
    expect(improvementModeLabel("copy")).toBe("Copy draft");
  });

  it("does not expose the saved-draft enum as user-facing copy", () => {
    expect(improvementModeLabel("saved-draft")).toBe("Saved draft");
    expect(improvementModeLabel("saved-draft")).not.toBe("saved-draft");
  });
});
