import type { Command } from "commander";

import { loadHookAuth, loadPromptLaneConfig } from "../../config/config.js";
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
  hasLoopSnapshotSelection,
  selectLoopSnapshot,
} from "../../loop/snapshot-selection.js";
import {
  createPromptLaneStatus,
  type PromptLaneStatus,
} from "../../loop/status.js";
import type { LoopSnapshot, LoopSnapshotSource } from "../../loop/types.js";
import type { LoopMergeDecisionValue } from "../../storage/loop-decisions.js";
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
  targetFile?: string;
  targetDir?: string;
  confirmApply?: boolean;
  worktree?: string;
  session?: string;
  approvedBy?: string;
  decidedBy?: string;
  decision?: string;
  reason?: string;
};

export function registerLoopCommand(program: Command): void {
  const loop = program
    .command("loop")
    .description("Collect and brief local agent loop snapshots.");

  loop
    .command("status")
    .description("Show local PromptLane snapshot readiness.")
    .option("--data-dir <path>", "Override the promptlane data directory.")
    .option("--json", "Print JSON.")
    .action((options: LoopCliOptions) => {
      console.log(loopStatusForCli(options));
    });

  loop
    .command("collect")
    .description("Collect a privacy-safe snapshot from recent prompt metadata.")
    .option("--data-dir <path>", "Override the promptlane data directory.")
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
    .command("brief")
    .description("Print a continuation prompt from a local loop snapshot.")
    .option("--data-dir <path>", "Override the promptlane data directory.")
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
    .action((options: LoopCliOptions) => {
      console.log(loopBriefForCli(options));
    });

  loop
    .command("memory-candidate")
    .description(
      "Decide whether the latest loop can become an approved memory.",
    )
    .option("--data-dir <path>", "Override the promptlane data directory.")
    .option("--json", "Print JSON.")
    .action((options: LoopCliOptions) => {
      console.log(loopMemoryCandidateForCli(options));
    });

  loop
    .command("memory-approve")
    .description(
      "Record the latest eligible loop memory candidate after approval.",
    )
    .option("--data-dir <path>", "Override the promptlane data directory.")
    .option("--approved-by <actor>", "Approval actor label.", "user")
    .option("--json", "Print JSON.")
    .action((options: LoopCliOptions) => {
      console.log(loopMemoryApproveForCli(options));
    });

  loop
    .command("instruction-patch")
    .description(
      "Propose an instruction-file patch from approved PromptLane memory.",
    )
    .option("--data-dir <path>", "Override the promptlane data directory.")
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
    .description("Apply an approved PromptLane memory to an instruction file.")
    .option("--data-dir <path>", "Override the promptlane data directory.")
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
    .option("--data-dir <path>", "Override the promptlane data directory.")
    .option("--json", "Print JSON.")
    .action((options: LoopCliOptions) => {
      console.log(loopDecisionRecordForCli(options));
    });

  decision
    .command("list")
    .description("List recent local merge decisions.")
    .option("--data-dir <path>", "Override the promptlane data directory.")
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

export function loopStatusForCli(options: LoopCliOptions = {}): string {
  return withStorage(options.dataDir, (storage) => {
    const snapshots = storage.listLoopSnapshots({ limit: 100 }).items;
    const latest = snapshots.at(0);
    const status = createPromptLaneStatus({
      snapshots,
      compactBoundaries: storage.listCompactBoundaries({ limit: 20 }).items,
      projectMemoryCount: latest
        ? storage.listLoopMemories({ projectId: latest.project_id }).items
            .length
        : 0,
      memoryCandidate: latest ? decideLoopMemoryCandidate(latest) : undefined,
      mergeDecisions: storage.listLoopMergeDecisions({ limit: 3 }).items,
    });

    return options.json
      ? JSON.stringify(status, null, 2)
      : formatLoopStatus(status);
  });
}

export function loopBriefForCli(options: LoopCliOptions = {}): string {
  return withStorage(options.dataDir, (storage) => {
    const selection = {
      worktree: options.worktree,
      sessionId: options.session,
      branch: options.branch,
    };
    const hasSelection = hasLoopSnapshotSelection(selection);
    const snapshot = hasSelection
      ? selectLoopSnapshot(
          storage.listLoopSnapshots({ limit: 100 }).items,
          selection,
        )
      : storage.getLatestLoopSnapshot();
    if (!snapshot) {
      throw new UserError(
        hasSelection
          ? "No loop snapshot matched the selected worktree/session/branch filters."
          : "No loop snapshot found. Run `promptlane loop collect` first.",
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

export function loopMemoryCandidateForCli(
  options: LoopCliOptions = {},
): string {
  return withStorage(options.dataDir, (storage) => {
    const snapshot = storage.getLatestLoopSnapshot();
    if (!snapshot) {
      throw new UserError(
        "No loop snapshot found. Run `promptlane loop collect` first.",
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
        "No loop snapshot found. Run `promptlane loop collect` first.",
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
      next_actions: [
        "promptlane loop brief",
        "promptlane loop instruction-patch --target-file AGENTS.md",
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
        "No loop memory found. Run `promptlane loop memory-approve` first.",
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
        "No loop memory found. Run `promptlane loop memory-approve` first.",
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

export function loopDecisionRecordForCli(
  options: LoopCliOptions = {},
): string {
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
  const config = loadPromptLaneConfig(dataDir);
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
    "Next: promptlane loop brief",
    "",
    "Privacy: local-only, no prompt bodies, no raw paths.",
  ].join("\n");
}

function formatLoopStatus(status: PromptLaneStatus): string {
  return [
    `PromptLane status ${status.status}`,
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
    ...(
      status.activity.command_center?.review_packet.checklist.map(
        (item) => `checklist ${item.label} ${item.status}`,
      ) ?? []
    ),
    ...(
      status.activity.recent_decisions?.map(
        (decision) =>
          `recent decision ${decision.worktree} ${decision.decision} ${decision.reason}`,
      ) ?? []
    ),
    ...(
      status.activity.command_center?.review_items
        .slice(0, 3)
        .flatMap((item) => [
          `review ${item.worktree} ${item.recommendation}`,
          `merge readiness ${item.worktree} ${item.merge_readiness.status}`,
          `evidence ${item.worktree} ${item.merge_readiness.evidence} refs ${item.evidence_count}`,
          `command ${item.continuation_command}`,
        ]) ?? []
    ),
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
