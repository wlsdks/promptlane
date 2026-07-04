import type { PromptImprovement } from "../../analysis/improve.js";

export type ImprovementSaveState = {
  disabled: boolean;
  label: string;
};

export function improvementSaveState(
  mode: PromptImprovement["mode"],
  saved: boolean,
): ImprovementSaveState {
  if (mode === "saved-draft") {
    return { disabled: true, label: "Already saved" };
  }
  return { disabled: false, label: saved ? "Saved" : "Save draft" };
}
