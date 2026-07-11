import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import {
  createUsefulnessReport,
  renderUsefulnessSvg,
} from "../../scripts/usefulness-report.mjs";

const tempDirs: string[] = [];

afterEach(() => {
  for (const dir of tempDirs.splice(0)) {
    rmSync(dir, { recursive: true, force: true });
  }
});

describe("usefulness report generator", () => {
  it("aggregates paired outcomes, costs, friction, and task coverage", () => {
    const report = createUsefulnessReport(ledger());

    expect(report).toMatchObject({
      status: "insufficient_data",
      causal_claim: false,
      pair_count: 3,
      task_type_count: 3,
      minimums: { pairs: 10, task_types: 3 },
      baseline: {
        success_rate: 0.666667,
        mean_actionability: 0.6,
        mean_tool_calls: 4,
        mean_input_tokens: 1_000,
        friction_free_rate: 0.333333,
      },
      looprelay: {
        success_rate: 1,
        mean_actionability: 0.8,
        mean_tool_calls: 5,
        mean_input_tokens: 1_500,
        friction_free_rate: 0.666667,
      },
      transitions: { improved: 1, regressed: 0, unchanged_passed: 2 },
      preference: { baseline: 0, looprelay: 2, tie: 1 },
      bias: { position_consistency: 1 },
    });
  });

  it("renders an honest SVG with values, sample size, and insufficient-data state", () => {
    const svg = renderUsefulnessSvg(createUsefulnessReport(ledger()));

    expect(svg).toContain("LoopRelay engineering usefulness");
    expect(svg).toContain("INSUFFICIENT DATA");
    expect(svg).toContain("3 matched pairs · 3 task types");
    expect(svg).toContain("Success rate");
    expect(svg).toContain("Tool calls");
    expect(svg).toContain("causal claim: false");
    expect(svg).not.toContain("/Users/example");
  });

  it("rejects causal claims, prompt-bearing fields, secrets, and raw paths", () => {
    expect(() =>
      createUsefulnessReport({ ...ledger(), causal_claim: true }),
    ).toThrow("causal_claim must be false");
    expect(() =>
      createUsefulnessReport({ ...ledger(), prompt: "private prompt" }),
    ).toThrow("prompt-bearing fields are not allowed");
    expect(() =>
      createUsefulnessReport({ ...ledger(), note: "sk-proj-secret-value" }),
    ).toThrow("sensitive or raw-path content");
    expect(() =>
      createUsefulnessReport({ ...ledger(), note: "/Users/example/private" }),
    ).toThrow("sensitive or raw-path content");
  });

  it("writes deterministic generated artifacts from a local ledger", () => {
    const dir = mkdtempSync(join(tmpdir(), "looprelay-usefulness-"));
    tempDirs.push(dir);
    const ledgerPath = join(dir, "ledger.json");
    const svgPath = join(dir, "result.svg");
    const summaryPath = join(dir, "summary.json");
    writeFileSync(ledgerPath, JSON.stringify(ledger()), "utf8");

    const report = createUsefulnessReport(
      JSON.parse(readFileSync(ledgerPath, "utf8")),
    );
    writeFileSync(svgPath, renderUsefulnessSvg(report), "utf8");
    writeFileSync(summaryPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

    expect(readFileSync(svgPath, "utf8")).toContain("INSUFFICIENT DATA");
    expect(JSON.parse(readFileSync(summaryPath, "utf8"))).toEqual(report);
  });
});

function ledger() {
  return {
    version: 1,
    design: "matched_observational",
    causal_claim: false,
    minimums: { pairs: 10, task_types: 3 },
    pairs: [
      pair("session_recovery", "baseline_first", true, true, 0.6, 0.8, 0, 0),
      pair(
        "implementation_continuation",
        "looprelay_first",
        false,
        true,
        0.4,
        0.8,
        1,
        0,
      ),
      pair(
        "failure_prevention",
        "baseline_first",
        true,
        true,
        0.8,
        0.8,
        1,
        1,
        "tie",
      ),
    ],
  };
}

function pair(
  taskType: string,
  order: "baseline_first" | "looprelay_first",
  baselinePassed: boolean,
  looprelayPassed: boolean,
  baselineActionability: number,
  looprelayActionability: number,
  baselineFriction: number,
  looprelayFriction: number,
  preference: "baseline" | "looprelay" | "tie" = "looprelay",
) {
  return {
    id: `pair-${taskType.replaceAll("_", "-")}`,
    task_type: taskType,
    order,
    baseline: {
      passed: baselinePassed,
      actionability: baselineActionability,
      elapsed_ms: 10_000,
      tool_calls: 4,
      input_tokens: 1_000,
      output_tokens: 100,
      friction_count: baselineFriction,
    },
    looprelay: {
      passed: looprelayPassed,
      actionability: looprelayActionability,
      elapsed_ms: 12_000,
      tool_calls: 5,
      input_tokens: 1_500,
      output_tokens: 120,
      friction_count: looprelayFriction,
      adopted: true,
    },
    human_preference: preference,
    judge: { position_consistent: true },
  };
}
