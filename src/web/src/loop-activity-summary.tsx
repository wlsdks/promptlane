import { FileText, ShieldCheck } from "lucide-react";

import type { LoopListResponse } from "./api.js";
import { LoopCommandCenterSummary } from "./loop-command-center-summary.js";
import type { CommandCenterBriefSelection } from "./loops-view.js";

type LoopStatus = LoopListResponse["status"];

export function LoopActivitySummary({
  approvalBusy,
  approvalRecorded,
  commandCenterBriefBusy,
  commandCenterBriefCopied,
  onApproveMemoryCandidate,
  onCopyCommandCenterBrief,
  onReviewInstructionPatch,
  onSelectWorktree,
  patchBusy,
  status,
}: {
  approvalBusy: boolean;
  approvalRecorded: boolean;
  commandCenterBriefBusy?: string;
  commandCenterBriefCopied?: string;
  onApproveMemoryCandidate?: () => Promise<void>;
  onCopyCommandCenterBrief?: (
    selection: CommandCenterBriefSelection,
  ) => Promise<void>;
  onReviewInstructionPatch: () => Promise<void>;
  onSelectWorktree?: (worktree: string) => Promise<void>;
  patchBusy: boolean;
  status: LoopStatus;
}) {
  return (
    <>
      <p className="loops-status-line">
        Approved memories {status.project_memory.approved_count}
      </p>
      <p className="loops-status-line">
        Active worktrees {status.activity.active_worktrees}
      </p>
      <p className="loops-status-line">
        Active sessions {status.activity.active_sessions}
      </p>
      {status.activity.needs_review && (
        <p className="loops-status-line">Worktree review needed</p>
      )}
      <LoopCommandCenterSummary
        activity={status.activity}
        busyWorktree={commandCenterBriefBusy}
        copiedWorktree={commandCenterBriefCopied}
        onCopyCommandCenterBrief={onCopyCommandCenterBrief}
      />
      {status.activity.recent_decisions &&
        status.activity.recent_decisions.length > 0 && (
          <div>
            <p className="loops-status-line">Recent decisions</p>
            {status.activity.recent_decisions.map((decision) => (
              <p
                className="loops-status-line"
                key={`${decision.snapshot_id}:${decision.created_at}`}
              >
                {decision.worktree} {decision.decision} {decision.reason}
              </p>
            ))}
          </div>
        )}
      {status.activity.worktrees.slice(0, 2).map((worktree) => (
        <div className="loop-worktree-line" key={worktree.worktree}>
          <p className="loops-status-line">
            {worktree.worktree} {worktree.snapshots}{" "}
            {pluralize(worktree.snapshots, "snapshot")} / {worktree.sessions}{" "}
            {pluralize(worktree.sessions, "session")}
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
      {status.memory_candidate && (
        <p className="loops-status-line">
          Memory candidate{" "}
          {status.memory_candidate.eligible
            ? "eligible"
            : status.memory_candidate.reason}
        </p>
      )}
      {status.memory_candidate?.eligible && (
        <div className="loop-memory-action">
          <code>{status.memory_candidate.next_action}</code>
          <button
            className="loop-copy-button"
            disabled={approvalBusy || !onApproveMemoryCandidate}
            onClick={() => void onApproveMemoryCandidate?.()}
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
      {status.project_memory.approved_count > 0 && (
        <div className="loop-memory-action">
          <code>promptlane loop instruction-patch --target-file AGENTS.md</code>
          <button
            className="loop-copy-button"
            disabled={patchBusy}
            onClick={() => void onReviewInstructionPatch()}
            title="Review AGENTS.md instruction patch"
            type="button"
          >
            <FileText size={15} />
            {patchBusy ? "Preparing..." : "Review AGENTS.md patch"}
          </button>
        </div>
      )}
      <p className="loops-status-line">Next: {status.next_action}</p>
    </>
  );
}

function pluralize(count: number, singular: string): string {
  return count === 1 ? singular : `${singular}s`;
}
