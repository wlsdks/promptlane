import type { LoopWorktreeResponse } from "./api.js";
import { LoopReviewItem } from "./loop-review-item.js";

export function LoopWorktreeRenewedMemoryApprovalItems({
  worktreeDetail,
}: {
  worktreeDetail: LoopWorktreeResponse;
}) {
  return (
    <>
      {worktreeDetail.continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_collection_reminder && (
        <LoopReviewItem
          footer="No post-memory-approval retry renewed-memory-approval post-submit retry renewed-memory-approval collection reminder writes or external calls"
          lines={[
            worktreeDetail
              .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_collection_reminder
              .label,
            worktreeDetail
              .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_collection_reminder
              .reminder,
            worktreeDetail
              .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_collection_reminder
              .not_automated,
            worktreeDetail
              .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_collection_reminder
              .reason,
          ]}
        />
      )}
      {worktreeDetail.continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_collection_result_non_persistence_note && (
        <LoopReviewItem
          footer="No post-memory-approval retry renewed-memory-approval post-submit retry renewed-memory-approval collection result persistence writes or external calls"
          lines={[
            worktreeDetail
              .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_collection_result_non_persistence_note
              .label,
            worktreeDetail
              .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_collection_result_non_persistence_note
              .result_scope,
            worktreeDetail
              .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_collection_result_non_persistence_note
              .not_stored,
            worktreeDetail
              .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_collection_result_non_persistence_note
              .reason,
          ]}
        />
      )}
      {worktreeDetail.continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_collection_uncertainty_reminder && (
        <LoopReviewItem
          footer="No post-memory-approval retry renewed-memory-approval post-submit retry renewed-memory-approval collection uncertainty writes or external calls"
          lines={[
            worktreeDetail
              .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_collection_uncertainty_reminder
              .label,
            worktreeDetail
              .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_collection_uncertainty_reminder
              .reminder,
            worktreeDetail
              .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_collection_uncertainty_reminder
              .not_automated,
            worktreeDetail
              .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_collection_uncertainty_reminder
              .reason,
          ]}
        />
      )}
      {worktreeDetail.continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_freshness_advisory && (
        <LoopReviewItem
          footer="No post-memory-approval retry renewed-memory-approval post-submit retry renewed-memory-approval post-submit freshness advisory writes or external calls"
          lines={[
            worktreeDetail
              .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_freshness_advisory
              .label,
            worktreeDetail
              .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_freshness_advisory
              .advisory,
            worktreeDetail
              .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_freshness_advisory
              .not_automated,
            worktreeDetail
              .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_freshness_advisory
              .reason,
          ]}
        />
      )}
      {worktreeDetail.continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_pre_merge_freshness_advisory && (
        <LoopReviewItem
          footer="No post-memory-approval retry renewed-memory-approval post-submit retry renewed-memory-approval post-submit collection pre-merge freshness advisory writes or external calls"
          lines={[
            worktreeDetail
              .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_pre_merge_freshness_advisory
              .label,
            worktreeDetail
              .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_pre_merge_freshness_advisory
              .advisory,
            worktreeDetail
              .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_pre_merge_freshness_advisory
              .not_decision,
            worktreeDetail
              .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_pre_merge_freshness_advisory
              .reason,
          ]}
        />
      )}
      {worktreeDetail.continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_pre_handoff_freshness_advisory && (
        <LoopReviewItem
          footer="No post-memory-approval retry renewed-memory-approval post-submit retry renewed-memory-approval post-submit collection pre-handoff freshness advisory writes or external calls"
          lines={[
            worktreeDetail
              .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_pre_handoff_freshness_advisory
              .label,
            worktreeDetail
              .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_pre_handoff_freshness_advisory
              .advisory,
            worktreeDetail
              .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_pre_handoff_freshness_advisory
              .not_decision,
            worktreeDetail
              .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_pre_handoff_freshness_advisory
              .reason,
          ]}
        />
      )}
      {worktreeDetail.continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_pre_paste_freshness_advisory && (
        <LoopReviewItem
          footer="No post-memory-approval retry renewed-memory-approval post-submit retry renewed-memory-approval post-submit collection pre-paste freshness advisory writes or external calls"
          lines={[
            worktreeDetail
              .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_pre_paste_freshness_advisory
              .label,
            worktreeDetail
              .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_pre_paste_freshness_advisory
              .advisory,
            worktreeDetail
              .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_pre_paste_freshness_advisory
              .not_decision,
            worktreeDetail
              .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_pre_paste_freshness_advisory
              .reason,
          ]}
        />
      )}
      {worktreeDetail.continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_pre_submit_freshness_advisory && (
        <LoopReviewItem
          footer="No post-memory-approval retry renewed-memory-approval post-submit retry renewed-memory-approval post-submit collection pre-submit freshness advisory writes or external calls"
          lines={[
            worktreeDetail
              .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_pre_submit_freshness_advisory
              .label,
            worktreeDetail
              .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_pre_submit_freshness_advisory
              .advisory,
            worktreeDetail
              .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_pre_submit_freshness_advisory
              .not_decision,
            worktreeDetail
              .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_pre_submit_freshness_advisory
              .reason,
          ]}
        />
      )}
      {worktreeDetail.continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_post_submit_freshness_advisory && (
        <LoopReviewItem
          footer="No post-memory-approval retry renewed-memory-approval post-submit retry renewed-memory-approval post-submit collection post-submit freshness advisory writes or external calls"
          lines={[
            worktreeDetail
              .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_post_submit_freshness_advisory
              .label,
            worktreeDetail
              .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_post_submit_freshness_advisory
              .advisory,
            worktreeDetail
              .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_post_submit_freshness_advisory
              .not_monitored,
            worktreeDetail
              .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_post_submit_freshness_advisory
              .reason,
          ]}
        />
      )}
      {worktreeDetail.continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_freshness_result_non_persistence_note && (
        <LoopReviewItem
          footer="No post-memory-approval retry renewed-memory-approval post-submit retry renewed-memory-approval post-submit collection freshness result persistence writes or external calls"
          lines={[
            worktreeDetail
              .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_freshness_result_non_persistence_note
              .label,
            worktreeDetail
              .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_freshness_result_non_persistence_note
              .not_stored,
            worktreeDetail
              .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_freshness_result_non_persistence_note
              .not_detected,
            worktreeDetail
              .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_freshness_result_non_persistence_note
              .reason,
          ]}
        />
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
      {worktreeDetail.continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_result_non_persistence_note && (
        <LoopReviewItem
          footer="No post-memory-approval retry renewed-memory-approval post-submit retry renewed-memory-approval post-submit collection result persistence writes or external calls"
          lines={[
            worktreeDetail
              .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_result_non_persistence_note
              .label,
            worktreeDetail
              .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_result_non_persistence_note
              .result_scope,
            worktreeDetail
              .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_result_non_persistence_note
              .not_stored,
            worktreeDetail
              .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_result_non_persistence_note
              .reason,
          ]}
        />
      )}
      {worktreeDetail.continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_uncertainty_reminder && (
        <LoopReviewItem
          footer="No post-memory-approval retry renewed-memory-approval post-submit retry renewed-memory-approval post-submit collection uncertainty writes or external calls"
          lines={[
            worktreeDetail
              .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_uncertainty_reminder
              .label,
            worktreeDetail
              .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_uncertainty_reminder
              .reminder,
            worktreeDetail
              .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_uncertainty_reminder
              .not_automated,
            worktreeDetail
              .continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_uncertainty_reminder
              .reason,
          ]}
        />
      )}
    </>
  );
}
