const assert = require("node:assert/strict");
const { test } = require("node:test");

const reserve = require("../server/presentation-reserve.js");

function deterministicSelector() {
  return reserve.createSelector({ random: () => 0.5 });
}

test("the presentation reserve matches only the exact EXAMPLE question", () => {
  const select = deterministicSelector();
  assert.ok(select(reserve.QUESTION, "trout", "exact"));
  assert.equal(select("What attractions should I visit in London", "trout", "no-mark"), null);
  assert.equal(select("What else should I visit in London?", "trout", "different"), null);
  assert.equal(select("伦敦有什么好玩的？", "trout", "chinese"), null);
});

test("every catch type has four non-empty curated answers", () => {
  assert.deepEqual(reserve.catchIds, ["bass", "trout", "pike", "perch", "carp", "weeds", "rubbish", "boot"]);
  assert.equal(reserve.answerCountPerCatch, 4);
  for (const catchId of reserve.catchIds) {
    const select = deterministicSelector();
    const entries = Array.from({ length: reserve.answerCountPerCatch }, (_, index) => (
      select(reserve.QUESTION, catchId, `${catchId}-${index}`)
    ));
    assert.equal(new Set(entries.map((entry) => entry.answer)).size, 4, `Repeated answer in ${catchId}`);
    for (const entry of entries) {
      assert.ok(entry.answer.trim(), `Missing answer for ${catchId}`);
      assert.ok(entry.summary.trim(), `Missing summary for ${catchId}`);
      assert.ok(Array.isArray(entry.missing), `Missing limitations for ${catchId}`);
    }
  }
});

test("a new cycle never immediately repeats the previous answer", () => {
  for (const catchId of reserve.catchIds) {
    const select = deterministicSelector();
    const answers = Array.from({ length: 9 }, (_, index) => (
      select(reserve.QUESTION, catchId, `${catchId}-cycle-${index}`).answer
    ));
    for (let index = 1; index < answers.length; index += 1) {
      assert.notEqual(answers[index], answers[index - 1], `Immediate repeat in ${catchId}`);
    }
  }
});

test("the same request ID always returns the same answer without advancing the library", () => {
  const select = deterministicSelector();
  const first = select(reserve.QUESTION, "perch", "same-cast");
  const repeated = select(reserve.QUESTION, "perch", "same-cast");
  assert.deepEqual(repeated, first);

  const following = Array.from({ length: 3 }, (_, index) => (
    select(reserve.QUESTION, "perch", `next-cast-${index}`).answer
  ));
  assert.equal(new Set([first.answer, ...following]).size, 4);
});
