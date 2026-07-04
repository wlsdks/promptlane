export function LoopLoadingState() {
  return <section className="panel">Loading loop snapshots...</section>;
}

export function LoopEmptyState() {
  return (
    <section className="panel loops-empty">
      <div>
        <span className="panel-eyebrow">Loopdeck</span>
        <h2>No loop snapshots yet</h2>
        <p>
          Run <code>prompt-coach loop collect</code> after a Codex or Claude
          Code turn to create the first local loop snapshot.
        </p>
      </div>
      <div className="privacy-note">
        Local-only. No prompt bodies, raw paths, or compact summaries are shown
        here.
      </div>
    </section>
  );
}
