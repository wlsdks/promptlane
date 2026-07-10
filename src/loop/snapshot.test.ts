import { describe, expect, it } from "vitest";

import type { PromptSummary } from "../storage/ports.js";
import { createLoopSnapshotFromPrompts } from "./snapshot.js";

describe("createLoopSnapshotFromPrompts", () => {
  it("creates a privacy-safe loop snapshot from prompt summaries", () => {
    const snapshot = createLoopSnapshotFromPrompts({
      now: new Date("2026-07-04T01:00:00.000Z"),
      source: "cli",
      prompts: [
        promptSummary({
          id: "prmt_weak",
          cwd: "/Users/example/private-project",
          prompt_length: 18,
          quality_score: 28,
          quality_gaps: ["Goal clarity", "Verification criteria"],
          session_id: "session-a",
          snippet: "Make this better",
          tool: "codex",
        }),
        promptSummary({
          id: "prmt_strong",
          cwd: "/Users/example/private-project",
          prompt_length: 140,
          quality_score: 88,
          quality_gaps: [],
          session_id: "session-a",
          snippet: "Implement the scoped fix and run tests",
          tool: "codex",
        }),
      ],
      project: {
        cwdLabel: "private-project",
        projectId: "proj_abc123",
        gitRootHash: "git_789",
        branch: "codex/agent-loop-memory-design",
        worktreeLabel: "worktree-agent-loop",
      },
    });

    expect(snapshot).toMatchObject({
      source: "cli",
      tool: "codex",
      session_id: "session-a",
      cwd_label: "private-project",
      project_id: "proj_abc123",
      git_root_hash: "git_789",
      branch: "codex/agent-loop-memory-design",
      worktree_label: "worktree-agent-loop",
      prompt_ids: ["prmt_weak", "prmt_strong"],
      event_counts: {
        prompts: 2,
      },
      quality: {
        average_prompt_score: 58,
        top_gaps: ["Goal clarity", "Verification criteria"],
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
        local_only: true,
        stores_prompt_bodies: false,
        stores_raw_paths: false,
      },
    });
    expect(JSON.stringify(snapshot)).not.toContain("Make this better");
    expect(JSON.stringify(snapshot)).not.toContain("/Users/example");
  });

  it("returns an empty snapshot for an empty archive", () => {
    const snapshot = createLoopSnapshotFromPrompts({
      now: new Date("2026-07-04T01:00:00.000Z"),
      source: "cli",
      prompts: [],
      project: {
        cwdLabel: "unknown",
        projectId: "proj_empty",
      },
    });

    expect(snapshot.tool).toBe("unknown");
    expect(snapshot.prompt_ids).toEqual([]);
    expect(snapshot.event_counts.prompts).toBe(0);
    expect(snapshot.quality.average_prompt_score).toBeUndefined();
    expect(snapshot.outcome.summary).toBe(
      "Loop snapshot collected from 0 prompts.",
    );
  });

  it("preserves explicit hook metadata when the session has no prompts", () => {
    const snapshot = createLoopSnapshotFromPrompts({
      now: new Date("2026-07-04T01:00:00.000Z"),
      source: "hook",
      tool: "codex",
      sessionId: "session-current",
      prompts: [],
      project: {
        cwdLabel: "private-project",
        projectId: "proj_current",
      },
    });

    expect(snapshot).toMatchObject({
      tool: "codex",
      session_id: "session-current",
      prompt_ids: [],
      event_counts: { prompts: 0 },
    });
  });
});

function promptSummary(
  patch: Partial<PromptSummary> & Pick<PromptSummary, "id">,
): PromptSummary {
  return {
    id: patch.id,
    tool: patch.tool ?? "claude-code",
    source_event: "UserPromptSubmit",
    session_id: patch.session_id ?? "session-test",
    cwd: patch.cwd ?? "/Users/example/private-project",
    created_at: "2026-07-04T00:59:00.000Z",
    received_at: "2026-07-04T00:59:01.000Z",
    snippet: patch.snippet ?? "redacted snippet",
    prompt_length: patch.prompt_length ?? 30,
    is_sensitive: false,
    excluded_from_analysis: false,
    redaction_policy: "mask",
    adapter_version: "test",
    index_status: "indexed",
    tags: [],
    quality_gaps: patch.quality_gaps ?? [],
    quality_score: patch.quality_score ?? 75,
    quality_score_band: "strong",
    usefulness: {
      copied_count: 0,
      reused_count: 0,
      bookmarked: false,
    },
    duplicate_count: 1,
  };
}
