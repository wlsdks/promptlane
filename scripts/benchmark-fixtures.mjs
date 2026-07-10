import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const VALID_ADAPTERS = new Set(["claude-code", "codex"]);

export function loadBenchmarkFixtures({
  fixtureSet,
  repoRoot,
  realFixturesPath: configuredRealFixturesPath,
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

  const realFixturesPath =
    configuredRealFixturesPath ??
    join(repoRoot, "docs/benchmark-fixtures/real.json");
  if (!existsSync(realFixturesPath)) {
    return {
      status: "no_fixtures",
      fixtures: [],
      coachCases: [],
      detail: configuredRealFixturesPath
        ? "No real fixtures found at the operator-provided local file. Add consent-bearing redacted prompts and re-run."
        : "No real fixtures registered yet. Add docs/benchmark-fixtures/real.json (consent-bearing redacted prompts) and re-run.",
    };
  }

  let parsed;
  try {
    parsed = JSON.parse(readFileSync(realFixturesPath, "utf8"));
  } catch {
    throw new Error("Real benchmark fixture file must contain valid JSON.");
  }
  assertRealFixtureConfirmed(parsed);
  parseConsentNote(parsed);
  const fixtures = parseRealFixtures(parsed);
  const coachCases = parseRealCoachCases(parsed);

  return {
    status: "ready",
    fixtures,
    coachCases,
  };
}

function assertRealFixtureConfirmed(parsed) {
  if (parsed?.template_only !== false) {
    throw new Error(
      "Real benchmark fixtures are still an unconfirmed template. Replace every example and set template_only to false before running real evidence.",
    );
  }
}

export function buildNoFixturesReport({ dataset, fixtureSet, detail }) {
  return {
    dataset,
    fixture_set: fixtureSet,
    soft_signal: true,
    status: "no_fixtures",
    evidence_state: buildBenchmarkEvidenceState({
      fixtureSet,
      status: "no_fixtures",
    }),
    detail,
    next_action:
      "Add consent-bearing redacted real fixtures before using real benchmark trends.",
  };
}

export function buildBenchmarkOutcomeSeeds({
  fixtureSet,
  fixtures,
  fixtureIds,
  syntheticUnsafeEvidenceRefs = [],
}) {
  if (fixtureSet === "real") {
    return fixtures
      .filter((fixture) => fixture.outcome !== undefined)
      .map((fixture) => ({
        promptId: fixtureIds.get(fixture.label),
        label: fixture.label,
        tool: fixture.adapter,
        outcome: fixture.outcome,
      }))
      .filter((seed) => typeof seed.promptId === "string");
  }

  const fixture =
    fixtures.find((candidate) => candidate.label === "database_migration") ??
    fixtures[0];
  const promptId = fixture ? fixtureIds.get(fixture.label) : undefined;
  if (!fixture || typeof promptId !== "string") return [];
  return [
    {
      promptId,
      label: fixture.label,
      tool: fixture.adapter,
      outcome: {
        status: "passed",
        summary: "benchmark effectiveness outcome passed",
        improvement_used: true,
        evidence_refs: [
          "benchmark:effectiveness",
          "corepack pnpm benchmark",
          ...syntheticUnsafeEvidenceRefs,
        ],
        tests_run: 3,
      },
    },
  ];
}

export function buildBenchmarkEvidenceState({
  fixtureSet,
  status,
  pass,
  outcomeCount = 0,
  comparisonStatus = "not_requested",
  regressionCount = 0,
}) {
  if (fixtureSet === "real" && status === "ready" && outcomeCount > 0) {
    const compared = comparisonStatus === "compared";
    return {
      effectiveness: compared
        ? pass && regressionCount === 0
          ? "trend_healthy"
          : "trend_needs_review"
        : pass
          ? "snapshot_healthy"
          : "snapshot_needs_review",
      release_blocking: false,
      requires_real_fixtures: false,
      requires_real_outcomes: false,
      requires_baseline: !compared,
      release_gate: "synthetic",
      trend_signal: "real",
    };
  }

  if (fixtureSet === "real" && status === "ready") {
    return {
      effectiveness: "unproven",
      release_blocking: false,
      requires_real_fixtures: false,
      requires_real_outcomes: true,
      requires_baseline: true,
      release_gate: "synthetic",
      trend_signal: "real",
    };
  }

  if (fixtureSet === "synthetic" && pass) {
    return {
      effectiveness: "regression_gate_passed_not_real_world_proof",
      release_blocking: false,
      requires_real_fixtures: true,
      requires_real_outcomes: true,
      requires_baseline: false,
      release_gate: "synthetic",
      trend_signal: "real",
    };
  }

  if (fixtureSet === "synthetic" && status === "ready" && pass === false) {
    return {
      effectiveness: "regression_gate_failed",
      release_blocking: true,
      requires_real_fixtures: true,
      requires_real_outcomes: true,
      requires_baseline: false,
      release_gate: "synthetic",
      trend_signal: "real",
    };
  }

  return {
    effectiveness: "unproven",
    release_blocking: false,
    requires_real_fixtures: true,
    requires_real_outcomes: true,
    requires_baseline: fixtureSet === "real",
    release_gate: "synthetic",
    trend_signal: "real",
  };
}

export function formatBenchmarkEvidenceStateLines(evidenceState) {
  return [
    `evidence_effectiveness: ${evidenceState.effectiveness}`,
    `evidence_release_blocking: ${evidenceState.release_blocking ? "yes" : "no"}`,
    `evidence_requires_real_fixtures: ${
      evidenceState.requires_real_fixtures ? "yes" : "no"
    }`,
    `evidence_requires_real_outcomes: ${
      evidenceState.requires_real_outcomes ? "yes" : "no"
    }`,
    `evidence_requires_baseline: ${
      evidenceState.requires_baseline ? "yes" : "no"
    }`,
    `evidence_release_gate: ${evidenceState.release_gate}`,
    `evidence_trend_signal: ${evidenceState.trend_signal}`,
  ];
}

export function formatNoFixturesReportLines(report) {
  return [
    `promptlane benchmark ${report.dataset}`,
    "status: no_fixtures",
    ...formatBenchmarkEvidenceStateLines(report.evidence_state),
    `next_action: ${report.next_action}`,
    report.detail,
  ];
}

function parseConsentNote(parsed) {
  const consentNote = parsed?.consent_note;
  if (typeof consentNote !== "string" || consentNote.trim().length === 0) {
    throw new Error(
      "docs/benchmark-fixtures/real.json must include consent_note for local benchmark use.",
    );
  }
  assertRedactedText(consentNote, "real fixture consent_note");
  return consentNote;
}

function parseRealFixtures(parsed) {
  if (!Array.isArray(parsed?.fixtures) || parsed.fixtures.length === 0) {
    throw new Error(
      "docs/benchmark-fixtures/real.json must contain a non-empty fixtures array.",
    );
  }

  const seenLabels = new Set();
  const fixtures = parsed.fixtures.map((fixture, index) => {
    const normalized = {
      label: readRequiredString(fixture, "label", index),
      adapter: readRequiredString(fixture, "adapter", index),
      query: readRequiredString(fixture, "query", index),
      prompt: readRequiredString(fixture, "prompt", index),
      ...(fixture?.effect_pair === undefined
        ? {}
        : { effect_pair: parseRealEffectPair(fixture.effect_pair, index) }),
      ...(fixture?.outcome === undefined
        ? {}
        : { outcome: parseRealOutcome(fixture.outcome, index) }),
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
  validateRealEffectPairs(fixtures);
  return fixtures;
}

function parseRealEffectPair(value, fixtureIndex) {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error(
      `real fixture ${fixtureIndex} effect_pair must be an object.`,
    );
  }
  const id = readOutcomeString(value.id, "effect_pair id", fixtureIndex);
  assertRedactedText(id, `real fixture ${fixtureIndex} effect_pair id`);
  assertSafeLabel(id, `real fixture ${fixtureIndex} effect_pair id`);
  if (value.variant !== "baseline" && value.variant !== "promptlane") {
    throw new Error(
      `real fixture ${fixtureIndex} effect_pair variant must be baseline or promptlane.`,
    );
  }
  return { id, variant: value.variant };
}

function validateRealEffectPairs(fixtures) {
  const pairs = new Map();
  for (const fixture of fixtures) {
    if (!fixture.effect_pair) continue;
    const variants = pairs.get(fixture.effect_pair.id) ?? [];
    variants.push(fixture);
    pairs.set(fixture.effect_pair.id, variants);
  }

  for (const [pairId, pairFixtures] of pairs) {
    const baseline = pairFixtures.filter(
      (fixture) => fixture.effect_pair.variant === "baseline",
    );
    const promptlane = pairFixtures.filter(
      (fixture) => fixture.effect_pair.variant === "promptlane",
    );
    if (
      pairFixtures.length !== 2 ||
      baseline.length !== 1 ||
      promptlane.length !== 1
    ) {
      throw new Error(
        `real effect_pair ${pairId} must contain one baseline and one promptlane fixture.`,
      );
    }
    const baselineFixture = baseline[0];
    const promptlaneFixture = promptlane[0];
    if (
      baselineFixture.adapter !== promptlaneFixture.adapter ||
      baselineFixture.query !== promptlaneFixture.query
    ) {
      throw new Error(
        `real effect_pair ${pairId} fixtures must use the same adapter and query.`,
      );
    }
    if (!baselineFixture.outcome || !promptlaneFixture.outcome) {
      throw new Error(
        `real effect_pair ${pairId} fixtures must include completed outcomes.`,
      );
    }
    if (baselineFixture.outcome.improvement_used) {
      throw new Error(
        `real effect_pair ${pairId} baseline outcome must set improvement_used to false.`,
      );
    }
    if (!promptlaneFixture.outcome.improvement_used) {
      throw new Error(
        `real effect_pair ${pairId} promptlane outcome must set improvement_used to true.`,
      );
    }
  }
}

function parseRealOutcome(value, fixtureIndex) {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error(`real fixture ${fixtureIndex} outcome must be an object.`);
  }
  const status = value.status;
  if (status !== "passed" && status !== "failed") {
    throw new Error(
      `real fixture ${fixtureIndex} outcome status must be passed or failed.`,
    );
  }
  const summary = readOutcomeString(value.summary, "summary", fixtureIndex);
  assertRedactedText(summary, `real fixture ${fixtureIndex} outcome summary`);
  if (!Array.isArray(value.evidence_refs) || value.evidence_refs.length === 0) {
    throw new Error(
      `real fixture ${fixtureIndex} outcome evidence_refs must be a non-empty array.`,
    );
  }
  const evidenceRefs = value.evidence_refs.map((ref, evidenceIndex) => {
    if (typeof ref !== "string" || ref.trim().length === 0) {
      throw new Error(
        `real fixture ${fixtureIndex} outcome evidence_ref ${evidenceIndex} must be a non-empty string.`,
      );
    }
    assertRedactedText(
      ref,
      `real fixture ${fixtureIndex} outcome evidence_ref ${evidenceIndex}`,
    );
    return ref.trim();
  });
  if (!Number.isInteger(value.tests_run) || value.tests_run < 0) {
    throw new Error(
      `real fixture ${fixtureIndex} outcome tests_run must be a non-negative integer.`,
    );
  }
  if (typeof value.improvement_used !== "boolean") {
    throw new Error(
      `real fixture ${fixtureIndex} outcome improvement_used must be true or false.`,
    );
  }
  return {
    status,
    summary,
    evidence_refs: evidenceRefs,
    tests_run: value.tests_run,
    improvement_used: value.improvement_used,
  };
}

function readOutcomeString(value, field, fixtureIndex) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(
      `real fixture ${fixtureIndex} outcome ${field} must be a non-empty string.`,
    );
  }
  return value.trim();
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
