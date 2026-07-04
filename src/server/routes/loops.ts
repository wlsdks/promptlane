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
