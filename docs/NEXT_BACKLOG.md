# Next Backlog

Last updated: 2026-07-05

This is the prioritized "what to pick up next" list after the PromptLane
repositioning and architecture decision pass. It is intentionally short. The PRD itself
(`docs/PRD.md`, `docs/PRD_PHASE2.md`), the completion audit
(`docs/PRD2_COMPLETION_AUDIT.md`), the PromptLane product contract
(`docs/PROMPTLANE.md`), and the PromptLane repositioning spec
(`docs/superpowers/specs/2026-07-05-promptlane-repositioning-design.md`)
remain the source of truth for product scope; this file is the operational
queue.

## What We Know Is Done

- Phase 2 product scope is implemented for the local public beta candidate
  (see `docs/PRD2_COMPLETION_AUDIT.md`).
- Per-session 2026-05-08 deliveries: CLI `UserError` discipline (PR #237),
  service CLI plain-text + launchctl error mapping (PR #238), ingest
  pipeline extracted with importer redaction-reject fix (PR #239), shared
  coaching threshold module (PR #240), ADRs 0001 and 0002 proposed in PR #241
  and accepted in PR #318.
- PromptLane direction is active while the public npm package, CLI command,
  Claude Code slash commands, Codex plugin id, hook command, and canonical MCP
  server name remain `prompt-coach` during the compatibility window.
- The first loop-aware continuation runtime slices have landed: loop snapshots, continuation
  briefs, compact boundary awareness, worktree/session/branch selected
  continuation, command-center summaries, local merge decision metadata,
  instruction patch proposals, and explicit AGENTS.md/CLAUDE.md apply gates.
- ADR 0001 and ADR 0002 are now accepted. New MCP tools default to per-tool
  modules, and storage capability negotiation is the target architecture for
  future storage-backed routes/tools.
- Dependency security alerts reported on the default branch were cleared by
  updating `fastify`, `vite`, and patched `esbuild`; local `corepack pnpm audit
  --json` now reports zero vulnerabilities.
- pnpm build-script approvals now live in `pnpm-workspace.yaml`, matching the
  forward-compatible settings location while keeping the approved build list to
  `better-sqlite3` and `esbuild`.

## Current Priority Decision

After the PromptLane product contract and first-screen metadata are aligned, the
next implementation work should favor reliability and agent-loop continuity
over more naming work.

Current goal audit:

- `docs/superpowers/specs/2026-07-05-promptlane-repositioning-design.md` maps
  why Loopdeck and Prompt Coach were rejected as primary product names and keeps
  `prompt-coach` as the runtime compatibility id.
- PR #343 added an approval-gated native-dialog dogfood command. It proves the
  command refuses to open a native OS dialog without
  `PROMPT_COACH_NATIVE_DIALOG_APPROVED=1`, but it does not replace the
  remaining human-approved answered-dialog dogfood.
- PR #345 cleared dependency security alerts for `vite`, `esbuild`, and
  `fast-uri`.
- PR #346 removed the pnpm package-field warning by moving build approvals to
  `pnpm-workspace.yaml`.
- PR #357 made the Codex plugin hook installation setup-driven so plugin
  discovery does not duplicate user-level hooks installed by
  `prompt-coach setup`.
- PR #358 refreshed the reuse-copy audit after the local manual-copy fallback
  landed.
- PR #359 strengthened browser E2E so both `Copy draft` and
  `Copy saved draft` force clipboard failure and verify the local manual-copy
  fallback.
- PR #361 stabilized package dry-run lifecycle behavior by pinning npm
  lifecycle builds through `corepack pnpm`, adding a warning-free
  `pack:dry-run` wrapper, and keeping publishing/package docs aligned with
  `npm pack --ignore-scripts` inspection.
- PR #362 aligned the public release checklist with the same package lifecycle
  contract and added a packaging guard so shipped scripts and dry-run commands
  cannot drift quietly.
- PR #363 aligned README contributor verification gates with the same
  `corepack pnpm pack:dry-run` wrapper and added packaging coverage so README
  examples do not drift back to PATH-dependent bare `pnpm` package checks.
- PR #364 moved loop read routes onto the shared storage capability guard, so
  missing loop snapshot, compact boundary, memory, or merge-decision storage
  fails with one raw-free local configuration problem instead of an empty
  Loopdeck status.
- PR #369 added a docs drift guard so the Loopdeck goal audit and next backlog
  continue citing the saved-draft reuse flow after PR #366 through PR #368.
- PR #370 closed the stale reuse audit next slice; no immediate reuse-flow
  slice remains until fresh user-flow evidence creates one.
- PR #371 closed the stale MCP coach-loop docs/smoke follow-ups; no immediate
  MCP coach-loop slice remains outside the approval-gated native ask UI
  dogfood.

Decision:

1. Implement storage capability negotiation first.
2. Then improve the MCP tool registry only when the next MCP tool or schema
   change touches the registration surface.
3. Keep Codex native dialog fallback as dogfood/integration evidence, not a
   blocking core feature.
4. Keep UI patrol as an operational follow-up after the next functional slice.
5. Treat future dependency/security/package-manager warnings as reliability
   work only when they affect local-first install, build, test, pack, or CI
   evidence.

Rationale:

- PromptLane now has enough agent-loop runtime surface that storage-backed
  features should fail clearly at registration instead of varying by route or
  MCP handler.
- Capability negotiation directly protects local-first reliability for Codex
  and Claude Code integrations.
- MCP registry cleanup is valuable, but ADR 0001 deliberately avoids a broad
  rewrite until a tool-list change creates real pressure.
- More rename or plugin alias work has lower product value than making the
  current `prompt-coach` compatibility runtime safer and easier to extend after
  the PromptLane product-facing contract lands.
- Security and package-manager hygiene should remain tightly scoped: update the
  smallest dependency/config surface that removes the alert or warning, then
  prove it with audit, install/build/pack, and CI.
- Release checklists should follow the same package lifecycle contract as
  `docs/NPM_PUBLISHING.md` and `docs/PACKAGE_CONTENTS.md`; avoid allowing
  public beta gates to drift back to PATH-dependent bare `pnpm` commands.
- README contributor gates should follow the same rule: use `corepack pnpm`
  for release/build/package verification, while preserving `prompt-coach`
  as the compatibility runtime in user-facing command examples.

## Prioritized Queue

### 1. Storage Capability Negotiation (route helper landed)

Goal:

- Introduce a shared capability guard so storage-backed Fastify routes and
  future MCP tools declare required storage methods through one path.

First route-helper PR:

- Added a small server helper that narrows storage objects by required method
  names and returns one consistent local configuration error.
- Replaced the hand-written guards in project routes, coach-feedback routes,
  export routes, prompt read/improvement/ask-summary routes, loop memory
  routes, and the ingest ask-event route.
- Kept behavior equivalent: missing capabilities still fail locally and do not
  expose prompt bodies, raw paths, tokens, or instruction file contents.

MCP storage-error PR:

- Centralized storage-backed MCP handler setup errors behind one raw-free
  message helper.
- Kept storage-backed MCP handlers returning explicit `storage_unavailable`
  results instead of throwing transport-level failures or exposing local paths.

MCP catalogue decision PR:

- Decided not to filter storage-backed tools from `tools/list` for the
  local-only SQLite runtime.
- Keep the static catalogue discoverable for Claude Code and Codex agents, and
  rely on explicit `storage_unavailable` results plus status/setup guidance
  when the archive is not initialized.
- Defer capability-filtered catalogues until a real multi-backend runtime or
  per-client capability requirement exists.

Next capability PR:

- Avoid a broad MCP registry rewrite unless the next MCP tool or schema change
  already touches the registration surface.
- If registration changes become necessary, introduce a small registry that
  derives `tools/list` and `tools/call` dispatch from one tool list without
  filtering SQLite setup state.

### 2. MCP Registry Follow-Up (only when registration changes)

Goal:

- Remove the manual definition/handler sync risk identified by ADR 0001 without
  migrating every legacy split-layout tool.

Scope:

- Introduce an explicit data registry only when a new MCP tool, schema change,
  or capability-filtered catalogue work already touches `src/mcp/server.ts`.
- Do not use import-time global mutation.
- Derive `tools/list` and `tools/call` dispatch from the same registered tool
  list.

### 3. User-Flow Validation Passes

The Phase 2 features are implemented; the open question is whether the
flows feel right end to end. Two quick passes are worth scheduling before
investing in more refactors:

- **MCP coach loop audit**: first stdio MCP audit completed in
  `docs/MCP_COACH_LOOP_AUDIT_2026-07-05.md`. The canonical path is now
  documented as `score_prompt` -> `improve_prompt` -> ask user ->
  `apply_clarifications` -> optional `record_clarifications`, and
  `smoke:mcp-coach-loop` repeats that path over the real stdio MCP server. No
  immediate MCP coach-loop slice remains. The remaining validation is one
  operator-approved interactive Claude Code or Codex session to verify the real
  native ask UI handoff.
- **Reuse loop audit**: first in-app Browser audit completed in
  `docs/REUSE_LOOP_AUDIT_2026-07-05.md`. Search, detail, and save-draft reuse
  worked; the original `Copy draft` clipboard failure now has a local-only
  manual-copy fallback for current and saved improvement drafts. A fresh Codex
  in-app Browser pass confirmed the real clipboard bridge still rejects copy
  writes, the manual-copy fallback appears for both current and saved drafts,
  and the saved-draft failure message is now specific to that action. PR #366
  added `Use as current draft` so saved drafts can be reopened in the active
  coach panel without automatic resubmission, PR #367 made the reopened state
  show user-facing `Saved draft` copy instead of the internal mode enum, and
  PR #368 disables duplicate saves with `Already saved`.

These are user-perspective tasks rather than refactors. They should run in
a fresh session with the explicit role of "user trying to do work" rather
than "engineer touching code."

Current state from the reuse audit:

- Prompt-detail copy-failure fallback landed: when draft clipboard writes are
  unavailable, the detail page shows a local manual-copy textarea for the
  improved draft or saved draft.
- `corepack pnpm e2e:browser` forces clipboard writes to fail for both
  `Copy draft` and `Copy saved draft`, and verifies the manual-copy fallback
  without requiring real clipboard permissions.
- The Codex in-app Browser pass now verifies the same fallback against the real
  clipboard bridge failure mode and keeps fake token/path content out of the
  visible archive, detail, and fallback states.
- No immediate reuse-flow slice remains. Future reuse work should wait for
  fresh user-flow evidence instead of re-opening the closed audit by default.
- Keep auto-submit out of scope; copy/fallback must remain local and
  approval-gated.

### 4. Codex Native Dialog Fallback Dogfood

Goal:

- Prove, with explicit operator approval, whether Codex native dialog fallback
  can collect answers cleanly in the real desktop/CLI flow.

Scope:

- Existing native dialog preflight/smoke harnesses have passed; use
  `docs/NATIVE_DIALOG_DOGFOOD_AUDIT_2026-07-05.md` as the evidence baseline.
- `corepack pnpm dogfood:mcp-native-dialog-approved` now exists and refuses to
  run unless `PROMPT_COACH_NATIVE_DIALOG_APPROVED=1` is set.
- Do not open OS dialogs unexpectedly from automated tests.
- Treat this as integration evidence; do not block core loop-memory work on it.

### 5. `App.tsx` Query-Hook Extraction

First slice landed after the reuse-flow audits showed prompt detail copy and
save state still had to be threaded through `App.tsx`: selected prompt detail
loading is now isolated behind a focused query hook.

Remaining scope:

- Continue extracting only when a user-flow change touches the relevant state
  boundary.
- Favor small hooks with focused tests over a broad `App.tsx` rewrite.

### 6. UI Patrol Cron

`ui-patrol` is now wired as a scheduled GitHub Actions workflow plus a local
`pnpm ui-patrol` command. It reuses the synthetic browser E2E flow and stores
desktop/mobile screenshot artifacts through `SCREENSHOT_DIR` so visual
regressions remain visible across sessions.

Operational checkpoint:

- Initial `workflow_dispatch` run `28717201110` failed because the GitHub
  runner did not have Playwright Chromium installed.
- PR #341 added `pnpm exec playwright install chromium` before `pnpm
  ui-patrol`.
- Follow-up `workflow_dispatch` run `28717406758` passed and uploaded 9
  screenshot artifacts.

Remaining scope:

- Review the first scheduled artifact after it runs.
- Add targeted visual assertions only when a real regression appears; keep the
  patrol broad and low-touch by default.

## Explicit non-goals

- External LLM provider integrations remain gated beta scope per
  `docs/PRD_PHASE2.md` §10. Do not promote them into core.
- "Project policy dormant fields" (`analysis_disabled`,
  `retention_candidate_days`, `external_analysis_opt_in`) are reserved for
  future execution paths and should not be wired up before the user flow
  exists to consume them.
- The CLI `--json` raw `cwd` field on `list/search/show` is design intent
  for automation/restore; do not redact it.
- Do not add hidden background transcript scraping, hidden external LLM calls,
  automatic prompt resubmission, automatic merge actions, or automatic
  AGENTS.md/CLAUDE.md writes.
