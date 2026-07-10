import { spawnSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import {
  existsSync,
  linkSync,
  mkdirSync,
  readFileSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import type { Command } from "commander";

import {
  BenchmarkFixtureInputError,
  createRealBenchmarkFixture,
  validateRealBenchmarkConsentNote,
} from "../../analysis/benchmark-fixture.js";
import { loadHookAuth, loadPromptLaneConfig } from "../../config/config.js";
import type { PromptDetail } from "../../storage/ports.js";
import { createSqlitePromptStorage } from "../../storage/sqlite.js";
import { UserError } from "../user-error.js";

type BenchmarkCliOptions = {
  baselineFile?: string;
  fixtureFile?: string;
  fixtureSet?: string;
  json?: boolean;
  reportFile?: string;
};

type BenchmarkFixtureInitOptions = {
  fixtureFile: string;
};

type BenchmarkFixtureInitCommandOptions = {
  output: string;
};

type BenchmarkFixturePrepareOptions = {
  confirmConsent?: boolean;
  consentNote?: string;
  dataDir?: string;
  fixtureFile: string;
  promptIds?: string[];
};

type BenchmarkFixturePrepareCommandOptions = {
  confirmConsent?: boolean;
  consentNote: string;
  dataDir?: string;
  output: string;
  promptId: string[];
};

type BenchmarkRunResult = {
  status: number;
  stdout: string;
  stderr: string;
};

type BenchmarkRunner = (args: string[]) => BenchmarkRunResult;
type BenchmarkPromptReader = (
  promptIds: string[],
  dataDir?: string,
) => PromptDetail[];

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
    .command("prepare-fixture")
    .description(
      "Create a consent-bearing real fixture from selected local archive prompts.",
    )
    .requiredOption(
      "--prompt-id <id>",
      "Stored prompt id to include; repeat for multiple prompts.",
      collectOptionValue,
      [],
    )
    .requiredOption(
      "--consent-note <note>",
      "Raw-free note confirming local benchmark consent.",
    )
    .requiredOption(
      "--output <path>",
      "Write the prepared real fixture to this new local file.",
    )
    .option("--data-dir <path>", "Override the promptlane data directory.")
    .option(
      "--confirm-consent",
      "Confirm the selected redacted prompts are approved for local benchmarking.",
    )
    .action((options: BenchmarkFixturePrepareCommandOptions) => {
      console.log(
        prepareBenchmarkFixtureForCli({
          confirmConsent: options.confirmConsent,
          consentNote: options.consentNote,
          dataDir: options.dataDir,
          fixtureFile: options.output,
          promptIds: options.promptId,
        }),
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
    .option(
      "--report-file <path>",
      "Write a successful JSON report to a new private local file.",
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

export function prepareBenchmarkFixtureForCli(
  options: BenchmarkFixturePrepareOptions,
  readPrompts: BenchmarkPromptReader = readBenchmarkPrompts,
): string {
  if (options.confirmConsent !== true) {
    throw new UserError(
      "benchmark prepare-fixture requires --confirm-consent after reviewing the selected prompts.",
    );
  }
  let consentNote: string;
  try {
    consentNote = validateRealBenchmarkConsentNote(options.consentNote ?? "");
  } catch (error) {
    if (error instanceof BenchmarkFixtureInputError) {
      throw new UserError(error.message);
    }
    throw error;
  }
  if (!options.fixtureFile?.trim()) {
    throw new UserError("benchmark prepare-fixture requires an output file.");
  }
  const promptIds = Array.from(
    new Set(
      (options.promptIds ?? [])
        .map((promptId) => promptId.trim())
        .filter(Boolean),
    ),
  );
  if (promptIds.length === 0) {
    throw new UserError(
      "benchmark prepare-fixture requires at least one --prompt-id.",
    );
  }
  if (existsSync(options.fixtureFile)) {
    throw new UserError(
      "Real benchmark fixture file already exists. Choose a different --output.",
    );
  }

  let fixture;
  try {
    fixture = createRealBenchmarkFixture({
      consentNote,
      prompts: readPrompts(promptIds, options.dataDir),
    });
  } catch (error) {
    if (error instanceof BenchmarkFixtureInputError) {
      throw new UserError(error.message);
    }
    throw error;
  }

  try {
    mkdirSync(dirname(options.fixtureFile), { recursive: true });
    writeFileSync(
      options.fixtureFile,
      `${JSON.stringify(fixture, null, 2)}\n`,
      {
        encoding: "utf8",
        flag: "wx",
        mode: 0o600,
      },
    );
  } catch (error) {
    if (hasErrorCode(error, "EEXIST")) {
      throw new UserError(
        "Real benchmark fixture file already exists. Choose a different --output.",
      );
    }
    throw new UserError(
      "Unable to create the prepared PromptLane benchmark fixture.",
    );
  }

  const promptCopy =
    promptIds.length === 1
      ? "1 selected prompt"
      : `${promptIds.length} selected prompts`;
  return `Created a consent-bearing PromptLane real benchmark fixture from ${promptCopy}. Run the real soft signal with --fixture-file pointing to the new local file.`;
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
  if (options.reportFile && !options.json) {
    throw new UserError("--report-file requires --json.");
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
  } else if (options.reportFile) {
    writeBenchmarkReport(options.reportFile, result.stdout);
  }
  return result.stdout.trim();
}

function writeBenchmarkReport(reportFile: string, output: string): void {
  let report: unknown;
  try {
    report = JSON.parse(output);
  } catch {
    throw new UserError("PromptLane benchmark returned invalid JSON output.");
  }
  if (typeof report !== "object" || report === null || Array.isArray(report)) {
    throw new UserError("PromptLane benchmark returned invalid JSON output.");
  }

  const reportDirectory = dirname(reportFile);
  const temporaryFile = join(
    reportDirectory,
    `.${basename(reportFile)}.promptlane-${randomUUID()}.tmp`,
  );
  try {
    mkdirSync(reportDirectory, { recursive: true });
    writeFileSync(temporaryFile, `${JSON.stringify(report, null, 2)}\n`, {
      encoding: "utf8",
      flag: "wx",
      mode: 0o600,
    });
    linkSync(temporaryFile, reportFile);
  } catch (error) {
    if (hasErrorCode(error, "EEXIST")) {
      throw new UserError(
        "Benchmark report file already exists. Choose a new --report-file.",
      );
    }
    throw new UserError("Unable to create the PromptLane benchmark report.");
  } finally {
    try {
      unlinkSync(temporaryFile);
    } catch {
      // The temp file is absent when setup fails before writing.
    }
  }
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

function readBenchmarkPrompts(
  promptIds: string[],
  dataDir?: string,
): PromptDetail[] {
  const config = loadPromptLaneConfig(dataDir);
  const auth = loadHookAuth(dataDir);
  const storage = createSqlitePromptStorage({
    dataDir: config.data_dir,
    hmacSecret: auth.web_session_secret,
  });
  try {
    const prompts = promptIds.map((promptId) => storage.getPrompt(promptId));
    if (prompts.some((prompt) => prompt === undefined)) {
      throw new UserError(
        "One or more selected benchmark prompts were not found in the local archive.",
      );
    }
    return prompts as PromptDetail[];
  } finally {
    storage.close();
  }
}

function collectOptionValue(value: string, previous: string[]): string[] {
  return [...previous, value];
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
