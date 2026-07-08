import { detectSensitiveValues } from "../redaction/detectors.js";

export type ProblemDetails = {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance?: string;
  errors?: Array<{ field: string; message: string }>;
};

export class HttpProblem extends Error {
  readonly problem: ProblemDetails;

  constructor(problem: ProblemDetails) {
    super(problem.detail);
    this.problem = problem;
  }
}

export function problem(
  status: number,
  title: string,
  detail: string,
  instance?: string,
  errors?: Array<{ field: string; message: string }>,
): HttpProblem {
  return new HttpProblem({
    type: `https://promptlane.local/errors/${toKebabCase(title)}`,
    title,
    status,
    detail,
    instance,
    errors: errors?.map((error) => ({
      ...error,
      message: sanitizeProblemErrorMessage(error.message),
    })),
  });
}

const RAW_DETAIL_ERROR_KEY_PATTERN =
  "compactSummary|compact_summary|markdown|promptBody|prompt_body|rawPath|raw_path|transcript|transcriptBody|transcript_body";

function sanitizeProblemErrorMessage(value: string): string {
  let sanitized = value.replace(
    new RegExp(
      `\\b(${RAW_DETAIL_ERROR_KEY_PATTERN})\\s*([:=])\\s*([^\\s,;)}\\]]+)`,
      "gi",
    ),
    (_match, key: string, separator: string) =>
      `${key}${separator}[REDACTED:${key.toLowerCase()}]`,
  );

  for (const finding of detectSensitiveValues(sanitized).sort(
    (a, b) => b.range_start - a.range_start,
  )) {
    sanitized =
      sanitized.slice(0, finding.range_start) +
      finding.replacement +
      sanitized.slice(finding.range_end);
  }

  return sanitized;
}

function toKebabCase(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
