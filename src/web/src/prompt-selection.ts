import { useState } from "react";

export type PromptSelectionItem = {
  id: string;
};

export function togglePromptSelection(
  current: Set<string>,
  id: string,
): Set<string> {
  const next = new Set(current);
  if (next.has(id)) {
    next.delete(id);
  } else {
    next.add(id);
  }
  return next;
}

export function selectPromptIds(items: PromptSelectionItem[]): Set<string> {
  return new Set(items.map((item) => item.id));
}

export function usePromptSelection(): {
  clearSelection(): void;
  selectAll(items: PromptSelectionItem[]): void;
  selectedIds: Set<string>;
  setSelectedIds: (selectedIds: Set<string>) => void;
  toggleSelectId(id: string): void;
} {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());

  return {
    clearSelection(): void {
      setSelectedIds(new Set());
    },
    selectAll(items): void {
      setSelectedIds(selectPromptIds(items));
    },
    selectedIds,
    setSelectedIds,
    toggleSelectId(id): void {
      setSelectedIds((current) => togglePromptSelection(current, id));
    },
  };
}
