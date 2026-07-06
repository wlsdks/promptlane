import { describe, expect, it } from "vitest";

import { createLoopBrief } from "./brief.js";
import type { LoopSnapshot } from "./types.js";

describe("createLoopBrief", () => {
  it("creates a copy-ready continuation prompt without prompt bodies or raw paths", () => {
    const brief = createLoopBrief({
      snapshot: loopSnapshot({
        prompt_ids: ["prmt_weak", "prmt_strong"],
        quality: {
          average_prompt_score: 58,
          top_gaps: ["Goal clarity", "Verification criteria"],
          unresolved_questions: [],
        },
      }),
    });

    expect(brief.title).toBe("Continue agent loop loop_123");
    expect(brief.prompt).toContain("## Goal");
    expect(brief.prompt).toContain("Continue the current coding-agent loop");
    expect(brief.prompt).toContain("local PromptLane snapshot");
    expect(brief.prompt).not.toContain("PromptCoach");
    expect(brief.prompt).not.toContain("prompt-coach");
    expect(brief.prompt).not.toContain("Loopdeck");
    expect(brief.prompt).toContain("## Context");
    expect(brief.prompt).toContain("project: private-project");
    expect(brief.prompt).toContain("branch: codex/agent-loop-memory-design");
    expect(brief.prompt).toContain("prompt ids: prmt_weak, prmt_strong");
    expect(brief.prompt).toContain("average prompt score: 58/100");
    expect(brief.prompt).toContain("Goal clarity");
    expect(brief.prompt).toContain("## Verification");
    expect(brief.privacy).toEqual({
      local_only: true,
      returns_prompt_bodies: false,
      returns_raw_paths: false,
    });
    expect(brief.prompt).not.toContain("/Users/example");
    expect(brief.prompt).not.toContain("Make this better");
  });

  it("includes approved loop memories without prompt bodies, raw paths, or secrets", () => {
    const brief = createLoopBrief({
      snapshot: loopSnapshot({}),
      approvedMemories: [
        {
          id: "mem_safe",
          statement:
            "When a loop touches shared status surfaces, keep CLI, MCP, API, and web on one model.",
          evidence_refs: [
            "pnpm test",
            "git diff --check",
            "/Users/example/private-project/log.txt",
            "sk-proj-secret",
          ],
        },
      ],
    });

    expect(brief.prompt).toContain("## Approved Loop Memories");
    expect(brief.prompt).toContain(
      "- When a loop touches shared status surfaces, keep CLI, MCP, API, and web on one model. (evidence: pnpm test, git diff --check)",
    );
    expect(brief.prompt).not.toContain("/Users/example");
    expect(brief.prompt).not.toContain("sk-proj-secret");
    expect(brief.privacy).toMatchObject({
      returns_prompt_bodies: false,
      returns_raw_paths: false,
    });
  });

  it("omits unsafe outcome summaries from continuation prompts", () => {
    const brief = createLoopBrief({
      snapshot: loopSnapshot({
        outcome: {
          status: "unknown",
          summary:
            "Review summary should stay hidden sk-proj-secret /Users/example/private-project",
          evidence_refs: ["pnpm test"],
        },
      }),
    });

    expect(brief.prompt).toContain(
      "Outcome summary omitted because it may contain local paths or secrets.",
    );
    expect(brief.prompt).not.toContain("Review summary should stay hidden");
    expect(brief.prompt).not.toContain("sk-proj-secret");
    expect(brief.prompt).not.toContain("/Users/example");
    expect(brief.privacy).toMatchObject({
      returns_prompt_bodies: false,
      returns_raw_paths: false,
    });
  });
});

function loopSnapshot(patch: Partial<LoopSnapshot>): LoopSnapshot {
  return {
    id: "loop_123",
    created_at: "2026-07-04T01:00:00.000Z",
    tool: "codex",
    source: "cli",
    session_id: "session-a",
    cwd_label: "private-project",
    project_id: "proj_abc",
    git_root_hash: "git_123",
    branch: "codex/agent-loop-memory-design",
    worktree_label: "worktree-agent-loop",
    prompt_ids: [],
    event_counts: {
      prompts: 2,
    },
    quality: {
      average_prompt_score: 58,
      top_gaps: [],
      unresolved_questions: [],
    },
    outcome: {
      status: "unknown",
      summary: "Loop snapshot collected from 2 prompts.",
      evidence_refs: ["prompt:prmt_weak", "prompt:prmt_strong"],
    },
    next_brief: {
      generated: false,
      summary: "Run promptlane loop brief to generate the next request.",
    },
    privacy: {
      stores_prompt_bodies: false,
      stores_raw_paths: false,
      local_only: true,
    },
    ...patch,
  };
}
