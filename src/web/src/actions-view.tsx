import {
  AlertTriangle,
  CheckCircle2,
  ClipboardCheck,
  Copy,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { type FormEvent, useState } from "react";

import type {
  ActionInboxItem,
  ActionInboxReport,
  FailureEpisodeInput,
} from "./action-inbox-api.js";
import { copyTextToClipboard } from "./clipboard.js";

import "./actions-view.css";

export function ActionsView({
  loading,
  onConfirmFailure,
  onRefresh,
  report,
}: {
  loading: boolean;
  onConfirmFailure(input: FailureEpisodeInput): Promise<void>;
  onRefresh(): Promise<void>;
  report?: ActionInboxReport;
}) {
  const [confirming, setConfirming] = useState<string>();
  const [copied, setCopied] = useState<string>();

  async function copyAction(item: ActionInboxItem): Promise<void> {
    if (await copyTextToClipboard(item.next_action)) {
      setCopied(item.id);
      window.setTimeout(() => setCopied(undefined), 2_000);
    }
  }

  return (
    <section className="actions-view" aria-label="Action inbox">
      <div className="actions-header panel">
        <div>
          <span className="panel-eyebrow">Operator-local control plane</span>
          <h2>
            {report?.summary.total ?? 0} <span>actions need review</span>
          </h2>
          <p>
            Resolve continuity, evidence, failure, and memory debt without
            exposing prompts or inferring outcomes.
          </p>
        </div>
        <button
          className="secondary-button"
          disabled={loading}
          onClick={() => void onRefresh()}
          type="button"
        >
          <RefreshCw size={15} /> {loading ? "Refreshing" : "Refresh"}
        </button>
      </div>

      <div className="action-metrics" aria-label="Action summary">
        <Metric label="Critical" value={report?.summary.critical ?? 0} />
        <Metric label="Failures" value={report?.summary.failure_review ?? 0} />
        <Metric
          label="Continuation"
          value={report?.summary.continuation_debt ?? 0}
        />
        <Metric label="Evidence" value={report?.summary.evidence_debt ?? 0} />
        <Metric label="Memory" value={report?.summary.memory_review ?? 0} />
      </div>

      <div className="actions-layout">
        <section className="panel action-queue" aria-label="Open actions">
          <div className="section-heading">
            <div>
              <span className="panel-eyebrow">Do next</span>
              <h3>Action inbox</h3>
            </div>
            <span className="source-badge">Operator local</span>
          </div>
          {loading && !report ? (
            <p className="empty-line">Loading actions…</p>
          ) : null}
          {!loading && report?.items.length === 0 ? (
            <div className="action-empty">
              <CheckCircle2 size={20} />
              <div>
                <strong>Inbox clear</strong>
                <p>No current loop requires an explicit operator action.</p>
              </div>
            </div>
          ) : null}
          {report?.items.map((item) => (
            <article className="action-row" key={item.id}>
              <div className={`priority-rail ${item.priority}`} />
              <div className="action-body">
                <div className="action-row-heading">
                  <div>
                    <span className="action-kind">
                      {labelForKind(item.kind)}
                    </span>
                    <h4>{item.title}</h4>
                  </div>
                  <span className={`status-pill ${item.priority}`}>
                    {item.priority}
                  </span>
                </div>
                <p>{item.reason}</p>
                <div className="action-context">
                  <span>{item.project}</span>
                  {item.worktree ? <span>{item.worktree}</span> : null}
                  {item.branch ? <span>{item.branch}</span> : null}
                </div>
                {(item.kind === "confirm_failure" ||
                  item.kind === "resolve_failure") &&
                confirming === item.id ? (
                  <FailureConfirmationForm
                    item={item}
                    onCancel={() => setConfirming(undefined)}
                    onConfirm={async (input) => {
                      await onConfirmFailure(input);
                      setConfirming(undefined);
                    }}
                  />
                ) : (
                  <div className="action-command-row">
                    <code>{item.next_action}</code>
                    {item.kind === "confirm_failure" ||
                    item.kind === "resolve_failure" ? (
                      <button
                        className="primary-button"
                        onClick={() => setConfirming(item.id)}
                        type="button"
                      >
                        <ClipboardCheck size={14} />
                        {item.kind === "resolve_failure"
                          ? "Resolve failure"
                          : "Confirm failure"}
                      </button>
                    ) : (
                      <button
                        aria-label={`Copy action for ${item.title}`}
                        className="icon-button"
                        onClick={() => void copyAction(item)}
                        type="button"
                      >
                        {copied === item.id ? (
                          <CheckCircle2 size={14} />
                        ) : (
                          <Copy size={14} />
                        )}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </article>
          ))}
        </section>

        <section className="panel local-outcomes" aria-label="Local outcomes">
          <div className="section-heading">
            <div>
              <span className="panel-eyebrow">Observed, not causal</span>
              <h3>Local outcomes</h3>
            </div>
            <ShieldCheck size={17} />
          </div>
          <p className="section-copy">
            Operator-local work stays separate from bundled product studies on
            the Evidence page.
          </p>
          <div className="outcome-list">
            {report?.outcomes.map((outcome) => (
              <article className="outcome-row" key={outcome.snapshot_id}>
                <div>
                  <strong>{outcome.project}</strong>
                  <span>{shortTime(outcome.created_at)}</span>
                </div>
                <span className={`status-pill ${outcome.status}`}>
                  {outcome.status}
                </span>
                <dl>
                  <div>
                    <dt>Verified</dt>
                    <dd>{outcome.locally_verified_evidence}</dd>
                  </div>
                  <div>
                    <dt>Declared</dt>
                    <dd>{outcome.declared_evidence}</dd>
                  </div>
                  <div>
                    <dt>Continuation</dt>
                    <dd>{outcome.continuation_status ?? "not recorded"}</dd>
                  </div>
                  <div>
                    <dt>Failure</dt>
                    <dd>
                      {outcome.failure_episode_status ?? "not applicable"}
                    </dd>
                  </div>
                </dl>
              </article>
            ))}
            {report?.outcomes.length === 0 ? (
              <div className="action-empty compact">
                <AlertTriangle size={17} />
                <p>Completed local outcomes will appear here.</p>
              </div>
            ) : null}
          </div>
          <div className="failure-patterns">
            <div className="failure-patterns-heading">
              <div>
                <span className="panel-eyebrow">Across confirmed episodes</span>
                <h4>Recurring failure patterns</h4>
              </div>
              <span className="source-badge">
                {report?.summary.recurring_failure_categories ?? 0} recurring
              </span>
            </div>
            {report?.failure_patterns.map((pattern) => (
              <article className="failure-pattern-row" key={pattern.category}>
                <div>
                  <strong>{failureCategoryLabel(pattern.category)}</strong>
                  <span>
                    {pattern.recurring ? "Recurring" : "Observed once"} ·{" "}
                    {shortTime(pattern.last_confirmed_at)}
                  </span>
                </div>
                <p>
                  {pattern.total} confirmed episodes · {pattern.session_count}{" "}
                  {pattern.session_count === 1 ? "session" : "sessions"}
                </p>
                <dl>
                  <div>
                    <dt>Open</dt>
                    <dd>{pattern.open}</dd>
                  </div>
                  <div>
                    <dt>Resolved</dt>
                    <dd>{pattern.resolved}</dd>
                  </div>
                  <div>
                    <dt>Won't fix</dt>
                    <dd>{pattern.wont_fix}</dd>
                  </div>
                </dl>
              </article>
            ))}
            {report?.failure_patterns.length === 0 ? (
              <p className="empty-line">No confirmed failure patterns yet.</p>
            ) : null}
          </div>
        </section>
      </div>
    </section>
  );
}

function FailureConfirmationForm({
  item,
  onCancel,
  onConfirm,
}: {
  item: ActionInboxItem;
  onCancel(): void;
  onConfirm(input: FailureEpisodeInput): Promise<void>;
}) {
  const [category, setCategory] = useState<FailureEpisodeInput["category"]>(
    item.failure_category ?? "validation",
  );
  const resolving = item.kind === "resolve_failure";
  const [status, setStatus] = useState<FailureEpisodeInput["status"]>(
    resolving ? "resolved" : "open",
  );
  const [intervention, setIntervention] = useState(
    item.current_intervention ?? "",
  );
  const [resolution, setResolution] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent): Promise<void> {
    event.preventDefault();
    setBusy(true);
    try {
      await onConfirm({
        snapshot_id: item.snapshot_id,
        category,
        status,
        intervention,
        ...(resolution ? { resolution } : {}),
        confirmed_by: "web",
      });
    } finally {
      setBusy(false);
    }
  }
  return (
    <form
      className="failure-confirmation"
      onSubmit={(event) => void submit(event)}
    >
      <label>
        <span>Failure category</span>
        <select
          onChange={(event) =>
            setCategory(event.target.value as FailureEpisodeInput["category"])
          }
          value={category}
        >
          <option value="validation">Validation</option>
          <option value="setup">Setup</option>
          <option value="context_loss">Context loss</option>
          <option value="selection">Wrong selection</option>
          <option value="permission">Permission</option>
          <option value="tooling">Tooling</option>
          <option value="data_integrity">Data integrity</option>
          <option value="other">Other</option>
        </select>
      </label>
      {resolving ? (
        <label>
          <span>Resolution status</span>
          <select
            onChange={(event) =>
              setStatus(event.target.value as FailureEpisodeInput["status"])
            }
            value={status}
          >
            <option value="resolved">Resolved</option>
            <option value="wont_fix">Won't fix</option>
          </select>
        </label>
      ) : null}
      <label>
        <span>Confirmed intervention</span>
        <textarea
          maxLength={500}
          onChange={(event) => setIntervention(event.target.value)}
          placeholder="Describe the raw-free next intervention."
          required
          value={intervention}
        />
      </label>
      {resolving ? (
        <label>
          <span>Resolution evidence</span>
          <textarea
            maxLength={500}
            onChange={(event) => setResolution(event.target.value)}
            placeholder="Record verified resolution evidence or the decision reason."
            required={status === "resolved"}
            value={resolution}
          />
        </label>
      ) : null}
      <div className="form-actions">
        <button className="secondary-button" onClick={onCancel} type="button">
          Cancel
        </button>
        <button className="primary-button" disabled={busy} type="submit">
          {busy ? "Confirming" : "Confirm episode"}
        </button>
      </div>
    </form>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="action-metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function labelForKind(kind: ActionInboxItem["kind"]): string {
  return {
    close_loop: "Outcome",
    confirm_failure: "Failure",
    resolve_failure: "Failure",
    complete_continuation: "Continuation",
    verify_evidence: "Evidence",
    review_memory: "Memory",
  }[kind];
}

function shortTime(value: string): string {
  return value.slice(0, 16).replace("T", " ");
}

function failureCategoryLabel(
  category: ActionInboxReport["failure_patterns"][number]["category"],
): string {
  return {
    setup: "Setup",
    validation: "Validation",
    context_loss: "Context loss",
    selection: "Wrong selection",
    permission: "Permission",
    tooling: "Tooling",
    data_integrity: "Data integrity",
    other: "Other",
  }[category];
}
