import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { mkdirSync } from "node:fs";

const FORBIDDEN_KEYS = /^(prompt|prompt_body|query|response|output|transcript)$/i;
const SENSITIVE_VALUE =
  /(?:\/Users\/[^\s]+|AKIA[0-9A-Z]{16}|sk-(?:proj-)?[A-Za-z0-9_-]{8,}|gh[opusr]_[A-Za-z0-9]{12,})/;
const TASK_TYPES = new Set([
  "session_recovery",
  "implementation_continuation",
  "failure_prevention",
]);

export function createUsefulnessReport(input) {
  validateLedger(input);
  const pairs = input.pairs;
  const baseline = aggregateCondition(pairs.map((pair) => pair.baseline));
  const looprelay = aggregateCondition(pairs.map((pair) => pair.looprelay));
  const taskTypes = new Set(pairs.map((pair) => pair.task_type));
  const minimums = input.minimums;
  const enoughData =
    pairs.length >= minimums.pairs && taskTypes.size >= minimums.task_types;

  return {
    version: 1,
    design: "matched_observational",
    status: enoughData ? "directional_evidence_ready" : "insufficient_data",
    causal_claim: false,
    pair_count: pairs.length,
    task_type_count: taskTypes.size,
    task_types: Array.from(taskTypes).sort(),
    minimums,
    baseline,
    looprelay,
    delta: {
      success_rate: roundMetric(
        looprelay.success_rate - baseline.success_rate,
      ),
      mean_actionability: roundMetric(
        looprelay.mean_actionability - baseline.mean_actionability,
      ),
      mean_elapsed_ms: nullableDelta(
        baseline.mean_elapsed_ms,
        looprelay.mean_elapsed_ms,
      ),
      mean_tool_calls: roundMetric(
        looprelay.mean_tool_calls - baseline.mean_tool_calls,
      ),
      mean_input_tokens: roundMetric(
        looprelay.mean_input_tokens - baseline.mean_input_tokens,
      ),
      friction_free_rate: roundMetric(
        looprelay.friction_free_rate - baseline.friction_free_rate,
      ),
    },
    transitions: transitionCounts(pairs),
    preference: countValues(pairs, "human_preference", [
      "baseline",
      "looprelay",
      "tie",
    ]),
    adoption_rate: mean(
      pairs.map((pair) => (pair.looprelay.adopted ? 1 : 0)),
    ),
    bias: {
      baseline_first: pairs.filter((pair) => pair.order === "baseline_first")
        .length,
      looprelay_first: pairs.filter(
        (pair) => pair.order === "looprelay_first",
      ).length,
      position_consistency: meanNullable(
        pairs.map((pair) =>
          pair.judge.position_consistent === null
            ? null
            : pair.judge.position_consistent
              ? 1
              : 0,
        ),
      ),
    },
    critical_blockers: input.critical_blockers ?? 0,
    note:
      "Observational matched-pair evidence only. Null and negative results are retained.",
  };
}

export function renderUsefulnessSvg(report) {
  const metrics = [
    {
      label: "Success rate",
      baseline: report.baseline.success_rate * 100,
      looprelay: report.looprelay.success_rate * 100,
      format: percent,
    },
    {
      label: "Actionability",
      baseline: report.baseline.mean_actionability * 100,
      looprelay: report.looprelay.mean_actionability * 100,
      format: percent,
    },
    {
      label: "Friction-free",
      baseline: report.baseline.friction_free_rate * 100,
      looprelay: report.looprelay.friction_free_rate * 100,
      format: percent,
    },
    {
      label: "Elapsed time",
      baseline: divideNullable(report.baseline.mean_elapsed_ms, 1_000),
      looprelay: divideNullable(report.looprelay.mean_elapsed_ms, 1_000),
      format: (value) => (value === null ? "N/A" : `${round(value)}s`),
    },
    {
      label: "Tool calls",
      baseline: report.baseline.mean_tool_calls,
      looprelay: report.looprelay.mean_tool_calls,
      format: (value) => `${round(value)}`,
    },
    {
      label: "Input tokens",
      baseline: report.baseline.mean_input_tokens / 1_000,
      looprelay: report.looprelay.mean_input_tokens / 1_000,
      format: (value) => `${round(value)}k`,
    },
  ];
  const rows = metrics
    .map((metric, index) => renderMetric(metric, 150 + index * 70))
    .join("\n");
  const badge =
    report.status === "insufficient_data"
      ? "INSUFFICIENT DATA"
      : "DIRECTIONAL EVIDENCE";

  return `<svg xmlns="http://www.w3.org/2000/svg" width="920" height="630" viewBox="0 0 920 630" role="img" aria-labelledby="title desc">
  <title id="title">LoopRelay engineering usefulness</title>
  <desc id="desc">Baseline and LoopRelay matched-pair engineering outcomes and costs.</desc>
  <rect width="920" height="630" rx="12" fill="#fbfaf6"/>
  <text x="36" y="42" font-family="system-ui,sans-serif" font-size="22" font-weight="700" fill="#171816">LoopRelay engineering usefulness</text>
  <text x="36" y="70" font-family="system-ui,sans-serif" font-size="13" fill="#64665f">${report.pair_count} matched pairs · ${report.task_type_count} task types · causal claim: false</text>
  <rect x="704" y="25" width="180" height="30" rx="15" fill="${report.status === "insufficient_data" ? "#f5e6c8" : "#dadece"}"/>
  <text x="794" y="45" text-anchor="middle" font-family="system-ui,sans-serif" font-size="11" font-weight="700" fill="${report.status === "insufficient_data" ? "#7a4700" : "#154f48"}">${badge}</text>
  <rect x="36" y="92" width="12" height="12" rx="2" fill="#8a887f"/><text x="56" y="103" font-family="system-ui,sans-serif" font-size="12" fill="#64665f">Baseline</text>
  <rect x="126" y="92" width="12" height="12" rx="2" fill="#1f6f64"/><text x="146" y="103" font-family="system-ui,sans-serif" font-size="12" fill="#64665f">LoopRelay</text>
${rows}
  <line x1="36" y1="578" x2="884" y2="578" stroke="#d8d4ca"/>
  <text x="36" y="603" font-family="system-ui,sans-serif" font-size="12" fill="#64665f">Higher is better for success, actionability, and friction-free. Lower is better for time, calls, and tokens.</text>
  <text x="884" y="603" text-anchor="end" font-family="system-ui,sans-serif" font-size="12" fill="#64665f">minimum ${report.minimums.pairs} pairs / ${report.minimums.task_types} task types</text>
</svg>\n`;
}

function renderMetric(metric, y) {
  const max = Math.max(metric.baseline ?? 0, metric.looprelay ?? 0, 1);
  const baselineWidth = ((metric.baseline ?? 0) / max) * 480;
  const looprelayWidth = ((metric.looprelay ?? 0) / max) * 480;
  return `  <text x="36" y="${y + 12}" font-family="system-ui,sans-serif" font-size="13" font-weight="600" fill="#171816">${metric.label}</text>
  <rect x="170" y="${y}" width="${baselineWidth}" height="18" rx="3" fill="#8a887f"/>
  <text x="${Math.max(180, 180 + baselineWidth)}" y="${y + 14}" font-family="ui-monospace,monospace" font-size="11" fill="#171816">${metric.format(metric.baseline)}</text>
  <rect x="170" y="${y + 25}" width="${looprelayWidth}" height="18" rx="3" fill="#1f6f64"/>
  <text x="${Math.max(180, 180 + looprelayWidth)}" y="${y + 39}" font-family="ui-monospace,monospace" font-size="11" fill="#171816">${metric.format(metric.looprelay)}</text>`;
}

function aggregateCondition(values) {
  return {
    success_rate: mean(values.map((value) => (value.passed ? 1 : 0))),
    mean_actionability: mean(values.map((value) => value.actionability)),
    mean_elapsed_ms: meanNullable(values.map((value) => value.elapsed_ms)),
    mean_tool_calls: mean(values.map((value) => value.tool_calls)),
    mean_input_tokens: mean(values.map((value) => value.input_tokens)),
    mean_output_tokens: mean(values.map((value) => value.output_tokens)),
    friction_free_rate: mean(
      values.map((value) => (value.friction_count === 0 ? 1 : 0)),
    ),
  };
}

function transitionCounts(pairs) {
  const counts = {
    improved: 0,
    regressed: 0,
    unchanged_passed: 0,
    unchanged_failed: 0,
  };
  for (const pair of pairs) {
    if (!pair.baseline.passed && pair.looprelay.passed) counts.improved += 1;
    else if (pair.baseline.passed && !pair.looprelay.passed)
      counts.regressed += 1;
    else if (pair.baseline.passed) counts.unchanged_passed += 1;
    else counts.unchanged_failed += 1;
  }
  return counts;
}

function validateLedger(input) {
  if (!input || typeof input !== "object") throw new Error("ledger is required");
  if (input.causal_claim !== false) throw new Error("causal_claim must be false");
  validatePrivacy(input);
  if (input.version !== 1 || input.design !== "matched_observational") {
    throw new Error("unsupported usefulness ledger contract");
  }
  if (!Array.isArray(input.pairs) || input.pairs.length === 0) {
    throw new Error("at least one matched pair is required");
  }
  if (
    !Number.isInteger(input.minimums?.pairs) ||
    !Number.isInteger(input.minimums?.task_types)
  ) {
    throw new Error("integer minimums are required");
  }
  const ids = new Set();
  for (const pair of input.pairs) {
    if (!/^[a-z0-9-]+$/.test(pair.id) || ids.has(pair.id)) {
      throw new Error("pair ids must be unique raw-free labels");
    }
    ids.add(pair.id);
    if (!TASK_TYPES.has(pair.task_type)) throw new Error("unsupported task type");
    if (!new Set(["baseline_first", "looprelay_first"]).has(pair.order)) {
      throw new Error("invalid pair order");
    }
    validateCondition(pair.baseline, false);
    validateCondition(pair.looprelay, true);
    if (!new Set(["baseline", "looprelay", "tie"]).has(pair.human_preference)) {
      throw new Error("invalid human preference");
    }
    if (
      pair.judge?.position_consistent !== null &&
      typeof pair.judge?.position_consistent !== "boolean"
    ) {
      throw new Error("position consistency is required");
    }
  }
}

function validateCondition(value, treatment) {
  if (!value || typeof value.passed !== "boolean") {
    throw new Error("condition pass result is required");
  }
  for (const key of [
    "actionability",
    "elapsed_ms",
    "tool_calls",
    "input_tokens",
    "output_tokens",
    "friction_count",
  ]) {
    if (
      (key === "elapsed_ms" && value[key] === null) ||
      (Number.isFinite(value[key]) && value[key] >= 0)
    ) {
      continue;
    }
    throw new Error(`invalid condition metric: ${key}`);
  }
  if (value.actionability > 1) throw new Error("actionability must be 0..1");
  if (treatment && typeof value.adopted !== "boolean") {
    throw new Error("treatment adoption is required");
  }
}

function validatePrivacy(value, key = "") {
  if (FORBIDDEN_KEYS.test(key)) {
    throw new Error("prompt-bearing fields are not allowed");
  }
  if (typeof value === "string" && SENSITIVE_VALUE.test(value)) {
    throw new Error("sensitive or raw-path content is not allowed");
  }
  if (Array.isArray(value)) {
    for (const item of value) validatePrivacy(item, key);
  } else if (value && typeof value === "object") {
    for (const [childKey, child] of Object.entries(value)) {
      validatePrivacy(child, childKey);
    }
  }
}

function countValues(items, key, values) {
  return Object.fromEntries(
    values.map((value) => [value, items.filter((item) => item[key] === value).length]),
  );
}

function mean(values) {
  return Number(
    (values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(6),
  );
}

function meanNullable(values) {
  const known = values.filter((value) => Number.isFinite(value));
  return known.length > 0 ? mean(known) : null;
}

function nullableDelta(baseline, looprelay) {
  return baseline === null || looprelay === null
    ? null
    : roundMetric(looprelay - baseline);
}

function divideNullable(value, divisor) {
  return value === null ? null : value / divisor;
}

function roundMetric(value) {
  return Number(value.toFixed(6));
}

function percent(value) {
  return `${round(value)}%`;
}

function round(value) {
  return Math.round(value * 10) / 10;
}

function runCli() {
  const args = process.argv.slice(2);
  const ledgerPath = resolve(args[0] ?? "reports/usefulness-pairs.json");
  const svgPath = resolve(args[1] ?? "docs/assets/usefulness-results.svg");
  const summaryPath = resolve(
    args[2] ?? "reports/usefulness-summary.json",
  );
  const report = createUsefulnessReport(
    JSON.parse(readFileSync(ledgerPath, "utf8")),
  );
  mkdirSync(dirname(svgPath), { recursive: true });
  mkdirSync(dirname(summaryPath), { recursive: true });
  writeFileSync(svgPath, renderUsefulnessSvg(report), "utf8");
  writeFileSync(summaryPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  process.stdout.write(
    `${JSON.stringify({ status: report.status, pair_count: report.pair_count, task_type_count: report.task_type_count })}\n`,
  );
}

if (resolve(process.argv[1] ?? "") === fileURLToPath(import.meta.url)) {
  runCli();
}
