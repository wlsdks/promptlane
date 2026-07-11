import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { mkdirSync } from "node:fs";

const FORBIDDEN_KEYS =
  /^(prompt|prompt_body|query|response|output|transcript)$/i;
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
  const independentUsers = input.independent_users ?? [];
  const independentAgentOperators = input.independent_agent_operators ?? [];
  const enoughData =
    pairs.length >= minimums.pairs && taskTypes.size >= minimums.task_types;

  return {
    version: 1,
    design: "matched_observational",
    status: enoughData ? "directional_evidence_ready" : "insufficient_data",
    causal_claim: false,
    pair_count: pairs.length,
    task_type_count: taskTypes.size,
    independent_user_count: independentUsers.length,
    independent_agent_operator_count: independentAgentOperators.length,
    independent_agent_operator_success_rate:
      independentAgentOperators.length === 0
        ? null
        : mean(
            independentAgentOperators.map((operator) =>
              operator.install_success && operator.first_value_success ? 1 : 0,
            ),
          ),
    public_readiness: publicReadiness(
      independentUsers,
      minimums.independent_users,
      input.critical_blockers ?? 0,
    ),
    task_types: Array.from(taskTypes).sort(),
    by_task_type: Object.fromEntries(
      Array.from(taskTypes)
        .sort()
        .map((taskType) => [
          taskType,
          taskTypeReport(pairs.filter((pair) => pair.task_type === taskType)),
        ]),
    ),
    minimums,
    baseline,
    looprelay,
    delta: {
      success_rate: roundMetric(looprelay.success_rate - baseline.success_rate),
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
    adoption_rate: mean(pairs.map((pair) => (pair.looprelay.adopted ? 1 : 0))),
    bias: {
      baseline_first: pairs.filter((pair) => pair.order === "baseline_first")
        .length,
      looprelay_first: pairs.filter((pair) => pair.order === "looprelay_first")
        .length,
      position_consistency: meanNullable(
        pairs.map((pair) =>
          pair.judge.position_consistent === null
            ? null
            : pair.judge.position_consistent
              ? 1
              : 0,
        ),
      ),
      human_review_agreement: meanNullable(
        pairs.map((pair) =>
          pair.judge.preference === "inconsistent"
            ? null
            : pair.judge.preference === pair.human_preference
              ? 1
              : 0,
        ),
      ),
    },
    critical_blockers: input.critical_blockers ?? 0,
    note: "Observational matched-pair evidence only. Null and negative results are retained.",
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
  const taskRows = Object.entries(report.by_task_type)
    .map(([taskType, values], index) =>
      renderTaskTypeRow(taskType, values, 625 + index * 46),
    )
    .join("\n");
  const badge =
    report.status === "insufficient_data"
      ? "INSUFFICIENT DATA"
      : "DIRECTIONAL EVIDENCE";

  return `<svg xmlns="http://www.w3.org/2000/svg" width="920" height="820" viewBox="0 0 920 820" role="img" aria-labelledby="title desc">
  <title id="title">LoopRelay engineering usefulness</title>
  <desc id="desc">Baseline and LoopRelay matched-pair engineering outcomes and costs.</desc>
  <rect width="920" height="820" rx="12" fill="#fbfaf6"/>
  <text x="36" y="42" font-family="system-ui,sans-serif" font-size="22" font-weight="700" fill="#171816">LoopRelay engineering usefulness</text>
  <text x="36" y="70" font-family="system-ui,sans-serif" font-size="13" fill="#64665f">${report.pair_count} matched pairs · ${report.task_type_count} task types · causal claim: false</text>
  <rect x="704" y="25" width="180" height="30" rx="15" fill="${report.status === "insufficient_data" ? "#f5e6c8" : "#dadece"}"/>
  <text x="794" y="45" text-anchor="middle" font-family="system-ui,sans-serif" font-size="11" font-weight="700" fill="${report.status === "insufficient_data" ? "#7a4700" : "#154f48"}">${badge}</text>
  <rect x="36" y="92" width="12" height="12" rx="2" fill="#8a887f"/><text x="56" y="103" font-family="system-ui,sans-serif" font-size="12" fill="#64665f">Baseline</text>
  <rect x="126" y="92" width="12" height="12" rx="2" fill="#1f6f64"/><text x="146" y="103" font-family="system-ui,sans-serif" font-size="12" fill="#64665f">LoopRelay</text>
${rows}
  <line x1="36" y1="570" x2="884" y2="570" stroke="#d8d4ca"/>
  <text x="36" y="598" font-family="system-ui,sans-serif" font-size="14" font-weight="700" fill="#171816">Success rate by task type</text>
${taskRows}
  <line x1="36" y1="770" x2="884" y2="770" stroke="#d8d4ca"/>
  <text x="36" y="795" font-family="system-ui,sans-serif" font-size="12" fill="#64665f">Higher is better for success, actionability, and friction-free. Lower is better for time, calls, and tokens.</text>
  <text x="884" y="795" text-anchor="end" font-family="system-ui,sans-serif" font-size="12" fill="#64665f">minimum ${report.minimums.pairs} pairs / ${report.minimums.task_types} task types</text>
</svg>\n`;
}

export function renderReadmeResultBlock(report, locale) {
  const taskRows = Object.entries(report.by_task_type)
    .map(([taskType, values]) => {
      const delta = values.success_rate_delta * 100;
      return `| ${humanize(taskType)} | ${values.pair_count} | ${percent(values.baseline_success_rate * 100)} | ${percent(values.looprelay_success_rate * 100)} | ${delta > 0 ? "+" : ""}${round(delta)}pp |`;
    })
    .join("\n");
  const tokenDeltaPercent =
    report.baseline.mean_input_tokens === 0
      ? 0
      : (report.delta.mean_input_tokens / report.baseline.mean_input_tokens) *
        100;

  if (locale === "ko") {
    return `현재 결과는 maintainer-run observational evidence이며 인과관계를 주장하지 않습니다. ${report.pair_count}개 matched pair와 ${report.task_type_count}개 작업 유형을 포함합니다. 독립 사용자 검증은 ${report.independent_user_count}/${report.minimums.independent_users}명입니다. 별도의 독립 Codex agent operator는 ${report.independent_agent_operator_count}개이며 첫 가치 성공률은 ${report.independent_agent_operator_success_rate === null ? "N/A" : percent(report.independent_agent_operator_success_rate * 100)}입니다. Agent operator는 사람 사용자로 계산하지 않습니다.

| 작업 유형 | 쌍 | Baseline 성공률 | LoopRelay 성공률 | 차이 |
| --- | ---: | ---: | ---: | ---: |
${taskRows}

전체 성공률은 ${percent(report.baseline.success_rate * 100)}에서 ${percent(report.looprelay.success_rate * 100)}로 변했고 actionability는 ${percent(report.baseline.mean_actionability * 100)}에서 ${percent(report.looprelay.mean_actionability * 100)}로 변했습니다. 평균 input token 비용은 ${round(tokenDeltaPercent)}% 변했습니다. 일반 implementation continuation에서 회귀가 있으므로 LoopRelay를 모든 coding task에 기본 적용해서는 안 됩니다. 독립 사용자 검증 전까지 causal claim은 false입니다.`;
  }

  return `Current results are maintainer-run observational evidence, not a causal claim. They include ${report.pair_count} matched pairs across ${report.task_type_count} task types and ${report.independent_user_count}/${report.minimums.independent_users} independent users. A separate cohort has ${report.independent_agent_operator_count} independent agent operators with ${report.independent_agent_operator_success_rate === null ? "N/A" : percent(report.independent_agent_operator_success_rate * 100)} first-value success; agent operators do not count as human users.

| Task type | Pairs | Baseline success | LoopRelay success | Delta |
| --- | ---: | ---: | ---: | ---: |
${taskRows}

Aggregate success moved from ${percent(report.baseline.success_rate * 100)} to ${percent(report.looprelay.success_rate * 100)}, while actionability moved from ${percent(report.baseline.mean_actionability * 100)} to ${percent(report.looprelay.mean_actionability * 100)}. Mean input-token cost changed by ${round(tokenDeltaPercent)}%. Because ordinary implementation continuation regressed, LoopRelay should not intervene by default in every coding task. The causal claim remains false until independent-user validation is complete.`;
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

function renderTaskTypeRow(taskType, values, y) {
  const baseline = values.baseline_success_rate * 100;
  const looprelay = values.looprelay_success_rate * 100;
  const delta = values.success_rate_delta * 100;
  return `  <text x="36" y="${y + 13}" font-family="system-ui,sans-serif" font-size="12" font-weight="600" fill="#171816">${humanize(taskType)}</text>
  <rect x="250" y="${y}" width="${baseline * 2.1}" height="16" rx="3" fill="#8a887f"/>
  <text x="470" y="${y + 13}" font-family="ui-monospace,monospace" font-size="11" fill="#171816">${percent(baseline)}</text>
  <rect x="530" y="${y}" width="${looprelay * 2.1}" height="16" rx="3" fill="#1f6f64"/>
  <text x="750" y="${y + 13}" font-family="ui-monospace,monospace" font-size="11" fill="#171816">${percent(looprelay)}</text>
  <text x="884" y="${y + 13}" text-anchor="end" font-family="ui-monospace,monospace" font-size="11" font-weight="700" fill="${delta < 0 ? "#b42318" : delta > 0 ? "#154f48" : "#64665f"}">${delta > 0 ? "+" : ""}${round(delta)}pp</text>`;
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

function taskTypeReport(pairs) {
  const baseline = aggregateCondition(pairs.map((pair) => pair.baseline));
  const looprelay = aggregateCondition(pairs.map((pair) => pair.looprelay));
  return {
    pair_count: pairs.length,
    baseline_success_rate: baseline.success_rate,
    looprelay_success_rate: looprelay.success_rate,
    success_rate_delta: roundMetric(
      looprelay.success_rate - baseline.success_rate,
    ),
    baseline_actionability: baseline.mean_actionability,
    looprelay_actionability: looprelay.mean_actionability,
  };
}

function validateLedger(input) {
  if (!input || typeof input !== "object")
    throw new Error("ledger is required");
  if (input.causal_claim !== false)
    throw new Error("causal_claim must be false");
  validatePrivacy(input);
  if (input.version !== 1 || input.design !== "matched_observational") {
    throw new Error("unsupported usefulness ledger contract");
  }
  if (!Array.isArray(input.pairs) || input.pairs.length === 0) {
    throw new Error("at least one matched pair is required");
  }
  if (
    !Number.isInteger(input.minimums?.pairs) ||
    !Number.isInteger(input.minimums?.task_types) ||
    !Number.isInteger(input.minimums?.independent_users)
  ) {
    throw new Error("integer minimums are required");
  }
  if (!Array.isArray(input.independent_users)) {
    throw new Error("independent_users must be an array");
  }
  for (const user of input.independent_users) validateIndependentUser(user);
  if (!Array.isArray(input.independent_agent_operators)) {
    throw new Error("independent_agent_operators must be an array");
  }
  for (const operator of input.independent_agent_operators) {
    validateAgentOperator(operator);
  }
  const ids = new Set();
  for (const pair of input.pairs) {
    if (!/^[a-z0-9-]+$/.test(pair.id) || ids.has(pair.id)) {
      throw new Error("pair ids must be unique raw-free labels");
    }
    ids.add(pair.id);
    if (!TASK_TYPES.has(pair.task_type))
      throw new Error("unsupported task type");
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
    if (
      pair.judge?.preference !== undefined &&
      !new Set(["baseline", "looprelay", "tie", "inconsistent"]).has(
        pair.judge.preference,
      )
    ) {
      throw new Error("invalid judge preference");
    }
  }
}

function validateAgentOperator(operator) {
  if (!/^[a-z0-9-]+$/.test(operator?.id ?? "")) {
    throw new Error("agent operator ids must be raw-free labels");
  }
  for (const key of [
    "install_success",
    "first_value_success",
    "privacy_blocker",
    "data_loss_blocker",
  ]) {
    if (typeof operator[key] !== "boolean") {
      throw new Error(`agent operator field is required: ${key}`);
    }
  }
  for (const key of [
    "install_elapsed_ms",
    "time_to_first_value_ms",
    "command_count",
    "input_tokens",
    "recovery_count",
    "friction_count",
  ]) {
    if (!Number.isFinite(operator[key]) || operator[key] < 0) {
      throw new Error(`invalid agent operator metric: ${key}`);
    }
  }
}

function validateIndependentUser(user) {
  if (!/^[a-z0-9-]+$/.test(user?.id ?? "")) {
    throw new Error("independent user ids must be raw-free labels");
  }
  for (const key of [
    "independence_confirmed",
    "install_success",
    "first_value_success",
    "privacy_blocker",
    "data_loss_blocker",
  ]) {
    if (typeof user[key] !== "boolean") {
      throw new Error(`independent user field is required: ${key}`);
    }
  }
  for (const key of [
    "install_elapsed_ms",
    "time_to_first_value_ms",
    "recovery_count",
    "friction_count",
  ]) {
    if (!Number.isFinite(user[key]) || user[key] < 0) {
      throw new Error(`invalid independent user metric: ${key}`);
    }
  }
}

function publicReadiness(users, requiredUsers, criticalBlockers) {
  if (criticalBlockers > 0) {
    return { ready: false, reason: "critical_blocker" };
  }
  if (users.length < requiredUsers) {
    return { ready: false, reason: "independent_users_missing" };
  }
  if (
    users.some(
      (user) =>
        !user.independence_confirmed ||
        !user.install_success ||
        !user.first_value_success ||
        user.privacy_blocker ||
        user.data_loss_blocker,
    )
  ) {
    return { ready: false, reason: "independent_user_flow_failed" };
  }
  return { ready: true, reason: "requirements_met" };
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
    values.map((value) => [
      value,
      items.filter((item) => item[key] === value).length,
    ]),
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

function humanize(value) {
  const text = value.replaceAll("_", " ");
  return `${text.charAt(0).toUpperCase()}${text.slice(1)}`;
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
  const summaryPath = resolve(args[2] ?? "reports/usefulness-summary.json");
  const report = createUsefulnessReport(
    JSON.parse(readFileSync(ledgerPath, "utf8")),
  );
  mkdirSync(dirname(svgPath), { recursive: true });
  mkdirSync(dirname(summaryPath), { recursive: true });
  writeFileSync(svgPath, renderUsefulnessSvg(report), "utf8");
  writeFileSync(summaryPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  updateReadme(resolve("README.md"), report, "en");
  updateReadme(resolve("README.ko.md"), report, "ko");
  process.stdout.write(
    `${JSON.stringify({ status: report.status, pair_count: report.pair_count, task_type_count: report.task_type_count })}\n`,
  );
}

function updateReadme(path, report, locale) {
  const start = "<!-- USEFULNESS_RESULTS_START -->";
  const end = "<!-- USEFULNESS_RESULTS_END -->";
  const source = readFileSync(path, "utf8");
  const replacement = `${start}\n${renderReadmeResultBlock(report, locale)}\n${end}`;
  const pattern = new RegExp(`${start}[\\s\\S]*?${end}`);
  if (!pattern.test(source)) {
    throw new Error(`README usefulness markers are missing: ${path}`);
  }
  writeFileSync(path, source.replace(pattern, replacement), "utf8");
}

if (resolve(process.argv[1] ?? "") === fileURLToPath(import.meta.url)) {
  runCli();
}
