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
  onSelectWorktree,
  worktreeDetail,
}: {
  loading: boolean;
  loops?: LoopListResponse;
  onApproveMemoryCandidate?: () => Promise<void>;
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
          <div>
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
                {loop.branch && <span className="loop-muted">{loop.branch}</span>}
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
