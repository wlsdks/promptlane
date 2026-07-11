# LoopRelay Next Backlog

Last updated: 2026-07-11

LoopRelay is in identity-consolidation and usefulness-validation mode. Large new
features remain frozen until at least three independent users complete install
and first-value continuity flows.

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

- Current long-horizon seed corpus: 10 raw-free maintainer-run matched pairs
  across three continuity task types. It is retained as observational seed
  evidence but does not meet the active 30-pair, five-type, five-pairs-per-type
  threshold. This is separate from the older prompt-rewrite aggregate whose
  prompt records were intentionally removed and which remains historical-only.
- Collect at least 30 matched pairs across five real task types, with at least
  five pairs per type.
- Separate baseline work from LoopRelay-assisted work explicitly.
- Record completion rate, failure transition, continuation reuse, adopted
  guidance, time to first value, and user friction.
- Treat results as observational evidence (`causal_claim: false`).
- Include negative and null results in the report.

## Evidence-Driven 1.0.x Decisions

Keep a feature only when it reduces rediscovery, prevents repeated failure, or
improves evidence quality without adding disproportionate friction. Modify it
when the value is visible but setup or interpretation is confusing. Remove or
de-emphasize it when independent users do not adopt it or when it encourages
prompt-score optimization without better outcomes.

Candidate focused slices:

- show recurring failure patterns in CLI, MCP, and Loops UI consistently
- measure continuation-brief reuse and time saved without storing prompt bodies
- make outcome recording faster while preserving explicit attribution
- improve safe selection when multiple worktrees or sessions are active
- sharpen question generation for missing scope, constraints, and acceptance criteria

Current evidence decisions (30-pair maintainer-run cohort):

- `retain`: session recovery and external failure-outcome recovery remain
  opt-in continuity workflows; their observed lift is positive but uncertainty
  is still wide.
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
- Do not add a large feature until three independent humans complete install
  and first value. The 30-pair cohort does not satisfy that gate.

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
