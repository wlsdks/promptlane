import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const BOOLEAN_FIELDS = [
  "independence_confirmed",
  "install_success",
  "first_value_success",
  "privacy_blocker",
  "data_loss_blocker",
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
  };
}

export function participantTemplate() {
  return {
    participant_id: "participant-ab12",
    independence_confirmed: true,
    install_success: false,
    first_value_success: false,
    install_elapsed_ms: 0,
    time_to_first_value_ms: 0,
    recovery_count: 0,
    friction_count: 0,
    privacy_blocker: false,
    data_loss_blocker: false,
  };
}

function runCli() {
  const args = process.argv.slice(2);
  if (args[0] === "--") args.shift();
  const argument = args[0];
  if (argument === "--template") {
    process.stdout.write(`${JSON.stringify(participantTemplate(), null, 2)}\n`);
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

if (resolve(process.argv[1] ?? "") === fileURLToPath(import.meta.url)) runCli();
