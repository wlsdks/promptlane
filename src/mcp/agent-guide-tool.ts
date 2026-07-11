import {
  recommendAgentStrategy,
  type AgentGuideModel,
  type AgentGuideRole,
  type AgentGuideTaskType,
  type AgentGuideTool,
} from "../agent-guide/recommendation.js";
import { loadHookAuth, loadLoopRelayConfig } from "../config/config.js";
import { createProjectKey } from "../storage/project-id.js";
import { createSqlitePromptStorage } from "../storage/sqlite.js";
import type { LoopRelayMcpToolDefinition } from "./score-tool-definition-types.js";
import type { ScorePromptToolOptions } from "./score-tool-types.js";

const taskTypes = [
  "ambiguous_request",
  "planning",
  "implementation",
  "debugging",
  "mechanical",
  "review",
  "continuation",
] as const;
const profiles = [
  "gpt-5.6-sol",
  "gpt-5.6-terra",
  "gpt-5.6-luna",
  "opus",
  "sonnet",
  "haiku",
] as const;

export const RECOMMEND_AGENT_STRATEGY_TOOL_DEFINITION: LoopRelayMcpToolDefinition =
  {
    name: "recommend_agent_strategy",
    description:
      "Recommend a non-binding Codex or Claude Code model role from raw-free local LoopRelay run evidence. Use before planning, implementation, recovery, or review. It never starts a provider, changes a model, returns prompt bodies, raw paths, transcripts, credentials, or external results.",
    annotations: {
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
      readOnlyHint: true,
      title: "Recommend local agent strategy",
    },
    inputSchema: {
      type: "object",
      required: ["cwd", "task_type"],
      properties: {
        cwd: { type: "string" },
        task_type: { type: "string", enum: taskTypes },
        failed_attempts: { type: "integer", minimum: 0 },
        worktree_count: { type: "integer", minimum: 0 },
        requires_independent_review: { type: "boolean" },
      },
      additionalProperties: false,
    },
    outputSchema: {
      type: "object",
      properties: {
        role: { type: "string" },
        primary: { type: "object" },
        alternative: { type: "object" },
        reasons: { type: "array" },
        switch_condition: { type: "string" },
        confidence: { type: "string" },
        evidence: { type: "object" },
        privacy: { type: "object" },
      },
    },
  };
export const RECORD_AGENT_RUN_TOOL_DEFINITION: LoopRelayMcpToolDefinition = {
  name: "record_agent_run",
  description:
    "Record an operator-declared, raw-free local agent model run after a meaningful checkpoint. Use only with a known task type and outcome. It never stores prompt bodies, responses, reasoning, raw paths, credentials, or provider pricing.",
  annotations: {
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: false,
    readOnlyHint: false,
    title: "Record local agent run",
  },
  inputSchema: {
    type: "object",
    required: ["cwd", "task_type", "tool", "model", "role", "outcome_status"],
    properties: {
      cwd: { type: "string" },
      task_type: { type: "string", enum: taskTypes },
      tool: { type: "string", enum: ["codex", "claude-code"] },
      model: { type: "string", enum: profiles },
      role: {
        type: "string",
        enum: ["plan", "implement", "fast_path", "review"],
      },
      outcome_status: {
        type: "string",
        enum: [
          "unknown",
          "in_progress",
          "passed",
          "failed",
          "blocked",
          "abandoned",
        ],
      },
      attempts: { type: "integer", minimum: 1 },
      first_value_seconds: { type: "integer", minimum: 0 },
      focused_test_count: { type: "integer", minimum: 0 },
      accepted_recommendation: { type: "boolean" },
    },
    additionalProperties: false,
  },
  outputSchema: {
    type: "object",
    properties: {
      id: { type: "string" },
      created_at: { type: "string" },
      outcome_status: { type: "string" },
    },
  },
};

export function recommendAgentStrategyTool(
  args: {
    cwd: string;
    task_type: AgentGuideTaskType;
    failed_attempts?: number;
    worktree_count?: number;
    requires_independent_review?: boolean;
  },
  options: ScorePromptToolOptions = {},
) {
  try {
    const { storage, projectId } = open(options, args.cwd);
    try {
      return recommendAgentStrategy({
        taskType: args.task_type,
        failedAttempts: args.failed_attempts,
        worktreeCount: args.worktree_count,
        requiresIndependentReview: args.requires_independent_review,
        matchingRuns: storage
          .listAgentRuns({ projectId, taskType: args.task_type })
          .map((run) => ({ outcomeStatus: run.outcome_status })),
      });
    } finally {
      storage.close();
    }
  } catch {
    return {
      is_error: true as const,
      error_code: "storage_unavailable",
      message:
        "Local agent guide storage is unavailable. Run looprelay setup and retry.",
    };
  }
}
export function recordAgentRunTool(
  args: {
    cwd: string;
    task_type: AgentGuideTaskType;
    tool: AgentGuideTool;
    model: AgentGuideModel;
    role: AgentGuideRole;
    outcome_status:
      | "unknown"
      | "in_progress"
      | "passed"
      | "failed"
      | "blocked"
      | "abandoned";
    attempts?: number;
    first_value_seconds?: number;
    focused_test_count?: number;
    accepted_recommendation?: boolean;
  },
  options: ScorePromptToolOptions = {},
) {
  try {
    const { storage, projectId } = open(options, args.cwd);
    try {
      return storage.recordAgentRun({
        project_id: projectId,
        task_type: args.task_type,
        tool: args.tool,
        model: args.model,
        role: args.role,
        outcome_status: args.outcome_status,
        attempts: args.attempts ?? 1,
        first_value_seconds: args.first_value_seconds,
        focused_test_count: args.focused_test_count ?? 0,
        accepted_recommendation: args.accepted_recommendation === true,
      });
    } finally {
      storage.close();
    }
  } catch {
    return {
      is_error: true as const,
      error_code: "storage_unavailable",
      message:
        "Local agent guide storage is unavailable. Run looprelay setup and retry.",
    };
  }
}
function open(options: ScorePromptToolOptions, cwd: string) {
  const config = loadLoopRelayConfig(options.dataDir);
  const auth = loadHookAuth(options.dataDir);
  return {
    storage: createSqlitePromptStorage({
      dataDir: config.data_dir,
      hmacSecret: auth.web_session_secret,
    }),
    projectId: createProjectKey(cwd, auth.web_session_secret),
  };
}
