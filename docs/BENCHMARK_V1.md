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
corepack pnpm benchmark
corepack pnpm --silent benchmark -- --json
corepack pnpm benchmark -- --fixture-set real      # opt-in, soft signal only
```

The command builds the production app first, creates an isolated temporary data directory, starts the local server on a temporary loopback port, ingests synthetic fixture prompts, and measures API/UI-adjacent behavior through the built app.

### Fixture sets

- `--fixture-set synthetic` (default) — hard CI gate. Synthetic fixtures designed to exercise each scoring axis. Threshold misses fail the run.
- `--fixture-set real` — soft signal. Reads consent-bearing redacted prompts from `docs/benchmark-fixtures/real.json`. If the file is absent the script exits 0 with a `status: no_fixtures` notice. If it exists, threshold misses are reported but the script still exits 0 — so a regression on a noisy real corpus does not break CI but is visible in trend.

The JSON report includes `fixture_set` and `soft_signal` fields so consumers can filter.
It also includes a top-level `next_action`: synthetic passes say the local
regression gate is green while still requiring real fixtures before claiming
real-world effectiveness; real fixture runs stay soft trend signals.

`docs/benchmark-fixtures/real.json` must use this raw-free shape:

```json
{
  "consent_note": "Operator-confirmed redacted prompts approved for local benchmark use on 2026-07-09.",
  "fixtures": [
    {
      "label": "real_release_review",
      "adapter": "codex",
      "query": "release readiness review",
      "prompt": "Review the redacted release readiness notes and return the next verification step."
    }
  ],
  "coach_cases": ["Improve this redacted prompt with verification criteria."]
}
```

Start from the shipped example if you need a local template:

```sh
mkdir -p docs/benchmark-fixtures
cp docs/benchmark-fixtures/real.example.json docs/benchmark-fixtures/real.json
```

Then replace the example prompts with consent-bearing redacted prompts before
using `--fixture-set real` as a trend signal.

The top-level `consent_note` is required and must record that the prompts were
approved for local benchmark use after redaction. Each fixture needs a unique
safe `label`, plus `adapter`, `query`, and `prompt`. Labels must start with a
lowercase letter or digit and then use only lowercase letters, digits, `_`, or
`-` with a maximum length of 64 characters. `adapter` must be `codex` or
`claude-code`. Real fixtures are consent-bearing soft signals only:
redact secrets, tokens, and absolute local paths from fixture labels, queries,
prompts, coach cases, and `consent_note` before writing the file. The loader
rejects obvious `sk-...`, `npm_...`, `/Users/...`, `/home/...`,
`/Volumes/...`, and `C:\Users\...` values so the benchmark does not ingest
private raw text by accident.

## Principles

- Use synthetic fixture prompts only.
- Do not include raw secrets, raw absolute paths, or sensitive prompt text in the report.
- Treat v1 as a regression baseline, not a proof of real-user product-market fit.
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

### 7. Prompt Effectiveness Evidence

Checks:

- `/api/v1/score` returns archive-level `effectiveness_summary`
- at least one benchmark prompt is linked to a passed loop outcome
- linked outcome and test counts are present
- unsafe evidence refs are filtered from the summary

Metric:

- `archive_effectiveness_score`
- `archive_effectiveness_coverage`

Pass threshold:

- `>= 0.8`
- coverage `>= 0.2` for the synthetic smoke corpus

`archive_effectiveness_score` checks whether linked loop-outcome evidence is
safe and usable once present. `archive_effectiveness_coverage` reports the
share of benchmark prompts with linked outcome evidence. Benchmark coverage is
a measurement-depth signal, not a claim of archive-wide proof; low coverage
means the benchmark can prove the mechanism works without proving most prompts
have outcome-backed effectiveness yet.

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
  "pass": true,
  "next_action": "Synthetic pass means the local regression gate is green; collect real fixtures before claiming real-world effectiveness.",
  "scores": {
    "privacy_leak_count": 0,
    "retrieval_top3": 1,
    "coach_gap_fix_rate": 1,
    "coach_prompt_actionability": 1,
    "prompt_quality_score_calibration": 1,
    "archive_effectiveness_score": 1,
    "archive_effectiveness_coverage": 0.2,
    "analytics_score": 1,
    "ingest_p95_ms": 21,
    "search_p95_ms": 8,
    "dashboard_ms": 12,
    "export_ms": 16
  },
  "details": {
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
    "analytics_score": 0.75,
    "ingest_p95_ms": 500,
    "search_p95_ms": 250,
    "dashboard_ms": 500,
    "export_ms": 1000
  }
}
```

## v1 Exclusions

- real user archive evaluation
- external LLM-as-judge
- semantic search quality
- cross-platform performance comparison
- long-term retention analysis

Those items should become opt-in benchmarks after the 1.0.0 opening release.
