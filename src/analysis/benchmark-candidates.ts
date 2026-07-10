import { detectSensitiveValues } from "../redaction/detectors.js";
import type { LoopSnapshot } from "../loop/types.js";

export type BenchmarkCandidateReport = {
  status: "ready" | "no_attributed_outcomes" | "empty_archive";
  candidate_count: number;
  candidates: BenchmarkCandidate[];
  excluded_unsafe_candidates: number;
  has_more: boolean;
  scope: {
    scanned_snapshots: number;
    snapshot_limit: 100;
  };
  next_action: string;
  privacy: {
    local_only: true;
    external_calls: false;
    returns_prompt_bodies: false;
    returns_raw_paths: false;
    returns_evidence_refs: false;
  };
};

type BenchmarkCandidate = {
  prompt_id: string;
  snapshot_id: string;
  outcome_status: "passed" | "failed";
  tests_run: number;
  evidence_ref_count: number;
};

const SNAPSHOT_LIMIT = 100;
const DEFAULT_CANDIDATE_LIMIT = 20;

export function createBenchmarkCandidateReport(
  snapshots: LoopSnapshot[],
  requestedLimit = DEFAULT_CANDIDATE_LIMIT,
): BenchmarkCandidateReport {
  const candidatesByPromptId = new Map<string, BenchmarkCandidate>();
  const unsafePromptIds = new Set<string>();

  for (const snapshot of snapshots.slice(0, SNAPSHOT_LIMIT)) {
    if (
      snapshot.outcome.status !== "passed" &&
      snapshot.outcome.status !== "failed"
    ) {
      continue;
    }
    const usedPromptIds = Array.from(
      new Set(snapshot.outcome.used_improvement_prompt_ids ?? []),
    ).filter((promptId) => snapshot.prompt_ids.includes(promptId));
    if (usedPromptIds.length === 0) continue;

    const evidenceIsComplete =
      snapshot.outcome.summary.trim().length > 0 &&
      snapshot.outcome.evidence_refs.length > 0;
    if (!evidenceIsComplete) continue;
    const evidenceIsUnsafe = [
      snapshot.outcome.summary,
      ...snapshot.outcome.evidence_refs,
    ].some((value) => detectSensitiveValues(value).length > 0);

    for (const promptId of usedPromptIds) {
      if (candidatesByPromptId.has(promptId)) continue;
      if (evidenceIsUnsafe) {
        unsafePromptIds.add(promptId);
        continue;
      }
      unsafePromptIds.delete(promptId);
      candidatesByPromptId.set(promptId, {
        prompt_id: promptId,
        snapshot_id: snapshot.id,
        outcome_status: snapshot.outcome.status,
        tests_run: snapshot.event_counts.tests_run ?? 0,
        evidence_ref_count: snapshot.outcome.evidence_refs.length,
      });
    }
  }

  const allCandidates = Array.from(candidatesByPromptId.values());
  const limit = clampLimit(requestedLimit);
  const status =
    snapshots.length === 0
      ? "empty_archive"
      : allCandidates.length > 0
        ? "ready"
        : "no_attributed_outcomes";

  return {
    status,
    candidate_count: allCandidates.length,
    candidates: allCandidates.slice(0, limit),
    excluded_unsafe_candidates: Array.from(unsafePromptIds).filter(
      (promptId) => !candidatesByPromptId.has(promptId),
    ).length,
    has_more: allCandidates.length > limit,
    scope: {
      scanned_snapshots: Math.min(snapshots.length, SNAPSHOT_LIMIT),
      snapshot_limit: SNAPSHOT_LIMIT,
    },
    next_action: nextAction(status),
    privacy: {
      local_only: true,
      external_calls: false,
      returns_prompt_bodies: false,
      returns_raw_paths: false,
      returns_evidence_refs: false,
    },
  };
}

function clampLimit(limit: number): number {
  if (!Number.isInteger(limit)) return DEFAULT_CANDIDATE_LIMIT;
  return Math.min(Math.max(limit, 1), 100);
}

function nextAction(status: BenchmarkCandidateReport["status"]): string {
  if (status === "ready") {
    return "Review candidate prompt ids, then run promptlane benchmark prepare-fixture with explicit consent.";
  }
  if (status === "empty_archive") {
    return "Collect a loop snapshot after using PromptLane with Codex or Claude Code.";
  }
  return "Record a passed or failed loop outcome with safe evidence and explicitly selected PromptLane improvement ids.";
}
