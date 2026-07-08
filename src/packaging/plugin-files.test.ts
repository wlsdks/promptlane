import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parse as parseYaml } from "yaml";

import { listPromptLaneMcpToolNames } from "../mcp/score-tool-definitions.js";

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

    for (const scriptPath of [
      "scripts/pack-dry-run.mjs",
      "scripts/npm-publish-preflight.mjs",
      "scripts/mcp-native-dialog-approved.mjs",
      "scripts/ui-patrol.mjs",
      "scripts/quality-95-evidence.mjs",
    ]) {
      expect(packageJson.files).toContain(scriptPath);
      expect(packageContents).toContain(scriptPath);
    }

    expect(packageJson.scripts["npm-publish:preflight"]).toBe(
      "node scripts/npm-publish-preflight.mjs",
    );
    const preflightScript = readFileSync(
      join(process.cwd(), "scripts/npm-publish-preflight.mjs"),
      "utf8",
    );
    expect(publishing).toContain("corepack pnpm npm-publish:preflight");
    expect(publishing).toContain("does not publish");
    expect(publishing).toContain("--skip-npm");
    for (const command of [
      "corepack pnpm evidence:quality -- --require-complete",
      "corepack pnpm promptlane quality-evidence --require-complete",
    ]) {
      expect(publishing).toContain(command);
    }
    expect(publishing).toContain("## Live Readiness Checks");
    expect(publishing).toContain("Do not treat older `npm whoami`");
    expect(publishing).toContain("npm whoami");
    expect(publishing).toContain("npm view promptlane versions --json");
    expect(publishing).not.toContain("## Current Readiness");
    expect(publishing).not.toContain("# stark97");
    expect(publishing).not.toContain("# E404 Not Found");
    expect(publishing).toContain("git checkout v1.0.0");
    expect(publishing).toContain("If main has moved past `v1.0.0`");
    expect(publishing).toContain(
      "The existing `v1.0.0` tag predates `scripts/npm-publish-preflight.mjs`",
    );
    expect(publishing).toContain(
      "Do not expect `corepack pnpm npm-publish:preflight` to exist after `git checkout v1.0.0`.",
    );
    expect(preflightScript).toContain("git checkout ${expectedTag}");
    expect(preflightScript).toContain("tagged release commit");
    expect(preflightScript).toContain("manual npm checks");

    expect(packageJson.bin.promptlane).toBe("./dist/cli/index.js");
    expect(publishing).toContain("all three bin entries exist after build");
    expect(publishing).toContain("`bin.promptlane` → `dist/cli/index.js`");
    expect(publishing).toContain("chmods all three");
    expect(publishing).not.toContain("all four bin entries");
    expect(publishing).not.toContain("chmods all four");
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
    const actualTools = listPromptLaneMcpToolNames();

    expect(new Set(documentedTools).size).toBe(documentedTools.length);
    expect(documentedTools).toEqual(actualTools);
    expect(mcpSection).toContain(
      `This server exposes ${actualTools.length} model-controlled tools:`,
    );
  });

  it("keeps README MCP tool lists aligned with shipped tool definitions", () => {
    const readme = readFileSync(join(process.cwd(), "README.md"), "utf8");
    const readmeKo = readFileSync(join(process.cwd(), "README.ko.md"), "utf8");
    const actualTools = listPromptLaneMcpToolNames();
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
  });

  it("keeps current loop status docs on the loop MCP tool name", () => {
    const readme = readFileSync(join(process.cwd(), "README.md"), "utf8");
    const plugins = readFileSync(
      join(process.cwd(), "docs/PLUGINS.md"),
      "utf8",
    );

    for (const content of [readme, plugins]) {
      expect(content).toMatch(
        /`get_promptlane_loop_status`,\s+`\/api\/v1\/loops`/,
      );
      expect(content).not.toMatch(
        /`get_promptlane_status`,\s+`\/api\/v1\/loops`/,
      );
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
      "corepack pnpm benchmark -- --json",
      "corepack pnpm e2e:browser",
      "corepack pnpm smoke:release",
    ]) {
      expect(releaseChecklist).toContain(`\`${command}\``);
    }
    for (const command of [
      "corepack pnpm format",
      "corepack pnpm test",
      "corepack pnpm lint",
      "corepack pnpm build",
      "corepack pnpm pack:dry-run",
      "corepack pnpm benchmark -- --json",
      "corepack pnpm e2e:browser",
      "corepack pnpm smoke:release",
      "corepack pnpm evidence:quality -- --require-complete",
      "corepack pnpm promptlane quality-evidence --require-complete",
      "git diff --check",
    ]) {
      expect(architecture).toContain(command);
    }
    expect(architecture).not.toContain("\npnpm test");

    expect(packageJson.scripts["pack:dry-run"]).toBe(
      "node scripts/pack-dry-run.mjs",
    );
    expect(releaseChecklist).toContain(
      "wrapper strips pnpm-only npm env before `npm pack`",
    );

    for (const scriptPath of packageJson.files.filter(
      (filePath) =>
        filePath.startsWith("scripts/") && filePath.endsWith(".mjs"),
    )) {
      expect(releaseChecklist).toContain(`\`${scriptPath}\``);
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
    const benchmarkSpec = readFileSync(
      join(process.cwd(), "docs/BENCHMARK_V1.md"),
      "utf8",
    );

    for (const content of [benchmark, benchmarkSpec]) {
      expect(content).toContain("archive_effectiveness_score");
      expect(content).toContain("effectiveness_summary");
      expect(content).toContain("linked_outcomes");
    }
    expect(benchmarkSpec).toContain("Prompt Effectiveness Evidence");
    expect(benchmarkSpec).toContain("Pass threshold");
  });

  it("keeps the public release surface on 1.0.0", () => {
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
    const releaseStability = readFileSync(
      join(process.cwd(), "docs/RELEASE_STABILITY_EVIDENCE_2026-07-06.md"),
      "utf8",
    );
    const readme = readFileSync(join(process.cwd(), "README.md"), "utf8");
    const readmeKo = readFileSync(join(process.cwd(), "README.ko.md"), "utf8");

    expect(packageJson.version).toBe("1.0.0");
    for (const content of [sharedVersion, claudePlugin, claudeMarketplace]) {
      expect(content).toContain("1.0.0");
      expect(content).not.toContain("0.1.0-beta.0");
    }
    expect(changelog).toContain("## 1.0.0 - 2026-07-08");
    expect(changelog).not.toContain("currently pre-release");
    expect(publishing).toContain("npm publish --tag latest");
    expect(publishing).toContain("npm install -g promptlane");
    expect(publishing).toContain('git tag -a v1.0.0 -m "promptlane 1.0.0"');
    expect(publishing).toContain("git push origin v1.0.0");
    expect(publishing).not.toContain("promptlane@beta");
    expect(releaseChecklist).toContain("stable public release");
    expect(releaseChecklist).toContain("annotated tag `v1.0.0`");
    expect(security).toContain("PromptLane 1.0.0");
    expect(benchmarkSpec).toContain('"version": "1.0.0"');
    expect(implementationPlan).toContain("npm publish --tag latest");
    expect(releaseStability).toContain("promptlane-1.0.0.tgz");
    expect(readme).toContain("PromptLane 1.0.0");
    expect(readme).not.toContain("pre-release software");
    expect(readmeKo).toContain("PromptLane 1.0.0");
    expect(readmeKo).not.toContain("pre-release");
  });

  it("keeps the 9.5 ledger tied to effectiveness benchmark evidence", () => {
    const plan = readFileSync(
      join(
        process.cwd(),
        "docs/superpowers/plans/2026-07-05-promptlane-95-quality-plan.md",
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
      expect(content).toContain("corepack pnpm pack:dry-run");
      expect(content).not.toContain("\npnpm pack:dry-run\n");
    }
  });

  it("brands package, bins, and plugin metadata as PromptLane runtime surfaces", () => {
    const packageJson = readJson<{
      name: string;
      description: string;
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
    }>("plugins/promptlane/.codex-plugin/plugin.json");

    expect(packageJson.name).toBe("promptlane");
    expect(packageJson.bin).toHaveProperty("promptlane");
    expect(packageJson.bin).not.toHaveProperty("prompt-coach");
    expect(packageJson.bin).not.toHaveProperty("loopdeck");
    expect(packageJson.description).toBe(
      "PromptLane local-first prompt improvement workspace for Codex, Claude Code, and long-running coding-agent work.",
    );
    expect(packageJson.repository.url).toBe(
      "https://github.com/wlsdks/promptlane.git",
    );
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

    for (const manifest of [claudeManifest, codexManifest]) {
      expect(manifest.name).toBe("promptlane");
      expect(manifest.description).toContain("PromptLane");
      expect(manifest.description).toContain("prompt improvement workspace");
      expect(manifest.description).not.toContain(
        "agent loop memory and meta-prompting workbench",
      );
      expect(manifest.homepage).toBe("https://github.com/wlsdks/promptlane");
      expect(manifest.repository).toBe("https://github.com/wlsdks/promptlane");
      expect(manifest.keywords).toEqual(
        expect.arrayContaining(["promptlane", "prompt-improvement"]),
      );
    }

    expect(codexManifest.interface.displayName).toBe("PromptLane");
    expect(codexManifest.interface.shortDescription).toContain(
      "prompt improvement workspace",
    );
    expect(codexManifest.interface.longDescription).toContain(
      "loop-aware continuation",
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
        name: "promptlane",
        source: "./",
        category: "memory",
        description: expect.stringContaining("PromptLane"),
      }),
    );
    expect(marketplace.owner.name).toBe("PromptLane contributors");
    expect(marketplace.metadata.description).toContain("PromptLane");
    expect(marketplace.metadata.description).toContain(
      "prompt improvement workspace",
    );
    expect(manifest.name).toBe("promptlane");
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
      expect(description).toContain("PromptLane");
      expect(description).not.toMatch(/\bpromptlane\b/);
      expect(heading).toContain("PromptLane");
      expect(heading).not.toContain("Prompt Memory");
      expect(heading).not.toContain("Prompt-memory");
    }

    expect(guard).toContain(
      "promptlane setup --profile coach --rewrite-guard <chosen>",
    );
    expect(guard).toContain("AskUserQuestion");
    expect(guard).toMatch(/off.*context.*ask.*block-and-copy/s);

    expect(setup).toContain(
      "promptlane setup --profile coach --register-mcp --dry-run",
    );
    expect(setup).toContain("command -v promptlane || command -v promptlane");
    expect(setup).toContain("promptlane setup --profile coach --register-mcp");
    expect(setup).toContain("promptlane setup --profile coach --register-mcp");
    expect(setup).toContain("promptlane statusline claude-code");
    expect(status).toContain("promptlane doctor claude-code");
    expect(status).toContain("promptlane doctor claude-code");
    expect(status).toContain("promptlane statusline claude-code");
    expect(buddy).toContain("promptlane buddy");
    expect(buddy).toContain("promptlane buddy --json");
    expect(coach).toContain("promptlane:coach_prompt");
    expect(coach).toContain("promptlane coach --json");
    expect(coach).toContain("promptlane coach --json");
    expect(score).toContain("promptlane score --json");
    expect(score).toContain("promptlane:score_prompt_archive");
    expect(judge).toContain("promptlane:prepare_agent_judge_batch");
    expect(judge).toContain("promptlane:record_agent_judgments");
    expect(judge).toContain(
      "Do not call external providers through promptlane",
    );
    expect(score).toContain("promptlane:score_prompt latest=true");
    expect(score).toContain("promptlane score --latest --json");
    expect(improveLast).toContain("AskUserQuestion");
    expect(improveLast).toContain("promptlane:improve_prompt latest=true");
    expect(improveLast).toContain("promptlane improve --latest --json");
    expect(improveLast).toContain(
      "promptlane:prepare_agent_rewrite latest=true",
    );
    expect(improveLast).toContain("promptlane:record_agent_rewrite");
    expect(improveLast).toContain("Do not auto-submit the rewrite");
    expect(habits).toContain("promptlane:score_prompt_archive");
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
    }>("plugins/promptlane/.codex-plugin/plugin.json");

    expect(manifest.name).toBe("promptlane");
    expect(manifest.hooks).toBeUndefined();
    expect(manifest.skills).toBe("./skills/");
    expect(manifest.interface.displayName).toBe("PromptLane");
    expect(manifest.interface.category).toBe("Coding");
    expect(manifest.interface.defaultPrompt).toEqual(
      expect.arrayContaining([
        "Show my PromptLane buddy side pane command",
        "Show my PromptLane hook rewrite-guard mode",
        "Toggle the PromptLane rewrite guard between off / context / ask / block-and-copy",
        "Score my latest captured prompt",
        "Improve my latest captured prompt",
        "Run my full PromptLane coach workflow",
        "Judge my low-scoring prompts with the active agent session",
        "Summarize my prompt habits",
      ]),
    );
    expect(manifest.interface.defaultPrompt).not.toContain(
      "Rewrite my latest captured prompt with the active agent session",
    );
    expect(manifest.interface.defaultPrompt).not.toContain(
      "Review my current project AGENTS.md or CLAUDE.md rules",
    );
    expect(manifest.interface.defaultPrompt.join("\n")).toContain("PromptLane");
  });

  it("uses PromptLane-facing Codex plugin copy while preserving promptlane ids and setup-driven hook commands", () => {
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
    }>("plugins/promptlane/.codex-plugin/plugin.json");
    const skill = readFileSync(
      join(process.cwd(), "plugins/promptlane/skills/promptlane/SKILL.md"),
      "utf8",
    );

    expect(manifest.name).toBe("promptlane");
    expect(manifest.hooks).toBeUndefined();
    expect(manifest.skills).toBe("./skills/");
    expect(manifest.interface.displayName).toBe("PromptLane");
    expect(manifest.interface.shortDescription).toContain("PromptLane");
    expect(manifest.interface.shortDescription).toContain(
      "prompt improvement workspace",
    );
    expect(manifest.interface.longDescription).toContain("PromptLane");
    expect(manifest.interface.longDescription).toContain(
      "loop-aware continuation",
    );
    expect(manifest.interface.defaultPrompt).toEqual(
      expect.arrayContaining([
        "Set up PromptLane for this machine",
        "Check whether PromptLane is capturing Codex prompts",
        "Open my local PromptLane archive",
      ]),
    );
    expect(manifest.interface.defaultPrompt).not.toEqual(
      expect.arrayContaining([
        expect.stringContaining("promptlane"),
        expect.stringContaining("prompt coach"),
      ]),
    );
    expect(skill).toContain(
      "description: Use when the user wants to install, verify, search, or troubleshoot PromptLane",
    );
    expect(skill).toContain(
      "Use this skill when the user wants Codex to work with PromptLane",
    );
    expect(skill).toContain(
      "The compatibility CLI command remains `promptlane`",
    );
    expect(skill).toContain("promptlane setup --profile coach");
    expect(skill).toContain("promptlane install-hook codex");
  });

  it("documents plugin command namespace compatibility without promoting promptlane aliases", () => {
    const readme = readFileSync(join(process.cwd(), "README.md"), "utf8");
    const plugins = readFileSync(
      join(process.cwd(), "docs/PLUGINS.md"),
      "utf8",
    );

    expect(readme).toContain(
      "Claude Code slash commands remain under `/promptlane:*`",
    );
    expect(readme).not.toContain("use the promptlane CLI alias");
    expect(readme).not.toContain("Use the promptlane CLI alias");
    expect(readme).not.toContain("when preferred");
    expect(plugins).toContain(
      "Claude Code slash commands remain under `/promptlane:*`",
    );
    expect(plugins).toContain("legacy `promptlane` CLI alias");
    expect(plugins).not.toContain("use the promptlane CLI alias");
    expect(plugins).not.toContain("when preferred");
  });

  it("keeps PromptLane docs from describing product surfaces as promptlane storage or servers", () => {
    const docs = [
      readFileSync(join(process.cwd(), "README.md"), "utf8"),
      readFileSync(join(process.cwd(), "docs/PLUGINS.md"), "utf8"),
      readFileSync(
        join(process.cwd(), "docs/REUSE_LOOP_AUDIT_2026-07-05.md"),
        "utf8",
      ),
    ].join("\n");

    expect(docs).toContain("local PromptLane storage");
    expect(docs).toContain("PromptLane MCP server");
    expect(docs).toContain("local PromptLane web server");
    expect(docs).not.toContain("local promptlane storage");
    expect(docs).not.toContain("promptlane storage only");
    expect(docs).not.toContain("promptlane MCP server");
    expect(docs).not.toContain("local promptlane web server");
  });

  it("keeps active product docs presenting PromptLane as the service name", () => {
    const activeProductDocs = [
      "README.md",
      "README.ko.md",
      "docs/IMPLEMENTATION_PLAN.md",
      "docs/RELEASE_CHECKLIST.md",
      "docs/TECH_SPEC.md",
    ];

    for (const docPath of activeProductDocs) {
      const doc = readFileSync(join(process.cwd(), docPath), "utf8");
      expect(doc).toContain("PromptLane");
    }

    const positioning = readFileSync(
      join(process.cwd(), "docs/PROMPTLANE.md"),
      "utf8",
    );
    expect(positioning).toContain("Product name: PromptLane.");
    expect(positioning).toContain("`promptlane`");
  });

  it("keeps the PromptLane feature portfolio decisions explicit", () => {
    const positioning = readFileSync(
      join(process.cwd(), "docs/PROMPTLANE.md"),
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

  it("keeps the PromptLane data and privacy model explicit", () => {
    const positioning = readFileSync(
      join(process.cwd(), "docs/PROMPTLANE.md"),
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

  it("keeps the PromptLane risk and execution plan explicit", () => {
    const positioning = readFileSync(
      join(process.cwd(), "docs/PROMPTLANE.md"),
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

  it("keeps agent instruction docs routed through the PromptLane product contract", () => {
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

    expect(agents).toContain("제품명은 **PromptLane**");
    expect(agents).toContain("docs/PROMPTLANE.md");
    expect(agents).toContain("docs/PROMPTLANE-LEGACY-SURFACES.md");
    expect(agents).toContain("docs/AGENT-HARNESS.md");
    expect(agents).toContain("corepack pnpm pack:dry-run");

    expect(claude).toContain("AGENTS.md");
    expect(claude).toContain("PromptLane");
    expect(claude).toContain("promptlane");
    expect(claude).toContain("docs/INSTRUCTION-FILES.md");

    expect(harness).toContain(
      "PromptLane's Codex and Claude Code integration contract",
    );
    expect(harness).toContain("loop-aware continuation");
    expect(harness).toContain("hidden external LLM calls");
    expect(harness).toContain("corepack pnpm pack:dry-run");

    expect(instructionFiles).toContain("PromptLane");
    expect(instructionFiles).toContain("docs/PROMPTLANE-LEGACY-SURFACES.md");
    expect(instructionFiles).toContain("AGENTS.md");
    expect(instructionFiles).toContain("CLAUDE.md");
  });

  it("keeps active product surfaces branded as PromptLane", () => {
    const activeSurfacePaths = [
      "package.json",
      "README.md",
      "README.ko.md",
      ".claude-plugin/marketplace.json",
      ".claude-plugin/plugin.json",
      "plugins/promptlane/.codex-plugin/plugin.json",
      "plugins/promptlane/skills/promptlane/SKILL.md",
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
      "docs/PROMPTLANE.md",
      "docs/PLUGINS.md",
      "docs/ARCHITECTURE.md",
      "docs/AGENT-HARNESS.md",
      "docs/TECH_SPEC.md",
      "docs/IMPLEMENTATION_PLAN.md",
      "docs/RELEASE_CHECKLIST.md",
      "src/loop/brief.ts",
    ];
    const forbiddenProductNamePatterns = [
      /\bPromptCoach\b/,
      /\bPrompt Coach\b/,
      /\bprompt-coach\b/,
      /\bLoopdeck\b/,
      /\bloopdeck\b/,
      /Prompt Memory/,
    ];

    for (const surfacePath of activeSurfacePaths) {
      const content = readFileSync(join(process.cwd(), surfacePath), "utf8");

      expect(content, surfacePath).toContain("PromptLane");
      for (const pattern of forbiddenProductNamePatterns) {
        expect(
          content,
          `${surfacePath} should not match ${pattern}`,
        ).not.toMatch(pattern);
      }
    }

    const packageJson = readJson<{ repository: { url: string } }>(
      "package.json",
    );
    expect(packageJson.repository.url).toBe(
      "https://github.com/wlsdks/promptlane.git",
    );
  });

  it("keeps active audit and backlog status copy branded as PromptLane", () => {
    const docs = [
      readFileSync(join(process.cwd(), "docs/NEXT_BACKLOG.md"), "utf8"),
      readFileSync(
        join(process.cwd(), "docs/PROMPTLANE_GOAL_AUDIT_2026-07-05.md"),
        "utf8",
      ),
    ].join("\n");

    expect(docs).toContain("PromptLane status");
    expect(docs).not.toContain("empty PromptLane status");
    expect(docs).not.toContain("generic PromptLane status.");
  });

  it("keeps the PromptLane goal audit aligned with merged saved-draft reuse slices", () => {
    const audit = readFileSync(
      join(process.cwd(), "docs/PROMPTLANE_GOAL_AUDIT_2026-07-05.md"),
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

    expect(reuseAudit).toContain("local PromptLane web server");
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
      "pnpm build && node scripts/mcp-coach-loop-smoke.mjs",
    );
    expect(mcpAudit).toContain("No immediate MCP coach-loop slice remains");
    expect(mcpAudit).toContain("apply_clarifications");
    expect(mcpAudit).toContain("smoke:mcp-coach-loop");
    expect(mcpAudit).not.toContain(
      "Update MCP/server instructions and docs so the canonical clarification flow",
    );
    expect(mcpAudit).not.toContain("Add a future small smoke harness");
  });

  it("keeps the PromptLane goal audit and backlog aligned with latest merged evidence", () => {
    const goalAudit = readFileSync(
      join(process.cwd(), "docs/PROMPTLANE_GOAL_AUDIT_2026-07-05.md"),
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
    expect(goalAudit).toContain("PromptLane MVP reliability slices");
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
      join(process.cwd(), "docs/PROMPTLANE_GOAL_AUDIT_2026-07-05.md"),
      "utf8",
    );
    const backlog = readFileSync(
      join(process.cwd(), "docs/NEXT_BACKLOG.md"),
      "utf8",
    );
    const plan = readFileSync(
      join(
        process.cwd(),
        "docs/superpowers/plans/2026-07-05-promptlane-95-quality-plan.md",
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
      "## 2026-07-06 PromptLane CI Workflow Removal",
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
      "PROMPTLANE_NATIVE_DIALOG_APPROVED=1 corepack pnpm dogfood:mcp-native-dialog-approved",
    );
    expect(audit).toContain('interaction_status: "answered"');
    expect(audit).toContain("approved native dialog dogfood passed");
    expect(audit).toContain(
      "completed `native_dialog_approved_dogfood` evidence",
    );
    const goalAudit = readFileSync(
      join(process.cwd(), "docs/PROMPTLANE_GOAL_AUDIT_2026-07-05.md"),
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
        "docs/superpowers/plans/2026-07-05-promptlane-95-quality-plan.md",
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
      "corepack pnpm promptlane quality-evidence --require-complete",
    );
    for (const content of [readme, readmeKo]) {
      expect(content).toContain(
        "corepack pnpm promptlane quality-evidence --require-complete",
      );
      expect(content).not.toContain(
        "\npnpm promptlane quality-evidence --require-complete",
      );
    }
    expect(releaseChecklist).toContain(
      "corepack pnpm --silent evidence:quality",
    );
    for (const content of [packageContents, releaseChecklist]) {
      expect(content).toContain("scripts/quality-95-evidence.mjs");
    }
    for (const content of [backlog, plan]) {
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
      expect(content).toContain("promptlane quality-evidence --json");
      expect(content).toContain("axis_evidence_coverage");
      expect(content).toContain("scorecard_review_candidates");
      expect(content).toContain("recommended_next_slices");
      expect(content).toContain("release_gate");
      expect(content).toContain("corepack pnpm format");
      expect(content).toContain("corepack pnpm test");
      expect(content).toContain("corepack pnpm lint");
      expect(content).toContain("corepack pnpm build");
      expect(content).toContain("corepack pnpm pack:dry-run");
      expect(content).toContain("corepack pnpm benchmark -- --json");
      expect(content).toContain("corepack pnpm e2e:browser");
      expect(content).toContain("corepack pnpm smoke:release");
      expect(content).toContain(
        "corepack pnpm promptlane quality-evidence --require-complete",
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
      expect(content).toContain("promptlane agent setup smoke passed");
      expect(content).toContain("promptlane_95_quality");
      expect(content).toContain("scorecard_axes");
      expect(content).toContain("native_dialog_approved_dogfood");
      expect(content).toContain("native_dialog_approved_dogfood");
    }
    expect(plan).toContain("| Product planning and positioning | 9.5/10 |");
    expect(plan).toContain("| Local-first privacy boundary | 9.5/10 |");
    expect(plan).toContain("| Setup, doctor, and MCP smoke | 9.5/10 |");
    expect(plan).toContain("| Loop memory and continuation | 9.5/10 |");
    expect(plan).toContain("| Release stability | 9.5/10 |");
    expect(plan).toContain("| Codex and Claude Code integration | 9.5/10 |");
    expect(plan).toContain("| Web UI and operational evidence | 9.5/10 |");
    for (const content of [localEvidence, backlog, plan]) {
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
      expect(content).toContain("corepack pnpm benchmark -- --json");
      expect(content).toContain("privacy_leak_count: 0");
      expect(content).toContain("archive_effectiveness_score: 1");
    }
    for (const content of [readme, readmeKo]) {
      expect(content).toContain("promptlane quality-evidence");
      expect(content).toContain("promptlane quality-evidence --json");
      expect(content).toContain(
        "promptlane quality-evidence --require-complete",
      );
      expect(content).toContain("recommended next slices");
    }
    expect(evidenceScript).toContain("promptlane_95_quality");
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
    expect(evidenceScript).toContain("promptlane agent setup smoke passed");
    expect(evidenceScript).toContain("blocked_by_external_event");
    expect(evidenceScript).toContain("below_target");
    expect(evidenceScript).toContain("requireComplete");
    expect(evidenceScript).toContain("pending_operator_approval");
    expect(evidenceScript).toContain(
      "Run the full release gate before claiming the long-running goal complete.",
    );
  });

  it("keeps the active loop snapshot MCP contract branded as PromptLane", () => {
    const loopSnapshotSchema = readFileSync(
      join(process.cwd(), "docs/LOOP-SNAPSHOT-SCHEMA.md"),
      "utf8",
    );
    const todo = readFileSync(join(process.cwd(), "tasks/todo.md"), "utf8");
    const todoSection = sectionBetween(
      todo,
      "## 2026-07-06 PromptLane Loop Snapshot MCP Branding",
    );

    expect(loopSnapshotSchema).toContain(
      "PromptLane MCP loop tools may expose snapshot-derived status and briefs.",
    );
    expect(loopSnapshotSchema).not.toContain("PromptLane MCP tools may expose");
    expect(todoSection).toContain(
      "PR #439가 CI `test (22)`/`test (24)` 통과 후 merge되었고 branch prune까지 확인됐다.",
    );
    expect(todoSection).toContain("latest main CI run `28745956945`");
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
      "## 2026-07-06 PromptLane Improve Expected Impact Evidence",
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
      "## 2026-07-06 PromptLane Web Expected Impact Evidence",
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
      "## 2026-07-06 PromptLane Expected Impact 9.5 Ledger Refresh",
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
      "## 2026-07-06 PromptLane Prompt Outcome Effectiveness Evidence",
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
      "## 2026-07-06 PromptLane CLI Prompt Outcome Evidence",
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
      "## 2026-07-06 PromptLane Prompt Effectiveness Verdict",
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
        "docs/superpowers/plans/2026-07-05-promptlane-95-quality-plan.md",
      ),
      "utf8",
    );
    const releaseEvidenceFile = join(process.cwd(), releaseEvidencePath);

    expect(packageJson.files).toContain(releaseEvidencePath);
    expect(existsSync(releaseEvidenceFile)).toBe(true);
    const releaseEvidence = readFileSync(releaseEvidenceFile, "utf8");

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
      "# PromptLane Release Stability Evidence 2026-07-06",
      "corepack pnpm smoke:release",
      "corepack pnpm pack:dry-run",
      "PR #464",
      "local release gate",
      "corepack pnpm test",
      "corepack pnpm lint",
      "corepack pnpm build",
      "corepack pnpm pack:dry-run",
      "corepack pnpm benchmark -- --json",
      "corepack pnpm e2e:browser",
      "corepack pnpm smoke:release",
      "corepack pnpm evidence:quality -- --require-complete",
      "corepack pnpm promptlane quality-evidence --require-complete",
      "quality evidence CLI gate",
      "git diff --check",
      "local browser evidence",
      "approved native-dialog evidence",
      "Raw prompt bodies, raw local paths, and token-like secrets were not emitted",
    ]) {
      expect(releaseEvidence).toContain(releaseEvidenceText);
    }

    for (const staleReleaseEvidence of [
      "operator-approved blocker",
      "Remaining Release-Adjacent Blockers",
      "Scheduled `ui-patrol` artifact evidence is still pending",
      "dogfood:mcp-native-dialog-approved` still requires explicit operator",
      "scheduled `ui-patrol.yml` workflow remains separate operational evidence",
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

  it("ships the PromptLane 9.5 quality plan and links it from the operational backlog", () => {
    const packageJson = readJson<{
      files: string[];
    }>("package.json");
    const planPath =
      "docs/superpowers/plans/2026-07-05-promptlane-95-quality-plan.md";
    const plan = readFileSync(join(process.cwd(), planPath), "utf8");
    const backlog = readFileSync(
      join(process.cwd(), "docs/NEXT_BACKLOG.md"),
      "utf8",
    );

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
      "promptlane show\n  --json",
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
      expect(plan).toContain(currentEvidence);
    }
    for (const currentBacklogEvidence of [
      "prompt-linked outcome evidence",
      "CLI prompt outcome evidence",
      "Prompt effectiveness verdict",
      "MCP score_prompt effectiveness evidence",
      "`promptlane show --json`",
      "`expected_impact` predictions to actual raw-free loop outcomes",
      "`effectiveness` verdict",
      "effectiveness calibration",
      "PR #464",
      "local release gate",
      "docs/RELEASE_STABILITY_EVIDENCE_2026-07-06.md",
    ]) {
      expect(backlog).toContain(currentBacklogEvidence);
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
      "promptlane setup --profile coach --register-mcp",
      "promptlane doctor codex",
      "promptlane doctor claude-code",
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
        "docs/superpowers/plans/2026-07-05-promptlane-95-quality-plan.md",
      ),
      "utf8",
    );

    expect(packageJson.scripts["dogfood:web-user-flow"]).toBe(
      "pnpm e2e:browser",
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

  it("documents /promptlane:* as the active slash namespace", () => {
    const readme = readFileSync(join(process.cwd(), "README.md"), "utf8");
    const readmeKo = readFileSync(join(process.cwd(), "README.ko.md"), "utf8");
    const plugins = readFileSync(
      join(process.cwd(), "docs/PLUGINS.md"),
      "utf8",
    );
    const packageJson = readJson<{ name: string }>("package.json");
    const claudeManifest = readJson<{ name: string; commands: string[] }>(
      ".claude-plugin/plugin.json",
    );
    const codexManifest = readJson<{ name: string }>(
      "plugins/promptlane/.codex-plugin/plugin.json",
    );
    const commandFiles = readdirSync(join(process.cwd(), "commands")).filter(
      (file) => file.endsWith(".md"),
    );

    for (const content of [readme, readmeKo, plugins]) {
      expect(content).toContain("/promptlane:*");
    }
    expect(commandFiles).toEqual(
      expect.arrayContaining(["setup.md", "status.md", "coach.md"]),
    );
    expect(claudeManifest.commands).toEqual(
      expect.arrayContaining(["./commands/setup.md", "./commands/status.md"]),
    );
    expect(packageJson.name).toBe("promptlane");
    expect(claudeManifest.name).toBe("promptlane");
    expect(codexManifest.name).toBe("promptlane");
  });

  it("ships the PromptLane runtime rename plan as historical context", () => {
    const plan = readFileSync(
      join(
        process.cwd(),
        "docs/superpowers/plans/2026-07-04-promptlane-plugin-rename-plan.md",
      ),
      "utf8",
    );

    expect(plan).toContain("PromptLane");
    expect(plan).toContain("promptlane");
    expect(plan).toContain("package.json");
    expect(plan).toContain(".claude-plugin/plugin.json");
    expect(plan).toContain("plugins/promptlane/.codex-plugin/plugin.json");
    expect(plan).toContain("commands/*.md");
    expect(plan).toContain("README.md");
    expect(plan).toContain("docs/PLUGINS.md");
  });

  it("keeps historical PromptLane rename issue slices packaged", () => {
    const issuePlanPath =
      "docs/superpowers/plans/2026-07-04-promptlane-plugin-rename-issue-slices.md";
    const packageJson = readJson<{ files: string[] }>("package.json");
    const issuePlan = readFileSync(join(process.cwd(), issuePlanPath), "utf8");

    expect(packageJson.files).toContain(issuePlanPath);
    expect(issuePlan).toContain("PromptLane");
    expect(issuePlan).toContain("promptlane");
    expect(issuePlan).toContain("Fresh install smoke");
    expect(issuePlan).toContain("TDD proof");
    expect(issuePlan).not.toContain("Make this better");
    expect(issuePlan).not.toContain("sk-proj");
    expect(issuePlan).not.toContain("/Users/");
  });

  it("ships the historical Claude Code namespace decision under PromptLane naming", () => {
    const decisionPath =
      "docs/superpowers/plans/2026-07-04-promptlane-claude-dual-namespace-decision.md";
    const packageJson = readJson<{ files: string[] }>("package.json");
    const decision = readFileSync(join(process.cwd(), decisionPath), "utf8");
    const claudeManifest = readJson<{ name: string; commands: string[] }>(
      ".claude-plugin/plugin.json",
    );

    expect(packageJson.files).toContain(decisionPath);
    expect(decision).toContain(
      "# PromptLane Claude Code Dual Namespace Decision",
    );
    expect(decision).toContain("PromptLane");
    expect(decision).toContain("promptlane");
    expect(decision).toContain(
      "https://code.claude.com/docs/en/plugins-reference",
    );
    expect(decision).not.toContain("Make this better");
    expect(decision).not.toContain("sk-proj");
    expect(decision).not.toContain("/Users/");
    expect(claudeManifest.name).toBe("promptlane");
    expect(claudeManifest.commands).toEqual(
      expect.arrayContaining(["./commands/setup.md"]),
    );
  });

  it("ships the PromptLane MCP server name decision", () => {
    const decisionPath =
      "docs/superpowers/plans/2026-07-04-promptlane-mcp-server-name-decision.md";
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
    expect(decision).toContain("# PromptLane MCP Server Name Decision");
    expect(decision).toContain("promptlane");
    expect(decision).toContain("codex mcp add <server-name> --");
    expect(decision).toContain("claude mcp add");
    expect(decision).toContain("promptlane mcp");
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
      expect(content).toContain("promptlane mcp");
      expect(content).toContain("mcp add");
    }
  });

  it("ships historical deprecation readiness under PromptLane naming", () => {
    const readinessPath =
      "docs/superpowers/plans/2026-07-04-promptlane-deprecation-readiness.md";
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
      "plugins/promptlane/.codex-plugin/plugin.json",
    );

    expect(packageJson.files).toContain(readinessPath);
    expect(readiness).toContain("# PromptLane Deprecation Readiness");
    expect(readiness).toContain("PromptLane");
    expect(readiness).toContain("Alias-only release note template");
    expect(readiness).toContain("Deprecation release note template");
    expect(readiness).toContain("Breaking release note template");
    expect(readiness).toContain("saved slash command snippets");
    expect(readiness).toContain("minimum evidence before deprecation");
    expect(readiness).toContain("rollback");
    expect(readiness).toContain("upgrade smoke");
    expect(readiness).toContain("promptlane");
    expect(readiness).not.toContain("Make this better");
    expect(readiness).not.toContain("sk-proj");
    expect(readiness).not.toContain("/Users/");
    expect(readme).toContain("/promptlane:*");
    expect(plugins).toContain("/promptlane:*");
    expect(claudeManifest.name).toBe("promptlane");
    expect(codexManifest.name).toBe("promptlane");
    expect(claudeManifest.commands).toEqual(
      expect.arrayContaining(["./commands/setup.md"]),
    );
  });

  it("ships the next runtime value slice before leaving rename work", () => {
    const nextSlicePath =
      "docs/superpowers/plans/2026-07-04-promptlane-next-runtime-value-slice.md";
    const packageJson = readJson<{ files: string[] }>("package.json");
    const nextSlice = readFileSync(join(process.cwd(), nextSlicePath), "utf8");

    expect(packageJson.files).toContain(nextSlicePath);
    expect(nextSlice).toContain("# PromptLane Next Runtime Value Slice");
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

  it("documents the PromptLane repositioning before replacing older branding", () => {
    const specPath =
      "docs/superpowers/specs/2026-07-05-promptlane-repositioning-design.md";
    const packageJson = readJson<{ files: string[] }>("package.json");
    const spec = readFileSync(join(process.cwd(), specPath), "utf8");

    expect(packageJson.files).toContain(specPath);
    expect(spec).toContain("# PromptLane Repositioning Design");
    expect(spec).toContain("Product name: PromptLane");
    expect(spec).toContain("prompt improvement workspace");
    expect(spec).toContain("loop-aware continuation");
    expect(spec).toContain("Keep `promptlane`");
    expect(spec).toContain("TDD");
    expect(spec).not.toContain("TODO");
    expect(spec).not.toContain("TBD");
    expect(spec).not.toContain("sk-proj");
    expect(spec).not.toContain("/Users/");
  });

  it("ships the PromptLane product contract and runtime surface guide", () => {
    const contractPath = "docs/PROMPTLANE.md";
    const surfaceGuidePath = "docs/PROMPTLANE-LEGACY-SURFACES.md";
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
    expect(contract).toContain("# PromptLane");
    expect(contract).toContain("Product name: PromptLane");
    expect(contract).toContain("prompt improvement workspace");
    expect(contract).toContain("loop-aware continuation");
    expect(contract).toContain("Keep `promptlane`");
    expect(contract).toContain("Do not auto-submit");
    expect(surfaceGuide).toContain("# PromptLane Runtime Surfaces");
    expect(surfaceGuide).toContain("Product name: PromptLane");
    expect(surfaceGuide).toContain("Primary CLI command: `promptlane`");
    expect(readme.startsWith("# PromptLane")).toBe(true);
    expect(readme).toContain(
      "Local-first prompt improvement workspace for Claude Code, Codex, and long-running coding-agent work.",
    );
    expect(readme).toContain("Loop features are loop-aware continuation");
    expect(readmeKo.startsWith("# PromptLane")).toBe(true);
    expect(readmeKo).toContain(
      "Claude Code, Codex, 장기 coding-agent 작업을 위한 local-first prompt improvement workspace.",
    );
    expect(readmeKo).toContain("loop 기능은 loop-aware continuation");
  });

  it("keeps shipped core docs aligned with the PromptLane product contract", () => {
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
      expect(doc).toContain("PromptLane");
      expect(doc).toMatch(/prompt\s+improvement workspace/);
      expect(doc).toMatch(/loop-aware\s+continuation/);
      expect(doc).toContain("`promptlane`");
      expect(doc).not.toContain(
        "PromptLane is a local-first agent loop memory and meta-prompting workbench",
      );
    }
  });

  it("ships a machine-checkable runtime id inventory before rename work", () => {
    const inventoryPath =
      "docs/superpowers/plans/2026-07-04-promptlane-runtime-id-inventory.json";
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
    }>("plugins/promptlane/.codex-plugin/plugin.json");
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
      promptlane: packageJson.bin["promptlane"],
      promptlane: packageJson.bin.promptlane,
      "pl-claude": packageJson.bin["pl-claude"],
      "pl-codex": packageJson.bin["pl-codex"],
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
    expect(inventory.claude_code_plugin.slash_namespace).toBe("/promptlane:*");
    expect(inventory.codex_plugin.manifest_name).toBe(codexManifest.name);
    expect(inventory.codex_plugin.display_name).toBe(
      codexManifest.interface.displayName,
    );
    expect(inventory.codex_plugin.install_path).toBe("plugins/promptlane");
    expect(codexManifest.hooks).toBeUndefined();
    expect(inventory.codex_plugin.hook_install).toBe(
      "promptlane setup --profile coach --register-mcp --open-web",
    );
    expect(inventory.mcp.canonical_server_name).toBe("promptlane");
    expect(inventory.mcp.command).toBe("promptlane mcp");
    expect(inventory.mcp.docs).toEqual(
      expect.arrayContaining(["README.md", "README.ko.md", "docs/PLUGINS.md"]),
    );
    expect(inventory.invariants).toEqual(
      expect.arrayContaining([
        "Do not remove /promptlane:*.",
        "Do not rename package.json#name.",
        "Do not rename plugin ids.",
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
      "plugins/promptlane/.codex-plugin/plugin.json",
    );
    const pluginsDoc = readFileSync(
      join(process.cwd(), "docs/PLUGINS.md"),
      "utf8",
    );
    const renamePlan = readFileSync(
      join(
        process.cwd(),
        "docs/superpowers/plans/2026-07-04-promptlane-plugin-rename-plan.md",
      ),
      "utf8",
    );
    const renameIssueSlices = readFileSync(
      join(
        process.cwd(),
        "docs/superpowers/plans/2026-07-04-promptlane-plugin-rename-issue-slices.md",
      ),
      "utf8",
    );

    expect(manifest.hooks).toBeUndefined();
    expect(pluginsDoc).toContain(
      "does not bundle active Codex hooks; setup installs user-level hooks explicitly",
    );
    expect(pluginsDoc).not.toContain("hooks.json for fail-open Codex");
    expect(renamePlan).not.toContain("plugins/promptlane/hooks.json");
    expect(renameIssueSlices).not.toContain("plugins/promptlane/hooks.json");
  });

  it("ships a hook binary smoke for the promptlane entrypoint", () => {
    const packageJson = readJson<{
      bin: Record<string, string>;
      files: string[];
      scripts: Record<string, string>;
    }>("package.json");
    const smoke = readFileSync(
      join(process.cwd(), "scripts/hook-binary-smoke.mjs"),
      "utf8",
    );

    expect(packageJson.bin["promptlane"]).toBe("./dist/cli/index.js");
    expect(Object.keys(packageJson.bin).sort()).toEqual([
      "pl-claude",
      "pl-codex",
      "promptlane",
    ]);
    expect(packageJson.files).toContain("scripts/hook-binary-smoke.mjs");
    expect(packageJson.scripts["smoke:hooks"]).toBe(
      "pnpm build && node scripts/hook-binary-smoke.mjs",
    );
    expect(smoke).toContain("promptlane");
    expect(smoke).toContain("hook claude-code");
    expect(smoke).toContain("hook codex");
    expect(smoke).toContain("hook status");
    expect(smoke).toContain("PROMPTLANE_SMOKE_SECRET");
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
      "pnpm build && node scripts/agent-setup-smoke.mjs",
    );
    expect(smoke).toContain("setup --profile coach --register-mcp");
    expect(smoke).toContain("doctor claude-code");
    expect(smoke).toContain("doctor codex");
    expect(smoke).toContain("promptlane agent setup smoke passed");
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
      "pnpm build && node scripts/mcp-native-dialog-preflight.mjs",
    );
    expect(smoke).toContain("allow_native_dialog");
    expect(smoke).toContain("interaction_status");
    expect(smoke).toContain("unsupported");
    expect(smoke).toContain("without opening an OS dialog");
    expect(smoke).not.toContain("PROMPTLANE_NATIVE_DIALOG=1");
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
      "pnpm build && node scripts/mcp-native-dialog-approved.mjs",
    );
    expect(packageJson.scripts["dogfood:mcp-native-dialog-refusal"]).toBe(
      "pnpm build && node scripts/mcp-native-dialog-approved.mjs",
    );
    expect(smoke).toContain("PROMPTLANE_NATIVE_DIALOG_APPROVED");
    expect(smoke).toContain("Refusing to open a native OS dialog");
    expect(smoke).toContain("allow_native_dialog: true");
    expect(smoke).toContain("PROMPTLANE_NATIVE_DIALOG");
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
      "pnpm build && node scripts/mcp-coach-loop-smoke.mjs",
    );
    expect(smoke).toContain("score_prompt");
    expect(smoke).toContain("coach_prompt");
    expect(smoke).toContain("Effectiveness evidence");
    expect(smoke).toContain("unmeasured prompt");
    expect(smoke).toContain("smoke:mcp-coach-loop");
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

    expect(packageJson.files).toContain("scripts/first-coach-loop-dogfood.mjs");
    expect(packageJson.scripts["dogfood:first-coach-loop"]).toBe(
      "pnpm build && node scripts/first-coach-loop-dogfood.mjs",
    );
    expect(smoke).toContain("hook codex");
    expect(smoke).toContain("coach --json");
    expect(smoke).toContain("loop collect --json");
    expect(smoke).toContain("loop brief --json");
    expect(smoke).toContain("PROMPTLANE_FIRST_LOOP_SECRET");
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
      "pnpm build && node scripts/loop-memory-approval-dogfood.mjs",
    );
    expect(smoke).toContain("record_loop_outcome");
    expect(smoke).toContain("propose_loop_memory_candidate");
    expect(smoke).toContain("record_loop_memory");
    expect(smoke).toContain("propose_instruction_patch");
    expect(smoke).toContain("PROMPTLANE_LOOP_MEMORY_SECRET");
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
    const example = readJson<{
      hooks: {
        UserPromptSubmit: Array<{
          hooks: Array<{ command: string }>;
        }>;
      };
    }>("integrations/claude-code/settings.example.json");

    const command = example.hooks.UserPromptSubmit[0]?.hooks[0]?.command ?? "";
    expect(command).toContain("promptlane hook claude-code");
    expect(command).toContain("|| true");
    expect(command).not.toMatch(/PROMPTLANE_TOKEN|Bearer|token=/i);
  });

  it("includes plugin artifacts in npm package files", () => {
    const packageJson = readJson<{
      bin: Record<string, string>;
      files: string[];
    }>("package.json");

    expect(packageJson.bin).toMatchObject({
      promptlane: "./dist/cli/index.js",
      "pl-claude": "./dist/cli/pl-claude.js",
      "pl-codex": "./dist/cli/pl-codex.js",
    });
    expect(packageJson.files).toContain(".claude-plugin");
    expect(packageJson.files).toContain("commands");
    expect(packageJson.files).toContain("plugins");
    expect(packageJson.files).toContain("integrations");
    expect(packageJson.files).toContain("docs/ARCHITECTURE.md");
    expect(packageJson.files).toContain("docs/PLUGINS.md");
    expect(packageJson.files).toContain("docs/PROMPTLANE.md");
    expect(packageJson.files).toContain("docs/PROMPTLANE-LEGACY-SURFACES.md");
    expect(packageJson.files).toContain("docs/LOOP-SNAPSHOT-SCHEMA.md");
    expect(packageJson.files).toContain("docs/AGENT-HARNESS.md");
    expect(packageJson.files).toContain("docs/INSTRUCTION-FILES.md");
    expect(packageJson.files).toContain(
      "docs/superpowers/plans/2026-07-04-promptlane-plugin-rename-plan.md",
    );
    expect(packageJson.files).toContain("docs/LEGAL_USAGE_GUIDE.md");
  });

  it("documents promptlane as the primary CLI command", () => {
    const readme = readFileSync(join(process.cwd(), "README.md"), "utf8");
    const readmeKo = readFileSync(join(process.cwd(), "README.ko.md"), "utf8");
    const packageContents = readFileSync(
      join(process.cwd(), "docs/PACKAGE_CONTENTS.md"),
      "utf8",
    );

    for (const content of [readme, readmeKo, packageContents]) {
      expect(content).toContain("promptlane");
    }
    expect(readme).toContain("primary CLI");
    expect(readmeKo).toContain("기본 CLI");
    expect(packageContents).toContain("compiled `promptlane` CLI entrypoint");
    expect(packageContents).toContain("docs/PROMPTLANE-LEGACY-SURFACES.md");
  });

  it("ships an allowlist for remaining PromptLane legacy surfaces", () => {
    const allowlistPath = "docs/PROMPTLANE-LEGACY-SURFACES.md";
    const packageJson = readJson<{ files: string[] }>("package.json");
    const allowlist = readFileSync(join(process.cwd(), allowlistPath), "utf8");

    expect(packageJson.files).toContain(allowlistPath);
    expect(allowlist).toContain("# PromptLane Runtime Surfaces");
    expect(allowlist).toContain("Product name: PromptLane");
    expect(allowlist).toContain("Primary CLI command: `promptlane`");
    expect(allowlist).toContain(
      "MCP compatibility tool: `get_promptlane_status`",
    );
    expect(allowlist).toContain("Historical planning docs");
    expect(allowlist).toContain("Active slash namespace: `/promptlane:*`");
    expect(allowlist).toContain("Product-facing copy should use PromptLane");
    expect(allowlist).not.toContain("TODO");
    expect(allowlist).not.toContain("TBD");
    expect(allowlist).not.toContain("sk-proj");
    expect(allowlist).not.toContain("/Users/");
  });

  it("marks shipped PromptLane historical plans as superseded by PromptLane", () => {
    const packageJson = readJson<{ files: string[] }>("package.json");
    const historicalPlanPaths = packageJson.files.filter(
      (filePath) =>
        filePath.startsWith("docs/superpowers/plans/2026-07-04-promptlane-") &&
        filePath.endsWith(".md"),
    );

    expect(historicalPlanPaths.length).toBeGreaterThan(0);
    for (const planPath of historicalPlanPaths) {
      const plan = readFileSync(join(process.cwd(), planPath), "utf8");
      expect(plan, planPath).toContain("Historical naming note");
      expect(plan, planPath).toContain("Current product name: PromptLane");
      expect(plan, planPath).toContain("Current runtime id: `promptlane`");
      expect(plan, planPath).toContain("See `docs/PROMPTLANE.md`");
      expect(plan, planPath).toContain(
        "See `docs/PROMPTLANE-LEGACY-SURFACES.md`",
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
    ).toContain("pl-claude.js");
    expect(
      readFileSync(join(process.cwd(), "scripts/fix-bin-mode.mjs"), "utf8"),
    ).toContain("pl-codex.js");
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
      name: "promptlane",
      source: { source: "local", path: "./plugins/promptlane" },
      policy: { installation: "AVAILABLE", authentication: "ON_INSTALL" },
      category: "Coding",
    });
  });
});
