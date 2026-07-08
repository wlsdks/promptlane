#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
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
for (const [binName, expectedPath] of Object.entries({
  promptlane: "./dist/cli/index.js",
  "pl-claude": "./dist/cli/pl-claude.js",
  "pl-codex": "./dist/cli/pl-codex.js",
})) {
  check(
    `${binName} bin entry is registered`,
    packageJson.bin?.[binName] === expectedPath,
    packageJson.bin?.[binName],
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
}
check(
  "package files exclude dist/**/*.map",
  Array.isArray(packageJson.files) &&
    packageJson.files.includes("!dist/**/*.map"),
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
}

if (!options.skipNpm) {
  const whoami = run("npm", ["whoami"]);
  check(
    "npm authentication is available",
    whoami.status === 0 && whoami.stdout.trim().length > 0,
  );

  const viewVersions = run("npm", ["view", packageName, "versions", "--json"]);
  const versions = parseNpmVersions(viewVersions);
  check(
    `${packageName}@${version} has not already been published`,
    versions.ok && !versions.versions.includes(version),
    versions.detail,
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

function readSharedVersion() {
  const source = readFileSync(join(repoRoot, "src/shared/version.ts"), "utf8");
  return source.match(/VERSION\s*=\s*"([^"]+)"/)?.[1];
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

  return "Fix blocked checks before publishing.";
}

function sanitizeNpmDetail(value) {
  return value
    .replace(/npm_[A-Za-z0-9]{36,}/g, "[REDACTED:npm_token]")
    .split("\n")
    .filter(Boolean)
    .slice(0, 3)
    .join(" ");
}

function tagMismatchDetail({ expectedTag, head, tagTarget, tagError }) {
  if (tagError) {
    return `${expectedTag} is missing. Run the full release gate, then create the annotated tag before publishing.`;
  }
  return `tagged release commit ${tagTarget.slice(0, 12)} does not match HEAD ${head.slice(0, 12)}; run git checkout ${expectedTag}, rerun corepack pnpm npm-publish:preflight from the tagged checkout, then publish from that commit. If promptlane@${version} is unpublished and HEAD is the intended release, rerun the full gate, then git tag -fa ${expectedTag}. If promptlane@${version} is already published, bump version and create a new tag.`;
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
