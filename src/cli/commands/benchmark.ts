import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

import type { Command } from "commander";

import { UserError } from "../user-error.js";

type BenchmarkCliOptions = {
  baselineFile?: string;
  fixtureFile?: string;
  fixtureSet?: string;
  json?: boolean;
};

type BenchmarkFixtureInitOptions = {
  fixtureFile: string;
};

type BenchmarkFixtureInitCommandOptions = {
  output: string;
};

type BenchmarkRunResult = {
  status: number;
  stdout: string;
  stderr: string;
};

type BenchmarkRunner = (args: string[]) => BenchmarkRunResult;

export function registerBenchmarkCommand(program: Command): void {
  const benchmarkCommand = program
    .command("benchmark")
    .description(
      "Measure local PromptLane regression and effectiveness evidence.",
    );
  benchmarkCommand
    .command("init-fixture")
    .description(
      "Create an operator-owned real benchmark fixture template locally.",
    )
    .requiredOption(
      "--output <path>",
      "Write the real benchmark fixture template to this local file.",
    )
    .action((options: BenchmarkFixtureInitCommandOptions) => {
      console.log(
        initializeBenchmarkFixtureForCli({ fixtureFile: options.output }),
      );
    });

  benchmarkCommand
    .option(
      "--fixture-set <set>",
      "Use synthetic regression fixtures or real effectiveness fixtures.",
      "synthetic",
    )
    .option(
      "--fixture-file <path>",
      "Read consent-bearing redacted real fixtures from this local file.",
    )
    .option(
      "--baseline-file <path>",
      "Compare with a prior PromptLane benchmark JSON report.",
    )
    .option("--json", "Print JSON.")
    .action((options: BenchmarkCliOptions) => {
      console.log(benchmarkForCli(options));
    });
}

export function initializeBenchmarkFixtureForCli(
  options: BenchmarkFixtureInitOptions,
): string {
  if (!options.fixtureFile?.trim()) {
    throw new UserError("benchmark init-fixture requires an output file.");
  }

  let template: string;
  try {
    template = readFileSync(benchmarkFixtureTemplatePath(), "utf8");
  } catch {
    throw new UserError(
      "Unable to read the shipped PromptLane benchmark fixture template.",
    );
  }

  try {
    mkdirSync(dirname(options.fixtureFile), { recursive: true });
    writeFileSync(options.fixtureFile, template, {
      encoding: "utf8",
      flag: "wx",
      mode: 0o600,
    });
  } catch (error) {
    if (hasErrorCode(error, "EEXIST")) {
      throw new UserError(
        "Real benchmark fixture file already exists. Edit it in place or choose a different --output.",
      );
    }
    throw new UserError(
      "Unable to create the PromptLane benchmark fixture template.",
    );
  }

  return "Created PromptLane real benchmark fixture template. Replace every example, update consent_note, and set template_only to false before running the real soft signal.";
}

export function benchmarkForCli(
  options: BenchmarkCliOptions = {},
  runBenchmark: BenchmarkRunner = runBenchmarkScript,
): string {
  const fixtureSet = options.fixtureSet ?? "synthetic";
  if (fixtureSet !== "synthetic" && fixtureSet !== "real") {
    throw new UserError(
      `Unsupported benchmark fixture set: ${fixtureSet}. Expected synthetic or real.`,
    );
  }
  if (options.fixtureFile && fixtureSet !== "real") {
    throw new UserError(
      "--fixture-file requires --fixture-set real so synthetic release evidence stays deterministic.",
    );
  }

  const args = ["--fixture-set", fixtureSet];
  if (options.fixtureFile) {
    args.push("--fixture-file", options.fixtureFile);
  }
  if (options.baselineFile) {
    args.push("--baseline-file", options.baselineFile);
  }
  if (options.json) args.push("--json");
  const result = runBenchmark(args);

  if (!result.stdout.trim()) {
    throw new UserError(
      result.status === 0
        ? "PromptLane benchmark returned no output."
        : "PromptLane benchmark failed before producing a report.",
    );
  }
  if (result.status !== 0) {
    process.exitCode = result.status;
  }
  return result.stdout.trim();
}

function runBenchmarkScript(args: string[]): BenchmarkRunResult {
  const result = spawnSync(process.execPath, [benchmarkScriptPath(), ...args], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });

  if (result.error) {
    throw new UserError("Unable to start the local PromptLane benchmark.");
  }
  return {
    status: result.status ?? 1,
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
  };
}

function benchmarkScriptPath(): string {
  return fileURLToPath(
    new URL("../../../scripts/benchmark.mjs", import.meta.url),
  );
}

function benchmarkFixtureTemplatePath(): string {
  return fileURLToPath(
    new URL(
      "../../../docs/benchmark-fixtures/real.example.json",
      import.meta.url,
    ),
  );
}

function hasErrorCode(error: unknown, code: string): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === code
  );
}
