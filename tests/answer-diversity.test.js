const assert = require("node:assert/strict");
const { test } = require("node:test");

const diversity = require("../server/answer-diversity.js");

function candidate(overrides = {}) {
  return {
    diversityMode: "open",
    answerCoreId: "big-ben",
    answerCoreSummary: "Visit Big Ben for an iconic London landmark",
    answerAngleId: "big-ben-architecture",
    answerAngleSummary: "Focus on the clock tower's architecture",
    ...overrides
  };
}

test("simple arithmetic locks to fixed mode and may repeat its canonical core", () => {
  const history = [candidate({
    diversityMode: "fixed",
    answerCoreId: "answer-two",
    answerCoreSummary: "The result is two",
    answerAngleId: "canonical-result",
    answerAngleSummary: "Give the canonical result"
  })];
  const result = diversity.validateCandidate({
    question: "1 + 1 = ?",
    history,
    candidate: history[0]
  });
  assert.equal(result.error, undefined);
  assert.equal(result.mode, "fixed");
});

test("an open question rejects a paraphrased core during its first six catches", () => {
  const history = [candidate()];
  const result = diversity.validateCandidate({
    question: "What attractions should I visit in London?",
    history,
    candidate: candidate({
      answerCoreId: "big-ben-landmark",
      answerCoreSummary: "Big Ben as London's iconic landmark",
      answerAngleId: "big-ben-history",
      answerAngleSummary: "Focus on the landmark's history"
    })
  });
  assert.match(result.error, /repeated the used core/i);
});

test("six open cores permit a revisited core only through a genuinely new angle", () => {
  const history = [
    candidate(),
    candidate({ answerCoreId: "tower-bridge", answerCoreSummary: "Visit Tower Bridge", answerAngleId: "tower-engineering", answerAngleSummary: "Victorian bridge engineering" }),
    candidate({ answerCoreId: "greenwich", answerCoreSummary: "Visit Greenwich", answerAngleId: "greenwich-maritime", answerAngleSummary: "Maritime history" }),
    candidate({ answerCoreId: "camden", answerCoreSummary: "Visit Camden Market", answerAngleId: "camden-food", answerAngleSummary: "Market food" }),
    candidate({ answerCoreId: "kew", answerCoreSummary: "Visit Kew Gardens", answerAngleId: "kew-botany", answerAngleSummary: "Botanical collections" }),
    candidate({ answerCoreId: "westminster", answerCoreSummary: "Visit Westminster Abbey", answerAngleId: "westminster-royal", answerAngleSummary: "Royal history" })
  ];
  const accepted = diversity.validateCandidate({
    question: "What attractions should I visit in London?",
    history,
    candidate: candidate({
      answerAngleId: "big-ben-walking-route",
      answerAngleSummary: "Build a Westminster walking route around Big Ben"
    })
  });
  assert.equal(accepted.error, undefined);

  const rejected = diversity.validateCandidate({
    question: "What attractions should I visit in London?",
    history,
    candidate: candidate()
  });
  assert.match(rejected.error, /paraphrased the used angle/i);
});

test("a limited question keeps its truthful core while requiring a new angle", () => {
  const history = [candidate({
    diversityMode: "limited",
    answerCoreId: "low-mineral-content",
    answerCoreSummary: "Low mineral content shapes the taste",
    answerAngleId: "soft-mouthfeel",
    answerAngleSummary: "A softer mouthfeel"
  })];
  const result = diversity.validateCandidate({
    question: "Why does this water taste good?",
    history,
    candidate: candidate({
      diversityMode: "limited",
      answerCoreId: "low-mineral-content",
      answerCoreSummary: "Low mineral content shapes the taste",
      answerAngleId: "low-bitterness",
      answerAngleSummary: "Less mineral bitterness"
    })
  });
  assert.equal(result.error, undefined);
  assert.equal(result.mode, "limited");
});

test("history is sanitised and capped at ten visible catches", () => {
  const history = Array.from({ length: 14 }, (_, index) => candidate({
    answerCoreId: `core-${index}`,
    answerCoreSummary: `Core ${index}`
  }));
  assert.equal(diversity.cleanHistory(history).length, 10);
});
