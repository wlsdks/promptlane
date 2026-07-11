import { useState } from "react";

import type {
  LoopInstructionPatchProposal,
  LoopListResponse,
  LoopWorktreeResponse,
} from "./api.js";
import { getLoopInstructionPatch } from "./api.js";
import { LoopActivitySummary } from "./loop-activity-summary.js";
import { LoopBenchmarkReadiness } from "./loop-benchmark-readiness.js";
import { LoopInstructionPatchPanel } from "./loop-instruction-patch-panel.js";
import type { LoopOutcomeInput } from "./loop-outcome-form.js";
import { LoopRows, LoopWorktreeDetailRows } from "./loop-rows.js";
import { LoopSelectedBriefAction } from "./loop-selected-brief-action.js";
import { LoopEmptyState, LoopLoadingState } from "./loop-shell-states.js";
import { LoopWorktreeContinuationSafetyItems } from "./loop-worktree-continuation-safety-items.js";
import { LoopWorktreeDetailHeader } from "./loop-worktree-detail-header.js";
import { LoopWorktreeMergeReviewSummary } from "./loop-worktree-merge-review-summary.js";
import { LoopWorktreeOutcomePanel } from "./loop-worktree-outcome-panel.js";
import { LoopWorktreeSelectedBriefGuidance } from "./loop-worktree-selected-brief-guidance.js";

import "./loops-view.css";

export function LoopsView({
  loading,
  loops,
  onApproveMemoryCandidate,
  onApproveSelectedMemory,
  onCopyCommandCenterBrief,
  onCopySelectedBrief,
  onRecordOutcome,
  onSelectWorktree,
  worktreeDetail,
}: {
  loading: boolean;
  loops?: LoopListResponse;
  onApproveMemoryCandidate?: () => Promise<void>;
  onApproveSelectedMemory?: (snapshotId: string) => Promise<void>;
  onCopyCommandCenterBrief?: (
    selection: CommandCenterBriefSelection,
  ) => Promise<void>;
  onCopySelectedBrief?: (detail: LoopWorktreeResponse) => Promise<void>;
  onRecordOutcome?: (
    snapshotId: string,
    input: LoopOutcomeInput,
  ) => Promise<void>;
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
    return <LoopLoadingState />;
  }

  if (!loops || items.length === 0) {
    return (
      <LoopEmptyState
        nextActions={loops?.status.next_actions}
        status={loops?.status.status}
      />
    );
  }

  return (
    <section className="loops-view" aria-label="Loop snapshots">
      <div className="panel loops-summary">
        <div>
          <span className="panel-eyebrow">LoopRelay</span>
          <h2>{items.length} loop snapshots</h2>
          <p className="loops-status-line">
            LoopRelay status {loops.status.status}
          </p>
          <LoopActivitySummary
            approvalBusy={approvalBusy}
            approvalRecorded={approvalRecorded}
            commandCenterBriefBusy={commandCenterBriefBusy}
            commandCenterBriefCopied={commandCenterBriefCopied}
            onApproveMemoryCandidate={approveCandidate}
            onCopyCommandCenterBrief={copyCommandCenterBrief}
            onReviewInstructionPatch={reviewInstructionPatch}
            onSelectWorktree={onSelectWorktree}
            patchBusy={patchBusy}
            status={loops.status}
          />
          <LoopBenchmarkReadiness readiness={loops.benchmark_readiness} />
          <p>
            Recent local agent loops grouped by safe project metadata. Compact
            markers show when a fresh snapshot should be collected.
          </p>
        </div>
        <div className="privacy-note">
          No prompt bodies, raw paths, transcript content, or compact summaries.
        </div>
      </div>
      <LoopInstructionPatchPanel proposal={patchProposal} />
      {worktreeDetail && (
        <div className="loop-table panel">
          <div className="loop-worktree-detail">
            <LoopWorktreeDetailHeader worktreeDetail={worktreeDetail} />
            <LoopWorktreeOutcomePanel
              detail={worktreeDetail}
              onApprove={onApproveSelectedMemory}
              onRecord={onRecordOutcome}
            />
            <LoopWorktreeSelectedBriefGuidance worktreeDetail={worktreeDetail}>
              <LoopWorktreeContinuationSafetyItems
                worktreeDetail={worktreeDetail}
              />
            </LoopWorktreeSelectedBriefGuidance>
            <LoopWorktreeMergeReviewSummary worktreeDetail={worktreeDetail} />
            <LoopSelectedBriefAction
              busy={selectedBriefBusy}
              copied={selectedBriefCopied}
              onCopySelectedBrief={
                onCopySelectedBrief
                  ? () => {
                      void copySelectedBrief();
                    }
                  : undefined
              }
              worktreeDetail={worktreeDetail}
            />
          </div>
          <LoopWorktreeDetailRows worktreeDetail={worktreeDetail} />
        </div>
      )}
      <LoopRows items={items} />
    </section>
  );
}

export type CommandCenterBriefSelection = {
  worktree: string;
  branch?: string;
};
