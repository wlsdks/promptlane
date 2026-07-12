import { describe, expect, it } from "vitest";

import { decideResumeIntervention } from "./intervention-policy.js";

describe("resume intervention policy", () => {
  it("offers a brief for an explicit checkpoint", () => {
    expect(
      decideResumeIntervention({
        explicitCheckpoint: true,
        hasCompactionBoundary: false,
        outcomeStatus: "in_progress",
      }),
    ).toMatchObject({ mode: "offer_resume_brief" });
  });

  it("offers a brief for blocked recovery and compaction boundaries", () => {
    expect(
      decideResumeIntervention({
        explicitCheckpoint: false,
        hasCompactionBoundary: false,
        outcomeStatus: "blocked",
      }).mode,
    ).toBe("offer_resume_brief");
    expect(
      decideResumeIntervention({
        explicitCheckpoint: false,
        hasCompactionBoundary: true,
        outcomeStatus: "unknown",
      }).mode,
    ).toBe("offer_resume_brief");
  });

  it("stays silent for ordinary continuation without a recovery signal", () => {
    expect(
      decideResumeIntervention({
        explicitCheckpoint: false,
        hasCompactionBoundary: false,
        outcomeStatus: "in_progress",
      }),
    ).toMatchObject({ mode: "silent" });
  });
});
