#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import {
  chmodSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const cliPath = join(repoRoot, "dist", "cli", "index.js");
const tempRoot = mkdtempSync(join(tmpdir(), "prompt-coach-agent-setup-smoke-"));
const homeDir = join(tempRoot, "home");
const binDir = join(tempRoot, "bin");
const dataDir = join(tempRoot, "data");
const settingsPath = join(tempRoot, "claude-settings.json");
const hooksPath = join(tempRoot, "codex-hooks.json");
const configPath = join(tempRoot, "codex-config.toml");
const plistPath = join(tempRoot, "LaunchAgents", "com.prompt-coach.server.plist");
const mcpConfigPath = join(tempRoot, "mcp-config.json");
const env = {
  ...process.env,
  HOME: homeDir,
  USERPROFILE: homeDir,
  PATH: `${binDir}${process.platform === "win32" ? ";" : ":"}${process.env.PATH ?? ""}`,
};

try {
  assertFileExists(cliPath, "Run `pnpm build` before agent setup smoke.");
  mkdirSync(homeDir, { recursive: true });
  mkdirSync(binDir, { recursive: true });
  writeExecutable(join(binDir, "claude"));
  writeExecutable(join(binDir, "codex"));

  step("Run prompt-coach setup --profile coach --register-mcp dry-run");
  const dryRun = runCli([
    "setup",
    "--profile",
    "coach",
    "--register-mcp",
    "--dry-run",
    "--no-service",
    "--data-dir",
    dataDir,
    "--settings-path",
    settingsPath,
    "--hooks-path",
    hooksPath,
    "--config-path",
    configPath,
    "--plist-path",
    plistPath,
  ]);
  assertIncludes(dryRun.stdout, "Profile: coach");
  assertIncludes(dryRun.stdout, "Claude Code hook");
  assertIncludes(dryRun.stdout, "Codex hook");
  assertIncludes(dryRun.stdout, "Claude Code MCP: preview");
  assertIncludes(dryRun.stdout, "Codex MCP: preview");
  assertNoSecretOutput(dryRun);

  step("Initialize storage for doctor checks");
  runCli(["init", "--data-dir", dataDir]);

  step("Run prompt-coach setup --profile coach --register-mcp");
  const setup = runCli([
    "setup",
    "--profile",
    "coach",
    "--register-mcp",
    "--no-service",
    "--data-dir",
    dataDir,
    "--settings-path",
    settingsPath,
    "--hooks-path",
    hooksPath,
    "--config-path",
    configPath,
    "--plist-path",
    plistPath,
  ]);
  assertIncludes(setup.stdout, "Profile: coach");
  assertIncludes(setup.stdout, "Send one real coding prompt in Claude Code or Codex");
  assertNoSecretOutput(setup);

  const claudeSettings = readFileSync(settingsPath, "utf8");
  const codexHooks = readFileSync(hooksPath, "utf8");
  const codexConfig = readFileSync(configPath, "utf8");
  assertIncludes(claudeSettings, "prompt-coach hook claude-code");
  assertIncludes(codexHooks, "prompt-coach hook codex");
  assertIncludes(codexConfig, "hooks = true");

  step("Run prompt-coach doctor claude-code");
  const claudeDoctor = runCli([
    "doctor",
    "claude-code",
    "--data-dir",
    dataDir,
    "--settings-path",
    settingsPath,
    "--mcp-config-path",
    mcpConfigPath,
  ]);
  assertIncludes(claudeDoctor.stdout, "prompt-coach doctor: claude-code");
  assertIncludes(claudeDoctor.stdout, "Claude Code hook");
  assertNoSecretOutput(claudeDoctor);

  step("Run prompt-coach doctor codex");
  const codexDoctor = runCli([
    "doctor",
    "codex",
    "--data-dir",
    dataDir,
    "--hooks-path",
    hooksPath,
    "--config-path",
    configPath,
    "--mcp-config-path",
    mcpConfigPath,
  ]);
  assertIncludes(codexDoctor.stdout, "prompt-coach doctor: codex");
  assertIncludes(codexDoctor.stdout, "Codex hook");
  assertIncludes(codexDoctor.stdout, "hooks enabled");
  assertNoSecretOutput(codexDoctor);

  console.log("prompt-coach agent setup smoke passed");
} finally {
  rmSync(tempRoot, { recursive: true, force: true });
}

function runCli(args) {
  const result = spawnSync(process.execPath, [cliPath, ...args], {
    cwd: repoRoot,
    encoding: "utf8",
    env,
  });
  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    throw new Error(
      `prompt-coach ${args.join(" ")} exited ${result.status}\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`,
    );
  }
  return result;
}

function writeExecutable(path) {
  writeFileSync(path, "#!/bin/sh\nexit 0\n");
  chmodSync(path, 0o755);
}

function step(message) {
  console.error(`agent setup smoke: ${message}`);
}

function assertFileExists(path, message) {
  if (!existsSync(path)) {
    throw new Error(message);
  }
}

function assertIncludes(value, needle) {
  if (!value.includes(needle)) {
    throw new Error(`Expected output to include ${JSON.stringify(needle)}.\nOutput:\n${value}`);
  }
}

function assertNoSecretOutput(result) {
  assertNotIncludes(result.stdout, "sk-proj");
  assertNotIncludes(result.stderr, "sk-proj");
}

function assertNotIncludes(value, needle) {
  if (value.includes(needle)) {
    throw new Error(`Unexpected smoke output leak: ${needle}`);
  }
}
