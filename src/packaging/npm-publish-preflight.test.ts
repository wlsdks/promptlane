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
          label: "package description uses PromptLane positioning",
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
          label: "package homepage points at GitHub project",
          ok: true,
        }),
        expect.objectContaining({
          label: "package bugs points at GitHub issues",
          ok: true,
        }),
        expect.objectContaining({
          label: "package keywords include public positioning terms",
          ok: true,
        }),
        expect.objectContaining({
          label: "package publish access is public",
          ok: true,
        }),
        expect.objectContaining({
          label: "promptlane bin entry is registered",
          ok: true,
        }),
        expect.objectContaining({
          label: "promptlane bin target exists",
          ok: true,
        }),
        expect.objectContaining({
          label: "promptlane bin target is executable",
          ok: true,
        }),
        expect.objectContaining({
          label: "pl-claude bin entry is registered",
          ok: true,
        }),
        expect.objectContaining({
          label: "pl-claude bin target exists",
          ok: true,
        }),
        expect.objectContaining({
          label: "pl-claude bin target is executable",
          ok: true,
        }),
        expect.objectContaining({
          label: "pl-codex bin entry is registered",
          ok: true,
        }),
        expect.objectContaining({
          label: "pl-codex bin target exists",
          ok: true,
        }),
        expect.objectContaining({
          label: "pl-codex bin target is executable",
          ok: true,
        }),
        expect.objectContaining({
          label: "publish preflight package script is registered",
          ok: true,
        }),
        expect.objectContaining({
          label: "format package script is registered",
          ok: true,
        }),
        expect.objectContaining({
          label: "test package script is registered",
          ok: true,
        }),
        expect.objectContaining({
          label: "lint package script is registered",
          ok: true,
        }),
        expect.objectContaining({
          label: "build package script is registered",
          ok: true,
        }),
        expect.objectContaining({
          label: "prepack package script is registered",
          ok: true,
        }),
        expect.objectContaining({
          label: "prepare package script is registered",
          ok: true,
        }),
        expect.objectContaining({
          label: "pack dry-run package script is registered",
          ok: true,
        }),
        expect.objectContaining({
          label: "benchmark package script is registered",
          ok: true,
        }),
        expect.objectContaining({
          label: "browser e2e package script is registered",
          ok: true,
        }),
        expect.objectContaining({
          label: "release smoke package script is registered",
          ok: true,
        }),
        expect.objectContaining({
          label: "package install smoke package script is registered",
          ok: true,
        }),
        expect.objectContaining({
          label: "quality evidence package script is registered",
          ok: true,
        }),
        expect.objectContaining({
          label: "installed CLI package script is registered",
          ok: true,
        }),
        expect.objectContaining({
          label: "package files include dist",
          ok: true,
        }),
        expect.objectContaining({
          label: "built CLI assets exist",
          ok: true,
        }),
        expect.objectContaining({
          label: "built server assets exist",
          ok: true,
        }),
        expect.objectContaining({
          label: "built web assets exist",
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
          label: "package files entry exists integrations",
          ok: true,
        }),
        expect.objectContaining({
          label: "plugin artifact exists .claude-plugin/plugin.json",
          ok: true,
        }),
        expect.objectContaining({
          label: "plugin artifact exists .claude-plugin/marketplace.json",
          ok: true,
        }),
        expect.objectContaining({
          label: "plugin artifact exists commands/coach.md",
          ok: true,
        }),
        expect.objectContaining({
          label: "plugin artifact exists commands/setup.md",
          ok: true,
        }),
        expect.objectContaining({
          label:
            "plugin artifact exists plugins/promptlane/.codex-plugin/plugin.json",
          ok: true,
        }),
        expect.objectContaining({
          label:
            "plugin artifact exists plugins/promptlane/skills/promptlane/SKILL.md",
          ok: true,
        }),
        expect.objectContaining({
          label: "plugin artifact exists integrations/claude-code/README.md",
          ok: true,
        }),
        expect.objectContaining({
          label:
            "plugin artifact exists integrations/claude-code/settings.example.json",
          ok: true,
        }),
        expect.objectContaining({
          label: "package files include docs/PROMPTLANE.md",
          ok: true,
        }),
        expect.objectContaining({
          label: "package files entry exists docs/PROMPTLANE.md",
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
          label: "package files include docs/PROMPTLANE-RUNTIME-HISTORY.md",
          ok: true,
        }),
        expect.objectContaining({
          label: "package files include docs/PROMPTLANE-LEGACY-SURFACES.md",
          ok: true,
        }),
        expect.objectContaining({
          label:
            "package files include docs/DOGFOOD_CODEX_CLAUDE_2026-07-05.md",
          ok: true,
        }),
        expect.objectContaining({
          label:
            "package files include docs/DOGFOOD_WEB_USER_FLOW_2026-07-05.md",
          ok: true,
        }),
        expect.objectContaining({
          label:
            "package files include docs/superpowers/plans/2026-07-04-promptlane-plugin-rename-plan.md",
          ok: true,
        }),
        expect.objectContaining({
          label:
            "package files include docs/superpowers/plans/2026-07-04-promptlane-plugin-rename-issue-slices.md",
          ok: true,
        }),
        expect.objectContaining({
          label:
            "package files include docs/superpowers/plans/2026-07-04-promptlane-runtime-id-inventory.json",
          ok: true,
        }),
        expect.objectContaining({
          label:
            "package files include docs/superpowers/plans/2026-07-04-promptlane-claude-dual-namespace-decision.md",
          ok: true,
        }),
        expect.objectContaining({
          label:
            "package files include docs/superpowers/plans/2026-07-04-promptlane-mcp-server-name-decision.md",
          ok: true,
        }),
        expect.objectContaining({
          label:
            "package files include docs/superpowers/plans/2026-07-04-promptlane-deprecation-readiness.md",
          ok: true,
        }),
        expect.objectContaining({
          label:
            "package files include docs/superpowers/plans/2026-07-04-promptlane-next-runtime-value-slice.md",
          ok: true,
        }),
        expect.objectContaining({
          label:
            "package files include docs/superpowers/plans/2026-07-05-promptlane-95-quality-plan.md",
          ok: true,
        }),
        expect.objectContaining({
          label:
            "package files include docs/superpowers/specs/2026-07-05-promptlane-repositioning-design.md",
          ok: true,
        }),
        expect.objectContaining({
          label: "package files include docs/PRD.md",
          ok: true,
        }),
        expect.objectContaining({
          label: "package files include docs/PRD_PHASE2.md",
          ok: true,
        }),
        expect.objectContaining({
          label: "package files include docs/ARCHITECTURE.md",
          ok: true,
        }),
        expect.objectContaining({
          label: "package files include docs/EFFICIENCY_REVIEW.md",
          ok: true,
        }),
        expect.objectContaining({
          label: "package files include docs/LEGAL_USAGE_GUIDE.md",
          ok: true,
        }),
        expect.objectContaining({
          label: "package files include docs/TECH_SPEC.md",
          ok: true,
        }),
        expect.objectContaining({
          label: "package files include docs/IMPLEMENTATION_PLAN.md",
          ok: true,
        }),
        expect.objectContaining({
          label: "package files include docs/BENCHMARK_V1.md",
          ok: true,
        }),
        expect.objectContaining({
          label: "package files include docs/FEATURE_AUDIT_2026-05-02.md",
          ok: true,
        }),
        expect.objectContaining({
          label: "package files include docs/PRD2_COMPLETION_AUDIT.md",
          ok: true,
        }),
        expect.objectContaining({
          label: "package files include docs/NPM_PUBLISHING.md",
          ok: true,
        }),
        expect.objectContaining({
          label: "package files include docs/PACKAGE_CONTENTS.md",
          ok: true,
        }),
        expect.objectContaining({
          label: "package files include docs/PRE_PUBLISH_PRIVACY_AUDIT.md",
          ok: true,
        }),
        expect.objectContaining({
          label: "package files include docs/RELEASE_CHECKLIST.md",
          ok: true,
        }),
        expect.objectContaining({
          label:
            "package files include docs/RELEASE_STABILITY_EVIDENCE_2026-07-06.md",
          ok: true,
        }),
        expect.objectContaining({
          label: "package files include docs/LOCAL_95_EVIDENCE_2026-07-06.md",
          ok: true,
        }),
        expect.objectContaining({
          label:
            "package files include docs/PRODUCT_POSITIONING_EVIDENCE_2026-07-06.md",
          ok: true,
        }),
        expect.objectContaining({
          label: "package files include docs/UI_PATROL_EVIDENCE_2026-07-06.md",
          ok: true,
        }),
        expect.objectContaining({
          label:
            "package files include docs/CODEX_CLAUDE_LOCAL_INTEGRATION_EVIDENCE_2026-07-06.md",
          ok: true,
        }),
        expect.objectContaining({
          label:
            "package files include docs/NATIVE_DIALOG_DOGFOOD_AUDIT_2026-07-05.md",
          ok: true,
        }),
        expect.objectContaining({
          label:
            "package files include docs/UI_PATROL_SCHEDULE_READINESS_2026-07-06.md",
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
          label: "package files entry exists scripts/npm-publish-preflight.mjs",
          ok: true,
        }),
        expect.objectContaining({
          label: "package files include scripts/benchmark.mjs",
          ok: true,
        }),
        expect.objectContaining({
          label: "package files include scripts/agent-setup-smoke.mjs",
          ok: true,
        }),
        expect.objectContaining({
          label: "package files include scripts/browser-e2e.mjs",
          ok: true,
        }),
        expect.objectContaining({
          label: "package files include scripts/first-coach-loop-dogfood.mjs",
          ok: true,
        }),
        expect.objectContaining({
          label:
            "package files include scripts/loop-memory-approval-dogfood.mjs",
          ok: true,
        }),
        expect.objectContaining({
          label: "package files include scripts/hook-binary-smoke.mjs",
          ok: true,
        }),
        expect.objectContaining({
          label: "package files include scripts/mcp-coach-loop-smoke.mjs",
          ok: true,
        }),
        expect.objectContaining({
          label: "package files include scripts/mcp-elicitation-smoke.mjs",
          ok: true,
        }),
        expect.objectContaining({
          label: "package files include scripts/mcp-native-dialog-approved.mjs",
          ok: true,
        }),
        expect.objectContaining({
          label:
            "package files include scripts/mcp-native-dialog-preflight.mjs",
          ok: true,
        }),
        expect.objectContaining({
          label: "package files include scripts/quality-95-evidence.mjs",
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
          label: "package files include scripts/ui-patrol.mjs",
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
