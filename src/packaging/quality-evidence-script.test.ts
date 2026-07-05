import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { afterEach, describe, expect, it } from "vitest";

let sandbox: string | undefined;

afterEach(() => {
  if (sandbox) {
    rmSync(sandbox, { recursive: true, force: true });
    sandbox = undefined;
  }
});

describe("quality 9.5 evidence script", () => {
  it("keeps 9.5 completion pending when scheduled UI patrol and native dialog evidence are missing", () => {
    sandbox = mkdtempSync(join(tmpdir(), "promptlane-quality-evidence-"));
    const uiPatrolPath = join(sandbox, "ui-patrol.json");
    writeFileSync(
      uiPatrolPath,
      JSON.stringify({
        check: "scheduled_ui_patrol",
        status: "pending_no_schedule_run",
        schedule_wait_state: "waiting_for_next_cron",
        last_expected_schedule_utc: "2026-06-29T06:17:00.000Z",
        next_expected_schedule_utc: "2026-07-06T06:17:00.000Z",
        expected_artifact: "ui-patrol-screenshots",
        expected_png_count: 9,
        latest_manual_run: {
          databaseId: 28717406758,
          conclusion: "success",
        },
        next_action:
          "Wait until 2026-07-06T06:17:00.000Z, then rerun corepack pnpm evidence:ui-patrol.",
      }),
    );

    const result = spawnSync(
      process.execPath,
      [
        "scripts/quality-95-evidence.mjs",
        "--ui-patrol-json",
        uiPatrolPath,
      ],
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
      blockers: Array<{ id: string; status: string }>;
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
      }>;
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
          current_level: "8.6/10",
          status: "below_target",
        }),
        expect.objectContaining({
          id: "release_stability",
          current_level: "9.5/10",
          target_level: "9.5/10",
          status: "meets_target",
        }),
      ]),
    );
    expect(parsed.blockers).toHaveLength(4);
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
        }),
        expect.objectContaining({
          id: "scorecard_axis:web_ui_and_operational_evidence",
          status: "below_target",
        }),
        expect.objectContaining({
          id: "scheduled_ui_patrol",
          status: "pending_no_schedule_run",
          next_action:
            "Wait until 2026-07-06T06:17:00.000Z, then rerun corepack pnpm evidence:ui-patrol.",
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
          status: "blocked_external",
          satisfied_evidence: expect.arrayContaining([
            "web_user_flow_current_main_evidence",
            "manual_ui_patrol_artifact_evidence",
            "scheduled_ui_patrol_preflight",
          ]),
          remaining_evidence: expect.arrayContaining([
            "scheduled_ui_patrol",
            "scorecard_level_below_9_5",
          ]),
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
      id: "scheduled_ui_patrol_cron_review",
      axis: "web_ui_and_operational_evidence",
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
    expect(parsed.recommended_next_slices).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "scheduled_ui_patrol_cron_review",
          blocked_by_external_event: true,
          preconditions: expect.arrayContaining([
            "A real GitHub Actions schedule event exists for ui-patrol.yml.",
          ]),
          completion_evidence: expect.arrayContaining([
            "scheduled_ui_patrol status is complete",
            "ui-patrol-screenshots artifact contains 9 png files",
          ]),
          guardrails: expect.arrayContaining([
            "Do not treat workflow_dispatch evidence as scheduled evidence.",
          ]),
        }),
        expect.objectContaining({
          id: "native_dialog_operator_dogfood",
          blocked_by_external_event: true,
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
    expect(result.stdout).not.toContain(process.cwd());
  });

  it("fails closed when require-complete is set and 9.5 evidence is still pending", () => {
    sandbox = mkdtempSync(join(tmpdir(), "promptlane-quality-evidence-"));
    const uiPatrolPath = join(sandbox, "ui-patrol.json");
    writeFileSync(
      uiPatrolPath,
      JSON.stringify({
        check: "scheduled_ui_patrol",
        status: "pending_no_schedule_run",
        expected_artifact: "ui-patrol-screenshots",
        expected_png_count: 9,
      }),
    );

    const result = spawnSync(
      process.execPath,
      [
        "scripts/quality-95-evidence.mjs",
        "--ui-patrol-json",
        uiPatrolPath,
        "--require-complete",
      ],
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
