import {
  APPLY_CLARIFICATIONS_TOOL_DEFINITION,
  applyClarificationsTool,
  type ApplyClarificationsToolArguments,
} from "./apply-clarifications-tool.js";
import {
  RECORD_AGENT_RUN_TOOL_DEFINITION,
  RECOMMEND_AGENT_STRATEGY_TOOL_DEFINITION,
  recordAgentRunTool,
  recommendAgentStrategyTool,
} from "./agent-guide-tool.js";
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
  GET_LOOPRELAY_LOOP_STATUS_TOOL_DEFINITION,
  PREPARE_LOOP_BRIEF_TOOL_DEFINITION,
  PROPOSE_INSTRUCTION_PATCH_TOOL_DEFINITION,
  PROPOSE_LOOP_MEMORY_CANDIDATE_TOOL_DEFINITION,
  RECORD_LOOP_MEMORY_TOOL_DEFINITION,
  RECORD_LOOP_OUTCOME_TOOL_DEFINITION,
} from "./loop-tool-definitions.js";
import {
  applyInstructionPatchTool,
  getLoopRelayLoopStatusTool,
  prepareLoopBriefTool,
  proposeInstructionPatchTool,
  proposeLoopMemoryCandidateTool,
  recordLoopMemoryTool,
  recordLoopOutcomeTool,
} from "./loop-tool.js";
import type {
  ApplyInstructionPatchToolArguments,
  GetLoopRelayLoopStatusToolArguments,
  PrepareLoopBriefToolArguments,
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
  RECORD_CONTINUATION_RECEIPT_TOOL_DEFINITION,
  recordContinuationReceiptTool,
  type RecordContinuationReceiptToolArguments,
} from "./continuation-receipt-tool.js";
import {
  COACH_PROMPT_TOOL_DEFINITION,
  GET_LOOPRELAY_STATUS_TOOL_DEFINITION,
  IMPROVE_PROMPT_TOOL_DEFINITION,
  PREPARE_AGENT_JUDGE_BATCH_TOOL_DEFINITION,
  PREPARE_AGENT_REWRITE_TOOL_DEFINITION,
  RECORD_AGENT_JUDGMENTS_TOOL_DEFINITION,
  RECORD_AGENT_REWRITE_TOOL_DEFINITION,
  REVIEW_PROJECT_INSTRUCTIONS_TOOL_DEFINITION,
  SCORE_PROMPT_ARCHIVE_TOOL_DEFINITION,
  SCORE_PROMPT_TOOL_DEFINITION,
} from "./score-tool-definitions.js";
import type { LoopRelayMcpToolDefinition } from "./score-tool-definition-types.js";
import {
  coachPromptTool,
  getLoopRelayStatusTool,
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
  GetLoopRelayStatusToolArguments,
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
import type { LoopRelayMcpServerOptions } from "./server.js";

export type LoopRelayToolHandler = (
  args: Record<string, unknown>,
  options: LoopRelayMcpServerOptions,
) => unknown | Promise<unknown>;

export type RegisteredLoopRelayTool = {
  definition: LoopRelayMcpToolDefinition;
  handler: LoopRelayToolHandler;
};

export const LOOPRELAY_MCP_TOOL_REGISTRY: readonly RegisteredLoopRelayTool[] = [
  {
    definition: GET_LOOPRELAY_STATUS_TOOL_DEFINITION,
    handler: (args, options) =>
      getLoopRelayStatusTool(args as GetLoopRelayStatusToolArguments, options),
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
    definition: RECORD_CONTINUATION_RECEIPT_TOOL_DEFINITION,
    handler: (args, options) =>
      recordContinuationReceiptTool(
        args as RecordContinuationReceiptToolArguments,
        options,
      ),
  },
  {
    definition: GET_LOOPRELAY_LOOP_STATUS_TOOL_DEFINITION,
    handler: (args, options) =>
      getLoopRelayLoopStatusTool(
        args as GetLoopRelayLoopStatusToolArguments,
        options,
      ),
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
    handler: (args, options) =>
      prepareLoopBriefTool(args as PrepareLoopBriefToolArguments, options),
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
      scorePromptArchiveTool(args as ScorePromptArchiveToolArguments, options),
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
      recordAgentRewriteTool(args as RecordAgentRewriteToolArguments, options),
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
  {
    definition: RECOMMEND_AGENT_STRATEGY_TOOL_DEFINITION,
    handler: (args, options) =>
      recommendAgentStrategyTool(
        args as Parameters<typeof recommendAgentStrategyTool>[0],
        options,
      ),
  },
  {
    definition: RECORD_AGENT_RUN_TOOL_DEFINITION,
    handler: (args, options) =>
      recordAgentRunTool(
        args as Parameters<typeof recordAgentRunTool>[0],
        options,
      ),
  },
];

export const LOOPRELAY_MCP_TOOL_DEFINITIONS: readonly LoopRelayMcpToolDefinition[] =
  LOOPRELAY_MCP_TOOL_REGISTRY.map((tool) => tool.definition);

const HANDLERS_BY_NAME = new Map(
  LOOPRELAY_MCP_TOOL_REGISTRY.map((tool) => [
    tool.definition.name,
    tool.handler,
  ]),
);

export function getLoopRelayMcpToolHandler(
  name: string,
): LoopRelayToolHandler | undefined {
  return HANDLERS_BY_NAME.get(name);
}

export function listLoopRelayMcpToolNames(): string[] {
  return LOOPRELAY_MCP_TOOL_REGISTRY.map((tool) => tool.definition.name);
}
