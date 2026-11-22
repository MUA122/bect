"""Generate the Arabic opening and closing spreads from their original publication artwork.

Requires lxml, uharfbuzz, and fontTools[woff]. Run from any directory after
project-titles.json is available. The reader loads the bundled face before display.
"""
from copy import deepcopy
from functools import lru_cache
from io import BytesIO
import json
from pathlib import Path
import re

from fontTools.ttLib import TTFont
from lxml import etree as ET
import uharfbuzz as hb

HERE = Path(__file__).resolve().parent
PUBLIC = HERE.parents[2] / "public/company-profile"
OUT = PUBLIC / "ar/slides"
NS = "http://www.w3.org/2000/svg"
HALF, HEIGHT = 841.89, 595.28
WHITE, BLUE, INK = "#ffffff", "#164e80", "#192d3b"
COPY = json.loads((HERE / "practice-copy.json").read_text())
PROJECTS = json.loads((HERE / "project-titles.json").read_text())
PARTNERS = json.loads((HERE / "practice-partners.json").read_text())
TO_ARABIC = str.maketrans("0123456789", "٠١٢٣٤٥٦٧٨٩")

font_file = TTFont(PUBLIC / "ar/NotoKufiArabic.woff2")
font_file.flavor = None
font_buffer = BytesIO()
font_file.save(font_buffer)
face = hb.Face(font_buffer.getvalue())


@lru_cache(maxsize=12)
def shaped_font(weight):
    font = hb.Font(face)
    font.set_variations({"wght": weight})
    return font


@lru_cache(maxsize=8192)
def em_width(text, weight):
    buf = hb.Buffer()
    buf.add_str(text)
    buf.guess_segment_properties()
    hb.shape(shaped_font(weight), buf)
    return sum(p.x_advance for p in buf.glyph_positions) / face.upem


def number(value):
    return str(value).translate(TO_ARABIC)


def node(tag, parent=None, **attrs):
    el = ET.Element(ET.QName(NS, tag), nsmap={None: NS}) if parent is None else ET.SubElement(parent, ET.QName(NS, tag))
    for name, value in attrs.items():
        el.set(name.replace("_", "-"), f"{value:g}" if isinstance(value, float) else str(value))
    return el


def group(parent, role, step=0):
    return node("g", parent, data_role=role, data_step=step)


def source_layers(page):
    if page in (1, 120):
        # Original cover bitmaps have the English wordmark and type baked into the
        # paper itself. The left chapter sheet uses the same unlettered blue stock.
        paper = ET.parse(PUBLIC / "slides/005.svg").xpath('//*[@id="p5-image_9"]')[0]
        background = node("g", data_role="background", data_step=0)
        image = node("image", background, href=paper.get("href"), width=HALF, height=HEIGHT,
                     preserveAspectRatio="xMidYMid slice")
        if paper.get("data-screen-src"):
            image.set("data-screen-src",paper.get("data-screen-src"))
        return node("defs"), [background]
    src = ET.parse(PUBLIC / "slides" / f"{page:03}.svg").getroot()
    src_defs = src.find(f"{{{NS}}}defs")
    src.remove(src_defs)
    for item in src.xpath('.//*[@data-role]'):
        role = item.get("data-role")
        remove = role in {"title", "text"}
        if page == 7:
            # The milestone graphic contains both embedded and outlined English.
            hrefs = [use.get("href") for use in item.iter(f"{{{NS}}}use")]
            paths = list(item.iter(f"{{{NS}}}path"))
            remove |= "#p7-image_69" in hrefs or len(paths) == 74
            # Remove the timeline rules traversing the fold. The Arabic route runs in reverse.
            for path in paths:
                if "H8427.1" in path.get("d", "") or "H8302.52" in path.get("d", ""):
                    path.getparent().remove(path)
        if remove:
            item.getparent().remove(item)
    paint = [e for e in src if ET.QName(e).localname == "g"]
    return src_defs, paint


def wrapped(text, width, size, weight):
    lines = []
    for para in text.splitlines():
        current = ""
        for word in para.split():
            candidate = f"{current} {word}" if current else word
            if current and em_width(candidate, weight) * size > width * .976:
                lines.append(current)
                current = word
            else:
                current = candidate
        if current:
            lines.append(current)
    return lines


class Spread:
    def __init__(self, page, source=None, mode="straight"):
        self.page = page
        w = HALF if page in (1, 120) else HALF * 2
        self.root = node("svg", width=w, height=HEIGHT, viewBox=f"0 0 {w} {HEIGHT}", version="1.1",
                         lang="ar", direction="rtl", font_family="Noto Kufi Arabic, sans-serif")
        self.root.set("{http://www.w3.org/XML/1998/namespace}lang", "ar")
        self.title = COPY["titles"][str(page)]
        node("title", self.root).text = self.title
        self.desc = node("desc", self.root)
        self.transcript = []
        defs, paint = source_layers(source or page)
        self.root.append(defs)
        node("style", defs, data_standalone_font="true").text = "@font-face{font-family:'Noto Kufi Arabic';src:url('/company-profile/ar/NotoKufiArabic.woff2') format('woff2');font-weight:100 900;font-display:swap}"
        if mode == "swap":
            # Reorder the two printed pages without reflecting faces or photography.
            for i in (1, 0):
                pane = node("svg", self.root, x=HALF * (1-i), y=0, width=HALF, height=HEIGHT,
                            viewBox=f"{i*HALF} 0 {HALF} {HEIGHT}", overflow="hidden")
                pane.extend(deepcopy(paint))
        elif mode == "mirror":
            node("g", self.root, transform=f"translate({2*HALF} 0) scale(-1 1)").extend(paint)
        else:
            self.root.extend(paint)

    def text(self, value, x, top, width, height, size=14, *, weight=400, fill=WHITE, center=False,
             valign="top", role="text", step=1, leading=1.65, verbatim=False, record=True):
        """Fit a native RTL block inside its authored rectangle using shaped advances."""
        size = float(size)
        while True:
            lines = [value] if verbatim else wrapped(value, width, size, weight)
            needed = size * (1.62 + (len(lines)-1) * leading)
            measured = max(em_width(line, weight) * size for line in lines)
            if needed <= height and measured <= width * .99:
                break
            if size < 4:
                raise ValueError(f"Text does not fit on page {self.page}: {value}")
            size -= .15
        if valign == "middle":
            top += (height-needed) / 2
        # Kufi includes tall ascenders and deeper descenders than a Latin sans serif.
        baseline = top + 1.13 * size
        px = x + (width/2 if center else width)
        block = group(self.root, role, step)
        latin = bool(re.fullmatch(r"[\x20-\x7e]+", value))
        for i, line in enumerate(lines):
            t = node("text", block, x=round(px, 3), y=round(baseline + i*size*leading, 3),
                     font_size=round(size, 3), font_weight=weight, fill=fill, direction="ltr" if latin else "rtl",
                     text_anchor="middle" if center else ("end" if latin else "start"),
                     style="unicode-bidi:isolate")
            t.text = line
        if record:
            self.transcript.append(value)
        return needed

    def heading(self, value, x, y, w, h, size=36, **kwargs):
        return self.text(value, x, y, w, h, size, weight=700, role="title", step=0, valign="middle", **kwargs)

    def logo(self, x, y, width):
        g = group(self.root, "image", 0)
        node("image", g, href="/company-profile/ar/wordmark-white.png", x=x, y=y, width=width,
             height=width*804/3221, preserveAspectRatio="xMidYMid meet")
        self.transcript.append("بيكت للاستشارات الهندسية، أكثر من ٣٥ عامًا من الخبرة.")

    def line(self, x1, y1, x2, y2, **atts):
        node("line", self.root, x1=x1, y1=y1, x2=x2, y2=y2, **atts)

    def write(self):
        self.desc.text = "\n".join(self.transcript)
        defs = self.root.find(f"{{{NS}}}defs")
        # Eliminate unused source glyph outlines, masks, and stale wordmark bitmaps.
        for g in reversed(self.root.xpath('.//*[local-name()="g"]')):
            if not len(g):
                g.getparent().remove(g)
        by_id = {e.get("id"): e for e in defs if e.get("id")}
        owners = {child.get("id"): key for key, el in by_id.items()
                  for child in el.iter() if child.get("id")}
        def refs(e):
            return {owners[ref] for sub in e.iter() for attr in sub.attrib.values()
                    for ref in re.findall(r"(?:url\(#|^#)([\w.-]+)", attr) if ref in owners}
        needed = {ref for el in self.root if el is not defs for ref in refs(el)}
        todo = list(needed)
        while todo:
            more = refs(by_id[todo.pop()]) - needed
            needed.update(more)
            todo.extend(more)
        for key, el in by_id.items():
            if key not in needed:
                defs.remove(el)
        xml = ET.tostring(self.root, encoding="unicode").replace(f"p{self.page}-", f"ar{self.page}-")
        # Page 5 also supplies the continuous blue paper used for indexes and dividers.
        if self.page in (3,4,12):
            xml = xml.replace("p5-", f"ar{self.page}-")
        (OUT / f"{self.page:03}.svg").write_text(xml)


def covers():
    s = Spread(1)
    s.logo(184, 187, 474)
    s.heading("الملف التعريفي للشركة", 80, 322, HALF-160, 75, 39, center=True)
    s.text("مصر / المملكة العربية السعودية", 80, 540, HALF-160, 34, 15, center=True)
    s.write()
    s = Spread(2)
    s.logo(1430, 201, 224)
    s.heading("أكثر من ٣٥ عامًا", 23, 160, 251, 68, 26, center=True)
    s.text("من الأثر الهندسي", 23, 230, 249, 55, 22, center=True)
    s.write()
    s = Spread(120)
    s.logo(238, 218, 366)
    a = COPY["contacts"]
    for key, addr, tel, top in (("riyadh","riyadhClosing","riyadhPhone",447),("cairo","cairoAddress","cairoPhone",515)):
        s.text(a[key], 52, top, HALF-104, 23, 12, center=True, weight=700)
        s.text(a[addr], 52, top+21, HALF-104, 19, 10, center=True)
        s.text("هاتف " + "\u2066" + a[tel] + "\u2069", 52, top+38, HALF-104, 20, 10, center=True)
    s.write()


def contents():
    practice = COPY["practiceToc"]
    section_numbers = set(COPY["sectorPages"])
    for p, halves in [(3, [(13,37),(38,61)]), (4, [(62,84),(85,114)])]:
        s = Spread(p, source=5)
        for half_index, (first,last) in enumerate(halves):
            origin = HALF * (1-half_index)
            rows = []
            if p == 3 and half_index == 0:
                rows = [(s.title,None,"title"),(COPY["titles"]["5"],None,"section")] + [(label,num,"body") for label,num in practice]
            rows += [(PROJECTS[str(i)],i,"section" if i in section_numbers else "body") for i in range(first,last+1)]
            top = 19
            # Reserve more room for headings while retaining the source's densest column.
            factor = min(1.32, 553 / sum(28 if kind=="title" else 20 if kind=="section" else 13.2 for _,_,kind in rows))
            for label, num, kind in rows:
                h = (28 if kind=="title" else 20 if kind=="section" else 13.2) * factor
                size = (19 if kind=="title" else 12.5 if kind=="section" else 8.5)*min(factor,1.22)
                if num is not None:
                    right = origin+HALF-29
                    lead_end = right-em_width(label,700 if kind!="body" else 400)*size-10
                    if lead_end > origin+56:
                        s.line(origin+51,top+h*.60,lead_end,top+h*.60,stroke="#8cbbce",stroke_dasharray="1.2 3.4",opacity=".55",stroke_width=".6")
                    s.text(number(num),origin+13,top,27,h,size,center=True,valign="middle",record=False)
                s.text(label,origin+58,top,HALF-87,h,size,weight=700 if kind!="body" else 400,
                       role="title" if kind!="body" else "text",verbatim=True,valign="middle",record=False)
                s.transcript.append(label if num is None else f"{label} — {number(num)}")
                top += h
        s.write()


def chapters():
    s = Spread(5)
    s.heading("١.",HALF-128,39,85,70,39)
    s.heading(s.title,76,228,HALF-152,120,43,center=True)
    s.write()
    s = Spread(12,source=5)
    s.heading("٢.",2*HALF-128,32,83,60,38)
    s.heading(s.title,HALF+65,234,HALF-130,124,43,center=True)
    for i, n in enumerate(COPY["sectorPages"]):
        category = PROJECTS[str(n)]
        top = 32 + i*48
        s.text(category,80,top,HALF-126,34,16,weight=600,valign="middle")
        s.text(number(n),25,top,35,34,12,center=True,valign="middle")
        start = HALF-46-em_width(category,600)*16-14
        s.line(72,top+18,start,top+18,stroke="#a2d7e4",stroke_width=".75",stroke_dasharray="1.5 4",opacity=".67")
    s.write()


def about():
    s = Spread(6,mode="swap")
    a = COPY["about"]
    s.heading(a["title"],HALF+440,43,369,60,38)
    s.text(a["intro"][0],HALF+439,113,371,90,12.8)
    s.text(a["intro"][1],HALF+439,207,371,124,12.6)
    s.text(a["board"],HALF+53,323,357,20,12,center=True,weight=600)
    top = 352
    for para, height in zip(a["body"],[61,89,60]):
        s.text(para,HALF+34,top,HALF-65,height,13)
        top += height+4
    s.heading(a["leaders"],35,54,HALF-70,67,37,center=True,fill=BLUE)
    for i,(name,bio) in enumerate(a["bios"]):
        x = 53+386*i
        s.heading(name,x,396,337,39,23,center=True)
        s.text(bio,x,439,337,139,13.5,step=2)
    s.write()


def principles():
    s = Spread(7,mode="swap")
    s.heading("مبادئنا",HALF+50,42,HALF-100,79,39,center=True,fill=BLUE)
    for i,statement in enumerate(COPY["principles"]):
        center = HALF+716-i*146
        s.text(statement,center-57,143,114,114,14.5,center=True,valign="middle",fill=BLUE)
    s.heading("أرقام رئيسية",HALF+65,326,HALF-130,78,39,center=True)
    for i,label in enumerate(COPY["figures"]):
        col,row = divmod(i,2)
        start = [76,341,620][col]
        s.text(label,HALF+start,453+row*51,[211,221,191][col],35,14,valign="middle")
    s.heading("محطات في مسيرتنا",38,39,HALF-76,84,37,center=True)
    # Read the first run from right to left, then follow the turn into the second run.
    track = group(s.root,"art")
    node("path",track,d="M842 316H91C14 316 14 424 91 424H842",fill="none",stroke=WHITE,stroke_width="1.3")
    for i,(date,story) in enumerate(COPY["milestones"]):
        index = i if i < 6 else 11-i
        cx = 765-133.5*index
        above = i<6
        y = 316 if above else 424
        node("circle",track,cx=cx,cy=y,r=4.4,fill=WHITE)
        node("line",track,x1=cx,y1=y+(-4 if above else 4),x2=cx,y2=y+(-19 if above else 19),stroke=WHITE,stroke_width=".8",stroke_dasharray="2 3")
        s.text(date,cx-62,195 if above else 443,124,33,19,weight=700,center=True)
        s.text(story,cx-61,230 if above else 476,122,60,11,center=True)
    s.write()


def expertise():
    s=Spread(8,mode="swap")
    s.heading("تخصصاتنا",HALF+28,36,489,65,36,center=True,fill=BLUE)
    for i,(title,summary) in enumerate(COPY["expertise"]):
        # Each discipline keeps its original pictogram and each photo keeps its orientation.
        if i==6:
            x,top,w,tx,tw,th = 155,455,263,280,150,31
        else:
            col,row=i%2,i//2
            x,top,w = [61,291][col],[122,239,361][row],216
            tx,tw,th = [129,363][col],139,36
        s.text(title,HALF+tx,top,tw,th,13,weight=650,fill=BLUE,valign="middle")
        s.text(summary,HALF+x,top+th+4,w,72 if i!=6 else 91,11.3,fill=INK)
    s.heading("شركاؤنا الدوليون",244,39,568,71,37,center=True,fill=BLUE)
    for i,body in enumerate(COPY["associates"]):
        s.text(body,248,[128,282,424][i],560,[142,134,145][i],14,step=i+1,fill=INK)
    s.write()


def organization():
    # The chart contains boxes, arrows and type only. Mirror the original grid and
    # connectors as a whole so every reporting relationship keeps its source position.
    s=Spread(9,mode="mirror")
    s.heading(s.title,2*HALF-508,37,447,62,36,fill=BLUE)
    s.text("قيادات الشركة",2*HALF-508,107,447,36,20,fill=INK,weight=650)
    for i,(name,role) in enumerate(COPY["members"]):
        if i < 2:
            x,top,w = 2*HALF-(263 if i==0 else 493),151,204
        else:
            x,top,w = 2*HALF-509,194+(i-2)*48,450
        s.text(name,x,top,w,23,14,weight=650,fill=INK)
        s.text(role,x,top+21,w,23,12.1,fill=INK)
    chart=COPY["chart"]
    def card(label,cx,cy,w,h,size,inverse=False):
        s.text(label,HALF-cx-w/2,cy-h/2,w,h,size,fill=WHITE if inverse else BLUE,
               center=True,valign="middle",weight=500,leading=1.28)
    for i,label in enumerate(chart["heads"]):
        card(label,420,[83,135][i],106,39,15)
    for label,cx in zip(chart["operations"],[261,420,579]):
        card(label,cx,201,104,39,13)
    for i,label in enumerate(chart["admin"]):
        card(label,163+i*65.5,259,59,18,8.2,True)
    for col,team in enumerate(chart["teams"]):
        cx=170+125*col
        card(team[0],cx,332,104,40,14)
        for j,branch in enumerate(team[1:]):
            card(branch,cx,393+41.5*j,85,29,10.5,True)
    s.write()


def locations():
    # Keep the map in its true geographic orientation, spanning the fold.
    s = Spread(10)
    a = COPY["contacts"]
    s.heading("مواقعنا",1272,34,377,66,36)
    s.text("مكاتبنا",1272,104,377,39,22,weight=650)
    for key, role, top in (("cairo","المقر الرئيسي",150),("riyadh","المكتب الدولي",247)):
        s.text(f"{a[key]} ({role})",1265,top,384,31,17,weight=600)
        s.text(a[key+"Address"],1257,top+30,392,41,11.7)
        s.text("هاتف "+ "\u2066" + a[key+"Phone"] + "\u2069",1265,top+70,384,23,12)
    s.text("مكاتبنا",1158,110,81,29,13)
    s.text("مشروعاتنا",1158,157,81,29,13)
    s.heading("حضورنا الدولي",1278,389,369,57,31,fill=BLUE)
    s.text(a["coverage"],1281,458,366,117,13.2,fill=INK)
    s.heading("دليل التواصل",25,315,366,57,32)
    s.text(a["business"],28,391,360,43,12.5,fill=INK)
    s.text(a["email"],28,434,360,24,14.5,weight=650,fill=BLUE)
    s.text(a["careers"],28,467,360,70,12.8,fill=INK)
    s.text(a["careerEmail"],28,544,360,28,14.5,weight=650,fill=BLUE)
    s.write()


def partners():
    s=Spread(11)
    s.heading(s.title,2*HALF-269,28,239,78,37,fill=BLUE)
    items=list(PARTNERS.values())
    # Preserve the six original client columns and the sequence within each one.
    starts=[0,15,37,59,81,103,len(items)]
    right_edges=[2*HALF-28,2*HALF-295,2*HALF-560,HALF-28,HALF-310,HALF-562]
    for i,right in enumerate(right_edges):
        entries=items[starts[i]:starts[i+1]]
        top=153 if i==0 else 30
        pitch=24.7
        for j,name in enumerate(entries):
            s.text(name,right-250,top+j*pitch,250,22,12.1,fill=INK,valign="middle",verbatim=True)
    s.write()


if __name__ == "__main__":
    OUT.mkdir(exist_ok=True,parents=True)
    covers()
    contents()
    chapters()
    about()
    principles()
    expertise()
    organization()
    locations()
    partners()
