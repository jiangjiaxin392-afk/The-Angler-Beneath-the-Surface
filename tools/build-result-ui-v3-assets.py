from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
ALPHA = ROOT / "public" / "images" / "result-ui-v3" / "alpha"
COMPONENTS = ROOT / "public" / "images" / "result-ui-v3" / "components"
ICONS = ROOT / "public" / "images" / "result-ui-v3" / "icons"


COMPONENT_SPECS = {
    "scene-frame": ("scene-frame-alpha.png", (950, 790)),
    "question-panel": ("question-panel-alpha.png", (724, 146)),
    "answer-panel": ("answer-panel-alpha.png", (724, 390)),
    "decision-keep": ("decision-keep-alpha.png", (350, 148)),
    "decision-release": ("decision-release-alpha.png", (350, 148)),
    "action-recast": ("action-recast-alpha-v2.png", (376, 118)),
    "action-retackle": ("action-retackle-alpha-v2.png", (376, 118)),
    "action-target": ("action-target-alpha-v2.png", (376, 118)),
    "action-location": ("action-location-alpha-v2.png", (376, 118)),
}

ICON_SPECS = {
    "recast": "icon-recast-alpha.png",
    "retackle": "icon-retackle-alpha.png",
    "target": "icon-target-alpha.png",
    "location": "icon-location-alpha.png",
}


def alpha_crop(image: Image.Image, padding: int = 6) -> Image.Image:
    rgba = image.convert("RGBA")
    bbox = rgba.getchannel("A").getbbox()
    if not bbox:
        raise ValueError("Image contains no visible pixels")
    left = max(0, bbox[0] - padding)
    top = max(0, bbox[1] - padding)
    right = min(rgba.width, bbox[2] + padding)
    bottom = min(rgba.height, bbox[3] + padding)
    return rgba.crop((left, top, right, bottom))


def contain_native(image: Image.Image, size: tuple[int, int], margin: int = 0) -> Image.Image:
    target_w, target_h = size
    usable_w = max(1, target_w - margin * 2)
    usable_h = max(1, target_h - margin * 2)
    scale = min(usable_w / image.width, usable_h / image.height)
    resized_w = max(1, round(image.width * scale))
    resized_h = max(1, round(image.height * scale))
    resized = image.resize((resized_w, resized_h), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", size, (0, 0, 0, 0))
    x = (target_w - resized_w) // 2
    y = (target_h - resized_h) // 2
    canvas.alpha_composite(resized, (x, y))
    return canvas


def recolour_cream(image: Image.Image, target: tuple[int, int, int]) -> Image.Image:
    rgba = image.convert("RGBA")
    pixels = rgba.load()
    for y in range(rgba.height):
        for x in range(rgba.width):
            r, g, b, a = pixels[x, y]
            if a == 0:
                continue
            # Warm cream/bone pixels only; black ink and pink/teal accents remain intact.
            if r >= 145 and g >= 118 and b <= 210 and r >= g * 0.95:
                brightness = max(0.42, min(1.08, (r + g + b) / (255 * 3)))
                pixels[x, y] = (
                    min(255, round(target[0] * brightness / 0.78)),
                    min(255, round(target[1] * brightness / 0.78)),
                    min(255, round(target[2] * brightness / 0.78)),
                    a,
                )
    return rgba


def disabled(image: Image.Image) -> Image.Image:
    rgba = image.convert("RGBA")
    pixels = rgba.load()
    for y in range(rgba.height):
        for x in range(rgba.width):
            r, g, b, a = pixels[x, y]
            if a:
                pixels[x, y] = (round(r * 0.46), round(g * 0.46), round(b * 0.46), a)
    return rgba


def save_component(name: str, source_name: str, size: tuple[int, int]) -> Image.Image:
    source = alpha_crop(Image.open(ALPHA / source_name))
    result = contain_native(source, size)
    result.save(COMPONENTS / f"{name}-default.png", optimize=True)
    print(f"{name}: source={source.size} native={result.size}")
    return result


def main() -> None:
    COMPONENTS.mkdir(parents=True, exist_ok=True)
    ICONS.mkdir(parents=True, exist_ok=True)

    for name, (source_name, size) in COMPONENT_SPECS.items():
        base = save_component(name, source_name, size)
        if name.startswith("decision-"):
            recolour_cream(base, (240, 43, 145)).save(
                COMPONENTS / f"{name}-hover.png", optimize=True
            )
            selected_colour = (93, 212, 200) if name.endswith("keep") else (240, 43, 145)
            recolour_cream(base, selected_colour).save(
                COMPONENTS / f"{name}-selected.png", optimize=True
            )
        elif name.startswith("action-"):
            recolour_cream(base, (240, 43, 145)).save(
                COMPONENTS / f"{name}-hover.png", optimize=True
            )
            disabled(base).save(COMPONENTS / f"{name}-disabled.png", optimize=True)

    # Keep the public names concise for the three non-interactive panels.
    for name in ("scene-frame", "question-panel", "answer-panel"):
        default_path = COMPONENTS / f"{name}-default.png"
        final_path = COMPONENTS / f"{name}.png"
        Image.open(default_path).save(final_path, optimize=True)

    for name, source_name in ICON_SPECS.items():
        source = alpha_crop(Image.open(ALPHA / source_name), padding=10)
        icon = contain_native(source, (72, 72), margin=3)
        icon.save(ICONS / f"{name}.png", optimize=True)
        disabled(icon).save(ICONS / f"{name}-disabled.png", optimize=True)
        print(f"icon-{name}: source={source.size} native={icon.size}")


if __name__ == "__main__":
    main()
