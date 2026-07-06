import { latestCompactBoundaryAfterSnapshot } from "./brief.js";
import type { LoopBriefCompactBoundary } from "./brief.js";
import type { LoopMemoryCandidateDecision } from "./memory-candidate.js";
import type { LoopSnapshot } from "./types.js";

export type PromptLaneStatusLevel = "ready" | "empty";

export type PromptLaneStatusPrivacy = {
  local_only: true;
  external_calls: false;
  returns_prompt_bodies: false;
  returns_raw_paths: false;
  returns_compact_content: false;
};

export type PromptLaneStatusSnapshot = {
  id: string;
  created_at: string;
  tool: string;
  source: string;
  project: string;
  branch?: string;
  worktree?: string;
  prompt_count: number;
  average_prompt_score?: number;
  top_gaps: string[];
  outcome_status: LoopSnapshot["outcome"]["status"];
};

export type PromptLaneStatusProjectMemory = {
  approved_count: number;
  included_in_brief: boolean;
};

export type PromptLaneStatusMemoryCandidate = {
  eligible: boolean;
  reason: LoopMemoryCandidateDecision["reason"];
  next_action:
    | "promptlane loop memory-approve"
    | "promptlane loop memory-candidate";
};

export type PromptLaneStatusActivityWorktree = {
  worktree: string;
  branch?: string;
  sessions: number;
  snapshots: number;
  latest_snapshot_id: string;
  latest_created_at: string;
  latest_outcome_status: LoopSnapshot["outcome"]["status"];
  evidence_count: number;
};

export type PromptLaneStatusActivityMergeReadiness = {
  status: "ready" | "needs_review" | "missing_evidence";
  evidence: "evidence present" | "missing evidence";
  next_action:
    | "compare evidence before merge"
    | "review outcome before merge"
    | "record loop outcome evidence";
};

export type PromptLaneStatusActivityCommandCenterItem =
  PromptLaneStatusActivityWorktree & {
    recommendation: "review before merge" | "ready for continuation";
    continuation_command: string;
    merge_readiness: PromptLaneStatusActivityMergeReadiness;
  };

export type PromptLaneStatusActivityReviewPacket = {
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
  actions: PromptLaneStatusActivityMergeReadiness["next_action"][];
  checklist: Array<{
    label:
      | "Record missing evidence before merge"
      | "Review non-passing worktrees before merge"
      | "Compare ready evidence before merge";
    status: "required";
    action: PromptLaneStatusActivityMergeReadiness["next_action"];
  }>;
};

export type PromptLaneStatusActivityCommandCenter = {
  title: "Multi-worktree review";
  primary_action: string;
  review_packet: PromptLaneStatusActivityReviewPacket;
  review_items: PromptLaneStatusActivityCommandCenterItem[];
};

export type PromptLaneStatusActivityRecentDecision = {
  snapshot_id: string;
  worktree: string;
  decision: "merge" | "continue" | "defer";
  reason: string;
  decided_by: string;
  created_at: string;
};

export type PromptLaneStatusActivity = {
  active_worktrees: number;
  active_sessions: number;
  latest_branch?: string;
  latest_worktree?: string;
  needs_review: boolean;
  next_action:
    | "compare loop snapshots by worktree before merging agent output"
    | "continue current worktree loop";
  recent_decisions?: PromptLaneStatusActivityRecentDecision[];
  worktrees: PromptLaneStatusActivityWorktree[];
  command_center?: PromptLaneStatusActivityCommandCenter;
};

export type PromptLaneStatus = {
  status: PromptLaneStatusLevel;
  snapshot_count: number;
  activity: PromptLaneStatusActivity;
  project_memory: PromptLaneStatusProjectMemory;
  memory_candidate?: PromptLaneStatusMemoryCandidate;
  latest_snapshot?: PromptLaneStatusSnapshot;
  latest_compact_boundary?: LoopBriefCompactBoundary;
  next_action: string;
  next_actions: string[];
  privacy: PromptLaneStatusPrivacy;
};

type CompactBoundaryCandidate = Parameters<
  typeof latestCompactBoundaryAfterSnapshot
>[1][number];

export function createPromptLaneStatus(input: {
  snapshots: readonly LoopSnapshot[];
  compactBoundaries: readonly CompactBoundaryCandidate[];
  includeLatest?: boolean;
  projectMemoryCount?: number;
  memoryCandidate?: Pick<
    LoopMemoryCandidateDecision,
    "eligible" | "reason" | "snapshot_id"
  >;
  mergeDecisions?: readonly PromptLaneStatusActivityRecentDecision[];
}): PromptLaneStatus {
  const latest = input.snapshots.at(0);
  const projectMemoryCount = input.projectMemoryCount ?? 0;
  const compactBoundary = latest
    ? latestCompactBoundaryAfterSnapshot(latest, input.compactBoundaries)
    : undefined;
  const hasSnapshots = input.snapshots.length > 0;
  const nextAction = compactBoundary
    ? "promptlane loop collect"
    : hasSnapshots
      ? "promptlane loop brief"
      : "promptlane loop collect";

  return {
    status: hasSnapshots ? "ready" : "empty",
    snapshot_count: input.snapshots.length,
    activity: summarizeLoopActivity(input.snapshots, input.mergeDecisions ?? []),
    project_memory: {
      approved_count: projectMemoryCount,
      included_in_brief: Boolean(latest && projectMemoryCount > 0),
    },
    ...(input.memoryCandidate
      ? {
          memory_candidate: toPromptLaneStatusMemoryCandidate(
            input.memoryCandidate,
          ),
        }
      : {}),
    ...(latest && input.includeLatest !== false
      ? { latest_snapshot: toPromptLaneStatusSnapshot(latest) }
      : {}),
    ...(compactBoundary ? { latest_compact_boundary: compactBoundary } : {}),
    next_action: nextAction,
    next_actions: nextActionsForStatus({
      hasSnapshots,
      compactBoundary,
      memoryCandidate: input.memoryCandidate,
    }),
    privacy: promptlaneStatusPrivacy(),
  };
}

export function summarizeLoopActivity(
  snapshots: readonly LoopSnapshot[],
  mergeDecisions: readonly PromptLaneStatusActivityRecentDecision[] = [],
): PromptLaneStatusActivity {
  const latest = snapshots.at(0);
  const activeWorktrees = uniqueNonEmpty(
    snapshots.map((snapshot) => snapshot.worktree_label),
  ).size;
  const activeSessions = uniqueNonEmpty(
    snapshots.map((snapshot) => snapshot.session_id),
  ).size;
  const needsReview = activeWorktrees > 1 || activeSessions > 1;

  const worktrees = summarizeWorktreeActivity(snapshots);

  return {
    active_worktrees: activeWorktrees,
    active_sessions: activeSessions,
    ...(latest?.branch ? { latest_branch: latest.branch } : {}),
    ...(latest?.worktree_label ? { latest_worktree: latest.worktree_label } : {}),
    needs_review: needsReview,
    next_action: needsReview
      ? "compare loop snapshots by worktree before merging agent output"
      : "continue current worktree loop",
    ...(mergeDecisions.length > 0
      ? { recent_decisions: mergeDecisions.slice(0, 3).map(toRecentDecision) }
      : {}),
    worktrees,
    ...(needsReview
      ? {
          command_center: createPromptLaneCommandCenter(
            worktrees,
            mergeDecisions,
          ),
        }
      : {}),
  };
}

function toRecentDecision(
  decision: PromptLaneStatusActivityRecentDecision,
): PromptLaneStatusActivityRecentDecision {
  return {
    snapshot_id: decision.snapshot_id,
    worktree: decision.worktree,
    decision: decision.decision,
    reason: decision.reason,
    decided_by: decision.decided_by,
    created_at: decision.created_at,
  };
}

export function createPromptLaneCommandCenter(
  worktrees: PromptLaneStatusActivityWorktree[],
  mergeDecisions: readonly PromptLaneStatusActivityRecentDecision[],
): PromptLaneStatusActivityCommandCenter {
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
  reviewItems: PromptLaneStatusActivityCommandCenterItem[],
  mergeDecisions: readonly PromptLaneStatusActivityRecentDecision[] = [],
): PromptLaneStatusActivityReviewPacket {
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
  mergeDecisions: readonly PromptLaneStatusActivityRecentDecision[],
  reviewItems: readonly PromptLaneStatusActivityCommandCenterItem[],
): PromptLaneStatusActivityReviewPacket["decision_advisory"] | undefined {
  const worktrees = new Set(reviewItems.map((item) => item.worktree));
  const decision = mergeDecisions.find((item) => worktrees.has(item.worktree));
  if (!decision) return undefined;

  return {
    summary: `recent ${decision.decision} decision recorded for ${decision.worktree}`,
    next_action: decisionAdvisoryNextAction(decision.decision),
  };
}

function decisionAdvisoryNextAction(
  decision: PromptLaneStatusActivityRecentDecision["decision"],
): NonNullable<
  PromptLaneStatusActivityReviewPacket["decision_advisory"]
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
  action: PromptLaneStatusActivityMergeReadiness["next_action"],
): PromptLaneStatusActivityReviewPacket["checklist"][number]["label"] {
  if (action === "record loop outcome evidence") {
    return "Record missing evidence before merge";
  }
  if (action === "review outcome before merge") {
    return "Review non-passing worktrees before merge";
  }
  return "Compare ready evidence before merge";
}

function mergeReadinessForWorktree(
  worktree: PromptLaneStatusActivityWorktree,
): PromptLaneStatusActivityMergeReadiness {
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
  worktree: PromptLaneStatusActivityWorktree,
): string {
  return [
    "promptlane loop brief",
    `--worktree ${worktree.worktree}`,
    worktree.branch ? `--branch ${worktree.branch}` : undefined,
  ]
    .filter((part): part is string => Boolean(part))
    .join(" ");
}

function summarizeWorktreeActivity(
  snapshots: readonly LoopSnapshot[],
): PromptLaneStatusActivityWorktree[] {
  const groups = new Map<
    string,
    {
      latest: LoopSnapshot;
      sessions: Set<string>;
      snapshots: number;
    }
  >();

  for (const snapshot of snapshots) {
    const worktree = snapshot.worktree_label || "unknown";
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

export function toPromptLaneStatusMemoryCandidate(
  decision: Pick<LoopMemoryCandidateDecision, "eligible" | "reason">,
): PromptLaneStatusMemoryCandidate {
  return {
    eligible: decision.eligible,
    reason: decision.reason,
    next_action: decision.eligible
      ? "promptlane loop memory-approve"
      : "promptlane loop memory-candidate",
  };
}

export function toPromptLaneStatusSnapshot(
  snapshot: LoopSnapshot,
): PromptLaneStatusSnapshot {
  return {
    id: snapshot.id,
    created_at: snapshot.created_at,
    tool: snapshot.tool,
    source: snapshot.source,
    project: snapshot.cwd_label,
    ...(snapshot.branch ? { branch: snapshot.branch } : {}),
    ...(snapshot.worktree_label ? { worktree: snapshot.worktree_label } : {}),
    prompt_count: snapshot.event_counts.prompts,
    ...(snapshot.quality.average_prompt_score === undefined
      ? {}
      : { average_prompt_score: snapshot.quality.average_prompt_score }),
    top_gaps: snapshot.quality.top_gaps,
    outcome_status: snapshot.outcome.status,
  };
}

export function promptlaneStatusPrivacy(): PromptLaneStatusPrivacy {
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
  compactBoundary?: LoopBriefCompactBoundary;
  memoryCandidate?: Pick<LoopMemoryCandidateDecision, "eligible">;
}): string[] {
  if (!input.hasSnapshots) {
    return [
      "Run promptlane loop collect to create the first local loop snapshot.",
      "Capture at least one Claude Code or Codex prompt before expecting useful loop context.",
    ];
  }

  if (input.compactBoundary) {
    return withMemoryCandidateAction(input.memoryCandidate, [
      "Run promptlane loop collect again after compaction to refresh the snapshot.",
      "Then use promptlane loop brief or prepare_loop_brief for a continuation prompt.",
    ]);
  }

  return withMemoryCandidateAction(input.memoryCandidate, [
    "Use promptlane loop brief or prepare_loop_brief to get a copy-ready continuation prompt.",
    "Run promptlane loop collect again after the next agent turn to refresh the snapshot.",
  ]);
}

function withMemoryCandidateAction(
  memoryCandidate: Pick<LoopMemoryCandidateDecision, "eligible"> | undefined,
  actions: string[],
): string[] {
  if (!memoryCandidate?.eligible) return actions;
  return [
    ...actions,
    "Run promptlane loop memory-approve after reviewing the latest passed loop outcome.",
  ];
}

function uniqueNonEmpty(values: Array<string | undefined>): Set<string> {
  return new Set(values.filter((value): value is string => Boolean(value)));
}
