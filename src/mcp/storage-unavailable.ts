export function storageUnavailableMessage(error: unknown): string {
  const reason =
    error instanceof Error && "code" in error && typeof error.code === "string"
      ? ` Reason: ${error.code}.`
      : "";

  return `Local PromptLane archive is not available. Run \`promptlane setup --profile coach --register-mcp\`, then submit one real Claude Code or Codex prompt. If capture still does not work, run \`promptlane doctor claude-code\` or \`promptlane doctor codex\`. For custom storage, initialize it with \`promptlane init --data-dir <path>\` and pass the same --data-dir to the MCP server.${reason}`;
}
