import { loadHookAuth, loadPromptCoachConfig } from "../config/config.js";
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
  createLoopdeckStatus,
  loopdeckStatusPrivacy,
} from "../loop/status.js";
import { createSqlitePromptStorage } from "../storage/sqlite.js";
import type { ScorePromptToolOptions } from "./score-tool-types.js";
import type {
  ApplyInstructionPatchToolArguments,
  ApplyInstructionPatchToolResult,
  GetLoopdeckStatusToolArguments,
  GetLoopdeckStatusToolResult,
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

const LOOP_TOOL_NAMES = [
  "get_loopdeck_status",
  "prepare_loop_brief",
  "record_loop_outcome",
  "propose_loop_memory_candidate",
  "record_loop_memory",
  "propose_instruction_patch",
  "apply_instruction_patch",
];

export function getLoopdeckStatusTool(
  args: GetLoopdeckStatusToolArguments,
  options: ScorePromptToolOptions = {},
): GetLoopdeckStatusToolResult {
  const privacy = loopdeckStatusPrivacy();

  try {
    const config = loadPromptCoachConfig(options.dataDir);
    const auth = loadHookAuth(options.dataDir);
    const storage = createSqlitePromptStorage({
      dataDir: config.data_dir,
      hmacSecret: auth.web_session_secret,
    });

    try {
      const snapshots = storage.listLoopSnapshots({ limit: 100 }).items;
      const latest = snapshots.at(0);
      const status = createLoopdeckStatus({
        snapshots,
        compactBoundaries: storage.listCompactBoundaries({ limit: 20 }).items,
        includeLatest: args.include_latest !== false,
        projectMemoryCount: latest
          ? storage.listLoopMemories({ projectId: latest.project_id }).items.length
          : 0,
        memoryCandidate: latest
          ? decideLoopMemoryCandidate(latest)
          : undefined,
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
      next_action: "prompt-coach setup",
      next_actions: [
        "Run prompt-coach init or prompt-coach setup before using Loopdeck MCP tools.",
        "Then run prompt-coach loop collect from the project you want to continue.",
      ],
      privacy,
    };
  }
}

export function prepareLoopBriefTool(
  args: PrepareLoopBriefToolArguments,
  options: ScorePromptToolOptions = {},
): PrepareLoopBriefToolResult {
  if (args.latest === false) {
    return loopToolError(
      "invalid_input",
      "`latest` is the only supported loop snapshot selection mode today.",
    );
  }

  try {
    const config = loadPromptCoachConfig(options.dataDir);
    const auth = loadHookAuth(options.dataDir);
    const storage = createSqlitePromptStorage({
      dataDir: config.data_dir,
      hmacSecret: auth.web_session_secret,
    });

    try {
      const snapshot = storage.getLatestLoopSnapshot();
      if (!snapshot) {
        return loopToolError(
          "not_found",
          "No loop snapshot found. Run `prompt-coach loop collect` first.",
        );
      }

      const compactBoundary = latestCompactBoundaryAfterSnapshot(
        snapshot,
        storage.listCompactBoundaries({ limit: 20 }).items,
      );
      const brief = createLoopBrief({
        snapshot,
        compactBoundary,
        approvedMemories: storage.listLoopMemories({
          projectId: snapshot.project_id,
          limit: 3,
        }).items,
      });
      return {
        source: "latest",
        snapshot_id: snapshot.id,
        title: brief.title,
        prompt: brief.prompt,
        ...(brief.compact_boundary
          ? { compact_boundary: brief.compact_boundary }
          : {}),
        next_action:
          "Ask the user to review this continuation prompt before submitting it to Codex or Claude Code.",
        privacy: {
          ...loopToolPrivacy(),
          auto_submits: false,
        },
      };
    } finally {
      storage.close();
    }
  } catch (error) {
    return loopToolError("storage_unavailable", storageUnavailableMessage(error));
  }
}

export function recordLoopOutcomeTool(
  args: RecordLoopOutcomeToolArguments,
  options: ScorePromptToolOptions = {},
): RecordLoopOutcomeToolResult {
  const summary = typeof args.summary === "string" ? args.summary.trim() : "";

  if (!summary) {
    return loopToolError("invalid_input", "`summary` must not be empty.");
  }

  if (args.snapshot_id && args.latest === true) {
    return loopToolError(
      "invalid_input",
      "Use either `snapshot_id` or `latest`, not both.",
    );
  }

  try {
    const config = loadPromptCoachConfig(options.dataDir);
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
          "No loop snapshot found. Run `prompt-coach loop collect` first.",
        );
      }

      const snapshot = storage.recordLoopOutcome(snapshotId, {
        status: args.status,
        summary,
        evidence_refs: args.evidence_refs ?? [],
      });

      if (!snapshot) {
        return loopToolError("not_found", `Loop snapshot not found: ${snapshotId}.`);
      }

      return {
        recorded: true,
        snapshot_id: snapshot.id,
        outcome: snapshot.outcome,
        next_action:
          "Use prepare_loop_brief to continue the loop or run prompt-coach loop collect after the next agent turn.",
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
    return loopToolError("storage_unavailable", storageUnavailableMessage(error));
  }
}

export function proposeLoopMemoryCandidateTool(
  args: ProposeLoopMemoryCandidateToolArguments,
  options: ScorePromptToolOptions = {},
): ProposeLoopMemoryCandidateToolResult {
  if (args.latest === false) {
    return loopToolError(
      "invalid_input",
      "`latest` is the only supported loop snapshot selection mode today.",
    );
  }

  try {
    const config = loadPromptCoachConfig(options.dataDir);
    const auth = loadHookAuth(options.dataDir);
    const storage = createSqlitePromptStorage({
      dataDir: config.data_dir,
      hmacSecret: auth.web_session_secret,
    });

    try {
      const snapshot = storage.getLatestLoopSnapshot();
      if (!snapshot) {
        return loopToolError(
          "not_found",
          "No loop snapshot found. Run `prompt-coach loop collect` first.",
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
    return loopToolError("storage_unavailable", storageUnavailableMessage(error));
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
  if (args.latest === false) {
    return loopToolError(
      "invalid_input",
      "`latest` is the only supported loop snapshot selection mode today.",
    );
  }

  try {
    const config = loadPromptCoachConfig(options.dataDir);
    const auth = loadHookAuth(options.dataDir);
    const storage = createSqlitePromptStorage({
      dataDir: config.data_dir,
      hmacSecret: auth.web_session_secret,
    });

    try {
      const snapshot = storage.getLatestLoopSnapshot();
      if (!snapshot) {
        return loopToolError(
          "not_found",
          "No loop snapshot found. Run `prompt-coach loop collect` first.",
        );
      }

      const decision = decideLoopMemoryCandidate(snapshot);
      if (!decision.eligible || !decision.candidate) {
        return loopToolError(
          "invalid_input",
          `Latest loop is not eligible for memory approval: ${decision.reason}.`,
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
    return loopToolError("storage_unavailable", storageUnavailableMessage(error));
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
    const config = loadPromptCoachConfig(options.dataDir);
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
          "No loop memory found. Run `prompt-coach loop memory-approve` first.",
        );
      }
      return proposeInstructionPatchFromMemory({ memory, targetFile });
    } finally {
      storage.close();
    }
  } catch (error) {
    return loopToolError("storage_unavailable", storageUnavailableMessage(error));
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
    const config = loadPromptCoachConfig(options.dataDir);
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
          "No loop memory found. Run `prompt-coach loop memory-approve` first.",
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

function storageUnavailableMessage(error: unknown): string {
  const name = error instanceof Error ? error.name : "Error";
  return `${name}: local prompt-coach storage is not available. Run prompt-coach init or pass the correct dataDir.`;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Invalid instruction patch input.";
}
