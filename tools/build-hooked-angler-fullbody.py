from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
BASE = ROOT / "public/images/result-effects-v2/hooked-transition-v3/layers/angler-pull-mid-thigh.png"
LEGS = ROOT / "public/images/result-effects-v2/hooked-transition-v4/sources/angler-fullbody-alpha.png"
OUTPUT = ROOT / "public/images/result-effects-v2/hooked-transition-v4/layers/angler-pull-fullbody.png"

# The approved v3 upper body remains pixel-for-pixel unchanged. Only the
# generated complete lower body is enlarged and placed behind it, aligned at
# the existing thigh edges. Most of this extension intentionally sits below
# the game viewport so the source remains complete without revealing boots.
LEGS_SCALE = 1.445
LEGS_X = -251
LEGS_Y = -12
LEGS_SOURCE_CUTOFF_Y = 600
OUTPUT_HEIGHT = 1460


def main() -> None:
    base = Image.open(BASE).convert("RGBA")
    legs = Image.open(LEGS).convert("RGBA")
    scaled_size = (
        round(legs.width * LEGS_SCALE),
        round(legs.height * LEGS_SCALE),
    )
    scaled_legs = legs.resize(scaled_size, Image.Resampling.LANCZOS)

    lower_mask = scaled_legs.getchannel("A")
    cutoff = round(LEGS_SOURCE_CUTOFF_Y * LEGS_SCALE)
    lower_mask.paste(0, (0, 0, lower_mask.width, cutoff))
    scaled_legs.putalpha(lower_mask)

    composed = Image.new("RGBA", (base.width, OUTPUT_HEIGHT), (0, 0, 0, 0))
    composed.alpha_composite(scaled_legs, (LEGS_X, LEGS_Y))
    composed.alpha_composite(base, (0, 0))

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    composed.save(OUTPUT, optimize=True)
    print(f"Wrote {OUTPUT}")


if __name__ == "__main__":
    main()
