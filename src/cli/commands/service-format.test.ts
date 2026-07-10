import { describe, expect, it } from "vitest";

import {
  classifyLaunchctlError,
  explainLaunchctlError,
  formatServiceCommandPlain,
  formatServiceCommandJson,
  formatServiceInstallPlain,
  formatServiceInstallJson,
} from "./service-format.js";

describe("classifyLaunchctlError", () => {
  it("maps Bootstrap failed: 5 to already_loaded", () => {
    expect(
      classifyLaunchctlError("Bootstrap failed: 5: Input/output error"),
    ).toBe("already_loaded");
    expect(classifyLaunchctlError("service already bootstrapped")).toBe(
      "already_loaded",
    );
  });

  it("maps not-found stderr to not_loaded", () => {
    expect(
      classifyLaunchctlError(
        "Could not find specified service: gui/501/com.promptlane.server",
      ),
    ).toBe("not_loaded");
    expect(classifyLaunchctlError("service not loaded")).toBe("not_loaded");
    expect(
      classifyLaunchctlError(
        'Bad request.\nCould not find service "com.promptlane.server" in domain for user gui: 501',
      ),
    ).toBe("not_loaded");
    expect(
      classifyLaunchctlError("Bootout failed: 36: Operation now in progress"),
    ).toBe("not_loaded");
  });

  it("maps permission errors to denied", () => {
    expect(
      classifyLaunchctlError("Bootstrap failed: 1: Operation not permitted"),
    ).toBe("denied");
    expect(
      classifyLaunchctlError("Load failed: 5: Operation not permitted"),
    ).toBe("denied");
  });

  it("maps the explicit unsupported_platform sentinel", () => {
    expect(classifyLaunchctlError("unsupported_platform")).toBe(
      "unsupported_platform",
    );
  });

  it("falls back to unknown for unrecognized stderr", () => {
    expect(classifyLaunchctlError(undefined)).toBe("unknown");
    expect(classifyLaunchctlError("")).toBe("unknown");
    expect(classifyLaunchctlError("totally novel launchctl complaint")).toBe(
      "unknown",
    );
  });
});

describe("explainLaunchctlError", () => {
  it("returns a next-step hint per code", () => {
    expect(explainLaunchctlError("already_loaded")).toMatch(/already loaded/i);
    expect(explainLaunchctlError("already_loaded")).toMatch(
      /promptlane service stop/,
    );
    expect(explainLaunchctlError("not_loaded")).toMatch(
      /promptlane service install/,
    );
    expect(explainLaunchctlError("denied")).toMatch(/Full Disk Access/);
    expect(explainLaunchctlError("unsupported_platform")).toMatch(/macOS/);
    expect(explainLaunchctlError("unknown")).toMatch(/launchctl/);
  });
});

describe("formatServiceCommandPlain", () => {
  it("renders an ok start as a single confirmation line", () => {
    const text = formatServiceCommandPlain("start", {
      ok: true,
      supported: true,
    });
    expect(text).toBe("service started");
  });

  it("renders a friendly hint for already_loaded errors and does not echo the raw stderr", () => {
    const text = formatServiceCommandPlain("start", {
      ok: false,
      supported: true,
      error: "Bootstrap failed: 5: Input/output error",
    });
    expect(text).toMatch(/already loaded/i);
    expect(text).toMatch(/promptlane service stop/);
    expect(text).not.toContain("Bootstrap failed: 5");
  });

  it("keeps unknown launchctl stderr out of plain output", () => {
    const text = formatServiceCommandPlain("status", {
      ok: false,
      supported: true,
      error:
        "totally novel launchctl complaint /Users/private/service.plist sk-private123456",
    });
    expect(text).toMatch(/unexpected error/);
    expect(text).not.toContain("totally novel");
    expect(text).not.toContain("/Users/private");
    expect(text).not.toContain("sk-private");
  });

  it("renders unsupported_platform without leaking the sentinel", () => {
    const text = formatServiceCommandPlain("status", {
      ok: false,
      supported: false,
      error: "unsupported_platform",
    });
    expect(text).not.toContain("unsupported_platform");
    expect(text).toMatch(/macOS/);
  });
});

describe("formatServiceCommandJson", () => {
  it("returns a safe error contract for a known launchctl failure", () => {
    const json = formatServiceCommandJson({
      ok: false,
      supported: true,
      error:
        'Bad request.\nCould not find service "com.promptlane.server" in domain for user gui: 501',
    });
    const parsed = JSON.parse(json);
    expect(parsed.ok).toBe(false);
    expect(parsed.supported).toBe(true);
    expect(parsed.error).toBe(
      "Service is not loaded. Run `promptlane service install` first.",
    );
    expect(parsed.error_code).toBe("not_loaded");
    expect(parsed.error_hint).toMatch(/promptlane service install/);
    expect(json).not.toContain("gui: 501");
  });

  it("keeps unknown launchctl stderr out of JSON output", () => {
    const json = formatServiceCommandJson({
      ok: false,
      supported: true,
      error:
        "novel failure /Users/private/LaunchAgents/service.plist npm_private123456",
    });

    expect(json).not.toContain("novel failure");
    expect(json).not.toContain("/Users/private");
    expect(json).not.toContain("npm_private");
    expect(JSON.parse(json)).toMatchObject({
      error_code: "unknown",
      error: "launchctl reported an unexpected error.",
    });
  });

  it("omits error fields when ok is true", () => {
    const json = formatServiceCommandJson({ ok: true, supported: true });
    const parsed = JSON.parse(json);
    expect(parsed.ok).toBe(true);
    expect(parsed.error).toBeUndefined();
    expect(parsed.error_code).toBeUndefined();
    expect(parsed.error_hint).toBeUndefined();
  });
});

describe("formatServiceInstallPlain / Json", () => {
  it("plain summary lists what changed and which plist was written", () => {
    const text = formatServiceInstallPlain({
      supported: true,
      changed: true,
      dryRun: false,
      plistPath: "/Users/me/Library/LaunchAgents/com.promptlane.server.plist",
      backupPath: undefined,
      started: true,
    });
    expect(text).toMatch(/installed/);
    expect(text).toContain(
      "/Users/me/Library/LaunchAgents/com.promptlane.server.plist",
    );
    expect(text).toMatch(/started/);
  });

  it("plain summary surfaces start failures with the friendly hint", () => {
    const text = formatServiceInstallPlain({
      supported: true,
      changed: true,
      dryRun: false,
      plistPath: "/tmp/p.plist",
      started: false,
      startError: "Bootstrap failed: 1: Operation not permitted",
    });
    expect(text).toMatch(/Full Disk Access/);
    expect(text).not.toContain("Bootstrap failed: 1");
  });

  it("keeps unknown install stderr out of plain and JSON output", () => {
    const result = {
      supported: true,
      changed: true,
      dryRun: false,
      plistPath: "/tmp/p.plist",
      started: false,
      startError:
        "novel failure /Users/private/LaunchAgents/service.plist sk-private123456",
    };
    const plain = formatServiceInstallPlain(result);
    const json = formatServiceInstallJson(result);

    for (const output of [plain, json]) {
      expect(output).not.toContain("novel failure");
      expect(output).not.toContain("/Users/private");
      expect(output).not.toContain("sk-private");
    }
    expect(JSON.parse(json)).toMatchObject({
      start_error: "launchctl reported an unexpected error.",
      start_error_code: "unknown",
    });
  });

  it("json summary keeps the snake_case wire shape", () => {
    const json = formatServiceInstallJson({
      supported: true,
      changed: false,
      dryRun: true,
      plistPath: "/tmp/p.plist",
      started: false,
    });
    const parsed = JSON.parse(json);
    expect(parsed).toEqual({
      supported: true,
      changed: false,
      dry_run: true,
      plist_path: "/tmp/p.plist",
      backup_path: undefined,
      started: false,
      start_error: undefined,
      start_error_code: undefined,
      start_error_hint: undefined,
    });
  });
});
