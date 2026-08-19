"use strict";

const answerMethods = require("./answer-methods.js");

const QUESTION = "What attractions should I visit in London?";
const SOURCE = "presentation-reserve";
const REVISION = "20260809-presentation-methods-v7";
const REQUEST_CACHE_LIMIT = 256;

function core(id, label, summary, direct, route, compare, currentCheck, tangent) {
  return Object.freeze({
    id,
    label,
    summary,
    angles: Object.freeze([
      Object.freeze({ id: "character", summary: direct }),
      Object.freeze({ id: "route", summary: route }),
      Object.freeze({ id: "comparison", summary: compare }),
      Object.freeze({ id: "practical", summary: currentCheck })
    ]),
    direct,
    route,
    compare,
    currentCheck,
    tangent
  });
}

const londonCores = Object.freeze([
  core(
    "westminster-abbey", "Westminster Abbey", "British history, royal ceremonies and Gothic architecture",
    "It concentrates centuries of British history, royal ceremonies and Gothic architecture in one visit.",
    "Combine it with Big Ben, Parliament and a walk through St James's Park.",
    "Choose it over a general landmark walk when royal and political history matters most.",
    "Check timed entry, service closures and visitor hours before setting out.",
    "how institutions turn ceremony, memory and national identity into architecture"
  ),
  core(
    "tower-of-london", "Tower of London", "A fortress, royal prison and home of the Crown Jewels",
    "The fortress combines royal power, imprisonment, military history and the Crown Jewels.",
    "Visit early, cross Tower Bridge and continue toward Borough Market or the South Bank.",
    "Choose it over Westminster Abbey for a darker, more physical account of royal history.",
    "Book ahead and confirm the current opening and last-entry times.",
    "why cities preserve former sites of punishment as popular attractions"
  ),
  core(
    "greenwich", "Greenwich", "Maritime history, the observatory, park views and a river journey",
    "It offers maritime history, the observatory, a large park and one of London's best hilltop views.",
    "Travel by river, visit the Cutty Sark or Maritime Museum, then walk up to the observatory.",
    "Choose it over central landmarks when you want more space, landscape and a half-day excursion.",
    "Check river services, observatory tickets and seasonal closing times.",
    "how navigation, longitude and maritime trade helped organise global movement"
  ),
  core(
    "british-museum", "British Museum", "A major world-history collection in Bloomsbury",
    "Its collection connects objects and histories from many regions and periods in one free museum.",
    "Choose a few galleries in advance, then continue through Bloomsbury or toward Covent Garden.",
    "Choose it over an outdoor route for a collection-led visit or unreliable weather.",
    "Confirm current entry arrangements, gallery closures and any booked exhibitions.",
    "ownership, empire and who has the authority to classify other cultures"
  ),
  core(
    "south-bank-tate-modern", "South Bank and Tate Modern", "Riverside walking, modern art and changing city views",
    "The route combines a Thames walk, modern art, street activity and views across the historic centre.",
    "Walk from Westminster or London Bridge and include Tate Modern, the Globe and riverside stops.",
    "Choose it over a single ticketed monument when variety and flexible pacing matter more.",
    "Check Tate displays and any riverside closures, but keep the walk flexible.",
    "how former industrial spaces are repackaged as cultural districts"
  ),
  core(
    "camden-market", "Camden Market", "Alternative fashion, food and canal-side street culture",
    "It offers a dense mix of food, fashion, music history and visually distinctive street culture.",
    "Explore the market, then follow the canal toward Regent's Park or King's Cross.",
    "Choose it over Westminster when subculture, shopping and informal street life are the priority.",
    "Check market trading hours and expect the busiest crowds at weekends.",
    "how subcultures become brands once tourism learns how to sell their image"
  ),
  core(
    "notting-hill-portobello", "Notting Hill and Portobello Road", "Colourful streets, antiques and neighbourhood walking",
    "The area is best for colourful streets, antiques, small shops and a slower neighbourhood walk.",
    "Follow Portobello Road, then continue toward Kensington Gardens if you want a longer route.",
    "Choose it over Camden for a calmer residential atmosphere and antiques rather than alternative fashion.",
    "Check which market sections operate on the day you plan to visit.",
    "how cinema and photography can turn residential streets into consumable scenery"
  ),
  core(
    "kew-gardens", "Kew Gardens", "Historic glasshouses and a major botanical collection",
    "The gardens combine historic glasshouses, scientific plant collections and a spacious landscape.",
    "Allow most of a day and focus on the Palm House, Temperate House and seasonal highlights.",
    "Choose it over a central park when botany, conservation and architecture justify the longer journey.",
    "Check seasonal hours, transport disruption and which glasshouses are currently open.",
    "how collecting plants connects science, conservation and imperial movement"
  ),
  core(
    "hampstead-heath", "Hampstead Heath", "Open landscape, skyline views and a break from central London",
    "It provides open landscape, woodland paths and a broad skyline view away from the central crowds.",
    "Walk across the Heath, visit Parliament Hill and add Hampstead village or Kenwood House.",
    "Choose it over a formal royal park when you prefer rougher landscape and local atmosphere.",
    "Check weather, path conditions and current swimming arrangements if the ponds interest you.",
    "why apparently natural urban landscapes are still planned, managed and contested"
  ),
  core(
    "leicester-square-west-end", "Leicester Square", "Theatre, cinema and West End evening entertainment",
    "The area works best as an evening centre for theatre, cinema, Chinatown and nearby Soho.",
    "Book a performance, eat nearby and walk through Chinatown, Soho or Covent Garden.",
    "Choose it over a daytime monument when live entertainment and nightlife are the main goal.",
    "Check performance schedules and book popular shows rather than relying on availability.",
    "how entertainment districts manufacture excitement through crowds, light and repetition"
  )
]);

function cleanIdentifier(value) {
  return String(value || "").trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "");
}

function historyFromContext(context) {
  return Array.isArray(context?.history) ? context.history.slice(0, 10) : [];
}

function buildAnswer(selectedCore, angle, catchId, context) {
  const method = answerMethods.compileAnswerMethod({
    waterId: context?.waterId,
    promptConfiguration: context?.promptConfiguration,
    catchId
  });
  const methodSegments = method.reserveSegments(selectedCore);
  const methodText = `${methodSegments.water} ${methodSegments.tackle}`;
  const focus = angle.summary;
  const additionalFocus = angle.id === "character" ? "" : focus;
  const answers = {
    bass: [`${selectedCore.label} is a strong London choice.`, additionalFocus, methodText].filter(Boolean).join(" "),
    trout: methodText,
    pike: `PRIORITY: ${selectedCore.label}. ${methodText}`,
    perch: `${selectedCore.label}.`,
    carp: `${methodText} ${selectedCore.label} can also involve several overlapping possibilities: ${selectedCore.direct} ${selectedCore.route} ${selectedCore.compare} ${selectedCore.currentCheck} You could reorganise the visit around architecture, history, food, landscape, transport, cost, weather and the interests of different visitors, although that volume of considerations does not make the priority especially clear.`,
    weeds: `${selectedCore.label} is one possible starting point. But that quickly leads into a different discussion about ${selectedCore.tangent}. The original question about which London attraction to visit remains unresolved.`,
    rubbish: `${selectedCore.label} first. Wait—start with the route. ${focus} No, back up: ${selectedCore.label}, then the comparison, then the same place again. Start there—already said that—leave, return, switch the order. No clean conclusion.`,
    boot: `An undated visitor guide recommends ${selectedCore.label}. ${selectedCore.direct} ${selectedCore.route} The suggestion remains plausible, but ${selectedCore.currentCheck.toLowerCase()}`
  };
  return answers[catchId] || answers.trout;
}

function buildEntry(selectedCore, angle, catchId, context) {
  const missingByCatch = {
    perch: ["DETAIL", "ALTERNATIVES"],
    carp: ["CLEAR PRIORITY", "TIME LIMIT"],
    weeds: ["DIRECT ANSWER", "RELEVANT CONCLUSION"],
    rubbish: ["CLEAR ORDER", "CONSISTENT CONCLUSION"],
    boot: ["CURRENT OPENING TIMES", "CURRENT BOOKING RULES"]
  };
  const summaryByCatch = {
    bass: `A substantial recommendation centred on ${selectedCore.label}.`,
    trout: `A focused recommendation centred on ${selectedCore.label}.`,
    pike: `A decisive recommendation prioritising ${selectedCore.label}.`,
    perch: `An ultra-short answer naming ${selectedCore.label}.`,
    carp: `An overloaded answer centred on ${selectedCore.label} with weak prioritisation.`,
    weeds: `A fragment about ${selectedCore.label} that drifts away from the request.`,
    rubbish: `A chaotic response anchored to ${selectedCore.label}.`,
    boot: `An undated recommendation centred on ${selectedCore.label}.`
  };
  return {
    answer: buildAnswer(selectedCore, angle, catchId, context),
    summary: summaryByCatch[catchId] || summaryByCatch.trout,
    missing: [...(missingByCatch[catchId] || [])],
    diversityMode: "open",
    answerCoreId: selectedCore.id,
    answerCoreSummary: selectedCore.summary,
    answerAngleId: `${selectedCore.id}-${angle.id}`,
    answerAngleSummary: angle.summary
  };
}

function cloneEntry(value) {
  return { ...value, missing: [...value.missing] };
}

function createSelector({ random = Math.random, requestCacheLimit = REQUEST_CACHE_LIMIT } = {}) {
  const requestCache = new Map();

  return function select(question, catchId, requestId = "", context = {}) {
    if (question !== QUESTION) return null;
    const safeCatchId = String(catchId || "");
    if (!Object.hasOwn({ bass: 1, trout: 1, pike: 1, perch: 1, carp: 1, weeds: 1, rubbish: 1, boot: 1 }, safeCatchId)) return null;

    const cacheKey = requestId ? `${safeCatchId}:${requestId}` : "";
    if (cacheKey && requestCache.has(cacheKey)) return cloneEntry(requestCache.get(cacheKey));

    const history = historyFromContext(context);
    const usage = new Map();
    for (const item of history) {
      const coreId = cleanIdentifier(item?.answerCoreId);
      if (coreId) usage.set(coreId, (usage.get(coreId) || 0) + 1);
    }
    const minimumUsage = Math.min(...londonCores.map((item) => usage.get(item.id) || 0));
    const available = londonCores.filter((item) => (usage.get(item.id) || 0) === minimumUsage);
    const selectedCore = available[Math.min(available.length - 1, Math.floor(random() * available.length))];
    const angleIndex = Math.min(selectedCore.angles.length - 1, usage.get(selectedCore.id) || 0);
    const selected = buildEntry(selectedCore, selectedCore.angles[angleIndex], safeCatchId, context);

    if (cacheKey) {
      requestCache.set(cacheKey, selected);
      while (requestCache.size > requestCacheLimit) requestCache.delete(requestCache.keys().next().value);
    }
    return cloneEntry(selected);
  };
}

const getAnswer = createSelector();

module.exports = Object.freeze({
  QUESTION,
  REVISION,
  SOURCE,
  answerCountPerCatch: londonCores.length,
  catchIds: Object.freeze(["bass", "trout", "pike", "perch", "carp", "weeds", "rubbish", "boot"]),
  coreIds: Object.freeze(londonCores.map((item) => item.id)),
  createSelector,
  getAnswer
});
