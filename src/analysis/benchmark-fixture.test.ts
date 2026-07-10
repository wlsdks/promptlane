import { describe, expect, it } from "vitest";

import {
  createPairedRealBenchmarkFixture,
  createRealBenchmarkFixture,
} from "./benchmark-fixture.js";
import type { PromptDetail } from "../storage/ports.js";

describe("createRealBenchmarkFixture", () => {
  it("exports selected redacted prompts and only explicitly attributed outcomes", () => {
    const fixture = createRealBenchmarkFixture({
      consentNote:
        "Operator approved these redacted prompts for local benchmarking.",
      prompts: [promptDetail()],
    });

    expect(fixture).toEqual({
      template_only: false,
      consent_note:
        "Operator approved these redacted prompts for local benchmarking.",
      fixtures: [
        {
          label: "real_1_1234567890ab",
          adapter: "codex",
          query: "review benchmark fixture",
          prompt: "Review benchmark fixture generation and run focused tests.",
          outcome: {
            status: "passed",
            summary: "Attributed benchmark checks passed.",
            improvement_used: true,
            evidence_refs: ["test:benchmark-fixture"],
            tests_run: 3,
          },
        },
      ],
      coach_cases: [
        "Review benchmark fixture generation and run focused tests.",
      ],
    });
  });

  it("omits a linked outcome when improvement use was not attributed", () => {
    const prompt = promptDetail();
    prompt.loop_outcomes = prompt.loop_outcomes?.map((outcome) => ({
      ...outcome,
      improvement_used: false,
    }));

    expect(
      createRealBenchmarkFixture({
        consentNote: "Operator approved redacted local benchmark fixtures.",
        prompts: [prompt],
      }).fixtures[0],
    ).not.toHaveProperty("outcome");
  });

  it("rejects residual sensitive values without echoing them", () => {
    const prompt = promptDetail();
    prompt.markdown = "Read /Users/example/private/result.log";

    expect(() =>
      createRealBenchmarkFixture({
        consentNote: "Operator approved redacted local benchmark fixtures.",
        prompts: [prompt],
      }),
    ).toThrow("Selected benchmark prompts must be redacted before export.");
  });

  it("rejects sensitive consent and attributed evidence independently", () => {
    expect(() =>
      createRealBenchmarkFixture({
        consentNote: "Approved at /Users/example/private/consent.txt",
        prompts: [promptDetail()],
      }),
    ).toThrow("Real benchmark fixture consent note must be redacted.");

    const prompt = promptDetail();
    prompt.loop_outcomes![0]!.evidence_refs = [
      "/Users/example/private/result.log",
    ];
    expect(() =>
      createRealBenchmarkFixture({
        consentNote: "Operator approved redacted local benchmark fixtures.",
        prompts: [prompt],
      }),
    ).toThrow(
      "Selected benchmark outcome evidence must be redacted before export.",
    );
  });

  it("rejects prompts without searchable fixture text", () => {
    const prompt = promptDetail();
    prompt.markdown = "!!";

    expect(() =>
      createRealBenchmarkFixture({
        consentNote: "Operator approved redacted local benchmark fixtures.",
        prompts: [prompt],
      }),
    ).toThrow("Selected benchmark prompts must include searchable text.");
  });
});

describe("createPairedRealBenchmarkFixture", () => {
  it("creates a matched baseline and explicitly attributed PromptLane pair", () => {
    const baseline = promptDetail();
    baseline.id = "prmt_baseline";
    baseline.loop_outcomes![0]!.improvement_used = false;
    baseline.loop_outcomes![0]!.status = "failed";
    const treatment = promptDetail();
    treatment.id = "prmt_treatment";

    expect(
      createPairedRealBenchmarkFixture({
        consentNote: "Operator approved this redacted matched pair.",
        pairId: "release_review",
        query: "release verification",
        baselinePrompt: baseline,
        promptlanePrompt: treatment,
      }),
    ).toEqual({
      template_only: false,
      consent_note: "Operator approved this redacted matched pair.",
      fixtures: [
        expect.objectContaining({
          label: "release_review_baseline",
          adapter: "codex",
          query: "release verification",
          effect_pair: { id: "release_review", variant: "baseline" },
          outcome: expect.objectContaining({
            status: "failed",
            improvement_used: false,
          }),
        }),
        expect.objectContaining({
          label: "release_review_promptlane",
          adapter: "codex",
          query: "release verification",
          effect_pair: { id: "release_review", variant: "promptlane" },
          outcome: expect.objectContaining({
            status: "passed",
            improvement_used: true,
          }),
        }),
      ],
      coach_cases: [baseline.markdown, treatment.markdown],
    });
  });

  it("requires distinct prompts with matching supported tools", () => {
    const baseline = promptDetail();
    baseline.loop_outcomes![0]!.improvement_used = false;

    expect(() =>
      createPairedRealBenchmarkFixture({
        consentNote: "Operator approved this redacted matched pair.",
        pairId: "release_review",
        query: "release verification",
        baselinePrompt: baseline,
        promptlanePrompt: baseline,
      }),
    ).toThrow("Paired benchmark prompts must be distinct.");

    const treatment = promptDetail();
    treatment.id = "prmt_treatment";
    treatment.tool = "claude-code";
    expect(() =>
      createPairedRealBenchmarkFixture({
        consentNote: "Operator approved this redacted matched pair.",
        pairId: "release_review",
        query: "release verification",
        baselinePrompt: baseline,
        promptlanePrompt: treatment,
      }),
    ).toThrow("Paired benchmark prompts must use the same supported tool.");
  });

  it("requires safe completed baseline and attributed PromptLane outcomes", () => {
    const baseline = promptDetail();
    baseline.id = "prmt_baseline";
    const treatment = promptDetail();
    treatment.id = "prmt_treatment";

    expect(() =>
      createPairedRealBenchmarkFixture({
        consentNote: "Operator approved this redacted matched pair.",
        pairId: "release_review",
        query: "release verification",
        baselinePrompt: baseline,
        promptlanePrompt: treatment,
      }),
    ).toThrow(
      "Baseline prompt requires completed redacted outcome evidence without PromptLane improvement attribution.",
    );

    baseline.loop_outcomes![0]!.improvement_used = false;
    treatment.loop_outcomes![0]!.improvement_used = false;
    expect(() =>
      createPairedRealBenchmarkFixture({
        consentNote: "Operator approved this redacted matched pair.",
        pairId: "release_review",
        query: "release verification",
        baselinePrompt: baseline,
        promptlanePrompt: treatment,
      }),
    ).toThrow(
      "PromptLane prompt requires completed redacted outcome evidence with explicit improvement attribution.",
    );
  });

  it("rejects unsafe pair metadata and evidence without echoing private values", () => {
    const baseline = promptDetail();
    baseline.id = "prmt_baseline";
    baseline.loop_outcomes![0]!.improvement_used = false;
    const treatment = promptDetail();
    treatment.id = "prmt_treatment";

    expect(() =>
      createPairedRealBenchmarkFixture({
        consentNote: "Operator approved this redacted matched pair.",
        pairId: "release_review",
        query: "Review /Users/example/private/release notes",
        baselinePrompt: baseline,
        promptlanePrompt: treatment,
      }),
    ).toThrow("Paired benchmark query must be non-empty and redacted.");

    baseline.loop_outcomes![0]!.evidence_refs = [
      "/Users/example/private/result.log",
    ];
    expect(() =>
      createPairedRealBenchmarkFixture({
        consentNote: "Operator approved this redacted matched pair.",
        pairId: "release_review",
        query: "release verification",
        baselinePrompt: baseline,
        promptlanePrompt: treatment,
      }),
    ).toThrow(
      "Paired benchmark outcome evidence must be redacted before export.",
    );
  });
});

function promptDetail(): PromptDetail {
  return {
    id: "prmt_20260710_001122_1234567890ab",
    tool: "codex",
    source_event: "UserPromptSubmit",
    session_id: "session-benchmark",
    cwd: "private-project",
    created_at: "2026-07-10T00:11:22.000Z",
    received_at: "2026-07-10T00:11:22.000Z",
    snippet: "Review benchmark fixture generation",
    prompt_length: 58,
    is_sensitive: false,
    excluded_from_analysis: false,
    redaction_policy: "mask",
    adapter_version: "1",
    index_status: "indexed",
    tags: ["test"],
    quality_gaps: [],
    quality_score: 90,
    quality_score_band: "excellent",
    usefulness: { copied_count: 0, bookmarked: false },
    duplicate_count: 0,
    markdown: "Review benchmark fixture generation and run focused tests.",
    improvement_drafts: [],
    loop_outcomes: [
      {
        snapshot_id: "loop_benchmark",
        status: "passed",
        summary: "Attributed benchmark checks passed.",
        evidence_refs: ["test:benchmark-fixture"],
        tests_run: 3,
        improvement_used: true,
      },
    ],
  };
}
