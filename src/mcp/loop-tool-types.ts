import type { LoopOutcomeStatus } from "../loop/types.js";
import type { LoopBrief, LoopBriefCompactBoundary } from "../loop/brief.js";
import type { ContinuationReceiptSummary } from "../loop/continuation.js";
import type { LoopRelayStatus } from "../loop/status.js";
import type {
  InstructionPatchApplyResult,
  InstructionPatchProposal,
} from "../loop/instruction-patch.js";
import type { LoopMemoryCandidateDecision } from "../loop/memory-candidate.js";

export type GetLoopRelayLoopStatusToolArguments = {
  cwd: string;
  include_latest?: boolean;
};

export type PrepareLoopBriefToolArguments = {
  cwd: string;
  latest?: boolean;
  worktree?: string;
  session_id?: string;
  branch?: string;
};

export type RecordLoopOutcomeToolArguments = {
  snapshot_id?: string;
  latest?: boolean;
  status: LoopOutcomeStatus;
  summary: string;
  evidence_refs?: string[];
  used_improvement_prompt_ids?: string[];
};

export type ProposeLoopMemoryCandidateToolArguments = {
  latest?: boolean;
  snapshot_id?: string;
  worktree?: string;
  session_id?: string;
  branch?: string;
};

export type RecordLoopMemoryToolArguments = {
  latest?: boolean;
  snapshot_id?: string;
  worktree?: string;
  session_id?: string;
  branch?: string;
  approved_by: string;
};

export type ProposeInstructionPatchToolArguments = {
  target_file?: "AGENTS.md" | "CLAUDE.md";
};

export type ApplyInstructionPatchToolArguments = {
  target_file?: "AGENTS.md" | "CLAUDE.md";
  target_dir?: string;
  confirm_apply?: boolean;
};

export type LoopRelayToolPrivacy = {
  local_only: true;
  external_calls: false;
  returns_prompt_bodies: false;
  returns_raw_paths: false;
};

export type GetLoopRelayLoopStatusToolResult =
  | (LoopRelayStatus & {
      available_tools: string[];
    })
  | {
      status: "setup_needed";
      snapshot_count: 0;
      available_tools: string[];
      next_action: string;
      next_actions: string[];
      privacy: LoopRelayStatus["privacy"];
    };

export type PrepareLoopBriefToolResult =
  | {
      source: "latest";
      snapshot_id: string;
      receipt: ContinuationReceiptSummary;
      recovery: LoopBrief["recovery"];
      title: string;
      prompt: string;
      compact_boundary?: LoopBriefCompactBoundary;
      next_action: string;
      privacy: LoopRelayToolPrivacy & {
        auto_submits: false;
      };
    }
  | {
      source: "selected";
      selection: {
        worktree?: string;
        session_id?: string;
        branch?: string;
      };
      snapshot_id: string;
      receipt: ContinuationReceiptSummary;
      recovery: LoopBrief["recovery"];
      title: string;
      prompt: string;
      compact_boundary?: LoopBriefCompactBoundary;
      next_action: string;
      privacy: LoopRelayToolPrivacy & {
        auto_submits: false;
      };
    }
  | {
      is_error: true;
      error_code: "invalid_input" | "not_found" | "storage_unavailable";
      message: string;
    };

export type RecordLoopOutcomeToolResult =
  | {
      recorded: true;
      snapshot_id: string;
      outcome: {
        status: LoopOutcomeStatus;
        summary: string;
        evidence_refs: string[];
        used_improvement_prompt_ids?: string[];
      };
      next_action: string;
      privacy: LoopRelayToolPrivacy & {
        stores_prompt_bodies: false;
        stores_raw_paths: false;
      };
    }
  | {
      is_error: true;
      error_code: "invalid_input" | "not_found" | "storage_unavailable";
      message: string;
    };

export type ProposeLoopMemoryCandidateToolResult =
  | (LoopMemoryCandidateDecision & {
      next_action: string;
      privacy: LoopRelayToolPrivacy & {
        stores_prompt_bodies: false;
        stores_raw_paths: false;
        auto_writes_memory: false;
      };
    })
  | {
      is_error: true;
      error_code: "invalid_input" | "not_found" | "storage_unavailable";
      message: string;
    };

export type RecordLoopMemoryToolResult =
  | {
      recorded: true;
      memory: {
        id: string;
        snapshot_id: string;
        title: string;
        statement: string;
        evidence_refs: string[];
        approved_by: string;
        created_at: string;
      };
      next_action: string;
      next_actions: string[];
      privacy: LoopRelayToolPrivacy & {
        stores_prompt_bodies: false;
        stores_raw_paths: false;
        writes_instruction_files: false;
      };
    }
  | {
      is_error: true;
      error_code: "invalid_input" | "not_found" | "storage_unavailable";
      message: string;
    };

export type ProposeInstructionPatchToolResult =
  | InstructionPatchProposal
  | {
      is_error: true;
      error_code: "invalid_input" | "not_found" | "storage_unavailable";
      message: string;
    };

export type ApplyInstructionPatchToolResult =
  | InstructionPatchApplyResult
  | {
      is_error: true;
      error_code:
        | "approval_required"
        | "invalid_input"
        | "not_found"
        | "storage_unavailable"
        | "apply_failed";
      message: string;
    };
