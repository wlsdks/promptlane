import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
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
      coverage: {
        required_pairs_per_task_type: 2,
        task_types_meeting_pair_minimum: 0,
        all_task_types_meet_pair_minimum: false,
      },
      baseline: {
        success_rate: 0.666667,
        mean_actionability: 0.6,
        mean_tool_calls: 4,
        mean_input_tokens: 1_000,
        mean_cached_input_tokens: 600,
        mean_time_to_first_value_ms: 8_000,
        friction_free_rate: 0.333333,
        privacy_blocker_count: 0,
        data_loss_blocker_count: 0,
        install_blocker_count: 0,
      },
      looprelay: {
        success_rate: 1,
        mean_actionability: 0.8,
        mean_tool_calls: 5,
        mean_input_tokens: 1_500,
        mean_cached_input_tokens: 900,
        mean_time_to_first_value_ms: 9_000,
        friction_free_rate: 0.666667,
      },
      transitions: { improved: 1, regressed: 0, unchanged_passed: 2 },
      measurement_coverage: {
        cached_input_tokens: 1,
        time_to_first_value_ms: 1,
        continuation_accuracy: 1,
        failure_prevention_accuracy: 1,
        clarification_accuracy: 1,
        blocker_flags: 1,
      },
      preference: { baseline: 0, looprelay: 2, tie: 1 },
      bias: { position_consistency: 1, human_review_agreement: 1 },
      by_task_type: {
        implementation_continuation: {
          pair_count: 1,
          baseline_success_rate: 0,
          looprelay_success_rate: 1,
          success_rate_delta: 1,
          transitions: {
            improved: 1,
            regressed: 0,
            unchanged_passed: 0,
            unchanged_failed: 0,
          },
          delta: {
            mean_elapsed_ms: 2_000,
            mean_tool_calls: 1,
            mean_input_tokens: 500,
            mean_cached_input_tokens: 300,
            mean_time_to_first_value_ms: 1_000,
            friction_free_rate: 1,
          },
          decision: {
            action: "collect_more",
            evidence_status: "underpowered",
          },
          uncertainty: {
            method: "paired_difference_hoeffding_95",
            lower: -1,
            upper: 1,
          },
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
    expect(svg).toContain("COLLECT MORE");
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
    expect(markdown).toContain("Conservative 95% bound");
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
    expect(() =>
      createUsefulnessReport({
        ...ledger(),
        note: "baseline-preferred-for-broader-risk-evidence",
      }),
    ).not.toThrow();
  });

  it("accepts all long-horizon task types and requires per-type coverage", () => {
    const input = ledger();
    input.minimums = {
      pairs: 5,
      task_types: 5,
      pairs_per_task_type: 1,
      independent_users: 3,
    };
    input.pairs.push(
      pair(
        "release_verification_continuity",
        "looprelay_first",
        true,
        true,
        0.8,
        0.8,
        0,
        0,
      ),
      pair(
        "ambiguity_clarification",
        "baseline_first",
        false,
        true,
        0.4,
        0.8,
        1,
        0,
      ),
    );

    const report = createUsefulnessReport(input);

    expect(report.status).toBe("directional_evidence_ready");
    expect(report.coverage).toEqual({
      required_pairs_per_task_type: 1,
      task_types_meeting_pair_minimum: 5,
      all_task_types_meet_pair_minimum: true,
    });
    expect(report.by_task_type.ambiguity_clarification.decision).toMatchObject({
      action: "retain",
      evidence_status: "directional",
    });
    expect(renderReadmeResultBlock(report, "en")).toContain(
      "All 5 target task types meet the per-type minimum",
    );
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

  it("rejects duplicate independent-user labels", () => {
    const input = ledger();
    const participant = {
      id: "participant-ab12",
      independence_confirmed: true,
      install_success: true,
      first_value_success: true,
      install_elapsed_ms: 10_000,
      time_to_first_value_ms: 20_000,
      recovery_count: 0,
      friction_count: 0,
      privacy_blocker: false,
      data_loss_blocker: false,
    };
    input.independent_users = [participant, { ...participant }];

    expect(() => createUsefulnessReport(input)).toThrow(
      "independent user ids must be unique",
    );
  });

  it("does not treat an unrun pairwise judge as human disagreement", () => {
    const input = ledger();
    input.pairs[0].judge = { position_consistent: null };

    expect(createUsefulnessReport(input).bias.human_review_agreement).toBe(1);
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

  it("regenerates real-task artifacts without changing README files", () => {
    const dir = mkdtempSync(join(tmpdir(), "looprelay-real-task-report-"));
    tempDirs.push(dir);
    const ledgerPath = join(dir, "ledger.json");
    const svgPath = join(dir, "result.svg");
    const summaryPath = join(dir, "summary.json");
    const readmePath = join(dir, "README.md");
    const readmeKoPath = join(dir, "README.ko.md");
    const readme =
      "before\n<!-- USEFULNESS_RESULTS_START -->\nold\n<!-- USEFULNESS_RESULTS_END -->\nafter\n";
    writeFileSync(ledgerPath, JSON.stringify(ledger()), "utf8");
    writeFileSync(readmePath, readme, "utf8");
    writeFileSync(readmeKoPath, readme, "utf8");

    const args = [
      join(process.cwd(), "scripts/usefulness-report.mjs"),
      ledgerPath,
      svgPath,
      summaryPath,
      "--skip-readme",
    ];
    expect(spawnSync(process.execPath, args, { cwd: dir }).status).toBe(0);
    const firstSvg = readFileSync(svgPath, "utf8");
    const firstSummary = readFileSync(summaryPath, "utf8");
    expect(spawnSync(process.execPath, args, { cwd: dir }).status).toBe(0);

    expect(readFileSync(svgPath, "utf8")).toBe(firstSvg);
    expect(readFileSync(summaryPath, "utf8")).toBe(firstSummary);
    expect(readFileSync(readmePath, "utf8")).toBe(readme);
    expect(readFileSync(readmeKoPath, "utf8")).toBe(readme);

    expect(
      spawnSync(process.execPath, args.slice(0, -1), { cwd: dir }).status,
    ).toBe(0);
    expect(readFileSync(readmePath, "utf8")).not.toBe(readme);
    expect(readFileSync(readmeKoPath, "utf8")).not.toBe(readme);
  });

  it("exposes one exact real-task evidence package command", () => {
    const packageJson = JSON.parse(
      readFileSync(join(process.cwd(), "package.json"), "utf8"),
    ) as { scripts: Record<string, string> };

    expect(packageJson.scripts["evidence:real-task"]).toBe(
      "node scripts/usefulness-report.mjs reports/usefulness-real-task-pairs.json docs/assets/usefulness-real-task-results.svg reports/usefulness-real-task-summary.json --skip-readme",
    );
  });
});

function ledger() {
  return {
    version: 1,
    design: "matched_observational",
    causal_claim: false,
    minimums: {
      pairs: 10,
      task_types: 3,
      pairs_per_task_type: 2,
      independent_users: 3,
    },
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
      cached_input_tokens: 600,
      output_tokens: 100,
      time_to_first_value_ms: 8_000,
      continuation_accuracy: 1,
      failure_prevention_accuracy: 1,
      clarification_accuracy: 1,
      friction_count: baselineFriction,
      privacy_blocker: false,
      data_loss_blocker: false,
      install_blocker: false,
    },
    looprelay: {
      passed: looprelayPassed,
      actionability: looprelayActionability,
      elapsed_ms: 12_000,
      tool_calls: 5,
      input_tokens: 1_500,
      cached_input_tokens: 900,
      output_tokens: 120,
      time_to_first_value_ms: 9_000,
      continuation_accuracy: 1,
      failure_prevention_accuracy: 1,
      clarification_accuracy: 1,
      friction_count: looprelayFriction,
      privacy_blocker: false,
      data_loss_blocker: false,
      install_blocker: false,
      adopted: true,
    },
    human_preference: preference,
    judge: { position_consistent: true, preference },
  };
}

describe("real-task usefulness ledger", () => {
  it("retains the first strict outcome without prompt bodies or private paths", () => {
    const source = readFileSync(
      join(process.cwd(), "reports/usefulness-real-task-pairs.json"),
      "utf8",
    );
    const ledger = JSON.parse(source) as {
      causal_claim: boolean;
      pairs: Array<{
        baseline: { passed: boolean; core_task_recovered: boolean };
        looprelay: { passed: boolean; core_task_recovered: boolean };
      }>;
    };

    expect(ledger.causal_claim).toBe(false);
    expect(ledger.pairs).toHaveLength(8);
    expect(ledger.pairs[0]).toMatchObject({
      baseline: { passed: false, core_task_recovered: false },
      looprelay: { passed: false, core_task_recovered: true },
    });
    expect(ledger.pairs[1]).toMatchObject({
      baseline: { passed: false, core_task_recovered: false },
      looprelay: { passed: true, core_task_recovered: true },
    });
    expect(ledger.pairs[2]).toMatchObject({
      baseline: {
        passed: false,
        core_task_recovered: false,
        concept_score: 0,
      },
      looprelay: {
        passed: false,
        core_task_recovered: true,
        concept_score: 4,
      },
    });
    expect(ledger.pairs[3]).toMatchObject({
      baseline: {
        passed: false,
        core_task_recovered: false,
        clarification_accuracy: 0.5,
      },
      looprelay: {
        passed: true,
        core_task_recovered: true,
        clarification_accuracy: 1,
      },
    });
    expect(ledger.pairs[4]).toMatchObject({
      baseline: { passed: false, core_task_recovered: false },
      looprelay: { passed: false, core_task_recovered: false },
      judge: { position_consistent: true, preference: "tie" },
    });
    expect(ledger.pairs[5]).toMatchObject({
      baseline: { passed: false, core_task_recovered: false },
      looprelay: { passed: false, core_task_recovered: true },
      judge: { position_consistent: true, preference: "looprelay" },
    });
    expect(ledger.pairs[6]).toMatchObject({
      baseline: {
        passed: false,
        core_task_recovered: false,
        implementation_plan_score: 7,
      },
      looprelay: {
        passed: true,
        core_task_recovered: true,
        implementation_plan_score: 12,
        implementation_plan_score_max: 14,
      },
    });
    expect(ledger.pairs[7]).toMatchObject({
      baseline: {
        passed: false,
        core_task_recovered: true,
        failure_prevention_score: 7,
      },
      looprelay: {
        passed: false,
        core_task_recovered: true,
        failure_prevention_score: 6,
        failure_prevention_score_max: 6.5,
      },
      human_preference: "baseline",
    });
    expect(createUsefulnessReport(JSON.parse(source))).toMatchObject({
      status: "insufficient_data",
      pair_count: 8,
      task_type_count: 5,
      baseline: { success_rate: 0 },
      looprelay: { success_rate: 0.375 },
      transitions: { improved: 3, unchanged_failed: 5 },
    });
    const svg = readFileSync(
      join(process.cwd(), "docs/assets/usefulness-real-task-results.svg"),
      "utf8",
    );
    expect(svg).toContain("8 matched pairs · 5 task types");
    expect(svg).toContain("INSUFFICIENT DATA");
    expect(source).not.toMatch(/\/Users\/|\/home\//);
    expect(source).not.toMatch(/"(?:prompt|response|transcript|output)"\s*:/i);
  });
});
