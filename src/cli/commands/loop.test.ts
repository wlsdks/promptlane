import { randomUUID } from "node:crypto";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import { normalizeClaudeCodePayload } from "../../adapters/claude-code.js";
import { initializePromptLane } from "../../config/config.js";
import { redactPrompt } from "../../redaction/redact.js";
import { createSqlitePromptStorage } from "../../storage/sqlite.js";
import {
  loopBriefForCli,
  loopCollectForCli,
  loopInstructionPatchApplyForCli,
  loopInstructionPatchForCli,
  loopDecisionListForCli,
  loopDecisionRecordForCli,
  loopMemoryApproveForCli,
  loopMemoryCandidateForCli,
  loopOutcomeForCli,
  loopStatusForCli,
} from "./loop.js";

const tempDirs: string[] = [];

afterEach(() => {
  while (tempDirs.length > 0) {
    const dir = tempDirs.pop();
    if (dir) rmSync(dir, { recursive: true, force: true });
  }
});

describe("loop CLI command", () => {
  it("collects a privacy-safe loop snapshot as JSON and text", async () => {
    const dataDir = createTempDir();
    await seedPrompts(dataDir);

    const json = loopCollectForCli({
      dataDir,
      json: true,
      cwdPrefix: "/Users/example/private-project",
      limit: 10,
      now: new Date("2026-07-04T01:00:00.000Z"),
      cwd: "/Users/example/private-project",
      branch: "codex/agent-loop-memory-design",
    });
    const parsed = JSON.parse(json) as {
      id: string;
      prompt_ids: string[];
      cwd_label: string;
      branch: string;
      privacy: { stores_prompt_bodies: boolean; stores_raw_paths: boolean };
    };

    expect(parsed.id).toMatch(/^loop_/);
    expect(parsed.prompt_ids).toHaveLength(2);
    expect(parsed.cwd_label).toBe("private-project");
    expect(parsed.branch).toBe("codex/agent-loop-memory-design");
    expect(parsed.privacy).toMatchObject({
      stores_prompt_bodies: false,
      stores_raw_paths: false,
    });
    expect(json).not.toContain("Make this better");
    expect(json).not.toContain("/Users/example");

    const text = loopCollectForCli({
      dataDir,
      cwdPrefix: "/Users/example/private-project",
      limit: 10,
      now: new Date("2026-07-04T01:00:00.000Z"),
      cwd: "/Users/example/private-project",
    });

    expect(text).toContain("Loop snapshot collected");
    expect(text).toContain("project private-project");
    expect(text).toContain("prompts 2");
    expect(text).toContain("Privacy: local-only");
    expect(text).not.toContain("Make this better");
    expect(text).not.toContain("/Users/example");
  });

  it("records a passed outcome on the latest snapshot for CLI-only memory flow", async () => {
    const dataDir = createTempDir();
    await seedPrompts(dataDir);
    const snapshot = JSON.parse(
      loopCollectForCli({
        dataDir,
        json: true,
        cwdPrefix: "/Users/example/private-project",
        now: new Date("2026-07-04T01:00:00.000Z"),
        cwd: "/Users/example/private-project",
      }),
    ) as { id: string; prompt_ids: string[] };

    const json = loopOutcomeForCli({
      dataDir,
      json: true,
      status: "passed",
      summary: "Focused CLI tests passed.",
      evidenceRefs: ["test:loop-cli", "build:pnpm-build"],
      usedImprovementPromptIds: [snapshot.prompt_ids[0]!],
    });

    expect(JSON.parse(json)).toMatchObject({
      recorded: true,
      snapshot_id: snapshot.id,
      outcome: {
        status: "passed",
        summary: "Focused CLI tests passed.",
        evidence_refs: ["test:loop-cli", "build:pnpm-build"],
        used_improvement_prompt_ids: [snapshot.prompt_ids[0]],
      },
      next_actions: [
        "promptlane loop memory-candidate",
        "promptlane loop brief",
      ],
      privacy: {
        local_only: true,
        stores_prompt_bodies: false,
        stores_raw_paths: false,
      },
    });
    expect(json).not.toContain("/Users/example");
  });

  it("records an outcome on a selected worktree without updating the latest snapshot", async () => {
    const dataDir = createTempDir();
    await seedPrompts(dataDir);
    const selected = JSON.parse(
      loopCollectForCli({
        dataDir,
        json: true,
        cwdPrefix: "/Users/example/private-project",
        now: new Date("2026-07-04T01:00:00.000Z"),
        cwd: "/Users/example/private-project",
        worktree: "primary-worktree",
      }),
    ) as { id: string };
    seedNewerOtherWorktreeSnapshot(dataDir);

    const result = JSON.parse(
      loopOutcomeForCli({
        dataDir,
        json: true,
        status: "passed",
        summary: "Selected worktree checks passed.",
        evidenceRefs: ["test:selected-worktree"],
        worktree: "primary-worktree",
      }),
    ) as { snapshot_id: string };

    expect(result.snapshot_id).toBe(selected.id);
    const init = initializePromptLane({ dataDir });
    const storage = createSqlitePromptStorage({
      dataDir,
      hmacSecret: init.hookAuth.web_session_secret,
    });
    try {
      expect(storage.getLatestLoopSnapshot()?.id).toBe(
        "loop_newer_other_worktree",
      );
      expect(storage.getLatestLoopSnapshot()?.outcome.summary).toBe(
        "Other worktree has a newer snapshot.",
      );
    } finally {
      storage.close();
    }
  });

  it("rejects unsafe outcome text before opening storage", () => {
    expect(() =>
      loopOutcomeForCli({
        dataDir: "/Users/example/should-not-open",
        status: "passed",
        summary: "Read /Users/example/private/result.log.",
      }),
    ).toThrow(
      "Loop outcome summary and evidence refs must not include secrets or raw local paths.",
    );
  });

  it("collects a cron-safe service loop snapshot without prompt bodies or raw paths", async () => {
    const dataDir = createTempDir();
    await seedPrompts(dataDir);

    const json = loopCollectForCli({
      dataDir,
      json: true,
      cwdPrefix: "/Users/example/private-project",
      limit: 10,
      now: new Date("2026-07-04T02:00:00.000Z"),
      cwd: "/Users/example/private-project",
      source: "service",
    });
    const parsed = JSON.parse(json) as {
      source: string;
      prompt_ids: string[];
      privacy: { stores_prompt_bodies: boolean; stores_raw_paths: boolean };
    };

    expect(parsed.source).toBe("service");
    expect(parsed.prompt_ids).toHaveLength(2);
    expect(parsed.privacy).toMatchObject({
      stores_prompt_bodies: false,
      stores_raw_paths: false,
    });
    expect(json).not.toContain("Make this better");
    expect(json).not.toContain("/Users/example");

    const text = loopCollectForCli({
      dataDir,
      cwdPrefix: "/Users/example/private-project",
      now: new Date("2026-07-04T02:00:00.000Z"),
      cwd: "/Users/example/private-project",
      source: "service",
    });

    expect(text).toContain("source service");
    expect(text).toContain("Next: promptlane loop brief");
    expect(text).not.toContain("Make this better");
    expect(text).not.toContain("/Users/example");
  });

  it("prints the latest continuation brief without prompt bodies", async () => {
    const dataDir = createTempDir();
    await seedPrompts(dataDir);
    loopCollectForCli({
      dataDir,
      cwdPrefix: "/Users/example/private-project",
      now: new Date("2026-07-04T01:00:00.000Z"),
      cwd: "/Users/example/private-project",
    });

    const text = loopBriefForCli({ dataDir });

    expect(text).toContain("Continue agent loop");
    expect(text).toContain("## Goal");
    expect(text).toContain("## Verification");
    expect(text).not.toContain("Make this better");
    expect(text).not.toContain("/Users/example");
  });

  it("guides first-time loop brief users through prompt capture before collect", () => {
    const dataDir = createTempDir();
    initializePromptLane({ dataDir });

    expect(() => loopBriefForCli({ dataDir })).toThrow(
      "No loop snapshot found. Send one Codex or Claude Code prompt, run `promptlane coach` to confirm the first score, then run `promptlane loop collect` before retrying `promptlane loop brief`.",
    );
  });

  it("prints approved loop memories in the latest continuation brief", async () => {
    const dataDir = createTempDir();
    await seedPrompts(dataDir);
    const snapshot = JSON.parse(
      loopCollectForCli({
        dataDir,
        json: true,
        cwdPrefix: "/Users/example/private-project",
        now: new Date("2026-07-04T01:00:00.000Z"),
        cwd: "/Users/example/private-project",
        worktree: "primary-worktree",
      }),
    ) as { id: string };
    seedLoopOutcome(dataDir, snapshot.id);
    loopMemoryApproveForCli({ dataDir, approvedBy: "user" });
    seedOtherProjectMemory(dataDir);

    const text = loopBriefForCli({ dataDir });

    expect(text).toContain("## Approved Loop Memories");
    expect(text).toContain(
      "Scheduler lifecycle should stay plist-only unless the user explicitly asks for launchctl mutation.",
    );
    expect(text).not.toContain(
      "This unrelated project memory should not appear",
    );
    expect(text).not.toContain("Make this better");
    expect(text).not.toContain("/Users/example");
  });

  it("prints a continuation brief for the selected worktree session and branch", async () => {
    const dataDir = createTempDir();
    await seedPrompts(dataDir);
    const selected = JSON.parse(
      loopCollectForCli({
        dataDir,
        json: true,
        cwdPrefix: "/Users/example/private-project",
        now: new Date("2026-07-04T01:00:00.000Z"),
        cwd: "/Users/example/private-project",
        branch: "feature/selected-loop",
        worktree: "selected-worktree",
      }),
    ) as { id: string };
    seedLoopOutcome(dataDir, selected.id);
    seedNewerOtherWorktreeSnapshot(dataDir);

    const text = loopBriefForCli({
      dataDir,
      worktree: "selected-worktree",
      session: "session-loop-cli",
      branch: "feature/selected-loop",
    } as Parameters<typeof loopBriefForCli>[0] & { session: string });

    expect(text).toContain(`Continue agent loop ${selected.id}`);
    expect(text).toContain("worktree: selected-worktree");
    expect(text).toContain("session: session-loop-cli");
    expect(text).toContain("branch: feature/selected-loop");
    expect(text).toContain(
      "Scheduler lifecycle should stay plist-only unless the user explicitly asks for launchctl mutation.",
    );
    expect(text).not.toContain("Other worktree has a newer snapshot.");
    expect(text).not.toContain("Make this better");
    expect(text).not.toContain("/Users/example");
  });

  it("explains how to recover when selected brief filters match no snapshot", async () => {
    const dataDir = createTempDir();
    await seedPrompts(dataDir);
    loopCollectForCli({
      dataDir,
      cwdPrefix: "/Users/example/private-project",
      now: new Date("2026-07-04T01:00:00.000Z"),
      cwd: "/Users/example/private-project",
      branch: "feature/selected-loop",
      worktree: "selected-worktree",
    });

    expect(() =>
      loopBriefForCli({
        dataDir,
        worktree: "missing-worktree",
        session: "missing-session",
        branch: "feature/missing-loop",
      }),
    ).toThrow(
      "No loop snapshot matched the selected worktree/session/branch filters. Run `promptlane loop collect --worktree missing-worktree --branch feature/missing-loop` from that project, or retry `promptlane loop brief` with fewer filters.",
    );
  });

  it("shell-quotes selected brief recovery filters with spaces and quotes", async () => {
    const dataDir = createTempDir();
    await seedPrompts(dataDir);
    loopCollectForCli({
      dataDir,
      cwdPrefix: "/Users/example/private-project",
      now: new Date("2026-07-04T01:00:00.000Z"),
      cwd: "/Users/example/private-project",
      worktree: "selected-worktree",
    });

    expect(() =>
      loopBriefForCli({
        dataDir,
        worktree: "missing worktree",
        branch: "feature/missing 'loop'",
      }),
    ).toThrow(
      "No loop snapshot matched the selected worktree/session/branch filters. Run `promptlane loop collect --worktree 'missing worktree' --branch 'feature/missing '\\''loop'\\'''` from that project, or retry `promptlane loop brief` with fewer filters.",
    );
  });

  it("does not echo raw paths in selected brief recovery guidance", async () => {
    const dataDir = createTempDir();
    await seedPrompts(dataDir);
    loopCollectForCli({
      dataDir,
      cwdPrefix: "/Users/example/private-project",
      now: new Date("2026-07-04T01:00:00.000Z"),
      cwd: "/Users/example/private-project",
      worktree: "selected-worktree",
    });

    expect(() =>
      loopBriefForCli({
        dataDir,
        worktree: "/Users/example/private-project",
      }),
    ).toThrow(
      "No loop snapshot matched the selected worktree/session/branch filters. Run `promptlane loop collect --worktree private-project` from that project, or retry `promptlane loop brief` with fewer filters.",
    );
  });

  it("marks continuation briefs when compact happened after the latest snapshot", async () => {
    const dataDir = createTempDir();
    await seedPrompts(dataDir);
    loopCollectForCli({
      dataDir,
      cwdPrefix: "/Users/example/private-project",
      now: new Date("2026-07-04T01:00:00.000Z"),
      cwd: "/Users/example/private-project",
    });
    seedCompactBoundary(dataDir);

    const text = loopBriefForCli({ dataDir });

    expect(text).toContain("## Compaction Boundary");
    expect(text).toContain("PostCompact at 2026-07-04T01:05:00.000Z");
    expect(text).toContain("Run promptlane loop collect again");
    expect(text).not.toContain("Compact summary with sk-proj-secret");
    expect(text).not.toContain("/Users/example");
  });

  it("prints compact-aware loop status without prompt bodies or raw paths", async () => {
    const dataDir = createTempDir();
    await seedPrompts(dataDir);
    const snapshot = JSON.parse(
      loopCollectForCli({
        dataDir,
        json: true,
        cwdPrefix: "/Users/example/private-project",
        now: new Date("2026-07-04T01:00:00.000Z"),
        cwd: "/Users/example/private-project",
        worktree: "primary-worktree",
      }),
    ) as { id: string };
    seedLoopOutcome(dataDir, snapshot.id);
    loopMemoryApproveForCli({ dataDir, approvedBy: "user" });
    loopDecisionRecordForCli({
      dataDir,
      worktree: "primary-worktree",
      decision: "continue",
      reason: "Needs one more verification pass before merge.",
      decidedBy: "user",
      now: new Date("2026-07-04T01:30:00.000Z"),
    });
    seedOtherProjectMemory(dataDir);
    seedCompactBoundary(dataDir);

    const text = loopStatusForCli({ dataDir });

    expect(text).toContain("PromptLane status ready");
    expect(text).toContain("snapshots 2");
    expect(text).toContain("approved memories 1");
    expect(text).toContain("active worktrees 2");
    expect(text).toContain("active sessions 2");
    expect(text).toContain("worktree review needed yes");
    expect(text).toContain("command center Multi-worktree review");
    expect(text).toContain("primary action compare worktrees before merge");
    expect(text).toContain("review packet ready");
    expect(text).toContain(
      "review packet summary 2 ready, 0 needs review, 0 missing evidence",
    );
    expect(text).toContain(
      "review packet next compare ready evidence before merge",
    );
    expect(text).toContain(
      "review packet advisory honor recent continue decision before merge",
    );
    expect(text).toContain(
      "checklist Compare ready evidence before merge required",
    );
    expect(text).toContain(
      "recent decision primary-worktree continue Needs one more verification pass before merge.",
    );
    expect(text).toContain("review primary-worktree ready for continuation");
    expect(text).toContain(
      "command promptlane loop brief --worktree primary-worktree",
    );
    expect(text).toContain("merge readiness primary-worktree ready");
    expect(text).toContain("evidence primary-worktree evidence present refs 2");
    expect(text).toContain(
      "worktree primary-worktree snapshots 1 sessions 1 latest passed",
    );
    expect(text).toContain(
      "worktree other-worktree snapshots 1 sessions 1 latest passed",
    );
    expect(text).toContain("memory candidate eligible");
    expect(text).toContain("latest loop");
    expect(text).toContain("project private-project");
    expect(text).toContain(
      "compact boundary PostCompact at 2026-07-04T01:05:00.000Z",
    );
    expect(text).toContain("Next: promptlane loop collect");
    expect(text).not.toContain("Make this better");
    expect(text).not.toContain("Compact summary with sk-proj-secret");
    expect(text).not.toContain("/Users/example");

    const json = loopStatusForCli({ dataDir, json: true });
    const parsed = JSON.parse(json) as {
      latest_snapshot?: { outcome_status?: string };
      activity?: {
        active_worktrees?: number;
        active_sessions?: number;
        needs_review?: boolean;
        worktrees?: Array<{
          worktree?: string;
          snapshots?: number;
          sessions?: number;
          latest_outcome_status?: string;
          evidence_count?: number;
        }>;
        command_center?: {
          title?: string;
          primary_action?: string;
          review_packet?: {
            status?: string;
            summary?: string;
            next_action?: string;
            decision_advisory?: {
              summary?: string;
              next_action?: string;
            };
            ready_count?: number;
            needs_review_count?: number;
            missing_evidence_count?: number;
            actions?: string[];
            checklist?: Array<{
              label?: string;
              status?: string;
              action?: string;
            }>;
          };
          review_items?: Array<{
            worktree?: string;
            recommendation?: string;
            evidence_count?: number;
            merge_readiness?: {
              status?: string;
              evidence?: string;
              next_action?: string;
            };
          }>;
        };
        recent_decisions?: Array<{
          worktree?: string;
          decision?: string;
          reason?: string;
          decided_by?: string;
        }>;
      };
      project_memory?: { approved_count?: number; included_in_brief?: boolean };
      memory_candidate?: {
        eligible?: boolean;
        reason?: string;
        next_action?: string;
      };
      next_actions?: string[];
      privacy?: { returns_compact_content?: boolean };
    };

    expect(parsed.latest_snapshot?.outcome_status).toBe("passed");
    expect(parsed.activity).toMatchObject({
      active_worktrees: 2,
      active_sessions: 2,
      needs_review: true,
      worktrees: [
        {
          worktree: "primary-worktree",
          snapshots: 1,
          sessions: 1,
          latest_outcome_status: "passed",
          evidence_count: 2,
        },
        {
          worktree: "other-worktree",
          snapshots: 1,
          sessions: 1,
          latest_outcome_status: "passed",
          evidence_count: 1,
        },
      ],
      command_center: {
        title: "Multi-worktree review",
        primary_action: "compare worktrees before merge",
        review_packet: {
          status: "ready",
          summary: "2 ready, 0 needs review, 0 missing evidence",
          next_action: "compare ready evidence before merge",
          decision_advisory: {
            summary: "recent continue decision recorded for primary-worktree",
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
            worktree: "primary-worktree",
            recommendation: "ready for continuation",
            continuation_command:
              "promptlane loop brief --worktree primary-worktree",
            evidence_count: 2,
            merge_readiness: {
              status: "ready",
              evidence: "evidence present",
              next_action: "compare evidence before merge",
            },
          },
          {
            worktree: "other-worktree",
            recommendation: "ready for continuation",
            continuation_command:
              "promptlane loop brief --worktree other-worktree",
            evidence_count: 1,
            merge_readiness: {
              status: "ready",
              evidence: "evidence present",
              next_action: "compare evidence before merge",
            },
          },
        ],
      },
      recent_decisions: [
        {
          snapshot_id: snapshot.id,
          worktree: "primary-worktree",
          decision: "continue",
          reason: "Needs one more verification pass before merge.",
          decided_by: "user",
          created_at: expect.any(String),
        },
      ],
    });
    expect(parsed.project_memory).toEqual({
      approved_count: 1,
      included_in_brief: true,
    });
    expect(parsed.memory_candidate).toEqual({
      eligible: true,
      reason: "passed_with_evidence",
      next_action: "promptlane loop memory-approve",
    });
    expect(parsed.next_actions).toEqual(
      expect.arrayContaining([
        expect.stringContaining("promptlane loop collect"),
        expect.stringContaining("promptlane loop memory-approve"),
      ]),
    );
    expect(parsed.privacy?.returns_compact_content).toBe(false);
    expect(json).not.toContain(
      "Scheduler lifecycle should stay plist-only unless the user explicitly asks for launchctl mutation.",
    );
    expect(json).not.toContain("commit:2a91de0");
    expect(json).not.toContain(
      "This unrelated project memory should not appear",
    );
  });

  it("prints the exact pending checkpoint action in plain loop status", async () => {
    const dataDir = createTempDir();
    await seedPrompts(dataDir);
    const snapshot = JSON.parse(
      loopCollectForCli({
        dataDir,
        json: true,
        cwdPrefix: "/Users/example/private-project",
        now: new Date("2026-07-04T01:00:00.000Z"),
        cwd: "/Users/example/private-project",
      }),
    ) as { id: string };

    const text = loopStatusForCli({ dataDir });

    expect(text).toContain("Next actions:");
    expect(text).toContain(
      `promptlane loop outcome --snapshot-id ${snapshot.id}`,
    );
    expect(text).toContain("verifiable checkpoint");
    expect(text).toContain("prompt ids prmt_");
    expect(text).toContain("--used-improvement-prompt");
    expect(text).toContain("otherwise omit attribution");
    expect(text).not.toContain("Make this better");
    expect(text).not.toContain("/Users/example");
  });

  it("prints empty loop status guidance", () => {
    const dataDir = createTempDir();
    initializePromptLane({ dataDir });

    const text = loopStatusForCli({ dataDir });

    expect(text).toContain("PromptLane status empty");
    expect(text).toContain("snapshots 0");
    expect(text).toContain("Next: promptlane loop collect");
  });

  it("prints a privacy-safe memory candidate decision for the latest passed loop", async () => {
    const dataDir = createTempDir();
    await seedPrompts(dataDir);
    const snapshot = JSON.parse(
      loopCollectForCli({
        dataDir,
        json: true,
        cwdPrefix: "/Users/example/private-project",
        now: new Date("2026-07-04T01:00:00.000Z"),
        cwd: "/Users/example/private-project",
      }),
    ) as { id: string };
    seedLoopOutcome(dataDir, snapshot.id);

    const json = loopMemoryCandidateForCli({ dataDir, json: true });
    const parsed = JSON.parse(json) as {
      eligible: boolean;
      candidate?: { statement: string; evidence_refs: string[] };
      privacy: { auto_writes_memory: boolean; external_calls: boolean };
    };

    expect(parsed.eligible).toBe(true);
    expect(parsed.candidate?.statement).toContain(
      "Scheduler lifecycle should stay plist-only",
    );
    expect(parsed.candidate?.evidence_refs).toContain("commit:2a91de0");
    expect(parsed.privacy.auto_writes_memory).toBe(false);
    expect(parsed.privacy.external_calls).toBe(false);
    expect(json).not.toContain("Make this better");
    expect(json).not.toContain("/Users/example");

    const text = loopMemoryCandidateForCli({ dataDir });

    expect(text).toContain("Loop memory candidate eligible");
    expect(text).toContain("reason passed_with_evidence");
    expect(text).toContain("Next: review and approve before writing memory");
    expect(text).not.toContain("Make this better");
    expect(text).not.toContain("/Users/example");
  });

  it("guides first-time loop memory users through prompt capture, collect, and outcome evidence", () => {
    const dataDir = createTempDir();
    initializePromptLane({ dataDir });

    expect(() => loopMemoryCandidateForCli({ dataDir })).toThrow(
      "No loop snapshot found. Send one Codex or Claude Code prompt, run `promptlane coach` to confirm the first score, run `promptlane loop collect`, then record a passed loop outcome with safe evidence before retrying `promptlane loop memory-candidate`.",
    );
  });

  it("records an approved memory from the latest eligible candidate", async () => {
    const dataDir = createTempDir();
    await seedPrompts(dataDir);
    const snapshot = JSON.parse(
      loopCollectForCli({
        dataDir,
        json: true,
        cwdPrefix: "/Users/example/private-project",
        now: new Date("2026-07-04T01:00:00.000Z"),
        cwd: "/Users/example/private-project",
      }),
    ) as { id: string };
    seedLoopOutcome(dataDir, snapshot.id);

    const json = loopMemoryApproveForCli({
      dataDir,
      json: true,
      approvedBy: "user",
    });
    const parsed = JSON.parse(json) as {
      recorded: boolean;
      memory: { statement: string; evidence_refs: string[] };
      next_actions?: string[];
      privacy: { writes_instruction_files: boolean };
    };

    expect(parsed.recorded).toBe(true);
    expect(parsed.memory.statement).toContain(
      "Scheduler lifecycle should stay plist-only",
    );
    expect(parsed.memory.evidence_refs).toContain("commit:2a91de0");
    expect(parsed.next_actions).toEqual([
      "promptlane loop brief",
      "promptlane loop instruction-patch --target-file AGENTS.md",
    ]);
    expect(parsed.privacy.writes_instruction_files).toBe(false);
    expect(json).not.toContain("Make this better");
    expect(json).not.toContain("/Users/example");

    const text = loopMemoryApproveForCli({ dataDir, approvedBy: "user" });

    expect(text).toContain("Loop memory recorded");
    expect(text).toContain("approved by user");
    expect(text).toContain("Next: use recorded memory as local context");
    expect(text).toContain("- promptlane loop brief");
    expect(text).toContain(
      "- promptlane loop instruction-patch --target-file AGENTS.md",
    );
    expect(text).not.toContain("Make this better");
    expect(text).not.toContain("/Users/example");
  });

  it("proposes and approves memory for a selected worktree instead of global latest", async () => {
    const dataDir = createTempDir();
    await seedPrompts(dataDir);
    const selected = JSON.parse(
      loopCollectForCli({
        dataDir,
        json: true,
        cwdPrefix: "/Users/example/private-project",
        now: new Date("2026-07-04T01:00:00.000Z"),
        cwd: "/Users/example/private-project",
        worktree: "primary-worktree",
      }),
    ) as { id: string };
    seedLoopOutcome(dataDir, selected.id);
    seedNewerOtherWorktreeSnapshot(dataDir);

    const candidate = JSON.parse(
      loopMemoryCandidateForCli({
        dataDir,
        json: true,
        worktree: "primary-worktree",
      }),
    ) as { snapshot_id: string; candidate: { statement: string } };
    const approval = JSON.parse(
      loopMemoryApproveForCli({
        dataDir,
        json: true,
        approvedBy: "user",
        worktree: "primary-worktree",
      }),
    ) as { memory: { snapshot_id: string; statement: string } };

    expect(candidate.snapshot_id).toBe(selected.id);
    expect(candidate.candidate.statement).toContain("Scheduler lifecycle");
    expect(approval.memory.snapshot_id).toBe(selected.id);
    expect(approval.memory.statement).toContain("Scheduler lifecycle");
    expect(JSON.stringify({ candidate, approval })).not.toContain(
      "Other worktree has a newer snapshot.",
    );
  });

  it("rejects mixed snapshot-id and worktree memory selection", () => {
    expect(() =>
      loopMemoryCandidateForCli({
        dataDir: createTempDir(),
        snapshotId: "loop_selected",
        worktree: "primary-worktree",
      }),
    ).toThrow(
      "Use either --snapshot-id or worktree/session/branch filters, not both.",
    );
  });

  it("records and lists explicit local merge decisions without prompt bodies or raw paths", async () => {
    const dataDir = createTempDir();
    await seedPrompts(dataDir);
    loopCollectForCli({
      dataDir,
      cwdPrefix: "/Users/example/private-project",
      now: new Date("2026-07-04T01:00:00.000Z"),
      cwd: "/Users/example/private-project",
      worktree: "primary-worktree",
      branch: "codex/agent-loop-memory-design",
    });

    const json = loopDecisionRecordForCli({
      dataDir,
      json: true,
      worktree: "primary-worktree",
      decision: "continue",
      reason: "Need one more focused verification pass before merge.",
      decidedBy: "user",
      now: new Date("2026-07-04T01:30:00.000Z"),
    });
    const parsed = JSON.parse(json) as {
      recorded: boolean;
      decision: {
        id: string;
        worktree: string;
        decision: string;
        reason: string;
        decided_by: string;
        privacy: {
          local_only: boolean;
          stores_prompt_bodies: boolean;
          stores_raw_paths: boolean;
          writes_git_state: boolean;
          external_calls: boolean;
        };
      };
      next_action: string;
    };

    expect(parsed.recorded).toBe(true);
    expect(parsed.decision).toMatchObject({
      worktree: "primary-worktree",
      decision: "continue",
      reason: "Need one more focused verification pass before merge.",
      decided_by: "user",
      privacy: {
        local_only: true,
        stores_prompt_bodies: false,
        stores_raw_paths: false,
        writes_git_state: false,
        external_calls: false,
      },
    });
    expect(parsed.next_action).toBe(
      "review recorded merge decision before merge",
    );
    expect(json).not.toContain("Make this better");
    expect(json).not.toContain("/Users/example");

    const text = loopDecisionListForCli({ dataDir });

    expect(text).toContain("Loop merge decisions");
    expect(text).toContain("primary-worktree continue");
    expect(text).toContain(
      "Need one more focused verification pass before merge.",
    );
    expect(text).toContain(
      "Privacy: local-only, no prompt bodies, no raw paths, no git writes.",
    );
    expect(text).not.toContain("Make this better");
    expect(text).not.toContain("/Users/example");
  });

  it("rejects unsafe local merge decision reasons", async () => {
    const dataDir = createTempDir();
    await seedPrompts(dataDir);
    loopCollectForCli({
      dataDir,
      cwdPrefix: "/Users/example/private-project",
      now: new Date("2026-07-04T01:00:00.000Z"),
      cwd: "/Users/example/private-project",
      worktree: "primary-worktree",
    });

    expect(() =>
      loopDecisionRecordForCli({
        dataDir,
        worktree: "primary-worktree",
        decision: "continue",
        reason:
          "Check /Users/example/private-project/log.txt with sk-proj-secret",
      }),
    ).toThrow(
      "Loop merge decision reason must not include raw paths or secrets.",
    );
  });

  it("prints an instruction patch proposal from the latest approved memory without writing files", async () => {
    const dataDir = createTempDir();
    await seedPrompts(dataDir);
    const snapshot = JSON.parse(
      loopCollectForCli({
        dataDir,
        json: true,
        cwdPrefix: "/Users/example/private-project",
        now: new Date("2026-07-04T01:00:00.000Z"),
        cwd: "/Users/example/private-project",
      }),
    ) as { id: string };
    seedLoopOutcome(dataDir, snapshot.id);
    loopMemoryApproveForCli({ dataDir, approvedBy: "user" });

    const json = loopInstructionPatchForCli({
      dataDir,
      json: true,
      targetFile: "AGENTS.md",
    });
    const parsed = JSON.parse(json) as {
      target_file: string;
      writes_files: boolean;
      diff: string;
      privacy: { writes_instruction_files: boolean };
    };

    expect(parsed.target_file).toBe("AGENTS.md");
    expect(parsed.writes_files).toBe(false);
    expect(parsed.diff).toContain("## PromptLane Memories");
    expect(parsed.diff).toContain("Scheduler lifecycle should stay plist-only");
    expect(parsed.privacy.writes_instruction_files).toBe(false);
    expect(json).not.toContain("Make this better");
    expect(json).not.toContain("/Users/example");

    const text = loopInstructionPatchForCli({
      dataDir,
      targetFile: "AGENTS.md",
    });

    expect(text).toContain("Loop instruction patch proposal");
    expect(text).toContain("target AGENTS.md");
    expect(text).toContain("writes files no");
    expect(text).toContain("Next: review");
    expect(text).not.toContain("Make this better");
    expect(text).not.toContain("/Users/example");
  });

  it("guides instruction patch users to approve evidence-backed memory first", () => {
    const dataDir = createTempDir();
    initializePromptLane({ dataDir });

    expect(() =>
      loopInstructionPatchForCli({ dataDir, targetFile: "AGENTS.md" }),
    ).toThrow(
      "No loop memory found. Capture one Codex or Claude Code prompt, confirm the first score, collect a loop snapshot, record a passed outcome with safe evidence, then run `promptlane loop memory-approve` before retrying `promptlane loop instruction-patch --target-file AGENTS.md`.",
    );
  });

  it("applies an approved instruction patch only with explicit confirmation", async () => {
    const dataDir = createTempDir();
    const projectDir = createTempDir();
    writeFileSync(join(projectDir, "AGENTS.md"), "# Project Rules\n");
    await seedPrompts(dataDir);
    const snapshot = JSON.parse(
      loopCollectForCli({
        dataDir,
        json: true,
        cwdPrefix: "/Users/example/private-project",
        now: new Date("2026-07-04T01:00:00.000Z"),
        cwd: "/Users/example/private-project",
      }),
    ) as { id: string };
    seedLoopOutcome(dataDir, snapshot.id);
    loopMemoryApproveForCli({ dataDir, approvedBy: "user" });

    expect(() =>
      loopInstructionPatchApplyForCli({
        dataDir,
        targetDir: projectDir,
        targetFile: "AGENTS.md",
      }),
    ).toThrow("Instruction patch apply requires --confirm-apply.");

    const json = loopInstructionPatchApplyForCli({
      dataDir,
      json: true,
      targetDir: projectDir,
      targetFile: "AGENTS.md",
      confirmApply: true,
    });
    const parsed = JSON.parse(json) as {
      applied: boolean;
      writes_files: boolean;
      target_file: string;
      privacy: { writes_instruction_files: boolean };
    };

    expect(parsed).toMatchObject({
      applied: true,
      writes_files: true,
      target_file: "AGENTS.md",
      privacy: { writes_instruction_files: true },
    });
    expect(json).not.toContain(projectDir);
    expect(json).not.toContain("/Users/example");
    expect(readFileSync(join(projectDir, "AGENTS.md"), "utf8")).toContain(
      "source_memory:",
    );

    const text = loopInstructionPatchApplyForCli({
      dataDir,
      targetDir: projectDir,
      targetFile: "AGENTS.md",
      confirmApply: true,
    });

    expect(text).toContain("Loop instruction patch applied");
    expect(text).toContain("already present yes");
    expect(text).not.toContain(projectDir);
  });
});

async function seedPrompts(dataDir: string): Promise<void> {
  const init = initializePromptLane({ dataDir });
  const storage = createSqlitePromptStorage({
    dataDir,
    hmacSecret: init.hookAuth.web_session_secret,
    now: nextDate(["2026-07-04T00:58:00.000Z", "2026-07-04T00:59:00.000Z"]),
  });
  try {
    await storeClaudePrompt(
      storage,
      "Make this better",
      "2026-07-04T00:58:00.000Z",
    );
    await storeClaudePrompt(
      storage,
      "Implement the loop snapshot CLI, keep scope to storage and CLI, run the focused Vitest tests, and summarize risks.",
      "2026-07-04T00:59:00.000Z",
    );
  } finally {
    storage.close();
  }
}

async function storeClaudePrompt(
  storage: ReturnType<typeof createSqlitePromptStorage>,
  prompt: string,
  receivedAt: string,
): Promise<void> {
  const event = normalizeClaudeCodePayload(
    {
      session_id: "session-loop-cli",
      transcript_path: "/Users/example/.claude/session.jsonl",
      cwd: "/Users/example/private-project",
      permission_mode: "default",
      hook_event_name: "UserPromptSubmit",
      prompt,
    },
    new Date(receivedAt),
  );

  await storage.storePrompt({
    event,
    redaction: redactPrompt(event.prompt, "mask"),
  });
}

function seedCompactBoundary(dataDir: string): void {
  const init = initializePromptLane({ dataDir });
  const storage = createSqlitePromptStorage({
    dataDir,
    hmacSecret: init.hookAuth.web_session_secret,
    now: () => new Date("2026-07-04T01:05:00.000Z"),
  });
  try {
    storage.recordCompactBoundary({
      tool: "claude-code",
      event_name: "PostCompact",
      trigger: "auto",
      session_id: "session-loop-cli",
      cwd: "/Users/example/private-project",
      content: "Compact summary with sk-proj-secret and /Users/example.",
    });
  } finally {
    storage.close();
  }
}

function seedLoopOutcome(dataDir: string, snapshotId: string): void {
  const init = initializePromptLane({ dataDir });
  const storage = createSqlitePromptStorage({
    dataDir,
    hmacSecret: init.hookAuth.web_session_secret,
  });
  try {
    storage.recordLoopOutcome(snapshotId, {
      status: "passed",
      summary:
        "Scheduler lifecycle should stay plist-only unless the user explicitly asks for launchctl mutation.",
      evidence_refs: ["commit:2a91de0", "test:pnpm test"],
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
    const latest = storage.getLatestLoopSnapshot();
    if (!latest) return;
    storage.createLoopSnapshot({
      ...latest,
      id: "loop_newer_other_worktree",
      created_at: "2026-07-04T01:10:00.000Z",
      session_id: "session-other-cli",
      branch: "feature/other-loop",
      worktree_label: "other-worktree",
      outcome: {
        status: "passed",
        summary: "Other worktree has a newer snapshot.",
        evidence_refs: ["commit:other"],
      },
    });
  } finally {
    storage.close();
  }
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
      worktree_label: "primary-worktree",
    });
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

function nextDate(values: string[]): () => Date {
  let index = 0;
  return () => new Date(values[Math.min(index++, values.length - 1)]!);
}

function createTempDir(): string {
  const dir = join(tmpdir(), `promptlane-loop-${randomUUID()}`);
  mkdirSync(dir, { recursive: true });
  tempDirs.push(dir);
  return dir;
}
