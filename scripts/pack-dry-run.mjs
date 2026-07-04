#!/usr/bin/env node
import { spawnSync } from "node:child_process";

run("corepack", ["pnpm", "build"], process.env);

const npmEnv = { ...process.env };
delete npmEnv.npm_config_verify_deps_before_run;
delete npmEnv.npm_config__jsr_registry;
delete npmEnv.pnpm_config_verify_deps_before_run;
delete npmEnv.pnpm_config__jsr_registry;

run("npm", ["pack", "--dry-run", "--ignore-scripts"], npmEnv);

function run(command, args, env) {
  const result = spawnSync(command, args, {
    env,
    stdio: "inherit",
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}
