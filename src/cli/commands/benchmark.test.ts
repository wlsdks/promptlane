import { randomUUID } from "node:crypto";
import {
  mkdtempSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Writable } from "node:stream";

import { describe, expect, it, vi } from "vitest";

import {
  benchmarkForCli,
  initializeBenchmarkFixtureForCli,
} from "./benchmark.js";
import { runCli } from "../index.js";

describe("benchmark CLI command", () => {
  it("creates the shipped real fixture template with private permissions", () => {
    const tempRoot = mkdtempSync(join(tmpdir(), "promptlane-fixture-init-"));
    const fixtureFile = join(tempRoot, "private", "real.json");

    try {
      const output = initializeBenchmarkFixtureForCli({ fixtureFile });
      const parsed = JSON.parse(readFileSync(fixtureFile, "utf8")) as {
        template_only: boolean;
        consent_note: string;
        fixtures: unknown[];
        coach_cases: unknown[];
      };

      expect(output).toBe(
        "Created PromptLane real benchmark fixture template. Replace every example, update consent_note, and set template_only to false before running the real soft signal.",
      );
      expect(output).not.toContain(fixtureFile);
      expect(parsed.template_only).toBe(true);
      expect(parsed.consent_note).toContain(
        "Replace with operator-confirmed redaction",
      );
      expect(parsed.fixtures.length).toBeGreaterThan(0);
      expect(parsed.coach_cases.length).toBeGreaterThan(0);
      expect(statSync(fixtureFile).mode & 0o777).toBe(0o600);
    } finally {
      rmSync(tempRoot, { recursive: true, force: true });
    }
  });

  it("creates a fixture through the public nested CLI command", async () => {
    const tempRoot = mkdtempSync(join(tmpdir(), "promptlane-fixture-cli-"));
    const fixtureFile = join(tempRoot, "real.json");
    const consoleLog = vi.spyOn(console, "log").mockImplementation(() => {});
    const stderr = new Writable({
      write(_chunk, _encoding, callback) {
        callback();
      },
    });

    try {
      const exitCode = await runCli(
        [
          "node",
          "promptlane",
          "benchmark",
          "init-fixture",
          "--output",
          fixtureFile,
        ],
        { stderr },
      );

      expect(exitCode).toBe(0);
      expect(JSON.parse(readFileSync(fixtureFile, "utf8"))).toHaveProperty(
        "consent_note",
      );
    } finally {
      consoleLog.mockRestore();
      rmSync(tempRoot, { recursive: true, force: true });
    }
  });

  it("refuses to overwrite an existing real fixture file without exposing its path", () => {
    const tempRoot = mkdtempSync(join(tmpdir(), "promptlane-fixture-init-"));
    const fixtureFile = join(tempRoot, "operator-owned-real.json");
    const existingContent = '{"keep":"operator-owned"}\n';
    writeFileSync(fixtureFile, existingContent);

    try {
      expect(() => initializeBenchmarkFixtureForCli({ fixtureFile })).toThrow(
        "Real benchmark fixture file already exists. Edit it in place or choose a different --output.",
      );
      expect(readFileSync(fixtureFile, "utf8")).toBe(existingContent);

      try {
        initializeBenchmarkFixtureForCli({ fixtureFile });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        expect(message).not.toContain(fixtureFile);
      }
    } finally {
      rmSync(tempRoot, { recursive: true, force: true });
    }
  });

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

  it("forwards a prior benchmark report for raw-free trend comparison", () => {
    const runBenchmark = vi.fn(() => ({
      status: 0,
      stdout: JSON.stringify({ fixture_set: "real", pass: true }),
      stderr: "",
    }));

    benchmarkForCli(
      {
        fixtureSet: "real",
        fixtureFile: "/tmp/operator-owned-fixtures.json",
        baselineFile: "/tmp/prior-benchmark-report.json",
        json: true,
      },
      runBenchmark,
    );

    expect(runBenchmark).toHaveBeenCalledWith([
      "--fixture-set",
      "real",
      "--fixture-file",
      "/tmp/operator-owned-fixtures.json",
      "--baseline-file",
      "/tmp/prior-benchmark-report.json",
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
