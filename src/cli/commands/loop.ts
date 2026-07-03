import type { Command } from "commander";

import { loadHookAuth, loadPromptCoachConfig } from "../../config/config.js";
import {
  createLoopBrief,
  latestCompactBoundaryAfterSnapshot,
} from "../../loop/brief.js";
import { collectLoopSnapshot } from "../../loop/collect.js";
import {
  decideLoopMemoryCandidate,
  type LoopMemoryCandidateDecision,
} from "../../loop/memory-candidate.js";
import type { LoopSnapshot, LoopSnapshotSource } from "../../loop/types.js";
import { createSqlitePromptStorage } from "../../storage/sqlite.js";
import { registerLoopScheduleCommand } from "./loop-schedule.js";
import { UserError } from "../user-error.js";

type LoopCliOptions = {
  branch?: string;
  cwd?: string;
  cwdPrefix?: string;
  dataDir?: string;
  json?: boolean;
  limit?: string | number;
  now?: Date;
  source?: string;
  worktree?: string;
  approvedBy?: string;
};

export function registerLoopCommand(program: Command): void {
  const loop = program
    .command("loop")
    .description("Collect and brief local agent loop snapshots.");

  loop
    .command("status")
    .description("Show local Loopdeck snapshot readiness.")
    .option("--data-dir <path>", "Override the prompt-coach data directory.")
    .option("--json", "Print JSON.")
    .action((options: LoopCliOptions) => {
      console.log(loopStatusForCli(options));
    });

  loop
    .command("collect")
    .description("Collect a privacy-safe snapshot from recent prompt metadata.")
    .option("--data-dir <path>", "Override the prompt-coach data directory.")
    .option("--json", "Print JSON.")
    .option("--limit <count>", "Maximum recent prompts to include.")
    .option("--cwd-prefix <path>", "Only include prompts from this project/path.")
    .option("--source <source>", "Collection source label (cli or service).")
    .option("--branch <name>", "Git branch label to attach to the snapshot.")
    .option("--worktree <name>", "Worktree label to attach to the snapshot.")
    .action((options: LoopCliOptions) => {
      console.log(loopCollectForCli(options));
    });

  loop
    .command("brief")
    .description("Print a continuation prompt from the latest loop snapshot.")
    .option("--data-dir <path>", "Override the prompt-coach data directory.")
    .option("--json", "Print JSON.")
    .action((options: LoopCliOptions) => {
      console.log(loopBriefForCli(options));
    });

  loop
    .command("memory-candidate")
    .description("Decide whether the latest loop can become an approved memory.")
    .option("--data-dir <path>", "Override the prompt-coach data directory.")
    .option("--json", "Print JSON.")
    .action((options: LoopCliOptions) => {
      console.log(loopMemoryCandidateForCli(options));
    });

  loop
    .command("memory-approve")
    .description("Record the latest eligible loop memory candidate after approval.")
    .option("--data-dir <path>", "Override the prompt-coach data directory.")
    .option("--approved-by <actor>", "Approval actor label.", "user")
    .option("--json", "Print JSON.")
    .action((options: LoopCliOptions) => {
      console.log(loopMemoryApproveForCli(options));
    });

  registerLoopScheduleCommand(loop);
}

export function loopCollectForCli(options: LoopCliOptions = {}): string {
  return withStorage(options.dataDir, (storage, hmacSecret) => {
    const cwd = options.cwd ?? process.cwd();
    const cwdPrefix = options.cwdPrefix ?? cwd;
    const stored = collectLoopSnapshot({
      storage,
      hmacSecret,
      source: parseSource(options.source),
      now: options.now,
      cwd,
      cwdPrefix,
      limit: parseLimit(options.limit),
      branch: options.branch,
      worktree: options.worktree,
    });

    return options.json
      ? JSON.stringify(stored, null, 2)
      : formatLoopSnapshot(stored);
  });
}

export function loopStatusForCli(options: LoopCliOptions = {}): string {
  return withStorage(options.dataDir, (storage) => {
    const status = createLoopStatus(storage);

    return options.json ? JSON.stringify(status, null, 2) : formatLoopStatus(status);
  });
}

export function loopBriefForCli(options: LoopCliOptions = {}): string {
  return withStorage(options.dataDir, (storage) => {
    const snapshot = storage.getLatestLoopSnapshot();
    if (!snapshot) {
      throw new UserError(
        "No loop snapshot found. Run `prompt-coach loop collect` first.",
      );
    }
    const compactBoundary = latestCompactBoundaryAfterSnapshot(
      snapshot,
      storage.listCompactBoundaries({ limit: 20 }).items,
    );
    const brief = createLoopBrief({ snapshot, compactBoundary });
    return options.json
      ? JSON.stringify(brief, null, 2)
      : `${brief.title}\n\n${brief.prompt}`;
  });
}

export function loopMemoryCandidateForCli(
  options: LoopCliOptions = {},
): string {
  return withStorage(options.dataDir, (storage) => {
    const snapshot = storage.getLatestLoopSnapshot();
    if (!snapshot) {
      throw new UserError(
        "No loop snapshot found. Run `prompt-coach loop collect` first.",
      );
    }

    const decision = decideLoopMemoryCandidate(snapshot);
    return options.json
      ? JSON.stringify(decision, null, 2)
      : formatLoopMemoryCandidate(decision);
  });
}

export function loopMemoryApproveForCli(options: LoopCliOptions = {}): string {
  return withStorage(options.dataDir, (storage) => {
    const snapshot = storage.getLatestLoopSnapshot();
    if (!snapshot) {
      throw new UserError(
        "No loop snapshot found. Run `prompt-coach loop collect` first.",
      );
    }

    const decision = decideLoopMemoryCandidate(snapshot);
    if (!decision.eligible || !decision.candidate) {
      throw new UserError(
        `Latest loop is not eligible for memory approval: ${decision.reason}.`,
      );
    }

    const memory = storage.recordLoopMemory({
      snapshot_id: snapshot.id,
      title: decision.candidate.title,
      statement: decision.candidate.statement,
      evidence_refs: decision.candidate.evidence_refs,
      approved_by: options.approvedBy ?? "user",
    });
    const result = {
      recorded: true as const,
      memory,
      next_action: "use recorded memory as local context in future loop briefs",
      privacy: {
        ...memory.privacy,
        returns_prompt_bodies: false,
        returns_raw_paths: false,
      },
    };

    return options.json
      ? JSON.stringify(result, null, 2)
      : formatLoopMemoryApproval(result);
  });
}

function withStorage<T>(
  dataDir: string | undefined,
  callback: (
    storage: ReturnType<typeof createSqlitePromptStorage>,
    hmacSecret: string,
  ) => T,
): T {
  const config = loadPromptCoachConfig(dataDir);
  const hookAuth = loadHookAuth(dataDir);
  const storage = createSqlitePromptStorage({
    dataDir: config.data_dir,
    hmacSecret: hookAuth.web_session_secret,
  });

  try {
    return callback(storage, hookAuth.web_session_secret);
  } finally {
    storage.close();
  }
}

function parseLimit(value: string | number | undefined): number {
  if (value === undefined) return 20;
  const parsed = typeof value === "number" ? value : Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new UserError("--limit must be a positive integer.");
  }
  return Math.min(parsed, 100);
}

function parseSource(value: string | undefined): LoopSnapshotSource {
  if (value === undefined || value === "cli") return "cli";
  if (value === "service") return "service";
  throw new UserError("--source must be either cli or service.");
}

function formatLoopSnapshot(snapshot: LoopSnapshot): string {
  return [
    "Loop snapshot collected",
    `id ${snapshot.id}`,
    `project ${snapshot.cwd_label}`,
    `tool ${snapshot.tool}`,
    `source ${snapshot.source}`,
    `prompts ${snapshot.event_counts.prompts}`,
    snapshot.quality.average_prompt_score === undefined
      ? "average prompt score n/a"
      : `average prompt score ${snapshot.quality.average_prompt_score}/100`,
    snapshot.quality.top_gaps.length > 0
      ? `top gaps ${snapshot.quality.top_gaps.join(", ")}`
      : "top gaps none",
    "",
    "Next: prompt-coach loop brief",
    "",
    "Privacy: local-only, no prompt bodies, no raw paths.",
  ].join("\n");
}

function formatLoopStatus(status: ReturnType<typeof createLoopStatus>): string {
  return [
    `Loopdeck status ${status.status}`,
    `snapshots ${status.snapshot_count}`,
    status.latest_snapshot ? "latest loop" : "latest loop none",
    status.latest_snapshot
      ? `id ${status.latest_snapshot.id}`
      : undefined,
    status.latest_snapshot
      ? `project ${status.latest_snapshot.project}`
      : undefined,
    status.latest_snapshot ? `tool ${status.latest_snapshot.tool}` : undefined,
    status.latest_snapshot
      ? `prompts ${status.latest_snapshot.prompt_count}`
      : undefined,
    status.latest_snapshot?.average_prompt_score === undefined
      ? undefined
      : `average prompt score ${status.latest_snapshot.average_prompt_score}/100`,
    status.latest_compact_boundary
      ? `compact boundary ${status.latest_compact_boundary.event_name} at ${status.latest_compact_boundary.created_at} (${status.latest_compact_boundary.trigger})`
      : "compact boundary none after latest snapshot",
    "",
    `Next: ${status.next_action}`,
    "",
    "Privacy: local-only, no prompt bodies, no raw paths.",
  ]
    .filter((line): line is string => line !== undefined)
    .join("\n");
}

function formatLoopMemoryCandidate(
  decision: LoopMemoryCandidateDecision,
): string {
  return [
    `Loop memory candidate ${decision.eligible ? "eligible" : "not eligible"}`,
    `snapshot ${decision.snapshot_id}`,
    `reason ${decision.reason}`,
    decision.candidate ? `title ${decision.candidate.title}` : undefined,
    decision.candidate ? `statement ${decision.candidate.statement}` : undefined,
    decision.candidate
      ? `evidence ${decision.candidate.evidence_refs.join(", ")}`
      : undefined,
    "",
    decision.eligible
      ? "Next: review and approve before writing memory"
      : "Next: record a passed loop outcome with evidence before proposing memory",
    "",
    "Privacy: local-only, no prompt bodies, no raw paths, no external calls, no automatic memory writes.",
  ]
    .filter((line): line is string => line !== undefined)
    .join("\n");
}

function formatLoopMemoryApproval(result: {
  recorded: true;
  memory: ReturnType<ReturnType<typeof createSqlitePromptStorage>["recordLoopMemory"]>;
  next_action: string;
}): string {
  return [
    "Loop memory recorded",
    `id ${result.memory.id}`,
    `snapshot ${result.memory.snapshot_id}`,
    `approved by ${result.memory.approved_by}`,
    `statement ${result.memory.statement}`,
    `evidence ${result.memory.evidence_refs.join(", ")}`,
    "",
    `Next: ${result.next_action}`,
    "",
    "Privacy: local-only, no prompt bodies, no raw paths, no external calls, no instruction file writes.",
  ].join("\n");
}

function createLoopStatus(storage: ReturnType<typeof createSqlitePromptStorage>) {
  const snapshots = storage.listLoopSnapshots({ limit: 100 }).items;
  const latest = snapshots.at(0);
  const compactBoundary = latest
    ? latestCompactBoundaryAfterSnapshot(
        latest,
        storage.listCompactBoundaries({ limit: 20 }).items,
      )
    : undefined;

  return {
    status: snapshots.length > 0 ? "ready" : "empty",
    snapshot_count: snapshots.length,
    latest_snapshot: latest ? toSafeLoopStatusSnapshot(latest) : undefined,
    latest_compact_boundary: compactBoundary,
    next_action: compactBoundary
      ? "prompt-coach loop collect"
      : latest
        ? "prompt-coach loop brief"
        : "prompt-coach loop collect",
    privacy: {
      local_only: true,
      returns_prompt_bodies: false,
      returns_raw_paths: false,
    },
  };
}

function toSafeLoopStatusSnapshot(snapshot: LoopSnapshot) {
  return {
    id: snapshot.id,
    created_at: snapshot.created_at,
    tool: snapshot.tool,
    source: snapshot.source,
    project: snapshot.cwd_label,
    prompt_count: snapshot.event_counts.prompts,
    average_prompt_score: snapshot.quality.average_prompt_score,
    top_gaps: snapshot.quality.top_gaps,
  };
}
