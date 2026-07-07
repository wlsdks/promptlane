import { describe, expect, it } from "vitest";

import {
  isReviewableScorePrompt,
  selectReviewPrompts,
} from "./archive-review-model.js";
import type { ArchivePromptScoreSummary } from "./api.js";

describe("archive review model", () => {
  it("marks low score, weak, and needs-work prompts as reviewable", () => {
    expect(isReviewableScorePrompt(scorePrompt({ quality_score: 69 }))).toBe(
      true,
    );
    expect(
      isReviewableScorePrompt(
        scorePrompt({ quality_score: 84, quality_score_band: "needs_work" }),
      ),
    ).toBe(true);
    expect(
      isReviewableScorePrompt(
        scorePrompt({ quality_score: 91, quality_score_band: "weak" }),
      ),
    ).toBe(true);
    expect(
      isReviewableScorePrompt(
        scorePrompt({ quality_score: 70, quality_score_band: "good" }),
      ),
    ).toBe(false);
  });

  it("keeps the review queue focused to the first six reviewable prompts", () => {
    const prompts = Array.from({ length: 8 }, (_, index) =>
      scorePrompt({
        id: `prompt-${index + 1}`,
        quality_score: index === 6 ? 90 : 40,
        quality_score_band: index === 6 ? "excellent" : "weak",
      }),
    );

    expect(selectReviewPrompts(prompts).map((prompt) => prompt.id)).toEqual([
      "prompt-1",
      "prompt-2",
      "prompt-3",
      "prompt-4",
      "prompt-5",
      "prompt-6",
    ]);
  });
});

function scorePrompt(
  overrides: Partial<ArchivePromptScoreSummary> = {},
): ArchivePromptScoreSummary {
  return {
    id: "prompt-1",
    is_sensitive: false,
    project: "local-project",
    quality_gaps: [],
    quality_score: 82,
    quality_score_band: "good",
    received_at: "2026-07-08T00:00:00.000Z",
    tags: [],
    tool: "codex",
    ...overrides,
  };
}
