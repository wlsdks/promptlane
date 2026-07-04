import { describe, expect, it } from "vitest";

import { improvementFromSavedDraft } from "./saved-draft-improvement.js";

describe("improvementFromSavedDraft", () => {
  it("turns a saved draft into the current improvement without using the original prompt body", () => {
    const improvement = improvementFromSavedDraft({
      id: "impdraft_test",
      prompt_id: "prmt_test",
      draft_text: "## Goal\nReuse the saved local draft.",
      analyzer: "clarifications-v1",
      changed_sections: ["goal_clarity"],
      safety_notes: ["Manual resubmission only."],
      is_sensitive: false,
      redaction_policy: "mask",
      created_at: "2026-07-05T00:00:00.000Z",
      copied_at: "2026-07-05T00:01:00.000Z",
    });

    expect(improvement.improved_prompt).toBe(
      "## Goal\nReuse the saved local draft.",
    );
    expect(improvement.analyzer).toBe("clarifications-v1");
    expect(improvement.changed_sections).toEqual(["goal_clarity"]);
    expect(improvement.safety_notes).toEqual(["Manual resubmission only."]);
    expect(improvement.summary).toBe("Saved draft reopened for reuse.");
    expect(improvement.mode).toBe("saved-draft");
  });

  it("normalizes unknown saved draft analyzers to the local rules analyzer", () => {
    const improvement = improvementFromSavedDraft({
      id: "impdraft_agent",
      prompt_id: "prmt_test",
      draft_text: "## Goal\nReuse the agent draft.",
      analyzer: "agent-rewrite-v1",
      changed_sections: [],
      safety_notes: [],
      is_sensitive: false,
      redaction_policy: "mask",
      created_at: "2026-07-05T00:00:00.000Z",
    });

    expect(improvement.analyzer).toBe("local-rules-v1");
  });
});
