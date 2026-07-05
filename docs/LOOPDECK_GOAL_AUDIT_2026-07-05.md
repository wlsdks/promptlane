# Loopdeck Goal Audit - 2026-07-05

## Purpose

This audit checks the active long-running goal against the current `main`
state. It is not a release note and it does not mark the goal complete.

Goal under audit:

- evolve `prompt-coach` toward PromptLane, a local-first prompt improvement
  workspace with loop-aware continuation
- finish strong product planning before broad development
- keep Codex and Claude Code as first-class integration surfaces
- decide what to keep, improve, defer, or reject
- preserve privacy/local-first boundaries
- maintain AGENTS.md, CLAUDE.md, and harness docs
- implement approved slices with TDD, verification, commits, pushes, and PRs

## Current Evidence

Verified repository state:

- GitHub repository: `wlsdks/promptlane`
- Runtime compatibility IDs: package, CLI, hook command, Claude Code slash
  namespace, and canonical MCP server remain `prompt-coach`
- Latest merged main commit at audit time:
  `2f99c10 docs: close codex claude dogfood log`
- Open PRs at audit time: none
- Local and remote `main` matched at audit time

Verified CI and operational evidence:

- PR #340 centralized server route storage capability guards and passed
  `test (22)` and `test (24)` before merge.
- PR #341 installed Playwright Chromium before the `ui-patrol` workflow and
  passed `test (22)` and `test (24)` before merge.
- PR #342 added this goal audit and passed `test (22)` and `test (24)` before
  merge.
- PR #343 added an operator-approved native-dialog dogfood harness guarded by
  `PROMPT_COACH_NATIVE_DIALOG_APPROVED=1` and passed `test (22)` and `test
  (24)` before merge.
- PR #344 refreshed this audit after the native-dialog dogfood harness and
  passed `test (22)` and `test (24)` before merge.
- PR #345 resolved open dependency security alerts for `vite`, `esbuild`, and
  `fast-uri`; `corepack pnpm audit --json` reported zero vulnerabilities after
  merge and the PR passed `test (22)` and `test (24)`.
- PR #346 moved pnpm build-script approvals from `package.json#pnpm` to
  `pnpm-workspace.yaml`, keeping `better-sqlite3` and `esbuild` as the only
  approved build dependencies; the PR passed `test (22)` and `test (24)`.
- PR #347 through #349 refreshed the Loopdeck audit, closed stale source
  hygiene work, and aligned package publishing docs after the hygiene work.
- PR #350 through #355 aligned MCP, CLI, Claude command, infrastructure,
  hook, and docs copy with the Loopdeck product surface while preserving
  `prompt-coach` command and namespace compatibility.
- PR #356 corrected the Codex plugin hook lifecycle marker mapping.
- PR #357 made Codex plugin hooks setup-driven by removing active bundled
  plugin hooks, so explicit `prompt-coach setup` remains the hook installation
  path and setup-installed user hooks are not duplicated by plugin discovery.
- PR #358 refreshed the reuse-copy audit after the local manual-copy fallback
  landed, so the original clipboard failure is no longer tracked as an open
  implementation gap.
- PR #359 strengthened browser E2E coverage by forcing clipboard failure on
  both `Copy draft` and `Copy saved draft` and verifying the same local
  manual-copy fallback path for both actions.
- PR #361 stabilized package dry-run lifecycle behavior by using
  `corepack pnpm build` for npm lifecycle builds, replacing `pack:dry-run`
  with a wrapper that strips pnpm-only npm env before `npm pack`, and updating
  package publishing/package contents docs.
- PR #362 aligned the release checklist with the same package dry-run wrapper
  and shipped-script contract, and added a packaging regression test to keep
  that checklist in sync.
- PR #363 aligned README contributor verification gates with the same
  `corepack pnpm pack:dry-run` wrapper and added packaging regression coverage
  to keep README package checks aligned with the lifecycle wrapper.
- PR #364 moved loop read routes onto the shared storage capability guard, so
  missing loop snapshot, compact boundary, memory, or merge-decision storage
  fails with one raw-free local configuration problem instead of an empty
  PromptLane status.
- PR #365 clarified the saved-draft clipboard fallback message and verified the
  real Codex in-app Browser clipboard failure path without exposing the fake
  token or temporary local path used in the reuse pass.
- PR #366 added `Use as current draft` for saved drafts, keeping repeated
  prompt reuse inside the local coach panel instead of forcing copy-only
  recovery.
- PR #367 replaced the internal `saved-draft` badge with user-facing `Saved
  draft` copy and extended browser E2E coverage for the reopened saved-draft
  state.
- PR #368 disabled duplicate save for reopened saved drafts with `Already
  saved` copy and browser E2E coverage, so reopening a stored draft does not
  create another saved-draft row.
- PR #369 added a docs drift guard so the Loopdeck goal audit and next backlog
  keep citing the saved-draft reuse work from PR #366 through PR #368.
- PR #370 closed the stale reuse audit next slice and now requires fresh
  user-flow evidence before opening more reuse-flow work.
- PR #371 closed the stale MCP coach-loop docs/smoke follow-ups after
  `apply_clarifications` and `smoke:mcp-coach-loop` were documented and
  shipped; only the approval-gated native ask UI dogfood remains.
- PR #403 improved shared MCP `storage_unavailable` guidance so Codex and
  Claude Code users see setup/register/doctor recovery steps without raw local
  paths.
- PR #405 added a storage-level evidence guard so approved loop memories cannot
  be recorded without safe evidence refs.
- PR #407 added `smoke:agent-setup`, a local-only Codex and Claude Code
  setup/doctor happy-path smoke using isolated HOME/data-dir and fake provider
  binaries.
- PR #408 closed the agent setup smoke log after CI `test (22)` and `test (24)`
  passed and branch pruning was confirmed.
- PR #417 added `dogfood:loop-memory-approval`, proving Codex hook capture,
  loop snapshot collection, MCP outcome recording, memory candidate proposal,
  approved memory write, and instruction patch proposal in an isolated local
  dogfood.
- PR #419 added repeatable Codex and Claude Code dogfood evidence in
  `docs/DOGFOOD_CODEX_CLAUDE_2026-07-05.md`, covering setup/doctor, hook,
  MCP coach-loop, first-loop, and loop-memory approval commands.
- PR #420 closed the Codex and Claude Code dogfood evidence log after CI
  `test (22)` and `test (24)` passed and branch pruning was confirmed.
- `ui-patrol` workflow_dispatch run `28717201110` failed before #341 because
  the GitHub runner did not have Chromium installed.
- `ui-patrol` workflow_dispatch run `28717406758` succeeded after #341.
- Run `28717406758` uploaded `ui-patrol-screenshots` with 9 png files:
  archive, detail, dashboard, coach, projects, MCP, exports, settings desktop,
  and settings mobile.
- GitHub artifact API confirms run `28717406758` still has non-expired
  `ui-patrol-screenshots` artifact `8084817676`.
- Local `corepack pnpm ui-patrol` on current main after PR #410 passed and
  captured 9 png files: archive, detail, dashboard, coach, projects, MCP,
  exports, settings desktop, and settings mobile.
- The latest `ui-patrol.yml` workflow history inspected on 2026-07-05 contains
  workflow_dispatch runs only and no `schedule` event, so scheduled
  `ui-patrol` evidence remains pending.
- `corepack pnpm evidence:ui-patrol` now repeats that check and reports
  `pending_no_schedule_run` until a real `schedule` run with the
  `ui-patrol-screenshots` artifact and 9 png files exists.
- `corepack pnpm e2e:browser` on `codex/reuse-copy-fallback-audit-refresh`
  forced clipboard writes to fail and verified the prompt detail manual-copy
  fallback for saved improvement drafts.
- `corepack pnpm e2e:browser` on `codex/reuse-copy-fallback-e2e-coverage`
  now forces clipboard writes to fail separately for `Copy draft` and
  `Copy saved draft`, verifying both manual-copy fallback paths.
- A fresh Codex in-app Browser reuse pass confirmed the real clipboard bridge
  still rejects `Copy draft` and `Copy saved draft`, both actions open the
  local manual-copy fallback, and the saved-draft failure path now uses a
  saved-draft-specific error message.

## Requirement Audit

| Requirement | Current state | Evidence | Status |
| --- | --- | --- | --- |
| Product name and positioning | PromptLane is the product direction while `prompt-coach` remains the compatibility runtime ID. Loopdeck is legacy terminology and a compatibility CLI alias. | `docs/PROMPTLANE.md`, `docs/LOOPDECK.md`, `docs/superpowers/specs/2026-07-05-promptlane-repositioning-design.md`, repo `wlsdks/promptlane` | Satisfied for current compatibility window |
| Existing feature portfolio decision | Keep/improve/defer/reject decisions are documented. | Feature portfolio matrix in `docs/PROMPTLANE.md` and the PromptLane repositioning spec | Satisfied for current slices |
| Codex and Claude Code first-class integration | Hook, MCP, instruction, plugin, smoke, and dogfood paths are documented and verified through repeatable local-only evidence. `smoke:agent-setup` verifies setup/doctor happy paths with isolated fake provider binaries. The native-dialog dogfood command still refuses to open OS dialogs unless the operator approval env is set. | `docs/AGENT-HARNESS.md`, `docs/DOGFOOD_CODEX_CLAUDE_2026-07-05.md`, `AGENTS.md`, `CLAUDE.md`, MCP smoke scripts, `scripts/agent-setup-smoke.mjs`, native dogfood audits, `scripts/mcp-native-dialog-approved.mjs` | Satisfied for automated local dogfood; real answered OS-dialog run still needs operator approval |
| Loop data model | Loop snapshot and memory schema contracts exist and runtime slices have landed. | `docs/LOOP-SNAPSHOT-SCHEMA.md`, loop CLI/MCP/web implementation, status and selected worktree slices | Satisfied for MVP loop metadata model |
| Privacy/local-first boundary | Prompt bodies stay in redacted archive; loop surfaces are raw-free; write paths are explicit. Approved loop memories now require safe evidence refs at the storage boundary. | `docs/PROMPTLANE.md`, storage/server/MCP tests, route capability guard cleanup, MCP smoke audits, PR #405 | Satisfied for implemented paths |
| AGENTS.md/CLAUDE.md/harness docs | Cross-agent and Claude-specific instruction boundaries are separated. | `AGENTS.md`, `CLAUDE.md`, `docs/INSTRUCTION-FILES.md`, `docs/AGENT-HARNESS.md` | Satisfied for current compatibility window |
| Technical risk handling | Storage capability guard work, MCP setup guidance, loop-memory evidence guards, agent setup smoke, CI UI patrol evidence, dependency security cleanup, pnpm build-approval settings, package dry-run lifecycle stabilization, release/README checklist drift guards, Codex hook de-duplication, reuse fallback E2E plus in-app Browser coverage, and audit drift guards reduced known reliability gaps. | ADR 0002, PR #340, PR #341, PR #345, PR #346, PR #357, PR #359, PR #361, PR #362, PR #363, PR #364, PR #365, PR #366, PR #367, PR #368, PR #369, PR #370, PR #371, PR #403, PR #405, PR #407, PR #408, `docs/NEXT_BACKLOG.md` | Active and improving |
| TDD implementation slices | Recent slices used focused RED tests, local gates, PR CI, and squash merges. | PR #340 through #408 tests/CI; `tasks/todo.md` | Satisfied for recent slices |
| PromptLane MVP reliability slices | The current product-contract reliability slices for storage capability, MCP setup guidance, evidence-first memory, and focused Codex/Claude setup smoke have landed. | PR #403, PR #405, PR #407, PR #408, `docs/NEXT_BACKLOG.md`, `tasks/todo.md` | Satisfied for current MVP reliability scope |
| Reuse copy fallback | Clipboard-write failure now opens a local manual-copy fallback instead of leaving the user at a dead end, including the real Codex in-app Browser clipboard failure mode. | `src/web/src/App.tsx`, `src/web/src/prompt-detail-view.test.ts`, `scripts/browser-e2e.mjs`, `corepack pnpm e2e:browser`, fresh Codex in-app Browser pass | Satisfied for automated and manual in-app Browser coverage |
| Reuse saved draft workflow | Saved drafts can be reopened as the current coach draft so the operator can reuse the same copy/manual-fallback controls without auto-submitting to an agent; reopened rows show `Saved draft` and disable duplicate saves with `Already saved`. | `src/web/src/saved-draft-improvement.ts`, `src/web/src/improvement-mode-label.ts`, `src/web/src/improvement-save-state.ts`, `src/web/src/prompt-detail-view.tsx`, `scripts/browser-e2e.mjs` | Satisfied for current reuse flow |
| UI patrol scheduled artifact | Manual workflow dispatch and local `corepack pnpm ui-patrol` are verified; latest workflow history has no `schedule` event, so scheduled `ui-patrol` evidence remains pending. `corepack pnpm evidence:ui-patrol` is the repeatable checker and must report `complete` before this row can be promoted. | workflow_dispatch run `28717406758`; artifact `8084817676`; local `corepack pnpm ui-patrol` with 9 png files; `.github/workflows/ui-patrol.yml` cron; `corepack pnpm evidence:ui-patrol` | Not yet complete as a scheduled-run requirement |
| Codex native dialog fallback | Safe no-dialog preflight, MCP elicitation smoke, and approval-gated harness refusal are verified; real OS/native ask UI dogfood is not run. | `docs/NATIVE_DIALOG_DOGFOOD_AUDIT_2026-07-05.md`, `scripts/mcp-native-dialog-approved.mjs`, `package.json` | Pending explicit operator approval for the answered dialog run |
| MCP registry follow-up | Decision is documented to wait until a new MCP tool/schema change touches registration. | ADR 0001, `docs/NEXT_BACKLOG.md` | Deferred by design |

## Completion Decision

Do not mark the long-running goal complete yet.

The current codebase has made strong progress toward PromptLane, and the
planning foundation is now good enough for continued slice-by-slice implementation. The
remaining work is not a single blocker, but goal completion still requires
evidence for the pending integration and operational items:

- first scheduled `ui-patrol` artifact after the cron actually runs
- operator-approved interactive Codex or Claude Code native ask UI dogfood, or
  an explicit decision to keep that path as optional evidence only. The
  approval-gated command now exists, but the real OS dialog path has not been
  executed.
- future MCP registry work only when a real tool/schema change creates the
  registration-surface trigger
- continued small TDD slices for any new PromptLane runtime value

## Next Best Actions

1. Keep `main` clean and continue shipping small, evidence-backed slices.
2. After the next Monday cron, run `corepack pnpm evidence:ui-patrol`; only
   update this item as complete if it finds a real `schedule` event and 9 png
   screenshots.
3. Ask for explicit operator approval before opening a native OS dialog.
4. When approval is granted, run
   `PROMPT_COACH_NATIVE_DIALOG_APPROVED=1 corepack pnpm dogfood:mcp-native-dialog-approved`
   and record whether the final MCP response is `interaction_status:
   "answered"` without prompt-body leakage or external calls.
5. Continue treating dependency and package-manager warnings as reliability
   work when they affect local-first installation, build, or CI evidence.
6. Avoid package/CLI/slash namespace renames until the dedicated migration plan
   is accepted and verified.
