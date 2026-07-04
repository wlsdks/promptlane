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
                  <div className="loop-review-item">
                    <p className="loops-status-line">
                      {worktreeDetail.command_distinction.label}
                    </p>
                    <p className="loops-status-line">
                      {
                        worktreeDetail.command_distinction
                          .selected_command_role
                      }
                    </p>
                    <p className="loops-status-line">
                      {worktreeDetail.command_distinction.review_command_role}
                    </p>
                    <p className="loops-status-line">
                      {worktreeDetail.command_distinction.reason}
                    </p>
                    <p className="loops-status-line">
                      No distinction writes or external calls
                    </p>
                  </div>
                )}
                {worktreeDetail.command_filters && (
                  <div className="loop-review-item">
                    <p className="loops-status-line">
                      {worktreeDetail.command_filters.label}
                    </p>
                    <p className="loops-status-line">
                      Selected filters{" "}
                      {worktreeDetail.command_filters.selected_command_filters.join(
                        ", ",
                      )}
                    </p>
                    <p className="loops-status-line">
                      Review filters{" "}
                      {worktreeDetail.command_filters.review_command_filters.join(
                        ", ",
                      )}
                    </p>
                    <p className="loops-status-line">
                      {worktreeDetail.command_filters.reason}
                    </p>
                    <p className="loops-status-line">
                      No filter explanation writes or external calls
                    </p>
                  </div>
                )}
                {worktreeDetail.copy_side_effects && (
                  <div className="loop-review-item">
                    <p className="loops-status-line">
                      {worktreeDetail.copy_side_effects.label}
                    </p>
                    <p className="loops-status-line">
                      {worktreeDetail.copy_side_effects.clipboard}
                    </p>
                    <p className="loops-status-line">
                      {worktreeDetail.copy_side_effects.ui_feedback}
                    </p>
                    <p className="loops-status-line">
                      {worktreeDetail.copy_side_effects.does_not}
                    </p>
                    <p className="loops-status-line">
                      No copy side-effect writes or external calls
                    </p>
                  </div>
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
