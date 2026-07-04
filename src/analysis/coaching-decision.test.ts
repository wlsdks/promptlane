import { describe, expect, it } from "vitest";

import { decideCoachingAction } from "./coaching-decision.js";

const NOW = new Date("2026-05-08T00:00:00.000Z");

describe("decideCoachingAction", () => {
  it("returns none when coaching is disabled", () => {
    const decision = decideCoachingAction("fix the bug", {
      mode: "off",
      now: NOW,
    });

    expect(decision).toEqual({
      action: "none",
      reason: "mode_off",
      score: undefined,
    });
  });

  it("returns context for weak prompts in context mode", () => {
    const decision = decideCoachingAction("fix the bug", {
      mode: "context",
      minScore: 100,
      language: "en",
      now: NOW,
    });

    expect(decision.action).toBe("context");
    expect(decision.score).toBeLessThan(100);
    if (decision.action === "context") {
      expect(decision.language).toBe("en");
      expect(decision.improvement.improved_prompt).toContain("## Goal");
    }
  });

  it("suppresses ask mode for short weak prompts", () => {
    const decision = decideCoachingAction("fix it", {
      mode: "ask",
      minScore: 100,
      now: NOW,
    });

    expect(decision).toMatchObject({
      action: "none",
      reason: "ask_prompt_too_short",
    });
  });

  it("suppresses ask mode for leading acknowledgments", () => {
    const decision = decideCoachingAction(
      "그래! 이 작업을 진행해주고 끝나면 그 다음 단계도 마저 작업해줘",
      { mode: "ask", minScore: 100, now: NOW },
    );

    expect(decision).toMatchObject({
      action: "none",
      reason: "ask_acknowledgment",
    });
  });

  it("returns ask when a genuine weak prompt has clarifying questions", () => {
    const decision = decideCoachingAction(
      "이 코드 어딘가 이상한데 한번 봐주고 안되면 알아서 고쳐줘",
      { mode: "ask", now: NOW },
    );

    expect(decision.action).toBe("ask");
    if (decision.action === "ask") {
      expect(decision.language).toBe("ko");
      expect(decision.clarifyingQuestions.length).toBeGreaterThan(0);
      expect(decision.missingAxes.length).toBe(
        decision.clarifyingQuestions.length,
      );
    }
  });
});
