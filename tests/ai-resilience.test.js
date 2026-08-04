const assert = require("node:assert/strict");
const { test } = require("node:test");

const resilience = require("../server/ai-resilience.js");

test("invalid structured output receives three bounded attempts", () => {
  assert.equal(resilience.retryLimit({ failureCode: "invalid-json" }), 3);
  assert.equal(resilience.retryLimit({ failureCode: "no-readable-output" }), 3);
});

test("a provider timeout fails without a second long wait", () => {
  assert.equal(resilience.retryLimit({ failureCode: "timeout" }), 1);
});

test("missing configuration fails immediately", () => {
  assert.equal(resilience.retryLimit({ failureCode: "not-configured" }), 1);
});

test("failure codes remain privacy-safe", () => {
  assert.equal(resilience.failureCode({ failureCode: "no-readable-output" }), "no-readable-output");
  assert.equal(resilience.failureCode({ failureCode: "private detail!" }), "unknown-failure");
});
