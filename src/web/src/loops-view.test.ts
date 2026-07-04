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
    expect(html).toContain('class="loop-worktree-detail"');
    expect(html).toContain("Selection scope");
    expect(html).toContain(
      "showing snapshots filtered by selected worktree, session, and branch",
    );
    expect(html).toContain("Next copy selected session and branch brief");
    expect(html).toContain("Selected snapshot age");
    expect(html).toContain("older_than_latest");
    expect(html).toContain("another loop snapshot was recorded after this selection");
    expect(html).toContain("Next refresh selected worktree before merging");
    expect(html).toContain("Selected brief action");
    expect(html).toContain("copy selected continuation brief");
    expect(html).toContain(
      "uses the selected worktree/session/branch filters without auto-submitting",
    );
    expect(html).toContain(
      "prompt-coach loop brief --worktree agent-loop-worktree --session session-web --branch feature/branch-filter",
    );
    expect(html).toContain("No file writes or external calls");
    expect(html).toContain("Command distinction");
    expect(html).toContain("continue the selected worktree/session/branch filters");
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
    expect(html).toContain("Paste destination");
    expect(html).toContain("Codex active request");
    expect(html).toContain("Claude Code active request");
    expect(html).toContain(
      "paste the copied continuation brief into the active agent request box",
    );
    expect(html).toContain(
      "keeps Loopdeck as the local handoff source while the user controls submission",
    );
    expect(html).toContain("No automatic submission, file writes, or external calls");
    expect(html).toContain("Continuation handoff checklist");
    expect(html).toContain("copy selected continuation brief");
    expect(html).toContain("paste into Codex or Claude Code active request");
    expect(html).toContain("submit manually after review");
    expect(html).toContain(
      "collect the next loop snapshot after the agent turn",
    );
    expect(html).toContain(
      "keeps continuation handoff explicit without automating agent UI or reading transcripts",
    );
    expect(html).toContain("No handoff checklist writes or external calls");
    expect(html).toContain("Post-handoff reminder");
    expect(html).toContain(
      "collect a new loop snapshot after the next agent turn",
    );
    expect(html).toContain(
      "memory approval remains a separate explicit review",
    );
    expect(html).toContain(
      "merge remains a separate review-before-merge decision",
    );
    expect(html).toContain(
      "continuation handoff records the next loop before any memory approval or merge decision",
    );
    expect(html).toContain("No post-handoff writes or external calls");
    expect(html).toContain("Source-of-truth note");
    expect(html).toContain(
      "next loop snapshot is the source of truth for local loop memory",
    );
    expect(html).toContain(
      "transcript import is not used as the source of truth",
    );
    expect(html).toContain(
      "Loopdeck records explicit loop snapshots instead of importing agent transcripts",
    );
    expect(html).toContain("No transcript storage, file writes, or external calls");
    expect(html).toContain("Privacy boundary");
    expect(html).toContain(
      "stores loop metadata in the local database and Markdown archive only",
    );
    expect(html).toContain(
      "does not store prompt bodies, transcripts, raw paths, or provider credentials",
    );
    expect(html).toContain(
      "keeps source-of-truth loop memory local-first and reviewable",
    );
    expect(html).toContain("Local only, no file writes or external calls");
    expect(html).toContain("Continuation guidance");
    expect(html).toContain('class="loop-detail-section"');
    expect(html).toContain('class="loop-detail-section-title"');
    expect(html).toContain("Session session-web");
    expect(html).toContain("Branch feature/branch-filter");
    expect(html).toContain("Latest decision");
    expect(html).toContain("continue");
    expect(html).toContain("Needs one more verification pass before merge.");
    expect(html).toContain("Merge review guidance");
    expect(html).toContain('class="loop-review-grid"');
    expect(html).toContain('class="loop-review-item"');
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
      "prompt-coach loop brief --worktree agent-loop-worktree --branch codex/agent-loop-memory-design",
    );
    expect(html).toContain("Missing evidence");
    expect(html).toContain("latest selected worktree outcome has no evidence refs");
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
    selection_scope: {
      label: "Selection scope",
      filters: ["worktree", "session", "branch"],
      reason:
        "showing snapshots filtered by selected worktree, session, and branch",
      next_action: "copy selected session and branch brief",
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
        "prompt-coach loop brief --worktree agent-loop-worktree --session session-web --branch feature/branch-filter",
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
      clipboard: "copies the selected continuation brief to the local clipboard",
      ui_feedback: "temporarily marks the selected brief copy button as copied",
      does_not:
        "does not write files, execute commands, call external services, submit prompts, or change merge state",
      writes_files: false,
      external_calls: false,
    },
    paste_destination: {
      label: "Paste destination",
      targets: ["Codex active request", "Claude Code active request"],
      instruction:
        "paste the copied continuation brief into the active agent request box",
      reason:
        "keeps Loopdeck as the local handoff source while the user controls submission",
      auto_submit: false,
      writes_files: false,
      external_calls: false,
    },
    handoff_checklist: {
      label: "Continuation handoff checklist",
      steps: [
        "copy selected continuation brief",
        "paste into Codex or Claude Code active request",
        "submit manually after review",
        "collect the next loop snapshot after the agent turn",
      ],
      reason:
        "keeps continuation handoff explicit without automating agent UI or reading transcripts",
      writes_files: false,
      external_calls: false,
    },
    post_handoff_reminder: {
      label: "Post-handoff reminder",
      collect_next: "collect a new loop snapshot after the next agent turn",
      not_memory_approval: "memory approval remains a separate explicit review",
      not_merge: "merge remains a separate review-before-merge decision",
      reason:
        "continuation handoff records the next loop before any memory approval or merge decision",
      writes_files: false,
      external_calls: false,
    },
    source_of_truth_note: {
      label: "Source-of-truth note",
      local_memory_input:
        "next loop snapshot is the source of truth for local loop memory",
      not_transcript_import:
        "transcript import is not used as the source of truth",
      reason:
        "Loopdeck records explicit loop snapshots instead of importing agent transcripts",
      stores_transcripts: false,
      writes_files: false,
      external_calls: false,
    },
    privacy_boundary_note: {
      label: "Privacy boundary",
      storage_scope:
        "stores loop metadata in the local database and Markdown archive only",
      does_not_store:
        "does not store prompt bodies, transcripts, raw paths, or provider credentials",
      reason: "keeps source-of-truth loop memory local-first and reviewable",
      local_only: true,
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
          "prompt-coach loop brief --worktree agent-loop-worktree --branch codex/agent-loop-memory-design",
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
