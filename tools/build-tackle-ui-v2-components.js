#!/usr/bin/env node
/*
 * Builds the separate, native-resolution tackle UI component PNGs.
 *
 * The generated source art is intentionally kept in
 * public/images/tackle-ui-v2/components/sources. This script removes the
 * chroma background, trims each object, makes colour/state variants, and
 * writes final assets that sketch.js draws at 1:1.
 *
 * Usage (PowerShell):
 *   $env:TACKLE_SHARP_ROOT = 'C:\\path\\to\\a\\folder-containing-node_modules\\sharp'
 *   node tools/build-tackle-ui-v2-components.js
 */

const fs = require("fs");
const path = require("path");

const projectRoot = path.resolve(__dirname, "..");
const sharpRoot = process.env.TACKLE_SHARP_ROOT;
if (!sharpRoot) {
  throw new Error("TACKLE_SHARP_ROOT must point to a folder containing node_modules/sharp.");
}
const sharp = require(path.join(sharpRoot, "node_modules", "sharp"));

const componentRoot = path.join(projectRoot, "public", "images", "tackle-ui-v2", "components");
const sourceRoot = path.join(componentRoot, "sources");
const alphaRoot = path.join(componentRoot, "alpha");
const finalRoot = path.join(componentRoot, "final");
const vectorControlRoot = path.join(componentRoot, "vector-controls");
fs.mkdirSync(alphaRoot, { recursive: true });
fs.mkdirSync(finalRoot, { recursive: true });

const clamp = (value, minimum, maximum) => Math.max(minimum, Math.min(maximum, value));
const smoothstep = (value) => {
  const bounded = clamp(value, 0, 1);
  return bounded * bounded * (3 - 2 * bounded);
};

async function removeGreen(sourceName) {
  const sourcePath = path.join(sourceRoot, sourceName);
  const { data, info } = await sharp(sourcePath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const cornerPoints = [
    [2, 2],
    [info.width - 3, 2],
    [2, info.height - 3],
    [info.width - 3, info.height - 3]
  ];
  const key = [0, 0, 0];
  for (const [x, y] of cornerPoints) {
    const offset = (y * info.width + x) * 4;
    key[0] += data[offset];
    key[1] += data[offset + 1];
    key[2] += data[offset + 2];
  }
  key[0] = Math.round(key[0] / cornerPoints.length);
  key[1] = Math.round(key[1] / cornerPoints.length);
  key[2] = Math.round(key[2] / cornerPoints.length);

  for (let offset = 0; offset < data.length; offset += 4) {
    const red = data[offset];
    const green = data[offset + 1];
    const blue = data[offset + 2];
    const distance = Math.max(Math.abs(red - key[0]), Math.abs(green - key[1]), Math.abs(blue - key[2]));
    const dominance = green - Math.max(red, blue);
    let alpha = 255;
    if (distance <= 10) {
      alpha = 0;
    } else if (dominance >= 16) {
      const distanceAlpha = 255 * smoothstep((distance - 10) / 74);
      const dominanceAlpha = 255 * (1 - clamp(dominance / Math.max(1, key[1] - Math.max(red, blue)), 0, 1));
      alpha = Math.round(Math.min(distanceAlpha, dominanceAlpha));
    }
    if (alpha <= 8) alpha = 0;
    if (alpha < 252 && dominance > 0) {
      data[offset + 1] = Math.min(green, Math.max(red, blue));
    }
    data[offset + 3] = alpha;
  }

  const alphaPath = path.join(alphaRoot, sourceName);
  await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } }).png().toFile(alphaPath);
  return alphaPath;
}

async function trimAndFit(inputPath, outputName, width, height) {
  await sharp(inputPath)
    .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 }, threshold: 2 })
    .resize({ width, height, fit: "inside", kernel: sharp.kernel.lanczos3, withoutEnlargement: true })
    .png({ compressionLevel: 9 })
    .toFile(path.join(finalRoot, outputName));
}

async function recolourBone(inputPath, outputName, target) {
  const { data, info } = await sharp(inputPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let offset = 0; offset < data.length; offset += 4) {
    const red = data[offset];
    const green = data[offset + 1];
    const blue = data[offset + 2];
    const alpha = data[offset + 3];
    const spread = Math.max(red, green, blue) - Math.min(red, green, blue);
    if (alpha > 20 && red > 150 && green > 125 && blue > 95 && spread < 105) {
      const shade = clamp((red + green + blue) / (255 * 3), 0.38, 1);
      data[offset] = Math.round(target[0] * shade);
      data[offset + 1] = Math.round(target[1] * shade);
      data[offset + 2] = Math.round(target[2] * shade);
    }
  }
  await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
    .png({ compressionLevel: 9 })
    .toFile(path.join(finalRoot, outputName));
}

async function buildButtonVariants(baseName) {
  const basePath = path.join(finalRoot, `${baseName}-default.png`);
  await recolourBone(basePath, `${baseName}-hover.png`, [240, 43, 145]);
  await recolourBone(basePath, `${baseName}-pressed.png`, [93, 212, 200]);
}

async function buildNormalControlIcons() {
  for (const buttonName of ["back", "refresh"]) {
    for (const stateName of ["default", "hover", "pressed"]) {
      await sharp(path.join(vectorControlRoot, `${buttonName}-${stateName}.svg`))
        .png({ compressionLevel: 9 })
        .toFile(path.join(finalRoot, `${buttonName}-${stateName}.png`));
    }
  }
}

async function buildCardFrames() {
  const overlayPath = path.join(projectRoot, "public", "images", "tackle-ui-v2", "tackle-ui-overlay-v1-alpha.png");
  const cards = [
    { name: "left", left: 128, top: 232, width: 462, height: 492 },
    { name: "middle", left: 618, top: 232, width: 430, height: 492 },
    { name: "right", left: 1076, top: 232, width: 460, height: 492 }
  ];
  for (const card of cards) {
    const { data, info } = await sharp(overlayPath)
      .extract({ left: card.left, top: card.top, width: card.width, height: card.height })
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    for (let y = 0; y < info.height; y += 1) {
      for (let x = 0; x < info.width; x += 1) {
        const edge = x < 40 || x >= info.width - 40 || y < 40 || y >= info.height - 40;
        if (!edge) continue;
        const offset = (y * info.width + x) * 4;
        const red = data[offset];
        const green = data[offset + 1];
        const blue = data[offset + 2];
        const alpha = data[offset + 3];
        const spread = Math.max(red, green, blue) - Math.min(red, green, blue);
        if (alpha > 30 && red > 150 && green > 130 && blue > 100 && spread < 90) {
          const shade = clamp((red + green + blue) / (255 * 3), 0.42, 1);
          data[offset] = Math.round(240 * shade);
          data[offset + 1] = Math.round(43 * shade);
          data[offset + 2] = Math.round(145 * shade);
        }
      }
    }
    const hoverBuffer = await sharp(data, {
      raw: { width: info.width, height: info.height, channels: 4 }
    }).png().toBuffer();
    await sharp(hoverBuffer).png({ compressionLevel: 9 }).toFile(path.join(finalRoot, `card-${card.name}-hover.png`));

    const inset = 13;
    const selectedLine = Buffer.from(
      `<svg width="${info.width}" height="${info.height}" xmlns="http://www.w3.org/2000/svg">` +
      `<path d="M ${inset + 5} ${inset + 2} L ${info.width - inset - 8} ${inset + 5} ` +
      `L ${info.width - inset - 4} ${info.height - inset - 7} L ${inset + 3} ${info.height - inset - 3} Z" ` +
      `fill="none" stroke="#5dd4c8" stroke-width="3" stroke-linejoin="round"/>` +
      `</svg>`
    );
    await sharp(hoverBuffer)
      .composite([{ input: selectedLine, blend: "over" }])
      .png({ compressionLevel: 9 })
      .toFile(path.join(finalRoot, `card-${card.name}-selected.png`));
  }
}

async function main() {
  const alphaFiles = {};
  for (const sourceName of fs.readdirSync(sourceRoot).filter((name) => name.endsWith(".png"))) {
    alphaFiles[sourceName] = await removeGreen(sourceName);
  }

  await trimAndFit(alphaFiles["color-swatch.png"], "colour-base.png", 78, 38);
  await trimAndFit(alphaFiles["weight-light.png"], "weight-light.png", 30, 64);
  await trimAndFit(alphaFiles["weight-medium.png"], "weight-medium.png", 38, 64);
  await trimAndFit(alphaFiles["weight-heavy.png"], "weight-heavy.png", 48, 64);
  await trimAndFit(alphaFiles["retrieve-straight.png"], "retrieve-straight.png", 210, 66);
  await trimAndFit(alphaFiles["retrieve-stop-and-go.png"], "retrieve-stop-and-go.png", 210, 66);
  await trimAndFit(alphaFiles["retrieve-review.png"], "retrieve-review.png", 210, 66);
  await trimAndFit(alphaFiles["retrieve-step-by-step.png"], "retrieve-step-by-step.png", 210, 66);
  await trimAndFit(alphaFiles["selected-marker.png"], "selected-marker.png", 34, 34);

  const colourBase = path.join(finalRoot, "colour-base.png");
  await recolourBone(colourBase, "colour-neutral.png", [233, 222, 195]);
  await recolourBone(colourBase, "colour-friendly.png", [135, 185, 87]);
  await recolourBone(colourBase, "colour-formal.png", [103, 174, 231]);
  await recolourBone(colourBase, "colour-critical.png", [239, 44, 145]);
  await buildNormalControlIcons();
  await buildCardFrames();

  const outputs = fs.readdirSync(finalRoot).filter((name) => name.endsWith(".png"));
  console.log(`Built ${outputs.length} separate tackle UI component PNGs in ${finalRoot}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
