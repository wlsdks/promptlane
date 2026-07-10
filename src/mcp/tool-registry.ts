import {
  APPLY_CLARIFICATIONS_TOOL_DEFINITION,
  applyClarificationsTool,
  type ApplyClarificationsToolArguments,
} from "./apply-clarifications-tool.js";
import {
  ASK_CLARIFYING_QUESTIONS_TOOL_DEFINITION,
  askClarifyingQuestionsTool,
  type AskClarifyingQuestionsToolArguments,
} from "./ask-clarifying-questions-tool.js";
import {
  GET_BENCHMARK_CANDIDATES_TOOL_DEFINITION,
  getBenchmarkCandidatesTool,
  type GetBenchmarkCandidatesToolArguments,
} from "./get-benchmark-candidates-tool.js";
import {
  GET_PAIRED_BENCHMARK_CANDIDATES_TOOL_DEFINITION,
  getPairedBenchmarkCandidatesTool,
  type GetPairedBenchmarkCandidatesToolArguments,
} from "./get-paired-benchmark-candidates-tool.js";
import {
  APPLY_INSTRUCTION_PATCH_TOOL_DEFINITION,
  GET_PROMPTLANE_LOOP_STATUS_TOOL_DEFINITION,
  PREPARE_LOOP_BRIEF_TOOL_DEFINITION,
  PROPOSE_INSTRUCTION_PATCH_TOOL_DEFINITION,
  PROPOSE_LOOP_MEMORY_CANDIDATE_TOOL_DEFINITION,
  RECORD_LOOP_MEMORY_TOOL_DEFINITION,
  RECORD_LOOP_OUTCOME_TOOL_DEFINITION,
} from "./loop-tool-definitions.js";
import {
  applyInstructionPatchTool,
  getPromptLaneLoopStatusTool,
  prepareLoopBriefTool,
  proposeInstructionPatchTool,
  proposeLoopMemoryCandidateTool,
  recordLoopMemoryTool,
  recordLoopOutcomeTool,
} from "./loop-tool.js";
import type {
  ApplyInstructionPatchToolArguments,
  ProposeInstructionPatchToolArguments,
  ProposeLoopMemoryCandidateToolArguments,
  RecordLoopMemoryToolArguments,
  RecordLoopOutcomeToolArguments,
} from "./loop-tool-types.js";
import {
  RECORD_CLARIFICATIONS_TOOL_DEFINITION,
  recordClarificationsTool,
  type RecordClarificationsToolArguments,
} from "./record-clarifications-tool.js";
import {
  COACH_PROMPT_TOOL_DEFINITION,
  GET_PROMPTLANE_STATUS_TOOL_DEFINITION,
  IMPROVE_PROMPT_TOOL_DEFINITION,
  PREPARE_AGENT_JUDGE_BATCH_TOOL_DEFINITION,
  PREPARE_AGENT_REWRITE_TOOL_DEFINITION,
  RECORD_AGENT_JUDGMENTS_TOOL_DEFINITION,
  RECORD_AGENT_REWRITE_TOOL_DEFINITION,
  REVIEW_PROJECT_INSTRUCTIONS_TOOL_DEFINITION,
  SCORE_PROMPT_ARCHIVE_TOOL_DEFINITION,
  SCORE_PROMPT_TOOL_DEFINITION,
} from "./score-tool-definitions.js";
import type { PromptLaneMcpToolDefinition } from "./score-tool-definition-types.js";
import {
  coachPromptTool,
  getPromptLaneStatusTool,
  improvePromptTool,
  prepareAgentJudgeBatchTool,
  prepareAgentRewriteTool,
  recordAgentJudgmentsTool,
  recordAgentRewriteTool,
  reviewProjectInstructionsTool,
  scorePromptArchiveTool,
  scorePromptTool,
} from "./score-tool.js";
import type {
  CoachPromptToolArguments,
  GetPromptLaneStatusToolArguments,
  ImprovePromptToolArguments,
  ReviewProjectInstructionsToolArguments,
  ScorePromptArchiveToolArguments,
  ScorePromptToolArguments,
} from "./score-tool-types.js";
import type {
  PrepareAgentJudgeBatchToolArguments,
  RecordAgentJudgmentsToolArguments,
} from "./agent-judge-tool-types.js";
import type {
  PrepareAgentRewriteToolArguments,
  RecordAgentRewriteToolArguments,
} from "./agent-rewrite-tool-types.js";
import type { PromptLaneMcpServerOptions } from "./server.js";

export type PromptLaneToolHandler = (
  args: Record<string, unknown>,
  options: PromptLaneMcpServerOptions,
) => unknown | Promise<unknown>;

export type RegisteredPromptLaneTool = {
  definition: PromptLaneMcpToolDefinition;
  handler: PromptLaneToolHandler;
};

export const PROMPTLANE_MCP_TOOL_REGISTRY: readonly RegisteredPromptLaneTool[] =
  [
    {
      definition: GET_PROMPTLANE_STATUS_TOOL_DEFINITION,
      handler: (args, options) =>
        getPromptLaneStatusTool(
          args as GetPromptLaneStatusToolArguments,
          options,
        ),
    },
    {
      definition: COACH_PROMPT_TOOL_DEFINITION,
      handler: (args, options) =>
        coachPromptTool(args as CoachPromptToolArguments, options),
    },
    {
      definition: SCORE_PROMPT_TOOL_DEFINITION,
      handler: (args, options) =>
        scorePromptTool(args as ScorePromptToolArguments, options),
    },
    {
      definition: IMPROVE_PROMPT_TOOL_DEFINITION,
      handler: (args, options) =>
        improvePromptTool(args as ImprovePromptToolArguments, options),
    },
    {
      definition: APPLY_CLARIFICATIONS_TOOL_DEFINITION,
      handler: (args, options) =>
        applyClarificationsTool(
          args as ApplyClarificationsToolArguments,
          options,
        ),
    },
    {
      definition: ASK_CLARIFYING_QUESTIONS_TOOL_DEFINITION,
      handler: (args, options) =>
        askClarifyingQuestionsTool(
          args as AskClarifyingQuestionsToolArguments,
          options,
        ),
    },
    {
      definition: RECORD_CLARIFICATIONS_TOOL_DEFINITION,
      handler: (args, options) =>
        recordClarificationsTool(
          args as RecordClarificationsToolArguments,
          options,
        ),
    },
    {
      definition: GET_PROMPTLANE_LOOP_STATUS_TOOL_DEFINITION,
      handler: (args, options) => getPromptLaneLoopStatusTool(args, options),
    },
    {
      definition: GET_BENCHMARK_CANDIDATES_TOOL_DEFINITION,
      handler: (args, options) =>
        getBenchmarkCandidatesTool(
          args as GetBenchmarkCandidatesToolArguments,
          options,
        ),
    },
    {
      definition: GET_PAIRED_BENCHMARK_CANDIDATES_TOOL_DEFINITION,
      handler: (args, options) =>
        getPairedBenchmarkCandidatesTool(
          args as GetPairedBenchmarkCandidatesToolArguments,
          options,
        ),
    },
    {
      definition: PREPARE_LOOP_BRIEF_TOOL_DEFINITION,
      handler: (args, options) => prepareLoopBriefTool(args, options),
    },
    {
      definition: RECORD_LOOP_OUTCOME_TOOL_DEFINITION,
      handler: (args, options) =>
        recordLoopOutcomeTool(args as RecordLoopOutcomeToolArguments, options),
    },
    {
      definition: PROPOSE_LOOP_MEMORY_CANDIDATE_TOOL_DEFINITION,
      handler: (args, options) =>
        proposeLoopMemoryCandidateTool(
          args as ProposeLoopMemoryCandidateToolArguments,
          options,
        ),
    },
    {
      definition: RECORD_LOOP_MEMORY_TOOL_DEFINITION,
      handler: (args, options) =>
        recordLoopMemoryTool(args as RecordLoopMemoryToolArguments, options),
    },
    {
      definition: PROPOSE_INSTRUCTION_PATCH_TOOL_DEFINITION,
      handler: (args, options) =>
        proposeInstructionPatchTool(
          args as ProposeInstructionPatchToolArguments,
          options,
        ),
    },
    {
      definition: APPLY_INSTRUCTION_PATCH_TOOL_DEFINITION,
      handler: (args, options) =>
        applyInstructionPatchTool(
          args as ApplyInstructionPatchToolArguments,
          options,
        ),
    },
    {
      definition: SCORE_PROMPT_ARCHIVE_TOOL_DEFINITION,
      handler: (args, options) =>
        scorePromptArchiveTool(
          args as ScorePromptArchiveToolArguments,
          options,
        ),
    },
    {
      definition: REVIEW_PROJECT_INSTRUCTIONS_TOOL_DEFINITION,
      handler: (args, options) =>
        reviewProjectInstructionsTool(
          args as ReviewProjectInstructionsToolArguments,
          options,
        ),
    },
    {
      definition: PREPARE_AGENT_REWRITE_TOOL_DEFINITION,
      handler: (args, options) =>
        prepareAgentRewriteTool(
          args as PrepareAgentRewriteToolArguments,
          options,
        ),
    },
    {
      definition: RECORD_AGENT_REWRITE_TOOL_DEFINITION,
      handler: (args, options) =>
        recordAgentRewriteTool(
          args as RecordAgentRewriteToolArguments,
          options,
        ),
    },
    {
      definition: PREPARE_AGENT_JUDGE_BATCH_TOOL_DEFINITION,
      handler: (args, options) =>
        prepareAgentJudgeBatchTool(
          args as PrepareAgentJudgeBatchToolArguments,
          options,
        ),
    },
    {
      definition: RECORD_AGENT_JUDGMENTS_TOOL_DEFINITION,
      handler: (args, options) =>
        recordAgentJudgmentsTool(
          args as RecordAgentJudgmentsToolArguments,
          options,
        ),
    },
  ];

export const PROMPTLANE_MCP_TOOL_DEFINITIONS: readonly PromptLaneMcpToolDefinition[] =
  PROMPTLANE_MCP_TOOL_REGISTRY.map((tool) => tool.definition);

const HANDLERS_BY_NAME = new Map(
  PROMPTLANE_MCP_TOOL_REGISTRY.map((tool) => [
    tool.definition.name,
    tool.handler,
  ]),
);

export function getPromptLaneMcpToolHandler(
  name: string,
): PromptLaneToolHandler | undefined {
  return HANDLERS_BY_NAME.get(name);
}

export function listPromptLaneMcpToolNames(): string[] {
  return PROMPTLANE_MCP_TOOL_REGISTRY.map((tool) => tool.definition.name);
}
