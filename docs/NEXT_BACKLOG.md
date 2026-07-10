# Next Backlog

Last updated: 2026-07-08

This is the prioritized "what to pick up next" list after the PromptLane
repositioning and architecture decision pass. It is intentionally short. The PRD itself
(`docs/PRD.md`, `docs/PRD_PHASE2.md`), the completion audit
(`docs/PRD2_COMPLETION_AUDIT.md`), the PromptLane product contract
(`docs/PROMPTLANE.md`), and the PromptLane repositioning spec
(`docs/superpowers/specs/2026-07-05-promptlane-repositioning-design.md`)
remain the source of truth for product scope; this file is the operational
queue.

## What We Know Is Done

- Phase 2 product scope is implemented for the local 1.0.0 stable release candidate
  (see `docs/PRD2_COMPLETION_AUDIT.md`).
- Per-session 2026-05-08 deliveries: CLI `UserError` discipline (PR #237),
  service CLI plain-text + launchctl error mapping (PR #238), ingest
  pipeline extracted with importer redaction-reject fix (PR #239), shared
  coaching threshold module (PR #240), ADRs 0001 and 0002 proposed in PR #241
  and accepted in PR #318.
- PromptLane direction is active while the public npm package, CLI command,
  Claude Code slash commands, Codex plugin id, hook command, and canonical MCP
  server name remain `promptlane` during the compatibility window.
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
- The PromptLane MVP reliability slices in `docs/PROMPTLANE.md` have landed
  through focused TDD slices: capability-aware MCP setup guidance, evidence-first
  loop memory storage guards, and focused Codex/Claude Code setup smoke.

## Current Priority Decision

After the PromptLane product contract and first-screen metadata are aligned, the
next implementation work should favor reliability and agent-loop continuity
over more naming work.

Current integration policy:

- General PR/main test CI is removed. Use the local gate as the authoritative
  release and merge signal: focused tests, `corepack pnpm test`,
  `corepack pnpm lint`, `corepack pnpm build`, `corepack pnpm pack:dry-run`,
  and slice-specific smoke/dogfood commands.
- GitHub Actions workflows are removed. Use local browser evidence
  (`corepack pnpm ui-patrol`, `corepack pnpm dogfood:web-user-flow`) instead of
  scheduled workflow evidence.
- Do not re-add `.github/workflows/*.yml` without a dedicated product decision
  that explains what local-first risk it closes beyond the local gate.

Current goal audit:

- `docs/superpowers/specs/2026-07-05-promptlane-repositioning-design.md` maps
  why PromptLane and PromptLane were rejected as primary product names and keeps
  `promptlane` as the runtime compatibility id.
- PR #343 added an approval-gated native-dialog dogfood command. It proves the
  command refuses to open a native OS dialog without
  `PROMPTLANE_NATIVE_DIALOG_APPROVED=1`; the later approved answered-dialog
  dogfood is now recorded in `docs/NATIVE_DIALOG_DOGFOOD_AUDIT_2026-07-05.md`.
- PR #345 cleared dependency security alerts for `vite`, `esbuild`, and
  `fast-uri`.
- PR #346 removed the pnpm package-field warning by moving build approvals to
  `pnpm-workspace.yaml`.
- PR #357 made the Codex plugin hook installation setup-driven so plugin
  discovery does not duplicate user-level hooks installed by
  `promptlane setup`.
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
  PromptLane status.
- PR #369 added a docs drift guard so the PromptLane goal audit and next backlog
  continue citing the saved-draft reuse flow after PR #366 through PR #368.
- PR #370 closed the stale reuse audit next slice; no immediate reuse-flow
  slice remains until fresh user-flow evidence creates one.
- PR #371 closed the stale MCP coach-loop docs/smoke follow-ups; no immediate
  MCP coach-loop slice remains outside the approval-gated native ask UI
  dogfood.
- PR #403 improved shared MCP `storage_unavailable` guidance so Codex and
  Claude Code users see setup/register/doctor recovery steps instead of a
  generic init-only message.
- PR #405 added a storage-level evidence guard so approved loop memories cannot
  be recorded without safe evidence refs.
- PR #407 added `smoke:agent-setup`, a local-only Codex and Claude Code
  setup/doctor happy-path smoke using isolated HOME/data-dir and fake provider
  binaries.
- PR #408 closed the agent setup smoke log after CI passed and branch pruning
  was confirmed.
- PR #417 added `dogfood:loop-memory-approval`, proving the evidence-backed
  loop memory approval and instruction patch proposal flow through the real
  local CLI/MCP surfaces.
- PR #419 added `docs/DOGFOOD_CODEX_CLAUDE_2026-07-05.md`, recording repeatable
  Codex and Claude Code dogfood evidence for setup/doctor, hooks, MCP
  coach-loop, first-loop, and loop-memory approval.
- PR #420 closed the Codex and Claude Code dogfood evidence log after CI passed
  and branch pruning was confirmed.
- PR #512 clarified `get_promptlane_status` setup-needed and empty-archive
  next actions so first-time MCP users see explicit setup, one real
  Codex/Claude Code prompt, and then `coach_prompt` or status recheck.
- PR #513 clarified `get_promptlane_loop_status` setup-needed guidance so loop
  MCP users see the same explicit setup/MCP registration command before
  `promptlane loop collect`.
- PR #564 aligned `get_promptlane_loop_status` setup-needed guidance with
  `get_promptlane_status`, so first-time MCP loop users see setup, one real
  Codex/Claude Code prompt, `coach_prompt` or status recheck, and only then
  `promptlane loop collect`.
- PR #425 updated the main test workflow to `pnpm/action-setup@v6`, removing
  the deprecated Node 20 action runtime annotation from Node 22/24 CI.
- PR #427 moved `better-sqlite3` to the npm-published 12.x line and patched the
  transient `prebuild-install@7.1.3` permission constants, removing the Node 24
  `fs.R_OK` deprecation warning without suppressing install output.
- PR #433 and PR #434 previously maintained a scheduled `ui-patrol.yml`
  workflow, but that workflow and `corepack pnpm evidence:ui-patrol` were later
  retired by maintainer decision when CI was removed.
- Local `corepack pnpm ui-patrol` on current main after PR #410 passed and
  captured 9 png files.
- PR #447 added local `expected_impact` evidence to prompt improvements so
  CLI JSON and MCP results expose original score, improved score, delta, and
  changed axis count without external calls or automatic approval.
- PR #449 rendered expected-impact evidence in the web prompt detail coach
  panel and extended browser E2E/`ui-patrol` to assert that row before copy/save
  actions.
- PR #450 closed the web expected-impact evidence log after PR #449 passed PR
  CI, local `corepack pnpm ui-patrol`, latest main CI run `28747568864`, and
  branch pruning.
- PR #464 added `docs/RELEASE_STABILITY_EVIDENCE_2026-07-06.md`, packaging
  manifest coverage, and release-stability drift guards for the local-first
  release path.
- latest main CI run `28750611089` after PR #464 passed `test (22)` and
  `test (24)` with
  `pnpm test`, `pnpm lint`, `pnpm build`, and `pnpm pack:dry-run`.
- `docs/RELEASE_STABILITY_EVIDENCE_2026-07-06.md` records current
  `corepack pnpm smoke:release` and `corepack pnpm pack:dry-run` evidence for
  the local-first release path.
- General PR/main test CI and scheduled `ui-patrol` Actions have been removed
  by maintainer decision. Release stability and web operations are judged by
  the local release gate, local browser patrol, and package evidence.

Decision:

1. Treat the PromptLane MVP reliability slices as landed for the current
   local-first runtime.
2. Improve the MCP tool registry only when the next MCP tool or schema
   change touches the registration surface.
3. Keep Codex native dialog fallback as dogfood/integration evidence, not a
   blocking core feature.
4. Keep UI patrol as an operational follow-up after the next functional slice.
5. Treat future dependency/security/package-manager warnings as reliability
   work only when they affect local-first install, build, test, pack, or CI
   evidence.

9.5 quality upgrade:

- `docs/superpowers/plans/2026-07-05-promptlane-95-quality-plan.md` defines
  the evidence bars needed to move product planning, privacy, Codex/Claude
  integration, setup/MCP smoke, loop memory, web operations, and release
  stability from beta-grade to 9.5/10.
- The explicit operator-approved native ask UI dogfood slice is complete. Web
  operations use local `ui-patrol` and `dogfood:web-user-flow` evidence rather
  than scheduled GitHub Actions evidence.
- The 9.5 quality plan now includes an Evidence Progress Ledger with PR #417,
  PR #419, PR #421, PR #425, PR #427, PR #429, PR #433, PR #447, PR #449,
  PR #450, PR #457, PR #458, PR #460, PR #464, workflow_dispatch run
  `28717406758`, local release gate,
  `docs/RELEASE_STABILITY_EVIDENCE_2026-07-06.md`, the missing `schedule`
  event, and the 9.5 Evidence Completion State.
- `corepack pnpm evidence:quality` emits the machine-readable
  `promptlane_95_quality` summary. It includes `scorecard_axes` and direct
  evidence checks so agents do not claim 9.5 completion unless every scorecard
  axis and direct evidence item is complete. Release/goal-completion checks can
  run `corepack pnpm evidence:quality -- --require-complete` to fail closed if
  that summary regresses from `complete`. JSON parsers should use
  `corepack pnpm --silent evidence:quality` or
  `node scripts/quality-95-evidence.mjs` to avoid package-manager banners.
  Installed CLI users can inspect the same summary with
  `promptlane quality-evidence --json` and fail closed with
  `promptlane quality-evidence --require-complete`. They can also run
  `promptlane quality-evidence --operator-brief` to print the focused
  native-dialog approval status without opening the dialog.
  The JSON includes `axis_evidence_coverage`, which separates satisfied local
  proof such as `local_95_evidence_sweep`,
  `web_user_flow_current_main_evidence`, and the approved
  `native_dialog_approved_dogfood` pass from any future remaining gaps.
  The JSON also includes `scorecard_review_candidates`, which lists axes whose
  local evidence is present and whose only remaining gap is
  `scorecard_level_below_9_5`, without treating those axes as complete.
  The same JSON includes `recommended_next_slices`, which now skips already
  recorded local evidence actions and puts `scorecard_review_candidates` first
  when review candidates exist. After `web_user_flow_current_main_evidence`,
  `privacy_raw_free_regression_sweep`, and
  `codex_claude_setup_smoke_refresh`, and approved native-dialog dogfood were
  run and recorded, no external quality action remains. If a future
  recommendation is approval-gated, it must carry `blocked_by_external_event`
  so agents can distinguish local work from operator wait states.
  The JSON also includes `release_gate`: the local commands to run before any
  final long-running-goal completion claim, currently `corepack pnpm format`,
  `corepack pnpm test`, `corepack pnpm lint`, `corepack pnpm build`,
  `corepack pnpm pack:dry-run`, `corepack pnpm --silent benchmark -- --json`,
  `corepack pnpm e2e:browser`, `corepack pnpm smoke:release`,
  `corepack pnpm smoke:package-install`,
  `corepack pnpm evidence:quality -- --require-complete`,
  `corepack pnpm promptlane quality-evidence --require-complete`, and
  `git diff --check`.
  The JSON also includes `release_warnings`; currently
  `real benchmark fixtures are missing` keeps `quality-evidence` complete for
  the local release gate while warning agents.
  Important: do not claim real-user effectiveness trends until consent-bearing
  redacted real fixtures are collected in an operator-owned local file and run
  after
  `promptlane benchmark init-fixture --output "$FIXTURE_FILE"`, replacing all
  examples, updating `consent_note`, setting `template_only` to `false`, and with
  `promptlane benchmark --fixture-set real --fixture-file "$FIXTURE_FILE"`.
  Real prompts without operator-confirmed `passed` or `failed` outcomes remain
  `unproven`; the benchmark must not synthesize those outcomes.
  Save a successful snapshot with `--json --report-file "$BASELINE_REPORT"`;
  then use `--baseline-file "$BASELINE_REPORT"` with the same corpus
  fingerprint before calling the result a trend.
  That local scorecard review is now applied for the five non-external
  candidates: local-first privacy boundary, setup/doctor/MCP smoke, loop memory
  and continuation, web UI and operational evidence, and release stability are
  9.5/10 in the scorecard. Codex/Claude operator dogfood and native-dialog
  approved dogfood are now recorded.
  Product planning is now also 9.5/10 after
  `docs/PRODUCT_POSITIONING_EVIDENCE_2026-07-06.md` recorded current GitHub
  repository metadata, README/package/plugin metadata, the PromptLane product
  contract, PromptLane legacy decision, backlog, and goal-audit alignment.
  `quality-evidence` records this as
  `product_positioning_metadata_alignment`.
  Codex/Claude operator dogfood and native-dialog approved dogfood are now
  recorded.
  `docs/UI_PATROL_EVIDENCE_2026-07-06.md` records the current local
  workflow_dispatch artifact, local `corepack pnpm ui-patrol`, and
  `dogfood:web-user-flow` browser evidence. `quality-evidence` records this as
  `manual_ui_patrol_artifact_evidence` and `local_ui_patrol_evidence`.
  Scheduled GitHub Actions evidence is no longer a blocker or requirement.
  `docs/CODEX_CLAUDE_LOCAL_INTEGRATION_EVIDENCE_2026-07-06.md` records current
  setup, hook, MCP, elicitation, no-dialog fallback, first-loop, loop-memory,
  and approved native-dialog evidence. `quality-evidence` records this as
  `codex_claude_local_integration_evidence` plus completed
  `native_dialog_approved_dogfood`.
  `docs/NATIVE_DIALOG_DOGFOOD_AUDIT_2026-07-05.md` is also shipped as
  `native_dialog_preflight` and approved native-dialog evidence: it proves MCP
  elicitation, no-dialog fallback behavior, and the explicitly approved
  `native_dialog_approved_dogfood` pass.
- `quality-evidence` now includes structured criteria for future
  operator-gated recommendations. If a future native-dialog operator dogfood
  recommendation appears, it must include `blocked_reason`, preconditions,
  completion evidence, and guardrails so agents do not run approval-gated
  native UI automatically.
- The human `promptlane quality-evidence` summary now renders the current
  complete evidence status directly. `promptlane quality-evidence
--operator-brief` prints the current approval status, refusal preflight
  command, completion evidence, and guardrails while explicitly not opening a
  native dialog. The refusal preflight command is
  `corepack pnpm dogfood:mcp-native-dialog-refusal`.
  The default blocker list also prints each blocker `remaining_evidence` and
  blocker `next_action`, so agents no longer need to switch to JSON output just
  to decide which lower-level evidence keeps an axis below 9.5.
- PR #478 moved that quality evidence gate onto the installed product CLI. Main
  CI run `28753458359` passed Node 22 and Node 24 after merge, so `promptlane
quality-evidence --require-complete` is now a current default-branch release
  and goal-completion guard rather than only a repo-local npm script.
- The earlier GitHub Actions Node 20 runtime annotation and Node 24
  `better-sqlite3` install warning are closed. Keep the release-stability bar
  focused on fresh CI/package warnings that affect local-first install, build,
  test, pack, or scheduled operational evidence.
- `dogfood:web-user-flow` is the repeatable fresh web user-flow evidence lane;
  it runs the same Playwright-backed archive/detail/dashboard/coach/projects/
  mcp/exports/settings/mobile flow documented in
  `docs/DOGFOOD_WEB_USER_FLOW_2026-07-05.md`.
- After `web_user_flow_current_main_evidence` became the first
  `recommended_next_slices` item, `corepack pnpm dogfood:web-user-flow` was run
  on current main and completed with `browser e2e passed`. This proves the
  recommended local evidence action is executable. Approved native-dialog
  dogfood is recorded separately and remains explicit-approval-only.
- After `privacy_raw_free_regression_sweep` became the first
  `recommended_next_slices` item, `corepack pnpm test -- src/security src/hooks
src/mcp` was run on current main-derived work and passed with 108 test files
  and 833 tests. This refreshes the highest-risk raw-free agent-surface
  evidence without treating native-dialog dogfood as complete.
- After `codex_claude_setup_smoke_refresh` became the first
  `recommended_next_slices` item, `corepack pnpm smoke:agent-setup` passed on
  current main-derived work. The smoke rebuilt server/web assets, exercised
  setup dry-run, setup with MCP registration, Claude Code doctor, and Codex
  doctor, then ended with `promptlane agent setup smoke passed`. This
  refreshes local Codex/Claude setup evidence without opening provider CLIs;
  approved native-dialog dogfood is recorded separately.
- `docs/LOCAL_95_EVIDENCE_2026-07-06.md` records the current local 9.5 evidence
  sweep after `corepack pnpm smoke:hooks` ended with `hook binary smoke passed`,
  `corepack pnpm smoke:mcp-coach-loop` ended with
  `mcp coach loop smoke passed`, `corepack pnpm dogfood:first-coach-loop` ended
  with `first coach loop dogfood passed`,
  `corepack pnpm dogfood:loop-memory-approval` ended with
  `loop memory approval dogfood passed`, `corepack pnpm smoke:release` ended
  with `release smoke passed` after checking the built product quality evidence CLI gate,
  and `corepack pnpm --silent benchmark -- --json` returned
  `privacy_leak_count: 0` plus `archive_effectiveness_score: 1`.
  This ledger strengthens current local proof while native-dialog approval
  evidence is tracked through the approved audit.
- fresh current-main web user-flow evidence is now recorded after PR #465:
  `corepack pnpm dogfood:web-user-flow` passed on main-derived work after main
  CI run `28750766036`, proving the archive/detail/dashboard/coach/projects/
  mcp/exports/settings/mobile flow still works after the latest evidence-ledger
  changes.
- Expected-impact evidence is now visible in CLI/MCP/Web surfaces and guarded by
  focused tests plus browser E2E, so future prompt-improvement work should
  preserve a measurable before/after signal instead of only returning a rewrite.
- Prompt-linked outcome evidence, CLI prompt outcome evidence, and Prompt effectiveness verdict
  are landed evidence-quality slices: prompt detail,
  storage `getPrompt()`, `promptlane show --json`, and the web prompt detail
  now connect `expected_impact` predictions to actual raw-free loop outcomes.
  Improvement effectiveness is only proven when `used_improvement_prompt_ids`
  explicitly attributes use; an ordinary linked pass remains `unproven`. This
  avoids treating work success as causal evidence for an unused draft or as scheduled
  `ui-patrol` or native-dialog completion evidence.
- The effectiveness calibration evidence extends that same raw-free
  `effectiveness` evidence with linked-outcome, attributed-outcome, passing-outcome,
  failing-outcome, and total-test counts so users and agents can judge the
  strength of the verdict, not only its label.
- MCP score_prompt effectiveness evidence is the landed agent-native follow-up:
  `score_prompt` now exposes raw-free `effectiveness` verdict and calibration
  counts for stored prompt ids so Codex and Claude Code can inspect impact
  evidence through structured MCP content without opening the web UI or running
  `promptlane show --json`. PR #462 and latest main CI run `28750281428`
  proved this on the default branch.
- Archive-level effectiveness summary is landed: archive score
  reports now expose `effectiveness_summary` through `promptlane score
--json`, human `promptlane score` output, `/api/v1/score`, and MCP
  `score_prompt_archive`, allowing Codex and Claude Code to compare measured vs
  unmeasured prompts, proven/mixed/unproven verdicts, linked outcomes, tests
  run, safe evidence refs, and next action before claiming prompt improvement
  is actually working.
- Web archive effectiveness summary is the landed user-facing follow-up: the
  Dashboard Archive score review renders that same `effectiveness_summary`, and
  browser E2E now asserts measured vs unmeasured coverage plus the review-first
  next action so web users can judge effect without switching to CLI JSON or
  MCP output.
- Archive effectiveness benchmark evidence is landed: PR #469 added
  `archive_effectiveness_score` as a benchmark hard gate, and
  `corepack pnpm --silent benchmark -- --json` reported
  `archive_effectiveness_score: 1`, `privacy_leak_count: 0`, and raw-free
  `effectiveness_summary` coverage from a synthetic explicitly attributed
  passed outcome. This proves the contract, not real-user effectiveness. Main CI
  run `28751693022` passed `test (22)` and `test (24)` after merge.
- One-call coach effectiveness guidance is landed:
  `coach_prompt` agent briefs now summarize measured vs unmeasured archive
  effectiveness coverage, linked outcomes, tests run, and safe evidence refs,
  and `coach_prompt_actionability` requires that signal before the benchmark
  can pass.
- MCP coach-loop smoke now repeats that one-call path over the real stdio MCP
  server: `smoke:mcp-coach-loop` calls `coach_prompt`, verifies the
  `Effectiveness evidence` summary, checks the review-first unmeasured prompt
  action, and confirms safe evidence refs remain raw-free.

Rationale:

- PromptLane now has enough agent-loop runtime surface that storage-backed
  features should fail clearly at registration instead of varying by route or
  MCP handler.
- Capability negotiation directly protects local-first reliability for Codex
  and Claude Code integrations.
- MCP registry cleanup is valuable, but ADR 0001 deliberately avoids a broad
  rewrite until a tool-list change creates real pressure.
- More rename or plugin alias work has lower product value than making the
  current `promptlane` compatibility runtime safer and easier to extend after
  the PromptLane product-facing contract lands.
- Security and package-manager hygiene should remain tightly scoped: update the
  smallest dependency/config surface that removes the alert or warning, then
  prove it with audit, install/build/pack, and CI.
- Release checklists should follow the same package lifecycle contract as
  `docs/NPM_PUBLISHING.md` and `docs/PACKAGE_CONTENTS.md`; avoid allowing
  stable release gates to drift back to PATH-dependent bare `pnpm` commands.
- README contributor gates should follow the same rule: use `corepack pnpm`
  for release/build/package verification, while preserving `promptlane`
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

### 2. PromptLane MVP Reliability Slice Status

No immediate MVP reliability slice remains from the current PromptLane product
contract. Effectiveness work must preserve explicit improvement-use attribution
and should next collect consent-bearing real fixtures instead of adding
prediction-only surfaces.

The archive-backed `promptlane benchmark prepare-fixture` path is now the
preferred collection workflow: it requires explicit prompt ids, a raw-free
consent note, and `--confirm-consent`, then writes a new private fixture without
echoing prompt bodies or paths. `init-fixture` remains the manual alternative.
`promptlane benchmark candidates --json` now discovers eligible prompt ids from
at most the latest 100 loop snapshots without returning prompt bodies, paths,
outcome summaries, or evidence references; operators still review and consent
before fixture preparation.

Completed:

- storage capability negotiation: shared route capability guard and explicit MCP
  storage-unavailable setup guidance
- capability-aware MCP setup/status responses: shared raw-free setup recovery
  message for storage-backed MCP handlers
- evidence-first loop memory review: candidate generation requires passed loops
  with evidence and storage writes reject missing or unsafe evidence refs
- focused Codex and Claude Code smoke coverage: `smoke:agent-setup` verifies
  setup/doctor happy paths without running real provider CLIs
- prompt-linked outcome evidence: prompt detail API and web detail can show
  raw-free loop outcome status, summary, evidence refs, and test-count metadata
  for prompts included in explicit loop snapshots
- CLI prompt outcome evidence: `promptlane show --json` reads the same
  storage-level `loop_outcomes` contract so agent-native workflows can inspect
  actual outcome evidence alongside the stored prompt metadata
- web improvement attribution: the selected snapshot outcome form exposes only
  safe prompt ids, requires explicit per-prompt selection before recording
  PromptLane improvement use, and restores existing selections after reload so
  outcome edits do not silently erase attribution

Next work should come from fresh user-flow evidence, a real MCP tool/schema
change, or explicit operator-approved dogfood.

### 3. MCP Registry Follow-Up (only when registration changes)

Goal:

- Remove the manual definition/handler sync risk identified by ADR 0001 without
  migrating every legacy split-layout tool.

Scope:

- Introduce an explicit data registry only when a new MCP tool, schema change,
  or capability-filtered catalogue work already touches `src/mcp/server.ts`.
- Do not use import-time global mutation.
- Derive `tools/list` and `tools/call` dispatch from the same registered tool
  list.

### 4. User-Flow Validation Passes

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

### 5. Codex Native Dialog Fallback Dogfood

Goal:

- Prove, with explicit operator approval, whether Codex native dialog fallback
  can collect answers cleanly in the real desktop/CLI flow.

Scope:

- Existing native dialog preflight/smoke harnesses have passed; use
  `docs/NATIVE_DIALOG_DOGFOOD_AUDIT_2026-07-05.md` as the evidence baseline.
- `corepack pnpm dogfood:mcp-native-dialog-approved` now exists and refuses to
  run unless `PROMPTLANE_NATIVE_DIALOG_APPROVED=1` is set.
- Do not open OS dialogs unexpectedly from automated tests.
- Treat this as integration evidence; do not block core loop-memory work on it.

### 6. `App.tsx` Query-Hook Extraction

First slice landed after the reuse-flow audits showed prompt detail copy and
save state still had to be threaded through `App.tsx`: selected prompt detail
loading is now isolated behind a focused query hook.

Remaining scope:

- Continue extracting only when a user-flow change touches the relevant state
  boundary.
- Favor small hooks with focused tests over a broad `App.tsx` rewrite.

### 7. Local UI Patrol

`ui-patrol` remains a local browser verification command. It reuses the
synthetic browser E2E flow and stores desktop/mobile screenshot artifacts
through `SCREENSHOT_DIR` so visual regressions remain visible across sessions.

Operational checkpoint:

- Initial `workflow_dispatch` run `28717201110` failed because the GitHub
  runner did not have Playwright Chromium installed.
- PR #341 added `pnpm exec playwright install chromium` before `pnpm
ui-patrol`.
- Follow-up `workflow_dispatch` run `28717406758` passed and uploaded 9
  screenshot artifacts.
- Local `corepack pnpm ui-patrol` on current main after PR #410 passed and
  captured 9 png files: archive, detail, dashboard, coach, projects, MCP,
  exports, settings desktop, and settings mobile.

Remaining scope:

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
