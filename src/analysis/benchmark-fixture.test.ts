import { describe, expect, it } from "vitest";

import { createRealBenchmarkFixture } from "./benchmark-fixture.js";
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
