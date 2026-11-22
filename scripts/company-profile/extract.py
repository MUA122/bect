#!/usr/bin/env python3
"""Regenerate the layered web edition from the original BECT publication.

Tested Python packages: PyMuPDF==1.26.5, Pillow==11.3.0, fonttools==4.60.2, lxml==6.1.3.
From the repository root: python scripts/company-profile/extract.py
The input PDF is read-only. No PDF library is shipped to the website.
"""
from __future__ import annotations

import base64
import hashlib
import io
import json
import logging
import re
from collections import defaultdict
from functools import lru_cache
from pathlib import Path

import pymupdf
from fontTools import subset
from fontTools.fontBuilder import FontBuilder
from fontTools.pens.boundsPen import BoundsPen
from fontTools.svgLib.path import parse_path
from fontTools.ttLib import TTFont
from lxml import etree as ET
from PIL import Image

from intro_assets import build_intro
from responsive_images import screen_variant

OUT = Path(__file__).resolve().parents[2] / "public" / "company-profile"
URL = "/company-profile/"
SVG = "{http://www.w3.org/2000/svg}"
XLINK = "{http://www.w3.org/1999/xlink}href"
SPACE = "{http://www.w3.org/XML/1998/namespace}space"
MATRIX = re.compile(r"[-+]?(?:\d*\.\d+|\d+)(?:[eE][-+]?\d+)?")
REF = re.compile(r"url\(#([^)]+)\)")
IDENTITY = (1, 0, 0, 1, 0, 0)
logging.getLogger("fontTools.subset").setLevel(logging.ERROR)


def rounded(value):
    return f"{value:.5f}".rstrip("0").rstrip(".") or "0"


def matrix(element):
    values = tuple(map(float, MATRIX.findall(element.get("transform", ""))))
    return values or IDENTITY


def multiply(a, b):
    aa, ab, ac, ad, ax, ay = a
    ba, bb, bc, bd, bx, by = b
    return (
        aa * ba + ac * bb,
        ab * ba + ad * bb,
        aa * bc + ac * bd,
        ab * bc + ad * bd,
        aa * bx + ac * by + ax,
        ab * bx + ad * by + ay,
    )


def point(m, x, y):
    a, b, c, d, e, f = m
    return a * x + c * y + e, b * x + d * y + f


def rect(m, bounds):
    x0, y0, x1, y1 = bounds
    coords = [point(m, x, y) for x in (x0, x1) for y in (y0, y1)]
    xs, ys = zip(*coords)
    return min(xs), min(ys), max(xs), max(ys)


def intersection(a, b):
    return max(a[0], b[0]), max(a[1], b[1]), min(a[2], b[2]), min(a[3], b[3])


def empty(box):
    return box[2] < box[0] - 0.001 or box[3] < box[1] - 0.001


@lru_cache(maxsize=8192)
def curve_bounds(shape):
    pen = BoundsPen(None)
    if shape:
        parse_path(shape, pen)
    return pen.bounds or (0.0, 0.0, 0.0, 0.0)


def write_bytes(path, data):
    if not path.exists() or path.read_bytes() != data:
        path.write_bytes(data)


def bitmap_asset(relative, data):
    original = OUT / relative
    if original.suffix == ".png" and len(data) > 512_000:
        lossless = original.with_suffix(".webp")
        if lossless.exists():
            return lossless
        # Re-encode the original pixels without changing their dimensions,
        # alpha channel, or RGB values. Some source PNGs exceed 16 MB.
        with Image.open(io.BytesIO(data)) as image:
            stream = io.BytesIO()
            image.save(stream, "WEBP", lossless=True, exact=True, method=3)
        encoded = stream.getvalue()
        if len(encoded) < len(data):
            lossless.write_bytes(encoded)
            return lossless
    if not original.exists():
        original.write_bytes(data)
    return original


class SourceFonts:
    """Match MuPDF's glyph IDs to the embedded font using the outline bounds.

    The PDF contains several unrelated weights with the same PostScript name,
    and some subsets have no Unicode cmap. A family-name lookup loses these
    distinctions. Retain the source glyph programs and give their used glyphs
    the Unicode mappings carried by the original PDF text operations.
    """

    def __init__(self, doc):
        self.doc = doc
        self.faces = {}
        self.source = {}
        self.mapping = defaultdict(dict)
        # Borrow a matching licensed face from another plate when a legacy
        # printer subset has lost its license table or Unicode character map.
        source_ids = {
            font[0]
            for page in doc
            for font in page.get_fonts()
            if font[1] == "ttf" and re.search("outfit|dejavu|bectpage10", font[3], re.I)
        }
        self.alternates = sorted({key for xref in source_ids if (key := self.candidate(xref))})

    @lru_cache(None)
    def candidate(self, xref):
        data = self.doc.extract_font(xref)[3]
        key = hashlib.sha256(data).hexdigest()[:12]
        if key not in self.faces:
            font = TTFont(io.BytesIO(data), recalcTimestamp=False)
            if "name" not in font or "OS/2" not in font or "cmap" not in font:
                return None
            license_text = font["name"].getDebugName(13) or ""
            if not ("Open Font License" in license_text or "Bitstream Vera" in license_text):
                return None
            if font["OS/2"].fsType & 2:
                return None
            self.faces[key] = font
            self.source[key] = data
        return key

    @lru_cache(None)
    def bounds(self, key, gid):
        font = self.faces[key]
        names = font.getGlyphOrder()
        if gid >= len(names):
            return None
        glyphs = font.getGlyphSet()
        pen = BoundsPen(glyphs)
        glyphs[names[gid]].draw(pen)
        return tuple(v / font["head"].unitsPerEm for v in (pen.bounds or (0, 0, 0, 0)))

    @lru_cache(None)
    def unicode_gid(self, key, char):
        if not char or len(char) != 1:
            return None
        font = self.faces[key]
        glyph = (font.getBestCmap() or {}).get(ord(char))
        return font.getGlyphID(glyph) if glyph else None

    def match(self, page, paths, characters):
        candidates = {
            key
            for item in page.get_fonts()
            if item[1] == "ttf" and re.search("outfit|dejavu|bectpage10", item[3], re.I)
            if (key := self.candidate(item[0]))
        }
        matches = {}
        for family, shapes in paths.items():
            # Widely drawn glyphs discriminate more reliably than punctuation.
            samples = sorted(shapes.items(), key=lambda p: len(p[1]), reverse=True)[:6]
            scores = []
            for key in candidates:
                distances = []
                for gid, shape in samples:
                    candidate = self.bounds(key, gid)
                    if candidate is None:
                        break
                    distances.append(
                        max(abs(a - b) for a, b in zip(candidate, curve_bounds(shape)))
                    )
                if len(distances) == len(samples):
                    scores.append((max(distances), sum(distances), key))
            if scores and min(scores)[0] <= 0.005:
                matches[family] = (min(scores)[2], False)
                continue
            # The renderer occasionally encounters a second, differently
            # numbered subset of the same original face. Compare the same
            # Unicode letters against known, licensed source outlines.
            scores = []
            for key in self.alternates:
                distances = []
                for gid, shape in samples:
                    alternate = self.unicode_gid(key, characters.get((family, gid)))
                    if alternate is None:
                        break
                    candidate = self.bounds(key, alternate)
                    distances.append(
                        max(abs(a - b) for a, b in zip(candidate, curve_bounds(shape)))
                    )
                if len(distances) == len(samples):
                    scores.append((max(distances), sum(distances), key))
            if scores and min(scores)[0] <= 0.002:
                matches[family] = (min(scores)[2], True)
        return matches

    def accept(self, key, char, gid):
        if len(char) != 1 or ord(char) < 32:
            return False
        code = ord(char)
        if self.mapping[key].get(code, gid) != gid:
            return False
        self.mapping[key][code] = gid
        return True

    def save(self):
        for key, mapping in self.mapping.items():
            font = TTFont(io.BytesIO(self.source[key]), recalcTimestamp=False)
            names = font.getGlyphOrder()
            fb = FontBuilder(font=font)
            fb.setupCharacterMap({code: names[gid] for code, gid in mapping.items()})
            options = subset.Options()
            options.name_IDs = ["*"]
            options.notdef_outline = True
            options.layout_features = []
            subsetter = subset.Subsetter(options)
            subsetter.populate(unicodes=mapping)
            subsetter.subset(font)
            font.flavor = "woff"
            stream = io.BytesIO()
            font.save(stream)
            write_bytes(OUT / "fonts" / f"{key}.woff", stream.getvalue())


class Plate:
    def __init__(self, page, number, fonts):
        self.page = page
        self.number = number
        self.width, self.height = page.rect.width, page.rect.height
        self.fonts = fonts
        self.used_fonts = set()
        self.root = ET.fromstring(
            page.get_svg_image(text_as_path=True).encode(),
            parser=ET.XMLParser(huge_tree=True, remove_blank_text=True),
        )
        self.defs = self.root.find(SVG + "defs")
        for i, image in enumerate(self.root.iter(SVG + "image")):
            if not image.get("id"):
                image.set("id", f"bitmap_{i}")
        self.ids = {e.get("id"): e for e in self.root.iter() if "id" in e.attrib}
        paths = defaultdict(dict)
        for key, node in self.ids.items():
            if key.startswith("font_"):
                _, family, glyph = key.split("_")
                paths[family][int(glyph)] = node.get("d", "")
        characters = {}
        for node in self.root.iter(SVG + "use"):
            if "data-text" in node.attrib:
                family, glyph = node.get(XLINK).split("_")[-2:]
                characters[(family, int(glyph))] = node.get("data-text")
        self.faces = fonts.match(page, paths, characters)

    def clip_rect(self, node, transform, bounds):
        clip = node.get("clip-path")
        if clip and (match := REF.fullmatch(clip)):
            geometry = self.ids[match.group(1)]
            if len(geometry) == 1 and geometry[0].tag == SVG + "path":
                path = geometry[0]
                box = rect(multiply(transform, matrix(path)), curve_bounds(path.get("d", "")))
                return intersection(bounds, box)
        return bounds

    def image_node(self, elem):
        if elem.tag == SVG + "image":
            return elem
        if elem.tag == SVG + "use":
            target = self.ids.get(elem.get(XLINK, "").lstrip("#"))
            if target is not None and target.tag == SVG + "image":
                return target
        return None

    def role_for_image(self, box):
        x0, y0, x1, y1 = box
        large = y1 - y0 > 0.86 * self.height
        if self.number in (1, 120):
            return ("background", 0) if large else ("image", 1)
        if x0 + x1 < 1.08 * self.width and large and x1 - x0 > 0.4 * self.width:
            return "background", 0
        return "image", min(4, max(0, int(max(0, y0) / self.height * 3)))

    def convert(self, node, transform, bounds):
        """Walk the original paint stack. Group only contiguous operations."""
        result = []
        text_run = None

        def append(child, role=None, step=0):
            if role:
                if (
                    result
                    and result[-1].get("data-role") == role
                    and result[-1].get("data-step") == str(step)
                ):
                    result[-1].append(child)
                else:
                    layer = ET.Element(SVG + "g", {"data-role": role, "data-step": str(step)})
                    layer.append(child)
                    result.append(layer)
            else:
                result.append(child)

        for elem in list(node):
            local = multiply(transform, matrix(elem))
            if elem.tag == SVG + "defs":
                append(elem)
                continue
            if elem.tag == SVG + "g":
                clipping = self.clip_rect(elem, local, bounds)
                if not empty(clipping):
                    self.convert(elem, local, clipping)
                    if len(elem):
                        append(elem)
                text_run = None
                continue
            img = self.image_node(elem)
            if img is not None:
                box = rect(local, (0, 0, float(img.get("width")), float(img.get("height"))))
                visible = intersection(box, bounds)
                if not empty(visible):
                    # All images live in defs, including originals that the PDF
                    # references again from inside a different clipping group.
                    if elem is img:
                        elem = ET.Element(SVG + "use", {"href": "#" + img.get("id")})
                    append(elem, *self.role_for_image(visible))
                text_run = None
                continue
            if elem.tag == SVG + "use" and "data-text" in elem.attrib:
                ident = elem.get(XLINK, "")
                family, gid = ident.split("_")[-2:]
                char = elem.get("data-text")
                glyph = self.ids[ident[1:]]
                box = rect(local, curve_bounds(glyph.get("d", "")))
                if empty(intersection(box, bounds)):
                    continue
                a, b, c, d, x, y = matrix(elem)
                _, sy = point(transform, x, y)
                role = "title" if abs(d) >= 23 else "text"
                step = min(4, max(0, int(sy / self.height * 5)))
                paint = {
                    k: v
                    for k, v in elem.attrib.items()
                    if k not in (XLINK, "data-text", "transform")
                }
                key, remap = self.faces.get(family, (None, False))
                source_gid = self.fonts.unicode_gid(key, char) if remap else int(gid)
                if remap and source_gid is not None:
                    delta = max(
                        abs(a - b)
                        for a, b in zip(
                            self.fonts.bounds(key, source_gid), curve_bounds(glyph.get("d", ""))
                        )
                    )
                    if delta > 0.002:
                        source_gid = None
                # Keep rotated, ambiguously encoded or unlicensed glyphs as
                # their original vectors. The slide transcript remains readable.
                if (
                    key
                    and b == 0
                    and c == 0
                    and a > 0
                    and d < 0
                    and source_gid is not None
                    and self.fonts.accept(key, char, source_gid)
                ):
                    self.used_fonts.add(key)
                    context = (family, a, d, y, role, step, tuple(paint.items()))
                    if text_run is None or text_run[0] != context or x <= text_run[2]:
                        attrs = {
                            "font-family": "BectFace" + key,
                            "font-size": rounded(-d),
                            "y": rounded(y),
                            SPACE: "preserve",
                            **paint,
                        }
                        if abs(a + d) > 0.00001:
                            attrs["transform"] = "scale(" + rounded(a / -d) + " 1)"
                        line = ET.Element(SVG + "text", attrs)
                        append(line, role, step)
                        text_run = (context, line, x)
                    line = text_run[1]
                    xpos = rounded(x * (-d) / a)
                    line.set("x", (line.get("x", "") + " " + xpos).strip())
                    line.text = (line.text or "") + char
                    text_run = (context, line, x)
                else:
                    append(elem, role, step)
                    text_run = None
                continue
            text_run = None
            if elem.tag == SVG + "path":
                box = rect(local, curve_bounds(elem.get("d", "")))
                # A stroke extends outside the path's geometric bounds.
                pad = float(elem.get("stroke-width", "1")) * max(abs(local[0]), abs(local[3]), 1)
                if empty(
                    intersection((box[0] - pad, box[1] - pad, box[2] + pad, box[3] + pad), bounds)
                ):
                    continue
                role = (
                    "background"
                    if box[2] - box[0] > self.width * 0.46 and box[3] - box[1] > self.height * 0.8
                    else "art"
                )
                append(elem, role, 0)
            else:
                append(elem, "art")
        node[:] = result

    def save(self, filename):
        # Save the direct paints before relocating the image definition nodes.
        original_images = list(self.root.iter(SVG + "image"))
        self.convert(self.root, IDENTITY, (0, 0, self.width, self.height))
        for img in original_images:
            if not any(el.tag == SVG + "defs" for el in img.iterancestors()):
                self.defs.append(img)

        # Follow defs transitively. Old versions of artwork in the PDF can
        # contain unused masks, image copies and entire unused glyph alphabets.
        keep = set()

        def refs(tree):
            for el in tree.iter():
                for attr, value in el.attrib.items():
                    if attr in (XLINK, "href") and value.startswith("#"):
                        yield value[1:]
                    yield from REF.findall(value)

        todo = [ref for el in self.root if el is not self.defs for ref in refs(el)]
        while todo:
            ident = todo.pop()
            if ident in keep:
                continue
            keep.add(ident)
            target = self.ids.get(ident)
            if target is not None:
                todo.extend(refs(target))
                # A later mask may reuse the bitmap defined inside an earlier
                # mask. Keep the containing definition even when that first
                # mask itself is never painted in the visible page crop.
                for parent in target.iterancestors():
                    if parent is self.defs:
                        break
                    if parent.get("id"):
                        todo.append(parent.get("id"))

        for el in list(self.defs):
            if el.get("id") not in keep:
                self.defs.remove(el)
        for el in self.root.iter():
            if el.tag == SVG + "image" and (href := el.get(XLINK, "")).startswith("data:"):
                header, encoded = href.split(",", 1)
                ext = header.split("/")[1].split(";")[0].replace("jpeg", "jpg")
                data = base64.b64decode(encoded)
                digest = hashlib.sha256(data).hexdigest()[:18]
                path = "media/" + digest + "." + ext
                master = bitmap_asset(path, data)
                el.set("href", URL + master.relative_to(OUT).as_posix())
                small = screen_variant(master)
                if small:
                    el.set("data-screen-src", URL + small.relative_to(OUT).as_posix())
                del el.attrib[XLINK]
            for attr, val in list(el.attrib.items()):
                if attr == "id":
                    el.set(attr, f"p{self.number}-{val}")
                elif attr in (XLINK, "href") and val.startswith("#"):
                    # SVG2 href is supported by current Safari/Firefox/Chromium.
                    if attr == XLINK:
                        del el.attrib[attr]
                    el.set("href", f"#p{self.number}-{val[1:]}")
                elif "url(#" in val:
                    el.set(attr, REF.sub(lambda m: f"url(#p{self.number}-{m.group(1)})", val))
        self.root.set("style", "font-kerning:none;font-variant-ligatures:none;direction:ltr")
        self.root.set("lang", "en")
        desc = ET.Element(SVG + "desc")
        desc.text = transcript(self.page, self.number)
        self.root.insert(0, desc)
        ET.cleanup_namespaces(self.root)
        write_bytes(OUT / filename, ET.tostring(self.root, encoding="utf-8"))


def transcript(page, number):
    if number == 7:
        # The entire right-hand timeline is flattened in the source. Its
        # invisible OCR text uses an invalid character map. Transcribed from
        # the visible publication, following the chronology around the fold.
        return (Path(__file__).with_name("milestones.txt")).read_text().strip()
    body = page.get_text("text").strip()
    if number in (1, 120):
        return "BECT Architects & Engineers. 35+ Years of Impact.\n" + body
    if number in (13, 38, 45, 50, 62, 75, 85, 96, 100, 108):
        # The print file repeats sector labels under its narrow fold clips.
        return "\n".join(dict.fromkeys(body.splitlines()))
    if number in (6, 8, 9, 11, 116, 117, 118, 119):
        # Read down each of the source's columns in physical page order.
        stops = {6: [0.5, 0.744], 8: [0.5], 9: [0.5], 11: [0.16, 0.32, 0.5, 0.665, 0.83]}.get(
            number, [0.25, 0.5, 0.75]
        )
        blocks = page.get_text("blocks")

        def reading_order(block):
            column = sum(block[0] >= stop * page.rect.width for stop in stops)
            return column, round(block[1], 1), block[0]

        return "\n".join(
            block[4].strip() for block in sorted(blocks, key=reading_order) if block[4].strip()
        )
    return body


def catalog(doc):
    # The section index on page 12 includes the actual sector names and their
    # printed start pages. All other titles below identify the original plates.
    index = doc[11].get_text().strip().splitlines()[3:]
    sectors = {int(index[i + 1]): index[i] for i in range(0, len(index), 2)}
    headings = {
        1: "Company Profile",
        2: "35+ Years of Impact",
        3: "Table of Contents",
        4: "Table of Contents",
        5: "Practice Overview",
        6: "About Us & Our CEOs",
        7: "Principles, Key Figures & Our Milestones",
        8: "Expertise & International Associates",
        9: "Organization & Key Members",
        10: "Location, International Entity & Directory",
        11: "Partners",
        12: "Selected Projects",
        94: "10 Dams in Asir",
        115: "List of Projects",
        120: "Contact",
        **sectors,
    }
    starts = {1: headings[1], 5: headings[5], 12: headings[12], **sectors, 115: headings[115]}
    slides = []
    for n, page in enumerate(doc, 1):
        content = page.get_text()
        if n in headings:
            title = headings[n]
        elif n < 115:
            title = " ".join(content.split("LOCATION")[0].split())
        else:
            title = next(
                line.strip() for line in content.splitlines() if line.startswith("Projects ")
            )
        section = starts[max(i for i in starts if i <= n)]
        if n in sectors:
            kind = "sector"
        elif n in (5, 12, 115):
            kind = "chapter"
        elif 14 <= n < 115:
            kind = "project"
        elif n in (3, 4):
            kind = "contents"
        elif 6 <= n <= 11:
            kind = "practice"
        else:
            kind = {1: "cover", 2: "identity", 120: "closing"}.get(n, "list")
        slides.append(
            {
                "number": n,
                "title": title,
                "sector": section,
                "type": kind,
                "width": round(page.rect.width, 2),
                "height": round(page.rect.height, 2),
                "src": f"{URL}slides/{n:03}.svg",
                "thumbnail": f"{URL}thumbs/{n:03}.webp",
                "transition": "section" if n in starts and n > 1 else "regular",
            }
        )
    return {
        "slides": slides,
        "sections": [{"title": title, "start": n} for n, title in sorted(starts.items())],
    }


def main():
    sources = list(OUT.glob("*.pdf"))
    if len(sources) != 1:
        raise SystemExit("Expected one original PDF in public/company-profile")
    for directory in ("slides", "media", "fonts", "thumbs"):
        (OUT / directory).mkdir(exist_ok=True)
    with pymupdf.open(sources[0]) as doc:
        manifest = catalog(doc)
        faces = SourceFonts(doc)
        for metadata in manifest["slides"]:
            n = metadata["number"]
            page = doc[n - 1]
            plate = Plate(page, n, faces)
            plate.save(f"slides/{n:03}.svg")
            metadata["fontFaces"] = [
                {"family": "BectFace" + k, "src": URL + "fonts/" + k + ".woff"}
                for k in sorted(plate.used_fonts)
            ]
            thumb = page.get_pixmap(
                matrix=pymupdf.Matrix(384 / page.rect.width, 384 / page.rect.width),
                colorspace=pymupdf.csRGB,
                alpha=False,
            )
            im = Image.frombytes("RGB", (thumb.width, thumb.height), thumb.samples)
            buf = io.BytesIO()
            im.save(buf, format="WEBP", quality=83, method=4)
            write_bytes(OUT / f"thumbs/{n:03}.webp", buf.getvalue())
            if n in (1, 14) or n % 10 == 0:
                print(f"Reconstructed page {n}/{len(doc)}", flush=True)
        faces.save()
        write_bytes(
            OUT / "manifest.json",
            json.dumps(manifest, ensure_ascii=False, separators=(",", ":")).encode(),
        )


    # The larger intro previews should use a fresh PDF image cache, separate
    # from the small thumbnail renders above.
    with pymupdf.open(sources[0]) as doc:
        build_intro(doc)


if __name__ == "__main__":
    main()
