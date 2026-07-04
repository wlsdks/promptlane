import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

describe("source hygiene", () => {
  it("does not keep retired tool-brand references in tracked files", () => {
    const retiredToolBrand = ["se", "rena"].join("");

    let matches = "";
    try {
      matches = execFileSync(
        "git",
        ["grep", "-n", "-i", retiredToolBrand, "--", "."],
        {
          encoding: "utf8",
          stdio: ["ignore", "pipe", "pipe"],
        },
      );
    } catch (error) {
      if (
        typeof error === "object" &&
        error !== null &&
        "status" in error &&
        error.status === 1
      ) {
        matches = "";
      } else {
        throw error;
      }
    }

    expect(matches).toBe("");
  });

  it("does not leave duplicate selected-detail boundary decisions unresolved", () => {
    const todo = readFileSync("tasks/todo.md", "utf8");

    expect(todo).not.toContain(
      "- [ ] 다음 slice: selected detail panel의 post-memory-approval retry renewed-memory-approval post-submit retry renewed-memory-approval post-submit collection freshness uncertainty pre-merge/pre-handoff/pre-paste/pre-submit boundary를 별도 제공할지 결정",
    );
    expect(todo).toContain(
      "Task 140 DECISION: post-submit collection freshness uncertainty pre-merge/pre-handoff/pre-paste/pre-submit boundary는 Task 133-136의 기존 runtime field가 이미 담당하므로 중복 field를 추가하지 않음",
    );
  });

  it("keeps reducing raw loop review item markup in LoopsView", () => {
    const loopsView = readFileSync("src/web/src/loops-view.tsx", "utf8");
    const rawReviewItemCount = (
      loopsView.match(/<div className="loop-review-item">/g) ?? []
    ).length;

    expect(rawReviewItemCount).toBeLessThanOrEqual(0);
  });

  it("keeps renewed memory approval collection detail formatting outside LoopsView", () => {
    const loopsView = readFileSync("src/web/src/loops-view.tsx", "utf8");

    expect(loopsView).not.toContain(
      "continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_collection_reminder",
    );
    expect(loopsView).not.toContain(
      "continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_collection_result_non_persistence_note",
    );
    expect(loopsView).not.toContain(
      "continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_collection_uncertainty_reminder",
    );
  });

  it("keeps post-submit collection pre-boundary detail formatting outside LoopsView", () => {
    const loopsView = readFileSync("src/web/src/loops-view.tsx", "utf8");

    expect(loopsView).not.toContain(
      "continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_pre_merge_freshness_advisory",
    );
    expect(loopsView).not.toContain(
      "continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_pre_handoff_freshness_advisory",
    );
    expect(loopsView).not.toContain(
      "continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_pre_paste_freshness_advisory",
    );
  });

  it("keeps post-submit collection submit freshness detail formatting outside LoopsView", () => {
    const loopsView = readFileSync("src/web/src/loops-view.tsx", "utf8");

    expect(loopsView).not.toContain(
      "continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_pre_submit_freshness_advisory",
    );
    expect(loopsView).not.toContain(
      "continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_post_submit_freshness_advisory",
    );
    expect(loopsView).not.toContain(
      "continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_freshness_result_non_persistence_note",
    );
  });

  it("keeps post-submit collection freshness uncertainty detail formatting outside LoopsView", () => {
    const loopsView = readFileSync("src/web/src/loops-view.tsx", "utf8");

    expect(loopsView).not.toContain(
      "continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_freshness_uncertainty_collection_reminder",
    );
  });

  it("keeps post-submit collection result and uncertainty detail formatting outside LoopsView", () => {
    const loopsView = readFileSync("src/web/src/loops-view.tsx", "utf8");

    expect(loopsView).not.toContain(
      "continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_result_non_persistence_note",
    );
    expect(loopsView).not.toContain(
      "continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_uncertainty_reminder",
    );
  });

  it("keeps renewed memory approval post-submit freshness detail formatting outside LoopsView", () => {
    const loopsView = readFileSync("src/web/src/loops-view.tsx", "utf8");

    expect(loopsView).not.toContain(
      "continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_freshness_advisory",
    );
  });

  it("keeps renewed memory approval freshness boundary detail formatting outside LoopsView", () => {
    const loopsView = readFileSync("src/web/src/loops-view.tsx", "utf8");

    expect(loopsView).not.toContain(
      "continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_pre_merge_freshness_advisory",
    );
    expect(loopsView).not.toContain(
      "continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_pre_handoff_freshness_advisory",
    );
    expect(loopsView).not.toContain(
      "continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_pre_paste_freshness_advisory",
    );
    expect(loopsView).not.toContain(
      "continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_pre_submit_freshness_advisory",
    );
  });

  it("keeps renewed memory approval helper from repeating long field access markup", () => {
    const helper = readFileSync(
      "src/web/src/loop-worktree-renewed-memory-approval-items.tsx",
      "utf8",
    );
    const longFieldAccessCount = (
      helper.match(
        /\.continuation_safety_post_memory_approval_retry_renewed_memory_approval_/g,
      ) ?? []
    ).length;

    expect(helper).toContain("renderReviewItem(");
    expect(longFieldAccessCount).toBeLessThanOrEqual(20);
  });

  it("keeps post-memory-approval retry renewed-memory-approval detail formatting outside LoopsView", () => {
    const loopsView = readFileSync("src/web/src/loops-view.tsx", "utf8");

    expect(loopsView).not.toContain(
      "continuation_safety_post_memory_approval_retry_renewed_memory_approval_collection_reminder",
    );
    expect(loopsView).not.toContain(
      "continuation_safety_post_memory_approval_retry_renewed_memory_approval_collection_result_non_persistence_note",
    );
    expect(loopsView).not.toContain(
      "continuation_safety_post_memory_approval_retry_renewed_memory_approval_collection_uncertainty_reminder",
    );
    expect(loopsView).not.toContain(
      "continuation_safety_post_memory_approval_retry_renewed_memory_approval_pre_merge_freshness_advisory",
    );
    expect(loopsView).not.toContain(
      "continuation_safety_post_memory_approval_retry_renewed_memory_approval_pre_handoff_freshness_advisory",
    );
    expect(loopsView).not.toContain(
      "continuation_safety_post_memory_approval_retry_renewed_memory_approval_pre_paste_freshness_advisory",
    );
    expect(loopsView).not.toContain(
      "continuation_safety_post_memory_approval_retry_renewed_memory_approval_pre_submit_freshness_advisory",
    );
    expect(loopsView).not.toContain(
      "continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_freshness_advisory",
    );
    expect(loopsView).not.toContain(
      "continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_collection_result_non_persistence_note",
    );
    expect(loopsView).not.toContain(
      "continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_collection_retry_boundary_note",
    );
    expect(loopsView).not.toContain(
      "continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_outcome_non_persistence_note",
    );
    expect(loopsView).not.toContain(
      "continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_evidence_freshness_boundary_note",
    );
    expect(loopsView).not.toContain(
      "continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_freshness_result_non_persistence_note",
    );
    expect(loopsView).not.toContain(
      "continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_freshness_uncertainty_collection_reminder",
    );
    expect(loopsView).not.toContain(
      "continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_pre_memory_approval_freshness_advisory",
    );
  });

  it("keeps baseline continuation safety detail formatting outside LoopsView", () => {
    const loopsView = readFileSync("src/web/src/loops-view.tsx", "utf8");

    expect(loopsView).not.toContain("continuation_safety_group");
    expect(loopsView).not.toContain("continuation_safety_ordering_note");
    expect(loopsView).not.toContain(
      "continuation_safety_non_persistence_note",
    );
    expect(loopsView).not.toContain("continuation_safety_recheck_cue");
    expect(loopsView).not.toContain(
      "continuation_safety_copy_feedback_reminder",
    );
    expect(loopsView).not.toContain(
      "continuation_safety_copy_feedback_accessibility_note",
    );
    expect(loopsView).not.toContain(
      "continuation_safety_copy_feedback_timeout_note",
    );
    expect(loopsView).not.toContain(
      "continuation_safety_copy_feedback_failure_note",
    );
    expect(loopsView).not.toContain("continuation_safety_copy_retry_note");
    expect(loopsView).not.toContain(
      "continuation_safety_pre_paste_confirmation_note",
    );
    expect(loopsView).not.toContain(
      "continuation_safety_target_agent_check_note",
    );
    expect(loopsView).not.toContain(
      "continuation_safety_paste_destination_boundary_note",
    );
    expect(loopsView).not.toContain(
      "continuation_safety_manual_submission_boundary_note",
    );
    expect(loopsView).not.toContain(
      "continuation_safety_submission_result_non_persistence_note",
    );
  });

  it("keeps post-submission collection freshness detail formatting outside LoopsView", () => {
    const loopsView = readFileSync("src/web/src/loops-view.tsx", "utf8");

    expect(loopsView).not.toContain(
      "continuation_safety_post_submission_collection_reminder_note",
    );
    expect(loopsView).not.toContain(
      "continuation_safety_collection_result_non_persistence_note",
    );
    expect(loopsView).not.toContain(
      "continuation_safety_collection_retry_boundary_note",
    );
    expect(loopsView).not.toContain(
      "continuation_safety_retry_outcome_non_persistence_note",
    );
    expect(loopsView).not.toContain(
      "continuation_safety_collection_evidence_freshness_boundary_note",
    );
    expect(loopsView).not.toContain(
      "continuation_safety_freshness_result_non_persistence_note",
    );
    expect(loopsView).not.toContain(
      "continuation_safety_freshness_uncertainty_collection_reminder",
    );
    expect(loopsView).not.toContain(
      "continuation_safety_pre_merge_freshness_advisory",
    );
    expect(loopsView).not.toContain(
      "continuation_safety_pre_memory_approval_freshness_advisory",
    );
  });

  it("keeps post-memory-approval collection freshness detail formatting outside LoopsView", () => {
    const loopsView = readFileSync("src/web/src/loops-view.tsx", "utf8");

    expect(loopsView).not.toContain(
      "continuation_safety_post_memory_approval_collection_reminder",
    );
    expect(loopsView).not.toContain(
      "continuation_safety_post_memory_approval_collection_result_non_persistence_note",
    );
    expect(loopsView).not.toContain(
      "continuation_safety_post_memory_approval_collection_retry_boundary_note",
    );
    expect(loopsView).not.toContain(
      "continuation_safety_post_memory_approval_retry_outcome_non_persistence_note",
    );
    expect(loopsView).not.toContain(
      "continuation_safety_post_memory_approval_retry_evidence_freshness_boundary_note",
    );
    expect(loopsView).not.toContain(
      "continuation_safety_post_memory_approval_retry_freshness_result_non_persistence_note",
    );
    expect(loopsView).not.toContain(
      "continuation_safety_post_memory_approval_retry_freshness_uncertainty_collection_reminder",
    );
    expect(loopsView).not.toContain(
      "continuation_safety_post_memory_approval_retry_pre_memory_approval_freshness_advisory",
    );
  });

  it("keeps selected-detail boundary review formatting outside LoopsView", () => {
    const loopsView = readFileSync("src/web/src/loops-view.tsx", "utf8");

    expect(loopsView).not.toContain("paste_destination");
    expect(loopsView).not.toContain("handoff_checklist");
    expect(loopsView).not.toContain("post_handoff_reminder");
    expect(loopsView).not.toContain("source_of_truth_note");
    expect(loopsView).not.toContain("privacy_boundary_note");
    expect(loopsView).not.toContain("operator_review_gate");
    expect(loopsView).not.toContain("collection_responsibility_note");
    expect(loopsView).not.toContain("pre_merge_advisory");
    expect(loopsView).not.toContain("post_collection_review_note");
  });

  it("keeps selected-detail merge review packet formatting outside LoopsView", () => {
    const loopsView = readFileSync("src/web/src/loops-view.tsx", "utf8");

    expect(loopsView).not.toContain("review_packet_summary");
    expect(loopsView).not.toContain("readiness_summary");
    expect(loopsView).not.toContain("brief_rationale");
    expect(loopsView).not.toContain("evidence_count_explanation");
    expect(loopsView).not.toContain("reviewer_checklist_preview");
    expect(loopsView).not.toContain("command_hint");
    expect(loopsView).not.toContain("missing_evidence_explanation");
  });

  it("keeps selected brief command guidance formatting outside LoopsView", () => {
    const loopsView = readFileSync("src/web/src/loops-view.tsx", "utf8");

    expect(loopsView).not.toContain("selected_brief_action");
    expect(loopsView).not.toContain("command_distinction");
    expect(loopsView).not.toContain("command_filters");
    expect(loopsView).not.toContain("copy_side_effects");
  });

  it("keeps worktree detail header formatting outside LoopsView", () => {
    const loopsView = readFileSync("src/web/src/loops-view.tsx", "utf8");

    expect(loopsView).not.toContain("session_id");
    expect(loopsView).not.toContain("selection_scope");
    expect(loopsView).not.toContain("snapshot_age");
    expect(loopsView).not.toContain("latest_decision");
  });

  it("keeps command-center summary formatting outside LoopsView", () => {
    const loopsView = readFileSync("src/web/src/loops-view.tsx", "utf8");

    expect(loopsView).not.toContain("command_center");
    expect(loopsView).not.toContain("review_packet");
    expect(loopsView).not.toContain("review_items");
    expect(loopsView).not.toContain("decision_advisory");
    expect(loopsView).not.toContain("continuation_command");
  });

  it("keeps activity summary formatting outside LoopsView", () => {
    const loopsView = readFileSync("src/web/src/loops-view.tsx", "utf8");

    expect(loopsView).not.toContain("project_memory");
    expect(loopsView).not.toContain("approved_count");
    expect(loopsView).not.toContain("active_worktrees");
    expect(loopsView).not.toContain("active_sessions");
    expect(loopsView).not.toContain("needs_review");
    expect(loopsView).not.toContain("recent_decisions");
    expect(loopsView).not.toContain("memory_candidate");
  });
});
