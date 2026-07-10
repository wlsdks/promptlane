import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import type { Command } from "commander";

import { UserError } from "../user-error.js";
import {
  defaultDoctorRunner,
  parseRuntimeTool,
  readRuntimeEvidence,
  type DoctorRunner,
  type RuntimeEvidence,
} from "./quality-evidence-runtime.js";

type QualityEvidenceCliOptions = {
  json?: boolean;
  operatorBrief?: boolean;
  requireComplete?: boolean;
  runtimeTool?: string;
  requireRuntimeReady?: boolean;
  doctorRunner?: DoctorRunner;
};

type QualityEvidenceSummary = {
  check: string;
  status: string;
  evidence_scope: string;
  live_runtime_evaluated: boolean;
  runtime_evidence?: RuntimeEvidence;
  next_recheck_utc?: string;
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
  blockers: Array<{
    id: string;
    status: string;
    remaining_evidence?: string[];
    next_action?: string;
  }>;
  recommended_next_slices?: Array<{
    id: string;
    priority: number;
    blocked_by_external_event: boolean;
    command: string;
    preconditions?: string[];
    completion_evidence?: string[];
    guardrails?: string[];
    blocked_reason?: string;
    available_after_utc?: string;
    expected_effect: string;
  }>;
  release_gate?: Array<{
    command: string;
    purpose: string;
  }>;
  release_warnings?: Array<{
    label: string;
    detail: string;
  }>;
  evidence?: {
    native_dialog_approved_dogfood?: {
      status: string;
      approved_run_required?: boolean;
      approval_status?: string;
      preconditions?: string[];
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
      "--operator-brief",
      "Print the focused operator brief for the approval-gated native dialog dogfood.",
    )
    .option(
      "--require-complete",
      "Exit with an error while the 9.5 quality evidence is still pending.",
    )
    .option(
      "--runtime-tool <tool>",
      "Include live doctor evidence for codex or claude-code.",
    )
    .option(
      "--require-runtime-ready",
      "Exit with an error unless the selected live runtime is ready.",
    )
    .action((options: QualityEvidenceCliOptions) => {
      console.log(qualityEvidenceForCli(options));
    });
}

export function qualityEvidenceForCli(
  options: QualityEvidenceCliOptions = {},
): string {
  const runtimeTool = parseRuntimeTool(options.runtimeTool);
  if (options.requireRuntimeReady && !runtimeTool) {
    throw new UserError(
      "--require-runtime-ready requires --runtime-tool codex or --runtime-tool claude-code.",
    );
  }
  const result = runQualityEvidenceScript(options);
  const summary = JSON.parse(result.stdout) as QualityEvidenceSummary;

  if (runtimeTool) {
    const runtimeEvidence = readRuntimeEvidence(
      runtimeTool,
      options.doctorRunner ?? defaultDoctorRunner,
    );
    summary.live_runtime_evaluated = true;
    summary.runtime_evidence = runtimeEvidence;
    summary.release_warnings = (summary.release_warnings ?? []).filter(
      (warning) => warning.label !== "live agent runtime not evaluated",
    );
    if (runtimeEvidence.status !== "ready") {
      summary.release_warnings.push({
        label: `live ${runtimeTool} runtime ${runtimeEvidence.status}`,
        detail: `The installed ${runtimeTool} runtime is ${runtimeEvidence.ingest_state}; do not claim live integration readiness until promptlane doctor ${runtimeTool} reports ready.`,
      });
    }
    if (options.requireRuntimeReady && runtimeEvidence.status !== "ready") {
      throw new UserError(
        `live ${runtimeTool} runtime is ${runtimeEvidence.status}; send one new ${runtimeTool} prompt, rerun doctor, and require recent ready evidence.`,
      );
    }
  }

  if (options.requireComplete && result.status !== 0) {
    throw new UserError(
      result.stderr.trim() ||
        "promptlane_95_quality pending; --require-complete refuses to pass.",
    );
  }

  if (options.json) return JSON.stringify(summary, null, 2);
  if (options.operatorBrief) return formatOperatorBrief(summary);
  return formatSummary(summary);
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
      ? summary.blockers.flatMap((blocker) => [
          `- ${blocker.id}: ${blocker.status}`,
          ...(blocker.remaining_evidence &&
          blocker.remaining_evidence.length > 0
            ? [`  remaining_evidence=${blocker.remaining_evidence.join(",")}`]
            : []),
          ...(blocker.next_action
            ? [`  next_action=${blocker.next_action}`]
            : []),
        ])
      : ["- none"];
  const recommendedRows =
    summary.recommended_next_slices &&
    summary.recommended_next_slices.length > 0
      ? summary.recommended_next_slices.flatMap((slice) => [
          `- ${slice.priority}. ${slice.id} (external event: ${slice.blocked_by_external_event ? "yes" : "no"}) ${slice.command} - ${slice.expected_effect}`,
          ...(slice.blocked_reason
            ? [`  blocked_reason=${slice.blocked_reason}`]
            : []),
          ...(slice.available_after_utc
            ? [`  available_after_utc=${slice.available_after_utc}`]
            : []),
          ...(slice.preconditions && slice.preconditions.length > 0
            ? [`  preconditions=${slice.preconditions.join("; ")}`]
            : []),
          ...(slice.completion_evidence && slice.completion_evidence.length > 0
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
  const releaseGateRows =
    summary.release_gate && summary.release_gate.length > 0
      ? summary.release_gate.map(
          (step) => `- ${step.command} - ${step.purpose}`,
        )
      : ["- none"];
  const releaseWarningRows =
    summary.release_warnings && summary.release_warnings.length > 0
      ? summary.release_warnings.map(
          (warning) => `- ${warning.label}: ${warning.detail}`,
        )
      : ["- none"];

  return [
    "PromptLane 9.5 quality evidence",
    `Status: ${summary.status}`,
    `Evidence scope: ${summary.evidence_scope}`,
    `Live runtime evaluated: ${summary.live_runtime_evaluated ? "yes" : "no"}`,
    ...(summary.next_recheck_utc
      ? [`Next recheck UTC: ${summary.next_recheck_utc}`]
      : []),
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
    "Live runtime evidence",
    ...formatRuntimeEvidenceRows(summary.runtime_evidence),
    "",
    "Recommended next slices",
    ...recommendedRows,
    "",
    "Release warnings",
    ...releaseWarningRows,
    "",
    "Release gate",
    ...releaseGateRows,
    "",
    `Next action: ${summary.next_action}`,
    "",
    "Privacy: local-only, no external calls, no prompt bodies, no raw paths.",
  ].join("\n");
}

function formatRuntimeEvidenceRows(
  runtime: RuntimeEvidence | undefined,
): string[] {
  if (!runtime) return ["- not evaluated"];
  return [
    `- ${runtime.tool}: ${runtime.status} ingest=${runtime.ingest_state} verified=${runtime.verified ? "yes" : "no"}`,
    ...(runtime.age_seconds !== undefined
      ? [`  age_seconds=${runtime.age_seconds}`]
      : []),
    ...(runtime.next_action ? [`  next_action=${runtime.next_action}`] : []),
  ];
}

function formatExternalEvidenceRows(summary: QualityEvidenceSummary): string[] {
  const rows: string[] = [];
  const nativeDialog = summary.evidence?.native_dialog_approved_dogfood;
  if (nativeDialog) {
    rows.push(
      `- native_dialog_approved_dogfood: ${nativeDialog.status} approved_run_required=${nativeDialog.approved_run_required ? "yes" : "no"}`,
      ...(nativeDialog.approval_status
        ? [`  approval_status=${nativeDialog.approval_status}`]
        : []),
      ...(nativeDialog.preconditions && nativeDialog.preconditions.length > 0
        ? [`  preconditions=${nativeDialog.preconditions.join("; ")}`]
        : []),
    );
  }

  return rows.length > 0 ? rows : ["- none"];
}

function formatOperatorBrief(summary: QualityEvidenceSummary): string {
  const nativeDialog = summary.evidence?.native_dialog_approved_dogfood;
  const slice = summary.recommended_next_slices?.find(
    (candidate) => candidate.id === "native_dialog_operator_dogfood",
  );
  const evidenceComplete = nativeDialog?.status === "complete";

  return [
    "PromptLane native dialog operator brief",
    `Status: ${nativeDialog?.status ?? "unknown"}`,
    ...(nativeDialog?.approval_status
      ? [`approval_status=${nativeDialog.approval_status}`]
      : []),
    ...(evidenceComplete
      ? [
          "Operator action: none; approved native dialog evidence is already recorded.",
          "Completion record: docs/NATIVE_DIALOG_DOGFOOD_AUDIT_2026-07-05.md",
        ]
      : []),
    ...(slice?.command ? [`Command: ${slice.command}`] : []),
    "Refusal preflight: corepack pnpm dogfood:mcp-native-dialog-refusal",
    "Expected refusal: command refuses before opening a native dialog unless PROMPTLANE_NATIVE_DIALOG_APPROVED=1 is set.",
    ...(slice?.preconditions && slice.preconditions.length > 0
      ? [`Preconditions: ${slice.preconditions.join("; ")}`]
      : []),
    ...(slice?.completion_evidence && slice.completion_evidence.length > 0
      ? [`Completion evidence: ${slice.completion_evidence.join("; ")}`]
      : []),
    ...(slice?.guardrails && slice.guardrails.length > 0
      ? [`Guardrails: ${slice.guardrails.join("; ")}`]
      : []),
    "Result boundary: This brief does not run the native dialog dogfood.",
    "Privacy: local-only, no external calls, no prompt bodies, no raw paths.",
  ].join("\n");
}
