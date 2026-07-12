import { ArrowUpRight, CircleAlert, ShieldCheck } from "lucide-react";

import {
  PRODUCT_EVIDENCE,
  RESUME_RELIABILITY_PROGRAM,
} from "./product-evidence-data.js";

export function ProductEvidencePanel() {
  const report = PRODUCT_EVIDENCE.primary;
  const successDelta =
    report.looprelay.success_rate - report.baseline.success_rate;
  const actionabilityDelta =
    report.looprelay.mean_actionability - report.baseline.mean_actionability;
  const tokenDelta =
    report.looprelay.mean_input_tokens - report.baseline.mean_input_tokens;
  const firstValueDelta =
    report.looprelay.mean_time_to_first_value_ms -
    report.baseline.mean_time_to_first_value_ms;
  const taskTypes = Object.entries(report.by_task_type).sort(
    ([left], [right]) => left.localeCompare(right),
  );

  return (
    <section
      className="panel product-evidence-panel"
      aria-label="Published product evidence"
    >
      <header className="product-evidence-heading">
        <div>
          <p className="eyebrow">Versioned product evidence</p>
          <h2>Published product evidence</h2>
          <p>
            This is repository evidence bundled with this release, not your
            local archive. It remains observational and does not establish a
            causal claim.
          </p>
        </div>
        <span className="product-evidence-status">
          <CircleAlert size={15} /> No causal claim
        </span>
      </header>

      <div className="product-evidence-cohorts">
        {PRODUCT_EVIDENCE.cohorts.map((cohort) => (
          <div className="product-evidence-cohort" key={cohort.label}>
            <span>{cohort.scope}</span>
            <strong>{cohort.report.pair_count} matched pairs</strong>
            <small>
              {cohort.report.task_type_count} task types · directional only
            </small>
          </div>
        ))}
      </div>

      <section
        className="resume-reliability-program"
        aria-label="Resume reliability program"
      >
        <div>
          <p className="eyebrow">Next evidence program</p>
          <h3>Resume reliability</h3>
          <p>
            Correct target, correct first action, and evidence attachment are
            measured separately from generic prompt quality.
          </p>
        </div>
        <strong>
          {RESUME_RELIABILITY_PROGRAM.pair_count}/
          {RESUME_RELIABILITY_PROGRAM.minimum_pairs} pairs
        </strong>
        <span>{RESUME_RELIABILITY_PROGRAM.status}</span>
        <small>{RESUME_RELIABILITY_PROGRAM.intervention.rationale}</small>
      </section>

      <div className="product-evidence-metrics">
        <EvidenceMetric
          baseline={formatPercent(report.baseline.success_rate)}
          label="Strict success"
          treatment={formatPercent(report.looprelay.success_rate)}
          delta={`${formatSignedPoints(successDelta)} pp`}
        />
        <EvidenceMetric
          baseline={formatPercent(report.baseline.mean_actionability)}
          label="Actionability"
          treatment={formatPercent(report.looprelay.mean_actionability)}
          delta={`${formatSignedPoints(actionabilityDelta)} pp`}
        />
        <EvidenceMetric
          baseline={formatSeconds(report.baseline.mean_time_to_first_value_ms)}
          label="First value"
          treatment={formatSeconds(
            report.looprelay.mean_time_to_first_value_ms,
          )}
          delta={formatSignedSeconds(firstValueDelta)}
        />
        <EvidenceMetric
          baseline={formatCompactNumber(report.baseline.mean_input_tokens)}
          label="Input tokens"
          treatment={formatCompactNumber(report.looprelay.mean_input_tokens)}
          delta={formatSignedPercent(
            tokenDelta / report.baseline.mean_input_tokens,
          )}
        />
      </div>

      <div className="product-evidence-transitions">
        <div>
          <span>Outcome transitions</span>
          <strong>{report.transitions.improved} improved</strong>
        </div>
        <span>{report.transitions.regressed} regressed</span>
        <span>{report.transitions.unchanged_passed} unchanged passed</span>
        <span>{report.transitions.unchanged_failed} unchanged failed</span>
      </div>

      <div className="product-evidence-task-list">
        <div className="product-evidence-task-heading">
          <div>
            <p className="eyebrow">Scope decisions</p>
            <h3>What the task-level evidence says</h3>
          </div>
          <span>Keep, narrow, or hold based on observed direction</span>
        </div>
        {taskTypes.map(([taskType, task]) => (
          <div className="product-evidence-task" key={taskType}>
            <strong>{formatTaskType(taskType)}</strong>
            <span>{task.pair_count} pairs</span>
            <span>
              {formatSignedPoints(task.success_rate_delta)} pp success
            </span>
            <em className={`product-evidence-decision ${task.decision.action}`}>
              {task.decision.action}
            </em>
          </div>
        ))}
      </div>

      <footer className="product-evidence-boundary">
        <ShieldCheck size={16} />
        <span>
          {report.independent_user_count} independent users ·{" "}
          {report.independent_humans.successful_flow_count} successful human
          flows · agent-operator release gate{" "}
          {report.public_readiness.ready ? "ready" : "not ready"}
        </span>
        <a href="https://github.com/wlsdks/looprelay/blob/main/docs/ENGINEERING_USEFULNESS_VALIDATION_2026-07-11.md">
          Read method <ArrowUpRight size={14} />
        </a>
      </footer>
    </section>
  );
}

function EvidenceMetric({
  baseline,
  delta,
  label,
  treatment,
}: {
  baseline: string;
  delta: string;
  label: string;
  treatment: string;
}) {
  return (
    <div className="product-evidence-metric">
      <span>{label}</span>
      <strong>
        {baseline} <small>→</small> {treatment}
      </strong>
      <em>{delta}</em>
    </div>
  );
}

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

function formatSignedPoints(value: number): string {
  return `${value >= 0 ? "+" : ""}${(value * 100).toFixed(1)}`;
}

function formatCompactNumber(value: number): string {
  return Math.round(value).toLocaleString();
}

function formatSeconds(value: number): string {
  return `${(value / 1000).toFixed(1)}s`;
}

function formatSignedSeconds(value: number): string {
  return `${value >= 0 ? "+" : ""}${(value / 1000).toFixed(1)}s`;
}

function formatSignedPercent(value: number): string {
  return `${value >= 0 ? "+" : ""}${(value * 100).toFixed(1)}%`;
}

function formatTaskType(value: string): string {
  return value.replaceAll("_", " ");
}
