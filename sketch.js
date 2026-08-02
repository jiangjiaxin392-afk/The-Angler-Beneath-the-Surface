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

const WEATHER_CONDITIONS = [
  {
    id: "sunny",
    title: "CLEAR",
    status: "CONDITIONS STABLE",
    note: "SERVICES AND TOOLS ARE RESPONDING NORMALLY",
    accent: "#F0C64F",
    sky: "#2B7891"
  },
  {
    id: "cloudy",
    title: "OVERCAST",
    status: "SOURCES LIMITED",
    note: "SOME CURRENT INFORMATION MAY BE UNAVAILABLE",
    accent: "#D8D0B7",
    sky: "#526A71"
  },
  {
    id: "fog",
    title: "FOG",
    status: "LOW VISIBILITY",
    note: "THE BASIS OF THE RESPONSE MAY BE HARD TO TRACE",
    accent: "#B9D3CC",
    sky: "#506E6C"
  },
  {
    id: "rain",
    title: "RAIN",
    status: "RESPONSE DELAYED",
    note: "NETWORK OR SERVER LOAD MAY SLOW THE RESULT",
    accent: "#63C3D5",
    sky: "#244D66"
  },
  {
    id: "storm",
    title: "STORM",
    status: "SERVICE UNSTABLE",
    note: "AN EXTERNAL SERVICE OR TOOL MAY FAIL",
    accent: "#E85D72",
    sky: "#302D50"
  }
];

const TV_CAMERA = {
  focus: { x: 922, y: 358 },
  screen: { x: 775, y: 270, w: 242, h: 176 },
  finalScale: 4.45,
  zoomDuration: 3600,
  crossfadeStart: 0.64
};

const TV_FULLSCREEN = {
  screen: { x: 304, y: 147, w: 1064, h: 763 },
  screenRadius: 118,
  frameDuration: 250
};

const WATER_MAP_SIZE = { w: 1480, h: 1062 };

const WATER_LOCATIONS = [
  {
    id: "daylight-river",
    name: "DAYLIGHT RIVER",
    model: "GENERAL MODEL",
    note: "BEST FOR: EVERYDAY QUESTIONS, IDEAS, SIMPLE EXPLANATIONS",
    hit: { x: 55, y: 70, w: 550, h: 445 },
    art: { x: 170, y: 105, w: 340, h: 310 },
    label: { x: 76, y: 390, w: 500, h: 112 }
  },
  {
    id: "signal-canal",
    name: "SIGNAL CANAL",
    model: "WEB SEARCH MODEL",
    note: "BEST FOR: CURRENT FACTS, TRAVEL, NEWS, RECOMMENDATIONS",
    hit: { x: 875, y: 70, w: 550, h: 445 },
    art: { x: 985, y: 105, w: 345, h: 310 },
    label: { x: 900, y: 390, w: 500, h: 112 }
  },
  {
    id: "sunken-reservoir",
    name: "SUNKEN RESERVOIR",
    model: "REASONING MODEL",
    note: "BEST FOR: COMPARISONS, PLANNING, MULTI-STEP PROBLEMS",
    hit: { x: 430, y: 535, w: 640, h: 440 },
    art: { x: 585, y: 565, w: 350, h: 300 },
    label: { x: 475, y: 845, w: 530, h: 112 }
  }
];

const WATER_SELECT_BOUNDS = {
  confirm: { x: 1115, y: 950, w: 320, h: 82 },
  back: { x: 45, y: 960, w: 176, h: 62 }
};

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
  keep: { x: 1015, y: 680, w: 370, h: 156 },
  release: { x: 1400, y: 680, w: 370, h: 156 },
  recast: { x: 90, y: 858, w: 420, h: 132 },
  retackle: { x: 530, y: 858, w: 420, h: 132 },
  newTarget: { x: 970, y: 858, w: 420, h: 132 },
  changeLocation: { x: 1410, y: 858, w: 420, h: 132 }
};

const UI_ART = { x: 124, y: 70, w: 1672, h: 941 };
const RESULT_SCENE_FRAME_BOUNDS = { x: 15, y: 30, w: 980, h: 815 };
// Keep a controlled bleed beneath the fish-bone rails without letting the
// scene escape past the open top, right, or lower edges of the frame. The
// wider left bleed remains intentional because the spine is irregular there.
const RESULT_SCENE_BOUNDS = { x: 105, y: 120, w: 865, h: 635 };
// Keep the complete hands/catch artwork inside the visible bone-frame opening.
// The location background has its own larger bleed bounds below, so reducing this
// content layer does not bring back the seam along the left side of the frame.
const RESULT_CATCH_BOUNDS = { x: 135, y: 132, w: 815, h: 630 };
const RESULT_PANELS = {
  question: { x: 1010, y: 70, w: 760, h: 153 },
  answer: { x: 1010, y: 246, w: 760, h: 409 }
};

const ARCHIVE_COLLECTION_BOUNDS = { x: 50, y: 100, w: 940, h: 820 };
const ARCHIVE_PANELS = {
  question: { x: 1020, y: 100, w: 820, h: 156 },
  answer: { x: 1020, y: 270, w: 820, h: 404 },
  record: { x: 1005, y: 682, w: 850, h: 218 },
  close: { x: 1568, y: 895, w: 272, h: 92 }
};
const ARCHIVE_SLOT_LAYOUT = { x: 80, y: 137, stepX: 196, stepY: 297, w: 188, h: 286 };

const QUESTION_BOUNDS = {
  input: { x: 792, y: 220, w: 932, h: 400 },
  example: { x: 1580, y: 646, w: 150, h: 142 },
  confirm: { x: 780, y: 816, w: 950, h: 126 }
};

const LIVING_QUESTION_BOUNDS = {
  title: { x: 548, y: 350, w: 610, h: 58 },
  input: { x: 548, y: 424, w: 610, h: 154 },
  example: { x: 548, y: 600, w: 610, h: 48 },
  fish: { x: 1270, y: 345, w: 300, h: 260 },
  confirm: { x: 1260, y: 686, w: 330, h: 82 }
};

const TACKLE_BOUNDS = {
  cards: [
    { x: 252, y: 302, w: 462, h: 492 },
    { x: 742, y: 302, w: 430, h: 492 },
    { x: 1200, y: 302, w: 460, h: 492 }
  ],
  refresh: { x: 1512, y: 108, w: 164, h: 132 },
  confirm: { x: 520, y: 824, w: 830, h: 140 },
  back: { x: 238, y: 824, w: 164, h: 140 }
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
  state: "introDrink",
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
  saveStampAt: 0,
  weatherIndex: -1,
  waterIndex: -1,
  waterSelectAt: 0,
  waterSelectOrigin: null,
  skipHoldStartedAt: 0,
  skipConsumed: false
};

let lastFrameTime = 0;
let previewImpactTime = null;
let previewAnglerState = null;
const locationBackgrounds = {};
const locationSceneFrames = {};
const anglerFrames = [];
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
let tackleScreenV2Overlay;
const tackleCardHoverFrames = [];
const tackleCardSelectedFrames = [];
const tackleColourIcons = [];
const tackleWeightIcons = [];
const tackleRetrieveIcons = [];
const tackleButtonIcons = { back: {}, refresh: {} };
let tackleSelectedMarker;
let resultScreenFrame;
let resultSceneFrameV3;
let resultQuestionPanelV3;
let resultAnswerPanelV3;
const resultDecisionFramesV3 = { keep: {}, release: {} };
const resultActionFramesV3 = { recast: {}, retackle: {}, target: {}, location: {} };
const resultActionIconsV3 = {};
let archiveCollectionPanelV2;
let archiveQuestionPanelV2;
let archiveAnswerPanelV2;
let archiveRecordPanelV2;
const archiveSlotFramesV2 = {};
const archiveCloseFramesV2 = {};
let interactionAssetSheet;
let archiveCatchSheet;
let targetLockSheet;
let tackleSelectSheet;
let fishingEffectsSheet;
let catchRevealSheet;
let saveComicSheet;
let hookedAnglerLayer;
let hookedFishLayer;
let hookedLineLayer;
let catchResultsNativeSheet;
let archiveCatchesNativeSheet;
let targetShadowsNativeSheet;
let backpackOpenNativeSource;
let backpackOpenNative;
let uiFont;
const catchImages = [];
const archiveCatchSprites = [];
const catchResultSprites = [];
const sceneCloudFrames = [];
const sceneFoliageFrames = [];
const sceneWaterFrames = [];
const sceneAmbientFrames = [];
const castComicFrames = [];
const biteComicFrames = [];
const tensionComicFrames = [];
const catchRevealFrames = [];
const hookedWaterFrames = [];
const hookedSlashFrames = [];
const hookedDropletFrames = [];
const saveStampFrames = [];
const comicOrnaments = [];
const tackleSelectFrames = [];
const targetShadowFrames = [];
const targetLockFrames = [];
let livingRoomBase;
let livingRoomLegs;
let livingThoughtUi;
let weatherTvFrameHd;
let waterMapBase;
const waterLocationImages = [];
const weatherFrameImages = {};
const weatherFrameLoadState = {};
const WEATHER_SCENE_FRAME_COUNT = 8;
const LOCATION_SCENE_FRAME_COUNT = 16;
const LOCATION_SCENE_REVISION = "20260801-separated-v15";
const WEATHER_SCENE_REVISION = "20260731-modular-weather";
const weatherSceneFrames = {};
const weatherSceneLoadState = {};
const weatherModuleFrames = {
  rainLight: [],
  rainHeavy: [],
  impactLight: [],
  impactHeavy: [],
  lightningA: [],
  lightningB: []
};
const weatherFx = {
  condition: "",
  impacts: [],
  nextLightningAt: 0,
  lightningStartedAt: -1,
  lightningVariant: 0
};
const livingBeerFrames = [];
const livingIdeaFrames = [];
const livingRemoteFrames = [];
const livingTvFrames = [];
const livingTargetFish = [];
let toolboxRoomBackground;
const toolboxFrames = [];
const toolboxRightHandFrames = [];
const toolboxLeftHandFrames = [];
const TOOLBOX_INTRO_DURATION = 8200;
const TOOLBOX_BOX_START = 2800;
const TOOLBOX_RIGHT_START = 750;
const TOOLBOX_LEFT_START = 1000;
const TOOLBOX_FRAME_DURATIONS = [
  500, 300, 260, 240, 220, 220, 220, 220, 220, 240, 260, 300, 380, 780
];
const TOOLBOX_RIGHT_DURATIONS = [
  420, 360, 320, 300, 360, 420, 480, 300, 300, 300, 320, 360, 420, 460, 520, 650
];
const TOOLBOX_LEFT_DURATIONS = [
  450, 380, 340, 340, 480, 620, 620, 620, 500, 460, 520, 650
];
const TOOLBOX_LEFT_X = [90, 130, 190, 250, 200, 150, 100, 100, 120, 160, 120, 90];
const TOOLBOX_LEFT_Y = [300, 270, 240, 220, 250, 280, 300, 300, 280, 260, 280, 300];
const TOOLBOX_RIGHT_X = [0, 0, 70, 140, 210, 190, 170, 150, 130, 120, 100, 110, 120, 120, 120, 80];
const TOOLBOX_RIGHT_Y = [300, 280, 220, 150, 95, 110, 120, 130, 130, 120, 100, 80, 80, 100, 160, 260];
const TOOLBOX_ASSET_REVISION = "20260731-v3-hands";
const TACKLE_UI_REVISION = "20260801-punk-v3-layout";
const RESULT_UI_REVISION = "20260801-catch-bone-v4-layout";
const ARCHIVE_UI_REVISION = "20260801-catch-archive-v4";
const HOOKED_TRANSITION_REVISION = "20260801-layered-v7";
const HOOKED_ANGLER_REVISION = "20260802-fullbody-v3";
const ANGLER_GAMEPLAY_REVISION = "20260802-combined-v2-shoes";
const HOOKED_TRANSITION_DURATION = 3250;
const CUTSCENE_SKIP_HOLD = 800;
const CUTSCENE_GROUPS = {
  introDrink: "livingQuestion",
  introIdea: "livingQuestion",
  introRemote: "weather",
  introTv: "weather",
  toolboxIntro: "tackle",
  impact: "result"
};

const ANGLER = {
  x: 227,
  y: 472,
  width: 390,
  height: 436
};

const ANGLER_FRAME_FILES = [
  "frame-00-ready.png",
  "frame-01-failed.png",
  "frame-02-charging-v2.png",
  "frame-03-cast.png",
  "frame-04-bite-v2.png",
  "frame-05-hooked.png"
];

const ANGLER_COMBINED_ART = [
  { width: 1536, height: 1024, x: 248, y: 536, scale: 0.407, tip: { x: 1508, y: 131 } },
  { width: 1672, height: 941, x: 175, y: 518, scale: 0.452, tip: { x: 1635, y: 373 } },
  { width: 1536, height: 1024, x: 223, y: 487, scale: 0.418, tip: { x: 1502, y: 161 } },
  { width: 1635, height: 962, x: 261, y: 489, scale: 0.488, tip: { x: 1613, y: 94 } },
  { width: 1536, height: 1024, x: 217, y: 516, scale: 0.388, tip: { x: 1462, y: 132 } },
  { width: 1536, height: 1024, x: 237, y: 500, scale: 0.408, tip: { x: 1495, y: 207 } }
];

const SHARED_WATER_STOPS = [
  { x: 360, y: 430 },
  { x: 500, y: 520 },
  { x: 680, y: 650 },
  { x: 850, y: 800 },
  { x: 1040, y: 965 }
];

const SHARED_WATER_POLYGON = [
  { x: 360, y: 430 },
  { x: 500, y: 520 },
  { x: 680, y: 650 },
  { x: 850, y: 800 },
  { x: 1040, y: 965 },
  { x: W, y: 965 },
  { x: W, y: 430 }
];

const LOCATION_PROFILES = {
  "daylight-river": {
    id: "daylight-river",
    backgroundPath: "public/images/river-background-native.png",
    sceneType: "river",
    angler: { ...ANGLER },
    rodTip: { x: 825, y: 470 },
    waterStops: SHARED_WATER_STOPS,
    waterPolygon: SHARED_WATER_POLYGON,
    fishBounds: { minY: 585, maxY: 875 },
    resultView: { x: 0, y: 0, w: 1230, h: 1080 }
  },
  "signal-canal": {
    id: "signal-canal",
    backgroundPath: "public/images/location-backgrounds/signal-canal/background.png",
    sceneType: "modular",
    angler: { ...ANGLER },
    rodTip: { x: 825, y: 470 },
    waterStops: [
      { x: 375, y: 565 },
      { x: 520, y: 620 },
      { x: 650, y: 690 },
      { x: 780, y: 765 },
      { x: 910, y: 865 },
      { x: 1040, y: 965 }
    ],
    waterPolygon: [
      { x: 375, y: 565 }, { x: 520, y: 620 }, { x: 650, y: 690 },
      { x: 780, y: 765 }, { x: 910, y: 865 }, { x: 1040, y: 965 },
      { x: W, y: 965 }, { x: W, y: 565 }
    ],
    fishBounds: { minY: 665, maxY: 875 },
    resultView: { x: 0, y: 0, w: 1230, h: 1080 }
  },
  "sunken-reservoir": {
    id: "sunken-reservoir",
    backgroundPath: "public/images/location-backgrounds/sunken-reservoir/background.png",
    sceneType: "modular",
    angler: { ...ANGLER },
    rodTip: { x: 825, y: 470 },
    waterStops: [
      { x: 385, y: 480 },
      { x: 525, y: 535 },
      { x: 665, y: 610 },
      { x: 785, y: 700 },
      { x: 875, y: 800 },
      { x: 980, y: 965 }
    ],
    waterPolygon: [
      { x: 385, y: 480 }, { x: 525, y: 535 }, { x: 665, y: 610 },
      { x: 785, y: 700 }, { x: 875, y: 800 }, { x: 980, y: 965 },
      { x: W, y: 965 }, { x: W, y: 480 }
    ],
    fishBounds: { minY: 590, maxY: 875 },
    resultView: { x: 0, y: 0, w: 1230, h: 1080 }
  }
};

const ANGLER_POSES = {
  ready: { frame: 0 },
  charging: { frame: 2 },
  flying: { frame: 3 },
  waiting: { frame: 0 },
  bite: { frame: 4 },
  hooked: { frame: 5 },
  impact: { frame: 0 },
  result: { frame: 0 },
  archive: { frame: 0 },
  caught: { frame: 0 },
  failed: { frame: 1 }
};

function preload() {
  uiFont = loadFont("public/fonts/RetroSans.ttf");
  for (const profile of Object.values(LOCATION_PROFILES)) {
    locationBackgrounds[profile.id] = loadImage(profile.backgroundPath);
    if (profile.sceneType !== "modular") continue;
    const animationRoot = `public/images/location-backgrounds/${profile.id}/animations`;
    locationSceneFrames[profile.id] = { water: [], site: [], runoff: [], stormCloud: [] };
    const locationSequences = [
      { key: "water", folder: "water" },
      {
        key: "site",
        folder: profile.id === "signal-canal" ? "site-opaque-hook-v2" : "site"
      },
      { key: "runoff", folder: "runoff" },
      { key: "stormCloud", folder: "storm-cloud" }
    ];
    for (const { key, folder } of locationSequences) {
      for (let i = 0; i < LOCATION_SCENE_FRAME_COUNT; i += 1) {
        const frameName = String(i).padStart(2, "0");
        locationSceneFrames[profile.id][key].push(
          loadImage(`${animationRoot}/${folder}/frame-${frameName}.png?v=${LOCATION_SCENE_REVISION}`)
        );
      }
    }
  }
  for (const frameFile of ANGLER_FRAME_FILES) {
    anglerFrames.push(
      loadImage(`public/images/angler-redraw-v1/combined-v1/frames-alpha/${frameFile}?v=${ANGLER_GAMEPLAY_REVISION}`)
    );
  }
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
  tackleScreenV2Overlay = loadImage(
    `public/images/tackle-ui-v2/tackle-ui-overlay-v1-alpha.png?v=${TACKLE_UI_REVISION}`
  );
  const tackleComponentRoot = "public/images/tackle-ui-v2/components/final";
  for (const slotName of ["left", "middle", "right"]) {
    tackleCardHoverFrames.push(
      loadImage(`${tackleComponentRoot}/card-${slotName}-hover.png?v=${TACKLE_UI_REVISION}`)
    );
    tackleCardSelectedFrames.push(
      loadImage(`${tackleComponentRoot}/card-${slotName}-selected.png?v=${TACKLE_UI_REVISION}`)
    );
  }
  for (const colourName of ["neutral", "friendly", "formal", "critical"]) {
    tackleColourIcons.push(
      loadImage(`${tackleComponentRoot}/colour-${colourName}.png?v=${TACKLE_UI_REVISION}`)
    );
  }
  for (const weightName of ["light", "medium", "heavy"]) {
    tackleWeightIcons.push(
      loadImage(`${tackleComponentRoot}/weight-${weightName}.png?v=${TACKLE_UI_REVISION}`)
    );
  }
  for (const retrieveName of ["straight", "stop-and-go", "review", "step-by-step"]) {
    tackleRetrieveIcons.push(
      loadImage(`${tackleComponentRoot}/retrieve-${retrieveName}.png?v=${TACKLE_UI_REVISION}`)
    );
  }
  for (const buttonName of ["back", "refresh"]) {
    for (const stateName of ["default", "hover", "pressed"]) {
      tackleButtonIcons[buttonName][stateName] = loadImage(
        `${tackleComponentRoot}/${buttonName}-${stateName}.png?v=${TACKLE_UI_REVISION}`
      );
    }
  }
  tackleSelectedMarker = loadImage(
    `${tackleComponentRoot}/selected-marker.png?v=${TACKLE_UI_REVISION}`
  );
  const resultUiRoot = "public/images/result-ui-v3";
  resultSceneFrameV3 = loadImage(
    `${resultUiRoot}/components/scene-frame.png?v=${RESULT_UI_REVISION}`
  );
  resultQuestionPanelV3 = loadImage(
    `${resultUiRoot}/components/question-panel.png?v=${RESULT_UI_REVISION}`
  );
  resultAnswerPanelV3 = loadImage(
    `${resultUiRoot}/components/answer-panel.png?v=${RESULT_UI_REVISION}`
  );
  for (const decisionName of ["keep", "release"]) {
    for (const stateName of ["default", "hover", "selected"]) {
      resultDecisionFramesV3[decisionName][stateName] = loadImage(
        `${resultUiRoot}/components/decision-${decisionName}-${stateName}.png?v=${RESULT_UI_REVISION}`
      );
    }
  }
  for (const actionName of ["recast", "retackle", "target", "location"]) {
    for (const stateName of ["default", "hover", "disabled"]) {
      resultActionFramesV3[actionName][stateName] = loadImage(
        `${resultUiRoot}/components/action-${actionName}-${stateName}.png?v=${RESULT_UI_REVISION}`
      );
    }
  }
  for (const iconName of ["recast", "retackle", "target", "location"]) {
    resultActionIconsV3[iconName] = {
      default: loadImage(`${resultUiRoot}/icons/${iconName}.png?v=${RESULT_UI_REVISION}`),
      disabled: loadImage(`${resultUiRoot}/icons/${iconName}-disabled.png?v=${RESULT_UI_REVISION}`)
    };
  }
  const archiveUiRoot = "public/images/archive-ui-v2/components";
  archiveCollectionPanelV2 = loadImage(`${archiveUiRoot}/collection-panel.png?v=${ARCHIVE_UI_REVISION}`);
  archiveQuestionPanelV2 = loadImage(`${archiveUiRoot}/question-panel.png?v=${ARCHIVE_UI_REVISION}`);
  archiveAnswerPanelV2 = loadImage(`${archiveUiRoot}/answer-panel-v2.png?v=${ARCHIVE_UI_REVISION}`);
  archiveRecordPanelV2 = loadImage(`${archiveUiRoot}/record-panel-v2.png?v=${ARCHIVE_UI_REVISION}`);
  archiveSlotFramesV2.hover = loadImage(`${archiveUiRoot}/slot-hover.png?v=${ARCHIVE_UI_REVISION}`);
  archiveSlotFramesV2.selected = loadImage(`${archiveUiRoot}/slot-selected.png?v=${ARCHIVE_UI_REVISION}`);
  archiveCloseFramesV2.default = loadImage(`${archiveUiRoot}/close-default.png?v=${ARCHIVE_UI_REVISION}`);
  archiveCloseFramesV2.hover = loadImage(`${archiveUiRoot}/close-hover.png?v=${ARCHIVE_UI_REVISION}`);
  interactionAssetSheet = loadImage("public/images/interaction-assets.png");
  archiveCatchSheet = loadImage("public/images/comic/archive-catches-sheet.png");
  targetLockSheet = loadImage("public/images/comic/target-lock-sheet.png");
  tackleSelectSheet = loadImage("public/images/comic/tackle-select-sheet.png");
  fishingEffectsSheet = loadImage("public/images/comic/fishing-effects-sheet.png");
  catchRevealSheet = loadImage("public/images/comic/catch-reveal-sheet.png");
  saveComicSheet = loadImage("public/images/comic/save-comic-sheet.png");
  const hookedTransitionRoot = "public/images/result-effects-v2/hooked-transition-v2";
  const hookedAnglerRoot = "public/images/result-effects-v2/hooked-transition-v4";
  hookedAnglerLayer = loadImage(
    `${hookedAnglerRoot}/layers/angler-pull-fullbody.png?v=${HOOKED_ANGLER_REVISION}`
  );
  hookedFishLayer = loadImage(
    `${hookedTransitionRoot}/layers/fish.png?v=${HOOKED_TRANSITION_REVISION}`
  );
  hookedLineLayer = loadImage(
    `${hookedTransitionRoot}/layers/line.png?v=${HOOKED_TRANSITION_REVISION}`
  );
  for (let i = 0; i < 6; i += 1) {
    const frameName = String(i).padStart(2, "0");
    hookedWaterFrames.push(
      loadImage(`${hookedTransitionRoot}/water/frame-${frameName}.png?v=${HOOKED_TRANSITION_REVISION}`)
    );
  }
  for (let i = 0; i < 4; i += 1) {
    const frameName = String(i).padStart(2, "0");
    hookedSlashFrames.push(
      loadImage(`${hookedTransitionRoot}/slash/frame-${frameName}.png?v=${HOOKED_TRANSITION_REVISION}`)
    );
  }
  for (let i = 0; i < 8; i += 1) {
    const frameName = String(i).padStart(2, "0");
    hookedDropletFrames.push(
      loadImage(`${hookedTransitionRoot}/droplets/frame-${frameName}.png?v=${HOOKED_TRANSITION_REVISION}`)
    );
  }
  catchResultsNativeSheet = loadImage("public/images/catch-results-native-source.png");
  archiveCatchesNativeSheet = loadImage("public/images/archive-catches-native-source.png");
  targetShadowsNativeSheet = loadImage("public/images/target-shadows-native-source.png");
  backpackOpenNativeSource = loadImage("public/images/backpack-open-native-source.png");
  const livingRoot = "public/images/living-room-sequence";
  livingRoomBase = loadImage(`${livingRoot}/01-room-base.png`);
  livingRoomLegs = loadImage(`${livingRoot}/02-legs-full.png`);
  livingThoughtUi = loadImage(`${livingRoot}/07-thought-ui.png`);
  weatherTvFrameHd = loadImage("public/images/weather/tv-frame-hd.png");
  const waterSelectRoot = "public/images/water-select";
  waterMapBase = loadImage(`${waterSelectRoot}/map-tv-4x3.png`);
  for (const location of WATER_LOCATIONS) {
    waterLocationImages.push(loadImage(`${waterSelectRoot}/water-${location.id}.png`));
  }
  const weatherModuleRoot = "public/images/weather-modules";
  for (let i = 0; i < 12; i += 1) {
    const frameName = String(i).padStart(2, "0");
    weatherModuleFrames.rainLight.push(loadImage(`${weatherModuleRoot}/rain-light/frame-${frameName}.png`));
    weatherModuleFrames.rainHeavy.push(loadImage(`${weatherModuleRoot}/rain-heavy/frame-${frameName}.png`));
  }
  for (let i = 0; i < 16; i += 1) {
    const frameName = String(i).padStart(2, "0");
    weatherModuleFrames.impactLight.push(loadImage(`${weatherModuleRoot}/impact-light/frame-${frameName}.png`));
    weatherModuleFrames.impactHeavy.push(loadImage(`${weatherModuleRoot}/impact-heavy/frame-${frameName}.png`));
  }
  for (let i = 0; i < 8; i += 1) {
    const frameName = String(i).padStart(2, "0");
    weatherModuleFrames.lightningA.push(loadImage(`${weatherModuleRoot}/lightning-a/frame-${frameName}.png`));
    weatherModuleFrames.lightningB.push(loadImage(`${weatherModuleRoot}/lightning-b/frame-${frameName}.png`));
  }
  for (let i = 1; i <= 20; i += 1) {
    const frameName = String(i).padStart(2, "0");
    livingBeerFrames.push(loadImage(`${livingRoot}/beer-clean-20-frames/frame-${frameName}.png`));
    livingRemoteFrames.push(loadImage(`${livingRoot}/remote-20-frames/frame-${frameName}.png`));
  }
  for (let i = 1; i <= 8; i += 1) {
    const frameName = String(i).padStart(2, "0");
    livingIdeaFrames.push(loadImage(`${livingRoot}/idea-frames/frame-${frameName}.png`));
    livingTvFrames.push(loadImage(`${livingRoot}/tv-frames/frame-${frameName}.png`));
  }
  ["01-perch", "02-trout", "03-pike", "04-carp", "05-bass"].forEach((name) => {
    livingTargetFish.push(loadImage(`${livingRoot}/target-fish/${name}.png`));
  });
  const toolboxRoot = "public/images/toolbox-sequence";
  const toolboxV2Root = `${toolboxRoot}/v2`;
  const toolboxV3Root = `${toolboxRoot}/v3`;
  toolboxRoomBackground = loadImage(`${toolboxRoot}/01-workroom-background.png?v=${TOOLBOX_ASSET_REVISION}`);
  for (let i = 1; i <= 14; i += 1) {
    const frameName = String(i).padStart(2, "0");
    toolboxFrames.push(loadImage(`${toolboxV2Root}/toolbox-frames/frame-${frameName}.png?v=${TOOLBOX_ASSET_REVISION}`));
  }
  for (let i = 1; i <= 16; i += 1) {
    const frameName = String(i).padStart(2, "0");
    toolboxRightHandFrames.push(loadImage(`${toolboxV3Root}/right-hand-frames/frame-${frameName}.png?v=${TOOLBOX_ASSET_REVISION}`));
  }
  for (let i = 1; i <= 12; i += 1) {
    const frameName = String(i).padStart(2, "0");
    toolboxLeftHandFrames.push(loadImage(`${toolboxV3Root}/left-hand-frames/frame-${frameName}.png?v=${TOOLBOX_ASSET_REVISION}`));
  }
  for (const catchDefinition of CATCHES) {
    catchImages.push(loadImage(`public/images/catch-${catchDefinition.id}-transparent.png`));
  }
  for (let i = 0; i < 8; i += 1) {
    sceneCloudFrames.push(loadImage(`public/images/scene-cloud-frame-${i}.png`));
    sceneFoliageFrames.push(loadImage(`public/images/scene-foliage-frame-${i}.png`));
    sceneWaterFrames.push(loadImage(`public/images/scene-water-frame-${i}.png`));
    sceneAmbientFrames.push(loadImage(`public/images/scene-ambient-frame-${i}.png`));
  }
}

function setup() {
  const canvas = createCanvas(W, H);
  canvas.parent("canvasWrap");
  document.getElementById("startupLoader")?.remove();
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
  if (preview === "angler") {
    const requestedLocation = parameters.get("location") || "daylight-river";
    const requestedWeather = parameters.get("weather") || "sunny";
    const requestedPose = parameters.get("pose") || "ready";
    game.waterIndex = max(0, WATER_LOCATIONS.findIndex((location) => location.id === requestedLocation));
    game.weatherIndex = max(0, WEATHER_CONDITIONS.findIndex((weather) => weather.id === requestedWeather));
    previewAnglerState = Object.prototype.hasOwnProperty.call(ANGLER_POSES, requestedPose) ? requestedPose : "ready";
    game.state = previewAnglerState;
    game.stateStarted = millis();
    game.lure = { x: 1030, y: 690 };
    game.tension = 0.5;
  } else if (preview === "question") {
    game.question = "";
    game.questionFocused = true;
    game.state = "livingQuestion";
    game.stateStarted = millis();
  } else if (preview === "impact") {
    const requestedId = parameters.get("catch") || "trout";
    const requestedLocation = parameters.get("location") || "daylight-river";
    const requestedWeather = parameters.get("weather") || "sunny";
    game.currentCatch = CATCHES.find((item) => item.id === requestedId) || CATCHES[0];
    game.result = game.currentCatch.id;
    game.waterIndex = max(0, WATER_LOCATIONS.findIndex((location) => location.id === requestedLocation));
    game.weatherIndex = max(0, WEATHER_CONDITIONS.findIndex((weather) => weather.id === requestedWeather));
    const impactTimeParameter = parameters.get("impactTime");
    const requestedImpactTime = Number(impactTimeParameter);
    previewImpactTime = impactTimeParameter !== null && Number.isFinite(requestedImpactTime)
      ? constrain(requestedImpactTime, 0, HOOKED_TRANSITION_DURATION - 1)
      : null;
    game.state = "impact";
    game.stateStarted = millis();
  } else if (preview === "result") {
    const requestedId = parameters.get("catch") || "trout";
    const requestedLocation = parameters.get("location") || "daylight-river";
    game.currentCatch = CATCHES.find((item) => item.id === requestedId) || CATCHES[0];
    game.result = ["weeds", "rubbish", "boot"].includes(game.currentCatch.id) ? "weeds" : "fish";
    game.waterIndex = max(0, WATER_LOCATIONS.findIndex((location) => location.id === requestedLocation));
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
  } else if (preview === "toolbox" || preview === "toolbox-intro") {
    game.state = "toolboxIntro";
    game.stateStarted = millis();
  } else if (preview === "drink") {
    game.question = "";
    game.state = "introDrink";
    game.stateStarted = millis();
  } else if (preview === "idea") {
    game.question = "";
    game.state = "introIdea";
    game.stateStarted = millis();
  } else if (preview === "remote") {
    game.state = "introRemote";
    game.stateStarted = millis();
  } else if (preview === "tv") {
    game.state = "introTv";
    game.stateStarted = millis();
  } else if (preview === "weather") {
    game.weatherIndex = 0;
    game.state = "weather";
    game.stateStarted = millis();
  } else if (preview === "water" || preview === "water-select") {
    const requestedLocation = parameters.get("location");
    game.waterIndex = WATER_LOCATIONS.findIndex((location) => location.id === requestedLocation);
    game.waterSelectAt = game.waterIndex >= 0 ? millis() : 0;
    game.state = "waterSelect";
    game.stateStarted = millis();
  } else if (["fishing", "ready", "rain", "storm"].includes(preview)) {
    const requestedLocation = parameters.get("location") || "daylight-river";
    const requestedWeather = parameters.get("weather") || (preview === "storm" ? "storm" : preview === "rain" ? "rain" : "sunny");
    const locationIndex = WATER_LOCATIONS.findIndex((location) => location.id === requestedLocation);
    const weatherIndex = WEATHER_CONDITIONS.findIndex((weather) => weather.id === requestedWeather);
    game.waterIndex = locationIndex >= 0 ? locationIndex : 0;
    game.weatherIndex = weatherIndex >= 0 ? weatherIndex : 0;
    game.state = "ready";
    game.stateStarted = millis();
  }
}

function draw() {
  const now = millis();
  const dt = constrain((now - lastFrameTime) / 1000, 0, 0.05);
  lastFrameTime = now;

  updateCutsceneSkip(now);
  updateGame(dt);
  updateObservation(dt);

  if (isLivingRoomState()) {
    drawLivingRoomSequence(now);
    drawCutsceneSkipPrompt(now);
    game.shake = max(0, game.shake - dt * 24);
    game.flash = max(0, game.flash - dt * 2.8);
    return;
  }

  push();
  if (game.shake > 0) {
    translate(round(random(-game.shake, game.shake)), round(random(-game.shake, game.shake)));
  }
  drawFishingWorld(now);
  if (!['question', 'tackle'].includes(game.state)) drawFishingAction(now);
  drawWeatherForeground(now);
  pop();

  drawInterface(now);
  drawCutsceneSkipPrompt(now);
  game.shake = max(0, game.shake - dt * 24);
  game.flash = max(0, game.flash - dt * 2.8);
}

function updateCutsceneSkip(now) {
  const isHoldingSpace = keyIsDown(32);
  const targetState = CUTSCENE_GROUPS[game.state];

  if (!isHoldingSpace) {
    game.skipHoldStartedAt = 0;
    game.skipConsumed = false;
    return;
  }
  if (!targetState || game.skipConsumed) return;
  if (!game.skipHoldStartedAt) game.skipHoldStartedAt = now;
  if (now - game.skipHoldStartedAt < CUTSCENE_SKIP_HOLD) return;

  game.skipConsumed = true;
  game.skipHoldStartedAt = 0;
  if (targetState === "livingQuestion") {
    game.questionFocused = true;
  } else if (targetState === "tackle") {
    game.recommendationDeck = [];
    refreshRecommendations();
  }
  setState(targetState);
}

function drawCutsceneSkipPrompt(now) {
  if (!CUTSCENE_GROUPS[game.state]) return;
  // Keep the landing impact visually clean. Holding Space still skips the
  // complete cutscene through updateCutsceneSkip(), but no prompt is drawn.
  if (game.state === "impact") return;
  const holding = keyIsDown(32) && game.skipHoldStartedAt > 0;
  const progress = holding ? constrain((now - game.skipHoldStartedAt) / CUTSCENE_SKIP_HOLD, 0, 1) : 0;
  const x = W - 380;
  const y = H - 72;
  push();
  noStroke();
  fill(7, 20, 27, 205);
  rect(x, y, 330, 38);
  fill(C.paper);
  textAlign(LEFT, CENTER);
  textStyle(BOLD);
  textSize(14);
  text("HOLD SPACE TO SKIP CUTSCENE", x + 18, y + 18);
  fill(C.yellow);
  rect(x, y + 34, 330 * progress, 4);
  textAlign(LEFT, BASELINE);
  pop();
}

function updateGame(dt) {
  if (previewAnglerState) {
    game.state = previewAnglerState;
    game.stateStarted = millis();
    return;
  }
  const elapsed = millis() - game.stateStarted;

  if (game.state === "introDrink" && elapsed >= 7800) {
    setState("introIdea");
    return;
  }

  if (game.state === "introIdea" && elapsed >= 1450) {
    game.questionFocused = true;
    setState("livingQuestion");
    return;
  }

  if (game.state === "livingQuestion" && game.targetLockAt > 0 && millis() - game.targetLockAt >= 1000) {
    game.targetLockAt = 0;
    setState("introRemote");
    return;
  }

  if (game.state === "introRemote" && elapsed >= 5800) {
    setState("introTv");
    return;
  }

  if (game.state === "introTv" && elapsed >= TV_CAMERA.zoomDuration) {
    setState("weather");
    return;
  }

  if (game.state === "toolboxIntro" && elapsed >= TOOLBOX_INTRO_DURATION) {
    setState("tackle");
    return;
  }

  if (game.state === "question" && game.targetLockAt > 0 && millis() - game.targetLockAt >= 1180) {
    game.targetLockAt = 0;
    game.recommendationDeck = [];
    refreshRecommendations();
    setState("tackle");
  }

  if (game.state === "impact" && previewImpactTime === null && elapsed >= HOOKED_TRANSITION_DURATION) {
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
    const safeFish = clampFishCenter(game.castTarget.x + direction, fishY + 54);
    const safeLure = clampLureForFish(safeFish.x, safeFish.y - 54);
    game.lure.x = lerp(safeLure.x, 950, game.fishProgress);
    game.lure.y = lerp(safeLure.y, 740, game.fishProgress);
    if (frameCount % 11 === 0) addSplash(game.lure.x, game.lure.y, 5);

    if (game.tension >= 0.985 && game.dangerTime > 1.1) finishRun("snapped");
    else if (game.tension <= 0.015 && game.dangerTime > 1.4) finishRun("escaped");
    else if (game.fishProgress >= 1) landRandomCatch();
  }

  updateEffects(dt);
}

function isLivingRoomState() {
  return ["introDrink", "introIdea", "livingQuestion", "introRemote", "introTv", "weather", "waterSelect", "toolboxIntro"].includes(game.state);
}

function drawLivingRoomSequence(now) {
  const elapsed = now - game.stateStarted;

  if (game.state === "introTv") {
    drawTelevisionPushIn(elapsed);
    drawLivingSequenceCaption();
    return;
  }

  if (game.state === "weather") {
    drawWeatherBroadcast(elapsed);
    return;
  }

  if (game.state === "waterSelect") {
    drawWaterSelection(elapsed);
    return;
  }

  if (game.state === "toolboxIntro") {
    drawToolboxIntro(elapsed);
    return;
  }

  background("#160F1E");
  image(livingRoomBase, 0, 0, W, H);
  image(livingRoomLegs, 0, 0, W, H);

  if (game.state === "introDrink") {
    drawLivingDrink(elapsed);
  } else if (game.state === "introIdea") {
    drawLivingFrame(livingIdeaFrames, elapsed, 155, { x: 1180, y: 92, w: 500, h: 500 });
  } else if (game.state === "livingQuestion") {
    drawLivingQuestion(now);
  } else if (game.state === "introRemote") {
    drawLivingRemote(elapsed);
  }

  drawLivingSequenceCaption();
}

function easeInOutCubic(value) {
  if (value < 0.5) return 4 * value * value * value;
  return 1 - pow(-2 * value + 2, 3) / 2;
}

function getTelevisionCameraProgress(elapsed) {
  return easeInOutCubic(constrain(elapsed / TV_CAMERA.zoomDuration, 0, 1));
}

function getTelevisionScale(progress) {
  return lerp(1, TV_CAMERA.finalScale, progress);
}

function getTelevisionCameraCentre(progress) {
  return {
    x: lerp(TV_CAMERA.focus.x, W / 2, progress),
    y: lerp(TV_CAMERA.focus.y, H / 2, progress)
  };
}

function getTelevisionScreenBounds(progress) {
  const scaleValue = getTelevisionScale(progress);
  const cameraCentre = getTelevisionCameraCentre(progress);
  return {
    x: cameraCentre.x + (TV_CAMERA.screen.x - TV_CAMERA.focus.x) * scaleValue,
    y: cameraCentre.y + (TV_CAMERA.screen.y - TV_CAMERA.focus.y) * scaleValue,
    w: TV_CAMERA.screen.w * scaleValue,
    h: TV_CAMERA.screen.h * scaleValue
  };
}

function getCrtSafeBounds(bounds) {
  // Keep every broadcast inside the CRT glass rather than its square image bounds.
  const insetX = max(5, bounds.w * 0.026);
  const insetY = max(5, bounds.h * 0.034);
  return {
    x: bounds.x + insetX,
    y: bounds.y + insetY,
    w: bounds.w - insetX * 2,
    h: bounds.h - insetY * 2
  };
}

function getCrtScreenRadius(bounds) {
  return min(bounds.w, bounds.h) * 0.18;
}

function drawTelevisionCamera(progress) {
  const roomProgress = constrain(progress / TV_CAMERA.crossfadeStart, 0, 1);
  const scaleValue = getTelevisionScale(roomProgress);
  const cameraCentre = getTelevisionCameraCentre(roomProgress);
  background("#09070C");
  push();
  translate(cameraCentre.x, cameraCentre.y);
  scale(scaleValue);
  translate(-TV_CAMERA.focus.x, -TV_CAMERA.focus.y);
  image(livingRoomBase, 0, 0, W, H);
  image(livingRoomLegs, 0, 0, W, H);
  pop();

  const transition = constrain(
    (progress - TV_CAMERA.crossfadeStart) / (1 - TV_CAMERA.crossfadeStart),
    0,
    1
  );
  if (transition > 0) {
    const alpha = 255 * easeInOutCubic(transition);
    noStroke();
    fill(9, 7, 12, alpha);
    rect(0, 0, W, H);
    tint(255, alpha);
    image(weatherTvFrameHd, 0, 0, W, H);
    noTint();
  }
}

function drawTelevisionPushIn(elapsed) {
  const progress = getTelevisionCameraProgress(elapsed);
  drawTelevisionCamera(progress);
  const transition = constrain(
    (progress - TV_CAMERA.crossfadeStart) / (1 - TV_CAMERA.crossfadeStart),
    0,
    1
  );
  const roomScreen = getCrtSafeBounds(
    getTelevisionScreenBounds(constrain(progress / TV_CAMERA.crossfadeStart, 0, 1))
  );
  const fullScreen = getCrtSafeBounds(TV_FULLSCREEN.screen);
  const blend = easeInOutCubic(transition);
  const screen = {
    x: lerp(roomScreen.x, fullScreen.x, blend),
    y: lerp(roomScreen.y, fullScreen.y, blend),
    w: lerp(roomScreen.w, fullScreen.w, blend),
    h: lerp(roomScreen.h, fullScreen.h, blend)
  };
  drawCrtBoot(screen, elapsed);
  if (transition > 0) {
    tint(255, 255 * blend);
    image(weatherTvFrameHd, 0, 0, W, H);
    noTint();
  }
}

function withScreenClip(bounds, callback, radius = 0) {
  drawingContext.save();
  drawingContext.beginPath();
  if (radius > 0 && drawingContext.roundRect) {
    drawingContext.roundRect(
      round(bounds.x),
      round(bounds.y),
      round(bounds.w),
      round(bounds.h),
      round(radius)
    );
  } else {
    drawingContext.rect(round(bounds.x), round(bounds.y), round(bounds.w), round(bounds.h));
  }
  drawingContext.clip();
  callback();
  drawingContext.restore();
}

function drawCrtBoot(bounds, elapsed) {
  withScreenClip(bounds, () => {
    noStroke();
    fill("#05090A");
    rect(bounds.x, bounds.y, bounds.w, bounds.h);

    const localTime = max(0, elapsed - 260);
    const centreX = bounds.x + bounds.w / 2;
    const centreY = bounds.y + bounds.h / 2;

    if (localTime < 520) {
      const glow = constrain(localTime / 520, 0, 1);
      fill(235, 232, 195, 230);
      ellipse(centreX, centreY, max(3, bounds.w * 0.012 * glow), max(3, bounds.w * 0.012 * glow));
    } else if (localTime < 1180) {
      const spread = easeInOutCubic(constrain((localTime - 520) / 660, 0, 1));
      stroke("#EDE7C8");
      strokeWeight(max(2, bounds.h * 0.012));
      line(lerp(centreX, bounds.x + 12, spread), centreY, lerp(centreX, bounds.x + bounds.w - 12, spread), centreY);
    } else {
      const signal = constrain((localTime - 1180) / 860, 0, 1);
      noStroke();
      fill("#173A3D");
      rect(bounds.x, bounds.y, bounds.w, bounds.h);
      drawCrtNoise(bounds, 1 - signal);
      fill("#EEDCA6");
      textAlign(CENTER, CENTER);
      textStyle(BOLD);
      textSize(max(13, bounds.h * 0.058));
      text("TUNING EXTERNAL CONDITIONS", centreX, centreY);
      textAlign(LEFT, BASELINE);
    }
    drawCrtScanlines(bounds, 34);
  }, getCrtScreenRadius(bounds));
}

function drawWeatherBroadcast(elapsed) {
  if (game.weatherIndex < 0) game.weatherIndex = floor(random(WEATHER_CONDITIONS.length));
  const weather = WEATHER_CONDITIONS[game.weatherIndex];
  ensureWeatherFrames(weather.id);
  const bounds = getCrtSafeBounds(TV_FULLSCREEN.screen);
  const frames = weatherFrameImages[weather.id] || [];
  const framesReady = weatherFrameLoadState[weather.id] === "ready";
  const frameIndex = framesReady
    ? floor(elapsed / TV_FULLSCREEN.frameDuration) % frames.length
    : 0;

  background("#09070C");
  withScreenClip(bounds, () => {
    noStroke();
    fill("#071319");
    rect(bounds.x, bounds.y, bounds.w, bounds.h);
    if (framesReady) {
      image(frames[frameIndex], bounds.x, bounds.y, bounds.w, bounds.h);
    } else {
      drawWeatherLoadingSignal(bounds);
    }

    if (framesReady) {
      noStroke();
      fill(7, 19, 25, 218);
      rect(bounds.x + 54, bounds.y + 48, 500, 174);
      fill(weather.accent);
      textAlign(LEFT, TOP);
      textStyle(BOLD);
      textSize(52);
      text(weather.title, bounds.x + 82, bounds.y + 67);
      fill("#F4EBCF");
      textSize(25);
      text(weather.status, bounds.x + 82, bounds.y + 132);
      fill("#C5D6D3");
      textSize(17);
      text(weather.note, bounds.x + 82, bounds.y + 174, 445, 46);
    }

    drawCrtScanlines(bounds, 30);
    drawCrtNoise(bounds, 0.025);
  }, getCrtScreenRadius(bounds));

  image(weatherTvFrameHd, 0, 0, W, H);
  if (framesReady) drawSelectWaterButton(getWeatherButtonBounds(bounds), elapsed);
}

function ensureWeatherFrames(weatherId) {
  if (weatherFrameLoadState[weatherId]) return;

  weatherFrameLoadState[weatherId] = "loading";
  weatherFrameImages[weatherId] = new Array(4);
  let loadedFrames = 0;
  let failed = false;

  for (let frame = 1; frame <= 4; frame += 1) {
    const frameIndex = frame - 1;
    loadImage(
      `public/images/weather/${weatherId}-${frame}.png`,
      (imageAsset) => {
        weatherFrameImages[weatherId][frameIndex] = imageAsset;
        loadedFrames += 1;
        if (!failed && loadedFrames === 4) weatherFrameLoadState[weatherId] = "ready";
      },
      () => {
        failed = true;
        weatherFrameLoadState[weatherId] = "error";
        console.error(`Unable to load weather frame: ${weatherId}-${frame}.png`);
      }
    );
  }
}

function ensureWeatherSceneFrames(weatherId) {
  if (weatherSceneLoadState[weatherId]) return;

  weatherSceneLoadState[weatherId] = "loading";
  const bundle = { back: [], water: [], front: [] };
  weatherSceneFrames[weatherId] = bundle;
  let loadedFrames = 0;
  let failed = false;
  const totalFrames = WEATHER_SCENE_FRAME_COUNT * 3;

  ["back", "water", "front"].forEach((layer) => {
    for (let frame = 0; frame < WEATHER_SCENE_FRAME_COUNT; frame += 1) {
      bundle[layer][frame] = loadImage(
        `public/images/weather-scene/${weatherId}/${layer}-${frame}.png?v=${WEATHER_SCENE_REVISION}`,
        () => {
          loadedFrames += 1;
          if (!failed && loadedFrames === totalFrames) weatherSceneLoadState[weatherId] = "ready";
        },
        () => {
          failed = true;
          weatherSceneLoadState[weatherId] = "error";
          console.error(`Unable to load scene weather frame: ${weatherId}/${layer}-${frame}.png`);
        }
      );
    }
  });
}

function drawWeatherLoadingSignal(bounds) {
  const pulse = 0.55 + sin(millis() * 0.006) * 0.18;
  noStroke();
  fill("#173A3D");
  rect(bounds.x, bounds.y, bounds.w, bounds.h);
  drawCrtNoise(bounds, 0.22);
  fill(238, 220, 166, 255 * pulse);
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(34);
  text("TUNING EXTERNAL CONDITIONS", bounds.x + bounds.w / 2, bounds.y + bounds.h / 2);
  textAlign(LEFT, BASELINE);
}

function drawWeatherHeader(bounds, weather) {
  const pad = bounds.w * 0.055;
  noStroke();
  fill("#10242C");
  rect(bounds.x, bounds.y, bounds.w, bounds.h * 0.13);
  fill("#F4EBCF");
  textStyle(BOLD);
  textAlign(LEFT, CENTER);
  textSize(max(15, bounds.h * 0.035));
  text("THE ANGLER WEATHER SERVICE", bounds.x + pad, bounds.y + bounds.h * 0.065);
  fill(weather.accent);
  textAlign(RIGHT, CENTER);
  text("LIVE", bounds.x + bounds.w - pad, bounds.y + bounds.h * 0.065);
}

function drawWeatherCopy(bounds, weather) {
  const left = bounds.x + bounds.w * 0.61;
  const right = bounds.x + bounds.w * 0.94;
  fill("#10242C");
  noStroke();
  rect(left - bounds.w * 0.025, bounds.y + bounds.h * 0.22, right - left + bounds.w * 0.05, bounds.h * 0.39);

  fill(weather.accent);
  textAlign(LEFT, TOP);
  textStyle(BOLD);
  textSize(max(27, bounds.h * 0.084));
  text(weather.title, left, bounds.y + bounds.h * 0.25);
  fill("#F4EBCF");
  textSize(max(18, bounds.h * 0.047));
  text(weather.status, left, bounds.y + bounds.h * 0.39);
  fill("#C7E5EA");
  textStyle(NORMAL);
  textSize(max(13, bounds.h * 0.028));
  textWrap(WORD);
  text(weather.note, left, bounds.y + bounds.h * 0.49, right - left, bounds.h * 0.12);
  textAlign(LEFT, BASELINE);
}

function drawWeatherHalftone(bounds, weather) {
  stroke(10, 20, 24, 38);
  strokeWeight(2);
  for (let y = bounds.y + bounds.h * 0.16; y < bounds.y + bounds.h; y += 20) {
    for (let x = bounds.x + 8; x < bounds.x + bounds.w; x += 20) {
      if ((round(x + y) / 20) % 3 !== 0) point(x, y);
    }
  }
  noStroke();
  fill(244, 235, 207, 20);
  for (let index = 0; index < 9; index += 1) {
    const y = bounds.y + bounds.h * (0.17 + index * 0.082);
    rect(bounds.x, y, bounds.w, max(2, bounds.h * 0.008));
  }
}

function drawAnimatedWeatherIcon(id, bounds, elapsed, accent) {
  const cx = bounds.x + bounds.w / 2;
  const cy = bounds.y + bounds.h / 2;
  const tick = elapsed / 1000;
  push();
  stroke("#10242C");
  strokeWeight(max(5, bounds.w * 0.012));
  fill(accent);

  if (id === "sunny") {
    push();
    translate(cx, cy);
    rotate(tick * 0.22);
    for (let index = 0; index < 12; index += 1) {
      rotate(TWO_PI / 12);
      line(bounds.w * 0.19, 0, bounds.w * 0.27, 0);
    }
    pop();
    ellipse(cx, cy, bounds.w * 0.3);
    drawEngravingLines(cx, cy, bounds.w * 0.12, 8);
  } else if (id === "cloudy") {
    const drift = sin(tick * 0.8) * bounds.w * 0.025;
    drawComicCloud(cx - bounds.w * 0.08 + drift, cy, bounds.w * 0.5, accent);
    drawComicCloud(cx + bounds.w * 0.18 - drift * 0.6, cy + bounds.h * 0.12, bounds.w * 0.34, "#AAB9B5");
  } else if (id === "fog") {
    fill("#D7E1D7");
    noStroke();
    ellipse(cx, cy, bounds.w * 0.22);
    stroke("#10242C");
    for (let index = 0; index < 7; index += 1) {
      const offset = ((tick * 42 + index * 58) % (bounds.w * 0.66)) - bounds.w * 0.33;
      const y = cy - bounds.h * 0.22 + index * bounds.h * 0.075;
      line(cx + offset - bounds.w * 0.16, y, cx + offset + bounds.w * 0.16, y);
    }
  } else if (id === "rain") {
    drawComicCloud(cx, cy - bounds.h * 0.15, bounds.w * 0.5, "#AFC6CB");
    stroke(accent);
    for (let index = 0; index < 12; index += 1) {
      const lane = index % 6;
      const phase = (tick * 140 + floor(index / 6) * 70 + lane * 24) % (bounds.h * 0.42);
      const x = cx - bounds.w * 0.25 + lane * bounds.w * 0.1;
      line(x, cy + phase - bounds.h * 0.02, x - bounds.w * 0.025, cy + phase + bounds.h * 0.1);
    }
  } else {
    drawComicCloud(cx, cy - bounds.h * 0.16, bounds.w * 0.54, "#6A6880");
    stroke("#10242C");
    strokeWeight(max(6, bounds.w * 0.016));
    fill(accent);
    const flash = floor(tick * 2.3) % 5 === 0;
    if (flash) fill("#F0C64F");
    beginShape();
    vertex(cx + bounds.w * 0.02, cy - bounds.h * 0.02);
    vertex(cx - bounds.w * 0.08, cy + bounds.h * 0.2);
    vertex(cx + bounds.w * 0.02, cy + bounds.h * 0.18);
    vertex(cx - bounds.w * 0.04, cy + bounds.h * 0.42);
    vertex(cx + bounds.w * 0.16, cy + bounds.h * 0.1);
    vertex(cx + bounds.w * 0.06, cy + bounds.h * 0.12);
    endShape(CLOSE);
  }
  pop();
}

function drawComicCloud(cx, cy, widthValue, colour) {
  push();
  stroke("#10242C");
  strokeWeight(max(5, widthValue * 0.024));
  fill(colour);
  ellipse(cx - widthValue * 0.22, cy + widthValue * 0.035, widthValue * 0.34);
  ellipse(cx, cy - widthValue * 0.08, widthValue * 0.46);
  ellipse(cx + widthValue * 0.24, cy + widthValue * 0.03, widthValue * 0.32);
  rect(cx - widthValue * 0.35, cy, widthValue * 0.7, widthValue * 0.18);
  pop();
}

function drawEngravingLines(cx, cy, radius, count) {
  stroke("#10242C");
  strokeWeight(2);
  for (let index = 0; index < count; index += 1) {
    const y = cy - radius * 0.55 + index * radius * 0.15;
    const half = sqrt(max(0, radius * radius - sq(y - cy))) * 0.72;
    line(cx - half, y, cx + half, y);
  }
}

function drawCrtScanlines(bounds, alphaValue) {
  stroke(5, 10, 12, alphaValue);
  strokeWeight(2);
  for (let y = bounds.y; y < bounds.y + bounds.h; y += 8) {
    line(bounds.x, y, bounds.x + bounds.w, y);
  }
}

function drawCrtNoise(bounds, amount) {
  if (amount <= 0) return;
  noStroke();
  for (let index = 0; index < floor(90 * amount); index += 1) {
    fill(random() > 0.5 ? color(244, 235, 207, 90) : color(16, 36, 44, 120));
    const size = random(2, 8);
    rect(random(bounds.x, bounds.x + bounds.w), random(bounds.y, bounds.y + bounds.h), size, size);
  }
}

function getWeatherButtonBounds(bounds = TV_FULLSCREEN.screen) {
  return {
    x: bounds.x + bounds.w * 0.66,
    y: bounds.y + bounds.h * 0.79,
    w: bounds.w * 0.27,
    h: bounds.h * 0.115
  };
}

function drawSelectWaterButton(bounds, elapsed) {
  const pulse = floor(elapsed / 500) % 2 === 0;
  stroke("#10242C");
  strokeWeight(max(4, bounds.h * 0.055));
  fill(pulse ? "#F0C64F" : "#E5B543");
  rect(bounds.x, bounds.y, bounds.w, bounds.h);
  fill("#10242C");
  noStroke();
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(max(19, bounds.h * 0.25));
  text("SELECT WATER", bounds.x + bounds.w / 2, bounds.y + bounds.h / 2);
  textAlign(LEFT, BASELINE);
}

function drawWaterSelection(elapsed) {
  background("#09070C");
  const screen = getCrtSafeBounds(TV_FULLSCREEN.screen);
  const mapBounds = getWaterMapBounds();
  const mapScaleX = mapBounds.w / WATER_MAP_SIZE.w;
  const mapScaleY = mapBounds.h / WATER_MAP_SIZE.h;
  const pointer = getWaterPointer(mouseX, mouseY);
  const hoveredIndex = WATER_LOCATIONS.findIndex((location) => pointInRect(pointer.x, pointer.y, location.hit));
  const focusLocation = hoveredIndex >= 0
    ? WATER_LOCATIONS[hoveredIndex]
    : WATER_LOCATIONS[game.waterIndex] || null;

  withScreenClip(screen, () => {
    noStroke();
    fill("#071319");
    rect(screen.x, screen.y, screen.w, screen.h);

    push();
    translate(mapBounds.x, mapBounds.y);
    scale(mapScaleX, mapScaleY);
    tint(255, 218);
    image(waterMapBase, 0, 0, WATER_MAP_SIZE.w, WATER_MAP_SIZE.h);
    noTint();

    for (let index = 0; index < WATER_LOCATIONS.length; index += 1) {
      const location = WATER_LOCATIONS[index];
      const hovered = hoveredIndex === index;
      const selected = game.waterIndex === index;
      drawWaterLocation(location, waterLocationImages[index], hovered, selected, elapsed);
    }

    drawWaterMapHeader(focusLocation);
    drawWaterNavigation(elapsed, pointer);
    drawCrtScanlines({ x: 0, y: 0, w: WATER_MAP_SIZE.w, h: WATER_MAP_SIZE.h }, 10);
    pop();
    drawCrtNoise(screen, 0.02);
  }, getCrtScreenRadius(screen));

  image(weatherTvFrameHd, 0, 0, W, H);
  textAlign(LEFT, BASELINE);
}

function getWaterMapBounds() {
  return getCrtSafeBounds(TV_FULLSCREEN.screen);
}

function getWaterPointer(x, y) {
  const bounds = getWaterMapBounds();
  return {
    x: (x - bounds.x) / (bounds.w / WATER_MAP_SIZE.w),
    y: (y - bounds.y) / (bounds.h / WATER_MAP_SIZE.h)
  };
}

function scaleBoundsFromCentre(bounds, scaleValue) {
  const w = bounds.w * scaleValue;
  const h = bounds.h * scaleValue;
  return {
    x: bounds.x - (w - bounds.w) / 2,
    y: bounds.y - (h - bounds.h) / 2,
    w,
    h
  };
}

function drawWaterLocation(location, illustration, hovered, selected, elapsed) {
  const pulse = selected ? 0.5 + sin(elapsed * 0.006) * 0.12 : 0;
  const artScale = selected ? 1.14 : hovered ? 1.09 : 1;
  const artBounds = scaleBoundsFromCentre(location.art, artScale);
  push();
  if (hovered || selected) {
    drawingContext.shadowColor = selected ? "rgba(240, 198, 79, 0.75)" : "rgba(99, 195, 213, 0.55)";
    drawingContext.shadowBlur = selected ? 28 + pulse * 10 : 18;
  }
  tint(255, selected || hovered ? 255 : 224);
  drawImageContained(illustration, artBounds);
  noTint();
  drawingContext.shadowBlur = 0;
  pop();

  const label = location.label;
  stroke(selected ? C.yellow : hovered ? C.riverLight : C.ink);
  strokeWeight(selected ? 5 : 3);
  fill(7, 19, 25, selected || hovered ? 246 : 232);
  rect(label.x, label.y, label.w, label.h, 8);
  noStroke();
  fill(selected ? C.yellow : C.paper);
  textAlign(CENTER, TOP);
  textStyle(BOLD);
  textSize(31);
  text(location.name, label.x + label.w / 2, label.y + 9);
  fill(selected ? C.yellow : C.riverLight);
  textStyle(BOLD);
  textSize(23);
  text(location.model, label.x + label.w / 2, label.y + 50);

  if (selected) {
    fill(C.yellow);
    circle(label.x + 24, label.y + label.h / 2, 15 + pulse * 3);
    fill(C.ink);
    circle(label.x + 24, label.y + label.h / 2, 6);
  }
}

function drawWaterMapHeader(location) {
  const bounds = { x: 390, y: 18, w: 700, h: 94 };
  noStroke();
  fill(7, 19, 25, 238);
  rect(bounds.x, bounds.y, bounds.w, bounds.h, 10);

  if (location) {
    fill(C.riverLight);
    textAlign(CENTER, TOP);
    textStyle(BOLD);
    textSize(31);
    text(location.model, bounds.x + bounds.w / 2, bounds.y + 13);
    fill(C.paper);
    textStyle(NORMAL);
    textSize(20);
    text(location.note, bounds.x + 24, bounds.y + 57, bounds.w - 48, 28);
  } else {
    fill(C.paper);
    textAlign(CENTER, TOP);
    textStyle(BOLD);
    textSize(32);
    text("CHOOSE A MODEL", bounds.x + bounds.w / 2, bounds.y + 12);
    fill(C.mist);
    textStyle(NORMAL);
    textSize(18);
    text("EACH WATER REPRESENTS A DIFFERENT AI MODEL", bounds.x + bounds.w / 2, bounds.y + 58);
  }
}

function drawWaterNavigation(elapsed, pointer) {
  const back = WATER_SELECT_BOUNDS.back;
  const confirm = WATER_SELECT_BOUNDS.confirm;
  const selected = game.waterIndex >= 0;
  const confirmHover = selected && pointInRect(pointer.x, pointer.y, confirm);
  const backHover = pointInRect(pointer.x, pointer.y, back);

  stroke(C.ink);
  strokeWeight(3);
  fill(backHover ? C.mist : C.paper);
  rect(back.x, back.y, back.w, back.h, 6);
  noStroke();
  fill(C.ink);
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(24);
  text("BACK", back.x + back.w / 2, back.y + back.h / 2);

  stroke(C.ink);
  strokeWeight(4);
  fill(selected ? (confirmHover || floor(elapsed / 520) % 2 === 0 ? C.yellow : "#D9A936") : C.hillShadow);
  rect(confirm.x, confirm.y, confirm.w, confirm.h, 6);
  noStroke();
  fill(selected ? C.ink : C.inkSoft);
  textSize(24);
  text(selected ? "USE THIS MODEL" : "SELECT A MODEL", confirm.x + confirm.w / 2, confirm.y + confirm.h / 2);
}

function getWaterLocationAt(x, y) {
  const pointer = getWaterPointer(x, y);
  for (let index = 0; index < WATER_LOCATIONS.length; index += 1) {
    if (pointInRect(pointer.x, pointer.y, WATER_LOCATIONS[index].hit)) return index;
  }
  return -1;
}

function confirmWaterSelection() {
  if (game.waterIndex < 0) return;
  if (game.waterSelectOrigin === "result" || game.currentCatch) {
    game.waterSelectOrigin = null;
    const activeWeather = WEATHER_CONDITIONS[game.weatherIndex] || WEATHER_CONDITIONS[0];
    game.weatherIndex = max(0, WEATHER_CONDITIONS.indexOf(activeWeather));
    ensureWeatherSceneFrames(activeWeather.id);
    prepareCast(true);
    return;
  }
  game.recommendationDeck = [];
  refreshRecommendations();
  setState("toolboxIntro");
}

function drawToolboxIntro(elapsed) {
  background("#100A14");
  image(toolboxRoomBackground, 0, 0, W, H);

  const toolboxIndex = getTimedFrameIndex(
    max(0, elapsed - TOOLBOX_BOX_START),
    TOOLBOX_FRAME_DURATIONS
  );
  const rightIndex = getTimedFrameIndex(
    max(0, elapsed - TOOLBOX_RIGHT_START),
    TOOLBOX_RIGHT_DURATIONS
  );
  const leftIndex = getTimedFrameIndex(
    max(0, elapsed - TOOLBOX_LEFT_START),
    TOOLBOX_LEFT_DURATIONS
  );

  // The v2 box stays square to the table: fixed centre, horizontal front edge and hinge.
  // Leave visible worktop around the box so it reads as resting on the table, not on its front edge.
  image(toolboxFrames[toolboxIndex], 620, -35, 680, 680);

  // Oversized hand layers extend below y=1080 so no sleeve endpoint is visible on screen.
  if (elapsed >= TOOLBOX_LEFT_START && elapsed < 7500) {
    image(
      toolboxLeftHandFrames[leftIndex],
      TOOLBOX_LEFT_X[leftIndex],
      TOOLBOX_LEFT_Y[leftIndex],
      900,
      1125
    );
  }
  if (elapsed >= TOOLBOX_RIGHT_START && elapsed < 7600) {
    // The source sequence was drawn with left-hand anatomy; mirror it into a true right hand.
    push();
    translate(1420 + TOOLBOX_RIGHT_X[rightIndex], 0);
    scale(-1, 1);
    image(toolboxRightHandFrames[rightIndex], 0, TOOLBOX_RIGHT_Y[rightIndex], 900, 1125);
    pop();
  }

  noStroke();
  fill(7, 19, 25, 224);
  rect(62, 950, 520, 58, 4);
  fill(elapsed >= 7000 ? C.yellow : C.paper);
  textAlign(LEFT, CENTER);
  textStyle(BOLD);
  textSize(22);
  text(elapsed < 900 ? "THE WORKROOM" : elapsed < 7000 ? "OPENING THE TACKLE BOX" : "TACKLE READY", 88, 979);

  const fadeIn = constrain(map(elapsed, 0, 500, 255, 0), 0, 255);
  const fadeOut = constrain(map(elapsed, TOOLBOX_INTRO_DURATION - 500, TOOLBOX_INTRO_DURATION, 0, 255), 0, 255);
  if (fadeIn > 0 || fadeOut > 0) {
    fill(4, 3, 6, max(fadeIn, fadeOut));
    rect(0, 0, W, H);
  }
  textAlign(LEFT, BASELINE);
}

function getTimedFrameIndex(elapsed, frameDurations) {
  let index = 0;
  let remaining = elapsed;
  while (index < frameDurations.length - 1 && remaining >= frameDurations[index]) {
    remaining -= frameDurations[index];
    index += 1;
  }
  return index;
}

function returnToWeather() {
  if (game.waterSelectOrigin === "result" || game.currentCatch) {
    game.waterSelectOrigin = null;
    game.state = "result";
    game.stateStarted = millis();
    updateAccessibleStatus();
    return;
  }
  game.state = "weather";
  game.stateStarted = millis();
  updateAccessibleStatus();
}

function drawLivingFrame(frames, elapsed, duration, bounds) {
  if (!frames.length) return;
  const index = constrain(floor(elapsed / duration), 0, frames.length - 1);
  image(frames[index], bounds.x, bounds.y, bounds.w, bounds.h);
}

function drawLivingDrink(elapsed) {
  if (!livingBeerFrames.length) return;
  const frameDurations = [
    650, 240, 220, 240, 240, 260, 280, 320, 360, 420,
    500, 650, 500, 420, 360, 320, 280, 260, 300, 650
  ];
  drawTimedLivingOverlay(livingBeerFrames, elapsed, frameDurations);
}

function drawLivingRemote(elapsed) {
  if (!livingRemoteFrames.length) return;
  const frameDurations = [
    420, 220, 220, 240, 240, 220, 220, 220, 220, 240,
    300, 440, 500, 260, 240, 220, 220, 220, 300, 500
  ];
  drawTimedLivingOverlay(livingRemoteFrames, elapsed, frameDurations);
}

function drawTimedLivingOverlay(frames, elapsed, frameDurations) {
  let index = 0;
  let remaining = elapsed;
  while (index < frameDurations.length - 1 && remaining >= frameDurations[index]) {
    remaining -= frameDurations[index];
    index += 1;
  }
  image(frames[index], 0, 0);
}

function drawLivingQuestion(now) {
  image(livingThoughtUi, 124, 70, 1672, 941);

  const title = LIVING_QUESTION_BOUNDS.title;
  const input = LIVING_QUESTION_BOUNDS.input;
  fill("#18252A");
  textStyle(BOLD);
  textAlign(CENTER, CENTER);
  textSize(40);
  text("WHAT ARE YOU FISHING FOR?", title.x + title.w / 2, title.y + title.h / 2);

  fill("#18252A");
  textStyle(NORMAL);
  textAlign(LEFT, TOP);
  textSize(31);
  textWrap(WORD);
  const visibleQuestion = game.question || "Type your question here...";
  if (!game.question) fill("#687A78");
  text(visibleQuestion, input.x, input.y, input.w, input.h);

  if (game.questionFocused && floor(now / 450) % 2 === 0) {
    fill("#D6477E");
    rect(input.x, input.y + input.h - 12, 28, 4);
  }

  fill("#40585B");
  textAlign(CENTER, CENTER);
  textSize(19);
  textStyle(BOLD);
  const example = LIVING_QUESTION_BOUNDS.example;
  text(
    "EXAMPLE: WHAT ATTRACTIONS SHOULD I VISIT IN LONDON?",
    example.x + example.w / 2,
    example.y + example.h / 2
  );

  drawLivingTargetFish();

  const confirm = LIVING_QUESTION_BOUNDS.confirm;
  const canConfirm = game.question.trim().length > 0;
  fill(canConfirm ? "#1B3E43" : "#7F8377");
  textAlign(CENTER, CENTER);
  textSize(27);
  textStyle(BOLD);
  text(game.targetLockAt ? "TARGET FOUND" : "SET THIS TARGET", confirm.x + confirm.w / 2, confirm.y + confirm.h / 2 + 2);
  textAlign(LEFT, BASELINE);
}

function drawLivingTargetFish() {
  if (!game.question.length || !livingTargetFish.length) return;
  const fish = livingTargetFish[game.targetShadowIndex % livingTargetFish.length];
  const destination = LIVING_QUESTION_BOUNDS.fish;
  push();
  tint(255, game.targetLockAt > 0 ? 255 : 230);
  drawImageContained(fish, destination);
  noTint();
  pop();

  fill("#1B3E43");
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(18);
  text(game.targetLockAt > 0 ? "TARGET LOCKED" : "SIGNAL SHIFTING", destination.x + destination.w / 2, destination.y + destination.h + 34);
  textAlign(LEFT, BASELINE);
}

function drawLivingSequenceCaption() {
  fill(10, 8, 14, 160);
  noStroke();
  rect(32, H - 70, 430, 38);
  fill("#EEDCA6");
  textStyle(BOLD);
  textSize(15);
  const captions = {
    introDrink: "A QUIET MOMENT",
    introIdea: "A TARGET FORMS",
    livingQuestion: "DEFINE THE TARGET",
    introRemote: "CHECK THE CONDITIONS",
    introTv: "THE SIGNAL OPENS"
  };
  text(captions[game.state] || "", 50, H - 44);
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

  const safeTarget = clampLureForFish(targetX, targetY);
  targetX = safeTarget.x;
  targetY = safeTarget.y;

  const easing = 1 - pow(0.001, dt);
  game.observation.x = lerp(game.observation.x, targetX, easing);
  game.observation.y = lerp(game.observation.y, targetY, easing);
}

function getActiveLocationProfile() {
  const location = WATER_LOCATIONS[game.waterIndex] || WATER_LOCATIONS[0];
  return LOCATION_PROFILES[location.id] || LOCATION_PROFILES["daylight-river"];
}

function drawFishingWorld(now) {
  const profile = getActiveLocationProfile();
  image(locationBackgrounds[profile.id], 0, 0, W, H);
  const weather = WEATHER_CONDITIONS[game.weatherIndex] || WEATHER_CONDITIONS[0];
  ensureWeatherFx(weather.id, now);

  if (profile.sceneType === "river") {
    drawRiverSceneLayers(now, weather.id);
  } else {
    drawModularLocationLayers(now, profile, weather.id);
  }
}

function drawRiverSceneLayers(now, weatherId) {
  ensureWeatherSceneFrames(weatherId);
  const weatherFrames = weatherSceneLoadState[weatherId] === "ready" ? weatherSceneFrames[weatherId] : null;
  const timing = getWeatherSceneTiming(weatherId);

  if (weatherFrames) drawSceneFrame(weatherFrames.back, now, timing.back);
  drawWeatherLightning(now, weatherId);
  drawSceneFrame(sceneFoliageFrames, now, timing.foliage);
  beginWaterClip();
  drawSceneFrame(sceneWaterFrames, now, timing.water);
  if (weatherFrames) drawSceneFrame(weatherFrames.water, now, timing.waterWeather);
  drawWeatherWaterImpacts(now, weatherId);
  drawObservationZone(now);
  endWaterClip();
  drawPlantLayer(now);
  drawSceneFrame(sceneAmbientFrames, now, 140);
  if (weatherFrames) drawSceneFrame(weatherFrames.front, now, timing.front);
}

function drawModularLocationLayers(now, profile, weatherId) {
  const frames = locationSceneFrames[profile.id];
  if (weatherId === "fog") ensureWeatherSceneFrames(weatherId);
  const weatherFrames = weatherId === "fog"
    && weatherSceneLoadState[weatherId] === "ready"
    ? weatherSceneFrames[weatherId]
    : null;
  const weatherTiming = getWeatherSceneTiming(weatherId);
  drawLocationWeatherTint(weatherId);
  if (weatherId === "storm" && frames?.stormCloud?.length) {
    // Location-specific crops preserve the river's storm style while keeping
    // the modular skyline, crane, and dam architecture in the foreground.
    drawSceneFrame(frames.stormCloud, now, weatherTiming.back);
  } else {
    drawLocationClouds(now, weatherId);
    if (weatherId === "fog" && weatherFrames) {
      drawSceneFrame(weatherFrames.back, now, weatherTiming.back);
    }
  }
  drawWeatherLightning(now, weatherId);
  if (frames) drawSceneFrame(frames.site, now, 260);

  beginWaterClip();
  if (frames) drawSceneFrame(frames.water, now, 145);
  if (weatherId === "fog" && weatherFrames) {
    drawSceneFrame(weatherFrames.water, now, weatherTiming.waterWeather);
  }
  drawWeatherWaterImpacts(now, weatherId);
  drawObservationZone(now);
  endWaterClip();

  if (frames && ["rain", "storm"].includes(weatherId)) {
    drawSceneFrame(frames.runoff, now, weatherId === "storm" ? 105 : 150);
  }
}

function drawLocationWeatherTint(weatherId) {
  const colors = {
    sunny: [244, 199, 82, 10],
    cloudy: [54, 69, 76, 82],
    fog: [187, 204, 198, 112],
    rain: [22, 52, 68, 102],
    storm: [30, 23, 51, 142]
  };
  const color = colors[weatherId];
  if (!color) return;
  push();
  noStroke();
  fill(...color);
  rect(0, 0, W, H);
  pop();
}

function drawLocationClouds(now, weatherId) {
  if (!["cloudy", "rain", "storm"].includes(weatherId) || !sceneCloudFrames.length) return;
  push();
  tint(255, weatherId === "storm" ? 210 : weatherId === "rain" ? 165 : 130);
  drawSceneFrame(sceneCloudFrames, now, weatherId === "storm" ? 155 : weatherId === "rain" ? 210 : 300);
  pop();
}

function getWeatherSceneTiming(weatherId) {
  const timings = {
    sunny: { back: 420, foliage: 180, water: 150, waterWeather: 180, front: 420 },
    cloudy: { back: 330, foliage: 155, water: 135, waterWeather: 170, front: 330 },
    fog: { back: 520, foliage: 210, water: 175, waterWeather: 300, front: 520 },
    rain: { back: 420, foliage: 130, water: 115, waterWeather: 320, front: 420 },
    storm: { back: 460, foliage: 100, water: 95, waterWeather: 340, front: 460 }
  };
  return timings[weatherId] || timings.sunny;
}

function drawSceneFrame(frames, now, frameDuration) {
  if (!frames.length) return;
  const frame = floor(now / frameDuration) % frames.length;
  image(frames[frame], 0, 0, W, H);
}

function ensureWeatherFx(weatherId, now) {
  const condition = `${getActiveLocationProfile().id}:${weatherId}`;
  if (weatherFx.condition === condition) return;
  weatherFx.condition = condition;
  weatherFx.impacts = [];
  weatherFx.lightningStartedAt = -1;
  weatherFx.nextLightningAt = now + random(7000, 12000);

  if (!['rain', 'storm'].includes(weatherId)) return;
  const count = weatherId === 'storm' ? 20 : 8;
  for (let i = 0; i < count; i += 1) {
    let y = random(500, 930);
    let x = random(getWaterLeft(y) + 90, W - 90);
    let attempts = 0;
    while (!isWaterPoint(x, y, 65) && attempts < 20) {
      y = random(500, 930);
      x = random(getWaterLeft(y) + 90, W - 90);
      attempts += 1;
    }
    const depth = map(y, 500, 930, 0.26, 0.5);
    weatherFx.impacts.push({
      x: round(x),
      y: round(y),
      scale: depth * random(0.88, 1.08),
      phase: random(0, 2200),
      cycle: weatherId === 'storm' ? random(1700, 3100) : random(3200, 5600),
      heavy: weatherId === 'storm' && i % 5 === 0
    });
  }
}

function drawWeatherForeground(now) {
  const weather = WEATHER_CONDITIONS[game.weatherIndex] || WEATHER_CONDITIONS[0];
  const profile = getActiveLocationProfile();
  if (weather.id === "fog" && profile.sceneType === "modular") {
    ensureWeatherSceneFrames("fog");
    // A shared foreground veil puts the angler, rod and location animation
    // inside the fog instead of leaving them sharply pasted above it.
    push();
    noStroke();
    fill(187, 204, 198, 58);
    rect(0, 0, W, H);
    pop();
    if (weatherSceneLoadState.fog === "ready") {
      const timing = getWeatherSceneTiming("fog");
      drawSceneFrame(weatherSceneFrames.fog.front, now, timing.front);
    }
    return;
  }
  if (!['rain', 'storm'].includes(weather.id)) return;
  const frames = weather.id === 'storm' ? weatherModuleFrames.rainHeavy : weatherModuleFrames.rainLight;
  const duration = weather.id === 'storm' ? 72 : 96;
  drawSceneFrame(frames, now, duration);
}

function drawWeatherWaterImpacts(now, weatherId) {
  if (!['rain', 'storm'].includes(weatherId)) return;
  const frameDuration = weatherId === 'storm' ? 68 : 82;

  for (const impact of weatherFx.impacts) {
    const frames = impact.heavy ? weatherModuleFrames.impactHeavy : weatherModuleFrames.impactLight;
    if (!frames.length) continue;
    const activeDuration = frameDuration * frames.length;
    const localTime = (now + impact.phase) % impact.cycle;
    if (localTime >= activeDuration) continue;
    const frameIndex = min(frames.length - 1, floor(localTime / frameDuration));
    const sprite = frames[frameIndex];
    if (!sprite) continue;
    const width = 320 * impact.scale;
    const height = 220 * impact.scale;
    image(sprite, round(impact.x - width / 2), round(impact.y - 154 * impact.scale), width, height);
  }
}

function drawWeatherLightning(now, weatherId) {
  if (weatherId !== 'storm') return;

  if (weatherFx.lightningStartedAt < 0 && now >= weatherFx.nextLightningAt) {
    weatherFx.lightningStartedAt = now;
    weatherFx.lightningVariant = floor(random(2));
  }

  if (weatherFx.lightningStartedAt < 0) return;
  const frameDuration = 82;
  const elapsed = now - weatherFx.lightningStartedAt;
  const frameIndex = floor(elapsed / frameDuration);
  if (frameIndex >= 8) {
    weatherFx.lightningStartedAt = -1;
    weatherFx.nextLightningAt = now + random(10000, 18000);
    return;
  }

  const frames = weatherFx.lightningVariant === 0
    ? weatherModuleFrames.lightningA
    : weatherModuleFrames.lightningB;
  const sprite = frames[frameIndex];
  if (sprite) image(sprite, 0, 0, W, H);
}

function getWaterLeft(y) {
  const stops = getActiveLocationProfile().waterStops;
  if (y <= stops[0].y) return stops[0].x;
  for (let i = 1; i < stops.length; i += 1) {
    if (y <= stops[i].y) {
      const previous = stops[i - 1];
      const current = stops[i];
      return map(y, previous.y, current.y, previous.x, current.x);
    }
  }
  return stops[stops.length - 1].x;
}

function isWaterPoint(x, y, margin = 0) {
  const stops = getActiveLocationProfile().waterStops;
  return y >= stops[0].y && y <= stops[stops.length - 1].y && x >= getWaterLeft(y) + margin && x <= W - margin;
}

function clampFishCenter(x, y) {
  const profile = getActiveLocationProfile();
  const safeY = constrain(y, profile.fishBounds.minY, profile.fishBounds.maxY);
  const halfHeight = 78;
  const widestBankEdge = max(
    getWaterLeft(safeY - halfHeight),
    getWaterLeft(safeY),
    getWaterLeft(safeY + halfHeight)
  );
  const minX = widestBankEdge + 173;
  const maxX = W - 173;
  return { x: constrain(x, minX, maxX), y: safeY };
}

function clampLureForFish(x, y) {
  const fishCenter = clampFishCenter(x, y + 54);
  return { x: fishCenter.x, y: fishCenter.y - 54 };
}

function beginWaterClip() {
  const polygon = getActiveLocationProfile().waterPolygon;
  drawingContext.save();
  drawingContext.beginPath();
  drawingContext.moveTo(polygon[0].x, polygon[0].y);
  for (let i = 1; i < polygon.length; i += 1) {
    drawingContext.lineTo(polygon[i].x, polygon[i].y);
  }
  drawingContext.closePath();
  drawingContext.clip();
}

function endWaterClip() {
  drawingContext.restore();
}

function drawPlantLayer(now) {
  drawPlantAnimation(plantAFrames, 338, 754, now, 0);
  drawPlantAnimation(plantBFrames, 642, 792, now, 210);
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
  const placement = getAnglerArtPlacement();
  const frameImage = placement.frameImage;
  if (!frameImage) return;
  image(frameImage, placement.x, placement.y, placement.width, placement.height);
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

function getAnglerArtPlacement() {
  const frame = getAnglerFrame();
  const art = ANGLER_COMBINED_ART[frame] || ANGLER_COMBINED_ART[0];
  const frameImage = anglerFrames[frame] || anglerFrames[0];
  const angler = getActiveLocationProfile().angler;
  const x = art.x + angler.x - ANGLER.x;
  const y = art.y + angler.y - ANGLER.y;
  return {
    frameImage,
    x,
    y,
    width: art.width * art.scale,
    height: art.height * art.scale,
    tip: {
      x: x + art.tip.x * art.scale,
      y: y + art.tip.y * art.scale
    }
  };
}

function getRodTip(now) {
  return getAnglerArtPlacement().tip;
}

function drawRodAndLine(now) {
  const tip = getRodTip(now);

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
  const safeCenter = clampFishCenter(rawX, y);
  const x = safeCenter.x;
  const shadow = INTERACTION_ASSETS.shadows[game.runNumber % INTERACTION_ASSETS.shadows.length];
  const alphaValue = game.state === "hooked" ? 255 : game.state === "bite" ? 205 : 125;
  push();
  tint(255, alphaValue);
  image(interactionAssetSheet, round(x) - 145, round(safeCenter.y) - 78, 290, 156, shadow.x, shadow.y, shadow.w, shadow.h);
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
  background("#100A14");
  image(toolboxRoomBackground, 0, 0, W, H);
  noStroke();
  fill(15, 6, 22, 112);
  rect(0, 0, W, H);
  // The generated overlay is natively 1672x941, exactly matching UI_ART.
  // Draw it at 1:1 so its ink texture and border linework remain crisp.
  image(tackleScreenV2Overlay, UI_ART.x, UI_ART.y);

  fill("#F0E6C8");
  textStyle(BOLD);
  textSize(26);
  textAlign(LEFT, CENTER);
  text(game.question, 460, 148, 940, 96);
  textAlign(LEFT, BASELINE);

  for (let index = 0; index < TACKLE_BOUNDS.cards.length; index += 1) {
    const profileIndex = game.recommendations[index];
    if (profileIndex === undefined) continue;
    drawTackleCard(TACKLE_PROFILES[profileIndex], TACKLE_BOUNDS.cards[index], index);
  }

  const hasSelection = game.selectedRecommendation >= 0;
  const confirmHover = hasSelection && pointInRect(mouseX, mouseY, TACKLE_BOUNDS.confirm);
  drawUiCenteredText(
    "TAKE THIS TACKLE",
    TACKLE_BOUNDS.confirm,
    29,
    hasSelection ? (confirmHover ? "#5DD4C8" : "#F02B91") : "#665B67",
    0
  );
  drawTackleButtonIcon("back", TACKLE_BOUNDS.back);
  drawTackleButtonIcon("refresh", TACKLE_BOUNDS.refresh);
}

function drawTackleCard(profile, bounds, cardIndex) {
  const selected = game.selectedRecommendation === cardIndex;
  const hovered = pointInRect(mouseX, mouseY, bounds);
  if (selected) {
    image(tackleCardSelectedFrames[cardIndex], bounds.x, bounds.y);
  } else if (hovered) {
    image(tackleCardHoverFrames[cardIndex], bounds.x, bounds.y);
  }

  drawUiCenteredText(
    profile.name,
    { x: bounds.x + 18, y: bounds.y + 12, w: bounds.w - 36, h: 54 },
    26,
    selected ? "#F02B91" : hovered ? "#5DD4C8" : "#F0E6C8",
    4
  );

  const lureInset = selected ? 48 : 58;
  const lureBounds = { x: bounds.x + lureInset, y: bounds.y + 74, w: bounds.w - lureInset * 2, h: 190 };
  drawAssetContained(INTERACTION_ASSETS.lures[profile.type], lureBounds);
  drawUiCenteredText(
    TACKLE_TYPES[profile.type].name,
    { x: bounds.x + 20, y: bounds.y + 260, w: bounds.w - 40, h: 42 },
    20,
    selected ? "#5DD4C8" : "#F0E6C8",
    2
  );
  drawTackleDetails(profile, bounds);
  if (selected) {
    image(tackleSelectedMarker, bounds.x + bounds.w - tackleSelectedMarker.width - 18, bounds.y + 17);
  }
}

function drawTackleDetails(profile, bounds) {
  const leftColumn = { x: bounds.x + 24, y: bounds.y + 322, w: 142, h: 142 };
  const retrieveColumn = {
    x: bounds.x + 172,
    y: bounds.y + 322,
    w: bounds.w - 192,
    h: 142
  };

  drawNativeImageCentered(
    tackleColourIcons[profile.colour],
    { x: leftColumn.x, y: leftColumn.y, w: 82, h: 42 }
  );
  push();
  fill("#F0E6C8");
  textAlign(LEFT, CENTER);
  textStyle(BOLD);
  textSize(17);
  text(TACKLE_COLOURS[profile.colour].name, leftColumn.x + 88, leftColumn.y + 21);

  drawNativeImageCentered(
    tackleWeightIcons[profile.weight],
    { x: leftColumn.x + 10, y: leftColumn.y + 54, w: 54, h: 66 }
  );
  fill("#F0E6C8");
  textAlign(LEFT, CENTER);
  text(TACKLE_WEIGHTS[profile.weight].name, leftColumn.x + 72, leftColumn.y + 87);

  drawNativeImageCentered(
    tackleRetrieveIcons[profile.retrieve],
    { x: retrieveColumn.x, y: retrieveColumn.y + 10, w: retrieveColumn.w, h: 82 }
  );
  fill("#F0E6C8");
  textAlign(CENTER, CENTER);
  textSize(17);
  text(
    RETRIEVES[profile.retrieve].name,
    retrieveColumn.x + retrieveColumn.w / 2,
    retrieveColumn.y + 116
  );
  pop();
}

function drawTackleButtonIcon(buttonName, bounds) {
  const hovered = pointInRect(mouseX, mouseY, bounds);
  const stateName = hovered && mouseIsPressed ? "pressed" : hovered ? "hover" : "default";
  const visualOffset = buttonName === "refresh" ? { x: 14, y: 20 } : { x: 0, y: 0 };
  drawNativeImageCentered(
    tackleButtonIcons[buttonName][stateName],
    {
      x: bounds.x + visualOffset.x,
      y: bounds.y + visualOffset.y,
      w: bounds.w,
      h: bounds.h
    }
  );
}

function drawNativeImageCentered(asset, bounds) {
  if (!asset) return;
  image(
    asset,
    round(bounds.x + (bounds.w - asset.width) / 2),
    round(bounds.y + (bounds.h - asset.height) / 2)
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

  if (game.state === "impact") {
    // The landing transition uses the bars as a physical picture frame:
    // the world keeps its normal colour and brightness, while the catch,
    // angler and drawn effects are rendered after the black bars.
    drawTopBar();
    drawBottomStatus(now);
    drawCatchImpactForeground(now);
    return;
  }

  drawTopBar();
  drawBottomStatus(now);
  if (game.state === "charging") drawChargeMeter();
  if (game.state === "hooked") drawTensionMeter();
  if (game.state === "bite") drawBitePrompt(now);
  if (game.state === "failed") drawResultBanner();
  if (game.state === "result") drawCatchResult();
  if (game.state === "archive") drawArchive();
  if (!["impact", "result", "archive"].includes(game.state)) drawBackpackButton();
}

function drawTopBar() {
  noStroke();
  fill(game.state === "impact" ? "#030305" : C.ink);
  rect(0, 0, W, 82);

  // During the landing transition the bar acts only as a depth boundary.
  if (game.state === "impact") return;

  fill(C.paper);
  textStyle(BOLD);
  textSize(30);
  text("THE ANGLER", 34, 50);

  fill(C.forestMid);
  rect(260, 22, 2, 38);

  fill(C.mist);
  textStyle(NORMAL);
  textSize(20);
  const selectedWater = WATER_LOCATIONS[game.waterIndex];
  text(selectedWater ? selectedWater.name : "DAYLIGHT RIVER", 292, 49);
}

function drawBottomStatus(now) {
  noStroke();
  fill(game.state === "impact" ? "#030305" : C.ink);
  rect(0, H - 92, W, 92);

  // Leave the lower frame completely unlabelled during the impact cutscene.
  if (game.state === "impact") return;

  const copy = getStatusCopy();
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
    const safeAim = clampLureForFish(constrain(mouseX, 850, 1650), aimY);
    noFill();
    stroke(C.yellow);
    strokeWeight(3);
    ellipse(safeAim.x, safeAim.y, 66 * pulse, 21 * pulse);
  }
}

function getStatusCopy() {
  const castLabel = `CAST ${String(game.runNumber).padStart(2, "0")}`;
  switch (game.state) {
    case "ready": return { label: castLabel, detail: "AIM AT THE WATER  /  HOLD MOUSE TO CHARGE", colour: C.yellow };
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

function getCatchImpactMotion(now) {
  const elapsed = previewImpactTime === null ? now - game.stateStarted : previewImpactTime;
  const finalFade = easeInCubic(constrain((elapsed - 2900) / 350, 0, 1));
  const entry = easeOutCubic(constrain((elapsed - 60) / 300, 0, 1));

  // A slightly larger, lower angler gives the coat and tackle bag a controlled
  // overlap across the lower frame while keeping the original aspect ratio.
  const anglerWidth = 1900;
  const anglerHeight = anglerWidth * hookedAnglerLayer.height / hookedAnglerLayer.width;
  const anglerShake = elapsed > 300 && elapsed < 2820
    ? sin(elapsed * 0.075) * 4 + sin(elapsed * 0.031) * 2
    : 0;
  const anglerX = lerp(-1930, -38, entry) + anglerShake;
  const anglerY = -160 + sin(elapsed * 0.048) * (entry * 2.5);

  const fishTime = constrain((elapsed - 280) / 2420, 0, 1);
  // One clean three-beat velocity profile: fast, sustained slow resistance,
  // then fast again. Only the two short gear-change windows are smoothed.
  const fishTravel = getFastSlowFastTravel(fishTime);
  const fishX = lerp(-430, 1745, fishTravel);
  const fishY = lerp(940, 28, fishTravel) + sin(elapsed * 0.006) * 8 * sin(PI * fishTime);
  // Uniform scale only: the fish advances slightly toward the viewer as it
  // crosses the upper frame, without stretching its source artwork.
  const fishWidth = 690 * lerp(0.96, 1.07, easeOutCubic(fishTravel));
  const fishHeight = fishWidth * hookedFishLayer.height / hookedFishLayer.width;

  return {
    elapsed,
    finalFade,
    entry,
    anglerX,
    anglerY,
    anglerWidth,
    anglerHeight,
    fishTime,
    fishTravel,
    fishX,
    fishY,
    fishWidth,
    fishHeight
  };
}

function getFastSlowFastTravel(value) {
  const t = constrain(value, 0, 1);
  const fastIn = 1.9;
  const resisted = 0.28;
  const fastOut = 1.65;
  const slowDownStart = 0.2;
  const slowDownEnd = 0.24;
  const speedUpStart = 0.7;
  const speedUpEnd = 0.74;

  const slowDownWidth = slowDownEnd - slowDownStart;
  const speedUpWidth = speedUpEnd - speedUpStart;
  const totalDistance =
    fastIn * slowDownStart +
    (fastIn + resisted) * slowDownWidth * 0.5 +
    resisted * (speedUpStart - slowDownEnd) +
    (resisted + fastOut) * speedUpWidth * 0.5 +
    fastOut * (1 - speedUpEnd);

  let distance = 0;
  if (t <= slowDownStart) return fastIn * t / totalDistance;
  distance += fastIn * slowDownStart;

  if (t <= slowDownEnd) {
    const local = t - slowDownStart;
    distance += fastIn * local + (resisted - fastIn) * local * local / (2 * slowDownWidth);
    return distance / totalDistance;
  }
  distance += (fastIn + resisted) * slowDownWidth * 0.5;

  if (t <= speedUpStart) {
    distance += resisted * (t - slowDownEnd);
    return distance / totalDistance;
  }
  distance += resisted * (speedUpStart - slowDownEnd);

  if (t <= speedUpEnd) {
    const local = t - speedUpStart;
    distance += resisted * local + (fastOut - resisted) * local * local / (2 * speedUpWidth);
    return distance / totalDistance;
  }
  distance += (resisted + fastOut) * speedUpWidth * 0.5;
  distance += fastOut * (t - speedUpEnd);
  return distance / totalDistance;
}

function drawCatchImpactForeground(now) {
  if (!game.currentCatch) return;
  const motion = getCatchImpactMotion(now);
  const {
    elapsed,
    finalFade,
    entry,
    anglerX,
    anglerY,
    anglerWidth,
    anglerHeight,
    fishTime,
    fishTravel,
    fishX,
    fishY,
    fishWidth,
    fishHeight
  } = motion;

  push();
  noTint();
  drawingContext.globalCompositeOperation = "source-over";

  // A crisp contact shadow is drawn only over the two frame bars. It makes the
  // foreground read as hovering above the screen instead of simply ignoring a clip.
  drawCatchImpactBoundaryShadow(motion);

  // The angler and rod establish the lower foreground plane. The hooked fish
  // and its drawn effects are rendered afterwards so the catch always stays on top.
  if (entry > 0) {
    image(hookedAnglerLayer, anglerX, anglerY, anglerWidth, anglerHeight);
  }

  if (fishTime > 0) {
    const slashIndex = min(
      hookedSlashFrames.length - 1,
      floor(fishTravel * hookedSlashFrames.length)
    );
    const slash = hookedSlashFrames[slashIndex];
    if (slash) {
      const slashWidth = 1180;
      const slashHeight = slashWidth * slash.height / slash.width;
      image(slash, fishX - 790, fishY - 190, slashWidth, slashHeight);
    }

    const waterIndex = min(
      hookedWaterFrames.length - 1,
      floor(fishTravel * hookedWaterFrames.length)
    );
    const water = hookedWaterFrames[waterIndex];
    if (water) {
      const waterWidth = 660;
      const waterHeight = waterWidth * water.height / water.width;
      image(water, fishX - 570, fishY - 35, waterWidth, waterHeight);
    }

    const dropletIndex = getHookedDropletFrameIndex(elapsed);
    const droplets = hookedDropletFrames[dropletIndex];
    if (droplets && dropletIndex >= 0) {
      const dropletWidth = 1580;
      const dropletHeight = dropletWidth * droplets.height / droplets.width;
      image(droplets, 130, 88, dropletWidth, dropletHeight);
    }

    const rodTip = {
      x: anglerX + anglerWidth * 0.982,
      y: anglerY + anglerHeight * 0.025
    };
    const fishMouth = {
      x: fishX + fishWidth * 0.46,
      y: fishY - fishHeight * 0.34
    };
    if (fishTime > 0.12) drawHookedLineLayer(rodTip, fishMouth);
    drawCatchImpactFish(motion);
  }

  if (finalFade > 0) {
    noStroke();
    fill(8, 5, 12, 255 * finalFade);
    rect(0, 0, W, H);
  }
  pop();
}

function drawCatchImpactFish(motion) {
  push();
  translate(motion.fishX, motion.fishY);
  rotate(sin(motion.elapsed * 0.012) * 0.018 * sin(PI * motion.fishTime));
  imageMode(CENTER);
  image(hookedFishLayer, 0, 0, motion.fishWidth, motion.fishHeight);
  pop();
}

function drawCatchImpactBoundaryShadow(motion) {
  push();
  drawingContext.save();
  drawingContext.beginPath();
  drawingContext.rect(0, 0, W, 82);
  drawingContext.rect(0, H - 92, W, 92);
  drawingContext.clip();
  translate(7, 9);
  tint(0, 150);
  if (motion.entry > 0) {
    image(
      hookedAnglerLayer,
      motion.anglerX,
      motion.anglerY,
      motion.anglerWidth,
      motion.anglerHeight
    );
  }
  if (motion.fishTime > 0) drawCatchImpactFish(motion);
  noTint();
  drawingContext.restore();
  pop();
}

function getHookedDropletFrameIndex(elapsed) {
  if (elapsed < 450) return -1;
  if (elapsed < 700) return 0;
  if (elapsed < 950) return 1;
  if (elapsed < 1250) return 2;
  if (elapsed < 1700) return 3;
  if (elapsed < 2050) return 4;
  if (elapsed < 2350) return 5;
  if (elapsed < 2700) return 6;
  return 7;
}

function drawHookedLineLayer(start, end) {
  if (!hookedLineLayer) return;
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const length = sqrt(dx * dx + dy * dy);
  if (length < 2) return;
  const heightValue = max(4, length * hookedLineLayer.height / hookedLineLayer.width);
  push();
  translate(start.x, start.y);
  rotate(atan2(dy, dx));
  imageMode(CORNER);
  image(hookedLineLayer, 0, -heightValue / 2, length, heightValue);
  pop();
}

function easeOutCubic(value) {
  return 1 - pow(1 - value, 3);
}

function easeInCubic(value) {
  return value * value * value;
}

function drawCatchResult() {
  const catchData = game.currentCatch;
  if (!catchData) return;
  const catchIndex = CATCHES.findIndex((item) => item.id === catchData.id);

  background("#100A14");
  drawingContext.save();
  drawingContext.beginPath();
  drawingContext.rect(
    RESULT_SCENE_BOUNDS.x,
    RESULT_SCENE_BOUNDS.y,
    RESULT_SCENE_BOUNDS.w,
    RESULT_SCENE_BOUNDS.h
  );
  drawingContext.clip();
  drawResultLocationBackground();
  drawSpriteContainedBottom(catchResultSprites[catchIndex], RESULT_CATCH_BOUNDS);
  drawingContext.restore();

  // The selected-water background, hands and catch are intentionally drawn first.
  // This transparent frame is the top layer, so none of that content can cover its fish-bone border.
  image(
    resultSceneFrameV3,
    RESULT_SCENE_FRAME_BOUNDS.x,
    RESULT_SCENE_FRAME_BOUNDS.y,
    RESULT_SCENE_FRAME_BOUNDS.w,
    RESULT_SCENE_FRAME_BOUNDS.h
  );
  image(
    resultQuestionPanelV3,
    RESULT_PANELS.question.x,
    RESULT_PANELS.question.y,
    RESULT_PANELS.question.w,
    RESULT_PANELS.question.h
  );
  image(
    resultAnswerPanelV3,
    RESULT_PANELS.answer.x,
    RESULT_PANELS.answer.y,
    RESULT_PANELS.answer.w,
    RESULT_PANELS.answer.h
  );
  drawResultControlsV3();

  drawCatchResultInfo(catchData, getSelectedTackle(), game.question);
}

function drawResultLocationBackground() {
  const profile = getActiveLocationProfile();
  const source = profile.resultView;
  const backgroundImage = locationBackgrounds[profile.id];
  if (!backgroundImage) return;
  drawImageCoverFromSource(backgroundImage, source, RESULT_SCENE_BOUNDS);
}

function drawImageCoverFromSource(sourceImage, sourceBounds, destination) {
  const scaleValue = max(destination.w / sourceBounds.w, destination.h / sourceBounds.h);
  const cropWidth = destination.w / scaleValue;
  const cropHeight = destination.h / scaleValue;
  const cropX = sourceBounds.x + (sourceBounds.w - cropWidth) / 2;
  const cropY = sourceBounds.y + (sourceBounds.h - cropHeight) / 2;
  image(
    sourceImage,
    destination.x,
    destination.y,
    destination.w,
    destination.h,
    cropX,
    cropY,
    cropWidth,
    cropHeight
  );
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
  const questionPanel = RESULT_PANELS.question;
  const answerPanel = RESULT_PANELS.answer;
  const textInset = 34;

  fill("#F02B91");
  textStyle(BOLD);
  textSize(19);
  text("YOUR QUESTION", questionPanel.x + textInset, questionPanel.y + 38);
  fill("#F0E6C8");
  textStyle(NORMAL);
  textSize(23);
  text(
    question,
    questionPanel.x + textInset,
    questionPanel.y + 72,
    questionPanel.w - textInset * 2,
    58
  );

  fill("#5DD4C8");
  textStyle(BOLD);
  textSize(20);
  text("WHAT SURFACED", answerPanel.x + textInset, answerPanel.y + 44);
  fill("#F0E6C8");
  textStyle(NORMAL);
  textSize(27);
  textWrap(WORD);
  text(
    catchData.candidate,
    answerPanel.x + textInset,
    answerPanel.y + 88,
    answerPanel.w - textInset * 2,
    answerPanel.h - 112
  );

  drawUiCenteredText(
    game.judgement === "keep" ? "KEPT FOR REVIEW" : "KEEP FOR REVIEW",
    RESULT_BUTTONS.keep,
    23,
    game.judgement === "keep" ? "#5DD4C8" : "#F0E6C8",
    0
  );
  drawUiCenteredText(
    game.judgement === "release" ? "RELEASED" : "RELEASE",
    RESULT_BUTTONS.release,
    23,
    game.judgement === "release" ? "#F02B91" : "#F0E6C8",
    0
  );

  const actionColour = game.judgement ? "#F0E6C8" : "#665B67";
  drawResultActionLabel("CAST AGAIN", RESULT_BUTTONS.recast, actionColour);
  drawResultActionLabel("CHANGE TACKLE", RESULT_BUTTONS.retackle, actionColour);
  drawResultActionLabel("NEW TARGET", RESULT_BUTTONS.newTarget, actionColour);
  drawResultActionLabel("CHANGE LOCATION", RESULT_BUTTONS.changeLocation, actionColour);
}

function drawResultControlsV3() {
  drawResultDecisionFrame("keep", RESULT_BUTTONS.keep);
  drawResultDecisionFrame("release", RESULT_BUTTONS.release);
  drawResultActionFrame("recast", RESULT_BUTTONS.recast, "recast");
  drawResultActionFrame("retackle", RESULT_BUTTONS.retackle, "retackle");
  drawResultActionFrame("newTarget", RESULT_BUTTONS.newTarget, "target");
  drawResultActionFrame("changeLocation", RESULT_BUTTONS.changeLocation, "location");
}

function drawResultDecisionFrame(judgement, bounds) {
  const selected = game.judgement === judgement;
  const hovered = pointInRect(mouseX, mouseY, bounds);
  const stateName = selected ? "selected" : hovered ? "hover" : "default";
  image(resultDecisionFramesV3[judgement][stateName], bounds.x, bounds.y, bounds.w, bounds.h);
}

function drawResultActionFrame(actionName, bounds, iconName) {
  const enabled = Boolean(game.judgement);
  const hovered = enabled && pointInRect(mouseX, mouseY, bounds);
  const frameState = enabled ? (hovered ? "hover" : "default") : "disabled";
  const frameName = actionName === "newTarget" ? "target" : actionName === "changeLocation" ? "location" : actionName;
  image(resultActionFramesV3[frameName][frameState], bounds.x, bounds.y, bounds.w, bounds.h);
  const iconState = enabled ? "default" : "disabled";
  const icon = resultActionIconsV3[iconName][iconState];
  if (icon) {
    const iconSize = 56;
    image(icon, bounds.x + 22, bounds.y + (bounds.h - iconSize) / 2, iconSize, iconSize);
  }
}

function drawResultActionLabel(label, bounds, colourValue) {
  drawUiCenteredText(
    label,
    { x: bounds.x + 72, y: bounds.y, w: bounds.w - 82, h: bounds.h },
    18,
    colourValue,
    0
  );
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
  fill("#100A14");
  rect(0, 82, W, H - 174);
  image(
    archiveCollectionPanelV2,
    ARCHIVE_COLLECTION_BOUNDS.x,
    ARCHIVE_COLLECTION_BOUNDS.y,
    ARCHIVE_COLLECTION_BOUNDS.w,
    ARCHIVE_COLLECTION_BOUNDS.h
  );
  image(
    archiveQuestionPanelV2,
    ARCHIVE_PANELS.question.x,
    ARCHIVE_PANELS.question.y,
    ARCHIVE_PANELS.question.w,
    ARCHIVE_PANELS.question.h
  );
  image(
    archiveAnswerPanelV2,
    ARCHIVE_PANELS.answer.x,
    ARCHIVE_PANELS.answer.y,
    ARCHIVE_PANELS.answer.w,
    ARCHIVE_PANELS.answer.h
  );
  image(
    archiveRecordPanelV2,
    ARCHIVE_PANELS.record.x,
    ARCHIVE_PANELS.record.y,
    ARCHIVE_PANELS.record.w,
    ARCHIVE_PANELS.record.h
  );

  fill("#F0E6C8");
  textStyle(BOLD);
  textAlign(CENTER, CENTER);
  textSize(34);
  text("CATCH ARCHIVE", 530, 194);
  textAlign(LEFT, BASELINE);

  const visibleEntries = game.inventory.slice(0, 8);
  for (let index = 0; index < visibleEntries.length; index += 1) {
    const slot = getArchiveSlotBounds(index);
    const entry = visibleEntries[index];
    const catchIndex = CATCHES.findIndex((item) => item.id === entry.id);
    drawArchiveCatchSprite(archiveCatchSprites[catchIndex], {
      x: slot.x + 22,
      y: slot.y + 24,
      w: slot.w - 44,
      h: slot.h - 48
    });
    const hovered = pointInRect(mouseX, mouseY, slot);
    if (index === game.archiveSelected) {
      image(archiveSlotFramesV2.selected, slot.x, slot.y, slot.w, slot.h);
    } else if (hovered) {
      image(archiveSlotFramesV2.hover, slot.x, slot.y, slot.w, slot.h);
    }
  }

  if (visibleEntries.length === 0) {
    fill("#F0E6C8");
    textAlign(CENTER, CENTER);
    textStyle(BOLD);
    textSize(28);
    text("NO CATCHES KEPT FOR REVIEW", 530, 520);
    textAlign(LEFT, BASELINE);
  }

  const selectedEntry = visibleEntries[game.archiveSelected];
  if (selectedEntry) {
    const catchData = CATCHES.find((item) => item.id === selectedEntry.id);
    const profile = TACKLE_PROFILES.find((item) => item.id === selectedEntry.tackleId) || null;
    drawArchiveInfoV2(catchData, profile, selectedEntry);
  } else {
    fill("#F02B91");
    textStyle(BOLD);
    textSize(19);
    text("YOUR QUESTION", 1054, 144);
    fill("#F0E6C8");
    textStyle(NORMAL);
    textSize(22);
    textWrap(WORD);
    text("SELECT A SAVED CATCH", 1054, 182, 730, 46);
    fill("#5DD4C8");
    textStyle(BOLD);
    textSize(20);
    text("WHAT SURFACED", 1054, 322);
    fill("#F0E6C8");
    textStyle(NORMAL);
    textSize(24);
    text("Choose one of the eight collection slots to inspect the response and its fishing configuration.", 1054, 366, 730, 180);
  }

  const closeHover = pointInRect(mouseX, mouseY, ARCHIVE_PANELS.close);
  image(
    archiveCloseFramesV2[closeHover ? "hover" : "default"],
    ARCHIVE_PANELS.close.x,
    ARCHIVE_PANELS.close.y,
    ARCHIVE_PANELS.close.w,
    ARCHIVE_PANELS.close.h
  );
  drawUiCenteredText("CLOSE", ARCHIVE_PANELS.close, 24, closeHover ? "#F02B91" : "#F0E6C8", 0);
}

function drawArchiveInfoV2(catchData, profile, selectedEntry) {
  const questionPanel = ARCHIVE_PANELS.question;
  const answerPanel = ARCHIVE_PANELS.answer;
  const recordPanel = ARCHIVE_PANELS.record;
  const questionInset = 190;
  const answerInset = 34;
  const recordInset = 70;

  fill("#F02B91");
  textStyle(BOLD);
  textSize(22);
  text("YOUR QUESTION", questionPanel.x + questionInset, questionPanel.y + 40);
  fill("#F0E6C8");
  textStyle(NORMAL);
  textSize(27);
  text(selectedEntry.question || EXAMPLE_QUESTION, questionPanel.x + questionInset, questionPanel.y + 76, questionPanel.w - questionInset - 48, 56);

  fill("#5DD4C8");
  textStyle(BOLD);
  textSize(24);
  text("WHAT SURFACED", answerPanel.x + answerInset, answerPanel.y + 76);
  fill("#F0E6C8");
  textStyle(NORMAL);
  textSize(30);
  textWrap(WORD);
  text(catchData.candidate, answerPanel.x + answerInset, answerPanel.y + 120, answerPanel.w - answerInset * 2, answerPanel.h - 148);

  fill("#F0C64F");
  textStyle(BOLD);
  textSize(22);
  text("CATCH RECORD", recordPanel.x + recordInset, recordPanel.y + 58);
  fill("#F0E6C8");
  textStyle(NORMAL);
  textSize(24);
  text(`${catchData.name}  /  ${catchData.response}`, recordPanel.x + recordInset, recordPanel.y + 98);
  fill("#8FB7B8");
  textSize(20);
  text(getTackleSummary(profile), recordPanel.x + recordInset, recordPanel.y + 138, recordPanel.w - recordInset - 42, 26);
  textSize(19);
  text(
    `CAST ${String(selectedEntry.cast).padStart(2, "0")}  /  SAVED ${selectedEntry.savedAt}  /  SAVED FOR REVIEW, NOT VERIFIED`,
    recordPanel.x + recordInset,
    recordPanel.y + 176
  );
}

function pointInRect(x, y, bounds) {
  return x >= bounds.x && x <= bounds.x + bounds.w && y >= bounds.y && y <= bounds.y + bounds.h;
}

function getArchiveSlotAt(x, y) {
  const visibleCount = min(8, game.inventory.length);
  for (let index = 0; index < visibleCount; index += 1) {
    const slot = getArchiveSlotBounds(index);
    if (pointInRect(x, y, slot)) return index;
  }
  return -1;
}

function getArchiveSlotBounds(index) {
  const column = index % 4;
  const row = floor(index / 4);
  return {
    x: ARCHIVE_COLLECTION_BOUNDS.x + ARCHIVE_SLOT_LAYOUT.x + column * ARCHIVE_SLOT_LAYOUT.stepX,
    y: ARCHIVE_COLLECTION_BOUNDS.y + ARCHIVE_SLOT_LAYOUT.y + row * ARCHIVE_SLOT_LAYOUT.stepY,
    w: ARCHIVE_SLOT_LAYOUT.w,
    h: ARCHIVE_SLOT_LAYOUT.h
  };
}

function mousePressed() {
  if (game.state === "impact") return false;

  if (game.state === "weather") {
    const weather = WEATHER_CONDITIONS[game.weatherIndex];
    const weatherReady = weather && weatherFrameLoadState[weather.id] === "ready";
    if (weatherReady && pointInRect(mouseX, mouseY, getWeatherButtonBounds())) {
      setState("waterSelect");
    }
    return false;
  }

  if (game.state === "waterSelect") {
    const pointer = getWaterPointer(mouseX, mouseY);
    const locationIndex = getWaterLocationAt(mouseX, mouseY);
    const screen = getWaterMapBounds();
    const confirmScreenHit = {
      x: screen.x + screen.w * 0.66,
      y: screen.y + screen.h * 0.82,
      w: screen.w * 0.34,
      h: screen.h * 0.18
    };
    if (locationIndex >= 0) {
      game.waterIndex = locationIndex;
      game.waterSelectAt = millis();
      updateAccessibleStatus();
    } else if (pointInRect(pointer.x, pointer.y, WATER_SELECT_BOUNDS.back)) {
      returnToWeather();
    } else if (
      pointInRect(pointer.x, pointer.y, WATER_SELECT_BOUNDS.confirm) ||
      pointInRect(mouseX, mouseY, confirmScreenHit)
    ) {
      confirmWaterSelection();
    }
    return false;
  }

  if (game.state === "livingQuestion") {
    if (pointInRect(mouseX, mouseY, LIVING_QUESTION_BOUNDS.input)) {
      game.questionFocused = true;
    } else if (pointInRect(mouseX, mouseY, LIVING_QUESTION_BOUNDS.example)) {
      game.question = EXAMPLE_QUESTION;
      game.questionFocused = true;
      noteQuestionEdit();
    } else if (pointInRect(mouseX, mouseY, LIVING_QUESTION_BOUNDS.confirm)) {
      confirmQuestion();
    } else {
      game.questionFocused = false;
    }
    return false;
  }

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
      setState("livingQuestion");
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
    } else if (game.judgement && pointInRect(mouseX, mouseY, RESULT_BUTTONS.changeLocation)) {
      startLocationChange();
    }
    return false;
  }

  if (game.state === "archive") {
    const slotIndex = getArchiveSlotAt(mouseX, mouseY);
    if (slotIndex >= 0) game.archiveSelected = slotIndex;
    if (pointInRect(mouseX, mouseY, ARCHIVE_PANELS.close)) closeArchive();
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
  if (game.state === "weather" && (keyCode === ENTER || keyCode === RETURN || key === " ")) {
    const weather = WEATHER_CONDITIONS[game.weatherIndex];
    const weatherReady = weather && weatherFrameLoadState[weather.id] === "ready";
    if (weatherReady && millis() - game.stateStarted >= 1700) {
      setState("waterSelect");
    }
    return false;
  }

  if (game.state === "waterSelect") {
    if (keyCode === ESCAPE) {
      returnToWeather();
    } else if (keyCode === LEFT_ARROW || keyCode === UP_ARROW) {
      game.waterIndex = (game.waterIndex + WATER_LOCATIONS.length - 1) % WATER_LOCATIONS.length;
      game.waterSelectAt = millis();
      updateAccessibleStatus();
    } else if (keyCode === RIGHT_ARROW || keyCode === DOWN_ARROW) {
      game.waterIndex = (game.waterIndex + 1) % WATER_LOCATIONS.length;
      game.waterSelectAt = millis();
      updateAccessibleStatus();
    } else if (keyCode === ENTER || keyCode === RETURN || key === " ") {
      if (game.waterIndex < 0) {
        game.waterIndex = 0;
        game.waterSelectAt = millis();
        updateAccessibleStatus();
      } else {
        confirmWaterSelection();
      }
    }
    return false;
  }

  if (["question", "livingQuestion"].includes(game.state)) {
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
    setState("livingQuestion");
    game.questionFocused = true;
    return false;
  }
  if (game.state === "archive" && keyCode === ESCAPE) closeArchive();
  else if (key === "r" || key === "R" || keyCode === ESCAPE) resetCast();
}

function keyTyped() {
  if (!["question", "livingQuestion"].includes(game.state) || !game.questionFocused) return true;
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
  if (game.weatherIndex < 0) game.weatherIndex = floor(random(WEATHER_CONDITIONS.length));
  ensureWeatherSceneFrames(WEATHER_CONDITIONS[game.weatherIndex].id);
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
  game.waterIndex = -1;
  game.waterSelectAt = 0;
  setState("livingQuestion");
}

function startLocationChange() {
  game.waterSelectOrigin = "result";
  game.waterSelectAt = millis();
  game.state = "waterSelect";
  game.stateStarted = millis();
  updateAccessibleStatus();
}

function castLine() {
  game.castPower = constrain(game.charge, 0.16, 1);
  const distance = map(game.castPower, 0.16, 1, 120, 340);
  game.castTarget.y = constrain(790 - distance * 0.42, 545, 745);
  const aimX = constrain(mouseX, 850, 1650);
  const safeCast = clampLureForFish(aimX, game.castTarget.y);
  game.castTarget.x = safeCast.x;
  game.castTarget.y = safeCast.y;
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
    waterId: WATER_LOCATIONS[game.waterIndex]?.id || null,
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
  if (nextState === "weather") {
    game.weatherIndex = floor(random(WEATHER_CONDITIONS.length));
    ensureWeatherFrames(WEATHER_CONDITIONS[game.weatherIndex].id);
    ensureWeatherSceneFrames(WEATHER_CONDITIONS[game.weatherIndex].id);
  }
  if (nextState === "waterSelect") {
    game.waterIndex = -1;
    game.waterSelectAt = 0;
    game.waterSelectOrigin = null;
  }
  game.state = nextState;
  game.stateStarted = millis();
  updateAccessibleStatus();
}

function updateAccessibleStatus() {
  const status = document.querySelector("#gameStatus");
  if (!status) return;

  const messages = {
    introDrink: "A quiet moment before the question forms.",
    introIdea: "An information target is beginning to form.",
    livingQuestion: "Enter the question that will become your target.",
    introRemote: "The angler reaches for the remote.",
    introTv: "The television opens the next part of the process.",
    weather: "An external condition is being reported. It cannot be selected or controlled.",
    waterSelect: game.waterIndex >= 0
      ? `${WATER_LOCATIONS[game.waterIndex].model} selected. Confirm to continue.`
      : "Choose one of three AI models, represented by different waters.",
    toolboxIntro: "The angler opens a tackle box in the adjacent workroom before choosing a prompting configuration.",
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
