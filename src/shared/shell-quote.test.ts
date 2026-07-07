import { describe, expect, it } from "vitest";

import { quoteForShell } from "./shell-quote.js";

describe("quoteForShell", () => {
  it("leaves shell-safe command arguments unquoted", () => {
    expect(quoteForShell("feature/branch-filter")).toBe(
      "feature/branch-filter",
    );
    expect(quoteForShell("promptlane")).toBe("promptlane");
    expect(quoteForShell("--data-dir")).toBe("--data-dir");
  });

  it("single-quotes command arguments with whitespace", () => {
    expect(quoteForShell("/tmp/promptlane custom")).toBe(
      "'/tmp/promptlane custom'",
    );
  });

  it("escapes embedded single quotes for copyable shell commands", () => {
    expect(quoteForShell("feature/missing 'loop'")).toBe(
      "'feature/missing '\\''loop'\\'''",
    );
  });
});
