import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import type { LoopMemory } from "../storage/loop-memories.js";

export type InstructionPatchTargetFile = "AGENTS.md" | "CLAUDE.md";

export type InstructionPatchProposal = {
  target_file: InstructionPatchTargetFile;
  patch_kind: "append_section";
  title: string;
  diff: string;
  writes_files: false;
  requires_user_approval: true;
  source_memory_id: string;
  next_action: string;
  apply_gate: {
    web_apply_available: false;
    confirm_command: string;
    mcp_tool: "apply_instruction_patch";
    reason: string;
  };
  privacy: {
    local_only: true;
    external_calls: false;
    returns_prompt_bodies: false;
    returns_raw_paths: false;
    writes_instruction_files: false;
  };
};

export type InstructionPatchApplyResult = {
  target_file: InstructionPatchTargetFile;
  applied: boolean;
  already_present: boolean;
  writes_files: true;
  requires_user_approval: false;
  source_memory_id: string;
  next_action: string;
  privacy: {
    local_only: true;
    external_calls: false;
    returns_prompt_bodies: false;
    returns_raw_paths: false;
    writes_instruction_files: true;
  };
};

export function proposeInstructionPatchFromMemory(input: {
  memory: LoopMemory;
  targetFile: string;
}): InstructionPatchProposal {
  const targetFile = parseInstructionPatchTarget(input.targetFile);
  const statement = safePatchLine(input.memory.statement);
  const evidenceRefs = input.memory.evidence_refs.map(safePatchLine);
  const evidence =
    evidenceRefs.length > 0 ? evidenceRefs.join(", ") : "approved-loop-memory";
  const approvedBy = safePatchLine(input.memory.approved_by);
  const sourceMemoryId = safePatchLine(input.memory.id);
  const patchLines = [
    `--- a/${targetFile}`,
    `+++ b/${targetFile}`,
    "@@",
    "+## Loopdeck Memories",
    "+",
    `+- ${statement}`,
    `+  evidence: ${evidence}`,
    `+  approved_by: ${approvedBy}`,
    `+  source_memory: ${sourceMemoryId}`,
  ];

  return {
    target_file: targetFile,
    patch_kind: "append_section",
    title: `Append approved Loopdeck memory to ${targetFile}`,
    diff: `${patchLines.join("\n")}\n`,
    writes_files: false,
    requires_user_approval: true,
    source_memory_id: input.memory.id,
    next_action:
      "review this patch proposal, then apply it manually only if the instruction belongs in the project",
    apply_gate: {
      web_apply_available: false,
      confirm_command: `prompt-coach loop instruction-apply --target-file ${targetFile} --confirm-apply`,
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
  };
}

export function applyInstructionPatchFromMemory(input: {
  memory: LoopMemory;
  targetDir: string;
  targetFile: string;
  confirmApply: boolean;
}): InstructionPatchApplyResult {
  if (!input.confirmApply) {
    throw new Error("Instruction patch apply requires explicit confirmation.");
  }

  const targetFile = parseInstructionPatchTarget(input.targetFile);
  const targetPath = join(input.targetDir, targetFile);
  const existing = existsSync(targetPath) ? readFileSync(targetPath, "utf8") : "";
  const sourceMemoryId = safePatchLine(input.memory.id);
  const alreadyPresent = existing.includes(`source_memory: ${sourceMemoryId}`);

  if (!alreadyPresent) {
    const block = formatInstructionMemoryBlock(input.memory);
    const separator = existing.trim().length === 0 ? "" : "\n\n";
    writeFileSync(targetPath, `${existing.trimEnd()}${separator}${block}\n`);
  }

  return {
    target_file: targetFile,
    applied: !alreadyPresent,
    already_present: alreadyPresent,
    writes_files: true,
    requires_user_approval: false,
    source_memory_id: input.memory.id,
    next_action: alreadyPresent
      ? "no file change needed; this memory is already present"
      : "review the instruction file diff before committing",
    privacy: {
      local_only: true,
      external_calls: false,
      returns_prompt_bodies: false,
      returns_raw_paths: false,
      writes_instruction_files: true,
    },
  };
}

export function parseInstructionPatchTarget(
  targetFile: string,
): InstructionPatchTargetFile {
  if (targetFile === "AGENTS.md" || targetFile === "CLAUDE.md") {
    return targetFile;
  }
  throw new Error("Instruction patch target must be AGENTS.md or CLAUDE.md.");
}

function safePatchLine(value: string): string {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (looksUnsafe(normalized)) {
    throw new Error(
      "Instruction patch proposal must not include raw paths or secrets.",
    );
  }
  return normalized || "n/a";
}

function formatInstructionMemoryBlock(memory: LoopMemory): string {
  const statement = safePatchLine(memory.statement);
  const evidenceRefs = memory.evidence_refs.map(safePatchLine);
  const evidence =
    evidenceRefs.length > 0 ? evidenceRefs.join(", ") : "approved-loop-memory";
  const approvedBy = safePatchLine(memory.approved_by);
  const sourceMemoryId = safePatchLine(memory.id);

  return [
    "## Loopdeck Memories",
    "",
    `- ${statement}`,
    `  evidence: ${evidence}`,
    `  approved_by: ${approvedBy}`,
    `  source_memory: ${sourceMemoryId}`,
  ].join("\n");
}

function looksUnsafe(value: string): boolean {
  return (
    /(?:^|\s)\/Users\/[^\s]+/.test(value) ||
    /(?:^|\s)\/home\/[^\s]+/.test(value) ||
    /sk-[a-z0-9_-]{6,}/i.test(value) ||
    /gh[pousr]_[a-z0-9_]{12,}/i.test(value)
  );
}
