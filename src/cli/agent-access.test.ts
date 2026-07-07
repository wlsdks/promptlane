import { describe, expect, it } from "vitest";

import {
  defaultPromptLaneEntry,
  mcpRegistrationCommand,
  mcpRegistrationSpec,
} from "./agent-access.js";

describe("defaultPromptLaneEntry", () => {
  it("falls back to a PATH-based promptlane binary when argv[1] is not a dist entrypoint", () => {
    const entry = defaultPromptLaneEntry();
    expect(entry).toEqual({ command: "promptlane", args: [] });
  });
});

describe("mcpRegistrationSpec with an explicit entry", () => {
  it("registers Codex with the absolute node + dist path so PATH lookup is not required", () => {
    const spec = mcpRegistrationSpec("codex", {
      command: "/usr/local/bin/node",
      args: ["/Users/example/repo/dist/cli/index.js"],
    });

    expect(spec).toEqual({
      command: "codex",
      args: [
        "mcp",
        "add",
        "promptlane",
        "--",
        "/usr/local/bin/node",
        "/Users/example/repo/dist/cli/index.js",
        "mcp",
      ],
    });
  });

  it("registers Claude Code with the absolute node + dist path so PATH lookup is not required", () => {
    const spec = mcpRegistrationSpec("claude-code", {
      command: "/usr/local/bin/node",
      args: ["/Users/example/repo/dist/cli/index.js"],
    });

    expect(spec).toEqual({
      command: "claude",
      args: [
        "mcp",
        "add",
        "--transport",
        "stdio",
        "promptlane",
        "--",
        "/usr/local/bin/node",
        "/Users/example/repo/dist/cli/index.js",
        "mcp",
      ],
    });
  });

  it("preserves the existing PATH-based phrasing when entry uses promptlane directly", () => {
    expect(
      mcpRegistrationCommand("codex", { command: "promptlane", args: [] }),
    ).toBe("codex mcp add promptlane -- promptlane mcp");
    expect(
      mcpRegistrationCommand("claude-code", {
        command: "promptlane",
        args: [],
      }),
    ).toBe("claude mcp add --transport stdio promptlane -- promptlane mcp");
  });

  it("shell-quotes registration commands when the entry path contains spaces", () => {
    expect(
      mcpRegistrationCommand("codex", {
        command: "/usr/local/bin/node",
        args: ["/Users/example/Prompt Lane/dist/cli/index.js"],
      }),
    ).toBe(
      "codex mcp add promptlane -- /usr/local/bin/node '/Users/example/Prompt Lane/dist/cli/index.js' mcp",
    );
    expect(
      mcpRegistrationCommand("claude-code", {
        command: "/usr/local/bin/node",
        args: ["/Users/example/Prompt Lane/dist/cli/index.js"],
      }),
    ).toBe(
      "claude mcp add --transport stdio promptlane -- /usr/local/bin/node '/Users/example/Prompt Lane/dist/cli/index.js' mcp",
    );
  });
});
