import { mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { afterEach, describe, expect, it } from "vitest";

import { normalizeClaudeCodePayload } from "../adapters/claude-code.js";
import { normalizeCodexPayload } from "../adapters/codex.js";
import { initializePromptCoach } from "../config/config.js";
import { redactPrompt } from "../redaction/redact.js";
import { createSqlitePromptStorage } from "../storage/sqlite.js";
import { readLastHookStatus } from "./hook-status.js";
import { runClaudeCodeHook, runCodexHook } from "./wrapper.js";

const tempDirs: string[] = [];

afterEach(() => {
  while (tempDirs.length > 0) {
    const dir = tempDirs.pop();
    if (dir) {
      rmSync(dir, { recursive: true, force: true });
    }
  }
});

describe("runClaudeCodeHook", () => {
  it("reads stdin, token file, and posts to local ingest without stdout/stderr", async () => {
    const dataDir = createTempDir();
    const init = initializePromptCoach({ dataDir });
    const posted: unknown[] = [];

    const result = await runClaudeCodeHook({
      stdin: JSON.stringify({
        hook_event_name: "UserPromptSubmit",
        prompt: "secret",
      }),
      dataDir,
      postPayload: async (request) => {
        posted.push(request);
        return { ok: true, status: 200 };
      },
    });

    expect(result).toEqual({ exitCode: 0, stdout: "", stderr: "" });
    expect(posted).toHaveLength(1);
    expect(posted[0]).toMatchObject({
      ingestToken: init.hookAuth.ingest_token,
      payload: { hook_event_name: "UserPromptSubmit", prompt: "secret" },
      url: `http://127.0.0.1:${init.config.server.port}/api/v1/ingest/claude-code`,
    });
  });

  it("fails open with empty output when config/token/server handling fails", async () => {
    const rawPrompt = "do not leak sk-proj-1234567890abcdef";
    const result = await runClaudeCodeHook({
      stdin: JSON.stringify({ prompt: rawPrompt }),
      dataDir: createTempDir(),
      postPayload: async () => {
        throw new Error("server down");
      },
    });

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toBe("");
    expect(result.stderr).toBe("");
    expect(JSON.stringify(result)).not.toContain(rawPrompt);
  });

  it("records a failed last_ingest_status when the post throws so doctor can surface it", async () => {
    const dataDir = createTempDir();
    initializePromptCoach({ dataDir });

    await runClaudeCodeHook({
      stdin: JSON.stringify({
        hook_event_name: "UserPromptSubmit",
        session_id: "session-fail",
        cwd: "/repo",
        prompt: "any prompt",
      }),
      dataDir,
      postPayload: async () => {
        throw new Error("ECONNREFUSED");
      },
    });

    const status = readLastHookStatus(dataDir);
    expect(status?.ok).toBe(false);
    expect(status?.checked_at).toBeTruthy();
  });

  it("can block and copy a weak prompt when rewrite guard is enabled", async () => {
    const dataDir = createTempDir();
    initializePromptCoach({ dataDir });
    const copied: string[] = [];

    const result = await runClaudeCodeHook({
      stdin: JSON.stringify({
        hook_event_name: "UserPromptSubmit",
        session_id: "session-rewrite",
        cwd: "/repo",
        prompt: "fix this with sk-proj-1234567890abcdef",
      }),
      dataDir,
      rewriteGuard: {
        mode: "block-and-copy",
        minScore: 100,
        copyToClipboard: (text) => {
          copied.push(text);
          return true;
        },
      },
      postPayload: async () => ({ ok: true, status: 200 }),
    });

    const output = JSON.parse(result.stdout) as {
      decision: "block";
      reason: string;
    };

    expect(output.decision).toBe("block");
    expect(output.reason).toContain("Improved prompt:");
    expect(output.reason).not.toContain("sk-proj-1234567890abcdef");
    expect(copied).toHaveLength(1);
    expect(result.stderr).toBe("");
  });

  it("does not block when ingest returns a non-ok response", async () => {
    const dataDir = createTempDir();
    initializePromptCoach({ dataDir });

    const result = await runClaudeCodeHook({
      stdin: JSON.stringify({
        hook_event_name: "UserPromptSubmit",
        session_id: "session-rewrite-non-ok",
        cwd: "/repo",
        prompt: "fix",
      }),
      dataDir,
      rewriteGuard: {
        mode: "block-and-copy",
        minScore: 100,
      },
      postPayload: async () => ({ ok: false, status: 500 }),
    });

    expect(result).toEqual({ exitCode: 0, stdout: "", stderr: "" });
  });

  it("collects a local loop snapshot on Stop without posting the lifecycle payload to prompt ingest", async () => {
    const dataDir = createTempDir();
    await seedPrompt(dataDir, "claude-code");
    const posted: unknown[] = [];

    const result = await runClaudeCodeHook({
      stdin: JSON.stringify({
        hook_event_name: "Stop",
        session_id: "session-stop",
        cwd: "/Users/example/private-project",
        transcript_path: "/Users/example/.claude/session.jsonl",
      }),
      dataDir,
      postPayload: async (request) => {
        posted.push(request);
        return { ok: true, status: 200 };
      },
    });

    const storage = openStorage(dataDir);
    const snapshot = storage.getLatestLoopSnapshot();
    storage.close();
    const serialized = JSON.stringify({ result, snapshot });

    expect(result).toEqual({ exitCode: 0, stdout: "", stderr: "" });
    expect(posted).toHaveLength(0);
    expect(snapshot).toMatchObject({
      source: "hook",
      tool: "claude-code",
      session_id: "session-stop",
      cwd_label: "private-project",
      event_counts: {
        prompts: 1,
      },
      privacy: {
        local_only: true,
        stores_prompt_bodies: false,
        stores_raw_paths: false,
      },
    });
    expect(serialized).not.toContain("Make this better");
    expect(serialized).not.toContain("/Users/example");
  });

  it("records compact boundary metadata without storing compact content or posting to prompt ingest", async () => {
    const dataDir = createTempDir();
    initializePromptCoach({ dataDir });
    const posted: unknown[] = [];

    const result = await runClaudeCodeHook({
      stdin: JSON.stringify({
        hook_event_name: "PostCompact",
        session_id: "session-compact",
        cwd: "/Users/example/private-project",
        transcript_path: "/Users/example/.claude/session.jsonl",
        trigger: "manual",
        compact_summary: "Summary containing sk-proj-secret and raw details.",
      }),
      dataDir,
      postPayload: async (request) => {
        posted.push(request);
        return { ok: true, status: 200 };
      },
    });

    const storage = openStorage(dataDir);
    const boundaries = storage.listCompactBoundaries({ limit: 10 }).items;
    storage.close();
    const serialized = JSON.stringify({ result, boundaries });

    expect(result).toEqual({ exitCode: 0, stdout: "", stderr: "" });
    expect(posted).toHaveLength(0);
    expect(boundaries[0]).toMatchObject({
      tool: "claude-code",
      event_name: "PostCompact",
      trigger: "manual",
      session_id: "session-compact",
      cwd_label: "private-project",
      privacy: {
        local_only: true,
        stores_prompt_bodies: false,
        stores_raw_paths: false,
        stores_compact_content: false,
      },
    });
    expect(boundaries[0]?.content_hash).toMatch(/^compact_[a-f0-9]{16}$/);
    expect(serialized).not.toContain("Summary containing");
    expect(serialized).not.toContain("sk-proj-secret");
    expect(serialized).not.toContain("/Users/example");
  });
});

describe("runCodexHook", () => {
  it("posts Codex hook payload to the Codex ingest route", async () => {
    const dataDir = createTempDir();
    const init = initializePromptCoach({ dataDir });
    const posted: unknown[] = [];

    const result = await runCodexHook({
      stdin: JSON.stringify({
        hook_event_name: "UserPromptSubmit",
        prompt: "codex prompt",
      }),
      dataDir,
      postPayload: async (request) => {
        posted.push(request);
        return { ok: true, status: 200 };
      },
    });

    expect(result).toEqual({ exitCode: 0, stdout: "", stderr: "" });
    expect(posted[0]).toMatchObject({
      ingestToken: init.hookAuth.ingest_token,
      payload: { hook_event_name: "UserPromptSubmit", prompt: "codex prompt" },
      url: `http://127.0.0.1:${init.config.server.port}/api/v1/ingest/codex`,
    });
  });

  it("fails open with empty output without leaking Codex prompt text", async () => {
    const rawPrompt = "do not leak codex prompt sk-proj-1234567890abcdef";
    const result = await runCodexHook({
      stdin: JSON.stringify({ prompt: rawPrompt }),
      dataDir: createTempDir(),
      postPayload: async () => {
        throw new Error("server down");
      },
    });

    expect(result).toEqual({ exitCode: 0, stdout: "", stderr: "" });
    expect(JSON.stringify(result)).not.toContain(rawPrompt);
  });

  it("keeps Codex rewrite-guard context output empty so hook guidance stays out of the user-visible chat", async () => {
    const dataDir = createTempDir();
    initializePromptCoach({ dataDir });

    const result = await runCodexHook({
      stdin: JSON.stringify({
        hook_event_name: "UserPromptSubmit",
        prompt: "fix",
      }),
      dataDir,
      rewriteGuard: { mode: "context", minScore: 100 },
      postPayload: async () => ({ ok: true, status: 200 }),
    });

    expect(result).toEqual({ exitCode: 0, stdout: "", stderr: "" });
  });

  it("does not set suppressOutput on Claude Code rewrite-guard output (existing behavior)", async () => {
    const dataDir = createTempDir();
    initializePromptCoach({ dataDir });

    const result = await runClaudeCodeHook({
      stdin: JSON.stringify({
        hook_event_name: "UserPromptSubmit",
        prompt: "fix",
      }),
      dataDir,
      rewriteGuard: { mode: "context", minScore: 100 },
      postPayload: async () => ({ ok: true, status: 200 }),
    });

    const output = JSON.parse(result.stdout) as {
      suppressOutput?: boolean;
    };

    expect(output.suppressOutput).toBeUndefined();
  });

  it("collects a local loop snapshot on Stop without posting the lifecycle payload to prompt ingest", async () => {
    const dataDir = createTempDir();
    await seedPrompt(dataDir, "codex");
    const posted: unknown[] = [];

    const result = await runCodexHook({
      stdin: JSON.stringify({
        hook_event_name: "Stop",
        session_id: "session-stop",
        cwd: "/Users/example/private-project",
        transcript_path: "/Users/example/.codex/session.jsonl",
        stop_hook_active: false,
      }),
      dataDir,
      postPayload: async (request) => {
        posted.push(request);
        return { ok: true, status: 200 };
      },
    });

    const storage = openStorage(dataDir);
    const snapshot = storage.getLatestLoopSnapshot();
    storage.close();
    const serialized = JSON.stringify({ result, snapshot });

    expect(result).toEqual({ exitCode: 0, stdout: "", stderr: "" });
    expect(posted).toHaveLength(0);
    expect(snapshot).toMatchObject({
      source: "hook",
      tool: "codex",
      session_id: "session-stop",
      cwd_label: "private-project",
      event_counts: {
        prompts: 1,
      },
      privacy: {
        local_only: true,
        stores_prompt_bodies: false,
        stores_raw_paths: false,
      },
    });
    expect(serialized).not.toContain("Make this better");
    expect(serialized).not.toContain("/Users/example");
  });

  it("records pre-compact boundary metadata without storing custom instructions or posting to prompt ingest", async () => {
    const dataDir = createTempDir();
    initializePromptCoach({ dataDir });
    const posted: unknown[] = [];

    const result = await runCodexHook({
      stdin: JSON.stringify({
        hook_event_name: "PreCompact",
        session_id: "session-compact",
        turn_id: "turn-compact",
        cwd: "/Users/example/private-project",
        transcript_path: "/Users/example/.codex/session.jsonl",
        trigger: "auto",
        custom_instructions: "Keep the private token sk-proj-secret.",
      }),
      dataDir,
      postPayload: async (request) => {
        posted.push(request);
        return { ok: true, status: 200 };
      },
    });

    const storage = openStorage(dataDir);
    const boundaries = storage.listCompactBoundaries({ limit: 10 }).items;
    storage.close();
    const serialized = JSON.stringify({ result, boundaries });

    expect(result).toEqual({ exitCode: 0, stdout: "", stderr: "" });
    expect(posted).toHaveLength(0);
    expect(boundaries[0]).toMatchObject({
      tool: "codex",
      event_name: "PreCompact",
      trigger: "auto",
      session_id: "session-compact",
      turn_id: "turn-compact",
      cwd_label: "private-project",
    });
    expect(boundaries[0]?.content_hash).toMatch(/^compact_[a-f0-9]{16}$/);
    expect(serialized).not.toContain("Keep the private token");
    expect(serialized).not.toContain("sk-proj-secret");
    expect(serialized).not.toContain("/Users/example");
  });
});

async function seedPrompt(
  dataDir: string,
  tool: "claude-code" | "codex",
): Promise<void> {
  initializePromptCoach({ dataDir });
  const storage = openStorage(dataDir);
  try {
    const event =
      tool === "codex"
        ? normalizeCodexPayload(
            {
              session_id: "session-stop",
              turn_id: "turn-stop",
              transcript_path: "/Users/example/.codex/session.jsonl",
              cwd: "/Users/example/private-project",
              hook_event_name: "UserPromptSubmit",
              model: "gpt-5-codex",
              prompt: "Make this better",
            },
            new Date("2026-07-04T00:59:00.000Z"),
          )
        : normalizeClaudeCodePayload(
            {
              session_id: "session-stop",
              transcript_path: "/Users/example/.claude/session.jsonl",
              cwd: "/Users/example/private-project",
              permission_mode: "default",
              hook_event_name: "UserPromptSubmit",
              prompt: "Make this better",
            },
            new Date("2026-07-04T00:59:00.000Z"),
          );
    await storage.storePrompt({
      event,
      redaction: redactPrompt(event.prompt, "mask"),
    });
  } finally {
    storage.close();
  }
}

function openStorage(
  dataDir: string,
): ReturnType<typeof createSqlitePromptStorage> {
  const init = initializePromptCoach({ dataDir });
  return createSqlitePromptStorage({
    dataDir,
    hmacSecret: init.hookAuth.web_session_secret,
    now: () => new Date("2026-07-04T01:00:00.000Z"),
  });
}

function createTempDir(): string {
  const dir = join(tmpdir(), `prompt-coach-hook-${randomUUID()}`);
  mkdirSync(dir, { recursive: true });
  tempDirs.push(dir);
  return dir;
}
