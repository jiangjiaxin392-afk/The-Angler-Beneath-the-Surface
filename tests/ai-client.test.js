const assert = require("node:assert/strict");
const { test } = require("node:test");

const { createAiClient } = require("../public/js/ai-client.js");

function response(status, data, headers = {}) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: { get: (name) => headers[name.toLowerCase()] || null },
    json: async () => data
  };
}

function createRuntime(fetch, timeoutMs = 50) {
  return {
    AbortController,
    clearTimeout,
    fetch,
    setTimeout,
    timeoutMs
  };
}

test("recommendation accepts a valid server response", async () => {
  const runtime = createRuntime(async () => response(200, { waterId: "daylight-river", tackleId: "quick" }));
  const result = await createAiClient(runtime, { timeoutMs: 50 }).recommend({ question: "test" });
  assert.equal(result.waterId, "daylight-river");
});

test("generation rejects an empty successful response", async () => {
  const runtime = createRuntime(async () => response(200, { answer: "" }));
  await assert.rejects(
    createAiClient(runtime, { timeoutMs: 50 }).generate({}),
    (error) => error.code === "invalid-response"
  );
});

test("rate limiting remains distinct and preserves Retry-After", async () => {
  const runtime = createRuntime(async () => response(429, { error: "Slow down." }, { "retry-after": "7" }));
  await assert.rejects(
    createAiClient(runtime, { timeoutMs: 50 }).generate({}),
    (error) => error.code === "rate-limited" && error.status === 429 && error.retryAfterSeconds === 7
  );
});

test("an unconfigured or unavailable service has a stable error category", async () => {
  const runtime = createRuntime(async () => response(503, { error: "hidden server detail" }));
  await assert.rejects(
    createAiClient(runtime, { timeoutMs: 50 }).generate({}),
    (error) => error.code === "service-unavailable" && error.status === 503
  );
});

test("network failure is not misreported as a timeout", async () => {
  const runtime = createRuntime(async () => { throw new TypeError("offline"); });
  await assert.rejects(
    createAiClient(runtime, { timeoutMs: 50 }).generate({}),
    (error) => error.code === "network"
  );
});

test("a timed-out request is aborted and classified as timeout", async () => {
  const runtime = createRuntime((_path, options) => new Promise((_resolve, reject) => {
    options.signal.addEventListener("abort", () => reject(Object.assign(new Error("aborted"), { name: "AbortError" })));
  }));
  await assert.rejects(
    createAiClient(runtime, { timeoutMs: 5 }).generate({}),
    (error) => error.code === "timeout"
  );
});

test("generation can use its own request deadline", async () => {
  const runtime = createRuntime((_path, options) => new Promise((_resolve, reject) => {
    options.signal.addEventListener("abort", () => reject(Object.assign(new Error("aborted"), { name: "AbortError" })));
  }));
  const client = createAiClient(runtime, { recommendationTimeoutMs: 100, generationTimeoutMs: 5 });
  await assert.rejects(client.generate({}), (error) => error.code === "timeout");
});

test("cancelAll classifies cancellation separately from timeout", async () => {
  const runtime = createRuntime((_path, options) => new Promise((_resolve, reject) => {
    options.signal.addEventListener("abort", () => reject(Object.assign(new Error("aborted"), { name: "AbortError" })));
  }));
  const client = createAiClient(runtime, { timeoutMs: 100 });
  const pending = client.generate({});
  client.cancelAll();
  await assert.rejects(pending, (error) => error.code === "cancelled");
});

test("cancelAll rejects stale results even when fetch ignores abort", async () => {
  let resolveFetch;
  const runtime = createRuntime(() => new Promise((resolve) => { resolveFetch = resolve; }));
  const client = createAiClient(runtime, { timeoutMs: 100 });
  const pending = client.generate({});
  client.cancelAll();
  resolveFetch(response(200, { answer: "late answer" }));
  await assert.rejects(pending, (error) => error.code === "cancelled");
});
