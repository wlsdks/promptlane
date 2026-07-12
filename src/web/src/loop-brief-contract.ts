export type LoopBrief = {
  title: string;
  prompt: string;
  source_snapshot_id: string;
  recovery: {
    policy_version: string;
    authority: "explicit_checkpoint" | "snapshot_metadata";
    selected_target: {
      project: string;
      tool: string;
      session?: string;
      branch?: string;
      worktree?: string;
    };
    outcome_status:
      | "unknown"
      | "in_progress"
      | "passed"
      | "failed"
      | "blocked"
      | "abandoned";
    evidence_count: number;
    compact_boundary_after_snapshot: boolean;
  };
  receipt?: {
    id: string;
    snapshot_id: string;
    policy_version: string;
    created_at: string;
    status: "generated";
  };
  compact_boundary?: unknown;
  privacy: {
    local_only: true;
    returns_prompt_bodies: false;
    returns_raw_paths: false;
  };
};

export function isLoopBriefRecovery(value: unknown): boolean {
  if (!value || typeof value !== "object") return false;
  const recovery = value as LoopBrief["recovery"];
  return (
    typeof recovery.policy_version === "string" &&
    ["explicit_checkpoint", "snapshot_metadata"].includes(recovery.authority) &&
    typeof recovery.selected_target?.project === "string" &&
    typeof recovery.selected_target.tool === "string" &&
    typeof recovery.outcome_status === "string" &&
    typeof recovery.evidence_count === "number" &&
    typeof recovery.compact_boundary_after_snapshot === "boolean"
  );
}

export function isGeneratedContinuationReceipt(value: unknown): boolean {
  if (!value || typeof value !== "object") return false;
  const receipt = value as NonNullable<LoopBrief["receipt"]>;
  return (
    typeof receipt.id === "string" &&
    typeof receipt.snapshot_id === "string" &&
    typeof receipt.policy_version === "string" &&
    typeof receipt.created_at === "string" &&
    receipt.status === "generated"
  );
}
