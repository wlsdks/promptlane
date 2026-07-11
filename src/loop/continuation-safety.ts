export type ContinuationSafety = {
  label: "Continuation safety";
  steps: readonly [string, string, string];
  boundaries: readonly [string, string];
  local_only: true;
  writes_files: false;
  external_calls: false;
};

export const CONTINUATION_SAFETY: ContinuationSafety = {
  label: "Continuation safety",
  steps: [
    "Review the selected brief before copying it.",
    "Paste it into the intended Codex or Claude Code request.",
    "Submit manually, then collect a fresh loop snapshot after the turn.",
  ],
  boundaries: [
    "LoopRelay does not read transcripts, submit prompts, execute commands, or write instruction files.",
    "Memory approval and merge decisions remain separate explicit reviews.",
  ],
  local_only: true,
  writes_files: false,
  external_calls: false,
};
