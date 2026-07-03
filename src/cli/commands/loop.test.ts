import { randomUUID } from "node:crypto";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import { normalizeClaudeCodePayload } from "../../adapters/claude-code.js";
import { initializePromptCoach } from "../../config/config.js";
import { redactPrompt } from "../../redaction/redact.js";
import { createSqlitePromptStorage } from "../../storage/sqlite.js";
import {
  loopBriefForCli,
  loopCollectForCli,
  loopInstructionPatchApplyForCli,
  loopInstructionPatchForCli,
  loopMemoryApproveForCli,
  loopMemoryCandidateForCli,
  loopStatusForCli,
} from "./loop.js";

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

  it("collects a cron-safe service loop snapshot without prompt bodies or raw paths", async () => {
    const dataDir = createTempDir();
    await seedPrompts(dataDir);

    const json = loopCollectForCli({
      dataDir,
      json: true,
      cwdPrefix: "/Users/example/private-project",
      limit: 10,
      now: new Date("2026-07-04T02:00:00.000Z"),
      cwd: "/Users/example/private-project",
      source: "service",
    });
    const parsed = JSON.parse(json) as {
      source: string;
      prompt_ids: string[];
      privacy: { stores_prompt_bodies: boolean; stores_raw_paths: boolean };
    };

    expect(parsed.source).toBe("service");
    expect(parsed.prompt_ids).toHaveLength(2);
    expect(parsed.privacy).toMatchObject({
      stores_prompt_bodies: false,
      stores_raw_paths: false,
    });
    expect(json).not.toContain("Make this better");
    expect(json).not.toContain("/Users/example");

    const text = loopCollectForCli({
      dataDir,
      cwdPrefix: "/Users/example/private-project",
      now: new Date("2026-07-04T02:00:00.000Z"),
      cwd: "/Users/example/private-project",
      source: "service",
    });

    expect(text).toContain("source service");
    expect(text).toContain("Next: prompt-coach loop brief");
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

  it("prints approved loop memories in the latest continuation brief", async () => {
    const dataDir = createTempDir();
    await seedPrompts(dataDir);
    const snapshot = JSON.parse(
      loopCollectForCli({
        dataDir,
        json: true,
        cwdPrefix: "/Users/example/private-project",
        now: new Date("2026-07-04T01:00:00.000Z"),
        cwd: "/Users/example/private-project",
      }),
    ) as { id: string };
    seedLoopOutcome(dataDir, snapshot.id);
    loopMemoryApproveForCli({ dataDir, approvedBy: "user" });
    seedOtherProjectMemory(dataDir);

    const text = loopBriefForCli({ dataDir });

    expect(text).toContain("## Approved Loop Memories");
    expect(text).toContain(
      "Scheduler lifecycle should stay plist-only unless the user explicitly asks for launchctl mutation.",
    );
    expect(text).not.toContain("This unrelated project memory should not appear");
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
    const snapshot = JSON.parse(
      loopCollectForCli({
        dataDir,
        json: true,
        cwdPrefix: "/Users/example/private-project",
        now: new Date("2026-07-04T01:00:00.000Z"),
        cwd: "/Users/example/private-project",
      }),
    ) as { id: string };
    seedLoopOutcome(dataDir, snapshot.id);
    loopMemoryApproveForCli({ dataDir, approvedBy: "user" });
    seedOtherProjectMemory(dataDir);
    seedCompactBoundary(dataDir);

    const text = loopStatusForCli({ dataDir });

    expect(text).toContain("Loopdeck status ready");
    expect(text).toContain("snapshots 2");
    expect(text).toContain("approved memories 1");
    expect(text).toContain("memory candidate eligible");
    expect(text).toContain("latest loop");
    expect(text).toContain("project private-project");
    expect(text).toContain("compact boundary PostCompact at 2026-07-04T01:05:00.000Z");
    expect(text).toContain("Next: prompt-coach loop collect");
    expect(text).not.toContain("Make this better");
    expect(text).not.toContain("Compact summary with sk-proj-secret");
    expect(text).not.toContain("/Users/example");

    const json = loopStatusForCli({ dataDir, json: true });
    const parsed = JSON.parse(json) as {
      latest_snapshot?: { outcome_status?: string };
      project_memory?: { approved_count?: number; included_in_brief?: boolean };
      memory_candidate?: {
        eligible?: boolean;
        reason?: string;
        next_action?: string;
      };
      next_actions?: string[];
      privacy?: { returns_compact_content?: boolean };
    };

    expect(parsed.latest_snapshot?.outcome_status).toBe("passed");
    expect(parsed.project_memory).toEqual({
      approved_count: 1,
      included_in_brief: true,
    });
    expect(parsed.memory_candidate).toEqual({
      eligible: true,
      reason: "passed_with_evidence",
      next_action: "prompt-coach loop memory-approve",
    });
    expect(parsed.next_actions).toEqual(
      expect.arrayContaining([
        expect.stringContaining("prompt-coach loop collect"),
        expect.stringContaining("prompt-coach loop memory-approve"),
      ]),
    );
    expect(parsed.privacy?.returns_compact_content).toBe(false);
    expect(json).not.toContain(
      "Scheduler lifecycle should stay plist-only unless the user explicitly asks for launchctl mutation.",
    );
    expect(json).not.toContain("commit:2a91de0");
    expect(json).not.toContain("This unrelated project memory should not appear");
  });

  it("prints empty loop status guidance", () => {
    const dataDir = createTempDir();
    initializePromptCoach({ dataDir });

    const text = loopStatusForCli({ dataDir });

    expect(text).toContain("Loopdeck status empty");
    expect(text).toContain("snapshots 0");
    expect(text).toContain("Next: prompt-coach loop collect");
  });

  it("prints a privacy-safe memory candidate decision for the latest passed loop", async () => {
    const dataDir = createTempDir();
    await seedPrompts(dataDir);
    const snapshot = JSON.parse(
      loopCollectForCli({
        dataDir,
        json: true,
        cwdPrefix: "/Users/example/private-project",
        now: new Date("2026-07-04T01:00:00.000Z"),
        cwd: "/Users/example/private-project",
      }),
    ) as { id: string };
    seedLoopOutcome(dataDir, snapshot.id);

    const json = loopMemoryCandidateForCli({ dataDir, json: true });
    const parsed = JSON.parse(json) as {
      eligible: boolean;
      candidate?: { statement: string; evidence_refs: string[] };
      privacy: { auto_writes_memory: boolean; external_calls: boolean };
    };

    expect(parsed.eligible).toBe(true);
    expect(parsed.candidate?.statement).toContain(
      "Scheduler lifecycle should stay plist-only",
    );
    expect(parsed.candidate?.evidence_refs).toContain("commit:2a91de0");
    expect(parsed.privacy.auto_writes_memory).toBe(false);
    expect(parsed.privacy.external_calls).toBe(false);
    expect(json).not.toContain("Make this better");
    expect(json).not.toContain("/Users/example");

    const text = loopMemoryCandidateForCli({ dataDir });

    expect(text).toContain("Loop memory candidate eligible");
    expect(text).toContain("reason passed_with_evidence");
    expect(text).toContain("Next: review and approve before writing memory");
    expect(text).not.toContain("Make this better");
    expect(text).not.toContain("/Users/example");
  });

  it("records an approved memory from the latest eligible candidate", async () => {
    const dataDir = createTempDir();
    await seedPrompts(dataDir);
    const snapshot = JSON.parse(
      loopCollectForCli({
        dataDir,
        json: true,
        cwdPrefix: "/Users/example/private-project",
        now: new Date("2026-07-04T01:00:00.000Z"),
        cwd: "/Users/example/private-project",
      }),
    ) as { id: string };
    seedLoopOutcome(dataDir, snapshot.id);

    const json = loopMemoryApproveForCli({
      dataDir,
      json: true,
      approvedBy: "user",
    });
    const parsed = JSON.parse(json) as {
      recorded: boolean;
      memory: { statement: string; evidence_refs: string[] };
      privacy: { writes_instruction_files: boolean };
    };

    expect(parsed.recorded).toBe(true);
    expect(parsed.memory.statement).toContain(
      "Scheduler lifecycle should stay plist-only",
    );
    expect(parsed.memory.evidence_refs).toContain("commit:2a91de0");
    expect(parsed.privacy.writes_instruction_files).toBe(false);
    expect(json).not.toContain("Make this better");
    expect(json).not.toContain("/Users/example");

    const text = loopMemoryApproveForCli({ dataDir, approvedBy: "user" });

    expect(text).toContain("Loop memory recorded");
    expect(text).toContain("approved by user");
    expect(text).toContain("Next: use recorded memory as local context");
    expect(text).not.toContain("Make this better");
    expect(text).not.toContain("/Users/example");
  });

  it("prints an instruction patch proposal from the latest approved memory without writing files", async () => {
    const dataDir = createTempDir();
    await seedPrompts(dataDir);
    const snapshot = JSON.parse(
      loopCollectForCli({
        dataDir,
        json: true,
        cwdPrefix: "/Users/example/private-project",
        now: new Date("2026-07-04T01:00:00.000Z"),
        cwd: "/Users/example/private-project",
      }),
    ) as { id: string };
    seedLoopOutcome(dataDir, snapshot.id);
    loopMemoryApproveForCli({ dataDir, approvedBy: "user" });

    const json = loopInstructionPatchForCli({
      dataDir,
      json: true,
      targetFile: "AGENTS.md",
    });
    const parsed = JSON.parse(json) as {
      target_file: string;
      writes_files: boolean;
      diff: string;
      privacy: { writes_instruction_files: boolean };
    };

    expect(parsed.target_file).toBe("AGENTS.md");
    expect(parsed.writes_files).toBe(false);
    expect(parsed.diff).toContain("## Loopdeck Memories");
    expect(parsed.diff).toContain("Scheduler lifecycle should stay plist-only");
    expect(parsed.privacy.writes_instruction_files).toBe(false);
    expect(json).not.toContain("Make this better");
    expect(json).not.toContain("/Users/example");

    const text = loopInstructionPatchForCli({ dataDir, targetFile: "AGENTS.md" });

    expect(text).toContain("Loop instruction patch proposal");
    expect(text).toContain("target AGENTS.md");
    expect(text).toContain("writes files no");
    expect(text).toContain("Next: review");
    expect(text).not.toContain("Make this better");
    expect(text).not.toContain("/Users/example");
  });

  it("applies an approved instruction patch only with explicit confirmation", async () => {
    const dataDir = createTempDir();
    const projectDir = createTempDir();
    writeFileSync(join(projectDir, "AGENTS.md"), "# Project Rules\n");
    await seedPrompts(dataDir);
    const snapshot = JSON.parse(
      loopCollectForCli({
        dataDir,
        json: true,
        cwdPrefix: "/Users/example/private-project",
        now: new Date("2026-07-04T01:00:00.000Z"),
        cwd: "/Users/example/private-project",
      }),
    ) as { id: string };
    seedLoopOutcome(dataDir, snapshot.id);
    loopMemoryApproveForCli({ dataDir, approvedBy: "user" });

    expect(() =>
      loopInstructionPatchApplyForCli({
        dataDir,
        targetDir: projectDir,
        targetFile: "AGENTS.md",
      }),
    ).toThrow("Instruction patch apply requires --confirm-apply.");

    const json = loopInstructionPatchApplyForCli({
      dataDir,
      json: true,
      targetDir: projectDir,
      targetFile: "AGENTS.md",
      confirmApply: true,
    });
    const parsed = JSON.parse(json) as {
      applied: boolean;
      writes_files: boolean;
      target_file: string;
      privacy: { writes_instruction_files: boolean };
    };

    expect(parsed).toMatchObject({
      applied: true,
      writes_files: true,
      target_file: "AGENTS.md",
      privacy: { writes_instruction_files: true },
    });
    expect(json).not.toContain(projectDir);
    expect(json).not.toContain("/Users/example");
    expect(readFileSync(join(projectDir, "AGENTS.md"), "utf8")).toContain(
      "source_memory:",
    );

    const text = loopInstructionPatchApplyForCli({
      dataDir,
      targetDir: projectDir,
      targetFile: "AGENTS.md",
      confirmApply: true,
    });

    expect(text).toContain("Loop instruction patch applied");
    expect(text).toContain("already present yes");
    expect(text).not.toContain(projectDir);
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

function seedLoopOutcome(dataDir: string, snapshotId: string): void {
  const init = initializePromptCoach({ dataDir });
  const storage = createSqlitePromptStorage({
    dataDir,
    hmacSecret: init.hookAuth.web_session_secret,
  });
  try {
    storage.recordLoopOutcome(snapshotId, {
      status: "passed",
      summary:
        "Scheduler lifecycle should stay plist-only unless the user explicitly asks for launchctl mutation.",
      evidence_refs: ["commit:2a91de0", "test:pnpm test"],
    });
  } finally {
    storage.close();
  }
}

function seedOtherProjectMemory(dataDir: string): void {
  const init = initializePromptCoach({ dataDir });
  const storage = createSqlitePromptStorage({
    dataDir,
    hmacSecret: init.hookAuth.web_session_secret,
    now: () => new Date("2026-07-04T01:30:00.000Z"),
  });
  try {
    const latest = storage.getLatestLoopSnapshot();
    if (!latest) return;
    storage.createLoopSnapshot({
      ...latest,
      id: "loop_other_project",
      created_at: "2026-07-03T01:00:00.000Z",
      cwd_label: "other-project",
      project_id: "proj_other",
      outcome: {
        status: "passed",
        summary: "This unrelated project memory should not appear.",
        evidence_refs: ["commit:other"],
      },
    });
    storage.recordLoopMemory({
      snapshot_id: "loop_other_project",
      title: "Other project memory",
      statement: "This unrelated project memory should not appear.",
      evidence_refs: ["commit:other"],
      approved_by: "user",
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
