import { describe, expect, it } from "vitest";

import {
  createActionInboxFromStorage,
  type ActionInboxStorage,
} from "./action-inbox-service.js";

describe("createActionInboxFromStorage", () => {
  it("uses unbounded raw-free failure pattern counts instead of the action-list limit", () => {
    const storage: ActionInboxStorage = {
      listLoopSnapshots: () => ({ items: [] }),
      listContinuationReceipts: () => [],
      listLoopMemories: () => ({ items: [] }),
      listFailureEpisodes: () => [],
      getFailureEpisodePatternCounts: () => [
        {
          category: "tooling",
          total: 101,
          session_count: 101,
          open: 101,
          resolved: 0,
          wont_fix: 0,
          last_confirmed_at: "2026-07-12T12:00:00.000Z",
        },
      ],
    };

    expect(createActionInboxFromStorage(storage).failure_patterns).toEqual([
      expect.objectContaining({
        category: "tooling",
        total: 101,
        recurring: true,
      }),
    ]);
  });
});
