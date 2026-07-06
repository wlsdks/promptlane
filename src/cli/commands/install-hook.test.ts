import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { afterEach, describe, expect, it } from "vitest";

import { initializePromptLane, loadHookAuth } from "../../config/config.js";
import {
  installCodexHook,
  installClaudeCodeHook,
  uninstallCodexHook,
  uninstallClaudeCodeHook,
} from "./install-hook.js";

const tempDirs: string[] = [];

afterEach(() => {
  while (tempDirs.length > 0) {
    const dir = tempDirs.pop();
    if (dir) {
      rmSync(dir, { recursive: true, force: true });
    }
  }
});

describe("Claude Code hook install/uninstall", () => {
  it("dry-run reports the intended diff without writing settings", () => {
    const dir = createTempDir();
    const dataDir = join(dir, "data");
    const settingsPath = join(dir, "settings.json");
    initializePromptLane({ dataDir });

    const result = installClaudeCodeHook({
      dataDir,
      settingsPath,
      dryRun: true,
    });

    expect(result.changed).toBe(true);
    expect(result.dryRun).toBe(true);
    expect(result.nextSettings.hooks.UserPromptSubmit).toHaveLength(1);
    expect(result.nextSettings.hooks.Stop).toHaveLength(1);
    expect(result.nextSettings.hooks.PreCompact).toHaveLength(1);
    expect(result.nextSettings.hooks.PostCompact).toHaveLength(1);
    expect(() => readFileSync(settingsPath, "utf8")).toThrow();
  });

  it("installs once, preserves unrelated settings, and creates backup", () => {
    const dir = createTempDir();
    const dataDir = join(dir, "data");
    const settingsPath = join(dir, "settings.json");
    initializePromptLane({ dataDir });
    writeFileSync(
      settingsPath,
      `${JSON.stringify({ theme: "dark", hooks: { Stop: [] } }, null, 2)}\n`,
    );

    const first = installClaudeCodeHook({ dataDir, settingsPath });
    const second = installClaudeCodeHook({ dataDir, settingsPath });
    const settings = JSON.parse(readFileSync(settingsPath, "utf8"));

    expect(first.changed).toBe(true);
    expect(second.changed).toBe(false);
    expect(first.backupPath).toBeTruthy();
    expect(settings.theme).toBe("dark");
    expect(settings.hooks.UserPromptSubmit).toHaveLength(1);
    expect(settings.hooks.UserPromptSubmit[0].hooks).toHaveLength(1);
    expect(settings.hooks.UserPromptSubmit[0].hooks[0].command).toContain(
      "promptlane hook claude-code",
    );
    expect(settings.hooks.Stop).toHaveLength(1);
    expect(settings.hooks.Stop[0].hooks[0].command).toContain(
      "promptlane hook claude-code",
    );
    expect(settings.hooks.PreCompact).toHaveLength(1);
    expect(settings.hooks.PostCompact).toHaveLength(1);
    expect(settings.hooks.UserPromptSubmit[0].hooks[0].command).not.toContain(
      loadHookAuth(dataDir).ingest_token,
    );
  });

  it("can install Claude Code hook with opt-in rewrite guard flags", () => {
    const dir = createTempDir();
    const dataDir = join(dir, "data");
    const settingsPath = join(dir, "settings.json");
    initializePromptLane({ dataDir });

    const result = installClaudeCodeHook({
      dataDir,
      settingsPath,
      dryRun: true,
      rewriteGuard: "block-and-copy",
      rewriteMinScore: "85",
      rewriteLanguage: "ko",
    });

    const command =
      result.nextSettings.hooks.UserPromptSubmit[0].hooks[0].command;
    expect(command).toContain("promptlane hook claude-code");
    expect(command).toContain("--rewrite-guard");
    expect(command).toContain("block-and-copy");
    expect(command).toContain("--rewrite-min-score");
    expect(command).toContain("85");
    expect(command).toContain("--rewrite-language");
    expect(command).toContain("ko");
  });

  it("can install an opt-in Claude Code SessionStart web opener", () => {
    const dir = createTempDir();
    const dataDir = join(dir, "data");
    const settingsPath = join(dir, "settings.json");
    initializePromptLane({ dataDir });

    const result = installClaudeCodeHook({
      dataDir,
      settingsPath,
      dryRun: true,
      openWeb: true,
    });

    expect(result.nextSettings.hooks.UserPromptSubmit).toHaveLength(1);
    expect(result.nextSettings.hooks.SessionStart).toHaveLength(1);
    const command = result.nextSettings.hooks.SessionStart[0].hooks[0].command;
    expect(command).toContain("promptlane hook session-start claude-code");
    expect(command).toContain("--open-web");
    expect(command).not.toContain(loadHookAuth(dataDir).ingest_token);
  });

  it("uninstalls hook and revokes the previous ingest token", () => {
    const dir = createTempDir();
    const dataDir = join(dir, "data");
    const settingsPath = join(dir, "settings.json");
    initializePromptLane({ dataDir });
    const oldToken = loadHookAuth(dataDir).ingest_token;
    installClaudeCodeHook({ dataDir, settingsPath });

    const result = uninstallClaudeCodeHook({ dataDir, settingsPath });
    const settings = JSON.parse(readFileSync(settingsPath, "utf8"));

    expect(result.changed).toBe(true);
    expect(settings.hooks.UserPromptSubmit).toEqual([]);
    expect(settings.hooks.SessionStart).toEqual([]);
    expect(loadHookAuth(dataDir).ingest_token).not.toBe(oldToken);
  });
});

describe("Codex hook install/uninstall", () => {
  it("dry-run reports hooks.json and config.toml changes without writing", () => {
    const dir = createTempDir();
    const dataDir = join(dir, "data");
    const hooksPath = join(dir, ".codex", "hooks.json");
    const configPath = join(dir, ".codex", "config.toml");
    initializePromptLane({ dataDir });

    const result = installCodexHook({
      dataDir,
      hooksPath,
      configPath,
      dryRun: true,
    });

    expect(result.changed).toBe(true);
    expect(result.dryRun).toBe(true);
    expect(result.nextHooks.hooks.UserPromptSubmit).toHaveLength(1);
    expect(result.nextHooks.hooks.Stop).toHaveLength(1);
    expect(result.nextHooks.hooks.PreCompact).toHaveLength(1);
    expect(result.nextHooks.hooks.PostCompact).toHaveLength(1);
    expect(result.nextConfig).toContain("[features]");
    expect(result.nextConfig).toContain("hooks = true");
    expect(() => readFileSync(hooksPath, "utf8")).toThrow();
    expect(() => readFileSync(configPath, "utf8")).toThrow();
  });

  it("installs once, preserves unrelated hooks/config, and creates backups", () => {
    const dir = createTempDir();
    const dataDir = join(dir, "data");
    const hooksPath = join(dir, ".codex", "hooks.json");
    const configPath = join(dir, ".codex", "config.toml");
    initializePromptLane({ dataDir });
    mkdirSync(join(dir, ".codex"), { recursive: true });
    writeFileSync(
      hooksPath,
      `${JSON.stringify(
        {
          hooks: {
            Stop: [{ hooks: [{ type: "command", command: "echo stop" }] }],
          },
        },
        null,
        2,
      )}\n`,
    );
    writeFileSync(
      configPath,
      'model = "gpt-5.5"\n[features]\ncodex_hooks = false\n',
    );

    const first = installCodexHook({ dataDir, hooksPath, configPath });
    const second = installCodexHook({ dataDir, hooksPath, configPath });
    const hooks = JSON.parse(readFileSync(hooksPath, "utf8"));
    const config = readFileSync(configPath, "utf8");

    expect(first.changed).toBe(true);
    expect(second.changed).toBe(false);
    expect(first.hooksBackupPath).toBeTruthy();
    expect(first.configBackupPath).toBeTruthy();
    expect(hooks.hooks.Stop).toHaveLength(2);
    expect(hooks.hooks.Stop[0].hooks[0].command).toBe("echo stop");
    expect(hooks.hooks.Stop[1].hooks[0].command).toContain(
      "promptlane hook stop codex",
    );
    expect(hooks.hooks.PreCompact).toHaveLength(1);
    expect(hooks.hooks.PostCompact).toHaveLength(1);
    expect(hooks.hooks.UserPromptSubmit).toHaveLength(1);
    expect(hooks.hooks.UserPromptSubmit[0].hooks[0].command).toContain(
      "promptlane hook codex",
    );
    expect(hooks.hooks.UserPromptSubmit[0].hooks[0].command).not.toContain(
      loadHookAuth(dataDir).ingest_token,
    );
    expect(config).toContain('model = "gpt-5.5"');
    expect(config).toContain("hooks = true");
    expect(config).not.toContain("codex_hooks");
  });

  it("replaces legacy prompt-memory Codex hook during install", () => {
    const dir = createTempDir();
    const dataDir = join(dir, "data");
    const hooksPath = join(dir, ".codex", "hooks.json");
    const configPath = join(dir, ".codex", "config.toml");
    initializePromptLane({ dataDir });
    mkdirSync(join(dir, ".codex"), { recursive: true });
    writeFileSync(
      hooksPath,
      `${JSON.stringify(
        {
          hooks: {
            UserPromptSubmit: [
              {
                hooks: [
                  {
                    type: "command",
                    command:
                      'PROMPT_MEMORY_HOOK="prompt-memory hook codex" /usr/bin/node /repo/dist/cli/index.js hook codex --rewrite-guard "context"',
                    timeout: 2,
                  },
                ],
              },
            ],
          },
        },
        null,
        2,
      )}\n`,
    );

    const result = installCodexHook({
      dataDir,
      hooksPath,
      configPath,
      rewriteGuard: "context",
      rewriteMinScore: "80",
    });
    const hooks = JSON.parse(readFileSync(hooksPath, "utf8"));

    expect(result.changed).toBe(true);
    expect(hooks.hooks.UserPromptSubmit).toHaveLength(1);
    expect(hooks.hooks.UserPromptSubmit[0].hooks).toHaveLength(1);
    expect(hooks.hooks.UserPromptSubmit[0].hooks[0].command).toContain(
      'PROMPTLANE_HOOK="promptlane hook codex"',
    );
    expect(hooks.hooks.UserPromptSubmit[0].hooks[0].command).not.toContain(
      "PROMPT_MEMORY_HOOK",
    );
  });

  it("deduplicates legacy and current Codex hooks during install", () => {
    const dir = createTempDir();
    const dataDir = join(dir, "data");
    const hooksPath = join(dir, ".codex", "hooks.json");
    const configPath = join(dir, ".codex", "config.toml");
    initializePromptLane({ dataDir });
    mkdirSync(join(dir, ".codex"), { recursive: true });
    writeFileSync(
      hooksPath,
      `${JSON.stringify(
        {
          hooks: {
            UserPromptSubmit: [
              {
                hooks: [
                  {
                    type: "command",
                    command:
                      'PROMPT_MEMORY_HOOK="prompt-memory hook codex" /usr/bin/node /repo/dist/cli/index.js hook codex --rewrite-guard "context"',
                    timeout: 2,
                  },
                ],
              },
              {
                hooks: [
                  {
                    type: "command",
                    command:
                      'PROMPTLANE_HOOK="promptlane hook codex" /usr/bin/node /repo/dist/cli/index.js hook codex --rewrite-guard "context"',
                    timeout: 2,
                  },
                ],
              },
            ],
          },
        },
        null,
        2,
      )}\n`,
    );

    installCodexHook({
      dataDir,
      hooksPath,
      configPath,
      rewriteGuard: "context",
      rewriteMinScore: "80",
    });
    const hooks = JSON.parse(readFileSync(hooksPath, "utf8"));

    expect(hooks.hooks.UserPromptSubmit).toHaveLength(1);
    expect(hooks.hooks.UserPromptSubmit[0].hooks).toHaveLength(1);
    expect(hooks.hooks.UserPromptSubmit[0].hooks[0].command).toContain(
      'PROMPTLANE_HOOK="promptlane hook codex"',
    );
    expect(JSON.stringify(hooks)).not.toContain("PROMPT_MEMORY_HOOK");
  });

  it("can install Codex hook with opt-in rewrite guard flags", () => {
    const dir = createTempDir();
    const dataDir = join(dir, "data");
    const hooksPath = join(dir, ".codex", "hooks.json");
    const configPath = join(dir, ".codex", "config.toml");
    initializePromptLane({ dataDir });

    const result = installCodexHook({
      dataDir,
      hooksPath,
      configPath,
      dryRun: true,
      rewriteGuard: "context",
      rewriteMinScore: "70",
    });

    const command = result.nextHooks.hooks.UserPromptSubmit[0].hooks[0].command;
    expect(command).toContain("promptlane hook codex");
    expect(command).toContain("--rewrite-guard");
    expect(command).toContain("context");
    expect(command).toContain("--rewrite-min-score");
    expect(command).toContain("70");
  });

  it("keeps Codex lifecycle hooks separate from prompt rewrite guard output", () => {
    const dir = createTempDir();
    const dataDir = join(dir, "data");
    const hooksPath = join(dir, ".codex", "hooks.json");
    const configPath = join(dir, ".codex", "config.toml");
    initializePromptLane({ dataDir });

    const result = installCodexHook({
      dataDir,
      hooksPath,
      configPath,
      dryRun: true,
      rewriteGuard: "context",
      rewriteMinScore: "70",
    });

    const stopCommand = result.nextHooks.hooks.Stop[0].hooks[0].command;
    const preCompactCommand =
      result.nextHooks.hooks.PreCompact[0].hooks[0].command;
    const postCompactCommand =
      result.nextHooks.hooks.PostCompact[0].hooks[0].command;

    expect(stopCommand).toContain("promptlane hook stop codex");
    expect(preCompactCommand).toContain("promptlane hook pre-compact codex");
    expect(postCompactCommand).toContain("promptlane hook post-compact codex");
    for (const command of [
      stopCommand,
      preCompactCommand,
      postCompactCommand,
    ]) {
      expect(command).toContain("hook codex");
      expect(command).not.toContain("--rewrite-guard");
      expect(command).not.toContain("--rewrite-min-score");
    }
  });

  it("can install an opt-in Codex SessionStart web opener", () => {
    const dir = createTempDir();
    const dataDir = join(dir, "data");
    const hooksPath = join(dir, ".codex", "hooks.json");
    const configPath = join(dir, ".codex", "config.toml");
    initializePromptLane({ dataDir });

    const result = installCodexHook({
      dataDir,
      hooksPath,
      configPath,
      dryRun: true,
      openWeb: true,
    });

    expect(result.nextHooks.hooks.UserPromptSubmit).toHaveLength(1);
    expect(result.nextHooks.hooks.SessionStart).toHaveLength(1);
    const command = result.nextHooks.hooks.SessionStart[0].hooks[0].command;
    expect(command).toContain("promptlane hook session-start codex");
    expect(command).toContain("--open-web");
    expect(command).not.toContain(loadHookAuth(dataDir).ingest_token);
  });

  it("replaces legacy prompt-memory Codex SessionStart hook during open-web install", () => {
    const dir = createTempDir();
    const dataDir = join(dir, "data");
    const hooksPath = join(dir, ".codex", "hooks.json");
    const configPath = join(dir, ".codex", "config.toml");
    initializePromptLane({ dataDir });
    mkdirSync(join(dir, ".codex"), { recursive: true });
    writeFileSync(
      hooksPath,
      `${JSON.stringify(
        {
          hooks: {
            SessionStart: [
              {
                hooks: [
                  {
                    type: "command",
                    command:
                      'PROMPT_MEMORY_HOOK="prompt-memory hook session-start codex" /usr/bin/node /repo/dist/cli/index.js hook session-start codex --open-web',
                    timeout: 5,
                  },
                ],
              },
            ],
          },
        },
        null,
        2,
      )}\n`,
    );

    installCodexHook({
      dataDir,
      hooksPath,
      configPath,
      openWeb: true,
    });
    const hooks = JSON.parse(readFileSync(hooksPath, "utf8"));

    expect(hooks.hooks.SessionStart).toHaveLength(1);
    expect(hooks.hooks.SessionStart[0].hooks).toHaveLength(1);
    expect(hooks.hooks.SessionStart[0].hooks[0].command).toContain(
      'PROMPTLANE_HOOK="promptlane hook session-start codex"',
    );
    expect(JSON.stringify(hooks)).not.toContain("PROMPT_MEMORY_HOOK");
  });

  it("uninstalls hook and revokes the previous ingest token", () => {
    const dir = createTempDir();
    const dataDir = join(dir, "data");
    const hooksPath = join(dir, ".codex", "hooks.json");
    const configPath = join(dir, ".codex", "config.toml");
    initializePromptLane({ dataDir });
    const oldToken = loadHookAuth(dataDir).ingest_token;
    installCodexHook({ dataDir, hooksPath, configPath });

    const result = uninstallCodexHook({ dataDir, hooksPath, configPath });
    const hooks = JSON.parse(readFileSync(hooksPath, "utf8"));
    const config = readFileSync(configPath, "utf8");

    expect(result.changed).toBe(true);
    expect(hooks.hooks.UserPromptSubmit).toEqual([]);
    expect(hooks.hooks.SessionStart).toEqual([]);
    expect(config).toContain("hooks = true");
    expect(loadHookAuth(dataDir).ingest_token).not.toBe(oldToken);
  });
});

function createTempDir(): string {
  const dir = join(tmpdir(), `promptlane-install-${randomUUID()}`);
  mkdirSync(dir, { recursive: true });
  tempDirs.push(dir);
  return dir;
}
