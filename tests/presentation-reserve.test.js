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

test("the presentation reserve contains ten distinct London cores", () => {
  assert.deepEqual(reserve.catchIds, ["bass", "trout", "pike", "perch", "carp", "weeds", "rubbish", "boot"]);
  assert.equal(reserve.answerCountPerCatch, 10);
  assert.equal(new Set(reserve.coreIds).size, 10);
});

test("ten consecutive mixed catches use ten different semantic cores", () => {
  const select = deterministicSelector();
  const history = [];
  const entries = [];
  for (let index = 0; index < reserve.answerCountPerCatch; index += 1) {
    const entry = select(
      reserve.QUESTION,
      reserve.catchIds[index % reserve.catchIds.length],
      `mixed-${index}`,
      { history, waterId: "daylight-river", promptConfiguration: { type: { name: "DIRECT" } } }
    );
    entries.push(entry);
    history.unshift(entry);
  }
  assert.equal(new Set(entries.map((entry) => entry.answerCoreId)).size, 10);
  for (const entry of entries) {
    assert.ok(entry.answer.trim());
    assert.ok(entry.summary.trim());
    assert.equal(entry.diversityMode, "open");
    assert.ok(entry.answerCoreSummary.trim());
    assert.ok(entry.answerAngleId.trim());
  }
});

test("the same request ID always returns the same answer without advancing the library", () => {
  const select = deterministicSelector();
  const first = select(reserve.QUESTION, "perch", "same-cast");
  const repeated = select(reserve.QUESTION, "perch", "same-cast");
  assert.deepEqual(repeated, first);
});

test("water and tackle routes still influence a protected example answer", () => {
  const direct = deterministicSelector()(reserve.QUESTION, "trout", "direct", {
    waterId: "daylight-river",
    promptConfiguration: { type: { name: "DIRECT" } }
  });
  const searched = deterministicSelector()(reserve.QUESTION, "trout", "searched", {
    waterId: "signal-canal",
    promptConfiguration: { type: { name: "EVIDENCE-LED" } }
  });
  assert.equal(direct.answerCoreId, searched.answerCoreId);
  assert.notEqual(direct.answer, searched.answer);
});
