import type { FastifyInstance } from "fastify";
import { z } from "zod";

import {
  AGENT_GUIDE_TASK_TYPES,
  recommendAgentStrategy,
} from "../../agent-guide/recommendation.js";
import type {
  AgentRunStoragePort,
  LoopSnapshotStoragePort,
} from "../../storage/ports.js";
import { requireAppAccess, type ServerAuthConfig } from "../auth.js";
import { requireStorageCapabilities } from "../storage-capabilities.js";

const querySchema = z.object({
  snapshot_id: z.string().min(1).optional(),
  task_type: z.enum(AGENT_GUIDE_TASK_TYPES),
  failed_attempts: z.coerce.number().int().min(0).optional(),
  worktree_count: z.coerce.number().int().min(0).optional(),
  requires_independent_review: z.coerce.boolean().optional(),
});

export function registerAgentGuideRoutes(
  server: FastifyInstance,
  options: {
    auth: ServerAuthConfig;
    storage: Partial<AgentRunStoragePort & LoopSnapshotStoragePort>;
  },
): void {
  server.get("/api/v1/agent-guide", async (request, reply) => {
    requireAppAccess(request, options.auth);
    const query = querySchema.parse(request.query);
    const storage = requireStorageCapabilities(
      options.storage,
      ["listAgentRuns", "listLoopSnapshots"],
      { label: "Agent guide storage", instance: request.url },
    );
    const snapshots = storage.listLoopSnapshots({ limit: 100 }).items;
    const snapshot = query.snapshot_id
      ? snapshots.find((item) => item.id === query.snapshot_id)
      : snapshots.at(0);
    const projectId = snapshot?.project_id;
    if (!projectId) {
      return reply.send({
        data: {
          status: "empty",
          next_action: query.snapshot_id
            ? "Select an available local loop snapshot before requesting model guidance."
            : "Create a local loop snapshot before requesting model guidance.",
          privacy: {
            local_only: true,
            external_calls: false,
            auto_switches_model: false,
          },
        },
      });
    }
    const guide = recommendAgentStrategy({
      taskType: query.task_type,
      failedAttempts: query.failed_attempts,
      worktreeCount: query.worktree_count,
      requiresIndependentReview: query.requires_independent_review,
      matchingRuns: storage
        .listAgentRuns({ projectId, taskType: query.task_type })
        .map((run) => ({ outcomeStatus: run.outcome_status })),
    });
    return reply.send({ data: guide });
  });
}
