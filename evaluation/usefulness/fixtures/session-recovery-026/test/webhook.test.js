import assert from "node:assert/strict"; import test from "node:test"; import { webhookPolicy } from "../src/webhook.js";
test("policy is undecided", () => assert.deepEqual(webhookPolicy(), { mode: "undecided" }));
