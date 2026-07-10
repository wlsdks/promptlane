import { detectSensitiveValues } from "../redaction/detectors.js";
import type {
  PromptDetail,
  PromptLoopOutcomeEvidence,
} from "../storage/ports.js";

export type RealBenchmarkFixture = {
  template_only: false;
  consent_note: string;
  fixtures: RealBenchmarkFixtureCase[];
  coach_cases: string[];
};

type RealBenchmarkFixtureCase = {
  label: string;
  adapter: "codex" | "claude-code";
  query: string;
  prompt: string;
  outcome?: {
    status: "passed" | "failed";
    summary: string;
    improvement_used: true;
    evidence_refs: string[];
    tests_run: number;
  };
};

export class BenchmarkFixtureInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BenchmarkFixtureInputError";
  }
}

export function createRealBenchmarkFixture({
  consentNote,
  prompts,
}: {
  consentNote: string;
  prompts: PromptDetail[];
}): RealBenchmarkFixture {
  const normalizedConsent = validateRealBenchmarkConsentNote(consentNote);
  if (prompts.length === 0) {
    throw new BenchmarkFixtureInputError(
      "Select at least one stored prompt for the real benchmark fixture.",
    );
  }

  const fixtures = prompts.map((prompt, index) =>
    fixtureForPrompt(prompt, index),
  );
  return {
    template_only: false,
    consent_note: normalizedConsent,
    fixtures,
    coach_cases: fixtures.map((fixture) => fixture.prompt),
  };
}

export function validateRealBenchmarkConsentNote(consentNote: string): string {
  const normalizedConsent = consentNote.trim();
  if (!normalizedConsent) {
    throw new BenchmarkFixtureInputError(
      "Real benchmark fixture consent note must not be empty.",
    );
  }
  if (hasSensitiveValue(normalizedConsent)) {
    throw new BenchmarkFixtureInputError(
      "Real benchmark fixture consent note must be redacted.",
    );
  }
  return normalizedConsent;
}

function fixtureForPrompt(
  prompt: PromptDetail,
  index: number,
): RealBenchmarkFixtureCase {
  const promptText = prompt.markdown.trim();
  if (!promptText || hasSensitiveValue(promptText)) {
    throw new BenchmarkFixtureInputError(
      "Selected benchmark prompts must be redacted before export.",
    );
  }
  if (prompt.tool !== "codex" && prompt.tool !== "claude-code") {
    throw new BenchmarkFixtureInputError(
      "Selected benchmark prompts must come from Codex or Claude Code.",
    );
  }

  const outcome = attributedOutcome(prompt.loop_outcomes ?? []);
  const query = fixtureQuery(promptText);
  if (!query) {
    throw new BenchmarkFixtureInputError(
      "Selected benchmark prompts must include searchable text.",
    );
  }
  return {
    label: fixtureLabel(prompt.id, index),
    adapter: prompt.tool,
    query,
    prompt: promptText,
    ...(outcome ? { outcome } : {}),
  };
}

function attributedOutcome(outcomes: PromptLoopOutcomeEvidence[]) {
  const outcome = outcomes.find(
    (candidate) =>
      candidate.improvement_used &&
      (candidate.status === "passed" || candidate.status === "failed") &&
      candidate.evidence_refs.length > 0,
  );
  if (!outcome) return undefined;

  const values = [outcome.summary, ...outcome.evidence_refs];
  if (values.some(hasSensitiveValue)) {
    throw new BenchmarkFixtureInputError(
      "Selected benchmark outcome evidence must be redacted before export.",
    );
  }

  return {
    status: outcome.status as "passed" | "failed",
    summary: outcome.summary,
    improvement_used: true as const,
    evidence_refs: outcome.evidence_refs,
    tests_run: outcome.tests_run ?? 0,
  };
}

function fixtureLabel(promptId: string, index: number): string {
  const suffix = promptId
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .slice(-12);
  return `real_${index + 1}_${suffix || "prompt"}`;
}

function fixtureQuery(prompt: string): string {
  const words = prompt.toLowerCase().match(/[\p{L}\p{N}_-]+/gu) ?? [];
  return Array.from(new Set(words.filter((word) => word.length >= 2)))
    .slice(0, 3)
    .join(" ");
}

function hasSensitiveValue(value: string): boolean {
  return detectSensitiveValues(value).length > 0;
}
