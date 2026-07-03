import { beforeEach, describe, expect, it, vi } from "vitest";

import type { AnonymizedExportPayload, ExportJob } from "./api.js";

const fetchMock = vi.fn();

beforeEach(() => {
  fetchMock.mockReset();
  vi.resetModules();
  vi.stubGlobal("fetch", fetchMock);
});

describe("web api export client", () => {
  it("lists Loopdeck snapshots without raw prompt or compact content", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(
        jsonResponse({
          data: {
            status: {
              status: "ready",
              snapshot_count: 1,
              project_memory: {
                approved_count: 1,
                included_in_brief: true,
              },
              memory_candidate: {
                eligible: true,
                reason: "passed_with_evidence",
                next_action: "prompt-coach loop memory-approve",
              },
              latest_snapshot: {
                id: "loop_web",
                created_at: "2026-07-04T01:00:00.000Z",
                tool: "codex",
                source: "cli",
                project: "private-project",
                prompt_count: 2,
                average_prompt_score: 58,
                top_gaps: ["Goal clarity"],
                outcome_status: "unknown",
              },
              next_action: "prompt-coach loop collect",
              next_actions: ["Run prompt-coach loop collect again"],
              privacy: {
                local_only: true,
                external_calls: false,
                returns_prompt_bodies: false,
                returns_raw_paths: false,
                returns_compact_content: false,
              },
            },
            items: [
              {
                id: "loop_web",
                created_at: "2026-07-04T01:00:00.000Z",
                tool: "codex",
                source: "cli",
                project: "private-project",
                prompt_count: 2,
                average_prompt_score: 58,
                top_gaps: ["Goal clarity"],
                outcome_status: "unknown",
                compact_boundary: {
                  id: "cmp_web",
                  created_at: "2026-07-04T01:05:00.000Z",
                  tool: "claude-code",
                  event_name: "PostCompact",
                  trigger: "auto",
                  after_latest_snapshot: true,
                },
              },
            ],
            privacy: {
              local_only: true,
              returns_prompt_bodies: false,
              returns_raw_paths: false,
              returns_compact_content: false,
            },
          },
        }),
      );
    const { listLoops } = await import("./api.js");

    const loops = await listLoops();

    expect(loops.items).toHaveLength(1);
    expect(loops.status.status).toBe("ready");
    expect(loops.status.next_action).toBe("prompt-coach loop collect");
    expect(loops.status.project_memory).toEqual({
      approved_count: 1,
      included_in_brief: true,
    });
    expect(loops.status.memory_candidate).toEqual({
      eligible: true,
      reason: "passed_with_evidence",
      next_action: "prompt-coach loop memory-approve",
    });
    expect(loops.items[0]).toMatchObject({
      id: "loop_web",
      project: "private-project",
      compact_boundary: {
        event_name: "PostCompact",
        after_latest_snapshot: true,
      },
    });
    expect(fetchMock).toHaveBeenLastCalledWith("/api/v1/loops", {
      credentials: "same-origin",
    });
    expect(JSON.stringify(loops)).not.toContain("Make this better");
    expect(JSON.stringify(loops)).not.toContain("Compact summary");
    expect(JSON.stringify(loops)).not.toContain("/Users/example");
  });

  it("gets a copy-ready Loopdeck brief without raw prompt or compact content", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(
        jsonResponse({
          data: {
            title: "Continue agent loop loop_web",
            source_snapshot_id: "loop_web",
            prompt:
              "## Goal\nContinue the current coding-agent loop.\n\n## Compaction Boundary\nPostCompact at 2026-07-04T01:05:00.000Z.",
            compact_boundary: {
              id: "cmp_web",
              created_at: "2026-07-04T01:05:00.000Z",
              tool: "claude-code",
              event_name: "PostCompact",
              trigger: "auto",
              after_latest_snapshot: true,
            },
            privacy: {
              local_only: true,
              returns_prompt_bodies: false,
              returns_raw_paths: false,
            },
          },
        }),
      );
    const { getLoopBrief } = await import("./api.js");

    const brief = await getLoopBrief("loop_web");

    expect(brief).toMatchObject({
      title: "Continue agent loop loop_web",
      source_snapshot_id: "loop_web",
      compact_boundary: {
        event_name: "PostCompact",
        after_latest_snapshot: true,
      },
    });
    expect(fetchMock).toHaveBeenLastCalledWith(
      "/api/v1/loops/loop_web/brief",
      {
        credentials: "same-origin",
      },
    );
    expect(JSON.stringify(brief)).not.toContain("Make this better");
    expect(JSON.stringify(brief)).not.toContain("Compact summary");
    expect(JSON.stringify(brief)).not.toContain("/Users/example");
  });

  it("approves the latest eligible loop memory candidate with csrf", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(
        jsonResponse({
          data: {
            recorded: true,
            memory: {
              id: "mem_web",
              snapshot_id: "loop_web",
              title: "Remember loop outcome for private-project",
              evidence_refs: ["test:web loops"],
              approved_by: "web",
              created_at: "2026-07-04T01:10:00.000Z",
              privacy: {
                local_only: true,
                stores_prompt_bodies: false,
                stores_raw_paths: false,
                writes_instruction_files: false,
                external_calls: false,
              },
            },
            next_action:
              "use recorded memory as local context in future loop briefs",
            next_actions: [
              "prompt-coach loop brief",
              "prompt-coach loop instruction-patch --target-file AGENTS.md",
            ],
            privacy: {
              local_only: true,
              returns_prompt_bodies: false,
              returns_raw_paths: false,
              writes_instruction_files: false,
              external_calls: false,
            },
          },
        }),
      );
    const { approveLoopMemory } = await import("./api.js");

    const result = await approveLoopMemory({ approvedBy: "web" });

    expect(result.recorded).toBe(true);
    expect(result.next_actions).toEqual([
      "prompt-coach loop brief",
      "prompt-coach loop instruction-patch --target-file AGENTS.md",
    ]);
    expect(fetchMock).toHaveBeenLastCalledWith(
      "/api/v1/loops/memory/approve",
      {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "content-type": "application/json",
          "x-csrf-token": "csrf-1",
        },
        body: JSON.stringify({ approved_by: "web" }),
      },
    );
    expect(JSON.stringify(result)).not.toContain("Make this better");
    expect(JSON.stringify(result)).not.toContain("/Users/example");
    expect(JSON.stringify(result)).not.toContain("sk-proj-secret");
  });

  it("gets a review-only instruction patch proposal for the latest approved loop memory", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(
        jsonResponse({
          data: {
            target_file: "AGENTS.md",
            patch_kind: "append_section",
            title: "Append approved Loopdeck memory to AGENTS.md",
            diff: "--- a/AGENTS.md\n+++ b/AGENTS.md\n@@\n+## Loopdeck Memories\n+  source_memory: mem_web\n",
            writes_files: false,
            requires_user_approval: true,
            source_memory_id: "mem_web",
            apply_gate: {
              web_apply_available: false,
              confirm_command:
                "prompt-coach loop instruction-apply --target-file AGENTS.md --confirm-apply",
              mcp_tool: "apply_instruction_patch",
              reason:
                "web review does not write files; apply through CLI or MCP with explicit confirmation",
            },
            next_action:
              "review this patch proposal, then apply it manually only if the instruction belongs in the project",
            privacy: {
              local_only: true,
              external_calls: false,
              returns_prompt_bodies: false,
              returns_raw_paths: false,
              writes_instruction_files: false,
            },
          },
        }),
      );
    const { getLoopInstructionPatch } = await import("./api.js");

    const proposal = await getLoopInstructionPatch({ targetFile: "AGENTS.md" });

    expect(proposal.writes_files).toBe(false);
    expect(proposal.requires_user_approval).toBe(true);
    expect(proposal.apply_gate).toEqual({
      web_apply_available: false,
      confirm_command:
        "prompt-coach loop instruction-apply --target-file AGENTS.md --confirm-apply",
      mcp_tool: "apply_instruction_patch",
      reason:
        "web review does not write files; apply through CLI or MCP with explicit confirmation",
    });
    expect(proposal.diff).toContain("+++ b/AGENTS.md");
    expect(fetchMock).toHaveBeenLastCalledWith(
      "/api/v1/loops/instruction-patch?target_file=AGENTS.md",
      {
        credentials: "same-origin",
      },
    );
    expect(JSON.stringify(proposal)).not.toContain("Make this better");
    expect(JSON.stringify(proposal)).not.toContain("/Users/example");
    expect(JSON.stringify(proposal)).not.toContain("sk-proj-secret");
  });

  it("shares an in-flight csrf session request across parallel API calls", async () => {
    fetchMock.mockImplementation(async (url: string) => {
      if (url === "/api/v1/session") {
        await Promise.resolve();
        return jsonResponse({ data: { csrf_token: "csrf-1" } });
      }

      if (url === "/api/v1/settings") {
        return jsonResponse({
          data: {
            data_dir: "/Users/example/.prompt-coach",
            excluded_project_roots: [],
            redaction_mode: "mask",
            server: { host: "127.0.0.1", port: 17373 },
          },
        });
      }

      if (url === "/api/v1/quality") {
        return jsonResponse({ data: { total_prompts: 0 } });
      }

      if (url === "/api/v1/score?limit=200&low_score_limit=8") {
        return jsonResponse({ data: { low_score_prompts: [] } });
      }

      throw new Error(`Unexpected URL: ${url}`);
    });
    const { getArchiveScoreReport, getQualityDashboard, getSettings } =
      await import("./api.js");

    await Promise.all([
      getSettings(),
      getQualityDashboard(),
      getArchiveScoreReport(),
    ]);

    expect(
      fetchMock.mock.calls.filter(([url]) => url === "/api/v1/session"),
    ).toHaveLength(1);
  });

  it("creates anonymized export previews with csrf and returns raw-free job data", async () => {
    const job: ExportJob = {
      id: "exp_abcdef123456",
      preset: "anonymized_review",
      status: "previewed",
      prompt_id_hashes: ["ph_abcdef123456"],
      project_policy_versions: { proj_abcdef123456: 1 },
      redaction_version: "mask-v1",
      counts: {
        prompt_count: 1,
        sensitive_count: 1,
        included_fields: ["masked_prompt", "tags"],
        excluded_fields: ["cwd", "stable_prompt_id"],
        residual_identifier_counts: { path: 1 },
        small_set_warning: true,
      },
      expires_at: "2026-05-03T12:00:00.000Z",
      created_at: "2026-05-02T12:00:00.000Z",
    };
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(jsonResponse({ data: job }));
    const { createExportPreview } = await import("./api.js");

    const preview = await createExportPreview("anonymized_review");

    expect(preview).toEqual(job);
    expect(fetchMock).toHaveBeenLastCalledWith("/api/v1/exports/preview", {
      method: "POST",
      credentials: "same-origin",
      headers: {
        "content-type": "application/json",
        "x-csrf-token": "csrf-1",
      },
      body: JSON.stringify({ preset: "anonymized_review" }),
    });
    expect(JSON.stringify(preview)).not.toContain("prmt_");
    expect(JSON.stringify(preview)).not.toContain("/Users/example");
    expect(JSON.stringify(preview)).not.toContain("sk-proj");
  });

  it("executes anonymized export jobs by job id", async () => {
    const payload: AnonymizedExportPayload = {
      job_id: "exp_abcdef123456",
      preset: "anonymized_review",
      redaction_version: "mask-v1",
      generated_at: "2026-05-02T12:01:00.000Z",
      count: 1,
      items: [
        {
          anonymous_id: "anon_abcdef123456",
          tool: "claude-code",
          coarse_date: "2026-05-02",
          project_alias: "prompt-coach",
          prompt: "Fix [REDACTED:path] with [REDACTED:api_key]",
          tags: ["backend"],
          quality_gaps: ["Verification criteria"],
        },
      ],
    };
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(jsonResponse({ data: payload }));
    const { executeExportJob } = await import("./api.js");

    const exported = await executeExportJob("exp_abcdef123456");

    expect(exported).toEqual(payload);
    expect(fetchMock).toHaveBeenLastCalledWith("/api/v1/exports", {
      method: "POST",
      credentials: "same-origin",
      headers: {
        "content-type": "application/json",
        "x-csrf-token": "csrf-1",
      },
      body: JSON.stringify({ job_id: "exp_abcdef123456" }),
    });
  });

  it("fetches the coach feedback summary without CSRF and parses ratios", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(
        jsonResponse({
          data: {
            total: 4,
            helpful: 3,
            not_helpful: 1,
            wrong: 0,
            helpful_ratio: 0.75,
          },
        }),
      );
    const { getCoachFeedbackSummary } = await import("./api.js");

    const summary = await getCoachFeedbackSummary();

    expect(summary).toEqual({
      total: 4,
      helpful: 3,
      not_helpful: 1,
      wrong: 0,
      helpful_ratio: 0.75,
    });
    expect(fetchMock).toHaveBeenLastCalledWith(
      "/api/v1/coach-feedback/summary",
      { credentials: "same-origin" },
    );
  });

  it("posts coach feedback with CSRF for a specific prompt id", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(
        jsonResponse({
          data: {
            id: "cfb_abcdef",
            prompt_id: "prmt_xyz",
            rating: "helpful",
            created_at: "2026-05-04T00:00:00.000Z",
          },
        }),
      );
    const { sendCoachFeedback } = await import("./api.js");

    const result = await sendCoachFeedback({
      promptId: "prmt_xyz",
      rating: "helpful",
    });

    expect(result.rating).toBe("helpful");
    expect(fetchMock).toHaveBeenLastCalledWith(
      "/api/v1/prompts/prmt_xyz/coach-feedback",
      {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "content-type": "application/json",
          "x-csrf-token": "csrf-1",
        },
        body: JSON.stringify({ rating: "helpful" }),
      },
    );
  });

  it("posts the import dry-run upload with CSRF and returns the raw-free summary", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(
        jsonResponse({
          data: {
            dry_run: true,
            source_type: "manual-jsonl",
            source_path_hash: "path_aabbccdd",
            records_read: 1,
            prompt_candidates: 1,
            sensitive_prompt_count: 1,
            parse_errors: 0,
            skipped_records: {
              assistant_or_tool: 0,
              empty_prompt: 0,
              unsupported_record: 0,
              too_large: 0,
            },
            samples: [],
          },
        }),
      );
    const { previewImportDryRun } = await import("./api.js");

    const result = await previewImportDryRun({
      sourceType: "manual-jsonl",
      content: "line1\n",
    });

    expect(result).toMatchObject({
      dry_run: true,
      source_type: "manual-jsonl",
      prompt_candidates: 1,
      sensitive_prompt_count: 1,
    });
    expect(fetchMock).toHaveBeenLastCalledWith("/api/v1/import/dry-run", {
      method: "POST",
      credentials: "same-origin",
      headers: {
        "content-type": "application/json",
        "x-csrf-token": "csrf-1",
      },
      body: JSON.stringify({
        source_type: "manual-jsonl",
        content: "line1\n",
      }),
    });
  });

  it("includes the HTTP status and detail in error messages", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(
        errorResponse(403, { detail: "Forbidden by policy" }),
      );
    const { deletePrompt } = await import("./api.js");

    await expect(deletePrompt("prmt_x")).rejects.toThrow(
      /Delete failed \(403\): Forbidden by policy/,
    );
  });

  it("still surfaces the status when the error body is not JSON", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(errorResponse(500, undefined));
    const { deletePrompt } = await import("./api.js");

    await expect(deletePrompt("prmt_y")).rejects.toThrow(
      /Delete failed \(500\)/,
    );
  });

  it("analyzes project instruction files with csrf", async () => {
    const review = {
      generated_at: "2026-05-03T00:00:00.000Z",
      analyzer: "local-project-instructions-v1",
      score: { value: 80, max: 100, band: "good" },
      files_found: 1,
      files: [],
      checklist: [],
      suggestions: [],
      privacy: {
        local_only: true,
        external_calls: false,
        stores_file_bodies: false,
        returns_file_bodies: false,
        returns_raw_paths: false,
      },
    };
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { csrf_token: "csrf-1" } }))
      .mockResolvedValueOnce(jsonResponse({ data: review }));
    const { analyzeProjectInstructions } = await import("./api.js");

    const result = await analyzeProjectInstructions("proj_abcdef123456");

    expect(result).toEqual(review);
    expect(fetchMock).toHaveBeenLastCalledWith(
      "/api/v1/projects/proj_abcdef123456/instructions/analyze",
      {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "x-csrf-token": "csrf-1",
        },
      },
    );
  });
});

function jsonResponse(body: unknown): Response {
  return {
    ok: true,
    json: async () => body,
  } as Response;
}

function errorResponse(status: number, body: unknown): Response {
  return {
    ok: false,
    status,
    json: async () => {
      if (body === undefined) {
        throw new Error("not json");
      }
      return body;
    },
  } as unknown as Response;
}
