(function attachAnglerAudio(root) {
  "use strict";

  function configure(element, options = {}) {
    if (!element) return null;
    try {
      if (typeof options.loop === "boolean") element.loop = options.loop;
      if (Number.isFinite(options.volume)) element.volume = Math.min(1, Math.max(0, options.volume));
    } catch {
      return null;
    }
    return element;
  }

  function rewind(element, time = 0) {
    if (!element) return false;
    try {
      element.currentTime = time;
      return true;
    } catch {
      return false;
    }
  }

  function stop(element, options = {}) {
    if (!element) return false;
    try {
      element.pause();
    } catch {
      return false;
    }
    if (options.rewind !== false) rewind(element, options.time || 0);
    configure(element, options);
    return true;
  }

  function notifyFailure(options, error) {
    if (typeof options.onFailure !== "function") return;
    try {
      options.onFailure(error);
    } catch {
      // Audio recovery must never interrupt the game loop.
    }
  }

  function play(element, options = {}) {
    if (!element) {
      notifyFailure(options, new Error("Audio element is unavailable."));
      return null;
    }
    if (options.onlyIfPaused && !element.paused) return null;
    if (options.restart) stop(element);
    if (!configure(element, options)) {
      notifyFailure(options, new Error("Audio element could not be configured."));
      return null;
    }
    let attempt;
    try {
      attempt = element.play();
    } catch (error) {
      notifyFailure(options, error);
      return null;
    }
    if (attempt && typeof attempt.catch === "function") {
      attempt.catch((error) => notifyFailure(options, error));
    }
    return attempt || null;
  }

  function stopAll(elements, options = {}) {
    if (!elements || typeof elements[Symbol.iterator] !== "function") return 0;
    let stopped = 0;
    for (const element of elements) {
      if (stop(element, options)) stopped += 1;
    }
    return stopped;
  }

  const api = Object.freeze({ configure, play, rewind, stop, stopAll });
  root.AnglerAudio = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
