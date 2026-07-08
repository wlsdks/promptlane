import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
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
  it("loads consent-bearing redacted real fixtures instead of synthetic fixtures", async () => {
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

  it("rejects real fixture queries with raw local paths", async () => {
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
});
