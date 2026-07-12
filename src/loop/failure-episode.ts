import { detectSensitiveValues } from "../redaction/detectors.js";

export type FailureEpisodeCategory =
  | "setup"
  | "validation"
  | "context_loss"
  | "selection"
  | "permission"
  | "tooling"
  | "data_integrity"
  | "other";

export type FailureEpisodeStatus = "open" | "resolved" | "wont_fix";

export type FailureEpisodePatternCounts = {
  category: FailureEpisodeCategory;
  total: number;
  session_count: number;
  open: number;
  resolved: number;
  wont_fix: number;
  last_confirmed_at: string;
};

export type FailureEpisode = {
  id: string;
  snapshot_id: string;
  project_id: string;
  category: FailureEpisodeCategory;
  status: FailureEpisodeStatus;
  intervention: string;
  resolution?: string;
  confirmed_by: string;
  confirmed_at: string;
  resolved_at?: string;
  privacy: {
    local_only: true;
    stores_prompt_bodies: false;
    stores_raw_paths: false;
    stores_transcripts: false;
    inferred: false;
  };
};

export type RecordFailureEpisodeInput = Pick<
  FailureEpisode,
  | "snapshot_id"
  | "category"
  | "status"
  | "intervention"
  | "resolution"
  | "confirmed_by"
>;

export type FailureEpisodeInputResult =
  | { ok: true; input: RecordFailureEpisodeInput }
  | { ok: false; message: string };

const CATEGORIES: FailureEpisodeCategory[] = [
  "setup",
  "validation",
  "context_loss",
  "selection",
  "permission",
  "tooling",
  "data_integrity",
  "other",
];
const STATUSES: FailureEpisodeStatus[] = ["open", "resolved", "wont_fix"];

export function parseFailureEpisodeInput(
  value: unknown,
): FailureEpisodeInputResult {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return invalid("Failure episode input must be an object.");
  }
  const record = value as Record<string, unknown>;
  const snapshotId = stringValue(record.snapshot_id);
  const intervention = stringValue(record.intervention);
  const resolution = stringValue(record.resolution);
  const confirmedBy = stringValue(record.confirmed_by) || "user";
  if (!snapshotId || !isCategory(record.category) || !isStatus(record.status)) {
    return invalid(
      "Failure episode requires snapshot_id, a supported category, and open, resolved, or wont_fix status.",
    );
  }
  if (!intervention) {
    return invalid("Failure episode intervention must not be empty.");
  }
  if (record.status === "resolved" && !resolution) {
    return invalid("Resolved failure episodes require a resolution.");
  }
  const texts = [snapshotId, intervention, resolution, confirmedBy].filter(
    Boolean,
  );
  if (texts.some((text) => text.length > 500)) {
    return invalid("Failure episode text must be at most 500 characters.");
  }
  if (texts.some((text) => detectSensitiveValues(text).length > 0)) {
    return invalid(
      "Failure episode metadata must not include secrets or raw local paths.",
    );
  }
  return {
    ok: true,
    input: {
      snapshot_id: snapshotId,
      category: record.category,
      status: record.status,
      intervention,
      ...(resolution ? { resolution } : {}),
      confirmed_by: confirmedBy,
    },
  };
}

export function failureEpisodePrivacy(): FailureEpisode["privacy"] {
  return {
    local_only: true,
    stores_prompt_bodies: false,
    stores_raw_paths: false,
    stores_transcripts: false,
    inferred: false,
  };
}

function isCategory(value: unknown): value is FailureEpisodeCategory {
  return CATEGORIES.includes(value as FailureEpisodeCategory);
}

function isStatus(value: unknown): value is FailureEpisodeStatus {
  return STATUSES.includes(value as FailureEpisodeStatus);
}

function stringValue(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function invalid(message: string): FailureEpisodeInputResult {
  return { ok: false, message };
}
