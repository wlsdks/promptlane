import { describe, expect, it } from "vitest";

import { qualityEvidenceForCli } from "./quality-evidence.js";

describe("quality-evidence CLI command", () => {
  it("prints the PromptLane 9.5 quality evidence summary as JSON and text", () => {
    const json = qualityEvidenceForCli({ json: true });
    const parsed = JSON.parse(json) as {
      check: string;
      status: string;
      scorecard_axes: Array<{
        id: string;
        current_level: string;
        status: string;
      }>;
      axis_evidence_coverage: Array<{
        id: string;
        status: string;
        satisfied_evidence: string[];
        remaining_evidence: string[];
      }>;
      scorecard_review_candidates: Array<{
        id: string;
        required_review: string;
        satisfied_evidence: string[];
      }>;
      blockers: Array<{ id: string; status: string }>;
      recommended_next_slices: Array<{
        id: string;
        priority: number;
        blocked_by_external_event: boolean;
        command: string;
      }>;
    };

    expect(parsed.check).toBe("promptlane_95_quality");
    expect(parsed.status).toBe("pending");
    expect(parsed.scorecard_axes).toHaveLength(7);
    expect(parsed.scorecard_axes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "product_planning_and_positioning",
          current_level: "9.5/10",
          status: "meets_target",
        }),
        expect.objectContaining({
          id: "local_first_privacy_boundary",
          current_level: "9.5/10",
          status: "meets_target",
        }),
        expect.objectContaining({
          id: "setup_doctor_and_mcp_smoke",
          current_level: "9.5/10",
          status: "meets_target",
        }),
        expect.objectContaining({
          id: "loop_memory_and_continuation",
          current_level: "9.5/10",
          status: "meets_target",
        }),
        expect.objectContaining({
          id: "release_stability",
          current_level: "9.5/10",
          status: "meets_target",
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
          remaining_evidence: [],
        }),
        expect.objectContaining({
          id: "web_ui_and_operational_evidence",
          status: "blocked_external",
          satisfied_evidence: expect.arrayContaining([
            "web_user_flow_current_main_evidence",
            "manual_ui_patrol_artifact_evidence",
          ]),
          remaining_evidence: expect.arrayContaining([
            "scheduled_ui_patrol",
            "scorecard_level_below_9_5",
          ]),
        }),
        expect.objectContaining({
          id: "codex_and_claude_code_integration",
          status: "blocked_external",
          remaining_evidence: expect.arrayContaining([
            "native_dialog_approved_dogfood",
          ]),
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
    expect(parsed.blockers).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "scheduled_ui_patrol" }),
        expect.objectContaining({
          id: "native_dialog_approved_dogfood",
          status: "pending_operator_approval",
        }),
      ]),
    );
    expect(parsed.recommended_next_slices[0]).toMatchObject({
      id: "scheduled_ui_patrol_cron_review",
      priority: 90,
      blocked_by_external_event: true,
      command: "corepack pnpm evidence:ui-patrol",
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
    expect(json).not.toContain(process.cwd());

    const text = qualityEvidenceForCli();

    expect(text).toContain("PromptLane 9.5 quality evidence");
    expect(text).toContain("Status: pending");
    expect(text).toContain("Scorecard axes: 7");
    expect(text).toContain("Blockers: 4");
    expect(text).toContain("Axis evidence coverage");
    expect(text).toContain("product_planning_and_positioning: complete");
    expect(text).toContain("local_first_privacy_boundary: complete");
    expect(text).toContain(
      "web_ui_and_operational_evidence: blocked_external",
    );
    expect(text).toContain(
      "satisfied=web_user_flow_current_main_evidence,manual_ui_patrol_artifact_evidence",
    );
    expect(text).toContain("remaining=scheduled_ui_patrol");
    expect(text).toContain(
      "codex_and_claude_code_integration: blocked_external",
    );
    expect(text).toContain("remaining=native_dialog_approved_dogfood");
    expect(text).toContain("Scorecard review candidates");
    expect(text).toContain("- none");
    expect(text).toContain("scheduled_ui_patrol");
    expect(text).toContain("native_dialog_approved_dogfood");
    expect(text).toContain("Recommended next slices");
    expect(text).toContain("scheduled_ui_patrol_cron_review");
    expect(text).toContain("corepack pnpm evidence:ui-patrol");
    expect(text).toContain("external event: yes");
    expect(text).toContain("Privacy: local-only");
    expect(text).not.toContain(process.cwd());
  });

  it("fails closed when requireComplete is set and evidence is pending", () => {
    expect(() => qualityEvidenceForCli({ requireComplete: true })).toThrow(
      /promptlane_95_quality pending/,
    );
  });
});
