# Loop Status Model Commonization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make CLI, MCP, server API, and web PromptLane status surfaces share one privacy-safe loop status model instead of each surface rebuilding snapshot readiness logic.

**Architecture:** Add a pure `src/loop/status.ts` model that accepts already-loaded loop snapshots and compact boundaries, returns a raw-free `PromptLaneStatus`, and exposes a safe snapshot summary mapper. CLI `loop status`, MCP `get_promptlane_status`, and `/api/v1/loops` will call the same model; the web view will consume the server-provided status instead of inferring readiness from list length.

**Tech Stack:** TypeScript, Node.js, Commander CLI, Fastify routes, React web client, Vitest, SQLite storage ports.

---

## File Structure

- Create `src/loop/status.ts`: pure PromptLane status model, privacy contract, safe snapshot summary mapper, next-action decision.
- Create `src/loop/status.test.ts`: model-level tests for ready, empty, compact refresh, include-latest behavior, and raw-value exclusion.
- Modify `src/cli/commands/loop.ts`: replace local `createLoopStatus` and `toSafeLoopStatusSnapshot` with the shared model.
- Modify `src/cli/commands/loop.test.ts`: keep existing behavior and add JSON assertion proving CLI uses the shared status shape.
- Modify `src/mcp/loop-tool.ts`: replace inline status building with the shared model.
- Modify `src/mcp/loop-tool-types.ts`: make MCP status result align with the shared model while keeping MCP `available_tools`.
- Modify `src/mcp/loop-tool.test.ts`: assert compact refresh and next actions still match the shared model.
- Modify `src/server/routes/loops.ts`: include `status` in `/api/v1/loops` response and use the shared snapshot mapper for list items.
- Modify `src/server/create-server.test.ts`: assert `/api/v1/loops` returns the shared status plus list items without prompt bodies, compact summaries, or raw paths.
- Modify `src/web/src/api.ts`: add `status` to `LoopListResponse`.
- Modify `src/web/src/api.test.ts`: assert client preserves the status object returned by the API.
- Modify `src/web/src/loops-view.tsx`: render the server-provided status and next action in the Loops view header.
- Modify `src/web/src/loops-view.test.tsx`: assert ready/empty status rendering and privacy-safe copy.
- Modify `tasks/todo.md`: mark the RED/GREEN tasks as work progresses.

## Task 1: Shared Status Model

**Files:**
- Create: `src/loop/status.ts`
- Test: `src/loop/status.test.ts`

- [ ] **Step 1: Write the failing model tests**

Add `src/loop/status.test.ts`:

```typescript
import { describe, expect, it } from "vitest";

import type { CompactBoundaryRow } from "../storage/ports.js";
import type { LoopSnapshot } from "./types.js";
import { createPromptLaneStatus } from "./status.js";

describe("createPromptLaneStatus", () => {
  it("returns ready status with a safe latest snapshot and compact refresh action", () => {
    const status = createPromptLaneStatus({
      snapshots: [loopSnapshot()],
      compactBoundaries: [compactBoundary()],
    });
    const serialized = JSON.stringify(status);

    expect(status).toMatchObject({
      status: "ready",
      snapshot_count: 1,
      latest_snapshot: {
        id: "loop_status",
        project: "private-project",
        prompt_count: 2,
        average_prompt_score: 58,
      },
      latest_compact_boundary: {
        event_name: "PostCompact",
        trigger: "auto",
        after_latest_snapshot: true,
      },
      next_action: "promptlane loop collect",
      next_actions: expect.arrayContaining([
        expect.stringContaining("promptlane loop collect"),
      ]),
      privacy: {
        local_only: true,
        external_calls: false,
        returns_prompt_bodies: false,
        returns_raw_paths: false,
        returns_compact_content: false,
      },
    });
    expect(serialized).not.toContain("Make this better");
    expect(serialized).not.toContain("Compact summary with sk-proj-secret");
    expect(serialized).not.toContain("/Users/example");
  });

  it("returns empty guidance without a latest snapshot", () => {
    const status = createPromptLaneStatus({
      snapshots: [],
      compactBoundaries: [],
    });

    expect(status).toMatchObject({
      status: "empty",
      snapshot_count: 0,
      latest_snapshot: undefined,
      next_action: "promptlane loop collect",
      next_actions: expect.arrayContaining([
        expect.stringContaining("promptlane loop collect"),
      ]),
    });
  });

  it("can hide latest snapshot details while preserving counts and actions", () => {
    const status = createPromptLaneStatus({
      snapshots: [loopSnapshot()],
      compactBoundaries: [],
      includeLatest: false,
    });

    expect(status.status).toBe("ready");
    expect(status.snapshot_count).toBe(1);
    expect(status.latest_snapshot).toBeUndefined();
    expect(status.next_action).toBe("promptlane loop brief");
  });
});

function loopSnapshot(): LoopSnapshot {
  return {
    id: "loop_status",
    created_at: "2026-07-04T01:00:00.000Z",
    tool: "codex",
    source: "cli",
    cwd_label: "private-project",
    project_id: "proj_private",
    prompt_ids: ["prmt_one", "prmt_two"],
    event_counts: { prompts: 2 },
    quality: {
      average_prompt_score: 58,
      top_gaps: ["Missing verification"],
    },
    outcome: {
      status: "passed",
      summary: "Safe summary only",
      evidence_refs: ["pnpm test"],
    },
    next_brief: {
      title: "Continue loop",
      body: "Use safe summary",
    },
    privacy: {
      prompt_bodies_stored: false,
      raw_paths_stored: false,
    },
  };
}

function compactBoundary(): CompactBoundaryRow {
  return {
    id: "cmp_status",
    created_at: "2026-07-04T01:05:00.000Z",
    tool: "claude-code",
    event_name: "PostCompact",
    trigger: "auto",
    project_id: "proj_private",
    content_hash: "hash_only",
    metadata: {
      summary: "Compact summary with sk-proj-secret in /Users/example/private-project",
    },
  };
}
```

- [ ] **Step 2: Run the model test and verify RED**

Run:

```bash
PATH=/Users/jinan/.nvm/versions/node/v22.15.0/bin:$PATH corepack pnpm vitest run src/loop/status.test.ts
```

Expected: FAIL because `src/loop/status.ts` does not exist.

- [ ] **Step 3: Implement the minimal shared model**

Create `src/loop/status.ts`:

```typescript
import { latestCompactBoundaryAfterSnapshot } from "./brief.js";
import type { LoopBriefCompactBoundary } from "./brief.js";
import type { LoopSnapshot } from "./types.js";

export type PromptLaneStatusLevel = "ready" | "empty";

export type PromptLaneStatusPrivacy = {
  local_only: true;
  external_calls: false;
  returns_prompt_bodies: false;
  returns_raw_paths: false;
  returns_compact_content: false;
};

export type PromptLaneStatusSnapshot = {
  id: string;
  created_at: string;
  tool: string;
  source: string;
  project: string;
  branch?: string;
  worktree?: string;
  prompt_count: number;
  average_prompt_score?: number;
  top_gaps: string[];
  outcome_status: LoopSnapshot["outcome"]["status"];
};

export type PromptLaneStatus = {
  status: PromptLaneStatusLevel;
  snapshot_count: number;
  latest_snapshot?: PromptLaneStatusSnapshot;
  latest_compact_boundary?: LoopBriefCompactBoundary;
  next_action: string;
  next_actions: string[];
  privacy: PromptLaneStatusPrivacy;
};

type CompactBoundaryCandidate = Parameters<
  typeof latestCompactBoundaryAfterSnapshot
>[1][number];

export function createPromptLaneStatus(input: {
  snapshots: readonly LoopSnapshot[];
  compactBoundaries: readonly CompactBoundaryCandidate[];
  includeLatest?: boolean;
}): PromptLaneStatus {
  const latest = input.snapshots.at(0);
  const compactBoundary = latest
    ? latestCompactBoundaryAfterSnapshot(latest, input.compactBoundaries)
    : undefined;
  const hasSnapshots = input.snapshots.length > 0;
  const nextAction = compactBoundary
    ? "promptlane loop collect"
    : hasSnapshots
      ? "promptlane loop brief"
      : "promptlane loop collect";

  return {
    status: hasSnapshots ? "ready" : "empty",
    snapshot_count: input.snapshots.length,
    ...(latest && input.includeLatest !== false
      ? { latest_snapshot: toPromptLaneStatusSnapshot(latest) }
      : {}),
    ...(compactBoundary ? { latest_compact_boundary: compactBoundary } : {}),
    next_action: nextAction,
    next_actions: nextActionsForStatus({ hasSnapshots, compactBoundary }),
    privacy: promptlaneStatusPrivacy(),
  };
}

export function toPromptLaneStatusSnapshot(
  snapshot: LoopSnapshot,
): PromptLaneStatusSnapshot {
  return {
    id: snapshot.id,
    created_at: snapshot.created_at,
    tool: snapshot.tool,
    source: snapshot.source,
    project: snapshot.cwd_label,
    ...(snapshot.branch ? { branch: snapshot.branch } : {}),
    ...(snapshot.worktree_label ? { worktree: snapshot.worktree_label } : {}),
    prompt_count: snapshot.event_counts.prompts,
    ...(snapshot.quality.average_prompt_score === undefined
      ? {}
      : { average_prompt_score: snapshot.quality.average_prompt_score }),
    top_gaps: snapshot.quality.top_gaps,
    outcome_status: snapshot.outcome.status,
  };
}

export function promptlaneStatusPrivacy(): PromptLaneStatusPrivacy {
  return {
    local_only: true,
    external_calls: false,
    returns_prompt_bodies: false,
    returns_raw_paths: false,
    returns_compact_content: false,
  };
}

function nextActionsForStatus(input: {
  hasSnapshots: boolean;
  compactBoundary?: LoopBriefCompactBoundary;
}): string[] {
  if (!input.hasSnapshots) {
    return [
      "Run promptlane loop collect to create the first local loop snapshot.",
      "Capture at least one Claude Code or Codex prompt before expecting useful loop context.",
    ];
  }

  if (input.compactBoundary) {
    return [
      "Run promptlane loop collect again after compaction to refresh the snapshot.",
      "Then use promptlane loop brief or prepare_loop_brief for a continuation prompt.",
    ];
  }

  return [
    "Use promptlane loop brief or prepare_loop_brief to get a copy-ready continuation prompt.",
    "Run promptlane loop collect again after the next agent turn to refresh the snapshot.",
  ];
}
```

- [ ] **Step 4: Run the model test and verify GREEN**

Run:

```bash
PATH=/Users/jinan/.nvm/versions/node/v22.15.0/bin:$PATH corepack pnpm vitest run src/loop/status.test.ts
```

Expected: PASS.

## Task 2: CLI Uses Shared Status

**Files:**
- Modify: `src/cli/commands/loop.ts`
- Modify: `src/cli/commands/loop.test.ts`

- [ ] **Step 1: Write the failing CLI JSON assertion**

In `src/cli/commands/loop.test.ts`, extend the compact-aware status test after the text assertions:

```typescript
const json = loopStatusForCli({ dataDir, json: true });
const parsed = JSON.parse(json) as {
  latest_snapshot?: { outcome_status?: string };
  next_actions?: string[];
  privacy?: { returns_compact_content?: boolean };
};

expect(parsed.latest_snapshot?.outcome_status).toBe("unknown");
expect(parsed.next_actions).toEqual(
  expect.arrayContaining([expect.stringContaining("promptlane loop collect")]),
);
expect(parsed.privacy?.returns_compact_content).toBe(false);
```

- [ ] **Step 2: Run the CLI status test and verify RED**

Run:

```bash
PATH=/Users/jinan/.nvm/versions/node/v22.15.0/bin:$PATH corepack pnpm vitest run src/cli/commands/loop.test.ts --testNamePattern "compact-aware loop status"
```

Expected: FAIL because the current local CLI status shape lacks `next_actions`, `outcome_status`, or `returns_compact_content`.

- [ ] **Step 3: Refactor CLI status to the shared model**

In `src/cli/commands/loop.ts`:

1. Import:

```typescript
import { createPromptLaneStatus } from "../../loop/status.js";
import type { PromptLaneStatus } from "../../loop/status.js";
```

2. Change `loopStatusForCli` to call `createPromptLaneStatus`:

```typescript
export function loopStatusForCli(options: LoopCliOptions = {}): string {
  return withStorage(options.dataDir, (storage) => {
    const status = createPromptLaneStatus({
      snapshots: storage.listLoopSnapshots({ limit: 100 }).items,
      compactBoundaries: storage.listCompactBoundaries({ limit: 20 }).items,
    });

    return options.json ? JSON.stringify(status, null, 2) : formatLoopStatus(status);
  });
}
```

3. Change formatter signature:

```typescript
function formatLoopStatus(status: PromptLaneStatus): string {
```

4. Delete the local `createLoopStatus` and `toSafeLoopStatusSnapshot` functions.

- [ ] **Step 4: Run the CLI status test and verify GREEN**

Run:

```bash
PATH=/Users/jinan/.nvm/versions/node/v22.15.0/bin:$PATH corepack pnpm vitest run src/cli/commands/loop.test.ts --testNamePattern "compact-aware loop status|empty loop status"
```

Expected: PASS.

## Task 3: MCP Uses Shared Status

**Files:**
- Modify: `src/mcp/loop-tool.ts`
- Modify: `src/mcp/loop-tool-types.ts`
- Modify: `src/mcp/loop-tool.test.ts`

- [ ] **Step 1: Write the failing MCP shared-shape assertion**

In `src/mcp/loop-tool.test.ts`, extend `returns latest loop status without prompt bodies or raw paths`:

```typescript
expect(result).toMatchObject({
  latest_snapshot: {
    outcome_status: "unknown",
  },
  next_action: "promptlane loop brief",
  privacy: {
    returns_compact_content: false,
  },
});
```

- [ ] **Step 2: Run the MCP status test and verify RED**

Run:

```bash
PATH=/Users/jinan/.nvm/versions/node/v22.15.0/bin:$PATH corepack pnpm vitest run src/mcp/loop-tool.test.ts --testNamePattern "returns latest loop status"
```

Expected: FAIL because the MCP result does not yet include the shared model fields.

- [ ] **Step 3: Refactor MCP status to the shared model**

In `src/mcp/loop-tool-types.ts`, import and reuse the shared type:

```typescript
import type { PromptLaneStatus } from "../loop/status.js";
```

Define:

```typescript
export type GetPromptLaneStatusToolResult = PromptLaneStatus & {
  available_tools: string[];
};
```

In `src/mcp/loop-tool.ts`, import `createPromptLaneStatus` and replace the status object construction:

```typescript
const status = createPromptLaneStatus({
  snapshots,
  compactBoundaries: storage.listCompactBoundaries({ limit: 20 }).items,
  includeLatest: args.include_latest !== false,
});

return {
  ...status,
  available_tools: LOOP_TOOL_NAMES,
};
```

Keep the `catch` branch as a `setup_needed` MCP-specific result only if TypeScript requires it. If so, extend the shared type union in `loop-tool-types.ts` with:

```typescript
| {
    status: "setup_needed";
    snapshot_count: 0;
    available_tools: string[];
    next_action: string;
    next_actions: string[];
    privacy: PromptLaneStatus["privacy"];
  }
```

- [ ] **Step 4: Run MCP tests and verify GREEN**

Run:

```bash
PATH=/Users/jinan/.nvm/versions/node/v22.15.0/bin:$PATH corepack pnpm vitest run src/mcp/loop-tool.test.ts
```

Expected: PASS.

## Task 4: Server API And Web Consume Shared Status

**Files:**
- Modify: `src/server/routes/loops.ts`
- Modify: `src/server/create-server.test.ts`
- Modify: `src/web/src/api.ts`
- Modify: `src/web/src/api.test.ts`
- Modify: `src/web/src/loops-view.tsx`
- Modify: `src/web/src/loops-view.test.tsx`

- [ ] **Step 1: Write failing API/web assertions**

In `src/server/create-server.test.ts`, extend the `/api/v1/loops` test to assert:

```typescript
expect(body.data.status).toMatchObject({
  status: "ready",
  snapshot_count: 1,
  latest_snapshot: {
    id: "loop_web",
    outcome_status: "unknown",
  },
  privacy: {
    returns_prompt_bodies: false,
    returns_raw_paths: false,
    returns_compact_content: false,
  },
});
```

In `src/web/src/api.test.ts`, update the mocked `/api/v1/loops` response to include `status` and assert `loops.status.status === "ready"`.

In `src/web/src/loops-view.test.tsx`, add a render assertion:

```typescript
expect(screen.getByText("PromptLane status ready")).toBeInTheDocument();
expect(screen.getByText("Next: promptlane loop brief")).toBeInTheDocument();
```

- [ ] **Step 2: Run focused API/web tests and verify RED**

Run:

```bash
PATH=/Users/jinan/.nvm/versions/node/v22.15.0/bin:$PATH corepack pnpm vitest run src/server/create-server.test.ts src/web/src/api.test.ts src/web/src/loops-view.test.tsx --testNamePattern "loops|PromptLane status"
```

Expected: FAIL because `/api/v1/loops` does not yet include `status`.

- [ ] **Step 3: Refactor API to return shared status**

In `src/server/routes/loops.ts`, import:

```typescript
import {
  createPromptLaneStatus,
  toPromptLaneStatusSnapshot,
} from "../../loop/status.js";
```

Build once:

```typescript
const snapshots = options.storage.listLoopSnapshots?.({ limit: 100 }).items ?? [];
const boundaries =
  options.storage.listCompactBoundaries?.({ limit: 100 }).items ?? [];
const status = createPromptLaneStatus({
  snapshots,
  compactBoundaries: boundaries,
});
```

Return:

```typescript
data: {
  status,
  items: snapshots.map((snapshot) => ({
    ...toPromptLaneStatusSnapshot(snapshot),
    compact_boundary: latestCompactBoundaryAfterSnapshot(snapshot, boundaries),
  })),
}
```

- [ ] **Step 4: Update web types and view rendering**

In `src/web/src/api.ts`, update `LoopListResponse`:

```typescript
status: {
  status: "ready" | "empty";
  snapshot_count: number;
  latest_snapshot?: LoopSummary;
  latest_compact_boundary?: LoopSummary["compact_boundary"];
  next_action: string;
  next_actions: string[];
  privacy: {
    local_only: true;
    external_calls: false;
    returns_prompt_bodies: false;
    returns_raw_paths: false;
    returns_compact_content: false;
  };
};
```

In `src/web/src/loops-view.tsx`, render near the header:

```tsx
<p className="loops-view__status">
  PromptLane status {loops.status.status}
</p>
<p className="loops-view__next">Next: {loops.status.next_action}</p>
```

Use existing CSS classes or add component-owned classes only in `src/web/src/loops-view.css` if spacing breaks.

- [ ] **Step 5: Run focused API/web tests and verify GREEN**

Run:

```bash
PATH=/Users/jinan/.nvm/versions/node/v22.15.0/bin:$PATH corepack pnpm vitest run src/server/create-server.test.ts src/web/src/api.test.ts src/web/src/loops-view.test.tsx --testNamePattern "loops|PromptLane status"
```

Expected: PASS.

## Task 5: Documentation, Todo, And Full Gate

**Files:**
- Modify: `tasks/todo.md`
- Modify: `docs/superpowers/specs/2026-07-04-agent-loop-memory-design.md`

- [ ] **Step 1: Update progress docs**

In `tasks/todo.md`, add:

```markdown
- [x] Task 14 RED: CLI/MCP/API/web loop status surfaces expose drift because status shape is not shared
- [x] Task 14 GREEN: `src/loop/status.ts` shared model powers CLI `loop status`, MCP `get_promptlane_status`, `/api/v1/loops`, and web Loops status header
- [ ] 다음 slice: package/CLI alias migration plan 또는 loop memory in continuation brief
```

In the spec, update the implemented surface list to mention the shared status model after Task 14 lands.

- [ ] **Step 2: Run the full verification gate**

Run:

```bash
PATH=/Users/jinan/.nvm/versions/node/v22.15.0/bin:$PATH corepack pnpm test
PATH=/Users/jinan/.nvm/versions/node/v22.15.0/bin:$PATH corepack pnpm lint
PATH=/Users/jinan/.nvm/versions/node/v22.15.0/bin:$PATH corepack pnpm build
PATH=/Users/jinan/.nvm/versions/node/v22.15.0/bin:$PATH corepack pnpm pack:dry-run
git diff --check
```

Expected: all PASS. `pack:dry-run` may print existing npm unknown env config warnings; treat warnings separately from failures.

- [ ] **Step 3: Commit and push**

Run:

```bash
git add src/loop/status.ts src/loop/status.test.ts src/cli/commands/loop.ts src/cli/commands/loop.test.ts src/mcp/loop-tool.ts src/mcp/loop-tool-types.ts src/mcp/loop-tool.test.ts src/server/routes/loops.ts src/server/create-server.test.ts src/web/src/api.ts src/web/src/api.test.ts src/web/src/loops-view.tsx src/web/src/loops-view.test.tsx tasks/todo.md docs/superpowers/specs/2026-07-04-agent-loop-memory-design.md
git commit -m "feat: share loop status model across surfaces"
git push origin codex/agent-loop-memory-design
```

Expected: branch pushes to `wlsdks/promptlane`.

## Self-Review

- Spec coverage: This plan implements the current next slice from `tasks/todo.md`: CLI/MCP/web status model commonization. It preserves the privacy/local-first boundary and does not attempt package or CLI alias migration.
- Placeholder scan: No TBD/TODO placeholders remain; every step has exact files, code shape, and commands.
- Type consistency: The shared model exposes `PromptLaneStatus`, `PromptLaneStatusSnapshot`, and `PromptLaneStatusPrivacy`; CLI, MCP, API, and web consume those names consistently.
- Scope check: The plan intentionally does not add vector memory, hidden automation, full trace ingestion, package rename, or new provider integrations.
