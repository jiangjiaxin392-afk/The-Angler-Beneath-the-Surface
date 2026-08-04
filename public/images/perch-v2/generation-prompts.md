# Juvenile perch v2 generation prompts

Built-in image generation was used in `stylized-concept` / `precise-object-edit`
mode. Each output used a flat magenta chroma-key backdrop, followed by the
imagegen skill's local chroma-key removal helper.

## Standalone juvenile perch

```text
Use case: stylized-concept
Asset type: independent game sprite for a hand-drawn pixel-comic fishing game
Input image: style and species reference only; redraw the fish as a new asset and do not include the hands, sleeves, water, frame, or UI
Primary request: a clearly tiny juvenile yellow perch, unmistakably much smaller and slimmer than the reference fish
Subject: left-facing side profile of one juvenile European/yellow perch, compact 10–15 cm impression, short narrow body, relatively large eye, small mouth, delicate fins, yellow-olive body with crisp dark vertical bars and orange pelvic/tail fins
Style/medium: match the game's gritty hand-inked comic illustration with visible black outlines, stippling, limited flat color, subtle pixel texture, no smooth glossy realism, no gradients
Composition: fish fully visible, horizontal, centered, generous padding, level side view, no rotation, no perspective distortion
Scene/backdrop: perfectly flat solid #ff00ff chroma-key background for background removal
Constraints: redraw from scratch; strong readable small-fish silhouette; anatomically plausible perch; crisp edges; no cast shadow; no contact shadow; no reflection; no text; no watermark; do not use #ff00ff in the fish
Avoid: trophy fish proportions, thick bulky body, oversized adult fish, photorealistic studio lighting, extra objects, fishing line, hook, hands
```

## Hands holding juvenile perch

```text
Use case: precise-object-edit
Asset type: catch-result foreground sprite for a hand-drawn pixel-comic fishing game
Input images: Image 1 is the composition, hands, dark teal knitted sleeves, ink texture and game-style reference; Image 2 is the exact new juvenile perch design reference
Primary request: redraw the entire sprite as two adult angler hands gently holding a clearly tiny juvenile perch from Image 2
Subject: the fish must look only about 10–15 cm long, roughly palm-length and no more than 45% of the old fish width; fingers much closer together; left-facing side profile; large juvenile eye, narrow body, dark vertical bars, orange fins
Style/medium: match Image 1's gritty hand-inked comic linework, stippling, limited flat colors and subtle pixel texture; preserve the same dark teal sleeve design and first-person viewpoint
Composition: portrait/square game sprite; both forearms rise from bottom corners; hands and fingertips fully visible; tiny fish centered in the upper-middle with generous clear space around it; fish held delicately without covering its identifying bars
Scene/backdrop: perfectly flat solid #ff00ff chroma-key background
Constraints: redraw rather than reuse the old fish; retain natural human anatomy and sleeve continuity; crisp isolated silhouette; no cast shadow; no contact shadow; no water; no UI; no frame; no text; no watermark; do not use #ff00ff in subject
Avoid: large trophy fish, hands spread far apart, fish wider than both palms together, bulky adult perch, photorealistic studio lighting, gradients, extra fingers, cropped hands
```

## Target illustration

```text
Use case: stylized-concept
Asset type: target-fish illustration for an existing hand-drawn pixel-comic fishing game
Input image: exact juvenile perch proportions, species markings, orientation, and gritty linework reference
Primary request: redraw the same clearly tiny juvenile yellow perch as a paranormal TV target illustration
Subject: one left-facing juvenile perch with a short narrow 10–15 cm body impression, relatively large eye, small mouth, delicate fins, clear vertical perch bars
Style/medium: scratchy hand-inked comic drawing with chunky pixel texture; dark navy/teal interior, bright cyan and pale-blue contour lines and stippled highlights; limited flat colors; strong readable silhouette; match a retro occult fishing-game UI
Composition: fish fully visible in horizontal side profile, centered, generous padding, no frame, no UI
Scene/backdrop: perfectly flat solid #ff00ff chroma-key background
Constraints: visibly juvenile and tiny rather than adult; crisp isolated edges; no shadow; no water; no hook; no hands; no text; no watermark; do not use #ff00ff in the fish
Avoid: bulky trophy-fish body, realistic photo lighting, smooth gradients, extra objects, distorted anatomy
```

## Target shadow

```text
Use case: stylized-concept
Asset type: animated target-shadow sprite for an existing hand-drawn pixel-comic fishing game
Input image: exact juvenile perch silhouette and proportions reference
Primary request: redraw the same clearly tiny juvenile perch as a mysterious TV shadow icon
Subject: one left-facing juvenile perch, short narrow 10–15 cm body impression, relatively large eye and delicate fins; species silhouette must still read as perch
Style/medium: gritty hand-drawn pixel-comic icon; mostly solid deep navy-black and dark teal fill with a rough bright cyan outer rim and a few cyan pixel scratches; flat colors only
Composition: fully visible horizontal fish centered with generous padding; clean strong silhouette; no frame or UI
Scene/backdrop: perfectly flat solid #ff00ff chroma-key background
Constraints: noticeably smaller/slimmer juvenile proportions; crisp isolated edge; no cast shadow; no water; no hook; no hands; no text; no watermark; do not use #ff00ff in subject
Avoid: adult trophy fish bulk, detailed realistic lighting, smooth gradients, extra objects, detached fragments
```
