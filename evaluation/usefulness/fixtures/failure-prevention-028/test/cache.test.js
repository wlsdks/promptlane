import assert from "node:assert/strict"; import test from "node:test"; import { cachePlan } from "../src/cache.js";
test("strategy is undecided", () => assert.deepEqual(cachePlan(), { strategy: "undecided" }));
