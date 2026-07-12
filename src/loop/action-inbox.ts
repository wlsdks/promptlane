import type { LoopSnapshot } from "./types.js";
import { detectSensitiveValues } from "../redaction/detectors.js";
import type {
  FailureEpisodeCategory,
  FailureEpisodePatternCounts,
  FailureEpisodeStatus,
} from "./failure-episode.js";

export type ActionInboxItemKind =
  | "close_loop"
  | "confirm_failure"
  | "resolve_failure"
  | "complete_continuation"
  | "verify_evidence"
  | "review_memory";

export type ActionInboxItem = {
  id: string;
  kind: ActionInboxItemKind;
  priority: "critical" | "high" | "normal";
  snapshot_id: string;
  project_id: string;
  project: string;
  worktree?: string;
  branch?: string;
  created_at: string;
  title: string;
  reason: string;
  next_action: string;
  source: "operator_local";
  failure_category?: FailureEpisodeCategory;
  current_intervention?: string;
};

export type LocalOutcomeSummary = {
  snapshot_id: string;
  project_id: string;
  project: string;
  worktree?: string;
  branch?: string;
  created_at: string;
  status: LoopSnapshot["outcome"]["status"];
  evidence_count: number;
  locally_verified_evidence: number;
  declared_evidence: number;
  continuation_status?: ReceiptSummary["status"];
  failure_episode_status?: FailureEpisodeStatus;
  failure_category?: FailureEpisodeCategory;
  memory_approved: boolean;
};

export type FailurePatternSummary = {
  category: FailureEpisodeCategory;
  total: number;
  session_count: number;
  open: number;
  resolved: number;
  wont_fix: number;
  recurring: boolean;
  last_confirmed_at: string;
};

export type ActionInboxReport = {
  generated_at: string;
  summary: {
    total: number;
    critical: number;
    failure_review: number;
    continuation_debt: number;
    evidence_debt: number;
    memory_review: number;
    recurring_failure_categories: number;
  };
  items: ActionInboxItem[];
  outcomes: LocalOutcomeSummary[];
  failure_patterns: FailurePatternSummary[];
  privacy: {
    local_only: true;
    stores_prompt_bodies: false;
    stores_raw_paths: false;
    stores_transcripts: false;
    causal_claim: false;
  };
};

type ReceiptSummary = {
  id: string;
  snapshot_id: string;
  status:
    | "generated"
    | "copied"
    | "delivered"
    | "followed"
    | "partial"
    | "ignored";
  created_at: string;
};

type MemorySummary = { snapshot_id: string };
type FailureEpisodeSummary = {
  id: string;
  snapshot_id: string;
  status: FailureEpisodeStatus;
  category: FailureEpisodeCategory;
  confirmed_at: string;
  intervention?: string;
};

export function createActionInboxReport(input: {
  now: Date;
  snapshots: readonly LoopSnapshot[];
  receipts: readonly ReceiptSummary[];
  memories: readonly MemorySummary[];
  failureEpisodes: readonly FailureEpisodeSummary[];
  failurePatternCounts?: readonly FailureEpisodePatternCounts[];
}): ActionInboxReport {
  const latestSnapshots = latestPerLoop(input.snapshots);
  const receiptBySnapshot = latestBySnapshot(input.receipts);
  const failureBySnapshot = latestBySnapshot(input.failureEpisodes);
  const memorySnapshots = new Set(
    input.memories.map((memory) => memory.snapshot_id),
  );
  const items: ActionInboxItem[] = [];
  const outcomes: LocalOutcomeSummary[] = [];

  for (const snapshot of latestSnapshots) {
    const receipt = receiptBySnapshot.get(snapshot.id);
    const failure = failureBySnapshot.get(snapshot.id);
    const typed = snapshot.outcome.typed_evidence ?? [];
    const verified = typed.filter(
      (evidence) => evidence.verification === "locally_verified",
    ).length;
    const declared = typed.filter(
      (evidence) => evidence.verification === "declared",
    ).length;

    if (["unknown", "in_progress"].includes(snapshot.outcome.status)) {
      items.push(
        action(snapshot, "close_loop", "normal", {
          title: "Close the active loop",
          reason: "The latest selected loop has no completed outcome.",
          next: `looprelay loop close --snapshot-id ${snapshot.id}`,
        }),
      );
    }
    if (["failed", "blocked"].includes(snapshot.outcome.status) && !failure) {
      items.push(
        action(
          snapshot,
          "confirm_failure",
          snapshot.outcome.status === "blocked" ? "critical" : "high",
          {
            title: "Confirm the failure episode",
            reason:
              "A failed or blocked outcome needs an operator-confirmed category and intervention.",
            next: `looprelay loop failure record --snapshot-id ${snapshot.id}`,
          },
        ),
      );
    }
    if (
      ["failed", "blocked"].includes(snapshot.outcome.status) &&
      failure?.status === "open"
    ) {
      items.push({
        ...action(snapshot, "resolve_failure", "high", {
          title: "Resolve the confirmed failure",
          reason:
            "The operator-confirmed intervention still needs a verified resolution or wont-fix decision.",
          next: `looprelay loop failure record --snapshot-id ${snapshot.id} --status resolved`,
        }),
        failure_category: failure.category,
        ...(failure.intervention
          ? { current_intervention: failure.intervention }
          : {}),
      });
    }
    if (
      receipt &&
      !["followed", "partial", "ignored"].includes(receipt.status)
    ) {
      items.push(
        action(snapshot, "complete_continuation", "high", {
          title: "Record continuation use",
          reason: `The latest continuation receipt is ${receipt.status}.`,
          next: `looprelay loop receipt --receipt-id ${receipt.id} --status followed`,
        }),
      );
    }
    if (
      !["unknown", "in_progress"].includes(snapshot.outcome.status) &&
      verified === 0
    ) {
      items.push(
        action(snapshot, "verify_evidence", "normal", {
          title: "Verify outcome evidence",
          reason:
            typed.length === 0
              ? "The outcome has no typed engineering evidence."
              : "The outcome evidence is declared but not locally verified.",
          next: `looprelay loop close --snapshot-id ${snapshot.id}`,
        }),
      );
    }
    if (
      snapshot.outcome.status === "passed" &&
      snapshot.outcome.evidence_refs.length > 0 &&
      !memorySnapshots.has(snapshot.id)
    ) {
      items.push(
        action(snapshot, "review_memory", "normal", {
          title: "Review a durable lesson",
          reason:
            "A passed evidence-bearing loop has not been reviewed for memory promotion.",
          next: `looprelay loop memory-candidate --snapshot-id ${snapshot.id}`,
        }),
      );
    }

    if (!["unknown", "in_progress"].includes(snapshot.outcome.status)) {
      outcomes.push({
        snapshot_id: snapshot.id,
        project_id: snapshot.project_id,
        project: safeLabel(snapshot.cwd_label, "local-project"),
        ...(safeLabel(snapshot.worktree_label)
          ? { worktree: safeLabel(snapshot.worktree_label) }
          : {}),
        ...(safeLabel(snapshot.branch)
          ? { branch: safeLabel(snapshot.branch) }
          : {}),
        created_at: snapshot.created_at,
        status: snapshot.outcome.status,
        evidence_count: snapshot.outcome.evidence_refs.length + typed.length,
        locally_verified_evidence: verified,
        declared_evidence: declared,
        ...(receipt ? { continuation_status: receipt.status } : {}),
        ...(failure
          ? {
              failure_episode_status: failure.status,
              failure_category: failure.category,
            }
          : {}),
        memory_approved: memorySnapshots.has(snapshot.id),
      });
    }
  }

  items.sort(compareItems);
  outcomes.sort((left, right) =>
    right.created_at.localeCompare(left.created_at),
  );
  const failurePatterns = input.failurePatternCounts
    ? createFailurePatternsFromCounts(input.failurePatternCounts)
    : createFailurePatterns(input.failureEpisodes, input.snapshots);
  return {
    generated_at: input.now.toISOString(),
    summary: {
      total: items.length,
      critical: items.filter((item) => item.priority === "critical").length,
      failure_review:
        countKind(items, "confirm_failure") +
        countKind(items, "resolve_failure"),
      continuation_debt: countKind(items, "complete_continuation"),
      evidence_debt: countKind(items, "verify_evidence"),
      memory_review: countKind(items, "review_memory"),
      recurring_failure_categories: failurePatterns.filter(
        (pattern) => pattern.recurring,
      ).length,
    },
    items,
    outcomes,
    failure_patterns: failurePatterns,
    privacy: {
      local_only: true,
      stores_prompt_bodies: false,
      stores_raw_paths: false,
      stores_transcripts: false,
      causal_claim: false,
    },
  };
}

function createFailurePatterns(
  episodes: readonly FailureEpisodeSummary[],
  snapshots: readonly LoopSnapshot[],
): FailurePatternSummary[] {
  const patterns = new Map<FailureEpisodeCategory, FailurePatternSummary>();
  const sessionBySnapshot = new Map(
    snapshots
      .filter((snapshot) => snapshot.session_id)
      .map((snapshot) => [snapshot.id, snapshot.session_id!]),
  );
  const sessionsByCategory = new Map<FailureEpisodeCategory, Set<string>>();
  for (const episode of episodes) {
    const pattern = patterns.get(episode.category) ?? {
      category: episode.category,
      total: 0,
      session_count: 0,
      open: 0,
      resolved: 0,
      wont_fix: 0,
      recurring: false,
      last_confirmed_at: episode.confirmed_at,
    };
    pattern.total += 1;
    pattern[episode.status] += 1;
    const sessionId = sessionBySnapshot.get(episode.snapshot_id);
    if (sessionId) {
      const sessions = sessionsByCategory.get(episode.category) ?? new Set();
      sessions.add(sessionId);
      sessionsByCategory.set(episode.category, sessions);
      pattern.session_count = sessions.size;
    }
    pattern.recurring = pattern.session_count >= 2;
    if (episode.confirmed_at > pattern.last_confirmed_at) {
      pattern.last_confirmed_at = episode.confirmed_at;
    }
    patterns.set(episode.category, pattern);
  }
  return sortFailurePatterns([...patterns.values()]);
}

function createFailurePatternsFromCounts(
  counts: readonly FailureEpisodePatternCounts[],
): FailurePatternSummary[] {
  return sortFailurePatterns(
    counts.map((count) => ({
      ...count,
      recurring: count.session_count >= 2,
    })),
  );
}

function sortFailurePatterns(
  patterns: readonly FailurePatternSummary[],
): FailurePatternSummary[] {
  return [...patterns].sort(
    (left, right) =>
      Number(right.recurring) - Number(left.recurring) ||
      right.total - left.total ||
      right.last_confirmed_at.localeCompare(left.last_confirmed_at),
  );
}

function action(
  snapshot: LoopSnapshot,
  kind: ActionInboxItemKind,
  priority: ActionInboxItem["priority"],
  copy: { title: string; reason: string; next: string },
): ActionInboxItem {
  return {
    id: `${kind}:${snapshot.id}`,
    kind,
    priority,
    snapshot_id: snapshot.id,
    project_id: snapshot.project_id,
    project: safeLabel(snapshot.cwd_label, "local-project"),
    ...(safeLabel(snapshot.worktree_label)
      ? { worktree: safeLabel(snapshot.worktree_label) }
      : {}),
    ...(safeLabel(snapshot.branch)
      ? { branch: safeLabel(snapshot.branch) }
      : {}),
    created_at: snapshot.created_at,
    title: copy.title,
    reason: copy.reason,
    next_action: copy.next,
    source: "operator_local",
  };
}

function latestPerLoop(snapshots: readonly LoopSnapshot[]): LoopSnapshot[] {
  const sorted = [...snapshots].sort((left, right) =>
    right.created_at.localeCompare(left.created_at),
  );
  const seen = new Set<string>();
  return sorted.filter((snapshot) => {
    const key = [
      snapshot.project_id,
      snapshot.worktree_label ?? "",
      snapshot.session_id ?? "",
      snapshot.branch ?? "",
    ].join(":");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function latestBySnapshot<
  T extends { snapshot_id: string; created_at?: string; confirmed_at?: string },
>(items: readonly T[]): Map<string, T> {
  const result = new Map<string, T>();
  for (const item of items) {
    const current = result.get(item.snapshot_id);
    const timestamp = item.created_at ?? item.confirmed_at ?? "";
    const currentTimestamp = current?.created_at ?? current?.confirmed_at ?? "";
    if (!current || timestamp > currentTimestamp)
      result.set(item.snapshot_id, item);
  }
  return result;
}

function compareItems(left: ActionInboxItem, right: ActionInboxItem): number {
  const rank = { critical: 0, high: 1, normal: 2 } as const;
  const kindRank: Record<ActionInboxItemKind, number> = {
    confirm_failure: 0,
    resolve_failure: 1,
    complete_continuation: 2,
    close_loop: 3,
    verify_evidence: 4,
    review_memory: 5,
  };
  return (
    rank[left.priority] - rank[right.priority] ||
    kindRank[left.kind] - kindRank[right.kind] ||
    right.created_at.localeCompare(left.created_at) ||
    left.kind.localeCompare(right.kind)
  );
}

function countKind(
  items: readonly ActionInboxItem[],
  kind: ActionInboxItemKind,
): number {
  return items.filter((item) => item.kind === kind).length;
}

function safeLabel(value: string | undefined, fallback = ""): string {
  if (!value || detectSensitiveValues(value).length > 0) return fallback;
  return value;
}
