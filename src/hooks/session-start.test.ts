import { mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { afterEach, describe, expect, it } from "vitest";

import { initializePromptLane } from "../config/config.js";
import { runSessionStartHook } from "./session-start.js";

const tempDirs: string[] = [];

afterEach(() => {
  while (tempDirs.length > 0) {
    const dir = tempDirs.pop();
    if (dir) {
      rmSync(dir, { recursive: true, force: true });
    }
  }
});

describe("runSessionStartHook", () => {
  it("opens the web UI when the local server is already reachable", async () => {
    const dir = createTempDir();
    const dataDir = join(dir, "data");
    initializePromptLane({ dataDir });
    const openedUrls: string[] = [];

    const result = await runSessionStartHook({
      stdin: JSON.stringify({
        hook_event_name: "SessionStart",
        session_id: "session-1",
        source: "startup",
      }),
      dataDir,
      openWeb: true,
      getServerInstance: async () => "instance-1",
      openUrl: (url) => openedUrls.push(url),
    });

    expect(result).toEqual({ exitCode: 0, stdout: "", stderr: "" });
    expect(openedUrls).toEqual(["http://127.0.0.1:17373"]);
  });

  it("skips opening the web UI when the local server is not reachable, and does not spawn one", async () => {
    const dir = createTempDir();
    const dataDir = join(dir, "data");
    initializePromptLane({ dataDir });
    const openedUrls: string[] = [];

    const result = await runSessionStartHook({
      stdin: JSON.stringify({
        hook_event_name: "SessionStart",
        session_id: "session-1",
        source: "startup",
      }),
      dataDir,
      openWeb: true,
      getServerInstance: async () => null,
      openUrl: (url) => openedUrls.push(url),
    });

    expect(result).toEqual({ exitCode: 0, stdout: "", stderr: "" });
    expect(openedUrls).toEqual([]);
  });

  it("does not re-open the web UI for a new session against the same running server", async () => {
    const dir = createTempDir();
    const dataDir = join(dir, "data");
    initializePromptLane({ dataDir });
    const openedUrls: string[] = [];

    // Two distinct sessions (different session ids) talking to the same
    // running server instance: the tab must open only once.
    await runSessionStartHook({
      stdin: JSON.stringify({
        hook_event_name: "SessionStart",
        session_id: "session-1",
        source: "startup",
      }),
      dataDir,
      openWeb: true,
      getServerInstance: async () => "instance-1",
      openUrl: (url) => openedUrls.push(url),
    });
    await runSessionStartHook({
      stdin: JSON.stringify({
        hook_event_name: "SessionStart",
        session_id: "session-2",
        source: "startup",
      }),
      dataDir,
      openWeb: true,
      getServerInstance: async () => "instance-1",
      openUrl: (url) => openedUrls.push(url),
    });

    expect(openedUrls).toEqual(["http://127.0.0.1:17373"]);
  });

  it("re-opens the web UI after the server restarts (new instance id)", async () => {
    const dir = createTempDir();
    const dataDir = join(dir, "data");
    initializePromptLane({ dataDir });
    const openedUrls: string[] = [];
    const payload = JSON.stringify({
      hook_event_name: "SessionStart",
      session_id: "session-1",
      source: "startup",
    });

    await runSessionStartHook({
      stdin: payload,
      dataDir,
      openWeb: true,
      getServerInstance: async () => "instance-1",
      openUrl: (url) => openedUrls.push(url),
    });
    await runSessionStartHook({
      stdin: payload,
      dataDir,
      openWeb: true,
      getServerInstance: async () => "instance-2",
      openUrl: (url) => openedUrls.push(url),
    });

    expect(openedUrls).toEqual([
      "http://127.0.0.1:17373",
      "http://127.0.0.1:17373",
    ]);
  });

  it("is disabled unless setup or install-hook opted into open-web", async () => {
    const dir = createTempDir();
    const dataDir = join(dir, "data");
    initializePromptLane({ dataDir });
    const openedUrls: string[] = [];

    const result = await runSessionStartHook({
      stdin: JSON.stringify({ hook_event_name: "SessionStart" }),
      dataDir,
      openWeb: false,
      getServerInstance: async () => "instance-1",
      openUrl: (url) => openedUrls.push(url),
    });

    expect(result).toEqual({ exitCode: 0, stdout: "", stderr: "" });
    expect(openedUrls).toEqual([]);
  });
});

function createTempDir(): string {
  const dir = join(tmpdir(), `promptlane-session-start-${randomUUID()}`);
  mkdirSync(dir, { recursive: true });
  tempDirs.push(dir);
  return dir;
}
