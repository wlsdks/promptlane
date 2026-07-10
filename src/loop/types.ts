export type LoopSnapshotSource = "hook" | "cli" | "mcp" | "service";

export type LoopSnapshotTool = "codex" | "claude-code" | "gemini" | "unknown";

export type LoopOutcomeStatus =
  | "unknown"
  | "in_progress"
  | "passed"
  | "failed"
  | "blocked"
  | "abandoned";

export type LoopSnapshot = {
  id: string;
  created_at: string;
  tool: LoopSnapshotTool;
  source: LoopSnapshotSource;
  session_id?: string;
  thread_id?: string;
  cwd_label: string;
  project_id: string;
  git_root_hash?: string;
  branch?: string;
  worktree_label?: string;
  prompt_ids: string[];
  event_counts: {
    prompts: number;
    tool_calls?: number;
    files_changed?: number;
    tests_run?: number;
    errors?: number;
  };
  quality: {
    average_prompt_score?: number;
    top_gaps: string[];
    unresolved_questions: string[];
  };
  outcome: {
    status: LoopOutcomeStatus;
    summary: string;
    evidence_refs: string[];
    used_improvement_prompt_ids?: string[];
  };
  next_brief: {
    generated: boolean;
    prompt_id?: string;
    summary: string;
  };
  privacy: {
    stores_prompt_bodies: false;
    stores_raw_paths: false;
    local_only: true;
  };
};

export type CreateLoopSnapshotInput = {
  now: Date;
  source: LoopSnapshotSource;
  tool?: LoopSnapshotTool;
  sessionId?: string;
  prompts: Array<{
    id: string;
    tool: string;
    session_id: string;
    quality_score: number;
    quality_gaps: string[];
  }>;
  project: {
    cwdLabel: string;
    projectId: string;
    gitRootHash?: string;
    branch?: string;
    worktreeLabel?: string;
  };
};
