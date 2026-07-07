export function errorMessageOrDefault(
  error: unknown,
  fallback: string,
): string {
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

export function improvementDraftSaveErrorMessage(error: unknown): string {
  return errorMessageOrDefault(error, "Could not save the improvement draft.");
}

export function bookmarkErrorMessage(error: unknown): string {
  return errorMessageOrDefault(error, "Could not save the bookmark status.");
}

export function bulkDeleteErrorMessage(error: unknown): string {
  return errorMessageOrDefault(error, "Could not bulk delete some prompts.");
}

export function draftCopyMarkerErrorMessage(error: unknown): string {
  return errorMessageOrDefault(
    error,
    "Copied the draft, but could not save the copy marker.",
  );
}

export function copyUsageEventErrorMessage(error: unknown): string {
  return errorMessageOrDefault(
    error,
    "Copied the prompt, but could not save the usage event.",
  );
}

export function askEventSummaryErrorMessage(error: unknown): string {
  return errorMessageOrDefault(error, "Could not load ask events.");
}

export function similarPromptsErrorMessage(error: unknown): string {
  return errorMessageOrDefault(error, "Could not load similar prompts.");
}
