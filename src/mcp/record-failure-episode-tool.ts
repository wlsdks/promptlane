import { loadHookAuth, loadLoopRelayConfig } from "../config/config.js";
import {
  parseFailureEpisodeInput,
  type RecordFailureEpisodeInput,
} from "../loop/failure-episode.js";
import { createSqlitePromptStorage } from "../storage/sqlite.js";
import type { LoopRelayMcpToolDefinition } from "./score-tool-definition-types.js";
import type { ScorePromptToolOptions } from "./score-tool-types.js";
import { storageUnavailableMessage } from "./storage-unavailable.js";

export type RecordFailureEpisodeToolArguments = RecordFailureEpisodeInput;

export const RECORD_FAILURE_EPISODE_TOOL_DEFINITION: LoopRelayMcpToolDefinition =
  {
    name: "record_failure_episode",
    description:
      "Confirm, resolve, or explicitly retain one failed or blocked local loop episode. Requires operator-provided category and intervention; it never infers failures from transcripts and stores no prompt body, transcript, raw path, secret, or hidden reasoning.",
    annotations: {
      title: "Record failure episode",
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
    inputSchema: {
      type: "object",
      required: [
        "snapshot_id",
        "category",
        "status",
        "intervention",
        "confirmed_by",
      ],
      properties: {
        snapshot_id: { type: "string" },
        category: {
          enum: [
            "setup",
            "validation",
            "context_loss",
            "selection",
            "permission",
            "tooling",
            "data_integrity",
            "other",
          ],
        },
        status: { enum: ["open", "resolved", "wont_fix"] },
        intervention: { type: "string", maxLength: 500 },
        resolution: { type: "string", maxLength: 500 },
        confirmed_by: { type: "string", maxLength: 80 },
      },
      additionalProperties: false,
    },
    outputSchema: {
      type: "object",
      properties: {
        recorded: { const: true },
        episode: { type: "object" },
        next_action: { type: "string" },
        is_error: { const: true },
        error_code: { type: "string" },
        message: { type: "string" },
      },
      oneOf: [
        { required: ["recorded", "episode", "next_action"] },
        { required: ["is_error", "error_code", "message"] },
      ],
    },
  } as const;

export function recordFailureEpisodeTool(
  args: RecordFailureEpisodeToolArguments,
  options: ScorePromptToolOptions = {},
) {
  const parsed = parseFailureEpisodeInput(args);
  if (!parsed.ok) {
    return {
      is_error: true as const,
      error_code: "invalid_input" as const,
      message: parsed.message,
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
      const episode = storage.recordFailureEpisode(parsed.input);
      return {
        recorded: true as const,
        episode,
        next_action:
          episode.status === "open"
            ? "Apply the intervention, then record verified loop evidence."
            : "Review recurrence in get_looprelay_action_inbox.",
      };
    } catch (error) {
      return {
        is_error: true as const,
        error_code: "invalid_input" as const,
        message:
          error instanceof Error ? error.message : "Failure episode failed.",
      };
    } finally {
      storage.close();
    }
  } catch (error) {
    return {
      is_error: true as const,
      error_code: "storage_unavailable" as const,
      message: storageUnavailableMessage(error),
    };
  }
}
