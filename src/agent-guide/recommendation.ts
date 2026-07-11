import type { LoopOutcomeStatus } from "../loop/types.js";

export type AgentGuideTaskType =
  | "ambiguous_request"
  | "planning"
  | "implementation"
  | "debugging"
  | "mechanical"
  | "review"
  | "continuation";

export type AgentGuideRole = "plan" | "implement" | "fast_path" | "review";

export type AgentGuideModel =
  | "gpt-5.6-sol"
  | "gpt-5.6-terra"
  | "gpt-5.6-luna"
  | "opus"
  | "sonnet"
  | "haiku";

export type AgentGuideTool = "codex" | "claude-code";

export type AgentGuideRunEvidence = {
  outcomeStatus: LoopOutcomeStatus;
};

export type AgentGuideRecommendation = {
  role: AgentGuideRole;
  primary: { tool: AgentGuideTool; model: AgentGuideModel };
  alternative: { tool: AgentGuideTool; model: AgentGuideModel };
  reasons: string[];
  switch_condition: string;
  confidence: "low" | "medium" | "high";
  evidence: {
    completed_runs: number;
    passing_runs: number;
    non_passing_runs: number;
  };
  privacy: {
    local_only: true;
    external_calls: false;
    auto_switches_model: false;
  };
};

export function recommendAgentStrategy(input: {
  taskType: AgentGuideTaskType;
  failedAttempts?: number;
  worktreeCount?: number;
  requiresIndependentReview?: boolean;
  matchingRuns: readonly AgentGuideRunEvidence[];
}): AgentGuideRecommendation {
  const evidence = summarizeEvidence(input.matchingRuns);
  const choice = chooseRole(input);

  return {
    ...choice,
    confidence: confidenceFor(evidence.completed_runs),
    evidence,
    privacy: {
      local_only: true,
      external_calls: false,
      auto_switches_model: false,
    },
  };
}

function chooseRole(input: {
  taskType: AgentGuideTaskType;
  failedAttempts?: number;
  worktreeCount?: number;
  requiresIndependentReview?: boolean;
}): Omit<AgentGuideRecommendation, "confidence" | "evidence" | "privacy"> {
  if (input.taskType === "ambiguous_request") {
    return roleChoice(
      "plan",
      "The request is ambiguous, so resolve the missing decision before implementation.",
      "After the missing decision is explicit, switch to implementation.",
    );
  }
  if ((input.failedAttempts ?? 0) >= 2) {
    return roleChoice(
      "plan",
      "Two or more failed or blocked attempts need a higher-reasoning recovery pass.",
      "After the failure cause and focused verification are explicit, switch to implementation.",
    );
  }
  if ((input.worktreeCount ?? 0) > 1 || input.requiresIndependentReview) {
    return roleChoice(
      "review",
      "Multi-worktree coordination or independent review needs a deliberate evidence pass.",
      "After the review decision is recorded, switch to implementation or fast-path work.",
    );
  }
  if (input.taskType === "planning" || input.taskType === "review") {
    return roleChoice(
      input.taskType === "review" ? "review" : "plan",
      "The task requires a deliberate design or review decision before editing.",
      "After the decision and acceptance checks are explicit, switch to implementation.",
    );
  }
  if (input.taskType === "mechanical") {
    return roleChoice(
      "fast_path",
      "The task is narrow and mechanical with no active escalation signal.",
      "If the scope expands, a test fails, or a design decision appears, switch to implementation or planning.",
    );
  }
  return roleChoice(
    "implement",
    "The task has an executable scope and should progress through focused implementation and verification.",
    "If two attempts fail, the scope becomes ambiguous, or multiple worktrees diverge, switch to planning or review.",
  );
}

function roleChoice(
  role: AgentGuideRole,
  reason: string,
  switchCondition: string,
): Omit<AgentGuideRecommendation, "confidence" | "evidence" | "privacy"> {
  const profiles =
    role === "fast_path"
      ? {
          primary: { tool: "codex" as const, model: "gpt-5.6-luna" as const },
          alternative: {
            tool: "claude-code" as const,
            model: "haiku" as const,
          },
        }
      : role === "implement"
        ? {
            primary: {
              tool: "codex" as const,
              model: "gpt-5.6-terra" as const,
            },
            alternative: {
              tool: "claude-code" as const,
              model: "sonnet" as const,
            },
          }
        : {
            primary: { tool: "codex" as const, model: "gpt-5.6-sol" as const },
            alternative: {
              tool: "claude-code" as const,
              model: "opus" as const,
            },
          };

  return {
    role,
    ...profiles,
    reasons: [reason],
    switch_condition: switchCondition,
  };
}

function summarizeEvidence(
  runs: readonly AgentGuideRunEvidence[],
): AgentGuideRecommendation["evidence"] {
  const completed = runs.filter(
    (run) => run.outcomeStatus === "passed" || run.outcomeStatus === "failed",
  );
  const passingRuns = completed.filter(
    (run) => run.outcomeStatus === "passed",
  ).length;
  return {
    completed_runs: completed.length,
    passing_runs: passingRuns,
    non_passing_runs: completed.length - passingRuns,
  };
}

function confidenceFor(
  completedRuns: number,
): AgentGuideRecommendation["confidence"] {
  if (completedRuns >= 10) return "high";
  if (completedRuns >= 3) return "medium";
  return "low";
}
