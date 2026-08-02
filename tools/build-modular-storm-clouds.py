"""Build hand-drawn, location-specific storm-cloud frames.

Each modular location owns an eight-keyframe cloud sheet drawn to match the
river storm treatment without copying its tree silhouettes.  This builder keeps
the keyframes' aspect ratio locked, creates one in-between frame between each
pair, and clips the resulting sixteen-frame animation to the top-connected sky.
Buildings, cranes, hills, and dam walls therefore remain in front of the clouds.
"""

from __future__ import annotations

from collections import deque
from pathlib import Path

import numpy as np
from PIL import Image, ImageChops, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
LOCATION_ROOT = ROOT / "public" / "images" / "location-backgrounds"
LOCATIONS = ("signal-canal", "sunken-reservoir")
FRAME_COUNT = 16

SHEETS = {
    "signal-canal": "signal-canal-storm-cloud-sheet-v2-keyed.png",
    "sunken-reservoir": "sunken-reservoir-storm-cloud-sheet-v2-keyed.png",
}


def sky_candidate(rgb: np.ndarray) -> np.ndarray:
    """Return cyan/blue/bright-cloud pixels that can belong to open sky."""
    r = rgb[:, :, 0].astype(np.int16)
    g = rgb[:, :, 1].astype(np.int16)
    b = rgb[:, :, 2].astype(np.int16)
    blue_sky = (b > 88) & (g > 78) & (b > r + 28) & (g > r + 14)
    pale_cloud = (r > 115) & (g > 125) & (b > 128) & (b >= r)
    return blue_sky | pale_cloud


def top_connected_mask(candidate: np.ndarray) -> np.ndarray:
    """Keep only candidate pixels connected to the upper edge."""
    height, width = candidate.shape
    visited = np.zeros_like(candidate, dtype=np.uint8)
    queue: deque[tuple[int, int]] = deque()
    for x in np.flatnonzero(candidate[0]):
        visited[0, x] = 255
        queue.append((0, int(x)))

    while queue:
        y, x = queue.popleft()
        for ny, nx in ((y - 1, x), (y + 1, x), (y, x - 1), (y, x + 1)):
            if 0 <= ny < height and 0 <= nx < width:
                if candidate[ny, nx] and not visited[ny, nx]:
                    visited[ny, nx] = 255
                    queue.append((ny, nx))
    return visited


def build_sky_mask(background: Image.Image) -> Image.Image:
    rgb = np.asarray(background.convert("RGB"))
    mask = top_connected_mask(sky_candidate(rgb))
    image = Image.fromarray(mask, mode="L")
    # Close tiny halftone gaps, then feather only the boundary against structures.
    image = image.filter(ImageFilter.MaxFilter(7)).filter(ImageFilter.MinFilter(5))
    return image.filter(ImageFilter.GaussianBlur(1.1))


def extract_keyframes(location_id: str) -> list[Image.Image]:
    source_dir = LOCATION_ROOT / "animation-sources-v2"
    sheet = Image.open(source_dir / SHEETS[location_id]).convert("RGBA")
    keyframes = []
    for index in range(8):
        column = index % 4
        row = index // 4
        left = round(column * sheet.width / 4)
        right = round((column + 1) * sheet.width / 4)
        top = round(row * sheet.height / 2)
        bottom = round((row + 1) * sheet.height / 2)
        cell = sheet.crop((left, top, right, bottom))
        # Generated cells intentionally touch their left/right bounds.  Fade a
        # narrow gutter so several medium banks can overlap without box seams.
        alpha = np.asarray(cell.getchannel("A"), dtype=np.float32)
        edge_mask = np.ones_like(alpha, dtype=np.float32)
        for row in range(cell.height):
            depth = row / max(1, cell.height - 1)
            # Reservoir keyframes contain a deeper lower shelf.  Widen only its
            # side fade toward the bottom so the shelf ends organically instead
            # of exposing a vertical crop boundary beside the tower.
            fraction = 0.25
            if location_id == "sunken-reservoir":
                fraction += 0.22 * depth
            feather = max(48, round(cell.width * fraction))
            transition = np.sin(np.linspace(0.0, np.pi / 2, feather, endpoint=False)) ** 2
            edge_mask[row, :feather] = transition
            edge_mask[row, -feather:] = transition[::-1]
        alpha = np.clip(alpha * edge_mask, 0, 255).astype(np.uint8)
        cell.putalpha(Image.fromarray(alpha, mode="L"))
        keyframes.append(cell)
    return keyframes


def tween_keyframe(keyframes: list[Image.Image], frame_index: int) -> Image.Image:
    key_index = frame_index // 2
    current = keyframes[key_index]
    if frame_index % 2 == 0:
        return current
    following = keyframes[(key_index + 1) % len(keyframes)]
    if following.size != current.size:
        following = following.resize(current.size, Image.Resampling.NEAREST)
    return Image.blend(current, following, 0.5)


def uniform_scale(image: Image.Image, factor: float) -> Image.Image:
    return image.resize(
        (round(image.width * factor), round(image.height * factor)),
        Image.Resampling.NEAREST,
    )


def merge_cloud_layers(size: tuple[int, int], layers: list[tuple[Image.Image, tuple[int, int]]]) -> Image.Image:
    """Average overlapping premultiplied colors instead of darkening overlaps."""
    width, height = size
    color_sum = np.zeros((height, width, 3), dtype=np.float32)
    alpha_sum = np.zeros((height, width), dtype=np.float32)
    for layer, (x, y) in layers:
        left = max(0, x)
        top = max(0, y)
        right = min(width, x + layer.width)
        bottom = min(height, y + layer.height)
        if left >= right or top >= bottom:
            continue
        source = np.asarray(layer, dtype=np.float32)[
            top - y:bottom - y,
            left - x:right - x,
        ]
        alpha = source[:, :, 3] / 255.0
        color_sum[top:bottom, left:right] += source[:, :, :3] * alpha[:, :, None]
        alpha_sum[top:bottom, left:right] += alpha

    output = np.zeros((height, width, 4), dtype=np.uint8)
    covered = alpha_sum > 0.0001
    output[:, :, :3][covered] = np.clip(
        color_sum[covered] / alpha_sum[covered, None], 0, 255
    ).astype(np.uint8)
    output[:, :, 3] = np.clip(alpha_sum, 0.0, 1.0) * 255
    return Image.fromarray(output, mode="RGBA")


def compose_clouds(location_id: str, keyframes: list[Image.Image], frame_index: int,
                   size: tuple[int, int]) -> Image.Image:
    if location_id == "signal-canal":
        # Four differently-phased fronts overlap by more than their feathered
        # gutters, eliminating seams while retaining native proportions.
        layout = ((0, -60, -195), (2, 410, -220), (4, 880, -190), (6, 1350, -210))
        scale = 1.50
    else:
        # The reservoir uses a higher four-bank system with different phases and
        # vertical offsets, creating a continuous but non-repeating storm ceiling.
        layout = ((0, -80, -205), (5, 405, -225), (2, 890, -195), (7, 1375, -215))
        scale = 1.55
    layers = []
    for phase, x, y in layout:
        phased_keys = keyframes[phase:] + keyframes[:phase]
        cloud = tween_keyframe(phased_keys, frame_index)
        layers.append((uniform_scale(cloud, scale), (x, y)))
    return merge_cloud_layers(size, layers)


def build_location(location_id: str) -> None:
    location_dir = LOCATION_ROOT / location_id
    background = Image.open(location_dir / "background.png").convert("RGBA")
    width, height = background.size
    mask = build_sky_mask(background)
    output_dir = location_dir / "animations" / "storm-cloud"
    output_dir.mkdir(parents=True, exist_ok=True)
    mask.save(output_dir / "sky-mask.png")

    keyframes = extract_keyframes(location_id)

    for frame_index in range(FRAME_COUNT):
        frame = compose_clouds(location_id, keyframes, frame_index, (width, height))
        frame.putalpha(ImageChops.multiply(frame.getchannel("A"), mask))
        frame.save(output_dir / f"frame-{frame_index:02d}.png", optimize=True)

    print(f"built {FRAME_COUNT} storm-cloud frames for {location_id}")


def main() -> None:
    for location_id in LOCATIONS:
        build_location(location_id)


if __name__ == "__main__":
    main()
