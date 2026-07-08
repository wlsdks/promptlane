#!/usr/bin/env node
import { readFileSync } from "node:fs";

const planPath =
  "docs/superpowers/plans/2026-07-05-promptlane-95-quality-plan.md";
const nativeDialogAuditPath = "docs/NATIVE_DIALOG_DOGFOOD_AUDIT_2026-07-05.md";

const args = parseArgs(process.argv.slice(2));
const nativeDialog = readNativeDialogEvidence();
const scorecardAxes = readScorecardAxes();
const completedEvidence = readCompletedEvidence();
const axisCoverage = axisEvidenceCoverage({
  scorecardAxes,
  nativeDialog,
  completedEvidence,
});
const underTargetAxes = scorecardAxes.filter(
  (axis) => axis.status !== "meets_target",
);
const axisCoverageById = new Map(axisCoverage.map((axis) => [axis.id, axis]));

const blockers = [];
for (const axis of underTargetAxes) {
  const remainingEvidence =
    axisCoverageById.get(axis.id)?.remaining_evidence ?? [];
  blockers.push({
    id: `scorecard_axis:${axis.id}`,
    status: axis.status,
    remaining_evidence: remainingEvidence,
    next_action:
      remainingEvidence.length > 0
        ? `Complete remaining evidence for ${axis.axis}: ${remainingEvidence.join(", ")}.`
        : `Raise ${axis.axis} from ${axis.current_level} to ${axis.target_level} with direct evidence.`,
  });
}
if (nativeDialog.status !== "complete") {
  blockers.push({
    id: "native_dialog_approved_dogfood",
    status: nativeDialog.status,
    next_action:
      "Get explicit operator approval before running PROMPTLANE_NATIVE_DIALOG_APPROVED=1 corepack pnpm dogfood:mcp-native-dialog-approved.",
  });
}

const recommendedNextSlicesValue = recommendedNextSlices({
  scorecardAxes,
  nativeDialog,
  completedEvidence,
  scorecardReviewCandidates: scorecardReviewCandidates(axisCoverage),
});
const nextRecheckUtc = nextRecheckUtcFromRecommendations(
  recommendedNextSlicesValue,
);
const releaseGate = [
  {
    command: "corepack pnpm format",
    purpose: "Check formatting before release.",
  },
  {
    command: "corepack pnpm test",
    purpose: "Run the full unit and integration test suite.",
  },
  {
    command: "corepack pnpm lint",
    purpose: "Check static lint rules.",
  },
  {
    command: "corepack pnpm build",
    purpose: "Build CLI, server, web, and packaged runtime assets.",
  },
  {
    command: "corepack pnpm pack:dry-run",
    purpose: "Verify the npm package contents and lifecycle wrapper.",
  },
  {
    command: "corepack pnpm benchmark -- --json",
    purpose: "Verify local benchmark and privacy leak counters.",
  },
  {
    command: "corepack pnpm e2e:browser",
    purpose: "Run the browser user-flow regression path.",
  },
  {
    command: "corepack pnpm smoke:release",
    purpose: "Exercise isolated local release smoke coverage.",
  },
  {
    command: "corepack pnpm evidence:quality -- --require-complete",
    purpose: "Fail closed unless all 9.5 quality evidence remains complete.",
  },
  {
    command: "corepack pnpm promptlane quality-evidence --require-complete",
    purpose:
      "Verify the built product CLI exposes the same complete quality evidence.",
  },
  {
    command: "git diff --check",
    purpose: "Reject whitespace and patch hygiene regressions.",
  },
];

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
    native_dialog_approved_dogfood: nativeDialog,
  },
  blockers,
  recommended_next_slices: recommendedNextSlicesValue,
  release_gate: releaseGate,
  ...(nextRecheckUtc ? { next_recheck_utc: nextRecheckUtc } : {}),
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

function nextRecheckUtcFromRecommendations(recommendations) {
  const timestamps = recommendations
    .map((recommendation) => recommendation.available_after_utc)
    .filter(Boolean)
    .sort();
  return timestamps[0];
}

function parseArgs(argv) {
  const parsed = { requireComplete: false };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--require-complete") {
      parsed.requireComplete = true;
    }
  }
  return parsed;
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
    audit.includes("PROMPTLANE_NATIVE_DIALOG_APPROVED=1");

  return {
    check: "native_dialog_approved_dogfood",
    status: approvedAnswered ? "complete" : "pending_operator_approval",
    audit: nativeDialogAuditPath,
    approved_run_required: true,
    approval_status: approvedAnswered
      ? "operator_approved_answer_recorded"
      : "operator_approval_required",
    preconditions: approvedAnswered
      ? []
      : ["The operator explicitly approves opening a native OS dialog."],
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
  let uiPatrolReadiness = "";
  let codexClaudeEvidence = "";
  let nativeDialogAudit = "";
  try {
    plan = readFileSync(planPath, "utf8");
    localEvidence = readFileSync(
      "docs/LOCAL_95_EVIDENCE_2026-07-06.md",
      "utf8",
    );
    productEvidence = readFileSync(
      "docs/PRODUCT_POSITIONING_EVIDENCE_2026-07-06.md",
      "utf8",
    );
    promptlane = readFileSync("docs/PROMPTLANE.md", "utf8");
    readme = readFileSync("README.md", "utf8");
    packageJson = readFileSync("package.json", "utf8");
    codexPlugin = readFileSync(
      "plugins/promptlane/.codex-plugin/plugin.json",
      "utf8",
    );
    claudePlugin = readFileSync(".claude-plugin/plugin.json", "utf8");
    claudeMarketplace = readFileSync(".claude-plugin/marketplace.json", "utf8");
    uiPatrolEvidence = readFileSync(
      "docs/UI_PATROL_EVIDENCE_2026-07-06.md",
      "utf8",
    );
    uiPatrolReadiness = readFileSync(
      "docs/UI_PATROL_SCHEDULE_READINESS_2026-07-06.md",
      "utf8",
    );
    codexClaudeEvidence = readFileSync(
      "docs/CODEX_CLAUDE_LOCAL_INTEGRATION_EVIDENCE_2026-07-06.md",
      "utf8",
    );
    nativeDialogAudit = readFileSync(nativeDialogAuditPath, "utf8");
  } catch {
    return {
      product_positioning_metadata_alignment: false,
      manual_ui_patrol_artifact_evidence: false,
      local_ui_patrol_evidence: false,
      codex_claude_local_integration_evidence: false,
      native_dialog_preflight: false,
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
      productEvidence.includes(
        "PromptLane is historical or compatibility-only",
      ) &&
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
      claudePlugin.includes(
        "PromptLane is a local-first prompt improvement workspace",
      ) &&
      claudeMarketplace.includes(
        "PromptLane is a local-first prompt improvement workspace",
      ),
    manual_ui_patrol_artifact_evidence:
      uiPatrolEvidence.includes("workflow_dispatch run `28717406758`") &&
      uiPatrolEvidence.includes("ui-patrol-screenshots") &&
      uiPatrolEvidence.includes("9 png files") &&
      uiPatrolEvidence.includes("Local `corepack pnpm ui-patrol`") &&
      uiPatrolEvidence.includes("manual_ui_patrol_artifact_evidence"),
    local_ui_patrol_evidence:
      uiPatrolEvidence.includes("Local `corepack pnpm ui-patrol`") &&
      uiPatrolEvidence.includes("9 png files") &&
      uiPatrolEvidence.includes("dogfood:web-user-flow"),
    codex_claude_local_integration_evidence:
      codexClaudeEvidence.includes("corepack pnpm smoke:agent-setup") &&
      codexClaudeEvidence.includes("corepack pnpm smoke:hooks") &&
      codexClaudeEvidence.includes("corepack pnpm smoke:mcp-coach-loop") &&
      codexClaudeEvidence.includes("corepack pnpm smoke:mcp-elicitation") &&
      codexClaudeEvidence.includes("corepack pnpm smoke:mcp-native-dialog") &&
      codexClaudeEvidence.includes("corepack pnpm dogfood:first-coach-loop") &&
      codexClaudeEvidence.includes(
        "corepack pnpm dogfood:loop-memory-approval",
      ) &&
      codexClaudeEvidence.includes("native_dialog_approved_dogfood") &&
      codexClaudeEvidence.includes("codex_claude_local_integration_evidence"),
    native_dialog_preflight:
      nativeDialogAudit.includes("corepack pnpm smoke:mcp-native-dialog") &&
      nativeDialogAudit.includes("mcp native dialog preflight passed") &&
      nativeDialogAudit.includes("native_dialog_preflight") &&
      nativeDialogAudit.includes("smoke:mcp-elicitation"),
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
      plan.includes("promptlane agent setup smoke passed"),
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
      axis.id === "web_ui_and_operational_evidence" &&
      completedEvidence.local_ui_patrol_evidence
    ) {
      satisfied.push("local_ui_patrol_evidence");
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
      axis.id === "codex_and_claude_code_integration" &&
      completedEvidence.native_dialog_preflight
    ) {
      satisfied.push("native_dialog_preflight");
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
      axis.id === "codex_and_claude_code_integration" &&
      nativeDialog.status !== "complete"
    ) {
      remaining.push("native_dialog_approved_dogfood");
    }
    if (axis.status !== "meets_target") {
      remaining.push("scorecard_level_below_9_5");
    }

    const hasExternalBlocker = remaining.includes(
      "native_dialog_approved_dogfood",
    );

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
      command: "promptlane quality-evidence --json",
      expected_effect:
        "Review axes whose local evidence is present and whose only remaining gap is scorecard_level_below_9_5.",
    });
  }

  if (
    axesById.get("web_ui_and_operational_evidence")?.status !==
      "meets_target" &&
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
    axesById.get("codex_and_claude_code_integration")?.status !==
      "meets_target" &&
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

  if (nativeDialog.status !== "complete") {
    slices.push({
      id: "native_dialog_operator_dogfood",
      axis: "codex_and_claude_code_integration",
      priority: 100,
      blocked_by_external_event: true,
      blocked_reason: "operator_approval_required",
      command:
        "PROMPTLANE_NATIVE_DIALOG_APPROVED=1 corepack pnpm dogfood:mcp-native-dialog-approved",
      preconditions: [
        "The operator explicitly approves opening a native OS dialog.",
      ],
      completion_evidence: [
        'interaction_status: "answered"',
        "approved native dialog dogfood passed",
      ],
      guardrails: [
        "Do not run this command in automated CI or scheduled checks.",
      ],
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
  const currentScore = Number(
    currentLevel.match(/(?<score>\d+(?:\.\d+)?)\/10/)?.groups?.score,
  );
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

function print(value) {
  console.log(JSON.stringify(value, null, 2));
}
