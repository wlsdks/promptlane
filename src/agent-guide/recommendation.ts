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

export const AGENT_GUIDE_TASK_TYPES = [
  "ambiguous_request",
  "planning",
  "implementation",
  "debugging",
  "mechanical",
  "review",
  "continuation",
] as const satisfies readonly AgentGuideTaskType[];
export const AGENT_GUIDE_ROLES = [
  "plan",
  "implement",
  "fast_path",
  "review",
] as const satisfies readonly AgentGuideRole[];
export const AGENT_GUIDE_MODELS = [
  "gpt-5.6-sol",
  "gpt-5.6-terra",
  "gpt-5.6-luna",
  "opus",
  "sonnet",
  "haiku",
] as const satisfies readonly AgentGuideModel[];
export const AGENT_GUIDE_TOOLS = [
  "codex",
  "claude-code",
] as const satisfies readonly AgentGuideTool[];
export const AGENT_GUIDE_OUTCOME_STATUSES = [
  "unknown",
  "in_progress",
  "passed",
  "failed",
  "blocked",
  "abandoned",
] as const satisfies readonly LoopOutcomeStatus[];

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

type RoleChoice = Omit<
  AgentGuideRecommendation,
  "confidence" | "evidence" | "privacy"
>;

const PROFILE_BY_ROLE: Record<
  AgentGuideRole,
  Pick<RoleChoice, "primary" | "alternative">
> = {
  plan: {
    primary: { tool: "codex", model: "gpt-5.6-sol" },
    alternative: { tool: "claude-code", model: "opus" },
  },
  implement: {
    primary: { tool: "codex", model: "gpt-5.6-terra" },
    alternative: { tool: "claude-code", model: "sonnet" },
  },
  fast_path: {
    primary: { tool: "codex", model: "gpt-5.6-luna" },
    alternative: { tool: "claude-code", model: "haiku" },
  },
  review: {
    primary: { tool: "codex", model: "gpt-5.6-sol" },
    alternative: { tool: "claude-code", model: "opus" },
  },
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

export function requireAgentGuideTaskType(value: unknown): AgentGuideTaskType {
  return requireEnum(value, AGENT_GUIDE_TASK_TYPES, "task type");
}

export function requireAgentGuideRole(value: unknown): AgentGuideRole {
  return requireEnum(value, AGENT_GUIDE_ROLES, "role");
}

export function requireAgentGuideModel(value: unknown): AgentGuideModel {
  return requireEnum(value, AGENT_GUIDE_MODELS, "model");
}

export function requireAgentGuideTool(value: unknown): AgentGuideTool {
  return requireEnum(value, AGENT_GUIDE_TOOLS, "tool");
}

export function requireAgentGuideOutcomeStatus(
  value: unknown,
): LoopOutcomeStatus {
  return requireEnum(value, AGENT_GUIDE_OUTCOME_STATUSES, "outcome status");
}

export function requireAgentGuideCwd(value: unknown): string {
  if (typeof value === "string" && value.trim()) return value;
  throw new Error("Agent guide cwd must be a non-empty path.");
}

export function requireAgentGuideInteger(
  value: unknown,
  label: string,
  minimum: number,
): number | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== "number" || !Number.isInteger(value) || value < minimum)
    throw new Error(`${label} must be an integer of at least ${minimum}.`);
  return value;
}

export function requireAgentGuideBoolean(
  value: unknown,
  label: string,
): boolean {
  if (typeof value === "boolean") return value;
  throw new Error(`${label} must be a boolean.`);
}

function requireEnum<T extends string>(
  value: unknown,
  values: readonly T[],
  label: string,
): T {
  if (typeof value === "string" && values.includes(value as T))
    return value as T;
  throw new Error(
    `Agent run ${label} must be a supported ${label === "model" ? "profile" : "value"}.`,
  );
}

function chooseRole(input: {
  taskType: AgentGuideTaskType;
  failedAttempts?: number;
  worktreeCount?: number;
  requiresIndependentReview?: boolean;
}): RoleChoice {
  return (
    choiceForAmbiguousRequest(input) ??
    choiceForFailedAttempts(input) ??
    choiceForReview(input) ??
    choiceForDeliberateTask(input) ??
    choiceForMechanicalTask(input) ??
    implementationChoice()
  );
}

function choiceForAmbiguousRequest(input: {
  taskType: AgentGuideTaskType;
}): RoleChoice | undefined {
  if (input.taskType === "ambiguous_request") {
    return roleChoice(
      "plan",
      "The request is ambiguous, so resolve the missing decision before implementation.",
      "After the missing decision is explicit, switch to implementation.",
    );
  }
  return undefined;
}

function choiceForFailedAttempts(input: {
  failedAttempts?: number;
}): RoleChoice | undefined {
  if ((input.failedAttempts ?? 0) >= 2) {
    return roleChoice(
      "plan",
      "Two or more failed or blocked attempts need a higher-reasoning recovery pass.",
      "After the failure cause and focused verification are explicit, switch to implementation.",
    );
  }
  return undefined;
}

function choiceForReview(input: {
  worktreeCount?: number;
  requiresIndependentReview?: boolean;
}): RoleChoice | undefined {
  if ((input.worktreeCount ?? 0) > 1 || input.requiresIndependentReview) {
    return roleChoice(
      "review",
      "Multi-worktree coordination or independent review needs a deliberate evidence pass.",
      "After the review decision is recorded, switch to implementation or fast-path work.",
    );
  }
  return undefined;
}

function choiceForDeliberateTask(input: {
  taskType: AgentGuideTaskType;
}): RoleChoice | undefined {
  if (input.taskType === "planning" || input.taskType === "review") {
    return roleChoice(
      input.taskType === "review" ? "review" : "plan",
      "The task requires a deliberate design or review decision before editing.",
      "After the decision and acceptance checks are explicit, switch to implementation.",
    );
  }
  return undefined;
}

function choiceForMechanicalTask(input: {
  taskType: AgentGuideTaskType;
}): RoleChoice | undefined {
  if (input.taskType === "mechanical") {
    return roleChoice(
      "fast_path",
      "The task is narrow and mechanical with no active escalation signal.",
      "If the scope expands, a test fails, or a design decision appears, switch to implementation or planning.",
    );
  }
  return undefined;
}

function implementationChoice(): RoleChoice {
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
): RoleChoice {
  return {
    role,
    ...PROFILE_BY_ROLE[role],
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
