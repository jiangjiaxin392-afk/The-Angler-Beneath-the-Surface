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

const CATCHES = [
  {
    id: "bass",
    name: "LARGEMOUTH BASS",
    response: "DIRECT ANSWER",
    category: "TARGET CATCH",
    relevance: 5,
    uncertainty: 2,
    candidate: "Start with the British Museum, the National Gallery and the South Bank. Add one neighbourhood, such as Greenwich or Notting Hill, based on your interests.",
    summary: "Closely addresses the question, but still requires verification.",
    missing: ["SOURCE CHECK", "CONTEXT OUTSIDE THE PROMPT"]
  },
  {
    id: "trout",
    name: "RAINBOW TROUT",
    response: "USEFUL ANSWER",
    category: "STRONG CATCH",
    relevance: 4,
    uncertainty: 2,
    candidate: "For a first visit, combine one major museum, one historic area and one riverside walk. The British Museum, Westminster and the South Bank make a balanced starting point.",
    summary: "Useful and well formed, although one interpretation dominates.",
    missing: ["ALTERNATIVE VIEW", "RECENT EVIDENCE"]
  },
  {
    id: "pike",
    name: "NORTHERN PIKE",
    response: "CONFIDENT ANSWER",
    category: "SHARP CATCH",
    relevance: 4,
    uncertainty: 4,
    candidate: "The Tower of London is the single essential attraction and should be the centre of every London itinerary.",
    summary: "Sounds decisive, but confidence is not proof of accuracy.",
    missing: ["SUPPORTING SOURCES", "LIMITS OF THE CLAIM"]
  },
  {
    id: "perch",
    name: "YELLOW PERCH",
    response: "PARTIAL ANSWER",
    category: "SMALL CATCH",
    relevance: 3,
    uncertainty: 3,
    candidate: "You could visit the British Museum, the Tower of London and Buckingham Palace.",
    summary: "Contains something useful, but only covers part of the request.",
    missing: ["FULL CONTEXT", "UNANSWERED PARTS"]
  },
  {
    id: "carp",
    name: "COMMON CARP",
    response: "OVERLOADED ANSWER",
    category: "HEAVY CATCH",
    relevance: 3,
    uncertainty: 3,
    candidate: "London has hundreds of possibilities: museums, markets, parks, palaces, galleries, theatres, viewpoints and neighbourhood walks. Try to see as many as possible.",
    summary: "Provides a lot of material, but quantity obscures the central point.",
    missing: ["PRIORITY", "A CLEAR CONCLUSION"]
  },
  {
    id: "weeds",
    name: "RIVER WEED",
    response: "IRRELEVANT RESPONSE",
    category: "NON-TARGET CATCH",
    relevance: 1,
    uncertainty: 4,
    candidate: "Consider taking a day trip to Stonehenge and Bath, followed by an evening in Brighton.",
    summary: "A response was produced, but it does not answer the intended question.",
    missing: ["USER INTENT", "RELEVANT INFORMATION"]
  },
  {
    id: "rubbish",
    name: "RIVER RUBBISH",
    response: "MISLEADING RESPONSE",
    category: "CONTAMINATED CATCH",
    relevance: 2,
    uncertainty: 5,
    candidate: "The British Museum requires an expensive advance ticket, and the Changing of the Guard takes place every afternoon.",
    summary: "Looks like a result, but may carry incorrect or distorted information.",
    missing: ["RELIABLE EVIDENCE", "FACT CHECKING"]
  },
  {
    id: "boot",
    name: "OLD BOOT",
    response: "OUTDATED RESPONSE",
    category: "RESIDUAL CATCH",
    relevance: 2,
    uncertainty: 4,
    candidate: "Visit the Museum of London at its former Barbican site, then use a paper travelcard for every Underground journey.",
    summary: "Related to the topic, but shaped by information that may no longer apply.",
    missing: ["CURRENT DATA", "DATE AND ORIGIN"]
  }
];

const EXAMPLE_QUESTION = "What attractions should I visit in London?";

const TACKLE_TYPES = [
  { name: "DIRECT", effect: "Asks for the answer without extra framing.", caution: "Fast, but may stay general.", atlas: 0 },
  { name: "CONTEXT-RICH", effect: "Adds useful background before the question.", caution: "More specific, but context can distract.", atlas: 1 },
  { name: "EXAMPLE-GUIDED", effect: "Shows the kind of answer you want.", caution: "Clearer shape, but may copy the example.", atlas: 2 },
  { name: "CLARIFYING", effect: "Checks missing details before answering.", caution: "Careful, but takes another step.", atlas: 3 },
  { name: "COMPARATIVE", effect: "Compares several possible answers.", caution: "Balanced, but less decisive.", atlas: 4 },
  { name: "EVIDENCE-LED", effect: "Asks for support and checks.", caution: "Stronger claims, but slower and longer.", atlas: 5 }
];

const TACKLE_COLOURS = [
  { name: "NEUTRAL", effect: "Uses calm, balanced language.", caution: "Clear, but may feel less personal." },
  { name: "FRIENDLY", effect: "Uses warm and accessible language.", caution: "Easy to read, but less formal." },
  { name: "FORMAL", effect: "Uses structured and professional language.", caution: "Precise, but may feel distant." },
  { name: "CRITICAL", effect: "Questions assumptions and weak claims.", caution: "Useful for checking, but can feel severe." }
];

const TACKLE_WEIGHTS = [
  { name: "LIGHT", effect: "Requests a short answer.", caution: "Quick, but may omit context." },
  { name: "MEDIUM", effect: "Requests useful detail without overload.", caution: "Balanced, but still selective." },
  { name: "HEAVY", effect: "Requests a detailed answer.", caution: "Thorough, but may obscure the main point." }
];

const RETRIEVES = [
  { name: "STRAIGHT", effect: "Answers the question immediately.", caution: "Direct, but does not self-check." },
  { name: "STOP-AND-GO", effect: "Answers in short organised stages.", caution: "Readable, but may break the flow." },
  { name: "REVIEW", effect: "Answers, then checks weak points.", caution: "More careful, but not guaranteed correct." },
  { name: "STEP-BY-STEP", effect: "Builds the answer in a clear sequence.", caution: "Transparent structure, but can be long." }
];

const TACKLE_PROFILES = [
  { id: "quick", name: "QUICK OVERVIEW", type: 0, colour: 0, weight: 0, retrieve: 0, why: "A short, neutral list for first ideas." },
  { id: "personal", name: "PERSONALISED GUIDE", type: 1, colour: 1, weight: 1, retrieve: 1, why: "Adds context and keeps the answer easy to explore." },
  { id: "checked", name: "CHECKED ITINERARY", type: 5, colour: 0, weight: 2, retrieve: 2, why: "Requests detail and checks claims before planning." },
  { id: "compare", name: "COMPARE OPTIONS", type: 4, colour: 0, weight: 1, retrieve: 1, why: "Compares different kinds of London experience." },
  { id: "local", name: "LOCAL FEEL", type: 1, colour: 1, weight: 1, retrieve: 3, why: "Uses preferences to build a more personal route." },
  { id: "careful", name: "CAREFUL START", type: 3, colour: 0, weight: 0, retrieve: 2, why: "Checks what matters before making suggestions." },
  { id: "sample", name: "MATCH AN EXAMPLE", type: 2, colour: 2, weight: 1, retrieve: 3, why: "Uses a clear example to shape the answer." },
  { id: "challenge", name: "QUESTION THE LIST", type: 4, colour: 3, weight: 2, retrieve: 2, why: "Looks for trade-offs instead of one perfect list." },
  { id: "evidence", name: "VERIFY DETAILS", type: 5, colour: 2, weight: 2, retrieve: 2, why: "Prioritises current opening and booking information." }
];

const RESULT_BUTTONS = {
  keep: { x: 1038, y: 690, w: 374, h: 168 },
  release: { x: 1398, y: 690, w: 386, h: 168 },
  recast: { x: 154, y: 870, w: 505, h: 118 },
  retackle: { x: 684, y: 870, w: 527, h: 118 },
  newTarget: { x: 1234, y: 870, w: 530, h: 118 }
};

const UI_ART = { x: 124, y: 70, w: 1672, h: 941 };

const QUESTION_BOUNDS = {
  input: { x: 792, y: 220, w: 932, h: 400 },
  example: { x: 1580, y: 646, w: 150, h: 142 },
  confirm: { x: 780, y: 816, w: 950, h: 126 }
};

const TACKLE_BOUNDS = {
  cards: [
    { x: 318, y: 292, w: 416, h: 522 },
    { x: 748, y: 292, w: 416, h: 522 },
    { x: 1180, y: 292, w: 416, h: 522 }
  ],
  refresh: { x: 1490, y: 164, w: 116, h: 116 },
  confirm: { x: 680, y: 846, w: 570, h: 104 },
  back: { x: 318, y: 832, w: 112, h: 112 }
};

const INTERACTION_ASSETS = {
  lures: [
    { x: 20, y: 36, w: 260, h: 245 },
    { x: 302, y: 36, w: 278, h: 245 },
    { x: 630, y: 36, w: 242, h: 245 },
    { x: 882, y: 26, w: 278, h: 260 },
    { x: 1168, y: 34, w: 260, h: 250 },
    { x: 1422, y: 28, w: 238, h: 255 }
  ],
  shadows: [
    { x: 34, y: 326, w: 302, h: 196 },
    { x: 362, y: 330, w: 316, h: 188 },
    { x: 700, y: 332, w: 322, h: 180 },
    { x: 1074, y: 306, w: 310, h: 220 },
    { x: 1406, y: 334, w: 250, h: 174 }
  ],
  colours: [
    { x: 72, y: 568, w: 194, h: 72 },
    { x: 310, y: 568, w: 194, h: 72 },
    { x: 546, y: 568, w: 194, h: 72 },
    { x: 770, y: 568, w: 190, h: 72 }
  ],
  weights: [
    { x: 1010, y: 552, w: 92, h: 112 },
    { x: 1170, y: 552, w: 150, h: 112 },
    { x: 1378, y: 552, w: 226, h: 112 }
  ],
  retrieves: [
    { x: 54, y: 720, w: 246, h: 126 },
    { x: 304, y: 720, w: 246, h: 126 },
    { x: 548, y: 706, w: 250, h: 150 },
    { x: 786, y: 720, w: 198, h: 126 }
  ],
  refresh: { x: 990, y: 700, w: 142, h: 166 },
  tooltip: { x: 1144, y: 730, w: 300, h: 112 }
};

const BACKPACK_BUTTON = { x: 1798, y: 996, w: 88, h: 70 };

const game = {
  state: "question",
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
  runNumber: 1,
  currentCatch: null,
  inventory: [],
  archiveSelected: -1,
  archiveReturnState: "ready",
  question: "",
  questionFocused: true,
  recommendations: [],
  recommendationDeck: [],
  selectedRecommendation: -1,
  selectedTackleId: null,
  judgement: null,
  currentKept: false,
  hoverTip: null,
  targetShadowIndex: 0,
  lastQuestionEditAt: 0,
  targetLockAt: 0,
  tackleSelectAt: 0,
  saveStampAt: 0
};

let lastFrameTime = 0;
let riverBackground;
let anglerSprites;
let cloudSprites;
let plantAFrames;
let plantBFrames;
let fishShadowFrames;
let rippleFrames;
let splashFrames;
let backpackClosed;
let backpackOpen;
let catchImpact;
let recommendationAtlas;
let targetScreenBase;
let tackleScreenBase;
let resultScreenBase;
let interactionAssetSheet;
let archiveCatchSheet;
let targetLockSheet;
let tackleSelectSheet;
let fishingEffectsSheet;
let catchRevealSheet;
let saveComicSheet;
let catchResultsNativeSheet;
let archiveCatchesNativeSheet;
let targetShadowsNativeSheet;
let backpackOpenNativeSource;
let backpackOpenNative;
let uiFont;
const catchImages = [];
const archiveCatchSprites = [];
const catchResultSprites = [];
const foliageFrames = [];
const waterFrames = [];
const castComicFrames = [];
const biteComicFrames = [];
const tensionComicFrames = [];
const catchRevealFrames = [];
const saveStampFrames = [];
const comicOrnaments = [];
const tackleSelectFrames = [];
const targetShadowFrames = [];
const targetLockFrames = [];

const ANGLER = {
  x: 300,
  y: 525,
  width: 240,
  height: 347,
  frameWidth: 180,
  frameHeight: 260
};

const ANGLER_POSES = {
  ready: { frame: 0, hand: { x: 456, y: 736 } },
  charging: { frame: 2, hand: { x: 458, y: 716 } },
  flying: { frame: 3, hand: { x: 460, y: 704 } },
  waiting: { frame: 0, hand: { x: 456, y: 736 } },
  bite: { frame: 4, hand: { x: 458, y: 724 } },
  hooked: { frame: 5, hand: { x: 456, y: 718 } },
  impact: { frame: 0, hand: { x: 456, y: 736 } },
  result: { frame: 0, hand: { x: 456, y: 736 } },
  archive: { frame: 0, hand: { x: 456, y: 736 } },
  caught: { frame: 0, hand: { x: 456, y: 736 } },
  failed: { frame: 1, hand: { x: 456, y: 736 } }
};

function preload() {
  uiFont = loadFont("public/fonts/RetroSans.ttf");
  riverBackground = loadImage("public/images/river-background-native.png");
  anglerSprites = loadImage("public/images/angler-sprites-clean.png");
  cloudSprites = loadImage("public/images/cloud-sprites-clean.png");
  plantAFrames = loadImage("public/images/plant-a-frames.png");
  plantBFrames = loadImage("public/images/plant-b-frames.png");
  fishShadowFrames = loadImage("public/images/fish-shadow-frames.png");
  rippleFrames = loadImage("public/images/ripple-frames.png");
  splashFrames = loadImage("public/images/splash-frames.png");
  backpackClosed = loadImage("public/images/backpack-closed.png");
  backpackOpen = loadImage("public/images/backpack-open.png");
  catchImpact = loadImage("public/images/catch-impact.png");
  recommendationAtlas = loadImage("public/images/interaction-ui-atlas.png");
  targetScreenBase = loadImage("public/images/target-screen-base.png");
  tackleScreenBase = loadImage("public/images/tackle-screen-base.png");
  resultScreenBase = loadImage("public/images/result-screen-base.png");
  interactionAssetSheet = loadImage("public/images/interaction-assets.png");
  archiveCatchSheet = loadImage("public/images/comic/archive-catches-sheet.png");
  targetLockSheet = loadImage("public/images/comic/target-lock-sheet.png");
  tackleSelectSheet = loadImage("public/images/comic/tackle-select-sheet.png");
  fishingEffectsSheet = loadImage("public/images/comic/fishing-effects-sheet.png");
  catchRevealSheet = loadImage("public/images/comic/catch-reveal-sheet.png");
  saveComicSheet = loadImage("public/images/comic/save-comic-sheet.png");
  catchResultsNativeSheet = loadImage("public/images/catch-results-native-source.png");
  archiveCatchesNativeSheet = loadImage("public/images/archive-catches-native-source.png");
  targetShadowsNativeSheet = loadImage("public/images/target-shadows-native-source.png");
  backpackOpenNativeSource = loadImage("public/images/backpack-open-native-source.png");
  for (const catchDefinition of CATCHES) {
    catchImages.push(loadImage(`public/images/catch-${catchDefinition.id}-transparent.png`));
  }
  for (let i = 0; i < 4; i += 1) {
    foliageFrames.push(loadImage(`public/images/foliage-frame-${i}.png`));
  }
  for (let i = 0; i < 6; i += 1) {
    waterFrames.push(loadImage(`public/images/water-frame-${i}.png`));
  }
}

function setup() {
  const canvas = createCanvas(W, H);
  canvas.parent("canvasWrap");
  canvas.elt.tabIndex = 0;
  canvas.elt.addEventListener("pointerdown", () => canvas.elt.focus());
  canvas.elt.focus();
  pixelDensity(1);
  frameRate(60);
  noSmooth();
  strokeCap(SQUARE);
  strokeJoin(MITER);
  textFont(uiFont);
  prepareComicAssets();
  game.stateStarted = millis();
  refreshRecommendations();
  applyPreviewState();
  updateAccessibleStatus();
}

function applyPreviewState() {
  const parameters = new URLSearchParams(window.location.search);
  const preview = parameters.get("preview");
  if (!preview) return;
  game.question = EXAMPLE_QUESTION;
  game.selectedTackleId = TACKLE_PROFILES[0].id;
  if (preview === "result") {
    const requestedId = parameters.get("catch") || "trout";
    game.currentCatch = CATCHES.find((item) => item.id === requestedId) || CATCHES[0];
    game.result = ["weeds", "rubbish", "boot"].includes(game.currentCatch.id) ? "weeds" : "fish";
    game.state = "result";
    game.stateStarted = millis();
  } else if (preview === "archive") {
    game.inventory = CATCHES.map((item, index) => ({
      id: item.id,
      tackleId: TACKLE_PROFILES[index % TACKLE_PROFILES.length].id,
      question: EXAMPLE_QUESTION,
      cast: index + 1,
      savedAt: "12:00"
    }));
    game.archiveSelected = 0;
    game.archiveReturnState = "ready";
    game.state = "archive";
    game.stateStarted = millis();
  } else if (preview === "tackle") {
    game.recommendations = [0, 1, 2];
    game.selectedRecommendation = 0;
    game.selectedTackleId = TACKLE_PROFILES[0].id;
    game.tackleSelectAt = millis();
    game.state = "tackle";
    game.stateStarted = millis();
  }
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
  if (!['question', 'tackle'].includes(game.state)) drawFishingAction(now);
  pop();

  drawInterface(now);
  game.shake = max(0, game.shake - dt * 24);
  game.flash = max(0, game.flash - dt * 2.8);
}

function updateGame(dt) {
  const elapsed = millis() - game.stateStarted;

  if (game.state === "question" && game.targetLockAt > 0 && millis() - game.targetLockAt >= 1180) {
    game.targetLockAt = 0;
    game.recommendationDeck = [];
    refreshRecommendations();
    setState("tackle");
  }

  if (game.state === "impact" && elapsed >= 1080) {
    setState("result");
  }

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
      game.lure.x = lerp(game.castTarget.x, 930, game.retrieve);
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
    game.lure.x = lerp(fishX, 950, game.fishProgress);
    game.lure.y = lerp(fishY, 740, game.fishProgress);
    if (frameCount % 11 === 0) addSplash(game.lure.x, game.lure.y, 5);

    if (game.tension >= 0.985 && game.dangerTime > 1.1) finishRun("snapped");
    else if (game.tension <= 0.015 && game.dangerTime > 1.4) finishRun("escaped");
    else if (game.fishProgress >= 1) landRandomCatch();
  }

  updateEffects(dt);
}

function updateObservation(dt) {
  let targetX = 1040;
  let targetY = 650;

  if (game.state === "ready" || game.state === "charging") {
    targetX = constrain(mouseX, 850, 1650);
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
  drawFoliageAnimation(now);
  drawAtmosphereMotion(now);
  beginWaterClip();
  drawWaterAnimation(now);
  drawObservationZone(now);
  endWaterClip();
  drawPlantLayer(now);
}

function drawFoliageAnimation(now) {
  const frame = floor(now / 420) % foliageFrames.length;
  image(foliageFrames[frame], 0, 0);
}

function drawAtmosphereMotion(now) {
  const x1 = 570 + ((now * 0.009) % 520);
  const x3 = 920 + ((now * 0.004 + 180) % 430);
  drawCloudSprite(x1, 126, 0);
  drawCloudSprite(x3, 102, 2);
}

function drawWaterAnimation(now) {
  const frame = floor(now / 160) % waterFrames.length;
  image(waterFrames[frame], 0, 0);
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

function drawCloudSprite(x, y, frame) {
  image(cloudSprites, round(x), round(y), 400, 180, frame * 400, 0, 400, 180);
}

function drawPlantLayer(now) {
  drawPlantAnimation(plantAFrames, 350, 760, now, 0);
  drawPlantAnimation(plantBFrames, 650, 790, now, 210);
}

function drawPlantAnimation(sheet, x, y, now, offset) {
  const frame = floor((now + offset) / 260) % 4;
  image(sheet, x, y, 128, 180, frame * 128, 0, 128, 180);
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
  drawAngler(now);
  beginWaterClip();
  drawFishShadow(now);
  drawRipples();
  drawSplashes();
  drawFishingComicEffects(now);

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
  return { x: 825 + bendX, y: 470 + bendY };
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
  if (castComicFrames.length > 0) {
    const frame = min(7, floor(t * 8));
    const effect = castComicFrames[frame];
    push();
    tint(255, 220);
    image(effect, round(x - 190), round(y - 115), 380, 230);
    noTint();
    pop();
  }
  drawLure(x, y, 1);
}

function drawFishingComicEffects(now) {
  if (game.state === "bite" && biteComicFrames.length > 0) {
    const elapsed = max(0, now - game.stateStarted);
    const frame = floor(elapsed / 90) % biteComicFrames.length;
    image(biteComicFrames[frame], round(game.lure.x - 170), round(game.lure.y - 120), 340, 220);
  }
  if (game.state === "hooked" && tensionComicFrames.length > 0) {
    const elapsed = max(0, now - game.stateStarted);
    const frame = floor(elapsed / 105) % tensionComicFrames.length;
    const effect = tensionComicFrames[frame];
    push();
    tint(255, 205);
    image(effect, round(game.lure.x - 150), round(game.lure.y - 102), 300, 204);
    noTint();
    pop();
  }
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

  const y = game.lure.y + 54 + cos(now * 0.002) * 9;
  const rawX = game.state === "hooked" ? game.lure.x : game.lure.x + sin(now * 0.0018) * 92;
  const x = constrain(rawX, getWaterLeft(y) + 82, W - 82);
  const shadow = INTERACTION_ASSETS.shadows[game.runNumber % INTERACTION_ASSETS.shadows.length];
  const alphaValue = game.state === "hooked" ? 255 : game.state === "bite" ? 205 : 125;
  push();
  tint(255, alphaValue);
  image(interactionAssetSheet, round(x) - 145, round(y) - 78, 290, 156, shadow.x, shadow.y, shadow.w, shadow.h);
  noTint();
  pop();
}

function drawRipples() {
  for (const ripple of game.ripples) {
    const frame = constrain(floor(ripple.life * 6), 0, 5);
    image(rippleFrames, round(ripple.x) - 90, round(ripple.y) - 45, 180, 90, frame * 180, 0, 180, 90);
  }
}

function drawSplashes() {
  for (const splash of game.splashes) {
    const frame = constrain(floor(splash.life * 6), 0, 5);
    image(splashFrames, round(splash.x) - 60, round(splash.y) - 92, 120, 120, frame * 120, 0, 120, 120);
  }
}

function drawFlowTopBar(sectionLabel) {
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
  text(sectionLabel, 292, 49);
  textAlign(RIGHT, BASELINE);
  text("BENEATH THE SURFACE?", W - 34, 49);
  textAlign(LEFT, BASELINE);
}

function drawQuestionScreen(now) {
  background(C.ink);
  image(targetScreenBase, UI_ART.x, UI_ART.y, UI_ART.w, UI_ART.h);

  fill(C.yellow);
  textStyle(BOLD);
  textSize(42);
  text("WHAT ARE YOU FISHING FOR?", 808, 198);

  drawTargetSignal(now);

  const input = QUESTION_BOUNDS.input;
  fill(C.paper);
  textStyle(NORMAL);
  textSize(34);
  textWrap(WORD);
  const visibleQuestion = game.question || "Type your question here...";
  if (!game.question) fill(C.hillShadow);
  text(visibleQuestion, input.x + 28, input.y + 58, input.w - 56, input.h - 84);
  if (game.questionFocused && floor(now / 450) % 2 === 0) {
    fill(C.yellow);
    rect(input.x + 28, input.y + input.h - 42, 22, 3);
  }

  drawUiCenteredText("EXAMPLE", QUESTION_BOUNDS.example, 18, C.ink, 0);
  const canConfirm = game.question.trim().length > 0;
  drawUiCenteredText(game.targetLockAt ? "TARGET LOCKING" : "SET THIS TARGET", QUESTION_BOUNDS.confirm, 30, canConfirm ? C.yellow : C.hillShadow, 0);
}

function drawTargetSignal(now) {
  if (game.question.length === 0) return;
  // Keep every silhouette inside the target window. The long-bodied frames
  // need more breathing room than the original equal-cell sheet crop allowed.
  const destination = { x: 302, y: 296, w: 334, h: 226 };
  const shadowFrame = targetShadowFrames[game.targetShadowIndex % max(1, targetShadowFrames.length)];
  if (game.targetLockAt > 0) {
    if (shadowFrame) {
      push();
      tint(255, 255);
      drawImageContained(shadowFrame, destination);
      noTint();
      pop();
    }
    drawUiCenteredText("TARGET LOCKED", { x: 294, y: 522, w: 350, h: 48 }, 20, C.yellow, 4);
    return;
  }
  if (shadowFrame) {
    push();
    tint(255, now - game.lastQuestionEditAt < 190 ? 255 : 235);
    drawImageContained(shadowFrame, destination);
    noTint();
    pop();
  }
}

function noteQuestionEdit() {
  game.lastQuestionEditAt = millis();
  if (targetShadowFrames.length > 0) {
    game.targetShadowIndex = (game.targetShadowIndex + 1) % targetShadowFrames.length;
  }
}

function drawImageContained(source, destination) {
  const scale = min(destination.w / source.width, destination.h / source.height);
  const widthValue = round(source.width * scale);
  const heightValue = round(source.height * scale);
  image(
    source,
    round(destination.x + (destination.w - widthValue) / 2),
    round(destination.y + (destination.h - heightValue) / 2),
    widthValue,
    heightValue
  );
}

function drawComicOrnament(index, x, y, w, h, alphaValue = 255) {
  if (comicOrnaments.length === 0) return;
  const ornament = comicOrnaments[index % comicOrnaments.length];
  push();
  tint(255, alphaValue);
  image(ornament, x, y, w, h);
  noTint();
  pop();
}

function drawTackleScreen() {
  background(C.ink);
  image(tackleScreenBase, UI_ART.x, UI_ART.y, UI_ART.w, UI_ART.h);

  fill(C.mist);
  textStyle(NORMAL);
  textSize(24);
  textAlign(LEFT, CENTER);
  text(game.question, 364, 210);
  textAlign(LEFT, BASELINE);

  for (let index = 0; index < TACKLE_BOUNDS.cards.length; index += 1) {
    const profileIndex = game.recommendations[index];
    if (profileIndex === undefined) continue;
    drawTackleCard(TACKLE_PROFILES[profileIndex], TACKLE_BOUNDS.cards[index], index);
  }

  const hasSelection = game.selectedRecommendation >= 0;
  drawUiCenteredText("TAKE THIS TACKLE", TACKLE_BOUNDS.confirm, 27, hasSelection ? C.yellow : C.hillShadow, 0);
}

function drawTackleCard(profile, bounds, cardIndex) {
  const selected = game.selectedRecommendation === cardIndex;
  drawUiCenteredText(
    profile.name,
    { x: bounds.x + 10, y: bounds.y + 8, w: bounds.w - 20, h: 60 },
    25,
    selected ? C.yellow : C.paper,
    7
  );

  if (selected && tackleSelectFrames.length > 0) {
    const elapsed = millis() - game.tackleSelectAt;
    const animatedFrame = min(4, floor(max(0, elapsed) / 135));
    const overlay = tackleSelectFrames[animatedFrame];
    push();
    drawingContext.save();
    drawingContext.beginPath();
    drawingContext.rect(bounds.x, bounds.y, bounds.w, bounds.h);
    drawingContext.clip();
    tint(255, elapsed < 760 ? 242 : 218);
    image(overlay, bounds.x - 86, bounds.y - 90, bounds.w + 172, bounds.h + 180);
    noTint();
    drawingContext.restore();
    pop();
  }

  const lureBounds = { x: bounds.x + 74, y: bounds.y + 66, w: 268, h: 190 };
  drawAsset(INTERACTION_ASSETS.lures[profile.type], lureBounds);
  drawUiCenteredText(TACKLE_TYPES[profile.type].name, { x: bounds.x, y: bounds.y + 254, w: bounds.w, h: 44 }, 19, C.yellow, 6);

  const colourBounds = { x: bounds.x + 24, y: bounds.y + 326, w: 150, h: 58 };
  const weightBounds = { x: bounds.x + 224, y: bounds.y + 318, w: 140, h: 68 };
  const retrieveBounds = { x: bounds.x + 24, y: bounds.y + 392, w: 360, h: 70 };
  drawAsset(INTERACTION_ASSETS.colours[profile.colour], colourBounds);
  drawAssetContained(INTERACTION_ASSETS.weights[profile.weight], weightBounds);
  drawAsset(INTERACTION_ASSETS.retrieves[profile.retrieve], retrieveBounds);

  drawUiCenteredText(TACKLE_COLOURS[profile.colour].name, { x: bounds.x + 28, y: bounds.y + 360, w: 144, h: 38 }, 18, C.paper, 7);
  drawUiCenteredText(TACKLE_WEIGHTS[profile.weight].name, { x: bounds.x + 224, y: bounds.y + 360, w: 140, h: 38 }, 18, C.paper, 7);
  drawUiCenteredText(
    RETRIEVES[profile.retrieve].name,
    { x: bounds.x + 24, y: bounds.y + 466, w: 360, h: 28 },
    17,
    C.paper,
    0
  );

}

function drawUiCenteredText(label, bounds, size, colour, yOffset = 0) {
  push();
  fill(colour);
  noStroke();
  textStyle(BOLD);
  textSize(size);
  textAlign(CENTER, CENTER);
  text(label, bounds.x + bounds.w / 2, bounds.y + bounds.h / 2 + yOffset);
  pop();
}

function drawAsset(source, destination) {
  image(
    interactionAssetSheet,
    destination.x,
    destination.y,
    destination.w,
    destination.h,
    source.x,
    source.y,
    source.w,
    source.h
  );
}

function drawAssetContained(source, destination) {
  const scale = min(destination.w / source.w, destination.h / source.h);
  const widthValue = round(source.w * scale);
  const heightValue = round(source.h * scale);
  image(
    interactionAssetSheet,
    round(destination.x + (destination.w - widthValue) / 2),
    round(destination.y + (destination.h - heightValue) / 2),
    widthValue,
    heightValue,
    source.x,
    source.y,
    source.w,
    source.h
  );
}

function prepareComicAssets() {
  const nativeCatchIds = ["trout", "pike", "bass", "carp", "perch", "boot", "weeds", "rubbish"];
  const resultById = {};
  const archiveById = {};
  for (let index = 0; index < nativeCatchIds.length; index += 1) {
    const column = index % 4;
    const row = floor(index / 4);
    const catchId = nativeCatchIds[index];
    const resultCell = getGridCell(catchResultsNativeSheet, 4, 2, column, row, 12);
    const resultSprite = keyedCrop(catchResultsNativeSheet, resultCell, false);
    resultById[catchId] = { image: resultSprite, crop: findVisibleBounds(resultSprite, catchId) };

    const archiveCell = getGridCell(archiveCatchesNativeSheet, 4, 2, column, row, 12);
    const archiveSprite = keyedCrop(archiveCatchesNativeSheet, archiveCell, false);
    archiveById[catchId] = { image: archiveSprite, crop: findVisibleBounds(archiveSprite, catchId) };
  }
  for (const catchDefinition of CATCHES) {
    catchResultSprites.push(resultById[catchDefinition.id]);
    archiveCatchSprites.push(archiveById[catchDefinition.id]);
  }

  const keyedBackpack = keyedCrop(
    backpackOpenNativeSource,
    { x: 0, y: 0, w: backpackOpenNativeSource.width, h: backpackOpenNativeSource.height },
    false
  );
  const backpackBounds = findVisibleBounds(keyedBackpack, "backpack");
  backpackOpenNative = keyedBackpack.get(
    backpackBounds.x,
    backpackBounds.y,
    backpackBounds.w,
    backpackBounds.h
  );

  extractBandRow(fishingEffectsSheet, castComicFrames, 8, 112, 314, 18, 5);
  extractBandRow(fishingEffectsSheet, biteComicFrames, 6, 410, 658, 18, 5);
  extractBandRow(fishingEffectsSheet, tensionComicFrames, 8, 746, 978, 18, 5);

  for (let row = 0; row < 2; row += 1) {
    for (let column = 0; column < 5; column += 1) {
      const cell = getGridCell(catchRevealSheet, 5, 2, column, row, 5);
      catchRevealFrames.push(keyedCrop(catchRevealSheet, cell, false));
    }
  }

  const targetShadowCells = [
    { x: 30, y: 180, w: 410, h: 320 },
    { x: 450, y: 210, w: 430, h: 280 },
    { x: 895, y: 210, w: 475, h: 280 },
    { x: 1375, y: 175, w: 365, h: 330 },
    { x: 1755, y: 170, w: 400, h: 340 }
  ];
  for (const cell of targetShadowCells) {
    const shadow = keyedCrop(targetShadowsNativeSheet, cell, false);
    const shadowBounds = findVisibleBounds(shadow, "target");
    targetShadowFrames.push(shadow.get(shadowBounds.x, shadowBounds.y, shadowBounds.w, shadowBounds.h));
  }
  for (let column = 0; column < 8; column += 1) {
    const cell = getGridCell(targetLockSheet, 8, 2, column, 1, 4);
    targetLockFrames.push(removeTargetPanel(targetLockSheet, cell));
  }

  for (let column = 0; column < 6; column += 1) {
    const cell = getGridCell(saveComicSheet, 6, 2, column, 0, 5);
    const keyedStamp = keyedCrop(saveComicSheet, cell, false);
    const visibleStamp = findVisibleBounds(keyedStamp, "save");
    saveStampFrames.push(keyedStamp.get(visibleStamp.x, visibleStamp.y, visibleStamp.w, visibleStamp.h));
  }
  extractGridRow(saveComicSheet, comicOrnaments, 6, 1, 2, 5);

  for (let column = 0; column < 8; column += 1) {
    const cell = getGridCell(tackleSelectSheet, 8, 1, column, 0, 7);
    tackleSelectFrames.push(keyedCrop(tackleSelectSheet, cell, true));
  }
}

function extractBandRow(sheet, target, columns, top, bottom, horizontalInset, verticalInset) {
  for (let column = 0; column < columns; column += 1) {
    const x0 = floor(sheet.width * column / columns) + horizontalInset;
    const x1 = floor(sheet.width * (column + 1) / columns) - horizontalInset;
    const cell = {
      x: x0,
      y: top + verticalInset,
      w: max(1, x1 - x0),
      h: max(1, bottom - top - verticalInset * 2)
    };
    target.push(keyedCrop(sheet, cell, false));
  }
}

function removeTargetPanel(sheet, crop) {
  const output = sheet.get(crop.x, crop.y, crop.w, crop.h);
  output.loadPixels();
  for (let index = 0; index < output.pixels.length; index += 4) {
    const r = output.pixels[index];
    const g = output.pixels[index + 1];
    const b = output.pixels[index + 2];
    const dr = r - 2;
    const dg = g - 82;
    const db = b - 109;
    if (dr * dr + dg * dg + db * db <= 24 * 24) output.pixels[index + 3] = 0;
  }
  output.updatePixels();
  const bounds = findVisibleBounds(output, "target");
  return output.get(bounds.x, bounds.y, bounds.w, bounds.h);
}

function extractGridRow(sheet, target, columns, row, rows, inset) {
  for (let column = 0; column < columns; column += 1) {
    const cell = getGridCell(sheet, columns, rows, column, row, inset);
    target.push(keyedCrop(sheet, cell, false));
  }
}

function getGridCell(sheet, columns, rows, column, row, inset = 0) {
  const x0 = floor(sheet.width * column / columns) + inset;
  const x1 = floor(sheet.width * (column + 1) / columns) - inset;
  const y0 = floor(sheet.height * row / rows) + inset;
  const y1 = floor(sheet.height * (row + 1) / rows) - inset;
  return { x: x0, y: y0, w: max(1, x1 - x0), h: max(1, y1 - y0) };
}

function keyedCrop(sheet, crop, removeDarkPanel) {
  const output = sheet.get(crop.x, crop.y, crop.w, crop.h);
  output.loadPixels();
  for (let index = 0; index < output.pixels.length; index += 4) {
    const r = output.pixels[index];
    const g = output.pixels[index + 1];
    const b = output.pixels[index + 2];
    const magentaCore = r > 140 && b > 120 && g < 140 && r + b > g * 2.65;
    const magentaFringe =
      r > 52 &&
      b > 62 &&
      r > g * 1.35 &&
      b > g * 1.35 &&
      r + b - g * 2 > 86;
    const magenta = magentaCore || magentaFringe;
    const darkPanel = removeDarkPanel && r < 42 && g < 75 && b < 88;
    if (magenta || darkPanel) output.pixels[index + 3] = 0;
  }
  output.updatePixels();
  return output;
}

function createArchiveCatchSprite(source, catchId) {
  source.loadPixels();
  const output = createImage(source.width, source.height);
  output.loadPixels();

  for (let y = 0; y < source.height; y += 1) {
    for (let x = 0; x < source.width; x += 1) {
      const index = 4 * (y * source.width + x);
      const r = source.pixels[index];
      const g = source.pixels[index + 1];
      const b = source.pixels[index + 2];
      const a = source.pixels[index + 3];
      const lowerHalf = y > source.height * 0.34;
      const skin = lowerHalf && r > 88 && r > g * 1.12 && r - b > 30 && g > b * 0.78;
      const sleeve = y > source.height * 0.48 && r < 95 && g < 125 && b < 135 && g > r * 0.72;
      const lowerDebris = y > source.height * 0.72;
      const removePixel = skin || sleeve || lowerDebris;

      output.pixels[index] = r;
      output.pixels[index + 1] = g;
      output.pixels[index + 2] = b;
      output.pixels[index + 3] = removePixel ? 0 : a;
    }
  }
  output.updatePixels();
  keepLargestArchiveComponent(output);

  return {
    image: output,
    crop: findVisibleBounds(output, catchId)
  };
}

function keepLargestArchiveComponent(source) {
  source.loadPixels();
  const widthValue = source.width;
  const heightValue = source.height;
  const pixelCount = widthValue * heightValue;
  const visited = new Uint8Array(pixelCount);
  const labels = new Int32Array(pixelCount);
  const componentSizes = [0];
  const queue = new Int32Array(pixelCount);
  let componentId = 0;

  for (let start = 0; start < pixelCount; start += 1) {
    if (visited[start] || source.pixels[start * 4 + 3] < 32) continue;
    componentId += 1;
    let head = 0;
    let tail = 1;
    let size = 0;
    queue[0] = start;
    visited[start] = 1;

    while (head < tail) {
      const current = queue[head];
      head += 1;
      labels[current] = componentId;
      size += 1;
      const x = current % widthValue;
      const y = floor(current / widthValue);

      for (let offsetY = -1; offsetY <= 1; offsetY += 1) {
        for (let offsetX = -1; offsetX <= 1; offsetX += 1) {
          if (offsetX === 0 && offsetY === 0) continue;
          const nextX = x + offsetX;
          const nextY = y + offsetY;
          if (nextX < 0 || nextX >= widthValue || nextY < 0 || nextY >= heightValue) continue;
          const next = nextY * widthValue + nextX;
          if (visited[next] || source.pixels[next * 4 + 3] < 32) continue;
          visited[next] = 1;
          queue[tail] = next;
          tail += 1;
        }
      }
    }
    componentSizes[componentId] = size;
  }

  let largestId = 0;
  let largestSize = 0;
  for (let id = 1; id < componentSizes.length; id += 1) {
    if (componentSizes[id] > largestSize) {
      largestId = id;
      largestSize = componentSizes[id];
    }
  }

  for (let index = 0; index < pixelCount; index += 1) {
    if (labels[index] !== largestId) source.pixels[index * 4 + 3] = 0;
  }
  source.updatePixels();
}

function findVisibleBounds(source, catchId) {
  source.loadPixels();
  let minX = source.width;
  let minY = source.height;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < source.height; y += 1) {
    for (let x = 0; x < source.width; x += 1) {
      const alpha = source.pixels[4 * (y * source.width + x) + 3];
      if (alpha < 32) continue;
      minX = min(minX, x);
      minY = min(minY, y);
      maxX = max(maxX, x);
      maxY = max(maxY, y);
    }
  }
  if (maxX < minX || maxY < minY) return { x: 0, y: 0, w: source.width, h: source.height };
  const padding = catchId === "weeds" ? 2 : 6;
  return {
    x: max(0, minX - padding),
    y: max(0, minY - padding),
    w: min(source.width - minX + padding, maxX - minX + 1 + padding * 2),
    h: min(source.height - minY + padding, maxY - minY + 1 + padding * 2)
  };
}

function drawArchiveCatchSprite(sprite, destination) {
  if (!sprite) return;
  const crop = sprite.crop;
  const scale = min(destination.w / crop.w, destination.h / crop.h);
  const widthValue = round(crop.w * scale);
  const heightValue = round(crop.h * scale);
  image(
    sprite.image,
    round(destination.x + (destination.w - widthValue) / 2),
    round(destination.y + (destination.h - heightValue) / 2),
    widthValue,
    heightValue,
    crop.x,
    crop.y,
    crop.w,
    crop.h
  );
}

function drawFrame(bounds) {
  noStroke();
  fill(C.paper);
  rect(bounds.x, bounds.y, bounds.w, bounds.h);
  fill(C.ink);
  rect(bounds.x + 8, bounds.y + 8, bounds.w - 16, bounds.h - 16);
}

function setHoverTip(bounds, title, effect, caution) {
  if (!game.hoverTip && pointInRect(mouseX, mouseY, bounds)) game.hoverTip = { title, effect, caution };
}

function drawHoverTip() {
  if (!game.hoverTip) return;
  const tip = game.hoverTip;
  const w = 300;
  const h = 112;
  const x = constrain(mouseX + 24, 18, W - w - 18);
  const y = constrain(mouseY > H / 2 ? mouseY - h - 24 : mouseY + 24, 86, H - h - 18);
  drawAsset(INTERACTION_ASSETS.tooltip, { x, y, w, h });
  fill(C.yellow);
  textStyle(BOLD);
  textSize(12);
  text(tip.title, x + 18, y + 25);
  fill(C.paper);
  textStyle(NORMAL);
  textSize(11);
  text(tip.effect, x + 18, y + 48, w - 36, 24);
  fill(C.mist);
  text(tip.caution, x + 18, y + 78, w - 36, 24);
}

function drawInterface(now) {
  game.hoverTip = null;
  if (game.state === "question") {
    drawQuestionScreen(now);
    return;
  }
  if (game.state === "tackle") {
    drawTackleScreen();
    return;
  }
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
  if (game.state === "failed") drawResultBanner();
  if (game.state === "impact") drawCatchImpact(now);
  if (game.state === "result") drawCatchResult();
  if (game.state === "archive") drawArchive();
  if (!["impact", "result", "archive"].includes(game.state)) drawBackpackButton();
}

function drawTopBar() {
  noStroke();
  fill(C.ink);
  rect(0, 0, W, 82);

  fill(C.paper);
  textStyle(BOLD);
  textSize(30);
  text("THE ANGLER", 34, 50);

  fill(C.forestMid);
  rect(260, 22, 2, 38);

  fill(C.mist);
  textStyle(NORMAL);
  textSize(20);
  text("DAYLIGHT RIVER", 292, 49);
}

function drawBottomStatus(now) {
  const copy = getStatusCopy();
  noStroke();
  fill(C.ink);
  rect(0, H - 92, W, 92);
  fill(copy.colour);
  rect(34, H - 68, 5, 42);

  textStyle(BOLD);
  textSize(22);
  text(copy.label, 58, H - 51);
  fill(C.paper);
  textStyle(NORMAL);
  textSize(18);
  text(copy.detail, 58, H - 29);

  if (game.state === "ready") {
    const pulse = 0.72 + sin(now * 0.005) * 0.18;
    const aimY = constrain(mouseY, 520, 800);
    const aimX = max(constrain(mouseX, 850, 1650), getWaterLeft(aimY) + 70);
    noFill();
    stroke(C.yellow);
    strokeWeight(3);
    ellipse(aimX, aimY, 66 * pulse, 21 * pulse);
  }
}

function getStatusCopy() {
  const castLabel = `CAST ${String(game.runNumber).padStart(2, "0")}`;
  switch (game.state) {
    case "ready": return { label: castLabel, detail: "AIM AT THE RIVER  /  HOLD MOUSE TO CHARGE", colour: C.yellow };
    case "charging": return { label: castLabel, detail: "RELEASE TO CAST", colour: C.yellow };
    case "flying": return { label: "IN FLIGHT", detail: "WATCH THE LINE", colour: C.paper };
    case "waiting": return { label: "BENEATH", detail: "HOLD MOUSE TO RETRIEVE  /  READ THE WATER", colour: C.riverLight };
    case "bite": return { label: "A SIGNAL", detail: "CLICK NOW TO SET THE HOOK", colour: C.yellow };
    case "hooked": return { label: "ON THE LINE", detail: "HOLD TO PULL  /  RELEASE TO EASE THE TENSION", colour: C.yellow };
    case "impact": return { label: "LANDED", detail: "A RESPONSE HAS SURFACED", colour: C.yellow };
    case "result": return { label: "INSPECT", detail: "JUDGE THE RESPONSE  /  THEN CAST AGAIN, CHANGE TACKLE OR SET A NEW TARGET", colour: C.yellow };
    case "archive": return { label: "CATCH ARCHIVE", detail: "SAVED FOR REVIEW DOES NOT MEAN VERIFIED", colour: C.riverLight };
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

function drawCatchImpact(now) {
  if (!game.currentCatch) return;
  noStroke();
  fill(7, 24, 30, 238);
  rect(0, 82, W, H - 174);

  const elapsed = now - game.stateStarted;
  const frame = min(catchRevealFrames.length - 1, floor(elapsed / 108));
  if (frame >= 0 && catchRevealFrames[frame]) {
    image(catchRevealFrames[frame], W / 2 - 410, H / 2 - 270, 820, 520);
  }
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(48);
  fill(C.paper);
  text("A RESPONSE SURFACES", W / 2, H / 2 + 185);
  textAlign(LEFT, BASELINE);
}

function drawCatchResult() {
  const catchData = game.currentCatch;
  if (!catchData) return;
  const catchIndex = CATCHES.findIndex((item) => item.id === catchData.id);

  background(C.ink);
  image(resultScreenBase, UI_ART.x, UI_ART.y, UI_ART.w, UI_ART.h);
  drawSpriteContainedBottom(catchResultSprites[catchIndex], { x: 128, y: 104, w: 880, h: 748 });

  drawCatchResultInfo(catchData, getSelectedTackle(), game.question);
  drawSaveStamp();
}

function drawSaveStamp() {
  if (!game.saveStampAt || saveStampFrames.length === 0) return;
  const elapsed = millis() - game.saveStampAt;
  if (elapsed > 1700) return;
  const frame = min(saveStampFrames.length - 1, floor(elapsed / 190));
  const stamp = saveStampFrames[frame];
  push();
  tint(255, elapsed > 1450 ? map(elapsed, 1450, 1700, 255, 0) : 255);
  drawImageContained(stamp, { x: 124, y: 92, w: 884, h: 748 });
  noTint();
  pop();
}

function drawSpriteContainedBottom(spriteRecord, destination) {
  if (!spriteRecord || !spriteRecord.image) return;
  const source = spriteRecord.image;
  const crop = spriteRecord.crop || { x: 0, y: 0, w: source.width, h: source.height };
  const scaleValue = min(destination.w / crop.w, destination.h / crop.h);
  const widthValue = round(crop.w * scaleValue);
  const heightValue = round(crop.h * scaleValue);
  image(
    source,
    round(destination.x + (destination.w - widthValue) / 2),
    round(destination.y + destination.h - heightValue),
    widthValue,
    heightValue,
    crop.x,
    crop.y,
    crop.w,
    crop.h
  );
}

function drawCatchResultInfo(catchData, profile, question) {
  const x = 1060;
  fill(C.yellow);
  textStyle(BOLD);
  textSize(20);
  text("YOUR QUESTION", x, 130);
  fill(C.paper);
  textStyle(NORMAL);
  textSize(24);
  text(question, x, 166, 660, 70);

  fill(C.yellow);
  textStyle(BOLD);
  textSize(22);
  text("WHAT SURFACED", x, 284);
  fill(C.paper);
  textStyle(NORMAL);
  textSize(28);
  textWrap(WORD);
  text(catchData.candidate, x, 326, 660, 300);

  drawUiCenteredText(game.judgement === "keep" ? "KEPT FOR REVIEW" : "KEEP FOR REVIEW", RESULT_BUTTONS.keep, 24, C.ink, 0);
  drawUiCenteredText(game.judgement === "release" ? "RELEASED" : "RELEASE", RESULT_BUTTONS.release, 24, C.paper, 0);
  const actionColour = game.judgement ? C.paper : C.mist;
  drawUiCenteredText("CAST AGAIN", RESULT_BUTTONS.recast, 22, actionColour, 0);
  drawUiCenteredText("CHANGE TACKLE", RESULT_BUTTONS.retackle, 22, actionColour, 0);
  drawUiCenteredText("NEW TARGET", RESULT_BUTTONS.newTarget, 22, actionColour, 0);
}

function drawCatchInfo(catchData, x, y, w, h, profile = null, question = EXAMPLE_QUESTION) {
  fill(C.paper);
  noStroke();
  rect(x, y, w, h);
  fill(C.ink);
  rect(x + 8, y + 8, w - 16, h - 16);

  fill(C.yellow);
  textStyle(BOLD);
  textSize(20);
  text("YOUR QUESTION", x + 42, y + 52);
  fill(C.paper);
  textStyle(NORMAL);
  textSize(23);
  text(question, x + 42, y + 88, w - 84, 70);

  fill(C.yellow);
  textStyle(BOLD);
  textSize(20);
  text("WHAT SURFACED", x + 42, y + 188);
  fill(C.paper);
  textStyle(NORMAL);
  textSize(25);
  textWrap(WORD);
  text(catchData.candidate, x + 42, y + 226, w - 84, 220);

  fill(C.yellow);
  textStyle(BOLD);
  textSize(20);
  text("CATCH RECORD", x + 42, y + 508);
  fill(C.paper);
  textStyle(NORMAL);
  textSize(22);
  text(`${catchData.name}  /  ${catchData.response}`, x + 42, y + 546, w - 84, 44);

  fill(C.inkSoft);
  rect(x + 42, y + h - 54, w - 84, 2);
  fill(C.mist);
  textStyle(NORMAL);
  textSize(17);
  text("SAVED FOR REVIEW, NOT VERIFIED", x + 42, y + h - 22);
}

function getSelectedTackle() {
  return TACKLE_PROFILES.find((profile) => profile.id === game.selectedTackleId) || null;
}

function getTackleSummary(profile) {
  if (!profile) return "NO CONFIGURATION RECORDED";
  return `${TACKLE_TYPES[profile.type].name}  /  ${TACKLE_COLOURS[profile.colour].name}  /  ${TACKLE_WEIGHTS[profile.weight].name}  /  ${RETRIEVES[profile.retrieve].name}`;
}

function drawMetric(label, value, x, y, widthValue) {
  fill(C.paper);
  textStyle(BOLD);
  textSize(15);
  text(label, x, y);
  const gap = 8;
  const cellWidth = floor((widthValue - gap * 4) / 5);
  for (let i = 0; i < 5; i += 1) {
    fill(i < value ? C.yellow : C.inkSoft);
    rect(x + i * (cellWidth + gap), y + 18, cellWidth, 16);
  }
  if (label === "RELEVANCE") {
    setHoverTip({ x, y: y - 6, w: widthValue, h: 54 }, "RELEVANCE", "How closely this response addresses the question.", "A close answer may still contain errors.");
  } else {
    setHoverTip({ x, y: y - 6, w: widthValue, h: 54 }, "UNCERTAINTY", "How much doubt or missing context remains.", "The meter is a prompt to inspect, not a fact score.");
  }
}

function drawUiButton(bounds, label, backgroundColour, textColour) {
  const hover = pointInRect(mouseX, mouseY, bounds);
  fill(C.paper);
  noStroke();
  rect(bounds.x, bounds.y, bounds.w, bounds.h);
  fill(hover ? C.paper : backgroundColour);
  rect(bounds.x + 6, bounds.y + 6, bounds.w - 12, bounds.h - 12);
  drawUiCenteredText(label, bounds, 20, hover ? C.ink : textColour, -5);
}

function drawBackpackButton() {
  const hover = pointInRect(mouseX, mouseY, BACKPACK_BUTTON);
  noStroke();
  if (hover) {
    fill(C.yellow);
    rect(BACKPACK_BUTTON.x, BACKPACK_BUTTON.y + BACKPACK_BUTTON.h - 3, BACKPACK_BUTTON.w, 3);
  }
  image(backpackClosed, BACKPACK_BUTTON.x + 6, BACKPACK_BUTTON.y, 74, 70);
  fill(C.yellow);
  rect(BACKPACK_BUTTON.x + 56, BACKPACK_BUTTON.y + 43, 28, 24);
  drawUiCenteredText(String(game.inventory.length), { x: BACKPACK_BUTTON.x + 56, y: BACKPACK_BUTTON.y + 43, w: 28, h: 24 }, 13, C.ink, -3);
}

function drawArchive() {
  noStroke();
  fill(7, 24, 30, 248);
  rect(0, 82, W, H - 174);

  const bag = { x: 58, y: 96, w: 900, h: 842 };
  image(backpackOpenNative || backpackOpen, bag.x, bag.y, bag.w, bag.h);

  const visibleEntries = game.inventory.slice(0, 8);
  for (let index = 0; index < visibleEntries.length; index += 1) {
    const slot = getArchiveSlotBounds(index, bag);
    const entry = visibleEntries[index];
    const catchIndex = CATCHES.findIndex((item) => item.id === entry.id);
    if (index === game.archiveSelected) {
      noFill();
      stroke(C.yellow);
      strokeWeight(6);
      rect(slot.x - 5, slot.y - 5, slot.w + 10, slot.h + 10);
      noStroke();
    }
    drawArchiveCatchSprite(archiveCatchSprites[catchIndex], {
      x: slot.x + 14,
      y: slot.y + 14,
      w: slot.w - 28,
      h: slot.h - 28
    });
  }

  if (visibleEntries.length === 0) {
    fill(C.paper);
    textAlign(CENTER, CENTER);
    textStyle(BOLD);
    textSize(28);
    text("NO CATCHES KEPT FOR REVIEW", bag.x + bag.w / 2, bag.y + bag.h / 2 + 32);
    textAlign(LEFT, BASELINE);
  }

  // The source artwork ends beneath the slide-out record panel. A solid
  // divider keeps that join intentional and prevents crop remnants showing.
  noStroke();
  fill(C.ink);
  rect(950, 120, W - 950, 820);

  const selectedEntry = visibleEntries[game.archiveSelected];
  if (selectedEntry) {
    const catchData = CATCHES.find((item) => item.id === selectedEntry.id);
    const profile = TACKLE_PROFILES.find((item) => item.id === selectedEntry.tackleId) || null;
    drawCatchInfo(catchData, 970, 144, 884, 676, profile, selectedEntry.question || EXAMPLE_QUESTION);
    fill(C.mist);
    textSize(18);
    text(`CAST ${String(selectedEntry.cast).padStart(2, "0")}  /  SAVED ${selectedEntry.savedAt}`, 1012, 858);
  } else {
    fill(C.paper);
    rect(970, 144, 884, 676);
    fill(C.ink);
    rect(978, 152, 868, 660);
    fill(C.yellow);
    textStyle(BOLD);
    textSize(30);
    text("CATCH ARCHIVE", 1016, 214);
    fill(C.mist);
    textStyle(NORMAL);
    textSize(18);
    textWrap(WORD);
    text("Keep a response after landing it, then return here to compare what surfaced across different casts.", 1016, 260, 760, 140);
  }

  drawUiButton({ x: 1654, y: 848, w: 200, h: 62 }, "CLOSE", C.riverLight, C.ink);
}

function pointInRect(x, y, bounds) {
  return x >= bounds.x && x <= bounds.x + bounds.w && y >= bounds.y && y <= bounds.y + bounds.h;
}

function getArchiveSlotAt(x, y) {
  const bag = { x: 58, y: 96, w: 900, h: 842 };
  const visibleCount = min(8, game.inventory.length);
  for (let index = 0; index < visibleCount; index += 1) {
    const slot = getArchiveSlotBounds(index, bag);
    if (pointInRect(x, y, slot)) return index;
  }
  return -1;
}

function getArchiveSlotBounds(index, bag = { x: 58, y: 96, w: 900, h: 842 }) {
  const column = index % 4;
  const row = floor(index / 4);
  const lefts = [0.113, 0.314, 0.516, 0.716];
  const tops = [0.229, 0.509];
  return {
    x: round(bag.x + lefts[column] * bag.w),
    y: round(bag.y + tops[row] * bag.h),
    w: round(0.184 * bag.w),
    h: round(0.256 * bag.h)
  };
}

function mousePressed() {
  if (game.state === "impact") return false;

  if (game.state === "question") {
    if (pointInRect(mouseX, mouseY, QUESTION_BOUNDS.input)) {
      game.questionFocused = true;
    } else if (pointInRect(mouseX, mouseY, QUESTION_BOUNDS.example)) {
      game.question = EXAMPLE_QUESTION;
      game.questionFocused = true;
      noteQuestionEdit();
    } else if (pointInRect(mouseX, mouseY, QUESTION_BOUNDS.confirm)) {
      confirmQuestion();
    } else {
      game.questionFocused = false;
    }
    return false;
  }

  if (game.state === "tackle") {
    if (pointInRect(mouseX, mouseY, TACKLE_BOUNDS.refresh)) {
      refreshRecommendations();
      return false;
    }
    for (let index = 0; index < TACKLE_BOUNDS.cards.length; index += 1) {
      if (pointInRect(mouseX, mouseY, TACKLE_BOUNDS.cards[index])) {
        game.selectedRecommendation = index;
        game.tackleSelectAt = millis();
        return false;
      }
    }
    if (pointInRect(mouseX, mouseY, TACKLE_BOUNDS.back)) {
      setState("question");
      game.questionFocused = true;
    } else if (pointInRect(mouseX, mouseY, TACKLE_BOUNDS.confirm)) {
      beginFishingWithTackle();
    }
    return false;
  }

  if (game.state === "result") {
    if (pointInRect(mouseX, mouseY, RESULT_BUTTONS.keep)) {
      setCatchJudgement("keep");
    } else if (pointInRect(mouseX, mouseY, RESULT_BUTTONS.release)) {
      setCatchJudgement("release");
    } else if (game.judgement && pointInRect(mouseX, mouseY, RESULT_BUTTONS.recast)) {
      resetCast();
    } else if (game.judgement && pointInRect(mouseX, mouseY, RESULT_BUTTONS.retackle)) {
      game.selectedRecommendation = -1;
      refreshRecommendations();
      setState("tackle");
    } else if (game.judgement && pointInRect(mouseX, mouseY, RESULT_BUTTONS.newTarget)) {
      startNewTarget();
    }
    return false;
  }

  if (game.state === "archive") {
    const slotIndex = getArchiveSlotAt(mouseX, mouseY);
    if (slotIndex >= 0) game.archiveSelected = slotIndex;
    if (pointInRect(mouseX, mouseY, { x: 1654, y: 848, w: 200, h: 62 })) closeArchive();
    return false;
  }

  if (pointInRect(mouseX, mouseY, BACKPACK_BUTTON)) {
    openArchive();
    return false;
  }

  if (game.state === "ready" && mouseY > 470 && mouseY < 830 && mouseX > 760) {
    game.charge = 0;
    setState("charging");
    return false;
  }

  if (game.state === "bite") {
    hookFish();
    return false;
  }

  if (game.state === "failed") {
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
  if (game.state === "question") {
    if (keyCode === BACKSPACE || keyCode === DELETE) {
      game.question = game.question.slice(0, -1);
      noteQuestionEdit();
      return false;
    }
    if (keyCode === ENTER || keyCode === RETURN) {
      confirmQuestion();
      return false;
    }
    if (keyCode === ESCAPE) game.questionFocused = false;
    return true;
  }
  if (game.state === "tackle" && keyCode === ESCAPE) {
    setState("question");
    game.questionFocused = true;
    return false;
  }
  if (game.state === "archive" && keyCode === ESCAPE) closeArchive();
  else if (key === "r" || key === "R" || keyCode === ESCAPE) resetCast();
}

function keyTyped() {
  if (game.state !== "question" || !game.questionFocused) return true;
  if (key.length === 1 && key.charCodeAt(0) >= 32 && game.question.length < 140) {
    game.question += key;
    noteQuestionEdit();
    return false;
  }
  return true;
}

function confirmQuestion() {
  game.question = game.question.trim();
  if (!game.question || game.targetLockAt > 0) return;
  game.questionFocused = false;
  game.targetLockAt = millis();
}

function refreshRecommendations() {
  const next = [];
  while (next.length < 3) {
    if (game.recommendationDeck.length === 0) {
      game.recommendationDeck = shuffle(TACKLE_PROFILES.map((_, index) => index), true);
    }
    next.push(game.recommendationDeck.shift());
  }
  game.recommendations = next;
  game.selectedRecommendation = -1;
}

function beginFishingWithTackle() {
  if (game.selectedRecommendation < 0) return;
  const profileIndex = game.recommendations[game.selectedRecommendation];
  const profile = TACKLE_PROFILES[profileIndex];
  game.selectedTackleId = profile.id;
  prepareCast(false);
}

function startNewTarget() {
  game.question = "";
  game.questionFocused = true;
  game.targetShadowIndex = 0;
  game.lastQuestionEditAt = 0;
  game.selectedTackleId = null;
  game.selectedRecommendation = -1;
  game.recommendationDeck = [];
  game.currentCatch = null;
  game.judgement = null;
  game.currentKept = false;
  game.targetLockAt = 0;
  game.saveStampAt = 0;
  setState("question");
}

function castLine() {
  game.castPower = constrain(game.charge, 0.16, 1);
  const distance = map(game.castPower, 0.16, 1, 120, 340);
  game.castTarget.y = constrain(790 - distance * 0.42, 545, 745);
  const aimX = constrain(mouseX, 850, 1650);
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

function landRandomCatch() {
  const index = floor(random(CATCHES.length));
  game.currentCatch = CATCHES[index];
  game.result = game.currentCatch.id;
  game.shake = 6;
  game.flash = 0.72;
  game.judgement = null;
  game.currentKept = false;
  setState("impact");
}

function keepCurrentCatch() {
  if (!game.currentCatch) return;
  const now = new Date();
  game.inventory.unshift({
    id: game.currentCatch.id,
    cast: game.runNumber,
    question: game.question,
    tackleId: game.selectedTackleId,
    savedAt: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  });
  if (game.inventory.length > 8) game.inventory.length = 8;
  game.archiveSelected = 0;
}

function setCatchJudgement(nextJudgement) {
  if (!game.currentCatch) return;
  if (nextJudgement === "keep" && !game.currentKept) {
    keepCurrentCatch();
    game.currentKept = true;
    game.saveStampAt = millis();
  }
  if (nextJudgement === "release" && game.currentKept) {
    const savedIndex = game.inventory.findIndex((entry) => entry.cast === game.runNumber);
    if (savedIndex >= 0) game.inventory.splice(savedIndex, 1);
    game.currentKept = false;
    game.saveStampAt = 0;
  }
  game.judgement = nextJudgement;
}

function openArchive() {
  game.archiveReturnState = game.state === "failed" ? "failed" : "ready";
  game.archiveSelected = game.inventory.length > 0 ? 0 : -1;
  setState("archive");
}

function closeArchive() {
  setState(game.archiveReturnState || "ready");
}

function finishRun(result) {
  game.result = result;
  game.shake = result === "fish" ? 6 : 3;
  game.flash = result === "fish" ? 0.7 : 0.22;
  setState("failed");
}

function prepareCast(incrementRun = true) {
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
  game.currentCatch = null;
  game.judgement = null;
  game.currentKept = false;
  game.ripples = [];
  game.splashes = [];
  game.lure.x = 520;
  game.lure.y = 610;
  game.observation.x = 1040;
  game.observation.y = 650;
  if (incrementRun) game.runNumber += 1;
  updateAccessibleStatus();
}

function resetCast() {
  prepareCast(true);
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
    question: "Enter the question that will become your target.",
    tackle: "Choose one of three prompting configurations.",
    ready: "Ready to cast.",
    charging: "Charging the cast.",
    flying: "The lure is in flight.",
    waiting: "The lure is in the river. Hold the mouse to retrieve.",
    bite: "A fish is biting. Click now to set the hook.",
    hooked: "Fish hooked. Hold and release the mouse to control line tension.",
    impact: "A catch has surfaced.",
    result: "Inspect the response and decide whether to keep it for review.",
    archive: "Review the catches saved during this session.",
    failed: "The catch was lost. Click to cast again."
  };

  status.textContent = messages[game.state];
}

function addRipple(x, y, colour, size) {
  game.ripples.push({ x, y, colour, size, life: 0 });
}

function addSplash(x, y, amount) {
  game.splashes.push({ x, y, life: 0, speed: amount > 10 ? 1.45 : 1.8 });
}

function updateEffects(dt) {
  for (const ripple of game.ripples) ripple.life += dt * 1.35;
  game.ripples = game.ripples.filter((ripple) => ripple.life < 1);

  for (const splash of game.splashes) splash.life += dt * splash.speed;
  game.splashes = game.splashes.filter((splash) => splash.life < 1);
}
