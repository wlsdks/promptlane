import type { ArchivePromptScoreSummary } from "./api.js";

const REVIEW_QUEUE_LIMIT = 6;

export function isReviewableScorePrompt(
  prompt: ArchivePromptScoreSummary,
): boolean {
  return (
    prompt.quality_score < 70 ||
    prompt.quality_score_band === "needs_work" ||
    prompt.quality_score_band === "weak"
  );
}

export function selectReviewPrompts(
  prompts: ArchivePromptScoreSummary[],
): ArchivePromptScoreSummary[] {
  return prompts.filter(isReviewableScorePrompt).slice(0, REVIEW_QUEUE_LIMIT);
}
