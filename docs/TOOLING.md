# Asset Tooling

Last audited: 2026-08-02

The game does not need any file in `tools/` or `scripts/` at runtime. These files exist only to rebuild, normalize, or audit art assets.

## Safety rules

- Keep `http://localhost:3001` running while making and testing game changes.
- Do not run a builder merely to check whether it works: most builders overwrite their output paths.
- Back up or compare the current output before rebuilding a valid asset.
- Restore required source art by copying it from the external archive; do not move the archive copy back.
- Never deploy source sheets, audit exports, `.playwright-cli`, `output`, or `__pycache__`.

External source root:

```text
C:\Users\yep\Desktop\The-Angler-Beneath-the-Surface-Archive\art-sources-and-legacy\2026-08-02
```

Files below that root retain their original project-relative paths.

## Operates on current project files

| Tool | Purpose | Caution |
| --- | --- | --- |
| `tools/build-weather-modules.js` | Rebuilds procedural weather-effect modules. | Overwrites `public/images/weather-modules/`. |
| `tools/normalize-toolbox-v2.py` | Normalizes active toolbox box frames. | Modifies the active frames in place. |
| `scripts/extend_remote_sleeves.py` | Extends active living-room remote sleeves. | Modifies the active remote frames in place. |

## Rebuilds current assets after restoring sources

| Tool | Current output or role | Source family to restore first |
| --- | --- | --- |
| `tools/audit-location-animation-frames.py` | Location animation contact sheets in `output/`. | Location animation objects and sources. |
| `tools/build-archive-ui-v2-assets.py` | Active catch-archive UI components. | `public/images/archive-ui-v2/alpha/` and related sources. |
| `tools/build-hooked-angler-fullbody.py` | Active hooked-transition v4 angler layer. | Hooked-transition v3/v4 source layers. |
| `tools/build-hooked-transition-assets.py` | Upstream hooked-transition layers used by v2. | Hooked-transition source sheets. |
| `tools/build-hooked-transition-v2-assets.py` | Active hooked-transition v2 layers and droplets. | Hooked-transition v1/v2 sources. |
| `tools/build-location-animation-frames.py` | Active location-specific animation frames. | `location-backgrounds/animation-sources-v2/`. |
| `tools/build-modular-storm-clouds.py` | Active Signal Canal and Sunken Reservoir storm clouds. | `location-backgrounds/animation-sources-v2/`. |
| `tools/build-result-ui-v3-assets.py` | Active catch-result UI components and icons. | `public/images/result-ui-v3/alpha/` and related sources. |
| `tools/build-scene-layers.js` | Active Daylight River root scene layers. | Root scene build inputs, including background and masks. |
| `tools/build-signal-canal-hook-opaque.py` | Active Signal Canal crane-hook frames. | Location animation source sheets. |
| `tools/build-tackle-ui-v2-components.js` | Active tackle-selection UI components. | `public/images/tackle-ui-v2/components/sources/`. |
| `tools/build-weather-scene-frames.js` | Active layered weather-scene frames. | `public/images/weather-scene/sources/`. |
| `tools/extend-toolbox-hand-frames.py` | Active extended toolbox v3 hand frames. | Original toolbox v2 hand frames. |

## Archived legacy tools

Tools that only generated superseded assets were moved to:

```text
C:\Users\yep\Desktop\The-Angler-Beneath-the-Surface-Archive\project-tools-legacy\2026-08-02-pre-commit\tools
```

They are preserved unchanged and can be recovered if an old asset version ever needs to be reconstructed. The moved file list is recorded in `docs/PRE_COMMIT_CLEANUP.md`.
