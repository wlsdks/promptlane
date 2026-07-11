# Adaptive Agent Guide Design

Date: 2026-07-11

## Decision

LoopRelay will provide a local, evidence-aware **Adaptive Agent Guide** for
long-running coding work. It recommends the next agent role and model profile,
explains why, states when to escalate or de-escalate, and reports how much
local outcome evidence supports the recommendation.

This is a Level 1 suggestion feature in the LoopRelay autonomy model. It does
not launch a provider, switch a model, submit a prompt, read private app state,
or retrieve provider credentials. Model selection remains with the operator or
their explicitly configured coding-agent client.

The normal large-feature freeze in `docs/NEXT_BACKLOG.md` is explicitly
overridden for this bounded, local-first evidence feature by the maintainer on
2026-07-11. It must still earn retention through the evaluation protocol below.

## Product Contract

The Guide has two explicit workflows:

1. `recommend_agent_strategy`: read the current loop/task signal and return
   one non-binding recommendation.
2. `record_agent_run`: record a raw-free, operator-declared model/task/result
   observation so later recommendations can calibrate confidence.

The recommendation always returns a primary model profile and equivalent
alternative, a role (`plan`, `implement`, `fast_path`, or `review`),
evidence-backed reasons, a concrete switch condition, `low`/`medium`/`high`
confidence, raw-free privacy flags, and `auto_switches_model: false`.

The initial profiles are configuration-free vocabulary, not claims about
provider capability:

| Role | Codex profile | Claude Code profile | Default use |
| --- | --- | --- | --- |
| `plan` / `review` | `gpt-5.6-sol` | `opus` | ambiguity, architecture, repeated failure, independent review |
| `implement` | `gpt-5.6-terra` | `sonnet` | scoped feature, test-driven repair, continuation execution |
| `fast_path` | `gpt-5.6-luna` | `haiku` | narrow, mechanical, low-risk work |

These mappings are a transparent default policy. The ledger can show that
local outcomes do not support them; the product must then lower confidence or
change the recommendation, not imply universal superiority.

## Inputs And Data Boundary

`agent_runs` is a local SQLite table. Each row contains an opaque id and time,
project id and optional snapshot id, provider/tool, declared model profile,
assigned role, task type, recommendation acceptance, raw-free result state,
attempts, elapsed seconds, and focused-test count.

It never stores prompt bodies, model responses, hidden reasoning, transcript
content, raw paths, provider credentials, price, or token payloads. A snapshot
link must refer to an existing local snapshot when supplied.

Task types are `ambiguous_request`, `planning`, `implementation`, `debugging`,
`mechanical`, `review`, and `continuation`. Outcome states reuse the existing
loop outcome enum.

## Deterministic Recommendation Policy

1. An ambiguous request recommends `plan`; ask the missing question before
   implementation.
2. Two or more failed/blocked attempts, multi-worktree work, architecture, or
   independent review recommends `plan` or `review`.
3. A narrow mechanical task recommends `fast_path`.
4. Scoped implementation, debugging, or continuation recommends `implement`.
5. Local evidence can raise confidence but cannot silently override an explicit
   safety escalation rule.

Confidence derives from matching local runs. Fewer than three completed runs is
`low`; three through nine is `medium`; ten or more is `high`. The response also
reports passing and non-passing counts so a high count cannot hide poor results.

## Surfaces

- CLI: `looprelay guide next` and `looprelay guide record-run`.
- MCP: `recommend_agent_strategy` and `record_agent_run`.
- Web: a Guide panel in the Loops workspace showing the latest recommendation,
  evidence counts, switch conditions, and a manual run-record action.
- Continuation brief: append a compact advisory Guide section only when one is
  available.

## Evaluation And Retention

The Guide does not make causal effectiveness claims. Its first evaluation must
collect matched, counterbalanced pairs across planning, implementation, and
debugging. Record recommendation acceptance, selected profile, completion,
failure transition, first-value time, retry count, focused-test count, and user
friction. Keep guided and unguided conditions separate and set
`causal_claim: false` in all reports.

Retain the feature only if operators can understand the recommendation and it
reduces repeated failure or rediscovery without disproportionate burden. Narrow
or remove weak profile mappings rather than adding opaque model scoring.

## Verification

- TDD for policy precedence, validation, privacy rejection, and confidence.
- Storage migration and foreign-key tests.
- CLI/MCP parity tests and source-hygiene assertions.
- Browser interaction test for the Guide panel.
- Focused tests during implementation; full release gate only immediately
  before a public release.
