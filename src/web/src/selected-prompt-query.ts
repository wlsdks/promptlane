import { useEffect, useState, type Dispatch, type SetStateAction } from "react";

import type { PromptDetail } from "./api.js";
import type { View } from "./routing.js";

export type SelectedPromptQuery = {
  id: string;
};

export function getSelectedPromptQuery(
  view: View,
): SelectedPromptQuery | undefined {
  return view.name === "detail" ? { id: view.id } : undefined;
}

export function shouldClearSelectedPrompt(view: View): boolean {
  return view.name !== "detail";
}

export function useSelectedPromptQuery({
  loadPrompt,
  onError,
  view,
}: {
  loadPrompt(id: string): Promise<PromptDetail>;
  onError(message: string): void;
  view: View;
}): {
  selected: PromptDetail | undefined;
  setSelected: Dispatch<SetStateAction<PromptDetail | undefined>>;
} {
  const [selected, setSelected] = useState<PromptDetail | undefined>();

  useEffect(() => {
    if (shouldClearSelectedPrompt(view)) {
      setSelected(undefined);
      return;
    }

    const query = getSelectedPromptQuery(view);
    if (!query) {
      return;
    }

    void loadPrompt(query.id)
      .then(setSelected)
      .catch(() => onError("Could not find the prompt."));
  }, [loadPrompt, onError, view]);

  return { selected, setSelected };
}
