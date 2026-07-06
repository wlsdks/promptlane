#!/usr/bin/env node
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const cliPath = join(repoRoot, "dist", "cli", "index.js");
const timeoutMs = 10_000;

assertFileExists(
  cliPath,
  "Run `pnpm build` before MCP native dialog preflight.",
);

const child = spawn(process.execPath, [cliPath, "mcp"], {
  cwd: repoRoot,
  env: {
    ...process.env,
    PROMPTLANE_NATIVE_DIALOG: "0",
  },
  stdio: ["pipe", "pipe", "pipe"],
});

let buffer = "";
let stderr = "";
let initializeResponse;
let toolsListResponse;
let finalResponse;
let settled = false;

const timer = setTimeout(() => {
  finish(new Error("Timed out waiting for MCP native dialog preflight."));
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
        `MCP server exited before native dialog preflight completed.\nstderr:\n${stderr}`,
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
      name: "promptlane-mcp-native-dialog-preflight",
      version: "0.0.0",
    },
  },
});

function handleMessage(message) {
  if (message.id === "init") {
    initializeResponse = message;
    send({ jsonrpc: "2.0", method: "notifications/initialized", params: {} });
    send({ jsonrpc: "2.0", id: "tools-list", method: "tools/list" });
    return;
  }

  if (message.id === "tools-list") {
    toolsListResponse = message;
    send({
      jsonrpc: "2.0",
      id: "call-1",
      method: "tools/call",
      params: {
        name: "ask_clarifying_questions",
        arguments: {
          prompt: "html 한번 열어봐줘",
          language: "ko",
          timeout_ms: 1_000,
          allow_native_dialog: false,
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
    assertSmokeResult();
  } catch (assertionError) {
    console.error(assertionError.message);
    process.exitCode = 1;
    return;
  }

  console.log("mcp native dialog preflight passed");
}

function assertSmokeResult() {
  assertEqual(
    initializeResponse?.result?.serverInfo?.name,
    "promptlane",
    "Initialize should return promptlane serverInfo.",
  );

  const tool = toolsListResponse?.result?.tools?.find(
    (candidate) => candidate.name === "ask_clarifying_questions",
  );
  assertTruthy(tool, "tools/list should include ask_clarifying_questions.");
  assertEqual(
    tool.inputSchema?.properties?.allow_native_dialog?.type,
    "boolean",
    "ask_clarifying_questions should publicly expose allow_native_dialog.",
  );
  assertEqual(
    tool.inputSchema?.additionalProperties,
    false,
    "ask_clarifying_questions should keep strict input schema.",
  );

  const structured = finalResponse?.result?.structuredContent;
  assertEqual(
    structured?.interaction_status,
    "unsupported",
    "allow_native_dialog=false without elicitation should return metadata fallback without opening an OS dialog.",
  );
  assertEqual(
    structured?.answers_count,
    0,
    "Metadata fallback should not fabricate answers.",
  );
  assertTruthy(
    structured?.clarifying_questions?.length > 0,
    "Metadata fallback should return clarifying questions for the agent native ask UI.",
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
  assertEqual(stderr.trim(), "", "MCP preflight should not print stderr.");
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
