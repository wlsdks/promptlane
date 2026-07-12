import { randomUUID } from "node:crypto";
import { rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import { initializeLoopRelay, loadHookAuth } from "../config/config.js";
import type { LoopSnapshot } from "../loop/types.js";
import { createSqlitePromptStorage } from "../storage/sqlite.js";
import { recordContinuationReceiptTool } from "./continuation-receipt-tool.js";

const dirs: string[] = [];
afterEach(() =>
  dirs
    .splice(0)
    .forEach((dir) => rmSync(dir, { recursive: true, force: true })),
);

describe("record_continuation_receipt", () => {
  it("records raw-free followed metadata for an exact brief receipt", () => {
    const dataDir = join(tmpdir(), `looprelay-mcp-receipt-${randomUUID()}`);
    dirs.push(dataDir);
    initializeLoopRelay({ dataDir });
    const storage = createSqlitePromptStorage({
      dataDir,
      hmacSecret: loadHookAuth(dataDir).web_session_secret,
    });
    storage.createLoopSnapshot(snapshot());
    const receipt = storage.recordContinuationReceipt({
      snapshot_id: "loop_mcp_receipt",
    });
    storage.close();

    const result = recordContinuationReceiptTool(
      {
        receipt_id: receipt.id,
        status: "followed",
        target_correct: true,
        first_action_correct: true,
        first_value_seconds: 9,
        friction_score: 0,
      },
      { dataDir, now: new Date("2026-07-12T01:00:00.000Z") },
    );

    expect(result).toMatchObject({
      recorded: true,
      receipt: {
        id: receipt.id,
        snapshot_id: "loop_mcp_receipt",
        status: "followed",
        target_correct: true,
        first_action_correct: true,
        first_value_seconds: 9,
        friction_score: 0,
      },
    });
    expect(JSON.stringify(result)).not.toContain("/Users/");
  });
});

function snapshot(): LoopSnapshot {
  return {
    id: "loop_mcp_receipt",
    created_at: "2026-07-12T00:00:00.000Z",
    tool: "codex",
    source: "mcp",
    cwd_label: "mcp-project",
    project_id: "proj_mcp_receipt",
    prompt_ids: [],
    event_counts: { prompts: 0 },
    quality: { top_gaps: [], unresolved_questions: [] },
    outcome: {
      status: "in_progress",
      summary: "Continue the selected MCP receipt task.",
      evidence_refs: ["commit:abc123"],
    },
    next_brief: { generated: false, summary: "Prepare next brief." },
    privacy: {
      local_only: true,
      stores_prompt_bodies: false,
      stores_raw_paths: false,
    },
  };
}
