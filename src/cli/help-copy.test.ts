import { describe, expect, it } from "vitest";

import { createProgram } from "./index.js";

function helpFor(commandPath: string): string {
  const program = createProgram();
  const command = program.commands.find((candidate) => {
    return candidate.name() === commandPath;
  });
  if (!command) {
    throw new Error(`Missing command: ${commandPath}`);
  }
  return command.helpInformation();
}

function nestedHelpFor(commandPath: string, subcommandPath: string): string {
  const program = createProgram();
  const command = program.commands.find((candidate) => {
    return candidate.name() === commandPath;
  });
  const subcommand = command?.commands.find((candidate) => {
    return candidate.name() === subcommandPath;
  });
  if (!subcommand) {
    throw new Error(`Missing command: ${commandPath} ${subcommandPath}`);
  }
  return subcommand.helpInformation();
}

describe("CLI help copy", () => {
  it("presents the root command as the PromptLane workbench while preserving the prompt-coach command id", () => {
    const help = createProgram().helpInformation();

    expect(help).toContain("Usage: prompt-coach");
    expect(help).toContain(
      "Local-first prompt improvement workspace",
    );
    expect(help).toContain("Codex");
    expect(help).toContain("Claude Code");
    expect(help).not.toContain("Local-first prompt archive for AI coding tools.");
  });

  it("presents local infrastructure commands as PromptLane surfaces", () => {
    const help = [
      helpFor("server"),
      helpFor("mcp"),
      helpFor("install-hook"),
      helpFor("uninstall-hook"),
      helpFor("statusline"),
      helpFor("statusline-chain"),
      helpFor("install-statusline"),
      helpFor("uninstall-statusline"),
      nestedHelpFor("service", "install"),
    ].join("\n");

    expect(help).toContain("Run the local PromptLane HTTP server");
    expect(help).toContain("Run the local PromptLane MCP server over stdio.");
    expect(help).toContain("Install the PromptLane capture hook");
    expect(help).toContain("Uninstall the PromptLane capture hook");
    expect(help).toContain("Render the PromptLane status line");
    expect(help).toContain("combines PromptLane with another tool");
    expect(help).toContain("Install the PromptLane status line");
    expect(help).toContain("Uninstall the PromptLane status line");
    expect(help).toContain("Install a login service for the local PromptLane server.");
    expect(help).not.toContain("local prompt-coach HTTP server");
    expect(help).not.toContain("local prompt-coach MCP server");
    expect(help).not.toContain("prompt-coach capture hook");
    expect(help).not.toContain("prompt-coach status line");
    expect(help).not.toContain("local prompt-coach server");
  });
});
