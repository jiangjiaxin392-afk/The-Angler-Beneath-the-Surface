"use strict";

const crypto = require("node:crypto");
const { emergencyAnswer } = require("../public/js/emergency-answer.js");

const retryLimits = Object.freeze({
  "invalid-json": 3,
  "no-readable-output": 3,
  "provider-refusal": 3,
  "quality-rejected": 3,
  "timeout": 1,
  "upstream-rate-limited": 2,
  "upstream-service": 2,
  "upstream-http": 2,
  "not-configured": 1,
  "upstream-auth": 1
});

function failureCode(error) {
  const value = String(error?.failureCode || "unknown-failure");
  return /^[a-z0-9-]{1,48}$/.test(value) ? value : "unknown-failure";
}

function retryLimit(error) {
  return retryLimits[failureCode(error)] || 2;
}

function buildEmergencyGeneration({ question, catchId, requestId, revision, detailLevel, error, attempts }) {
  const answer = emergencyAnswer(question, catchId);
  return {
    source: "fallback",
    status: "fallback",
    revision,
    answerShapeApplied: true,
    answerShapeRevision: revision,
    requestId,
    answer,
    summary: "OpenAI did not return a usable response; a local exhibition fallback kept this cast playable.",
    missing: ["LIVE AI ANSWER"],
    answerFingerprint: crypto.createHash("sha256").update(answer).digest("hex").slice(0, 20),
    answerDetailLevel: detailLevel,
    model: null,
    responseId: null,
    failureCode: failureCode(error),
    attempts
  };
}

module.exports = Object.freeze({
  buildEmergencyGeneration,
  emergencyAnswer,
  failureCode,
  retryLimit
});
