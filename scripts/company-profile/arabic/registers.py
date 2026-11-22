"""Typeset the Arabic project register using its source spread artwork.

Requires lxml, uharfbuzz, and fonttools[woff]. Run from any working directory.
"""
import io
import json
import re
from functools import lru_cache
from pathlib import Path

import uharfbuzz as hb
from fontTools.ttLib import TTFont
from lxml import etree as ET


HERE = Path(__file__).resolve().parent
PROFILE = HERE.parents[2] / "public/company-profile"
AR = PROFILE / "ar"
SVG = "{http://www.w3.org/2000/svg}"
XML_LANG = "{http://www.w3.org/XML/1998/namespace}lang"
BODY_SIZE = 11
COLUMN_WIDTH = 378
COLUMN_EDGES = (1653.7, 1238.0, 811.8, 396.1)
LATIN_RUN = re.compile(r"[A-Za-zÀ-ÿ0-9]+(?:[ ’'./-][A-Za-zÀ-ÿ0-9]+)*")
INK = "#231f20"


def isolate_latin(value):
    # Keep identifiers such as 2C, 66/11 and multiword French names in LTR order.
    return LATIN_RUN.sub(lambda match: "\u2066" + match.group() + "\u2069", value)


def source_art(page):
    root = ET.parse(PROFILE / f"slides/{page}.svg").getroot()
    for group in root.iter(SVG + "g"):
        if group.get("data-role") in {"title", "text"}:
            group.getparent().remove(group)
    # The source uses vector outlines for some English glyphs. Their definition
    # paths are unused after removing those text layers.
    for path in root.find(SVG + "defs").findall(SVG + "path"):
        if "font" in path.get("id", ""):
            path.getparent().remove(path)
    root.attrib.pop("style", None)
    root.set("lang", "ar")
    root.set(XML_LANG, "ar")
    root.set("direction", "rtl")
    root.set("font-family", "Noto Kufi Arabic, sans-serif")
    root.set("role", "img")
    return root


def load_width_measure():
    # Measure shaped words at one em with the exact webfont. Arabic joins make
    # summing unshaped glyph advances unreliable for technical long-form rows.
    with TTFont(AR / "NotoKufiArabic.woff2") as ttf:
        ttf.flavor = None
        stream = io.BytesIO()
        ttf.save(stream)
    face = hb.Face(stream.getvalue())
    font = hb.Font(face)

    @lru_cache(maxsize=None)
    def width(text, weight=400):
        font.set_variations({"wght": weight})
        buf = hb.Buffer()
        buf.add_str(text)
        buf.guess_segment_properties()
        hb.shape(font, buf)
        return sum(p.x_advance for p in buf.glyph_positions) / face.upem

    return width


def wrap(entry, size, width):
    lines = []
    words = []
    used = 0
    for word in entry.split():
        word_width = width(word) * size
        space = width(" ") * size if words else 0
        if words and used + space + word_width > COLUMN_WIDTH:
            lines.append(" ".join(words))
            words, used, space = [], 0, 0
        words.append(word)
        used += space + word_width
    lines.append(" ".join(words))
    return lines


def layer(root, role, step):
    return ET.SubElement(root, SVG + "g", {"data-role": role, "data-step": str(step)})


def text_at(parent, value, x, y, size, weight=400, fill=INK, anchor="start"):
    t = ET.SubElement(parent, SVG + "text", {
        "x": str(x), "y": f"{y:.2f}", "direction": "rtl", "text-anchor": anchor,
        "font-weight": str(weight), "font-size": f"{size:.2f}", "fill": fill,
    })
    t.text = isolate_latin(value)


def body(root, columns, width):
    for number, entries in enumerate(columns):
        top = 101 if number == 0 else 43
        x = COLUMN_EDGES[number]
        size = BODY_SIZE
        while True:
            leading = size * 1.56
            rows = [wrap(entry, size, width) for entry in entries]
            baselines = sum(map(len, rows)) - 1
            available = 558 - top - baselines * leading
            gap = min(8.2, available / max(len(rows) - 1, 1))
            if gap >= 4:
                break
            size -= 0.25
            if size < 9:
                raise ValueError(f"Register column {number + 1} needs an editorial reflow")
        y = top
        for index, lines in enumerate(rows):
            if index % 5 == 0:
                group = layer(root, "text", min(8, number + index // 5))
            for line in lines:
                text_at(group, line, x, y, size)
                y += leading
            y += gap


def build():
    edition = json.loads((HERE / "registers.json").read_text())
    width = load_width_measure()
    (AR / "slides").mkdir(exist_ok=True, parents=True)
    for page, spread in edition.items():
        root = source_art(page)
        title = spread["title"]
        columns = spread.get("columns", [])
        root.find(SVG + "desc").text = "\n".join([title, *(row for col in columns for row in col)])
        title_element = ET.Element(SVG + "title")
        title_element.text = title
        root.insert(0, title_element)
        heading = layer(root, "title", 0 if columns else 2)
        if columns:
            size = min(30, 397 / width(title, 700))
            text_at(heading, title, COLUMN_EDGES[0], 64, size, 700)
            body(root, columns, width)
        else:
            text_at(heading, title, 1262.84, 316, 59, 700, "#ffffff", "middle")
        # Namespace inherited clip paths and image IDs when both languages are mounted.
        xml = ET.tostring(root, encoding="unicode")
        xml = xml.replace(f'id="p{page}-', f'id="ar-p{page}-').replace(f'#p{page}-', f'#ar-p{page}-')
        (AR / "slides" / f"{page}.svg").write_text(xml + "\n")


if __name__ == "__main__":
    build()
