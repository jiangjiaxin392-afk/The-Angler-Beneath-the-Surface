const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const ROOT = path.resolve(__dirname, "..");
const IMAGE_DIR = path.join(ROOT, "public", "images");
const WIDTH = 1920;
const HEIGHT = 1080;
const FRAME_COUNT = 8;

function makeRgba() {
  return Buffer.alloc(WIDTH * HEIGHT * 4);
}

function pixelOffset(x, y) {
  return (y * WIDTH + x) * 4;
}

function setPixel(buffer, x, y, r, g, b, a) {
  if (x < 0 || x >= WIDTH || y < 0 || y >= HEIGHT) return;
  const offset = pixelOffset(x, y);
  buffer[offset] = r;
  buffer[offset + 1] = g;
  buffer[offset + 2] = b;
  buffer[offset + 3] = a;
}

function fillRect(buffer, x, y, width, height, colour) {
  for (let py = y; py < y + height; py += 1) {
    for (let px = x; px < x + width; px += 1) {
      setPixel(buffer, px, py, ...colour);
    }
  }
}

function hash01(value) {
  const x = Math.sin(value * 91.733) * 43758.5453;
  return x - Math.floor(x);
}

function isSkyPixel(r, g, b, y) {
  return (
    y < 510 &&
    b > 145 &&
    g > 118 &&
    r < 155 &&
    b > r * 1.35 &&
    g > r * 1.08
  );
}

function isLeafHighlight(r, g, b) {
  return g > 92 && g > r * 1.08 && g > b * 1.2 && r > 40;
}

function isWaterArea(x, y) {
  if (y < 485 || y > 1035) return false;
  let left = 320;
  if (y > 520) left = 320 + (y - 520) * 0.76;
  return x > left && x < WIDTH;
}

async function writeRaw(buffer, filename) {
  await sharp(buffer, {
    raw: { width: WIDTH, height: HEIGHT, channels: 4 }
  }).png({ compressionLevel: 9 }).toFile(path.join(IMAGE_DIR, filename));
}

async function buildSkyMask(background) {
  const mask = makeRgba();
  for (let y = 0; y < HEIGHT; y += 1) {
    for (let x = 0; x < WIDTH; x += 1) {
      const offset = pixelOffset(x, y);
      const r = background[offset];
      const g = background[offset + 1];
      const b = background[offset + 2];
      if (isSkyPixel(r, g, b, y)) {
        setPixel(mask, x, y, 255, 255, 255, 255);
      }
    }
  }
  await writeRaw(mask, "scene-sky-mask.png");
  return mask;
}

async function buildCloudFrames(skyMask) {
  const cloudSheet = sharp(path.join(IMAGE_DIR, "cloud-sprites-clean.png"));
  const cloudLarge = await cloudSheet.clone().extract({ left: 0, top: 0, width: 400, height: 180 }).png().toBuffer();
  const cloudSmall = await cloudSheet.clone().extract({ left: 800, top: 0, width: 400, height: 180 }).png().toBuffer();
  const skyMaskPng = await sharp(skyMask, {
    raw: { width: WIDTH, height: HEIGHT, channels: 4 }
  }).png().toBuffer();
  const offsets = [0, 3, 6, 9, 12, 9, 6, 3];

  for (let frame = 0; frame < FRAME_COUNT; frame += 1) {
    const offset = offsets[frame];
    await sharp({
      create: { width: WIDTH, height: HEIGHT, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } }
    })
      .composite([
        { input: cloudLarge, left: 660 + offset, top: 104 },
        { input: cloudSmall, left: 1330 - offset, top: 66 },
        { input: skyMaskPng, left: 0, top: 0, blend: "dest-in" }
      ])
      .png({ compressionLevel: 9 })
      .toFile(path.join(IMAGE_DIR, `scene-cloud-frame-${frame}.png`));
  }
}

async function buildFoliageFrames(background) {
  const regions = [
    { x0: 0, y0: 0, x1: 620, y1: 540 },
    { x0: 900, y0: 120, x1: 1919, y1: 560 }
  ];
  const sway = [-2, -1, 0, 1, 2, 1, 0, -1];

  for (let frame = 0; frame < FRAME_COUNT; frame += 1) {
    const overlay = makeRgba();
    let index = 0;
    for (const region of regions) {
      for (let y = region.y0; y <= region.y1; y += 7) {
        for (let x = region.x0; x <= region.x1; x += 7) {
          const offset = pixelOffset(x, y);
          const r = background[offset];
          const g = background[offset + 1];
          const b = background[offset + 2];
          if (!isLeafHighlight(r, g, b)) continue;
          const phase = Math.floor(hash01(index * 13.7) * FRAME_COUNT);
          const distance = Math.min((frame - phase + FRAME_COUNT) % FRAME_COUNT, (phase - frame + FRAME_COUNT) % FRAME_COUNT);
          if (distance > 1 || hash01(index * 5.9) < 0.42) {
            index += 1;
            continue;
          }
          const lift = distance === 0 ? 18 : 8;
          fillRect(
            overlay,
            x + sway[frame],
            y,
            5,
            3,
            [Math.min(255, r + lift), Math.min(255, g + lift), Math.min(255, b + 4), distance === 0 ? 190 : 125]
          );
          index += 1;
        }
      }
    }
    await writeRaw(overlay, `scene-foliage-frame-${frame}.png`);
  }
}

async function buildWaterFrames(background) {
  const phases = [0, 4, 8, 12, 16, 12, 8, 4];
  for (let frame = 0; frame < FRAME_COUNT; frame += 1) {
    const overlay = makeRgba();
    for (let i = 0; i < 118; i += 1) {
      const y = 510 + Math.floor(hash01(i * 17.3) * 475);
      const left = 380 + Math.max(0, y - 520) * 0.78;
      const x = Math.floor(left + hash01(i * 29.1) * Math.max(80, WIDTH - left - 40));
      if (!isWaterArea(x, y)) continue;
      const source = pixelOffset(Math.min(WIDTH - 1, x), Math.min(HEIGHT - 1, y));
      const sourceR = background[source];
      const sourceG = background[source + 1];
      const sourceB = background[source + 2];
      const length = 10 + Math.floor(hash01(i * 43.7) * 34);
      const drift = (phases[frame] + i * 3) % 20;
      const colour = i % 5 === 0
        ? [196, 239, 222, 128]
        : [Math.min(170, sourceR + 22), Math.min(225, sourceG + 30), Math.min(245, sourceB + 28), 105];
      fillRect(overlay, x + drift, y, length, i % 7 === 0 ? 3 : 2, colour);
    }
    await writeRaw(overlay, `scene-water-frame-${frame}.png`);
  }
}

async function buildAmbientFrames() {
  const flight = [
    [0, 0], [5, -3], [10, -5], [15, -3], [20, 0], [15, 3], [10, 5], [5, 3]
  ];
  for (let frame = 0; frame < FRAME_COUNT; frame += 1) {
    const overlay = makeRgba();
    const [dx, dy] = flight[frame];
    const insects = [
      [730 + dx, 330 + dy],
      [1230 - dx, 382 - dy],
      [1550 + Math.round(dx / 2), 290 + dy]
    ];
    for (const [x, y] of insects) {
      fillRect(overlay, x, y, 4, 2, [242, 195, 74, 220]);
      fillRect(overlay, x - 3, y - 2, 3, 2, [235, 244, 219, 175]);
      fillRect(overlay, x + 4, y - 2, 3, 2, [235, 244, 219, 175]);
    }
    const leafX = 1020 + frame * 7;
    const leafY = 410 + Math.round(Math.sin(frame * Math.PI / 4) * 8);
    fillRect(overlay, leafX, leafY, 7, 3, [107, 149, 61, 190]);
    fillRect(overlay, leafX + 5, leafY + 3, 4, 2, [77, 117, 48, 180]);
    await writeRaw(overlay, `scene-ambient-frame-${frame}.png`);
  }
}

async function main() {
  fs.mkdirSync(IMAGE_DIR, { recursive: true });
  const { data: background, info } = await sharp(path.join(IMAGE_DIR, "river-background-native.png"))
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  if (info.width !== WIDTH || info.height !== HEIGHT) {
    throw new Error(`Expected ${WIDTH}x${HEIGHT}, received ${info.width}x${info.height}`);
  }
  const skyMask = await buildSkyMask(background);
  await buildCloudFrames(skyMask);
  await buildFoliageFrames(background);
  await buildWaterFrames(background);
  await buildAmbientFrames();
  process.stdout.write("Scene layers rebuilt.\n");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
