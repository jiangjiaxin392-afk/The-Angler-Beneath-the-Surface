(function attachServerAi(root, factory) {
  "use strict";

  const exported = factory();
  if (typeof module === "object" && module.exports) module.exports = exported;
  if (root && typeof root.fetch === "function") root.AnglerAI = exported.createAiClient(root);
})(typeof window !== "undefined" ? window : null, function createServerAiModule() {
  "use strict";

  const CLIENT_REVISION = "20260808-answer-diversity-v6";
  const DEFAULT_RECOMMENDATION_TIMEOUT_MS = 30_000;
  const DEFAULT_GENERATION_TIMEOUT_MS = 30_000;

  function createAiError(message, code, details = {}) {
    const error = new Error(message);
    error.code = code;
    if (Number.isFinite(details.status)) error.status = details.status;
    if (Number.isFinite(details.retryAfterSeconds)) {
      error.retryAfterSeconds = details.retryAfterSeconds;
    }
    return error;
  }

  function retryAfterSeconds(response) {
    const rawValue = response?.headers?.get?.("retry-after");
    if (!rawValue) return null;
    const seconds = Number(rawValue);
    if (Number.isFinite(seconds)) return Math.max(0, Math.ceil(seconds));
    const retryAt = Date.parse(rawValue);
    return Number.isFinite(retryAt) ? Math.max(0, Math.ceil((retryAt - Date.now()) / 1000)) : null;
  }

  function responseError(response, data) {
    const status = Number(response?.status) || 0;
    const serverMessage = typeof data?.error === "string" ? data.error.trim() : "";
    if (status === 429) {
      return createAiError(
        serverMessage || "Too many AI requests. Please wait a moment.",
        "rate-limited",
        { status, retryAfterSeconds: retryAfterSeconds(response) }
      );
    }
    if (status === 503) {
      return createAiError(
        "The AI service is not configured or is temporarily unavailable.",
        "service-unavailable",
        { status }
      );
    }
    if (status >= 500) {
      return createAiError(
        "The AI service is temporarily unavailable.",
        "service-unavailable",
        { status }
      );
    }
    return createAiError(serverMessage || `AI request failed (${status || "unknown"}).`, "request-failed", { status });
  }

  function validateRecommendation(data) {
    return Boolean(
      data
      && typeof data === "object"
      && typeof data.waterId === "string"
      && data.waterId.trim()
      && typeof data.tackleId === "string"
      && data.tackleId.trim()
    );
  }

  function validateGeneration(data) {
    return Boolean(
      data
      && typeof data === "object"
      && typeof data.answer === "string"
      && data.answer.trim()
      && ["fixed", "limited", "open"].includes(data.diversityMode)
      && typeof data.answerCoreId === "string"
      && data.answerCoreId.trim()
      && typeof data.answerCoreSummary === "string"
      && data.answerCoreSummary.trim()
      && typeof data.answerAngleId === "string"
      && data.answerAngleId.trim()
      && typeof data.answerAngleSummary === "string"
      && data.answerAngleSummary.trim()
    );
  }

  function createAiClient(globalObject, options = {}) {
    const activeRequests = new Set();
    const sharedTimeoutMs = Number.isFinite(options.timeoutMs) ? Math.max(1, options.timeoutMs) : null;
    const recommendationTimeoutMs = sharedTimeoutMs || (
      Number.isFinite(options.recommendationTimeoutMs)
        ? Math.max(1, options.recommendationTimeoutMs)
        : DEFAULT_RECOMMENDATION_TIMEOUT_MS
    );
    const generationTimeoutMs = sharedTimeoutMs || (
      Number.isFinite(options.generationTimeoutMs)
        ? Math.max(1, options.generationTimeoutMs)
        : DEFAULT_GENERATION_TIMEOUT_MS
    );
    let requestGeneration = 0;

    async function postJson(path, payload, validate, timeoutMs) {
      const controller = new globalObject.AbortController();
      const request = {
        controller,
        cancelled: false,
        generation: requestGeneration,
        timedOut: false
      };
      activeRequests.add(request);
      const timeout = globalObject.setTimeout(() => {
        request.timedOut = true;
        controller.abort();
      }, timeoutMs);

      try {
        let response;
        try {
          response = await globalObject.fetch(path, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
            signal: controller.signal
          });
        } catch (error) {
          if (request.cancelled || request.generation !== requestGeneration) {
            throw createAiError("AI request cancelled.", "cancelled");
          }
          if (request.timedOut || error?.name === "AbortError") {
            throw createAiError("AI request timed out.", "timeout");
          }
          throw createAiError("The AI service could not be reached.", "network");
        }

        const data = await response.json().catch(() => null);
        if (!response.ok) throw responseError(response, data);
        if (request.cancelled || request.generation !== requestGeneration) {
          throw createAiError("AI request cancelled.", "cancelled");
        }
        if (!validate(data)) {
          throw createAiError("The AI service returned an empty or invalid response.", "invalid-response");
        }
        return data;
      } finally {
        globalObject.clearTimeout(timeout);
        activeRequests.delete(request);
      }
    }

    function cancelAll() {
      requestGeneration += 1;
      for (const request of activeRequests) {
        request.cancelled = true;
        request.controller.abort();
      }
      activeRequests.clear();
    }

    return Object.freeze({
      mode: "server",
      revision: CLIENT_REVISION,
      recommend(payload) {
        return postJson("/api/ai/recommend", payload, validateRecommendation, recommendationTimeoutMs);
      },
      generate(payload) {
        return postJson("/api/ai/generate", payload, validateGeneration, generationTimeoutMs);
      },
      cancelAll
    });
  }

  return Object.freeze({
    CLIENT_REVISION,
    createAiClient
  });
});
