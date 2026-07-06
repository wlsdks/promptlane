import type { Command } from "commander";

import { initializePromptLane } from "../../config/config.js";

export function registerInitCommand(program: Command): void {
  program
    .command("init")
    .description("Initialize promptlane config and local data directories.")
    .option("--data-dir <path>", "Override the promptlane data directory.")
    .action((options: { dataDir?: string }) => {
      const result = initializePromptLane({ dataDir: options.dataDir });

      console.log(`Initialized promptlane at ${result.config.data_dir}`);
    });
}
