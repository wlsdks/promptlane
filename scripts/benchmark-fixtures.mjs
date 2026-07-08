import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const VALID_ADAPTERS = new Set(["claude-code", "codex"]);

export function loadBenchmarkFixtures({
  fixtureSet,
  repoRoot,
  rawPathPrefix = "/Users/example",
  rawSecret = "sk-proj-benchmark1234567890abcdef",
}) {
  const syntheticFixtures = [
    {
      label: "secret_bugfix",
      adapter: "claude-code",
      query: "token pnpm test",
      prompt: `Fix ${rawPathPrefix}/benchmark-project/src/secret.ts with token ${rawSecret}. Run pnpm test.`,
    },
    {
      label: "export_ui",
      adapter: "codex",
      query: "export layout markdown",
      prompt: `Review ${rawPathPrefix}/benchmark-project/src/web/App.tsx export layout and return Markdown summary.`,
    },
    {
      label: "database_migration",
      adapter: "claude-code",
      query: "sqlite migration",
      prompt:
        "Add SQLite migration for prompt_improvement_drafts. Include rollback notes and verification criteria: pnpm test.",
    },
    {
      label: "vague_prompt",
      adapter: "codex",
      query: "make better",
      prompt: "Make this better",
    },
    {
      label: "release_docs",
      adapter: "claude-code",
      query: "release checklist docs",
      prompt:
        "Update release checklist docs for benchmark workflow. Output a concise Markdown summary.",
    },
  ];
  const syntheticCoachCases = [
    "Make this better",
    `Fix ${rawPathPrefix}/benchmark-project/src/secret.ts with token ${rawSecret}.`,
    "Review export UI.",
    "Check the DB part",
    "Fix the tests",
  ];

  if (fixtureSet !== "real") {
    return {
      status: "ready",
      fixtures: syntheticFixtures,
      coachCases: syntheticCoachCases,
    };
  }

  const realFixturesPath = join(repoRoot, "docs/benchmark-fixtures/real.json");
  if (!existsSync(realFixturesPath)) {
    return {
      status: "no_fixtures",
      fixtures: [],
      coachCases: [],
      detail:
        "No real fixtures registered yet. Add docs/benchmark-fixtures/real.json (consent-bearing redacted prompts) and re-run.",
    };
  }

  const parsed = JSON.parse(readFileSync(realFixturesPath, "utf8"));
  const fixtures = parseRealFixtures(parsed);
  const coachCases = parseRealCoachCases(parsed);

  return {
    status: "ready",
    fixtures,
    coachCases,
  };
}

export function buildNoFixturesReport({ dataset, fixtureSet, detail }) {
  return {
    dataset,
    fixture_set: fixtureSet,
    soft_signal: true,
    status: "no_fixtures",
    detail,
  };
}

function parseRealFixtures(parsed) {
  if (!Array.isArray(parsed?.fixtures) || parsed.fixtures.length === 0) {
    throw new Error(
      "docs/benchmark-fixtures/real.json must contain a non-empty fixtures array.",
    );
  }

  const seenLabels = new Set();
  return parsed.fixtures.map((fixture, index) => {
    const normalized = {
      label: readRequiredString(fixture, "label", index),
      adapter: readRequiredString(fixture, "adapter", index),
      query: readRequiredString(fixture, "query", index),
      prompt: readRequiredString(fixture, "prompt", index),
    };
    if (!VALID_ADAPTERS.has(normalized.adapter)) {
      throw new Error(
        `real fixture ${index} adapter must be claude-code or codex.`,
      );
    }
    assertRedactedText(normalized.label, `real fixture ${index} label`);
    assertRedactedText(normalized.query, `real fixture ${index} query`);
    assertRedactedText(normalized.prompt, `real fixture ${index} prompt`);
    assertSafeLabel(normalized.label, `real fixture ${index} label`);
    if (seenLabels.has(normalized.label)) {
      throw new Error(`real fixture label must be unique: ${normalized.label}`);
    }
    seenLabels.add(normalized.label);
    return normalized;
  });
}

function parseRealCoachCases(parsed) {
  if (!Array.isArray(parsed?.coach_cases) || parsed.coach_cases.length === 0) {
    throw new Error(
      "docs/benchmark-fixtures/real.json must contain a non-empty coach_cases array.",
    );
  }

  return parsed.coach_cases.map((value, index) => {
    if (typeof value !== "string" || value.trim().length === 0) {
      throw new Error(`real coach case ${index} must be a non-empty string.`);
    }
    assertRedactedText(value, `real coach case ${index}`);
    return value;
  });
}

function readRequiredString(fixture, field, index) {
  const value = fixture?.[field];
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(
      `real fixture ${index} ${field} must be a non-empty string.`,
    );
  }
  return value;
}

function assertSafeLabel(value, label) {
  if (!/^[a-z0-9][a-z0-9_-]{0,63}$/.test(value)) {
    throw new Error(
      `${label} must be a safe label: lowercase letters, numbers, underscores, or hyphens.`,
    );
  }
}

function assertRedactedText(value, label) {
  const forbidden = [
    /\bsk-[A-Za-z0-9_-]{12,}\b/,
    /\bnpm_[A-Za-z0-9]{24,}\b/,
    /\/Users\/[^/\s]+/,
    /\/home\/[^/\s]+/,
    /\/Volumes\/[^/\s]+/,
    /[A-Za-z]:\\Users\\[^\\\s]+/,
  ];
  if (forbidden.some((pattern) => pattern.test(value))) {
    throw new Error(`${label} must be redacted before benchmark ingestion.`);
  }
}
