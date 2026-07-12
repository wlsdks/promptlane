import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import type { ActionInboxReport } from "./action-inbox-api.js";
import { ActionsView } from "./actions-view.js";

describe("ActionsView", () => {
  it("separates explicit local actions from observational outcomes", () => {
    const html = renderToStaticMarkup(
      createElement(ActionsView, {
        loading: false,
        onConfirmFailure: async () => undefined,
        onRefresh: async () => undefined,
        report: fixture(),
      }),
    );
    expect(html).toContain("Action inbox");
    expect(html).toContain("Confirm failure");
    expect(html).toContain("Local outcomes");
    expect(html).toContain("Observed, not causal");
    expect(html).toContain("Operator-local work stays separate");
    expect(html).toContain("Recurring failure patterns");
    expect(html).toContain("Validation");
    expect(html).toContain("2 confirmed episodes");
    expect(html).toContain("2 sessions");
    expect(html).not.toContain("prompt body");
  });
});

function fixture(): ActionInboxReport {
  return {
    generated_at: "2026-07-12T12:00:00.000Z",
    summary: {
      total: 1,
      critical: 0,
      failure_review: 1,
      continuation_debt: 0,
      evidence_debt: 0,
      memory_review: 0,
      recurring_failure_categories: 1,
    },
    items: [
      {
        id: "confirm_failure:loop_failed",
        kind: "confirm_failure",
        priority: "high",
        snapshot_id: "loop_failed",
        project_id: "proj_one",
        project: "project",
        worktree: "primary",
        created_at: "2026-07-12T11:00:00.000Z",
        title: "Confirm the failure episode",
        reason: "Operator confirmation is required.",
        next_action: "looprelay loop failure record --snapshot-id loop_failed",
        source: "operator_local",
      },
    ],
    outcomes: [
      {
        snapshot_id: "loop_failed",
        project_id: "proj_one",
        project: "project",
        created_at: "2026-07-12T11:00:00.000Z",
        status: "failed",
        evidence_count: 1,
        locally_verified_evidence: 0,
        declared_evidence: 0,
        memory_approved: false,
      },
    ],
    failure_patterns: [
      {
        category: "validation",
        total: 2,
        session_count: 2,
        open: 1,
        resolved: 1,
        wont_fix: 0,
        recurring: true,
        last_confirmed_at: "2026-07-12T11:00:00.000Z",
      },
    ],
    privacy: {
      local_only: true,
      stores_prompt_bodies: false,
      stores_raw_paths: false,
      stores_transcripts: false,
      causal_claim: false,
    },
  };
}
