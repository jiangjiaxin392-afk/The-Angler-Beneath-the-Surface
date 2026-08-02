# Asset Inventory

Last audited: 2026-08-02

This file separates browser runtime assets from editable sources, review exports, and superseded versions. Cleanup phase 1 was intentionally conservative. Cleanup phase 2 moved confirmed non-runtime material to an external, reversible archive.

## Confirmed runtime roots

The following paths are loaded by `index.html` or `sketch.js`, including paths assembled dynamically at runtime:

- `public/vendor/p5.min.js`
- `public/fonts/RetroSans.ttf`
- `public/images/angler-redraw-v1/combined-v1/frames-alpha/`
- `public/images/location-backgrounds/signal-canal/background.png`
- `public/images/location-backgrounds/signal-canal/animations/`
- `public/images/location-backgrounds/sunken-reservoir/background.png`
- `public/images/location-backgrounds/sunken-reservoir/animations/`
- `public/images/tackle-ui-v2/components/final/`
- `public/images/result-ui-v3/components/`
- `public/images/result-ui-v3/icons/`
- `public/images/archive-ui-v2/components/`
- `public/images/result-effects-v2/hooked-transition-v2/`
- `public/images/result-effects-v2/hooked-transition-v4/`
- `public/images/living-room-sequence/beer-clean-20-frames/`
- `public/images/living-room-sequence/remote-20-frames/`
- `public/images/living-room-sequence/idea-frames/`
- `public/images/living-room-sequence/tv-frames/`
- `public/images/living-room-sequence/target-fish/`
- `public/images/toolbox-sequence/01-workroom-background.png`
- `public/images/toolbox-sequence/v2/toolbox-frames/`
- `public/images/toolbox-sequence/v3/right-hand-frames/`
- `public/images/toolbox-sequence/v3/left-hand-frames/`
- `public/images/water-select/`
- `public/images/weather/`
- `public/images/weather-modules/`
- `public/images/weather-scene/{weather}/back-*.png`
- `public/images/weather-scene/{weather}/water-*.png`
- `public/images/weather-scene/{weather}/front-*.png`
- Root-level scene, catch, backpack, interaction, and sprite-sheet images explicitly loaded in `preload()`.

## Archived source and legacy material

The following groups were moved outside the deployable project after code-path and browser-network audits:

- `public/images/angler-redraw-v1/gameplay-v1/`
- `public/images/angler-redraw-v1/idle/`
- `public/images/angler-redraw-v1/rods-v1/`
- `public/images/location-backgrounds/animation-sources/`
- `public/images/location-backgrounds/animation-sources-v2/`
- `public/images/location-backgrounds/review/`
- Living-room folders containing `source`, `backup`, `before-*`, or `archive` in their names.
- `public/images/toolbox-sequence/source-sheets/`
- `public/images/toolbox-sequence/v2/source-sheets/`
- Old toolbox frame folders outside the active v2/v3 paths.
- `public/images/result-effects-v2/concepts/`
- Superseded result-effect transition versions.
- `public/images/result-ui-v2/`
- `public/images/result-ui-v3/sources/`
- `public/images/result-ui-v3/alpha/`
- `public/images/tackle-ui-v2/components/sources/`
- `public/images/tackle-ui-v2/components/alpha/`
- `public/images/tackle-ui-v2/components/legacy-styled-controls/`
- `public/images/archive-ui-v2/sources/`
- `public/images/archive-ui-v2/alpha/`
- `public/images/weather-scene/sources/`

Additional archived material includes unused UI component duplicates, old non-transparent catch images, legacy root-level sprite sheets, living-room preview/audit images, unused canal object layers, and the two superseded angler alpha frames.

The preserved archive mirrors the original folder structure at:

`C:\Users\yep\Desktop\The-Angler-Beneath-the-Surface-Archive\art-sources-and-legacy\2026-08-02`

Some archived files are inputs to the build tools. Restore the mirrored source path before rebuilding an old asset family. The already-built runtime game does not depend on those files.

## Runtime files whose names look like sources

These files remain deliberately because `sketch.js` loads them directly:

- `public/images/archive-catches-native-source.png`
- `public/images/backpack-open-native-source.png`
- `public/images/catch-results-native-source.png`
- `public/images/target-shadows-native-source.png`
- `public/images/tackle-ui-v2/tackle-ui-overlay-v1-alpha.png`
- `public/images/angler-redraw-v1/combined-v1/frames-alpha/`

## Rules for later cleanup

1. Never archive a file merely because its containing folder looks old.
2. Check literal references, dynamically constructed paths, and build-tool inputs.
3. Test all three waters and every weather after each asset batch is moved.
4. Move to the external archive first; delete only after a later confirmed checkpoint.
