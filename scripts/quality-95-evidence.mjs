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

print({
  check: "promptlane_95_quality",
  status: blockers.length === 0 ? "complete" : "pending",
  proof_standard:
    "9.5 requires current evidence for every scorecard axis, not only passing tests.",
  plan: planPath,
  scorecard_axes: scorecardAxes,
  evidence: {
    scheduled_ui_patrol: uiPatrol,
    native_dialog_approved_dogfood: nativeDialog,
  },
  blockers,
  next_action:
    blockers.length === 0
      ? "Run the full release gate before claiming the long-running goal complete."
      : "Do not claim 9.5 completion while blockers remain pending.",
});

function parseArgs(argv) {
  const parsed = { uiPatrolJson: undefined };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--ui-patrol-json") {
      parsed.uiPatrolJson = argv[index + 1];
      index += 1;
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
