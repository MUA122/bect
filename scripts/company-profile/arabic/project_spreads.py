"""Build the Arabic project spreads with their original vector masks and photography.

Run with Python, fontTools[woff], and uharfbuzz from any working directory.
The reviewed Arabic copy is in project-pages.json, indexed by the PDF page.
"""

import io
import json
import re
from functools import lru_cache
from pathlib import Path
import xml.etree.ElementTree as ET

from fontTools.ttLib import TTFont
import uharfbuzz as hb

from project_copy import metadata_rows

HERE = Path(__file__).resolve().parent
PUBLICATION = HERE.parents[2] / "public/company-profile"
SVG = "http://www.w3.org/2000/svg"
ET.register_namespace("", SVG)
ET.register_namespace("xlink", "http://www.w3.org/1999/xlink")
HALF = 841.89
WIDTH = 1683.78
HEIGHT = 595.28
FONT_FAMILY = "'Noto Kufi Arabic',sans-serif"
WHITE = "#ffffff"
MUTED = "#b9e1ef"
RULE = "#79b4cf"


def node(parent, kind, **attrs):
    return ET.SubElement(parent, f"{{{SVG}}}{kind}", {k.replace("_", "-"): str(v) for k, v in attrs.items()})


def group(parent, role, step=0):
    return node(parent, "g", data_role=role, data_step=step)


def box(parent, x, y, w, h, **attrs):
    return node(parent, "rect", x=x, y=y, width=w, height=h, **attrs)


def rule(parent, x1, y1, x2, y2, color=RULE, opacity=.64):
    return node(parent, "line", x1=x1, y1=y1, x2=x2, y2=y2,
                stroke=color, stroke_opacity=opacity, stroke_width=.75)


@lru_cache(maxsize=1)
def font_face():
    # Measure the same published variable font used to render the reader.
    font = TTFont(PUBLICATION / "ar/NotoKufiArabic.woff2")
    font.flavor = None
    buffer = io.BytesIO()
    font.save(buffer)
    return hb.Face(buffer.getvalue())


@lru_cache(maxsize=12)
def font_for(weight):
    font = hb.Font(font_face())
    font.set_variations({"wght": weight})
    return font


@lru_cache(maxsize=40000)
def measure(value, weight):
    # HarfBuzz uses script-specific shaping. Isolate Latin numbers and names.
    total = 0
    for chunk in re.findall(r"[A-Za-z0-9]+|[^A-Za-z0-9]+", value):
        buffer = hb.Buffer()
        buffer.add_str(chunk)
        buffer.guess_segment_properties()
        if re.search("[\u0600-\u06ff]", chunk):
            buffer.direction = "rtl"
            buffer.script = "arab"
            buffer.language = "ar"
        hb.shape(font_for(weight), buffer)
        total += sum(pos.x_advance for pos in buffer.glyph_positions)
    return total / font_face().upem


def wrapped(content, width, size, weight):
    result = []
    for word in content.split():
        if result and measure(result[-1] + " " + word, weight) * size <= width:
            result[-1] += " " + word
        else:
            result.append(word)
    return result


def write_lines(parent, lines, x, baseline, size, leading, weight, color=WHITE, anchor="start"):
    text = node(parent, "text", direction="rtl", text_anchor=anchor, x=x,
                font_family=FONT_FAMILY, font_size=round(size, 3), font_weight=weight, fill=color)
    for i, line in enumerate(lines):
        span = node(text, "tspan", x=x, y=round(baseline + leading*i, 2))
        # Keep institutional acronyms and project codes intact inside RTL text.
        span.text = re.sub(r"[A-Za-z][A-Za-z0-9./&-]*(?: [A-Za-z][A-Za-z0-9./&-]*)*",
                           lambda match: "\u2066" + match[0] + "\u2069", line)
    return baseline + len(lines)*leading


def clean_art(parent, images, mirror):
    """Keep drawings and original image masks. Drop all English labels and glyph outlines."""
    for child in list(parent):
        name = child.tag.split("}")[-1]
        if name in ("text", "title", "desc") or (name == "use" and "-font_" in child.get("href", "")):
            parent.remove(child)
            continue
        if name == "use" and mirror:
            image = images.get(child.get("href"))
            width = image.get("width") if image is not None else None
            if width:
                # Mirroring a divider moves each photo in its original mask.
                # Cancel that reflection locally to keep the photograph readable.
                before = child.get("transform", "")
                child.set("transform", f"{before} translate({width} 0) scale(-1 1)".strip())
        if child.get("data-role") == "image":
            ref = child.find(f"{{{SVG}}}use")
            image = images.get(ref.get("href")) if ref is not None else None
            filename = image.get("href", "").split("/")[-1] if image is not None else ""
            if filename in {"c6d070871df3f669ec.webp", "b51b818a7f01bd1507.jpg",
                            "afc1a455bfad91a535.jpg", "66e2b9d7ae42a457f6.jpg"}:
                child.attrib.pop("data-role", None)
                child.attrib.pop("data-step", None)
        else:
            child.attrib.pop("data-role", None)
            child.attrib.pop("data-step", None)
        clean_art(child, images, mirror)
        if name == "g" and not len(child):
            parent.remove(child)


def prune_defs(defs, artwork):
    """Only emit definitions reachable from retained graphic groups."""
    index = {element.get("id"): element for element in list(defs)}
    def references(element):
        return set(re.findall(r'(?:url\(#|href="#)([a-zA-Z_][\w.:-]*)', ET.tostring(element, encoding="unicode")))
    needed = references(artwork)
    pending = set(needed)
    while pending:
        more = set()
        for key in pending:
            if key in index:
                more.update(references(index[key]))
        pending = more - needed
        needed |= pending
    for element in list(defs):
        if element.get("id") not in needed:
            defs.remove(element)


def background(root):
    layer = group(root, "background")
    box(layer, 0, 0, WIDTH, HEIGHT, fill="#06568a")
    # This clean master is the same gradient/blueprint plate as the English page.
    # Its source orientation already has the light edge on the left for Arabic.
    node(layer, "image", x=HALF, y=0, width=HALF, height=HEIGHT,
         preserveAspectRatio="none", href="/company-profile/media/b51b818a7f01bd1507.jpg",
         data_screen_src="/company-profile/screen/b51b818a7f01bd1507-1440.webp")


def original_photo_panel(source, root, divider, number):
    defs = source.find(f"{{{SVG}}}defs")
    root.insert(2, defs)
    images = {"#" + element.get("id"): element for element in defs if element.tag.endswith("image")}
    clip_id = f"ar-window-{number}"
    cropped = node(root, "g", clip_path=f"url(#{clip_id})")
    transform = f"translate({WIDTH} 0) scale(-1 1)" if divider else f"translate(-{HALF} 0)"
    placed = node(cropped, "g", transform=transform)
    for element in list(source):
        if not element.tag.endswith("}g") or element.get("data-role") in {"art", "text", "title"}:
            continue
        clean_art(element, images, divider)
        if len(element):
            placed.append(element)
    prune_defs(defs, cropped)
    window = node(defs, "clipPath", id=clip_id)
    box(window, 0, 0, HALF, HEIGHT)


def divider_page(root, data):
    layer = group(root, "title")
    # Curved sector panel and fine cyan rule are retained from the source artwork.
    size = 21.5
    lines = wrapped(data["title"], 172, size, 650)
    leading = size * 1.65
    baseline = HEIGHT / 2 - (len(lines) - 1)*leading/2 + size*.31
    write_lines(layer, lines, 121, baseline, size, leading, 650, anchor="middle")
    write_lines(layer, [data["chapter"]], 45, 35, 13, 18, 600, "#42b7e4")


def metadata(root, data, number):
    layer = group(root, "text", 1)
    right, top, width = 1628, 198, 280
    label_size, body_size = 9.1, 12.6
    leading = body_size*1.73
    sizes = [width/2, width/2]
    for row in metadata_rows(data, number):
        split = len(row) > 1
        widths = sizes if split else [width]
        right_edge = right
        height = 0
        for (label, value), cell_width in zip(row, widths):
            lines = wrapped(value, cell_width-18, body_size, 470)
            write_lines(layer, [label], right_edge-9, top+17, label_size, 14, 580, MUTED)
            write_lines(layer, lines, right_edge-9, top+38, body_size, leading, 470)
            height = max(height, 47 + (len(lines)-1)*leading)
            right_edge -= cell_width
        if split:
            rule(layer, right-width/2, top, right-width/2, top+height)
        box(layer, right-width, top, width, round(height, 2), fill="none",
            stroke=RULE, stroke_width=.65, stroke_opacity=.71)
        top += height
    if top > HEIGHT-12:
        raise ValueError(f"Metadata overflows page {number}: {top}")


def overview(root, data, number):
    layer = group(root, "text", 2)
    x, width = 1318, 252
    write_lines(layer, ["نبذة عن المشروع"], x, 214, 10, 16, 610, MUTED)
    size = 12.35
    while size >= 9.25:
        leading = size*1.78
        blocks = [wrapped(paragraph, width, size, 450) for paragraph in data["overview"]]
        bottom = 238 + (sum(map(len, blocks))-1)*leading + (len(blocks)-1)*size*.52
        if bottom <= HEIGHT-34:
            break
        size -= .2
    else:
        raise ValueError(f"Narrative overflows page {number}")
    baseline = 238
    for lines in blocks:
        baseline = write_lines(layer, lines, x, baseline, size, leading, 450) + size*.52


def project_page(root, data, number):
    heading = group(root, "title")
    size, width = 34, 535
    while len(wrapped(data["title"], width, size, 690)) > 2:
        size -= .5
    lines = wrapped(data["title"], width, size, 690)
    write_lines(heading, lines, 1621, 92, size, size*1.45, 690)

    decoration = group(root, "decoration")
    for x in (1618, 1598, 1578):
        node(decoration, "circle", cx=x, cy=162, r=5.6, fill=WHITE)
    rule(decoration, 1333, 198, 1333, 557, opacity=.48)
    metadata(root, data, number)
    overview(root, data, number)


def map_legend(root, data):
    # The English legend is baked into the map photograph. The symbol colours
    # and map/site identifier remain intact; the Arabic key occupies its footprint.
    layer = group(root, "text", 1)
    # The PDF includes an outlined site code on top of the raster. Restore
    # this official map identifier after removing the PDF's Latin font glyphs.
    box(layer, 259, 91, 91, 35, rx=4, fill="#292b27")
    write_lines(layer, [data["legend"][4]], 304.5, 116, 17, 20, 620, anchor="middle")
    x, w = 529, HALF-529
    box(layer, x, 0, w, 190, fill="#ffffff", stroke="#45483d", stroke_width=1.2)
    write_lines(layer, [data["legend"][0]], 825, 26, 14, 22, 700, "#17212a")
    for i, (phrase, color) in enumerate(zip(data["legend"][1:4], ["#4e5128", "#80221f", "#c34744"])):
        y = 60 + i*47
        if i < 2:
            line = rule(layer, 811, y, 831, y, color, 1)
            line.set("stroke-width", "5")
            if i == 0:
                line.set("stroke-dasharray", "5 3")
        else:
            node(layer, "ellipse", cx=821, cy=y, rx=12, ry=6, stroke=color,
                 stroke_width=1.8, fill="none", stroke_dasharray="4 2")
        write_lines(layer, [phrase], 792, y+4, 12.5, 20, 500, "#18202a")


def render(number, data):
    # Namespace source IDs before adding them to a document with both editions.
    svg = (PUBLICATION / f"slides/{number:03}.svg").read_text()
    source = ET.fromstring(svg.replace(f"p{number}-", f"ar-p{number}-"))
    root = ET.Element(f"{{{SVG}}}svg", {
        "lang": "ar", "direction": "rtl", "width": str(WIDTH), "height": str(HEIGHT),
        "viewBox": f"0 0 {WIDTH} {HEIGHT}", "font-family": FONT_FAMILY,
    })
    node(root, "title").text = data["title"]
    desc = [data["title"]]
    divider = "chapter" in data
    if divider:
        desc.insert(0, "القسم " + data["chapter"])
    else:
        desc.extend(label + "، " + value for row in metadata_rows(data, number) for label, value in row)
        desc.extend(["نبذة عن المشروع", *data["overview"]])
        desc.extend(data.get("legend", []))
    node(root, "desc").text = "\n".join(desc)
    node(root, "style", data_standalone_font="true").text = (
        "@font-face{font-family:'Noto Kufi Arabic';font-style:normal;font-weight:100 900;"
        "src:url('/company-profile/ar/NotoKufiArabic.woff2') format('woff2')}"
    )
    background(root)
    original_photo_panel(source, root, divider, number)
    if divider:
        divider_page(root, data)
    else:
        project_page(root, data, number)
        if "legend" in data:
            map_legend(root, data)
    return ET.tostring(root, encoding="unicode")


if __name__ == "__main__":
    pages = json.loads((HERE / "project-pages.json").read_text())
    destination = PUBLICATION / "ar/slides"
    destination.mkdir(parents=True, exist_ok=True)
    for page, record in pages.items():
        (destination / f"{int(page):03}.svg").write_text(render(int(page), record) + "\n")
    titles = {page: record["title"] for page, record in pages.items()}
    (HERE / "project-titles.json").write_text(json.dumps(titles, ensure_ascii=False, indent=2) + "\n")
