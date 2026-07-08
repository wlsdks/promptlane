#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import {
  chmodSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const cliPath = join(repoRoot, "dist", "cli", "index.js");
const tempRoot = mkdtempSync(join(tmpdir(), "promptlane-hook-binary-smoke-"));
const binDir = join(tempRoot, "bin");
const settingsPath = join(tempRoot, "claude-settings.json");
const hooksPath = join(tempRoot, "codex-hooks.json");
const payload = JSON.stringify({
  hook_event_name: "UserPromptSubmit",
  session_id: "hook-binary-smoke",
  cwd: join(tempRoot, "project"),
  prompt:
    "PROMPTLANE_SMOKE_SECRET sk-proj-hooksmoke1234567890 should never be printed.",
});

try {
  assertFileExists(
    cliPath,
    "Run `corepack pnpm build` before hook binary smoke.",
  );
  writeFileSync(settingsPath, JSON.stringify({ hooks: {} }));
  writeFileSync(hooksPath, JSON.stringify({ hooks: {} }));
  symlinkCli("promptlane");

  for (const binary of ["promptlane"]) {
    step(`${binary} hook status`);
    runBinary(binary, [
      "hook",
      "status",
      "--settings-path",
      settingsPath,
      "--hooks-path",
      hooksPath,
    ]);

    step(`${binary} hook claude-code fail-open`);
    assertCleanHookRun(
      runBinary(binary, ["hook", "claude-code"], { input: payload }),
    );

    step(`${binary} hook codex fail-open`);
    assertCleanHookRun(
      runBinary(binary, ["hook", "codex"], { input: payload }),
    );
  }

  console.log("hook binary smoke passed");
} finally {
  rmSync(tempRoot, { recursive: true, force: true });
}

function symlinkCli(name) {
  const target = join(binDir, name);
  if (!existsSync(binDir)) {
    mkdirSync(binDir, { recursive: true });
    chmodSync(tempRoot, 0o700);
  }
  try {
    symlinkSync(cliPath, target);
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
    throw new Error(`Failed to create ${name} symlink under ${binDir}.`);
  }
}

function runBinary(binary, args, options = {}) {
  const result = spawnSync(join(binDir, binary), args, {
    cwd: repoRoot,
    encoding: "utf8",
    input: options.input,
    env: {
      ...process.env,
      HOME: tempRoot,
      USERPROFILE: tempRoot,
    },
  });
  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    throw new Error(
      `${binary} ${args.join(" ")} exited ${result.status}\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`,
    );
  }
  assertNotIncludes(result.stdout, "PROMPTLANE_SMOKE_SECRET");
  assertNotIncludes(result.stderr, "PROMPTLANE_SMOKE_SECRET");
  assertNotIncludes(result.stdout, "sk-proj");
  assertNotIncludes(result.stderr, "sk-proj");
  return result;
}

function assertCleanHookRun(result) {
  assertEqual(result.status, 0, "Hook binary must fail open with exit 0.");
  assertEqual(result.stdout, "", "Fail-open hook must not print stdout.");
  assertEqual(result.stderr, "", "Fail-open hook must not print stderr.");
}

function assertFileExists(path, message) {
  if (!existsSync(path)) {
    throw new Error(message);
  }
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`${message}\nExpected: ${expected}\nReceived: ${actual}`);
  }
}

function assertNotIncludes(value, needle) {
  if (value.includes(needle)) {
    throw new Error(`Unexpected smoke output leak: ${needle}`);
  }
}

function step(message) {
  console.log(`- ${message}`);
}
