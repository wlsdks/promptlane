import { loadHookAuth, loadLoopRelayConfig } from "../config/config.js";
import { createActionInboxFromStorage } from "../loop/action-inbox-service.js";
import { createSqlitePromptStorage } from "../storage/sqlite.js";
import type { LoopRelayMcpToolDefinition } from "./score-tool-definition-types.js";
import type { ScorePromptToolOptions } from "./score-tool-types.js";
import { storageUnavailableMessage } from "./storage-unavailable.js";

export const GET_LOOPRELAY_ACTION_INBOX_TOOL_DEFINITION: LoopRelayMcpToolDefinition =
  {
    name: "get_looprelay_action_inbox",
    description:
      "Return the local operator action inbox and recent outcome coverage for long-running coding-agent loops. The report is derived from safe snapshot, receipt, evidence, failure, and memory metadata. It never returns prompt bodies, transcripts, raw paths, or causal claims.",
    annotations: {
      title: "Get LoopRelay action inbox",
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
    inputSchema: {
      type: "object",
      properties: {},
      additionalProperties: false,
    },
    outputSchema: {
      type: "object",
      properties: {
        generated_at: { type: "string" },
        summary: { type: "object" },
        items: { type: "array", items: { type: "object" } },
        outcomes: { type: "array", items: { type: "object" } },
        failure_patterns: { type: "array", items: { type: "object" } },
        privacy: { type: "object" },
        is_error: { const: true },
        error_code: { type: "string" },
        message: { type: "string" },
      },
      oneOf: [
        {
          required: [
            "generated_at",
            "summary",
            "items",
            "outcomes",
            "failure_patterns",
            "privacy",
          ],
        },
        { required: ["is_error", "error_code", "message"] },
      ],
    },
  } as const;

export function getLoopRelayActionInboxTool(
  _args: Record<string, unknown>,
  options: ScorePromptToolOptions = {},
) {
  try {
    const config = loadLoopRelayConfig(options.dataDir);
    const auth = loadHookAuth(options.dataDir);
    const storage = createSqlitePromptStorage({
      dataDir: config.data_dir,
      hmacSecret: auth.web_session_secret,
      ...(options.now ? { now: () => options.now! } : {}),
    });
    try {
      return createActionInboxFromStorage(storage, options.now ?? new Date());
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
