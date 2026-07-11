import type { LoopSnapshot } from "./types.js";

export type LoopBriefCompactBoundary = {
  id: string;
  created_at: string;
  tool: string;
  event_name: "PreCompact" | "PostCompact";
  trigger: "manual" | "auto" | "unknown";
  content_hash?: string;
  after_latest_snapshot: true;
};

export type LoopBrief = {
  title: string;
  prompt: string;
  source_snapshot_id: string;
  compact_boundary?: LoopBriefCompactBoundary;
  privacy: {
    local_only: true;
    returns_prompt_bodies: false;
    returns_raw_paths: false;
  };
};

export type LoopBriefApprovedMemory = {
  id: string;
  statement: string;
  evidence_refs: string[];
};

export function createLoopBrief(input: {
  snapshot: LoopSnapshot;
  compactBoundary?: LoopBriefCompactBoundary;
  approvedMemories?: readonly LoopBriefApprovedMemory[];
}): LoopBrief {
  const snapshot = input.snapshot;
  const explicitCheckpoint =
    snapshot.source === "cli" && snapshot.outcome.status !== "unknown";
  const gaps =
    snapshot.quality.top_gaps.length > 0
      ? snapshot.quality.top_gaps.map((gap) => `- ${gap}`).join("\n")
      : "- No recurring prompt gaps recorded in this snapshot.";
  const average =
    snapshot.quality.average_prompt_score === undefined
      ? "not enough prompt data"
      : `${snapshot.quality.average_prompt_score}/100`;
  const promptIds =
    snapshot.prompt_ids.length > 0
      ? snapshot.prompt_ids.join(", ")
      : "none captured yet";

  return {
    title: `Continue agent loop ${snapshot.id}`,
    source_snapshot_id: snapshot.id,
    prompt: [
      "## Goal",
      "Continue the current coding-agent loop using the local LoopRelay snapshot.",
      "",
      ...(explicitCheckpoint
        ? [
            "## Selected Continuation Contract",
            "authority: explicit local checkpoint",
            safeOutcomeSummary(snapshot.outcome.summary),
            "",
          ]
        : []),
      "## Context",
      `project: ${snapshot.cwd_label}`,
      `tool: ${snapshot.tool}`,
      `source: ${snapshot.source}`,
      snapshot.session_id ? `session: ${snapshot.session_id}` : undefined,
      snapshot.branch ? `branch: ${snapshot.branch}` : undefined,
      snapshot.worktree_label
        ? `worktree: ${snapshot.worktree_label}`
        : undefined,
      ...(!explicitCheckpoint
        ? [`prompt ids: ${promptIds}`, `average prompt score: ${average}`]
        : []),
      "",
      ...(!explicitCheckpoint
        ? [
            "## Current Loop State",
            safeOutcomeSummary(snapshot.outcome.summary),
            "",
          ]
        : []),
      ...(input.compactBoundary
        ? [
            "## Compaction Boundary",
            `${input.compactBoundary.event_name} at ${input.compactBoundary.created_at} (${input.compactBoundary.trigger}).`,
            "Run looprelay loop collect again if the next turn needs post-compact context.",
            "",
          ]
        : []),
      ...approvedMemoryLines(input.approvedMemories ?? []),
      ...(!explicitCheckpoint ? ["## Prompt Habits To Improve", gaps, ""] : []),
      explicitCheckpoint ? "## Fallback Working Defaults" : "## Scope",
      ...(explicitCheckpoint
        ? [
            "Apply these only when the selected continuation contract does not override them.",
          ]
        : []),
      "Keep the next change tied to this loop. Do not rename packages, change agent settings, or edit instruction files unless that is the explicit task.",
      "",
      ...(explicitCheckpoint ? [] : ["## Verification"]),
      explicitCheckpoint
        ? "Run the narrowest relevant test first and only the additional checks named by the selected contract. Do not run the full release gate unless the selected contract explicitly requires final-candidate validation. Report command output and remaining risk."
        : "Run the narrowest relevant test first, then the Node 22 pnpm gate when behavior changes. Report command output and remaining risk.",
      "",
      ...(explicitCheckpoint ? [] : ["## Output"]),
      "Return a short Markdown summary with changes, verification, and risks.",
    ]
      .filter((line): line is string => line !== undefined)
      .join("\n"),
    ...(input.compactBoundary
      ? { compact_boundary: input.compactBoundary }
      : {}),
    privacy: {
      local_only: true,
      returns_prompt_bodies: false,
      returns_raw_paths: false,
    },
  };
}

function safeOutcomeSummary(summary: string): string {
  if (!summary.trim()) return "No loop outcome summary recorded.";
  if (looksUnsafe(summary)) {
    return "Outcome summary omitted because it may contain local paths or secrets.";
  }
  return summary;
}

function approvedMemoryLines(
  memories: readonly LoopBriefApprovedMemory[],
): string[] {
  const safeMemories = memories.filter(
    (memory) => !looksUnsafe(memory.statement),
  );
  if (safeMemories.length === 0) return [];

  return [
    "## Approved Loop Memories",
    ...safeMemories.map((memory) => {
      const safeEvidenceRefs = memory.evidence_refs.filter(
        (evidenceRef) => !looksUnsafe(evidenceRef),
      );
      const evidence = safeEvidenceRefs.length
        ? ` (evidence: ${safeEvidenceRefs.join(", ")})`
        : "";
      return `- ${memory.statement}${evidence}`;
    }),
    "",
  ];
}

export function latestCompactBoundaryAfterSnapshot(
  snapshot: LoopSnapshot,
  boundaries: readonly CompactBoundaryCandidate[],
): LoopBriefCompactBoundary | undefined {
  const latest = boundaries.find(
    (boundary) =>
      boundary.project_id === snapshot.project_id &&
      boundary.created_at > snapshot.created_at,
  );
  if (!latest) return undefined;

  return {
    id: latest.id,
    created_at: latest.created_at,
    tool: latest.tool,
    event_name: latest.event_name,
    trigger: latest.trigger,
    ...(latest.content_hash ? { content_hash: latest.content_hash } : {}),
    after_latest_snapshot: true,
  };
}

type CompactBoundaryCandidate = {
  id: string;
  created_at: string;
  tool: string;
  event_name: "PreCompact" | "PostCompact";
  trigger: "manual" | "auto" | "unknown";
  project_id: string;
  content_hash?: string;
};

function looksUnsafe(value: string): boolean {
  return (
    /(?:^|\s)\/Users\/[^\s]+/.test(value) ||
    /(?:^|\s)\/home\/[^\s]+/.test(value) ||
    /sk-[a-z0-9_-]{6,}/i.test(value) ||
    /gh[pousr]_[a-z0-9_]{12,}/i.test(value)
  );
}
