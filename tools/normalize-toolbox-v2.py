from pathlib import Path

from PIL import Image


FRAME_DIR = Path("public/images/toolbox-sequence/v2/toolbox-frames")
CANVAS_SIZE = 768
VISIBLE_WIDTH = 660
BASELINE_Y = 730


def normalize_frame(path: Path) -> None:
    with Image.open(path) as source:
        rgba = source.convert("RGBA")

    bounds = rgba.getchannel("A").getbbox()
    if not bounds:
        raise RuntimeError(f"No visible pixels in {path}")

    subject = rgba.crop(bounds)
    scale = VISIBLE_WIDTH / subject.width
    new_size = (VISIBLE_WIDTH, round(subject.height * scale))
    subject = subject.resize(new_size, Image.Resampling.LANCZOS)

    canvas = Image.new("RGBA", (CANVAS_SIZE, CANVAS_SIZE), (0, 0, 0, 0))
    x = (CANVAS_SIZE - subject.width) // 2
    y = BASELINE_Y - subject.height
    if y < 8:
        raise RuntimeError(f"Normalized subject would clip in {path}")
    canvas.alpha_composite(subject, (x, y))
    canvas.save(path)


def main() -> None:
    paths = sorted(FRAME_DIR.glob("frame-*.png"))
    if len(paths) != 14:
        raise RuntimeError(f"Expected 14 frames, found {len(paths)}")
    for path in paths:
        normalize_frame(path)
        print(f"Normalized {path}")


if __name__ == "__main__":
    main()
