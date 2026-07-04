import type { LoopWorktreeResponse } from "./api.js";

export function LoopWorktreeDetailHeader({
  worktreeDetail,
}: {
  worktreeDetail: LoopWorktreeResponse;
}) {
  return (
    <>
      <span className="panel-eyebrow">Worktree detail</span>
      <h2>{worktreeDetail.worktree}</h2>
      {worktreeDetail.session_id && (
        <p className="loops-status-line">Session {worktreeDetail.session_id}</p>
      )}
      {worktreeDetail.branch && (
        <p className="loops-status-line">Branch {worktreeDetail.branch}</p>
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
      {worktreeDetail.latest_decision && (
        <p className="loops-status-line">
          Latest decision {worktreeDetail.latest_decision.decision}{" "}
          {worktreeDetail.latest_decision.reason}
        </p>
      )}
    </>
  );
}
