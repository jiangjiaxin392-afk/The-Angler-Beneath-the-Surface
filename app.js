const http = require("http");
const fs = require("fs");
const path = require("path");

const port = process.env.PORT || 3001;
const projectRoot = __dirname;
const publicRoot = path.join(projectRoot, "public");
const publicEntryFiles = new Set(["index.html", "sketch.js", "style.css"]);

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".mp3": "audio/mpeg",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".woff": "font/woff",
  ".woff2": "font/woff2"
};

const server = http.createServer((request, response) => {
  const url = new URL(request.url, `http://${request.headers.host || "localhost"}`);
  let requestPath;

  try {
    requestPath = decodeURIComponent(url.pathname).replace(/\\/g, "/");
  } catch {
    response.writeHead(400);
    response.end("Bad request");
    return;
  }

  if (requestPath === "/") requestPath = "/index.html";

  const rootEntryName = requestPath.slice(1);
  let filePath = null;

  if (publicEntryFiles.has(rootEntryName)) {
    filePath = path.join(projectRoot, rootEntryName);
  } else if (requestPath.startsWith("/public/")) {
    const publicRelativePath = requestPath.slice("/public/".length);
    const candidatePath = path.resolve(publicRoot, publicRelativePath);

    if (candidatePath.startsWith(publicRoot + path.sep)) {
      filePath = candidatePath;
    }
  }

  if (!filePath) {
    response.writeHead(404, { "X-Content-Type-Options": "nosniff" });
    response.end("Not found");
    return;
  }

  fs.readFile(filePath, (error, file) => {
    if (error) {
      response.writeHead(error.code === "ENOENT" ? 404 : 500);
      response.end(error.code === "ENOENT" ? "Not found" : "Server error");
      return;
    }

    const extension = path.extname(filePath).toLowerCase();
    response.writeHead(200, {
      "Content-Type": contentTypes[extension] || "application/octet-stream",
      "X-Content-Type-Options": "nosniff"
    });
    response.end(request.method === "HEAD" ? undefined : file);
  });
});

server.listen(port, () => {
  console.log(`The Angler is running at http://localhost:${port}`);
  console.log("Press Ctrl + C to stop the server.");
});
