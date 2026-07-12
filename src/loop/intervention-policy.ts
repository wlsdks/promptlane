import type { LoopOutcomeStatus } from "./types.js";

export type ResumeIntervention = {
  mode: "offer_resume_brief" | "silent";
  reason: string;
};

export function decideResumeIntervention(input: {
  explicitCheckpoint: boolean;
  hasCompactionBoundary: boolean;
  outcomeStatus: LoopOutcomeStatus;
}): ResumeIntervention {
  if (input.explicitCheckpoint) {
    return {
      mode: "offer_resume_brief",
      reason:
        "An explicit local checkpoint is available, so preserve its selected contract and evidence during recovery.",
    };
  }
  if (["failed", "blocked"].includes(input.outcomeStatus)) {
    return {
      mode: "offer_resume_brief",
      reason:
        "The latest outcome needs recovery review before ordinary implementation continues.",
    };
  }
  if (input.hasCompactionBoundary) {
    return {
      mode: "offer_resume_brief",
      reason:
        "A compaction boundary can hide recent context, so offer the local continuation record.",
    };
  }
  return {
    mode: "silent",
    reason:
      "No explicit recovery signal is present; avoid injecting generic continuation guidance into ordinary work.",
  };
}
