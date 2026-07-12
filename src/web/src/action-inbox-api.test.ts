import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const fetchMock = vi.fn<typeof fetch>();
beforeEach(() => {
  vi.resetModules();
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockReset();
});
afterEach(() => vi.unstubAllGlobals());

describe("action inbox API", () => {
  it("loads a validated local-only report", async () => {
    fetchMock
      .mockResolvedValueOnce(response({ data: { csrf_token: "csrf-actions" } }))
      .mockResolvedValueOnce(response({ data: report() }));
    const { getActionInbox } = await import("./action-inbox-api.js");
    await expect(getActionInbox()).resolves.toMatchObject({
      summary: { total: 1 },
      items: [expect.objectContaining({ kind: "confirm_failure" })],
      privacy: { causal_claim: false },
    });
  });

  it("records a failure with csrf and rejects malformed reports", async () => {
    fetchMock
      .mockResolvedValueOnce(response({ data: { csrf_token: "csrf-actions" } }))
      .mockResolvedValueOnce(
        response({
          data: {
            recorded: true,
            episode: {
              id: "fail_one",
              snapshot_id: "loop_failed",
              category: "validation",
              status: "open",
              intervention: "Run focused checks.",
              privacy: { inferred: false },
            },
          },
        }),
      );
    const { recordFailureEpisode } = await import("./action-inbox-api.js");
    await recordFailureEpisode({
      snapshot_id: "loop_failed",
      category: "validation",
      status: "open",
      intervention: "Run focused checks.",
      confirmed_by: "web",
    });
    expect(fetchMock).toHaveBeenLastCalledWith(
      "/api/v1/failure-episodes",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ "x-csrf-token": "csrf-actions" }),
      }),
    );
  });
});

function report() {
  return {
    generated_at: "2026-07-12T12:00:00.000Z",
    summary: {
      total: 1,
      critical: 0,
      failure_review: 1,
      continuation_debt: 0,
      evidence_debt: 0,
      memory_review: 0,
      recurring_failure_categories: 0,
    },
    items: [
      {
        id: "confirm_failure:loop_failed",
        kind: "confirm_failure",
        priority: "high",
        snapshot_id: "loop_failed",
        project_id: "proj_one",
        project: "project",
        created_at: "2026-07-12T11:00:00.000Z",
        title: "Confirm the failure episode",
        reason: "Operator confirmation is required.",
        next_action: "looprelay loop failure record --snapshot-id loop_failed",
        source: "operator_local",
      },
    ],
    outcomes: [],
    failure_patterns: [],
    privacy: {
      local_only: true,
      stores_prompt_bodies: false,
      stores_raw_paths: false,
      stores_transcripts: false,
      causal_claim: false,
    },
  };
}

function response(value: unknown): Response {
  return {
    ok: true,
    json: async () => value,
  } as Response;
}
