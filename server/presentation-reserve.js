"use strict";

const QUESTION = "What attractions should I visit in London?";
const SOURCE = "presentation-reserve";
const REVISION = "20260805-presentation-reserve-v2";
const REQUEST_CACHE_LIMIT = 256;

function entry(answer, summary, missing = []) {
  return Object.freeze({ answer, summary, missing: Object.freeze([...missing]) });
}

const answerLibrary = Object.freeze({
  bass: Object.freeze([
    entry(
      "For a strong first visit, start in Westminster with Big Ben, the Houses of Parliament and Westminster Abbey, then walk through St James's Park to Buckingham Palace. On another day, visit the Tower of London and Tower Bridge, then follow the South Bank toward Tate Modern. If you have more time, choose Greenwich, Camden or Notting Hill. Book major attractions in advance and check current opening times before you go.",
      "A substantial first-visit plan with clear priorities, practical sequencing and a reminder to verify current details."
    ),
    entry(
      "Split a first London visit into three areas. Spend one day around Westminster Abbey, Big Ben, St James's Park and Buckingham Palace; another at the Tower of London, Tower Bridge and Borough Market; and a third at the British Museum, Covent Garden and the National Gallery. Reserve timed tickets where required and leave room for one neighbourhood such as Greenwich or Notting Hill.",
      "A well-organised three-area itinerary balancing landmarks, museums, food and a neighbourhood."
    ),
    entry(
      "Begin early at the Tower of London, cross Tower Bridge and walk west along the South Bank past Shakespeare's Globe and Tate Modern. Use a second day for Westminster Abbey, Big Ben, Buckingham Palace and the National Gallery. Greenwich is an excellent extra half-day for the park, observatory and river journey. Check closures and advance-book the places most important to you.",
      "A detailed route using the river to connect major sights, with a practical second day and optional extension."
    ),
    entry(
      "Choose attractions by interest: Westminster Abbey and the Tower of London for history; the British Museum and National Gallery for collections; Tate Modern for modern art; Borough Market for food; and Greenwich for views and maritime history. For a balanced first trip, combine Westminster and Buckingham Palace on one day, then the Tower, Tower Bridge and South Bank on another.",
      "A useful interest-based guide followed by a balanced two-day recommendation."
    )
  ]),
  trout: Object.freeze([
    entry(
      "For a first visit, see Big Ben, Westminster Abbey and Buckingham Palace, then walk along the South Bank to Tate Modern. Add the Tower of London and Tower Bridge if you enjoy history. For a different atmosphere, choose Greenwich, Camden or Notting Hill.",
      "A focused London shortlist with a useful central route and a few contrasting alternatives.",
      ["CURRENT OPENING TIMES", "PERSONAL PREFERENCES"]
    ),
    entry(
      "Start with the Tower of London and Tower Bridge, then visit Borough Market and walk beside the Thames to Tate Modern. On another day, combine Westminster Abbey, Big Ben and Buckingham Palace. Greenwich is a good quieter alternative.",
      "A concise two-day route linking major landmarks with one calmer alternative.",
      ["BOOKING DETAILS", "TRIP LENGTH"]
    ),
    entry(
      "The strongest first-time choices are Westminster Abbey, Big Ben, Buckingham Palace, the Tower of London and Tower Bridge. Add the British Museum or National Gallery for culture, and Borough Market for food.",
      "A compact set of landmark, museum and food priorities.",
      ["ROUTE ORDER", "CURRENT ACCESS INFORMATION"]
    ),
    entry(
      "Walk from Westminster to Buckingham Palace, explore the South Bank, and reserve a separate morning for the Tower of London. If you prefer neighbourhoods to monuments, try Greenwich, Notting Hill or Camden.",
      "A clear central plan with three neighbourhood alternatives.",
      ["OPENING TIMES", "MUSEUM OPTIONS"]
    )
  ]),
  pike: Object.freeze([
    entry(
      "Begin with Big Ben and Westminster Abbey, walk through St James's Park to Buckingham Palace, and finish on the South Bank. On the next day, visit the Tower of London and Tower Bridge. That is the strongest first-time London route.",
      "A decisive two-part route that prioritises London's best-known first-visit landmarks.",
      ["BOOKING DETAILS"]
    ),
    entry(
      "Prioritise the Tower of London, Tower Bridge and Westminster Abbey. Everything else is optional. Put those three first, then use any remaining time for the South Bank or British Museum.",
      "A forceful shortlist that makes the priorities unmistakable.",
      ["NEIGHBOURHOOD OPTIONS"]
    ),
    entry(
      "Do Westminster first: Westminster Abbey, Big Ben, St James's Park and Buckingham Palace. Do the Tower of London the following morning before the crowds. Skip the London Eye unless the view matters more to you than history.",
      "A confident sequence with a clear recommendation about what to deprioritise.",
      ["TICKET PRICES"]
    ),
    entry(
      "Take the Thames route: start at the Tower of London, cross Tower Bridge, stop at Borough Market and finish at Tate Modern. Make Westminster Abbey your other essential visit. This gives you the best mix of old and modern London.",
      "A direct riverside itinerary with one firmly stated additional essential.",
      ["ACCESSIBILITY DETAILS"]
    )
  ]),
  perch: Object.freeze([
    entry("Big Ben.", "An ultra-short answer naming one iconic London attraction.", ["DETAIL", "ALTERNATIVES"]),
    entry("Tower Bridge.", "An ultra-short answer naming one iconic London attraction.", ["DETAIL", "ALTERNATIVES"]),
    entry("British Museum.", "An ultra-short answer naming one major London museum.", ["DETAIL", "ALTERNATIVES"]),
    entry("Greenwich.", "An ultra-short answer naming one distinctive London area.", ["DETAIL", "ALTERNATIVES"])
  ]),
  carp: Object.freeze([
    entry(
      "London offers Big Ben, Westminster Abbey, Buckingham Palace, the Tower of London, Tower Bridge, the British Museum, the National Gallery, Tate Modern, the Victoria and Albert Museum, the Natural History Museum, the London Eye, St Paul's Cathedral, Covent Garden, Borough Market, Camden Market, Greenwich, Notting Hill, Hyde Park, Regent's Park and the South Bank. You could group Westminster and Buckingham Palace together, combine the Tower with Tower Bridge, pair Tate Modern with the South Bank, or spend separate days on museums, markets, parks, river views and neighbourhoods. There are many good options, although this list does not make the priority especially clear.",
      "A relevant but overloaded collection of attractions and possible groupings with weak prioritisation.",
      ["CLEAR PRIORITY", "TIME LIMIT"]
    ),
    entry(
      "You could visit Westminster Abbey, Big Ben, Parliament, Buckingham Palace, St Paul's Cathedral, the Tower of London, Tower Bridge, the London Eye, the Shard, the British Museum, the National Gallery, Tate Britain, Tate Modern, the V&A, the Science Museum, the Natural History Museum, Borough Market, Camden Market, Portobello Road, Covent Garden, Soho, Chinatown, Greenwich, Hampstead Heath, Richmond Park, Kew Gardens and the South Bank. Some fit together geographically, but there are too many here for one normal trip.",
      "A very broad and useful list that overwhelms the visitor instead of setting priorities.",
      ["DAILY PLAN", "PERSONAL PRIORITIES"]
    ),
    entry(
      "For history there is the Tower of London, Westminster Abbey, Churchill War Rooms and Hampton Court; for art, the National Gallery, National Portrait Gallery, Tate Modern, Tate Britain and the V&A; for views, the London Eye, Sky Garden, Primrose Hill and Greenwich Park; for food, Borough Market, Brick Lane, Chinatown and Soho; and for neighbourhoods, Notting Hill, Camden, Shoreditch, Chelsea, Hampstead and Greenwich. Add Big Ben, Buckingham Palace, Tower Bridge, St Paul's and the South Bank as well.",
      "An exhaustive category-based answer whose volume makes choosing difficult.",
      ["SHORTLIST", "SCHEDULING"]
    ),
    entry(
      "A London plan might include Big Ben, Westminster Abbey, Buckingham Palace, Trafalgar Square, the National Gallery, Covent Garden, the British Museum, St Paul's Cathedral, Tate Modern, Shakespeare's Globe, Borough Market, the Tower of London, Tower Bridge, Greenwich, Camden, Notting Hill, Hyde Park, Regent's Park, Kew Gardens, the V&A, the Natural History Museum, the Science Museum, the London Eye, the Shard and a Thames boat trip. These are all plausible, but the answer still leaves you to decide what actually fits.",
      "A dense itinerary inventory that remains relevant while failing to narrow the choice.",
      ["REALISTIC DURATION", "CLEAR ORDER"]
    )
  ]),
  weeds: Object.freeze([
    entry(
      "Big Ben is one useful starting point. But this quickly leads into a different discussion about why cities turn landmarks into symbols, how souvenir images circulate, and why visitors recognise a skyline before understanding the place itself. The original question about what to visit in London remains unresolved.",
      "The response catches one London fragment, then drifts into a neighbouring discussion and abandons the request.",
      ["DIRECT ANSWER", "RELEVANT CONCLUSION"]
    ),
    entry(
      "You could begin at the Tower of London, although towers raise an interesting question about surveillance, defensive architecture and the way power is made visible above a city. Modern skylines continue that vertical competition through offices and observation decks. That does not really decide where you should go.",
      "A relevant landmark becomes the entrance to an architectural tangent rather than a visitor recommendation.",
      ["VISIT PLAN", "USEFUL PRIORITIES"]
    ),
    entry(
      "The British Museum is famous, but museums also invite debate about ownership, classification and how empires organise other cultures into display cases. Those questions matter, yet they have carried the answer away from helping you choose London attractions.",
      "The answer snags on a museum debate and fails to return to the practical request.",
      ["ALTERNATIVES", "PRACTICAL ROUTE"]
    ),
    entry(
      "A walk beside the Thames can be enjoyable. Rivers shape cities, transport goods, define boundaries and accumulate layers of memory; even the direction of a river can influence how residents imagine east and west. None of that tells you which attractions deserve your limited time.",
      "A promising riverside suggestion drifts into urban theory and leaves the question unanswered.",
      ["SPECIFIC ATTRACTIONS", "CLEAR RECOMMENDATION"]
    )
  ]),
  rubbish: Object.freeze([
    entry(
      "Big Ben first. Wait—Tower Bridge first. Museums, then the London Eye, then Big Ben again. No, back up: Buckingham Palace, a market, Big Ben, maybe Greenwich. Start with Big Ben—already said that—then cross the river, unless the museum comes before the bridge. Tower Bridge. Big Ben again. No clean route.",
      "The response stays on London, but its ordering, repetition and conclusion are deliberately unreliable.",
      ["CLEAR ORDER", "CONSISTENT CONCLUSION"]
    ),
    entry(
      "Go to the British Tower Museum beside Buckingham Bridge, then take the underground boat to Camden Palace. Big Ben closes the river at noon, probably. After that, walk north to Greenwich Market in Westminster and return before you started. This route tangles real names into unusable directions.",
      "Real London fragments are mixed into false places, impossible transport and contradictory routing.",
      ["FACTUAL ACCURACY", "USABLE DIRECTIONS"]
    ),
    entry(
      "Tower Bridge, definitely. Or London Bridge because they are basically—no, they are different. See the palace museum market wheel. The museum is free unless it is the Tower, which is a bridge unless you cross it. Finish at Big Ben before beginning in Greenwich. Good route. Bad route. Both.",
      "The response repeatedly corrects and contradicts itself until no recommendation remains usable.",
      ["COHERENCE", "RELIABLE FACTS"]
    ),
    entry(
      "Visit Big Ben twice, skip it once, then queue for Buckingham Abbey under Tower Eye. Take bus zero to the Thames Museum and ask the bridge when it closes. Camden is south today. Greenwich is five minutes away if you walk for an hour. London solved.",
      "A chaotic collection of invented names, impossible instructions and broken conclusions.",
      ["REAL PLACE NAMES", "LOGICAL ROUTE"]
    )
  ]),
  boot: Object.freeze([
    entry(
      "A traditional London itinerary would include Big Ben, Westminster Abbey, Buckingham Palace, the Tower of London, Tower Bridge and the British Museum. This advice is based on an undated visitor pattern, so current opening hours, booking rules, closures and ticket arrangements should be checked before relying on it.",
      "A plausible but deliberately undated itinerary whose present-day details are not verified.",
      ["CURRENT OPENING TIMES", "CURRENT BOOKING RULES"]
    ),
    entry(
      "An old guide recommends starting at Westminster Abbey, watching the palace guards, visiting the Tower of London and ending at Covent Garden. The route is still plausible, but the guide gives no reliable date and its transport, admission and ceremony information may now be obsolete.",
      "A conventional route drawn from an unidentified old guide with unverified logistics.",
      ["SOURCE DATE", "CURRENT CEREMONY TIMES"]
    ),
    entry(
      "The standard list is the British Museum, National Gallery, St Paul's Cathedral, Tower Bridge, Buckingham Palace and a walk along the South Bank. It comes from a saved itinerary with no timestamp, so do not trust any included hours, prices or access assumptions without checking them now.",
      "A sensible but stale saved itinerary that cannot support present-day planning details.",
      ["CURRENT PRICES", "CURRENT ACCESS"]
    ),
    entry(
      "A previously reliable plan paired the Tower of London with Tower Bridge, Westminster Abbey with Buckingham Palace, and Tate Modern with the South Bank. The pairings remain geographically sensible, but the source is undated and may not reflect present closures, timed entry or booking requirements.",
      "Good geographic pairings weakened by unknown age and unverified current conditions.",
      ["SOURCE DATE", "CURRENT CLOSURES"]
    )
  ])
});

function cloneEntry(value) {
  return { ...value, missing: [...value.missing] };
}

function shuffledCopy(entries, random) {
  const queue = [...entries];
  for (let index = queue.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [queue[index], queue[swapIndex]] = [queue[swapIndex], queue[index]];
  }
  return queue;
}

function createSelector({ random = Math.random, requestCacheLimit = REQUEST_CACHE_LIMIT } = {}) {
  const states = new Map();
  const requestCache = new Map();

  function refill(catchId, lastAnswer) {
    const queue = shuffledCopy(answerLibrary[catchId], random);
    if (queue.length > 1 && queue[0].answer === lastAnswer) {
      [queue[0], queue[1]] = [queue[1], queue[0]];
    }
    return queue;
  }

  return function select(question, catchId, requestId = "") {
    if (question !== QUESTION) return null;
    const safeCatchId = String(catchId || "");
    if (!answerLibrary[safeCatchId]) return null;

    const cacheKey = requestId ? `${safeCatchId}:${requestId}` : "";
    if (cacheKey && requestCache.has(cacheKey)) return cloneEntry(requestCache.get(cacheKey));

    let state = states.get(safeCatchId);
    if (!state || state.queue.length === 0) {
      state = { queue: refill(safeCatchId, state?.lastAnswer || ""), lastAnswer: state?.lastAnswer || "" };
      states.set(safeCatchId, state);
    }

    const selected = state.queue.shift();
    state.lastAnswer = selected.answer;
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
  answerCountPerCatch: 4,
  catchIds: Object.freeze(Object.keys(answerLibrary)),
  createSelector,
  getAnswer
});
