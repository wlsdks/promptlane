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
import { pathToFileURL } from "node:url";
import { Writable } from "node:stream";

import { describe, expect, it, vi } from "vitest";

import { normalizeClaudeCodePayload } from "../../adapters/claude-code.js";
import { initializePromptLane } from "../../config/config.js";
import { redactPrompt } from "../../redaction/redact.js";
import { createSqlitePromptStorage } from "../../storage/sqlite.js";
import {
  benchmarkCandidatesForCli,
  benchmarkForCli,
  initializeBenchmarkFixtureForCli,
  prepareBenchmarkFixtureForCli,
} from "./benchmark.js";
import { preparePairedBenchmarkFixtureForCli } from "./benchmark-pair.js";
import { runCli } from "../index.js";
import type { PromptDetail } from "../../storage/ports.js";
import type { LoopSnapshot } from "../../loop/types.js";

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

  it("requires explicit consent before reading selected archive prompts", () => {
    const readPrompts = vi.fn();

    expect(() =>
      prepareBenchmarkFixtureForCli(
        {
          confirmConsent: false,
          consentNote: "Operator approved redacted prompts.",
          fixtureFile: "/tmp/private-real.json",
          promptIds: ["prmt_one"],
        },
        readPrompts,
      ),
    ).toThrow(
      "benchmark prepare-fixture requires --confirm-consent after reviewing the selected prompts.",
    );
    expect(readPrompts).not.toHaveBeenCalled();
  });

  it("rejects an unsafe consent note before reading selected prompts", () => {
    const readPrompts = vi.fn();

    expect(() =>
      prepareBenchmarkFixtureForCli(
        {
          confirmConsent: true,
          consentNote: "Approved at /Users/example/private/consent.txt",
          fixtureFile: "/tmp/private-real.json",
          promptIds: ["prmt_one"],
        },
        readPrompts,
      ),
    ).toThrow("Real benchmark fixture consent note must be redacted.");
    expect(readPrompts).not.toHaveBeenCalled();
  });

  it("writes selected archive prompts to a private runnable real fixture", () => {
    const tempRoot = mkdtempSync(join(tmpdir(), "promptlane-fixture-prepare-"));
    const fixtureFile = join(tempRoot, "private", "real.json");
    const readPrompts = vi.fn(() => [storedPromptDetail()]);

    try {
      const output = prepareBenchmarkFixtureForCli(
        {
          confirmConsent: true,
          consentNote:
            "Operator approved redacted prompts for local benchmarking.",
          fixtureFile,
          promptIds: ["prmt_selected"],
        },
        readPrompts,
      );
      const fixture = JSON.parse(readFileSync(fixtureFile, "utf8"));

      expect(readPrompts).toHaveBeenCalledWith(["prmt_selected"], undefined);
      expect(fixture).toMatchObject({
        template_only: false,
        fixtures: [
          {
            adapter: "codex",
            outcome: { improvement_used: true, status: "passed" },
          },
        ],
      });
      expect(statSync(fixtureFile).mode & 0o777).toBe(0o600);
      expect(output).toBe(
        "Created a consent-bearing PromptLane real benchmark fixture from 1 selected prompt. Run the real soft signal with --fixture-file pointing to the new local file.",
      );
      expect(output).not.toContain(fixtureFile);
      expect(output).not.toContain(storedPromptDetail().markdown);
    } finally {
      rmSync(tempRoot, { recursive: true, force: true });
    }
  });

  it("requires paired fixture consent before reading archive prompts", () => {
    const readPrompts = vi.fn();

    expect(() =>
      preparePairedBenchmarkFixtureForCli(
        {
          baselinePromptIds: ["prmt_baseline"],
          confirmConsent: false,
          consentNote: "Operator approved this redacted matched pair.",
          fixtureFile: "/tmp/private-pair.json",
          pairIds: ["release_review"],
          promptlanePromptIds: ["prmt_treatment"],
          queries: ["release verification"],
        },
        readPrompts,
      ),
    ).toThrow(
      "benchmark prepare-pair requires --confirm-consent after reviewing both prompts and outcomes.",
    );
    expect(readPrompts).not.toHaveBeenCalled();
  });

  it("requires aligned pair option counts before reading archive prompts", () => {
    const readPrompts = vi.fn();

    expect(() =>
      preparePairedBenchmarkFixtureForCli(
        {
          baselinePromptIds: ["prmt_baseline_one", "prmt_baseline_two"],
          confirmConsent: true,
          consentNote: "Operator approved these redacted matched pairs.",
          fixtureFile: "/tmp/private-pairs.json",
          pairIds: ["release_one"],
          promptlanePromptIds: ["prmt_treatment_one"],
          queries: ["release one"],
        },
        readPrompts,
      ),
    ).toThrow(
      "benchmark prepare-pair requires the same non-zero number of baseline ids, PromptLane ids, pair ids, and queries.",
    );
    expect(readPrompts).not.toHaveBeenCalled();
  });

  it("writes a selected archive pair to a private runnable fixture", () => {
    const tempRoot = mkdtempSync(join(tmpdir(), "promptlane-pair-prepare-"));
    const fixtureFile = join(tempRoot, "private", "paired.json");
    const baseline = storedPromptDetail();
    baseline.id = "prmt_baseline";
    baseline.loop_outcomes![0]!.improvement_used = false;
    baseline.loop_outcomes![0]!.status = "failed";
    const treatment = storedPromptDetail();
    treatment.id = "prmt_treatment";
    const readPrompts = vi.fn(() => [baseline, treatment]);

    try {
      const output = preparePairedBenchmarkFixtureForCli(
        {
          baselinePromptIds: [baseline.id],
          confirmConsent: true,
          consentNote: "Operator approved this redacted matched pair.",
          fixtureFile,
          pairIds: ["release_review"],
          promptlanePromptIds: [treatment.id],
          queries: ["release verification"],
        },
        readPrompts,
      );
      const fixture = JSON.parse(readFileSync(fixtureFile, "utf8"));

      expect(readPrompts).toHaveBeenCalledWith(
        [baseline.id, treatment.id],
        undefined,
      );
      expect(
        fixture.fixtures.map(
          (item: { effect_pair: unknown }) => item.effect_pair,
        ),
      ).toEqual([
        { id: "release_review", variant: "baseline" },
        { id: "release_review", variant: "promptlane" },
      ]);
      expect(statSync(fixtureFile).mode & 0o777).toBe(0o600);
      expect(output).toBe(
        "Created a consent-bearing paired effectiveness fixture with 1 matched pair. Collect at least 3 matched pairs before interpreting direction.",
      );
      expect(output).not.toContain(fixtureFile);
      expect(output).not.toContain(baseline.id);
      expect(output).not.toContain(baseline.markdown);
    } finally {
      rmSync(tempRoot, { recursive: true, force: true });
    }
  });

  it("combines repeated matched options into one runnable fixture", () => {
    const tempRoot = mkdtempSync(join(tmpdir(), "promptlane-pairs-prepare-"));
    const fixtureFile = join(tempRoot, "paired.json");
    const prompts = [
      pairedStoredPrompt("prmt_base_one", false, "failed"),
      pairedStoredPrompt("prmt_base_two", false, "passed"),
      pairedStoredPrompt("prmt_lane_one", true, "passed"),
      pairedStoredPrompt("prmt_lane_two", true, "passed"),
    ];

    try {
      const output = preparePairedBenchmarkFixtureForCli(
        {
          baselinePromptIds: ["prmt_base_one", "prmt_base_two"],
          confirmConsent: true,
          consentNote: "Operator approved these redacted matched pairs.",
          fixtureFile,
          pairIds: ["release_one", "release_two"],
          promptlanePromptIds: ["prmt_lane_one", "prmt_lane_two"],
          queries: ["release one", "release two"],
        },
        () => prompts,
      );
      const fixture = JSON.parse(readFileSync(fixtureFile, "utf8"));

      expect(fixture.fixtures).toHaveLength(4);
      expect(
        fixture.fixtures.map(
          (item: { effect_pair: { id: string; variant: string } }) =>
            `${item.effect_pair.id}:${item.effect_pair.variant}`,
        ),
      ).toEqual([
        "release_one:baseline",
        "release_one:promptlane",
        "release_two:baseline",
        "release_two:promptlane",
      ]);
      expect(output).toContain("with 2 matched pairs");
    } finally {
      rmSync(tempRoot, { recursive: true, force: true });
    }
  });

  it("prepares a fixture through the public nested CLI command", async () => {
    const tempRoot = mkdtempSync(join(tmpdir(), "promptlane-fixture-cli-"));
    const dataDir = join(tempRoot, "data");
    const fixtureFile = join(tempRoot, "real.json");
    const pairFixtureFile = join(tempRoot, "paired.json");
    const init = initializePromptLane({ dataDir });
    const storage = createSqlitePromptStorage({
      dataDir,
      hmacSecret: init.hookAuth.web_session_secret,
    });
    const event = normalizeClaudeCodePayload(
      {
        session_id: "session-benchmark",
        transcript_path: "/Users/example/.claude/session.jsonl",
        cwd: "/Users/example/project",
        permission_mode: "default",
        hook_event_name: "UserPromptSubmit",
        prompt: "Review benchmark fixture generation and run focused tests.",
      },
      new Date("2026-07-10T00:11:22.000Z"),
    );
    const stored = await storage.storePrompt({
      event,
      redaction: redactPrompt(event.prompt, "mask"),
    });
    const baselineEvent = normalizeClaudeCodePayload(
      {
        session_id: "session-benchmark-baseline",
        transcript_path: "/Users/example/.claude/baseline.jsonl",
        cwd: "/Users/example/project",
        permission_mode: "default",
        hook_event_name: "UserPromptSubmit",
        prompt: "Review the redacted baseline release checks.",
      },
      new Date("2026-07-10T00:10:00.000Z"),
    );
    const baselineStored = await storage.storePrompt({
      event: baselineEvent,
      redaction: redactPrompt(baselineEvent.prompt, "mask"),
    });
    storage.createLoopSnapshot({
      id: "loop_benchmark_baseline",
      created_at: "2026-07-10T00:12:00.000Z",
      tool: "claude-code",
      source: "cli",
      cwd_label: "project",
      project_id: "proj_benchmark",
      prompt_ids: [baselineStored.id],
      event_counts: { prompts: 1, tests_run: 1 },
      quality: { top_gaps: [], unresolved_questions: [] },
      outcome: {
        status: "failed",
        summary: "Baseline release checks did not pass.",
        evidence_refs: ["test:benchmark-baseline"],
      },
      next_brief: { generated: false, summary: "Improve the next request." },
      privacy: {
        stores_prompt_bodies: false,
        stores_raw_paths: false,
        local_only: true,
      },
    });
    storage.createLoopSnapshot({
      id: "loop_benchmark_fixture",
      created_at: "2026-07-10T00:15:00.000Z",
      tool: "claude-code",
      source: "cli",
      cwd_label: "project",
      project_id: "proj_benchmark",
      prompt_ids: [stored.id],
      event_counts: { prompts: 1, tests_run: 2 },
      quality: { top_gaps: [], unresolved_questions: [] },
      outcome: {
        status: "passed",
        summary: "Prepared fixture checks passed.",
        evidence_refs: ["test:benchmark-prepare"],
        used_improvement_prompt_ids: [stored.id],
      },
      next_brief: { generated: false, summary: "Continue local benchmark." },
      privacy: {
        stores_prompt_bodies: false,
        stores_raw_paths: false,
        local_only: true,
      },
    });
    storage.close();
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
          "prepare-fixture",
          "--data-dir",
          dataDir,
          "--prompt-id",
          stored.id,
          "--consent-note",
          "Operator approved this redacted prompt for local benchmarking.",
          "--confirm-consent",
          "--output",
          fixtureFile,
        ],
        { stderr },
      );

      expect(exitCode).toBe(0);
      expect(JSON.parse(readFileSync(fixtureFile, "utf8"))).toMatchObject({
        template_only: false,
        fixtures: [
          {
            adapter: "claude-code",
            prompt:
              "Review benchmark fixture generation and run focused tests.",
            outcome: {
              improvement_used: true,
              status: "passed",
              tests_run: 2,
            },
          },
        ],
      });
      const { loadBenchmarkFixtures } = await import(
        pathToFileURL(join(process.cwd(), "scripts/benchmark-fixtures.mjs"))
          .href
      );
      expect(
        loadBenchmarkFixtures({
          fixtureSet: "real",
          realFixturesPath: fixtureFile,
          repoRoot: process.cwd(),
        }),
      ).toMatchObject({
        status: "ready",
        fixtures: [
          {
            outcome: { improvement_used: true, status: "passed" },
          },
        ],
      });

      consoleLog.mockClear();
      expect(
        await runCli(
          [
            "node",
            "promptlane",
            "benchmark",
            "prepare-pair",
            "--data-dir",
            dataDir,
            "--baseline-prompt-id",
            baselineStored.id,
            "--promptlane-prompt-id",
            stored.id,
            "--pair-id",
            "release_review",
            "--query",
            "release verification",
            "--consent-note",
            "Operator approved this redacted matched pair.",
            "--confirm-consent",
            "--output",
            pairFixtureFile,
          ],
          { stderr },
        ),
      ).toBe(0);
      expect(
        loadBenchmarkFixtures({
          fixtureSet: "real",
          realFixturesPath: pairFixtureFile,
          repoRoot: process.cwd(),
        }),
      ).toMatchObject({
        status: "ready",
        fixtures: [
          {
            effect_pair: { id: "release_review", variant: "baseline" },
            outcome: { improvement_used: false, status: "failed" },
          },
          {
            effect_pair: { id: "release_review", variant: "promptlane" },
            outcome: { improvement_used: true, status: "passed" },
          },
        ],
      });

      consoleLog.mockClear();
      expect(
        await runCli(
          [
            "node",
            "promptlane",
            "benchmark",
            "candidates",
            "--data-dir",
            dataDir,
            "--json",
          ],
          { stderr },
        ),
      ).toBe(0);
      const candidateOutput = String(consoleLog.mock.calls.at(-1)?.[0]);
      expect(JSON.parse(candidateOutput)).toMatchObject({
        status: "ready",
        candidates: [
          {
            prompt_id: stored.id,
            outcome_status: "passed",
            evidence_ref_count: 1,
          },
        ],
        privacy: {
          returns_prompt_bodies: false,
          returns_raw_paths: false,
          returns_evidence_refs: false,
        },
      });
    } finally {
      consoleLog.mockRestore();
      rmSync(tempRoot, { recursive: true, force: true });
    }
  });

  it("formats body-free benchmark candidates as JSON and text", () => {
    const snapshots = [candidateSnapshot()];
    const json = benchmarkCandidatesForCli(
      { json: true, limit: "10" },
      () => snapshots,
    );
    const text = benchmarkCandidatesForCli({}, () => snapshots);

    expect(JSON.parse(json)).toMatchObject({
      status: "ready",
      candidates: [
        {
          prompt_id: "prmt_candidate",
          outcome_status: "passed",
          tests_run: 2,
        },
      ],
    });
    expect(json).not.toContain("private outcome summary");
    expect(json).not.toContain("test:private-ref");
    expect(text).toContain("benchmark candidates: ready");
    expect(text).toContain(
      "readiness completed 1; attributed 1; evidence complete 1; safe 1",
    );
    expect(text).toContain("prmt_candidate passed; tests 2");
    expect(text).toContain(
      "Privacy: local-only; no prompt bodies, raw paths, or evidence refs",
    );
  });

  it("validates candidate limits before reading snapshots", () => {
    const readSnapshots = vi.fn();

    expect(() =>
      benchmarkCandidatesForCli({ limit: "101" }, readSnapshots),
    ).toThrow("benchmark candidates --limit must be from 1 to 100.");
    expect(readSnapshots).not.toHaveBeenCalled();
  });

  it("refuses to overwrite a prepared real fixture", () => {
    const tempRoot = mkdtempSync(join(tmpdir(), "promptlane-fixture-prepare-"));
    const fixtureFile = join(tempRoot, "real.json");
    writeFileSync(fixtureFile, '{"keep":true}\n', { mode: 0o600 });
    const readPrompts = vi.fn(() => [storedPromptDetail()]);

    try {
      expect(() =>
        prepareBenchmarkFixtureForCli(
          {
            confirmConsent: true,
            consentNote: "Operator approved redacted prompts.",
            fixtureFile,
            promptIds: ["prmt_selected"],
          },
          readPrompts,
        ),
      ).toThrow(
        "Real benchmark fixture file already exists. Choose a different --output.",
      );
      expect(readFileSync(fixtureFile, "utf8")).toBe('{"keep":true}\n');
      expect(readPrompts).not.toHaveBeenCalled();
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

  it("saves a successful JSON report as a private local file", () => {
    const tempRoot = mkdtempSync(join(tmpdir(), "promptlane-report-file-"));
    const reportFile = join(tempRoot, "reports", "baseline.json");
    const report = {
      dataset: "benchmark-v1-real",
      fixture_set: "real",
      pass: true,
    };
    const runBenchmark = vi.fn(() => ({
      status: 0,
      stdout: JSON.stringify(report),
      stderr: "",
    }));

    try {
      const output = benchmarkForCli(
        { fixtureSet: "real", json: true, reportFile },
        runBenchmark,
      );

      expect(JSON.parse(output)).toEqual(report);
      expect(JSON.parse(readFileSync(reportFile, "utf8"))).toEqual(report);
      expect(statSync(reportFile).mode & 0o777).toBe(0o600);
      expect(runBenchmark).toHaveBeenCalledWith([
        "--fixture-set",
        "real",
        "--json",
      ]);
    } finally {
      rmSync(tempRoot, { recursive: true, force: true });
    }
  });

  it("requires JSON output before writing a benchmark report file", () => {
    const runBenchmark = vi.fn();

    expect(() =>
      benchmarkForCli(
        { fixtureSet: "real", reportFile: "/tmp/private-report.json" },
        runBenchmark,
      ),
    ).toThrow("--report-file requires --json");
    expect(runBenchmark).not.toHaveBeenCalled();
  });

  it("does not write failed or non-JSON benchmark output", () => {
    const tempRoot = mkdtempSync(join(tmpdir(), "promptlane-report-failure-"));
    const failedReport = join(tempRoot, "failed.json");
    const malformedReport = join(tempRoot, "malformed.json");
    const previousExitCode = process.exitCode;
    process.exitCode = undefined;

    try {
      const failedOutput = benchmarkForCli(
        { fixtureSet: "real", json: true, reportFile: failedReport },
        () => ({
          status: 1,
          stdout: JSON.stringify({ status: "needs_review" }),
          stderr: "private benchmark detail",
        }),
      );
      expect(JSON.parse(failedOutput)).toEqual({ status: "needs_review" });
      expect(() => statSync(failedReport)).toThrow();

      expect(() =>
        benchmarkForCli(
          { fixtureSet: "real", json: true, reportFile: malformedReport },
          () => ({ status: 0, stdout: "not-json", stderr: "" }),
        ),
      ).toThrow("PromptLane benchmark returned invalid JSON output.");
      expect(() => statSync(malformedReport)).toThrow();
    } finally {
      process.exitCode = previousExitCode;
      rmSync(tempRoot, { recursive: true, force: true });
    }
  });

  it("refuses to overwrite an existing benchmark report without exposing its path", () => {
    const tempRoot = mkdtempSync(join(tmpdir(), "promptlane-report-existing-"));
    const reportFile = join(tempRoot, "operator-baseline.json");
    const existing = '{"keep":"existing evidence"}\n';
    writeFileSync(reportFile, existing, { mode: 0o600 });

    try {
      expect(() =>
        benchmarkForCli({ fixtureSet: "real", json: true, reportFile }, () => ({
          status: 0,
          stdout: '{"pass":true}',
          stderr: "",
        })),
      ).toThrow(
        "Benchmark report file already exists. Choose a new --report-file.",
      );
      expect(readFileSync(reportFile, "utf8")).toBe(existing);
      try {
        benchmarkForCli({ fixtureSet: "real", json: true, reportFile }, () => ({
          status: 0,
          stdout: '{"pass":true}',
          stderr: "",
        }));
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        expect(message).not.toContain(reportFile);
      }
    } finally {
      rmSync(tempRoot, { recursive: true, force: true });
    }
  });

  it("returns a structured incompatible report while preserving failure exit status", () => {
    const previousExitCode = process.exitCode;
    process.exitCode = undefined;
    const runBenchmark = vi.fn(() => ({
      status: 1,
      stdout: JSON.stringify({
        fixture_set: "real",
        comparison: {
          status: "incompatible",
          reason: "fixture_set_or_corpus_mismatch",
        },
      }),
      stderr: "private baseline path must stay hidden",
    }));

    try {
      const output = benchmarkForCli(
        { fixtureSet: "real", baselineFile: "/tmp/private-baseline.json" },
        runBenchmark,
      );
      expect(JSON.parse(output).comparison).toEqual({
        status: "incompatible",
        reason: "fixture_set_or_corpus_mismatch",
      });
      expect(output).not.toContain("private-baseline");
      expect(output).not.toContain("private baseline path");
      expect(process.exitCode).toBe(1);
    } finally {
      process.exitCode = previousExitCode;
    }
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

function storedPromptDetail(): PromptDetail {
  return {
    id: "prmt_20260710_001122_1234567890ab",
    tool: "codex",
    source_event: "UserPromptSubmit",
    session_id: "session-benchmark",
    cwd: "private-project",
    created_at: "2026-07-10T00:11:22.000Z",
    received_at: "2026-07-10T00:11:22.000Z",
    snippet: "Review benchmark fixture generation",
    prompt_length: 58,
    is_sensitive: false,
    excluded_from_analysis: false,
    redaction_policy: "mask",
    adapter_version: "1",
    index_status: "indexed",
    tags: ["test"],
    quality_gaps: [],
    quality_score: 90,
    quality_score_band: "excellent",
    usefulness: { copied_count: 0, bookmarked: false },
    duplicate_count: 0,
    markdown: "Review benchmark fixture generation and run focused tests.",
    improvement_drafts: [],
    loop_outcomes: [
      {
        snapshot_id: "loop_benchmark",
        status: "passed",
        summary: "Attributed benchmark checks passed.",
        evidence_refs: ["test:benchmark-fixture"],
        tests_run: 3,
        improvement_used: true,
      },
    ],
  };
}

function pairedStoredPrompt(
  id: string,
  improvementUsed: boolean,
  status: "passed" | "failed",
): PromptDetail {
  const prompt = storedPromptDetail();
  prompt.id = id;
  prompt.markdown = `Review redacted ${id.replaceAll("_", " ")} checks.`;
  prompt.loop_outcomes![0]!.improvement_used = improvementUsed;
  prompt.loop_outcomes![0]!.status = status;
  return prompt;
}

function candidateSnapshot(): LoopSnapshot {
  return {
    id: "loop_candidate",
    created_at: "2026-07-10T00:15:00.000Z",
    tool: "codex",
    source: "cli",
    cwd_label: "private-project",
    project_id: "proj_candidate",
    prompt_ids: ["prmt_candidate"],
    event_counts: { prompts: 1, tests_run: 2 },
    quality: { top_gaps: [], unresolved_questions: [] },
    outcome: {
      status: "passed",
      summary: "private outcome summary",
      evidence_refs: ["test:private-ref"],
      used_improvement_prompt_ids: ["prmt_candidate"],
    },
    next_brief: { generated: false, summary: "Continue local work." },
    privacy: {
      stores_prompt_bodies: false,
      stores_raw_paths: false,
      local_only: true,
    },
  };
}
