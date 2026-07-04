import type { FastifyInstance } from "fastify";
import { z } from "zod";

import {
  createLoopBrief,
  latestCompactBoundaryAfterSnapshot,
} from "../../loop/brief.js";
import {
  parseInstructionPatchTarget,
  proposeInstructionPatchFromMemory,
} from "../../loop/instruction-patch.js";
import {
  createLoopdeckCommandCenter,
  createLoopdeckStatus,
  type LoopdeckStatusActivityMergeReadiness,
  toLoopdeckStatusSnapshot,
} from "../../loop/status.js";
import { decideLoopMemoryCandidate } from "../../loop/memory-candidate.js";
import {
  hasLoopSnapshotSelection,
  selectLoopSnapshot,
} from "../../loop/snapshot-selection.js";
import type { LoopSnapshot } from "../../loop/types.js";
import type {
  CompactBoundaryStoragePort,
  LoopMergeDecisionStoragePort,
  LoopMemoryStoragePort,
  LoopSnapshotStoragePort,
} from "../../storage/ports.js";
import { requireAppAccess, type ServerAuthConfig } from "../auth.js";
import { problem } from "../errors.js";

export type LoopRouteOptions = {
  auth: ServerAuthConfig;
  storage: Partial<
    LoopSnapshotStoragePort &
      CompactBoundaryStoragePort &
      LoopMemoryStoragePort &
      LoopMergeDecisionStoragePort
  >;
};

const LoopMemoryApprovalBodySchema = z.object({
  approved_by: z.string().trim().min(1).max(80).optional(),
});

const LoopBriefSelectionQuerySchema = z.object({
  worktree: z.string().trim().min(1).optional(),
  session_id: z.string().trim().min(1).optional(),
  branch: z.string().trim().min(1).optional(),
});

const LoopInstructionPatchQuerySchema = z.object({
  target_file: z.enum(["AGENTS.md", "CLAUDE.md"]).optional(),
});

export function registerLoopRoutes(
  server: FastifyInstance,
  options: LoopRouteOptions,
): void {
  server.get("/api/v1/loops", async (request) => {
    requireAppAccess(request, options.auth);

    const snapshots =
      options.storage.listLoopSnapshots?.({ limit: 100 }).items ?? [];
    const boundaries =
      options.storage.listCompactBoundaries?.({ limit: 100 }).items ?? [];
    const latest = snapshots.at(0);
    const projectMemories = latest
      ? (options.storage.listLoopMemories?.({
          projectId: latest.project_id,
        }).items ?? [])
      : [];
    const status = createLoopdeckStatus({
      snapshots,
      compactBoundaries: boundaries,
      projectMemoryCount: projectMemories.length,
      memoryCandidate:
        latest && !hasApprovedMemoryForSnapshot(projectMemories, latest.id)
          ? decideLoopMemoryCandidate(latest)
          : undefined,
      mergeDecisions:
        latest
          ? (options.storage.listLoopMergeDecisions?.({
              limit: 3,
              projectId: latest.project_id,
            }).items ?? [])
          : [],
    });

    return {
      data: {
        status,
        items: snapshots.map((snapshot) => {
          const compactBoundary = latestCompactBoundaryAfterSnapshot(
            snapshot,
            boundaries,
          );

          return {
            ...toLoopdeckStatusSnapshot(snapshot),
            compact_boundary: compactBoundary,
          };
        }),
        privacy: {
          local_only: true,
          returns_prompt_bodies: false,
          returns_raw_paths: false,
          returns_compact_content: false,
        },
      },
    };
  });

  server.get("/api/v1/loops/worktrees/:worktree", async (request) => {
    requireAppAccess(request, options.auth);
    const params = request.params as { worktree: string };
    const query = request.query as { branch?: string; session_id?: string };
    const allSnapshots =
      options.storage.listLoopSnapshots?.({ limit: 100 }).items ?? [];
    const snapshots =
      allSnapshots.filter(
        (snapshot) =>
          snapshot.worktree_label === params.worktree &&
          (!query.session_id || snapshot.session_id === query.session_id) &&
          (!query.branch || snapshot.branch === query.branch),
      ) ?? [];
    const boundaries =
      options.storage.listCompactBoundaries?.({ limit: 100 }).items ?? [];
    const latestSnapshot = snapshots.at(0);
    const latestDecision = latestSnapshot
      ? options.storage
          .listLoopMergeDecisions?.({
            limit: 1,
            projectId: latestSnapshot.project_id,
            worktree: params.worktree,
          })
          .items.at(0)
      : undefined;
    const mergeDecisions = latestSnapshot
      ? (options.storage.listLoopMergeDecisions?.({
          limit: 3,
          projectId: latestSnapshot.project_id,
        }).items ?? [])
      : [];
    const reviewStatus = latestSnapshot
      ? createLoopdeckStatus({
          snapshots: allSnapshots,
          compactBoundaries: boundaries,
          projectMemoryCount: 0,
          mergeDecisions,
        })
      : undefined;
    const commandCenter =
      reviewStatus?.activity.command_center ??
      (reviewStatus
        ? createLoopdeckCommandCenter(reviewStatus.activity.worktrees, mergeDecisions)
        : undefined);
    const reviewPacket = commandCenter?.review_packet;
    const reviewItem = commandCenter?.review_items.find(
      (item) => item.worktree === params.worktree,
    );

    return {
      data: {
        worktree: params.worktree,
        ...(query.session_id ? { session_id: query.session_id } : {}),
        ...(query.branch ? { branch: query.branch } : {}),
        selection_scope: selectionScopeFor({
          hasSession: Boolean(query.session_id),
          hasBranch: Boolean(query.branch),
        }),
        ...(latestSnapshot
          ? {
              snapshot_age: snapshotAgeFor({
                selectedSnapshot: latestSnapshot,
                snapshots: allSnapshots,
              }),
              selected_brief_action: selectedBriefActionFor({
                worktree: params.worktree,
                sessionId: query.session_id,
                branch: query.branch,
              }),
              command_distinction: commandDistinctionFor(),
              command_filters: commandFiltersFor({
                hasSession: Boolean(query.session_id),
                hasBranch: Boolean(query.branch),
                reviewHasBranch: Boolean(reviewItem?.branch),
              }),
              copy_side_effects: copySideEffectsFor(),
              continuation_safety_group: continuationSafetyGroupFor(),
              continuation_safety_ordering_note:
                continuationSafetyOrderingNoteFor(),
              continuation_safety_non_persistence_note:
                continuationSafetyNonPersistenceNoteFor(),
              continuation_safety_recheck_cue:
                continuationSafetyRecheckCueFor(),
              continuation_safety_copy_feedback_reminder:
                continuationSafetyCopyFeedbackReminderFor(),
              continuation_safety_copy_feedback_accessibility_note:
                continuationSafetyCopyFeedbackAccessibilityNoteFor(),
              continuation_safety_copy_feedback_timeout_note:
                continuationSafetyCopyFeedbackTimeoutNoteFor(),
              continuation_safety_copy_feedback_failure_note:
                continuationSafetyCopyFeedbackFailureNoteFor(),
              continuation_safety_copy_retry_note:
                continuationSafetyCopyRetryNoteFor(),
              continuation_safety_pre_paste_confirmation_note:
                continuationSafetyPrePasteConfirmationNoteFor(),
              continuation_safety_target_agent_check_note:
                continuationSafetyTargetAgentCheckNoteFor(),
              continuation_safety_paste_destination_boundary_note:
                continuationSafetyPasteDestinationBoundaryNoteFor(),
              continuation_safety_manual_submission_boundary_note:
                continuationSafetyManualSubmissionBoundaryNoteFor(),
              continuation_safety_submission_result_non_persistence_note:
                continuationSafetySubmissionResultNonPersistenceNoteFor(),
              continuation_safety_post_submission_collection_reminder_note:
                continuationSafetyPostSubmissionCollectionReminderNoteFor(),
              continuation_safety_collection_result_non_persistence_note:
                continuationSafetyCollectionResultNonPersistenceNoteFor(),
              continuation_safety_collection_retry_boundary_note:
                continuationSafetyCollectionRetryBoundaryNoteFor(),
              continuation_safety_retry_outcome_non_persistence_note:
                continuationSafetyRetryOutcomeNonPersistenceNoteFor(),
              continuation_safety_collection_evidence_freshness_boundary_note:
                continuationSafetyCollectionEvidenceFreshnessBoundaryNoteFor(),
              continuation_safety_freshness_result_non_persistence_note:
                continuationSafetyFreshnessResultNonPersistenceNoteFor(),
              continuation_safety_freshness_uncertainty_collection_reminder:
                continuationSafetyFreshnessUncertaintyCollectionReminderFor(),
              continuation_safety_pre_merge_freshness_advisory:
                continuationSafetyPreMergeFreshnessAdvisoryFor(),
              continuation_safety_pre_memory_approval_freshness_advisory:
                continuationSafetyPreMemoryApprovalFreshnessAdvisoryFor(),
              continuation_safety_post_memory_approval_collection_reminder:
                continuationSafetyPostMemoryApprovalCollectionReminderFor(),
              continuation_safety_post_memory_approval_collection_result_non_persistence_note:
                continuationSafetyPostMemoryApprovalCollectionResultNonPersistenceNoteFor(),
              continuation_safety_post_memory_approval_collection_retry_boundary_note:
                continuationSafetyPostMemoryApprovalCollectionRetryBoundaryNoteFor(),
              continuation_safety_post_memory_approval_retry_outcome_non_persistence_note:
                continuationSafetyPostMemoryApprovalRetryOutcomeNonPersistenceNoteFor(),
              paste_destination: pasteDestinationFor(),
              handoff_checklist: handoffChecklistFor(),
              post_handoff_reminder: postHandoffReminderFor(),
              source_of_truth_note: sourceOfTruthNoteFor(),
              privacy_boundary_note: privacyBoundaryNoteFor(),
              operator_review_gate: operatorReviewGateFor(),
              collection_responsibility_note: collectionResponsibilityNoteFor(),
              pre_merge_advisory: preMergeAdvisoryFor(),
              post_collection_review_note: postCollectionReviewNoteFor(),
            }
          : {}),
        ...(latestDecision
          ? {
              latest_decision: {
                snapshot_id: latestDecision.snapshot_id,
                worktree: latestDecision.worktree,
                decision: latestDecision.decision,
                reason: latestDecision.reason,
                decided_by: latestDecision.decided_by,
                created_at: latestDecision.created_at,
              },
            }
          : {}),
        ...(reviewPacket && reviewItem
          ? {
              review_packet_summary: {
                title: reviewPacket.title,
                status: reviewPacket.status,
                summary: reviewPacket.summary,
                next_action: reviewPacket.next_action,
                worktree: reviewItem.worktree,
                merge_readiness: reviewItem.merge_readiness.status,
                worktree_action: reviewItem.merge_readiness.next_action,
                readiness_summary: readinessSummaryFor(
                  reviewItem.merge_readiness,
                ),
                brief_rationale: briefRationaleFor(
                  reviewItem.merge_readiness,
                ),
                evidence_count_explanation: evidenceCountExplanationFor(
                  reviewItem.evidence_count,
                ),
                reviewer_checklist_preview: reviewPacket.checklist.filter(
                  (item) =>
                    item.action === reviewItem.merge_readiness.next_action,
                ),
                command_hint: {
                  label: "Copy review brief command",
                  command: reviewItem.continuation_command,
                  provenance: commandHintProvenance(),
                },
                ...(reviewItem.merge_readiness.status === "missing_evidence"
                  ? {
                      missing_evidence_explanation: {
                        label: "Missing evidence",
                        reason:
                          "latest selected worktree outcome has no evidence refs",
                        next_action: reviewItem.merge_readiness.next_action,
                      },
                    }
                  : {}),
              },
            }
          : {}),
        items: snapshots.map((snapshot) => ({
          ...toLoopdeckStatusSnapshot(snapshot),
          compact_boundary: latestCompactBoundaryAfterSnapshot(
            snapshot,
            boundaries,
          ),
        })),
        privacy: {
          local_only: true,
          returns_prompt_bodies: false,
          returns_raw_paths: false,
          returns_compact_content: false,
        },
      },
    };
  });

  server.get("/api/v1/loops/brief", async (request) => {
    requireAppAccess(request, options.auth);
    const query = LoopBriefSelectionQuerySchema.parse(request.query);
    const selection = {
      worktree: query.worktree,
      sessionId: query.session_id,
      branch: query.branch,
    };
    const snapshots =
      options.storage.listLoopSnapshots?.({ limit: 100 }).items ?? [];
    const snapshot = hasLoopSnapshotSelection(selection)
      ? selectLoopSnapshot(snapshots, selection)
      : snapshots.at(0);

    if (!snapshot) {
      throw problem(
        404,
        "Not Found",
        hasLoopSnapshotSelection(selection)
          ? "No loop snapshot matched the selected worktree/session/branch filters."
          : "Loop snapshot not found.",
        request.url,
      );
    }

    const boundaries =
      options.storage.listCompactBoundaries?.({ limit: 100 }).items ?? [];

    return {
      data: createLoopBrief({
        snapshot,
        compactBoundary: latestCompactBoundaryAfterSnapshot(
          snapshot,
          boundaries,
        ),
        approvedMemories:
          options.storage.listLoopMemories?.({
            projectId: snapshot.project_id,
            limit: 3,
          }).items ?? [],
      }),
    };
  });

  server.get("/api/v1/loops/:id/brief", async (request) => {
    requireAppAccess(request, options.auth);
    const params = request.params as { id: string };
    const snapshots =
      options.storage.listLoopSnapshots?.({ limit: 100 }).items ?? [];
    const snapshot = snapshots.find((item) => item.id === params.id);

    if (!snapshot) {
      throw problem(404, "Not Found", "Loop snapshot not found.", request.url);
    }

    const boundaries =
      options.storage.listCompactBoundaries?.({ limit: 100 }).items ?? [];

    return {
      data: createLoopBrief({
        snapshot,
        compactBoundary: latestCompactBoundaryAfterSnapshot(
          snapshot,
          boundaries,
        ),
        approvedMemories:
          options.storage.listLoopMemories?.({
            projectId: snapshot.project_id,
            limit: 3,
          }).items ?? [],
      }),
    };
  });

  server.get("/api/v1/loops/instruction-patch", async (request) => {
    requireAppAccess(request, options.auth);
    const storage = requireLoopMemoryReadStorage(options.storage, request.url);
    const query = LoopInstructionPatchQuerySchema.parse(request.query);
    const targetFile = parseInstructionPatchTarget(
      query.target_file ?? "AGENTS.md",
    );
    const memory = storage.listLoopMemories({ limit: 1 }).items.at(0);

    if (!memory) {
      throw problem(
        404,
        "Not Found",
        "No loop memory found. Approve a Loopdeck memory first.",
        request.url,
      );
    }

    return {
      data: proposeInstructionPatchFromMemory({ memory, targetFile }),
    };
  });

  server.post("/api/v1/loops/memory/approve", async (request) => {
    requireAppAccess(request, options.auth, { csrf: true });
    const storage = requireLoopMemoryApprovalStorage(
      options.storage,
      request.url,
    );
    const body = LoopMemoryApprovalBodySchema.parse(request.body ?? {});
    const latest = storage.getLatestLoopSnapshot();

    if (!latest) {
      throw problem(404, "Not Found", "Loop snapshot not found.", request.url);
    }

    const decision = decideLoopMemoryCandidate(latest);
    if (!decision.eligible || !decision.candidate) {
      throw problem(
        409,
        "Conflict",
        `Latest loop memory candidate is not eligible: ${decision.reason}.`,
        request.url,
      );
    }
    const existingMemories = storage.listLoopMemories({
      projectId: latest.project_id,
    }).items;
    if (hasApprovedMemoryForSnapshot(existingMemories, latest.id)) {
      throw problem(
        409,
        "Conflict",
        "Latest loop memory candidate is already approved.",
        request.url,
      );
    }

    const memory = storage.recordLoopMemory({
      snapshot_id: latest.id,
      title: decision.candidate.title,
      statement: decision.candidate.statement,
      evidence_refs: decision.candidate.evidence_refs,
      approved_by: body.approved_by ?? "web",
    });

    return {
      data: {
        recorded: true as const,
        memory: {
          id: memory.id,
          snapshot_id: memory.snapshot_id,
          title: memory.title,
          evidence_refs: memory.evidence_refs,
          approved_by: memory.approved_by,
          created_at: memory.created_at,
          privacy: memory.privacy,
        },
        next_action:
          "use recorded memory as local context in future loop briefs",
        next_actions: [
          "prompt-coach loop brief",
          "prompt-coach loop instruction-patch --target-file AGENTS.md",
        ],
        privacy: {
          local_only: true,
          returns_prompt_bodies: false,
          returns_raw_paths: false,
          writes_instruction_files: false,
          external_calls: false,
        },
      },
    };
  });
}

function selectionScopeFor(selection: {
  hasSession: boolean;
  hasBranch: boolean;
}): {
  label: "Selection scope";
  filters:
    | ["worktree"]
    | ["worktree", "session"]
    | ["worktree", "branch"]
    | ["worktree", "session", "branch"];
  reason:
    | "showing latest snapshots for selected worktree"
    | "showing snapshots filtered by selected worktree and session"
    | "showing snapshots filtered by selected worktree and branch"
    | "showing snapshots filtered by selected worktree, session, and branch";
  next_action:
    | "copy selected worktree brief"
    | "copy selected session brief"
    | "copy selected branch brief"
    | "copy selected session and branch brief";
} {
  if (selection.hasSession && selection.hasBranch) {
    return {
      label: "Selection scope",
      filters: ["worktree", "session", "branch"],
      reason:
        "showing snapshots filtered by selected worktree, session, and branch",
      next_action: "copy selected session and branch brief",
    };
  }

  if (selection.hasSession) {
    return {
      label: "Selection scope",
      filters: ["worktree", "session"],
      reason: "showing snapshots filtered by selected worktree and session",
      next_action: "copy selected session brief",
    };
  }

  if (selection.hasBranch) {
    return {
      label: "Selection scope",
      filters: ["worktree", "branch"],
      reason: "showing snapshots filtered by selected worktree and branch",
      next_action: "copy selected branch brief",
    };
  }

  return {
    label: "Selection scope",
    filters: ["worktree"],
    reason: "showing latest snapshots for selected worktree",
    next_action: "copy selected worktree brief",
  };
}

function snapshotAgeFor(input: {
  selectedSnapshot: LoopSnapshot;
  snapshots: readonly LoopSnapshot[];
}): {
  label: "Selected snapshot age";
  latest_selected_created_at: string;
  status: "latest" | "older_than_latest";
  reason:
    | "selected snapshot is the latest recorded loop snapshot"
    | "another loop snapshot was recorded after this selection";
  next_action:
    | "copy selected worktree brief"
    | "refresh selected worktree before merging";
} {
  const latestRecordedSnapshot =
    input.snapshots.reduce<LoopSnapshot | undefined>((latest, snapshot) => {
      if (!latest || snapshot.created_at > latest.created_at) return snapshot;
      return latest;
    }, undefined) ?? input.selectedSnapshot;

  if (latestRecordedSnapshot.id === input.selectedSnapshot.id) {
    return {
      label: "Selected snapshot age",
      latest_selected_created_at: input.selectedSnapshot.created_at,
      status: "latest",
      reason: "selected snapshot is the latest recorded loop snapshot",
      next_action: "copy selected worktree brief",
    };
  }

  return {
    label: "Selected snapshot age",
    latest_selected_created_at: input.selectedSnapshot.created_at,
    status: "older_than_latest",
    reason: "another loop snapshot was recorded after this selection",
    next_action: "refresh selected worktree before merging",
  };
}

function selectedBriefActionFor(selection: {
  worktree: string;
  sessionId?: string;
  branch?: string;
}): {
  label: "Selected brief action";
  action: "copy selected continuation brief";
  reason: "uses the selected worktree/session/branch filters without auto-submitting";
  command: string;
  writes_files: false;
  external_calls: false;
} {
  return {
    label: "Selected brief action",
    action: "copy selected continuation brief",
    reason:
      "uses the selected worktree/session/branch filters without auto-submitting",
    command: selectedBriefCommand(selection),
    writes_files: false,
    external_calls: false,
  };
}

function commandHintProvenance(): {
  label: "Command provenance";
  source: "existing command-center continuation command";
  reason: "reuses safe selected worktree metadata without reading git or executing commands";
  writes_files: false;
  external_calls: false;
} {
  return {
    label: "Command provenance",
    source: "existing command-center continuation command",
    reason:
      "reuses safe selected worktree metadata without reading git or executing commands",
    writes_files: false,
    external_calls: false,
  };
}

function commandDistinctionFor(): {
  label: "Command distinction";
  selected_command_role: "continue the selected worktree/session/branch filters";
  review_command_role: "copy the review packet command-center hint for merge review";
  reason: "selected continuation and review packet commands can differ when session or branch filters are active";
  writes_files: false;
  external_calls: false;
} {
  return {
    label: "Command distinction",
    selected_command_role: "continue the selected worktree/session/branch filters",
    review_command_role:
      "copy the review packet command-center hint for merge review",
    reason:
      "selected continuation and review packet commands can differ when session or branch filters are active",
    writes_files: false,
    external_calls: false,
  };
}

function commandFiltersFor(input: {
  hasSession: boolean;
  hasBranch: boolean;
  reviewHasBranch: boolean;
}): {
  label: "Command filters";
  selected_command_filters:
    | ["worktree"]
    | ["worktree", "session"]
    | ["worktree", "branch"]
    | ["worktree", "session", "branch"];
  review_command_filters: ["worktree"] | ["worktree", "branch"];
  reason: "selected command reflects the current selection while review command reflects command-center review scope";
  writes_files: false;
  external_calls: false;
} {
  const selectedCommandFilters:
    | ["worktree"]
    | ["worktree", "session"]
    | ["worktree", "branch"]
    | ["worktree", "session", "branch"] =
    input.hasSession && input.hasBranch
      ? ["worktree", "session", "branch"]
      : input.hasSession
        ? ["worktree", "session"]
        : input.hasBranch
          ? ["worktree", "branch"]
          : ["worktree"];

  return {
    label: "Command filters",
    selected_command_filters: selectedCommandFilters,
    review_command_filters: input.reviewHasBranch
      ? ["worktree", "branch"]
      : ["worktree"],
    reason:
      "selected command reflects the current selection while review command reflects command-center review scope",
    writes_files: false,
    external_calls: false,
  };
}

function copySideEffectsFor(): {
  label: "Copy side effects";
  clipboard: "copies the selected continuation brief to the local clipboard";
  ui_feedback: "temporarily marks the selected brief copy button as copied";
  does_not: "does not write files, execute commands, call external services, submit prompts, or change merge state";
  writes_files: false;
  external_calls: false;
} {
  return {
    label: "Copy side effects",
    clipboard: "copies the selected continuation brief to the local clipboard",
    ui_feedback: "temporarily marks the selected brief copy button as copied",
    does_not:
      "does not write files, execute commands, call external services, submit prompts, or change merge state",
    writes_files: false,
    external_calls: false,
  };
}

function continuationSafetyGroupFor(): {
  label: "Continuation safety guidance";
  scope: "read-only handoff boundaries for Codex and Claude Code continuation";
  includes: "copy, paste, review, collect, privacy, and merge gating notes";
  reason: "keeps the selected continuation path explicit without automating agents";
  writes_files: false;
  external_calls: false;
} {
  return {
    label: "Continuation safety guidance",
    scope:
      "read-only handoff boundaries for Codex and Claude Code continuation",
    includes: "copy, paste, review, collect, privacy, and merge gating notes",
    reason:
      "keeps the selected continuation path explicit without automating agents",
    writes_files: false,
    external_calls: false,
  };
}

function continuationSafetyOrderingNoteFor(): {
  label: "Safety guidance order";
  first: "review the continuation safety guidance before copying or pasting briefs";
  then: "follow copy, paste, review, collect, privacy, and merge gating notes in order";
  reason: "keeps continuation handoff reviewable before any manual agent submission";
  writes_files: false;
  external_calls: false;
} {
  return {
    label: "Safety guidance order",
    first:
      "review the continuation safety guidance before copying or pasting briefs",
    then:
      "follow copy, paste, review, collect, privacy, and merge gating notes in order",
    reason:
      "keeps continuation handoff reviewable before any manual agent submission",
    writes_files: false,
    external_calls: false,
  };
}

function continuationSafetyNonPersistenceNoteFor(): {
  label: "Safety review state";
  state: "reviewed guidance state is not stored or synchronized by Loopdeck";
  reminder: "operator re-checks safety guidance each time before manual agent submission";
  reason: "keeps continuation review local to the current operator session";
  stores_state: false;
  external_calls: false;
} {
  return {
    label: "Safety review state",
    state: "reviewed guidance state is not stored or synchronized by Loopdeck",
    reminder:
      "operator re-checks safety guidance each time before manual agent submission",
    reason: "keeps continuation review local to the current operator session",
    stores_state: false,
    external_calls: false,
  };
}

function continuationSafetyRecheckCueFor(): {
  label: "Safety re-check cue";
  trigger: "after each selected brief copy";
  instruction: "re-check continuation safety guidance before pasting into Codex or Claude Code";
  reason: "each copied brief can represent a new handoff decision even in the same session";
  writes_files: false;
  external_calls: false;
} {
  return {
    label: "Safety re-check cue",
    trigger: "after each selected brief copy",
    instruction:
      "re-check continuation safety guidance before pasting into Codex or Claude Code",
    reason:
      "each copied brief can represent a new handoff decision even in the same session",
    writes_files: false,
    external_calls: false,
  };
}

function continuationSafetyCopyFeedbackReminderFor(): {
  label: "Copy feedback reminder";
  feedback_scope: "copied state only confirms the brief reached the local clipboard";
  next_step: "return to the safety re-check cue before pasting the copied brief";
  reason: "copy feedback is not safety approval or agent submission";
  writes_files: false;
  external_calls: false;
} {
  return {
    label: "Copy feedback reminder",
    feedback_scope:
      "copied state only confirms the brief reached the local clipboard",
    next_step:
      "return to the safety re-check cue before pasting the copied brief",
    reason: "copy feedback is not safety approval or agent submission",
    writes_files: false,
    external_calls: false,
  };
}

function continuationSafetyCopyFeedbackAccessibilityNoteFor(): {
  label: "Copy feedback accessibility";
  visible_label: "selected brief copy button label remains stable";
  assistive_feedback: "copied status belongs in accessible feedback instead of replacing the visible command";
  reason: "keeps copy feedback clear without implying safety approval or changing layout";
  writes_files: false;
  external_calls: false;
} {
  return {
    label: "Copy feedback accessibility",
    visible_label: "selected brief copy button label remains stable",
    assistive_feedback:
      "copied status belongs in accessible feedback instead of replacing the visible command",
    reason:
      "keeps copy feedback clear without implying safety approval or changing layout",
    writes_files: false,
    external_calls: false,
  };
}

function continuationSafetyCopyFeedbackTimeoutNoteFor(): {
  label: "Copy feedback timeout";
  timeout_scope: "copied feedback clears after a short local timeout";
  not_state: "timeout does not record review completion or submission state";
  reason: "keeps copied feedback temporary while preserving the manual safety review boundary";
  writes_files: false;
  external_calls: false;
} {
  return {
    label: "Copy feedback timeout",
    timeout_scope: "copied feedback clears after a short local timeout",
    not_state:
      "timeout does not record review completion or submission state",
    reason:
      "keeps copied feedback temporary while preserving the manual safety review boundary",
    writes_files: false,
    external_calls: false,
  };
}

function continuationSafetyCopyFeedbackFailureNoteFor(): {
  label: "Copy feedback failure";
  failure_scope: "clipboard failure requires a manual retry";
  not_state: "failure does not submit prompts or store review state";
  reason: "keeps copy failure handling local to the operator without hidden recovery actions";
  writes_files: false;
  external_calls: false;
} {
  return {
    label: "Copy feedback failure",
    failure_scope: "clipboard failure requires a manual retry",
    not_state: "failure does not submit prompts or store review state",
    reason:
      "keeps copy failure handling local to the operator without hidden recovery actions",
    writes_files: false,
    external_calls: false,
  };
}

function continuationSafetyCopyRetryNoteFor(): {
  label: "Copy retry";
  retry_scope: "operator manually retries the selected brief copy action";
  not_automatic: "Loopdeck does not automatically retry clipboard writes or submit prompts";
  reason: "keeps retry control with the operator before any Codex or Claude Code paste";
  writes_files: false;
  external_calls: false;
} {
  return {
    label: "Copy retry",
    retry_scope: "operator manually retries the selected brief copy action",
    not_automatic:
      "Loopdeck does not automatically retry clipboard writes or submit prompts",
    reason:
      "keeps retry control with the operator before any Codex or Claude Code paste",
    writes_files: false,
    external_calls: false,
  };
}

function continuationSafetyPrePasteConfirmationNoteFor(): {
  label: "Pre-paste confirmation";
  confirmation: "operator confirms the copied brief and target agent request before paste";
  not_submission: "confirmation does not submit prompts or approve safety review";
  reason: "keeps the final handoff check manual before Codex or Claude Code receives the brief";
  writes_files: false;
  external_calls: false;
} {
  return {
    label: "Pre-paste confirmation",
    confirmation:
      "operator confirms the copied brief and target agent request before paste",
    not_submission:
      "confirmation does not submit prompts or approve safety review",
    reason:
      "keeps the final handoff check manual before Codex or Claude Code receives the brief",
    writes_files: false,
    external_calls: false,
  };
}

function continuationSafetyTargetAgentCheckNoteFor(): {
  label: "Target-agent check";
  check: "operator verifies the active Codex or Claude Code request box before paste";
  not_inspection: "Loopdeck does not inspect agent UI state or target contents";
  reason: "keeps target selection manual before any continuation handoff";
  writes_files: false;
  external_calls: false;
} {
  return {
    label: "Target-agent check",
    check:
      "operator verifies the active Codex or Claude Code request box before paste",
    not_inspection:
      "Loopdeck does not inspect agent UI state or target contents",
    reason: "keeps target selection manual before any continuation handoff",
    writes_files: false,
    external_calls: false,
  };
}

function continuationSafetyPasteDestinationBoundaryNoteFor(): {
  label: "Paste destination boundary";
  boundary: "paste destination is a manual operator choice in Codex or Claude Code";
  not_verified: "Loopdeck does not verify active windows, target contents, or paste success";
  reason: "keeps destination verification outside Loopdeck automation before submission";
  writes_files: false;
  external_calls: false;
} {
  return {
    label: "Paste destination boundary",
    boundary:
      "paste destination is a manual operator choice in Codex or Claude Code",
    not_verified:
      "Loopdeck does not verify active windows, target contents, or paste success",
    reason:
      "keeps destination verification outside Loopdeck automation before submission",
    writes_files: false,
    external_calls: false,
  };
}

function continuationSafetyManualSubmissionBoundaryNoteFor(): {
  label: "Manual submission boundary";
  submission: "operator submits the pasted brief manually in Codex or Claude Code";
  not_automated: "Loopdeck does not press enter, click submit, or record submitted state";
  reason: "keeps final agent execution under operator control after paste";
  writes_files: false;
  external_calls: false;
} {
  return {
    label: "Manual submission boundary",
    submission:
      "operator submits the pasted brief manually in Codex or Claude Code",
    not_automated:
      "Loopdeck does not press enter, click submit, or record submitted state",
    reason: "keeps final agent execution under operator control after paste",
    writes_files: false,
    external_calls: false,
  };
}

function continuationSafetySubmissionResultNonPersistenceNoteFor(): {
  label: "Submission result non-persistence";
  result_scope: "agent response and submission result stay outside Loopdeck until the next explicit loop snapshot";
  not_stored: "Loopdeck does not detect, store, or sync submitted state after handoff";
  reason: "keeps post-submission evidence tied to explicit loop collection instead of UI monitoring";
  writes_files: false;
  external_calls: false;
} {
  return {
    label: "Submission result non-persistence",
    result_scope:
      "agent response and submission result stay outside Loopdeck until the next explicit loop snapshot",
    not_stored:
      "Loopdeck does not detect, store, or sync submitted state after handoff",
    reason:
      "keeps post-submission evidence tied to explicit loop collection instead of UI monitoring",
    writes_files: false,
    external_calls: false,
  };
}

function continuationSafetyPostSubmissionCollectionReminderNoteFor(): {
  label: "Post-submission collection reminder";
  reminder: "collect the next loop snapshot explicitly after the agent response is ready";
  not_background: "Loopdeck does not start collection from submission, transcript changes, or agent UI activity";
  reason: "keeps post-submission collection operator-triggered and local-first";
  writes_files: false;
  external_calls: false;
} {
  return {
    label: "Post-submission collection reminder",
    reminder:
      "collect the next loop snapshot explicitly after the agent response is ready",
    not_background:
      "Loopdeck does not start collection from submission, transcript changes, or agent UI activity",
    reason:
      "keeps post-submission collection operator-triggered and local-first",
    writes_files: false,
    external_calls: false,
  };
}

function continuationSafetyCollectionResultNonPersistenceNoteFor(): {
  label: "Collection result non-persistence";
  result_scope: "collection result is not persisted until the operator records the next explicit loop snapshot";
  not_stored: "Loopdeck does not store, sync, or infer collection result state from agent UI activity";
  reason: "keeps collection evidence tied to explicit local snapshot recording";
  writes_files: false;
  external_calls: false;
} {
  return {
    label: "Collection result non-persistence",
    result_scope:
      "collection result is not persisted until the operator records the next explicit loop snapshot",
    not_stored:
      "Loopdeck does not store, sync, or infer collection result state from agent UI activity",
    reason: "keeps collection evidence tied to explicit local snapshot recording",
    writes_files: false,
    external_calls: false,
  };
}

function continuationSafetyCollectionRetryBoundaryNoteFor(): {
  label: "Collection retry boundary";
  retry: "operator reruns the explicit loop collection flow when retry is needed";
  not_automated: "Loopdeck does not automatically retry collection commands or hidden recovery actions";
  reason: "keeps retry control local and operator-triggered after collection uncertainty";
  writes_files: false;
  external_calls: false;
} {
  return {
    label: "Collection retry boundary",
    retry: "operator reruns the explicit loop collection flow when retry is needed",
    not_automated:
      "Loopdeck does not automatically retry collection commands or hidden recovery actions",
    reason:
      "keeps retry control local and operator-triggered after collection uncertainty",
    writes_files: false,
    external_calls: false,
  };
}

function continuationSafetyRetryOutcomeNonPersistenceNoteFor(): {
  label: "Retry outcome non-persistence";
  outcome_scope: "retry attempt and outcome stay outside Loopdeck until the next explicit loop snapshot";
  not_stored: "Loopdeck does not detect, store, or sync retry success or failure state";
  reason: "keeps retry evidence tied to explicit local snapshot recording";
  writes_files: false;
  external_calls: false;
} {
  return {
    label: "Retry outcome non-persistence",
    outcome_scope:
      "retry attempt and outcome stay outside Loopdeck until the next explicit loop snapshot",
    not_stored:
      "Loopdeck does not detect, store, or sync retry success or failure state",
    reason: "keeps retry evidence tied to explicit local snapshot recording",
    writes_files: false,
    external_calls: false,
  };
}

function continuationSafetyCollectionEvidenceFreshnessBoundaryNoteFor(): {
  label: "Collection evidence freshness boundary";
  freshness_check: "operator checks freshness against the latest explicit loop snapshot evidence";
  not_verified: "Loopdeck does not verify freshness from git status, transcripts, or agent UI activity";
  reason: "keeps evidence freshness review tied to local snapshot metadata";
  writes_files: false;
  external_calls: false;
} {
  return {
    label: "Collection evidence freshness boundary",
    freshness_check:
      "operator checks freshness against the latest explicit loop snapshot evidence",
    not_verified:
      "Loopdeck does not verify freshness from git status, transcripts, or agent UI activity",
    reason: "keeps evidence freshness review tied to local snapshot metadata",
    writes_files: false,
    external_calls: false,
  };
}

function continuationSafetyFreshnessResultNonPersistenceNoteFor(): {
  label: "Freshness result non-persistence";
  result_scope: "freshness result stays outside Loopdeck until the next explicit loop snapshot";
  not_stored: "Loopdeck does not detect, store, or sync freshness result state";
  reason: "keeps freshness evidence tied to explicit local snapshot recording";
  writes_files: false;
  external_calls: false;
} {
  return {
    label: "Freshness result non-persistence",
    result_scope:
      "freshness result stays outside Loopdeck until the next explicit loop snapshot",
    not_stored:
      "Loopdeck does not detect, store, or sync freshness result state",
    reason: "keeps freshness evidence tied to explicit local snapshot recording",
    writes_files: false,
    external_calls: false,
  };
}

function continuationSafetyFreshnessUncertaintyCollectionReminderFor(): {
  label: "Freshness uncertainty collection reminder";
  reminder: "collect a new explicit loop snapshot when evidence freshness is uncertain";
  not_automated: "Loopdeck does not verify freshness or start collection automatically";
  reason: "keeps freshness uncertainty resolution operator-triggered and local-first";
  writes_files: false;
  external_calls: false;
} {
  return {
    label: "Freshness uncertainty collection reminder",
    reminder:
      "collect a new explicit loop snapshot when evidence freshness is uncertain",
    not_automated:
      "Loopdeck does not verify freshness or start collection automatically",
    reason:
      "keeps freshness uncertainty resolution operator-triggered and local-first",
    writes_files: false,
    external_calls: false,
  };
}

function continuationSafetyPreMergeFreshnessAdvisoryFor(): {
  label: "Pre-merge freshness advisory";
  advisory: "review freshness uncertainty before merge decisions";
  not_decision: "Loopdeck does not approve merges or verify freshness before merge";
  reason: "keeps merge readiness separate from freshness uncertainty review";
  writes_files: false;
  external_calls: false;
} {
  return {
    label: "Pre-merge freshness advisory",
    advisory: "review freshness uncertainty before merge decisions",
    not_decision:
      "Loopdeck does not approve merges or verify freshness before merge",
    reason: "keeps merge readiness separate from freshness uncertainty review",
    writes_files: false,
    external_calls: false,
  };
}

function continuationSafetyPreMemoryApprovalFreshnessAdvisoryFor(): {
  label: "Pre-memory-approval freshness advisory";
  advisory: "review freshness uncertainty before approving loop memory";
  not_decision: "Loopdeck does not approve memory or verify freshness from this note";
  reason: "keeps memory approval separate from freshness uncertainty review";
  writes_files: false;
  external_calls: false;
} {
  return {
    label: "Pre-memory-approval freshness advisory",
    advisory: "review freshness uncertainty before approving loop memory",
    not_decision:
      "Loopdeck does not approve memory or verify freshness from this note",
    reason:
      "keeps memory approval separate from freshness uncertainty review",
    writes_files: false,
    external_calls: false,
  };
}

function continuationSafetyPostMemoryApprovalCollectionReminderFor(): {
  label: "Post-memory-approval collection reminder";
  reminder: "collect a new explicit loop snapshot after approving loop memory";
  not_automated: "Loopdeck does not start collection from memory approval or approval state changes";
  reason: "keeps post-approval collection operator-triggered and local-first";
  writes_files: false;
  external_calls: false;
} {
  return {
    label: "Post-memory-approval collection reminder",
    reminder:
      "collect a new explicit loop snapshot after approving loop memory",
    not_automated:
      "Loopdeck does not start collection from memory approval or approval state changes",
    reason: "keeps post-approval collection operator-triggered and local-first",
    writes_files: false,
    external_calls: false,
  };
}

function continuationSafetyPostMemoryApprovalCollectionResultNonPersistenceNoteFor(): {
  label: "Post-memory-approval collection result non-persistence";
  result_scope: "post-approval collection result stays outside Loopdeck until the next explicit loop snapshot";
  not_stored: "Loopdeck does not detect, store, or sync post-approval collection result state";
  reason: "keeps post-approval collection evidence tied to explicit local snapshot recording";
  writes_files: false;
  external_calls: false;
} {
  return {
    label: "Post-memory-approval collection result non-persistence",
    result_scope:
      "post-approval collection result stays outside Loopdeck until the next explicit loop snapshot",
    not_stored:
      "Loopdeck does not detect, store, or sync post-approval collection result state",
    reason:
      "keeps post-approval collection evidence tied to explicit local snapshot recording",
    writes_files: false,
    external_calls: false,
  };
}

function continuationSafetyPostMemoryApprovalCollectionRetryBoundaryNoteFor(): {
  label: "Post-memory-approval collection retry boundary";
  retry: "operator reruns the explicit post-approval loop collection flow when retry is needed";
  not_automated: "Loopdeck does not automatically retry post-approval collection commands or hidden recovery actions";
  reason: "keeps post-approval collection retry control local and operator-triggered";
  writes_files: false;
  external_calls: false;
} {
  return {
    label: "Post-memory-approval collection retry boundary",
    retry:
      "operator reruns the explicit post-approval loop collection flow when retry is needed",
    not_automated:
      "Loopdeck does not automatically retry post-approval collection commands or hidden recovery actions",
    reason:
      "keeps post-approval collection retry control local and operator-triggered",
    writes_files: false,
    external_calls: false,
  };
}

function continuationSafetyPostMemoryApprovalRetryOutcomeNonPersistenceNoteFor(): {
  label: "Post-memory-approval retry outcome non-persistence";
  outcome_scope: "post-approval retry outcome stays outside Loopdeck until the next explicit loop snapshot";
  not_stored: "Loopdeck does not detect, store, or sync post-approval retry success or failure state";
  reason: "keeps post-approval retry evidence tied to explicit local snapshot recording";
  writes_files: false;
  external_calls: false;
} {
  return {
    label: "Post-memory-approval retry outcome non-persistence",
    outcome_scope:
      "post-approval retry outcome stays outside Loopdeck until the next explicit loop snapshot",
    not_stored:
      "Loopdeck does not detect, store, or sync post-approval retry success or failure state",
    reason:
      "keeps post-approval retry evidence tied to explicit local snapshot recording",
    writes_files: false,
    external_calls: false,
  };
}

function pasteDestinationFor(): {
  label: "Paste destination";
  targets: ["Codex active request", "Claude Code active request"];
  instruction: "paste the copied continuation brief into the active agent request box";
  reason: "keeps Loopdeck as the local handoff source while the user controls submission";
  auto_submit: false;
  writes_files: false;
  external_calls: false;
} {
  return {
    label: "Paste destination",
    targets: ["Codex active request", "Claude Code active request"],
    instruction:
      "paste the copied continuation brief into the active agent request box",
    reason:
      "keeps Loopdeck as the local handoff source while the user controls submission",
    auto_submit: false,
    writes_files: false,
    external_calls: false,
  };
}

function handoffChecklistFor(): {
  label: "Continuation handoff checklist";
  steps: [
    "copy selected continuation brief",
    "paste into Codex or Claude Code active request",
    "submit manually after review",
    "collect the next loop snapshot after the agent turn",
  ];
  reason: "keeps continuation handoff explicit without automating agent UI or reading transcripts";
  writes_files: false;
  external_calls: false;
} {
  return {
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
  };
}

function postHandoffReminderFor(): {
  label: "Post-handoff reminder";
  collect_next: "collect a new loop snapshot after the next agent turn";
  not_memory_approval: "memory approval remains a separate explicit review";
  not_merge: "merge remains a separate review-before-merge decision";
  reason: "continuation handoff records the next loop before any memory approval or merge decision";
  writes_files: false;
  external_calls: false;
} {
  return {
    label: "Post-handoff reminder",
    collect_next: "collect a new loop snapshot after the next agent turn",
    not_memory_approval: "memory approval remains a separate explicit review",
    not_merge: "merge remains a separate review-before-merge decision",
    reason:
      "continuation handoff records the next loop before any memory approval or merge decision",
    writes_files: false,
    external_calls: false,
  };
}

function sourceOfTruthNoteFor(): {
  label: "Source-of-truth note";
  local_memory_input: "next loop snapshot is the source of truth for local loop memory";
  not_transcript_import: "transcript import is not used as the source of truth";
  reason: "Loopdeck records explicit loop snapshots instead of importing agent transcripts";
  stores_transcripts: false;
  writes_files: false;
  external_calls: false;
} {
  return {
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
  };
}

function privacyBoundaryNoteFor(): {
  label: "Privacy boundary";
  storage_scope: "stores loop metadata in the local database and Markdown archive only";
  does_not_store: "does not store prompt bodies, transcripts, raw paths, or provider credentials";
  reason: "keeps source-of-truth loop memory local-first and reviewable";
  local_only: true;
  writes_files: false;
  external_calls: false;
} {
  return {
    label: "Privacy boundary",
    storage_scope:
      "stores loop metadata in the local database and Markdown archive only",
    does_not_store:
      "does not store prompt bodies, transcripts, raw paths, or provider credentials",
    reason: "keeps source-of-truth loop memory local-first and reviewable",
    local_only: true,
    writes_files: false,
    external_calls: false,
  };
}

function operatorReviewGateFor(): {
  label: "Operator review gate";
  review_step: "operator reviews the copied continuation brief before submitting";
  manual_submit: "submission remains manual in Codex or Claude Code";
  does_not: "does not auto-submit prompts, execute commands, write files, or change merge state";
  auto_submit: false;
  writes_files: false;
  external_calls: false;
} {
  return {
    label: "Operator review gate",
    review_step:
      "operator reviews the copied continuation brief before submitting",
    manual_submit: "submission remains manual in Codex or Claude Code",
    does_not:
      "does not auto-submit prompts, execute commands, write files, or change merge state",
    auto_submit: false,
    writes_files: false,
    external_calls: false,
  };
}

function collectionResponsibilityNoteFor(): {
  label: "Collection responsibility";
  responsible_party: "operator collects the next loop snapshot after the agent turn";
  trigger: "collection starts only when the operator runs the loop collection flow";
  does_not: "does not watch transcripts, scrape agent UI, or collect in the background";
  automatic_collection: false;
  writes_files: false;
  external_calls: false;
} {
  return {
    label: "Collection responsibility",
    responsible_party:
      "operator collects the next loop snapshot after the agent turn",
    trigger:
      "collection starts only when the operator runs the loop collection flow",
    does_not:
      "does not watch transcripts, scrape agent UI, or collect in the background",
    automatic_collection: false,
    writes_files: false,
    external_calls: false,
  };
}

function preMergeAdvisoryFor(): {
  label: "Pre-merge advisory";
  hold_merge: "hold merge decisions until the next loop snapshot is collected and reviewed";
  reason: "continuation handoff can change readiness after the next agent turn";
  not_memory_approval: "memory approval remains separate from merge readiness";
  writes_merge_decision: false;
  writes_files: false;
  external_calls: false;
} {
  return {
    label: "Pre-merge advisory",
    hold_merge:
      "hold merge decisions until the next loop snapshot is collected and reviewed",
    reason:
      "continuation handoff can change readiness after the next agent turn",
    not_memory_approval:
      "memory approval remains separate from merge readiness",
    writes_merge_decision: false,
    writes_files: false,
    external_calls: false,
  };
}

function postCollectionReviewNoteFor(): {
  label: "Post-collection review";
  review_step: "review the collected loop snapshot quality and evidence before approval";
  before_memory_approval: "approve memory only after the collected snapshot is reviewed";
  before_merge: "merge readiness can be reconsidered after post-collection review";
  writes_memory: false;
  writes_merge_decision: false;
  external_calls: false;
} {
  return {
    label: "Post-collection review",
    review_step:
      "review the collected loop snapshot quality and evidence before approval",
    before_memory_approval:
      "approve memory only after the collected snapshot is reviewed",
    before_merge:
      "merge readiness can be reconsidered after post-collection review",
    writes_memory: false,
    writes_merge_decision: false,
    external_calls: false,
  };
}

function selectedBriefCommand(selection: {
  worktree: string;
  sessionId?: string;
  branch?: string;
}): string {
  const parts = [
    "prompt-coach",
    "loop",
    "brief",
    "--worktree",
    selection.worktree,
  ];
  if (selection.sessionId) parts.push("--session", selection.sessionId);
  if (selection.branch) parts.push("--branch", selection.branch);
  return parts.join(" ");
}

function readinessSummaryFor(
  mergeReadiness: LoopdeckStatusActivityMergeReadiness,
): {
  label: "Readiness summary";
  status: LoopdeckStatusActivityMergeReadiness["status"];
  reason:
    | "selected worktree has recorded evidence and passing outcome"
    | "latest selected worktree outcome is not passing"
    | "latest selected worktree outcome has no evidence refs";
  next_action: LoopdeckStatusActivityMergeReadiness["next_action"];
} {
  if (mergeReadiness.status === "missing_evidence") {
    return {
      label: "Readiness summary",
      status: mergeReadiness.status,
      reason: "latest selected worktree outcome has no evidence refs",
      next_action: mergeReadiness.next_action,
    };
  }

  if (mergeReadiness.status === "needs_review") {
    return {
      label: "Readiness summary",
      status: mergeReadiness.status,
      reason: "latest selected worktree outcome is not passing",
      next_action: mergeReadiness.next_action,
    };
  }

  return {
    label: "Readiness summary",
    status: mergeReadiness.status,
    reason: "selected worktree has recorded evidence and passing outcome",
    next_action: mergeReadiness.next_action,
  };
}

function briefRationaleFor(
  mergeReadiness: LoopdeckStatusActivityMergeReadiness,
): {
  label: "Brief rationale";
  merge_readiness: LoopdeckStatusActivityMergeReadiness["status"];
  reason:
    | "selected brief continues a ready worktree after evidence comparison"
    | "selected brief continues review work without marking it merge-ready"
    | "selected brief can continue evidence collection before merge";
  next_action: "copy selected continuation brief";
  merge_gate: LoopdeckStatusActivityMergeReadiness["next_action"];
} {
  if (mergeReadiness.status === "missing_evidence") {
    return {
      label: "Brief rationale",
      merge_readiness: mergeReadiness.status,
      reason: "selected brief can continue evidence collection before merge",
      next_action: "copy selected continuation brief",
      merge_gate: mergeReadiness.next_action,
    };
  }

  if (mergeReadiness.status === "needs_review") {
    return {
      label: "Brief rationale",
      merge_readiness: mergeReadiness.status,
      reason:
        "selected brief continues review work without marking it merge-ready",
      next_action: "copy selected continuation brief",
      merge_gate: mergeReadiness.next_action,
    };
  }

  return {
    label: "Brief rationale",
    merge_readiness: mergeReadiness.status,
    reason: "selected brief continues a ready worktree after evidence comparison",
    next_action: "copy selected continuation brief",
    merge_gate: mergeReadiness.next_action,
  };
}

function evidenceCountExplanationFor(evidenceCount: number): {
  label: "Evidence count";
  count: number;
  reason:
    | "selected worktree has evidence refs recorded"
    | "selected worktree has no evidence refs recorded";
  next_action:
    | "compare evidence before merge"
    | "record loop outcome evidence";
} {
  if (evidenceCount === 0) {
    return {
      label: "Evidence count",
      count: evidenceCount,
      reason: "selected worktree has no evidence refs recorded",
      next_action: "record loop outcome evidence",
    };
  }

  return {
    label: "Evidence count",
    count: evidenceCount,
    reason: "selected worktree has evidence refs recorded",
    next_action: "compare evidence before merge",
  };
}

function requireLoopMemoryReadStorage(
  storage: LoopRouteOptions["storage"],
  instance: string,
): LoopMemoryStoragePort {
  if (!storage.listLoopMemories) {
    throw problem(
      500,
      "Internal Server Error",
      "Loop memory storage is not configured.",
      instance,
    );
  }

  return storage as LoopMemoryStoragePort;
}

function requireLoopMemoryApprovalStorage(
  storage: LoopRouteOptions["storage"],
  instance: string,
): LoopSnapshotStoragePort & LoopMemoryStoragePort {
  if (
    !storage.getLatestLoopSnapshot ||
    !storage.recordLoopMemory ||
    !storage.listLoopMemories
  ) {
    throw problem(
      500,
      "Internal Server Error",
      "Loop memory approval storage is not configured.",
      instance,
    );
  }

  return storage as LoopSnapshotStoragePort & LoopMemoryStoragePort;
}

function hasApprovedMemoryForSnapshot(
  memories: readonly { snapshot_id: string }[],
  snapshotId: string,
): boolean {
  return memories.some((memory) => memory.snapshot_id === snapshotId);
}
