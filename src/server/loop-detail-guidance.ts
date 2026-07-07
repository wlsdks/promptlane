import type { PromptLaneStatusActivityMergeReadiness } from "../loop/status.js";
import { quoteForShell } from "../shared/shell-quote.js";

type SnapshotAgeCandidate = {
  id: string;
  created_at: string;
};

export function selectionScopeFor(selection: {
  hasSession: boolean;
  hasBranch: boolean;
}): {
  label: "Selection scope";
  filters:
    | ["worktree"]
    | ["worktree", "session"]
    | ["worktree", "branch"]
    | ["worktree", "session", "branch"];
  reason:
    | "showing latest snapshots for selected worktree"
    | "showing snapshots filtered by selected worktree and session"
    | "showing snapshots filtered by selected worktree and branch"
    | "showing snapshots filtered by selected worktree, session, and branch";
  next_action:
    | "copy selected worktree brief"
    | "copy selected session brief"
    | "copy selected branch brief"
    | "copy selected session and branch brief";
} {
  if (selection.hasSession && selection.hasBranch) {
    return {
      label: "Selection scope",
      filters: ["worktree", "session", "branch"],
      reason:
        "showing snapshots filtered by selected worktree, session, and branch",
      next_action: "copy selected session and branch brief",
    };
  }

  if (selection.hasSession) {
    return {
      label: "Selection scope",
      filters: ["worktree", "session"],
      reason: "showing snapshots filtered by selected worktree and session",
      next_action: "copy selected session brief",
    };
  }

  if (selection.hasBranch) {
    return {
      label: "Selection scope",
      filters: ["worktree", "branch"],
      reason: "showing snapshots filtered by selected worktree and branch",
      next_action: "copy selected branch brief",
    };
  }

  return {
    label: "Selection scope",
    filters: ["worktree"],
    reason: "showing latest snapshots for selected worktree",
    next_action: "copy selected worktree brief",
  };
}

export function selectedBriefActionFor(selection: {
  worktree: string;
  sessionId?: string;
  branch?: string;
}): {
  label: "Selected brief action";
  action: "copy selected continuation brief";
  reason: "uses the selected worktree/session/branch filters without auto-submitting";
  command: string;
  writes_files: false;
  external_calls: false;
} {
  return {
    label: "Selected brief action",
    action: "copy selected continuation brief",
    reason:
      "uses the selected worktree/session/branch filters without auto-submitting",
    command: selectedBriefCommand(selection),
    writes_files: false,
    external_calls: false,
  };
}

export function commandHintProvenance(): {
  label: "Command provenance";
  source: "existing command-center continuation command";
  reason: "reuses safe selected worktree metadata without reading git or executing commands";
  writes_files: false;
  external_calls: false;
} {
  return {
    label: "Command provenance",
    source: "existing command-center continuation command",
    reason:
      "reuses safe selected worktree metadata without reading git or executing commands",
    writes_files: false,
    external_calls: false,
  };
}

export function commandDistinctionFor(): {
  label: "Command distinction";
  selected_command_role: "continue the selected worktree/session/branch filters";
  review_command_role: "copy the review packet command-center hint for merge review";
  reason: "selected continuation and review packet commands can differ when session or branch filters are active";
  writes_files: false;
  external_calls: false;
} {
  return {
    label: "Command distinction",
    selected_command_role:
      "continue the selected worktree/session/branch filters",
    review_command_role:
      "copy the review packet command-center hint for merge review",
    reason:
      "selected continuation and review packet commands can differ when session or branch filters are active",
    writes_files: false,
    external_calls: false,
  };
}

export function commandFiltersFor(input: {
  hasSession: boolean;
  hasBranch: boolean;
  reviewHasBranch: boolean;
}): {
  label: "Command filters";
  selected_command_filters:
    | ["worktree"]
    | ["worktree", "session"]
    | ["worktree", "branch"]
    | ["worktree", "session", "branch"];
  review_command_filters: ["worktree"] | ["worktree", "branch"];
  reason: "selected command reflects the current selection while review command reflects command-center review scope";
  writes_files: false;
  external_calls: false;
} {
  const selectedCommandFilters:
    | ["worktree"]
    | ["worktree", "session"]
    | ["worktree", "branch"]
    | ["worktree", "session", "branch"] =
    input.hasSession && input.hasBranch
      ? ["worktree", "session", "branch"]
      : input.hasSession
        ? ["worktree", "session"]
        : input.hasBranch
          ? ["worktree", "branch"]
          : ["worktree"];

  return {
    label: "Command filters",
    selected_command_filters: selectedCommandFilters,
    review_command_filters: input.reviewHasBranch
      ? ["worktree", "branch"]
      : ["worktree"],
    reason:
      "selected command reflects the current selection while review command reflects command-center review scope",
    writes_files: false,
    external_calls: false,
  };
}

export function copySideEffectsFor(): {
  label: "Copy side effects";
  clipboard: "copies the selected continuation brief to the local clipboard";
  ui_feedback: "temporarily marks the selected brief copy button as copied";
  does_not: "does not write files, execute commands, call external services, submit prompts, or change merge state";
  writes_files: false;
  external_calls: false;
} {
  return {
    label: "Copy side effects",
    clipboard: "copies the selected continuation brief to the local clipboard",
    ui_feedback: "temporarily marks the selected brief copy button as copied",
    does_not:
      "does not write files, execute commands, call external services, submit prompts, or change merge state",
    writes_files: false,
    external_calls: false,
  };
}

export function snapshotAgeFor(input: {
  selectedSnapshot: SnapshotAgeCandidate;
  snapshots: readonly SnapshotAgeCandidate[];
}): {
  label: "Selected snapshot age";
  latest_selected_created_at: string;
  status: "latest" | "older_than_latest";
  reason:
    | "selected snapshot is the latest recorded loop snapshot"
    | "another loop snapshot was recorded after this selection";
  next_action:
    | "copy selected worktree brief"
    | "refresh selected worktree before merging";
} {
  const latestRecordedSnapshot =
    input.snapshots.reduce<SnapshotAgeCandidate | undefined>(
      (latest, snapshot) => {
        if (!latest || snapshot.created_at > latest.created_at) return snapshot;
        return latest;
      },
      undefined,
    ) ?? input.selectedSnapshot;

  if (latestRecordedSnapshot.id === input.selectedSnapshot.id) {
    return {
      label: "Selected snapshot age",
      latest_selected_created_at: input.selectedSnapshot.created_at,
      status: "latest",
      reason: "selected snapshot is the latest recorded loop snapshot",
      next_action: "copy selected worktree brief",
    };
  }

  return {
    label: "Selected snapshot age",
    latest_selected_created_at: input.selectedSnapshot.created_at,
    status: "older_than_latest",
    reason: "another loop snapshot was recorded after this selection",
    next_action: "refresh selected worktree before merging",
  };
}

export function readinessSummaryFor(
  mergeReadiness: PromptLaneStatusActivityMergeReadiness,
): {
  label: "Readiness summary";
  status: PromptLaneStatusActivityMergeReadiness["status"];
  reason:
    | "selected worktree has recorded evidence and passing outcome"
    | "latest selected worktree outcome is not passing"
    | "latest selected worktree outcome has no evidence refs";
  next_action: PromptLaneStatusActivityMergeReadiness["next_action"];
} {
  if (mergeReadiness.status === "missing_evidence") {
    return {
      label: "Readiness summary",
      status: mergeReadiness.status,
      reason: "latest selected worktree outcome has no evidence refs",
      next_action: mergeReadiness.next_action,
    };
  }

  if (mergeReadiness.status === "needs_review") {
    return {
      label: "Readiness summary",
      status: mergeReadiness.status,
      reason: "latest selected worktree outcome is not passing",
      next_action: mergeReadiness.next_action,
    };
  }

  return {
    label: "Readiness summary",
    status: mergeReadiness.status,
    reason: "selected worktree has recorded evidence and passing outcome",
    next_action: mergeReadiness.next_action,
  };
}

export function evidenceCountExplanationFor(evidenceCount: number): {
  label: "Evidence count";
  count: number;
  reason:
    | "selected worktree has evidence refs recorded"
    | "selected worktree has no evidence refs recorded";
  next_action: "compare evidence before merge" | "record loop outcome evidence";
} {
  if (evidenceCount === 0) {
    return {
      label: "Evidence count",
      count: evidenceCount,
      reason: "selected worktree has no evidence refs recorded",
      next_action: "record loop outcome evidence",
    };
  }

  return {
    label: "Evidence count",
    count: evidenceCount,
    reason: "selected worktree has evidence refs recorded",
    next_action: "compare evidence before merge",
  };
}

function selectedBriefCommand(selection: {
  worktree: string;
  sessionId?: string;
  branch?: string;
}): string {
  const parts = [
    "promptlane",
    "loop",
    "brief",
    "--worktree",
    selection.worktree,
  ];
  if (selection.sessionId) parts.push("--session", selection.sessionId);
  if (selection.branch) parts.push("--branch", selection.branch);
  return parts.map(quoteForShell).join(" ");
}
