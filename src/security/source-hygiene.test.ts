import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

describe("source hygiene", () => {
  it("does not keep retired tool-brand references in tracked files", () => {
    const retiredToolBrand = ["se", "rena"].join("");

    let matches = "";
    try {
      matches = execFileSync(
        "git",
        ["grep", "-n", "-i", retiredToolBrand, "--", "."],
        {
          encoding: "utf8",
          stdio: ["ignore", "pipe", "pipe"],
        },
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

  it("does not leave duplicate selected-detail boundary decisions unresolved", () => {
    const todo = readFileSync("tasks/todo.md", "utf8");

    expect(todo).not.toContain(
      "- [ ] 다음 slice: selected detail panel의 post-memory-approval retry renewed-memory-approval post-submit retry renewed-memory-approval post-submit collection freshness uncertainty pre-merge/pre-handoff/pre-paste/pre-submit boundary를 별도 제공할지 결정",
    );
    expect(todo).toContain(
      "Task 140 DECISION: post-submit collection freshness uncertainty pre-merge/pre-handoff/pre-paste/pre-submit boundary는 Task 133-136의 기존 runtime field가 이미 담당하므로 중복 field를 추가하지 않음",
    );
  });

  it("keeps reducing raw loop review item markup in LoopsView", () => {
    const loopsView = readFileSync("src/web/src/loops-view.tsx", "utf8");
    const rawReviewItemCount = (
      loopsView.match(/<div className="loop-review-item">/g) ?? []
    ).length;

    expect(rawReviewItemCount).toBeLessThanOrEqual(2);
  });
});
