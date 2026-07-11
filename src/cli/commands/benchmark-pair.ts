import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

import type { Command } from "commander";

import {
  BenchmarkFixtureInputError,
  createPairedRealBenchmarkFixture,
  validateRealBenchmarkConsentNote,
} from "../../analysis/benchmark-fixture.js";
import {
  createBenchmarkPairCandidateReport,
  type BenchmarkPairCandidateReport,
} from "../../analysis/benchmark-pair-candidates.js";
import { loadHookAuth, loadLoopRelayConfig } from "../../config/config.js";
import type { LoopSnapshot } from "../../loop/types.js";
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
  looprelayPromptIds?: string[];
  queries?: string[];
};

type BenchmarkPairPrepareCommandOptions = {
  baselinePromptId: string[];
  confirmConsent?: boolean;
  consentNote: string;
  dataDir?: string;
  output: string;
  pairId: string[];
  looprelayPromptId: string[];
  query: string[];
};

type BenchmarkPromptReader = (
  promptIds: string[],
  dataDir?: string,
) => PromptDetail[];

type BenchmarkPairCandidateOptions = {
  dataDir?: string;
  json?: boolean;
  limit?: string;
};

type BenchmarkSnapshotReader = (dataDir?: string) => LoopSnapshot[];
type BenchmarkPromptIdReader = (
  promptIds: string[],
  dataDir?: string,
) => Set<string>;

export function registerBenchmarkPairCommand(benchmarkCommand: Command): void {
  benchmarkCommand
    .command("pair-candidates")
    .description(
      "List body-free baseline and LoopRelay candidates for matched effectiveness pairs.",
    )
    .option("--data-dir <path>", "Override the looprelay data directory.")
    .option("--limit <count>", "Maximum candidates per group.", "20")
    .option("--json", "Print JSON.")
    .action((_options: BenchmarkPairCandidateOptions, command: Command) => {
      console.log(
        benchmarkPairCandidatesForCli(
          command.optsWithGlobals() as BenchmarkPairCandidateOptions,
        ),
      );
    });

  benchmarkCommand
    .command("prepare-pair")
    .description(
      "Create consent-bearing baseline/LoopRelay effectiveness pairs from local archive prompts.",
    )
    .requiredOption(
      "--baseline-prompt-id <id>",
      "Stored baseline prompt id; repeat once per pair in matching order.",
      collectOptionValue,
      [],
    )
    .requiredOption(
      "--looprelay-prompt-id <id>",
      "Stored LoopRelay prompt id; repeat once per pair in matching order.",
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
    .option("--data-dir <path>", "Override the looprelay data directory.")
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
          looprelayPromptIds: options.looprelayPromptId,
          queries: options.query,
        }),
      );
    });
}

export function benchmarkPairCandidatesForCli(
  options: BenchmarkPairCandidateOptions = {},
  readSnapshots: BenchmarkSnapshotReader = readBenchmarkSnapshots,
  readPromptIds: BenchmarkPromptIdReader = readExistingBenchmarkPromptIds,
): string {
  const limit = parseCandidateLimit(options.limit);
  const snapshots = readSnapshots(options.dataDir);
  const promptIds = Array.from(
    new Set(snapshots.flatMap((snapshot) => snapshot.prompt_ids)),
  );
  const existingPromptIds = readPromptIds(promptIds, options.dataDir);
  const report = createBenchmarkPairCandidateReport(
    snapshots,
    limit,
    (promptId) => existingPromptIds.has(promptId),
  );
  return options.json
    ? JSON.stringify(report, null, 2)
    : formatPairCandidates(report);
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
  const looprelayPromptIds = normalizedOptionValues(options.looprelayPromptIds);
  const pairIds = normalizedOptionValues(options.pairIds);
  const queries = normalizedOptionValues(options.queries);
  const pairCount = baselinePromptIds.length;
  if (
    pairCount === 0 ||
    looprelayPromptIds.length !== pairCount ||
    pairIds.length !== pairCount ||
    queries.length !== pairCount
  ) {
    throw new UserError(
      "benchmark prepare-pair requires the same non-zero number of baseline ids, LoopRelay ids, pair ids, and queries.",
    );
  }
  const selectedPromptIds = [...baselinePromptIds, ...looprelayPromptIds];
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
          looprelayPrompt: promptsById.get(looprelayPromptIds[index]!)!,
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
  const config = loadLoopRelayConfig(dataDir);
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

function readBenchmarkSnapshots(dataDir?: string): LoopSnapshot[] {
  const config = loadLoopRelayConfig(dataDir);
  const auth = loadHookAuth(dataDir);
  const storage = createSqlitePromptStorage({
    dataDir: config.data_dir,
    hmacSecret: auth.web_session_secret,
  });
  try {
    return storage.listLoopSnapshots({ limit: 100 }).items;
  } finally {
    storage.close();
  }
}

function readExistingBenchmarkPromptIds(
  promptIds: string[],
  dataDir?: string,
): Set<string> {
  const config = loadLoopRelayConfig(dataDir);
  const auth = loadHookAuth(dataDir);
  const storage = createSqlitePromptStorage({
    dataDir: config.data_dir,
    hmacSecret: auth.web_session_secret,
  });
  try {
    return new Set(
      promptIds.filter((promptId) => storage.getPrompt(promptId) !== undefined),
    );
  } finally {
    storage.close();
  }
}

function formatPairCandidates(report: BenchmarkPairCandidateReport): string {
  const lines = [
    `benchmark pair-candidates: ${report.status}`,
    `baseline candidates ${report.baseline_candidate_count}; showing ${report.baseline_candidates.length}`,
    `LoopRelay candidates ${report.looprelay_candidate_count}; showing ${report.looprelay_candidates.length}`,
    `readiness completed ${report.diagnostics.completed_snapshots}; baseline ${report.diagnostics.baseline_snapshots}; LoopRelay ${report.diagnostics.looprelay_snapshots}; evidence complete ${report.diagnostics.evidence_complete_snapshots}; safe ${report.diagnostics.safe_snapshots}`,
  ];
  for (const candidate of report.baseline_candidates) {
    lines.push(
      `- baseline ${candidate.prompt_id} ${candidate.outcome_status}; tests ${candidate.tests_run}; evidence refs ${candidate.evidence_ref_count}`,
    );
  }
  for (const candidate of report.looprelay_candidates) {
    lines.push(
      `- LoopRelay ${candidate.prompt_id} ${candidate.outcome_status}; tests ${candidate.tests_run}; evidence refs ${candidate.evidence_ref_count}`,
    );
  }
  if (report.excluded_unsafe_candidates > 0) {
    lines.push(
      `excluded unsafe candidates ${report.excluded_unsafe_candidates}`,
    );
  }
  if (report.excluded_missing_candidates > 0) {
    lines.push(
      `excluded missing candidates ${report.excluded_missing_candidates}`,
    );
  }
  lines.push(`Next: ${report.next_action}`);
  lines.push(
    "Privacy: local-only; no prompt bodies, snapshot ids, raw paths, outcome summaries, or evidence refs",
  );
  return lines.join("\n");
}

function parseCandidateLimit(value: string | undefined): number {
  const parsed = Number(value ?? 20);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 100) {
    throw new UserError(
      "benchmark pair-candidates --limit must be from 1 to 100.",
    );
  }
  return parsed;
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
      "Unable to create the prepared LoopRelay benchmark fixture.",
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
