# Engineering Usefulness Validation — 2026-07-11

This is maintainer-run observational evidence for LoopRelay's continuity and
evidence workflows. It is not a causal product claim.

## Method

Ten matched pairs used the same Codex model, repository, read-only boundary,
requested output, and comparable tool budget. Five pairs ran baseline first and
five ran LoopRelay first. The corpus covers session recovery (4), implementation
continuation (3), and repeated-failure prevention (3).

Human review used deterministic repository state and scored correct outcome,
context recovery, blocker identification, next-step actionability, and operator
friction. Prompt bodies and answer bodies are not committed. Invalid or
incomplete attempts do not count as pairs, but their product-caused friction is
retained in the raw-free ledger.

An independent Claude Code judge also compared anonymized final answers twice,
with A/B positions swapped. This judge did not receive the ground truth and is
therefore a bias diagnostic, not the source of success labels.

## Results

| Task type | Pairs | Baseline success | LoopRelay success | Difference |
| --- | ---: | ---: | ---: | ---: |
| Failure prevention | 3 | 0% | 100% | +100pp |
| Implementation continuation | 3 | 100% | 66.7% | -33.3pp |
| Session recovery | 4 | 25% | 100% | +75pp |
| **Aggregate** | **10** | **40%** | **90%** | **+50pp** |

- Actionability increased from 60% to 90%.
- Mean elapsed time decreased by 1.64 seconds among runs with timing data.
- Mean tool calls decreased from 3.3 to 3.2.
- Mean input tokens increased from 83,573 to 109,954 (+31.6%).
- Six failures improved, one successful baseline regressed, and three pairs
  remained successful.
- Human preference was LoopRelay 7, baseline 3, tie 0.
- Position-swapped judge choices were consistent for 9/10 pairs, but agreed
  with the ground-truth-based human preference on only 4/9 consistent pairs.
  This disagreement is evidence against using an ungrounded LLM preference as
  the usefulness label.

## Interpretation And Scope

The aggregate result is directional, not causal. The strongest signal is in
recovering session state and surfacing repeated-failure evidence. Ordinary
implementation continuation regressed, and the treatment consumed materially
more input tokens. LoopRelay therefore should stay opt-in and should not inject
a full continuation context into every coding task.

Keep current-project recovery, exact continuation briefs, and recurring-failure
evidence. Reduce default intervention for ordinary implementation work and
continue testing shorter briefs. Do not publish a claim of general coding-agent
productivity improvement.

## Independent Codex Operator Holdout

Three fresh Codex CLI 0.142.5 / GPT-5.4 sessions acted as first-time operators
in isolated git repositories with separate HOME, npm, and LoopRelay state. They
received only a local tarball, `TASK.md`, installed CLI help, a 12-command
budget, and one of three tasks: session recovery, rejected-approach prevention,
or release-state recovery.

Before remediation, first-value success was 0/3. One default sandbox could not
fetch npm dependencies, one operator exhausted its budget discovering hook
payload/quoting details, and one produced a generic zero-prompt brief that did
not preserve the task. These failures motivated the prompt-body-free
`looprelay loop checkpoint` command.

The supported-runtime remediation cohort passed 3/3. Time to first value was
101s, 82s, and 81s; command counts were 11, 11, and 9. Every operator found the
new command through CLI help and produced a task-specific brief. One additional
run selected unsupported Node 18 inside its isolated login shell and exceeded
the command budget while recovering; it is retained as runtime friction but
excluded from the Node 22 cohort.

These are independent agent operators, not independent human users. They show
that Codex can now install and operate the supported first-value flow, but they
do not satisfy the human 3-user gate or justify a causal productivity claim.

## Reproduction And Remaining Gates

Run `pnpm evidence:usefulness` to validate the raw-free ledger and regenerate
the JSON summary, README result blocks, and SVG. The generated artifacts are
`reports/usefulness-summary.json` and `docs/assets/usefulness-results.svg`.

Three independent human install-to-first-value sessions are still required. Rendered
desktop/mobile QA is also pending because the in-app browser runtime did not
start in this session. Neither requirement may be replaced with maintainer
dogfood. The full release gate must run only once, on the final candidate after
these blockers are closed.
