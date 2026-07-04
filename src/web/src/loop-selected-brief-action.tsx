import { Copy } from "lucide-react";

import type { LoopWorktreeResponse } from "./api.js";

export function LoopSelectedBriefAction({
  busy,
  copied,
  onCopySelectedBrief,
  worktreeDetail,
}: {
  busy: boolean;
  copied: boolean;
  onCopySelectedBrief?: () => void;
  worktreeDetail: LoopWorktreeResponse;
}) {
  return (
    <div className="loop-memory-action">
      <code>Continue {worktreeDetail.worktree}</code>
      <button
        className="loop-copy-button"
        disabled={!onCopySelectedBrief || busy}
        onClick={onCopySelectedBrief}
        title="Copy selected worktree continuation brief"
        type="button"
      >
        <Copy aria-hidden size={15} />
        {copied ? "Copied selected brief" : "Copy selected brief"}
      </button>
    </div>
  );
}
