import {
  createBenchmarkCandidateReport,
  type BenchmarkCandidateReport,
} from "../analysis/benchmark-candidates.js";
import { loadHookAuth, loadPromptLaneConfig } from "../config/config.js";
import { createSqlitePromptStorage } from "../storage/sqlite.js";
import type { PromptLaneMcpToolDefinition } from "./score-tool-definition-types.js";
import type { ScorePromptToolOptions } from "./score-tool-types.js";
import { storageUnavailableMessage } from "./storage-unavailable.js";

const LOCAL_READ_ONLY_TOOL_ANNOTATIONS = {
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: false,
  readOnlyHint: true,
} as const;

export type GetBenchmarkCandidatesToolArguments = {
  limit?: number;
};

export type GetBenchmarkCandidatesToolResult =
  | BenchmarkCandidateReport
  | {
      is_error: true;
      error_code: "invalid_input" | "storage_unavailable";
      message: string;
    };

export const GET_BENCHMARK_CANDIDATES_TOOL_DEFINITION: PromptLaneMcpToolDefinition =
  {
    name: "get_benchmark_candidates",
    description:
      "Inspect local PromptLane benchmark readiness from at most the latest 100 loop snapshots. Use this before preparing a consent-bearing real benchmark fixture. Returns only opaque prompt and snapshot ids, outcome status, counts, staged readiness diagnostics, next action, and privacy flags. It never returns prompt bodies, raw paths, outcome summaries, evidence references, transcripts, or external LLM results.",
    annotations: {
      ...LOCAL_READ_ONLY_TOOL_ANNOTATIONS,
      title: "Inspect PromptLane benchmark readiness",
    },
    inputSchema: {
      type: "object",
      properties: {
        limit: {
          type: "integer",
          minimum: 1,
          maximum: 100,
          description:
            "Maximum candidate prompt ids to return. Defaults to 20.",
        },
      },
      additionalProperties: false,
    },
    outputSchema: {
      type: "object",
      properties: {
        status: {
          type: "string",
          enum: [
            "ready",
            "no_completed_outcomes",
            "no_attributed_outcomes",
            "incomplete_outcome_evidence",
            "unsafe_outcome_evidence",
            "empty_archive",
          ],
        },
        candidate_count: { type: "integer", minimum: 0 },
        candidates: {
          type: "array",
          items: {
            type: "object",
            required: [
              "prompt_id",
              "snapshot_id",
              "outcome_status",
              "tests_run",
              "evidence_ref_count",
            ],
            properties: {
              prompt_id: { type: "string", pattern: "^prmt_[A-Za-z0-9_-]+$" },
              snapshot_id: { type: "string" },
              outcome_status: { type: "string", enum: ["passed", "failed"] },
              tests_run: { type: "integer", minimum: 0 },
              evidence_ref_count: { type: "integer", minimum: 0 },
            },
            additionalProperties: false,
          },
        },
        excluded_unsafe_candidates: { type: "integer", minimum: 0 },
        diagnostics: {
          type: "object",
          required: [
            "completed_snapshots",
            "attributed_snapshots",
            "evidence_complete_snapshots",
            "safe_snapshots",
          ],
          properties: {
            completed_snapshots: { type: "integer", minimum: 0 },
            attributed_snapshots: { type: "integer", minimum: 0 },
            evidence_complete_snapshots: { type: "integer", minimum: 0 },
            safe_snapshots: { type: "integer", minimum: 0 },
          },
          additionalProperties: false,
        },
        has_more: { type: "boolean" },
        scope: {
          type: "object",
          required: ["scanned_snapshots", "snapshot_limit"],
          properties: {
            scanned_snapshots: { type: "integer", minimum: 0, maximum: 100 },
            snapshot_limit: { const: 100 },
          },
          additionalProperties: false,
        },
        next_action: { type: "string" },
        privacy: {
          type: "object",
          required: [
            "local_only",
            "external_calls",
            "returns_prompt_bodies",
            "returns_raw_paths",
            "returns_evidence_refs",
          ],
          properties: {
            local_only: { const: true },
            external_calls: { const: false },
            returns_prompt_bodies: { const: false },
            returns_raw_paths: { const: false },
            returns_evidence_refs: { const: false },
          },
          additionalProperties: false,
        },
        is_error: { const: true },
        error_code: {
          type: "string",
          enum: ["invalid_input", "storage_unavailable"],
        },
        message: { type: "string" },
      },
      oneOf: [
        {
          required: [
            "status",
            "candidate_count",
            "candidates",
            "excluded_unsafe_candidates",
            "diagnostics",
            "has_more",
            "scope",
            "next_action",
            "privacy",
          ],
        },
        {
          required: ["is_error", "error_code", "message"],
        },
      ],
    },
  };

export function getBenchmarkCandidatesTool(
  args: GetBenchmarkCandidatesToolArguments,
  options: ScorePromptToolOptions = {},
): GetBenchmarkCandidatesToolResult {
  const limit = args.limit ?? 20;
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    return {
      is_error: true,
      error_code: "invalid_input",
      message: "get_benchmark_candidates limit must be from 1 to 100.",
    };
  }

  try {
    const config = loadPromptLaneConfig(options.dataDir);
    const auth = loadHookAuth(options.dataDir);
    const storage = createSqlitePromptStorage({
      dataDir: config.data_dir,
      hmacSecret: auth.web_session_secret,
    });
    try {
      return createBenchmarkCandidateReport(
        storage.listLoopSnapshots({ limit: 100 }).items,
        limit,
      );
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
