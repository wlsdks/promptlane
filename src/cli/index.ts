#!/usr/bin/env node
import { realpathSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";

import { Command, CommanderError } from "commander";

import { registerBenchmarkCommand } from "./commands/benchmark.js";
import { registerBuddyCommand } from "./commands/buddy.js";
import { registerCoachCommand } from "./commands/coach.js";
import { registerDoctorCommand } from "./commands/doctor.js";
import { registerExportCommand } from "./commands/export.js";
import { registerHookCommand } from "./commands/hook.js";
import { registerGuideCommand } from "./commands/guide.js";
import { registerImproveCommand } from "./commands/improve.js";
import { registerImportCommand } from "./commands/import.js";
import { registerInstallCodexHudCommand } from "./commands/install-codex-hud.js";
import { registerInstallHookCommands } from "./commands/install-hook.js";
import { registerInitCommand } from "./commands/init.js";
import { registerLoopCommand } from "./commands/loop.js";
import { registerMcpCommand } from "./commands/mcp.js";
import { registerProjectCommand } from "./commands/project.js";
import { registerQualityEvidenceCommand } from "./commands/quality-evidence.js";
import { registerPromptCommands } from "./commands/prompts.js";
import { registerReviewProjectInstructionsCommand } from "./commands/review-project-instructions.js";
import { registerScoreCommand } from "./commands/score.js";
import { registerServerCommand } from "./commands/server.js";
import { registerServiceCommand } from "./commands/service.js";
import { registerSetupCommand } from "./commands/setup.js";
import { registerStartCommand } from "./commands/start.js";
import { registerStatusLineCommand } from "./commands/statusline.js";
import { VERSION } from "../shared/version.js";
import { isUserError } from "./user-error.js";

export function createProgram(): Command {
  const program = new Command();

  program
    .name("looprelay")
    .description(
      "Local continuity and evidence for Codex and Claude Code loops.",
    )
    .version(VERSION);

  registerBenchmarkCommand(program);
  registerBuddyCommand(program);
  registerInitCommand(program);
  registerHookCommand(program);
  registerGuideCommand(program);
  registerCoachCommand(program);
  registerExportCommand(program);
  registerImproveCommand(program);
  registerImportCommand(program);
  registerInstallCodexHudCommand(program);
  registerInstallHookCommands(program);
  registerLoopCommand(program);
  registerMcpCommand(program);
  registerStartCommand(program);
  registerSetupCommand(program);
  registerDoctorCommand(program);
  registerServerCommand(program);
  registerServiceCommand(program);
  registerStatusLineCommand(program);
  registerProjectCommand(program);
  registerQualityEvidenceCommand(program);
  registerPromptCommands(program);
  registerReviewProjectInstructionsCommand(program);
  registerScoreCommand(program);

  return program;
}

export type RunCliOptions = {
  stdout?: NodeJS.WritableStream;
  stderr?: NodeJS.WritableStream;
  program?: Command;
};

export async function runCli(
  argv: string[],
  options: RunCliOptions = {},
): Promise<number> {
  const program = options.program ?? createProgram();
  const stdout = options.stdout ?? process.stdout;
  const stderr = options.stderr ?? process.stderr;
  const previousExitCode = process.exitCode;
  process.exitCode = undefined;
  program.exitOverride();
  program.configureOutput({
    writeOut: (value) => {
      stdout.write(value);
    },
    writeErr: (value) => {
      stderr.write(value);
    },
  });

  if (argv.length <= 2) {
    program.outputHelp();
    process.exitCode = previousExitCode;
    return 0;
  }

  try {
    await program.parseAsync(argv);
    const exitCode =
      typeof process.exitCode === "number" ? process.exitCode : 0;
    process.exitCode = previousExitCode;
    return exitCode;
  } catch (error) {
    process.exitCode = previousExitCode;
    if (isUserError(error)) {
      stderr.write(`Error: ${error.message}\n`);
      return 1;
    }
    if (error instanceof CommanderError) {
      return error.exitCode;
    }
    throw error;
  }
}

export function isCliEntryPoint(
  importMetaUrl: string,
  argvPath = process.argv[1],
): boolean {
  if (!argvPath) {
    return false;
  }

  try {
    return (
      realpathSync(fileURLToPath(importMetaUrl)) === realpathSync(argvPath)
    );
  } catch {
    return importMetaUrl === pathToFileURL(argvPath).href;
  }
}

if (isCliEntryPoint(import.meta.url)) {
  runCli(process.argv).then(
    (code) => {
      process.exitCode = code;
    },
    (error) => {
      console.error(error);
      process.exitCode = 1;
    },
  );
}
