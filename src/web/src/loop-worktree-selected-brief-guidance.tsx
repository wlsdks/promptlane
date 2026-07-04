import type { ReactNode } from "react";

import type { LoopWorktreeResponse } from "./api.js";
import { LoopReviewItem } from "./loop-review-item.js";

export function LoopWorktreeSelectedBriefGuidance({
  children,
  worktreeDetail,
}: {
  children?: ReactNode;
  worktreeDetail: LoopWorktreeResponse;
}) {
  if (!worktreeDetail.selected_brief_action) return null;

  return (
    <div className="loop-detail-section">
      <p className="loop-detail-section-title">Continuation guidance</p>
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
      <p className="loops-status-line">No file writes or external calls</p>
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
      {children}
    </div>
  );
}
