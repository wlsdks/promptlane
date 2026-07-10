import { createInterface } from "node:readline";
import type { Readable, Writable } from "node:stream";

import { VERSION } from "../shared/version.js";
import { createRpcChannel, type RpcChannel } from "./rpc-channel.js";
import {
  PROMPTLANE_MCP_TOOL_DEFINITIONS,
  getPromptLaneMcpToolHandler,
} from "./tool-registry.js";
import type { ScorePromptToolOptions } from "./score-tool-types.js";

type JsonRpcId = string | number | null;

type JsonRpcRequest = {
  jsonrpc: "2.0";
  id?: JsonRpcId;
  method?: string;
  params?: unknown;
};

type JsonRpcResponse =
  | {
      jsonrpc: "2.0";
      id: JsonRpcId;
      result: unknown;
    }
  | {
      jsonrpc: "2.0";
      id: JsonRpcId;
      error: {
        code: number;
        message: string;
      };
    };

export type PromptLaneMcpServerContext = {
  channel: RpcChannel;
  clientCapabilities: Record<string, unknown>;
};

export type PromptLaneMcpServerOptions = ScorePromptToolOptions & {
  ctx?: PromptLaneMcpServerContext;
};

export async function runPromptLaneMcpServer(
  options: PromptLaneMcpServerOptions = {},
  input: Readable = process.stdin,
  output: Writable = process.stdout,
): Promise<void> {
  const lines = createInterface({
    input,
    crlfDelay: Number.POSITIVE_INFINITY,
  });
  const channel = options.ctx?.channel ?? createRpcChannel(output);
  const ctx: PromptLaneMcpServerContext = options.ctx ?? {
    channel,
    clientCapabilities: {},
  };
  const optionsWithCtx: PromptLaneMcpServerOptions = { ...options, ctx };
  const inflight = new Set<Promise<void>>();

  try {
    for await (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      let parsed: unknown;
      try {
        parsed = JSON.parse(trimmed);
      } catch {
        output.write(
          `${JSON.stringify(
            jsonRpcError(
              null,
              -32700,
              "Parse error. Expected one JSON-RPC message per line.",
            ),
          )}\n`,
        );
        continue;
      }

      const messages = Array.isArray(parsed) ? parsed : [parsed];
      for (const message of messages) {
        if (channel.isResponseEnvelope(message)) {
          channel.fulfillResponse(message);
          continue;
        }
        // Run message handlers concurrently so a tool call that waits on
        // server-initiated requests (e.g. elicitation/create) does not block
        // the input loop from delivering the matching response.
        const tracked = (async () => {
          try {
            const response = await handleMcpMessage(message, optionsWithCtx);
            if (response) output.write(`${JSON.stringify(response)}\n`);
          } catch {
            // Last-resort safety net. handleMcpMessage already returns
            // jsonRpcError for invalid input or unknown methods, but a tool
            // handler that throws unexpectedly should not crash the loop or
            // leak as an unhandled rejection — emit an internal error so the
            // client sees a response and the server keeps running.
            const requestId =
              message && typeof message === "object"
                ? ((message as { id?: JsonRpcId }).id ?? null)
                : null;
            output.write(
              `${JSON.stringify(jsonRpcError(requestId, -32603, "internal server error"))}\n`,
            );
          }
        })();
        inflight.add(tracked);
        void tracked.finally(() => inflight.delete(tracked));
      }
    }
    if (inflight.size > 0) {
      await Promise.allSettled([...inflight]);
    }
  } finally {
    channel.cancelAll("input stream closed");
  }
}

export function handleMcpLine(
  line: string,
  options: PromptLaneMcpServerOptions = {},
): Promise<JsonRpcResponse[]> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(line);
  } catch {
    return Promise.resolve([
      jsonRpcError(
        null,
        -32700,
        "Parse error. Expected one JSON-RPC message per line.",
      ),
    ]);
  }
  const messages = Array.isArray(parsed) ? parsed : [parsed];
  return Promise.all(
    messages.map((message) => handleMcpMessage(message, options)),
  ).then((responses) =>
    responses.filter((value): value is JsonRpcResponse => value !== undefined),
  );
}

export async function handleMcpMessage(
  message: unknown,
  options: PromptLaneMcpServerOptions = {},
): Promise<JsonRpcResponse | undefined> {
  if (!isJsonRpcRequest(message)) {
    return jsonRpcError(null, -32600, "Invalid JSON-RPC request.");
  }

  if (message.id === undefined && isNotification(message.method)) {
    return undefined;
  }

  const id = message.id ?? null;

  switch (message.method) {
    case "initialize":
      if (options.ctx) {
        const params = message.params as
          | { capabilities?: Record<string, unknown> }
          | undefined;
        options.ctx.clientCapabilities = params?.capabilities ?? {};
      }
      return jsonRpcResult(id, {
        protocolVersion: readRequestedProtocolVersion(message.params),
        capabilities: {
          tools: {
            listChanged: false,
          },
        },
        serverInfo: {
          name: "promptlane",
          version: VERSION,
        },
        instructions:
          "Use coach_prompt for the default one-call Claude Code/Codex coaching workflow: status, latest prompt score, approval-ready rewrite, habit review, project instruction review, and next request guidance. Use get_promptlane_status only for readiness checks, get_benchmark_candidates for body-free real-effectiveness readiness before fixture preparation, get_paired_benchmark_candidates for body-free baseline and PromptLane candidate groups before an operator-reviewed paired study, score_prompt for one prompt, improve_prompt for one local deterministic rewrite, ask_clarifying_questions when you want promptlane to drive the elicitation flow itself (it asks the user via MCP elicitation/create when the client supports it and composes the final draft, otherwise falls back to clarifying_questions metadata), apply_clarifications when the user has answered the clarifying_questions returned by improve_prompt or coach_prompt and you need to compose the final draft from the user's verbatim answers, record_clarifications when you also want to save the user's verbatim answers and the resulting draft against a stored prompt in the archive, prepare_agent_rewrite and record_agent_rewrite when the user explicitly wants the active agent session to semantically rewrite a stored prompt, score_prompt_archive for habit-only review, review_project_instructions for AGENTS.md/CLAUDE.md-only checks, and prepare_agent_judge_batch plus record_agent_judgments when the active agent should judge accumulated prompts. ASK-FIRST RULE: whenever any tool returns a non-empty clarifying_questions array, ask the user those questions through your native ask UI (Claude Code AskUserQuestion, Codex ask_user_question), then call apply_clarifications first to compose and show the final approval-ready draft in chat; call record_clarifications only if the user also wants to save that draft against a stored prompt. Do not guess answers, do not skip questions, and never auto-submit a rewrite. This server is local-only and does not call external LLMs.",
      });
    case "ping":
      return jsonRpcResult(id, {});
    case "tools/list":
      return jsonRpcResult(id, {
        tools: PROMPTLANE_MCP_TOOL_DEFINITIONS,
      });
    case "tools/call":
      return await handleToolCall(id, message.params, options);
    default:
      return jsonRpcError(id, -32601, `Method not found: ${message.method}`);
  }
}

async function handleToolCall(
  id: JsonRpcId,
  params: unknown,
  options: PromptLaneMcpServerOptions,
): Promise<JsonRpcResponse> {
  if (!isToolCallParams(params)) {
    return jsonRpcError(
      id,
      -32602,
      "`tools/call` requires params.name and params.arguments.",
    );
  }

  const handler = getPromptLaneMcpToolHandler(params.name);
  const handlerResult = handler?.(params.arguments, options);

  if (!handlerResult) {
    return jsonRpcError(id, -32602, `Unknown tool: ${params.name}`);
  }

  const result = await handlerResult;
  const isError =
    typeof result === "object" && result !== null && "is_error" in result;

  return jsonRpcResult(id, {
    content: [
      {
        type: "text",
        text: JSON.stringify(result, null, 2),
      },
    ],
    structuredContent: result,
    isError,
  });
}

function isJsonRpcRequest(value: unknown): value is JsonRpcRequest {
  return (
    Boolean(value) &&
    typeof value === "object" &&
    (value as JsonRpcRequest).jsonrpc === "2.0" &&
    typeof (value as JsonRpcRequest).method === "string"
  );
}

function isToolCallParams(
  value: unknown,
): value is { name: string; arguments: Record<string, unknown> } {
  return (
    Boolean(value) &&
    typeof value === "object" &&
    typeof (value as { name?: unknown }).name === "string" &&
    Boolean((value as { arguments?: unknown }).arguments) &&
    typeof (value as { arguments?: unknown }).arguments === "object" &&
    !Array.isArray((value as { arguments?: unknown }).arguments)
  );
}

function isNotification(method: string | undefined): boolean {
  return (
    method === "notifications/initialized" ||
    method === "notifications/cancelled"
  );
}

function readRequestedProtocolVersion(params: unknown): string {
  if (
    params &&
    typeof params === "object" &&
    typeof (params as { protocolVersion?: unknown }).protocolVersion ===
      "string"
  ) {
    return (params as { protocolVersion: string }).protocolVersion;
  }

  return "2025-03-26";
}

function jsonRpcResult(id: JsonRpcId, result: unknown): JsonRpcResponse {
  return {
    jsonrpc: "2.0",
    id,
    result,
  };
}

function jsonRpcError(
  id: JsonRpcId,
  code: number,
  message: string,
): JsonRpcResponse {
  return {
    jsonrpc: "2.0",
    id,
    error: {
      code,
      message,
    },
  };
}
