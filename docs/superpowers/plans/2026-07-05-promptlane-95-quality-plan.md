# PromptLane 9.5 Quality Plan Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Raise PromptLane from pre-release beta evidence to a 9.5/10 local-first prompt improvement and agent-loop memory workbench.

**Architecture:** Treat 9.5 as a proof standard, not a slogan. Each score axis must have a measurable bar, current evidence, missing evidence, and one or more TDD slices that close the gap without changing the trust model. Keep `PromptLane` as product name and `prompt-coach` as runtime compatibility id until a dedicated migration proves otherwise.

**Tech Stack:** TypeScript, Node.js, Commander CLI, Fastify, SQLite, React/Vite, Vitest, Playwright, pnpm, GitHub Actions, Codex and Claude Code hooks/MCP/plugin surfaces.

---

## 9.5 Scorecard

| Axis | Current level after latest evidence | 9.5 bar | Evidence that must exist |
| --- | --- | --- | --- |
| Product planning and positioning | 9.0/10 | 9.5 bar: every active first-screen surface, plugin surface, README path, and backlog slice says PromptLane is prompt improvement first, loop-aware continuation second, with no product-facing Loopdeck drift. | Packaging guard, README/plugin metadata, repo metadata, docs/PROMPTLANE.md, docs/NEXT_BACKLOG.md, goal audit. |
| Local-first privacy boundary | 9.0/10 | 9.5 bar: every hook, MCP, CLI, server, web, export, loop, and dogfood path proves no prompt body, raw path, provider credential, transcript body, compact summary, or external provider call leaks outside the allowed storage layer. | Focused privacy tests, raw-free fixtures, dogfood:first-coach-loop, dogfood:loop-memory-approval, smoke:mcp-coach-loop, browser E2E, release smoke. |
| Codex and Claude Code integration | 9.0/10 | 9.5 bar: setup, doctor, hook capture, MCP registration, plugin install guidance, slash commands, statusline, and recovery copy are all verified for both tools in isolated smoke and at least one real operator dogfood pass. | smoke:agent-setup, smoke:hooks, dogfood:first-coach-loop, docs/DOGFOOD_CODEX_CLAUDE_2026-07-05.md, AGENT-HARNESS. |
| Setup, doctor, and MCP smoke | 9.0/10 | 9.5 bar: setup and doctor smoke proves capture readiness; MCP smoke proves score/improve/clarify/record loop; failure states produce raw-free recovery actions instead of generic errors. | smoke:agent-setup, smoke:mcp-coach-loop, storage_unavailable tests, package checks. |
| Loop memory and continuation | 9.0/10 | 9.5 bar: collect, brief, outcome, memory candidate, memory approval, instruction patch proposal, and apply gate are proven through CLI and MCP with evidence-first rules and no automatic instruction writes. | Loop unit tests, storage evidence guards, dogfood:first-coach-loop, dogfood:loop-memory-approval. |
| Web UI and operational evidence | 8.0/10 | 9.5 bar: archive, detail, coach, saved draft reuse, settings, loops, exports, projects, and mobile layout have screenshots or browser assertions, plus scheduled `ui-patrol` artifact evidence. | corepack pnpm ui-patrol, workflow_dispatch run `28717406758`, scheduled `ui-patrol`, browser E2E, screenshot artifacts, in-app Browser audit. |
| Release stability | 9.0/10 | 9.5 bar: Node 22 and 24 CI, pack dry-run, release smoke, first coach loop dogfood, package contents, dependency audit, and release checklist all agree on shipped files and commands. | GitHub Actions, corepack pnpm pack:dry-run, smoke:release, dogfood:first-coach-loop, dogfood:loop-memory-approval, docs/RELEASE_CHECKLIST.md. |

## Evidence Progress Ledger

- PR #415 shipped this 9.5 quality plan and package/backlog guards.
- PR #417 added `dogfood:loop-memory-approval`, proving Codex hook capture,
  loop snapshot collection, MCP `record_loop_outcome`,
  `propose_loop_memory_candidate`, `record_loop_memory`, and
  `propose_instruction_patch` in an isolated local dogfood.
- PR #419 added `docs/DOGFOOD_CODEX_CLAUDE_2026-07-05.md`, recording repeatable
  Codex and Claude Code dogfood evidence for `smoke:agent-setup`,
  `smoke:hooks`, `smoke:mcp-coach-loop`, `dogfood:first-coach-loop`, and
  `dogfood:loop-memory-approval`.
- PR #421 recorded the current `ui-patrol` operational evidence: GitHub
  workflow_dispatch run `28717406758` still has a non-expired
  `ui-patrol-screenshots` artifact with 9 png files, but the latest workflow
  history has no `schedule` event.
- PR #429 added `dogfood:web-user-flow`, providing repeatable fresh web
  user-flow evidence for archive, detail, dashboard, coach, projects, mcp,
  exports, settings, and mobile flows through
  `docs/DOGFOOD_WEB_USER_FLOW_2026-07-05.md`.
- PR #430 closed the web user-flow dogfood evidence log after PR #429 passed
  local focused packaging guard, `corepack pnpm dogfood:web-user-flow`, full
  local gate, PR CI, latest main CI run `28744584511`, and branch prune.
- latest main CI run `28744698708` after PR #430 passed `test (22)` and
  `test (24)` with `pnpm test`, `pnpm lint`, `pnpm build`, and
  `pnpm pack:dry-run`.

## Remaining 9.5 blockers

- Scheduled `ui-patrol` artifact evidence remains pending until a real cron
  `schedule` event appears and its screenshot artifact is verified.
- Native OS ask UI dogfood remains operator-approved only; do not run
  `dogfood:mcp-native-dialog-approved` without explicit approval because it can
  open a native dialog.
- Fresh user-flow evidence is now repeatable through `dogfood:web-user-flow`,
  but web operations still need ongoing real-work reruns before claiming 9.5.

## Required Slices

### Task 1: Keep The 9.5 Plan Shipped And Discoverable

**Files:**
- Modify: `package.json`
- Modify: `docs/NEXT_BACKLOG.md`
- Modify: `src/packaging/plugin-files.test.ts`
- Create: `docs/superpowers/plans/2026-07-05-promptlane-95-quality-plan.md`

- [ ] **Step 1: Write the failing packaging guard**

Add a Vitest case in `src/packaging/plugin-files.test.ts` requiring:

```ts
expect(packageJson.files).toContain(
  "docs/superpowers/plans/2026-07-05-promptlane-95-quality-plan.md",
);
expect(backlog).toContain(
  "docs/superpowers/plans/2026-07-05-promptlane-95-quality-plan.md",
);
expect(plan).toContain("Product planning and positioning");
expect(plan).toContain("dogfood:first-coach-loop");
```

- [ ] **Step 2: Run the RED check**

Run:

```bash
corepack pnpm vitest run src/packaging/plugin-files.test.ts --testNamePattern "9.5 quality plan"
```

Expected: fail because the quality plan file is missing.

- [ ] **Step 3: Add this plan to package and backlog**

Add the plan path to `package.json#files`. Add a `9.5 quality upgrade` queue entry in `docs/NEXT_BACKLOG.md` that points to this plan and states the next executable slice is real operator dogfood or loop memory approval dogfood.

- [ ] **Step 4: Run the GREEN check**

Run:

```bash
corepack pnpm vitest run src/packaging/plugin-files.test.ts --testNamePattern "9.5 quality plan"
```

Expected: pass.

### Task 2: Codex And Claude Code Real Operator Dogfood

**Files:**
- Modify: `docs/AGENT-HARNESS.md`
- Create: `docs/DOGFOOD_CODEX_CLAUDE_2026-07-05.md`
- Modify: `src/packaging/plugin-files.test.ts`
- Optional Modify: `scripts/agent-setup-smoke.mjs` only if an observed failure needs an isolated regression test.

- [ ] **Step 1: Add a failing docs guard for real dogfood evidence**

Add a packaging test requiring `docs/DOGFOOD_CODEX_CLAUDE_2026-07-05.md` to contain:

```md
prompt-coach setup --profile coach --register-mcp
prompt-coach doctor codex
prompt-coach doctor claude-code
dogfood:first-coach-loop
```

- [ ] **Step 2: Run RED**

Run:

```bash
corepack pnpm vitest run src/packaging/plugin-files.test.ts --testNamePattern "Codex and Claude Code dogfood"
```

Expected: fail because the dogfood evidence doc is missing.

- [ ] **Step 3: Run approved dogfood commands**

Use isolated config unless the operator explicitly wants real user config changed:

```bash
corepack pnpm dogfood:first-coach-loop
corepack pnpm smoke:agent-setup
corepack pnpm smoke:hooks
corepack pnpm smoke:mcp-coach-loop
```

For native ask UI, only run after explicit approval:

```bash
PROMPT_COACH_NATIVE_DIALOG_APPROVED=1 corepack pnpm dogfood:mcp-native-dialog-approved
```

- [ ] **Step 4: Record actual evidence**

Write `docs/DOGFOOD_CODEX_CLAUDE_2026-07-05.md` with command output summaries, exact pass/fail status, privacy observations, and any remaining human-only steps. Do not include prompt bodies, raw local paths, tokens, or provider credentials.

- [ ] **Step 5: Run GREEN**

Run:

```bash
corepack pnpm vitest run src/packaging/plugin-files.test.ts --testNamePattern "Codex and Claude Code dogfood"
```

Expected: pass.

### Task 3: Loop Memory Approval Dogfood

**Files:**
- Create: `scripts/loop-memory-approval-dogfood.mjs`
- Modify: `package.json`
- Modify: `docs/AGENT-HARNESS.md`
- Modify: `docs/PACKAGE_CONTENTS.md`
- Modify: `docs/RELEASE_CHECKLIST.md`
- Modify: `src/packaging/plugin-files.test.ts`

- [ ] **Step 1: Write the failing packaging guard**

Require:

```ts
expect(packageJson.files).toContain("scripts/loop-memory-approval-dogfood.mjs");
expect(packageJson.scripts["dogfood:loop-memory-approval"]).toBe(
  "pnpm build && node scripts/loop-memory-approval-dogfood.mjs",
);
expect(smoke).toContain("loop memory-candidate --json");
expect(smoke).toContain("loop memory-approve --json");
expect(smoke).toContain("instruction-patch --json");
```

- [ ] **Step 2: Run RED**

Run:

```bash
corepack pnpm vitest run src/packaging/plugin-files.test.ts --testNamePattern "loop memory approval dogfood"
```

Expected: fail because the script does not exist.

- [ ] **Step 3: Implement the dogfood**

The script must:

1. create isolated HOME and data-dir
2. initialize PromptLane
3. start local server
4. capture a Codex prompt through `hook codex`
5. run `loop collect --json`
6. run `loop outcome` or equivalent outcome recording path with safe evidence refs
7. run `loop memory-candidate --json`
8. run `loop memory-approve --json`
9. run `loop instruction-patch --json`
10. assert no prompt body, raw path, secret, transcript body, or auto instruction write is exposed

- [ ] **Step 4: Run GREEN and full gate**

Run:

```bash
node scripts/loop-memory-approval-dogfood.mjs
corepack pnpm test
corepack pnpm lint
corepack pnpm build
corepack pnpm pack:dry-run
git diff --check
```

Expected: all pass.

### Task 4: Web UI Scheduled Patrol Evidence

**Files:**
- Modify: `docs/NEXT_BACKLOG.md`
- Modify: `docs/LOOPDECK_GOAL_AUDIT_2026-07-05.md`
- Modify: `tasks/todo.md`
- Modify: `src/packaging/plugin-files.test.ts`

- [ ] **Step 1: Inspect scheduled `ui-patrol`**

Run:

```bash
gh run list --workflow ui-patrol.yml --limit 20 --json databaseId,event,status,conclusion,createdAt,url
```

Expected: at least one `schedule` event after the cron has actually fired. If no scheduled event exists yet, record that as pending and do not mark this task complete.

- [ ] **Step 2: Verify artifact**

Run:

```bash
gh run download <run-id> --name ui-patrol-screenshots --dir /tmp/promptlane-ui-patrol
find /tmp/promptlane-ui-patrol -type f -name '*.png' | sort
```

Expected: 9 png files covering archive, detail, dashboard, coach, projects, MCP, exports, settings desktop, and settings mobile.

- [ ] **Step 3: Update evidence docs with guard**

Add a packaging guard requiring scheduled run id, `schedule` event, and `9 png files` in both audit and backlog.

- [ ] **Step 4: Run verification**

Run:

```bash
corepack pnpm vitest run src/packaging/plugin-files.test.ts --testNamePattern "ui-patrol"
corepack pnpm test
git diff --check
```

Expected: pass.

## Completion Rule

Do not call the long-running goal complete until every scorecard axis has current evidence at the 9.5 bar. Passing unit tests alone is not enough; dogfood evidence, CI evidence, package evidence, and privacy evidence must match the axis being claimed.
