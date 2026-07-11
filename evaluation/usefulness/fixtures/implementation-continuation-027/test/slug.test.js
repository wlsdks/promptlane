import assert from "node:assert/strict"; import test from "node:test"; import { slug } from "../src/slug.js";
test("lowercases and hyphenates spaces", () => assert.equal(slug("Agent Loop"), "agent-loop"));
