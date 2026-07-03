import { latestCompactBoundaryAfterSnapshot } from "./brief.js";
import type { LoopBriefCompactBoundary } from "./brief.js";
import type { LoopMemoryCandidateDecision } from "./memory-candidate.js";
import type { LoopSnapshot } from "./types.js";

export type LoopdeckStatusLevel = "ready" | "empty";

export type LoopdeckStatusPrivacy = {
  local_only: true;
  external_calls: false;
  returns_prompt_bodies: false;
  returns_raw_paths: false;
  returns_compact_content: false;
};

export type LoopdeckStatusSnapshot = {
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

export type LoopdeckStatusProjectMemory = {
  approved_count: number;
  included_in_brief: boolean;
};

export type LoopdeckStatusMemoryCandidate = {
  eligible: boolean;
  reason: LoopMemoryCandidateDecision["reason"];
  next_action:
    | "prompt-coach loop memory-approve"
    | "prompt-coach loop memory-candidate";
};

export type LoopdeckStatusActivityWorktree = {
  worktree: string;
  branch?: string;
  sessions: number;
  snapshots: number;
  latest_snapshot_id: string;
  latest_created_at: string;
  latest_outcome_status: LoopSnapshot["outcome"]["status"];
};

export type LoopdeckStatusActivityCommandCenterItem =
  LoopdeckStatusActivityWorktree & {
    recommendation: "review before merge" | "ready for continuation";
  };

export type LoopdeckStatusActivityCommandCenter = {
  title: "Multi-worktree review";
  primary_action: string;
  review_items: LoopdeckStatusActivityCommandCenterItem[];
};

export type LoopdeckStatusActivity = {
  active_worktrees: number;
  active_sessions: number;
  latest_branch?: string;
  latest_worktree?: string;
  needs_review: boolean;
  next_action:
    | "compare loop snapshots by worktree before merging agent output"
    | "continue current worktree loop";
  worktrees: LoopdeckStatusActivityWorktree[];
  command_center?: LoopdeckStatusActivityCommandCenter;
};

export type LoopdeckStatus = {
  status: LoopdeckStatusLevel;
  snapshot_count: number;
  activity: LoopdeckStatusActivity;
  project_memory: LoopdeckStatusProjectMemory;
  memory_candidate?: LoopdeckStatusMemoryCandidate;
  latest_snapshot?: LoopdeckStatusSnapshot;
  latest_compact_boundary?: LoopBriefCompactBoundary;
  next_action: string;
  next_actions: string[];
  privacy: LoopdeckStatusPrivacy;
};

type CompactBoundaryCandidate = Parameters<
  typeof latestCompactBoundaryAfterSnapshot
>[1][number];

export function createLoopdeckStatus(input: {
  snapshots: readonly LoopSnapshot[];
  compactBoundaries: readonly CompactBoundaryCandidate[];
  includeLatest?: boolean;
  projectMemoryCount?: number;
  memoryCandidate?: Pick<
    LoopMemoryCandidateDecision,
    "eligible" | "reason" | "snapshot_id"
  >;
}): LoopdeckStatus {
  const latest = input.snapshots.at(0);
  const projectMemoryCount = input.projectMemoryCount ?? 0;
  const compactBoundary = latest
    ? latestCompactBoundaryAfterSnapshot(latest, input.compactBoundaries)
    : undefined;
  const hasSnapshots = input.snapshots.length > 0;
  const nextAction = compactBoundary
    ? "prompt-coach loop collect"
    : hasSnapshots
      ? "prompt-coach loop brief"
      : "prompt-coach loop collect";

  return {
    status: hasSnapshots ? "ready" : "empty",
    snapshot_count: input.snapshots.length,
    activity: summarizeLoopActivity(input.snapshots),
    project_memory: {
      approved_count: projectMemoryCount,
      included_in_brief: Boolean(latest && projectMemoryCount > 0),
    },
    ...(input.memoryCandidate
      ? {
          memory_candidate: toLoopdeckStatusMemoryCandidate(
            input.memoryCandidate,
          ),
        }
      : {}),
    ...(latest && input.includeLatest !== false
      ? { latest_snapshot: toLoopdeckStatusSnapshot(latest) }
      : {}),
    ...(compactBoundary ? { latest_compact_boundary: compactBoundary } : {}),
    next_action: nextAction,
    next_actions: nextActionsForStatus({
      hasSnapshots,
      compactBoundary,
      memoryCandidate: input.memoryCandidate,
    }),
    privacy: loopdeckStatusPrivacy(),
  };
}

export function summarizeLoopActivity(
  snapshots: readonly LoopSnapshot[],
): LoopdeckStatusActivity {
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
    worktrees,
    ...(needsReview ? { command_center: createCommandCenter(worktrees) } : {}),
  };
}

function createCommandCenter(
  worktrees: LoopdeckStatusActivityWorktree[],
): LoopdeckStatusActivityCommandCenter {
  const reviewItems = worktrees.map((worktree) => ({
    ...worktree,
    recommendation:
      worktree.latest_outcome_status === "passed"
        ? ("ready for continuation" as const)
        : ("review before merge" as const),
  }));
  const primary = reviewItems.find(
    (item) => item.recommendation === "review before merge",
  );

  return {
    title: "Multi-worktree review",
    primary_action: primary
      ? `review ${primary.worktree} before merge`
      : "compare worktrees before merge",
    review_items: reviewItems,
  };
}

function summarizeWorktreeActivity(
  snapshots: readonly LoopSnapshot[],
): LoopdeckStatusActivityWorktree[] {
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
    }))
    .sort((left, right) =>
      right.latest_created_at.localeCompare(left.latest_created_at),
    );
}

export function toLoopdeckStatusMemoryCandidate(
  decision: Pick<LoopMemoryCandidateDecision, "eligible" | "reason">,
): LoopdeckStatusMemoryCandidate {
  return {
    eligible: decision.eligible,
    reason: decision.reason,
    next_action: decision.eligible
      ? "prompt-coach loop memory-approve"
      : "prompt-coach loop memory-candidate",
  };
}

export function toLoopdeckStatusSnapshot(
  snapshot: LoopSnapshot,
): LoopdeckStatusSnapshot {
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

export function loopdeckStatusPrivacy(): LoopdeckStatusPrivacy {
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
      "Run prompt-coach loop collect to create the first local loop snapshot.",
      "Capture at least one Claude Code or Codex prompt before expecting useful loop context.",
    ];
  }

  if (input.compactBoundary) {
    return withMemoryCandidateAction(input.memoryCandidate, [
      "Run prompt-coach loop collect again after compaction to refresh the snapshot.",
      "Then use prompt-coach loop brief or prepare_loop_brief for a continuation prompt.",
    ]);
  }

  return withMemoryCandidateAction(input.memoryCandidate, [
    "Use prompt-coach loop brief or prepare_loop_brief to get a copy-ready continuation prompt.",
    "Run prompt-coach loop collect again after the next agent turn to refresh the snapshot.",
  ]);
}

function withMemoryCandidateAction(
  memoryCandidate: Pick<LoopMemoryCandidateDecision, "eligible"> | undefined,
  actions: string[],
): string[] {
  if (!memoryCandidate?.eligible) return actions;
  return [
    ...actions,
    "Run prompt-coach loop memory-approve after reviewing the latest passed loop outcome.",
  ];
}

function uniqueNonEmpty(values: Array<string | undefined>): Set<string> {
  return new Set(values.filter((value): value is string => Boolean(value)));
}
