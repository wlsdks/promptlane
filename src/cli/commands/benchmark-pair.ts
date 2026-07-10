import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

import type { Command } from "commander";

import {
  BenchmarkFixtureInputError,
  createPairedRealBenchmarkFixture,
  validateRealBenchmarkConsentNote,
} from "../../analysis/benchmark-fixture.js";
import { loadHookAuth, loadPromptLaneConfig } from "../../config/config.js";
import type { PromptDetail } from "../../storage/ports.js";
import { createSqlitePromptStorage } from "../../storage/sqlite.js";
import { UserError } from "../user-error.js";

type BenchmarkPairPrepareOptions = {
  baselinePromptIds?: string[];
  confirmConsent?: boolean;
  consentNote?: string;
  dataDir?: string;
  fixtureFile: string;
  pairIds?: string[];
  promptlanePromptIds?: string[];
  queries?: string[];
};

type BenchmarkPairPrepareCommandOptions = {
  baselinePromptId: string[];
  confirmConsent?: boolean;
  consentNote: string;
  dataDir?: string;
  output: string;
  pairId: string[];
  promptlanePromptId: string[];
  query: string[];
};

type BenchmarkPromptReader = (
  promptIds: string[],
  dataDir?: string,
) => PromptDetail[];

export function registerBenchmarkPairCommand(benchmarkCommand: Command): void {
  benchmarkCommand
    .command("prepare-pair")
    .description(
      "Create consent-bearing baseline/PromptLane effectiveness pairs from local archive prompts.",
    )
    .requiredOption(
      "--baseline-prompt-id <id>",
      "Stored baseline prompt id; repeat once per pair in matching order.",
      collectOptionValue,
      [],
    )
    .requiredOption(
      "--promptlane-prompt-id <id>",
      "Stored PromptLane prompt id; repeat once per pair in matching order.",
      collectOptionValue,
      [],
    )
    .requiredOption(
      "--pair-id <id>",
      "Shared raw-free lowercase label; repeat once per pair in matching order.",
      collectOptionValue,
      [],
    )
    .requiredOption(
      "--query <query>",
      "Shared redacted query; repeat once per pair in matching order.",
      collectOptionValue,
      [],
    )
    .requiredOption(
      "--consent-note <note>",
      "Raw-free note confirming local benchmark consent for all selected prompts and outcomes.",
    )
    .requiredOption(
      "--output <path>",
      "Write the prepared paired fixture to this new local file.",
    )
    .option("--data-dir <path>", "Override the promptlane data directory.")
    .option(
      "--confirm-consent",
      "Confirm all redacted prompts and outcomes are approved for local benchmarking.",
    )
    .action((options: BenchmarkPairPrepareCommandOptions) => {
      console.log(
        preparePairedBenchmarkFixtureForCli({
          baselinePromptIds: options.baselinePromptId,
          confirmConsent: options.confirmConsent,
          consentNote: options.consentNote,
          dataDir: options.dataDir,
          fixtureFile: options.output,
          pairIds: options.pairId,
          promptlanePromptIds: options.promptlanePromptId,
          queries: options.query,
        }),
      );
    });
}

export function preparePairedBenchmarkFixtureForCli(
  options: BenchmarkPairPrepareOptions,
  readPrompts: BenchmarkPromptReader = readBenchmarkPrompts,
): string {
  if (options.confirmConsent !== true) {
    throw new UserError(
      "benchmark prepare-pair requires --confirm-consent after reviewing both prompts and outcomes.",
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
    throw new UserError("benchmark prepare-pair requires an output file.");
  }
  const baselinePromptIds = normalizedOptionValues(options.baselinePromptIds);
  const promptlanePromptIds = normalizedOptionValues(
    options.promptlanePromptIds,
  );
  const pairIds = normalizedOptionValues(options.pairIds);
  const queries = normalizedOptionValues(options.queries);
  const pairCount = baselinePromptIds.length;
  if (
    pairCount === 0 ||
    promptlanePromptIds.length !== pairCount ||
    pairIds.length !== pairCount ||
    queries.length !== pairCount
  ) {
    throw new UserError(
      "benchmark prepare-pair requires the same non-zero number of baseline ids, PromptLane ids, pair ids, and queries.",
    );
  }
  const selectedPromptIds = [...baselinePromptIds, ...promptlanePromptIds];
  if (new Set(selectedPromptIds).size !== selectedPromptIds.length) {
    throw new UserError(
      "benchmark prepare-pair cannot reuse a prompt across matched pairs.",
    );
  }
  if (new Set(pairIds).size !== pairIds.length) {
    throw new UserError("benchmark prepare-pair requires unique pair ids.");
  }
  if (existsSync(options.fixtureFile)) {
    throw new UserError(
      "Real benchmark fixture file already exists. Choose a different --output.",
    );
  }

  const prompts = readPrompts(selectedPromptIds, options.dataDir);
  const promptsById = new Map(prompts.map((prompt) => [prompt.id, prompt]));
  if (selectedPromptIds.some((promptId) => !promptsById.has(promptId))) {
    throw new UserError(
      "One or more selected benchmark prompts were not found in the local archive.",
    );
  }

  const pairedFixtures = [];
  try {
    for (let index = 0; index < pairCount; index += 1) {
      pairedFixtures.push(
        createPairedRealBenchmarkFixture({
          consentNote,
          pairId: pairIds[index]!,
          query: queries[index]!,
          baselinePrompt: promptsById.get(baselinePromptIds[index]!)!,
          promptlanePrompt: promptsById.get(promptlanePromptIds[index]!)!,
        }),
      );
    }
  } catch (error) {
    if (error instanceof BenchmarkFixtureInputError) {
      throw new UserError(error.message);
    }
    throw error;
  }
  const fixture = {
    template_only: false as const,
    consent_note: consentNote,
    fixtures: pairedFixtures.flatMap((candidate) => candidate.fixtures),
    coach_cases: pairedFixtures.flatMap((candidate) => candidate.coach_cases),
  };
  writePreparedBenchmarkFixture(options.fixtureFile, fixture);

  const pairCopy =
    pairCount === 1 ? "1 matched pair" : `${pairCount} matched pairs`;
  return `Created a consent-bearing paired effectiveness fixture with ${pairCopy}. Collect at least 3 matched pairs before interpreting direction.`;
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

function normalizedOptionValues(values: string[] | undefined): string[] {
  return (values ?? []).map((value) => value.trim()).filter(Boolean);
}

function writePreparedBenchmarkFixture(
  fixtureFile: string,
  fixture: unknown,
): void {
  try {
    mkdirSync(dirname(fixtureFile), { recursive: true });
    writeFileSync(fixtureFile, `${JSON.stringify(fixture, null, 2)}\n`, {
      encoding: "utf8",
      flag: "wx",
      mode: 0o600,
    });
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
}

function collectOptionValue(value: string, previous: string[]): string[] {
  return [...previous, value];
}

function hasErrorCode(error: unknown, code: string): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === code
  );
}
