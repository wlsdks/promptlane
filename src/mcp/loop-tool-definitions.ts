import type { PromptCoachMcpToolDefinition } from "./score-tool-definitions.js";

const LOCAL_LOOP_READ_ONLY_TOOL_ANNOTATIONS = {
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: false,
  readOnlyHint: true,
} as const;

const LOCAL_LOOP_WRITE_TOOL_ANNOTATIONS = {
  destructiveHint: false,
  idempotentHint: false,
  openWorldHint: false,
  readOnlyHint: false,
} as const;

const LOOP_TOOL_PRIVACY_SCHEMA = {
  type: "object",
  required: [
    "local_only",
    "external_calls",
    "returns_prompt_bodies",
    "returns_raw_paths",
  ],
  properties: {
    local_only: { const: true },
    external_calls: { const: false },
    returns_prompt_bodies: { const: false },
    returns_raw_paths: { const: false },
  },
} as const;

const LOOP_OUTCOME_STATUS_SCHEMA = {
  type: "string",
  enum: ["unknown", "in_progress", "passed", "failed", "blocked", "abandoned"],
} as const;

const TOOL_ERROR_OUTPUT_SCHEMA = {
  type: "object",
  required: ["is_error", "error_code", "message"],
  properties: {
    is_error: { const: true },
    error_code: { type: "string" },
    message: { type: "string" },
  },
} as const;

export const GET_LOOPDECK_STATUS_TOOL_DEFINITION: PromptCoachMcpToolDefinition =
  {
    name: "get_loopdeck_status",
    description:
      "Check whether local Loopdeck loop snapshots are available for the current prompt-coach archive. Use this when Codex or Claude Code needs to know if a previous loop can be continued or whether the user should run `prompt-coach loop collect` first. Returns safe loop metadata, available loop tools, next actions, and privacy flags. It never returns prompt bodies, raw absolute paths, secrets, transcripts, or external LLM results.",
    annotations: {
      ...LOCAL_LOOP_READ_ONLY_TOOL_ANNOTATIONS,
      title: "Loopdeck loop status",
    },
    inputSchema: {
      type: "object",
      properties: {
        include_latest: {
          type: "boolean",
          description:
            "Whether to include safe metadata for the latest loop snapshot. Defaults to true.",
        },
      },
      additionalProperties: false,
    },
    outputSchema: {
      type: "object",
      required: [
        "status",
        "snapshot_count",
        "available_tools",
        "next_actions",
        "privacy",
      ],
      properties: {
        status: { type: "string", enum: ["ready", "empty", "setup_needed"] },
        snapshot_count: { type: "integer", minimum: 0 },
        latest_snapshot: {
          type: "object",
          properties: {
            id: { type: "string" },
            created_at: { type: "string" },
            tool: { type: "string" },
            source: { type: "string" },
            project: { type: "string" },
            branch: { type: "string" },
            worktree: { type: "string" },
            prompt_count: { type: "integer", minimum: 0 },
            average_prompt_score: { type: "integer", minimum: 0, maximum: 100 },
            top_gaps: { type: "array", items: { type: "string" } },
          },
        },
        available_tools: { type: "array", items: { type: "string" } },
        next_actions: { type: "array", items: { type: "string" } },
        privacy: LOOP_TOOL_PRIVACY_SCHEMA,
      },
    },
  } as const;

export const PREPARE_LOOP_BRIEF_TOOL_DEFINITION: PromptCoachMcpToolDefinition =
  {
    name: "prepare_loop_brief",
    description:
      "Prepare a copy-ready continuation prompt from the latest local Loopdeck snapshot. Use this when Codex or Claude Code is resuming an agent loop, handing off work across sessions/worktrees, or needs the next prompt after `prompt-coach loop collect`. This is read-only and never auto-submits the prompt. It returns prompt ids and loop metadata only, never prompt bodies, raw paths, secrets, transcripts, or external LLM results.",
    annotations: {
      ...LOCAL_LOOP_READ_ONLY_TOOL_ANNOTATIONS,
      title: "Prepare Loopdeck continuation brief",
    },
    inputSchema: {
      type: "object",
      properties: {
        latest: {
          type: "boolean",
          description:
            "Use the latest local loop snapshot. Defaults to true; no other selection mode exists yet.",
        },
      },
      additionalProperties: false,
    },
    outputSchema: {
      type: "object",
      properties: {
        source: { const: "latest" },
        snapshot_id: { type: "string" },
        title: { type: "string" },
        prompt: { type: "string" },
        next_action: { type: "string" },
        privacy: {
          ...LOOP_TOOL_PRIVACY_SCHEMA,
          required: [...LOOP_TOOL_PRIVACY_SCHEMA.required, "auto_submits"],
          properties: {
            ...LOOP_TOOL_PRIVACY_SCHEMA.properties,
            auto_submits: { const: false },
          },
        },
        is_error: TOOL_ERROR_OUTPUT_SCHEMA.properties.is_error,
        error_code: TOOL_ERROR_OUTPUT_SCHEMA.properties.error_code,
        message: TOOL_ERROR_OUTPUT_SCHEMA.properties.message,
      },
      oneOf: [
        {
          required: [
            "source",
            "snapshot_id",
            "title",
            "prompt",
            "next_action",
            "privacy",
          ],
        },
        TOOL_ERROR_OUTPUT_SCHEMA,
      ],
    },
  } as const;

export const RECORD_LOOP_OUTCOME_TOOL_DEFINITION: PromptCoachMcpToolDefinition =
  {
    name: "record_loop_outcome",
    description:
      "Record user-approved outcome metadata for a local Loopdeck snapshot after Codex or Claude Code has verified a loop result. Use this to mark a specific snapshot, or the latest snapshot when snapshot_id is omitted, as passed, failed, blocked, abandoned, in progress, or unknown. This writes only status, summary, and evidence references; it never stores prompt bodies, raw absolute paths, secrets, transcripts, or external LLM results.",
    annotations: {
      ...LOCAL_LOOP_WRITE_TOOL_ANNOTATIONS,
      title: "Record Loopdeck outcome",
    },
    inputSchema: {
      type: "object",
      required: ["status", "summary"],
      properties: {
        snapshot_id: {
          type: "string",
          description:
            "Optional local Loopdeck snapshot id. Omit this to update the latest snapshot.",
        },
        latest: {
          type: "boolean",
          description:
            "Set true to update the latest local loop snapshot. Defaults to true when snapshot_id is omitted.",
        },
        status: LOOP_OUTCOME_STATUS_SCHEMA,
        summary: {
          type: "string",
          description:
            "Concise user-approved result summary. Must not include prompt bodies or raw absolute paths.",
        },
        evidence_refs: {
          type: "array",
          items: { type: "string" },
          description:
            "Optional safe evidence labels, for example test command names, commit ids, or document ids. Do not include raw paths or secrets.",
        },
      },
      additionalProperties: false,
    },
    outputSchema: {
      type: "object",
      properties: {
        recorded: { const: true },
        snapshot_id: { type: "string" },
        outcome: {
          type: "object",
          required: ["status", "summary", "evidence_refs"],
          properties: {
            status: LOOP_OUTCOME_STATUS_SCHEMA,
            summary: { type: "string" },
            evidence_refs: { type: "array", items: { type: "string" } },
          },
        },
        next_action: { type: "string" },
        privacy: {
          ...LOOP_TOOL_PRIVACY_SCHEMA,
          required: [
            ...LOOP_TOOL_PRIVACY_SCHEMA.required,
            "stores_prompt_bodies",
            "stores_raw_paths",
          ],
          properties: {
            ...LOOP_TOOL_PRIVACY_SCHEMA.properties,
            stores_prompt_bodies: { const: false },
            stores_raw_paths: { const: false },
          },
        },
        is_error: TOOL_ERROR_OUTPUT_SCHEMA.properties.is_error,
        error_code: TOOL_ERROR_OUTPUT_SCHEMA.properties.error_code,
        message: TOOL_ERROR_OUTPUT_SCHEMA.properties.message,
      },
      oneOf: [
        {
          required: [
            "recorded",
            "snapshot_id",
            "outcome",
            "next_action",
            "privacy",
          ],
        },
        TOOL_ERROR_OUTPUT_SCHEMA,
      ],
    },
  } as const;

export const PROPOSE_LOOP_MEMORY_CANDIDATE_TOOL_DEFINITION: PromptCoachMcpToolDefinition =
  {
    name: "propose_loop_memory_candidate",
    description:
      "Decide whether the latest local Loopdeck outcome is safe and evidence-backed enough to propose as a memory candidate. This is read-only and approval-gated: it never writes AGENTS.md, CLAUDE.md, memory files, prompt bodies, raw paths, secrets, transcripts, compact summaries, or external LLM results.",
    annotations: {
      ...LOCAL_LOOP_READ_ONLY_TOOL_ANNOTATIONS,
      title: "Propose Loopdeck memory candidate",
    },
    inputSchema: {
      type: "object",
      properties: {
        latest: {
          type: "boolean",
          description:
            "Use the latest local loop snapshot. Defaults to true; no other selection mode exists yet.",
        },
      },
      additionalProperties: false,
    },
    outputSchema: {
      type: "object",
      properties: {
        eligible: { type: "boolean" },
        reason: { type: "string" },
        snapshot_id: { type: "string" },
        candidate: {
          type: "object",
          properties: {
            title: { type: "string" },
            scope: { const: "project" },
            statement: { type: "string" },
            evidence_refs: { type: "array", items: { type: "string" } },
          },
        },
        next_action: { type: "string" },
        privacy: {
          ...LOOP_TOOL_PRIVACY_SCHEMA,
          required: [
            ...LOOP_TOOL_PRIVACY_SCHEMA.required,
            "stores_prompt_bodies",
            "stores_raw_paths",
            "auto_writes_memory",
          ],
          properties: {
            ...LOOP_TOOL_PRIVACY_SCHEMA.properties,
            stores_prompt_bodies: { const: false },
            stores_raw_paths: { const: false },
            auto_writes_memory: { const: false },
          },
        },
        is_error: TOOL_ERROR_OUTPUT_SCHEMA.properties.is_error,
        error_code: TOOL_ERROR_OUTPUT_SCHEMA.properties.error_code,
        message: TOOL_ERROR_OUTPUT_SCHEMA.properties.message,
      },
      oneOf: [
        {
          required: [
            "eligible",
            "reason",
            "snapshot_id",
            "next_action",
            "privacy",
          ],
        },
        TOOL_ERROR_OUTPUT_SCHEMA,
      ],
    },
  } as const;

export const RECORD_LOOP_MEMORY_TOOL_DEFINITION: PromptCoachMcpToolDefinition =
  {
    name: "record_loop_memory",
    description:
      "Record a user-approved Loopdeck memory from the latest eligible loop outcome. This writes only the approved candidate statement and safe evidence refs into local prompt-coach storage; it never writes AGENTS.md, CLAUDE.md, project docs, prompt bodies, raw paths, transcripts, compact summaries, or external LLM results.",
    annotations: {
      ...LOCAL_LOOP_WRITE_TOOL_ANNOTATIONS,
      title: "Record approved Loopdeck memory",
    },
    inputSchema: {
      type: "object",
      required: ["approved_by"],
      properties: {
        latest: {
          type: "boolean",
          description:
            "Use the latest local loop snapshot. Defaults to true; no other selection mode exists yet.",
        },
        approved_by: {
          type: "string",
          description:
            "Actor label for the approval, for example user or maintainer. Must not be empty.",
        },
      },
      additionalProperties: false,
    },
    outputSchema: {
      type: "object",
      properties: {
        recorded: { const: true },
        memory: {
          type: "object",
          properties: {
            id: { type: "string" },
            snapshot_id: { type: "string" },
            title: { type: "string" },
            statement: { type: "string" },
            evidence_refs: { type: "array", items: { type: "string" } },
            approved_by: { type: "string" },
            created_at: { type: "string" },
          },
        },
        next_action: { type: "string" },
        privacy: {
          ...LOOP_TOOL_PRIVACY_SCHEMA,
          required: [
            ...LOOP_TOOL_PRIVACY_SCHEMA.required,
            "stores_prompt_bodies",
            "stores_raw_paths",
            "writes_instruction_files",
          ],
          properties: {
            ...LOOP_TOOL_PRIVACY_SCHEMA.properties,
            stores_prompt_bodies: { const: false },
            stores_raw_paths: { const: false },
            writes_instruction_files: { const: false },
          },
        },
        is_error: TOOL_ERROR_OUTPUT_SCHEMA.properties.is_error,
        error_code: TOOL_ERROR_OUTPUT_SCHEMA.properties.error_code,
        message: TOOL_ERROR_OUTPUT_SCHEMA.properties.message,
      },
      oneOf: [
        {
          required: ["recorded", "memory", "next_action", "privacy"],
        },
        TOOL_ERROR_OUTPUT_SCHEMA,
      ],
    },
  } as const;
