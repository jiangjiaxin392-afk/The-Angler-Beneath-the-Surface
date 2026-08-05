"use strict";

const QUESTION = "What attractions should I visit in London?";
const SOURCE = "presentation-reserve";
const REVISION = "20260805-presentation-reserve-v1";

const answers = Object.freeze({
  bass: Object.freeze({
    answer: "For a strong first visit, start in Westminster with Big Ben, the Houses of Parliament and Westminster Abbey, then walk through St James's Park to Buckingham Palace. On another day, visit the Tower of London and Tower Bridge, then follow the South Bank toward Tate Modern. If you have more time, choose one neighbourhood with a different character, such as Greenwich, Camden or Notting Hill. Book major attractions in advance and check current opening times before you go.",
    summary: "A substantial first-visit plan with clear priorities, practical sequencing and a reminder to verify current details.",
    missing: []
  }),
  trout: Object.freeze({
    answer: "For a first visit, see Big Ben, Westminster Abbey and Buckingham Palace, then walk along the South Bank to Tate Modern. Add the Tower of London and Tower Bridge if you enjoy history. For a different atmosphere, choose Greenwich, Camden or Notting Hill.",
    summary: "A focused London shortlist with a useful central route and a few contrasting alternatives.",
    missing: ["CURRENT OPENING TIMES", "PERSONAL PREFERENCES"]
  }),
  pike: Object.freeze({
    answer: "Begin with Big Ben and Westminster Abbey, walk through St James's Park to Buckingham Palace, and finish on the South Bank. On the next day, visit the Tower of London and Tower Bridge. That is the strongest first-time London route.",
    summary: "A decisive two-part route that prioritises London's best-known first-visit landmarks.",
    missing: ["BOOKING DETAILS"]
  }),
  perch: Object.freeze({
    answer: "Big Ben.",
    summary: "An ultra-short answer naming one iconic London attraction.",
    missing: ["DETAIL", "ALTERNATIVES"]
  }),
  carp: Object.freeze({
    answer: "London offers Big Ben, Westminster Abbey, Buckingham Palace, the Tower of London, Tower Bridge, the British Museum, the National Gallery, Tate Modern, the Victoria and Albert Museum, the Natural History Museum, the London Eye, St Paul's Cathedral, Covent Garden, Borough Market, Camden Market, Greenwich, Notting Hill, Hyde Park, Regent's Park and the South Bank. You could group Westminster and Buckingham Palace together, combine the Tower with Tower Bridge, pair Tate Modern with the South Bank, or spend separate days on museums, markets, parks, river views and neighbourhoods. There are many good options, although this list does not make the priority especially clear.",
    summary: "A relevant but overloaded collection of attractions and possible groupings with weak prioritisation.",
    missing: ["CLEAR PRIORITY", "TIME LIMIT"]
  }),
  weeds: Object.freeze({
    answer: "Big Ben is one useful starting point. But this quickly leads into a different discussion about why cities turn landmarks into symbols, how souvenir images circulate, and why visitors recognise a skyline before understanding the place itself. The original question about what to visit in London remains unresolved.",
    summary: "The response catches one London fragment, then drifts into a neighbouring discussion and abandons the request.",
    missing: ["DIRECT ANSWER", "RELEVANT CONCLUSION"]
  }),
  rubbish: Object.freeze({
    answer: "Big Ben first. Wait—Tower Bridge first. Museums, then the London Eye, then Big Ben again. No, back up: Buckingham Palace, a market, Big Ben, maybe Greenwich. Start with Big Ben—already said that—then cross the river, unless the museum comes before the bridge. Tower Bridge. Big Ben again. No clean route.",
    summary: "The response stays on London, but its ordering, repetition and conclusion are deliberately unreliable.",
    missing: ["CLEAR ORDER", "CONSISTENT CONCLUSION"]
  }),
  boot: Object.freeze({
    answer: "A traditional London itinerary would include Big Ben, Westminster Abbey, Buckingham Palace, the Tower of London, Tower Bridge and the British Museum. This advice is based on an undated visitor pattern, so current opening hours, booking rules, closures and ticket arrangements should be checked before relying on it.",
    summary: "A plausible but deliberately undated itinerary whose present-day details are not verified.",
    missing: ["CURRENT OPENING TIMES", "CURRENT BOOKING RULES"]
  })
});

function getAnswer(question, catchId) {
  if (question !== QUESTION) return null;
  const entry = answers[String(catchId || "")];
  return entry ? { ...entry, missing: [...entry.missing] } : null;
}

module.exports = Object.freeze({
  QUESTION,
  REVISION,
  SOURCE,
  catchIds: Object.freeze(Object.keys(answers)),
  getAnswer
});
