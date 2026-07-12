import { randomUUID } from "node:crypto";
import { rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import type { LoopSnapshot } from "../../loop/types.js";
import { createSqlitePromptStorage } from "../../storage/sqlite.js";
import { createServer } from "../create-server.js";

const dirs: string[] = [];
afterEach(() =>
  dirs
    .splice(0)
    .forEach((dir) => rmSync(dir, { recursive: true, force: true })),
);

describe("action routes", () => {
  it("serves local actions and CSRF-protected failure confirmation", async () => {
    const { server, storage } = fixture();
    const session = await server.inject({
      method: "GET",
      url: "/api/v1/session",
      headers: { host: "127.0.0.1:17373" },
    });
    const cookie = String(session.headers["set-cookie"]);
    const csrf = session.json<{ data: { csrf_token: string } }>().data
      .csrf_token;

    const before = await server.inject({
      method: "GET",
      url: "/api/v1/actions",
      headers: { host: "127.0.0.1:17373", cookie },
    });
    expect(before.statusCode).toBe(200);
    expect(before.json()).toMatchObject({
      data: {
        summary: { failure_review: 1 },
        privacy: { causal_claim: false },
      },
    });

    const noCsrf = await server.inject({
      method: "POST",
      url: "/api/v1/failure-episodes",
      headers: { host: "127.0.0.1:17373", cookie },
      payload: episodePayload(),
    });
    expect(noCsrf.statusCode).toBe(403);

    const recorded = await server.inject({
      method: "POST",
      url: "/api/v1/failure-episodes",
      headers: {
        host: "127.0.0.1:17373",
        cookie,
        "x-csrf-token": csrf,
      },
      payload: episodePayload(),
    });
    expect(recorded.statusCode).toBe(200);
    expect(recorded.json()).toMatchObject({
      data: {
        recorded: true,
        episode: {
          snapshot_id: "loop_action_failure",
          category: "validation",
          privacy: { inferred: false },
        },
      },
    });

    const after = await server.inject({
      method: "GET",
      url: "/api/v1/actions",
      headers: { host: "127.0.0.1:17373", cookie },
    });
    expect(after.json()).toMatchObject({
      data: {
        summary: { failure_review: 1 },
        items: expect.arrayContaining([
          expect.objectContaining({ kind: "resolve_failure" }),
        ]),
      },
    });
    const resolved = await server.inject({
      method: "POST",
      url: "/api/v1/failure-episodes",
      headers: {
        host: "127.0.0.1:17373",
        cookie,
        "x-csrf-token": csrf,
      },
      payload: {
        ...episodePayload(),
        status: "resolved",
        resolution: "Focused validation passed.",
      },
    });
    expect(resolved.statusCode).toBe(200);
    const complete = await server.inject({
      method: "GET",
      url: "/api/v1/actions",
      headers: { host: "127.0.0.1:17373", cookie },
    });
    expect(complete.json()).toMatchObject({
      data: { summary: { failure_review: 0 } },
    });
    expect(after.body).not.toContain("/Users/");
    await server.close();
    storage.close();
  });
});

function fixture() {
  const dataDir = join(tmpdir(), `looprelay-actions-route-${randomUUID()}`);
  dirs.push(dataDir);
  const storage = createSqlitePromptStorage({
    dataDir,
    hmacSecret: "web-session-secret",
  });
  storage.createLoopSnapshot(snapshot());
  const server = createServer({
    dataDir,
    auth: {
      appToken: "app-token",
      ingestToken: "ingest-token",
      webSessionSecret: "web-session-secret",
    },
    storage,
    redactionMode: "mask",
  });
  return { server, storage };
}

function episodePayload() {
  return {
    snapshot_id: "loop_action_failure",
    category: "validation",
    status: "open",
    intervention: "Run the focused contract before the build.",
    confirmed_by: "web",
  };
}

function snapshot(): LoopSnapshot {
  return {
    id: "loop_action_failure",
    created_at: "2026-07-12T12:00:00.000Z",
    tool: "codex",
    source: "cli",
    cwd_label: "action-project",
    project_id: "proj_action_failure",
    worktree_label: "primary",
    prompt_ids: [],
    event_counts: { prompts: 0 },
    quality: { top_gaps: [], unresolved_questions: [] },
    outcome: {
      status: "failed",
      summary: "Focused contract failed.",
      evidence_refs: ["test:focused"],
    },
    next_brief: { generated: false, summary: "Confirm the failure." },
    privacy: {
      local_only: true,
      stores_prompt_bodies: false,
      stores_raw_paths: false,
    },
  };
}
