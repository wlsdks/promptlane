#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import {
  mkdtempSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { basename, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const tempHome = mkdtempSync(join(tmpdir(), "promptlane-smoke-home-"));
const tempPrefix = mkdtempSync(join(tmpdir(), "promptlane-smoke-prefix-"));
let tarballPath;

try {
  const npmEnv = sanitizedNpmEnv(process.env);
  run("corepack", ["pnpm", "build"], { env: process.env });

  const pack = run("npm", ["pack", "--json", "--ignore-scripts"], {
    env: npmEnv,
    encoding: "utf8",
  });
  tarballPath = join(repoRoot, readTarballName(pack.stdout));

  run("npm", ["install", "-g", "--prefix", tempPrefix, tarballPath], {
    env: { ...npmEnv, HOME: tempHome },
  });

  for (const [binName, args] of [
    ["promptlane", ["--help"]],
    ["pl-claude", ["--pc-help"]],
    ["pl-codex", ["--pc-help"]],
  ]) {
    run(join(tempPrefix, "bin", binName), args, {
      cwd: tempHome,
      env: { ...process.env, HOME: tempHome },
      encoding: "utf8",
    });
  }
  const loopHelp = run(
    join(tempPrefix, "bin", "promptlane"),
    ["loop", "--help"],
    {
      cwd: tempHome,
      env: { ...process.env, HOME: tempHome },
      encoding: "utf8",
    },
  );
  if (!loopHelp.stdout.includes("outcome")) {
    throw new Error("installed loop CLI did not expose outcome recording");
  }
  const benchmarkHelp = run(
    join(tempPrefix, "bin", "promptlane"),
    ["benchmark", "--help"],
    {
      cwd: tempHome,
      env: { ...process.env, HOME: tempHome },
      encoding: "utf8",
    },
  );
  if (!benchmarkHelp.stdout.includes("prepare-fixture")) {
    throw new Error(
      "installed benchmark CLI did not expose fixture preparation",
    );
  }
  if (!benchmarkHelp.stdout.includes("candidates")) {
    throw new Error(
      "installed benchmark CLI did not expose candidate discovery",
    );
  }
  const startGuide = run(
    join(tempPrefix, "bin", "promptlane"),
    ["start", "--open-web", "--json"],
    {
      cwd: tempHome,
      env: { ...process.env, HOME: tempHome },
      encoding: "utf8",
    },
  );
  validateStartGuide(startGuide.stdout);
  const qualityEvidenceHelp = run(
    join(tempPrefix, "bin", "promptlane"),
    ["quality-evidence", "--help"],
    {
      cwd: tempHome,
      env: { ...process.env, HOME: tempHome },
      encoding: "utf8",
    },
  );
  for (const option of ["--runtime-tool", "--require-runtime-ready"]) {
    if (!qualityEvidenceHelp.stdout.includes(option)) {
      throw new Error(
        `installed quality evidence CLI did not expose ${option}`,
      );
    }
  }
  const qualityEvidence = run(
    join(tempPrefix, "bin", "promptlane"),
    ["quality-evidence", "--require-complete"],
    {
      cwd: tempHome,
      env: { ...process.env, HOME: tempHome },
      encoding: "utf8",
    },
  );
  validateQualityEvidence(qualityEvidence.stdout);
  const fixtureFile = join(tempHome, "operator-owned-real-fixtures.json");
  const fixtureInit = run(
    join(tempPrefix, "bin", "promptlane"),
    ["benchmark", "init-fixture", "--output", fixtureFile],
    {
      cwd: tempHome,
      env: { ...process.env, HOME: tempHome },
      encoding: "utf8",
    },
  );
  validateBenchmarkFixtureTemplate(fixtureInit.stdout, fixtureFile);
  confirmBenchmarkFixture(fixtureFile);
  const baselineFile = join(tempHome, "promptlane-benchmark-baseline.json");
  const baselineEvidence = run(
    join(tempPrefix, "bin", "promptlane"),
    [
      "benchmark",
      "--fixture-set",
      "real",
      "--fixture-file",
      fixtureFile,
      "--json",
      "--report-file",
      baselineFile,
    ],
    {
      cwd: tempHome,
      env: { ...process.env, HOME: tempHome },
      encoding: "utf8",
    },
  );
  validateBenchmarkSnapshot(baselineEvidence.stdout, fixtureFile);
  validateBenchmarkReportFile(baselineEvidence.stdout, baselineFile);
  const comparisonEvidence = run(
    join(tempPrefix, "bin", "promptlane"),
    [
      "benchmark",
      "--fixture-set",
      "real",
      "--fixture-file",
      fixtureFile,
      "--baseline-file",
      baselineFile,
      "--json",
    ],
    {
      cwd: tempHome,
      env: { ...process.env, HOME: tempHome },
      encoding: "utf8",
    },
  );
  validateBenchmarkComparison(comparisonEvidence.stdout, baselineFile);
  const malformedBaselineFile = join(
    tempHome,
    "promptlane-malformed-baseline.json",
  );
  writeFileSync(malformedBaselineFile, '{"invalid":', { mode: 0o600 });
  const malformedComparison = run(
    join(tempPrefix, "bin", "promptlane"),
    [
      "benchmark",
      "--fixture-set",
      "real",
      "--fixture-file",
      fixtureFile,
      "--baseline-file",
      malformedBaselineFile,
      "--json",
    ],
    {
      cwd: tempHome,
      env: { ...process.env, HOME: tempHome },
      encoding: "utf8",
      expectedStatus: 1,
    },
  );
  validateBenchmarkIncompatible(
    malformedComparison.stdout,
    malformedBaselineFile,
    "unreadable_or_invalid_json",
  );
  const mismatchedBaselineFile = join(
    tempHome,
    "promptlane-mismatched-baseline.json",
  );
  const mismatchedBaseline = JSON.parse(baselineEvidence.stdout);
  mismatchedBaseline.corpus_fingerprint = "corpus_mismatch";
  writeFileSync(
    mismatchedBaselineFile,
    `${JSON.stringify(mismatchedBaseline, null, 2)}\n`,
    { mode: 0o600 },
  );
  const mismatchedComparison = run(
    join(tempPrefix, "bin", "promptlane"),
    [
      "benchmark",
      "--fixture-set",
      "real",
      "--fixture-file",
      fixtureFile,
      "--baseline-file",
      mismatchedBaselineFile,
      "--json",
    ],
    {
      cwd: tempHome,
      env: { ...process.env, HOME: tempHome },
      encoding: "utf8",
      expectedStatus: 1,
    },
  );
  validateBenchmarkIncompatible(
    mismatchedComparison.stdout,
    mismatchedBaselineFile,
    "fixture_set_or_corpus_mismatch",
  );
  rmSync(fixtureFile, { force: true });
  rmSync(baselineFile, { force: true });
  rmSync(malformedBaselineFile, { force: true });
  rmSync(mismatchedBaselineFile, { force: true });
  const benchmarkEvidence = run(
    join(tempPrefix, "bin", "promptlane"),
    ["benchmark", "--fixture-set", "real", "--json"],
    {
      cwd: tempHome,
      env: { ...process.env, HOME: tempHome },
      encoding: "utf8",
    },
  );
  validateBenchmarkEvidence(benchmarkEvidence.stdout);

  console.log(
    JSON.stringify(
      {
        check: "package_install_smoke",
        status: "pass",
        tarball: basename(tarballPath),
        bins: ["promptlane", "pl-claude", "pl-codex"],
        first_success: "promptlane start --open-web --json",
        release_gate: "promptlane quality-evidence --require-complete",
        fixture_init:
          "promptlane benchmark init-fixture --output <operator-owned>",
        fixture_prepare:
          "promptlane benchmark prepare-fixture --prompt-id <selected> --confirm-consent --output <operator-owned>",
        fixture_candidates: "promptlane benchmark candidates --json",
        effectiveness_signal: "promptlane benchmark --fixture-set real --json",
        trend_comparison:
          "promptlane benchmark --baseline-file <prior-report> --json",
      },
      null,
      2,
    ),
  );
} finally {
  if (tarballPath) {
    rmSync(tarballPath, { force: true });
  }
  rmSync(tempHome, { recursive: true, force: true });
  rmSync(tempPrefix, { recursive: true, force: true });
}

function sanitizedNpmEnv(env) {
  const next = { ...env };
  for (const key of [
    "npm_config_verify_deps_before_run",
    "npm_config__jsr_registry",
    "npm_config_patched_dependencies",
    "pnpm_config_verify_deps_before_run",
    "pnpm_config__jsr_registry",
    "pnpm_config_patched_dependencies",
  ]) {
    delete next[key];
  }
  return next;
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd ?? repoRoot,
    env: options.env,
    encoding: options.encoding,
    stdio: options.encoding ? ["ignore", "pipe", "pipe"] : "inherit",
  });

  if (result.error) {
    throw result.error;
  }

  const expectedStatus = options.expectedStatus ?? 0;
  if (result.status !== expectedStatus) {
    if (options.encoding) {
      process.stderr.write(result.stdout ?? "");
      process.stderr.write(result.stderr ?? "");
    }
    process.exit(result.status ?? 1);
  }

  return {
    stdout: result.stdout ?? "",
  };
}

function readTarballName(stdout) {
  const parsed = JSON.parse(stdout);
  const filename = parsed?.[0]?.filename;
  if (typeof filename !== "string" || !filename.endsWith(".tgz")) {
    throw new Error("npm pack did not return a tarball filename");
  }
  return filename;
}

function validateStartGuide(stdout) {
  const parsed = JSON.parse(stdout);
  const commands = parsed?.steps?.flatMap((step) => step.commands ?? []) ?? [];
  for (const expectedCommand of [
    "promptlane setup --profile coach --register-mcp --open-web",
    "promptlane coach",
    "promptlane doctor claude-code",
    "promptlane doctor codex",
  ]) {
    if (!commands.includes(expectedCommand)) {
      throw new Error(`start guide did not include ${expectedCommand}`);
    }
  }
}

function validateQualityEvidence(stdout) {
  for (const expectedText of [
    "PromptLane 9.5 quality evidence",
    "Status: complete",
    "Evidence scope: repeatable_isolated_local_release",
    "paired effectiveness not evaluated",
    "live agent runtime not evaluated",
    "corepack pnpm smoke:package-install",
    "corepack pnpm promptlane quality-evidence --require-complete",
  ]) {
    if (!stdout.includes(expectedText)) {
      throw new Error(
        `quality evidence output did not include ${expectedText}`,
      );
    }
  }
}

function validateBenchmarkEvidence(stdout) {
  const parsed = JSON.parse(stdout);
  const status = parsed?.status;
  const effectiveness = parsed?.evidence_state?.effectiveness;
  if (status !== "no_fixtures") {
    throw new Error("installed benchmark did not report missing real fixtures");
  }
  if (effectiveness !== "unproven") {
    throw new Error("installed benchmark overstated real-world effectiveness");
  }
  if (parsed?.evidence_state?.requires_real_fixtures !== true) {
    throw new Error("installed benchmark did not require real fixtures");
  }
  if (parsed?.evidence_state?.requires_real_outcomes !== true) {
    throw new Error("installed benchmark did not require real outcomes");
  }
  if (parsed?.evidence_state?.requires_baseline !== true) {
    throw new Error("installed benchmark did not require a real baseline");
  }
}

function validateBenchmarkFixtureTemplate(stdout, fixtureFile) {
  if (stdout.includes(fixtureFile)) {
    throw new Error("installed fixture init exposed the operator-owned path");
  }
  const parsed = JSON.parse(readFileSync(fixtureFile, "utf8"));
  if (parsed?.template_only !== true) {
    throw new Error(
      "installed fixture init omitted the non-runnable template marker",
    );
  }
  if (typeof parsed?.consent_note !== "string") {
    throw new Error("installed fixture init omitted consent metadata");
  }
  if (!Array.isArray(parsed?.fixtures) || parsed.fixtures.length === 0) {
    throw new Error("installed fixture init omitted benchmark fixtures");
  }
  const outcome = parsed.fixtures.find((fixture) => fixture?.outcome)?.outcome;
  if (
    !outcome ||
    !["passed", "failed"].includes(outcome.status) ||
    !Array.isArray(outcome.evidence_refs) ||
    outcome.evidence_refs.length === 0 ||
    !Number.isInteger(outcome.tests_run)
  ) {
    throw new Error(
      "installed fixture init omitted benchmark outcome guidance",
    );
  }
  if (!Array.isArray(parsed?.coach_cases) || parsed.coach_cases.length === 0) {
    throw new Error("installed fixture init omitted coach cases");
  }
  const effectPairs = parsed.fixtures
    .map((fixture) => fixture?.effect_pair)
    .filter(Boolean);
  if (
    effectPairs.length !== 2 ||
    !effectPairs.some((pair) => pair.variant === "baseline") ||
    !effectPairs.some((pair) => pair.variant === "promptlane")
  ) {
    throw new Error(
      "installed fixture init omitted paired effectiveness guidance",
    );
  }
}

function confirmBenchmarkFixture(fixtureFile) {
  const parsed = JSON.parse(readFileSync(fixtureFile, "utf8"));
  parsed.template_only = false;
  parsed.consent_note = "Operator-confirmed redacted package smoke fixtures.";
  writeFileSync(fixtureFile, `${JSON.stringify(parsed, null, 2)}\n`, {
    mode: 0o600,
  });
}

function validateBenchmarkSnapshot(stdout, fixtureFile) {
  if (stdout.includes(fixtureFile)) {
    throw new Error("installed benchmark snapshot exposed the fixture path");
  }
  const parsed = JSON.parse(stdout);
  if (parsed?.comparison?.status !== "not_requested") {
    throw new Error("installed benchmark snapshot claimed a comparison");
  }
  if (parsed?.evidence_state?.requires_baseline !== true) {
    throw new Error("installed benchmark snapshot did not require a baseline");
  }
  if (parsed?.evidence_state?.effectiveness !== "snapshot_healthy") {
    throw new Error("installed benchmark snapshot overstated trend evidence");
  }
  const paired = parsed?.details?.paired_effectiveness;
  if (
    paired?.status !== "insufficient_pairs" ||
    paired?.pair_count !== 1 ||
    paired?.causal_claim !== false
  ) {
    throw new Error("installed benchmark snapshot overstated paired evidence");
  }
}

function validateBenchmarkReportFile(stdout, reportFile) {
  if (stdout.includes(reportFile)) {
    throw new Error("installed benchmark report exposed the report path");
  }
  const stdoutReport = JSON.parse(stdout);
  const savedReport = JSON.parse(readFileSync(reportFile, "utf8"));
  if (savedReport?.corpus_fingerprint !== stdoutReport?.corpus_fingerprint) {
    throw new Error("installed benchmark report did not preserve the snapshot");
  }
  if ((statSync(reportFile).mode & 0o777) !== 0o600) {
    throw new Error("installed benchmark report permissions are not private");
  }
}

function validateBenchmarkComparison(stdout, baselineFile) {
  if (stdout.includes(baselineFile)) {
    throw new Error("installed benchmark comparison exposed the baseline path");
  }
  const parsed = JSON.parse(stdout);
  if (parsed?.comparison?.status !== "compared") {
    throw new Error("installed benchmark did not compare the baseline report");
  }
  if (parsed?.evidence_state?.requires_baseline !== false) {
    throw new Error("installed benchmark comparison still required a baseline");
  }
  if (typeof parsed?.corpus_fingerprint !== "string") {
    throw new Error("installed benchmark omitted the corpus fingerprint");
  }
}

function validateBenchmarkIncompatible(stdout, baselineFile, expectedReason) {
  if (stdout.includes(baselineFile)) {
    throw new Error(
      "installed incompatible comparison exposed a baseline path",
    );
  }
  const parsed = JSON.parse(stdout);
  if (parsed?.comparison?.status !== "incompatible") {
    throw new Error("installed benchmark omitted incompatible status");
  }
  if (parsed?.comparison?.reason !== expectedReason) {
    throw new Error("installed benchmark returned the wrong safe reason code");
  }
  if (parsed?.evidence_state?.requires_baseline !== true) {
    throw new Error("installed incompatible comparison accepted its baseline");
  }
}
