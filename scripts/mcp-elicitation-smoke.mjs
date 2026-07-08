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
  "Run `corepack pnpm build` before MCP elicitation smoke.",
);

const child = spawn(process.execPath, [cliPath, "mcp"], {
  cwd: repoRoot,
  stdio: ["pipe", "pipe", "pipe"],
});

let buffer = "";
let stderr = "";
let initializeResponse;
let elicitationRequest;
let finalResponse;
let settled = false;

const timer = setTimeout(() => {
  finish(new Error("Timed out waiting for MCP elicitation smoke response."));
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
      new Error(`MCP server exited before final response.\nstderr:\n${stderr}`),
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
    capabilities: { elicitation: {} },
    clientInfo: {
      name: "promptlane-mcp-elicitation-smoke",
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
          timeout_ms: 5_000,
        },
      },
    });
    return;
  }

  if (message.method === "elicitation/create") {
    elicitationRequest = message;
    const required = message.params?.requestedSchema?.required ?? [];
    const content = {};
    for (const axis of required) {
      content[axis] =
        axis === "goal_clarity"
          ? "현재 HTML 파일을 브라우저에서 열어 렌더링과 콘솔 오류를 확인해주세요."
          : axis === "background_context"
            ? "대상 파일과 검증 기준이 없어 먼저 범위를 확인해야 합니다."
            : "관련 HTML 렌더링만 확인하고 수정은 하지 않습니다.";
    }
    send({
      jsonrpc: "2.0",
      id: message.id,
      result: { action: "accept", content },
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

  console.log("mcp elicitation smoke passed");
}

function assertSmokeResult() {
  assertEqual(
    initializeResponse?.result?.serverInfo?.name,
    "promptlane",
    "Initialize should return promptlane serverInfo.",
  );
  assertEqual(
    elicitationRequest?.method,
    "elicitation/create",
    "Tool call should trigger server-initiated elicitation/create.",
  );

  const structured = finalResponse?.result?.structuredContent;
  assertEqual(
    structured?.interaction_status,
    "answered",
    "Final tool response should be answered.",
  );
  assertEqual(
    structured?.answers_count,
    2,
    "Final tool response should include two user answers.",
  );
  assertEqual(
    structured?.analyzer,
    "clarifications-v1",
    "Answered drafts should use clarifications-v1 analyzer.",
  );
  assertEqual(
    structured?.clarifying_questions?.length,
    0,
    "Answered drafts should not have remaining clarifying questions.",
  );
  assertIncludes(
    structured?.improved_prompt ?? "",
    "현재 HTML 파일",
    "Final draft should contain the user-provided goal answer.",
  );
  assertIncludes(
    structured?.improved_prompt ?? "",
    "대상 파일과 검증 기준",
    "Final draft should contain the user-provided context answer.",
  );
  assertEqual(
    structured?.privacy?.local_only,
    true,
    "Privacy contract should stay local-only.",
  );
  assertEqual(
    structured?.privacy?.stores_input,
    false,
    "Privacy contract should not store the direct prompt input.",
  );
  assertEqual(
    structured?.privacy?.external_calls,
    false,
    "Privacy contract should not perform external calls.",
  );
  assertEqual(
    structured?.privacy?.returns_stored_prompt_body,
    false,
    "Privacy contract should not return stored prompt bodies.",
  );
  assertEqual(stderr.trim(), "", "MCP smoke should not print stderr.");
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

function assertIncludes(value, needle, message) {
  if (!value.includes(needle)) {
    throw new Error(`${message}\nMissing: ${needle}\nReceived: ${value}`);
  }
}
