import { describe, expect, it } from "vitest";

import { getPromptEmptyState } from "./prompt-empty-state.js";

describe("prompt empty state", () => {
  it("points a first-run archive at setup, one prompt, and coach", () => {
    expect(getPromptEmptyState({})).toEqual({
      commands: [
        "promptlane start",
        "promptlane setup --profile coach",
        "promptlane doctor claude-code",
        "promptlane doctor codex",
        "promptlane coach",
      ],
      hint: "Run promptlane setup --profile coach, send one Codex or Claude Code request, then check the first score and improvement suggestion.",
      secondary: undefined,
      title: "Capture your first coding prompt.",
    });
  });

  it("keeps quality gap empty states focused on the selected queue", () => {
    expect(getPromptEmptyState({ qualityGap: "output_format" })).toEqual({
      commands: [],
      hint: "No prompts have weak or missing Output format.",
      secondary: "Clear filters to return to the full archive.",
      title: "Output format queue is empty.",
    });
  });

  it("keeps filtered focus empty states out of the first-run command flow", () => {
    expect(getPromptEmptyState({ focus: "reused" })).toEqual({
      commands: [],
      hint: "Prompts you copied or saved will appear here.",
      secondary: "Clear filters to return to the full archive.",
      title: "No reused prompts.",
    });
  });
});
