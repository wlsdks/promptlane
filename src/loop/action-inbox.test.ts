import { describe, expect, it } from "vitest";

import type { LoopSnapshot } from "./types.js";
import { createActionInboxReport } from "./action-inbox.js";

describe("createActionInboxReport", () => {
  it("turns only the latest snapshot per active loop into explicit local actions", () => {
    const report = createActionInboxReport({
      now: new Date("2026-07-12T12:00:00.000Z"),
      snapshots: [
        snapshot({ id: "loop_old", created_at: "2026-07-12T08:00:00.000Z" }),
        snapshot({
          id: "loop_failed",
          created_at: "2026-07-12T10:00:00.000Z",
          outcome: {
            status: "failed",
            summary: "Focused validation failed.",
            evidence_refs: ["test:focused"],
            typed_evidence: [
              {
                kind: "test",
                label: "focused validation",
                observed_at: "2026-07-12T10:00:00.000Z",
                result: "failed",
                verification: "locally_verified",
              },
            ],
          },
        }),
        snapshot({
          id: "loop_passed",
          project_id: "proj_two",
          worktree_label: "secondary",
          created_at: "2026-07-12T11:00:00.000Z",
          outcome: {
            status: "passed",
            summary: "Build was declared complete.",
            evidence_refs: ["build:declared"],
            typed_evidence: [
              {
                kind: "build",
                label: "production build",
                observed_at: "2026-07-12T11:00:00.000Z",
                result: "passed",
                verification: "declared",
              },
            ],
          },
        }),
      ],
      receipts: [
        {
          id: "brief_pending",
          snapshot_id: "loop_failed",
          status: "delivered",
          created_at: "2026-07-12T10:05:00.000Z",
        },
      ],
      memories: [],
      failureEpisodes: [],
    });

    expect(report.summary).toMatchObject({
      total: 4,
      failure_review: 1,
      continuation_debt: 1,
      evidence_debt: 1,
      memory_review: 1,
      recurring_failure_categories: 0,
    });
    expect(report.items.map((item) => item.kind)).toEqual([
      "confirm_failure",
      "complete_continuation",
      "verify_evidence",
      "review_memory",
    ]);
    expect(report.items.some((item) => item.snapshot_id === "loop_old")).toBe(
      false,
    );
    expect(JSON.stringify(report)).not.toContain("/Users/");
    expect(report.privacy).toEqual({
      local_only: true,
      stores_prompt_bodies: false,
      stores_raw_paths: false,
      stores_transcripts: false,
      causal_claim: false,
    });
  });

  it("removes confirmed failures and completed receipts from the pending inbox", () => {
    const report = createActionInboxReport({
      now: new Date("2026-07-12T12:00:00.000Z"),
      snapshots: [
        snapshot({
          id: "loop_failed",
          outcome: {
            status: "failed",
            summary: "Focused validation failed.",
            evidence_refs: ["test:focused"],
          },
        }),
      ],
      receipts: [
        {
          id: "brief_followed",
          snapshot_id: "loop_failed",
          status: "followed",
          created_at: "2026-07-12T10:05:00.000Z",
        },
      ],
      memories: [],
      failureEpisodes: [
        {
          id: "fail_one",
          snapshot_id: "loop_failed",
          status: "open",
          category: "validation",
          confirmed_at: "2026-07-12T11:00:00.000Z",
          intervention: "Run focused validation.",
        },
      ],
    });

    expect(report.items.map((item) => item.kind)).toEqual([
      "resolve_failure",
      "verify_evidence",
    ]);
    expect(report.outcomes[0]).toMatchObject({
      snapshot_id: "loop_failed",
      failure_episode_status: "open",
      continuation_status: "followed",
    });
  });

  it("never returns unsafe legacy snapshot labels", () => {
    const report = createActionInboxReport({
      now: new Date("2026-07-12T12:00:00.000Z"),
      snapshots: [
        snapshot({
          id: "loop_unsafe_labels",
          cwd_label: "/Users/example/private-project",
          worktree_label: "/Users/example/private-worktree",
          branch: "/Users/example/private-branch",
        }),
      ],
      receipts: [],
      memories: [],
      failureEpisodes: [],
    });

    expect(report.items[0]).toMatchObject({ project: "local-project" });
    expect(report.items[0]?.worktree).toBeUndefined();
    expect(report.items[0]?.branch).toBeUndefined();
    expect(JSON.stringify(report)).not.toContain("/Users/example");
  });

  it("surfaces recurring operator-confirmed failure categories", () => {
    const report = createActionInboxReport({
      now: new Date("2026-07-12T12:00:00.000Z"),
      snapshots: [
        snapshot({ id: "loop_one", session_id: "session_one" }),
        snapshot({ id: "loop_two", session_id: "session_two" }),
      ],
      receipts: [],
      memories: [],
      failureEpisodes: [
        {
          id: "fail_one",
          snapshot_id: "loop_one",
          status: "resolved",
          category: "tooling",
          confirmed_at: "2026-07-11T11:00:00.000Z",
        },
        {
          id: "fail_two",
          snapshot_id: "loop_two",
          status: "open",
          category: "tooling",
          confirmed_at: "2026-07-12T11:00:00.000Z",
        },
      ],
    });

    expect(report.summary.recurring_failure_categories).toBe(1);
    expect(report.failure_patterns).toEqual([
      {
        category: "tooling",
        total: 2,
        session_count: 2,
        open: 1,
        resolved: 1,
        wont_fix: 0,
        recurring: true,
        last_confirmed_at: "2026-07-12T11:00:00.000Z",
      },
    ]);
  });

  it("does not call repeated episodes in one agent session recurring", () => {
    const report = createActionInboxReport({
      now: new Date("2026-07-12T12:00:00.000Z"),
      snapshots: [
        snapshot({ id: "loop_one", session_id: "session_one" }),
        snapshot({ id: "loop_two", session_id: "session_one" }),
      ],
      receipts: [],
      memories: [],
      failureEpisodes: [
        {
          id: "fail_one",
          snapshot_id: "loop_one",
          status: "resolved",
          category: "validation",
          confirmed_at: "2026-07-11T11:00:00.000Z",
        },
        {
          id: "fail_two",
          snapshot_id: "loop_two",
          status: "open",
          category: "validation",
          confirmed_at: "2026-07-12T11:00:00.000Z",
        },
      ],
    });

    expect(report.summary.recurring_failure_categories).toBe(0);
    expect(report.failure_patterns[0]).toMatchObject({
      total: 2,
      session_count: 1,
      recurring: false,
    });
  });
});

function snapshot(patch: Partial<LoopSnapshot> = {}): LoopSnapshot {
  return {
    id: "loop_current",
    created_at: "2026-07-12T09:00:00.000Z",
    tool: "codex",
    source: "cli",
    cwd_label: "project",
    project_id: "proj_one",
    branch: "feature/action-inbox",
    worktree_label: "primary",
    prompt_ids: [],
    event_counts: { prompts: 0 },
    quality: { top_gaps: [], unresolved_questions: [] },
    outcome: {
      status: "in_progress",
      summary: "Continue the current loop.",
      evidence_refs: [],
    },
    next_brief: { generated: false, summary: "Prepare continuation." },
    privacy: {
      local_only: true,
      stores_prompt_bodies: false,
      stores_raw_paths: false,
    },
    ...patch,
  };
}
