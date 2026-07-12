import { describe, expect, it } from "vitest";

import {
  WEB_ENTRY_CHUNK_BUDGET_BYTES,
  webEntryChunkBudgetError,
  webInitialPreloadError,
} from "../../vite.web.config.js";

describe("web entry chunk budget", () => {
  it("accepts the exact budget and fails closed above it", () => {
    expect(
      webEntryChunkBudgetError(
        "assets/index.js",
        "x".repeat(WEB_ENTRY_CHUNK_BUDGET_BYTES),
      ),
    ).toBeUndefined();
    expect(
      webEntryChunkBudgetError(
        "assets/index.js",
        "x".repeat(WEB_ENTRY_CHUNK_BUDGET_BYTES + 1),
      ),
    ).toBe(
      "assets/index.js is 500001 bytes; LoopRelay web entry chunks must stay at or below 500000 bytes.",
    );
  });

  it("rejects route-exclusive chart preloads in the initial document", () => {
    expect(
      webInitialPreloadError(
        '<link rel="modulepreload" href="/assets/jsx-runtime.js">',
      ),
    ).toBeUndefined();
    expect(
      webInitialPreloadError(
        '<link rel="modulepreload" href="/assets/charts-abc123.js">',
      ),
    ).toBe(
      "LoopRelay initial HTML must not preload the route-exclusive charts chunk.",
    );
  });
});
