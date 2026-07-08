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

  it("redacts raw local paths and tokens from problem instances", () => {
    const error = problem(
      404,
      "Not Found",
      "Missing route.",
      "/api/v1/test?path=/Users/example/private-project/raw.md&token=sk-proj-1234567890abcdef",
    );

    const instance = error.problem.instance ?? "";
    expect(instance).toContain("[REDACTED:path]");
    expect(instance).not.toContain("/Users/example/private-project/raw.md");
    expect(instance).not.toContain("sk-proj-1234567890abcdef");
  });

  it("redacts raw local paths and tokens from problem details", () => {
    const error = problem(
      400,
      "Bad Request",
      "Invalid prompt_body=private-draft from /Users/example/private-project/raw.md with sk-proj-1234567890abcdef.",
    );

    expect(error.problem.detail).toContain(
      "prompt_body=[REDACTED:prompt_body]",
    );
    expect(error.problem.detail).toContain("[REDACTED:path]");
    expect(error.problem.detail).toContain("[REDACTED:api_key]");
    expect(error.problem.detail).not.toContain(
      "/Users/example/private-project/raw.md",
    );
    expect(error.problem.detail).not.toContain("sk-proj-1234567890abcdef");
    expect(error.message).toBe(error.problem.detail);
  });

  it("redacts raw local paths and tokens from problem titles and types", () => {
    const error = problem(
      500,
      "Failure in /Users/example/private-project/raw.md with sk-proj-1234567890abcdef",
      "The request failed.",
    );

    expect(error.problem.title).toContain("[REDACTED:path]");
    expect(error.problem.title).toContain("[REDACTED:api_key]");
    expect(error.problem.title).not.toContain(
      "/Users/example/private-project/raw.md",
    );
    expect(error.problem.title).not.toContain("sk-proj-1234567890abcdef");
    expect(error.problem.type).toContain("redacted-path");
    expect(error.problem.type).toContain("redacted-api-key");
    expect(error.problem.type).not.toContain("users-example-private-project");
    expect(error.problem.type).not.toContain("sk-proj-1234567890abcdef");
  });
});
