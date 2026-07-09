import { describe, expect, it } from "vitest";

import {
  hasAmbiguousLoopSnapshotTarget,
  selectLoopSnapshotTarget,
} from "./snapshot-selection.js";
import type { LoopSnapshot } from "./types.js";

describe("loop snapshot target", () => {
  const selected = loopSnapshot({
    id: "loop_selected",
    worktree_label: "selected-worktree",
  });
  const latest = loopSnapshot({
    id: "loop_latest",
    worktree_label: "latest-worktree",
  });
  const snapshots = [latest, selected];

  it("selects latest, exact id, or worktree without cross-worktree fallback", () => {
    expect(selectLoopSnapshotTarget(snapshots, {})?.id).toBe("loop_latest");
    expect(
      selectLoopSnapshotTarget(snapshots, { snapshotId: "loop_selected" })?.id,
    ).toBe("loop_selected");
    expect(
      selectLoopSnapshotTarget(snapshots, {
        worktree: "selected-worktree",
      })?.id,
    ).toBe("loop_selected");
    expect(
      selectLoopSnapshotTarget(snapshots, { worktree: "missing-worktree" }),
    ).toBeUndefined();
  });

  it("detects ambiguous exact and filtered targets", () => {
    expect(
      hasAmbiguousLoopSnapshotTarget({
        snapshotId: "loop_selected",
        worktree: "selected-worktree",
      }),
    ).toBe(true);
    expect(
      hasAmbiguousLoopSnapshotTarget({ snapshotId: "loop_selected" }),
    ).toBe(false);
  });
});

function loopSnapshot(patch: Partial<LoopSnapshot>): LoopSnapshot {
  return {
    id: "loop_fixture",
    created_at: "2026-07-04T01:00:00.000Z",
    tool: "codex",
    source: "cli",
    cwd_label: "private-project",
    project_id: "proj_fixture",
    prompt_ids: [],
    event_counts: { prompts: 0 },
    quality: { top_gaps: [], unresolved_questions: [] },
    outcome: {
      status: "unknown",
      summary: "Awaiting outcome.",
      evidence_refs: [],
    },
    next_brief: { generated: false, summary: "Collect more evidence." },
    privacy: {
      local_only: true,
      stores_prompt_bodies: false,
      stores_raw_paths: false,
    },
    ...patch,
  };
}
