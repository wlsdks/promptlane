#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

const repoRoot = resolve(new URL("..", import.meta.url).pathname);
const options = parseArgs(process.argv.slice(2));
const packageJson = readJson("package.json");
const version = packageJson.version;
const packageName = packageJson.name;
const expectedTag = `v${version}`;
const checks = [];

check("package version exists", Boolean(version));
check("package name is promptlane", packageName === "promptlane", packageName);
check("package is publishable", packageJson.private !== true);
check(
  "package description uses PromptLane positioning",
  packageJson.description ===
    "PromptLane local-first prompt improvement workspace for Codex, Claude Code, and long-running coding-agent work.",
  packageJson.description,
);
check(
  "package manager is pinned",
  packageJson.packageManager === "pnpm@10.18.0",
  packageJson.packageManager,
);
check(
  "node engine range is stable",
  packageJson.engines?.node === ">=22.12 <25",
  packageJson.engines?.node,
);
check("package license is set", packageJson.license === "MIT");
check(
  "package repository points at GitHub project",
  packageJson.repository?.url === "https://github.com/wlsdks/promptlane.git",
  packageJson.repository?.url,
);
check(
  "package homepage points at GitHub project",
  packageJson.homepage === "https://github.com/wlsdks/promptlane",
  packageJson.homepage,
);
check(
  "package bugs points at GitHub issues",
  packageJson.bugs?.url === "https://github.com/wlsdks/promptlane/issues",
  packageJson.bugs?.url,
);
check(
  "package keywords include public positioning terms",
  hasKeywords([
    "promptlane",
    "prompt-improvement",
    "local-first",
    "codex",
    "claude-code",
    "mcp",
    "worktrees",
  ]),
  Array.isArray(packageJson.keywords)
    ? packageJson.keywords.join(", ")
    : packageJson.keywords,
);
check(
  "package publish access is public",
  packageJson.publishConfig?.access === "public",
  packageJson.publishConfig?.access,
);
for (const [binName, expectedPath] of Object.entries({
  promptlane: "./dist/cli/index.js",
  "pl-claude": "./dist/cli/pl-claude.js",
  "pl-codex": "./dist/cli/pl-codex.js",
})) {
  const registeredPath = packageJson.bin?.[binName];
  check(
    `${binName} bin entry is registered`,
    registeredPath === expectedPath,
    registeredPath,
  );
  check(
    `${binName} bin target exists`,
    registeredPath === expectedPath && existsSync(packagePath(expectedPath)),
    expectedPath,
  );
  check(
    `${binName} bin target is executable`,
    registeredPath === expectedPath && isExecutablePath(expectedPath),
    expectedPath,
  );
}
check(
  "shared VERSION matches package.json",
  readSharedVersion() === version,
  readSharedVersion(),
);
check(
  "publish preflight package script is registered",
  packageJson.scripts?.["npm-publish:preflight"] ===
    "node scripts/npm-publish-preflight.mjs",
  packageJson.scripts?.["npm-publish:preflight"],
);
for (const [label, scriptName, expectedCommand] of [
  [
    "format package script is registered",
    "format",
    'prettier --check package.json tsconfig.json tsconfig.web.json vite.web.config.ts vitest.config.ts "scripts/**/*.mjs" "src/**/*.{ts,tsx,css}"',
  ],
  ["test package script is registered", "test", "vitest run"],
  [
    "lint package script is registered",
    "lint",
    "pnpm lint:types && pnpm lint:quality",
  ],
  [
    "build package script is registered",
    "build",
    "pnpm clean && pnpm build:server && pnpm build:web",
  ],
  ["prepack package script is registered", "prepack", "corepack pnpm build"],
  ["prepare package script is registered", "prepare", "corepack pnpm build"],
  [
    "pack dry-run package script is registered",
    "pack:dry-run",
    "node scripts/pack-dry-run.mjs",
  ],
  [
    "benchmark package script is registered",
    "benchmark",
    "corepack pnpm build && node scripts/benchmark.mjs",
  ],
  [
    "browser e2e package script is registered",
    "e2e:browser",
    "corepack pnpm build && node scripts/browser-e2e.mjs",
  ],
  [
    "release smoke package script is registered",
    "smoke:release",
    "corepack pnpm build && node scripts/release-smoke.mjs",
  ],
  [
    "package install smoke package script is registered",
    "smoke:package-install",
    "node scripts/package-install-smoke.mjs",
  ],
  [
    "quality evidence package script is registered",
    "evidence:quality",
    "node scripts/quality-95-evidence.mjs",
  ],
  [
    "installed CLI package script is registered",
    "promptlane",
    "node dist/cli/index.js",
  ],
]) {
  check(
    label,
    packageJson.scripts?.[scriptName] === expectedCommand,
    packageJson.scripts?.[scriptName],
  );
}
for (const filePath of [
  "dist",
  ".claude-plugin",
  "commands",
  "plugins",
  "integrations",
  "docs/PROMPTLANE.md",
  "docs/AGENT-HARNESS.md",
  "docs/INSTRUCTION-FILES.md",
  "docs/PLUGINS.md",
  "docs/ADAPTERS.md",
  "docs/LOOP-SNAPSHOT-SCHEMA.md",
  "docs/PROMPTLANE-RUNTIME-HISTORY.md",
  "docs/PROMPTLANE-LEGACY-SURFACES.md",
  "docs/DOGFOOD_CODEX_CLAUDE_2026-07-05.md",
  "docs/DOGFOOD_WEB_USER_FLOW_2026-07-05.md",
  "docs/superpowers/plans/2026-07-04-promptlane-plugin-rename-plan.md",
  "docs/superpowers/plans/2026-07-04-promptlane-plugin-rename-issue-slices.md",
  "docs/superpowers/plans/2026-07-04-promptlane-runtime-id-inventory.json",
  "docs/superpowers/plans/2026-07-04-promptlane-claude-dual-namespace-decision.md",
  "docs/superpowers/plans/2026-07-04-promptlane-mcp-server-name-decision.md",
  "docs/superpowers/plans/2026-07-04-promptlane-deprecation-readiness.md",
  "docs/superpowers/plans/2026-07-04-promptlane-next-runtime-value-slice.md",
  "docs/superpowers/plans/2026-07-05-promptlane-95-quality-plan.md",
  "docs/superpowers/specs/2026-07-05-promptlane-repositioning-design.md",
  "docs/PRD.md",
  "docs/PRD_PHASE2.md",
  "docs/ARCHITECTURE.md",
  "docs/EFFICIENCY_REVIEW.md",
  "docs/LEGAL_USAGE_GUIDE.md",
  "docs/TECH_SPEC.md",
  "docs/IMPLEMENTATION_PLAN.md",
  "docs/BENCHMARK_V1.md",
  "docs/FEATURE_AUDIT_2026-05-02.md",
  "docs/PRD2_COMPLETION_AUDIT.md",
  "docs/NPM_PUBLISHING.md",
  "docs/PACKAGE_CONTENTS.md",
  "docs/PRE_PUBLISH_PRIVACY_AUDIT.md",
  "docs/RELEASE_CHECKLIST.md",
  "docs/RELEASE_STABILITY_EVIDENCE_2026-07-06.md",
  "docs/LOCAL_95_EVIDENCE_2026-07-06.md",
  "docs/PRODUCT_POSITIONING_EVIDENCE_2026-07-06.md",
  "docs/UI_PATROL_EVIDENCE_2026-07-06.md",
  "docs/CODEX_CLAUDE_LOCAL_INTEGRATION_EVIDENCE_2026-07-06.md",
  "docs/NATIVE_DIALOG_DOGFOOD_AUDIT_2026-07-05.md",
  "docs/UI_PATROL_SCHEDULE_READINESS_2026-07-06.md",
  "README.md",
  "README.ko.md",
  "CHANGELOG.md",
  "LICENSE",
  "SECURITY.md",
  "CODE_OF_CONDUCT.md",
  "CONTRIBUTING.md",
  "SUPPORT.md",
  "scripts/npm-publish-preflight.mjs",
  "scripts/benchmark.mjs",
  "scripts/benchmark-fixtures.mjs",
  "scripts/agent-setup-smoke.mjs",
  "scripts/browser-e2e.mjs",
  "scripts/first-coach-loop-dogfood.mjs",
  "scripts/loop-memory-approval-dogfood.mjs",
  "scripts/hook-binary-smoke.mjs",
  "scripts/mcp-coach-loop-smoke.mjs",
  "scripts/mcp-elicitation-smoke.mjs",
  "scripts/mcp-native-dialog-approved.mjs",
  "scripts/mcp-native-dialog-preflight.mjs",
  "scripts/quality-95-evidence.mjs",
  "scripts/pack-dry-run.mjs",
  "scripts/package-install-smoke.mjs",
  "scripts/quality-gate.mjs",
  "scripts/release-smoke.mjs",
  "scripts/ui-patrol.mjs",
]) {
  check(
    `package files include ${filePath}`,
    Array.isArray(packageJson.files) && packageJson.files.includes(filePath),
  );
  if (requiresSourceControlledEntry(filePath)) {
    check(
      `package files entry exists ${filePath}`,
      existsSync(join(repoRoot, filePath)),
    );
  }
}
for (const filePath of [
  ".claude-plugin/plugin.json",
  ".claude-plugin/marketplace.json",
  "commands/buddy.md",
  "commands/coach.md",
  "commands/guard.md",
  "commands/habits.md",
  "commands/improve-last.md",
  "commands/judge.md",
  "commands/open.md",
  "commands/score.md",
  "commands/setup.md",
  "commands/status.md",
  "plugins/promptlane/.codex-plugin/plugin.json",
  "plugins/promptlane/skills/promptlane/SKILL.md",
  "integrations/claude-code/README.md",
  "integrations/claude-code/settings.example.json",
]) {
  check(
    `plugin artifact exists ${filePath}`,
    existsSync(join(repoRoot, filePath)),
  );
}
const claudePluginManifest = readOptionalJson(".claude-plugin/plugin.json");
const claudeMarketplaceManifest = readOptionalJson(
  ".claude-plugin/marketplace.json",
);
const codexPluginManifest = readOptionalJson(
  "plugins/promptlane/.codex-plugin/plugin.json",
);
check(
  "Claude plugin manifest identity is stable",
  claudePluginManifest?.name === "promptlane" &&
    claudePluginManifest?.description ===
      "PromptLane is a local-first prompt improvement workspace for Claude Code, Codex, and long-running coding-agent work.",
  claudePluginManifest?.name,
);
check(
  "Claude plugin manifest version matches package.json",
  claudePluginManifest?.version === version,
  claudePluginManifest?.version,
);
check(
  "Claude plugin manifest command list is complete",
  hasExactItems(claudePluginManifest?.commands, [
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
  ]),
  Array.isArray(claudePluginManifest?.commands)
    ? claudePluginManifest.commands.join(", ")
    : claudePluginManifest?.commands,
);
check(
  "Claude marketplace manifest points at local plugin",
  claudeMarketplaceManifest?.name === "promptlane" &&
    Array.isArray(claudeMarketplaceManifest?.plugins) &&
    claudeMarketplaceManifest.plugins.length === 1 &&
    claudeMarketplaceManifest.plugins[0]?.name === "promptlane" &&
    claudeMarketplaceManifest.plugins[0]?.source === "./",
  claudeMarketplaceManifest?.plugins?.[0]?.source,
);
check(
  "Claude marketplace manifest version matches package.json",
  claudeMarketplaceManifest?.metadata?.version === version,
  claudeMarketplaceManifest?.metadata?.version,
);
check(
  "Codex plugin manifest identity is stable",
  codexPluginManifest?.name === "promptlane" &&
    codexPluginManifest?.description ===
      "PromptLane is a local-first prompt improvement workspace for Codex, Claude Code, and long-running coding-agent work.",
  codexPluginManifest?.name,
);
check(
  "Codex plugin manifest skill path is registered",
  codexPluginManifest?.skills === "./skills/",
  codexPluginManifest?.skills,
);
check(
  "Codex plugin manifest display metadata is PromptLane",
  codexPluginManifest?.interface?.displayName === "PromptLane" &&
    codexPluginManifest?.interface?.shortDescription ===
      "PromptLane local-first prompt improvement workspace for coding-agent workflows" &&
    codexPluginManifest?.interface?.websiteURL ===
      "https://github.com/wlsdks/promptlane",
  codexPluginManifest?.interface?.displayName,
);
const codexSkillDoc = readText("plugins/promptlane/skills/promptlane/SKILL.md");
const claudeSetupCommandDoc = readText("commands/setup.md");
const claudeCoachCommandDoc = readText("commands/coach.md");
const claudeScoreCommandDoc = readText("commands/score.md");
check(
  "Codex plugin skill frontmatter is PromptLane",
  codexSkillDoc.includes("---\nname: promptlane\n") &&
    codexSkillDoc.includes(
      "description: Use when the user wants to install, verify, search, or troubleshoot PromptLane",
    ),
);
check(
  "Codex plugin skill documents local-first privacy boundary",
  includesAll(codexSkillDoc, [
    "stores coding-agent prompts and loop metadata locally",
    "redacts sensitive values before writing Markdown files",
    "does not install active hooks by itself",
    "Archive-backed tools do not return prompt bodies or raw paths",
  ]),
);
check(
  "Claude setup command documents npm install and setup path",
  includesAll(claudeSetupCommandDoc, [
    "npm install -g promptlane",
    "pnpm setup",
    "promptlane setup --profile coach --register-mcp",
    "--open-web",
  ]),
);
check(
  "Claude coach command documents MCP fallback and no auto-submit",
  includesAll(claudeCoachCommandDoc, [
    "promptlane:coach_prompt",
    "promptlane coach --json",
    "Do not auto-submit rewritten prompts",
  ]),
);
check(
  "Claude command docs preserve raw-free safety guidance",
  includesAll([claudeCoachCommandDoc, claudeScoreCommandDoc].join("\n"), [
    "Do not print raw prompt bodies",
    "raw hook payloads",
    "raw absolute paths",
    "tokens",
    "secrets",
  ]),
);
for (const [label, filePath] of [
  ["built CLI assets exist", "dist/cli"],
  ["built server assets exist", "dist/server"],
  ["built web assets exist", "dist/web"],
]) {
  check(label, isDirectoryPath(filePath), filePath);
}
check(
  "package files exclude dist/**/*.map",
  Array.isArray(packageJson.files) &&
    packageJson.files.includes("!dist/**/*.map"),
);
check(
  "package files exclude local-only source and runtime entries",
  packageFilesExcludeLocalOnlyEntries(),
  localOnlyPackageFilesDetail(),
);
check(
  "package files exclude secret, database, log, and artifact globs",
  packageFilesExcludeSecretDatabaseLogAndArtifactGlobs(),
  secretDatabaseLogAndArtifactPackageFilesDetail(),
);
check(
  "pre-publish privacy audit mirrors runtime token detectors",
  privacyAuditMirrorsRuntimeTokenDetectors(),
  "docs/PRE_PUBLISH_PRIVACY_AUDIT.md should include the token families guarded by src/redaction/detectors.ts",
);
check(
  "pre-publish privacy audit mirrors runtime path detectors",
  privacyAuditMirrorsRuntimePathDetectors(),
  "docs/PRE_PUBLISH_PRIVACY_AUDIT.md should include the local path families guarded by src/redaction/detectors.ts",
);

if (!options.skipGitClean) {
  const status = run("git", ["status", "--porcelain"]);
  check("git worktree is clean", status.status === 0 && status.stdout === "");
}

if (!options.skipGitTag) {
  const head = run("git", ["rev-parse", "HEAD"]);
  const tagTarget = run("git", ["rev-list", "-n", "1", expectedTag]);
  const tagMatchesHead =
    head.status === 0 &&
    tagTarget.status === 0 &&
    head.stdout.trim() === tagTarget.stdout.trim();
  check(
    `${expectedTag} tag exists and points at HEAD`,
    tagMatchesHead,
    tagMatchesHead
      ? "tagged release commit matches HEAD"
      : tagMismatchDetail({
          expectedTag,
          head: head.stdout.trim(),
          tagTarget: tagTarget.stdout.trim(),
          tagError: tagTarget.stderr.trim(),
        }),
  );
  if (tagMatchesHead) {
    const tagType = run("git", ["cat-file", "-t", expectedTag]);
    const tagIsAnnotated =
      tagType.status === 0 && tagType.stdout.trim() === "tag";
    check(
      `${expectedTag} tag is annotated`,
      tagIsAnnotated,
      tagIsAnnotated
        ? "release tag is annotated"
        : `${expectedTag} is not an annotated tag. Rerun the full release gate, then create or refresh the annotated tag with git tag -fa ${expectedTag} -m "promptlane ${version}".`,
    );
    if (tagIsAnnotated) {
      const originTagTarget = run("git", [
        "ls-remote",
        "--tags",
        "origin",
        `refs/tags/${expectedTag}^{}`,
      ]);
      const originCommit = parseLsRemoteCommit(originTagTarget.stdout);
      const localCommit = tagTarget.stdout.trim();
      const originTagMatches =
        originTagTarget.status === 0 && originCommit === localCommit;
      check(
        `${expectedTag} origin tag matches local release tag`,
        originTagMatches,
        originTagMatches
          ? "origin release tag matches local tagged commit"
          : originTagMismatchDetail({
              expectedTag,
              localCommit,
              originCommit,
              originError: originTagTarget.stderr.trim(),
            }),
      );
    }
  }
}

if (!options.skipNpm) {
  const whoami = run("npm", ["whoami"]);
  const npmAuthOk = whoami.status === 0 && whoami.stdout.trim().length > 0;
  check(
    "npm authentication is available",
    npmAuthOk,
    npmAuthDetail({ result: whoami, ok: npmAuthOk }),
  );

  const viewVersions = run("npm", ["view", packageName, "versions", "--json"]);
  const versions = parseNpmVersions(viewVersions);
  check(
    `${packageName}@${version} has not already been published`,
    versions.ok && !versions.versions.includes(version),
    npmVersionAvailabilityDetail({ versions }),
  );
}

const passed = checks.every((item) => item.ok);
const summary = {
  check: "npm_publish_preflight",
  package: packageName,
  version,
  expected_tag: expectedTag,
  status: passed ? "ready" : "blocked",
  skipped: {
    npm: options.skipNpm,
    git_clean: options.skipGitClean,
    git_tag: options.skipGitTag,
  },
  checks,
  next_action: nextAction({ passed, checks }),
};

if (options.json) {
  console.log(JSON.stringify(summary, null, 2));
} else {
  console.log(formatSummary(summary));
}

if (!passed) {
  process.exitCode = 1;
}

function parseArgs(args) {
  return {
    json: args.includes("--json"),
    skipNpm: args.includes("--skip-npm"),
    skipGitClean: args.includes("--skip-git-clean"),
    skipGitTag: args.includes("--skip-git-tag"),
  };
}

function readJson(path) {
  return JSON.parse(readFileSync(join(repoRoot, path), "utf8"));
}

function readOptionalJson(path) {
  try {
    return readJson(path);
  } catch {
    return undefined;
  }
}

function readText(path) {
  try {
    return readFileSync(join(repoRoot, path), "utf8");
  } catch {
    return "";
  }
}

function packagePath(path) {
  return join(repoRoot, path.startsWith("./") ? path.slice(2) : path);
}

function isExecutablePath(path) {
  try {
    return Boolean(statSync(packagePath(path)).mode & 0o111);
  } catch {
    return false;
  }
}

function isDirectoryPath(path) {
  try {
    return statSync(packagePath(path)).isDirectory();
  } catch {
    return false;
  }
}

function requiresSourceControlledEntry(filePath) {
  return filePath !== "dist" && !filePath.startsWith("!");
}

function hasKeywords(expectedKeywords) {
  return (
    Array.isArray(packageJson.keywords) &&
    expectedKeywords.every((keyword) => packageJson.keywords.includes(keyword))
  );
}

function hasExactItems(actualItems, expectedItems) {
  return (
    Array.isArray(actualItems) &&
    actualItems.length === expectedItems.length &&
    expectedItems.every((item) => actualItems.includes(item))
  );
}

function includesAll(value, expectedSnippets) {
  const normalizedValue = normalizeWhitespace(value);
  return expectedSnippets.every((snippet) =>
    normalizedValue.includes(normalizeWhitespace(snippet)),
  );
}

function normalizeWhitespace(value) {
  return String(value).replace(/\s+/g, " ").trim();
}

function readSharedVersion() {
  const source = readFileSync(join(repoRoot, "src/shared/version.ts"), "utf8");
  return source.match(/VERSION\s*=\s*"([^"]+)"/)?.[1];
}

function packageFilesExcludeLocalOnlyEntries() {
  return localOnlyPackageFileEntries().length === 0;
}

function localOnlyPackageFilesDetail() {
  const blockedEntries = localOnlyPackageFileEntries();
  return blockedEntries.length
    ? `local-only entries must not ship: ${blockedEntries.join(", ")}`
    : "package files omit source, tests, CI, dependency, coverage, and runtime data entries";
}

function localOnlyPackageFileEntries() {
  if (!Array.isArray(packageJson.files)) {
    return ["package.json#files is not an array"];
  }
  const blockedPrefixes = [
    "src",
    "tests",
    "test",
    ".github",
    "node_modules",
    "coverage",
    ".codex",
    ".promptlane",
    ".prompt-memory",
    ".prompt-coach",
    "promptlane-data",
    "prompt-memory-data",
    "prompt-coach-data",
  ];

  return packageJson.files.filter((entry) => {
    const normalized = String(entry).replace(/^\.\//, "").replace(/\/+$/, "");
    return blockedPrefixes.some(
      (prefix) => normalized === prefix || normalized.startsWith(`${prefix}/`),
    );
  });
}

function packageFilesExcludeSecretDatabaseLogAndArtifactGlobs() {
  return secretDatabaseLogAndArtifactPackageFileEntries().length === 0;
}

function secretDatabaseLogAndArtifactPackageFilesDetail() {
  const blockedEntries = secretDatabaseLogAndArtifactPackageFileEntries();
  return blockedEntries.length
    ? `secret, database, log, or package artifact entries must not ship: ${blockedEntries.join(", ")}`
    : "package files omit environment, key, database, log, and package artifact globs";
}

function secretDatabaseLogAndArtifactPackageFileEntries() {
  if (!Array.isArray(packageJson.files)) {
    return ["package.json#files is not an array"];
  }
  const blockedExactEntries = [
    ".env",
    ".env.*",
    "*.pem",
    "*.key",
    "*.db",
    "*.db-*",
    "*.sqlite",
    "*.sqlite3",
    "*.log",
    "*.tgz",
    "npm-debug.log*",
    "yarn-debug.log*",
    "yarn-error.log*",
    "pnpm-debug.log*",
  ];

  return packageJson.files.filter((entry) =>
    blockedExactEntries.includes(String(entry).replace(/^\.\//, "")),
  );
}

function privacyAuditMirrorsRuntimeTokenDetectors() {
  const detectorSource = readText("src/redaction/detectors.ts");
  const privacyAudit = readText("docs/PRE_PUBLISH_PRIVACY_AUDIT.md");
  const requiredMirrors = [
    ["bearer_token", "bearer\\s+"],
    ["eyJ[a-zA-Z0-9_-]+", "eyJ[A-Za-z0-9_-]+"],
    ["AIza[0-9A-Za-z_-]{20,}", "AIza[0-9A-Za-z_-]{20,}"],
    ["npm_[A-Za-z0-9]{30,}", "npm_[A-Za-z0-9]{30,}"],
    [
      "(?:sk|pk|ghp|github_pat|xoxb|AKIA)",
      "(?:sk|pk|ghp|github_pat|xoxb|AKIA)",
    ],
    [
      "postgres|postgresql|mysql|mongodb|redis",
      "(?:postgres|postgresql|mysql|mongodb|redis)://",
    ],
    ["hooks\\.", "https://hooks\\."],
  ];

  return requiredMirrors.every(
    ([sourceSnippet, auditSnippet]) =>
      detectorSource.includes(sourceSnippet) &&
      privacyAudit.includes(auditSnippet),
  );
}

function privacyAuditMirrorsRuntimePathDetectors() {
  const detectorSource = readText("src/redaction/detectors.ts");
  const privacyAudit = readText("docs/PRE_PUBLISH_PRIVACY_AUDIT.md");
  const requiredMirrors = [
    [
      "Users|home|private|tmp|var|opt|workspace|Volumes",
      "(?:Users|home|private|tmp|var|opt|workspace|Volumes)",
    ],
  ];

  return requiredMirrors.every(
    ([sourceSnippet, auditSnippet]) =>
      detectorSource.includes(sourceSnippet) &&
      privacyAudit.includes(auditSnippet),
  );
}

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: repoRoot,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });

  return {
    status: result.status ?? 1,
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
  };
}

function parseNpmVersions(result) {
  if (result.status !== 0) {
    const combined = `${result.stdout}\n${result.stderr}`;
    if (combined.includes("E404")) {
      return {
        ok: true,
        versions: [],
        detail: "package name is not published yet",
      };
    }
    return {
      ok: false,
      versions: [],
      detail: sanitizeNpmDetail(combined),
    };
  }

  try {
    const parsed = JSON.parse(result.stdout);
    return {
      ok: true,
      versions: Array.isArray(parsed) ? parsed : [String(parsed)],
      detail: "npm registry returned versions",
    };
  } catch {
    return {
      ok: false,
      versions: [],
      detail: "npm registry response was not valid JSON",
    };
  }
}

function npmVersionAvailabilityDetail({ versions }) {
  if (!versions.ok) {
    return versions.detail;
  }

  if (versions.versions.includes(version)) {
    return `${packageName}@${version} is already published; do not retarget ${expectedTag}. To publish again, bump package.json and src/shared/version.ts, rerun the full release gate, and create a new release tag.`;
  }

  return versions.detail;
}

function npmAuthDetail({ result, ok }) {
  if (ok) {
    return "npm whoami returned an authenticated username";
  }

  const detail = sanitizeNpmDetail(`${result.stdout}\n${result.stderr}`);
  return [
    "npm whoami failed; run npm login, then rerun corepack pnpm npm-publish:preflight",
    detail,
  ]
    .filter(Boolean)
    .join(". ");
}

function check(label, ok, detail = "") {
  checks.push({
    label,
    ok: Boolean(ok),
    ...(detail ? { detail: String(detail).slice(0, 500) } : {}),
  });
}

function nextAction({ passed, checks }) {
  if (passed) {
    return "Run npm publish --tag latest only if the full release gate has passed.";
  }

  const failedLabels = checks
    .filter((item) => !item.ok)
    .map((item) => item.label);
  if (
    failedLabels.length === 1 &&
    failedLabels[0] === "npm authentication is available"
  ) {
    return "Run npm login, rerun corepack pnpm npm-publish:preflight, then run npm publish --tag latest only after the full release gate has passed.";
  }

  if (
    failedLabels.length === 1 &&
    failedLabels[0].endsWith("has not already been published")
  ) {
    return "Bump package.json and src/shared/version.ts, create a new release tag, then rerun the full release gate.";
  }

  const tagMismatch = failedLabels.find((label) =>
    label.endsWith("tag exists and points at HEAD"),
  );
  if (tagMismatch) {
    return `${expectedTag} tag does not point at HEAD. Run git checkout ${expectedTag} to publish the tagged commit, or if promptlane@${version} is unpublished and HEAD is the intended release, rerun the full release gate and git tag -fa ${expectedTag}; if already published, bump version and create a new tag.`;
  }

  const unannotatedTag = failedLabels.find((label) =>
    label.endsWith("tag is annotated"),
  );
  if (unannotatedTag) {
    return `${expectedTag} tag is not annotated. Rerun the full release gate, then git tag -fa ${expectedTag} -m "promptlane ${version}" and rerun corepack pnpm npm-publish:preflight.`;
  }

  const originTagMismatch = failedLabels.find((label) =>
    label.endsWith("origin tag matches local release tag"),
  );
  if (originTagMismatch) {
    return `origin ${expectedTag} tag does not match local ${expectedTag}. Rerun the full release gate, then git push origin ${expectedTag} --force and rerun corepack pnpm npm-publish:preflight before publishing.`;
  }

  return "Fix blocked checks before publishing.";
}

function sanitizeNpmDetail(value) {
  return value
    .replace(/npm_[A-Za-z0-9]{36,}/g, "[REDACTED:npm_token]")
    .replace(
      /(?:\/Users|\/home|\/private|\/tmp|\/var|\/opt|\/workspace|\/Volumes)\/\S+/g,
      "[REDACTED:local_path]",
    )
    .replace(/[A-Za-z]:\\Users\\\S+/g, "[REDACTED:local_path]")
    .split("\n")
    .filter((line) => {
      const trimmed = line.trim();
      return (
        trimmed.length > 0 &&
        !trimmed.includes("Unknown env config") &&
        !trimmed.includes("This will stop working in the next major version")
      );
    })
    .slice(0, 3)
    .join(" ");
}

function tagMismatchDetail({ expectedTag, head, tagTarget, tagError }) {
  if (tagError) {
    return `${expectedTag} is missing. Run the full release gate, then create the annotated tag before publishing.`;
  }
  return `tagged release commit ${tagTarget.slice(0, 12)} does not match HEAD ${head.slice(0, 12)}; run git checkout ${expectedTag}, rerun corepack pnpm npm-publish:preflight from the tagged checkout, then publish from that commit. If promptlane@${version} is unpublished and HEAD is the intended release, rerun the full gate, then git tag -fa ${expectedTag}. If promptlane@${version} is already published, bump version and create a new tag.`;
}

function parseLsRemoteCommit(stdout) {
  return stdout.trim().split(/\s+/)[0] ?? "";
}

function originTagMismatchDetail({
  expectedTag,
  localCommit,
  originCommit,
  originError,
}) {
  if (originError) {
    return `could not verify origin/${expectedTag}: ${originError}. Rerun the full release gate, then push the annotated tag with git push origin ${expectedTag} --force before publishing.`;
  }
  if (!originCommit) {
    return `origin/${expectedTag} is missing. Rerun the full release gate, then push the annotated tag with git push origin ${expectedTag} --force before publishing.`;
  }
  return `origin/${expectedTag} commit ${originCommit.slice(0, 12)} does not match local release tag ${localCommit.slice(0, 12)}. Rerun the full release gate, then push the annotated tag with git push origin ${expectedTag} --force before publishing.`;
}

function formatSummary(summary) {
  return [
    "PromptLane npm publish preflight",
    `Status: ${summary.status}`,
    `Package: ${summary.package}@${summary.version}`,
    `Expected tag: ${summary.expected_tag}`,
    "",
    "Checks",
    ...summary.checks.map(
      (item) =>
        `- ${item.ok ? "pass" : "fail"}: ${item.label}${item.detail ? ` (${item.detail})` : ""}`,
    ),
    "",
    `Next action: ${summary.next_action}`,
  ].join("\n");
}
