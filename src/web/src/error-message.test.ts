import { describe, expect, it } from "vitest";

import {
  archiveScoreErrorMessage,
  archiveScoreQueryErrorMessage,
  askEventSummaryErrorMessage,
  bookmarkErrorMessage,
  bulkDeleteErrorMessage,
  copyUsageEventErrorMessage,
  draftCopyMarkerErrorMessage,
  errorMessageOrDefault,
  exportPreviewErrorMessage,
  improvementDraftSaveErrorMessage,
  loopListErrorMessage,
  loopWorktreeErrorMessage,
  projectInstructionAnalysisErrorMessage,
  projectListErrorMessage,
  projectPolicyUpdateErrorMessage,
  qualityDashboardErrorMessage,
  promptListErrorMessage,
  selectedPromptErrorMessage,
  similarPromptsErrorMessage,
} from "./error-message.js";

describe("errorMessageOrDefault", () => {
  it("preserves API recovery detail from Error messages", () => {
    const error = new Error(
      "Loop memory approval failed (404): No loop snapshot found. Send one Codex or Claude Code prompt, run `promptlane coach`, then run `promptlane loop collect`.",
    );

    expect(errorMessageOrDefault(error, "Could not approve loop memory.")).toBe(
      "Loop memory approval failed (404): No loop snapshot found. Send one Codex or Claude Code prompt, run `promptlane coach`, then run `promptlane loop collect`.",
    );
  });

  it("uses the fallback for non-Error throws", () => {
    expect(
      errorMessageOrDefault("failed", "Could not approve loop memory."),
    ).toBe("Could not approve loop memory.");
  });

  it("trims Error recovery detail before showing it", () => {
    const error = new Error(
      "  Export job execution failed (404): Export job not found. Create a new export preview, then run the export from that preview.  ",
    );

    expect(
      errorMessageOrDefault(
        error,
        "Could not run the anonymized export. Create a new preview and try again.",
      ),
    ).toBe(
      "Export job execution failed (404): Export job not found. Create a new export preview, then run the export from that preview.",
    );
  });

  it("preserves project instruction analysis recovery detail", () => {
    const error = new Error(
      "Project instruction analysis failed (404): Project not found. Refresh the local project list, then retry instruction analysis from an existing project.",
    );

    expect(projectInstructionAnalysisErrorMessage(error)).toBe(
      "Project instruction analysis failed (404): Project not found. Refresh the local project list, then retry instruction analysis from an existing project.",
    );
  });

  it("preserves project policy update recovery detail", () => {
    const error = new Error(
      "Project policy update failed (404): Project not found. Refresh the local project list, then retry the policy change from an existing project.",
    );

    expect(projectPolicyUpdateErrorMessage(error)).toBe(
      "Project policy update failed (404): Project not found. Refresh the local project list, then retry the policy change from an existing project.",
    );
  });

  it("preserves export preview recovery detail", () => {
    const error = new Error(
      "Export preview failed (403): Missing or invalid CSRF token. Refresh the local PromptLane web session, then retry the action.",
    );

    expect(exportPreviewErrorMessage(error)).toBe(
      "Export preview failed (403): Missing or invalid CSRF token. Refresh the local PromptLane web session, then retry the action.",
    );
  });

  it("preserves archive score recovery detail", () => {
    const error = new Error(
      "Archive score report failed (401): Missing or invalid app session. Open a new local PromptLane web session, then retry the archive score request.",
    );

    expect(archiveScoreErrorMessage(error)).toBe(
      "Archive score report failed (401): Missing or invalid app session. Open a new local PromptLane web session, then retry the archive score request.",
    );
  });

  it("preserves archive score query recovery detail", () => {
    const error = new Error(
      "Archive score report failed (401): Missing or invalid app session. Open a new local PromptLane web session, then retry the archive score request.",
    );

    expect(archiveScoreQueryErrorMessage(error)).toBe(
      "Archive score report failed (401): Missing or invalid app session. Open a new local PromptLane web session, then retry the archive score request.",
    );
  });

  it("preserves improvement draft save recovery detail", () => {
    const error = new Error(
      "Improvement draft save failed (401): Missing or invalid app session. Open a new local PromptLane web session, then retry saving the improvement draft.",
    );

    expect(improvementDraftSaveErrorMessage(error)).toBe(
      "Improvement draft save failed (401): Missing or invalid app session. Open a new local PromptLane web session, then retry saving the improvement draft.",
    );
  });

  it("preserves bookmark recovery detail", () => {
    const error = new Error(
      "Bookmark failed (404): Prompt not found. Open the local archive or search prompts before changing bookmark state.",
    );

    expect(bookmarkErrorMessage(error)).toBe(
      "Bookmark failed (404): Prompt not found. Open the local archive or search prompts before changing bookmark state.",
    );
  });

  it("preserves bulk delete recovery detail", () => {
    const error = new Error(
      "Delete failed (404): Prompt not found. Open the local archive or search prompts before deleting again.",
    );

    expect(bulkDeleteErrorMessage(error)).toBe(
      "Delete failed (404): Prompt not found. Open the local archive or search prompts before deleting again.",
    );
  });

  it("preserves draft copy marker recovery detail", () => {
    const error = new Error(
      "Improvement draft copy event failed (404): Improvement draft not found. Open the prompt detail from the local archive, review saved drafts, then retry the copy action.",
    );

    expect(draftCopyMarkerErrorMessage(error)).toBe(
      "Improvement draft copy event failed (404): Improvement draft not found. Open the prompt detail from the local archive, review saved drafts, then retry the copy action.",
    );
  });

  it("preserves prompt copy usage event recovery detail", () => {
    const error = new Error(
      "Prompt event failed (404): Prompt not found. Open the local archive or search prompts before recording copy usage.",
    );

    expect(copyUsageEventErrorMessage(error)).toBe(
      "Prompt event failed (404): Prompt not found. Open the local archive or search prompts before recording copy usage.",
    );
  });

  it("preserves ask event summary recovery detail", () => {
    const error = new Error(
      "Ask event summary unavailable (401): Missing or invalid app session. Open a new local PromptLane web session, then retry the ask events summary.",
    );

    expect(askEventSummaryErrorMessage(error)).toBe(
      "Ask event summary unavailable (401): Missing or invalid app session. Open a new local PromptLane web session, then retry the ask events summary.",
    );
  });

  it("preserves similar prompts recovery detail", () => {
    const error = new Error(
      "Similar prompts unavailable (404): Prompt not found. Open the local archive, select an existing prompt, then retry similar prompt lookup.",
    );

    expect(similarPromptsErrorMessage(error)).toBe(
      "Similar prompts unavailable (404): Prompt not found. Open the local archive, select an existing prompt, then retry similar prompt lookup.",
    );
  });

  it("preserves selected prompt recovery detail", () => {
    const error = new Error(
      "Prompt not found (404): Prompt not found. Open the local archive or search prompts before reopening the detail view.",
    );

    expect(selectedPromptErrorMessage(error)).toBe(
      "Prompt not found (404): Prompt not found. Open the local archive or search prompts before reopening the detail view.",
    );
  });

  it("preserves prompt list recovery detail", () => {
    const error = new Error(
      "Prompt list failed (401): Missing or invalid app session. Open a new local PromptLane web session, then retry the prompt archive request.",
    );

    expect(promptListErrorMessage(error)).toBe(
      "Prompt list failed (401): Missing or invalid app session. Open a new local PromptLane web session, then retry the prompt archive request.",
    );
  });

  it("preserves loop worktree recovery detail", () => {
    const error = new Error(
      "Loop worktree drilldown failed (404): Worktree snapshot not found. Run `promptlane loop collect --worktree agent-loop-worktree`, then reopen the loop worktree drilldown.",
    );

    expect(loopWorktreeErrorMessage(error)).toBe(
      "Loop worktree drilldown failed (404): Worktree snapshot not found. Run `promptlane loop collect --worktree agent-loop-worktree`, then reopen the loop worktree drilldown.",
    );
  });

  it("preserves loop list recovery detail", () => {
    const error = new Error(
      "Loop list failed (401): Missing or invalid app session. Open a new local PromptLane web session, then retry the loop list request.",
    );

    expect(loopListErrorMessage(error)).toBe(
      "Loop list failed (401): Missing or invalid app session. Open a new local PromptLane web session, then retry the loop list request.",
    );
  });

  it("preserves project list recovery detail", () => {
    const error = new Error(
      "Project list failed (401): Missing or invalid app session. Open a new local PromptLane web session, then retry the project list request.",
    );

    expect(projectListErrorMessage(error)).toBe(
      "Project list failed (401): Missing or invalid app session. Open a new local PromptLane web session, then retry the project list request.",
    );
  });

  it("preserves quality dashboard recovery detail", () => {
    const error = new Error(
      "Quality dashboard failed (401): Missing or invalid app session. Open a new local PromptLane web session, then retry the quality dashboard request.",
    );

    expect(qualityDashboardErrorMessage(error)).toBe(
      "Quality dashboard failed (401): Missing or invalid app session. Open a new local PromptLane web session, then retry the quality dashboard request.",
    );
  });
});
