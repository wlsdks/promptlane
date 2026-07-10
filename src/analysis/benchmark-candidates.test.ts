import { describe, expect, it } from "vitest";

import { createBenchmarkCandidateReport } from "./benchmark-candidates.js";
import type { LoopSnapshot } from "../loop/types.js";

describe("createBenchmarkCandidateReport", () => {
  it("returns bounded deduplicated candidates from safe attributed completed outcomes", () => {
    const report = createBenchmarkCandidateReport(
      [
        snapshot({
          id: "loop_latest",
          promptIds: ["prmt_one", "prmt_two"],
          usedPromptIds: ["prmt_one", "prmt_two"],
        }),
        snapshot({
          id: "loop_older",
          promptIds: ["prmt_one", "prmt_three"],
          status: "failed",
          usedPromptIds: ["prmt_one", "prmt_three"],
        }),
      ],
      2,
    );

    expect(report).toEqual({
      status: "ready",
      candidate_count: 3,
      candidates: [
        {
          prompt_id: "prmt_one",
          snapshot_id: "loop_latest",
          outcome_status: "passed",
          tests_run: 3,
          evidence_ref_count: 1,
        },
        {
          prompt_id: "prmt_two",
          snapshot_id: "loop_latest",
          outcome_status: "passed",
          tests_run: 3,
          evidence_ref_count: 1,
        },
      ],
      excluded_unsafe_candidates: 0,
      has_more: true,
      scope: {
        scanned_snapshots: 2,
        snapshot_limit: 100,
      },
      next_action:
        "Review candidate prompt ids, then run promptlane benchmark prepare-fixture with explicit consent.",
      privacy: {
        local_only: true,
        external_calls: false,
        returns_prompt_bodies: false,
        returns_raw_paths: false,
        returns_evidence_refs: false,
      },
    });
    expect(JSON.stringify(report)).not.toContain("outcome passed");
  });

  it("excludes unattributed, incomplete, and unsafe outcomes", () => {
    const report = createBenchmarkCandidateReport([
      snapshot({ id: "loop_unattributed", usedPromptIds: [] }),
      snapshot({ id: "loop_in_progress", status: "in_progress" }),
      snapshot({
        evidenceRefs: ["/Users/example/private/result.log"],
        id: "loop_unsafe",
      }),
    ]);

    expect(report).toMatchObject({
      status: "no_attributed_outcomes",
      candidate_count: 0,
      candidates: [],
      excluded_unsafe_candidates: 1,
      has_more: false,
      next_action:
        "Record a passed or failed loop outcome with safe evidence and explicitly selected PromptLane improvement ids.",
    });
    expect(JSON.stringify(report)).not.toContain("/Users/example");
  });

  it("distinguishes an empty snapshot archive", () => {
    expect(createBenchmarkCandidateReport([])).toMatchObject({
      status: "empty_archive",
      candidate_count: 0,
      scope: { scanned_snapshots: 0, snapshot_limit: 100 },
      next_action:
        "Collect a loop snapshot after using PromptLane with Codex or Claude Code.",
    });
  });
});

function snapshot({
  evidenceRefs = ["test:focused"],
  id = "loop_candidate",
  promptIds = ["prmt_one"],
  status = "passed",
  usedPromptIds = ["prmt_one"],
}: {
  evidenceRefs?: string[];
  id?: string;
  promptIds?: string[];
  status?: LoopSnapshot["outcome"]["status"];
  usedPromptIds?: string[];
} = {}): LoopSnapshot {
  return {
    id,
    created_at: "2026-07-10T00:00:00.000Z",
    tool: "codex",
    source: "cli",
    cwd_label: "project",
    project_id: "proj_candidate",
    prompt_ids: promptIds,
    event_counts: { prompts: promptIds.length, tests_run: 3 },
    quality: { top_gaps: [], unresolved_questions: [] },
    outcome: {
      status,
      summary: "Candidate outcome passed.",
      evidence_refs: evidenceRefs,
      used_improvement_prompt_ids: usedPromptIds,
    },
    next_brief: { generated: false, summary: "Continue local work." },
    privacy: {
      stores_prompt_bodies: false,
      stores_raw_paths: false,
      local_only: true,
    },
  };
}
