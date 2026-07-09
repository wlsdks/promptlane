import { randomUUID } from "node:crypto";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { describe, expect, it, vi } from "vitest";

import { benchmarkForCli } from "./benchmark.js";

describe("benchmark CLI command", () => {
  it("runs the shipped real benchmark and preserves no-fixtures evidence", () => {
    const runBenchmark = vi.fn(() => ({
      status: 0,
      stdout: JSON.stringify({
        dataset: "benchmark-v1-real",
        fixture_set: "real",
        status: "no_fixtures",
        evidence_state: {
          effectiveness: "unproven",
          release_blocking: false,
          requires_real_fixtures: true,
        },
      }),
      stderr: "",
    }));

    const output = benchmarkForCli(
      { fixtureSet: "real", json: true },
      runBenchmark,
    );

    expect(runBenchmark).toHaveBeenCalledWith([
      "--fixture-set",
      "real",
      "--json",
    ]);
    expect(JSON.parse(output)).toMatchObject({
      fixture_set: "real",
      status: "no_fixtures",
      evidence_state: {
        effectiveness: "unproven",
        release_blocking: false,
        requires_real_fixtures: true,
      },
    });
  });

  it("forwards an operator-owned real fixture file to the benchmark runtime", () => {
    const runBenchmark = vi.fn(() => ({
      status: 0,
      stdout: JSON.stringify({
        fixture_set: "real",
        status: "no_fixtures",
      }),
      stderr: "",
    }));

    benchmarkForCli(
      {
        fixtureSet: "real",
        fixtureFile: "/tmp/operator-owned-promptlane-fixtures.json",
        json: true,
      },
      runBenchmark,
    );

    expect(runBenchmark).toHaveBeenCalledWith([
      "--fixture-set",
      "real",
      "--fixture-file",
      "/tmp/operator-owned-promptlane-fixtures.json",
      "--json",
    ]);
  });

  it("reports a missing operator fixture without exposing its local path", () => {
    const fixtureFile = join(
      tmpdir(),
      `promptlane-private-fixtures-${randomUUID()}.json`,
    );

    const output = benchmarkForCli({
      fixtureSet: "real",
      fixtureFile,
      json: true,
    });
    const report = JSON.parse(output) as {
      status: string;
      detail: string;
    };

    expect(report.status).toBe("no_fixtures");
    expect(report.detail).toBe(
      "No real fixtures found at the operator-provided local file. Add consent-bearing redacted prompts and re-run.",
    );
    expect(output).not.toContain(fixtureFile);
  });
});
