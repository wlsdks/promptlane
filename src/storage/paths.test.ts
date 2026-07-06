import { describe, expect, it } from "vitest";

import { resolveHomePath, safeResolveUnderRoot } from "./paths.js";

describe("path helpers", () => {
  it("resolves home-relative paths", () => {
    expect(resolveHomePath("~/.promptlane", "/Users/example")).toBe(
      "/Users/example/.promptlane",
    );
  });

  it("rejects traversal outside the root", () => {
    expect(() => safeResolveUnderRoot("/tmp/root", "../outside")).toThrow(
      /escapes root/,
    );
  });

  it("resolves safe child paths", () => {
    expect(safeResolveUnderRoot("/tmp/root", "prompts/one.md")).toBe(
      "/tmp/root/prompts/one.md",
    );
  });
});
