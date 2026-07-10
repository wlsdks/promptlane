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
  effect_pair?: {
    id: string;
    variant: "baseline" | "promptlane";
  };
  outcome?: {
    status: "passed" | "failed";
    summary: string;
    improvement_used: boolean;
    evidence_refs: string[];
    tests_run: number;
  };
};

export function createPairedRealBenchmarkFixture({
  consentNote,
  pairId,
  query,
  baselinePrompt,
  promptlanePrompt,
}: {
  consentNote: string;
  pairId: string;
  query: string;
  baselinePrompt: PromptDetail;
  promptlanePrompt: PromptDetail;
}): RealBenchmarkFixture {
  const normalizedConsent = validateRealBenchmarkConsentNote(consentNote);
  const normalizedPairId = pairId.trim();
  if (!/^[a-z0-9][a-z0-9_-]{0,51}$/.test(normalizedPairId)) {
    throw new BenchmarkFixtureInputError(
      "Paired benchmark pair id must use lowercase safe-label characters.",
    );
  }
  const normalizedQuery = query.trim();
  if (!normalizedQuery || hasSensitiveValue(normalizedQuery)) {
    throw new BenchmarkFixtureInputError(
      "Paired benchmark query must be non-empty and redacted.",
    );
  }
  if (baselinePrompt.id === promptlanePrompt.id) {
    throw new BenchmarkFixtureInputError(
      "Paired benchmark prompts must be distinct.",
    );
  }
  if (
    (baselinePrompt.tool !== "codex" &&
      baselinePrompt.tool !== "claude-code") ||
    baselinePrompt.tool !== promptlanePrompt.tool
  ) {
    throw new BenchmarkFixtureInputError(
      "Paired benchmark prompts must use the same supported tool.",
    );
  }

  const baselineText = pairedPromptText(baselinePrompt);
  const promptlaneText = pairedPromptText(promptlanePrompt);
  const baselineOutcome = requiredPairedOutcome({
    outcomes: baselinePrompt.loop_outcomes ?? [],
    improvementUsed: false,
    missingMessage:
      "Baseline prompt requires completed redacted outcome evidence without PromptLane improvement attribution.",
  });
  const promptlaneOutcome = requiredPairedOutcome({
    outcomes: promptlanePrompt.loop_outcomes ?? [],
    improvementUsed: true,
    missingMessage:
      "PromptLane prompt requires completed redacted outcome evidence with explicit improvement attribution.",
  });

  return {
    template_only: false,
    consent_note: normalizedConsent,
    fixtures: [
      {
        label: `${normalizedPairId}_baseline`,
        adapter: baselinePrompt.tool,
        query: normalizedQuery,
        prompt: baselineText,
        effect_pair: { id: normalizedPairId, variant: "baseline" },
        outcome: baselineOutcome,
      },
      {
        label: `${normalizedPairId}_promptlane`,
        adapter: promptlanePrompt.tool,
        query: normalizedQuery,
        prompt: promptlaneText,
        effect_pair: { id: normalizedPairId, variant: "promptlane" },
        outcome: promptlaneOutcome,
      },
    ],
    coach_cases: [baselineText, promptlaneText],
  };
}

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

function pairedPromptText(prompt: PromptDetail): string {
  const promptText = prompt.markdown.trim();
  if (!promptText || hasSensitiveValue(promptText)) {
    throw new BenchmarkFixtureInputError(
      "Paired benchmark prompts must be redacted before export.",
    );
  }
  return promptText;
}

function requiredPairedOutcome({
  outcomes,
  improvementUsed,
  missingMessage,
}: {
  outcomes: PromptLoopOutcomeEvidence[];
  improvementUsed: boolean;
  missingMessage: string;
}) {
  const outcome = outcomes.find(
    (candidate) =>
      candidate.improvement_used === improvementUsed &&
      (candidate.status === "passed" || candidate.status === "failed") &&
      candidate.evidence_refs.length > 0,
  );
  if (!outcome) {
    throw new BenchmarkFixtureInputError(missingMessage);
  }
  if ([outcome.summary, ...outcome.evidence_refs].some(hasSensitiveValue)) {
    throw new BenchmarkFixtureInputError(
      "Paired benchmark outcome evidence must be redacted before export.",
    );
  }
  return {
    status: outcome.status as "passed" | "failed",
    summary: outcome.summary,
    improvement_used: improvementUsed,
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
