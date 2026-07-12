export const CONTINUATION_POLICY_VERSION = "recovery-packet-v2";

export type ContinuationReceiptSummary = {
  id: string;
  snapshot_id: string;
  policy_version: string;
  created_at: string;
  status: "generated";
};

export function toGeneratedReceiptSummary(input: {
  id: string;
  snapshot_id: string;
  policy_version: string;
  created_at: string;
  status: string;
}): ContinuationReceiptSummary {
  if (input.status !== "generated") {
    throw new Error("A new continuation brief requires a generated receipt.");
  }
  return {
    id: input.id,
    snapshot_id: input.snapshot_id,
    policy_version: input.policy_version,
    created_at: input.created_at,
    status: "generated",
  };
}
