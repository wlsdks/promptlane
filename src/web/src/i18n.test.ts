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

  it("translates loop outcome controls and safety copy", () => {
    const titleNode = {
      nodeValue: "Record outcome",
      parentElement: { closest: () => undefined },
    };
    const statusNode = {
      nodeValue: "In progress",
      parentElement: { closest: () => undefined },
    };
    const safetyNode = {
      nodeValue: "Local only · No automatic memory approval",
      parentElement: { closest: () => undefined },
    };
    const input = {
      getAttribute: (name: string) =>
        name === "placeholder" ? "Safe labels separated by commas" : null,
      setAttribute: vi.fn(),
    };
    const nodes = [titleNode, statusNode, safetyNode];
    const root = {
      querySelectorAll: () => [input],
    } as unknown as HTMLElement;
    vi.stubGlobal("NodeFilter", { SHOW_TEXT: 4 });
    vi.stubGlobal("document", {
      createTreeWalker: () => {
        let index = 0;
        return {
          nextNode: () => nodes[index++] ?? null,
        };
      },
    });

    localizeElement(root, "ko");

    expect(titleNode.nodeValue).toBe("결과 기록");
    expect(statusNode.nodeValue).toBe("진행 중");
    expect(safetyNode.nodeValue).toBe("로컬 전용 · 메모리 자동 승인 없음");
    expect(input.setAttribute).toHaveBeenCalledWith(
      "placeholder",
      "쉼표로 구분한 안전한 라벨",
    );
  });

  it("translates benchmark readiness status, metrics, and next action", () => {
    const values = [
      "1 benchmark candidate ready",
      "completed",
      "attributed",
      "evidence complete",
      "safe",
      "No completed outcomes",
      "Run promptlane loop status, then record the latest snapshot outcome after a verifiable checkpoint.",
    ];
    const nodes = values.map((nodeValue) => ({
      nodeValue,
      parentElement: { closest: () => undefined },
    }));
    const root = { querySelectorAll: () => [] } as unknown as HTMLElement;
    vi.stubGlobal("NodeFilter", { SHOW_TEXT: 4 });
    vi.stubGlobal("document", {
      createTreeWalker: () => {
        let index = 0;
        return { nextNode: () => nodes[index++] ?? null };
      },
    });

    localizeElement(root, "ko");

    expect(nodes.map((node) => node.nodeValue)).toEqual([
      "벤치마크 후보 1개 준비됨",
      "완료",
      "귀속됨",
      "증거 완비",
      "안전",
      "완료된 outcome 없음",
      "promptlane loop status를 실행한 뒤 검증 가능한 checkpoint에서 최신 snapshot outcome을 기록하세요.",
    ]);
  });
});
