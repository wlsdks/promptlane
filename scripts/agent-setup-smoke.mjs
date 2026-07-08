#!/usr/bin/env node
import { spawn, spawnSync } from "node:child_process";
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
const tempRoot = mkdtempSync(join(tmpdir(), "promptlane-agent-setup-smoke-"));
const homeDir = join(tempRoot, "home");
const binDir = join(tempRoot, "bin");
const dataDir = join(tempRoot, "data");
const settingsPath = join(tempRoot, "claude-settings.json");
const hooksPath = join(tempRoot, "codex-hooks.json");
const configPath = join(tempRoot, "codex-config.toml");
const plistPath = join(tempRoot, "LaunchAgents", "com.promptlane.server.plist");
const mcpConfigPath = join(tempRoot, "mcp-config.json");
const serverPort = 20_000 + Math.floor(Math.random() * 20_000);
const serverBaseUrl = `http://127.0.0.1:${serverPort}`;
const env = {
  ...process.env,
  HOME: homeDir,
  USERPROFILE: homeDir,
  PROMPTLANE_AGENT_SETUP_SMOKE_MCP_CONFIG: mcpConfigPath,
  PATH: `${binDir}${process.platform === "win32" ? ";" : ":"}${process.env.PATH ?? ""}`,
};
let serverProcess;

try {
  assertFileExists(
    cliPath,
    "Run `corepack pnpm build` before agent setup smoke.",
  );
  mkdirSync(homeDir, { recursive: true });
  mkdirSync(binDir, { recursive: true });
  writeExecutable(join(binDir, "claude"));
  writeExecutable(join(binDir, "codex"));

  step("Run promptlane setup --profile coach --register-mcp dry-run");
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
  configureSmokePort();

  step("Run promptlane setup --profile coach --register-mcp");
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
  assertIncludes(
    setup.stdout,
    "Send one Codex or Claude Code prompt, then run promptlane coach.",
  );
  assertNoSecretOutput(setup);

  const claudeSettings = readFileSync(settingsPath, "utf8");
  const codexHooks = readFileSync(hooksPath, "utf8");
  const codexConfig = readFileSync(configPath, "utf8");
  assertIncludes(claudeSettings, "promptlane hook claude-code");
  assertIncludes(codexHooks, "promptlane hook codex");
  assertIncludes(codexConfig, "hooks = true");

  step("Start local server for doctor checks");
  serverProcess = startServer();
  await waitForHealth(`${serverBaseUrl}/api/v1/health`);

  step("Run promptlane doctor claude-code");
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
  assertIncludes(claudeDoctor.stdout, "promptlane doctor: claude-code");
  assertIncludes(claudeDoctor.stdout, "Claude Code hook");
  assertNoSecretOutput(claudeDoctor);

  step("Run promptlane doctor codex");
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
  assertIncludes(codexDoctor.stdout, "promptlane doctor: codex");
  assertIncludes(codexDoctor.stdout, "Codex hook");
  assertIncludes(codexDoctor.stdout, "hooks enabled");
  assertNoSecretOutput(codexDoctor);

  console.log("promptlane agent setup smoke passed");
} finally {
  if (serverProcess) {
    serverProcess.kill("SIGTERM");
    await waitForExit(serverProcess);
  }
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
      `promptlane ${args.join(" ")} exited ${result.status}\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`,
    );
  }
  return result;
}

function startServer() {
  const child = spawn(
    process.execPath,
    [cliPath, "server", "--data-dir", dataDir],
    {
      cwd: repoRoot,
      encoding: "utf8",
      env,
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  child.stderr.on("data", (chunk) => {
    const text = Buffer.from(chunk).toString("utf8").trim();
    if (text) {
      console.error(text);
    }
  });
  return child;
}

async function waitForHealth(url) {
  const started = Date.now();
  while (Date.now() - started < 10_000) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return;
      }
    } catch {
      // Retry until the server starts listening.
    }
    await delay(100);
  }
  throw new Error("Server did not become healthy within 10 seconds.");
}

function configureSmokePort() {
  const configPath = join(dataDir, "config.json");
  const config = JSON.parse(readFileSync(configPath, "utf8"));
  config.server.port = serverPort;
  writeFileSync(configPath, `${JSON.stringify(config, null, 2)}\n`, {
    mode: 0o600,
  });
}

function waitForExit(child) {
  return new Promise((resolve) => {
    if (child.exitCode !== null) {
      resolve();
      return;
    }
    child.once("exit", () => resolve());
  });
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function writeExecutable(path) {
  writeFileSync(
    path,
    `#!/bin/sh
if [ "$1" = "mcp" ] && [ "$2" = "add" ] && [ -n "$PROMPTLANE_AGENT_SETUP_SMOKE_MCP_CONFIG" ]; then
  mkdir -p "$(dirname "$PROMPTLANE_AGENT_SETUP_SMOKE_MCP_CONFIG")"
  printf '{"mcpServers":{"promptlane":{"command":"promptlane","args":["mcp"]}}}\\n' > "$PROMPTLANE_AGENT_SETUP_SMOKE_MCP_CONFIG"
fi
if [ "$1" = "mcp" ] && [ "$2" = "list" ]; then
  printf 'promptlane  promptlane mcp\\n'
fi
exit 0
`,
  );
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
    throw new Error(
      `Expected output to include ${JSON.stringify(needle)}.\nOutput:\n${value}`,
    );
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
