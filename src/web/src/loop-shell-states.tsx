export function LoopLoadingState() {
  return <section className="panel">Loading loop snapshots...</section>;
}

export function LoopEmptyState({
  nextActions = [],
  status,
}: {
  nextActions?: readonly string[];
  status?: string;
}) {
  return (
    <section className="panel loops-empty">
      <div>
        <span className="panel-eyebrow">PromptLane</span>
        <h2>No loop snapshots yet</h2>
        {status && (
          <p className="loops-status-line">PromptLane status {status}</p>
        )}
        {nextActions.length > 0 ? (
          <div className="loop-next-actions">
            <p className="loops-status-line">Next steps</p>
            {nextActions.slice(0, 3).map((action) => (
              <p className="loops-status-line" key={action}>
                {action}
              </p>
            ))}
          </div>
        ) : (
          <p>
            Run <code>promptlane loop collect</code> after a Codex or Claude
            Code turn to create the first local loop snapshot.
          </p>
        )}
      </div>
      <div className="privacy-note">
        Local-only. No prompt bodies, raw paths, or compact summaries are shown
        here.
      </div>
    </section>
  );
}
