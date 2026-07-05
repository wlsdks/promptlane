import { describe, expect, it } from "vitest";

import { qualityEvidenceForCli } from "./quality-evidence.js";

describe("quality-evidence CLI command", () => {
  it("prints the PromptLane 9.5 quality evidence summary as JSON and text", () => {
    const json = qualityEvidenceForCli({ json: true });
    const parsed = JSON.parse(json) as {
      check: string;
      status: string;
      scorecard_axes: Array<{ id: string; status: string }>;
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
    expect(parsed.axis_evidence_coverage).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "web_ui_and_operational_evidence",
          status: "blocked_external",
          satisfied_evidence: expect.arrayContaining([
            "web_user_flow_current_main_evidence",
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
    expect(parsed.scorecard_review_candidates).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "local_first_privacy_boundary",
          required_review: "scorecard_level_below_9_5",
        }),
        expect.objectContaining({
          id: "release_stability",
          required_review: "scorecard_level_below_9_5",
        }),
      ]),
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
      id: "scorecard_review_candidates",
      priority: 10,
      blocked_by_external_event: false,
      command: "prompt-coach quality-evidence --json",
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
    expect(text).toContain("Blockers: 9");
    expect(text).toContain("Axis evidence coverage");
    expect(text).toContain(
      "web_ui_and_operational_evidence: blocked_external",
    );
    expect(text).toContain("satisfied=web_user_flow_current_main_evidence");
    expect(text).toContain("remaining=scheduled_ui_patrol");
    expect(text).toContain(
      "codex_and_claude_code_integration: blocked_external",
    );
    expect(text).toContain("remaining=native_dialog_approved_dogfood");
    expect(text).toContain("Scorecard review candidates");
    expect(text).toContain(
      "local_first_privacy_boundary: review=scorecard_level_below_9_5",
    );
    expect(text).toContain(
      "release_stability: review=scorecard_level_below_9_5",
    );
    expect(text).toContain("scheduled_ui_patrol");
    expect(text).toContain("native_dialog_approved_dogfood");
    expect(text).toContain("Recommended next slices");
    expect(text).toContain("scorecard_review_candidates");
    expect(text).toContain("prompt-coach quality-evidence --json");
    expect(text).toContain("external event: no");
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
