import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import { UserError } from "../user-error.js";

export type RuntimeTool = "codex" | "claude-code";

export type RuntimeEvidence = {
  tool: RuntimeTool;
  status: "ready" | "unverified" | "needs_attention";
  ingest_state: "recent" | "stale" | "never" | "failed";
  verified: boolean;
  age_seconds?: number;
  checked_at?: string;
  next_action?: string;
  privacy: {
    local_only: true;
    returns_prompt_bodies: false;
    returns_raw_paths: false;
  };
};

export type DoctorRunner = (tool: RuntimeTool) => {
  status: number;
  stdout: string;
  stderr: string;
};

export function parseRuntimeTool(
  value: string | undefined,
): RuntimeTool | undefined {
  if (value === undefined) return undefined;
  if (value === "codex" || value === "claude-code") return value;
  throw new UserError(
    `Unsupported runtime tool: ${value}. Use codex or claude-code.`,
  );
}

export function defaultDoctorRunner(
  tool: RuntimeTool,
): ReturnType<DoctorRunner> {
  const cliPath = fileURLToPath(new URL("../index.js", import.meta.url));
  const result = spawnSync(
    process.execPath,
    [cliPath, "doctor", tool, "--json"],
    {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  return {
    status: result.status ?? 1,
    stdout: result.stdout,
    stderr: result.stderr,
  };
}

export function readRuntimeEvidence(
  tool: RuntimeTool,
  runner: DoctorRunner,
): RuntimeEvidence {
  const result = runner(tool);
  if (!result.stdout.trim()) {
    throw new UserError(
      `Unable to read live ${tool} doctor evidence. Run promptlane doctor ${tool} --json.`,
    );
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(result.stdout);
  } catch {
    throw new UserError(`Live ${tool} doctor evidence is not valid JSON.`);
  }
  if (!isDoctorRuntimeEvidence(parsed)) {
    throw new UserError(`Live ${tool} doctor evidence has an invalid shape.`);
  }

  return {
    tool,
    status: parsed.status,
    ingest_state: parsed.ingest.state,
    verified: parsed.ingest.verified,
    ...(parsed.ingest.age_seconds !== undefined
      ? { age_seconds: parsed.ingest.age_seconds }
      : {}),
    ...(parsed.lastIngestStatus?.checked_at
      ? { checked_at: parsed.lastIngestStatus.checked_at }
      : {}),
    ...(parsed.status !== "ready"
      ? {
          next_action: `Send one new ${tool} prompt, then rerun promptlane quality-evidence --runtime-tool ${tool} --require-runtime-ready.`,
        }
      : {}),
    privacy: {
      local_only: true,
      returns_prompt_bodies: false,
      returns_raw_paths: false,
    },
  };
}

function isDoctorRuntimeEvidence(value: unknown): value is {
  status: RuntimeEvidence["status"];
  ingest: {
    state: RuntimeEvidence["ingest_state"];
    verified: boolean;
    age_seconds?: number;
  };
  lastIngestStatus?: { checked_at?: string };
  next_actions: string[];
} {
  if (typeof value !== "object" || value === null) return false;
  const doctor = value as {
    status?: unknown;
    ingest?: unknown;
    lastIngestStatus?: unknown;
    next_actions?: unknown;
  };
  if (
    doctor.status !== "ready" &&
    doctor.status !== "unverified" &&
    doctor.status !== "needs_attention"
  ) {
    return false;
  }
  if (typeof doctor.ingest !== "object" || doctor.ingest === null) return false;
  const ingest = doctor.ingest as {
    state?: unknown;
    verified?: unknown;
    age_seconds?: unknown;
  };
  if (
    ingest.state !== "recent" &&
    ingest.state !== "stale" &&
    ingest.state !== "never" &&
    ingest.state !== "failed"
  ) {
    return false;
  }
  if (typeof ingest.verified !== "boolean") return false;
  if (
    ingest.age_seconds !== undefined &&
    (typeof ingest.age_seconds !== "number" ||
      !Number.isInteger(ingest.age_seconds) ||
      ingest.age_seconds < 0)
  ) {
    return false;
  }
  if (!Array.isArray(doctor.next_actions)) return false;
  if (
    doctor.lastIngestStatus !== undefined &&
    (typeof doctor.lastIngestStatus !== "object" ||
      doctor.lastIngestStatus === null ||
      ((doctor.lastIngestStatus as { checked_at?: unknown }).checked_at !==
        undefined &&
        (typeof (doctor.lastIngestStatus as { checked_at?: unknown })
          .checked_at !== "string" ||
          !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(
            (doctor.lastIngestStatus as { checked_at: string }).checked_at,
          ))))
  ) {
    return false;
  }
  return true;
}
