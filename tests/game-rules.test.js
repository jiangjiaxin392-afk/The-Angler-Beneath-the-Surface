const assert = require("node:assert/strict");
const { test } = require("node:test");

const rules = require("../public/js/game-rules.js");

test("every weather catch table totals exactly 100", () => {
  for (const weatherId of Object.keys(rules.WEATHER_CATCH_WEIGHTS)) {
    assert.equal(rules.getTotalWeight(weatherId), 100);
  }
});

test("perch probability rises from clear weather to storms", () => {
  const probabilities = Object.fromEntries(
    Object.keys(rules.WEATHER_CATCH_WEIGHTS).map((weatherId) => [weatherId, rules.getCatchProbability(weatherId, "perch")])
  );
  assert.deepEqual(probabilities, {
    sunny: 0.18,
    cloudy: 0.20,
    fog: 0.22,
    rain: 0.22,
    storm: 0.24
  });
});

test("weighted selection follows stable catch-order boundaries", () => {
  assert.equal(rules.chooseWeatherCatch("sunny", 0), "bass");
  assert.equal(rules.chooseWeatherCatch("sunny", 0.240001), "trout");
  assert.equal(rules.chooseWeatherCatch("sunny", 0.600001), "perch");
  assert.equal(rules.chooseWeatherCatch("sunny", 1), "boot");
});

test("unknown weather safely uses the sunny table", () => {
  assert.equal(rules.getWeights("unknown"), rules.WEATHER_CATCH_WEIGHTS.sunny);
  assert.equal(rules.chooseWeatherCatch("unknown", 0), "bass");
});
