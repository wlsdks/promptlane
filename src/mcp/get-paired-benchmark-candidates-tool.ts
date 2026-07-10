import {
  createBenchmarkPairCandidateReport,
  type BenchmarkPairCandidateReport,
} from "../analysis/benchmark-pair-candidates.js";
import { loadHookAuth, loadPromptLaneConfig } from "../config/config.js";
import { createSqlitePromptStorage } from "../storage/sqlite.js";
import type { PromptLaneMcpToolDefinition } from "./score-tool-definition-types.js";
import type { ScorePromptToolOptions } from "./score-tool-types.js";
import { storageUnavailableMessage } from "./storage-unavailable.js";

export type GetPairedBenchmarkCandidatesToolArguments = {
  limit?: number;
};

export type GetPairedBenchmarkCandidatesToolResult =
  | BenchmarkPairCandidateReport
  | {
      is_error: true;
      error_code: "invalid_input" | "storage_unavailable";
      message: string;
    };

const CANDIDATE_SCHEMA = {
  type: "object",
  required: ["prompt_id", "outcome_status", "tests_run", "evidence_ref_count"],
  properties: {
    prompt_id: { type: "string", pattern: "^prmt_[A-Za-z0-9_-]+$" },
    outcome_status: { type: "string", enum: ["passed", "failed"] },
    tests_run: { type: "integer", minimum: 0 },
    evidence_ref_count: { type: "integer", minimum: 0 },
  },
  additionalProperties: false,
} as const;

export const GET_PAIRED_BENCHMARK_CANDIDATES_TOOL_DEFINITION: PromptLaneMcpToolDefinition =
  {
    name: "get_paired_benchmark_candidates",
    description:
      "Inspect local PromptLane baseline and treatment readiness from at most the latest 100 loop snapshots. Use this before preparing a paired effectiveness fixture. Returns separate opaque baseline and explicitly attributed PromptLane prompt ids, outcome status, counts, diagnostics, next action, and privacy flags. It never infers task equivalence and never returns prompt bodies, snapshot ids, raw paths, outcome summaries, evidence references, transcripts, or external LLM results.",
    annotations: {
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
      readOnlyHint: true,
      title: "Inspect paired benchmark candidates",
    },
    inputSchema: {
      type: "object",
      properties: {
        limit: {
          type: "integer",
          minimum: 1,
          maximum: 100,
          description: "Maximum candidates per group. Defaults to 20.",
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
            "needs_baseline",
            "needs_promptlane",
            "no_completed_outcomes",
            "incomplete_outcome_evidence",
            "unsafe_outcome_evidence",
            "empty_archive",
          ],
        },
        baseline_candidate_count: { type: "integer", minimum: 0 },
        promptlane_candidate_count: { type: "integer", minimum: 0 },
        baseline_candidates: { type: "array", items: CANDIDATE_SCHEMA },
        promptlane_candidates: { type: "array", items: CANDIDATE_SCHEMA },
        excluded_unsafe_candidates: { type: "integer", minimum: 0 },
        diagnostics: {
          type: "object",
          required: [
            "completed_snapshots",
            "baseline_snapshots",
            "promptlane_snapshots",
            "evidence_complete_snapshots",
            "safe_snapshots",
          ],
          properties: {
            completed_snapshots: { type: "integer", minimum: 0 },
            baseline_snapshots: { type: "integer", minimum: 0 },
            promptlane_snapshots: { type: "integer", minimum: 0 },
            evidence_complete_snapshots: { type: "integer", minimum: 0 },
            safe_snapshots: { type: "integer", minimum: 0 },
          },
          additionalProperties: false,
        },
        has_more: {
          type: "object",
          required: ["baseline", "promptlane"],
          properties: {
            baseline: { type: "boolean" },
            promptlane: { type: "boolean" },
          },
          additionalProperties: false,
        },
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
            "returns_snapshot_ids",
            "returns_raw_paths",
            "returns_outcome_summaries",
            "returns_evidence_refs",
          ],
          properties: {
            local_only: { const: true },
            external_calls: { const: false },
            returns_prompt_bodies: { const: false },
            returns_snapshot_ids: { const: false },
            returns_raw_paths: { const: false },
            returns_outcome_summaries: { const: false },
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
            "baseline_candidate_count",
            "promptlane_candidate_count",
            "baseline_candidates",
            "promptlane_candidates",
            "excluded_unsafe_candidates",
            "diagnostics",
            "has_more",
            "scope",
            "next_action",
            "privacy",
          ],
        },
        { required: ["is_error", "error_code", "message"] },
      ],
    },
  };

export function getPairedBenchmarkCandidatesTool(
  args: GetPairedBenchmarkCandidatesToolArguments,
  options: ScorePromptToolOptions = {},
): GetPairedBenchmarkCandidatesToolResult {
  const limit = args.limit ?? 20;
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    return {
      is_error: true,
      error_code: "invalid_input",
      message: "get_paired_benchmark_candidates limit must be from 1 to 100.",
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
      return createBenchmarkPairCandidateReport(
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
