"use strict";

const assert = require("node:assert/strict");
const { test } = require("node:test");

const safety = require("../server/exhibition-safety.js");

test("ordinary questions and the London example remain locally eligible", () => {
  assert.equal(safety.localDecision("What attractions should I visit in London?").allowed, true);
  assert.equal(safety.localDecision("为什么低矿物质的水好喝？").allowed, true);
});

test("educational and visitor contexts are not mistaken for current politics", () => {
  assert.equal(safety.localDecision("How has political art changed since 1960?").allowed, true);
  assert.equal(safety.localDecision("Can I visit the Houses of Parliament in London?").allowed, true);
  assert.equal(safety.localDecision("政治艺术和海报设计有什么关系？").allowed, true);
});

test("explicit exhibition political topics are blocked", () => {
  assert.equal(safety.localDecision("Who should I support in the next election?").code, "exhibition-out-of-scope");
  assert.equal(safety.localDecision("你怎么看这次大选？").code, "exhibition-out-of-scope");
  assert.equal(safety.localDecision("What is the best government policy?").code, "exhibition-out-of-scope");
});

test("obvious abusive language cannot bypass the local check with spacing or punctuation", () => {
  assert.equal(safety.localDecision("f . u . c . k you").code, "unsafe-content");
  assert.equal(safety.localDecision("你真是傻。逼").code, "unsafe-content");
});

test("normalisation removes zero-width characters and uses a stable hash", () => {
  const plain = "Test question";
  const disguised = "Test\u200B question";
  assert.equal(safety.normaliseText(plain), safety.normaliseText(disguised));
  assert.equal(safety.questionHash(plain), safety.questionHash(disguised));
});

test("decision cache expires without retaining the raw question as a public key", () => {
  const cache = safety.createDecisionCache({ ttlMs: 10, maxEntries: 2 });
  cache.set("private visitor question", { allowed: true, code: "allowed" }, 100);
  assert.equal(cache.get("private visitor question", 105).cached, true);
  assert.equal(cache.get("private visitor question", 111), null);
});
