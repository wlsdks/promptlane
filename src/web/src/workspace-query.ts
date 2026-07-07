import { useCallback, useEffect, useState } from "react";

import type {
  LoopListResponse,
  LoopWorktreeResponse,
  ProjectSummary,
} from "./api.js";
import type { View } from "./routing.js";

export type LoopWorktreeSelection = {
  worktree: string;
  branch?: string;
  session?: string;
};

export function shouldLoadProjects(
  viewName: View["name"],
  projectCount: number,
): boolean {
  return viewName === "projects" && projectCount === 0;
}

export function shouldLoadLoops(
  viewName: View["name"],
  hasLoops: boolean,
): boolean {
  return viewName === "loops" && !hasLoops;
}

export function updateProjectListItem(
  projects: ProjectSummary[],
  nextProject: ProjectSummary,
): ProjectSummary[] {
  return projects.map((project) =>
    project.project_id === nextProject.project_id ? nextProject : project,
  );
}

export function isCurrentLoopWorktreeDetail(
  detail: LoopWorktreeResponse | undefined,
  selection: LoopWorktreeSelection,
): boolean {
  return (
    detail?.worktree === selection.worktree &&
    detail.session_id === selection.session &&
    detail.branch === selection.branch
  );
}

export function shouldNavigateLoopWorktree(
  view: View,
  selection: LoopWorktreeSelection,
): boolean {
  return (
    view.name === "loops" &&
    (view.worktree !== selection.worktree ||
      view.session !== selection.session ||
      view.branch !== selection.branch)
  );
}

export function useWorkspaceQuery({
  currentView,
  getLoopWorktree,
  listLoops,
  listProjects,
  navigate,
  onError,
}: {
  currentView: View;
  getLoopWorktree(
    worktree: string,
    options?: { branch?: string; sessionId?: string },
  ): Promise<LoopWorktreeResponse>;
  listLoops(): Promise<LoopListResponse>;
  listProjects(): Promise<ProjectSummary[]>;
  navigate(view: View): void;
  onError(message: string | undefined): void;
}): {
  loops: LoopListResponse | undefined;
  loopWorktree: LoopWorktreeResponse | undefined;
  openLoopWorktree(selection: LoopWorktreeSelection): Promise<void>;
  projects: ProjectSummary[];
  setLoops: (loops: LoopListResponse | undefined) => void;
  updateProject(project: ProjectSummary): void;
} {
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [loops, setLoops] = useState<LoopListResponse | undefined>();
  const [loopWorktree, setLoopWorktree] = useState<
    LoopWorktreeResponse | undefined
  >();

  useEffect(() => {
    if (!shouldLoadProjects(currentView.name, projects.length)) {
      return;
    }

    void listProjects()
      .then(setProjects)
      .catch(() => undefined);
  }, [currentView.name, listProjects, projects.length]);

  useEffect(() => {
    if (!shouldLoadLoops(currentView.name, Boolean(loops))) {
      return;
    }

    void listLoops()
      .then(setLoops)
      .catch(() => undefined);
  }, [currentView.name, listLoops, loops]);

  const openLoopWorktree = useCallback(
    async (selection: LoopWorktreeSelection): Promise<void> => {
      onError(undefined);
      try {
        setLoopWorktree(
          await getLoopWorktree(selection.worktree, {
            branch: selection.branch,
            sessionId: selection.session,
          }),
        );
        if (shouldNavigateLoopWorktree(currentView, selection)) {
          navigate({
            name: "loops",
            worktree: selection.worktree,
            ...(selection.session ? { session: selection.session } : {}),
            ...(selection.branch ? { branch: selection.branch } : {}),
          });
        }
      } catch {
        onError("Could not load loop worktree detail.");
      }
    },
    [currentView, getLoopWorktree, navigate, onError],
  );

  useEffect(() => {
    if (currentView.name !== "loops" || !currentView.worktree) {
      return;
    }

    const selection: LoopWorktreeSelection = {
      worktree: currentView.worktree,
      ...(currentView.session ? { session: currentView.session } : {}),
      ...(currentView.branch ? { branch: currentView.branch } : {}),
    };
    if (isCurrentLoopWorktreeDetail(loopWorktree, selection)) {
      return;
    }

    void openLoopWorktree(selection);
  }, [currentView, loopWorktree, openLoopWorktree]);

  return {
    loops,
    loopWorktree,
    openLoopWorktree,
    projects,
    setLoops,
    updateProject(project): void {
      setProjects((current) => updateProjectListItem(current, project));
    },
  };
}
