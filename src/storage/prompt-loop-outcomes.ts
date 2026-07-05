import { detectSensitiveValues } from "../redaction/detectors.js";
import type { PromptLoopOutcomeEvidence } from "./ports.js";
import type { LoopSnapshotListResult } from "./ports.js";

export function promptLoopOutcomesForPrompt(
  snapshots: LoopSnapshotListResult["items"],
  promptId: string,
): PromptLoopOutcomeEvidence[] {
  return snapshots
    .filter((snapshot) => snapshot.prompt_ids.includes(promptId))
    .filter((snapshot) => snapshot.outcome.status !== "unknown")
    .map((snapshot) => ({
      snapshot_id: snapshot.id,
      status: snapshot.outcome.status,
      summary: redactOutcomeEvidenceText(snapshot.outcome.summary),
      evidence_refs: snapshot.outcome.evidence_refs.filter(isSafeEvidenceRef),
      ...(snapshot.event_counts.tests_run !== undefined
        ? { tests_run: snapshot.event_counts.tests_run }
        : {}),
    }))
    .filter(
      (outcome) =>
        outcome.summary.length > 0 || outcome.evidence_refs.length > 0,
    )
    .slice(0, 5);
}

function isSafeEvidenceRef(ref: string): boolean {
  const trimmed = ref.trim();
  return trimmed.length > 0 && detectSensitiveValues(trimmed).length === 0;
}

function redactOutcomeEvidenceText(value: string): string {
  const findings = detectSensitiveValues(value);
  if (findings.length === 0) return value;

  let redacted = value;
  for (const finding of [...findings].reverse()) {
    redacted = `${redacted.slice(0, finding.range_start)}${finding.replacement}${redacted.slice(finding.range_end)}`;
  }
  return redacted;
}
