export function errorMessageOrDefault(error: unknown, fallback: string): string {
  if (error instanceof Error) {
    const message = error.message.trim();
    if (message.length > 0) {
      return message;
    }
  }
  return fallback;
}

export function projectInstructionAnalysisErrorMessage(error: unknown): string {
  return errorMessageOrDefault(
    error,
    "Could not analyze project instruction files.",
  );
}

export function projectPolicyUpdateErrorMessage(error: unknown): string {
  return errorMessageOrDefault(
    error,
    "Could not save the project capture policy.",
  );
}

export function exportPreviewErrorMessage(error: unknown): string {
  return errorMessageOrDefault(
    error,
    "Could not create the anonymized export preview.",
  );
}

export function archiveScoreErrorMessage(error: unknown): string {
  return errorMessageOrDefault(error, "Could not evaluate the prompt archive.");
}
