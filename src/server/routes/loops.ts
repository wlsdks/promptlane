import type { FastifyInstance } from "fastify";

import {
  createLoopBrief,
  latestCompactBoundaryAfterSnapshot,
} from "../../loop/brief.js";
import {
  createLoopdeckStatus,
  toLoopdeckStatusSnapshot,
} from "../../loop/status.js";
import type {
  CompactBoundaryStoragePort,
  LoopMemoryStoragePort,
  LoopSnapshotStoragePort,
} from "../../storage/ports.js";
import { requireAppAccess, type ServerAuthConfig } from "../auth.js";
import { problem } from "../errors.js";

export type LoopRouteOptions = {
  auth: ServerAuthConfig;
  storage: Partial<
    LoopSnapshotStoragePort & CompactBoundaryStoragePort & LoopMemoryStoragePort
  >;
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
    const status = createLoopdeckStatus({
      snapshots,
      compactBoundaries: boundaries,
    });

    return {
      data: {
        status,
        items: snapshots.map((snapshot) => {
          const compactBoundary = latestCompactBoundaryAfterSnapshot(
            snapshot,
            boundaries,
          );

          return {
            ...toLoopdeckStatusSnapshot(snapshot),
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
        approvedMemories:
          options.storage.listLoopMemories?.({ limit: 3 }).items ?? [],
      }),
    };
  });
}
