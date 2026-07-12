import type { FastifyInstance } from "fastify";
import { z } from "zod";

import {
  createActionInboxFromStorage,
  type ActionInboxStorage,
} from "../../loop/action-inbox-service.js";
import { parseFailureEpisodeInput } from "../../loop/failure-episode.js";
import type {
  ContinuationReceiptStoragePort,
  FailureEpisodeStoragePort,
  LoopMemoryStoragePort,
  LoopSnapshotStoragePort,
} from "../../storage/ports.js";
import { requireAppAccess, type ServerAuthConfig } from "../auth.js";
import { problem } from "../errors.js";
import { requireStorageCapabilities } from "../storage-capabilities.js";

type ActionRouteStorage = LoopSnapshotStoragePort &
  ContinuationReceiptStoragePort &
  LoopMemoryStoragePort &
  FailureEpisodeStoragePort;

export type ActionRouteOptions = {
  auth: ServerAuthConfig;
  storage: Partial<ActionRouteStorage>;
};

const FailureEpisodeBodySchema = z.object({
  snapshot_id: z.string().trim().min(1).max(120),
  category: z.enum([
    "setup",
    "validation",
    "context_loss",
    "selection",
    "permission",
    "tooling",
    "data_integrity",
    "other",
  ]),
  status: z.enum(["open", "resolved", "wont_fix"]),
  intervention: z.string().trim().min(1).max(500),
  resolution: z.string().trim().min(1).max(500).optional(),
  confirmed_by: z.string().trim().min(1).max(80).default("web"),
});

export function registerActionRoutes(
  server: FastifyInstance,
  options: ActionRouteOptions,
): void {
  server.get("/api/v1/actions", async (request) => {
    requireAppAccess(request, options.auth);
    const storage = requireActionStorage(options.storage, request.url);
    return { data: createActionInboxFromStorage(storage) };
  });

  server.get("/api/v1/failure-episodes", async (request) => {
    requireAppAccess(request, options.auth);
    const storage = requireStorageCapabilities(
      options.storage,
      ["listFailureEpisodes"],
      { label: "Failure episode storage", instance: request.url },
    );
    return {
      data: {
        items: storage.listFailureEpisodes({ limit: 100 }),
        privacy: {
          local_only: true,
          returns_prompt_bodies: false,
          returns_raw_paths: false,
          returns_transcripts: false,
          inferred: false,
        },
      },
    };
  });

  server.post("/api/v1/failure-episodes", async (request) => {
    requireAppAccess(request, options.auth, { csrf: true });
    const storage = requireStorageCapabilities(
      options.storage,
      ["recordFailureEpisode"],
      { label: "Failure episode storage", instance: request.url },
    );
    const body = FailureEpisodeBodySchema.parse(request.body ?? {});
    const parsed = parseFailureEpisodeInput(body);
    if (!parsed.ok) {
      throw problem(400, "Bad Request", parsed.message, request.url);
    }
    try {
      return {
        data: {
          recorded: true,
          episode: storage.recordFailureEpisode(parsed.input),
          next_action: "Refresh the local action inbox.",
        },
      };
    } catch (error) {
      throw problem(
        400,
        "Bad Request",
        error instanceof Error ? error.message : "Failure episode failed.",
        request.url,
      );
    }
  });
}

function requireActionStorage(
  storage: ActionRouteOptions["storage"],
  instance: string,
): ActionInboxStorage {
  return requireStorageCapabilities(
    storage,
    [
      "listLoopSnapshots",
      "listContinuationReceipts",
      "listLoopMemories",
      "listFailureEpisodes",
    ],
    { label: "Action inbox storage", instance },
  );
}
