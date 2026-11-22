"""Build the Arabic index and thumbnails from the finished localized SVGs."""
import argparse
import io
import json
import re
from pathlib import Path
from xml.etree import ElementTree as ET

from PIL import Image
from playwright.sync_api import sync_playwright

PROFILE = Path(__file__).resolve().parents[3] / "public/company-profile"
AR = PROFILE / "ar"
FONT = {"family": "Noto Kufi Arabic", "src": "/company-profile/ar/NotoKufiArabic.woff2", "weight": "100 900"}
SVG = "{http://www.w3.org/2000/svg}"


def catalog():
    original = json.loads((PROFILE / "manifest.json").read_text())
    slides = []
    for entry in original["slides"]:
        name = f'{entry["number"]:03}'
        artwork = ET.parse(AR / f"slides/{name}.svg").getroot()
        title = artwork.findtext(SVG + "title")
        description = artwork.findtext(SVG + "desc")
        if not title or not re.search(r"[ء-ي]", description or ""):
            raise ValueError(f"Page {name} needs a title and an Arabic transcript.")
        slides.append({**entry, "title": title, "language": "ar", "src": f"/company-profile/ar/slides/{name}.svg",
                       "thumbnail": f"/company-profile/ar/thumbs/{name}.webp", "fontFaces": [FONT]})
    return {**original, "slides": slides}


# Import inline as the reader does, so linked photographs, SVG definitions and
# Arabic font shaping participate in the browser's rendering of each thumbnail.
DRAW = """async (slide) => {
  const res = await fetch(slide.src);
  if (!res.ok) throw Error(slide.src);
  const xml = new DOMParser().parseFromString(await res.text(), 'image/svg+xml');
  const svg = document.importNode(xml.documentElement, true);
  document.body.replaceChildren(svg);
  svg.style.cssText = 'width:100%;height:100%;display:block';
  const sources = new Set([...svg.querySelectorAll('image')].map(im => im.getAttribute('href')));
  await Promise.all([...sources].map(async src => { const im = new Image(); im.src = src; await im.decode(); }));
  await document.fonts.ready;
  await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
}"""


def thumbnails(slides, url, captures):
    (AR / "thumbs").mkdir(exist_ok=True)
    if captures:
        captures.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as pw:
        browser = pw.chromium.launch()
        page = browser.new_page()
        page.goto(url.rstrip("/") + "/company-profile/ar/OFL.txt")
        page.set_content("<style>*{box-sizing:border-box}html,body{margin:0;width:100%;height:100%;overflow:hidden}</style><body/>")
        page.evaluate("""async font => {
          const face = new FontFace(font.family, 'url(' + font.src + ')', {weight:font.weight});
          document.fonts.add(await face.load());
        }""", FONT)
        for slide in slides:
            name = f'{slide["number"]:03}'
            width = 1400
            height = round(width * slide["height"] / slide["width"])
            page.set_viewport_size({"width": width, "height": height})
            page.evaluate(DRAW, slide)
            raw = page.screenshot()
            if captures:
                (captures / f"{name}.png").write_bytes(raw)
            with Image.open(io.BytesIO(raw)) as image:
                size = (384, round(384 * slide["height"] / slide["width"]))
                image.resize(size, Image.Resampling.LANCZOS).convert("RGB").save(AR / f"thumbs/{name}.webp", quality=84)
        browser.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--url", default="http://127.0.0.1:5173")
    parser.add_argument("--captures", type=Path, help="Optional directory for full-sized review images.")
    args = parser.parse_args()
    edition = catalog()
    thumbnails(edition["slides"], args.url, args.captures)
    (AR / "manifest.json").write_text(json.dumps(edition, ensure_ascii=False, separators=(",", ":")) + "\n")
    print(f'Indexed {len(edition["slides"])} Arabic slides and thumbnails.')
