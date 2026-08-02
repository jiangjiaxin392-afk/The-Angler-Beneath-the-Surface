const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const ROOT = path.resolve(__dirname, "..");
const SOURCE_ROOT = path.join(ROOT, "public", "images", "weather-scene", "sources");
const OUTPUT_ROOT = path.join(ROOT, "public", "images", "weather-scene");
const SKY_MASK = path.join(ROOT, "public", "images", "scene-sky-mask.png");
const W = 1920;
const H = 1080;
const FRAME_COUNT = 8;

const CONDITIONS = {
  sunny: {
    source: null,
    grade: { r: 244, g: 190, b: 78, alpha: 0.035 },
    offsets: [[0, 0], [2, 0], [4, 0], [6, 0], [8, 0], [6, 0], [4, 0], [2, 0]]
  },
  cloudy: {
    source: "overcast-alpha.png",
    grade: { r: 36, g: 57, b: 70, alpha: 0.17 },
    offsets: [[0, 0], [-3, 0], [-6, 0], [-9, 0], [-12, 0], [-9, 0], [-6, 0], [-3, 0]]
  },
  fog: {
    source: "fog-alpha.png",
    grade: { r: 188, g: 210, b: 205, alpha: 0.15 },
    offsets: [[-10, 0], [-6, 0], [-2, 0], [2, 0], [6, 0], [10, 0], [6, 0], [2, 0]]
  },
  rain: {
    source: "overcast-alpha.png",
    grade: { r: 27, g: 65, b: 90, alpha: 0.2 },
    offsets: [[0, 0], [-2, 0], [-4, 0], [-6, 0], [-8, 0], [-6, 0], [-4, 0], [-2, 0]]
  },
  storm: {
    source: "overcast-alpha.png",
    grade: { r: 24, g: 30, b: 56, alpha: 0.31 },
    offsets: [[0, 0], [-3, 0], [-6, 0], [-9, 0], [-12, 0], [-9, 0], [-6, 0], [-3, 0]]
  }
};

function transparentCanvas() {
  return sharp({ create: { width: W, height: H, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } });
}

function colourCanvas(colour) {
  return sharp({ create: { width: W, height: H, channels: 4, background: colour } }).png().toBuffer();
}

async function loadPositioned(fileName, dx = 0, dy = 0, cropTop = null) {
  const sourcePath = path.join(SOURCE_ROOT, fileName);
  const safetyX = 96;
  const safetyY = 54;
  const sourceWidth = W + safetyX;
  const sourceHeight = H + safetyY;
  const cropLeft = Math.max(0, Math.min(safetyX, Math.round(safetyX / 2 - dx)));
  const cropY = Math.max(0, Math.min(safetyY, Math.round(safetyY / 2 - dy)));
  let input = sharp(sourcePath)
    .ensureAlpha()
    .resize(sourceWidth, sourceHeight, { fit: "fill", kernel: "nearest" })
    .extract({ left: cropLeft, top: cropY, width: W, height: H });
  let height = H;
  if (cropTop !== null) {
    height = Math.min(cropTop, H);
    input = input.extract({ left: 0, top: 0, width: W, height });
  }
  return transparentCanvas()
    .composite([{ input: await input.png().toBuffer(), left: 0, top: 0 }])
    .png()
    .toBuffer();
}

async function withOpacity(buffer, opacity) {
  const { data, info } = await sharp(buffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  for (let offset = 3; offset < data.length; offset += 4) {
    data[offset] = Math.round(data[offset] * opacity);
  }
  return sharp(data, {
    raw: {
      width: info.width,
      height: info.height,
      channels: 4
    }
  })
    .png()
    .toBuffer();
}

async function maskToSky(buffer) {
  return sharp(buffer)
    .composite([{ input: SKY_MASK, blend: "dest-in" }])
    .png()
    .toBuffer();
}

async function writeFrame(conditionId, layer, frame, buffer) {
  const directory = path.join(OUTPUT_ROOT, conditionId);
  fs.mkdirSync(directory, { recursive: true });
  await sharp(buffer).png({ compressionLevel: 9, adaptiveFiltering: false }).toFile(path.join(directory, `${layer}-${frame}.png`));
}

async function buildCondition(conditionId, config) {
  for (let frame = 0; frame < FRAME_COUNT; frame += 1) {
    const [dx, dy] = config.offsets[frame];
    const skySource = config.source;
    let skyEffect = await transparentCanvas().png().toBuffer();
    if (skySource) {
      const positionedSky = await loadPositioned(skySource, dx, Math.min(dy, 8));
      skyEffect = await maskToSky(positionedSky);
      if (conditionId === "fog") skyEffect = await withOpacity(skyEffect, 0.22);
    }
    const grade = { ...config.grade };
    const back = await transparentCanvas()
      .composite([{ input: skyEffect, left: 0, top: 0 }])
      .png()
      .toBuffer();

    let water = await transparentCanvas().png().toBuffer();
    if (config.source && conditionId === "fog") {
      water = await loadPositioned(config.source, dx, dy);
      water = await withOpacity(water, 0.16);
    }

    const frontComposites = [{ input: await colourCanvas(grade), left: 0, top: 0 }];
    if (conditionId === "fog") {
      const mist = await withOpacity(await loadPositioned(config.source, -dx, 6), 0.11);
      frontComposites.push({ input: mist, left: 0, top: 0 });
    }
    const front = await transparentCanvas().composite(frontComposites).png().toBuffer();

    await Promise.all([
      writeFrame(conditionId, "back", frame, back),
      writeFrame(conditionId, "water", frame, water),
      writeFrame(conditionId, "front", frame, front)
    ]);
  }
}

async function main() {
  for (const [conditionId, config] of Object.entries(CONDITIONS)) {
    await buildCondition(conditionId, config);
    console.log(`Built ${conditionId}: ${FRAME_COUNT} native 1920x1080 frames per layer.`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
