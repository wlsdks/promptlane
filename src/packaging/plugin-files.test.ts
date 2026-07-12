import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parse as parseYaml } from "yaml";

import { listLoopRelayMcpToolNames } from "../mcp/tool-registry.js";

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(join(process.cwd(), path), "utf8")) as T;
}

function sectionBetween(content: string, heading: string): string {
  const start = content.indexOf(heading);
  if (start === -1) {
    return "";
  }
  const nextHeading = content.indexOf("\n## ", start + heading.length);
  return content.slice(start, nextHeading === -1 ? undefined : nextHeading);
}

function markdownListItems(section: string): string[] {
  return section
    .split("\n")
    .map((line) => line.match(/^- `([^`]+)`(?::.*)?$/)?.[1])
    .filter((item): item is string => Boolean(item));
}

function firstShellCodeBlock(section: string): string[] {
  return (
    section
      .match(/```(?:sh)?\n([\s\S]*?)```/)?.[1]
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean) ?? []
  );
}

describe("plugin packaging files", () => {
  it("keeps pnpm build-script approvals in pnpm-workspace.yaml", () => {
    const packageJson = readJson<{
      pnpm?: unknown;
    }>("package.json");
    const workspace = parseYaml(
      readFileSync(join(process.cwd(), "pnpm-workspace.yaml"), "utf8"),
    ) as {
      onlyBuiltDependencies?: unknown;
    };

    expect(packageJson.pnpm).toBeUndefined();
    expect(workspace.onlyBuiltDependencies).toEqual([
      "better-sqlite3",
      "esbuild",
    ]);
  });

  it("uses the packageManager-pinned pnpm for npm lifecycle build scripts", () => {
    const packageJson = readJson<{
      packageManager: string;
      scripts: Record<string, string>;
    }>("package.json");

    expect(packageJson.packageManager).toBe("pnpm@10.18.0");
    expect(packageJson.scripts["pack:dry-run"]).toBe(
      "node scripts/pack-dry-run.mjs",
    );
    expect(packageJson.scripts.prepack).toBe("corepack pnpm build");
    expect(packageJson.scripts.prepare).toBe("corepack pnpm build");
    const packDryRunScript = readFileSync(
      join(process.cwd(), "scripts/pack-dry-run.mjs"),
      "utf8",
    );
    expect(packDryRunScript).toContain(
      "delete npmEnv.npm_config_patched_dependencies",
    );
    expect(packDryRunScript).toContain(
      "delete npmEnv.pnpm_config_patched_dependencies",
    );
  });

  it("uses packageManager-pinned pnpm for build-backed smoke and dogfood scripts", () => {
    const packageJson = readJson<{
      scripts: Record<string, string>;
    }>("package.json");

    for (const scriptName of [
      "e2e:browser",
      "smoke:agent-setup",
      "smoke:hooks",
      "smoke:mcp-coach-loop",
      "smoke:mcp-elicitation",
      "smoke:mcp-native-dialog",
      "dogfood:mcp-native-dialog-approved",
      "dogfood:mcp-native-dialog-refusal",
      "dogfood:first-coach-loop",
      "dogfood:loop-memory-approval",
      "smoke:release",
    ]) {
      expect(packageJson.scripts[scriptName]).toMatch(
        /^corepack pnpm build && /,
      );
      expect(packageJson.scripts[scriptName]).not.toMatch(/^pnpm build && /);
    }
    expect(packageJson.scripts["dogfood:web-user-flow"]).toBe(
      "corepack pnpm e2e:browser",
    );
    expect(packageJson.scripts["benchmark"]).toBe(
      "node scripts/benchmark-runner.mjs",
    );
    expect(
      readFileSync(join(process.cwd(), "scripts/benchmark-runner.mjs"), "utf8"),
    ).toContain('spawnSync("corepack", ["pnpm", "build"]');
  });

  it("keeps shell command quoting centralized in the shared helper", () => {
    const commandSources = [
      "src/cli/commands/install-hook.ts",
      "src/cli/commands/statusline.ts",
      "src/cli/commands/install-codex-hud.ts",
      "src/cli/agent-access.ts",
      "src/loop/status.ts",
      "src/loop/snapshot-selection.ts",
      "src/server/loop-detail-guidance.ts",
    ];

    for (const sourcePath of commandSources) {
      const source = readFileSync(join(process.cwd(), sourcePath), "utf8");
      expect(source).not.toMatch(/function\s+shellQuote\s*\(/);
      if (source.includes("quoteForShell")) {
        expect(source).toContain("shared/shell-quote.js");
      }
    }
  });

  it("keeps package contents and npm publishing docs aligned with shipped bins and scripts", () => {
    const packageJson = readJson<{
      bin: Record<string, string>;
      files: string[];
      scripts: Record<string, string>;
    }>("package.json");
    const packageContents = readFileSync(
      join(process.cwd(), "docs/PACKAGE_CONTENTS.md"),
      "utf8",
    );
    const publishing = readFileSync(
      join(process.cwd(), "docs/NPM_PUBLISHING.md"),
      "utf8",
    );
    const packageInstallSmoke = readFileSync(
      join(process.cwd(), "scripts/package-install-smoke.mjs"),
      "utf8",
    );

    for (const scriptPath of [
      "scripts/pack-dry-run.mjs",
      "scripts/package-install-smoke.mjs",
      "scripts/npm-publish-preflight.mjs",
      "scripts/mcp-native-dialog-approved.mjs",
      "scripts/ui-patrol.mjs",
      "scripts/quality-95-evidence.mjs",
    ]) {
      expect(packageJson.files).toContain(scriptPath);
      expect(packageContents).toContain(scriptPath);
      expect(packageContents).toContain(`- \`${scriptPath}\``);
    }

    expect(packageJson.scripts["npm-publish:preflight"]).toBe(
      "node scripts/npm-publish-preflight.mjs",
    );
    expect(packageJson).not.toHaveProperty("private", true);
    expect(packageJson.scripts["smoke:package-install"]).toBe(
      "node scripts/package-install-smoke.mjs",
    );
    expect(packageInstallSmoke).toContain('"start", "--open-web", "--json"');
    expect(packageInstallSmoke).toContain("validateStartGuide");
    expect(packageInstallSmoke).toContain(
      '"quality-evidence", "--require-complete"',
    );
    expect(packageInstallSmoke).toContain("validateQualityEvidence");
    expect(packageInstallSmoke).toContain("cwd: tempHome");
    const preflightScript = readFileSync(
      join(process.cwd(), "scripts/npm-publish-preflight.mjs"),
      "utf8",
    );
    expect(preflightScript).toContain("package is publishable");
    expect(preflightScript).toContain("packageJson.private !== true");
    expect(preflightScript).toContain("package license is set");
    expect(preflightScript).toContain('packageJson.license === "MIT"');
    expect(preflightScript).toContain(
      "package repository points at GitHub project",
    );
    expect(preflightScript).toContain(
      'packageJson.repository?.url === "https://github.com/wlsdks/looprelay.git"',
    );
    expect(preflightScript).toContain(
      "package homepage points at GitHub project",
    );
    expect(preflightScript).toContain("package bugs points at GitHub issues");
    expect(preflightScript).toContain(
      "package keywords include public positioning terms",
    );
    expect(preflightScript).toContain("package publish access is public");
    expect(preflightScript).toContain('looprelay: "./dist/cli/index.js"');
    expect(preflightScript).toContain('"lr-claude": "./dist/cli/lr-claude.js"');
    expect(preflightScript).toContain('"lr-codex": "./dist/cli/lr-codex.js"');
    expect(preflightScript).toContain("`${binName} bin entry is registered`");
    expect(preflightScript).toContain("registeredPath === expectedPath");
    expect(preflightScript).toContain("package files include ${filePath}");
    expect(preflightScript).toContain('"dist"');
    expect(preflightScript).toContain('".claude-plugin"');
    expect(preflightScript).toContain('"commands"');
    expect(preflightScript).toContain('"plugins"');
    expect(preflightScript).toContain('"integrations"');
    expect(preflightScript).toContain('"docs/LOOPRELAY.md"');
    expect(preflightScript).toContain('"docs/AGENT-HARNESS.md"');
    expect(preflightScript).toContain('"docs/INSTRUCTION-FILES.md"');
    expect(preflightScript).toContain('"docs/PLUGINS.md"');
    expect(preflightScript).toContain('"docs/ADAPTERS.md"');
    expect(preflightScript).toContain('"docs/LOOP-SNAPSHOT-SCHEMA.md"');
    expect(preflightScript).toContain('"docs/LOOPRELAY-RUNTIME-HISTORY.md"');
    expect(preflightScript).toContain('"docs/LOOPRELAY-RUNTIME-SURFACES.md"');
    expect(preflightScript).toContain(
      '"docs/DOGFOOD_CODEX_CLAUDE_2026-07-05.md"',
    );
    expect(preflightScript).toContain(
      '"docs/DOGFOOD_WEB_USER_FLOW_2026-07-05.md"',
    );
    expect(preflightScript).toContain(
      '"docs/superpowers/plans/2026-07-04-looprelay-plugin-rename-plan.md"',
    );
    expect(preflightScript).toContain(
      '"docs/superpowers/plans/2026-07-04-looprelay-plugin-rename-issue-slices.md"',
    );
    expect(preflightScript).toContain(
      '"docs/superpowers/plans/2026-07-04-looprelay-runtime-id-inventory.json"',
    );
    expect(preflightScript).toContain(
      '"docs/superpowers/plans/2026-07-04-looprelay-claude-dual-namespace-decision.md"',
    );
    expect(preflightScript).toContain(
      '"docs/superpowers/plans/2026-07-04-looprelay-mcp-server-name-decision.md"',
    );
    expect(preflightScript).toContain(
      '"docs/superpowers/plans/2026-07-04-looprelay-deprecation-readiness.md"',
    );
    expect(preflightScript).toContain(
      '"docs/superpowers/plans/2026-07-04-looprelay-next-runtime-value-slice.md"',
    );
    expect(preflightScript).toContain(
      '"docs/superpowers/plans/2026-07-05-looprelay-95-quality-plan.md"',
    );
    expect(preflightScript).toContain(
      '"docs/superpowers/specs/2026-07-05-looprelay-repositioning-design.md"',
    );
    expect(preflightScript).toContain('"docs/PRD.md"');
    expect(preflightScript).toContain('"docs/PRD_PHASE2.md"');
    expect(preflightScript).toContain('"docs/ARCHITECTURE.md"');
    expect(preflightScript).toContain('"docs/EFFICIENCY_REVIEW.md"');
    expect(preflightScript).toContain('"docs/LEGAL_USAGE_GUIDE.md"');
    expect(preflightScript).toContain('"docs/TECH_SPEC.md"');
    expect(preflightScript).toContain('"docs/IMPLEMENTATION_PLAN.md"');
    expect(preflightScript).toContain('"docs/BENCHMARK_V1.md"');
    expect(preflightScript).toContain(
      '"docs/benchmark-fixtures/real.example.json"',
    );
    expect(preflightScript).toContain('"docs/FEATURE_AUDIT_2026-05-02.md"');
    expect(preflightScript).toContain('"docs/PRD2_COMPLETION_AUDIT.md"');
    expect(preflightScript).toContain('"docs/NPM_PUBLISHING.md"');
    expect(preflightScript).toContain('"docs/PACKAGE_CONTENTS.md"');
    expect(preflightScript).toContain('"docs/PRE_PUBLISH_PRIVACY_AUDIT.md"');
    expect(preflightScript).toContain('"docs/RELEASE_CHECKLIST.md"');
    expect(preflightScript).toContain(
      '"docs/RELEASE_STABILITY_EVIDENCE_2026-07-06.md"',
    );
    expect(preflightScript).toContain('"docs/LOCAL_95_EVIDENCE_2026-07-06.md"');
    expect(preflightScript).toContain(
      '"docs/PRODUCT_POSITIONING_EVIDENCE_2026-07-06.md"',
    );
    expect(preflightScript).toContain(
      '"docs/UI_PATROL_EVIDENCE_2026-07-06.md"',
    );
    expect(preflightScript).toContain(
      '"docs/CODEX_CLAUDE_LOCAL_INTEGRATION_EVIDENCE_2026-07-06.md"',
    );
    expect(preflightScript).toContain(
      '"docs/NATIVE_DIALOG_DOGFOOD_AUDIT_2026-07-05.md"',
    );
    expect(preflightScript).toContain(
      '"docs/UI_PATROL_SCHEDULE_READINESS_2026-07-06.md"',
    );
    expect(preflightScript).toContain('"README.ko.md"');
    expect(preflightScript).toContain('"CHANGELOG.md"');
    expect(preflightScript).toContain('"SECURITY.md"');
    expect(preflightScript).toContain('"CODE_OF_CONDUCT.md"');
    expect(preflightScript).toContain('"CONTRIBUTING.md"');
    expect(preflightScript).toContain('"SUPPORT.md"');
    expect(preflightScript).toContain('"scripts/benchmark.mjs"');
    expect(preflightScript).toContain('"scripts/benchmark-runner.mjs"');
    expect(preflightScript).toContain('"scripts/benchmark-fixtures.mjs"');
    expect(preflightScript).toContain('"scripts/benchmark-scores.mjs"');
    expect(preflightScript).toContain('"scripts/agent-setup-smoke.mjs"');
    expect(preflightScript).toContain('"scripts/browser-e2e.mjs"');
    expect(preflightScript).toContain('"scripts/first-coach-loop-dogfood.mjs"');
    expect(preflightScript).toContain(
      '"scripts/loop-memory-approval-dogfood.mjs"',
    );
    expect(preflightScript).toContain('"scripts/hook-binary-smoke.mjs"');
    expect(preflightScript).toContain('"scripts/mcp-coach-loop-smoke.mjs"');
    expect(preflightScript).toContain('"scripts/mcp-elicitation-smoke.mjs"');
    expect(preflightScript).toContain(
      '"scripts/mcp-native-dialog-approved.mjs"',
    );
    expect(preflightScript).toContain(
      '"scripts/mcp-native-dialog-preflight.mjs"',
    );
    expect(preflightScript).toContain('"scripts/quality-95-evidence.mjs"');
    expect(preflightScript).toContain('"scripts/pack-dry-run.mjs"');
    expect(preflightScript).toContain('"scripts/package-install-smoke.mjs"');
    expect(preflightScript).toContain('"scripts/quality-gate.mjs"');
    expect(preflightScript).toContain('"scripts/release-smoke.mjs"');
    expect(preflightScript).toContain('"scripts/ui-patrol.mjs"');
    expect(preflightScript).toContain('"!dist/**/*.map"');
    expect(preflightScript).toContain("package files exclude dist/**/*.map");
    expect(preflightScript).toContain("package manager is pinned");
    expect(preflightScript).toContain(
      'packageJson.packageManager === "pnpm@10.18.0"',
    );
    expect(preflightScript).toContain("node engine range is stable");
    expect(preflightScript).toContain(
      'packageJson.engines?.node === ">=22.12 <25"',
    );
    expect(publishing).toContain(
      "Run on a Node.js version that satisfies `package.json#engines.node` (`>=22.12 <25`)",
    );
    expect(publishing).not.toContain("Run on Node 22:");
    expect(preflightScript).toContain('"README.md"');
    expect(preflightScript).toContain('"LICENSE"');
    expect(publishing).toContain("corepack pnpm npm-publish:preflight");
    expect(publishing).toContain("package is not marked private");
    expect(publishing).toContain(
      "license, repository, homepage, bugs, keywords, publish access, and bin metadata",
    );
    expect(publishing).toContain("package publish access is public");
    expect(publishing).toContain(
      "package keywords include public positioning terms",
    );
    expect(publishing).toContain("package files include `dist`");
    expect(publishing).toContain("docs/benchmark-fixtures/real.example.json");
    expect(packageContents).toContain(
      "docs/benchmark-fixtures/real.example.json",
    );
    expect(packageContents.replace(/\s+/g, " ")).toContain(
      "copyable raw-free template for consent-bearing real benchmark fixtures",
    );
    expect(publishing).toContain("package files exclude `dist/**/*.map`");
    expect(publishing).toContain(
      "corepack pnpm --silent npm-publish:preflight -- --json",
    );
    expect(publishing).toContain("machine-readable");
    expect(publishing).toContain("publish_command");
    expect(publishing).toContain('publish_command: "npm publish --tag latest"');
    expect(publishing).toContain("corepack pnpm smoke:package-install");
    expect(publishing).toContain(
      "verifies the installed `looprelay start --open-web --json` first-success guide",
    );
    expect(publishing).toContain(
      "verifies the installed `looprelay quality-evidence --require-complete` release gate",
    );
    expect(publishing).toContain("does not publish");
    expect(publishing).toContain("--skip-npm");
    for (const command of [
      "corepack pnpm evidence:quality -- --require-complete",
      "corepack pnpm looprelay quality-evidence --require-complete",
    ]) {
      expect(publishing).toContain(command);
    }
    expect(publishing).toContain("## Live Readiness Checks");
    expect(publishing).toContain("Do not treat older `npm whoami`");
    expect(publishing).toContain("npm whoami");
    expect(publishing).toContain("npm view looprelay versions --json");
    expect(publishing).toContain("Release warnings");
    expect(publishing).toContain(
      "synthetic pass is not real-world effectiveness proof",
    );
    expect(publishing).toContain("docs/benchmark-fixtures/real.json");
    expect(publishing).toContain("real benchmark fixtures are");
    expect(publishing).toContain("missing` warning");
    expect(publishing).toContain(
      "blocks overclaiming real-user effectiveness trends",
    );
    expect(publishing).toContain(
      "looprelay setup --profile coach --register-mcp --open-web",
    );
    expect(publishing).toContain("looprelay coach");
    expect(publishing).not.toContain("\nlooprelay setup\n");
    expect(publishing).not.toContain("## Current Readiness");
    expect(publishing).not.toContain("# stark97");
    expect(publishing).not.toContain("# E404 Not Found");
    expect(publishing).toContain("git checkout v1.0.0");
    expect(publishing).toContain("Release tags are immutable");
    expect(publishing).toContain(
      "`v1.0.0` must point at the commit being published",
    );
    expect(publishing).toContain("must never be moved");
    expect(publishing).not.toContain("git tag -fa v1.0.0");
    expect(publishing).not.toContain("git push origin v1.0.0 --force");
    expect(publishing).toMatch(/bump the\s+package version/);
    expect(publishing).toContain(
      "a new annotated git tag matching `package.json#version` is created after the full gate",
    );
    expect(publishing).toContain(
      "`corepack pnpm npm-publish:preflight` verifies the local tag and `origin` tag",
    );
    expect(publishing).toContain("point at the same release commit");
    expect(publishing).not.toContain(
      "annotated git tag `v1.0.0` is created only after the local release gate passes",
    );
    expect(publishing).not.toContain(
      "If the newer main commit must be published instead, bump the package version",
    );
    expect(publishing).toContain("tag predates");
    expect(publishing).not.toContain("Do not expect `corepack pnpm");
    expect(preflightScript).toContain("git checkout ${expectedTag}");
    expect(preflightScript).toContain("tagged release commit");
    expect(preflightScript).toContain("must not be moved");
    expect(preflightScript).not.toContain("git tag -fa ${expectedTag}");
    expect(preflightScript).toContain(
      "${expectedTag} tag does not point at HEAD",
    );
    expect(preflightScript).toContain("bump version and create a new tag");
    expect(preflightScript).toContain(
      "${expectedTag} origin tag matches local release tag",
    );
    expect(preflightScript).not.toContain(
      "git push origin ${expectedTag} --force",
    );
    expect(preflightScript).toContain("release_warnings");
    expect(preflightScript).toContain(
      "benchmark is synthetic regression evidence",
    );
    expect(preflightScript).toContain(
      "a synthetic pass is not real-world effectiveness proof",
    );
    expect(preflightScript).toContain("realBenchmarkFixtureWarnings");
    expect(preflightScript).toContain("real benchmark fixtures are missing");
    expect(preflightScript).toContain(
      "do not claim real-user effectiveness trends",
    );
    expect(preflightScript).not.toContain("manual npm checks");
    expect(preflightScript).not.toContain("predates this preflight");

    expect(packageJson.bin.looprelay).toBe("./dist/cli/index.js");
    expect(publishing).toContain("all three bin entries exist after build");
    expect(publishing).toContain("`bin.looprelay` → `dist/cli/index.js`");
    expect(publishing).toContain("chmods all three");
    expect(publishing).not.toContain("all four bin entries");
    expect(publishing).not.toContain("chmods all four");

    const publishingReleaseGate = firstShellCodeBlock(
      sectionBetween(publishing, "## Required Local Gate Before Publishing"),
    );
    expect(publishingReleaseGate).toEqual([
      "corepack pnpm format",
      "corepack pnpm test",
      "corepack pnpm lint",
      "corepack pnpm build",
      "corepack pnpm pack:dry-run",
      "corepack pnpm --silent benchmark -- --json",
      "corepack pnpm e2e:browser",
      "corepack pnpm smoke:release",
      "corepack pnpm smoke:package-install",
      "corepack pnpm evidence:quality -- --require-complete",
      "corepack pnpm looprelay quality-evidence --require-complete",
      "# after selecting a new version:",
      'git tag -a v<new-version> -m "looprelay <new-version>"',
      "git push origin v<new-version>",
      "corepack pnpm npm-publish:preflight",
      "git diff --check",
    ]);
  });

  it("keeps PLUGINS MCP tool list aligned with shipped tool definitions", () => {
    const plugins = readFileSync(
      join(process.cwd(), "docs/PLUGINS.md"),
      "utf8",
    );
    const mcpSection = sectionBetween(plugins, "## MCP Prompt Scoring");
    const documentedTools = markdownListItems(mcpSection).filter((item) =>
      item.includes("_"),
    );
    const actualTools = listLoopRelayMcpToolNames();

    expect(new Set(documentedTools).size).toBe(documentedTools.length);
    expect(documentedTools).toEqual(actualTools);
    expect(mcpSection).toContain(
      `This server exposes ${actualTools.length} model-controlled tools:`,
    );
    expect(mcpSection).toContain("`get_benchmark_candidates`");
    expect(mcpSection).toContain("`get_paired_benchmark_candidates`");
    expect(mcpSection).toContain("at most the latest 100 snapshots");
  });

  it("keeps PLUGINS setup path safe before npm publish", () => {
    const plugins = readFileSync(
      join(process.cwd(), "docs/PLUGINS.md"),
      "utf8",
    );
    const normalizedPlugins = plugins.replace(/\s+/g, " ");

    expect(plugins).toContain("After the npm package is published");
    expect(plugins).toContain("npm install -g looprelay");
    expect(normalizedPlugins).toContain(
      "If `looprelay` is not available yet because the npm package has not been published",
    );
    expect(plugins).toContain(
      "git clone https://github.com/wlsdks/looprelay.git",
    );
    expect(plugins).toContain("pnpm install");
    expect(plugins).toContain("pnpm setup");
  });

  it("keeps README MCP tool lists aligned with shipped tool definitions", () => {
    const readme = readFileSync(join(process.cwd(), "README.md"), "utf8");
    const readmeKo = readFileSync(join(process.cwd(), "README.ko.md"), "utf8");
    const actualTools = listLoopRelayMcpToolNames();
    const englishSection = sectionBetween(readme, "## MCP Prompt Scoring");
    const englishTools = markdownListItems(englishSection).filter((item) =>
      item.includes("_"),
    );

    expect(new Set(englishTools).size).toBe(englishTools.length);
    expect(englishTools).toEqual(actualTools);
    expect(englishSection).toContain(
      `The MCP server exposes ${actualTools.length} tools:`,
    );
    for (const toolName of actualTools) {
      expect(readmeKo).toContain(`- \`${toolName}\``);
    }
    expect(englishSection).toContain("body-free real-benchmark readiness");
  });

  it("keeps current loop status docs on the loop MCP tool name", () => {
    const readme = readFileSync(join(process.cwd(), "README.md"), "utf8");
    const plugins = readFileSync(
      join(process.cwd(), "docs/PLUGINS.md"),
      "utf8",
    );

    for (const content of [readme, plugins]) {
      expect(content).toMatch(
        /`get_looprelay_loop_status`,\s+`\/api\/v1\/loops`/,
      );
      expect(content).not.toMatch(
        /`get_looprelay_status`,\s+`\/api\/v1\/loops`/,
      );
    }
  });

  it("keeps the health boot-instance contract aligned across runtime docs", () => {
    const healthRoute = readFileSync(
      join(process.cwd(), "src/server/routes/health.ts"),
      "utf8",
    );
    const architecture = readFileSync(
      join(process.cwd(), "docs/ARCHITECTURE.md"),
      "utf8",
    );
    const releaseChecklist = readFileSync(
      join(process.cwd(), "docs/RELEASE_CHECKLIST.md"),
      "utf8",
    );
    const readme = readFileSync(join(process.cwd(), "README.md"), "utf8");
    const readmeKo = readFileSync(join(process.cwd(), "README.ko.md"), "utf8");

    expect(healthRoute).toContain("instance_id: INSTANCE_ID");
    expect(architecture).toContain("{ ok, version, instance_id }");
    expect(releaseChecklist).toContain("per-boot UUID");
    expect(readme).toContain("once for each running local server instance");
    expect(readmeKo).toContain("실행 중인 server boot마다");
    for (const content of [architecture, releaseChecklist, readme, readmeKo]) {
      expect(content).toContain("instance_id");
    }
  });

  it("keeps the release checklist aligned with package lifecycle and shipped scripts", () => {
    const packageJson = readJson<{
      files: string[];
      scripts: Record<string, string>;
    }>("package.json");
    const releaseChecklist = readFileSync(
      join(process.cwd(), "docs/RELEASE_CHECKLIST.md"),
      "utf8",
    );
    const architecture = readFileSync(
      join(process.cwd(), "docs/ARCHITECTURE.md"),
      "utf8",
    );
    const agentHarness = readFileSync(
      join(process.cwd(), "docs/AGENT-HARNESS.md"),
      "utf8",
    );
    const releaseSmoke = readFileSync(
      join(process.cwd(), "scripts/release-smoke.mjs"),
      "utf8",
    );
    for (const command of [
      "corepack pnpm format",
      "corepack pnpm test",
      "corepack pnpm lint",
      "corepack pnpm build",
      "corepack pnpm pack:dry-run",
      "corepack pnpm --silent benchmark -- --json",
      "corepack pnpm e2e:browser",
      "corepack pnpm smoke:release",
      "corepack pnpm smoke:package-install",
    ]) {
      expect(releaseChecklist).toContain(`\`${command}\``);
    }
    for (const command of [
      "corepack pnpm format",
      "corepack pnpm test",
      "corepack pnpm lint",
      "corepack pnpm build",
      "corepack pnpm pack:dry-run",
      "corepack pnpm --silent benchmark -- --json",
      "corepack pnpm e2e:browser",
      "corepack pnpm smoke:release",
      "corepack pnpm smoke:package-install",
      "looprelay start --open-web --json",
      "corepack pnpm evidence:quality -- --require-complete",
      "corepack pnpm looprelay quality-evidence --require-complete",
      "git diff --check",
    ]) {
      expect(architecture).toContain(command);
    }
    for (const command of [
      "corepack pnpm format",
      "corepack pnpm test",
      "corepack pnpm lint",
      "corepack pnpm build",
      "corepack pnpm pack:dry-run",
      "corepack pnpm --silent benchmark -- --json",
      "corepack pnpm e2e:browser",
      "corepack pnpm smoke:release",
      "corepack pnpm smoke:package-install",
      "corepack pnpm evidence:quality -- --require-complete",
      "corepack pnpm looprelay quality-evidence --require-complete",
      "git diff --check",
    ]) {
      expect(agentHarness).toContain(command);
    }
    expect(architecture).not.toContain("\npnpm test");
    expect(agentHarness).not.toContain("\npnpm test");

    expect(packageJson.scripts["pack:dry-run"]).toBe(
      "node scripts/pack-dry-run.mjs",
    );
    expect(packageJson.scripts["benchmark"]).toBe(
      "node scripts/benchmark-runner.mjs",
    );
    expect(releaseChecklist).toContain(
      "wrapper strips pnpm-only npm env before `npm pack`",
    );
    expect(releaseChecklist).toContain(
      "Select a new package version because immutable `v1.0.0` predates the LoopRelay rename",
    );
    expect(releaseChecklist).not.toContain(
      "After every gate above passes, create and push annotated tag `v1.0.0`.",
    );
    expect(releaseChecklist).toContain(
      "`corepack pnpm --silent npm-publish:preflight -- --json`",
    );
    expect(releaseChecklist).toContain("machine-readable");

    for (const scriptPath of packageJson.files.filter(
      (filePath) =>
        filePath.startsWith("scripts/") && filePath.endsWith(".mjs"),
    )) {
      expect(releaseChecklist).toContain(`\`${scriptPath}\``);
    }

    for (const docPath of [
      "docs/LOOPRELAY.md",
      "docs/LOOPRELAY-RUNTIME-HISTORY.md",
      "docs/LOOPRELAY-RUNTIME-SURFACES.md",
      "docs/LOOP-SNAPSHOT-SCHEMA.md",
      "docs/AGENT-HARNESS.md",
      "docs/INSTRUCTION-FILES.md",
      "docs/DOGFOOD_CODEX_CLAUDE_2026-07-05.md",
      "docs/DOGFOOD_WEB_USER_FLOW_2026-07-05.md",
      "docs/NATIVE_DIALOG_DOGFOOD_AUDIT_2026-07-05.md",
      "docs/RELEASE_STABILITY_EVIDENCE_2026-07-06.md",
      "docs/benchmark-fixtures/real.example.json",
      "docs/LOCAL_95_EVIDENCE_2026-07-06.md",
      "docs/PRODUCT_POSITIONING_EVIDENCE_2026-07-06.md",
      "docs/UI_PATROL_EVIDENCE_2026-07-06.md",
      "docs/UI_PATROL_SCHEDULE_READINESS_2026-07-06.md",
      "docs/CODEX_CLAUDE_LOCAL_INTEGRATION_EVIDENCE_2026-07-06.md",
    ]) {
      expect(releaseChecklist).toContain(`\`${docPath}\``);
    }

    for (const shippedPlanningDoc of packageJson.files.filter((filePath) =>
      filePath.startsWith("docs/superpowers/"),
    )) {
      expect(releaseChecklist).toContain(`\`${shippedPlanningDoc}\``);
    }

    expect(releaseChecklist).not.toContain("Confirm `pnpm pack:dry-run`");
    expect(releaseSmoke).toContain('"quality-evidence"');
    expect(releaseSmoke).toContain('"--require-complete"');
  });

  it("keeps the benchmark contract tied to archive effectiveness evidence", () => {
    const benchmark = readFileSync(
      join(process.cwd(), "scripts/benchmark.mjs"),
      "utf8",
    );
    const benchmarkRunner = readFileSync(
      join(process.cwd(), "scripts/benchmark-runner.mjs"),
      "utf8",
    );
    const benchmarkFixtures = readFileSync(
      join(process.cwd(), "scripts/benchmark-fixtures.mjs"),
      "utf8",
    );
    const benchmarkScores = readFileSync(
      join(process.cwd(), "scripts/benchmark-scores.mjs"),
      "utf8",
    );
    const benchmarkSpec = readFileSync(
      join(process.cwd(), "docs/BENCHMARK_V1.md"),
      "utf8",
    );
    const realFixtureExample = readFileSync(
      join(process.cwd(), "docs/benchmark-fixtures/real.example.json"),
      "utf8",
    );

    for (const content of [benchmark, benchmarkSpec]) {
      expect(content).toContain("next_action");
      expect(content).toContain("archive_effectiveness_score");
      expect(content).toContain("archive_effectiveness_coverage");
      expect(content).toContain("outcome_pass_rate");
      expect(content).toContain("effectiveness_summary");
      expect(content).toContain("outcome_provenance");
      expect(content).toContain("corpus_fingerprint");
      expect(content).toContain("comparison");
      expect(content).toContain("paired_effectiveness");
      expect(content).toContain("causal_claim");
    }
    for (const content of [benchmarkFixtures, benchmarkSpec]) {
      expect(content).toContain("docs/benchmark-fixtures/real.json");
      expect(content).toContain("consent_note");
      expect(content).toContain("template_only");
      expect(content).toContain("requires_real_outcomes");
    }
    expect(benchmarkSpec).toContain(
      "docs/benchmark-fixtures/real.example.json",
    );
    expect(realFixtureExample).toContain("consent_note");
    expect(realFixtureExample).toContain('"template_only": true');
    expect(realFixtureExample).toContain("real_release_review");
    expect(realFixtureExample).toContain('"outcome"');
    expect(realFixtureExample).toContain('"evidence_refs"');
    expect(realFixtureExample).toContain('"effect_pair"');
    expect(realFixtureExample).toContain('"variant": "baseline"');
    expect(realFixtureExample).toContain('"variant": "looprelay"');
    expect(benchmark).toContain("loadBenchmarkFixtures");
    expect(benchmark).toContain("scorePromptQualityEvidence");
    expect(benchmark).toContain("compareBenchmarkReports");
    expect(benchmarkScores).toContain("real_corpus_delivery_integrity");
    expect(benchmarkScores).toContain("synthetic_score_calibration");
    expect(benchmarkScores).toContain("linked_outcomes");
    expect(benchmarkSpec).toContain("linked_outcomes");
    expect(benchmarkSpec).toContain("real_corpus_delivery_integrity");
    expect(benchmarkSpec).toContain("synthetic_score_calibration");
    expect(benchmarkSpec).toContain("snapshot_healthy");
    expect(benchmarkSpec).toContain("--baseline-file");
    expect(benchmark).toContain("effectiveness remains unproven");
    expect(benchmarkRunner).toContain("corepack");
    expect(benchmarkRunner).toContain("pnpm");
    expect(benchmarkRunner).toContain("build");
    expect(benchmarkRunner).toContain("--json");
    expect(benchmarkRunner).toContain("process.stderr.write");
    expect(benchmarkSpec).toContain('"fixtures"');
    expect(benchmarkSpec).toContain('"coach_cases"');
    expect(benchmarkSpec).toContain("adapter");
    expect(benchmarkSpec).toContain("label");
    expect(benchmarkSpec).toContain("query");
    expect(benchmarkSpec).toContain("set `template_only` to `false`");
    expect(benchmarkSpec).toContain("Prompt Effectiveness Evidence");
    expect(benchmarkSpec).toContain("Pass threshold");
    expect(benchmarkSpec.toLowerCase().replace(/\s+/g, " ")).toContain(
      "coverage is a measurement-depth signal, not a claim of archive-wide proof",
    );
    expect(benchmarkSpec).toContain(
      "Synthetic pass means the local regression gate is green; collect real fixtures before claiming real-world effectiveness.",
    );
  });

  it("ships the installed benchmark CLI and operator-owned real fixture path", () => {
    const cliIndex = readFileSync(
      join(process.cwd(), "src/cli/index.ts"),
      "utf8",
    );
    const benchmarkCommand = readFileSync(
      join(process.cwd(), "src/cli/commands/benchmark.ts"),
      "utf8",
    );
    const benchmarkSpec = readFileSync(
      join(process.cwd(), "docs/BENCHMARK_V1.md"),
      "utf8",
    );
    const readme = readFileSync(join(process.cwd(), "README.md"), "utf8");
    const readmeKo = readFileSync(join(process.cwd(), "README.ko.md"), "utf8");
    const publishing = readFileSync(
      join(process.cwd(), "docs/NPM_PUBLISHING.md"),
      "utf8",
    );
    const backlog = readFileSync(
      join(process.cwd(), "docs/NEXT_BACKLOG.md"),
      "utf8",
    );
    const qualityPlan = readFileSync(
      join(
        process.cwd(),
        "docs/superpowers/plans/2026-07-05-looprelay-95-quality-plan.md",
      ),
      "utf8",
    );
    const packageInstallSmoke = readFileSync(
      join(process.cwd(), "scripts/package-install-smoke.mjs"),
      "utf8",
    );

    expect(cliIndex).toContain("registerBenchmarkCommand(program)");
    expect(benchmarkCommand).toContain('.command("benchmark")');
    expect(benchmarkCommand).toContain('"--baseline-file <path>"');
    expect(benchmarkCommand).toContain('"--report-file <path>"');
    expect(benchmarkCommand).toContain('.command("prepare-fixture")');
    expect(benchmarkCommand).toContain('.command("candidates")');
    for (const status of [
      "no_completed_outcomes",
      "no_attributed_outcomes",
      "incomplete_outcome_evidence",
      "unsafe_outcome_evidence",
      "missing_prompt_records",
    ]) {
      expect(benchmarkCommand).toContain("report.diagnostics");
      expect(benchmarkSpec).toContain(status);
    }
    for (const content of [benchmarkSpec, readme, readmeKo]) {
      expect(content).toContain("looprelay benchmark --json");
      expect(content).toContain("looprelay benchmark candidates --json");
      expect(content).toContain("looprelay benchmark pair-candidates --json");
      expect(content).toContain("looprelay benchmark prepare-fixture");
      expect(content).toContain("looprelay benchmark prepare-pair");
      expect(content).toContain("--baseline-prompt-id");
      expect(content).toContain("--looprelay-prompt-id");
      expect(content).toContain("body-free");
      expect(content).toContain(
        'looprelay benchmark --fixture-set real --fixture-file "$FIXTURE_FILE" --json --report-file "$BASELINE_REPORT"',
      );
    }
    for (const content of [
      benchmarkSpec,
      readme,
      readmeKo,
      publishing,
      backlog,
      qualityPlan,
    ]) {
      expect(content).toContain(
        'looprelay benchmark init-fixture --output "$FIXTURE_FILE"',
      );
      expect(content).toContain(
        'looprelay benchmark --fixture-set real --fixture-file "$FIXTURE_FILE"',
      );
      expect(content).toContain("template_only");
    }
    expect(packageInstallSmoke).toContain(
      '["benchmark", "--fixture-set", "real", "--json"]',
    );
    expect(packageInstallSmoke).toContain('"--runtime-tool"');
    expect(packageInstallSmoke).toContain('"--require-runtime-ready"');
    expect(packageInstallSmoke).toContain(
      "Evidence scope: repeatable_isolated_local_release",
    );
    expect(packageInstallSmoke).toContain('"init-fixture"');
    expect(packageInstallSmoke).toContain('"prepare-fixture"');
    expect(packageInstallSmoke).toContain('"prepare-pair"');
    expect(packageInstallSmoke).toContain('"pair-candidates"');
    expect(packageInstallSmoke).toContain("paired_fixture_candidates");
    expect(packageInstallSmoke).toContain('"--baseline-prompt-id"');
    expect(packageInstallSmoke).toContain('"--looprelay-prompt-id"');
    expect(packageInstallSmoke).toContain("paired_fixture_prepare");
    expect(packageInstallSmoke).toContain('"candidates"');
    expect(packageInstallSmoke).toContain("fixture_candidates");
    expect(packageInstallSmoke).toContain("validateBenchmarkFixtureTemplate");
    expect(packageInstallSmoke).toContain("parsed?.template_only !== true");
    expect(packageInstallSmoke).toContain("outcome.evidence_refs");
    expect(packageInstallSmoke).toContain("effect_pair");
    expect(packageInstallSmoke).toContain("paired_effectiveness");
    expect(packageInstallSmoke).toContain("causal_claim !== false");
    expect(packageInstallSmoke).toContain('"--baseline-file"');
    expect(packageInstallSmoke).toContain('"--report-file"');
    expect(packageInstallSmoke).toContain("validateBenchmarkReportFile");
    expect(packageInstallSmoke).toContain("permissions are not private");
    expect(packageInstallSmoke).toContain("validateBenchmarkIncompatible");
    expect(benchmarkSpec).toContain("fixture_set_or_corpus_mismatch");
    expect(benchmarkSpec).toContain("unreadable_or_invalid_json");
    expect(benchmarkSpec).toContain("non_numeric_scores");
    expect(packageInstallSmoke).toContain('status !== "no_fixtures"');
    expect(packageInstallSmoke).toContain('effectiveness !== "unproven"');
    expect(packageInstallSmoke).toContain("requires_real_outcomes !== true");
  });

  it("keeps the public release surface on 1.0.1", () => {
    const packageJson = JSON.parse(
      readFileSync(join(process.cwd(), "package.json"), "utf8"),
    ) as { version: string };
    const sharedVersion = readFileSync(
      join(process.cwd(), "src/shared/version.ts"),
      "utf8",
    );
    const claudePlugin = readFileSync(
      join(process.cwd(), ".claude-plugin/plugin.json"),
      "utf8",
    );
    const claudeMarketplace = readFileSync(
      join(process.cwd(), ".claude-plugin/marketplace.json"),
      "utf8",
    );
    const changelog = readFileSync(join(process.cwd(), "CHANGELOG.md"), "utf8");
    const publishing = readFileSync(
      join(process.cwd(), "docs/NPM_PUBLISHING.md"),
      "utf8",
    );
    const releaseChecklist = readFileSync(
      join(process.cwd(), "docs/RELEASE_CHECKLIST.md"),
      "utf8",
    );
    const security = readFileSync(join(process.cwd(), "SECURITY.md"), "utf8");
    const benchmarkSpec = readFileSync(
      join(process.cwd(), "docs/BENCHMARK_V1.md"),
      "utf8",
    );
    const implementationPlan = readFileSync(
      join(process.cwd(), "docs/IMPLEMENTATION_PLAN.md"),
      "utf8",
    );
    const prd = readFileSync(join(process.cwd(), "docs/PRD.md"), "utf8");
    const techSpec = readFileSync(
      join(process.cwd(), "docs/TECH_SPEC.md"),
      "utf8",
    );
    const releaseStability = readFileSync(
      join(process.cwd(), "docs/RELEASE_STABILITY_EVIDENCE_2026-07-06.md"),
      "utf8",
    );
    const readme = readFileSync(join(process.cwd(), "README.md"), "utf8");
    const readmeKo = readFileSync(join(process.cwd(), "README.ko.md"), "utf8");

    expect(packageJson.version).toBe("1.0.1");
    for (const content of [sharedVersion, claudePlugin, claudeMarketplace]) {
      expect(content).toContain("1.0.1");
      expect(content).not.toContain("0.1.0-beta.0");
    }
    expect(changelog).toContain("## 1.0.1 - 2026-07-12");
    expect(changelog).toContain("## 1.0.0 - 2026-07-08");
    expect(changelog).not.toContain("currently pre-release");
    expect(changelog).toContain(
      "General PR/main test CI and scheduled UI patrol workflows are removed",
    );
    expect(changelog).toContain(
      "local release gate is the authoritative release and merge signal",
    );
    expect(changelog).not.toContain("GitHub Actions CI matrix");
    expect(changelog).not.toContain("on every push to");
    expect(publishing).toContain("npm publish --tag latest");
    expect(publishing).toContain("npm install -g looprelay");
    expect(publishing).not.toContain('git tag -fa v1.0.0 -m "looprelay 1.0.0"');
    expect(publishing).not.toContain("git push origin v1.0.0 --force");
    expect(publishing).toContain(
      'git tag -a v<new-version> -m "looprelay <new-version>"',
    );
    expect(publishing).not.toContain("looprelay@beta");
    expect(releaseChecklist).toContain("stable public release");
    expect(releaseChecklist).toContain("create a new annotated tag");
    expect(security).toContain("LoopRelay 1.0.0");
    expect(benchmarkSpec).toContain('"version": "1.0.0"');
    expect(implementationPlan).toContain("npm publish --tag latest");
    expect(implementationPlan).toContain(
      "create a new annotated git tag after the full gate",
    );
    expect(implementationPlan).toContain(
      "package.json#engines.node (`>=22.12 <25`)",
    );
    expect(implementationPlan).not.toContain(
      "run the full release gate on Node 22",
    );
    expect(implementationPlan).not.toContain(
      "create the annotated git tag only after the full local release gate passes",
    );
    const implementationReleaseGate = firstShellCodeBlock(
      sectionBetween(implementationPlan, "Default local release gate:"),
    );
    expect(implementationReleaseGate).toEqual([
      "corepack pnpm format",
      "corepack pnpm test",
      "corepack pnpm lint",
      "corepack pnpm build",
      "corepack pnpm pack:dry-run",
      "corepack pnpm --silent benchmark -- --json",
      "corepack pnpm e2e:browser",
      "corepack pnpm smoke:release",
      "corepack pnpm smoke:package-install",
      "corepack pnpm evidence:quality -- --require-complete",
      "corepack pnpm looprelay quality-evidence --require-complete",
      "git diff --check",
    ]);
    for (const content of [implementationPlan, prd, techSpec]) {
      for (const command of [
        "corepack pnpm test",
        "corepack pnpm lint",
        "corepack pnpm build",
        "corepack pnpm --silent benchmark -- --json",
        "corepack pnpm e2e:browser",
        "corepack pnpm smoke:release",
        "corepack pnpm smoke:package-install",
        "corepack pnpm pack:dry-run",
        "corepack pnpm evidence:quality -- --require-complete",
        "corepack pnpm looprelay quality-evidence --require-complete",
        "git diff --check",
      ]) {
        expect(content).toContain(command);
      }
      for (const staleCommand of [
        "\npnpm test\n",
        "\npnpm lint\n",
        "\npnpm build\n",
        "\npnpm benchmark -- --json\n",
        "\npnpm e2e:browser\n",
        "\npnpm smoke:release\n",
        "\npnpm pack:dry-run\n",
      ]) {
        expect(content).not.toContain(staleCommand);
      }
    }
    expect(releaseStability).toContain("looprelay-1.0.0.tgz");
    expect(readme).toContain("LoopRelay 1.0.1");
    expect(readme).not.toContain("pre-release software");
    expect(readmeKo).toContain("LoopRelay 1.0.1");
    expect(readmeKo).not.toContain("pre-release");
  });

  it("keeps the 9.5 ledger tied to effectiveness benchmark evidence", () => {
    const plan = readFileSync(
      join(
        process.cwd(),
        "docs/superpowers/plans/2026-07-05-looprelay-95-quality-plan.md",
      ),
      "utf8",
    );
    const backlog = readFileSync(
      join(process.cwd(), "docs/NEXT_BACKLOG.md"),
      "utf8",
    );

    for (const content of [plan, backlog]) {
      expect(content).toContain("PR #469");
      expect(content).toContain("archive_effectiveness_score");
      expect(content).toContain("28751693022");
      expect(content).toContain("privacy_leak_count: 0");
    }
  });

  it("keeps README verification gates aligned with the package dry-run wrapper", () => {
    const readme = readFileSync(join(process.cwd(), "README.md"), "utf8");
    const readmeKo = readFileSync(join(process.cwd(), "README.ko.md"), "utf8");

    for (const content of [readme, readmeKo]) {
      for (const command of [
        "corepack pnpm format",
        "corepack pnpm test",
        "corepack pnpm lint",
        "corepack pnpm build",
        "corepack pnpm pack:dry-run",
        "corepack pnpm --silent benchmark -- --json",
        "corepack pnpm e2e:browser",
        "corepack pnpm smoke:release",
        "corepack pnpm smoke:package-install",
        "corepack pnpm evidence:quality -- --require-complete",
        "corepack pnpm looprelay quality-evidence --require-complete",
        "git diff --check",
      ]) {
        expect(content).toContain(command);
      }
      expect(content).not.toContain("\npnpm pack:dry-run\n");
    }
  });

  it("keeps README platform validation local-first instead of GitHub Actions based", () => {
    const readme = readFileSync(join(process.cwd(), "README.md"), "utf8");
    const readmeKo = readFileSync(join(process.cwd(), "README.ko.md"), "utf8");

    expect(readme).toContain("Release validation is local-first");
    expect(readme).toContain("Node.js 22 and 24");
    expect(readme).toContain("local release gate documented below");
    expect(readme).not.toContain("Linux x64 through GitHub Actions");
    expect(readme).not.toContain("CI target");

    expect(readmeKo).toContain("release validation은 local-first");
    expect(readmeKo).toContain("Node.js 22와 24");
    expect(readmeKo).toContain("아래에 문서화된 local release gate");
    expect(readmeKo).not.toContain("GitHub Actions의 Linux x64");
    expect(readmeKo).not.toContain("CI 대상");
  });

  it("keeps the README first install path safe before npm publish", () => {
    const readme = readFileSync(join(process.cwd(), "README.md"), "utf8");
    const readmeKo = readFileSync(join(process.cwd(), "README.ko.md"), "utf8");

    expect(readme).toContain("After the npm package is published:");
    expect(readme).toContain(
      "Until then, run the same first coach loop from a local checkout:",
    );
    expect(readme).toContain(
      "git clone https://github.com/wlsdks/looprelay.git",
    );
    expect(readme).toContain("pnpm setup");

    expect(readmeKo).toContain("npm package가 publish된 뒤:");
    expect(readmeKo).toContain(
      "그 전에는 local checkout에서 같은 첫 coach loop를 실행합니다:",
    );
    expect(readmeKo).toContain(
      "git clone https://github.com/wlsdks/looprelay.git",
    );
    expect(readmeKo).toContain("pnpm setup");
  });

  it("keeps the release checklist focused on local-first platform claims", () => {
    const releaseChecklist = readFileSync(
      join(process.cwd(), "docs/RELEASE_CHECKLIST.md"),
      "utf8",
    );

    expect(releaseChecklist).toContain(
      "## Deferred For Broader Platform Claims",
    );
    expect(releaseChecklist).toContain(
      "Do not make broad platform claims before platform-specific smoke is complete",
    );
    expect(releaseChecklist).toContain(
      "`better-sqlite3` install/open/WAL/FTS5 smoke on each claimed release platform",
    );
    expect(releaseChecklist).not.toContain("Deferred For Non-CI Local Beta");
    expect(releaseChecklist).not.toContain(
      "Cross-platform GitHub Actions matrix",
    );
  });

  it("keeps Korean README local development setup aligned with the English quick start", () => {
    const readme = readFileSync(join(process.cwd(), "README.md"), "utf8");
    const readmeKo = readFileSync(join(process.cwd(), "README.ko.md"), "utf8");

    for (const content of [readme, readmeKo]) {
      expect(content).toContain("pnpm install");
      expect(content).toContain("pnpm setup");
      expect(content).toContain("prepare");
      expect(content).toContain(
        "pnpm looprelay setup --profile coach --register-mcp --open-web",
      );
    }
    expect(readmeKo).not.toContain("pnpm build\n```");
  });

  it("keeps Korean README first capture checks aligned with the English quick start", () => {
    const readme = readFileSync(join(process.cwd(), "README.md"), "utf8");
    const readmeKo = readFileSync(join(process.cwd(), "README.ko.md"), "utf8");
    const englishCodexSection = sectionBetween(
      readme,
      "### 3. Add The Codex Marketplace",
    );
    const koreanCodexSection = sectionBetween(
      readmeKo,
      "### 3. Codex Marketplace 추가",
    );
    const englishCaptureSection = sectionBetween(
      readme,
      "### 4. Check Capture",
    );
    const koreanCaptureSection = sectionBetween(
      readmeKo,
      "### 4. Capture 확인",
    );

    for (const content of [englishCodexSection, koreanCodexSection]) {
      expect(content).toContain(
        "looprelay setup --profile coach --register-mcp --open-web",
      );
    }
    for (const content of [englishCaptureSection, koreanCaptureSection]) {
      expect(content).toContain("looprelay doctor claude-code");
      expect(content).toContain("looprelay doctor codex");
      expect(content).toContain("looprelay doctor codex --json");
      expect(content).toContain("status");
      expect(content).toContain("unverified");
      expect(content).toContain("needs_attention");
      expect(content).toContain("looprelay statusline claude-code");
      expect(content).toContain("looprelay buddy --once");
      expect(content).toContain("looprelay coach");
    }
    for (const content of [readme, readmeKo]) {
      expect(content).toContain(
        "quality-evidence --runtime-tool codex --require-runtime-ready",
      );
    }
  });

  it("keeps Korean README MCP troubleshooting aligned with the English first-success path", () => {
    const readme = readFileSync(join(process.cwd(), "README.md"), "utf8");
    const readmeKo = readFileSync(join(process.cwd(), "README.ko.md"), "utf8");
    const englishFirstLoop = sectionBetween(
      readme,
      "## First 3-Minute Continuity Loop",
    );
    const koreanFirstLoop = sectionBetween(
      readmeKo,
      "## 첫 3분 Continuity Loop",
    );

    for (const content of [englishFirstLoop, koreanFirstLoop]) {
      expect(content).toContain(
        "looprelay setup --profile coach --register-mcp --open-web",
      );
      expect(content).toContain("looprelay loop checkpoint --summary");
      expect(content).not.toContain("loop collect --tool");
      expect(content).toContain("claude mcp add");
      expect(content).toContain("codex mcp add");
    }
    expect(koreanFirstLoop).toContain("MCP 등록이 실패");
    expect(koreanFirstLoop).toContain("setup");
    expect(koreanFirstLoop).toContain("먼저");
    expect(koreanFirstLoop).toContain("고급 troubleshooting");
  });

  it("keeps README release smoke commands on packageManager-pinned pnpm", () => {
    const readme = readFileSync(join(process.cwd(), "README.md"), "utf8");
    const readmeKo = readFileSync(join(process.cwd(), "README.ko.md"), "utf8");
    const plan = readFileSync(
      join(
        process.cwd(),
        "docs/superpowers/plans/2026-07-05-looprelay-95-quality-plan.md",
      ),
      "utf8",
    );

    for (const content of [readme, readmeKo]) {
      expect(content).toContain("corepack pnpm smoke:release");
      expect(content).toContain("corepack pnpm e2e:browser");
      expect(content).not.toContain("\npnpm smoke:release\n");
      expect(content).not.toContain("\npnpm e2e:browser\n");
    }
    expect(plan).toContain(
      '"corepack pnpm build && node scripts/loop-memory-approval-dogfood.mjs"',
    );
    expect(plan).not.toContain(
      '"pnpm build && node scripts/loop-memory-approval-dogfood.mjs"',
    );
  });

  it("brands package, bins, and plugin metadata as LoopRelay runtime surfaces", () => {
    const packageJson = readJson<{
      name: string;
      description: string;
      homepage: string;
      bugs: { url: string };
      keywords: string[];
      publishConfig: { access: string };
      repository: { url: string };
      bin: Record<string, string>;
      engines: { node: string };
      devDependencies: Record<string, string>;
    }>("package.json");
    const claudeManifest = readJson<{
      name: string;
      description: string;
      homepage: string;
      repository: string;
      keywords: string[];
    }>(".claude-plugin/plugin.json");
    const codexManifest = readJson<{
      name: string;
      description: string;
      homepage: string;
      repository: string;
      keywords: string[];
      interface: {
        displayName: string;
        shortDescription: string;
        longDescription: string;
      };
    }>("plugins/looprelay/.codex-plugin/plugin.json");
    const positioningEvidence = readFileSync(
      join(process.cwd(), "docs/PRODUCT_POSITIONING_EVIDENCE_2026-07-06.md"),
      "utf8",
    );

    expect(packageJson.name).toBe("looprelay");
    expect(packageJson.bin).toHaveProperty("looprelay");
    expect(packageJson.bin).not.toHaveProperty("loopdeck");
    expect(packageJson.description).toBe(
      "LoopRelay local continuity and evidence layer for long-running coding-agent loops.",
    );
    expect(packageJson.repository.url).toBe(
      "https://github.com/wlsdks/looprelay.git",
    );
    expect(packageJson.homepage).toBe("https://github.com/wlsdks/looprelay");
    expect(packageJson.bugs.url).toBe(
      "https://github.com/wlsdks/looprelay/issues",
    );
    expect(packageJson.keywords).toEqual(
      expect.arrayContaining([
        "looprelay",
        "agent-continuity",
        "loop-engineering",
        "evidence",
        "local-first",
        "codex",
        "claude-code",
        "mcp",
        "worktrees",
      ]),
    );
    expect(packageJson.publishConfig.access).toBe("public");
    expect(packageJson.engines.node).toBe(">=22.12 <25");
    expect(readFileSync(join(process.cwd(), "README.md"), "utf8")).toContain(
      "Node.js `>=22.12 <25`",
    );
    expect(readFileSync(join(process.cwd(), "README.ko.md"), "utf8")).toContain(
      "Node.js `>=22.12 <25`",
    );
    expect(packageJson.devDependencies.react).toBe(
      packageJson.devDependencies["react-dom"],
    );
    expect(positioningEvidence).toContain(
      "`package.json#description`, `homepage`, `bugs`, `keywords`, and `publishConfig.access`",
    );
    expect(positioningEvidence).toContain("agent-continuity");
    expect(positioningEvidence).toContain("local-first");
    expect(positioningEvidence).toContain("publish access is `public`");

    for (const manifest of [claudeManifest, codexManifest]) {
      expect(manifest.name).toBe("looprelay");
      expect(manifest.description).toContain("continuity and evidence");
      expect(manifest.description).not.toContain(
        "agent loop memory and meta-prompting workbench",
      );
      expect(manifest.homepage).toBe("https://github.com/wlsdks/looprelay");
      expect(manifest.repository).toBe("https://github.com/wlsdks/looprelay");
      expect(manifest.keywords).toEqual(
        expect.arrayContaining(["looprelay", "agent-continuity", "evidence"]),
      );
    }

    expect(codexManifest.interface.displayName).toBe("LoopRelay");
    expect(codexManifest.interface.shortDescription).toContain(
      "Local continuity and evidence",
    );
    expect(codexManifest.interface.longDescription).toContain(
      "repeated failure patterns",
    );
  });

  it("ships a Claude Code plugin marketplace and manifest with slash commands", () => {
    const marketplace = readJson<{
      owner: { name: string };
      metadata: { description: string };
      plugins: Array<{
        name: string;
        source: string;
        category: string;
        description: string;
        tags: string[];
      }>;
    }>(".claude-plugin/marketplace.json");
    const manifest = readJson<{
      name: string;
      commands: string[];
    }>(".claude-plugin/plugin.json");

    expect(marketplace.plugins).toContainEqual(
      expect.objectContaining({
        name: "looprelay",
        source: "./",
        category: "memory",
        description: expect.stringContaining("Recover loop state"),
      }),
    );
    expect(marketplace.owner.name).toBe("LoopRelay contributors");
    expect(marketplace.metadata.description).toContain(
      "continuity and evidence",
    );
    expect(marketplace.metadata.description).toContain(
      "long-running Claude Code and Codex loops",
    );
    expect(manifest.name).toBe("looprelay");
    expect(manifest.commands).toEqual([
      "./commands/setup.md",
      "./commands/status.md",
      "./commands/guard.md",
      "./commands/buddy.md",
      "./commands/coach.md",
      "./commands/score.md",
      "./commands/judge.md",
      "./commands/improve-last.md",
      "./commands/habits.md",
      "./commands/open.md",
    ]);
  });

  it("ships Claude Code command docs for setup, status, score, coach, and open", () => {
    const setup = readFileSync(
      join(process.cwd(), "commands/setup.md"),
      "utf8",
    );
    const status = readFileSync(
      join(process.cwd(), "commands/status.md"),
      "utf8",
    );
    const score = readFileSync(
      join(process.cwd(), "commands/score.md"),
      "utf8",
    );
    const coach = readFileSync(
      join(process.cwd(), "commands/coach.md"),
      "utf8",
    );
    const buddy = readFileSync(
      join(process.cwd(), "commands/buddy.md"),
      "utf8",
    );
    const judge = readFileSync(
      join(process.cwd(), "commands/judge.md"),
      "utf8",
    );
    const improveLast = readFileSync(
      join(process.cwd(), "commands/improve-last.md"),
      "utf8",
    );
    const habits = readFileSync(
      join(process.cwd(), "commands/habits.md"),
      "utf8",
    );
    const open = readFileSync(join(process.cwd(), "commands/open.md"), "utf8");
    const guard = readFileSync(
      join(process.cwd(), "commands/guard.md"),
      "utf8",
    );
    const commandDocs = [
      setup,
      status,
      score,
      coach,
      buddy,
      judge,
      improveLast,
      habits,
      open,
      guard,
    ];

    for (const command of commandDocs) {
      const description = command.match(/^description: (?<text>.+)$/m)?.groups
        ?.text;
      const heading = command.match(/^# (?<text>.+)$/m)?.groups?.text;
      expect(description).toContain("LoopRelay");
      expect(description).not.toMatch(/\blooprelay\b/);
      expect(heading).toContain("LoopRelay");
      expect(heading).not.toContain("Loop Memory");
    }

    expect(guard).toContain(
      "looprelay setup --profile coach --rewrite-guard <chosen>",
    );
    expect(guard).toContain("AskUserQuestion");
    expect(guard).toMatch(/off.*context.*ask.*block-and-copy/s);

    expect(setup).toContain(
      "looprelay setup --profile coach --register-mcp --dry-run",
    );
    expect(setup).toContain("command -v looprelay");
    expect(setup).not.toContain("command -v looprelay || command -v looprelay");
    expect(setup).not.toContain("product-name CLI alias");
    expect(setup).toContain("looprelay setup --profile coach --register-mcp");
    expect(setup).toContain("looprelay statusline claude-code");
    expect(setup).toContain("npm package is published");
    expect(setup).toContain(
      "git clone https://github.com/wlsdks/looprelay.git",
    );
    expect(setup).toContain("pnpm setup");
    expect(status).toContain("looprelay doctor claude-code");
    expect(status).not.toContain(
      "looprelay doctor claude-code\nlooprelay doctor claude-code",
    );
    expect(status).toContain("command -v looprelay");
    expect(status).toContain("npm package is published");
    expect(status).toContain(
      "git clone https://github.com/wlsdks/looprelay.git",
    );
    expect(status).toContain("pnpm setup");
    expect(status).not.toContain(
      "command -v looprelay || command -v looprelay",
    );
    expect(status).not.toContain("product-name alias");
    expect(status).toContain("looprelay doctor codex --json");
    expect(status).toContain("status: ready");
    expect(status).toContain("status: unverified");
    expect(status).toContain("status: needs_attention");
    expect(status).toContain("looprelay statusline claude-code");
    expect(buddy).toContain("looprelay buddy");
    expect(buddy).toContain("looprelay buddy --json");
    expect(coach).toContain("looprelay:coach_prompt");
    expect(coach).toContain("looprelay coach --json");
    expect(coach).toContain("looprelay coach --json");
    expect(score).toContain("looprelay score --json");
    expect(score).toContain("looprelay:score_prompt_archive");
    expect(judge).toContain("looprelay:prepare_agent_judge_batch");
    expect(judge).toContain("looprelay:record_agent_judgments");
    expect(judge).toContain("Do not call external providers through looprelay");
    expect(score).toContain("looprelay:score_prompt latest=true");
    expect(score).toContain("looprelay score --latest --json");
    expect(improveLast).toContain("AskUserQuestion");
    expect(improveLast).toContain("looprelay:improve_prompt latest=true");
    expect(improveLast).toContain("looprelay improve --latest --json");
    expect(improveLast).toContain(
      "looprelay:prepare_agent_rewrite latest=true",
    );
    expect(improveLast).toContain("looprelay:record_agent_rewrite");
    expect(improveLast).toContain("Do not auto-submit the rewrite");
    expect(habits).toContain("looprelay:score_prompt_archive");
    expect(open).toContain("http://127.0.0.1:17373");
  });

  it("ships a Codex plugin manifest that is setup-driven instead of bundling active hooks", () => {
    const manifest = readJson<{
      name: string;
      hooks?: string;
      skills: string;
      interface: {
        displayName: string;
        category: string;
        defaultPrompt: string[];
      };
    }>("plugins/looprelay/.codex-plugin/plugin.json");

    expect(manifest.name).toBe("looprelay");
    expect(manifest.hooks).toBeUndefined();
    expect(manifest.skills).toBe("./skills/");
    expect(manifest.interface.displayName).toBe("LoopRelay");
    expect(manifest.interface.category).toBe("Coding");
    expect(manifest.interface.defaultPrompt).toEqual(
      expect.arrayContaining([
        "Recover the current worktree and branch state",
        "Create a continuation brief for the next session",
        "Record the outcome of the latest request",
        "Show recurring failure patterns across recent loops",
        "Propose an approved lesson for memory or AGENTS.md",
      ]),
    );
    expect(manifest.interface.defaultPrompt).not.toContain(
      "Rewrite my latest captured prompt with the active agent session",
    );
    expect(manifest.interface.defaultPrompt).not.toContain(
      "Review my current project AGENTS.md or CLAUDE.md rules",
    );
    expect(manifest.interface.defaultPrompt.join("\n")).toContain("LoopRelay");
  });

  it("uses LoopRelay-facing Codex plugin copy while preserving looprelay ids and setup-driven hook commands", () => {
    const manifest = readJson<{
      name: string;
      hooks?: string;
      skills: string;
      interface: {
        displayName: string;
        shortDescription: string;
        longDescription: string;
        defaultPrompt: string[];
      };
    }>("plugins/looprelay/.codex-plugin/plugin.json");
    const skill = readFileSync(
      join(process.cwd(), "plugins/looprelay/skills/looprelay/SKILL.md"),
      "utf8",
    );

    expect(manifest.name).toBe("looprelay");
    expect(manifest.hooks).toBeUndefined();
    expect(manifest.skills).toBe("./skills/");
    expect(manifest.interface.displayName).toBe("LoopRelay");
    expect(manifest.interface.shortDescription).toContain(
      "Local continuity and evidence",
    );
    expect(manifest.interface.longDescription).toContain("LoopRelay");
    expect(manifest.interface.longDescription).toContain(
      "repeated failure patterns",
    );
    expect(manifest.interface.defaultPrompt).toEqual(
      expect.arrayContaining([
        "Set up LoopRelay for this machine",
        "Check whether LoopRelay is ready for the latest Codex session",
        "Create a continuation brief for the next session",
        "Open my local LoopRelay evidence archive",
      ]),
    );
    expect(manifest.interface.defaultPrompt).not.toEqual(
      expect.arrayContaining([
        expect.stringContaining("looprelay"),
        expect.stringContaining("prompt coach"),
      ]),
    );
    expect(skill).toContain(
      "description: Use when the user wants to install, verify, search, or troubleshoot LoopRelay",
    );
    expect(skill).toContain(
      "Use this skill when the user wants Codex to work with LoopRelay",
    );
    expect(skill).toContain("The single public CLI command is `looprelay`");
    expect(skill).toContain("looprelay setup --profile coach");
    expect(skill).toContain("looprelay install-hook codex");
    const normalizedSkill = skill.replace(/\s+/g, " ");
    expect(normalizedSkill).toContain(
      "If `looprelay` is not available yet because the npm package has not been published",
    );
    expect(skill).toContain(
      "git clone https://github.com/wlsdks/looprelay.git",
    );
    expect(skill).toContain("pnpm setup");
  });

  it("documents the single plugin command namespace without alternate aliases", () => {
    const readme = readFileSync(join(process.cwd(), "README.md"), "utf8");
    const plugins = readFileSync(
      join(process.cwd(), "docs/PLUGINS.md"),
      "utf8",
    );

    expect(readme).toContain("Claude Code slash commands use `/looprelay:*`");
    expect(readme).not.toContain("use the looprelay CLI alias");
    expect(readme).not.toContain("Use the looprelay CLI alias");
    expect(readme).not.toContain("when preferred");
    expect(readme).not.toContain("planned alias-only slash namespace");
    expect(readme).not.toContain("does not ship `/looprelay:*` command files");
    expect(plugins).toContain("Claude Code slash commands use `/looprelay:*`");
    expect(plugins).toContain("canonical `looprelay` CLI");
    expect(plugins).not.toContain("legacy `looprelay` CLI alias");
    expect(plugins).not.toContain("planned alias-only slash namespace");
    expect(plugins).not.toContain(
      "does not include `/looprelay:*` command files",
    );
    expect(plugins).not.toContain("use the looprelay CLI alias");
    expect(plugins).not.toContain("when preferred");
  });

  it("keeps LoopRelay docs from describing product surfaces as looprelay storage or servers", () => {
    const docs = [
      readFileSync(join(process.cwd(), "README.md"), "utf8"),
      readFileSync(join(process.cwd(), "docs/PLUGINS.md"), "utf8"),
      readFileSync(
        join(process.cwd(), "docs/REUSE_LOOP_AUDIT_2026-07-05.md"),
        "utf8",
      ),
    ].join("\n");

    expect(docs).toContain("local LoopRelay storage");
    expect(docs).toContain("LoopRelay MCP server");
    expect(docs).toContain("local LoopRelay web server");
    expect(docs).not.toContain("local looprelay storage");
    expect(docs).not.toContain("looprelay storage only");
    expect(docs).not.toContain("looprelay MCP server");
    expect(docs).not.toContain("local looprelay web server");
  });

  it("keeps active product docs presenting LoopRelay as the service name", () => {
    const activeProductDocs = [
      "README.md",
      "README.ko.md",
      "docs/IMPLEMENTATION_PLAN.md",
      "docs/RELEASE_CHECKLIST.md",
      "docs/TECH_SPEC.md",
    ];

    for (const docPath of activeProductDocs) {
      const doc = readFileSync(join(process.cwd(), docPath), "utf8");
      expect(doc).toContain("LoopRelay");
    }

    const positioning = readFileSync(
      join(process.cwd(), "docs/LOOPRELAY.md"),
      "utf8",
    );
    expect(positioning).toContain("Product name: LoopRelay.");
    expect(positioning).toContain("`looprelay`");
  });

  it("keeps the LoopRelay feature portfolio decisions explicit", () => {
    const positioning = readFileSync(
      join(process.cwd(), "docs/LOOPRELAY.md"),
      "utf8",
    );

    for (const heading of [
      "## Feature Portfolio",
      "### Keep",
      "### Improve",
      "### Build Next",
      "### Defer",
      "### Reject",
    ]) {
      expect(positioning).toContain(heading);
    }

    for (const requiredDecision of [
      "local prompt capture",
      "redacted Markdown archive",
      "deterministic prompt scoring",
      "Codex and Claude Code setup/status guidance",
      "selected worktree/session/branch continuation briefs",
      "user-approved memory and instruction patch workflows",
      "storage capability negotiation",
      "semantic vector memory by default",
      "cloud/team sync",
      "hidden external LLM calls",
      "automatic prompt resubmission",
      "automatic merge/rebase/branch checkout",
    ]) {
      expect(positioning).toContain(requiredDecision);
    }
  });

  it("keeps the LoopRelay data and privacy model explicit", () => {
    const positioning = readFileSync(
      join(process.cwd(), "docs/LOOPRELAY.md"),
      "utf8",
    );

    for (const requiredText of [
      "## Data And Privacy Model",
      "redacted Markdown prompt archive",
      "SQLite/FTS index",
      "loop snapshots",
      "approved loop memories",
      "instruction patch proposals",
      "storage capability registry",
      "prompt bodies remain in the redacted archive",
      "raw local paths are replaced with safe labels or hashes",
      "Provider credentials are never extracted, stored, proxied, or replayed",
      "transcripts and compact summaries are not stored as loop memory",
      "Markdown export of loop state is opt-in and deferred",
    ]) {
      expect(positioning).toContain(requiredText);
    }
  });

  it("keeps the LoopRelay risk and execution plan explicit", () => {
    const positioning = readFileSync(
      join(process.cwd(), "docs/LOOPRELAY.md"),
      "utf8",
    );

    for (const requiredText of [
      "## Risk And Execution Plan",
      "Storage capability drift",
      "MCP registry drift",
      "Privacy regression",
      "Overbuilding autonomy",
      "Runtime compatibility breakage",
      "MVP Slice 1: storage capability negotiation",
      "MVP Slice 2: capability-aware MCP setup/status responses",
      "MVP Slice 3: evidence-first loop memory review",
      "MVP Slice 4: focused Codex and Claude Code smoke coverage",
      "RED: add the narrowest failing test or packaging guard first",
      "GREEN: make the smallest product-aligned change",
      "VERIFY: run the focused test, then broaden to the repo gate",
      "INTEGRATE: commit, push, PR, local gate, review, merge, and prune",
    ]) {
      expect(positioning).toContain(requiredText);
    }
  });

  it("keeps agent instruction docs routed through the LoopRelay product contract", () => {
    const agents = readFileSync(join(process.cwd(), "AGENTS.md"), "utf8");
    const claude = readFileSync(join(process.cwd(), "CLAUDE.md"), "utf8");
    const harness = readFileSync(
      join(process.cwd(), "docs/AGENT-HARNESS.md"),
      "utf8",
    );
    const instructionFiles = readFileSync(
      join(process.cwd(), "docs/INSTRUCTION-FILES.md"),
      "utf8",
    );

    expect(agents).toContain("제품명은 **LoopRelay**");
    expect(agents).toContain("docs/LOOPRELAY.md");
    expect(agents).toContain("docs/LOOPRELAY-RUNTIME-SURFACES.md");
    expect(agents).toContain("docs/AGENT-HARNESS.md");
    expect(agents).toContain("corepack pnpm pack:dry-run");

    expect(claude).toContain("AGENTS.md");
    expect(claude).toContain("LoopRelay");
    expect(claude).toContain("looprelay");
    expect(claude).toContain("docs/INSTRUCTION-FILES.md");

    expect(harness).toContain(
      "LoopRelay's Codex and Claude Code integration contract",
    );
    expect(harness).toContain("local continuity and evidence");
    expect(harness).toContain("hidden external LLM calls");
    expect(harness).toContain("corepack pnpm pack:dry-run");

    expect(instructionFiles).toContain("LoopRelay");
    expect(instructionFiles).toContain("docs/LOOPRELAY-RUNTIME-SURFACES.md");
    expect(instructionFiles).toContain("AGENTS.md");
    expect(instructionFiles).toContain("CLAUDE.md");
  });

  it("keeps active product surfaces branded as LoopRelay", () => {
    const activeSurfacePaths = [
      "package.json",
      "README.md",
      "README.ko.md",
      ".claude-plugin/marketplace.json",
      ".claude-plugin/plugin.json",
      "plugins/looprelay/.codex-plugin/plugin.json",
      "plugins/looprelay/skills/looprelay/SKILL.md",
      "commands/setup.md",
      "commands/status.md",
      "commands/guard.md",
      "commands/buddy.md",
      "commands/coach.md",
      "commands/score.md",
      "commands/judge.md",
      "commands/improve-last.md",
      "commands/habits.md",
      "commands/open.md",
      "docs/LOOPRELAY.md",
      "docs/PLUGINS.md",
      "docs/ARCHITECTURE.md",
      "docs/AGENT-HARNESS.md",
      "docs/TECH_SPEC.md",
      "docs/IMPLEMENTATION_PLAN.md",
      "docs/RELEASE_CHECKLIST.md",
      "src/loop/brief.ts",
    ];
    for (const surfacePath of activeSurfacePaths) {
      const content = readFileSync(join(process.cwd(), surfacePath), "utf8");

      expect(content, surfacePath).toContain("LoopRelay");
    }

    const packageJson = readJson<{ repository: { url: string } }>(
      "package.json",
    );
    expect(packageJson.repository.url).toBe(
      "https://github.com/wlsdks/looprelay.git",
    );
  });

  it("keeps active audit and backlog status copy branded as LoopRelay", () => {
    const docs = [
      readFileSync(join(process.cwd(), "docs/NEXT_BACKLOG.md"), "utf8"),
      readFileSync(
        join(process.cwd(), "docs/LOOPRELAY_GOAL_AUDIT_2026-07-05.md"),
        "utf8",
      ),
    ].join("\n");

    expect(docs).toContain("LoopRelay status");
    expect(docs).not.toContain("empty LoopRelay status");
    expect(docs).not.toContain("generic LoopRelay status.");
  });

  it("keeps the LoopRelay goal audit aligned with merged saved-draft reuse slices", () => {
    const audit = readFileSync(
      join(process.cwd(), "docs/LOOPRELAY_GOAL_AUDIT_2026-07-05.md"),
      "utf8",
    );
    const backlog = readFileSync(
      join(process.cwd(), "docs/NEXT_BACKLOG.md"),
      "utf8",
    );

    for (const expected of ["PR #366", "PR #367", "PR #368"]) {
      expect(audit).toContain(expected);
      expect(backlog).toContain(expected);
    }
    expect(audit).toContain("Already saved");
    expect(audit).toContain("Saved draft");
    expect(audit).not.toContain("The current reuse slice adds");
    expect(audit).not.toContain("| Active slice |");
    expect(backlog).not.toContain("current reuse slice adds");
  });

  it("keeps the reuse audit from carrying stale rerun-only next slices", () => {
    const reuseAudit = readFileSync(
      join(process.cwd(), "docs/REUSE_LOOP_AUDIT_2026-07-05.md"),
      "utf8",
    );

    expect(reuseAudit).toContain("local LoopRelay web server");
    expect(reuseAudit).toContain("No immediate reuse-flow slice remains");
    expect(reuseAudit).toContain("PR #366");
    expect(reuseAudit).toContain("PR #367");
    expect(reuseAudit).toContain("PR #368");
    expect(reuseAudit).not.toContain("Re-run the reuse flow");
  });

  it("keeps the MCP coach loop audit from carrying completed docs and smoke follow-ups", () => {
    const mcpAudit = readFileSync(
      join(process.cwd(), "docs/MCP_COACH_LOOP_AUDIT_2026-07-05.md"),
      "utf8",
    );
    const packageJson = readJson<{ scripts: Record<string, string> }>(
      "package.json",
    );

    expect(packageJson.scripts["smoke:mcp-coach-loop"]).toBe(
      "corepack pnpm build && node scripts/mcp-coach-loop-smoke.mjs",
    );
    expect(mcpAudit).toContain("No immediate MCP coach-loop slice remains");
    expect(mcpAudit).toContain("apply_clarifications");
    expect(mcpAudit).toContain("smoke:mcp-coach-loop");
    expect(mcpAudit).not.toContain(
      "Update MCP/server instructions and docs so the canonical clarification flow",
    );
    expect(mcpAudit).not.toContain("Add a future small smoke harness");
  });

  it("keeps the LoopRelay goal audit and backlog aligned with latest merged evidence", () => {
    const goalAudit = readFileSync(
      join(process.cwd(), "docs/LOOPRELAY_GOAL_AUDIT_2026-07-05.md"),
      "utf8",
    );
    const backlog = readFileSync(
      join(process.cwd(), "docs/NEXT_BACKLOG.md"),
      "utf8",
    );

    expect(goalAudit).toContain(
      "Initial audit baseline commit: `2f99c10 docs: close codex claude dogfood log`",
    );
    expect(goalAudit).not.toContain("Latest merged main commit at audit time");
    for (const prNumber of [
      "#403",
      "#405",
      "#407",
      "#408",
      "#417",
      "#419",
      "#420",
      "#512",
      "#513",
    ]) {
      expect(goalAudit).toContain(`PR ${prNumber}`);
      expect(backlog).toContain(`PR ${prNumber}`);
    }
    expect(backlog).toContain("No immediate MVP reliability slice remains");
    expect(goalAudit).toContain("LoopRelay MVP reliability slices");
    expect(goalAudit).toContain("Local `corepack pnpm ui-patrol`");
    expect(backlog).toContain("Local `corepack pnpm ui-patrol`");
    expect(goalAudit).toContain("9 png files");
    expect(backlog).toContain("9 png files");
    expect(backlog).toMatch(/No\s+immediate MCP coach-loop slice remains/);
    expect(backlog).toMatch(/No\s+immediate reuse-flow slice remains/);
    expect(backlog).toContain("Archive-level effectiveness summary is landed");
    expect(backlog).toContain(
      "One-call coach effectiveness guidance is landed",
    );
    expect(backlog).not.toContain(
      "Archive-level effectiveness summary is the active follow-up",
    );
    expect(backlog).not.toContain(
      "One-call coach effectiveness guidance is the active agent-native follow-up",
    );
    expect(backlog).not.toContain(
      "Update MCP instructions/docs so agents call `apply_clarifications`",
    );
    expect(backlog).not.toContain("Immediate follow-up from the stdio audit");
  });

  it("keeps GitHub Actions removed while preserving local ui-patrol evidence", () => {
    const packageJson = readJson<{
      files: string[];
      scripts: Record<string, string>;
    }>("package.json");
    const goalAudit = readFileSync(
      join(process.cwd(), "docs/LOOPRELAY_GOAL_AUDIT_2026-07-05.md"),
      "utf8",
    );
    const backlog = readFileSync(
      join(process.cwd(), "docs/NEXT_BACKLOG.md"),
      "utf8",
    );
    const plan = readFileSync(
      join(
        process.cwd(),
        "docs/superpowers/plans/2026-07-05-looprelay-95-quality-plan.md",
      ),
      "utf8",
    );
    const todo = readFileSync(join(process.cwd(), "tasks/todo.md"), "utf8");
    const workflowPath = join(process.cwd(), ".github/workflows/ui-patrol.yml");
    const evidenceScriptPath = join(
      process.cwd(),
      "scripts/ui-patrol-evidence.mjs",
    );

    expect(existsSync(workflowPath)).toBe(false);
    expect(existsSync(evidenceScriptPath)).toBe(false);
    expect(packageJson.files).toContain("scripts/ui-patrol.mjs");
    expect(packageJson.files).not.toContain("scripts/ui-patrol-evidence.mjs");
    expect(packageJson.scripts["ui-patrol"]).toBe("node scripts/ui-patrol.mjs");
    expect(packageJson.scripts).not.toHaveProperty("evidence:ui-patrol");
    const latestTodo = sectionBetween(
      todo,
      "## 2026-07-06 LoopRelay CI Workflow Removal",
    );
    expect(backlog).toContain("GitHub Actions workflows are removed");
    expect(backlog).toContain("corepack pnpm ui-patrol");
    expect(backlog).toContain("dogfood:web-user-flow");
    expect(latestTodo).toContain("GitHub Actions");
    expect(latestTodo).toContain("corepack pnpm ui-patrol");
    expect(latestTodo).toContain("dogfood:web-user-flow");
    expect(latestTodo).not.toContain(
      "scheduled `ui-patrol` evidence remains pending",
    );
    expect(latestTodo).not.toContain("corepack pnpm evidence:ui-patrol");
    const remainingPlan = sectionBetween(
      plan,
      "## 9.5 Evidence Completion State",
    );
    expect(remainingPlan).toContain("local browser evidence");
    expect(remainingPlan).not.toContain("scheduled patrol cron");
    expect(remainingPlan).not.toContain("next expected UTC");
    expect(remainingPlan).not.toContain("scheduled-event pass");
    expect(remainingPlan).not.toContain("scheduled `ui-patrol`");
    expect(goalAudit).toContain("PR #419");
    expect(goalAudit).toContain("PR #420");
    expect(goalAudit).toContain("local browser evidence");
    expect(goalAudit).toContain("quality-evidence");
    expect(goalAudit).not.toContain(
      "scheduled `ui-patrol` evidence remains pending",
    );
    expect(goalAudit).not.toContain("first scheduled `ui-patrol` artifact");
    expect(goalAudit).not.toContain("corepack pnpm evidence:ui-patrol");
    expect(backlog).toContain("PR #419");
    expect(backlog).toContain("PR #420");
  });

  it("ships local ui-patrol evidence without treating GitHub Actions as required", () => {
    const packageJson = JSON.parse(
      readFileSync(join(process.cwd(), "package.json"), "utf8"),
    ) as { files: string[] };
    const qualityScript = readFileSync(
      join(process.cwd(), "scripts/quality-95-evidence.mjs"),
      "utf8",
    );
    const readiness = readFileSync(
      join(process.cwd(), "docs/UI_PATROL_SCHEDULE_READINESS_2026-07-06.md"),
      "utf8",
    );
    const backlog = readFileSync(
      join(process.cwd(), "docs/NEXT_BACKLOG.md"),
      "utf8",
    );

    expect(packageJson.files).toContain(
      "docs/UI_PATROL_SCHEDULE_READINESS_2026-07-06.md",
    );
    expect(qualityScript).toContain("local_ui_patrol_evidence");
    expect(qualityScript).toContain("UI_PATROL_SCHEDULE_READINESS_2026-07-06");
    expect(readiness).toContain("GitHub Actions workflows");
    expect(readiness).toContain("Local `ui-patrol` evidence");
    expect(readiness).not.toContain("scheduled_ui_patrol_preflight");
    expect(readiness).not.toContain("does not complete `scheduled_ui_patrol`");
    expect(backlog).toContain("local_ui_patrol_evidence");
    expect(backlog).not.toContain("scheduled_ui_patrol_preflight");
  });

  it("ships native dialog preflight and approved dogfood evidence", () => {
    const packageJson = JSON.parse(
      readFileSync(join(process.cwd(), "package.json"), "utf8"),
    ) as { files: string[] };
    const qualityScript = readFileSync(
      join(process.cwd(), "scripts/quality-95-evidence.mjs"),
      "utf8",
    );
    const audit = readFileSync(
      join(process.cwd(), "docs/NATIVE_DIALOG_DOGFOOD_AUDIT_2026-07-05.md"),
      "utf8",
    );
    const backlog = readFileSync(
      join(process.cwd(), "docs/NEXT_BACKLOG.md"),
      "utf8",
    );

    expect(packageJson.files).toContain(
      "docs/NATIVE_DIALOG_DOGFOOD_AUDIT_2026-07-05.md",
    );
    expect(qualityScript).toContain("native_dialog_preflight");
    expect(audit).toContain("corepack pnpm smoke:mcp-native-dialog");
    expect(audit).toContain("mcp native dialog preflight passed");
    expect(audit).toContain("native_dialog_preflight");
    expect(audit).toContain(
      "LOOPRELAY_NATIVE_DIALOG_APPROVED=1 corepack pnpm dogfood:mcp-native-dialog-approved",
    );
    expect(audit).toContain('interaction_status: "answered"');
    expect(audit).toContain("approved native dialog dogfood passed");
    expect(audit).toContain(
      "completed `native_dialog_approved_dogfood` evidence",
    );
    const goalAudit = readFileSync(
      join(process.cwd(), "docs/LOOPRELAY_GOAL_AUDIT_2026-07-05.md"),
      "utf8",
    );
    expect(goalAudit).toContain("native_dialog_approved_dogfood");
    expect(goalAudit).not.toContain(
      "real answered OS-dialog run still needs operator approval",
    );
    expect(goalAudit).not.toContain("Pending explicit operator approval");
    expect(backlog).toContain("native_dialog_preflight");
    expect(backlog).toContain("approved native-dialog evidence");
  });

  it("ships a repeatable 9.5 quality evidence summary command", () => {
    const packageJson = readJson<{
      files: string[];
      scripts: Record<string, string>;
    }>("package.json");
    const packageContents = readFileSync(
      join(process.cwd(), "docs/PACKAGE_CONTENTS.md"),
      "utf8",
    );
    const releaseChecklist = readFileSync(
      join(process.cwd(), "docs/RELEASE_CHECKLIST.md"),
      "utf8",
    );
    const backlog = readFileSync(
      join(process.cwd(), "docs/NEXT_BACKLOG.md"),
      "utf8",
    );
    const plan = readFileSync(
      join(
        process.cwd(),
        "docs/superpowers/plans/2026-07-05-looprelay-95-quality-plan.md",
      ),
      "utf8",
    );
    const evidenceScript = readFileSync(
      join(process.cwd(), "scripts/quality-95-evidence.mjs"),
      "utf8",
    );
    const localEvidence = readFileSync(
      join(process.cwd(), "docs/LOCAL_95_EVIDENCE_2026-07-06.md"),
      "utf8",
    );
    const readme = readFileSync(join(process.cwd(), "README.md"), "utf8");
    const readmeKo = readFileSync(join(process.cwd(), "README.ko.md"), "utf8");

    expect(packageJson.files).toContain("scripts/quality-95-evidence.mjs");
    expect(packageJson.files).toContain("docs/LOCAL_95_EVIDENCE_2026-07-06.md");
    expect(packageJson.files).toContain(
      "docs/PRODUCT_POSITIONING_EVIDENCE_2026-07-06.md",
    );
    expect(packageJson.files).toContain(
      "docs/UI_PATROL_EVIDENCE_2026-07-06.md",
    );
    expect(packageJson.files).toContain(
      "docs/CODEX_CLAUDE_LOCAL_INTEGRATION_EVIDENCE_2026-07-06.md",
    );
    expect(packageJson.scripts["evidence:quality"]).toBe(
      "node scripts/quality-95-evidence.mjs",
    );
    expect(
      readFileSync(join(process.cwd(), "src/cli/index.ts"), "utf8"),
    ).toContain("registerQualityEvidenceCommand");
    expect(releaseChecklist).toContain(
      "corepack pnpm evidence:quality -- --require-complete",
    );
    expect(releaseChecklist).toContain(
      "corepack pnpm looprelay quality-evidence --require-complete",
    );
    for (const content of [readme, readmeKo]) {
      expect(content).toContain(
        "corepack pnpm looprelay quality-evidence --require-complete",
      );
      expect(content).not.toContain(
        "\npnpm looprelay quality-evidence --require-complete",
      );
    }
    expect(releaseChecklist).toContain(
      "corepack pnpm --silent evidence:quality",
    );
    for (const content of [packageContents, releaseChecklist]) {
      expect(content).toContain("scripts/quality-95-evidence.mjs");
    }
    for (const content of [plan]) {
      expect(content).toContain("docs/LOCAL_95_EVIDENCE_2026-07-06.md");
      expect(content).toContain(
        "docs/PRODUCT_POSITIONING_EVIDENCE_2026-07-06.md",
      );
      expect(content).toContain("docs/UI_PATROL_EVIDENCE_2026-07-06.md");
      expect(content).toContain(
        "docs/CODEX_CLAUDE_LOCAL_INTEGRATION_EVIDENCE_2026-07-06.md",
      );
      expect(content).toContain("PR #478");
      expect(content).toContain("local gate");
      expect(content).toContain("corepack pnpm evidence:quality");
      expect(content).toContain("corepack pnpm --silent evidence:quality");
      expect(content).toContain("node scripts/quality-95-evidence.mjs");
      expect(content).toContain("looprelay quality-evidence --json");
      expect(content).toContain("axis_evidence_coverage");
      expect(content).toContain("scorecard_review_candidates");
      expect(content).toContain("recommended_next_slices");
      expect(content).toContain("release_warnings");
      expect(content).toContain("real benchmark fixtures are missing");
      expect(content).toContain("do not claim real-user effectiveness trends");
      expect(content).toContain("release_gate");
      expect(content).toContain("corepack pnpm format");
      expect(content).toContain("corepack pnpm test");
      expect(content).toContain("corepack pnpm lint");
      expect(content).toContain("corepack pnpm build");
      expect(content).toContain("corepack pnpm pack:dry-run");
      expect(content).toContain("corepack pnpm --silent benchmark -- --json");
      expect(content).toContain("corepack pnpm e2e:browser");
      expect(content).toContain("corepack pnpm smoke:release");
      expect(content).toContain("corepack pnpm smoke:package-install");
      expect(content).toContain(
        "corepack pnpm looprelay quality-evidence --require-complete",
      );
      expect(content).toContain("blocked_by_external_event");
      expect(content).toContain("product_positioning_metadata_alignment");
      expect(content).toContain("manual_ui_patrol_artifact_evidence");
      expect(content).toContain("local_ui_patrol_evidence");
      expect(content).toContain("codex_claude_local_integration_evidence");
      expect(content).toContain("local-first privacy boundary");
      expect(content).toContain("setup/doctor/MCP smoke");
      expect(content).toContain("loop memory");
      expect(content).toContain("release stability");
      expect(content).toContain("web_user_flow_current_main_evidence");
      expect(content).toContain("corepack pnpm dogfood:web-user-flow");
      expect(content).toContain("browser e2e passed");
      expect(content).toContain("privacy_raw_free_regression_sweep");
      expect(content).toContain("108 test files");
      expect(content).toContain("833 tests");
      expect(content).toContain("codex_claude_setup_smoke_refresh");
      expect(content).toContain("corepack pnpm smoke:agent-setup");
      expect(content).toContain("looprelay agent setup smoke passed");
      expect(content).toContain("looprelay_95_quality");
      expect(content).toContain("scorecard_axes");
      expect(content).toContain("native_dialog_approved_dogfood");
      expect(content).toContain("native_dialog_approved_dogfood");
    }
    const normalizedPlan = plan.replace(/\s+/g, " ");
    for (const scorecardAxis of [
      "Product planning and positioning",
      "Local-first privacy boundary",
      "Setup, doctor, and MCP smoke",
      "Loop memory and continuation",
      "Release stability",
      "Codex and Claude Code integration",
      "Web UI and operational evidence",
    ]) {
      expect(normalizedPlan).toContain(`| ${scorecardAxis} | 9.5/10`);
    }
    for (const content of [localEvidence, plan]) {
      const normalizedContent = content.replace(/\s+/g, " ");
      expect(content).toContain("corepack pnpm smoke:hooks");
      expect(content).toContain("hook binary smoke passed");
      expect(content).toContain("corepack pnpm smoke:mcp-coach-loop");
      expect(content).toContain("mcp coach loop smoke passed");
      expect(content).toContain("corepack pnpm dogfood:first-coach-loop");
      expect(content).toContain("first coach loop dogfood passed");
      expect(content).toContain("corepack pnpm dogfood:loop-memory-approval");
      expect(content).toContain("loop memory approval dogfood passed");
      expect(content).toContain("corepack pnpm smoke:release");
      expect(content).toContain("release smoke passed");
      expect(normalizedContent).toContain("quality evidence CLI gate");
      expect(content).toContain("corepack pnpm --silent benchmark -- --json");
      expect(content).toContain("privacy_leak_count: 0");
      expect(content).toContain("archive_effectiveness_score: 1");
    }
    const normalizedLocalEvidence = localEvidence.replace(/\s+/g, " ");
    expect(localEvidence).toContain("## Current Completion Boundary");
    expect(localEvidence).toContain("`corepack pnpm evidence:quality` is now");
    expect(localEvidence).toContain("`complete`");
    expect(normalizedLocalEvidence).toContain("native dialog approved dogfood");
    expect(normalizedLocalEvidence).toContain(
      "operator-approved answer recorded",
    );
    expect(normalizedLocalEvidence).toContain(
      "Run the full release gate before claiming the long-running goal complete.",
    );
    expect(localEvidence).not.toContain("must remain `pending`");
    expect(localEvidence).not.toContain(
      "native dialog approved dogfood still requires explicit operator approval",
    );
    for (const content of [readme, readmeKo]) {
      expect(content).toContain("looprelay quality-evidence");
      expect(content).toContain("looprelay quality-evidence --json");
      expect(content).toContain(
        "looprelay quality-evidence --require-complete",
      );
      expect(content).toContain("recommended next slices");
    }
    expect(evidenceScript).toContain("looprelay_95_quality");
    expect(evidenceScript).toContain("scorecard_axes");
    expect(evidenceScript).toContain("axisEvidenceCoverage");
    expect(evidenceScript).toContain("axis_evidence_coverage");
    expect(evidenceScript).toContain("scorecardReviewCandidates");
    expect(evidenceScript).toContain("scorecard_review_candidates");
    expect(evidenceScript).toContain("scorecard_review");
    expect(evidenceScript).toContain(
      "Review axes whose local evidence is present",
    );
    expect(evidenceScript).toContain("scorecard_level_below_9_5");
    expect(evidenceScript).toContain("blocked_external");
    expect(evidenceScript).toContain("recommendedNextSlices");
    expect(evidenceScript).toContain("readCompletedEvidence");
    expect(evidenceScript).toContain("product_positioning_metadata_alignment");
    expect(evidenceScript).toContain("PRODUCT_POSITIONING_EVIDENCE_2026-07-06");
    expect(evidenceScript).toContain("manual_ui_patrol_artifact_evidence");
    expect(evidenceScript).toContain("UI_PATROL_EVIDENCE_2026-07-06");
    expect(evidenceScript).toContain("codex_claude_local_integration_evidence");
    expect(evidenceScript).toContain(
      "CODEX_CLAUDE_LOCAL_INTEGRATION_EVIDENCE_2026-07-06",
    );
    expect(evidenceScript).toContain("web_user_flow_current_main_evidence");
    expect(evidenceScript).toContain("browser e2e passed");
    expect(evidenceScript).toContain("privacy_raw_free_regression_sweep");
    expect(evidenceScript).toContain("108 test files");
    expect(evidenceScript).toContain("833 tests");
    expect(evidenceScript).toContain("codex_claude_setup_smoke_refresh");
    expect(evidenceScript).toContain("looprelay agent setup smoke passed");
    expect(evidenceScript).toContain("blocked_by_external_event");
    expect(evidenceScript).toContain("below_target");
    expect(evidenceScript).toContain("requireComplete");
    expect(evidenceScript).toContain("pending_operator_approval");
    expect(evidenceScript).toContain(
      "Run the full release gate before claiming the long-running goal complete.",
    );
  });

  it("keeps the active loop snapshot MCP contract branded as LoopRelay", () => {
    const loopSnapshotSchema = readFileSync(
      join(process.cwd(), "docs/LOOP-SNAPSHOT-SCHEMA.md"),
      "utf8",
    );
    const todo = readFileSync(join(process.cwd(), "tasks/todo.md"), "utf8");
    const todoSection = sectionBetween(
      todo,
      "## 2026-07-06 LoopRelay Loop Snapshot MCP Branding",
    );

    expect(loopSnapshotSchema).toContain(
      "LoopRelay MCP loop tools may expose snapshot-derived status and briefs.",
    );
    expect(loopSnapshotSchema).not.toContain("LoopRelay MCP tools may expose");
    expect(todoSection).toContain(
      "PR #439가 CI `test (22)`/`test (24)` 통과 후 merge되었고 branch prune까지 확인됐다.",
    );
    expect(todoSection).toContain("latest main CI run `28745956945`");
  });

  it("ships exact pending checkpoint outcome guidance without a hook backlog claim", () => {
    const loopStatus = readFileSync(
      join(process.cwd(), "src/loop/status.ts"),
      "utf8",
    );
    const loopCommand = readFileSync(
      join(process.cwd(), "src/cli/commands/loop.ts"),
      "utf8",
    );
    const loopFormatters = readFileSync(
      join(process.cwd(), "src/cli/commands/loop-formatters.ts"),
      "utf8",
    );
    const readme = readFileSync(join(process.cwd(), "README.md"), "utf8");
    const readmeKo = readFileSync(join(process.cwd(), "README.ko.md"), "utf8");
    const snapshotSchema = readFileSync(
      join(process.cwd(), "docs/LOOP-SNAPSHOT-SCHEMA.md"),
      "utf8",
    );
    const loopToolDefinitions = readFileSync(
      join(process.cwd(), "src/mcp/loop-tool-definitions.ts"),
      "utf8",
    );

    expect(loopStatus).toContain(
      "When this work reaches a verifiable checkpoint",
    );
    expect(loopStatus).toContain("--snapshot-id");
    expect(loopCommand).toContain('from "./loop-formatters.js"');
    expect(loopFormatters).toContain('"Next actions:"');
    for (const content of [readme, readmeKo]) {
      expect(content).toContain("looprelay loop status");
      expect(content).toContain("outcome backlog");
    }
    expect(snapshotSchema).toContain("intermediate hook snapshot as backlog");
    expect(snapshotSchema).toContain("--used-improvement-prompt");
    expect(loopStatus).toContain("^prmt_[A-Za-z0-9_-]+$");
    expect(loopToolDefinitions).toContain('pattern: "^prmt_[A-Za-z0-9_-]+$"');
    expect(loopToolDefinitions).toContain("only when it was actually used");
  });

  it("keeps the Codex duplicate-hook doctor log tied to merged evidence", () => {
    const todo = readFileSync(join(process.cwd(), "tasks/todo.md"), "utf8");
    const todoSection = sectionBetween(
      todo,
      "## 2026-07-06 Codex Same-File Duplicate Hook Doctor",
    );

    expect(todoSection).toContain(
      "PR #441가 CI `test (22)`/`test (24)` 통과 후 merge되었고 branch prune까지 확인됐다.",
    );
    expect(todoSection).toContain("latest main CI run `28746274401`");
  });

  it("keeps the Codex duplicate-hook recovery log tied to merged evidence", () => {
    const todo = readFileSync(join(process.cwd(), "tasks/todo.md"), "utf8");
    const todoSection = sectionBetween(
      todo,
      "## 2026-07-06 Codex Duplicate Hook Recovery Copy",
    );

    expect(todoSection).toContain(
      "PR #443가 CI `test (22)`/`test (24)` 통과 후 merge되었고 branch prune까지 확인됐다.",
    );
    expect(todoSection).toContain("latest main CI run `28746602316`");
  });

  it("keeps the Codex hook-count doctor evidence log tied to merged evidence", () => {
    const todo = readFileSync(join(process.cwd(), "tasks/todo.md"), "utf8");
    const todoSection = sectionBetween(
      todo,
      "## 2026-07-06 Codex Doctor Hook Count Evidence",
    );

    expect(todoSection).toContain(
      "PR #445가 CI `test (22)`/`test (24)` 통과 후 merge되었고 branch prune까지 확인됐다.",
    );
    expect(todoSection).toContain("latest main CI run `28746879799`");
  });

  it("keeps the improve expected-impact evidence log tied to merged evidence", () => {
    const todo = readFileSync(join(process.cwd(), "tasks/todo.md"), "utf8");
    const todoSection = sectionBetween(
      todo,
      "## 2026-07-06 LoopRelay Improve Expected Impact Evidence",
    );

    expect(todoSection).toContain(
      "PR #447가 CI `test (22)`/`test (24)` 통과 후 merge되었고 branch prune까지 확인됐다.",
    );
    expect(todoSection).toContain("latest main CI run `28747232481`");
  });

  it("keeps the web expected-impact evidence log tied to merged evidence", () => {
    const todo = readFileSync(join(process.cwd(), "tasks/todo.md"), "utf8");
    const todoSection = sectionBetween(
      todo,
      "## 2026-07-06 LoopRelay Web Expected Impact Evidence",
    );

    expect(todoSection).toContain(
      "PR #449가 CI `test (22)`/`test (24)` 통과 후 merge되었고 branch prune까지 확인됐다.",
    );
    expect(todoSection).toContain("latest main CI run `28747568864`");
    expect(todoSection).toContain("`corepack pnpm ui-patrol`");
  });

  it("keeps the expected-impact 9.5 ledger log tied to merged evidence", () => {
    const todo = readFileSync(join(process.cwd(), "tasks/todo.md"), "utf8");
    const todoSection = sectionBetween(
      todo,
      "## 2026-07-06 LoopRelay Expected Impact 9.5 Ledger Refresh",
    );

    expect(todoSection).toContain(
      "PR #451이 CI `test (22)`/`test (24)` 통과 후 merge되었고 branch prune까지 확인됐다.",
    );
    expect(todoSection).toContain("latest main CI run `28747890493`");
  });

  it("keeps the prompt outcome effectiveness log tied to merged evidence", () => {
    const todo = readFileSync(join(process.cwd(), "tasks/todo.md"), "utf8");
    const todoSection = sectionBetween(
      todo,
      "## 2026-07-06 LoopRelay Prompt Outcome Effectiveness Evidence",
    );

    expect(todoSection).toContain(
      "PR #453이 CI `test (22)`/`test (24)` 통과 후 merge되었고 branch prune까지 확인됐다.",
    );
    expect(todoSection).toContain("latest main CI run `28748310489`");
    expect(todoSection).toContain("`corepack pnpm e2e:browser`");
  });

  it("keeps the CLI prompt outcome evidence log tied to merged evidence", () => {
    const todo = readFileSync(join(process.cwd(), "tasks/todo.md"), "utf8");
    const todoSection = sectionBetween(
      todo,
      "## 2026-07-06 LoopRelay CLI Prompt Outcome Evidence",
    );

    expect(todoSection).toContain(
      "PR #455가 CI `test (22)`/`test (24)` 통과 후 merge되었고 branch prune까지 확인됐다.",
    );
    expect(todoSection).toContain("latest main CI run `28748664657`");
    expect(todoSection).toContain("`corepack pnpm e2e:browser`");
  });

  it("keeps the prompt effectiveness verdict log tied to merged evidence", () => {
    const todo = readFileSync(join(process.cwd(), "tasks/todo.md"), "utf8");
    const todoSection = sectionBetween(
      todo,
      "## 2026-07-06 LoopRelay Prompt Effectiveness Verdict",
    );

    expect(todoSection).toContain(
      "PR #457이 CI `test (22)`/`test (24)` 통과 후 merge되었고 branch prune까지 확인됐다.",
    );
    expect(todoSection).toContain("latest main CI run `28749214218`");
    expect(todoSection).toContain("`corepack pnpm ui-patrol`");
  });

  it("keeps the general test CI workflow removed", () => {
    expect(existsSync(join(process.cwd(), ".github/workflows/test.yml"))).toBe(
      false,
    );
  });

  it("keeps better-sqlite3 on the Node 24 release-stability line", () => {
    const packageJson = readJson<{
      dependencies: Record<string, string>;
    }>("package.json");
    const lockfile = readFileSync(
      join(process.cwd(), "pnpm-lock.yaml"),
      "utf8",
    );
    const workspace = readFileSync(
      join(process.cwd(), "pnpm-workspace.yaml"),
      "utf8",
    );
    const prebuildInstallPatch = readFileSync(
      join(process.cwd(), "patches/prebuild-install@7.1.3.patch"),
      "utf8",
    );

    expect(packageJson.dependencies["better-sqlite3"]).toMatch(/^\^12\./);
    expect(lockfile).toContain("better-sqlite3@12.");
    expect(lockfile).not.toContain("better-sqlite3@11.");
    expect(workspace).toContain(
      "prebuild-install@7.1.3: patches/prebuild-install@7.1.3.patch",
    );
    expect(prebuildInstallPatch).toContain("fs.constants.R_OK");
    expect(prebuildInstallPatch).toContain("fs.constants.W_OK");
    expect(prebuildInstallPatch).not.toMatch(/^\+.*fs\.R_OK/m);
    expect(prebuildInstallPatch).not.toMatch(/^\+.*fs\.W_OK/m);
  });

  it("keeps the 9.5 release-stability backlog aligned with merged evidence", () => {
    const packageJson = readJson<{
      files: string[];
    }>("package.json");
    const releaseEvidencePath = "docs/RELEASE_STABILITY_EVIDENCE_2026-07-06.md";
    const backlog = readFileSync(
      join(process.cwd(), "docs/NEXT_BACKLOG.md"),
      "utf8",
    );
    const plan = readFileSync(
      join(
        process.cwd(),
        "docs/superpowers/plans/2026-07-05-looprelay-95-quality-plan.md",
      ),
      "utf8",
    );
    const releaseEvidenceFile = join(process.cwd(), releaseEvidencePath);

    expect(packageJson.files).toContain(releaseEvidencePath);
    expect(existsSync(releaseEvidenceFile)).toBe(true);
    const releaseEvidence = readFileSync(releaseEvidenceFile, "utf8");
    const qualityEvidenceScript = readFileSync(
      join(process.cwd(), "scripts/quality-95-evidence.mjs"),
      "utf8",
    );

    for (const currentEvidence of [
      "PR #425",
      "PR #427",
      "PR #433",
      "PR #434",
      "PR #464",
      "local release gate",
      "docs/RELEASE_STABILITY_EVIDENCE_2026-07-06.md",
      "corepack pnpm smoke:release",
    ]) {
      expect(backlog).toContain(currentEvidence);
      expect(plan).toContain(currentEvidence);
    }

    for (const releaseEvidenceText of [
      "# LoopRelay Release Stability Evidence 2026-07-06",
      "corepack pnpm smoke:release",
      "corepack pnpm pack:dry-run",
      "PR #464",
      "local release gate",
      "corepack pnpm test",
      "corepack pnpm lint",
      "corepack pnpm build",
      "corepack pnpm pack:dry-run",
      "corepack pnpm --silent benchmark -- --json",
      "corepack pnpm e2e:browser",
      "corepack pnpm smoke:release",
      "corepack pnpm smoke:package-install",
      "corepack pnpm evidence:quality -- --require-complete",
      "corepack pnpm looprelay quality-evidence --require-complete",
      "installed `looprelay quality-evidence --require-complete`",
      "expected shipped files",
      "quality evidence CLI gate",
      "git diff --check",
      "local browser evidence",
      "approved native-dialog evidence",
      "Raw prompt bodies, raw local paths, and token-like secrets were not emitted",
    ]) {
      expect(releaseEvidence).toContain(releaseEvidenceText);
    }
    expect(qualityEvidenceScript).toContain(
      'command: "corepack pnpm --silent benchmark -- --json"',
    );
    expect(qualityEvidenceScript).toContain("release_warnings");
    expect(qualityEvidenceScript).toContain("releaseWarningsForLocalEvidence");
    expect(qualityEvidenceScript).toContain(
      "real benchmark fixtures are missing",
    );
    expect(qualityEvidenceScript).toContain(
      "do not claim real-user effectiveness trends",
    );
    expect(qualityEvidenceScript).not.toContain(
      'command: "corepack pnpm benchmark -- --json"',
    );

    for (const staleReleaseEvidence of [
      "operator-approved blocker",
      "Remaining Release-Adjacent Blockers",
      "Scheduled `ui-patrol` artifact evidence is still pending",
      "dogfood:mcp-native-dialog-approved` still requires explicit operator",
      "scheduled `ui-patrol.yml` workflow remains separate operational evidence",
      "with 359 files",
      "with 369 files",
    ]) {
      expect(releaseEvidence).not.toContain(staleReleaseEvidence);
    }

    for (const staleFollowUp of [
      "update the test workflow to `pnpm/action-setup@v6`",
      "Latest main CI after PR #426 still showed",
      "before treating release stability as closer to the 9.5 bar",
    ]) {
      expect(backlog).not.toContain(staleFollowUp);
      expect(plan).not.toContain(staleFollowUp);
    }
  });

  it("ships the LoopRelay 9.5 quality plan and links it from the operational backlog", () => {
    const packageJson = readJson<{
      files: string[];
    }>("package.json");
    const planPath =
      "docs/superpowers/plans/2026-07-05-looprelay-95-quality-plan.md";
    const plan = readFileSync(join(process.cwd(), planPath), "utf8");
    const backlog = readFileSync(
      join(process.cwd(), "docs/NEXT_BACKLOG.md"),
      "utf8",
    );
    const normalizedPlan = plan.replace(/\s+/g, " ");

    expect(packageJson.files).toContain(planPath);
    expect(backlog).toContain(planPath);
    for (const axis of [
      "Product planning and positioning",
      "Local-first privacy boundary",
      "Codex and Claude Code integration",
      "Setup, doctor, and MCP smoke",
      "Loop memory and continuation",
      "Web UI and operational evidence",
      "Release stability",
    ]) {
      expect(plan).toContain(axis);
      expect(plan).toContain("9.5 bar");
    }
    expect(plan).toContain("dogfood:first-coach-loop");
    expect(plan).toContain("dogfood:mcp-native-dialog-approved");
    expect(plan).toContain("native_dialog_approved_dogfood");
    expect(plan).toContain("approved native-dialog dogfood");
    expect(plan).toContain("local `ui-patrol`");
    expect(plan).toContain("GitHub Actions is intentionally absent");
    for (const staleQualityPlanText of [
      "native-dialog approved dogfood pending",
      "native-dialog dogfood as a separate blocker",
      "native dialog dogfood remains pending",
      "remaining external blockers",
      "native dialog approved-run requirement",
      "must not be treated as approved native OS dialog dogfood",
    ]) {
      expect(plan).not.toContain(staleQualityPlanText);
    }
    for (const staleBacklogQualityText of [
      "Remaining 9.5 blockers",
      "remaining 9.5 work",
      "native dialog approved-run requirement",
      "that remaining dogfood step",
      "remaining human-approved answered-dialog dogfood",
      "native-dialog approval checklist",
    ]) {
      expect(backlog).not.toContain(staleBacklogQualityText);
    }
    for (const currentEvidence of [
      "## Evidence Progress Ledger",
      "PR #417",
      "PR #419",
      "PR #421",
      "PR #429",
      "PR #430",
      "PR #433",
      "PR #434",
      "PR #447",
      "PR #449",
      "PR #450",
      "PR #457",
      "PR #458",
      "PR #460",
      "dogfood:loop-memory-approval",
      "dogfood:web-user-flow",
      "expected_impact",
      "prompt-linked outcome evidence",
      "CLI prompt outcome evidence",
      "prompt effectiveness verdict",
      "MCP score_prompt effectiveness evidence",
      "looprelay show\n  --json",
      "`loop_outcomes`",
      "`effectiveness` verdict",
      "`Outcome evidence`",
      "docs/DOGFOOD_CODEX_CLAUDE_2026-07-05.md",
      "docs/DOGFOOD_WEB_USER_FLOW_2026-07-05.md",
      "workflow_dispatch run `28717406758`",
      "PR #464",
      "local release gate",
      "docs/RELEASE_STABILITY_EVIDENCE_2026-07-06.md",
      "corepack pnpm smoke:release",
      "no `schedule` event",
      "9.5 Evidence Completion State",
    ]) {
      expect(normalizedPlan).toContain(currentEvidence.replace(/\s+/g, " "));
    }
    for (const currentBacklogEvidence of [
      "prompt-linked outcome evidence",
      "CLI prompt outcome evidence",
      "Prompt effectiveness verdict",
      "MCP score_prompt effectiveness evidence",
      "`looprelay show --json`",
      "`expected_impact` predictions to actual raw-free loop outcomes",
      "`effectiveness` verdict",
      "effectiveness calibration",
      "PR #464",
      "local release gate",
      "docs/RELEASE_STABILITY_EVIDENCE_2026-07-06.md",
    ]) {
      expect(`${backlog}\n${plan}`.toLowerCase()).toContain(
        currentBacklogEvidence.toLowerCase(),
      );
    }
    expect(plan).not.toMatch(/\bTBD\b|TODO:|implement later|fill in details/i);
  });

  it("ships Codex and Claude Code dogfood evidence for the 9.5 integration bar", () => {
    const packageJson = readJson<{
      files: string[];
    }>("package.json");
    const evidencePath = "docs/DOGFOOD_CODEX_CLAUDE_2026-07-05.md";
    const evidence = readFileSync(join(process.cwd(), evidencePath), "utf8");
    const harness = readFileSync(
      join(process.cwd(), "docs/AGENT-HARNESS.md"),
      "utf8",
    );

    expect(packageJson.files).toContain(evidencePath);
    expect(harness).toContain(evidencePath);
    for (const required of [
      "looprelay setup --profile coach --register-mcp",
      "looprelay doctor codex",
      "looprelay doctor claude-code",
      "dogfood:first-coach-loop",
      "dogfood:loop-memory-approval",
      "smoke:agent-setup",
      "smoke:hooks",
      "smoke:mcp-coach-loop",
      "score_prompt effectiveness evidence",
      "PASS",
      "Privacy Observations",
      "Human-only Remaining Steps",
    ]) {
      expect(evidence).toContain(required);
    }
    expect(harness).toContain("score_prompt effectiveness evidence");
    expect(evidence).not.toContain("/Users/");
    expect(evidence).not.toMatch(/sk-[a-z0-9_-]{6,}/i);
    expect(evidence).not.toMatch(/gh[pousr]_[a-z0-9_]{12,}/i);
  });

  it("ships fresh web user-flow dogfood evidence for the 9.5 web operations bar", () => {
    const packageJson = readJson<{
      files: string[];
      scripts: Record<string, string>;
    }>("package.json");
    const evidencePath = "docs/DOGFOOD_WEB_USER_FLOW_2026-07-05.md";
    const evidence = readFileSync(join(process.cwd(), evidencePath), "utf8");
    const harness = readFileSync(
      join(process.cwd(), "docs/AGENT-HARNESS.md"),
      "utf8",
    );
    const packageContents = readFileSync(
      join(process.cwd(), "docs/PACKAGE_CONTENTS.md"),
      "utf8",
    );
    const backlog = readFileSync(
      join(process.cwd(), "docs/NEXT_BACKLOG.md"),
      "utf8",
    );
    const qualityPlan = readFileSync(
      join(
        process.cwd(),
        "docs/superpowers/plans/2026-07-05-looprelay-95-quality-plan.md",
      ),
      "utf8",
    );

    expect(packageJson.scripts["dogfood:web-user-flow"]).toBe(
      "corepack pnpm e2e:browser",
    );
    expect(packageJson.files).toContain(evidencePath);
    expect(harness).toContain(evidencePath);
    expect(packageContents).toContain(evidencePath);
    expect(backlog).toContain("dogfood:web-user-flow");
    expect(qualityPlan).toContain("dogfood:web-user-flow");
    for (const required of [
      "corepack pnpm dogfood:web-user-flow",
      "fresh current-main pass after PR #465",
      "main CI run `28750766036`",
      "archive",
      "detail",
      "dashboard",
      "coach",
      "projects",
      "mcp",
      "exports",
      "settings",
      "mobile",
      "9 screenshots",
      "Privacy Observations",
    ]) {
      expect(evidence).toContain(required);
    }
    expect(backlog).toContain("fresh current-main web user-flow evidence");
    expect(qualityPlan).toContain("fresh current-main web user-flow evidence");
    expect(evidence).not.toContain("/Users/");
    expect(evidence).not.toMatch(/sk-[a-z0-9_-]{6,}/i);
    expect(evidence).not.toMatch(/gh[pousr]_[a-z0-9_]{12,}/i);
  });

  it("documents /looprelay:* as the active slash namespace", () => {
    const readme = readFileSync(join(process.cwd(), "README.md"), "utf8");
    const readmeKo = readFileSync(join(process.cwd(), "README.ko.md"), "utf8");
    const plugins = readFileSync(
      join(process.cwd(), "docs/PLUGINS.md"),
      "utf8",
    );
    const harness = readFileSync(
      join(process.cwd(), "docs/AGENT-HARNESS.md"),
      "utf8",
    );
    const packageJson = readJson<{ name: string }>("package.json");
    const claudeManifest = readJson<{ name: string; commands: string[] }>(
      ".claude-plugin/plugin.json",
    );
    const codexManifest = readJson<{ name: string }>(
      "plugins/looprelay/.codex-plugin/plugin.json",
    );
    const commandFiles = readdirSync(join(process.cwd(), "commands")).filter(
      (file) => file.endsWith(".md"),
    );

    for (const content of [readme, readmeKo, plugins]) {
      expect(content).toContain("/looprelay:*");
      expect(content).not.toContain("planned alias-only");
      expect(content).not.toContain(
        "does not ship `/looprelay:*` command files",
      );
      expect(content).not.toContain(
        "does not include `/looprelay:*` command files",
      );
    }
    expect(harness).toContain(
      "`/looprelay:*` is the only supported slash namespace",
    );
    expect(harness).not.toContain(
      "`/looprelay:*` is not added until a dedicated namespace migration plan",
    );
    expect(commandFiles).toEqual(
      expect.arrayContaining(["setup.md", "status.md", "coach.md"]),
    );
    expect(claudeManifest.commands).toEqual(
      expect.arrayContaining(["./commands/setup.md", "./commands/status.md"]),
    );
    expect(packageJson.name).toBe("looprelay");
    expect(claudeManifest.name).toBe("looprelay");
    expect(codexManifest.name).toBe("looprelay");
  });

  it("ships the LoopRelay runtime rename plan as historical context", () => {
    const plan = readFileSync(
      join(
        process.cwd(),
        "docs/superpowers/plans/2026-07-04-looprelay-plugin-rename-plan.md",
      ),
      "utf8",
    );

    expect(plan).toContain("LoopRelay");
    expect(plan).toContain("looprelay");
    expect(plan).toContain("package.json");
    expect(plan).toContain(".claude-plugin/plugin.json");
    expect(plan).toContain("plugins/looprelay/.codex-plugin/plugin.json");
    expect(plan).toContain("commands/*.md");
    expect(plan).toContain("README.md");
    expect(plan).toContain("docs/PLUGINS.md");
  });

  it("keeps historical LoopRelay rename issue slices packaged", () => {
    const issuePlanPath =
      "docs/superpowers/plans/2026-07-04-looprelay-plugin-rename-issue-slices.md";
    const packageJson = readJson<{ files: string[] }>("package.json");
    const issuePlan = readFileSync(join(process.cwd(), issuePlanPath), "utf8");

    expect(packageJson.files).toContain(issuePlanPath);
    expect(issuePlan).toContain("LoopRelay");
    expect(issuePlan).toContain("looprelay");
    expect(issuePlan).toContain("Fresh install smoke");
    expect(issuePlan).toContain("TDD proof");
    expect(issuePlan).not.toContain("Make this better");
    expect(issuePlan).not.toContain("sk-proj");
    expect(issuePlan).not.toContain("/Users/");
  });

  it("ships the historical Claude Code namespace decision under LoopRelay naming", () => {
    const decisionPath =
      "docs/superpowers/plans/2026-07-04-looprelay-claude-dual-namespace-decision.md";
    const packageJson = readJson<{ files: string[] }>("package.json");
    const decision = readFileSync(join(process.cwd(), decisionPath), "utf8");
    const claudeManifest = readJson<{ name: string; commands: string[] }>(
      ".claude-plugin/plugin.json",
    );

    expect(packageJson.files).toContain(decisionPath);
    expect(decision).toContain(
      "# LoopRelay Claude Code Dual Namespace Decision",
    );
    expect(decision).toContain("LoopRelay");
    expect(decision).toContain("looprelay");
    expect(decision).toContain(
      "https://code.claude.com/docs/en/plugins-reference",
    );
    expect(decision).not.toContain("Make this better");
    expect(decision).not.toContain("sk-proj");
    expect(decision).not.toContain("/Users/");
    expect(claudeManifest.name).toBe("looprelay");
    expect(claudeManifest.commands).toEqual(
      expect.arrayContaining(["./commands/setup.md"]),
    );
  });

  it("ships the LoopRelay MCP server name decision", () => {
    const decisionPath =
      "docs/superpowers/plans/2026-07-04-looprelay-mcp-server-name-decision.md";
    const packageJson = readJson<{ files: string[] }>("package.json");
    const decision = readFileSync(join(process.cwd(), decisionPath), "utf8");
    const readme = readFileSync(join(process.cwd(), "README.md"), "utf8");
    const readmeKo = readFileSync(join(process.cwd(), "README.ko.md"), "utf8");
    const plugins = readFileSync(
      join(process.cwd(), "docs/PLUGINS.md"),
      "utf8",
    );
    const setupCommand = readFileSync(
      join(process.cwd(), "commands/setup.md"),
      "utf8",
    );
    const webMcpView = readFileSync(
      join(process.cwd(), "src/web/src/mcp-tools-view.tsx"),
      "utf8",
    );

    expect(packageJson.files).toContain(decisionPath);
    expect(decision).toContain("# LoopRelay MCP Server Name Decision");
    expect(decision).toContain("looprelay");
    expect(decision).toContain("codex mcp add <server-name> --");
    expect(decision).toContain("claude mcp add");
    expect(decision).toContain("looprelay mcp");
    expect(decision).toContain("https://developers.openai.com/codex/mcp");
    expect(decision).toContain(
      "https://docs.anthropic.com/en/docs/claude-code/mcp",
    );
    expect(decision).not.toContain("Make this better");
    expect(decision).not.toContain("sk-proj");
    expect(decision).not.toContain("/Users/");

    for (const content of [
      readme,
      readmeKo,
      plugins,
      setupCommand,
      webMcpView,
    ]) {
      expect(content).toContain("looprelay mcp");
      expect(content).toContain("mcp add");
    }
  });

  it("ships historical deprecation readiness under LoopRelay naming", () => {
    const readinessPath =
      "docs/superpowers/plans/2026-07-04-looprelay-deprecation-readiness.md";
    const packageJson = readJson<{ files: string[] }>("package.json");
    const readiness = readFileSync(join(process.cwd(), readinessPath), "utf8");
    const readme = readFileSync(join(process.cwd(), "README.md"), "utf8");
    const plugins = readFileSync(
      join(process.cwd(), "docs/PLUGINS.md"),
      "utf8",
    );
    const claudeManifest = readJson<{ name: string; commands: string[] }>(
      ".claude-plugin/plugin.json",
    );
    const codexManifest = readJson<{ name: string }>(
      "plugins/looprelay/.codex-plugin/plugin.json",
    );

    expect(packageJson.files).toContain(readinessPath);
    expect(readiness).toContain("# LoopRelay Deprecation Readiness");
    expect(readiness).toContain("LoopRelay");
    expect(readiness).toContain("Alias-only release note template");
    expect(readiness).toContain("Deprecation release note template");
    expect(readiness).toContain("Breaking release note template");
    expect(readiness).toContain("saved slash command snippets");
    expect(readiness).toContain("minimum evidence before deprecation");
    expect(readiness).toContain("rollback");
    expect(readiness).toContain("upgrade smoke");
    expect(readiness).toContain("looprelay");
    expect(readiness).not.toContain("Make this better");
    expect(readiness).not.toContain("sk-proj");
    expect(readiness).not.toContain("/Users/");
    expect(readme).toContain("/looprelay:*");
    expect(plugins).toContain("/looprelay:*");
    expect(claudeManifest.name).toBe("looprelay");
    expect(codexManifest.name).toBe("looprelay");
    expect(claudeManifest.commands).toEqual(
      expect.arrayContaining(["./commands/setup.md"]),
    );
  });

  it("ships the next runtime value slice before leaving rename work", () => {
    const nextSlicePath =
      "docs/superpowers/plans/2026-07-04-looprelay-next-runtime-value-slice.md";
    const packageJson = readJson<{ files: string[] }>("package.json");
    const nextSlice = readFileSync(join(process.cwd(), nextSlicePath), "utf8");

    expect(packageJson.files).toContain(nextSlicePath);
    expect(nextSlice).toContain("# LoopRelay Next Runtime Value Slice");
    expect(nextSlice).toContain(
      "Decision: Selected Worktree Continuation Brief Parity",
    );
    expect(nextSlice).toContain("not a rename slice");
    expect(nextSlice).toContain("CLI `loop brief`");
    expect(nextSlice).toContain("MCP `prepare_loop_brief`");
    expect(nextSlice).toContain("worktree");
    expect(nextSlice).toContain("session");
    expect(nextSlice).toContain("branch");
    expect(nextSlice).toContain("TDD first target");
    expect(nextSlice).toContain("prompt bodies");
    expect(nextSlice).toContain("raw paths");
    expect(nextSlice).not.toContain("Make this better");
    expect(nextSlice).not.toContain("sk-proj");
    expect(nextSlice).not.toContain("/Users/");
  });

  it("documents the LoopRelay repositioning before replacing older branding", () => {
    const specPath =
      "docs/superpowers/specs/2026-07-05-looprelay-repositioning-design.md";
    const packageJson = readJson<{ files: string[] }>("package.json");
    const spec = readFileSync(join(process.cwd(), specPath), "utf8");

    expect(packageJson.files).toContain(specPath);
    expect(spec).toContain("# LoopRelay Repositioning Design");
    expect(spec).toContain("Product name: LoopRelay");
    expect(spec).toContain("coding-agent continuity and evidence layer");
    expect(spec).toContain("loop-aware continuation");
    expect(spec).toContain("Keep `looprelay`");
    expect(spec).toContain("TDD");
    expect(spec).not.toContain("TODO");
    expect(spec).not.toContain("TBD");
    expect(spec).not.toContain("sk-proj");
    expect(spec).not.toContain("/Users/");
  });

  it("ships the LoopRelay product contract and runtime surface guide", () => {
    const contractPath = "docs/LOOPRELAY.md";
    const surfaceGuidePath = "docs/LOOPRELAY-RUNTIME-SURFACES.md";
    const packageJson = readJson<{ files: string[] }>("package.json");
    const contract = readFileSync(join(process.cwd(), contractPath), "utf8");
    const surfaceGuide = readFileSync(
      join(process.cwd(), surfaceGuidePath),
      "utf8",
    );
    const readme = readFileSync(join(process.cwd(), "README.md"), "utf8");
    const readmeKo = readFileSync(join(process.cwd(), "README.ko.md"), "utf8");

    expect(packageJson.files).toContain(contractPath);
    expect(packageJson.files).toContain(surfaceGuidePath);
    expect(contract).toContain("# LoopRelay");
    expect(contract).toContain("Product name: LoopRelay");
    expect(contract).toContain("local continuity and evidence layer");
    expect(contract).toContain("continuation brief");
    expect(contract).toContain("Do not auto-submit");
    expect(surfaceGuide).toContain("# LoopRelay Runtime Surfaces");
    expect(surfaceGuide).toContain("Product name: LoopRelay");
    expect(surfaceGuide).toContain("npm package and CLI: `looprelay`");
    expect(readme.startsWith("# LoopRelay")).toBe(true);
    expect(readme).toContain(
      "Local continuity and evidence for long-running Codex and Claude Code loops.",
    );
    expect(readme).toContain("continuation brief");
    expect(readmeKo.startsWith("# LoopRelay")).toBe(true);
    expect(readmeKo).toContain(
      "장기 Codex·Claude Code 루프를 위한 로컬 continuity와 evidence.",
    );
    expect(readmeKo).toContain("continuation brief");
  });

  it("keeps shipped core docs aligned with the LoopRelay product contract", () => {
    const packageJson = readJson<{ files: string[] }>("package.json");
    const docs = [
      "docs/ARCHITECTURE.md",
      "docs/AGENT-HARNESS.md",
      "docs/PLUGINS.md",
      "docs/TECH_SPEC.md",
    ];

    for (const docPath of docs) {
      expect(packageJson.files).toContain(docPath);
      const doc = readFileSync(join(process.cwd(), docPath), "utf8");
      expect(doc).toContain("LoopRelay");
      expect(doc).toMatch(
        /continuity\s+and\s+evidence|continuity와\s+evidence/,
      );
      expect(doc).toContain("`looprelay`");
      expect(doc).not.toContain(
        "LoopRelay is a local-first agent loop memory and meta-prompting workbench",
      );
    }
  });

  it("ships a machine-checkable LoopRelay runtime id inventory", () => {
    const inventoryPath =
      "docs/superpowers/plans/2026-07-04-looprelay-runtime-id-inventory.json";
    const packageJson = readJson<{
      name: string;
      bin: Record<string, string>;
      files: string[];
    }>("package.json");
    const claudeManifest = readJson<{
      name: string;
      commands: string[];
    }>(".claude-plugin/plugin.json");
    const codexManifest = readJson<{
      name: string;
      interface: { displayName: string };
      hooks?: string;
    }>("plugins/looprelay/.codex-plugin/plugin.json");
    const inventory = readJson<{
      schema_version: 1;
      package: {
        name: string;
        bins: Record<string, string>;
      };
      claude_code_plugin: {
        manifest_name: string;
        command_files: string[];
        slash_namespace: string;
      };
      codex_plugin: {
        manifest_name: string;
        display_name: string;
        install_path: string;
        hook_install: string;
      };
      mcp: {
        canonical_server_name: string;
        command: string;
        docs: string[];
      };
      invariants: string[];
      privacy_exclusions: string[];
    }>(inventoryPath);

    const commandFiles = readdirSync(join(process.cwd(), "commands"))
      .filter((file) => file.endsWith(".md"))
      .map((file) => `./commands/${file}`)
      .sort();

    expect(packageJson.files).toContain(inventoryPath);
    expect(inventory.schema_version).toBe(1);
    expect(inventory.package.name).toBe(packageJson.name);
    expect(inventory.package.bins).toMatchObject({
      looprelay: packageJson.bin.looprelay,
      "lr-claude": packageJson.bin["lr-claude"],
      "lr-codex": packageJson.bin["lr-codex"],
    });
    expect(inventory.claude_code_plugin.manifest_name).toBe(
      claudeManifest.name,
    );
    expect(inventory.claude_code_plugin.command_files.slice().sort()).toEqual(
      claudeManifest.commands.slice().sort(),
    );
    expect(inventory.claude_code_plugin.command_files.slice().sort()).toEqual(
      commandFiles,
    );
    expect(inventory.claude_code_plugin.slash_namespace).toBe("/looprelay:*");
    expect(inventory.codex_plugin.manifest_name).toBe(codexManifest.name);
    expect(inventory.codex_plugin.display_name).toBe(
      codexManifest.interface.displayName,
    );
    expect(inventory.codex_plugin.install_path).toBe("plugins/looprelay");
    expect(codexManifest.hooks).toBeUndefined();
    expect(inventory.codex_plugin.hook_install).toBe(
      "looprelay setup --profile coach --register-mcp --open-web",
    );
    expect(inventory.mcp.canonical_server_name).toBe("looprelay");
    expect(inventory.mcp.command).toBe("looprelay mcp");
    expect(inventory.mcp.docs).toEqual(
      expect.arrayContaining(["README.md", "README.ko.md", "docs/PLUGINS.md"]),
    );
    expect(inventory.invariants).toEqual(
      expect.arrayContaining([
        "Use /looprelay:* for Claude Code commands.",
        "Use looprelay for package, CLI, plugin, hook, and MCP runtime ids.",
        "Use lr-claude and lr-codex for wrapper binaries.",
      ]),
    );
    expect(inventory.privacy_exclusions).toEqual(
      expect.arrayContaining([
        "prompt bodies",
        "raw paths",
        "provider credentials",
      ]),
    );
    expect(JSON.stringify(inventory)).not.toContain("Make this better");
    expect(JSON.stringify(inventory)).not.toContain("sk-proj");
    expect(JSON.stringify(inventory)).not.toContain("/Users/");
  });

  it("does not ship active Codex plugin hooks that can duplicate setup-installed hooks", () => {
    const manifest = readJson<{ hooks?: string }>(
      "plugins/looprelay/.codex-plugin/plugin.json",
    );
    const pluginsDoc = readFileSync(
      join(process.cwd(), "docs/PLUGINS.md"),
      "utf8",
    );
    const renamePlan = readFileSync(
      join(
        process.cwd(),
        "docs/superpowers/plans/2026-07-04-looprelay-plugin-rename-plan.md",
      ),
      "utf8",
    );
    const renameIssueSlices = readFileSync(
      join(
        process.cwd(),
        "docs/superpowers/plans/2026-07-04-looprelay-plugin-rename-issue-slices.md",
      ),
      "utf8",
    );

    expect(manifest.hooks).toBeUndefined();
    expect(pluginsDoc).toContain(
      "does not bundle active Codex hooks; setup installs user-level hooks explicitly",
    );
    expect(pluginsDoc).not.toContain("hooks.json for fail-open Codex");
    expect(renamePlan).not.toContain("plugins/looprelay/hooks.json");
    expect(renameIssueSlices).not.toContain("plugins/looprelay/hooks.json");
  });

  it("ships a hook binary smoke for the looprelay entrypoint", () => {
    const packageJson = readJson<{
      bin: Record<string, string>;
      files: string[];
      scripts: Record<string, string>;
    }>("package.json");
    const smoke = readFileSync(
      join(process.cwd(), "scripts/hook-binary-smoke.mjs"),
      "utf8",
    );

    expect(packageJson.bin["looprelay"]).toBe("./dist/cli/index.js");
    expect(Object.keys(packageJson.bin).sort()).toEqual([
      "looprelay",
      "lr-claude",
      "lr-codex",
    ]);
    expect(packageJson.files).toContain("scripts/hook-binary-smoke.mjs");
    expect(packageJson.scripts["smoke:hooks"]).toBe(
      "corepack pnpm build && node scripts/hook-binary-smoke.mjs",
    );
    expect(smoke).toContain("looprelay");
    expect(smoke).toContain("hook claude-code");
    expect(smoke).toContain("hook codex");
    expect(smoke).toContain("hook status");
    expect(smoke).toContain("LOOPRELAY_SMOKE_SECRET");
    expect(smoke).toContain("assertNotIncludes");
    expect(smoke).toContain("sk-proj");
    expect(smoke).not.toContain("/Users/");
  });

  it("ships a focused Codex and Claude Code setup doctor smoke", () => {
    const packageJson = readJson<{
      files: string[];
      scripts: Record<string, string>;
    }>("package.json");
    const smoke = readFileSync(
      join(process.cwd(), "scripts/agent-setup-smoke.mjs"),
      "utf8",
    );
    const harness = readFileSync(
      join(process.cwd(), "docs/AGENT-HARNESS.md"),
      "utf8",
    );
    const packageContents = readFileSync(
      join(process.cwd(), "docs/PACKAGE_CONTENTS.md"),
      "utf8",
    );

    expect(packageJson.files).toContain("scripts/agent-setup-smoke.mjs");
    expect(packageJson.scripts["smoke:agent-setup"]).toBe(
      "corepack pnpm build && node scripts/agent-setup-smoke.mjs",
    );
    expect(smoke).toContain(
      "Run `corepack pnpm build` before agent setup smoke.",
    );
    expect(smoke).not.toContain("Run `pnpm build` before agent setup smoke.");
    expect(smoke).toContain("setup --profile coach --register-mcp");
    expect(smoke).toContain("doctor claude-code");
    expect(smoke).toContain("doctor codex");
    expect(smoke).toContain("looprelay agent setup smoke passed");
    expect(smoke).not.toContain("/Users/");
    expect(harness).toContain("corepack pnpm smoke:agent-setup");
    expect(packageContents).toContain("scripts/agent-setup-smoke.mjs");
  });

  it("ships a no-dialog MCP native fallback preflight smoke", () => {
    const packageJson = readJson<{
      files: string[];
      scripts: Record<string, string>;
    }>("package.json");
    const smoke = readFileSync(
      join(process.cwd(), "scripts/mcp-native-dialog-preflight.mjs"),
      "utf8",
    );

    expect(packageJson.files).toContain(
      "scripts/mcp-native-dialog-preflight.mjs",
    );
    expect(packageJson.scripts["smoke:mcp-native-dialog"]).toBe(
      "corepack pnpm build && node scripts/mcp-native-dialog-preflight.mjs",
    );
    expect(smoke).toContain("allow_native_dialog");
    expect(smoke).toContain("interaction_status");
    expect(smoke).toContain("unsupported");
    expect(smoke).toContain("without opening an OS dialog");
    expect(smoke).not.toContain("LOOPRELAY_NATIVE_DIALOG=1");
    expect(smoke).not.toContain("/Users/");
  });

  it("ships an operator-approved native dialog dogfood harness", () => {
    const packageJson = readJson<{
      files: string[];
      scripts: Record<string, string>;
    }>("package.json");
    const smoke = readFileSync(
      join(process.cwd(), "scripts/mcp-native-dialog-approved.mjs"),
      "utf8",
    );

    expect(packageJson.files).toContain(
      "scripts/mcp-native-dialog-approved.mjs",
    );
    expect(packageJson.scripts["dogfood:mcp-native-dialog-approved"]).toBe(
      "corepack pnpm build && node scripts/mcp-native-dialog-approved.mjs",
    );
    expect(packageJson.scripts["dogfood:mcp-native-dialog-refusal"]).toBe(
      "corepack pnpm build && node scripts/mcp-native-dialog-approved.mjs",
    );
    expect(smoke).toContain("LOOPRELAY_NATIVE_DIALOG_APPROVED");
    expect(smoke).toContain("Refusing to open a native OS dialog");
    expect(smoke).toContain("allow_native_dialog: true");
    expect(smoke).toContain("LOOPRELAY_NATIVE_DIALOG");
    expect(smoke).toContain("answered");
    expect(smoke).not.toContain("/Users/");
  });

  it("ships a repeatable MCP coach loop smoke for stored prompt flows", () => {
    const packageJson = readJson<{
      files: string[];
      scripts: Record<string, string>;
    }>("package.json");
    const smoke = readFileSync(
      join(process.cwd(), "scripts/mcp-coach-loop-smoke.mjs"),
      "utf8",
    );

    expect(packageJson.files).toContain("scripts/mcp-coach-loop-smoke.mjs");
    expect(packageJson.scripts["smoke:mcp-coach-loop"]).toBe(
      "corepack pnpm build && node scripts/mcp-coach-loop-smoke.mjs",
    );
    expect(smoke).toContain("score_prompt");
    expect(smoke).toContain("coach_prompt");
    expect(smoke).toContain("Effectiveness evidence");
    expect(smoke).toContain("unmeasured prompt");
    expect(smoke).toContain("smoke:mcp-coach-loop");
    expect(smoke).toContain("used_improvement_prompt_ids: [promptId]");
    expect(smoke).toContain("createPromptImprovementDraft(promptId");
    expect(smoke).toContain("improve_prompt");
    expect(smoke).toContain("apply_clarifications");
    expect(smoke).toContain("record_clarifications");
    expect(smoke).toContain("returns_stored_prompt_body");
    expect(smoke).not.toContain("/Users/");
  });

  it("ships a first coach loop dogfood smoke for real CLI prompt and loop flow", () => {
    const packageJson = readJson<{
      files: string[];
      scripts: Record<string, string>;
    }>("package.json");
    const smoke = readFileSync(
      join(process.cwd(), "scripts/first-coach-loop-dogfood.mjs"),
      "utf8",
    );
    const harness = readFileSync(
      join(process.cwd(), "docs/AGENT-HARNESS.md"),
      "utf8",
    );
    const packageContents = readFileSync(
      join(process.cwd(), "docs/PACKAGE_CONTENTS.md"),
      "utf8",
    );
    const browserSmoke = readFileSync(
      join(process.cwd(), "scripts/browser-e2e.mjs"),
      "utf8",
    );

    expect(packageJson.files).toContain("scripts/first-coach-loop-dogfood.mjs");
    expect(packageJson.scripts["dogfood:first-coach-loop"]).toBe(
      "corepack pnpm build && node scripts/first-coach-loop-dogfood.mjs",
    );
    expect(smoke).toContain("hook codex");
    expect(smoke).toContain("coach --json");
    expect(smoke).toContain("loop collect --json");
    expect(smoke).toContain("loop outcome --json");
    expect(smoke).toContain("loop memory-candidate --json");
    expect(smoke).toContain('"--snapshot-id"');
    expect(smoke).toContain("loop brief --json");
    expect(browserSmoke).toContain("Approve selected memory");
    expect(browserSmoke).toContain("browser-newer-unrelated");
    expect(
      readFileSync(join(process.cwd(), "src/cli/commands/loop.ts"), "utf8"),
    ).toContain('.command("outcome")');
    expect(
      readFileSync(
        join(process.cwd(), "scripts/package-install-smoke.mjs"),
        "utf8",
      ),
    ).toContain('["checkpoint", "outcome"]');
    expect(smoke).toContain("LOOPRELAY_FIRST_LOOP_SECRET");
    expect(smoke).toContain("assertNotIncludes");
    expect(smoke).toContain("first coach loop dogfood passed");
    expect(smoke).not.toContain("/Users/");
    expect(harness).toContain("corepack pnpm dogfood:first-coach-loop");
    expect(packageContents).toContain("scripts/first-coach-loop-dogfood.mjs");
  });

  it("ships a loop memory approval dogfood for evidence-backed memory and instruction patch flow", () => {
    const packageJson = readJson<{
      files: string[];
      scripts: Record<string, string>;
    }>("package.json");
    const smoke = readFileSync(
      join(process.cwd(), "scripts/loop-memory-approval-dogfood.mjs"),
      "utf8",
    );
    const harness = readFileSync(
      join(process.cwd(), "docs/AGENT-HARNESS.md"),
      "utf8",
    );
    const packageContents = readFileSync(
      join(process.cwd(), "docs/PACKAGE_CONTENTS.md"),
      "utf8",
    );
    const releaseChecklist = readFileSync(
      join(process.cwd(), "docs/RELEASE_CHECKLIST.md"),
      "utf8",
    );

    expect(packageJson.files).toContain(
      "scripts/loop-memory-approval-dogfood.mjs",
    );
    expect(packageJson.scripts["dogfood:loop-memory-approval"]).toBe(
      "corepack pnpm build && node scripts/loop-memory-approval-dogfood.mjs",
    );
    expect(smoke).toContain("record_loop_outcome");
    expect(smoke).toContain("propose_loop_memory_candidate");
    expect(smoke).toContain("record_loop_memory");
    expect(smoke).toContain("snapshot_id: snapshot.id");
    expect(smoke).toContain("propose_instruction_patch");
    expect(smoke).toContain("LOOPRELAY_LOOP_MEMORY_SECRET");
    expect(smoke).toContain("assertNotIncludes");
    expect(smoke).toContain("loop memory approval dogfood passed");
    expect(smoke).not.toContain("/Users/");
    expect(harness).toContain("corepack pnpm dogfood:loop-memory-approval");
    expect(packageContents).toContain(
      "scripts/loop-memory-approval-dogfood.mjs",
    );
    expect(releaseChecklist).toContain(
      "`scripts/loop-memory-approval-dogfood.mjs`",
    );
  });

  it("does not ship a scheduled UI patrol workflow", () => {
    const packageJson = readJson<{
      files: string[];
      scripts: Record<string, string>;
    }>("package.json");

    expect(
      existsSync(join(process.cwd(), ".github/workflows/ui-patrol.yml")),
    ).toBe(false);
    expect(packageJson.files).toContain("scripts/ui-patrol.mjs");
    expect(packageJson.files).not.toContain("scripts/ui-patrol-evidence.mjs");
    expect(packageJson.scripts["ui-patrol"]).toBe("node scripts/ui-patrol.mjs");
    expect(packageJson.scripts).not.toHaveProperty("evidence:ui-patrol");
  });

  it("documents Claude Code as a hook integration without embedding secrets", () => {
    const readme = readFileSync(
      join(process.cwd(), "integrations/claude-code/README.md"),
      "utf8",
    );
    const example = readJson<{
      hooks: {
        UserPromptSubmit: Array<{
          hooks: Array<{ command: string }>;
        }>;
      };
    }>("integrations/claude-code/settings.example.json");

    const normalizedReadme = readme.replace(/\s+/g, " ");
    expect(normalizedReadme).toContain(
      "If `looprelay` is not available yet because the npm package has not been published",
    );
    expect(readme).toContain(
      "git clone https://github.com/wlsdks/looprelay.git",
    );
    expect(readme).toContain("pnpm setup");

    const command = example.hooks.UserPromptSubmit[0]?.hooks[0]?.command ?? "";
    expect(command).toContain("looprelay hook claude-code");
    expect(command).toContain("|| true");
    expect(command).not.toMatch(/LOOPRELAY_TOKEN|Bearer|token=/i);
  });

  it("includes plugin artifacts in npm package files", () => {
    const packageJson = readJson<{
      bin: Record<string, string>;
      files: string[];
    }>("package.json");

    expect(packageJson.bin).toMatchObject({
      looprelay: "./dist/cli/index.js",
      "lr-claude": "./dist/cli/lr-claude.js",
      "lr-codex": "./dist/cli/lr-codex.js",
    });
    expect(packageJson.files).toContain(".claude-plugin");
    expect(packageJson.files).toContain("commands");
    expect(packageJson.files).toContain("plugins");
    expect(packageJson.files).toContain("integrations");
    expect(packageJson.files).toContain("docs/ARCHITECTURE.md");
    expect(packageJson.files).toContain("docs/PLUGINS.md");
    expect(packageJson.files).toContain("docs/LOOPRELAY.md");
    expect(packageJson.files).toContain("docs/LOOPRELAY-RUNTIME-SURFACES.md");
    expect(packageJson.files).toContain("docs/LOOP-SNAPSHOT-SCHEMA.md");
    expect(packageJson.files).toContain("docs/AGENT-HARNESS.md");
    expect(packageJson.files).toContain("docs/INSTRUCTION-FILES.md");
    expect(packageJson.files).toContain(
      "docs/benchmark-fixtures/real.example.json",
    );
    expect(packageJson.files).toContain(
      "docs/superpowers/plans/2026-07-04-looprelay-plugin-rename-plan.md",
    );
    expect(packageJson.files).toContain("docs/LEGAL_USAGE_GUIDE.md");
  });

  it("documents looprelay as the primary CLI command", () => {
    const readme = readFileSync(join(process.cwd(), "README.md"), "utf8");
    const readmeKo = readFileSync(join(process.cwd(), "README.ko.md"), "utf8");
    const packageContents = readFileSync(
      join(process.cwd(), "docs/PACKAGE_CONTENTS.md"),
      "utf8",
    );

    for (const content of [readme, readmeKo, packageContents]) {
      expect(content).toContain("looprelay");
    }
    expect(readme).toContain("`looprelay` is the only public CLI identity");
    expect(readmeKo).toContain("공개 CLI identity는 `looprelay` 하나뿐");
    expect(packageContents).toContain("compiled `looprelay` CLI entrypoint");
    expect(packageContents).toContain("docs/LOOPRELAY-RUNTIME-SURFACES.md");
  });

  it("ships the canonical LoopRelay runtime surface contract", () => {
    const allowlistPath = "docs/LOOPRELAY-RUNTIME-SURFACES.md";
    const packageJson = readJson<{ files: string[] }>("package.json");
    const allowlist = readFileSync(join(process.cwd(), allowlistPath), "utf8");

    expect(packageJson.files).toContain(allowlistPath);
    expect(allowlist).toContain("# LoopRelay Runtime Surfaces");
    expect(allowlist).toContain("Product name: LoopRelay");
    expect(allowlist).toContain("npm package and CLI: `looprelay`");
    expect(allowlist).toContain("MCP readiness tool: `get_looprelay_status`");
    expect(allowlist).toContain("Claude Code slash namespace: `/looprelay:*`");
    expect(allowlist).toContain("local data directory: `~/.looprelay`");
    expect(allowlist).toContain("There is no public compatibility");
    expect(allowlist).not.toContain("TODO");
    expect(allowlist).not.toContain("TBD");
    expect(allowlist).not.toContain("sk-proj");
    expect(allowlist).not.toContain("/Users/");
  });

  it("marks shipped LoopRelay historical plans as superseded by LoopRelay", () => {
    const packageJson = readJson<{ files: string[] }>("package.json");
    const historicalPlanPaths = packageJson.files.filter(
      (filePath) =>
        filePath.startsWith("docs/superpowers/plans/2026-07-04-looprelay-") &&
        filePath.endsWith(".md"),
    );

    expect(historicalPlanPaths.length).toBeGreaterThan(0);
    for (const planPath of historicalPlanPaths) {
      const plan = readFileSync(join(process.cwd(), planPath), "utf8");
      expect(plan, planPath).toContain("Historical naming note");
      expect(plan, planPath).toContain("Current product name: LoopRelay");
      expect(plan, planPath).toContain("Current runtime id: `looprelay`");
      expect(plan, planPath).toContain("See `docs/LOOPRELAY.md`");
      expect(plan, planPath).toContain(
        "See `docs/LOOPRELAY-RUNTIME-SURFACES.md`",
      );
      expect(plan, planPath).not.toContain("TODO");
      expect(plan, planPath).not.toContain("TBD");
      expect(plan, planPath).not.toContain("sk-proj");
      expect(plan, planPath).not.toContain("/Users/");
    }
  });

  it("restores executable mode for the npm CLI bin after server builds", () => {
    const packageJson = readJson<{ scripts: Record<string, string> }>(
      "package.json",
    );

    expect(packageJson.scripts["build:server"]).toContain(
      "node scripts/fix-bin-mode.mjs",
    );
    expect(
      readFileSync(join(process.cwd(), "scripts/fix-bin-mode.mjs"), "utf8"),
    ).toContain("chmodSync");
    expect(
      readFileSync(join(process.cwd(), "scripts/fix-bin-mode.mjs"), "utf8"),
    ).toContain("lr-claude.js");
    expect(
      readFileSync(join(process.cwd(), "scripts/fix-bin-mode.mjs"), "utf8"),
    ).toContain("lr-codex.js");
  });

  it("registers the repo-local plugin in the local marketplace file", () => {
    const marketplace = readJson<{
      plugins: Array<{
        name: string;
        source: { source: string; path: string };
        policy: { installation: string; authentication: string };
        category: string;
      }>;
    }>(".agents/plugins/marketplace.json");

    expect(marketplace.plugins).toContainEqual({
      name: "looprelay",
      source: { source: "local", path: "./plugins/looprelay" },
      policy: { installation: "AVAILABLE", authentication: "ON_INSTALL" },
      category: "Coding",
    });
  });
});
