import type { LoopWorktreeResponse } from "./api.js";
import { LoopReviewItem } from "./loop-review-item.js";
import { renderReviewItem } from "./loop-worktree-review-items.js";

export function LoopWorktreeBoundaryReviewItems({
  worktreeDetail,
}: {
  worktreeDetail: LoopWorktreeResponse;
}) {
  return (
    <>
      {worktreeDetail.paste_destination && (
        <LoopReviewItem
          footer="No automatic submission, file writes, or external calls"
          lines={[
            worktreeDetail.paste_destination.label,
            worktreeDetail.paste_destination.targets.join(" or "),
            worktreeDetail.paste_destination.instruction,
            worktreeDetail.paste_destination.reason,
          ]}
        />
      )}
      {worktreeDetail.handoff_checklist && (
        <LoopReviewItem
          footer="No handoff checklist writes or external calls"
          lines={[
            worktreeDetail.handoff_checklist.label,
            ...worktreeDetail.handoff_checklist.steps,
            worktreeDetail.handoff_checklist.reason,
          ]}
        />
      )}
      {renderReviewItem(
        worktreeDetail.post_handoff_reminder,
        "No post-handoff writes or external calls",
        ["label", "collect_next", "not_memory_approval", "not_merge", "reason"],
      )}
      {renderReviewItem(
        worktreeDetail.source_of_truth_note,
        "No transcript storage, file writes, or external calls",
        ["label", "local_memory_input", "not_transcript_import", "reason"],
      )}
      {renderReviewItem(
        worktreeDetail.privacy_boundary_note,
        "Local only, no file writes or external calls",
        ["label", "storage_scope", "does_not_store", "reason"],
      )}
      {renderReviewItem(
        worktreeDetail.operator_review_gate,
        "No automatic submission, file writes, or external calls",
        ["label", "review_step", "manual_submit", "does_not"],
      )}
      {renderReviewItem(
        worktreeDetail.collection_responsibility_note,
        "No automatic collection, file writes, or external calls",
        ["label", "responsible_party", "trigger", "does_not"],
      )}
      {renderReviewItem(
        worktreeDetail.pre_merge_advisory,
        "No merge decision writes, file writes, or external calls",
        ["label", "hold_merge", "reason", "not_memory_approval"],
      )}
      {renderReviewItem(
        worktreeDetail.post_collection_review_note,
        "No memory writes, merge decision writes, or external calls",
        ["label", "review_step", "before_memory_approval", "before_merge"],
      )}
    </>
  );
}
