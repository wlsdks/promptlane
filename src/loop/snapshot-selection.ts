import type { LoopSnapshot } from "./types.js";
import { deriveProjectLabel } from "../shared/project-label.js";
import { quoteForShell } from "../shared/shell-quote.js";

export type LoopSnapshotSelection = {
  worktree?: string;
  sessionId?: string;
  branch?: string;
};

export type LoopSnapshotTarget = LoopSnapshotSelection & {
  snapshotId?: string;
};

export function hasLoopSnapshotSelection(
  selection: LoopSnapshotSelection,
): boolean {
  return Boolean(selection.worktree || selection.sessionId || selection.branch);
}

export function selectLoopSnapshot(
  snapshots: readonly LoopSnapshot[],
  selection: LoopSnapshotSelection,
): LoopSnapshot | undefined {
  return snapshots.find((snapshot) => {
    if (selection.worktree && snapshot.worktree_label !== selection.worktree) {
      return false;
    }
    if (selection.sessionId && snapshot.session_id !== selection.sessionId) {
      return false;
    }
    if (selection.branch && snapshot.branch !== selection.branch) {
      return false;
    }
    return true;
  });
}

export function hasAmbiguousLoopSnapshotTarget(
  target: LoopSnapshotTarget,
): boolean {
  return Boolean(target.snapshotId && hasLoopSnapshotSelection(target));
}

export function selectLoopSnapshotTarget(
  snapshots: readonly LoopSnapshot[],
  target: LoopSnapshotTarget,
): LoopSnapshot | undefined {
  if (target.snapshotId) {
    return snapshots.find((snapshot) => snapshot.id === target.snapshotId);
  }
  if (hasLoopSnapshotSelection(target)) {
    return selectLoopSnapshot(snapshots, target);
  }
  return snapshots.at(0);
}

export function selectedLoopSnapshotNotFoundMessage(
  selection: LoopSnapshotSelection,
): string {
  return `No loop snapshot matched the selected worktree/session/branch filters. ${selectedLoopSnapshotRecoveryAction(selection)}`;
}

export function loopBriefNoSnapshotCliMessage(): string {
  return "No loop snapshot found. Send one Codex or Claude Code prompt, run `promptlane coach` to confirm the first score, then run `promptlane loop collect` before retrying `promptlane loop brief`.";
}

export function loopBriefNoSnapshotMcpMessage(): string {
  return "No loop snapshot found. Send one Codex or Claude Code prompt, call coach_prompt or rerun get_promptlane_status to confirm the first score, then run `promptlane loop collect` before retrying prepare_loop_brief.";
}

export function loopOutcomeNoSnapshotMcpMessage(tool: string): string {
  return `No loop snapshot found. Send one Codex or Claude Code prompt, call coach_prompt or rerun get_promptlane_status to confirm the first score, then run \`promptlane loop collect\` before retrying ${tool}.`;
}

export function loopMemoryNoSnapshotCliMessage(command: string): string {
  return `No loop snapshot found. Send one Codex or Claude Code prompt, run \`promptlane coach\` to confirm the first score, run \`promptlane loop collect\`, then record a passed loop outcome with safe evidence before retrying \`${command}\`.`;
}

export function loopMemoryNoSnapshotMcpMessage(tool: string): string {
  return `No loop snapshot found. Send one Codex or Claude Code prompt, call coach_prompt or rerun get_promptlane_status to confirm the first score, run \`promptlane loop collect\`, then record a passed loop outcome with safe evidence before retrying ${tool}.`;
}

export function loopInstructionPatchNoMemoryCliMessage(
  command: string,
): string {
  return `No loop memory found. Capture one Codex or Claude Code prompt, confirm the first score, collect a loop snapshot, record a passed outcome with safe evidence, then run \`promptlane loop memory-approve\` before retrying \`${command}\`.`;
}

export function loopInstructionPatchNoMemoryMcpMessage(tool: string): string {
  return `No loop memory found. Capture one Codex or Claude Code prompt, call coach_prompt or rerun get_promptlane_status, collect a loop snapshot, record a passed outcome with safe evidence, then call record_loop_memory before retrying ${tool}.`;
}

function selectedLoopSnapshotRecoveryAction(
  selection: LoopSnapshotSelection,
): string {
  const collectCommand = ["promptlane", "loop", "collect"];
  if (selection.worktree) {
    collectCommand.push("--worktree", safeSelectionValue(selection.worktree));
  }
  if (selection.branch) {
    collectCommand.push("--branch", safeSelectionValue(selection.branch));
  }
  return `Run \`${collectCommand.map(quoteForShell).join(" ")}\` from that project, or retry \`promptlane loop brief\` with fewer filters.`;
}

function safeSelectionValue(value: string): string {
  return looksLikeRawPath(value)
    ? deriveProjectLabel(value, "selected-project")
    : value;
}

function looksLikeRawPath(value: string): boolean {
  return (
    value.startsWith("/") ||
    value.startsWith("~/") ||
    /^[A-Za-z]:[\\/]/.test(value)
  );
}
