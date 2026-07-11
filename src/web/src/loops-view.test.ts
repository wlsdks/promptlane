import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { LoopsView } from "./loops-view.js";
import type { LoopListResponse, LoopWorktreeResponse } from "./api.js";

describe("LoopsView", () => {
  it("renders server-provided LoopRelay status and next action", () => {
    const html = renderToStaticMarkup(
      createElement(LoopsView, { loading: false, loops: loopList() }),
    );

    expect(html).toContain("LoopRelay status ready");
    expect(html).toContain("Effectiveness evidence");
    expect(html).toContain("1 benchmark candidate ready");
    expect(html).toContain("<strong>1</strong> completed");
    expect(html).toContain("<strong>1</strong> attributed");
    expect(html).toContain("<strong>1</strong> evidence complete");
    expect(html).toContain("<strong>1</strong> safe");
    expect(html).toContain(
      "Review candidate prompt ids, then run looprelay benchmark prepare-fixture with explicit consent.",
    );
    expect(html).not.toContain("prmt_benchmark_candidate");
    expect(html).toContain("Next: looprelay loop brief");
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
    expect(html).toContain("Decision advisory");
    expect(html).toContain("honor recent continue decision before merge");
    expect(html).toContain("Human checklist");
    expect(html).toContain("Compare ready evidence before merge");
    expect(html).toContain("required");
    expect(html).toContain("Recent decisions");
    expect(html).toContain("agent-loop-worktree continue");
    expect(html).toContain("Needs one more verification pass before merge.");
    expect(html).toContain("review before merge");
    expect(html).toContain("ready for continuation");
    expect(html).toContain("Merge readiness needs_review");
    expect(html).toContain("Evidence evidence present");
    expect(html).toContain("Evidence refs 2");
    expect(html).toContain(
      "looprelay loop brief --worktree agent-loop-worktree --branch codex/agent-loop-memory-design",
    );
    expect(html).toContain("Copy review brief");
    expect(html).toContain("agent-loop-worktree 2 snapshots / 2 sessions");
    expect(html).toContain("main-worktree 1 snapshot / 1 session");
    expect(html).toContain("Open agent-loop-worktree");
    expect(html).toContain("Open main-worktree");
    expect(html).toContain("Memory candidate eligible");
    expect(html).toContain("Approve memory");
    expect(html).toContain("looprelay loop memory-approve");
    expect(html).toContain("Review AGENTS.md patch");
    expect(html).toContain(
      "looprelay loop instruction-patch --target-file AGENTS.md",
    );
    expect(html).not.toContain("Make this better");
    expect(html).not.toContain("Safe memory statement");
    expect(html).not.toContain("Compact summary with sk-proj-secret");
    expect(html).not.toContain("/Users/example");
  });

  it("renders a compact outcome form for the selected worktree snapshot", () => {
    const html = renderToStaticMarkup(
      createElement(LoopsView, {
        loading: false,
        loops: loopList(),
        worktreeDetail: loopWorktree(),
        onApproveSelectedMemory: async () => undefined,
        onRecordOutcome: async () => undefined,
      }),
    );

    expect(html).toContain("Record outcome");
    expect(html).toContain('name="outcome-status"');
    expect(html).toContain('name="outcome-summary"');
    expect(html).toContain('name="outcome-evidence"');
    expect(html).toContain("Safe labels separated by commas");
    expect(html).toContain("Save outcome");
    expect(html).toContain("Approve selected memory");
    expect(html).toContain("No automatic memory approval");
    expect(html).not.toContain("/Users/example");
  });

  it("renders empty loop first-value next steps before the collect command", () => {
    const firstScoreAction =
      "Capture one Codex or Claude Code prompt, then run looprelay coach to confirm the first score.";
    const collectAction =
      "Then run looprelay loop collect to create the first local loop snapshot.";
    const loops = loopList();
    loops.status = {
      ...loops.status,
      status: "empty",
      snapshot_count: 0,
      activity: {
        active_worktrees: 0,
        active_sessions: 0,
        needs_review: false,
        next_action: "continue current worktree loop",
        worktrees: [],
      },
      project_memory: {
        approved_count: 0,
        included_in_brief: false,
      },
      memory_candidate: undefined,
      latest_snapshot: undefined,
      next_action: "looprelay loop collect",
      next_actions: [firstScoreAction, collectAction],
    };
    loops.items = [];

    const html = renderToStaticMarkup(
      createElement(LoopsView, { loading: false, loops }),
    );

    expect(html).toContain("LoopRelay status empty");
    expect(html).toContain("Next steps");
    expect(html).toContain(firstScoreAction);
    expect(html.indexOf("confirm the first score")).toBeLessThan(
      html.indexOf("looprelay loop collect"),
    );
    expect(html).not.toContain("Make this better");
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
    expect(html).toContain('class="loop-worktree-detail"');
    expect(html).toContain("Selection scope");
    expect(html).toContain(
      "showing snapshots filtered by selected worktree, session, and branch",
    );
    expect(html).toContain("Next copy selected session and branch brief");
    expect(html).toContain("Selected snapshot age");
    expect(html).toContain("older_than_latest");
    expect(html).toContain(
      "another loop snapshot was recorded after this selection",
    );
    expect(html).toContain("Next refresh selected worktree before merging");
    expect(html).toContain("Selected brief action");
    expect(html).toContain("copy selected continuation brief");
    expect(html).toContain(
      "uses the selected worktree/session/branch filters without auto-submitting",
    );
    expect(html).toContain(
      "looprelay loop brief --worktree agent-loop-worktree --session session-web --branch feature/branch-filter",
    );
    expect(html).toContain("No file writes or external calls");
    expect(html).toContain("Command distinction");
    expect(html).toContain(
      "continue the selected worktree/session/branch filters",
    );
    expect(html).toContain(
      "copy the review packet command-center hint for merge review",
    );
    expect(html).toContain(
      "selected continuation and review packet commands can differ when session or branch filters are active",
    );
    expect(html).toContain("No distinction writes or external calls");
    expect(html).toContain("Command filters");
    expect(html).toContain("Selected filters worktree, session, branch");
    expect(html).toContain("Review filters worktree, branch");
    expect(html).toContain(
      "selected command reflects the current selection while review command reflects command-center review scope",
    );
    expect(html).toContain("No filter explanation writes or external calls");
    expect(html).toContain("Copy side effects");
    expect(html).toContain(
      "copies the selected continuation brief to the local clipboard",
    );
    expect(html).toContain(
      "temporarily marks the selected brief copy button as copied",
    );
    expect(html).toContain(
      "does not write files, execute commands, call external services, submit prompts, or change merge state",
    );
    expect(html).toContain("No copy side-effect writes or external calls");
    expect(html).toContain("Continuation safety");
    expect(html).toContain("Review the selected brief before copying it.");
    expect(html).toContain(
      "Memory approval and merge decisions remain separate explicit reviews.",
    );
    expect(html).toContain("No safety guidance writes or external calls");
    expect(html).toContain("Review packet summary");
    expect(html).toContain("1 ready, 1 needs review, 0 missing evidence");
    expect(html).toContain("review non-passing worktrees before merge");
    expect(html).toContain("Readiness summary");
    expect(html).toContain("latest selected worktree outcome is not passing");
    expect(html).toContain("review outcome before merge");
    expect(html).toContain("Brief rationale");
    expect(html).toContain(
      "selected brief continues review work without marking it merge-ready",
    );
    expect(html).toContain("Next copy selected continuation brief");
    expect(html).toContain("Merge gate review outcome before merge");
    expect(html).toContain("Evidence count");
    expect(html).toContain("2 selected worktree has evidence refs recorded");
    expect(html).toContain("Reviewer checklist preview");
    expect(html).toContain("Evidence guidance");
    expect(html).toContain("Review non-passing worktrees before merge");
    expect(html).toContain("required");
    expect(html).toContain("Copy review brief command");
    expect(html).toContain("Command provenance");
    expect(html).toContain("existing command-center continuation command");
    expect(html).toContain(
      "reuses safe selected worktree metadata without reading git or executing commands",
    );
    expect(html).toContain("No command writes or external calls");
    expect(html).toContain(
      "looprelay loop brief --worktree agent-loop-worktree --branch codex/agent-loop-memory-design",
    );
    expect(html).toContain("Missing evidence");
    expect(html).toContain(
      "latest selected worktree outcome has no evidence refs",
    );
    expect(html).toContain("record loop outcome evidence");
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
        recent_decisions: [
          {
            snapshot_id: "loop_web",
            worktree: "agent-loop-worktree",
            decision: "continue",
            reason: "Needs one more verification pass before merge.",
            decided_by: "user",
            created_at: "2026-07-04T01:30:00.000Z",
          },
        ],
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
            decision_advisory: {
              summary:
                "recent continue decision recorded for agent-loop-worktree",
              next_action: "honor recent continue decision before merge",
            },
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
              sessions: 2,
              snapshots: 2,
              latest_snapshot_id: "loop_web",
              latest_created_at: "2026-07-04T01:00:00.000Z",
              latest_outcome_status: "unknown",
              evidence_count: 2,
              recommendation: "review before merge",
              continuation_command:
                "looprelay loop brief --worktree agent-loop-worktree --branch codex/agent-loop-memory-design",
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
                "looprelay loop brief --worktree main-worktree",
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
        next_action: "looprelay loop memory-approve",
      },
      latest_snapshot: loopSummary(),
      next_action: "looprelay loop brief",
      next_actions: [
        "Use looprelay loop brief or prepare_loop_brief to get a copy-ready continuation prompt.",
      ],
      privacy: {
        local_only: true,
        external_calls: false,
        returns_prompt_bodies: false,
        returns_raw_paths: false,
        returns_compact_content: false,
      },
    },
    benchmark_readiness: {
      status: "ready",
      candidate_count: 1,
      candidates: [
        {
          prompt_id: "prmt_benchmark_candidate",
          snapshot_id: "loop_web",
          outcome_status: "passed",
          tests_run: 3,
          evidence_ref_count: 1,
        },
      ],
      excluded_unsafe_candidates: 0,
      excluded_missing_candidates: 0,
      diagnostics: {
        completed_snapshots: 1,
        attributed_snapshots: 1,
        evidence_complete_snapshots: 1,
        safe_snapshots: 1,
      },
      has_more: false,
      scope: { scanned_snapshots: 1, snapshot_limit: 100 },
      next_action:
        "Review candidate prompt ids, then run looprelay benchmark prepare-fixture with explicit consent.",
      privacy: {
        local_only: true,
        external_calls: false,
        returns_prompt_bodies: false,
        returns_raw_paths: false,
        returns_evidence_refs: false,
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
    memory_approved: false,
    memory_candidate: {
      eligible: true,
      reason: "passed_with_evidence",
      next_action: "looprelay loop memory-approve",
    },
    selection_scope: {
      label: "Selection scope",
      filters: ["worktree", "session", "branch"],
      reason:
        "showing snapshots filtered by selected worktree, session, and branch",
      next_action: "copy selected session and branch brief",
    },
    continuation_safety: {
      label: "Continuation safety",
      steps: [
        "Review the selected brief before copying it.",
        "Paste it into the intended Codex or Claude Code request.",
        "Submit manually, then collect a fresh loop snapshot after the turn.",
      ],
      boundaries: [
        "LoopRelay does not read transcripts, submit prompts, execute commands, or write instruction files.",
        "Memory approval and merge decisions remain separate explicit reviews.",
      ],
      local_only: true,
      writes_files: false,
      external_calls: false,
    },
    snapshot_age: {
      label: "Selected snapshot age",
      latest_selected_created_at: "2026-07-04T01:00:00.000Z",
      status: "older_than_latest",
      reason: "another loop snapshot was recorded after this selection",
      next_action: "refresh selected worktree before merging",
    },
    selected_brief_action: {
      label: "Selected brief action",
      action: "copy selected continuation brief",
      reason:
        "uses the selected worktree/session/branch filters without auto-submitting",
      command:
        "looprelay loop brief --worktree agent-loop-worktree --session session-web --branch feature/branch-filter",
      writes_files: false,
      external_calls: false,
    },
    command_distinction: {
      label: "Command distinction",
      selected_command_role:
        "continue the selected worktree/session/branch filters",
      review_command_role:
        "copy the review packet command-center hint for merge review",
      reason:
        "selected continuation and review packet commands can differ when session or branch filters are active",
      writes_files: false,
      external_calls: false,
    },
    command_filters: {
      label: "Command filters",
      selected_command_filters: ["worktree", "session", "branch"],
      review_command_filters: ["worktree", "branch"],
      reason:
        "selected command reflects the current selection while review command reflects command-center review scope",
      writes_files: false,
      external_calls: false,
    },
    copy_side_effects: {
      label: "Copy side effects",
      clipboard:
        "copies the selected continuation brief to the local clipboard",
      ui_feedback: "temporarily marks the selected brief copy button as copied",
      does_not:
        "does not write files, execute commands, call external services, submit prompts, or change merge state",
      writes_files: false,
      external_calls: false,
    },
    latest_decision: {
      snapshot_id: "loop_web",
      worktree: "agent-loop-worktree",
      decision: "continue",
      reason: "Needs one more verification pass before merge.",
      decided_by: "user",
      created_at: "2026-07-04T01:30:00.000Z",
    },
    review_packet_summary: {
      title: "Review-before-merge packet",
      status: "needs_review",
      summary: "1 ready, 1 needs review, 0 missing evidence",
      next_action: "review non-passing worktrees before merge",
      worktree: "agent-loop-worktree",
      merge_readiness: "needs_review",
      worktree_action: "review outcome before merge",
      readiness_summary: {
        label: "Readiness summary",
        status: "needs_review",
        reason: "latest selected worktree outcome is not passing",
        next_action: "review outcome before merge",
      },
      brief_rationale: {
        label: "Brief rationale",
        merge_readiness: "needs_review",
        reason:
          "selected brief continues review work without marking it merge-ready",
        next_action: "copy selected continuation brief",
        merge_gate: "review outcome before merge",
      },
      evidence_count_explanation: {
        label: "Evidence count",
        count: 2,
        reason: "selected worktree has evidence refs recorded",
        next_action: "compare evidence before merge",
      },
      reviewer_checklist_preview: [
        {
          label: "Review non-passing worktrees before merge",
          status: "required",
          action: "review outcome before merge",
        },
      ],
      command_hint: {
        label: "Copy review brief command",
        command:
          "looprelay loop brief --worktree agent-loop-worktree --branch codex/agent-loop-memory-design",
        provenance: {
          label: "Command provenance",
          source: "existing command-center continuation command",
          reason:
            "reuses safe selected worktree metadata without reading git or executing commands",
          writes_files: false,
          external_calls: false,
        },
      },
      missing_evidence_explanation: {
        label: "Missing evidence",
        reason: "latest selected worktree outcome has no evidence refs",
        next_action: "record loop outcome evidence",
      },
    },
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
