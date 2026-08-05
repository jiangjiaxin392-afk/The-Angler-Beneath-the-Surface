const assert = require("node:assert/strict");
const fs = require("node:fs");
const http = require("node:http");
const net = require("node:net");
const path = require("node:path");
const { afterEach, test } = require("node:test");

const {
  collectLocalIndexReferences,
  inspectAudioManifest,
  inspectAssets,
  inspectPort,
  reportHasFatalError
} = require("../tools/startup-preflight.js");

const servers = [];

afterEach(async () => {
  await Promise.all(servers.splice(0).map((server) => new Promise((resolve) => server.close(resolve))));
});

function listen(server) {
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => resolve(server.address().port));
  });
}

test("index reference collection ignores remote and data URLs", () => {
  const references = collectLocalIndexReferences(`
    <script src="public/game.js?v=1"></script>
    <link href="https://example.com/site.css">
    <img src="data:image/png;base64,abc">
  `);
  assert.deepEqual(references, ["public/game.js"]);
});

test("the current project passes its critical asset check", () => {
  const result = inspectAssets(path.resolve(__dirname, ".."));
  assert.ok(result.checked > 20);
  assert.deepEqual(result.missing, []);
});

test("the current audio manifest has unique intact tracks", () => {
  const result = inspectAudioManifest(path.resolve(__dirname, ".."));
  assert.equal(result.checked, 21);
  assert.deepEqual(result.problems, []);
});

test("local environment variants stay ignored while the example remains safe", () => {
  const root = path.resolve(__dirname, "..");
  const ignoreRules = fs.readFileSync(path.join(root, ".gitignore"), "utf8");
  const example = fs.readFileSync(path.join(root, ".env.example"), "utf8");
  assert.match(ignoreRules, /^\.env\.\*$/m);
  assert.match(ignoreRules, /^!\.env\.example$/m);
  assert.doesNotMatch(example, /sk-[A-Za-z0-9_-]{20,}/);
});

test("an available port is reported without starting a service", async () => {
  const reservation = net.createServer();
  const port = await listen(reservation);
  await new Promise((resolve) => reservation.close(resolve));
  assert.deepEqual(await inspectPort({ port, timeoutMs: 200 }), { state: "available" });
});

test("a running Angler server is distinguished from another program", async () => {
  const server = http.createServer((request, response) => {
    response.setHeader("Content-Type", "application/json");
    response.end(JSON.stringify({ provider: "openai", serverRevision: "test-v1", configured: true }));
  });
  servers.push(server);
  const port = await listen(server);
  const result = await inspectPort({ port, timeoutMs: 400 });
  assert.equal(result.state, "angler");
  assert.equal(result.status.configured, true);
});

test("an unrelated service on the port is treated as fatal", async () => {
  const server = http.createServer((_request, response) => response.end("not the game"));
  servers.push(server);
  const port = await listen(server);
  const portInspection = await inspectPort({ port, timeoutMs: 400 });
  assert.equal(portInspection.state, "occupied-other");
  assert.equal(reportHasFatalError({ nodeMajor: 24, assets: { missing: [] }, portInspection }), true);
});
