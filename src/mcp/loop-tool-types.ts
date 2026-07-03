import type { LoopOutcomeStatus } from "../loop/types.js";
import type { LoopBriefCompactBoundary } from "../loop/brief.js";
import type { LoopMemoryCandidateDecision } from "../loop/memory-candidate.js";

export type GetLoopdeckStatusToolArguments = {
  include_latest?: boolean;
};

export type PrepareLoopBriefToolArguments = {
  latest?: boolean;
};

export type RecordLoopOutcomeToolArguments = {
  snapshot_id?: string;
  latest?: boolean;
  status: LoopOutcomeStatus;
  summary: string;
  evidence_refs?: string[];
};

export type ProposeLoopMemoryCandidateToolArguments = {
  latest?: boolean;
};

export type RecordLoopMemoryToolArguments = {
  latest?: boolean;
  approved_by: string;
};

export type LoopdeckToolPrivacy = {
  local_only: true;
  external_calls: false;
  returns_prompt_bodies: false;
  returns_raw_paths: false;
};

export type GetLoopdeckStatusToolResult = {
  status: "ready" | "empty" | "setup_needed";
  snapshot_count: number;
  latest_snapshot?: {
    id: string;
    created_at: string;
    tool: string;
    source: string;
    project: string;
    branch?: string;
    worktree?: string;
    prompt_count: number;
    average_prompt_score?: number;
    top_gaps: string[];
  };
  latest_compact_boundary?: LoopBriefCompactBoundary;
  available_tools: string[];
  next_actions: string[];
  privacy: LoopdeckToolPrivacy;
};

export type PrepareLoopBriefToolResult =
  | {
      source: "latest";
      snapshot_id: string;
      title: string;
      prompt: string;
      compact_boundary?: LoopBriefCompactBoundary;
      next_action: string;
      privacy: LoopdeckToolPrivacy & {
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
      };
      next_action: string;
      privacy: LoopdeckToolPrivacy & {
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
      privacy: LoopdeckToolPrivacy & {
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
      privacy: LoopdeckToolPrivacy & {
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
