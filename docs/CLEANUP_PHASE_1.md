# Cleanup Phase 1

Completed: 2026-08-02

## Recovery point

The pre-cleanup copies and tracked-change patch are stored outside the repository at:

`C:\Users\yep\Desktop\The-Angler-Beneath-the-Surface-Archive\recovery-snapshots\2026-08-02-phase1-before`

The snapshot contains the modified HTML, JavaScript and CSS plus the server, ignore rules, README, package files, and a binary-capable Git patch.

## Reversibly archived temporary material

- `.playwright-cli/` -> `qa-captures/2026-08-02/playwright-cli/`
- `output/` -> `qa-captures/2026-08-02/output/`
- `remote-current-contact.jpg` -> `references/temporary-locators/`
- `remote-problem-locator.jpg` -> `references/temporary-locators/`
- `tools/__pycache__/` -> `generated-cache/tools-pycache/`

No file under `public/images` was moved or regenerated.

## Project safeguards added

- Browser/QA output and Python caches are now ignored by Git.
- The Node server now exposes only `index.html`, `sketch.js`, `style.css`, and files below `public/`.
- Requests for `.env`, `.git`, `tools`, `package.json`, and traversal outside `public/` return 404.
- The existing service on port 3001 was left running while the new server behavior was tested on port 3002.

## Verification

- JavaScript syntax checks passed for `app.js` and `sketch.js`.
- Allowed runtime endpoints returned 200.
- Sensitive and development-only endpoints returned 404.
- The real browser produced one 1920 x 1080 canvas.
- Water selection, weather selection, tackle, toolbox, result, archive, three water/weather previews, and hooked-transition timing previews were opened.
- Browser console errors: 0.
- Repeated Canvas2D `willReadFrequently` performance warnings remain as pre-existing technical debt.
