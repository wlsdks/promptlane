import type { Command } from "commander";

import { createBenchmarkPairCandidateReport } from "../../analysis/benchmark-pair-candidates.js";
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
  parseInstructionPatchTarget,
  proposeInstructionPatchFromMemory,
} from "../../loop/instruction-patch.js";
import { decideLoopMemoryCandidate } from "../../loop/memory-candidate.js";
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
import { createLoopRelayStatus } from "../../loop/status.js";
import type { LoopSnapshotSource } from "../../loop/types.js";
import type { LoopMergeDecisionValue } from "../../storage/loop-decisions.js";
import { createProjectKey } from "../../storage/project-id.js";
import { createSqlitePromptStorage } from "../../storage/sqlite.js";
import {
  formatInstructionPatchApplyResult,
  formatInstructionPatchProposal,
  formatLoopMemoryApproval,
  formatLoopMemoryCandidate,
  formatLoopMergeDecisionList,
  formatLoopMergeDecisionRecord,
  formatLoopOutcome,
  formatLoopSnapshot,
  formatLoopStatus,
  formatVerboseLoopStatus,
} from "./loop-formatters.js";
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
