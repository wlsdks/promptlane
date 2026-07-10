# Benchmark v1 Spec

Date: 2026-05-02

## Purpose

Benchmark v1 is the local regression benchmark for `promptlane`. It checks whether the product is still delivering its core value to Claude Code and Codex users:

- finding previously useful prompts again
- surfacing weak prompting habits
- helping the user write a better next prompt
- checking whether prompt improvements are backed by loop outcome evidence
- preserving the local-first privacy boundary

This benchmark is intentionally local-only. It does not call an external LLM judge, embedding API, analytics service, or telemetry endpoint.

## Command

```sh
promptlane benchmark --json
promptlane benchmark prepare-fixture --prompt-id "$PROMPT_ID" --consent-note "$CONSENT_NOTE" --confirm-consent --output "$FIXTURE_FILE"
promptlane benchmark prepare-pair --baseline-prompt-id "$BASELINE_PROMPT_ID" --promptlane-prompt-id "$PROMPTLANE_PROMPT_ID" --pair-id "$PAIR_ID" --query "$MATCH_QUERY" --consent-note "$CONSENT_NOTE" --confirm-consent --output "$PAIR_FIXTURE_FILE"
promptlane benchmark init-fixture --output "$FIXTURE_FILE"
# Replace every example with consent-bearing redacted fixtures.
# Add passed or failed outcome metadata with safe evidence refs.
# Set template_only to false after confirming the fixture is ready.
promptlane benchmark --fixture-set real --fixture-file "$FIXTURE_FILE"

# Save one successful JSON snapshot, then compare the same redacted corpus later.
promptlane benchmark --fixture-set real --fixture-file "$FIXTURE_FILE" --json --report-file "$BASELINE_REPORT"
promptlane benchmark --fixture-set real --fixture-file "$FIXTURE_FILE" --baseline-file "$BASELINE_REPORT" --json

corepack pnpm benchmark
corepack pnpm --silent benchmark -- --json
corepack pnpm benchmark -- --fixture-set real      # opt-in, soft signal only
```

The installed `promptlane benchmark` command uses the shipped production build.
The repository-local pnpm command builds first. Both create an isolated
temporary data directory, start the local server on a temporary loopback port,
ingest fixture prompts, and measure API/UI-adjacent behavior through the built
app.

### Fixture sets

- `--fixture-set synthetic` (default) — hard CI gate. Synthetic fixtures designed to exercise each scoring axis. Threshold misses fail the run.
- `--fixture-set real` — soft signal. Reads consent-bearing redacted prompts from `docs/benchmark-fixtures/real.json`. If the file is absent the script exits 0 with a `status: no_fixtures` notice. If it exists, threshold misses are reported but the script still exits 0 — so a regression on a noisy real corpus does not break CI but is visible in trend.

Installed users should keep real fixtures in an operator-owned local file and
prefer the archive-backed command when selected prompts already exist:

```sh
promptlane benchmark candidates --json

promptlane benchmark prepare-fixture \
  --prompt-id "$PROMPT_ID" \
  --consent-note "$CONSENT_NOTE" \
  --confirm-consent \
  --output "$FIXTURE_FILE"

promptlane benchmark prepare-pair \
  --baseline-prompt-id "$BASELINE_PROMPT_ID" \
  --promptlane-prompt-id "$PROMPTLANE_PROMPT_ID" \
  --pair-id "$PAIR_ID" \
  --query "$MATCH_QUERY" \
  --consent-note "$CONSENT_NOTE" \
  --confirm-consent \
  --output "$PAIR_FIXTURE_FILE"
```

`benchmark candidates` scans at most the latest 100 loop snapshots and returns
only prompt ids with explicitly attributed, completed, safe outcome evidence.
It never returns prompt bodies, raw paths, outcome summaries, or evidence
references. Review the body-free ids locally before selecting prompts and
confirming consent with `prepare-fixture`.

`prepare-pair` is the archive-backed path for before-versus-after evidence.
The operator explicitly selects two distinct prompt ids after reviewing their
local prompt and outcome records, supplies one safe pair id and shared redacted
query, and confirms consent. Repeat all four selection options in matching
order to create multiple pairs in one fixture; option counts must match and a
prompt cannot be reused across pairs. PromptLane requires the same Codex or Claude Code
tool, a completed baseline outcome without improvement attribution, and a
completed treatment outcome with explicit PromptLane attribution. It rechecks
both prompt bodies, summaries, and evidence refs for sensitive values, writes a
new 0600 fixture, refuses overwrite, and prints no selected ids, bodies,
evidence refs, or output path. Create at least three reviewed pairs in one
operator-owned fixture before interpreting the
directional report. The command does not infer task equivalence or causality.

The report also exposes body-free stage counts for completed, attributed,
evidence-complete, and safe snapshots. A non-ready status distinguishes
`no_completed_outcomes`, `no_attributed_outcomes`,
`incomplete_outcome_evidence`, and `unsafe_outcome_evidence` so missing real
effectiveness evidence is not mislabeled as an attribution failure.

The web Loops view reads the same bounded candidate model through
`/api/v1/loops` and displays only staged readiness counts, status, and the next
action. It does not display candidate ids, outcome summaries, or evidence refs.

The command reads only explicitly selected prompt ids after consent
confirmation, revalidates redacted prompt and attributed outcome text, includes
only completed outcomes whose PromptLane improvement use was explicitly
recorded, writes a new private 0600 file, refuses overwrite, and does not print
the file path or prompt bodies. Multiple prompts use repeated `--prompt-id`.

For manual fixture authoring, create the starter shape with
`promptlane benchmark init-fixture --output "$FIXTURE_FILE"`. The command
creates parent directories, writes the shipped template with private file
permissions, refuses to overwrite an existing file, and never prints the local
path. The generated file starts with `template_only: true` and cannot run as
real evidence. Replace every example, update `consent_note`, add any available
operator-confirmed outcome metadata, and set `template_only` to `false` before
passing the file to `--fixture-set real`;
the synthetic release gate remains deterministic.

Use `--report-file` with `--json` to save a successful report as a new private
local file. PromptLane validates JSON before writing, uses `0600` permissions,
and refuses to overwrite existing evidence. Failed benchmark runs do not create
the report file. Stdout remains the same JSON report for scripts and review.

The JSON report includes `fixture_set` and `soft_signal` fields so consumers can filter.
It also includes a top-level `next_action`: synthetic passes say the local
regression gate is green while still requiring real fixtures before claiming
real-world effectiveness; real fixture runs stay soft trend signals.
Full JSON reports include `evidence_state` so automation can distinguish a
synthetic regression pass from real-world effectiveness evidence. Synthetic
passes report `regression_gate_passed_not_real_world_proof`; synthetic
threshold misses report `regression_gate_failed` with `release_blocking: true`;
real fixture passes with at least one operator-confirmed outcome report
`snapshot_healthy` until a baseline is supplied; threshold misses report
`snapshot_needs_review`. A comparable baseline changes those states to
`trend_healthy` or `trend_needs_review` with `release_blocking: false`. A real
prompt corpus without outcome metadata stays
`unproven` with `requires_real_outcomes: true` even when runtime metrics pass.
The report keeps prompt scoring honest by naming its active profile:
`synthetic_score_calibration` uses labeled low/spread fixtures, while
`real_corpus_delivery_integrity` checks that every real prompt receives a
bounded score consistently across list and detail surfaces without inventing
calibration labels for operator data.
Human text output, including missing-real-fixtures output, prints the same
evidence state as `evidence_*` lines, including
`evidence_release_blocking`, so operators do not need JSON parsing to see
whether a benchmark miss blocks release. Missing-real-fixtures text output also
prints `next_action` so the operator sees the copy/setup step without switching
to JSON.
When `--fixture-set real` has no local `real.json`, JSON output also includes
`evidence_state.effectiveness: "unproven"` and `requires_real_fixtures: true`
so release automation cannot confuse a missing real corpus with proof of
real-world usefulness.

`docs/benchmark-fixtures/real.json` must use this raw-free shape:

```json
{
  "template_only": false,
  "consent_note": "Operator-confirmed redacted prompts approved for local benchmark use on 2026-07-09.",
  "fixtures": [
    {
      "label": "real_release_review",
      "adapter": "codex",
      "query": "release readiness review",
      "prompt": "Review the redacted release readiness notes and return the next verification step.",
      "outcome": {
        "status": "passed",
        "summary": "The redacted release review completed with focused checks.",
        "improvement_used": true,
        "evidence_refs": ["test:release-smoke", "commit:abc1234"],
        "tests_run": 4
      }
    }
  ],
  "coach_cases": ["Improve this redacted prompt with verification criteria."]
}
```

Start from the shipped example if you need a local template. Set
`FIXTURE_FILE` to the operator-owned destination before using the installed
command:

```sh
promptlane benchmark init-fixture --output "$FIXTURE_FILE"

# Repository-maintainer alternative:
mkdir -p docs/benchmark-fixtures
cp docs/benchmark-fixtures/real.example.json docs/benchmark-fixtures/real.json
```

Then replace the example prompts with consent-bearing redacted prompts, update
`consent_note`, replace example outcomes with operator-confirmed results, and
set `template_only` to `false` before using
`--fixture-set real` as a trend signal. The loader rejects a missing or true
`template_only` value before it reads any fixture prompt.

The top-level `consent_note` is required and must record that the prompts were
approved for local benchmark use after redaction. Each fixture needs a unique
safe `label`, plus `adapter`, `query`, and `prompt`. Labels must start with a
lowercase letter or digit and then use only lowercase letters, digits, `_`, or
`-` with a maximum length of 64 characters. `adapter` must be `codex` or
`claude-code`. Real fixtures are consent-bearing soft signals only:
redact secrets, tokens, and absolute local paths from fixture labels, queries,
prompts, coach cases, outcomes, evidence refs, and `consent_note` before writing
the file. An optional `outcome` must use completed status `passed` or `failed`,
a non-empty redacted summary and `evidence_refs`, and a non-negative integer
`tests_run`. It must also set `improvement_used` to `true` only when the
operator confirmed that the PromptLane improvement was used for that loop;
otherwise it must be `false`. Fixtures without outcomes still exercise real-corpus retrieval,
coaching, privacy, and runtime behavior, but cannot prove usefulness. The loader
rejects obvious `sk-...`, `npm_...`, `/Users/...`, `/home/...`,
`/Volumes/...`, and `C:\Users\...` values so the benchmark does not ingest
private raw text by accident.

`details.outcome_provenance` is `synthetic_regression_seed` for the hard
synthetic gate, `operator_confirmed_fixture_metadata` when at least one real
fixture supplies an outcome, and `none` for an outcome-free real corpus.

### Paired effectiveness study

A real fixture may optionally match two equivalent operator-observed tasks with
`effect_pair`. Use the same safe pair `id`, adapter, and query. The `baseline`
variant must have a completed outcome with `improvement_used: false`; the
`promptlane` variant must have a completed outcome with
`improvement_used: true`. Every declared pair must contain exactly one of each
variant. PromptLane rejects incomplete pairs, attribution mismatches, unsafe
ids, and pairs whose adapter or query differs.

The JSON report aggregates these fixtures under
`details.paired_effectiveness`. It reports baseline and PromptLane pass rates,
their delta, and improved/regressed/unchanged transitions without returning
prompt bodies, summaries, evidence refs, or local paths. Zero pairs report
`not_collected`; one or two pairs report `insufficient_pairs`; three or more
report `positive_direction`, `negative_direction`, or `mixed_direction`.
This is a directional observational signal, not a randomized experiment, so
`design` is always `paired_observational` and `causal_claim` is always `false`.
It remains outside the synthetic release gate. Do not claim PromptLane caused
an improvement from a single attributed outcome or from a same-corpus version
trend.

The shipped example contains one structural pair only. Replace it and collect
at least three genuinely matched, consent-bearing pairs before interpreting a
direction. Prefer comparable task type, adapter, verification strength, and
operating conditions; record uncertainty in operator notes outside the fixture
rather than adding private context to benchmark data.

### Baseline comparison

`--baseline-file` reads a prior PromptLane benchmark JSON report locally. The
report includes a `corpus_fingerprint` derived by hashing fixture set,
label/adapter/query/prompt fields, and coach cases. Outcome metadata is excluded
so a later result for the same prompts can be compared. Prompt text and local
paths are never returned through the fingerprint or comparison result.

The baseline must have the same fixture set and corpus fingerprint. Mismatches
return a raw-free `comparison.status: "incompatible"`, reason
`fixture_set_or_corpus_mismatch`, and exit code `1`. Unreadable or malformed
JSON uses reason `unreadable_or_invalid_json`; missing/non-numeric score fields
use `non_numeric_scores`. The current snapshot remains available in stdout for
diagnosis, but an incompatible baseline cannot produce a trend. Score metrics
use their natural direction:
quality/coverage/pass-rate scores are higher-is-better, while privacy leaks and
latencies are lower-is-better. Score changes up to `0.01`, and latency changes
up to the greater of `5ms` or `10%`, are treated as noise and reported as
unchanged. JSON reports expose `comparison.metrics`, `improvements`,
`regressions`, and `unchanged`. Without a baseline, `requires_baseline` remains
true and PromptLane does not call the snapshot a trend.

## Principles

- Use synthetic fixtures for the hard regression gate and consent-bearing,
  redacted real fixtures only for the opt-in soft trend signal.
- Do not include raw secrets, raw absolute paths, or sensitive prompt text in the report.
- Treat v1 as a regression baseline, not a proof of real-user product-market fit.
- Never substitute a synthetic outcome for real-corpus effectiveness evidence.
- Treat paired outcome direction as observational and never emit a causal claim.
- Compare trend and regression across versions rather than treating the absolute score as final quality.

## Metrics

### 1. Privacy Safety

Checks:

- browser prompt list/detail/dashboard API
- anonymized export preview/result
- Markdown archive
- SQLite prompt, analysis, and redaction rows

Metric:

- `privacy_leak_count`

Pass threshold:

- raw API key/token leak count must be `0`
- raw absolute path leak count on browser/export surfaces must be `0`

### 2. Retrieval Quality

Checks:

- known search queries return the expected fixture prompt in the top-k results

Metric:

- `retrieval_top3`

Pass threshold:

- `>= 0.8`

### 3. PromptLane Quality

Checks:

- weak prompt fixtures are improved with goal, context, scope, verification, and output-format sections
- raw secrets are not reintroduced into improvement drafts

Metric:

- `coach_gap_fix_rate`

Pass threshold:

- `>= 0.8`

### 4. Agent Coach Actionability

Checks:

- `coach_prompt` returns a latest-score headline
- the agent brief includes a concrete first fix
- the agent brief includes a low-score review target
- the agent brief includes a reusable next request template
- the agent brief includes archive effectiveness coverage and a review-first
  action when prompts are still unmeasured
- the result stays privacy-safe

Metric:

- `coach_prompt_actionability`

Pass threshold:

- `>= 0.8`

### 5. Analytics Usefulness

Checks:

- total prompt count
- sensitive prompt count
- project distribution
- quality gap summary

Metric:

- `analytics_score`

Pass threshold:

- `>= 0.75`

### 6. Prompt Quality Score Calibration

Checks:

- each fixture prompt receives a deterministic `0-100` prompt quality score
- prompt list and prompt detail expose the same score and band
- vague prompt fixtures score low
- stronger fixtures score meaningfully higher than vague fixtures

Metric:

- `prompt_quality_score_calibration`

Pass threshold:

- `>= 0.8`

Synthetic runs use the `synthetic_score_calibration` profile and require the
known vague prompt to score low plus a meaningful score spread. Real runs use
`real_corpus_delivery_integrity`: all fixture prompts must be scored from
`0-100`, and list/detail values and bands must match. This avoids failing a
real corpus merely because it does not contain the synthetic phrase or score
distribution. The active profile and named checks are returned in
`details.prompt_quality`.

### 7. Prompt Effectiveness Evidence

Checks:

- `/api/v1/score` returns archive-level `effectiveness_summary`
- at least one benchmark prompt is linked to a passed loop outcome
- linked outcome and test counts are present
- unsafe evidence refs are filtered from the summary

Metric:

- `archive_effectiveness_score`
- `archive_effectiveness_coverage`
- `outcome_pass_rate`

Pass threshold:

- `>= 0.8`
- coverage `>= 0.2` for the synthetic smoke corpus
- passed outcomes / explicitly attributed outcomes `>= 0.8`

`archive_effectiveness_score` checks whether explicitly attributed improvement
evidence is safe and usable once present. A passing linked outcome without
`improvement_used: true` remains `unproven`. `archive_effectiveness_coverage` reports the
share of benchmark prompts with linked outcome evidence. Benchmark coverage is
a measurement-depth signal, not a claim of archive-wide proof; low coverage
means the benchmark can prove the mechanism works without proving most prompts
have outcome-backed effectiveness yet.
`outcome_pass_rate` measures the share of explicitly attributed outcomes that passed;
it is separate from evidence-shape checks so a well-formed failed outcome does
not become a healthy usefulness trend.

### 8. Experimental Rules A/B Lift

For each rule registered in `EXPERIMENTAL_RULE_IDS` (currently `verification_v2`), the benchmark runs `analyzePrompt` over every fixture and coach case twice — baseline and the rule enabled in isolation — and reports the score delta.

Output:

- `details.experimental_rules_ab.<rule_id>` in the JSON report:
  - `cases`, `lifted`, `unchanged`, `regressed`
  - `total_delta`, `average_delta`
  - up to 5 lifted-case `examples`
- One console line per rule: `experimental_rules_ab.<rule_id>: lifted N/M, avg_delta D`

This is reported only — there is no pass threshold on lift today, since the synthetic corpus does not exercise spec-style language. Once real user fixtures land (P2-1), the average lift becomes a meaningful trend signal.

To enable a rule for live ingest, edit `~/.promptlane/config.json`:

```json
{
  "experimental_rules": ["verification_v2"]
}
```

The change applies on next server start. The setting is purely additive — if the rule is empty or omitted, the analyzer behaves exactly as the baseline.

### 9. Local Runtime Performance

Checks:

- ingest p95
- search p95
- dashboard latency
- export latency

Pass thresholds:

- `ingest_p95_ms <= 500`
- `search_p95_ms <= 250`
- `dashboard_ms <= 500`
- `export_ms <= 1000`

## Report Shape

```json
{
  "version": "1.0.0",
  "dataset": "benchmark-v1",
  "fixture_set": "synthetic",
  "corpus_fingerprint": "corpus_1234567890abcdef",
  "pass": true,
  "evidence_state": {
    "effectiveness": "regression_gate_passed_not_real_world_proof",
    "release_blocking": false,
    "requires_real_fixtures": true,
    "requires_real_outcomes": true,
    "requires_baseline": false,
    "release_gate": "synthetic",
    "trend_signal": "real"
  },
  "next_action": "Synthetic pass means the local regression gate is green; collect real fixtures before claiming real-world effectiveness.",
  "comparison": {
    "status": "not_requested",
    "corpus_fingerprint": "corpus_1234567890abcdef",
    "improvements": [],
    "regressions": [],
    "unchanged": []
  },
  "scores": {
    "privacy_leak_count": 0,
    "retrieval_top3": 1,
    "coach_gap_fix_rate": 1,
    "coach_prompt_actionability": 1,
    "prompt_quality_score_calibration": 1,
    "archive_effectiveness_score": 1,
    "archive_effectiveness_coverage": 0.2,
    "outcome_pass_rate": 1,
    "analytics_score": 1,
    "ingest_p95_ms": 21,
    "search_p95_ms": 8,
    "dashboard_ms": 12,
    "export_ms": 16
  },
  "details": {
    "prompt_quality": {
      "score": 1,
      "profile": "synthetic_score_calibration",
      "checks": {
        "all_prompts_scored": true,
        "scores_in_range": true,
        "list_detail_consistent": true,
        "vague_prompt_scores_low": true,
        "score_spread_is_calibrated": true
      }
    },
    "archive_effectiveness": {
      "measured_prompts": 1,
      "unmeasured_prompts": 4,
      "verdicts": {
        "proven": 1,
        "mixed": 0,
        "unproven": 0
      },
      "calibration": {
        "linked_outcomes": 1,
        "passing_outcomes": 1,
        "total_tests_run": 3
      },
      "top_evidence_refs": [
        "benchmark:effectiveness",
        "corepack pnpm benchmark"
      ],
      "next_action": "Link recent prompts to loop outcomes before claiming archive-wide effectiveness."
    },
    "outcome_provenance": "synthetic_regression_seed",
    "experimental_rules_ab": {
      "verification_v2": {
        "cases": 10,
        "lifted": 0,
        "unchanged": 10,
        "regressed": 0,
        "total_delta": 0,
        "average_delta": 0,
        "examples": []
      }
    }
  },
  "thresholds": {
    "privacy_leak_count": 0,
    "retrieval_top3": 0.8,
    "coach_gap_fix_rate": 0.8,
    "coach_prompt_actionability": 0.8,
    "prompt_quality_score_calibration": 0.8,
    "archive_effectiveness_score": 0.8,
    "archive_effectiveness_coverage": 0.2,
    "outcome_pass_rate": 0.8,
    "analytics_score": 0.75,
    "ingest_p95_ms": 500,
    "search_p95_ms": 250,
    "dashboard_ms": 500,
    "export_ms": 1000
  }
}
```

Missing real fixture output is intentionally a soft signal, but it is explicit
about the missing evidence:

```json
{
  "dataset": "benchmark-v1-real",
  "fixture_set": "real",
  "soft_signal": true,
  "status": "no_fixtures",
  "evidence_state": {
    "effectiveness": "unproven",
    "release_blocking": false,
    "requires_real_fixtures": true,
    "requires_real_outcomes": true,
    "requires_baseline": true,
    "release_gate": "synthetic",
    "trend_signal": "real"
  },
  "next_action": "Add consent-bearing redacted real fixtures before using real benchmark trends."
}
```

## v1 Exclusions

- automatic real user archive ingestion
- external LLM-as-judge
- semantic search quality
- cross-platform performance comparison
- long-term retention analysis

Those items should become opt-in benchmarks after the 1.0.0 opening release.
