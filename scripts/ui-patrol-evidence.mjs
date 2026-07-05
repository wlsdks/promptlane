#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const workflow = "ui-patrol.yml";
const artifactName = "ui-patrol-screenshots";
const expectedPngCount = 9;
const scheduleCron = "17 6 * * 1";
const now = currentTime();

const runs = ghJson([
  "run",
  "list",
  "--workflow",
  workflow,
  "--limit",
  "30",
  "--json",
  "databaseId,event,status,conclusion,createdAt,url",
]);

const scheduledRuns = runs.filter((run) => run.event === "schedule");
const latestScheduled = scheduledRuns[0];

if (!latestScheduled) {
  const lastExpectedScheduleUtc = lastWeeklyScheduleUtc(now);
  const nextExpectedScheduleUtc = nextWeeklyScheduleUtc(now);
  const waitState = scheduleWaitState({
    lastExpectedScheduleUtc,
    latestManualRun: latestManualRun(runs),
  });
  print({
    check: "scheduled_ui_patrol",
    status: "pending_no_schedule_run",
    workflow,
    schedule_cron: scheduleCron,
    schedule_wait_state: waitState,
    last_expected_schedule_utc: lastExpectedScheduleUtc,
    next_expected_schedule_utc: nextExpectedScheduleUtc,
    expected_artifact: artifactName,
    expected_png_count: expectedPngCount,
    latest_manual_run: latestManualRun(runs),
    next_action: nextActionForMissingSchedule(waitState, nextExpectedScheduleUtc),
  });
  process.exit(0);
}

if (
  latestScheduled.status !== "completed" ||
  latestScheduled.conclusion !== "success"
) {
  print({
    check: "scheduled_ui_patrol",
    status: "pending_schedule_not_successful",
    workflow,
    schedule_cron: scheduleCron,
    scheduled_run: latestScheduled,
    next_action:
      "Inspect the scheduled ui-patrol workflow run and fix failures before claiming scheduled evidence.",
  });
  process.exit(0);
}

const artifactDir = mkdtempSync(join(tmpdir(), "promptlane-ui-patrol-"));
try {
  gh([
    "run",
    "download",
    String(latestScheduled.databaseId),
    "--name",
    artifactName,
    "--dir",
    artifactDir,
  ]);
  const pngs = findPngs(artifactDir);
  print({
    check: "scheduled_ui_patrol",
    status:
      pngs.length === expectedPngCount
        ? "complete"
        : "pending_artifact_incomplete",
    workflow,
    schedule_cron: scheduleCron,
    scheduled_run: latestScheduled,
    artifact: artifactName,
    png_count: pngs.length,
    expected_png_count: expectedPngCount,
    png_files: pngs.map((path) => path.replace(`${artifactDir}/`, "")),
    next_action:
      pngs.length === expectedPngCount
        ? "Record the scheduled run id and 9 png artifact evidence in the 9.5 ledger."
        : "Inspect the uploaded ui-patrol-screenshots artifact and rerun the workflow if needed.",
  });
} finally {
  rmSync(artifactDir, { recursive: true, force: true });
}

function latestManualRun(runs) {
  const run = runs.find((entry) => entry.event === "workflow_dispatch");
  if (!run) return undefined;
  return {
    databaseId: run.databaseId,
    conclusion: run.conclusion,
    createdAt: run.createdAt,
    url: run.url,
  };
}

function scheduleWaitState({ lastExpectedScheduleUtc, latestManualRun }) {
  if (
    latestManualRun?.createdAt &&
    Date.parse(latestManualRun.createdAt) > Date.parse(lastExpectedScheduleUtc)
  ) {
    return "waiting_for_next_cron";
  }
  return "overdue_no_schedule_run";
}

function nextActionForMissingSchedule(waitState, nextExpectedScheduleUtc) {
  if (waitState === "waiting_for_next_cron") {
    return `Wait until ${nextExpectedScheduleUtc}, then rerun corepack pnpm evidence:ui-patrol.`;
  }
  return "Inspect the ui-patrol workflow schedule delivery, then rerun corepack pnpm evidence:ui-patrol after a real schedule event exists.";
}

function ghJson(args) {
  const result = gh(args);
  return JSON.parse(result.stdout);
}

function gh(args) {
  const result = spawnSync("gh", args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  if (result.status !== 0) {
    throw new Error(
      `gh ${args.join(" ")} failed with exit ${result.status}.\n${result.stderr}`,
    );
  }
  return result;
}

function findPngs(dir) {
  const result = spawnSync("find", [dir, "-type", "f", "-name", "*.png"], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  if (result.status !== 0) {
    throw new Error(`find failed with exit ${result.status}.\n${result.stderr}`);
  }
  return result.stdout
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .sort();
}

function nextWeeklyScheduleUtc(now) {
  const next = new Date(now);
  const daysUntilMonday = (1 - next.getUTCDay() + 7) % 7;
  next.setUTCDate(next.getUTCDate() + daysUntilMonday);
  next.setUTCHours(6, 17, 0, 0);

  if (next <= now) {
    next.setUTCDate(next.getUTCDate() + 7);
  }

  return next.toISOString();
}

function lastWeeklyScheduleUtc(now) {
  const last = new Date(now);
  const daysSinceMonday = (last.getUTCDay() - 1 + 7) % 7;
  last.setUTCDate(last.getUTCDate() - daysSinceMonday);
  last.setUTCHours(6, 17, 0, 0);

  if (last > now) {
    last.setUTCDate(last.getUTCDate() - 7);
  }

  return last.toISOString();
}

function currentTime() {
  const override = process.env.PROMPT_COACH_UI_PATROL_NOW_UTC;
  if (!override) return new Date();
  const parsed = new Date(override);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error("PROMPT_COACH_UI_PATROL_NOW_UTC must be an ISO timestamp.");
  }
  return parsed;
}

function print(value) {
  console.log(JSON.stringify(value, null, 2));
}
