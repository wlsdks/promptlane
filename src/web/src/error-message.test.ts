import { describe, expect, it } from "vitest";

import {
  archiveScoreErrorMessage,
  errorMessageOrDefault,
  exportPreviewErrorMessage,
  projectInstructionAnalysisErrorMessage,
  projectPolicyUpdateErrorMessage,
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
    expect(errorMessageOrDefault("failed", "Could not approve loop memory.")).toBe(
      "Could not approve loop memory.",
    );
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
});
