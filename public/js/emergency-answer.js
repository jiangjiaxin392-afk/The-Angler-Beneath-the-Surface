(function attachEmergencyAnswer(root) {
  "use strict";

  function emergencyPerchAnswer(question, usesChinese) {
    const value = String(question || "").toLocaleLowerCase();
    if (/(?:伦敦|london)/u.test(value)) return usesChinese ? "大本钟" : "Big Ben";
    if (/(?:矿物|矿泉|好喝|口感|mineral|water|drink|taste)/u.test(value)) {
      return usesChinese ? "低矿物质" : "Low minerals";
    }
    if (/(?:宇宙战|机克德|4-5费|启动|防不住|counter|defen[cs]e|启动核心)/u.test(value)) {
      return usesChinese ? "优先拆启动核心" : "Break the engine";
    }
    if (/(?:哪里|哪儿|where|place|visit)/u.test(value)) return usesChinese ? "去核心地点" : "Visit the landmark";
    if (/(?:为什么|为何|why)/u.test(value)) return usesChinese ? "核心原因" : "The main cause";
    return usesChinese ? "先解决核心问题" : "Address the core issue";
  }

  function emergencyAnswer(question, catchId) {
    const usesChinese = /[\u3400-\u9fff]/u.test(String(question || ""));
    const answers = usesChinese
      ? {
          default: "AI 信号中断，未能生成答案。请再次抛投重试。",
          boot: "服务未能生成当前答案，因此这次结果无法验证。",
          perch: emergencyPerchAnswer(question, true),
          rubbish: "信号来了——等等，不对；先是碎片，又回到开头，最后仍没有结论。",
          weeds: "信号刚碰到问题就偏离了方向，最后没有回到可用答案。"
        }
      : {
          default: "The AI signal dropped before an answer arrived. Cast again to retry.",
          boot: "The service could not produce a current answer, so this result cannot be verified.",
          perch: emergencyPerchAnswer(question, false),
          rubbish: "The signal arrived—wait, no; fragments first, back to the start, then nothing conclusive.",
          weeds: "The signal touched the question, drifted away, and never returned to a usable answer."
        };
    return answers[catchId] || answers.default;
  }

  const api = Object.freeze({ emergencyAnswer });
  root.AnglerEmergencyAnswer = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
