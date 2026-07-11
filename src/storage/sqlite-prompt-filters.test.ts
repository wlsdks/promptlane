import { describe, expect, it } from "vitest";

import { buildPromptFilters } from "./sqlite-prompt-filters.js";

describe("buildPromptFilters", () => {
  it("keeps alias-aware filter clauses and SQL values aligned", () => {
    const filters = buildPromptFilters(
      {
        cwdPrefix: "workspace/project/",
        importJobId: "import_1",
        focus: "reused",
        qualityGap: "verification_criteria",
        receivedFrom: "2026-07-01",
        receivedTo: "2026-07-01",
      },
      "p",
    );

    expect(filters.values).toEqual([
      "workspace/project",
      "workspace/project/%",
      "%/workspace/project",
      "2026-07-01T00:00:00.000Z",
      "2026-07-01T23:59:59.999Z",
      "import_1",
      "verification_criteria",
    ]);
    expect(filters.clauses.join(" ")).toContain("p.deleted_at IS NULL");
    expect(filters.clauses.join(" ")).toContain("p.cwd LIKE ? ESCAPE");
    expect(filters.clauses.join(" ")).toContain("ir.prompt_id = p.id");
    expect(filters.clauses.join(" ")).toContain("prompt_bookmarks");
    expect(filters.clauses.join(" ")).toContain("prompt_usage_events");
    expect(filters.clauses.join(" ")).toContain("json_each(pa.checklist_json)");
  });

  it("uses the prompts table for unaliased duplicate filters", () => {
    const filters = buildPromptFilters({ focus: "duplicated" });

    expect(filters.clauses).toContain("deleted_at IS NULL");
    expect(filters.clauses.join(" ")).toContain(
      "prompts.stored_content_hash IN",
    );
    expect(filters.values).toEqual([]);
  });
});
