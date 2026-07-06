import type { Command } from "commander";

import { runPromptLaneMcpServer } from "../../mcp/server.js";

type McpCliOptions = {
  dataDir?: string;
};

export function registerMcpCommand(program: Command): void {
  program
    .command("mcp")
    .description("Run the local PromptLane MCP server over stdio.")
    .option("--data-dir <path>", "Override the promptlane data directory.")
    .action(async (options: McpCliOptions) => {
      await runPromptLaneMcpServer({ dataDir: options.dataDir });
    });
}
