import { loadHookAuth, loadLoopRelayConfig } from "../config/config.js";
import type {
  ContinuationReceipt,
  ContinuationReceiptStatus,
} from "../storage/continuation-receipts.js";
import { createSqlitePromptStorage } from "../storage/sqlite.js";
import type { LoopRelayMcpToolDefinition } from "./score-tool-definition-types.js";
import type { ScorePromptToolOptions } from "./score-tool-types.js";
import { storageUnavailableMessage } from "./storage-unavailable.js";

export type RecordContinuationReceiptToolArguments = {
  receipt_id?: string;
  status?: Exclude<ContinuationReceiptStatus, "generated">;
  target_correct?: boolean;
  first_action_correct?: boolean;
  deviation_reason?: string;
  first_value_seconds?: number;
  friction_score?: number;
};

export type RecordContinuationReceiptToolResult =
  | {
      recorded: true;
      receipt: ContinuationReceipt;
      next_action: string;
    }
  | {
      is_error: true;
      error_code: "invalid_input" | "not_found" | "storage_unavailable";
      message: string;
    };

export const RECORD_CONTINUATION_RECEIPT_TOOL_DEFINITION: LoopRelayMcpToolDefinition =
  {
    name: "record_continuation_receipt",
    description:
      "Record whether a prepare_loop_brief receipt was copied, delivered, followed, partially followed, or ignored. Use the exact receipt_id returned by prepare_loop_brief. Stores only raw-free lineage and declared outcome metadata; never stores prompt bodies, transcripts, raw paths, or hidden reasoning.",
    annotations: {
      title: "Record continuation receipt",
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: false,
    },
    inputSchema: {
      type: "object",
      required: ["receipt_id", "status"],
      properties: {
        receipt_id: { type: "string" },
        status: {
          enum: ["copied", "delivered", "followed", "partial", "ignored"],
        },
        target_correct: { type: "boolean" },
        first_action_correct: { type: "boolean" },
        deviation_reason: { type: "string", maxLength: 500 },
        first_value_seconds: { type: "integer", minimum: 0 },
        friction_score: { type: "integer", minimum: 0, maximum: 3 },
      },
      additionalProperties: false,
    },
    outputSchema: {
      type: "object",
      properties: {
        recorded: { const: true },
        receipt: { type: "object" },
        next_action: { type: "string" },
        is_error: { const: true },
        error_code: { type: "string" },
        message: { type: "string" },
      },
      oneOf: [
        { required: ["recorded", "receipt", "next_action"] },
        { required: ["is_error", "error_code", "message"] },
      ],
    },
  } as const;

export function recordContinuationReceiptTool(
  args: RecordContinuationReceiptToolArguments,
  options: ScorePromptToolOptions = {},
): RecordContinuationReceiptToolResult {
  if (!args.receipt_id?.trim() || !args.status) {
    return {
      is_error: true,
      error_code: "invalid_input",
      message: "`receipt_id` and `status` are required.",
    };
  }
  try {
    const config = loadLoopRelayConfig(options.dataDir);
    const auth = loadHookAuth(options.dataDir);
    const storage = createSqlitePromptStorage({
      dataDir: config.data_dir,
      hmacSecret: auth.web_session_secret,
      ...(options.now ? { now: () => options.now! } : {}),
    });
    try {
      let receipt;
      try {
        receipt = storage.updateContinuationReceipt(args.receipt_id, {
          status: args.status,
          ...(args.target_correct === undefined
            ? {}
            : { target_correct: args.target_correct }),
          ...(args.first_action_correct === undefined
            ? {}
            : { first_action_correct: args.first_action_correct }),
          ...(args.deviation_reason
            ? { deviation_reason: args.deviation_reason }
            : {}),
          ...(args.first_value_seconds === undefined
            ? {}
            : { first_value_seconds: args.first_value_seconds }),
          ...(args.friction_score === undefined
            ? {}
            : { friction_score: args.friction_score }),
        });
      } catch (error) {
        return {
          is_error: true,
          error_code: "invalid_input",
          message:
            error instanceof Error
              ? error.message
              : "Invalid continuation receipt.",
        };
      }
      if (!receipt) {
        return {
          is_error: true,
          error_code: "not_found",
          message: "Continuation receipt not found.",
        };
      }
      return {
        recorded: true,
        receipt,
        next_action: ["followed", "partial", "ignored"].includes(receipt.status)
          ? "Record or review the linked loop outcome and evidence."
          : "After first value, record whether the continuation was followed.",
      };
    } finally {
      storage.close();
    }
  } catch (error) {
    return {
      is_error: true,
      error_code: "storage_unavailable",
      message: storageUnavailableMessage(error),
    };
  }
}
