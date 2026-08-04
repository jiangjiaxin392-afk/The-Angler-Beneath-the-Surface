(function attachMockAi(globalObject) {
  "use strict";

  const MOCK_REVISION = "20260802-mock-v1";
  const recentAnswers = new Map();

  function wait(milliseconds) {
    return new Promise((resolve) => globalObject.setTimeout(resolve, milliseconds));
  }

  function hashString(value) {
    let hash = 2166136261;
    for (let index = 0; index < value.length; index += 1) {
      hash ^= value.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }

  function pick(values, seed, offset = 0) {
    return values[((seed + offset * 2654435761) >>> 0) % values.length];
  }

  function normaliseQuestion(question) {
    return String(question || "").trim().replace(/\s+/g, " ");
  }

  async function recommend(input) {
    const question = normaliseQuestion(input?.question);
    if (!question) throw new Error("Mock recommendation requires a question.");
    const normalized = question.toLowerCase();
    const seed = hashString(question);
    await wait(260 + (seed % 360));

    const liveInformation = /\b(latest|current|today|now|news|open|opening|price|cost|booking|weather|travel|visit|attractions?|recommendations?|nearby)\b/;
    const multiStep = /\b(compare|comparison|plan|planning|steps|strategy|analyse|analyze|trade-?offs?|complex|why)\b/;
    const personal = /\b(i|me|my|we|our|family|children|budget|accessible|preference|prefer|local)\b/;
    const evidence = /\b(source|evidence|verify|check|accurate|latest|current|opening|price|booking)\b/;

    let waterId = "daylight-river";
    let waterReason = "A general model is enough to establish a clear first answer.";
    if (liveInformation.test(normalized)) {
      waterId = "signal-canal";
      waterReason = "This question may depend on current, searchable information.";
    } else if (multiStep.test(normalized)) {
      waterId = "sunken-reservoir";
      waterReason = "This question benefits from comparison or multi-step reasoning.";
    }

    let tackleId = "quick";
    let tackleReason = "A direct first pass keeps the answer concise.";
    if (evidence.test(normalized)) {
      tackleId = "evidence";
      tackleReason = "Evidence-led tackle highlights claims that need checking.";
    } else if (/\b(compare|comparison|versus|vs\.?|options?|trade-?offs?)\b/.test(normalized)) {
      tackleId = "compare";
      tackleReason = "Comparative tackle keeps alternatives and trade-offs visible.";
    } else if (/\b(plan|planning|itinerary|route|steps|schedule)\b/.test(normalized)) {
      tackleId = "checked";
      tackleReason = "Checked tackle supports a structured plan and review pass.";
    } else if (personal.test(normalized)) {
      tackleId = "personal";
      tackleReason = "Context-rich tackle can preserve the user's circumstances.";
    } else if (/\b(why|explain|unclear|help me decide)\b/.test(normalized)) {
      tackleId = "careful";
      tackleReason = "Clarifying tackle exposes assumptions before answering.";
    }

    return {
      source: "mock-ai",
      status: "ready",
      revision: MOCK_REVISION,
      waterId,
      tackleId,
      waterReason,
      tackleReason,
      questionSnapshot: question
    };
  }

  function makeCoreAnswer(payload, seed) {
    const question = normaliseQuestion(payload.question);
    const quotedQuestion = `“${question}”`;
    const modelId = payload.modelSelection?.waterId || "daylight-river";
    const tackleId = payload.promptConfiguration?.tackleId || "quick";
    const angle = payload.answerShape?.variationAngle || "balanced starting point";

    const openings = {
      "daylight-river": [
        `A balanced starting point for ${quotedQuestion} is to identify the main outcome, then choose the clearest practical option.`,
        `For ${quotedQuestion}, begin with the most relevant answer and keep the explanation easy to follow.`
      ],
      "signal-canal": [
        `For ${quotedQuestion}, start with options that are currently available and verify time-sensitive details before acting.`,
        `A useful current answer to ${quotedQuestion} should prioritise recent information, availability and practical access.`
      ],
      "sunken-reservoir": [
        `Approach ${quotedQuestion} by separating the goal, constraints and alternatives before choosing a route.`,
        `For ${quotedQuestion}, compare the strongest options against the same criteria, then explain the trade-off.`
      ]
    };

    const tackleAdditions = {
      quick: "Keep the result to the essential recommendation.",
      personal: "Adjust the recommendation around the user's stated needs and preferences.",
      checked: "End with a short check of assumptions, dates and practical constraints.",
      compare: "Show at least two alternatives and state what each one is best for.",
      local: "Include one less obvious route that fits the user's context.",
      careful: "Name the most important missing detail before committing to a final route.",
      sample: "Use a concrete example to demonstrate the intended answer shape.",
      challenge: "Question the default option and make its trade-offs explicit.",
      evidence: "Separate supported claims from details that still require a source check."
    };

    const angleAdditions = {
      "balanced starting point": "Balance usefulness, effort and uncertainty.",
      "practical next steps": "Finish with two practical next steps.",
      "local perspective": "Give extra weight to context and local relevance.",
      "constraints and trade-offs": "Make the main limitation and trade-off explicit.",
      "first-time visitor": "Assume the audience needs a clear, low-friction starting point.",
      "budget-conscious route": "Prefer options that reduce cost or wasted effort.",
      "comparison of alternatives": "Contrast the leading option with a credible alternative.",
      "short actionable plan": "Turn the recommendation into a short sequence of actions."
    };

    return [
      pick(openings[modelId] || openings["daylight-river"], seed),
      tackleAdditions[tackleId] || tackleAdditions.quick,
      angleAdditions[angle] || angleAdditions["balanced starting point"]
    ];
  }

  function shapeAnswer(payload, core, seed) {
    const question = normaliseQuestion(payload.question);
    const catchId = payload.answerShape?.catchId || "trout";
    const first = core[0];
    const second = core[1];
    const third = core[2];
    const alternatives = [
      "Check the most changeable detail before relying on it.",
      "Keep one alternative available if the first route does not fit.",
      "Treat confidence as presentation, not proof.",
      "The final choice still depends on the audience's priorities."
    ];
    const extra = pick(alternatives, seed, 2);

    const answers = {
      bass: `${first} ${second} ${third} ${extra}`,
      trout: `${first} ${second} ${third}`,
      pike: `${first} This is the strongest route; use it as the centre of the answer. ${extra}`,
      perch: `${first}`,
      carp: `${first} ${second} ${third} Also consider cost, timing, access, alternatives, exceptions, audience preference, supporting examples and a backup route. ${extra}`,
      weeds: `${first} Before completing that answer, it may also be useful to explore a neighbouring issue, its background and several loosely connected possibilities.`,
      rubbish: `About “${question}”: start with the conclusion—repeat the question—three routes at once; ${second.toLowerCase()} No, return to the opening, add a side point, then stop before the order is resolved.`,
      boot: `${first} This route may rely on older assumptions; its date, availability and current validity remain unresolved.`
    };
    return answers[catchId] || answers.trout;
  }

  function ensureUniqueAnswer(payload, answer, seed) {
    const historyKey = [
      normaliseQuestion(payload.question).toLowerCase(),
      payload.modelSelection?.waterId || "daylight-river",
      payload.promptConfiguration?.tackleId || "quick",
      payload.answerShape?.catchId || "trout"
    ].join("|");
    const history = recentAnswers.get(historyKey) || [];
    let candidate = answer;
    let attempt = 0;
    const freshEmphasis = [
      "timing", "cost", "access", "evidence", "audience needs", "trade-offs",
      "a backup route", "the first practical action", "uncertainty", "local context"
    ];
    while (history.includes(candidate)) {
      const emphasis = pick(freshEmphasis, seed, history.length + attempt);
      candidate = candidate.replace(/\.$/, `, with extra weight on ${emphasis}.`);
      attempt += 1;
    }
    history.unshift(candidate);
    if (history.length > 12) history.length = 12;
    recentAnswers.set(historyKey, history);
    return candidate;
  }

  async function generate(payload) {
    if (!payload?.requestId || !normaliseQuestion(payload.question)) {
      throw new Error("Mock generation requires a request ID and question.");
    }
    const seed = hashString(`${payload.requestId}|${payload.answerShape?.variationAngle || ""}`);
    await wait(320 + (seed % 520));
    const core = makeCoreAnswer(payload, seed);
    const answer = ensureUniqueAnswer(payload, shapeAnswer(payload, core, seed), seed);
    const catchId = payload.answerShape?.catchId || "trout";
    const summaries = {
      bass: "Substantial and structured, but still for the player to judge.",
      trout: "Useful and focused, with some details still open to review.",
      pike: "Decisive presentation; confidence should not be mistaken for verification.",
      perch: "A very brief answer that may omit useful context.",
      carp: "Relevant material is present, but prioritisation is weak.",
      weeds: "The answer remains connected to the question but drifts off course.",
      rubbish: "The response is related to the question but visibly chaotic.",
      boot: "The answer may be shaped by stale or undated assumptions."
    };
    const missingByCatch = {
      bass: ["PLAYER REVIEW", "SOURCE CHECK"],
      trout: ["ALTERNATIVE VIEW", "CURRENT DETAILS"],
      pike: ["SUPPORTING EVIDENCE", "LIMITS OF THE CLAIM"],
      perch: ["CONTEXT", "UNANSWERED PARTS"],
      carp: ["PRIORITY", "CLEAR CONCLUSION"],
      weeds: ["USER INTENT", "DIRECT COMPLETION"],
      rubbish: ["ORDER", "COHERENT CONCLUSION"],
      boot: ["CURRENT DATE", "FRESH SOURCE"]
    };

    return {
      source: "mock-ai",
      status: "ready",
      revision: MOCK_REVISION,
      requestId: payload.requestId,
      answer,
      summary: summaries[catchId] || summaries.trout,
      missing: missingByCatch[catchId] || missingByCatch.trout,
      answerFingerprint: hashString(answer).toString(16)
    };
  }

  globalObject.AnglerAI = Object.freeze({
    mode: "mock",
    revision: MOCK_REVISION,
    recommend,
    generate
  });
})(window);
