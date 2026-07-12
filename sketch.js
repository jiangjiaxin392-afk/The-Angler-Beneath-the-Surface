let waterOffset = 0;
let castState = "idle";

function setup() {
  const canvas = createCanvas(900, 560);
  canvas.parent("canvasWrap");
}

function draw() {
  background(8, 14, 18);
  drawWater();
  drawLine();
  drawCatch();
}

function drawWater() {
  noFill();
  stroke(80, 150, 170);
  strokeWeight(2);

  for (let y = 180; y < height; y += 28) {
    beginShape();
    for (let x = 0; x <= width; x += 24) {
      const wave = sin((x * 0.018) + waterOffset + y * 0.02) * 8;
      vertex(x, y + wave);
    }
    endShape();
  }

  waterOffset += 0.018;
}

function drawLine() {
  stroke(230);
  strokeWeight(2);
  line(width * 0.5, 70, width * 0.62, 240);
  noFill();
  circle(width * 0.62, 240, 10);
}

function drawCatch() {
  if (castState !== "caught") return;

  fill(230);
  noStroke();
  ellipse(width * 0.62, 290, 70, 32);
  triangle(width * 0.58, 290, width * 0.53, 270, width * 0.53, 310);
}

function startCast() {
  castState = "waiting";

  setTimeout(() => {
    castState = "caught";
  }, 1200);
}
