#!/usr/bin/env node
import Database from "better-sqlite3";
import { performance } from "node:perf_hooks";
import { spawn, spawnSync } from "node:child_process";
import {
  existsSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import net from "node:net";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

import {
  buildBenchmarkEvidenceState,
  buildBenchmarkOutcomeSeeds,
  buildNoFixturesReport,
  formatBenchmarkEvidenceStateLines,
  formatNoFixturesReportLines,
  loadBenchmarkFixtures,
} from "./benchmark-fixtures.mjs";
import {
  benchmarkCorpusFingerprint,
  compareBenchmarkReports,
  incompatibleBenchmarkComparison,
  scoreArchiveEffectivenessEvidence,
  scoreOutcomePassRate,
  scorePairedEffectiveness,
  scorePromptQualityEvidence,
} from "./benchmark-scores.mjs";
import {
  analyzePrompt,
  EXPERIMENTAL_RULE_IDS,
} from "../dist/analysis/analyze.js";
import { improvePrompt } from "../dist/analysis/improve.js";
import { coachPromptTool } from "../dist/mcp/score-tool.js";

const repoRoot = resolve(new URL("..", import.meta.url).pathname);
const cliPath = join(repoRoot, "dist", "cli", "index.js");
const packageJson = JSON.parse(
  readFileSync(join(repoRoot, "package.json"), "utf8"),
);
const tempRoot = mkdtempSync(join(tmpdir(), "promptlane-benchmark-"));
const dataDir = join(tempRoot, "data");
const homeDir = join(tempRoot, "home");
const rawPathPrefix = "/Users/example";
const rawSecret = "sk-proj-benchmark1234567890abcdef";
const fixtureSet = parseFixtureSet(process.argv);
const realFixturesPath = parseFixtureFile(process.argv, fixtureSet);
const dataset = fixtureSet === "real" ? "benchmark-v1-real" : "benchmark-v1";
const jsonOutput = process.argv.includes("--json");
const loadedFixtures = loadBenchmarkFixtures({
  fixtureSet,
  repoRoot,
  realFixturesPath,
  rawPathPrefix,
  rawSecret,
});
const fixtures = loadedFixtures.fixtures;
const coachCases = loadedFixtures.coachCases;
const cliEnv = {
  ...process.env,
  HOME: homeDir,
  USERPROFILE: homeDir,
};
const thresholds = {
  privacy_leak_count: 0,
  retrieval_top3: 0.8,
  coach_gap_fix_rate: 0.8,
  coach_prompt_actionability: 0.8,
  prompt_quality_score_calibration: 0.8,
  archive_effectiveness_score: 0.8,
  archive_effectiveness_coverage: 0.2,
  outcome_pass_rate: 0.8,
  analytics_score: 0.75,
  ingest_p95_ms: 500,
  search_p95_ms: 250,
  dashboard_ms: 500,
  export_ms: 1000,
};

if (loadedFixtures.status === "no_fixtures") {
  const message = buildNoFixturesReport({
    dataset,
    fixtureSet,
    detail: loadedFixtures.detail,
  });
  if (jsonOutput) {
    console.log(JSON.stringify(message, null, 2));
  } else {
    for (const line of formatNoFixturesReportLines(message)) {
      console.log(line);
    }
  }
  rmSync(tempRoot, { recursive: true, force: true });
  process.exit(0);
}

const baselineInput = readBenchmarkBaseline(process.argv);
const corpusFingerprint = benchmarkCorpusFingerprint({
  fixtureSet,
  fixtures,
  coachCases,
});

let serverProcess;

try {
  assert(existsSync(cliPath), "Run `pnpm build` before benchmark.");
  mkdirSync(homeDir, { recursive: true });
  const serverPort = await freePort();
  const serverBaseUrl = `http://127.0.0.1:${serverPort}`;

  runCli(["init", "--data-dir", dataDir]);
  configurePort(serverPort);
  serverProcess = startServer();
  await waitForHealth(`${serverBaseUrl}/api/v1/health`);

  const auth = readJson(join(dataDir, "hook-auth.json"));
  const fixtureIds = new Map();
  const ingestDurations = [];

  for (const fixture of fixtures) {
    const duration = await timed(async () => {
      const id = await ingest(serverBaseUrl, auth.ingest_token, fixture);
      fixtureIds.set(fixture.label, id);
    });
    ingestDurations.push(duration);
  }

  const list = await apiGet(serverBaseUrl, auth.app_token, "/api/v1/prompts");
  const details = [];
  for (const item of list.data.items) {
    details.push(
      await apiGet(serverBaseUrl, auth.app_token, `/api/v1/prompts/${item.id}`),
    );
  }
  const outcomeSeeds = buildBenchmarkOutcomeSeeds({
    fixtureSet,
    fixtures,
    fixtureIds,
    syntheticUnsafeEvidenceRefs: [
      `${rawPathPrefix}/benchmark-project/private.txt`,
      rawSecret,
    ],
  });
  seedArchiveEffectivenessOutcomes(outcomeSeeds);
  const archiveScore = await apiGet(
    serverBaseUrl,
    auth.app_token,
    "/api/v1/score?limit=100&low_score_limit=3",
  );

  const searchDurations = [];
  const retrievalCases = [];
  let retrievalHits = 0;
  for (const fixture of fixtures) {
    const expectedId = fixtureIds.get(fixture.label);
    let searchResult;
    const duration = await timed(async () => {
      searchResult = await apiGet(
        serverBaseUrl,
        auth.app_token,
        `/api/v1/prompts?q=${encodeURIComponent(fixture.query)}`,
      );
    });
    searchDurations.push(duration);
    const top3 = searchResult.data.items.slice(0, 3).map((item) => item.id);
    const rank =
      searchResult.data.items.findIndex((item) => item.id === expectedId) + 1;
    const hit = top3.includes(expectedId);
    retrievalCases.push({
      label: fixture.label,
      query: fixture.query,
      hit,
      rank: rank > 0 ? rank : null,
    });
    if (hit) {
      retrievalHits += 1;
    }
  }

  let dashboard;
  const dashboardMs = await timed(async () => {
    dashboard = await apiGet(serverBaseUrl, auth.app_token, "/api/v1/quality");
  });

  const {
    preview,
    exported,
    duration: exportMs,
  } = await runExportFlow(serverBaseUrl);

  const coachScore = scorePromptLane();
  const coachPromptActionability = scoreCoachPromptActionability();
  const promptQualityEvidence = scorePromptQualityEvidence({
    fixtureSet,
    listItems: list.data.items,
    detailItems: details.map((detail) => detail.data),
    fixtureCount: fixtures.length,
  });
  const scoreCalibration = promptQualityEvidence.score;
  const archiveEffectivenessScore = scoreArchiveEffectivenessEvidence({
    fixtureSet,
    report: archiveScore.data,
    fixtureCount: fixtures.length,
    forbiddenValues: [rawSecret, rawPathPrefix],
  });
  const archiveEffectivenessCoverage = scoreArchiveEffectivenessCoverage(
    archiveScore.data,
  );
  const outcomePassRate = scoreOutcomePassRate(
    archiveScore.data.effectiveness_summary,
  );
  const pairedEffectiveness = scorePairedEffectiveness(fixtures);
  const analyticsScore = scoreAnalytics(dashboard.data);
  const privacyLeakCount = countPrivacyLeaks({
    list,
    details,
    archiveScore,
    dashboard,
    preview,
    exported,
  });

  const scores = {
    privacy_leak_count: privacyLeakCount,
    retrieval_top3: roundScore(retrievalHits / fixtures.length),
    coach_gap_fix_rate: coachScore,
    coach_prompt_actionability: coachPromptActionability,
    prompt_quality_score_calibration: scoreCalibration,
    archive_effectiveness_score: archiveEffectivenessScore,
    archive_effectiveness_coverage: archiveEffectivenessCoverage,
    outcome_pass_rate: outcomePassRate,
    analytics_score: analyticsScore,
    ingest_p95_ms: Math.round(p95(ingestDurations)),
    search_p95_ms: Math.round(p95(searchDurations)),
    dashboard_ms: Math.round(dashboardMs),
    export_ms: Math.round(exportMs),
  };
  const experimentalComparison = scoreExperimentalRulesAB();
  const pass = passes(scores);
  const comparison =
    baselineInput.status === "loaded"
      ? compareBenchmarkReports({
          current: {
            fixture_set: fixtureSet,
            corpus_fingerprint: corpusFingerprint,
            scores,
          },
          baseline: baselineInput.report,
        })
      : baselineInput.status === "invalid"
        ? incompatibleBenchmarkComparison({
            corpusFingerprint,
            reason: baselineInput.reason,
          })
        : {
            status: "not_requested",
            corpus_fingerprint: corpusFingerprint,
            improvements: [],
            regressions: [],
            unchanged: [],
          };

  const report = {
    version: packageJson.version,
    dataset,
    fixture_set: fixtureSet,
    corpus_fingerprint: corpusFingerprint,
    soft_signal: fixtureSet === "real",
    generated_at: new Date().toISOString(),
    pass,
    evidence_state: buildBenchmarkEvidenceState({
      fixtureSet,
      status: "ready",
      pass,
      outcomeCount: fixtureSet === "real" ? outcomeSeeds.length : 0,
      comparisonStatus: comparison.status,
      regressionCount: comparison.regressions.length,
    }),
    next_action: benchmarkNextAction({
      fixtureSet,
      pass,
      outcomeCount: fixtureSet === "real" ? outcomeSeeds.length : 0,
      comparison,
      pairedEffectiveness,
    }),
    scores,
    thresholds,
    comparison,
    counts: {
      prompts: fixtures.length,
      retrieval_cases: fixtures.length,
      coach_cases: coachCases.length,
      outcome_cases: outcomeSeeds.length,
      effect_pairs: pairedEffectiveness.pair_count,
    },
    details: {
      retrieval_cases: retrievalCases,
      archive_effectiveness: archiveScore.data.effectiveness_summary,
      prompt_quality: promptQualityEvidence,
      outcome_provenance:
        fixtureSet === "real"
          ? outcomeSeeds.length > 0
            ? "operator_confirmed_fixture_metadata"
            : "none"
          : "synthetic_regression_seed",
      paired_effectiveness: pairedEffectiveness,
      experimental_rules_ab: experimentalComparison,
    },
  };

  if (jsonOutput) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    printReport(report);
  }

  if (comparison.status === "incompatible") {
    process.exitCode = 1;
  } else if (!report.pass) {
    if (fixtureSet === "real") {
      console.warn(
        outcomeSeeds.length === 0
          ? "warning: real prompts ran without operator outcome metadata — effectiveness remains unproven."
          : "warning: real fixture set failed thresholds — exiting 0 (soft signal). Synthetic remains the hard gate.",
      );
    } else {
      process.exitCode = 1;
    }
  }
} finally {
  if (serverProcess) {
    serverProcess.kill("SIGTERM");
    await waitForExit(serverProcess);
  }
  rmSync(tempRoot, { recursive: true, force: true });
}

function scoreExperimentalRulesAB() {
  const cases = [
    ...fixtures.map((fixture) => ({
      label: fixture.label,
      prompt: fixture.prompt,
    })),
    ...coachCases.map((prompt, index) => ({
      label: `coach_case_${index + 1}`,
      prompt,
    })),
  ];
  const now = new Date().toISOString();
  const ruleResults = {};
  for (const rule of EXPERIMENTAL_RULE_IDS) {
    let liftCount = 0;
    let totalDelta = 0;
    let unchangedCount = 0;
    const liftedLabels = [];
    for (const fixture of cases) {
      const baseline = analyzePrompt({
        prompt: fixture.prompt,
        createdAt: now,
      }).quality_score.value;
      const experimental = analyzePrompt({
        prompt: fixture.prompt,
        createdAt: now,
        experimentalRules: [rule],
      }).quality_score.value;
      const delta = experimental - baseline;
      if (delta > 0) {
        liftCount += 1;
        liftedLabels.push(`${fixture.label}+${delta}`);
      } else if (delta === 0) {
        unchangedCount += 1;
      }
      totalDelta += delta;
    }
    ruleResults[rule] = {
      cases: cases.length,
      lifted: liftCount,
      unchanged: unchangedCount,
      regressed: cases.length - liftCount - unchangedCount,
      total_delta: totalDelta,
      average_delta: roundScore(totalDelta / cases.length),
      examples: liftedLabels.slice(0, 5),
    };
  }
  return ruleResults;
}

function scorePromptLane() {
  let passed = 0;
  for (const prompt of coachCases) {
    const result = improvePrompt({
      prompt,
      createdAt: new Date().toISOString(),
    });
    const text = result.improved_prompt;
    const hasSections = [
      "## Goal",
      "## Context",
      "## Scope",
      "## Verification",
      "## Output",
    ].every((section) => text.includes(section));
    const safe = !text.includes(rawSecret);
    if (hasSections && safe) {
      passed += 1;
    }
  }
  return roundScore(passed / coachCases.length);
}

function scoreCoachPromptActionability() {
  const result = coachPromptTool(
    { max_prompts: 100, low_score_limit: 3 },
    { dataDir },
  );
  const serialized = JSON.stringify(result);
  const checks = [
    result.mode === "agent_coach",
    result.status.status === "ready",
    result.agent_brief.headline.includes("Latest prompt score"),
    typeof result.agent_brief.first_fix?.instruction === "string" &&
      result.agent_brief.first_fix.instruction.length > 20,
    typeof result.agent_brief.review_target?.prompt_id === "string" &&
      result.agent_brief.review_target.prompt_id.length > 0,
    typeof result.agent_brief.next_request_template === "string" &&
      result.agent_brief.next_request_template.includes("Goal:") &&
      result.agent_brief.next_request_template.includes("Verification:"),
    result.agent_brief.summary.includes("Effectiveness evidence"),
    result.agent_brief.next_actions.some((action) =>
      action.includes("unmeasured prompt"),
    ),
    result.agent_brief.next_actions.some((action) =>
      action.includes("benchmark:effectiveness"),
    ),
    result.agent_brief.next_actions.length >= 3,
    !serialized.includes(rawSecret) && !serialized.includes(rawPathPrefix),
  ];

  return roundScore(checks.filter(Boolean).length / checks.length);
}

function scoreAnalytics(dashboard) {
  const checks = [
    dashboard.total_prompts === fixtures.length,
    dashboard.sensitive_prompts >= 1,
    dashboard.distribution.by_tool.length >= 2,
    dashboard.distribution.by_project.some(
      (bucket) => bucket.label === "benchmark-project",
    ),
    dashboard.missing_items.length > 0,
    dashboard.instruction_suggestions.length > 0,
  ];
  return roundScore(checks.filter(Boolean).length / checks.length);
}

function scoreArchiveEffectivenessCoverage(report) {
  const summary = report.effectiveness_summary;
  return roundScore(summary.measured_prompts / fixtures.length);
}

function seedArchiveEffectivenessOutcomes(seeds) {
  const db = new Database(join(dataDir, "promptlane.sqlite"));
  try {
    const insert = db.prepare(
      `
      INSERT INTO loop_snapshots (
        id,
        created_at,
        tool,
        source,
        session_id,
        thread_id,
        cwd_label,
        project_id,
        git_root_hash,
        branch,
        worktree_label,
        prompt_ids_json,
        event_counts_json,
        quality_json,
        outcome_json,
        next_brief_json,
        privacy_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
    );
    for (const seed of seeds) {
      assert(
        seed.promptId,
        "Benchmark effectiveness fixture prompt id is missing.",
      );
      insert.run(
        `loop_benchmark_effectiveness_${seed.label}`,
        new Date().toISOString(),
        seed.tool,
        "mcp",
        `benchmark-${seed.label}`,
        null,
        "benchmark-project",
        "proj_benchmark",
        null,
        `benchmark/${seed.label}`,
        seed.label,
        JSON.stringify([seed.promptId]),
        JSON.stringify({
          prompts: 1,
          tests_run: seed.outcome.tests_run,
        }),
        JSON.stringify({
          average_prompt_score: 80,
          top_gaps: ["verification_criteria"],
          unresolved_questions: [],
        }),
        JSON.stringify({
          status: seed.outcome.status,
          summary: seed.outcome.summary,
          evidence_refs: seed.outcome.evidence_refs,
          ...(seed.outcome.improvement_used
            ? { used_improvement_prompt_ids: [seed.promptId] }
            : {}),
        }),
        JSON.stringify({
          generated: true,
          prompt_id: seed.promptId,
          summary: "Continue from benchmark effectiveness evidence.",
        }),
        JSON.stringify({
          stores_prompt_bodies: false,
          stores_raw_paths: false,
          local_only: true,
        }),
      );
    }
  } finally {
    db.close();
  }
}

function countPrivacyLeaks(surfaces) {
  let leakCount = 0;
  const browserAndExport = JSON.stringify(surfaces);
  for (const forbidden of [rawPathPrefix, rawSecret]) {
    if (browserAndExport.includes(forbidden)) {
      leakCount += 1;
    }
  }

  const db = new Database(join(dataDir, "promptlane.sqlite"));
  try {
    for (const table of ["prompts", "prompt_analyses", "redaction_events"]) {
      const rows = JSON.stringify(db.prepare(`SELECT * FROM ${table}`).all());
      if (rows.includes(rawSecret)) {
        leakCount += 1;
      }
    }
  } finally {
    db.close();
  }

  return leakCount;
}

async function runExportFlow(serverBaseUrl) {
  const session = await fetch(`${serverBaseUrl}/api/v1/session`);
  const cookie = session.headers.get("set-cookie");
  const csrfToken = (await session.json()).data.csrf_token;
  let preview;
  let exported;
  const duration = await timed(async () => {
    preview = await apiPost(
      serverBaseUrl,
      "/api/v1/exports/preview",
      { preset: "anonymized_review" },
      cookie,
      csrfToken,
    );
    exported = await apiPost(
      serverBaseUrl,
      "/api/v1/exports",
      { job_id: preview.data.id },
      cookie,
      csrfToken,
    );
  });
  return { preview, exported, duration };
}

async function ingest(serverBaseUrl, ingestToken, fixture) {
  const payload = {
    session_id: `benchmark-${fixture.label}`,
    transcript_path:
      fixture.adapter === "claude-code"
        ? `${rawPathPrefix}/.claude/session.jsonl`
        : `${rawPathPrefix}/.codex/sessions/session.jsonl`,
    cwd: `${rawPathPrefix}/benchmark-project`,
    hook_event_name: "UserPromptSubmit",
    prompt: fixture.prompt,
  };
  if (fixture.adapter === "claude-code") {
    payload.permission_mode = "default";
  } else {
    payload.turn_id = `turn-${fixture.label}`;
    payload.model = "gpt-5.5";
  }

  const response = await fetch(
    `${serverBaseUrl}/api/v1/ingest/${fixture.adapter}`,
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${ingestToken}`,
      },
      body: JSON.stringify(payload),
    },
  );
  const body = await response.json();
  if (!response.ok || !body.data?.stored) {
    throw new Error(`Ingest failed: ${JSON.stringify(body)}`);
  }
  return body.data.id;
}

async function apiGet(serverBaseUrl, appToken, path) {
  const response = await fetch(`${serverBaseUrl}${path}`, {
    headers: {
      authorization: `Bearer ${appToken}`,
    },
  });
  const body = await response.json();
  if (!response.ok) {
    throw new Error(`GET ${path} failed: ${JSON.stringify(body)}`);
  }
  return body;
}

async function apiPost(serverBaseUrl, path, payload, cookie, csrfToken) {
  const response = await fetch(`${serverBaseUrl}${path}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      cookie,
      "x-csrf-token": csrfToken,
    },
    body: JSON.stringify(payload),
  });
  const body = await response.json();
  if (!response.ok) {
    throw new Error(`POST ${path} failed: ${JSON.stringify(body)}`);
  }
  return body;
}

function runCli(args) {
  const result = spawnSync("node", [cliPath, ...args], {
    env: cliEnv,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  if (result.status !== 0) {
    throw new Error(
      `CLI failed: promptlane ${args.join(" ")}\n${result.stderr}`,
    );
  }
  return result.stdout.trim();
}

function configurePort(port) {
  const configPath = join(dataDir, "config.json");
  const config = readJson(configPath);
  config.server.port = port;
  writeFileSync(configPath, `${JSON.stringify(config, null, 2)}\n`, {
    mode: 0o600,
  });
}

function startServer() {
  const child = spawn("node", [cliPath, "server", "--data-dir", dataDir], {
    env: cliEnv,
    stdio: ["ignore", "pipe", "pipe"],
  });
  child.stderr.on("data", (chunk) => {
    const text = Buffer.from(chunk).toString("utf8").trim();
    if (text) {
      console.error(text);
    }
  });
  return child;
}

async function waitForHealth(url) {
  const started = Date.now();
  while (Date.now() - started < 10_000) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return;
      }
    } catch {
      // Retry until the server starts listening.
    }
    await delay(100);
  }
  throw new Error("Server did not become healthy within 10 seconds.");
}

function parseFixtureSet(argv) {
  const flag = argv.find(
    (entry) => entry === "--fixture-set" || entry.startsWith("--fixture-set="),
  );
  if (!flag) return "synthetic";
  const value = flag.includes("=")
    ? flag.split("=", 2)[1]
    : argv[argv.indexOf(flag) + 1];
  if (!value || value === "synthetic") return "synthetic";
  if (value === "real") return "real";
  throw new Error(
    `Unknown --fixture-set value: ${value}. Expected synthetic or real.`,
  );
}

function parseFixtureFile(argv, fixtureSet) {
  const flag = argv.find(
    (entry) =>
      entry === "--fixture-file" || entry.startsWith("--fixture-file="),
  );
  if (!flag) return undefined;
  const value = flag.includes("=")
    ? flag.split("=", 2)[1]
    : argv[argv.indexOf(flag) + 1];
  if (!value || value.startsWith("--")) {
    throw new Error("--fixture-file requires a local JSON file path.");
  }
  if (fixtureSet !== "real") {
    throw new Error("--fixture-file requires --fixture-set real.");
  }
  return resolve(value);
}

function passes(scores) {
  return (
    scores.privacy_leak_count === thresholds.privacy_leak_count &&
    scores.retrieval_top3 >= thresholds.retrieval_top3 &&
    scores.coach_gap_fix_rate >= thresholds.coach_gap_fix_rate &&
    scores.coach_prompt_actionability >=
      thresholds.coach_prompt_actionability &&
    scores.prompt_quality_score_calibration >=
      thresholds.prompt_quality_score_calibration &&
    scores.archive_effectiveness_score >=
      thresholds.archive_effectiveness_score &&
    scores.archive_effectiveness_coverage >=
      thresholds.archive_effectiveness_coverage &&
    scores.outcome_pass_rate >= thresholds.outcome_pass_rate &&
    scores.analytics_score >= thresholds.analytics_score &&
    scores.ingest_p95_ms <= thresholds.ingest_p95_ms &&
    scores.search_p95_ms <= thresholds.search_p95_ms &&
    scores.dashboard_ms <= thresholds.dashboard_ms &&
    scores.export_ms <= thresholds.export_ms
  );
}

function printReport(report) {
  console.log(`promptlane benchmark ${report.dataset}`);
  console.log(`pass: ${report.pass ? "yes" : "no"}`);
  for (const line of formatBenchmarkEvidenceStateLines(report.evidence_state)) {
    console.log(line);
  }
  console.log(`next_action: ${report.next_action}`);
  console.log(`comparison_status: ${report.comparison.status}`);
  const paired = report.details.paired_effectiveness;
  console.log(`paired_effectiveness_status: ${paired.status}`);
  console.log(`paired_effectiveness_pairs: ${paired.pair_count}`);
  console.log(`paired_effectiveness_causal_claim: no`);
  if (paired.pass_rate_delta !== null) {
    console.log(
      `paired_effectiveness_pass_rate_delta: ${paired.pass_rate_delta}`,
    );
  }
  if (report.comparison.status === "compared") {
    console.log(
      `comparison_regressions: ${report.comparison.regressions.join(", ") || "none"}`,
    );
    console.log(
      `comparison_improvements: ${report.comparison.improvements.join(", ") || "none"}`,
    );
  }
  if (report.comparison.status === "incompatible") {
    console.log(`comparison_reason: ${report.comparison.reason}`);
  }
  for (const [key, value] of Object.entries(report.scores)) {
    console.log(`${key}: ${value}`);
  }
  const misses = report.details.retrieval_cases.filter((item) => !item.hit);
  if (misses.length > 0) {
    console.log(
      `retrieval_misses: ${misses.map((item) => `${item.label}@${item.query}`).join(", ")}`,
    );
  }
  const ab = report.details.experimental_rules_ab ?? {};
  for (const [rule, data] of Object.entries(ab)) {
    console.log(
      `experimental_rules_ab.${rule}: lifted ${data.lifted}/${data.cases}, avg_delta ${data.average_delta}`,
    );
    if (data.examples.length > 0) {
      console.log(`  examples: ${data.examples.join(", ")}`);
    }
  }
}

function benchmarkNextAction({
  fixtureSet,
  pass,
  outcomeCount,
  comparison,
  pairedEffectiveness,
}) {
  if (fixtureSet === "real") {
    if (comparison.status === "incompatible") {
      return `Baseline comparison is incompatible (${comparison.reason}); use a valid prior PromptLane report from the same fixture set and corpus fingerprint.`;
    }
    if (outcomeCount === 0) {
      return "Real prompts were benchmarked, but effectiveness is unproven; add operator-confirmed passed or failed outcome metadata before comparing usefulness trends.";
    }
    if (pairedEffectiveness.status === "not_collected") {
      return "Attributed outcomes exist, but before-versus-after usefulness is unproven; add matched baseline and promptlane effect_pair fixtures.";
    }
    if (pairedEffectiveness.status === "insufficient_pairs") {
      return `Paired effectiveness has ${pairedEffectiveness.pair_count} matched case(s); collect at least ${pairedEffectiveness.minimum_directional_pairs} before interpreting direction.`;
    }
    if (comparison.status !== "compared") {
      return pass
        ? "Real snapshot is healthy; save this JSON report, then rerun with --baseline-file <report.json> before calling it a trend."
        : "Real snapshot missed thresholds; fix failed metrics, save a healthy JSON report, then use it with --baseline-file <report.json>.";
    }
    if (comparison.regressions.length > 0) {
      return `Real trend has material regressions: ${comparison.regressions.join(", ")}. Review those metrics before claiming improvement.`;
    }
    return pass
      ? "Real fixture soft signal is healthy; compare trends, but keep synthetic benchmark as the release gate."
      : "Real fixture soft signal missed thresholds; inspect trends and fixture quality before changing the hard release gate.";
  }

  return pass
    ? "Synthetic pass means the local regression gate is green; collect real fixtures before claiming real-world effectiveness."
    : "Fix failed synthetic benchmark metrics before release.";
}

function readBenchmarkBaseline(argv) {
  let baselinePath;
  try {
    baselinePath = parseOptionalPath(argv, "--baseline-file");
  } catch {
    return { status: "invalid", reason: "baseline_argument_missing" };
  }
  if (!baselinePath) return { status: "not_requested" };
  try {
    return {
      status: "loaded",
      report: JSON.parse(readFileSync(baselinePath, "utf8")),
    };
  } catch {
    return { status: "invalid", reason: "unreadable_or_invalid_json" };
  }
}

function parseOptionalPath(argv, option) {
  const flag = argv.find(
    (entry) => entry === option || entry.startsWith(`${option}=`),
  );
  if (!flag) return undefined;
  const value = flag.includes("=")
    ? flag.split("=", 2)[1]
    : argv[argv.indexOf(flag) + 1];
  if (!value || value.startsWith("--")) {
    throw new Error(`${option} requires a local JSON file path.`);
  }
  return resolve(value);
}

async function timed(fn) {
  const started = performance.now();
  await fn();
  return performance.now() - started;
}

function p95(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(
    sorted.length - 1,
    Math.ceil(sorted.length * 0.95) - 1,
  );
  return sorted[index] ?? 0;
}

function roundScore(value) {
  return Math.round(value * 1000) / 1000;
}

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function freePort() {
  return new Promise((resolvePort, reject) => {
    const server = net.createServer();
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      server.close(() => resolvePort(address.port));
    });
    server.on("error", reject);
  });
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function delay(ms) {
  return new Promise((resolveDelay) => setTimeout(resolveDelay, ms));
}

function waitForExit(child) {
  return new Promise((resolveExit) => {
    if (child.exitCode !== null) {
      resolveExit();
      return;
    }
    child.once("exit", () => resolveExit());
  });
}
