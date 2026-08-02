from collections import deque
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
V2 = ROOT / "public" / "images" / "toolbox-sequence" / "v2"
V3 = ROOT / "public" / "images" / "toolbox-sequence" / "v3"


def keep_largest_alpha_component(image: Image.Image) -> Image.Image:
    rgba = image.convert("RGBA")
    alpha = rgba.getchannel("A")
    width, height = rgba.size
    pixels = alpha.load()
    seen = bytearray(width * height)
    components: list[list[tuple[int, int]]] = []

    for y in range(height):
        for x in range(width):
            offset = y * width + x
            if seen[offset] or pixels[x, y] <= 8:
                continue
            queue = deque([(x, y)])
            seen[offset] = 1
            component: list[tuple[int, int]] = []
            while queue:
                current_x, current_y = queue.popleft()
                component.append((current_x, current_y))
                for next_x, next_y in (
                    (current_x - 1, current_y),
                    (current_x + 1, current_y),
                    (current_x, current_y - 1),
                    (current_x, current_y + 1),
                ):
                    if not (0 <= next_x < width and 0 <= next_y < height):
                        continue
                    next_offset = next_y * width + next_x
                    if seen[next_offset] or pixels[next_x, next_y] <= 8:
                        continue
                    seen[next_offset] = 1
                    queue.append((next_x, next_y))
            components.append(component)

    if not components:
        return rgba

    keep = set(max(components, key=len))
    cleaned = rgba.copy()
    cleaned_pixels = cleaned.load()
    for y in range(height):
        for x in range(width):
            if pixels[x, y] > 8 and (x, y) not in keep:
                cleaned_pixels[x, y] = (0, 0, 0, 0)
    return cleaned


def extend_sleeve(source: Image.Image) -> Image.Image:
    cleaned = keep_largest_alpha_component(source)
    width, height = cleaned.size
    output_height = 640
    band_top = 352
    output = Image.new("RGBA", (width, output_height), (0, 0, 0, 0))
    output.alpha_composite(cleaned.crop((0, 0, width, band_top)), (0, 0))

    # Repaint the lower forearm from an overlapping section of the original knit.
    # The overlap hides the join; uniform scaling in-game keeps the hand unchanged.
    lower_band = cleaned.crop((0, band_top, width, height))
    extended_band = lower_band.resize(
        (width, output_height - band_top),
        Image.Resampling.BICUBIC,
    )
    output.alpha_composite(extended_band, (0, band_top))
    return output


def process_sequence(name: str, count: int) -> None:
    source_dir = V2 / name
    output_dir = V3 / name
    output_dir.mkdir(parents=True, exist_ok=True)
    for index in range(1, count + 1):
        filename = f"frame-{index:02d}.png"
        with Image.open(source_dir / filename) as image:
            result = extend_sleeve(image)
            result.save(output_dir / filename, optimize=True)


def main() -> None:
    process_sequence("right-hand-frames", 16)
    process_sequence("left-hand-frames", 12)
    print(f"Wrote cleaned hand sequences to {V3}")


if __name__ == "__main__":
    main()
