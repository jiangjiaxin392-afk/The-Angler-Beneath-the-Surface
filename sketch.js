const W = 1920;
const H = 1080;
const GRID = 2;

const C = {
  ink: "#10242C",
  inkBlue: "#16333B",
  inkSoft: "#244850",
  bankMid: "#3D553A",
  forest: "#234D33",
  forestMid: "#49743A",
  forestLight: "#7E9D3D",
  hillShadow: "#5D8D7D",
  riverDeep: "#125B86",
  river: "#2584A8",
  riverLight: "#5AB8CE",
  riverGlint: "#9BD5DF",
  mist: "#C7E5EA",
  sky: "#4DA8E5",
  skyLight: "#D8EDF2",
  cloudShade: "#A9D3E1",
  paper: "#F4EBCF",
  yellow: "#E6BE55",
  yellowDark: "#A77B32",
  red: "#B6534F",
  coat: "#21444A",
  coatLight: "#4E7370"
};

const game = {
  state: "ready",
  stateStarted: 0,
  charge: 0,
  castPower: 0,
  castTarget: { x: 1050, y: 665 },
  lure: { x: 520, y: 610 },
  retrieve: 0,
  biteAt: 0,
  biteWindow: 0,
  fishProgress: 0,
  tension: 0.48,
  dangerTime: 0,
  result: null,
  ripples: [],
  splashes: [],
  observation: { x: 1040, y: 650 },
  shake: 0,
  flash: 0,
  runNumber: 1
};

let lastFrameTime = 0;
let riverBackground;
let anglerSprites;
let cloudSprites;
let plantSprites;

const ANGLER = {
  x: 105,
  y: 580,
  width: 240,
  height: 347,
  frameWidth: 180,
  frameHeight: 260
};

const ANGLER_POSES = {
  ready: { frame: 0, hand: { x: 278, y: 780 } },
  charging: { frame: 2, hand: { x: 292, y: 720 } },
  flying: { frame: 3, hand: { x: 316, y: 718 } },
  waiting: { frame: 0, hand: { x: 278, y: 780 } },
  bite: { frame: 4, hand: { x: 292, y: 758 } },
  hooked: { frame: 5, hand: { x: 300, y: 756 } },
  caught: { frame: 0, hand: { x: 278, y: 780 } },
  failed: { frame: 1, hand: { x: 278, y: 780 } }
};

function preload() {
  riverBackground = loadImage("public/images/river-background.png");
  anglerSprites = loadImage("public/images/angler-sprites.png");
  cloudSprites = loadImage("public/images/cloud-sprites.png");
  plantSprites = loadImage("public/images/plant-sprites.png");
}

function setup() {
  const canvas = createCanvas(W, H);
  canvas.parent("canvasWrap");
  pixelDensity(1);
  frameRate(60);
  noSmooth();
  strokeCap(SQUARE);
  strokeJoin(MITER);
  textFont("monospace");
  resetCast();
}

function draw() {
  const now = millis();
  const dt = constrain((now - lastFrameTime) / 1000, 0, 0.05);
  lastFrameTime = now;

  updateGame(dt);
  updateObservation(dt);

  push();
  if (game.shake > 0) {
    translate(round(random(-game.shake, game.shake)), round(random(-game.shake, game.shake)));
  }
  drawRiverWorld(now);
  drawFishingAction(now);
  pop();

  drawInterface(now);
  game.shake = max(0, game.shake - dt * 24);
  game.flash = max(0, game.flash - dt * 2.8);
}

function updateGame(dt) {
  const elapsed = millis() - game.stateStarted;

  if (game.state === "charging") {
    game.charge = (sin(millis() * 0.005 - HALF_PI) + 1) * 0.5;
  }

  if (game.state === "flying" && elapsed >= 820) {
    game.lure.x = game.castTarget.x;
    game.lure.y = game.castTarget.y;
    addRipple(game.lure.x, game.lure.y, C.paper, 150);
    addSplash(game.lure.x, game.lure.y, 15);
    game.biteAt = random(2.5, 5.2);
    setState("waiting");
  }

  if (game.state === "waiting") {
    if (mouseIsPressed) {
      game.retrieve = min(1, game.retrieve + dt * 0.075);
      game.lure.x = lerp(game.castTarget.x, 805, game.retrieve);
      game.lure.y = lerp(game.castTarget.y, 690, game.retrieve);
      if (frameCount % 17 === 0) addRipple(game.lure.x, game.lure.y, C.mist, 42);
    }

    const activeTime = elapsed / 1000 + game.retrieve * 1.8;
    if (activeTime > game.biteAt) beginBite();
    else if (game.retrieve >= 0.985) finishRun("empty");
  }

  if (game.state === "bite") {
    game.biteWindow -= dt;
    if (frameCount % 7 === 0) addRipple(game.lure.x, game.lure.y, C.yellow, random(82, 155));
    if (game.biteWindow <= 0) finishRun("missed");
  }

  if (game.state === "hooked") {
    const pull = mouseIsPressed ? 0.2 : -0.12;
    const fishSurge = sin(millis() * 0.005) * 0.055 + noise(millis() * 0.001) * 0.045;
    game.tension = constrain(game.tension + (pull + fishSurge) * dt, 0, 1);

    const inControl = game.tension > 0.25 && game.tension < 0.82;
    if (inControl) {
      game.fishProgress = min(1, game.fishProgress + dt * (0.16 + game.tension * 0.06));
      game.dangerTime = max(0, game.dangerTime - dt * 0.8);
    } else {
      game.dangerTime += dt;
      game.fishProgress = max(0, game.fishProgress - dt * 0.025);
    }

    const direction = sin(millis() * 0.0021) * 250;
    const fishY = game.castTarget.y + sin(millis() * 0.007) * 28;
    const fishX = max(game.castTarget.x + direction, getWaterLeft(fishY) + 110);
    game.lure.x = lerp(fishX, 860, game.fishProgress);
    game.lure.y = lerp(fishY, 740, game.fishProgress);
    if (frameCount % 11 === 0) addSplash(game.lure.x, game.lure.y, 5);

    if (game.tension >= 0.985 && game.dangerTime > 1.1) finishRun("snapped");
    else if (game.tension <= 0.015 && game.dangerTime > 1.4) finishRun("escaped");
    else if (game.fishProgress >= 1) finishRun(random() < 0.78 ? "fish" : "weeds");
  }

  updateEffects(dt);
}

function updateObservation(dt) {
  let targetX = 1040;
  let targetY = 650;

  if (game.state === "ready" || game.state === "charging") {
    targetX = constrain(mouseX, 600, 1620);
    targetY = constrain(mouseY, 520, 800);
  } else if (["flying", "waiting", "bite", "hooked"].includes(game.state)) {
    targetX = game.lure.x;
    targetY = game.lure.y;
  } else {
    targetX = game.castTarget.x;
    targetY = game.castTarget.y;
  }

  targetX = max(targetX, getWaterLeft(targetY) + 105);

  const easing = 1 - pow(0.001, dt);
  game.observation.x = lerp(game.observation.x, targetX, easing);
  game.observation.y = lerp(game.observation.y, targetY, easing);
}

function drawRiverWorld(now) {
  image(riverBackground, 0, 0, W, H);
  drawAtmosphereMotion(now);
  beginWaterClip();
  drawWaterAnimation(now);
  drawShoreMotion(now);
  drawObservationZone(now);
  endWaterClip();
  drawAmbientParticles(now);
  drawPlantLayer(now);
  drawAngler(now);
}

function drawAtmosphereMotion(now) {
  const x1 = 610 + ((now * 0.008) % 460);
  const x3 = 620 + ((now * 0.0035 + 300) % 500);
  drawCloudSprite(x1, 126, 0, 270, 135);
  drawCloudSprite(x3, 100, 2, 158, 79);
}

function drawWaterAnimation(now) {
  const t = now * 0.0011;
  const movingColours = [C.riverGlint, C.mist, C.riverLight];
  noStroke();
  for (let row = 0; row < 8; row += 1) {
    const depth = row / 7;
    const y = 496 + row * 61;
    const spacing = 154 + round(depth * 72);
    fill(movingColours[row % movingColours.length]);
    for (let x = -120; x < W + 140; x += spacing) {
      const drift = (t * (14 + row * 0.7) + row * 31) % spacing;
      const seed = hash01(x * 0.13 + row * 61);
      if (seed > 0.56) {
        const markWidth = 8 + round(seed * (14 + depth * 30));
        rect(round(x + drift), y, markWidth, row % 4 === 0 ? 3 : 2);
      }
    }
  }
}

function getWaterLeft(y) {
  if (y <= 430) return 360;
  if (y <= 520) return map(y, 430, 520, 360, 500);
  if (y <= 650) return map(y, 520, 650, 500, 680);
  if (y <= 800) return map(y, 650, 800, 680, 850);
  return map(constrain(y, 800, 965), 800, 965, 850, 1040);
}

function isWaterPoint(x, y, margin = 0) {
  return y >= 430 && y <= 965 && x >= getWaterLeft(y) + margin && x <= W - margin;
}

function beginWaterClip() {
  drawingContext.save();
  drawingContext.beginPath();
  drawingContext.moveTo(360, 430);
  drawingContext.lineTo(500, 520);
  drawingContext.lineTo(680, 650);
  drawingContext.lineTo(850, 800);
  drawingContext.lineTo(1040, 965);
  drawingContext.lineTo(W, 965);
  drawingContext.lineTo(W, 430);
  drawingContext.closePath();
  drawingContext.clip();
}

function endWaterClip() {
  drawingContext.restore();
}

function drawCloudSprite(x, y, frame, drawWidth, drawHeight) {
  image(cloudSprites, round(x), round(y), drawWidth, drawHeight, frame * 320, 0, 320, 160);
}

function drawPlantLayer(now) {
  const swayA = round(sin(now * 0.0013) * 2);
  const swayB = round(sin(now * 0.0011 + 1.7) * 2);
  drawPlantSprite(366 + swayA, 730, 0, 78, 107);
  drawPlantSprite(652 + swayB, 762, 3, 82, 113);
}

function drawPlantSprite(x, y, frame, drawWidth, drawHeight) {
  image(plantSprites, round(x), round(y), drawWidth, drawHeight, frame * 160, 0, 160, 220);
}

function drawCanopyMotion(now) {
  const sway = round(sin(now * 0.0011) * 3 / GRID) * GRID;
  drawLeafCluster(1178 + sway, 286, 1.05, 0);
  drawLeafCluster(1450 - sway, 235, 0.88, 1);
  drawLeafCluster(1690 + sway, 330, 0.72, 2);
}

function drawLeafCluster(x, y, scaleValue, variant) {
  push();
  translate(round(x / GRID) * GRID, round(y / GRID) * GRID);
  scale(scaleValue);
  noStroke();
  const colours = [C.forest, C.forestMid, C.forestLight];
  for (let i = 0; i < 22; i += 1) {
    const seedX = hash01(i * 31 + variant * 17);
    const seedY = hash01(i * 47 + variant * 29);
    const px = -38 + round(seedX * 76 / GRID) * GRID;
    const py = -21 + round(seedY * 42 / GRID) * GRID;
    fill(colours[(i + variant) % colours.length]);
    rect(px, py, 4 + (i % 3) * 2, i % 4 === 0 ? 4 : 2);
  }
  pop();
}

function drawShoreMotion(now) {
  const phase = now * 0.0021;
  noFill();
  stroke(C.riverGlint);
  strokeWeight(2);
  for (let i = 0; i < 3; i += 1) {
    const y = 682 + i * 76;
    const x = getWaterLeft(y) + 54 + sin(phase + i) * 6;
    arc(round(x), round(y), 46 + i * 8, 10, 0.08, PI - 0.08);
  }
}

function drawAmbientParticles(now) {
  noStroke();
  for (let i = 0; i < 9; i += 1) {
    const x = 160 + ((i * 211 + now * (0.006 + i * 0.0004)) % 1580);
    const y = 170 + ((i * 73 + sin(now * 0.0014 + i) * 34) % 290);
    fill(i % 4 === 0 ? C.yellow : C.skyLight);
    rect(round(x / GRID) * GRID, round(y / GRID) * GRID, i % 3 === 0 ? 4 : 2, 2);
  }
}

function drawSky(now) {
  noStroke();
  fill(C.sky);
  rect(0, 0, W, 390);
  fill(C.skyLight);
  rect(0, 286, W, 104);
  fill(C.cloudShade);
  for (let x = 18; x < W; x += 94) {
    const y = 112 + ((x * 7) % 116);
    rect(x, y, 18 + (x % 4) * 6, 2);
  }

  drawCloud(-220 + (now * 0.012) % 2300, 142, 1);
  drawCloud(740 + (now * 0.008) % 1500, 238, 0.72);
  drawCloud(1420 + (now * 0.006) % 900, 108, 0.58);

  drawPixelSun(1540, 145);
}

function drawCloud(x, y, scaleValue) {
  push();
  translate(round(x), round(y));
  scale(scaleValue);
  noStroke();
  fill(C.cloudShade);
  rect(-170, 20, 340, 44);
  rect(-126, -12, 252, 70);
  rect(-54, -38, 108, 92);
  fill(C.skyLight);
  rect(-164, 10, 328, 38);
  rect(-116, -20, 224, 58);
  rect(-44, -44, 88, 70);
  fill(C.mist);
  rect(-152, 54, 82, 6);
  rect(-48, 50, 118, 8);
  rect(92, 48, 48, 6);
  pop();
}

function drawPixelSun(x, y) {
  noStroke();
  fill(C.paper);
  const rows = [64, 88, 104, 116, 116, 104, 88, 64];
  for (let i = 0; i < rows.length; i += 1) {
    rect(x - rows[i] / 2, y - 56 + i * 14, rows[i], 14);
  }
  fill(C.yellow);
  rect(x - 34, y - 38, 26, 12);
  rect(x - 46, y - 20, 18, 8);
}

function drawFarHills() {
  noStroke();
  fill(C.hillShadow);
  beginShape();
  vertex(0, 380);
  vertex(0, 300);
  vertex(140, 258);
  vertex(270, 322);
  vertex(420, 236);
  vertex(590, 326);
  vertex(760, 250);
  vertex(930, 318);
  vertex(1110, 226);
  vertex(1290, 320);
  vertex(1470, 248);
  vertex(1640, 324);
  vertex(1800, 260);
  vertex(W, 316);
  vertex(W, 432);
  vertex(0, 432);
  endShape(CLOSE);

  fill(C.mist);
  beginShape();
  vertex(0, 300);
  vertex(140, 258);
  vertex(270, 322);
  vertex(420, 236);
  vertex(420, 338);
  vertex(270, 344);
  vertex(140, 286);
  vertex(0, 334);
  endShape(CLOSE);
  beginShape();
  vertex(760, 250);
  vertex(930, 318);
  vertex(1110, 226);
  vertex(1110, 348);
  vertex(930, 348);
  endShape(CLOSE);
  beginShape();
  vertex(1470, 248);
  vertex(1640, 324);
  vertex(1800, 260);
  vertex(1800, 362);
  vertex(1640, 360);
  endShape(CLOSE);

  fill(C.skyLight);
  drawMountainMarks(420, 236, 150);
  drawMountainMarks(1110, 226, 168);
  drawMountainMarks(1800, 260, 124);

  fill(C.forestMid);
  beginShape();
  vertex(0, 430);
  vertex(0, 350);
  vertex(180, 302);
  vertex(340, 382);
  vertex(520, 292);
  vertex(700, 382);
  vertex(900, 326);
  vertex(1080, 394);
  vertex(1270, 312);
  vertex(1460, 390);
  vertex(1640, 326);
  vertex(W, 370);
  vertex(W, 470);
  vertex(0, 470);
  endShape(CLOSE);

  fill(C.forestLight);
  for (let x = 12; x < W; x += 74) {
    const y = 360 + ((x * 13) % 54);
    rect(x, y, 24 + (x % 3) * 10, 3);
  }
}

function drawMountainMarks(peakX, peakY, size) {
  rect(peakX - size * 0.08, peakY + 28, size * 0.18, 6);
  rect(peakX - size * 0.18, peakY + 42, size * 0.14, 5);
  rect(peakX + size * 0.1, peakY + 54, size * 0.22, 4);
}

function drawFarTrees(now) {
  const sway = round(sin(now * 0.0008) * 2);
  noStroke();
  fill(C.forest);
  rect(0, 430, W, 70);

  for (let x = -10; x < W + 20; x += 30) {
    const heightValue = 54 + ((x * 17) % 58 + 58) % 58;
    drawSmallTree(x, 456 + sway, heightValue, C.forest, C.forestLight);
  }

  fill(C.inkSoft);
  for (let x = 8; x < W; x += 52) {
    const heightValue = 64 + ((x * 11) % 54 + 54) % 54;
    drawSmallTree(x, 482, heightValue, C.inkSoft, C.forestMid);
  }
}

function drawSmallTree(x, groundY, treeHeight, darkColour, lightColour) {
  noStroke();
  fill(darkColour);
  rect(x - 3, groundY - treeHeight * 0.5, 6, treeHeight * 0.5);
  triangle(x, groundY - treeHeight, x - 10, groundY - treeHeight * 0.57, x + 10, groundY - treeHeight * 0.57);
  triangle(x, groundY - treeHeight * 0.82, x - 15, groundY - treeHeight * 0.34, x + 15, groundY - treeHeight * 0.34);
  triangle(x, groundY - treeHeight * 0.62, x - 19, groundY - treeHeight * 0.1, x + 19, groundY - treeHeight * 0.1);
  fill(lightColour);
  rect(x - 5, groundY - treeHeight * 0.73, 4, treeHeight * 0.22);
  rect(x - 10, groundY - treeHeight * 0.43, 6, 3);
}

function drawRiver(now) {
  noStroke();
  fill(C.riverDeep);
  rect(0, 478, W, 432);
  fill(C.river);
  beginShape();
  vertex(0, 535);
  vertex(W, 500);
  vertex(W, 760);
  vertex(0, 810);
  endShape(CLOSE);

  fill(C.riverLight);
  beginShape();
  vertex(0, 520);
  vertex(W, 496);
  vertex(W, 552);
  vertex(0, 584);
  endShape(CLOSE);

  fill(C.riverDeep);
  beginShape();
  vertex(0, 720);
  vertex(W, 696);
  vertex(W, 758);
  vertex(0, 792);
  endShape(CLOSE);

  const t = now * 0.0011;
  const waterColours = [C.riverGlint, C.mist, C.forestLight, C.riverDeep, C.riverLight];
  for (let row = 0; row < 24; row += 1) {
    const depth = row / 23;
    const y = 500 + row * 17;
    fill(waterColours[row % waterColours.length]);
    const spacing = 78 + round(depth * 74);
    for (let x = -120; x < W + 140; x += spacing) {
      const drift = (t * (11 + row * 0.55) + row * 29) % spacing;
      const seed = hash01(x * 0.17 + row * 43);
      const widthValue = 12 + round(seed * (20 + depth * 54));
      const markHeight = depth > 0.62 && row % 5 === 0 ? 4 : 2;
      rect(round(x + drift), y, widthValue, markHeight);
      if (seed > 0.72) rect(round(x + drift + widthValue + 6), y, 5 + round(seed * 10), 2);
    }
  }

  stroke(C.inkSoft);
  strokeWeight(3);
  noFill();
  for (let row = 0; row < 6; row += 1) {
    const y = 556 + row * 61;
    drawPixelWaterLine(y, t + row * 0.73, 5 + row * 0.5);
  }
}

function drawPixelWaterLine(y, phase, amplitude) {
  beginShape();
  for (let x = -24; x <= W + 24; x += 24) {
    const py = round((y + sin(x * 0.014 + phase) * amplitude) / GRID) * GRID;
    vertex(x, py);
  }
  endShape();
}

function hash01(value) {
  return abs(sin(value * 12.9898) * 43758.5453) % 1;
}

function drawObservationZone(now) {
  if (!["waiting", "bite", "hooked"].includes(game.state)) return;
  const x = game.observation.x;
  const y = game.observation.y;
  const pulse = 1 + sin(now * 0.0026) * 0.025;
  const zoneW = (game.state === "bite" ? 390 : 340) * pulse;
  const zoneH = (game.state === "bite" ? 176 : 150) * pulse;

  noStroke();
  fill(156, 199, 189, game.state === "bite" ? 45 : 20);
  ellipse(x, y, zoneW, zoneH);

  // Water marks exist only inside the partially visible area.
  for (let i = 0; i < 36; i += 1) {
    const px = x - zoneW * 0.42 + ((i * 67) % floor(zoneW * 0.84));
    const py = y - zoneH * 0.34 + ((i * 41) % floor(zoneH * 0.68));
    const nx = (px - x) / (zoneW * 0.5);
    const ny = (py - y) / (zoneH * 0.5);
    if (nx * nx + ny * ny < 0.78) {
      noStroke();
      fill(i % 9 === 0 ? C.paper : i % 3 === 0 ? C.riverGlint : C.riverLight);
      rect(round(px), round(py), 4 + (i % 5) * 4, i % 7 === 0 ? 3 : 2);
    }
  }

  drawObservationBrackets(x, y, zoneW, zoneH, game.state === "bite" ? C.yellow : C.paper);
}

function drawObservationBrackets(x, y, zoneW, zoneH, colour) {
  const left = x - zoneW * 0.5;
  const right = x + zoneW * 0.5;
  const top = y - zoneH * 0.5;
  const bottom = y + zoneH * 0.5;
  const arm = 26;
  stroke(colour);
  strokeWeight(game.state === "bite" ? 4 : 2);
  noFill();
  line(left, top + 28, left, top + arm + 28);
  line(left, top + 28, left + arm, top + 10);
  line(right, top + 28, right, top + arm + 28);
  line(right, top + 28, right - arm, top + 10);
  line(left, bottom - 28, left, bottom - arm - 28);
  line(left, bottom - 28, left + arm, bottom - 10);
  line(right, bottom - 28, right, bottom - arm - 28);
  line(right, bottom - 28, right - arm, bottom - 10);
}

function drawNearBank(now) {
  noStroke();
  fill(C.inkSoft);
  beginShape();
  vertex(0, 760);
  vertex(140, 742);
  vertex(270, 790);
  vertex(430, 770);
  vertex(600, 845);
  vertex(760, 860);
  vertex(900, 920);
  vertex(W, 900);
  vertex(W, H);
  vertex(0, H);
  endShape(CLOSE);

  fill(C.bankMid);
  beginShape();
  vertex(0, 790);
  vertex(136, 770);
  vertex(276, 814);
  vertex(426, 798);
  vertex(596, 858);
  vertex(742, 876);
  vertex(840, 914);
  vertex(692, 904);
  vertex(522, 850);
  vertex(350, 836);
  vertex(180, 806);
  vertex(0, 838);
  endShape(CLOSE);

  fill(C.ink);
  beginShape();
  vertex(0, 830);
  vertex(150, 800);
  vertex(300, 846);
  vertex(470, 820);
  vertex(650, 900);
  vertex(850, 930);
  vertex(W, 940);
  vertex(W, H);
  vertex(0, H);
  endShape(CLOSE);

  drawReeds(70, 840, 1, now);
  drawReeds(525, 850, -1, now + 500);

  fill(C.forestMid);
  for (let i = 0; i < 48; i += 1) {
    const x = (i * 109 + 27) % 830;
    const y = 838 + ((i * 47) % 190);
    rect(x, y, 6 + (i % 5) * 5, 2 + (i % 3) * 2);
  }

  drawBankRock(78, 834, 88, 52);
  drawBankRock(454, 842, 74, 45);
  drawBankRock(650, 900, 112, 58);
}

function drawBankRock(x, y, w, h) {
  noStroke();
  fill(C.inkBlue);
  beginShape();
  vertex(x - w * 0.5, y + h * 0.4);
  vertex(x - w * 0.34, y - h * 0.3);
  vertex(x - w * 0.08, y - h * 0.5);
  vertex(x + w * 0.36, y - h * 0.28);
  vertex(x + w * 0.5, y + h * 0.4);
  endShape(CLOSE);
  fill(C.bankMid);
  rect(x - w * 0.22, y - h * 0.28, w * 0.28, 5);
  rect(x + w * 0.08, y - h * 0.12, w * 0.18, 3);
}

function drawReeds(x, groundY, direction, now) {
  push();
  translate(x, groundY);
  const sway = round(sin(now * 0.0015) * 4 / GRID) * GRID;
  stroke(C.forest);
  strokeWeight(3);
  for (let i = 0; i < 7; i += 1) {
    const px = i * 11 * direction;
    line(px, 10, px + sway + i, -48 - (i % 4) * 14);
  }
  noStroke();
  for (let i = 0; i < 7; i += 2) {
    fill(i % 4 === 0 ? C.forestLight : C.forestMid);
    rect(i * 11 * direction + sway - 2, -65 - (i % 4) * 14, 5, 16);
    rect(i * 11 * direction - 6, -34 - (i % 3) * 9, 12 * direction, 3);
  }
  pop();
}

function drawAngler(now) {
  const frame = getAnglerFrame();
  image(
    anglerSprites,
    ANGLER.x,
    ANGLER.y,
    ANGLER.width,
    ANGLER.height,
    frame * ANGLER.frameWidth,
    0,
    ANGLER.frameWidth,
    ANGLER.frameHeight
  );
}

function getAnglerPose() {
  return ANGLER_POSES[game.state] || ANGLER_POSES.ready;
}

function getAnglerFrame() {
  return getAnglerPose().frame;
}

function drawFishingAction(now) {
  drawRodAndLine(now);
  beginWaterClip();
  drawFishShadow(now);
  drawRipples();
  drawSplashes();

  if (["waiting", "bite", "hooked"].includes(game.state)) drawLure(game.lure.x, game.lure.y, 0.8);
  endWaterClip();
  if (game.state === "flying") drawFlyingLure();
}

function getRodTip(now) {
  let bendX = 0;
  let bendY = 0;
  if (game.state === "charging") {
    bendX = -game.charge * 32;
    bendY = game.charge * 14;
  } else if (game.state === "bite") {
    bendX = 24;
    bendY = 34 + sin(now * 0.04) * 8;
  } else if (game.state === "hooked") {
    bendX = 34 + game.tension * 54;
    bendY = 42 + game.tension * 52;
  }
  return { x: 630 + bendX, y: 470 + bendY };
}

function getRodBase() {
  return getAnglerPose().hand;
}

function drawRodAndLine(now) {
  const tip = getRodTip(now);
  const base = getRodBase();
  const rodPoints = [];
  for (let i = 0; i <= 14; i += 1) {
    const t = i / 14;
    rodPoints.push({
      x: round(bezierPoint(base.x, base.x + 72, tip.x - 72, tip.x, t) / GRID) * GRID,
      y: round(bezierPoint(base.y, base.y - 112, tip.y + 72, tip.y, t) / GRID) * GRID
    });
  }
  noFill();
  stroke(C.ink);
  strokeWeight(9);
  beginShape();
  for (const point of rodPoints) vertex(point.x, point.y);
  endShape();
  stroke(C.coatLight);
  strokeWeight(2);
  beginShape();
  for (const point of rodPoints) vertex(point.x - 1, point.y - 1);
  endShape();
  noStroke();
  fill(C.yellowDark);
  for (let i = 0; i < 4; i += 1) {
    const guideX = lerp(base.x + 68, tip.x - 22, i / 3);
    const guideY = lerp(base.y - 108, tip.y + 18, i / 3);
    rect(round(guideX), round(guideY), 8, 4);
  }

  if (["waiting", "bite", "hooked"].includes(game.state)) {
    stroke(game.state === "hooked" ? C.yellow : C.paper);
    strokeWeight(game.state === "hooked" ? 3 : 2);
    line(tip.x, tip.y, game.lure.x, game.lure.y);
  }
}

function drawFlyingLure() {
  const t = constrain((millis() - game.stateStarted) / 820, 0, 1);
  const tip = getRodTip(millis());
  const x = lerp(tip.x, game.castTarget.x, t);
  const baseY = lerp(tip.y, game.castTarget.y, t);
  const y = baseY - sin(t * PI) * (180 + game.castPower * 145);
  game.lure.x = x;
  game.lure.y = y;

  noFill();
  stroke(C.paper);
  strokeWeight(2);
  bezier(tip.x, tip.y, tip.x + 120, tip.y - 130, x - 80, y - 80, x, y);
  drawLure(x, y, 1);
}

function drawLure(x, y, scaleValue) {
  push();
  translate(round(x), round(y));
  scale(scaleValue);
  noStroke();
  fill(C.ink);
  rect(-24, -9, 48, 19);
  fill(C.yellow);
  rect(-18, -6, 32, 12);
  fill(C.paper);
  rect(-13, -4, 8, 3);
  fill(C.red);
  rect(8, -3, 6, 6);
  fill(C.inkSoft);
  rect(-25, -3, 7, 6);
  stroke(C.paper);
  strokeWeight(2);
  noFill();
  line(-8, 8, -8, 18);
  line(8, 8, 8, 18);
  pop();
}

function drawFishShadow(now) {
  if (!["waiting", "bite", "hooked"].includes(game.state)) return;

  const alphaValue = game.state === "hooked" ? 185 : game.state === "bite" ? 132 : 52;
  const y = game.lure.y + 54 + cos(now * 0.002) * 9;
  const rawX = game.state === "hooked" ? game.lure.x : game.lure.x + sin(now * 0.0018) * 92;
  const x = constrain(rawX, getWaterLeft(y) + 82, W - 82);

  push();
  translate(round(x), round(y));
  noStroke();
  fill(16, 28, 38, alphaValue);
  rect(-35, -12, 68, 24);
  rect(-45, -8, 88, 16);
  triangle(-38, 0, -68, -18, -64, 19);
  triangle(4, -10, 22, -24, 28, -7);
  fill(120, 170, 162, alphaValue * 0.36);
  rect(12, -7, 16, 3);
  pop();
}

function drawRipples() {
  noFill();
  for (const ripple of game.ripples) {
    stroke(ripple.colour);
    strokeWeight(max(2, 4 * (1 - ripple.life)));
    const rw = ripple.size * ripple.life;
    const rh = rw * 0.23;
    arc(ripple.x, ripple.y, rw, rh, PI + 0.2, TWO_PI - 0.2);
    arc(ripple.x, ripple.y, rw, rh, 0.2, PI - 0.2);
  }
}

function drawSplashes() {
  noStroke();
  for (const drop of game.splashes) {
    fill(drop.colour);
    const dw = max(2, round(drop.size * 0.38 / GRID) * GRID);
    const dh = max(4, round(drop.size / GRID) * GRID);
    rect(round(drop.x / GRID) * GRID, round(drop.y / GRID) * GRID, dw, dh);
  }
}

function drawInterface(now) {
  if (game.flash > 0) {
    noStroke();
    fill(223, 186, 98, game.flash * 42);
    rect(0, 0, W, H);
  }

  drawTopBar();
  drawBottomStatus(now);
  if (game.state === "charging") drawChargeMeter();
  if (game.state === "hooked") drawTensionMeter();
  if (game.state === "bite") drawBitePrompt(now);
  if (["caught", "failed"].includes(game.state)) drawResultBanner();
}

function drawTopBar() {
  noStroke();
  fill(C.ink);
  rect(0, 0, W, 82);

  fill(C.paper);
  textStyle(BOLD);
  textSize(27);
  text("THE ANGLER", 34, 50);

  fill(C.forestMid);
  rect(260, 22, 2, 38);

  fill(C.mist);
  textStyle(NORMAL);
  textSize(17);
  text("DAYLIGHT RIVER", 292, 49);

  fill(C.paper);
  textAlign(CENTER, BASELINE);
  text("CURRENT", W / 2 - 70, 49);
  fill(C.riverLight);
  rect(W / 2 + 8, 34, 150, 12);
  fill(C.paper);
  rect(W / 2 + 8, 34, 96, 12);

  textAlign(RIGHT, BASELINE);
  fill(C.mist);
  text("PARTIAL VIEW", W - 34, 49);
  textAlign(LEFT, BASELINE);
}

function drawBottomStatus(now) {
  const copy = getStatusCopy();
  noStroke();
  fill(C.ink);
  rect(0, H - 92, W, 92);
  fill(copy.colour);
  rect(34, H - 68, 5, 42);

  textStyle(BOLD);
  textSize(17);
  text(copy.label, 58, H - 51);
  fill(C.paper);
  textStyle(NORMAL);
  textSize(15);
  text(copy.detail, 58, H - 29);

  if (game.state === "ready") {
    const pulse = 0.72 + sin(now * 0.005) * 0.18;
    const aimY = constrain(mouseY, 520, 800);
    const aimX = max(constrain(mouseX, 600, 1620), getWaterLeft(aimY) + 70);
    noFill();
    stroke(C.yellow);
    strokeWeight(3);
    ellipse(aimX, aimY, 66 * pulse, 21 * pulse);
  }
}

function getStatusCopy() {
  switch (game.state) {
    case "ready": return { label: "CAST 01", detail: "AIM AT THE RIVER  /  HOLD MOUSE TO CHARGE", colour: C.yellow };
    case "charging": return { label: "CAST 01", detail: "RELEASE TO CAST", colour: C.yellow };
    case "flying": return { label: "IN FLIGHT", detail: "WATCH THE LINE", colour: C.paper };
    case "waiting": return { label: "BENEATH", detail: "HOLD MOUSE TO RETRIEVE  /  READ THE WATER", colour: C.riverLight };
    case "bite": return { label: "A SIGNAL", detail: "CLICK NOW TO SET THE HOOK", colour: C.yellow };
    case "hooked": return { label: "ON THE LINE", detail: "HOLD TO PULL  /  RELEASE TO EASE THE TENSION", colour: C.yellow };
    case "caught": return { label: "LANDED", detail: "CLICK TO LOOK BENEATH AGAIN", colour: C.yellow };
    default: return { label: "NO CATCH", detail: "CLICK TO CAST AGAIN", colour: C.red };
  }
}

function drawChargeMeter() {
  const x = 44;
  const y = 170;
  const meterHeight = 360;
  noStroke();
  fill(C.ink);
  rect(x, y, 42, meterHeight);
  fill(C.forestMid);
  rect(x + 9, y + 9, 24, meterHeight - 18);
  fill(game.charge > 0.78 ? C.red : C.yellow);
  rect(x + 9, y + meterHeight - 9, 24, -(meterHeight - 18) * game.charge);
}

function drawTensionMeter() {
  const x = W - 104;
  const y = 162;
  const meterHeight = 380;
  noStroke();
  fill(C.ink);
  rect(x, y, 54, meterHeight);
  fill(C.forestMid);
  rect(x + 9, y + 9, 36, meterHeight - 18);
  fill(game.tension > 0.82 || game.tension < 0.25 ? C.red : C.yellow);
  rect(x + 9, y + meterHeight - 9, 36, -(meterHeight - 18) * game.tension);

  fill(C.ink);
  rect(W - 380, 574, 330, 36);
  fill(C.forestMid);
  rect(W - 370, 584, 310, 16);
  fill(C.riverLight);
  rect(W - 370, 584, 310 * game.fishProgress, 16);
}

function drawBitePrompt(now) {
  const pulse = 1 + sin(now * 0.028) * 0.045;
  push();
  translate(W / 2, 154);
  scale(pulse);
  noStroke();
  fill(C.ink);
  rect(-120, -34, 240, 68);
  fill(C.paper);
  rect(-112, -26, 224, 52);
  fill(C.ink);
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(31);
  text("BITE!", 0, -1);
  pop();
  textAlign(LEFT, BASELINE);
}

function drawResultBanner() {
  noStroke();
  fill(C.paper);
  rect(W / 2 - 300, 110, 600, 88);
  fill(C.ink);
  rect(W / 2 - 292, 118, 584, 72);

  fill(game.state === "caught" ? C.yellow : C.red);
  textAlign(CENTER, BASELINE);
  textStyle(BOLD);
  textSize(25);
  text(getResultTitle(), W / 2, 151);
  fill(C.paper);
  textStyle(NORMAL);
  textSize(13);
  text(getResultDetail(), W / 2, 176);
  textAlign(LEFT, BASELINE);
}

function getResultTitle() {
  if (game.result === "fish") return "A CATCH";
  if (game.result === "weeds") return "SOMETHING ELSE";
  if (game.result === "snapped") return "THE LINE BROKE";
  if (game.result === "escaped") return "IT GOT AWAY";
  if (game.result === "missed") return "TOO LATE";
  return "AN EMPTY HOOK";
}

function getResultDetail() {
  if (game.result === "fish") return "THE RESULT IS YOURS TO INSPECT";
  if (game.result === "weeds") return "NOT EVERY RESPONSE IS THE ONE YOU EXPECTED";
  if (game.result === "snapped") return "TOO MUCH PRESSURE";
  if (game.result === "escaped") return "NOT ENOUGH TENSION";
  if (game.result === "missed") return "THE SIGNAL PASSED";
  return "THE WATER RETURNED NOTHING";
}

function mousePressed() {
  if (game.state === "ready" && mouseY > 470 && mouseY < 830 && mouseX > 520) {
    game.charge = 0;
    setState("charging");
    return false;
  }

  if (game.state === "bite") {
    hookFish();
    return false;
  }

  if (["caught", "failed"].includes(game.state)) {
    resetCast();
    return false;
  }

  return false;
}

function mouseReleased() {
  if (game.state === "charging") castLine();
  return false;
}

function keyPressed() {
  if (key === "r" || key === "R" || keyCode === ESCAPE) resetCast();
}

function castLine() {
  game.castPower = constrain(game.charge, 0.16, 1);
  const distance = map(game.castPower, 0.16, 1, 120, 340);
  game.castTarget.y = constrain(790 - distance * 0.42, 545, 745);
  const aimX = constrain(mouseX, 600, 1620);
  game.castTarget.x = max(aimX, getWaterLeft(game.castTarget.y) + 110);
  game.retrieve = 0;
  game.shake = 2;
  setState("flying");
}

function beginBite() {
  game.biteWindow = 2.4;
  game.flash = 1;
  game.shake = 4;
  addSplash(game.lure.x, game.lure.y, 16);
  setState("bite");
}

function hookFish() {
  game.tension = 0.48;
  game.fishProgress = 0;
  game.dangerTime = 0;
  game.shake = 7;
  game.flash = 0.65;
  setState("hooked");
}

function finishRun(result) {
  game.result = result;
  game.shake = result === "fish" ? 6 : 3;
  game.flash = result === "fish" ? 0.7 : 0.22;
  setState(result === "fish" || result === "weeds" ? "caught" : "failed");
}

function resetCast() {
  game.state = "ready";
  game.stateStarted = millis();
  game.charge = 0;
  game.castPower = 0;
  game.retrieve = 0;
  game.biteAt = 0;
  game.biteWindow = 0;
  game.fishProgress = 0;
  game.tension = 0.48;
  game.dangerTime = 0;
  game.result = null;
  game.ripples = [];
  game.splashes = [];
  game.lure.x = 520;
  game.lure.y = 610;
  game.observation.x = 1040;
  game.observation.y = 650;
  game.runNumber += 1;
  updateAccessibleStatus();
}

function setState(nextState) {
  game.state = nextState;
  game.stateStarted = millis();
  updateAccessibleStatus();
}

function updateAccessibleStatus() {
  const status = document.querySelector("#gameStatus");
  if (!status) return;

  const messages = {
    ready: "Ready to cast.",
    charging: "Charging the cast.",
    flying: "The lure is in flight.",
    waiting: "The lure is in the river. Hold the mouse to retrieve.",
    bite: "A fish is biting. Click now to set the hook.",
    hooked: "Fish hooked. Hold and release the mouse to control line tension.",
    caught: "Catch landed. Click to cast again.",
    failed: "The catch was lost. Click to cast again."
  };

  status.textContent = messages[game.state];
}

function addRipple(x, y, colour, size) {
  game.ripples.push({ x, y, colour, size, life: 0.05 });
}

function addSplash(x, y, amount) {
  for (let i = 0; i < amount; i += 1) {
    game.splashes.push({
      x: x + random(-14, 14),
      y: y + random(-5, 5),
      vx: random(-75, 75),
      vy: random(-190, -64),
      size: random(5, 12),
      life: random(0.55, 1),
      colour: random() > 0.68 ? C.yellow : C.paper
    });
  }
}

function updateEffects(dt) {
  for (const ripple of game.ripples) ripple.life += dt * 0.75;
  game.ripples = game.ripples.filter((ripple) => ripple.life < 1);

  for (const drop of game.splashes) {
    drop.x += drop.vx * dt;
    drop.y += drop.vy * dt;
    drop.vy += 460 * dt;
    drop.life -= dt;
  }
  game.splashes = game.splashes.filter((drop) => drop.life > 0);
}
