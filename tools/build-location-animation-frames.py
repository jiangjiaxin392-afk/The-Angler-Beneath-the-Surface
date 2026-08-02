from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Callable

from PIL import Image, ImageEnhance


ROOT = Path(__file__).resolve().parents[1]
ASSET_ROOT = ROOT / "public" / "images" / "location-backgrounds"
SHEET_ROOT = ASSET_ROOT / "animation-sources-v2"
SCENE_SIZE = (1920, 1080)
DRAWN_FRAME_COUNT = 8
RUNTIME_FRAME_COUNT = 16
RESAMPLE = Image.Resampling.LANCZOS


@dataclass(frozen=True)
class SequenceSpec:
    location: str
    name: str
    sheet: str
    canvas_size: tuple[int, int]
    anchor: str
    scene_position: tuple[int, int]
    layer: str
    preprocess: Callable[[Image.Image], Image.Image] | None = None
    brightness: float = 1.0
    saturation: float = 1.0
    contrast: float = 1.0
    opacity: float = 1.0
    alpha_gamma: float = 1.0
    tone: tuple[int, int, int] | None = None
    tone_mix: float = 0.0
    padding: int = 6


def grid_cell(sheet: Image.Image, index: int) -> Image.Image:
    """Read one of eight independently drawn cells from a strict 4x2 sheet."""
    column = index % 4
    row = index // 4
    left = round(column * sheet.width / 4)
    right = round((column + 1) * sheet.width / 4)
    top = round(row * sheet.height / 2)
    bottom = round((row + 1) * sheet.height / 2)
    return sheet.crop((left, top, right, bottom)).convert("RGBA")


def visible_crop(image: Image.Image) -> Image.Image:
    bounds = image.getchannel("A").getbbox()
    if bounds is None:
        raise ValueError("Animation cell has no visible pixels")
    return image.crop(bounds)


def remove_reservoir_outlet_ring(cell: Image.Image) -> Image.Image:
    # The scene already contains the stone outlet. Keep only the independently
    # drawn water below it so no duplicate masonry can float over the dam.
    return cell.crop((0, 112, cell.width, cell.height))


def anchor_position(
    canvas: tuple[int, int],
    sprite: tuple[int, int],
    anchor: str,
    padding: int,
) -> tuple[int, int]:
    canvas_width, canvas_height = canvas
    width, height = sprite
    x = (canvas_width - width) // 2
    if anchor == "top":
        return x, padding
    if anchor == "bottom":
        return x, canvas_height - height - padding
    if anchor == "center":
        return x, (canvas_height - height) // 2
    raise ValueError(f"Unsupported anchor: {anchor}")


def grade_sprite(source: Image.Image, spec: SequenceSpec) -> Image.Image:
    """Match generated ink and highlights to the flatter painted backgrounds."""
    alpha = source.getchannel("A")
    rgb = source.convert("RGB")
    rgb = ImageEnhance.Brightness(rgb).enhance(spec.brightness)
    rgb = ImageEnhance.Color(rgb).enhance(spec.saturation)
    rgb = ImageEnhance.Contrast(rgb).enhance(spec.contrast)
    if spec.tone is not None and spec.tone_mix > 0:
        tone = Image.new("RGB", rgb.size, spec.tone)
        rgb = Image.blend(rgb, tone, spec.tone_mix)
    if spec.alpha_gamma != 1:
        alpha = alpha.point(
            lambda value: 0
            if value < 16
            else round(255 * ((value / 255) ** spec.alpha_gamma))
        )
    if spec.opacity < 1:
        alpha = alpha.point(lambda value: round(value * spec.opacity))
    rgb.putalpha(alpha)
    return rgb


def top_pin_x(source: Image.Image) -> float:
    """Return the cable/source centre near the top, independent of a swinging body."""
    alpha = source.getchannel("A")
    band_height = max(8, round(source.height * 0.09))
    points = [
        x
        for y in range(band_height)
        for x in range(source.width)
        if alpha.getpixel((x, y)) > 96
    ]
    return (sum(points) / len(points)) if points else source.width / 2


def build_object_frames(spec: SequenceSpec) -> list[Image.Image]:
    sheet = Image.open(SHEET_ROOT / spec.sheet).convert("RGBA")
    sources: list[Image.Image] = []
    for index in range(DRAWN_FRAME_COUNT):
        source = grid_cell(sheet, index)
        if spec.preprocess is not None:
            source = spec.preprocess(source)
        sources.append(visible_crop(source))

    max_source_width = max(source.width for source in sources)
    max_source_height = max(source.height for source in sources)
    available_width = spec.canvas_size[0] - spec.padding * 2
    available_height = spec.canvas_size[1] - spec.padding * 2
    scale = min(
        available_width / max_source_width,
        available_height / max_source_height,
    )

    target = ASSET_ROOT / spec.location / "animation-objects" / spec.name
    target.mkdir(parents=True, exist_ok=True)
    frames: list[Image.Image] = []
    for index, source in enumerate(sources):
        size = (
            max(1, round(source.width * scale)),
            max(1, round(source.height * scale)),
        )
        sprite = source.resize(size, RESAMPLE)
        sprite = grade_sprite(sprite, spec)
        frame = Image.new("RGBA", spec.canvas_size, (0, 0, 0, 0))
        if spec.anchor == "top-pin":
            position = (
                round(spec.canvas_size[0] / 2 - top_pin_x(source) * scale),
                spec.padding,
            )
        else:
            position = anchor_position(spec.canvas_size, size, spec.anchor, spec.padding)
        frame.alpha_composite(sprite, position)
        frame.save(target / f"frame-{index:02d}.png", optimize=True)
        frames.append(frame)
    return frames


def save_runtime_layer(location: str, layer: str, index: int, frame: Image.Image) -> None:
    target = ASSET_ROOT / location / "animations" / layer
    target.mkdir(parents=True, exist_ok=True)
    frame.save(target / f"frame-{index:02d}.png", optimize=True)


def object_key(spec: SequenceSpec) -> tuple[str, str]:
    return spec.location, spec.name


def composite_runtime_frames(specs: list[SequenceSpec], objects: dict[tuple[str, str], list[Image.Image]]) -> None:
    locations = sorted({spec.location for spec in specs})
    for location in locations:
        location_specs = [spec for spec in specs if spec.location == location]
        layers = sorted({spec.layer for spec in location_specs})
        for runtime_index in range(RUNTIME_FRAME_COUNT):
            drawn_index = runtime_index % DRAWN_FRAME_COUNT
            for layer in layers:
                scene = Image.new("RGBA", SCENE_SIZE, (0, 0, 0, 0))
                for spec in location_specs:
                    if spec.layer != layer:
                        continue
                    scene.alpha_composite(objects[object_key(spec)][drawn_index], spec.scene_position)
                save_runtime_layer(location, layer, runtime_index, scene)


def validate(specs: list[SequenceSpec], objects: dict[tuple[str, str], list[Image.Image]]) -> None:
    for spec in specs:
        frames = objects[object_key(spec)]
        hashes = {frame.tobytes() for frame in frames}
        if len(hashes) != DRAWN_FRAME_COUNT:
            raise ValueError(f"{spec.name}: expected eight distinct drawings")
        for index, frame in enumerate(frames):
            alpha = frame.getchannel("A")
            bounds = alpha.getbbox()
            if bounds is None:
                raise ValueError(f"{spec.name} frame {index}: empty")
            if (
                bounds[0] < 2 or bounds[1] < 2
                or bounds[2] > frame.width - 2
                or bounds[3] > frame.height - 2
            ):
                raise ValueError(f"{spec.name} frame {index}: sprite touches its crop edge")
            if any(alpha.getpixel(point) != 0 for point in (
                (0, 0), (frame.width - 1, 0),
                (0, frame.height - 1), (frame.width - 1, frame.height - 1),
            )):
                raise ValueError(f"{spec.name} frame {index}: transparent padding is missing")
            # Catch pixels that still match the flat key itself. Purple ink used by
            # the game's palette is intentionally retained.
            for red, green, blue, opacity in frame.get_flattened_data():
                if opacity > 64 and red > 242 and blue > 225 and green < 18 and abs(red - blue) < 28:
                    raise ValueError(f"{spec.name} frame {index}: flat magenta key remains")


def main() -> None:
    canal_tone = (41, 78, 82)
    reservoir_tone = (48, 82, 76)
    specs = [
        SequenceSpec(
            "signal-canal", "hook", "signal-canal-hook-keyed.png",
            (160, 190), "top-pin", (1377, 246), "site",
            brightness=0.95, saturation=0.84, contrast=0.98, opacity=1.0,
            alpha_gamma=0.24, tone=canal_tone, tone_mix=0.03, padding=7,
        ),
        SequenceSpec(
            "signal-canal", "signal-left", "signal-canal-signal-keyed.png",
            (48, 118), "bottom", (468, 258), "site",
            brightness=0.76, saturation=0.72, contrast=0.88, opacity=0.94,
            tone=canal_tone, tone_mix=0.10, padding=5,
        ),
        SequenceSpec(
            "signal-canal", "signal-right", "signal-canal-signal-keyed.png",
            (48, 118), "bottom", (1018, 243), "site",
            brightness=0.76, saturation=0.72, contrast=0.88, opacity=0.94,
            tone=canal_tone, tone_mix=0.10, padding=5,
        ),
        SequenceSpec(
            "signal-canal", "debris", "signal-canal-debris-keyed.png",
            (255, 142), "center", (1350, 708), "water",
            brightness=0.76, saturation=0.68, contrast=0.88, opacity=0.90,
            tone=canal_tone, tone_mix=0.13, padding=7,
        ),
        SequenceSpec(
            "signal-canal", "runoff", "signal-canal-runoff-keyed.png",
            (100, 132), "top", (510, 512), "runoff",
            brightness=0.70, saturation=0.58, contrast=0.84, opacity=0.76,
            tone=canal_tone, tone_mix=0.16, padding=6,
        ),
        SequenceSpec(
            "sunken-reservoir", "plants", "sunken-reservoir-plants-keyed.png",
            (230, 215), "bottom", (70, 708), "site",
            brightness=0.76, saturation=0.68, contrast=0.88, opacity=0.88,
            tone=reservoir_tone, tone_mix=0.12, padding=7,
        ),
        SequenceSpec(
            "sunken-reservoir", "buoy", "sunken-reservoir-buoy-keyed.png",
            (145, 105), "bottom", (1458, 510), "water",
            brightness=0.74, saturation=0.64, contrast=0.88, opacity=0.88,
            tone=reservoir_tone, tone_mix=0.12, padding=6,
        ),
        SequenceSpec(
            "sunken-reservoir", "reflection", "sunken-reservoir-reflection-keyed.png",
            (220, 98), "center", (1253, 716), "water",
            brightness=0.76, saturation=0.45, contrast=0.84, opacity=0.76,
            tone=(14, 83, 91), tone_mix=0.20, padding=6,
        ),
        SequenceSpec(
            "sunken-reservoir", "runoff", "sunken-reservoir-runoff-keyed.png",
            (95, 112), "top", (1312, 458), "runoff",
            preprocess=remove_reservoir_outlet_ring,
            brightness=0.70, saturation=0.54, contrast=0.84, opacity=0.70,
            tone=reservoir_tone, tone_mix=0.16, padding=6,
        ),
    ]
    objects = {object_key(spec): build_object_frames(spec) for spec in specs}
    validate(specs, objects)
    composite_runtime_frames(specs, objects)
    print("Built 72 checked object frames and 96 stable runtime overlays from eight-frame redraws.")


if __name__ == "__main__":
    main()
