import { describe, expect, it } from "vitest";

import type { LoopWorktreeResponse, ProjectSummary } from "./api.js";
import {
  isCurrentLoopWorktreeDetail,
  shouldLoadLoops,
  shouldLoadProjects,
  shouldNavigateLoopWorktree,
  updateProjectListItem,
} from "./workspace-query.js";

const baseProject = {
  project_id: "proj_1",
  label: "PromptLane",
  path_kind: "project_root",
  prompt_count: 1,
  latest_ingest: "2026-07-08T00:00:00.000Z",
  sensitive_count: 0,
  quality_gap_rate: 0,
  copied_count: 0,
  bookmarked_count: 0,
  policy: {
    capture_disabled: false,
    analysis_disabled: false,
    retention_candidate_days: undefined,
    external_analysis_opt_in: false,
    export_disabled: false,
    version: 1,
  },
} satisfies ProjectSummary;

const loopDetail = {
  worktree: "/workspace/promptlane",
  session_id: "session-1",
  branch: "main",
} as unknown as LoopWorktreeResponse;

describe("workspace query", () => {
  it("loads projects only when the projects view has no cached rows", () => {
    expect(shouldLoadProjects("list", 0)).toBe(false);
    expect(shouldLoadProjects("projects", 0)).toBe(true);
    expect(shouldLoadProjects("projects", 2)).toBe(false);
  });

  it("loads loop summaries only when the loops view has no cached response", () => {
    expect(shouldLoadLoops("list", false)).toBe(false);
    expect(shouldLoadLoops("loops", false)).toBe(true);
    expect(shouldLoadLoops("loops", true)).toBe(false);
  });

  it("updates one project summary without changing other projects", () => {
    const nextProject = { ...baseProject, project_id: "proj_2" };
    const updatedProject = {
      ...nextProject,
      policy: {
        ...nextProject.policy,
        capture_disabled: true,
      },
    };

    const updated = updateProjectListItem(
      [baseProject, nextProject],
      updatedProject,
    );

    expect(updated[0]).toBe(baseProject);
    expect(updated[1]).toEqual(updatedProject);
  });

  it("reuses cached loop worktree detail only when route filters match", () => {
    expect(
      isCurrentLoopWorktreeDetail(loopDetail, {
        worktree: "/workspace/promptlane",
        session: "session-1",
        branch: "main",
      }),
    ).toBe(true);
    expect(
      isCurrentLoopWorktreeDetail(loopDetail, {
        worktree: "/workspace/promptlane",
        session: "session-2",
        branch: "main",
      }),
    ).toBe(false);
    expect(
      isCurrentLoopWorktreeDetail(undefined, {
        worktree: "/workspace/promptlane",
      }),
    ).toBe(false);
  });

  it("navigates after selecting a different loop worktree scope", () => {
    expect(
      shouldNavigateLoopWorktree(
        { name: "list" },
        { worktree: "/workspace/promptlane" },
      ),
    ).toBe(false);
    expect(
      shouldNavigateLoopWorktree(
        { name: "loops", worktree: "/workspace/promptlane" },
        { worktree: "/workspace/promptlane" },
      ),
    ).toBe(false);
    expect(
      shouldNavigateLoopWorktree(
        { name: "loops", worktree: "/workspace/promptlane" },
        { worktree: "/workspace/promptlane", branch: "feature" },
      ),
    ).toBe(true);
  });
});
