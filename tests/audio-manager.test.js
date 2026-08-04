const assert = require("node:assert/strict");
const { test } = require("node:test");

const audio = require("../public/js/audio-manager.js");

function createAudioMock() {
  return {
    currentTime: 8,
    loop: false,
    paused: true,
    pauseCalls: 0,
    playCalls: 0,
    volume: 1,
    pause() {
      this.pauseCalls += 1;
      this.paused = true;
    },
    play() {
      this.playCalls += 1;
      this.paused = false;
      return Promise.resolve();
    }
  };
}

test("audio stop pauses and rewinds safely", () => {
  const element = createAudioMock();
  assert.equal(audio.stop(element), true);
  assert.equal(element.pauseCalls, 1);
  assert.equal(element.currentTime, 0);
});

test("audio play can restart and configure an element", () => {
  const element = createAudioMock();
  audio.play(element, { loop: true, restart: true, volume: 0.5 });
  assert.equal(element.pauseCalls, 1);
  assert.equal(element.playCalls, 1);
  assert.equal(element.currentTime, 0);
  assert.equal(element.loop, true);
  assert.equal(element.volume, 0.5);
});

test("loop playback does not retrigger an element that is already playing", () => {
  const element = createAudioMock();
  element.paused = false;
  audio.play(element, { loop: true, onlyIfPaused: true, volume: 0.4 });
  assert.equal(element.playCalls, 0);
});

test("audio play failures do not escape into the game loop", () => {
  const element = createAudioMock();
  const failures = [];
  element.play = () => {
    throw new Error("playback blocked");
  };
  assert.doesNotThrow(() => audio.play(element, { onFailure: (error) => failures.push(error.message) }));
  assert.deepEqual(failures, ["playback blocked"]);
});

test("rejected playback promises trigger one safe recovery", async () => {
  const element = createAudioMock();
  const failures = [];
  element.play = () => Promise.reject(new Error("file unavailable"));
  audio.play(element, { onFailure: (error) => failures.push(error.message) });
  await new Promise((resolve) => setImmediate(resolve));
  assert.deepEqual(failures, ["file unavailable"]);
});

test("missing audio can fall through to the next sequence step", () => {
  let recovered = 0;
  assert.equal(audio.play(null, { onFailure: () => { recovered += 1; } }), null);
  assert.equal(recovered, 1);
});

test("audio volume is clamped to the browser range", () => {
  const element = createAudioMock();
  audio.configure(element, { volume: 2 });
  assert.equal(element.volume, 1);
  audio.configure(element, { volume: -1 });
  assert.equal(element.volume, 0);
});

test("stop tolerates broken media elements", () => {
  const element = createAudioMock();
  element.pause = () => {
    throw new Error("media detached");
  };
  assert.doesNotThrow(() => audio.stop(element));
  assert.equal(audio.stop(element), false);
});

test("stopAll clears every available sound without failing on null entries", () => {
  const first = createAudioMock();
  const second = createAudioMock();
  assert.equal(audio.stopAll([first, null, second]), 2);
  assert.equal(first.pauseCalls, 1);
  assert.equal(second.pauseCalls, 1);
});
