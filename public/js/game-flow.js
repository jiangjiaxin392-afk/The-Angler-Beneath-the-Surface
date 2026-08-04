(function attachAnglerGameFlow(root) {
  "use strict";

  const STATE_GROUPS = Object.freeze({
    tvStatic: Object.freeze(["introTv", "weather", "waterSelect"]),
    fishingMusic: Object.freeze([
      "ready", "charging", "flying", "waiting", "bite", "hooked",
      "impact", "result", "archive", "failed"
    ]),
    fishingMusicStart: Object.freeze([
      "ready", "charging", "flying", "waiting", "bite", "hooked"
    ]),
    fishHook: Object.freeze(["bite", "hooked"]),
    fishingReel: Object.freeze(["hooked"]),
    landing: Object.freeze(["impact", "result"])
  });

  const CUTSCENE_TARGETS = Object.freeze({
    introDrink: "livingQuestion",
    introIdea: "livingQuestion",
    introRemote: "weather",
    introTv: "weather",
    toolboxIntro: "tackle",
    impact: "result"
  });

  const FLOW_TARGETS = Object.freeze({
    NEW_TARGET: "livingQuestion",
    LANDING_COMPLETE: "result",
    HOME: "cover"
  });

  const HOME_BUTTON_STATES = Object.freeze([
    "ready", "charging", "flying", "waiting", "bite", "hooked",
    "failed", "result", "archive"
  ]);

  const KNOWN_STATES = Object.freeze([
    "cover", "howTo", "introDrink", "introIdea", "livingQuestion", "introRemote",
    "introTv", "weather", "waterSelect", "toolboxIntro", "tackle", "question",
    "ready", "charging", "flying", "waiting", "bite", "hooked", "impact",
    "awaitingAnswer", "failed", "result", "archive"
  ]);

  const FISHING_CONTEXT_STATES = Object.freeze([
    "ready", "charging", "flying", "waiting", "bite", "hooked", "impact",
    "awaitingAnswer", "failed", "result", "archive"
  ]);

  const CATCH_REQUIRED_STATES = Object.freeze(["impact", "awaitingAnswer", "result"]);

  function isIn(groupName, state) {
    return STATE_GROUPS[groupName].includes(state);
  }

  function getSkipTarget(state) {
    return CUTSCENE_TARGETS[state] || null;
  }

  function getWaterSelectionReturnState({ origin = null, hasCurrentCatch = false } = {}) {
    return origin === "result" || hasCurrentCatch ? "result" : "weather";
  }

  function getHomePathname(locationLike = {}) {
    return typeof locationLike.pathname === "string" && locationLike.pathname
      ? locationLike.pathname
      : "/";
  }

  function isValidIndex(index, count) {
    return Number.isInteger(index) && index >= 0 && index < count;
  }

  function getStateIntegrityPlan(snapshot = {}) {
    const catchIds = Array.isArray(snapshot.validCatchIds) ? snapshot.validCatchIds : [];
    const tackleIds = Array.isArray(snapshot.validTackleIds) ? snapshot.validTackleIds : [];
    const weatherCount = Number.isInteger(snapshot.weatherCount) ? snapshot.weatherCount : 0;
    const waterCount = Number.isInteger(snapshot.waterCount) ? snapshot.waterCount : 0;
    const requestedState = typeof snapshot.state === "string" ? snapshot.state : "cover";
    const knownState = KNOWN_STATES.includes(requestedState);
    let state = knownState ? requestedState : "cover";
    let weatherIndex = snapshot.weatherIndex;
    let waterIndex = snapshot.waterIndex;
    let selectedTackleId = snapshot.selectedTackleId ?? null;
    const catchId = typeof snapshot.currentCatchId === "string" ? snapshot.currentCatchId : null;
    const validCatch = Boolean(catchId && catchIds.includes(catchId));
    const clearCurrentCatch = Boolean(catchId && !validCatch);
    const reasons = [];

    if (!knownState) reasons.push("unknown-state");

    if (CATCH_REQUIRED_STATES.includes(state) && !validCatch) {
      state = "ready";
      reasons.push("missing-catch");
    }

    if (state === "weather" || FISHING_CONTEXT_STATES.includes(state)) {
      if (!isValidIndex(weatherIndex, weatherCount)) {
        weatherIndex = weatherCount > 0 ? 0 : -1;
        reasons.push("invalid-weather");
      }
    }

    if (FISHING_CONTEXT_STATES.includes(state)) {
      if (!isValidIndex(waterIndex, waterCount)) {
        waterIndex = waterCount > 0 ? 0 : -1;
        reasons.push("invalid-water");
      }
      if (!tackleIds.includes(selectedTackleId)) {
        selectedTackleId = tackleIds[0] || null;
        reasons.push("invalid-tackle");
      }
    } else if (state === "waterSelect" && waterIndex !== -1 && !isValidIndex(waterIndex, waterCount)) {
      waterIndex = -1;
      reasons.push("invalid-water-selection");
    }

    return Object.freeze({
      state,
      weatherIndex,
      waterIndex,
      selectedTackleId,
      clearCurrentCatch,
      changed: reasons.length > 0,
      reasons: Object.freeze(reasons)
    });
  }

  function getTransitionPlan(currentState, nextState, context = {}) {
    const leavingFishHook = isIn("fishHook", currentState) && !isIn("fishHook", nextState);
    const enteringFishHook = !isIn("fishHook", currentState) && isIn("fishHook", nextState);
    const leavingFishingReel = isIn("fishingReel", currentState) && !isIn("fishingReel", nextState);
    const enteringFishingReel = !isIn("fishingReel", currentState) && isIn("fishingReel", nextState);
    const leavingLanding = isIn("landing", currentState) && !isIn("landing", nextState);
    const enteringLanding = !isIn("landing", currentState) && nextState === "impact";

    return Object.freeze({
      stopRodCharge: currentState === "charging" && nextState !== "charging",
      stopFishHook: leavingFishHook,
      startFishHook: enteringFishHook,
      stopFishingReel: leavingFishingReel,
      startFishingReel: enteringFishingReel,
      stopLanding: leavingLanding,
      startLanding: enteringLanding,
      stopFishingMusic: isIn("fishingMusic", currentState) && !isIn("fishingMusic", nextState),
      startFishingMusic: isIn("fishingMusicStart", nextState),
      stopTvStatic: isIn("tvStatic", currentState) && !isIn("tvStatic", nextState),
      startTvStatic: isIn("tvStatic", nextState),
      stopBeerOpening: currentState === "introDrink" && nextState !== "introDrink",
      stopDrinking: currentState === "introDrink" && nextState !== "introDrink",
      stopIdeaHmm: currentState === "introDrink"
        && nextState !== "introDrink"
        && nextState !== "introIdea"
        && Boolean(context.ideaHmmSoundPrestarted),
      stopRemoteButton: currentState === "introRemote" && nextState !== "introRemote",
      stopTubeTvOpening: (
        currentState === "introRemote"
        && nextState !== "introRemote"
        && nextState !== "introTv"
        && Boolean(context.tubeTvOpeningSoundPrestarted)
      ) || (currentState === "introTv" && nextState !== "introTv"),
      stopToolboxOpening: currentState === "toolboxIntro" && nextState !== "toolboxIntro",
      stopToolboxRummaging: (
        currentState === "toolboxIntro"
        && nextState !== "toolboxIntro"
        && nextState !== "tackle"
      ) || (currentState === "tackle" && nextState !== "tackle"),
      startToolboxOpening: nextState === "toolboxIntro",
      startToolboxRummaging: nextState === "tackle",
      resetRemoteButtonIndex: nextState === "introRemote",
      playTubeTvOpening: nextState === "introTv" && !context.tubeTvOpeningSoundPrestarted,
      playIdeaHmm: nextState === "introIdea" && !context.ideaHmmSoundPrestarted
    });
  }

  const api = Object.freeze({
    STATE_GROUPS,
    CUTSCENE_TARGETS,
    FLOW_TARGETS,
    HOME_BUTTON_STATES,
    getSkipTarget,
    getWaterSelectionReturnState,
    getHomePathname,
    getStateIntegrityPlan,
    getTransitionPlan
  });

  root.AnglerGameFlow = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
