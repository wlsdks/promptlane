import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parse as parseYaml } from "yaml";

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(join(process.cwd(), path), "utf8")) as T;
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
    expect(existsSync(join(process.cwd(), "scripts/pack-dry-run.mjs"))).toBe(
      true,
    );
  });

  it("keeps package contents and npm publishing docs aligned with shipped bins and scripts", () => {
    const packageJson = readJson<{
      bin: Record<string, string>;
      files: string[];
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
      "scripts/mcp-native-dialog-approved.mjs",
      "scripts/ui-patrol.mjs",
    ]) {
      expect(packageJson.files).toContain(scriptPath);
      expect(packageContents).toContain(scriptPath);
    }

    expect(packageJson.bin.loopdeck).toBe("./dist/cli/index.js");
    expect(publishing).toContain("all four bin entries exist after build");
    expect(publishing).toContain(
      "`bin.loopdeck` → `dist/cli/index.js`",
    );
    expect(publishing).toContain("chmods all four");
    expect(publishing).not.toContain("all three bin entries");
    expect(publishing).not.toContain("chmods all three");
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

    expect(packageJson.scripts["pack:dry-run"]).toBe(
      "node scripts/pack-dry-run.mjs",
    );
    expect(releaseChecklist).toContain(
      "wrapper strips pnpm-only npm env before `npm pack`",
    );

    for (const scriptPath of packageJson.files.filter(
      (filePath) => filePath.startsWith("scripts/") && filePath.endsWith(".mjs"),
    )) {
      expect(releaseChecklist).toContain(`\`${scriptPath}\``);
    }

    expect(releaseChecklist).not.toContain("Confirm `pnpm pack:dry-run`");
  });

  it("keeps README verification gates aligned with the package dry-run wrapper", () => {
    const readme = readFileSync(join(process.cwd(), "README.md"), "utf8");
    const readmeKo = readFileSync(join(process.cwd(), "README.ko.md"), "utf8");

    for (const content of [readme, readmeKo]) {
      expect(content).toContain("corepack pnpm pack:dry-run");
      expect(content).not.toContain("\npnpm pack:dry-run\n");
    }
  });

  it("brands product-facing package and plugin metadata as Loopdeck while preserving prompt-coach command ids", () => {
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
      interface: { displayName: string; shortDescription: string };
    }>("plugins/prompt-coach/.codex-plugin/plugin.json");

    expect(packageJson.name).toBe("prompt-coach");
    expect(packageJson.bin).toHaveProperty("prompt-coach");
    expect(packageJson.bin.loopdeck).toBe("./dist/cli/index.js");
    expect(packageJson.description).toBe(
      "Local-first agent loop memory and meta-prompting workbench for Codex, Claude Code, and coding-agent workflows.",
    );
    expect(packageJson.repository.url).toBe(
      "https://github.com/wlsdks/loopdeck.git",
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
      expect(manifest.name).toBe("prompt-coach");
      expect(manifest.description).toContain("Loopdeck");
      expect(manifest.homepage).toBe("https://github.com/wlsdks/loopdeck");
      expect(manifest.repository).toBe("https://github.com/wlsdks/loopdeck");
      expect(manifest.keywords).toEqual(expect.arrayContaining(["loopdeck"]));
    }

    expect(codexManifest.interface.displayName).toBe("Loopdeck");
    expect(codexManifest.interface.shortDescription).toContain(
      "agent loop memory",
    );
  });

  it("ships a Claude Code plugin marketplace and manifest with slash commands", () => {
    const marketplace = readJson<{
      plugins: Array<{ name: string; source: string; category: string }>;
    }>(".claude-plugin/marketplace.json");
    const manifest = readJson<{
      name: string;
      commands: string[];
    }>(".claude-plugin/plugin.json");

    expect(marketplace.plugins).toContainEqual(
      expect.objectContaining({
        name: "prompt-coach",
        source: "./",
        category: "memory",
      }),
    );
    expect(manifest.name).toBe("prompt-coach");
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
      expect(description).toContain("Loopdeck");
      expect(description).not.toMatch(/\bprompt-coach\b/);
      expect(heading).toContain("Loopdeck");
      expect(heading).not.toContain("Prompt Memory");
      expect(heading).not.toContain("Prompt-memory");
    }

    expect(guard).toContain(
      "prompt-coach setup --profile coach --rewrite-guard <chosen>",
    );
    expect(guard).toContain("AskUserQuestion");
    expect(guard).toMatch(/off.*context.*ask.*block-and-copy/s);

    expect(setup).toContain(
      "prompt-coach setup --profile coach --register-mcp --dry-run",
    );
    expect(setup).toContain("command -v prompt-coach || command -v loopdeck");
    expect(setup).toContain("loopdeck setup --profile coach --register-mcp");
    expect(setup).toContain(
      "prompt-coach setup --profile coach --register-mcp",
    );
    expect(setup).toContain("prompt-coach statusline claude-code");
    expect(status).toContain("prompt-coach doctor claude-code");
    expect(status).toContain("loopdeck doctor claude-code");
    expect(status).toContain("prompt-coach statusline claude-code");
    expect(buddy).toContain("prompt-coach buddy");
    expect(buddy).toContain("prompt-coach buddy --json");
    expect(coach).toContain("prompt-coach:coach_prompt");
    expect(coach).toContain("prompt-coach coach --json");
    expect(coach).toContain("loopdeck coach --json");
    expect(score).toContain("prompt-coach score --json");
    expect(score).toContain("prompt-coach:score_prompt_archive");
    expect(judge).toContain("prompt-coach:prepare_agent_judge_batch");
    expect(judge).toContain("prompt-coach:record_agent_judgments");
    expect(judge).toContain(
      "Do not call external providers through prompt-coach",
    );
    expect(score).toContain("prompt-coach:score_prompt latest=true");
    expect(score).toContain("prompt-coach score --latest --json");
    expect(improveLast).toContain("AskUserQuestion");
    expect(improveLast).toContain("prompt-coach:improve_prompt latest=true");
    expect(improveLast).toContain("prompt-coach improve --latest --json");
    expect(improveLast).toContain(
      "prompt-coach:prepare_agent_rewrite latest=true",
    );
    expect(improveLast).toContain("prompt-coach:record_agent_rewrite");
    expect(improveLast).toContain("Do not auto-submit the rewrite");
    expect(habits).toContain("prompt-coach:score_prompt_archive");
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
    }>("plugins/prompt-coach/.codex-plugin/plugin.json");

    expect(manifest.name).toBe("prompt-coach");
    expect(manifest.hooks).toBeUndefined();
    expect(manifest.skills).toBe("./skills/");
    expect(manifest.interface.displayName).toBe("Loopdeck");
    expect(manifest.interface.category).toBe("Coding");
    expect(manifest.interface.defaultPrompt).toEqual(
      expect.arrayContaining([
        "Show my Loopdeck buddy side pane command",
        "Use the loopdeck CLI alias for my next manual command",
        "Show my Loopdeck hook rewrite-guard mode",
        "Toggle the Loopdeck rewrite guard between off / context / ask / block-and-copy",
        "Score my latest captured prompt",
        "Improve my latest captured prompt",
        "Run my full Loopdeck coach workflow",
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
  });

  it("uses Loopdeck-facing Codex plugin copy while preserving prompt-coach ids and setup-driven hook commands", () => {
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
    }>("plugins/prompt-coach/.codex-plugin/plugin.json");
    const skill = readFileSync(
      join(process.cwd(), "plugins/prompt-coach/skills/prompt-coach/SKILL.md"),
      "utf8",
    );

    expect(manifest.name).toBe("prompt-coach");
    expect(manifest.hooks).toBeUndefined();
    expect(manifest.skills).toBe("./skills/");
    expect(manifest.interface.displayName).toBe("Loopdeck");
    expect(manifest.interface.shortDescription).toContain("Loopdeck");
    expect(manifest.interface.longDescription).toContain("Loopdeck");
    expect(manifest.interface.defaultPrompt).toEqual(
      expect.arrayContaining([
        "Set up Loopdeck for this machine",
        "Check whether Loopdeck is capturing Codex prompts",
        "Open my local Loopdeck archive",
      ]),
    );
    expect(manifest.interface.defaultPrompt).not.toEqual(
      expect.arrayContaining([
        expect.stringContaining("prompt-coach"),
        expect.stringContaining("prompt coach"),
      ]),
    );
    expect(skill).toContain(
      "description: Use when the user wants to install, verify, search, or troubleshoot Loopdeck",
    );
    expect(skill).toContain(
      "Use this skill when the user wants Codex to work with Loopdeck",
    );
    expect(skill).toContain(
      "The compatibility CLI command remains `prompt-coach`",
    );
    expect(skill).toContain("prompt-coach setup --profile coach");
    expect(skill).toContain("prompt-coach install-hook codex");
  });

  it("documents plugin command namespace compatibility during the Loopdeck migration", () => {
    const readme = readFileSync(join(process.cwd(), "README.md"), "utf8");
    const plugins = readFileSync(
      join(process.cwd(), "docs/PLUGINS.md"),
      "utf8",
    );

    expect(readme).toContain(
      "Claude Code slash commands remain under `/prompt-coach:*`",
    );
    expect(readme).toContain("use the loopdeck CLI alias");
    expect(plugins).toContain(
      "Claude Code slash commands remain under `/prompt-coach:*`",
    );
    expect(plugins).toContain("`loopdeck` CLI alias");
  });

  it("keeps Loopdeck docs from describing product surfaces as prompt-coach storage or servers", () => {
    const docs = [
      readFileSync(join(process.cwd(), "README.md"), "utf8"),
      readFileSync(join(process.cwd(), "docs/PLUGINS.md"), "utf8"),
      readFileSync(
        join(process.cwd(), "docs/REUSE_LOOP_AUDIT_2026-07-05.md"),
        "utf8",
      ),
    ].join("\n");

    expect(docs).toContain("local Loopdeck storage");
    expect(docs).toContain("Loopdeck MCP server");
    expect(docs).toContain("local Loopdeck web server");
    expect(docs).not.toContain("local prompt-coach storage");
    expect(docs).not.toContain("prompt-coach storage only");
    expect(docs).not.toContain("prompt-coach MCP server");
    expect(docs).not.toContain("local prompt-coach web server");
  });

  it("keeps the Loopdeck goal audit aligned with merged saved-draft reuse slices", () => {
    const audit = readFileSync(
      join(process.cwd(), "docs/LOOPDECK_GOAL_AUDIT_2026-07-05.md"),
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

    expect(reuseAudit).toContain("No immediate reuse-flow slice remains");
    expect(reuseAudit).toContain("PR #366");
    expect(reuseAudit).toContain("PR #367");
    expect(reuseAudit).toContain("PR #368");
    expect(reuseAudit).not.toContain("Re-run the reuse flow");
  });

  it("documents /loopdeck:* as a future alias-only slash namespace without shipping command files yet", () => {
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
      "plugins/prompt-coach/.codex-plugin/plugin.json",
    );
    const commandFiles = readdirSync(join(process.cwd(), "commands")).filter(
      (file) => file.endsWith(".md"),
    );

    for (const content of [readme, readmeKo, plugins]) {
      expect(content).toContain("/prompt-coach:*");
      expect(content).toContain("/loopdeck:*");
      expect(content).toContain("alias-only");
    }
    expect(commandFiles).not.toEqual(
      expect.arrayContaining([expect.stringMatching(/^loopdeck(?:-|:|\.|$)/)]),
    );
    expect(claudeManifest.commands).not.toEqual(
      expect.arrayContaining([expect.stringContaining("loopdeck")]),
    );
    expect(packageJson.name).toBe("prompt-coach");
    expect(claudeManifest.name).toBe("prompt-coach");
    expect(codexManifest.name).toBe("prompt-coach");
  });

  it("keeps slash command and plugin rename behind a dedicated compatibility plan", () => {
    const plan = readFileSync(
      join(
        process.cwd(),
        "docs/superpowers/plans/2026-07-04-loopdeck-plugin-rename-plan.md",
      ),
      "utf8",
    );

    expect(plan).toContain("current package name remains `prompt-coach`");
    expect(plan).toContain("current primary CLI remains `prompt-coach`");
    expect(plan).toContain(
      "`loopdeck` is a compatibility-preserving CLI alias",
    );
    expect(plan).toContain(
      "Claude Code slash commands remain `/prompt-coach:*`",
    );
    expect(plan).toContain("Do not ship `/loopdeck:*` as the only namespace");
    expect(plan).toContain("Phase 1: Observe compatibility");
    expect(plan).toContain("Phase 2: Add dual namespace aliases");
    expect(plan).toContain("Phase 3: Deprecate old namespace");
    expect(plan).toContain(
      "Phase 4: Remove only after a major/versioned window",
    );
    expect(plan).toContain("fresh install smoke");
    expect(plan).toContain("Codex plugin smoke");
    expect(plan).toContain("Claude Code plugin smoke");
    expect(plan).toContain("hook marker");
    expect(plan).toContain("MCP server name");
    expect(plan).toContain("package.json");
    expect(plan).toContain(".claude-plugin/plugin.json");
    expect(plan).toContain("plugins/prompt-coach/.codex-plugin/plugin.json");
    expect(plan).toContain("commands/*.md");
    expect(plan).toContain("README.md");
    expect(plan).toContain("docs/PLUGINS.md");
  });

  it("breaks the Loopdeck rename into independently shippable issue slices", () => {
    const issuePlanPath =
      "docs/superpowers/plans/2026-07-04-loopdeck-plugin-rename-issue-slices.md";
    const packageJson = readJson<{ files: string[] }>("package.json");
    const issuePlan = readFileSync(join(process.cwd(), issuePlanPath), "utf8");

    expect(packageJson.files).toContain(issuePlanPath);
    expect(issuePlan).toContain("# Loopdeck Plugin Rename Issue Slices");
    expect(issuePlan).toContain("Slice R1: Compatibility Inventory Gate");
    expect(issuePlan).toContain("Slice R2: Alias-Only Command Docs");
    expect(issuePlan).toContain(
      "Slice R3: Claude Code Dual Namespace Packaging",
    );
    expect(issuePlan).toContain(
      "Slice R4: Codex Plugin Display Rename Without ID Rename",
    );
    expect(issuePlan).toContain("Slice R5: Hook Binary Compatibility Smoke");
    expect(issuePlan).toContain(
      "Slice R6: MCP Server Name Compatibility Decision",
    );
    expect(issuePlan).toContain("Slice R7: Deprecation Window Readiness");
    expect(issuePlan).toContain("Do not remove `/prompt-coach:*`");
    expect(issuePlan).toContain("Do not rename `package.json#name`");
    expect(issuePlan).toContain("Do not rename plugin ids");
    expect(issuePlan).toContain("Fresh install smoke");
    expect(issuePlan).toContain("Codex plugin smoke");
    expect(issuePlan).toContain("Claude Code plugin smoke");
    expect(issuePlan).toContain("TDD proof");
    expect(issuePlan).not.toContain("Make this better");
    expect(issuePlan).not.toContain("sk-proj");
    expect(issuePlan).not.toContain("/Users/");
  });

  it("ships a Claude Code dual namespace decision gate before adding /loopdeck:* packaging", () => {
    const decisionPath =
      "docs/superpowers/plans/2026-07-04-loopdeck-claude-dual-namespace-decision.md";
    const packageJson = readJson<{ files: string[] }>("package.json");
    const decision = readFileSync(join(process.cwd(), decisionPath), "utf8");
    const claudeManifest = readJson<{ name: string; commands: string[] }>(
      ".claude-plugin/plugin.json",
    );

    expect(packageJson.files).toContain(decisionPath);
    expect(decision).toContain(
      "# Loopdeck Claude Code Dual Namespace Decision",
    );
    expect(decision).toContain("Decision: defer");
    expect(decision).toContain("Claude Code plugin `name` is the namespace");
    expect(decision).toContain("commands/loopdeck-*.md");
    expect(decision).toContain("would not create `/loopdeck:*`");
    expect(decision).toContain("Do not add `/loopdeck:*` command files yet");
    expect(decision).toContain("dual plugin package");
    expect(decision).toContain("official namespace alias support");
    expect(decision).toContain("/prompt-coach:* remains required");
    expect(decision).toContain(
      "https://code.claude.com/docs/en/plugins-reference",
    );
    expect(decision).not.toContain("Make this better");
    expect(decision).not.toContain("sk-proj");
    expect(decision).not.toContain("/Users/");
    expect(claudeManifest.name).toBe("prompt-coach");
    expect(claudeManifest.commands).not.toEqual(
      expect.arrayContaining([expect.stringContaining("loopdeck")]),
    );
  });

  it("ships an MCP server name compatibility decision before adding loopdeck server aliases", () => {
    const decisionPath =
      "docs/superpowers/plans/2026-07-04-loopdeck-mcp-server-name-decision.md";
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
    expect(decision).toContain("# Loopdeck MCP Server Name Decision");
    expect(decision).toContain("Decision: keep `prompt-coach` canonical");
    expect(decision).toContain(
      "Do not add `loopdeck` MCP server-name examples yet",
    );
    expect(decision).toContain("codex mcp add <server-name> --");
    expect(decision).toContain("claude mcp add");
    expect(decision).toContain("prompt-coach mcp");
    expect(decision).toContain("loopdeck mcp");
    expect(decision).toContain("alias behavior");
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
      expect(content).toContain("prompt-coach mcp");
      expect(content).toContain("mcp add");
      expect(content).not.toContain("mcp add loopdeck");
    }
  });

  it("ships deprecation readiness gates without deprecating prompt-coach ids yet", () => {
    const readinessPath =
      "docs/superpowers/plans/2026-07-04-loopdeck-deprecation-readiness.md";
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
      "plugins/prompt-coach/.codex-plugin/plugin.json",
    );

    expect(packageJson.files).toContain(readinessPath);
    expect(readiness).toContain("# Loopdeck Deprecation Readiness");
    expect(readiness).toContain("Decision: not deprecated");
    expect(readiness).toContain("Alias-only release note template");
    expect(readiness).toContain("Deprecation release note template");
    expect(readiness).toContain("Breaking release note template");
    expect(readiness).toContain("saved slash command snippets");
    expect(readiness).toContain("minimum evidence before deprecation");
    expect(readiness).toContain("rollback");
    expect(readiness).toContain("upgrade smoke");
    expect(readiness).toContain("/prompt-coach:* remains supported");
    expect(readiness).toContain("Do not show a deprecation banner yet");
    expect(readiness).not.toContain("Make this better");
    expect(readiness).not.toContain("sk-proj");
    expect(readiness).not.toContain("/Users/");
    expect(readme).toContain("slash commands remain under `/prompt-coach:*`");
    expect(plugins).toContain("`/prompt-coach:*` remains required");
    expect(readme).not.toMatch(/deprecated/i);
    expect(plugins).not.toMatch(/deprecated/i);
    expect(claudeManifest.name).toBe("prompt-coach");
    expect(codexManifest.name).toBe("prompt-coach");
    expect(claudeManifest.commands).toEqual(
      expect.arrayContaining(["./commands/setup.md"]),
    );
  });

  it("ships the next runtime value slice before leaving rename work", () => {
    const nextSlicePath =
      "docs/superpowers/plans/2026-07-04-loopdeck-next-runtime-value-slice.md";
    const packageJson = readJson<{ files: string[] }>("package.json");
    const nextSlice = readFileSync(join(process.cwd(), nextSlicePath), "utf8");

    expect(packageJson.files).toContain(nextSlicePath);
    expect(nextSlice).toContain("# Loopdeck Next Runtime Value Slice");
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

  it("ships a machine-checkable runtime id inventory before rename work", () => {
    const inventoryPath =
      "docs/superpowers/plans/2026-07-04-loopdeck-runtime-id-inventory.json";
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
    }>("plugins/prompt-coach/.codex-plugin/plugin.json");
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
      "prompt-coach": packageJson.bin["prompt-coach"],
      loopdeck: packageJson.bin.loopdeck,
      "pc-claude": packageJson.bin["pc-claude"],
      "pc-codex": packageJson.bin["pc-codex"],
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
    expect(inventory.claude_code_plugin.slash_namespace).toBe(
      "/prompt-coach:*",
    );
    expect(inventory.codex_plugin.manifest_name).toBe(codexManifest.name);
    expect(inventory.codex_plugin.display_name).toBe(
      codexManifest.interface.displayName,
    );
    expect(inventory.codex_plugin.install_path).toBe("plugins/prompt-coach");
    expect(codexManifest.hooks).toBeUndefined();
    expect(inventory.codex_plugin.hook_install).toBe(
      "prompt-coach setup --profile coach --register-mcp --open-web",
    );
    expect(inventory.mcp.canonical_server_name).toBe("prompt-coach");
    expect(inventory.mcp.command).toBe("prompt-coach mcp");
    expect(inventory.mcp.docs).toEqual(
      expect.arrayContaining(["README.md", "README.ko.md", "docs/PLUGINS.md"]),
    );
    expect(inventory.invariants).toEqual(
      expect.arrayContaining([
        "Do not remove /prompt-coach:*.",
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
      "plugins/prompt-coach/.codex-plugin/plugin.json",
    );
    const pluginsDoc = readFileSync(
      join(process.cwd(), "docs/PLUGINS.md"),
      "utf8",
    );
    const renamePlan = readFileSync(
      join(
        process.cwd(),
        "docs/superpowers/plans/2026-07-04-loopdeck-plugin-rename-plan.md",
      ),
      "utf8",
    );
    const renameIssueSlices = readFileSync(
      join(
        process.cwd(),
        "docs/superpowers/plans/2026-07-04-loopdeck-plugin-rename-issue-slices.md",
      ),
      "utf8",
    );

    expect(manifest.hooks).toBeUndefined();
    expect(pluginsDoc).toContain(
      "does not bundle active Codex hooks; setup installs user-level hooks explicitly",
    );
    expect(pluginsDoc).not.toContain("hooks.json for fail-open Codex");
    expect(renamePlan).not.toContain("plugins/prompt-coach/hooks.json");
    expect(renameIssueSlices).not.toContain("plugins/prompt-coach/hooks.json");
  });

  it("ships a hook binary compatibility smoke for prompt-coach and loopdeck entrypoints", () => {
    const packageJson = readJson<{
      bin: Record<string, string>;
      files: string[];
      scripts: Record<string, string>;
    }>("package.json");
    const smoke = readFileSync(
      join(process.cwd(), "scripts/hook-binary-smoke.mjs"),
      "utf8",
    );

    expect(packageJson.bin["prompt-coach"]).toBe("./dist/cli/index.js");
    expect(packageJson.bin.loopdeck).toBe("./dist/cli/index.js");
    expect(packageJson.files).toContain("scripts/hook-binary-smoke.mjs");
    expect(packageJson.scripts["smoke:hooks"]).toBe(
      "pnpm build && node scripts/hook-binary-smoke.mjs",
    );
    expect(smoke).toContain("prompt-coach");
    expect(smoke).toContain("loopdeck");
    expect(smoke).toContain("hook claude-code");
    expect(smoke).toContain("hook codex");
    expect(smoke).toContain("hook status");
    expect(smoke).toContain("PROMPT_COACH_SMOKE_SECRET");
    expect(smoke).toContain("assertNotIncludes");
    expect(smoke).toContain("sk-proj");
    expect(smoke).not.toContain("/Users/");
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
    expect(smoke).not.toContain("PROMPT_COACH_NATIVE_DIALOG=1");
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
    expect(smoke).toContain("PROMPT_COACH_NATIVE_DIALOG_APPROVED");
    expect(smoke).toContain("Refusing to open a native OS dialog");
    expect(smoke).toContain("allow_native_dialog: true");
    expect(smoke).toContain("PROMPT_COACH_NATIVE_DIALOG");
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
    expect(smoke).toContain("improve_prompt");
    expect(smoke).toContain("apply_clarifications");
    expect(smoke).toContain("record_clarifications");
    expect(smoke).toContain("returns_stored_prompt_body");
    expect(smoke).not.toContain("/Users/");
  });

  it("installs Playwright Chromium before the scheduled UI patrol", () => {
    const workflow = readFileSync(
      join(process.cwd(), ".github/workflows/ui-patrol.yml"),
      "utf8",
    );

    expect(workflow).toContain("pnpm exec playwright install chromium");
    expect(workflow.indexOf("pnpm exec playwright install chromium")).toBeLessThan(
      workflow.indexOf("pnpm ui-patrol"),
    );
    expect(workflow).toContain("Upload UI patrol screenshots");
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
    expect(command).toContain("prompt-coach hook claude-code");
    expect(command).toContain("|| true");
    expect(command).not.toMatch(/PROMPT_COACH_TOKEN|Bearer|token=/i);
  });

  it("includes plugin artifacts in npm package files", () => {
    const packageJson = readJson<{
      bin: Record<string, string>;
      files: string[];
    }>("package.json");

    expect(packageJson.bin).toMatchObject({
      "prompt-coach": "./dist/cli/index.js",
      loopdeck: "./dist/cli/index.js",
      "pc-claude": "./dist/cli/pc-claude.js",
      "pc-codex": "./dist/cli/pc-codex.js",
    });
    expect(packageJson.files).toContain(".claude-plugin");
    expect(packageJson.files).toContain("commands");
    expect(packageJson.files).toContain("plugins");
    expect(packageJson.files).toContain("integrations");
    expect(packageJson.files).toContain("docs/ARCHITECTURE.md");
    expect(packageJson.files).toContain("docs/PLUGINS.md");
    expect(packageJson.files).toContain("docs/LOOPDECK.md");
    expect(packageJson.files).toContain("docs/LOOP-SNAPSHOT-SCHEMA.md");
    expect(packageJson.files).toContain("docs/AGENT-HARNESS.md");
    expect(packageJson.files).toContain("docs/INSTRUCTION-FILES.md");
    expect(packageJson.files).toContain(
      "docs/superpowers/plans/2026-07-04-loopdeck-plugin-rename-plan.md",
    );
    expect(packageJson.files).toContain("docs/LEGAL_USAGE_GUIDE.md");
  });

  it("documents loopdeck as a compatibility-preserving CLI alias", () => {
    const readme = readFileSync(join(process.cwd(), "README.md"), "utf8");
    const readmeKo = readFileSync(join(process.cwd(), "README.ko.md"), "utf8");
    const packageContents = readFileSync(
      join(process.cwd(), "docs/PACKAGE_CONTENTS.md"),
      "utf8",
    );

    for (const content of [readme, readmeKo, packageContents]) {
      expect(content).toContain("loopdeck");
      expect(content).toContain("prompt-coach");
    }
    expect(readme).toContain("loopdeck is a CLI alias");
    expect(readmeKo).toContain("loopdeck는 CLI alias");
    expect(packageContents).toContain("loopdeck alias");
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
    ).toContain("pc-claude.js");
    expect(
      readFileSync(join(process.cwd(), "scripts/fix-bin-mode.mjs"), "utf8"),
    ).toContain("pc-codex.js");
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
      name: "prompt-coach",
      source: { source: "local", path: "./plugins/prompt-coach" },
      policy: { installation: "AVAILABLE", authentication: "ON_INSTALL" },
      category: "Coding",
    });
  });
});
