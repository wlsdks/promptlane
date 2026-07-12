import { loadHookAuth, loadLoopRelayConfig } from "../config/config.js";
import {
  createLoopBrief,
  latestCompactBoundaryAfterSnapshot,
} from "../loop/brief.js";
import {
  applyInstructionPatchFromMemory,
  parseInstructionPatchTarget,
  proposeInstructionPatchFromMemory,
} from "../loop/instruction-patch.js";
import { decideLoopMemoryCandidate } from "../loop/memory-candidate.js";
import {
  LoopOutcomeAttributionError,
  parseLoopOutcomeInput,
} from "../loop/outcome.js";
import {
  hasAmbiguousLoopSnapshotTarget,
  hasLoopSnapshotSelection,
  loopBriefNoSnapshotMcpMessage,
  loopInstructionPatchNoMemoryMcpMessage,
  loopMemoryNoSnapshotMcpMessage,
  loopOutcomeNoSnapshotMcpMessage,
  selectLoopSnapshot,
  selectLoopSnapshotTarget,
  selectedLoopSnapshotNotFoundMessage,
} from "../loop/snapshot-selection.js";
import {
  createLoopRelayStatus,
  looprelayStatusPrivacy,
} from "../loop/status.js";
import { createSqlitePromptStorage } from "../storage/sqlite.js";
import { createProjectKey } from "../storage/project-id.js";
import { toGeneratedReceiptSummary } from "../loop/continuation.js";
import { MCP_FIRST_PROMPT_NEXT_STEP } from "./first-prompt-next-step.js";
import type { ScorePromptToolOptions } from "./score-tool-types.js";
import type {
  ApplyInstructionPatchToolArguments,
  ApplyInstructionPatchToolResult,
  GetLoopRelayLoopStatusToolArguments,
  GetLoopRelayLoopStatusToolResult,
  PrepareLoopBriefToolArguments,
  PrepareLoopBriefToolResult,
  ProposeInstructionPatchToolArguments,
  ProposeInstructionPatchToolResult,
  ProposeLoopMemoryCandidateToolArguments,
  ProposeLoopMemoryCandidateToolResult,
  RecordLoopMemoryToolArguments,
  RecordLoopMemoryToolResult,
  RecordLoopOutcomeToolArguments,
  RecordLoopOutcomeToolResult,
} from "./loop-tool-types.js";
import { storageUnavailableMessage } from "./storage-unavailable.js";

const LOOP_TOOL_NAMES = [
  "get_looprelay_loop_status",
  "prepare_loop_brief",
  "record_continuation_receipt",
  "record_loop_outcome",
  "propose_loop_memory_candidate",
  "record_loop_memory",
  "propose_instruction_patch",
  "apply_instruction_patch",
];

export function getLoopRelayLoopStatusTool(
  args: GetLoopRelayLoopStatusToolArguments,
  options: ScorePromptToolOptions = {},
): GetLoopRelayLoopStatusToolResult {
  const privacy = looprelayStatusPrivacy();

  try {
    const config = loadLoopRelayConfig(options.dataDir);
    const auth = loadHookAuth(options.dataDir);
    const storage = createSqlitePromptStorage({
      dataDir: config.data_dir,
      hmacSecret: auth.web_session_secret,
    });

    try {
      const projectId = createProjectKey(args.cwd, auth.web_session_secret);
      const snapshots = storage
        .listLoopSnapshots({ limit: 100 })
        .items.filter((snapshot) => snapshot.project_id === projectId);
      const latest = snapshots.at(0);
      const status = createLoopRelayStatus({
        snapshots,
        compactBoundaries: storage.listCompactBoundaries({ limit: 20 }).items,
        includeLatest: args.include_latest !== false,
        projectMemoryCount: latest
          ? storage.listLoopMemories({ projectId: latest.project_id }).items
              .length
          : 0,
        memoryCandidate: latest ? decideLoopMemoryCandidate(latest) : undefined,
        mergeDecisions: storage.listLoopMergeDecisions({
          limit: 3,
          projectId,
        }).items,
      });

      return {
        ...status,
        available_tools: LOOP_TOOL_NAMES,
      };
    } finally {
      storage.close();
    }
  } catch {
    return {
      status: "setup_needed",
      snapshot_count: 0,
      available_tools: LOOP_TOOL_NAMES,
      next_action: "looprelay setup --profile coach --register-mcp",
      next_actions: [
        "Run looprelay setup --profile coach --register-mcp before using LoopRelay loop MCP tools.",
        MCP_FIRST_PROMPT_NEXT_STEP,
        "Then run looprelay loop collect from the project you want to continue.",
        "For custom storage, initialize it with looprelay init --data-dir <path> and pass the same --data-dir to the MCP server.",
      ],
      privacy,
    };
  }
}

export function prepareLoopBriefTool(
  args: PrepareLoopBriefToolArguments,
  options: ScorePromptToolOptions = {},
): PrepareLoopBriefToolResult {
  const selection = {
    worktree: args.worktree,
    sessionId: args.session_id,
    branch: args.branch,
  };
  const hasSelection = hasLoopSnapshotSelection(selection);
  if (args.latest === false && !hasSelection) {
    return loopToolError(
      "invalid_input",
      "`latest` is the only supported loop snapshot selection mode today.",
    );
  }

  try {
    const config = loadLoopRelayConfig(options.dataDir);
    const auth = loadHookAuth(options.dataDir);
    const storage = createSqlitePromptStorage({
      dataDir: config.data_dir,
      hmacSecret: auth.web_session_secret,
    });

    try {
      const projectId = createProjectKey(args.cwd, auth.web_session_secret);
      const snapshots = storage
        .listLoopSnapshots({ limit: 100 })
        .items.filter((snapshot) => snapshot.project_id === projectId);
      const snapshot = hasSelection
        ? selectLoopSnapshot(snapshots, selection)
        : snapshots.at(0);
      if (!snapshot) {
        return loopToolError(
          "not_found",
          hasSelection
            ? selectedLoopSnapshotNotFoundMessage(selection)
            : loopBriefNoSnapshotMcpMessage(),
        );
      }

      const compactBoundary = latestCompactBoundaryAfterSnapshot(
        snapshot,
        storage.listCompactBoundaries({ limit: 20 }).items,
      );
      const brief = createLoopBrief({
        snapshot,
        compactBoundary,
        receipt: toGeneratedReceiptSummary(
          storage.recordContinuationReceipt({ snapshot_id: snapshot.id }),
        ),
        approvedMemories: storage.listLoopMemories({
          projectId: snapshot.project_id,
          limit: 3,
        }).items,
      });
      const baseResult = {
        snapshot_id: snapshot.id,
        receipt: brief.receipt!,
        recovery: brief.recovery,
        title: brief.title,
        prompt: brief.prompt,
        ...(brief.compact_boundary
          ? { compact_boundary: brief.compact_boundary }
          : {}),
        next_action:
          "Ask the user to review this continuation prompt before submitting it to Codex or Claude Code.",
        privacy: {
          ...loopToolPrivacy(),
          auto_submits: false as const,
        },
      };
      if (hasSelection) {
        return {
          source: "selected",
          selection: {
            ...(args.worktree ? { worktree: args.worktree } : {}),
            ...(args.session_id ? { session_id: args.session_id } : {}),
            ...(args.branch ? { branch: args.branch } : {}),
          },
          ...baseResult,
        };
      }
      return {
        source: "latest",
        ...baseResult,
      };
    } finally {
      storage.close();
    }
  } catch (error) {
    return loopToolError(
      "storage_unavailable",
      storageUnavailableMessage(error),
    );
  }
}

export function recordLoopOutcomeTool(
  args: RecordLoopOutcomeToolArguments,
  options: ScorePromptToolOptions = {},
): RecordLoopOutcomeToolResult {
  const parsed = parseLoopOutcomeInput({
    status: args.status,
    summary: args.summary,
    evidenceRefs: args.evidence_refs,
    usedImprovementPromptIds: args.used_improvement_prompt_ids,
  });
  if (!parsed.ok) {
    return loopToolError("invalid_input", parsed.message);
  }

  if (args.snapshot_id && args.latest === true) {
    return loopToolError(
      "invalid_input",
      "Use either `snapshot_id` or `latest`, not both.",
    );
  }

  try {
    const config = loadLoopRelayConfig(options.dataDir);
    const auth = loadHookAuth(options.dataDir);
    const storage = createSqlitePromptStorage({
      dataDir: config.data_dir,
      hmacSecret: auth.web_session_secret,
    });

    try {
      const snapshotId =
        args.snapshot_id ?? storage.getLatestLoopSnapshot()?.id;

      if (!snapshotId) {
        return loopToolError(
          "not_found",
          loopOutcomeNoSnapshotMcpMessage("record_loop_outcome"),
        );
      }

      let snapshot;
      try {
        snapshot = storage.recordLoopOutcome(snapshotId, parsed.outcome);
      } catch (error) {
        if (error instanceof LoopOutcomeAttributionError) {
          return loopToolError("invalid_input", error.message);
        }
        throw error;
      }

      if (!snapshot) {
        return loopToolError(
          "not_found",
          `Loop snapshot not found: ${snapshotId}.`,
        );
      }

      return {
        recorded: true,
        snapshot_id: snapshot.id,
        outcome: snapshot.outcome,
        next_action:
          "Use prepare_loop_brief to continue the loop or run looprelay loop collect after the next agent turn.",
        privacy: {
          ...loopToolPrivacy(),
          stores_prompt_bodies: false,
          stores_raw_paths: false,
        },
      };
    } finally {
      storage.close();
    }
  } catch (error) {
    return loopToolError(
      "storage_unavailable",
      storageUnavailableMessage(error),
    );
  }
}

export function proposeLoopMemoryCandidateTool(
  args: ProposeLoopMemoryCandidateToolArguments,
  options: ScorePromptToolOptions = {},
): ProposeLoopMemoryCandidateToolResult {
  const target = loopSnapshotTargetForMcp(args);
  if (!target.ok) {
    return loopToolError("invalid_input", target.message);
  }
  if (
    args.latest === false &&
    !hasLoopSnapshotSelection(target.value) &&
    !target.value.snapshotId
  ) {
    return loopToolError(
      "invalid_input",
      "`latest` is the only supported loop snapshot selection mode today.",
    );
  }

  try {
    const config = loadLoopRelayConfig(options.dataDir);
    const auth = loadHookAuth(options.dataDir);
    const storage = createSqlitePromptStorage({
      dataDir: config.data_dir,
      hmacSecret: auth.web_session_secret,
    });

    try {
      const snapshot = selectLoopSnapshotTarget(
        storage.listLoopSnapshots({ limit: 100 }).items,
        target.value,
      );
      if (!snapshot) {
        return loopToolError(
          "not_found",
          loopMemoryNoSnapshotMcpMessage("propose_loop_memory_candidate"),
        );
      }

      const decision = decideLoopMemoryCandidate(snapshot);
      return {
        ...decision,
        next_action: decision.eligible
          ? "Ask the user to approve this candidate before writing it into AGENTS.md, CLAUDE.md, or any memory store."
          : "Record a passed loop outcome with safe evidence before proposing memory.",
        privacy: {
          ...loopToolPrivacy(),
          stores_prompt_bodies: false,
          stores_raw_paths: false,
          auto_writes_memory: false,
        },
      };
    } finally {
      storage.close();
    }
  } catch (error) {
    return loopToolError(
      "storage_unavailable",
      storageUnavailableMessage(error),
    );
  }
}

export function recordLoopMemoryTool(
  args: RecordLoopMemoryToolArguments,
  options: ScorePromptToolOptions = {},
): RecordLoopMemoryToolResult {
  const approvedBy =
    typeof args.approved_by === "string" ? args.approved_by.trim() : "";
  if (!approvedBy) {
    return loopToolError("invalid_input", "`approved_by` must not be empty.");
  }
  const target = loopSnapshotTargetForMcp(args);
  if (!target.ok) {
    return loopToolError("invalid_input", target.message);
  }
  if (
    args.latest === false &&
    !hasLoopSnapshotSelection(target.value) &&
    !target.value.snapshotId
  ) {
    return loopToolError(
      "invalid_input",
      "`latest` is the only supported loop snapshot selection mode today.",
    );
  }

  try {
    const config = loadLoopRelayConfig(options.dataDir);
    const auth = loadHookAuth(options.dataDir);
    const storage = createSqlitePromptStorage({
      dataDir: config.data_dir,
      hmacSecret: auth.web_session_secret,
    });

    try {
      const snapshot = selectLoopSnapshotTarget(
        storage.listLoopSnapshots({ limit: 100 }).items,
        target.value,
      );
      if (!snapshot) {
        return loopToolError(
          "not_found",
          loopMemoryNoSnapshotMcpMessage("record_loop_memory"),
        );
      }

      const decision = decideLoopMemoryCandidate(snapshot);
      if (!decision.eligible || !decision.candidate) {
        return loopToolError(
          "invalid_input",
          `Selected loop is not eligible for memory approval: ${decision.reason}.`,
        );
      }

      const memory = storage.recordLoopMemory({
        snapshot_id: snapshot.id,
        title: decision.candidate.title,
        statement: decision.candidate.statement,
        evidence_refs: decision.candidate.evidence_refs,
        approved_by: approvedBy,
      });

      return {
        recorded: true,
        memory: {
          id: memory.id,
          snapshot_id: memory.snapshot_id,
          title: memory.title,
          statement: memory.statement,
          evidence_refs: memory.evidence_refs,
          approved_by: memory.approved_by,
          created_at: memory.created_at,
        },
        next_action:
          "Use this local memory as context in future loop briefs; writing AGENTS.md or CLAUDE.md still requires a separate explicit patch.",
        next_actions: [
          "prepare_loop_brief",
          "propose_instruction_patch target_file=AGENTS.md",
        ],
        privacy: {
          ...loopToolPrivacy(),
          stores_prompt_bodies: false,
          stores_raw_paths: false,
          writes_instruction_files: false,
        },
      };
    } finally {
      storage.close();
    }
  } catch (error) {
    return loopToolError(
      "storage_unavailable",
      storageUnavailableMessage(error),
    );
  }
}

export function proposeInstructionPatchTool(
  args: ProposeInstructionPatchToolArguments,
  options: ScorePromptToolOptions = {},
): ProposeInstructionPatchToolResult {
  let targetFile: "AGENTS.md" | "CLAUDE.md";
  try {
    targetFile = parseInstructionPatchTarget(args.target_file ?? "AGENTS.md");
  } catch (error) {
    return loopToolError("invalid_input", errorMessage(error));
  }

  try {
    const config = loadLoopRelayConfig(options.dataDir);
    const auth = loadHookAuth(options.dataDir);
    const storage = createSqlitePromptStorage({
      dataDir: config.data_dir,
      hmacSecret: auth.web_session_secret,
    });

    try {
      const memory = storage.listLoopMemories({ limit: 1 }).items.at(0);
      if (!memory) {
        return loopToolError(
          "not_found",
          loopInstructionPatchNoMemoryMcpMessage("propose_instruction_patch"),
        );
      }
      return proposeInstructionPatchFromMemory({ memory, targetFile });
    } finally {
      storage.close();
    }
  } catch (error) {
    return loopToolError(
      "storage_unavailable",
      storageUnavailableMessage(error),
    );
  }
}

export function applyInstructionPatchTool(
  args: ApplyInstructionPatchToolArguments,
  options: ScorePromptToolOptions = {},
): ApplyInstructionPatchToolResult {
  if (args.confirm_apply !== true) {
    return loopToolError(
      "approval_required",
      "Instruction patch apply requires confirm_apply=true.",
    );
  }

  let targetFile: "AGENTS.md" | "CLAUDE.md";
  try {
    targetFile = parseInstructionPatchTarget(args.target_file ?? "AGENTS.md");
  } catch (error) {
    return loopToolError("invalid_input", errorMessage(error));
  }

  try {
    const config = loadLoopRelayConfig(options.dataDir);
    const auth = loadHookAuth(options.dataDir);
    const storage = createSqlitePromptStorage({
      dataDir: config.data_dir,
      hmacSecret: auth.web_session_secret,
    });

    try {
      const memory = storage.listLoopMemories({ limit: 1 }).items.at(0);
      if (!memory) {
        return loopToolError(
          "not_found",
          loopInstructionPatchNoMemoryMcpMessage("apply_instruction_patch"),
        );
      }
      return applyInstructionPatchFromMemory({
        memory,
        targetDir: args.target_dir ?? process.cwd(),
        targetFile,
        confirmApply: true,
      });
    } finally {
      storage.close();
    }
  } catch (error) {
    return loopToolError("apply_failed", errorMessage(error));
  }
}

function loopSnapshotTargetForMcp(args: {
  snapshot_id?: string;
  worktree?: string;
  session_id?: string;
  branch?: string;
}):
  | {
      ok: true;
      value: {
        snapshotId?: string;
        worktree?: string;
        sessionId?: string;
        branch?: string;
      };
    }
  | { ok: false; message: string } {
  const value = {
    snapshotId: args.snapshot_id,
    worktree: args.worktree,
    sessionId: args.session_id,
    branch: args.branch,
  };
  if (hasAmbiguousLoopSnapshotTarget(value)) {
    return {
      ok: false,
      message:
        "Use either `snapshot_id` or worktree/session/branch filters, not both.",
    };
  }
  return { ok: true, value };
}

function loopToolPrivacy() {
  return {
    local_only: true,
    external_calls: false,
    returns_prompt_bodies: false,
    returns_raw_paths: false,
  } as const;
}

type LoopToolErrorCode = Extract<
  | PrepareLoopBriefToolResult
  | RecordLoopOutcomeToolResult
  | ProposeLoopMemoryCandidateToolResult
  | RecordLoopMemoryToolResult
  | ProposeInstructionPatchToolResult
  | ApplyInstructionPatchToolResult,
  { is_error: true }
>["error_code"];

type LoopToolError = {
  is_error: true;
  error_code: LoopToolErrorCode;
  message: string;
};

function loopToolError<T extends LoopToolErrorCode>(
  errorCode: T,
  message: string,
): LoopToolError & { error_code: T } {
  return {
    is_error: true,
    error_code: errorCode,
    message,
  };
}

function errorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "Invalid instruction patch input.";
}
