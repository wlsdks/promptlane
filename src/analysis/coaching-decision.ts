import {
  DEFAULT_MIN_SCORE,
  evaluatePromptCoaching,
  type CoachingLanguage,
} from "./coaching-thresholds.js";
import { clampScore } from "../shared/clamp-score.js";
import type { PromptAnalysisPreview } from "../shared/schema.js";
import type { ClarifyingQuestion, PromptImprovement } from "./improve.js";

export type CoachingMode = "off" | "block-and-copy" | "context" | "ask";

export type CoachingDecisionOptions = {
  mode?: CoachingMode;
  minScore?: number;
  language?: CoachingLanguage;
  now?: Date;
};

export type CoachingDecision =
  | {
      action: "none";
      reason:
        | "mode_off"
        | "empty_prompt"
        | "above_threshold"
        | "ask_prompt_too_short"
        | "ask_score_too_high"
        | "ask_acknowledgment"
        | "ask_no_questions";
      score?: number;
    }
  | CoachingActionDecision;

export type CoachingActionDecision = {
  action: "ask" | "context" | "block-and-copy";
  score: number;
  minScore: number;
  analysis: PromptAnalysisPreview;
  improvement: PromptImprovement;
  language: CoachingLanguage;
  clarifyingQuestions: ClarifyingQuestion[];
  missingAxes: string[];
};

const ASK_MIN_LENGTH = 30;
const ASK_MAX_SCORE = 60;

// Korean has no ASCII word boundary, so `\b` does not match between Hangul
// characters. STRICT roots must end the token (followed by space,
// punctuation, or end-of-string) so "응" reads as ack but "응답" does not.
const STRICT_ACK_TAIL = String.raw`(?:\s|[!?.,]|$)`;
const ACK_PATTERNS: readonly RegExp[] = [
  /^[ㅇㅎㄴㅋㅠㅜ]+\s*[!?.]*$/,
  new RegExp(`^(응|어|네|아니|아뇨)${STRICT_ACK_TAIL}`),
  /^(좋아|좋네|좋습니다|됐어|됐다|괜찮|훌륭)/,
  /^(고마워|감사|땡큐)/,
  /^(다음|진행|계속|넘어가)/,
  /^(그래|그러면|그럼|그렇구나|그렇네|아하|음+|일단)/,
  /^(그만|멈춰|취소|되돌려)/,
  /^(yes|yeah|yep|nope|no|ok|okay|sure|fine|alright)\b/i,
  /^(thanks|thx|ty)\b/i,
  /^(next|continue|proceed|go(?:\s|$)|stop|cancel|undo)\b/i,
  /^(perfect|great|nice|cool|awesome|got it)\b/i,
  /^let'?s\b/i,
];

export function decideCoachingAction(
  prompt: string,
  options: CoachingDecisionOptions = {},
): CoachingDecision {
  const mode = options.mode ?? "off";
  if (mode === "off") {
    return { action: "none", reason: "mode_off", score: undefined };
  }

  const minScore = normalizeMinScore(options.minScore);
  const evaluation = evaluatePromptCoaching(prompt, {
    minScore,
    language: options.language,
    now: options.now,
  });

  if (!evaluation.needed) {
    return {
      action: "none",
      reason: evaluation.reason,
      score: evaluation.score,
    };
  }

  const base = {
    score: evaluation.score,
    minScore,
    analysis: evaluation.analysis,
    improvement: evaluation.improvement,
    language: evaluation.language,
    clarifyingQuestions: evaluation.improvement.clarifying_questions,
    missingAxes: evaluation.improvement.clarifying_questions.map(
      (question) => question.axis,
    ),
  };

  if (mode === "ask") {
    if (prompt.trim().length < ASK_MIN_LENGTH) {
      return {
        action: "none",
        reason: "ask_prompt_too_short",
        score: evaluation.score,
      };
    }
    if (evaluation.analysis.quality_score.value >= ASK_MAX_SCORE) {
      return {
        action: "none",
        reason: "ask_score_too_high",
        score: evaluation.score,
      };
    }
    if (isAcknowledgment(prompt)) {
      return {
        action: "none",
        reason: "ask_acknowledgment",
        score: evaluation.score,
      };
    }
    if (evaluation.improvement.clarifying_questions.length === 0) {
      return {
        action: "none",
        reason: "ask_no_questions",
        score: evaluation.score,
      };
    }
  }

  return { action: mode, ...base };
}

export function isAcknowledgment(prompt: string): boolean {
  const trimmed = prompt.trim();
  if (trimmed.length === 0) {
    return true;
  }

  return ACK_PATTERNS.some((pattern) => pattern.test(trimmed));
}

function normalizeMinScore(value: number | undefined): number {
  if (value === undefined || !Number.isFinite(value)) {
    return DEFAULT_MIN_SCORE;
  }

  return clampScore(value);
}
