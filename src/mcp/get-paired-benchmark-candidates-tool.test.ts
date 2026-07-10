import { randomUUID } from "node:crypto";
import { rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { initializePromptLane } from "../config/config.js";
import type { LoopSnapshot } from "../loop/types.js";
import { createSqlitePromptStorage } from "../storage/sqlite.js";
import {
  GET_PAIRED_BENCHMARK_CANDIDATES_TOOL_DEFINITION,
  getPairedBenchmarkCandidatesTool,
} from "./get-paired-benchmark-candidates-tool.js";

const tempDirs: string[] = [];

afterEach(() => {
  for (const dir of tempDirs.splice(0)) {
    rmSync(dir, { recursive: true, force: true });
  }
});

describe("get_paired_benchmark_candidates MCP tool", () => {
  it("declares a local read-only body-free schema", () => {
    expect(GET_PAIRED_BENCHMARK_CANDIDATES_TOOL_DEFINITION).toMatchObject({
      name: "get_paired_benchmark_candidates",
      annotations: {
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
        readOnlyHint: true,
      },
      inputSchema: {
        properties: {
          limit: { type: "integer", minimum: 1, maximum: 100 },
        },
        additionalProperties: false,
      },
      outputSchema: {
        properties: {
          baseline_candidates: expect.any(Object),
          promptlane_candidates: expect.any(Object),
          privacy: expect.objectContaining({
            properties: expect.objectContaining({
              returns_prompt_bodies: { const: false },
              returns_snapshot_ids: { const: false },
              returns_outcome_summaries: { const: false },
              returns_evidence_refs: { const: false },
            }),
          }),
        },
      },
    });
    expect(
      JSON.stringify(GET_PAIRED_BENCHMARK_CANDIDATES_TOOL_DEFINITION),
    ).not.toContain('"snapshot_id"');
  });

  it("returns separate body-free baseline and PromptLane candidates", () => {
    const dataDir = createTempDir();
    initializePromptLane({ dataDir });
    const storage = createSqlitePromptStorage({ dataDir });
    storage.createLoopSnapshot(snapshot("loop_lane", "prmt_lane", true));
    storage.createLoopSnapshot(snapshot("loop_base", "prmt_base", false));
    storage.close();

    const result = getPairedBenchmarkCandidatesTool({ limit: 10 }, { dataDir });
    const serialized = JSON.stringify(result);

    expect(result).toMatchObject({
      status: "ready",
      baseline_candidates: [{ prompt_id: "prmt_base" }],
      promptlane_candidates: [{ prompt_id: "prmt_lane" }],
      privacy: {
        local_only: true,
        external_calls: false,
        returns_prompt_bodies: false,
        returns_snapshot_ids: false,
        returns_raw_paths: false,
        returns_outcome_summaries: false,
        returns_evidence_refs: false,
      },
    });
    expect(serialized).not.toContain("Private outcome summary");
    expect(serialized).not.toContain("test:private-ref");
    expect(serialized).not.toContain("loop_lane");
  });

  it("rejects invalid limits before accessing storage", () => {
    expect(getPairedBenchmarkCandidatesTool({ limit: 101 })).toEqual({
      is_error: true,
      error_code: "invalid_input",
      message: "get_paired_benchmark_candidates limit must be from 1 to 100.",
    });
  });
});

function createTempDir(): string {
  const dir = join(tmpdir(), `promptlane-mcp-paired-${randomUUID()}`);
  tempDirs.push(dir);
  return dir;
}

function snapshot(
  id: string,
  promptId: string,
  improvementUsed: boolean,
): LoopSnapshot {
  return {
    id,
    created_at: "2026-07-10T00:00:00.000Z",
    tool: "codex",
    source: "cli",
    cwd_label: "private-project",
    project_id: "proj_mcp_candidate",
    prompt_ids: [promptId],
    event_counts: { prompts: 1, tests_run: 2 },
    quality: { top_gaps: [], unresolved_questions: [] },
    outcome: {
      status: "passed",
      summary: "Private outcome summary",
      evidence_refs: ["test:private-ref"],
      ...(improvementUsed ? { used_improvement_prompt_ids: [promptId] } : {}),
    },
    next_brief: { generated: false, summary: "Continue local work." },
    privacy: {
      local_only: true,
      stores_prompt_bodies: false,
      stores_raw_paths: false,
    },
  };
}
