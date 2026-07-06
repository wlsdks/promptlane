import { createHash } from "node:crypto";

import type {
  CreateLoopSnapshotInput,
  LoopSnapshot,
  LoopSnapshotTool,
} from "./types.js";

export function createLoopSnapshotFromPrompts(
  input: CreateLoopSnapshotInput,
): LoopSnapshot {
  const promptIds = input.prompts.map((prompt) => prompt.id);
  const averagePromptScore =
    input.prompts.length > 0
      ? Math.round(
          input.prompts.reduce(
            (sum, prompt) => sum + prompt.quality_score,
            0,
          ) / input.prompts.length,
        )
      : undefined;

  return {
    id: `loop_${compactHash(
      `${input.now.toISOString()}:${input.project.projectId}:${promptIds.join(",")}`,
    )}`,
    created_at: input.now.toISOString(),
    tool: inferTool(input.prompts.map((prompt) => prompt.tool)),
    source: input.source,
    session_id: commonValue(input.prompts.map((prompt) => prompt.session_id)),
    cwd_label: input.project.cwdLabel,
    project_id: input.project.projectId,
    git_root_hash: input.project.gitRootHash,
    branch: input.project.branch,
    worktree_label: input.project.worktreeLabel,
    prompt_ids: promptIds,
    event_counts: {
      prompts: input.prompts.length,
    },
    quality: {
      average_prompt_score: averagePromptScore,
      top_gaps: topQualityGaps(input.prompts),
      unresolved_questions: [],
    },
    outcome: {
      status: "unknown",
      summary: `Loop snapshot collected from ${input.prompts.length} prompts.`,
      evidence_refs: promptIds.map((id) => `prompt:${id}`),
    },
    next_brief: {
      generated: false,
      summary: "Run promptlane loop brief to generate the next request.",
    },
    privacy: {
      stores_prompt_bodies: false,
      stores_raw_paths: false,
      local_only: true,
    },
  };
}

function inferTool(tools: string[]): LoopSnapshotTool {
  const unique = [...new Set(tools)];
  if (unique.length !== 1) return "unknown";
  if (unique[0] === "codex" || unique[0] === "claude-code") return unique[0];
  if (unique[0] === "gemini") return "gemini";
  return "unknown";
}

function topQualityGaps(
  prompts: Array<{ quality_gaps: string[] }>,
): string[] {
  const counts = new Map<string, number>();
  for (const prompt of prompts) {
    for (const gap of prompt.quality_gaps) {
      counts.set(gap, (counts.get(gap) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 5)
    .map(([gap]) => gap);
}

function commonValue(values: string[]): string | undefined {
  const unique = [...new Set(values.filter(Boolean))];
  return unique.length === 1 ? unique[0] : undefined;
}

function compactHash(input: string): string {
  return createHash("sha256").update(input).digest("hex").slice(0, 16);
}
