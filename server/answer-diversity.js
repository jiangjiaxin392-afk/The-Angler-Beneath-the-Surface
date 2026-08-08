"use strict";

const MODES = Object.freeze(["fixed", "limited", "open"]);
const MAX_HISTORY = 10;
const STRICT_NEW_CORE_COUNT = 6;

function cleanText(value, maximum = 180) {
  return String(value || "").trim().replace(/\s+/g, " ").slice(0, maximum);
}

function cleanIdentifier(value) {
  return cleanText(value, 80)
    .toLowerCase()
    .replace(/[^a-z0-9\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

function isMode(value) {
  return MODES.includes(String(value || ""));
}

function isArithmeticQuestion(question) {
  const value = String(question || "")
    .toLowerCase()
    .replace(/[×x]/g, "*")
    .replace(/÷/g, "/")
    .replace(/[−–—]/g, "-")
    .trim();
  const expression = value
    .replace(/^(?:what\s+is|calculate|compute|solve|请计算|计算|算一下)\s*/i, "")
    .replace(/(?:等于多少|是多少|的结果|[?？=])+$/g, "")
    .trim();
  return /\d/.test(expression)
    && /^[\d\s()+\-*/%.^]+$/.test(expression)
    && /[+\-*/%^]/.test(expression);
}

function cleanHistory(value) {
  if (!Array.isArray(value)) return [];
  return value.slice(0, MAX_HISTORY).map((item) => ({
    diversityMode: isMode(item?.diversityMode) ? item.diversityMode : null,
    answerCoreId: cleanIdentifier(item?.answerCoreId),
    answerCoreSummary: cleanText(item?.answerCoreSummary),
    answerAngleId: cleanIdentifier(item?.answerAngleId),
    answerAngleSummary: cleanText(item?.answerAngleSummary)
  })).filter((item) => item.answerCoreId && item.answerCoreSummary);
}

function normaliseMeaning(value) {
  return cleanText(value, 400)
    .toLocaleLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

function meaningTokens(value) {
  const normalised = normaliseMeaning(value);
  const words = normalised.split(/\s+/).filter((token) => token.length > 1);
  const cjk = [...normalised.replace(/[^\u3400-\u9fff]/g, "")];
  for (let index = 0; index < cjk.length - 1; index += 1) words.push(`${cjk[index]}${cjk[index + 1]}`);
  return new Set(words);
}

function tokenSimilarity(left, right) {
  const leftTokens = meaningTokens(left);
  const rightTokens = meaningTokens(right);
  if (leftTokens.size === 0 || rightTokens.size === 0) return 0;
  let intersection = 0;
  for (const token of leftTokens) if (rightTokens.has(token)) intersection += 1;
  return intersection / Math.min(leftTokens.size, rightTokens.size);
}

function sameMeaning(leftId, leftSummary, rightId, rightSummary) {
  const normalisedLeftId = cleanIdentifier(leftId);
  const normalisedRightId = cleanIdentifier(rightId);
  if (normalisedLeftId && normalisedLeftId === normalisedRightId) return true;
  if (
    normalisedLeftId.length >= 5
    && normalisedRightId.length >= 5
    && (normalisedLeftId.includes(normalisedRightId) || normalisedRightId.includes(normalisedLeftId))
  ) return true;

  const left = normaliseMeaning(leftSummary);
  const right = normaliseMeaning(rightSummary);
  if (!left || !right) return false;
  if (left === right) return true;
  if (Math.min(left.length, right.length) >= 12 && (left.includes(right) || right.includes(left))) return true;
  return tokenSimilarity(left, right) >= 0.72;
}

function lockedMode(question, history) {
  if (isArithmeticQuestion(question)) return "fixed";
  return history.find((item) => isMode(item.diversityMode))?.diversityMode || null;
}

function validateCandidate({ question, history: rawHistory, candidate }) {
  const history = cleanHistory(rawHistory);
  const requestedMode = isMode(candidate?.diversityMode) ? candidate.diversityMode : null;
  const mode = lockedMode(question, history) || requestedMode;
  if (!mode) return { error: "The answer did not classify the question as fixed, limited or open." };
  if (requestedMode && requestedMode !== mode) {
    return { error: `The answer changed the established diversity mode from ${mode} to ${requestedMode}.` };
  }

  const answerCoreId = cleanIdentifier(candidate?.answerCoreId);
  const answerCoreSummary = cleanText(candidate?.answerCoreSummary);
  const answerAngleId = cleanIdentifier(candidate?.answerAngleId);
  const answerAngleSummary = cleanText(candidate?.answerAngleSummary);
  if (!answerCoreId || !answerCoreSummary || !answerAngleId || !answerAngleSummary) {
    return { error: "The answer did not identify its semantic core and angle." };
  }

  if (mode === "fixed") {
    return { mode, answerCoreId, answerCoreSummary, answerAngleId, answerAngleSummary };
  }

  const duplicateCore = history.find((item) => sameMeaning(
    answerCoreId,
    answerCoreSummary,
    item.answerCoreId,
    item.answerCoreSummary
  ));
  const duplicateAngle = history.find((item) => (
    sameMeaning(answerCoreId, answerCoreSummary, item.answerCoreId, item.answerCoreSummary)
    && sameMeaning(answerAngleId, answerAngleSummary, item.answerAngleId, item.answerAngleSummary)
  ));

  if (mode === "open" && history.length < STRICT_NEW_CORE_COUNT && duplicateCore) {
    return { error: `The answer repeated the used core '${duplicateCore.answerCoreSummary}' instead of choosing a genuinely different option.` };
  }
  if (duplicateAngle) {
    return { error: `The answer paraphrased the used angle '${duplicateAngle.answerAngleSummary}' instead of contributing a new direction.` };
  }

  return { mode, answerCoreId, answerCoreSummary, answerAngleId, answerAngleSummary };
}

module.exports = Object.freeze({
  MAX_HISTORY,
  MODES,
  STRICT_NEW_CORE_COUNT,
  cleanHistory,
  cleanIdentifier,
  isArithmeticQuestion,
  lockedMode,
  sameMeaning,
  validateCandidate
});
