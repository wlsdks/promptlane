import { describe, expect, it } from "vitest";

import type { CompactBoundary } from "../storage/compact-boundaries.js";
import type { LoopSnapshot } from "./types.js";
import { createLoopdeckStatus } from "./status.js";

describe("createLoopdeckStatus", () => {
  it("returns ready status with a safe latest snapshot and compact refresh action", () => {
    const status = createLoopdeckStatus({
      snapshots: [loopSnapshot()],
      compactBoundaries: [compactBoundary()],
    });
    const serialized = JSON.stringify(status);

    expect(status).toMatchObject({
      status: "ready",
      snapshot_count: 1,
      latest_snapshot: {
        id: "loop_status",
        project: "private-project",
        prompt_count: 2,
        average_prompt_score: 58,
        outcome_status: "passed",
      },
      latest_compact_boundary: {
        event_name: "PostCompact",
        trigger: "auto",
        after_latest_snapshot: true,
      },
      next_action: "prompt-coach loop collect",
      next_actions: expect.arrayContaining([
        expect.stringContaining("prompt-coach loop collect"),
      ]),
      privacy: {
        local_only: true,
        external_calls: false,
        returns_prompt_bodies: false,
        returns_raw_paths: false,
        returns_compact_content: false,
      },
    });
    expect(serialized).not.toContain("Make this better");
    expect(serialized).not.toContain("Compact summary with sk-proj-secret");
    expect(serialized).not.toContain("/Users/example");
  });

  it("returns empty guidance without a latest snapshot", () => {
    const status = createLoopdeckStatus({
      snapshots: [],
      compactBoundaries: [],
    });

    expect(status).toMatchObject({
      status: "empty",
      snapshot_count: 0,
      next_action: "prompt-coach loop collect",
      next_actions: expect.arrayContaining([
        expect.stringContaining("prompt-coach loop collect"),
      ]),
    });
    expect(status).not.toHaveProperty("latest_snapshot");
  });

  it("can hide latest snapshot details while preserving counts and actions", () => {
    const status = createLoopdeckStatus({
      snapshots: [loopSnapshot()],
      compactBoundaries: [],
      includeLatest: false,
    });

    expect(status.status).toBe("ready");
    expect(status.snapshot_count).toBe(1);
    expect(status.latest_snapshot).toBeUndefined();
    expect(status.next_action).toBe("prompt-coach loop brief");
  });

  it("reports project-approved memory availability without memory contents", () => {
    const status = createLoopdeckStatus({
      snapshots: [loopSnapshot()],
      compactBoundaries: [],
      projectMemoryCount: 2,
      memoryCandidate: {
        eligible: true,
        reason: "passed_with_evidence",
        snapshot_id: "loop_status",
      },
    });
    const serialized = JSON.stringify(status);

    expect(status.project_memory).toEqual({
      approved_count: 2,
      included_in_brief: true,
    });
    expect(status.memory_candidate).toEqual({
      eligible: true,
      reason: "passed_with_evidence",
      next_action: "prompt-coach loop memory-approve",
    });
    expect(status.next_actions).toEqual(
      expect.arrayContaining([
        expect.stringContaining("prompt-coach loop memory-approve"),
      ]),
    );
    expect(serialized).not.toContain(
      "Scheduler lifecycle should stay plist-only",
    );
    expect(serialized).not.toContain("Safe summary only");
    expect(serialized).not.toContain("commit:2a91de0");
  });
});

function loopSnapshot(): LoopSnapshot {
  return {
    id: "loop_status",
    created_at: "2026-07-04T01:00:00.000Z",
    tool: "codex",
    source: "cli",
    cwd_label: "private-project",
    project_id: "proj_private",
    branch: "feature/loop-status",
    worktree_label: "loop-status-worktree",
    prompt_ids: ["prmt_one", "prmt_two"],
    event_counts: { prompts: 2 },
    quality: {
      average_prompt_score: 58,
      top_gaps: ["Missing verification"],
      unresolved_questions: [],
    },
    outcome: {
      status: "passed",
      summary: "Safe summary only",
      evidence_refs: ["pnpm test"],
    },
    next_brief: {
      generated: true,
      summary: "Use safe summary",
    },
    privacy: {
      local_only: true,
      stores_prompt_bodies: false,
      stores_raw_paths: false,
    },
  };
}

function compactBoundary(): CompactBoundary {
  return {
    id: "cmp_status",
    created_at: "2026-07-04T01:05:00.000Z",
    tool: "claude-code",
    event_name: "PostCompact",
    trigger: "auto",
    cwd_label: "private-project",
    project_id: "proj_private",
    content_hash: "hash_only",
    privacy: {
      local_only: true,
      stores_prompt_bodies: false,
      stores_raw_paths: false,
      stores_compact_content: false,
    },
  };
}
