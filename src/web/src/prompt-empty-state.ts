import type { PromptFilters, PromptQualityGap } from "./api.js";
import { qualityGapLabel } from "./quality-options.js";

export type PromptEmptyState = {
  commands: string[];
  hint: string;
  secondary: string | undefined;
  title: string;
};

export function getPromptEmptyState({
  focus,
  qualityGap,
}: {
  focus?: PromptFilters["focus"];
  qualityGap?: PromptQualityGap;
}): PromptEmptyState {
  const gapLabel = qualityGapLabel(qualityGap);
  return {
    commands: emptyPromptCommands(focus, qualityGap),
    hint: emptyPromptHint(focus, gapLabel),
    secondary: emptyPromptSecondaryHint(focus, qualityGap),
    title: emptyPromptTitle(focus, gapLabel),
  };
}

function emptyPromptTitle(
  focus: PromptFilters["focus"] | undefined,
  gapLabel: string | undefined,
): string {
  if (gapLabel) return `${gapLabel} queue is empty.`;
  if (focus === "saved") return "No saved prompts.";
  if (focus === "reused") return "No reused prompts.";
  if (focus === "duplicated") return "No duplicate candidates.";
  if (focus === "quality-gap") return "No prompts need quality improvements.";
  return "Capture your first coding prompt.";
}

function emptyPromptHint(
  focus: PromptFilters["focus"] | undefined,
  gapLabel: string | undefined,
): string {
  if (gapLabel) return `No prompts have weak or missing ${gapLabel}.`;
  if (focus === "saved") {
    return "Save prompts for later from the detail screen.";
  }
  if (focus === "reused") {
    return "Prompts you copied or saved will appear here.";
  }
  if (focus === "duplicated") {
    return "Repeated stored prompt bodies will appear here.";
  }
  if (focus === "quality-gap") {
    return "Try adding verification criteria, output format, and scope.";
  }
  return "Run promptlane setup --profile coach, send one Codex or Claude Code request, then check the first score and improvement suggestion.";
}

function emptyPromptSecondaryHint(
  focus?: PromptFilters["focus"],
  qualityGap?: PromptQualityGap,
): string | undefined {
  if (focus || qualityGap) {
    return "Clear filters to return to the full archive.";
  }
  return undefined;
}

function emptyPromptCommands(
  focus?: PromptFilters["focus"],
  qualityGap?: PromptQualityGap,
): string[] {
  if (focus || qualityGap) {
    return [];
  }

  return [
    "promptlane start",
    "promptlane setup --profile coach",
    "promptlane doctor claude-code",
    "promptlane doctor codex",
    "promptlane coach",
  ];
}
