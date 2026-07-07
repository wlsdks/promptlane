import type { QualityDashboard, SettingsResponse } from "./api.js";

export type SetupCheckStatus = "good" | "attention" | "pending";

export type SetupCheck = {
  detail: string;
  label: string;
  status: SetupCheckStatus;
};

export function buildSetupChecks({
  dashboard,
  health,
  settings,
}: {
  dashboard?: QualityDashboard;
  health?: { ok: boolean; version: string };
  settings?: SettingsResponse;
}): SetupCheck[] {
  const redactionMode = settings?.redaction_mode;
  const lastIngest = settings?.last_ingest_status;
  const promptCount = dashboard?.total_prompts ?? 0;
  const usefulCount = dashboard?.useful_prompts.length ?? 0;

  return [
    {
      label: "Local server",
      status: health?.ok ? "good" : "pending",
      detail: health?.ok
        ? `version ${health.version}`
        : "Checking server status.",
    },
    {
      label: "Local storage",
      status: settings?.data_dir ? "good" : "pending",
      detail: settings?.data_dir
        ? displayLocalPath(settings.data_dir)
        : "Checking data directory.",
    },
    {
      label: "Redaction",
      status:
        redactionMode && redactionMode !== "raw"
          ? "good"
          : redactionMode === "raw"
            ? "attention"
            : "pending",
      detail: redactionMode
        ? `${redactionMode} mode`
        : "Checking storage policy.",
    },
    {
      label: "Hook Capture",
      status: lastIngest?.ok ? "good" : lastIngest ? "attention" : "pending",
      detail: lastIngest
        ? `${lastIngest.ok ? "last delivery succeeded" : "last delivery failed"} ${
            lastIngest.status ?? ""
          }`.trim()
        : "Run promptlane setup --profile coach, then send one Codex or Claude Code prompt.",
    },
    {
      label: "First prompt stored",
      status: promptCount > 0 ? "good" : "pending",
      detail:
        promptCount > 0
          ? `${promptCount} stored`
          : "Send one Codex or Claude Code prompt after setup.",
    },
    {
      label: "Reuse loop",
      status: usefulCount > 0 ? "good" : "pending",
      detail:
        usefulCount > 0
          ? `${usefulCount} reuse candidates`
          : "Copy or save an improved draft from Coach to start reuse.",
    },
  ];
}

export function setupStatusLabel(status: SetupCheckStatus): string {
  if (status === "good") return "OK";
  if (status === "attention") return "Needs attention";
  return "Waiting";
}

export function displayLocalPath(path?: string): string {
  if (!path) {
    return "-";
  }

  const normalized = path.replace(/\\/g, "/").replace(/\/+$/, "");
  const parts = normalized.split("/").filter(Boolean);
  const last = parts.at(-1);

  if (!last) {
    return "[local path]";
  }

  return `[local path]/${last}`;
}
