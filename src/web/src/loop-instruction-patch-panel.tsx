import type { LoopInstructionPatchProposal } from "./api.js";

export function LoopInstructionPatchPanel({
  proposal,
}: {
  proposal?: LoopInstructionPatchProposal;
}) {
  if (!proposal) return null;

  return (
    <div className="panel loop-patch-panel">
      <div>
        <span className="panel-eyebrow">Review only</span>
        <h2>{proposal.title}</h2>
        <p>
          Requires explicit user approval. This preview does not write
          AGENTS.md, CLAUDE.md, project docs, or memory files.
        </p>
      </div>
      <div className="loop-apply-gate">
        <span>Web apply unavailable</span>
        <code>{proposal.apply_gate.confirm_command}</code>
        <p>{proposal.apply_gate.reason}</p>
      </div>
      <pre>{proposal.diff}</pre>
    </div>
  );
}
