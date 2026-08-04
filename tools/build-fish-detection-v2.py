from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
ASSET_ROOT = ROOT / "public" / "images" / "fish-detection-v2"
FISH_SIZE = (768, 416)
WATER_SIZE = (512, 512)


def remove_green_key(image: Image.Image) -> Image.Image:
    rgba = image.convert("RGBA")
    pixels = rgba.load()

    for y in range(rgba.height):
        for x in range(rgba.width):
            red, green, blue, source_alpha = pixels[x, y]
            dominance = green - max(red, blue)

            if green >= 170 and dominance >= 75:
                alpha = 0
            elif green >= 120 and dominance >= 28:
                alpha = round(255 * (75 - dominance) / 47)
                alpha = max(0, min(255, alpha))
            else:
                alpha = source_alpha

            if 0 < alpha < 255 and green > max(red, blue):
                green = min(green, max(red, blue) + 8)

            pixels[x, y] = (red, green, blue, min(source_alpha, alpha))

    return rgba


def contain(image: Image.Image, size: tuple[int, int]) -> Image.Image:
    source = image.copy()
    source.thumbnail(size, Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", size, (0, 0, 0, 0))
    x = (size[0] - source.width) // 2
    y = (size[1] - source.height) // 2
    canvas.alpha_composite(source, (x, y))
    return canvas


def build_group(name: str, size: tuple[int, int]) -> None:
    source_root = ASSET_ROOT / "sources" / name
    output_root = ASSET_ROOT / name
    output_root.mkdir(parents=True, exist_ok=True)

    for index in range(8):
        source_path = source_root / f"frame-{index:02d}-keyed.png"
        output_path = output_root / f"frame-{index:02d}.png"
        keyed = Image.open(source_path)
        alpha = remove_green_key(keyed)
        result = contain(alpha, size)
        result.save(output_path, optimize=True)


def validate() -> None:
    for name, expected_size in (("fish", FISH_SIZE), ("water", WATER_SIZE)):
        for index in range(8):
            path = ASSET_ROOT / name / f"frame-{index:02d}.png"
            image = Image.open(path).convert("RGBA")
            if image.size != expected_size:
                raise RuntimeError(f"Unexpected size for {path}: {image.size}")
            alpha = image.getchannel("A")
            if alpha.getextrema() != (0, 255):
                raise RuntimeError(f"Alpha validation failed for {path}: {alpha.getextrema()}")
            if alpha.getbbox() is None:
                raise RuntimeError(f"Empty frame: {path}")


if __name__ == "__main__":
    build_group("fish", FISH_SIZE)
    build_group("water", WATER_SIZE)
    validate()
    print("Built and validated 8 fish frames plus 8 water-effect frames.")
