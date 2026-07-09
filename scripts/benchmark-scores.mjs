import { createHash } from "node:crypto";

export function benchmarkCorpusFingerprint({
  fixtureSet,
  fixtures,
  coachCases,
}) {
  const canonical = JSON.stringify({
    fixtureSet,
    fixtures: fixtures
      .map(({ label, adapter, query, prompt }) => ({
        label,
        adapter,
        query,
        prompt,
      }))
      .sort((left, right) => left.label.localeCompare(right.label)),
    coachCases: [...coachCases].sort(),
  });
  const digest = createHash("sha256")
    .update(canonical)
    .digest("hex")
    .slice(0, 16);
  return `corpus_${digest}`;
}

export function compareBenchmarkReports({ current, baseline }) {
  if (
    baseline?.fixture_set !== current?.fixture_set ||
    typeof baseline?.corpus_fingerprint !== "string" ||
    baseline.corpus_fingerprint !== current?.corpus_fingerprint
  ) {
    throw new Error(
      "Benchmark baseline must use the same fixture set and corpus.",
    );
  }
  if (
    typeof current?.scores !== "object" ||
    current.scores === null ||
    typeof baseline?.scores !== "object" ||
    baseline.scores === null
  ) {
    throw new Error(
      "Benchmark baseline must contain comparable numeric scores.",
    );
  }

  const metrics = {};
  const improvements = [];
  const regressions = [];
  const unchanged = [];
  for (const [metric, currentValue] of Object.entries(current.scores)) {
    const baselineValue = baseline.scores[metric];
    if (!Number.isFinite(currentValue) || !Number.isFinite(baselineValue)) {
      throw new Error(
        "Benchmark baseline must contain comparable numeric scores.",
      );
    }
    const direction = metricDirection(metric);
    const delta = roundScore(currentValue - baselineValue);
    const tolerance = metricTolerance(metric, baselineValue);
    const change =
      Math.abs(delta) <= tolerance
        ? "unchanged"
        : direction === "lower_is_better"
          ? delta < 0
            ? "improved"
            : "regressed"
          : delta > 0
            ? "improved"
            : "regressed";
    metrics[metric] = {
      baseline: baselineValue,
      current: currentValue,
      delta,
      direction,
      change,
    };
    if (change === "improved") improvements.push(metric);
    if (change === "regressed") regressions.push(metric);
    if (change === "unchanged") unchanged.push(metric);
  }

  return {
    status: "compared",
    corpus_fingerprint: current.corpus_fingerprint,
    metrics,
    improvements: improvements.sort(),
    regressions: regressions.sort(),
    unchanged: unchanged.sort(),
  };
}

export function scorePromptQualityEvidence({
  fixtureSet,
  listItems,
  detailItems,
  fixtureCount,
}) {
  const scores = detailItems
    .map((detail) => detail.analysis?.quality_score?.value)
    .filter((value) => typeof value === "number");
  const checks = {
    all_prompts_scored: scores.length === fixtureCount,
    scores_in_range: scores.every((score) => score >= 0 && score <= 100),
    list_detail_consistent: listItems.every((item) => {
      const detail = detailItems.find((candidate) => candidate.id === item.id);
      return (
        detail !== undefined &&
        item.quality_score === detail.analysis?.quality_score?.value &&
        item.quality_score_band === detail.analysis?.quality_score?.band
      );
    }),
  };

  if (fixtureSet === "real") {
    return {
      score: scoreChecks(checks),
      profile: "real_corpus_delivery_integrity",
      checks,
    };
  }

  const vagueId = listItems.find((item) =>
    item.snippet.includes("Make this better"),
  )?.id;
  const vagueScore = detailItems.find((item) => item.id === vagueId)?.analysis
    ?.quality_score?.value;
  const syntheticChecks = {
    ...checks,
    vague_prompt_scores_low: typeof vagueScore === "number" && vagueScore <= 20,
    score_spread_is_calibrated:
      scores.length > 0 && Math.max(...scores) - Math.min(...scores) >= 50,
  };
  return {
    score: scoreChecks(syntheticChecks),
    profile: "synthetic_score_calibration",
    checks: syntheticChecks,
  };
}

export function scoreArchiveEffectivenessEvidence({
  fixtureSet,
  report,
  fixtureCount,
  forbiddenValues,
}) {
  const summary = report.effectiveness_summary;
  const serialized = JSON.stringify(summary);
  const evidenceRefCheck =
    fixtureSet === "synthetic"
      ? summary.top_evidence_refs.includes("benchmark:effectiveness")
      : summary.top_evidence_refs.length > 0;
  const checks = [
    summary.measured_prompts >= 1,
    summary.unmeasured_prompts === fixtureCount - summary.measured_prompts,
    summary.verdicts.proven >= 1,
    summary.calibration.linked_outcomes >= 1,
    summary.calibration.passing_outcomes >= 1,
    summary.calibration.total_tests_run >= 1,
    evidenceRefCheck,
    typeof summary.next_action === "string" && summary.next_action.length > 20,
    forbiddenValues.every((value) => !serialized.includes(value)),
  ];
  return roundScore(checks.filter(Boolean).length / checks.length);
}

export function scoreOutcomePassRate(effectivenessSummary) {
  const linked = effectivenessSummary.calibration.linked_outcomes;
  if (!Number.isFinite(linked) || linked <= 0) return 0;
  const passed = effectivenessSummary.calibration.passing_outcomes;
  if (!Number.isFinite(passed) || passed < 0) return 0;
  return roundScore(passed / linked);
}

function scoreChecks(checks) {
  const values = Object.values(checks);
  return roundScore(values.filter(Boolean).length / values.length);
}

function metricDirection(metric) {
  return metric === "privacy_leak_count" || metric.endsWith("_ms")
    ? "lower_is_better"
    : "higher_is_better";
}

function metricTolerance(metric, baselineValue) {
  if (metric === "privacy_leak_count") return 0;
  if (metric.endsWith("_ms")) {
    return Math.max(5, Math.abs(baselineValue) * 0.1);
  }
  return 0.01;
}

function roundScore(value) {
  return Math.round(value * 1000) / 1000;
}
