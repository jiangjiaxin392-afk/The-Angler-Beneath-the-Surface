from pathlib import Path

import numpy as np
from PIL import Image


frames_dir = Path(
    r"C:\Users\yep\Desktop\The-Angler-Beneath-the-Surface"
    r"\public\images\living-room-sequence\remote-20-frames"
)

for frame_path in sorted(frames_dir.glob("frame-*.png")):
    original = Image.open(frame_path).convert("RGBA")
    source = np.array(original)
    height, width = source.shape[:2]
    output = np.zeros((height, 2160, 4), dtype=np.uint8)

    # Extend only the dark purple sleeve. Skin, remote, cuff highlights, and
    # background-colored edge pixels are deliberately excluded.
    sleeve = (
        (source[:, :, 3] > 100)
        & (source[:, :, 0] < 80)
        & (source[:, :, 1] < 70)
        & (source[:, :, 2] < 105)
    )

    for y in range(900, height):
        sleeve_x = np.flatnonzero(sleeve[y])
        if sleeve_x.size < 12:
            continue

        right = int(sleeve_x[-1])
        target = min(2159, right + int((y - 900) * 2.20))
        if target <= right:
            continue

        texture_x = sleeve_x[-min(64, sleeve_x.size) :]
        texture = source[y, texture_x, :].copy()
        repeat = target - right
        output[y, right + 1 : target + 1] = texture[
            np.arange(repeat) % len(texture)
        ]
        output[y, right + 1 : target + 1, 3] = 255

    # The redrawn continuation sits behind the untouched original artwork.
    output[:, :width] = np.where(
        source[:, :, 3:4] > 0,
        source,
        output[:, :width],
    )
    Image.fromarray(output, "RGBA").save(frame_path)
