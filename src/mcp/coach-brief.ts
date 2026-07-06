import { improvementNextActionRequiresAsk } from "./improvement-next-action.js";
import type {
  CoachPromptToolResult,
  GetPromptLaneStatusToolResult,
  ImprovePromptToolResult,
  ReviewProjectInstructionsToolResult,
  ScorePromptArchiveToolResult,
  ScorePromptToolResult,
} from "./score-tool-types.js";

export function createAgentCoachBrief(input: {
  status: GetPromptLaneStatusToolResult;
  latestScore?: ScorePromptToolResult;
  improvement?: ImprovePromptToolResult;
  archive?: ScorePromptArchiveToolResult;
  projectRules?: ReviewProjectInstructionsToolResult;
}): CoachPromptToolResult["agent_brief"] {
  if (input.status.status !== "ready") {
    return {
      headline: "PromptLane is not ready yet.",
      summary:
        "No captured prompt archive is available for coaching in this data directory.",
      next_actions: [
        "Run promptlane start to see the shortest setup -> real prompt -> coach path.",
        "Run promptlane setup --profile coach --register-mcp, then submit one real Claude Code or Codex prompt.",
        "Run promptlane server if connected tools cannot reach the local service.",
        "Run promptlane doctor claude-code or promptlane doctor codex if capture still does not work.",
      ],
      suggested_user_response:
        "I cannot coach the latest prompt yet because promptlane has no ready archive. Run promptlane start, finish the coach setup, then capture one real request first.",
    };
  }

  const nextActions = [
    "Review the latest prompt score and fix the first missing or partial checklist item before resubmitting.",
  ];
  const score =
    input.latestScore && !isToolError(input.latestScore)
      ? `${input.latestScore.quality_score.value}/${input.latestScore.quality_score.max} (${input.latestScore.quality_score.band})`
      : "not available";

  const improvementHasQuestions =
    !!input.improvement &&
    !isToolError(input.improvement) &&
    improvementNextActionRequiresAsk(input.improvement);

  if (input.improvement && !isToolError(input.improvement)) {
    nextActions.push(
      improvementHasQuestions
        ? input.improvement.next_action
        : "Use the approval-ready rewrite only after the user explicitly accepts it.",
    );
    if (improvementHasQuestions) {
      nextActions.push(
        "If your client advertises MCP elicitation capability, prefer calling ask_clarifying_questions in a single round trip; it asks the user via your native form and composes the final draft from their verbatim answers. Otherwise stay on the manual ask + apply_clarifications path.",
      );
    }
  }

  if (input.archive && !isToolError(input.archive)) {
    const firstPractice = input.archive.practice_plan[0];
    const effectiveness = input.archive.effectiveness_summary;
    if (firstPractice) {
      nextActions.push(`Practice rule: ${firstPractice.prompt_rule}`);
    }
    nextActions.push(
      effectiveness.unmeasured_prompts > 0
        ? `Review ${formatPromptCount(effectiveness.unmeasured_prompts, "unmeasured")} before claiming archive-wide improvement.`
        : "Archive effectiveness evidence is fully measured for the current score window.",
    );
    if (effectiveness.top_evidence_refs.length > 0) {
      nextActions.push(
        `Effectiveness refs: ${effectiveness.top_evidence_refs.join(", ")}`,
      );
    }
    nextActions.push(
      "Use the next_prompt_template for the next coding-agent request.",
    );
  }

  if (input.projectRules && !isToolError(input.projectRules)) {
    nextActions.push(input.projectRules.next_action);
  }

  const firstWeakChecklistItem =
    input.latestScore && !isToolError(input.latestScore)
      ? input.latestScore.checklist.find((item) => item.status !== "good")
      : undefined;
  const firstPractice =
    input.archive && !isToolError(input.archive)
      ? input.archive.practice_plan[0]
      : undefined;
  const lowScorePrompt =
    input.archive && !isToolError(input.archive)
      ? input.archive.low_score_prompts[0]
      : undefined;
  const archiveEffectiveness =
    input.archive && !isToolError(input.archive)
      ? input.archive.effectiveness_summary
      : undefined;
  const firstFix = firstWeakChecklistItem
    ? {
        label: firstWeakChecklistItem.label,
        instruction:
          firstWeakChecklistItem.suggestion ??
          "Clarify this checklist item before resubmitting the request.",
        reason: firstWeakChecklistItem.reason,
      }
    : firstPractice
      ? {
          label: firstPractice.label,
          instruction: firstPractice.prompt_rule,
          reason: firstPractice.reason,
        }
      : undefined;

  return {
    headline: `Latest prompt score: ${score}`,
    summary: [
      "This local coach result combines latest prompt scoring, copy-based rewrite, recent habit review, and project instruction review for the agent session.",
      archiveEffectiveness
        ? `Effectiveness evidence: ${archiveEffectiveness.measured_prompts} measured, ${archiveEffectiveness.unmeasured_prompts} unmeasured, ${archiveEffectiveness.calibration.linked_outcomes} linked outcomes, ${archiveEffectiveness.calibration.total_tests_run} tests run.`
        : undefined,
    ]
      .filter(Boolean)
      .join(" "),
    ...(firstFix ? { first_fix: firstFix } : {}),
    ...(lowScorePrompt
      ? {
          review_target: {
            prompt_id: lowScorePrompt.id,
            reason: `${lowScorePrompt.quality_score}/100 ${lowScorePrompt.quality_score_band} prompt with gaps: ${lowScorePrompt.quality_gaps.join(", ") || "none"}.`,
          },
        }
      : {}),
    ...(input.archive && !isToolError(input.archive)
      ? { next_request_template: input.archive.next_prompt_template }
      : {}),
    next_actions: nextActions,
    suggested_user_response:
      "Here is the local prompt coach result. I will not auto-submit the rewrite; review the score, inspect the suggested changes, then approve or edit the improved request before using it.",
  };
}

function isToolError(value: unknown): value is { is_error: true } {
  return value !== null && typeof value === "object" && "is_error" in value;
}

function formatPromptCount(count: number, label: string): string {
  return `${count} ${label} ${count === 1 ? "prompt" : "prompts"}`;
}
