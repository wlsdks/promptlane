import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

describe("source hygiene", () => {
  it("does not keep retired tool-brand references in tracked files", () => {
    const retiredToolBrand = ["se", "rena"].join("");
    let matches = "";
    try {
      matches = execFileSync(
        "git",
        ["grep", "-n", "-i", retiredToolBrand, "--", "."],
        { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
      );
    } catch (error) {
      if (
        typeof error === "object" &&
        error !== null &&
        "status" in error &&
        error.status === 1
      ) {
        matches = "";
      } else {
        throw error;
      }
    }
    expect(matches).toBe("");
  });

  it("uses one compact continuation-safety contract", () => {
    const route = readFileSync("src/server/routes/loops.ts", "utf8");
    const api = readFileSync("src/web/src/api.ts", "utf8");
    expect(route).toContain("continuation_safety: CONTINUATION_SAFETY");
    expect(api).toContain("continuation_safety?: {");
    expect(route + "\n" + api).not.toContain("continuation_safety_");
  });

  it("removes superseded continuation-safety UI fragments", () => {
    expect(
      existsSync("src/web/src/loop-worktree-boundary-review-items.tsx"),
    ).toBe(false);
    expect(
      existsSync("src/web/src/loop-worktree-collection-freshness-items.tsx"),
    ).toBe(false);
    expect(
      existsSync("src/web/src/loop-worktree-memory-collection-items.tsx"),
    ).toBe(false);
    expect(
      existsSync(
        "src/web/src/loop-worktree-memory-approval-retry-renewed-items.tsx",
      ),
    ).toBe(false);
    expect(
      existsSync("src/web/src/loop-worktree-renewed-memory-approval-items.tsx"),
    ).toBe(false);
  });
});
