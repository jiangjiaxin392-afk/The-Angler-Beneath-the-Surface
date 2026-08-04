const assert = require("node:assert/strict");
const { test } = require("node:test");

const shaper = require("../public/js/catch-answer-shaper.js");

test("perch answers become an ultra-short Chinese phrase", () => {
  assert.equal(shaper.shapeAnswer("答案是大本钟，因为它很有代表性。", "perch"), "大本钟");
});

test("perch answers keep at most four English words", () => {
  assert.equal(shaper.shapeAnswer("Low mineral content makes it taste softer.", "perch"), "Low mineral content makes");
});

test("rubbish answers remain related but visibly chaotic", () => {
  const answer = shaper.shapeAnswer("先比较价格。再看距离。然后看时间。最后决定路线。", "rubbish");
  assert.match(answer, /先等等/);
  assert.match(answer, /不对/);
});

test("weeds answers visibly abandon the original question", () => {
  const answer = shaper.shapeAnswer("伦敦可以先去大本钟。", "weeds");
  assert.match(answer, /^先提一句/);
  assert.match(answer, /原来的问题/);
});

test("current and compatible server revisions prevent double shaping", () => {
  const original = "已经整形的答案";
  assert.equal(shaper.shapeResponseAnswer({ answer: original, answerShapeApplied: true }, "rubbish"), original);
  assert.equal(shaper.responseHasShape({ revision: "20260804-catch-shape-v4" }, "weeds"), true);
});
