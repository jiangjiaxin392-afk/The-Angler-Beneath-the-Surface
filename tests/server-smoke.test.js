const assert = require("node:assert/strict");
const { spawn } = require("node:child_process");
const net = require("node:net");
const path = require("node:path");
const { after, before, test } = require("node:test");

const projectRoot = path.resolve(__dirname, "..");
let serverProcess;
let baseUrl;

function reserveFreePort() {
  return new Promise((resolve, reject) => {
    const probe = net.createServer();
    probe.once("error", reject);
    probe.listen(0, "127.0.0.1", () => {
      const { port } = probe.address();
      probe.close((error) => error ? reject(error) : resolve(port));
    });
  });
}

async function waitForServer(url, timeoutMs = 8_000) {
  const deadline = Date.now() + timeoutMs;
  let lastError;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${url}/api/ai/status`);
      if (response.ok) return;
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, 80));
  }
  throw lastError || new Error("Timed out waiting for the smoke-test server.");
}

before(async () => {
  const port = await reserveFreePort();
  baseUrl = `http://127.0.0.1:${port}`;
  serverProcess = spawn(
    process.execPath,
    ["--env-file-if-exists=.env", "app.js"],
    {
      cwd: projectRoot,
      env: { ...process.env, OPENAI_API_KEY: "", PORT: String(port), ANGLER_HOST: "127.0.0.1" },
      stdio: ["ignore", "pipe", "pipe"],
      windowsHide: true
    }
  );
  await waitForServer(baseUrl);
});

after(async () => {
  if (!serverProcess || serverProcess.exitCode !== null) return;
  serverProcess.kill();
  await new Promise((resolve) => {
    const timer = setTimeout(resolve, 2_000);
    serverProcess.once("exit", () => {
      clearTimeout(timer);
      resolve();
    });
  });
});

test("status exposes the running server revision", async () => {
  const response = await fetch(`${baseUrl}/api/ai/status`);
  assert.equal(response.status, 200);
  const status = await response.json();
  assert.equal(status.provider, "openai");
  assert.equal(status.serverRevision, "20260805-server-v14");
  assert.equal(status.reasoningEffort, "low");
  assert.equal(typeof status.configured, "boolean");
});

test("root serves the game entry page", async () => {
  const response = await fetch(`${baseUrl}/`);
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") || "", /^text\/html/);
  assert.equal(response.headers.get("cache-control"), "no-cache");
  assert.equal(response.headers.get("x-frame-options"), "DENY");
  assert.equal(response.headers.get("referrer-policy"), "no-referrer");
  assert.match(response.headers.get("content-security-policy") || "", /default-src 'self'/);
  assert.match(response.headers.get("permissions-policy") || "", /microphone=\(\)/);
  assert.match(await response.text(), /The Angler/);
});

test("unknown API routes stay closed", async () => {
  const response = await fetch(`${baseUrl}/api/not-a-route`);
  assert.equal(response.status, 404);
  assert.equal(response.headers.get("x-frame-options"), "DENY");
  assert.equal(Object.hasOwn(await response.json(), "detail"), false);
});

test("static files reject mutation methods", async () => {
  const response = await fetch(`${baseUrl}/index.html`, { method: "POST" });
  assert.equal(response.status, 405);
  assert.equal(response.headers.get("allow"), "GET, HEAD");
});

test("encoded traversal cannot expose project files", async () => {
  const response = await fetch(`${baseUrl}/public/%2e%2e/app.js`);
  assert.equal(response.status, 404);
});

test("a provider outage returns no fabricated catch answer", async () => {
  const response = await fetch(`${baseUrl}/api/ai/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      requestId: "smoke-no-response",
      question: "伦敦哪里好玩？",
      modelSelection: { waterId: "daylight-river" },
      promptConfiguration: { tackleId: "quick", weight: "LIGHT" },
      answerShape: { catchId: "perch" }
    })
  });
  assert.equal(response.status, 503);
  const result = await response.json();
  assert.equal(Object.hasOwn(result, "source"), false);
  assert.equal(Object.hasOwn(result, "answer"), false);
  assert.equal(result.failureCode, "not-configured");
});

test("the exact presentation example returns its curated answer without OpenAI", async () => {
  const response = await fetch(`${baseUrl}/api/ai/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      requestId: "smoke-presentation-reserve",
      question: "What attractions should I visit in London?",
      modelSelection: { waterId: "daylight-river" },
      promptConfiguration: { tackleId: "quick", weight: "LIGHT" },
      answerShape: { catchId: "perch" }
    })
  });
  assert.equal(response.status, 200);
  const result = await response.json();
  assert.equal(result.source, "presentation-reserve");
  assert.equal(result.answer, "Big Ben.");
  assert.equal(result.attempts, 0);
});

test("AI routes enforce the per-client request window", async () => {
  let limitedResponse = null;
  for (let index = 0; index < 25; index += 1) {
    const response = await fetch(`${baseUrl}/api/ai/generate`, { method: "POST" });
    if (response.status === 429) {
      limitedResponse = response;
      break;
    }
    assert.equal(response.status, 415);
  }
  assert.ok(limitedResponse);
  assert.equal(limitedResponse.status, 429);
});
