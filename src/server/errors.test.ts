import { describe, expect, it } from "vitest";

import { problem } from "./errors.js";

describe("server problem details", () => {
  it("redacts raw local paths and tokens from validation error messages", () => {
    const error = problem(
      422,
      "Validation Error",
      "The request payload is invalid.",
      "/api/v1/test",
      [
        {
          field: "prompt",
          message:
            "Invalid prompt_body=private-draft with cwd=/Users/example/private-project/raw.md and sk-proj-1234567890abcdef.",
        },
      ],
    );

    const message = error.problem.errors?.[0]?.message ?? "";
    expect(message).toContain("prompt_body=[REDACTED:prompt_body]");
    expect(message).toContain("[REDACTED:path]");
    expect(message).toContain("[REDACTED:api_key]");
    expect(message).not.toContain("/Users/example/private-project/raw.md");
    expect(message).not.toContain("sk-proj-1234567890abcdef");
  });

  it("redacts raw local paths and tokens from validation error fields", () => {
    const error = problem(
      422,
      "Validation Error",
      "The request payload is invalid.",
      "/api/v1/test",
      [
        {
          field:
            "/Users/example/private-project/raw.md token sk-proj-1234567890abcdef",
          message: "Invalid field.",
        },
      ],
    );

    const field = error.problem.errors?.[0]?.field ?? "";
    expect(field).toContain("[REDACTED:path]");
    expect(field).toContain("[REDACTED:api_key]");
    expect(field).not.toContain("/Users/example/private-project/raw.md");
    expect(field).not.toContain("sk-proj-1234567890abcdef");
  });
});
