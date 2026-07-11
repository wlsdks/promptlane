import { latestCompactBoundaryAfterSnapshot } from "./brief.js";
import type { LoopBriefCompactBoundary } from "./brief.js";
import type { LoopMemoryCandidateDecision } from "./memory-candidate.js";
import type { LoopSnapshot } from "./types.js";
import { quoteForShell } from "../shared/shell-quote.js";

export type LoopRelayStatusLevel = "ready" | "empty";

export type LoopRelayStatusPrivacy = {
  local_only: true;
  external_calls: false;
  returns_prompt_bodies: false;
  returns_raw_paths: false;
  returns_compact_content: false;
};

export type LoopRelayStatusSnapshot = {
  id: string;
  created_at: string;
  tool: string;
  source: string;
  project: string;
  branch?: string;
  worktree?: string;
  prompt_count: number;
  prompt_ids?: string[];
  average_prompt_score?: number;
  top_gaps: string[];
  outcome_status: LoopSnapshot["outcome"]["status"];
};

export type LoopRelayStatusProjectMemory = {
  approved_count: number;
  included_in_brief: boolean;
};

export type LoopRelayStatusMemoryCandidate = {
  eligible: boolean;
  reason: LoopMemoryCandidateDecision["reason"];
  next_action:
    | "looprelay loop memory-approve"
    | "looprelay loop memory-candidate";
};

export type LoopRelayStatusActivityWorktree = {
  worktree: string;
  branch?: string;
  sessions: number;
  snapshots: number;
  latest_snapshot_id: string;
  latest_created_at: string;
  latest_outcome_status: LoopSnapshot["outcome"]["status"];
  evidence_count: number;
};

export type LoopRelayStatusActivityMergeReadiness = {
  status: "ready" | "needs_review" | "missing_evidence";
  evidence: "evidence present" | "missing evidence";
  next_action:
    | "compare evidence before merge"
    | "review outcome before merge"
    | "record loop outcome evidence";
};

export type LoopRelayStatusActivityCommandCenterItem =
  LoopRelayStatusActivityWorktree & {
    recommendation: "review before merge" | "ready for continuation";
    continuation_command: string;
    merge_readiness: LoopRelayStatusActivityMergeReadiness;
  };

export type LoopRelayStatusActivityReviewPacket = {
  title: "Review-before-merge packet";
  status: "ready" | "needs_review" | "blocked";
  summary: string;
  next_action:
    | "compare ready evidence before merge"
    | "review non-passing worktrees before merge"
    | "record missing evidence before merge";
  decision_advisory?: {
    summary: string;
    next_action:
      | "honor recent continue decision before merge"
      | "honor recent defer decision before merge"
      | "confirm recent merge decision before merge";
  };
  ready_count: number;
  needs_review_count: number;
  missing_evidence_count: number;
  actions: LoopRelayStatusActivityMergeReadiness["next_action"][];
  checklist: Array<{
    label:
      | "Record missing evidence before merge"
      | "Review non-passing worktrees before merge"
      | "Compare ready evidence before merge";
    status: "required";
    action: LoopRelayStatusActivityMergeReadiness["next_action"];
  }>;
};

export type LoopRelayStatusActivityCommandCenter = {
  title: "Multi-worktree review";
  primary_action: string;
  review_packet: LoopRelayStatusActivityReviewPacket;
  review_items: LoopRelayStatusActivityCommandCenterItem[];
};

export type LoopRelayStatusActivityRecentDecision = {
  snapshot_id: string;
  worktree: string;
  decision: "merge" | "continue" | "defer";
  reason: string;
  decided_by: string;
  created_at: string;
};

export type LoopRelayStatusActivity = {
  active_worktrees: number;
  active_sessions: number;
  latest_branch?: string;
  latest_worktree?: string;
  needs_review: boolean;
  next_action:
    | "create first local loop snapshot"
    | "compare loop snapshots by worktree before merging agent output"
    | "continue current worktree loop";
  recent_decisions?: LoopRelayStatusActivityRecentDecision[];
  worktrees: LoopRelayStatusActivityWorktree[];
  command_center?: LoopRelayStatusActivityCommandCenter;
};

export type LoopRelayFailurePattern = {
  pattern: string;
  occurrences: number;
  outcome_statuses: Array<"failed" | "blocked" | "abandoned">;
  next_action: string;
};

export type LoopRelayStatus = {
  status: LoopRelayStatusLevel;
  snapshot_count: number;
  activity: LoopRelayStatusActivity;
  project_memory: LoopRelayStatusProjectMemory;
  memory_candidate?: LoopRelayStatusMemoryCandidate;
  failure_patterns?: LoopRelayFailurePattern[];
  latest_snapshot?: LoopRelayStatusSnapshot;
  latest_compact_boundary?: LoopBriefCompactBoundary;
  next_action: string;
  next_actions: string[];
  privacy: LoopRelayStatusPrivacy;
};

type CompactBoundaryCandidate = Parameters<
  typeof latestCompactBoundaryAfterSnapshot
>[1][number];

export function createLoopRelayStatus(input: {
  snapshots: readonly LoopSnapshot[];
  compactBoundaries: readonly CompactBoundaryCandidate[];
  includeLatest?: boolean;
  projectMemoryCount?: number;
  memoryCandidate?: Pick<
    LoopMemoryCandidateDecision,
    "eligible" | "reason" | "snapshot_id"
  >;
  mergeDecisions?: readonly LoopRelayStatusActivityRecentDecision[];
}): LoopRelayStatus {
  const latest = input.snapshots.at(0);
  const projectMemoryCount = input.projectMemoryCount ?? 0;
  const compactBoundary = latest
    ? latestCompactBoundaryAfterSnapshot(latest, input.compactBoundaries)
    : undefined;
  const hasSnapshots = input.snapshots.length > 0;
  const nextAction = compactBoundary
    ? "looprelay loop collect"
    : hasSnapshots
      ? "looprelay loop brief"
      : "looprelay loop collect";
  const activity = summarizeLoopActivity(
    input.snapshots,
    input.mergeDecisions ?? [],
  );
  const failurePatterns = summarizeFailurePatterns(input.snapshots);

  return {
    status: hasSnapshots ? "ready" : "empty",
    snapshot_count: input.snapshots.length,
    activity,
    project_memory: {
      approved_count: projectMemoryCount,
      included_in_brief: Boolean(latest && projectMemoryCount > 0),
    },
    ...(failurePatterns.length > 0
      ? { failure_patterns: failurePatterns }
      : {}),
    ...(input.memoryCandidate
      ? {
          memory_candidate: toLoopRelayStatusMemoryCandidate(
            input.memoryCandidate,
          ),
        }
      : {}),
    ...(latest && input.includeLatest !== false
      ? {
          latest_snapshot: toLoopRelayStatusSnapshot(latest, {
            includePromptIds: true,
          }),
        }
      : {}),
    ...(compactBoundary ? { latest_compact_boundary: compactBoundary } : {}),
    next_action: nextAction,
    next_actions: nextActionsForStatus({
      hasSnapshots,
      latest,
      compactBoundary,
      memoryCandidate: input.memoryCandidate,
      activity,
    }),
    privacy: looprelayStatusPrivacy(),
  };
}

export function summarizeFailurePatterns(
  snapshots: readonly LoopSnapshot[],
): LoopRelayFailurePattern[] {
  const failedStatuses = new Set(["failed", "blocked", "abandoned"] as const);
  const patterns = new Map<
    string,
    { occurrences: number; statuses: Set<"failed" | "blocked" | "abandoned"> }
  >();

  for (const snapshot of snapshots) {
    if (
      !failedStatuses.has(
        snapshot.outcome.status as "failed" | "blocked" | "abandoned",
      )
    ) {
      continue;
    }
    for (const rawGap of new Set(snapshot.quality.top_gaps)) {
      const pattern = rawGap.trim();
      if (!pattern || /(?:\/Users\/|\/home\/|sk-|gh[pousr]_)/i.test(pattern)) {
        continue;
      }
      const current = patterns.get(pattern) ?? {
        occurrences: 0,
        statuses: new Set<"failed" | "blocked" | "abandoned">(),
      };
      current.occurrences += 1;
      current.statuses.add(
        snapshot.outcome.status as "failed" | "blocked" | "abandoned",
      );
      patterns.set(pattern, current);
    }
  }

  return [...patterns.entries()]
    .filter(([, value]) => value.occurrences >= 2)
    .sort((left, right) => right[1].occurrences - left[1].occurrences)
    .slice(0, 5)
    .map(([pattern, value]) => ({
      pattern,
      occurrences: value.occurrences,
      outcome_statuses: [...value.statuses],
      next_action: `Ask for or define ${pattern} before continuing this loop.`,
    }));
}

export function summarizeLoopActivity(
  snapshots: readonly LoopSnapshot[],
  mergeDecisions: readonly LoopRelayStatusActivityRecentDecision[] = [],
): LoopRelayStatusActivity {
  const latest = snapshots.at(0);
  const worktrees = summarizeWorktreeActivity(snapshots);
  const activeWorktrees = worktrees.length;
  const activeSessions = uniqueNonEmpty(
    snapshots.map((snapshot) => snapshot.session_id),
  ).size;
  const needsReview = activeWorktrees > 1;

  return {
    active_worktrees: activeWorktrees,
    active_sessions: activeSessions,
    ...(latest?.branch ? { latest_branch: latest.branch } : {}),
    ...(latest?.worktree_label
      ? { latest_worktree: latest.worktree_label }
      : {}),
    needs_review: needsReview,
    next_action: !latest
      ? "create first local loop snapshot"
      : needsReview
        ? "compare loop snapshots by worktree before merging agent output"
        : "continue current worktree loop",
    ...(mergeDecisions.length > 0
      ? { recent_decisions: mergeDecisions.slice(0, 3).map(toRecentDecision) }
      : {}),
    worktrees,
    ...(needsReview
      ? {
          command_center: createLoopRelayCommandCenter(
            worktrees,
            mergeDecisions,
          ),
        }
      : {}),
  };
}

function toRecentDecision(
  decision: LoopRelayStatusActivityRecentDecision,
): LoopRelayStatusActivityRecentDecision {
  return {
    snapshot_id: decision.snapshot_id,
    worktree: decision.worktree,
    decision: decision.decision,
    reason: decision.reason,
    decided_by: decision.decided_by,
    created_at: decision.created_at,
  };
}

export function createLoopRelayCommandCenter(
  worktrees: LoopRelayStatusActivityWorktree[],
  mergeDecisions: readonly LoopRelayStatusActivityRecentDecision[],
): LoopRelayStatusActivityCommandCenter {
  const reviewItems = worktrees.map((worktree) => ({
    ...worktree,
    recommendation:
      worktree.latest_outcome_status === "passed"
        ? ("ready for continuation" as const)
        : ("review before merge" as const),
    continuation_command: continuationCommandForWorktree(worktree),
    merge_readiness: mergeReadinessForWorktree(worktree),
  }));
  const primary = reviewItems.find(
    (item) => item.recommendation === "review before merge",
  );

  return {
    title: "Multi-worktree review",
    primary_action: primary
      ? `review ${primary.worktree} before merge`
      : "compare worktrees before merge",
    review_packet: createReviewPacket(reviewItems, mergeDecisions),
    review_items: reviewItems,
  };
}

function createReviewPacket(
  reviewItems: LoopRelayStatusActivityCommandCenterItem[],
  mergeDecisions: readonly LoopRelayStatusActivityRecentDecision[] = [],
): LoopRelayStatusActivityReviewPacket {
  const readyCount = reviewItems.filter(
    (item) => item.merge_readiness.status === "ready",
  ).length;
  const needsReviewCount = reviewItems.filter(
    (item) => item.merge_readiness.status === "needs_review",
  ).length;
  const missingEvidenceCount = reviewItems.filter(
    (item) => item.merge_readiness.status === "missing_evidence",
  ).length;
  const status =
    missingEvidenceCount > 0
      ? ("blocked" as const)
      : needsReviewCount > 0
        ? ("needs_review" as const)
        : ("ready" as const);
  const nextAction =
    status === "blocked"
      ? ("record missing evidence before merge" as const)
      : status === "needs_review"
        ? ("review non-passing worktrees before merge" as const)
        : ("compare ready evidence before merge" as const);
  const actions = [
    ...(missingEvidenceCount > 0
      ? (["record loop outcome evidence"] as const)
      : []),
    ...(needsReviewCount > 0 ? (["review outcome before merge"] as const) : []),
    ...(readyCount > 0 ? (["compare evidence before merge"] as const) : []),
  ];
  const checklist = actions.map((action) => ({
    label: checklistLabelForAction(action),
    status: "required" as const,
    action,
  }));
  const decisionAdvisory = decisionAdvisoryForReviewPacket(
    mergeDecisions,
    reviewItems,
  );

  return {
    title: "Review-before-merge packet",
    status,
    summary: `${readyCount} ready, ${needsReviewCount} needs review, ${missingEvidenceCount} missing evidence`,
    next_action: nextAction,
    ...(decisionAdvisory ? { decision_advisory: decisionAdvisory } : {}),
    ready_count: readyCount,
    needs_review_count: needsReviewCount,
    missing_evidence_count: missingEvidenceCount,
    actions,
    checklist,
  };
}

function decisionAdvisoryForReviewPacket(
  mergeDecisions: readonly LoopRelayStatusActivityRecentDecision[],
  reviewItems: readonly LoopRelayStatusActivityCommandCenterItem[],
): LoopRelayStatusActivityReviewPacket["decision_advisory"] | undefined {
  const worktrees = new Set(reviewItems.map((item) => item.worktree));
  const decision = mergeDecisions.find((item) => worktrees.has(item.worktree));
  if (!decision) return undefined;

  return {
    summary: `recent ${decision.decision} decision recorded for ${decision.worktree}`,
    next_action: decisionAdvisoryNextAction(decision.decision),
  };
}

function decisionAdvisoryNextAction(
  decision: LoopRelayStatusActivityRecentDecision["decision"],
): NonNullable<
  LoopRelayStatusActivityReviewPacket["decision_advisory"]
>["next_action"] {
  if (decision === "merge") {
    return "confirm recent merge decision before merge";
  }
  if (decision === "defer") {
    return "honor recent defer decision before merge";
  }
  return "honor recent continue decision before merge";
}

function checklistLabelForAction(
  action: LoopRelayStatusActivityMergeReadiness["next_action"],
): LoopRelayStatusActivityReviewPacket["checklist"][number]["label"] {
  if (action === "record loop outcome evidence") {
    return "Record missing evidence before merge";
  }
  if (action === "review outcome before merge") {
    return "Review non-passing worktrees before merge";
  }
  return "Compare ready evidence before merge";
}

function mergeReadinessForWorktree(
  worktree: LoopRelayStatusActivityWorktree,
): LoopRelayStatusActivityMergeReadiness {
  if (worktree.evidence_count === 0) {
    return {
      status: "missing_evidence",
      evidence: "missing evidence",
      next_action: "record loop outcome evidence",
    };
  }

  if (worktree.latest_outcome_status !== "passed") {
    return {
      status: "needs_review",
      evidence: "evidence present",
      next_action: "review outcome before merge",
    };
  }

  return {
    status: "ready",
    evidence: "evidence present",
    next_action: "compare evidence before merge",
  };
}

function continuationCommandForWorktree(
  worktree: LoopRelayStatusActivityWorktree,
): string {
  const command = [
    "looprelay",
    "loop",
    "brief",
    "--worktree",
    worktree.worktree,
  ];
  if (worktree.branch) {
    command.push("--branch", worktree.branch);
  }
  return command.map(quoteForShell).join(" ");
}

function summarizeWorktreeActivity(
  snapshots: readonly LoopSnapshot[],
): LoopRelayStatusActivityWorktree[] {
  const explicitWorktreesByBranch = new Map<string, Set<string>>();
  for (const snapshot of snapshots) {
    if (!snapshot.branch || !snapshot.worktree_label) continue;
    const worktrees =
      explicitWorktreesByBranch.get(snapshot.branch) ?? new Set();
    worktrees.add(snapshot.worktree_label);
    explicitWorktreesByBranch.set(snapshot.branch, worktrees);
  }
  const groups = new Map<
    string,
    {
      latest: LoopSnapshot;
      sessions: Set<string>;
      snapshots: number;
    }
  >();

  for (const snapshot of snapshots) {
    const branchWorktrees = snapshot.branch
      ? explicitWorktreesByBranch.get(snapshot.branch)
      : undefined;
    const inferredWorktree =
      branchWorktrees?.size === 1 ? [...branchWorktrees][0] : undefined;
    const worktree = snapshot.worktree_label || inferredWorktree || "unknown";
    const existing = groups.get(worktree);

    if (!existing) {
      groups.set(worktree, {
        latest: snapshot,
        sessions: uniqueNonEmpty([snapshot.session_id]),
        snapshots: 1,
      });
      continue;
    }

    existing.snapshots += 1;
    if (snapshot.session_id) existing.sessions.add(snapshot.session_id);
    if (snapshot.created_at > existing.latest.created_at) {
      existing.latest = snapshot;
    }
  }

  return [...groups.entries()]
    .map(([worktree, group]) => ({
      worktree,
      ...(group.latest.branch ? { branch: group.latest.branch } : {}),
      sessions: group.sessions.size,
      snapshots: group.snapshots,
      latest_snapshot_id: group.latest.id,
      latest_created_at: group.latest.created_at,
      latest_outcome_status: group.latest.outcome.status,
      evidence_count: group.latest.outcome.evidence_refs.length,
    }))
    .sort((left, right) =>
      right.latest_created_at.localeCompare(left.latest_created_at),
    );
}

export function toLoopRelayStatusMemoryCandidate(
  decision: Pick<LoopMemoryCandidateDecision, "eligible" | "reason">,
): LoopRelayStatusMemoryCandidate {
  return {
    eligible: decision.eligible,
    reason: decision.reason,
    next_action: decision.eligible
      ? "looprelay loop memory-approve"
      : "looprelay loop memory-candidate",
  };
}

export function toLoopRelayStatusSnapshot(
  snapshot: LoopSnapshot,
  options: { includePromptIds?: boolean } = {},
): LoopRelayStatusSnapshot {
  return {
    id: snapshot.id,
    created_at: snapshot.created_at,
    tool: snapshot.tool,
    source: snapshot.source,
    project: snapshot.cwd_label,
    ...(snapshot.branch ? { branch: snapshot.branch } : {}),
    ...(snapshot.worktree_label ? { worktree: snapshot.worktree_label } : {}),
    prompt_count: snapshot.event_counts.prompts,
    ...(options.includePromptIds
      ? { prompt_ids: safeAttributionPromptIds(snapshot.prompt_ids) }
      : {}),
    ...(snapshot.quality.average_prompt_score === undefined
      ? {}
      : { average_prompt_score: snapshot.quality.average_prompt_score }),
    top_gaps: snapshot.quality.top_gaps,
    outcome_status: snapshot.outcome.status,
  };
}

export function looprelayStatusPrivacy(): LoopRelayStatusPrivacy {
  return {
    local_only: true,
    external_calls: false,
    returns_prompt_bodies: false,
    returns_raw_paths: false,
    returns_compact_content: false,
  };
}

function nextActionsForStatus(input: {
  hasSnapshots: boolean;
  latest?: LoopSnapshot;
  compactBoundary?: LoopBriefCompactBoundary;
  memoryCandidate?: Pick<LoopMemoryCandidateDecision, "eligible">;
  activity: LoopRelayStatusActivity;
}): string[] {
  if (!input.hasSnapshots) {
    return [
      "Capture one Codex or Claude Code prompt, then run looprelay coach to confirm the first score.",
      "Then run looprelay loop collect to create the first local loop snapshot.",
    ];
  }

  if (input.compactBoundary) {
    return withMemoryCandidateAction(input.memoryCandidate, [
      ...pendingOutcomeActions(input.latest),
      "Run looprelay loop collect again after compaction to refresh the snapshot.",
      "Then use looprelay loop brief or prepare_loop_brief for a continuation prompt.",
    ]);
  }

  return withMemoryCandidateAction(input.memoryCandidate, [
    "Use looprelay loop brief or prepare_loop_brief to get a copy-ready continuation prompt.",
    ...pendingOutcomeActions(input.latest),
    ...selectedContinuationActions(input.activity),
    "Run looprelay loop collect again after the next agent turn to refresh the snapshot.",
  ]);
}

function pendingOutcomeActions(snapshot: LoopSnapshot | undefined): string[] {
  if (
    !snapshot ||
    (snapshot.outcome.status !== "unknown" &&
      snapshot.outcome.status !== "in_progress")
  ) {
    return [];
  }

  const snapshotId = quoteForShell(snapshot.id);
  const attributionAction =
    safeAttributionPromptIds(snapshot.prompt_ids).length > 0
      ? [
          "If a LoopRelay improvement was actually used, add --used-improvement-prompt with one of the latest snapshot prompt ids; otherwise omit attribution.",
        ]
      : [];
  return [
    `When this work reaches a verifiable checkpoint, review snapshot ${snapshotId} in the Loops view or record its outcome with looprelay loop outcome --snapshot-id ${snapshotId}.`,
    ...attributionAction,
  ];
}

function safeAttributionPromptIds(promptIds: readonly string[]): string[] {
  return Array.from(
    new Set(
      promptIds.filter((promptId) => /^prmt_[A-Za-z0-9_-]+$/.test(promptId)),
    ),
  );
}

function selectedContinuationActions(
  activity: LoopRelayStatusActivity,
): string[] {
  return (
    activity.command_center?.review_items.map(
      (item) =>
        `Use selected continuation command: ${item.continuation_command}`,
    ) ?? []
  );
}

function withMemoryCandidateAction(
  memoryCandidate: Pick<LoopMemoryCandidateDecision, "eligible"> | undefined,
  actions: string[],
): string[] {
  if (!memoryCandidate?.eligible) return actions;
  return [
    ...actions,
    "Run looprelay loop memory-approve after reviewing the latest passed loop outcome.",
  ];
}

function uniqueNonEmpty(values: Array<string | undefined>): Set<string> {
  return new Set(values.filter((value): value is string => Boolean(value)));
}
