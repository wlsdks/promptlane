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
};

export type PromptEffectiveness = {
  verdict: "proven" | "mixed" | "unproven";
  summary: string;
  calibration: {
    linked_outcomes: number;
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
  created_at: string;
  tool: string;
  source: string;
  project: string;
  branch?: string;
  worktree?: string;
  prompt_count: number;
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
        | "promptlane loop memory-approve"
        | "promptlane loop memory-candidate";
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
  items: LoopSummary[];
  privacy: {
    local_only: true;
    returns_prompt_bodies: false;
    returns_raw_paths: false;
    returns_compact_content: false;
  };
};

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
    typeof loop.created_at === "string" &&
    typeof loop.tool === "string" &&
    typeof loop.source === "string" &&
    typeof loop.project === "string" &&
    (loop.branch === undefined || typeof loop.branch === "string") &&
    (loop.worktree === undefined || typeof loop.worktree === "string") &&
    typeof loop.prompt_count === "number" &&
    (loop.average_prompt_score === undefined ||
      typeof loop.average_prompt_score === "number") &&
    Array.isArray(loop.top_gaps) &&
    loop.top_gaps.every((gap) => typeof gap === "string") &&
    typeof loop.outcome_status === "string" &&
    (loop.compact_boundary === undefined ||
      isLoopCompactBoundary(loop.compact_boundary))
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

function isContinuationSafetyGroup(
  value: unknown,
): value is NonNullable<LoopWorktreeResponse["continuation_safety_group"]> {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const group = value as NonNullable<
    LoopWorktreeResponse["continuation_safety_group"]
  >;
  return (
    group.label === "Continuation safety guidance" &&
    group.scope ===
      "read-only handoff boundaries for Codex and Claude Code continuation" &&
    group.includes ===
      "copy, paste, review, collect, privacy, and merge gating notes" &&
    group.reason ===
      "keeps the selected continuation path explicit without automating agents" &&
    group.writes_files === false &&
    group.external_calls === false
  );
}

function isContinuationSafetyOrderingNote(
  value: unknown,
): value is NonNullable<
  LoopWorktreeResponse["continuation_safety_ordering_note"]
> {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const note = value as NonNullable<
    LoopWorktreeResponse["continuation_safety_ordering_note"]
  >;
  return (
    note.label === "Safety guidance order" &&
    note.first ===
      "review the continuation safety guidance before copying or pasting briefs" &&
    note.then ===
      "follow copy, paste, review, collect, privacy, and merge gating notes in order" &&
    note.reason ===
      "keeps continuation handoff reviewable before any manual agent submission" &&
    note.writes_files === false &&
    note.external_calls === false
  );
}

function isContinuationSafetyNonPersistenceNote(
  value: unknown,
): value is NonNullable<
  LoopWorktreeResponse["continuation_safety_non_persistence_note"]
> {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const note = value as NonNullable<
    LoopWorktreeResponse["continuation_safety_non_persistence_note"]
  >;
  return (
    note.label === "Safety review state" &&
    note.state ===
      "reviewed guidance state is not stored or synchronized by PromptLane" &&
    note.reminder ===
      "operator re-checks safety guidance each time before manual agent submission" &&
    note.reason ===
      "keeps continuation review local to the current operator session" &&
    note.stores_state === false &&
    note.external_calls === false
  );
}

function isContinuationSafetyRecheckCue(
  value: unknown,
): value is NonNullable<
  LoopWorktreeResponse["continuation_safety_recheck_cue"]
> {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const cue = value as NonNullable<
    LoopWorktreeResponse["continuation_safety_recheck_cue"]
  >;
  return (
    cue.label === "Safety re-check cue" &&
    cue.trigger === "after each selected brief copy" &&
    cue.instruction ===
      "re-check continuation safety guidance before pasting into Codex or Claude Code" &&
    cue.reason ===
      "each copied brief can represent a new handoff decision even in the same session" &&
    cue.writes_files === false &&
    cue.external_calls === false
  );
}

function isContinuationSafetyCopyFeedbackReminder(
  value: unknown,
): value is NonNullable<
  LoopWorktreeResponse["continuation_safety_copy_feedback_reminder"]
> {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const reminder = value as NonNullable<
    LoopWorktreeResponse["continuation_safety_copy_feedback_reminder"]
  >;
  return (
    reminder.label === "Copy feedback reminder" &&
    reminder.feedback_scope ===
      "copied state only confirms the brief reached the local clipboard" &&
    reminder.next_step ===
      "return to the safety re-check cue before pasting the copied brief" &&
    reminder.reason ===
      "copy feedback is not safety approval or agent submission" &&
    reminder.writes_files === false &&
    reminder.external_calls === false
  );
}

function isContinuationSafetyCopyFeedbackAccessibilityNote(
  value: unknown,
): value is NonNullable<
  LoopWorktreeResponse["continuation_safety_copy_feedback_accessibility_note"]
> {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const note = value as NonNullable<
    LoopWorktreeResponse["continuation_safety_copy_feedback_accessibility_note"]
  >;
  return (
    note.label === "Copy feedback accessibility" &&
    note.visible_label === "selected brief copy button label remains stable" &&
    note.assistive_feedback ===
      "copied status belongs in accessible feedback instead of replacing the visible command" &&
    note.reason ===
      "keeps copy feedback clear without implying safety approval or changing layout" &&
    note.writes_files === false &&
    note.external_calls === false
  );
}

function isContinuationSafetyCopyFeedbackTimeoutNote(
  value: unknown,
): value is NonNullable<
  LoopWorktreeResponse["continuation_safety_copy_feedback_timeout_note"]
> {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const note = value as NonNullable<
    LoopWorktreeResponse["continuation_safety_copy_feedback_timeout_note"]
  >;
  return (
    note.label === "Copy feedback timeout" &&
    note.timeout_scope ===
      "copied feedback clears after a short local timeout" &&
    note.not_state ===
      "timeout does not record review completion or submission state" &&
    note.reason ===
      "keeps copied feedback temporary while preserving the manual safety review boundary" &&
    note.writes_files === false &&
    note.external_calls === false
  );
}

function isContinuationSafetyCopyFeedbackFailureNote(
  value: unknown,
): value is NonNullable<
  LoopWorktreeResponse["continuation_safety_copy_feedback_failure_note"]
> {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const note = value as NonNullable<
    LoopWorktreeResponse["continuation_safety_copy_feedback_failure_note"]
  >;
  return (
    note.label === "Copy feedback failure" &&
    note.failure_scope === "clipboard failure requires a manual retry" &&
    note.not_state ===
      "failure does not submit prompts or store review state" &&
    note.reason ===
      "keeps copy failure handling local to the operator without hidden recovery actions" &&
    note.writes_files === false &&
    note.external_calls === false
  );
}

function isContinuationSafetyCopyRetryNote(
  value: unknown,
): value is NonNullable<
  LoopWorktreeResponse["continuation_safety_copy_retry_note"]
> {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const note = value as NonNullable<
    LoopWorktreeResponse["continuation_safety_copy_retry_note"]
  >;
  return (
    note.label === "Copy retry" &&
    note.retry_scope ===
      "operator manually retries the selected brief copy action" &&
    note.not_automatic ===
      "PromptLane does not automatically retry clipboard writes or submit prompts" &&
    note.reason ===
      "keeps retry control with the operator before any Codex or Claude Code paste" &&
    note.writes_files === false &&
    note.external_calls === false
  );
}

function isContinuationSafetyPrePasteConfirmationNote(
  value: unknown,
): value is NonNullable<
  LoopWorktreeResponse["continuation_safety_pre_paste_confirmation_note"]
> {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const note = value as NonNullable<
    LoopWorktreeResponse["continuation_safety_pre_paste_confirmation_note"]
  >;
  return (
    note.label === "Pre-paste confirmation" &&
    note.confirmation ===
      "operator confirms the copied brief and target agent request before paste" &&
    note.not_submission ===
      "confirmation does not submit prompts or approve safety review" &&
    note.reason ===
      "keeps the final handoff check manual before Codex or Claude Code receives the brief" &&
    note.writes_files === false &&
    note.external_calls === false
  );
}

function isContinuationSafetyTargetAgentCheckNote(
  value: unknown,
): value is NonNullable<
  LoopWorktreeResponse["continuation_safety_target_agent_check_note"]
> {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const note = value as NonNullable<
    LoopWorktreeResponse["continuation_safety_target_agent_check_note"]
  >;
  return (
    note.label === "Target-agent check" &&
    note.check ===
      "operator verifies the active Codex or Claude Code request box before paste" &&
    note.not_inspection ===
      "PromptLane does not inspect agent UI state or target contents" &&
    note.reason ===
      "keeps target selection manual before any continuation handoff" &&
    note.writes_files === false &&
    note.external_calls === false
  );
}

function isContinuationSafetyPasteDestinationBoundaryNote(
  value: unknown,
): value is NonNullable<
  LoopWorktreeResponse["continuation_safety_paste_destination_boundary_note"]
> {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const note = value as NonNullable<
    LoopWorktreeResponse["continuation_safety_paste_destination_boundary_note"]
  >;
  return (
    note.label === "Paste destination boundary" &&
    note.boundary ===
      "paste destination is a manual operator choice in Codex or Claude Code" &&
    note.not_verified ===
      "PromptLane does not verify active windows, target contents, or paste success" &&
    note.reason ===
      "keeps destination verification outside PromptLane automation before submission" &&
    note.writes_files === false &&
    note.external_calls === false
  );
}

function isContinuationSafetyManualSubmissionBoundaryNote(
  value: unknown,
): value is NonNullable<
  LoopWorktreeResponse["continuation_safety_manual_submission_boundary_note"]
> {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const note = value as NonNullable<
    LoopWorktreeResponse["continuation_safety_manual_submission_boundary_note"]
  >;
  return (
    note.label === "Manual submission boundary" &&
    note.submission ===
      "operator submits the pasted brief manually in Codex or Claude Code" &&
    note.not_automated ===
      "PromptLane does not press enter, click submit, or record submitted state" &&
    note.reason ===
      "keeps final agent execution under operator control after paste" &&
    note.writes_files === false &&
    note.external_calls === false
  );
}

function isContinuationSafetySubmissionResultNonPersistenceNote(
  value: unknown,
): value is NonNullable<
  LoopWorktreeResponse["continuation_safety_submission_result_non_persistence_note"]
> {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const note = value as NonNullable<
    LoopWorktreeResponse["continuation_safety_submission_result_non_persistence_note"]
  >;
  return (
    note.label === "Submission result non-persistence" &&
    note.result_scope ===
      "agent response and submission result stay outside PromptLane until the next explicit loop snapshot" &&
    note.not_stored ===
      "PromptLane does not detect, store, or sync submitted state after handoff" &&
    note.reason ===
      "keeps post-submission evidence tied to explicit loop collection instead of UI monitoring" &&
    note.writes_files === false &&
    note.external_calls === false
  );
}

function isContinuationSafetyPostSubmissionCollectionReminderNote(
  value: unknown,
): value is NonNullable<
  LoopWorktreeResponse["continuation_safety_post_submission_collection_reminder_note"]
> {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const note = value as NonNullable<
    LoopWorktreeResponse["continuation_safety_post_submission_collection_reminder_note"]
  >;
  return (
    note.label === "Post-submission collection reminder" &&
    note.reminder ===
      "collect the next loop snapshot explicitly after the agent response is ready" &&
    note.not_background ===
      "PromptLane does not start collection from submission, transcript changes, or agent UI activity" &&
    note.reason ===
      "keeps post-submission collection operator-triggered and local-first" &&
    note.writes_files === false &&
    note.external_calls === false
  );
}

function isContinuationSafetyCollectionResultNonPersistenceNote(
  value: unknown,
): value is NonNullable<
  LoopWorktreeResponse["continuation_safety_collection_result_non_persistence_note"]
> {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const note = value as NonNullable<
    LoopWorktreeResponse["continuation_safety_collection_result_non_persistence_note"]
  >;
  return (
    note.label === "Collection result non-persistence" &&
    note.result_scope ===
      "collection result is not persisted until the operator records the next explicit loop snapshot" &&
    note.not_stored ===
      "PromptLane does not store, sync, or infer collection result state from agent UI activity" &&
    note.reason ===
      "keeps collection evidence tied to explicit local snapshot recording" &&
    note.writes_files === false &&
    note.external_calls === false
  );
}

function isContinuationSafetyCollectionRetryBoundaryNote(
  value: unknown,
): value is NonNullable<
  LoopWorktreeResponse["continuation_safety_collection_retry_boundary_note"]
> {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const note = value as NonNullable<
    LoopWorktreeResponse["continuation_safety_collection_retry_boundary_note"]
  >;
  return (
    note.label === "Collection retry boundary" &&
    note.retry ===
      "operator reruns the explicit loop collection flow when retry is needed" &&
    note.not_automated ===
      "PromptLane does not automatically retry collection commands or hidden recovery actions" &&
    note.reason ===
      "keeps retry control local and operator-triggered after collection uncertainty" &&
    note.writes_files === false &&
    note.external_calls === false
  );
}

function isContinuationSafetyRetryOutcomeNonPersistenceNote(
  value: unknown,
): value is NonNullable<
  LoopWorktreeResponse["continuation_safety_retry_outcome_non_persistence_note"]
> {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const note = value as NonNullable<
    LoopWorktreeResponse["continuation_safety_retry_outcome_non_persistence_note"]
  >;
  return (
    note.label === "Retry outcome non-persistence" &&
    note.outcome_scope ===
      "retry attempt and outcome stay outside PromptLane until the next explicit loop snapshot" &&
    note.not_stored ===
      "PromptLane does not detect, store, or sync retry success or failure state" &&
    note.reason ===
      "keeps retry evidence tied to explicit local snapshot recording" &&
    note.writes_files === false &&
    note.external_calls === false
  );
}

function isContinuationSafetyCollectionEvidenceFreshnessBoundaryNote(
  value: unknown,
): value is NonNullable<
  LoopWorktreeResponse["continuation_safety_collection_evidence_freshness_boundary_note"]
> {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const note = value as NonNullable<
    LoopWorktreeResponse["continuation_safety_collection_evidence_freshness_boundary_note"]
  >;
  return (
    note.label === "Collection evidence freshness boundary" &&
    note.freshness_check ===
      "operator checks freshness against the latest explicit loop snapshot evidence" &&
    note.not_verified ===
      "PromptLane does not verify freshness from git status, transcripts, or agent UI activity" &&
    note.reason ===
      "keeps evidence freshness review tied to local snapshot metadata" &&
    note.writes_files === false &&
    note.external_calls === false
  );
}

function isContinuationSafetyFreshnessResultNonPersistenceNote(
  value: unknown,
): value is NonNullable<
  LoopWorktreeResponse["continuation_safety_freshness_result_non_persistence_note"]
> {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const note = value as NonNullable<
    LoopWorktreeResponse["continuation_safety_freshness_result_non_persistence_note"]
  >;
  return (
    note.label === "Freshness result non-persistence" &&
    note.result_scope ===
      "freshness result stays outside PromptLane until the next explicit loop snapshot" &&
    note.not_stored ===
      "PromptLane does not detect, store, or sync freshness result state" &&
    note.reason ===
      "keeps freshness evidence tied to explicit local snapshot recording" &&
    note.writes_files === false &&
    note.external_calls === false
  );
}

function isContinuationSafetyFreshnessUncertaintyCollectionReminder(
  value: unknown,
): value is NonNullable<
  LoopWorktreeResponse["continuation_safety_freshness_uncertainty_collection_reminder"]
> {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const note = value as NonNullable<
    LoopWorktreeResponse["continuation_safety_freshness_uncertainty_collection_reminder"]
  >;
  return (
    note.label === "Freshness uncertainty collection reminder" &&
    note.reminder ===
      "collect a new explicit loop snapshot when evidence freshness is uncertain" &&
    note.not_automated ===
      "PromptLane does not verify freshness or start collection automatically" &&
    note.reason ===
      "keeps freshness uncertainty resolution operator-triggered and local-first" &&
    note.writes_files === false &&
    note.external_calls === false
  );
}

function isContinuationSafetyPreMergeFreshnessAdvisory(
  value: unknown,
): value is NonNullable<
  LoopWorktreeResponse["continuation_safety_pre_merge_freshness_advisory"]
> {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const note = value as NonNullable<
    LoopWorktreeResponse["continuation_safety_pre_merge_freshness_advisory"]
  >;
  return (
    note.label === "Pre-merge freshness advisory" &&
    note.advisory === "review freshness uncertainty before merge decisions" &&
    note.not_decision ===
      "PromptLane does not approve merges or verify freshness before merge" &&
    note.reason ===
      "keeps merge readiness separate from freshness uncertainty review" &&
    note.writes_files === false &&
    note.external_calls === false
  );
}

function isContinuationSafetyPreMemoryApprovalFreshnessAdvisory(
  value: unknown,
): value is NonNullable<
  LoopWorktreeResponse["continuation_safety_pre_memory_approval_freshness_advisory"]
> {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const note = value as NonNullable<
    LoopWorktreeResponse["continuation_safety_pre_memory_approval_freshness_advisory"]
  >;
  return (
    note.label === "Pre-memory-approval freshness advisory" &&
    note.advisory ===
      "review freshness uncertainty before approving loop memory" &&
    note.not_decision ===
      "PromptLane does not approve memory or verify freshness from this note" &&
    note.reason ===
      "keeps memory approval separate from freshness uncertainty review" &&
    note.writes_files === false &&
    note.external_calls === false
  );
}

function isContinuationSafetyPostMemoryApprovalCollectionReminder(
  value: unknown,
): value is NonNullable<
  LoopWorktreeResponse["continuation_safety_post_memory_approval_collection_reminder"]
> {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const note = value as NonNullable<
    LoopWorktreeResponse["continuation_safety_post_memory_approval_collection_reminder"]
  >;
  return (
    note.label === "Post-memory-approval collection reminder" &&
    note.reminder ===
      "collect a new explicit loop snapshot after approving loop memory" &&
    note.not_automated ===
      "PromptLane does not start collection from memory approval or approval state changes" &&
    note.reason ===
      "keeps post-approval collection operator-triggered and local-first" &&
    note.writes_files === false &&
    note.external_calls === false
  );
}

function isContinuationSafetyPostMemoryApprovalCollectionResultNonPersistenceNote(
  value: unknown,
): value is NonNullable<
  LoopWorktreeResponse["continuation_safety_post_memory_approval_collection_result_non_persistence_note"]
> {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const note = value as NonNullable<
    LoopWorktreeResponse["continuation_safety_post_memory_approval_collection_result_non_persistence_note"]
  >;
  return (
    note.label === "Post-memory-approval collection result non-persistence" &&
    note.result_scope ===
      "post-approval collection result stays outside PromptLane until the next explicit loop snapshot" &&
    note.not_stored ===
      "PromptLane does not detect, store, or sync post-approval collection result state" &&
    note.reason ===
      "keeps post-approval collection evidence tied to explicit local snapshot recording" &&
    note.writes_files === false &&
    note.external_calls === false
  );
}

function isContinuationSafetyPostMemoryApprovalCollectionRetryBoundaryNote(
  value: unknown,
): value is NonNullable<
  LoopWorktreeResponse["continuation_safety_post_memory_approval_collection_retry_boundary_note"]
> {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const note = value as NonNullable<
    LoopWorktreeResponse["continuation_safety_post_memory_approval_collection_retry_boundary_note"]
  >;
  return (
    note.label === "Post-memory-approval collection retry boundary" &&
    note.retry ===
      "operator reruns the explicit post-approval loop collection flow when retry is needed" &&
    note.not_automated ===
      "PromptLane does not automatically retry post-approval collection commands or hidden recovery actions" &&
    note.reason ===
      "keeps post-approval collection retry control local and operator-triggered" &&
    note.writes_files === false &&
    note.external_calls === false
  );
}

function isContinuationSafetyPostMemoryApprovalRetryOutcomeNonPersistenceNote(
  value: unknown,
): value is NonNullable<
  LoopWorktreeResponse["continuation_safety_post_memory_approval_retry_outcome_non_persistence_note"]
> {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const note = value as NonNullable<
    LoopWorktreeResponse["continuation_safety_post_memory_approval_retry_outcome_non_persistence_note"]
  >;
  return (
    note.label === "Post-memory-approval retry outcome non-persistence" &&
    note.outcome_scope ===
      "post-approval retry outcome stays outside PromptLane until the next explicit loop snapshot" &&
    note.not_stored ===
      "PromptLane does not detect, store, or sync post-approval retry success or failure state" &&
    note.reason ===
      "keeps post-approval retry evidence tied to explicit local snapshot recording" &&
    note.writes_files === false &&
    note.external_calls === false
  );
}

function isContinuationSafetyPostMemoryApprovalRetryEvidenceFreshnessBoundaryNote(
  value: unknown,
): value is NonNullable<
  LoopWorktreeResponse["continuation_safety_post_memory_approval_retry_evidence_freshness_boundary_note"]
> {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const note = value as NonNullable<
    LoopWorktreeResponse["continuation_safety_post_memory_approval_retry_evidence_freshness_boundary_note"]
  >;
  return (
    note.label === "Post-memory-approval retry evidence freshness boundary" &&
    note.review ===
      "operator checks retry evidence freshness against the latest explicit loop snapshot" &&
    note.not_verified ===
      "PromptLane does not verify post-approval retry freshness from git status, transcripts, or agent UI activity" &&
    note.reason ===
      "keeps post-approval retry freshness review tied to local snapshot metadata" &&
    note.writes_files === false &&
    note.external_calls === false
  );
}

function isContinuationSafetyPostMemoryApprovalRetryFreshnessResultNonPersistenceNote(
  value: unknown,
): value is NonNullable<
  LoopWorktreeResponse["continuation_safety_post_memory_approval_retry_freshness_result_non_persistence_note"]
> {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const note = value as NonNullable<
    LoopWorktreeResponse["continuation_safety_post_memory_approval_retry_freshness_result_non_persistence_note"]
  >;
  return (
    note.label ===
      "Post-memory-approval retry freshness result non-persistence" &&
    note.result_scope ===
      "post-approval retry freshness result stays outside PromptLane until the next explicit loop snapshot" &&
    note.not_stored ===
      "PromptLane does not detect, store, or sync post-approval retry freshness result state" &&
    note.reason ===
      "keeps post-approval retry freshness evidence tied to explicit local snapshot recording" &&
    note.writes_files === false &&
    note.external_calls === false
  );
}

function isContinuationSafetyPostMemoryApprovalRetryFreshnessUncertaintyCollectionReminder(
  value: unknown,
): value is NonNullable<
  LoopWorktreeResponse["continuation_safety_post_memory_approval_retry_freshness_uncertainty_collection_reminder"]
> {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const note = value as NonNullable<
    LoopWorktreeResponse["continuation_safety_post_memory_approval_retry_freshness_uncertainty_collection_reminder"]
  >;
  return (
    note.label ===
      "Post-memory-approval retry freshness uncertainty collection reminder" &&
    note.reminder ===
      "collect a new explicit loop snapshot when post-approval retry freshness is uncertain" &&
    note.not_automated ===
      "PromptLane does not verify post-approval retry freshness or start collection automatically" &&
    note.reason ===
      "keeps post-approval retry freshness uncertainty resolution operator-triggered and local-first" &&
    note.writes_files === false &&
    note.external_calls === false
  );
}

function isContinuationSafetyPostMemoryApprovalRetryPreMemoryApprovalFreshnessAdvisory(
  value: unknown,
): value is NonNullable<
  LoopWorktreeResponse["continuation_safety_post_memory_approval_retry_pre_memory_approval_freshness_advisory"]
> {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const note = value as NonNullable<
    LoopWorktreeResponse["continuation_safety_post_memory_approval_retry_pre_memory_approval_freshness_advisory"]
  >;
  return (
    note.label ===
      "Post-memory-approval retry pre-memory-approval freshness advisory" &&
    note.advisory ===
      "review post-approval retry freshness uncertainty before approving loop memory again" &&
    note.not_decision ===
      "PromptLane does not approve memory or verify post-approval retry freshness from this advisory" &&
    note.reason ===
      "keeps renewed memory approval separate from retry freshness uncertainty review" &&
    note.writes_files === false &&
    note.external_calls === false
  );
}

function isContinuationSafetyPostMemoryApprovalRetryRenewedMemoryApprovalCollectionReminder(
  value: unknown,
): value is NonNullable<
  LoopWorktreeResponse["continuation_safety_post_memory_approval_retry_renewed_memory_approval_collection_reminder"]
> {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const note = value as NonNullable<
    LoopWorktreeResponse["continuation_safety_post_memory_approval_retry_renewed_memory_approval_collection_reminder"]
  >;
  return (
    note.label ===
      "Post-memory-approval retry renewed-memory-approval collection reminder" &&
    note.reminder ===
      "collect a new explicit loop snapshot after approving loop memory again" &&
    note.not_automated ===
      "PromptLane does not start collection from renewed memory approval or approval state changes" &&
    note.reason ===
      "keeps renewed-memory-approval collection operator-triggered and local-first" &&
    note.writes_files === false &&
    note.external_calls === false
  );
}

function isContinuationSafetyPostMemoryApprovalRetryRenewedMemoryApprovalCollectionResultNonPersistenceNote(
  value: unknown,
): value is NonNullable<
  LoopWorktreeResponse["continuation_safety_post_memory_approval_retry_renewed_memory_approval_collection_result_non_persistence_note"]
> {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const note = value as NonNullable<
    LoopWorktreeResponse["continuation_safety_post_memory_approval_retry_renewed_memory_approval_collection_result_non_persistence_note"]
  >;
  return (
    note.label ===
      "Post-memory-approval retry renewed-memory-approval collection result non-persistence" &&
    note.result_scope ===
      "renewed-memory-approval collection result stays outside PromptLane until the next explicit loop snapshot" &&
    note.not_stored ===
      "PromptLane does not detect, store, or sync renewed-memory-approval collection result state" &&
    note.reason ===
      "keeps renewed-memory-approval collection evidence tied to explicit local snapshot recording" &&
    note.writes_files === false &&
    note.external_calls === false
  );
}

function isContinuationSafetyPostMemoryApprovalRetryRenewedMemoryApprovalCollectionUncertaintyReminder(
  value: unknown,
): value is NonNullable<
  LoopWorktreeResponse["continuation_safety_post_memory_approval_retry_renewed_memory_approval_collection_uncertainty_reminder"]
> {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const note = value as NonNullable<
    LoopWorktreeResponse["continuation_safety_post_memory_approval_retry_renewed_memory_approval_collection_uncertainty_reminder"]
  >;
  return (
    note.label ===
      "Post-memory-approval retry renewed-memory-approval collection uncertainty reminder" &&
    note.reminder ===
      "collect a new explicit loop snapshot when renewed-memory-approval collection result is uncertain" &&
    note.not_automated ===
      "PromptLane does not verify renewed-memory-approval collection result or start collection automatically" &&
    note.reason ===
      "keeps renewed-memory-approval collection uncertainty resolution operator-triggered and local-first" &&
    note.writes_files === false &&
    note.external_calls === false
  );
}

function isContinuationSafetyPostMemoryApprovalRetryRenewedMemoryApprovalPreMergeFreshnessAdvisory(
  value: unknown,
): value is NonNullable<
  LoopWorktreeResponse["continuation_safety_post_memory_approval_retry_renewed_memory_approval_pre_merge_freshness_advisory"]
> {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const note = value as NonNullable<
    LoopWorktreeResponse["continuation_safety_post_memory_approval_retry_renewed_memory_approval_pre_merge_freshness_advisory"]
  >;
  return (
    note.label ===
      "Post-memory-approval retry renewed-memory-approval pre-merge freshness advisory" &&
    note.advisory ===
      "review renewed-memory-approval freshness uncertainty before merge decisions" &&
    note.not_decision ===
      "PromptLane does not approve merges or verify renewed-memory-approval freshness before merge" &&
    note.reason ===
      "keeps merge readiness separate from renewed-memory-approval freshness uncertainty review" &&
    note.writes_files === false &&
    note.external_calls === false
  );
}

function isContinuationSafetyPostMemoryApprovalRetryRenewedMemoryApprovalPreHandoffFreshnessAdvisory(
  value: unknown,
): value is NonNullable<
  LoopWorktreeResponse["continuation_safety_post_memory_approval_retry_renewed_memory_approval_pre_handoff_freshness_advisory"]
> {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const note = value as NonNullable<
    LoopWorktreeResponse["continuation_safety_post_memory_approval_retry_renewed_memory_approval_pre_handoff_freshness_advisory"]
  >;
  return (
    note.label ===
      "Post-memory-approval retry renewed-memory-approval pre-handoff freshness advisory" &&
    note.advisory ===
      "review renewed-memory-approval freshness uncertainty before continuation handoff" &&
    note.not_decision ===
      "PromptLane does not approve handoffs or verify renewed-memory-approval freshness before handoff" &&
    note.reason ===
      "keeps continuation handoff separate from renewed-memory-approval freshness uncertainty review" &&
    note.writes_files === false &&
    note.external_calls === false
  );
}

function isContinuationSafetyPostMemoryApprovalRetryRenewedMemoryApprovalPrePasteFreshnessAdvisory(
  value: unknown,
): value is NonNullable<
  LoopWorktreeResponse["continuation_safety_post_memory_approval_retry_renewed_memory_approval_pre_paste_freshness_advisory"]
> {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const note = value as NonNullable<
    LoopWorktreeResponse["continuation_safety_post_memory_approval_retry_renewed_memory_approval_pre_paste_freshness_advisory"]
  >;
  return (
    note.label ===
      "Post-memory-approval retry renewed-memory-approval pre-paste freshness advisory" &&
    note.advisory ===
      "review renewed-memory-approval freshness uncertainty before pasting into Codex or Claude Code" &&
    note.not_decision ===
      "PromptLane does not approve paste targets or verify renewed-memory-approval freshness before paste" &&
    note.reason ===
      "keeps paste readiness separate from renewed-memory-approval freshness uncertainty review" &&
    note.writes_files === false &&
    note.external_calls === false
  );
}

function isContinuationSafetyPostMemoryApprovalRetryRenewedMemoryApprovalPreSubmitFreshnessAdvisory(
  value: unknown,
): value is NonNullable<
  LoopWorktreeResponse["continuation_safety_post_memory_approval_retry_renewed_memory_approval_pre_submit_freshness_advisory"]
> {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const note = value as NonNullable<
    LoopWorktreeResponse["continuation_safety_post_memory_approval_retry_renewed_memory_approval_pre_submit_freshness_advisory"]
  >;
  return (
    note.label ===
      "Post-memory-approval retry renewed-memory-approval pre-submit freshness advisory" &&
    note.advisory ===
      "review renewed-memory-approval freshness uncertainty before submitting in Codex or Claude Code" &&
    note.not_decision ===
      "PromptLane does not approve submissions or verify renewed-memory-approval freshness before submit" &&
    note.reason ===
      "keeps submission readiness separate from renewed-memory-approval freshness uncertainty review" &&
    note.writes_files === false &&
    note.external_calls === false
  );
}

function isContinuationSafetyPostMemoryApprovalRetryRenewedMemoryApprovalPostSubmitFreshnessAdvisory(
  value: unknown,
): value is NonNullable<
  LoopWorktreeResponse["continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_freshness_advisory"]
> {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const note = value as NonNullable<
    LoopWorktreeResponse["continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_freshness_advisory"]
  >;
  return (
    note.label ===
      "Post-memory-approval retry renewed-memory-approval post-submit freshness advisory" &&
    note.advisory ===
      "collect a new explicit loop snapshot after submission when renewed-memory-approval freshness is uncertain" &&
    note.not_automated ===
      "PromptLane does not monitor submitted state, agent responses, or renewed-memory-approval freshness after submit" &&
    note.reason ===
      "keeps post-submit freshness review tied to explicit local snapshot collection" &&
    note.writes_files === false &&
    note.external_calls === false
  );
}

function isContinuationSafetyPostMemoryApprovalRetryRenewedMemoryApprovalPostSubmitCollectionResultNonPersistenceNote(
  value: unknown,
): value is NonNullable<
  LoopWorktreeResponse["continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_collection_result_non_persistence_note"]
> {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const note = value as NonNullable<
    LoopWorktreeResponse["continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_collection_result_non_persistence_note"]
  >;
  return (
    note.label ===
      "Post-memory-approval retry renewed-memory-approval post-submit collection result non-persistence" &&
    note.result_scope ===
      "post-submit collection result stays outside PromptLane until the next explicit loop snapshot" &&
    note.not_stored ===
      "PromptLane does not detect, store, or sync post-submit collection result state" &&
    note.reason ===
      "keeps post-submit collection evidence tied to explicit local snapshot recording" &&
    note.writes_files === false &&
    note.external_calls === false
  );
}

function isContinuationSafetyPostMemoryApprovalRetryRenewedMemoryApprovalPostSubmitCollectionRetryBoundaryNote(
  value: unknown,
): value is NonNullable<
  LoopWorktreeResponse["continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_collection_retry_boundary_note"]
> {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const note = value as NonNullable<
    LoopWorktreeResponse["continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_collection_retry_boundary_note"]
  >;
  return (
    note.label ===
      "Post-memory-approval retry renewed-memory-approval post-submit collection retry boundary" &&
    note.retry ===
      "operator reruns the explicit post-submit loop collection flow when retry is needed" &&
    note.not_automated ===
      "PromptLane does not automatically retry post-submit collection commands or hidden recovery actions" &&
    note.reason ===
      "keeps post-submit collection retry control local and operator-triggered" &&
    note.writes_files === false &&
    note.external_calls === false
  );
}

function isContinuationSafetyPostMemoryApprovalRetryRenewedMemoryApprovalPostSubmitRetryOutcomeNonPersistenceNote(
  value: unknown,
): value is NonNullable<
  LoopWorktreeResponse["continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_outcome_non_persistence_note"]
> {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const note = value as NonNullable<
    LoopWorktreeResponse["continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_outcome_non_persistence_note"]
  >;
  return (
    note.label ===
      "Post-memory-approval retry renewed-memory-approval post-submit retry outcome non-persistence" &&
    note.outcome_scope ===
      "post-submit retry attempt and outcome stay outside PromptLane until the next explicit loop snapshot" &&
    note.not_stored ===
      "PromptLane does not detect, store, or sync post-submit retry success or failure state" &&
    note.reason ===
      "keeps post-submit retry evidence tied to explicit local snapshot recording" &&
    note.writes_files === false &&
    note.external_calls === false
  );
}

function isContinuationSafetyPostMemoryApprovalRetryRenewedMemoryApprovalPostSubmitRetryEvidenceFreshnessBoundaryNote(
  value: unknown,
): value is NonNullable<
  LoopWorktreeResponse["continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_evidence_freshness_boundary_note"]
> {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const note = value as NonNullable<
    LoopWorktreeResponse["continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_evidence_freshness_boundary_note"]
  >;
  return (
    note.label ===
      "Post-memory-approval retry renewed-memory-approval post-submit retry evidence freshness boundary" &&
    note.freshness_scope ===
      "operator checks post-submit retry evidence freshness against the latest explicit loop snapshot" &&
    note.not_verified ===
      "PromptLane does not verify post-submit retry evidence freshness from git status, transcripts, or agent UI activity" &&
    note.reason ===
      "keeps post-submit retry evidence freshness review tied to local snapshot metadata" &&
    note.writes_files === false &&
    note.external_calls === false
  );
}

function isContinuationSafetyPostMemoryApprovalRetryRenewedMemoryApprovalPostSubmitRetryFreshnessResultNonPersistenceNote(
  value: unknown,
): value is NonNullable<
  LoopWorktreeResponse["continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_freshness_result_non_persistence_note"]
> {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const note = value as NonNullable<
    LoopWorktreeResponse["continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_freshness_result_non_persistence_note"]
  >;
  return (
    note.label ===
      "Post-memory-approval retry renewed-memory-approval post-submit retry freshness result non-persistence" &&
    note.result_scope ===
      "post-submit retry freshness result stays outside PromptLane until the next explicit loop snapshot" &&
    note.not_stored ===
      "PromptLane does not detect, store, or sync post-submit retry freshness result state" &&
    note.reason ===
      "keeps post-submit retry freshness evidence tied to explicit local snapshot recording" &&
    note.writes_files === false &&
    note.external_calls === false
  );
}

function isContinuationSafetyPostMemoryApprovalRetryRenewedMemoryApprovalPostSubmitRetryFreshnessUncertaintyCollectionReminder(
  value: unknown,
): value is NonNullable<
  LoopWorktreeResponse["continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_freshness_uncertainty_collection_reminder"]
> {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const note = value as NonNullable<
    LoopWorktreeResponse["continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_freshness_uncertainty_collection_reminder"]
  >;
  return (
    note.label ===
      "Post-memory-approval retry renewed-memory-approval post-submit retry freshness uncertainty collection reminder" &&
    note.collection_trigger ===
      "collect a new explicit loop snapshot when post-submit retry freshness is uncertain" &&
    note.not_automated ===
      "PromptLane does not verify post-submit retry freshness or start collection automatically" &&
    note.reason ===
      "keeps post-submit retry freshness uncertainty resolution operator-triggered and local-first" &&
    note.writes_files === false &&
    note.external_calls === false
  );
}

function isContinuationSafetyPostMemoryApprovalRetryRenewedMemoryApprovalPostSubmitRetryPreMemoryApprovalFreshnessAdvisory(
  value: unknown,
): value is NonNullable<
  LoopWorktreeResponse["continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_pre_memory_approval_freshness_advisory"]
> {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const note = value as NonNullable<
    LoopWorktreeResponse["continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_pre_memory_approval_freshness_advisory"]
  >;
  return (
    note.label ===
      "Post-memory-approval retry renewed-memory-approval post-submit retry pre-memory-approval freshness advisory" &&
    note.advisory ===
      "review post-submit retry freshness uncertainty before approving loop memory again" &&
    note.not_decision ===
      "PromptLane does not approve memory or verify post-submit retry freshness from this advisory" &&
    note.reason ===
      "keeps renewed memory approval separate from post-submit retry freshness uncertainty review" &&
    note.writes_files === false &&
    note.external_calls === false
  );
}

function isContinuationSafetyPostMemoryApprovalRetryRenewedMemoryApprovalPostSubmitRetryRenewedMemoryApprovalCollectionReminder(
  value: unknown,
): value is NonNullable<
  LoopWorktreeResponse["continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_collection_reminder"]
> {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const note = value as NonNullable<
    LoopWorktreeResponse["continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_collection_reminder"]
  >;
  return (
    note.label ===
      "Post-memory-approval retry renewed-memory-approval post-submit retry renewed-memory-approval collection reminder" &&
    note.reminder ===
      "collect a new explicit loop snapshot after approving loop memory again after post-submit retry" &&
    note.not_automated ===
      "PromptLane does not start collection from post-submit retry renewed memory approval or hidden approval signals" &&
    note.reason ===
      "keeps post-submit retry renewed-memory-approval collection operator-triggered and local-first" &&
    note.writes_files === false &&
    note.external_calls === false
  );
}

function isContinuationSafetyPostMemoryApprovalRetryRenewedMemoryApprovalPostSubmitRetryRenewedMemoryApprovalCollectionResultNonPersistenceNote(
  value: unknown,
): value is NonNullable<
  LoopWorktreeResponse["continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_collection_result_non_persistence_note"]
> {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const note = value as NonNullable<
    LoopWorktreeResponse["continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_collection_result_non_persistence_note"]
  >;
  return (
    note.label ===
      "Post-memory-approval retry renewed-memory-approval post-submit retry renewed-memory-approval collection result non-persistence" &&
    note.result_scope ===
      "post-submit retry renewed-memory-approval collection result stays outside PromptLane until the next explicit loop snapshot" &&
    note.not_stored ===
      "PromptLane does not detect, store, or sync post-submit retry renewed-memory-approval collection result state" &&
    note.reason ===
      "keeps post-submit retry renewed-memory-approval collection evidence tied to explicit local snapshot recording" &&
    note.writes_files === false &&
    note.external_calls === false
  );
}

function isContinuationSafetyPostMemoryApprovalRetryRenewedMemoryApprovalPostSubmitRetryRenewedMemoryApprovalCollectionUncertaintyReminder(
  value: unknown,
): value is NonNullable<
  LoopWorktreeResponse["continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_collection_uncertainty_reminder"]
> {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const note = value as NonNullable<
    LoopWorktreeResponse["continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_collection_uncertainty_reminder"]
  >;
  return (
    note.label ===
      "Post-memory-approval retry renewed-memory-approval post-submit retry renewed-memory-approval collection uncertainty reminder" &&
    note.reminder ===
      "collect a new explicit loop snapshot when post-submit retry renewed-memory-approval collection result is uncertain" &&
    note.not_automated ===
      "PromptLane does not verify post-submit retry renewed-memory-approval collection result or start collection automatically" &&
    note.reason ===
      "keeps post-submit retry renewed-memory-approval collection uncertainty resolution operator-triggered and local-first" &&
    note.writes_files === false &&
    note.external_calls === false
  );
}

function isContinuationSafetyPostMemoryApprovalRetryRenewedMemoryApprovalPostSubmitRetryRenewedMemoryApprovalPreMergeFreshnessAdvisory(
  value: unknown,
): value is NonNullable<
  LoopWorktreeResponse["continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_pre_merge_freshness_advisory"]
> {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const note = value as NonNullable<
    LoopWorktreeResponse["continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_pre_merge_freshness_advisory"]
  >;
  return (
    note.label ===
      "Post-memory-approval retry renewed-memory-approval post-submit retry renewed-memory-approval pre-merge freshness advisory" &&
    note.advisory ===
      "review post-submit retry renewed-memory-approval freshness uncertainty before merge decisions" &&
    note.not_decision ===
      "PromptLane does not approve merges or verify post-submit retry renewed-memory-approval freshness before merge" &&
    note.reason ===
      "keeps merge readiness separate from post-submit retry renewed-memory-approval freshness uncertainty review" &&
    note.writes_files === false &&
    note.external_calls === false
  );
}

function isContinuationSafetyPostMemoryApprovalRetryRenewedMemoryApprovalPostSubmitRetryRenewedMemoryApprovalPreHandoffFreshnessAdvisory(
  value: unknown,
): value is NonNullable<
  LoopWorktreeResponse["continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_pre_handoff_freshness_advisory"]
> {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const note = value as NonNullable<
    LoopWorktreeResponse["continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_pre_handoff_freshness_advisory"]
  >;
  return (
    note.label ===
      "Post-memory-approval retry renewed-memory-approval post-submit retry renewed-memory-approval pre-handoff freshness advisory" &&
    note.advisory ===
      "review post-submit retry renewed-memory-approval freshness uncertainty before continuation handoff" &&
    note.not_decision ===
      "PromptLane does not approve handoffs or verify post-submit retry renewed-memory-approval freshness before handoff" &&
    note.reason ===
      "keeps continuation handoff separate from post-submit retry renewed-memory-approval freshness uncertainty review" &&
    note.writes_files === false &&
    note.external_calls === false
  );
}

function isContinuationSafetyPostMemoryApprovalRetryRenewedMemoryApprovalPostSubmitRetryRenewedMemoryApprovalPrePasteFreshnessAdvisory(
  value: unknown,
): value is NonNullable<
  LoopWorktreeResponse["continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_pre_paste_freshness_advisory"]
> {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const note = value as NonNullable<
    LoopWorktreeResponse["continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_pre_paste_freshness_advisory"]
  >;
  return (
    note.label ===
      "Post-memory-approval retry renewed-memory-approval post-submit retry renewed-memory-approval pre-paste freshness advisory" &&
    note.advisory ===
      "review post-submit retry renewed-memory-approval freshness uncertainty before pasting into Codex or Claude Code" &&
    note.not_decision ===
      "PromptLane does not approve paste targets or verify post-submit retry renewed-memory-approval freshness before paste" &&
    note.reason ===
      "keeps paste readiness separate from post-submit retry renewed-memory-approval freshness uncertainty review" &&
    note.writes_files === false &&
    note.external_calls === false
  );
}

function isContinuationSafetyPostMemoryApprovalRetryRenewedMemoryApprovalPostSubmitRetryRenewedMemoryApprovalPreSubmitFreshnessAdvisory(
  value: unknown,
): value is NonNullable<
  LoopWorktreeResponse["continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_pre_submit_freshness_advisory"]
> {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const note = value as NonNullable<
    LoopWorktreeResponse["continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_pre_submit_freshness_advisory"]
  >;
  return (
    note.label ===
      "Post-memory-approval retry renewed-memory-approval post-submit retry renewed-memory-approval pre-submit freshness advisory" &&
    note.advisory ===
      "review post-submit retry renewed-memory-approval freshness uncertainty before submitting in Codex or Claude Code" &&
    note.not_decision ===
      "PromptLane does not approve submissions or verify post-submit retry renewed-memory-approval freshness before submit" &&
    note.reason ===
      "keeps submission readiness separate from post-submit retry renewed-memory-approval freshness uncertainty review" &&
    note.writes_files === false &&
    note.external_calls === false
  );
}

function isContinuationSafetyPostMemoryApprovalRetryRenewedMemoryApprovalPostSubmitRetryRenewedMemoryApprovalPostSubmitFreshnessAdvisory(
  value: unknown,
): value is NonNullable<
  LoopWorktreeResponse["continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_freshness_advisory"]
> {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const note = value as NonNullable<
    LoopWorktreeResponse["continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_freshness_advisory"]
  >;
  return (
    note.label ===
      "Post-memory-approval retry renewed-memory-approval post-submit retry renewed-memory-approval post-submit freshness advisory" &&
    note.advisory ===
      "collect a new explicit loop snapshot after submission when post-submit retry renewed-memory-approval freshness is uncertain" &&
    note.not_automated ===
      "PromptLane does not monitor submitted state, agent responses, or post-submit retry renewed-memory-approval freshness after submit" &&
    note.reason ===
      "keeps post-submit retry renewed-memory-approval freshness review tied to explicit local snapshot collection" &&
    note.writes_files === false &&
    note.external_calls === false
  );
}

function isContinuationSafetyPostMemoryApprovalRetryRenewedMemoryApprovalPostSubmitRetryRenewedMemoryApprovalPostSubmitCollectionResultNonPersistenceNote(
  value: unknown,
): value is NonNullable<
  LoopWorktreeResponse["continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_result_non_persistence_note"]
> {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const note = value as NonNullable<
    LoopWorktreeResponse["continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_result_non_persistence_note"]
  >;
  return (
    note.label ===
      "Post-memory-approval retry renewed-memory-approval post-submit retry renewed-memory-approval post-submit collection result non-persistence" &&
    note.result_scope ===
      "post-submit retry renewed-memory-approval post-submit collection result stays outside PromptLane until the next explicit loop snapshot" &&
    note.not_stored ===
      "PromptLane does not detect, store, or sync post-submit retry renewed-memory-approval post-submit collection result state" &&
    note.reason ===
      "keeps post-submit retry renewed-memory-approval post-submit collection evidence tied to explicit local snapshot recording" &&
    note.writes_files === false &&
    note.external_calls === false
  );
}

function isContinuationSafetyPostMemoryApprovalRetryRenewedMemoryApprovalPostSubmitRetryRenewedMemoryApprovalPostSubmitCollectionUncertaintyReminder(
  value: unknown,
): value is NonNullable<
  LoopWorktreeResponse["continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_uncertainty_reminder"]
> {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const note = value as NonNullable<
    LoopWorktreeResponse["continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_uncertainty_reminder"]
  >;
  return (
    note.label ===
      "Post-memory-approval retry renewed-memory-approval post-submit retry renewed-memory-approval post-submit collection uncertainty reminder" &&
    note.reminder ===
      "collect a new explicit loop snapshot when post-submit retry renewed-memory-approval post-submit collection result is uncertain" &&
    note.not_automated ===
      "PromptLane does not verify post-submit retry renewed-memory-approval post-submit collection result or start collection automatically" &&
    note.reason ===
      "keeps post-submit retry renewed-memory-approval post-submit collection uncertainty resolution operator-triggered and local-first" &&
    note.writes_files === false &&
    note.external_calls === false
  );
}

function isContinuationSafetyPostMemoryApprovalRetryRenewedMemoryApprovalPostSubmitRetryRenewedMemoryApprovalPostSubmitCollectionPreMergeFreshnessAdvisory(
  value: unknown,
): value is NonNullable<
  LoopWorktreeResponse["continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_pre_merge_freshness_advisory"]
> {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const note = value as NonNullable<
    LoopWorktreeResponse["continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_pre_merge_freshness_advisory"]
  >;
  return (
    note.label ===
      "Post-memory-approval retry renewed-memory-approval post-submit retry renewed-memory-approval post-submit collection pre-merge freshness advisory" &&
    note.advisory ===
      "review post-submit retry renewed-memory-approval post-submit collection freshness uncertainty before merge decisions" &&
    note.not_decision ===
      "PromptLane does not approve merges or verify post-submit retry renewed-memory-approval post-submit collection freshness before merge" &&
    note.reason ===
      "keeps merge readiness separate from post-submit retry renewed-memory-approval post-submit collection freshness uncertainty review" &&
    note.writes_files === false &&
    note.external_calls === false
  );
}

function isContinuationSafetyPostMemoryApprovalRetryRenewedMemoryApprovalPostSubmitRetryRenewedMemoryApprovalPostSubmitCollectionPreHandoffFreshnessAdvisory(
  value: unknown,
): value is NonNullable<
  LoopWorktreeResponse["continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_pre_handoff_freshness_advisory"]
> {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const note = value as NonNullable<
    LoopWorktreeResponse["continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_pre_handoff_freshness_advisory"]
  >;
  return (
    note.label ===
      "Post-memory-approval retry renewed-memory-approval post-submit retry renewed-memory-approval post-submit collection pre-handoff freshness advisory" &&
    note.advisory ===
      "review post-submit retry renewed-memory-approval post-submit collection freshness uncertainty before continuation handoff" &&
    note.not_decision ===
      "PromptLane does not approve handoffs or verify post-submit retry renewed-memory-approval post-submit collection freshness before handoff" &&
    note.reason ===
      "keeps continuation handoff separate from post-submit retry renewed-memory-approval post-submit collection freshness uncertainty review" &&
    note.writes_files === false &&
    note.external_calls === false
  );
}

function isContinuationSafetyPostMemoryApprovalRetryRenewedMemoryApprovalPostSubmitRetryRenewedMemoryApprovalPostSubmitCollectionPrePasteFreshnessAdvisory(
  value: unknown,
): value is NonNullable<
  LoopWorktreeResponse["continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_pre_paste_freshness_advisory"]
> {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const note = value as NonNullable<
    LoopWorktreeResponse["continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_pre_paste_freshness_advisory"]
  >;
  return (
    note.label ===
      "Post-memory-approval retry renewed-memory-approval post-submit retry renewed-memory-approval post-submit collection pre-paste freshness advisory" &&
    note.advisory ===
      "review post-submit retry renewed-memory-approval post-submit collection freshness uncertainty before pasting into Codex or Claude Code" &&
    note.not_decision ===
      "PromptLane does not approve paste targets or verify post-submit retry renewed-memory-approval post-submit collection freshness before paste" &&
    note.reason ===
      "keeps paste readiness separate from post-submit retry renewed-memory-approval post-submit collection freshness uncertainty review" &&
    note.writes_files === false &&
    note.external_calls === false
  );
}

function isContinuationSafetyPostMemoryApprovalRetryRenewedMemoryApprovalPostSubmitRetryRenewedMemoryApprovalPostSubmitCollectionPreSubmitFreshnessAdvisory(
  value: unknown,
): value is NonNullable<
  LoopWorktreeResponse["continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_pre_submit_freshness_advisory"]
> {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const note = value as NonNullable<
    LoopWorktreeResponse["continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_pre_submit_freshness_advisory"]
  >;
  return (
    note.label ===
      "Post-memory-approval retry renewed-memory-approval post-submit retry renewed-memory-approval post-submit collection pre-submit freshness advisory" &&
    note.advisory ===
      "review post-submit retry renewed-memory-approval post-submit collection freshness uncertainty before submitting in Codex or Claude Code" &&
    note.not_decision ===
      "PromptLane does not approve submissions or verify post-submit retry renewed-memory-approval post-submit collection freshness before submit" &&
    note.reason ===
      "keeps submission readiness separate from post-submit retry renewed-memory-approval post-submit collection freshness uncertainty review" &&
    note.writes_files === false &&
    note.external_calls === false
  );
}

function isContinuationSafetyPostMemoryApprovalRetryRenewedMemoryApprovalPostSubmitRetryRenewedMemoryApprovalPostSubmitCollectionPostSubmitFreshnessAdvisory(
  value: unknown,
): value is NonNullable<
  LoopWorktreeResponse["continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_post_submit_freshness_advisory"]
> {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const note = value as NonNullable<
    LoopWorktreeResponse["continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_post_submit_freshness_advisory"]
  >;
  return (
    note.label ===
      "Post-memory-approval retry renewed-memory-approval post-submit retry renewed-memory-approval post-submit collection post-submit freshness advisory" &&
    note.advisory ===
      "collect a new explicit loop snapshot after submission when post-submit retry renewed-memory-approval post-submit collection freshness is uncertain" &&
    note.not_monitored ===
      "PromptLane does not monitor submitted state, agent responses, or post-submit retry renewed-memory-approval post-submit collection freshness after submit" &&
    note.reason ===
      "keeps post-submit retry renewed-memory-approval post-submit collection freshness review tied to explicit local snapshot collection" &&
    note.writes_files === false &&
    note.external_calls === false
  );
}

function isContinuationSafetyPostMemoryApprovalRetryRenewedMemoryApprovalPostSubmitRetryRenewedMemoryApprovalPostSubmitCollectionFreshnessResultNonPersistenceNote(
  value: unknown,
): value is NonNullable<
  LoopWorktreeResponse["continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_freshness_result_non_persistence_note"]
> {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const note = value as NonNullable<
    LoopWorktreeResponse["continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_freshness_result_non_persistence_note"]
  >;
  return (
    note.label ===
      "Post-memory-approval retry renewed-memory-approval post-submit retry renewed-memory-approval post-submit collection freshness result non-persistence" &&
    note.not_stored ===
      "post-submit retry renewed-memory-approval post-submit collection freshness result stays outside PromptLane until the next explicit loop snapshot" &&
    note.not_detected ===
      "PromptLane does not detect, store, or sync post-submit retry renewed-memory-approval post-submit collection freshness result state" &&
    note.reason ===
      "keeps post-submit retry renewed-memory-approval post-submit collection freshness evidence tied to explicit local snapshot recording" &&
    note.writes_files === false &&
    note.external_calls === false
  );
}

function isContinuationSafetyPostMemoryApprovalRetryRenewedMemoryApprovalPostSubmitRetryRenewedMemoryApprovalPostSubmitCollectionFreshnessUncertaintyCollectionReminder(
  value: unknown,
): value is NonNullable<
  LoopWorktreeResponse["continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_freshness_uncertainty_collection_reminder"]
> {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const note = value as NonNullable<
    LoopWorktreeResponse["continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_freshness_uncertainty_collection_reminder"]
  >;
  return (
    note.label ===
      "Post-memory-approval retry renewed-memory-approval post-submit retry renewed-memory-approval post-submit collection freshness uncertainty collection reminder" &&
    note.reminder ===
      "collect a new explicit loop snapshot when post-submit retry renewed-memory-approval post-submit collection freshness is uncertain" &&
    note.not_automated ===
      "PromptLane does not verify post-submit retry renewed-memory-approval post-submit collection freshness or start collection automatically" &&
    note.reason ===
      "keeps post-submit retry renewed-memory-approval post-submit collection freshness uncertainty resolution operator-triggered and local-first" &&
    note.writes_files === false &&
    note.external_calls === false
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
    isLoopReviewPacketNextAction(readiness.next_action)
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
    (activity.next_action ===
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
    (candidate.next_action === "promptlane loop memory-approve" ||
      candidate.next_action === "promptlane loop memory-candidate")
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
  continuation_safety_group?: {
    label: "Continuation safety guidance";
    scope: "read-only handoff boundaries for Codex and Claude Code continuation";
    includes: "copy, paste, review, collect, privacy, and merge gating notes";
    reason: "keeps the selected continuation path explicit without automating agents";
    writes_files: false;
    external_calls: false;
  };
  continuation_safety_ordering_note?: {
    label: "Safety guidance order";
    first: "review the continuation safety guidance before copying or pasting briefs";
    then: "follow copy, paste, review, collect, privacy, and merge gating notes in order";
    reason: "keeps continuation handoff reviewable before any manual agent submission";
    writes_files: false;
    external_calls: false;
  };
  continuation_safety_non_persistence_note?: {
    label: "Safety review state";
    state: "reviewed guidance state is not stored or synchronized by PromptLane";
    reminder: "operator re-checks safety guidance each time before manual agent submission";
    reason: "keeps continuation review local to the current operator session";
    stores_state: false;
    external_calls: false;
  };
  continuation_safety_recheck_cue?: {
    label: "Safety re-check cue";
    trigger: "after each selected brief copy";
    instruction: "re-check continuation safety guidance before pasting into Codex or Claude Code";
    reason: "each copied brief can represent a new handoff decision even in the same session";
    writes_files: false;
    external_calls: false;
  };
  continuation_safety_copy_feedback_reminder?: {
    label: "Copy feedback reminder";
    feedback_scope: "copied state only confirms the brief reached the local clipboard";
    next_step: "return to the safety re-check cue before pasting the copied brief";
    reason: "copy feedback is not safety approval or agent submission";
    writes_files: false;
    external_calls: false;
  };
  continuation_safety_copy_feedback_accessibility_note?: {
    label: "Copy feedback accessibility";
    visible_label: "selected brief copy button label remains stable";
    assistive_feedback: "copied status belongs in accessible feedback instead of replacing the visible command";
    reason: "keeps copy feedback clear without implying safety approval or changing layout";
    writes_files: false;
    external_calls: false;
  };
  continuation_safety_copy_feedback_timeout_note?: {
    label: "Copy feedback timeout";
    timeout_scope: "copied feedback clears after a short local timeout";
    not_state: "timeout does not record review completion or submission state";
    reason: "keeps copied feedback temporary while preserving the manual safety review boundary";
    writes_files: false;
    external_calls: false;
  };
  continuation_safety_copy_feedback_failure_note?: {
    label: "Copy feedback failure";
    failure_scope: "clipboard failure requires a manual retry";
    not_state: "failure does not submit prompts or store review state";
    reason: "keeps copy failure handling local to the operator without hidden recovery actions";
    writes_files: false;
    external_calls: false;
  };
  continuation_safety_copy_retry_note?: {
    label: "Copy retry";
    retry_scope: "operator manually retries the selected brief copy action";
    not_automatic: "PromptLane does not automatically retry clipboard writes or submit prompts";
    reason: "keeps retry control with the operator before any Codex or Claude Code paste";
    writes_files: false;
    external_calls: false;
  };
  continuation_safety_pre_paste_confirmation_note?: {
    label: "Pre-paste confirmation";
    confirmation: "operator confirms the copied brief and target agent request before paste";
    not_submission: "confirmation does not submit prompts or approve safety review";
    reason: "keeps the final handoff check manual before Codex or Claude Code receives the brief";
    writes_files: false;
    external_calls: false;
  };
  continuation_safety_target_agent_check_note?: {
    label: "Target-agent check";
    check: "operator verifies the active Codex or Claude Code request box before paste";
    not_inspection: "PromptLane does not inspect agent UI state or target contents";
    reason: "keeps target selection manual before any continuation handoff";
    writes_files: false;
    external_calls: false;
  };
  continuation_safety_paste_destination_boundary_note?: {
    label: "Paste destination boundary";
    boundary: "paste destination is a manual operator choice in Codex or Claude Code";
    not_verified: "PromptLane does not verify active windows, target contents, or paste success";
    reason: "keeps destination verification outside PromptLane automation before submission";
    writes_files: false;
    external_calls: false;
  };
  continuation_safety_manual_submission_boundary_note?: {
    label: "Manual submission boundary";
    submission: "operator submits the pasted brief manually in Codex or Claude Code";
    not_automated: "PromptLane does not press enter, click submit, or record submitted state";
    reason: "keeps final agent execution under operator control after paste";
    writes_files: false;
    external_calls: false;
  };
  continuation_safety_submission_result_non_persistence_note?: {
    label: "Submission result non-persistence";
    result_scope: "agent response and submission result stay outside PromptLane until the next explicit loop snapshot";
    not_stored: "PromptLane does not detect, store, or sync submitted state after handoff";
    reason: "keeps post-submission evidence tied to explicit loop collection instead of UI monitoring";
    writes_files: false;
    external_calls: false;
  };
  continuation_safety_post_submission_collection_reminder_note?: {
    label: "Post-submission collection reminder";
    reminder: "collect the next loop snapshot explicitly after the agent response is ready";
    not_background: "PromptLane does not start collection from submission, transcript changes, or agent UI activity";
    reason: "keeps post-submission collection operator-triggered and local-first";
    writes_files: false;
    external_calls: false;
  };
  continuation_safety_collection_result_non_persistence_note?: {
    label: "Collection result non-persistence";
    result_scope: "collection result is not persisted until the operator records the next explicit loop snapshot";
    not_stored: "PromptLane does not store, sync, or infer collection result state from agent UI activity";
    reason: "keeps collection evidence tied to explicit local snapshot recording";
    writes_files: false;
    external_calls: false;
  };
  continuation_safety_collection_retry_boundary_note?: {
    label: "Collection retry boundary";
    retry: "operator reruns the explicit loop collection flow when retry is needed";
    not_automated: "PromptLane does not automatically retry collection commands or hidden recovery actions";
    reason: "keeps retry control local and operator-triggered after collection uncertainty";
    writes_files: false;
    external_calls: false;
  };
  continuation_safety_retry_outcome_non_persistence_note?: {
    label: "Retry outcome non-persistence";
    outcome_scope: "retry attempt and outcome stay outside PromptLane until the next explicit loop snapshot";
    not_stored: "PromptLane does not detect, store, or sync retry success or failure state";
    reason: "keeps retry evidence tied to explicit local snapshot recording";
    writes_files: false;
    external_calls: false;
  };
  continuation_safety_collection_evidence_freshness_boundary_note?: {
    label: "Collection evidence freshness boundary";
    freshness_check: "operator checks freshness against the latest explicit loop snapshot evidence";
    not_verified: "PromptLane does not verify freshness from git status, transcripts, or agent UI activity";
    reason: "keeps evidence freshness review tied to local snapshot metadata";
    writes_files: false;
    external_calls: false;
  };
  continuation_safety_freshness_result_non_persistence_note?: {
    label: "Freshness result non-persistence";
    result_scope: "freshness result stays outside PromptLane until the next explicit loop snapshot";
    not_stored: "PromptLane does not detect, store, or sync freshness result state";
    reason: "keeps freshness evidence tied to explicit local snapshot recording";
    writes_files: false;
    external_calls: false;
  };
  continuation_safety_freshness_uncertainty_collection_reminder?: {
    label: "Freshness uncertainty collection reminder";
    reminder: "collect a new explicit loop snapshot when evidence freshness is uncertain";
    not_automated: "PromptLane does not verify freshness or start collection automatically";
    reason: "keeps freshness uncertainty resolution operator-triggered and local-first";
    writes_files: false;
    external_calls: false;
  };
  continuation_safety_pre_merge_freshness_advisory?: {
    label: "Pre-merge freshness advisory";
    advisory: "review freshness uncertainty before merge decisions";
    not_decision: "PromptLane does not approve merges or verify freshness before merge";
    reason: "keeps merge readiness separate from freshness uncertainty review";
    writes_files: false;
    external_calls: false;
  };
  continuation_safety_pre_memory_approval_freshness_advisory?: {
    label: "Pre-memory-approval freshness advisory";
    advisory: "review freshness uncertainty before approving loop memory";
    not_decision: "PromptLane does not approve memory or verify freshness from this note";
    reason: "keeps memory approval separate from freshness uncertainty review";
    writes_files: false;
    external_calls: false;
  };
  continuation_safety_post_memory_approval_collection_reminder?: {
    label: "Post-memory-approval collection reminder";
    reminder: "collect a new explicit loop snapshot after approving loop memory";
    not_automated: "PromptLane does not start collection from memory approval or approval state changes";
    reason: "keeps post-approval collection operator-triggered and local-first";
    writes_files: false;
    external_calls: false;
  };
  continuation_safety_post_memory_approval_collection_result_non_persistence_note?: {
    label: "Post-memory-approval collection result non-persistence";
    result_scope: "post-approval collection result stays outside PromptLane until the next explicit loop snapshot";
    not_stored: "PromptLane does not detect, store, or sync post-approval collection result state";
    reason: "keeps post-approval collection evidence tied to explicit local snapshot recording";
    writes_files: false;
    external_calls: false;
  };
  continuation_safety_post_memory_approval_collection_retry_boundary_note?: {
    label: "Post-memory-approval collection retry boundary";
    retry: "operator reruns the explicit post-approval loop collection flow when retry is needed";
    not_automated: "PromptLane does not automatically retry post-approval collection commands or hidden recovery actions";
    reason: "keeps post-approval collection retry control local and operator-triggered";
    writes_files: false;
    external_calls: false;
  };
  continuation_safety_post_memory_approval_retry_outcome_non_persistence_note?: {
    label: "Post-memory-approval retry outcome non-persistence";
    outcome_scope: "post-approval retry outcome stays outside PromptLane until the next explicit loop snapshot";
    not_stored: "PromptLane does not detect, store, or sync post-approval retry success or failure state";
    reason: "keeps post-approval retry evidence tied to explicit local snapshot recording";
    writes_files: false;
    external_calls: false;
  };
  continuation_safety_post_memory_approval_retry_evidence_freshness_boundary_note?: {
    label: "Post-memory-approval retry evidence freshness boundary";
    review: "operator checks retry evidence freshness against the latest explicit loop snapshot";
    not_verified: "PromptLane does not verify post-approval retry freshness from git status, transcripts, or agent UI activity";
    reason: "keeps post-approval retry freshness review tied to local snapshot metadata";
    writes_files: false;
    external_calls: false;
  };
  continuation_safety_post_memory_approval_retry_freshness_result_non_persistence_note?: {
    label: "Post-memory-approval retry freshness result non-persistence";
    result_scope: "post-approval retry freshness result stays outside PromptLane until the next explicit loop snapshot";
    not_stored: "PromptLane does not detect, store, or sync post-approval retry freshness result state";
    reason: "keeps post-approval retry freshness evidence tied to explicit local snapshot recording";
    writes_files: false;
    external_calls: false;
  };
  continuation_safety_post_memory_approval_retry_freshness_uncertainty_collection_reminder?: {
    label: "Post-memory-approval retry freshness uncertainty collection reminder";
    reminder: "collect a new explicit loop snapshot when post-approval retry freshness is uncertain";
    not_automated: "PromptLane does not verify post-approval retry freshness or start collection automatically";
    reason: "keeps post-approval retry freshness uncertainty resolution operator-triggered and local-first";
    writes_files: false;
    external_calls: false;
  };
  continuation_safety_post_memory_approval_retry_pre_memory_approval_freshness_advisory?: {
    label: "Post-memory-approval retry pre-memory-approval freshness advisory";
    advisory: "review post-approval retry freshness uncertainty before approving loop memory again";
    not_decision: "PromptLane does not approve memory or verify post-approval retry freshness from this advisory";
    reason: "keeps renewed memory approval separate from retry freshness uncertainty review";
    writes_files: false;
    external_calls: false;
  };
  continuation_safety_post_memory_approval_retry_renewed_memory_approval_collection_reminder?: {
    label: "Post-memory-approval retry renewed-memory-approval collection reminder";
    reminder: "collect a new explicit loop snapshot after approving loop memory again";
    not_automated: "PromptLane does not start collection from renewed memory approval or approval state changes";
    reason: "keeps renewed-memory-approval collection operator-triggered and local-first";
    writes_files: false;
    external_calls: false;
  };
  continuation_safety_post_memory_approval_retry_renewed_memory_approval_collection_result_non_persistence_note?: {
    label: "Post-memory-approval retry renewed-memory-approval collection result non-persistence";
    result_scope: "renewed-memory-approval collection result stays outside PromptLane until the next explicit loop snapshot";
    not_stored: "PromptLane does not detect, store, or sync renewed-memory-approval collection result state";
    reason: "keeps renewed-memory-approval collection evidence tied to explicit local snapshot recording";
    writes_files: false;
    external_calls: false;
  };
  continuation_safety_post_memory_approval_retry_renewed_memory_approval_collection_uncertainty_reminder?: {
    label: "Post-memory-approval retry renewed-memory-approval collection uncertainty reminder";
    reminder: "collect a new explicit loop snapshot when renewed-memory-approval collection result is uncertain";
    not_automated: "PromptLane does not verify renewed-memory-approval collection result or start collection automatically";
    reason: "keeps renewed-memory-approval collection uncertainty resolution operator-triggered and local-first";
    writes_files: false;
    external_calls: false;
  };
  continuation_safety_post_memory_approval_retry_renewed_memory_approval_pre_merge_freshness_advisory?: {
    label: "Post-memory-approval retry renewed-memory-approval pre-merge freshness advisory";
    advisory: "review renewed-memory-approval freshness uncertainty before merge decisions";
    not_decision: "PromptLane does not approve merges or verify renewed-memory-approval freshness before merge";
    reason: "keeps merge readiness separate from renewed-memory-approval freshness uncertainty review";
    writes_files: false;
    external_calls: false;
  };
  continuation_safety_post_memory_approval_retry_renewed_memory_approval_pre_handoff_freshness_advisory?: {
    label: "Post-memory-approval retry renewed-memory-approval pre-handoff freshness advisory";
    advisory: "review renewed-memory-approval freshness uncertainty before continuation handoff";
    not_decision: "PromptLane does not approve handoffs or verify renewed-memory-approval freshness before handoff";
    reason: "keeps continuation handoff separate from renewed-memory-approval freshness uncertainty review";
    writes_files: false;
    external_calls: false;
  };
  continuation_safety_post_memory_approval_retry_renewed_memory_approval_pre_paste_freshness_advisory?: {
    label: "Post-memory-approval retry renewed-memory-approval pre-paste freshness advisory";
    advisory: "review renewed-memory-approval freshness uncertainty before pasting into Codex or Claude Code";
    not_decision: "PromptLane does not approve paste targets or verify renewed-memory-approval freshness before paste";
    reason: "keeps paste readiness separate from renewed-memory-approval freshness uncertainty review";
    writes_files: false;
    external_calls: false;
  };
  continuation_safety_post_memory_approval_retry_renewed_memory_approval_pre_submit_freshness_advisory?: {
    label: "Post-memory-approval retry renewed-memory-approval pre-submit freshness advisory";
    advisory: "review renewed-memory-approval freshness uncertainty before submitting in Codex or Claude Code";
    not_decision: "PromptLane does not approve submissions or verify renewed-memory-approval freshness before submit";
    reason: "keeps submission readiness separate from renewed-memory-approval freshness uncertainty review";
    writes_files: false;
    external_calls: false;
  };
  continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_freshness_advisory?: {
    label: "Post-memory-approval retry renewed-memory-approval post-submit freshness advisory";
    advisory: "collect a new explicit loop snapshot after submission when renewed-memory-approval freshness is uncertain";
    not_automated: "PromptLane does not monitor submitted state, agent responses, or renewed-memory-approval freshness after submit";
    reason: "keeps post-submit freshness review tied to explicit local snapshot collection";
    writes_files: false;
    external_calls: false;
  };
  continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_collection_result_non_persistence_note?: {
    label: "Post-memory-approval retry renewed-memory-approval post-submit collection result non-persistence";
    result_scope: "post-submit collection result stays outside PromptLane until the next explicit loop snapshot";
    not_stored: "PromptLane does not detect, store, or sync post-submit collection result state";
    reason: "keeps post-submit collection evidence tied to explicit local snapshot recording";
    writes_files: false;
    external_calls: false;
  };
  continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_collection_retry_boundary_note?: {
    label: "Post-memory-approval retry renewed-memory-approval post-submit collection retry boundary";
    retry: "operator reruns the explicit post-submit loop collection flow when retry is needed";
    not_automated: "PromptLane does not automatically retry post-submit collection commands or hidden recovery actions";
    reason: "keeps post-submit collection retry control local and operator-triggered";
    writes_files: false;
    external_calls: false;
  };
  continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_outcome_non_persistence_note?: {
    label: "Post-memory-approval retry renewed-memory-approval post-submit retry outcome non-persistence";
    outcome_scope: "post-submit retry attempt and outcome stay outside PromptLane until the next explicit loop snapshot";
    not_stored: "PromptLane does not detect, store, or sync post-submit retry success or failure state";
    reason: "keeps post-submit retry evidence tied to explicit local snapshot recording";
    writes_files: false;
    external_calls: false;
  };
  continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_evidence_freshness_boundary_note?: {
    label: "Post-memory-approval retry renewed-memory-approval post-submit retry evidence freshness boundary";
    freshness_scope: "operator checks post-submit retry evidence freshness against the latest explicit loop snapshot";
    not_verified: "PromptLane does not verify post-submit retry evidence freshness from git status, transcripts, or agent UI activity";
    reason: "keeps post-submit retry evidence freshness review tied to local snapshot metadata";
    writes_files: false;
    external_calls: false;
  };
  continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_freshness_result_non_persistence_note?: {
    label: "Post-memory-approval retry renewed-memory-approval post-submit retry freshness result non-persistence";
    result_scope: "post-submit retry freshness result stays outside PromptLane until the next explicit loop snapshot";
    not_stored: "PromptLane does not detect, store, or sync post-submit retry freshness result state";
    reason: "keeps post-submit retry freshness evidence tied to explicit local snapshot recording";
    writes_files: false;
    external_calls: false;
  };
  continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_freshness_uncertainty_collection_reminder?: {
    label: "Post-memory-approval retry renewed-memory-approval post-submit retry freshness uncertainty collection reminder";
    collection_trigger: "collect a new explicit loop snapshot when post-submit retry freshness is uncertain";
    not_automated: "PromptLane does not verify post-submit retry freshness or start collection automatically";
    reason: "keeps post-submit retry freshness uncertainty resolution operator-triggered and local-first";
    writes_files: false;
    external_calls: false;
  };
  continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_pre_memory_approval_freshness_advisory?: {
    label: "Post-memory-approval retry renewed-memory-approval post-submit retry pre-memory-approval freshness advisory";
    advisory: "review post-submit retry freshness uncertainty before approving loop memory again";
    not_decision: "PromptLane does not approve memory or verify post-submit retry freshness from this advisory";
    reason: "keeps renewed memory approval separate from post-submit retry freshness uncertainty review";
    writes_files: false;
    external_calls: false;
  };
  continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_collection_reminder?: {
    label: "Post-memory-approval retry renewed-memory-approval post-submit retry renewed-memory-approval collection reminder";
    reminder: "collect a new explicit loop snapshot after approving loop memory again after post-submit retry";
    not_automated: "PromptLane does not start collection from post-submit retry renewed memory approval or hidden approval signals";
    reason: "keeps post-submit retry renewed-memory-approval collection operator-triggered and local-first";
    writes_files: false;
    external_calls: false;
  };
  continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_collection_result_non_persistence_note?: {
    label: "Post-memory-approval retry renewed-memory-approval post-submit retry renewed-memory-approval collection result non-persistence";
    result_scope: "post-submit retry renewed-memory-approval collection result stays outside PromptLane until the next explicit loop snapshot";
    not_stored: "PromptLane does not detect, store, or sync post-submit retry renewed-memory-approval collection result state";
    reason: "keeps post-submit retry renewed-memory-approval collection evidence tied to explicit local snapshot recording";
    writes_files: false;
    external_calls: false;
  };
  continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_collection_uncertainty_reminder?: {
    label: "Post-memory-approval retry renewed-memory-approval post-submit retry renewed-memory-approval collection uncertainty reminder";
    reminder: "collect a new explicit loop snapshot when post-submit retry renewed-memory-approval collection result is uncertain";
    not_automated: "PromptLane does not verify post-submit retry renewed-memory-approval collection result or start collection automatically";
    reason: "keeps post-submit retry renewed-memory-approval collection uncertainty resolution operator-triggered and local-first";
    writes_files: false;
    external_calls: false;
  };
  continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_pre_merge_freshness_advisory?: {
    label: "Post-memory-approval retry renewed-memory-approval post-submit retry renewed-memory-approval pre-merge freshness advisory";
    advisory: "review post-submit retry renewed-memory-approval freshness uncertainty before merge decisions";
    not_decision: "PromptLane does not approve merges or verify post-submit retry renewed-memory-approval freshness before merge";
    reason: "keeps merge readiness separate from post-submit retry renewed-memory-approval freshness uncertainty review";
    writes_files: false;
    external_calls: false;
  };
  continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_pre_handoff_freshness_advisory?: {
    label: "Post-memory-approval retry renewed-memory-approval post-submit retry renewed-memory-approval pre-handoff freshness advisory";
    advisory: "review post-submit retry renewed-memory-approval freshness uncertainty before continuation handoff";
    not_decision: "PromptLane does not approve handoffs or verify post-submit retry renewed-memory-approval freshness before handoff";
    reason: "keeps continuation handoff separate from post-submit retry renewed-memory-approval freshness uncertainty review";
    writes_files: false;
    external_calls: false;
  };
  continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_pre_paste_freshness_advisory?: {
    label: "Post-memory-approval retry renewed-memory-approval post-submit retry renewed-memory-approval pre-paste freshness advisory";
    advisory: "review post-submit retry renewed-memory-approval freshness uncertainty before pasting into Codex or Claude Code";
    not_decision: "PromptLane does not approve paste targets or verify post-submit retry renewed-memory-approval freshness before paste";
    reason: "keeps paste readiness separate from post-submit retry renewed-memory-approval freshness uncertainty review";
    writes_files: false;
    external_calls: false;
  };
  continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_pre_submit_freshness_advisory?: {
    label: "Post-memory-approval retry renewed-memory-approval post-submit retry renewed-memory-approval pre-submit freshness advisory";
    advisory: "review post-submit retry renewed-memory-approval freshness uncertainty before submitting in Codex or Claude Code";
    not_decision: "PromptLane does not approve submissions or verify post-submit retry renewed-memory-approval freshness before submit";
    reason: "keeps submission readiness separate from post-submit retry renewed-memory-approval freshness uncertainty review";
    writes_files: false;
    external_calls: false;
  };
  continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_freshness_advisory?: {
    label: "Post-memory-approval retry renewed-memory-approval post-submit retry renewed-memory-approval post-submit freshness advisory";
    advisory: "collect a new explicit loop snapshot after submission when post-submit retry renewed-memory-approval freshness is uncertain";
    not_automated: "PromptLane does not monitor submitted state, agent responses, or post-submit retry renewed-memory-approval freshness after submit";
    reason: "keeps post-submit retry renewed-memory-approval freshness review tied to explicit local snapshot collection";
    writes_files: false;
    external_calls: false;
  };
  continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_result_non_persistence_note?: {
    label: "Post-memory-approval retry renewed-memory-approval post-submit retry renewed-memory-approval post-submit collection result non-persistence";
    result_scope: "post-submit retry renewed-memory-approval post-submit collection result stays outside PromptLane until the next explicit loop snapshot";
    not_stored: "PromptLane does not detect, store, or sync post-submit retry renewed-memory-approval post-submit collection result state";
    reason: "keeps post-submit retry renewed-memory-approval post-submit collection evidence tied to explicit local snapshot recording";
    writes_files: false;
    external_calls: false;
  };
  continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_uncertainty_reminder?: {
    label: "Post-memory-approval retry renewed-memory-approval post-submit retry renewed-memory-approval post-submit collection uncertainty reminder";
    reminder: "collect a new explicit loop snapshot when post-submit retry renewed-memory-approval post-submit collection result is uncertain";
    not_automated: "PromptLane does not verify post-submit retry renewed-memory-approval post-submit collection result or start collection automatically";
    reason: "keeps post-submit retry renewed-memory-approval post-submit collection uncertainty resolution operator-triggered and local-first";
    writes_files: false;
    external_calls: false;
  };
  continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_pre_merge_freshness_advisory?: {
    label: "Post-memory-approval retry renewed-memory-approval post-submit retry renewed-memory-approval post-submit collection pre-merge freshness advisory";
    advisory: "review post-submit retry renewed-memory-approval post-submit collection freshness uncertainty before merge decisions";
    not_decision: "PromptLane does not approve merges or verify post-submit retry renewed-memory-approval post-submit collection freshness before merge";
    reason: "keeps merge readiness separate from post-submit retry renewed-memory-approval post-submit collection freshness uncertainty review";
    writes_files: false;
    external_calls: false;
  };
  continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_pre_handoff_freshness_advisory?: {
    label: "Post-memory-approval retry renewed-memory-approval post-submit retry renewed-memory-approval post-submit collection pre-handoff freshness advisory";
    advisory: "review post-submit retry renewed-memory-approval post-submit collection freshness uncertainty before continuation handoff";
    not_decision: "PromptLane does not approve handoffs or verify post-submit retry renewed-memory-approval post-submit collection freshness before handoff";
    reason: "keeps continuation handoff separate from post-submit retry renewed-memory-approval post-submit collection freshness uncertainty review";
    writes_files: false;
    external_calls: false;
  };
  continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_pre_paste_freshness_advisory?: {
    label: "Post-memory-approval retry renewed-memory-approval post-submit retry renewed-memory-approval post-submit collection pre-paste freshness advisory";
    advisory: "review post-submit retry renewed-memory-approval post-submit collection freshness uncertainty before pasting into Codex or Claude Code";
    not_decision: "PromptLane does not approve paste targets or verify post-submit retry renewed-memory-approval post-submit collection freshness before paste";
    reason: "keeps paste readiness separate from post-submit retry renewed-memory-approval post-submit collection freshness uncertainty review";
    writes_files: false;
    external_calls: false;
  };
  continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_pre_submit_freshness_advisory?: {
    label: "Post-memory-approval retry renewed-memory-approval post-submit retry renewed-memory-approval post-submit collection pre-submit freshness advisory";
    advisory: "review post-submit retry renewed-memory-approval post-submit collection freshness uncertainty before submitting in Codex or Claude Code";
    not_decision: "PromptLane does not approve submissions or verify post-submit retry renewed-memory-approval post-submit collection freshness before submit";
    reason: "keeps submission readiness separate from post-submit retry renewed-memory-approval post-submit collection freshness uncertainty review";
    writes_files: false;
    external_calls: false;
  };
  continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_post_submit_freshness_advisory?: {
    label: "Post-memory-approval retry renewed-memory-approval post-submit retry renewed-memory-approval post-submit collection post-submit freshness advisory";
    advisory: "collect a new explicit loop snapshot after submission when post-submit retry renewed-memory-approval post-submit collection freshness is uncertain";
    not_monitored: "PromptLane does not monitor submitted state, agent responses, or post-submit retry renewed-memory-approval post-submit collection freshness after submit";
    reason: "keeps post-submit retry renewed-memory-approval post-submit collection freshness review tied to explicit local snapshot collection";
    writes_files: false;
    external_calls: false;
  };
  continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_freshness_result_non_persistence_note?: {
    label: "Post-memory-approval retry renewed-memory-approval post-submit retry renewed-memory-approval post-submit collection freshness result non-persistence";
    not_stored: "post-submit retry renewed-memory-approval post-submit collection freshness result stays outside PromptLane until the next explicit loop snapshot";
    not_detected: "PromptLane does not detect, store, or sync post-submit retry renewed-memory-approval post-submit collection freshness result state";
    reason: "keeps post-submit retry renewed-memory-approval post-submit collection freshness evidence tied to explicit local snapshot recording";
    writes_files: false;
    external_calls: false;
  };
  continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_freshness_uncertainty_collection_reminder?: {
    label: "Post-memory-approval retry renewed-memory-approval post-submit retry renewed-memory-approval post-submit collection freshness uncertainty collection reminder";
    reminder: "collect a new explicit loop snapshot when post-submit retry renewed-memory-approval post-submit collection freshness is uncertain";
    not_automated: "PromptLane does not verify post-submit retry renewed-memory-approval post-submit collection freshness or start collection automatically";
    reason: "keeps post-submit retry renewed-memory-approval post-submit collection freshness uncertainty resolution operator-triggered and local-first";
    writes_files: false;
    external_calls: false;
  };
  paste_destination?: {
    label: "Paste destination";
    targets: ["Codex active request", "Claude Code active request"];
    instruction: "paste the copied continuation brief into the active agent request box";
    reason: "keeps PromptLane as the local handoff source while the user controls submission";
    auto_submit: false;
    writes_files: false;
    external_calls: false;
  };
  handoff_checklist?: {
    label: "Continuation handoff checklist";
    steps: [
      "copy selected continuation brief",
      "paste into Codex or Claude Code active request",
      "submit manually after review",
      "collect the next loop snapshot after the agent turn",
    ];
    reason: "keeps continuation handoff explicit without automating agent UI or reading transcripts";
    writes_files: false;
    external_calls: false;
  };
  post_handoff_reminder?: {
    label: "Post-handoff reminder";
    collect_next: "collect a new loop snapshot after the next agent turn";
    not_memory_approval: "memory approval remains a separate explicit review";
    not_merge: "merge remains a separate review-before-merge decision";
    reason: "continuation handoff records the next loop before any memory approval or merge decision";
    writes_files: false;
    external_calls: false;
  };
  source_of_truth_note?: {
    label: "Source-of-truth note";
    local_memory_input: "next loop snapshot is the source of truth for local loop memory";
    not_transcript_import: "transcript import is not used as the source of truth";
    reason: "PromptLane records explicit loop snapshots instead of importing agent transcripts";
    stores_transcripts: false;
    writes_files: false;
    external_calls: false;
  };
  privacy_boundary_note?: {
    label: "Privacy boundary";
    storage_scope: "stores loop metadata in the local database and Markdown archive only";
    does_not_store: "does not store prompt bodies, transcripts, raw paths, or provider credentials";
    reason: "keeps source-of-truth loop memory local-first and reviewable";
    local_only: true;
    writes_files: false;
    external_calls: false;
  };
  operator_review_gate?: {
    label: "Operator review gate";
    review_step: "operator reviews the copied continuation brief before submitting";
    manual_submit: "submission remains manual in Codex or Claude Code";
    does_not: "does not auto-submit prompts, execute commands, write files, or change merge state";
    auto_submit: false;
    writes_files: false;
    external_calls: false;
  };
  collection_responsibility_note?: {
    label: "Collection responsibility";
    responsible_party: "operator collects the next loop snapshot after the agent turn";
    trigger: "collection starts only when the operator runs the loop collection flow";
    does_not: "does not watch transcripts, scrape agent UI, or collect in the background";
    automatic_collection: false;
    writes_files: false;
    external_calls: false;
  };
  pre_merge_advisory?: {
    label: "Pre-merge advisory";
    hold_merge: "hold merge decisions until the next loop snapshot is collected and reviewed";
    reason: "continuation handoff can change readiness after the next agent turn";
    not_memory_approval: "memory approval remains separate from merge readiness";
    writes_merge_decision: false;
    writes_files: false;
    external_calls: false;
  };
  post_collection_review_note?: {
    label: "Post-collection review";
    review_step: "review the collected loop snapshot quality and evidence before approval";
    before_memory_approval: "approve memory only after the collected snapshot is reviewed";
    before_merge: "merge readiness can be reconsidered after post-collection review";
    writes_memory: false;
    writes_merge_decision: false;
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
  items: LoopSummary[];
  privacy: {
    local_only: true;
    returns_prompt_bodies: false;
    returns_raw_paths: false;
    returns_compact_content: false;
  };
};

export type LoopBrief = {
  title: string;
  prompt: string;
  source_snapshot_id: string;
  compact_boundary?: LoopSummary["compact_boundary"];
  privacy: {
    local_only: true;
    returns_prompt_bodies: false;
    returns_raw_paths: false;
  };
};

function parseLoopBriefResponse(
  body: {
    data?: {
      title?: unknown;
      prompt?: unknown;
      source_snapshot_id?: unknown;
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
      policy?: {
        capture_disabled?: unknown;
        analysis_disabled?: unknown;
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
    typeof body.data.policy.external_analysis_opt_in !== "boolean" ||
    typeof body.data.policy.export_disabled !== "boolean" ||
    typeof body.data.policy.version !== "number" ||
    body.data.markdown !== undefined ||
    body.data.prompt_body !== undefined ||
    body.data.raw_path !== undefined
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
    data?: { status?: unknown; items?: unknown; privacy?: unknown };
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
  const response = await fetch(
    `/api/v1/loops/${encodeURIComponent(id)}/brief`,
    {
      credentials: "same-origin",
    },
  );

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
  const params = new URLSearchParams({ worktree: options.worktree });
  if (options.sessionId) params.set("session_id", options.sessionId);
  if (options.branch) params.set("branch", options.branch);
  const response = await fetch(`/api/v1/loops/brief?${params}`, {
    credentials: "same-origin",
  });

  if (!response.ok) {
    await failApi(response, "Selected loop brief failed");
  }

  const body = (await response.json()) as Parameters<
    typeof parseLoopBriefResponse
  >[0];
  return parseLoopBriefResponse(body, "Selected loop brief failed");
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
      selection_scope?: unknown;
      snapshot_age?: unknown;
      selected_brief_action?: unknown;
      command_distinction?: unknown;
      command_filters?: unknown;
      copy_side_effects?: unknown;
      continuation_safety_group?: unknown;
      continuation_safety_ordering_note?: unknown;
      continuation_safety_non_persistence_note?: unknown;
      continuation_safety_recheck_cue?: unknown;
      continuation_safety_copy_feedback_reminder?: unknown;
      continuation_safety_copy_feedback_accessibility_note?: unknown;
      continuation_safety_copy_feedback_timeout_note?: unknown;
      continuation_safety_copy_feedback_failure_note?: unknown;
      continuation_safety_copy_retry_note?: unknown;
      continuation_safety_pre_paste_confirmation_note?: unknown;
      continuation_safety_target_agent_check_note?: unknown;
      continuation_safety_paste_destination_boundary_note?: unknown;
      continuation_safety_manual_submission_boundary_note?: unknown;
      continuation_safety_submission_result_non_persistence_note?: unknown;
      continuation_safety_post_submission_collection_reminder_note?: unknown;
      continuation_safety_collection_result_non_persistence_note?: unknown;
      continuation_safety_collection_retry_boundary_note?: unknown;
      continuation_safety_retry_outcome_non_persistence_note?: unknown;
      continuation_safety_collection_evidence_freshness_boundary_note?: unknown;
      continuation_safety_freshness_result_non_persistence_note?: unknown;
      continuation_safety_freshness_uncertainty_collection_reminder?: unknown;
      continuation_safety_pre_merge_freshness_advisory?: unknown;
      continuation_safety_pre_memory_approval_freshness_advisory?: unknown;
      continuation_safety_post_memory_approval_collection_reminder?: unknown;
      continuation_safety_post_memory_approval_collection_result_non_persistence_note?: unknown;
      continuation_safety_post_memory_approval_collection_retry_boundary_note?: unknown;
      continuation_safety_post_memory_approval_retry_outcome_non_persistence_note?: unknown;
      continuation_safety_post_memory_approval_retry_evidence_freshness_boundary_note?: unknown;
      continuation_safety_post_memory_approval_retry_freshness_result_non_persistence_note?: unknown;
      continuation_safety_post_memory_approval_retry_freshness_uncertainty_collection_reminder?: unknown;
      continuation_safety_post_memory_approval_retry_pre_memory_approval_freshness_advisory?: unknown;
      continuation_safety_post_memory_approval_retry_renewed_memory_approval_collection_reminder?: unknown;
      continuation_safety_post_memory_approval_retry_renewed_memory_approval_collection_result_non_persistence_note?: unknown;
      continuation_safety_post_memory_approval_retry_renewed_memory_approval_collection_uncertainty_reminder?: unknown;
      continuation_safety_post_memory_approval_retry_renewed_memory_approval_pre_merge_freshness_advisory?: unknown;
      continuation_safety_post_memory_approval_retry_renewed_memory_approval_pre_handoff_freshness_advisory?: unknown;
      continuation_safety_post_memory_approval_retry_renewed_memory_approval_pre_paste_freshness_advisory?: unknown;
      continuation_safety_post_memory_approval_retry_renewed_memory_approval_pre_submit_freshness_advisory?: unknown;
      continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_freshness_advisory?: unknown;
      continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_collection_result_non_persistence_note?: unknown;
      continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_collection_retry_boundary_note?: unknown;
      continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_outcome_non_persistence_note?: unknown;
      continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_evidence_freshness_boundary_note?: unknown;
      continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_freshness_result_non_persistence_note?: unknown;
      continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_freshness_uncertainty_collection_reminder?: unknown;
      continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_pre_memory_approval_freshness_advisory?: unknown;
      continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_collection_reminder?: unknown;
      continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_collection_result_non_persistence_note?: unknown;
      continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_collection_uncertainty_reminder?: unknown;
      continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_pre_merge_freshness_advisory?: unknown;
      continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_pre_handoff_freshness_advisory?: unknown;
      continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_pre_paste_freshness_advisory?: unknown;
      continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_pre_submit_freshness_advisory?: unknown;
      continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_freshness_advisory?: unknown;
      continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_result_non_persistence_note?: unknown;
      continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_uncertainty_reminder?: unknown;
      continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_pre_merge_freshness_advisory?: unknown;
      continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_pre_handoff_freshness_advisory?: unknown;
      continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_pre_paste_freshness_advisory?: unknown;
      continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_pre_submit_freshness_advisory?: unknown;
      continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_post_submit_freshness_advisory?: unknown;
      continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_freshness_result_non_persistence_note?: unknown;
      continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_freshness_uncertainty_collection_reminder?: unknown;
      items?: unknown;
      privacy?: unknown;
    };
  };
  if (
    typeof body.data?.worktree !== "string" ||
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
    (body.data.continuation_safety_group !== undefined &&
      !isContinuationSafetyGroup(body.data.continuation_safety_group)) ||
    (body.data.continuation_safety_ordering_note !== undefined &&
      !isContinuationSafetyOrderingNote(
        body.data.continuation_safety_ordering_note,
      )) ||
    (body.data.continuation_safety_non_persistence_note !== undefined &&
      !isContinuationSafetyNonPersistenceNote(
        body.data.continuation_safety_non_persistence_note,
      )) ||
    (body.data.continuation_safety_recheck_cue !== undefined &&
      !isContinuationSafetyRecheckCue(
        body.data.continuation_safety_recheck_cue,
      )) ||
    (body.data.continuation_safety_copy_feedback_reminder !== undefined &&
      !isContinuationSafetyCopyFeedbackReminder(
        body.data.continuation_safety_copy_feedback_reminder,
      )) ||
    (body.data.continuation_safety_copy_feedback_accessibility_note !==
      undefined &&
      !isContinuationSafetyCopyFeedbackAccessibilityNote(
        body.data.continuation_safety_copy_feedback_accessibility_note,
      )) ||
    (body.data.continuation_safety_copy_feedback_timeout_note !== undefined &&
      !isContinuationSafetyCopyFeedbackTimeoutNote(
        body.data.continuation_safety_copy_feedback_timeout_note,
      )) ||
    (body.data.continuation_safety_copy_feedback_failure_note !== undefined &&
      !isContinuationSafetyCopyFeedbackFailureNote(
        body.data.continuation_safety_copy_feedback_failure_note,
      )) ||
    (body.data.continuation_safety_copy_retry_note !== undefined &&
      !isContinuationSafetyCopyRetryNote(
        body.data.continuation_safety_copy_retry_note,
      )) ||
    (body.data.continuation_safety_pre_paste_confirmation_note !== undefined &&
      !isContinuationSafetyPrePasteConfirmationNote(
        body.data.continuation_safety_pre_paste_confirmation_note,
      )) ||
    (body.data.continuation_safety_target_agent_check_note !== undefined &&
      !isContinuationSafetyTargetAgentCheckNote(
        body.data.continuation_safety_target_agent_check_note,
      )) ||
    (body.data.continuation_safety_paste_destination_boundary_note !==
      undefined &&
      !isContinuationSafetyPasteDestinationBoundaryNote(
        body.data.continuation_safety_paste_destination_boundary_note,
      )) ||
    (body.data.continuation_safety_manual_submission_boundary_note !==
      undefined &&
      !isContinuationSafetyManualSubmissionBoundaryNote(
        body.data.continuation_safety_manual_submission_boundary_note,
      )) ||
    (body.data.continuation_safety_submission_result_non_persistence_note !==
      undefined &&
      !isContinuationSafetySubmissionResultNonPersistenceNote(
        body.data.continuation_safety_submission_result_non_persistence_note,
      )) ||
    (body.data.continuation_safety_post_submission_collection_reminder_note !==
      undefined &&
      !isContinuationSafetyPostSubmissionCollectionReminderNote(
        body.data.continuation_safety_post_submission_collection_reminder_note,
      )) ||
    (body.data.continuation_safety_collection_result_non_persistence_note !==
      undefined &&
      !isContinuationSafetyCollectionResultNonPersistenceNote(
        body.data.continuation_safety_collection_result_non_persistence_note,
      )) ||
    (body.data.continuation_safety_collection_retry_boundary_note !==
      undefined &&
      !isContinuationSafetyCollectionRetryBoundaryNote(
        body.data.continuation_safety_collection_retry_boundary_note,
      )) ||
    (body.data.continuation_safety_retry_outcome_non_persistence_note !==
      undefined &&
      !isContinuationSafetyRetryOutcomeNonPersistenceNote(
        body.data.continuation_safety_retry_outcome_non_persistence_note,
      )) ||
    (body.data
      .continuation_safety_collection_evidence_freshness_boundary_note !==
      undefined &&
      !isContinuationSafetyCollectionEvidenceFreshnessBoundaryNote(
        body.data
          .continuation_safety_collection_evidence_freshness_boundary_note,
      )) ||
    (body.data.continuation_safety_freshness_result_non_persistence_note !==
      undefined &&
      !isContinuationSafetyFreshnessResultNonPersistenceNote(
        body.data.continuation_safety_freshness_result_non_persistence_note,
      )) ||
    (body.data.continuation_safety_freshness_uncertainty_collection_reminder !==
      undefined &&
      !isContinuationSafetyFreshnessUncertaintyCollectionReminder(
        body.data.continuation_safety_freshness_uncertainty_collection_reminder,
      )) ||
    (body.data.continuation_safety_pre_merge_freshness_advisory !== undefined &&
      !isContinuationSafetyPreMergeFreshnessAdvisory(
        body.data.continuation_safety_pre_merge_freshness_advisory,
      )) ||
    (body.data.continuation_safety_pre_memory_approval_freshness_advisory !==
      undefined &&
      !isContinuationSafetyPreMemoryApprovalFreshnessAdvisory(
        body.data.continuation_safety_pre_memory_approval_freshness_advisory,
      )) ||
    (body.data.continuation_safety_post_memory_approval_collection_reminder !==
      undefined &&
      !isContinuationSafetyPostMemoryApprovalCollectionReminder(
        body.data.continuation_safety_post_memory_approval_collection_reminder,
      )) ||
    (body.data
      .continuation_safety_post_memory_approval_collection_result_non_persistence_note !==
      undefined &&
      !isContinuationSafetyPostMemoryApprovalCollectionResultNonPersistenceNote(
        body.data
          .continuation_safety_post_memory_approval_collection_result_non_persistence_note,
      )) ||
    (body.data
      .continuation_safety_post_memory_approval_collection_retry_boundary_note !==
      undefined &&
      !isContinuationSafetyPostMemoryApprovalCollectionRetryBoundaryNote(
        body.data
          .continuation_safety_post_memory_approval_collection_retry_boundary_note,
      )) ||
    (body.data
      .continuation_safety_post_memory_approval_retry_outcome_non_persistence_note !==
      undefined &&
      !isContinuationSafetyPostMemoryApprovalRetryOutcomeNonPersistenceNote(
        body.data
          .continuation_safety_post_memory_approval_retry_outcome_non_persistence_note,
      )) ||
    (body.data
      .continuation_safety_post_memory_approval_retry_evidence_freshness_boundary_note !==
      undefined &&
      !isContinuationSafetyPostMemoryApprovalRetryEvidenceFreshnessBoundaryNote(
        body.data
          .continuation_safety_post_memory_approval_retry_evidence_freshness_boundary_note,
      )) ||
    (body.data
      .continuation_safety_post_memory_approval_retry_freshness_result_non_persistence_note !==
      undefined &&
      !isContinuationSafetyPostMemoryApprovalRetryFreshnessResultNonPersistenceNote(
        body.data
          .continuation_safety_post_memory_approval_retry_freshness_result_non_persistence_note,
      )) ||
    (body.data
      .continuation_safety_post_memory_approval_retry_freshness_uncertainty_collection_reminder !==
      undefined &&
      !isContinuationSafetyPostMemoryApprovalRetryFreshnessUncertaintyCollectionReminder(
        body.data
          .continuation_safety_post_memory_approval_retry_freshness_uncertainty_collection_reminder,
      )) ||
    (body.data
      .continuation_safety_post_memory_approval_retry_pre_memory_approval_freshness_advisory !==
      undefined &&
      !isContinuationSafetyPostMemoryApprovalRetryPreMemoryApprovalFreshnessAdvisory(
        body.data
          .continuation_safety_post_memory_approval_retry_pre_memory_approval_freshness_advisory,
      )) ||
    (body.data
      .continuation_safety_post_memory_approval_retry_renewed_memory_approval_collection_reminder !==
      undefined &&
      !isContinuationSafetyPostMemoryApprovalRetryRenewedMemoryApprovalCollectionReminder(
        body.data
          .continuation_safety_post_memory_approval_retry_renewed_memory_approval_collection_reminder,
      )) ||
    (body.data
      .continuation_safety_post_memory_approval_retry_renewed_memory_approval_collection_result_non_persistence_note !==
      undefined &&
      !isContinuationSafetyPostMemoryApprovalRetryRenewedMemoryApprovalCollectionResultNonPersistenceNote(
        body.data
          .continuation_safety_post_memory_approval_retry_renewed_memory_approval_collection_result_non_persistence_note,
      )) ||
    (body.data
      .continuation_safety_post_memory_approval_retry_renewed_memory_approval_collection_uncertainty_reminder !==
      undefined &&
      !isContinuationSafetyPostMemoryApprovalRetryRenewedMemoryApprovalCollectionUncertaintyReminder(
        body.data
          .continuation_safety_post_memory_approval_retry_renewed_memory_approval_collection_uncertainty_reminder,
      )) ||
    (body.data
      .continuation_safety_post_memory_approval_retry_renewed_memory_approval_pre_merge_freshness_advisory !==
      undefined &&
      !isContinuationSafetyPostMemoryApprovalRetryRenewedMemoryApprovalPreMergeFreshnessAdvisory(
        body.data
          .continuation_safety_post_memory_approval_retry_renewed_memory_approval_pre_merge_freshness_advisory,
      )) ||
    (body.data
      .continuation_safety_post_memory_approval_retry_renewed_memory_approval_pre_handoff_freshness_advisory !==
      undefined &&
      !isContinuationSafetyPostMemoryApprovalRetryRenewedMemoryApprovalPreHandoffFreshnessAdvisory(
        body.data
          .continuation_safety_post_memory_approval_retry_renewed_memory_approval_pre_handoff_freshness_advisory,
      )) ||
    (body.data
      .continuation_safety_post_memory_approval_retry_renewed_memory_approval_pre_paste_freshness_advisory !==
      undefined &&
      !isContinuationSafetyPostMemoryApprovalRetryRenewedMemoryApprovalPrePasteFreshnessAdvisory(
        body.data
          .continuation_safety_post_memory_approval_retry_renewed_memory_approval_pre_paste_freshness_advisory,
      )) ||
    (body.data
      .continuation_safety_post_memory_approval_retry_renewed_memory_approval_pre_submit_freshness_advisory !==
      undefined &&
      !isContinuationSafetyPostMemoryApprovalRetryRenewedMemoryApprovalPreSubmitFreshnessAdvisory(
        body.data
          .continuation_safety_post_memory_approval_retry_renewed_memory_approval_pre_submit_freshness_advisory,
      )) ||
    (body.data
      .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_freshness_advisory !==
      undefined &&
      !isContinuationSafetyPostMemoryApprovalRetryRenewedMemoryApprovalPostSubmitFreshnessAdvisory(
        body.data
          .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_freshness_advisory,
      )) ||
    (body.data
      .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_collection_result_non_persistence_note !==
      undefined &&
      !isContinuationSafetyPostMemoryApprovalRetryRenewedMemoryApprovalPostSubmitCollectionResultNonPersistenceNote(
        body.data
          .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_collection_result_non_persistence_note,
      )) ||
    (body.data
      .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_collection_retry_boundary_note !==
      undefined &&
      !isContinuationSafetyPostMemoryApprovalRetryRenewedMemoryApprovalPostSubmitCollectionRetryBoundaryNote(
        body.data
          .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_collection_retry_boundary_note,
      )) ||
    (body.data
      .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_outcome_non_persistence_note !==
      undefined &&
      !isContinuationSafetyPostMemoryApprovalRetryRenewedMemoryApprovalPostSubmitRetryOutcomeNonPersistenceNote(
        body.data
          .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_outcome_non_persistence_note,
      )) ||
    (body.data
      .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_evidence_freshness_boundary_note !==
      undefined &&
      !isContinuationSafetyPostMemoryApprovalRetryRenewedMemoryApprovalPostSubmitRetryEvidenceFreshnessBoundaryNote(
        body.data
          .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_evidence_freshness_boundary_note,
      )) ||
    (body.data
      .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_freshness_result_non_persistence_note !==
      undefined &&
      !isContinuationSafetyPostMemoryApprovalRetryRenewedMemoryApprovalPostSubmitRetryFreshnessResultNonPersistenceNote(
        body.data
          .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_freshness_result_non_persistence_note,
      )) ||
    (body.data
      .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_freshness_uncertainty_collection_reminder !==
      undefined &&
      !isContinuationSafetyPostMemoryApprovalRetryRenewedMemoryApprovalPostSubmitRetryFreshnessUncertaintyCollectionReminder(
        body.data
          .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_freshness_uncertainty_collection_reminder,
      )) ||
    (body.data
      .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_pre_memory_approval_freshness_advisory !==
      undefined &&
      !isContinuationSafetyPostMemoryApprovalRetryRenewedMemoryApprovalPostSubmitRetryPreMemoryApprovalFreshnessAdvisory(
        body.data
          .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_pre_memory_approval_freshness_advisory,
      )) ||
    (body.data
      .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_collection_reminder !==
      undefined &&
      !isContinuationSafetyPostMemoryApprovalRetryRenewedMemoryApprovalPostSubmitRetryRenewedMemoryApprovalCollectionReminder(
        body.data
          .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_collection_reminder,
      )) ||
    (body.data
      .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_collection_result_non_persistence_note !==
      undefined &&
      !isContinuationSafetyPostMemoryApprovalRetryRenewedMemoryApprovalPostSubmitRetryRenewedMemoryApprovalCollectionResultNonPersistenceNote(
        body.data
          .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_collection_result_non_persistence_note,
      )) ||
    (body.data
      .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_collection_uncertainty_reminder !==
      undefined &&
      !isContinuationSafetyPostMemoryApprovalRetryRenewedMemoryApprovalPostSubmitRetryRenewedMemoryApprovalCollectionUncertaintyReminder(
        body.data
          .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_collection_uncertainty_reminder,
      )) ||
    (body.data
      .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_pre_merge_freshness_advisory !==
      undefined &&
      !isContinuationSafetyPostMemoryApprovalRetryRenewedMemoryApprovalPostSubmitRetryRenewedMemoryApprovalPreMergeFreshnessAdvisory(
        body.data
          .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_pre_merge_freshness_advisory,
      )) ||
    (body.data
      .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_pre_handoff_freshness_advisory !==
      undefined &&
      !isContinuationSafetyPostMemoryApprovalRetryRenewedMemoryApprovalPostSubmitRetryRenewedMemoryApprovalPreHandoffFreshnessAdvisory(
        body.data
          .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_pre_handoff_freshness_advisory,
      )) ||
    (body.data
      .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_pre_paste_freshness_advisory !==
      undefined &&
      !isContinuationSafetyPostMemoryApprovalRetryRenewedMemoryApprovalPostSubmitRetryRenewedMemoryApprovalPrePasteFreshnessAdvisory(
        body.data
          .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_pre_paste_freshness_advisory,
      )) ||
    (body.data
      .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_pre_submit_freshness_advisory !==
      undefined &&
      !isContinuationSafetyPostMemoryApprovalRetryRenewedMemoryApprovalPostSubmitRetryRenewedMemoryApprovalPreSubmitFreshnessAdvisory(
        body.data
          .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_pre_submit_freshness_advisory,
      )) ||
    (body.data
      .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_freshness_advisory !==
      undefined &&
      !isContinuationSafetyPostMemoryApprovalRetryRenewedMemoryApprovalPostSubmitRetryRenewedMemoryApprovalPostSubmitFreshnessAdvisory(
        body.data
          .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_freshness_advisory,
      )) ||
    (body.data
      .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_result_non_persistence_note !==
      undefined &&
      !isContinuationSafetyPostMemoryApprovalRetryRenewedMemoryApprovalPostSubmitRetryRenewedMemoryApprovalPostSubmitCollectionResultNonPersistenceNote(
        body.data
          .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_result_non_persistence_note,
      )) ||
    (body.data
      .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_uncertainty_reminder !==
      undefined &&
      !isContinuationSafetyPostMemoryApprovalRetryRenewedMemoryApprovalPostSubmitRetryRenewedMemoryApprovalPostSubmitCollectionUncertaintyReminder(
        body.data
          .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_uncertainty_reminder,
      )) ||
    (body.data
      .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_pre_merge_freshness_advisory !==
      undefined &&
      !isContinuationSafetyPostMemoryApprovalRetryRenewedMemoryApprovalPostSubmitRetryRenewedMemoryApprovalPostSubmitCollectionPreMergeFreshnessAdvisory(
        body.data
          .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_pre_merge_freshness_advisory,
      )) ||
    (body.data
      .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_pre_handoff_freshness_advisory !==
      undefined &&
      !isContinuationSafetyPostMemoryApprovalRetryRenewedMemoryApprovalPostSubmitRetryRenewedMemoryApprovalPostSubmitCollectionPreHandoffFreshnessAdvisory(
        body.data
          .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_pre_handoff_freshness_advisory,
      )) ||
    (body.data
      .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_pre_paste_freshness_advisory !==
      undefined &&
      !isContinuationSafetyPostMemoryApprovalRetryRenewedMemoryApprovalPostSubmitRetryRenewedMemoryApprovalPostSubmitCollectionPrePasteFreshnessAdvisory(
        body.data
          .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_pre_paste_freshness_advisory,
      )) ||
    (body.data
      .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_pre_submit_freshness_advisory !==
      undefined &&
      !isContinuationSafetyPostMemoryApprovalRetryRenewedMemoryApprovalPostSubmitRetryRenewedMemoryApprovalPostSubmitCollectionPreSubmitFreshnessAdvisory(
        body.data
          .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_pre_submit_freshness_advisory,
      )) ||
    (body.data
      .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_post_submit_freshness_advisory !==
      undefined &&
      !isContinuationSafetyPostMemoryApprovalRetryRenewedMemoryApprovalPostSubmitRetryRenewedMemoryApprovalPostSubmitCollectionPostSubmitFreshnessAdvisory(
        body.data
          .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_post_submit_freshness_advisory,
      )) ||
    (body.data
      .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_freshness_result_non_persistence_note !==
      undefined &&
      !isContinuationSafetyPostMemoryApprovalRetryRenewedMemoryApprovalPostSubmitRetryRenewedMemoryApprovalPostSubmitCollectionFreshnessResultNonPersistenceNote(
        body.data
          .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_freshness_result_non_persistence_note,
      )) ||
    (body.data
      .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_freshness_uncertainty_collection_reminder !==
      undefined &&
      !isContinuationSafetyPostMemoryApprovalRetryRenewedMemoryApprovalPostSubmitRetryRenewedMemoryApprovalPostSubmitCollectionFreshnessUncertaintyCollectionReminder(
        body.data
          .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_freshness_uncertainty_collection_reminder,
      )) ||
    !Array.isArray(body.data.items) ||
    !body.data.items.every(isLoopSummary) ||
    !isLoopListPrivacy(body.data.privacy)
  ) {
    throw new Error("Loop worktree drilldown failed: Invalid response.");
  }
  return body.data as LoopWorktreeResponse;
}

export async function approveLoopMemory(
  options: {
    approvedBy?: string;
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
    body: JSON.stringify({ approved_by: options.approvedBy ?? "web" }),
  });

  if (!response.ok) {
    await failApi(response, "Loop memory approval failed");
  }

  const body = (await response.json()) as Parameters<
    typeof parseLoopMemoryApprovalResponse
  >[0];
  return parseLoopMemoryApprovalResponse(body, "Loop memory approval failed");
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

async function failApi(response: Response, label: string): Promise<never> {
  let detail = "";
  try {
    const body = (await response.json()) as {
      detail?: unknown;
      title?: unknown;
      message?: unknown;
      errors?: unknown;
    };
    const issueDetail = apiErrorIssueText(body.errors);
    detail =
      apiErrorText(body.detail) ||
      apiErrorText(body.title) ||
      apiErrorText(body.message);
    if (detail && issueDetail) {
      detail = `${detail} ${issueDetail}`;
    } else {
      detail ||= issueDetail;
    }
  } catch {
    // body may not be JSON, that is fine.
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
        field?: unknown;
        instancePath?: unknown;
        message?: unknown;
        param?: unknown;
        params?: unknown;
        path?: unknown;
        property?: unknown;
      };
      const field =
        apiErrorText(record.field) ||
        apiErrorIssuePathText(record.field) ||
        apiErrorIssuePathText(record.path) ||
        apiErrorIssuePathText(record.instancePath) ||
        apiErrorIssuePathText(record.property) ||
        apiErrorIssuePathText(record.param) ||
        apiErrorIssueParamsText(record.params);
      const rawFieldKey = rawDetailErrorFieldKey(field);
      const message = rawFieldKey
        ? `[REDACTED:${rawFieldKey.toLowerCase()}]`
        : apiErrorText(record.message);
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
      /\b(?:AIza[0-9A-Za-z_-]{20,}|npm_[A-Za-z0-9]{30,}|(?:sk|pk|ghp|github_pat|xoxb|AKIA)[a-zA-Z0-9_-]{8,})\b/g,
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
  };
  if (
    typeof body.ok !== "boolean" ||
    typeof body.version !== "string" ||
    body.markdown !== undefined ||
    body.prompt_body !== undefined ||
    body.raw_path !== undefined
  ) {
    throw new Error("Health check failed: Invalid response.");
  }
  return { ok: body.ok, version: body.version };
}
