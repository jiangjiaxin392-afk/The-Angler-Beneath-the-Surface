(function attachAnglerGameRules(root) {
  "use strict";

  const CATCH_IDS = Object.freeze(["bass", "trout", "pike", "perch", "carp", "weeds", "rubbish", "boot"]);
  const rawWeights = {
    sunny:  { bass: 24, trout: 24, pike: 12, perch: 18, carp: 12, weeds: 4, rubbish: 3, boot: 3 },
    cloudy: { bass: 20, trout: 21, pike: 13, perch: 20, carp: 13, weeds: 5, rubbish: 5, boot: 3 },
    fog:    { bass: 17, trout: 18, pike: 13, perch: 22, carp: 13, weeds: 7, rubbish: 6, boot: 4 },
    rain:   { bass: 17, trout: 18, pike: 13, perch: 22, carp: 12, weeds: 7, rubbish: 7, boot: 4 },
    storm:  { bass: 13, trout: 15, pike: 12, perch: 24, carp: 12, weeds: 9, rubbish: 9, boot: 6 }
  };
  const WEATHER_CATCH_WEIGHTS = Object.freeze(Object.fromEntries(
    Object.entries(rawWeights).map(([weatherId, weights]) => [weatherId, Object.freeze({ ...weights })])
  ));

  function getWeights(weatherId) {
    return WEATHER_CATCH_WEIGHTS[weatherId] || WEATHER_CATCH_WEIGHTS.sunny;
  }

  function getTotalWeight(weatherId) {
    const weights = getWeights(weatherId);
    return CATCH_IDS.reduce((total, catchId) => total + weights[catchId], 0);
  }

  function getCatchProbability(weatherId, catchId) {
    const weights = getWeights(weatherId);
    return (weights[catchId] || 0) / getTotalWeight(weatherId);
  }

  function chooseWeatherCatch(weatherId, roll = Math.random()) {
    const weights = getWeights(weatherId);
    const total = getTotalWeight(weatherId);
    const numericRoll = Number.isFinite(roll) ? roll : Math.random();
    let cursor = Math.min(1 - Number.EPSILON, Math.max(0, numericRoll)) * total;
    for (const catchId of CATCH_IDS) {
      cursor -= weights[catchId];
      if (cursor <= 0) return catchId;
    }
    return CATCH_IDS[CATCH_IDS.length - 1];
  }

  for (const [weatherId, weights] of Object.entries(WEATHER_CATCH_WEIGHTS)) {
    for (const catchId of CATCH_IDS) {
      if (!Number.isFinite(weights[catchId]) || weights[catchId] < 0) {
        throw new Error(`Invalid catch weight for ${weatherId}:${catchId}`);
      }
    }
    if (getTotalWeight(weatherId) !== 100) {
      throw new Error(`Catch weights for ${weatherId} must total 100.`);
    }
  }

  const api = Object.freeze({
    CATCH_IDS,
    WEATHER_CATCH_WEIGHTS,
    chooseWeatherCatch,
    getCatchProbability,
    getTotalWeight,
    getWeights
  });
  root.AnglerGameRules = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
