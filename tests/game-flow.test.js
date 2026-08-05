const assert = require("node:assert/strict");
const { test } = require("node:test");

const flow = require("../public/js/game-flow.js");

test("TV cutscene skips reach weather without interrupting static", () => {
  assert.equal(flow.getSkipTarget("introRemote"), "weather");
  assert.equal(flow.getSkipTarget("introTv"), "weather");
  const plan = flow.getTransitionPlan("introTv", flow.getSkipTarget("introTv"));
  assert.equal(plan.stopTvStatic, false);
  assert.equal(plan.startTvStatic, true);
  assert.equal(plan.stopTubeTvOpening, true);
});

test("unknown states do not expose a cutscene skip target", () => {
  assert.equal(flow.getSkipTarget("ready"), null);
});

test("new target returns to question entry and leaves fishing audio", () => {
  assert.equal(flow.FLOW_TARGETS.NEW_TARGET, "livingQuestion");
  const plan = flow.getTransitionPlan("result", flow.FLOW_TARGETS.NEW_TARGET);
  assert.equal(plan.stopFishingMusic, true);
  assert.equal(plan.startFishingMusic, false);
  assert.equal(plan.startTvStatic, false);
});

test("change location moves from result audio to TV static", () => {
  const plan = flow.getTransitionPlan("result", "waterSelect");
  assert.equal(plan.stopFishingMusic, true);
  assert.equal(plan.startTvStatic, true);
});

test("water selection returns to result when opened from a catch", () => {
  assert.equal(flow.getWaterSelectionReturnState({ origin: "result" }), "result");
  assert.equal(flow.getWaterSelectionReturnState({ hasCurrentCatch: true }), "result");
  const plan = flow.getTransitionPlan("waterSelect", "result");
  assert.equal(plan.stopTvStatic, true);
  assert.equal(plan.startFishingMusic, false);
});

test("initial water selection continues to weather", () => {
  assert.equal(flow.getWaterSelectionReturnState(), "weather");
  assert.equal(flow.getWaterSelectionReturnState({ origin: "question" }), "weather");
});

test("home navigation keeps only the pathname so the session resets", () => {
  assert.equal(
    flow.getHomePathname({ pathname: "/game", search: "?preview=result", hash: "#debug" }),
    "/game"
  );
  assert.equal(flow.getHomePathname({}), "/");
  assert.equal(flow.FLOW_TARGETS.HOME, "cover");
});

test("landing starts once from hooked and remains active through result", () => {
  assert.equal(flow.getSkipTarget("impact"), "result");
  assert.equal(flow.FLOW_TARGETS.LANDING_COMPLETE, "result");

  const impactPlan = flow.getTransitionPlan("hooked", "impact");
  assert.equal(impactPlan.stopFishHook, true);
  assert.equal(impactPlan.stopFishingReel, true);
  assert.equal(impactPlan.startLanding, true);
  assert.equal(impactPlan.stopFishingMusic, false);

  const resultPlan = flow.getTransitionPlan("impact", "result");
  assert.equal(resultPlan.stopLanding, false);
  assert.equal(resultPlan.startLanding, false);
  assert.equal(resultPlan.stopFishingMusic, false);
});

test("charging to flying stops charge sound but keeps scene music", () => {
  const plan = flow.getTransitionPlan("charging", "flying");
  assert.equal(plan.stopRodCharge, true);
  assert.equal(plan.stopFishingMusic, false);
  assert.equal(plan.startFishingMusic, true);
});

test("only OpenAI or the exact presentation reserve can produce a catch", () => {
  assert.equal(flow.isPlayableGeneratedAnswer("openai", "Live answer"), true);
  assert.equal(flow.isPlayableGeneratedAnswer("presentation-reserve", "Curated answer"), true);
  assert.equal(flow.isPlayableGeneratedAnswer("fallback", "Local answer"), false);
  assert.equal(flow.isPlayableGeneratedAnswer("ai-error", "Signal lost"), false);
  assert.equal(flow.isPlayableGeneratedAnswer("openai", "   "), false);
});

test("a bite waits for both weather timing and a live answer", () => {
  assert.equal(flow.shouldBeginBite(4.1, 4, "openai", "Ready"), true);
  assert.equal(flow.shouldBeginBite(4.1, 4, "presentation-reserve", "Ready"), true);
  assert.equal(flow.shouldBeginBite(3.9, 4, "openai", "Ready"), false);
  assert.equal(flow.shouldBeginBite(4.1, 4, "ai-pending", null), false);
  assert.equal(flow.shouldBeginBite(4.1, 4, "fallback", "Local answer"), false);
});

test("unknown game states recover to the cover", () => {
  const plan = flow.getStateIntegrityPlan({ state: "blankTelevision" });
  assert.equal(plan.state, "cover");
  assert.deepEqual(plan.reasons, ["unknown-state"]);
});

test("result without a catch recovers to a complete ready state", () => {
  const plan = flow.getStateIntegrityPlan({
    state: "result",
    currentCatchId: null,
    validCatchIds: ["bass", "perch"],
    weatherIndex: -1,
    weatherCount: 5,
    waterIndex: 99,
    waterCount: 3,
    selectedTackleId: null,
    validTackleIds: ["direct"]
  });
  assert.equal(plan.state, "ready");
  assert.equal(plan.weatherIndex, 0);
  assert.equal(plan.waterIndex, 0);
  assert.equal(plan.selectedTackleId, "direct");
  assert.deepEqual(plan.reasons, ["missing-catch", "invalid-weather", "invalid-water", "invalid-tackle"]);
});

test("an invalid catch is cleared before entering a catch-required state", () => {
  const plan = flow.getStateIntegrityPlan({
    state: "impact",
    currentCatchId: "not-a-fish",
    validCatchIds: ["bass"],
    weatherIndex: 0,
    weatherCount: 1,
    waterIndex: 0,
    waterCount: 1,
    selectedTackleId: "direct",
    validTackleIds: ["direct"]
  });
  assert.equal(plan.state, "ready");
  assert.equal(plan.clearCurrentCatch, true);
  assert.deepEqual(plan.reasons, ["missing-catch"]);
});

test("water selection keeps no selection but rejects out-of-range values", () => {
  const emptySelection = flow.getStateIntegrityPlan({
    state: "waterSelect",
    waterIndex: -1,
    waterCount: 3
  });
  assert.equal(emptySelection.changed, false);

  const invalidSelection = flow.getStateIntegrityPlan({
    state: "waterSelect",
    waterIndex: 12,
    waterCount: 3
  });
  assert.equal(invalidSelection.waterIndex, -1);
  assert.deepEqual(invalidSelection.reasons, ["invalid-water-selection"]);
});
