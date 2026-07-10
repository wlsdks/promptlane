import type { BenchmarkReadiness } from "./api.js";

export function LoopBenchmarkReadiness({
  readiness,
}: {
  readiness: BenchmarkReadiness;
}) {
  const diagnostics = readiness.diagnostics;

  return (
    <section
      aria-label="Effectiveness evidence"
      className="loop-benchmark-readiness"
    >
      <div className="loop-benchmark-heading">
        <span>Effectiveness evidence</span>
        <strong>{readinessLabel(readiness)}</strong>
      </div>
      <div className="loop-benchmark-metrics" role="list">
        <span role="listitem">
          <strong>{diagnostics.completed_snapshots}</strong> completed
        </span>
        <span role="listitem">
          <strong>{diagnostics.attributed_snapshots}</strong> attributed
        </span>
        <span role="listitem">
          <strong>{diagnostics.evidence_complete_snapshots}</strong> evidence
          complete
        </span>
        <span role="listitem">
          <strong>{diagnostics.safe_snapshots}</strong> safe
        </span>
      </div>
      <p>{readiness.next_action}</p>
    </section>
  );
}

function readinessLabel(readiness: BenchmarkReadiness): string {
  if (readiness.status === "ready") {
    return `${readiness.candidate_count} ${pluralize(readiness.candidate_count, "benchmark candidate")} ready`;
  }
  if (readiness.status === "no_completed_outcomes") {
    return "No completed outcomes";
  }
  if (readiness.status === "no_attributed_outcomes") {
    return "Improvement use not attributed";
  }
  if (readiness.status === "incomplete_outcome_evidence") {
    return "Outcome evidence incomplete";
  }
  if (readiness.status === "unsafe_outcome_evidence") {
    return "Outcome evidence needs redaction";
  }
  return "No loop snapshots";
}

function pluralize(count: number, singular: string): string {
  return count === 1 ? singular : `${singular}s`;
}
