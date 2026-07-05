import { spawnSync } from "node:child_process";
import { describe, expect, it } from "vitest";

describe("quality 9.5 evidence script", () => {
  it("keeps 9.5 completion pending when native dialog evidence is missing", () => {
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
    expect(parsed.status).toBe("pending");
    expect(parsed.scorecard_axes).toHaveLength(7);
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
    expect(parsed.blockers).toHaveLength(2);
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
    expect(parsed.blockers).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "scorecard_axis:codex_and_claude_code_integration",
          status: "below_target",
          remaining_evidence: expect.arrayContaining([
            "native_dialog_approved_dogfood",
            "scorecard_level_below_9_5",
          ]),
          next_action:
            "Complete remaining evidence for Codex and Claude Code integration: native_dialog_approved_dogfood, scorecard_level_below_9_5.",
        }),
        expect.objectContaining({
          id: "native_dialog_approved_dogfood",
          status: "pending_operator_approval",
        }),
      ]),
    );
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
          status: "blocked_external",
          satisfied_evidence: expect.arrayContaining([
            "codex_claude_setup_smoke_refresh",
            "codex_claude_local_integration_evidence",
            "native_dialog_preflight",
            "local_95_evidence_sweep",
          ]),
          remaining_evidence: expect.arrayContaining([
            "native_dialog_approved_dogfood",
            "scorecard_level_below_9_5",
          ]),
        }),
      ]),
    );
    expect(parsed.scorecard_review_candidates).toEqual(
      [],
    );
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
    expect(parsed.next_action).toContain(
      "Do not claim 9.5 completion while blockers remain pending.",
    );
    expect(parsed.recommended_next_slices[0]).toMatchObject({
      id: "native_dialog_operator_dogfood",
      axis: "codex_and_claude_code_integration",
      priority: 100,
      blocked_by_external_event: true,
      command:
        "PROMPT_COACH_NATIVE_DIALOG_APPROVED=1 corepack pnpm dogfood:mcp-native-dialog-approved",
    });
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
    expect(parsed.recommended_next_slices).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "native_dialog_operator_dogfood",
          blocked_by_external_event: true,
          blocked_reason: "operator_approval_required",
          preconditions: expect.arrayContaining([
            "The operator explicitly approves opening a native OS dialog.",
          ]),
          completion_evidence: expect.arrayContaining([
            'interaction_status: "answered"',
            "approved native dialog dogfood passed",
          ]),
          guardrails: expect.arrayContaining([
            "Do not run this command in automated CI or scheduled checks.",
          ]),
        }),
      ]),
    );
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

  it("fails closed when require-complete is set and 9.5 evidence is still pending", () => {
    const result = spawnSync(
      process.execPath,
      ["scripts/quality-95-evidence.mjs", "--require-complete"],
      {
        cwd: process.cwd(),
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
      },
    );

    expect(result.status).toBe(1);
    const parsed = JSON.parse(result.stdout) as {
      status: string;
      blockers: Array<{ id: string }>;
    };
    expect(parsed.status).toBe("pending");
    expect(parsed.blockers.length).toBeGreaterThan(0);
    expect(result.stderr).toContain("promptlane_95_quality pending");
    expect(result.stderr).toContain("--require-complete");
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
  });
});
