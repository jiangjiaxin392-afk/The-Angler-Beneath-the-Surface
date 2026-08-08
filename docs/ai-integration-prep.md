# AI integration contract

This document records the AI boundary in `sketch.js`. The browser loads `public/js/ai-client.js`, which calls server-only routes in `app.js`. The OpenAI key is read from the server environment and is never sent to the browser.

## Player-facing meaning

- The question is the player's target and is never rewritten by weather.
- The selected water chooses the model/tool family.
- The selected tackle adds prompting constraints: framing, tone, length and answer process.
- Weather changes fishing difficulty and the probability of the answer/catch archetype.
- There is no system-declared target fish or correct answer. The player judges every surfaced answer.

## Recommendation state

`game.aiRecommendation` contains `waterId`, `tackleId`, short reasons, a source and a revision. OpenAI returns it asynchronously; the local heuristic remains a failure fallback. A recommendation is indicated by the hand-drawn lightbulb asset and never auto-selects an option.

## Per-cast request

Every real cast creates a new `game.currentCast` with a unique request ID and freezes:

- question
- water/model
- tackle configuration
- weather telemetry
- weather-weighted catch archetype
- a variation angle
- up to ten recent semantic core-and-angle records for the current target

`buildAiRequestPayload()` is the service boundary. Weather appears only as gameplay telemetry; the generated answer is shaped by the already-selected catch archetype. `requestAiCatch()` sends this payload to `window.AnglerAI.generate()` once per cast.

## Dynamic result and archive

`game.currentCatch` is a runtime result object rather than a direct reference to static catch data. It uses explicit fallback text only while OpenAI is unavailable, delayed or failed. A late AI result replaces the fallback and also updates an already-saved matching archive entry. Saved catches retain their actual answer, response label, summary, missing checks, configuration, variation angle, request ID, fingerprint, semantic core, answer angle and revision.

The `RIVER RUBBISH` archetype must display `CHAOTIC ANSWER`. Its generated text must remain related to the current question while being visibly disordered through repetition, fragments or mixed structure. It must not use unrelated canned jokes or fabricate dangerous facts. `YELLOW PERCH` is a brief answer and receives no warning label.

## Server AI implementation

The browser adapter exposes `window.AnglerAI.recommend()` and `window.AnglerAI.generate()`. It posts to `/api/ai/recommend` and `/api/ai/generate`. The server validates the request, rate-limits callers, applies location/model, tackle and catch-shape constraints, then requests strict structured output from the OpenAI Responses API. Signal Canal enables web search; Sunken Reservoir uses a higher reasoning effort.

Each generated catch classifies the target as `fixed`, `limited` or `open` and returns a stable semantic core ID plus an angle ID. Simple arithmetic and other canonical facts may repeat their truthful core. For an open target, the first six visible catches must use different cores; after that, a revisited core must add a different angle rather than merely changing sentence structure. The server validates this metadata and can reject and retry a shallow paraphrase. Only compact core summaries are returned on later casts, capped at ten entries, so the rule does not grow the prompt with complete previous answers.

`/api/ai/status` reports only whether configuration is present and which default model is selected. It never returns the API key. API keys must remain in `.env` locally or in deployment environment variables and must never be placed in `sketch.js`, `index.html` or the browser adapter. `public/js/mock-ai.js` remains an inactive development reference and is not loaded by `index.html`.
