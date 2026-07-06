#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const repoRoot = resolve(new URL("..", import.meta.url).pathname);
const screenshotDir = process.env.SCREENSHOT_DIR
  ? resolve(process.env.SCREENSHOT_DIR)
  : mkdtempSync(join(tmpdir(), "promptlane-ui-patrol-"));

mkdirSync(screenshotDir, { recursive: true });

const result = spawnSync("pnpm", ["e2e:browser"], {
  cwd: repoRoot,
  env: {
    ...process.env,
    SCREENSHOT_DIR: screenshotDir,
  },
  stdio: "inherit",
});

if (result.error) {
  console.error(result.error.message);
  process.exitCode = 1;
} else {
  process.exitCode = result.status ?? 1;
}

if (process.exitCode === 0) {
  console.log(`ui patrol screenshots: ${screenshotDir}`);
}
