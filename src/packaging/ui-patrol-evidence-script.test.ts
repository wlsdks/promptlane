import {
  chmodSync,
  mkdirSync,
  mkdtempSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { delimiter, join } from "node:path";
import { spawnSync } from "node:child_process";
import { afterEach, describe, expect, it } from "vitest";

let sandbox: string | undefined;

afterEach(() => {
  if (sandbox) {
    rmSync(sandbox, { recursive: true, force: true });
    sandbox = undefined;
  }
});

describe("ui patrol evidence script", () => {
  it("distinguishes waiting for the next cron from an overdue missing schedule run", () => {
    const beforeCron = runWithFakeGh("2026-07-05T22:30:00.000Z");
    expect(beforeCron.status).toBe(0);
    expect(beforeCron.stderr).toBe("");
    const beforeParsed = JSON.parse(beforeCron.stdout) as {
      status: string;
      schedule_wait_state: string;
      last_expected_schedule_utc: string;
      next_expected_schedule_utc: string;
      next_action: string;
    };

    expect(beforeParsed.status).toBe("pending_no_schedule_run");
    expect(beforeParsed.schedule_wait_state).toBe("waiting_for_next_cron");
    expect(beforeParsed.last_expected_schedule_utc).toBe(
      "2026-06-29T06:17:00.000Z",
    );
    expect(beforeParsed.next_expected_schedule_utc).toBe(
      "2026-07-06T06:17:00.000Z",
    );
    expect(beforeParsed.next_action).toContain("Wait until");

    const afterCron = runWithFakeGh("2026-07-06T07:00:00.000Z");
    expect(afterCron.status).toBe(0);
    expect(afterCron.stderr).toBe("");
    const afterParsed = JSON.parse(afterCron.stdout) as {
      status: string;
      schedule_wait_state: string;
      last_expected_schedule_utc: string;
      next_expected_schedule_utc: string;
      next_action: string;
    };

    expect(afterParsed.status).toBe("pending_no_schedule_run");
    expect(afterParsed.schedule_wait_state).toBe("overdue_no_schedule_run");
    expect(afterParsed.last_expected_schedule_utc).toBe(
      "2026-07-06T06:17:00.000Z",
    );
    expect(afterParsed.next_expected_schedule_utc).toBe(
      "2026-07-13T06:17:00.000Z",
    );
    expect(afterParsed.next_action).toContain("Inspect the ui-patrol workflow");
  });
});

function runWithFakeGh(nowUtc: string) {
  if (sandbox) {
    rmSync(sandbox, { recursive: true, force: true });
    sandbox = undefined;
  }
  sandbox = mkdtempSync(join(tmpdir(), "promptlane-ui-patrol-evidence-"));
  const binDir = join(sandbox, "bin");
  mkdirSync(binDir);
  const fakeGh = join(binDir, "gh");
  writeFileSync(
    fakeGh,
    `#!/usr/bin/env node
const runs = [
  {
    conclusion: "success",
    createdAt: "2026-07-04T19:37:25Z",
    databaseId: 28717406758,
    event: "workflow_dispatch",
    status: "completed",
    url: "https://github.com/wlsdks/promptlane/actions/runs/28717406758"
  }
];
process.stdout.write(JSON.stringify(runs));
`,
  );
  chmodSync(fakeGh, 0o755);

  return spawnSync(process.execPath, ["scripts/ui-patrol-evidence.mjs"], {
    cwd: process.cwd(),
    encoding: "utf8",
    env: {
      ...process.env,
      PATH: `${binDir}${delimiter}${process.env.PATH ?? ""}`,
      PROMPT_COACH_UI_PATROL_NOW_UTC: nowUtc,
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
}
