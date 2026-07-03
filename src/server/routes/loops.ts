import type { FastifyInstance } from "fastify";

import {
  createLoopBrief,
  latestCompactBoundaryAfterSnapshot,
} from "../../loop/brief.js";
import type {
  CompactBoundaryStoragePort,
  LoopSnapshotStoragePort,
} from "../../storage/ports.js";
import { requireAppAccess, type ServerAuthConfig } from "../auth.js";
import { problem } from "../errors.js";

export type LoopRouteOptions = {
  auth: ServerAuthConfig;
  storage: Partial<LoopSnapshotStoragePort & CompactBoundaryStoragePort>;
};

export function registerLoopRoutes(
  server: FastifyInstance,
  options: LoopRouteOptions,
): void {
  server.get("/api/v1/loops", async (request) => {
    requireAppAccess(request, options.auth);

    const snapshots = options.storage.listLoopSnapshots?.({ limit: 100 }).items ?? [];
    const boundaries =
      options.storage.listCompactBoundaries?.({ limit: 100 }).items ?? [];

    return {
      data: {
        items: snapshots.map((snapshot) => {
          const compactBoundary = latestCompactBoundaryAfterSnapshot(
            snapshot,
            boundaries,
          );

          return {
            id: snapshot.id,
            created_at: snapshot.created_at,
            tool: snapshot.tool,
            source: snapshot.source,
            project: snapshot.cwd_label,
            branch: snapshot.branch,
            worktree: snapshot.worktree_label,
            prompt_count: snapshot.event_counts.prompts,
            average_prompt_score: snapshot.quality.average_prompt_score,
            top_gaps: snapshot.quality.top_gaps,
            outcome_status: snapshot.outcome.status,
            compact_boundary: compactBoundary,
          };
        }),
        privacy: {
          local_only: true,
          returns_prompt_bodies: false,
          returns_raw_paths: false,
          returns_compact_content: false,
        },
      },
    };
  });

  server.get("/api/v1/loops/:id/brief", async (request) => {
    requireAppAccess(request, options.auth);
    const params = request.params as { id: string };
    const snapshots =
      options.storage.listLoopSnapshots?.({ limit: 100 }).items ?? [];
    const snapshot = snapshots.find((item) => item.id === params.id);

    if (!snapshot) {
      throw problem(404, "Not Found", "Loop snapshot not found.", request.url);
    }

    const boundaries =
      options.storage.listCompactBoundaries?.({ limit: 100 }).items ?? [];

    return {
      data: createLoopBrief({
        snapshot,
        compactBoundary: latestCompactBoundaryAfterSnapshot(
          snapshot,
          boundaries,
        ),
      }),
    };
  });
}
