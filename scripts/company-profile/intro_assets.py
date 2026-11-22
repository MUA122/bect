"""Extract the official BECT wordmark from the front cover of the supplied edition."""
from pathlib import Path

import pymupdf
from PIL import Image

PROFILE = Path(__file__).resolve().parents[2] / "public" / "company-profile"


def build_intro(document):
    output = PROFILE / "intro"
    output.mkdir(exist_ok=True)
    # This crop is the white wordmark on the first page of the 2026 edition.
    mark = document[0].get_pixmap(matrix=pymupdf.Matrix(3, 3),
                                  clip=pymupdf.Rect(186, 208, 431, 315))
    rgb = Image.frombytes("RGB", (mark.width, mark.height), mark.samples)
    opacity = rgb.getchannel("R").point(lambda value: (value - 25) * 255 / 222)
    logo = Image.new("RGBA", opacity.size, "white")
    logo.putalpha(opacity)
    logo.crop(opacity.getbbox()).save(output / "wordmark.png", optimize=True)


if __name__ == "__main__":
    with pymupdf.open(next(PROFILE.glob("*.pdf"))) as pdf:
        build_intro(pdf)
