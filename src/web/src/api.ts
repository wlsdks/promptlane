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
      const body = (await response.json()) as { data: { csrf_token: string } };
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
  const body = (await response.json()) as { data: PromptListResponse };
  return body.data;
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

  const body = (await response.json()) as { data: QualityDashboard };
  return body.data;
}

export async function getArchiveScoreReport(): Promise<ArchiveScoreReport> {
  await ensureSession();
  const response = await fetch("/api/v1/score?limit=200&low_score_limit=8", {
    credentials: "same-origin",
  });

  if (!response.ok) {
    await failApi(response, "Archive score report failed");
  }

  const body = (await response.json()) as { data: ArchiveScoreReport };
  return body.data;
}

export async function getSettings(): Promise<SettingsResponse> {
  await ensureSession();
  const response = await fetch("/api/v1/settings", {
    credentials: "same-origin",
  });

  if (!response.ok) {
    await failApi(response, "Settings failed");
  }

  const body = (await response.json()) as { data: SettingsResponse };
  return body.data;
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
    data: { items: ProjectSummary[] };
  };
  return body.data.items;
}

export async function listLoops(): Promise<LoopListResponse> {
  await ensureSession();
  const response = await fetch("/api/v1/loops", {
    credentials: "same-origin",
  });

  if (!response.ok) {
    await failApi(response, "Loop list failed");
  }

  const body = (await response.json()) as { data: LoopListResponse };
  return body.data;
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

  const body = (await response.json()) as { data: LoopBrief };
  return body.data;
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

  const body = (await response.json()) as { data: LoopBrief };
  return body.data;
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

  const body = (await response.json()) as { data: LoopWorktreeResponse };
  return body.data;
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

  const body = (await response.json()) as { data: LoopMemoryApprovalResult };
  return body.data;
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

  const body = (await response.json()) as {
    data: LoopInstructionPatchProposal;
  };
  return body.data;
}

async function failApi(response: Response, label: string): Promise<never> {
  let detail = "";
  try {
    const body = (await response.json()) as {
      detail?: string;
      title?: string;
    };
    detail = body.detail || body.title || "";
  } catch {
    // body may not be JSON, that is fine.
  }
  const suffix = detail ? `: ${detail}` : "";
  throw new Error(`${label} (${response.status})${suffix}`);
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

  const body = (await response.json()) as { data: ProjectSummary };
  return body.data;
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

  const body = (await response.json()) as { data: ProjectInstructionReview };
  return body.data;
}

export type CoachFeedbackRating = "helpful" | "not_helpful" | "wrong";

export type CoachFeedbackEntry = {
  id: string;
  prompt_id: string;
  rating: CoachFeedbackRating;
  created_at: string;
};

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
  const body = (await response.json()) as { data: CoachFeedbackSummary };
  return body.data;
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

  const body = (await response.json()) as { data: CoachFeedbackEntry };
  return body.data;
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

  const body = (await response.json()) as { data: ImportDryRunResult };
  return body.data;
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

  const body = (await response.json()) as { data: ExportJob };
  return body.data;
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

  const body = (await response.json()) as { data: AnonymizedExportPayload };
  return body.data;
}

export async function getPrompt(id: string): Promise<PromptDetail> {
  await ensureSession();
  const response = await fetch(`/api/v1/prompts/${encodeURIComponent(id)}`, {
    credentials: "same-origin",
  });

  if (!response.ok) {
    await failApi(response, "Prompt not found");
  }

  const body = (await response.json()) as { data: PromptDetail };
  return body.data;
}

export type AskEventSummary = {
  total_count: number;
  recent_count: number;
  axis_counts: Record<string, number>;
  average_score: number;
  last_triggered_at?: string;
};

export async function getAskEventSummary(days = 7): Promise<AskEventSummary> {
  await ensureSession();
  const params = new URLSearchParams({ days: String(days) });
  const response = await fetch(`/api/v1/ask-events/summary?${params}`, {
    credentials: "same-origin",
  });

  if (!response.ok) {
    await failApi(response, "Ask event summary unavailable");
  }

  const body = (await response.json()) as { data: AskEventSummary };
  return body.data;
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

  const body = (await response.json()) as { data: PromptSummary[] };
  return body.data;
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
    data: { usefulness: PromptUsefulness };
  };
  return body.data.usefulness;
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
  const body = (await response.json()) as { data: PromptImprovementDraft };
  return body.data;
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
  const body = (await response.json()) as {
    data: Pick<PromptImprovementDraft, "id" | "prompt_id" | "copied_at">;
  };
  return body.data;
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
    data: { usefulness: PromptUsefulness };
  };
  return body.data.usefulness;
}

export async function getHealth(): Promise<{
  ok: boolean;
  version: string;
}> {
  const response = await fetch("/api/v1/health", {
    credentials: "same-origin",
  });
  return response.json() as Promise<{
    ok: boolean;
    version: string;
  }>;
}
