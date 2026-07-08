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
check(
  "publish preflight script is included in package files",
  Array.isArray(packageJson.files) &&
    packageJson.files.includes("scripts/npm-publish-preflight.mjs"),
);

if (!options.skipGitClean) {
  const status = run("git", ["status", "--porcelain"]);
  check("git worktree is clean", status.status === 0 && status.stdout === "");
}

if (!options.skipGitTag) {
  const head = run("git", ["rev-parse", "HEAD"]);
  const tagTarget = run("git", ["rev-list", "-n", "1", expectedTag]);
  check(
    `${expectedTag} tag exists and points at HEAD`,
    head.status === 0 &&
      tagTarget.status === 0 &&
      head.stdout.trim() === tagTarget.stdout.trim(),
    tagTarget.stderr.trim() || tagTarget.stdout.trim(),
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
  next_action: passed
    ? "Run npm publish --tag latest only if the full release gate has passed."
    : "Fix blocked checks before publishing.",
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
    ...(detail ? { detail: String(detail).slice(0, 240) } : {}),
  });
}

function sanitizeNpmDetail(value) {
  return value
    .replace(/npm_[A-Za-z0-9]{36,}/g, "[REDACTED:npm_token]")
    .split("\n")
    .filter(Boolean)
    .slice(0, 3)
    .join(" ");
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
