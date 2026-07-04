import { describe, expect, it } from "vitest";

import { storageUnavailableMessage } from "./storage-unavailable.js";

describe("storageUnavailableMessage", () => {
  it("returns one raw-free MCP storage setup message", () => {
    const error = Object.assign(
      new Error(
        "ENOENT: no such file or directory, open '/Users/example/private/prompt-coach.sqlite'",
      ),
      { code: "ENOENT" },
    );

    const message = storageUnavailableMessage(error);

    expect(message).toBe(
      "Local Loopdeck archive is not available. Run `prompt-coach init` first or pass --data-dir. Reason: ENOENT.",
    );
    expect(message).not.toContain("/Users/example");
    expect(message).not.toContain("prompt-coach.sqlite");
  });

  it("does not include arbitrary error messages without a stable code", () => {
    const message = storageUnavailableMessage(
      new Error("open /tmp/private/archive.sqlite failed"),
    );

    expect(message).toBe(
      "Local Loopdeck archive is not available. Run `prompt-coach init` first or pass --data-dir.",
    );
    expect(message).not.toContain("/tmp/private");
  });
});
