# Engineering Usefulness Validation — 2026-07-11

This is maintainer-run observational evidence for LoopRelay's continuity and
evidence workflows. It is not a causal product claim.

## Method

Thirty matched pairs use fixed Codex model and reasoning settings, identical
fixture commits within each pair, a read-only boundary, one output schema, and
the same model context limit. Fifteen pairs ran baseline first and fifteen ran
LoopRelay first. The corpus covers session recovery (6), implementation
continuation (6), repeated-failure prevention (6), release-verification
continuity (6), and ambiguity clarification (6). It meets the active threshold
of 30 total pairs and at least five pairs per task type.

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
| Ambiguity clarification | 6 | 83.3% | 50% | -33.3pp |
| Failure prevention | 6 | 0% | 100% | +100pp |
| Implementation continuation | 6 | 100% | 83.3% | -16.7pp |
| Release-verification continuity | 6 | 100% | 100% | 0pp |
| Session recovery | 6 | 16.7% | 83.3% | +66.7pp |
| **Aggregate** | **30** | **60%** | **83.3%** | **+23.3pp** |

- Actionability increased from 74.0% to 89.7%.
- Mean elapsed time increased by 0.67 seconds among runs with timing data.
- Mean tool calls decreased from 5.70 to 5.43.
- Mean input tokens increased from 81,503 to 90,532 (+11.1%).
- Eleven failures improved, four successful baselines regressed, fourteen pairs
  remained successful, and one pair remained failed.
- Human preference was LoopRelay 17, baseline 11, tie 2.
- Position-swapped judge choices were consistent for 9/10 pairs, but agreed
  with the ground-truth-based human preference on only 4/9 consistent pairs.
  This disagreement is evidence against using an ungrounded LLM preference as
  the usefulness label.

The two new Codex 0.144.1 / GPT-5.4 medium pairs used ephemeral sessions and
the same fixture commit in both conditions. Release continuity was a null
quality result: both conditions correctly blocked the gate. LoopRelay finished
in 48.46s versus baseline 51.00s, but used 12 versus 8 tool calls and 167,021
versus 118,105 input tokens. Ambiguity clarification was also a pass/pass pair,
but baseline was preferable: 21.15s versus 29.30s and 63,070 versus 91,539 input
tokens, while asking equally sufficient questions. This is evidence against
adding a generic LoopRelay diagnosis when repository instructions already say
which clarification dimensions are required.

The fifth session-recovery pair did not produce a treatment success. Baseline
safely asked for all missing prior-session state. LoopRelay supplied the exact
selected work item, rejected approach, and next test, but Codex treated the
brief as conflicting with a repository statement that merely said the state
was absent from Git, then asked for confirmation. The treatment still reduced
time from 46.94s to 23.94s and tool calls from 13 to 6. This supports retaining
local recovery while strengthening evidence attribution; it does not support a
stronger success claim. One earlier treatment attempt passed `null` because the
evaluation harness assumed the wrong JSON nesting. It is recorded as excluded
harness friction and does not contribute outcome metrics.

Cached-token, TTFV, continuation-accuracy, and blocker flags are available for
the twenty new pairs only (66.7% condition coverage). The report exposes this
coverage instead of silently treating missing historical measurements as zero.

Two additional failure-prevention fixtures covered an upstream quota failure
and malformed-payload parsing. Baseline correctly refused to guess the missing
external outcome in both cases; LoopRelay recovered the rejected approach and
replacement strategy in both cases. Across all five failure-prevention pairs,
observed success is 0% versus 100%. The conservative bound still crosses zero,
so the automated decision is `retain`, not `strengthen`.

Two additional ordinary implementation fixtures were fully specified by local
tests. Both conditions found the same minimal changes. In these new pairs,
LoopRelay added 12.0s and 18.2s respectively without improving success. Across
five implementation-continuation pairs, observed success is 100% versus 80%,
mean elapsed cost is +13.6s, input-token cost is +59,168, and one treatment
regressed. The provisional product decision is `narrow`: do not inject a
continuation brief when repository state and focused tests already determine
the next action.

Four additional release-continuity pairs covered artifact/candidate mismatch,
fully satisfied final-gate prerequisites, missing rollback smoke evidence, and
an immutable-tag conflict. Both conditions made the same correct release
decision in all five pairs. LoopRelay is 5.2s faster on average, but adds 14,436
input tokens and more friction without changing correctness. The provisional
decision is `narrow`: repository release state is already sufficient, so do not
inject a generic continuation brief by default.

Four additional ambiguity pairs covered database migration, performance,
destructive data deletion, and refactor scope. Baseline returned directly usable
questions in all five pairs. Three LoopRelay treatments encoded question objects
as JSON strings instead of returning user-facing questions. Across five pairs,
success is 100% versus 40%, elapsed cost is +2.0s, and there are three treatment
regressions. The decision is `narrow`: when repository policy identifies the
missing dimensions, prefer the agent's native focused questions over generic
diagnosis metadata.

The five final holdouts added one unseen fixture per task type and completed a
15/15 execution-order balance. Session recovery and failure prevention again
favored LoopRelay. The implementation holdout was pass/pass and unusually faster
with LoopRelay, reducing but not reversing that type's accumulated cost. The
release holdout was pass/pass with large treatment overhead. In ambiguity,
baseline—not treatment—encoded questions as one JSON string, so LoopRelay
recovered one failure. This confirms that question serialization is unstable
across both conditions, while the accumulated result still favors narrowing
generic diagnosis rather than making it the default.

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
The supported product claim is narrower: LoopRelay is useful when essential
prior-session or prior-failure evidence is absent from Git.

## Sol-Planned, Terra-Executed Reproduction

A separate five-pair reproduction used Codex CLI 0.144.1 with
`gpt-5.6-sol` at medium reasoning to preregister repository-grounded and
condition-specific rubrics before observing any execution output. Both
baseline and LoopRelay conditions then ran in fresh ephemeral read-only
`gpt-5.6-terra` sessions at medium reasoning. Three pairs ran baseline first
and two ran LoopRelay first. Reused fixtures covered all five task types, so
this cohort tests model robustness rather than adding unseen tasks.

Baseline passed 4/5 and LoopRelay passed 5/5. The sole transition was ambiguity
clarification: baseline asked for target, behavior, and test level but did not
explicitly request acceptance criteria; the treatment asked for all four
preregistered fields. The other four pairs were pass/pass. Mean TTFV fell from
47.4s to 30.4s, tool calls from 2.4 to 1.0, and input tokens from 85,171 to
42,415. These cost differences are directional: one baseline and one treatment
call initially failed on Terra capacity and were retried. Their end-to-end
delay and recovery friction remain in the ledger, preventing a clean latency
claim.

This reproduction weakens any claim that LoopRelay is needed to make a capable
agent safe on every task: Terra already handled session uncertainty,
failure-outcome absence, focused implementation, and release blockers from
repository evidence. It strengthens the narrower claim that a concise trusted
packet can reduce rediscovery and turn unavailable prior decisions into a
specific next action. The next study should use unseen real tasks and
independent humans rather than adding more synthetic fixture repeats.

## First Unseen Real-Repository Pair

The first separate real-task pair used the active LoopRelay repository rather
than a synthetic fixture. An explicit product checkpoint selected one exact
next action: run a real-repository session-recovery pair, avoid repeating the
synthetic fixtures, preserve capacity retries, and keep the result separate
from earlier aggregates. Sol froze the rubric before two fresh Terra sessions
ran on commit `6c2be8b2`, treatment first.

Neither condition passed the deliberately strict preregistered rubric. The
baseline did not recover the selected task and instead proposed the valid but
different independent-human study visible in repository docs. The treatment
recovered the selected commit, real-task pair, synthetic-fixture prohibition,
cohort boundary, and capacity-friction rule, but omitted secondary generic
brief constraints from its response. Position-swapped Sol review consistently
scored both as failed and therefore tied them. Human review preferred the
treatment because it alone recovered the selected work, while retaining the
formal fail/fail outcome.

The treatment used five tools and 239,763 input tokens versus seven tools and
335,179 input tokens for baseline, but TTFV was slower at 67.68s versus 52.03s.
This is one pair and supports no latency claim. It exposed a concrete product
problem: explicit CLI checkpoints inherited project-wide prompt IDs, scores,
and prompt-gap diagnostics, placing secondary information beside the selected
continuation contract. A focused change now gives explicit in-progress
checkpoints a top-level evidence authority and omits those project-wide
diagnostics; the live brief shrank from 1,491 to 1,035 characters. A follow-up
pair must test whether that sharper brief improves strict recovery.

The immediate baseline-first follow-up on commit `609a177f` did improve strict
recovery. Baseline found the general real-repository rerun but omitted the
selected commit, Sol-before-output contract, exact treatment authority, and
several required measurement boundaries. Treatment recovered every
preregistered core concept. Independent Sol judgments in both A/B orders
agreed on baseline fail, treatment pass, and LoopRelay preference. Treatment
used 38.28s, three tools, and 140,520 input tokens versus baseline 64.13s,
twenty tools, and 326,993 input tokens. This paired before/after remediation is
still observational and shares one task family, but it is direct evidence that
checkpoint prioritization reduced rediscovery without adding a new feature.

## First Real Failure-Prevention Pair

The next real-task pair used an observed repository validation failure rather
than a fixture. The unsupported `pnpm typecheck` and `pnpm format:check`
commands had failed, while the authoritative `pnpm lint` path was green and
the repository-wide Prettier check exposed five unrelated pre-existing drifted
files. The selected recovery contract prohibited a global format write,
required touched-file formatting checks, focused tests, authoritative lint,
and `git diff --check`, and retained the existing drift as residual risk.

Under the frozen Sol rubric both conditions failed the strict all-criteria
threshold. Baseline scored 0/5 concepts and incorrectly attributed the failure
to a sandbox cache, then proposed retrying the failed command without first
confirming that the script exists. Treatment scored 4/5, preserved the clean
worktree and unrelated drift, selected authoritative lint, and scoped Prettier
to touched files. Both position orders preferred treatment. TTFV was 39.92s
for treatment and 41.93s for baseline; treatment used 79,865 input tokens
versus 68,055. The result supports failure-pattern recovery but not a binary
success claim.

This pair also exposed a stale generic brief rule that requested a Node 22 pnpm
gate after any behavior change. Explicit checkpoints now run only focused
checks named by the selected contract and reserve the full release gate for an
explicit final-candidate contract. This aligns the product with the study's
focused-test-first release policy; a later failure-prevention pair must verify
the remediation on a different real failure.

## First Real Ambiguity-Clarification Pair

The fourth real-task pair used the request “Update the usefulness graph with
the latest results.” At commit `ffdf1e28`, three non-pooled cohorts and two
existing graph artifacts made the target, aggregation, and reporting policy
materially ambiguous. Sol preregistered six distinct questions: source cohort,
target graph, pooling, formal fail/fail visibility, concept-score visibility,
and whether N=3 across two types should render as insufficient or wait.

Baseline withheld edits and asked about the result set and graph. Depending on
presentation order, Sol credited 4/8 or 5/8 because pooling coverage was not
equally explicit; that calibration difference is retained. Treatment asked all
six decisions in three focused questions and scored 8/8 in both orders. It
finished in 16.62s with no tools and 18,551 input tokens, versus baseline at
37.28s, three tools, and 120,099 input tokens. Both position orders preferred
LoopRelay and agreed on baseline fail, treatment pass.

This brings the separate real-task cohort to four pairs across three task
types. Strict success is 0/4 for baseline and 2/4 for LoopRelay, with two
fail/fail pairs retained. The generated graph intentionally reports
`INSUFFICIENT DATA`: the interpretation threshold is 10 pairs and at least two
pairs per type, while only session recovery currently has two. These numbers
are not pooled with either synthetic cohort and do not support a causal claim.

## First Real Release-Continuity Pair

Live read-only checks found that npm `looprelay@1.0.0` and GitHub Release
`v1.0.0` do not exist, while the immutable local `v1.0.0` tag already targets
main commit `106bbf899d8243f31e122a7496208b144bedc869`. The validation branch was
at `21059b35`, independent-human evidence remained 0/3, and real-task evidence
was 4/10 with only one of three types meeting per-type coverage. The correct
release decision was therefore blocked: do not move the tag, publish, create a
release, or run the final gate; finish evidence and later choose an unspecified
new version that preserves the old tag.

Both Terra conditions correctly blocked release but failed the full frozen
rubric. Baseline found the tag/HEAD mismatch but omitted both public-artifact
states and all exact evidence gates. Treatment recovered the evidence gates
and immutable target, but also omitted the explicit npm/GitHub absence facts
and suggested example later versions despite the no-guessing constraint. Sol
returned fail/fail and tie in both position orders. Treatment cost 65.61s, six
tools, and 218,393 input tokens versus 63.59s, four tools, and 187,355 for
baseline, so no efficiency benefit was observed.

The run exposed that explicit checkpoints stored safe evidence refs but briefs
discarded them. A focused privacy-preserving fix now renders a `Checkpoint
Evidence` section and filters raw paths and secrets. The release pair remains
fail/fail; a remediation rerun is required before claiming recovery.

The baseline-first remediation follow-up on `f74466df` proved that rendering
evidence refs fixed fact recovery but not full release sequencing. Treatment
reported the immutable tag, distinct HEAD, absent npm artifact, absent GitHub
Release, and exact 0/3, 5/10, and 1/4 gates. Baseline omitted the public
artifact and evidence facts. Treatment also reduced elapsed time from 153.90s
to 128.50s, tools from ten to four, and input tokens from 352,790 to 231,839.

However, treatment inserted a future full release gate between evidence
completion and the required explicit later-version decision. Sol therefore
kept both conditions failed while preferring treatment in both position
orders. The brief now marks selected checkpoint sequencing as exact and
forbids inserting fallback steps between stated actions. This same release
case will not be rerun again as additional evidence; a different future
release boundary must test the priority remediation.

Preparing the first ordinary implementation-continuation pair exposed an
additional operator failure before model execution. A checkpoint containing
the safe option name `skip-readme` was rejected as an API key because the
shared detector treated any word beginning with `sk` plus eight characters as
a credential. Two retries were retained as friction. The detector now requires
the separator used by actual `sk-` or `sk_` credentials while preserving
Google, npm, GitHub, Stripe-style, Slack-style, and AWS key detection. Focused
tests prove ordinary engineering terms remain usable and constructed fake
credentials remain redacted.

## First Real Implementation-Continuation Pair

The first ordinary implementation task addressed a real reproducibility gap:
the real-task summary and SVG were generated by an ad-hoc Node expression
because the existing usefulness CLI always rewrote the aggregate README
blocks. The frozen contract required one `--skip-readme` option on the existing
generator, an exact `evidence:real-task` package command, default-behavior
compatibility, deterministic subprocess tests, and no threshold or cohort
changes.

Baseline designed the correct general shape but selected different public
contracts (`--no-readme` and `evidence:usefulness:real-task`), omitted a focused
default README-mutation test, made documentation optional, and broadened the
gate. Sol scored it 7/14 and failed it in both orders. Treatment recovered the
exact contract and passed in both orders, with a score range of 12/14 to 14/14.
Treatment used five tools and 225,461 input tokens versus six tools and 282,122
for baseline, but was slower at 66.57s versus 59.05s and used more output and
reasoning tokens. This is an accuracy improvement with mixed cost, not a
general implementation-productivity claim.

The implementation reuses the existing report generator. `pnpm
evidence:real-task` writes only the real-task summary and SVG and leaves both
README files byte-for-byte unchanged. Two live consecutive runs produced
identical artifact hashes. The default `evidence:usefulness` README behavior
remains covered by the subprocess regression.

## Second Real Failure-Prevention Pair

The second failure-prevention task revisited the already-fixed `skip-readme`
checkpoint rejection rather than reusing command/format drift. Both conditions
had repository access to the fix at commit `9547bc75` and were required to
identify the overbroad `sk`/`pk` detector, reject disabling redaction, confirm
the separator fix, and run focused safe-term plus credential tests.

Both conditions found the root cause and fix, but both failed because Vitest
could not start in the read-only sandbox. Baseline scored 7/10 and treatment
6/10 to 6.5/10 in position-swapped Sol review; baseline was preferred in both
orders. Treatment substantially reduced rediscovery—47.57s, three tools, and
127,648 input tokens versus 74.99s, ten tools, and 597,654 tokens—but baseline
alone found that the browser error sanitizer still duplicated the older broad
pattern. This is a formal fail/fail and a negative quality result for
LoopRelay despite its lower operating cost.

The residual browser sanitizer now has the same separator boundary and a
focused ordinary-word regression while existing credential redaction remains
covered. Regenerating the ledger then exposed the same class of missing word
boundary in the report-specific privacy regex (`risk-evidence` was mistaken
for an `sk-` key). A separate regression now permits ordinary risk labels while
still rejecting real `sk-` values. These repeated drifts strengthen the case
for eventually consolidating privacy detection, but no broad refactor was
added during the human-validation feature freeze.

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

## Live Codex Connected Loop

A subsequent real Codex CLI 0.142.5 / GPT-5.4 sequence exercised the current
checkout through the registered LoopRelay MCP server:

1. CLI `loop checkpoint` recorded a real in-progress validation task on the
   current branch and `primary` worktree.
2. A fresh Codex session called `get_looprelay_loop_status` and
   `prepare_loop_brief` before reading repository files. It selected the exact
   checkpoint and recovered the task summary and verification contract.
3. A read-only Codex session inspected the implementation and attempted the
   focused Vitest checks. The tests could not start because Vite needs temporary
   writes; this sandbox friction is retained rather than counted as a product
   pass. The same focused tests passed outside that read-only agent sandbox.
4. Live use exposed a false multi-worktree review: legacy `unknown` worktree
   snapshots and the explicit `primary` checkpoint shared one branch but were
   counted separately. A focused regression now coalesces an unknown label into
   the sole explicit worktree on that branch.
5. A new Codex MCP process confirmed one active worktree and no review warning,
   then recorded the exact checkpoint as passed with focused-test and Node-build
   evidence.
6. After a newer Stop-hook snapshot existed, another fresh Codex process still
   selected the passed `primary` checkpoint and returned an eligible memory
   candidate. It did not write or approve memory automatically.

Post-run doctor reported verified recent ingest, HTTP 200, registered MCP, and
`ready`. MCP results remained local-only and returned neither prompt bodies nor
raw paths. This is end-to-end agent-operation evidence, not independent-human
evidence.

Two fail-closed Codex MCP checks followed. An unrelated cwd returned
`empty` with zero snapshots instead of falling back to LoopRelay project data,
and a missing worktree returned `not_found` plus a recovery command. Neither
response exposed a raw path or prompt body. The empty activity initially said
to continue a current worktree despite having none; the shared status model,
MCP schema, and web parser now agree on `create first local loop snapshot`.
A fresh Codex MCP process confirmed that corrected structured response.

## Reproduction And Remaining Gates

Run `pnpm evidence:usefulness` to validate the raw-free ledger and regenerate
the JSON summary, README result blocks, and SVG. The generated artifacts are
`reports/usefulness-summary.json` and `docs/assets/usefulness-results.svg`.
For a private Codex JSONL run, use
`pnpm evidence:codex-metrics -- <events.jsonl> <elapsed-ms>` to emit only
raw-free cost and tool metrics. The synthetic fixture contract and output
schema are under `evaluation/usefulness/`; raw Codex events and answer bodies
remain outside Git.

Three independent human install-to-first-value sessions are still required. Rendered
desktop/mobile QA is also pending because the in-app browser runtime did not
start in this session. Neither requirement may be replaced with maintainer
dogfood. The full release gate must run only once, on the final candidate after
these blockers are closed.
