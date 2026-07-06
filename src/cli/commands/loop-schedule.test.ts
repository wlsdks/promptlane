import { mkdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { afterEach, describe, expect, it } from "vitest";

import {
  installLoopSchedule,
  loopScheduleStatus,
  uninstallLoopSchedule,
} from "./loop-schedule.js";

const tempDirs: string[] = [];

afterEach(() => {
  while (tempDirs.length > 0) {
    const dir = tempDirs.pop();
    if (dir) rmSync(dir, { recursive: true, force: true });
  }
});

describe("installLoopSchedule", () => {
  it("dry-runs an explicit LaunchAgent for service-source loop collection without writing", () => {
    const dir = createTempDir();
    const plistPath = join(dir, "LaunchAgents", "com.promptlane.loop.plist");
    const dataDir = join(dir, "data");
    const cwdPrefix = "/Users/example/private-project";

    const result = installLoopSchedule({
      dataDir,
      cwdPrefix,
      intervalSeconds: 600,
      platform: "darwin",
      plistPath,
      dryRun: true,
    });

    expect(result.supported).toBe(true);
    expect(result.changed).toBe(true);
    expect(result.dryRun).toBe(true);
    expect(() => readFileSync(plistPath, "utf8")).toThrow();
    expect(result.nextPlist).toContain("com.promptlane.loop");
    expect(result.nextPlist).toContain("<integer>600</integer>");
    expect(result.nextPlist).toContain("<string>loop</string>");
    expect(result.nextPlist).toContain("<string>collect</string>");
    expect(result.nextPlist).toContain("<string>--source</string>");
    expect(result.nextPlist).toContain("<string>service</string>");
    expect(result.nextPlist).toContain("<string>--data-dir</string>");
    expect(result.nextPlist).toContain(`<string>${dataDir}</string>`);
    expect(result.nextPlist).toContain("<key>WorkingDirectory</key>");
    expect(result.nextPlist).toContain(
      "<string>/Users/example/private-project</string>",
    );
    expect(result.nextPlist).not.toContain("Make this better");
  });

  it("writes the LaunchAgent only when explicitly not dry-run", () => {
    const dir = createTempDir();
    const plistPath = join(dir, "LaunchAgents", "com.promptlane.loop.plist");

    const result = installLoopSchedule({
      cwdPrefix: "/Users/example/private-project",
      intervalSeconds: 300,
      platform: "darwin",
      plistPath,
    });
    const plist = readFileSync(plistPath, "utf8");

    expect(result.supported).toBe(true);
    expect(result.changed).toBe(true);
    expect(result.dryRun).toBe(false);
    expect(result.started).toBe(false);
    expect(plist).toContain("com.promptlane.loop");
    expect(plist).toContain("<key>StartInterval</key>");
    expect(plist).toContain("<key>WorkingDirectory</key>");
    expect(plist).toContain("<string>--source</string>");
    expect(plist).toContain("<string>service</string>");
  });

  it("reports unsupported platforms without writing", () => {
    const dir = createTempDir();
    const plistPath = join(dir, "loop.plist");

    const result = installLoopSchedule({
      cwdPrefix: "/Users/example/private-project",
      platform: "linux",
      plistPath,
    });

    expect(result.supported).toBe(false);
    expect(result.changed).toBe(false);
    expect(() => readFileSync(plistPath, "utf8")).toThrow();
  });
});

describe("loopScheduleStatus", () => {
  it("reports a missing macOS LaunchAgent as not installed", () => {
    const dir = createTempDir();
    const plistPath = join(dir, "LaunchAgents", "com.promptlane.loop.plist");

    const result = loopScheduleStatus({
      platform: "darwin",
      plistPath,
    });

    expect(result.supported).toBe(true);
    expect(result.installed).toBe(false);
    expect(result.plistPath).toBe(plistPath);
  });

  it("reports an existing macOS LaunchAgent as installed", () => {
    const dir = createTempDir();
    const plistPath = join(dir, "LaunchAgents", "com.promptlane.loop.plist");
    installLoopSchedule({
      cwdPrefix: "/Users/example/private-project",
      platform: "darwin",
      plistPath,
    });

    const result = loopScheduleStatus({
      platform: "darwin",
      plistPath,
    });

    expect(result.supported).toBe(true);
    expect(result.installed).toBe(true);
    expect(result.plistPath).toBe(plistPath);
  });

  it("reports unsupported status checks without touching files", () => {
    const dir = createTempDir();
    const plistPath = join(dir, "loop.plist");

    const result = loopScheduleStatus({
      platform: "linux",
      plistPath,
    });

    expect(result.supported).toBe(false);
    expect(result.installed).toBe(false);
    expect(result.plistPath).toBe(plistPath);
  });
});

describe("uninstallLoopSchedule", () => {
  it("removes an explicit macOS LaunchAgent plist", () => {
    const dir = createTempDir();
    const plistPath = join(dir, "LaunchAgents", "com.promptlane.loop.plist");
    installLoopSchedule({
      cwdPrefix: "/Users/example/private-project",
      platform: "darwin",
      plistPath,
    });

    const result = uninstallLoopSchedule({
      platform: "darwin",
      plistPath,
    });

    expect(result.supported).toBe(true);
    expect(result.changed).toBe(true);
    expect(result.removed).toBe(true);
    expect(result.plistPath).toBe(plistPath);
    expect(() => readFileSync(plistPath, "utf8")).toThrow();
  });

  it("is idempotent when the macOS LaunchAgent plist is already absent", () => {
    const dir = createTempDir();
    const plistPath = join(dir, "LaunchAgents", "com.promptlane.loop.plist");

    const result = uninstallLoopSchedule({
      platform: "darwin",
      plistPath,
    });

    expect(result.supported).toBe(true);
    expect(result.changed).toBe(false);
    expect(result.removed).toBe(false);
    expect(result.plistPath).toBe(plistPath);
  });

  it("reports unsupported uninstalls without deleting files", () => {
    const dir = createTempDir();
    const plistPath = join(dir, "loop.plist");

    const result = uninstallLoopSchedule({
      platform: "linux",
      plistPath,
    });

    expect(result.supported).toBe(false);
    expect(result.changed).toBe(false);
    expect(result.removed).toBe(false);
    expect(result.plistPath).toBe(plistPath);
  });
});

function createTempDir(): string {
  const dir = join(tmpdir(), `promptlane-loop-schedule-${randomUUID()}`);
  mkdirSync(dir, { recursive: true });
  tempDirs.push(dir);
  return dir;
}
