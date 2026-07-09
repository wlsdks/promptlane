import {
  copyFileSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { afterEach, describe, expect, it } from "vitest";

let tempRoot: string | undefined;

afterEach(() => {
  if (tempRoot) {
    rmSync(tempRoot, { recursive: true, force: true });
    tempRoot = undefined;
  }
});

describe("benchmark fixture loading", () => {
  it("marks missing real fixtures as a soft signal in JSON output", async () => {
    const { buildNoFixturesReport } = await import(
      pathToFileURL(join(process.cwd(), "scripts/benchmark-fixtures.mjs")).href
    );
    const report = buildNoFixturesReport({
      dataset: "benchmark-v1-real",
      fixtureSet: "real",
      detail:
        "No real fixtures registered yet. Add docs/benchmark-fixtures/real.json (consent-bearing redacted prompts) and re-run.",
    });

    expect(report).toEqual(
      expect.objectContaining({
        dataset: "benchmark-v1-real",
        fixture_set: "real",
        soft_signal: true,
        status: "no_fixtures",
        evidence_state: {
          effectiveness: "unproven",
          release_blocking: false,
          requires_real_fixtures: true,
          requires_real_outcomes: true,
          requires_baseline: true,
          release_gate: "synthetic",
          trend_signal: "real",
        },
        next_action:
          "Add consent-bearing redacted real fixtures before using real benchmark trends.",
      }),
    );
  });

  it("describes benchmark evidence state for synthetic and real fixture reports", async () => {
    const { buildBenchmarkEvidenceState } = await import(
      pathToFileURL(join(process.cwd(), "scripts/benchmark-fixtures.mjs")).href
    );

    expect(
      buildBenchmarkEvidenceState({
        fixtureSet: "synthetic",
        status: "ready",
        pass: true,
      }),
    ).toEqual({
      effectiveness: "regression_gate_passed_not_real_world_proof",
      release_blocking: false,
      requires_real_fixtures: true,
      requires_real_outcomes: true,
      requires_baseline: false,
      release_gate: "synthetic",
      trend_signal: "real",
    });
    expect(
      buildBenchmarkEvidenceState({
        fixtureSet: "real",
        status: "ready",
        pass: true,
        outcomeCount: 1,
      }),
    ).toEqual({
      effectiveness: "snapshot_healthy",
      release_blocking: false,
      requires_real_fixtures: false,
      requires_real_outcomes: false,
      requires_baseline: true,
      release_gate: "synthetic",
      trend_signal: "real",
    });
    expect(
      buildBenchmarkEvidenceState({
        fixtureSet: "real",
        status: "ready",
        pass: false,
        outcomeCount: 1,
      }),
    ).toEqual({
      effectiveness: "snapshot_needs_review",
      release_blocking: false,
      requires_real_fixtures: false,
      requires_real_outcomes: false,
      requires_baseline: true,
      release_gate: "synthetic",
      trend_signal: "real",
    });
    expect(
      buildBenchmarkEvidenceState({
        fixtureSet: "synthetic",
        status: "ready",
        pass: false,
      }),
    ).toEqual({
      effectiveness: "regression_gate_failed",
      release_blocking: true,
      requires_real_fixtures: true,
      requires_real_outcomes: true,
      requires_baseline: false,
      release_gate: "synthetic",
      trend_signal: "real",
    });

    expect(
      buildBenchmarkEvidenceState({
        fixtureSet: "real",
        status: "ready",
        pass: true,
        outcomeCount: 0,
      }),
    ).toEqual({
      effectiveness: "unproven",
      release_blocking: false,
      requires_real_fixtures: false,
      requires_real_outcomes: true,
      requires_baseline: true,
      release_gate: "synthetic",
      trend_signal: "real",
    });

    expect(
      buildBenchmarkEvidenceState({
        fixtureSet: "real",
        status: "ready",
        pass: true,
        outcomeCount: 1,
        comparisonStatus: "compared",
        regressionCount: 0,
      }),
    ).toEqual({
      effectiveness: "trend_healthy",
      release_blocking: false,
      requires_real_fixtures: false,
      requires_real_outcomes: false,
      requires_baseline: false,
      release_gate: "synthetic",
      trend_signal: "real",
    });
    expect(
      buildBenchmarkEvidenceState({
        fixtureSet: "real",
        status: "ready",
        pass: true,
        outcomeCount: 1,
        comparisonStatus: "compared",
        regressionCount: 1,
      }),
    ).toEqual({
      effectiveness: "trend_needs_review",
      release_blocking: false,
      requires_real_fixtures: false,
      requires_real_outcomes: false,
      requires_baseline: false,
      release_gate: "synthetic",
      trend_signal: "real",
    });
  });

  it("formats benchmark evidence state for human text output", async () => {
    const { formatBenchmarkEvidenceStateLines } = await import(
      pathToFileURL(join(process.cwd(), "scripts/benchmark-fixtures.mjs")).href
    );

    expect(
      formatBenchmarkEvidenceStateLines({
        effectiveness: "regression_gate_failed",
        release_blocking: true,
        requires_real_fixtures: true,
        requires_real_outcomes: true,
        requires_baseline: false,
        release_gate: "synthetic",
        trend_signal: "real",
      }),
    ).toEqual([
      "evidence_effectiveness: regression_gate_failed",
      "evidence_release_blocking: yes",
      "evidence_requires_real_fixtures: yes",
      "evidence_requires_real_outcomes: yes",
      "evidence_requires_baseline: no",
      "evidence_release_gate: synthetic",
      "evidence_trend_signal: real",
    ]);
  });

  it("formats missing real fixture reports with evidence state for human text output", async () => {
    const { buildNoFixturesReport, formatNoFixturesReportLines } = await import(
      pathToFileURL(join(process.cwd(), "scripts/benchmark-fixtures.mjs")).href
    );

    const report = buildNoFixturesReport({
      dataset: "benchmark-v1-real",
      fixtureSet: "real",
      detail:
        "No real fixtures registered yet. Add docs/benchmark-fixtures/real.json (consent-bearing redacted prompts) and re-run.",
    });

    expect(formatNoFixturesReportLines(report)).toEqual([
      "promptlane benchmark benchmark-v1-real",
      "status: no_fixtures",
      "evidence_effectiveness: unproven",
      "evidence_release_blocking: no",
      "evidence_requires_real_fixtures: yes",
      "evidence_requires_real_outcomes: yes",
      "evidence_requires_baseline: yes",
      "evidence_release_gate: synthetic",
      "evidence_trend_signal: real",
      "next_action: Add consent-bearing redacted real fixtures before using real benchmark trends.",
      "No real fixtures registered yet. Add docs/benchmark-fixtures/real.json (consent-bearing redacted prompts) and re-run.",
    ]);
  });

  it("loads consent-bearing redacted real fixtures instead of synthetic fixtures", async () => {
    tempRoot = mkdtempSync(join(tmpdir(), "promptlane-real-fixtures-"));
    const fixtureDir = join(tempRoot, "docs", "benchmark-fixtures");
    mkdirSync(fixtureDir, { recursive: true });
    writeFileSync(
      join(fixtureDir, "real.json"),
      `${JSON.stringify(
        {
          template_only: false,
          consent_note:
            "Operator-confirmed redacted prompts approved for local benchmark use on 2026-07-09.",
          fixtures: [
            {
              label: "real_release_review",
              adapter: "codex",
              query: "release readiness review",
              prompt:
                "Review the redacted release readiness notes and return the next verification step.",
            },
            {
              label: "real_claude_setup",
              adapter: "claude-code",
              query: "claude setup smoke",
              prompt:
                "Check the redacted Claude setup smoke result and suggest the smallest follow-up.",
            },
          ],
          coach_cases: [
            "Improve this redacted prompt with verification criteria.",
          ],
        },
        null,
        2,
      )}\n`,
    );

    const { loadBenchmarkFixtures } = await import(
      pathToFileURL(join(process.cwd(), "scripts/benchmark-fixtures.mjs")).href
    );

    const loaded = loadBenchmarkFixtures({
      fixtureSet: "real",
      repoRoot: tempRoot,
    });

    expect(loaded.status).toBe("ready");
    expect(loaded.fixtures).toHaveLength(2);
    expect(loaded.fixtures.map((fixture) => fixture.label)).toEqual([
      "real_release_review",
      "real_claude_setup",
    ]);
    expect(loaded.coachCases).toEqual([
      "Improve this redacted prompt with verification criteria.",
    ]);
  });

  it("preserves operator-confirmed raw-free outcomes for real effectiveness evidence", async () => {
    tempRoot = mkdtempSync(join(tmpdir(), "promptlane-real-fixtures-"));
    const fixtureDir = join(tempRoot, "docs", "benchmark-fixtures");
    mkdirSync(fixtureDir, { recursive: true });
    writeFileSync(
      join(fixtureDir, "real.json"),
      `${JSON.stringify(
        {
          template_only: false,
          consent_note: "Operator-confirmed redacted benchmark corpus.",
          fixtures: [
            {
              label: "real_release_review",
              adapter: "codex",
              query: "release readiness review",
              prompt: "Review the redacted release readiness notes.",
              outcome: {
                status: "passed",
                summary: "The release review completed with focused checks.",
                evidence_refs: ["test:release-smoke", "commit:abc1234"],
                tests_run: 4,
              },
            },
          ],
          coach_cases: [
            "Improve this redacted prompt with verification criteria.",
          ],
        },
        null,
        2,
      )}\n`,
    );

    const { loadBenchmarkFixtures } = await import(
      pathToFileURL(join(process.cwd(), "scripts/benchmark-fixtures.mjs")).href
    );
    const loaded = loadBenchmarkFixtures({
      fixtureSet: "real",
      repoRoot: tempRoot,
    });

    expect(loaded.fixtures[0]?.outcome).toEqual({
      status: "passed",
      summary: "The release review completed with focused checks.",
      evidence_refs: ["test:release-smoke", "commit:abc1234"],
      tests_run: 4,
    });
  });

  it("rejects unsafe real outcome evidence without echoing private content", async () => {
    tempRoot = mkdtempSync(join(tmpdir(), "promptlane-real-fixtures-"));
    const fixtureDir = join(tempRoot, "docs", "benchmark-fixtures");
    mkdirSync(fixtureDir, { recursive: true });
    writeFileSync(
      join(fixtureDir, "real.json"),
      `${JSON.stringify(
        {
          template_only: false,
          consent_note: "Operator-confirmed redacted benchmark corpus.",
          fixtures: [
            {
              label: "real_release_review",
              adapter: "codex",
              query: "release readiness review",
              prompt: "Review the redacted release readiness notes.",
              outcome: {
                status: "passed",
                summary: "Private result from /Users/example/project.",
                evidence_refs: ["test:release-smoke"],
                tests_run: 4,
              },
            },
          ],
          coach_cases: [
            "Improve this redacted prompt with verification criteria.",
          ],
        },
        null,
        2,
      )}\n`,
    );

    const { loadBenchmarkFixtures } = await import(
      pathToFileURL(join(process.cwd(), "scripts/benchmark-fixtures.mjs")).href
    );
    expect(() =>
      loadBenchmarkFixtures({ fixtureSet: "real", repoRoot: tempRoot }),
    ).toThrow(
      "real fixture 0 outcome summary must be redacted before benchmark ingestion.",
    );
  });

  it("never substitutes synthetic passed evidence for real benchmark outcomes", async () => {
    const { buildBenchmarkOutcomeSeeds } = await import(
      pathToFileURL(join(process.cwd(), "scripts/benchmark-fixtures.mjs")).href
    );
    const fixtureIds = new Map([
      ["real_without_outcome", "prompt-real-one"],
      ["real_with_outcome", "prompt-real-two"],
    ]);
    const fixtures = [
      {
        label: "real_without_outcome",
        adapter: "codex",
        query: "first query",
        prompt: "First redacted prompt.",
      },
      {
        label: "real_with_outcome",
        adapter: "claude-code",
        query: "second query",
        prompt: "Second redacted prompt.",
        outcome: {
          status: "failed",
          summary: "The requested verification did not pass.",
          evidence_refs: ["test:focused-check"],
          tests_run: 2,
        },
      },
    ];

    expect(
      buildBenchmarkOutcomeSeeds({
        fixtureSet: "real",
        fixtures: [fixtures[0]],
        fixtureIds,
      }),
    ).toEqual([]);
    expect(
      buildBenchmarkOutcomeSeeds({ fixtureSet: "real", fixtures, fixtureIds }),
    ).toEqual([
      {
        promptId: "prompt-real-two",
        label: "real_with_outcome",
        tool: "claude-code",
        outcome: fixtures[1]?.outcome,
      },
    ]);
  });

  it("rejects a real corpus without explicit template confirmation", async () => {
    tempRoot = mkdtempSync(join(tmpdir(), "promptlane-real-fixtures-"));
    const fixtureDir = join(tempRoot, "docs", "benchmark-fixtures");
    const realFixturesPath = join(fixtureDir, "real.json");
    mkdirSync(fixtureDir, { recursive: true });
    writeFileSync(
      realFixturesPath,
      `${JSON.stringify({
        consent_note: "Operator-confirmed redacted benchmark corpus.",
        fixtures: [
          {
            label: "private_example",
            adapter: "codex",
            query: "private query must not be echoed",
            prompt: "Private redacted prompt must not be echoed.",
          },
        ],
        coach_cases: ["Private redacted coach case must not be echoed."],
      })}\n`,
    );

    const { loadBenchmarkFixtures } = await import(
      pathToFileURL(join(process.cwd(), "scripts/benchmark-fixtures.mjs")).href
    );

    expect(() =>
      loadBenchmarkFixtures({ fixtureSet: "real", repoRoot: tempRoot }),
    ).toThrow(
      "Real benchmark fixtures are still an unconfirmed template. Replace every example and set template_only to false before running real evidence.",
    );

    try {
      loadBenchmarkFixtures({ fixtureSet: "real", repoRoot: tempRoot });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      expect(message).not.toContain(realFixturesPath);
      expect(message).not.toContain("private query");
      expect(message).not.toContain("Private redacted prompt");
    }
  });

  it("loads an operator-owned real fixture file outside the package root", async () => {
    tempRoot = mkdtempSync(join(tmpdir(), "promptlane-real-fixtures-"));
    const realFixturesPath = join(tempRoot, "private", "promptlane-real.json");
    mkdirSync(join(tempRoot, "private"), { recursive: true });
    copyFileSync(
      join(process.cwd(), "docs", "benchmark-fixtures", "real.example.json"),
      realFixturesPath,
    );
    const confirmed = JSON.parse(readFileSync(realFixturesPath, "utf8"));
    confirmed.template_only = false;
    writeFileSync(realFixturesPath, `${JSON.stringify(confirmed, null, 2)}\n`);

    const { loadBenchmarkFixtures } = await import(
      pathToFileURL(join(process.cwd(), "scripts/benchmark-fixtures.mjs")).href
    );

    const loaded = loadBenchmarkFixtures({
      fixtureSet: "real",
      repoRoot: join(tempRoot, "installed-package"),
      realFixturesPath,
    });

    expect(loaded.status).toBe("ready");
    expect(loaded.fixtures).toHaveLength(2);
    expect(loaded.coachCases).toHaveLength(2);
  });

  it("rejects malformed real fixture JSON without echoing its path or content", async () => {
    tempRoot = mkdtempSync(join(tmpdir(), "promptlane-real-fixtures-"));
    const realFixturesPath = join(tempRoot, "private-fixtures.json");
    writeFileSync(realFixturesPath, '{"private_prompt":"do not echo"');

    const { loadBenchmarkFixtures } = await import(
      pathToFileURL(join(process.cwd(), "scripts/benchmark-fixtures.mjs")).href
    );

    expect(() =>
      loadBenchmarkFixtures({
        fixtureSet: "real",
        repoRoot: tempRoot,
        realFixturesPath,
      }),
    ).toThrow("Real benchmark fixture file must contain valid JSON.");

    try {
      loadBenchmarkFixtures({
        fixtureSet: "real",
        repoRoot: tempRoot,
        realFixturesPath,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      expect(message).not.toContain(realFixturesPath);
      expect(message).not.toContain("do not echo");
    }
  });

  it("refuses to run the shipped fixture template as real evidence", async () => {
    tempRoot = mkdtempSync(join(tmpdir(), "promptlane-real-fixtures-"));
    const fixtureDir = join(tempRoot, "docs", "benchmark-fixtures");
    mkdirSync(fixtureDir, { recursive: true });
    copyFileSync(
      join(process.cwd(), "docs", "benchmark-fixtures", "real.example.json"),
      join(fixtureDir, "real.json"),
    );

    const { loadBenchmarkFixtures } = await import(
      pathToFileURL(join(process.cwd(), "scripts/benchmark-fixtures.mjs")).href
    );

    expect(() =>
      loadBenchmarkFixtures({
        fixtureSet: "real",
        repoRoot: tempRoot,
      }),
    ).toThrow(
      "Real benchmark fixtures are still an unconfirmed template. Replace every example and set template_only to false before running real evidence.",
    );
  });

  it("rejects real fixtures without local benchmark consent metadata", async () => {
    tempRoot = mkdtempSync(join(tmpdir(), "promptlane-real-fixtures-"));
    const fixtureDir = join(tempRoot, "docs", "benchmark-fixtures");
    mkdirSync(fixtureDir, { recursive: true });
    writeFileSync(
      join(fixtureDir, "real.json"),
      `${JSON.stringify(
        {
          template_only: false,
          fixtures: [
            {
              label: "real_release_review",
              adapter: "codex",
              query: "release readiness",
              prompt:
                "Review the redacted release readiness notes and return the next verification step.",
            },
          ],
          coach_cases: [
            "Improve this redacted prompt with verification criteria.",
          ],
        },
        null,
        2,
      )}\n`,
    );

    const { loadBenchmarkFixtures } = await import(
      pathToFileURL(join(process.cwd(), "scripts/benchmark-fixtures.mjs")).href
    );

    expect(() =>
      loadBenchmarkFixtures({
        fixtureSet: "real",
        repoRoot: tempRoot,
      }),
    ).toThrow("docs/benchmark-fixtures/real.json must include consent_note");
  });

  it("rejects real fixture consent metadata with raw local paths", async () => {
    tempRoot = mkdtempSync(join(tmpdir(), "promptlane-real-fixtures-"));
    const fixtureDir = join(tempRoot, "docs", "benchmark-fixtures");
    mkdirSync(fixtureDir, { recursive: true });
    writeFileSync(
      join(fixtureDir, "real.json"),
      `${JSON.stringify(
        {
          template_only: false,
          consent_note: "Approved from /Users/example/private-notes.md.",
          fixtures: [
            {
              label: "real_release_review",
              adapter: "codex",
              query: "release readiness",
              prompt:
                "Review the redacted release readiness notes and return the next verification step.",
            },
          ],
          coach_cases: [
            "Improve this redacted prompt with verification criteria.",
          ],
        },
        null,
        2,
      )}\n`,
    );

    const { loadBenchmarkFixtures } = await import(
      pathToFileURL(join(process.cwd(), "scripts/benchmark-fixtures.mjs")).href
    );

    expect(() =>
      loadBenchmarkFixtures({
        fixtureSet: "real",
        repoRoot: tempRoot,
      }),
    ).toThrow("real fixture consent_note must be redacted");
  });

  it("rejects real fixture queries with raw local paths", async () => {
    tempRoot = mkdtempSync(join(tmpdir(), "promptlane-real-fixtures-"));
    const fixtureDir = join(tempRoot, "docs", "benchmark-fixtures");
    mkdirSync(fixtureDir, { recursive: true });
    writeFileSync(
      join(fixtureDir, "real.json"),
      `${JSON.stringify(
        {
          template_only: false,
          consent_note:
            "Operator-confirmed redacted prompts approved for local benchmark use on 2026-07-09.",
          fixtures: [
            {
              label: "real_release_review",
              adapter: "codex",
              query: "/Users/example/private release readiness",
              prompt:
                "Review the redacted release readiness notes and return the next verification step.",
            },
          ],
          coach_cases: [
            "Improve this redacted prompt with verification criteria.",
          ],
        },
        null,
        2,
      )}\n`,
    );

    const { loadBenchmarkFixtures } = await import(
      pathToFileURL(join(process.cwd(), "scripts/benchmark-fixtures.mjs")).href
    );

    expect(() =>
      loadBenchmarkFixtures({
        fixtureSet: "real",
        repoRoot: tempRoot,
      }),
    ).toThrow("real fixture 0 query must be redacted");
  });

  it("rejects real fixture labels with raw local paths", async () => {
    tempRoot = mkdtempSync(join(tmpdir(), "promptlane-real-fixtures-"));
    const fixtureDir = join(tempRoot, "docs", "benchmark-fixtures");
    mkdirSync(fixtureDir, { recursive: true });
    writeFileSync(
      join(fixtureDir, "real.json"),
      `${JSON.stringify(
        {
          template_only: false,
          consent_note:
            "Operator-confirmed redacted prompts approved for local benchmark use on 2026-07-09.",
          fixtures: [
            {
              label: "/Users/example/private-release-review",
              adapter: "codex",
              query: "release readiness",
              prompt:
                "Review the redacted release readiness notes and return the next verification step.",
            },
          ],
          coach_cases: [
            "Improve this redacted prompt with verification criteria.",
          ],
        },
        null,
        2,
      )}\n`,
    );

    const { loadBenchmarkFixtures } = await import(
      pathToFileURL(join(process.cwd(), "scripts/benchmark-fixtures.mjs")).href
    );

    expect(() =>
      loadBenchmarkFixtures({
        fixtureSet: "real",
        repoRoot: tempRoot,
      }),
    ).toThrow("real fixture 0 label must be redacted");
  });

  it("rejects duplicate real fixture labels", async () => {
    tempRoot = mkdtempSync(join(tmpdir(), "promptlane-real-fixtures-"));
    const fixtureDir = join(tempRoot, "docs", "benchmark-fixtures");
    mkdirSync(fixtureDir, { recursive: true });
    writeFileSync(
      join(fixtureDir, "real.json"),
      `${JSON.stringify(
        {
          template_only: false,
          consent_note:
            "Operator-confirmed redacted prompts approved for local benchmark use on 2026-07-09.",
          fixtures: [
            {
              label: "real_release_review",
              adapter: "codex",
              query: "release readiness",
              prompt:
                "Review the redacted release readiness notes and return the next verification step.",
            },
            {
              label: "real_release_review",
              adapter: "claude-code",
              query: "claude release readiness",
              prompt:
                "Review the redacted Claude release notes and return the next verification step.",
            },
          ],
          coach_cases: [
            "Improve this redacted prompt with verification criteria.",
          ],
        },
        null,
        2,
      )}\n`,
    );

    const { loadBenchmarkFixtures } = await import(
      pathToFileURL(join(process.cwd(), "scripts/benchmark-fixtures.mjs")).href
    );

    expect(() =>
      loadBenchmarkFixtures({
        fixtureSet: "real",
        repoRoot: tempRoot,
      }),
    ).toThrow("real fixture label must be unique: real_release_review");
  });

  it("rejects real fixture labels that are not safe identifiers", async () => {
    tempRoot = mkdtempSync(join(tmpdir(), "promptlane-real-fixtures-"));
    const fixtureDir = join(tempRoot, "docs", "benchmark-fixtures");
    mkdirSync(fixtureDir, { recursive: true });
    writeFileSync(
      join(fixtureDir, "real.json"),
      `${JSON.stringify(
        {
          template_only: false,
          consent_note:
            "Operator-confirmed redacted prompts approved for local benchmark use on 2026-07-09.",
          fixtures: [
            {
              label: "Release Review",
              adapter: "codex",
              query: "release readiness",
              prompt:
                "Review the redacted release readiness notes and return the next verification step.",
            },
          ],
          coach_cases: [
            "Improve this redacted prompt with verification criteria.",
          ],
        },
        null,
        2,
      )}\n`,
    );

    const { loadBenchmarkFixtures } = await import(
      pathToFileURL(join(process.cwd(), "scripts/benchmark-fixtures.mjs")).href
    );

    expect(() =>
      loadBenchmarkFixtures({
        fixtureSet: "real",
        repoRoot: tempRoot,
      }),
    ).toThrow("real fixture 0 label must be a safe label");
  });

  it("rejects real fixtures with macOS volume and Windows user paths", async () => {
    tempRoot = mkdtempSync(join(tmpdir(), "promptlane-real-fixtures-"));
    const fixtureDir = join(tempRoot, "docs", "benchmark-fixtures");
    mkdirSync(fixtureDir, { recursive: true });
    writeFileSync(
      join(fixtureDir, "real.json"),
      `${JSON.stringify(
        {
          template_only: false,
          consent_note:
            "Operator-confirmed redacted prompts approved for local benchmark use on 2026-07-09.",
          fixtures: [
            {
              label: "real_release_review",
              adapter: "codex",
              query: "release readiness",
              prompt:
                "Review /Volumes/private-drive/project/release.md and return the next verification step.",
            },
          ],
          coach_cases: [
            String.raw`Improve C:\Users\example\project\prompt.md with verification criteria.`,
          ],
        },
        null,
        2,
      )}\n`,
    );

    const { loadBenchmarkFixtures } = await import(
      pathToFileURL(join(process.cwd(), "scripts/benchmark-fixtures.mjs")).href
    );

    expect(() =>
      loadBenchmarkFixtures({
        fixtureSet: "real",
        repoRoot: tempRoot,
      }),
    ).toThrow("real fixture 0 prompt must be redacted");
  });
});
