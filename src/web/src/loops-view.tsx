import { Copy, FileText, ShieldCheck } from "lucide-react";
import { useState } from "react";

import type {
  LoopInstructionPatchProposal,
  LoopListResponse,
  LoopSummary,
  LoopWorktreeResponse,
} from "./api.js";
import { getLoopBrief, getLoopInstructionPatch } from "./api.js";
import { copyTextToClipboard } from "./clipboard.js";
import { formatDate } from "./formatters.js";
import { LoopReviewItem } from "./loop-review-item.js";

import "./loops-view.css";

export function LoopsView({
  loading,
  loops,
  onApproveMemoryCandidate,
  onCopyCommandCenterBrief,
  onCopySelectedBrief,
  onSelectWorktree,
  worktreeDetail,
}: {
  loading: boolean;
  loops?: LoopListResponse;
  onApproveMemoryCandidate?: () => Promise<void>;
  onCopyCommandCenterBrief?: (
    selection: CommandCenterBriefSelection,
  ) => Promise<void>;
  onCopySelectedBrief?: (detail: LoopWorktreeResponse) => Promise<void>;
  onSelectWorktree?: (worktree: string) => Promise<void>;
  worktreeDetail?: LoopWorktreeResponse;
}) {
  const items = loops?.items ?? [];
  const [approvalBusy, setApprovalBusy] = useState(false);
  const [approvalRecorded, setApprovalRecorded] = useState(false);
  const [patchBusy, setPatchBusy] = useState(false);
  const [patchProposal, setPatchProposal] = useState<
    LoopInstructionPatchProposal | undefined
  >();
  const [commandCenterBriefBusy, setCommandCenterBriefBusy] = useState<
    string | undefined
  >();
  const [commandCenterBriefCopied, setCommandCenterBriefCopied] = useState<
    string | undefined
  >();
  const [selectedBriefBusy, setSelectedBriefBusy] = useState(false);
  const [selectedBriefCopied, setSelectedBriefCopied] = useState(false);

  async function approveCandidate(): Promise<void> {
    if (!onApproveMemoryCandidate) return;

    setApprovalBusy(true);
    try {
      await onApproveMemoryCandidate();
      setApprovalRecorded(true);
      window.setTimeout(() => setApprovalRecorded(false), 2_500);
    } finally {
      setApprovalBusy(false);
    }
  }

  async function reviewInstructionPatch(): Promise<void> {
    setPatchBusy(true);
    try {
      setPatchProposal(
        await getLoopInstructionPatch({ targetFile: "AGENTS.md" }),
      );
    } finally {
      setPatchBusy(false);
    }
  }

  async function copySelectedBrief(): Promise<void> {
    if (!worktreeDetail || !onCopySelectedBrief) return;

    setSelectedBriefBusy(true);
    try {
      await onCopySelectedBrief(worktreeDetail);
      setSelectedBriefCopied(true);
      window.setTimeout(() => setSelectedBriefCopied(false), 2_500);
    } finally {
      setSelectedBriefBusy(false);
    }
  }

  async function copyCommandCenterBrief(
    selection: CommandCenterBriefSelection,
  ): Promise<void> {
    if (!onCopyCommandCenterBrief) return;

    setCommandCenterBriefBusy(selection.worktree);
    try {
      await onCopyCommandCenterBrief(selection);
      setCommandCenterBriefCopied(selection.worktree);
      window.setTimeout(() => setCommandCenterBriefCopied(undefined), 2_500);
    } finally {
      setCommandCenterBriefBusy(undefined);
    }
  }

  if (loading) {
    return <section className="panel">Loading loop snapshots...</section>;
  }

  if (!loops || items.length === 0) {
    return (
      <section className="panel loops-empty">
        <div>
          <span className="panel-eyebrow">Loopdeck</span>
          <h2>No loop snapshots yet</h2>
          <p>
            Run <code>prompt-coach loop collect</code> after a Codex or Claude
            Code turn to create the first local loop snapshot.
          </p>
        </div>
        <div className="privacy-note">
          Local-only. No prompt bodies, raw paths, or compact summaries are
          shown here.
        </div>
      </section>
    );
  }

  return (
    <section className="loops-view" aria-label="Loop snapshots">
      <div className="panel loops-summary">
        <div>
          <span className="panel-eyebrow">Loopdeck</span>
          <h2>{items.length} loop snapshots</h2>
          <p className="loops-status-line">
            Loopdeck status {loops.status.status}
          </p>
          <p className="loops-status-line">
            Approved memories {loops.status.project_memory.approved_count}
          </p>
          <p className="loops-status-line">
            Active worktrees {loops.status.activity.active_worktrees}
          </p>
          <p className="loops-status-line">
            Active sessions {loops.status.activity.active_sessions}
          </p>
          {loops.status.activity.needs_review && (
            <p className="loops-status-line">Worktree review needed</p>
          )}
          {loops.status.activity.command_center && (
            <div className="loop-memory-action">
              <span>Command center</span>
              <code>{loops.status.activity.command_center.title}</code>
              <p className="loops-status-line">
                {loops.status.activity.command_center.primary_action}
              </p>
              <p className="loops-status-line">
                Review packet{" "}
                {loops.status.activity.command_center.review_packet.status}
              </p>
              <p className="loops-status-line">
                {loops.status.activity.command_center.review_packet.summary}
              </p>
              <p className="loops-status-line">
                Next{" "}
                {loops.status.activity.command_center.review_packet.next_action}
              </p>
              {loops.status.activity.command_center.review_packet
                .decision_advisory && (
                <p className="loops-status-line">
                  Decision advisory{" "}
                  {
                    loops.status.activity.command_center.review_packet
                      .decision_advisory.next_action
                  }
                </p>
              )}
              <div>
                <p className="loops-status-line">Human checklist</p>
                {loops.status.activity.command_center.review_packet.checklist.map(
                  (item) => (
                    <p className="loops-status-line" key={item.action}>
                      {item.label} {item.status}
                    </p>
                  ),
                )}
              </div>
              {loops.status.activity.command_center.review_items
                .slice(0, 3)
                .map((item) => (
                  <div className="loop-worktree-line" key={item.worktree}>
                    <div>
                      <p className="loops-status-line">
                        {item.worktree}: {item.recommendation}
                      </p>
                      <p className="loops-status-line">
                        Merge readiness {item.merge_readiness.status}
                      </p>
                      <p className="loops-status-line">
                        Evidence {item.merge_readiness.evidence} / Evidence
                        refs {item.evidence_count}
                      </p>
                      <code>{item.continuation_command}</code>
                    </div>
                    <button
                      className="loop-copy-button"
                      disabled={
                        !onCopyCommandCenterBrief ||
                        commandCenterBriefBusy === item.worktree
                      }
                      onClick={() =>
                        void copyCommandCenterBrief({
                          worktree: item.worktree,
                          ...(item.branch ? { branch: item.branch } : {}),
                        })
                      }
                      title={`Copy review brief for ${item.worktree}`}
                      type="button"
                    >
                      <Copy aria-hidden size={15} />
                      {commandCenterBriefCopied === item.worktree
                        ? "Copied review brief"
                        : "Copy review brief"}
                    </button>
                  </div>
                ))}
            </div>
          )}
          {loops.status.activity.recent_decisions &&
            loops.status.activity.recent_decisions.length > 0 && (
              <div>
                <p className="loops-status-line">Recent decisions</p>
                {loops.status.activity.recent_decisions.map((decision) => (
                  <p
                    className="loops-status-line"
                    key={`${decision.snapshot_id}:${decision.created_at}`}
                  >
                    {decision.worktree} {decision.decision} {decision.reason}
                  </p>
                ))}
              </div>
            )}
          {loops.status.activity.worktrees.slice(0, 2).map((worktree) => (
            <div className="loop-worktree-line" key={worktree.worktree}>
              <p className="loops-status-line">
                {worktree.worktree} {worktree.snapshots}{" "}
                {pluralize(worktree.snapshots, "snapshot")} /{" "}
                {worktree.sessions} {pluralize(worktree.sessions, "session")}
              </p>
              <button
                className="loop-copy-button"
                disabled={!onSelectWorktree}
                onClick={() => void onSelectWorktree?.(worktree.worktree)}
                title={`Open ${worktree.worktree}`}
                type="button"
              >
                Open {worktree.worktree}
              </button>
            </div>
          ))}
          {loops.status.memory_candidate && (
            <p className="loops-status-line">
              Memory candidate{" "}
              {loops.status.memory_candidate.eligible
                ? "eligible"
                : loops.status.memory_candidate.reason}
            </p>
          )}
          {loops.status.memory_candidate?.eligible && (
            <div className="loop-memory-action">
              <code>{loops.status.memory_candidate.next_action}</code>
              <button
                className="loop-copy-button"
                disabled={approvalBusy || !onApproveMemoryCandidate}
                onClick={() => void approveCandidate()}
                title="Approve latest loop memory candidate"
                type="button"
              >
                <ShieldCheck size={15} />
                {approvalRecorded
                  ? "Memory approved"
                  : approvalBusy
                    ? "Approving..."
                    : "Approve memory"}
              </button>
            </div>
          )}
          {loops.status.project_memory.approved_count > 0 && (
            <div className="loop-memory-action">
              <code>
                prompt-coach loop instruction-patch --target-file AGENTS.md
              </code>
              <button
                className="loop-copy-button"
                disabled={patchBusy}
                onClick={() => void reviewInstructionPatch()}
                title="Review AGENTS.md instruction patch"
                type="button"
              >
                <FileText size={15} />
                {patchBusy ? "Preparing..." : "Review AGENTS.md patch"}
              </button>
            </div>
          )}
          <p className="loops-status-line">Next: {loops.status.next_action}</p>
          <p>
            Recent local agent loops grouped by safe project metadata. Compact
            markers show when a fresh snapshot should be collected.
          </p>
        </div>
        <div className="privacy-note">
          No prompt bodies, raw paths, transcript content, or compact summaries.
        </div>
      </div>
      {patchProposal && (
        <div className="panel loop-patch-panel">
          <div>
            <span className="panel-eyebrow">Review only</span>
            <h2>{patchProposal.title}</h2>
            <p>
              Requires explicit user approval. This preview does not write
              AGENTS.md, CLAUDE.md, project docs, or memory files.
            </p>
          </div>
          <div className="loop-apply-gate">
            <span>Web apply unavailable</span>
            <code>{patchProposal.apply_gate.confirm_command}</code>
            <p>{patchProposal.apply_gate.reason}</p>
          </div>
          <pre>{patchProposal.diff}</pre>
        </div>
      )}
      {worktreeDetail && (
        <div className="loop-table panel">
          <div className="loop-worktree-detail">
            <span className="panel-eyebrow">Worktree detail</span>
            <h2>{worktreeDetail.worktree}</h2>
            {worktreeDetail.session_id && (
              <p className="loops-status-line">
                Session {worktreeDetail.session_id}
              </p>
            )}
            {worktreeDetail.branch && (
              <p className="loops-status-line">
                Branch {worktreeDetail.branch}
              </p>
            )}
            <div>
              <p className="loops-status-line">
                {worktreeDetail.selection_scope.label}
              </p>
              <p className="loops-status-line">
                {worktreeDetail.selection_scope.reason}
              </p>
              <p className="loops-status-line">
                Next {worktreeDetail.selection_scope.next_action}
              </p>
            </div>
            {worktreeDetail.snapshot_age && (
              <div>
                <p className="loops-status-line">
                  {worktreeDetail.snapshot_age.label}
                </p>
                <p className="loops-status-line">
                  {worktreeDetail.snapshot_age.status}{" "}
                  {worktreeDetail.snapshot_age.reason}
                </p>
                <p className="loops-status-line">
                  Next {worktreeDetail.snapshot_age.next_action}
                </p>
              </div>
            )}
            {worktreeDetail.selected_brief_action && (
              <div className="loop-detail-section">
                <p className="loop-detail-section-title">
                  Continuation guidance
                </p>
                <p className="loops-status-line">
                  {worktreeDetail.selected_brief_action.label}
                </p>
                <p className="loops-status-line">
                  {worktreeDetail.selected_brief_action.action}
                </p>
                <p className="loops-status-line">
                  {worktreeDetail.selected_brief_action.reason}
                </p>
                <code>{worktreeDetail.selected_brief_action.command}</code>
                <p className="loops-status-line">
                  No file writes or external calls
                </p>
                {worktreeDetail.command_distinction && (
                  <LoopReviewItem
                    footer="No distinction writes or external calls"
                    lines={[
                      worktreeDetail.command_distinction.label,
                      worktreeDetail.command_distinction.selected_command_role,
                      worktreeDetail.command_distinction.review_command_role,
                      worktreeDetail.command_distinction.reason,
                    ]}
                  />
                )}
                {worktreeDetail.command_filters && (
                  <LoopReviewItem
                    footer="No filter explanation writes or external calls"
                    lines={[
                      worktreeDetail.command_filters.label,
                      `Selected filters ${worktreeDetail.command_filters.selected_command_filters.join(
                        ", ",
                      )}`,
                      `Review filters ${worktreeDetail.command_filters.review_command_filters.join(
                        ", ",
                      )}`,
                      worktreeDetail.command_filters.reason,
                    ]}
                  />
                )}
                {worktreeDetail.copy_side_effects && (
                  <LoopReviewItem
                    footer="No copy side-effect writes or external calls"
                    lines={[
                      worktreeDetail.copy_side_effects.label,
                      worktreeDetail.copy_side_effects.clipboard,
                      worktreeDetail.copy_side_effects.ui_feedback,
                      worktreeDetail.copy_side_effects.does_not,
                    ]}
                  />
                )}
                {worktreeDetail.continuation_safety_group && (
                  <LoopReviewItem
                    footer="No safety guidance writes or external calls"
                    lines={[
                      worktreeDetail.continuation_safety_group.label,
                      worktreeDetail.continuation_safety_group.scope,
                      worktreeDetail.continuation_safety_group.includes,
                      worktreeDetail.continuation_safety_group.reason,
                    ]}
                  />
                )}
                {worktreeDetail.continuation_safety_ordering_note && (
                  <LoopReviewItem
                    footer="No ordering writes or external calls"
                    lines={[
                      worktreeDetail.continuation_safety_ordering_note.label,
                      worktreeDetail.continuation_safety_ordering_note.first,
                      worktreeDetail.continuation_safety_ordering_note.then,
                      worktreeDetail.continuation_safety_ordering_note.reason,
                    ]}
                  />
                )}
                {worktreeDetail.continuation_safety_non_persistence_note && (
                  <LoopReviewItem
                    footer="No safety review state storage or external calls"
                    lines={[
                      worktreeDetail.continuation_safety_non_persistence_note
                        .label,
                      worktreeDetail.continuation_safety_non_persistence_note
                        .state,
                      worktreeDetail.continuation_safety_non_persistence_note
                        .reminder,
                      worktreeDetail.continuation_safety_non_persistence_note
                        .reason,
                    ]}
                  />
                )}
                {worktreeDetail.continuation_safety_recheck_cue && (
                  <LoopReviewItem
                    footer="No re-check writes or external calls"
                    lines={[
                      worktreeDetail.continuation_safety_recheck_cue.label,
                      worktreeDetail.continuation_safety_recheck_cue.trigger,
                      worktreeDetail.continuation_safety_recheck_cue
                        .instruction,
                      worktreeDetail.continuation_safety_recheck_cue.reason,
                    ]}
                  />
                )}
                {worktreeDetail.continuation_safety_copy_feedback_reminder && (
                  <LoopReviewItem
                    footer="No copy feedback reminder writes or external calls"
                    lines={[
                      worktreeDetail.continuation_safety_copy_feedback_reminder
                        .label,
                      worktreeDetail.continuation_safety_copy_feedback_reminder
                        .feedback_scope,
                      worktreeDetail.continuation_safety_copy_feedback_reminder
                        .next_step,
                      worktreeDetail.continuation_safety_copy_feedback_reminder
                        .reason,
                    ]}
                  />
                )}
                {worktreeDetail.continuation_safety_copy_feedback_accessibility_note && (
                  <LoopReviewItem
                    footer="No accessibility feedback writes or external calls"
                    lines={[
                      worktreeDetail
                        .continuation_safety_copy_feedback_accessibility_note
                        .label,
                      worktreeDetail
                        .continuation_safety_copy_feedback_accessibility_note
                        .visible_label,
                      worktreeDetail
                        .continuation_safety_copy_feedback_accessibility_note
                        .assistive_feedback,
                      worktreeDetail
                        .continuation_safety_copy_feedback_accessibility_note
                        .reason,
                    ]}
                  />
                )}
                {worktreeDetail.continuation_safety_copy_feedback_timeout_note && (
                  <LoopReviewItem
                    footer="No copy feedback timeout writes or external calls"
                    lines={[
                      worktreeDetail.continuation_safety_copy_feedback_timeout_note
                        .label,
                      worktreeDetail.continuation_safety_copy_feedback_timeout_note
                        .timeout_scope,
                      worktreeDetail.continuation_safety_copy_feedback_timeout_note
                        .not_state,
                      worktreeDetail.continuation_safety_copy_feedback_timeout_note
                        .reason,
                    ]}
                  />
                )}
                {worktreeDetail.continuation_safety_copy_feedback_failure_note && (
                  <LoopReviewItem
                    footer="No copy feedback failure writes or external calls"
                    lines={[
                      worktreeDetail.continuation_safety_copy_feedback_failure_note
                        .label,
                      worktreeDetail.continuation_safety_copy_feedback_failure_note
                        .failure_scope,
                      worktreeDetail.continuation_safety_copy_feedback_failure_note
                        .not_state,
                      worktreeDetail.continuation_safety_copy_feedback_failure_note
                        .reason,
                    ]}
                  />
                )}
                {worktreeDetail.continuation_safety_copy_retry_note && (
                  <LoopReviewItem
                    footer="No copy retry writes or external calls"
                    lines={[
                      worktreeDetail.continuation_safety_copy_retry_note.label,
                      worktreeDetail.continuation_safety_copy_retry_note
                        .retry_scope,
                      worktreeDetail.continuation_safety_copy_retry_note
                        .not_automatic,
                      worktreeDetail.continuation_safety_copy_retry_note.reason,
                    ]}
                  />
                )}
                {worktreeDetail.continuation_safety_pre_paste_confirmation_note && (
                  <LoopReviewItem
                    footer="No pre-paste confirmation writes or external calls"
                    lines={[
                      worktreeDetail.continuation_safety_pre_paste_confirmation_note
                        .label,
                      worktreeDetail.continuation_safety_pre_paste_confirmation_note
                        .confirmation,
                      worktreeDetail.continuation_safety_pre_paste_confirmation_note
                        .not_submission,
                      worktreeDetail.continuation_safety_pre_paste_confirmation_note
                        .reason,
                    ]}
                  />
                )}
                {worktreeDetail.continuation_safety_target_agent_check_note && (
                  <LoopReviewItem
                    footer="No target-agent check writes or external calls"
                    lines={[
                      worktreeDetail.continuation_safety_target_agent_check_note
                        .label,
                      worktreeDetail.continuation_safety_target_agent_check_note
                        .check,
                      worktreeDetail.continuation_safety_target_agent_check_note
                        .not_inspection,
                      worktreeDetail.continuation_safety_target_agent_check_note
                        .reason,
                    ]}
                  />
                )}
                {worktreeDetail.continuation_safety_paste_destination_boundary_note && (
                  <LoopReviewItem
                    footer="No paste destination boundary writes or external calls"
                    lines={[
                      worktreeDetail
                        .continuation_safety_paste_destination_boundary_note
                        .label,
                      worktreeDetail
                        .continuation_safety_paste_destination_boundary_note
                        .boundary,
                      worktreeDetail
                        .continuation_safety_paste_destination_boundary_note
                        .not_verified,
                      worktreeDetail
                        .continuation_safety_paste_destination_boundary_note
                        .reason,
                    ]}
                  />
                )}
                {worktreeDetail.continuation_safety_manual_submission_boundary_note && (
                  <LoopReviewItem
                    footer="No manual submission boundary writes or external calls"
                    lines={[
                      worktreeDetail
                        .continuation_safety_manual_submission_boundary_note
                        .label,
                      worktreeDetail
                        .continuation_safety_manual_submission_boundary_note
                        .submission,
                      worktreeDetail
                        .continuation_safety_manual_submission_boundary_note
                        .not_automated,
                      worktreeDetail
                        .continuation_safety_manual_submission_boundary_note
                        .reason,
                    ]}
                  />
                )}
                {worktreeDetail.continuation_safety_submission_result_non_persistence_note && (
                  <LoopReviewItem
                    footer="No submission result persistence writes or external calls"
                    lines={[
                      worktreeDetail
                        .continuation_safety_submission_result_non_persistence_note
                        .label,
                      worktreeDetail
                        .continuation_safety_submission_result_non_persistence_note
                        .result_scope,
                      worktreeDetail
                        .continuation_safety_submission_result_non_persistence_note
                        .not_stored,
                      worktreeDetail
                        .continuation_safety_submission_result_non_persistence_note
                        .reason,
                    ]}
                  />
                )}
                {worktreeDetail.continuation_safety_post_submission_collection_reminder_note && (
                  <LoopReviewItem
                    footer="No post-submission collection writes or external calls"
                    lines={[
                      worktreeDetail
                        .continuation_safety_post_submission_collection_reminder_note
                        .label,
                      worktreeDetail
                        .continuation_safety_post_submission_collection_reminder_note
                        .reminder,
                      worktreeDetail
                        .continuation_safety_post_submission_collection_reminder_note
                        .not_background,
                      worktreeDetail
                        .continuation_safety_post_submission_collection_reminder_note
                        .reason,
                    ]}
                  />
                )}
                {worktreeDetail.continuation_safety_collection_result_non_persistence_note && (
                  <LoopReviewItem
                    footer="No collection result persistence writes or external calls"
                    lines={[
                      worktreeDetail
                        .continuation_safety_collection_result_non_persistence_note
                        .label,
                      worktreeDetail
                        .continuation_safety_collection_result_non_persistence_note
                        .result_scope,
                      worktreeDetail
                        .continuation_safety_collection_result_non_persistence_note
                        .not_stored,
                      worktreeDetail
                        .continuation_safety_collection_result_non_persistence_note
                        .reason,
                    ]}
                  />
                )}
                {worktreeDetail.continuation_safety_collection_retry_boundary_note && (
                  <LoopReviewItem
                    footer="No collection retry writes or external calls"
                    lines={[
                      worktreeDetail
                        .continuation_safety_collection_retry_boundary_note
                        .label,
                      worktreeDetail
                        .continuation_safety_collection_retry_boundary_note
                        .retry,
                      worktreeDetail
                        .continuation_safety_collection_retry_boundary_note
                        .not_automated,
                      worktreeDetail
                        .continuation_safety_collection_retry_boundary_note
                        .reason,
                    ]}
                  />
                )}
                {worktreeDetail.continuation_safety_retry_outcome_non_persistence_note && (
                  <LoopReviewItem
                    footer="No retry outcome persistence writes or external calls"
                    lines={[
                      worktreeDetail
                        .continuation_safety_retry_outcome_non_persistence_note
                        .label,
                      worktreeDetail
                        .continuation_safety_retry_outcome_non_persistence_note
                        .outcome_scope,
                      worktreeDetail
                        .continuation_safety_retry_outcome_non_persistence_note
                        .not_stored,
                      worktreeDetail
                        .continuation_safety_retry_outcome_non_persistence_note
                        .reason,
                    ]}
                  />
                )}
                {worktreeDetail.continuation_safety_collection_evidence_freshness_boundary_note && (
                  <LoopReviewItem
                    footer="No freshness verification writes or external calls"
                    lines={[
                      worktreeDetail
                        .continuation_safety_collection_evidence_freshness_boundary_note
                        .label,
                      worktreeDetail
                        .continuation_safety_collection_evidence_freshness_boundary_note
                        .freshness_check,
                      worktreeDetail
                        .continuation_safety_collection_evidence_freshness_boundary_note
                        .not_verified,
                      worktreeDetail
                        .continuation_safety_collection_evidence_freshness_boundary_note
                        .reason,
                    ]}
                  />
                )}
                {worktreeDetail.continuation_safety_freshness_result_non_persistence_note && (
                  <LoopReviewItem
                    footer="No freshness result persistence writes or external calls"
                    lines={[
                      worktreeDetail
                        .continuation_safety_freshness_result_non_persistence_note
                        .label,
                      worktreeDetail
                        .continuation_safety_freshness_result_non_persistence_note
                        .result_scope,
                      worktreeDetail
                        .continuation_safety_freshness_result_non_persistence_note
                        .not_stored,
                      worktreeDetail
                        .continuation_safety_freshness_result_non_persistence_note
                        .reason,
                    ]}
                  />
                )}
                {worktreeDetail.continuation_safety_freshness_uncertainty_collection_reminder && (
                  <LoopReviewItem
                    footer="No freshness uncertainty collection writes or external calls"
                    lines={[
                      worktreeDetail
                        .continuation_safety_freshness_uncertainty_collection_reminder
                        .label,
                      worktreeDetail
                        .continuation_safety_freshness_uncertainty_collection_reminder
                        .reminder,
                      worktreeDetail
                        .continuation_safety_freshness_uncertainty_collection_reminder
                        .not_automated,
                      worktreeDetail
                        .continuation_safety_freshness_uncertainty_collection_reminder
                        .reason,
                    ]}
                  />
                )}
                {worktreeDetail.continuation_safety_pre_merge_freshness_advisory && (
                  <LoopReviewItem
                    footer="No pre-merge freshness writes or external calls"
                    lines={[
                      worktreeDetail
                        .continuation_safety_pre_merge_freshness_advisory.label,
                      worktreeDetail
                        .continuation_safety_pre_merge_freshness_advisory
                        .advisory,
                      worktreeDetail
                        .continuation_safety_pre_merge_freshness_advisory
                        .not_decision,
                      worktreeDetail
                        .continuation_safety_pre_merge_freshness_advisory.reason,
                    ]}
                  />
                )}
                {worktreeDetail.continuation_safety_pre_memory_approval_freshness_advisory && (
                  <LoopReviewItem
                    footer="No pre-memory-approval freshness writes or external calls"
                    lines={[
                      worktreeDetail
                        .continuation_safety_pre_memory_approval_freshness_advisory
                        .label,
                      worktreeDetail
                        .continuation_safety_pre_memory_approval_freshness_advisory
                        .advisory,
                      worktreeDetail
                        .continuation_safety_pre_memory_approval_freshness_advisory
                        .not_decision,
                      worktreeDetail
                        .continuation_safety_pre_memory_approval_freshness_advisory
                        .reason,
                    ]}
                  />
                )}
                {worktreeDetail.continuation_safety_post_memory_approval_collection_reminder && (
                  <LoopReviewItem
                    footer="No post-memory-approval collection writes or external calls"
                    lines={[
                      worktreeDetail
                        .continuation_safety_post_memory_approval_collection_reminder
                        .label,
                      worktreeDetail
                        .continuation_safety_post_memory_approval_collection_reminder
                        .reminder,
                      worktreeDetail
                        .continuation_safety_post_memory_approval_collection_reminder
                        .not_automated,
                      worktreeDetail
                        .continuation_safety_post_memory_approval_collection_reminder
                        .reason,
                    ]}
                  />
                )}
                {worktreeDetail.continuation_safety_post_memory_approval_collection_result_non_persistence_note && (
                  <LoopReviewItem
                    footer="No post-memory-approval collection result persistence writes or external calls"
                    lines={[
                      worktreeDetail
                        .continuation_safety_post_memory_approval_collection_result_non_persistence_note
                        .label,
                      worktreeDetail
                        .continuation_safety_post_memory_approval_collection_result_non_persistence_note
                        .result_scope,
                      worktreeDetail
                        .continuation_safety_post_memory_approval_collection_result_non_persistence_note
                        .not_stored,
                      worktreeDetail
                        .continuation_safety_post_memory_approval_collection_result_non_persistence_note
                        .reason,
                    ]}
                  />
                )}
                {worktreeDetail.continuation_safety_post_memory_approval_collection_retry_boundary_note && (
                  <LoopReviewItem
                    footer="No post-memory-approval collection retry writes or external calls"
                    lines={[
                      worktreeDetail
                        .continuation_safety_post_memory_approval_collection_retry_boundary_note
                        .label,
                      worktreeDetail
                        .continuation_safety_post_memory_approval_collection_retry_boundary_note
                        .retry,
                      worktreeDetail
                        .continuation_safety_post_memory_approval_collection_retry_boundary_note
                        .not_automated,
                      worktreeDetail
                        .continuation_safety_post_memory_approval_collection_retry_boundary_note
                        .reason,
                    ]}
                  />
                )}
                {worktreeDetail.continuation_safety_post_memory_approval_retry_outcome_non_persistence_note && (
                  <LoopReviewItem
                    footer="No post-memory-approval retry outcome persistence writes or external calls"
                    lines={[
                      worktreeDetail
                        .continuation_safety_post_memory_approval_retry_outcome_non_persistence_note
                        .label,
                      worktreeDetail
                        .continuation_safety_post_memory_approval_retry_outcome_non_persistence_note
                        .outcome_scope,
                      worktreeDetail
                        .continuation_safety_post_memory_approval_retry_outcome_non_persistence_note
                        .not_stored,
                      worktreeDetail
                        .continuation_safety_post_memory_approval_retry_outcome_non_persistence_note
                        .reason,
                    ]}
                  />
                )}
                {worktreeDetail.continuation_safety_post_memory_approval_retry_evidence_freshness_boundary_note && (
                  <LoopReviewItem
                    footer="No post-memory-approval retry freshness verification writes or external calls"
                    lines={[
                      worktreeDetail
                        .continuation_safety_post_memory_approval_retry_evidence_freshness_boundary_note
                        .label,
                      worktreeDetail
                        .continuation_safety_post_memory_approval_retry_evidence_freshness_boundary_note
                        .review,
                      worktreeDetail
                        .continuation_safety_post_memory_approval_retry_evidence_freshness_boundary_note
                        .not_verified,
                      worktreeDetail
                        .continuation_safety_post_memory_approval_retry_evidence_freshness_boundary_note
                        .reason,
                    ]}
                  />
                )}
                {worktreeDetail.continuation_safety_post_memory_approval_retry_freshness_result_non_persistence_note && (
                  <LoopReviewItem
                    footer="No post-memory-approval retry freshness result persistence writes or external calls"
                    lines={[
                      worktreeDetail
                        .continuation_safety_post_memory_approval_retry_freshness_result_non_persistence_note
                        .label,
                      worktreeDetail
                        .continuation_safety_post_memory_approval_retry_freshness_result_non_persistence_note
                        .result_scope,
                      worktreeDetail
                        .continuation_safety_post_memory_approval_retry_freshness_result_non_persistence_note
                        .not_stored,
                      worktreeDetail
                        .continuation_safety_post_memory_approval_retry_freshness_result_non_persistence_note
                        .reason,
                    ]}
                  />
                )}
                {worktreeDetail.continuation_safety_post_memory_approval_retry_freshness_uncertainty_collection_reminder && (
                  <LoopReviewItem
                    footer="No post-memory-approval retry freshness uncertainty collection writes or external calls"
                    lines={[
                      worktreeDetail
                        .continuation_safety_post_memory_approval_retry_freshness_uncertainty_collection_reminder
                        .label,
                      worktreeDetail
                        .continuation_safety_post_memory_approval_retry_freshness_uncertainty_collection_reminder
                        .reminder,
                      worktreeDetail
                        .continuation_safety_post_memory_approval_retry_freshness_uncertainty_collection_reminder
                        .not_automated,
                      worktreeDetail
                        .continuation_safety_post_memory_approval_retry_freshness_uncertainty_collection_reminder
                        .reason,
                    ]}
                  />
                )}
                {worktreeDetail.continuation_safety_post_memory_approval_retry_pre_memory_approval_freshness_advisory && (
                  <LoopReviewItem
                    footer="No post-memory-approval retry pre-memory-approval freshness advisory writes or external calls"
                    lines={[
                      worktreeDetail
                        .continuation_safety_post_memory_approval_retry_pre_memory_approval_freshness_advisory
                        .label,
                      worktreeDetail
                        .continuation_safety_post_memory_approval_retry_pre_memory_approval_freshness_advisory
                        .advisory,
                      worktreeDetail
                        .continuation_safety_post_memory_approval_retry_pre_memory_approval_freshness_advisory
                        .not_decision,
                      worktreeDetail
                        .continuation_safety_post_memory_approval_retry_pre_memory_approval_freshness_advisory
                        .reason,
                    ]}
                  />
                )}
                {worktreeDetail.continuation_safety_post_memory_approval_retry_renewed_memory_approval_collection_reminder && (
                  <LoopReviewItem
                    footer="No post-memory-approval retry renewed-memory-approval collection writes or external calls"
                    lines={[
                      worktreeDetail
                        .continuation_safety_post_memory_approval_retry_renewed_memory_approval_collection_reminder
                        .label,
                      worktreeDetail
                        .continuation_safety_post_memory_approval_retry_renewed_memory_approval_collection_reminder
                        .reminder,
                      worktreeDetail
                        .continuation_safety_post_memory_approval_retry_renewed_memory_approval_collection_reminder
                        .not_automated,
                      worktreeDetail
                        .continuation_safety_post_memory_approval_retry_renewed_memory_approval_collection_reminder
                        .reason,
                    ]}
                  />
                )}
                {worktreeDetail.continuation_safety_post_memory_approval_retry_renewed_memory_approval_collection_result_non_persistence_note && (
                  <LoopReviewItem
                    footer="No post-memory-approval retry renewed-memory-approval collection result persistence writes or external calls"
                    lines={[
                      worktreeDetail
                        .continuation_safety_post_memory_approval_retry_renewed_memory_approval_collection_result_non_persistence_note
                        .label,
                      worktreeDetail
                        .continuation_safety_post_memory_approval_retry_renewed_memory_approval_collection_result_non_persistence_note
                        .result_scope,
                      worktreeDetail
                        .continuation_safety_post_memory_approval_retry_renewed_memory_approval_collection_result_non_persistence_note
                        .not_stored,
                      worktreeDetail
                        .continuation_safety_post_memory_approval_retry_renewed_memory_approval_collection_result_non_persistence_note
                        .reason,
                    ]}
                  />
                )}
                {worktreeDetail.continuation_safety_post_memory_approval_retry_renewed_memory_approval_collection_uncertainty_reminder && (
                  <LoopReviewItem
                    footer="No post-memory-approval retry renewed-memory-approval collection uncertainty writes or external calls"
                    lines={[
                      worktreeDetail
                        .continuation_safety_post_memory_approval_retry_renewed_memory_approval_collection_uncertainty_reminder
                        .label,
                      worktreeDetail
                        .continuation_safety_post_memory_approval_retry_renewed_memory_approval_collection_uncertainty_reminder
                        .reminder,
                      worktreeDetail
                        .continuation_safety_post_memory_approval_retry_renewed_memory_approval_collection_uncertainty_reminder
                        .not_automated,
                      worktreeDetail
                        .continuation_safety_post_memory_approval_retry_renewed_memory_approval_collection_uncertainty_reminder
                        .reason,
                    ]}
                  />
                )}
                {worktreeDetail.continuation_safety_post_memory_approval_retry_renewed_memory_approval_pre_merge_freshness_advisory && (
                  <LoopReviewItem
                    footer="No post-memory-approval retry renewed-memory-approval pre-merge freshness advisory writes or external calls"
                    lines={[
                      worktreeDetail
                        .continuation_safety_post_memory_approval_retry_renewed_memory_approval_pre_merge_freshness_advisory
                        .label,
                      worktreeDetail
                        .continuation_safety_post_memory_approval_retry_renewed_memory_approval_pre_merge_freshness_advisory
                        .advisory,
                      worktreeDetail
                        .continuation_safety_post_memory_approval_retry_renewed_memory_approval_pre_merge_freshness_advisory
                        .not_decision,
                      worktreeDetail
                        .continuation_safety_post_memory_approval_retry_renewed_memory_approval_pre_merge_freshness_advisory
                        .reason,
                    ]}
                  />
                )}
                {worktreeDetail.continuation_safety_post_memory_approval_retry_renewed_memory_approval_pre_handoff_freshness_advisory && (
                  <LoopReviewItem
                    footer="No post-memory-approval retry renewed-memory-approval pre-handoff freshness advisory writes or external calls"
                    lines={[
                      worktreeDetail
                        .continuation_safety_post_memory_approval_retry_renewed_memory_approval_pre_handoff_freshness_advisory
                        .label,
                      worktreeDetail
                        .continuation_safety_post_memory_approval_retry_renewed_memory_approval_pre_handoff_freshness_advisory
                        .advisory,
                      worktreeDetail
                        .continuation_safety_post_memory_approval_retry_renewed_memory_approval_pre_handoff_freshness_advisory
                        .not_decision,
                      worktreeDetail
                        .continuation_safety_post_memory_approval_retry_renewed_memory_approval_pre_handoff_freshness_advisory
                        .reason,
                    ]}
                  />
                )}
                {worktreeDetail.continuation_safety_post_memory_approval_retry_renewed_memory_approval_pre_paste_freshness_advisory && (
                  <LoopReviewItem
                    footer="No post-memory-approval retry renewed-memory-approval pre-paste freshness advisory writes or external calls"
                    lines={[
                      worktreeDetail
                        .continuation_safety_post_memory_approval_retry_renewed_memory_approval_pre_paste_freshness_advisory
                        .label,
                      worktreeDetail
                        .continuation_safety_post_memory_approval_retry_renewed_memory_approval_pre_paste_freshness_advisory
                        .advisory,
                      worktreeDetail
                        .continuation_safety_post_memory_approval_retry_renewed_memory_approval_pre_paste_freshness_advisory
                        .not_decision,
                      worktreeDetail
                        .continuation_safety_post_memory_approval_retry_renewed_memory_approval_pre_paste_freshness_advisory
                        .reason,
                    ]}
                  />
                )}
                {worktreeDetail.continuation_safety_post_memory_approval_retry_renewed_memory_approval_pre_submit_freshness_advisory && (
                  <LoopReviewItem
                    footer="No post-memory-approval retry renewed-memory-approval pre-submit freshness advisory writes or external calls"
                    lines={[
                      worktreeDetail
                        .continuation_safety_post_memory_approval_retry_renewed_memory_approval_pre_submit_freshness_advisory
                        .label,
                      worktreeDetail
                        .continuation_safety_post_memory_approval_retry_renewed_memory_approval_pre_submit_freshness_advisory
                        .advisory,
                      worktreeDetail
                        .continuation_safety_post_memory_approval_retry_renewed_memory_approval_pre_submit_freshness_advisory
                        .not_decision,
                      worktreeDetail
                        .continuation_safety_post_memory_approval_retry_renewed_memory_approval_pre_submit_freshness_advisory
                        .reason,
                    ]}
                  />
                )}
                {worktreeDetail.continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_freshness_advisory && (
                  <LoopReviewItem
                    footer="No post-memory-approval retry renewed-memory-approval post-submit freshness advisory writes or external calls"
                    lines={[
                      worktreeDetail
                        .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_freshness_advisory
                        .label,
                      worktreeDetail
                        .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_freshness_advisory
                        .advisory,
                      worktreeDetail
                        .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_freshness_advisory
                        .not_automated,
                      worktreeDetail
                        .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_freshness_advisory
                        .reason,
                    ]}
                  />
                )}
                {worktreeDetail.continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_collection_result_non_persistence_note && (
                  <LoopReviewItem
                    footer="No post-memory-approval retry renewed-memory-approval post-submit collection result persistence writes or external calls"
                    lines={[
                      worktreeDetail
                        .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_collection_result_non_persistence_note
                        .label,
                      worktreeDetail
                        .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_collection_result_non_persistence_note
                        .result_scope,
                      worktreeDetail
                        .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_collection_result_non_persistence_note
                        .not_stored,
                      worktreeDetail
                        .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_collection_result_non_persistence_note
                        .reason,
                    ]}
                  />
                )}
                {worktreeDetail.continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_collection_retry_boundary_note && (
                  <div className="loop-review-item">
                    <p className="loops-status-line">
                      {
                        worktreeDetail
                          .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_collection_retry_boundary_note
                          .label
                      }
                    </p>
                    <p className="loops-status-line">
                      {
                        worktreeDetail
                          .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_collection_retry_boundary_note
                          .retry
                      }
                    </p>
                    <p className="loops-status-line">
                      {
                        worktreeDetail
                          .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_collection_retry_boundary_note
                          .not_automated
                      }
                    </p>
                    <p className="loops-status-line">
                      {
                        worktreeDetail
                          .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_collection_retry_boundary_note
                          .reason
                      }
                    </p>
                    <p className="loops-status-line">
                      No post-memory-approval retry renewed-memory-approval
                      post-submit collection retry writes or external calls
                    </p>
                  </div>
                )}
                {worktreeDetail.continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_outcome_non_persistence_note && (
                  <div className="loop-review-item">
                    <p className="loops-status-line">
                      {
                        worktreeDetail
                          .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_outcome_non_persistence_note
                          .label
                      }
                    </p>
                    <p className="loops-status-line">
                      {
                        worktreeDetail
                          .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_outcome_non_persistence_note
                          .outcome_scope
                      }
                    </p>
                    <p className="loops-status-line">
                      {
                        worktreeDetail
                          .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_outcome_non_persistence_note
                          .not_stored
                      }
                    </p>
                    <p className="loops-status-line">
                      {
                        worktreeDetail
                          .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_outcome_non_persistence_note
                          .reason
                      }
                    </p>
                    <p className="loops-status-line">
                      No post-memory-approval retry renewed-memory-approval
                      post-submit retry outcome persistence writes or external
                      calls
                    </p>
                  </div>
                )}
                {worktreeDetail.continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_evidence_freshness_boundary_note && (
                  <div className="loop-review-item">
                    <p className="loops-status-line">
                      {
                        worktreeDetail
                          .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_evidence_freshness_boundary_note
                          .label
                      }
                    </p>
                    <p className="loops-status-line">
                      {
                        worktreeDetail
                          .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_evidence_freshness_boundary_note
                          .freshness_scope
                      }
                    </p>
                    <p className="loops-status-line">
                      {
                        worktreeDetail
                          .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_evidence_freshness_boundary_note
                          .not_verified
                      }
                    </p>
                    <p className="loops-status-line">
                      {
                        worktreeDetail
                          .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_evidence_freshness_boundary_note
                          .reason
                      }
                    </p>
                    <p className="loops-status-line">
                      No post-memory-approval retry renewed-memory-approval
                      post-submit retry evidence freshness verification writes
                      or external calls
                    </p>
                  </div>
                )}
                {worktreeDetail.continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_freshness_result_non_persistence_note && (
                  <div className="loop-review-item">
                    <p className="loops-status-line">
                      {
                        worktreeDetail
                          .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_freshness_result_non_persistence_note
                          .label
                      }
                    </p>
                    <p className="loops-status-line">
                      {
                        worktreeDetail
                          .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_freshness_result_non_persistence_note
                          .result_scope
                      }
                    </p>
                    <p className="loops-status-line">
                      {
                        worktreeDetail
                          .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_freshness_result_non_persistence_note
                          .not_stored
                      }
                    </p>
                    <p className="loops-status-line">
                      {
                        worktreeDetail
                          .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_freshness_result_non_persistence_note
                          .reason
                      }
                    </p>
                    <p className="loops-status-line">
                      No post-memory-approval retry renewed-memory-approval
                      post-submit retry freshness result persistence writes or
                      external calls
                    </p>
                  </div>
                )}
                {worktreeDetail.continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_freshness_uncertainty_collection_reminder && (
                  <div className="loop-review-item">
                    <p className="loops-status-line">
                      {
                        worktreeDetail
                          .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_freshness_uncertainty_collection_reminder
                          .label
                      }
                    </p>
                    <p className="loops-status-line">
                      {
                        worktreeDetail
                          .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_freshness_uncertainty_collection_reminder
                          .collection_trigger
                      }
                    </p>
                    <p className="loops-status-line">
                      {
                        worktreeDetail
                          .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_freshness_uncertainty_collection_reminder
                          .not_automated
                      }
                    </p>
                    <p className="loops-status-line">
                      {
                        worktreeDetail
                          .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_freshness_uncertainty_collection_reminder
                          .reason
                      }
                    </p>
                    <p className="loops-status-line">
                      No post-memory-approval retry renewed-memory-approval
                      post-submit retry freshness uncertainty collection writes
                      or external calls
                    </p>
                  </div>
                )}
                {worktreeDetail.continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_pre_memory_approval_freshness_advisory && (
                  <div className="loop-review-item">
                    <p className="loops-status-line">
                      {
                        worktreeDetail
                          .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_pre_memory_approval_freshness_advisory
                          .label
                      }
                    </p>
                    <p className="loops-status-line">
                      {
                        worktreeDetail
                          .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_pre_memory_approval_freshness_advisory
                          .advisory
                      }
                    </p>
                    <p className="loops-status-line">
                      {
                        worktreeDetail
                          .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_pre_memory_approval_freshness_advisory
                          .not_decision
                      }
                    </p>
                    <p className="loops-status-line">
                      {
                        worktreeDetail
                          .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_pre_memory_approval_freshness_advisory
                          .reason
                      }
                    </p>
                    <p className="loops-status-line">
                      No post-memory-approval retry renewed-memory-approval
                      post-submit retry pre-memory-approval freshness advisory
                      writes or external calls
                    </p>
                  </div>
                )}
                {worktreeDetail.continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_collection_reminder && (
                  <div className="loop-review-item">
                    <p className="loops-status-line">
                      {
                        worktreeDetail
                          .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_collection_reminder
                          .label
                      }
                    </p>
                    <p className="loops-status-line">
                      {
                        worktreeDetail
                          .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_collection_reminder
                          .reminder
                      }
                    </p>
                    <p className="loops-status-line">
                      {
                        worktreeDetail
                          .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_collection_reminder
                          .not_automated
                      }
                    </p>
                    <p className="loops-status-line">
                      {
                        worktreeDetail
                          .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_collection_reminder
                          .reason
                      }
                    </p>
                    <p className="loops-status-line">
                      No post-memory-approval retry renewed-memory-approval
                      post-submit retry renewed-memory-approval collection
                      reminder writes or external calls
                    </p>
                  </div>
                )}
                {worktreeDetail.continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_collection_result_non_persistence_note && (
                  <div className="loop-review-item">
                    <p className="loops-status-line">
                      {
                        worktreeDetail
                          .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_collection_result_non_persistence_note
                          .label
                      }
                    </p>
                    <p className="loops-status-line">
                      {
                        worktreeDetail
                          .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_collection_result_non_persistence_note
                          .result_scope
                      }
                    </p>
                    <p className="loops-status-line">
                      {
                        worktreeDetail
                          .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_collection_result_non_persistence_note
                          .not_stored
                      }
                    </p>
                    <p className="loops-status-line">
                      {
                        worktreeDetail
                          .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_collection_result_non_persistence_note
                          .reason
                      }
                    </p>
                    <p className="loops-status-line">
                      No post-memory-approval retry renewed-memory-approval
                      post-submit retry renewed-memory-approval collection result
                      persistence writes or external calls
                    </p>
                  </div>
                )}
                {worktreeDetail.continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_collection_uncertainty_reminder && (
                  <div className="loop-review-item">
                    <p className="loops-status-line">
                      {
                        worktreeDetail
                          .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_collection_uncertainty_reminder
                          .label
                      }
                    </p>
                    <p className="loops-status-line">
                      {
                        worktreeDetail
                          .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_collection_uncertainty_reminder
                          .reminder
                      }
                    </p>
                    <p className="loops-status-line">
                      {
                        worktreeDetail
                          .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_collection_uncertainty_reminder
                          .not_automated
                      }
                    </p>
                    <p className="loops-status-line">
                      {
                        worktreeDetail
                          .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_collection_uncertainty_reminder
                          .reason
                      }
                    </p>
                    <p className="loops-status-line">
                      No post-memory-approval retry renewed-memory-approval
                      post-submit retry renewed-memory-approval collection
                      uncertainty writes or external calls
                    </p>
                  </div>
                )}
                {worktreeDetail.continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_pre_merge_freshness_advisory && (
                  <div className="loop-review-item">
                    <p className="loops-status-line">
                      {
                        worktreeDetail
                          .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_pre_merge_freshness_advisory
                          .label
                      }
                    </p>
                    <p className="loops-status-line">
                      {
                        worktreeDetail
                          .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_pre_merge_freshness_advisory
                          .advisory
                      }
                    </p>
                    <p className="loops-status-line">
                      {
                        worktreeDetail
                          .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_pre_merge_freshness_advisory
                          .not_decision
                      }
                    </p>
                    <p className="loops-status-line">
                      {
                        worktreeDetail
                          .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_pre_merge_freshness_advisory
                          .reason
                      }
                    </p>
                    <p className="loops-status-line">
                      No post-memory-approval retry renewed-memory-approval
                      post-submit retry renewed-memory-approval pre-merge
                      freshness advisory writes or external calls
                    </p>
                  </div>
                )}
                {worktreeDetail.continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_pre_handoff_freshness_advisory && (
                  <div className="loop-review-item">
                    <p className="loops-status-line">
                      {
                        worktreeDetail
                          .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_pre_handoff_freshness_advisory
                          .label
                      }
                    </p>
                    <p className="loops-status-line">
                      {
                        worktreeDetail
                          .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_pre_handoff_freshness_advisory
                          .advisory
                      }
                    </p>
                    <p className="loops-status-line">
                      {
                        worktreeDetail
                          .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_pre_handoff_freshness_advisory
                          .not_decision
                      }
                    </p>
                    <p className="loops-status-line">
                      {
                        worktreeDetail
                          .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_pre_handoff_freshness_advisory
                          .reason
                      }
                    </p>
                    <p className="loops-status-line">
                      No post-memory-approval retry renewed-memory-approval
                      post-submit retry renewed-memory-approval pre-handoff
                      freshness advisory writes or external calls
                    </p>
                  </div>
                )}
                {worktreeDetail.continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_pre_paste_freshness_advisory && (
                  <div className="loop-review-item">
                    <p className="loops-status-line">
                      {
                        worktreeDetail
                          .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_pre_paste_freshness_advisory
                          .label
                      }
                    </p>
                    <p className="loops-status-line">
                      {
                        worktreeDetail
                          .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_pre_paste_freshness_advisory
                          .advisory
                      }
                    </p>
                    <p className="loops-status-line">
                      {
                        worktreeDetail
                          .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_pre_paste_freshness_advisory
                          .not_decision
                      }
                    </p>
                    <p className="loops-status-line">
                      {
                        worktreeDetail
                          .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_pre_paste_freshness_advisory
                          .reason
                      }
                    </p>
                    <p className="loops-status-line">
                      No post-memory-approval retry renewed-memory-approval
                      post-submit retry renewed-memory-approval pre-paste
                      freshness advisory writes or external calls
                    </p>
                  </div>
                )}
                {worktreeDetail.continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_pre_submit_freshness_advisory && (
                  <div className="loop-review-item">
                    <p className="loops-status-line">
                      {
                        worktreeDetail
                          .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_pre_submit_freshness_advisory
                          .label
                      }
                    </p>
                    <p className="loops-status-line">
                      {
                        worktreeDetail
                          .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_pre_submit_freshness_advisory
                          .advisory
                      }
                    </p>
                    <p className="loops-status-line">
                      {
                        worktreeDetail
                          .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_pre_submit_freshness_advisory
                          .not_decision
                      }
                    </p>
                    <p className="loops-status-line">
                      {
                        worktreeDetail
                          .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_pre_submit_freshness_advisory
                          .reason
                      }
                    </p>
                    <p className="loops-status-line">
                      No post-memory-approval retry renewed-memory-approval
                      post-submit retry renewed-memory-approval pre-submit
                      freshness advisory writes or external calls
                    </p>
                  </div>
                )}
                {worktreeDetail.continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_freshness_advisory && (
                  <div className="loop-review-item">
                    <p className="loops-status-line">
                      {
                        worktreeDetail
                          .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_freshness_advisory
                          .label
                      }
                    </p>
                    <p className="loops-status-line">
                      {
                        worktreeDetail
                          .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_freshness_advisory
                          .advisory
                      }
                    </p>
                    <p className="loops-status-line">
                      {
                        worktreeDetail
                          .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_freshness_advisory
                          .not_automated
                      }
                    </p>
                    <p className="loops-status-line">
                      {
                        worktreeDetail
                          .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_freshness_advisory
                          .reason
                      }
                    </p>
                    <p className="loops-status-line">
                      No post-memory-approval retry renewed-memory-approval
                      post-submit retry renewed-memory-approval post-submit
                      freshness advisory writes or external calls
                    </p>
                  </div>
                )}
                {worktreeDetail.continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_result_non_persistence_note && (
                  <div className="loop-review-item">
                    <p className="loops-status-line">
                      {
                        worktreeDetail
                          .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_result_non_persistence_note
                          .label
                      }
                    </p>
                    <p className="loops-status-line">
                      {
                        worktreeDetail
                          .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_result_non_persistence_note
                          .result_scope
                      }
                    </p>
                    <p className="loops-status-line">
                      {
                        worktreeDetail
                          .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_result_non_persistence_note
                          .not_stored
                      }
                    </p>
                    <p className="loops-status-line">
                      {
                        worktreeDetail
                          .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_result_non_persistence_note
                          .reason
                      }
                    </p>
                    <p className="loops-status-line">
                      No post-memory-approval retry renewed-memory-approval
                      post-submit retry renewed-memory-approval post-submit
                      collection result persistence writes or external calls
                    </p>
                  </div>
                )}
                {worktreeDetail.continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_uncertainty_reminder && (
                  <div className="loop-review-item">
                    <p className="loops-status-line">
                      {
                        worktreeDetail
                          .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_uncertainty_reminder
                          .label
                      }
                    </p>
                    <p className="loops-status-line">
                      {
                        worktreeDetail
                          .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_uncertainty_reminder
                          .reminder
                      }
                    </p>
                    <p className="loops-status-line">
                      {
                        worktreeDetail
                          .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_uncertainty_reminder
                          .not_automated
                      }
                    </p>
                    <p className="loops-status-line">
                      {
                        worktreeDetail
                          .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_uncertainty_reminder
                          .reason
                      }
                    </p>
                    <p className="loops-status-line">
                      No post-memory-approval retry renewed-memory-approval
                      post-submit retry renewed-memory-approval post-submit
                      collection uncertainty writes or external calls
                    </p>
                  </div>
                )}
                {worktreeDetail.continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_pre_merge_freshness_advisory && (
                  <div className="loop-review-item">
                    <p className="loops-status-line">
                      {
                        worktreeDetail
                          .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_pre_merge_freshness_advisory
                          .label
                      }
                    </p>
                    <p className="loops-status-line">
                      {
                        worktreeDetail
                          .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_pre_merge_freshness_advisory
                          .advisory
                      }
                    </p>
                    <p className="loops-status-line">
                      {
                        worktreeDetail
                          .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_pre_merge_freshness_advisory
                          .not_decision
                      }
                    </p>
                    <p className="loops-status-line">
                      {
                        worktreeDetail
                          .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_pre_merge_freshness_advisory
                          .reason
                      }
                    </p>
                    <p className="loops-status-line">
                      No post-memory-approval retry renewed-memory-approval
                      post-submit retry renewed-memory-approval post-submit
                      collection pre-merge freshness advisory writes or external
                      calls
                    </p>
                  </div>
                )}
                {worktreeDetail.continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_pre_handoff_freshness_advisory && (
                  <div className="loop-review-item">
                    <p className="loops-status-line">
                      {
                        worktreeDetail
                          .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_pre_handoff_freshness_advisory
                          .label
                      }
                    </p>
                    <p className="loops-status-line">
                      {
                        worktreeDetail
                          .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_pre_handoff_freshness_advisory
                          .advisory
                      }
                    </p>
                    <p className="loops-status-line">
                      {
                        worktreeDetail
                          .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_pre_handoff_freshness_advisory
                          .not_decision
                      }
                    </p>
                    <p className="loops-status-line">
                      {
                        worktreeDetail
                          .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_pre_handoff_freshness_advisory
                          .reason
                      }
                    </p>
                    <p className="loops-status-line">
                      No post-memory-approval retry renewed-memory-approval
                      post-submit retry renewed-memory-approval post-submit
                      collection pre-handoff freshness advisory writes or
                      external calls
                    </p>
                  </div>
                )}
                {worktreeDetail.continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_pre_paste_freshness_advisory && (
                  <div className="loop-review-item">
                    <p className="loops-status-line">
                      {
                        worktreeDetail
                          .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_pre_paste_freshness_advisory
                          .label
                      }
                    </p>
                    <p className="loops-status-line">
                      {
                        worktreeDetail
                          .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_pre_paste_freshness_advisory
                          .advisory
                      }
                    </p>
                    <p className="loops-status-line">
                      {
                        worktreeDetail
                          .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_pre_paste_freshness_advisory
                          .not_decision
                      }
                    </p>
                    <p className="loops-status-line">
                      {
                        worktreeDetail
                          .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_pre_paste_freshness_advisory
                          .reason
                      }
                    </p>
                    <p className="loops-status-line">
                      No post-memory-approval retry renewed-memory-approval
                      post-submit retry renewed-memory-approval post-submit
                      collection pre-paste freshness advisory writes or external
                      calls
                    </p>
                  </div>
                )}
                {worktreeDetail.continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_pre_submit_freshness_advisory && (
                  <div className="loop-review-item">
                    <p className="loops-status-line">
                      {
                        worktreeDetail
                          .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_pre_submit_freshness_advisory
                          .label
                      }
                    </p>
                    <p className="loops-status-line">
                      {
                        worktreeDetail
                          .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_pre_submit_freshness_advisory
                          .advisory
                      }
                    </p>
                    <p className="loops-status-line">
                      {
                        worktreeDetail
                          .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_pre_submit_freshness_advisory
                          .not_decision
                      }
                    </p>
                    <p className="loops-status-line">
                      {
                        worktreeDetail
                          .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_pre_submit_freshness_advisory
                          .reason
                      }
                    </p>
                    <p className="loops-status-line">
                      No post-memory-approval retry renewed-memory-approval
                      post-submit retry renewed-memory-approval post-submit
                      collection pre-submit freshness advisory writes or
                      external calls
                    </p>
                  </div>
                )}
                {worktreeDetail.continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_post_submit_freshness_advisory && (
                  <div className="loop-review-item">
                    <p className="loops-status-line">
                      {
                        worktreeDetail
                          .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_post_submit_freshness_advisory
                          .label
                      }
                    </p>
                    <p className="loops-status-line">
                      {
                        worktreeDetail
                          .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_post_submit_freshness_advisory
                          .advisory
                      }
                    </p>
                    <p className="loops-status-line">
                      {
                        worktreeDetail
                          .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_post_submit_freshness_advisory
                          .not_monitored
                      }
                    </p>
                    <p className="loops-status-line">
                      {
                        worktreeDetail
                          .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_post_submit_freshness_advisory
                          .reason
                      }
                    </p>
                    <p className="loops-status-line">
                      No post-memory-approval retry renewed-memory-approval
                      post-submit retry renewed-memory-approval post-submit
                      collection post-submit freshness advisory writes or
                      external calls
                    </p>
                  </div>
                )}
                {worktreeDetail.continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_freshness_result_non_persistence_note && (
                  <div className="loop-review-item">
                    <p className="loops-status-line">
                      {
                        worktreeDetail
                          .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_freshness_result_non_persistence_note
                          .label
                      }
                    </p>
                    <p className="loops-status-line">
                      {
                        worktreeDetail
                          .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_freshness_result_non_persistence_note
                          .not_stored
                      }
                    </p>
                    <p className="loops-status-line">
                      {
                        worktreeDetail
                          .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_freshness_result_non_persistence_note
                          .not_detected
                      }
                    </p>
                    <p className="loops-status-line">
                      {
                        worktreeDetail
                          .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_freshness_result_non_persistence_note
                          .reason
                      }
                    </p>
                    <p className="loops-status-line">
                      No post-memory-approval retry renewed-memory-approval
                      post-submit retry renewed-memory-approval post-submit
                      collection freshness result persistence writes or external
                      calls
                    </p>
                  </div>
                )}
                {worktreeDetail.continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_freshness_uncertainty_collection_reminder && (
                  <LoopReviewItem
                    footer="No post-memory-approval retry renewed-memory-approval post-submit retry renewed-memory-approval post-submit collection freshness uncertainty collection writes or external calls"
                    lines={[
                      worktreeDetail
                        .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_freshness_uncertainty_collection_reminder
                        .label,
                      worktreeDetail
                        .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_freshness_uncertainty_collection_reminder
                        .reminder,
                      worktreeDetail
                        .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_freshness_uncertainty_collection_reminder
                        .not_automated,
                      worktreeDetail
                        .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_freshness_uncertainty_collection_reminder
                        .reason,
                    ]}
                  />
                )}
                {worktreeDetail.paste_destination && (
                  <div className="loop-review-item">
                    <p className="loops-status-line">
                      {worktreeDetail.paste_destination.label}
                    </p>
                    <p className="loops-status-line">
                      {worktreeDetail.paste_destination.targets.join(" or ")}
                    </p>
                    <p className="loops-status-line">
                      {worktreeDetail.paste_destination.instruction}
                    </p>
                    <p className="loops-status-line">
                      {worktreeDetail.paste_destination.reason}
                    </p>
                    <p className="loops-status-line">
                      No automatic submission, file writes, or external calls
                    </p>
                  </div>
                )}
                {worktreeDetail.handoff_checklist && (
                  <div className="loop-review-item">
                    <p className="loops-status-line">
                      {worktreeDetail.handoff_checklist.label}
                    </p>
                    {worktreeDetail.handoff_checklist.steps.map((step) => (
                      <p className="loops-status-line" key={step}>
                        {step}
                      </p>
                    ))}
                    <p className="loops-status-line">
                      {worktreeDetail.handoff_checklist.reason}
                    </p>
                    <p className="loops-status-line">
                      No handoff checklist writes or external calls
                    </p>
                  </div>
                )}
                {worktreeDetail.post_handoff_reminder && (
                  <div className="loop-review-item">
                    <p className="loops-status-line">
                      {worktreeDetail.post_handoff_reminder.label}
                    </p>
                    <p className="loops-status-line">
                      {worktreeDetail.post_handoff_reminder.collect_next}
                    </p>
                    <p className="loops-status-line">
                      {
                        worktreeDetail.post_handoff_reminder
                          .not_memory_approval
                      }
                    </p>
                    <p className="loops-status-line">
                      {worktreeDetail.post_handoff_reminder.not_merge}
                    </p>
                    <p className="loops-status-line">
                      {worktreeDetail.post_handoff_reminder.reason}
                    </p>
                    <p className="loops-status-line">
                      No post-handoff writes or external calls
                    </p>
                  </div>
                )}
                {worktreeDetail.source_of_truth_note && (
                  <div className="loop-review-item">
                    <p className="loops-status-line">
                      {worktreeDetail.source_of_truth_note.label}
                    </p>
                    <p className="loops-status-line">
                      {worktreeDetail.source_of_truth_note.local_memory_input}
                    </p>
                    <p className="loops-status-line">
                      {
                        worktreeDetail.source_of_truth_note
                          .not_transcript_import
                      }
                    </p>
                    <p className="loops-status-line">
                      {worktreeDetail.source_of_truth_note.reason}
                    </p>
                    <p className="loops-status-line">
                      No transcript storage, file writes, or external calls
                    </p>
                  </div>
                )}
                {worktreeDetail.privacy_boundary_note && (
                  <div className="loop-review-item">
                    <p className="loops-status-line">
                      {worktreeDetail.privacy_boundary_note.label}
                    </p>
                    <p className="loops-status-line">
                      {worktreeDetail.privacy_boundary_note.storage_scope}
                    </p>
                    <p className="loops-status-line">
                      {worktreeDetail.privacy_boundary_note.does_not_store}
                    </p>
                    <p className="loops-status-line">
                      {worktreeDetail.privacy_boundary_note.reason}
                    </p>
                    <p className="loops-status-line">
                      Local only, no file writes or external calls
                    </p>
                  </div>
                )}
                {worktreeDetail.operator_review_gate && (
                  <div className="loop-review-item">
                    <p className="loops-status-line">
                      {worktreeDetail.operator_review_gate.label}
                    </p>
                    <p className="loops-status-line">
                      {worktreeDetail.operator_review_gate.review_step}
                    </p>
                    <p className="loops-status-line">
                      {worktreeDetail.operator_review_gate.manual_submit}
                    </p>
                    <p className="loops-status-line">
                      {worktreeDetail.operator_review_gate.does_not}
                    </p>
                    <p className="loops-status-line">
                      No automatic submission, file writes, or external calls
                    </p>
                  </div>
                )}
                {worktreeDetail.collection_responsibility_note && (
                  <div className="loop-review-item">
                    <p className="loops-status-line">
                      {worktreeDetail.collection_responsibility_note.label}
                    </p>
                    <p className="loops-status-line">
                      {
                        worktreeDetail.collection_responsibility_note
                          .responsible_party
                      }
                    </p>
                    <p className="loops-status-line">
                      {worktreeDetail.collection_responsibility_note.trigger}
                    </p>
                    <p className="loops-status-line">
                      {worktreeDetail.collection_responsibility_note.does_not}
                    </p>
                    <p className="loops-status-line">
                      No automatic collection, file writes, or external calls
                    </p>
                  </div>
                )}
                {worktreeDetail.pre_merge_advisory && (
                  <div className="loop-review-item">
                    <p className="loops-status-line">
                      {worktreeDetail.pre_merge_advisory.label}
                    </p>
                    <p className="loops-status-line">
                      {worktreeDetail.pre_merge_advisory.hold_merge}
                    </p>
                    <p className="loops-status-line">
                      {worktreeDetail.pre_merge_advisory.reason}
                    </p>
                    <p className="loops-status-line">
                      {worktreeDetail.pre_merge_advisory.not_memory_approval}
                    </p>
                    <p className="loops-status-line">
                      No merge decision writes, file writes, or external calls
                    </p>
                  </div>
                )}
                {worktreeDetail.post_collection_review_note && (
                  <div className="loop-review-item">
                    <p className="loops-status-line">
                      {worktreeDetail.post_collection_review_note.label}
                    </p>
                    <p className="loops-status-line">
                      {worktreeDetail.post_collection_review_note.review_step}
                    </p>
                    <p className="loops-status-line">
                      {
                        worktreeDetail.post_collection_review_note
                          .before_memory_approval
                      }
                    </p>
                    <p className="loops-status-line">
                      {worktreeDetail.post_collection_review_note.before_merge}
                    </p>
                    <p className="loops-status-line">
                      No memory writes, merge decision writes, or external calls
                    </p>
                  </div>
                )}
              </div>
            )}
            {worktreeDetail.latest_decision && (
              <p className="loops-status-line">
                Latest decision {worktreeDetail.latest_decision.decision}{" "}
                {worktreeDetail.latest_decision.reason}
              </p>
            )}
            {worktreeDetail.review_packet_summary && (
              <div className="loop-detail-section">
                <p className="loop-detail-section-title">
                  Merge review guidance
                </p>
                <p className="loops-status-line">Review packet summary</p>
                <p className="loops-status-line">
                  {worktreeDetail.review_packet_summary.summary}
                </p>
                <p className="loops-status-line">
                  Next {worktreeDetail.review_packet_summary.next_action}
                </p>
                <p className="loops-status-line">
                  Worktree action{" "}
                  {worktreeDetail.review_packet_summary.worktree_action}
                </p>
                <div className="loop-review-grid">
                  <div className="loop-review-item">
                    <p className="loops-status-line">
                      {
                        worktreeDetail.review_packet_summary.readiness_summary
                          .label
                      }
                    </p>
                    <p className="loops-status-line">
                      {
                        worktreeDetail.review_packet_summary.readiness_summary
                          .status
                      }{" "}
                      {
                        worktreeDetail.review_packet_summary.readiness_summary
                          .reason
                      }
                    </p>
                  </div>
                  <div className="loop-review-item">
                    <p className="loops-status-line">
                      {
                        worktreeDetail.review_packet_summary.brief_rationale
                          .label
                      }
                    </p>
                    <p className="loops-status-line">
                      {
                        worktreeDetail.review_packet_summary.brief_rationale
                          .reason
                      }
                    </p>
                    <p className="loops-status-line">
                      Next{" "}
                      {
                        worktreeDetail.review_packet_summary.brief_rationale
                          .next_action
                      }
                    </p>
                    <p className="loops-status-line">
                      Merge gate{" "}
                      {
                        worktreeDetail.review_packet_summary.brief_rationale
                          .merge_gate
                      }
                    </p>
                  </div>
                  <div className="loop-review-item">
                    <p className="loop-detail-section-title">
                      Evidence guidance
                    </p>
                    <p className="loops-status-line">
                      {
                        worktreeDetail.review_packet_summary
                          .evidence_count_explanation.label
                      }
                    </p>
                    <p className="loops-status-line">
                      {
                        worktreeDetail.review_packet_summary
                          .evidence_count_explanation.count
                      }{" "}
                      {
                        worktreeDetail.review_packet_summary
                          .evidence_count_explanation.reason
                      }
                    </p>
                  </div>
                </div>
                {worktreeDetail.review_packet_summary
                  .reviewer_checklist_preview.length > 0 && (
                  <div className="loop-review-item">
                    <p className="loops-status-line">
                      Reviewer checklist preview
                    </p>
                    {worktreeDetail.review_packet_summary.reviewer_checklist_preview.map(
                      (item) => (
                        <p className="loops-status-line" key={item.action}>
                          {item.label} {item.status}
                        </p>
                      ),
                    )}
                  </div>
                )}
                <p className="loops-status-line">
                  {worktreeDetail.review_packet_summary.command_hint.label}
                </p>
                <code>
                  {worktreeDetail.review_packet_summary.command_hint.command}
                </code>
                <div className="loop-review-item">
                  <p className="loops-status-line">
                    {
                      worktreeDetail.review_packet_summary.command_hint
                        .provenance.label
                    }
                  </p>
                  <p className="loops-status-line">
                    {
                      worktreeDetail.review_packet_summary.command_hint
                        .provenance.source
                    }
                  </p>
                  <p className="loops-status-line">
                    {
                      worktreeDetail.review_packet_summary.command_hint
                        .provenance.reason
                    }
                  </p>
                  <p className="loops-status-line">
                    No command writes or external calls
                  </p>
                </div>
                {worktreeDetail.review_packet_summary
                  .missing_evidence_explanation && (
                  <div className="loop-review-item">
                    <p className="loops-status-line">
                      {
                        worktreeDetail.review_packet_summary
                          .missing_evidence_explanation.label
                      }
                    </p>
                    <p className="loops-status-line">
                      {
                        worktreeDetail.review_packet_summary
                          .missing_evidence_explanation.reason
                      }
                    </p>
                    <p className="loops-status-line">
                      Next{" "}
                      {
                        worktreeDetail.review_packet_summary
                          .missing_evidence_explanation.next_action
                      }
                    </p>
                  </div>
                )}
              </div>
            )}
            <div className="loop-memory-action">
              <code>Continue {worktreeDetail.worktree}</code>
              <button
                className="loop-copy-button"
                disabled={!onCopySelectedBrief || selectedBriefBusy}
                onClick={() => void copySelectedBrief()}
                title="Copy selected worktree continuation brief"
                type="button"
              >
                <Copy aria-hidden size={15} />
                {selectedBriefCopied
                  ? "Copied selected brief"
                  : "Copy selected brief"}
              </button>
            </div>
          </div>
          <div className="loop-row loop-row-head">
            <span>Loop</span>
            <span>Project</span>
            <span>Signals</span>
            <span>Outcome</span>
          </div>
          {worktreeDetail.items.map((loop) => (
            <div className="loop-row" key={loop.id}>
              <div className="loop-primary">
                <strong>{loop.id}</strong>
                <span>{formatDate(loop.created_at)}</span>
                <span>
                  {loop.tool} / {loop.source}
                </span>
              </div>
              <div>
                <strong>{loop.project}</strong>
                {loop.branch && (
                  <span className="loop-muted">{loop.branch}</span>
                )}
                {loop.worktree && (
                  <span className="loop-muted">{loop.worktree}</span>
                )}
              </div>
              <div className="loop-signals">
                <span>{loop.prompt_count} prompts</span>
                {loop.average_prompt_score !== undefined && (
                  <span>{loop.average_prompt_score}/100 avg</span>
                )}
                {loop.top_gaps.slice(0, 2).map((gap) => (
                  <span key={gap}>{gap}</span>
                ))}
              </div>
              <div className="loop-next">
                <span>{loop.outcome_status}</span>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="loop-table panel">
        <div className="loop-row loop-row-head">
          <span>Loop</span>
          <span>Project</span>
          <span>Signals</span>
          <span>Next</span>
        </div>
        {items.map((loop) => (
          <LoopRow key={loop.id} loop={loop} />
        ))}
      </div>
    </section>
  );
}

export type CommandCenterBriefSelection = {
  worktree: string;
  branch?: string;
};

function pluralize(count: number, singular: string): string {
  return count === 1 ? singular : `${singular}s`;
}

function LoopRow({ loop }: { loop: LoopSummary }) {
  const needsRefresh = Boolean(loop.compact_boundary?.after_latest_snapshot);
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);

  async function copyNextBrief(): Promise<void> {
    setBusy(true);
    try {
      const brief = await getLoopBrief(loop.id);
      const didCopy = await copyTextToClipboard(brief.prompt);
      if (!didCopy) return;

      setCopied(true);
      window.setTimeout(() => setCopied(false), 2_500);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="loop-row">
      <div className="loop-primary">
        <strong>{loop.id}</strong>
        <span>{formatDate(loop.created_at)}</span>
        <span>
          {loop.tool} / {loop.source}
        </span>
      </div>
      <div>
        <strong>{loop.project}</strong>
        {loop.branch && <span className="loop-muted">{loop.branch}</span>}
        {loop.worktree && <span className="loop-muted">{loop.worktree}</span>}
      </div>
      <div className="loop-signals">
        <span>{loop.prompt_count} prompts</span>
        {loop.average_prompt_score !== undefined && (
          <span>{loop.average_prompt_score}/100 avg</span>
        )}
        <span>{loop.outcome_status}</span>
        {loop.top_gaps.slice(0, 2).map((gap) => (
          <span key={gap}>{gap}</span>
        ))}
      </div>
      <div className="loop-next">
        {needsRefresh ? (
          <>
            <span className="status-pill warning">Compact boundary</span>
            <span>
              {loop.compact_boundary?.event_name} at{" "}
              {loop.compact_boundary
                ? formatDate(loop.compact_boundary.created_at)
                : ""}
            </span>
            <code>prompt-coach loop collect</code>
          </>
        ) : (
          <>
            <span className="status-pill good">Current</span>
            <code>prompt-coach loop brief</code>
          </>
        )}
        <button
          aria-label={`Copy next brief for ${loop.id}`}
          className="loop-copy-button"
          disabled={busy}
          onClick={() => void copyNextBrief()}
          title="Copy next brief"
          type="button"
        >
          {copied ? <ShieldCheck size={15} /> : <Copy size={15} />}
          {copied ? "Copied brief" : busy ? "Preparing..." : "Copy brief"}
        </button>
      </div>
    </div>
  );
}
