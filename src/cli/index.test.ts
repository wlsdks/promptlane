import { mkdirSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Writable } from "node:stream";
import { pathToFileURL } from "node:url";
import { randomUUID } from "node:crypto";
import { afterEach, describe, expect, it } from "vitest";

import { createProgram, isCliEntryPoint, runCli } from "./index.js";
import { UserError } from "./user-error.js";

const tempDirs: string[] = [];

afterEach(() => {
  while (tempDirs.length > 0) {
    const dir = tempDirs.pop();
    if (dir) {
      rmSync(dir, { recursive: true, force: true });
    }
  }
});

describe("CLI entrypoint detection", () => {
  it("treats npm bin symlinks as the CLI entrypoint", () => {
    const dir = createTempDir();
    const target = join(dir, "dist", "cli", "index.js");
    const link = join(dir, "node_modules", ".bin", "promptlane");
    mkdirSync(join(dir, "dist", "cli"), { recursive: true });
    mkdirSync(join(dir, "node_modules", ".bin"), { recursive: true });
    writeFileSync(target, "#!/usr/bin/env node\n");
    symlinkSync(target, link);

    expect(isCliEntryPoint(pathToFileURL(target).href, link)).toBe(true);
  });
});

describe("CLI command surface", () => {
  it("registers the agent-facing commands", () => {
    const commands = createProgram()
      .commands.map((command) => command.name())
      .sort();

    expect(commands).toContain("mcp");
    expect(commands).toContain("start");
  });

  it("gives every top-level command a non-empty description", () => {
    const program = createProgram();
    const missing: string[] = [];
    for (const command of program.commands) {
      // The implicit `help` subcommand commander auto-generates does not need
      // a description from us — Commander labels it as "display help for
      // command" itself. Every other command must have one so
      // `promptlane --help` is self-explanatory.
      if (command.name() === "help") continue;
      if (!command.description() || command.description().trim() === "") {
        missing.push(command.name());
      }
    }
    expect(missing).toEqual([]);
  });

  it("brands loop schedule help as PromptLane", () => {
    const loopCommand = createProgram().commands.find(
      (command) => command.name() === "loop",
    );
    const scheduleCommand = loopCommand?.commands.find(
      (command) => command.name() === "schedule",
    );

    expect(scheduleCommand?.description()).toBe(
      "Manage opt-in PromptLane collection schedules.",
    );
  });
});

describe("runCli error handling", () => {
  it("prints help for no command without treating it as an error", async () => {
    const stdout = createCaptureStream();
    const stderr = createCaptureStream();

    const exitCode = await runCli(["node", "promptlane"], {
      stdout: stdout.stream,
      stderr: stderr.stream,
    });

    expect(exitCode).toBe(0);
    expect(stdout.text).toContain("Usage: promptlane");
    expect(stderr.text).toBe("");
  });

  it("renders Commander input errors without throwing a stack trace", async () => {
    const stderr = createCaptureStream();

    const exitCode = await runCli(["node", "promptlane", "missing-command"], {
      stderr: stderr.stream,
    });

    expect(exitCode).toBe(1);
    expect(stderr.text).toContain("unknown command 'missing-command'");
    expect(stderr.text).not.toMatch(/\n\s+at\s/);
  });

  it("renders UserError as a friendly stderr message and exits with code 1", async () => {
    const stderr = createCaptureStream();

    const exitCode = await runCli(
      ["node", "promptlane", "start", "--tool", "made-up-tool"],
      { stderr: stderr.stream },
    );

    expect(exitCode).toBe(1);
    expect(stderr.text).toContain("Unsupported tool: made-up-tool");
    expect(stderr.text).not.toMatch(/\n\s+at\s/);
  });

  it("renders import input errors as friendly stderr instead of programmer errors", async () => {
    const stderr = createCaptureStream();
    const missingFile = join(createTempDir(), "missing.jsonl");

    const exitCode = await runCli(
      [
        "node",
        "promptlane",
        "import",
        "--dry-run",
        "--file",
        missingFile,
      ],
      { stderr: stderr.stream },
    );

    expect(exitCode).toBe(1);
    expect(stderr.text).toContain("Import source file not found");
    expect(stderr.text).not.toContain(missingFile);
    expect(stderr.text).not.toMatch(/\n\s+at\s/);
  });

  it("rethrows non-UserError so programmer bugs keep their stack trace", async () => {
    const stderr = createCaptureStream();
    const program = createProgram();
    program.command("__throws-plain").action(() => {
      throw new Error("plain bug");
    });

    await expect(
      runCli(["node", "promptlane", "__throws-plain"], {
        stderr: stderr.stream,
        program,
      }),
    ).rejects.toThrow("plain bug");
    expect(stderr.text).toBe("");
  });

  it("does not redact UserError thrown from a custom command", async () => {
    const stderr = createCaptureStream();
    const program = createProgram();
    program.command("__throws-user").action(() => {
      throw new UserError(
        "missing --target. Try: promptlane __throws-user --target X",
      );
    });

    const exitCode = await runCli(["node", "promptlane", "__throws-user"], {
      stderr: stderr.stream,
      program,
    });

    expect(exitCode).toBe(1);
    expect(stderr.text).toContain(
      "missing --target. Try: promptlane __throws-user --target X",
    );
  });
});

function createTempDir(): string {
  const dir = join(tmpdir(), `promptlane-cli-entry-${randomUUID()}`);
  mkdirSync(dir, { recursive: true });
  tempDirs.push(dir);
  return dir;
}

function createCaptureStream(): { stream: Writable; readonly text: string } {
  let captured = "";
  const stream = new Writable({
    write(chunk, _encoding, callback) {
      captured += chunk.toString();
      callback();
    },
  });
  return {
    stream,
    get text() {
      return captured;
    },
  };
}
