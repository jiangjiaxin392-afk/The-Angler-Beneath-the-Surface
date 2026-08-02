from pathlib import Path

from PIL import Image, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
ASSET_ROOT = ROOT / "public" / "images" / "archive-ui-v2"
ALPHA_ROOT = ASSET_ROOT / "alpha"
OUT_ROOT = ASSET_ROOT / "components"


def alpha_bbox(image: Image.Image):
    return image.getchannel("A").getbbox()


def contain(source_name: str, output_name: str, size: tuple[int, int], padding: int = 0):
    source = Image.open(ALPHA_ROOT / source_name).convert("RGBA")
    crop = source.crop(alpha_bbox(source))
    max_width = size[0] - padding * 2
    max_height = size[1] - padding * 2
    scale = min(max_width / crop.width, max_height / crop.height)
    resized = crop.resize(
        (round(crop.width * scale), round(crop.height * scale)),
        Image.Resampling.LANCZOS,
    )
    canvas = Image.new("RGBA", size, (0, 0, 0, 0))
    canvas.alpha_composite(
        resized,
        ((size[0] - resized.width) // 2, (size[1] - resized.height) // 2),
    )
    canvas.save(OUT_ROOT / output_name)
    return canvas


def recolour_bone(source: Image.Image, colour: tuple[int, int, int], expand: int = 0):
    pixels = source.convert("RGBA")
    red, green, blue, alpha = pixels.split()
    mask = Image.new("L", pixels.size, 0)
    src = pixels.load()
    dst = mask.load()
    for y in range(pixels.height):
        for x in range(pixels.width):
            r, g, b, a = src[x, y]
            if a > 24 and r > 145 and g > 120 and b > 88 and r + g + b > 430:
                dst[x, y] = a
    if expand:
        mask = mask.filter(ImageFilter.MaxFilter(expand * 2 + 1))
    overlay = Image.new("RGBA", pixels.size, (*colour, 0))
    overlay.putalpha(mask)
    return overlay


def build_slot_states(collection: Image.Image):
    # The generated collection art contains eight identical portrait slots.
    # Crop the first physical bone frame and use its actual ink as the state mask.
    slot = collection.crop((76, 138, 270, 420))
    slot = slot.resize((188, 286), Image.Resampling.LANCZOS)
    hover = recolour_bone(slot, (240, 43, 145), 1)
    selected_outer = recolour_bone(slot, (93, 212, 200), 2)
    selected_inner = recolour_bone(slot, (240, 43, 145), 0)
    selected = Image.alpha_composite(selected_outer, selected_inner)
    for state in (hover, selected):
        pixels = state.load()
        for y in range(24, state.height - 24):
            for x in range(24, state.width - 24):
                pixels[x, y] = (0, 0, 0, 0)
    hover.save(OUT_ROOT / "slot-hover.png")
    selected.save(OUT_ROOT / "slot-selected.png")


def build_button_states(button: Image.Image):
    button.save(OUT_ROOT / "close-default.png")
    hover = Image.alpha_composite(button, recolour_bone(button, (240, 43, 145), 1))
    hover.save(OUT_ROOT / "close-hover.png")


def main():
    OUT_ROOT.mkdir(parents=True, exist_ok=True)
    collection = contain("collection-panel-alpha.png", "collection-panel.png", (940, 820), 4)
    contain("question-panel-alpha.png", "question-panel.png", (820, 156), 2)
    contain("answer-panel-alpha-v2.png", "answer-panel-v2.png", (820, 404), 2)
    contain("record-panel-alpha-v2.png", "record-panel-v2.png", (820, 210), 2)
    close = contain("close-button-alpha.png", "close-default.png", (272, 92), 2)
    build_slot_states(collection)
    build_button_states(close)
    print(f"Built archive UI components in {OUT_ROOT}")


if __name__ == "__main__":
    main()
