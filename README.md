# The Angler: Beneath the Surface?

A screen-based interactive artwork using lure fishing as a metaphor for AI prompting, judgement, and review.

## Current Project

The game currently includes:

- three fishing locations: Daylight River, Signal Canal, and Sunken Reservoir;
- five distinct weather conditions with location-aware backgrounds and animation layers;
- fishing, bite, tension, landing, and catch-result flows;
- living-room, tackle-box, toolbox, water-selection, catch-result, and catch-archive interfaces;
- layered hand-drawn animation assets, including separate character-and-rod frames and the hooked-fish transition.

The runtime art direction uses hand-drawn comic linework, pixel texture, bold flat colour, and limited gradients. Animation should use real independent frames or intentionally separated art layers rather than a single mechanically moved image.

## Project Structure

```text
public/             deployable fonts, images, sounds, and local vendor files
scripts/            small maintenance scripts for active assets
tools/              asset build and audit tools
docs/               asset inventory, cleanup, deployment, and tooling notes
index.html          main page
sketch.js           p5.js game, scene, animation, and interaction logic
style.css           page and canvas layout
app.js              local Node.js server
```

Editable source sheets, superseded art, review exports, and backups are not part of the deployable tree. They are preserved in the external archive documented in [docs/CLEANUP_PHASE_2.md](docs/CLEANUP_PHASE_2.md).

## Run Locally

From the project folder:

```powershell
npm.cmd install
node app.js
```

Then open `http://localhost:3001`.

If PowerShell permits npm scripts, `npm install` and `npm start` work as well. Keep the local server running while testing changes and use `Ctrl + C` only when intentionally stopping it.

## Deployment

The local server exposes the root entry files and `public/`. The deployment set is:

```text
index.html
sketch.js
style.css
public/
```

Do not deploy the external archive, `output/`, `.playwright-cli/`, environment files, or build caches. See [docs/DEPLOYMENT_ASSETS.md](docs/DEPLOYMENT_ASSETS.md) for the verified asset groups.

## Asset Tooling

Some build tools operate directly on the current runtime tree. Others require their editable source sheets to be restored temporarily from the external archive. See [docs/TOOLING.md](docs/TOOLING.md) before running anything in `tools/` or `scripts/`.

Do not regenerate an existing valid runtime asset merely because its source tool is present.
