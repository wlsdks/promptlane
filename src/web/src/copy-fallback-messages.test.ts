import { describe, expect, it } from "vitest";

import { copyFailureMessage } from "./copy-fallback-messages.js";

describe("copyFailureMessage", () => {
  it("distinguishes current improvement and saved draft copy failures", () => {
    expect(copyFailureMessage("improvement")).toBe(
      "Could not copy the improvement draft.",
    );
    expect(copyFailureMessage("saved-draft")).toBe(
      "Could not copy the saved draft.",
    );
  });
});
