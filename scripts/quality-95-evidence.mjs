#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";

const planPath =
  "docs/superpowers/plans/2026-07-05-promptlane-95-quality-plan.md";
const nativeDialogAuditPath = "docs/NATIVE_DIALOG_DOGFOOD_AUDIT_2026-07-05.md";

const args = parseArgs(process.argv.slice(2));
const uiPatrol = args.uiPatrolJson
  ? readJsonFile(args.uiPatrolJson)
  : runUiPatrolEvidence();
const nativeDialog = readNativeDialogEvidence();
const scorecardAxes = readScorecardAxes();
const completedEvidence = readCompletedEvidence();
const axisCoverage = axisEvidenceCoverage({
  scorecardAxes,
  uiPatrol,
  nativeDialog,
  completedEvidence,
});
const underTargetAxes = scorecardAxes.filter(
  (axis) => axis.status !== "meets_target",
);

const blockers = [];
for (const axis of underTargetAxes) {
  blockers.push({
    id: `scorecard_axis:${axis.id}`,
    status: axis.status,
    next_action: `Raise ${axis.axis} from ${axis.current_level} to ${axis.target_level} with direct evidence.`,
  });
}
if (uiPatrol.status !== "complete") {
  blockers.push({
    id: "scheduled_ui_patrol",
    status: uiPatrol.status,
    next_action:
      "Wait for a real schedule event, then rerun corepack pnpm evidence:ui-patrol.",
  });
}
if (nativeDialog.status !== "complete") {
  blockers.push({
    id: "native_dialog_approved_dogfood",
    status: nativeDialog.status,
    next_action:
      "Get explicit operator approval before running PROMPT_COACH_NATIVE_DIALOG_APPROVED=1 corepack pnpm dogfood:mcp-native-dialog-approved.",
  });
}

const summary = {
  check: "promptlane_95_quality",
  status: blockers.length === 0 ? "complete" : "pending",
  proof_standard:
    "9.5 requires current evidence for every scorecard axis, not only passing tests.",
  plan: planPath,
  scorecard_axes: scorecardAxes,
  axis_evidence_coverage: axisCoverage,
  scorecard_review_candidates: scorecardReviewCandidates(axisCoverage),
  evidence: {
    scheduled_ui_patrol: uiPatrol,
    native_dialog_approved_dogfood: nativeDialog,
  },
  blockers,
  recommended_next_slices: recommendedNextSlices({
    scorecardAxes,
    uiPatrol,
    nativeDialog,
    completedEvidence,
    scorecardReviewCandidates: scorecardReviewCandidates(axisCoverage),
  }),
  next_action:
    blockers.length === 0
      ? "Run the full release gate before claiming the long-running goal complete."
      : "Do not claim 9.5 completion while blockers remain pending.",
};

print(summary);

if (args.requireComplete && summary.status !== "complete") {
  console.error(
    `promptlane_95_quality pending: ${blockers.length} blocker(s) remain; --require-complete refuses to pass.`,
  );
  process.exitCode = 1;
}

function parseArgs(argv) {
  const parsed = { uiPatrolJson: undefined, requireComplete: false };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--ui-patrol-json") {
      parsed.uiPatrolJson = argv[index + 1];
      index += 1;
    } else if (arg === "--require-complete") {
      parsed.requireComplete = true;
    }
  }
  return parsed;
}

function runUiPatrolEvidence() {
  const result = spawnSync(
    process.execPath,
    ["scripts/ui-patrol-evidence.mjs"],
    {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  if (result.status !== 0) {
    return {
      check: "scheduled_ui_patrol",
      status: "unknown_checker_failed",
      next_action: "Run corepack pnpm evidence:ui-patrol and inspect stderr.",
    };
  }
  try {
    return JSON.parse(result.stdout);
  } catch {
    return {
      check: "scheduled_ui_patrol",
      status: "unknown_invalid_checker_output",
      next_action: "Fix scripts/ui-patrol-evidence.mjs JSON output.",
    };
  }
}

function readNativeDialogEvidence() {
  let audit = "";
  try {
    audit = readFileSync(nativeDialogAuditPath, "utf8");
  } catch {
    return {
      check: "native_dialog_approved_dogfood",
      status: "pending_missing_audit",
      audit: nativeDialogAuditPath,
    };
  }

  const approvedAnswered =
    audit.includes("approved native dialog dogfood passed") &&
    audit.includes('interaction_status: "answered"') &&
    audit.includes("PROMPT_COACH_NATIVE_DIALOG_APPROVED=1");

  return {
    check: "native_dialog_approved_dogfood",
    status: approvedAnswered ? "complete" : "pending_operator_approval",
    audit: nativeDialogAuditPath,
    approved_run_required: true,
  };
}

function readScorecardAxes() {
  const plan = readFileSync(planPath, "utf8");
  return plan
    .split("\n")
    .filter((line) => line.startsWith("| ") && line.includes(" | "))
    .filter((line) => !line.includes("Axis | Current level"))
    .filter((line) => !line.includes("---"))
    .map(parseScorecardRow)
    .filter(Boolean);
}

function readCompletedEvidence() {
  let plan = "";
  let localEvidence = "";
  let productEvidence = "";
  let promptlane = "";
  let readme = "";
  let packageJson = "";
  let codexPlugin = "";
  let claudePlugin = "";
  let claudeMarketplace = "";
  let uiPatrolEvidence = "";
  let codexClaudeEvidence = "";
  try {
    plan = readFileSync(planPath, "utf8");
    localEvidence = readFileSync("docs/LOCAL_95_EVIDENCE_2026-07-06.md", "utf8");
    productEvidence = readFileSync(
      "docs/PRODUCT_POSITIONING_EVIDENCE_2026-07-06.md",
      "utf8",
    );
    promptlane = readFileSync("docs/PROMPTLANE.md", "utf8");
    readme = readFileSync("README.md", "utf8");
    packageJson = readFileSync("package.json", "utf8");
    codexPlugin = readFileSync(
      "plugins/prompt-coach/.codex-plugin/plugin.json",
      "utf8",
    );
    claudePlugin = readFileSync(".claude-plugin/plugin.json", "utf8");
    claudeMarketplace = readFileSync(".claude-plugin/marketplace.json", "utf8");
    uiPatrolEvidence = readFileSync(
      "docs/UI_PATROL_EVIDENCE_2026-07-06.md",
      "utf8",
    );
    codexClaudeEvidence = readFileSync(
      "docs/CODEX_CLAUDE_LOCAL_INTEGRATION_EVIDENCE_2026-07-06.md",
      "utf8",
    );
  } catch {
    return {
      product_positioning_metadata_alignment: false,
      manual_ui_patrol_artifact_evidence: false,
      codex_claude_local_integration_evidence: false,
      web_user_flow_current_main_evidence: false,
      privacy_raw_free_regression_sweep: false,
      codex_claude_setup_smoke_refresh: false,
      local_95_evidence_sweep: false,
    };
  }

  return {
    product_positioning_metadata_alignment:
      productEvidence.includes("wlsdks/promptlane") &&
      productEvidence.includes("Prompt improvement is the first value") &&
      productEvidence.includes("Loopdeck is historical or compatibility-only") &&
      productEvidence.includes("GitHub repository metadata") &&
      promptlane.includes("Product name: PromptLane.") &&
      promptlane.includes("PromptLane starts with prompt improvement") &&
      promptlane.includes("Loop features are loop-aware continuation") &&
      readme.includes("Local-first prompt improvement workspace") &&
      readme.includes("loop-aware continuation") &&
      packageJson.includes(
        "PromptLane local-first prompt improvement workspace for Codex, Claude Code, and long-running coding-agent work.",
      ) &&
      codexPlugin.includes('"displayName": "PromptLane"') &&
      codexPlugin.includes("loop-aware continuation") &&
      claudePlugin.includes("PromptLane is a local-first prompt improvement workspace") &&
      claudeMarketplace.includes("PromptLane is a local-first prompt improvement workspace"),
    manual_ui_patrol_artifact_evidence:
      uiPatrolEvidence.includes("workflow_dispatch run `28717406758`") &&
      uiPatrolEvidence.includes("ui-patrol-screenshots") &&
      uiPatrolEvidence.includes("9 png files") &&
      uiPatrolEvidence.includes("Local `corepack pnpm ui-patrol`") &&
      uiPatrolEvidence.includes("pending_no_schedule_run") &&
      uiPatrolEvidence.includes("manual_ui_patrol_artifact_evidence"),
    codex_claude_local_integration_evidence:
      codexClaudeEvidence.includes("corepack pnpm smoke:agent-setup") &&
      codexClaudeEvidence.includes("corepack pnpm smoke:hooks") &&
      codexClaudeEvidence.includes("corepack pnpm smoke:mcp-coach-loop") &&
      codexClaudeEvidence.includes("corepack pnpm smoke:mcp-elicitation") &&
      codexClaudeEvidence.includes("corepack pnpm smoke:mcp-native-dialog") &&
      codexClaudeEvidence.includes("corepack pnpm dogfood:first-coach-loop") &&
      codexClaudeEvidence.includes("corepack pnpm dogfood:loop-memory-approval") &&
      codexClaudeEvidence.includes("native_dialog_approved_dogfood") &&
      codexClaudeEvidence.includes("codex_claude_local_integration_evidence"),
    web_user_flow_current_main_evidence:
      plan.includes("web_user_flow_current_main_evidence") &&
      plan.includes("corepack pnpm dogfood:web-user-flow") &&
      plan.includes("browser e2e passed"),
    privacy_raw_free_regression_sweep:
      plan.includes("privacy_raw_free_regression_sweep") &&
      plan.includes("corepack pnpm test -- src/security src/hooks src/mcp") &&
      plan.includes("108 test files") &&
      plan.includes("833 tests"),
    codex_claude_setup_smoke_refresh:
      plan.includes("codex_claude_setup_smoke_refresh") &&
      plan.includes("corepack pnpm smoke:agent-setup") &&
      plan.includes("prompt-coach agent setup smoke passed"),
    local_95_evidence_sweep:
      plan.includes("docs/LOCAL_95_EVIDENCE_2026-07-06.md") &&
      localEvidence.includes("corepack pnpm smoke:hooks") &&
      localEvidence.includes("hook binary smoke passed") &&
      localEvidence.includes("corepack pnpm smoke:mcp-coach-loop") &&
      localEvidence.includes("mcp coach loop smoke passed") &&
      localEvidence.includes("corepack pnpm dogfood:first-coach-loop") &&
      localEvidence.includes("first coach loop dogfood passed") &&
      localEvidence.includes("corepack pnpm dogfood:loop-memory-approval") &&
      localEvidence.includes("loop memory approval dogfood passed") &&
      localEvidence.includes("corepack pnpm smoke:release") &&
      localEvidence.includes("release smoke passed") &&
      localEvidence.includes("privacy_leak_count: 0") &&
      localEvidence.includes("archive_effectiveness_score: 1"),
  };
}

function axisEvidenceCoverage({
  scorecardAxes,
  uiPatrol,
  nativeDialog,
  completedEvidence,
}) {
  return scorecardAxes.map((axis) => {
    const satisfied = [];
    const remaining = [];

    if (
      axis.id === "product_planning_and_positioning" &&
      completedEvidence.product_positioning_metadata_alignment
    ) {
      satisfied.push("product_positioning_metadata_alignment");
    }
    if (
      axis.id === "web_ui_and_operational_evidence" &&
      completedEvidence.web_user_flow_current_main_evidence
    ) {
      satisfied.push("web_user_flow_current_main_evidence");
    }
    if (
      axis.id === "web_ui_and_operational_evidence" &&
      completedEvidence.manual_ui_patrol_artifact_evidence
    ) {
      satisfied.push("manual_ui_patrol_artifact_evidence");
    }
    if (
      axis.id === "local_first_privacy_boundary" &&
      completedEvidence.privacy_raw_free_regression_sweep
    ) {
      satisfied.push("privacy_raw_free_regression_sweep");
    }
    if (
      axis.id === "codex_and_claude_code_integration" &&
      completedEvidence.codex_claude_setup_smoke_refresh
    ) {
      satisfied.push("codex_claude_setup_smoke_refresh");
    }
    if (
      axis.id === "codex_and_claude_code_integration" &&
      completedEvidence.codex_claude_local_integration_evidence
    ) {
      satisfied.push("codex_claude_local_integration_evidence");
    }
    if (
      [
        "local_first_privacy_boundary",
        "codex_and_claude_code_integration",
        "setup_doctor_and_mcp_smoke",
        "loop_memory_and_continuation",
        "release_stability",
      ].includes(axis.id) &&
      completedEvidence.local_95_evidence_sweep
    ) {
      satisfied.push("local_95_evidence_sweep");
    }

    if (
      axis.id === "web_ui_and_operational_evidence" &&
      uiPatrol.status !== "complete"
    ) {
      remaining.push("scheduled_ui_patrol");
    }
    if (
      axis.id === "codex_and_claude_code_integration" &&
      nativeDialog.status !== "complete"
    ) {
      remaining.push("native_dialog_approved_dogfood");
    }
    if (axis.status !== "meets_target") {
      remaining.push("scorecard_level_below_9_5");
    }

    const hasExternalBlocker =
      remaining.includes("scheduled_ui_patrol") ||
      remaining.includes("native_dialog_approved_dogfood");

    return {
      id: axis.id,
      axis: axis.axis,
      status:
        remaining.length === 0
          ? "complete"
          : hasExternalBlocker
            ? "blocked_external"
            : satisfied.length > 0
              ? "partial"
              : "missing",
      satisfied_evidence: satisfied,
      remaining_evidence: remaining,
    };
  });
}

function scorecardReviewCandidates(axisCoverage) {
  return axisCoverage
    .filter(
      (axis) =>
        axis.satisfied_evidence.length > 0 &&
        axis.remaining_evidence.length === 1 &&
        axis.remaining_evidence[0] === "scorecard_level_below_9_5",
    )
    .map((axis) => ({
      id: axis.id,
      axis: axis.axis,
      required_review: "scorecard_level_below_9_5",
      satisfied_evidence: axis.satisfied_evidence,
    }));
}

function recommendedNextSlices({
  scorecardAxes,
  uiPatrol,
  nativeDialog,
  completedEvidence,
  scorecardReviewCandidates,
}) {
  const axesById = new Map(scorecardAxes.map((axis) => [axis.id, axis]));
  const slices = [];

  if (scorecardReviewCandidates.length > 0) {
    slices.push({
      id: "scorecard_review_candidates",
      axis: "scorecard_review",
      priority: 10,
      blocked_by_external_event: false,
      command: "prompt-coach quality-evidence --json",
      expected_effect:
        "Review axes whose local evidence is present and whose only remaining gap is scorecard_level_below_9_5.",
    });
  }

  if (
    axesById.get("web_ui_and_operational_evidence")?.status !== "meets_target" &&
    !completedEvidence.web_user_flow_current_main_evidence
  ) {
    slices.push({
      id: "web_user_flow_current_main_evidence",
      axis: "web_ui_and_operational_evidence",
      priority: 1,
      blocked_by_external_event: false,
      command: "corepack pnpm dogfood:web-user-flow",
      expected_effect:
        "Refresh real PromptLane web workflow evidence before treating UI quality as current.",
    });
  }

  if (
    axesById.get("local_first_privacy_boundary")?.status !== "meets_target" &&
    !completedEvidence.privacy_raw_free_regression_sweep
  ) {
    slices.push({
      id: "privacy_raw_free_regression_sweep",
      axis: "local_first_privacy_boundary",
      priority: 2,
      blocked_by_external_event: false,
      command: "corepack pnpm test -- src/security src/hooks src/mcp",
      expected_effect:
        "Reconfirm raw-free local-first boundaries across the highest-risk agent surfaces.",
    });
  }

  if (
    axesById.get("codex_and_claude_code_integration")?.status !== "meets_target" &&
    !completedEvidence.codex_claude_setup_smoke_refresh
  ) {
    slices.push({
      id: "codex_claude_setup_smoke_refresh",
      axis: "codex_and_claude_code_integration",
      priority: 3,
      blocked_by_external_event: false,
      command: "corepack pnpm smoke:agent-setup",
      expected_effect:
        "Refresh Codex and Claude Code setup evidence without opening provider CLIs.",
    });
  }

  if (uiPatrol.status !== "complete") {
    slices.push({
      id: "scheduled_ui_patrol_cron_review",
      axis: "web_ui_and_operational_evidence",
      priority: 90,
      blocked_by_external_event: true,
      command: "corepack pnpm evidence:ui-patrol",
      expected_effect:
        "Verify the first real scheduled screenshot artifact after GitHub cron runs.",
    });
  }

  if (nativeDialog.status !== "complete") {
    slices.push({
      id: "native_dialog_operator_dogfood",
      axis: "codex_and_claude_code_integration",
      priority: 100,
      blocked_by_external_event: true,
      command:
        "PROMPT_COACH_NATIVE_DIALOG_APPROVED=1 corepack pnpm dogfood:mcp-native-dialog-approved",
      expected_effect:
        "Prove the real native ask UI handoff only after explicit operator approval.",
    });
  }

  return slices;
}

function parseScorecardRow(line) {
  const cells = line
    .slice(1, -1)
    .split("|")
    .map((cell) => cell.trim());
  if (cells.length < 4) return undefined;
  const [axis, currentLevel, bar, evidence] = cells;
  const currentScore = Number(currentLevel.match(/(?<score>\d+(?:\.\d+)?)\/10/)?.groups?.score);
  const targetLevel = bar.includes("9.5 bar") ? "9.5/10" : "unknown";
  return {
    id: axis
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, ""),
    axis,
    current_level: currentLevel,
    target_level: targetLevel,
    status:
      Number.isFinite(currentScore) && currentScore >= 9.5
        ? "meets_target"
        : "below_target",
    evidence_required: evidence,
  };
}

function readJsonFile(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function print(value) {
  console.log(JSON.stringify(value, null, 2));
}
