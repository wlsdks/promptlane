import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import {
  applyInstructionPatchFromMemory,
  proposeInstructionPatchFromMemory,
} from "./instruction-patch.js";
import type { LoopMemory } from "../storage/loop-memories.js";

describe("proposeInstructionPatchFromMemory", () => {
  it("builds a reviewable AGENTS.md patch proposal without writing files", () => {
    const proposal = proposeInstructionPatchFromMemory({
      memory: loopMemory({
        statement:
          "Scheduler lifecycle should stay plist-only unless the user explicitly asks for launchctl mutation.",
        evidence_refs: ["commit:568e2b4", "test:pnpm test"],
      }),
      targetFile: "AGENTS.md",
    });

    expect(proposal).toMatchObject({
      target_file: "AGENTS.md",
      writes_files: false,
      requires_user_approval: true,
      patch_kind: "append_section",
      privacy: {
        local_only: true,
        external_calls: false,
        returns_prompt_bodies: false,
        returns_raw_paths: false,
        writes_instruction_files: false,
      },
    });
    expect(proposal.diff).toContain("--- a/AGENTS.md");
    expect(proposal.diff).toContain("+++ b/AGENTS.md");
    expect(proposal.diff).toContain("## PromptLane Memories");
    expect(proposal.diff).toContain(
      "Scheduler lifecycle should stay plist-only",
    );
    expect(proposal.diff).toContain("evidence: commit:568e2b4, test:pnpm test");
    expect(proposal.next_action).toContain("review");
    expect(proposal.apply_gate).toEqual({
      web_apply_available: false,
      confirm_command:
        "promptlane loop instruction-apply --target-file AGENTS.md --confirm-apply",
      mcp_tool: "apply_instruction_patch",
      reason:
        "web review does not write files; apply through CLI or MCP with explicit confirmation",
    });
    expect(JSON.stringify(proposal)).not.toContain("/Users/example");
    expect(JSON.stringify(proposal)).not.toContain("Make this better");
  });

  it("rejects unsupported instruction targets", () => {
    expect(() =>
      proposeInstructionPatchFromMemory({
        memory: loopMemory(),
        targetFile: "README.md",
      }),
    ).toThrow("Instruction patch target must be AGENTS.md or CLAUDE.md.");
  });

  it("applies an approved memory to AGENTS.md only after explicit confirmation", () => {
    const targetDir = join(tmpdir(), `promptlane-instruction-${Date.now()}`);
    const targetPath = join(targetDir, "AGENTS.md");
    try {
      mkdirSync(targetDir, { recursive: true });
      writeFileSync(targetPath, "# Project Rules\n\nKeep changes focused.\n", {
        flag: "wx",
      });

      expect(() =>
        applyInstructionPatchFromMemory({
          memory: loopMemory(),
          targetDir,
          targetFile: "AGENTS.md",
          confirmApply: false,
        }),
      ).toThrow("Instruction patch apply requires explicit confirmation.");

      const result = applyInstructionPatchFromMemory({
        memory: loopMemory(),
        targetDir,
        targetFile: "AGENTS.md",
        confirmApply: true,
      });

      expect(result).toMatchObject({
        target_file: "AGENTS.md",
        applied: true,
        already_present: false,
        writes_files: true,
        requires_user_approval: false,
        source_memory_id: "mem_123",
        privacy: {
          local_only: true,
          external_calls: false,
          returns_prompt_bodies: false,
          returns_raw_paths: false,
          writes_instruction_files: true,
        },
      });
      expect(JSON.stringify(result)).not.toContain(targetDir);
      expect(readFileSync(targetPath, "utf8")).toContain("## PromptLane Memories");
      expect(readFileSync(targetPath, "utf8")).toContain("source_memory: mem_123");

      const second = applyInstructionPatchFromMemory({
        memory: loopMemory(),
        targetDir,
        targetFile: "AGENTS.md",
        confirmApply: true,
      });

      expect(second.already_present).toBe(true);
      expect(readFileSync(targetPath, "utf8").match(/source_memory: mem_123/g)).toHaveLength(1);
    } finally {
      if (existsSync(targetDir)) rmSync(targetDir, { recursive: true, force: true });
    }
  });
});

function loopMemory(patch: Partial<LoopMemory> = {}): LoopMemory {
  return {
    id: "mem_123",
    snapshot_id: "loop_123",
    title: "Remember loop outcome for private-project",
    statement:
      "Use focused tests before full verification for loop memory changes.",
    evidence_refs: ["commit:568e2b4"],
    approved_by: "user",
    created_at: "2026-07-04T02:00:00.000Z",
    privacy: {
      local_only: true,
      stores_prompt_bodies: false,
      stores_raw_paths: false,
      writes_instruction_files: false,
      external_calls: false,
    },
    ...patch,
  };
}
