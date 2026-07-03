import { randomUUID } from "node:crypto";
import { mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import { normalizeClaudeCodePayload } from "../../adapters/claude-code.js";
import { initializePromptCoach } from "../../config/config.js";
import { redactPrompt } from "../../redaction/redact.js";
import { createSqlitePromptStorage } from "../../storage/sqlite.js";
import { loopBriefForCli, loopCollectForCli, loopStatusForCli } from "./loop.js";

const tempDirs: string[] = [];

afterEach(() => {
  while (tempDirs.length > 0) {
    const dir = tempDirs.pop();
    if (dir) rmSync(dir, { recursive: true, force: true });
  }
});

describe("loop CLI command", () => {
  it("collects a privacy-safe loop snapshot as JSON and text", async () => {
    const dataDir = createTempDir();
    await seedPrompts(dataDir);

    const json = loopCollectForCli({
      dataDir,
      json: true,
      cwdPrefix: "/Users/example/private-project",
      limit: 10,
      now: new Date("2026-07-04T01:00:00.000Z"),
      cwd: "/Users/example/private-project",
      branch: "codex/agent-loop-memory-design",
    });
    const parsed = JSON.parse(json) as {
      id: string;
      prompt_ids: string[];
      cwd_label: string;
      branch: string;
      privacy: { stores_prompt_bodies: boolean; stores_raw_paths: boolean };
    };

    expect(parsed.id).toMatch(/^loop_/);
    expect(parsed.prompt_ids).toHaveLength(2);
    expect(parsed.cwd_label).toBe("private-project");
    expect(parsed.branch).toBe("codex/agent-loop-memory-design");
    expect(parsed.privacy).toMatchObject({
      stores_prompt_bodies: false,
      stores_raw_paths: false,
    });
    expect(json).not.toContain("Make this better");
    expect(json).not.toContain("/Users/example");

    const text = loopCollectForCli({
      dataDir,
      cwdPrefix: "/Users/example/private-project",
      limit: 10,
      now: new Date("2026-07-04T01:00:00.000Z"),
      cwd: "/Users/example/private-project",
    });

    expect(text).toContain("Loop snapshot collected");
    expect(text).toContain("project private-project");
    expect(text).toContain("prompts 2");
    expect(text).toContain("Privacy: local-only");
    expect(text).not.toContain("Make this better");
    expect(text).not.toContain("/Users/example");
  });

  it("prints the latest continuation brief without prompt bodies", async () => {
    const dataDir = createTempDir();
    await seedPrompts(dataDir);
    loopCollectForCli({
      dataDir,
      cwdPrefix: "/Users/example/private-project",
      now: new Date("2026-07-04T01:00:00.000Z"),
      cwd: "/Users/example/private-project",
    });

    const text = loopBriefForCli({ dataDir });

    expect(text).toContain("Continue agent loop");
    expect(text).toContain("## Goal");
    expect(text).toContain("## Verification");
    expect(text).not.toContain("Make this better");
    expect(text).not.toContain("/Users/example");
  });

  it("marks continuation briefs when compact happened after the latest snapshot", async () => {
    const dataDir = createTempDir();
    await seedPrompts(dataDir);
    loopCollectForCli({
      dataDir,
      cwdPrefix: "/Users/example/private-project",
      now: new Date("2026-07-04T01:00:00.000Z"),
      cwd: "/Users/example/private-project",
    });
    seedCompactBoundary(dataDir);

    const text = loopBriefForCli({ dataDir });

    expect(text).toContain("## Compaction Boundary");
    expect(text).toContain("PostCompact at 2026-07-04T01:05:00.000Z");
    expect(text).toContain("Run prompt-coach loop collect again");
    expect(text).not.toContain("Compact summary with sk-proj-secret");
    expect(text).not.toContain("/Users/example");
  });

  it("prints compact-aware loop status without prompt bodies or raw paths", async () => {
    const dataDir = createTempDir();
    await seedPrompts(dataDir);
    loopCollectForCli({
      dataDir,
      cwdPrefix: "/Users/example/private-project",
      now: new Date("2026-07-04T01:00:00.000Z"),
      cwd: "/Users/example/private-project",
    });
    seedCompactBoundary(dataDir);

    const text = loopStatusForCli({ dataDir });

    expect(text).toContain("Loopdeck status ready");
    expect(text).toContain("snapshots 1");
    expect(text).toContain("latest loop");
    expect(text).toContain("project private-project");
    expect(text).toContain("compact boundary PostCompact at 2026-07-04T01:05:00.000Z");
    expect(text).toContain("Next: prompt-coach loop collect");
    expect(text).not.toContain("Make this better");
    expect(text).not.toContain("Compact summary with sk-proj-secret");
    expect(text).not.toContain("/Users/example");
  });

  it("prints empty loop status guidance", () => {
    const dataDir = createTempDir();
    initializePromptCoach({ dataDir });

    const text = loopStatusForCli({ dataDir });

    expect(text).toContain("Loopdeck status empty");
    expect(text).toContain("snapshots 0");
    expect(text).toContain("Next: prompt-coach loop collect");
  });
});

async function seedPrompts(dataDir: string): Promise<void> {
  const init = initializePromptCoach({ dataDir });
  const storage = createSqlitePromptStorage({
    dataDir,
    hmacSecret: init.hookAuth.web_session_secret,
    now: nextDate([
      "2026-07-04T00:58:00.000Z",
      "2026-07-04T00:59:00.000Z",
    ]),
  });
  try {
    await storeClaudePrompt(
      storage,
      "Make this better",
      "2026-07-04T00:58:00.000Z",
    );
    await storeClaudePrompt(
      storage,
      "Implement the loop snapshot CLI, keep scope to storage and CLI, run the focused Vitest tests, and summarize risks.",
      "2026-07-04T00:59:00.000Z",
    );
  } finally {
    storage.close();
  }
}

async function storeClaudePrompt(
  storage: ReturnType<typeof createSqlitePromptStorage>,
  prompt: string,
  receivedAt: string,
): Promise<void> {
  const event = normalizeClaudeCodePayload(
    {
      session_id: "session-loop-cli",
      transcript_path: "/Users/example/.claude/session.jsonl",
      cwd: "/Users/example/private-project",
      permission_mode: "default",
      hook_event_name: "UserPromptSubmit",
      prompt,
    },
    new Date(receivedAt),
  );

  await storage.storePrompt({
    event,
    redaction: redactPrompt(event.prompt, "mask"),
  });
}

function seedCompactBoundary(dataDir: string): void {
  const init = initializePromptCoach({ dataDir });
  const storage = createSqlitePromptStorage({
    dataDir,
    hmacSecret: init.hookAuth.web_session_secret,
    now: () => new Date("2026-07-04T01:05:00.000Z"),
  });
  try {
    storage.recordCompactBoundary({
      tool: "claude-code",
      event_name: "PostCompact",
      trigger: "auto",
      session_id: "session-loop-cli",
      cwd: "/Users/example/private-project",
      content: "Compact summary with sk-proj-secret and /Users/example.",
    });
  } finally {
    storage.close();
  }
}

function nextDate(values: string[]): () => Date {
  let index = 0;
  return () => new Date(values[Math.min(index++, values.length - 1)]!);
}

function createTempDir(): string {
  const dir = join(tmpdir(), `prompt-coach-loop-${randomUUID()}`);
  mkdirSync(dir, { recursive: true });
  tempDirs.push(dir);
  return dir;
}
