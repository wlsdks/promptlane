import { mkdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it } from "vitest";

import { initializePromptLane } from "../config/config.js";
import type { LoopSnapshot } from "../loop/types.js";
import { createServer } from "./create-server.js";
import type { CompactBoundary } from "../storage/compact-boundaries.js";
import type { LoopMergeDecision } from "../storage/loop-decisions.js";
import type { LoopMemory } from "../storage/loop-memories.js";
import type {
  ExportJob,
  ProjectInstructionReview,
  PromptDetail,
  PromptStoragePort,
} from "../storage/ports.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const claudeFixture = JSON.parse(
  readFileSync(
    resolve(
      __dirname,
      "../adapters/fixtures/claude-code-user-prompt-submit.json",
    ),
    "utf8",
  ),
) as Record<string, unknown>;
const codexFixture = JSON.parse(
  readFileSync(
    resolve(__dirname, "../adapters/fixtures/codex-user-prompt-submit.json"),
    "utf8",
  ),
) as Record<string, unknown>;

const persistedDataDirs: string[] = [];

afterEach(() => {
  while (persistedDataDirs.length > 0) {
    const dir = persistedDataDirs.pop();
    if (dir) {
      rmSync(dir, { recursive: true, force: true });
    }
  }
});

function createPersistedTestDataDir(): string {
  const dataDir = join(tmpdir(), `promptlane-server-${randomUUID()}`);
  mkdirSync(dataDir, { recursive: true });
  initializePromptLane({ dataDir });
  persistedDataDirs.push(dataDir);
  return dataDir;
}

describe("createServer P2 ingest boundary", () => {
  it("returns health without auth", async () => {
    const server = createTestServer();

    const response = await server.inject({
      method: "GET",
      url: "/api/v1/health",
      headers: { host: "127.0.0.1:17373" },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      ok: true,
      version: "0.1.0-beta.0",
    });
  });

  it("does not expose the local data directory through health", async () => {
    const server = createTestServer();

    const response = await server.inject({
      method: "GET",
      url: "/api/v1/health",
      headers: { host: "127.0.0.1:17373" },
    });
    const body = response.json() as Record<string, unknown>;

    expect(body).not.toHaveProperty("data_dir");
    expect(JSON.stringify(body)).not.toContain("/Users");
    expect(JSON.stringify(body)).not.toContain("/home");
    expect(JSON.stringify(body)).not.toContain("/tmp");
  });

  it("returns an empty favicon response for browser probes", async () => {
    const server = createTestServer();

    const response = await server.inject({
      method: "GET",
      url: "/favicon.ico",
      headers: { host: "127.0.0.1:17373" },
    });

    expect(response.statusCode).toBe(204);
  });

  it("issues local web sessions and requires csrf for cookie delete", async () => {
    const storage = createMemoryStorage();
    const server = createTestServer({ storage });

    const session = await server.inject({
      method: "GET",
      url: "/api/v1/session",
      headers: { host: "127.0.0.1:17373" },
    });
    const cookie = session.headers["set-cookie"];
    const csrfToken = session.json<{ data: { csrf_token: string } }>().data
      .csrf_token;

    expect(session.statusCode).toBe(200);
    expect(cookie).toContain("promptlane_session=");
    expect(csrfToken).toBeTypeOf("string");

    const noCsrf = await server.inject({
      method: "DELETE",
      url: "/api/v1/prompts/prmt_20260501_100000_abcdefabcdef",
      headers: {
        host: "127.0.0.1:17373",
        cookie: String(cookie),
      },
    });
    expect(noCsrf.statusCode).toBe(403);

    const deleted = await server.inject({
      method: "DELETE",
      url: "/api/v1/prompts/prmt_20260501_100000_abcdefabcdef",
      headers: {
        host: "127.0.0.1:17373",
        cookie: String(cookie),
        "x-csrf-token": csrfToken,
      },
    });
    expect(deleted.statusCode).toBe(200);
  });

  it("returns browser-safe settings without exposing secrets", async () => {
    const server = createTestServer({
      excludedProjectRoots: ["/Users/example/private-project"],
    });
    const session = await server.inject({
      method: "GET",
      url: "/api/v1/session",
      headers: { host: "127.0.0.1:17373" },
    });

    const response = await server.inject({
      method: "GET",
      url: "/api/v1/settings",
      headers: {
        host: "127.0.0.1:17373",
        cookie: String(session.headers["set-cookie"]),
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      data: {
        data_dir: "/tmp/promptlane-test",
        redaction_mode: "mask",
        server: {
          host: "127.0.0.1",
          port: 17373,
        },
        excluded_project_roots: ["/Users/example/private-project"],
        auto_judge: {
          enabled: false,
          tool: "claude",
          daily_limit: 50,
          per_minute_limit: 5,
        },
      },
    });
    expect(response.body).not.toContain("app-token");
    expect(response.body).not.toContain("ingest-token");
    expect(response.body).not.toContain("web-session-secret");
  });

  it("updates auto_judge settings via PATCH and persists between GETs", async () => {
    const dataDir = createPersistedTestDataDir();
    const server = createTestServer({ dataDir });
    const session = await server.inject({
      method: "GET",
      url: "/api/v1/session",
      headers: { host: "127.0.0.1:17373" },
    });
    const cookie = String(session.headers["set-cookie"]);
    const csrfToken = String(
      (session.json() as { data: { csrf_token: string } }).data.csrf_token,
    );

    const noCsrf = await server.inject({
      method: "PATCH",
      url: "/api/v1/settings/auto-judge",
      headers: { host: "127.0.0.1:17373", cookie },
      payload: { enabled: true },
    });
    expect(noCsrf.statusCode).toBe(403);

    const patched = await server.inject({
      method: "PATCH",
      url: "/api/v1/settings/auto-judge",
      headers: {
        host: "127.0.0.1:17373",
        cookie,
        "x-csrf-token": csrfToken,
      },
      payload: { enabled: true, tool: "codex", per_minute_limit: 1 },
    });
    expect(patched.statusCode).toBe(200);
    expect(patched.json()).toEqual({
      data: {
        enabled: true,
        tool: "codex",
        daily_limit: 50,
        per_minute_limit: 1,
      },
    });

    const reload = await server.inject({
      method: "GET",
      url: "/api/v1/settings",
      headers: { host: "127.0.0.1:17373", cookie },
    });
    expect(
      (reload.json() as { data: { auto_judge: unknown } }).data.auto_judge,
    ).toEqual({
      enabled: true,
      tool: "codex",
      daily_limit: 50,
      per_minute_limit: 1,
    });
  });

  it("rejects auto_judge patches with out-of-range fields", async () => {
    const dataDir = createPersistedTestDataDir();
    const server = createTestServer({ dataDir });
    const session = await server.inject({
      method: "GET",
      url: "/api/v1/session",
      headers: { host: "127.0.0.1:17373" },
    });
    const cookie = String(session.headers["set-cookie"]);
    const csrfToken = String(
      (session.json() as { data: { csrf_token: string } }).data.csrf_token,
    );

    const tooHigh = await server.inject({
      method: "PATCH",
      url: "/api/v1/settings/auto-judge",
      headers: {
        host: "127.0.0.1:17373",
        cookie,
        "x-csrf-token": csrfToken,
      },
      payload: { daily_limit: 99_999 },
    });
    expect(tooHigh.statusCode).toBe(422);
  });

  it("returns browser-safe projects without exposing raw paths or tokens", async () => {
    const server = createTestServer();

    const response = await server.inject({
      method: "GET",
      url: "/api/v1/projects",
      headers: {
        host: "127.0.0.1:17373",
        authorization: "Bearer app-token",
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      data: {
        items: [
          {
            project_id: "proj_memory",
            label: "promptlane",
            alias: "workbench",
            path_kind: "project_root",
            prompt_count: 2,
            latest_ingest: "2026-05-02T09:00:00.000Z",
            sensitive_count: 1,
            quality_gap_rate: 0.5,
            copied_count: 1,
            bookmarked_count: 1,
            policy: {
              capture_disabled: false,
              analysis_disabled: false,
              export_disabled: false,
              external_analysis_opt_in: false,
              version: 1,
            },
          },
        ],
      },
    });
    expect(response.body).not.toContain("/Users/example/private-project");
    expect(response.body).not.toContain("app-token");
    expect(response.body).not.toContain("ingest-token");
    expect(response.body).not.toContain("web-session-secret");
  });

  it("returns loop snapshots without prompt bodies, compact summaries, or raw paths", async () => {
    const storage = createMemoryStorage();
    storage.loopSnapshots.push(
      loopSnapshot({ worktree_label: "worktree-web" }),
    );
    storage.loopSnapshots.push(
      loopSnapshot({
        id: "loop_other",
        project_id: "proj_other",
        cwd_label: "other-project",
        worktree_label: "other-worktree",
      }),
    );
    storage.loopMemories.push(loopMemory());
    storage.loopMemories.push(
      loopMemory({
        id: "mem_other",
        snapshot_id: "loop_other",
        statement: "This unrelated project memory should not appear.",
      }),
    );
    storage.loopMergeDecisions.push(
      loopMergeDecision({
        snapshot_id: "loop_web",
        project_id: "proj_web",
        worktree: "worktree-web",
        decision: "continue",
        reason: "Needs one more verification pass before merge.",
        created_at: "2026-07-04T01:30:00.000Z",
      }),
    );
    storage.loopMergeDecisions.push(
      loopMergeDecision({
        id: "mdec_other_project",
        snapshot_id: "loop_other",
        project_id: "proj_other",
        worktree: "other-worktree",
        decision: "merge",
        reason: "Other project decision should not appear.",
        created_at: "2026-07-04T01:40:00.000Z",
      }),
    );
    storage.compactBoundaries.push({
      id: "cmp_web",
      created_at: "2026-07-04T01:05:00.000Z",
      tool: "claude-code",
      event_name: "PostCompact",
      trigger: "auto",
      session_id: "session-web",
      cwd_label: "private-project",
      project_id: "proj_web",
      content_hash: "compact_abcdef1234567890",
      privacy: {
        local_only: true,
        stores_prompt_bodies: false,
        stores_raw_paths: false,
        stores_compact_content: false,
      },
    });
    const server = createTestServer({ storage });

    const response = await server.inject({
      method: "GET",
      url: "/api/v1/loops",
      headers: {
        authorization: "Bearer app-token",
        host: "127.0.0.1:17373",
      },
    });
    const serialized = JSON.stringify(response.json());

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      data: {
        status: {
          status: "ready",
          snapshot_count: 2,
          activity: {
            active_worktrees: 2,
            active_sessions: 1,
            latest_worktree: "worktree-web",
            needs_review: true,
            next_action:
              "compare loop snapshots by worktree before merging agent output",
            recent_decisions: [
              {
                snapshot_id: "loop_web",
                worktree: "worktree-web",
                decision: "continue",
                reason: "Needs one more verification pass before merge.",
                decided_by: "user",
                created_at: "2026-07-04T01:30:00.000Z",
              },
            ],
            worktrees: [
              {
                worktree: "worktree-web",
                sessions: 1,
                snapshots: 1,
                latest_snapshot_id: "loop_web",
                latest_outcome_status: "unknown",
              },
              {
                worktree: "other-worktree",
                sessions: 1,
                snapshots: 1,
                latest_snapshot_id: "loop_other",
                latest_outcome_status: "unknown",
              },
            ],
          },
          project_memory: {
            approved_count: 1,
            included_in_brief: true,
          },
          latest_snapshot: {
            id: "loop_web",
            outcome_status: "unknown",
          },
          privacy: {
            local_only: true,
            returns_prompt_bodies: false,
            returns_raw_paths: false,
            returns_compact_content: false,
          },
        },
        privacy: {
          local_only: true,
          returns_prompt_bodies: false,
          returns_raw_paths: false,
          returns_compact_content: false,
        },
      },
    });
    expect(
      response.json<{ data: { items: Array<Record<string, unknown>> } }>().data
        .items,
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "loop_web",
          project: "private-project",
          prompt_count: 2,
          compact_boundary: expect.objectContaining({
            event_name: "PostCompact",
            after_latest_snapshot: true,
          }),
        }),
      ]),
    );
    expect(serialized).not.toContain("Make this better");
    expect(serialized).not.toContain("Compact summary with sk-proj-secret");
    expect(serialized).not.toContain("/Users/example");
    expect(serialized).not.toContain(
      "Keep web, CLI, MCP, and API loop status on the shared model.",
    );
    expect(serialized).not.toContain(
      "This unrelated project memory should not appear",
    );
    expect(serialized).not.toContain("Other project decision should not appear");
  });

  it("returns the shared storage capability problem when loop read storage is unavailable", async () => {
    const storage = createMemoryStorage();
    delete (storage as Partial<typeof storage>).listLoopSnapshots;
    const server = createTestServer({ storage });

    const response = await server.inject({
      method: "GET",
      url: "/api/v1/loops",
      headers: {
        authorization: "Bearer app-token",
        host: "127.0.0.1:17373",
      },
    });

    expect(response.statusCode).toBe(500);
    expect(response.headers["content-type"]).toContain(
      "application/problem+json",
    );
    expect(response.json()).toMatchObject({
      status: 500,
      title: "Internal Server Error",
      detail: "Loop read storage is not configured.",
      instance: "/api/v1/loops",
    });
    expect(response.body).not.toContain("listLoopSnapshots");
    expect(response.body).not.toContain("/Users/");
  });

  it("returns a worktree drilldown without prompt bodies or raw paths", async () => {
    const storage = createMemoryStorage();
    storage.loopSnapshots.push(
      loopSnapshot({ worktree_label: "worktree-web" }),
    );
    storage.loopSnapshots.push(
      loopSnapshot({
        branch: "feature/branch-filter",
        id: "loop_web_second",
        created_at: "2026-07-04T01:10:00.000Z",
        session_id: "session-web-two",
        worktree_label: "worktree-web",
        outcome: {
          status: "passed",
          summary:
            "Keep web, CLI, MCP, and API loop status on the shared model.",
          evidence_refs: ["commit:web"],
        },
      }),
    );
    storage.loopSnapshots.push(
      loopSnapshot({
        id: "loop_other",
        project_id: "proj_other",
        cwd_label: "other-project",
        worktree_label: "other-worktree",
      }),
    );
    const server = createTestServer({ storage });

    const response = await server.inject({
      method: "GET",
      url: "/api/v1/loops/worktrees/worktree-web",
      headers: {
        authorization: "Bearer app-token",
        host: "127.0.0.1:17373",
      },
    });
    const body = response.json<{
      data: {
        worktree: string;
        items: Array<{ id: string; worktree?: string }>;
      };
    }>();
    const serialized = JSON.stringify(body);

    expect(response.statusCode).toBe(200);
    expect(body.data.worktree).toBe("worktree-web");
    expect(body.data.items).toEqual([
      expect.objectContaining({
        id: "loop_web",
        worktree: "worktree-web",
      }),
      expect.objectContaining({
        id: "loop_web_second",
        worktree: "worktree-web",
      }),
    ]);
    expect(serialized).not.toContain("loop_other");
    expect(serialized).not.toContain("other-project");
    expect(serialized).not.toContain("Make this better");
    expect(serialized).not.toContain(
      "Keep web, CLI, MCP, and API loop status on the shared model.",
    );
    expect(serialized).not.toContain("/Users/example");

    const sessionResponse = await server.inject({
      method: "GET",
      url: "/api/v1/loops/worktrees/worktree-web?session_id=session-web-two",
      headers: {
        authorization: "Bearer app-token",
        host: "127.0.0.1:17373",
      },
    });
    const sessionBody = sessionResponse.json<{
      data: {
        session_id?: string;
        selection_scope?: {
          label: string;
          filters: string[];
          reason: string;
          next_action: string;
        };
        items: Array<{ id: string; worktree?: string }>;
      };
    }>();

    expect(sessionResponse.statusCode).toBe(200);
    expect(sessionBody.data.session_id).toBe("session-web-two");
    expect(sessionBody.data.selection_scope).toEqual({
      label: "Selection scope",
      filters: ["worktree", "session"],
      reason: "showing snapshots filtered by selected worktree and session",
      next_action: "copy selected session brief",
    });
    expect(sessionBody.data.items).toEqual([
      expect.objectContaining({
        id: "loop_web_second",
        worktree: "worktree-web",
      }),
    ]);
    expect(JSON.stringify(sessionBody)).not.toContain('loop_web"');
    expect(JSON.stringify(sessionBody)).not.toContain("Make this better");
    expect(JSON.stringify(sessionBody)).not.toContain("/Users/example");

    const branchResponse = await server.inject({
      method: "GET",
      url: "/api/v1/loops/worktrees/worktree-web?branch=feature%2Fbranch-filter",
      headers: {
        authorization: "Bearer app-token",
        host: "127.0.0.1:17373",
      },
    });
    const branchBody = branchResponse.json<{
      data: {
        branch?: string;
        selection_scope?: {
          label: string;
          filters: string[];
          reason: string;
          next_action: string;
        };
        items: Array<{ id: string; branch?: string; worktree?: string }>;
      };
    }>();

    expect(branchResponse.statusCode).toBe(200);
    expect(branchBody.data.branch).toBe("feature/branch-filter");
    expect(branchBody.data.selection_scope).toEqual({
      label: "Selection scope",
      filters: ["worktree", "branch"],
      reason: "showing snapshots filtered by selected worktree and branch",
      next_action: "copy selected branch brief",
    });
    expect(branchBody.data.items).toEqual([
      expect.objectContaining({
        branch: "feature/branch-filter",
        id: "loop_web_second",
        worktree: "worktree-web",
      }),
    ]);
    expect(JSON.stringify(branchBody)).not.toContain('loop_web"');
    expect(JSON.stringify(branchBody)).not.toContain("Make this better");
    expect(JSON.stringify(branchBody)).not.toContain("/Users/example");
  });

  it("returns a copy-ready loop brief without prompt bodies, compact summaries, or raw paths", async () => {
    const storage = createMemoryStorage();
    storage.loopSnapshots.push(loopSnapshot());
    storage.compactBoundaries.push({
      id: "cmp_web",
      created_at: "2026-07-04T01:05:00.000Z",
      tool: "claude-code",
      event_name: "PostCompact",
      trigger: "auto",
      session_id: "session-web",
      cwd_label: "private-project",
      project_id: "proj_web",
      content_hash: "compact_abcdef1234567890",
      privacy: {
        local_only: true,
        stores_prompt_bodies: false,
        stores_raw_paths: false,
        stores_compact_content: false,
      },
    });
    const server = createTestServer({ storage });

    const response = await server.inject({
      method: "GET",
      url: "/api/v1/loops/loop_web/brief",
      headers: {
        authorization: "Bearer app-token",
        host: "127.0.0.1:17373",
      },
    });
    const serialized = JSON.stringify(response.json());

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      data: {
        title: "Continue agent loop loop_web",
        source_snapshot_id: "loop_web",
        compact_boundary: {
          event_name: "PostCompact",
          after_latest_snapshot: true,
        },
        privacy: {
          local_only: true,
          returns_prompt_bodies: false,
          returns_raw_paths: false,
        },
      },
    });
    expect(response.json<{ data: { prompt: string } }>().data.prompt).toContain(
      "promptlane loop collect again",
    );
    expect(serialized).not.toContain("Make this better");
    expect(serialized).not.toContain("Compact summary with sk-proj-secret");
    expect(serialized).not.toContain("/Users/example");
  });

  it("returns a selected worktree loop brief without falling back to global latest", async () => {
    const storage = createMemoryStorage();
    storage.loopSnapshots.push(
      loopSnapshot({
        id: "loop_selected_web",
        worktree_label: "worktree-web",
        session_id: "session-web",
        branch: "feature/branch-filter",
        outcome: {
          status: "passed",
          summary: "Selected web worktree should continue from this branch.",
          evidence_refs: ["commit:selected"],
        },
      }),
    );
    storage.loopSnapshots.push(
      loopSnapshot({
        id: "loop_newer_other_web",
        created_at: "2026-07-04T01:10:00.000Z",
        worktree_label: "other-worktree",
        session_id: "session-other",
        branch: "feature/other",
        outcome: {
          status: "passed",
          summary: "Other worktree has a newer web snapshot.",
          evidence_refs: ["commit:other"],
        },
      }),
    );
    const server = createTestServer({ storage });

    const response = await server.inject({
      method: "GET",
      url: "/api/v1/loops/brief?worktree=worktree-web&session_id=session-web&branch=feature%2Fbranch-filter",
      headers: {
        authorization: "Bearer app-token",
        host: "127.0.0.1:17373",
      },
    });
    const serialized = JSON.stringify(response.json());

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      data: {
        title: "Continue agent loop loop_selected_web",
        source_snapshot_id: "loop_selected_web",
      },
    });
    expect(serialized).toContain("Selected web worktree should continue");
    expect(serialized).not.toContain("Other worktree has a newer web snapshot");
    expect(serialized).not.toContain("Make this better");
    expect(serialized).not.toContain("/Users/example");
  });

  it("returns the selected worktree latest merge decision read-only", async () => {
    const storage = createMemoryStorage();
    storage.loopSnapshots.push(
      loopSnapshot({
        id: "loop_selected_decision",
        worktree_label: "worktree-web",
        project_id: "proj_web",
      }),
    );
    storage.loopMergeDecisions.push(
      loopMergeDecision({
        snapshot_id: "loop_selected_decision",
        project_id: "proj_web",
        worktree: "worktree-web",
        decision: "continue",
        reason: "Needs one more verification pass before merge.",
        created_at: "2026-07-04T01:30:00.000Z",
      }),
    );
    storage.loopMergeDecisions.push(
      loopMergeDecision({
        id: "mdec_other",
        snapshot_id: "loop_other",
        project_id: "proj_other",
        worktree: "other-worktree",
        decision: "merge",
        reason: "Other project decision should stay scoped out.",
        created_at: "2026-07-04T01:40:00.000Z",
      }),
    );
    const server = createTestServer({ storage });

    const response = await server.inject({
      method: "GET",
      url: "/api/v1/loops/worktrees/worktree-web",
      headers: {
        authorization: "Bearer app-token",
        host: "127.0.0.1:17373",
      },
    });
    const serialized = JSON.stringify(response.json());

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      data: {
        worktree: "worktree-web",
        latest_decision: {
          snapshot_id: "loop_selected_decision",
          worktree: "worktree-web",
          decision: "continue",
          reason: "Needs one more verification pass before merge.",
          decided_by: "user",
          created_at: "2026-07-04T01:30:00.000Z",
        },
      },
    });
    expect(serialized).not.toContain("Other project decision");
    expect(serialized).not.toContain("/Users/example");
    expect(serialized).not.toContain("sk-proj-secret");
  });

  it("returns the selected worktree review packet summary read-only", async () => {
    const storage = createMemoryStorage();
    storage.loopSnapshots.push(
      loopSnapshot({
        id: "loop_review_selected",
        worktree_label: "review-worktree",
        project_id: "proj_web",
        outcome: {
          status: "failed",
          summary:
            "Unsafe selected outcome should stay hidden /Users/example/private sk-proj-secret",
          evidence_refs: ["commit:review"],
        },
      }),
    );
    storage.loopSnapshots.push(
      loopSnapshot({
        id: "loop_ready_other",
        worktree_label: "ready-worktree",
        project_id: "proj_web",
        outcome: {
          status: "passed",
          summary: "Ready outcome should stay hidden.",
          evidence_refs: ["commit:ready"],
        },
      }),
    );
    const server = createTestServer({ storage });

    const response = await server.inject({
      method: "GET",
      url: "/api/v1/loops/worktrees/review-worktree",
      headers: {
        authorization: "Bearer app-token",
        host: "127.0.0.1:17373",
      },
    });
    const serialized = JSON.stringify(response.json());

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      data: {
        worktree: "review-worktree",
        selection_scope: {
          label: "Selection scope",
          filters: ["worktree"],
          reason: "showing latest snapshots for selected worktree",
          next_action: "copy selected worktree brief",
        },
        snapshot_age: {
          label: "Selected snapshot age",
          latest_selected_created_at: "2026-07-04T01:00:00.000Z",
          status: "latest",
          reason: "selected snapshot is the latest recorded loop snapshot",
          next_action: "copy selected worktree brief",
        },
        selected_brief_action: {
          label: "Selected brief action",
          action: "copy selected continuation brief",
          reason:
            "uses the selected worktree/session/branch filters without auto-submitting",
          command: "promptlane loop brief --worktree review-worktree",
          writes_files: false,
          external_calls: false,
        },
        command_distinction: {
          label: "Command distinction",
          selected_command_role:
            "continue the selected worktree/session/branch filters",
          review_command_role:
            "copy the review packet command-center hint for merge review",
          reason:
            "selected continuation and review packet commands can differ when session or branch filters are active",
          writes_files: false,
          external_calls: false,
        },
        command_filters: {
          label: "Command filters",
          selected_command_filters: ["worktree"],
          review_command_filters: ["worktree", "branch"],
          reason:
            "selected command reflects the current selection while review command reflects command-center review scope",
          writes_files: false,
          external_calls: false,
        },
        copy_side_effects: {
          label: "Copy side effects",
          clipboard: "copies the selected continuation brief to the local clipboard",
          ui_feedback: "temporarily marks the selected brief copy button as copied",
          does_not:
            "does not write files, execute commands, call external services, submit prompts, or change merge state",
          writes_files: false,
          external_calls: false,
        },
        continuation_safety_group: {
          label: "Continuation safety guidance",
          scope:
            "read-only handoff boundaries for Codex and Claude Code continuation",
          includes:
            "copy, paste, review, collect, privacy, and merge gating notes",
          reason:
            "keeps the selected continuation path explicit without automating agents",
          writes_files: false,
          external_calls: false,
        },
        continuation_safety_ordering_note: {
          label: "Safety guidance order",
          first:
            "review the continuation safety guidance before copying or pasting briefs",
          then:
            "follow copy, paste, review, collect, privacy, and merge gating notes in order",
          reason:
            "keeps continuation handoff reviewable before any manual agent submission",
          writes_files: false,
          external_calls: false,
        },
        continuation_safety_non_persistence_note: {
          label: "Safety review state",
          state:
            "reviewed guidance state is not stored or synchronized by PromptLane",
          reminder:
            "operator re-checks safety guidance each time before manual agent submission",
          reason:
            "keeps continuation review local to the current operator session",
          stores_state: false,
          external_calls: false,
        },
        continuation_safety_recheck_cue: {
          label: "Safety re-check cue",
          trigger: "after each selected brief copy",
          instruction:
            "re-check continuation safety guidance before pasting into Codex or Claude Code",
          reason:
            "each copied brief can represent a new handoff decision even in the same session",
          writes_files: false,
          external_calls: false,
        },
        continuation_safety_copy_feedback_reminder: {
          label: "Copy feedback reminder",
          feedback_scope:
            "copied state only confirms the brief reached the local clipboard",
          next_step:
            "return to the safety re-check cue before pasting the copied brief",
          reason:
            "copy feedback is not safety approval or agent submission",
          writes_files: false,
          external_calls: false,
        },
        continuation_safety_copy_feedback_accessibility_note: {
          label: "Copy feedback accessibility",
          visible_label: "selected brief copy button label remains stable",
          assistive_feedback:
            "copied status belongs in accessible feedback instead of replacing the visible command",
          reason:
            "keeps copy feedback clear without implying safety approval or changing layout",
          writes_files: false,
          external_calls: false,
        },
        continuation_safety_copy_feedback_timeout_note: {
          label: "Copy feedback timeout",
          timeout_scope: "copied feedback clears after a short local timeout",
          not_state:
            "timeout does not record review completion or submission state",
          reason:
            "keeps copied feedback temporary while preserving the manual safety review boundary",
          writes_files: false,
          external_calls: false,
        },
        continuation_safety_copy_feedback_failure_note: {
          label: "Copy feedback failure",
          failure_scope: "clipboard failure requires a manual retry",
          not_state:
            "failure does not submit prompts or store review state",
          reason:
            "keeps copy failure handling local to the operator without hidden recovery actions",
          writes_files: false,
          external_calls: false,
        },
        continuation_safety_copy_retry_note: {
          label: "Copy retry",
          retry_scope: "operator manually retries the selected brief copy action",
          not_automatic:
            "PromptLane does not automatically retry clipboard writes or submit prompts",
          reason:
            "keeps retry control with the operator before any Codex or Claude Code paste",
          writes_files: false,
          external_calls: false,
        },
        continuation_safety_pre_paste_confirmation_note: {
          label: "Pre-paste confirmation",
          confirmation:
            "operator confirms the copied brief and target agent request before paste",
          not_submission:
            "confirmation does not submit prompts or approve safety review",
          reason:
            "keeps the final handoff check manual before Codex or Claude Code receives the brief",
          writes_files: false,
          external_calls: false,
        },
        continuation_safety_target_agent_check_note: {
          label: "Target-agent check",
          check:
            "operator verifies the active Codex or Claude Code request box before paste",
          not_inspection:
            "PromptLane does not inspect agent UI state or target contents",
          reason:
            "keeps target selection manual before any continuation handoff",
          writes_files: false,
          external_calls: false,
        },
        continuation_safety_paste_destination_boundary_note: {
          label: "Paste destination boundary",
          boundary:
            "paste destination is a manual operator choice in Codex or Claude Code",
          not_verified:
            "PromptLane does not verify active windows, target contents, or paste success",
          reason:
            "keeps destination verification outside PromptLane automation before submission",
          writes_files: false,
          external_calls: false,
        },
        continuation_safety_manual_submission_boundary_note: {
          label: "Manual submission boundary",
          submission:
            "operator submits the pasted brief manually in Codex or Claude Code",
          not_automated:
            "PromptLane does not press enter, click submit, or record submitted state",
          reason:
            "keeps final agent execution under operator control after paste",
          writes_files: false,
          external_calls: false,
        },
        continuation_safety_submission_result_non_persistence_note: {
          label: "Submission result non-persistence",
          result_scope:
            "agent response and submission result stay outside PromptLane until the next explicit loop snapshot",
          not_stored:
            "PromptLane does not detect, store, or sync submitted state after handoff",
          reason:
            "keeps post-submission evidence tied to explicit loop collection instead of UI monitoring",
          writes_files: false,
          external_calls: false,
        },
        continuation_safety_post_submission_collection_reminder_note: {
          label: "Post-submission collection reminder",
          reminder:
            "collect the next loop snapshot explicitly after the agent response is ready",
          not_background:
            "PromptLane does not start collection from submission, transcript changes, or agent UI activity",
          reason:
            "keeps post-submission collection operator-triggered and local-first",
          writes_files: false,
          external_calls: false,
        },
        continuation_safety_collection_result_non_persistence_note: {
          label: "Collection result non-persistence",
          result_scope:
            "collection result is not persisted until the operator records the next explicit loop snapshot",
          not_stored:
            "PromptLane does not store, sync, or infer collection result state from agent UI activity",
          reason:
            "keeps collection evidence tied to explicit local snapshot recording",
          writes_files: false,
          external_calls: false,
        },
        continuation_safety_collection_retry_boundary_note: {
          label: "Collection retry boundary",
          retry: "operator reruns the explicit loop collection flow when retry is needed",
          not_automated:
            "PromptLane does not automatically retry collection commands or hidden recovery actions",
          reason:
            "keeps retry control local and operator-triggered after collection uncertainty",
          writes_files: false,
          external_calls: false,
        },
        continuation_safety_retry_outcome_non_persistence_note: {
          label: "Retry outcome non-persistence",
          outcome_scope:
            "retry attempt and outcome stay outside PromptLane until the next explicit loop snapshot",
          not_stored:
            "PromptLane does not detect, store, or sync retry success or failure state",
          reason:
            "keeps retry evidence tied to explicit local snapshot recording",
          writes_files: false,
          external_calls: false,
        },
        continuation_safety_collection_evidence_freshness_boundary_note: {
          label: "Collection evidence freshness boundary",
          freshness_check:
            "operator checks freshness against the latest explicit loop snapshot evidence",
          not_verified:
            "PromptLane does not verify freshness from git status, transcripts, or agent UI activity",
          reason:
            "keeps evidence freshness review tied to local snapshot metadata",
          writes_files: false,
          external_calls: false,
        },
        continuation_safety_freshness_result_non_persistence_note: {
          label: "Freshness result non-persistence",
          result_scope:
            "freshness result stays outside PromptLane until the next explicit loop snapshot",
          not_stored:
            "PromptLane does not detect, store, or sync freshness result state",
          reason:
            "keeps freshness evidence tied to explicit local snapshot recording",
          writes_files: false,
          external_calls: false,
        },
        continuation_safety_freshness_uncertainty_collection_reminder: {
          label: "Freshness uncertainty collection reminder",
          reminder:
            "collect a new explicit loop snapshot when evidence freshness is uncertain",
          not_automated:
            "PromptLane does not verify freshness or start collection automatically",
          reason:
            "keeps freshness uncertainty resolution operator-triggered and local-first",
          writes_files: false,
          external_calls: false,
        },
        continuation_safety_pre_merge_freshness_advisory: {
          label: "Pre-merge freshness advisory",
          advisory:
            "review freshness uncertainty before merge decisions",
          not_decision:
            "PromptLane does not approve merges or verify freshness before merge",
          reason:
            "keeps merge readiness separate from freshness uncertainty review",
          writes_files: false,
          external_calls: false,
        },
        continuation_safety_pre_memory_approval_freshness_advisory: {
          label: "Pre-memory-approval freshness advisory",
          advisory:
            "review freshness uncertainty before approving loop memory",
          not_decision:
            "PromptLane does not approve memory or verify freshness from this note",
          reason:
            "keeps memory approval separate from freshness uncertainty review",
          writes_files: false,
          external_calls: false,
        },
        continuation_safety_post_memory_approval_collection_reminder: {
          label: "Post-memory-approval collection reminder",
          reminder:
            "collect a new explicit loop snapshot after approving loop memory",
          not_automated:
            "PromptLane does not start collection from memory approval or approval state changes",
          reason:
            "keeps post-approval collection operator-triggered and local-first",
          writes_files: false,
          external_calls: false,
        },
        continuation_safety_post_memory_approval_collection_result_non_persistence_note:
          {
            label: "Post-memory-approval collection result non-persistence",
            result_scope:
              "post-approval collection result stays outside PromptLane until the next explicit loop snapshot",
            not_stored:
              "PromptLane does not detect, store, or sync post-approval collection result state",
            reason:
              "keeps post-approval collection evidence tied to explicit local snapshot recording",
            writes_files: false,
            external_calls: false,
          },
        continuation_safety_post_memory_approval_collection_retry_boundary_note:
          {
            label: "Post-memory-approval collection retry boundary",
            retry:
              "operator reruns the explicit post-approval loop collection flow when retry is needed",
            not_automated:
              "PromptLane does not automatically retry post-approval collection commands or hidden recovery actions",
            reason:
              "keeps post-approval collection retry control local and operator-triggered",
            writes_files: false,
            external_calls: false,
          },
        continuation_safety_post_memory_approval_retry_outcome_non_persistence_note:
          {
            label: "Post-memory-approval retry outcome non-persistence",
            outcome_scope:
              "post-approval retry outcome stays outside PromptLane until the next explicit loop snapshot",
            not_stored:
              "PromptLane does not detect, store, or sync post-approval retry success or failure state",
            reason:
              "keeps post-approval retry evidence tied to explicit local snapshot recording",
            writes_files: false,
            external_calls: false,
          },
        continuation_safety_post_memory_approval_retry_evidence_freshness_boundary_note:
          {
            label: "Post-memory-approval retry evidence freshness boundary",
            review:
              "operator checks retry evidence freshness against the latest explicit loop snapshot",
            not_verified:
              "PromptLane does not verify post-approval retry freshness from git status, transcripts, or agent UI activity",
            reason:
              "keeps post-approval retry freshness review tied to local snapshot metadata",
            writes_files: false,
            external_calls: false,
          },
        continuation_safety_post_memory_approval_retry_freshness_result_non_persistence_note:
          {
            label:
              "Post-memory-approval retry freshness result non-persistence",
            result_scope:
              "post-approval retry freshness result stays outside PromptLane until the next explicit loop snapshot",
            not_stored:
              "PromptLane does not detect, store, or sync post-approval retry freshness result state",
            reason:
              "keeps post-approval retry freshness evidence tied to explicit local snapshot recording",
            writes_files: false,
            external_calls: false,
          },
        continuation_safety_post_memory_approval_retry_freshness_uncertainty_collection_reminder:
          {
            label:
              "Post-memory-approval retry freshness uncertainty collection reminder",
            reminder:
              "collect a new explicit loop snapshot when post-approval retry freshness is uncertain",
            not_automated:
              "PromptLane does not verify post-approval retry freshness or start collection automatically",
            reason:
              "keeps post-approval retry freshness uncertainty resolution operator-triggered and local-first",
            writes_files: false,
            external_calls: false,
          },
        continuation_safety_post_memory_approval_retry_pre_memory_approval_freshness_advisory:
          {
            label:
              "Post-memory-approval retry pre-memory-approval freshness advisory",
            advisory:
              "review post-approval retry freshness uncertainty before approving loop memory again",
            not_decision:
              "PromptLane does not approve memory or verify post-approval retry freshness from this advisory",
            reason:
              "keeps renewed memory approval separate from retry freshness uncertainty review",
            writes_files: false,
            external_calls: false,
          },
        continuation_safety_post_memory_approval_retry_renewed_memory_approval_collection_reminder:
          {
            label:
              "Post-memory-approval retry renewed-memory-approval collection reminder",
            reminder:
              "collect a new explicit loop snapshot after approving loop memory again",
            not_automated:
              "PromptLane does not start collection from renewed memory approval or approval state changes",
            reason:
              "keeps renewed-memory-approval collection operator-triggered and local-first",
            writes_files: false,
            external_calls: false,
          },
        continuation_safety_post_memory_approval_retry_renewed_memory_approval_collection_result_non_persistence_note:
          {
            label:
              "Post-memory-approval retry renewed-memory-approval collection result non-persistence",
            result_scope:
              "renewed-memory-approval collection result stays outside PromptLane until the next explicit loop snapshot",
            not_stored:
              "PromptLane does not detect, store, or sync renewed-memory-approval collection result state",
            reason:
              "keeps renewed-memory-approval collection evidence tied to explicit local snapshot recording",
            writes_files: false,
            external_calls: false,
          },
        continuation_safety_post_memory_approval_retry_renewed_memory_approval_collection_uncertainty_reminder:
          {
            label:
              "Post-memory-approval retry renewed-memory-approval collection uncertainty reminder",
            reminder:
              "collect a new explicit loop snapshot when renewed-memory-approval collection result is uncertain",
            not_automated:
              "PromptLane does not verify renewed-memory-approval collection result or start collection automatically",
            reason:
              "keeps renewed-memory-approval collection uncertainty resolution operator-triggered and local-first",
            writes_files: false,
            external_calls: false,
          },
        continuation_safety_post_memory_approval_retry_renewed_memory_approval_pre_merge_freshness_advisory:
          {
            label:
              "Post-memory-approval retry renewed-memory-approval pre-merge freshness advisory",
            advisory:
              "review renewed-memory-approval freshness uncertainty before merge decisions",
            not_decision:
              "PromptLane does not approve merges or verify renewed-memory-approval freshness before merge",
            reason:
              "keeps merge readiness separate from renewed-memory-approval freshness uncertainty review",
            writes_files: false,
            external_calls: false,
          },
        continuation_safety_post_memory_approval_retry_renewed_memory_approval_pre_handoff_freshness_advisory:
          {
            label:
              "Post-memory-approval retry renewed-memory-approval pre-handoff freshness advisory",
            advisory:
              "review renewed-memory-approval freshness uncertainty before continuation handoff",
            not_decision:
              "PromptLane does not approve handoffs or verify renewed-memory-approval freshness before handoff",
            reason:
              "keeps continuation handoff separate from renewed-memory-approval freshness uncertainty review",
            writes_files: false,
            external_calls: false,
          },
        continuation_safety_post_memory_approval_retry_renewed_memory_approval_pre_paste_freshness_advisory:
          {
            label:
              "Post-memory-approval retry renewed-memory-approval pre-paste freshness advisory",
            advisory:
              "review renewed-memory-approval freshness uncertainty before pasting into Codex or Claude Code",
            not_decision:
              "PromptLane does not approve paste targets or verify renewed-memory-approval freshness before paste",
            reason:
              "keeps paste readiness separate from renewed-memory-approval freshness uncertainty review",
            writes_files: false,
            external_calls: false,
          },
        continuation_safety_post_memory_approval_retry_renewed_memory_approval_pre_submit_freshness_advisory:
          {
            label:
              "Post-memory-approval retry renewed-memory-approval pre-submit freshness advisory",
            advisory:
              "review renewed-memory-approval freshness uncertainty before submitting in Codex or Claude Code",
            not_decision:
              "PromptLane does not approve submissions or verify renewed-memory-approval freshness before submit",
            reason:
              "keeps submission readiness separate from renewed-memory-approval freshness uncertainty review",
            writes_files: false,
            external_calls: false,
          },
        continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_freshness_advisory:
          {
            label:
              "Post-memory-approval retry renewed-memory-approval post-submit freshness advisory",
            advisory:
              "collect a new explicit loop snapshot after submission when renewed-memory-approval freshness is uncertain",
            not_automated:
              "PromptLane does not monitor submitted state, agent responses, or renewed-memory-approval freshness after submit",
            reason:
              "keeps post-submit freshness review tied to explicit local snapshot collection",
            writes_files: false,
            external_calls: false,
          },
        continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_collection_result_non_persistence_note:
          {
            label:
              "Post-memory-approval retry renewed-memory-approval post-submit collection result non-persistence",
            result_scope:
              "post-submit collection result stays outside PromptLane until the next explicit loop snapshot",
            not_stored:
              "PromptLane does not detect, store, or sync post-submit collection result state",
            reason:
              "keeps post-submit collection evidence tied to explicit local snapshot recording",
            writes_files: false,
            external_calls: false,
          },
        continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_collection_retry_boundary_note:
          {
            label:
              "Post-memory-approval retry renewed-memory-approval post-submit collection retry boundary",
            retry:
              "operator reruns the explicit post-submit loop collection flow when retry is needed",
            not_automated:
              "PromptLane does not automatically retry post-submit collection commands or hidden recovery actions",
            reason:
              "keeps post-submit collection retry control local and operator-triggered",
            writes_files: false,
            external_calls: false,
          },
        continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_outcome_non_persistence_note:
          {
            label:
              "Post-memory-approval retry renewed-memory-approval post-submit retry outcome non-persistence",
            outcome_scope:
              "post-submit retry attempt and outcome stay outside PromptLane until the next explicit loop snapshot",
            not_stored:
              "PromptLane does not detect, store, or sync post-submit retry success or failure state",
            reason:
              "keeps post-submit retry evidence tied to explicit local snapshot recording",
            writes_files: false,
            external_calls: false,
          },
        continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_evidence_freshness_boundary_note:
          {
            label:
              "Post-memory-approval retry renewed-memory-approval post-submit retry evidence freshness boundary",
            freshness_scope:
              "operator checks post-submit retry evidence freshness against the latest explicit loop snapshot",
            not_verified:
              "PromptLane does not verify post-submit retry evidence freshness from git status, transcripts, or agent UI activity",
            reason:
              "keeps post-submit retry evidence freshness review tied to local snapshot metadata",
            writes_files: false,
            external_calls: false,
          },
        continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_freshness_result_non_persistence_note:
          {
            label:
              "Post-memory-approval retry renewed-memory-approval post-submit retry freshness result non-persistence",
            result_scope:
              "post-submit retry freshness result stays outside PromptLane until the next explicit loop snapshot",
            not_stored:
              "PromptLane does not detect, store, or sync post-submit retry freshness result state",
            reason:
              "keeps post-submit retry freshness evidence tied to explicit local snapshot recording",
            writes_files: false,
            external_calls: false,
          },
        continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_freshness_uncertainty_collection_reminder:
          {
            label:
              "Post-memory-approval retry renewed-memory-approval post-submit retry freshness uncertainty collection reminder",
            collection_trigger:
              "collect a new explicit loop snapshot when post-submit retry freshness is uncertain",
            not_automated:
              "PromptLane does not verify post-submit retry freshness or start collection automatically",
            reason:
              "keeps post-submit retry freshness uncertainty resolution operator-triggered and local-first",
            writes_files: false,
            external_calls: false,
          },
        continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_pre_memory_approval_freshness_advisory:
          {
            label:
              "Post-memory-approval retry renewed-memory-approval post-submit retry pre-memory-approval freshness advisory",
            advisory:
              "review post-submit retry freshness uncertainty before approving loop memory again",
            not_decision:
              "PromptLane does not approve memory or verify post-submit retry freshness from this advisory",
            reason:
              "keeps renewed memory approval separate from post-submit retry freshness uncertainty review",
            writes_files: false,
            external_calls: false,
          },
        continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_collection_reminder:
          {
            label:
              "Post-memory-approval retry renewed-memory-approval post-submit retry renewed-memory-approval collection reminder",
            reminder:
              "collect a new explicit loop snapshot after approving loop memory again after post-submit retry",
            not_automated:
              "PromptLane does not start collection from post-submit retry renewed memory approval or hidden approval signals",
            reason:
              "keeps post-submit retry renewed-memory-approval collection operator-triggered and local-first",
            writes_files: false,
            external_calls: false,
          },
        continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_collection_result_non_persistence_note:
          {
            label:
              "Post-memory-approval retry renewed-memory-approval post-submit retry renewed-memory-approval collection result non-persistence",
            result_scope:
              "post-submit retry renewed-memory-approval collection result stays outside PromptLane until the next explicit loop snapshot",
            not_stored:
              "PromptLane does not detect, store, or sync post-submit retry renewed-memory-approval collection result state",
            reason:
              "keeps post-submit retry renewed-memory-approval collection evidence tied to explicit local snapshot recording",
            writes_files: false,
            external_calls: false,
          },
        continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_collection_uncertainty_reminder:
          {
            label:
              "Post-memory-approval retry renewed-memory-approval post-submit retry renewed-memory-approval collection uncertainty reminder",
            reminder:
              "collect a new explicit loop snapshot when post-submit retry renewed-memory-approval collection result is uncertain",
            not_automated:
              "PromptLane does not verify post-submit retry renewed-memory-approval collection result or start collection automatically",
            reason:
              "keeps post-submit retry renewed-memory-approval collection uncertainty resolution operator-triggered and local-first",
            writes_files: false,
            external_calls: false,
          },
        continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_pre_merge_freshness_advisory:
          {
            label:
              "Post-memory-approval retry renewed-memory-approval post-submit retry renewed-memory-approval pre-merge freshness advisory",
            advisory:
              "review post-submit retry renewed-memory-approval freshness uncertainty before merge decisions",
            not_decision:
              "PromptLane does not approve merges or verify post-submit retry renewed-memory-approval freshness before merge",
            reason:
              "keeps merge readiness separate from post-submit retry renewed-memory-approval freshness uncertainty review",
            writes_files: false,
            external_calls: false,
          },
        continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_pre_handoff_freshness_advisory:
          {
            label:
              "Post-memory-approval retry renewed-memory-approval post-submit retry renewed-memory-approval pre-handoff freshness advisory",
            advisory:
              "review post-submit retry renewed-memory-approval freshness uncertainty before continuation handoff",
            not_decision:
              "PromptLane does not approve handoffs or verify post-submit retry renewed-memory-approval freshness before handoff",
            reason:
              "keeps continuation handoff separate from post-submit retry renewed-memory-approval freshness uncertainty review",
            writes_files: false,
            external_calls: false,
          },
        continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_pre_paste_freshness_advisory:
          {
            label:
              "Post-memory-approval retry renewed-memory-approval post-submit retry renewed-memory-approval pre-paste freshness advisory",
            advisory:
              "review post-submit retry renewed-memory-approval freshness uncertainty before pasting into Codex or Claude Code",
            not_decision:
              "PromptLane does not approve paste targets or verify post-submit retry renewed-memory-approval freshness before paste",
            reason:
              "keeps paste readiness separate from post-submit retry renewed-memory-approval freshness uncertainty review",
            writes_files: false,
            external_calls: false,
          },
        continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_pre_submit_freshness_advisory:
          {
            label:
              "Post-memory-approval retry renewed-memory-approval post-submit retry renewed-memory-approval pre-submit freshness advisory",
            advisory:
              "review post-submit retry renewed-memory-approval freshness uncertainty before submitting in Codex or Claude Code",
            not_decision:
              "PromptLane does not approve submissions or verify post-submit retry renewed-memory-approval freshness before submit",
            reason:
              "keeps submission readiness separate from post-submit retry renewed-memory-approval freshness uncertainty review",
            writes_files: false,
            external_calls: false,
          },
        continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_freshness_advisory:
          {
            label:
              "Post-memory-approval retry renewed-memory-approval post-submit retry renewed-memory-approval post-submit freshness advisory",
            advisory:
              "collect a new explicit loop snapshot after submission when post-submit retry renewed-memory-approval freshness is uncertain",
            not_automated:
              "PromptLane does not monitor submitted state, agent responses, or post-submit retry renewed-memory-approval freshness after submit",
            reason:
              "keeps post-submit retry renewed-memory-approval freshness review tied to explicit local snapshot collection",
            writes_files: false,
            external_calls: false,
          },
        paste_destination: {
          label: "Paste destination",
          targets: ["Codex active request", "Claude Code active request"],
          instruction:
            "paste the copied continuation brief into the active agent request box",
          reason:
            "keeps PromptLane as the local handoff source while the user controls submission",
          auto_submit: false,
          writes_files: false,
          external_calls: false,
        },
        handoff_checklist: {
          label: "Continuation handoff checklist",
          steps: [
            "copy selected continuation brief",
            "paste into Codex or Claude Code active request",
            "submit manually after review",
            "collect the next loop snapshot after the agent turn",
          ],
          reason:
            "keeps continuation handoff explicit without automating agent UI or reading transcripts",
          writes_files: false,
          external_calls: false,
        },
        post_handoff_reminder: {
          label: "Post-handoff reminder",
          collect_next: "collect a new loop snapshot after the next agent turn",
          not_memory_approval: "memory approval remains a separate explicit review",
          not_merge: "merge remains a separate review-before-merge decision",
          reason:
            "continuation handoff records the next loop before any memory approval or merge decision",
          writes_files: false,
          external_calls: false,
        },
        continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_result_non_persistence_note:
          {
            label:
              "Post-memory-approval retry renewed-memory-approval post-submit retry renewed-memory-approval post-submit collection result non-persistence",
            result_scope:
              "post-submit retry renewed-memory-approval post-submit collection result stays outside PromptLane until the next explicit loop snapshot",
            not_stored:
              "PromptLane does not detect, store, or sync post-submit retry renewed-memory-approval post-submit collection result state",
            reason:
              "keeps post-submit retry renewed-memory-approval post-submit collection evidence tied to explicit local snapshot recording",
            writes_files: false,
            external_calls: false,
          },
        continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_uncertainty_reminder:
          {
            label:
              "Post-memory-approval retry renewed-memory-approval post-submit retry renewed-memory-approval post-submit collection uncertainty reminder",
            reminder:
              "collect a new explicit loop snapshot when post-submit retry renewed-memory-approval post-submit collection result is uncertain",
            not_automated:
              "PromptLane does not verify post-submit retry renewed-memory-approval post-submit collection result or start collection automatically",
            reason:
              "keeps post-submit retry renewed-memory-approval post-submit collection uncertainty resolution operator-triggered and local-first",
            writes_files: false,
            external_calls: false,
          },
        continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_pre_merge_freshness_advisory:
          {
            label:
              "Post-memory-approval retry renewed-memory-approval post-submit retry renewed-memory-approval post-submit collection pre-merge freshness advisory",
            advisory:
              "review post-submit retry renewed-memory-approval post-submit collection freshness uncertainty before merge decisions",
            not_decision:
              "PromptLane does not approve merges or verify post-submit retry renewed-memory-approval post-submit collection freshness before merge",
            reason:
              "keeps merge readiness separate from post-submit retry renewed-memory-approval post-submit collection freshness uncertainty review",
            writes_files: false,
            external_calls: false,
          },
        continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_pre_handoff_freshness_advisory:
          {
            label:
              "Post-memory-approval retry renewed-memory-approval post-submit retry renewed-memory-approval post-submit collection pre-handoff freshness advisory",
            advisory:
              "review post-submit retry renewed-memory-approval post-submit collection freshness uncertainty before continuation handoff",
            not_decision:
              "PromptLane does not approve handoffs or verify post-submit retry renewed-memory-approval post-submit collection freshness before handoff",
            reason:
              "keeps continuation handoff separate from post-submit retry renewed-memory-approval post-submit collection freshness uncertainty review",
            writes_files: false,
            external_calls: false,
          },
        continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_pre_paste_freshness_advisory:
          {
            label:
              "Post-memory-approval retry renewed-memory-approval post-submit retry renewed-memory-approval post-submit collection pre-paste freshness advisory",
            advisory:
              "review post-submit retry renewed-memory-approval post-submit collection freshness uncertainty before pasting into Codex or Claude Code",
            not_decision:
              "PromptLane does not approve paste targets or verify post-submit retry renewed-memory-approval post-submit collection freshness before paste",
            reason:
              "keeps paste readiness separate from post-submit retry renewed-memory-approval post-submit collection freshness uncertainty review",
            writes_files: false,
            external_calls: false,
          },
        continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_pre_submit_freshness_advisory:
          {
            label:
              "Post-memory-approval retry renewed-memory-approval post-submit retry renewed-memory-approval post-submit collection pre-submit freshness advisory",
            advisory:
              "review post-submit retry renewed-memory-approval post-submit collection freshness uncertainty before submitting in Codex or Claude Code",
            not_decision:
              "PromptLane does not approve submissions or verify post-submit retry renewed-memory-approval post-submit collection freshness before submit",
            reason:
              "keeps submission readiness separate from post-submit retry renewed-memory-approval post-submit collection freshness uncertainty review",
            writes_files: false,
            external_calls: false,
          },
        continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_post_submit_freshness_advisory:
          {
            label:
              "Post-memory-approval retry renewed-memory-approval post-submit retry renewed-memory-approval post-submit collection post-submit freshness advisory",
            advisory:
              "collect a new explicit loop snapshot after submission when post-submit retry renewed-memory-approval post-submit collection freshness is uncertain",
            not_monitored:
              "PromptLane does not monitor submitted state, agent responses, or post-submit retry renewed-memory-approval post-submit collection freshness after submit",
            reason:
              "keeps post-submit retry renewed-memory-approval post-submit collection freshness review tied to explicit local snapshot collection",
            writes_files: false,
            external_calls: false,
          },
        continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_freshness_result_non_persistence_note:
          {
            label:
              "Post-memory-approval retry renewed-memory-approval post-submit retry renewed-memory-approval post-submit collection freshness result non-persistence",
            not_stored:
              "post-submit retry renewed-memory-approval post-submit collection freshness result stays outside PromptLane until the next explicit loop snapshot",
            not_detected:
              "PromptLane does not detect, store, or sync post-submit retry renewed-memory-approval post-submit collection freshness result state",
            reason:
              "keeps post-submit retry renewed-memory-approval post-submit collection freshness evidence tied to explicit local snapshot recording",
            writes_files: false,
            external_calls: false,
          },
        continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_freshness_uncertainty_collection_reminder:
          {
            label:
              "Post-memory-approval retry renewed-memory-approval post-submit retry renewed-memory-approval post-submit collection freshness uncertainty collection reminder",
            reminder:
              "collect a new explicit loop snapshot when post-submit retry renewed-memory-approval post-submit collection freshness is uncertain",
            not_automated:
              "PromptLane does not verify post-submit retry renewed-memory-approval post-submit collection freshness or start collection automatically",
            reason:
              "keeps post-submit retry renewed-memory-approval post-submit collection freshness uncertainty resolution operator-triggered and local-first",
            writes_files: false,
            external_calls: false,
          },
        source_of_truth_note: {
          label: "Source-of-truth note",
          local_memory_input:
            "next loop snapshot is the source of truth for local loop memory",
          not_transcript_import:
            "transcript import is not used as the source of truth",
          reason:
            "PromptLane records explicit loop snapshots instead of importing agent transcripts",
          stores_transcripts: false,
          writes_files: false,
          external_calls: false,
        },
        privacy_boundary_note: {
          label: "Privacy boundary",
          storage_scope:
            "stores loop metadata in the local database and Markdown archive only",
          does_not_store:
            "does not store prompt bodies, transcripts, raw paths, or provider credentials",
          reason:
            "keeps source-of-truth loop memory local-first and reviewable",
          local_only: true,
          writes_files: false,
          external_calls: false,
        },
        operator_review_gate: {
          label: "Operator review gate",
          review_step:
            "operator reviews the copied continuation brief before submitting",
          manual_submit: "submission remains manual in Codex or Claude Code",
          does_not:
            "does not auto-submit prompts, execute commands, write files, or change merge state",
          auto_submit: false,
          writes_files: false,
          external_calls: false,
        },
        collection_responsibility_note: {
          label: "Collection responsibility",
          responsible_party:
            "operator collects the next loop snapshot after the agent turn",
          trigger:
            "collection starts only when the operator runs the loop collection flow",
          does_not:
            "does not watch transcripts, scrape agent UI, or collect in the background",
          automatic_collection: false,
          writes_files: false,
          external_calls: false,
        },
        pre_merge_advisory: {
          label: "Pre-merge advisory",
          hold_merge:
            "hold merge decisions until the next loop snapshot is collected and reviewed",
          reason:
            "continuation handoff can change readiness after the next agent turn",
          not_memory_approval:
            "memory approval remains separate from merge readiness",
          writes_merge_decision: false,
          writes_files: false,
          external_calls: false,
        },
        post_collection_review_note: {
          label: "Post-collection review",
          review_step:
            "review the collected loop snapshot quality and evidence before approval",
          before_memory_approval:
            "approve memory only after the collected snapshot is reviewed",
          before_merge:
            "merge readiness can be reconsidered after post-collection review",
          writes_memory: false,
          writes_merge_decision: false,
          external_calls: false,
        },
        review_packet_summary: {
          title: "Review-before-merge packet",
          status: "needs_review",
          summary: "1 ready, 1 needs review, 0 missing evidence",
          next_action: "review non-passing worktrees before merge",
          worktree: "review-worktree",
          merge_readiness: "needs_review",
          worktree_action: "review outcome before merge",
          readiness_summary: {
            label: "Readiness summary",
            status: "needs_review",
            reason: "latest selected worktree outcome is not passing",
            next_action: "review outcome before merge",
          },
          brief_rationale: {
            label: "Brief rationale",
            merge_readiness: "needs_review",
            reason:
              "selected brief continues review work without marking it merge-ready",
            next_action: "copy selected continuation brief",
            merge_gate: "review outcome before merge",
          },
          evidence_count_explanation: {
            label: "Evidence count",
            count: 1,
            reason: "selected worktree has evidence refs recorded",
            next_action: "compare evidence before merge",
          },
          reviewer_checklist_preview: [
            {
              label: "Review non-passing worktrees before merge",
              status: "required",
              action: "review outcome before merge",
            },
          ],
          command_hint: {
            label: "Copy review brief command",
            command:
              "promptlane loop brief --worktree review-worktree --branch codex/agent-loop-memory-design",
            provenance: {
              label: "Command provenance",
              source: "existing command-center continuation command",
              reason:
                "reuses safe selected worktree metadata without reading git or executing commands",
              writes_files: false,
              external_calls: false,
            },
          },
        },
      },
    });
    expect(serialized).not.toContain("Unsafe selected outcome");
    expect(serialized).not.toContain("Ready outcome should stay hidden");
    expect(serialized).not.toContain("commit:review");
    expect(serialized).not.toContain("commit:ready");
    expect(serialized).not.toContain("/Users/example");
    expect(serialized).not.toContain("sk-proj-secret");
  });

  it("explains when the selected worktree snapshot is older than the latest recorded loop", async () => {
    const storage = createMemoryStorage();
    storage.loopSnapshots.push(
      loopSnapshot({
        id: "loop_global_newer",
        created_at: "2026-07-04T01:15:00.000Z",
        worktree_label: "newer-worktree",
        project_id: "proj_web",
        outcome: {
          status: "passed",
          summary: "Newer unsafe summary should stay hidden.",
          evidence_refs: ["commit:newer"],
        },
      }),
    );
    storage.loopSnapshots.push(
      loopSnapshot({
        id: "loop_selected_older",
        created_at: "2026-07-04T01:00:00.000Z",
        worktree_label: "older-worktree",
        project_id: "proj_web",
        outcome: {
          status: "passed",
          summary:
            "Older selected unsafe summary should stay hidden /Users/example/private sk-proj-secret",
          evidence_refs: ["commit:older"],
        },
      }),
    );
    const server = createTestServer({ storage });

    const response = await server.inject({
      method: "GET",
      url: "/api/v1/loops/worktrees/older-worktree",
      headers: {
        authorization: "Bearer app-token",
        host: "127.0.0.1:17373",
      },
    });
    const serialized = JSON.stringify(response.json());

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      data: {
        worktree: "older-worktree",
        snapshot_age: {
          label: "Selected snapshot age",
          latest_selected_created_at: "2026-07-04T01:00:00.000Z",
          status: "older_than_latest",
          reason: "another loop snapshot was recorded after this selection",
          next_action: "refresh selected worktree before merging",
        },
      },
    });
    expect(serialized).not.toContain("Newer unsafe summary");
    expect(serialized).not.toContain("Older selected unsafe summary");
    expect(serialized).not.toContain("commit:newer");
    expect(serialized).not.toContain("commit:older");
    expect(serialized).not.toContain("/Users/example");
    expect(serialized).not.toContain("sk-proj-secret");
  });

  it("returns a raw-free missing-evidence explanation for blocked selected worktrees", async () => {
    const storage = createMemoryStorage();
    storage.loopSnapshots.push(
      loopSnapshot({
        id: "loop_missing_selected",
        worktree_label: "blocked-worktree",
        project_id: "proj_web",
        outcome: {
          status: "unknown",
          summary:
            "Unsafe missing evidence summary should stay hidden /Users/example/private sk-proj-secret",
          evidence_refs: [],
        },
      }),
    );
    storage.loopSnapshots.push(
      loopSnapshot({
        id: "loop_ready_other",
        worktree_label: "ready-worktree",
        project_id: "proj_web",
        outcome: {
          status: "passed",
          summary: "Ready outcome should stay hidden.",
          evidence_refs: ["commit:ready"],
        },
      }),
    );
    const server = createTestServer({ storage });

    const response = await server.inject({
      method: "GET",
      url: "/api/v1/loops/worktrees/blocked-worktree",
      headers: {
        authorization: "Bearer app-token",
        host: "127.0.0.1:17373",
      },
    });
    const serialized = JSON.stringify(response.json());

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      data: {
        worktree: "blocked-worktree",
        selection_scope: {
          label: "Selection scope",
          filters: ["worktree"],
          reason: "showing latest snapshots for selected worktree",
          next_action: "copy selected worktree brief",
        },
        review_packet_summary: {
          status: "blocked",
          summary: "1 ready, 0 needs review, 1 missing evidence",
          next_action: "record missing evidence before merge",
          merge_readiness: "missing_evidence",
          worktree_action: "record loop outcome evidence",
          readiness_summary: {
            label: "Readiness summary",
            status: "missing_evidence",
            reason: "latest selected worktree outcome has no evidence refs",
            next_action: "record loop outcome evidence",
          },
          evidence_count_explanation: {
            label: "Evidence count",
            count: 0,
            reason: "selected worktree has no evidence refs recorded",
            next_action: "record loop outcome evidence",
          },
          reviewer_checklist_preview: [
            {
              label: "Record missing evidence before merge",
              status: "required",
              action: "record loop outcome evidence",
            },
          ],
          missing_evidence_explanation: {
            label: "Missing evidence",
            reason: "latest selected worktree outcome has no evidence refs",
            next_action: "record loop outcome evidence",
          },
        },
      },
    });
    expect(serialized).not.toContain("Unsafe missing evidence summary");
    expect(serialized).not.toContain("Ready outcome should stay hidden");
    expect(serialized).not.toContain("commit:ready");
    expect(serialized).not.toContain("/Users/example");
    expect(serialized).not.toContain("sk-proj-secret");
  });

  it("returns a raw-free readiness summary for ready selected worktrees", async () => {
    const storage = createMemoryStorage();
    storage.loopSnapshots.push(
      loopSnapshot({
        id: "loop_ready_selected",
        worktree_label: "ready-worktree",
        project_id: "proj_web",
        outcome: {
          status: "passed",
          summary:
            "Unsafe ready summary should stay hidden /Users/example/private sk-proj-secret",
          evidence_refs: ["commit:ready"],
        },
      }),
    );
    const server = createTestServer({ storage });

    const response = await server.inject({
      method: "GET",
      url: "/api/v1/loops/worktrees/ready-worktree",
      headers: {
        authorization: "Bearer app-token",
        host: "127.0.0.1:17373",
      },
    });
    const serialized = JSON.stringify(response.json());

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      data: {
        worktree: "ready-worktree",
        review_packet_summary: {
          status: "ready",
          summary: "1 ready, 0 needs review, 0 missing evidence",
          next_action: "compare ready evidence before merge",
          merge_readiness: "ready",
          worktree_action: "compare evidence before merge",
          readiness_summary: {
            label: "Readiness summary",
            status: "ready",
            reason: "selected worktree has recorded evidence and passing outcome",
            next_action: "compare evidence before merge",
          },
          evidence_count_explanation: {
            label: "Evidence count",
            count: 1,
            reason: "selected worktree has evidence refs recorded",
            next_action: "compare evidence before merge",
          },
        },
      },
    });
    expect(serialized).not.toContain("Unsafe ready summary");
    expect(serialized).not.toContain("commit:ready");
    expect(serialized).not.toContain("/Users/example");
    expect(serialized).not.toContain("sk-proj-secret");
  });

  it("returns approved loop memory in copy-ready loop briefs", async () => {
    const storage = createMemoryStorage();
    storage.loopSnapshots.push(loopSnapshot());
    storage.loopMemories.push(loopMemory());
    storage.loopMemories.push(
      loopMemory({
        id: "mem_other",
        snapshot_id: "loop_other",
        statement: "This unrelated project memory should not appear.",
      }),
    );
    const server = createTestServer({ storage });

    const response = await server.inject({
      method: "GET",
      url: "/api/v1/loops/loop_web/brief",
      headers: {
        authorization: "Bearer app-token",
        host: "127.0.0.1:17373",
      },
    });
    const prompt = response.json<{ data: { prompt: string } }>().data.prompt;

    expect(response.statusCode).toBe(200);
    expect(prompt).toContain("## Approved Loop Memories");
    expect(prompt).toContain(
      "Keep web, CLI, MCP, and API loop status on the shared model.",
    );
    expect(prompt).not.toContain("This unrelated project memory");
    expect(prompt).not.toContain("/Users/example");
    expect(prompt).not.toContain("sk-proj-secret");
  });

  it("records latest eligible loop memory from the web behind csrf without writing instruction files", async () => {
    const storage = createMemoryStorage();
    storage.loopSnapshots.push(
      loopSnapshot({
        outcome: {
          status: "passed",
          summary:
            "Use focused tests before full verification for loop memory changes.",
          evidence_refs: ["test:web loops", "commit:abc1234"],
        },
      }),
    );
    const server = createTestServer({ storage });
    const session = await server.inject({
      method: "GET",
      url: "/api/v1/session",
      headers: { host: "127.0.0.1:17373" },
    });
    const cookie = String(session.headers["set-cookie"]);
    const csrfToken = session.json<{ data: { csrf_token: string } }>().data
      .csrf_token;

    const noCsrf = await server.inject({
      method: "POST",
      url: "/api/v1/loops/memory/approve",
      headers: {
        host: "127.0.0.1:17373",
        cookie,
      },
      payload: { approved_by: "web" },
    });
    expect(noCsrf.statusCode).toBe(403);

    const approved = await server.inject({
      method: "POST",
      url: "/api/v1/loops/memory/approve",
      headers: {
        host: "127.0.0.1:17373",
        cookie,
        "x-csrf-token": csrfToken,
      },
      payload: { approved_by: "web" },
    });
    const serialized = JSON.stringify(approved.json());

    expect(approved.statusCode).toBe(200);
    expect(approved.json()).toMatchObject({
      data: {
        recorded: true,
        memory: {
          snapshot_id: "loop_web",
          title: "Remember loop outcome for private-project",
          evidence_refs: ["test:web loops", "commit:abc1234"],
          approved_by: "web",
          privacy: {
            local_only: true,
            stores_prompt_bodies: false,
            stores_raw_paths: false,
            writes_instruction_files: false,
            external_calls: false,
          },
        },
        next_actions: [
          "promptlane loop brief",
          "promptlane loop instruction-patch --target-file AGENTS.md",
        ],
        privacy: {
          local_only: true,
          returns_prompt_bodies: false,
          returns_raw_paths: false,
          writes_instruction_files: false,
          external_calls: false,
        },
      },
    });
    expect(storage.loopMemories).toHaveLength(1);
    expect(serialized).not.toContain("Make this better");
    expect(serialized).not.toContain("/Users/example");
    expect(serialized).not.toContain("sk-proj-secret");
  });

  it("returns the shared storage capability problem when loop memory approval storage is unavailable", async () => {
    const storage = createMemoryStorage();
    delete (storage as Partial<typeof storage>).listLoopMemories;
    const server = createTestServer({ storage });
    const session = await server.inject({
      method: "GET",
      url: "/api/v1/session",
      headers: { host: "127.0.0.1:17373" },
    });
    const cookie = String(session.headers["set-cookie"]);
    const csrfToken = session.json<{ data: { csrf_token: string } }>().data
      .csrf_token;

    const response = await server.inject({
      method: "POST",
      url: "/api/v1/loops/memory/approve",
      headers: {
        host: "127.0.0.1:17373",
        cookie,
        "x-csrf-token": csrfToken,
      },
      payload: { approved_by: "web" },
    });

    expect(response.statusCode).toBe(500);
    expect(response.headers["content-type"]).toContain(
      "application/problem+json",
    );
    expect(response.json()).toMatchObject({
      status: 500,
      title: "Internal Server Error",
      detail: "Loop memory approval storage is not configured.",
      instance: "/api/v1/loops/memory/approve",
    });
    expect(response.body).not.toContain("listLoopMemories");
    expect(response.body).not.toContain("/Users/");
  });

  it("hides and rejects already approved latest web memory candidates", async () => {
    const storage = createMemoryStorage();
    storage.loopSnapshots.push(
      loopSnapshot({
        outcome: {
          status: "passed",
          summary:
            "Use focused tests before full verification for loop memory changes.",
          evidence_refs: ["test:web loops"],
        },
      }),
    );
    storage.loopMemories.push(loopMemory({ snapshot_id: "loop_web" }));
    const server = createTestServer({ storage });

    const list = await server.inject({
      method: "GET",
      url: "/api/v1/loops",
      headers: {
        authorization: "Bearer app-token",
        host: "127.0.0.1:17373",
      },
    });

    expect(list.statusCode).toBe(200);
    expect(
      list.json<{ data: { status: { memory_candidate?: unknown } } }>().data
        .status.memory_candidate,
    ).toBeUndefined();

    const duplicate = await server.inject({
      method: "POST",
      url: "/api/v1/loops/memory/approve",
      headers: {
        authorization: "Bearer app-token",
        host: "127.0.0.1:17373",
      },
      payload: { approved_by: "web" },
    });

    expect(duplicate.statusCode).toBe(409);
    expect(storage.loopMemories).toHaveLength(1);
    expect(duplicate.body).not.toContain("/Users/example");
    expect(duplicate.body).not.toContain("sk-proj-secret");
  });

  it("returns a review-only instruction patch proposal for the latest approved web memory", async () => {
    const storage = createMemoryStorage();
    storage.loopSnapshots.push(loopSnapshot());
    storage.loopMemories.push(loopMemory({ snapshot_id: "loop_web" }));
    const server = createTestServer({ storage });

    const response = await server.inject({
      method: "GET",
      url: "/api/v1/loops/instruction-patch?target_file=AGENTS.md",
      headers: {
        authorization: "Bearer app-token",
        host: "127.0.0.1:17373",
      },
    });
    const serialized = JSON.stringify(response.json());

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      data: {
        target_file: "AGENTS.md",
        patch_kind: "append_section",
        writes_files: false,
        requires_user_approval: true,
        source_memory_id: "mem_web",
        apply_gate: {
          web_apply_available: false,
          confirm_command:
            "promptlane loop instruction-apply --target-file AGENTS.md --confirm-apply",
          mcp_tool: "apply_instruction_patch",
          reason:
            "web review does not write files; apply through CLI or MCP with explicit confirmation",
        },
        privacy: {
          local_only: true,
          external_calls: false,
          returns_prompt_bodies: false,
          returns_raw_paths: false,
          writes_instruction_files: false,
        },
      },
    });
    expect(response.json<{ data: { diff: string } }>().data.diff).toContain(
      "+++ b/AGENTS.md",
    );
    expect(response.json<{ data: { diff: string } }>().data.diff).toContain(
      "source_memory: mem_web",
    );
    expect(serialized).not.toContain("Make this better");
    expect(serialized).not.toContain("/Users/example");
    expect(serialized).not.toContain("sk-proj-secret");
  });

  it("requires app access and csrf before updating project policy", async () => {
    const storage = createMemoryStorage();
    const server = createTestServer({ storage });
    const session = await server.inject({
      method: "GET",
      url: "/api/v1/session",
      headers: { host: "127.0.0.1:17373" },
    });
    const cookie = String(session.headers["set-cookie"]);
    const csrfToken = session.json<{ data: { csrf_token: string } }>().data
      .csrf_token;

    const ingestToken = await server.inject({
      method: "PATCH",
      url: "/api/v1/projects/proj_memory/policy",
      headers: {
        host: "127.0.0.1:17373",
        authorization: "Bearer ingest-token",
      },
      payload: { capture_disabled: true },
    });
    expect(ingestToken.statusCode).toBe(401);

    const noCsrf = await server.inject({
      method: "PATCH",
      url: "/api/v1/projects/proj_memory/policy",
      headers: {
        host: "127.0.0.1:17373",
        cookie,
      },
      payload: { capture_disabled: true },
    });
    expect(noCsrf.statusCode).toBe(403);

    const updated = await server.inject({
      method: "PATCH",
      url: "/api/v1/projects/proj_memory/policy",
      headers: {
        host: "127.0.0.1:17373",
        cookie,
        "x-csrf-token": csrfToken,
      },
      payload: { capture_disabled: true, alias: "local-only" },
    });

    expect(updated.statusCode).toBe(200);
    expect(updated.json()).toMatchObject({
      data: {
        project_id: "proj_memory",
        alias: "local-only",
        policy: {
          capture_disabled: true,
          version: 2,
        },
      },
    });
    expect(storage.policyUpdates).toEqual([
      {
        projectId: "proj_memory",
        patch: { capture_disabled: true, alias: "local-only" },
        actor: "web",
      },
    ]);
    expect(updated.body).not.toContain("/Users/example/private-project");
  });

  it("analyzes project instruction files behind csrf without exposing raw bodies or paths", async () => {
    const storage = createMemoryStorage();
    const server = createTestServer({ storage });
    const session = await server.inject({
      method: "GET",
      url: "/api/v1/session",
      headers: { host: "127.0.0.1:17373" },
    });
    const cookie = String(session.headers["set-cookie"]);
    const csrfToken = session.json<{ data: { csrf_token: string } }>().data
      .csrf_token;

    const noCsrf = await server.inject({
      method: "POST",
      url: "/api/v1/projects/proj_memory/instructions/analyze",
      headers: {
        host: "127.0.0.1:17373",
        cookie,
      },
    });
    expect(noCsrf.statusCode).toBe(403);

    const analyzed = await server.inject({
      method: "POST",
      url: "/api/v1/projects/proj_memory/instructions/analyze",
      headers: {
        host: "127.0.0.1:17373",
        cookie,
        "x-csrf-token": csrfToken,
      },
    });

    expect(analyzed.statusCode).toBe(200);
    expect(analyzed.json()).toMatchObject({
      data: {
        analyzer: "local-project-instructions-v1",
        files_found: 1,
        score: { value: 80, max: 100, band: "good" },
        privacy: {
          local_only: true,
          returns_file_bodies: false,
          returns_raw_paths: false,
        },
      },
    });
    expect(analyzed.body).not.toContain("/Users/example/private-project");
    expect(analyzed.body).not.toContain("Do not leak this file body");
  });

  it("requires csrf for anonymized export preview and executes by job id", async () => {
    const storage = createMemoryStorage();
    storage.promptDetails = [
      {
        id: "prmt_20260502_120000_abcdefabcdef",
        tool: "claude-code",
        source_event: "UserPromptSubmit",
        session_id: "session-1",
        cwd: "/Users/example/private-project",
        created_at: "2026-05-02T12:00:00.000Z",
        received_at: "2026-05-02T12:00:00.000Z",
        snippet: "Fix [REDACTED:api_key]",
        prompt_length: 24,
        is_sensitive: true,
        excluded_from_analysis: false,
        redaction_policy: "mask",
        adapter_version: "claude-code-v1",
        index_status: "indexed",
        tags: ["backend"],
        quality_gaps: ["Verification criteria"],
        usefulness: { copied_count: 0, bookmarked: false },
        duplicate_count: 0,
        markdown:
          "Fix /Users/example/private-project/src/secret.ts with [REDACTED:api_key]",
        analysis: undefined,
        improvement_drafts: [],
      },
    ];
    const server = createTestServer({ storage });
    const session = await server.inject({
      method: "GET",
      url: "/api/v1/session",
      headers: { host: "127.0.0.1:17373" },
    });
    const cookie = String(session.headers["set-cookie"]);
    const csrfToken = session.json<{ data: { csrf_token: string } }>().data
      .csrf_token;

    const noCsrf = await server.inject({
      method: "POST",
      url: "/api/v1/exports/preview",
      headers: {
        host: "127.0.0.1:17373",
        cookie,
      },
      payload: { preset: "anonymized_review" },
    });
    expect(noCsrf.statusCode).toBe(403);

    const preview = await server.inject({
      method: "POST",
      url: "/api/v1/exports/preview",
      headers: {
        host: "127.0.0.1:17373",
        cookie,
        "x-csrf-token": csrfToken,
      },
      payload: { preset: "anonymized_review" },
    });
    const previewBody = preview.json<{ data: ExportJob }>();

    expect(preview.statusCode).toBe(200);
    expect(previewBody.data).toMatchObject({
      id: expect.stringMatching(/^exp_/),
      preset: "anonymized_review",
      counts: {
        prompt_count: 1,
        sensitive_count: 1,
      },
    });
    expect(preview.body).not.toContain("prmt_20260502_120000_abcdefabcdef");
    expect(preview.body).not.toContain("/Users/example/private-project");

    const executed = await server.inject({
      method: "POST",
      url: "/api/v1/exports",
      headers: {
        host: "127.0.0.1:17373",
        cookie,
        "x-csrf-token": csrfToken,
      },
      payload: { job_id: previewBody.data.id },
    });

    expect(executed.statusCode).toBe(200);
    expect(executed.json()).toMatchObject({
      data: {
        job_id: previewBody.data.id,
        count: 1,
        items: [
          {
            anonymous_id: expect.stringMatching(/^anon_/),
            prompt: expect.stringContaining("[REDACTED:path]"),
          },
        ],
      },
    });
    expect(executed.body).not.toContain("prmt_20260502_120000_abcdefabcdef");
    expect(executed.body).not.toContain("/Users/example/private-project");
  });

  it("serves built web assets with csp and spa fallback", async () => {
    const server = createTestServer({
      webAssets: {
        "index.html":
          '<html><head><script type="module" src="/assets/app.js"></script></head><body><div id="root"></div></body></html>',
        "assets/app.js": "console.log('web')",
      },
    });

    const root = await server.inject({
      method: "GET",
      url: "/",
      headers: { host: "127.0.0.1:17373" },
    });
    expect(root.statusCode).toBe(200);
    expect(root.headers["content-security-policy"]).toContain(
      "default-src 'self'",
    );
    expect(root.body).toContain('<div id="root"></div>');

    const fallback = await server.inject({
      method: "GET",
      url: "/prompts/prmt_20260501_100000_abcdefabcdef",
      headers: { host: "127.0.0.1:17373" },
    });
    expect(fallback.statusCode).toBe(200);
    expect(fallback.body).toContain('<div id="root"></div>');

    for (const path of [
      "/dashboard",
      "/coach",
      "/practice",
      "/scores",
      "/benchmark",
      "/insights",
      "/loops",
      "/projects",
      "/mcp",
      "/exports",
      "/settings",
    ]) {
      const route = await server.inject({
        method: "GET",
        url: path,
        headers: { host: "127.0.0.1:17373" },
      });
      expect(route.statusCode).toBe(200);
      expect(route.body).toContain('<div id="root"></div>');
    }

    const asset = await server.inject({
      method: "GET",
      url: "/assets/app.js",
      headers: { host: "127.0.0.1:17373" },
    });
    expect(asset.statusCode).toBe(200);
    expect(asset.headers["content-type"]).toContain("text/javascript");
    expect(asset.body).toContain("console.log");
  });

  it("rejects unauthenticated ingest with RFC 7807 problem response", async () => {
    const server = createTestServer();

    const response = await server.inject({
      method: "POST",
      url: "/api/v1/ingest/claude-code",
      headers: { host: "127.0.0.1:17373" },
      payload: claudeFixture,
    });

    expect(response.statusCode).toBe(401);
    expect(response.headers["content-type"]).toContain(
      "application/problem+json",
    );
    expect(response.json()).toMatchObject({
      status: 401,
      title: "Unauthorized",
    });
  });

  it("rejects wrong ingest token", async () => {
    const server = createTestServer();

    const response = await server.inject({
      method: "POST",
      url: "/api/v1/ingest/claude-code",
      headers: {
        host: "127.0.0.1:17373",
        authorization: "Bearer wrong",
      },
      payload: claudeFixture,
    });

    expect(response.statusCode).toBe(401);
  });

  it("returns 415 (not 500) when the request content-type is unsupported", async () => {
    const server = createTestServer();

    const response = await server.inject({
      method: "POST",
      url: "/api/v1/ingest/claude-code",
      headers: {
        host: "127.0.0.1:17373",
        authorization: "Bearer ingest-token",
        "content-type": "application/xml",
      },
      payload: "<xml/>",
    });

    expect(response.statusCode).toBe(415);
    expect(response.headers["content-type"]).toContain(
      "application/problem+json",
    );
    expect(response.json()).toMatchObject({
      status: 415,
      title: "Unsupported Media Type",
    });
  });

  it("accepts case-insensitive loopback Host header (RFC 3986 §3.2.2)", async () => {
    const server = createTestServer();

    for (const host of [
      "127.0.0.1:17373",
      "localhost:17373",
      "LOCALHOST:17373",
      "Localhost:17373",
    ]) {
      const response = await server.inject({
        method: "GET",
        url: "/api/v1/health",
        headers: { host },
      });
      expect(response.statusCode, `host="${host}"`).toBe(200);
    }
  });

  it("returns RFC 7807 404 for unknown routes", async () => {
    const server = createTestServer();

    const response = await server.inject({
      method: "GET",
      url: "/api/v1/this-route-does-not-exist",
      headers: { host: "127.0.0.1:17373" },
    });

    expect(response.statusCode).toBe(404);
    expect(response.headers["content-type"]).toContain(
      "application/problem+json",
    );
    expect(response.json()).toMatchObject({
      status: 404,
      title: "Not Found",
    });
  });

  it("returns 400 (not 500) when the JSON body is malformed", async () => {
    const server = createTestServer();

    const response = await server.inject({
      method: "POST",
      url: "/api/v1/ingest/claude-code",
      headers: {
        host: "127.0.0.1:17373",
        authorization: "Bearer ingest-token",
        "content-type": "application/json",
      },
      payload: "this is not json",
    });

    expect(response.statusCode).toBe(400);
    expect(response.headers["content-type"]).toContain(
      "application/problem+json",
    );
    expect(response.json()).toMatchObject({
      status: 400,
      title: "Bad Request",
    });
  });

  it("normalizes, redacts, and stores a valid Claude Code fixture", async () => {
    const storage = createMemoryStorage();
    const server = createTestServer({ storage });

    const response = await server.inject({
      method: "POST",
      url: "/api/v1/ingest/claude-code",
      headers: {
        host: "127.0.0.1:17373",
        authorization: "Bearer ingest-token",
      },
      payload: {
        ...claudeFixture,
        prompt: "Use bearer abc.def.ghi and email test@example.com",
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      data: {
        id: "stored-1",
        stored: true,
        duplicate: false,
        redacted: true,
      },
    });
    expect(storage.events).toHaveLength(1);
    expect(storage.events[0]?.event.tool).toBe("claude-code");
    expect(storage.events[0]?.event.cwd).toBe(
      "/Users/example/side-project/promptlane",
    );
    expect(storage.events[0]?.redaction.stored_text).toContain(
      "[REDACTED:email]",
    );
    expect(storage.events[0]?.redaction.stored_text).not.toContain(
      "test@example.com",
    );
  });

  it("normalizes, redacts, and stores a valid Codex fixture", async () => {
    const storage = createMemoryStorage();
    const server = createTestServer({ storage });

    const response = await server.inject({
      method: "POST",
      url: "/api/v1/ingest/codex",
      headers: {
        host: "127.0.0.1:17373",
        authorization: "Bearer ingest-token",
      },
      payload: {
        ...codexFixture,
        prompt: "Review this and keep api key sk-proj-1234567890abcdef safe",
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      data: {
        id: "stored-1",
        stored: true,
        duplicate: false,
        redacted: true,
      },
    });
    expect(storage.events).toHaveLength(1);
    expect(storage.events[0]?.event).toMatchObject({
      tool: "codex",
      source_event: "UserPromptSubmit",
      session_id: "codex-session-123",
      turn_id: "turn-456",
      cwd: "/Users/example/side-project/promptlane",
      transcript_path: "/Users/example/.codex/sessions/promptlane.jsonl",
      model: "gpt-5.5",
      adapter_version: "codex-v1",
    });
    expect(storage.events[0]?.redaction.stored_text).toContain(
      "[REDACTED:api_key]",
    );
    expect(storage.events[0]?.redaction.stored_text).not.toContain(
      "sk-proj-1234567890abcdef",
    );
  });

  it("rejects empty prompts before storage", async () => {
    const storage = createMemoryStorage();
    const server = createTestServer({ storage });

    const response = await server.inject({
      method: "POST",
      url: "/api/v1/ingest/claude-code",
      headers: {
        host: "127.0.0.1:17373",
        authorization: "Bearer ingest-token",
      },
      payload: { ...claudeFixture, prompt: "   " },
    });

    expect(response.statusCode).toBe(422);
    expect(storage.events).toHaveLength(0);
  });

  it("does not call storage in reject mode when sensitive content is found", async () => {
    const storage = createMemoryStorage();
    const server = createTestServer({ storage, redactionMode: "reject" });

    const response = await server.inject({
      method: "POST",
      url: "/api/v1/ingest/claude-code",
      headers: {
        host: "127.0.0.1:17373",
        authorization: "Bearer ingest-token",
      },
      payload: { ...claudeFixture, prompt: "token sk-proj-1234567890abcdef" },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      data: { stored: false, redacted: true },
    });
    expect(storage.events).toHaveLength(0);
  });

  it("does not call storage for excluded capture paths", async () => {
    const storage = createMemoryStorage();
    const server = createTestServer({
      storage,
      excludedProjectRoots: ["/Users/example/side-project"],
    });

    const response = await server.inject({
      method: "POST",
      url: "/api/v1/ingest/claude-code",
      headers: {
        host: "127.0.0.1:17373",
        authorization: "Bearer ingest-token",
      },
      payload: claudeFixture,
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      data: { stored: false, excluded: true },
    });
    expect(storage.events).toHaveLength(0);
  });

  it("excludes capture paths even when the configured root has a trailing slash", async () => {
    const storage = createMemoryStorage();
    const server = createTestServer({
      storage,
      // User added a path with a trailing slash — natural copy/paste from a
      // shell prompt. Without normalization the matcher would silently fail.
      excludedProjectRoots: ["/Users/example/side-project/"],
    });

    const response = await server.inject({
      method: "POST",
      url: "/api/v1/ingest/claude-code",
      headers: {
        host: "127.0.0.1:17373",
        authorization: "Bearer ingest-token",
      },
      payload: claudeFixture,
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      data: { stored: false, excluded: true },
    });
    expect(storage.events).toHaveLength(0);
  });

  it("does not call storage when project policy disables capture", async () => {
    const storage = createMemoryStorage();
    storage.policyForIngest = {
      capture_disabled: true,
      analysis_disabled: false,
      export_disabled: false,
      external_analysis_opt_in: false,
      version: 1,
    };
    const server = createTestServer({ storage });

    const response = await server.inject({
      method: "POST",
      url: "/api/v1/ingest/claude-code",
      headers: {
        host: "127.0.0.1:17373",
        authorization: "Bearer ingest-token",
      },
      payload: claudeFixture,
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      data: { stored: false, excluded: true, reason: "project_policy" },
    });
    expect(storage.events).toHaveLength(0);
  });

  it("fails open without storing when project policy lookup fails", async () => {
    const storage = createMemoryStorage();
    storage.failPolicyLookup = true;
    const server = createTestServer({ storage });

    const response = await server.inject({
      method: "POST",
      url: "/api/v1/ingest/claude-code",
      headers: {
        host: "127.0.0.1:17373",
        authorization: "Bearer ingest-token",
      },
      payload: claudeFixture,
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      data: {
        stored: false,
        excluded: true,
        reason: "policy_lookup_failed",
      },
    });
    expect(storage.events).toHaveLength(0);
  });

  it("rejects invalid host and cross-origin browser requests", async () => {
    const server = createTestServer();

    const invalidHost = await server.inject({
      method: "GET",
      url: "/api/v1/health",
      headers: { host: "evil.example" },
    });
    expect(invalidHost.statusCode).toBe(400);

    const crossOrigin = await server.inject({
      method: "POST",
      url: "/api/v1/ingest/claude-code",
      headers: {
        host: "127.0.0.1:17373",
        origin: "https://evil.example",
        authorization: "Bearer ingest-token",
      },
      payload: claudeFixture,
    });
    expect(crossOrigin.statusCode).toBe(403);
    expect(crossOrigin.headers["access-control-allow-origin"]).toBeUndefined();

    const crossSiteFetch = await server.inject({
      method: "GET",
      url: "/api/v1/health",
      headers: {
        host: "127.0.0.1:17373",
        "sec-fetch-site": "cross-site",
      },
    });
    expect(crossSiteFetch.statusCode).toBe(403);
  });

  it("enforces prompt length limits before storage", async () => {
    const storage = createMemoryStorage();
    const server = createTestServer({ storage, maxPromptLength: 10 });

    const response = await server.inject({
      method: "POST",
      url: "/api/v1/ingest/claude-code",
      headers: {
        host: "127.0.0.1:17373",
        authorization: "Bearer ingest-token",
      },
      payload: { ...claudeFixture, prompt: "this prompt is too long" },
    });

    expect(response.statusCode).toBe(413);
    expect(storage.events).toHaveLength(0);
  });

  it("enforces body size and query length limits", async () => {
    const server = createTestServer({
      maxBodyBytes: 80,
      maxQueryLength: 5,
    });

    const oversizedBody = await server.inject({
      method: "POST",
      url: "/api/v1/ingest/claude-code",
      headers: {
        host: "127.0.0.1:17373",
        authorization: "Bearer ingest-token",
        "content-type": "application/json",
      },
      payload: JSON.stringify({
        ...claudeFixture,
        prompt: "this payload is intentionally too large",
      }),
    });

    expect(oversizedBody.statusCode).toBe(413);

    const oversizedQuery = await server.inject({
      method: "GET",
      url: "/api/v1/health?abcdef",
      headers: { host: "127.0.0.1:17373" },
    });

    expect(oversizedQuery.statusCode).toBe(414);
  });

  it("rate limits ingest before storing repeated requests", async () => {
    const storage = createMemoryStorage();
    const server = createTestServer({
      storage,
      rateLimit: { max: 1, windowMs: 60_000 },
    });

    const request = {
      method: "POST" as const,
      url: "/api/v1/ingest/claude-code",
      headers: {
        host: "127.0.0.1:17373",
        authorization: "Bearer ingest-token",
      },
      payload: claudeFixture,
    };

    const first = await server.inject(request);
    const second = await server.inject(request);

    expect(first.statusCode).toBe(200);
    expect(second.statusCode).toBe(429);
    expect(storage.events).toHaveLength(1);
  });

  it("returns the shared storage capability problem when ask-event storage is unavailable", async () => {
    const storage = createMemoryStorage();
    const server = createTestServer({ storage });

    const response = await server.inject({
      method: "POST",
      url: "/api/v1/ingest/ask-event",
      headers: {
        host: "127.0.0.1:17373",
        authorization: "Bearer ingest-token",
      },
      payload: {
        tool: "codex",
        score: 10,
        band: "weak",
        missing_axes: ["goal_clarity"],
        prompt_length: 14,
      },
    });

    expect(response.statusCode).toBe(500);
    expect(response.headers["content-type"]).toContain(
      "application/problem+json",
    );
    expect(response.json()).toMatchObject({
      status: 500,
      title: "Internal Server Error",
      detail: "Ask-event storage is not configured.",
      instance: "/api/v1/ingest/ask-event",
    });
    expect(response.body).not.toContain("recordAskEvent");
    expect(response.body).not.toContain("/Users/");
  });

  it("returns the shared storage capability problem when ask-event summary storage is unavailable", async () => {
    const storage = createMemoryStorage();
    const server = createTestServer({ storage });

    const response = await server.inject({
      method: "GET",
      url: "/api/v1/ask-events/summary",
      headers: {
        host: "127.0.0.1:17373",
        authorization: "Bearer app-token",
      },
    });

    expect(response.statusCode).toBe(500);
    expect(response.headers["content-type"]).toContain(
      "application/problem+json",
    );
    expect(response.json()).toMatchObject({
      status: 500,
      title: "Internal Server Error",
      detail: "Ask-event summary storage is not configured.",
      instance: "/api/v1/ask-events/summary",
    });
    expect(response.body).not.toContain("getAskEventSummary");
    expect(response.body).not.toContain("/Users/");
  });

  it("normalizes safe control characters and rejected values are not echoed", async () => {
    const storage = createMemoryStorage();
    const server = createTestServer({ storage });

    const response = await server.inject({
      method: "POST",
      url: "/api/v1/ingest/claude-code",
      headers: {
        host: "127.0.0.1:17373",
        authorization: "Bearer ingest-token",
      },
      payload: {
        ...claudeFixture,
        session_id: " session-with-null\u0000 ",
        prompt: "hello\u0000world",
      },
    });

    expect(response.statusCode).toBe(200);
    expect(storage.events[0]?.event.session_id).toBe("session-with-null");
    expect(storage.events[0]?.event.prompt).toBe("helloworld");

    const invalid = await server.inject({
      method: "POST",
      url: "/api/v1/ingest/claude-code",
      headers: {
        host: "127.0.0.1:17373",
        authorization: "Bearer ingest-token",
      },
      payload: {
        ...claudeFixture,
        cwd: "../secret-project",
        prompt: "do not echo sk-proj-1234567890abcdef",
      },
    });

    expect(invalid.statusCode).toBe(422);
    expect(invalid.body).not.toContain("sk-proj-1234567890abcdef");
    expect(invalid.body).not.toContain("../secret-project");
  });

  it("dry-runs uploaded JSONL without retaining raw secrets or paths", async () => {
    const server = createTestServer();
    const session = await server.inject({
      method: "GET",
      url: "/api/v1/session",
      headers: { host: "127.0.0.1:17373" },
    });
    const cookie = String(session.headers["set-cookie"]);
    const csrfToken = session.json<{ data: { csrf_token: string } }>().data
      .csrf_token;
    const rawSecret = "sk-proj-import-dryrun-1234567890";
    const rawPath = "/Users/example/private-project/src/secret.ts";
    const content = `${JSON.stringify({
      hook_event_name: "UserPromptSubmit",
      session_id: "upload-session-1",
      cwd: "/Users/example/private-project",
      prompt: `Fix ${rawPath} with token ${rawSecret}.`,
    })}\n`;

    const noCsrf = await server.inject({
      method: "POST",
      url: "/api/v1/import/dry-run",
      headers: { host: "127.0.0.1:17373", cookie },
      payload: { source_type: "manual-jsonl", content },
    });
    expect(noCsrf.statusCode).toBe(403);

    const ok = await server.inject({
      method: "POST",
      url: "/api/v1/import/dry-run",
      headers: {
        host: "127.0.0.1:17373",
        cookie,
        "x-csrf-token": csrfToken,
      },
      payload: { source_type: "manual-jsonl", content },
    });
    expect(ok.statusCode).toBe(200);
    expect(ok.body).not.toContain(rawSecret);
    expect(ok.body).not.toContain(rawPath);
    const body = ok.json<{
      data: { prompt_candidates: number; sensitive_prompt_count: number };
    }>().data;
    expect(body.prompt_candidates).toBe(1);
    expect(body.sensitive_prompt_count).toBe(1);
  });

  it("records coach feedback with CSRF and aggregates the summary", async () => {
    const storage = createMemoryStorage();
    const server = createTestServer({ storage });
    const session = await server.inject({
      method: "GET",
      url: "/api/v1/session",
      headers: { host: "127.0.0.1:17373" },
    });
    const cookie = String(session.headers["set-cookie"]);
    const csrfToken = session.json<{ data: { csrf_token: string } }>().data
      .csrf_token;

    const noCsrf = await server.inject({
      method: "POST",
      url: "/api/v1/prompts/prmt_20260504_100000_aabbccddeeff/coach-feedback",
      headers: { host: "127.0.0.1:17373", cookie },
      payload: { rating: "helpful" },
    });
    expect(noCsrf.statusCode).toBe(403);

    const helpful = await server.inject({
      method: "POST",
      url: "/api/v1/prompts/prmt_20260504_100000_aabbccddeeff/coach-feedback",
      headers: {
        host: "127.0.0.1:17373",
        cookie,
        "x-csrf-token": csrfToken,
      },
      payload: { rating: "helpful" },
    });
    expect(helpful.statusCode).toBe(200);
    expect(helpful.json<{ data: { rating: string } }>().data.rating).toBe(
      "helpful",
    );

    const wrong = await server.inject({
      method: "POST",
      url: "/api/v1/prompts/prmt_20260504_100000_aabbccddeeff/coach-feedback",
      headers: {
        host: "127.0.0.1:17373",
        cookie,
        "x-csrf-token": csrfToken,
      },
      payload: { rating: "wrong" },
    });
    expect(wrong.statusCode).toBe(200);

    const summary = await server.inject({
      method: "GET",
      url: "/api/v1/coach-feedback/summary",
      headers: {
        host: "127.0.0.1:17373",
        authorization: "Bearer app-token",
      },
    });
    expect(summary.statusCode).toBe(200);
    expect(
      summary.json<{
        data: { total: number; helpful: number; helpful_ratio: number };
      }>().data,
    ).toMatchObject({ total: 2, helpful: 1, helpful_ratio: 0.5 });
  });

  it("rejects coach feedback with an unsupported rating", async () => {
    const storage = createMemoryStorage();
    const server = createTestServer({ storage });
    const session = await server.inject({
      method: "GET",
      url: "/api/v1/session",
      headers: { host: "127.0.0.1:17373" },
    });
    const cookie = String(session.headers["set-cookie"]);
    const csrfToken = session.json<{ data: { csrf_token: string } }>().data
      .csrf_token;

    const bad = await server.inject({
      method: "POST",
      url: "/api/v1/prompts/prmt_20260504_100000_aabbccddeeff/coach-feedback",
      headers: {
        host: "127.0.0.1:17373",
        cookie,
        "x-csrf-token": csrfToken,
      },
      payload: { rating: "amazing" },
    });

    expect(bad.statusCode).toBeGreaterThanOrEqual(400);
  });

  it("rejects import dry-run uploads with an unsupported source_type", async () => {
    const server = createTestServer();
    const session = await server.inject({
      method: "GET",
      url: "/api/v1/session",
      headers: { host: "127.0.0.1:17373" },
    });
    const cookie = String(session.headers["set-cookie"]);
    const csrfToken = session.json<{ data: { csrf_token: string } }>().data
      .csrf_token;

    const bad = await server.inject({
      method: "POST",
      url: "/api/v1/import/dry-run",
      headers: {
        host: "127.0.0.1:17373",
        cookie,
        "x-csrf-token": csrfToken,
      },
      payload: { source_type: "not-a-source", content: "{}" },
    });

    expect(bad.statusCode).toBeGreaterThanOrEqual(400);
  });
});

type TestServerOptions = {
  storage?: ReturnType<typeof createMemoryStorage>;
  redactionMode?: "mask" | "raw" | "reject";
  excludedProjectRoots?: string[];
  maxPromptLength?: number;
  maxBodyBytes?: number;
  maxQueryLength?: number;
  rateLimit?: { max: number; windowMs: number };
  webAssets?: Record<string, string>;
  dataDir?: string;
  autoJudge?: {
    enabled: boolean;
    tool: "claude" | "codex";
    daily_limit: number;
    per_minute_limit: number;
  };
};

function createTestServer(options: TestServerOptions = {}) {
  return createServer({
    dataDir: options.dataDir ?? "/tmp/promptlane-test",
    autoJudge: options.autoJudge,
    auth: {
      appToken: "app-token",
      ingestToken: "ingest-token",
      webSessionSecret: "web-session-secret",
    },
    redactionMode: options.redactionMode ?? "mask",
    excludedProjectRoots: options.excludedProjectRoots ?? [],
    maxPromptLength: options.maxPromptLength ?? 10_000,
    maxBodyBytes: options.maxBodyBytes,
    maxQueryLength: options.maxQueryLength,
    rateLimit: options.rateLimit,
    webAssets: options.webAssets,
    storage: options.storage ?? createMemoryStorage(),
  });
}

function createMemoryStorage() {
  const events: Array<Parameters<PromptStoragePort["storePrompt"]>[0]> = [];
  const policyUpdates: Array<{
    projectId: string;
    patch: Record<string, unknown>;
    actor: "cli" | "web" | "system";
  }> = [];
  const exportJobs = new Map<string, ExportJob>();
  const instructionReviews = new Map<string, ProjectInstructionReview>();
  const loopSnapshots: LoopSnapshot[] = [];
  const compactBoundaries: CompactBoundary[] = [];
  const loopMemories: LoopMemory[] = [];
  const loopMergeDecisions: LoopMergeDecision[] = [];
  const coachFeedback: Array<{
    id: string;
    prompt_id: string;
    rating: "helpful" | "not_helpful" | "wrong";
    created_at: string;
  }> = [];

  return {
    events,
    policyUpdates,
    promptDetails: [] as PromptDetail[],
    loopSnapshots,
    compactBoundaries,
    loopMemories,
    loopMergeDecisions,
    exportJobs,
    instructionReviews,
    policyForIngest: undefined as
      | {
          capture_disabled: boolean;
          analysis_disabled: boolean;
          export_disabled: boolean;
          external_analysis_opt_in: boolean;
          version: number;
        }
      | undefined,
    failPolicyLookup: false,
    async storePrompt(input: Parameters<PromptStoragePort["storePrompt"]>[0]) {
      events.push(input);
      return {
        id: "stored-1",
        duplicate: false,
      };
    },
    listProjects() {
      return {
        items: [
          {
            project_id: "proj_memory",
            label: "promptlane",
            alias: "workbench",
            path_kind: "project_root" as const,
            prompt_count: 2,
            latest_ingest: "2026-05-02T09:00:00.000Z",
            sensitive_count: 1,
            quality_gap_rate: 0.5,
            copied_count: 1,
            bookmarked_count: 1,
            policy: {
              capture_disabled: false,
              analysis_disabled: false,
              export_disabled: false,
              external_analysis_opt_in: false,
              version: 1,
            },
          },
        ],
      };
    },
    updateProjectPolicy(
      projectId: string,
      patch: Record<string, unknown>,
      actor: "cli" | "web" | "system",
    ) {
      policyUpdates.push({ projectId, patch, actor });
      return {
        project_id: projectId,
        label: "promptlane",
        alias: typeof patch.alias === "string" ? patch.alias : "workbench",
        path_kind: "project_root" as const,
        prompt_count: 2,
        latest_ingest: "2026-05-02T09:00:00.000Z",
        sensitive_count: 1,
        quality_gap_rate: 0.5,
        copied_count: 1,
        bookmarked_count: 1,
        policy: {
          capture_disabled: patch.capture_disabled === true,
          analysis_disabled: false,
          export_disabled: false,
          external_analysis_opt_in: false,
          version: 2,
        },
      };
    },
    getProjectPolicyForEvent() {
      if (this.failPolicyLookup) {
        throw new Error("lookup failed");
      }
      return this.policyForIngest;
    },
    getProjectInstructionReview(projectId: string) {
      return instructionReviews.get(projectId);
    },
    analyzeProjectInstructions(projectId: string) {
      const review: ProjectInstructionReview = {
        generated_at: "2026-05-03T00:00:00.000Z",
        analyzer: "local-project-instructions-v1",
        score: { value: 80, max: 100, band: "good" },
        files_found: 1,
        files: [
          {
            file_name: "AGENTS.md",
            bytes: 100,
            modified_at: "2026-05-03T00:00:00.000Z",
            content_hash: "abcdef1234567890",
            truncated: false,
          },
        ],
        checklist: [],
        suggestions: ["Add exact verification commands."],
        privacy: {
          local_only: true,
          external_calls: false,
          stores_file_bodies: false,
          returns_file_bodies: false,
          returns_raw_paths: false,
        },
      };
      instructionReviews.set(projectId, review);
      return review;
    },
    listPrompts() {
      return {
        items: this.promptDetails.map(
          ({ markdown, analysis, improvement_drafts, ...summary }) => summary,
        ),
      };
    },
    searchPrompts() {
      return this.listPrompts();
    },
    findSimilarPrompts() {
      return [];
    },
    listLoopSnapshots() {
      return { items: loopSnapshots };
    },
    getLatestLoopSnapshot() {
      return loopSnapshots.at(0);
    },
    listCompactBoundaries() {
      return { items: compactBoundaries };
    },
    recordLoopMemory(input: {
      snapshot_id: string;
      title: string;
      statement: string;
      evidence_refs: string[];
      approved_by: string;
    }) {
      const memory = loopMemory({
        id: `mem_${loopMemories.length + 1}`,
        snapshot_id: input.snapshot_id,
        title: input.title,
        statement: input.statement,
        evidence_refs: input.evidence_refs,
        approved_by: input.approved_by,
      });
      loopMemories.unshift(memory);
      return memory;
    },
    listLoopMemories(options: { limit?: number; projectId?: string } = {}) {
      const scoped = options.projectId
        ? loopMemories.filter((memory) => {
            const snapshot = loopSnapshots.find(
              (item) => item.id === memory.snapshot_id,
            );
            return snapshot?.project_id === options.projectId;
          })
        : loopMemories;
      return { items: scoped.slice(0, options.limit ?? scoped.length) };
    },
    listLoopMergeDecisions(
      options: { limit?: number; projectId?: string; worktree?: string } = {},
    ) {
      const scoped = loopMergeDecisions.filter(
        (decision) =>
          (!options.projectId || decision.project_id === options.projectId) &&
          (!options.worktree || decision.worktree === options.worktree),
      );
      return { items: scoped.slice(0, options.limit ?? scoped.length) };
    },
    getPrompt(id: string) {
      return this.promptDetails.find((prompt) => prompt.id === id);
    },
    deletePrompt() {
      return { deleted: true };
    },
    getQualityDashboard() {
      return {
        total_prompts: 0,
        sensitive_prompts: 0,
        sensitive_ratio: 0,
        recent: { last_7_days: 0, last_30_days: 0 },
        trend: { daily: [] },
        distribution: { by_tool: [], by_project: [] },
        missing_items: [],
        patterns: [],
        instruction_suggestions: [],
        useful_prompts: [],
        duplicate_prompt_groups: [],
        project_profiles: [],
      };
    },
    recordPromptUsage() {
      return {
        recorded: false,
        usefulness: { copied_count: 0, bookmarked: false },
      };
    },
    setPromptBookmark() {
      return {
        updated: false,
        usefulness: { copied_count: 0, bookmarked: false },
      };
    },
    recordCoachFeedback(promptId: string, rating: string) {
      const id = `cfb_${coachFeedback.length + 1}`;
      const entry = {
        id,
        prompt_id: promptId,
        rating: rating as "helpful" | "not_helpful" | "wrong",
        created_at: "2026-05-04T00:00:00.000Z",
      };
      coachFeedback.push(entry);
      return entry;
    },
    getCoachFeedbackSummary() {
      const helpful = coachFeedback.filter(
        (e) => e.rating === "helpful",
      ).length;
      const not_helpful = coachFeedback.filter(
        (e) => e.rating === "not_helpful",
      ).length;
      const wrong = coachFeedback.filter((e) => e.rating === "wrong").length;
      const total = coachFeedback.length;
      return {
        total,
        helpful,
        not_helpful,
        wrong,
        helpful_ratio: total > 0 ? Number((helpful / total).toFixed(4)) : 0,
      };
    },
    createExportJob(input: {
      preset: ExportJob["preset"];
      status: ExportJob["status"];
      prompt_id_hashes: string[];
      project_policy_versions: Record<string, number>;
      redaction_version: string;
      counts: ExportJob["counts"];
      expires_at: string;
    }) {
      const job: ExportJob = {
        id: `exp_${exportJobs.size + 1}`,
        preset: input.preset,
        status: input.status,
        prompt_id_hashes: input.prompt_id_hashes,
        project_policy_versions: input.project_policy_versions,
        redaction_version: input.redaction_version,
        counts: input.counts,
        expires_at: input.expires_at,
        created_at: "2026-05-02T12:00:00.000Z",
      };
      exportJobs.set(job.id, job);
      return job;
    },
    getExportJob(id: string) {
      return exportJobs.get(id);
    },
    updateExportJobStatus(id: string, status: ExportJob["status"]) {
      const job = exportJobs.get(id);
      if (!job) {
        return undefined;
      }
      const updated = { ...job, status };
      exportJobs.set(id, updated);
      return updated;
    },
  } satisfies PromptStoragePort & {
    events: Array<Parameters<PromptStoragePort["storePrompt"]>[0]>;
    policyUpdates: Array<{
      projectId: string;
      patch: Record<string, unknown>;
      actor: "cli" | "web" | "system";
    }>;
    promptDetails: PromptDetail[];
    exportJobs: Map<string, ExportJob>;
    instructionReviews: Map<string, ProjectInstructionReview>;
    policyForIngest:
      | {
          capture_disabled: boolean;
          analysis_disabled: boolean;
          export_disabled: boolean;
          external_analysis_opt_in: boolean;
          version: number;
        }
      | undefined;
    failPolicyLookup: boolean;
  };
}

function loopSnapshot(patch: Partial<LoopSnapshot> = {}): LoopSnapshot {
  return {
    id: "loop_web",
    created_at: "2026-07-04T01:00:00.000Z",
    tool: "codex",
    source: "cli",
    session_id: "session-web",
    cwd_label: "private-project",
    project_id: "proj_web",
    branch: "codex/agent-loop-memory-design",
    prompt_ids: ["prmt_one", "prmt_two"],
    event_counts: {
      prompts: 2,
    },
    quality: {
      average_prompt_score: 58,
      top_gaps: ["Goal clarity", "Verification criteria"],
      unresolved_questions: [],
    },
    outcome: {
      status: "unknown",
      summary: "Loop snapshot collected from 2 prompts.",
      evidence_refs: ["prompt:prmt_one", "prompt:prmt_two"],
    },
    next_brief: {
      generated: false,
      summary: "Run promptlane loop brief to generate the next request.",
    },
    privacy: {
      local_only: true,
      stores_prompt_bodies: false,
      stores_raw_paths: false,
    },
    ...patch,
  };
}

function loopMemory(patch: Partial<LoopMemory> = {}): LoopMemory {
  return {
    id: "mem_web",
    snapshot_id: "loop_web",
    title: "Shared loop status",
    statement: "Keep web, CLI, MCP, and API loop status on the shared model.",
    evidence_refs: ["commit:11d8426", "test:pnpm test"],
    approved_by: "user",
    created_at: "2026-07-04T01:10:00.000Z",
    privacy: {
      local_only: true,
      stores_prompt_bodies: false,
      stores_raw_paths: false,
      writes_instruction_files: false,
      external_calls: false,
    },
    ...patch,
  };
}

function loopMergeDecision(
  patch: Partial<LoopMergeDecision> = {},
): LoopMergeDecision {
  return {
    id: "mdec_web",
    snapshot_id: "loop_web",
    project_id: "proj_web",
    worktree: "agent-loop-worktree",
    decision: "continue",
    reason: "Needs one more verification pass before merge.",
    decided_by: "user",
    created_at: "2026-07-04T01:30:00.000Z",
    privacy: {
      local_only: true,
      stores_prompt_bodies: false,
      stores_raw_paths: false,
      writes_git_state: false,
      external_calls: false,
    },
    ...patch,
  };
}
