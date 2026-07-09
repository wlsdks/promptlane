#!/usr/bin/env node
import { spawn, spawnSync } from "node:child_process";
import {
  existsSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const cliPath = join(repoRoot, "dist", "cli", "index.js");
const tempRoot = mkdtempSync(join(tmpdir(), "promptlane-first-loop-"));
const dataDir = join(tempRoot, "data");
const homeDir = join(tempRoot, "home");
const projectDir = join(homeDir, "project");
const serverPort = 20_000 + Math.floor(Math.random() * 20_000);
const serverBaseUrl = `http://127.0.0.1:${serverPort}`;
const secret = "PROMPTLANE_FIRST_LOOP_SECRET sk-proj-firstloop1234567890";
const cliEnv = {
  ...process.env,
  HOME: homeDir,
  USERPROFILE: homeDir,
};
let serverProcess;

try {
  assertFileExists(
    cliPath,
    "Run `corepack pnpm build` before first coach loop dogfood.",
  );
  mkdirSync(projectDir, { recursive: true });

  step("init isolated PromptLane archive");
  runCli(["init", "--data-dir", dataDir]);
  configureSmokePort();

  step("start local PromptLane server");
  serverProcess = startServer();
  await waitForHealth(`${serverBaseUrl}/api/v1/health`);

  step("hook codex capture through local server");
  const hookResult = runCli(["hook", "codex", "--data-dir", dataDir], {
    input: JSON.stringify({
      hook_event_name: "UserPromptSubmit",
      session_id: "first-coach-loop-dogfood-session",
      turn_id: "turn-1",
      cwd: projectDir,
      prompt: `html 한번 열어봐줘 ${secret}`,
    }),
  });
  assertEqual(hookResult, "", "Codex hook capture should stay stdout-free.");

  step("coach --json");
  const coach = parseJson(runCli(["coach", "--data-dir", dataDir, "--json"]));
  assertEqual(
    coach.status.status,
    "ready",
    "Coach should see captured prompt.",
  );
  assertEqual(
    coach.status.latest_prompt.tool,
    "codex",
    "Coach should report the latest Codex prompt.",
  );
  assertEqual(
    coach.privacy.local_only,
    true,
    "Coach result should be local-only.",
  );
  assertEqual(
    coach.privacy.auto_submits,
    false,
    "Coach must not auto-submit improved prompts.",
  );
  assertNotIncludes(
    JSON.stringify(coach),
    secret,
    "Coach output must not expose the raw dogfood secret.",
  );

  step("loop collect --json");
  const snapshot = parseJson(
    runCli([
      "loop",
      "collect",
      "--data-dir",
      dataDir,
      "--cwd-prefix",
      projectDir,
      "--branch",
      "first-coach-loop-dogfood",
      "--json",
    ]),
  );
  assertEqual(
    snapshot.event_counts.prompts,
    1,
    "Loop snapshot should include the captured prompt.",
  );
  assertEqual(
    snapshot.privacy.stores_prompt_bodies,
    false,
    "Loop snapshot must not store prompt bodies.",
  );
  assertEqual(
    snapshot.privacy.stores_raw_paths,
    false,
    "Loop snapshot must not store raw paths.",
  );
  assertNotIncludes(
    JSON.stringify(snapshot),
    secret,
    "Loop snapshot output must not expose the raw dogfood secret.",
  );

  step("loop outcome --json");
  const outcome = parseJson(
    runCli([
      "loop",
      "outcome",
      "--data-dir",
      dataDir,
      "--snapshot-id",
      snapshot.id,
      "--status",
      "passed",
      "--summary",
      "Focused first-loop checks passed.",
      "--evidence-ref",
      "test:first-coach-loop-dogfood",
      "--json",
    ]),
  );
  assertEqual(outcome.recorded, true, "Loop outcome should be recorded.");
  assertEqual(
    outcome.outcome.status,
    "passed",
    "Loop outcome should preserve the passed status.",
  );
  assertNotIncludes(
    JSON.stringify(outcome),
    projectDir,
    "Loop outcome output must not expose the raw project path.",
  );

  step("collect a newer unrelated worktree snapshot");
  const newerSnapshot = parseJson(
    runCli([
      "loop",
      "collect",
      "--data-dir",
      dataDir,
      "--cwd-prefix",
      projectDir,
      "--worktree",
      "newer-unrelated-worktree",
      "--branch",
      "newer-unrelated-branch",
      "--json",
    ]),
  );
  assertEqual(
    newerSnapshot.outcome.status,
    "unknown",
    "Newer unrelated worktree should not be memory-eligible.",
  );

  step("loop memory-candidate --json");
  const memoryCandidate = parseJson(
    runCli([
      "loop",
      "memory-candidate",
      "--data-dir",
      dataDir,
      "--snapshot-id",
      snapshot.id,
      "--json",
    ]),
  );
  assertEqual(
    memoryCandidate.eligible,
    true,
    "Passed outcome with safe evidence should be memory-eligible.",
  );
  assertEqual(
    memoryCandidate.snapshot_id,
    snapshot.id,
    "CLI memory candidate should preserve exact snapshot selection.",
  );

  step("loop brief --json");
  const brief = parseJson(
    runCli([
      "loop",
      "brief",
      "--data-dir",
      dataDir,
      "--branch",
      "first-coach-loop-dogfood",
      "--json",
    ]),
  );
  assertIncludes(
    brief.prompt,
    "PromptLane snapshot",
    "Loop brief should be PromptLane-facing.",
  );
  assertIncludes(
    brief.prompt,
    "prompt ids:",
    "Loop brief should carry prompt id context.",
  );
  assertEqual(
    brief.privacy.returns_prompt_bodies,
    false,
    "Loop brief must not return prompt bodies.",
  );
  assertEqual(
    brief.privacy.returns_raw_paths,
    false,
    "Loop brief must not return raw paths.",
  );
  assertNotIncludes(
    JSON.stringify(brief),
    secret,
    "Loop brief output must not expose the raw dogfood secret.",
  );

  console.log("first coach loop dogfood passed");
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
} finally {
  serverProcess?.kill();
  rmSync(tempRoot, { recursive: true, force: true });
}

function step(message) {
  console.log(`first coach loop dogfood: ${message}`);
}

function runCli(args, options = {}) {
  const result = spawnSync(process.execPath, [cliPath, ...args], {
    env: cliEnv,
    encoding: "utf8",
    input: options.input,
    stdio: ["pipe", "pipe", "pipe"],
  });
  if (result.status !== 0) {
    throw new Error(
      `CLI failed: promptlane ${args.join(" ")}\n${result.stderr}`,
    );
  }
  if (result.stderr.trim()) {
    throw new Error(
      `CLI printed unexpected stderr: promptlane ${args.join(" ")}\n${result.stderr}`,
    );
  }
  return result.stdout.trim();
}

function startServer() {
  const child = spawn(
    process.execPath,
    [cliPath, "server", "--data-dir", dataDir],
    {
      env: cliEnv,
      stdio: ["ignore", "ignore", "pipe"],
    },
  );
  child.stderr.on("data", (chunk) => {
    const text = Buffer.from(chunk).toString("utf8").trim();
    if (text) console.error(text);
  });
  return child;
}

async function waitForHealth(url) {
  const started = Date.now();
  while (Date.now() - started < 10_000) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // Retry until the server starts listening.
    }
    await delay(100);
  }
  throw new Error("Server did not become healthy within 10 seconds.");
}

function configureSmokePort() {
  const configPath = join(dataDir, "config.json");
  const config = parseJson(readFileSync(configPath, "utf8"));
  config.server.port = serverPort;
  writeFileSync(configPath, `${JSON.stringify(config, null, 2)}\n`, {
    mode: 0o600,
  });
}

function parseJson(text) {
  return JSON.parse(text);
}

function assertFileExists(path, message) {
  assert(existsSync(path) && statSync(path).isFile(), message);
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`${message} Expected ${expected}, got ${actual}.`);
  }
}

function assertIncludes(value, expected, message) {
  if (!String(value).includes(expected)) {
    throw new Error(`${message} Missing ${expected}.`);
  }
}

function assertNotIncludes(value, unexpected, message) {
  if (String(value).includes(unexpected)) {
    throw new Error(`${message} Found ${unexpected}.`);
  }
}

function delay(ms) {
  return new Promise((resolveDelay) => setTimeout(resolveDelay, ms));
}
