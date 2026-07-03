import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { LoopsView } from "./loops-view.js";
import type { LoopListResponse, LoopWorktreeResponse } from "./api.js";

describe("LoopsView", () => {
  it("renders server-provided Loopdeck status and next action", () => {
    const html = renderToStaticMarkup(
      createElement(LoopsView, { loading: false, loops: loopList() }),
    );

    expect(html).toContain("Loopdeck status ready");
    expect(html).toContain("Next: prompt-coach loop brief");
    expect(html).toContain("Approved memories 1");
    expect(html).toContain("Active worktrees 2");
    expect(html).toContain("Active sessions 2");
    expect(html).toContain("Worktree review needed");
    expect(html).toContain("Command center");
    expect(html).toContain("Multi-worktree review");
    expect(html).toContain("review agent-loop-worktree before merge");
    expect(html).toContain("Review packet ready");
    expect(html).toContain("2 ready, 0 needs review, 0 missing evidence");
    expect(html).toContain("Next compare ready evidence before merge");
    expect(html).toContain("review before merge");
    expect(html).toContain("ready for continuation");
    expect(html).toContain("Merge readiness needs_review");
    expect(html).toContain("Evidence evidence present");
    expect(html).toContain("Evidence refs 2");
    expect(html).toContain(
      "prompt-coach loop brief --worktree agent-loop-worktree --branch codex/agent-loop-memory-design",
    );
    expect(html).toContain("Copy review brief");
    expect(html).toContain("agent-loop-worktree 2 snapshots / 2 sessions");
    expect(html).toContain("main-worktree 1 snapshot / 1 session");
    expect(html).toContain("Open agent-loop-worktree");
    expect(html).toContain("Open main-worktree");
    expect(html).toContain("Memory candidate eligible");
    expect(html).toContain("Approve memory");
    expect(html).toContain("prompt-coach loop memory-approve");
    expect(html).toContain("Review AGENTS.md patch");
    expect(html).toContain(
      "prompt-coach loop instruction-patch --target-file AGENTS.md",
    );
    expect(html).not.toContain("Make this better");
    expect(html).not.toContain("Safe memory statement");
    expect(html).not.toContain("Compact summary with sk-proj-secret");
    expect(html).not.toContain("/Users/example");
  });

  it("renders a selected worktree drilldown without prompt bodies or raw paths", () => {
    const html = renderToStaticMarkup(
      createElement(LoopsView, {
        loading: false,
        loops: loopList(),
        worktreeDetail: loopWorktree(),
      }),
    );

    expect(html).toContain("Worktree detail");
    expect(html).toContain("agent-loop-worktree");
    expect(html).toContain("Session session-web");
    expect(html).toContain("Branch feature/branch-filter");
    expect(html).toContain("loop_web");
    expect(html).toContain("passed");
    expect(html).not.toContain("Make this better");
    expect(html).not.toContain("Safe worktree summary");
    expect(html).not.toContain("/Users/example");
  });

  it("renders a selected worktree continuation brief action", () => {
    const html = renderToStaticMarkup(
      createElement(LoopsView, {
        loading: false,
        loops: loopList(),
        worktreeDetail: loopWorktree(),
        onCopySelectedBrief: async () => {},
      }),
    );

    expect(html).toContain("Copy selected brief");
    expect(html).toContain("Continue agent-loop-worktree");
    expect(html).toContain("session-web");
    expect(html).toContain("feature/branch-filter");
    expect(html).not.toContain("Make this better");
    expect(html).not.toContain("/Users/example");
  });
});

function loopList(): LoopListResponse {
  return {
    status: {
      status: "ready",
      snapshot_count: 1,
      activity: {
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
            sessions: 2,
            snapshots: 2,
            latest_snapshot_id: "loop_web",
            latest_created_at: "2026-07-04T01:00:00.000Z",
            latest_outcome_status: "unknown",
            evidence_count: 2,
          },
          {
            worktree: "main-worktree",
            sessions: 1,
            snapshots: 1,
            latest_snapshot_id: "loop_main",
            latest_created_at: "2026-07-03T01:00:00.000Z",
            latest_outcome_status: "passed",
            evidence_count: 1,
          },
        ],
        command_center: {
          title: "Multi-worktree review",
          primary_action: "review agent-loop-worktree before merge",
          review_packet: {
            title: "Review-before-merge packet",
            status: "ready",
            summary: "2 ready, 0 needs review, 0 missing evidence",
            next_action: "compare ready evidence before merge",
            ready_count: 2,
            needs_review_count: 0,
            missing_evidence_count: 0,
            actions: ["compare evidence before merge"],
          },
          review_items: [
            {
              worktree: "agent-loop-worktree",
              branch: "codex/agent-loop-memory-design",
              sessions: 2,
              snapshots: 2,
              latest_snapshot_id: "loop_web",
              latest_created_at: "2026-07-04T01:00:00.000Z",
              latest_outcome_status: "unknown",
              evidence_count: 2,
              recommendation: "review before merge",
              continuation_command:
                "prompt-coach loop brief --worktree agent-loop-worktree --branch codex/agent-loop-memory-design",
              merge_readiness: {
                status: "needs_review",
                evidence: "evidence present",
                next_action: "review outcome before merge",
              },
            },
            {
              worktree: "main-worktree",
              sessions: 1,
              snapshots: 1,
              latest_snapshot_id: "loop_main",
              latest_created_at: "2026-07-03T01:00:00.000Z",
              latest_outcome_status: "passed",
              evidence_count: 1,
              recommendation: "ready for continuation",
              continuation_command:
                "prompt-coach loop brief --worktree main-worktree",
              merge_readiness: {
                status: "ready",
                evidence: "evidence present",
                next_action: "compare evidence before merge",
              },
            },
          ],
        },
      },
      project_memory: {
        approved_count: 1,
        included_in_brief: true,
      },
      memory_candidate: {
        eligible: true,
        reason: "passed_with_evidence",
        next_action: "prompt-coach loop memory-approve",
      },
      latest_snapshot: loopSummary(),
      next_action: "prompt-coach loop brief",
      next_actions: [
        "Use prompt-coach loop brief or prepare_loop_brief to get a copy-ready continuation prompt.",
      ],
      privacy: {
        local_only: true,
        external_calls: false,
        returns_prompt_bodies: false,
        returns_raw_paths: false,
        returns_compact_content: false,
      },
    },
    items: [loopSummary()],
    privacy: {
      local_only: true,
      returns_prompt_bodies: false,
      returns_raw_paths: false,
      returns_compact_content: false,
    },
  };
}

function loopSummary(): LoopListResponse["items"][number] {
  return {
    id: "loop_web",
    created_at: "2026-07-04T01:00:00.000Z",
    tool: "codex",
    source: "cli",
    project: "private-project",
    prompt_count: 2,
    average_prompt_score: 58,
    top_gaps: ["Goal clarity"],
    outcome_status: "unknown",
  };
}

function loopWorktree(): LoopWorktreeResponse {
  return {
    branch: "feature/branch-filter",
    worktree: "agent-loop-worktree",
    session_id: "session-web",
    items: [
      {
        ...loopSummary(),
        worktree: "agent-loop-worktree",
        outcome_status: "passed",
      },
    ],
    privacy: {
      local_only: true,
      returns_prompt_bodies: false,
      returns_raw_paths: false,
      returns_compact_content: false,
    },
  };
}
