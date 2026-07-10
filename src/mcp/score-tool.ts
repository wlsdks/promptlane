import { analyzePrompt } from "../analysis/analyze.js";
import { createArchiveScoreReport } from "../analysis/archive-score.js";
import { improvePrompt, type PromptImprovement } from "../analysis/improve.js";
import { loadHookAuth, loadPromptLaneConfig } from "../config/config.js";
import type { PromptAnalysisPreview } from "../shared/schema.js";
import { createSqlitePromptStorage } from "../storage/sqlite.js";
import type { PromptEffectiveness, PromptSummary } from "../storage/ports.js";
import { createAgentCoachBrief } from "./coach-brief.js";
import { MCP_FIRST_PROMPT_NEXT_STEP } from "./first-prompt-next-step.js";
import { shouldAskForImprovement } from "./improvement-next-action.js";
import { projectLabel } from "./project-label.js";
import { storageUnavailableMessage } from "./storage-unavailable.js";
export {
  prepareAgentJudgeBatchTool,
  recordAgentJudgmentsTool,
} from "./agent-judge-tool.js";
export {
  prepareAgentRewriteTool,
  recordAgentRewriteTool,
} from "./agent-rewrite-tool.js";
export type {
  PrepareAgentJudgeBatchToolArguments,
  PrepareAgentJudgeBatchToolResult,
  RecordAgentJudgmentsToolArguments,
  RecordAgentJudgmentsToolResult,
} from "./agent-judge-tool-types.js";
export type {
  PrepareAgentRewriteToolArguments,
  PrepareAgentRewriteToolResult,
  RecordAgentRewriteToolArguments,
  RecordAgentRewriteToolResult,
} from "./agent-rewrite-tool-types.js";
import { listPromptLaneMcpToolNames } from "./tool-registry.js";
import type {
  CoachPromptToolArguments,
  CoachPromptToolResult,
  GetPromptLaneStatusToolArguments,
  GetPromptLaneStatusToolResult,
  ImprovePromptToolArguments,
  ImprovePromptToolResult,
  ReviewProjectInstructionsToolArguments,
  ReviewProjectInstructionsToolResult,
  ScorePromptArchiveToolArguments,
  ScorePromptArchiveToolResult,
  ScorePromptToolArguments,
  ScorePromptToolOptions,
  ScorePromptToolResult,
} from "./score-tool-types.js";

export {
  COACH_PROMPT_TOOL_DEFINITION,
  GET_PROMPTLANE_STATUS_TOOL_DEFINITION,
  IMPROVE_PROMPT_TOOL_DEFINITION,
  PREPARE_AGENT_REWRITE_TOOL_DEFINITION,
  PREPARE_AGENT_JUDGE_BATCH_TOOL_DEFINITION,
  RECORD_AGENT_REWRITE_TOOL_DEFINITION,
  RECORD_AGENT_JUDGMENTS_TOOL_DEFINITION,
  REVIEW_PROJECT_INSTRUCTIONS_TOOL_DEFINITION,
  SCORE_PROMPT_ARCHIVE_TOOL_DEFINITION,
  SCORE_PROMPT_TOOL_DEFINITION,
} from "./score-tool-definitions.js";
export {
  PROMPTLANE_MCP_TOOL_DEFINITIONS,
  listPromptLaneMcpToolNames,
} from "./tool-registry.js";

export type {
  CoachPromptToolArguments,
  CoachPromptToolResult,
  GetPromptLaneStatusToolArguments,
  GetPromptLaneStatusToolResult,
  ImprovePromptToolArguments,
  ImprovePromptToolResult,
  ReviewProjectInstructionsToolArguments,
  ReviewProjectInstructionsToolResult,
  ScorePromptArchiveToolArguments,
  ScorePromptArchiveToolResult,
  ScorePromptToolArguments,
  ScorePromptToolOptions,
  ScorePromptToolResult,
} from "./score-tool-types.js";

export function coachPromptTool(
  args: CoachPromptToolArguments,
  options: ScorePromptToolOptions = {},
): CoachPromptToolResult {
  const generatedAt = (options.now ?? new Date()).toISOString();
  const status = getPromptLaneStatusTool({}, options);
  const includeLatestScore = args.include_latest_score !== false;
  const includeImprovement = args.include_improvement !== false;
  const includeArchive = args.include_archive !== false;
  const includeProjectRules = args.include_project_rules !== false;
  const latestScore =
    includeLatestScore && status.status === "ready"
      ? scorePromptTool({ latest: true, include_suggestions: true }, options)
      : undefined;
  const improvement =
    includeImprovement && status.status === "ready"
      ? improvePromptTool({ latest: true, language: args.language }, options)
      : undefined;
  const archive =
    includeArchive && status.status === "ready"
      ? scorePromptArchiveTool(
          {
            max_prompts: args.max_prompts ?? 200,
            low_score_limit: args.low_score_limit ?? 8,
            language: args.language,
          },
          options,
        )
      : undefined;
  const projectRules =
    includeProjectRules && status.status === "ready"
      ? reviewProjectInstructionsTool(
          { latest: true, analyze: true, include_suggestions: true },
          options,
        )
      : undefined;

  return {
    mode: "agent_coach",
    generated_at: generatedAt,
    status,
    ...(latestScore ? { latest_score: latestScore } : {}),
    ...(improvement ? { improvement } : {}),
    ...(archive ? { archive } : {}),
    ...(projectRules ? { project_rules: projectRules } : {}),
    agent_brief: createAgentCoachBrief({
      status,
      latestScore,
      improvement,
      archive,
      projectRules,
    }),
    privacy: {
      local_only: true,
      external_calls: false,
      returns_prompt_bodies: false,
      returns_raw_paths: false,
      returns_instruction_file_bodies: false,
      auto_submits: false,
    },
  };
}

export function scorePromptTool(
  args: ScorePromptToolArguments,
  options: ScorePromptToolOptions = {},
): ScorePromptToolResult {
  const inputCount = [args.prompt, args.prompt_id, args.latest === true].filter(
    Boolean,
  ).length;

  if (inputCount !== 1) {
    return toolError(
      "invalid_input",
      "Provide exactly one of `prompt`, `prompt_id`, or `latest: true`.",
    );
  }

  if (args.prompt !== undefined) {
    const prompt = args.prompt.trim();
    if (!prompt) {
      return toolError("invalid_input", "`prompt` must not be empty.");
    }

    return toToolResult({
      source: "text",
      analysis: analyzePrompt({
        prompt,
        createdAt: (options.now ?? new Date()).toISOString(),
      }),
      includeSuggestions: args.include_suggestions !== false,
    });
  }

  return withStoredPrompt(args, options);
}

export function improvePromptTool(
  args: ImprovePromptToolArguments,
  options: ScorePromptToolOptions = {},
): ImprovePromptToolResult {
  const inputCount = [args.prompt, args.prompt_id, args.latest === true].filter(
    Boolean,
  ).length;

  if (inputCount !== 1) {
    return improvementToolError(
      "invalid_input",
      "Provide exactly one of `prompt`, `prompt_id`, or `latest: true`.",
    );
  }

  if (args.prompt !== undefined) {
    const prompt = args.prompt.trim();
    if (!prompt) {
      return improvementToolError(
        "invalid_input",
        "`prompt` must not be empty.",
      );
    }

    return toImprovementToolResult({
      source: "text",
      decisionPrompt: prompt,
      improvement: improvePrompt({
        prompt,
        createdAt: (options.now ?? new Date()).toISOString(),
        language: args.language,
      }),
    });
  }

  return withStoredPromptImprovement(args, options);
}

export function scorePromptArchiveTool(
  args: ScorePromptArchiveToolArguments,
  options: ScorePromptToolOptions = {},
): ScorePromptArchiveToolResult {
  try {
    const config = loadPromptLaneConfig(options.dataDir);
    const auth = loadHookAuth(options.dataDir);
    const storage = createSqlitePromptStorage({
      dataDir: config.data_dir,
      hmacSecret: auth.web_session_secret,
    });

    try {
      return createArchiveScoreReport(
        storage,
        {
          maxPrompts: args.max_prompts,
          lowScoreLimit: args.low_score_limit,
          tool: args.tool,
          cwdPrefix: args.cwd_prefix,
          receivedFrom: args.received_from,
          receivedTo: args.received_to,
          language: args.language,
        },
        options.now,
      );
    } finally {
      storage.close();
    }
  } catch (error) {
    return {
      is_error: true,
      error_code: "storage_unavailable",
      message: storageUnavailableMessage(error),
    };
  }
}

export function getPromptLaneStatusTool(
  args: GetPromptLaneStatusToolArguments,
  options: ScorePromptToolOptions = {},
): GetPromptLaneStatusToolResult {
  const privacy = {
    local_only: true,
    external_calls: false,
    returns_prompt_bodies: false,
    returns_raw_paths: false,
  } as const;

  try {
    const config = loadPromptLaneConfig(options.dataDir);
    const auth = loadHookAuth(options.dataDir);
    const storage = createSqlitePromptStorage({
      dataDir: config.data_dir,
      hmacSecret: auth.web_session_secret,
    });

    try {
      const dashboard = storage.getQualityDashboard();
      const projects = storage.listProjects();
      const latest =
        args.include_latest === false
          ? undefined
          : storage.listPrompts({ limit: 1 }).items[0];

      return {
        status: dashboard.total_prompts > 0 ? "ready" : "empty",
        total_prompts: dashboard.total_prompts,
        scored_prompts: dashboard.quality_score.scored_prompts,
        sensitive_prompts: dashboard.sensitive_prompts,
        project_count: projects.items.length,
        ...(latest ? { latest_prompt: toSafeLatestPrompt(latest) } : {}),
        available_tools: availableMcpToolNames(),
        next_actions:
          dashboard.total_prompts > 0
            ? [
                "Use score_prompt with latest=true to evaluate the latest captured prompt.",
                "Use improve_prompt with latest=true to generate an approval-ready rewritten request.",
                "Use prepare_agent_rewrite, then record_agent_rewrite, when the user explicitly asks the active Claude Code/Codex session to semantically improve a stored prompt.",
                "Use score_prompt_archive to review accumulated prompt habits.",
                "Use prepare_agent_judge_batch, then record_agent_judgments, when the user explicitly asks the active Claude Code/Codex session to judge stored prompts.",
                "Use review_project_instructions to check AGENTS.md/CLAUDE.md quality for a captured project.",
              ]
            : [
                MCP_FIRST_PROMPT_NEXT_STEP,
                "Run promptlane setup --profile coach --register-mcp if hooks or MCP registration are not installed yet.",
              ],
        privacy,
      };
    } finally {
      storage.close();
    }
  } catch {
    return {
      status: "setup_needed",
      total_prompts: 0,
      scored_prompts: 0,
      sensitive_prompts: 0,
      project_count: 0,
      available_tools: availableMcpToolNames(),
      next_actions: [
        "Run promptlane setup --profile coach --register-mcp before using archive-backed MCP tools.",
        MCP_FIRST_PROMPT_NEXT_STEP,
        "For custom storage, initialize it with promptlane init --data-dir <path> and pass the same --data-dir to the MCP server.",
      ],
      privacy,
    };
  }
}

export function reviewProjectInstructionsTool(
  args: ReviewProjectInstructionsToolArguments,
  options: ScorePromptToolOptions = {},
): ReviewProjectInstructionsToolResult {
  if (args.project_id && args.latest === true) {
    return projectInstructionToolError(
      "invalid_input",
      "Provide either `project_id` or `latest: true`, not both.",
    );
  }

  try {
    const config = loadPromptLaneConfig(options.dataDir);
    const auth = loadHookAuth(options.dataDir);
    const storage = createSqlitePromptStorage({
      dataDir: config.data_dir,
      hmacSecret: auth.web_session_secret,
    });

    try {
      const project = args.project_id
        ? storage
            .listProjects()
            .items.find((item) => item.project_id === args.project_id)
        : storage.listProjects().items[0];

      if (!project) {
        return projectInstructionToolError(
          "not_found",
          "No stored project is available to review. Capture at least one prompt first.",
        );
      }

      const shouldAnalyze = args.analyze !== false;
      const review = shouldAnalyze
        ? storage.analyzeProjectInstructions(project.project_id)
        : storage.getProjectInstructionReview(project.project_id);

      if (!review) {
        return projectInstructionToolError(
          "not_found",
          `Project instruction review is not available for project_id: ${project.project_id}.`,
        );
      }

      const missingOrWeak = review.checklist.filter(
        (item) => item.status !== "good",
      );
      const nextItem = missingOrWeak[0];

      return {
        source: args.project_id ? "project_id" : "latest",
        project_id: project.project_id,
        project_label: project.label,
        generated_fresh: shouldAnalyze,
        review,
        ...(args.include_suggestions === false
          ? {}
          : { suggestions: review.suggestions }),
        next_action: nextItem
          ? (nextItem.suggestion ??
            `Improve the ${nextItem.label.toLowerCase()} section.`)
          : "Project instruction files cover the core agent workflow. Keep them updated when verification or privacy rules change.",
        privacy: review.privacy,
      };
    } finally {
      storage.close();
    }
  } catch (error) {
    return projectInstructionToolError(
      "storage_unavailable",
      storageUnavailableMessage(error),
    );
  }
}

function withStoredPrompt(
  args: ScorePromptToolArguments,
  options: ScorePromptToolOptions,
): ScorePromptToolResult {
  try {
    const config = loadPromptLaneConfig(options.dataDir);
    const auth = loadHookAuth(options.dataDir);
    const storage = createSqlitePromptStorage({
      dataDir: config.data_dir,
      hmacSecret: auth.web_session_secret,
    });

    try {
      const id =
        args.prompt_id ??
        (args.latest === true
          ? storage.listPrompts({ limit: 1 }).items[0]?.id
          : undefined);

      if (!id) {
        return toolError(
          "not_found",
          "No stored prompt is available to score. Capture a Claude Code or Codex prompt first, or call score_prompt with a `prompt` text argument to score text directly.",
        );
      }

      const prompt = storage.getPrompt(id);
      if (!prompt?.analysis) {
        return toolError(
          "not_found",
          `Prompt not found or not analyzed: ${id}. Run get_promptlane_status to confirm the archive state, or pass a \`prompt\` text argument instead.`,
        );
      }

      return toToolResult({
        source: args.latest === true ? "latest" : "prompt_id",
        promptId: id,
        analysis: prompt.analysis,
        effectiveness: prompt.effectiveness,
        includeSuggestions: args.include_suggestions !== false,
      });
    } finally {
      storage.close();
    }
  } catch (error) {
    return toolError("storage_unavailable", storageUnavailableMessage(error));
  }
}

function toToolResult(input: {
  source: "text" | "prompt_id" | "latest";
  promptId?: string;
  analysis: PromptAnalysisPreview;
  effectiveness?: PromptEffectiveness;
  includeSuggestions: boolean;
}): ScorePromptToolResult {
  const breakdownByKey = new Map(
    input.analysis.quality_score.breakdown.map((item) => [item.key, item]),
  );

  return {
    source: input.source,
    ...(input.promptId ? { prompt_id: input.promptId } : {}),
    quality_score: input.analysis.quality_score,
    checklist: input.analysis.checklist.map((item) => {
      const score = breakdownByKey.get(item.key);
      return {
        ...item,
        weight: score?.weight ?? 0,
        earned: score?.earned ?? 0,
      };
    }),
    ...(input.analysis.redaction_notice
      ? { redaction_notice: input.analysis.redaction_notice }
      : {}),
    analyzer: input.analysis.analyzer,
    ...(input.effectiveness ? { effectiveness: input.effectiveness } : {}),
    privacy: {
      local_only: true,
      stores_input: false,
      external_calls: false,
      returns_prompt_body: false,
    },
  };
}

function toSafeLatestPrompt(prompt: PromptSummary) {
  return {
    id: prompt.id,
    tool: prompt.tool,
    project: projectLabel(prompt.cwd),
    received_at: prompt.received_at,
    quality_score: prompt.quality_score,
    quality_score_band: prompt.quality_score_band,
    is_sensitive: prompt.is_sensitive,
  };
}

function availableMcpToolNames(): string[] {
  return listPromptLaneMcpToolNames();
}

function withStoredPromptImprovement(
  args: ImprovePromptToolArguments,
  options: ScorePromptToolOptions,
): ImprovePromptToolResult {
  try {
    const config = loadPromptLaneConfig(options.dataDir);
    const auth = loadHookAuth(options.dataDir);
    const storage = createSqlitePromptStorage({
      dataDir: config.data_dir,
      hmacSecret: auth.web_session_secret,
    });

    try {
      const id =
        args.prompt_id ??
        (args.latest === true
          ? storage.listPrompts({ limit: 1 }).items[0]?.id
          : undefined);

      if (!id) {
        return improvementToolError(
          "not_found",
          "No stored prompt is available to improve. Capture a Claude Code or Codex prompt first, or call improve_prompt with a `prompt` text argument to rewrite text directly.",
        );
      }

      const prompt = storage.getPrompt(id);
      if (!prompt?.analysis) {
        return improvementToolError(
          "not_found",
          `Prompt not found or not analyzed: ${id}. Run get_promptlane_status to confirm the archive state, or pass a \`prompt\` text argument instead.`,
        );
      }

      return toImprovementToolResult({
        source: args.latest === true ? "latest" : "prompt_id",
        promptId: id,
        decisionPrompt: prompt.snippet,
        improvement: improvePrompt({
          prompt: prompt.markdown,
          createdAt: (options.now ?? new Date()).toISOString(),
          language: args.language,
          source: "stored",
        }),
        rewriteSource: "redacted_stored_prompt",
      });
    } finally {
      storage.close();
    }
  } catch (error) {
    return improvementToolError(
      "storage_unavailable",
      storageUnavailableMessage(error),
    );
  }
}

function toImprovementToolResult(input: {
  source: "text" | "prompt_id" | "latest";
  promptId?: string;
  decisionPrompt?: string;
  improvement: PromptImprovement;
  rewriteSource?: "direct_prompt" | "redacted_stored_prompt";
}): ImprovePromptToolResult {
  const hasQuestions = shouldAskForImprovement(input.improvement, {
    decisionPrompt: input.decisionPrompt,
    now: new Date(input.improvement.created_at),
  });
  const nextAction = hasQuestions
    ? "Ask the user the listed clarifying_questions through the agent's native ask UI before producing or submitting any rewrite. Wait for the user's own answers; do not guess on their behalf."
    : "Review the draft, copy it manually, and resubmit it only after user approval.";

  return {
    ...input.improvement,
    source: input.source,
    ...(input.promptId ? { prompt_id: input.promptId } : {}),
    rewrite_source: input.rewriteSource ?? "direct_prompt",
    improved_prompt: removeOriginalPromptSection(
      input.improvement.improved_prompt,
    ),
    next_action: nextAction,
    privacy: {
      local_only: true,
      stores_input: false,
      external_calls: false,
      returns_stored_prompt_body: false,
    },
  };
}

function removeOriginalPromptSection(draft: string): string {
  return draft
    .replace(/\n## Original prompt\n[\s\S]*$/u, "")
    .replace(/\n## 원문\n[\s\S]*$/u, "")
    .trim();
}

function toolError(
  errorCode: ScorePromptToolResult extends infer TResult
    ? TResult extends { error_code: infer TCode }
      ? TCode
      : never
    : never,
  message: string,
): ScorePromptToolResult {
  return {
    is_error: true,
    error_code: errorCode,
    message,
  };
}

function improvementToolError(
  errorCode: ImprovePromptToolResult extends infer TResult
    ? TResult extends { error_code: infer TCode }
      ? TCode
      : never
    : never,
  message: string,
): ImprovePromptToolResult {
  return {
    is_error: true,
    error_code: errorCode,
    message,
  };
}

function projectInstructionToolError(
  errorCode: ReviewProjectInstructionsToolResult extends infer TResult
    ? TResult extends { error_code: infer TCode }
      ? TCode
      : never
    : never,
  message: string,
): ReviewProjectInstructionsToolResult {
  return {
    is_error: true,
    error_code: errorCode,
    message,
  };
}
