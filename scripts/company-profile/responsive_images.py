"""Create fit-to-screen image variants. The PDF coordinates stay in the SVG."""
import io
from functools import lru_cache
from pathlib import Path

from PIL import Image


@lru_cache(maxsize=None)
def screen_variant(path: Path):
    # The original filename is a content hash, so unchanged variants are reusable.
    target = path.parent.parent / "screen" / (path.stem + "-1440.webp")
    if target.exists():
        return target
    with Image.open(path) as source:
        if max(source.size) <= 1440:
            return None
        # Pixel masks and small line details must keep their tonal values.
        lossless = source.mode in ("1", "L", "LA", "P")
        source.thumbnail((1440, 1440), Image.Resampling.LANCZOS)
        if source.mode not in ("RGB", "RGBA"):
            alpha = "A" in source.getbands() or "transparency" in source.info
            source = source.convert("RGBA" if alpha else "RGB")
        encoded = io.BytesIO()
        source.save(encoded, format="WEBP", lossless=lossless, quality=91, method=4)
    target.parent.mkdir(exist_ok=True)
    target.write_bytes(encoded.getvalue())
    return target
