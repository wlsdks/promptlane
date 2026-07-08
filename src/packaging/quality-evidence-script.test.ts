import { spawnSync } from "node:child_process";
import { describe, expect, it } from "vitest";

describe("quality 9.5 evidence script", () => {
  it("reports 9.5 completion when scorecard and approved native dialog evidence are complete", () => {
    const result = spawnSync(
      process.execPath,
      ["scripts/quality-95-evidence.mjs"],
      {
        cwd: process.cwd(),
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
      },
    );

    expect(result.status).toBe(0);
    expect(result.stderr).toBe("");
    const parsed = JSON.parse(result.stdout) as {
      check: string;
      status: string;
      scorecard_axes: Array<{
        id: string;
        axis: string;
        current_level: string;
        target_level: string;
        status: string;
      }>;
      blockers: Array<{
        id: string;
        status: string;
        remaining_evidence?: string[];
        next_action?: string;
      }>;
      axis_evidence_coverage: Array<{
        id: string;
        status: string;
        satisfied_evidence: string[];
        remaining_evidence: string[];
      }>;
      scorecard_review_candidates: Array<{
        id: string;
        satisfied_evidence: string[];
        required_review: string;
      }>;
      recommended_next_slices: Array<{
        id: string;
        axis: string;
        priority: number;
        blocked_by_external_event: boolean;
        command: string;
        expected_effect: string;
        preconditions?: string[];
        completion_evidence?: string[];
        guardrails?: string[];
        blocked_reason?: string;
        available_after_utc?: string;
      }>;
      next_recheck_utc?: string;
      next_action: string;
    };

    expect(parsed.check).toBe("promptlane_95_quality");
    expect(parsed.status).toBe("complete");
    expect(parsed.scorecard_axes).toHaveLength(7);
    expect(parsed.scorecard_axes).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "axis",
        }),
      ]),
    );
    expect(parsed.scorecard_axes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "product_planning_and_positioning",
          current_level: "9.5/10",
          target_level: "9.5/10",
          status: "meets_target",
        }),
        expect.objectContaining({
          id: "local_first_privacy_boundary",
          current_level: "9.5/10",
          target_level: "9.5/10",
          status: "meets_target",
        }),
        expect.objectContaining({
          id: "setup_doctor_and_mcp_smoke",
          current_level: "9.5/10",
          target_level: "9.5/10",
          status: "meets_target",
        }),
        expect.objectContaining({
          id: "loop_memory_and_continuation",
          current_level: "9.5/10",
          target_level: "9.5/10",
          status: "meets_target",
        }),
        expect.objectContaining({
          id: "web_ui_and_operational_evidence",
          current_level: "9.5/10",
          target_level: "9.5/10",
          status: "meets_target",
        }),
        expect.objectContaining({
          id: "release_stability",
          current_level: "9.5/10",
          target_level: "9.5/10",
          status: "meets_target",
        }),
      ]),
    );
    expect(parsed.scorecard_axes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "codex_and_claude_code_integration",
          current_level: "9.5/10",
          target_level: "9.5/10",
          status: "meets_target",
        }),
      ]),
    );
    expect(parsed.blockers).toHaveLength(0);
    expect(parsed.blockers).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "scorecard_axis:product_planning_and_positioning",
        }),
        expect.objectContaining({
          id: "scorecard_axis:local_first_privacy_boundary",
        }),
        expect.objectContaining({
          id: "scorecard_axis:setup_doctor_and_mcp_smoke",
        }),
        expect.objectContaining({
          id: "scorecard_axis:loop_memory_and_continuation",
        }),
        expect.objectContaining({
          id: "scorecard_axis:release_stability",
        }),
      ]),
    );
    expect(parsed.blockers).toEqual([]);
    expect(parsed.axis_evidence_coverage).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "product_planning_and_positioning",
          status: "complete",
          satisfied_evidence: expect.arrayContaining([
            "product_positioning_metadata_alignment",
          ]),
          remaining_evidence: [],
        }),
        expect.objectContaining({
          id: "local_first_privacy_boundary",
          status: "complete",
          satisfied_evidence: expect.arrayContaining([
            "privacy_raw_free_regression_sweep",
            "local_95_evidence_sweep",
          ]),
          remaining_evidence: [],
        }),
        expect.objectContaining({
          id: "web_ui_and_operational_evidence",
          status: "complete",
          satisfied_evidence: expect.arrayContaining([
            "web_user_flow_current_main_evidence",
            "manual_ui_patrol_artifact_evidence",
            "local_ui_patrol_evidence",
          ]),
          remaining_evidence: [],
        }),
        expect.objectContaining({
          id: "codex_and_claude_code_integration",
          status: "complete",
          satisfied_evidence: expect.arrayContaining([
            "codex_claude_setup_smoke_refresh",
            "codex_claude_local_integration_evidence",
            "native_dialog_preflight",
            "local_95_evidence_sweep",
          ]),
          remaining_evidence: [],
        }),
      ]),
    );
    expect(parsed.scorecard_review_candidates).toEqual([]);
    expect(parsed.scorecard_review_candidates).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "web_ui_and_operational_evidence",
        }),
        expect.objectContaining({
          id: "codex_and_claude_code_integration",
        }),
      ]),
    );
    expect(parsed.next_action).toBe(
      "Run the full release gate before claiming the long-running goal complete.",
    );
    expect(parsed.recommended_next_slices).toEqual([]);
    expect(parsed.recommended_next_slices).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "web_user_flow_current_main_evidence",
        }),
      ]),
    );
    expect(parsed.recommended_next_slices).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "privacy_raw_free_regression_sweep",
        }),
      ]),
    );
    expect(parsed.recommended_next_slices).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "codex_claude_setup_smoke_refresh",
        }),
      ]),
    );
    expect(parsed.recommended_next_slices).toEqual([]);
    expect(parsed.recommended_next_slices).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "scheduled_ui_patrol_cron_review",
        }),
      ]),
    );
    expect(parsed).not.toHaveProperty("next_recheck_utc");
    expect(result.stdout).not.toContain(process.cwd());
  });

  it("passes require-complete when 9.5 evidence is complete", () => {
    const result = spawnSync(
      process.execPath,
      ["scripts/quality-95-evidence.mjs", "--require-complete"],
      {
        cwd: process.cwd(),
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
      },
    );

    expect(result.status).toBe(0);
    const parsed = JSON.parse(result.stdout) as {
      status: string;
      blockers: Array<{ id: string }>;
    };
    expect(parsed.status).toBe("complete");
    expect(parsed.blockers).toEqual([]);
    expect(result.stderr).toBe("");
  });

  it("stays machine-parseable through the silent pnpm script invocation", () => {
    const result = spawnSync(
      "corepack",
      ["pnpm", "--silent", "evidence:quality"],
      {
        cwd: process.cwd(),
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
      },
    );

    expect(result.status).toBe(0);
    expect(result.stderr).toBe("");
    const parsed = JSON.parse(result.stdout) as {
      check: string;
      scorecard_axes: unknown[];
    };
    expect(parsed.check).toBe("promptlane_95_quality");
    expect(parsed.scorecard_axes).toHaveLength(7);
    expect(parsed.scorecard_axes).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "axis",
        }),
      ]),
    );
  });
});
