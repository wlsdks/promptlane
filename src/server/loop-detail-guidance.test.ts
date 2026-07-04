import { describe, expect, it } from "vitest";

import {
  commandFiltersFor,
  selectedBriefActionFor,
  selectionScopeFor,
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
        "prompt-coach loop brief --worktree agent-loop-worktree --session session-web --branch feature/branch-filter",
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
});
