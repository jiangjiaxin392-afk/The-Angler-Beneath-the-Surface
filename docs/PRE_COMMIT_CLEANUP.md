# Pre-commit Cleanup

Completed: 2026-08-02

## Purpose

Prepare the long-running dirty worktree for a reviewable Git commit without deleting valid runtime art or breaking the game.

## Repository audit

- Local `main` matched `origin/main` before cleanup: zero commits ahead and zero behind.
- No files were staged, committed, or pushed during the audit.
- No secrets, access tokens, private keys, or non-empty environment files were found.
- No prospective repository file exceeded 20 MB; the largest was approximately 4.52 MB.
- The external art archive was present and representative source families were recoverable.

## Legacy tools moved

The following tools only target superseded files that are no longer loaded by `sketch.js`:

- `tools/generate-river-background.ps1`
- `tools/build-result-screen-frame.py`
- `tools/build-result-ui-v2-components.py`
- `tools/normalize-angler-gameplay-v1.py`
- `tools/normalize-angler-idle-v1.py`
- `tools/prepare-angler-rod-frames-v1.py`

They were moved unchanged to the external legacy-tool archive. Current-asset builders remain in the project and are documented in `docs/TOOLING.md`.

## Git rule

The working tree remains dirty until the reviewed code, final runtime assets, documentation, and intentional deletions are staged and committed together. Dirty status at this point represents pending work, not corruption.

## Final verification

- `node --check` passed for `app.js`, `sketch.js`, and every retained JavaScript build tool.
- Python compilation passed for every retained Python tool and maintenance script.
- All 36 statically resolvable `public/images/` references in `sketch.js` existed.
- Browser regression covered three waters multiplied by five weather conditions, plus water selection, weather selection, tackle selection, toolbox, impact transition, catch result, and catch archive: 22 preview states in total.
- Canvas size remained 1920 x 1080.
- Browser console errors: 0.
- The 36 existing Canvas2D `willReadFrequently` performance warnings remain unchanged.
- `http://localhost:3001` remained available throughout the cleanup.
