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

export type LoopdeckStatus = {
  status: LoopdeckStatusLevel;
  snapshot_count: number;
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
