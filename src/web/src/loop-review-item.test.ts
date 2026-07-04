import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { LoopReviewItem } from "./loop-review-item.js";

describe("LoopReviewItem", () => {
  it("renders loop review lines with the existing detail card markup", () => {
    const html = renderToStaticMarkup(
      createElement(LoopReviewItem, {
        lines: ["Safety guidance order", "review before copying"],
        footer: "No ordering writes or external calls",
      }),
    );

    expect(html).toContain('class="loop-review-item"');
    expect(html).toContain('class="loops-status-line"');
    expect(html).toContain("Safety guidance order");
    expect(html).toContain("review before copying");
    expect(html).toContain("No ordering writes or external calls");
  });
});
