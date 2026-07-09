import {
  copyFileSync,
  mkdtempSync,
  mkdirSync,
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
      release_gate: "synthetic",
      trend_signal: "real",
    });
    expect(
      buildBenchmarkEvidenceState({
        fixtureSet: "real",
        status: "ready",
        pass: true,
      }),
    ).toEqual({
      effectiveness: "trend_healthy",
      release_blocking: false,
      requires_real_fixtures: false,
      release_gate: "synthetic",
      trend_signal: "real",
    });
    expect(
      buildBenchmarkEvidenceState({
        fixtureSet: "real",
        status: "ready",
        pass: false,
      }),
    ).toEqual({
      effectiveness: "trend_needs_review",
      release_blocking: false,
      requires_real_fixtures: false,
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
        release_gate: "synthetic",
        trend_signal: "real",
      }),
    ).toEqual([
      "evidence_effectiveness: regression_gate_failed",
      "evidence_release_blocking: yes",
      "evidence_requires_real_fixtures: yes",
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

  it("loads an operator-owned real fixture file outside the package root", async () => {
    tempRoot = mkdtempSync(join(tmpdir(), "promptlane-real-fixtures-"));
    const realFixturesPath = join(tempRoot, "private", "promptlane-real.json");
    mkdirSync(join(tempRoot, "private"), { recursive: true });
    copyFileSync(
      join(process.cwd(), "docs", "benchmark-fixtures", "real.example.json"),
      realFixturesPath,
    );

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

  it("keeps the shipped real fixture example loadable as the real fixture file", async () => {
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

    const loaded = loadBenchmarkFixtures({
      fixtureSet: "real",
      repoRoot: tempRoot,
    });

    expect(loaded.status).toBe("ready");
    expect(loaded.fixtures).toHaveLength(2);
    expect(loaded.coachCases).toHaveLength(2);
  });

  it("rejects real fixtures without local benchmark consent metadata", async () => {
    tempRoot = mkdtempSync(join(tmpdir(), "promptlane-real-fixtures-"));
    const fixtureDir = join(tempRoot, "docs", "benchmark-fixtures");
    mkdirSync(fixtureDir, { recursive: true });
    writeFileSync(
      join(fixtureDir, "real.json"),
      `${JSON.stringify(
        {
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
