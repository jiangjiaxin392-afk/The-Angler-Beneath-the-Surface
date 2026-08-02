from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter


ROOT = (
    Path(__file__).resolve().parents[1]
    / "public"
    / "images"
    / "result-effects-v2"
    / "hooked-transition-v1"
)


def trim_alpha(
    source: Path,
    destination: Path,
    padding: int = 20,
    contract_alpha: bool = False,
) -> None:
    image = Image.open(source).convert("RGBA")
    if contract_alpha:
        # Remove the final one-pixel chroma fringe without recolouring skin or fabric.
        image.putalpha(image.getchannel("A").filter(ImageFilter.MinFilter(3)))
    bounds = image.getchannel("A").getbbox()
    if bounds is None:
        raise RuntimeError(f"No visible pixels in {source}")
    left, top, right, bottom = bounds
    left = max(0, left - padding)
    top = max(0, top - padding)
    right = min(image.width, right + padding)
    bottom = min(image.height, bottom + padding)
    image.crop((left, top, right, bottom)).save(destination)


def split_grid(source: Path, destination: Path, columns: int, rows: int) -> None:
    image = Image.open(source).convert("RGBA")
    destination.mkdir(parents=True, exist_ok=True)
    frame_index = 0
    for row in range(rows):
        top = round(row * image.height / rows)
        bottom = round((row + 1) * image.height / rows)
        for column in range(columns):
            left = round(column * image.width / columns)
            right = round((column + 1) * image.width / columns)
            frame = image.crop((left, top, right, bottom))
            frame.save(destination / f"frame-{frame_index:02d}.png")
            frame_index += 1


def normalize_line(source: Path, destination: Path) -> None:
    trim_alpha(source, destination, 6)
    image = Image.open(destination).convert("RGBA")
    image.resize((image.width, 14), Image.Resampling.LANCZOS).save(destination)


def alpha_metrics(path: Path) -> tuple[int, int, int, int]:
    image = Image.open(path).convert("RGBA")
    alpha = image.getchannel("A")
    histogram = alpha.histogram()
    visible = sum(histogram[1:])
    partial = sum(histogram[1:255])
    return image.width, image.height, visible, partial


def build_preview() -> None:
    canvas = Image.new("RGB", (1600, 900), "#17111d")
    draw = ImageDraw.Draw(canvas)
    groups = [
        ("water", ROOT / "water", 3, 2, 510, 310),
        ("slash", ROOT / "slash", 2, 2, 760, 310),
    ]
    y_offsets = {"water": 28, "slash": 465}
    for name, folder, columns, rows, cell_w, cell_h in groups:
        draw.text((24, y_offsets[name] - 20), name.upper(), fill="#f4ebcf")
        for index, path in enumerate(sorted(folder.glob("frame-*.png"))):
            frame = Image.open(path).convert("RGBA")
            scale = min(cell_w / frame.width, cell_h / frame.height)
            resized = frame.resize(
                (max(1, round(frame.width * scale)), max(1, round(frame.height * scale))),
                Image.Resampling.LANCZOS,
            )
            column = index % columns
            row = index // columns
            x = 20 + column * (cell_w + 18)
            y = y_offsets[name] + row * (cell_h + 12)
            canvas.paste(resized, (x, y), resized)
    canvas.save(ROOT / "preview-effect-frames.jpg", quality=92)


def main() -> None:
    layers = ROOT / "layers"
    sources = ROOT / "sources"
    trim_alpha(
        layers / "angler-pull-full.png",
        layers / "angler-pull.png",
        24,
        contract_alpha=True,
    )
    trim_alpha(layers / "fish-full.png", layers / "fish.png", 24)
    normalize_line(layers / "line-full.png", layers / "line.png")
    split_grid(sources / "water-six-frame-alpha.png", ROOT / "water", 3, 2)
    split_grid(sources / "slash-four-frame-alpha.png", ROOT / "slash", 2, 2)
    build_preview()

    for path in [
        layers / "angler-pull.png",
        layers / "fish.png",
        layers / "line.png",
        *sorted((ROOT / "water").glob("frame-*.png")),
        *sorted((ROOT / "slash").glob("frame-*.png")),
    ]:
        width, height, visible, partial = alpha_metrics(path)
        print(
            f"{path.relative_to(ROOT)} {width}x{height} "
            f"visible={visible} partial={partial}"
        )


if __name__ == "__main__":
    main()
