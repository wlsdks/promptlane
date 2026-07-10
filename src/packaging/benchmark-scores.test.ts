import { join } from "node:path";
import { pathToFileURL } from "node:url";

import { describe, expect, it } from "vitest";

async function scoreModule() {
  return import(
    pathToFileURL(join(process.cwd(), "scripts/benchmark-scores.mjs")).href
  );
}

describe("benchmark scoring profiles", () => {
  const listItems = [
    {
      id: "one",
      quality_score: 62,
      quality_score_band: "fair",
      snippet: "First",
    },
    {
      id: "two",
      quality_score: 68,
      quality_score_band: "fair",
      snippet: "Second",
    },
  ];
  const detailItems = [
    { id: "one", analysis: { quality_score: { value: 62, band: "fair" } } },
    { id: "two", analysis: { quality_score: { value: 68, band: "fair" } } },
  ];

  it("scores real corpus delivery integrity without synthetic fixture assumptions", async () => {
    const { scorePromptQualityEvidence } = await scoreModule();

    expect(
      scorePromptQualityEvidence({
        fixtureSet: "real",
        listItems,
        detailItems,
        fixtureCount: 2,
      }),
    ).toEqual({
      score: 1,
      profile: "real_corpus_delivery_integrity",
      checks: {
        all_prompts_scored: true,
        scores_in_range: true,
        list_detail_consistent: true,
      },
    });
  });

  it("keeps vague-prompt and score-spread calibration in the synthetic profile", async () => {
    const { scorePromptQualityEvidence } = await scoreModule();

    expect(
      scorePromptQualityEvidence({
        fixtureSet: "synthetic",
        listItems,
        detailItems,
        fixtureCount: 2,
      }),
    ).toEqual({
      score: 0.6,
      profile: "synthetic_score_calibration",
      checks: {
        all_prompts_scored: true,
        scores_in_range: true,
        list_detail_consistent: true,
        vague_prompt_scores_low: false,
        score_spread_is_calibrated: false,
      },
    });
  });

  it("measures actual passed outcomes independently from evidence shape", async () => {
    const { scoreOutcomePassRate } = await scoreModule();

    expect(
      scoreOutcomePassRate({
        calibration: { attributed_outcomes: 3, passing_outcomes: 2 },
      }),
    ).toBe(0.667);
    expect(
      scoreOutcomePassRate({
        calibration: { attributed_outcomes: 0, passing_outcomes: 0 },
      }),
    ).toBe(0);
  });

  it("reports paired observational effectiveness without claiming causality", async () => {
    const { scorePairedEffectiveness } = await scoreModule();
    const pairedFixtures = [
      pairedFixture("release_one", "baseline", "failed"),
      pairedFixture("release_one", "promptlane", "passed"),
      pairedFixture("release_two", "baseline", "failed"),
      pairedFixture("release_two", "promptlane", "failed"),
      pairedFixture("release_three", "baseline", "passed"),
      pairedFixture("release_three", "promptlane", "passed"),
    ];

    expect(scorePairedEffectiveness(pairedFixtures)).toEqual({
      design: "paired_observational",
      causal_claim: false,
      status: "positive_direction",
      pair_count: 3,
      minimum_directional_pairs: 3,
      baseline_pass_rate: 0.333,
      promptlane_pass_rate: 0.667,
      pass_rate_delta: 0.333,
      transitions: {
        improved: 1,
        regressed: 0,
        unchanged_passed: 1,
        unchanged_failed: 1,
      },
    });
  });

  it("keeps missing and undersized paired evidence explicitly unproven", async () => {
    const { scorePairedEffectiveness } = await scoreModule();

    expect(scorePairedEffectiveness([])).toEqual({
      design: "paired_observational",
      causal_claim: false,
      status: "not_collected",
      pair_count: 0,
      minimum_directional_pairs: 3,
      baseline_pass_rate: null,
      promptlane_pass_rate: null,
      pass_rate_delta: null,
      transitions: {
        improved: 0,
        regressed: 0,
        unchanged_passed: 0,
        unchanged_failed: 0,
      },
    });
    expect(
      scorePairedEffectiveness([
        pairedFixture("release_one", "baseline", "failed"),
        pairedFixture("release_one", "promptlane", "passed"),
      ]).status,
    ).toBe("insufficient_pairs");
  });

  it("accepts operator evidence refs for real effectiveness shape checks", async () => {
    const { scoreArchiveEffectivenessEvidence } = await scoreModule();
    const report = {
      effectiveness_summary: {
        measured_prompts: 1,
        unmeasured_prompts: 1,
        verdicts: { proven: 1 },
        calibration: {
          linked_outcomes: 1,
          attributed_outcomes: 1,
          passing_outcomes: 1,
          total_tests_run: 4,
        },
        top_evidence_refs: ["test:focused-check"],
        next_action:
          "Link more real prompts to completed outcomes for coverage.",
      },
    };

    expect(
      scoreArchiveEffectivenessEvidence({
        fixtureSet: "real",
        report,
        fixtureCount: 2,
        forbiddenValues: [],
      }),
    ).toBe(1);
    expect(
      scoreArchiveEffectivenessEvidence({
        fixtureSet: "synthetic",
        report,
        fixtureCount: 2,
        forbiddenValues: [],
      }),
    ).toBe(0.9);
  });

  it("builds a stable raw-free fingerprint from fixture set and safe labels", async () => {
    const { benchmarkCorpusFingerprint } = await scoreModule();

    const first = benchmarkCorpusFingerprint({
      fixtureSet: "real",
      fixtures: [
        {
          label: "release_review",
          adapter: "codex",
          query: "release query",
          prompt: "Review the redacted release notes.",
        },
        {
          label: "setup_check",
          adapter: "claude-code",
          query: "setup query",
          prompt: "Review the redacted setup result.",
        },
      ],
      coachCases: ["Improve the redacted release request."],
    });
    const reordered = benchmarkCorpusFingerprint({
      fixtureSet: "real",
      fixtures: [
        {
          label: "setup_check",
          adapter: "claude-code",
          query: "setup query",
          prompt: "Review the redacted setup result.",
        },
        {
          label: "release_review",
          adapter: "codex",
          query: "release query",
          prompt: "Review the redacted release notes.",
        },
      ],
      coachCases: ["Improve the redacted release request."],
    });

    expect(first).toMatch(/^corpus_[a-f0-9]{16}$/);
    expect(reordered).toBe(first);
    expect(first).not.toContain("release_review");
    expect(
      benchmarkCorpusFingerprint({
        fixtureSet: "real",
        fixtures: [
          {
            label: "release_review",
            adapter: "codex",
            query: "release query",
            prompt: "A changed redacted prompt.",
          },
        ],
        coachCases: ["Improve the redacted release request."],
      }),
    ).not.toBe(first);
  });

  it("compares only the same corpus and classifies metric direction", async () => {
    const { compareBenchmarkReports } = await scoreModule();
    const current = {
      fixture_set: "real",
      corpus_fingerprint: "corpus_1234567890abcdef",
      scores: {
        retrieval_top3: 0.9,
        outcome_pass_rate: 0.8,
        ingest_p95_ms: 20,
      },
    };
    const baseline = {
      fixture_set: "real",
      corpus_fingerprint: "corpus_1234567890abcdef",
      scores: {
        retrieval_top3: 0.8,
        outcome_pass_rate: 1,
        ingest_p95_ms: 30,
      },
    };

    expect(compareBenchmarkReports({ current, baseline })).toEqual({
      status: "compared",
      corpus_fingerprint: "corpus_1234567890abcdef",
      metrics: {
        retrieval_top3: {
          baseline: 0.8,
          current: 0.9,
          delta: 0.1,
          direction: "higher_is_better",
          change: "improved",
        },
        outcome_pass_rate: {
          baseline: 1,
          current: 0.8,
          delta: -0.2,
          direction: "higher_is_better",
          change: "regressed",
        },
        ingest_p95_ms: {
          baseline: 30,
          current: 20,
          delta: -10,
          direction: "lower_is_better",
          change: "improved",
        },
      },
      improvements: ["ingest_p95_ms", "retrieval_top3"],
      regressions: ["outcome_pass_rate"],
      unchanged: [],
    });
    expect(
      compareBenchmarkReports({
        current,
        baseline: { ...baseline, corpus_fingerprint: "corpus_other" },
      }),
    ).toEqual({
      status: "incompatible",
      reason: "fixture_set_or_corpus_mismatch",
      corpus_fingerprint: "corpus_1234567890abcdef",
      metrics: {},
      improvements: [],
      regressions: [],
      unchanged: [],
    });
    expect(
      compareBenchmarkReports({
        current,
        baseline: { ...baseline, scores: { retrieval_top3: "private value" } },
      }),
    ).toEqual({
      status: "incompatible",
      reason: "non_numeric_scores",
      corpus_fingerprint: "corpus_1234567890abcdef",
      metrics: {},
      improvements: [],
      regressions: [],
      unchanged: [],
    });
  });
});

function pairedFixture(
  pairId: string,
  variant: "baseline" | "promptlane",
  status: "passed" | "failed",
) {
  return {
    label: `${pairId}_${variant}`,
    adapter: "codex",
    query: pairId,
    prompt: `Redacted ${variant} prompt for ${pairId}.`,
    effect_pair: { id: pairId, variant },
    outcome: {
      status,
      summary: `Redacted ${variant} outcome.`,
      improvement_used: variant === "promptlane",
      evidence_refs: [`test:${pairId}-${variant}`],
      tests_run: 1,
    },
  };
}
