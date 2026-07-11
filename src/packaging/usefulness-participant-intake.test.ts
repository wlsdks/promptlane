import { describe, expect, it } from "vitest";

import { normalizeParticipantResult } from "../../scripts/usefulness-participant-intake.mjs";

describe("independent-user usefulness intake", () => {
  it("normalizes a raw-free participant result for the evidence ledger", () => {
    expect(
      normalizeParticipantResult({
        participant_id: "participant-k7m2",
        independence_confirmed: true,
        install_success: true,
        first_value_success: true,
        install_elapsed_ms: 42_000,
        time_to_first_value_ms: 75_000,
        recovery_count: 1,
        friction_count: 1,
        privacy_blocker: false,
        data_loss_blocker: false,
      }),
    ).toEqual({
      id: "participant-k7m2",
      independence_confirmed: true,
      install_success: true,
      first_value_success: true,
      install_elapsed_ms: 42_000,
      time_to_first_value_ms: 75_000,
      recovery_count: 1,
      friction_count: 1,
      privacy_blocker: false,
      data_loss_blocker: false,
    });
  });

  it("rejects identifiers, notes, paths, and secrets that could carry raw data", () => {
    expect(() => normalizeParticipantResult({ ...valid(), participant_id: "Jane Doe" })).toThrow("raw-free participant label");
    expect(() => normalizeParticipantResult({ ...valid(), notes: "private" })).toThrow("unsupported participant field");
    expect(() => normalizeParticipantResult({ ...valid(), participant_id: "participant-private/path" })).toThrow("raw-free participant label");
  });

  it("retains failed flows and blockers instead of accepting partial records", () => {
    const input = valid();
    input.install_success = false;
    input.first_value_success = false;
    input.privacy_blocker = true;

    expect(normalizeParticipantResult(input)).toMatchObject({
      install_success: false,
      first_value_success: false,
      privacy_blocker: true,
    });
  });
});

function valid() {
  return {
    participant_id: "participant-k7m2",
    independence_confirmed: true,
    install_success: true,
    first_value_success: true,
    install_elapsed_ms: 42_000,
    time_to_first_value_ms: 75_000,
    recovery_count: 1,
    friction_count: 1,
    privacy_blocker: false,
    data_loss_blocker: false,
  };
}
