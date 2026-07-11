import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import {
  createUsefulnessReport,
  renderReadmeResultBlock,
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
      independent_user_count: 0,
      independent_agent_operator_count: 0,
      independent_agent_operator_success_rate: null,
      public_readiness: {
        ready: false,
        reason: "independent_users_missing",
      },
      minimums: { pairs: 10, task_types: 3, independent_users: 3 },
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
      bias: { position_consistency: 1, human_review_agreement: 1 },
      by_task_type: {
        implementation_continuation: {
          pair_count: 1,
          baseline_success_rate: 0,
          looprelay_success_rate: 1,
          success_rate_delta: 1,
        },
      },
    });
  });

  it("renders an honest SVG with values, sample size, and insufficient-data state", () => {
    const svg = renderUsefulnessSvg(createUsefulnessReport(ledger()));

    expect(svg).toContain("LoopRelay engineering usefulness");
    expect(svg).toContain("INSUFFICIENT DATA");
    expect(svg).toContain("3 matched pairs · 3 task types");
    expect(svg).toContain("Success rate");
    expect(svg).toContain("Tool calls");
    expect(svg).toContain("Implementation continuation");
    expect(svg).toContain("causal claim: false");
    expect(svg).not.toContain("/Users/example");
  });

  it("renders README results with task-specific regressions and limitations", () => {
    const report = createUsefulnessReport(ledger());
    const markdown = renderReadmeResultBlock(report, "en");

    expect(markdown).toContain("3 matched pairs across 3 task types");
    expect(markdown).toContain("Implementation continuation");
    expect(markdown).toContain("+100pp");
    expect(markdown).toContain("maintainer-run observational evidence");
    expect(markdown).toContain("causal claim remains false");
    expect(markdown).toContain("0/3 independent users");
    expect(markdown).toContain("0 independent agent operators");
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

  it("keeps public readiness blocked until three successful independent flows", () => {
    const input = ledger();
    input.independent_users = [1, 2, 3].map((index) => ({
      id: `participant-${index}`,
      independence_confirmed: true,
      install_success: true,
      first_value_success: true,
      install_elapsed_ms: 10_000,
      time_to_first_value_ms: 20_000,
      recovery_count: 0,
      friction_count: 0,
      privacy_blocker: false,
      data_loss_blocker: false,
    }));

    expect(createUsefulnessReport(input).public_readiness).toEqual({
      ready: true,
      reason: "requirements_met",
    });

    input.independent_users[0].privacy_blocker = true;
    expect(createUsefulnessReport(input).public_readiness).toEqual({
      ready: false,
      reason: "independent_user_flow_failed",
    });
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
    minimums: { pairs: 10, task_types: 3, independent_users: 3 },
    independent_users: [],
    independent_agent_operators: [],
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
    judge: { position_consistent: true, preference },
  };
}
