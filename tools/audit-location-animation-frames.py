from pathlib import Path

from PIL import Image, ImageDraw, ImageStat


ROOT = Path(__file__).resolve().parents[1]
ASSET_ROOT = ROOT / "public" / "images" / "location-backgrounds"
OUTPUT_ROOT = ROOT / "output" / "animation-frame-audit"
LOCATIONS = ("signal-canal", "sunken-reservoir")


def checkerboard(size: tuple[int, int], cell: int = 12) -> Image.Image:
    image = Image.new("RGB", size, (31, 38, 40))
    draw = ImageDraw.Draw(image)
    for y in range(0, size[1], cell):
        for x in range(0, size[0], cell):
            if (x // cell + y // cell) % 2:
                draw.rectangle((x, y, x + cell - 1, y + cell - 1), fill=(48, 56, 58))
    return image


def audit_objects(location: str) -> None:
    object_root = ASSET_ROOT / location / "animation-objects"
    for object_dir in sorted(path for path in object_root.iterdir() if path.is_dir()):
        frames = [Image.open(path).convert("RGBA") for path in sorted(object_dir.glob("frame-*.png"))]
        width, height = frames[0].size
        scale = min(3, max(1, 280 // max(width, height)))
        cell_size = (width * scale, height * scale + 20)
        contact = Image.new("RGB", (cell_size[0] * 4, cell_size[1] * 2), (18, 24, 26))
        draw = ImageDraw.Draw(contact)
        lumas = []
        for index, frame in enumerate(frames):
            enlarged = frame.resize((width * scale, height * scale), Image.Resampling.NEAREST)
            tile = checkerboard(enlarged.size)
            tile.paste(enlarged, (0, 0), enlarged)
            x = (index % 4) * cell_size[0]
            y = (index // 4) * cell_size[1]
            contact.paste(tile, (x, y))
            draw.text((x + 6, y + enlarged.height + 3), f"FRAME {index:02d}", fill=(232, 215, 170))
            alpha = frame.getchannel("A")
            rgb = frame.convert("RGB")
            lumas.append(round(ImageStat.Stat(rgb, mask=alpha).mean[0] * 0.2126
                               + ImageStat.Stat(rgb, mask=alpha).mean[1] * 0.7152
                               + ImageStat.Stat(rgb, mask=alpha).mean[2] * 0.0722, 1))
        contact.save(OUTPUT_ROOT / f"{location}-{object_dir.name}.png", optimize=True)
        print(f"{location}/{object_dir.name}: 8 frames, mean luma {min(lumas)}..{max(lumas)}")


def audit_scene(location: str) -> None:
    background = Image.open(ASSET_ROOT / location / "background.png").convert("RGBA")
    contact = Image.new("RGB", (1920, 600), (15, 20, 22))
    draw = ImageDraw.Draw(contact)
    for index in range(8):
        scene = background.copy()
        for layer in ("site", "water", "runoff"):
            overlay = Image.open(
                ASSET_ROOT / location / "animations" / layer / f"frame-{index:02d}.png"
            ).convert("RGBA")
            scene.alpha_composite(overlay)
        scene = scene.resize((480, 270), Image.Resampling.LANCZOS)
        x = (index % 4) * 480
        y = (index // 4) * 300
        contact.paste(scene.convert("RGB"), (x, y))
        draw.text((x + 8, y + 276), f"{location} / frame {index:02d}", fill=(240, 220, 170))
    contact.save(OUTPUT_ROOT / f"{location}-full-scene.png", optimize=True)


def main() -> None:
    OUTPUT_ROOT.mkdir(parents=True, exist_ok=True)
    for location in LOCATIONS:
        audit_objects(location)
        audit_scene(location)
    print(f"Audit images written to {OUTPUT_ROOT}")


if __name__ == "__main__":
    main()
