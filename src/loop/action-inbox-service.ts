import type {
  ContinuationReceiptStoragePort,
  FailureEpisodeStoragePort,
  LoopMemoryStoragePort,
  LoopSnapshotStoragePort,
} from "../storage/ports.js";
import {
  createActionInboxReport,
  type ActionInboxReport,
} from "./action-inbox.js";

export type ActionInboxStorage = Pick<
  LoopSnapshotStoragePort,
  "listLoopSnapshots"
> &
  Pick<ContinuationReceiptStoragePort, "listContinuationReceipts"> &
  Pick<LoopMemoryStoragePort, "listLoopMemories"> &
  Pick<
    FailureEpisodeStoragePort,
    "getFailureEpisodePatternCounts" | "listFailureEpisodes"
  >;

export function createActionInboxFromStorage(
  storage: ActionInboxStorage,
  now = new Date(),
): ActionInboxReport {
  return createActionInboxReport({
    now,
    snapshots: storage.listLoopSnapshots({ limit: 100 }).items,
    receipts: storage.listContinuationReceipts({ limit: 100 }),
    memories: storage.listLoopMemories({ limit: 100 }).items,
    failureEpisodes: storage.listFailureEpisodes({ limit: 100 }),
    failurePatternCounts: storage.getFailureEpisodePatternCounts(),
  });
}
