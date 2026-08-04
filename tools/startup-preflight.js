const fs = require("node:fs");
const http = require("node:http");
const net = require("node:net");
const path = require("node:path");

const projectRoot = path.resolve(__dirname, "..");
const howToPages = ["idea", "water", "tackle", "weather", "catch"]
  .map((name, index) => `public/images/how-to-play/page-${String(index + 1).padStart(2, "0")}-${name}-v3.png`);

function collectLocalIndexReferences(html) {
  return [...String(html || "").matchAll(/(?:src|href)="([^"]+)"/g)]
    .map((match) => match[1].split(/[?#]/, 1)[0])
    .filter((reference) => (
      reference
      && !reference.startsWith("data:")
      && !reference.startsWith("http:")
      && !reference.startsWith("https:")
    ));
}

function inspectAssets(root = projectRoot) {
  const entryPath = path.join(root, "index.html");
  if (!fs.existsSync(entryPath)) return { checked: 1, missing: ["index.html"] };
  const references = collectLocalIndexReferences(fs.readFileSync(entryPath, "utf8"));
  const required = [...new Set(["index.html", "sketch.js", "style.css", ...references, ...howToPages])];
  const missing = required.filter((reference) => !fs.existsSync(path.join(root, reference)));
  return { checked: required.length, missing };
}

function probeTcp(host, port, timeoutMs) {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host, port });
    const finish = (result) => {
      socket.removeAllListeners();
      socket.destroy();
      resolve(result);
    };
    socket.setTimeout(timeoutMs, () => finish("unknown"));
    socket.once("connect", () => finish("occupied"));
    socket.once("error", (error) => finish(error?.code === "ECONNREFUSED" ? "available" : "unknown"));
  });
}

function requestStatus(host, port, timeoutMs) {
  return new Promise((resolve) => {
    const request = http.get({ host, port, path: "/api/ai/status", timeout: timeoutMs }, (response) => {
      const chunks = [];
      response.on("data", (chunk) => chunks.push(chunk));
      response.on("end", () => {
        try {
          resolve({ statusCode: response.statusCode, data: JSON.parse(Buffer.concat(chunks).toString("utf8")) });
        } catch {
          resolve(null);
        }
      });
    });
    request.once("timeout", () => request.destroy());
    request.once("error", () => resolve(null));
  });
}

async function inspectPort({ host = "127.0.0.1", port = 3001, timeoutMs = 800 } = {}) {
  const tcpState = await probeTcp(host, port, timeoutMs);
  if (tcpState === "available") return { state: "available" };
  if (tcpState === "unknown") return { state: "unknown" };
  const status = await requestStatus(host, port, timeoutMs);
  if (
    status?.statusCode === 200
    && status.data?.provider === "openai"
    && typeof status.data?.serverRevision === "string"
  ) {
    return { state: "angler", status: status.data };
  }
  return { state: "occupied-other" };
}

async function runPreflight(options = {}) {
  const root = options.root || projectRoot;
  const host = options.host || String(process.env.ANGLER_HOST || "127.0.0.1").trim();
  const port = Number(options.port ?? process.env.PORT) || 3001;
  const assets = inspectAssets(root);
  const portInspection = await inspectPort({ host, port, timeoutMs: options.timeoutMs });
  return {
    root,
    host,
    port,
    assets,
    openAiConfigured: Boolean(String(process.env.OPENAI_API_KEY || "").trim()),
    nodeMajor: Number(process.versions.node.split(".")[0]),
    portInspection
  };
}

function printReport(report) {
  console.log(`Startup check: Node ${process.versions.node}`);
  if (report.assets.missing.length === 0) {
    console.log(`Startup check: ${report.assets.checked} critical files found.`);
  } else {
    console.error(`Startup check failed: ${report.assets.missing.length} critical file(s) missing:`);
    for (const filename of report.assets.missing) console.error(`  - ${filename}`);
  }

  const runningStatus = report.portInspection.status;
  const configured = runningStatus ? Boolean(runningStatus.configured) : report.openAiConfigured;
  console.log(`Startup check: OpenAI configured: ${configured}`);
  if (!configured) {
    console.warn("Startup warning: OPENAI_API_KEY is missing; generated answers will use the offline fallback.");
  }

  if (report.portInspection.state === "angler") {
    console.log(`Startup check: The Angler is already running at http://localhost:${report.port}.`);
  } else if (report.portInspection.state === "occupied-other") {
    console.error(`Startup check failed: port ${report.port} is being used by another program.`);
  } else if (report.portInspection.state === "unknown") {
    console.error(`Startup check failed: port ${report.port} could not be checked safely.`);
  } else {
    console.log(`Startup check: port ${report.port} is available.`);
  }
}

function reportHasFatalError(report) {
  return report.nodeMajor < 20
    || report.assets.missing.length > 0
    || ["occupied-other", "unknown"].includes(report.portInspection.state);
}

module.exports = {
  collectLocalIndexReferences,
  inspectAssets,
  inspectPort,
  printReport,
  reportHasFatalError,
  runPreflight
};

if (require.main === module) {
  runPreflight().then((report) => {
    printReport(report);
    if (report.nodeMajor < 20) console.error("Startup check failed: Node.js 20 or newer is required.");
    process.exitCode = reportHasFatalError(report) ? 1 : 0;
  }).catch((error) => {
    console.error("Startup check failed unexpectedly.", error);
    process.exitCode = 1;
  });
}
