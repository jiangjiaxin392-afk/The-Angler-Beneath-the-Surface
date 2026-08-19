"use strict";

const assert = require("node:assert/strict");
const { test } = require("node:test");

const methods = require("../server/answer-methods.js");

const waterIds = ["daylight-river", "signal-canal", "sunken-reservoir"];
const tackleIds = [
  "quick", "personal", "checked", "compare", "local",
  "careful", "sample", "challenge", "evidence"
];

test("all twenty-seven normal water and tackle combinations compile to distinct contracts", () => {
  const contracts = [];
  for (const waterId of waterIds) {
    for (const tackleId of tackleIds) {
      const contract = methods.compileAnswerMethod({
        waterId,
        promptConfiguration: { tackleId },
        catchId: "trout"
      });
      assert.equal(contract.waterId, waterId);
      assert.equal(contract.tackleId, tackleId);
      assert.equal(contract.visiblyPreserveMethod, true);
      assert.match(contract.instruction, new RegExp(contract.waterLabel, "i"));
      assert.match(contract.instruction, new RegExp(contract.tackleLabel, "i"));
      assert.ok(contract.requiredMarkers.length >= 3);
      assert.equal(methods.validateVisibleAnswer(contract.requiredMarkers.join(" "), contract), null);
      contracts.push(contract.instruction);
    }
  }
  assert.equal(new Set(contracts).size, waterIds.length * tackleIds.length);
});

test("low-quality catches may obscure the method without changing its identity", () => {
  for (const catchId of methods.LOW_VISIBILITY_CATCHES) {
    const contract = methods.compileAnswerMethod({
      waterId: "signal-canal",
      promptConfiguration: { tackleId: "evidence" },
      catchId
    });
    assert.equal(contract.visiblyPreserveMethod, false);
    assert.deepEqual(contract.requiredMarkers, []);
    assert.equal(contract.waterId, "signal-canal");
    assert.equal(contract.tackleId, "evidence");
    assert.equal(methods.validateVisibleAnswer("damaged catch", contract), null);
  }
});

test("normal catches reject answers that hide either selected method", () => {
  const contract = methods.compileAnswerMethod({
    waterId: "daylight-river",
    promptConfiguration: { tackleId: "quick" },
    catchId: "trout"
  });
  assert.match(
    methods.validateVisibleAnswer("DIRECT ANSWER: One place. WHY: It fits.", contract),
    /QUICK OVERVIEW:/
  );
});

test("legacy tackle dimensions still map critical comparative tackle correctly", () => {
  assert.equal(methods.inferredTackleId({
    type: { name: "COMPARATIVE" },
    colour: { name: "CRITICAL" }
  }), "challenge");
  assert.equal(methods.inferredTackleId({
    type: { name: "EVIDENCE-LED" },
    colour: { name: "FORMAL" }
  }), "evidence");
});
