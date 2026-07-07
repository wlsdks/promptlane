import { afterEach, describe, expect, it, vi } from "vitest";

import { detectInitialLanguage, localizeElement } from "./i18n.js";

afterEach(() => {
  vi.unstubAllGlobals();
});

function stubWindow(
  navigatorLanguage: string | undefined,
  storedLanguage: string | null,
): void {
  vi.stubGlobal("window", {
    localStorage: { getItem: () => storedLanguage },
    navigator: navigatorLanguage ? { language: navigatorLanguage } : undefined,
  });
}

describe("detectInitialLanguage", () => {
  it("prefers the persisted language regardless of navigator", () => {
    stubWindow("ko-KR", "en");
    expect(detectInitialLanguage()).toBe("en");
  });

  it("returns ko when navigator.language starts with ko and nothing is stored", () => {
    stubWindow("ko-KR", null);
    expect(detectInitialLanguage()).toBe("ko");
  });

  it("returns ko for any ko-* locale variant", () => {
    stubWindow("KO", null);
    expect(detectInitialLanguage()).toBe("ko");
  });

  it("falls back to en when navigator.language is missing", () => {
    stubWindow(undefined, null);
    expect(detectInitialLanguage()).toBe("en");
  });

  it("falls back to en for non-Korean locales", () => {
    stubWindow("en-US", null);
    expect(detectInitialLanguage()).toBe("en");
  });
});

describe("localizeElement", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("translates empty loop next actions from server-provided status text", () => {
    const statusLabelNode = {
      nodeValue: "PromptLane status ",
      parentElement: { closest: () => undefined },
    };
    const emptyStatusNode = {
      nodeValue: "empty",
      parentElement: { closest: () => undefined },
    };
    const actionNode = {
      nodeValue:
        "Capture one Codex or Claude Code prompt, then run promptlane coach to confirm the first score.",
      parentElement: { closest: () => undefined },
    };
    const privacyNode = {
      nodeValue:
        "Local-only. No prompt bodies, raw paths, or compact summaries are shown here.",
      parentElement: { closest: () => undefined },
    };
    const nodes = [statusLabelNode, emptyStatusNode, actionNode, privacyNode];
    const root = {
      querySelectorAll: () => [],
    } as unknown as HTMLElement;
    vi.stubGlobal("NodeFilter", { SHOW_TEXT: 4 });
    vi.stubGlobal("document", {
      createTreeWalker: () => {
        let index = 0;
        return {
          nextNode: () => {
            const next = nodes[index];
            index += 1;
            return next ?? null;
          },
        };
      },
    });

    localizeElement(root, "ko");

    expect(statusLabelNode.nodeValue).toBe("PromptLane 상태 ");
    expect(emptyStatusNode.nodeValue).toBe("비어 있음");
    expect(actionNode.nodeValue).toBe(
      "Codex 또는 Claude Code 프롬프트를 하나 캡처한 뒤 promptlane coach로 첫 점수를 확인하세요.",
    );
    expect(privacyNode.nodeValue).toBe(
      "로컬 전용입니다. 프롬프트 본문, raw path, compact summary는 여기에 표시하지 않습니다.",
    );
  });
});
