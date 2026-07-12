import { randomUUID } from "node:crypto";
import { rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import { initializeLoopRelay } from "../config/config.js";
import type { LoopSnapshot } from "../loop/types.js";
import { createSqlitePromptStorage } from "../storage/sqlite.js";
import { getLoopRelayActionInboxTool } from "./get-action-inbox-tool.js";
import { recordFailureEpisodeTool } from "./record-failure-episode-tool.js";

const dirs: string[] = [];
afterEach(() =>
  dirs
    .splice(0)
    .forEach((dir) => rmSync(dir, { recursive: true, force: true })),
);

describe("action inbox MCP tools", () => {
  it("returns raw-free local actions and records an explicit failure episode", () => {
    const dataDir = fixture();
    const inbox = getLoopRelayActionInboxTool({}, { dataDir });
    expect(inbox).toMatchObject({
      summary: { failure_review: 1 },
      failure_patterns: [],
      items: expect.arrayContaining([
        expect.objectContaining({
          kind: "confirm_failure",
          snapshot_id: "loop_mcp_failure",
        }),
      ]),
      privacy: { causal_claim: false },
    });

    const recorded = recordFailureEpisodeTool(
      {
        snapshot_id: "loop_mcp_failure",
        category: "tooling",
        status: "open",
        intervention: "Retry the focused tool call with explicit permission.",
        confirmed_by: "user",
      },
      { dataDir },
    );
    expect(recorded).toMatchObject({
      recorded: true,
      episode: {
        category: "tooling",
        status: "open",
        privacy: { inferred: false },
      },
    });
    expect(getLoopRelayActionInboxTool({}, { dataDir })).toMatchObject({
      summary: { failure_review: 1 },
      failure_patterns: [
        expect.objectContaining({
          category: "tooling",
          total: 1,
          recurring: false,
        }),
      ],
      items: expect.arrayContaining([
        expect.objectContaining({ kind: "resolve_failure" }),
      ]),
    });
    expect(JSON.stringify(recorded)).not.toContain("/Users/");
  });

  it("rejects private episode metadata before storage", () => {
    const dataDir = fixture();
    expect(
      recordFailureEpisodeTool(
        {
          snapshot_id: "loop_mcp_failure",
          category: "validation",
          status: "open",
          intervention: "Read /Users/example/private.log.",
          confirmed_by: "user",
        },
        { dataDir },
      ),
    ).toMatchObject({ is_error: true, error_code: "invalid_input" });
  });
});

function fixture(): string {
  const dataDir = join(tmpdir(), `looprelay-action-mcp-${randomUUID()}`);
  dirs.push(dataDir);
  const init = initializeLoopRelay({ dataDir });
  const storage = createSqlitePromptStorage({
    dataDir,
    hmacSecret: init.hookAuth.web_session_secret,
  });
  storage.createLoopSnapshot(snapshot());
  storage.close();
  return dataDir;
}

function snapshot(): LoopSnapshot {
  return {
    id: "loop_mcp_failure",
    created_at: "2026-07-12T12:00:00.000Z",
    tool: "codex",
    source: "mcp",
    cwd_label: "mcp-project",
    project_id: "proj_mcp_failure",
    worktree_label: "primary",
    prompt_ids: [],
    event_counts: { prompts: 0 },
    quality: { top_gaps: [], unresolved_questions: [] },
    outcome: {
      status: "failed",
      summary: "Focused MCP call failed.",
      evidence_refs: ["mcp:focused"],
    },
    next_brief: { generated: false, summary: "Confirm the failure." },
    privacy: {
      local_only: true,
      stores_prompt_bodies: false,
      stores_raw_paths: false,
    },
  };
}
