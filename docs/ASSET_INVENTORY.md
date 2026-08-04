# Asset Inventory

Last audited: 2026-08-04

This file separates browser runtime assets from editable sources, review exports, and superseded versions. Cleanup phase 1 was intentionally conservative. Cleanup phase 2 moved confirmed non-runtime material to an external, reversible archive.

## Confirmed runtime roots

The following paths are loaded by `index.html` or `sketch.js`, including paths assembled dynamically at runtime:

- `public/vendor/p5.min.js`
- `public/fonts/RetroSans.ttf`
- `public/fonts/SmileySans-Oblique.ttf`
- `public/js/ai-client.js`
- `public/audio/music/ahedarexia-blue-g-172788.mp3`
- `public/audio/music/fishing-scenes-japanese-music-560316.mp3`
- `public/audio/sfx/opening-a-bottle-of-beer-trimmed.mp3`
- `public/audio/sfx/drinking-from-aluminum-can-80082.mp3`
- `public/audio/sfx/hmmm-idea-male-420028.mp3`
- `public/audio/sfx/remote-button-press-382713.mp3`
- `public/audio/sfx/old-tube-tv-opening-first-second.mp3`
- `public/audio/sfx/tv-static-noise-291374.mp3`
- `public/audio/sfx/toolbox-opening-40366.mp3`
- `public/audio/sfx/toolbox-rummaging-35825.mp3`
- `public/audio/sfx/rod-charge-tighten-199797.mp3`
- `public/audio/sfx/fishing-rod-whoosh-411640.mp3`
- `public/audio/sfx/casting-grunt-103204.mp3` (unaltered source copy)
- `public/audio/sfx/casting-grunt-start-0.5s-103204.mp3` (superseded timing test; retained)
- `public/audio/sfx/casting-grunt-start-0.22s-103204.mp3` (active game copy; leading silence removed without cutting the grunt)
- `public/audio/sfx/fish-jumping-splash-2-96871.mp3` (unaltered source copy)
- `public/audio/sfx/fish-jumping-splash-2-start-0.06s-96871.mp3` (superseded timing version; retained)
- `public/audio/sfx/fish-jumping-splash-2-start-0.56s-96871.mp3` (superseded timing version; retained)
- `public/audio/sfx/fish-jumping-splash-2-start-0.86s-96871.mp3` (active bite/hooked loop; advanced by an additional 0.3s)
- `public/audio/sfx/fishing-reel-302355.mp3` (active hooked-state reel loop; unaltered source copy)
- `public/audio/sfx/landing-congratulations-source-334724.mp3` (unaltered source copy)
- `public/audio/sfx/landing-victory-source-357606.mp3` (superseded Peekaboo source copy; retained)
- `public/audio/sfx/landing-congratulations-trimmed-334724.mp3` (active first landing cue; leading/trailing silence removed)
- `public/audio/sfx/landing-victory-trimmed-357606.mp3` (superseded Peekaboo timing version; retained)
- `public/audio/sfx/landing-water-splash-source-352021.mp3` (unaltered source copy)
- `public/audio/sfx/landing-water-splash-start-0.13s-352021.mp3` (active loud catch-reveal splash; leading silence removed)
- `public/audio/sfx/landing-yeah-source-7106.mp3` (unaltered Freesound source copy)
- `public/audio/sfx/landing-yeah-trimmed-7106.mp3` (active second landing cue; leading/trailing silence removed)
- `public/audio/sfx/landing-oh-yeah-source-407752.mp3` (unaltered Saboteur Comics source copy)
- `public/audio/sfx/landing-oh-yeah-trimmed-407752.mp3` (active third landing cue; leading/trailing silence removed)
- `public/audio/ambience/gentle-rain-07-437321.mp3` (unaltered rain ambience; quiet in rain, louder in storm)
- `public/audio/ambience/thunderstorm-14708.mp3` (unaltered storm-only thunder ambience)
- `public/audio/manifest.json`
- `public/images/exhibition-cover/`
- `public/images/how-to-play/page-*-v3.png`
- `public/images/recommendation-ui-v1/`
- `public/images/angler-redraw-v1/combined-v1/frames-alpha/`
- `public/images/location-backgrounds/signal-canal/background.png`
- `public/images/location-backgrounds/signal-canal/animations/`
- `public/images/location-backgrounds/sunken-reservoir/background.png`
- `public/images/location-backgrounds/sunken-reservoir/animations/`
- `public/images/tackle-ui-v2/components/final/`
- `public/images/result-ui-v3/components/`
- `public/images/result-ui-v3/icons/`
- `public/images/archive-ui-v2/components/`
- `public/images/archive-ui-v3/components/`
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

## Runtime loading audit (2026-08-04)

- The exhibition cover initially observed 250 browser resources totalling about 84 MB on disk: 227 images (79.6 MB), 2 fonts (2.53 MB), 7 scripts (1.22 MB), 13 partial/audio requests (0.66 MB), and the stylesheet.
- HOW TO PLAY page 1 remains in p5 `preload()` so the instructions open immediately.
- HOW TO PLAY pages 2-5 are requested only after HOW TO PLAY is opened. This removes four initial image requests and about 10.9 MB from a normal Start Experience visit.
- Exact duplicate files total about 30.17 MB across the deployable tree. Most are intentional repeated animation frames or weather layers. They remain untouched because animation timing and independent-frame requirements take precedence over disk deduplication.
- No image or audio was recompressed, overwritten, moved, or deleted during this audit.

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

## Juvenile perch v2

`public/images/perch-v2/` contains the versioned juvenile-perch redraw used by
the living-room target, television shadow, result scene and catch archive. The
`*-source-magenta.png` files are preserved generation
sources; the four shorter filenames are the transparent runtime assets. Do not
replace them with the older adult-perch cells embedded in the native sheets.

## Rules for later cleanup

1. Never archive a file merely because its containing folder looks old.
2. Check literal references, dynamically constructed paths, and build-tool inputs.
3. Test all three waters and every weather after each asset batch is moved.
4. Move to the external archive first; delete only after a later confirmed checkpoint.
