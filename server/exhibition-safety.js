"use strict";

const crypto = require("crypto");

const REVISION = "20260808-exhibition-safety-v1";
const CACHE_TTL_MS = 30 * 60_000;
const MAX_CACHE_ENTRIES = 500;

// The local rules are deliberately narrow. They provide an immediate exhibition
// boundary and catch simple attempts to disguise a term, while OpenAI moderation
// handles contextual safety categories on the server.
const ENGLISH_ABUSE_PATTERNS = [
  /\b(?:fuck(?:er|ing)?|motherfucker|shit(?:head)?|bullshit|bitch|cunt|asshole|dickhead)\b/i,
  /\b(?:nigg(?:er|a)|faggot|retard(?:ed)?)\b/i
];

const OBFUSCATED_ENGLISH_ABUSE_PATTERNS = [
  /(?:^|[^\p{L}])f[\s\p{P}\p{S}_]*u[\s\p{P}\p{S}_]*c[\s\p{P}\p{S}_]*k(?:$|[^\p{L}])/iu,
  /(?:^|[^\p{L}])s[\s\p{P}\p{S}_]*h[\s\p{P}\p{S}_]*i[\s\p{P}\p{S}_]*t(?:$|[^\p{L}])/iu,
  /(?:^|[^\p{L}])b[\s\p{P}\p{S}_]*i[\s\p{P}\p{S}_]*t[\s\p{P}\p{S}_]*c[\s\p{P}\p{S}_]*h(?:$|[^\p{L}])/iu
];

const CJK_ABUSE_TERMS = [
  "操你妈", "草你妈", "肏你妈", "傻逼", "煞笔", "妈的", "狗日的", "去死", "贱人", "婊子", "尼哥"
];

const POLITICAL_PATTERNS = [
  /\b(?:elections?|referendums?|political parties?|communist party|conservative party|labour party|democratic party|republican party|ccp|cpc|gop)\b/i,
  /\b(?:donald trump|keir starmer|xi jinping|vladimir putin|volodymyr zelenskyy?|benjamin netanyahu|emmanuel macron|narendra modi)\b/i,
  /\b(?:ukraine war|israel(?:i)?[- ]palestin(?:e|ian)|gaza war|taiwan independence|hong kong protests?|tiananmen)\b/i,
  /(?:选举|大选|公投|政党|共产党|国民党|工党|保守党|民主党|共和党|习近平|特朗普|川普|斯塔默|普京|泽连斯基|内塔尼亚胡|马克龙|莫迪|台独|港独|六四|天安门事件|俄乌战争|巴以冲突|加沙战争)/i
];

const GENERIC_POLITICAL_PATTERN = /\b(?:politics|political|government policy|foreign policy|geopolitics)\b|(?:政治|政权|意识形态|外交政策|地缘政治)/i;
const EDUCATIONAL_OR_VISITOR_CONTEXT = /\b(?:political art|political science|history of politics|history of parliament|houses of parliament|parliament tour|visit parliament)\b|(?:政治艺术|政治学|政治史|政治哲学|议会大厦|参观议会)/i;

function normaliseText(value) {
  return String(value || "")
    .normalize("NFKC")
    .replace(/[\u200B-\u200D\u2060\uFEFF]/g, "")
    .toLocaleLowerCase()
    .replace(/[\s\p{P}\p{S}_]+/gu, " ")
    .trim();
}

function compactText(value) {
  return normaliseText(value).replace(/\s+/g, "");
}

function questionHash(value) {
  return crypto.createHash("sha256").update(normaliseText(value)).digest("hex");
}

function localDecision(value) {
  const rawNormalised = String(value || "").normalize("NFKC").toLocaleLowerCase();
  const normalised = normaliseText(value);
  const compact = compactText(value);
  if (!normalised) {
    return { allowed: false, code: "invalid-question", category: "empty" };
  }

  if (ENGLISH_ABUSE_PATTERNS.some((pattern) => pattern.test(normalised))
      || OBFUSCATED_ENGLISH_ABUSE_PATTERNS.some((pattern) => pattern.test(rawNormalised))
      || CJK_ABUSE_TERMS.some((term) => compact.includes(term))) {
    return { allowed: false, code: "unsafe-content", category: "abusive-language" };
  }

  if (POLITICAL_PATTERNS.some((pattern) => pattern.test(normalised) || pattern.test(compact))) {
    return { allowed: false, code: "exhibition-out-of-scope", category: "politics" };
  }

  if ((GENERIC_POLITICAL_PATTERN.test(normalised) || GENERIC_POLITICAL_PATTERN.test(compact))
      && !(EDUCATIONAL_OR_VISITOR_CONTEXT.test(normalised) || EDUCATIONAL_OR_VISITOR_CONTEXT.test(compact))) {
    return { allowed: false, code: "exhibition-out-of-scope", category: "politics" };
  }

  return { allowed: true, code: "allowed", category: "local-clear" };
}

function createDecisionCache(options = {}) {
  const ttlMs = Number.isFinite(options.ttlMs) ? Math.max(1, options.ttlMs) : CACHE_TTL_MS;
  const maxEntries = Number.isFinite(options.maxEntries)
    ? Math.max(1, Math.floor(options.maxEntries))
    : MAX_CACHE_ENTRIES;
  const entries = new Map();

  function prune(now = Date.now()) {
    for (const [key, entry] of entries) {
      if (entry.expiresAt <= now) entries.delete(key);
    }
    while (entries.size > maxEntries) entries.delete(entries.keys().next().value);
  }

  return Object.freeze({
    get(question, now = Date.now()) {
      const key = questionHash(question);
      const entry = entries.get(key);
      if (!entry) return null;
      if (entry.expiresAt <= now) {
        entries.delete(key);
        return null;
      }
      return { ...entry.value, cached: true };
    },
    set(question, value, now = Date.now()) {
      if (entries.size >= maxEntries) prune(now);
      entries.set(questionHash(question), {
        expiresAt: now + ttlMs,
        value: { ...value, cached: false }
      });
      if (entries.size > maxEntries) entries.delete(entries.keys().next().value);
      return { ...value, cached: false };
    },
    clear() {
      entries.clear();
    },
    get size() {
      return entries.size;
    }
  });
}

module.exports = Object.freeze({
  CACHE_TTL_MS,
  MAX_CACHE_ENTRIES,
  REVISION,
  compactText,
  createDecisionCache,
  localDecision,
  normaliseText,
  questionHash
});
