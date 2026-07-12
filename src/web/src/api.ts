import {
  isGeneratedContinuationReceipt,
  isLoopBriefRecovery,
  type LoopBrief,
} from "./loop-brief-contract.js";

export type { LoopBrief } from "./loop-brief-contract.js";

export type PromptSummary = {
  id: string;
  tool: string;
  source_event: string;
  session_id: string;
  cwd: string;
  created_at: string;
  received_at: string;
  snippet: string;
  prompt_length: number;
  is_sensitive: boolean;
  excluded_from_analysis: boolean;
  redaction_policy: string;
  adapter_version: string;
  index_status: string;
  tags: string[];
  quality_gaps: string[];
  quality_score: number;
  quality_score_band: PromptQualityScoreBand;
  usefulness: PromptUsefulness;
  duplicate_count: number;
};

export type PromptDetail = PromptSummary & {
  markdown: string;
  analysis?: {
    redaction_notice?: string;
    checklist: Array<{
      key: string;
      label: string;
      status: "good" | "weak" | "missing";
      reason: string;
      suggestion?: string;
    }>;
    tags: string[];
    quality_score: PromptQualityScore;
    analyzer: string;
    created_at: string;
  };
  improvement_drafts: PromptImprovementDraft[];
  judge_score?: PromptJudgeScore;
  loop_outcomes?: PromptLoopOutcomeEvidence[];
  effectiveness?: PromptEffectiveness;
};

export type PromptLoopOutcomeEvidence = {
  snapshot_id: string;
  status: LoopSummary["outcome_status"];
  summary: string;
  evidence_refs: string[];
  tests_run?: number;
  improvement_used: boolean;
};

export type PromptEffectiveness = {
  verdict: "proven" | "mixed" | "unproven";
  summary: string;
  calibration: {
    linked_outcomes: number;
    attributed_outcomes: number;
    passing_outcomes: number;
    failing_outcomes: number;
    total_tests_run: number;
  };
  evidence_refs: string[];
};

export type PromptJudgeScore = {
  id: string;
  prompt_id: string;
  judge_tool: "claude" | "codex";
  score: number;
  reason: string;
  created_at: string;
};

export type PromptImprovementDraft = {
  id: string;
  prompt_id: string;
  draft_text: string;
  analyzer: string;
  changed_sections: PromptQualityGap[];
  safety_notes: string[];
  is_sensitive: boolean;
  redaction_policy: "mask";
  created_at: string;
  copied_at?: string;
  accepted_at?: string;
};

export type PromptUsefulness = {
  copied_count: number;
  last_copied_at?: string;
  bookmarked: boolean;
  bookmarked_at?: string;
};

export type PromptListResponse = {
  items: PromptSummary[];
  next_cursor?: string;
};

function isPromptUsefulness(value: unknown): value is PromptUsefulness {
  const usefulness = value as PromptUsefulness & PromptSummaryRawFields;
  return (
    typeof value === "object" &&
    value !== null &&
    typeof usefulness.copied_count === "number" &&
    typeof usefulness.bookmarked === "boolean" &&
    (usefulness.last_copied_at === undefined ||
      typeof usefulness.last_copied_at === "string") &&
    (usefulness.bookmarked_at === undefined ||
      typeof usefulness.bookmarked_at === "string") &&
    usefulness.markdown === undefined &&
    usefulness.prompt_body === undefined &&
    usefulness.raw_path === undefined
  );
}

type PromptSummaryRawFields = {
  markdown?: unknown;
  prompt_body?: unknown;
  raw_path?: unknown;
};

function isPromptSummaryCore(value: unknown): value is PromptSummary {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const prompt = value as PromptSummary;
  return (
    typeof prompt.id === "string" &&
    typeof prompt.tool === "string" &&
    typeof prompt.source_event === "string" &&
    typeof prompt.session_id === "string" &&
    typeof prompt.cwd === "string" &&
    typeof prompt.created_at === "string" &&
    typeof prompt.received_at === "string" &&
    typeof prompt.snippet === "string" &&
    typeof prompt.prompt_length === "number" &&
    typeof prompt.is_sensitive === "boolean" &&
    typeof prompt.excluded_from_analysis === "boolean" &&
    typeof prompt.redaction_policy === "string" &&
    typeof prompt.adapter_version === "string" &&
    typeof prompt.index_status === "string" &&
    Array.isArray(prompt.tags) &&
    Array.isArray(prompt.quality_gaps) &&
    typeof prompt.quality_score === "number" &&
    typeof prompt.quality_score_band === "string" &&
    isPromptUsefulness(prompt.usefulness) &&
    typeof prompt.duplicate_count === "number"
  );
}

function isPromptSummary(value: unknown): value is PromptSummary {
  if (!isPromptSummaryCore(value)) {
    return false;
  }
  const prompt = value as PromptSummaryRawFields;
  return (
    prompt.markdown === undefined &&
    prompt.prompt_body === undefined &&
    prompt.raw_path === undefined
  );
}

function isPromptDetailSummary(value: unknown): value is PromptSummary {
  if (!isPromptSummaryCore(value)) {
    return false;
  }
  const prompt = value as PromptSummaryRawFields;
  return prompt.prompt_body === undefined && prompt.raw_path === undefined;
}

function parsePromptDetailResponse(body: { data?: unknown }): PromptDetail {
  const detail = body.data;
  const promptDetail =
    typeof detail === "object" && detail !== null
      ? (detail as PromptDetail)
      : undefined;
  if (
    !isPromptDetailSummary(detail) ||
    promptDetail === undefined ||
    typeof promptDetail.markdown !== "string" ||
    !Array.isArray(promptDetail.improvement_drafts) ||
    !promptDetail.improvement_drafts.every(isPromptImprovementDraft) ||
    (promptDetail.analysis !== undefined &&
      !isPromptDetailAnalysis(promptDetail.analysis)) ||
    (promptDetail.judge_score !== undefined &&
      !isPromptJudgeScore(promptDetail.judge_score)) ||
    (promptDetail.loop_outcomes !== undefined &&
      (!Array.isArray(promptDetail.loop_outcomes) ||
        !promptDetail.loop_outcomes.every(isPromptLoopOutcomeEvidence))) ||
    (promptDetail.effectiveness !== undefined &&
      !isPromptEffectiveness(promptDetail.effectiveness))
  ) {
    throw new Error("Prompt not found: Invalid response.");
  }
  return promptDetail;
}

type PromptDetailAnalysis = NonNullable<PromptDetail["analysis"]>;
type PromptDetailChecklistItem = PromptDetailAnalysis["checklist"][number];

function isPromptDetailAnalysis(value: unknown): value is PromptDetailAnalysis {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const analysis = value as PromptDetailAnalysis & PromptSummaryRawFields;
  return (
    Array.isArray(analysis.checklist) &&
    analysis.checklist.every(isPromptDetailChecklistItem) &&
    Array.isArray(analysis.tags) &&
    analysis.tags.every((tag) => typeof tag === "string") &&
    isPromptQualityScore(analysis.quality_score) &&
    typeof analysis.analyzer === "string" &&
    typeof analysis.created_at === "string" &&
    (analysis.redaction_notice === undefined ||
      typeof analysis.redaction_notice === "string") &&
    analysis.markdown === undefined &&
    analysis.prompt_body === undefined &&
    analysis.raw_path === undefined
  );
}

function isPromptDetailChecklistItem(
  value: unknown,
): value is PromptDetailChecklistItem {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const item = value as PromptDetailChecklistItem & PromptSummaryRawFields;
  return (
    typeof item.key === "string" &&
    typeof item.label === "string" &&
    (item.status === "good" ||
      item.status === "weak" ||
      item.status === "missing") &&
    typeof item.reason === "string" &&
    (item.suggestion === undefined || typeof item.suggestion === "string") &&
    item.markdown === undefined &&
    item.prompt_body === undefined &&
    item.raw_path === undefined
  );
}

function isPromptQualityScore(value: unknown): value is PromptQualityScore {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const score = value as PromptQualityScore & PromptSummaryRawFields;
  return (
    typeof score.value === "number" &&
    score.max === 100 &&
    typeof score.band === "string" &&
    Array.isArray(score.breakdown) &&
    score.breakdown.every(
      (item) =>
        typeof item === "object" &&
        item !== null &&
        typeof item.key === "string" &&
        typeof item.weight === "number" &&
        typeof item.earned === "number",
    ) &&
    score.markdown === undefined &&
    score.prompt_body === undefined &&
    score.raw_path === undefined
  );
}

function isPromptJudgeScore(value: unknown): value is PromptJudgeScore {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const score = value as PromptJudgeScore & PromptSummaryRawFields;
  return (
    typeof score.id === "string" &&
    typeof score.prompt_id === "string" &&
    (score.judge_tool === "claude" || score.judge_tool === "codex") &&
    typeof score.score === "number" &&
    typeof score.reason === "string" &&
    typeof score.created_at === "string" &&
    score.markdown === undefined &&
    score.prompt_body === undefined &&
    score.raw_path === undefined
  );
}

function isPromptLoopOutcomeEvidence(
  value: unknown,
): value is PromptLoopOutcomeEvidence {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const outcome = value as PromptLoopOutcomeEvidence & PromptSummaryRawFields;
  return (
    typeof outcome.snapshot_id === "string" &&
    typeof outcome.status === "string" &&
    typeof outcome.summary === "string" &&
    Array.isArray(outcome.evidence_refs) &&
    outcome.evidence_refs.every((ref) => typeof ref === "string") &&
    (outcome.tests_run === undefined ||
      typeof outcome.tests_run === "number") &&
    outcome.markdown === undefined &&
    outcome.prompt_body === undefined &&
    outcome.raw_path === undefined
  );
}

function isPromptEffectiveness(value: unknown): value is PromptEffectiveness {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const effectiveness = value as PromptEffectiveness & PromptSummaryRawFields;
  return (
    (effectiveness.verdict === "proven" ||
      effectiveness.verdict === "mixed" ||
      effectiveness.verdict === "unproven") &&
    typeof effectiveness.summary === "string" &&
    isPromptEffectivenessCalibration(effectiveness.calibration) &&
    Array.isArray(effectiveness.evidence_refs) &&
    effectiveness.evidence_refs.every(isRawFreeArchiveText) &&
    effectiveness.markdown === undefined &&
    effectiveness.prompt_body === undefined &&
    effectiveness.raw_path === undefined
  );
}

function isPromptEffectivenessCalibration(
  value: unknown,
): value is PromptEffectiveness["calibration"] {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const calibration = value as PromptEffectiveness["calibration"] &
    PromptSummaryRawFields;
  return (
    typeof calibration.linked_outcomes === "number" &&
    typeof calibration.attributed_outcomes === "number" &&
    typeof calibration.passing_outcomes === "number" &&
    typeof calibration.failing_outcomes === "number" &&
    typeof calibration.total_tests_run === "number" &&
    calibration.markdown === undefined &&
    calibration.prompt_body === undefined &&
    calibration.raw_path === undefined
  );
}

function isPromptImprovementDraft(
  value: unknown,
): value is PromptImprovementDraft {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const draft = value as PromptImprovementDraft & PromptSummaryRawFields;
  return (
    typeof draft.id === "string" &&
    typeof draft.prompt_id === "string" &&
    typeof draft.draft_text === "string" &&
    typeof draft.analyzer === "string" &&
    Array.isArray(draft.changed_sections) &&
    draft.changed_sections.every((section) => typeof section === "string") &&
    Array.isArray(draft.safety_notes) &&
    draft.safety_notes.every((note) => typeof note === "string") &&
    typeof draft.is_sensitive === "boolean" &&
    draft.redaction_policy === "mask" &&
    typeof draft.created_at === "string" &&
    (draft.copied_at === undefined || typeof draft.copied_at === "string") &&
    (draft.accepted_at === undefined ||
      typeof draft.accepted_at === "string") &&
    draft.markdown === undefined &&
    draft.prompt_body === undefined &&
    draft.raw_path === undefined
  );
}

function parsePromptImprovementDraftResponse(body: {
  data?: unknown;
}): PromptImprovementDraft {
  if (!isPromptImprovementDraft(body.data)) {
    throw new Error("Improvement draft save failed: Invalid response.");
  }
  return body.data;
}

function parsePromptUsefulnessResponse(
  body: { data?: { usefulness?: unknown } },
  message: string,
): PromptUsefulness {
  if (!isPromptUsefulness(body.data?.usefulness)) {
    throw new Error(`${message}: Invalid response.`);
  }
  return body.data.usefulness;
}

function parsePromptImprovementDraftCopyResponse(body: {
  data?: {
    id?: unknown;
    prompt_id?: unknown;
    copied_at?: unknown;
    markdown?: unknown;
    prompt_body?: unknown;
    raw_path?: unknown;
  };
}): Pick<PromptImprovementDraft, "id" | "prompt_id" | "copied_at"> {
  if (
    typeof body.data?.id !== "string" ||
    typeof body.data.prompt_id !== "string" ||
    typeof body.data.copied_at !== "string" ||
    body.data.markdown !== undefined ||
    body.data.prompt_body !== undefined ||
    body.data.raw_path !== undefined
  ) {
    throw new Error("Improvement draft copy event failed: Invalid response.");
  }
  return body.data as Pick<
    PromptImprovementDraft,
    "id" | "prompt_id" | "copied_at"
  >;
}

function parsePromptListResponse(body: {
  data?: {
    items?: unknown;
    next_cursor?: unknown;
  };
}): PromptListResponse {
  if (
    !Array.isArray(body.data?.items) ||
    !isRawFreePromptListRoot(body.data) ||
    !body.data.items.every(isPromptSummary) ||
    (body.data.next_cursor !== undefined &&
      typeof body.data.next_cursor !== "string")
  ) {
    throw new Error("Prompt list failed: Invalid response.");
  }
  return body.data as PromptListResponse;
}

function isRawFreePromptListRoot(value: unknown): value is Partial<{
  items: PromptSummary[];
  next_cursor: string;
}> {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const response = value as {
    cwd?: unknown;
    markdown?: unknown;
    prompt_body?: unknown;
    raw_path?: unknown;
  };
  return (
    response.cwd === undefined &&
    response.markdown === undefined &&
    response.prompt_body === undefined &&
    response.raw_path === undefined
  );
}

function parsePromptSummaryArrayResponse(
  body: { data?: unknown },
  message: string,
): PromptSummary[] {
  if (!Array.isArray(body.data) || !body.data.every(isPromptSummary)) {
    throw new Error(`${message}: Invalid response.`);
  }
  return body.data;
}

export type LoopSummary = {
  id: string;
  project_id?: string;
  created_at: string;
  tool: string;
  source: string;
  project: string;
  branch?: string;
  worktree?: string;
  prompt_count: number;
  prompt_ids?: string[];
  used_improvement_prompt_ids?: string[];
  average_prompt_score?: number;
  top_gaps: string[];
  outcome_status: string;
  compact_boundary?: {
    id: string;
    created_at: string;
    tool: string;
    event_name: "PreCompact" | "PostCompact";
    trigger: "manual" | "auto" | "unknown";
    content_hash?: string;
    after_latest_snapshot: true;
  };
};

export type LoopListResponse = {
  status: {
    status: "ready" | "empty";
    snapshot_count: number;
    activity: {
      active_worktrees: number;
      active_sessions: number;
      latest_branch?: string;
      latest_worktree?: string;
      needs_review: boolean;
      next_action:
        | "create first local loop snapshot"
        | "compare loop snapshots by worktree before merging agent output"
        | "continue current worktree loop";
      recent_decisions?: Array<{
        snapshot_id: string;
        worktree: string;
        decision: "merge" | "continue" | "defer";
        reason: string;
        decided_by: string;
        created_at: string;
      }>;
      worktrees: Array<{
        worktree: string;
        branch?: string;
        sessions: number;
        snapshots: number;
        latest_snapshot_id: string;
        latest_created_at: string;
        latest_outcome_status: string;
        evidence_count: number;
      }>;
      command_center?: {
        title: "Multi-worktree review";
        primary_action: string;
        review_packet: {
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
          actions: Array<
            | "compare evidence before merge"
            | "review outcome before merge"
            | "record loop outcome evidence"
          >;
          checklist: Array<{
            label:
              | "Compare ready evidence before merge"
              | "Review non-passing worktrees before merge"
              | "Record missing evidence before merge";
            status: "required";
            action:
              | "compare evidence before merge"
              | "review outcome before merge"
              | "record loop outcome evidence";
          }>;
        };
        review_items: Array<{
          worktree: string;
          branch?: string;
          sessions: number;
          snapshots: number;
          latest_snapshot_id: string;
          latest_created_at: string;
          latest_outcome_status: string;
          evidence_count: number;
          recommendation: "review before merge" | "ready for continuation";
          continuation_command: string;
          merge_readiness: {
            status: "ready" | "needs_review" | "missing_evidence";
            evidence: "evidence present" | "missing evidence";
            next_action:
              | "compare evidence before merge"
              | "review outcome before merge"
              | "record loop outcome evidence";
          };
        }>;
      };
    };
    project_memory: {
      approved_count: number;
      included_in_brief: boolean;
    };
    memory_candidate?: {
      eligible: boolean;
      reason:
        | "passed_with_evidence"
        | "outcome_not_passed"
        | "missing_evidence"
        | "missing_summary"
        | "unsafe_summary";
      next_action:
        | "looprelay loop memory-approve"
        | "looprelay loop memory-candidate";
    };
    latest_snapshot?: LoopSummary;
    latest_compact_boundary?: LoopSummary["compact_boundary"];
    next_action: string;
    next_actions: string[];
    privacy: {
      local_only: true;
      external_calls: false;
      returns_prompt_bodies: false;
      returns_raw_paths: false;
      returns_compact_content: false;
    };
  };
  benchmark_readiness: BenchmarkReadiness;
  items: LoopSummary[];
  privacy: {
    local_only: true;
    returns_prompt_bodies: false;
    returns_raw_paths: false;
    returns_compact_content: false;
  };
};

export type BenchmarkReadiness = {
  status:
    | "ready"
    | "no_completed_outcomes"
    | "no_attributed_outcomes"
    | "incomplete_outcome_evidence"
    | "unsafe_outcome_evidence"
    | "missing_prompt_records"
    | "empty_archive";
  candidate_count: number;
  candidates: Array<{
    prompt_id: string;
    snapshot_id: string;
    outcome_status: "passed" | "failed";
    tests_run: number;
    evidence_ref_count: number;
  }>;
  excluded_unsafe_candidates: number;
  excluded_missing_candidates: number;
  diagnostics: {
    completed_snapshots: number;
    attributed_snapshots: number;
    evidence_complete_snapshots: number;
    safe_snapshots: number;
  };
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

function isBenchmarkReadiness(value: unknown): value is BenchmarkReadiness {
  if (typeof value !== "object" || value === null) return false;
  const report = value as BenchmarkReadiness;
  const statuses: BenchmarkReadiness["status"][] = [
    "ready",
    "no_completed_outcomes",
    "no_attributed_outcomes",
    "incomplete_outcome_evidence",
    "unsafe_outcome_evidence",
    "missing_prompt_records",
    "empty_archive",
  ];
  return (
    statuses.includes(report.status) &&
    Number.isInteger(report.candidate_count) &&
    report.candidate_count >= 0 &&
    Array.isArray(report.candidates) &&
    report.candidates.every(isBenchmarkCandidate) &&
    Number.isInteger(report.excluded_unsafe_candidates) &&
    report.excluded_unsafe_candidates >= 0 &&
    Number.isInteger(report.excluded_missing_candidates) &&
    report.excluded_missing_candidates >= 0 &&
    isBenchmarkDiagnostics(report.diagnostics) &&
    typeof report.has_more === "boolean" &&
    isBenchmarkScope(report.scope) &&
    typeof report.next_action === "string" &&
    isBenchmarkPrivacy(report.privacy)
  );
}

function isBenchmarkCandidate(
  value: unknown,
): value is BenchmarkReadiness["candidates"][number] {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as BenchmarkReadiness["candidates"][number];
  return (
    /^prmt_[A-Za-z0-9_-]+$/.test(candidate.prompt_id) &&
    typeof candidate.snapshot_id === "string" &&
    (candidate.outcome_status === "passed" ||
      candidate.outcome_status === "failed") &&
    Number.isInteger(candidate.tests_run) &&
    candidate.tests_run >= 0 &&
    Number.isInteger(candidate.evidence_ref_count) &&
    candidate.evidence_ref_count >= 0
  );
}

function isBenchmarkDiagnostics(
  value: unknown,
): value is BenchmarkReadiness["diagnostics"] {
  if (typeof value !== "object" || value === null) return false;
  const diagnostics = value as BenchmarkReadiness["diagnostics"];
  return [
    diagnostics.completed_snapshots,
    diagnostics.attributed_snapshots,
    diagnostics.evidence_complete_snapshots,
    diagnostics.safe_snapshots,
  ].every((count) => Number.isInteger(count) && count >= 0);
}

function isBenchmarkScope(
  value: unknown,
): value is BenchmarkReadiness["scope"] {
  if (typeof value !== "object" || value === null) return false;
  const scope = value as BenchmarkReadiness["scope"];
  return (
    Number.isInteger(scope.scanned_snapshots) &&
    scope.scanned_snapshots >= 0 &&
    scope.scanned_snapshots <= 100 &&
    scope.snapshot_limit === 100
  );
}

function isBenchmarkPrivacy(
  value: unknown,
): value is BenchmarkReadiness["privacy"] {
  if (typeof value !== "object" || value === null) return false;
  const privacy = value as BenchmarkReadiness["privacy"];
  return (
    privacy.local_only === true &&
    privacy.external_calls === false &&
    privacy.returns_prompt_bodies === false &&
    privacy.returns_raw_paths === false &&
    privacy.returns_evidence_refs === false
  );
}

function isLoopCompactBoundary(
  value: unknown,
): value is NonNullable<LoopSummary["compact_boundary"]> {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const boundary = value as NonNullable<LoopSummary["compact_boundary"]>;
  return (
    typeof boundary.id === "string" &&
    typeof boundary.created_at === "string" &&
    typeof boundary.tool === "string" &&
    (boundary.event_name === "PreCompact" ||
      boundary.event_name === "PostCompact") &&
    (boundary.trigger === "manual" ||
      boundary.trigger === "auto" ||
      boundary.trigger === "unknown") &&
    (boundary.content_hash === undefined ||
      typeof boundary.content_hash === "string") &&
    boundary.after_latest_snapshot === true
  );
}

function isLoopSummary(value: unknown): value is LoopSummary {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const loop = value as LoopSummary;
  return (
    typeof loop.id === "string" &&
    (loop.project_id === undefined || typeof loop.project_id === "string") &&
    typeof loop.created_at === "string" &&
    typeof loop.tool === "string" &&
    typeof loop.source === "string" &&
    typeof loop.project === "string" &&
    (loop.branch === undefined || typeof loop.branch === "string") &&
    (loop.worktree === undefined || typeof loop.worktree === "string") &&
    typeof loop.prompt_count === "number" &&
    isOptionalStringArray(loop.prompt_ids) &&
    isOptionalStringArray(loop.used_improvement_prompt_ids) &&
    (loop.average_prompt_score === undefined ||
      typeof loop.average_prompt_score === "number") &&
    Array.isArray(loop.top_gaps) &&
    loop.top_gaps.every((gap) => typeof gap === "string") &&
    typeof loop.outcome_status === "string" &&
    (loop.compact_boundary === undefined ||
      isLoopCompactBoundary(loop.compact_boundary))
  );
}

function isLoopWorktreeSummary(value: unknown): value is LoopSummary & {
  prompt_ids?: string[];
  used_improvement_prompt_ids?: string[];
} {
  if (!isLoopSummary(value)) return false;
  const item = value as {
    prompt_ids?: unknown;
    used_improvement_prompt_ids?: unknown;
  };
  return (
    isOptionalStringArray(item.prompt_ids) &&
    isOptionalStringArray(item.used_improvement_prompt_ids)
  );
}

function isOptionalStringArray(value: unknown): boolean {
  return (
    value === undefined ||
    (Array.isArray(value) && value.every((item) => typeof item === "string"))
  );
}

function isLoopStatusPrivacy(
  value: unknown,
): value is LoopListResponse["status"]["privacy"] {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const privacy = value as LoopListResponse["status"]["privacy"];
  return (
    privacy.local_only === true &&
    privacy.external_calls === false &&
    privacy.returns_prompt_bodies === false &&
    privacy.returns_raw_paths === false &&
    privacy.returns_compact_content === false
  );
}

function isLoopListPrivacy(
  value: unknown,
): value is LoopListResponse["privacy"] {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const privacy = value as LoopListResponse["privacy"];
  return (
    privacy.local_only === true &&
    privacy.returns_prompt_bodies === false &&
    privacy.returns_raw_paths === false &&
    privacy.returns_compact_content === false
  );
}

function isLoopWorktreeSelectionScope(
  value: unknown,
): value is LoopWorktreeResponse["selection_scope"] {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const scope = value as LoopWorktreeResponse["selection_scope"];
  return (
    scope.label === "Selection scope" &&
    isSelectedCommandFilterTuple(scope.filters) &&
    (scope.reason === "showing latest snapshots for selected worktree" ||
      scope.reason ===
        "showing snapshots filtered by selected worktree and session" ||
      scope.reason ===
        "showing snapshots filtered by selected worktree and branch" ||
      scope.reason ===
        "showing snapshots filtered by selected worktree, session, and branch") &&
    (scope.next_action === "copy selected worktree brief" ||
      scope.next_action === "copy selected session brief" ||
      scope.next_action === "copy selected branch brief" ||
      scope.next_action === "copy selected session and branch brief")
  );
}

function isLoopWorktreeSnapshotAge(
  value: unknown,
): value is NonNullable<LoopWorktreeResponse["snapshot_age"]> {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const age = value as NonNullable<LoopWorktreeResponse["snapshot_age"]>;
  return (
    age.label === "Selected snapshot age" &&
    typeof age.latest_selected_created_at === "string" &&
    (age.status === "latest" || age.status === "older_than_latest") &&
    (age.reason === "selected snapshot is the latest recorded loop snapshot" ||
      age.reason ===
        "another loop snapshot was recorded after this selection") &&
    (age.next_action === "copy selected worktree brief" ||
      age.next_action === "refresh selected worktree before merging")
  );
}

function isSelectedCommandFilterTuple(value: unknown): boolean {
  const filters = JSON.stringify(value);
  return (
    filters === JSON.stringify(["worktree"]) ||
    filters === JSON.stringify(["worktree", "session"]) ||
    filters === JSON.stringify(["worktree", "branch"]) ||
    filters === JSON.stringify(["worktree", "session", "branch"])
  );
}

function isReviewCommandFilterTuple(value: unknown): boolean {
  const filters = JSON.stringify(value);
  return (
    filters === JSON.stringify(["worktree"]) ||
    filters === JSON.stringify(["worktree", "branch"])
  );
}

function isSelectedBriefAction(
  value: unknown,
): value is NonNullable<LoopWorktreeResponse["selected_brief_action"]> {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const action = value as NonNullable<
    LoopWorktreeResponse["selected_brief_action"]
  >;
  return (
    action.label === "Selected brief action" &&
    action.action === "copy selected continuation brief" &&
    action.reason ===
      "uses the selected worktree/session/branch filters without auto-submitting" &&
    typeof action.command === "string" &&
    action.writes_files === false &&
    action.external_calls === false
  );
}

function isCommandDistinction(
  value: unknown,
): value is NonNullable<LoopWorktreeResponse["command_distinction"]> {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const distinction = value as NonNullable<
    LoopWorktreeResponse["command_distinction"]
  >;
  return (
    distinction.label === "Command distinction" &&
    distinction.selected_command_role ===
      "continue the selected worktree/session/branch filters" &&
    distinction.review_command_role ===
      "copy the review packet command-center hint for merge review" &&
    distinction.reason ===
      "selected continuation and review packet commands can differ when session or branch filters are active" &&
    distinction.writes_files === false &&
    distinction.external_calls === false
  );
}

function isCommandFilters(
  value: unknown,
): value is NonNullable<LoopWorktreeResponse["command_filters"]> {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const filters = value as NonNullable<LoopWorktreeResponse["command_filters"]>;
  return (
    filters.label === "Command filters" &&
    isSelectedCommandFilterTuple(filters.selected_command_filters) &&
    isReviewCommandFilterTuple(filters.review_command_filters) &&
    filters.reason ===
      "selected command reflects the current selection while review command reflects command-center review scope" &&
    filters.writes_files === false &&
    filters.external_calls === false
  );
}

function isCopySideEffects(
  value: unknown,
): value is NonNullable<LoopWorktreeResponse["copy_side_effects"]> {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const sideEffects = value as NonNullable<
    LoopWorktreeResponse["copy_side_effects"]
  >;
  return (
    sideEffects.label === "Copy side effects" &&
    sideEffects.clipboard ===
      "copies the selected continuation brief to the local clipboard" &&
    sideEffects.ui_feedback ===
      "temporarily marks the selected brief copy button as copied" &&
    sideEffects.does_not ===
      "does not write files, execute commands, call external services, submit prompts, or change merge state" &&
    sideEffects.writes_files === false &&
    sideEffects.external_calls === false
  );
}

function isContinuationSafety(
  value: unknown,
): value is NonNullable<LoopWorktreeResponse["continuation_safety"]> {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const safety = value as NonNullable<
    LoopWorktreeResponse["continuation_safety"]
  >;
  return (
    safety.label === "Continuation safety" &&
    Array.isArray(safety.steps) &&
    safety.steps.length === 3 &&
    safety.steps.every((step) => typeof step === "string") &&
    Array.isArray(safety.boundaries) &&
    safety.boundaries.length === 2 &&
    safety.boundaries.every((boundary) => typeof boundary === "string") &&
    safety.local_only === true &&
    safety.writes_files === false &&
    safety.external_calls === false
  );
}

function isLoopActivityWorktree(
  value: unknown,
): value is LoopListResponse["status"]["activity"]["worktrees"][number] {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const worktree =
    value as LoopListResponse["status"]["activity"]["worktrees"][number];
  return (
    typeof worktree.worktree === "string" &&
    (worktree.branch === undefined || typeof worktree.branch === "string") &&
    typeof worktree.sessions === "number" &&
    typeof worktree.snapshots === "number" &&
    typeof worktree.latest_snapshot_id === "string" &&
    typeof worktree.latest_created_at === "string" &&
    typeof worktree.latest_outcome_status === "string" &&
    typeof worktree.evidence_count === "number"
  );
}

function isLoopRecentDecision(
  value: unknown,
): value is NonNullable<
  LoopListResponse["status"]["activity"]["recent_decisions"]
>[number] {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const decision = value as NonNullable<
    LoopListResponse["status"]["activity"]["recent_decisions"]
  >[number];
  return (
    typeof decision.snapshot_id === "string" &&
    typeof decision.worktree === "string" &&
    (decision.decision === "merge" ||
      decision.decision === "continue" ||
      decision.decision === "defer") &&
    typeof decision.reason === "string" &&
    typeof decision.decided_by === "string" &&
    typeof decision.created_at === "string"
  );
}

function isLoopReviewPacketNextAction(
  value: unknown,
): value is
  | "compare ready evidence before merge"
  | "review non-passing worktrees before merge"
  | "record missing evidence before merge" {
  return (
    value === "compare ready evidence before merge" ||
    value === "review non-passing worktrees before merge" ||
    value === "record missing evidence before merge"
  );
}

function isLoopReviewAction(
  value: unknown,
): value is
  | "compare evidence before merge"
  | "review outcome before merge"
  | "record loop outcome evidence" {
  return (
    value === "compare evidence before merge" ||
    value === "review outcome before merge" ||
    value === "record loop outcome evidence"
  );
}

type LoopCommandCenter = NonNullable<
  LoopListResponse["status"]["activity"]["command_center"]
>;
type LoopReviewPacket = LoopCommandCenter["review_packet"];
type LoopReviewChecklistItem = LoopReviewPacket["checklist"][number];
type LoopDecisionAdvisory = NonNullable<LoopReviewPacket["decision_advisory"]>;
type LoopCommandCenterReviewItem = LoopCommandCenter["review_items"][number];
type LoopMergeReadiness = LoopCommandCenterReviewItem["merge_readiness"];

function isLoopReviewChecklistItem(
  value: unknown,
): value is LoopReviewChecklistItem {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const item = value as LoopReviewChecklistItem;
  return (
    (item.label === "Compare ready evidence before merge" ||
      item.label === "Review non-passing worktrees before merge" ||
      item.label === "Record missing evidence before merge") &&
    item.status === "required" &&
    isLoopReviewAction(item.action)
  );
}

function isLoopDecisionAdvisory(value: unknown): value is LoopDecisionAdvisory {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const advisory = value as LoopDecisionAdvisory;
  return (
    typeof advisory.summary === "string" &&
    (advisory.next_action === "honor recent continue decision before merge" ||
      advisory.next_action === "honor recent defer decision before merge" ||
      advisory.next_action === "confirm recent merge decision before merge")
  );
}

function isLoopReviewPacket(value: unknown): value is LoopReviewPacket {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const packet = value as LoopReviewPacket;
  return (
    packet.title === "Review-before-merge packet" &&
    (packet.status === "ready" ||
      packet.status === "needs_review" ||
      packet.status === "blocked") &&
    typeof packet.summary === "string" &&
    isLoopReviewPacketNextAction(packet.next_action) &&
    (packet.decision_advisory === undefined ||
      isLoopDecisionAdvisory(packet.decision_advisory)) &&
    typeof packet.ready_count === "number" &&
    typeof packet.needs_review_count === "number" &&
    typeof packet.missing_evidence_count === "number" &&
    Array.isArray(packet.actions) &&
    packet.actions.every(isLoopReviewAction) &&
    Array.isArray(packet.checklist) &&
    packet.checklist.every(isLoopReviewChecklistItem)
  );
}

function isLoopMergeReadiness(value: unknown): value is LoopMergeReadiness {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const readiness = value as LoopMergeReadiness;
  return (
    (readiness.status === "ready" ||
      readiness.status === "needs_review" ||
      readiness.status === "missing_evidence") &&
    (readiness.evidence === "evidence present" ||
      readiness.evidence === "missing evidence") &&
    isLoopReviewAction(readiness.next_action)
  );
}

function isLoopCommandCenterReviewItem(
  value: unknown,
): value is LoopCommandCenterReviewItem {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const item = value as LoopCommandCenterReviewItem;
  return (
    typeof item.worktree === "string" &&
    (item.branch === undefined || typeof item.branch === "string") &&
    typeof item.sessions === "number" &&
    typeof item.snapshots === "number" &&
    typeof item.latest_snapshot_id === "string" &&
    typeof item.latest_created_at === "string" &&
    typeof item.latest_outcome_status === "string" &&
    typeof item.evidence_count === "number" &&
    (item.recommendation === "review before merge" ||
      item.recommendation === "ready for continuation") &&
    typeof item.continuation_command === "string" &&
    isLoopMergeReadiness(item.merge_readiness)
  );
}

function isLoopCommandCenter(
  value: unknown,
): value is NonNullable<
  LoopListResponse["status"]["activity"]["command_center"]
> {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const commandCenter = value as NonNullable<
    LoopListResponse["status"]["activity"]["command_center"]
  >;
  return (
    commandCenter.title === "Multi-worktree review" &&
    typeof commandCenter.primary_action === "string" &&
    isLoopReviewPacket(commandCenter.review_packet) &&
    Array.isArray(commandCenter.review_items) &&
    commandCenter.review_items.every(isLoopCommandCenterReviewItem)
  );
}

function isLoopStatusActivity(
  value: unknown,
): value is LoopListResponse["status"]["activity"] {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const activity = value as LoopListResponse["status"]["activity"];
  return (
    typeof activity.active_worktrees === "number" &&
    typeof activity.active_sessions === "number" &&
    (activity.latest_branch === undefined ||
      typeof activity.latest_branch === "string") &&
    (activity.latest_worktree === undefined ||
      typeof activity.latest_worktree === "string") &&
    typeof activity.needs_review === "boolean" &&
    (activity.next_action === "create first local loop snapshot" ||
      activity.next_action ===
        "compare loop snapshots by worktree before merging agent output" ||
      activity.next_action === "continue current worktree loop") &&
    (activity.recent_decisions === undefined ||
      (Array.isArray(activity.recent_decisions) &&
        activity.recent_decisions.every(isLoopRecentDecision))) &&
    Array.isArray(activity.worktrees) &&
    activity.worktrees.every(isLoopActivityWorktree) &&
    (activity.command_center === undefined ||
      isLoopCommandCenter(activity.command_center))
  );
}

function isLoopProjectMemory(
  value: unknown,
): value is LoopListResponse["status"]["project_memory"] {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const projectMemory = value as LoopListResponse["status"]["project_memory"];
  return (
    typeof projectMemory.approved_count === "number" &&
    typeof projectMemory.included_in_brief === "boolean"
  );
}

function isLoopMemoryCandidate(
  value: unknown,
): value is NonNullable<LoopListResponse["status"]["memory_candidate"]> {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const candidate = value as NonNullable<
    LoopListResponse["status"]["memory_candidate"]
  >;
  return (
    typeof candidate.eligible === "boolean" &&
    (candidate.reason === "passed_with_evidence" ||
      candidate.reason === "outcome_not_passed" ||
      candidate.reason === "missing_evidence" ||
      candidate.reason === "missing_summary" ||
      candidate.reason === "unsafe_summary") &&
    (candidate.next_action === "looprelay loop memory-approve" ||
      candidate.next_action === "looprelay loop memory-candidate")
  );
}

function isLoopStatusCore(value: unknown): value is LoopListResponse["status"] {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const status = value as LoopListResponse["status"];
  return (
    (status.status === "ready" || status.status === "empty") &&
    typeof status.snapshot_count === "number" &&
    typeof status.next_action === "string" &&
    Array.isArray(status.next_actions) &&
    status.next_actions.every((action) => typeof action === "string")
  );
}

export type LoopWorktreeResponse = {
  worktree: string;
  session_id?: string;
  branch?: string;
  memory_approved?: boolean;
  memory_candidate?: LoopListResponse["status"]["memory_candidate"];
  selection_scope: {
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
  };
  snapshot_age?: {
    label: "Selected snapshot age";
    latest_selected_created_at: string;
    status: "latest" | "older_than_latest";
    reason:
      | "selected snapshot is the latest recorded loop snapshot"
      | "another loop snapshot was recorded after this selection";
    next_action:
      | "copy selected worktree brief"
      | "refresh selected worktree before merging";
  };
  selected_brief_action?: {
    label: "Selected brief action";
    action: "copy selected continuation brief";
    reason: "uses the selected worktree/session/branch filters without auto-submitting";
    command: string;
    writes_files: false;
    external_calls: false;
  };
  command_distinction?: {
    label: "Command distinction";
    selected_command_role: "continue the selected worktree/session/branch filters";
    review_command_role: "copy the review packet command-center hint for merge review";
    reason: "selected continuation and review packet commands can differ when session or branch filters are active";
    writes_files: false;
    external_calls: false;
  };
  command_filters?: {
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
  };
  copy_side_effects?: {
    label: "Copy side effects";
    clipboard: "copies the selected continuation brief to the local clipboard";
    ui_feedback: "temporarily marks the selected brief copy button as copied";
    does_not: "does not write files, execute commands, call external services, submit prompts, or change merge state";
    writes_files: false;
    external_calls: false;
  };
  continuation_safety?: {
    label: "Continuation safety";
    steps: string[];
    boundaries: string[];
    local_only: true;
    writes_files: false;
    external_calls: false;
  };
  latest_decision?: {
    snapshot_id: string;
    worktree: string;
    decision: "merge" | "continue" | "defer";
    reason: string;
    decided_by: string;
    created_at: string;
  };
  review_packet_summary?: {
    title: "Review-before-merge packet";
    status: "ready" | "needs_review" | "blocked";
    summary: string;
    next_action:
      | "compare ready evidence before merge"
      | "review non-passing worktrees before merge"
      | "record missing evidence before merge";
    worktree: string;
    merge_readiness: "ready" | "needs_review" | "missing_evidence";
    worktree_action:
      | "compare evidence before merge"
      | "review outcome before merge"
      | "record loop outcome evidence";
    readiness_summary: {
      label: "Readiness summary";
      status: "ready" | "needs_review" | "missing_evidence";
      reason:
        | "selected worktree has recorded evidence and passing outcome"
        | "latest selected worktree outcome is not passing"
        | "latest selected worktree outcome has no evidence refs";
      next_action:
        | "compare evidence before merge"
        | "review outcome before merge"
        | "record loop outcome evidence";
    };
    brief_rationale: {
      label: "Brief rationale";
      merge_readiness: "ready" | "needs_review" | "missing_evidence";
      reason:
        | "selected brief continues a ready worktree after evidence comparison"
        | "selected brief continues review work without marking it merge-ready"
        | "selected brief can continue evidence collection before merge";
      next_action: "copy selected continuation brief";
      merge_gate:
        | "compare evidence before merge"
        | "review outcome before merge"
        | "record loop outcome evidence";
    };
    evidence_count_explanation: {
      label: "Evidence count";
      count: number;
      reason:
        | "selected worktree has evidence refs recorded"
        | "selected worktree has no evidence refs recorded";
      next_action:
        | "compare evidence before merge"
        | "record loop outcome evidence";
    };
    reviewer_checklist_preview: Array<{
      label:
        | "Compare ready evidence before merge"
        | "Review non-passing worktrees before merge"
        | "Record missing evidence before merge";
      status: "required";
      action:
        | "compare evidence before merge"
        | "review outcome before merge"
        | "record loop outcome evidence";
    }>;
    command_hint: {
      label: "Copy review brief command";
      command: string;
      provenance: {
        label: "Command provenance";
        source: "existing command-center continuation command";
        reason: "reuses safe selected worktree metadata without reading git or executing commands";
        writes_files: false;
        external_calls: false;
      };
    };
    missing_evidence_explanation?: {
      label: "Missing evidence";
      reason: "latest selected worktree outcome has no evidence refs";
      next_action: "record loop outcome evidence";
    };
  };
  items: Array<
    LoopSummary & {
      prompt_ids?: string[];
      used_improvement_prompt_ids?: string[];
    }
  >;
  privacy: {
    local_only: true;
    returns_prompt_bodies: false;
    returns_raw_paths: false;
    returns_compact_content: false;
  };
};

function parseLoopBriefResponse(
  body: {
    data?: {
      title?: unknown;
      prompt?: unknown;
      source_snapshot_id?: unknown;
      recovery?: unknown;
      receipt?: unknown;
      compact_boundary?: unknown;
      privacy?: {
        local_only?: unknown;
        returns_prompt_bodies?: unknown;
        returns_raw_paths?: unknown;
      };
    };
  },
  message: string,
): LoopBrief {
  if (
    typeof body.data?.title !== "string" ||
    typeof body.data.prompt !== "string" ||
    typeof body.data.source_snapshot_id !== "string" ||
    !isLoopBriefRecovery(body.data.recovery) ||
    (body.data.receipt !== undefined &&
      !isGeneratedContinuationReceipt(body.data.receipt)) ||
    (body.data.compact_boundary !== undefined &&
      !isLoopCompactBoundary(body.data.compact_boundary)) ||
    body.data.privacy?.local_only !== true ||
    body.data.privacy.returns_prompt_bodies !== false ||
    body.data.privacy.returns_raw_paths !== false
  ) {
    throw new Error(`${message}: Invalid response.`);
  }
  return body.data as LoopBrief;
}

export type LoopMemoryApprovalResult = {
  recorded: true;
  memory: {
    id: string;
    snapshot_id: string;
    title: string;
    evidence_refs: string[];
    approved_by: string;
    created_at: string;
    privacy: {
      local_only: true;
      stores_prompt_bodies: false;
      stores_raw_paths: false;
      writes_instruction_files: false;
      external_calls: false;
    };
  };
  next_action: string;
  next_actions: string[];
  privacy: {
    local_only: true;
    returns_prompt_bodies: false;
    returns_raw_paths: false;
    writes_instruction_files: false;
    external_calls: false;
  };
};

export type LoopOutcomeStatus =
  | "unknown"
  | "in_progress"
  | "passed"
  | "failed"
  | "blocked"
  | "abandoned";

export type LoopOutcomeRecordResult = {
  recorded: true;
  snapshot_id: string;
  outcome: {
    status: LoopOutcomeStatus;
    summary: string;
    evidence_refs: string[];
    used_improvement_prompt_ids?: string[];
  };
  next_actions: string[];
  privacy: {
    local_only: true;
    returns_prompt_bodies: false;
    returns_raw_paths: false;
    external_calls: false;
    auto_approves_memory: false;
  };
};

function parseLoopOutcomeRecordResponse(
  body: { data?: unknown },
  message: string,
): LoopOutcomeRecordResult {
  const data = body.data as Partial<LoopOutcomeRecordResult> | undefined;
  const outcome = data?.outcome;
  const privacy = data?.privacy;
  if (
    data?.recorded !== true ||
    typeof data.snapshot_id !== "string" ||
    !outcome ||
    !isLoopOutcomeStatus(outcome.status) ||
    typeof outcome.summary !== "string" ||
    !Array.isArray(outcome.evidence_refs) ||
    !outcome.evidence_refs.every(
      (reference) => typeof reference === "string",
    ) ||
    (outcome.used_improvement_prompt_ids !== undefined &&
      (!Array.isArray(outcome.used_improvement_prompt_ids) ||
        !outcome.used_improvement_prompt_ids.every(
          (promptId) => typeof promptId === "string",
        ))) ||
    !Array.isArray(data.next_actions) ||
    !data.next_actions.every((action) => typeof action === "string") ||
    privacy?.local_only !== true ||
    privacy.returns_prompt_bodies !== false ||
    privacy.returns_raw_paths !== false ||
    privacy.external_calls !== false ||
    privacy.auto_approves_memory !== false
  ) {
    throw new Error(`${message}: Invalid response.`);
  }
  return data as LoopOutcomeRecordResult;
}

function isLoopOutcomeStatus(value: unknown): value is LoopOutcomeStatus {
  return (
    value === "unknown" ||
    value === "in_progress" ||
    value === "passed" ||
    value === "failed" ||
    value === "blocked" ||
    value === "abandoned"
  );
}

function parseLoopMemoryApprovalResponse(
  body: {
    data?: {
      recorded?: unknown;
      memory?: {
        id?: unknown;
        snapshot_id?: unknown;
        title?: unknown;
        evidence_refs?: unknown;
        approved_by?: unknown;
        created_at?: unknown;
        privacy?: {
          local_only?: unknown;
          stores_prompt_bodies?: unknown;
          stores_raw_paths?: unknown;
          writes_instruction_files?: unknown;
          external_calls?: unknown;
        };
      };
      next_action?: unknown;
      next_actions?: unknown;
      privacy?: {
        local_only?: unknown;
        returns_prompt_bodies?: unknown;
        returns_raw_paths?: unknown;
        writes_instruction_files?: unknown;
        external_calls?: unknown;
      };
    };
  },
  message: string,
): LoopMemoryApprovalResult {
  if (
    body.data?.recorded !== true ||
    typeof body.data.memory?.id !== "string" ||
    typeof body.data.memory.snapshot_id !== "string" ||
    typeof body.data.memory.title !== "string" ||
    !Array.isArray(body.data.memory.evidence_refs) ||
    !body.data.memory.evidence_refs.every((ref) => typeof ref === "string") ||
    typeof body.data.memory.approved_by !== "string" ||
    typeof body.data.memory.created_at !== "string" ||
    body.data.memory.privacy?.local_only !== true ||
    body.data.memory.privacy.stores_prompt_bodies !== false ||
    body.data.memory.privacy.stores_raw_paths !== false ||
    body.data.memory.privacy.writes_instruction_files !== false ||
    body.data.memory.privacy.external_calls !== false ||
    typeof body.data.next_action !== "string" ||
    !Array.isArray(body.data.next_actions) ||
    !body.data.next_actions.every((action) => typeof action === "string") ||
    body.data.privacy?.local_only !== true ||
    body.data.privacy.returns_prompt_bodies !== false ||
    body.data.privacy.returns_raw_paths !== false ||
    body.data.privacy.writes_instruction_files !== false ||
    body.data.privacy.external_calls !== false
  ) {
    throw new Error(`${message}: Invalid response.`);
  }
  return body.data as LoopMemoryApprovalResult;
}

export type LoopInstructionPatchProposal = {
  target_file: "AGENTS.md" | "CLAUDE.md";
  patch_kind: "append_section";
  title: string;
  diff: string;
  writes_files: false;
  requires_user_approval: true;
  source_memory_id: string;
  next_action: string;
  apply_gate: {
    web_apply_available: false;
    confirm_command: string;
    mcp_tool: "apply_instruction_patch";
    reason: string;
  };
  privacy: {
    local_only: true;
    external_calls: false;
    returns_prompt_bodies: false;
    returns_raw_paths: false;
    writes_instruction_files: false;
  };
};

function parseLoopInstructionPatchProposalResponse(
  body: {
    data?: {
      target_file?: unknown;
      patch_kind?: unknown;
      title?: unknown;
      diff?: unknown;
      writes_files?: unknown;
      requires_user_approval?: unknown;
      source_memory_id?: unknown;
      next_action?: unknown;
      apply_gate?: {
        web_apply_available?: unknown;
        confirm_command?: unknown;
        mcp_tool?: unknown;
        reason?: unknown;
      };
      privacy?: {
        local_only?: unknown;
        external_calls?: unknown;
        returns_prompt_bodies?: unknown;
        returns_raw_paths?: unknown;
        writes_instruction_files?: unknown;
      };
    };
  },
  message: string,
): LoopInstructionPatchProposal {
  if (
    (body.data?.target_file !== "AGENTS.md" &&
      body.data?.target_file !== "CLAUDE.md") ||
    body.data.patch_kind !== "append_section" ||
    typeof body.data.title !== "string" ||
    typeof body.data.diff !== "string" ||
    body.data.writes_files !== false ||
    body.data.requires_user_approval !== true ||
    typeof body.data.source_memory_id !== "string" ||
    typeof body.data.next_action !== "string" ||
    body.data.apply_gate?.web_apply_available !== false ||
    typeof body.data.apply_gate.confirm_command !== "string" ||
    body.data.apply_gate.mcp_tool !== "apply_instruction_patch" ||
    typeof body.data.apply_gate.reason !== "string" ||
    body.data.privacy?.local_only !== true ||
    body.data.privacy.external_calls !== false ||
    body.data.privacy.returns_prompt_bodies !== false ||
    body.data.privacy.returns_raw_paths !== false ||
    body.data.privacy.writes_instruction_files !== false
  ) {
    throw new Error(`${message}: Invalid response.`);
  }
  return body.data as LoopInstructionPatchProposal;
}

export type PromptFilters = {
  query?: string;
  tool?: string;
  cwdPrefix?: string;
  importJobId?: string;
  isSensitive?: "all" | "true" | "false";
  tag?: string;
  focus?: "saved" | "reused" | "duplicated" | "quality-gap";
  qualityGap?: PromptQualityGap;
  receivedFrom?: string;
  receivedTo?: string;
};

export type PromptQualityGap =
  | "goal_clarity"
  | "background_context"
  | "scope_limits"
  | "output_format"
  | "verification_criteria";

export type PromptQualityScoreBand =
  | "excellent"
  | "good"
  | "needs_work"
  | "weak";

export type PromptQualityScore = {
  value: number;
  max: 100;
  band: PromptQualityScoreBand;
  breakdown: Array<{
    key: PromptQualityGap;
    weight: number;
    earned: number;
  }>;
};

export type QualityDashboard = {
  total_prompts: number;
  sensitive_prompts: number;
  sensitive_ratio: number;
  recent: {
    last_7_days: number;
    last_30_days: number;
  };
  trend: {
    daily: Array<{
      date: string;
      prompt_count: number;
      quality_gap_count: number;
      quality_gap_rate: number;
      average_quality_score: number;
      sensitive_count: number;
    }>;
  };
  quality_score: {
    average: number;
    max: 100;
    band: PromptQualityScoreBand;
    scored_prompts: number;
  };
  distribution: {
    by_tool: DistributionBucket[];
    by_project: DistributionBucket[];
  };
  missing_items: Array<{
    key: string;
    label: string;
    missing: number;
    weak: number;
    total: number;
    rate: number;
  }>;
  patterns: Array<{
    project: string;
    item_key: string;
    label: string;
    count: number;
    total: number;
    message: string;
  }>;
  instruction_suggestions: Array<{
    scope: "global" | "project";
    project?: string;
    text: string;
    reason: string;
  }>;
  useful_prompts: Array<{
    id: string;
    tool: string;
    cwd: string;
    received_at: string;
    copied_count: number;
    last_copied_at?: string;
    bookmarked: boolean;
    bookmarked_at?: string;
    tags: string[];
    quality_gaps: string[];
  }>;
  duplicate_prompt_groups: Array<{
    group_id: string;
    count: number;
    latest_received_at: string;
    projects: string[];
    prompts: Array<{
      id: string;
      tool: string;
      cwd: string;
      received_at: string;
      tags: string[];
      quality_gaps: string[];
    }>;
  }>;
  project_profiles: Array<{
    key: string;
    label: string;
    prompt_count: number;
    quality_gap_count: number;
    quality_gap_rate: number;
    average_quality_score: number;
    sensitive_count: number;
    copied_count: number;
    bookmarked_count: number;
    latest_received_at: string;
    top_gap?: {
      key: string;
      label: string;
      count: number;
    };
  }>;
  privacy: {
    local_only: true;
    external_calls: false;
    returns_prompt_bodies: false;
    returns_raw_paths: false;
  };
};

export type DistributionBucket = {
  key: string;
  label: string;
  count: number;
  ratio: number;
};

export type ArchivePromptScoreSummary = {
  id: string;
  tool: string;
  project: string;
  received_at: string;
  quality_score: number;
  quality_score_band: PromptQualityScoreBand;
  quality_gaps: string[];
  tags: string[];
  is_sensitive: boolean;
};

export type ArchiveScoreReport = {
  generated_at: string;
  archive_score: {
    average: number;
    max: 100;
    band: PromptQualityScoreBand;
    scored_prompts: number;
    total_prompts: number;
  };
  distribution: Record<PromptQualityScoreBand, number>;
  top_gaps: Array<{
    label: string;
    count: number;
    rate: number;
  }>;
  practice_plan: Array<{
    priority: number;
    label: string;
    prompt_rule: string;
    reason: string;
    count: number;
    rate: number;
  }>;
  next_prompt_template: string;
  effectiveness_summary: {
    measured_prompts: number;
    unmeasured_prompts: number;
    verdicts: {
      proven: number;
      mixed: number;
      unproven: number;
    };
    calibration: {
      linked_outcomes: number;
      attributed_outcomes: number;
      passing_outcomes: number;
      failing_outcomes: number;
      total_tests_run: number;
    };
    top_evidence_refs: string[];
    next_action: string;
  };
  low_score_prompts: ArchivePromptScoreSummary[];
  filters: {
    tool?: string;
    project?: string;
    received_from?: string;
    received_to?: string;
    max_prompts: number;
  };
  has_more: boolean;
  privacy: {
    local_only: true;
    external_calls: false;
    returns_prompt_bodies: false;
    returns_raw_paths: false;
  };
};

export type SettingsResponse = {
  data_dir: string;
  excluded_project_roots: string[];
  redaction_mode: string;
  server: {
    host: string;
    port: number;
  };
  last_ingest_status?: {
    ok: boolean;
    status?: number;
    checked_at: string;
  };
};

export type AgentReadiness = {
  tool: "codex" | "claude-code";
  status: "ready" | "unverified" | "needs_attention";
  server_ok: boolean;
  token_ok: boolean;
  hook_ok: boolean;
  mcp_registered: boolean;
  ingest: {
    state: "recent" | "stale" | "never" | "failed";
    verified: boolean;
    age_seconds?: number;
  };
  next_action: string;
};

export async function getAgentReadiness(): Promise<AgentReadiness[]> {
  await ensureSession();
  const response = await fetch("/api/v1/agent-readiness", {
    credentials: "same-origin",
  });
  if (!response.ok) {
    await failApi(response, "Agent readiness failed");
  }
  const body = (await response.json()) as {
    data?: { clients?: unknown; privacy?: { returns_raw_paths?: unknown } };
  };
  if (
    !Array.isArray(body.data?.clients) ||
    body.data.privacy?.returns_raw_paths !== false ||
    !body.data.clients.every(isAgentReadiness)
  ) {
    throw new Error("Agent readiness failed: Invalid response.");
  }
  return body.data.clients;
}

function isAgentReadiness(value: unknown): value is AgentReadiness {
  if (typeof value !== "object" || value === null) return false;
  const readiness = value as AgentReadiness & {
    raw_path?: unknown;
    settings?: unknown;
  };
  return (
    (readiness.tool === "codex" || readiness.tool === "claude-code") &&
    ["ready", "unverified", "needs_attention"].includes(readiness.status) &&
    typeof readiness.server_ok === "boolean" &&
    typeof readiness.token_ok === "boolean" &&
    typeof readiness.hook_ok === "boolean" &&
    typeof readiness.mcp_registered === "boolean" &&
    typeof readiness.ingest === "object" &&
    readiness.ingest !== null &&
    ["recent", "stale", "never", "failed"].includes(readiness.ingest.state) &&
    typeof readiness.ingest.verified === "boolean" &&
    (readiness.ingest.age_seconds === undefined ||
      (Number.isInteger(readiness.ingest.age_seconds) &&
        readiness.ingest.age_seconds >= 0)) &&
    typeof readiness.next_action === "string" &&
    readiness.raw_path === undefined &&
    readiness.settings === undefined
  );
}

function isArchiveScorePrivacy(
  value: unknown,
): value is ArchiveScoreReport["privacy"] {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const privacy = value as ArchiveScoreReport["privacy"];
  return (
    privacy.local_only === true &&
    privacy.external_calls === false &&
    privacy.returns_prompt_bodies === false &&
    privacy.returns_raw_paths === false
  );
}

function isQualityDashboardPrivacy(
  value: unknown,
): value is QualityDashboard["privacy"] {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const privacy = value as QualityDashboard["privacy"];
  return (
    privacy.local_only === true &&
    privacy.external_calls === false &&
    privacy.returns_prompt_bodies === false &&
    privacy.returns_raw_paths === false
  );
}

function isRawFreeQualityDashboardRoot(
  value: unknown,
): value is Partial<QualityDashboard> {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const dashboard = value as Partial<QualityDashboard> & {
    cwd?: unknown;
    markdown?: unknown;
    prompt_body?: unknown;
    raw_path?: unknown;
  };
  return (
    dashboard.cwd === undefined &&
    dashboard.markdown === undefined &&
    dashboard.prompt_body === undefined &&
    dashboard.raw_path === undefined
  );
}

function isQualityDashboardScore(
  value: unknown,
): value is QualityDashboard["quality_score"] {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const score = value as QualityDashboard["quality_score"] & {
    cwd?: unknown;
    markdown?: unknown;
    prompt_body?: unknown;
    raw_path?: unknown;
  };
  return (
    typeof score.average === "number" &&
    score.max === 100 &&
    typeof score.band === "string" &&
    typeof score.scored_prompts === "number" &&
    score.cwd === undefined &&
    score.markdown === undefined &&
    score.prompt_body === undefined &&
    score.raw_path === undefined
  );
}

function isQualityDashboardRecent(
  value: unknown,
): value is QualityDashboard["recent"] {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const recent = value as QualityDashboard["recent"] & {
    cwd?: unknown;
    markdown?: unknown;
    prompt_body?: unknown;
    raw_path?: unknown;
  };
  return (
    typeof recent.last_7_days === "number" &&
    typeof recent.last_30_days === "number" &&
    recent.cwd === undefined &&
    recent.markdown === undefined &&
    recent.prompt_body === undefined &&
    recent.raw_path === undefined
  );
}

function isQualityDashboardTrend(
  value: unknown,
): value is QualityDashboard["trend"] {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const trend = value as QualityDashboard["trend"] & {
    cwd?: unknown;
    markdown?: unknown;
    prompt_body?: unknown;
    raw_path?: unknown;
  };
  return (
    Array.isArray(trend.daily) &&
    trend.daily.every(isQualityDashboardTrendDay) &&
    trend.cwd === undefined &&
    trend.markdown === undefined &&
    trend.prompt_body === undefined &&
    trend.raw_path === undefined
  );
}

function isQualityDashboardTrendDay(
  value: unknown,
): value is QualityDashboard["trend"]["daily"][number] {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const day = value as QualityDashboard["trend"]["daily"][number] & {
    cwd?: unknown;
    markdown?: unknown;
    prompt_body?: unknown;
    raw_path?: unknown;
  };
  return (
    typeof day.date === "string" &&
    typeof day.prompt_count === "number" &&
    typeof day.quality_gap_count === "number" &&
    typeof day.quality_gap_rate === "number" &&
    typeof day.average_quality_score === "number" &&
    typeof day.sensitive_count === "number" &&
    day.cwd === undefined &&
    day.markdown === undefined &&
    day.prompt_body === undefined &&
    day.raw_path === undefined
  );
}

function isQualityDashboardDistribution(
  value: unknown,
): value is QualityDashboard["distribution"] {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const distribution = value as QualityDashboard["distribution"];
  return (
    Array.isArray(distribution.by_tool) &&
    distribution.by_tool.every(isQualityDashboardDistributionBucket) &&
    Array.isArray(distribution.by_project) &&
    distribution.by_project.every(isQualityDashboardDistributionBucket)
  );
}

function isQualityDashboardDistributionBucket(
  value: unknown,
): value is DistributionBucket {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const bucket = value as DistributionBucket & {
    cwd?: unknown;
    markdown?: unknown;
    prompt_body?: unknown;
    raw_path?: unknown;
  };
  return (
    typeof bucket.key === "string" &&
    typeof bucket.label === "string" &&
    typeof bucket.count === "number" &&
    typeof bucket.ratio === "number" &&
    bucket.cwd === undefined &&
    bucket.markdown === undefined &&
    bucket.prompt_body === undefined &&
    bucket.raw_path === undefined
  );
}

function isQualityDashboardMissingItem(
  value: unknown,
): value is QualityDashboard["missing_items"][number] {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const item = value as QualityDashboard["missing_items"][number] & {
    cwd?: unknown;
    markdown?: unknown;
    prompt_body?: unknown;
    raw_path?: unknown;
  };
  return (
    typeof item.key === "string" &&
    typeof item.label === "string" &&
    typeof item.missing === "number" &&
    typeof item.weak === "number" &&
    typeof item.total === "number" &&
    typeof item.rate === "number" &&
    item.cwd === undefined &&
    item.markdown === undefined &&
    item.prompt_body === undefined &&
    item.raw_path === undefined
  );
}

function isQualityDashboardPattern(
  value: unknown,
): value is QualityDashboard["patterns"][number] {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const pattern = value as QualityDashboard["patterns"][number] & {
    cwd?: unknown;
    markdown?: unknown;
    prompt_body?: unknown;
    raw_path?: unknown;
  };
  return (
    typeof pattern.project === "string" &&
    typeof pattern.item_key === "string" &&
    typeof pattern.label === "string" &&
    typeof pattern.count === "number" &&
    typeof pattern.total === "number" &&
    typeof pattern.message === "string" &&
    pattern.cwd === undefined &&
    pattern.markdown === undefined &&
    pattern.prompt_body === undefined &&
    pattern.raw_path === undefined
  );
}

function isQualityDashboardInstructionSuggestion(
  value: unknown,
): value is QualityDashboard["instruction_suggestions"][number] {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const suggestion =
    value as QualityDashboard["instruction_suggestions"][number] & {
      cwd?: unknown;
      markdown?: unknown;
      prompt_body?: unknown;
      raw_path?: unknown;
    };
  return (
    (suggestion.scope === "global" || suggestion.scope === "project") &&
    (suggestion.project === undefined ||
      typeof suggestion.project === "string") &&
    typeof suggestion.text === "string" &&
    typeof suggestion.reason === "string" &&
    suggestion.cwd === undefined &&
    suggestion.markdown === undefined &&
    suggestion.prompt_body === undefined &&
    suggestion.raw_path === undefined
  );
}

function isQualityDashboardUsefulPrompt(
  value: unknown,
): value is QualityDashboard["useful_prompts"][number] {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const prompt = value as QualityDashboard["useful_prompts"][number] & {
    markdown?: unknown;
    prompt_body?: unknown;
    raw_path?: unknown;
  };
  return (
    typeof prompt.id === "string" &&
    typeof prompt.tool === "string" &&
    typeof prompt.cwd === "string" &&
    typeof prompt.received_at === "string" &&
    typeof prompt.copied_count === "number" &&
    (prompt.last_copied_at === undefined ||
      typeof prompt.last_copied_at === "string") &&
    typeof prompt.bookmarked === "boolean" &&
    (prompt.bookmarked_at === undefined ||
      typeof prompt.bookmarked_at === "string") &&
    Array.isArray(prompt.tags) &&
    prompt.tags.every((tag) => typeof tag === "string") &&
    Array.isArray(prompt.quality_gaps) &&
    prompt.quality_gaps.every((gap) => typeof gap === "string") &&
    prompt.markdown === undefined &&
    prompt.prompt_body === undefined &&
    prompt.raw_path === undefined
  );
}

function isQualityDashboardDuplicatePromptGroup(
  value: unknown,
): value is QualityDashboard["duplicate_prompt_groups"][number] {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const group = value as QualityDashboard["duplicate_prompt_groups"][number] & {
    markdown?: unknown;
    prompt_body?: unknown;
    raw_path?: unknown;
  };
  return (
    typeof group.group_id === "string" &&
    typeof group.count === "number" &&
    typeof group.latest_received_at === "string" &&
    Array.isArray(group.projects) &&
    group.projects.every((project) => typeof project === "string") &&
    Array.isArray(group.prompts) &&
    group.prompts.every(isQualityDashboardDuplicatePrompt) &&
    group.markdown === undefined &&
    group.prompt_body === undefined &&
    group.raw_path === undefined
  );
}

function isQualityDashboardDuplicatePrompt(
  value: unknown,
): value is QualityDashboard["duplicate_prompt_groups"][number]["prompts"][number] {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const prompt =
    value as QualityDashboard["duplicate_prompt_groups"][number]["prompts"][number] & {
      markdown?: unknown;
      prompt_body?: unknown;
      raw_path?: unknown;
    };
  return (
    typeof prompt.id === "string" &&
    typeof prompt.tool === "string" &&
    typeof prompt.cwd === "string" &&
    typeof prompt.received_at === "string" &&
    Array.isArray(prompt.tags) &&
    prompt.tags.every((tag) => typeof tag === "string") &&
    Array.isArray(prompt.quality_gaps) &&
    prompt.quality_gaps.every((gap) => typeof gap === "string") &&
    prompt.markdown === undefined &&
    prompt.prompt_body === undefined &&
    prompt.raw_path === undefined
  );
}

function isQualityDashboardProjectProfile(
  value: unknown,
): value is QualityDashboard["project_profiles"][number] {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const profile = value as QualityDashboard["project_profiles"][number] & {
    cwd?: unknown;
    markdown?: unknown;
    prompt_body?: unknown;
    raw_path?: unknown;
  };
  return (
    typeof profile.key === "string" &&
    typeof profile.label === "string" &&
    typeof profile.prompt_count === "number" &&
    typeof profile.quality_gap_count === "number" &&
    typeof profile.quality_gap_rate === "number" &&
    typeof profile.average_quality_score === "number" &&
    typeof profile.sensitive_count === "number" &&
    typeof profile.copied_count === "number" &&
    typeof profile.bookmarked_count === "number" &&
    typeof profile.latest_received_at === "string" &&
    (profile.top_gap === undefined ||
      isQualityDashboardProjectTopGap(profile.top_gap)) &&
    profile.cwd === undefined &&
    profile.markdown === undefined &&
    profile.prompt_body === undefined &&
    profile.raw_path === undefined
  );
}

function isQualityDashboardProjectTopGap(
  value: unknown,
): value is NonNullable<
  QualityDashboard["project_profiles"][number]["top_gap"]
> {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const topGap = value as NonNullable<
    QualityDashboard["project_profiles"][number]["top_gap"]
  > & {
    cwd?: unknown;
    markdown?: unknown;
    prompt_body?: unknown;
    raw_path?: unknown;
  };
  return (
    typeof topGap.key === "string" &&
    typeof topGap.label === "string" &&
    typeof topGap.count === "number" &&
    topGap.cwd === undefined &&
    topGap.markdown === undefined &&
    topGap.prompt_body === undefined &&
    topGap.raw_path === undefined
  );
}

function isRawFreeArchiveScoreRoot(
  value: unknown,
): value is Partial<ArchiveScoreReport> {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const report = value as Partial<ArchiveScoreReport> & {
    cwd?: unknown;
    markdown?: unknown;
    prompt_body?: unknown;
    raw_path?: unknown;
  };
  return (
    report.cwd === undefined &&
    report.markdown === undefined &&
    report.prompt_body === undefined &&
    report.raw_path === undefined
  );
}

function isArchiveScoreSummary(
  value: unknown,
): value is ArchiveScoreReport["archive_score"] {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const score = value as ArchiveScoreReport["archive_score"] & {
    cwd?: unknown;
    markdown?: unknown;
    prompt_body?: unknown;
    raw_path?: unknown;
  };
  return (
    typeof score.average === "number" &&
    score.max === 100 &&
    typeof score.band === "string" &&
    typeof score.scored_prompts === "number" &&
    typeof score.total_prompts === "number" &&
    score.cwd === undefined &&
    score.markdown === undefined &&
    score.prompt_body === undefined &&
    score.raw_path === undefined
  );
}

function isArchivePromptScoreSummary(
  value: unknown,
): value is ArchivePromptScoreSummary {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const prompt = value as ArchivePromptScoreSummary & {
    cwd?: unknown;
    markdown?: unknown;
    prompt_body?: unknown;
    raw_path?: unknown;
  };
  return (
    typeof prompt.id === "string" &&
    typeof prompt.tool === "string" &&
    typeof prompt.project === "string" &&
    typeof prompt.received_at === "string" &&
    typeof prompt.quality_score === "number" &&
    typeof prompt.quality_score_band === "string" &&
    Array.isArray(prompt.quality_gaps) &&
    prompt.quality_gaps.every((gap) => typeof gap === "string") &&
    Array.isArray(prompt.tags) &&
    prompt.tags.every((tag) => typeof tag === "string") &&
    typeof prompt.is_sensitive === "boolean" &&
    prompt.cwd === undefined &&
    prompt.markdown === undefined &&
    prompt.prompt_body === undefined &&
    prompt.raw_path === undefined
  );
}

function isArchivePracticePlanItem(
  value: unknown,
): value is ArchiveScoreReport["practice_plan"][number] {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const item = value as ArchiveScoreReport["practice_plan"][number] & {
    cwd?: unknown;
    markdown?: unknown;
    prompt_body?: unknown;
    raw_path?: unknown;
  };
  return (
    typeof item.priority === "number" &&
    typeof item.label === "string" &&
    typeof item.prompt_rule === "string" &&
    typeof item.reason === "string" &&
    typeof item.count === "number" &&
    typeof item.rate === "number" &&
    item.cwd === undefined &&
    item.markdown === undefined &&
    item.prompt_body === undefined &&
    item.raw_path === undefined
  );
}

function isArchiveTopGapItem(
  value: unknown,
): value is ArchiveScoreReport["top_gaps"][number] {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const item = value as ArchiveScoreReport["top_gaps"][number] & {
    cwd?: unknown;
    markdown?: unknown;
    prompt_body?: unknown;
    raw_path?: unknown;
  };
  return (
    typeof item.label === "string" &&
    typeof item.count === "number" &&
    typeof item.rate === "number" &&
    item.cwd === undefined &&
    item.markdown === undefined &&
    item.prompt_body === undefined &&
    item.raw_path === undefined
  );
}

function isArchiveScoreDistribution(
  value: unknown,
): value is ArchiveScoreReport["distribution"] {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const distribution = value as ArchiveScoreReport["distribution"] & {
    cwd?: unknown;
    markdown?: unknown;
    prompt_body?: unknown;
    raw_path?: unknown;
  };
  return (
    typeof distribution.excellent === "number" &&
    typeof distribution.good === "number" &&
    typeof distribution.needs_work === "number" &&
    typeof distribution.weak === "number" &&
    distribution.cwd === undefined &&
    distribution.markdown === undefined &&
    distribution.prompt_body === undefined &&
    distribution.raw_path === undefined
  );
}

function isArchiveEffectivenessSummary(
  value: unknown,
): value is ArchiveScoreReport["effectiveness_summary"] {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const summary = value as ArchiveScoreReport["effectiveness_summary"] & {
    cwd?: unknown;
    markdown?: unknown;
    prompt_body?: unknown;
    raw_path?: unknown;
  };
  return (
    typeof summary.measured_prompts === "number" &&
    typeof summary.unmeasured_prompts === "number" &&
    typeof summary.next_action === "string" &&
    Array.isArray(summary.top_evidence_refs) &&
    summary.top_evidence_refs.every((ref) => typeof ref === "string") &&
    isArchiveEffectivenessVerdicts(summary.verdicts) &&
    isArchiveEffectivenessCalibration(summary.calibration) &&
    summary.cwd === undefined &&
    summary.markdown === undefined &&
    summary.prompt_body === undefined &&
    summary.raw_path === undefined
  );
}

function isArchiveEffectivenessVerdicts(
  value: unknown,
): value is ArchiveScoreReport["effectiveness_summary"]["verdicts"] {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const verdicts =
    value as ArchiveScoreReport["effectiveness_summary"]["verdicts"];
  return (
    typeof verdicts.proven === "number" &&
    typeof verdicts.mixed === "number" &&
    typeof verdicts.unproven === "number"
  );
}

function isArchiveEffectivenessCalibration(
  value: unknown,
): value is ArchiveScoreReport["effectiveness_summary"]["calibration"] {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const calibration =
    value as ArchiveScoreReport["effectiveness_summary"]["calibration"];
  return (
    typeof calibration.linked_outcomes === "number" &&
    typeof calibration.attributed_outcomes === "number" &&
    typeof calibration.passing_outcomes === "number" &&
    typeof calibration.failing_outcomes === "number" &&
    typeof calibration.total_tests_run === "number"
  );
}

function isArchiveScoreFilters(
  value: unknown,
): value is ArchiveScoreReport["filters"] {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const filters = value as ArchiveScoreReport["filters"] & {
    cwd?: unknown;
    markdown?: unknown;
    prompt_body?: unknown;
    raw_path?: unknown;
  };
  return (
    typeof filters.max_prompts === "number" &&
    isOptionalString(filters.tool) &&
    isOptionalString(filters.project) &&
    isOptionalString(filters.received_from) &&
    isOptionalString(filters.received_to) &&
    filters.cwd === undefined &&
    filters.markdown === undefined &&
    filters.prompt_body === undefined &&
    filters.raw_path === undefined
  );
}

function isOptionalString(value: unknown): value is string | undefined {
  return value === undefined || typeof value === "string";
}

function isRawFreeArchiveText(value: unknown): value is string {
  return (
    typeof value === "string" &&
    !value.includes("/Users/") &&
    !value.includes("\\Users\\")
  );
}

export type ProjectPolicy = {
  capture_disabled: boolean;
  analysis_disabled: boolean;
  retention_candidate_days?: number;
  external_analysis_opt_in: boolean;
  export_disabled: boolean;
  version: number;
  updated_at?: string;
};

export type ProjectInstructionReview = {
  generated_at: string;
  analyzer: string;
  score: {
    value: number;
    max: 100;
    band: PromptQualityScoreBand;
  };
  files_found: number;
  files: Array<{
    file_name: string;
    bytes: number;
    modified_at: string;
    content_hash: string;
    truncated: boolean;
  }>;
  checklist: Array<{
    key:
      | "project_context"
      | "agent_workflow"
      | "verification"
      | "privacy_safety"
      | "collaboration_output";
    label: string;
    status: "good" | "weak" | "missing";
    weight: number;
    earned: number;
    suggestion?: string;
  }>;
  suggestions: string[];
  privacy: {
    local_only: true;
    external_calls: false;
    stores_file_bodies: false;
    returns_file_bodies: false;
    returns_raw_paths: false;
  };
};

function parseProjectInstructionReviewResponse(body: {
  data?: {
    score?: {
      value?: unknown;
      max?: unknown;
      band?: unknown;
    };
    files_found?: unknown;
    files?: unknown;
    checklist?: unknown;
    suggestions?: unknown;
    markdown?: unknown;
    prompt_body?: unknown;
    raw_path?: unknown;
    privacy?: {
      local_only?: unknown;
      external_calls?: unknown;
      stores_file_bodies?: unknown;
      returns_file_bodies?: unknown;
      returns_raw_paths?: unknown;
    };
  };
}): ProjectInstructionReview {
  if (
    typeof body.data?.score?.value !== "number" ||
    body.data.score.max !== 100 ||
    typeof body.data.score.band !== "string" ||
    typeof body.data.files_found !== "number" ||
    !Array.isArray(body.data.files) ||
    !body.data.files.every(
      (file) =>
        typeof file === "object" &&
        file !== null &&
        typeof (file as ProjectInstructionReview["files"][number]).file_name ===
          "string" &&
        typeof (file as ProjectInstructionReview["files"][number]).bytes ===
          "number" &&
        typeof (file as ProjectInstructionReview["files"][number])
          .modified_at === "string" &&
        typeof (file as ProjectInstructionReview["files"][number])
          .content_hash === "string" &&
        typeof (file as ProjectInstructionReview["files"][number]).truncated ===
          "boolean" &&
        (file as { markdown?: unknown }).markdown === undefined &&
        (file as { prompt_body?: unknown }).prompt_body === undefined &&
        (file as { raw_path?: unknown }).raw_path === undefined,
    ) ||
    !Array.isArray(body.data.checklist) ||
    !body.data.checklist.every(
      (item) =>
        typeof item === "object" &&
        item !== null &&
        ((item as ProjectInstructionReview["checklist"][number]).key ===
          "project_context" ||
          (item as ProjectInstructionReview["checklist"][number]).key ===
            "agent_workflow" ||
          (item as ProjectInstructionReview["checklist"][number]).key ===
            "verification" ||
          (item as ProjectInstructionReview["checklist"][number]).key ===
            "privacy_safety" ||
          (item as ProjectInstructionReview["checklist"][number]).key ===
            "collaboration_output") &&
        typeof (item as ProjectInstructionReview["checklist"][number]).label ===
          "string" &&
        ((item as ProjectInstructionReview["checklist"][number]).status ===
          "good" ||
          (item as ProjectInstructionReview["checklist"][number]).status ===
            "weak" ||
          (item as ProjectInstructionReview["checklist"][number]).status ===
            "missing") &&
        typeof (item as ProjectInstructionReview["checklist"][number])
          .weight === "number" &&
        typeof (item as ProjectInstructionReview["checklist"][number])
          .earned === "number" &&
        ((item as ProjectInstructionReview["checklist"][number]).suggestion ===
          undefined ||
          typeof (item as ProjectInstructionReview["checklist"][number])
            .suggestion === "string") &&
        (item as { markdown?: unknown }).markdown === undefined &&
        (item as { prompt_body?: unknown }).prompt_body === undefined &&
        (item as { raw_path?: unknown }).raw_path === undefined,
    ) ||
    !Array.isArray(body.data.suggestions) ||
    !body.data.suggestions.every(
      (suggestion) => typeof suggestion === "string",
    ) ||
    body.data.markdown !== undefined ||
    body.data.prompt_body !== undefined ||
    body.data.raw_path !== undefined ||
    body.data.privacy?.local_only !== true ||
    body.data.privacy.external_calls !== false ||
    body.data.privacy.stores_file_bodies !== false ||
    body.data.privacy.returns_file_bodies !== false ||
    body.data.privacy.returns_raw_paths !== false
  ) {
    throw new Error("Project instruction analysis failed: Invalid response.");
  }
  return body.data as ProjectInstructionReview;
}

export type ProjectSummary = {
  project_id: string;
  label: string;
  alias?: string;
  path_kind: "project_root" | "cwd";
  prompt_count: number;
  latest_ingest?: string;
  sensitive_count: number;
  quality_gap_rate: number;
  copied_count: number;
  bookmarked_count: number;
  feedback?: {
    helpful: number;
    not_helpful: number;
    wrong: number;
    total: number;
  };
  policy: ProjectPolicy;
  instruction_review?: ProjectInstructionReview;
};

function parseProjectSummaryResponse(
  body: {
    data?: {
      project_id?: unknown;
      label?: unknown;
      path_kind?: unknown;
      prompt_count?: unknown;
      sensitive_count?: unknown;
      quality_gap_rate?: unknown;
      copied_count?: unknown;
      bookmarked_count?: unknown;
      feedback?: unknown;
      policy?: {
        capture_disabled?: unknown;
        analysis_disabled?: unknown;
        retention_candidate_days?: unknown;
        external_analysis_opt_in?: unknown;
        export_disabled?: unknown;
        version?: unknown;
      };
      instruction_review?: unknown;
      markdown?: unknown;
      prompt_body?: unknown;
      raw_path?: unknown;
    };
  },
  message: string,
): ProjectSummary {
  if (
    typeof body.data?.project_id !== "string" ||
    typeof body.data.label !== "string" ||
    (body.data.path_kind !== "project_root" && body.data.path_kind !== "cwd") ||
    typeof body.data.prompt_count !== "number" ||
    typeof body.data.sensitive_count !== "number" ||
    typeof body.data.quality_gap_rate !== "number" ||
    typeof body.data.copied_count !== "number" ||
    typeof body.data.bookmarked_count !== "number" ||
    typeof body.data.policy?.capture_disabled !== "boolean" ||
    typeof body.data.policy.analysis_disabled !== "boolean" ||
    (body.data.policy.retention_candidate_days !== undefined &&
      (typeof body.data.policy.retention_candidate_days !== "number" ||
        !Number.isInteger(body.data.policy.retention_candidate_days) ||
        body.data.policy.retention_candidate_days <= 0)) ||
    typeof body.data.policy.external_analysis_opt_in !== "boolean" ||
    typeof body.data.policy.export_disabled !== "boolean" ||
    typeof body.data.policy.version !== "number" ||
    body.data.markdown !== undefined ||
    body.data.prompt_body !== undefined ||
    body.data.raw_path !== undefined
  ) {
    throw new Error(`${message}: Invalid response.`);
  }
  if (
    body.data.feedback !== undefined &&
    (typeof body.data.feedback !== "object" ||
      body.data.feedback === null ||
      !["helpful", "not_helpful", "wrong", "total"].every(
        (key) =>
          typeof (body.data!.feedback as Record<string, unknown>)[key] ===
          "number",
      ))
  ) {
    throw new Error(`${message}: Invalid response.`);
  }
  if (body.data.instruction_review !== undefined) {
    if (
      typeof body.data.instruction_review !== "object" ||
      body.data.instruction_review === null
    ) {
      throw new Error(`${message}: Invalid response.`);
    }
    try {
      parseProjectInstructionReviewResponse({
        data: body.data.instruction_review,
      });
    } catch {
      throw new Error(`${message}: Invalid response.`);
    }
  }
  return body.data as ProjectSummary;
}

export type ProjectPolicyPatch = {
  alias?: string | null;
  capture_disabled?: boolean;
  analysis_disabled?: boolean;
  retention_candidate_days?: number | null;
  external_analysis_opt_in?: boolean;
  export_disabled?: boolean;
};

export type ExportPreset =
  | "personal_backup"
  | "anonymized_review"
  | "issue_report_attachment";

export type ImportSourceType =
  | "official-hook"
  | "claude-transcript-best-effort"
  | "codex-transcript-best-effort"
  | "manual-jsonl";

export type ImportDryRunResult = {
  dry_run: true;
  source_type: ImportSourceType;
  source_path_hash: string;
  records_read: number;
  prompt_candidates: number;
  sensitive_prompt_count: number;
  parse_errors: number;
  skipped_records: {
    assistant_or_tool: number;
    empty_prompt: number;
    unsupported_record: number;
    too_large: number;
  };
  samples: Array<{
    record_offset: number;
    session_id?: string;
    turn_id?: string;
    cwd_label?: string;
    prompt_preview: string;
    is_sensitive: boolean;
  }>;
};

function parseImportDryRunResponse(body: {
  data?: {
    dry_run?: unknown;
    source_type?: unknown;
    source_path_hash?: unknown;
    records_read?: unknown;
    prompt_candidates?: unknown;
    sensitive_prompt_count?: unknown;
    parse_errors?: unknown;
    skipped_records?: {
      assistant_or_tool?: unknown;
      empty_prompt?: unknown;
      unsupported_record?: unknown;
      too_large?: unknown;
    };
    samples?: unknown;
    markdown?: unknown;
    prompt_body?: unknown;
    raw_path?: unknown;
  };
}): ImportDryRunResult {
  if (
    body.data?.dry_run !== true ||
    typeof body.data.source_type !== "string" ||
    typeof body.data.source_path_hash !== "string" ||
    typeof body.data.records_read !== "number" ||
    typeof body.data.prompt_candidates !== "number" ||
    typeof body.data.sensitive_prompt_count !== "number" ||
    typeof body.data.parse_errors !== "number" ||
    typeof body.data.skipped_records?.assistant_or_tool !== "number" ||
    typeof body.data.skipped_records.empty_prompt !== "number" ||
    typeof body.data.skipped_records.unsupported_record !== "number" ||
    typeof body.data.skipped_records.too_large !== "number" ||
    !Array.isArray(body.data.samples) ||
    body.data.markdown !== undefined ||
    body.data.prompt_body !== undefined ||
    body.data.raw_path !== undefined ||
    !body.data.samples.every(
      (sample) =>
        typeof sample === "object" &&
        sample !== null &&
        typeof (sample as ImportDryRunResult["samples"][number])
          .record_offset === "number" &&
        ((sample as ImportDryRunResult["samples"][number]).session_id ===
          undefined ||
          typeof (sample as ImportDryRunResult["samples"][number])
            .session_id === "string") &&
        ((sample as ImportDryRunResult["samples"][number]).turn_id ===
          undefined ||
          typeof (sample as ImportDryRunResult["samples"][number]).turn_id ===
            "string") &&
        ((sample as ImportDryRunResult["samples"][number]).cwd_label ===
          undefined ||
          typeof (sample as ImportDryRunResult["samples"][number]).cwd_label ===
            "string") &&
        typeof (sample as ImportDryRunResult["samples"][number])
          .prompt_preview === "string" &&
        typeof (sample as ImportDryRunResult["samples"][number])
          .is_sensitive === "boolean" &&
        (sample as { markdown?: unknown }).markdown === undefined &&
        (sample as { prompt_body?: unknown }).prompt_body === undefined &&
        (sample as { raw_path?: unknown }).raw_path === undefined,
    )
  ) {
    throw new Error("Import dry-run failed: Invalid response.");
  }
  return body.data as ImportDryRunResult;
}

export type ExportJob = {
  id: string;
  preset: ExportPreset;
  status: "previewed" | "completed" | "invalid";
  prompt_id_hashes: string[];
  project_policy_versions: Record<string, number>;
  redaction_version: string;
  counts: {
    prompt_count: number;
    sensitive_count: number;
    included_fields: string[];
    excluded_fields: string[];
    residual_identifier_counts: Record<string, number>;
    small_set_warning: boolean;
  };
  expires_at: string;
  created_at: string;
};

function parseExportJobResponse(
  body: {
    data?: {
      id?: unknown;
      preset?: unknown;
      status?: unknown;
      prompt_id_hashes?: unknown;
      project_policy_versions?: unknown;
      redaction_version?: unknown;
      counts?: {
        prompt_count?: unknown;
        sensitive_count?: unknown;
        included_fields?: unknown;
        excluded_fields?: unknown;
        residual_identifier_counts?: unknown;
        small_set_warning?: unknown;
      };
      expires_at?: unknown;
      created_at?: unknown;
      markdown?: unknown;
      prompt_body?: unknown;
      raw_path?: unknown;
    };
  },
  message: string,
): ExportJob {
  if (
    typeof body.data?.id !== "string" ||
    typeof body.data.preset !== "string" ||
    (body.data.status !== "previewed" &&
      body.data.status !== "completed" &&
      body.data.status !== "invalid") ||
    !Array.isArray(body.data.prompt_id_hashes) ||
    typeof body.data.project_policy_versions !== "object" ||
    body.data.project_policy_versions === null ||
    typeof body.data.redaction_version !== "string" ||
    typeof body.data.counts?.prompt_count !== "number" ||
    typeof body.data.counts.sensitive_count !== "number" ||
    !Array.isArray(body.data.counts.included_fields) ||
    !Array.isArray(body.data.counts.excluded_fields) ||
    typeof body.data.counts.residual_identifier_counts !== "object" ||
    body.data.counts.residual_identifier_counts === null ||
    typeof body.data.counts.small_set_warning !== "boolean" ||
    typeof body.data.expires_at !== "string" ||
    typeof body.data.created_at !== "string" ||
    body.data.markdown !== undefined ||
    body.data.prompt_body !== undefined ||
    body.data.raw_path !== undefined
  ) {
    throw new Error(`${message}: Invalid response.`);
  }
  return body.data as ExportJob;
}

function parseAnonymizedExportPayloadResponse(body: {
  data?: {
    job_id?: unknown;
    preset?: unknown;
    redaction_version?: unknown;
    generated_at?: unknown;
    count?: unknown;
    items?: unknown;
  };
}): AnonymizedExportPayload {
  if (
    typeof body.data?.job_id !== "string" ||
    typeof body.data.preset !== "string" ||
    typeof body.data.redaction_version !== "string" ||
    typeof body.data.generated_at !== "string" ||
    typeof body.data.count !== "number" ||
    !Array.isArray(body.data.items) ||
    !body.data.items.every(
      (item) =>
        typeof item === "object" &&
        item !== null &&
        typeof (item as AnonymizedExportPayload["items"][number])
          .anonymous_id === "string" &&
        typeof (item as AnonymizedExportPayload["items"][number]).tool ===
          "string" &&
        typeof (item as AnonymizedExportPayload["items"][number])
          .coarse_date === "string" &&
        typeof (item as AnonymizedExportPayload["items"][number])
          .project_alias === "string" &&
        typeof (item as AnonymizedExportPayload["items"][number]).prompt ===
          "string" &&
        Array.isArray(
          (item as AnonymizedExportPayload["items"][number]).tags,
        ) &&
        Array.isArray(
          (item as AnonymizedExportPayload["items"][number]).quality_gaps,
        ) &&
        (item as { markdown?: unknown }).markdown === undefined &&
        (item as { prompt_body?: unknown }).prompt_body === undefined &&
        (item as { raw_path?: unknown }).raw_path === undefined,
    )
  ) {
    throw new Error("Export job execution failed: Invalid response.");
  }
  return body.data as AnonymizedExportPayload;
}

export type AnonymizedExportPayload = {
  job_id: string;
  preset: ExportPreset;
  redaction_version: string;
  generated_at: string;
  count: number;
  items: Array<{
    anonymous_id: string;
    tool: string;
    coarse_date: string;
    project_alias: string;
    prompt: string;
    tags: string[];
    quality_gaps: string[];
  }>;
};

let csrfToken: string | undefined;
let sessionPromise: Promise<void> | undefined;

export async function ensureSession(): Promise<void> {
  if (csrfToken) {
    return;
  }

  sessionPromise ??= fetch("/api/v1/session", {
    credentials: "same-origin",
  })
    .then(async (response) => {
      if (!response.ok) {
        await failApi(response, "Session failed");
      }
      const body = (await response.json()) as {
        data?: { csrf_token?: unknown };
      };
      if (
        typeof body.data?.csrf_token !== "string" ||
        body.data.csrf_token.trim().length === 0
      ) {
        throw new Error("Session failed: Invalid session response.");
      }
      csrfToken = body.data.csrf_token;
    })
    .finally(() => {
      sessionPromise = undefined;
    });

  await sessionPromise;
}

export async function getApiCsrfToken(): Promise<string> {
  await ensureSession();
  return csrfToken ?? "";
}

export async function listPrompts(
  filters: PromptFilters,
  cursor?: string,
): Promise<PromptListResponse> {
  await ensureSession();
  const params = new URLSearchParams({ limit: "50" });
  if (cursor && !filters.query?.trim()) {
    params.set("cursor", cursor);
  }
  if (filters.query?.trim()) {
    params.set("q", filters.query.trim());
  }
  if (filters.tool) {
    params.set("tool", filters.tool);
  }
  if (filters.cwdPrefix?.trim()) {
    params.set("cwd_prefix", filters.cwdPrefix.trim());
  }
  if (filters.importJobId?.trim()) {
    params.set("import_job_id", filters.importJobId.trim());
  }
  if (filters.isSensitive && filters.isSensitive !== "all") {
    params.set("is_sensitive", filters.isSensitive);
  }
  if (filters.tag) {
    params.set("tag", filters.tag);
  }
  if (filters.focus) {
    params.set("focus", filters.focus);
  }
  if (filters.qualityGap) {
    params.set("quality_gap", filters.qualityGap);
  }
  if (filters.receivedFrom) {
    params.set("from", `${filters.receivedFrom}T00:00:00.000Z`);
  }
  if (filters.receivedTo) {
    params.set("to", `${filters.receivedTo}T23:59:59.999Z`);
  }

  const response = await fetch(`/api/v1/prompts?${params}`, {
    credentials: "same-origin",
  });

  if (!response.ok) {
    await failApi(response, "Prompt list failed");
  }

  const body = (await response.json()) as Parameters<
    typeof parsePromptListResponse
  >[0];
  return parsePromptListResponse(body);
}

export async function getQualityDashboard(
  options: { trendDays?: number } = {},
): Promise<QualityDashboard> {
  await ensureSession();
  const url = options.trendDays
    ? `/api/v1/quality?trend_days=${options.trendDays}`
    : "/api/v1/quality";
  const response = await fetch(url, {
    credentials: "same-origin",
  });

  if (!response.ok) {
    await failApi(response, "Quality dashboard failed");
  }

  const body = (await response.json()) as {
    data?: {
      total_prompts?: unknown;
      sensitive_prompts?: unknown;
      sensitive_ratio?: unknown;
      recent?: unknown;
      trend?: unknown;
      quality_score?: unknown;
      distribution?: unknown;
      missing_items?: unknown;
      patterns?: unknown;
      instruction_suggestions?: unknown;
      useful_prompts?: unknown;
      duplicate_prompt_groups?: unknown;
      project_profiles?: unknown;
      privacy?: unknown;
    };
  };
  if (
    typeof body.data?.total_prompts !== "number" ||
    !isRawFreeQualityDashboardRoot(body.data) ||
    typeof body.data.sensitive_prompts !== "number" ||
    typeof body.data.sensitive_ratio !== "number" ||
    !isQualityDashboardRecent(body.data.recent) ||
    !isQualityDashboardTrend(body.data.trend) ||
    !isQualityDashboardScore(body.data.quality_score) ||
    !isQualityDashboardDistribution(body.data.distribution) ||
    !Array.isArray(body.data.missing_items) ||
    !body.data.missing_items.every(isQualityDashboardMissingItem) ||
    !Array.isArray(body.data.patterns) ||
    !body.data.patterns.every(isQualityDashboardPattern) ||
    !Array.isArray(body.data.instruction_suggestions) ||
    !body.data.instruction_suggestions.every(
      isQualityDashboardInstructionSuggestion,
    ) ||
    !Array.isArray(body.data.useful_prompts) ||
    !body.data.useful_prompts.every(isQualityDashboardUsefulPrompt) ||
    !Array.isArray(body.data.duplicate_prompt_groups) ||
    !body.data.duplicate_prompt_groups.every(
      isQualityDashboardDuplicatePromptGroup,
    ) ||
    !Array.isArray(body.data.project_profiles) ||
    !body.data.project_profiles.every(isQualityDashboardProjectProfile) ||
    !isQualityDashboardPrivacy(body.data.privacy)
  ) {
    throw new Error("Quality dashboard failed: Invalid response.");
  }
  return body.data as QualityDashboard;
}

export async function getArchiveScoreReport(): Promise<ArchiveScoreReport> {
  await ensureSession();
  const response = await fetch("/api/v1/score?limit=200&low_score_limit=8", {
    credentials: "same-origin",
  });

  if (!response.ok) {
    await failApi(response, "Archive score report failed");
  }

  const body = (await response.json()) as {
    data?: {
      generated_at?: unknown;
      archive_score?: unknown;
      distribution?: unknown;
      top_gaps?: unknown;
      practice_plan?: unknown;
      low_score_prompts?: unknown;
      effectiveness_summary?: unknown;
      filters?: unknown;
      next_prompt_template?: unknown;
      has_more?: unknown;
      privacy?: unknown;
    };
  };
  if (
    typeof body.data?.generated_at !== "string" ||
    !isRawFreeArchiveScoreRoot(body.data) ||
    !isArchiveScoreSummary(body.data?.archive_score) ||
    !isArchiveScoreDistribution(body.data.distribution) ||
    !Array.isArray(body.data.top_gaps) ||
    !body.data.top_gaps.every(isArchiveTopGapItem) ||
    !Array.isArray(body.data.practice_plan) ||
    !body.data.practice_plan.every(isArchivePracticePlanItem) ||
    !Array.isArray(body.data.low_score_prompts) ||
    !body.data.low_score_prompts.every(isArchivePromptScoreSummary) ||
    !isArchiveEffectivenessSummary(body.data.effectiveness_summary) ||
    !isArchiveScoreFilters(body.data.filters) ||
    !isRawFreeArchiveText(body.data.next_prompt_template) ||
    typeof body.data.has_more !== "boolean" ||
    !isArchiveScorePrivacy(body.data.privacy)
  ) {
    throw new Error("Archive score report failed: Invalid response.");
  }
  return body.data as ArchiveScoreReport;
}

export async function getSettings(): Promise<SettingsResponse> {
  await ensureSession();
  const response = await fetch("/api/v1/settings", {
    credentials: "same-origin",
  });

  if (!response.ok) {
    await failApi(response, "Settings failed");
  }

  const body = (await response.json()) as {
    data?: {
      markdown?: unknown;
      prompt_body?: unknown;
      raw_path?: unknown;
      redaction_mode?: unknown;
      server?: { host?: unknown; port?: unknown };
    };
  };
  if (
    typeof body.data?.redaction_mode !== "string" ||
    typeof body.data.server?.host !== "string" ||
    typeof body.data.server.port !== "number" ||
    body.data.markdown !== undefined ||
    body.data.prompt_body !== undefined ||
    body.data.raw_path !== undefined
  ) {
    throw new Error("Settings failed: Invalid response.");
  }
  return body.data as SettingsResponse;
}

export async function listProjects(): Promise<ProjectSummary[]> {
  await ensureSession();
  const response = await fetch("/api/v1/projects", {
    credentials: "same-origin",
  });

  if (!response.ok) {
    await failApi(response, "Project list failed");
  }

  const body = (await response.json()) as {
    data?: { items?: unknown };
  };
  if (!Array.isArray(body.data?.items)) {
    throw new Error("Project list failed: Invalid response.");
  }
  return body.data.items.map((item) =>
    parseProjectSummaryResponse({ data: item }, "Project list failed"),
  );
}

export async function listLoops(): Promise<LoopListResponse> {
  await ensureSession();
  const response = await fetch("/api/v1/loops", {
    credentials: "same-origin",
  });

  if (!response.ok) {
    await failApi(response, "Loop list failed");
  }

  const body = (await response.json()) as {
    data?: {
      status?: unknown;
      benchmark_readiness?: unknown;
      items?: unknown;
      privacy?: unknown;
    };
  };
  const status = body.data?.status as
    | {
        latest_snapshot?: unknown;
        latest_compact_boundary?: unknown;
        activity?: unknown;
        project_memory?: unknown;
        memory_candidate?: unknown;
        privacy?: unknown;
      }
    | undefined;
  if (
    typeof body.data?.status !== "object" ||
    body.data.status === null ||
    !isLoopStatusCore(body.data.status) ||
    !isBenchmarkReadiness(body.data.benchmark_readiness) ||
    !Array.isArray(body.data.items) ||
    !body.data.items.every(isLoopSummary) ||
    (status?.latest_snapshot !== undefined &&
      !isLoopSummary(status.latest_snapshot)) ||
    (status?.latest_compact_boundary !== undefined &&
      !isLoopCompactBoundary(status.latest_compact_boundary)) ||
    !isLoopStatusActivity(status?.activity) ||
    !isLoopProjectMemory(status?.project_memory) ||
    (status?.memory_candidate !== undefined &&
      !isLoopMemoryCandidate(status.memory_candidate)) ||
    !isLoopStatusPrivacy(status?.privacy) ||
    !isLoopListPrivacy(body.data.privacy)
  ) {
    throw new Error("Loop list failed: Invalid response.");
  }
  return body.data as LoopListResponse;
}

export async function getLoopBrief(id: string): Promise<LoopBrief> {
  await ensureSession();
  const response = await fetch("/api/v1/loops/brief", {
    method: "POST",
    credentials: "same-origin",
    headers: {
      "content-type": "application/json",
      "x-csrf-token": csrfToken ?? "",
    },
    body: JSON.stringify({ snapshot_id: id }),
  });

  if (!response.ok) {
    await failApi(response, "Loop brief failed");
  }

  const body = (await response.json()) as Parameters<
    typeof parseLoopBriefResponse
  >[0];
  return parseLoopBriefResponse(body, "Loop brief failed");
}

export async function getSelectedLoopBrief(options: {
  worktree: string;
  branch?: string;
  sessionId?: string;
}): Promise<LoopBrief> {
  await ensureSession();
  const response = await fetch("/api/v1/loops/brief", {
    method: "POST",
    credentials: "same-origin",
    headers: {
      "content-type": "application/json",
      "x-csrf-token": csrfToken ?? "",
    },
    body: JSON.stringify({
      worktree: options.worktree,
      ...(options.sessionId ? { session_id: options.sessionId } : {}),
      ...(options.branch ? { branch: options.branch } : {}),
    }),
  });

  if (!response.ok) {
    await failApi(response, "Selected loop brief failed");
  }

  const body = (await response.json()) as Parameters<
    typeof parseLoopBriefResponse
  >[0];
  return parseLoopBriefResponse(body, "Selected loop brief failed");
}

export async function markContinuationReceipt(
  id: string,
  status: "copied" | "delivered" | "followed" | "partial" | "ignored",
): Promise<void> {
  await ensureSession();
  const response = await fetch(
    `/api/v1/loops/receipts/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      credentials: "same-origin",
      headers: {
        "content-type": "application/json",
        "x-csrf-token": csrfToken ?? "",
      },
      body: JSON.stringify({ status }),
    },
  );
  if (!response.ok) await failApi(response, "Continuation receipt failed");
}

export async function getLoopWorktree(
  worktree: string,
  options: { branch?: string; sessionId?: string } = {},
): Promise<LoopWorktreeResponse> {
  await ensureSession();
  const params = new URLSearchParams();
  if (options.sessionId) params.set("session_id", options.sessionId);
  if (options.branch) params.set("branch", options.branch);
  const query = params.toString();
  const response = await fetch(
    `/api/v1/loops/worktrees/${encodeURIComponent(worktree)}${query ? `?${query}` : ""}`,
    {
      credentials: "same-origin",
    },
  );

  if (!response.ok) {
    await failApi(response, "Loop worktree drilldown failed");
  }

  const body = (await response.json()) as {
    data?: {
      worktree?: unknown;
      memory_approved?: unknown;
      memory_candidate?: unknown;
      selection_scope?: unknown;
      snapshot_age?: unknown;
      selected_brief_action?: unknown;
      command_distinction?: unknown;
      command_filters?: unknown;
      copy_side_effects?: unknown;
      continuation_safety?: unknown;
      items?: unknown;
      privacy?: unknown;
    };
  };
  if (
    typeof body.data?.worktree !== "string" ||
    (body.data.memory_approved !== undefined &&
      typeof body.data.memory_approved !== "boolean") ||
    (body.data.memory_candidate !== undefined &&
      !isLoopMemoryCandidate(body.data.memory_candidate)) ||
    !isLoopWorktreeSelectionScope(body.data.selection_scope) ||
    (body.data.snapshot_age !== undefined &&
      !isLoopWorktreeSnapshotAge(body.data.snapshot_age)) ||
    (body.data.selected_brief_action !== undefined &&
      !isSelectedBriefAction(body.data.selected_brief_action)) ||
    (body.data.command_distinction !== undefined &&
      !isCommandDistinction(body.data.command_distinction)) ||
    (body.data.command_filters !== undefined &&
      !isCommandFilters(body.data.command_filters)) ||
    (body.data.copy_side_effects !== undefined &&
      !isCopySideEffects(body.data.copy_side_effects)) ||
    (body.data.continuation_safety !== undefined &&
      !isContinuationSafety(body.data.continuation_safety)) ||
    !Array.isArray(body.data.items) ||
    !body.data.items.every(isLoopWorktreeSummary) ||
    !isLoopListPrivacy(body.data.privacy)
  ) {
    throw new Error("Loop worktree drilldown failed: Invalid response.");
  }
  return body.data as LoopWorktreeResponse;
}

export async function approveLoopMemory(
  options: {
    approvedBy?: string;
    snapshotId?: string;
  } = {},
): Promise<LoopMemoryApprovalResult> {
  await ensureSession();
  const response = await fetch("/api/v1/loops/memory/approve", {
    method: "POST",
    credentials: "same-origin",
    headers: {
      "content-type": "application/json",
      "x-csrf-token": csrfToken ?? "",
    },
    body: JSON.stringify({
      approved_by: options.approvedBy ?? "web",
      ...(options.snapshotId ? { snapshot_id: options.snapshotId } : {}),
    }),
  });

  if (!response.ok) {
    await failApi(response, "Loop memory approval failed");
  }

  const body = (await response.json()) as Parameters<
    typeof parseLoopMemoryApprovalResponse
  >[0];
  return parseLoopMemoryApprovalResponse(body, "Loop memory approval failed");
}

export async function recordLoopOutcome(
  snapshotId: string,
  input: {
    status: LoopOutcomeStatus;
    summary: string;
    evidenceRefs: string[];
    usedImprovementPromptIds?: string[];
  },
): Promise<LoopOutcomeRecordResult> {
  await ensureSession();
  const response = await fetch(
    `/api/v1/loops/${encodeURIComponent(snapshotId)}/outcome`,
    {
      method: "POST",
      credentials: "same-origin",
      headers: {
        "content-type": "application/json",
        "x-csrf-token": csrfToken ?? "",
      },
      body: JSON.stringify({
        status: input.status,
        summary: input.summary,
        evidence_refs: input.evidenceRefs,
        ...(input.usedImprovementPromptIds?.length
          ? { used_improvement_prompt_ids: input.usedImprovementPromptIds }
          : {}),
      }),
    },
  );

  if (!response.ok) {
    await failApi(response, "Loop outcome recording failed");
  }

  const body = (await response.json()) as { data?: unknown };
  return parseLoopOutcomeRecordResponse(body, "Loop outcome recording failed");
}

export async function getLoopInstructionPatch(
  options: {
    targetFile?: "AGENTS.md" | "CLAUDE.md";
  } = {},
): Promise<LoopInstructionPatchProposal> {
  await ensureSession();
  const params = new URLSearchParams({
    target_file: options.targetFile ?? "AGENTS.md",
  });
  const response = await fetch(
    `/api/v1/loops/instruction-patch?${params.toString()}`,
    {
      credentials: "same-origin",
    },
  );

  if (!response.ok) {
    await failApi(response, "Loop instruction patch proposal failed");
  }

  const body = (await response.json()) as Parameters<
    typeof parseLoopInstructionPatchProposalResponse
  >[0];
  return parseLoopInstructionPatchProposalResponse(
    body,
    "Loop instruction patch proposal failed",
  );
}

export async function failApi(
  response: Response,
  label: string,
): Promise<never> {
  let detail = "";
  const textResponse =
    typeof response.clone === "function" ? response.clone() : response;
  try {
    const body = (await response.json()) as {
      detail?: unknown;
      title?: unknown;
      message?: unknown;
      error?: unknown;
      error_description?: unknown;
      errors?: unknown;
      issues?: unknown;
    };
    const issueDetail =
      apiErrorIssueText(body.errors) || apiErrorIssueText(body.issues);
    detail =
      apiErrorText(body) ||
      apiErrorText(body.detail) ||
      apiErrorText(body.title) ||
      apiErrorText(body.message) ||
      apiErrorText(body.error_description) ||
      apiErrorText(body.error) ||
      apiErrorText(body.errors);
    if (detail && issueDetail) {
      detail = `${detail} ${issueDetail}`;
    } else {
      detail ||= issueDetail;
    }
  } catch {
    try {
      detail = apiErrorText(await textResponse.text());
    } catch {
      // body may not be readable, that is fine.
    }
  }
  const suffix = detail ? `: ${detail}` : "";
  throw new Error(`${label} (${response.status})${suffix}`);
}

function apiErrorText(value: unknown): string {
  return typeof value === "string" ? sanitizeApiErrorText(value.trim()) : "";
}

function apiErrorIssueText(value: unknown): string {
  if (!Array.isArray(value)) {
    return "";
  }
  const issues = value
    .map((item) => {
      if (!item || typeof item !== "object") {
        return "";
      }
      const record = item as {
        detail?: unknown;
        field?: unknown;
        instancePath?: unknown;
        message?: unknown;
        param?: unknown;
        params?: unknown;
        path?: unknown;
        property?: unknown;
        source?: unknown;
      };
      const field =
        apiErrorText(record.field) ||
        apiErrorIssuePathText(record.field) ||
        apiErrorIssuePathText(record.path) ||
        apiErrorIssuePathText(record.instancePath) ||
        apiErrorIssuePathText(record.property) ||
        apiErrorIssuePathText(record.param) ||
        apiErrorIssueParamsText(record.params) ||
        apiErrorIssueSourceText(record.source);
      const rawFieldKey = rawDetailErrorFieldKey(field);
      const message = rawFieldKey
        ? `[REDACTED:${rawFieldKey.toLowerCase()}]`
        : apiErrorText(record.message) || apiErrorText(record.detail);
      if (!message) {
        return "";
      }
      return field ? `${field}: ${message}` : message;
    })
    .filter(Boolean);
  const visibleIssues = issues.slice(0, 3);
  const remaining = issues.length - visibleIssues.length;
  if (remaining > 0) {
    visibleIssues.push(`${remaining} more error(s).`);
  }
  return visibleIssues.join(" ");
}

function apiErrorIssuePathText(value: unknown): string {
  if (typeof value === "string") {
    if (
      /^(?:file:\/\/|[A-Za-z]:\\|\\\\|~\/|\/(?:Users|home|private|tmp|var|opt|workspace|Volumes)\/)/i.test(
        value,
      )
    ) {
      return apiErrorText(value);
    }
    return apiErrorText(
      value
        .split("/")
        .filter(Boolean)
        .map((segment) => segment.replace(/~1/g, "/").replace(/~0/g, "~"))
        .join(".") || value,
    );
  }
  if (!Array.isArray(value)) {
    return "";
  }
  const segments = value
    .map((segment) =>
      typeof segment === "string" || typeof segment === "number"
        ? String(segment)
        : "",
    )
    .filter(Boolean);
  return apiErrorText(segments.join("."));
}

function apiErrorIssueSourceText(value: unknown): string {
  if (!value || typeof value !== "object") {
    return "";
  }
  const record = value as {
    parameter?: unknown;
    pointer?: unknown;
  };
  return (
    apiErrorIssuePathText(record.pointer) ||
    apiErrorIssuePathText(record.parameter)
  );
}

function apiErrorIssueParamsText(value: unknown): string {
  if (!value || typeof value !== "object") {
    return "";
  }
  const record = value as {
    additionalProperty?: unknown;
    missingProperty?: unknown;
    propertyName?: unknown;
  };
  return (
    apiErrorIssuePathText(record.missingProperty) ||
    apiErrorIssuePathText(record.propertyName) ||
    apiErrorIssuePathText(record.additionalProperty)
  );
}

const RAW_DETAIL_ERROR_KEY_PATTERN =
  "ANTHROPIC_API_KEY|GITHUB_TOKEN|OPENAI_API_KEY|apiKey|api_key|compactSummary|compact_summary|credential|markdown|promptBody|prompt_body|providerCredential|provider_credential|rawPath|raw_path|token|transcript|transcriptBody|transcript_body";

function rawDetailErrorFieldKey(value: string): string | null {
  const match = new RegExp(
    `(?:^|[^A-Za-z0-9_])(${RAW_DETAIL_ERROR_KEY_PATTERN})(?=$|[^A-Za-z0-9_])`,
    "i",
  ).exec(value);
  return match?.[1] ?? null;
}

function sanitizeApiErrorText(value: string): string {
  const rawDetailKey = RAW_DETAIL_ERROR_KEY_PATTERN;
  return value
    .replace(
      new RegExp(
        `(["'\`])(${rawDetailKey})\\1\\s*([:=])\\s*(?!["'\`])([^.;)}\\]\\r\\n]+)([.;)}\\]]?)`,
        "gi",
      ),
      (
        _match,
        quote: string,
        key: string,
        separator: string,
        _value: string,
        terminator: string,
      ) =>
        `${quote}${key}${quote}${separator}[REDACTED:${key.toLowerCase()}]${terminator}`,
    )
    .replace(
      new RegExp(
        `\\b(${rawDetailKey})\\s*([:=])\\s*(["'\`])[^"'\`\\r\\n]*\\3`,
        "gi",
      ),
      (_match, key: string, separator: string, quote: string) =>
        `${key}${separator}${quote}[REDACTED:${key.toLowerCase()}]${quote}`,
    )
    .replace(
      new RegExp(
        `\\b(${rawDetailKey})\\s*:\\s*(?!["'\`])([^.;)}\\]\\r\\n]+)([.;)}\\]]?)`,
        "gi",
      ),
      (_match, key: string, _value: string, terminator: string) =>
        `${key}:[REDACTED:${key.toLowerCase()}]${terminator}`,
    )
    .replace(
      new RegExp(
        `\\b(${rawDetailKey})\\s*=\\s*(?!["'\`])([^.;)}\\]\\r\\n]+)([.;)}\\]]?)`,
        "gi",
      ),
      (_match, key: string, _value: string, terminator: string) =>
        `${key}=[REDACTED:${key.toLowerCase()}]${terminator}`,
    )
    .replace(
      new RegExp(
        `\\b(${rawDetailKey})\\s*([:=])\\s*(?!["'\`]|\\[REDACTED:)([^\\s,;)}\\]]+)`,
        "gi",
      ),
      (_match, key: string, separator: string) =>
        `${key}${separator}[REDACTED:${key.toLowerCase()}]`,
    )
    .replace(
      /(?:file:\/\/[^\s)'"`]+|[A-Za-z]:\\[^\s)'"`]+|\\\\[^\s)'"`]+|(?:~|\/(?:Users|home|private|tmp|var|opt|workspace|Volumes))\/[^\s)'"`]+)/gi,
      "[REDACTED:path]",
    )
    .replace(
      /\b(?:AIza[0-9A-Za-z_-]{20,}|npm_[A-Za-z0-9]{30,}|(?:sk|pk)[-_][A-Za-z0-9_-]{8,}|(?:ghp|github_pat|xoxb)[-_][A-Za-z0-9_-]{8,}|AKIA[A-Z0-9]{8,})\b/g,
      "[REDACTED:secret]",
    );
}

export async function updateProjectPolicy(
  projectId: string,
  patch: ProjectPolicyPatch,
): Promise<ProjectSummary> {
  await ensureSession();
  const response = await fetch(
    `/api/v1/projects/${encodeURIComponent(projectId)}/policy`,
    {
      method: "PATCH",
      credentials: "same-origin",
      headers: {
        "content-type": "application/json",
        "x-csrf-token": csrfToken ?? "",
      },
      body: JSON.stringify(patch),
    },
  );

  if (!response.ok) {
    await failApi(response, "Project policy update failed");
  }

  const body = (await response.json()) as Parameters<
    typeof parseProjectSummaryResponse
  >[0];
  return parseProjectSummaryResponse(body, "Project policy update failed");
}

export async function analyzeProjectInstructions(
  projectId: string,
): Promise<ProjectInstructionReview> {
  await ensureSession();
  const response = await fetch(
    `/api/v1/projects/${encodeURIComponent(projectId)}/instructions/analyze`,
    {
      method: "POST",
      credentials: "same-origin",
      headers: {
        "x-csrf-token": csrfToken ?? "",
      },
    },
  );

  if (!response.ok) {
    await failApi(response, "Project instruction analysis failed");
  }

  const body = (await response.json()) as Parameters<
    typeof parseProjectInstructionReviewResponse
  >[0];
  return parseProjectInstructionReviewResponse(body);
}

export type CoachFeedbackRating = "helpful" | "not_helpful" | "wrong";

export type CoachFeedbackEntry = {
  id: string;
  prompt_id: string;
  rating: CoachFeedbackRating;
  created_at: string;
};

function parseCoachFeedbackEntryResponse(body: {
  data?: {
    id?: unknown;
    prompt_id?: unknown;
    rating?: unknown;
    created_at?: unknown;
    markdown?: unknown;
    prompt_body?: unknown;
    raw_path?: unknown;
  };
}): CoachFeedbackEntry {
  if (
    typeof body.data?.id !== "string" ||
    typeof body.data.prompt_id !== "string" ||
    (body.data.rating !== "helpful" &&
      body.data.rating !== "not_helpful" &&
      body.data.rating !== "wrong") ||
    typeof body.data.created_at !== "string" ||
    body.data.markdown !== undefined ||
    body.data.prompt_body !== undefined ||
    body.data.raw_path !== undefined
  ) {
    throw new Error("Coach feedback failed: Invalid response.");
  }
  return body.data as CoachFeedbackEntry;
}

export type CoachFeedbackSummary = {
  total: number;
  helpful: number;
  not_helpful: number;
  wrong: number;
  helpful_ratio: number;
};

export async function getCoachFeedbackSummary(): Promise<CoachFeedbackSummary> {
  await ensureSession();
  const response = await fetch("/api/v1/coach-feedback/summary", {
    credentials: "same-origin",
  });
  if (!response.ok) {
    await failApi(response, "Coach feedback summary failed");
  }
  const body = (await response.json()) as {
    data?: {
      total?: unknown;
      helpful?: unknown;
      not_helpful?: unknown;
      wrong?: unknown;
      helpful_ratio?: unknown;
      markdown?: unknown;
      prompt_body?: unknown;
      raw_path?: unknown;
    };
  };
  if (
    typeof body.data?.total !== "number" ||
    typeof body.data.helpful !== "number" ||
    typeof body.data.not_helpful !== "number" ||
    typeof body.data.wrong !== "number" ||
    typeof body.data.helpful_ratio !== "number" ||
    body.data.markdown !== undefined ||
    body.data.prompt_body !== undefined ||
    body.data.raw_path !== undefined
  ) {
    throw new Error("Coach feedback summary failed: Invalid response.");
  }
  return body.data as CoachFeedbackSummary;
}

export async function sendCoachFeedback(input: {
  promptId: string;
  rating: CoachFeedbackRating;
}): Promise<CoachFeedbackEntry> {
  await ensureSession();
  const response = await fetch(
    `/api/v1/prompts/${encodeURIComponent(input.promptId)}/coach-feedback`,
    {
      method: "POST",
      credentials: "same-origin",
      headers: {
        "content-type": "application/json",
        "x-csrf-token": csrfToken ?? "",
      },
      body: JSON.stringify({ rating: input.rating }),
    },
  );

  if (!response.ok) {
    await failApi(response, "Coach feedback failed");
  }

  const body = (await response.json()) as Parameters<
    typeof parseCoachFeedbackEntryResponse
  >[0];
  return parseCoachFeedbackEntryResponse(body);
}

export async function previewImportDryRun(input: {
  sourceType: ImportSourceType;
  content: string;
}): Promise<ImportDryRunResult> {
  await ensureSession();
  const response = await fetch("/api/v1/import/dry-run", {
    method: "POST",
    credentials: "same-origin",
    headers: {
      "content-type": "application/json",
      "x-csrf-token": csrfToken ?? "",
    },
    body: JSON.stringify({
      source_type: input.sourceType,
      content: input.content,
    }),
  });

  if (!response.ok) {
    await failApi(response, "Import dry-run failed");
  }

  const body = (await response.json()) as Parameters<
    typeof parseImportDryRunResponse
  >[0];
  return parseImportDryRunResponse(body);
}

export async function createExportPreview(
  preset: ExportPreset,
): Promise<ExportJob> {
  await ensureSession();
  const response = await fetch("/api/v1/exports/preview", {
    method: "POST",
    credentials: "same-origin",
    headers: {
      "content-type": "application/json",
      "x-csrf-token": csrfToken ?? "",
    },
    body: JSON.stringify({ preset }),
  });

  if (!response.ok) {
    await failApi(response, "Export preview failed");
  }

  const body = (await response.json()) as Parameters<
    typeof parseExportJobResponse
  >[0];
  return parseExportJobResponse(body, "Export preview failed");
}

export async function executeExportJob(
  jobId: string,
): Promise<AnonymizedExportPayload> {
  await ensureSession();
  const response = await fetch("/api/v1/exports", {
    method: "POST",
    credentials: "same-origin",
    headers: {
      "content-type": "application/json",
      "x-csrf-token": csrfToken ?? "",
    },
    body: JSON.stringify({ job_id: jobId }),
  });

  if (!response.ok) {
    await failApi(response, "Export job execution failed");
  }

  const body = (await response.json()) as Parameters<
    typeof parseAnonymizedExportPayloadResponse
  >[0];
  return parseAnonymizedExportPayloadResponse(body);
}

export async function getPrompt(id: string): Promise<PromptDetail> {
  await ensureSession();
  const response = await fetch(`/api/v1/prompts/${encodeURIComponent(id)}`, {
    credentials: "same-origin",
  });

  if (!response.ok) {
    await failApi(response, "Prompt not found");
  }

  const body = (await response.json()) as Parameters<
    typeof parsePromptDetailResponse
  >[0];
  return parsePromptDetailResponse(body);
}

export type AskEventSummary = {
  total_count: number;
  recent_count: number;
  axis_counts: Record<string, number>;
  average_score: number;
  last_triggered_at?: string;
};

function parseAskEventSummaryResponse(body: {
  data?: {
    total_count?: unknown;
    recent_count?: unknown;
    axis_counts?: unknown;
    average_score?: unknown;
    last_triggered_at?: unknown;
    markdown?: unknown;
    prompt_body?: unknown;
    raw_path?: unknown;
  };
}): AskEventSummary {
  if (
    typeof body.data?.total_count !== "number" ||
    typeof body.data.recent_count !== "number" ||
    typeof body.data.axis_counts !== "object" ||
    body.data.axis_counts === null ||
    Object.values(body.data.axis_counts).some(
      (value) => typeof value !== "number",
    ) ||
    typeof body.data.average_score !== "number" ||
    (body.data.last_triggered_at !== undefined &&
      typeof body.data.last_triggered_at !== "string") ||
    body.data.markdown !== undefined ||
    body.data.prompt_body !== undefined ||
    body.data.raw_path !== undefined
  ) {
    throw new Error("Ask event summary unavailable: Invalid response.");
  }
  return body.data as AskEventSummary;
}

export async function getAskEventSummary(days = 7): Promise<AskEventSummary> {
  await ensureSession();
  const params = new URLSearchParams({ days: String(days) });
  const response = await fetch(`/api/v1/ask-events/summary?${params}`, {
    credentials: "same-origin",
  });

  if (!response.ok) {
    await failApi(response, "Ask event summary unavailable");
  }

  const body = (await response.json()) as Parameters<
    typeof parseAskEventSummaryResponse
  >[0];
  return parseAskEventSummaryResponse(body);
}

export async function getSimilarPrompts(
  id: string,
  limit = 5,
): Promise<PromptSummary[]> {
  await ensureSession();
  const params = new URLSearchParams({ limit: String(limit) });
  const response = await fetch(
    `/api/v1/prompts/${encodeURIComponent(id)}/similar?${params}`,
    { credentials: "same-origin" },
  );

  if (!response.ok) {
    await failApi(response, "Similar prompts unavailable");
  }

  const body = (await response.json()) as Parameters<
    typeof parsePromptSummaryArrayResponse
  >[0];
  return parsePromptSummaryArrayResponse(body, "Similar prompts unavailable");
}

export async function deletePrompt(id: string): Promise<void> {
  await ensureSession();
  const response = await fetch(`/api/v1/prompts/${encodeURIComponent(id)}`, {
    method: "DELETE",
    credentials: "same-origin",
    headers: {
      "x-csrf-token": csrfToken ?? "",
    },
  });

  if (!response.ok) {
    await failApi(response, "Delete failed");
  }
}

export async function recordPromptCopied(
  id: string,
): Promise<PromptUsefulness> {
  await ensureSession();
  const response = await fetch(
    `/api/v1/prompts/${encodeURIComponent(id)}/events`,
    {
      method: "POST",
      credentials: "same-origin",
      headers: {
        "content-type": "application/json",
        "x-csrf-token": csrfToken ?? "",
      },
      body: JSON.stringify({ type: "prompt_copied" }),
    },
  );
  if (!response.ok) {
    await failApi(response, "Prompt event failed");
  }
  const body = (await response.json()) as {
    data?: { usefulness?: unknown };
  };
  return parsePromptUsefulnessResponse(body, "Prompt event failed");
}

export async function savePromptImprovementDraft(
  id: string,
  draft: {
    draft_text: string;
    analyzer: string;
    changed_sections: PromptQualityGap[];
    safety_notes: string[];
    copied?: boolean;
  },
): Promise<PromptImprovementDraft> {
  await ensureSession();
  const response = await fetch(
    `/api/v1/prompts/${encodeURIComponent(id)}/improvements`,
    {
      method: "POST",
      credentials: "same-origin",
      headers: {
        "content-type": "application/json",
        "x-csrf-token": csrfToken ?? "",
      },
      body: JSON.stringify(draft),
    },
  );
  if (!response.ok) {
    await failApi(response, "Improvement draft save failed");
  }
  const body = (await response.json()) as Parameters<
    typeof parsePromptImprovementDraftResponse
  >[0];
  return parsePromptImprovementDraftResponse(body);
}

export async function markPromptImprovementDraftCopied(
  id: string,
  draftId: string,
): Promise<Pick<PromptImprovementDraft, "id" | "prompt_id" | "copied_at">> {
  await ensureSession();
  const response = await fetch(
    `/api/v1/prompts/${encodeURIComponent(id)}/improvements/${encodeURIComponent(draftId)}/copy`,
    {
      method: "POST",
      credentials: "same-origin",
      headers: {
        "x-csrf-token": csrfToken ?? "",
      },
    },
  );
  if (!response.ok) {
    await failApi(response, "Improvement draft copy event failed");
  }
  const body = (await response.json()) as Parameters<
    typeof parsePromptImprovementDraftCopyResponse
  >[0];
  return parsePromptImprovementDraftCopyResponse(body);
}

export async function setPromptBookmark(
  id: string,
  bookmarked: boolean,
): Promise<PromptUsefulness> {
  await ensureSession();
  const response = await fetch(
    `/api/v1/prompts/${encodeURIComponent(id)}/bookmark`,
    {
      method: "PUT",
      credentials: "same-origin",
      headers: {
        "content-type": "application/json",
        "x-csrf-token": csrfToken ?? "",
      },
      body: JSON.stringify({ bookmarked }),
    },
  );
  if (!response.ok) {
    await failApi(response, "Bookmark failed");
  }
  const body = (await response.json()) as {
    data?: { usefulness?: unknown };
  };
  return parsePromptUsefulnessResponse(body, "Bookmark failed");
}

export async function getHealth(): Promise<{
  ok: boolean;
  version: string;
  instance_id: string;
}> {
  const response = await fetch("/api/v1/health", {
    credentials: "same-origin",
  });

  if (!response.ok) {
    await failApi(response, "Health check failed");
  }

  const body = (await response.json()) as {
    markdown?: unknown;
    ok?: unknown;
    prompt_body?: unknown;
    raw_path?: unknown;
    version?: unknown;
    instance_id?: unknown;
  };
  if (
    typeof body.ok !== "boolean" ||
    typeof body.version !== "string" ||
    typeof body.instance_id !== "string" ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      body.instance_id,
    ) ||
    body.markdown !== undefined ||
    body.prompt_body !== undefined ||
    body.raw_path !== undefined
  ) {
    throw new Error("Health check failed: Invalid response.");
  }
  return {
    ok: body.ok,
    version: body.version,
    instance_id: body.instance_id,
  };
}
