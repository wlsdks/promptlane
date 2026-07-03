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

  it("summarizes worktree and session activity without prompt bodies or raw paths", () => {
    const status = createLoopdeckStatus({
      snapshots: [
        loopSnapshot({
          id: "loop_latest",
          session_id: "session-two",
          branch: "codex/agent-loop-memory-design",
          worktree_label: "agent-loop-worktree",
        }),
        loopSnapshot({
          id: "loop_previous",
          session_id: "session-one",
          branch: "codex/agent-loop-memory-design",
          worktree_label: "main-worktree",
        }),
      ],
      compactBoundaries: [],
      includeLatest: false,
    });
    const serialized = JSON.stringify(status);

    expect(status.activity).toEqual({
      active_worktrees: 2,
      active_sessions: 2,
      latest_branch: "codex/agent-loop-memory-design",
      latest_worktree: "agent-loop-worktree",
      needs_review: true,
      next_action:
        "compare loop snapshots by worktree before merging agent output",
      worktrees: [
        {
          worktree: "agent-loop-worktree",
          branch: "codex/agent-loop-memory-design",
          sessions: 1,
          snapshots: 1,
          latest_snapshot_id: "loop_latest",
          latest_created_at: "2026-07-04T01:00:00.000Z",
          latest_outcome_status: "passed",
          evidence_count: 1,
        },
        {
          worktree: "main-worktree",
          branch: "codex/agent-loop-memory-design",
          sessions: 1,
          snapshots: 1,
          latest_snapshot_id: "loop_previous",
          latest_created_at: "2026-07-04T01:00:00.000Z",
          latest_outcome_status: "passed",
          evidence_count: 1,
        },
      ],
      command_center: {
        title: "Multi-worktree review",
        primary_action: "compare worktrees before merge",
        review_packet: {
          title: "Review-before-merge packet",
          status: "ready",
          summary: "2 ready, 0 needs review, 0 missing evidence",
          next_action: "compare ready evidence before merge",
          ready_count: 2,
          needs_review_count: 0,
          missing_evidence_count: 0,
          actions: ["compare evidence before merge"],
          checklist: [
            {
              label: "Compare ready evidence before merge",
              status: "required",
              action: "compare evidence before merge",
            },
          ],
        },
        review_items: [
          {
            worktree: "agent-loop-worktree",
            branch: "codex/agent-loop-memory-design",
            sessions: 1,
            snapshots: 1,
            latest_snapshot_id: "loop_latest",
            latest_created_at: "2026-07-04T01:00:00.000Z",
            latest_outcome_status: "passed",
            evidence_count: 1,
            recommendation: "ready for continuation",
            continuation_command:
              "prompt-coach loop brief --worktree agent-loop-worktree --branch codex/agent-loop-memory-design",
            merge_readiness: {
              status: "ready",
              evidence: "evidence present",
              next_action: "compare evidence before merge",
            },
          },
          {
            worktree: "main-worktree",
            branch: "codex/agent-loop-memory-design",
            sessions: 1,
            snapshots: 1,
            latest_snapshot_id: "loop_previous",
            latest_created_at: "2026-07-04T01:00:00.000Z",
            latest_outcome_status: "passed",
            evidence_count: 1,
            recommendation: "ready for continuation",
            continuation_command:
              "prompt-coach loop brief --worktree main-worktree --branch codex/agent-loop-memory-design",
            merge_readiness: {
              status: "ready",
              evidence: "evidence present",
              next_action: "compare evidence before merge",
            },
          },
        ],
      },
    });
    expect(serialized).not.toContain("Make this better");
    expect(serialized).not.toContain("/Users/example");
    expect(serialized).not.toContain("sk-proj-secret");
  });

  it("builds a raw-free multi-worktree command center for merge review", () => {
    const status = createLoopdeckStatus({
      snapshots: [
        loopSnapshot({
          id: "loop_needs_review",
          session_id: "session-two",
          branch: "feature/agent-loop",
          worktree_label: "agent-loop-worktree",
          outcome: {
            status: "unknown",
            summary: "Investigate before merge",
            evidence_refs: ["pnpm test", "/Users/example/private-project/log.txt"],
          },
        }),
        loopSnapshot({
          id: "loop_ready",
          session_id: "session-one",
          branch: "main",
          worktree_label: "main-worktree",
        }),
        loopSnapshot({
          id: "loop_missing_evidence",
          session_id: "session-three",
          branch: "feature/missing-evidence",
          worktree_label: "missing-evidence-worktree",
          outcome: {
            status: "passed",
            summary: "Ready but no evidence should block merge review.",
            evidence_refs: [],
          },
        }),
      ],
      compactBoundaries: [],
      includeLatest: false,
    });
    const serialized = JSON.stringify(status);

    expect(status.activity.command_center).toEqual({
      title: "Multi-worktree review",
      primary_action: "review agent-loop-worktree before merge",
      review_packet: {
        title: "Review-before-merge packet",
        status: "blocked",
        summary: "1 ready, 1 needs review, 1 missing evidence",
        next_action: "record missing evidence before merge",
        ready_count: 1,
        needs_review_count: 1,
        missing_evidence_count: 1,
        actions: [
          "record loop outcome evidence",
          "review outcome before merge",
          "compare evidence before merge",
        ],
        checklist: [
          {
            label: "Record missing evidence before merge",
            status: "required",
            action: "record loop outcome evidence",
          },
          {
            label: "Review non-passing worktrees before merge",
            status: "required",
            action: "review outcome before merge",
          },
          {
            label: "Compare ready evidence before merge",
            status: "required",
            action: "compare evidence before merge",
          },
        ],
      },
      review_items: [
        {
          worktree: "agent-loop-worktree",
          branch: "feature/agent-loop",
          latest_snapshot_id: "loop_needs_review",
          latest_created_at: "2026-07-04T01:00:00.000Z",
          latest_outcome_status: "unknown",
          evidence_count: 2,
          sessions: 1,
          snapshots: 1,
          recommendation: "review before merge",
          continuation_command:
            "prompt-coach loop brief --worktree agent-loop-worktree --branch feature/agent-loop",
          merge_readiness: {
            status: "needs_review",
            evidence: "evidence present",
            next_action: "review outcome before merge",
          },
        },
        {
          worktree: "main-worktree",
          branch: "main",
          latest_snapshot_id: "loop_ready",
          latest_created_at: "2026-07-04T01:00:00.000Z",
          latest_outcome_status: "passed",
          evidence_count: 1,
          sessions: 1,
          snapshots: 1,
          recommendation: "ready for continuation",
          continuation_command:
            "prompt-coach loop brief --worktree main-worktree --branch main",
          merge_readiness: {
            status: "ready",
            evidence: "evidence present",
            next_action: "compare evidence before merge",
          },
        },
        {
          worktree: "missing-evidence-worktree",
          branch: "feature/missing-evidence",
          latest_snapshot_id: "loop_missing_evidence",
          latest_created_at: "2026-07-04T01:00:00.000Z",
          latest_outcome_status: "passed",
          evidence_count: 0,
          sessions: 1,
          snapshots: 1,
          recommendation: "ready for continuation",
          continuation_command:
            "prompt-coach loop brief --worktree missing-evidence-worktree --branch feature/missing-evidence",
          merge_readiness: {
            status: "missing_evidence",
            evidence: "missing evidence",
            next_action: "record loop outcome evidence",
          },
        },
      ],
    });
    expect(serialized).not.toContain("Investigate before merge");
    expect(serialized).not.toContain("/Users/example/private-project/log.txt");
    expect(serialized).not.toContain("Make this better");
    expect(serialized).not.toContain("/Users/example");
    expect(serialized).not.toContain("sk-proj-secret");
  });
});

function loopSnapshot(patch: Partial<LoopSnapshot> = {}): LoopSnapshot {
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
    ...patch,
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
