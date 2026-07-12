import type { Command } from "commander";

import { loadHookAuth, loadLoopRelayConfig } from "../../config/config.js";
import { createSqlitePromptStorage } from "../../storage/sqlite.js";
import { UserError } from "../user-error.js";

type ReceiptOptions = {
  dataDir?: string;
  deviationReason?: string;
  firstActionCorrect?: string;
  firstValueSeconds?: string | number;
  frictionScore?: string | number;
  json?: boolean;
  receiptId?: string;
  status?: string;
  targetCorrect?: string;
};

export function registerLoopReceiptCommand(loop: Command): void {
  loop
    .command("receipt")
    .description("Record raw-free continuation brief delivery or use.")
    .requiredOption("--receipt-id <id>", "Continuation receipt id.")
    .requiredOption(
      "--status <status>",
      "Receipt status (copied, delivered, followed, partial, or ignored).",
    )
    .option("--target-correct <yes|no>", "Whether the target was correct.")
    .option(
      "--first-action-correct <yes|no>",
      "Whether the first action matched the checkpoint.",
    )
    .option(
      "--deviation-reason <reason>",
      "Required raw-free reason for partial or ignored use.",
    )
    .option("--first-value-seconds <seconds>", "Seconds to first value.")
    .option("--friction-score <0-3>", "Operator friction score.")
    .option("--data-dir <path>", "Override the looprelay data directory.")
    .option("--json", "Print JSON.")
    .action((options: ReceiptOptions) => {
      console.log(loopReceiptForCli(options));
    });
}

export function loopReceiptForCli(options: ReceiptOptions = {}): string {
  const receiptId = options.receiptId?.trim();
  if (!receiptId) throw new UserError("--receipt-id is required.");
  const status = receiptStatus(options.status);
  const config = loadLoopRelayConfig(options.dataDir);
  const auth = loadHookAuth(options.dataDir);
  const storage = createSqlitePromptStorage({
    dataDir: config.data_dir,
    hmacSecret: auth.web_session_secret,
  });
  try {
    let receipt;
    try {
      receipt = storage.updateContinuationReceipt(receiptId, {
        status,
        ...(options.targetCorrect === undefined
          ? {}
          : { target_correct: yesNo(options.targetCorrect) }),
        ...(options.firstActionCorrect === undefined
          ? {}
          : { first_action_correct: yesNo(options.firstActionCorrect) }),
        ...(options.deviationReason
          ? { deviation_reason: options.deviationReason }
          : {}),
        ...(options.firstValueSeconds === undefined
          ? {}
          : {
              first_value_seconds: integer(
                options.firstValueSeconds,
                "--first-value-seconds",
                0,
              ),
            }),
        ...(options.frictionScore === undefined
          ? {}
          : {
              friction_score: integer(
                options.frictionScore,
                "--friction-score",
                0,
                3,
              ),
            }),
      });
    } catch (error) {
      throw new UserError(
        error instanceof Error
          ? error.message
          : "Continuation receipt could not be recorded.",
      );
    }
    if (!receipt) throw new UserError("Continuation receipt not found.");
    const result = {
      recorded: true as const,
      receipt,
      next_action: ["followed", "partial", "ignored"].includes(receipt.status)
        ? "review the linked outcome and evidence"
        : "record whether the continuation was followed after first value",
    };
    return options.json
      ? JSON.stringify(result, null, 2)
      : `Continuation receipt ${receipt.id}: ${receipt.status}.`;
  } finally {
    storage.close();
  }
}

function receiptStatus(
  value: string | undefined,
): "copied" | "delivered" | "followed" | "partial" | "ignored" {
  if (
    value === "copied" ||
    value === "delivered" ||
    value === "followed" ||
    value === "partial" ||
    value === "ignored"
  ) {
    return value;
  }
  throw new UserError(
    "--status must be copied, delivered, followed, partial, or ignored.",
  );
}

function yesNo(value: string): boolean {
  if (value === "yes") return true;
  if (value === "no") return false;
  throw new UserError("Boolean receipt fields must be yes or no.");
}

function integer(
  value: string | number,
  option: string,
  minimum: number,
  maximum = Number.MAX_SAFE_INTEGER,
): number {
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isInteger(parsed) || parsed < minimum || parsed > maximum) {
    throw new UserError(
      `${option} must be an integer from ${minimum} to ${maximum}.`,
    );
  }
  return parsed;
}
