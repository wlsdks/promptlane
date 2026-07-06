# Loop Snapshot CLI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first PromptLane slice by adding a privacy-safe loop snapshot model plus `promptlane loop collect` and `promptlane loop brief`.

**Architecture:** Keep the existing `promptlane` CLI/package name. Add a small `src/loop/` domain module that derives loop snapshots and continuation briefs from existing prompt summaries, then persist snapshots through the SQLite storage boundary. CLI code should orchestrate storage and formatting only; prompt analysis and privacy decisions stay in `src/loop` and `src/storage`.

**Tech Stack:** TypeScript, Node.js ESM, Commander, SQLite via `better-sqlite3`, Vitest, pnpm 10 on Node 22.

---

## Planning Gate

Before executing this plan, read `docs/superpowers/specs/2026-07-04-agent-loop-memory-design.md` and verify its go/no-go gate is satisfied.

This plan is executable only if:

- the first implementation slice is still limited to domain/storage/CLI/docs
- the public command remains `promptlane`
- package, GitHub repository, plugin, hook, MCP, and web UI rename work is deferred
- loop snapshots store prompt IDs and metadata, not prompt bodies or raw paths
- Node 22 + pnpm 10 remains the verification baseline for this checkout

If any condition is false, update the design spec before writing code.

## Pre-Flight

Run all commands with the repository's known-good Node 22 toolchain:

```bash
export PATH=/Users/jinan/.nvm/versions/node/v22.15.0/bin:$PATH
corepack pnpm -v
node -v
```

Expected:

```text
10.18.0
v22.15.0
```

Do not use the default shell `pnpm` for verification in this checkout. It currently resolves to pnpm 11 and can trigger a `better-sqlite3` ABI mismatch when Node 24 is active.

## File Structure

Create:

- `src/loop/types.ts`: public loop snapshot and brief types.
- `src/loop/snapshot.ts`: pure snapshot builder from prompt summaries.
- `src/loop/brief.ts`: pure continuation brief formatter.
- `src/loop/snapshot.test.ts`: domain tests for privacy-safe snapshot creation.
- `src/loop/brief.test.ts`: domain tests for continuation brief output.
- `src/cli/commands/loop.ts`: Commander registration plus CLI formatters.
- `src/cli/commands/loop.test.ts`: CLI tests for collect/brief JSON and text output.

Modify:

- `src/storage/ports.ts`: add loop snapshot storage types and port.
- `src/storage/sqlite-migrations.ts`: add migration `016_loop_snapshots`.
- `src/storage/sqlite.ts`: add loop snapshot create/list/latest methods.
- `src/storage/sqlite-storage.test.ts`: add storage integration coverage.
- `src/cli/index.ts`: register the new `loop` command.
- `docs/ARCHITECTURE.md`: document `src/loop/` as a domain module.
- `tasks/todo.md`: add and check off implementation progress while executing.

Do not modify:

- package name
- binary names
- Claude/Codex hook installers
- web UI
- MCP tools
- GitHub repository name

Those are later slices.

### Privacy Contract

The first slice must prove these invariants:

- Loop snapshots store prompt IDs and metadata, not prompt bodies.
- Loop snapshots store `cwd_label`, `project_id`, and optional `git_root_hash`, not raw absolute paths.
- Continuation briefs return IDs, summaries, gaps, and next actions, not stored prompt bodies.
- The CLI text and JSON outputs do not contain raw prompt text, `/Users/...` paths, API keys, or transcript paths.

## Task 1: Loop Domain Types And Snapshot Builder

**Files:**

- Create: `src/loop/types.ts`
- Create: `src/loop/snapshot.ts`
- Create: `src/loop/snapshot.test.ts`

- [ ] **Step 1: Write failing domain tests**

Create `src/loop/snapshot.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import type { PromptSummary } from "../storage/ports.js";
import { createLoopSnapshotFromPrompts } from "./snapshot.js";

describe("createLoopSnapshotFromPrompts", () => {
  it("creates a privacy-safe loop snapshot from prompt summaries", () => {
    const snapshot = createLoopSnapshotFromPrompts({
      now: new Date("2026-07-04T01:00:00.000Z"),
      source: "cli",
      prompts: [
        promptSummary({
          id: "prmt_weak",
          cwd: "/Users/example/private-project",
          prompt_length: 18,
          quality_score: 28,
          quality_gaps: ["Goal clarity", "Verification criteria"],
          session_id: "session-a",
          snippet: "Make this better",
          tool: "codex",
        }),
        promptSummary({
          id: "prmt_strong",
          cwd: "/Users/example/private-project",
          prompt_length: 140,
          quality_score: 88,
          quality_gaps: [],
          session_id: "session-a",
          snippet: "Implement the scoped fix and run tests",
          tool: "codex",
        }),
      ],
      project: {
        cwdLabel: "private-project",
        projectId: "proj_abc123",
        gitRootHash: "git_789",
        branch: "codex/agent-loop-memory-design",
        worktreeLabel: "worktree-agent-loop",
      },
    });

    expect(snapshot).toMatchObject({
      source: "cli",
      tool: "codex",
      session_id: "session-a",
      cwd_label: "private-project",
      project_id: "proj_abc123",
      git_root_hash: "git_789",
      branch: "codex/agent-loop-memory-design",
      worktree_label: "worktree-agent-loop",
      prompt_ids: ["prmt_weak", "prmt_strong"],
      event_counts: {
        prompts: 2,
      },
      quality: {
        average_prompt_score: 58,
        top_gaps: ["Goal clarity", "Verification criteria"],
      },
      outcome: {
        status: "unknown",
        summary: "Loop snapshot collected from 2 prompts.",
        evidence_refs: ["prompt:prmt_weak", "prompt:prmt_strong"],
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
    });
    expect(JSON.stringify(snapshot)).not.toContain("Make this better");
    expect(JSON.stringify(snapshot)).not.toContain("/Users/example");
  });

  it("returns an empty snapshot for an empty archive", () => {
    const snapshot = createLoopSnapshotFromPrompts({
      now: new Date("2026-07-04T01:00:00.000Z"),
      source: "cli",
      prompts: [],
      project: {
        cwdLabel: "unknown",
        projectId: "proj_empty",
      },
    });

    expect(snapshot.tool).toBe("unknown");
    expect(snapshot.prompt_ids).toEqual([]);
    expect(snapshot.event_counts.prompts).toBe(0);
    expect(snapshot.quality.average_prompt_score).toBeUndefined();
    expect(snapshot.outcome.summary).toBe("Loop snapshot collected from 0 prompts.");
  });
});

function promptSummary(
  patch: Partial<PromptSummary> & Pick<PromptSummary, "id">,
): PromptSummary {
  return {
    id: patch.id,
    tool: patch.tool ?? "claude-code",
    source_event: "UserPromptSubmit",
    session_id: patch.session_id ?? "session-test",
    cwd: patch.cwd ?? "/Users/example/private-project",
    created_at: "2026-07-04T00:59:00.000Z",
    received_at: "2026-07-04T00:59:01.000Z",
    snippet: patch.snippet ?? "redacted snippet",
    prompt_length: patch.prompt_length ?? 30,
    is_sensitive: false,
    excluded_from_analysis: false,
    redaction_policy: "mask",
    adapter_version: "test",
    index_status: "indexed",
    tags: [],
    quality_gaps: patch.quality_gaps ?? [],
    quality_score: patch.quality_score ?? 75,
    quality_score_band: "strong",
    usefulness: {
      copied_count: 0,
      reused_count: 0,
      bookmarked: false,
    },
    duplicate_count: 1,
  };
}
```

- [ ] **Step 2: Run the failing test**

Run:

```bash
PATH=/Users/jinan/.nvm/versions/node/v22.15.0/bin:$PATH corepack pnpm vitest run src/loop/snapshot.test.ts
```

Expected: FAIL because `src/loop/snapshot.ts` does not exist.

- [ ] **Step 3: Add loop types**

Create `src/loop/types.ts`:

```ts
export type LoopSnapshotSource = "hook" | "cli" | "mcp" | "service";

export type LoopSnapshotTool =
  | "codex"
  | "claude-code"
  | "gemini"
  | "unknown";

export type LoopOutcomeStatus =
  | "unknown"
  | "in_progress"
  | "passed"
  | "failed"
  | "blocked"
  | "abandoned";

export type LoopSnapshot = {
  id: string;
  created_at: string;
  tool: LoopSnapshotTool;
  source: LoopSnapshotSource;
  session_id?: string;
  thread_id?: string;
  cwd_label: string;
  project_id: string;
  git_root_hash?: string;
  branch?: string;
  worktree_label?: string;
  prompt_ids: string[];
  event_counts: {
    prompts: number;
    tool_calls?: number;
    files_changed?: number;
    tests_run?: number;
    errors?: number;
  };
  quality: {
    average_prompt_score?: number;
    top_gaps: string[];
    unresolved_questions: string[];
  };
  outcome: {
    status: LoopOutcomeStatus;
    summary: string;
    evidence_refs: string[];
  };
  next_brief: {
    generated: boolean;
    prompt_id?: string;
    summary: string;
  };
  privacy: {
    stores_prompt_bodies: false;
    stores_raw_paths: false;
    local_only: true;
  };
};

export type CreateLoopSnapshotInput = {
  now: Date;
  source: LoopSnapshotSource;
  prompts: Array<{
    id: string;
    tool: string;
    session_id: string;
    quality_score: number;
    quality_gaps: string[];
  }>;
  project: {
    cwdLabel: string;
    projectId: string;
    gitRootHash?: string;
    branch?: string;
    worktreeLabel?: string;
  };
};
```

- [ ] **Step 4: Add the snapshot builder**

Create `src/loop/snapshot.ts`:

```ts
import { createHash, randomUUID } from "node:crypto";

import type {
  CreateLoopSnapshotInput,
  LoopSnapshot,
  LoopSnapshotTool,
} from "./types.js";

export function createLoopSnapshotFromPrompts(
  input: CreateLoopSnapshotInput,
): LoopSnapshot {
  const promptIds = input.prompts.map((prompt) => prompt.id);
  const topGaps = topQualityGaps(input.prompts);
  const averagePromptScore =
    input.prompts.length > 0
      ? Math.round(
          input.prompts.reduce(
            (sum, prompt) => sum + prompt.quality_score,
            0,
          ) / input.prompts.length,
        )
      : undefined;

  return {
    id: `loop_${compactHash(
      `${input.now.toISOString()}:${input.project.projectId}:${promptIds.join(",")}`,
    )}`,
    created_at: input.now.toISOString(),
    tool: inferTool(input.prompts.map((prompt) => prompt.tool)),
    source: input.source,
    session_id: commonValue(input.prompts.map((prompt) => prompt.session_id)),
    cwd_label: input.project.cwdLabel,
    project_id: input.project.projectId,
    git_root_hash: input.project.gitRootHash,
    branch: input.project.branch,
    worktree_label: input.project.worktreeLabel,
    prompt_ids: promptIds,
    event_counts: {
      prompts: input.prompts.length,
    },
    quality: {
      average_prompt_score: averagePromptScore,
      top_gaps: topGaps,
      unresolved_questions: [],
    },
    outcome: {
      status: "unknown",
      summary: `Loop snapshot collected from ${input.prompts.length} prompts.`,
      evidence_refs: promptIds.map((id) => `prompt:${id}`),
    },
    next_brief: {
      generated: false,
      summary: "Run promptlane loop brief to generate the next request.",
    },
    privacy: {
      stores_prompt_bodies: false,
      stores_raw_paths: false,
      local_only: true,
    },
  };
}

function inferTool(tools: string[]): LoopSnapshotTool {
  const unique = [...new Set(tools)];
  if (unique.length !== 1) return "unknown";
  if (unique[0] === "codex" || unique[0] === "claude-code") return unique[0];
  if (unique[0] === "gemini") return "gemini";
  return "unknown";
}

function topQualityGaps(
  prompts: Array<{ quality_gaps: string[] }>,
): string[] {
  const counts = new Map<string, number>();
  for (const prompt of prompts) {
    for (const gap of prompt.quality_gaps) {
      counts.set(gap, (counts.get(gap) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 5)
    .map(([gap]) => gap);
}

function commonValue(values: string[]): string | undefined {
  const unique = [...new Set(values.filter(Boolean))];
  return unique.length === 1 ? unique[0] : undefined;
}

function compactHash(input: string): string {
  return createHash("sha256").update(input).digest("hex").slice(0, 16);
}
```

If TypeScript reports `randomUUID` is unused, remove it from the import before rerunning tests.

- [ ] **Step 5: Run the domain test**

Run:

```bash
PATH=/Users/jinan/.nvm/versions/node/v22.15.0/bin:$PATH corepack pnpm vitest run src/loop/snapshot.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit Task 1**

Run:

```bash
git add src/loop/types.ts src/loop/snapshot.ts src/loop/snapshot.test.ts
git commit -m "feat: add loop snapshot domain model"
```

## Task 2: Continuation Brief Formatter

**Files:**

- Create: `src/loop/brief.ts`
- Create: `src/loop/brief.test.ts`

- [ ] **Step 1: Write the failing brief tests**

Create `src/loop/brief.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import { createLoopBrief } from "./brief.js";
import type { LoopSnapshot } from "./types.js";

describe("createLoopBrief", () => {
  it("creates a copy-ready continuation prompt without prompt bodies or raw paths", () => {
    const brief = createLoopBrief({
      snapshot: loopSnapshot({
        prompt_ids: ["prmt_weak", "prmt_strong"],
        quality: {
          average_prompt_score: 58,
          top_gaps: ["Goal clarity", "Verification criteria"],
          unresolved_questions: [],
        },
      }),
    });

    expect(brief.title).toBe("Continue agent loop loop_123");
    expect(brief.prompt).toContain("## Goal");
    expect(brief.prompt).toContain("Continue the current coding-agent loop");
    expect(brief.prompt).toContain("## Context");
    expect(brief.prompt).toContain("project: private-project");
    expect(brief.prompt).toContain("branch: codex/agent-loop-memory-design");
    expect(brief.prompt).toContain("prompt ids: prmt_weak, prmt_strong");
    expect(brief.prompt).toContain("average prompt score: 58/100");
    expect(brief.prompt).toContain("Goal clarity");
    expect(brief.prompt).toContain("## Verification");
    expect(brief.privacy).toEqual({
      local_only: true,
      returns_prompt_bodies: false,
      returns_raw_paths: false,
    });
    expect(brief.prompt).not.toContain("/Users/example");
    expect(brief.prompt).not.toContain("Make this better");
  });
});

function loopSnapshot(patch: Partial<LoopSnapshot>): LoopSnapshot {
  return {
    id: "loop_123",
    created_at: "2026-07-04T01:00:00.000Z",
    tool: "codex",
    source: "cli",
    session_id: "session-a",
    cwd_label: "private-project",
    project_id: "proj_abc",
    git_root_hash: "git_123",
    branch: "codex/agent-loop-memory-design",
    worktree_label: "worktree-agent-loop",
    prompt_ids: [],
    event_counts: {
      prompts: 2,
    },
    quality: {
      average_prompt_score: 58,
      top_gaps: [],
      unresolved_questions: [],
    },
    outcome: {
      status: "unknown",
      summary: "Loop snapshot collected from 2 prompts.",
      evidence_refs: ["prompt:prmt_weak", "prompt:prmt_strong"],
    },
    next_brief: {
      generated: false,
      summary: "Run promptlane loop brief to generate the next request.",
    },
    privacy: {
      stores_prompt_bodies: false,
      stores_raw_paths: false,
      local_only: true,
    },
    ...patch,
  };
}
```

- [ ] **Step 2: Run the failing test**

Run:

```bash
PATH=/Users/jinan/.nvm/versions/node/v22.15.0/bin:$PATH corepack pnpm vitest run src/loop/brief.test.ts
```

Expected: FAIL because `src/loop/brief.ts` does not exist.

- [ ] **Step 3: Add the brief formatter**

Create `src/loop/brief.ts`:

```ts
import type { LoopSnapshot } from "./types.js";

export type LoopBrief = {
  title: string;
  prompt: string;
  source_snapshot_id: string;
  privacy: {
    local_only: true;
    returns_prompt_bodies: false;
    returns_raw_paths: false;
  };
};

export function createLoopBrief(input: { snapshot: LoopSnapshot }): LoopBrief {
  const snapshot = input.snapshot;
  const gaps =
    snapshot.quality.top_gaps.length > 0
      ? snapshot.quality.top_gaps.map((gap) => `- ${gap}`).join("\n")
      : "- No recurring prompt gaps recorded in this snapshot.";
  const average =
    snapshot.quality.average_prompt_score === undefined
      ? "not enough prompt data"
      : `${snapshot.quality.average_prompt_score}/100`;
  const promptIds =
    snapshot.prompt_ids.length > 0
      ? snapshot.prompt_ids.join(", ")
      : "none captured yet";

  return {
    title: `Continue agent loop ${snapshot.id}`,
    source_snapshot_id: snapshot.id,
    prompt: [
      "## Goal",
      "Continue the current coding-agent loop using the local PromptLane snapshot.",
      "",
      "## Context",
      `project: ${snapshot.cwd_label}`,
      `tool: ${snapshot.tool}`,
      `source: ${snapshot.source}`,
      snapshot.session_id ? `session: ${snapshot.session_id}` : undefined,
      snapshot.branch ? `branch: ${snapshot.branch}` : undefined,
      snapshot.worktree_label ? `worktree: ${snapshot.worktree_label}` : undefined,
      `prompt ids: ${promptIds}`,
      `average prompt score: ${average}`,
      "",
      "## Current Loop State",
      snapshot.outcome.summary,
      "",
      "## Prompt Habits To Improve",
      gaps,
      "",
      "## Scope",
      "Keep the next change tied to this loop. Do not rename packages, change agent settings, or edit instruction files unless that is the explicit task.",
      "",
      "## Verification",
      "Run the narrowest relevant test first, then the Node 22 pnpm gate when behavior changes. Report command output and remaining risk.",
      "",
      "## Output",
      "Return a short Markdown summary with changes, verification, and risks.",
    ]
      .filter((line): line is string => line !== undefined)
      .join("\n"),
    privacy: {
      local_only: true,
      returns_prompt_bodies: false,
      returns_raw_paths: false,
    },
  };
}
```

- [ ] **Step 4: Run the brief test**

Run:

```bash
PATH=/Users/jinan/.nvm/versions/node/v22.15.0/bin:$PATH corepack pnpm vitest run src/loop/brief.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit Task 2**

Run:

```bash
git add src/loop/brief.ts src/loop/brief.test.ts
git commit -m "feat: add loop continuation brief formatter"
```

## Task 3: SQLite Loop Snapshot Storage

**Files:**

- Modify: `src/storage/ports.ts`
- Modify: `src/storage/sqlite-migrations.ts`
- Modify: `src/storage/sqlite.ts`
- Modify: `src/storage/sqlite-storage.test.ts`

- [ ] **Step 1: Add failing storage integration test**

Append this test inside `describe("SQLite prompt storage", () => { ... })` in `src/storage/sqlite-storage.test.ts`:

```ts
  it("stores and reads privacy-safe loop snapshots", () => {
    const dataDir = createTempDir();
    initializePromptLane({ dataDir });
    const storage = createSqlitePromptStorage({
      dataDir,
      hmacSecret: "test-secret",
      now: () => new Date("2026-07-04T01:00:00.000Z"),
    });

    const snapshot = storage.createLoopSnapshot({
      id: "loop_storage",
      created_at: "2026-07-04T01:00:00.000Z",
      tool: "codex",
      source: "cli",
      session_id: "session-storage",
      cwd_label: "private-project",
      project_id: "proj_storage",
      git_root_hash: "git_storage",
      branch: "codex/agent-loop-memory-design",
      worktree_label: "worktree-storage",
      prompt_ids: ["prmt_one", "prmt_two"],
      event_counts: {
        prompts: 2,
      },
      quality: {
        average_prompt_score: 58,
        top_gaps: ["Goal clarity"],
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
        stores_prompt_bodies: false,
        stores_raw_paths: false,
        local_only: true,
      },
    });

    expect(snapshot.id).toBe("loop_storage");
    expect(storage.getLatestLoopSnapshot()?.id).toBe("loop_storage");
    expect(storage.listLoopSnapshots({ limit: 10 }).items).toHaveLength(1);
    expect(JSON.stringify(snapshot)).not.toContain("/Users/example");
    expect(JSON.stringify(snapshot)).not.toContain("Make this better");
    expect(storage.getAppliedMigrations()).toContainEqual({
      version: 16,
      name: "016_loop_snapshots",
    });

    storage.close();
  });
```

- [ ] **Step 2: Run failing storage test**

Run:

```bash
PATH=/Users/jinan/.nvm/versions/node/v22.15.0/bin:$PATH corepack pnpm vitest run src/storage/sqlite-storage.test.ts --testNamePattern "loop snapshots"
```

Expected: FAIL because storage has no loop snapshot methods.

- [ ] **Step 3: Extend storage port types**

In `src/storage/ports.ts`, import the loop type and add these definitions near the other storage ports:

```ts
import type { LoopSnapshot } from "../loop/types.js";
```

```ts
export type LoopSnapshotListResult = {
  items: LoopSnapshot[];
};

export type LoopSnapshotStoragePort = {
  createLoopSnapshot(input: LoopSnapshot): LoopSnapshot;
  getLatestLoopSnapshot(): LoopSnapshot | undefined;
  listLoopSnapshots(options?: { limit?: number }): LoopSnapshotListResult;
};
```

Add `LoopSnapshotStoragePort` to the `SqlitePromptStorage` intersection in `src/storage/sqlite.ts`.

- [ ] **Step 4: Add migration 16**

In `src/storage/sqlite-migrations.ts`, call `applyLoopSnapshotMigration(db)` after `applyAskEventMigration(db)`.

Add:

```ts
function applyLoopSnapshotMigration(db: Database.Database): void {
  const applied = db
    .prepare("SELECT 1 FROM schema_migrations WHERE version = ?")
    .get(16);
  if (applied) return;

  db.exec(`
    CREATE TABLE IF NOT EXISTS loop_snapshots (
      id TEXT PRIMARY KEY,
      created_at TEXT NOT NULL,
      tool TEXT NOT NULL,
      source TEXT NOT NULL,
      session_id TEXT,
      thread_id TEXT,
      cwd_label TEXT NOT NULL,
      project_id TEXT NOT NULL,
      git_root_hash TEXT,
      branch TEXT,
      worktree_label TEXT,
      prompt_ids_json TEXT NOT NULL,
      event_counts_json TEXT NOT NULL,
      quality_json TEXT NOT NULL,
      outcome_json TEXT NOT NULL,
      next_brief_json TEXT NOT NULL,
      privacy_json TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_loop_snapshots_created_at
      ON loop_snapshots(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_loop_snapshots_project_created
      ON loop_snapshots(project_id, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_loop_snapshots_session_created
      ON loop_snapshots(session_id, created_at DESC);
  `);

  db.prepare(
    "INSERT INTO schema_migrations(version, name, applied_at) VALUES (?, ?, ?)",
  ).run(16, "016_loop_snapshots", new Date().toISOString());
}
```

- [ ] **Step 5: Implement SQLite methods**

In `src/storage/sqlite.ts`, add methods to the returned object:

```ts
    createLoopSnapshot(input) {
      return createLoopSnapshot(db, input);
    },
    getLatestLoopSnapshot() {
      return getLatestLoopSnapshot(db);
    },
    listLoopSnapshots(options = {}) {
      return listLoopSnapshots(db, options);
    },
```

Add helper functions near the other storage helpers:

```ts
function createLoopSnapshot(
  db: Database.Database,
  input: LoopSnapshot,
): LoopSnapshot {
  db.prepare(
    `INSERT OR REPLACE INTO loop_snapshots (
      id,
      created_at,
      tool,
      source,
      session_id,
      thread_id,
      cwd_label,
      project_id,
      git_root_hash,
      branch,
      worktree_label,
      prompt_ids_json,
      event_counts_json,
      quality_json,
      outcome_json,
      next_brief_json,
      privacy_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    input.id,
    input.created_at,
    input.tool,
    input.source,
    input.session_id ?? null,
    input.thread_id ?? null,
    input.cwd_label,
    input.project_id,
    input.git_root_hash ?? null,
    input.branch ?? null,
    input.worktree_label ?? null,
    JSON.stringify(input.prompt_ids),
    JSON.stringify(input.event_counts),
    JSON.stringify(input.quality),
    JSON.stringify(input.outcome),
    JSON.stringify(input.next_brief),
    JSON.stringify(input.privacy),
  );

  return input;
}

function getLatestLoopSnapshot(
  db: Database.Database,
): LoopSnapshot | undefined {
  const row = db
    .prepare(
      "SELECT * FROM loop_snapshots ORDER BY created_at DESC, id DESC LIMIT 1",
    )
    .get();
  return row ? loopSnapshotFromRow(row as LoopSnapshotRow) : undefined;
}

function listLoopSnapshots(
  db: Database.Database,
  options: { limit?: number },
): LoopSnapshotListResult {
  const limit = Math.max(1, Math.min(100, Math.trunc(options.limit ?? 20)));
  const rows = db
    .prepare(
      "SELECT * FROM loop_snapshots ORDER BY created_at DESC, id DESC LIMIT ?",
    )
    .all(limit) as LoopSnapshotRow[];

  return { items: rows.map(loopSnapshotFromRow) };
}

type LoopSnapshotRow = {
  id: string;
  created_at: string;
  tool: LoopSnapshot["tool"];
  source: LoopSnapshot["source"];
  session_id: string | null;
  thread_id: string | null;
  cwd_label: string;
  project_id: string;
  git_root_hash: string | null;
  branch: string | null;
  worktree_label: string | null;
  prompt_ids_json: string;
  event_counts_json: string;
  quality_json: string;
  outcome_json: string;
  next_brief_json: string;
  privacy_json: string;
};

function loopSnapshotFromRow(row: LoopSnapshotRow): LoopSnapshot {
  return {
    id: row.id,
    created_at: row.created_at,
    tool: row.tool,
    source: row.source,
    session_id: row.session_id ?? undefined,
    thread_id: row.thread_id ?? undefined,
    cwd_label: row.cwd_label,
    project_id: row.project_id,
    git_root_hash: row.git_root_hash ?? undefined,
    branch: row.branch ?? undefined,
    worktree_label: row.worktree_label ?? undefined,
    prompt_ids: JSON.parse(row.prompt_ids_json) as string[],
    event_counts: JSON.parse(row.event_counts_json) as LoopSnapshot["event_counts"],
    quality: JSON.parse(row.quality_json) as LoopSnapshot["quality"],
    outcome: JSON.parse(row.outcome_json) as LoopSnapshot["outcome"],
    next_brief: JSON.parse(row.next_brief_json) as LoopSnapshot["next_brief"],
    privacy: JSON.parse(row.privacy_json) as LoopSnapshot["privacy"],
  };
}
```

Add the needed imports:

```ts
import type { LoopSnapshot } from "../loop/types.js";
import type {
  LoopSnapshotListResult,
  LoopSnapshotStoragePort,
} from "./ports.js";
```

If `ports.js` is already imported with a multiline `type` import, merge these names into the existing import instead of adding a duplicate.

- [ ] **Step 6: Run storage test**

Run:

```bash
PATH=/Users/jinan/.nvm/versions/node/v22.15.0/bin:$PATH corepack pnpm vitest run src/storage/sqlite-storage.test.ts --testNamePattern "loop snapshots"
```

Expected: PASS.

- [ ] **Step 7: Run full storage test**

Run:

```bash
PATH=/Users/jinan/.nvm/versions/node/v22.15.0/bin:$PATH corepack pnpm vitest run src/storage/sqlite-storage.test.ts
```

Expected: PASS. Update the first migration expectation in `sqlite-storage.test.ts` to include `{ version: 16, name: "016_loop_snapshots" }` if the initial storage test fails only because the expected migration list stops at version 15.

- [ ] **Step 8: Commit Task 3**

Run:

```bash
git add src/storage/ports.ts src/storage/sqlite-migrations.ts src/storage/sqlite.ts src/storage/sqlite-storage.test.ts
git commit -m "feat: persist loop snapshots"
```

## Task 4: Loop CLI Commands

**Files:**

- Create: `src/cli/commands/loop.ts`
- Create: `src/cli/commands/loop.test.ts`
- Modify: `src/cli/index.ts`

- [ ] **Step 1: Write failing CLI tests**

Create `src/cli/commands/loop.test.ts`:

```ts
import { mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import { normalizeClaudeCodePayload } from "../../adapters/claude-code.js";
import { initializePromptLane } from "../../config/config.js";
import { redactPrompt } from "../../redaction/redact.js";
import { createSqlitePromptStorage } from "../../storage/sqlite.js";
import { loopBriefForCli, loopCollectForCli } from "./loop.js";

const tempDirs: string[] = [];

afterEach(() => {
  while (tempDirs.length > 0) {
    const dir = tempDirs.pop();
    if (dir) rmSync(dir, { recursive: true, force: true });
  }
});

describe("loop CLI command", () => {
  it("collects a privacy-safe loop snapshot as JSON and text", async () => {
    const dataDir = createTempDir();
    await seedPrompts(dataDir);

    const json = loopCollectForCli({
      dataDir,
      json: true,
      cwdPrefix: "/Users/example/private-project",
      limit: 10,
      now: new Date("2026-07-04T01:00:00.000Z"),
      cwd: "/Users/example/private-project",
      branch: "codex/agent-loop-memory-design",
    });
    const parsed = JSON.parse(json) as {
      id: string;
      prompt_ids: string[];
      cwd_label: string;
      branch: string;
      privacy: { stores_prompt_bodies: boolean; stores_raw_paths: boolean };
    };

    expect(parsed.id).toMatch(/^loop_/);
    expect(parsed.prompt_ids).toHaveLength(2);
    expect(parsed.cwd_label).toBe("private-project");
    expect(parsed.branch).toBe("codex/agent-loop-memory-design");
    expect(parsed.privacy).toMatchObject({
      stores_prompt_bodies: false,
      stores_raw_paths: false,
    });
    expect(json).not.toContain("Make this better");
    expect(json).not.toContain("/Users/example");

    const text = loopCollectForCli({
      dataDir,
      cwdPrefix: "/Users/example/private-project",
      limit: 10,
      now: new Date("2026-07-04T01:00:00.000Z"),
      cwd: "/Users/example/private-project",
    });

    expect(text).toContain("Loop snapshot collected");
    expect(text).toContain("project private-project");
    expect(text).toContain("prompts 2");
    expect(text).toContain("Privacy: local-only");
    expect(text).not.toContain("Make this better");
    expect(text).not.toContain("/Users/example");
  });

  it("prints the latest continuation brief without prompt bodies", async () => {
    const dataDir = createTempDir();
    await seedPrompts(dataDir);
    loopCollectForCli({
      dataDir,
      cwdPrefix: "/Users/example/private-project",
      now: new Date("2026-07-04T01:00:00.000Z"),
      cwd: "/Users/example/private-project",
    });

    const text = loopBriefForCli({ dataDir });

    expect(text).toContain("Continue agent loop");
    expect(text).toContain("## Goal");
    expect(text).toContain("## Verification");
    expect(text).not.toContain("Make this better");
    expect(text).not.toContain("/Users/example");
  });
});

async function seedPrompts(dataDir: string): Promise<void> {
  const init = initializePromptLane({ dataDir });
  const storage = createSqlitePromptStorage({
    dataDir,
    hmacSecret: init.hookAuth.web_session_secret,
    now: nextDate([
      "2026-07-04T00:58:00.000Z",
      "2026-07-04T00:59:00.000Z",
    ]),
  });
  try {
    await storeClaudePrompt(storage, "Make this better", "2026-07-04T00:58:00.000Z");
    await storeClaudePrompt(
      storage,
      "Implement the loop snapshot CLI, keep scope to storage and CLI, run the focused Vitest tests, and summarize risks.",
      "2026-07-04T00:59:00.000Z",
    );
  } finally {
    storage.close();
  }
}

async function storeClaudePrompt(
  storage: ReturnType<typeof createSqlitePromptStorage>,
  prompt: string,
  receivedAt: string,
) {
  const event = normalizeClaudeCodePayload(
    {
      session_id: "session-loop-cli",
      transcript_path: "/Users/example/.claude/session.jsonl",
      cwd: "/Users/example/private-project",
      permission_mode: "default",
      hook_event_name: "UserPromptSubmit",
      prompt,
    },
    new Date(receivedAt),
  );

  await storage.storePrompt({
    event,
    redaction: redactPrompt(event.prompt, "mask"),
  });
}

function nextDate(values: string[]): () => Date {
  let index = 0;
  return () => new Date(values[Math.min(index++, values.length - 1)]!);
}

function createTempDir(): string {
  const dir = join(tmpdir(), `promptlane-loop-${crypto.randomUUID()}`);
  mkdirSync(dir, { recursive: true });
  tempDirs.push(dir);
  return dir;
}
```

If `crypto.randomUUID()` is not available as a global in the test type environment, import `randomUUID` from `node:crypto` and use that instead.

- [ ] **Step 2: Run failing CLI tests**

Run:

```bash
PATH=/Users/jinan/.nvm/versions/node/v22.15.0/bin:$PATH corepack pnpm vitest run src/cli/commands/loop.test.ts
```

Expected: FAIL because `src/cli/commands/loop.ts` does not exist.

- [ ] **Step 3: Implement loop command**

Create `src/cli/commands/loop.ts`:

```ts
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { basename } from "node:path";

import type { Command } from "commander";

import { createLoopBrief } from "../../loop/brief.js";
import { createLoopSnapshotFromPrompts } from "../../loop/snapshot.js";
import { loadHookAuth, loadPromptLaneConfig } from "../../config/config.js";
import { createSqlitePromptStorage } from "../../storage/sqlite.js";
import { createProjectKey } from "../../storage/project-id.js";
import { projectLabel } from "../../storage/project-label.js";
import { UserError } from "../user-error.js";

type LoopCliOptions = {
  branch?: string;
  cwd?: string;
  cwdPrefix?: string;
  dataDir?: string;
  json?: boolean;
  limit?: string | number;
  now?: Date;
  worktree?: string;
};

export function registerLoopCommand(program: Command): void {
  const loop = program
    .command("loop")
    .description("Collect and brief local agent loop snapshots.");

  loop
    .command("collect")
    .description("Collect a privacy-safe snapshot from recent prompt metadata.")
    .option("--data-dir <path>", "Override the promptlane data directory.")
    .option("--json", "Print JSON.")
    .option("--limit <count>", "Maximum recent prompts to include.")
    .option("--cwd-prefix <path>", "Only include prompts from this project/path.")
    .option("--branch <name>", "Git branch label to attach to the snapshot.")
    .option("--worktree <name>", "Worktree label to attach to the snapshot.")
    .action((options: LoopCliOptions) => {
      console.log(loopCollectForCli(options));
    });

  loop
    .command("brief")
    .description("Print a continuation prompt from the latest loop snapshot.")
    .option("--data-dir <path>", "Override the promptlane data directory.")
    .option("--json", "Print JSON.")
    .action((options: LoopCliOptions) => {
      console.log(loopBriefForCli(options));
    });
}

export function loopCollectForCli(options: LoopCliOptions = {}): string {
  return withStorage(options.dataDir, (storage, hmacSecret) => {
    const cwd = options.cwd ?? process.cwd();
    const cwdPrefix = options.cwdPrefix ?? cwd;
    const prompts = storage.listPrompts({
      cwdPrefix,
      limit: parseLimit(options.limit),
    }).items;
    const snapshot = createLoopSnapshotFromPrompts({
      now: options.now ?? new Date(),
      source: "cli",
      prompts,
      project: {
        cwdLabel: projectLabel(cwdPrefix),
        projectId: createProjectKey(cwdPrefix, hmacSecret),
        gitRootHash: hashGitRoot(cwd),
        branch: options.branch ?? readGitBranch(cwd),
        worktreeLabel: options.worktree,
      },
    });
    const stored = storage.createLoopSnapshot(snapshot);

    return options.json
      ? JSON.stringify(stored, null, 2)
      : formatLoopSnapshot(stored);
  });
}

export function loopBriefForCli(options: LoopCliOptions = {}): string {
  return withStorage(options.dataDir, (storage) => {
    const snapshot = storage.getLatestLoopSnapshot();
    if (!snapshot) {
      throw new UserError(
        "No loop snapshot found. Run `promptlane loop collect` first.",
      );
    }
    const brief = createLoopBrief({ snapshot });
    return options.json ? JSON.stringify(brief, null, 2) : brief.prompt;
  });
}

function withStorage<T>(
  dataDir: string | undefined,
  callback: (
    storage: ReturnType<typeof createSqlitePromptStorage>,
    hmacSecret: string,
  ) => T,
): T {
  const config = loadPromptLaneConfig(dataDir);
  const auth = loadHookAuth(dataDir);
  const storage = createSqlitePromptStorage({
    dataDir: config.data_dir,
    hmacSecret: auth.web_session_secret,
  });
  try {
    return callback(storage, auth.web_session_secret);
  } finally {
    storage.close();
  }
}

function parseLimit(value: string | number | undefined): number {
  if (value === undefined) return 20;
  const parsed = typeof value === "number" ? value : Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new UserError("--limit must be a positive integer.");
  }
  return Math.min(parsed, 100);
}

function formatLoopSnapshot(snapshot: ReturnType<typeof createLoopSnapshotFromPrompts>): string {
  return [
    "Loop snapshot collected",
    `id ${snapshot.id}`,
    `project ${snapshot.cwd_label}`,
    `tool ${snapshot.tool}`,
    `prompts ${snapshot.event_counts.prompts}`,
    snapshot.quality.average_prompt_score === undefined
      ? "average prompt score n/a"
      : `average prompt score ${snapshot.quality.average_prompt_score}/100`,
    snapshot.quality.top_gaps.length > 0
      ? `top gaps ${snapshot.quality.top_gaps.join(", ")}`
      : "top gaps none",
    "",
    "Next: promptlane loop brief",
    "",
    "Privacy: local-only, no prompt bodies, no raw paths.",
  ].join("\n");
}

function readGitBranch(cwd: string): string | undefined {
  try {
    const output = execFileSync("git", ["branch", "--show-current"], {
      cwd,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    return output || undefined;
  } catch {
    return undefined;
  }
}

function hashGitRoot(cwd: string): string | undefined {
  try {
    const root = execFileSync("git", ["rev-parse", "--show-toplevel"], {
      cwd,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    return `git_${createHash("sha256").update(root).digest("hex").slice(0, 16)}`;
  } catch {
    return undefined;
  }
}
```

If `basename` is unused, remove it from the import.

- [ ] **Step 4: Register the command**

In `src/cli/index.ts`, add:

```ts
import { registerLoopCommand } from "./commands/loop.js";
```

Register it near the other CLI commands:

```ts
  registerLoopCommand(program);
```

- [ ] **Step 5: Run CLI tests**

Run:

```bash
PATH=/Users/jinan/.nvm/versions/node/v22.15.0/bin:$PATH corepack pnpm vitest run src/cli/commands/loop.test.ts
```

Expected: PASS.

- [ ] **Step 6: Run CLI type check**

Run:

```bash
PATH=/Users/jinan/.nvm/versions/node/v22.15.0/bin:$PATH corepack pnpm lint:types
```

Expected: PASS. If it fails on import ordering, unused imports, or line width, fix only those issues.

- [ ] **Step 7: Commit Task 4**

Run:

```bash
git add src/cli/commands/loop.ts src/cli/commands/loop.test.ts src/cli/index.ts
git commit -m "feat: add loop snapshot CLI"
```

## Task 5: Architecture Documentation

**Files:**

- Modify: `docs/ARCHITECTURE.md`
- Modify: `tasks/todo.md`

- [ ] **Step 1: Update architecture docs**

In `docs/ARCHITECTURE.md`, update the module tree to include:

```text
  loop/        loop snapshots, continuation briefs, and local agent-loop summaries
```

Add this paragraph under Module Boundaries:

```md
`src/loop/` owns privacy-safe loop snapshot and continuation brief domain logic.
It may consume prompt summaries and storage ports, but it must not read raw
transcripts, provider credentials, or private agent state databases. CLI, MCP,
hook, and web surfaces should call into `src/loop/` instead of formatting loop
state independently.
```

- [ ] **Step 2: Update task checklist**

In `tasks/todo.md`, add a new implementation section:

```md
## 2026-07-04 Loop Snapshot CLI

- [x] Loop snapshot domain model and privacy tests
- [x] Continuation brief formatter
- [x] SQLite loop snapshot storage
- [x] `promptlane loop collect` and `promptlane loop brief`
- [x] Architecture documentation and focused verification

### 판단 기준

- Snapshot과 brief는 prompt body, raw path, token을 반환하지 않는다.
- 첫 slice는 CLI/storage/domain만 다루고 hook, MCP, web, package rename은 건드리지 않는다.
- Node 22 + pnpm 10 기준 focused tests와 전체 test를 통과해야 한다.
```

- [ ] **Step 3: Run docs/check validation**

Run:

```bash
git diff --check
```

Expected: PASS.

- [ ] **Step 4: Commit Task 5**

Run:

```bash
git add docs/ARCHITECTURE.md tasks/todo.md
git commit -m "docs: document loop snapshot boundary"
```

## Task 6: Final Verification And PR Update

**Files:**

- No additional source files.

- [ ] **Step 1: Run focused loop tests**

Run:

```bash
PATH=/Users/jinan/.nvm/versions/node/v22.15.0/bin:$PATH corepack pnpm vitest run src/loop/snapshot.test.ts src/loop/brief.test.ts src/cli/commands/loop.test.ts
```

Expected: PASS.

- [ ] **Step 2: Run storage regression**

Run:

```bash
PATH=/Users/jinan/.nvm/versions/node/v22.15.0/bin:$PATH corepack pnpm vitest run src/storage/sqlite-storage.test.ts
```

Expected: PASS.

- [ ] **Step 3: Run full tests**

Run:

```bash
PATH=/Users/jinan/.nvm/versions/node/v22.15.0/bin:$PATH corepack pnpm test
```

Expected: PASS with all test files passing.

- [ ] **Step 4: Run lint and diff check**

Run:

```bash
PATH=/Users/jinan/.nvm/versions/node/v22.15.0/bin:$PATH corepack pnpm lint
git diff --check
```

Expected: both pass.

- [ ] **Step 5: Push**

Run:

```bash
git status --short
git push
```

Expected: branch `codex/agent-loop-memory-design` updates on origin.

- [ ] **Step 6: Update PR body**

Run:

```bash
gh pr edit 280 --repo wlsdks/promptlane --body-file /tmp/promptlane-pr-body.md
```

Use this PR body:

```md
## Summary
- Adds the PromptLane product direction and agent loop memory design.
- Implements the first CLI/storage/domain slice for privacy-safe loop snapshots.
- Adds `promptlane loop collect` and `promptlane loop brief` without renaming the package, CLI, hooks, MCP tools, or web UI.

## Verification
- PATH=/Users/jinan/.nvm/versions/node/v22.15.0/bin:$PATH corepack pnpm vitest run src/loop/snapshot.test.ts src/loop/brief.test.ts src/cli/commands/loop.test.ts
- PATH=/Users/jinan/.nvm/versions/node/v22.15.0/bin:$PATH corepack pnpm vitest run src/storage/sqlite-storage.test.ts
- PATH=/Users/jinan/.nvm/versions/node/v22.15.0/bin:$PATH corepack pnpm test
- PATH=/Users/jinan/.nvm/versions/node/v22.15.0/bin:$PATH corepack pnpm lint
- git diff --check

## Notes
- Brand/repository rename remains a separate migration.
- MCP, hooks, and web loop views are planned follow-up slices.
```

## Self-Review Checklist

Before marking implementation complete:

- Every new user-facing output says no prompt bodies and no raw paths.
- No new code reads Codex/Claude private transcript databases.
- No automatic prompt submission is added.
- Existing prompt archive behavior remains unchanged.
- `promptlane` command remains the public command.
- PR does not stage `.codex/`.
