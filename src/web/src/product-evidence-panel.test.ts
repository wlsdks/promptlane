import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { ProductEvidencePanel } from "./product-evidence-panel.js";

describe("ProductEvidencePanel", () => {
  it("keeps release evidence separate from local archive signals", () => {
    const html = renderToStaticMarkup(createElement(ProductEvidencePanel));

    expect(html).toContain("Published product evidence");
    expect(html).toContain("No causal claim");
    expect(html).toContain("30 matched pairs");
    expect(html).toContain("11 matched pairs");
    expect(html).toContain("5 matched pairs");
    expect(html).toContain("Strict success");
    expect(html).toContain("Outcome transitions");
    expect(html).toContain("Resume reliability");
    expect(html).toContain("0/10 pairs");
    expect(html).toContain("Collect 10 counterbalanced resume pairs");
    expect(html).toContain("Scope decisions");
    expect(html).toContain("failure prevention");
    expect(html).toContain("0 independent users");
    expect(html).toContain("0 successful human flows");
    expect(html).not.toContain("/Users/");
    expect(html).not.toContain("sk-proj-");
  });
});
