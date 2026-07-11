import type { Command } from "commander";

import {
  recommendAgentStrategy,
  type AgentGuideModel,
  type AgentGuideRole,
  type AgentGuideTaskType,
  type AgentGuideTool,
} from "../../agent-guide/recommendation.js";
import { loadHookAuth, loadLoopRelayConfig } from "../../config/config.js";
import { createProjectKey } from "../../storage/project-id.js";
import { createSqlitePromptStorage } from "../../storage/sqlite.js";

type GuideOptions = {
  dataDir?: string;
  cwd?: string;
  taskType?: AgentGuideTaskType;
  failedAttempts?: string;
  worktrees?: string;
  independentReview?: boolean;
  json?: boolean;
  tool?: AgentGuideTool;
  model?: AgentGuideModel;
  role?: AgentGuideRole;
  outcome?:
    | "unknown"
    | "in_progress"
    | "passed"
    | "failed"
    | "blocked"
    | "abandoned";
  attempts?: string;
  firstValueSeconds?: string;
  focusedTestCount?: string;
  acceptedRecommendation?: boolean;
};

export function registerGuideCommand(program: Command): void {
  const guide = program
    .command("guide")
    .description("Recommend and record local coding-agent model strategy.");
  guide
    .command("next")
    .requiredOption(
      "--task-type <type>",
      "ambiguous_request, planning, implementation, debugging, mechanical, review, or continuation",
    )
    .option("--failed-attempts <count>")
    .option("--worktrees <count>")
    .option("--independent-review")
    .option("--cwd <path>")
    .option("--data-dir <path>")
    .option("--json")
    .action((options: GuideOptions) => console.log(guideNextForCli(options)));
  guide
    .command("record-run")
    .requiredOption("--task-type <type>")
    .requiredOption("--tool <codex|claude-code>")
    .requiredOption("--model <profile>")
    .requiredOption("--role <role>")
    .requiredOption("--outcome <status>")
    .option("--attempts <count>", "Attempts", "1")
    .option("--first-value-seconds <count>")
    .option("--focused-test-count <count>", "Focused tests", "0")
    .option("--accepted-recommendation")
    .option("--cwd <path>")
    .option("--data-dir <path>")
    .option("--json")
    .action((options: GuideOptions) =>
      console.log(recordGuideRunForCli(options)),
    );
}

export function guideNextForCli(options: GuideOptions): string {
  const { storage, projectId } = openStorage(options);
  try {
    const guide = recommendAgentStrategy({
      taskType: requiredTaskType(options.taskType),
      failedAttempts: count(options.failedAttempts),
      worktreeCount: count(options.worktrees),
      requiresIndependentReview: options.independentReview,
      matchingRuns: storage
        .listAgentRuns({
          projectId,
          taskType: requiredTaskType(options.taskType),
        })
        .map((run) => ({ outcomeStatus: run.outcome_status })),
    });
    return options.json
      ? JSON.stringify(guide, null, 2)
      : [
          `Recommended: ${guide.primary.tool} ${guide.primary.model} (${guide.role})`,
          `Alternative: ${guide.alternative.tool} ${guide.alternative.model}`,
          `Why: ${guide.reasons.join(" ")}`,
          `Switch: ${guide.switch_condition}`,
          `Confidence: ${guide.confidence} (${guide.evidence.completed_runs} completed local runs)`,
        ].join("\n");
  } finally {
    storage.close();
  }
}

export function recordGuideRunForCli(options: GuideOptions): string {
  const { storage, projectId } = openStorage(options);
  try {
    const run = storage.recordAgentRun({
      project_id: projectId,
      task_type: requiredTaskType(options.taskType),
      tool: options.tool!,
      model: options.model!,
      role: options.role!,
      outcome_status: options.outcome!,
      accepted_recommendation: options.acceptedRecommendation === true,
      attempts: count(options.attempts) ?? 1,
      first_value_seconds: count(options.firstValueSeconds),
      focused_test_count: count(options.focusedTestCount) ?? 0,
    });
    return options.json
      ? JSON.stringify(run, null, 2)
      : `Recorded agent run ${run.id}: ${run.tool} ${run.model} ${run.outcome_status}.`;
  } finally {
    storage.close();
  }
}

function openStorage(options: GuideOptions) {
  const config = loadLoopRelayConfig(options.dataDir);
  const auth = loadHookAuth(options.dataDir);
  return {
    storage: createSqlitePromptStorage({
      dataDir: config.data_dir,
      hmacSecret: auth.web_session_secret,
    }),
    projectId: createProjectKey(
      options.cwd ?? process.cwd(),
      auth.web_session_secret,
    ),
  };
}
function requiredTaskType(value: string | undefined): AgentGuideTaskType {
  if (
    [
      "ambiguous_request",
      "planning",
      "implementation",
      "debugging",
      "mechanical",
      "review",
      "continuation",
    ].includes(value ?? "")
  )
    return value as AgentGuideTaskType;
  throw new Error("--task-type must be a supported guide task type.");
}
function count(value: string | undefined): number | undefined {
  if (value === undefined) return undefined;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed < 0)
    throw new Error("Guide counts must be non-negative integers.");
  return parsed;
}
