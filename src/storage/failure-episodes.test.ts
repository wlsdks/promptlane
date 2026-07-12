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

describe("failure episode storage", () => {
  it("records and resolves one operator-confirmed episode per failed snapshot", () => {
    const storage = fixture();
    const opened = storage.recordFailureEpisode({
      snapshot_id: "loop_failed",
      category: "validation",
      status: "open",
      intervention: "Run the focused contract before the production build.",
      confirmed_by: "user",
    });
    const resolved = storage.recordFailureEpisode({
      snapshot_id: "loop_failed",
      category: "validation",
      status: "resolved",
      intervention: "Run the focused contract before the production build.",
      resolution: "The focused contract and production build passed.",
      confirmed_by: "user",
    });

    expect(resolved).toMatchObject({
      id: opened.id,
      snapshot_id: "loop_failed",
      project_id: "proj_failure",
      status: "resolved",
      resolved_at: "2026-07-12T12:00:01.000Z",
      privacy: {
        local_only: true,
        stores_prompt_bodies: false,
        stores_raw_paths: false,
        stores_transcripts: false,
        inferred: false,
      },
    });
    expect(storage.listFailureEpisodes()).toEqual([resolved]);
    expect(storage.getAppliedMigrations()).toContainEqual({
      version: 22,
      name: "022_failure_episodes",
    });
    storage.close();
  });

  it("rejects episodes for non-failure snapshots and private metadata", () => {
    const storage = fixture();
    storage.createLoopSnapshot(
      snapshot({
        id: "loop_passed",
        outcome: {
          status: "passed",
          summary: "Focused checks passed.",
          evidence_refs: ["test:focused"],
        },
      }),
    );
    expect(() =>
      storage.recordFailureEpisode({
        snapshot_id: "loop_passed",
        category: "validation",
        status: "open",
        intervention: "Run focused checks.",
        confirmed_by: "user",
      }),
    ).toThrow("failed or blocked");
    expect(() =>
      storage.recordFailureEpisode({
        snapshot_id: "loop_failed",
        category: "validation",
        status: "open",
        intervention: "Read /Users/example/private.log.",
        confirmed_by: "user",
      }),
    ).toThrow("must not include secrets or raw local paths");
    storage.close();
  });
});

function fixture() {
  const dataDir = join(tmpdir(), `looprelay-failure-${randomUUID()}`);
  dirs.push(dataDir);
  let tick = 0;
  const storage = createSqlitePromptStorage({
    dataDir,
    hmacSecret: "test-secret",
    now: () => new Date(Date.UTC(2026, 6, 12, 12, 0, tick++)),
  });
  storage.createLoopSnapshot(snapshot());
  return storage;
}

function snapshot(patch: Partial<LoopSnapshot> = {}): LoopSnapshot {
  return {
    id: "loop_failed",
    created_at: "2026-07-12T11:00:00.000Z",
    tool: "codex",
    source: "cli",
    cwd_label: "failure-project",
    project_id: "proj_failure",
    worktree_label: "primary",
    prompt_ids: [],
    event_counts: { prompts: 0 },
    quality: { top_gaps: [], unresolved_questions: [] },
    outcome: {
      status: "failed",
      summary: "Focused validation failed.",
      evidence_refs: ["test:focused"],
    },
    next_brief: { generated: false, summary: "Confirm failure." },
    privacy: {
      local_only: true,
      stores_prompt_bodies: false,
      stores_raw_paths: false,
    },
    ...patch,
  };
}
