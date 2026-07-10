import { randomUUID } from "node:crypto";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import { initializePromptLane } from "../config/config.js";
import type { LoopSnapshot } from "../loop/types.js";
import { createSqlitePromptStorage } from "../storage/sqlite.js";
import {
  applyInstructionPatchTool,
  getPromptLaneLoopStatusTool,
  prepareLoopBriefTool,
  proposeInstructionPatchTool,
  proposeLoopMemoryCandidateTool,
  recordLoopMemoryTool,
  recordLoopOutcomeTool,
} from "./loop-tool.js";

const tempDirs: string[] = [];

afterEach(() => {
  while (tempDirs.length > 0) {
    const dir = tempDirs.pop();
    if (dir) rmSync(dir, { recursive: true, force: true });
  }
});

describe("PromptLane MCP tools", () => {
  it("returns latest loop status without prompt bodies or raw paths", () => {
    const dataDir = seedLoopSnapshot({
      outcome: {
        status: "passed",
        summary:
          "Shared status surfaces should use one model instead of duplicating readiness logic.",
        evidence_refs: ["commit:11d8426", "test:pnpm test"],
      },
    });
    recordLoopMemoryTool({ latest: true, approved_by: "user" }, { dataDir });
    seedLoopMergeDecision(dataDir);
    seedOtherProjectMemory(dataDir);

    const result = getPromptLaneLoopStatusTool({}, { dataDir });
    const serialized = JSON.stringify(result);

    expect(result).toMatchObject({
      status: "ready",
      project_memory: {
        approved_count: 1,
        included_in_brief: true,
      },
      activity: {
        active_worktrees: 2,
        active_sessions: 2,
        needs_review: true,
        next_action:
          "compare loop snapshots by worktree before merging agent output",
        recent_decisions: [
          {
            snapshot_id: "loop_mcp",
            worktree: "worktree-mcp",
            decision: "continue",
            reason: "Needs one more verification pass before merge.",
            decided_by: "user",
            created_at: "2026-07-04T01:30:00.000Z",
          },
        ],
        worktrees: [
          {
            worktree: "worktree-mcp",
            branch: "codex/agent-loop-memory-design",
            sessions: 1,
            snapshots: 1,
            latest_snapshot_id: "loop_mcp",
            latest_outcome_status: "passed",
            evidence_count: 2,
          },
          {
            worktree: "other-worktree",
            sessions: 1,
            snapshots: 1,
            latest_snapshot_id: "loop_other_project",
            latest_outcome_status: "passed",
            evidence_count: 1,
          },
        ],
        command_center: {
          review_packet: {
            title: "Review-before-merge packet",
            status: "ready",
            summary: "2 ready, 0 needs review, 0 missing evidence",
            next_action: "compare ready evidence before merge",
            decision_advisory: {
              summary: "recent continue decision recorded for worktree-mcp",
              next_action: "honor recent continue decision before merge",
            },
            ready_count: 2,
            needs_review_count: 0,
            missing_evidence_count: 0,
            actions: ["compare evidence before merge"],
            checklist: [
              {
                label: "Compare ready evidence before merge",
                status: "required",
                action: "compare evidence before merge",
              },
            ],
          },
          review_items: [
            {
              worktree: "worktree-mcp",
              evidence_count: 2,
              merge_readiness: {
                status: "ready",
                evidence: "evidence present",
                next_action: "compare evidence before merge",
              },
            },
            {
              worktree: "other-worktree",
              evidence_count: 1,
              merge_readiness: {
                status: "ready",
                evidence: "evidence present",
                next_action: "compare evidence before merge",
              },
            },
          ],
        },
      },
      memory_candidate: {
        eligible: true,
        reason: "passed_with_evidence",
        next_action: "promptlane loop memory-approve",
      },
      latest_snapshot: {
        id: "loop_mcp",
        tool: "codex",
        project: "private-project",
        prompt_count: 2,
        prompt_ids: ["prmt_one", "prmt_two"],
        average_prompt_score: 58,
        outcome_status: "passed",
      },
      next_action: "promptlane loop brief",
      next_actions: expect.arrayContaining([
        expect.stringContaining("prepare_loop_brief"),
      ]),
      privacy: {
        local_only: true,
        external_calls: false,
        returns_prompt_bodies: false,
        returns_raw_paths: false,
        returns_compact_content: false,
      },
    });
    expect(serialized).not.toContain("Make this better");
    expect(serialized).not.toContain("/Users/example");
    expect(serialized).not.toContain(
      "Shared status surfaces should use one model instead of duplicating readiness logic.",
    );
    expect(serialized).not.toContain("commit:11d8426");
    expect(serialized).not.toContain("sk-proj-secret");
    expect(serialized).not.toContain(
      "This unrelated project memory should not appear",
    );
  });

  it("returns concrete setup guidance when loop storage is unavailable", () => {
    const dataDir = join(tmpdir(), `promptlane-missing-${randomUUID()}`);
    const result = getPromptLaneLoopStatusTool({}, { dataDir });
    const serialized = JSON.stringify(result);

    expect(result).toMatchObject({
      status: "setup_needed",
      snapshot_count: 0,
      next_action: "promptlane setup --profile coach --register-mcp",
    });
    expect(result.next_actions).toEqual(
      expect.arrayContaining([
        "Run promptlane setup --profile coach --register-mcp before using PromptLane loop MCP tools.",
        "Send one Codex or Claude Code prompt, then call coach_prompt or rerun get_promptlane_status.",
        "Then run promptlane loop collect from the project you want to continue.",
      ]),
    );
    expect(
      result.next_actions.indexOf(
        "Send one Codex or Claude Code prompt, then call coach_prompt or rerun get_promptlane_status.",
      ),
    ).toBeLessThan(
      result.next_actions.indexOf(
        "Then run promptlane loop collect from the project you want to continue.",
      ),
    );
    expect(result.next_actions).toContain(
      "For custom storage, initialize it with promptlane init --data-dir <path> and pass the same --data-dir to the MCP server.",
    );
    expect(serialized).not.toContain(dataDir);
    expect(serialized).not.toContain(tmpdir());
  });

  it("reports compact boundaries newer than the latest loop snapshot", () => {
    const dataDir = seedLoopSnapshot({ withCompactBoundary: true });

    const result = getPromptLaneLoopStatusTool({}, { dataDir });
    const serialized = JSON.stringify(result);

    expect(result).toMatchObject({
      latest_compact_boundary: {
        id: expect.stringMatching(/^cmp_/),
        event_name: "PostCompact",
        trigger: "auto",
        tool: "claude-code",
        created_at: "2026-07-04T01:05:00.000Z",
        after_latest_snapshot: true,
      },
      next_actions: expect.arrayContaining([
        expect.stringContaining("promptlane loop collect"),
      ]),
    });
    expect(serialized).not.toContain("Compact summary with sk-proj-secret");
    expect(serialized).not.toContain("/Users/example");
  });

  it("prepares a continuation brief from the latest loop snapshot", () => {
    const dataDir = seedLoopSnapshot();

    const result = prepareLoopBriefTool({}, { dataDir });
    const serialized = JSON.stringify(result);

    expect(result).toMatchObject({
      source: "latest",
      snapshot_id: "loop_mcp",
      title: "Continue agent loop loop_mcp",
      privacy: {
        local_only: true,
        external_calls: false,
        returns_prompt_bodies: false,
        returns_raw_paths: false,
        auto_submits: false,
      },
    });
    expect(result.prompt).toContain("## Goal");
    expect(result.prompt).toContain("prompt ids: prmt_one, prmt_two");
    expect(serialized).not.toContain("Make this better");
    expect(serialized).not.toContain("/Users/example");
  });

  it("includes approved loop memory in continuation briefs", () => {
    const dataDir = seedLoopSnapshot({
      outcome: {
        status: "passed",
        summary:
          "Shared status surfaces should use one model instead of duplicating readiness logic.",
        evidence_refs: ["commit:11d8426", "test:pnpm test"],
      },
    });
    recordLoopMemoryTool({ latest: true, approved_by: "user" }, { dataDir });
    seedOtherProjectMemory(dataDir);

    const result = prepareLoopBriefTool({}, { dataDir });
    const serialized = JSON.stringify(result);

    expect(result).toMatchObject({
      source: "latest",
      snapshot_id: "loop_mcp",
    });
    expect(result.prompt).toContain("## Approved Loop Memories");
    expect(result.prompt).toContain(
      "Shared status surfaces should use one model instead of duplicating readiness logic.",
    );
    expect(result.prompt).not.toContain(
      "This unrelated project memory should not appear",
    );
    expect(serialized).not.toContain("Make this better");
    expect(serialized).not.toContain("/Users/example");
  });

  it("prepares a continuation brief for the selected worktree session and branch", () => {
    const dataDir = seedLoopSnapshot({
      outcome: {
        status: "passed",
        summary:
          "Selected worktree brief should resume the reviewed branch, not the newest unrelated worktree.",
        evidence_refs: ["commit:selected"],
      },
    });
    seedNewerOtherWorktreeSnapshot(dataDir);

    const result = prepareLoopBriefTool(
      {
        worktree: "worktree-mcp",
        session_id: "session-mcp",
        branch: "codex/agent-loop-memory-design",
      } as Parameters<typeof prepareLoopBriefTool>[0] & {
        worktree: string;
        session_id: string;
        branch: string;
      },
      { dataDir },
    );
    const serialized = JSON.stringify(result);

    expect(result).toMatchObject({
      source: "selected",
      snapshot_id: "loop_mcp",
    });
    expect(result.prompt).toContain("worktree: worktree-mcp");
    expect(result.prompt).toContain("session: session-mcp");
    expect(result.prompt).toContain("branch: codex/agent-loop-memory-design");
    expect(result.prompt).toContain(
      "Selected worktree brief should resume the reviewed branch, not the newest unrelated worktree.",
    );
    expect(result.prompt).not.toContain("Other worktree has a newer snapshot.");
    expect(serialized).not.toContain("Make this better");
    expect(serialized).not.toContain("/Users/example");
  });

  it("returns not_found when selected loop brief filters match no snapshot", () => {
    const dataDir = seedLoopSnapshot();

    const result = prepareLoopBriefTool(
      {
        worktree: "missing-worktree",
        session_id: "missing-session",
        branch: "feature/missing-loop",
      } as Parameters<typeof prepareLoopBriefTool>[0] & {
        worktree: string;
        session_id: string;
        branch: string;
      },
      { dataDir },
    );

    expect(result).toEqual({
      is_error: true,
      error_code: "not_found",
      message:
        "No loop snapshot matched the selected worktree/session/branch filters. Run `promptlane loop collect --worktree missing-worktree --branch feature/missing-loop` from that project, or retry `promptlane loop brief` with fewer filters.",
    });
  });

  it("includes compact boundary awareness in continuation briefs", () => {
    const dataDir = seedLoopSnapshot({ withCompactBoundary: true });

    const result = prepareLoopBriefTool({}, { dataDir });
    const serialized = JSON.stringify(result);

    expect(result).toMatchObject({
      compact_boundary: {
        event_name: "PostCompact",
        trigger: "auto",
        after_latest_snapshot: true,
      },
    });
    expect(result.prompt).toContain("## Compaction Boundary");
    expect(result.prompt).toContain("PostCompact at 2026-07-04T01:05:00.000Z");
    expect(result.prompt).toContain("Run promptlane loop collect again");
    expect(serialized).not.toContain("Compact summary with sk-proj-secret");
    expect(serialized).not.toContain("/Users/example");
  });

  it("returns actionable guidance when no loop snapshot exists", () => {
    const dataDir = createTempDir();
    initializePromptLane({ dataDir });

    const result = prepareLoopBriefTool({}, { dataDir });

    expect(result).toEqual({
      is_error: true,
      error_code: "not_found",
      message:
        "No loop snapshot found. Send one Codex or Claude Code prompt, call coach_prompt or rerun get_promptlane_status to confirm the first score, then run `promptlane loop collect` before retrying prepare_loop_brief.",
    });
  });

  it("records user-approved loop outcome metadata without prompt bodies or raw paths", () => {
    const dataDir = seedLoopSnapshot();

    const result = recordLoopOutcomeTool(
      {
        snapshot_id: "loop_mcp",
        status: "passed",
        summary: "Focused MCP tests and full build passed.",
        evidence_refs: ["test:src/mcp/loop-tool.test.ts", "build:pnpm-build"],
        used_improvement_prompt_ids: ["prmt_one"],
      },
      { dataDir },
    );
    const serialized = JSON.stringify(result);

    expect(result).toMatchObject({
      recorded: true,
      snapshot_id: "loop_mcp",
      outcome: {
        status: "passed",
        summary: "Focused MCP tests and full build passed.",
        evidence_refs: ["test:src/mcp/loop-tool.test.ts", "build:pnpm-build"],
        used_improvement_prompt_ids: ["prmt_one"],
      },
      privacy: {
        local_only: true,
        external_calls: false,
        stores_prompt_bodies: false,
        stores_raw_paths: false,
        returns_prompt_bodies: false,
        returns_raw_paths: false,
      },
    });
    expect(serialized).not.toContain("Make this better");
    expect(serialized).not.toContain("/Users/example");
  });

  it("rejects unsafe loop outcome text before storage", () => {
    const dataDir = seedLoopSnapshot();

    const result = recordLoopOutcomeTool(
      {
        snapshot_id: "loop_mcp",
        status: "passed",
        summary: "Private result at /Users/example/project/result.log.",
        evidence_refs: ["token:sk-proj-abcdefghijklmnop"],
      },
      { dataDir },
    );

    expect(result).toEqual({
      is_error: true,
      error_code: "invalid_input",
      message:
        "Loop outcome summary and evidence refs must not include secrets or raw local paths.",
    });
  });

  it("rejects improvement attribution from another snapshot as invalid input", () => {
    const dataDir = seedLoopSnapshot();

    expect(
      recordLoopOutcomeTool(
        {
          snapshot_id: "loop_mcp",
          status: "passed",
          summary: "Focused MCP tests passed.",
          evidence_refs: ["test:focused"],
          used_improvement_prompt_ids: ["prmt_other_loop"],
        },
        { dataDir },
      ),
    ).toEqual({
      is_error: true,
      error_code: "invalid_input",
      message:
        "Used improvement prompt ids must belong to the selected loop snapshot.",
    });
  });

  it("guides first-time outcome recording through prompt capture before collect", () => {
    const dataDir = createTempDir();
    initializePromptLane({ dataDir });

    const result = recordLoopOutcomeTool(
      {
        latest: true,
        status: "passed",
        summary: "Focused MCP tests passed.",
        evidence_refs: ["test:src/mcp/loop-tool.test.ts"],
      },
      { dataDir },
    );

    expect(result).toEqual({
      is_error: true,
      error_code: "not_found",
      message:
        "No loop snapshot found. Send one Codex or Claude Code prompt, call coach_prompt or rerun get_promptlane_status to confirm the first score, then run `promptlane loop collect` before retrying record_loop_outcome.",
    });
  });

  it("proposes a memory candidate from the latest passed loop without writing memory", () => {
    const dataDir = seedLoopSnapshot({
      outcome: {
        status: "passed",
        summary:
          "Scheduler lifecycle should stay plist-only unless the user explicitly asks for launchctl mutation.",
        evidence_refs: ["commit:2a91de0", "test:pnpm test"],
      },
    });

    const result = proposeLoopMemoryCandidateTool({}, { dataDir });
    const serialized = JSON.stringify(result);

    expect(result).toMatchObject({
      eligible: true,
      reason: "passed_with_evidence",
      snapshot_id: "loop_mcp",
      candidate: {
        statement:
          "Scheduler lifecycle should stay plist-only unless the user explicitly asks for launchctl mutation.",
        evidence_refs: ["commit:2a91de0", "test:pnpm test"],
      },
      next_action:
        "Ask the user to approve this candidate before writing it into AGENTS.md, CLAUDE.md, or any memory store.",
      privacy: {
        local_only: true,
        external_calls: false,
        stores_prompt_bodies: false,
        stores_raw_paths: false,
        returns_prompt_bodies: false,
        returns_raw_paths: false,
        auto_writes_memory: false,
      },
    });
    expect(serialized).not.toContain("Make this better");
    expect(serialized).not.toContain("/Users/example");
  });

  it("guides first-time memory candidate users through prompt capture, collect, and outcome evidence", () => {
    const dataDir = createTempDir();
    initializePromptLane({ dataDir });

    const result = proposeLoopMemoryCandidateTool({}, { dataDir });

    expect(result).toEqual({
      is_error: true,
      error_code: "not_found",
      message:
        "No loop snapshot found. Send one Codex or Claude Code prompt, call coach_prompt or rerun get_promptlane_status to confirm the first score, run `promptlane loop collect`, then record a passed loop outcome with safe evidence before retrying propose_loop_memory_candidate.",
    });
  });

  it("records a user-approved loop memory without writing instruction files", () => {
    const dataDir = seedLoopSnapshot({
      outcome: {
        status: "passed",
        summary:
          "Scheduler lifecycle should stay plist-only unless the user explicitly asks for launchctl mutation.",
        evidence_refs: ["commit:79cb39d", "test:pnpm test"],
      },
    });

    const result = recordLoopMemoryTool(
      {
        latest: true,
        approved_by: "user",
      },
      { dataDir },
    );
    const serialized = JSON.stringify(result);

    expect(result).toMatchObject({
      recorded: true,
      memory: {
        snapshot_id: "loop_mcp",
        statement:
          "Scheduler lifecycle should stay plist-only unless the user explicitly asks for launchctl mutation.",
        evidence_refs: ["commit:79cb39d", "test:pnpm test"],
        approved_by: "user",
      },
      next_action:
        "Use this local memory as context in future loop briefs; writing AGENTS.md or CLAUDE.md still requires a separate explicit patch.",
      next_actions: [
        "prepare_loop_brief",
        "propose_instruction_patch target_file=AGENTS.md",
      ],
      privacy: {
        local_only: true,
        external_calls: false,
        stores_prompt_bodies: false,
        stores_raw_paths: false,
        returns_prompt_bodies: false,
        returns_raw_paths: false,
        writes_instruction_files: false,
      },
    });
    expect(serialized).not.toContain("Make this better");
    expect(serialized).not.toContain("/Users/example");
  });

  it("proposes and records memory for a selected worktree instead of global latest", () => {
    const dataDir = seedLoopSnapshot({
      outcome: {
        status: "passed",
        summary: "Selected worktree checks passed.",
        evidence_refs: ["test:selected-worktree"],
      },
    });
    seedNewerOtherWorktreeSnapshot(dataDir);

    const candidate = proposeLoopMemoryCandidateTool(
      { worktree: "worktree-mcp" },
      { dataDir },
    );
    const approval = recordLoopMemoryTool(
      {
        snapshot_id: "loop_mcp",
        approved_by: "user",
      },
      { dataDir },
    );

    expect(candidate).toMatchObject({
      eligible: true,
      snapshot_id: "loop_mcp",
      candidate: { statement: "Selected worktree checks passed." },
    });
    expect(approval).toMatchObject({
      recorded: true,
      memory: {
        snapshot_id: "loop_mcp",
        statement: "Selected worktree checks passed.",
      },
    });
    expect(JSON.stringify({ candidate, approval })).not.toContain(
      "Other worktree has a newer snapshot.",
    );
  });

  it("rejects mixed snapshot-id and worktree memory selection", () => {
    const result = proposeLoopMemoryCandidateTool(
      { snapshot_id: "loop_mcp", worktree: "worktree-mcp" },
      { dataDir: createTempDir() },
    );

    expect(result).toEqual({
      is_error: true,
      error_code: "invalid_input",
      message:
        "Use either `snapshot_id` or worktree/session/branch filters, not both.",
    });
  });

  it("proposes an instruction patch from approved memory without writing files", () => {
    const dataDir = seedLoopSnapshot({
      outcome: {
        status: "passed",
        summary:
          "Scheduler lifecycle should stay plist-only unless the user explicitly asks for launchctl mutation.",
        evidence_refs: ["commit:568e2b4", "test:pnpm test"],
      },
    });
    recordLoopMemoryTool({ latest: true, approved_by: "user" }, { dataDir });

    const result = proposeInstructionPatchTool(
      {
        target_file: "AGENTS.md",
      },
      { dataDir },
    );
    const serialized = JSON.stringify(result);

    expect(result).toMatchObject({
      target_file: "AGENTS.md",
      writes_files: false,
      requires_user_approval: true,
      apply_gate: {
        web_apply_available: false,
        confirm_command:
          "promptlane loop instruction-apply --target-file AGENTS.md --confirm-apply",
        mcp_tool: "apply_instruction_patch",
        reason:
          "web review does not write files; apply through CLI or MCP with explicit confirmation",
      },
      privacy: {
        local_only: true,
        external_calls: false,
        returns_prompt_bodies: false,
        returns_raw_paths: false,
        writes_instruction_files: false,
      },
    });
    expect(result.diff).toContain("## PromptLane Memories");
    expect(result.diff).toContain("Scheduler lifecycle should stay plist-only");
    expect(serialized).not.toContain("Make this better");
    expect(serialized).not.toContain("/Users/example");
  });

  it("guides instruction patch tools to approve evidence-backed memory first", () => {
    const dataDir = createTempDir();
    initializePromptLane({ dataDir });

    const result = proposeInstructionPatchTool(
      {
        target_file: "AGENTS.md",
      },
      { dataDir },
    );

    expect(result).toEqual({
      is_error: true,
      error_code: "not_found",
      message:
        "No loop memory found. Capture one Codex or Claude Code prompt, call coach_prompt or rerun get_promptlane_status, collect a loop snapshot, record a passed outcome with safe evidence, then call record_loop_memory before retrying propose_instruction_patch.",
    });
  });

  it("applies an instruction patch only with explicit confirmation", () => {
    const dataDir = seedLoopSnapshot({
      outcome: {
        status: "passed",
        summary:
          "Scheduler lifecycle should stay plist-only unless the user explicitly asks for launchctl mutation.",
        evidence_refs: ["commit:568e2b4", "test:pnpm test"],
      },
    });
    const projectDir = createTempDir();
    writeFileSync(join(projectDir, "AGENTS.md"), "# Project Rules\n");
    recordLoopMemoryTool({ latest: true, approved_by: "user" }, { dataDir });

    expect(
      applyInstructionPatchTool(
        {
          target_file: "AGENTS.md",
          target_dir: projectDir,
        },
        { dataDir },
      ),
    ).toEqual({
      is_error: true,
      error_code: "approval_required",
      message: "Instruction patch apply requires confirm_apply=true.",
    });

    const result = applyInstructionPatchTool(
      {
        target_file: "AGENTS.md",
        target_dir: projectDir,
        confirm_apply: true,
      },
      { dataDir },
    );
    const serialized = JSON.stringify(result);

    expect(result).toMatchObject({
      target_file: "AGENTS.md",
      applied: true,
      writes_files: true,
      privacy: {
        local_only: true,
        external_calls: false,
        returns_prompt_bodies: false,
        returns_raw_paths: false,
        writes_instruction_files: true,
      },
    });
    expect(readFileSync(join(projectDir, "AGENTS.md"), "utf8")).toContain(
      "source_memory:",
    );
    expect(serialized).not.toContain(projectDir);
    expect(serialized).not.toContain("/Users/example");
  });

  it("rejects empty loop outcome summaries", () => {
    const dataDir = seedLoopSnapshot();

    const result = recordLoopOutcomeTool(
      {
        snapshot_id: "loop_mcp",
        status: "failed",
        summary: " ",
      },
      { dataDir },
    );

    expect(result).toEqual({
      is_error: true,
      error_code: "invalid_input",
      message: "Loop outcome summary must not be empty.",
    });
  });
});

function seedLoopSnapshot(
  options: {
    withCompactBoundary?: boolean;
    outcome?: LoopSnapshot["outcome"];
  } = {},
): string {
  const dataDir = createTempDir();
  const init = initializePromptLane({ dataDir });
  const storage = createSqlitePromptStorage({
    dataDir,
    hmacSecret: init.hookAuth.web_session_secret,
    now: () => new Date("2026-07-04T01:05:00.000Z"),
  });
  try {
    if (options.withCompactBoundary) {
      const boundary = storage.recordCompactBoundary({
        tool: "claude-code",
        event_name: "PostCompact",
        trigger: "auto",
        session_id: "session-mcp",
        cwd: "/Users/example/private-project",
        content: "Compact summary with sk-proj-secret and /Users/example.",
      });
      storage.createLoopSnapshot(
        loopSnapshot({
          project_id: boundary.project_id,
          ...(options.outcome ? { outcome: options.outcome } : {}),
        }),
      );
    } else {
      storage.createLoopSnapshot(
        loopSnapshot(options.outcome ? { outcome: options.outcome } : {}),
      );
    }
  } finally {
    storage.close();
  }
  return dataDir;
}

function loopSnapshot(patch: Partial<LoopSnapshot> = {}): LoopSnapshot {
  return {
    id: "loop_mcp",
    created_at: "2026-07-04T01:00:00.000Z",
    tool: "codex",
    source: "cli",
    session_id: "session-mcp",
    cwd_label: "private-project",
    project_id: "proj_mcp",
    git_root_hash: "git_hash",
    branch: "codex/agent-loop-memory-design",
    worktree_label: "worktree-mcp",
    prompt_ids: ["prmt_one", "prmt_two"],
    event_counts: {
      prompts: 2,
    },
    quality: {
      average_prompt_score: 58,
      top_gaps: ["Goal clarity", "Verification criteria"],
      unresolved_questions: [],
    },
    outcome: {
      status: "unknown",
      summary: "Loop snapshot collected from 2 prompts.",
      evidence_refs: ["prompt:prmt_one", "prompt:prmt_two"],
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
    ...patch,
  };
}

function seedOtherProjectMemory(dataDir: string): void {
  const init = initializePromptLane({ dataDir });
  const storage = createSqlitePromptStorage({
    dataDir,
    hmacSecret: init.hookAuth.web_session_secret,
    now: () => new Date("2026-07-04T01:30:00.000Z"),
  });
  try {
    const latest = storage.getLatestLoopSnapshot();
    if (!latest) return;
    storage.createLoopSnapshot({
      ...latest,
      id: "loop_other_project",
      created_at: "2026-07-03T01:00:00.000Z",
      session_id: "session-other-project",
      cwd_label: "other-project",
      project_id: "proj_other",
      worktree_label: "other-worktree",
      outcome: {
        status: "passed",
        summary: "This unrelated project memory should not appear.",
        evidence_refs: ["commit:other"],
      },
    });
    storage.recordLoopMemory({
      snapshot_id: "loop_other_project",
      title: "Other project memory",
      statement: "This unrelated project memory should not appear.",
      evidence_refs: ["commit:other"],
      approved_by: "user",
    });
  } finally {
    storage.close();
  }
}

function seedLoopMergeDecision(dataDir: string): void {
  const init = initializePromptLane({ dataDir });
  const storage = createSqlitePromptStorage({
    dataDir,
    hmacSecret: init.hookAuth.web_session_secret,
    now: () => new Date("2026-07-04T01:30:00.000Z"),
  });
  try {
    storage.recordLoopMergeDecision({
      snapshot_id: "loop_mcp",
      project_id: "proj_mcp",
      worktree: "worktree-mcp",
      decision: "continue",
      reason: "Needs one more verification pass before merge.",
      decided_by: "user",
    });
  } finally {
    storage.close();
  }
}

function seedNewerOtherWorktreeSnapshot(dataDir: string): void {
  const init = initializePromptLane({ dataDir });
  const storage = createSqlitePromptStorage({
    dataDir,
    hmacSecret: init.hookAuth.web_session_secret,
  });
  try {
    storage.createLoopSnapshot(
      loopSnapshot({
        id: "loop_newer_other_worktree",
        created_at: "2026-07-04T01:10:00.000Z",
        session_id: "session-other-mcp",
        branch: "feature/other-loop",
        worktree_label: "other-worktree",
        outcome: {
          status: "passed",
          summary: "Other worktree has a newer snapshot.",
          evidence_refs: ["commit:other"],
        },
      }),
    );
  } finally {
    storage.close();
  }
}

function createTempDir(): string {
  const dir = join(tmpdir(), `promptlane-loop-mcp-${randomUUID()}`);
  mkdirSync(dir, { recursive: true });
  tempDirs.push(dir);
  return dir;
}
