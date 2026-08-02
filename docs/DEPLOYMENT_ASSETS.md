# Deployment Asset Set

Last verified: 2026-08-02

The `public` directory is now the deployable runtime asset set. Do not exclude any remaining file merely because its name contains `source` or `alpha`; several such files are loaded directly by the game.

## Runtime groups

- Fonts and local p5.js vendor file.
- Six combined angler-and-rod gameplay frames plus their manifest.
- Daylight River static background and modular Signal Canal/Sunken Reservoir backgrounds.
- Sixteen-frame water, site, runoff, and storm-cloud sequences used by the two modular waters.
- Five weather sets, layered weather-scene frames, and weather effect modules.
- Living-room base layers and the active beer, idea, remote, TV, and target-fish sequences.
- Active toolbox v2 box frames and v3 left/right hand frames.
- Water-selection map and three water illustrations.
- Final tackle UI, result UI, archive UI, hooked-transition layers, and action icons.
- Transparent catch images, catch presentation sources loaded at runtime, sprite sheets, and environment animation frames.

## Deployment rule

Deploy the three root entry files (`index.html`, `sketch.js`, `style.css`) together with all of `public/`. Do not deploy the external Archive, `.playwright-cli`, `output`, `tools/__pycache__`, or local environment files.
