import type { Command } from "commander";

import { loadHookAuth, loadLoopRelayConfig } from "../../config/config.js";
import { createActionInboxFromStorage } from "../../loop/action-inbox-service.js";
import { createSqlitePromptStorage } from "../../storage/sqlite.js";

type ActionOptions = { dataDir?: string; json?: boolean };

export function registerLoopActionsCommand(loop: Command): void {
  loop
    .command("actions")
    .description("Show local outcomes and the next explicit operator actions.")
    .option("--data-dir <path>", "Override the looprelay data directory.")
    .option("--json", "Print JSON.")
    .action((options: ActionOptions) =>
      console.log(loopActionsForCli(options)),
    );
}

export function loopActionsForCli(options: ActionOptions = {}): string {
  const config = loadLoopRelayConfig(options.dataDir);
  const auth = loadHookAuth(options.dataDir);
  const storage = createSqlitePromptStorage({
    dataDir: config.data_dir,
    hmacSecret: auth.web_session_secret,
  });
  try {
    const report = createActionInboxFromStorage(storage);
    if (options.json) return JSON.stringify(report, null, 2);
    const patterns = report.failure_patterns.map(
      (pattern) =>
        `- ${pattern.category}: ${pattern.total} confirmed · ${sessionCount(pattern.session_count)} · ${pattern.open} open · ${pattern.resolved} resolved${pattern.recurring ? " · recurring" : ""}`,
    );
    if (report.items.length === 0) {
      return [
        `Action inbox is clear. Local outcomes: ${report.outcomes.length}.`,
        ...(patterns.length > 0 ? ["Failure patterns:", ...patterns] : []),
      ].join("\n");
    }
    const lines = report.items.map(
      (item) =>
        `- [${item.priority}] ${item.title} · ${item.project}\n  ${item.reason}\n  ${item.next_action}`,
    );
    return [
      `Action inbox: ${report.summary.total} open · ${report.summary.critical} critical`,
      ...lines,
      ...(patterns.length > 0 ? ["Failure patterns:", ...patterns] : []),
    ].join("\n");
  } finally {
    storage.close();
  }
}

function sessionCount(count: number): string {
  return `${count} session${count === 1 ? "" : "s"}`;
}
