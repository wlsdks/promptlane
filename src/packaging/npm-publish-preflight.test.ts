import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

import { describe, expect, it } from "vitest";

describe("npm publish preflight", () => {
  it("includes package publishability and metadata guards in machine-readable output", () => {
    const result = spawnSync(
      process.execPath,
      [
        "scripts/npm-publish-preflight.mjs",
        "--json",
        "--skip-npm",
        "--skip-git-clean",
        "--skip-git-tag",
      ],
      {
        cwd: process.cwd(),
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
      },
    );

    expect(result.status).toBe(0);
    const parsed = JSON.parse(result.stdout) as {
      checks: Array<{ label: string; ok: boolean }>;
    };
    expect(parsed.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: "package is publishable",
          ok: true,
        }),
        expect.objectContaining({
          label: "package license is set",
          ok: true,
        }),
        expect.objectContaining({
          label: "package repository points at GitHub project",
          ok: true,
        }),
        expect.objectContaining({
          label: "promptlane bin entry is registered",
          ok: true,
        }),
        expect.objectContaining({
          label: "pl-claude bin entry is registered",
          ok: true,
        }),
        expect.objectContaining({
          label: "pl-codex bin entry is registered",
          ok: true,
        }),
        expect.objectContaining({
          label: "package files include dist",
          ok: true,
        }),
        expect.objectContaining({
          label: "package files include .claude-plugin",
          ok: true,
        }),
        expect.objectContaining({
          label: "package files include commands",
          ok: true,
        }),
        expect.objectContaining({
          label: "package files include plugins",
          ok: true,
        }),
        expect.objectContaining({
          label: "package files include integrations",
          ok: true,
        }),
        expect.objectContaining({
          label: "package files include docs/PROMPTLANE.md",
          ok: true,
        }),
        expect.objectContaining({
          label: "package files include docs/AGENT-HARNESS.md",
          ok: true,
        }),
        expect.objectContaining({
          label: "package files include docs/INSTRUCTION-FILES.md",
          ok: true,
        }),
        expect.objectContaining({
          label: "package files include docs/PLUGINS.md",
          ok: true,
        }),
        expect.objectContaining({
          label: "package files include docs/ADAPTERS.md",
          ok: true,
        }),
        expect.objectContaining({
          label: "package files include docs/LOOP-SNAPSHOT-SCHEMA.md",
          ok: true,
        }),
        expect.objectContaining({
          label: "package files include README.md",
          ok: true,
        }),
        expect.objectContaining({
          label: "package files include README.ko.md",
          ok: true,
        }),
        expect.objectContaining({
          label: "package files include CHANGELOG.md",
          ok: true,
        }),
        expect.objectContaining({
          label: "package files include SECURITY.md",
          ok: true,
        }),
        expect.objectContaining({
          label: "package files include CODE_OF_CONDUCT.md",
          ok: true,
        }),
        expect.objectContaining({
          label: "package files include CONTRIBUTING.md",
          ok: true,
        }),
        expect.objectContaining({
          label: "package files include SUPPORT.md",
          ok: true,
        }),
        expect.objectContaining({
          label: "package files include LICENSE",
          ok: true,
        }),
        expect.objectContaining({
          label: "package files include scripts/npm-publish-preflight.mjs",
          ok: true,
        }),
        expect.objectContaining({
          label: "package files include scripts/pack-dry-run.mjs",
          ok: true,
        }),
        expect.objectContaining({
          label: "package files include scripts/package-install-smoke.mjs",
          ok: true,
        }),
        expect.objectContaining({
          label: "package files include scripts/quality-gate.mjs",
          ok: true,
        }),
        expect.objectContaining({
          label: "package files include scripts/release-smoke.mjs",
          ok: true,
        }),
        expect.objectContaining({
          label: "package files exclude dist/**/*.map",
          ok: true,
        }),
        expect.objectContaining({
          label: "package manager is pinned",
          ok: true,
        }),
        expect.objectContaining({
          label: "node engine range is stable",
          ok: true,
        }),
      ]),
    );
  });

  it("uses current preflight guidance when the release tag does not match HEAD", () => {
    const binDir = mkdtempSync(join(tmpdir(), "promptlane-fake-git-"));
    const fakeGit = join(binDir, "git");
    writeFileSync(
      fakeGit,
      `#!/usr/bin/env sh
if [ "$1" = "status" ]; then
  exit 0
fi
if [ "$1" = "rev-parse" ]; then
  echo "ffffffffffff0000000000000000000000000000"
  exit 0
fi
if [ "$1" = "rev-list" ]; then
  echo "aaaaaaaaaaaa0000000000000000000000000000"
  exit 0
fi
echo "unexpected git command: $*" >&2
exit 1
`,
      { mode: 0o755 },
    );

    const result = spawnSync(
      process.execPath,
      ["scripts/npm-publish-preflight.mjs", "--json", "--skip-npm"],
      {
        cwd: process.cwd(),
        env: {
          ...process.env,
          PATH: `${binDir}:${process.env.PATH ?? ""}`,
        },
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
      },
    );

    expect(result.status).toBe(1);
    const parsed = JSON.parse(result.stdout) as {
      next_action: string;
      checks: Array<{ label: string; ok: boolean; detail?: string }>;
    };
    const tagCheck = parsed.checks.find((check) =>
      check.label.endsWith("tag exists and points at HEAD"),
    );
    expect(tagCheck).toMatchObject({ ok: false });
    expect(tagCheck?.detail).toContain("git checkout v1.0.0");
    expect(tagCheck?.detail).toContain("tagged checkout");
    expect(tagCheck?.detail).toContain("corepack pnpm npm-publish:preflight");
    expect(tagCheck?.detail).toContain("If promptlane@1.0.0 is unpublished");
    expect(tagCheck?.detail).toContain("git tag -fa v1.0.0");
    expect(tagCheck?.detail).toContain(
      "If promptlane@1.0.0 is already published",
    );
    expect(tagCheck?.detail).toContain("bump version and create a new tag");
    expect(parsed.next_action).toContain("v1.0.0 tag does not point at HEAD");
    expect(parsed.next_action).toContain("git checkout v1.0.0");
    expect(parsed.next_action).toContain("git tag -fa v1.0.0");
    expect(parsed.next_action).toContain("bump version");
    expect(tagCheck?.detail).not.toContain("manual npm checks");
    expect(tagCheck?.detail).not.toContain("predates this preflight");
  });

  it("points the operator to npm login when npm auth is the remaining blocker", () => {
    const binDir = mkdtempSync(join(tmpdir(), "promptlane-fake-npm-"));
    const fakeNpm = join(binDir, "npm");
    writeFileSync(
      fakeNpm,
      `#!/usr/bin/env sh
if [ "$1" = "whoami" ]; then
  echo "npm ERR! code E401" >&2
  exit 1
fi
if [ "$1" = "view" ]; then
  echo "npm ERR! code E404" >&2
  exit 1
fi
echo "unexpected npm command: $*" >&2
exit 1
`,
      { mode: 0o755 },
    );

    const result = spawnSync(
      process.execPath,
      [
        "scripts/npm-publish-preflight.mjs",
        "--json",
        "--skip-git-clean",
        "--skip-git-tag",
      ],
      {
        cwd: process.cwd(),
        env: {
          ...process.env,
          PATH: `${binDir}:${process.env.PATH ?? ""}`,
        },
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
      },
    );

    expect(result.status).toBe(1);
    const parsed = JSON.parse(result.stdout) as {
      status: string;
      next_action: string;
      checks: Array<{ label: string; ok: boolean }>;
    };
    expect(parsed.status).toBe("blocked");
    expect(parsed.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: "npm authentication is available",
          ok: false,
        }),
      ]),
    );
    expect(parsed.next_action).toContain("npm login");
    expect(parsed.next_action).toContain("corepack pnpm npm-publish:preflight");
    expect(parsed.next_action).toContain("npm publish --tag latest");
  });
});
