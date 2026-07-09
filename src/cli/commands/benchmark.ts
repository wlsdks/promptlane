import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import type { Command } from "commander";

import { UserError } from "../user-error.js";

type BenchmarkCliOptions = {
  fixtureFile?: string;
  fixtureSet?: string;
  json?: boolean;
};

type BenchmarkRunResult = {
  status: number;
  stdout: string;
  stderr: string;
};

type BenchmarkRunner = (args: string[]) => BenchmarkRunResult;

export function registerBenchmarkCommand(program: Command): void {
  program
    .command("benchmark")
    .description(
      "Measure local PromptLane regression and effectiveness evidence.",
    )
    .option(
      "--fixture-set <set>",
      "Use synthetic regression fixtures or real effectiveness fixtures.",
      "synthetic",
    )
    .option(
      "--fixture-file <path>",
      "Read consent-bearing redacted real fixtures from this local file.",
    )
    .option("--json", "Print JSON.")
    .action((options: BenchmarkCliOptions) => {
      console.log(benchmarkForCli(options));
    });
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
