import { randomUUID } from "node:crypto";
import { rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import type { LoopSnapshot } from "../loop/types.js";
import { createSqlitePromptStorage } from "./sqlite.js";

const dirs: string[] = [];
afterEach(() =>
  dirs
    .splice(0)
    .forEach((dir) => rmSync(dir, { recursive: true, force: true })),
);

describe("continuation receipt storage", () => {
  it("binds a generated receipt to the selected snapshot and preserves lineage", () => {
    const { storage } = fixture();
    const receipt = storage.recordContinuationReceipt({
      snapshot_id: "loop_selected",
    });

    expect(receipt).toMatchObject({
      snapshot_id: "loop_selected",
      project_id: "proj_selected",
      policy_version: "recovery-packet-v2",
      status: "generated",
      privacy: {
        local_only: true,
        stores_prompt_bodies: false,
        stores_raw_paths: false,
        stores_transcripts: false,
      },
    });
    expect(
      storage.listContinuationReceipts({ snapshotId: "loop_selected" }),
    ).toEqual([receipt]);
    expect(storage.getAppliedMigrations()).toContainEqual({
      version: 21,
      name: "021_continuation_receipts",
    });
    storage.close();
  });

  it("records copy, delivery, and raw-free final usage without moving backwards", () => {
    const { storage } = fixture();
    const receipt = storage.recordContinuationReceipt({
      snapshot_id: "loop_selected",
    });
    storage.updateContinuationReceipt(receipt.id, { status: "copied" });
    storage.updateContinuationReceipt(receipt.id, { status: "delivered" });
    const followed = storage.updateContinuationReceipt(receipt.id, {
      status: "followed",
      target_correct: true,
      first_action_correct: true,
      first_value_seconds: 18,
      friction_score: 0,
    });

    expect(followed).toMatchObject({
      status: "followed",
      target_correct: true,
      first_action_correct: true,
      first_value_seconds: 18,
      friction_score: 0,
    });
    expect(followed?.copied_at).toBeDefined();
    expect(followed?.delivered_at).toBeDefined();
    expect(followed?.used_at).toBeDefined();
    expect(() =>
      storage.updateContinuationReceipt(receipt.id, { status: "copied" }),
    ).toThrow("must not move backwards");
    storage.close();
  });

  it("requires a safe reason for partial or ignored use", () => {
    const { storage } = fixture();
    const receipt = storage.recordContinuationReceipt({
      snapshot_id: "loop_selected",
    });
    expect(() =>
      storage.updateContinuationReceipt(receipt.id, { status: "partial" }),
    ).toThrow("require a deviation reason");
    expect(() =>
      storage.updateContinuationReceipt(receipt.id, {
        status: "ignored",
        deviation_reason: "Read /Users/example/private-plan.md instead.",
      }),
    ).toThrow("must not include secrets or raw local paths");
    storage.close();
  });
});

function fixture() {
  const dataDir = join(tmpdir(), `looprelay-receipt-${randomUUID()}`);
  dirs.push(dataDir);
  let tick = 0;
  const storage = createSqlitePromptStorage({
    dataDir,
    hmacSecret: "test-secret",
    now: () => new Date(Date.UTC(2026, 6, 12, 0, 0, tick++)),
  });
  storage.createLoopSnapshot(snapshot());
  return { storage };
}

function snapshot(): LoopSnapshot {
  return {
    id: "loop_selected",
    created_at: "2026-07-12T00:00:00.000Z",
    tool: "codex",
    source: "cli",
    cwd_label: "selected-project",
    project_id: "proj_selected",
    prompt_ids: [],
    event_counts: { prompts: 0 },
    quality: { top_gaps: [], unresolved_questions: [] },
    outcome: {
      status: "in_progress",
      summary: "Continue the selected recovery contract.",
      evidence_refs: ["commit:abc123"],
    },
    next_brief: { generated: false, summary: "Prepare the next brief." },
    privacy: {
      local_only: true,
      stores_prompt_bodies: false,
      stores_raw_paths: false,
    },
  };
}
