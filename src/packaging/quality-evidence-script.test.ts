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
    expect(parsed.next_action).toContain(
      "Do not claim 9.5 completion while blockers remain pending.",
    );
    expect(result.stdout).not.toContain(process.cwd());
  });
});
