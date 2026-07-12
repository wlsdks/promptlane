import type { FastifyInstance } from "fastify";
import { z } from "zod";

import { createBenchmarkCandidateReport } from "../../analysis/benchmark-candidates.js";

import {
  createLoopBrief,
  latestCompactBoundaryAfterSnapshot,
} from "../../loop/brief.js";
import {
  parseInstructionPatchTarget,
  proposeInstructionPatchFromMemory,
} from "../../loop/instruction-patch.js";
import {
  createLoopRelayCommandCenter,
  createLoopRelayStatus,
  type LoopRelayStatusActivityMergeReadiness,
  toLoopRelayStatusSnapshot,
} from "../../loop/status.js";
import { CONTINUATION_SAFETY } from "../../loop/continuation-safety.js";
import { decideLoopMemoryCandidate } from "../../loop/memory-candidate.js";
import {
  LoopOutcomeAttributionError,
  parseLoopOutcomeInput,
} from "../../loop/outcome.js";
import {
  hasLoopSnapshotSelection,
  loopBriefNoSnapshotCliMessage,
  loopInstructionPatchNoMemoryCliMessage,
  loopMemoryNoSnapshotCliMessage,
  selectLoopSnapshot,
  selectedLoopSnapshotNotFoundMessage,
} from "../../loop/snapshot-selection.js";
import type {
  CompactBoundaryStoragePort,
  ContinuationReceiptStoragePort,
  LoopMergeDecisionStoragePort,
  LoopMemoryStoragePort,
  LoopSnapshotStoragePort,
  PromptReadStoragePort,
} from "../../storage/ports.js";
import { requireAppAccess, type ServerAuthConfig } from "../auth.js";
import { problem } from "../errors.js";
import { requireStorageCapabilities } from "../storage-capabilities.js";
import {
  commandDistinctionFor,
  commandFiltersFor,
  commandHintProvenance,
  copySideEffectsFor,
  evidenceCountExplanationFor,
  readinessSummaryFor,
  selectedBriefActionFor,
  selectionScopeFor,
  snapshotAgeFor,
} from "../loop-detail-guidance.js";

export type LoopRouteOptions = {
  auth: ServerAuthConfig;
  storage: Partial<
    LoopSnapshotStoragePort &
      CompactBoundaryStoragePort &
      LoopMemoryStoragePort &
      LoopMergeDecisionStoragePort &
      PromptReadStoragePort &
      ContinuationReceiptStoragePort
  >;
};

type LoopMemoryReadRouteStorage = Pick<
  LoopMemoryStoragePort,
  "listLoopMemories"
>;

type LoopMemoryApprovalRouteStorage = Pick<
  LoopSnapshotStoragePort,
  "listLoopSnapshots"
> &
  Pick<LoopMemoryStoragePort, "recordLoopMemory" | "listLoopMemories">;

type LoopOutcomeRouteStorage = Pick<
  LoopSnapshotStoragePort,
  "recordLoopOutcome"
>;

type LoopReadRouteStorage = Pick<LoopSnapshotStoragePort, "listLoopSnapshots"> &
  Pick<PromptReadStoragePort, "getPrompt"> &
  Pick<CompactBoundaryStoragePort, "listCompactBoundaries"> &
  Pick<LoopMemoryStoragePort, "listLoopMemories"> &
  Pick<LoopMergeDecisionStoragePort, "listLoopMergeDecisions">;

type LoopBriefRouteStorage = LoopReadRouteStorage &
  Pick<ContinuationReceiptStoragePort, "recordContinuationReceipt">;

const LoopMemoryApprovalBodySchema = z.object({
  approved_by: z.string().trim().min(1).max(80).optional(),
  snapshot_id: z.string().trim().min(1).max(120).optional(),
});

const LoopOutcomeBodySchema = z.object({
  status: z.string(),
  summary: z.string().max(1_000),
  evidence_refs: z.array(z.string().max(200)).max(20).optional(),
  used_improvement_prompt_ids: z
    .array(z.string().trim().min(1).max(120))
    .max(100)
    .optional(),
});

const LoopBriefSelectionQuerySchema = z.object({
  worktree: z.string().trim().min(1).optional(),
  session_id: z.string().trim().min(1).optional(),
  branch: z.string().trim().min(1).optional(),
});

const LoopBriefCreateBodySchema = z.object({
  snapshot_id: z.string().trim().min(1).max(120).optional(),
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
    const storage = requireLoopReadStorage(options.storage, request.url);

    const snapshots = storage.listLoopSnapshots({ limit: 100 }).items;
    const boundaries = storage.listCompactBoundaries({ limit: 100 }).items;
    const latest = snapshots.at(0);
    const projectMemories = latest
      ? storage.listLoopMemories({
          projectId: latest.project_id,
        }).items
      : [];
    const status = createLoopRelayStatus({
      snapshots,
      compactBoundaries: boundaries,
      projectMemoryCount: projectMemories.length,
      memoryCandidate:
        latest && !hasApprovedMemoryForSnapshot(projectMemories, latest.id)
          ? decideLoopMemoryCandidate(latest)
          : undefined,
      mergeDecisions: latest
        ? storage.listLoopMergeDecisions({
            limit: 3,
            projectId: latest.project_id,
          }).items
        : [],
    });

    return {
      data: {
        status,
        benchmark_readiness: createBenchmarkCandidateReport(
          snapshots,
          5,
          (promptId) => storage.getPrompt(promptId) !== undefined,
        ),
        items: snapshots.map((snapshot) => {
          const compactBoundary = latestCompactBoundaryAfterSnapshot(
            snapshot,
            boundaries,
          );

          return {
            ...toLoopRelayStatusSnapshot(snapshot),
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
    const storage = requireLoopReadStorage(options.storage, request.url);
    const params = request.params as { worktree: string };
    const query = request.query as { branch?: string; session_id?: string };
    const allSnapshots = storage.listLoopSnapshots({ limit: 100 }).items;
    const snapshots =
      allSnapshots.filter(
        (snapshot) =>
          snapshot.worktree_label === params.worktree &&
          (!query.session_id || snapshot.session_id === query.session_id) &&
          (!query.branch || snapshot.branch === query.branch),
      ) ?? [];
    const boundaries = storage.listCompactBoundaries({ limit: 100 }).items;
    const latestSnapshot = snapshots.at(0);
    const projectMemories = latestSnapshot
      ? storage.listLoopMemories({
          projectId: latestSnapshot.project_id,
        }).items
      : [];
    const memoryApproved = latestSnapshot
      ? hasApprovedMemoryForSnapshot(projectMemories, latestSnapshot.id)
      : false;
    const memoryCandidate =
      latestSnapshot && !memoryApproved
        ? decideLoopMemoryCandidate(latestSnapshot)
        : undefined;
    const latestDecision = latestSnapshot
      ? storage
          .listLoopMergeDecisions({
            limit: 1,
            projectId: latestSnapshot.project_id,
            worktree: params.worktree,
          })
          .items.at(0)
      : undefined;
    const mergeDecisions = latestSnapshot
      ? storage.listLoopMergeDecisions({
          limit: 3,
          projectId: latestSnapshot.project_id,
        }).items
      : [];
    const reviewStatus = latestSnapshot
      ? createLoopRelayStatus({
          snapshots: allSnapshots,
          compactBoundaries: boundaries,
          projectMemoryCount: projectMemories.length,
          mergeDecisions,
        })
      : undefined;
    const commandCenter =
      reviewStatus?.activity.command_center ??
      (reviewStatus
        ? createLoopRelayCommandCenter(
            reviewStatus.activity.worktrees,
            mergeDecisions,
          )
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
              memory_approved: memoryApproved,
              ...(memoryCandidate
                ? {
                    memory_candidate: {
                      eligible: memoryCandidate.eligible,
                      reason: memoryCandidate.reason,
                      next_action: "looprelay loop memory-approve" as const,
                    },
                  }
                : {}),
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
              continuation_safety: CONTINUATION_SAFETY,
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
                brief_rationale: briefRationaleFor(reviewItem.merge_readiness),
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
          ...toLoopRelayStatusSnapshot(snapshot),
          prompt_ids: snapshot.prompt_ids,
          used_improvement_prompt_ids:
            snapshot.outcome.used_improvement_prompt_ids ?? [],
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
    const storage = requireLoopReadStorage(options.storage, request.url);
    const query = LoopBriefSelectionQuerySchema.parse(request.query);
    const selection = {
      worktree: query.worktree,
      sessionId: query.session_id,
      branch: query.branch,
    };
    const snapshots = storage.listLoopSnapshots({ limit: 100 }).items;
    const snapshot = hasLoopSnapshotSelection(selection)
      ? selectLoopSnapshot(snapshots, selection)
      : snapshots.at(0);

    if (!snapshot) {
      throw problem(
        404,
        "Not Found",
        hasLoopSnapshotSelection(selection)
          ? selectedLoopSnapshotNotFoundMessage(selection)
          : loopBriefNoSnapshotCliMessage(),
        request.url,
      );
    }

    const boundaries = storage.listCompactBoundaries({ limit: 100 }).items;

    return {
      data: createLoopBrief({
        snapshot,
        compactBoundary: latestCompactBoundaryAfterSnapshot(
          snapshot,
          boundaries,
        ),
        approvedMemories: storage.listLoopMemories({
          projectId: snapshot.project_id,
          limit: 3,
        }).items,
      }),
    };
  });

  server.get("/api/v1/loops/:id/brief", async (request) => {
    requireAppAccess(request, options.auth);
    const storage = requireLoopReadStorage(options.storage, request.url);
    const params = request.params as { id: string };
    const snapshots = storage.listLoopSnapshots({ limit: 100 }).items;
    const snapshot = snapshots.find((item) => item.id === params.id);

    if (!snapshot) {
      throw problem(
        404,
        "Not Found",
        "Loop snapshot not found. Run `looprelay loop collect` after the next Codex or Claude Code turn, then retry `looprelay loop brief` for the latest safe continuation brief.",
        request.url,
      );
    }

    const boundaries = storage.listCompactBoundaries({ limit: 100 }).items;

    return {
      data: createLoopBrief({
        snapshot,
        compactBoundary: latestCompactBoundaryAfterSnapshot(
          snapshot,
          boundaries,
        ),
        approvedMemories: storage.listLoopMemories({
          projectId: snapshot.project_id,
          limit: 3,
        }).items,
      }),
    };
  });

  server.post("/api/v1/loops/brief", async (request) => {
    requireAppAccess(request, options.auth, { csrf: true });
    const storage = requireLoopBriefStorage(options.storage, request.url);
    const body = LoopBriefCreateBodySchema.parse(request.body ?? {});
    const selection = {
      worktree: body.worktree,
      sessionId: body.session_id,
      branch: body.branch,
    };
    if (body.snapshot_id && hasLoopSnapshotSelection(selection)) {
      throw problem(
        400,
        "Bad Request",
        "Use either snapshot_id or worktree/session/branch filters, not both.",
        request.url,
      );
    }
    const snapshots = storage.listLoopSnapshots({ limit: 100 }).items;
    const snapshot = body.snapshot_id
      ? snapshots.find((item) => item.id === body.snapshot_id)
      : hasLoopSnapshotSelection(selection)
        ? selectLoopSnapshot(snapshots, selection)
        : snapshots.at(0);
    if (!snapshot) {
      throw problem(
        404,
        "Not Found",
        hasLoopSnapshotSelection(selection)
          ? selectedLoopSnapshotNotFoundMessage(selection)
          : loopBriefNoSnapshotCliMessage(),
        request.url,
      );
    }
    const receipt = storage.recordContinuationReceipt({
      snapshot_id: snapshot.id,
    });
    return {
      data: createLoopBrief({
        snapshot,
        compactBoundary: latestCompactBoundaryAfterSnapshot(
          snapshot,
          storage.listCompactBoundaries({ limit: 100 }).items,
        ),
        approvedMemories: storage.listLoopMemories({
          projectId: snapshot.project_id,
          limit: 3,
        }).items,
        receipt: {
          id: receipt.id,
          snapshot_id: receipt.snapshot_id,
          policy_version: receipt.policy_version,
          created_at: receipt.created_at,
          status: "generated",
        },
      }),
    };
  });

  server.patch("/api/v1/loops/receipts/:id", async (request) => {
    requireAppAccess(request, options.auth, { csrf: true });
    const storage = requireStorageCapabilities(
      options.storage,
      ["updateContinuationReceipt"],
      { label: "Continuation receipt storage", instance: request.url },
    );
    const params = request.params as { id: string };
    const body = z
      .object({
        status: z.enum([
          "copied",
          "delivered",
          "followed",
          "partial",
          "ignored",
        ]),
        target_correct: z.boolean().optional(),
        first_action_correct: z.boolean().optional(),
        deviation_reason: z.string().trim().max(500).optional(),
        first_value_seconds: z.number().int().min(0).optional(),
        friction_score: z.number().int().min(0).max(3).optional(),
      })
      .parse(request.body ?? {});
    let receipt;
    try {
      receipt = storage.updateContinuationReceipt(params.id, body);
    } catch (error) {
      throw problem(
        400,
        "Bad Request",
        error instanceof Error
          ? error.message
          : "Invalid continuation receipt.",
        request.url,
      );
    }
    if (!receipt) {
      throw problem(
        404,
        "Not Found",
        "Continuation receipt not found.",
        request.url,
      );
    }
    return { data: receipt };
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
        loopInstructionPatchNoMemoryCliMessage(
          `looprelay loop instruction-patch --target-file ${targetFile}`,
        ),
        request.url,
      );
    }

    return {
      data: proposeInstructionPatchFromMemory({ memory, targetFile }),
    };
  });

  server.post("/api/v1/loops/:id/outcome", async (request) => {
    requireAppAccess(request, options.auth, { csrf: true });
    const storage = requireLoopOutcomeStorage(options.storage, request.url);
    const params = request.params as { id: string };
    const body = LoopOutcomeBodySchema.parse(request.body ?? {});
    const parsed = parseLoopOutcomeInput({
      status: body.status,
      summary: body.summary,
      evidenceRefs: body.evidence_refs,
      usedImprovementPromptIds: body.used_improvement_prompt_ids,
    });
    if (!parsed.ok) {
      throw problem(400, "Bad Request", parsed.message, request.url);
    }

    let snapshot;
    try {
      snapshot = storage.recordLoopOutcome(params.id, parsed.outcome);
    } catch (error) {
      if (error instanceof LoopOutcomeAttributionError) {
        throw problem(400, "Bad Request", error.message, request.url);
      }
      throw error;
    }
    if (!snapshot) {
      throw problem(404, "Not Found", "Loop snapshot not found.", request.url);
    }

    return {
      data: {
        recorded: true as const,
        snapshot_id: snapshot.id,
        outcome: snapshot.outcome,
        next_actions: [
          "looprelay loop memory-candidate",
          "looprelay loop brief",
        ],
        privacy: {
          local_only: true as const,
          returns_prompt_bodies: false as const,
          returns_raw_paths: false as const,
          external_calls: false as const,
          auto_approves_memory: false as const,
        },
      },
    };
  });

  server.post("/api/v1/loops/memory/approve", async (request) => {
    requireAppAccess(request, options.auth, { csrf: true });
    const storage = requireLoopMemoryApprovalStorage(
      options.storage,
      request.url,
    );
    const body = LoopMemoryApprovalBodySchema.parse(request.body ?? {});
    const snapshots = storage.listLoopSnapshots({ limit: 100 }).items;
    const selected = body.snapshot_id
      ? snapshots.find((snapshot) => snapshot.id === body.snapshot_id)
      : snapshots.at(0);

    if (!selected) {
      throw problem(
        404,
        "Not Found",
        loopMemoryNoSnapshotCliMessage("looprelay loop memory-approve"),
        request.url,
      );
    }

    const decision = decideLoopMemoryCandidate(selected);
    if (!decision.eligible || !decision.candidate) {
      throw problem(
        409,
        "Conflict",
        `Selected loop memory candidate is not eligible: ${decision.reason}.`,
        request.url,
      );
    }
    const existingMemories = storage.listLoopMemories({
      projectId: selected.project_id,
    }).items;
    if (hasApprovedMemoryForSnapshot(existingMemories, selected.id)) {
      throw problem(
        409,
        "Conflict",
        "Selected loop memory candidate is already approved.",
        request.url,
      );
    }

    const memory = storage.recordLoopMemory({
      snapshot_id: selected.id,
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
    };
  });
}

function briefRationaleFor(
  mergeReadiness: LoopRelayStatusActivityMergeReadiness,
): {
  label: "Brief rationale";
  merge_readiness: LoopRelayStatusActivityMergeReadiness["status"];
  reason:
    | "selected brief continues a ready worktree after evidence comparison"
    | "selected brief continues review work without marking it merge-ready"
    | "selected brief can continue evidence collection before merge";
  next_action: "copy selected continuation brief";
  merge_gate: LoopRelayStatusActivityMergeReadiness["next_action"];
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
    reason:
      "selected brief continues a ready worktree after evidence comparison",
    next_action: "copy selected continuation brief",
    merge_gate: mergeReadiness.next_action,
  };
}

function requireLoopMemoryReadStorage(
  storage: LoopRouteOptions["storage"],
  instance: string,
): LoopMemoryReadRouteStorage {
  return requireStorageCapabilities(storage, ["listLoopMemories"], {
    label: "Loop memory storage",
    instance,
  });
}

function requireLoopReadStorage(
  storage: LoopRouteOptions["storage"],
  instance: string,
): LoopReadRouteStorage {
  return requireStorageCapabilities(
    storage,
    [
      "listLoopSnapshots",
      "getPrompt",
      "listCompactBoundaries",
      "listLoopMemories",
      "listLoopMergeDecisions",
    ],
    { label: "Loop read storage", instance },
  );
}

function requireLoopBriefStorage(
  storage: LoopRouteOptions["storage"],
  instance: string,
): LoopBriefRouteStorage {
  return requireStorageCapabilities(
    storage,
    [
      "listLoopSnapshots",
      "getPrompt",
      "listCompactBoundaries",
      "listLoopMemories",
      "listLoopMergeDecisions",
      "recordContinuationReceipt",
    ],
    { label: "Loop brief storage", instance },
  );
}

function requireLoopMemoryApprovalStorage(
  storage: LoopRouteOptions["storage"],
  instance: string,
): LoopMemoryApprovalRouteStorage {
  return requireStorageCapabilities(
    storage,
    ["listLoopSnapshots", "recordLoopMemory", "listLoopMemories"],
    { label: "Loop memory approval storage", instance },
  );
}

function requireLoopOutcomeStorage(
  storage: LoopRouteOptions["storage"],
  instance: string,
): LoopOutcomeRouteStorage {
  return requireStorageCapabilities(storage, ["recordLoopOutcome"], {
    label: "Loop outcome storage",
    instance,
  });
}

function hasApprovedMemoryForSnapshot(
  memories: readonly { snapshot_id: string }[],
  snapshotId: string,
): boolean {
  return memories.some((memory) => memory.snapshot_id === snapshotId);
}
