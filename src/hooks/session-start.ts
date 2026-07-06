import { spawn } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { loadPromptLaneConfig } from "../config/config.js";
import type { HookRunResult } from "./wrapper.js";

type SessionStartPayload = {
  hook_event_name?: string;
  session_id?: string;
  source?: string;
};

export type RunSessionStartHookOptions = {
  stdin: string;
  dataDir?: string;
  openWeb?: boolean;
  getServerInstance?: (healthUrl: string) => Promise<string | null>;
  openUrl?: (url: string) => void;
};

export async function runSessionStartHook(
  options: RunSessionStartHookOptions,
): Promise<HookRunResult> {
  try {
    if (!options.openWeb) {
      return emptyResult();
    }

    const payload = parsePayload(options.stdin);
    if (payload.hook_event_name && payload.hook_event_name !== "SessionStart") {
      return emptyResult();
    }
    if (payload.source && !isOpenableSessionStartSource(payload.source)) {
      return emptyResult();
    }

    const config = loadPromptLaneConfig(options.dataDir);
    const url = `http://${config.server.host}:${config.server.port}`;
    const healthUrl = `${url}/api/v1/health`;

    // Server lifecycle is owned by `promptlane service`. Do not spawn a
    // server here; spawning from a SessionStart hook risks a detached child
    // binding 17373 with the wrong data dir and is what produced the
    // 2026-05-09 401 incident. If the server is not running we simply fail
    // open with no pop-up, matching the spirit of an opt-in hook.
    const getInstance = options.getServerInstance ?? defaultGetServerInstance;
    const instanceId = await getInstance(healthUrl);
    if (instanceId === null) {
      return emptyResult();
    }

    // Dedup by running server instance, not by session id. Every Claude/Codex
    // session has a fresh session id, so a per-session claim would re-open the
    // web UI on every startup. Keying on the server's boot-time instance id
    // means we open the tab once while a given server is up, and only re-open
    // after the server restarts (a new instance id).
    if (!claimInstanceOpen(config.data_dir, instanceId)) {
      return emptyResult();
    }

    (options.openUrl ?? defaultOpenUrl)(url);
  } catch {
    // Session hooks must fail open and must not leak paths, prompts, or tokens.
  }

  return emptyResult();
}

function parsePayload(stdin: string): SessionStartPayload {
  try {
    return JSON.parse(stdin) as SessionStartPayload;
  } catch {
    return {};
  }
}

function isOpenableSessionStartSource(source: string): boolean {
  return source === "startup" || source === "resume";
}

function claimInstanceOpen(dataDir: string, instanceId: string): boolean {
  const runtimeDir = join(dataDir, "runtime");
  const statePath = join(runtimeDir, "web-open-instances.json");
  mkdirSync(runtimeDir, { recursive: true, mode: 0o700 });

  const state = readInstanceState(statePath);
  const key = instanceId || "unknown";
  if (state.opened.includes(key)) {
    return false;
  }

  const opened = [key, ...state.opened].slice(0, 100);
  writeFileSync(statePath, `${JSON.stringify({ opened }, null, 2)}\n`, {
    mode: 0o600,
  });
  return true;
}

function readInstanceState(statePath: string): { opened: string[] } {
  if (!existsSync(statePath)) {
    return { opened: [] };
  }

  try {
    const parsed = JSON.parse(readFileSync(statePath, "utf8")) as {
      opened?: unknown;
    };
    const opened = Array.isArray(parsed.opened)
      ? parsed.opened.filter(
          (value): value is string => typeof value === "string",
        )
      : [];
    return { opened };
  } catch {
    return { opened: [] };
  }
}

async function defaultGetServerInstance(
  healthUrl: string,
): Promise<string | null> {
  try {
    const response = await fetch(healthUrl, {
      signal: AbortSignal.timeout(500),
    });
    if (!response.ok) {
      return null;
    }
    const body = (await response.json()) as { instance_id?: unknown };
    if (typeof body.instance_id === "string" && body.instance_id.length > 0) {
      return body.instance_id;
    }
    // Reachable but no instance id (older server). Fall back to a stable
    // sentinel so we still open the web UI exactly once per data dir.
    return "legacy-instance";
  } catch {
    return null;
  }
}

function defaultOpenUrl(url: string): void {
  const platform = process.platform;
  const command =
    platform === "darwin" ? "open" : platform === "win32" ? "cmd" : "xdg-open";
  const args = platform === "win32" ? ["/c", "start", "", url] : [url];
  const child = spawn(command, args, {
    detached: true,
    stdio: "ignore",
    windowsHide: true,
  });
  child.unref();
}

function emptyResult(): HookRunResult {
  return { exitCode: 0, stdout: "", stderr: "" };
}
