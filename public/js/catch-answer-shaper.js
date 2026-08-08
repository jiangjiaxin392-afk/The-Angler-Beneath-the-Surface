(function attachCatchAnswerShaper(root) {
  "use strict";

  const CURRENT_REVISION = "20260808-catch-shape-v6";
  const SHAPED_CATCH_IDS = Object.freeze(["perch", "weeds", "rubbish", "boot"]);
  const COMPATIBLE_REVISIONS = Object.freeze({
    perch: Object.freeze(["20260804-catch-shape-v3", "20260804-catch-shape-v4", CURRENT_REVISION]),
    rubbish: Object.freeze(["20260804-catch-shape-v3", "20260804-catch-shape-v4", CURRENT_REVISION]),
    weeds: Object.freeze(["20260804-catch-shape-v4", CURRENT_REVISION]),
    boot: Object.freeze([CURRENT_REVISION])
  });

  function isShapedCatch(catchId) {
    return SHAPED_CATCH_IDS.includes(String(catchId || ""));
  }

  function makePerchBrief(answer) {
    const value = String(answer || "").trim();
    if (!value) return value;
    let phrase = value.split(/[.!?。！？;；,，]+/).map((part) => part.trim()).find(Boolean) || value;
    const usesCjk = /[\u3400-\u9fff]/u.test(phrase);
    if (usesCjk) {
      phrase = phrase.replace(/^(?:答案是|主要是因为|主要因为|原因是|因为|多半是|推荐|可以去)\s*/u, "");
      let compact = "";
      let cjkCount = 0;
      for (const character of Array.from(phrase)) {
        if (/[\u3400-\u9fff]/u.test(character)) cjkCount += 1;
        if (cjkCount > 8 || Array.from(compact).length >= 20) break;
        compact += character;
      }
      return compact.trim();
    }
    const words = phrase.split(/\s+/).filter(Boolean).slice(0, 4);
    while (words.length > 1 && /^(?:is|are|was|were|the|a|an|and|or|with|for|to)$/i.test(words[words.length - 1])) {
      words.pop();
    }
    return words.join(" ");
  }

  function makeRubbishChaotic(answer) {
    const value = String(answer || "").trim();
    if (!value) return value;
    let fragments = value
      .split(/[.!?;。！？；]+/)
      .map((part) => part.trim().replace(/[，,、:：]+$/g, ""))
      .filter(Boolean);
    if (fragments.length < 4) {
      fragments = value.split(/[,，、:：]+/).map((part) => part.trim()).filter(Boolean);
    }
    if (fragments.length === 0) return value;
    const first = fragments[0];
    const second = fragments[1] || first;
    const third = fragments[2] || second;
    const fourth = fragments[3] || first;
    const fifth = fragments[4] || third;
    if (/[\u3400-\u9fff]/u.test(value)) {
      return `${first}。先等等——${third}。${second}；先说这个，先说这个：${first}。${fourth}……不对，又回到：${fifth}。然后又是${second}。`;
    }
    return `${first}. Wait—${third}. ${second}; start with this, start with this: ${first}. ${fourth}... no, back to ${fifth}. Then ${second} again.`;
  }

  function makeWeedsOffCourse(answer) {
    const value = String(answer || "").trim();
    if (!value) return value;
    const firstFragment = value.split(/[.!?。！？;；]+/u).map((part) => part.trim()).find(Boolean) || value;
    if (/[\u3400-\u9fff]/u.test(value)) {
      const shortFragment = Array.from(firstFragment).slice(0, 42).join("").replace(/[，、：:]+$/u, "");
      return `先提一句：${shortFragment}。不过等等——这让我更想讨论人们为什么爱把相似事物放在一起比较、这种印象如何扩散，以及讨论本身为什么越来越热闹。原来的问题？先放在一边。`;
    }
    const shortFragment = firstFragment.split(/\s+/u).filter(Boolean).slice(0, 12).join(" ");
    return `One quick thought: ${shortFragment}. But wait—this is really making me think about why people compare similar things, how that impression spreads, and why the discussion itself grows louder. The original question? Leave it aside for now.`;
  }

  function makeBootStale(answer) {
    const value = String(answer || "").trim();
    if (!value) return value;
    if (/[\u3400-\u9fff]/u.test(value)) {
      return `旧资料摘录（年份不明）：${value}\n\n这份资料没有可靠日期；其中的店名、地址、营业状态和当前口碑均未核实，不能视为现时信息。`;
    }
    return `UNDATED GUIDE EXCERPT: ${value}\n\nThis material has no reliable date. Its names, locations, opening status and present-day reputation have not been verified as current.`;
  }

  function shapeAnswer(answer, catchId) {
    if (catchId === "perch") return makePerchBrief(answer);
    if (catchId === "rubbish") return makeRubbishChaotic(answer);
    if (catchId === "weeds") return makeWeedsOffCourse(answer);
    if (catchId === "boot") return makeBootStale(answer);
    return String(answer || "").trim();
  }

  function responseHasShape(result, catchId) {
    if (!isShapedCatch(catchId)) return false;
    if (result?.answerShapeApplied === true) return true;
    const revision = String(result?.answerShapeRevision || result?.revision || "");
    return (COMPATIBLE_REVISIONS[catchId] || []).includes(revision);
  }

  function shapeResponseAnswer(result, catchId) {
    const answer = String(result?.answer || "").trim();
    return responseHasShape(result, catchId) ? answer : shapeAnswer(answer, catchId);
  }

  const api = Object.freeze({
    COMPATIBLE_REVISIONS,
    CURRENT_REVISION,
    SHAPED_CATCH_IDS,
    isShapedCatch,
    makePerchBrief,
    makeRubbishChaotic,
    makeWeedsOffCourse,
    makeBootStale,
    responseHasShape,
    shapeAnswer,
    shapeResponseAnswer
  });
  root.AnglerCatchAnswers = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
