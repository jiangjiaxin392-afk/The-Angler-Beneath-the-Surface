"use strict";

const REVISION = "20260809-answer-methods-v4";
const LOW_VISIBILITY_CATCHES = new Set(["perch", "weeds", "rubbish", "boot"]);

const WATER_CONTRACTS = Object.freeze({
  "daylight-river": Object.freeze({
    label: "DIRECT ANSWER",
    markers: Object.freeze(["DIRECT ANSWER:", "WHY:"]),
    instruction: "Use the direct-answer route. For a normal catch, make this route immediately visible: begin with 'DIRECT ANSWER:' and lead with one primary answer, then use 'WHY:' for only the reasoning that helps the user act. Do not turn it into a research report or broad comparison unless the tackle explicitly requires alternatives.",
    reserve(core) {
      return `DIRECT ANSWER: Visit ${core.label}. WHY: ${core.direct}`;
    }
  }),
  "signal-canal": Object.freeze({
    label: "SEARCH & SYNTHESIS",
    markers: Object.freeze(["SYNTHESIS:", "CURRENT CHECK:", "UNCERTAINTY:"]),
    instruction: "Use the search-and-synthesis route. Search relevant web material and distinguish what stable sources, current official information and credible community experience contribute. For a normal catch, make this route immediately visible with 'SYNTHESIS:', 'CURRENT CHECK:' and 'UNCERTAINTY:'. Prefer primary sources for factual claims, but do not claim that anything was verified unless the available material supports it.",
    reserve(core) {
      return `SYNTHESIS: ${core.direct} CURRENT CHECK: ${core.currentCheck} UNCERTAINTY: Opening, booking and access details may change.`;
    }
  }),
  "sunken-reservoir": Object.freeze({
    label: "COMPARISON",
    markers: Object.freeze(["OPTIONS:", "TRADE-OFFS:", "RECOMMENDATION:"]),
    instruction: "Use the comparison route. For a normal catch, make this route immediately visible with 'OPTIONS:', 'TRADE-OFFS:' and 'RECOMMENDATION:'. Compare at least two meaningful routes or choices, explain what each prioritises, and finish by helping the user choose. Do not treat this as merely a longer direct answer.",
    reserve(core) {
      return `OPTIONS: ${core.compare} TRADE-OFFS: This option prioritises ${core.summary.toLowerCase()} rather than a general landmark route. RECOMMENDATION: Choose ${core.label} when that priority matches the visit.`;
    }
  })
});

const TACKLE_CONTRACTS = Object.freeze({
  quick: Object.freeze({
    label: "QUICK OVERVIEW",
    markers: Object.freeze(["QUICK OVERVIEW:"]),
    instruction: "Apply QUICK OVERVIEW: keep one main recommendation, use the shortest useful route through the selected water method, and avoid optional detail. The difference must be visible through brevity, not merely a neutral tone.",
    reserve(core) {
      return `QUICK OVERVIEW: ${core.route}`;
    }
  }),
  personal: Object.freeze({
    label: "PERSONALISED GUIDE",
    markers: Object.freeze(["FOR YOU:"]),
    instruction: "Apply PERSONALISED GUIDE: add a visible 'FOR YOU:' sentence that connects the answer to preferences or constraints actually present in the question. If none are supplied, state one modest assumption instead of inventing personal details.",
    reserve(core) {
      return `FOR YOU: For a first visit, use this route: ${core.route}`;
    }
  }),
  checked: Object.freeze({
    label: "CHECKED ITINERARY",
    markers: Object.freeze(["PLAN:", "CHECK:"]),
    instruction: "Apply CHECKED ITINERARY: include a practical ordered plan and a visible 'CHECK:' item for one time-sensitive, weak or uncertain detail. Make the plan and review pass recognisable even when the selected water is direct.",
    reserve(core) {
      return `PLAN: ${core.route} CHECK: Treat current access details as a separate decision before setting out.`;
    }
  }),
  compare: Object.freeze({
    label: "COMPARE OPTIONS",
    markers: Object.freeze(["CONTRAST:"]),
    instruction: "Apply COMPARE OPTIONS: keep at least two plausible choices visible and include a clear 'CONTRAST:' sentence before making a recommendation. Do not collapse the alternatives into a generic list.",
    reserve() {
      return "CONTRAST: Choose by the visitor's priority rather than treating every attraction as interchangeable.";
    }
  }),
  local: Object.freeze({
    label: "LOCAL FEEL",
    markers: Object.freeze(["EXPERIENCE:"]),
    instruction: "Apply LOCAL FEEL: include a visible 'EXPERIENCE:' sentence about pace, atmosphere or practical lived experience. Keep it grounded in supplied or supportable information and never pretend to have personal local experience.",
    reserve(core) {
      return `EXPERIENCE: ${core.route} Allow time for the surrounding area rather than treating it as a single photo stop.`;
    }
  }),
  careful: Object.freeze({
    label: "CAREFUL START",
    markers: Object.freeze(["ASSUMPTION:", "SAFE START:"]),
    instruction: "Apply CAREFUL START: begin with 'ASSUMPTION:' to expose the most important missing preference or constraint, then give one safe starting answer without blocking the interaction with a follow-up question.",
    reserve(core) {
      return `ASSUMPTION: The visitor's main priority is not yet specified. SAFE START: Use ${core.label} as a provisional choice, then adjust for time and interests.`;
    }
  }),
  sample: Object.freeze({
    label: "MATCH AN EXAMPLE",
    markers: Object.freeze(["RECOMMENDATION:", "WHY:", "NEXT STEP:"]),
    instruction: "Apply MATCH AN EXAMPLE as a visible answer template rather than inventing a user example. Use the exact sequence 'RECOMMENDATION:', 'WHY:' and 'NEXT STEP:' while following the selected water's content route.",
    reserve(core) {
      return `RECOMMENDATION: ${core.label}. WHY: ${core.summary}. NEXT STEP: ${core.route}`;
    }
  }),
  challenge: Object.freeze({
    label: "QUESTION THE LIST",
    markers: Object.freeze(["CHALLENGE:", "ALTERNATIVE:"]),
    instruction: "Apply QUESTION THE LIST: include 'CHALLENGE:' to question the obvious default or a weak assumption, then 'ALTERNATIVE:' for an overlooked but relevant direction. Remain useful rather than merely contrarian.",
    reserve(core) {
      return `CHALLENGE: The most famous landmark is not automatically the best match; consider ${core.tangent}. ALTERNATIVE: ${core.route}`;
    }
  }),
  evidence: Object.freeze({
    label: "VERIFY DETAILS",
    markers: Object.freeze(["SUPPORTED:", "VERIFY:"]),
    instruction: "Apply VERIFY DETAILS: distinguish a supportable central recommendation under 'SUPPORTED:' from a time-sensitive action under 'VERIFY:'. Do not present a fluent answer as verified merely because this tackle was selected.",
    reserve(core) {
      return `SUPPORTED: ${core.summary}. VERIFY: Keep current access details separate from that recommendation.`;
    }
  })
});

function inferredTackleId(promptConfiguration = {}) {
  const explicit = String(promptConfiguration.tackleId || "").trim().toLowerCase();
  if (Object.hasOwn(TACKLE_CONTRACTS, explicit)) return explicit;
  const type = String(promptConfiguration?.type?.name || "DIRECT").trim().toUpperCase();
  const colour = String(promptConfiguration?.colour?.name || "NEUTRAL").trim().toUpperCase();
  if (type === "CONTEXT-RICH") return colour === "FRIENDLY" ? "personal" : "local";
  if (type === "EXAMPLE-GUIDED") return "sample";
  if (type === "CLARIFYING") return "careful";
  if (type === "COMPARATIVE") return colour === "CRITICAL" ? "challenge" : "compare";
  if (type === "EVIDENCE-LED") return colour === "FORMAL" ? "evidence" : "checked";
  return "quick";
}

function compileAnswerMethod({ waterId, promptConfiguration, catchId } = {}) {
  const safeWaterId = Object.hasOwn(WATER_CONTRACTS, waterId) ? waterId : "daylight-river";
  const tackleId = inferredTackleId(promptConfiguration);
  const water = WATER_CONTRACTS[safeWaterId];
  const tackle = TACKLE_CONTRACTS[tackleId];
  const visiblyPreserveMethod = !LOW_VISIBILITY_CATCHES.has(String(catchId || ""));
  const requiredMarkers = visiblyPreserveMethod
    ? Object.freeze([...new Set([...water.markers, ...tackle.markers])])
    : Object.freeze([]);
  const instruction = visiblyPreserveMethod
    ? `WATER ROUTE — ${water.label}: ${water.instruction} TACKLE METHOD — ${tackle.label}: ${tackle.instruction} Both the water route and tackle method must remain recognisable in the final answer; neither may replace the other. Use every one of these exact visible headings: ${requiredMarkers.join(" ")}`
    : `WATER ROUTE — ${water.label}; TACKLE METHOD — ${tackle.label}. Use them as the underlying method, but the selected low-quality catch may visibly damage, shorten or obscure them.`;
  return Object.freeze({
    revision: REVISION,
    waterId: safeWaterId,
    waterLabel: water.label,
    tackleId,
    tackleLabel: tackle.label,
    visiblyPreserveMethod,
    requiredMarkers,
    instruction,
    reserveSegments(core) {
      return Object.freeze({
        water: water.reserve(core),
        tackle: tackle.reserve(core)
      });
    }
  });
}

function validateVisibleAnswer(answer, method) {
  if (!method?.visiblyPreserveMethod) return null;
  const value = String(answer || "").toUpperCase();
  const missing = (method.requiredMarkers || []).filter((marker) => !value.includes(marker));
  if (missing.length === 0) return null;
  return `The answer did not visibly preserve the selected water and tackle method. Missing exact headings: ${missing.join(" ")}`;
}

module.exports = Object.freeze({
  LOW_VISIBILITY_CATCHES: Object.freeze([...LOW_VISIBILITY_CATCHES]),
  REVISION,
  TACKLE_CONTRACTS,
  WATER_CONTRACTS,
  compileAnswerMethod,
  inferredTackleId,
  validateVisibleAnswer
});
