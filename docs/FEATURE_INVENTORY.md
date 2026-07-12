# LoopRelay Feature Inventory

Status: canonical product capability inventory  
Reviewed against: `d72fb340` plus the action-inbox/failure-episode working slice
Last reviewed: 2026-07-12

This is the source of truth for what LoopRelay currently does. It separates
shipping behavior from validation tooling, dormant code, reserved structures,
and product ideas. A class, route, or database field existing in the repository
does not by itself make a feature active.

## Status legend

| Status         | Meaning                                                                             |
| -------------- | ----------------------------------------------------------------------------------- |
| **Active**     | Available through a supported CLI, MCP, hook, or web flow.                          |
| **Opt-in**     | Implemented, but disabled until the operator explicitly enables or invokes it.      |
| **Validation** | Used to measure LoopRelay itself; not a normal product workflow.                    |
| **Dormant**    | Kept working but intentionally not developed or promoted in the current solo phase. |
| **Reserved**   | Schema, directory, or policy surface exists without an active execution path.       |

## Product boundary

LoopRelay is a local continuity and evidence layer for long-running coding-agent
work. Its sharpest workflow is:

1. capture the selected session, worktree, branch, checkpoint, and compact
   boundary;
2. produce a continuation brief for the next Codex or Claude Code session;
3. connect the request and any accepted improvement to a real outcome;
4. detect recurring evidence-backed patterns across loops;
5. let the operator approve a lesson or repository-instruction patch;
6. recommend a non-binding agent role/model strategy and record the raw-free
   result against the selected loop.

LoopRelay is local-first. It does not scrape private agent transcripts, submit
prompts on the user's behalf, switch models automatically, approve memories
automatically, edit repository instructions without confirmation, or provide a
cloud account/synchronization service.

## Capability map

| Area                        | Status                 | What ships                                                                     |
| --------------------------- | ---------------------- | ------------------------------------------------------------------------------ |
| Agent setup and readiness   | Active                 | Guided setup, doctor, hook/MCP/service checks, recent-ingest readiness         |
| Prompt capture and privacy  | Active                 | Codex/Claude Code ingest, redaction, exclusions, deduplication                 |
| Long-loop continuity        | Active                 | Snapshot collection, checkpoint, compact boundary, selected-loop brief         |
| Continuation receipts       | Active                 | Brief generation, copy/delivery/use lineage, raw-free recovery outcome         |
| Outcome evidence            | Active                 | Typed test/build/commit/review/external evidence plus compatibility references |
| Action and failure control  | Active                 | Operator-local inbox, outcomes, confirmed failure lifecycle                    |
| Memory and instructions     | Active, approval-gated | Candidate proposal, approval, patch proposal, explicit apply                   |
| Adaptive Agent Guide        | Active, non-binding    | Role/model guidance, switch condition, selected-loop run capture               |
| Prompt archive and coaching | Active                 | Search, score, improve, clarify, bookmark, reuse and pattern analysis          |
| Admin workspace             | Active                 | Overview, Loops, Actions, Evidence, Insights, Archive, Projects and settings   |
| Automatic judging           | Opt-in                 | Local Claude/Codex subprocess judging, disabled by default                     |
| Export and import           | Dormant                | Implemented and maintained, not part of the current core workflow              |
| Effectiveness studies       | Validation             | Matched pairs, clean-install smoke, operator runs, generated reports           |
| Quarantine and spool        | Reserved               | Owner-only empty directories; no active writer or recovery queue               |

## 1. Installation, process, and client integration

### Active

- npm package with three binaries: `looprelay`, `lr-claude`, and `lr-codex`.
- Guided initialization and setup for a local data directory, service, hooks,
  MCP registration, status surfaces, and web opening.
- Local server start with authenticated browser session bootstrap.
- Background service install, start, stop, and status, including a macOS
  LaunchAgent path.
- Scheduled loop collection install, status, and uninstall through a macOS
  LaunchAgent.
- Claude Code hook installation and removal.
- Codex notification/hook integration and wrapper support.
- Claude Code status line, status-line chaining, and uninstall.
- Codex HUD installation for supported terminal multiplexers, with explicit
  guidance when the current terminal cannot host it.
- Repository slash commands under the `/looprelay:*` namespace.
- Doctor checks for server, service, privacy configuration, hook delivery, MCP
  registration, and recent Codex/Claude Code ingest.
- JSON output on automation-oriented CLI paths where supported.

### Installed Claude Code slash commands

- `/looprelay:buddy`
- `/looprelay:coach`
- `/looprelay:guard`
- `/looprelay:habits`
- `/looprelay:improve-last`
- `/looprelay:judge`
- `/looprelay:open`
- `/looprelay:score`
- `/looprelay:setup`
- `/looprelay:status`

### Hook events

- `UserPromptSubmit` capture for Claude Code and Codex adapters.
- Claude Code `SessionStart` capture.
- `Stop` lifecycle collection for the latest loop snapshot.
- `PreCompact` and `PostCompact` boundary capture.
- Fail-open local delivery: unavailable LoopRelay must not block the coding
  agent's primary work.
- Rewrite guard that returns diagnosis or clarification guidance instead of
  silently replacing and submitting the user's request.

## 2. Capture, privacy, and local storage

### Active

- Local data root at `~/.looprelay` unless the operator overrides it.
- Prompt Markdown archive plus SQLite metadata and full-text search index.
- Owner-only directory and sensitive-file permissions.
- Default secret and sensitive-value masking before persistence.
- Configurable redaction modes (`mask`, `reject`, and explicitly selected
  `raw`), excluded-project matching, and per-project capture disablement.
- HMAC-derived opaque project identifiers and browser-safe project labels.
- Stable event identifiers and deduplication/idempotency for repeated delivery.
- Redaction-event accounting and sensitive-entry visibility in the admin UI.
- Hard prompt deletion cascading through related metadata, FTS, and Markdown.
- Search-index rebuild from the durable Markdown archive, with integrity and
  redaction validation.

### Persisted evidence domains

- projects, sessions, prompts, prompt analysis, tags, and prompt-tag links;
- prompt usage events, bookmarks, improvement drafts, and ask events;
- redaction events and project policy audit events;
- loop snapshots, compact boundaries, loop memories, merge decisions, and
  operator-confirmed failure episodes;
- loop outcomes, evidence references, and improvement attribution;
- project instruction reviews and instruction-patch evidence;
- judge scores, agent prompt judgments, coach feedback, and agent runs;
- import jobs/records/errors and export jobs.

### Logical SQLite tables

The initialized schema contains 31 logical tables. SQLite's five internal FTS
support tables are implementation details and are not counted separately.

- `agent_prompt_judgments`
- `agent_runs`
- `coach_feedback`
- `compact_boundaries`
- `continuation_receipts`
- `export_jobs`
- `import_errors`
- `import_jobs`
- `import_records`
- `loop_memories`
- `loop_failure_episodes`
- `loop_merge_decisions`
- `loop_snapshots`
- `policy_audit_events`
- `project_instruction_reviews`
- `project_policies`
- `projects`
- `prompt_analyses`
- `prompt_ask_events`
- `prompt_bookmarks`
- `prompt_fts`
- `prompt_improvement_drafts`
- `prompt_judge_scores`
- `prompt_tags`
- `prompt_usage_events`
- `prompts`
- `redaction_events`
- `schema_migrations`
- `sessions`
- `settings`
- `tags`

## 3. Prompt archive, retrieval, and reuse

### CLI and web behavior

- List, search, show, open, and hard-delete archived prompts.
- Full-text query plus tool, tag, project/path, date, saved, reused,
  duplicated, sensitive, and quality-gap filters.
- Pagination, multi-selection, and bulk deletion in the web archive.
- Prompt detail with original metadata, score, checklist, quality gaps, usage
  history, related events, and similar prompts.
- Bookmark/save state, copy tracking, improvement-draft save/copy tracking,
  and prompt-reuse evidence.
- Similar-prompt retrieval and repeated-pattern discovery.
- Queue navigation between review candidates.
- Rebuildable search index.

## 4. Prompt analysis, coaching, and clarification

### Active

- Deterministic prompt scoring and checklist generation.
- Quality-gap detection for context, goal, constraints, scope, verification,
  and related request properties.
- Local prompt improvement suggestions without automatic submission.
- Clarification-question generation for materially ambiguous requests.
- Applying operator-provided clarification answers to an improvement draft.
- Recording clarification events and whether asking helped.
- Coach suggestions based on archive patterns and current prompt gaps.
- Helpful, not-helpful, and wrong coach-feedback capture.
- Project-instruction review for AGENTS.md and CLAUDE.md guidance quality.
- Archive-level score review and low-score candidate queues.

### Opt-in automatic judge

- Local subprocess judging through a configured Claude or Codex executable.
- Disabled by default, redacts before subprocess invocation, and applies rate
  limits and output validation.
- Configurable through local settings/config API; it is not required for the
  deterministic core and is not presented as an autonomous cloud judge.

## 5. Long-running loop continuity

### Active

- Collect loop snapshots for the current or selected repository/worktree.
- Track repository root, worktree, branch, session, dirty state, HEAD, recent
  commits, focused verification, checkpoints, and compact boundaries.
- Select a loop by worktree/session/branch instead of accidentally using the
  globally newest snapshot.
- Show current loop status and worktree drill-down.
- Record an explicit checkpoint before handoff or compaction.
- Generate an evidence-backed continuation brief by snapshot ID or selection.
- Attach a `recovery-packet-v2` contract and generated receipt to CLI, MCP, and
  explicit Web copy flows.
- Record copied, delivered, followed, partial, or ignored receipt state without
  transcript capture, including declared target/first-action correctness, TTFV,
  friction, and a raw-free deviation reason.
- Copy an exact next-session continuation command/brief from the web workspace.
- Detect stale or unsafe continuation evidence and surface it rather than
  presenting uncertain state as ready.
- Record explicit merge-readiness decisions and list their history.
- Collect snapshots on demand, through hooks, or on a local schedule.

## 6. Outcomes and engineering evidence

### Active

- Record `passed`, `failed`, `blocked`, or `unknown` against a selected loop.
- Close an explicitly selected loop atomically with its exact continuation
  receipt, typed evidence, and optional Guide attribution.
- Attach focused-test or other evidence references without storing a private
  reasoning transcript.
- Store evidence kind, label, observation time, result, verification source,
  and optional HEAD hash while retaining legacy evidence-reference support.
- Link the outcome to the prompt and to an accepted improvement draft.
- Track failure transitions, recommendation adoption, attempts, time to first
  value, and focused-test evidence where the flow supplies them.
- Distinguish linked, attributed, and passing evidence coverage.
- Show quality trends, project signals, active loops, unstable loops, and next
  evidence actions on the Overview and Evidence surfaces.
- Preserve negative and null findings; generated usefulness reports keep
  `causal_claim` false.
- Derive one operator-local action inbox from only the latest snapshot per
  active loop so intermediate hook snapshots do not become a false backlog.
- Confirm failed/blocked episodes with an explicit category, intervention,
  resolution or wont-fix decision; LoopRelay does not infer episodes from a
  transcript.
- Aggregate operator-confirmed episodes by category, lifecycle count, distinct
  explicit session count, and last confirmation time. A category is recurring
  only after confirmation in at least two distinct agent sessions; missing
  session metadata fails closed instead of implying recurrence.

## 7. Memory and repository-instruction promotion

### Active, always approval-gated

- Propose a loop-memory candidate from repeated, outcome-linked evidence.
- Review and explicitly approve a candidate before it becomes local memory.
- Propose an AGENTS.md or CLAUDE.md instruction patch from approved evidence.
- Preview the target, rationale, and patch before applying it.
- Apply only through an explicit operator action and retain the decision trail.
- Prevent unsupported observations from being silently promoted into durable
  instructions.

## 8. Adaptive Agent Guide

### Active and non-binding

- Recommend a working role/profile and model class for the selected task and
  current loop evidence.
- Explain the recommendation, confidence, expected trade-off, and a condition
  for switching strategy.
- Support Codex-style and Claude Code-style client/model vocabularies without
  claiming that LoopRelay controls those clients.
- Record the actual selected profile, outcome, attempts, first-value seconds,
  focused-test count, and whether the recommendation was accepted.
- Bind a recorded run to the selected loop snapshot rather than the newest
  global snapshot.
- Store raw-free run evidence for later adoption and outcome analysis.

LoopRelay does **not** change the active model automatically. The operator or
coding agent decides whether to follow the recommendation.

## 9. Projects and policies

### Active

- Project list and detail workspace using opaque identifiers.
- Prompt, sensitive-entry, quality-gap, reuse, and loop counts by project.
- Latest-loop continuation action and recommendation-adoption metrics.
- Per-project capture and export enable/disable policies with audit history.
- Project instruction analysis and most recent review state.
- Outcome and coach-feedback attribution by project.

### Policy-only fields

- `analysis_disabled` is stored and editable as policy metadata; it is not a
  complete autonomous purge of all analysis already present.
- `retention_candidate_days` schedules review intent; it does not delete data.
- `external_analysis_opt_in` records permission; it does not make an external
  network request.

## 10. Web admin workspace

The responsive web UI supports English and Korean, a collapsible left
navigation, authenticated same-origin API access, loading/error/empty states,
and desktop/mobile layouts.

### Operate

- **Overview** (`/dashboard`): loop health, next-action queue, quality trend,
  evidence coverage, project signal, active worktrees/sessions, and runtime
  health/privacy strip.
- **Loops** (`/loops`): worktree/session/branch selection, continuation brief,
  outcome entry, memory approval, instruction patching, merge decisions,
  benchmark readiness, and Agent Guide/run capture.
- **Actions** (`/actions`): prioritized continuity/evidence/memory debt,
  operator-confirmed failure lifecycle, and recent operator-local outcomes.
  Product studies remain separate on Evidence.

### Learn

- **Evidence** (`/scores`): metric strip, score trend, outcome coverage,
  resume-reliability matched pairs, ask-mode summary, archive score review, and
  coach-feedback summary.
- **Insights** (`/coach`): habit coach, insight coverage, recurring failure
  patterns, diagnosis, instruction suggestions, and links into filtered work.

### Manage

- **Archive** (`/` and `/prompts/:id`): retrieval, filters, detail, scoring,
  improvement, clarification, bookmark, reuse, feedback, and deletion.
- **Projects** (`/projects` and `/projects/:id`): project health, latest loop,
  instructions, policy, evidence, adoption, and attribution.

### Configure

- **Integrations** (`/mcp`): Codex/Claude MCP setup, live readiness, recent
  ingest, recommended MCP call order, tool catalog, and examples.
- **Settings** (`/settings`): onboarding, service/server/data path, capture and
  redaction state, excluded projects, hook delivery, and folded MCP/export
  setup.
- **Export** (`/exports`): preview, preset selection, execution, privacy
  metadata, JSON copy, and download. This surface is dormant in product scope.

### Complete client-side view and route inventory

- `view:list` — `/`
- `view:detail` — `/prompts/:id`
- `view:dashboard` — `/dashboard`
- `view:coach` — `/coach`
- `view:loops` — `/loops` with optional worktree/session/branch query
- `view:actions` — `/actions`
- `view:scores` — `/scores`
- `view:projects` — `/projects`
- `view:project` — `/projects/:id`
- `view:mcp` — `/mcp`
- `view:exports` — `/exports`
- `view:settings` — `/settings`

The local server also retains SPA-entry compatibility paths `/practice`,
`/benchmark`, `/insights`, `/import`, and `/prompts`. They currently fall back
to the archive view; they are not separate active product pages.

## 11. Complete CLI command tree

The current Commander tree contains 74 command paths. Parent commands are
listed because they provide their own help and, in some cases, behavior.

### Setup, runtime, and integrations

- `init`
- `start`
- `setup`
- `doctor`
- `server`
- `service`
- `service install`
- `service start`
- `service stop`
- `service status`
- `mcp`
- `hook`
- `hook session-start`
- `hook claude-code`
- `hook status`
- `hook codex`
- `install-hook`
- `uninstall-hook`
- `statusline`
- `statusline-chain`
- `install-statusline`
- `uninstall-statusline`
- `install-codex-hud`
- `buddy`

### Loop continuity, evidence, and guide

- `loop`
- `loop status`
- `loop collect`
- `loop checkpoint`
- `loop brief`
- `loop receipt`
- `loop close`
- `loop actions`
- `loop failure`
- `loop failure record`
- `loop failure list`
- `loop outcome`
- `loop memory-candidate`
- `loop memory-approve`
- `loop instruction-patch`
- `loop instruction-apply`
- `loop decision`
- `loop decision record`
- `loop decision list`
- `loop schedule`
- `loop schedule install`
- `loop schedule status`
- `loop schedule uninstall`
- `guide`
- `guide next`
- `guide record-run`

### Prompt archive, coaching, and projects

- `coach`
- `improve`
- `score`
- `list`
- `search`
- `show`
- `delete`
- `open`
- `rebuild-index`
- `project`
- `project list`
- `project show`
- `project set`
- `review-project-instructions`

### Validation and dormant transfer paths

- `benchmark`
- `benchmark init-fixture`
- `benchmark prepare-fixture`
- `benchmark pair-candidates`
- `benchmark prepare-pair`
- `benchmark candidates`
- `quality-evidence`
- `export`
- `import`
- `import-job`

## 12. Complete MCP tool inventory

The MCP server exposes 27 tools. Tool names are a compatibility surface.

### Readiness, coaching, and clarification

- `get_looprelay_status`
- `coach_prompt`
- `score_prompt`
- `improve_prompt`
- `apply_clarifications`
- `ask_clarifying_questions`
- `record_clarifications`

### Loop continuity, outcome, memory, and instructions

- `get_looprelay_loop_status`
- `prepare_loop_brief`
- `record_continuation_receipt`
- `get_looprelay_action_inbox`
- `record_failure_episode`
- `record_loop_outcome`
- `propose_loop_memory_candidate`
- `record_loop_memory`
- `propose_instruction_patch`
- `apply_instruction_patch`

### Benchmark and evaluation

- `get_benchmark_candidates`
- `get_paired_benchmark_candidates`
- `score_prompt_archive`
- `review_project_instructions`

### Agent-native rewrite and judging

- `prepare_agent_rewrite`
- `record_agent_rewrite`
- `prepare_agent_judge_batch`
- `record_agent_judgments`

### Adaptive Agent Guide

- `recommend_agent_strategy`
- `record_agent_run`

## 13. Local HTTP implementation surfaces

These are authenticated local implementation routes, not a hosted public API.
Browser mutation routes require application authentication and CSRF; ingest
mutations use the separate ingest bearer token.
The route source contains 42 product API routes and 17 static delivery routes.

### Runtime and ingest

- `GET /api/v1/health`
- `GET /api/v1/session`
- `POST /api/v1/ingest/claude-code`
- `POST /api/v1/ingest/codex`
- `POST /api/v1/ingest/ask-event`

### Prompt archive, score, and feedback

- `GET /api/v1/prompts`
- `GET /api/v1/prompts/:id`
- `DELETE /api/v1/prompts/:id`
- `GET /api/v1/prompts/:id/similar`
- `POST /api/v1/prompts/:id/events`
- `PUT /api/v1/prompts/:id/bookmark`
- `POST /api/v1/prompts/:id/improvements`
- `POST /api/v1/prompts/:id/improvements/:draft_id/copy`
- `POST /api/v1/prompts/:id/coach-feedback`
- `GET /api/v1/coach-feedback/summary`
- `GET /api/v1/ask-events/summary`
- `GET /api/v1/quality`
- `GET /api/v1/score`

### Projects and loops

- `GET /api/v1/projects`
- `GET /api/v1/projects/:id/instructions`
- `POST /api/v1/projects/:id/instructions/analyze`
- `PATCH /api/v1/projects/:id/policy`
- `GET /api/v1/loops`
- `GET /api/v1/loops/worktrees/:worktree`
- `GET /api/v1/loops/brief`
- `POST /api/v1/loops/brief`
- `GET /api/v1/loops/:id/brief`
- `PATCH /api/v1/loops/receipts/:id`
- `POST /api/v1/loops/:id/outcome`
- `POST /api/v1/loops/memory/approve`
- `GET /api/v1/loops/instruction-patch`
- `GET /api/v1/actions`
- `GET /api/v1/failure-episodes`
- `POST /api/v1/failure-episodes`

### Agent Guide, settings, and transfer

- `GET /api/v1/agent-guide`
- `POST /api/v1/agent-guide/runs`
- `GET /api/v1/agent-readiness`
- `GET /api/v1/settings`
- `PATCH /api/v1/settings/auto-judge`
- `POST /api/v1/exports/preview`
- `POST /api/v1/exports`
- `POST /api/v1/import/dry-run`

### Static SPA and asset delivery

- `GET /`
- `GET /dashboard`
- `GET /coach`
- `GET /practice`
- `GET /scores`
- `GET /benchmark`
- `GET /insights`
- `GET /loops`
- `GET /actions`
- `GET /projects`
- `GET /mcp`
- `GET /exports`
- `GET /import`
- `GET /prompts`
- `GET /prompts/:id`
- `GET /settings`
- `GET /assets/*`

## 14. Validation, dogfood, and release tooling

### Validation-only capabilities

- Deterministic benchmark fixtures and fixture preparation.
- Candidate and matched-pair candidate selection.
- Baseline/LoopRelay pair preparation and raw-free pair ledgers.
- Maintainer-run usefulness reports, real-repository task reports, Sol-planned
  and Terra-executed reproduction checks, and resume-reliability reports.
- Candidate clean-install and first-value timing smoke.
- Codex/Claude Code fresh-session operator protocol and readiness evidence.
- Package-install, hook, MCP coaching, MCP elicitation, native-dialog, first
  coach, loop-memory, release, and browser smoke paths.
- UI patrol and responsive browser end-to-end coverage.
- Quality-evidence generation, focused tests, type checking, formatting,
  quality gate, build, pack dry-run, npm preflight, and release smoke.

These tools measure the product; they are not evidence that independent human
usability has been established. Current reports are observational and preserve
failures, overhead, missing measurements, and confidence limits.

### Complete npm maintainer-script inventory

These 40 package scripts are build, verification, dogfood, evidence, or release
entrypoints. Their presence does not make every underlying path a user-facing
product feature.

- `build`
- `build:server`
- `build:web`
- `clean`
- `format`
- `format:write`
- `benchmark`
- `dev:web`
- `e2e:browser`
- `lint`
- `lint:format`
- `lint:quality`
- `lint:types`
- `pack:dry-run`
- `prepack`
- `prepare`
- `looprelay`
- `setup`
- `smoke:agent-setup`
- `smoke:hooks`
- `smoke:mcp-coach-loop`
- `smoke:mcp-elicitation`
- `smoke:mcp-native-dialog`
- `dogfood:mcp-native-dialog-approved`
- `dogfood:mcp-native-dialog-refusal`
- `dogfood:first-coach-loop`
- `dogfood:loop-memory-approval`
- `dogfood:web-user-flow`
- `evidence:quality`
- `evidence:usefulness`
- `evidence:real-task`
- `evidence:resume-reliability`
- `evidence:codex-metrics`
- `evidence:participant-intake`
- `npm-publish:preflight`
- `smoke:candidate-first-value`
- `smoke:package-install`
- `smoke:release`
- `test`
- `ui-patrol`

## 15. Dormant, reserved, and deliberately absent behavior

### Dormant

- Export and import remain implemented and tested but maintain-only during the
  solo phase. They wake only when the conditions in
  [ADR 0003](adr/0003-export-import-dormant-in-solo-phase.md) are met.

### Reserved

- `~/.looprelay/quarantine/` and `~/.looprelay/spool/` are created with safe
  permissions but have no active product writer, queue, release, or replay
  workflow. See [ADR 0004](adr/0004-quarantine-spool-dormant.md).
- Retention and external-analysis policy fields do not autonomously delete or
  transmit data.

### Deliberately absent

- No transcript or hidden-reasoning scraping.
- No automatic prompt submission or background rewrite replacement.
- No automatic model selection/switching in Codex or Claude Code.
- No automatic memory approval or silent AGENTS.md/CLAUDE.md editing.
- No hosted account, telemetry cloud, multi-user tenancy, or sync backend.
- No claim that a prompt score alone proves an engineering outcome.
- No claim of causal usefulness or independent-human usability from the current
  maintainer/operator evidence.

## 16. Known product and evidence limits

- Independent human usability remains unmeasured.
- Existing matched-pair evidence is directional, not causal.
- Ordinary implementation continuation has shown regression in part of the
  current evidence, so LoopRelay should not intervene by default in every task.
- Agent Guide recommendations are advisory; their adoption/outcome dataset is
  still growing and does not prove one model is universally best.
- Some policy fields are decision records rather than automatic enforcement
  engines; this document labels those boundaries explicitly.
- Export/import and reserved recovery directories must not be counted as core
  active value when evaluating product usefulness.

## 17. Maintenance rule

- Update this inventory in the same change that adds, removes, renames, or
  changes the status of a CLI command, MCP tool, web product surface, or major
  runtime capability.
- The packaging test verifies that every current CLI command path and MCP tool
  name appears here and that the document ships in the npm package.
- Feature claims must identify whether they are active, opt-in, validation,
  dormant, or reserved.
- Historical audits remain evidence snapshots and must link here instead of
  silently competing as a second source of truth.

Latest exhaustive review:
[Feature Inventory Audit — 2026-07-12](FEATURE_INVENTORY_AUDIT_2026-07-12.md).
