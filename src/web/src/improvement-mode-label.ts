import type { PromptImprovement } from "../../analysis/improve.js";

export function improvementModeLabel(mode: PromptImprovement["mode"]): string {
  return mode === "saved-draft" ? "Saved draft" : "Copy draft";
}
