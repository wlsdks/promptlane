import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";

import { createLoopSnapshotFromPrompts } from "./snapshot.js";
import type {
  LoopSnapshot,
  LoopSnapshotSource,
  LoopSnapshotTool,
} from "./types.js";
import { createProjectKey } from "../storage/project-id.js";
import { projectLabel } from "../storage/project-label.js";
import type {
  LoopSnapshotStoragePort,
  PromptReadStoragePort,
} from "../storage/ports.js";

export type CollectLoopSnapshotOptions = {
  branch?: string;
  cwd?: string;
  cwdPrefix?: string;
  hmacSecret: string;
  limit?: number;
  now?: Date;
  sessionId?: string;
  source: LoopSnapshotSource;
  storage: PromptReadStoragePort & LoopSnapshotStoragePort;
  tool?: LoopSnapshotTool;
  worktree?: string;
};

export function collectLoopSnapshot(
  options: CollectLoopSnapshotOptions,
): LoopSnapshot {
  const cwd = options.cwd ?? process.cwd();
  const cwdPrefix = options.cwdPrefix ?? cwd;
  const prompts = options.storage.listPrompts({
    cwdPrefix,
    limit: options.limit ?? 20,
    sessionId: options.sessionId,
  }).items;
  const snapshot = createLoopSnapshotFromPrompts({
    now: options.now ?? new Date(),
    source: options.source,
    tool: options.tool,
    sessionId: options.sessionId,
    prompts,
    project: {
      cwdLabel: projectLabel(cwdPrefix),
      projectId: createProjectKey(cwdPrefix, options.hmacSecret),
      gitRootHash: hashGitRoot(cwd),
      branch: options.branch ?? readGitBranch(cwd),
      worktreeLabel: options.worktree,
    },
  });

  return options.storage.createLoopSnapshot(snapshot);
}

function readGitBranch(cwd: string): string | undefined {
  try {
    const output = execFileSync("git", ["branch", "--show-current"], {
      cwd,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    return output || undefined;
  } catch {
    return undefined;
  }
}

function hashGitRoot(cwd: string): string | undefined {
  try {
    const root = execFileSync("git", ["rev-parse", "--show-toplevel"], {
      cwd,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    return `git_${createHash("sha256").update(root).digest("hex").slice(0, 16)}`;
  } catch {
    return undefined;
  }
}
