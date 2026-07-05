import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parse as parseYaml } from "yaml";

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

  it("brands product-facing package and plugin metadata as PromptLane while preserving runtime ids", () => {
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
    }>("plugins/prompt-coach/.codex-plugin/plugin.json");

    expect(packageJson.name).toBe("prompt-coach");
    expect(packageJson.bin).toHaveProperty("prompt-coach");
    expect(packageJson.bin.loopdeck).toBe("./dist/cli/index.js");
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
      expect(manifest.name).toBe("prompt-coach");
      expect(manifest.description).toContain("PromptLane");
      expect(manifest.description).toContain("prompt improvement workspace");
      expect(manifest.description).not.toContain(
        "agent loop memory and meta-prompting workbench",
      );
      expect(manifest.homepage).toBe("https://github.com/wlsdks/promptlane");
      expect(manifest.repository).toBe("https://github.com/wlsdks/promptlane");
      expect(manifest.keywords).toEqual(
        expect.arrayContaining(["promptlane", "prompt-coach"]),
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
        name: "prompt-coach",
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
    expect(marketplace.metadata.description).not.toContain("Loopdeck is");
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
      expect(description).toContain("PromptLane");
      expect(description).not.toMatch(/\bprompt-coach\b/);
      expect(heading).toContain("PromptLane");
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
    expect(manifest.interface.defaultPrompt).not.toEqual(
      expect.arrayContaining([expect.stringMatching(/\bloopdeck\b/i)]),
    );
  });

  it("uses PromptLane-facing Codex plugin copy while preserving prompt-coach ids and setup-driven hook commands", () => {
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
        expect.stringContaining("prompt-coach"),
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
      "The compatibility CLI command remains `prompt-coach`",
    );
    expect(skill).toContain("prompt-coach setup --profile coach");
    expect(skill).toContain("prompt-coach install-hook codex");
  });

  it("documents plugin command namespace compatibility without promoting loopdeck aliases", () => {
    const readme = readFileSync(join(process.cwd(), "README.md"), "utf8");
    const plugins = readFileSync(
      join(process.cwd(), "docs/PLUGINS.md"),
      "utf8",
    );

    expect(readme).toContain(
      "Claude Code slash commands remain under `/prompt-coach:*`",
    );
    expect(readme).not.toContain("use the loopdeck CLI alias");
    expect(readme).not.toContain("Use the loopdeck CLI alias");
    expect(readme).not.toContain("when preferred");
    expect(plugins).toContain(
      "Claude Code slash commands remain under `/prompt-coach:*`",
    );
    expect(plugins).toContain("legacy `loopdeck` CLI alias");
    expect(plugins).not.toContain("use the loopdeck CLI alias");
    expect(plugins).not.toContain("when preferred");
  });

  it("keeps PromptLane docs from describing product surfaces as prompt-coach storage or servers", () => {
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
    expect(docs).not.toContain("local prompt-coach storage");
    expect(docs).not.toContain("prompt-coach storage only");
    expect(docs).not.toContain("prompt-coach MCP server");
    expect(docs).not.toContain("local prompt-coach web server");
  });

  it("keeps active product docs from presenting Prompt Coach as a service name", () => {
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
      expect(doc).not.toContain("Prompt Coach");
    }

    const positioning = readFileSync(
      join(process.cwd(), "docs/PROMPTLANE.md"),
      "utf8",
    );
    expect(positioning).toContain("Product name: PromptLane.");
    expect(positioning).toContain("`prompt-coach`");
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
      "INTEGRATE: commit, push, PR, CI `test (22)` and `test (24)`, merge, and prune",
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
    expect(agents).toContain("docs/LOOPDECK-LEGACY-SURFACES.md");
    expect(agents).toContain("docs/AGENT-HARNESS.md");
    expect(agents).toContain("corepack pnpm pack:dry-run");

    expect(claude).toContain("AGENTS.md");
    expect(claude).toContain("PromptLane");
    expect(claude).toContain("prompt-coach");
    expect(claude).toContain("docs/INSTRUCTION-FILES.md");

    expect(harness).toContain("PromptLane's Codex and Claude Code integration contract");
    expect(harness).toContain("loop-aware continuation");
    expect(harness).toContain("hidden external LLM calls");
    expect(harness).toContain("corepack pnpm pack:dry-run");

    expect(instructionFiles).toContain("PromptLane");
    expect(instructionFiles).toContain("docs/LOOPDECK-LEGACY-SURFACES.md");
    expect(instructionFiles).toContain("AGENTS.md");
    expect(instructionFiles).toContain("CLAUDE.md");
  });

  it("keeps active product surfaces branded as PromptLane, not Prompt Coach or Loopdeck", () => {
    const activeSurfacePaths = [
      "package.json",
      "README.md",
      "README.ko.md",
      ".claude-plugin/marketplace.json",
      ".claude-plugin/plugin.json",
      "plugins/prompt-coach/.codex-plugin/plugin.json",
      "plugins/prompt-coach/skills/prompt-coach/SKILL.md",
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
      /\bPrompt Coach\b/,
      /\bPromptCoach\b/,
      /Loopdeck is a local-first/i,
      /Loopdeck archive/,
      /Loopdeck status/,
      /Loopdeck server/,
      /Loopdeck Coach/,
      /Loopdeck Buddy/,
      /Loopdeck Score/,
      /Loopdeck Habits/,
      /Loopdeck Agent Judge/,
      /Open Loopdeck/,
      /Set Up Loopdeck/,
      /Loopdeck Rewrite Guard/,
      /Loopdeck Memories/,
      /Loopdeck does not/,
      /outside Loopdeck/,
      /Loopdeck records/,
      /Loopdeck storage/,
      /local Loopdeck/,
    ];

    for (const surfacePath of activeSurfacePaths) {
      const content = readFileSync(join(process.cwd(), surfacePath), "utf8");

      expect(content, surfacePath).toContain("PromptLane");
      for (const pattern of forbiddenProductNamePatterns) {
        expect(content, `${surfacePath} should not match ${pattern}`).not.toMatch(
          pattern,
        );
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
        join(process.cwd(), "docs/LOOPDECK_GOAL_AUDIT_2026-07-05.md"),
        "utf8",
      ),
    ].join("\n");

    expect(docs).toContain("PromptLane status");
    expect(docs).not.toContain("empty Loopdeck status");
    expect(docs).not.toContain("Loopdeck status.");
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

    expect(reuseAudit).toContain("local PromptLane web server");
    expect(reuseAudit).toContain("No immediate reuse-flow slice remains");
    expect(reuseAudit).toContain("PR #366");
    expect(reuseAudit).toContain("PR #367");
    expect(reuseAudit).toContain("PR #368");
    expect(reuseAudit).not.toContain("local Loopdeck");
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

  it("keeps the Loopdeck goal audit and backlog aligned with latest merged evidence", () => {
    const goalAudit = readFileSync(
      join(process.cwd(), "docs/LOOPDECK_GOAL_AUDIT_2026-07-05.md"),
      "utf8",
    );
    const backlog = readFileSync(
      join(process.cwd(), "docs/NEXT_BACKLOG.md"),
      "utf8",
    );

    expect(goalAudit).toContain(
      "`2f99c10 docs: close codex claude dogfood log`",
    );
    for (const prNumber of ["#403", "#405", "#407", "#408", "#417", "#419", "#420"]) {
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
    expect(backlog).not.toContain(
      "Update MCP instructions/docs so agents call `apply_clarifications`",
    );
    expect(backlog).not.toContain(
      "Immediate follow-up from the stdio audit",
    );
  });

  it("keeps scheduled ui-patrol evidence pending until a schedule run exists", () => {
    const packageJson = readJson<{
      files: string[];
      scripts: Record<string, string>;
    }>("package.json");
    const goalAudit = readFileSync(
      join(process.cwd(), "docs/LOOPDECK_GOAL_AUDIT_2026-07-05.md"),
      "utf8",
    );
    const backlog = readFileSync(
      join(process.cwd(), "docs/NEXT_BACKLOG.md"),
      "utf8",
    );
    const todo = readFileSync(join(process.cwd(), "tasks/todo.md"), "utf8");
    const workflow = readFileSync(
      join(process.cwd(), ".github/workflows/ui-patrol.yml"),
      "utf8",
    );
    const evidenceScript = readFileSync(
      join(process.cwd(), "scripts/ui-patrol-evidence.mjs"),
      "utf8",
    );

    expect(packageJson.files).toContain("scripts/ui-patrol-evidence.mjs");
    expect(packageJson.scripts["evidence:ui-patrol"]).toBe(
      "node scripts/ui-patrol-evidence.mjs",
    );
    expect(evidenceScript).toContain("ui-patrol-screenshots");
    expect(evidenceScript).toContain("scheduled_ui_patrol");
    expect(evidenceScript).toContain("pending_no_schedule_run");
    expect(workflow).toContain("schedule:");
    expect(workflow).toContain('cron: "17 6 * * 1"');
    for (const content of [goalAudit, backlog, todo]) {
      expect(content).toContain("corepack pnpm evidence:ui-patrol");
      expect(content).toContain("workflow_dispatch run `28717406758`");
      expect(content).toContain("9 png files");
      expect(content).toContain("no `schedule` event");
      expect(content).toContain("scheduled `ui-patrol` evidence remains pending");
      expect(content).not.toContain(
        "scheduled `ui-patrol` evidence is complete",
      );
    }
    expect(goalAudit).toContain("PR #419");
    expect(goalAudit).toContain("PR #420");
    expect(backlog).toContain("PR #419");
    expect(backlog).toContain("PR #420");
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
    expect(loopSnapshotSchema).not.toContain("Loopdeck MCP tools may expose");
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

  it("keeps CI setup actions on Node 24 compatible versions", () => {
    const workflow = readFileSync(
      join(process.cwd(), ".github/workflows/test.yml"),
      "utf8",
    );

    expect(workflow).toContain("pnpm/action-setup@v6");
    expect(workflow).not.toContain("pnpm/action-setup@v4");
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
      "latest main CI run `28750611089`",
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
      "main CI run `28750611089`",
      "test (22)",
      "test (24)",
      "Raw prompt bodies, raw local paths, and token-like secrets were not emitted",
    ]) {
      expect(releaseEvidence).toContain(releaseEvidenceText);
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
    expect(plan).toContain("scheduled `ui-patrol`");
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
      "prompt-coach show\n  --json",
      "`loop_outcomes`",
      "`effectiveness` verdict",
      "`Outcome evidence`",
      "docs/DOGFOOD_CODEX_CLAUDE_2026-07-05.md",
      "docs/DOGFOOD_WEB_USER_FLOW_2026-07-05.md",
      "workflow_dispatch run `28717406758`",
      "PR #464",
      "latest main CI run `28750611089`",
      "docs/RELEASE_STABILITY_EVIDENCE_2026-07-06.md",
      "corepack pnpm smoke:release",
      "no `schedule` event",
      "Remaining 9.5 blockers",
    ]) {
      expect(plan).toContain(currentEvidence);
    }
    for (const currentBacklogEvidence of [
      "prompt-linked outcome evidence",
      "CLI prompt outcome evidence",
      "Prompt effectiveness verdict",
      "MCP score_prompt effectiveness evidence",
      "`prompt-coach show --json`",
      "`expected_impact` predictions to actual raw-free loop outcomes",
      "`effectiveness` verdict",
      "effectiveness calibration",
      "PR #464",
      "latest main CI run `28750611089`",
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
      "prompt-coach setup --profile coach --register-mcp",
      "prompt-coach doctor codex",
      "prompt-coach doctor claude-code",
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

  it("documents the PromptLane repositioning before replacing Loopdeck branding", () => {
    const specPath =
      "docs/superpowers/specs/2026-07-05-promptlane-repositioning-design.md";
    const packageJson = readJson<{ files: string[] }>("package.json");
    const spec = readFileSync(join(process.cwd(), specPath), "utf8");

    expect(packageJson.files).toContain(specPath);
    expect(spec).toContain("# PromptLane Repositioning Design");
    expect(spec).toContain("Product name: PromptLane");
    expect(spec).toContain("Loopdeck is rejected as the primary product name");
    expect(spec).toContain("prompt improvement workspace");
    expect(spec).toContain("loop-aware continuation");
    expect(spec).toContain("Keep `prompt-coach`");
    expect(spec).toContain("TDD");
    expect(spec).not.toContain("TODO");
    expect(spec).not.toContain("TBD");
    expect(spec).not.toContain("sk-proj");
    expect(spec).not.toContain("/Users/");
  });

  it("ships the PromptLane product contract and marks Loopdeck as legacy", () => {
    const contractPath = "docs/PROMPTLANE.md";
    const legacyPath = "docs/LOOPDECK.md";
    const packageJson = readJson<{ files: string[] }>("package.json");
    const contract = readFileSync(join(process.cwd(), contractPath), "utf8");
    const legacy = readFileSync(join(process.cwd(), legacyPath), "utf8");
    const readme = readFileSync(join(process.cwd(), "README.md"), "utf8");
    const readmeKo = readFileSync(join(process.cwd(), "README.ko.md"), "utf8");

    expect(packageJson.files).toContain(contractPath);
    expect(packageJson.files).toContain(legacyPath);
    expect(contract).toContain("# PromptLane");
    expect(contract).toContain("Product name: PromptLane");
    expect(contract).toContain("prompt improvement workspace");
    expect(contract).toContain("loop-aware continuation");
    expect(contract).toContain("Keep `prompt-coach`");
    expect(contract).toContain("Do not auto-submit");
    expect(legacy).toContain("# Loopdeck Legacy Decision");
    expect(legacy).toContain("Loopdeck is not the primary product name");
    expect(legacy).toContain("PromptLane");
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
      expect(doc).toContain("`prompt-coach`");
      expect(doc).not.toContain(
        "Loopdeck is a local-first agent loop memory and meta-prompting workbench",
      );
      expect(doc).not.toContain(
        "Loopdeck is not a generic agent runtime",
      );
      expect(doc).not.toContain(
        "This document defines the technical design for Loopdeck",
      );
    }
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
    expect(smoke).toContain("prompt-coach agent setup smoke passed");
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

    expect(packageJson.files).toContain(
      "scripts/first-coach-loop-dogfood.mjs",
    );
    expect(packageJson.scripts["dogfood:first-coach-loop"]).toBe(
      "pnpm build && node scripts/first-coach-loop-dogfood.mjs",
    );
    expect(smoke).toContain("hook codex");
    expect(smoke).toContain("coach --json");
    expect(smoke).toContain("loop collect --json");
    expect(smoke).toContain("loop brief --json");
    expect(smoke).toContain("PROMPT_COACH_FIRST_LOOP_SECRET");
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
    expect(smoke).toContain("PROMPT_COACH_LOOP_MEMORY_SECRET");
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

  it("installs Playwright Chromium before the scheduled UI patrol", () => {
    const workflow = readFileSync(
      join(process.cwd(), ".github/workflows/ui-patrol.yml"),
      "utf8",
    );

    expect(workflow).toContain("pnpm/action-setup@v6");
    expect(workflow).not.toContain("pnpm/action-setup@v4");
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
    expect(packageJson.files).toContain("docs/LOOPDECK-LEGACY-SURFACES.md");
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
    expect(readme).toContain("it is a legacy CLI alias");
    expect(readmeKo).toContain("`loopdeck`는 legacy CLI alias");
    expect(packageContents).toContain("legacy loopdeck");
    expect(packageContents).toContain("docs/LOOPDECK-LEGACY-SURFACES.md");
  });

  it("ships an allowlist for remaining Loopdeck legacy surfaces", () => {
    const allowlistPath = "docs/LOOPDECK-LEGACY-SURFACES.md";
    const packageJson = readJson<{ files: string[] }>("package.json");
    const allowlist = readFileSync(join(process.cwd(), allowlistPath), "utf8");

    expect(packageJson.files).toContain(allowlistPath);
    expect(allowlist).toContain("# Loopdeck Legacy Surfaces");
    expect(allowlist).toContain("Product name: PromptLane");
    expect(allowlist).toContain("Default runtime command: `prompt-coach`");
    expect(allowlist).toContain("Legacy CLI alias: `loopdeck`");
    expect(allowlist).toContain("MCP compatibility tool: `get_loopdeck_status`");
    expect(allowlist).toContain("Historical planning docs");
    expect(allowlist).toContain("Do not add `/loopdeck:*` command files");
    expect(allowlist).toContain("Do not use Loopdeck as product-facing copy");
    expect(allowlist).not.toContain("TODO");
    expect(allowlist).not.toContain("TBD");
    expect(allowlist).not.toContain("sk-proj");
    expect(allowlist).not.toContain("/Users/");
  });

  it("marks shipped Loopdeck historical plans as superseded by PromptLane", () => {
    const packageJson = readJson<{ files: string[] }>("package.json");
    const historicalPlanPaths = packageJson.files.filter(
      (filePath) =>
        filePath.startsWith("docs/superpowers/plans/2026-07-04-loopdeck-") &&
        filePath.endsWith(".md"),
    );

    expect(historicalPlanPaths.length).toBeGreaterThan(0);
    for (const planPath of historicalPlanPaths) {
      const plan = readFileSync(join(process.cwd(), planPath), "utf8");
      expect(plan, planPath).toContain("Historical naming note");
      expect(plan, planPath).toContain("Current product name: PromptLane");
      expect(plan, planPath).toContain("Current runtime id: `prompt-coach`");
      expect(plan, planPath).toContain("See `docs/PROMPTLANE.md`");
      expect(plan, planPath).toContain("See `docs/LOOPDECK-LEGACY-SURFACES.md`");
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
