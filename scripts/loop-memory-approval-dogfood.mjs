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
const tempRoot = mkdtempSync(join(tmpdir(), "promptlane-loop-memory-"));
const dataDir = join(tempRoot, "data");
const homeDir = join(tempRoot, "home");
const projectDir = join(homeDir, "project");
const instructionFile = join(projectDir, "AGENTS.md");
const serverPort = 20_000 + Math.floor(Math.random() * 20_000);
const serverBaseUrl = `http://127.0.0.1:${serverPort}`;
const secret = "PROMPTLANE_LOOP_MEMORY_SECRET sk-proj-loopmemory1234567890";
const timeoutMs = 10_000;
const cliEnv = {
  ...process.env,
  HOME: homeDir,
  USERPROFILE: homeDir,
};

let serverProcess;
let mcpProcess;
let mcpBuffer = "";
let mcpStderr = "";
let nextMcpId = 1;
const mcpWaiters = new Map();

try {
  assertFileExists(
    cliPath,
    "Run `corepack pnpm build` before loop memory approval dogfood.",
  );
  mkdirSync(projectDir, { recursive: true });
  writeFileSync(instructionFile, "# Dogfood Instructions\n", { mode: 0o600 });

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
      session_id: "loop-memory-approval-dogfood-session",
      turn_id: "turn-1",
      cwd: projectDir,
      prompt: `Approve only evidence-backed loop memories. ${secret}`,
    }),
  });
  assertEqual(hookResult, "", "Codex hook capture should stay stdout-free.");

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
      "loop-memory-approval-dogfood",
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

  step("start MCP server");
  mcpProcess = startMcpServer();
  await mcpRequest("initialize", {
    protocolVersion: "2025-06-18",
    capabilities: {},
    clientInfo: {
      name: "promptlane-loop-memory-approval-dogfood",
      version: "0.0.0",
    },
  });
  await mcpRequest("tools/list");

  step("record_loop_outcome");
  const recordedOutcome = structured(
    await mcpRequest("tools/call", {
      name: "record_loop_outcome",
      arguments: {
        latest: true,
        status: "passed",
        summary:
          "Loop memory approval dogfood passed focused local verification.",
        evidence_refs: [
          "test:dogfood:first-coach-loop",
          "mcp:record_loop_outcome",
        ],
      },
    }),
  );
  assertEqual(
    recordedOutcome.recorded,
    true,
    "MCP should record a passed loop outcome.",
  );
  assertEqual(
    recordedOutcome.privacy.stores_prompt_bodies,
    false,
    "Outcome recording must not store prompt bodies.",
  );
  assertEqual(
    recordedOutcome.privacy.stores_raw_paths,
    false,
    "Outcome recording must not store raw paths.",
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

  step("propose_loop_memory_candidate");
  const candidate = structured(
    await mcpRequest("tools/call", {
      name: "propose_loop_memory_candidate",
      arguments: { snapshot_id: snapshot.id },
    }),
  );
  assertEqual(
    candidate.eligible,
    true,
    "Passed loop with evidence should produce a memory candidate.",
  );
  assertEqual(
    candidate.reason,
    "passed_with_evidence",
    "Memory candidate should explain the evidence-backed eligibility.",
  );
  assertEqual(
    candidate.snapshot_id,
    snapshot.id,
    "MCP memory candidate should preserve exact snapshot selection.",
  );
  assertEqual(
    candidate.privacy.auto_writes_memory,
    false,
    "Candidate proposal must not auto-write memory.",
  );

  step("record_loop_memory");
  const memory = structured(
    await mcpRequest("tools/call", {
      name: "record_loop_memory",
      arguments: {
        snapshot_id: snapshot.id,
        approved_by: "loop-memory-approval-dogfood",
      },
    }),
  );
  assertEqual(memory.recorded, true, "MCP should record approved memory.");
  assertEqual(
    memory.memory.snapshot_id,
    snapshot.id,
    "MCP memory approval should preserve exact snapshot selection.",
  );
  assertEqual(
    memory.privacy.writes_instruction_files,
    false,
    "Memory approval must not write instruction files.",
  );
  assertEqual(
    memory.memory.evidence_refs.length > 0,
    true,
    "Approved memory should keep evidence refs.",
  );

  step("propose_instruction_patch");
  const instructionBefore = readFileSync(instructionFile, "utf8");
  const patch = structured(
    await mcpRequest("tools/call", {
      name: "propose_instruction_patch",
      arguments: { target_file: "AGENTS.md" },
    }),
  );
  const instructionAfter = readFileSync(instructionFile, "utf8");
  assertEqual(
    patch.writes_files,
    false,
    "Instruction patch proposal must not write files.",
  );
  assertEqual(
    patch.requires_user_approval,
    true,
    "Instruction patch proposal should require user approval.",
  );
  assertEqual(
    patch.privacy.writes_instruction_files,
    false,
    "Instruction patch proposal must report no instruction writes.",
  );
  assertIncludes(
    patch.diff,
    "PromptLane Memories",
    "Instruction patch should propose the PromptLane memories section.",
  );
  assertEqual(
    instructionAfter,
    instructionBefore,
    "Instruction patch proposal should leave AGENTS.md unchanged.",
  );

  const combined = JSON.stringify({
    snapshot,
    recordedOutcome,
    candidate,
    memory,
    patch,
  });
  assertNotIncludes(
    combined,
    secret,
    "Dogfood outputs must not expose the raw dogfood secret.",
  );
  assertNotIncludes(
    combined,
    projectDir,
    "Dogfood outputs must not expose raw project paths.",
  );
  assertNotIncludes(
    combined,
    homeDir,
    "Dogfood outputs must not expose raw home paths.",
  );
  assertNotIncludes(
    combined,
    "sk-proj-loopmemory1234567890",
    "Dogfood outputs must not expose secret-looking tokens.",
  );
  assertEqual(
    mcpStderr.trim(),
    "",
    "MCP server should not print stderr during dogfood.",
  );

  console.log("loop memory approval dogfood passed");
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
} finally {
  mcpProcess?.kill();
  serverProcess?.kill();
  rmSync(tempRoot, { recursive: true, force: true });
}

function step(message) {
  console.log(`loop memory approval dogfood: ${message}`);
}

function runCli(args, options = {}) {
  const result = spawnSync(process.execPath, [cliPath, ...args], {
    cwd: repoRoot,
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
      cwd: repoRoot,
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

function startMcpServer() {
  const child = spawn(
    process.execPath,
    [cliPath, "mcp", "--data-dir", dataDir],
    {
      cwd: projectDir,
      env: cliEnv,
      stdio: ["pipe", "pipe", "pipe"],
    },
  );
  child.stderr.on("data", (chunk) => {
    mcpStderr += chunk.toString("utf8");
  });
  child.stdout.on("data", handleMcpStdout);
  child.on("error", (error) => {
    for (const waiter of mcpWaiters.values()) waiter.reject(error);
    mcpWaiters.clear();
  });
  return child;
}

function handleMcpStdout(chunk) {
  mcpBuffer += chunk.toString("utf8");
  let newlineIndex;
  while ((newlineIndex = mcpBuffer.indexOf("\n")) >= 0) {
    const line = mcpBuffer.slice(0, newlineIndex).trim();
    mcpBuffer = mcpBuffer.slice(newlineIndex + 1);
    if (line.length === 0) continue;

    const message = JSON.parse(line);
    const waiter = mcpWaiters.get(message.id);
    if (!waiter) continue;
    mcpWaiters.delete(message.id);
    clearTimeout(waiter.timer);
    waiter.resolve(message);
  }
}

function mcpRequest(method, params) {
  const id = `req-${nextMcpId++}`;
  return new Promise((resolveRequest, reject) => {
    const timer = setTimeout(() => {
      mcpWaiters.delete(id);
      reject(
        new Error(`Timed out waiting for ${method}.\nstderr:\n${mcpStderr}`),
      );
    }, timeoutMs);
    mcpWaiters.set(id, { resolve: resolveRequest, reject, timer });
    mcpProcess.stdin.write(
      `${JSON.stringify({
        jsonrpc: "2.0",
        id,
        method,
        ...(params === undefined ? {} : { params }),
      })}\n`,
    );
  });
}

function structured(response) {
  if (response.error) {
    throw new Error(JSON.stringify(response.error));
  }
  const content = response.result?.structuredContent;
  if (!content || typeof content !== "object") {
    throw new Error("MCP response did not include structuredContent.");
  }
  return content;
}

async function waitForHealth(url) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
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
