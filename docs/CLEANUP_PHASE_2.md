# Cleanup Phase 2

Completed: 2026-08-02

## Objective

Remove editable sources, superseded art, review exports, previews, and duplicate backups from the deployable `public/images` tree without changing the running game.

## Recovery

Pre-phase code copies and a tracked-change patch are stored at:

`C:\Users\yep\Desktop\The-Angler-Beneath-the-Surface-Archive\recovery-snapshots\2026-08-02-phase2-before`

Every moved asset retains its original relative path under:

`C:\Users\yep\Desktop\The-Angler-Beneath-the-Surface-Archive\art-sources-and-legacy\2026-08-02`

No archived asset was deleted, recompressed, resized, or regenerated.

## Result

- Archived files: 730
- Archived size: approximately 429.2 MB
- `public/images` before phase 2: 1,338 files, approximately 620 MB
- `public/images` after phase 2: runtime-focused tree of 608 files and approximately 190.7 MB

The archive contains old angler versions, living-room source and backup sequences, toolbox source sheets and old hands, UI sources and alpha intermediates, legacy result effects, water-location build sources and review exports, weather sources, old opaque catch art, and root-level build intermediates.

## Runtime verification

- Baseline runtime assets were recorded before moving files.
- Each asset family was tested from a fresh browser context after its batch moved.
- Final verification used another fresh browser context to avoid cache masking missing files.
- Tested three waters multiplied by five weather conditions.
- Tested water selection, weather selection, tackle selection, toolbox, result, archive, and three hooked-transition time points.
- Canvas size: 1920 x 1080.
- Browser console errors: 0.
- Existing Canvas2D `willReadFrequently` performance warnings remain unchanged.
- The original port 3001 service remained running throughout.
