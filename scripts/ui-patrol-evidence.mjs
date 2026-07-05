#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const workflow = "ui-patrol.yml";
const artifactName = "ui-patrol-screenshots";
const expectedPngCount = 9;

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
  print({
    check: "scheduled_ui_patrol",
    status: "pending_no_schedule_run",
    workflow,
    expected_artifact: artifactName,
    expected_png_count: expectedPngCount,
    latest_manual_run: latestManualRun(runs),
    next_action:
      "Wait for the weekly cron schedule event, then rerun corepack pnpm evidence:ui-patrol.",
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

function print(value) {
  console.log(JSON.stringify(value, null, 2));
}
