import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import type { Command } from "commander";

import { resolveCliEntryPath } from "../entry-path.js";
import { UserError } from "../user-error.js";

export type LoopScheduleOptions = {
  cwdPrefix?: string;
  dataDir?: string;
  dryRun?: boolean;
  intervalSeconds?: number;
  limit?: string | number;
  platform?: NodeJS.Platform;
  plistPath?: string;
};

export type LoopScheduleInstallResult = {
  supported: boolean;
  changed: boolean;
  dryRun: boolean;
  plistPath: string;
  backupPath?: string;
  nextPlist?: string;
  started: false;
};

export type LoopScheduleStatusResult = {
  supported: boolean;
  installed: boolean;
  plistPath: string;
};

export type LoopScheduleUninstallResult = {
  supported: boolean;
  changed: boolean;
  removed: boolean;
  plistPath: string;
};

const LOOP_SCHEDULE_LABEL = "com.promptlane.loop";
const DEFAULT_INTERVAL_SECONDS = 900;

export function registerLoopScheduleCommand(loop: Command): void {
  const schedule = loop
    .command("schedule")
    .description("Manage opt-in PromptLane collection schedules.");

  schedule
    .command("install")
    .description("Install an explicit LaunchAgent for loop snapshot collection.")
    .option("--data-dir <path>", "Override the promptlane data directory.")
    .option(
      "--cwd-prefix <path>",
      "Project path to collect loop snapshots for.",
    )
    .option("--interval <seconds>", "Collection interval in seconds.", "900")
    .option("--limit <count>", "Maximum recent prompts per snapshot.")
    .option("--plist-path <path>", "Override macOS LaunchAgent plist path.")
    .option("--dry-run", "Print intended scheduler change without writing.")
    .option("--json", "Print machine-readable JSON instead of plain text.")
    .action(
      (
        options: LoopScheduleOptions & {
          interval?: string;
          json?: boolean;
        },
      ) => {
        const result = installLoopSchedule({
          ...options,
          intervalSeconds: parseIntervalSeconds(options.interval),
        });
        console.log(
          options.json
            ? formatLoopScheduleInstallJson(result)
            : formatLoopScheduleInstallPlain(result),
        );
        if (!result.supported) {
          process.exitCode = 1;
        }
      },
    );

  schedule
    .command("status")
    .description("Check whether the explicit LaunchAgent is installed.")
    .option("--plist-path <path>", "Override macOS LaunchAgent plist path.")
    .option("--json", "Print machine-readable JSON instead of plain text.")
    .action(
      (
        options: LoopScheduleOptions & {
          json?: boolean;
        },
      ) => {
        const result = loopScheduleStatus(options);
        console.log(
          options.json
            ? formatLoopScheduleStatusJson(result)
            : formatLoopScheduleStatusPlain(result),
        );
        if (!result.supported) {
          process.exitCode = 1;
        }
      },
    );

  schedule
    .command("uninstall")
    .description("Remove the explicit LaunchAgent plist.")
    .option("--plist-path <path>", "Override macOS LaunchAgent plist path.")
    .option("--json", "Print machine-readable JSON instead of plain text.")
    .action(
      (
        options: LoopScheduleOptions & {
          json?: boolean;
        },
      ) => {
        const result = uninstallLoopSchedule(options);
        console.log(
          options.json
            ? formatLoopScheduleUninstallJson(result)
            : formatLoopScheduleUninstallPlain(result),
        );
        if (!result.supported) {
          process.exitCode = 1;
        }
      },
    );
}

export function installLoopSchedule(
  options: LoopScheduleOptions = {},
): LoopScheduleInstallResult {
  const platform = options.platform ?? process.platform;
  const plistPath = options.plistPath ?? defaultLaunchAgentPath();

  if (platform !== "darwin") {
    return {
      supported: false,
      changed: false,
      dryRun: Boolean(options.dryRun),
      plistPath,
      started: false,
    };
  }

  const nextPlist = buildLoopSchedulePlist(options);
  const current = existsSync(plistPath) ? readFileSync(plistPath, "utf8") : "";
  const changed = current !== nextPlist;

  if (options.dryRun) {
    return {
      supported: true,
      changed,
      dryRun: true,
      plistPath,
      nextPlist,
      started: false,
    };
  }

  let backupPath: string | undefined;
  if (changed) {
    mkdirSync(dirname(plistPath), { recursive: true, mode: 0o700 });
    if (existsSync(plistPath)) {
      backupPath = `${plistPath}.promptlane.${Date.now()}.bak`;
      copyFileSync(plistPath, backupPath);
    }
    writeFileSync(plistPath, nextPlist, { mode: 0o600 });
  }

  return {
    supported: true,
    changed,
    dryRun: false,
    plistPath,
    backupPath,
    started: false,
  };
}

export function loopScheduleStatus(
  options: LoopScheduleOptions = {},
): LoopScheduleStatusResult {
  const platform = options.platform ?? process.platform;
  const plistPath = options.plistPath ?? defaultLaunchAgentPath();

  if (platform !== "darwin") {
    return {
      supported: false,
      installed: false,
      plistPath,
    };
  }

  return {
    supported: true,
    installed: existsSync(plistPath),
    plistPath,
  };
}

export function uninstallLoopSchedule(
  options: LoopScheduleOptions = {},
): LoopScheduleUninstallResult {
  const platform = options.platform ?? process.platform;
  const plistPath = options.plistPath ?? defaultLaunchAgentPath();

  if (platform !== "darwin") {
    return {
      supported: false,
      changed: false,
      removed: false,
      plistPath,
    };
  }

  const installed = existsSync(plistPath);
  if (installed) {
    rmSync(plistPath, { force: true });
  }

  return {
    supported: true,
    changed: installed,
    removed: installed,
    plistPath,
  };
}

function buildLoopSchedulePlist(options: LoopScheduleOptions): string {
  const args = [
    process.execPath,
    cliEntryPath(),
    "loop",
    "collect",
    "--source",
    "service",
  ];
  if (options.dataDir) {
    args.push("--data-dir", options.dataDir);
  }
  if (options.limit !== undefined) {
    args.push("--limit", String(options.limit));
  }
  const workingDirectory = options.cwdPrefix ?? process.cwd();

  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>${LOOP_SCHEDULE_LABEL}</string>
  <key>ProgramArguments</key>
  <array>
${args.map((arg) => `    <string>${escapeXml(arg)}</string>`).join("\n")}
  </array>
  <key>WorkingDirectory</key>
  <string>${escapeXml(workingDirectory)}</string>
  <key>StartInterval</key>
  <integer>${intervalSeconds(options.intervalSeconds)}</integer>
  <key>StandardOutPath</key>
  <string>${escapeXml(logPath("loop-collect.log"))}</string>
  <key>StandardErrorPath</key>
  <string>${escapeXml(logPath("loop-collect.err.log"))}</string>
</dict>
</plist>
`;
}

function formatLoopScheduleInstallPlain(
  result: LoopScheduleInstallResult,
): string {
  if (!result.supported) {
    return "Loop schedule installation is supported on macOS only.";
  }
  const action = result.dryRun ? "would install" : "installed";
  return [
    `loop schedule ${action}`,
    `plist ${result.plistPath}`,
    `changed ${result.changed ? "yes" : "no"}`,
    "command promptlane loop collect --source service",
    "Privacy: local-only; scheduler calls explicit collection and does not auto-submit prompts.",
  ].join("\n");
}

function formatLoopScheduleInstallJson(
  result: LoopScheduleInstallResult,
): string {
  return JSON.stringify(result, null, 2);
}

function formatLoopScheduleStatusPlain(
  result: LoopScheduleStatusResult,
): string {
  if (!result.supported) {
    return "Loop schedule status is supported on macOS only.";
  }
  return [
    `loop schedule ${result.installed ? "installed" : "not installed"}`,
    `plist ${result.plistPath}`,
    "command promptlane loop collect --source service",
  ].join("\n");
}

function formatLoopScheduleStatusJson(
  result: LoopScheduleStatusResult,
): string {
  return JSON.stringify(result, null, 2);
}

function formatLoopScheduleUninstallPlain(
  result: LoopScheduleUninstallResult,
): string {
  if (!result.supported) {
    return "Loop schedule uninstall is supported on macOS only.";
  }
  return [
    `loop schedule ${result.removed ? "removed" : "not installed"}`,
    `plist ${result.plistPath}`,
    `changed ${result.changed ? "yes" : "no"}`,
  ].join("\n");
}

function formatLoopScheduleUninstallJson(
  result: LoopScheduleUninstallResult,
): string {
  return JSON.stringify(result, null, 2);
}

function parseIntervalSeconds(value: string | undefined): number {
  if (value === undefined) return DEFAULT_INTERVAL_SECONDS;
  const parsed = Number.parseInt(value, 10);
  return intervalSeconds(parsed);
}

function intervalSeconds(value: number | undefined): number {
  const interval = value ?? DEFAULT_INTERVAL_SECONDS;
  if (!Number.isInteger(interval) || interval < 60) {
    throw new UserError("--interval must be an integer of at least 60 seconds.");
  }
  return interval;
}

function cliEntryPath(): string {
  return resolveCliEntryPath(import.meta.url, "../index.js");
}

function defaultLaunchAgentPath(): string {
  return join(
    homedir(),
    "Library",
    "LaunchAgents",
    `${LOOP_SCHEDULE_LABEL}.plist`,
  );
}

function logPath(fileName: string): string {
  return join(homedir(), ".promptlane", "logs", fileName);
}

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}
