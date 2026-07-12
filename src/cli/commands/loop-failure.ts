import type { Command } from "commander";

import { loadHookAuth, loadLoopRelayConfig } from "../../config/config.js";
import { parseFailureEpisodeInput } from "../../loop/failure-episode.js";
import { createSqlitePromptStorage } from "../../storage/sqlite.js";
import { UserError } from "../user-error.js";

type FailureOptions = {
  category?: string;
  confirmedBy?: string;
  dataDir?: string;
  intervention?: string;
  json?: boolean;
  limit?: string | number;
  resolution?: string;
  snapshotId?: string;
  status?: string;
};

export function registerLoopFailureCommand(loop: Command): void {
  const failure = loop
    .command("failure")
    .description("Confirm and review raw-free failure episodes.");
  failure
    .command("record")
    .description("Confirm or resolve one failed or blocked loop episode.")
    .requiredOption("--snapshot-id <id>")
    .requiredOption(
      "--category <category>",
      "setup, validation, context_loss, selection, permission, tooling, data_integrity, or other.",
    )
    .requiredOption("--status <status>", "open, resolved, or wont_fix.")
    .requiredOption("--intervention <text>", "Raw-free intervention.")
    .option("--resolution <text>", "Required for resolved episodes.")
    .option("--confirmed-by <actor>", "Confirmation actor.", "user")
    .option("--data-dir <path>")
    .option("--json", "Print JSON.")
    .action((options: FailureOptions) =>
      console.log(loopFailureRecordForCli(options)),
    );
  failure
    .command("list")
    .description("List operator-confirmed local failure episodes.")
    .option("--status <status>", "Filter by open, resolved, or wont_fix.")
    .option("--limit <count>", "Maximum episodes.", "50")
    .option("--data-dir <path>")
    .option("--json", "Print JSON.")
    .action((options: FailureOptions) =>
      console.log(loopFailureListForCli(options)),
    );
}

export function loopFailureRecordForCli(options: FailureOptions = {}): string {
  const parsed = parseFailureEpisodeInput({
    snapshot_id: options.snapshotId,
    category: options.category,
    status: options.status,
    intervention: options.intervention,
    resolution: options.resolution,
    confirmed_by: options.confirmedBy,
  });
  if (!parsed.ok) throw new UserError(parsed.message);
  return withStorage(options.dataDir, (storage) => {
    try {
      const episode = storage.recordFailureEpisode(parsed.input);
      const result = {
        recorded: true as const,
        episode,
        next_action:
          episode.status === "open"
            ? "apply the intervention and record the verified outcome"
            : "review recurrence in looprelay loop actions",
      };
      return options.json
        ? JSON.stringify(result, null, 2)
        : `Failure ${episode.id}: ${episode.category} · ${episode.status}.`;
    } catch (error) {
      throw new UserError(
        error instanceof Error ? error.message : "Failure episode failed.",
      );
    }
  });
}

export function loopFailureListForCli(options: FailureOptions = {}): string {
  const status = failureStatus(options.status);
  const limit = integer(options.limit ?? 50, "--limit", 1, 100);
  return withStorage(options.dataDir, (storage) => {
    const episodes = storage.listFailureEpisodes({
      limit,
      ...(status ? { status } : {}),
    });
    const result = {
      items: episodes,
      total: episodes.length,
      privacy: {
        local_only: true as const,
        returns_prompt_bodies: false as const,
        returns_raw_paths: false as const,
        returns_transcripts: false as const,
        inferred: false as const,
      },
    };
    return options.json
      ? JSON.stringify(result, null, 2)
      : episodes.length === 0
        ? "No confirmed failure episodes."
        : episodes
            .map(
              (episode) =>
                `${episode.id} · ${episode.category} · ${episode.status}`,
            )
            .join("\n");
  });
}

function withStorage<T>(
  dataDir: string | undefined,
  action: (storage: ReturnType<typeof createSqlitePromptStorage>) => T,
): T {
  const config = loadLoopRelayConfig(dataDir);
  const auth = loadHookAuth(dataDir);
  const storage = createSqlitePromptStorage({
    dataDir: config.data_dir,
    hmacSecret: auth.web_session_secret,
  });
  try {
    return action(storage);
  } finally {
    storage.close();
  }
}

function failureStatus(value: string | undefined) {
  if (value === undefined) return undefined;
  if (value === "open" || value === "resolved" || value === "wont_fix") {
    return value;
  }
  throw new UserError("--status must be open, resolved, or wont_fix.");
}

function integer(
  value: string | number,
  option: string,
  minimum: number,
  maximum: number,
): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < minimum || parsed > maximum) {
    throw new UserError(`${option} must be from ${minimum} to ${maximum}.`);
  }
  return parsed;
}
