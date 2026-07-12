#!/usr/bin/env node
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const FORBIDDEN_KEY =
  /(?:prompt|body|query|response|output|transcript|path|cwd|branch|worktree|session)/i;
const SENSITIVE_VALUE =
  /(?:\/Users\/[^\s]+|\bAKIA[0-9A-Z]{16}\b|\bsk-(?:proj-)?[A-Za-z0-9_-]{8,}\b|\bgh[opusr]_[A-Za-z0-9]{12,}\b)/;
const RECOVERY_CLASSES = new Set([
  "checkpoint_focus",
  "compaction_handoff",
  "failure_outcome",
  "policy_recovery",
  "privacy_boundary",
  "worktree_resolution",
]);

export function createResumeReliabilityReport(input) {
  validateResumeReliabilityLedger(input);
  const minimumPairs = input.minimums.pairs;
  const pairs = input.pairs;
  const baseline = summarizeCondition(pairs, "baseline");
  const looprelay = summarizeCondition(pairs, "looprelay");
  const order = {
    baseline_first: pairs.filter((pair) => pair.order === "baseline_first")
      .length,
    looprelay_first: pairs.filter((pair) => pair.order === "looprelay_first")
      .length,
  };
  const recoveryClassCounts = countRecoveryClasses(pairs);
  const recoveryClassCoverage = {
    observed: Object.keys(recoveryClassCounts).length,
    required: input.minimums.recovery_classes,
    counts: recoveryClassCounts,
  };
  const transitions = pairs.reduce(
    (summary, pair) => {
      if (!pair.baseline.passed && pair.looprelay.passed) summary.improved += 1;
      else if (pair.baseline.passed && !pair.looprelay.passed)
        summary.regressed += 1;
      else if (pair.baseline.passed) summary.unchanged_passed += 1;
      else summary.unchanged_failed += 1;
      return summary;
    },
    { improved: 0, regressed: 0, unchanged_passed: 0, unchanged_failed: 0 },
  );
  const requiredPerOrder = minimumPairs / 2;
  const counterbalanced =
    Number.isInteger(requiredPerOrder) &&
    order.baseline_first >= requiredPerOrder &&
    order.looprelay_first >= requiredPerOrder;
  const completed =
    pairs.length >= minimumPairs &&
    counterbalanced &&
    recoveryClassCoverage.observed >= recoveryClassCoverage.required;
  const targetDelta = nullableDelta(
    looprelay.correct_target_rate,
    baseline.correct_target_rate,
  );
  const firstActionDelta = nullableDelta(
    looprelay.correct_first_action_rate,
    baseline.correct_first_action_rate,
  );
  const intervention = interventionDecision({
    completed,
    firstActionDelta,
    targetDelta,
    transitions,
  });

  return {
    version: 1,
    design: "matched_observational",
    cohort: input.cohort,
    causal_claim: false,
    status: completed ? "directional_evidence_ready" : "collecting",
    pair_count: pairs.length,
    minimum_pairs: minimumPairs,
    pairs_remaining: Math.max(minimumPairs - pairs.length, 0),
    counterbalanced,
    order,
    recovery_class_coverage: recoveryClassCoverage,
    scoring: {
      method: "tool_event_trace",
      model_self_report_used: false,
    },
    baseline,
    looprelay,
    delta: {
      correct_target_rate: targetDelta,
      correct_first_action_rate: firstActionDelta,
      evidence_attached_rate: nullableDelta(
        looprelay.evidence_attached_rate,
        baseline.evidence_attached_rate,
      ),
      mean_elapsed_ms: nullableDelta(
        looprelay.mean_elapsed_ms,
        baseline.mean_elapsed_ms,
      ),
      mean_friction_count: nullableDelta(
        looprelay.mean_friction_count,
        baseline.mean_friction_count,
      ),
      mean_wrong_target_count: nullableDelta(
        looprelay.mean_wrong_target_count,
        baseline.mean_wrong_target_count,
      ),
    },
    transitions,
    adoption_rate: meanNullable(
      pairs.map((pair) => Number(pair.looprelay.adopted)),
    ),
    intervention,
    privacy: {
      raw_free: true,
      stores_prompt_bodies: false,
      stores_raw_paths: false,
      stores_branch_names: false,
      stores_worktree_names: false,
    },
    note: "Observed matched-pair evidence only. A completed cohort remains non-causal and retains regressions.",
  };
}

export function validateResumeReliabilityLedger(input) {
  if (!input || typeof input !== "object") {
    throw new Error("resume reliability ledger is required");
  }
  if (input.version !== 1 || input.design !== "matched_observational") {
    throw new Error("unsupported resume reliability ledger contract");
  }
  if (input.cohort !== "agent_native_blind_recovery") {
    throw new Error("unsupported resume reliability cohort");
  }
  if (input.causal_claim !== false) {
    throw new Error("causal_claim must be false");
  }
  if (!Number.isInteger(input.minimums?.pairs) || input.minimums.pairs < 1) {
    throw new Error("minimums.pairs must be a positive integer");
  }
  if (
    !Number.isInteger(input.minimums?.recovery_classes) ||
    input.minimums.recovery_classes < 1
  ) {
    throw new Error("minimums.recovery_classes must be a positive integer");
  }
  if (!Array.isArray(input.pairs)) {
    throw new Error("pairs must be an array");
  }
  assertRawFree(input);
  const ids = new Set();
  for (const pair of input.pairs) {
    if (!/^[a-z0-9-]+$/.test(pair?.id ?? "") || ids.has(pair.id)) {
      throw new Error("pair ids must be unique raw-free labels");
    }
    ids.add(pair.id);
    if (!new Set(["baseline_first", "looprelay_first"]).has(pair.order)) {
      throw new Error("pair order must be baseline_first or looprelay_first");
    }
    if (!RECOVERY_CLASSES.has(pair.recovery_class)) {
      throw new Error("pair recovery_class must be a supported raw-free class");
    }
    if (pair.assessment !== "tool_event_trace") {
      throw new Error(
        "pair assessment must be an independent tool event trace",
      );
    }
    validateCondition(pair.baseline, false);
    validateCondition(pair.looprelay, true);
    if (!new Set(["baseline", "looprelay", "tie"]).has(pair.preference)) {
      throw new Error("pair preference must be baseline, looprelay, or tie");
    }
  }
}

function countRecoveryClasses(pairs) {
  return pairs.reduce((counts, pair) => {
    counts[pair.recovery_class] = (counts[pair.recovery_class] ?? 0) + 1;
    return counts;
  }, {});
}

function validateCondition(condition, treatment) {
  if (!condition || typeof condition !== "object") {
    throw new Error("resume condition is required");
  }
  for (const key of [
    "passed",
    "correct_target",
    "correct_first_action",
    "evidence_attached",
  ]) {
    if (typeof condition[key] !== "boolean") {
      throw new Error(`resume condition field is required: ${key}`);
    }
  }
  for (const key of ["elapsed_ms", "friction_count", "wrong_target_count"]) {
    if (
      condition[key] !== null &&
      (!Number.isFinite(condition[key]) || condition[key] < 0)
    ) {
      throw new Error(`invalid resume condition metric: ${key}`);
    }
  }
  if (treatment && typeof condition.adopted !== "boolean") {
    throw new Error("LoopRelay adoption is required");
  }
}

function summarizeCondition(pairs, conditionKey) {
  const conditions = pairs.map((pair) => pair[conditionKey]);
  return {
    success_rate: meanNullable(
      conditions.map((condition) => Number(condition.passed)),
    ),
    correct_target_rate: meanNullable(
      conditions.map((condition) => Number(condition.correct_target)),
    ),
    correct_first_action_rate: meanNullable(
      conditions.map((condition) => Number(condition.correct_first_action)),
    ),
    evidence_attached_rate: meanNullable(
      conditions.map((condition) => Number(condition.evidence_attached)),
    ),
    mean_elapsed_ms: meanNullable(
      conditions.map((condition) => condition.elapsed_ms),
    ),
    mean_friction_count: meanNullable(
      conditions.map((condition) => condition.friction_count),
    ),
    mean_wrong_target_count: meanNullable(
      conditions.map((condition) => condition.wrong_target_count),
    ),
  };
}

function interventionDecision({
  completed,
  firstActionDelta,
  targetDelta,
  transitions,
}) {
  if (!completed) {
    return {
      decision: "collect",
      rationale:
        "Collect 10 counterbalanced resume pairs before changing the default intervention policy.",
    };
  }
  if (
    targetDelta === null ||
    firstActionDelta === null ||
    targetDelta <= 0 ||
    firstActionDelta <= 0 ||
    transitions.regressed > transitions.improved
  ) {
    return {
      decision: "narrow",
      rationale:
        "Keep resume guidance opt-in and only for explicit recovery signals; the cohort does not support broader default intervention.",
    };
  }
  return {
    decision: "retain_opt_in",
    rationale:
      "Retain explicit resume guidance for selected recovery signals only; causal_claim remains false.",
  };
}

function meanNullable(values) {
  const present = values.filter(
    (value) => value !== null && value !== undefined,
  );
  if (present.length === 0) return null;
  return round(
    present.reduce((total, value) => total + value, 0) / present.length,
  );
}

function nullableDelta(current, baseline) {
  if (current === null || baseline === null) return null;
  return round(current - baseline);
}

function round(value) {
  return Number(value.toFixed(6));
}

function assertRawFree(value, key = "") {
  if (FORBIDDEN_KEY.test(key)) {
    throw new Error(`forbidden raw-bearing key: ${key}`);
  }
  if (typeof value === "string" && SENSITIVE_VALUE.test(value)) {
    throw new Error("sensitive or raw path value is not allowed");
  }
  if (Array.isArray(value)) {
    for (const item of value) assertRawFree(item, key);
    return;
  }
  if (value && typeof value === "object") {
    for (const [childKey, child] of Object.entries(value)) {
      assertRawFree(child, childKey);
    }
  }
}

function runCli() {
  const [inputPath = "reports/resume-reliability-pairs.json", outputPath] =
    process.argv.slice(2);
  const ledger = JSON.parse(readFileSync(resolve(inputPath), "utf8"));
  const report = createResumeReliabilityReport(ledger);
  const rendered = `${JSON.stringify(report, null, 2)}\n`;
  if (outputPath) {
    const target = resolve(outputPath);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, rendered, { mode: 0o600 });
  }
  process.stdout.write(rendered);
}

if (resolve(process.argv[1] ?? "") === fileURLToPath(import.meta.url)) {
  runCli();
}
