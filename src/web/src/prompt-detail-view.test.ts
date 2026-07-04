import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import type { PromptDetail } from "./api.js";
import { PromptDetailView } from "./prompt-detail-view.js";

describe("PromptDetailView", () => {
  it("renders saved improvement draft text and a copy action", () => {
    const html = renderToStaticMarkup(
      createElement(PromptDetailView, {
        copied: false,
        copiedImprovement: false,
        language: "ko",
        savedImprovement: false,
        onBack: vi.fn(),
        onBookmark: vi.fn(),
        onCloseManualCopyFallback: vi.fn(),
        onCopy: vi.fn(),
        onCopyImprovement: vi.fn(),
        onCopySavedDraft: vi.fn(),
        onDelete: vi.fn(),
        onNavigate: vi.fn(),
        onOpenQualityGap: vi.fn(),
        onSaveImprovement: vi.fn(),
        prompt: buildPromptDetail(),
        queueNavigation: {},
      }),
    );

    expect(html).toContain("Saved drafts");
    expect(html).toContain("현재 HTML 파일을 브라우저에서 열어");
    expect(html).toContain("Copy saved draft");
  });

  it("renders a manual-copy fallback when draft clipboard copy fails", () => {
    const html = renderToStaticMarkup(
      createElement(PromptDetailView, {
        copied: false,
        copiedImprovement: false,
        language: "ko",
        manualCopyFallback: {
          title: "Manual copy needed",
          text: "## 목표\n현재 HTML 파일을 브라우저에서 열어 렌더링 상태를 확인해주세요.",
        },
        savedImprovement: false,
        onBack: vi.fn(),
        onBookmark: vi.fn(),
        onCloseManualCopyFallback: vi.fn(),
        onCopy: vi.fn(),
        onCopyImprovement: vi.fn(),
        onCopySavedDraft: vi.fn(),
        onDelete: vi.fn(),
        onNavigate: vi.fn(),
        onOpenQualityGap: vi.fn(),
        onSaveImprovement: vi.fn(),
        prompt: buildPromptDetail(),
        queueNavigation: {},
      }),
    );

    expect(html).toContain("Manual copy needed");
    expect(html).toContain("select the draft below and copy it manually");
    expect(html).toContain("readOnly");
    expect(html).toContain(
      "현재 HTML 파일을 브라우저에서 열어 렌더링 상태를 확인해주세요.",
    );
  });
});

function buildPromptDetail(): PromptDetail {
  return {
    id: "prmt_test",
    tool: "codex",
    source_event: "UserPromptSubmit",
    session_id: "session",
    cwd: "/repo",
    created_at: "2026-07-04T10:00:00.000Z",
    received_at: "2026-07-04T10:00:00.000Z",
    snippet: "html 한번 열어봐줘",
    prompt_length: 12,
    is_sensitive: false,
    excluded_from_analysis: false,
    redaction_policy: "mask",
    adapter_version: "codex-v1",
    index_status: "indexed",
    tags: [],
    quality_gaps: ["goal_clarity"],
    quality_score: 10,
    quality_score_band: "weak",
    usefulness: {
      copied_count: 0,
      bookmarked: false,
    },
    duplicate_count: 1,
    markdown: "html 한번 열어봐줘\n",
    analysis: undefined,
    improvement_drafts: [
      {
        id: "impdraft_test",
        prompt_id: "prmt_test",
        draft_text:
          "## 목표\n현재 HTML 파일을 브라우저에서 열어 렌더링 상태를 확인해주세요.",
        analyzer: "clarifications-v1",
        changed_sections: ["goal_clarity"],
        safety_notes: [
          "개선안은 자동 제출되지 않으며 사용자가 복사해 재입력해야 합니다.",
        ],
        is_sensitive: false,
        redaction_policy: "mask",
        created_at: "2026-07-04T10:01:00.000Z",
      },
    ],
  };
}
