import type { BenchmarkPairCandidateReport } from "../../analysis/benchmark-pair-candidates.js";
import type {
  InstructionPatchApplyResult,
  InstructionPatchProposal,
} from "../../loop/instruction-patch.js";
import type { LoopMemoryCandidateDecision } from "../../loop/memory-candidate.js";
import type { LoopRelayStatus } from "../../loop/status.js";
import type { LoopSnapshot } from "../../loop/types.js";
import type { createSqlitePromptStorage } from "../../storage/sqlite.js";

export function formatLoopSnapshot(snapshot: LoopSnapshot): string {
  return [
    "Loop snapshot collected",
    `id ${snapshot.id}`,
    `project ${snapshot.cwd_label}`,
    `tool ${snapshot.tool}`,
    `source ${snapshot.source}`,
    `prompts ${snapshot.event_counts.prompts}`,
    snapshot.quality.average_prompt_score === undefined
      ? "average prompt score n/a"
      : `average prompt score ${snapshot.quality.average_prompt_score}/100`,
    snapshot.quality.top_gaps.length > 0
      ? `top gaps ${snapshot.quality.top_gaps.join(", ")}`
      : "top gaps none",
    "",
    "Next: looprelay loop brief",
    "",
    "Privacy: local-only, no prompt bodies, no raw paths.",
  ].join("\n");
}

export function formatLoopStatus(
  status: LoopRelayStatus,
  pairReadiness: BenchmarkPairCandidateReport,
  allProjects: boolean,
): string {
  const latest = status.latest_snapshot;
  const failureCount = status.failure_patterns?.reduce(
    (total, pattern) => total + pattern.occurrences,
    0,
  );
  const attention = status.activity.needs_review
    ? "Worktree review needed"
    : failureCount
      ? `${failureCount} recurring failure ${failureCount === 1 ? "occurrence" : "occurrences"}`
      : latest && latest.outcome_status !== "passed"
        ? "Outcome checkpoint pending"
        : "No immediate review";
  const snapshotLabel = status.snapshot_count === 1 ? "snapshot" : "snapshots";
  const sessionLabel =
    status.activity.active_sessions === 1 ? "session" : "sessions";
  const checkpointAction = status.next_actions
    .find((action) => action.includes("looprelay loop outcome --snapshot-id"))
    ?.match(/looprelay loop outcome --snapshot-id [A-Za-z0-9_-]+/)?.[0];
  const nextAction =
    latest &&
    (latest.outcome_status === "unknown" ||
      latest.outcome_status === "in_progress")
      ? (checkpointAction ?? status.next_action)
      : status.next_action;

  return [
    `LoopRelay · ${status.status}`,
    `Scope: ${allProjects ? "all local projects" : "current project"}`,
    `Managed: ${status.snapshot_count} ${snapshotLabel} · ${status.activity.active_sessions} ${sessionLabel} · ${status.project_memory.approved_count} approved lessons`,
    `Attention: ${attention}`,
    `Evidence: ${formatPairReadiness(pairReadiness)}`,
    `Latest: ${latest ? `${latest.project} · ${latest.outcome_status}` : "none"}`,
    `Next: ${nextAction}`,
    "Privacy: local-only; prompt bodies and raw paths stay hidden.",
  ].join("\n");
}

export function formatPairReadiness(
  readiness: BenchmarkPairCandidateReport,
): string {
  if (readiness.status === "ready") {
    return `${readiness.baseline_candidate_count} baseline · ${readiness.looprelay_candidate_count} LoopRelay · pair review ready`;
  }
  if (readiness.status === "no_completed_outcomes") {
    return "completed outcomes needed";
  }
  if (readiness.status === "incomplete_outcome_evidence") {
    return "outcome evidence incomplete";
  }
  if (readiness.status === "missing_prompt_records") {
    return "prompt records need recovery";
  }
  if (readiness.status === "needs_baseline") {
    return "comparable baseline needed";
  }
  if (readiness.status === "needs_looprelay") {
    return "LoopRelay-assisted outcome needed";
  }
  if (readiness.status === "unsafe_outcome_evidence") {
    return "outcome evidence needs redaction";
  }
  return "no evaluated loops yet";
}

export function formatVerboseLoopStatus(status: LoopRelayStatus): string {
  return [
    `LoopRelay status ${status.status}`,
    `snapshots ${status.snapshot_count}`,
    `approved memories ${status.project_memory.approved_count}`,
    `active worktrees ${status.activity.active_worktrees}`,
    `active sessions ${status.activity.active_sessions}`,
    `worktree review needed ${status.activity.needs_review ? "yes" : "no"}`,
    status.activity.command_center
      ? `command center ${status.activity.command_center.title}`
      : undefined,
    status.activity.command_center
      ? `primary action ${status.activity.command_center.primary_action}`
      : undefined,
    status.activity.command_center
      ? `review packet ${status.activity.command_center.review_packet.status}`
      : undefined,
    status.activity.command_center
      ? `review packet summary ${status.activity.command_center.review_packet.summary}`
      : undefined,
    status.activity.command_center
      ? `review packet next ${status.activity.command_center.review_packet.next_action}`
      : undefined,
    status.activity.command_center?.review_packet.decision_advisory
      ? `review packet advisory ${status.activity.command_center.review_packet.decision_advisory.next_action}`
      : undefined,
    ...(status.activity.command_center?.review_packet.checklist.map(
      (item) => `checklist ${item.label} ${item.status}`,
    ) ?? []),
    ...(status.activity.recent_decisions?.map(
      (decision) =>
        `recent decision ${decision.worktree} ${decision.decision} ${decision.reason}`,
    ) ?? []),
    ...(status.activity.command_center?.review_items
      .slice(0, 3)
      .flatMap((item) => [
        `review ${item.worktree} ${item.recommendation}`,
        `merge readiness ${item.worktree} ${item.merge_readiness.status}`,
        `evidence ${item.worktree} ${item.merge_readiness.evidence} refs ${item.evidence_count}`,
        `command ${item.continuation_command}`,
      ]) ?? []),
    ...status.activity.worktrees
      .slice(0, 3)
      .map(
        (worktree) =>
          `worktree ${worktree.worktree} snapshots ${worktree.snapshots} sessions ${worktree.sessions} latest ${worktree.latest_outcome_status}`,
      ),
    status.memory_candidate
      ? `memory candidate ${status.memory_candidate.eligible ? "eligible" : status.memory_candidate.reason}`
      : "memory candidate none",
    status.latest_snapshot ? "latest loop" : "latest loop none",
    status.latest_snapshot ? `id ${status.latest_snapshot.id}` : undefined,
    status.latest_snapshot
      ? `project ${status.latest_snapshot.project}`
      : undefined,
    status.latest_snapshot ? `tool ${status.latest_snapshot.tool}` : undefined,
    status.latest_snapshot
      ? `prompts ${status.latest_snapshot.prompt_count}`
      : undefined,
    status.latest_snapshot?.prompt_ids?.length
      ? `prompt ids ${status.latest_snapshot.prompt_ids.join(", ")}`
      : undefined,
    status.latest_snapshot?.average_prompt_score === undefined
      ? undefined
      : `average prompt score ${status.latest_snapshot.average_prompt_score}/100`,
    status.latest_compact_boundary
      ? `compact boundary ${status.latest_compact_boundary.event_name} at ${status.latest_compact_boundary.created_at} (${status.latest_compact_boundary.trigger})`
      : "compact boundary none after latest snapshot",
    "",
    "Next actions:",
    ...status.next_actions.map((action) => `- ${action}`),
    "",
    `Next: ${status.next_action}`,
    "",
    "Privacy: local-only, no prompt bodies, no raw paths.",
  ]
    .filter((line): line is string => line !== undefined)
    .join("\n");
}

export function formatLoopMemoryCandidate(
  decision: LoopMemoryCandidateDecision,
): string {
  return [
    `Loop memory candidate ${decision.eligible ? "eligible" : "not eligible"}`,
    `snapshot ${decision.snapshot_id}`,
    `reason ${decision.reason}`,
    decision.candidate ? `title ${decision.candidate.title}` : undefined,
    decision.candidate
      ? `statement ${decision.candidate.statement}`
      : undefined,
    decision.candidate
      ? `evidence ${decision.candidate.evidence_refs.join(", ")}`
      : undefined,
    "",
    decision.eligible
      ? "Next: review and approve before writing memory"
      : "Next: record a passed loop outcome with evidence before proposing memory",
    "",
    "Privacy: local-only, no prompt bodies, no raw paths, no external calls, no automatic memory writes.",
  ]
    .filter((line): line is string => line !== undefined)
    .join("\n");
}

export function formatLoopOutcome(result: {
  snapshot_id: string;
  outcome: LoopSnapshot["outcome"];
  next_action: string;
  next_actions: string[];
}): string {
  return [
    "Loop outcome recorded",
    `snapshot ${result.snapshot_id}`,
    `status ${result.outcome.status}`,
    `summary ${result.outcome.summary}`,
    `evidence ${result.outcome.evidence_refs.join(", ") || "none"}`,
    "",
    `Next: ${result.next_action}`,
    ...result.next_actions.map((action) => `- ${action}`),
    "",
    "Privacy: local-only, no prompt bodies, no raw paths, no external calls, no automatic memory approval.",
  ].join("\n");
}

export function formatLoopMemoryApproval(result: {
  recorded: true;
  memory: ReturnType<
    ReturnType<typeof createSqlitePromptStorage>["recordLoopMemory"]
  >;
  next_action: string;
  next_actions: string[];
}): string {
  return [
    "Loop memory recorded",
    `id ${result.memory.id}`,
    `snapshot ${result.memory.snapshot_id}`,
    `approved by ${result.memory.approved_by}`,
    `statement ${result.memory.statement}`,
    `evidence ${result.memory.evidence_refs.join(", ")}`,
    "",
    `Next: ${result.next_action}`,
    ...result.next_actions.map((action) => `- ${action}`),
    "",
    "Privacy: local-only, no prompt bodies, no raw paths, no external calls, no instruction file writes.",
  ].join("\n");
}

export function formatInstructionPatchProposal(
  proposal: InstructionPatchProposal,
): string {
  return [
    "Loop instruction patch proposal",
    `target ${proposal.target_file}`,
    `writes files ${proposal.writes_files ? "yes" : "no"}`,
    `requires approval ${proposal.requires_user_approval ? "yes" : "no"}`,
    "",
    proposal.diff.trimEnd(),
    "",
    `Next: ${proposal.next_action}`,
    "",
    "Privacy: local-only, no prompt bodies, no raw paths, no external calls, no instruction file writes.",
  ].join("\n");
}

export function formatInstructionPatchApplyResult(
  result: InstructionPatchApplyResult,
): string {
  return [
    "Loop instruction patch applied",
    `target ${result.target_file}`,
    `applied ${result.applied ? "yes" : "no"}`,
    `already present ${result.already_present ? "yes" : "no"}`,
    `writes files ${result.writes_files ? "yes" : "no"}`,
    "",
    `Next: ${result.next_action}`,
    "",
    "Privacy: local-only, no prompt bodies, no raw paths, no external calls.",
  ].join("\n");
}

export function formatLoopMergeDecisionRecord(result: {
  recorded: true;
  decision: ReturnType<
    ReturnType<typeof createSqlitePromptStorage>["recordLoopMergeDecision"]
  >;
  next_action: string;
}): string {
  return [
    "Loop merge decision recorded",
    `id ${result.decision.id}`,
    `worktree ${result.decision.worktree}`,
    `decision ${result.decision.decision}`,
    `reason ${result.decision.reason}`,
    `decided by ${result.decision.decided_by}`,
    "",
    `Next: ${result.next_action}`,
    "",
    "Privacy: local-only, no prompt bodies, no raw paths, no git writes.",
  ].join("\n");
}

export function formatLoopMergeDecisionList(result: {
  decisions: ReturnType<
    ReturnType<typeof createSqlitePromptStorage>["listLoopMergeDecisions"]
  >["items"];
}): string {
  return [
    "Loop merge decisions",
    ...result.decisions.map(
      (decision) =>
        `${decision.created_at} ${decision.worktree} ${decision.decision} ${decision.reason}`,
    ),
    result.decisions.length === 0 ? "none" : undefined,
    "",
    "Privacy: local-only, no prompt bodies, no raw paths, no git writes.",
  ]
    .filter((line): line is string => line !== undefined)
    .join("\n");
}
