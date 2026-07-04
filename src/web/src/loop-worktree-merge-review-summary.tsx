import type { LoopWorktreeResponse } from "./api.js";
import { LoopReviewItem } from "./loop-review-item.js";

export function LoopWorktreeMergeReviewSummary({
  worktreeDetail,
}: {
  worktreeDetail: LoopWorktreeResponse;
}) {
  const summary = worktreeDetail.review_packet_summary;

  if (!summary) return null;

  const checklistFooter = summary.reviewer_checklist_preview.at(-1)
    ? `${summary.reviewer_checklist_preview.at(-1)?.label} ${
        summary.reviewer_checklist_preview.at(-1)?.status
      }`
    : "Reviewer checklist preview";

  return (
    <div className="loop-detail-section">
      <p className="loop-detail-section-title">Merge review guidance</p>
      <p className="loops-status-line">Review packet summary</p>
      <p className="loops-status-line">{summary.summary}</p>
      <p className="loops-status-line">Next {summary.next_action}</p>
      <p className="loops-status-line">
        Worktree action {summary.worktree_action}
      </p>
      <div className="loop-review-grid">
        <LoopReviewItem
          footer={`${summary.readiness_summary.status} ${summary.readiness_summary.reason}`}
          lines={[summary.readiness_summary.label]}
        />
        <LoopReviewItem
          footer={`Merge gate ${summary.brief_rationale.merge_gate}`}
          lines={[
            summary.brief_rationale.label,
            summary.brief_rationale.reason,
            `Next ${summary.brief_rationale.next_action}`,
          ]}
        />
        <LoopReviewItem
          footer={`${summary.evidence_count_explanation.count} ${summary.evidence_count_explanation.reason}`}
          lines={["Evidence guidance", summary.evidence_count_explanation.label]}
        />
      </div>
      {summary.reviewer_checklist_preview.length > 0 && (
        <LoopReviewItem
          footer={checklistFooter}
          lines={[
            "Reviewer checklist preview",
            ...summary.reviewer_checklist_preview
              .slice(0, -1)
              .map((item) => `${item.label} ${item.status}`),
          ]}
        />
      )}
      <p className="loops-status-line">{summary.command_hint.label}</p>
      <code>{summary.command_hint.command}</code>
      <LoopReviewItem
        footer="No command writes or external calls"
        lines={[
          summary.command_hint.provenance.label,
          summary.command_hint.provenance.source,
          summary.command_hint.provenance.reason,
        ]}
      />
      {summary.missing_evidence_explanation && (
        <LoopReviewItem
          footer={`Next ${summary.missing_evidence_explanation.next_action}`}
          lines={[
            summary.missing_evidence_explanation.label,
            summary.missing_evidence_explanation.reason,
          ]}
        />
      )}
    </div>
  );
}
