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
      blockers: Array<{
        id: string;
        status: string;
        remaining_evidence?: string[];
        next_action?: string;
      }>;
      recommended_next_slices: Array<{
        id: string;
        priority: number;
        blocked_by_external_event: boolean;
        command: string;
        preconditions?: string[];
        completion_evidence?: string[];
        guardrails?: string[];
        blocked_reason?: string;
        available_after_utc?: string;
      }>;
      evidence: {
        native_dialog_approved_dogfood: {
          status: string;
          approval_status: string;
          approved_run_required: boolean;
          preconditions: string[];
        };
      };
      release_gate: Array<{
        command: string;
        purpose: string;
      }>;
      next_recheck_utc?: string;
    };

    expect(parsed.check).toBe("promptlane_95_quality");
    expect(parsed.status).toBe("complete");
    expect(parsed).not.toHaveProperty("next_recheck_utc");
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
    expect(parsed.blockers).toEqual([]);
    expect(parsed.blockers).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "scheduled_ui_patrol" }),
        expect.objectContaining({
          id: "scorecard_axis:web_ui_and_operational_evidence",
        }),
      ]),
    );
    expect(parsed.evidence.native_dialog_approved_dogfood).toMatchObject({
      status: "complete",
      approval_status: "operator_approved_answer_recorded",
      approved_run_required: true,
      preconditions: [],
    });
    expect(parsed.recommended_next_slices).toEqual([]);
    expect(parsed.release_gate).toEqual([
      {
        command: "corepack pnpm test",
        purpose: "Run the full unit and integration test suite.",
      },
      {
        command: "corepack pnpm lint",
        purpose: "Check static lint rules.",
      },
      {
        command: "corepack pnpm build",
        purpose: "Build CLI, server, web, and packaged runtime assets.",
      },
      {
        command: "corepack pnpm pack:dry-run",
        purpose: "Verify the npm package contents and lifecycle wrapper.",
      },
      {
        command: "corepack pnpm evidence:quality -- --require-complete",
        purpose: "Fail closed unless all 9.5 quality evidence remains complete.",
      },
      {
        command: "git diff --check",
        purpose: "Reject whitespace and patch hygiene regressions.",
      },
    ]);
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
    expect(text).toContain("Status: complete");
    expect(text).not.toContain("Next recheck UTC:");
    expect(text).toContain("Scorecard axes: 7");
    expect(text).toContain("Blockers: 0");
    expect(text).toContain("Blockers");
    expect(text).toContain("- none");
    expect(parsed.blockers).toEqual([]);
    expect(text).not.toContain(
      "- scorecard_axis:codex_and_claude_code_integration: below_target",
    );
    expect(text).not.toContain(
      "remaining_evidence=native_dialog_approved_dogfood,scorecard_level_below_9_5",
    );
    expect(text).not.toContain(
      "- scorecard_axis:web_ui_and_operational_evidence: below_target",
    );
    expect(text).not.toContain("scheduled_ui_patrol");
    expect(text).toContain("- native_dialog_approved_dogfood: complete");
    expect(text).toContain("Axis evidence coverage");
    expect(text).toContain("product_planning_and_positioning: complete");
    expect(text).toContain("local_first_privacy_boundary: complete");
    expect(text).toContain("web_ui_and_operational_evidence: complete");
    expect(text).toContain(
      "satisfied=web_user_flow_current_main_evidence,manual_ui_patrol_artifact_evidence,local_ui_patrol_evidence",
    );
    expect(text).toContain("remaining=none");
    expect(text).toContain(
      "codex_and_claude_code_integration: complete",
    );
    expect(text).toContain(
      "satisfied=codex_claude_setup_smoke_refresh,codex_claude_local_integration_evidence,native_dialog_preflight,local_95_evidence_sweep",
    );
    expect(text).toContain("remaining=none");
    expect(text).toContain("Scorecard review candidates");
    expect(text).toContain("- none");
    expect(text).toContain("External evidence status");
    expect(text).toContain(
      "native_dialog_approved_dogfood: complete approved_run_required=yes",
    );
    expect(text).toContain("approval_status=operator_approved_answer_recorded");
    expect(text).not.toContain(
      "preconditions=The operator explicitly approves opening a native OS dialog.",
    );
    expect(text).toContain("native_dialog_approved_dogfood");
    expect(text).toContain("Recommended next slices");
    expect(text).toContain("- none");
    expect(text).toContain("Release gate");
    expect(text).toContain(
      "- corepack pnpm test - Run the full unit and integration test suite.",
    );
    expect(text).toContain(
      "- corepack pnpm evidence:quality -- --require-complete - Fail closed unless all 9.5 quality evidence remains complete.",
    );
    expect(text).toContain(
      "- git diff --check - Reject whitespace and patch hygiene regressions.",
    );
    expect(text).not.toContain("external event: yes");
    expect(text).not.toContain("blocked_reason=operator_approval_required");
    expect(text).toContain("Privacy: local-only");
    expect(text).not.toContain(process.cwd());
  });

  it("does not fail closed when requireComplete is set and evidence is complete", () => {
    expect(() => qualityEvidenceForCli({ requireComplete: true })).not.toThrow();
  });

  it("prints a focused operator brief for the approval-gated native dialog dogfood", () => {
    const brief = qualityEvidenceForCli({ operatorBrief: true });

    expect(brief).toContain("PromptLane native dialog operator brief");
    expect(brief).toContain("Status: complete");
    expect(brief).toContain("approval_status=operator_approved_answer_recorded");
    expect(brief).not.toContain(
      "Command: PROMPTLANE_NATIVE_DIALOG_APPROVED=1 corepack pnpm dogfood:mcp-native-dialog-approved",
    );
    expect(brief).toContain(
      "Refusal preflight: corepack pnpm dogfood:mcp-native-dialog-refusal",
    );
    expect(brief).toContain(
      "Expected refusal: command refuses before opening a native dialog unless PROMPTLANE_NATIVE_DIALOG_APPROVED=1 is set.",
    );
    expect(brief).not.toContain(
      "Preconditions: The operator explicitly approves opening a native OS dialog.",
    );
    expect(brief).not.toContain(
      'Completion evidence: interaction_status: "answered"; approved native dialog dogfood passed',
    );
    expect(brief).not.toContain(
      "Guardrails: Do not run this command in automated CI or scheduled checks.",
    );
    expect(brief).toContain(
      "Result boundary: This brief does not run the native dialog dogfood.",
    );
    expect(brief).not.toContain(process.cwd());
  });
});
