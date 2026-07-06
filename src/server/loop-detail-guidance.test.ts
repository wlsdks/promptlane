import { describe, expect, it } from "vitest";

import {
  commandFiltersFor,
  evidenceCountExplanationFor,
  readinessSummaryFor,
  selectedBriefActionFor,
  selectionScopeFor,
  snapshotAgeFor,
} from "./loop-detail-guidance.js";

describe("loop detail guidance", () => {
  it("builds selected brief commands from worktree, session, and branch filters", () => {
    expect(
      selectedBriefActionFor({
        worktree: "agent-loop-worktree",
        sessionId: "session-web",
        branch: "feature/branch-filter",
      }),
    ).toEqual({
      label: "Selected brief action",
      action: "copy selected continuation brief",
      reason:
        "uses the selected worktree/session/branch filters without auto-submitting",
      command:
        "promptlane loop brief --worktree agent-loop-worktree --session session-web --branch feature/branch-filter",
      writes_files: false,
      external_calls: false,
    });
  });

  it("describes selected and review command filters separately", () => {
    expect(selectionScopeFor({ hasSession: true, hasBranch: true })).toEqual({
      label: "Selection scope",
      filters: ["worktree", "session", "branch"],
      reason:
        "showing snapshots filtered by selected worktree, session, and branch",
      next_action: "copy selected session and branch brief",
    });
    expect(
      commandFiltersFor({
        hasSession: true,
        hasBranch: false,
        reviewHasBranch: true,
      }),
    ).toEqual({
      label: "Command filters",
      selected_command_filters: ["worktree", "session"],
      review_command_filters: ["worktree", "branch"],
      reason:
        "selected command reflects the current selection while review command reflects command-center review scope",
      writes_files: false,
      external_calls: false,
    });
  });

  it("summarizes selected snapshot freshness without exposing raw paths", () => {
    expect(
      snapshotAgeFor({
        selectedSnapshot: {
          id: "older",
          created_at: "2026-07-04T01:00:00.000Z",
        },
        snapshots: [
          { id: "newer", created_at: "2026-07-04T02:00:00.000Z" },
          { id: "older", created_at: "2026-07-04T01:00:00.000Z" },
        ],
      }),
    ).toEqual({
      label: "Selected snapshot age",
      latest_selected_created_at: "2026-07-04T01:00:00.000Z",
      status: "older_than_latest",
      reason: "another loop snapshot was recorded after this selection",
      next_action: "refresh selected worktree before merging",
    });
  });

  it("summarizes merge readiness and evidence counts with safe aggregate metadata", () => {
    expect(
      readinessSummaryFor({
        status: "missing_evidence",
        next_action: "record loop outcome evidence",
      }),
    ).toEqual({
      label: "Readiness summary",
      status: "missing_evidence",
      reason: "latest selected worktree outcome has no evidence refs",
      next_action: "record loop outcome evidence",
    });
    expect(evidenceCountExplanationFor(2)).toEqual({
      label: "Evidence count",
      count: 2,
      reason: "selected worktree has evidence refs recorded",
      next_action: "compare evidence before merge",
    });
  });
});
