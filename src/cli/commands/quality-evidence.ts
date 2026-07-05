import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import type { Command } from "commander";

import { UserError } from "../user-error.js";

type QualityEvidenceCliOptions = {
  json?: boolean;
  requireComplete?: boolean;
};

type QualityEvidenceSummary = {
  check: string;
  status: string;
  scorecard_axes: unknown[];
  axis_evidence_coverage?: Array<{
    id: string;
    status: string;
    satisfied_evidence: string[];
    remaining_evidence: string[];
  }>;
  scorecard_review_candidates?: Array<{
    id: string;
    required_review: string;
    satisfied_evidence: string[];
  }>;
  blockers: Array<{ id: string; status: string; next_action?: string }>;
  recommended_next_slices?: Array<{
    id: string;
    priority: number;
    blocked_by_external_event: boolean;
    command: string;
    preconditions?: string[];
    completion_evidence?: string[];
    guardrails?: string[];
    expected_effect: string;
  }>;
  evidence?: {
    scheduled_ui_patrol?: {
      status: string;
      workflow?: string;
      schedule_cron?: string;
      next_expected_schedule_utc?: string;
    };
    native_dialog_approved_dogfood?: {
      status: string;
      approved_run_required?: boolean;
    };
  };
  next_action: string;
};

export function registerQualityEvidenceCommand(program: Command): void {
  program
    .command("quality-evidence")
    .description("Report PromptLane 9.5 quality evidence and blockers.")
    .option("--json", "Print JSON.")
    .option(
      "--require-complete",
      "Exit with an error while the 9.5 quality evidence is still pending.",
    )
    .action((options: QualityEvidenceCliOptions) => {
      console.log(qualityEvidenceForCli(options));
    });
}

export function qualityEvidenceForCli(
  options: QualityEvidenceCliOptions = {},
): string {
  const result = runQualityEvidenceScript(options);
  const summary = JSON.parse(result.stdout) as QualityEvidenceSummary;

  if (options.requireComplete && result.status !== 0) {
    throw new UserError(
      result.stderr.trim() ||
        "promptlane_95_quality pending; --require-complete refuses to pass.",
    );
  }

  return options.json ? JSON.stringify(summary, null, 2) : formatSummary(summary);
}

function runQualityEvidenceScript(options: QualityEvidenceCliOptions): {
  status: number;
  stdout: string;
  stderr: string;
} {
  const args = [qualityEvidenceScriptPath()];
  if (options.requireComplete) {
    args.push("--require-complete");
  }
  const result = spawnSync(process.execPath, args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });

  if (!result.stdout.trim()) {
    throw new UserError(
      result.stderr.trim() || "Unable to read PromptLane quality evidence.",
    );
  }

  return {
    status: result.status ?? 1,
    stdout: result.stdout,
    stderr: result.stderr,
  };
}

function qualityEvidenceScriptPath(): string {
  return fileURLToPath(
    new URL("../../../scripts/quality-95-evidence.mjs", import.meta.url),
  );
}

function formatSummary(summary: QualityEvidenceSummary): string {
  const blockerRows =
    summary.blockers.length > 0
      ? summary.blockers.map(
          (blocker) => `- ${blocker.id}: ${blocker.status}`,
        )
      : ["- none"];
  const recommendedRows =
    summary.recommended_next_slices && summary.recommended_next_slices.length > 0
      ? summary.recommended_next_slices.flatMap((slice) => [
          `- ${slice.priority}. ${slice.id} (external event: ${slice.blocked_by_external_event ? "yes" : "no"}) ${slice.command} - ${slice.expected_effect}`,
          ...(slice.preconditions && slice.preconditions.length > 0
            ? [`  preconditions=${slice.preconditions.join("; ")}`]
            : []),
          ...(slice.completion_evidence &&
          slice.completion_evidence.length > 0
            ? [`  completion=${slice.completion_evidence.join("; ")}`]
            : []),
          ...(slice.guardrails && slice.guardrails.length > 0
            ? [`  guardrails=${slice.guardrails.join("; ")}`]
            : []),
        ])
      : ["- none"];
  const axisCoverageRows =
    summary.axis_evidence_coverage && summary.axis_evidence_coverage.length > 0
      ? summary.axis_evidence_coverage.map(
          (axis) =>
            `- ${axis.id}: ${axis.status} satisfied=${axis.satisfied_evidence.join(",") || "none"} remaining=${axis.remaining_evidence.join(",") || "none"}`,
        )
      : ["- none"];
  const scorecardReviewRows =
    summary.scorecard_review_candidates &&
    summary.scorecard_review_candidates.length > 0
      ? summary.scorecard_review_candidates.map(
          (axis) =>
            `- ${axis.id}: review=${axis.required_review} satisfied=${axis.satisfied_evidence.join(",") || "none"}`,
        )
      : ["- none"];
  const externalEvidenceRows = formatExternalEvidenceRows(summary);

  return [
    "PromptLane 9.5 quality evidence",
    `Status: ${summary.status}`,
    `Scorecard axes: ${summary.scorecard_axes.length}`,
    `Blockers: ${summary.blockers.length}`,
    "",
    "Blockers",
    ...blockerRows,
    "",
    "Axis evidence coverage",
    ...axisCoverageRows,
    "",
    "Scorecard review candidates",
    ...scorecardReviewRows,
    "",
    "External evidence status",
    ...externalEvidenceRows,
    "",
    "Recommended next slices",
    ...recommendedRows,
    "",
    `Next action: ${summary.next_action}`,
    "",
    "Privacy: local-only, no external calls, no prompt bodies, no raw paths.",
  ].join("\n");
}

function formatExternalEvidenceRows(summary: QualityEvidenceSummary): string[] {
  const rows: string[] = [];
  const scheduled = summary.evidence?.scheduled_ui_patrol;
  if (scheduled) {
    rows.push(
      `- scheduled_ui_patrol: ${scheduled.status} workflow=${scheduled.workflow ?? "unknown"} cron=${scheduled.schedule_cron ?? "unknown"}`,
    );
    if (scheduled.next_expected_schedule_utc) {
      rows.push(
        `  next_expected_schedule_utc=${scheduled.next_expected_schedule_utc}`,
      );
    }
  }

  const nativeDialog = summary.evidence?.native_dialog_approved_dogfood;
  if (nativeDialog) {
    rows.push(
      `- native_dialog_approved_dogfood: ${nativeDialog.status} approved_run_required=${nativeDialog.approved_run_required ? "yes" : "no"}`,
    );
  }

  return rows.length > 0 ? rows : ["- none"];
}
