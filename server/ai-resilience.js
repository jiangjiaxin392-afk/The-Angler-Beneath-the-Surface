"use strict";

const crypto = require("node:crypto");

const retryLimits = Object.freeze({
  "invalid-json": 3,
  "no-readable-output": 3,
  "provider-refusal": 3,
  "quality-rejected": 3,
  "timeout": 2,
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

function emergencyAnswer(question, catchId) {
  const usesChinese = /[\u3400-\u9fff]/u.test(String(question || ""));
  const answers = usesChinese
    ? {
        default: "AI 信号中断，未能生成答案。请再次抛投重试。",
        boot: "服务未能生成当前答案，因此这次结果无法验证。",
        perch: "信号中断",
        rubbish: "信号来了——等等，不对；先是碎片，又回到开头，最后仍没有结论。",
        weeds: "信号刚碰到问题就偏离了方向，最后没有回到可用答案。"
      }
    : {
        default: "The AI signal dropped before an answer arrived. Cast again to retry.",
        boot: "The service could not produce a current answer, so this result cannot be verified.",
        perch: "Signal lost",
        rubbish: "The signal arrived—wait, no; fragments first, back to the start, then nothing conclusive.",
        weeds: "The signal touched the question, drifted away, and never returned to a usable answer."
      };
  return answers[catchId] || answers.default;
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
