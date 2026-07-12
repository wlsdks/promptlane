import { describe, expect, it } from "vitest";

import {
  defaultLoopRelayEntry,
  mcpRegistrationCommand,
  mcpRegistrationSpec,
} from "./agent-access.js";

describe("defaultLoopRelayEntry", () => {
  it("falls back to a PATH-based looprelay binary when argv[1] is not a dist entrypoint", () => {
    const entry = defaultLoopRelayEntry();
    expect(entry).toEqual({ command: "looprelay", args: [] });
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
        "looprelay",
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
        "looprelay",
        "--",
        "/usr/local/bin/node",
        "/Users/example/repo/dist/cli/index.js",
        "mcp",
      ],
    });
  });

  it("preserves the existing PATH-based phrasing when entry uses looprelay directly", () => {
    expect(
      mcpRegistrationCommand("codex", { command: "looprelay", args: [] }),
    ).toBe("codex mcp add looprelay -- looprelay mcp");
    expect(
      mcpRegistrationCommand("claude-code", {
        command: "looprelay",
        args: [],
      }),
    ).toBe("claude mcp add --transport stdio looprelay -- looprelay mcp");
  });

  it("shell-quotes registration commands when the entry path contains spaces", () => {
    expect(
      mcpRegistrationCommand("codex", {
        command: "/usr/local/bin/node",
        args: ["/Users/example/LoopRelay Workspace/dist/cli/index.js"],
      }),
    ).toBe(
      "codex mcp add looprelay -- /usr/local/bin/node '/Users/example/LoopRelay Workspace/dist/cli/index.js' mcp",
    );
    expect(
      mcpRegistrationCommand("claude-code", {
        command: "/usr/local/bin/node",
        args: ["/Users/example/LoopRelay Workspace/dist/cli/index.js"],
      }),
    ).toBe(
      "claude mcp add --transport stdio looprelay -- /usr/local/bin/node '/Users/example/LoopRelay Workspace/dist/cli/index.js' mcp",
    );
  });
});
