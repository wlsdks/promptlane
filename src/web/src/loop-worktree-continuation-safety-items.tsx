import type { LoopWorktreeResponse } from "./api.js";
import { LoopReviewItem } from "./loop-review-item.js";

export function LoopWorktreeContinuationSafetyItems({
  worktreeDetail,
}: {
  worktreeDetail: LoopWorktreeResponse;
}) {
  const safety = worktreeDetail.continuation_safety;
  if (!safety) return null;

  return (
    <LoopReviewItem
      footer="No safety guidance writes or external calls"
      lines={[safety.label, ...safety.steps, ...safety.boundaries]}
    />
  );
}
