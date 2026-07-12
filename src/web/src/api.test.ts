import { beforeEach, describe, expect, it, vi } from "vitest";

import type { AnonymizedExportPayload, ExportJob } from "./api.js";

const fetchMock = vi.fn();

beforeEach(() => {
  fetchMock.mockReset();
  vi.resetModules();
  vi.stubGlobal("fetch", fetchMock);
});

describe("web api export client", () => {
  it("lists LoopRelay snapshots without raw prompt or compact content", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(
        jsonResponse({
          data: {
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
                    sessions: 1,
                    snapshots: 1,
                    latest_snapshot_id: "loop_web",
                    latest_created_at: "2026-07-04T01:00:00.000Z",
                    latest_outcome_status: "unknown",
                    evidence_count: 1,
                  },
                ],
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
              latest_snapshot: {
                id: "loop_web",
                created_at: "2026-07-04T01:00:00.000Z",
                tool: "codex",
                source: "cli",
                project: "private-project",
                prompt_count: 2,
                prompt_ids: ["prmt_one", "prmt_two"],
                average_prompt_score: 58,
                top_gaps: ["Goal clarity"],
                outcome_status: "unknown",
              },
              next_action: "looprelay loop collect",
              next_actions: ["Run looprelay loop collect again"],
              privacy: {
                local_only: true,
                external_calls: false,
                returns_prompt_bodies: false,
                returns_raw_paths: false,
                returns_compact_content: false,
              },
            },
            benchmark_readiness: {
              status: "no_completed_outcomes",
              candidate_count: 0,
              candidates: [],
              excluded_unsafe_candidates: 0,
              excluded_missing_candidates: 0,
              diagnostics: {
                completed_snapshots: 0,
                attributed_snapshots: 0,
                evidence_complete_snapshots: 0,
                safe_snapshots: 0,
              },
              has_more: false,
              scope: { scanned_snapshots: 1, snapshot_limit: 100 },
              next_action:
                "Run looprelay loop status, then record the latest snapshot outcome after a verifiable checkpoint.",
              privacy: {
                local_only: true,
                external_calls: false,
                returns_prompt_bodies: false,
                returns_raw_paths: false,
                returns_evidence_refs: false,
              },
            },
            items: [
              {
                id: "loop_web",
                created_at: "2026-07-04T01:00:00.000Z",
                tool: "codex",
                source: "cli",
                project: "private-project",
                prompt_count: 2,
                average_prompt_score: 58,
                top_gaps: ["Goal clarity"],
                outcome_status: "unknown",
                compact_boundary: {
                  id: "cmp_web",
                  created_at: "2026-07-04T01:05:00.000Z",
                  tool: "claude-code",
                  event_name: "PostCompact",
                  trigger: "auto",
                  after_latest_snapshot: true,
                },
              },
            ],
            privacy: {
              local_only: true,
              returns_prompt_bodies: false,
              returns_raw_paths: false,
              returns_compact_content: false,
            },
          },
        }),
      );
    const { listLoops } = await import("./api.js");

    const loops = await listLoops();

    expect(loops.items).toHaveLength(1);
    expect(loops.status.status).toBe("ready");
    expect(loops.status.next_action).toBe("looprelay loop collect");
    expect(loops.status.activity).toMatchObject({
      active_worktrees: 2,
      active_sessions: 2,
      needs_review: true,
      worktrees: [
        {
          worktree: "agent-loop-worktree",
          snapshots: 1,
          sessions: 1,
          latest_outcome_status: "unknown",
        },
      ],
    });
    expect(loops.status.project_memory).toEqual({
      approved_count: 1,
      included_in_brief: true,
    });
    expect(loops.status.memory_candidate).toEqual({
      eligible: true,
      reason: "passed_with_evidence",
      next_action: "looprelay loop memory-approve",
    });
    expect(loops.benchmark_readiness).toMatchObject({
      status: "no_completed_outcomes",
      diagnostics: {
        completed_snapshots: 0,
        attributed_snapshots: 0,
        evidence_complete_snapshots: 0,
        safe_snapshots: 0,
      },
    });
    expect(loops.status.latest_snapshot?.prompt_ids).toEqual([
      "prmt_one",
      "prmt_two",
    ]);
    expect(loops.items[0]).toMatchObject({
      id: "loop_web",
      project: "private-project",
      compact_boundary: {
        event_name: "PostCompact",
        after_latest_snapshot: true,
      },
    });
    expect(fetchMock).toHaveBeenLastCalledWith("/api/v1/loops", {
      credentials: "same-origin",
    });
    expect(JSON.stringify(loops)).not.toContain("Make this better");
    expect(JSON.stringify(loops)).not.toContain("Compact summary");
    expect(JSON.stringify(loops)).not.toContain("/Users/example");
  });

  it("gets a copy-ready LoopRelay brief without raw prompt or compact content", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(
        jsonResponse({
          data: {
            title: "Continue agent loop loop_web",
            source_snapshot_id: "loop_web",
            recovery: {
              policy_version: "recovery-packet-v2",
              authority: "snapshot_metadata",
              selected_target: {
                project: "private-project",
                tool: "claude-code",
              },
              outcome_status: "in_progress",
              evidence_count: 1,
              compact_boundary_after_snapshot: true,
            },
            receipt: {
              id: "brief_web",
              snapshot_id: "loop_web",
              policy_version: "recovery-packet-v2",
              created_at: "2026-07-04T01:06:00.000Z",
              status: "generated",
            },
            prompt:
              "## Goal\nContinue the current coding-agent loop.\n\n## Compaction Boundary\nPostCompact at 2026-07-04T01:05:00.000Z.",
            compact_boundary: {
              id: "cmp_web",
              created_at: "2026-07-04T01:05:00.000Z",
              tool: "claude-code",
              event_name: "PostCompact",
              trigger: "auto",
              after_latest_snapshot: true,
            },
            privacy: {
              local_only: true,
              returns_prompt_bodies: false,
              returns_raw_paths: false,
            },
          },
        }),
      );
    const { getLoopBrief } = await import("./api.js");

    const brief = await getLoopBrief("loop_web");

    expect(brief).toMatchObject({
      title: "Continue agent loop loop_web",
      source_snapshot_id: "loop_web",
      compact_boundary: {
        event_name: "PostCompact",
        after_latest_snapshot: true,
      },
    });
    expect(fetchMock).toHaveBeenLastCalledWith("/api/v1/loops/brief", {
      method: "POST",
      credentials: "same-origin",
      headers: {
        "content-type": "application/json",
        "x-csrf-token": "csrf-1",
      },
      body: JSON.stringify({ snapshot_id: "loop_web" }),
    });
    expect(JSON.stringify(brief)).not.toContain("Make this better");
    expect(JSON.stringify(brief)).not.toContain("Compact summary");
    expect(JSON.stringify(brief)).not.toContain("/Users/example");
  });

  it("gets a selected worktree loop brief with session and branch filters", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(
        jsonResponse({
          data: {
            title: "Continue agent loop loop_web",
            source_snapshot_id: "loop_web",
            recovery: {
              policy_version: "recovery-packet-v2",
              authority: "explicit_checkpoint",
              selected_target: {
                project: "private-project",
                tool: "codex",
                session: "session-web",
                branch: "feature/branch-filter",
                worktree: "agent-loop-worktree",
              },
              outcome_status: "in_progress",
              evidence_count: 1,
              compact_boundary_after_snapshot: false,
            },
            receipt: {
              id: "brief_selected",
              snapshot_id: "loop_web",
              policy_version: "recovery-packet-v2",
              created_at: "2026-07-04T01:06:00.000Z",
              status: "generated",
            },
            prompt:
              "worktree: agent-loop-worktree\nsession: session-web\nbranch: feature/branch-filter",
            privacy: {
              local_only: true,
              returns_prompt_bodies: false,
              returns_raw_paths: false,
            },
          },
        }),
      );
    const { getSelectedLoopBrief } = await import("./api.js");

    const brief = await getSelectedLoopBrief({
      worktree: "agent-loop-worktree",
      sessionId: "session-web",
      branch: "feature/branch-filter",
    });

    expect(brief.source_snapshot_id).toBe("loop_web");
    expect(brief.prompt).toContain("worktree: agent-loop-worktree");
    expect(fetchMock).toHaveBeenLastCalledWith("/api/v1/loops/brief", {
      method: "POST",
      credentials: "same-origin",
      headers: {
        "content-type": "application/json",
        "x-csrf-token": "csrf-1",
      },
      body: JSON.stringify({
        worktree: "agent-loop-worktree",
        session_id: "session-web",
        branch: "feature/branch-filter",
      }),
    });
  });

  it("reports malformed selected loop brief responses without returning incomplete continuation data", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(jsonResponse({ data: {} }));
    const { getSelectedLoopBrief } = await import("./api.js");

    await expect(
      getSelectedLoopBrief({ worktree: "agent-loop-worktree" }),
    ).rejects.toThrow("Selected loop brief failed: Invalid response.");
  });

  it("reports malformed selected loop brief compact boundaries without returning incomplete continuation data", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(
        jsonResponse({
          data: {
            title: "Continue agent loop loop_web",
            source_snapshot_id: "loop_web",
            prompt: "worktree: agent-loop-worktree",
            compact_boundary: {
              event_name: "PostCompact",
              after_latest_snapshot: true,
            },
            privacy: {
              local_only: true,
              returns_prompt_bodies: false,
              returns_raw_paths: false,
            },
          },
        }),
      );
    const { getSelectedLoopBrief } = await import("./api.js");

    await expect(
      getSelectedLoopBrief({ worktree: "agent-loop-worktree" }),
    ).rejects.toThrow("Selected loop brief failed: Invalid response.");
  });

  it("gets a worktree drilldown without raw prompt or compact content", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(
        jsonResponse({
          data: {
            worktree: "agent-loop-worktree",
            session_id: "session-web",
            branch: "feature/branch-filter",
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
              ui_feedback:
                "temporarily marks the selected brief copy button as copied",
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
                id: "loop_web",
                created_at: "2026-07-04T01:00:00.000Z",
                tool: "codex",
                source: "cli",
                project: "private-project",
                branch: "codex/agent-loop-memory-design",
                worktree: "agent-loop-worktree",
                prompt_count: 2,
                prompt_ids: ["prmt_one", "prmt_two"],
                used_improvement_prompt_ids: ["prmt_one"],
                average_prompt_score: 58,
                top_gaps: ["Goal clarity"],
                outcome_status: "passed",
              },
            ],
            privacy: {
              local_only: true,
              returns_prompt_bodies: false,
              returns_raw_paths: false,
              returns_compact_content: false,
            },
          },
        }),
      );
    const { getLoopWorktree } = await import("./api.js");

    const detail = await getLoopWorktree("agent-loop-worktree", {
      branch: "feature/branch-filter",
      sessionId: "session-web",
    });

    expect(detail).toMatchObject({
      worktree: "agent-loop-worktree",
      session_id: "session-web",
      branch: "feature/branch-filter",
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
        ui_feedback:
          "temporarily marks the selected brief copy button as copied",
        does_not:
          "does not write files, execute commands, call external services, submit prompts, or change merge state",
        writes_files: false,
        external_calls: false,
      },
      latest_decision: {
        snapshot_id: "loop_web",
        worktree: "agent-loop-worktree",
        decision: "continue",
      },
      review_packet_summary: {
        title: "Review-before-merge packet",
        status: "needs_review",
        summary: "1 ready, 1 needs review, 0 missing evidence",
        worktree: "agent-loop-worktree",
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
          id: "loop_web",
          created_at: "2026-07-04T01:00:00.000Z",
          tool: "codex",
          source: "cli",
          project: "private-project",
          worktree: "agent-loop-worktree",
          branch: "codex/agent-loop-memory-design",
          prompt_count: 2,
          prompt_ids: ["prmt_one", "prmt_two"],
          used_improvement_prompt_ids: ["prmt_one"],
          average_prompt_score: 58,
          top_gaps: ["Goal clarity"],
          outcome_status: "passed",
        },
      ],
    });
    expect(fetchMock).toHaveBeenLastCalledWith(
      "/api/v1/loops/worktrees/agent-loop-worktree?session_id=session-web&branch=feature%2Fbranch-filter",
      {
        credentials: "same-origin",
      },
    );
    expect(JSON.stringify(detail)).not.toContain("Make this better");
    expect(JSON.stringify(detail)).not.toContain("Compact summary");
    expect(JSON.stringify(detail)).not.toContain("/Users/example");
  });

  it("reports malformed loop worktree responses without returning incomplete selection data", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(jsonResponse({ data: {} }));
    const { getLoopWorktree } = await import("./api.js");

    await expect(getLoopWorktree("agent-loop-worktree")).rejects.toThrow(
      "Loop worktree drilldown failed: Invalid response.",
    );
  });

  it("rejects malformed compact continuation safety without returning unsafe guidance", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(
        jsonResponse({
          data: {
            worktree: "agent-loop-worktree",
            selection_scope: {
              label: "Selection scope",
              filters: ["worktree"],
              reason: "showing latest snapshots for selected worktree",
              next_action: "copy selected worktree brief",
            },
            continuation_safety: {
              label: "Continuation safety",
              steps: [],
              boundaries: [],
              local_only: true,
              writes_files: false,
              external_calls: false,
            },
            items: [],
            privacy: {
              local_only: true,
              returns_prompt_bodies: false,
              returns_raw_paths: false,
              returns_compact_content: false,
            },
          },
        }),
      );
    const { getLoopWorktree } = await import("./api.js");

    await expect(getLoopWorktree("agent-loop-worktree")).rejects.toThrow(
      "Loop worktree drilldown failed: Invalid response.",
    );
  });

  it("reports malformed loop worktree items without returning incomplete snapshots", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(
        jsonResponse({
          data: {
            worktree: "agent-loop-worktree",
            selection_scope: {
              label: "Selection scope",
              filters: ["worktree"],
              reason: "showing latest snapshots for selected worktree",
              next_action: "copy selected worktree brief",
            },
            items: [
              {
                id: "loop_web",
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
          },
        }),
      );
    const { getLoopWorktree } = await import("./api.js");

    await expect(getLoopWorktree("agent-loop-worktree")).rejects.toThrow(
      "Loop worktree drilldown failed: Invalid response.",
    );
  });

  it("reports malformed loop worktree privacy without returning unsafe drilldown data", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(
        jsonResponse({
          data: {
            worktree: "agent-loop-worktree",
            selection_scope: {
              label: "Selection scope",
              filters: ["worktree"],
              reason: "showing latest snapshots for selected worktree",
              next_action: "copy selected worktree brief",
            },
            items: [
              {
                id: "loop_web",
                created_at: "2026-07-04T01:00:00.000Z",
                tool: "codex",
                source: "cli",
                project: "private-project",
                worktree: "agent-loop-worktree",
                prompt_count: 2,
                top_gaps: ["Goal clarity"],
                outcome_status: "passed",
              },
            ],
            privacy: {
              local_only: true,
              returns_prompt_bodies: false,
              returns_raw_paths: true,
              returns_compact_content: false,
            },
          },
        }),
      );
    const { getLoopWorktree } = await import("./api.js");

    await expect(getLoopWorktree("agent-loop-worktree")).rejects.toThrow(
      "Loop worktree drilldown failed: Invalid response.",
    );
  });

  it("reports malformed loop worktree selection scopes without returning incomplete drilldown context", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(
        jsonResponse({
          data: {
            worktree: "agent-loop-worktree",
            selection_scope: {
              label: "Selection scope",
              filters: ["session"],
              reason: "showing latest snapshots for selected worktree",
              next_action: "copy selected worktree brief",
            },
            items: [
              {
                id: "loop_web",
                created_at: "2026-07-04T01:00:00.000Z",
                tool: "codex",
                source: "cli",
                project: "private-project",
                worktree: "agent-loop-worktree",
                prompt_count: 2,
                top_gaps: ["Goal clarity"],
                outcome_status: "passed",
              },
            ],
            privacy: {
              local_only: true,
              returns_prompt_bodies: false,
              returns_raw_paths: false,
              returns_compact_content: false,
            },
          },
        }),
      );
    const { getLoopWorktree } = await import("./api.js");

    await expect(getLoopWorktree("agent-loop-worktree")).rejects.toThrow(
      "Loop worktree drilldown failed: Invalid response.",
    );
  });

  it("reports malformed loop worktree selected brief actions without returning unsafe continuation actions", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(
        jsonResponse({
          data: {
            worktree: "agent-loop-worktree",
            selection_scope: {
              label: "Selection scope",
              filters: ["worktree"],
              reason: "showing latest snapshots for selected worktree",
              next_action: "copy selected worktree brief",
            },
            selected_brief_action: {
              label: "Selected brief action",
              action: "copy selected continuation brief",
              reason:
                "uses the selected worktree/session/branch filters without auto-submitting",
              command: "looprelay loop brief --worktree agent-loop-worktree",
              writes_files: true,
              external_calls: false,
            },
            items: [
              {
                id: "loop_web",
                created_at: "2026-07-04T01:00:00.000Z",
                tool: "codex",
                source: "cli",
                project: "private-project",
                worktree: "agent-loop-worktree",
                prompt_count: 2,
                top_gaps: ["Goal clarity"],
                outcome_status: "passed",
              },
            ],
            privacy: {
              local_only: true,
              returns_prompt_bodies: false,
              returns_raw_paths: false,
              returns_compact_content: false,
            },
          },
        }),
      );
    const { getLoopWorktree } = await import("./api.js");

    await expect(getLoopWorktree("agent-loop-worktree")).rejects.toThrow(
      "Loop worktree drilldown failed: Invalid response.",
    );
  });

  it("reports malformed loop worktree command distinctions without returning unsafe command guidance", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(
        jsonResponse({
          data: {
            worktree: "agent-loop-worktree",
            selection_scope: {
              label: "Selection scope",
              filters: ["worktree"],
              reason: "showing latest snapshots for selected worktree",
              next_action: "copy selected worktree brief",
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
              external_calls: true,
            },
            items: [
              {
                id: "loop_web",
                created_at: "2026-07-04T01:00:00.000Z",
                tool: "codex",
                source: "cli",
                project: "private-project",
                worktree: "agent-loop-worktree",
                prompt_count: 2,
                top_gaps: ["Goal clarity"],
                outcome_status: "passed",
              },
            ],
            privacy: {
              local_only: true,
              returns_prompt_bodies: false,
              returns_raw_paths: false,
              returns_compact_content: false,
            },
          },
        }),
      );
    const { getLoopWorktree } = await import("./api.js");

    await expect(getLoopWorktree("agent-loop-worktree")).rejects.toThrow(
      "Loop worktree drilldown failed: Invalid response.",
    );
  });

  it("reports malformed loop worktree command filters without returning incomplete command guidance", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(
        jsonResponse({
          data: {
            worktree: "agent-loop-worktree",
            selection_scope: {
              label: "Selection scope",
              filters: ["worktree"],
              reason: "showing latest snapshots for selected worktree",
              next_action: "copy selected worktree brief",
            },
            command_filters: {
              label: "Command filters",
              selected_command_filters: ["worktree"],
              review_command_filters: ["session"],
              reason:
                "selected command reflects the current selection while review command reflects command-center review scope",
              writes_files: false,
              external_calls: false,
            },
            items: [
              {
                id: "loop_web",
                created_at: "2026-07-04T01:00:00.000Z",
                tool: "codex",
                source: "cli",
                project: "private-project",
                worktree: "agent-loop-worktree",
                prompt_count: 2,
                top_gaps: ["Goal clarity"],
                outcome_status: "passed",
              },
            ],
            privacy: {
              local_only: true,
              returns_prompt_bodies: false,
              returns_raw_paths: false,
              returns_compact_content: false,
            },
          },
        }),
      );
    const { getLoopWorktree } = await import("./api.js");

    await expect(getLoopWorktree("agent-loop-worktree")).rejects.toThrow(
      "Loop worktree drilldown failed: Invalid response.",
    );
  });

  it("reports malformed loop worktree copy side effects without returning unsafe copy guidance", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(
        jsonResponse({
          data: {
            worktree: "agent-loop-worktree",
            selection_scope: {
              label: "Selection scope",
              filters: ["worktree"],
              reason: "showing latest snapshots for selected worktree",
              next_action: "copy selected worktree brief",
            },
            copy_side_effects: {
              label: "Copy side effects",
              clipboard:
                "copies the selected continuation brief to the local clipboard",
              ui_feedback:
                "temporarily marks the selected brief copy button as copied",
              does_not:
                "does not write files, execute commands, call external services, submit prompts, or change merge state",
              writes_files: false,
              external_calls: true,
            },
            items: [
              {
                id: "loop_web",
                created_at: "2026-07-04T01:00:00.000Z",
                tool: "codex",
                source: "cli",
                project: "private-project",
                worktree: "agent-loop-worktree",
                prompt_count: 2,
                top_gaps: ["Goal clarity"],
                outcome_status: "passed",
              },
            ],
            privacy: {
              local_only: true,
              returns_prompt_bodies: false,
              returns_raw_paths: false,
              returns_compact_content: false,
            },
          },
        }),
      );
    const { getLoopWorktree } = await import("./api.js");

    await expect(getLoopWorktree("agent-loop-worktree")).rejects.toThrow(
      "Loop worktree drilldown failed: Invalid response.",
    );
  });

  it("reports malformed loop worktree snapshot age without returning stale refresh guidance", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(
        jsonResponse({
          data: {
            worktree: "agent-loop-worktree",
            selection_scope: {
              label: "Selection scope",
              filters: ["worktree"],
              reason: "showing latest snapshots for selected worktree",
              next_action: "copy selected worktree brief",
            },
            snapshot_age: {
              label: "Selected snapshot age",
              latest_selected_created_at: "2026-07-04T01:00:00.000Z",
              status: "older_than_latest",
              reason: "another loop snapshot was recorded after this selection",
              next_action: "merge selected worktree without refreshing",
            },
            items: [
              {
                id: "loop_web",
                created_at: "2026-07-04T01:00:00.000Z",
                tool: "codex",
                source: "cli",
                project: "private-project",
                worktree: "agent-loop-worktree",
                prompt_count: 2,
                top_gaps: ["Goal clarity"],
                outcome_status: "passed",
              },
            ],
            privacy: {
              local_only: true,
              returns_prompt_bodies: false,
              returns_raw_paths: false,
              returns_compact_content: false,
            },
          },
        }),
      );
    const { getLoopWorktree } = await import("./api.js");

    await expect(getLoopWorktree("agent-loop-worktree")).rejects.toThrow(
      "Loop worktree drilldown failed: Invalid response.",
    );
  });

  it("approves the latest eligible loop memory candidate with csrf", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(
        jsonResponse({
          data: {
            recorded: true,
            memory: {
              id: "mem_web",
              snapshot_id: "loop_web",
              title: "Remember loop outcome for private-project",
              evidence_refs: ["test:web loops"],
              approved_by: "web",
              created_at: "2026-07-04T01:10:00.000Z",
              privacy: {
                local_only: true,
                stores_prompt_bodies: false,
                stores_raw_paths: false,
                writes_instruction_files: false,
                external_calls: false,
              },
            },
            next_action:
              "use recorded memory as local context in future loop briefs",
            next_actions: [
              "looprelay loop brief",
              "looprelay loop instruction-patch --target-file AGENTS.md",
            ],
            privacy: {
              local_only: true,
              returns_prompt_bodies: false,
              returns_raw_paths: false,
              writes_instruction_files: false,
              external_calls: false,
            },
          },
        }),
      );
    const { approveLoopMemory } = await import("./api.js");

    const result = await approveLoopMemory({ approvedBy: "web" });

    expect(result.recorded).toBe(true);
    expect(result.next_actions).toEqual([
      "looprelay loop brief",
      "looprelay loop instruction-patch --target-file AGENTS.md",
    ]);
    expect(fetchMock).toHaveBeenLastCalledWith("/api/v1/loops/memory/approve", {
      method: "POST",
      credentials: "same-origin",
      headers: {
        "content-type": "application/json",
        "x-csrf-token": "csrf-1",
      },
      body: JSON.stringify({ approved_by: "web" }),
    });
    expect(JSON.stringify(result)).not.toContain("Make this better");
    expect(JSON.stringify(result)).not.toContain("/Users/example");
    expect(JSON.stringify(result)).not.toContain("sk-proj-secret");
  });

  it("sends an exact snapshot id for selected loop memory approval", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(
        jsonResponse({
          data: {
            recorded: true,
            memory: {
              id: "mem_selected",
              snapshot_id: "loop_selected",
              title: "Remember selected outcome",
              evidence_refs: ["test:selected"],
              approved_by: "web",
              created_at: "2026-07-04T02:10:00.000Z",
              privacy: {
                local_only: true,
                stores_prompt_bodies: false,
                stores_raw_paths: false,
                writes_instruction_files: false,
                external_calls: false,
              },
            },
            next_action:
              "use recorded memory as local context in future loop briefs",
            next_actions: ["looprelay loop brief"],
            privacy: {
              local_only: true,
              returns_prompt_bodies: false,
              returns_raw_paths: false,
              writes_instruction_files: false,
              external_calls: false,
            },
          },
        }),
      );
    const { approveLoopMemory } = await import("./api.js");

    const result = await approveLoopMemory({
      approvedBy: "web",
      snapshotId: "loop_selected",
    });

    expect(result.memory.snapshot_id).toBe("loop_selected");
    expect(fetchMock).toHaveBeenLastCalledWith("/api/v1/loops/memory/approve", {
      method: "POST",
      credentials: "same-origin",
      headers: {
        "content-type": "application/json",
        "x-csrf-token": "csrf-1",
      },
      body: JSON.stringify({
        approved_by: "web",
        snapshot_id: "loop_selected",
      }),
    });
  });

  it("reports malformed loop memory approval responses without returning incomplete durable memory data", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(jsonResponse({ data: {} }));
    const { approveLoopMemory } = await import("./api.js");

    await expect(approveLoopMemory({ approvedBy: "web" })).rejects.toThrow(
      "Loop memory approval failed: Invalid response.",
    );
  });

  it("records a loop outcome with csrf and validates the raw-free response", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(
        jsonResponse({
          data: {
            recorded: true,
            snapshot_id: "loop_web",
            outcome: {
              status: "passed",
              summary: "Focused web checks passed.",
              evidence_refs: ["test:web-loops"],
              used_improvement_prompt_ids: ["prmt_one"],
            },
            next_actions: [
              "looprelay loop memory-candidate",
              "looprelay loop brief",
            ],
            privacy: {
              local_only: true,
              returns_prompt_bodies: false,
              returns_raw_paths: false,
              external_calls: false,
              auto_approves_memory: false,
            },
          },
        }),
      );
    const { recordLoopOutcome } = await import("./api.js");

    const result = await recordLoopOutcome("loop_web", {
      status: "passed",
      summary: "Focused web checks passed.",
      evidenceRefs: ["test:web-loops"],
      usedImprovementPromptIds: ["prmt_one"],
    });

    expect(result.recorded).toBe(true);
    expect(fetchMock).toHaveBeenLastCalledWith(
      "/api/v1/loops/loop_web/outcome",
      {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "content-type": "application/json",
          "x-csrf-token": "csrf-1",
        },
        body: JSON.stringify({
          status: "passed",
          summary: "Focused web checks passed.",
          evidence_refs: ["test:web-loops"],
          used_improvement_prompt_ids: ["prmt_one"],
        }),
      },
    );
    expect(JSON.stringify(result)).not.toContain("/Users/example");
  });

  it("rejects malformed loop outcome responses", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(
        jsonResponse({
          data: {
            recorded: true,
            snapshot_id: "loop_web",
            outcome: {
              status: "private-status",
              summary: "Focused web checks passed.",
              evidence_refs: ["test:web-loops"],
            },
            next_actions: [],
            privacy: {
              local_only: true,
              returns_prompt_bodies: false,
              returns_raw_paths: false,
              external_calls: false,
              auto_approves_memory: false,
            },
          },
        }),
      );
    const { recordLoopOutcome } = await import("./api.js");

    await expect(
      recordLoopOutcome("loop_web", {
        status: "passed",
        summary: "Focused web checks passed.",
        evidenceRefs: ["test:web-loops"],
      }),
    ).rejects.toThrow("Loop outcome recording failed: Invalid response.");
  });

  it("reports malformed loop memory approval metadata without returning incomplete durable memory data", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(
        jsonResponse({
          data: {
            recorded: true,
            memory: {
              id: "mem_web",
              snapshot_id: "loop_web",
              title: "Remember loop outcome for private-project",
              evidence_refs: ["test:web loops", 7],
              approved_by: "web",
              created_at: "2026-07-04T01:10:00.000Z",
              privacy: {
                local_only: true,
                stores_prompt_bodies: false,
                stores_raw_paths: false,
                writes_instruction_files: false,
                external_calls: false,
              },
            },
            next_action:
              "use recorded memory as local context in future loop briefs",
            next_actions: ["looprelay loop brief"],
            privacy: {
              local_only: true,
              returns_prompt_bodies: false,
              returns_raw_paths: false,
              writes_instruction_files: false,
              external_calls: false,
            },
          },
        }),
      );
    const { approveLoopMemory } = await import("./api.js");

    await expect(approveLoopMemory({ approvedBy: "web" })).rejects.toThrow(
      "Loop memory approval failed: Invalid response.",
    );
  });

  it("gets a review-only instruction patch proposal for the latest approved loop memory", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(
        jsonResponse({
          data: {
            target_file: "AGENTS.md",
            patch_kind: "append_section",
            title: "Append approved LoopRelay memory to AGENTS.md",
            diff: "--- a/AGENTS.md\n+++ b/AGENTS.md\n@@\n+## LoopRelay Memories\n+  source_memory: mem_web\n",
            writes_files: false,
            requires_user_approval: true,
            source_memory_id: "mem_web",
            apply_gate: {
              web_apply_available: false,
              confirm_command:
                "looprelay loop instruction-apply --target-file AGENTS.md --confirm-apply",
              mcp_tool: "apply_instruction_patch",
              reason:
                "web review does not write files; apply through CLI or MCP with explicit confirmation",
            },
            next_action:
              "review this patch proposal, then apply it manually only if the instruction belongs in the project",
            privacy: {
              local_only: true,
              external_calls: false,
              returns_prompt_bodies: false,
              returns_raw_paths: false,
              writes_instruction_files: false,
            },
          },
        }),
      );
    const { getLoopInstructionPatch } = await import("./api.js");

    const proposal = await getLoopInstructionPatch({ targetFile: "AGENTS.md" });

    expect(proposal.writes_files).toBe(false);
    expect(proposal.requires_user_approval).toBe(true);
    expect(proposal.apply_gate).toEqual({
      web_apply_available: false,
      confirm_command:
        "looprelay loop instruction-apply --target-file AGENTS.md --confirm-apply",
      mcp_tool: "apply_instruction_patch",
      reason:
        "web review does not write files; apply through CLI or MCP with explicit confirmation",
    });
    expect(proposal.diff).toContain("+++ b/AGENTS.md");
    expect(fetchMock).toHaveBeenLastCalledWith(
      "/api/v1/loops/instruction-patch?target_file=AGENTS.md",
      {
        credentials: "same-origin",
      },
    );
    expect(JSON.stringify(proposal)).not.toContain("Make this better");
    expect(JSON.stringify(proposal)).not.toContain("/Users/example");
    expect(JSON.stringify(proposal)).not.toContain("sk-proj-secret");
  });

  it("reports malformed instruction patch proposal responses without returning incomplete apply-gate data", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(jsonResponse({ data: {} }));
    const { getLoopInstructionPatch } = await import("./api.js");

    await expect(
      getLoopInstructionPatch({ targetFile: "AGENTS.md" }),
    ).rejects.toThrow(
      "Loop instruction patch proposal failed: Invalid response.",
    );
  });

  it("reports malformed instruction patch apply gates without returning incomplete approval data", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(
        jsonResponse({
          data: {
            target_file: "AGENTS.md",
            patch_kind: "append_section",
            title: "Append approved LoopRelay memory to AGENTS.md",
            diff: "--- a/AGENTS.md\n+++ b/AGENTS.md\n@@\n+## LoopRelay Memories\n+  source_memory: mem_web\n",
            writes_files: false,
            requires_user_approval: true,
            source_memory_id: "mem_web",
            apply_gate: {
              web_apply_available: false,
              confirm_command:
                "looprelay loop instruction-apply --target-file AGENTS.md --confirm-apply",
              mcp_tool: "apply_instruction_patch",
              reason: 7,
            },
            next_action:
              "review this patch proposal, then apply it manually only if the instruction belongs in the project",
            privacy: {
              local_only: true,
              external_calls: false,
              returns_prompt_bodies: false,
              returns_raw_paths: false,
              writes_instruction_files: false,
            },
          },
        }),
      );
    const { getLoopInstructionPatch } = await import("./api.js");

    await expect(
      getLoopInstructionPatch({ targetFile: "AGENTS.md" }),
    ).rejects.toThrow(
      "Loop instruction patch proposal failed: Invalid response.",
    );
  });

  it("shares an in-flight csrf session request across parallel API calls", async () => {
    fetchMock.mockImplementation(async (url: string) => {
      if (url === "/api/v1/session") {
        await Promise.resolve();
        return jsonResponse({ data: { csrf_token: "csrf-1" } });
      }

      if (url === "/api/v1/settings") {
        return jsonResponse({
          data: {
            data_dir: "/Users/example/.looprelay",
            excluded_project_roots: [],
            redaction_mode: "mask",
            server: { host: "127.0.0.1", port: 17373 },
          },
        });
      }

      if (url === "/api/v1/quality") {
        return jsonResponse({
          data: {
            total_prompts: 0,
            sensitive_prompts: 0,
            sensitive_ratio: 0,
            recent: {
              last_7_days: 0,
              last_30_days: 0,
            },
            trend: {
              daily: [],
            },
            quality_score: {
              average: 0,
              max: 100,
              band: "poor",
              scored_prompts: 0,
            },
            distribution: {
              by_tool: [],
              by_project: [],
            },
            patterns: [],
            instruction_suggestions: [],
            useful_prompts: [],
            duplicate_prompt_groups: [],
            project_profiles: [],
            missing_items: [],
            privacy: {
              local_only: true,
              external_calls: false,
              returns_prompt_bodies: false,
              returns_raw_paths: false,
            },
          },
        });
      }

      if (url === "/api/v1/score?limit=200&low_score_limit=8") {
        return jsonResponse({
          data: {
            generated_at: "2026-07-08T07:30:00.000Z",
            archive_score: {
              average: 0,
              max: 100,
              band: "poor",
              scored_prompts: 0,
              total_prompts: 0,
            },
            distribution: {
              excellent: 0,
              good: 0,
              needs_work: 0,
              weak: 0,
            },
            top_gaps: [],
            practice_plan: [],
            low_score_prompts: [],
            effectiveness_summary: {
              measured_prompts: 0,
              unmeasured_prompts: 0,
              verdicts: {
                proven: 0,
                mixed: 0,
                unproven: 0,
              },
              calibration: {
                linked_outcomes: 0,
                attributed_outcomes: 0,
                passing_outcomes: 0,
                failing_outcomes: 0,
                total_tests_run: 0,
              },
              top_evidence_refs: [],
              next_action: "Record local outcome evidence.",
            },
            filters: {
              max_prompts: 200,
            },
            next_prompt_template: "State the concrete goal before constraints.",
            has_more: false,
            privacy: {
              local_only: true,
              external_calls: false,
              returns_prompt_bodies: false,
              returns_raw_paths: false,
            },
          },
        });
      }

      throw new Error(`Unexpected URL: ${url}`);
    });
    const { getArchiveScoreReport, getQualityDashboard, getSettings } =
      await import("./api.js");

    await Promise.all([
      getSettings(),
      getQualityDashboard(),
      getArchiveScoreReport(),
    ]);

    expect(
      fetchMock.mock.calls.filter(([url]) => url === "/api/v1/session"),
    ).toHaveLength(1);
  });

  it("preserves archive score recovery detail on failed responses", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(
        errorResponse(401, {
          detail:
            "Missing or invalid app session. Open a new local LoopRelay web session, then retry the archive score request.",
        }),
      );
    const { getArchiveScoreReport } = await import("./api.js");

    await expect(getArchiveScoreReport()).rejects.toThrow(
      "Archive score report failed (401): Missing or invalid app session. Open a new local LoopRelay web session, then retry the archive score request.",
    );
  });

  it("reports malformed archive score responses without returning incomplete practice data", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(jsonResponse({ data: {} }));
    const { getArchiveScoreReport } = await import("./api.js");

    await expect(getArchiveScoreReport()).rejects.toThrow(
      "Archive score report failed: Invalid response.",
    );
  });

  it("reports unsafe archive score privacy flags without returning prompt-body score data", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(
        jsonResponse({
          data: {
            archive_score: {
              average: 0,
              max: 100,
              band: "poor",
              scored_prompts: 0,
              total_prompts: 0,
            },
            practice_plan: [],
            low_score_prompts: [],
            privacy: {
              local_only: true,
              external_calls: false,
              returns_prompt_bodies: true,
              returns_raw_paths: false,
            },
          },
        }),
      );
    const { getArchiveScoreReport } = await import("./api.js");

    await expect(getArchiveScoreReport()).rejects.toThrow(
      "Archive score report failed: Invalid response.",
    );
  });

  it("reports unsafe archive score summaries without returning prompt bodies", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(
        jsonResponse({
          data: {
            archive_score: {
              average: 42,
              max: 100,
              band: "fair",
              scored_prompts: 1,
              total_prompts: 1,
              prompt_body: "secret prompt body",
            },
            top_gaps: [],
            practice_plan: [],
            low_score_prompts: [],
            privacy: {
              local_only: true,
              external_calls: false,
              returns_prompt_bodies: false,
              returns_raw_paths: false,
            },
          },
        }),
      );
    const { getArchiveScoreReport } = await import("./api.js");

    await expect(getArchiveScoreReport()).rejects.toThrow(
      "Archive score report failed: Invalid response.",
    );
  });

  it("reports unsafe archive score root data without returning prompt bodies", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(
        jsonResponse({
          data: {
            generated_at: "2026-07-08T07:30:00.000Z",
            archive_score: {
              average: 42,
              max: 100,
              band: "needs_work",
              scored_prompts: 1,
              total_prompts: 1,
            },
            distribution: {
              excellent: 0,
              good: 0,
              needs_work: 1,
              weak: 0,
            },
            top_gaps: [],
            practice_plan: [],
            low_score_prompts: [],
            effectiveness_summary: {
              measured_prompts: 1,
              unmeasured_prompts: 0,
              verdicts: {
                proven: 1,
                mixed: 0,
                unproven: 0,
              },
              calibration: {
                linked_outcomes: 1,
                passing_outcomes: 1,
                failing_outcomes: 0,
                total_tests_run: 2,
              },
              top_evidence_refs: ["test:web-api"],
              next_action: "Keep recording local outcome evidence.",
            },
            filters: {
              project: "private-project",
              max_prompts: 200,
            },
            next_prompt_template: "State the concrete goal before constraints.",
            has_more: false,
            prompt_body: "secret prompt body",
            privacy: {
              local_only: true,
              external_calls: false,
              returns_prompt_bodies: false,
              returns_raw_paths: false,
            },
          },
        }),
      );
    const { getArchiveScoreReport } = await import("./api.js");

    await expect(getArchiveScoreReport()).rejects.toThrow(
      "Archive score report failed: Invalid response.",
    );
  });

  it("reports unsafe archive score distributions without returning prompt bodies", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(
        jsonResponse({
          data: {
            archive_score: {
              average: 42,
              max: 100,
              band: "needs_work",
              scored_prompts: 1,
              total_prompts: 1,
            },
            distribution: {
              excellent: 0,
              good: 0,
              needs_work: 1,
              weak: 0,
              prompt_body: "secret prompt body",
            },
            top_gaps: [],
            practice_plan: [],
            low_score_prompts: [],
            privacy: {
              local_only: true,
              external_calls: false,
              returns_prompt_bodies: false,
              returns_raw_paths: false,
            },
          },
        }),
      );
    const { getArchiveScoreReport } = await import("./api.js");

    await expect(getArchiveScoreReport()).rejects.toThrow(
      "Archive score report failed: Invalid response.",
    );
  });

  it("reports unsafe archive score effectiveness summaries without returning prompt bodies", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(
        jsonResponse({
          data: {
            archive_score: {
              average: 42,
              max: 100,
              band: "needs_work",
              scored_prompts: 1,
              total_prompts: 1,
            },
            distribution: {
              excellent: 0,
              good: 0,
              needs_work: 1,
              weak: 0,
            },
            top_gaps: [],
            practice_plan: [],
            low_score_prompts: [],
            effectiveness_summary: {
              measured_prompts: 1,
              unmeasured_prompts: 0,
              verdicts: {
                proven: 1,
                mixed: 0,
                unproven: 0,
              },
              calibration: {
                linked_outcomes: 1,
                passing_outcomes: 1,
                failing_outcomes: 0,
                total_tests_run: 2,
              },
              top_evidence_refs: ["test:web-api"],
              next_action: "Keep recording local outcome evidence.",
              prompt_body: "secret prompt body",
            },
            privacy: {
              local_only: true,
              external_calls: false,
              returns_prompt_bodies: false,
              returns_raw_paths: false,
            },
          },
        }),
      );
    const { getArchiveScoreReport } = await import("./api.js");

    await expect(getArchiveScoreReport()).rejects.toThrow(
      "Archive score report failed: Invalid response.",
    );
  });

  it("reports unsafe archive score filters without returning raw paths", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(
        jsonResponse({
          data: {
            archive_score: {
              average: 42,
              max: 100,
              band: "needs_work",
              scored_prompts: 1,
              total_prompts: 1,
            },
            distribution: {
              excellent: 0,
              good: 0,
              needs_work: 1,
              weak: 0,
            },
            top_gaps: [],
            practice_plan: [],
            low_score_prompts: [],
            effectiveness_summary: {
              measured_prompts: 1,
              unmeasured_prompts: 0,
              verdicts: {
                proven: 1,
                mixed: 0,
                unproven: 0,
              },
              calibration: {
                linked_outcomes: 1,
                passing_outcomes: 1,
                failing_outcomes: 0,
                total_tests_run: 2,
              },
              top_evidence_refs: ["test:web-api"],
              next_action: "Keep recording local outcome evidence.",
            },
            filters: {
              project: "private-project",
              max_prompts: 200,
              raw_path: "/Users/jinan/private-project",
            },
            privacy: {
              local_only: true,
              external_calls: false,
              returns_prompt_bodies: false,
              returns_raw_paths: false,
            },
          },
        }),
      );
    const { getArchiveScoreReport } = await import("./api.js");

    await expect(getArchiveScoreReport()).rejects.toThrow(
      "Archive score report failed: Invalid response.",
    );
  });

  it("reports unsafe archive score next prompt templates without returning raw paths", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(
        jsonResponse({
          data: {
            archive_score: {
              average: 42,
              max: 100,
              band: "needs_work",
              scored_prompts: 1,
              total_prompts: 1,
            },
            distribution: {
              excellent: 0,
              good: 0,
              needs_work: 1,
              weak: 0,
            },
            top_gaps: [],
            practice_plan: [],
            low_score_prompts: [],
            effectiveness_summary: {
              measured_prompts: 1,
              unmeasured_prompts: 0,
              verdicts: {
                proven: 1,
                mixed: 0,
                unproven: 0,
              },
              calibration: {
                linked_outcomes: 1,
                passing_outcomes: 1,
                failing_outcomes: 0,
                total_tests_run: 2,
              },
              top_evidence_refs: ["test:web-api"],
              next_action: "Keep recording local outcome evidence.",
            },
            filters: {
              project: "private-project",
              max_prompts: 200,
            },
            next_prompt_template:
              "Continue the task in /Users/jinan/private-project with exact file paths.",
            privacy: {
              local_only: true,
              external_calls: false,
              returns_prompt_bodies: false,
              returns_raw_paths: false,
            },
          },
        }),
      );
    const { getArchiveScoreReport } = await import("./api.js");

    await expect(getArchiveScoreReport()).rejects.toThrow(
      "Archive score report failed: Invalid response.",
    );
  });

  it("reports malformed archive score metadata without returning pagination state", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(
        jsonResponse({
          data: {
            generated_at: "2026-07-08T07:30:00.000Z",
            archive_score: {
              average: 42,
              max: 100,
              band: "needs_work",
              scored_prompts: 1,
              total_prompts: 1,
            },
            distribution: {
              excellent: 0,
              good: 0,
              needs_work: 1,
              weak: 0,
            },
            top_gaps: [],
            practice_plan: [],
            low_score_prompts: [],
            effectiveness_summary: {
              measured_prompts: 1,
              unmeasured_prompts: 0,
              verdicts: {
                proven: 1,
                mixed: 0,
                unproven: 0,
              },
              calibration: {
                linked_outcomes: 1,
                passing_outcomes: 1,
                failing_outcomes: 0,
                total_tests_run: 2,
              },
              top_evidence_refs: ["test:web-api"],
              next_action: "Keep recording local outcome evidence.",
            },
            filters: {
              project: "private-project",
              max_prompts: 200,
            },
            next_prompt_template: "State the concrete goal before constraints.",
            has_more: "false",
            privacy: {
              local_only: true,
              external_calls: false,
              returns_prompt_bodies: false,
              returns_raw_paths: false,
            },
          },
        }),
      );
    const { getArchiveScoreReport } = await import("./api.js");

    await expect(getArchiveScoreReport()).rejects.toThrow(
      "Archive score report failed: Invalid response.",
    );
  });

  it("reports unsafe archive score practice plan items without returning prompt bodies", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(
        jsonResponse({
          data: {
            archive_score: {
              average: 42,
              max: 100,
              band: "fair",
              scored_prompts: 1,
              total_prompts: 1,
            },
            practice_plan: [
              {
                priority: 1,
                label: "Goal clarity",
                prompt_rule: "State the concrete goal before constraints.",
                reason: "1 prompt missed goal clarity.",
                count: 1,
                rate: 1,
                prompt_body: "secret prompt body",
              },
            ],
            low_score_prompts: [],
            privacy: {
              local_only: true,
              external_calls: false,
              returns_prompt_bodies: false,
              returns_raw_paths: false,
            },
          },
        }),
      );
    const { getArchiveScoreReport } = await import("./api.js");

    await expect(getArchiveScoreReport()).rejects.toThrow(
      "Archive score report failed: Invalid response.",
    );
  });

  it("reports unsafe archive score top gap items without returning prompt bodies", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(
        jsonResponse({
          data: {
            archive_score: {
              average: 42,
              max: 100,
              band: "fair",
              scored_prompts: 1,
              total_prompts: 1,
            },
            top_gaps: [
              {
                label: "Goal clarity",
                count: 1,
                rate: 1,
                prompt_body: "secret prompt body",
              },
            ],
            practice_plan: [],
            low_score_prompts: [],
            privacy: {
              local_only: true,
              external_calls: false,
              returns_prompt_bodies: false,
              returns_raw_paths: false,
            },
          },
        }),
      );
    const { getArchiveScoreReport } = await import("./api.js");

    await expect(getArchiveScoreReport()).rejects.toThrow(
      "Archive score report failed: Invalid response.",
    );
  });

  it("reports unsafe archive score low prompt items without returning prompt bodies", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(
        jsonResponse({
          data: {
            archive_score: {
              average: 42,
              max: 100,
              band: "fair",
              scored_prompts: 1,
              total_prompts: 1,
            },
            practice_plan: [],
            low_score_prompts: [
              {
                id: "prmt_web_low",
                tool: "codex",
                project: "private-project",
                received_at: "2026-07-04T01:00:00.000Z",
                quality_score: 42,
                quality_score_band: "fair",
                quality_gaps: ["Goal clarity"],
                tags: ["review"],
                is_sensitive: false,
                prompt_body: "secret prompt body",
              },
            ],
            privacy: {
              local_only: true,
              external_calls: false,
              returns_prompt_bodies: false,
              returns_raw_paths: false,
            },
          },
        }),
      );
    const { getArchiveScoreReport } = await import("./api.js");

    await expect(getArchiveScoreReport()).rejects.toThrow(
      "Archive score report failed: Invalid response.",
    );
  });

  it("preserves quality dashboard recovery detail on failed responses", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(
        errorResponse(401, {
          detail:
            "Missing or invalid app session. Open a new local LoopRelay web session, then retry the quality dashboard request.",
        }),
      );
    const { getQualityDashboard } = await import("./api.js");

    await expect(getQualityDashboard()).rejects.toThrow(
      "Quality dashboard failed (401): Missing or invalid app session. Open a new local LoopRelay web session, then retry the quality dashboard request.",
    );
  });

  it("reports malformed quality dashboard responses without returning incomplete metrics", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(jsonResponse({ data: {} }));
    const { getQualityDashboard } = await import("./api.js");

    await expect(getQualityDashboard()).rejects.toThrow(
      "Quality dashboard failed: Invalid response.",
    );
  });

  it("reports unsafe quality dashboard privacy flags without returning raw paths", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(
        jsonResponse({
          data: {
            total_prompts: 1,
            quality_score: {
              average: 42,
              max: 100,
              band: "needs_work",
              scored_prompts: 1,
            },
            missing_items: [],
            privacy: {
              local_only: true,
              external_calls: false,
              returns_prompt_bodies: false,
              returns_raw_paths: true,
            },
          },
        }),
      );
    const { getQualityDashboard } = await import("./api.js");

    await expect(getQualityDashboard()).rejects.toThrow(
      "Quality dashboard failed: Invalid response.",
    );
  });

  it("reports unsafe quality dashboard score summaries without returning prompt bodies", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(
        jsonResponse({
          data: {
            total_prompts: 1,
            quality_score: {
              average: 42,
              max: 100,
              band: "needs_work",
              scored_prompts: 1,
              prompt_body: "secret prompt body",
            },
            missing_items: [],
            privacy: {
              local_only: true,
              external_calls: false,
              returns_prompt_bodies: false,
              returns_raw_paths: false,
            },
          },
        }),
      );
    const { getQualityDashboard } = await import("./api.js");

    await expect(getQualityDashboard()).rejects.toThrow(
      "Quality dashboard failed: Invalid response.",
    );
  });

  it("reports unsafe quality dashboard missing items without returning prompt bodies", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(
        jsonResponse({
          data: {
            total_prompts: 1,
            quality_score: {
              average: 42,
              max: 100,
              band: "needs_work",
              scored_prompts: 1,
            },
            missing_items: [
              {
                key: "goal_clarity",
                label: "Goal clarity",
                missing: 1,
                weak: 0,
                total: 1,
                rate: 1,
                prompt_body: "secret prompt body",
              },
            ],
            privacy: {
              local_only: true,
              external_calls: false,
              returns_prompt_bodies: false,
              returns_raw_paths: false,
            },
          },
        }),
      );
    const { getQualityDashboard } = await import("./api.js");

    await expect(getQualityDashboard()).rejects.toThrow(
      "Quality dashboard failed: Invalid response.",
    );
  });

  it("reports unsafe quality dashboard distribution buckets without returning raw paths", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(
        jsonResponse({
          data: {
            total_prompts: 1,
            quality_score: {
              average: 42,
              max: 100,
              band: "needs_work",
              scored_prompts: 1,
            },
            distribution: {
              by_tool: [],
              by_project: [
                {
                  key: "proj_private",
                  label: "private-project",
                  count: 1,
                  ratio: 1,
                  raw_path: "/Users/jinan/private-project",
                },
              ],
            },
            missing_items: [],
            privacy: {
              local_only: true,
              external_calls: false,
              returns_prompt_bodies: false,
              returns_raw_paths: false,
            },
          },
        }),
      );
    const { getQualityDashboard } = await import("./api.js");

    await expect(getQualityDashboard()).rejects.toThrow(
      "Quality dashboard failed: Invalid response.",
    );
  });

  it("reports unsafe quality dashboard patterns without returning prompt bodies", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(
        jsonResponse({
          data: {
            total_prompts: 1,
            quality_score: {
              average: 42,
              max: 100,
              band: "needs_work",
              scored_prompts: 1,
            },
            distribution: {
              by_tool: [],
              by_project: [],
            },
            patterns: [
              {
                project: "private-project",
                item_key: "goal_clarity",
                label: "Goal clarity",
                count: 1,
                total: 1,
                message: "private-project repeats Goal clarity gaps.",
                prompt_body: "secret prompt body",
              },
            ],
            missing_items: [],
            privacy: {
              local_only: true,
              external_calls: false,
              returns_prompt_bodies: false,
              returns_raw_paths: false,
            },
          },
        }),
      );
    const { getQualityDashboard } = await import("./api.js");

    await expect(getQualityDashboard()).rejects.toThrow(
      "Quality dashboard failed: Invalid response.",
    );
  });

  it("reports unsafe quality dashboard instruction suggestions without returning raw paths", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(
        jsonResponse({
          data: {
            total_prompts: 1,
            quality_score: {
              average: 42,
              max: 100,
              band: "needs_work",
              scored_prompts: 1,
            },
            distribution: {
              by_tool: [],
              by_project: [],
            },
            patterns: [],
            instruction_suggestions: [
              {
                scope: "project",
                project: "private-project",
                text: "Add a project instruction candidate.",
                reason: "Repeated project-specific prompt gap.",
                raw_path: "/Users/jinan/private-project/AGENTS.md",
              },
            ],
            missing_items: [],
            privacy: {
              local_only: true,
              external_calls: false,
              returns_prompt_bodies: false,
              returns_raw_paths: false,
            },
          },
        }),
      );
    const { getQualityDashboard } = await import("./api.js");

    await expect(getQualityDashboard()).rejects.toThrow(
      "Quality dashboard failed: Invalid response.",
    );
  });

  it("reports unsafe quality dashboard useful prompts without returning prompt bodies", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(
        jsonResponse({
          data: {
            total_prompts: 1,
            quality_score: {
              average: 42,
              max: 100,
              band: "needs_work",
              scored_prompts: 1,
            },
            distribution: {
              by_tool: [],
              by_project: [],
            },
            patterns: [],
            instruction_suggestions: [],
            useful_prompts: [
              {
                id: "prmt_useful",
                tool: "codex",
                cwd: "private-project",
                received_at: "2026-07-04T01:00:00.000Z",
                copied_count: 2,
                bookmarked: true,
                tags: ["review"],
                quality_gaps: [],
                prompt_body: "secret prompt body",
              },
            ],
            missing_items: [],
            privacy: {
              local_only: true,
              external_calls: false,
              returns_prompt_bodies: false,
              returns_raw_paths: false,
            },
          },
        }),
      );
    const { getQualityDashboard } = await import("./api.js");

    await expect(getQualityDashboard()).rejects.toThrow(
      "Quality dashboard failed: Invalid response.",
    );
  });

  it("reports unsafe quality dashboard duplicate groups without returning prompt bodies", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(
        jsonResponse({
          data: {
            total_prompts: 1,
            quality_score: {
              average: 42,
              max: 100,
              band: "needs_work",
              scored_prompts: 1,
            },
            distribution: {
              by_tool: [],
              by_project: [],
            },
            patterns: [],
            instruction_suggestions: [],
            useful_prompts: [],
            duplicate_prompt_groups: [
              {
                group_id: "dupe_1",
                count: 1,
                latest_received_at: "2026-07-04T01:00:00.000Z",
                projects: ["private-project"],
                prompts: [
                  {
                    id: "prmt_duplicate",
                    tool: "codex",
                    cwd: "private-project",
                    received_at: "2026-07-04T01:00:00.000Z",
                    tags: ["review"],
                    quality_gaps: [],
                    prompt_body: "secret prompt body",
                  },
                ],
              },
            ],
            missing_items: [],
            privacy: {
              local_only: true,
              external_calls: false,
              returns_prompt_bodies: false,
              returns_raw_paths: false,
            },
          },
        }),
      );
    const { getQualityDashboard } = await import("./api.js");

    await expect(getQualityDashboard()).rejects.toThrow(
      "Quality dashboard failed: Invalid response.",
    );
  });

  it("reports unsafe quality dashboard project profiles without returning raw paths", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(
        jsonResponse({
          data: {
            total_prompts: 1,
            quality_score: {
              average: 42,
              max: 100,
              band: "needs_work",
              scored_prompts: 1,
            },
            distribution: {
              by_tool: [],
              by_project: [],
            },
            patterns: [],
            instruction_suggestions: [],
            useful_prompts: [],
            duplicate_prompt_groups: [],
            project_profiles: [
              {
                key: "proj_private",
                label: "private-project",
                prompt_count: 1,
                quality_gap_count: 1,
                quality_gap_rate: 1,
                average_quality_score: 42,
                sensitive_count: 0,
                copied_count: 1,
                bookmarked_count: 0,
                latest_received_at: "2026-07-04T01:00:00.000Z",
                top_gap: {
                  key: "goal_clarity",
                  label: "Goal clarity",
                  count: 1,
                  raw_path: "/Users/jinan/private-project",
                },
              },
            ],
            missing_items: [],
            privacy: {
              local_only: true,
              external_calls: false,
              returns_prompt_bodies: false,
              returns_raw_paths: false,
            },
          },
        }),
      );
    const { getQualityDashboard } = await import("./api.js");

    await expect(getQualityDashboard()).rejects.toThrow(
      "Quality dashboard failed: Invalid response.",
    );
  });

  it("reports unsafe quality dashboard recent summaries without returning raw paths", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(
        jsonResponse({
          data: {
            total_prompts: 1,
            sensitive_prompts: 0,
            sensitive_ratio: 0,
            recent: {
              last_7_days: 1,
              last_30_days: 1,
              raw_path: "/Users/jinan/private-project",
            },
            quality_score: {
              average: 42,
              max: 100,
              band: "needs_work",
              scored_prompts: 1,
            },
            distribution: {
              by_tool: [],
              by_project: [],
            },
            patterns: [],
            instruction_suggestions: [],
            useful_prompts: [],
            duplicate_prompt_groups: [],
            project_profiles: [],
            missing_items: [],
            privacy: {
              local_only: true,
              external_calls: false,
              returns_prompt_bodies: false,
              returns_raw_paths: false,
            },
          },
        }),
      );
    const { getQualityDashboard } = await import("./api.js");

    await expect(getQualityDashboard()).rejects.toThrow(
      "Quality dashboard failed: Invalid response.",
    );
  });

  it("reports unsafe quality dashboard trend items without returning prompt bodies", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(
        jsonResponse({
          data: {
            total_prompts: 1,
            sensitive_prompts: 0,
            sensitive_ratio: 0,
            recent: {
              last_7_days: 1,
              last_30_days: 1,
            },
            trend: {
              daily: [
                {
                  date: "2026-07-04",
                  prompt_count: 1,
                  quality_gap_count: 1,
                  quality_gap_rate: 1,
                  average_quality_score: 42,
                  sensitive_count: 0,
                  prompt_body: "secret prompt body",
                },
              ],
            },
            quality_score: {
              average: 42,
              max: 100,
              band: "needs_work",
              scored_prompts: 1,
            },
            distribution: {
              by_tool: [],
              by_project: [],
            },
            patterns: [],
            instruction_suggestions: [],
            useful_prompts: [],
            duplicate_prompt_groups: [],
            project_profiles: [],
            missing_items: [],
            privacy: {
              local_only: true,
              external_calls: false,
              returns_prompt_bodies: false,
              returns_raw_paths: false,
            },
          },
        }),
      );
    const { getQualityDashboard } = await import("./api.js");

    await expect(getQualityDashboard()).rejects.toThrow(
      "Quality dashboard failed: Invalid response.",
    );
  });

  it("reports unsafe quality dashboard root data without returning prompt bodies", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(
        jsonResponse({
          data: {
            total_prompts: 1,
            sensitive_prompts: 0,
            sensitive_ratio: 0,
            recent: {
              last_7_days: 1,
              last_30_days: 1,
            },
            trend: {
              daily: [],
            },
            quality_score: {
              average: 42,
              max: 100,
              band: "needs_work",
              scored_prompts: 1,
            },
            distribution: {
              by_tool: [],
              by_project: [],
            },
            patterns: [],
            instruction_suggestions: [],
            useful_prompts: [],
            duplicate_prompt_groups: [],
            project_profiles: [],
            missing_items: [],
            prompt_body: "secret prompt body",
            privacy: {
              local_only: true,
              external_calls: false,
              returns_prompt_bodies: false,
              returns_raw_paths: false,
            },
          },
        }),
      );
    const { getQualityDashboard } = await import("./api.js");

    await expect(getQualityDashboard()).rejects.toThrow(
      "Quality dashboard failed: Invalid response.",
    );
  });

  it("preserves prompt list recovery detail on failed responses", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(
        errorResponse(401, {
          detail:
            "Missing or invalid app session. Open a new local LoopRelay web session, then retry the prompt archive request.",
        }),
      );
    const { listPrompts } = await import("./api.js");

    await expect(listPrompts({})).rejects.toThrow(
      "Prompt list failed (401): Missing or invalid app session. Open a new local LoopRelay web session, then retry the prompt archive request.",
    );
  });

  it("reports malformed prompt list responses without returning incomplete archive data", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(jsonResponse({ data: {} }));
    const { listPrompts } = await import("./api.js");

    await expect(listPrompts({})).rejects.toThrow(
      "Prompt list failed: Invalid response.",
    );
  });

  it("reports unsafe prompt list items without returning prompt bodies", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(
        jsonResponse({
          data: {
            items: [
              {
                id: "prmt_list",
                tool: "codex",
                source_event: "UserPromptSubmit",
                session_id: "session-1",
                cwd: "private-project",
                created_at: "2026-07-04T01:00:00.000Z",
                received_at: "2026-07-04T01:00:00.000Z",
                snippet: "redacted prompt summary",
                prompt_length: 20,
                is_sensitive: false,
                excluded_from_analysis: false,
                redaction_policy: "mask",
                adapter_version: "test",
                index_status: "indexed",
                tags: ["review"],
                quality_gaps: [],
                quality_score: 42,
                quality_score_band: "needs_work",
                usefulness: {
                  copied_count: 0,
                  bookmarked: false,
                },
                duplicate_count: 0,
                prompt_body: "secret prompt body",
              },
            ],
          },
        }),
      );
    const { listPrompts } = await import("./api.js");

    await expect(listPrompts({})).rejects.toThrow(
      "Prompt list failed: Invalid response.",
    );
  });

  it("reports unsafe prompt list root data without returning prompt bodies", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(
        jsonResponse({
          data: {
            items: [],
            next_cursor: "cursor-1",
            prompt_body: "secret prompt body",
          },
        }),
      );
    const { listPrompts } = await import("./api.js");

    await expect(listPrompts({})).rejects.toThrow(
      "Prompt list failed: Invalid response.",
    );
  });

  it("preserves session bootstrap recovery detail on failed responses", async () => {
    fetchMock.mockResolvedValueOnce(
      errorResponse(401, {
        detail:
          "Missing or invalid app session. Open a new local LoopRelay web session, then retry the request.",
      }),
    );
    const { listPrompts } = await import("./api.js");

    await expect(listPrompts({})).rejects.toThrow(
      "Session failed (401): Missing or invalid app session. Open a new local LoopRelay web session, then retry the request.",
    );
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("reports malformed session bootstrap responses without raw TypeError detail", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ data: {} }));
    const { listPrompts } = await import("./api.js");

    let caught: unknown;
    try {
      await listPrompts({});
    } catch (error) {
      caught = error;
    }

    expect(caught).toBeInstanceOf(Error);
    expect((caught as Error).message).toBe(
      "Session failed: Invalid session response.",
    );
    expect((caught as Error).message).not.toContain("csrf_token");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("rejects blank session csrf tokens before issuing API requests", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "" } }));
    const { listPrompts } = await import("./api.js");

    await expect(listPrompts({})).rejects.toThrow(
      "Session failed: Invalid session response.",
    );
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("preserves project list recovery detail on failed responses", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(
        errorResponse(401, {
          detail:
            "Missing or invalid app session. Open a new local LoopRelay web session, then retry the project list request.",
        }),
      );
    const { listProjects } = await import("./api.js");

    await expect(listProjects()).rejects.toThrow(
      "Project list failed (401): Missing or invalid app session. Open a new local LoopRelay web session, then retry the project list request.",
    );
  });

  it("reports malformed project list responses without returning undefined", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(jsonResponse({ data: {} }));
    const { listProjects } = await import("./api.js");

    await expect(listProjects()).rejects.toThrow(
      "Project list failed: Invalid response.",
    );
  });

  it("reports malformed project list items without returning incomplete project state", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(jsonResponse({ data: { items: [{}] } }));
    const { listProjects } = await import("./api.js");

    await expect(listProjects()).rejects.toThrow(
      "Project list failed: Invalid response.",
    );
  });

  it("rejects project list items that include raw-like project fields", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(
        jsonResponse({
          data: {
            items: [
              {
                project_id: "proj_abcdef123456",
                label: "looprelay",
                path_kind: "project_root",
                prompt_count: 1,
                sensitive_count: 0,
                quality_gap_rate: 0,
                copied_count: 0,
                bookmarked_count: 0,
                policy: {
                  capture_disabled: false,
                  analysis_disabled: false,
                  external_analysis_opt_in: false,
                  export_disabled: false,
                  version: 1,
                },
                raw_path: "/Users/example/private/project",
              },
            ],
          },
        }),
      );
    const { listProjects } = await import("./api.js");

    await expect(listProjects()).rejects.toThrow(
      "Project list failed: Invalid response.",
    );
  });

  it("rejects project list items with raw-like instruction review fields", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(
        jsonResponse({
          data: {
            items: [
              {
                project_id: "proj_abcdef123456",
                label: "looprelay",
                path_kind: "project_root",
                prompt_count: 1,
                sensitive_count: 0,
                quality_gap_rate: 0,
                copied_count: 0,
                bookmarked_count: 0,
                policy: {
                  capture_disabled: false,
                  analysis_disabled: false,
                  external_analysis_opt_in: false,
                  export_disabled: false,
                  version: 1,
                },
                instruction_review: {
                  generated_at: "2026-05-03T00:00:00.000Z",
                  analyzer: "local-project-instructions-v1",
                  score: { value: 80, max: 100, band: "good" },
                  files_found: 0,
                  files: [],
                  checklist: [],
                  suggestions: [],
                  prompt_body: "secret instruction body",
                  privacy: {
                    local_only: true,
                    external_calls: false,
                    stores_file_bodies: false,
                    returns_file_bodies: false,
                    returns_raw_paths: false,
                  },
                },
              },
            ],
          },
        }),
      );
    const { listProjects } = await import("./api.js");

    await expect(listProjects()).rejects.toThrow(
      "Project list failed: Invalid response.",
    );
  });

  it("reports malformed project policy update responses without returning incomplete project state", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(jsonResponse({ data: {} }));
    const { updateProjectPolicy } = await import("./api.js");

    await expect(
      updateProjectPolicy("proj_abcdef123456", { capture_disabled: true }),
    ).rejects.toThrow("Project policy update failed: Invalid response.");
  });

  it("preserves settings recovery detail on failed responses", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(
        errorResponse(401, {
          detail:
            "Missing or invalid app session. Open a new local LoopRelay web session, then retry the settings request.",
        }),
      );
    const { getSettings } = await import("./api.js");

    await expect(getSettings()).rejects.toThrow(
      "Settings failed (401): Missing or invalid app session. Open a new local LoopRelay web session, then retry the settings request.",
    );
  });

  it("preserves settings recovery detail from failed response error fields", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(
        errorResponse(401, {
          error:
            "Missing or invalid app session. Open a new local LoopRelay web session, then retry the settings request.",
        }),
      );
    const { getSettings } = await import("./api.js");

    await expect(getSettings()).rejects.toThrow(
      "Settings failed (401): Missing or invalid app session. Open a new local LoopRelay web session, then retry the settings request.",
    );
  });

  it("preserves settings recovery detail from failed response error descriptions", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(
        errorResponse(401, {
          error: "invalid_session",
          error_description:
            "Missing or invalid app session. Open a new local LoopRelay web session, then retry the settings request.",
        }),
      );
    const { getSettings } = await import("./api.js");

    await expect(getSettings()).rejects.toThrow(
      "Settings failed (401): Missing or invalid app session. Open a new local LoopRelay web session, then retry the settings request.",
    );
  });

  it("preserves settings recovery detail from failed response errors fields", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(
        errorResponse(401, {
          errors:
            "Missing or invalid app session. Open a new local LoopRelay web session, then retry the settings request.",
        }),
      );
    const { getSettings } = await import("./api.js");

    await expect(getSettings()).rejects.toThrow(
      "Settings failed (401): Missing or invalid app session. Open a new local LoopRelay web session, then retry the settings request.",
    );
  });

  it("preserves settings recovery detail from failed text responses", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(
        textResponse(
          401,
          "Missing or invalid app session. Open a new local LoopRelay web session, then retry the settings request.",
        ),
      );
    const { getSettings } = await import("./api.js");

    await expect(getSettings()).rejects.toThrow(
      "Settings failed (401): Missing or invalid app session. Open a new local LoopRelay web session, then retry the settings request.",
    );
  });

  it("preserves settings recovery detail from real failed text responses", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(
        new Response(
          "Missing or invalid app session. Open a new local LoopRelay web session, then retry the settings request.",
          { status: 401 },
        ),
      );
    const { getSettings } = await import("./api.js");

    await expect(getSettings()).rejects.toThrow(
      "Settings failed (401): Missing or invalid app session. Open a new local LoopRelay web session, then retry the settings request.",
    );
  });

  it("preserves settings recovery detail from failed JSON string responses", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(
        errorResponse(
          401,
          "Missing or invalid app session. Open a new local LoopRelay web session, then retry the settings request.",
        ),
      );
    const { getSettings } = await import("./api.js");

    await expect(getSettings()).rejects.toThrow(
      "Settings failed (401): Missing or invalid app session. Open a new local LoopRelay web session, then retry the settings request.",
    );
  });

  it("redacts raw-like prompt details from failed response messages", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(
        errorResponse(500, {
          detail:
            'Unexpected setup failure prompt_body="summarize my private incident report"',
        }),
      );
    const { getSettings } = await import("./api.js");

    await expect(getSettings()).rejects.toThrow(
      'Settings failed (500): Unexpected setup failure prompt_body="[REDACTED:prompt_body]"',
    );
  });

  it("redacts unquoted raw-like prompt details from failed response messages", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(
        errorResponse(500, {
          detail:
            "Unexpected setup failure prompt_body=private-incident-summary",
        }),
      );
    const { getSettings } = await import("./api.js");

    await expect(getSettings()).rejects.toThrow(
      "Settings failed (500): Unexpected setup failure prompt_body=[REDACTED:prompt_body]",
    );
  });

  it("redacts colon-delimited raw-like prompt phrases from failed response messages", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(
        errorResponse(500, {
          detail:
            "Unexpected setup failure prompt_body: private incident summary. Retry setup.",
        }),
      );
    const { getSettings } = await import("./api.js");

    await expect(getSettings()).rejects.toThrow(
      "Settings failed (500): Unexpected setup failure prompt_body:[REDACTED:prompt_body]. Retry setup.",
    );
  });

  it("redacts compact summary details from failed response messages", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(
        errorResponse(500, {
          detail:
            "Unexpected setup failure compact_summary: private loop context and transcript notes. Retry setup.",
        }),
      );
    const { getSettings } = await import("./api.js");

    await expect(getSettings()).rejects.toThrow(
      "Settings failed (500): Unexpected setup failure compact_summary:[REDACTED:compact_summary]. Retry setup.",
    );
  });

  it("redacts raw-field issue messages from failed response errors", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(
        errorResponse(422, {
          detail: "The request payload is invalid.",
          errors: [
            {
              field: "compact_summary",
              message: "private loop context and transcript notes",
            },
          ],
        }),
      );
    const { getSettings } = await import("./api.js");

    await expect(getSettings()).rejects.toThrow(
      "Settings failed (422): The request payload is invalid. compact_summary: [REDACTED:compact_summary]",
    );
  });

  it("redacts raw-field path issue messages from failed response errors", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(
        errorResponse(422, {
          detail: "The request payload is invalid.",
          errors: [
            {
              field: "body.prompt_body",
              message: "private setup prompt from the user request",
            },
          ],
        }),
      );
    const { getSettings } = await import("./api.js");

    await expect(getSettings()).rejects.toThrow(
      "Settings failed (422): The request payload is invalid. body.prompt_body: [REDACTED:prompt_body]",
    );
  });

  it("redacts raw field-array issue messages from failed response errors", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(
        errorResponse(422, {
          detail: "The request payload is invalid.",
          errors: [
            {
              field: ["body", "prompt_body"],
              message: "private setup prompt from the user request",
            },
          ],
        }),
      );
    const { getSettings } = await import("./api.js");

    await expect(getSettings()).rejects.toThrow(
      "Settings failed (422): The request payload is invalid. body.prompt_body: [REDACTED:prompt_body]",
    );
  });

  it("redacts raw path-array issue messages from failed response errors", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(
        errorResponse(422, {
          detail: "The request payload is invalid.",
          errors: [
            {
              path: ["body", "prompt_body"],
              message: "private setup prompt from the user request",
            },
          ],
        }),
      );
    const { getSettings } = await import("./api.js");

    await expect(getSettings()).rejects.toThrow(
      "Settings failed (422): The request payload is invalid. body.prompt_body: [REDACTED:prompt_body]",
    );
  });

  it("redacts raw path-array issue messages from failed response issues", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(
        errorResponse(422, {
          detail: "The request payload is invalid.",
          issues: [
            {
              path: ["body", "prompt_body"],
              message: "private setup prompt from the user request",
            },
          ],
        }),
      );
    const { getSettings } = await import("./api.js");

    await expect(getSettings()).rejects.toThrow(
      "Settings failed (422): The request payload is invalid. body.prompt_body: [REDACTED:prompt_body]",
    );
  });

  it("redacts raw instance-path issue messages from failed response errors", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(
        errorResponse(422, {
          detail: "The request payload is invalid.",
          errors: [
            {
              instancePath: "/body/prompt_body",
              message: "private setup prompt from the user request",
            },
          ],
        }),
      );
    const { getSettings } = await import("./api.js");

    await expect(getSettings()).rejects.toThrow(
      "Settings failed (422): The request payload is invalid. body.prompt_body: [REDACTED:prompt_body]",
    );
  });

  it("redacts raw source-pointer issue messages from failed response errors", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(
        errorResponse(422, {
          detail: "The request payload is invalid.",
          errors: [
            {
              source: { pointer: "/data/attributes/prompt_body" },
              message: "private setup prompt from the user request",
            },
          ],
        }),
      );
    const { getSettings } = await import("./api.js");

    await expect(getSettings()).rejects.toThrow(
      "Settings failed (422): The request payload is invalid. data.attributes.prompt_body: [REDACTED:prompt_body]",
    );
  });

  it("preserves source-pointer issue details from failed response errors", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(
        errorResponse(422, {
          detail: "The request payload is invalid.",
          errors: [
            {
              source: { pointer: "/data/attributes/title" },
              detail: "Expected a non-empty title.",
            },
          ],
        }),
      );
    const { getSettings } = await import("./api.js");

    await expect(getSettings()).rejects.toThrow(
      "Settings failed (422): The request payload is invalid. data.attributes.title: Expected a non-empty title.",
    );
  });

  it("redacts raw property issue messages from failed response errors", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(
        errorResponse(422, {
          detail: "The request payload is invalid.",
          errors: [
            {
              property: "body.prompt_body",
              message: "private setup prompt from the user request",
            },
          ],
        }),
      );
    const { getSettings } = await import("./api.js");

    await expect(getSettings()).rejects.toThrow(
      "Settings failed (422): The request payload is invalid. body.prompt_body: [REDACTED:prompt_body]",
    );
  });

  it("redacts raw param issue messages from failed response errors", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(
        errorResponse(422, {
          detail: "The request payload is invalid.",
          errors: [
            {
              param: "prompt_body",
              message: "private setup prompt from the user request",
            },
          ],
        }),
      );
    const { getSettings } = await import("./api.js");

    await expect(getSettings()).rejects.toThrow(
      "Settings failed (422): The request payload is invalid. prompt_body: [REDACTED:prompt_body]",
    );
  });

  it("redacts raw params missing-property issue messages from failed response errors", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(
        errorResponse(422, {
          detail: "The request payload is invalid.",
          errors: [
            {
              params: { missingProperty: "prompt_body" },
              message: "private setup prompt from the user request",
            },
          ],
        }),
      );
    const { getSettings } = await import("./api.js");

    await expect(getSettings()).rejects.toThrow(
      "Settings failed (422): The request payload is invalid. prompt_body: [REDACTED:prompt_body]",
    );
  });

  it("redacts raw params additional-property issue messages from failed response errors", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(
        errorResponse(422, {
          detail: "The request payload is invalid.",
          errors: [
            {
              params: { additionalProperty: "prompt_body" },
              message: "private setup prompt from the user request",
            },
          ],
        }),
      );
    const { getSettings } = await import("./api.js");

    await expect(getSettings()).rejects.toThrow(
      "Settings failed (422): The request payload is invalid. prompt_body: [REDACTED:prompt_body]",
    );
  });

  it("redacts raw local path strings from failed response issue paths", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(
        errorResponse(422, {
          detail: "The request payload is invalid.",
          errors: [
            {
              path: "/Users/jinan/private/looprelay/prompts/raw.md",
              message: "Invalid prompt archive path.",
            },
          ],
        }),
      );
    const { getSettings } = await import("./api.js");

    await expect(getSettings()).rejects.toThrow(
      "Settings failed (422): The request payload is invalid. [REDACTED:path]: Invalid prompt archive path.",
    );
  });

  it("redacts home-relative path strings from failed response issue paths", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(
        errorResponse(422, {
          detail: "The request payload is invalid.",
          errors: [
            {
              path: "~/looprelay/prompts/raw.md",
              message: "Invalid prompt archive path.",
            },
          ],
        }),
      );
    const { getSettings } = await import("./api.js");

    await expect(getSettings()).rejects.toThrow(
      "Settings failed (422): The request payload is invalid. [REDACTED:path]: Invalid prompt archive path.",
    );
  });

  it("redacts Windows path strings from failed response issue paths", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(
        errorResponse(422, {
          detail: "The request payload is invalid.",
          errors: [
            {
              path: "C:\\Users\\jinan\\looprelay\\prompts\\raw.md",
              message: "Invalid prompt archive path.",
            },
          ],
        }),
      );
    const { getSettings } = await import("./api.js");

    await expect(getSettings()).rejects.toThrow(
      "Settings failed (422): The request payload is invalid. [REDACTED:path]: Invalid prompt archive path.",
    );
  });

  it("redacts UNC path strings from failed response issue paths", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(
        errorResponse(422, {
          detail: "The request payload is invalid.",
          errors: [
            {
              path: "\\\\server\\share\\looprelay\\prompts\\raw.md",
              message: "Invalid prompt archive path.",
            },
          ],
        }),
      );
    const { getSettings } = await import("./api.js");

    await expect(getSettings()).rejects.toThrow(
      "Settings failed (422): The request payload is invalid. [REDACTED:path]: Invalid prompt archive path.",
    );
  });

  it("redacts file URL path strings from failed response issue paths", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(
        errorResponse(422, {
          detail: "The request payload is invalid.",
          errors: [
            {
              path: "file:///Users/jinan/looprelay/prompts/raw.md",
              message: "Invalid prompt archive path.",
            },
          ],
        }),
      );
    const { getSettings } = await import("./api.js");

    await expect(getSettings()).rejects.toThrow(
      "Settings failed (422): The request payload is invalid. [REDACTED:path]: Invalid prompt archive path.",
    );
  });

  it("redacts provider credential details from failed response messages", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(
        errorResponse(500, {
          detail:
            "Unexpected setup failure provider_credential: private local provider token. Retry setup.",
        }),
      );
    const { getSettings } = await import("./api.js");

    await expect(getSettings()).rejects.toThrow(
      "Settings failed (500): Unexpected setup failure provider_credential:[REDACTED:provider_credential]. Retry setup.",
    );
  });

  it("redacts camelCase raw-like details from failed response messages", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(
        errorResponse(500, {
          detail:
            "Unexpected setup failure providerCredential: private local provider token. Retry setup.",
        }),
      );
    const { getSettings } = await import("./api.js");

    await expect(getSettings()).rejects.toThrow(
      "Settings failed (500): Unexpected setup failure providerCredential:[REDACTED:providercredential]. Retry setup.",
    );
  });

  it("redacts quoted raw-like keys from failed response messages", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(
        errorResponse(500, {
          detail:
            'Unexpected setup failure "prompt_body": "private setup prompt". Retry setup.',
        }),
      );
    const { getSettings } = await import("./api.js");

    await expect(getSettings()).rejects.toThrow(
      'Settings failed (500): Unexpected setup failure "prompt_body":[REDACTED:prompt_body]. Retry setup.',
    );
  });

  it("redacts quoted equals-delimited raw-like keys from failed response messages", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(
        errorResponse(500, {
          detail:
            'Unexpected setup failure "OPENAI_API_KEY" = private local provider token. Retry setup.',
        }),
      );
    const { getSettings } = await import("./api.js");

    await expect(getSettings()).rejects.toThrow(
      'Settings failed (500): Unexpected setup failure "OPENAI_API_KEY"=[REDACTED:openai_api_key]. Retry setup.',
    );
  });

  it("redacts env-style provider credential details from failed response messages", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(
        errorResponse(500, {
          detail:
            "Unexpected setup failure OPENAI_API_KEY: private local provider token. Retry setup.",
        }),
      );
    const { getSettings } = await import("./api.js");

    await expect(getSettings()).rejects.toThrow(
      "Settings failed (500): Unexpected setup failure OPENAI_API_KEY:[REDACTED:openai_api_key]. Retry setup.",
    );
  });

  it("redacts equals-delimited provider credential phrases from failed response messages", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(
        errorResponse(500, {
          detail:
            "Unexpected setup failure OPENAI_API_KEY = private local provider token. Retry setup.",
        }),
      );
    const { getSettings } = await import("./api.js");

    await expect(getSettings()).rejects.toThrow(
      "Settings failed (500): Unexpected setup failure OPENAI_API_KEY=[REDACTED:openai_api_key]. Retry setup.",
    );
  });

  it("reports malformed settings responses without returning incomplete setup data", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(jsonResponse({ data: {} }));
    const { getSettings } = await import("./api.js");

    await expect(getSettings()).rejects.toThrow(
      "Settings failed: Invalid response.",
    );
  });

  it("rejects settings responses that include raw-like fields", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(
        jsonResponse({
          data: {
            data_dir: "/Users/example/.looprelay",
            excluded_project_roots: [],
            redaction_mode: "mask",
            server: {
              host: "127.0.0.1",
              port: 4317,
            },
            prompt_body: "secret setup prompt",
          },
        }),
      );
    const { getSettings } = await import("./api.js");

    await expect(getSettings()).rejects.toThrow(
      "Settings failed: Invalid response.",
    );
  });

  it("preserves health check recovery detail on failed responses", async () => {
    fetchMock.mockResolvedValueOnce(
      errorResponse(503, {
        detail:
          "LoopRelay local server is starting. Retry `/api/v1/health` after startup completes.",
      }),
    );
    const { getHealth } = await import("./api.js");

    await expect(getHealth()).rejects.toThrow(
      "Health check failed (503): LoopRelay local server is starting. Retry `/api/v1/health` after startup completes.",
    );
  });

  it("returns the safe boot instance from a valid health response", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        ok: true,
        version: "1.0.0",
        instance_id: "019c6602-87f7-4e75-b535-2162f80d1250",
      }),
    );
    const { getHealth } = await import("./api.js");

    await expect(getHealth()).resolves.toEqual({
      ok: true,
      version: "1.0.0",
      instance_id: "019c6602-87f7-4e75-b535-2162f80d1250",
    });
  });

  it("rejects a non-UUID health instance without returning raw-like content", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        ok: true,
        version: "1.0.0",
        instance_id: "/Users/private/.looprelay",
      }),
    );
    const { getHealth } = await import("./api.js");

    await expect(getHealth()).rejects.toThrow(
      "Health check failed: Invalid response.",
    );
  });

  it("reports malformed health responses without returning incomplete server status", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({}));
    const { getHealth } = await import("./api.js");

    await expect(getHealth()).rejects.toThrow(
      "Health check failed: Invalid response.",
    );
  });

  it("rejects health responses that include raw-like fields", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        ok: true,
        version: "0.0.0-test",
        prompt_body: "secret setup prompt",
      }),
    );
    const { getHealth } = await import("./api.js");

    await expect(getHealth()).rejects.toThrow(
      "Health check failed: Invalid response.",
    );
  });

  it("preserves loop list recovery detail on failed responses", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(
        errorResponse(401, {
          detail:
            "Missing or invalid app session. Open a new local LoopRelay web session, then retry the loop list request.",
        }),
      );
    const { listLoops } = await import("./api.js");

    await expect(listLoops()).rejects.toThrow(
      "Loop list failed (401): Missing or invalid app session. Open a new local LoopRelay web session, then retry the loop list request.",
    );
  });

  it("reports malformed loop list responses without returning undefined", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(jsonResponse({ data: {} }));
    const { listLoops } = await import("./api.js");

    await expect(listLoops()).rejects.toThrow(
      "Loop list failed: Invalid response.",
    );
  });

  it("reports malformed loop list items without returning incomplete loop summaries", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(
        jsonResponse({
          data: {
            status: {
              status: "empty",
              snapshot_count: 0,
              activity: {
                active_worktrees: 0,
                active_sessions: 0,
                needs_review: false,
                next_action: "continue current worktree loop",
                worktrees: [],
              },
              project_memory: { approved_count: 0, included_in_brief: false },
              next_action: "looprelay loop collect",
              next_actions: [],
              privacy: {
                local_only: true,
                external_calls: false,
                returns_prompt_bodies: false,
                returns_raw_paths: false,
                returns_compact_content: false,
              },
            },
            items: [{}],
          },
        }),
      );
    const { listLoops } = await import("./api.js");

    await expect(listLoops()).rejects.toThrow(
      "Loop list failed: Invalid response.",
    );
  });

  it("reports malformed loop status latest snapshots without returning incomplete loop status", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(
        jsonResponse({
          data: {
            status: {
              status: "ready",
              snapshot_count: 1,
              activity: {
                active_worktrees: 1,
                active_sessions: 1,
                needs_review: false,
                next_action: "continue current worktree loop",
                worktrees: [],
              },
              project_memory: { approved_count: 0, included_in_brief: false },
              latest_snapshot: {},
              next_action: "looprelay loop collect",
              next_actions: [],
              privacy: {
                local_only: true,
                external_calls: false,
                returns_prompt_bodies: false,
                returns_raw_paths: false,
                returns_compact_content: false,
              },
            },
            items: [],
          },
        }),
      );
    const { listLoops } = await import("./api.js");

    await expect(listLoops()).rejects.toThrow(
      "Loop list failed: Invalid response.",
    );
  });

  it("reports malformed loop status compact boundaries without returning incomplete loop status", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(
        jsonResponse({
          data: {
            status: {
              status: "ready",
              snapshot_count: 1,
              activity: {
                active_worktrees: 1,
                active_sessions: 1,
                needs_review: false,
                next_action: "continue current worktree loop",
                worktrees: [],
              },
              project_memory: { approved_count: 0, included_in_brief: false },
              latest_compact_boundary: {},
              next_action: "looprelay loop collect",
              next_actions: [],
              privacy: {
                local_only: true,
                external_calls: false,
                returns_prompt_bodies: false,
                returns_raw_paths: false,
                returns_compact_content: false,
              },
            },
            items: [],
          },
        }),
      );
    const { listLoops } = await import("./api.js");

    await expect(listLoops()).rejects.toThrow(
      "Loop list failed: Invalid response.",
    );
  });

  it("reports unsafe loop status privacy flags without returning raw-path status data", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(
        jsonResponse({
          data: {
            status: {
              status: "ready",
              snapshot_count: 1,
              activity: {
                active_worktrees: 1,
                active_sessions: 1,
                needs_review: false,
                next_action: "continue current worktree loop",
                worktrees: [],
              },
              project_memory: { approved_count: 0, included_in_brief: false },
              next_action: "looprelay loop collect",
              next_actions: [],
              privacy: {
                local_only: true,
                external_calls: false,
                returns_prompt_bodies: false,
                returns_raw_paths: true,
                returns_compact_content: false,
              },
            },
            items: [],
          },
        }),
      );
    const { listLoops } = await import("./api.js");

    await expect(listLoops()).rejects.toThrow(
      "Loop list failed: Invalid response.",
    );
  });

  it("reports unsafe loop list privacy flags without returning prompt-body list data", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(
        jsonResponse({
          data: {
            status: {
              status: "ready",
              snapshot_count: 1,
              activity: {
                active_worktrees: 1,
                active_sessions: 1,
                needs_review: false,
                next_action: "continue current worktree loop",
                worktrees: [],
              },
              project_memory: { approved_count: 0, included_in_brief: false },
              next_action: "looprelay loop collect",
              next_actions: [],
              privacy: {
                local_only: true,
                external_calls: false,
                returns_prompt_bodies: false,
                returns_raw_paths: false,
                returns_compact_content: false,
              },
            },
            items: [],
            privacy: {
              local_only: true,
              returns_prompt_bodies: true,
              returns_raw_paths: false,
              returns_compact_content: false,
            },
          },
        }),
      );
    const { listLoops } = await import("./api.js");

    await expect(listLoops()).rejects.toThrow(
      "Loop list failed: Invalid response.",
    );
  });

  it("reports malformed loop status activity without returning incomplete loop counters", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(
        jsonResponse({
          data: {
            status: {
              status: "ready",
              snapshot_count: 1,
              activity: {
                active_worktrees: "1",
                active_sessions: 1,
                needs_review: false,
                next_action: "continue current worktree loop",
                worktrees: [],
              },
              project_memory: { approved_count: 0, included_in_brief: false },
              next_action: "looprelay loop collect",
              next_actions: [],
              privacy: {
                local_only: true,
                external_calls: false,
                returns_prompt_bodies: false,
                returns_raw_paths: false,
                returns_compact_content: false,
              },
            },
            items: [],
            privacy: {
              local_only: true,
              returns_prompt_bodies: false,
              returns_raw_paths: false,
              returns_compact_content: false,
            },
          },
        }),
      );
    const { listLoops } = await import("./api.js");

    await expect(listLoops()).rejects.toThrow(
      "Loop list failed: Invalid response.",
    );
  });

  it("reports malformed loop activity worktrees without returning incomplete worktree counters", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(
        jsonResponse({
          data: {
            status: {
              status: "ready",
              snapshot_count: 1,
              activity: {
                active_worktrees: 1,
                active_sessions: 1,
                needs_review: false,
                next_action: "continue current worktree loop",
                worktrees: [
                  {
                    worktree: "feature-loop",
                    sessions: "1",
                    snapshots: 2,
                    latest_snapshot_id: "loop_abcdef123456",
                    latest_created_at: "2026-07-08T01:00:00.000Z",
                    latest_outcome_status: "passed",
                    evidence_count: 1,
                  },
                ],
              },
              project_memory: { approved_count: 0, included_in_brief: false },
              next_action: "looprelay loop collect",
              next_actions: [],
              privacy: {
                local_only: true,
                external_calls: false,
                returns_prompt_bodies: false,
                returns_raw_paths: false,
                returns_compact_content: false,
              },
            },
            items: [],
            privacy: {
              local_only: true,
              returns_prompt_bodies: false,
              returns_raw_paths: false,
              returns_compact_content: false,
            },
          },
        }),
      );
    const { listLoops } = await import("./api.js");

    await expect(listLoops()).rejects.toThrow(
      "Loop list failed: Invalid response.",
    );
  });

  it("reports malformed loop project memory without returning incomplete memory state", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(
        jsonResponse({
          data: {
            status: {
              status: "ready",
              snapshot_count: 1,
              activity: {
                active_worktrees: 1,
                active_sessions: 1,
                needs_review: false,
                next_action: "continue current worktree loop",
                worktrees: [],
              },
              project_memory: {
                approved_count: "0",
                included_in_brief: false,
              },
              next_action: "looprelay loop collect",
              next_actions: [],
              privacy: {
                local_only: true,
                external_calls: false,
                returns_prompt_bodies: false,
                returns_raw_paths: false,
                returns_compact_content: false,
              },
            },
            items: [],
            privacy: {
              local_only: true,
              returns_prompt_bodies: false,
              returns_raw_paths: false,
              returns_compact_content: false,
            },
          },
        }),
      );
    const { listLoops } = await import("./api.js");

    await expect(listLoops()).rejects.toThrow(
      "Loop list failed: Invalid response.",
    );
  });

  it("reports malformed loop memory candidates without returning incomplete approval state", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(
        jsonResponse({
          data: {
            status: {
              status: "ready",
              snapshot_count: 1,
              activity: {
                active_worktrees: 1,
                active_sessions: 1,
                needs_review: false,
                next_action: "continue current worktree loop",
                worktrees: [],
              },
              project_memory: { approved_count: 0, included_in_brief: false },
              memory_candidate: {
                eligible: "yes",
                reason: "passed_with_evidence",
                next_action: "looprelay loop memory-approve",
              },
              next_action: "looprelay loop collect",
              next_actions: [],
              privacy: {
                local_only: true,
                external_calls: false,
                returns_prompt_bodies: false,
                returns_raw_paths: false,
                returns_compact_content: false,
              },
            },
            items: [],
            privacy: {
              local_only: true,
              returns_prompt_bodies: false,
              returns_raw_paths: false,
              returns_compact_content: false,
            },
          },
        }),
      );
    const { listLoops } = await import("./api.js");

    await expect(listLoops()).rejects.toThrow(
      "Loop list failed: Invalid response.",
    );
  });

  it("reports malformed loop core status without returning incomplete status state", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(
        jsonResponse({
          data: {
            status: {
              status: "ready",
              snapshot_count: "1",
              activity: {
                active_worktrees: 1,
                active_sessions: 1,
                needs_review: false,
                next_action: "continue current worktree loop",
                worktrees: [],
              },
              project_memory: { approved_count: 0, included_in_brief: false },
              next_action: "looprelay loop collect",
              next_actions: ["Run looprelay loop collect again"],
              privacy: {
                local_only: true,
                external_calls: false,
                returns_prompt_bodies: false,
                returns_raw_paths: false,
                returns_compact_content: false,
              },
            },
            items: [],
            privacy: {
              local_only: true,
              returns_prompt_bodies: false,
              returns_raw_paths: false,
              returns_compact_content: false,
            },
          },
        }),
      );
    const { listLoops } = await import("./api.js");

    await expect(listLoops()).rejects.toThrow(
      "Loop list failed: Invalid response.",
    );
  });

  it("reports malformed loop command-center review packet without returning unsafe merge status", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(
        jsonResponse({
          data: {
            status: {
              status: "ready",
              snapshot_count: 1,
              activity: {
                active_worktrees: 1,
                active_sessions: 1,
                needs_review: true,
                next_action:
                  "compare loop snapshots by worktree before merging agent output",
                command_center: {
                  title: "Multi-worktree review",
                  primary_action: "review non-passing worktrees before merge",
                  review_packet: {
                    title: "Review-before-merge packet",
                    status: "auto_merge_ready",
                    summary: "0 ready, 1 needs review, 0 missing evidence",
                    next_action: "review non-passing worktrees before merge",
                    ready_count: 0,
                    needs_review_count: 1,
                    missing_evidence_count: 0,
                    actions: ["review outcome before merge"],
                    checklist: [
                      {
                        label: "Review non-passing worktrees before merge",
                        status: "required",
                        action: "review outcome before merge",
                      },
                    ],
                  },
                  review_items: [],
                },
                worktrees: [],
              },
              project_memory: { approved_count: 0, included_in_brief: false },
              next_action: "looprelay loop collect",
              next_actions: [],
              privacy: {
                local_only: true,
                external_calls: false,
                returns_prompt_bodies: false,
                returns_raw_paths: false,
                returns_compact_content: false,
              },
            },
            items: [],
            privacy: {
              local_only: true,
              returns_prompt_bodies: false,
              returns_raw_paths: false,
              returns_compact_content: false,
            },
          },
        }),
      );
    const { listLoops } = await import("./api.js");

    await expect(listLoops()).rejects.toThrow(
      "Loop list failed: Invalid response.",
    );
  });

  it("reports malformed loop activity recent decisions without returning unsafe merge decisions", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(
        jsonResponse({
          data: {
            status: {
              status: "ready",
              snapshot_count: 1,
              activity: {
                active_worktrees: 1,
                active_sessions: 1,
                needs_review: true,
                next_action:
                  "compare loop snapshots by worktree before merging agent output",
                recent_decisions: [
                  {
                    snapshot_id: "loop_web",
                    worktree: "agent-loop-worktree",
                    decision: "auto_merge",
                    reason: "Unsafe automatic merge decision.",
                    decided_by: "web",
                    created_at: "2026-07-04T01:30:00.000Z",
                  },
                ],
                worktrees: [],
              },
              project_memory: { approved_count: 0, included_in_brief: false },
              next_action: "looprelay loop collect",
              next_actions: [],
              privacy: {
                local_only: true,
                external_calls: false,
                returns_prompt_bodies: false,
                returns_raw_paths: false,
                returns_compact_content: false,
              },
            },
            items: [],
            privacy: {
              local_only: true,
              returns_prompt_bodies: false,
              returns_raw_paths: false,
              returns_compact_content: false,
            },
          },
        }),
      );
    const { listLoops } = await import("./api.js");

    await expect(listLoops()).rejects.toThrow(
      "Loop list failed: Invalid response.",
    );
  });

  it("preserves loop brief recovery detail on failed responses", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(
        errorResponse(404, {
          detail:
            "Loop snapshot not found. Run `looprelay loop collect`, then reopen the continuation brief.",
        }),
      );
    const { getLoopBrief } = await import("./api.js");

    await expect(getLoopBrief("loop_missing")).rejects.toThrow(
      "Loop brief failed (404): Loop snapshot not found. Run `looprelay loop collect`, then reopen the continuation brief.",
    );
  });

  it("creates anonymized export previews with csrf and returns raw-free job data", async () => {
    const job: ExportJob = {
      id: "exp_abcdef123456",
      preset: "anonymized_review",
      status: "previewed",
      prompt_id_hashes: ["ph_abcdef123456"],
      project_policy_versions: { proj_abcdef123456: 1 },
      redaction_version: "mask-v1",
      counts: {
        prompt_count: 1,
        sensitive_count: 1,
        included_fields: ["masked_prompt", "tags"],
        excluded_fields: ["cwd", "stable_prompt_id"],
        residual_identifier_counts: { path: 1 },
        small_set_warning: true,
      },
      expires_at: "2026-05-03T12:00:00.000Z",
      created_at: "2026-05-02T12:00:00.000Z",
    };
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(jsonResponse({ data: job }));
    const { createExportPreview } = await import("./api.js");

    const preview = await createExportPreview("anonymized_review");

    expect(preview).toEqual(job);
    expect(fetchMock).toHaveBeenLastCalledWith("/api/v1/exports/preview", {
      method: "POST",
      credentials: "same-origin",
      headers: {
        "content-type": "application/json",
        "x-csrf-token": "csrf-1",
      },
      body: JSON.stringify({ preset: "anonymized_review" }),
    });
    expect(JSON.stringify(preview)).not.toContain("prmt_");
    expect(JSON.stringify(preview)).not.toContain("/Users/example");
    expect(JSON.stringify(preview)).not.toContain("sk-proj");
  });

  it("reports malformed export preview responses without returning incomplete job data", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(jsonResponse({ data: {} }));
    const { createExportPreview } = await import("./api.js");

    await expect(createExportPreview("anonymized_review")).rejects.toThrow(
      "Export preview failed: Invalid response.",
    );
  });

  it("rejects export preview responses that include raw-like job fields", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(
        jsonResponse({
          data: {
            id: "exp_abcdef123456",
            preset: "anonymized_review",
            status: "previewed",
            prompt_id_hashes: ["ph_abcdef123456"],
            project_policy_versions: { proj_abcdef123456: 1 },
            redaction_version: "mask-v1",
            counts: {
              prompt_count: 1,
              sensitive_count: 1,
              included_fields: ["masked_prompt", "tags"],
              excluded_fields: ["cwd", "stable_prompt_id"],
              residual_identifier_counts: { path: 1 },
              small_set_warning: true,
            },
            expires_at: "2026-05-03T12:00:00.000Z",
            created_at: "2026-05-02T12:00:00.000Z",
            raw_path: "/Users/example/private/project",
          },
        }),
      );
    const { createExportPreview } = await import("./api.js");

    await expect(createExportPreview("anonymized_review")).rejects.toThrow(
      "Export preview failed: Invalid response.",
    );
  });

  it("executes anonymized export jobs by job id", async () => {
    const payload: AnonymizedExportPayload = {
      job_id: "exp_abcdef123456",
      preset: "anonymized_review",
      redaction_version: "mask-v1",
      generated_at: "2026-05-02T12:01:00.000Z",
      count: 1,
      items: [
        {
          anonymous_id: "anon_abcdef123456",
          tool: "claude-code",
          coarse_date: "2026-05-02",
          project_alias: "looprelay",
          prompt: "Fix [REDACTED:path] with [REDACTED:api_key]",
          tags: ["backend"],
          quality_gaps: ["Verification criteria"],
        },
      ],
    };
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(jsonResponse({ data: payload }));
    const { executeExportJob } = await import("./api.js");

    const exported = await executeExportJob("exp_abcdef123456");

    expect(exported).toEqual(payload);
    expect(fetchMock).toHaveBeenLastCalledWith("/api/v1/exports", {
      method: "POST",
      credentials: "same-origin",
      headers: {
        "content-type": "application/json",
        "x-csrf-token": "csrf-1",
      },
      body: JSON.stringify({ job_id: "exp_abcdef123456" }),
    });
  });

  it("reports malformed export execution responses without returning incomplete payload data", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(jsonResponse({ data: {} }));
    const { executeExportJob } = await import("./api.js");

    await expect(executeExportJob("exp_abcdef123456")).rejects.toThrow(
      "Export job execution failed: Invalid response.",
    );
  });

  it("rejects anonymized export payload items that include raw-like fields", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(
        jsonResponse({
          data: {
            job_id: "exp_abcdef123456",
            preset: "anonymized_review",
            redaction_version: "mask-v1",
            generated_at: "2026-05-02T12:01:00.000Z",
            count: 1,
            items: [
              {
                anonymous_id: "anon_abcdef123456",
                tool: "claude-code",
                coarse_date: "2026-05-02",
                project_alias: "looprelay",
                prompt: "Fix [REDACTED:path] with [REDACTED:api_key]",
                tags: ["backend"],
                quality_gaps: ["Verification criteria"],
                raw_path: "/Users/example/private/project",
              },
            ],
          },
        }),
      );
    const { executeExportJob } = await import("./api.js");

    await expect(executeExportJob("exp_abcdef123456")).rejects.toThrow(
      "Export job execution failed: Invalid response.",
    );
  });

  it("fetches the coach feedback summary without CSRF and parses ratios", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(
        jsonResponse({
          data: {
            total: 4,
            helpful: 3,
            not_helpful: 1,
            wrong: 0,
            helpful_ratio: 0.75,
          },
        }),
      );
    const { getCoachFeedbackSummary } = await import("./api.js");

    const summary = await getCoachFeedbackSummary();

    expect(summary).toEqual({
      total: 4,
      helpful: 3,
      not_helpful: 1,
      wrong: 0,
      helpful_ratio: 0.75,
    });
    expect(fetchMock).toHaveBeenLastCalledWith(
      "/api/v1/coach-feedback/summary",
      { credentials: "same-origin" },
    );
  });

  it("reports malformed coach feedback summary responses without returning incomplete ratios", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(jsonResponse({ data: {} }));
    const { getCoachFeedbackSummary } = await import("./api.js");

    await expect(getCoachFeedbackSummary()).rejects.toThrow(
      "Coach feedback summary failed: Invalid response.",
    );
  });

  it("reports unsafe coach feedback summary responses without returning raw path fields", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(
        jsonResponse({
          data: {
            total: 4,
            helpful: 3,
            not_helpful: 1,
            wrong: 0,
            helpful_ratio: 0.75,
            raw_path: "/Users/jinan/private-project",
          },
        }),
      );
    const { getCoachFeedbackSummary } = await import("./api.js");

    await expect(getCoachFeedbackSummary()).rejects.toThrow(
      "Coach feedback summary failed: Invalid response.",
    );
  });

  it("posts coach feedback with CSRF for a specific prompt id", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(
        jsonResponse({
          data: {
            id: "cfb_abcdef",
            prompt_id: "prmt_xyz",
            rating: "helpful",
            created_at: "2026-05-04T00:00:00.000Z",
          },
        }),
      );
    const { sendCoachFeedback } = await import("./api.js");

    const result = await sendCoachFeedback({
      promptId: "prmt_xyz",
      rating: "helpful",
    });

    expect(result.rating).toBe("helpful");
    expect(fetchMock).toHaveBeenLastCalledWith(
      "/api/v1/prompts/prmt_xyz/coach-feedback",
      {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "content-type": "application/json",
          "x-csrf-token": "csrf-1",
        },
        body: JSON.stringify({ rating: "helpful" }),
      },
    );
  });

  it("reports malformed coach feedback responses without returning incomplete feedback state", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(jsonResponse({ data: {} }));
    const { sendCoachFeedback } = await import("./api.js");

    await expect(
      sendCoachFeedback({ promptId: "prmt_xyz", rating: "helpful" }),
    ).rejects.toThrow("Coach feedback failed: Invalid response.");
  });

  it("reports unsafe coach feedback responses without returning raw prompt fields", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(
        jsonResponse({
          data: {
            id: "cfb_abcdef",
            prompt_id: "prmt_xyz",
            rating: "helpful",
            created_at: "2026-05-04T00:00:00.000Z",
            prompt_body: "secret prompt body",
          },
        }),
      );
    const { sendCoachFeedback } = await import("./api.js");

    await expect(
      sendCoachFeedback({ promptId: "prmt_xyz", rating: "helpful" }),
    ).rejects.toThrow("Coach feedback failed: Invalid response.");
  });

  it("posts the import dry-run upload with CSRF and returns the raw-free summary", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(
        jsonResponse({
          data: {
            dry_run: true,
            source_type: "manual-jsonl",
            source_path_hash: "path_aabbccdd",
            records_read: 1,
            prompt_candidates: 1,
            sensitive_prompt_count: 1,
            parse_errors: 0,
            skipped_records: {
              assistant_or_tool: 0,
              empty_prompt: 0,
              unsupported_record: 0,
              too_large: 0,
            },
            samples: [],
          },
        }),
      );
    const { previewImportDryRun } = await import("./api.js");

    const result = await previewImportDryRun({
      sourceType: "manual-jsonl",
      content: "line1\n",
    });

    expect(result).toMatchObject({
      dry_run: true,
      source_type: "manual-jsonl",
      prompt_candidates: 1,
      sensitive_prompt_count: 1,
    });
    expect(fetchMock).toHaveBeenLastCalledWith("/api/v1/import/dry-run", {
      method: "POST",
      credentials: "same-origin",
      headers: {
        "content-type": "application/json",
        "x-csrf-token": "csrf-1",
      },
      body: JSON.stringify({
        source_type: "manual-jsonl",
        content: "line1\n",
      }),
    });
  });

  it("reports malformed import dry-run responses without returning incomplete import summary data", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(jsonResponse({ data: {} }));
    const { previewImportDryRun } = await import("./api.js");

    await expect(
      previewImportDryRun({ sourceType: "manual-jsonl", content: "line1\n" }),
    ).rejects.toThrow("Import dry-run failed: Invalid response.");
  });

  it("rejects import dry-run root responses that include raw-like fields", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(
        jsonResponse({
          data: {
            dry_run: true,
            source_type: "manual-jsonl",
            source_path_hash: "path_aabbccdd",
            records_read: 1,
            prompt_candidates: 1,
            sensitive_prompt_count: 1,
            parse_errors: 0,
            skipped_records: {
              assistant_or_tool: 0,
              empty_prompt: 0,
              unsupported_record: 0,
              too_large: 0,
            },
            samples: [],
            prompt_body: "secret prompt body",
          },
        }),
      );
    const { previewImportDryRun } = await import("./api.js");

    await expect(
      previewImportDryRun({ sourceType: "manual-jsonl", content: "line1\n" }),
    ).rejects.toThrow("Import dry-run failed: Invalid response.");
  });

  it("rejects import dry-run samples that include raw-like fields", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(
        jsonResponse({
          data: {
            dry_run: true,
            source_type: "manual-jsonl",
            source_path_hash: "path_aabbccdd",
            records_read: 1,
            prompt_candidates: 1,
            sensitive_prompt_count: 1,
            parse_errors: 0,
            skipped_records: {
              assistant_or_tool: 0,
              empty_prompt: 0,
              unsupported_record: 0,
              too_large: 0,
            },
            samples: [
              {
                record_offset: 0,
                session_id: "sess_safe",
                turn_id: "turn_safe",
                cwd_label: "looprelay",
                prompt_preview: "Fix [REDACTED:path]",
                is_sensitive: true,
                raw_path: "/Users/example/private/project",
              },
            ],
          },
        }),
      );
    const { previewImportDryRun } = await import("./api.js");

    await expect(
      previewImportDryRun({ sourceType: "manual-jsonl", content: "line1\n" }),
    ).rejects.toThrow("Import dry-run failed: Invalid response.");
  });

  it("includes the HTTP status and detail in error messages", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(
        errorResponse(403, { detail: "Forbidden by policy" }),
      );
    const { deletePrompt } = await import("./api.js");

    await expect(deletePrompt("prmt_x")).rejects.toThrow(
      /Delete failed \(403\): Forbidden by policy/,
    );
  });

  it("reports malformed prompt detail responses without returning incomplete archive data", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(jsonResponse({ data: {} }));
    const { getPrompt } = await import("./api.js");

    await expect(getPrompt("prmt_x")).rejects.toThrow(
      "Prompt not found: Invalid response.",
    );
  });

  it("parses prompt detail responses with markdown without treating them as unsafe list summaries", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(
        jsonResponse({
          data: {
            id: "prmt_detail",
            tool: "codex",
            source_event: "UserPromptSubmit",
            session_id: "session-1",
            cwd: "private-project",
            created_at: "2026-07-04T01:00:00.000Z",
            received_at: "2026-07-04T01:00:00.000Z",
            snippet: "redacted prompt summary",
            prompt_length: 20,
            is_sensitive: false,
            excluded_from_analysis: false,
            redaction_policy: "mask",
            adapter_version: "test",
            index_status: "indexed",
            tags: ["review"],
            quality_gaps: [],
            quality_score: 42,
            quality_score_band: "needs_work",
            usefulness: {
              copied_count: 0,
              bookmarked: false,
            },
            duplicate_count: 0,
            markdown: "# Prompt\n\nRedacted prompt archive.",
            improvement_drafts: [],
          },
        }),
      );
    const { getPrompt } = await import("./api.js");

    await expect(getPrompt("prmt_detail")).resolves.toMatchObject({
      id: "prmt_detail",
      markdown: "# Prompt\n\nRedacted prompt archive.",
      improvement_drafts: [],
    });
  });

  it("reports malformed prompt detail improvement drafts without returning raw draft fields", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(
        jsonResponse({
          data: {
            id: "prmt_detail",
            tool: "codex",
            source_event: "UserPromptSubmit",
            session_id: "session-1",
            cwd: "private-project",
            created_at: "2026-07-04T01:00:00.000Z",
            received_at: "2026-07-04T01:00:00.000Z",
            snippet: "redacted prompt summary",
            prompt_length: 20,
            is_sensitive: false,
            excluded_from_analysis: false,
            redaction_policy: "mask",
            adapter_version: "test",
            index_status: "indexed",
            tags: ["review"],
            quality_gaps: [],
            quality_score: 42,
            quality_score_band: "needs_work",
            usefulness: {
              copied_count: 0,
              bookmarked: false,
            },
            duplicate_count: 0,
            markdown: "# Prompt\n\nRedacted prompt archive.",
            improvement_drafts: [
              {
                id: "draft_1",
                prompt_id: "prmt_detail",
                draft_text: "Use a more specific goal.",
                analyzer: "looprelay",
                changed_sections: ["goal_clarity"],
                safety_notes: [],
                is_sensitive: false,
                redaction_policy: "mask",
                created_at: "2026-07-04T01:00:00.000Z",
                prompt_body: "secret prompt body",
              },
            ],
          },
        }),
      );
    const { getPrompt } = await import("./api.js");

    await expect(getPrompt("prmt_detail")).rejects.toThrow(
      "Prompt not found: Invalid response.",
    );
  });

  it("reports malformed prompt detail analysis without returning raw checklist fields", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(
        jsonResponse({
          data: {
            id: "prmt_detail",
            tool: "codex",
            source_event: "UserPromptSubmit",
            session_id: "session-1",
            cwd: "private-project",
            created_at: "2026-07-04T01:00:00.000Z",
            received_at: "2026-07-04T01:00:00.000Z",
            snippet: "redacted prompt summary",
            prompt_length: 20,
            is_sensitive: false,
            excluded_from_analysis: false,
            redaction_policy: "mask",
            adapter_version: "test",
            index_status: "indexed",
            tags: ["review"],
            quality_gaps: [],
            quality_score: 42,
            quality_score_band: "needs_work",
            usefulness: {
              copied_count: 0,
              bookmarked: false,
            },
            duplicate_count: 0,
            markdown: "# Prompt\n\nRedacted prompt archive.",
            improvement_drafts: [],
            analysis: {
              checklist: [
                {
                  key: "goal_clarity",
                  label: "Goal clarity",
                  status: "weak",
                  reason: "Needs a sharper goal.",
                  prompt_body: "secret prompt body",
                },
              ],
              tags: ["review"],
              quality_score: {
                value: 42,
                max: 100,
                band: "needs_work",
                breakdown: [
                  {
                    key: "goal_clarity",
                    weight: 25,
                    earned: 10,
                  },
                ],
              },
              analyzer: "looprelay",
              created_at: "2026-07-04T01:00:00.000Z",
            },
          },
        }),
      );
    const { getPrompt } = await import("./api.js");

    await expect(getPrompt("prmt_detail")).rejects.toThrow(
      "Prompt not found: Invalid response.",
    );
  });

  it("reports malformed prompt detail judge scores without returning raw judge fields", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(
        jsonResponse({
          data: {
            id: "prmt_detail",
            tool: "codex",
            source_event: "UserPromptSubmit",
            session_id: "session-1",
            cwd: "private-project",
            created_at: "2026-07-04T01:00:00.000Z",
            received_at: "2026-07-04T01:00:00.000Z",
            snippet: "redacted prompt summary",
            prompt_length: 20,
            is_sensitive: false,
            excluded_from_analysis: false,
            redaction_policy: "mask",
            adapter_version: "test",
            index_status: "indexed",
            tags: ["review"],
            quality_gaps: [],
            quality_score: 42,
            quality_score_band: "needs_work",
            usefulness: {
              copied_count: 0,
              bookmarked: false,
            },
            duplicate_count: 0,
            markdown: "# Prompt\n\nRedacted prompt archive.",
            improvement_drafts: [],
            judge_score: {
              id: "judge_1",
              prompt_id: "prmt_detail",
              judge_tool: "codex",
              score: 72,
              reason: "The prompt has a clear goal.",
              created_at: "2026-07-04T01:00:00.000Z",
              prompt_body: "secret prompt body",
            },
          },
        }),
      );
    const { getPrompt } = await import("./api.js");

    await expect(getPrompt("prmt_detail")).rejects.toThrow(
      "Prompt not found: Invalid response.",
    );
  });

  it("reports malformed prompt detail loop outcomes without returning raw evidence fields", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(
        jsonResponse({
          data: {
            id: "prmt_detail",
            tool: "codex",
            source_event: "UserPromptSubmit",
            session_id: "session-1",
            cwd: "private-project",
            created_at: "2026-07-04T01:00:00.000Z",
            received_at: "2026-07-04T01:00:00.000Z",
            snippet: "redacted prompt summary",
            prompt_length: 20,
            is_sensitive: false,
            excluded_from_analysis: false,
            redaction_policy: "mask",
            adapter_version: "test",
            index_status: "indexed",
            tags: ["review"],
            quality_gaps: [],
            quality_score: 42,
            quality_score_band: "needs_work",
            usefulness: {
              copied_count: 0,
              bookmarked: false,
            },
            duplicate_count: 0,
            markdown: "# Prompt\n\nRedacted prompt archive.",
            improvement_drafts: [],
            loop_outcomes: [
              {
                snapshot_id: "loop_1",
                status: "passed",
                summary: "Focused tests passed.",
                evidence_refs: ["test:web-api"],
                tests_run: 1,
                raw_path: "/Users/jinan/private-project",
              },
            ],
          },
        }),
      );
    const { getPrompt } = await import("./api.js");

    await expect(getPrompt("prmt_detail")).rejects.toThrow(
      "Prompt not found: Invalid response.",
    );
  });

  it("reports malformed prompt detail effectiveness without returning raw evidence refs", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(
        jsonResponse({
          data: {
            id: "prmt_detail",
            tool: "codex",
            source_event: "UserPromptSubmit",
            session_id: "session-1",
            cwd: "private-project",
            created_at: "2026-07-04T01:00:00.000Z",
            received_at: "2026-07-04T01:00:00.000Z",
            snippet: "redacted prompt summary",
            prompt_length: 20,
            is_sensitive: false,
            excluded_from_analysis: false,
            redaction_policy: "mask",
            adapter_version: "test",
            index_status: "indexed",
            tags: ["review"],
            quality_gaps: [],
            quality_score: 42,
            quality_score_band: "needs_work",
            usefulness: {
              copied_count: 0,
              bookmarked: false,
            },
            duplicate_count: 0,
            markdown: "# Prompt\n\nRedacted prompt archive.",
            improvement_drafts: [],
            effectiveness: {
              verdict: "proven",
              summary: "The prompt led to passing focused tests.",
              calibration: {
                linked_outcomes: 1,
                passing_outcomes: 1,
                failing_outcomes: 0,
                total_tests_run: 1,
              },
              evidence_refs: ["/Users/jinan/private-project/test.log"],
            },
          },
        }),
      );
    const { getPrompt } = await import("./api.js");

    await expect(getPrompt("prmt_detail")).rejects.toThrow(
      "Prompt not found: Invalid response.",
    );
  });

  it("reports malformed improvement draft save responses without returning incomplete draft data", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(jsonResponse({ data: {} }));
    const { savePromptImprovementDraft } = await import("./api.js");

    await expect(
      savePromptImprovementDraft("prmt_x", {
        draft_text: "Use a more specific goal.",
        analyzer: "looprelay",
        changed_sections: ["goal_clarity"],
        safety_notes: [],
      }),
    ).rejects.toThrow("Improvement draft save failed: Invalid response.");
  });

  it("reports malformed prompt copy event responses without returning incomplete reuse state", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(jsonResponse({ data: {} }));
    const { recordPromptCopied } = await import("./api.js");

    await expect(recordPromptCopied("prmt_x")).rejects.toThrow(
      "Prompt event failed: Invalid response.",
    );
  });

  it("reports unsafe prompt copy event responses without returning raw usefulness fields", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(
        jsonResponse({
          data: {
            usefulness: {
              copied_count: 1,
              bookmarked: false,
              raw_path: "/Users/jinan/private-project",
            },
          },
        }),
      );
    const { recordPromptCopied } = await import("./api.js");

    await expect(recordPromptCopied("prmt_x")).rejects.toThrow(
      "Prompt event failed: Invalid response.",
    );
  });

  it("reports malformed bookmark responses without returning incomplete reuse state", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(jsonResponse({ data: {} }));
    const { setPromptBookmark } = await import("./api.js");

    await expect(setPromptBookmark("prmt_x", true)).rejects.toThrow(
      "Bookmark failed: Invalid response.",
    );
  });

  it("reports malformed improvement draft copy event responses without returning incomplete copy state", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(jsonResponse({ data: {} }));
    const { markPromptImprovementDraftCopied } = await import("./api.js");

    await expect(
      markPromptImprovementDraftCopied("prmt_x", "draft_x"),
    ).rejects.toThrow("Improvement draft copy event failed: Invalid response.");
  });

  it("reports unsafe improvement draft copy event responses without returning raw copy fields", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(
        jsonResponse({
          data: {
            id: "draft_x",
            prompt_id: "prmt_x",
            copied_at: "2026-05-04T00:00:00.000Z",
            prompt_body: "secret prompt body",
          },
        }),
      );
    const { markPromptImprovementDraftCopied } = await import("./api.js");

    await expect(
      markPromptImprovementDraftCopied("prmt_x", "draft_x"),
    ).rejects.toThrow("Improvement draft copy event failed: Invalid response.");
  });

  it("reports malformed similar prompts responses without returning incomplete reuse candidates", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(jsonResponse({ data: {} }));
    const { getSimilarPrompts } = await import("./api.js");

    await expect(getSimilarPrompts("prmt_x")).rejects.toThrow(
      "Similar prompts unavailable: Invalid response.",
    );
  });

  it("reports malformed ask event summary responses without returning incomplete ask telemetry", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(jsonResponse({ data: {} }));
    const { getAskEventSummary } = await import("./api.js");

    await expect(getAskEventSummary(7)).rejects.toThrow(
      "Ask event summary unavailable: Invalid response.",
    );
  });

  it("reports unsafe ask event summary responses without returning raw prompt fields", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(
        jsonResponse({
          data: {
            total_count: 3,
            recent_count: 2,
            axis_counts: {
              goal_clarity: 2,
            },
            average_score: 52,
            prompt_body: "secret prompt body",
          },
        }),
      );
    const { getAskEventSummary } = await import("./api.js");

    await expect(getAskEventSummary(7)).rejects.toThrow(
      "Ask event summary unavailable: Invalid response.",
    );
  });

  it("uses the response title when detail is blank", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(
        errorResponse(403, {
          detail: "   ",
          title: "Refresh the local LoopRelay web session, then retry.",
        }),
      );
    const { deletePrompt } = await import("./api.js");

    await expect(deletePrompt("prmt_x")).rejects.toThrow(
      "Delete failed (403): Refresh the local LoopRelay web session, then retry.",
    );
  });

  it("uses the response title when detail is not a string", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(
        errorResponse(403, {
          detail: { message: "nested detail should not leak" },
          title: "Open the local archive before deleting again.",
        }),
      );
    const { deletePrompt } = await import("./api.js");

    await expect(deletePrompt("prmt_x")).rejects.toThrow(
      "Delete failed (403): Open the local archive before deleting again.",
    );
  });

  it("uses the response message when detail and title are absent", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(
        errorResponse(429, {
          message: "Too many local web requests. Wait briefly, then retry.",
        }),
      );
    const { deletePrompt } = await import("./api.js");

    await expect(deletePrompt("prmt_x")).rejects.toThrow(
      "Delete failed (429): Too many local web requests. Wait briefly, then retry.",
    );
  });

  it("includes structured problem error details", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(
        errorResponse(422, {
          detail: "The request payload is invalid.",
          errors: [
            {
              field: "prompt",
              message: "Prompt cannot be empty.",
            },
          ],
        }),
      );
    const { deletePrompt } = await import("./api.js");

    await expect(deletePrompt("prmt_x")).rejects.toThrow(
      "Delete failed (422): The request payload is invalid. prompt: Prompt cannot be empty.",
    );
  });

  it("limits structured problem error details", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(
        errorResponse(422, {
          detail: "The request payload is invalid.",
          errors: [
            { field: "prompt", message: "Prompt cannot be empty." },
            { field: "cwd", message: "Path must be absolute." },
            { field: "session_id", message: "Session is required." },
            { field: "model", message: "Model name is invalid." },
            { field: "turn_id", message: "Turn id is invalid." },
          ],
        }),
      );
    const { deletePrompt } = await import("./api.js");

    await expect(deletePrompt("prmt_x")).rejects.toThrow(
      "Delete failed (422): The request payload is invalid. prompt: Prompt cannot be empty. cwd: Path must be absolute. session_id: Session is required. 2 more error(s).",
    );
  });

  it("redacts structured problem error details", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(
        errorResponse(422, {
          detail: "The request payload is invalid.",
          errors: [
            {
              field: "cwd",
              message:
                "Path /Users/example/private-project contains sk-proj-1234567890abcdef.",
            },
          ],
        }),
      );
    const { deletePrompt } = await import("./api.js");

    await expect(deletePrompt("prmt_x")).rejects.toThrow(
      "Delete failed (422): The request payload is invalid. cwd: Path [REDACTED:path] contains [REDACTED:secret].",
    );
  });

  it("does not redact ordinary sk-prefixed words in problem details", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(
        errorResponse(422, {
          detail: "The request payload is invalid.",
          errors: [
            {
              field: "command",
              message: "The --skip-readme option is not available.",
            },
          ],
        }),
      );
    const { deletePrompt } = await import("./api.js");

    await expect(deletePrompt("prmt_x")).rejects.toThrow(
      "Delete failed (422): The request payload is invalid. command: The --skip-readme option is not available.",
    );
  });

  it("still surfaces the status when the error body is not JSON", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(errorResponse(500, undefined));
    const { deletePrompt } = await import("./api.js");

    await expect(deletePrompt("prmt_y")).rejects.toThrow(
      /Delete failed \(500\)/,
    );
  });

  it("analyzes project instruction files with csrf", async () => {
    const review = {
      generated_at: "2026-05-03T00:00:00.000Z",
      analyzer: "local-project-instructions-v1",
      score: { value: 80, max: 100, band: "good" },
      files_found: 1,
      files: [],
      checklist: [],
      suggestions: [],
      privacy: {
        local_only: true,
        external_calls: false,
        stores_file_bodies: false,
        returns_file_bodies: false,
        returns_raw_paths: false,
      },
    };
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(jsonResponse({ data: review }));
    const { analyzeProjectInstructions } = await import("./api.js");

    const result = await analyzeProjectInstructions("proj_abcdef123456");

    expect(result).toEqual(review);
    expect(fetchMock).toHaveBeenLastCalledWith(
      "/api/v1/projects/proj_abcdef123456/instructions/analyze",
      {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "x-csrf-token": "csrf-1",
        },
      },
    );
  });

  it("reports malformed project instruction analysis responses without returning incomplete privacy data", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(jsonResponse({ data: {} }));
    const { analyzeProjectInstructions } = await import("./api.js");

    await expect(
      analyzeProjectInstructions("proj_abcdef123456"),
    ).rejects.toThrow("Project instruction analysis failed: Invalid response.");
  });

  it("rejects project instruction analysis responses that include raw-like fields", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(
        jsonResponse({
          data: {
            generated_at: "2026-05-03T00:00:00.000Z",
            analyzer: "local-project-instructions-v1",
            score: { value: 80, max: 100, band: "good" },
            files_found: 1,
            files: [],
            checklist: [],
            suggestions: [],
            prompt_body: "secret instruction body",
            privacy: {
              local_only: true,
              external_calls: false,
              stores_file_bodies: false,
              returns_file_bodies: false,
              returns_raw_paths: false,
            },
          },
        }),
      );
    const { analyzeProjectInstructions } = await import("./api.js");

    await expect(
      analyzeProjectInstructions("proj_abcdef123456"),
    ).rejects.toThrow("Project instruction analysis failed: Invalid response.");
  });

  it("rejects project instruction file summaries that include raw-like fields", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(
        jsonResponse({
          data: {
            generated_at: "2026-05-03T00:00:00.000Z",
            analyzer: "local-project-instructions-v1",
            score: { value: 80, max: 100, band: "good" },
            files_found: 1,
            files: [
              {
                file_name: "AGENTS.md",
                bytes: 1200,
                modified_at: "2026-05-03T00:00:00.000Z",
                content_hash: "sha256:abcdef",
                truncated: false,
                raw_path: "/Users/example/private/project/AGENTS.md",
              },
            ],
            checklist: [],
            suggestions: [],
            privacy: {
              local_only: true,
              external_calls: false,
              stores_file_bodies: false,
              returns_file_bodies: false,
              returns_raw_paths: false,
            },
          },
        }),
      );
    const { analyzeProjectInstructions } = await import("./api.js");

    await expect(
      analyzeProjectInstructions("proj_abcdef123456"),
    ).rejects.toThrow("Project instruction analysis failed: Invalid response.");
  });

  it("rejects project instruction checklist items that include raw-like fields", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(
        jsonResponse({
          data: {
            generated_at: "2026-05-03T00:00:00.000Z",
            analyzer: "local-project-instructions-v1",
            score: { value: 80, max: 100, band: "good" },
            files_found: 1,
            files: [],
            checklist: [
              {
                key: "privacy_safety",
                label: "Privacy and safety",
                status: "weak",
                weight: 20,
                earned: 10,
                suggestion: "Keep raw prompt bodies out of docs.",
                prompt_body: "secret instruction body",
              },
            ],
            suggestions: [],
            privacy: {
              local_only: true,
              external_calls: false,
              stores_file_bodies: false,
              returns_file_bodies: false,
              returns_raw_paths: false,
            },
          },
        }),
      );
    const { analyzeProjectInstructions } = await import("./api.js");

    await expect(
      analyzeProjectInstructions("proj_abcdef123456"),
    ).rejects.toThrow("Project instruction analysis failed: Invalid response.");
  });

  it("rejects project instruction suggestions that include raw-like objects", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(
        jsonResponse({
          data: {
            generated_at: "2026-05-03T00:00:00.000Z",
            analyzer: "local-project-instructions-v1",
            score: { value: 80, max: 100, band: "good" },
            files_found: 1,
            files: [],
            checklist: [],
            suggestions: [
              {
                text: "Keep raw prompt bodies out of instruction files.",
                prompt_body: "secret instruction body",
              },
            ],
            privacy: {
              local_only: true,
              external_calls: false,
              stores_file_bodies: false,
              returns_file_bodies: false,
              returns_raw_paths: false,
            },
          },
        }),
      );
    const { analyzeProjectInstructions } = await import("./api.js");

    await expect(
      analyzeProjectInstructions("proj_abcdef123456"),
    ).rejects.toThrow("Project instruction analysis failed: Invalid response.");
  });
});

function jsonResponse(body: unknown): Response {
  return {
    ok: true,
    json: async () => body,
  } as Response;
}

function errorResponse(status: number, body: unknown): Response {
  return {
    ok: false,
    status,
    json: async () => {
      if (body === undefined) {
        throw new Error("not json");
      }
      return body;
    },
  } as unknown as Response;
}

function textResponse(status: number, body: string): Response {
  return {
    ok: false,
    status,
    json: async () => {
      throw new Error("not json");
    },
    text: async () => body,
  } as unknown as Response;
}
