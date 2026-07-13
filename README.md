# The Angler: Beneath the Surface?

A screen-based interactive artwork using lure fishing as a metaphor for AI prompting and judgement.

## Current Goal

Build the first playable fishing prototype:

```text
aim -> cast -> retrieve -> read the bite -> control tension -> land or lose the catch
```

## Structure

```text
docs/              image references and sketches
public/fonts/      font files
public/images/     static pixel-art environment layers
public/sounds/     sound files
index.html         main page
sketch.js          p5.js game and interaction logic
style.css          full-screen layout
app.js             Node.js server
```

## Run Locally

Open the project folder in VS Code, open the terminal, and run:

```powershell
npm.cmd install
node app.js
```

Then open `http://localhost:3001` in a browser. Press `Ctrl + C` in the terminal to stop the server.

If PowerShell allows npm scripts on your computer, `npm install` and `npm start` also work.

## Notes

`public/images/river-background.png` contains the static 1920 x 1080 environment. `sketch.js` adds clouds, water glints, reeds, the angler, fishing line, fish signals, effects, and interface elements at runtime. The background and animation layers share the same limited palette and two-pixel grid.

The source generator for the background is kept in `tools/generate-river-background.ps1` so the asset can be reproduced without generative-image software.
