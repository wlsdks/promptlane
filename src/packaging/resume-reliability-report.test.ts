import { describe, expect, it } from "vitest";

import {
  createResumeReliabilityReport,
  validateResumeReliabilityLedger,
} from "../../scripts/resume-reliability-report.mjs";

describe("resume reliability report", () => {
  it("keeps an empty cohort in collecting state without fabricating outcomes", () => {
    const report = createResumeReliabilityReport(ledger([]));

    expect(report).toMatchObject({
      causal_claim: false,
      status: "collecting",
      pair_count: 0,
      pairs_remaining: 10,
      intervention: { decision: "collect" },
    });
    expect(report.baseline.success_rate).toBeNull();
    expect(report.looprelay.correct_target_rate).toBeNull();
  });

  it("retains regressions and narrows the policy when reliability does not improve", () => {
    const pairs = Array.from({ length: 10 }, (_, index) => ({
      id: `resume-${String(index + 1).padStart(2, "0")}`,
      order: index % 2 === 0 ? "baseline_first" : "looprelay_first",
      recovery_class: [
        "checkpoint_focus",
        "policy_recovery",
        "worktree_resolution",
      ][index % 3],
      assessment: "tool_event_trace",
      baseline: condition({
        correct_target: true,
        correct_first_action: true,
        passed: true,
      }),
      looprelay: condition({
        adopted: true,
        correct_target: index === 0,
        correct_first_action: index === 0,
        passed: index === 0,
      }),
      preference: "baseline",
    }));

    const report = createResumeReliabilityReport(ledger(pairs));

    expect(report.status).toBe("directional_evidence_ready");
    expect(report.transitions.regressed).toBe(9);
    expect(report.intervention.decision).toBe("narrow");
    expect(report.delta.correct_target_rate).toBe(-0.9);
    expect(report.scoring).toEqual({
      method: "tool_event_trace",
      model_self_report_used: false,
    });
  });

  it("keeps a full but order-imbalanced cohort in collection", () => {
    const report = createResumeReliabilityReport(
      ledger(
        Array.from({ length: 10 }, (_, index) => ({
          ...pair(`resume-${String(index + 1).padStart(2, "0")}`),
          order: "baseline_first",
        })),
      ),
    );

    expect(report).toMatchObject({
      status: "collecting",
      pair_count: 10,
      pairs_remaining: 0,
      counterbalanced: false,
      intervention: { decision: "collect" },
    });
  });

  it("keeps a full balanced cohort in collection without recovery-class coverage", () => {
    const report = createResumeReliabilityReport(
      ledger(
        Array.from({ length: 10 }, (_, index) => ({
          ...pair(`resume-${String(index + 1).padStart(2, "0")}`),
          order: index % 2 === 0 ? "baseline_first" : "looprelay_first",
        })),
      ),
    );

    expect(report).toMatchObject({
      status: "collecting",
      counterbalanced: true,
      recovery_class_coverage: { observed: 1, required: 3 },
    });
  });

  it("rejects raw path-like keys and missing treatment adoption", () => {
    expect(() =>
      validateResumeReliabilityLedger({
        ...ledger([]),
        pairs: [{ ...pair("resume-01"), branch: "private" }],
      }),
    ).toThrow("forbidden raw-bearing key");
    expect(() =>
      validateResumeReliabilityLedger({
        ...ledger([]),
        pairs: [
          {
            ...pair("resume-01"),
            looprelay: condition({ adopted: undefined }),
          },
        ],
      }),
    ).toThrow("LoopRelay adoption is required");
    expect(() =>
      validateResumeReliabilityLedger({
        ...ledger([]),
        pairs: [{ ...pair("resume-01"), assessment: "model_self_report" }],
      }),
    ).toThrow("independent tool event trace");
  });
});

function ledger(pairs: ReturnType<typeof pair>[]) {
  return {
    version: 1,
    design: "matched_observational",
    causal_claim: false,
    minimums: { pairs: 10, recovery_classes: 3 },
    pairs,
  };
}

function pair(id: string) {
  return {
    id,
    order: "baseline_first",
    recovery_class: "checkpoint_focus",
    assessment: "tool_event_trace",
    baseline: condition(),
    looprelay: condition({ adopted: true }),
    preference: "tie",
  };
}

function condition(overrides: Record<string, unknown> = {}) {
  return {
    passed: true,
    correct_target: true,
    correct_first_action: true,
    evidence_attached: true,
    elapsed_ms: 1000,
    friction_count: 0,
    wrong_target_count: 0,
    ...overrides,
  };
}
