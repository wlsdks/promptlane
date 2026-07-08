#!/usr/bin/env node
import { spawn, spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { normalizeClaudeCodePayload } from "../dist/adapters/claude-code.js";
import { loadHookAuth, loadPromptLaneConfig } from "../dist/config/config.js";
import { redactPrompt } from "../dist/redaction/redact.js";
import { createSqlitePromptStorage } from "../dist/storage/sqlite.js";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const cliPath = join(repoRoot, "dist", "cli", "index.js");
const timeoutMs = 10_000;

assertFileExists(
  cliPath,
  "Run `corepack pnpm build` before MCP coach loop smoke.",
);

const dataDir = mkdtempSync(join(tmpdir(), "promptlane-mcp-loop-"));
let child;
let buffer = "";
let stderr = "";
let nextId = 1;
const waiters = new Map();

try {
  initArchive(dataDir);
  const promptId = seedStoredPrompt(dataDir);

  child = spawn(process.execPath, [cliPath, "mcp", "--data-dir", dataDir], {
    cwd: repoRoot,
    stdio: ["pipe", "pipe", "pipe"],
  });

  child.stderr.on("data", (chunk) => {
    stderr += chunk.toString("utf8");
  });
  child.stdout.on("data", handleStdout);
  child.on("error", (error) => {
    for (const waiter of waiters.values()) waiter.reject(error);
    waiters.clear();
  });

  const initialize = await request("initialize", {
    protocolVersion: "2025-06-18",
    capabilities: {},
    clientInfo: {
      name: "promptlane-mcp-coach-loop-smoke",
      version: "0.0.0",
    },
  });
  await request("tools/list");
  const score = structured(
    await request("tools/call", {
      name: "score_prompt",
      arguments: {
        prompt_id: promptId,
        include_suggestions: true,
      },
    }),
  );
  const coach = structured(
    await request("tools/call", {
      name: "coach_prompt",
      arguments: {
        include_latest_score: true,
        include_archive: true,
        include_improvement: true,
        include_project_rules: false,
        max_prompts: 10,
        low_score_limit: 3,
      },
    }),
  );
  const improve = structured(
    await request("tools/call", {
      name: "improve_prompt",
      arguments: {
        prompt_id: promptId,
        language: "ko",
      },
    }),
  );
  const answers = buildAnswers(improve.clarifying_questions);
  const applied = structured(
    await request("tools/call", {
      name: "apply_clarifications",
      arguments: {
        prompt: "html 한번 열어봐줘",
        language: "ko",
        answers,
      },
    }),
  );
  const recorded = structured(
    await request("tools/call", {
      name: "record_clarifications",
      arguments: {
        prompt_id: promptId,
        language: "ko",
        answers,
      },
    }),
  );

  assertSmokeResult({ initialize, score, coach, improve, applied, recorded });
  console.log("mcp coach loop smoke passed");
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
} finally {
  child?.kill();
  rmSync(dataDir, { recursive: true, force: true });
}

function initArchive(dataDir) {
  const result = spawnSync(
    process.execPath,
    [cliPath, "init", "--data-dir", dataDir],
    {
      cwd: repoRoot,
      encoding: "utf8",
    },
  );
  if (result.status !== 0) {
    throw new Error(`promptlane init failed:\n${result.stderr}`);
  }
}

function seedStoredPrompt(dataDir) {
  const config = loadPromptLaneConfig(dataDir);
  const auth = loadHookAuth(dataDir);
  const storage = createSqlitePromptStorage({
    dataDir: config.data_dir,
    hmacSecret: auth.web_session_secret,
  });

  try {
    const event = normalizeClaudeCodePayload(
      {
        session_id: "mcp-coach-loop-smoke-session",
        transcript_path: join(dataDir, "promptlane-smoke-transcript.jsonl"),
        cwd: join(dataDir, "promptlane-smoke-project"),
        permission_mode: "default",
        hook_event_name: "UserPromptSubmit",
        prompt: "html 한번 열어봐줘",
      },
      new Date("2026-07-05T00:00:00.000Z"),
    );

    storage.storePrompt({
      event,
      redaction: redactPrompt(event.prompt, "mask"),
    });

    const promptId = storage.listPrompts({ limit: 1 }).items[0]?.id;
    if (!promptId) {
      throw new Error("Smoke failed to seed a stored prompt.");
    }
    const unmeasuredEvent = normalizeClaudeCodePayload(
      {
        session_id: "mcp-coach-loop-smoke-unmeasured-session",
        transcript_path: join(dataDir, "promptlane-smoke-transcript-2.jsonl"),
        cwd: join(dataDir, "promptlane-smoke-project"),
        permission_mode: "default",
        hook_event_name: "UserPromptSubmit",
        prompt:
          "Review the generated HTML in a browser, keep scope to render verification, run the narrow browser smoke, and report visible issues.",
      },
      new Date("2026-07-05T00:01:00.000Z"),
    );
    storage.storePrompt({
      event: unmeasuredEvent,
      redaction: redactPrompt(unmeasuredEvent.prompt, "mask"),
    });
    storage.createLoopSnapshot({
      id: "loop_mcp_coach_score_effectiveness",
      created_at: "2026-07-05T00:05:00.000Z",
      tool: "claude-code",
      source: "mcp",
      cwd_label: "promptlane-smoke-project",
      project_id: "proj_mcp_coach_smoke",
      prompt_ids: [promptId],
      event_counts: {
        prompts: 1,
        tests_run: 3,
      },
      quality: {
        average_prompt_score: 10,
        top_gaps: ["Goal clarity", "Verification criteria"],
        unresolved_questions: [],
      },
      outcome: {
        status: "passed",
        summary: "MCP score effectiveness evidence passed.",
        evidence_refs: ["smoke:mcp-coach-loop", "test:score_prompt"],
      },
      next_brief: {
        generated: true,
        prompt_id: promptId,
        summary: "Continue from MCP score effectiveness evidence.",
      },
      privacy: {
        stores_prompt_bodies: false,
        stores_raw_paths: false,
        local_only: true,
      },
    });
    return promptId;
  } finally {
    storage.close();
  }
}

function handleStdout(chunk) {
  buffer += chunk.toString("utf8");
  let newlineIndex;
  while ((newlineIndex = buffer.indexOf("\n")) >= 0) {
    const line = buffer.slice(0, newlineIndex).trim();
    buffer = buffer.slice(newlineIndex + 1);
    if (line.length === 0) continue;

    const message = JSON.parse(line);
    const waiter = waiters.get(message.id);
    if (!waiter) continue;
    waiters.delete(message.id);
    clearTimeout(waiter.timer);
    waiter.resolve(message);
  }
}

function request(method, params) {
  const id = `req-${nextId++}`;
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      waiters.delete(id);
      reject(new Error(`Timed out waiting for ${method}.\nstderr:\n${stderr}`));
    }, timeoutMs);
    waiters.set(id, { resolve, reject, timer });
    child.stdin.write(
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

function buildAnswers(questions) {
  const fallbackQuestions =
    Array.isArray(questions) && questions.length > 0
      ? questions
      : [{ id: "goal_clarity-1", axis: "goal_clarity" }];

  return fallbackQuestions.slice(0, 2).map((question, index) => ({
    question_id: String(question.id ?? `question-${index + 1}`),
    axis: String(question.axis ?? "goal_clarity"),
    answer:
      index === 0
        ? "현재 프로젝트에서 생성된 HTML 결과물을 브라우저로 열고 빈 화면이나 콘솔 오류가 있는지 확인해주세요."
        : "필요하면 로컬 dev server를 실행하되, 작업 범위는 HTML 렌더링 확인과 결과 보고로 제한해주세요.",
    origin: "user",
  }));
}

function assertSmokeResult({
  initialize,
  score,
  improve,
  applied,
  recorded,
  coach,
}) {
  assertEqual(
    initialize?.result?.serverInfo?.name,
    "promptlane",
    "Initialize should return promptlane serverInfo.",
  );
  assertEqual(score?.is_error === true, false, "score_prompt should pass.");
  assertEqual(
    score?.quality_score?.band,
    "weak",
    "Seed prompt should be weak enough to trigger coaching.",
  );
  assertEqual(
    score?.privacy?.returns_prompt_body,
    false,
    "score_prompt should not return prompt bodies.",
  );
  assertEqual(
    score?.effectiveness?.verdict,
    "proven",
    "score_prompt should return stored prompt effectiveness evidence.",
  );
  assertEqual(
    score?.effectiveness?.calibration?.total_tests_run,
    3,
    "score_prompt should return effectiveness calibration counts.",
  );
  assertEqual(coach?.is_error === true, false, "coach_prompt should pass.");
  assertTruthy(
    coach?.agent_brief?.summary?.includes("Effectiveness evidence"),
    "coach_prompt agent brief should summarize effectiveness evidence.",
  );
  assertTruthy(
    coach?.agent_brief?.next_actions?.some((action) =>
      action.includes("unmeasured prompt"),
    ),
    "coach_prompt agent brief should ask the agent to review unmeasured prompts.",
  );
  assertTruthy(
    coach?.agent_brief?.next_actions?.some((action) =>
      action.includes("smoke:mcp-coach-loop"),
    ),
    "coach_prompt agent brief should include safe effectiveness evidence refs.",
  );
  assertNoUnsafeCoachBrief(coach);
  assertEqual(improve?.is_error === true, false, "improve_prompt should pass.");
  assertTruthy(
    improve?.clarifying_questions?.length > 0,
    "improve_prompt should return clarifying questions for the weak prompt.",
  );
  assertEqual(
    improve?.requires_user_approval,
    true,
    "improve_prompt should remain approval-gated.",
  );
  assertEqual(
    applied?.is_error === true,
    false,
    "apply_clarifications should pass.",
  );
  assertTruthy(
    applied?.improved_prompt?.includes("현재 프로젝트"),
    "apply_clarifications should compose a final draft from user answers.",
  );
  assertEqual(
    applied?.privacy?.stores_input,
    false,
    "apply_clarifications should not store direct input.",
  );
  assertEqual(
    applied?.privacy?.returns_stored_prompt_body,
    false,
    "apply_clarifications should not return stored prompt bodies.",
  );
  assertEqual(
    recorded?.is_error === true,
    false,
    "record_clarifications should pass.",
  );
  assertTruthy(
    recorded?.draft_id,
    "record_clarifications should return a draft id.",
  );
  assertEqual(
    recorded?.answers_count,
    2,
    "record_clarifications should store two user-origin answers.",
  );
  assertEqual(
    recorded?.privacy?.returns_stored_prompt_body,
    false,
    "record_clarifications should not return stored prompt bodies.",
  );
  assertEqual(
    stderr.trim(),
    "",
    "MCP coach loop smoke should not print stderr.",
  );
}

function assertNoUnsafeCoachBrief(coach) {
  const serialized = JSON.stringify(coach?.agent_brief ?? {});
  assertEqual(
    serialized.includes(dataDir),
    false,
    "coach_prompt agent brief should not return raw data-dir paths.",
  );
  assertEqual(
    serialized.includes("promptlane-smoke-transcript"),
    false,
    "coach_prompt agent brief should not return transcript paths.",
  );
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
