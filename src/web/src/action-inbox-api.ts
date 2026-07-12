import { ensureSession, failApi, getApiCsrfToken } from "./api.js";

export type ActionInboxItem = {
  id: string;
  kind:
    | "close_loop"
    | "confirm_failure"
    | "resolve_failure"
    | "complete_continuation"
    | "verify_evidence"
    | "review_memory";
  priority: "critical" | "high" | "normal";
  snapshot_id: string;
  project_id: string;
  project: string;
  worktree?: string;
  branch?: string;
  created_at: string;
  title: string;
  reason: string;
  next_action: string;
  source: "operator_local";
  failure_category?: FailureEpisodeInput["category"];
  current_intervention?: string;
};

export type LocalOutcomeSummary = {
  snapshot_id: string;
  project_id: string;
  project: string;
  worktree?: string;
  branch?: string;
  created_at: string;
  status: "passed" | "failed" | "blocked" | "abandoned";
  evidence_count: number;
  locally_verified_evidence: number;
  declared_evidence: number;
  continuation_status?: string;
  failure_episode_status?: "open" | "resolved" | "wont_fix";
  failure_category?: string;
  memory_approved: boolean;
};

export type ActionInboxReport = {
  generated_at: string;
  summary: {
    total: number;
    critical: number;
    failure_review: number;
    continuation_debt: number;
    evidence_debt: number;
    memory_review: number;
    recurring_failure_categories: number;
  };
  items: ActionInboxItem[];
  outcomes: LocalOutcomeSummary[];
  failure_patterns: Array<{
    category: FailureEpisodeInput["category"];
    total: number;
    session_count: number;
    open: number;
    resolved: number;
    wont_fix: number;
    recurring: boolean;
    last_confirmed_at: string;
  }>;
  privacy: {
    local_only: true;
    stores_prompt_bodies: false;
    stores_raw_paths: false;
    stores_transcripts: false;
    causal_claim: false;
  };
};

export type FailureEpisodeInput = {
  snapshot_id: string;
  category:
    | "setup"
    | "validation"
    | "context_loss"
    | "selection"
    | "permission"
    | "tooling"
    | "data_integrity"
    | "other";
  status: "open" | "resolved" | "wont_fix";
  intervention: string;
  resolution?: string;
  confirmed_by: string;
};

export async function getActionInbox(): Promise<ActionInboxReport> {
  await ensureSession();
  const response = await fetch("/api/v1/actions", {
    credentials: "same-origin",
  });
  if (!response.ok) await failApi(response, "Action inbox failed");
  const body = (await response.json()) as { data?: unknown };
  if (!isActionInboxReport(body.data)) {
    throw new Error("Action inbox failed: Invalid response.");
  }
  return body.data;
}

export async function recordFailureEpisode(
  input: FailureEpisodeInput,
): Promise<void> {
  const csrf = await getApiCsrfToken();
  const response = await fetch("/api/v1/failure-episodes", {
    method: "POST",
    credentials: "same-origin",
    headers: { "content-type": "application/json", "x-csrf-token": csrf },
    body: JSON.stringify(input),
  });
  if (!response.ok) await failApi(response, "Failure episode failed");
  const body = (await response.json()) as {
    data?: { recorded?: unknown; episode?: unknown };
  };
  if (body.data?.recorded !== true || !isFailureEpisode(body.data.episode)) {
    throw new Error("Failure episode failed: Invalid response.");
  }
}

function isActionInboxReport(value: unknown): value is ActionInboxReport {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const report = value as Partial<ActionInboxReport>;
  return (
    typeof report.generated_at === "string" &&
    isSummary(report.summary) &&
    Array.isArray(report.items) &&
    report.items.every(isActionItem) &&
    Array.isArray(report.outcomes) &&
    report.outcomes.every(isLocalOutcome) &&
    Array.isArray(report.failure_patterns) &&
    report.failure_patterns.every(isFailurePattern) &&
    report.privacy?.local_only === true &&
    report.privacy.stores_prompt_bodies === false &&
    report.privacy.stores_raw_paths === false &&
    report.privacy.stores_transcripts === false &&
    report.privacy.causal_claim === false
  );
}

function isSummary(value: unknown): value is ActionInboxReport["summary"] {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const summary = value as Record<string, unknown>;
  return [
    "total",
    "critical",
    "failure_review",
    "continuation_debt",
    "evidence_debt",
    "memory_review",
    "recurring_failure_categories",
  ].every((key) => typeof summary[key] === "number");
}

function isFailurePattern(value: unknown): boolean {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const pattern = value as Record<string, unknown>;
  return (
    typeof pattern.category === "string" &&
    typeof pattern.total === "number" &&
    typeof pattern.session_count === "number" &&
    typeof pattern.open === "number" &&
    typeof pattern.resolved === "number" &&
    typeof pattern.wont_fix === "number" &&
    typeof pattern.recurring === "boolean" &&
    typeof pattern.last_confirmed_at === "string"
  );
}

function isActionItem(value: unknown): value is ActionInboxItem {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.id === "string" &&
    [
      "close_loop",
      "confirm_failure",
      "resolve_failure",
      "complete_continuation",
      "verify_evidence",
      "review_memory",
    ].includes(item.kind as string) &&
    ["critical", "high", "normal"].includes(item.priority as string) &&
    typeof item.snapshot_id === "string" &&
    typeof item.project_id === "string" &&
    typeof item.project === "string" &&
    typeof item.created_at === "string" &&
    typeof item.title === "string" &&
    typeof item.reason === "string" &&
    typeof item.next_action === "string" &&
    item.source === "operator_local" &&
    (item.worktree === undefined || typeof item.worktree === "string") &&
    (item.branch === undefined || typeof item.branch === "string") &&
    (item.failure_category === undefined ||
      typeof item.failure_category === "string") &&
    (item.current_intervention === undefined ||
      typeof item.current_intervention === "string") &&
    item.prompt_body === undefined &&
    item.raw_path === undefined &&
    item.transcript === undefined
  );
}

function isLocalOutcome(value: unknown): value is LocalOutcomeSummary {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const outcome = value as Record<string, unknown>;
  return (
    typeof outcome.snapshot_id === "string" &&
    typeof outcome.project_id === "string" &&
    typeof outcome.project === "string" &&
    typeof outcome.created_at === "string" &&
    typeof outcome.status === "string" &&
    typeof outcome.evidence_count === "number" &&
    typeof outcome.locally_verified_evidence === "number" &&
    typeof outcome.declared_evidence === "number" &&
    typeof outcome.memory_approved === "boolean"
  );
}

function isFailureEpisode(value: unknown): boolean {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const episode = value as Record<string, unknown>;
  return (
    typeof episode.id === "string" &&
    typeof episode.snapshot_id === "string" &&
    typeof episode.category === "string" &&
    typeof episode.status === "string" &&
    typeof episode.intervention === "string" &&
    episode.privacy !== undefined
  );
}
