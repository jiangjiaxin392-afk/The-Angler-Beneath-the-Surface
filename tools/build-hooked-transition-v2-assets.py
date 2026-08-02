from pathlib import Path
from shutil import copy2
from collections import deque

from PIL import Image, ImageDraw, ImageFilter


PROJECT = Path(__file__).resolve().parents[1]
EFFECTS = PROJECT / "public" / "images" / "result-effects-v2"
V1 = EFFECTS / "hooked-transition-v1"
V2 = EFFECTS / "hooked-transition-v2"


def split_grid(source: Path, destination: Path, start_index: int = 0) -> None:
    image = Image.open(source).convert("RGBA")
    destination.mkdir(parents=True, exist_ok=True)
    frame_index = start_index
    for row in range(2):
        top = round(row * image.height / 2)
        bottom = round((row + 1) * image.height / 2)
        for column in range(2):
            left = round(column * image.width / 2)
            right = round((column + 1) * image.width / 2)
            image.crop((left, top, right, bottom)).save(
                destination / f"frame-{frame_index:02d}.png"
            )
            frame_index += 1


def rebuild_angler_matte() -> None:
    """Key only border-connected magenta and keep the whole angler opaque."""
    source = Image.open(
        V1 / "sources" / "angler-pull-magenta-source.png"
    ).convert("RGBA")
    width, height = source.size
    rgb = source.convert("RGB")
    pixels = rgb.load()

    # The generated source uses a softly varying magenta backdrop. Restricting
    # removal to pixels connected to an image edge protects ink, skin and all
    # enclosed details from becoming translucent.
    key_candidate = bytearray(width * height)
    for y in range(height):
        offset = y * width
        for x in range(width):
            red, green, blue = pixels[x, y]
            is_magenta = (
                red > 175
                and blue > 145
                and green < 115
                and red - green > 90
                and blue - green > 75
                and abs(red - blue) < 95
            )
            key_candidate[offset + x] = 1 if is_magenta else 0

    background = bytearray(width * height)
    queue: deque[int] = deque()

    def seed(index: int) -> None:
        if key_candidate[index] and not background[index]:
            background[index] = 1
            queue.append(index)

    for x in range(width):
        seed(x)
        seed((height - 1) * width + x)
    for y in range(height):
        seed(y * width)
        seed(y * width + width - 1)

    while queue:
        index = queue.popleft()
        x = index % width
        if x > 0:
            neighbour = index - 1
            if key_candidate[neighbour] and not background[neighbour]:
                background[neighbour] = 1
                queue.append(neighbour)
        if x + 1 < width:
            neighbour = index + 1
            if key_candidate[neighbour] and not background[neighbour]:
                background[neighbour] = 1
                queue.append(neighbour)
        if index >= width:
            neighbour = index - width
            if key_candidate[neighbour] and not background[neighbour]:
                background[neighbour] = 1
                queue.append(neighbour)
        if index + width < width * height:
            neighbour = index + width
            if key_candidate[neighbour] and not background[neighbour]:
                background[neighbour] = 1
                queue.append(neighbour)

    hard_mask = Image.new("L", (width, height), 0)
    hard_mask.frombytes(bytes(255 if not value else 0 for value in background))

    # Contract one pixel to discard the magenta fringe, then feather only the
    # outer contour. All face, hands, beard, clothing and rod interiors remain
    # at alpha 255.
    alpha = hard_mask.filter(ImageFilter.MinFilter(3)).filter(
        ImageFilter.GaussianBlur(0.55)
    )
    alpha_bytes = alpha.tobytes()

    # Replace any surviving magenta edge RGB with the nearest real subject
    # colour. This prevents a pink halo when the layer is drawn over dark water.
    rgba = bytearray(source.tobytes())
    resolved = bytearray(width * height)
    colour_queue: deque[int] = deque()
    for index, alpha_value in enumerate(alpha_bytes):
        if alpha_value and not key_candidate[index]:
            resolved[index] = 1
            colour_queue.append(index)

    while colour_queue:
        index = colour_queue.popleft()
        x = index % width
        neighbours = []
        if x > 0:
            neighbours.append(index - 1)
        if x + 1 < width:
            neighbours.append(index + 1)
        if index >= width:
            neighbours.append(index - width)
        if index + width < width * height:
            neighbours.append(index + width)
        for neighbour in neighbours:
            if not alpha_bytes[neighbour] or resolved[neighbour]:
                continue
            source_offset = index * 4
            target_offset = neighbour * 4
            rgba[target_offset : target_offset + 3] = rgba[
                source_offset : source_offset + 3
            ]
            resolved[neighbour] = 1
            colour_queue.append(neighbour)

    source = Image.frombytes("RGBA", (width, height), bytes(rgba))
    source.putalpha(alpha)

    bounds = alpha.getbbox()
    if bounds is None:
        raise RuntimeError("Angler matte contains no visible pixels")
    left, top, right, bottom = bounds
    padding = 24
    crop_bounds = (
        max(0, left - padding),
        max(0, top - padding),
        min(width, right + padding),
        min(height, bottom + padding),
    )
    source.crop(crop_bounds).save(V2 / "layers" / "angler-pull.png")


def copy_preserved_v1_assets() -> None:
    for name in ("fish.png", "line.png"):
        copy2(V1 / "layers" / name, V2 / "layers" / name)
    for group in ("water", "slash"):
        for source in sorted((V1 / group).glob("frame-*.png")):
            copy2(source, V2 / group / source.name)


def alpha_metrics(path: Path) -> tuple[int, int, int, int]:
    image = Image.open(path).convert("RGBA")
    histogram = image.getchannel("A").histogram()
    return (
        image.width,
        image.height,
        sum(histogram[1:]),
        sum(histogram[1:255]),
    )


def build_preview() -> None:
    canvas = Image.new("RGB", (1600, 900), "#17111d")
    draw = ImageDraw.Draw(canvas)
    draw.text((24, 18), "CORRECTED ANGLER", fill="#f4ebcf")
    angler = Image.open(V2 / "layers" / "angler-pull.png").convert("RGBA")
    angler.thumbnail((760, 780), Image.Resampling.LANCZOS)
    canvas.paste(angler, (20, 62), angler)

    draw.text((815, 18), "PERSISTENT DROPLET FRAMES", fill="#f4ebcf")
    for index, path in enumerate(sorted((V2 / "droplets").glob("frame-*.png"))):
        frame = Image.open(path).convert("RGBA")
        frame.thumbnail((360, 190), Image.Resampling.LANCZOS)
        column = index % 2
        row = index // 2
        x = 805 + column * 385
        y = 55 + row * 205
        canvas.paste(frame, (x, y), frame)
    canvas.save(V2 / "preview-v2-assets.jpg", quality=92)


def main() -> None:
    rebuild_angler_matte()
    copy_preserved_v1_assets()
    split_grid(V2 / "sources" / "droplets-build-alpha.png", V2 / "droplets", 0)
    split_grid(V2 / "sources" / "droplets-fall-alpha.png", V2 / "droplets", 4)
    build_preview()

    deliverables = [
        V2 / "layers" / "angler-pull.png",
        V2 / "layers" / "fish.png",
        V2 / "layers" / "line.png",
        *sorted((V2 / "water").glob("frame-*.png")),
        *sorted((V2 / "slash").glob("frame-*.png")),
        *sorted((V2 / "droplets").glob("frame-*.png")),
    ]
    for path in deliverables:
        width, height, visible, partial = alpha_metrics(path)
        print(
            f"{path.relative_to(V2)} {width}x{height} "
            f"visible={visible} partial={partial}"
        )


if __name__ == "__main__":
    main()
