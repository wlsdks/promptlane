import { readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const BOOLEAN_FIELDS = [
  "independence_confirmed",
  "install_success",
  "first_value_success",
  "privacy_blocker",
  "data_loss_blocker",
  "install_blocker",
];
const METRIC_FIELDS = [
  "install_elapsed_ms",
  "time_to_first_value_ms",
  "recovery_count",
  "friction_count",
];
const ALLOWED_FIELDS = new Set([
  "participant_id",
  ...BOOLEAN_FIELDS,
  ...METRIC_FIELDS,
]);

export function normalizeParticipantResult(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new Error("participant result object is required");
  }
  for (const key of Object.keys(input)) {
    if (!ALLOWED_FIELDS.has(key)) {
      throw new Error(`unsupported participant field: ${key}`);
    }
  }
  if (!/^participant-[a-z0-9]{4,16}$/.test(input.participant_id ?? "")) {
    throw new Error("participant_id must be a raw-free participant label");
  }
  for (const key of BOOLEAN_FIELDS) {
    if (typeof input[key] !== "boolean") {
      throw new Error(`participant boolean is required: ${key}`);
    }
  }
  for (const key of METRIC_FIELDS) {
    if (!Number.isInteger(input[key]) || input[key] < 0) {
      throw new Error(`participant non-negative integer is required: ${key}`);
    }
  }
  return {
    id: input.participant_id,
    independence_confirmed: input.independence_confirmed,
    install_success: input.install_success,
    first_value_success: input.first_value_success,
    install_elapsed_ms: input.install_elapsed_ms,
    time_to_first_value_ms: input.time_to_first_value_ms,
    recovery_count: input.recovery_count,
    friction_count: input.friction_count,
    privacy_blocker: input.privacy_blocker,
    data_loss_blocker: input.data_loss_blocker,
    install_blocker: input.install_blocker,
  };
}

export function participantTemplate() {
  return {
    participant_id: "participant-ab12",
    independence_confirmed: false,
    install_success: false,
    first_value_success: false,
    install_elapsed_ms: 0,
    time_to_first_value_ms: 0,
    recovery_count: 0,
    friction_count: 0,
    privacy_blocker: false,
    data_loss_blocker: false,
    install_blocker: false,
  };
}

export function appendParticipantResult(ledger, input) {
  if (!ledger || typeof ledger !== "object" || Array.isArray(ledger)) {
    throw new Error("usefulness ledger object is required");
  }
  if (!Array.isArray(ledger.independent_users)) {
    throw new Error("independent_users must be an array");
  }
  const normalized = normalizeParticipantResult(input);
  if (ledger.independent_users.some((user) => user?.id === normalized.id)) {
    throw new Error("participant label already exists");
  }
  return {
    ...ledger,
    independent_users: [...ledger.independent_users, normalized],
  };
}

function appendParticipantResultFile(ledgerPath, resultPath) {
  const ledger = JSON.parse(readFileSync(ledgerPath, "utf8"));
  const input = JSON.parse(readFileSync(resultPath, "utf8"));
  const next = appendParticipantResult(ledger, input);
  const temporaryPath = `${ledgerPath}.participant-intake-${process.pid}.tmp`;
  try {
    writeFileSync(temporaryPath, `${JSON.stringify(next, null, 2)}\n`, {
      encoding: "utf8",
      mode: 0o600,
      flag: "wx",
    });
    renameSync(temporaryPath, ledgerPath);
  } finally {
    rmSync(temporaryPath, { force: true });
  }
  return next.independent_users.at(-1);
}

function runCli() {
  const args = process.argv.slice(2);
  if (args[0] === "--") args.shift();
  const argument = args[0];
  if (argument === "--template") {
    process.stdout.write(`${JSON.stringify(participantTemplate(), null, 2)}\n`);
    return;
  }
  if (argument === "--append-to") {
    if (!args[1] || !args[2]) {
      throw new Error(
        "usage: usefulness-participant-intake --append-to <ledger.json> <participant-result.json>",
      );
    }
    const appended = appendParticipantResultFile(args[1], args[2]);
    process.stdout.write(
      `${JSON.stringify({ appended: true, id: appended.id }, null, 2)}\n`,
    );
    return;
  }
  if (!argument) {
    throw new Error(
      "usage: usefulness-participant-intake --template | <participant-result.json>",
    );
  }
  const normalized = normalizeParticipantResult(
    JSON.parse(readFileSync(argument, "utf8")),
  );
  process.stdout.write(`${JSON.stringify(normalized, null, 2)}\n`);
}

if (resolve(process.argv[1] ?? "") === fileURLToPath(import.meta.url)) {
  try {
    runCli();
  } catch {
    process.stderr.write("participant intake failed; verify the raw-free input and retry\n");
    process.exitCode = 1;
  }
}
