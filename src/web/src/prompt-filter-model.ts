import type { PromptFilters } from "./api.js";
import {
  FOCUS_LABELS,
  SENSITIVITY_LABELS,
  TOOL_LABELS,
  qualityGapLabel,
} from "./quality-options.js";
import { displayLocalPath } from "./setup-checks.js";

export type FilterKey = keyof PromptFilters;

export type ActiveFilterChip = {
  key: FilterKey;
  label: string;
  value: string;
};

export function emptyFilters(): PromptFilters {
  return { isSensitive: "all" };
}

export function clearFilterPatch(key: FilterKey): Partial<PromptFilters> {
  if (key === "isSensitive") {
    return { isSensitive: "all" };
  }

  return { [key]: undefined };
}

export function activeFilterChips(filters: PromptFilters): ActiveFilterChip[] {
  const chips: ActiveFilterChip[] = [];

  if (filters.query?.trim()) {
    chips.push({ key: "query", label: "Search", value: filters.query.trim() });
  }

  if (filters.tool) {
    chips.push({
      key: "tool",
      label: "Tool",
      value: TOOL_LABELS[filters.tool] ?? filters.tool,
    });
  }

  if (filters.tag) {
    chips.push({ key: "tag", label: "Tag", value: filters.tag });
  }

  if (filters.isSensitive && filters.isSensitive !== "all") {
    chips.push({
      key: "isSensitive",
      label: "Sensitivity",
      value: SENSITIVITY_LABELS[filters.isSensitive],
    });
  }

  if (filters.focus) {
    chips.push({
      key: "focus",
      label: "Focus",
      value: FOCUS_LABELS[filters.focus],
    });
  }

  if (filters.qualityGap) {
    chips.push({
      key: "qualityGap",
      label: "Quality gap",
      value: qualityGapLabel(filters.qualityGap) ?? filters.qualityGap,
    });
  }

  if (filters.cwdPrefix?.trim()) {
    chips.push({
      key: "cwdPrefix",
      label: "Path",
      value: displayLocalPath(filters.cwdPrefix.trim()),
    });
  }

  if (filters.receivedFrom) {
    chips.push({
      key: "receivedFrom",
      label: "Start date",
      value: filters.receivedFrom,
    });
  }

  if (filters.receivedTo) {
    chips.push({
      key: "receivedTo",
      label: "End date",
      value: filters.receivedTo,
    });
  }

  return chips;
}
