const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const ROOT = path.resolve(__dirname, "..");
const OUTPUT_ROOT = path.join(ROOT, "public", "images", "weather-modules");
const W = 1920;
const H = 1080;

function seeded(seed) {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 0x100000000;
  };
}

async function writeSvg(group, index, width, height, svg) {
  const directory = path.join(OUTPUT_ROOT, group);
  fs.mkdirSync(directory, { recursive: true });
  await sharp(Buffer.from(svg))
    .png({ compressionLevel: 9, adaptiveFiltering: false })
    .toFile(path.join(directory, `frame-${String(index).padStart(2, "0")}.png`));
}

function svgDocument(width, height, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" shape-rendering="crispEdges">${body}</svg>`;
}

async function buildRain(group, count, speed, lengthRange, widthRange, colour, opacity) {
  const frameCount = 12;
  const random = seeded(group === "rain-light" ? 2417 : 8143);
  const drops = Array.from({ length: count }, () => ({
    x: Math.round(random() * (W + 220)) - 110,
    y: Math.round(random() * (H + 180)) - 90,
    length: Math.round(lengthRange[0] + random() * (lengthRange[1] - lengthRange[0])),
    width: Math.round(widthRange[0] + random() * (widthRange[1] - widthRange[0])),
    phase: Math.floor(random() * frameCount)
  }));

  for (let frame = 0; frame < frameCount; frame += 1) {
    const lines = drops.map((drop) => {
      const progress = (frame + drop.phase) % frameCount;
      const y = ((drop.y + progress * speed + 120) % (H + 240)) - 120;
      const x = drop.x - progress * Math.round(speed * 0.22);
      return `<path d="M ${x} ${Math.round(y)} l ${-Math.round(drop.length * 0.24)} ${drop.length}" stroke="${colour}" stroke-width="${drop.width}" stroke-linecap="square" opacity="${opacity}"/>`;
    }).join("");
    await writeSvg(group, frame, W, H, svgDocument(W, H, lines));
  }
}

function impactBody(frame, heavy) {
  const cx = 160;
  const waterY = 154;
  const scale = heavy ? 1.08 : 0.88;
  const blue = heavy ? "#B9E6F2" : "#9DD6E5";
  const pale = "#F3E8C9";
  const dark = "#24677C";
  const parts = [];
  const ellipse = (rx, ry, opacity, width = 3, y = waterY) => {
    parts.push(`<ellipse cx="${cx}" cy="${y}" rx="${Math.round(rx * scale)}" ry="${Math.round(ry * scale)}" fill="none" stroke="${blue}" stroke-width="${width}" opacity="${opacity}"/>`);
    parts.push(`<path d="M ${cx - Math.round(rx * scale * 0.72)} ${y} h ${Math.round(rx * scale * 0.34)} M ${cx + Math.round(rx * scale * 0.32)} ${y} h ${Math.round(rx * scale * 0.36)}" stroke="${pale}" stroke-width="2" opacity="${opacity * 0.62}"/>`);
  };

  // Frames 0-4: one local drop approaches the surface.
  if (frame <= 4) {
    const y = 58 + frame * 19;
    const dropWidth = heavy ? 5 : 4;
    parts.push(`<path d="M ${cx} ${y - 10} C ${cx - dropWidth} ${y - 1}, ${cx - dropWidth} ${y + 7}, ${cx} ${y + 10} C ${cx + dropWidth} ${y + 7}, ${cx + dropWidth} ${y - 1}, ${cx} ${y - 10} Z" fill="${blue}" stroke="${dark}" stroke-width="2"/>`);
    parts.push(`<rect x="${cx - 1}" y="${y - 5}" width="2" height="5" fill="${pale}" opacity="0.72"/>`);
  }
  // Frame 5: contact is deliberately small; this is rain, not a thrown object.
  if (frame === 5) {
    parts.push(`<path d="M ${cx - 5 * scale} ${waterY + 1} L ${cx} ${waterY - 10 * scale} L ${cx + 5 * scale} ${waterY + 1} Z" fill="${blue}" stroke="${dark}" stroke-width="2"/>`);
    ellipse(12, 3, 0.86, 2);
  }
  // Frames 6-9: a compact crown rises, then settles.
  if (frame >= 6 && frame <= 9) {
    const phase = frame - 6;
    const rise = [15, 20, 13, 6][phase];
    const crownWidth = 16 + phase * 4;
    parts.push(`<path d="M ${cx - crownWidth * scale} ${waterY + 2} Q ${cx - 11 * scale} ${waterY - rise}, ${cx - 6 * scale} ${waterY - 1} Q ${cx} ${waterY - (rise + 5)}, ${cx + 6 * scale} ${waterY - 1} Q ${cx + 11 * scale} ${waterY - rise}, ${cx + crownWidth * scale} ${waterY + 2}" fill="none" stroke="${blue}" stroke-width="${heavy ? 4 : 3}"/>`);
    [-15, -7, 7, 15].forEach((dx, index) => {
      const top = waterY - rise - ((index + phase) % 2) * 3;
      const size = heavy ? 4 : 3;
      parts.push(`<rect x="${Math.round(cx + dx * scale)}" y="${Math.round(top)}" width="${size}" height="${size}" fill="${pale}" opacity="${0.9 - phase * 0.14}"/>`);
    });
    ellipse(20 + phase * 8, 4 + phase, 0.84 - phase * 0.12, heavy ? 3 : 2);
  }
  // Frames 10-15: the crown is gone; only widening ripples remain.
  if (frame >= 10) {
    const p = frame - 10;
    ellipse(40 + p * 12, 5 + p, Math.max(0.12, 0.68 - p * 0.1), heavy ? 3 : 2);
    if (p <= 3) ellipse(20 + p * 8, 3 + p, 0.46 - p * 0.09, 2, waterY + 2);
  }
  return parts.join("");
}

async function buildImpacts(group, heavy) {
  for (let frame = 0; frame < 16; frame += 1) {
    await writeSvg(group, frame, 320, 220, svgDocument(320, 220, impactBody(frame, heavy)));
  }
}

function lightningPaths(variant) {
  if (variant === "a") {
    return [
      "M 1370 -20 L 1298 150 L 1352 150 L 1240 322 L 1288 318 L 1142 548",
      "M 1298 150 L 1158 246 L 1198 254 L 1088 366",
      "M 1240 322 L 1378 396 L 1345 408 L 1458 516"
    ];
  }
  return [
    "M 650 -20 L 724 130 L 678 142 L 804 278 L 756 294 L 930 510",
    "M 724 130 L 868 178 L 836 196 L 984 286",
    "M 804 278 L 650 360 L 690 370 L 566 488"
  ];
}

async function buildLightning(group, variant) {
  const paths = lightningPaths(variant);
  const alpha = [0, 0.12, 1, 0.2, 0, 0.48, 0.08, 0];
  for (let frame = 0; frame < alpha.length; frame += 1) {
    const a = alpha[frame];
    let body = "";
    if (a > 0) {
      body += `<rect width="${W}" height="${H}" fill="#B8D7E8" opacity="${(a * 0.12).toFixed(3)}"/>`;
      for (const d of paths) {
        body += `<path d="${d}" fill="none" stroke="#6076B5" stroke-width="18" stroke-linejoin="miter" opacity="${(a * 0.48).toFixed(3)}"/>`;
        body += `<path d="${d}" fill="none" stroke="#E8F4F0" stroke-width="8" stroke-linejoin="miter" opacity="${a}"/>`;
        body += `<path d="${d}" fill="none" stroke="#FFF3B7" stroke-width="3" stroke-linejoin="miter" opacity="${a}"/>`;
      }
    }
    await writeSvg(group, frame, W, H, svgDocument(W, H, body));
  }
}

async function main() {
  await buildRain("rain-light", 72, 16, [28, 52], [2, 3], "#B5DCE5", 0.72);
  await buildRain("rain-heavy", 170, 25, [42, 78], [2, 4], "#C5E4ED", 0.84);
  await buildImpacts("impact-light", false);
  await buildImpacts("impact-heavy", true);
  await buildLightning("lightning-a", "a");
  await buildLightning("lightning-b", "b");
  console.log("Built modular weather PNG animation frames.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
