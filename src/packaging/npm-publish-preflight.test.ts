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
      status: string;
      publish_ready: boolean;
      publish_command?: string;
      next_action: string;
      inspection_warnings: Array<{ label: string; detail: string }>;
      release_warnings: Array<{ label: string; detail: string }>;
      checks: Array<{ label: string; ok: boolean; detail?: string }>;
    };
    expect(parsed.status).toBe("inspection");
    expect(parsed.publish_ready).toBe(false);
    expect(parsed.publish_command).toBeUndefined();
    expect(parsed.inspection_warnings).toEqual([
      {
        label: "release checks were skipped",
        detail:
          "Skipped --skip-npm, --skip-git-clean, --skip-git-tag; rerun corepack pnpm npm-publish:preflight without skip flags before publishing.",
      },
    ]);
    expect(parsed.release_warnings).toEqual([
      {
        label: "benchmark is synthetic regression evidence",
        detail:
          'corepack pnpm --silent benchmark -- --json must pass before publish, but a synthetic pass is not real-world effectiveness proof. Create an operator-owned template with promptlane benchmark init-fixture --output "$FIXTURE_FILE", replace every example with consent-bearing redacted fixtures, add operator-confirmed passed or failed outcome metadata with safe evidence refs, update consent_note, set template_only to false, save one JSON snapshot as $BASELINE_REPORT, then rerun promptlane benchmark --fixture-set real --fixture-file "$FIXTURE_FILE" --baseline-file "$BASELINE_REPORT" before claiming real-user prompt quality trends.',
      },
      {
        label: "real benchmark fixtures are missing",
        detail:
          'docs/benchmark-fixtures/real.json is absent; publish can proceed after release gates pass, but do not claim real-user effectiveness trends. Create an operator-owned template with promptlane benchmark init-fixture --output "$FIXTURE_FILE", replace every example with consent-bearing redacted fixtures, add operator-confirmed passed or failed outcome metadata with safe evidence refs, update consent_note, set template_only to false, save one JSON snapshot as $BASELINE_REPORT, then rerun promptlane benchmark --fixture-set real --fixture-file "$FIXTURE_FILE" --baseline-file "$BASELINE_REPORT".',
      },
    ]);
    expect(parsed.next_action).toContain(
      "Rerun corepack pnpm npm-publish:preflight without --skip-npm",
    );
    expect(parsed.next_action).toContain("--skip-git-clean");
    expect(parsed.next_action).toContain("--skip-git-tag");
    expect(parsed.next_action).not.toContain("npm publish --tag latest");
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
          label: "Claude plugin manifest identity is stable",
          ok: true,
        }),
        expect.objectContaining({
          label: "Claude plugin manifest version matches package.json",
          ok: true,
        }),
        expect.objectContaining({
          label: "Claude plugin manifest command list is complete",
          ok: true,
        }),
        expect.objectContaining({
          label: "Claude marketplace manifest points at local plugin",
          ok: true,
        }),
        expect.objectContaining({
          label: "Claude marketplace manifest version matches package.json",
          ok: true,
        }),
        expect.objectContaining({
          label: "Codex plugin manifest identity is stable",
          ok: true,
        }),
        expect.objectContaining({
          label: "Codex plugin manifest skill path is registered",
          ok: true,
        }),
        expect.objectContaining({
          label: "Codex plugin manifest display metadata is PromptLane",
          ok: true,
        }),
        expect.objectContaining({
          label: "Codex plugin skill frontmatter is PromptLane",
          ok: true,
        }),
        expect.objectContaining({
          label: "Codex plugin skill documents local-first privacy boundary",
          ok: true,
        }),
        expect.objectContaining({
          label: "Claude setup command documents npm install and setup path",
          ok: true,
        }),
        expect.objectContaining({
          label:
            "Claude coach command documents MCP fallback and no auto-submit",
          ok: true,
        }),
        expect.objectContaining({
          label: "Claude command docs preserve raw-free safety guidance",
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
          label: "package files include scripts/benchmark-fixtures.mjs",
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
          label: "package files exclude local-only source and runtime entries",
          ok: true,
        }),
        expect.objectContaining({
          label:
            "package files exclude secret, database, log, and artifact globs",
          ok: true,
        }),
        expect.objectContaining({
          label: "pre-publish privacy audit mirrors runtime token detectors",
          ok: true,
        }),
        expect.objectContaining({
          label: "pre-publish privacy audit mirrors runtime path detectors",
          ok: true,
        }),
        expect.objectContaining({
          label: "real benchmark fixture example is loadable",
          ok: true,
          detail:
            "docs/benchmark-fixtures/real.example.json is a raw-free non-runnable real fixture template",
        }),
        expect.objectContaining({
          label: "real benchmark missing-fixtures evidence state is documented",
          ok: true,
        }),
        expect.objectContaining({
          label: "benchmark evidence state report contract is documented",
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

  it("requires the release tag to be annotated", () => {
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
  echo "ffffffffffff0000000000000000000000000000"
  exit 0
fi
if [ "$1" = "cat-file" ] && [ "$2" = "-t" ]; then
  echo "commit"
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
    const annotatedTagCheck = parsed.checks.find((check) =>
      check.label.endsWith("tag is annotated"),
    );
    expect(annotatedTagCheck).toMatchObject({ ok: false });
    expect(annotatedTagCheck?.detail).toContain("git tag -fa v1.0.0");
    expect(annotatedTagCheck?.detail).toContain("annotated tag");
    expect(parsed.next_action).toContain("v1.0.0 tag is not annotated");
    expect(parsed.next_action).toContain("git tag -fa v1.0.0");
  });

  it("requires the origin release tag to match the local release tag", () => {
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
  echo "ffffffffffff0000000000000000000000000000"
  exit 0
fi
if [ "$1" = "cat-file" ] && [ "$2" = "-t" ]; then
  echo "tag"
  exit 0
fi
if [ "$1" = "ls-remote" ]; then
  echo "aaaaaaaaaaaa0000000000000000000000000000	refs/tags/v1.0.0^{}"
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
    const originTagCheck = parsed.checks.find((check) =>
      check.label.endsWith("origin tag matches local release tag"),
    );
    expect(originTagCheck).toMatchObject({ ok: false });
    expect(originTagCheck?.detail).toContain("git push origin v1.0.0");
    expect(originTagCheck?.detail).toContain("origin/v1.0.0");
    expect(parsed.next_action).toContain(
      "origin v1.0.0 tag does not match local v1.0.0",
    );
    expect(parsed.next_action).toContain("git push origin v1.0.0 --force");
  });

  it("emits the publish command only when every release preflight passes", () => {
    const binDir = mkdtempSync(join(tmpdir(), "promptlane-ready-tools-"));
    const fakeNpm = join(binDir, "npm");
    const fakeGit = join(binDir, "git");
    writeFileSync(
      fakeNpm,
      `#!/usr/bin/env sh
if [ "$1" = "whoami" ]; then
  echo "wlsdks"
  exit 0
fi
if [ "$1" = "view" ]; then
  printf '%s\n' '[]'
  exit 0
fi
echo "unexpected npm command: $*" >&2
exit 1
`,
      { mode: 0o755 },
    );
    writeFileSync(
      fakeGit,
      `#!/usr/bin/env sh
if [ "$1" = "status" ]; then
  exit 0
fi
if [ "$1" = "rev-parse" ]; then
  echo "1111111111111111111111111111111111111111"
  exit 0
fi
if [ "$1" = "rev-list" ]; then
  echo "1111111111111111111111111111111111111111"
  exit 0
fi
if [ "$1" = "cat-file" ]; then
  echo "tag"
  exit 0
fi
if [ "$1" = "ls-remote" ]; then
  printf '%s\t%s\n' "1111111111111111111111111111111111111111" "refs/tags/v1.0.0^{}"
  exit 0
fi
echo "unexpected git command: $*" >&2
exit 1
`,
      { mode: 0o755 },
    );

    const result = spawnSync(
      process.execPath,
      ["scripts/npm-publish-preflight.mjs", "--json"],
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

    expect(result.status).toBe(0);
    const parsed = JSON.parse(result.stdout) as {
      status: string;
      publish_ready: boolean;
      publish_command?: string;
      recovery_commands: string[];
      next_action: string;
    };
    expect(parsed.status).toBe("ready");
    expect(parsed.publish_ready).toBe(true);
    expect(parsed.publish_command).toBe("npm publish --tag latest");
    expect(parsed.recovery_commands).toEqual([]);
    expect(parsed.next_action).toContain("npm publish --tag latest");
  });

  it("points the operator to npm login when npm auth is the remaining blocker", () => {
    const binDir = mkdtempSync(join(tmpdir(), "promptlane-fake-npm-"));
    const fakeNpm = join(binDir, "npm");
    writeFileSync(
      fakeNpm,
      `#!/usr/bin/env sh
if [ "$1" = "whoami" ]; then
  echo 'npm warn Unknown env config "reporter". This will stop working in the next major version of npm.' >&2
  echo "npm ERR! code E401" >&2
  echo "npm ERR! token npm_abcdefghijklmnopqrstuvwxyzABCDEFGHIJKL" >&2
  echo "npm ERR! A complete log of this run can be found in: /Users/jinan/.npm/_logs/debug.log" >&2
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
      publish_command?: string;
      next_action: string;
      blocking_checks: Array<{ label: string; detail?: string }>;
      recovery_commands: string[];
      checks: Array<{ label: string; ok: boolean; detail?: string }>;
    };
    expect(parsed.status).toBe("blocked");
    expect(parsed.publish_command).toBeUndefined();
    const authCheck = parsed.checks.find(
      (check) => check.label === "npm authentication is available",
    );
    expect(authCheck).toMatchObject({ ok: false });
    expect(authCheck?.detail).toContain("npm whoami failed");
    expect(authCheck?.detail).toContain("npm login");
    expect(authCheck?.detail).toContain("npm ERR! code E401");
    expect(authCheck?.detail).toContain("[REDACTED:npm_token]");
    expect(authCheck?.detail).toContain("[REDACTED:local_path]");
    expect(authCheck?.detail).not.toContain("Unknown env config");
    expect(authCheck?.detail).not.toContain("/Users/jinan");
    expect(authCheck?.detail).not.toContain(
      "npm_abcdefghijklmnopqrstuvwxyzABCDEFGHIJKL",
    );
    expect(parsed.blocking_checks).toEqual([
      expect.objectContaining({
        label: "npm authentication is available",
        detail: expect.stringContaining("npm login"),
      }),
    ]);
    expect(parsed.recovery_commands).toEqual([
      "npm login",
      "corepack pnpm npm-publish:preflight",
    ]);
    expect(parsed.recovery_commands).not.toContain("npm publish --tag latest");
    expect(parsed.next_action).toContain("npm login");
    expect(parsed.next_action).toContain("corepack pnpm npm-publish:preflight");
    expect(parsed.next_action).toContain("npm publish --tag latest");
  });

  it("summarizes blocking checks near the top of human preflight output", () => {
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
    expect(result.stdout).toContain(
      "Blocking checks\n- npm authentication is available",
    );
    expect(result.stdout).toContain(
      "Release warnings\n- benchmark is synthetic regression evidence",
    );
    expect(result.stdout).toContain(
      "a synthetic pass is not real-world effectiveness proof",
    );
    expect(result.stdout).toContain("- real benchmark fixtures are missing");
    expect(result.stdout).toContain(
      "do not claim real-user effectiveness trends",
    );
    expect(result.stdout).toContain(
      'promptlane benchmark init-fixture --output "$FIXTURE_FILE"',
    );
    expect(result.stdout).toContain(
      'promptlane benchmark --fixture-set real --fixture-file "$FIXTURE_FILE"',
    );
    expect(result.stdout).toContain(
      "Recovery commands\n- npm login\n- corepack pnpm npm-publish:preflight",
    );
    expect(result.stdout.indexOf("Blocking checks")).toBeLessThan(
      result.stdout.indexOf("Checks"),
    );
    expect(result.stdout.indexOf("Recovery commands")).toBeLessThan(
      result.stdout.indexOf("Checks"),
    );
    expect(result.stdout).not.toContain("- npm publish --tag latest");
    expect(result.stdout).toContain(
      "Next action: Run npm login, rerun corepack pnpm npm-publish:preflight",
    );
  });

  it("tells the operator to bump version instead of retargeting v1.0.0 after publish", () => {
    const binDir = mkdtempSync(join(tmpdir(), "promptlane-fake-npm-"));
    const fakeNpm = join(binDir, "npm");
    writeFileSync(
      fakeNpm,
      `#!/usr/bin/env sh
if [ "$1" = "whoami" ]; then
  echo "wlsdks"
  exit 0
fi
if [ "$1" = "view" ]; then
  printf '%s\n' '["0.9.0","1.0.0"]'
  exit 0
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
      next_action: string;
      checks: Array<{ label: string; ok: boolean; detail?: string }>;
    };
    const versionCheck = parsed.checks.find((check) =>
      check.label.endsWith("has not already been published"),
    );
    expect(versionCheck).toMatchObject({ ok: false });
    expect(versionCheck?.detail).toContain(
      "promptlane@1.0.0 is already published",
    );
    expect(versionCheck?.detail).toContain("do not retarget v1.0.0");
    expect(versionCheck?.detail).toContain("bump package.json");
    expect(versionCheck?.detail).toContain("src/shared/version.ts");
    expect(parsed.next_action).toContain("Bump package.json");
    expect(parsed.next_action).toContain("create a new release tag");
  });
});
