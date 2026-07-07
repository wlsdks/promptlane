# PromptLane Goal Audit - 2026-07-05

## Purpose

This audit checks the active long-running goal against the current `main`
state. It is not a release note and it does not mark the goal complete.

Goal under audit:

- evolve `promptlane` toward PromptLane, a local-first prompt improvement
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
  namespace, and canonical MCP server remain `promptlane`
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
  `PROMPTLANE_NATIVE_DIALOG_APPROVED=1` and passed `test (22)` and `test
  (24)` before merge.
- PR #344 refreshed this audit after the native-dialog dogfood harness and
  passed `test (22)` and `test (24)` before merge.
- PR #345 resolved open dependency security alerts for `vite`, `esbuild`, and
  `fast-uri`; `corepack pnpm audit --json` reported zero vulnerabilities after
  merge and the PR passed `test (22)` and `test (24)`.
- PR #346 moved pnpm build-script approvals from `package.json#pnpm` to
  `pnpm-workspace.yaml`, keeping `better-sqlite3` and `esbuild` as the only
  approved build dependencies; the PR passed `test (22)` and `test (24)`.
- PR #347 through #349 refreshed the PromptLane audit, closed stale source
  hygiene work, and aligned package publishing docs after the hygiene work.
- PR #350 through #355 aligned MCP, CLI, Claude command, infrastructure,
  hook, and docs copy with the PromptLane product surface while preserving
  `promptlane` command and namespace compatibility.
- PR #356 corrected the Codex plugin hook lifecycle marker mapping.
- PR #357 made Codex plugin hooks setup-driven by removing active bundled
  plugin hooks, so explicit `promptlane setup` remains the hook installation
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
- PR #369 added a docs drift guard so the PromptLane goal audit and next backlog
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
- PR #512 clarified `get_promptlane_status` setup-needed and empty-archive
  next actions so plain Codex and Claude Code users see the explicit
  `promptlane setup --profile coach --register-mcp` path, then one real prompt,
  then `coach_prompt` or status recheck.
- PR #513 clarified `get_promptlane_loop_status` setup-needed guidance so loop
  MCP users get the same explicit setup/MCP registration command before
  `promptlane loop collect`.
- Local `corepack pnpm ui-patrol` on current main after PR #410 passed and
  captured 9 png files: archive, detail, dashboard, coach, projects, MCP,
  exports, settings desktop, and settings mobile.
- General test CI and scheduled UI patrol workflows were removed by maintainer
  decision. Operational browser proof now uses local browser evidence:
  `corepack pnpm ui-patrol` and `corepack pnpm dogfood:web-user-flow`.
- `corepack pnpm --silent evidence:quality` reports `promptlane_95_quality`
  as `complete`, including `local_ui_patrol_evidence`,
  `manual_ui_patrol_artifact_evidence`, `codex_claude_local_integration_evidence`,
  `native_dialog_preflight`, and completed `native_dialog_approved_dogfood`
  coverage. It still says to run the full release gate before claiming the
  long-running goal complete.
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
| Product name and positioning | PromptLane is the product direction while `promptlane` remains the compatibility runtime ID. PromptLane is legacy terminology and a compatibility CLI alias. | `docs/PROMPTLANE.md`, `docs/PROMPTLANE.md`, `docs/superpowers/specs/2026-07-05-promptlane-repositioning-design.md`, repo `wlsdks/promptlane` | Satisfied for current compatibility window |
| Existing feature portfolio decision | Keep/improve/defer/reject decisions are documented. | Feature portfolio matrix in `docs/PROMPTLANE.md` and the PromptLane repositioning spec | Satisfied for current slices |
| Codex and Claude Code first-class integration | Hook, MCP, instruction, plugin, smoke, and dogfood paths are documented and verified through repeatable local-only evidence. `smoke:agent-setup` verifies setup/doctor happy paths with isolated fake provider binaries. Native-dialog preflight and approved answered dogfood are recorded as local evidence without making automated tests open OS dialogs. | `docs/AGENT-HARNESS.md`, `docs/DOGFOOD_CODEX_CLAUDE_2026-07-05.md`, `docs/NATIVE_DIALOG_DOGFOOD_AUDIT_2026-07-05.md`, `AGENTS.md`, `CLAUDE.md`, MCP smoke scripts, `scripts/agent-setup-smoke.mjs`, `scripts/mcp-native-dialog-approved.mjs`, `native_dialog_approved_dogfood` | Satisfied for current local integration evidence |
| Loop data model | Loop snapshot and memory schema contracts exist and runtime slices have landed. | `docs/LOOP-SNAPSHOT-SCHEMA.md`, loop CLI/MCP/web implementation, status and selected worktree slices | Satisfied for MVP loop metadata model |
| Privacy/local-first boundary | Prompt bodies stay in redacted archive; loop surfaces are raw-free; write paths are explicit. Approved loop memories now require safe evidence refs at the storage boundary. | `docs/PROMPTLANE.md`, storage/server/MCP tests, route capability guard cleanup, MCP smoke audits, PR #405 | Satisfied for implemented paths |
| AGENTS.md/CLAUDE.md/harness docs | Cross-agent and Claude-specific instruction boundaries are separated. | `AGENTS.md`, `CLAUDE.md`, `docs/INSTRUCTION-FILES.md`, `docs/AGENT-HARNESS.md` | Satisfied for current compatibility window |
| Technical risk handling | Storage capability guard work, MCP setup guidance, loop-memory evidence guards, agent setup smoke, local UI patrol evidence, dependency security cleanup, pnpm build-approval settings, package dry-run lifecycle stabilization, release/README checklist drift guards, Codex hook de-duplication, reuse fallback E2E plus in-app Browser coverage, and audit drift guards reduced known reliability gaps. | ADR 0002, PR #340, PR #341, PR #345, PR #346, PR #357, PR #359, PR #361, PR #362, PR #363, PR #364, PR #365, PR #366, PR #367, PR #368, PR #369, PR #370, PR #371, PR #403, PR #405, PR #407, PR #408, PR #512, PR #513, `docs/NEXT_BACKLOG.md` | Active and improving |
| TDD implementation slices | Recent slices used focused RED tests, local gates, and PR merges. Full gates are reserved for release or broad shared-boundary changes. | PR #340 through #408, PR #512, PR #513, focused MCP tests, `tasks/todo.md` | Satisfied for recent slices |
| PromptLane MVP reliability slices | The current product-contract reliability slices for storage capability, MCP setup guidance, evidence-first memory, focused Codex/Claude setup smoke, and first-step MCP status guidance have landed. | PR #403, PR #405, PR #407, PR #408, PR #512, PR #513, `docs/NEXT_BACKLOG.md`, `tasks/todo.md` | Satisfied for current MVP reliability scope |
| Reuse copy fallback | Clipboard-write failure now opens a local manual-copy fallback instead of leaving the user at a dead end, including the real Codex in-app Browser clipboard failure mode. | `src/web/src/App.tsx`, `src/web/src/prompt-detail-view.test.ts`, `scripts/browser-e2e.mjs`, `corepack pnpm e2e:browser`, fresh Codex in-app Browser pass | Satisfied for automated and manual in-app Browser coverage |
| Reuse saved draft workflow | Saved drafts can be reopened as the current coach draft so the operator can reuse the same copy/manual-fallback controls without auto-submitting to an agent; reopened rows show `Saved draft` and disable duplicate saves with `Already saved`. | `src/web/src/saved-draft-improvement.ts`, `src/web/src/improvement-mode-label.ts`, `src/web/src/improvement-save-state.ts`, `src/web/src/prompt-detail-view.tsx`, `scripts/browser-e2e.mjs` | Satisfied for current reuse flow |
| Local browser operations evidence | Local `corepack pnpm ui-patrol` and `corepack pnpm dogfood:web-user-flow` are the operational browser evidence lanes after workflow removal. `quality-evidence` records `local_ui_patrol_evidence`, `manual_ui_patrol_artifact_evidence`, and `web_user_flow_current_main_evidence`. | local `corepack pnpm ui-patrol` with 9 png files; `docs/UI_PATROL_EVIDENCE_2026-07-06.md`; `docs/DOGFOOD_WEB_USER_FLOW_2026-07-05.md`; `corepack pnpm --silent evidence:quality` | Satisfied for current local browser evidence |
| Codex native dialog fallback | Safe no-dialog preflight, MCP elicitation smoke, refusal behavior, and the explicitly approved answered native-dialog dogfood are recorded. Automated tests still must not open OS dialogs without approval. | `docs/NATIVE_DIALOG_DOGFOOD_AUDIT_2026-07-05.md`, `scripts/mcp-native-dialog-approved.mjs`, `package.json`, `native_dialog_preflight`, `native_dialog_approved_dogfood` | Satisfied for current approved dogfood evidence |
| MCP registry follow-up | Decision is documented to wait until a new MCP tool/schema change touches registration. | ADR 0001, `docs/NEXT_BACKLOG.md` | Deferred by design |

## Completion Decision

Do not mark the long-running goal complete yet.

The current codebase has made strong progress toward PromptLane, and
`corepack pnpm --silent evidence:quality` now reports all 9.5 quality axes as
complete. Do not mark the long-running goal complete from this audit alone:
the release-sized proof still needs the full local release gate before a final
completion claim, and future work should continue as small, evidence-backed
slices when new runtime value or drift appears.

## Next Best Actions

1. Keep `main` clean and continue shipping small, evidence-backed slices.
2. Before claiming the long-running goal complete, run the full local release
   gate plus `corepack pnpm evidence:quality -- --require-complete`.
3. Continue treating dependency and package-manager warnings as reliability
   work when they affect local-first installation, build, or CI evidence.
4. Avoid package/CLI/slash namespace renames until the dedicated migration plan
   is accepted and verified.
