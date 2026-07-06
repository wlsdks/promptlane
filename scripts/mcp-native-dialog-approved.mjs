#!/usr/bin/env node
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const cliPath = join(repoRoot, "dist", "cli", "index.js");
const timeoutMs = 90_000;
const approvalEnv = "PROMPTLANE_NATIVE_DIALOG_APPROVED";

if (process.env[approvalEnv] !== "1") {
  console.error(
    `Refusing to open a native OS dialog. Set ${approvalEnv}=1 only when an operator is present and expects the dialog.`,
  );
  process.exitCode = 1;
  process.exit();
}

assertFileExists(
  cliPath,
  "Run `pnpm build` before the approved MCP native dialog dogfood.",
);

const child = spawn(process.execPath, [cliPath, "mcp"], {
  cwd: repoRoot,
  env: {
    ...process.env,
    PROMPTLANE_NATIVE_DIALOG: "1",
  },
  stdio: ["pipe", "pipe", "pipe"],
});

let buffer = "";
let stderr = "";
let initializeResponse;
let finalResponse;
let settled = false;

const timer = setTimeout(() => {
  finish(new Error("Timed out waiting for approved MCP native dialog dogfood."));
}, timeoutMs);

child.stderr.on("data", (chunk) => {
  stderr += chunk.toString("utf8");
});

child.stdout.on("data", (chunk) => {
  buffer += chunk.toString("utf8");
  let newlineIndex;
  while ((newlineIndex = buffer.indexOf("\n")) >= 0) {
    const line = buffer.slice(0, newlineIndex).trim();
    buffer = buffer.slice(newlineIndex + 1);
    if (line.length === 0) continue;
    handleMessage(JSON.parse(line));
  }
});

child.on("error", finish);
child.on("close", () => {
  if (settled) return;
  if (!finalResponse) {
    finish(
      new Error(
        `MCP server exited before approved native dialog dogfood completed.\nstderr:\n${stderr}`,
      ),
    );
    return;
  }
  finish();
});

send({
  jsonrpc: "2.0",
  id: "init",
  method: "initialize",
  params: {
    protocolVersion: "2025-06-18",
    capabilities: {},
    clientInfo: {
      name: "promptlane-mcp-native-dialog-approved",
      version: "0.0.0",
    },
  },
});

function handleMessage(message) {
  if (message.id === "init") {
    initializeResponse = message;
    send({ jsonrpc: "2.0", method: "notifications/initialized", params: {} });
    send({
      jsonrpc: "2.0",
      id: "call-1",
      method: "tools/call",
      params: {
        name: "ask_clarifying_questions",
        arguments: {
          prompt: "html 한번 열어봐줘",
          language: "ko",
          timeout_ms: 60_000,
          allow_native_dialog: true,
        },
      },
    });
    return;
  }

  if (message.id === "call-1") {
    finalResponse = message;
    child.kill();
  }
}

function send(message) {
  child.stdin.write(`${JSON.stringify(message)}\n`);
}

function finish(error) {
  if (settled) return;
  settled = true;
  clearTimeout(timer);
  child.kill();

  if (error) {
    console.error(error.message);
    process.exitCode = 1;
    return;
  }

  try {
    assertDogfoodResult();
  } catch (assertionError) {
    console.error(assertionError.message);
    process.exitCode = 1;
    return;
  }

  console.log("mcp native dialog approved dogfood passed");
}

function assertDogfoodResult() {
  assertEqual(
    initializeResponse?.result?.serverInfo?.name,
    "promptlane",
    "Initialize should return promptlane serverInfo.",
  );

  const structured = finalResponse?.result?.structuredContent;
  assertEqual(
    structured?.interaction_status,
    "answered",
    "Approved native dialog dogfood should collect operator answers.",
  );
  assertTruthy(
    structured?.answers_count > 0,
    "Approved native dialog dogfood should collect at least one answer.",
  );
  assertEqual(
    structured?.privacy?.local_only,
    true,
    "Privacy contract should stay local-only.",
  );
  assertEqual(
    structured?.privacy?.external_calls,
    false,
    "Privacy contract should not perform external calls.",
  );
  assertEqual(stderr.trim(), "", "Approved dogfood should not print stderr.");
}

function assertFileExists(path, message) {
  if (!existsSync(path)) {
    throw new Error(message);
  }
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`${message}\nExpected: ${expected}\nReceived: ${actual}`);
  }
}

function assertTruthy(value, message) {
  if (!value) {
    throw new Error(message);
  }
}
