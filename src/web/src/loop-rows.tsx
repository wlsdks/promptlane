import { Copy, ShieldCheck } from "lucide-react";
import { useState } from "react";

import type { LoopSummary, LoopWorktreeResponse } from "./api.js";
import { getLoopBrief, markContinuationReceipt } from "./api.js";
import { copyTextToClipboard } from "./clipboard.js";
import { formatDate } from "./formatters.js";

export function LoopWorktreeDetailRows({
  worktreeDetail,
}: {
  worktreeDetail: LoopWorktreeResponse;
}) {
  return (
    <>
      <div className="loop-row loop-row-head">
        <span>Loop</span>
        <span>Project</span>
        <span>Signals</span>
        <span>Outcome</span>
      </div>
      {worktreeDetail.items.map((loop) => (
        <div className="loop-row" key={loop.id}>
          <div className="loop-primary">
            <strong>{loop.id}</strong>
            <span>{formatDate(loop.created_at)}</span>
            <span>
              {loop.tool} / {loop.source}
            </span>
          </div>
          <div>
            <strong>{loop.project}</strong>
            {loop.branch && <span className="loop-muted">{loop.branch}</span>}
            {loop.worktree && (
              <span className="loop-muted">{loop.worktree}</span>
            )}
          </div>
          <div className="loop-signals">
            <span>{loop.prompt_count} prompts</span>
            {loop.average_prompt_score !== undefined && (
              <span>{loop.average_prompt_score}/100 avg</span>
            )}
            {loop.top_gaps.slice(0, 2).map((gap) => (
              <span key={gap}>{gap}</span>
            ))}
          </div>
          <div className="loop-next">
            <span>{loop.outcome_status}</span>
          </div>
        </div>
      ))}
    </>
  );
}

export function LoopRows({ items }: { items: readonly LoopSummary[] }) {
  return (
    <div className="loop-table panel">
      <div className="loop-row loop-row-head">
        <span>Loop</span>
        <span>Project</span>
        <span>Signals</span>
        <span>Next</span>
      </div>
      {items.map((loop) => (
        <LoopRow key={loop.id} loop={loop} />
      ))}
    </div>
  );
}

function LoopRow({ loop }: { loop: LoopSummary }) {
  const needsRefresh = Boolean(loop.compact_boundary?.after_latest_snapshot);
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);

  async function copyNextBrief(): Promise<void> {
    setBusy(true);
    try {
      const brief = await getLoopBrief(loop.id);
      const didCopy = await copyTextToClipboard(brief.prompt);
      if (!didCopy) return;
      if (brief.receipt) {
        await markContinuationReceipt(brief.receipt.id, "copied");
      }

      setCopied(true);
      window.setTimeout(() => setCopied(false), 2_500);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="loop-row">
      <div className="loop-primary">
        <strong>{loop.id}</strong>
        <span>{formatDate(loop.created_at)}</span>
        <span>
          {loop.tool} / {loop.source}
        </span>
      </div>
      <div>
        <strong>{loop.project}</strong>
        {loop.branch && <span className="loop-muted">{loop.branch}</span>}
        {loop.worktree && <span className="loop-muted">{loop.worktree}</span>}
      </div>
      <div className="loop-signals">
        <span>{loop.prompt_count} prompts</span>
        {loop.average_prompt_score !== undefined && (
          <span>{loop.average_prompt_score}/100 avg</span>
        )}
        <span>{loop.outcome_status}</span>
        {loop.top_gaps.slice(0, 2).map((gap) => (
          <span key={gap}>{gap}</span>
        ))}
      </div>
      <div className="loop-next">
        {needsRefresh ? (
          <>
            <span className="status-pill warning">Compact boundary</span>
            <span>
              {loop.compact_boundary?.event_name} at{" "}
              {loop.compact_boundary
                ? formatDate(loop.compact_boundary.created_at)
                : ""}
            </span>
            <code>looprelay loop collect</code>
          </>
        ) : (
          <>
            <span className="status-pill good">Current</span>
            <code>looprelay loop brief</code>
          </>
        )}
        <button
          aria-label={`Copy next brief for ${loop.id}`}
          className="loop-copy-button"
          disabled={busy}
          onClick={() => void copyNextBrief()}
          title="Copy next brief"
          type="button"
        >
          {copied ? <ShieldCheck size={15} /> : <Copy size={15} />}
          {copied ? "Copied brief" : busy ? "Preparing..." : "Copy brief"}
        </button>
      </div>
    </div>
  );
}
