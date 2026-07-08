#!/usr/bin/env node
import { spawnSync } from "node:child_process";

const args = process.argv.slice(2);
const jsonOutput = args.includes("--json");

const build = spawnSync("corepack", ["pnpm", "build"], {
  encoding: "utf8",
  stdio: ["ignore", "pipe", "pipe"],
});

if (build.status !== 0) {
  process.stderr.write(build.stdout ?? "");
  process.stderr.write(build.stderr ?? "");
  process.exit(build.status ?? 1);
}

if (!jsonOutput) {
  process.stdout.write(build.stdout ?? "");
}
process.stderr.write(build.stderr ?? "");

const benchmark = spawnSync(
  process.execPath,
  ["scripts/benchmark.mjs", ...args],
  {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  },
);

process.stdout.write(benchmark.stdout ?? "");
process.stderr.write(benchmark.stderr ?? "");

if (benchmark.error) {
  throw benchmark.error;
}

process.exit(benchmark.status ?? 0);
