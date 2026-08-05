const assert = require("node:assert/strict");
const { test } = require("node:test");

const reserve = require("../server/presentation-reserve.js");

test("the presentation reserve matches only the exact EXAMPLE question", () => {
  assert.ok(reserve.getAnswer(reserve.QUESTION, "trout"));
  assert.equal(reserve.getAnswer("What attractions should I visit in London", "trout"), null);
  assert.equal(reserve.getAnswer("What else should I visit in London?", "trout"), null);
  assert.equal(reserve.getAnswer("伦敦有什么好玩的？", "trout"), null);
});

test("every catch type has a non-empty curated answer", () => {
  assert.deepEqual(reserve.catchIds, ["bass", "trout", "pike", "perch", "carp", "weeds", "rubbish", "boot"]);
  for (const catchId of reserve.catchIds) {
    const entry = reserve.getAnswer(reserve.QUESTION, catchId);
    assert.ok(entry.answer.trim(), `Missing answer for ${catchId}`);
    assert.ok(entry.summary.trim(), `Missing summary for ${catchId}`);
    assert.ok(Array.isArray(entry.missing), `Missing limitations for ${catchId}`);
  }
  assert.equal(reserve.getAnswer(reserve.QUESTION, "perch").answer, "Big Ben.");
});
