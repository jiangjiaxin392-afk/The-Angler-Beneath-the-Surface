const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { test } = require("node:test");

const projectRoot = path.resolve(__dirname, "..");

test("all local index scripts, styles, and audio sources exist", () => {
  const html = fs.readFileSync(path.join(projectRoot, "index.html"), "utf8");
  const references = [...html.matchAll(/(?:src|href)="([^"]+)"/g)]
    .map((match) => match[1].split(/[?#]/, 1)[0])
    .filter((reference) => reference && !reference.startsWith("data:") && !reference.startsWith("http"));

  assert.ok(references.length > 20);
  for (const reference of references) {
    assert.equal(fs.existsSync(path.join(projectRoot, reference)), true, `Missing index asset: ${reference}`);
  }
});

test("all five HOW TO PLAY v3 pages exist", () => {
  const pageNames = ["idea", "water", "tackle", "weather", "catch"];
  for (let index = 0; index < pageNames.length; index += 1) {
    const filename = `page-${String(index + 1).padStart(2, "0")}-${pageNames[index]}-v3.png`;
    assert.equal(
      fs.existsSync(path.join(projectRoot, "public", "images", "how-to-play", filename)),
      true,
      `Missing HOW TO PLAY page: ${filename}`
    );
  }
});

test("only the first HOW TO PLAY page blocks the initial p5 preload", () => {
  const source = fs.readFileSync(path.join(projectRoot, "sketch.js"), "utf8");
  const preloadStart = source.indexOf("function preload()");
  const setupStart = source.indexOf("function setup()", preloadStart);
  const preloadSource = source.slice(preloadStart, setupStart);

  assert.match(preloadSource, /howToPages\[0\] = loadImage\(HOW_TO_PAGE_PATHS\[0\]\)/);
  assert.doesNotMatch(preloadSource, /for\s*\([^)]*HOW_TO_PAGE_PATHS/);
});
