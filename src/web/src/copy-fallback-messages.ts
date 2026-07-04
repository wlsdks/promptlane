export type CopyFailureTarget = "improvement" | "saved-draft";

export function copyFailureMessage(target: CopyFailureTarget): string {
  if (target === "saved-draft") {
    return "Could not copy the saved draft.";
  }

  return "Could not copy the improvement draft.";
}
