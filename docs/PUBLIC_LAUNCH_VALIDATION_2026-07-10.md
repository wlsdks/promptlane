# PromptLane 1.0 Public Launch Validation - 2026-07-10

This document is the evidence ledger for the public-launch and usefulness
validation phase. Product feature development is frozen unless evidence below
identifies a privacy, data-loss, installation, or first-value blocker.

## Current Verdict

PromptLane 1.0.0 is not publicly launched yet.

- The annotated `v1.0.0` tag and `main` resolve to commit
  `106bbf899d8243f31e122a7496208b144bedc869`.
- `promptlane@1.0.0` returned npm registry `E404` on 2026-07-10.
- GitHub had no `v1.0.0` Release on 2026-07-10.
- `corepack pnpm npm-publish:preflight -- --json` passed every package,
  privacy, worktree, tag, and remote-tag check. Its only failed check was npm
  authentication (`npm whoami` returned `E401`).
- Do not move `v1.0.0`. Authenticate, rerun the final gate and preflight from
  the tagged commit, publish that commit, and create the GitHub Release from
  the same immutable tag.

## Live Codex And Claude Code Evidence

These are real installed CLI sessions, not fake-provider or isolated setup
smokes.

| Surface | Result | Evidence |
| --- | --- | --- |
| Codex CLI 0.142.5 prompt ingest | PASS | A new Codex prompt was captured at `2026-07-10T11:31:06Z`; immediate `doctor codex --json` reported recent ingest and `status: ready`. |
| Codex PromptLane MCP call | PASS | The same live session called `get_promptlane_status` once; the structured result reported `status: ready`, local-only operation, no external calls, no prompt bodies, and no raw paths. |
| Claude Code 2.1.204 prompt ingest | PASS | A new Claude Code prompt was captured at `2026-07-10T11:31:26Z`; `doctor claude-code --json` reported recent ingest and `status: ready`. |
| Claude Code PromptLane MCP call | PASS | The same live session called `get_promptlane_status` once and received `status: ready` with the latest safe metadata attributed to `claude-code`. |
| MCP registration | PASS | `codex mcp list` reported `promptlane` enabled and `claude mcp list` reported it connected before the live calls. |

Observed friction:

- The first Codex attempt failed before MCP use because the locally configured
  `gpt-5.6-sol` requires a newer Codex CLI. Retrying with explicit model
  `gpt-5.4` completed the ingest and MCP call. This is environment/version
  friction, not evidence of a PromptLane MCP failure.
- The Claude Code call and final response completed, but the process returned
  non-zero because total cost reached `$0.2666307` against a `$0.25` cap. Treat
  this as first-run cost/predictability friction; do not count it as a failed
  PromptLane tool call.

## Clean Installation And First Value

`corepack pnpm smoke:package-install` passed on 2026-07-10. It built a local
`promptlane-1.0.0.tgz`, installed it with an isolated temporary environment,
and verified:

- the `promptlane`, `pl-claude`, and `pl-codex` binaries;
- the first-success command `promptlane start --open-web --json`;
- installed benchmark fixture, paired-fixture, candidate, and quality-evidence
  commands.

A separate clean temporary HOME/prefix run installed the same local 1.0.0
tarball and executed a benign `promptlane improve --text ... --json` request:

| Measurement | Observed result |
| --- | ---: |
| Global-prefix install | 13.375 seconds |
| Improvement command | 0.478 seconds |
| Install start to first improvement | 13.898 seconds |
| Local score change | 58 to 100 (+42) |

The command returned a non-empty approval-ready improvement. Installation had
no failure, so no failure recovery was needed. Both temporary HOME and prefix
were removed after the run; repeating the install in newly created directories
is the verified clean retry path. The score delta proves deterministic local
scoring behavior for this fixture, not real task effectiveness.

This proves the pre-publish local tarball path through an actual improvement
result. It does not prove registry installation. After npm publication, repeat
installation from `promptlane@1.0.0` in a new temporary environment and record
elapsed time, installation failures, first-value time, and recovery steps.

## Usefulness Evidence

The live synthetic benchmark on 2026-07-10 passed its regression thresholds but
explicitly reported:

- `evidence_state.effectiveness: regression_gate_passed_not_real_world_proof`;
- `counts.effect_pairs: 0` for the synthetic fixture;
- `paired_effectiveness.status: not_collected`;
- `paired_effectiveness.causal_claim: false`.

Ten real, operator-reviewed Codex pairs were collected across MCP tool use,
repository state audit, code investigation, Node/package documentation,
read-only CLI diagnostics, health privacy, package-content verification,
Korean localization, doctor readiness, and public-release truth audit.

The combined ten-pair real-fixture benchmark reported:

- `pair_count: 10` and `status: negative_direction`;
- baseline pass rate `0.8`, PromptLane pass rate `0.5`, and observed delta
  `-0.3`;
- zero `improved`, three `regressed`, five `unchanged_passed`, and two
  `unchanged_failed` transitions;
- treatment adoption `10/10`, because every generated draft was actually
  submitted;
- `causal_claim: false` and a non-release-blocking soft-signal failure;
- privacy leak count `0`.

| Pair | Task type | Baseline | PromptLane | Transition |
| ---: | --- | --- | --- | --- |
| 1 | MCP status tool use | PASS | FAIL | regressed |
| 2 | Repository release-state audit | PASS | FAIL | regressed |
| 3 | Release-tag code investigation | PASS | PASS | unchanged passed |
| 4 | Node engine/document contract | PASS | PASS | unchanged passed |
| 5 | Read-only CLI diagnostics | FAIL | FAIL | unchanged failed |
| 6 | Health API privacy audit | PASS | PASS | unchanged passed |
| 7 | Source-map packaging contract | FAIL | FAIL | unchanged failed |
| 8 | Korean language contract | PASS | PASS | unchanged passed |
| 9 | Doctor readiness contract | PASS | PASS | unchanged passed |
| 10 | Public-release truth audit | PASS | FAIL | regressed |

The consent-bearing fixture was used locally and removed after measurement
because it contains prompt text. Only this raw-free aggregate is committed.

Observed friction and scope decisions:

- Stored-prompt rewrites lost the concrete task target in two pairs and caused
  both regressions. `improve --prompt-id` is a change-or-remove candidate.
- Direct-text rewrites preserved the task, but produced no improved transition.
  They sometimes reduced command events, sometimes matched baseline, and
  sometimes increased agent exploration. Keep the opt-in surface but remove
  any implication that a higher prompt score predicts better task success.
- A low-scored Korean baseline (`55`) already passed; its treatment was scored
  `100` and also passed with the same command events. Score gain was not an
  effectiveness gain.
- A baseline already scored `100` received a zero-delta rewrite anyway; the
  treatment took longer and failed to establish the required npm state. A
  no-op recommendation is preferable when `changed_sections` is empty.
- Both sides of the read-only CLI pair failed because PromptLane attempted
  `chmod` on its SQLite file inside a read-only Codex sandbox. Read-only
  diagnostics must not require a metadata write or permission mutation.
- No privacy leak or data-loss event was observed. Installation and local first
  value passed, but external-user and registry-install evidence is still absent.

Therefore real-world usefulness remains unproven. No success-rate lift or
causal claim is permitted yet.

### 2026-07-11 Six-Pair Remediation Pilot

After the stored-target, zero-delta, and SQLite permission remediations, six
new read-only repository tasks were run as matched Codex pairs. The tasks
covered packaging, stored-rewrite privacy, storage diagnostics, doctor status,
MCP inventory, and release packaging. Every run used Codex CLI 0.142.5,
`gpt-5.4`, a fresh ephemeral session, a read-only sandbox, the same structured
output schema, and counterbalanced baseline/treatment order.

Human end-state adjudication found both baseline and PromptLane correct on all
six tasks. An initial literal matcher reported one improvement and one
regression, but review showed both were false negatives caused by equivalent
phrasing (`all local quality checks` and `databasePath`). This manual review was
not condition-blind, so it is recorded as a limitation rather than stronger
evidence.

| Metric | Baseline | PromptLane | Observed change |
| --- | ---: | ---: | ---: |
| Tasks passed | 6/6 | 6/6 | no lift |
| Elapsed time | 238.307s | 413.510s | +73.5% |
| Command events | 63 | 90 | +42.9% |
| Input tokens | 1,450,892 | 2,115,213 | +45.8% |
| Output tokens | 8,979 | 16,103 | +79.3% |
| Failed command events | 3 | 14 | +11 events |

All six PromptLane inputs were rewrites with local score deltas from +20 to
+57, but none improved the adjudicated task outcome. Generic verification
instructions also caused extra test attempts that could not write temporary
files in the read-only sandbox. The first attempted parallel batch was invalid
because concurrent Codex processes competed for local state; those incomplete
runs were discarded and all valid pairs were rerun sequentially.

This pilot is small, maintainer-run, repository-specific, and non-causal. It
does not support a usefulness claim for direct-text rewrite. It supports
narrowing the product toward no-op/refusal, clarification, and safety checks
unless a larger task-changing study shows outcome lift without comparable cost.

Required before closing validation:

- preserve the 10-pair raw-free result and avoid causal claims;
- record success, failure transitions, improvement adoption, time to first
  value, and friction without exposing prompt bodies or raw paths;
- have at least three external or otherwise independent users complete install
  and first value;
- record zero critical privacy, data-loss, and installation blockers;
- rewrite the 1.0.x backlog from observed keep/change/remove evidence, including
  scope reduction when usefulness is not supported.

## Next Actions

1. Complete `npm login` interactively.
2. From the immutable tagged commit, run the full release gate once and rerun
   `corepack pnpm npm-publish:preflight`.
3. Publish `promptlane@1.0.0`, then create the GitHub Release from `v1.0.0`
   without retargeting the tag.
4. Run a clean registry-install first-value smoke and record elapsed time and
   recovery observations.
5. Recruit three independent users; do not replace their evidence with
   synthetic fixtures or maintainer-only dogfood.
