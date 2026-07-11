import {
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  appendParticipantResult,
  normalizeParticipantResult,
  participantTemplate,
} from "../../scripts/usefulness-participant-intake.mjs";

describe("independent-user usefulness intake", () => {
  it("requires the participant to affirm independence explicitly", () => {
    expect(participantTemplate().independence_confirmed).toBe(false);
  });

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
        install_blocker: false,
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
      install_blocker: false,
    });
  });

  it("rejects identifiers, notes, paths, and secrets that could carry raw data", () => {
    expect(() =>
      normalizeParticipantResult({ ...valid(), participant_id: "Jane Doe" }),
    ).toThrow("raw-free participant label");
    expect(() =>
      normalizeParticipantResult({ ...valid(), notes: "private" }),
    ).toThrow("unsupported participant field");
    expect(() =>
      normalizeParticipantResult({
        ...valid(),
        participant_id: "participant-private/path",
      }),
    ).toThrow("raw-free participant label");
  });

  it("retains failed flows and blockers instead of accepting partial records", () => {
    const input = valid();
    input.install_success = false;
    input.first_value_success = false;
    input.privacy_blocker = true;
    input.install_blocker = true;

    expect(normalizeParticipantResult(input)).toMatchObject({
      install_success: false,
      first_value_success: false,
      privacy_blocker: true,
      install_blocker: true,
    });
  });

  it("appends validated failures without mutating the source ledger", () => {
    const ledger = { independent_users: [] };
    const failed = valid();
    failed.install_success = false;
    failed.first_value_success = false;
    failed.data_loss_blocker = true;

    const next = appendParticipantResult(ledger, failed);

    expect(ledger.independent_users).toEqual([]);
    expect(next.independent_users).toEqual([
      expect.objectContaining({
        id: "participant-k7m2",
        install_success: false,
        first_value_success: false,
        data_loss_blocker: true,
      }),
    ]);
  });

  it("rejects duplicate participant labels before ledger replacement", () => {
    const normalized = normalizeParticipantResult(valid());
    expect(() =>
      appendParticipantResult({ independent_users: [normalized] }, valid()),
    ).toThrow("participant label already exists");
  });

  it("atomically appends through the CLI and leaves duplicates unchanged", () => {
    const directory = mkdtempSync(join(tmpdir(), "looprelay-intake-"));
    const ledgerPath = join(directory, "ledger.json");
    const resultPath = join(directory, "result.json");
    writeFileSync(ledgerPath, `${JSON.stringify({ independent_users: [] })}\n`);
    writeFileSync(resultPath, `${JSON.stringify(valid())}\n`);

    try {
      const first = runIntake("--append-to", ledgerPath, resultPath);
      expect(first.status).toBe(0);
      expect(JSON.parse(first.stdout)).toEqual({
        appended: true,
        id: "participant-k7m2",
      });
      const afterFirst = readFileSync(ledgerPath, "utf8");
      expect(JSON.parse(afterFirst).independent_users).toHaveLength(1);

      const duplicate = runIntake("--append-to", ledgerPath, resultPath);
      expect(duplicate.status).toBe(1);
      expect(duplicate.stderr).toBe(
        "participant intake failed; verify the raw-free input and retry\n",
      );
      expect(readFileSync(ledgerPath, "utf8")).toBe(afterFirst);
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });

  it("ships a raw-free validation-only candidate handoff", () => {
    const manifestSource = readFileSync(
      join(process.cwd(), "reports/independent-user-candidate.json"),
      "utf8",
    );
    const manifest = JSON.parse(manifestSource) as {
      candidate_commit: string;
      sha256: string;
      release_authorized: boolean;
      maintainer_smoke: {
        counts_as_independent_user: boolean;
        first_value_success: boolean;
        raw_path_hits: number;
      };
      independent_user_count: number;
      required_independent_users: number;
    };
    const handoff = readFileSync(
      join(
        process.cwd(),
        "evaluation/usefulness/PARTICIPANT_HANDOFF_12c0bbcc.md",
      ),
      "utf8",
    );

    expect(manifest).toMatchObject({
      candidate_commit: "12c0bbcc0720dc2a50d89c73dc6a264e548d25bf",
      release_authorized: false,
      maintainer_smoke: {
        counts_as_independent_user: false,
        first_value_success: true,
        raw_path_hits: 0,
      },
      independent_user_count: 0,
      required_independent_users: 3,
    });
    expect(manifest.sha256).toMatch(/^[a-f0-9]{64}$/);
    expect(handoff).toContain(manifest.sha256);
    expect(handoff).toContain("INDEPENDENT_USER_PROTOCOL.md");
    expect(handoff).toContain("does not count toward the 3-user gate");
    expect(manifestSource).not.toMatch(/\/Users\/|\/home\//);
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
    install_blocker: false,
  };
}

function runIntake(...args: string[]) {
  return spawnSync(
    process.execPath,
    [join(process.cwd(), "scripts/usefulness-participant-intake.mjs"), ...args],
    { encoding: "utf8" },
  );
}
