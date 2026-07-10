import { readFileSync } from "node:fs";

import { loadHookAuth, loadPromptLaneConfig } from "../config/config.js";
import { collectLoopSnapshot } from "../loop/collect.js";
import { createSqlitePromptStorage } from "../storage/sqlite.js";
import {
  postHookPayload,
  type PostHookPayloadResult,
  type PostHookPayloadRequest,
} from "./post-to-server.js";
import { writeLastHookStatus } from "./hook-status.js";
import {
  createPromptRewriteGuardOutput,
  type PromptRewriteGuardMode,
} from "./rewrite-guard.js";

export type HookRunResult = {
  exitCode: 0;
  stdout: string;
  stderr: "";
};

export type RunClaudeCodeHookOptions = {
  stdin: string;
  dataDir?: string;
  timeoutMs?: number;
  rewriteGuard?: {
    mode?: PromptRewriteGuardMode;
    minScore?: number;
    language?: "en" | "ko";
    copyToClipboard?: (text: string) => boolean;
    suppressOutput?: boolean;
  };
  postPayload?: (
    request: PostHookPayloadRequest,
  ) => Promise<PostHookPayloadResult>;
};

export async function runClaudeCodeHook(
  options: RunClaudeCodeHookOptions,
): Promise<HookRunResult> {
  return runPromptLaneHook(options, "claude-code");
}

export async function runCodexHook(
  options: RunClaudeCodeHookOptions,
): Promise<HookRunResult> {
  return runPromptLaneHook(options, "codex");
}

async function runPromptLaneHook(
  options: RunClaudeCodeHookOptions,
  tool: "claude-code" | "codex",
): Promise<HookRunResult> {
  let stdout = "";
  try {
    const payload = JSON.parse(options.stdin);
    const config = loadPromptLaneConfig(options.dataDir);
    const hookAuth = loadHookAuth(options.dataDir);
    if (isCompactHookPayload(payload)) {
      recordCompactBoundaryFromHook(payload, tool, {
        dataDir: config.data_dir,
        hmacSecret: hookAuth.web_session_secret,
      });
      writeLastHookStatus(options.dataDir, {
        ok: true,
        status: 200,
        checked_at: new Date().toISOString(),
      });
      return { exitCode: 0, stdout, stderr: "" };
    }

    if (isStopHookPayload(payload)) {
      collectStopLoopSnapshot(payload, tool, {
        dataDir: config.data_dir,
        hmacSecret: hookAuth.web_session_secret,
      });
      writeLastHookStatus(options.dataDir, {
        ok: true,
        status: 200,
        checked_at: new Date().toISOString(),
      });
      return { exitCode: 0, stdout, stderr: "" };
    }

    const postPayload = options.postPayload ?? postHookPayload;
    const url = `http://${config.server.host}:${config.server.port}/api/v1/ingest/${tool}`;

    const result = await postPayload({
      url,
      ingestToken: hookAuth.ingest_token,
      payload,
      timeoutMs: options.timeoutMs ?? 750,
    });
    writeLastHookStatus(options.dataDir, {
      ok: result.ok,
      status: result.status,
      checked_at: new Date().toISOString(),
    });

    if (result.ok) {
      const askEventUrl = `http://${config.server.host}:${config.server.port}/api/v1/ingest/ask-event`;
      const rewriteOutput = createPromptRewriteGuardOutput(payload, {
        ...options.rewriteGuard,
        now: new Date(),
        tool,
        // Codex renders hook stdout (additionalContext / block reason) directly
        // in the user-visible chat. Setting `suppressOutput: true` keeps the
        // guidance available to the model while hiding it from the user, which
        // is the same effective behavior Claude Code already gives by default.
        suppressOutput:
          options.rewriteGuard?.suppressOutput ?? tool === "codex",
        onAskTriggered: (report) => {
          // Fire-and-forget so a slow / unhealthy server never blocks the
          // hook returning to Claude Code or Codex.
          void postPayload({
            url: askEventUrl,
            ingestToken: hookAuth.ingest_token,
            payload: report,
            timeoutMs: options.timeoutMs ?? 750,
          }).catch(() => undefined);
        },
      });
      stdout =
        rewriteOutput && shouldEmitRewriteOutput(tool, rewriteOutput)
          ? `${JSON.stringify(rewriteOutput)}\n`
          : "";
    }
  } catch {
    // Hooks must fail open and must not leak prompt text to stdout/stderr.
    // Record the failure so doctor can surface "Last ingest: failed" with a
    // next-step hint instead of going silent on transport/parse errors.
    try {
      writeLastHookStatus(options.dataDir, {
        ok: false,
        checked_at: new Date().toISOString(),
      });
    } catch {
      // status write may fail if data dir is unavailable; stay fail-open.
    }
  }

  return { exitCode: 0, stdout, stderr: "" };
}

function shouldEmitRewriteOutput(
  tool: "claude-code" | "codex",
  output: ReturnType<typeof createPromptRewriteGuardOutput>,
): boolean {
  if (!output) {
    return false;
  }

  if (
    tool === "codex" &&
    "additionalContext" in output.hookSpecificOutput &&
    output.suppressOutput
  ) {
    return false;
  }

  return true;
}

function recordCompactBoundaryFromHook(
  payload: CompactHookPayload,
  tool: "claude-code" | "codex",
  options: { dataDir: string; hmacSecret: string },
): void {
  const storage = createSqlitePromptStorage({
    dataDir: options.dataDir,
    hmacSecret: options.hmacSecret,
  });

  try {
    const cwd = typeof payload.cwd === "string" ? payload.cwd : process.cwd();
    storage.recordCompactBoundary({
      tool,
      event_name: payload.hook_event_name,
      trigger:
        typeof payload.trigger === "string" ? payload.trigger : undefined,
      session_id:
        typeof payload.session_id === "string" ? payload.session_id : undefined,
      turn_id:
        typeof payload.turn_id === "string" ? payload.turn_id : undefined,
      cwd,
      content: readCompactBoundaryContent(payload),
    });
  } finally {
    storage.close();
  }
}

function collectStopLoopSnapshot(
  payload: { cwd?: unknown; session_id?: unknown },
  tool: "claude-code" | "codex",
  options: { dataDir: string; hmacSecret: string },
): void {
  const sessionId =
    typeof payload.session_id === "string" && payload.session_id.length > 0
      ? payload.session_id
      : undefined;
  if (!sessionId) {
    return;
  }

  const storage = createSqlitePromptStorage({
    dataDir: options.dataDir,
    hmacSecret: options.hmacSecret,
  });

  try {
    const cwd = typeof payload.cwd === "string" ? payload.cwd : process.cwd();
    collectLoopSnapshot({
      storage,
      hmacSecret: options.hmacSecret,
      source: "hook",
      tool,
      sessionId,
      cwd,
      cwdPrefix: cwd,
    });
  } finally {
    storage.close();
  }
}

type CompactHookPayload = {
  hook_event_name: "PreCompact" | "PostCompact";
  cwd?: unknown;
  session_id?: unknown;
  turn_id?: unknown;
  trigger?: unknown;
  custom_instructions?: unknown;
  compact_summary?: unknown;
};

function isCompactHookPayload(payload: unknown): payload is CompactHookPayload {
  return (
    Boolean(payload) &&
    typeof payload === "object" &&
    ((payload as { hook_event_name?: unknown }).hook_event_name ===
      "PreCompact" ||
      (payload as { hook_event_name?: unknown }).hook_event_name ===
        "PostCompact")
  );
}

function isStopHookPayload(payload: unknown): payload is {
  hook_event_name: "Stop";
  cwd?: unknown;
  session_id?: unknown;
} {
  return (
    Boolean(payload) &&
    typeof payload === "object" &&
    (payload as { hook_event_name?: unknown }).hook_event_name === "Stop"
  );
}

function readCompactBoundaryContent(
  payload: CompactHookPayload,
): string | undefined {
  if (typeof payload.compact_summary === "string") {
    return payload.compact_summary;
  }
  if (typeof payload.custom_instructions === "string") {
    return payload.custom_instructions;
  }
  return undefined;
}

export async function readStdin(): Promise<string> {
  return readFileSync(0, "utf8");
}
