import { describe, expect, it } from "vitest";

import { decideLoopMemoryCandidate } from "./memory-candidate.js";
import type { LoopSnapshot } from "./types.js";

describe("decideLoopMemoryCandidate", () => {
  it("proposes a local memory candidate from a passed loop with evidence", () => {
    const decision = decideLoopMemoryCandidate(
      loopSnapshot({
        outcome: {
          status: "passed",
          summary:
            "Scheduler lifecycle should stay plist-only unless the user explicitly asks for launchctl mutation.",
          evidence_refs: ["commit:2a91de0", "test:pnpm test"],
        },
      }),
    );

    expect(decision).toMatchObject({
      eligible: true,
      reason: "passed_with_evidence",
      candidate: {
        title: "Remember loop outcome for private-project",
        scope: "project",
        statement:
          "Scheduler lifecycle should stay plist-only unless the user explicitly asks for launchctl mutation.",
        evidence_refs: ["commit:2a91de0", "test:pnpm test"],
      },
      privacy: {
        local_only: true,
        external_calls: false,
        stores_prompt_bodies: false,
        stores_raw_paths: false,
        auto_writes_memory: false,
      },
    });
    expect(JSON.stringify(decision)).not.toContain("/Users/example");
    expect(JSON.stringify(decision)).not.toContain("Make this better");
  });

  it("rejects loops that are not passed", () => {
    const decision = decideLoopMemoryCandidate(
      loopSnapshot({
        outcome: {
          status: "failed",
          summary: "The test failed and needs another attempt.",
          evidence_refs: ["test:pnpm test"],
        },
      }),
    );

    expect(decision.eligible).toBe(false);
    expect(decision.reason).toBe("outcome_not_passed");
    expect(decision.candidate).toBeUndefined();
  });

  it("rejects passed loops without evidence references", () => {
    const decision = decideLoopMemoryCandidate(
      loopSnapshot({
        outcome: {
          status: "passed",
          summary: "A claim without evidence should not become memory.",
          evidence_refs: [],
        },
      }),
    );

    expect(decision.eligible).toBe(false);
    expect(decision.reason).toBe("missing_evidence");
    expect(decision.candidate).toBeUndefined();
  });

  it("rejects summaries that look like raw paths or secrets", () => {
    const decision = decideLoopMemoryCandidate(
      loopSnapshot({
        outcome: {
          status: "passed",
          summary:
            "Use /Users/example/private-project and sk-proj-secret in the next loop.",
          evidence_refs: ["commit:2a91de0"],
        },
      }),
    );

    expect(decision.eligible).toBe(false);
    expect(decision.reason).toBe("unsafe_summary");
    expect(JSON.stringify(decision)).not.toContain("/Users/example");
    expect(JSON.stringify(decision)).not.toContain("sk-proj-secret");
  });
});

function loopSnapshot(patch: Partial<LoopSnapshot>): LoopSnapshot {
  return {
    id: "loop_123",
    created_at: "2026-07-04T01:00:00.000Z",
    tool: "codex",
    source: "cli",
    session_id: "session-a",
    cwd_label: "private-project",
    project_id: "proj_abc",
    git_root_hash: "git_123",
    branch: "codex/agent-loop-memory-design",
    worktree_label: "worktree-agent-loop",
    prompt_ids: ["prmt_weak", "prmt_strong"],
    event_counts: {
      prompts: 2,
    },
    quality: {
      average_prompt_score: 58,
      top_gaps: [],
      unresolved_questions: [],
    },
    outcome: {
      status: "unknown",
      summary: "Loop snapshot collected from 2 prompts.",
      evidence_refs: ["prompt:prmt_weak", "prompt:prmt_strong"],
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
