#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
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
  rmSync(fixtureFile, { force: true });
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
        effectiveness_signal: "promptlane benchmark --fixture-set real --json",
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

  if (result.status !== 0) {
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
  if (!Array.isArray(parsed?.coach_cases) || parsed.coach_cases.length === 0) {
    throw new Error("installed fixture init omitted coach cases");
  }
}
