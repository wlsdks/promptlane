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
        expected_artifact: "ui-patrol-screenshots",
        expected_png_count: 9,
        latest_manual_run: {
          databaseId: 28717406758,
          conclusion: "success",
        },
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
          current_level: "9.2/10",
          target_level: "9.5/10",
          status: "below_target",
        }),
        expect.objectContaining({
          id: "web_ui_and_operational_evidence",
          current_level: "8.6/10",
          status: "below_target",
        }),
      ]),
    );
    expect(parsed.blockers).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "scheduled_ui_patrol",
          status: "pending_no_schedule_run",
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
          id: "local_first_privacy_boundary",
          status: "partial",
          satisfied_evidence: expect.arrayContaining([
            "privacy_raw_free_regression_sweep",
            "local_95_evidence_sweep",
          ]),
          remaining_evidence: expect.arrayContaining([
            "scorecard_level_below_9_5",
          ]),
        }),
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
          satisfied_evidence: expect.arrayContaining([
            "codex_claude_setup_smoke_refresh",
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
      expect.arrayContaining([
        expect.objectContaining({
          id: "local_first_privacy_boundary",
          required_review: "scorecard_level_below_9_5",
          satisfied_evidence: expect.arrayContaining([
            "privacy_raw_free_regression_sweep",
            "local_95_evidence_sweep",
          ]),
        }),
        expect.objectContaining({
          id: "setup_doctor_and_mcp_smoke",
          required_review: "scorecard_level_below_9_5",
          satisfied_evidence: expect.arrayContaining([
            "local_95_evidence_sweep",
          ]),
        }),
        expect.objectContaining({
          id: "loop_memory_and_continuation",
          required_review: "scorecard_level_below_9_5",
          satisfied_evidence: expect.arrayContaining([
            "local_95_evidence_sweep",
          ]),
        }),
        expect.objectContaining({
          id: "release_stability",
          required_review: "scorecard_level_below_9_5",
          satisfied_evidence: expect.arrayContaining([
            "local_95_evidence_sweep",
          ]),
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
    expect(parsed.next_action).toContain(
      "Do not claim 9.5 completion while blockers remain pending.",
    );
    expect(parsed.recommended_next_slices[0]).toMatchObject({
      id: "scorecard_review_candidates",
      axis: "scorecard_review",
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
    expect(parsed.recommended_next_slices).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "scorecard_review_candidates",
          blocked_by_external_event: false,
        }),
        expect.objectContaining({
          id: "scheduled_ui_patrol_cron_review",
          blocked_by_external_event: true,
        }),
        expect.objectContaining({
          id: "native_dialog_operator_dogfood",
          blocked_by_external_event: true,
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
