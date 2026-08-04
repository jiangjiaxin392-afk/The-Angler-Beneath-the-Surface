const assert = require("node:assert/strict");
const { test } = require("node:test");

const resilience = require("../server/ai-resilience.js");

test("invalid structured output receives three bounded attempts", () => {
  assert.equal(resilience.retryLimit({ failureCode: "invalid-json" }), 3);
  assert.equal(resilience.retryLimit({ failureCode: "no-readable-output" }), 3);
});

test("timeouts remain inside the browser request window", () => {
  assert.equal(resilience.retryLimit({ failureCode: "timeout" }), 2);
});

test("missing configuration falls back immediately", () => {
  assert.equal(resilience.retryLimit({ failureCode: "not-configured" }), 1);
});

test("Chinese perch fallback stays ultra-short and playable", () => {
  const result = resilience.buildEmergencyGeneration({
    question: "伦敦哪里好玩？",
    catchId: "perch",
    requestId: "test-perch",
    revision: "test-v1",
    detailLevel: "short",
    error: { failureCode: "invalid-json" },
    attempts: 3
  });
  assert.equal(result.source, "fallback");
  assert.equal(result.answer, "信号中断");
  assert.equal(result.failureCode, "invalid-json");
  assert.equal(result.attempts, 3);
});

test("fallback answers remain distinct for rubbish and weeds", () => {
  const rubbish = resilience.emergencyAnswer("为什么？", "rubbish");
  const weeds = resilience.emergencyAnswer("为什么？", "weeds");
  assert.match(rubbish, /等等/);
  assert.match(rubbish, /没有结论/);
  assert.match(weeds, /偏离/);
  assert.notEqual(rubbish, weeds);
});
