export function storageUnavailableMessage(error: unknown): string {
  const reason =
    error instanceof Error && "code" in error && typeof error.code === "string"
      ? ` Reason: ${error.code}.`
      : "";

  return `Local Loopdeck archive is not available. Run \`prompt-coach init\` first or pass --data-dir.${reason}`;
}
