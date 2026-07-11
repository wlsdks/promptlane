import type { Command } from "commander";

import {
  createBenchmarkPairCandidateReport,
  type BenchmarkPairCandidateReport,
} from "../../analysis/benchmark-pair-candidates.js";
import {
  initializeLoopRelay,
  loadHookAuth,
  loadLoopRelayConfig,
} from "../../config/config.js";
import {
  createLoopBrief,
  latestCompactBoundaryAfterSnapshot,
} from "../../loop/brief.js";
import { collectLoopSnapshot } from "../../loop/collect.js";
import {
  applyInstructionPatchFromMemory,
  type InstructionPatchApplyResult,
  parseInstructionPatchTarget,
  proposeInstructionPatchFromMemory,
  type InstructionPatchProposal,
} from "../../loop/instruction-patch.js";
import {
  decideLoopMemoryCandidate,
  type LoopMemoryCandidateDecision,
} from "../../loop/memory-candidate.js";
import {
  LoopOutcomeAttributionError,
  parseLoopOutcomeInput,
} from "../../loop/outcome.js";
import {
  hasAmbiguousLoopSnapshotTarget,
  hasLoopSnapshotSelection,
  loopBriefNoSnapshotCliMessage,
  loopInstructionPatchNoMemoryCliMessage,
  loopMemoryNoSnapshotCliMessage,
  selectLoopSnapshot,
  selectLoopSnapshotTarget,
  selectedLoopSnapshotNotFoundMessage,
} from "../../loop/snapshot-selection.js";
import {
  createLoopRelayStatus,
  type LoopRelayStatus,
} from "../../loop/status.js";
import type { LoopSnapshot, LoopSnapshotSource } from "../../loop/types.js";
import type { LoopMergeDecisionValue } from "../../storage/loop-decisions.js";
import { createProjectKey } from "../../storage/project-id.js";
import { createSqlitePromptStorage } from "../../storage/sqlite.js";
import { registerLoopScheduleCommand } from "./loop-schedule.js";
import { UserError } from "../user-error.js";

type LoopCliOptions = {
  allProjects?: boolean;
  branch?: string;
  cwd?: string;
  cwdPrefix?: string;
  dataDir?: string;
  json?: boolean;
  limit?: string | number;
  now?: Date;
  source?: string;
  targetFile?: string;
  targetDir?: string;
  confirmApply?: boolean;
  worktree?: string;
  session?: string;
  approvedBy?: string;
  decidedBy?: string;
  decision?: string;
  reason?: string;
  status?: string;
  summary?: string;
  evidenceRef?: string[];
  evidenceRefs?: string[];
  usedImprovementPrompt?: string[];
  usedImprovementPromptIds?: string[];
  snapshotId?: string;
  verbose?: boolean;
};

export function registerLoopCommand(program: Command): void {
  const loop = program
    .command("loop")
    .description("Collect and brief local agent loop snapshots.");

  loop
    .command("status")
    .description("Show local LoopRelay snapshot readiness.")
    .option("--data-dir <path>", "Override the looprelay data directory.")
    .option("--all-projects", "Include snapshots from every local project.")
    .option("--verbose", "Show detailed worktree and evidence diagnostics.")
    .option("--json", "Print JSON.")
    .action((options: LoopCliOptions) => {
      console.log(loopStatusForCli(options));
    });

  loop
    .command("collect")
    .description("Collect a privacy-safe snapshot from recent prompt metadata.")
    .option("--data-dir <path>", "Override the looprelay data directory.")
    .option("--json", "Print JSON.")
    .option("--limit <count>", "Maximum recent prompts to include.")
    .option(
      "--cwd-prefix <path>",
      "Only include prompts from this project/path.",
    )
    .option("--source <source>", "Collection source label (cli or service).")
    .option("--branch <name>", "Git branch label to attach to the snapshot.")
    .option("--worktree <name>", "Worktree label to attach to the snapshot.")
    .action((options: LoopCliOptions) => {
      console.log(loopCollectForCli(options));
    });

  loop
    .command("checkpoint")
    .description(
      "Create a privacy-safe first-session checkpoint and continuation brief.",
    )
    .requiredOption(
      "--summary <summary>",
      "Safe task state and next-step summary; prompt bodies are not stored.",
    )
    .option(
      "--status <status>",
      "Checkpoint status (unknown, in_progress, passed, failed, blocked, or abandoned).",
      "in_progress",
    )
    .option(
      "--evidence-ref <ref>",
      "Privacy-safe evidence label; repeat for multiple labels.",
      collectOptionValue,
      [],
    )
    .option("--data-dir <path>", "Override the looprelay data directory.")
    .option("--branch <name>", "Git branch label to attach to the checkpoint.")
    .option(
      "--worktree <name>",
      "Safe worktree label to attach to the checkpoint.",
    )
    .option("--json", "Print JSON.")
    .action((options: LoopCliOptions) => {
      console.log(loopCheckpointForCli(options));
    });

  loop
    .command("brief")
    .description("Print a continuation prompt from a local loop snapshot.")
    .option("--data-dir <path>", "Override the looprelay data directory.")
    .option("--json", "Print JSON.")
    .option(
      "--worktree <name>",
      "Select the newest snapshot for this worktree label.",
    )
    .option(
      "--session <id>",
      "Select the newest snapshot for this agent session id.",
    )
    .option(
      "--branch <name>",
      "Select the newest snapshot for this branch label.",
    )
    .option("--all-projects", "Allow selection across every local project.")
    .action((options: LoopCliOptions) => {
      console.log(loopBriefForCli(options));
    });

  loop
    .command("outcome")
    .description("Record a privacy-safe outcome on a local loop snapshot.")
    .requiredOption(
      "--status <status>",
      "Outcome status (unknown, in_progress, passed, failed, blocked, or abandoned).",
    )
    .requiredOption("--summary <summary>", "Privacy-safe outcome summary.")
    .option(
      "--evidence-ref <ref>",
      "Privacy-safe evidence label; repeat for multiple labels.",
      collectOptionValue,
      [],
    )
    .option(
      "--used-improvement-prompt <prompt-id>",
      "Prompt id whose LoopRelay improvement was used; repeat for multiple prompts.",
      collectOptionValue,
      [],
    )
    .option("--snapshot-id <id>", "Select a loop snapshot by id.")
    .option("--worktree <name>", "Select the newest snapshot for a worktree.")
    .option("--session <id>", "Select the newest snapshot for a session.")
    .option("--branch <name>", "Select the newest snapshot for a branch.")
    .option("--data-dir <path>", "Override the looprelay data directory.")
    .option("--json", "Print JSON.")
    .action((options: LoopCliOptions) => {
      console.log(loopOutcomeForCli(options));
    });

  loop
    .command("memory-candidate")
    .description("Decide whether a local loop can become an approved memory.")
    .option("--snapshot-id <id>", "Select a loop snapshot by id.")
    .option("--worktree <name>", "Select the newest snapshot for a worktree.")
    .option("--session <id>", "Select the newest snapshot for a session.")
    .option("--branch <name>", "Select the newest snapshot for a branch.")
    .option("--data-dir <path>", "Override the looprelay data directory.")
    .option("--json", "Print JSON.")
    .action((options: LoopCliOptions) => {
      console.log(loopMemoryCandidateForCli(options));
    });

  loop
    .command("memory-approve")
    .description("Record an eligible loop memory candidate after approval.")
    .option("--snapshot-id <id>", "Select a loop snapshot by id.")
    .option("--worktree <name>", "Select the newest snapshot for a worktree.")
    .option("--session <id>", "Select the newest snapshot for a session.")
    .option("--branch <name>", "Select the newest snapshot for a branch.")
    .option("--data-dir <path>", "Override the looprelay data directory.")
    .option("--approved-by <actor>", "Approval actor label.", "user")
    .option("--json", "Print JSON.")
    .action((options: LoopCliOptions) => {
      console.log(loopMemoryApproveForCli(options));
    });

  loop
    .command("instruction-patch")
    .description(
      "Propose an instruction-file patch from approved LoopRelay memory.",
    )
    .option("--data-dir <path>", "Override the looprelay data directory.")
    .option(
      "--target-file <file>",
      "Instruction file target (AGENTS.md or CLAUDE.md).",
      "AGENTS.md",
    )
    .option("--json", "Print JSON.")
    .action((options: LoopCliOptions) => {
      console.log(loopInstructionPatchForCli(options));
    });

  loop
    .command("instruction-apply")
    .description("Apply an approved LoopRelay memory to an instruction file.")
    .option("--data-dir <path>", "Override the looprelay data directory.")
    .option(
      "--target-file <file>",
      "Instruction file target (AGENTS.md or CLAUDE.md).",
      "AGENTS.md",
    )
    .option(
      "--target-dir <path>",
      "Project directory to update.",
      process.cwd(),
    )
    .option("--confirm-apply", "Confirm writing the instruction file.")
    .option("--json", "Print JSON.")
    .action((options: LoopCliOptions) => {
      console.log(loopInstructionPatchApplyForCli(options));
    });

  const decision = loop
    .command("decision")
    .description("Record and list explicit local merge decisions.");

  decision
    .command("record")
    .description("Record a local merge decision for a worktree.")
    .requiredOption("--worktree <name>", "Worktree label being reviewed.")
    .requiredOption(
      "--decision <merge|continue|defer>",
      "Local merge decision.",
    )
    .requiredOption("--reason <text>", "Privacy-safe decision reason.")
    .option("--decided-by <actor>", "Decision actor label.", "user")
    .option("--data-dir <path>", "Override the looprelay data directory.")
    .option("--json", "Print JSON.")
    .action((options: LoopCliOptions) => {
      console.log(loopDecisionRecordForCli(options));
    });

  decision
    .command("list")
    .description("List recent local merge decisions.")
    .option("--data-dir <path>", "Override the looprelay data directory.")
    .option("--json", "Print JSON.")
    .option("--limit <count>", "Maximum decisions to include.")
    .option("--worktree <name>", "Only include this worktree label.")
    .action((options: LoopCliOptions) => {
      console.log(loopDecisionListForCli(options));
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

export function loopCheckpointForCli(options: LoopCliOptions = {}): string {
  const parsed = parseLoopOutcomeInput({
    status: options.status ?? "in_progress",
    summary: options.summary,
    evidenceRefs: options.evidenceRefs ?? options.evidenceRef,
  });
  if (!parsed.ok) {
    throw new UserError(parsed.message);
  }

  initializeLoopRelay({ dataDir: options.dataDir });
  return withStorage(options.dataDir, (storage, hmacSecret) => {
    const cwd = options.cwd ?? process.cwd();
    const snapshot = collectLoopSnapshot({
      storage,
      hmacSecret,
      source: "cli",
      now: options.now,
      cwd,
      cwdPrefix: options.cwdPrefix ?? cwd,
      limit: parseLimit(options.limit),
      branch: options.branch,
      worktree: options.worktree,
    });
    const recorded = storage.recordLoopOutcome(snapshot.id, parsed.outcome);
    if (!recorded) {
      throw new UserError("Loop checkpoint could not be recorded.");
    }
    const brief = createLoopBrief({
      snapshot: recorded,
      approvedMemories: storage.listLoopMemories({
        projectId: recorded.project_id,
        limit: 3,
      }).items,
    });
    const result = {
      snapshot: recorded,
      brief,
      next_action: "copy the continuation brief into the next agent session",
      privacy: {
        local_only: true as const,
        external_calls: false as const,
        stores_prompt_bodies: false as const,
        stores_raw_paths: false as const,
      },
    };

    return options.json
      ? JSON.stringify(result, null, 2)
      : `Checkpoint recorded for ${recorded.cwd_label}.\n\n${brief.prompt}`;
  });
}

export function loopStatusForCli(options: LoopCliOptions = {}): string {
  return withStorage(options.dataDir, (storage, hmacSecret) => {
    const allSnapshots = storage.listLoopSnapshots({ limit: 100 }).items;
    const currentProjectId = createProjectKey(
      options.cwd ?? process.cwd(),
      hmacSecret,
    );
    const snapshots = options.allProjects
      ? allSnapshots
      : allSnapshots.filter(
          (snapshot) => snapshot.project_id === currentProjectId,
        );
    const latest = snapshots.at(0);
    const status = createLoopRelayStatus({
      snapshots,
      compactBoundaries: storage.listCompactBoundaries({ limit: 20 }).items,
      projectMemoryCount: latest
        ? storage.listLoopMemories({ projectId: latest.project_id }).items
            .length
        : 0,
      memoryCandidate: latest ? decideLoopMemoryCandidate(latest) : undefined,
      mergeDecisions: storage.listLoopMergeDecisions({
        limit: 3,
        ...(latest && !options.allProjects
          ? { projectId: latest.project_id }
          : {}),
      }).items,
    });
    const pairReadiness = createBenchmarkPairCandidateReport(
      snapshots,
      20,
      (promptId) => storage.getPrompt(promptId) !== undefined,
    );

    return options.json
      ? JSON.stringify(status, null, 2)
      : options.verbose
        ? formatVerboseLoopStatus(status)
        : formatLoopStatus(status, pairReadiness, options.allProjects === true);
  });
}

export function loopBriefForCli(options: LoopCliOptions = {}): string {
  return withStorage(options.dataDir, (storage, hmacSecret) => {
    const selection = {
      worktree: options.worktree,
      sessionId: options.session,
      branch: options.branch,
    };
    const hasSelection = hasLoopSnapshotSelection(selection);
    const currentProjectId = createProjectKey(
      options.cwd ?? process.cwd(),
      hmacSecret,
    );
    const snapshots = storage
      .listLoopSnapshots({ limit: 100 })
      .items.filter(
        (snapshot) =>
          options.allProjects || snapshot.project_id === currentProjectId,
      );
    const snapshot = hasSelection
      ? selectLoopSnapshot(snapshots, selection)
      : snapshots.at(0);
    if (!snapshot) {
      throw new UserError(
        hasSelection
          ? selectedLoopSnapshotNotFoundMessage(selection)
          : loopBriefNoSnapshotCliMessage(),
      );
    }
    const compactBoundary = latestCompactBoundaryAfterSnapshot(
      snapshot,
      storage.listCompactBoundaries({ limit: 20 }).items,
    );
    const approvedMemories = storage.listLoopMemories({
      projectId: snapshot.project_id,
      limit: 3,
    }).items;
    const brief = createLoopBrief({
      snapshot,
      compactBoundary,
      approvedMemories,
    });
    return options.json
      ? JSON.stringify(brief, null, 2)
      : `${brief.title}\n\n${brief.prompt}`;
  });
}

export function loopOutcomeForCli(options: LoopCliOptions = {}): string {
  const parsed = parseLoopOutcomeInput({
    status: options.status,
    summary: options.summary,
    evidenceRefs: options.evidenceRefs ?? options.evidenceRef,
    usedImprovementPromptIds:
      options.usedImprovementPromptIds ?? options.usedImprovementPrompt,
  });
  if (!parsed.ok) {
    throw new UserError(parsed.message);
  }

  return withStorage(options.dataDir, (storage) => {
    const target = {
      snapshotId: options.snapshotId,
      worktree: options.worktree,
      sessionId: options.session,
      branch: options.branch,
    };
    const hasSelection = hasLoopSnapshotSelection(target);
    if (hasAmbiguousLoopSnapshotTarget(target)) {
      throw new UserError(
        "Use either --snapshot-id or worktree/session/branch filters, not both.",
      );
    }

    const snapshots = storage.listLoopSnapshots({ limit: 100 }).items;
    const snapshot = selectLoopSnapshotTarget(snapshots, target);
    if (!snapshot) {
      throw new UserError(
        hasSelection
          ? selectedLoopSnapshotNotFoundMessage(target)
          : "No loop snapshot found. Run `looprelay loop collect` before recording an outcome.",
      );
    }

    let recorded;
    try {
      recorded = storage.recordLoopOutcome(snapshot.id, parsed.outcome);
    } catch (error) {
      if (error instanceof LoopOutcomeAttributionError) {
        throw new UserError(error.message);
      }
      throw error;
    }
    if (!recorded) {
      throw new UserError("Loop snapshot not found.");
    }

    const result = {
      recorded: true as const,
      snapshot_id: recorded.id,
      outcome: recorded.outcome,
      next_action: "review the outcome before approving durable memory",
      next_actions: ["looprelay loop memory-candidate", "looprelay loop brief"],
      privacy: {
        local_only: true as const,
        external_calls: false as const,
        stores_prompt_bodies: false as const,
        stores_raw_paths: false as const,
        auto_approves_memory: false as const,
      },
    };

    return options.json
      ? JSON.stringify(result, null, 2)
      : formatLoopOutcome(result);
  });
}

export function loopMemoryCandidateForCli(
  options: LoopCliOptions = {},
): string {
  const target = loopSnapshotTargetForCli(options);
  return withStorage(options.dataDir, (storage) => {
    const snapshot = selectLoopSnapshotTarget(
      storage.listLoopSnapshots({ limit: 100 }).items,
      target,
    );
    if (!snapshot) {
      throw new UserError(
        loopMemoryNoSnapshotCliMessage("looprelay loop memory-candidate"),
      );
    }

    const decision = decideLoopMemoryCandidate(snapshot);
    return options.json
      ? JSON.stringify(decision, null, 2)
      : formatLoopMemoryCandidate(decision);
  });
}

export function loopMemoryApproveForCli(options: LoopCliOptions = {}): string {
  const target = loopSnapshotTargetForCli(options);
  return withStorage(options.dataDir, (storage) => {
    const snapshot = selectLoopSnapshotTarget(
      storage.listLoopSnapshots({ limit: 100 }).items,
      target,
    );
    if (!snapshot) {
      throw new UserError(
        loopMemoryNoSnapshotCliMessage("looprelay loop memory-approve"),
      );
    }

    const decision = decideLoopMemoryCandidate(snapshot);
    if (!decision.eligible || !decision.candidate) {
      throw new UserError(
        `Selected loop is not eligible for memory approval: ${decision.reason}.`,
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
      next_actions: [
        "looprelay loop brief",
        "looprelay loop instruction-patch --target-file AGENTS.md",
      ],
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

export function loopInstructionPatchForCli(
  options: LoopCliOptions = {},
): string {
  return withStorage(options.dataDir, (storage) => {
    const targetFile = parseInstructionPatchTarget(
      options.targetFile ?? "AGENTS.md",
    );
    const memory = storage.listLoopMemories({ limit: 1 }).items.at(0);
    if (!memory) {
      throw new UserError(
        loopInstructionPatchNoMemoryCliMessage(
          `looprelay loop instruction-patch --target-file ${targetFile}`,
        ),
      );
    }
    const proposal = proposeInstructionPatchFromMemory({
      memory,
      targetFile,
    });

    return options.json
      ? JSON.stringify(proposal, null, 2)
      : formatInstructionPatchProposal(proposal);
  });
}

export function loopInstructionPatchApplyForCli(
  options: LoopCliOptions = {},
): string {
  if (!options.confirmApply) {
    throw new UserError("Instruction patch apply requires --confirm-apply.");
  }

  return withStorage(options.dataDir, (storage) => {
    const targetFile = parseInstructionPatchTarget(
      options.targetFile ?? "AGENTS.md",
    );
    const memory = storage.listLoopMemories({ limit: 1 }).items.at(0);
    if (!memory) {
      throw new UserError(
        loopInstructionPatchNoMemoryCliMessage(
          `looprelay loop instruction-apply --target-file ${targetFile} --confirm-apply`,
        ),
      );
    }
    const result = applyInstructionPatchFromMemory({
      memory,
      targetDir: options.targetDir ?? process.cwd(),
      targetFile,
      confirmApply: true,
    });

    return options.json
      ? JSON.stringify(result, null, 2)
      : formatInstructionPatchApplyResult(result);
  });
}

export function loopDecisionRecordForCli(options: LoopCliOptions = {}): string {
  const worktree = options.worktree?.trim();
  if (!worktree) {
    throw new UserError("--worktree is required.");
  }

  const decision = parseLoopMergeDecision(options.decision);
  const reason = options.reason ?? "";

  return withStorage(options.dataDir, (storage) => {
    const snapshot = selectLoopSnapshot(
      storage.listLoopSnapshots({ limit: 100 }).items,
      { worktree },
    );
    if (!snapshot) {
      throw new UserError(
        "No loop snapshot matched the selected worktree for decision recording.",
      );
    }

    const recorded = storage.recordLoopMergeDecision({
      snapshot_id: snapshot.id,
      project_id: snapshot.project_id,
      worktree,
      decision,
      reason,
      decided_by: options.decidedBy ?? "user",
    });
    const result = {
      recorded: true as const,
      decision: recorded,
      next_action: "review recorded merge decision before merge",
      privacy: {
        ...recorded.privacy,
        returns_prompt_bodies: false,
        returns_raw_paths: false,
      },
    };

    return options.json
      ? JSON.stringify(result, null, 2)
      : formatLoopMergeDecisionRecord(result);
  });
}

export function loopDecisionListForCli(options: LoopCliOptions = {}): string {
  return withStorage(options.dataDir, (storage) => {
    const result = {
      decisions: storage.listLoopMergeDecisions({
        limit: parseLimit(options.limit),
        worktree: options.worktree,
      }).items,
      privacy: {
        local_only: true,
        returns_prompt_bodies: false,
        returns_raw_paths: false,
        writes_git_state: false,
        external_calls: false,
      },
    };

    return options.json
      ? JSON.stringify(result, null, 2)
      : formatLoopMergeDecisionList(result);
  });
}

function withStorage<T>(
  dataDir: string | undefined,
  callback: (
    storage: ReturnType<typeof createSqlitePromptStorage>,
    hmacSecret: string,
  ) => T,
): T {
  const config = loadLoopRelayConfig(dataDir);
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

function collectOptionValue(value: string, previous: string[]): string[] {
  return [...previous, value];
}

function loopSnapshotTargetForCli(options: LoopCliOptions) {
  const target = {
    snapshotId: options.snapshotId,
    worktree: options.worktree,
    sessionId: options.session,
    branch: options.branch,
  };
  if (hasAmbiguousLoopSnapshotTarget(target)) {
    throw new UserError(
      "Use either --snapshot-id or worktree/session/branch filters, not both.",
    );
  }
  return target;
}

function parseSource(value: string | undefined): LoopSnapshotSource {
  if (value === undefined || value === "cli") return "cli";
  if (value === "service") return "service";
  throw new UserError("--source must be either cli or service.");
}

function parseLoopMergeDecision(
  value: string | undefined,
): LoopMergeDecisionValue {
  if (value === "merge" || value === "continue" || value === "defer") {
    return value;
  }
  throw new UserError("--decision must be merge, continue, or defer.");
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
    "Next: looprelay loop brief",
    "",
    "Privacy: local-only, no prompt bodies, no raw paths.",
  ].join("\n");
}

function formatLoopStatus(
  status: LoopRelayStatus,
  pairReadiness: BenchmarkPairCandidateReport,
  allProjects: boolean,
): string {
  const latest = status.latest_snapshot;
  const failureCount = status.failure_patterns?.reduce(
    (total, pattern) => total + pattern.occurrences,
    0,
  );
  const attention = status.activity.needs_review
    ? "Worktree review needed"
    : failureCount
      ? `${failureCount} recurring failure ${failureCount === 1 ? "occurrence" : "occurrences"}`
      : latest && latest.outcome_status !== "passed"
        ? "Outcome checkpoint pending"
        : "No immediate review";
  const snapshotLabel = status.snapshot_count === 1 ? "snapshot" : "snapshots";
  const sessionLabel =
    status.activity.active_sessions === 1 ? "session" : "sessions";
  const checkpointAction = status.next_actions
    .find((action) => action.includes("looprelay loop outcome --snapshot-id"))
    ?.match(/looprelay loop outcome --snapshot-id [A-Za-z0-9_-]+/)?.[0];
  const nextAction =
    latest &&
    (latest.outcome_status === "unknown" ||
      latest.outcome_status === "in_progress")
      ? (checkpointAction ?? status.next_action)
      : status.next_action;

  return [
    `LoopRelay · ${status.status}`,
    `Scope: ${allProjects ? "all local projects" : "current project"}`,
    `Managed: ${status.snapshot_count} ${snapshotLabel} · ${status.activity.active_sessions} ${sessionLabel} · ${status.project_memory.approved_count} approved lessons`,
    `Attention: ${attention}`,
    `Evidence: ${formatPairReadiness(pairReadiness)}`,
    `Latest: ${latest ? `${latest.project} · ${latest.outcome_status}` : "none"}`,
    `Next: ${nextAction}`,
    "Privacy: local-only; prompt bodies and raw paths stay hidden.",
  ].join("\n");
}

function formatPairReadiness(readiness: BenchmarkPairCandidateReport): string {
  if (readiness.status === "ready") {
    return `${readiness.baseline_candidate_count} baseline · ${readiness.looprelay_candidate_count} LoopRelay · pair review ready`;
  }
  if (readiness.status === "no_completed_outcomes") {
    return "completed outcomes needed";
  }
  if (readiness.status === "incomplete_outcome_evidence") {
    return "outcome evidence incomplete";
  }
  if (readiness.status === "missing_prompt_records") {
    return "prompt records need recovery";
  }
  if (readiness.status === "needs_baseline") {
    return "comparable baseline needed";
  }
  if (readiness.status === "needs_looprelay") {
    return "LoopRelay-assisted outcome needed";
  }
  if (readiness.status === "unsafe_outcome_evidence") {
    return "outcome evidence needs redaction";
  }
  return "no evaluated loops yet";
}

function formatVerboseLoopStatus(status: LoopRelayStatus): string {
  return [
    `LoopRelay status ${status.status}`,
    `snapshots ${status.snapshot_count}`,
    `approved memories ${status.project_memory.approved_count}`,
    `active worktrees ${status.activity.active_worktrees}`,
    `active sessions ${status.activity.active_sessions}`,
    `worktree review needed ${status.activity.needs_review ? "yes" : "no"}`,
    status.activity.command_center
      ? `command center ${status.activity.command_center.title}`
      : undefined,
    status.activity.command_center
      ? `primary action ${status.activity.command_center.primary_action}`
      : undefined,
    status.activity.command_center
      ? `review packet ${status.activity.command_center.review_packet.status}`
      : undefined,
    status.activity.command_center
      ? `review packet summary ${status.activity.command_center.review_packet.summary}`
      : undefined,
    status.activity.command_center
      ? `review packet next ${status.activity.command_center.review_packet.next_action}`
      : undefined,
    status.activity.command_center?.review_packet.decision_advisory
      ? `review packet advisory ${status.activity.command_center.review_packet.decision_advisory.next_action}`
      : undefined,
    ...(status.activity.command_center?.review_packet.checklist.map(
      (item) => `checklist ${item.label} ${item.status}`,
    ) ?? []),
    ...(status.activity.recent_decisions?.map(
      (decision) =>
        `recent decision ${decision.worktree} ${decision.decision} ${decision.reason}`,
    ) ?? []),
    ...(status.activity.command_center?.review_items
      .slice(0, 3)
      .flatMap((item) => [
        `review ${item.worktree} ${item.recommendation}`,
        `merge readiness ${item.worktree} ${item.merge_readiness.status}`,
        `evidence ${item.worktree} ${item.merge_readiness.evidence} refs ${item.evidence_count}`,
        `command ${item.continuation_command}`,
      ]) ?? []),
    ...status.activity.worktrees
      .slice(0, 3)
      .map(
        (worktree) =>
          `worktree ${worktree.worktree} snapshots ${worktree.snapshots} sessions ${worktree.sessions} latest ${worktree.latest_outcome_status}`,
      ),
    status.memory_candidate
      ? `memory candidate ${status.memory_candidate.eligible ? "eligible" : status.memory_candidate.reason}`
      : "memory candidate none",
    status.latest_snapshot ? "latest loop" : "latest loop none",
    status.latest_snapshot ? `id ${status.latest_snapshot.id}` : undefined,
    status.latest_snapshot
      ? `project ${status.latest_snapshot.project}`
      : undefined,
    status.latest_snapshot ? `tool ${status.latest_snapshot.tool}` : undefined,
    status.latest_snapshot
      ? `prompts ${status.latest_snapshot.prompt_count}`
      : undefined,
    status.latest_snapshot?.prompt_ids?.length
      ? `prompt ids ${status.latest_snapshot.prompt_ids.join(", ")}`
      : undefined,
    status.latest_snapshot?.average_prompt_score === undefined
      ? undefined
      : `average prompt score ${status.latest_snapshot.average_prompt_score}/100`,
    status.latest_compact_boundary
      ? `compact boundary ${status.latest_compact_boundary.event_name} at ${status.latest_compact_boundary.created_at} (${status.latest_compact_boundary.trigger})`
      : "compact boundary none after latest snapshot",
    "",
    "Next actions:",
    ...status.next_actions.map((action) => `- ${action}`),
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
    decision.candidate
      ? `statement ${decision.candidate.statement}`
      : undefined,
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

function formatLoopOutcome(result: {
  snapshot_id: string;
  outcome: LoopSnapshot["outcome"];
  next_action: string;
  next_actions: string[];
}): string {
  return [
    "Loop outcome recorded",
    `snapshot ${result.snapshot_id}`,
    `status ${result.outcome.status}`,
    `summary ${result.outcome.summary}`,
    `evidence ${result.outcome.evidence_refs.join(", ") || "none"}`,
    "",
    `Next: ${result.next_action}`,
    ...result.next_actions.map((action) => `- ${action}`),
    "",
    "Privacy: local-only, no prompt bodies, no raw paths, no external calls, no automatic memory approval.",
  ].join("\n");
}

function formatLoopMemoryApproval(result: {
  recorded: true;
  memory: ReturnType<
    ReturnType<typeof createSqlitePromptStorage>["recordLoopMemory"]
  >;
  next_action: string;
  next_actions: string[];
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
    ...result.next_actions.map((action) => `- ${action}`),
    "",
    "Privacy: local-only, no prompt bodies, no raw paths, no external calls, no instruction file writes.",
  ].join("\n");
}

function formatInstructionPatchProposal(
  proposal: InstructionPatchProposal,
): string {
  return [
    "Loop instruction patch proposal",
    `target ${proposal.target_file}`,
    `writes files ${proposal.writes_files ? "yes" : "no"}`,
    `requires approval ${proposal.requires_user_approval ? "yes" : "no"}`,
    "",
    proposal.diff.trimEnd(),
    "",
    `Next: ${proposal.next_action}`,
    "",
    "Privacy: local-only, no prompt bodies, no raw paths, no external calls, no instruction file writes.",
  ].join("\n");
}

function formatInstructionPatchApplyResult(
  result: InstructionPatchApplyResult,
): string {
  return [
    "Loop instruction patch applied",
    `target ${result.target_file}`,
    `applied ${result.applied ? "yes" : "no"}`,
    `already present ${result.already_present ? "yes" : "no"}`,
    `writes files ${result.writes_files ? "yes" : "no"}`,
    "",
    `Next: ${result.next_action}`,
    "",
    "Privacy: local-only, no prompt bodies, no raw paths, no external calls.",
  ].join("\n");
}

function formatLoopMergeDecisionRecord(result: {
  recorded: true;
  decision: ReturnType<
    ReturnType<typeof createSqlitePromptStorage>["recordLoopMergeDecision"]
  >;
  next_action: string;
}): string {
  return [
    "Loop merge decision recorded",
    `id ${result.decision.id}`,
    `worktree ${result.decision.worktree}`,
    `decision ${result.decision.decision}`,
    `reason ${result.decision.reason}`,
    `decided by ${result.decision.decided_by}`,
    "",
    `Next: ${result.next_action}`,
    "",
    "Privacy: local-only, no prompt bodies, no raw paths, no git writes.",
  ].join("\n");
}

function formatLoopMergeDecisionList(result: {
  decisions: ReturnType<
    ReturnType<typeof createSqlitePromptStorage>["listLoopMergeDecisions"]
  >["items"];
}): string {
  return [
    "Loop merge decisions",
    ...result.decisions.map(
      (decision) =>
        `${decision.created_at} ${decision.worktree} ${decision.decision} ${decision.reason}`,
    ),
    result.decisions.length === 0 ? "none" : undefined,
    "",
    "Privacy: local-only, no prompt bodies, no raw paths, no git writes.",
  ]
    .filter((line): line is string => line !== undefined)
    .join("\n");
}
