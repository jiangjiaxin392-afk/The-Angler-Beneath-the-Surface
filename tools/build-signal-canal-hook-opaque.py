from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageEnhance


ROOT = Path(__file__).resolve().parents[1]
ASSET_ROOT = ROOT / "public" / "images" / "location-backgrounds"
SOURCE = ASSET_ROOT / "animation-sources-v2" / "signal-canal-hook-sheet.png"
KEYED = ASSET_ROOT / "animation-sources-v2" / "signal-canal-hook-keyed-opaque-v2.png"
OBJECT_ROOT = ASSET_ROOT / "signal-canal" / "animation-objects" / "hook-opaque-v2"
SITE_ROOT = ASSET_ROOT / "signal-canal" / "animations" / "site-opaque-hook-v2"
SCENE_SIZE = (1920, 1080)
CANVAS_SIZE = (160, 190)
PADDING = 7
HOOK_POSITION = (1377, 246)
SIGNAL_LEFT_POSITION = (468, 258)
SIGNAL_RIGHT_POSITION = (1018, 243)
RESAMPLE = Image.Resampling.LANCZOS


def is_background(red: int, green: int, blue: int) -> bool:
    return (
        red > 25
        and blue > 25
        and red > green * 1.25 + 10
        and blue > green * 1.25 + 10
        and red + blue > green * 3
    )


def key_border_magenta(source: Image.Image) -> Image.Image:
    """Remove the flat key, including enclosed gaps, and keep the hook opaque."""
    source = source.convert("RGBA")
    width, height = source.size
    pixels = source.load()

    output = Image.new("RGBA", source.size, (0, 0, 0, 0))
    output_pixels = output.load()
    for y in range(height):
        for x in range(width):
            red, green, blue, _ = pixels[x, y]
            if is_background(red, green, blue):
                continue
            output_pixels[x, y] = (red, green, blue, 255)
    return output


def grid_cell(sheet: Image.Image, index: int) -> Image.Image:
    column = index % 4
    row = index // 4
    left = round(column * sheet.width / 4)
    right = round((column + 1) * sheet.width / 4)
    top = round(row * sheet.height / 2)
    bottom = round((row + 1) * sheet.height / 2)
    cell = sheet.crop((left, top, right, bottom))
    bounds = cell.getchannel("A").getbbox()
    if bounds is None:
        raise ValueError(f"Hook cell {index} is empty")
    return cell.crop(bounds)


def top_pin_x(source: Image.Image) -> float:
    alpha = source.getchannel("A")
    band_height = max(8, round(source.height * 0.09))
    points = [
        x
        for y in range(band_height)
        for x in range(source.width)
        if alpha.getpixel((x, y)) > 128
    ]
    return sum(points) / len(points) if points else source.width / 2


def grade(source: Image.Image) -> Image.Image:
    alpha = source.getchannel("A")
    rgb = ImageEnhance.Brightness(source.convert("RGB")).enhance(0.95)
    rgb = ImageEnhance.Color(rgb).enhance(0.84)
    rgb = ImageEnhance.Contrast(rgb).enhance(0.98)
    rgb = Image.blend(rgb, Image.new("RGB", rgb.size, (41, 78, 82)), 0.03)
    rgb.putalpha(alpha)
    return rgb


def build_hook_frames(keyed: Image.Image) -> list[Image.Image]:
    sources = [grid_cell(keyed, index) for index in range(8)]
    maximum_width = max(source.width for source in sources)
    maximum_height = max(source.height for source in sources)
    scale = min(
        (CANVAS_SIZE[0] - PADDING * 2) / maximum_width,
        (CANVAS_SIZE[1] - PADDING * 2) / maximum_height,
    )
    OBJECT_ROOT.mkdir(parents=True, exist_ok=True)
    frames: list[Image.Image] = []
    for index, source in enumerate(sources):
        size = (round(source.width * scale), round(source.height * scale))
        sprite = grade(source.resize(size, RESAMPLE))
        frame = Image.new("RGBA", CANVAS_SIZE, (0, 0, 0, 0))
        position = (
            round(CANVAS_SIZE[0] / 2 - top_pin_x(source) * scale),
            PADDING,
        )
        frame.alpha_composite(sprite, position)
        frame.save(OBJECT_ROOT / f"frame-{index:02d}.png", optimize=True)
        frames.append(frame)
    return frames


def build_site_frames(hook_frames: list[Image.Image]) -> None:
    left_root = ASSET_ROOT / "signal-canal" / "animation-objects" / "signal-left"
    right_root = ASSET_ROOT / "signal-canal" / "animation-objects" / "signal-right"
    SITE_ROOT.mkdir(parents=True, exist_ok=True)
    for runtime_index in range(16):
        index = runtime_index % 8
        scene = Image.new("RGBA", SCENE_SIZE, (0, 0, 0, 0))
        scene.alpha_composite(hook_frames[index], HOOK_POSITION)
        scene.alpha_composite(Image.open(left_root / f"frame-{index:02d}.png").convert("RGBA"), SIGNAL_LEFT_POSITION)
        scene.alpha_composite(Image.open(right_root / f"frame-{index:02d}.png").convert("RGBA"), SIGNAL_RIGHT_POSITION)
        scene.save(SITE_ROOT / f"frame-{runtime_index:02d}.png", optimize=True)


def validate(hook_frames: list[Image.Image]) -> None:
    for index, frame in enumerate(hook_frames):
        alpha = frame.getchannel("A")
        visible = sum(value > 0 for value in alpha.get_flattened_data())
        opaque = sum(value == 255 for value in alpha.get_flattened_data())
        if visible == 0 or opaque / visible < 0.62:
            raise ValueError(f"Hook frame {index} is still too transparent: {opaque}/{visible}")
        if any(alpha.getpixel(point) != 0 for point in (
            (0, 0), (frame.width - 1, 0),
            (0, frame.height - 1), (frame.width - 1, frame.height - 1),
        )):
            raise ValueError(f"Hook frame {index} lacks transparent padding")


def main() -> None:
    keyed = key_border_magenta(Image.open(SOURCE))
    keyed.save(KEYED, optimize=True)
    hook_frames = build_hook_frames(keyed)
    validate(hook_frames)
    build_site_frames(hook_frames)
    print("Built eight opaque hook frames and sixteen canal site overlays; old assets preserved.")


if __name__ == "__main__":
    main()
