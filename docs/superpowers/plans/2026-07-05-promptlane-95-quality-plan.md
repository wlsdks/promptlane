# PromptLane 9.5 Quality Plan Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Raise PromptLane from pre-release beta evidence to a 9.5/10 local-first prompt improvement and agent-loop memory workbench.

**Architecture:** Treat 9.5 as a proof standard, not a slogan. Each score axis must have a measurable bar, current evidence, missing evidence, and one or more TDD slices that close the gap without changing the trust model. Keep `PromptLane` as product name and `prompt-coach` as runtime compatibility id until a dedicated migration proves otherwise.

**Tech Stack:** TypeScript, Node.js, Commander CLI, Fastify, SQLite, React/Vite, Vitest, Playwright, pnpm, GitHub Actions, Codex and Claude Code hooks/MCP/plugin surfaces.

---

## 9.5 Scorecard

| Axis | Current level after latest evidence | 9.5 bar | Evidence that must exist |
| --- | --- | --- | --- |
| Product planning and positioning | 9.5/10 | 9.5 bar: every active first-screen surface, plugin surface, README path, and backlog slice says PromptLane is prompt improvement first, loop-aware continuation second, with no product-facing Loopdeck drift. | Packaging guard, README/plugin metadata, repo metadata, docs/PROMPTLANE.md, docs/NEXT_BACKLOG.md, goal audit, expected-impact evidence. |
| Local-first privacy boundary | 9.5/10 | 9.5 bar: every hook, MCP, CLI, server, web, export, loop, and dogfood path proves no prompt body, raw path, provider credential, transcript body, compact summary, or external provider call leaks outside the allowed storage layer. | Focused privacy tests, raw-free fixtures, dogfood:first-coach-loop, dogfood:loop-memory-approval, smoke:mcp-coach-loop, browser E2E, release smoke. |
| Codex and Claude Code integration | 9.0/10 | 9.5 bar: setup, doctor, hook capture, MCP registration, plugin install guidance, slash commands, statusline, and recovery copy are all verified for both tools in isolated smoke and at least one real operator dogfood pass. | smoke:agent-setup, smoke:hooks, dogfood:first-coach-loop, docs/DOGFOOD_CODEX_CLAUDE_2026-07-05.md, AGENT-HARNESS. |
| Setup, doctor, and MCP smoke | 9.5/10 | 9.5 bar: setup and doctor smoke proves capture readiness; MCP smoke proves score/improve/clarify/record loop; failure states produce raw-free recovery actions instead of generic errors. | smoke:agent-setup, smoke:mcp-coach-loop, storage_unavailable tests, package checks. |
| Loop memory and continuation | 9.5/10 | 9.5 bar: collect, brief, outcome, memory candidate, memory approval, instruction patch proposal, and apply gate are proven through CLI and MCP with evidence-first rules and no automatic instruction writes. | Loop unit tests, storage evidence guards, dogfood:first-coach-loop, dogfood:loop-memory-approval, prompt-linked outcome evidence. |
| Web UI and operational evidence | 8.6/10 | 9.5 bar: archive, detail, coach, saved draft reuse, settings, loops, exports, projects, and mobile layout have screenshots or browser assertions, plus scheduled `ui-patrol` artifact evidence. | corepack pnpm ui-patrol, workflow_dispatch run `28717406758`, scheduled `ui-patrol`, browser E2E, screenshot artifacts, in-app Browser audit. |
| Release stability | 9.5/10 | 9.5 bar: Node 22 and 24 CI, pack dry-run, release smoke, first coach loop dogfood, package contents, dependency audit, and release checklist all agree on shipped files and commands. | GitHub Actions, corepack pnpm pack:dry-run, smoke:release, dogfood:first-coach-loop, dogfood:loop-memory-approval, docs/RELEASE_CHECKLIST.md. |

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
- PR #425 updated the main test workflow to `pnpm/action-setup@v6`, removing
  the deprecated Node 20 action runtime annotation from Node 22/24 CI.
- PR #427 moved `better-sqlite3` to the npm-published 12.x line and patched the
  transient `prebuild-install@7.1.3` permission constants, removing the Node 24
  `fs.R_OK` deprecation warning without suppressing install output.
- PR #429 added `dogfood:web-user-flow`, providing repeatable fresh web
  user-flow evidence for archive, detail, dashboard, coach, projects, mcp,
  exports, settings, and mobile flows through
  `docs/DOGFOOD_WEB_USER_FLOW_2026-07-05.md`.
- fresh current-main web user-flow evidence after PR #465 is recorded in
  `docs/DOGFOOD_WEB_USER_FLOW_2026-07-05.md`: `corepack pnpm
  dogfood:web-user-flow` passed after main CI run `28750766036`, proving the
  archive/detail/dashboard/coach/projects/mcp/exports/settings/mobile flow
  remains healthy on the current evidence-ledger baseline.
- PR #430 closed the web user-flow dogfood evidence log after PR #429 passed
  local focused packaging guard, `corepack pnpm dogfood:web-user-flow`, full
  local gate, PR CI, latest main CI run `28744584511`, and branch prune.
- PR #433 updated the scheduled `ui-patrol.yml` workflow to
  `pnpm/action-setup@v6`, so the next real cron run uses the same Node 24
  action runtime major as the main test workflow.
- PR #434 closed the UI patrol action runtime log after PR #433 passed PR CI,
  latest main CI run `28745108598`, and branch pruning.
- PR #447 added `expected_impact` to local prompt improvements, exposing
  original score, improved draft score, delta, and changed axis count through
  CLI JSON and MCP results without external calls or automatic approval.
- PR #449 rendered the same expected-impact evidence in the web prompt detail
  coach panel before copy/save actions, and extended browser E2E so
  `corepack pnpm ui-patrol` asserts the expected-impact row in a real browser.
- PR #450 closed the web expected-impact evidence log after PR #449 passed PR
  CI, local `corepack pnpm ui-patrol`, latest main CI run `28747568864`, and
  branch pruning.
- PR #453 linked prompt detail back to actual loop
  outcomes, returning raw-free `loop_outcomes` through the prompt API and
  rendering `Outcome evidence` in the web detail flow so expected-impact
  predictions can be checked against finished loop evidence.
- PR #455 added CLI prompt outcome evidence by moving the same raw-free
  `loop_outcomes` contract into storage `getPrompt()` so `prompt-coach show
  --json`, web detail, and future agent-native consumers share one effectiveness
  evidence source instead of web-only derivation.
- PR #457 summarized those raw-free linked
  loop outcomes into an `effectiveness` verdict shared by storage
  `getPrompt()`, `prompt-coach show --json`, and the web prompt detail, so
  users and agents can judge actual prompt impact without manually reconciling
  every outcome row.
- PR #458 closed the prompt effectiveness verdict log after PR #457 passed PR
  CI, local `corepack pnpm ui-patrol`, latest main CI run `28749214218`, and
  branch pruning.
- PR #460 added effectiveness calibration with linked-outcome, passing-outcome,
  failing-outcome, and total-test counts to the raw-free `effectiveness`
  payload so Codex, Claude Code, CLI JSON, API, and web detail consumers can
  judge how much evidence supports the verdict instead of reading only a label.
- PR #462 added MCP score_prompt effectiveness evidence by returning the same
  raw-free `effectiveness` verdict and calibration counts through MCP
  `score_prompt` for stored prompt ids, so Codex and Claude Code can inspect
  prompt impact evidence without opening the web UI or shelling out to
  `prompt-coach show --json`.
- The archive effectiveness summary slice adds `effectiveness_summary` to
  `createArchiveScoreReport()`, `prompt-coach score --json`, the human
  `prompt-coach score` report, `/api/v1/score`, and MCP
  `score_prompt_archive`, so agents can judge measured vs unmeasured archive
  prompts, proven/mixed/unproven verdict counts, linked outcomes, tests run,
  safe evidence refs, and next action without prompt bodies or raw paths.
- The web archive effectiveness summary slice renders the same
  `effectiveness_summary` in the Dashboard Archive score review and extends the
  browser E2E flow to prove users can see measured vs unmeasured coverage,
  proven/mixed verdict counts, linked outcomes, tests run, and next action in a
  raw-free web workflow.
- PR #469 promoted archive effectiveness from a visible summary to a benchmark
  hard gate: `corepack pnpm benchmark -- --json` now reports
  `archive_effectiveness_score: 1`, `privacy_leak_count: 0`, and safe
  `effectiveness_summary` coverage backed by a linked passed loop outcome. Main
  CI run `28751693022` passed Node 22 and Node 24 after merge.
- The one-call coach effectiveness brief slice routes that same archive
  coverage into `coach_prompt` agent briefs, so Codex and Claude Code agents see
  measured vs unmeasured prompts, linked outcomes, tests run, safe evidence
  refs, and a review-first action before claiming archive-wide improvement.
  `coach_prompt_actionability` now requires this signal in the benchmark.
- The MCP coach-loop smoke now exercises that one-call path over the real stdio
  MCP server: `smoke:mcp-coach-loop` calls `coach_prompt`, verifies the
  `Effectiveness evidence` summary, checks the unmeasured-prompt review action,
  and keeps prompt bodies, raw paths, and transcript paths out of the brief.
- `docs/RELEASE_STABILITY_EVIDENCE_2026-07-06.md` records current
  `corepack pnpm smoke:release` and `corepack pnpm pack:dry-run` evidence for
  the local-first release path.
- PR #464 closed the release-stability evidence log after local release smoke,
  package dry-run, PR CI, latest main CI run `28750611089`, and branch pruning
  proved the evidence document on the default branch.
- latest main CI run `28750611089` after PR #464 passed `test (22)` and
  `test (24)` with `pnpm test`, `pnpm lint`, `pnpm build`, and
  `pnpm pack:dry-run`.
- PR #478 exposed the same 9.5 quality evidence as an installed product CLI:
  `prompt-coach quality-evidence`, `prompt-coach quality-evidence --json`, and
  `prompt-coach quality-evidence --require-complete`. The command lists every
  current scorecard/direct evidence blocker, keeps output local and raw-free,
  and exits nonzero while completion evidence remains pending. Main CI run
  `28753458359` passed Node 22 and Node 24 after merge with `pnpm test`,
  `pnpm lint`, `pnpm build`, and `pnpm pack:dry-run`.

## Remaining 9.5 blockers

- Scheduled `ui-patrol` artifact evidence remains pending until a real cron
  `schedule` event appears and its screenshot artifact is verified.
- `corepack pnpm evidence:ui-patrol` is the repeatable checker for that
  blocker. It must stay `pending_no_schedule_run` while only workflow_dispatch
  evidence exists, and it must require the `ui-patrol-screenshots` artifact
  with 9 png files before returning `complete`.
- `corepack pnpm evidence:quality` emits the `promptlane_95_quality` summary
  and must include `scorecard_axes`, `scheduled_ui_patrol`, and
  `native_dialog_approved_dogfood` blockers until every axis reaches its 9.5
  evidence bar and the direct evidence is complete. Use
  `corepack pnpm evidence:quality -- --require-complete` when a release or
  goal-completion gate must fail closed while that summary is pending. Use
  `corepack pnpm --silent evidence:quality` or
  `node scripts/quality-95-evidence.mjs` when another tool needs to parse the
  JSON directly. Installed CLI users can run
  `prompt-coach quality-evidence --json` or
  `prompt-coach quality-evidence --require-complete`.
  The JSON includes `axis_evidence_coverage`, which separates satisfied local
  proof such as `local_95_evidence_sweep` and
  `web_user_flow_current_main_evidence` from remaining gaps such as
  `scorecard_level_below_9_5`, `scheduled_ui_patrol`, and
  `native_dialog_approved_dogfood`.
  The JSON also includes `scorecard_review_candidates`, which lists axes whose
  local evidence is present and whose only remaining gap is
  `scorecard_level_below_9_5`, without treating those axes as complete.
  The JSON includes `recommended_next_slices`; completed local evidence actions
  are skipped so the recommendation loop moves forward instead of repeating the
  last proof, and `scorecard_review_candidates` is first whenever candidate
  axes exist. Because `web_user_flow_current_main_evidence`,
  `privacy_raw_free_regression_sweep`, and
  `codex_claude_setup_smoke_refresh` were run and recorded, the next
  immediately runnable local action is to review those candidate axes with
  `prompt-coach quality-evidence --json` before scheduled cron review and
  native dialog dogfood, which stay marked as externally blocked until their
  event or explicit approval exists. Each recommendation carries
  `blocked_by_external_event` so agents can distinguish local work from
  cron/operator wait states.
- `web_user_flow_current_main_evidence` was dogfooded after becoming the first
  recommendation: `corepack pnpm dogfood:web-user-flow` completed with
  `browser e2e passed` on current main. This refreshes local web workflow
  evidence without treating scheduled `ui-patrol` or native-dialog dogfood as
  complete.
- `privacy_raw_free_regression_sweep` was run after becoming the first
  recommendation: `corepack pnpm test -- src/security src/hooks src/mcp`
  passed with 108 test files and 833 tests on current main-derived work. This
  refreshes the highest-risk raw-free hook/MCP/security evidence without
  treating any scorecard axis, scheduled `ui-patrol`, or native-dialog dogfood
  as complete.
- `codex_claude_setup_smoke_refresh` was run after becoming the first
  recommendation: `corepack pnpm smoke:agent-setup` rebuilt server/web assets,
  exercised setup dry-run, setup with MCP registration, Claude Code doctor, and
  Codex doctor, then completed with `prompt-coach agent setup smoke passed` on
  current main-derived work. This refreshes local Codex/Claude setup evidence
  without opening provider CLIs or treating native-dialog dogfood as complete.
- `docs/LOCAL_95_EVIDENCE_2026-07-06.md` records the current local 9.5 evidence
  sweep: `corepack pnpm smoke:hooks` ended with `hook binary smoke passed`,
  `corepack pnpm smoke:mcp-coach-loop` ended with
  `mcp coach loop smoke passed`, `corepack pnpm dogfood:first-coach-loop` ended
  with `first coach loop dogfood passed`,
  `corepack pnpm dogfood:loop-memory-approval` ended with
  `loop memory approval dogfood passed`, `corepack pnpm smoke:release` ended
  with `release smoke passed`, and `corepack pnpm benchmark -- --json`
  returned `privacy_leak_count: 0` plus `archive_effectiveness_score: 1`.
  This strengthens the local proof for privacy, Codex/Claude integration,
  setup/MCP smoke, loop memory, and release stability while keeping scheduled
  `ui-patrol` and native-dialog dogfood as separate blockers.
- Local scorecard review promoted the four non-external candidate axes to
  9.5/10: local-first privacy boundary, setup/doctor/MCP smoke, loop memory and
  continuation, and release stability. This removes those scorecard-axis
  blockers while leaving product planning, Codex/Claude operator dogfood, web
  operations, scheduled `ui-patrol`, and native-dialog approved dogfood pending.
- `docs/PRODUCT_POSITIONING_EVIDENCE_2026-07-06.md` records current GitHub
  repository metadata, README/package/plugin metadata, product contract,
  backlog, goal audit, and Loopdeck legacy decision evidence. Product planning
  and positioning is now 9.5/10 because those surfaces consistently present
  PromptLane as prompt improvement first and loop-aware continuation second
  while keeping `prompt-coach` as the compatibility runtime ID.
  `quality-evidence` records this as
  `product_positioning_metadata_alignment`.
- `docs/UI_PATROL_EVIDENCE_2026-07-06.md` records current non-scheduled web
  operations evidence: workflow_dispatch run `28717406758`, the
  `ui-patrol-screenshots` artifact with 9 png files, local
  `corepack pnpm ui-patrol`, and `dogfood:web-user-flow`. `quality-evidence`
  records this as `manual_ui_patrol_artifact_evidence` while keeping
  `scheduled_ui_patrol` pending until a real cron `schedule` event exists.
- `docs/UI_PATROL_SCHEDULE_READINESS_2026-07-06.md` records scheduled patrol
  readiness separately: `ui-patrol.yml` has both manual and scheduled triggers,
  the cron is `17 6 * * 1`, the latest proven manual artifact path remains
  workflow_dispatch run `28717406758`, and the repeatable evidence checker
  refuses to treat that as cron completion. `quality-evidence` records this as
  `scheduled_ui_patrol_preflight` while keeping `scheduled_ui_patrol` pending.
- `docs/CODEX_CLAUDE_LOCAL_INTEGRATION_EVIDENCE_2026-07-06.md` records current
  non-operator Codex and Claude Code evidence: setup/doctor smoke, hook smoke,
  MCP coach-loop smoke, MCP elicitation smoke, no-dialog native fallback
  preflight, first-loop dogfood, and loop-memory approval dogfood.
  `quality-evidence` records this as
  `codex_claude_local_integration_evidence` while keeping
  `native_dialog_approved_dogfood` pending until explicit operator approval
  exists.
- PR #478 proved that installed CLI path on the default branch; main CI run
  `28753458359` passed Node 22 and Node 24 after merge, so future agents can use
  the product CLI itself to decide whether 9.5 is still blocked before claiming
  completion.
- Native OS ask UI dogfood remains operator-approved only; do not run
  `dogfood:mcp-native-dialog-approved` without explicit approval because it can
  open a native dialog.
- Fresh user-flow, expected-impact, prompt-linked outcome evidence, CLI prompt
  outcome evidence, prompt effectiveness verdict evidence, effectiveness
  calibration evidence, archive-level effectiveness summary, web archive
  effectiveness summary, archive effectiveness benchmark evidence, and one-call
  coach effectiveness guidance are now repeatable through
  `dogfood:web-user-flow`, browser E2E, focused CLI/storage/web tests,
  `corepack pnpm ui-patrol`, and
  `corepack pnpm benchmark -- --json`. MCP score_prompt effectiveness evidence
  is now proven on the default branch through PR #462, main CI `28750281428`,
  and branch pruning. Release smoke evidence is current in
  `docs/RELEASE_STABILITY_EVIDENCE_2026-07-06.md`. Web operations still need
  scheduled artifact evidence before claiming 9.5.

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
