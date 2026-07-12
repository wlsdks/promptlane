import { describe, expect, it } from "vitest";

import { parseFailureEpisodeInput } from "./failure-episode.js";

describe("parseFailureEpisodeInput", () => {
  it("accepts an operator-confirmed raw-free failure lifecycle", () => {
    expect(
      parseFailureEpisodeInput({
        snapshot_id: "loop_failed",
        category: "validation",
        status: "resolved",
        intervention: "Run the focused contract test before the build.",
        resolution: "The focused contract and production build passed.",
        confirmed_by: "user",
      }),
    ).toEqual({
      ok: true,
      input: {
        snapshot_id: "loop_failed",
        category: "validation",
        status: "resolved",
        intervention: "Run the focused contract test before the build.",
        resolution: "The focused contract and production build passed.",
        confirmed_by: "user",
      },
    });
  });

  it("rejects inferred, incomplete, and private failure descriptions", () => {
    expect(
      parseFailureEpisodeInput({
        snapshot_id: "loop_failed",
        category: "validation",
        status: "resolved",
        intervention: "Read /Users/example/private.log.",
      }),
    ).toMatchObject({ ok: false });
    expect(
      parseFailureEpisodeInput({
        snapshot_id: "loop_failed",
        category: "validation",
        status: "resolved",
        intervention: "Run focused validation.",
      }),
    ).toMatchObject({ ok: false });
  });
});
