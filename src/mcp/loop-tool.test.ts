import { randomUUID } from "node:crypto";
import { mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import { initializePromptCoach } from "../config/config.js";
import type { LoopSnapshot } from "../loop/types.js";
import { createSqlitePromptStorage } from "../storage/sqlite.js";
import {
  getLoopdeckStatusTool,
  prepareLoopBriefTool,
  proposeLoopMemoryCandidateTool,
  recordLoopMemoryTool,
  recordLoopOutcomeTool,
} from "./loop-tool.js";

const tempDirs: string[] = [];

afterEach(() => {
  while (tempDirs.length > 0) {
    const dir = tempDirs.pop();
    if (dir) rmSync(dir, { recursive: true, force: true });
  }
});

describe("Loopdeck MCP tools", () => {
  it("returns latest loop status without prompt bodies or raw paths", () => {
    const dataDir = seedLoopSnapshot();

    const result = getLoopdeckStatusTool({}, { dataDir });
    const serialized = JSON.stringify(result);

    expect(result).toMatchObject({
      status: "ready",
      latest_snapshot: {
        id: "loop_mcp",
        tool: "codex",
        project: "private-project",
        prompt_count: 2,
        average_prompt_score: 58,
      },
      next_actions: expect.arrayContaining([
        expect.stringContaining("prepare_loop_brief"),
      ]),
      privacy: {
        local_only: true,
        external_calls: false,
        returns_prompt_bodies: false,
        returns_raw_paths: false,
      },
    });
    expect(serialized).not.toContain("Make this better");
    expect(serialized).not.toContain("/Users/example");
  });

  it("reports compact boundaries newer than the latest loop snapshot", () => {
    const dataDir = seedLoopSnapshot({ withCompactBoundary: true });

    const result = getLoopdeckStatusTool({}, { dataDir });
    const serialized = JSON.stringify(result);

    expect(result).toMatchObject({
      latest_compact_boundary: {
        id: expect.stringMatching(/^cmp_/),
        event_name: "PostCompact",
        trigger: "auto",
        tool: "claude-code",
        created_at: "2026-07-04T01:05:00.000Z",
        after_latest_snapshot: true,
      },
      next_actions: expect.arrayContaining([
        expect.stringContaining("prompt-coach loop collect"),
      ]),
    });
    expect(serialized).not.toContain("Compact summary with sk-proj-secret");
    expect(serialized).not.toContain("/Users/example");
  });

  it("prepares a continuation brief from the latest loop snapshot", () => {
    const dataDir = seedLoopSnapshot();

    const result = prepareLoopBriefTool({}, { dataDir });
    const serialized = JSON.stringify(result);

    expect(result).toMatchObject({
      source: "latest",
      snapshot_id: "loop_mcp",
      title: "Continue agent loop loop_mcp",
      privacy: {
        local_only: true,
        external_calls: false,
        returns_prompt_bodies: false,
        returns_raw_paths: false,
        auto_submits: false,
      },
    });
    expect(result.prompt).toContain("## Goal");
    expect(result.prompt).toContain("prompt ids: prmt_one, prmt_two");
    expect(serialized).not.toContain("Make this better");
    expect(serialized).not.toContain("/Users/example");
  });

  it("includes compact boundary awareness in continuation briefs", () => {
    const dataDir = seedLoopSnapshot({ withCompactBoundary: true });

    const result = prepareLoopBriefTool({}, { dataDir });
    const serialized = JSON.stringify(result);

    expect(result).toMatchObject({
      compact_boundary: {
        event_name: "PostCompact",
        trigger: "auto",
        after_latest_snapshot: true,
      },
    });
    expect(result.prompt).toContain("## Compaction Boundary");
    expect(result.prompt).toContain("PostCompact at 2026-07-04T01:05:00.000Z");
    expect(result.prompt).toContain("Run prompt-coach loop collect again");
    expect(serialized).not.toContain("Compact summary with sk-proj-secret");
    expect(serialized).not.toContain("/Users/example");
  });

  it("returns actionable guidance when no loop snapshot exists", () => {
    const dataDir = createTempDir();
    initializePromptCoach({ dataDir });

    const result = prepareLoopBriefTool({}, { dataDir });

    expect(result).toEqual({
      is_error: true,
      error_code: "not_found",
      message:
        "No loop snapshot found. Run `prompt-coach loop collect` first.",
    });
  });

  it("records user-approved loop outcome metadata without prompt bodies or raw paths", () => {
    const dataDir = seedLoopSnapshot();

    const result = recordLoopOutcomeTool(
      {
        snapshot_id: "loop_mcp",
        status: "passed",
        summary: "Focused MCP tests and full build passed.",
        evidence_refs: ["test:src/mcp/loop-tool.test.ts", "build:pnpm-build"],
      },
      { dataDir },
    );
    const serialized = JSON.stringify(result);

    expect(result).toMatchObject({
      recorded: true,
      snapshot_id: "loop_mcp",
      outcome: {
        status: "passed",
        summary: "Focused MCP tests and full build passed.",
        evidence_refs: ["test:src/mcp/loop-tool.test.ts", "build:pnpm-build"],
      },
      privacy: {
        local_only: true,
        external_calls: false,
        stores_prompt_bodies: false,
        stores_raw_paths: false,
        returns_prompt_bodies: false,
        returns_raw_paths: false,
      },
    });
    expect(serialized).not.toContain("Make this better");
    expect(serialized).not.toContain("/Users/example");
  });

  it("proposes a memory candidate from the latest passed loop without writing memory", () => {
    const dataDir = seedLoopSnapshot({
      outcome: {
        status: "passed",
        summary:
          "Scheduler lifecycle should stay plist-only unless the user explicitly asks for launchctl mutation.",
        evidence_refs: ["commit:2a91de0", "test:pnpm test"],
      },
    });

    const result = proposeLoopMemoryCandidateTool({}, { dataDir });
    const serialized = JSON.stringify(result);

    expect(result).toMatchObject({
      eligible: true,
      reason: "passed_with_evidence",
      snapshot_id: "loop_mcp",
      candidate: {
        statement:
          "Scheduler lifecycle should stay plist-only unless the user explicitly asks for launchctl mutation.",
        evidence_refs: ["commit:2a91de0", "test:pnpm test"],
      },
      next_action:
        "Ask the user to approve this candidate before writing it into AGENTS.md, CLAUDE.md, or any memory store.",
      privacy: {
        local_only: true,
        external_calls: false,
        stores_prompt_bodies: false,
        stores_raw_paths: false,
        returns_prompt_bodies: false,
        returns_raw_paths: false,
        auto_writes_memory: false,
      },
    });
    expect(serialized).not.toContain("Make this better");
    expect(serialized).not.toContain("/Users/example");
  });

  it("records a user-approved loop memory without writing instruction files", () => {
    const dataDir = seedLoopSnapshot({
      outcome: {
        status: "passed",
        summary:
          "Scheduler lifecycle should stay plist-only unless the user explicitly asks for launchctl mutation.",
        evidence_refs: ["commit:79cb39d", "test:pnpm test"],
      },
    });

    const result = recordLoopMemoryTool(
      {
        latest: true,
        approved_by: "user",
      },
      { dataDir },
    );
    const serialized = JSON.stringify(result);

    expect(result).toMatchObject({
      recorded: true,
      memory: {
        snapshot_id: "loop_mcp",
        statement:
          "Scheduler lifecycle should stay plist-only unless the user explicitly asks for launchctl mutation.",
        evidence_refs: ["commit:79cb39d", "test:pnpm test"],
        approved_by: "user",
      },
      next_action:
        "Use this local memory as context in future loop briefs; writing AGENTS.md or CLAUDE.md still requires a separate explicit patch.",
      privacy: {
        local_only: true,
        external_calls: false,
        stores_prompt_bodies: false,
        stores_raw_paths: false,
        returns_prompt_bodies: false,
        returns_raw_paths: false,
        writes_instruction_files: false,
      },
    });
    expect(serialized).not.toContain("Make this better");
    expect(serialized).not.toContain("/Users/example");
  });

  it("rejects empty loop outcome summaries", () => {
    const dataDir = seedLoopSnapshot();

    const result = recordLoopOutcomeTool(
      {
        snapshot_id: "loop_mcp",
        status: "failed",
        summary: " ",
      },
      { dataDir },
    );

    expect(result).toEqual({
      is_error: true,
      error_code: "invalid_input",
      message: "`summary` must not be empty.",
    });
  });
});

function seedLoopSnapshot(
  options: {
    withCompactBoundary?: boolean;
    outcome?: LoopSnapshot["outcome"];
  } = {},
): string {
  const dataDir = createTempDir();
  const init = initializePromptCoach({ dataDir });
  const storage = createSqlitePromptStorage({
    dataDir,
    hmacSecret: init.hookAuth.web_session_secret,
    now: () => new Date("2026-07-04T01:05:00.000Z"),
  });
  try {
    if (options.withCompactBoundary) {
      const boundary = storage.recordCompactBoundary({
        tool: "claude-code",
        event_name: "PostCompact",
        trigger: "auto",
        session_id: "session-mcp",
        cwd: "/Users/example/private-project",
        content: "Compact summary with sk-proj-secret and /Users/example.",
      });
      storage.createLoopSnapshot(
        loopSnapshot({
          project_id: boundary.project_id,
          ...(options.outcome ? { outcome: options.outcome } : {}),
        }),
      );
    } else {
      storage.createLoopSnapshot(
        loopSnapshot(options.outcome ? { outcome: options.outcome } : {}),
      );
    }
  } finally {
    storage.close();
  }
  return dataDir;
}

function loopSnapshot(patch: Partial<LoopSnapshot> = {}): LoopSnapshot {
  return {
    id: "loop_mcp",
    created_at: "2026-07-04T01:00:00.000Z",
    tool: "codex",
    source: "cli",
    session_id: "session-mcp",
    cwd_label: "private-project",
    project_id: "proj_mcp",
    git_root_hash: "git_hash",
    branch: "codex/agent-loop-memory-design",
    worktree_label: "worktree-mcp",
    prompt_ids: ["prmt_one", "prmt_two"],
    event_counts: {
      prompts: 2,
    },
    quality: {
      average_prompt_score: 58,
      top_gaps: ["Goal clarity", "Verification criteria"],
      unresolved_questions: [],
    },
    outcome: {
      status: "unknown",
      summary: "Loop snapshot collected from 2 prompts.",
      evidence_refs: ["prompt:prmt_one", "prompt:prmt_two"],
    },
    next_brief: {
      generated: false,
      summary: "Run prompt-coach loop brief to generate the next request.",
    },
    privacy: {
      stores_prompt_bodies: false,
      stores_raw_paths: false,
      local_only: true,
    },
    ...patch,
  };
}

function createTempDir(): string {
  const dir = join(tmpdir(), `prompt-coach-loop-mcp-${randomUUID()}`);
  mkdirSync(dir, { recursive: true });
  tempDirs.push(dir);
  return dir;
}
