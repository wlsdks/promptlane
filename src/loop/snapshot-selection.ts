import type { LoopSnapshot } from "./types.js";
import { deriveProjectLabel } from "../shared/project-label.js";
import { quoteForShell } from "../shared/shell-quote.js";

export type LoopSnapshotSelection = {
  worktree?: string;
  sessionId?: string;
  branch?: string;
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
