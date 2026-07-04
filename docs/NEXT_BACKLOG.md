# Next Backlog

Last updated: 2026-07-05

This is the prioritized "what to pick up next" list after the Loopdeck planning
and architecture decision pass. It is intentionally short. The PRD itself
(`docs/PRD.md`, `docs/PRD_PHASE2.md`), the completion audit
(`docs/PRD2_COMPLETION_AUDIT.md`), and the Loopdeck design spec
(`docs/superpowers/specs/2026-07-04-agent-loop-memory-design.md`) remain the
source of truth for product scope; this file is the operational queue.

## What We Know Is Done

- Phase 2 product scope is implemented for the local public beta candidate
  (see `docs/PRD2_COMPLETION_AUDIT.md`).
- Per-session 2026-05-08 deliveries: CLI `UserError` discipline (PR #237),
  service CLI plain-text + launchctl error mapping (PR #238), ingest
  pipeline extracted with importer redaction-reject fix (PR #239), shared
  coaching threshold module (PR #240), ADRs 0001 and 0002 proposed in PR #241
  and accepted in PR #318.
- Loopdeck direction is active while the public npm package, CLI command,
  Claude Code slash commands, Codex plugin id, hook command, and canonical MCP
  server name remain `prompt-coach` during the compatibility window.
- The first Loopdeck runtime slices have landed: loop snapshots, continuation
  briefs, compact boundary awareness, worktree/session/branch selected
  continuation, command-center summaries, local merge decision metadata,
  instruction patch proposals, and explicit AGENTS.md/CLAUDE.md apply gates.
- ADR 0001 and ADR 0002 are now accepted. New MCP tools default to per-tool
  modules, and storage capability negotiation is the target architecture for
  future storage-backed routes/tools.

## Current Priority Decision

The next implementation work should favor reliability and agent-loop
continuity over more product naming work.

Decision:

1. Implement storage capability negotiation first.
2. Then improve the MCP tool registry only when the next MCP tool or schema
   change touches the registration surface.
3. Keep Codex native dialog fallback as dogfood/integration evidence, not a
   blocking core feature.
4. Keep UI patrol as an operational follow-up after the next functional slice.

Rationale:

- Loopdeck now has enough agent-loop runtime surface that storage-backed
  features should fail clearly at registration instead of varying by route or
  MCP handler.
- Capability negotiation directly protects local-first reliability for Codex
  and Claude Code integrations.
- MCP registry cleanup is valuable, but ADR 0001 deliberately avoids a broad
  rewrite until a tool-list change creates real pressure.
- More rename or plugin alias work has lower product value than making the
  current `prompt-coach` compatibility runtime safer and easier to extend.

## Prioritized Queue

### 1. Storage Capability Negotiation (route helper landed)

Goal:

- Introduce a shared capability guard so storage-backed Fastify routes and
  future MCP tools declare required storage methods through one path.

First route-helper PR:

- Added a small server helper that narrows storage objects by required method
  names and returns one consistent local configuration error.
- Replaced the hand-written guards in project routes and coach-feedback routes.
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
  `docs/MCP_COACH_LOOP_AUDIT_2026-07-05.md`. The flow works locally, but the
  canonical path should be documented as `score_prompt` -> `improve_prompt` ->
  ask user -> `apply_clarifications` -> optional `record_clarifications`.
  Safe native-dialog preflight and MCP elicitation smoke completed in
  `docs/NATIVE_DIALOG_DOGFOOD_AUDIT_2026-07-05.md`. Remaining follow-up: one
  operator-approved interactive Claude Code or Codex session to verify the
  real native ask UI handoff.
- **Reuse loop audit**: first in-app Browser audit completed in
  `docs/REUSE_LOOP_AUDIT_2026-07-05.md`. Search, detail, and save-draft reuse
  worked; `Copy draft` failed in the Codex in-app Browser and needs a
  local-only manual-copy fallback.

These are user-perspective tasks rather than refactors. They should run in
a fresh session with the explicit role of "user trying to do work" rather
than "engineer touching code."

Immediate follow-up from the stdio audit:

- Update MCP instructions/docs so agents call `apply_clarifications` before
  `record_clarifications` when they need to show the final draft in-chat.
- Repeatable `smoke:mcp-coach-loop` harness now seeds a temporary archive and
  verifies `score_prompt` -> `improve_prompt` -> `apply_clarifications` ->
  optional `record_clarifications` over the real stdio MCP server.

Immediate follow-up from the reuse audit:

- Prompt-detail copy-failure fallback landed: when draft clipboard writes are
  unavailable, the detail page shows a local manual-copy textarea for the
  improved draft or saved draft.
- Keep auto-submit out of scope; copy/fallback must remain local and
  approval-gated.

### 4. Codex Native Dialog Fallback Dogfood

Goal:

- Prove, with explicit operator approval, whether Codex native dialog fallback
  can collect answers cleanly in the real desktop/CLI flow.

Scope:

- Existing native dialog preflight/smoke harnesses have passed; use
  `docs/NATIVE_DIALOG_DOGFOOD_AUDIT_2026-07-05.md` as the evidence baseline.
- Do not open OS dialogs unexpectedly from automated tests.
- Treat this as integration evidence; do not block core loop-memory work on it.

### 5. `App.tsx` Query-Hook Extraction

Held during the Track A grilling because the value is technical-debt
reduction rather than feature gain. Worth scheduling once the user-flow
audits surface a concrete "this UI behavior was hard to add because of
App.tsx" signal. Until that lands, the file size budget and existing
component split keep it manageable.

### 6. UI Patrol Cron

`ui-patrol` skill set up to keep design regressions visible across
sessions. Low-touch operationally, but it should follow the next functional
slice so it checks a current UI surface rather than old assumptions.

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
