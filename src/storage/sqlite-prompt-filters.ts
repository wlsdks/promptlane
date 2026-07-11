import type { ListPromptsOptions } from "./ports.js";

export type PromptSqlFilters = {
  clauses: string[];
  values: unknown[];
};

export function buildPromptFilters(
  options: Omit<ListPromptsOptions, "cursor">,
  tableAlias?: string,
): PromptSqlFilters {
  const filters: PromptSqlFilters = {
    clauses: [`${prefixFor(tableAlias)}deleted_at IS NULL`],
    values: [],
  };

  addBasicFilters(filters, options, tableAlias);
  addImportFilter(filters, options.importJobId, tableAlias);
  addTagFilter(filters, options.tag, tableAlias);
  addFocusFilter(filters, options.focus, tableAlias);
  addQualityGapFilter(filters, options.qualityGap, tableAlias);

  return filters;
}

function addBasicFilters(
  filters: PromptSqlFilters,
  options: Omit<ListPromptsOptions, "cursor">,
  tableAlias?: string,
): void {
  const prefix = prefixFor(tableAlias);
  if (options.tool) addClause(filters, `${prefix}tool = ?`, options.tool);
  if (options.sessionId) {
    addClause(filters, `${prefix}session_id = ?`, options.sessionId);
  }
  if (options.cwdPrefix) addCwdPrefixFilter(filters, options.cwdPrefix, prefix);
  if (options.isSensitive !== undefined) {
    addClause(
      filters,
      `${prefix}is_sensitive = ?`,
      options.isSensitive ? 1 : 0,
    );
  }
  if (options.receivedFrom) {
    addClause(
      filters,
      `${prefix}received_at >= ?`,
      lowerDateBound(options.receivedFrom),
    );
  }
  if (options.receivedTo) {
    addClause(
      filters,
      `${prefix}received_at <= ?`,
      upperDateBound(options.receivedTo),
    );
  }
}

function addCwdPrefixFilter(
  filters: PromptSqlFilters,
  cwdPrefix: string,
  prefix: string,
): void {
  const normalized = cwdPrefix.replace(/\/+$/, "");
  const escaped = escapeLike(normalized);
  const matches = [`${prefix}cwd = ?`, `${prefix}cwd LIKE ? ESCAPE '\\'`];
  filters.values.push(normalized, `${escaped}/%`);
  if (!normalized.startsWith("/")) {
    matches.push(`${prefix}cwd LIKE ? ESCAPE '\\'`);
    filters.values.push(`%/${escaped}`);
  }
  filters.clauses.push(`(${matches.join(" OR ")})`);
}

function addImportFilter(
  filters: PromptSqlFilters,
  importJobId: string | undefined,
  tableAlias?: string,
): void {
  if (!importJobId) return;
  addClause(
    filters,
    `EXISTS (
      SELECT 1 FROM import_records ir
      WHERE ir.prompt_id = ${promptIdExpression(tableAlias)}
        AND ir.job_id = ? AND ir.status IN ('imported', 'duplicate')
    )`,
    importJobId,
  );
}

function addTagFilter(
  filters: PromptSqlFilters,
  tag: string | undefined,
  tableAlias?: string,
): void {
  if (!tag) return;
  addClause(
    filters,
    `EXISTS (
      SELECT 1 FROM prompt_tags pt JOIN tags t ON t.id = pt.tag_id
      WHERE pt.prompt_id = ${promptIdExpression(tableAlias)} AND t.name = ?
    )`,
    tag,
  );
}

function addFocusFilter(
  filters: PromptSqlFilters,
  focus: ListPromptsOptions["focus"],
  tableAlias?: string,
): void {
  if (!focus) return;
  const promptId = promptIdExpression(tableAlias);
  if (focus === "saved") {
    filters.clauses.push(bookmarkExists(promptId));
  } else if (focus === "reused") {
    filters.clauses.push(
      `(${bookmarkExists(promptId)} OR ${copyExists(promptId)})`,
    );
  } else if (focus === "duplicated") {
    filters.clauses.push(`${storedHashExpression(tableAlias)} IN (
      SELECT stored_content_hash FROM prompts WHERE deleted_at IS NULL
      GROUP BY stored_content_hash HAVING COUNT(*) > 1
    )`);
  } else {
    filters.clauses.push(`EXISTS (
      SELECT 1 FROM prompt_analyses pa WHERE pa.prompt_id = ${promptId}
        AND (pa.checklist_json LIKE '%"status":"missing"%'
          OR pa.checklist_json LIKE '%"status":"weak"%')
    )`);
  }
}

function addQualityGapFilter(
  filters: PromptSqlFilters,
  qualityGap: ListPromptsOptions["qualityGap"],
  tableAlias?: string,
): void {
  if (!qualityGap) return;
  addClause(
    filters,
    `EXISTS (
      SELECT 1 FROM prompt_analyses pa, json_each(pa.checklist_json) je
      WHERE pa.prompt_id = ${promptIdExpression(tableAlias)}
        AND json_extract(je.value, '$.key') = ?
        AND json_extract(je.value, '$.status') IN ('missing', 'weak')
    )`,
    qualityGap,
  );
}

function addClause(
  filters: PromptSqlFilters,
  clause: string,
  value: unknown,
): void {
  filters.clauses.push(clause);
  filters.values.push(value);
}

function prefixFor(tableAlias?: string): string {
  return tableAlias ? `${tableAlias}.` : "";
}

function promptIdExpression(tableAlias?: string): string {
  return tableAlias ? `${tableAlias}.id` : "prompts.id";
}

function storedHashExpression(tableAlias?: string): string {
  return tableAlias
    ? `${tableAlias}.stored_content_hash`
    : "prompts.stored_content_hash";
}

function bookmarkExists(promptId: string): string {
  return `EXISTS (SELECT 1 FROM prompt_bookmarks pb WHERE pb.prompt_id = ${promptId})`;
}

function copyExists(promptId: string): string {
  return `EXISTS (
    SELECT 1 FROM prompt_usage_events pue
    WHERE pue.prompt_id = ${promptId} AND pue.event_type = 'prompt_copied'
  )`;
}

function lowerDateBound(value: string): string {
  return isDateOnly(value) ? `${value}T00:00:00.000Z` : value;
}

function upperDateBound(value: string): string {
  return isDateOnly(value) ? `${value}T23:59:59.999Z` : value;
}

function isDateOnly(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function escapeLike(value: string): string {
  return value
    .replaceAll("\\", "\\\\")
    .replaceAll("%", "\\%")
    .replaceAll("_", "\\_");
}
