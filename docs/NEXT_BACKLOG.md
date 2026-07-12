# LoopRelay Next Backlog

Last updated: 2026-07-12

LoopRelay is in identity-consolidation and usefulness-validation mode. Large new
features remain frozen while agent-native usefulness evidence is collected and
used to narrow scope. The bounded local Adaptive Agent Guide is an
explicit maintainer-approved exception on 2026-07-11; it remains subject to its
own matched-pair retention decision and does not authorize provider automation.

## Current Product Contract

LoopRelay is the local continuity and evidence layer for long-running Codex and
Claude Code loops. The single runtime identity is `looprelay` across npm, CLI,
MCP, hooks, plugins, slash commands, and `~/.looprelay` storage.

Primary value:

1. recover session, worktree, branch, and compact-boundary state
2. prepare an evidence-backed continuation brief
3. connect requests to passed, failed, blocked, or abandoned outcomes
4. detect recurring failure patterns across agent sessions
5. ask for missing information instead of rewriting ambiguous requests
6. promote only approved, evidence-bearing lessons into memory or instruction proposals

## Release Gate

- Verify fresh Codex and Claude Code ingest, MCP calls, and doctor `ready` state.
- Reproduce install-to-first-continuation in a clean temporary environment.
- Record installation failures, time to first continuity value, and recovery.
- Run the full release gate once immediately before public release.
- Keep the existing `v1.0.0` tag immutable.
- Publish npm and GitHub release artifacts only from the same verified commit.
- Block release on any critical privacy, data-loss, or installation issue.

## Usefulness Validation

- Current long-horizon corpus: 30 raw-free maintainer-run matched pairs across
  five task types with six pairs per type. A separate five-pair
  Sol-planned/Terra-executed reproduction is retained as a distinct cohort and
  is not pooled with the GPT-5.4 aggregate.
- Current unseen real-task corpus: 11 Sol-preregistered/Terra-executed pairs
  across five task types with at least two pairs per type. It is directional only,
  remains separate from both synthetic cohorts and does not establish causality.
- Current clean-install candidate: commit `07a3ba86`, checksum-pinned in
  `reports/independent-user-candidate.json`. Its isolated maintainer smoke
  passed installation in 6.396 seconds and install-to-first-value in 7.098
  seconds with zero raw-path hits.
- Fresh live Codex and Claude Code sessions have each ingested a new prompt,
  called the read-only `get_looprelay_status` MCP tool, and produced a `doctor`
  result with `status: ready`. A Claude Code run with an unrealistically low
  US$0.10 budget was retained as a client-execution failure; a later
  permission-scoped run completed. This validates the configured local path,
  not external-user adoption.
- Collect unseen real-task pairs; do not inflate confidence with additional
  repeats of the current synthetic fixtures.
- Separate baseline work from LoopRelay-assisted work explicitly.
- Record completion rate, failure transition, continuation reuse, adopted
  guidance, time to first value, and user friction.
- The `resume reliability` cohort is complete: 10 counterbalanced agent-native
  blind-recovery pairs spanning six recovery classes. It measures correct target
  selection, correct first action, evidence attachment, elapsed time,
  wrong-target count, and friction without storing prompts, paths, branches,
  worktrees, or sessions.
- Treat results as observational evidence (`causal_claim: false`).
- Include negative and null results in the report.

## Evidence-Driven 1.0.x Decisions

Keep a feature only when it reduces rediscovery, prevents repeated failure, or
improves evidence quality without adding disproportionate friction. Modify it
when the value is visible but setup or interpretation is confusing. Remove or
de-emphasize it when agents do not adopt it in real tasks or when it encourages
prompt-score optimization without better outcomes.

Candidate focused slices:

- show recurring failure patterns in CLI, MCP, and Loops UI consistently
- measure continuation-brief reuse and time saved without storing prompt bodies
- make outcome recording faster while preserving explicit attribution
- improve safe selection when multiple worktrees or sessions are active
- sharpen question generation for missing scope, constraints, and acceptance criteria

## Active Evidence-First Sequence

1. **Recovery Packet v2 + Continuation Receipt — implemented 2026-07-12.**
   Selected CLI, MCP, and explicit Web brief flows now issue a raw-free receipt
   bound to the exact snapshot. Copy, delivery, followed, partial, and ignored
   states can be recorded without transcript capture. Retain only if unseen
   recovery keeps wrong-target at 0 and evidence attachment reaches at least
   95% without raising mean friction above 0.3.
2. **Typed Evidence + `loop close` — next.** Add compatible structured evidence
   (`kind`, `result`, `observed_at`, `head_hash`, `verification`) and one
   explicit closeout flow that records outcome, evidence, receipt use, and
   optional Guide attribution. Critical false-ready must remain 0; median
   closeout time must fall below 15 seconds without automatic outcome inference.
3. **Action Inbox + Local Outcomes.** Aggregate existing evidence debt and
   receipt/outcome coverage before adding new chart families. Keep bundled
   product studies visually and semantically separate from operator-local data.
4. **Confirmed failure episodes.** Replace exact prompt-gap counting with a
   small operator-confirmed taxonomy, recurrence, intervention, and resolution.
5. **Agent Guide calibration.** Do not rank or automate models until at least
   20 raw-free outcomes across three task types include recommendation,
   selection, rejection/switch reason, attempts, TTFV, and focused tests.

Current evidence decisions (30-pair maintainer-run cohort):

- `retain`: session recovery remains an opt-in continuity workflow.
- `narrow`: keep external failure outcomes as evidence input, but do not claim
  default failure-prevention intervention. Its observed lift is positive but
  uncertain, while elapsed, tool, token, and TTFV costs all increased.
- `narrow`: skip generic implementation-continuation context when repository
  state and focused tests already identify the next action. Five pairs show no
  improvement, one regression, and material time/token overhead.
- `narrow`: do not inject generic release-continuity context when repository
  release state already determines the gate. Five pairs show identical success
  and additional token/friction cost.
- `narrow`: prefer native focused questions when repository policy identifies
  the missing dimensions. Six ambiguity pairs show three treatment contract
  regressions, one baseline serialization failure, and 83.3% versus 50% success.

Evidence-based 1.0.x scope:

- Keep `loop checkpoint`, exact brief recovery, worktree/branch selection, and
  linked failure outcomes as the primary product path.
- Modify brief evidence attribution so agents distinguish an approved local
  snapshot from an unsupported repository inference.
- De-emphasize generic implementation and release continuation injection when
  repository state already determines the next action.
- Remove generic diagnosis from the default ambiguity path; let the coding
  agent ask native focused questions and retain diagnosis as explicit opt-in.
- Do not add a large feature without new real-task evidence. The 30-pair cohort
  does not establish a general productivity claim.

Current real-task decisions (11-pair maintainer-run cohort):

- `retain`: exact checkpoint/session recovery when selected state is absent
  from Git.
- `retain`: focused ambiguity questions only when required decisions are
  genuinely unresolved.
- `narrow`: failure prevention; all three real cases remained strict fail/fail.
  The newest concurrent-intake diagnosis tied at 6/10 while treatment added
  time, tools, and friction; its data-loss risk was remediated with a focused
  serialized append contract.
- `narrow`: implementation continuation; use only for hidden selected
  contracts, never for fully specified ordinary work where treatment added
  cost without quality.
- `narrow`: release continuity to factual handoff; both cases stayed fail/fail
  because action sequencing was not preserved.
- `hold`: all large feature work unless new real-task evidence changes the
  narrow scope above. Agent-native readiness does not establish human adoption
  or causality.

Current resume-reliability decisions (10-pair agent-native cohort):

- `retain`: explicit recovery guidance improves the scored correct-first-action
  rate from 0.0% to 90.0%; keep it limited to checkpoint, failure, blocked, or
  compaction signals.
- `narrow`: correct-target selection stayed at 100.0% in both conditions, while
  evidence attachment fell from 100.0% to 90.0% and mean friction rose from 0.0
  to 0.7. Do not turn generic continuation intervention on by default.
- `retain`: show recovery-class coverage, retained regressions, and the
  raw-free data boundary in the product so the operator can judge the result
  rather than infer a broad productivity claim.
- `retain`: project-level recommendation feedback, outcome attribution, and
  lifecycle settings remain explicit local controls. A retention review date
  is not deletion; external-analysis permission does not perform a request.

## Evidence-Driven 1.0.x Queue

1. **Release blocker — independent install/first value.** Obtain three
   independent install-to-first-continuation flows. Record failures, recovery,
   elapsed time, and friction; do not substitute agent-native sessions for
   human adoption.
2. **Release blocker — final immutable release evidence.** On the final commit
   only, run the complete release gate, publish npm and GitHub Release from the
   same commit, and never move `v1.0.0`.
3. **Collect, do not automate — adopted recommendation outcomes.** Accumulate
   accepted/not-helpful/wrong feedback plus explicit outcome attribution across
   real work. Keep the dashboard language non-causal until an appropriate
   independent study exists. The selected-loop Guide now has an explicit
   raw-free run-capture form for this purpose; it records no inferred run and
   never switches a provider or model.
4. **Modify only if observed — MCP execution friction.** Retain client budget,
   permission, and deferred-tool-discovery failures as setup observations. Add
   guidance only when it reduces a repeated, reproducible failure; do not add
   provider auto-configuration or model auto-switching.
5. **Do not build.** No large feature, automatic prompt submission, hidden
   provider call, transcript scraping, automatic memory write, or automatic
   instruction-file edit is authorized by the current evidence.

No item above authorizes automatic prompt submission, hidden provider calls,
private transcript scraping, automatic memory writes, or automatic instruction
file edits.

## Archived Release Evidence Index

This evidence predates the current validation cycle and is retained only so the
release ledger remains auditable:

- Benchmark template: `looprelay benchmark init-fixture --output "$FIXTURE_FILE"`; `looprelay benchmark --fixture-set real --fixture-file "$FIXTURE_FILE"`; `template_only`.
- Effectiveness ledger: PR #469, `archive_effectiveness_score`, run `28751693022`, `privacy_leak_count: 0`.
- Outcome evidence connected `expected_impact` predictions to actual raw-free loop outcomes.
- Saved-draft slices: PR #366, PR #367, PR #368.
- Reliability slices: PR #403, PR #405, PR #407, PR #408, PR #417, PR #419, PR #420, PR #512, PR #513. No immediate MVP reliability slice remains. No immediate MCP coach-loop slice remains. No immediate reuse-flow slice remains.
- Archive-level effectiveness summary is landed. One-call coach effectiveness guidance is landed.
- UI evidence: GitHub Actions workflows are removed; Local `corepack pnpm ui-patrol`, 9 png files, `local_ui_patrol_evidence`.
- Native dialog: `native_dialog_preflight` and approved native-dialog evidence.
- Quality evidence: `docs/LOCAL_95_EVIDENCE_2026-07-06.md`, `docs/PRODUCT_POSITIONING_EVIDENCE_2026-07-06.md`, `docs/UI_PATROL_EVIDENCE_2026-07-06.md`, `docs/CODEX_CLAUDE_LOCAL_INTEGRATION_EVIDENCE_2026-07-06.md`, PR #478, local gate, `corepack pnpm evidence:quality`, `corepack pnpm --silent evidence:quality`, `node scripts/quality-95-evidence.mjs`, `looprelay quality-evidence --json`, `axis_evidence_coverage`, `scorecard_review_candidates`, `recommended_next_slices`, `release_warnings`, real benchmark fixtures are missing, do not claim real-user effectiveness trends, `release_gate`.
- Release stability: PR #425, PR #427, PR #433, PR #434, PR #464, local release gate, `docs/RELEASE_STABILITY_EVIDENCE_2026-07-06.md`, `corepack pnpm smoke:release`.
- Quality plan: `docs/superpowers/plans/2026-07-05-looprelay-95-quality-plan.md`.
- Web flow: `dogfood:web-user-flow`; fresh current-main web user-flow evidence.
