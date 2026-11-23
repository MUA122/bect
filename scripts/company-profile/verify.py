"""Verify the company profile using the real browser route and the original PDF.

Start Vite first. QA-only tools: pip install playwright Pillow numpy, install Poppler
(pdfinfo and pdftoppm on PATH), then run "playwright install chromium".
Example: python scripts/company-profile/verify.py --output /tmp/bect-profile-review
The output contains original renders, browser captures, differences and JSON metrics.
"""
import argparse
import hashlib
import json
import re
import subprocess
import tempfile
from io import BytesIO
from pathlib import Path
from urllib.parse import parse_qs, urlsplit

import numpy as np
from PIL import Image, ImageChops, ImageFilter
from playwright.sync_api import TimeoutError as BrowserTimeout
from playwright.sync_api import expect, sync_playwright


ROOT = Path(__file__).resolve().parents[2]
CURRENT = '.cp-slide-frame[data-current="true"]'
SETTLED = CURRENT + '[data-settled="true"]'
EXPLORE = "Explore company profile"
EXPLORE_AR = "استكشف ملف الشركة"


def slide(page, number):
    frame = page.locator(f'{SETTLED}[data-slide-number="{number}"]')
    expect(frame).to_be_visible(timeout=30000)
    return frame


def button(page, label):
    return page.get_by_role("button", name=label, exact=True)


def open_page(page, url, number=None):
    page.goto(url + (f"#page={number}" if number else ""), wait_until="domcontentloaded")
    if number is not None:
        return slide(page, number)


def check_landing(page, label):
    control = button(page, label)
    expect(control).to_be_visible()
    atlas = page.locator(".cp-regional-map")
    expect(atlas).to_be_visible()
    expect(atlas.locator(".cp-map-relief")).to_have_attribute("visibility", "visible")
    # BECT's homepage Cityscape banner uses --trial-orange (#d98a72).
    orange = "rgb(217, 138, 114)"
    for accent in ("#cp-cover-title em", ".cp-edition .cp-cover-accent"):
        expect(page.locator(accent)).to_have_css("color", orange)
    for selector, color in ((".cp-region-heading", "rgb(210, 226, 236)"),
                            (".cp-explore-label", "rgb(244, 248, 250)")):
        label_element = page.locator(selector)
        expect(label_element).to_have_css("color", color)
        expect(label_element.locator(".cp-cover-accent")).to_have_count(0)
    for country in ("EG", "SA"):
        expect(atlas.locator(f'.cp-map-country[data-country="{country}"]')).to_be_visible()
        expect(atlas.locator(f'.cp-map-country-label[data-country="{country}"]')).to_have_css("color", "rgb(244, 249, 250)")
        flag = atlas.locator(f'.cp-map-flag[data-country="{country}"]')
        expect(flag).to_be_visible()
        flag.evaluate("image => image.decode()")
    expect(atlas.locator(".cp-map-location")).to_have_count(2)
    for city in ("cairo", "riyadh"):
        marker = atlas.locator(f'.cp-map-location[data-city="{city}"]')
        city_label = marker.locator(".cp-map-city-label")
        expect(city_label).to_be_visible()
        expect(city_label).to_have_css("color", orange)
        assert marker.locator(".cp-map-pin").evaluate("pin => getComputedStyle(pin, '::after').backgroundColor") == orange
    expect(atlas.locator(".cp-map-connection")).to_have_attribute("d", "M180.62 83.78 Q333 68 492.37 208.64")
    viewport = page.viewport_size
    wordmark = control.locator("img")
    logo = "/company-profile/ar/wordmark-white.png" if label == EXPLORE_AR else "/company-profile/intro/wordmark.png"
    expect(wordmark).to_have_attribute("src", logo)
    wordmark.evaluate("image => image.decode()")
    bounds = control.bounding_box()
    assert abs(bounds["x"] + bounds["width"] / 2 - viewport["width"] / 2) <= 1, bounds
    assert bounds["width"] >= min(300, viewport["width"] * .8) and bounds["height"] >= 56, bounds
    assert bounds["y"] >= 0 and bounds["y"] + bounds["height"] <= viewport["height"] + 1, bounds
    assert control.evaluate("""button => ['::before','::after'].every(pseudo => {
        const rule = getComputedStyle(button.parentElement, pseudo);
        return rule.display !== 'none' && rule.content !== 'none' && parseFloat(rule.height) > 0;
    })"""), "A horizontal CTA rule is missing"
    assert wordmark.evaluate("""image => {
        const box = image.getBoundingClientRect();
        return Math.abs(box.width / box.height - image.naturalWidth / image.naturalHeight) < .04;
    }""")
    return control


def assert_no_overflow(page):
    assert page.evaluate("document.documentElement.scrollWidth <= innerWidth + 1"), page.viewport_size
    for label in ("Next", "Previous", "Contents"):
        box = button(page, label).bounding_box()
        assert box and box["x"] >= -1 and box["y"] >= -1, (label, box)
        assert box["x"] + box["width"] <= page.viewport_size["width"] + 1, (label, box)
        assert box["y"] + box["height"] <= page.viewport_size["height"] + 1, (label, box)


def touch_path(client, points):
    for i, touches in enumerate(points):
        client.send("Input.dispatchTouchEvent", {
            "type": "touchStart" if i == 0 else "touchMove",
            "touchPoints": [{"x": x, "y": y, "id": j} for j, (x, y) in enumerate(touches)],
        })
    client.send("Input.dispatchTouchEvent", {"type": "touchEnd", "touchPoints": []})


def check_office_interactions(page, *, touch=False):
    # Use the SVG projection to click physical screen coordinates. Calling click()
    # on a path can land on an unrelated label or outside a concave country.
    activate = page.touchscreen.tap if touch else page.mouse.click
    card = page.get_by_role("dialog")
    for country, city, points, street_number, phone in (
        # The second Egyptian coordinate is on the Nile drawing above the land.
        ("EG", "cairo", [(82, 215), (205.4, 230.5)], "17", "tel:+20224187866"),
        # Northwest Saudi Arabia lies close to the Cairo label on small screens.
        ("SA", "riyadh", [(329, 74), (665, 265)], "6071", "tel:+966014535135"),
    ):
        shape = page.locator(f'.cp-map-country[data-country="{country}"]')
        for point in points:
            sx, sy = shape.evaluate("""(shape, coords) => {
                const point = new DOMPoint(...coords);
                if (!shape.isPointInFill(point)) throw new Error("Outside country");
                const screen = point.matrixTransform(shape.getScreenCTM());
                return [screen.x, screen.y];
            }""", point)
            activate(sx, sy)
            expect(card).to_be_visible()
            expect(card.get_by_role("button")).to_be_focused()
            assert card.evaluate("dialog => dialog.matches(':modal')")
            expect(page.locator("html")).to_have_css("overflow-y", "hidden")
            expect(card.locator("address")).to_contain_text(street_number)
            expect(card.locator(f'a[href="{phone}"]')).to_be_visible()
            expect(card.locator('a[href="/#contact"]')).to_be_visible()
            flag = card.locator(f'img[src$="/flag-{country.lower()}.svg"]')
            expect(flag).to_be_visible()
            flag.evaluate("image => image.decode()")
            directions = card.locator('a[href*="google.com/maps/dir/"]')
            expect(directions).to_be_visible()
            destination = parse_qs(urlsplit(directions.get_attribute("href")).query)
            destination_label = "17 Menof" if country == "EG" else "QM3G+HQV Office No. 11"
            assert destination.get("api") == ["1"] and destination_label in destination["destination"][0]
            page.wait_for_function("""() => {
                const dialog = document.querySelector(".cp-office-popup");
                if (!dialog) return false;
                const rect = dialog.getBoundingClientRect();
                return Math.abs(rect.x + rect.width / 2 - innerWidth / 2) <= 2
                    && Math.abs(rect.y + rect.height / 2 - innerHeight / 2) <= 2
                    && rect.x >= 0 && rect.y >= 0;
            }""")
            activate(2, 2)
            expect(card).not_to_be_visible()

        country_label = page.locator(f'.cp-map-country-label[data-country="{country}"]')
        for target in (country_label.locator("img"), country_label.locator("span")):
            if touch:
                target.tap()
            else:
                target.click()
            expect(card.locator(f'a[href="{phone}"]')).to_be_visible()
            card.get_by_role("button").click()
            expect(country_label).to_be_focused()

        marker = page.locator(f'.cp-map-location[data-city="{city}"]')
        if touch:
            marker.tap()
        else:
            marker.focus()
            marker.press("Enter")
        expect(card.locator(f'a[href="{phone}"]')).to_be_visible()
        page.keyboard.press("Shift+Tab")
        expect(card.locator('a[href="/#contact"]')).to_be_focused()
        page.keyboard.press("Tab")
        expect(card.get_by_role("button")).to_be_focused()
        page.keyboard.press("Escape")
        expect(card).not_to_be_visible()
        if not touch:
            expect(marker).to_be_focused()
            shape.focus()
            shape.press("Space")
            expect(card.locator(f'a[href="{phone}"]')).to_be_visible()
            page.keyboard.press("Escape")
            expect(shape).to_be_focused()


def check_mobile_project_modes(page, url):
    editions = {
        "ar": {
            "title": "مدينة المكيمن", "direction": "rtl",
            "read": "عرض النص", "recommended": "موصى به", "spread": "عرض الصفحتين",
            "overview": "نبذة عن المشروع", "narrative": "تقدم بيكت خدمات الاستشارات",
            "facts": ["الموقع", "العميل", "تاريخ الإنجاز", "القيمة التقديرية", "التخصصات"],
            "location": "المدينة المنورة، المملكة العربية السعودية",
            "zoom": "تكبير", "next": "التالي", "next_title": "مقر رئاسة أمن الدولة",
        },
        "en": {
            "title": "Al Mukaymen City", "direction": "ltr",
            "read": "Read text", "recommended": "Recommended", "spread": "Show both pages",
            "overview": "Project Overview", "narrative": "This project provides consultancy and project management services",
            "facts": ["Location", "Client", "Completion", "Est. value", "Disciplines"],
            "location": "Al-Madinah Al-Munawwarah, Kingdom of Saudi Arabia",
            "zoom": "Zoom in", "next": "Next", "next_title": "State Security Headquarters",
        },
    }
    page.goto(f"{url}#page=14", wait_until="domcontentloaded")
    viewport = page.locator(".cp-viewport")

    for language, copy in editions.items():
        page.reload(wait_until="domcontentloaded")
        paper = slide(page, 14)
        expect(paper).to_have_attribute("lang", language)
        assert paper.evaluate("el => el.clientWidth / el.clientHeight > 2")
        half_width = paper.locator(":scope > svg").evaluate("svg => svg.viewBox.baseVal.width / 2")
        expect(viewport.get_by_role("article")).to_have_count(0)

        read = button(page, f'{copy["read"]} {copy["recommended"]}')
        expect(read.get_by_text(copy["recommended"], exact=True)).to_be_visible()
        show_spread = button(page, copy["spread"])
        article = viewport.get_by_role("article", name=copy["title"], exact=True)
        read.tap()
        expect(show_spread.locator(".cp-project-recommended")).to_have_count(0)
        expect(article).to_have_css("direction", copy["direction"])
        expect(article.get_by_role("heading", level=1)).to_have_text(copy["title"])
        expect(article.get_by_role("heading", level=2)).to_have_text(copy["overview"])
        expect(article.get_by_role("img", name=copy["title"])).to_be_visible()
        crop = article.locator(".cp-project-photo svg")
        expected_left = 0 if language == "ar" else half_width
        assert crop.evaluate("(svg, x) => Math.abs(svg.viewBox.baseVal.x - x) < 0.01", expected_left)
        narrative = article.locator("p").filter(has_text=copy["narrative"])
        expect(narrative).to_be_visible()
        assert narrative.evaluate("p => parseFloat(getComputedStyle(p).fontSize) >= 16")
        expect(article.locator("dt")).to_have_text(copy["facts"])
        expect(article.locator("dd").first).to_have_text(copy["location"])
        assert viewport.evaluate("el => el.scrollWidth <= el.clientWidth + 1")

        show_spread.tap()
        slide(page, 14)
        button(page, copy["zoom"]).tap()
        expect(viewport).to_have_attribute("data-zoom", "1.65")
        read.tap()
        expect(article).to_be_visible()
        expect(viewport).to_have_attribute("data-zoom", "1.00")
        article.locator("dd").last.scroll_into_view_if_needed()
        assert viewport.evaluate("el => el.scrollTop > 0")
        button(page, copy["next"]).tap()
        expect(viewport.get_by_role("heading", name=copy["next_title"], exact=True)).to_be_visible()
        assert viewport.evaluate("el => el.scrollTop === 0")

        # Non-project slides fall back to their artwork without clearing reading mode.
        page.keyboard.press("Home")
        slide(page, 1)
        expect(page.locator(".cp-project-mode")).to_have_count(0)
        page.goto(f"{url}#page=94", wait_until="domcontentloaded")
        legend = viewport.locator("figcaption")
        expect(legend).to_contain_text("Bzaza2")
        expect(legend.locator("li")).to_have_count(3)

        if language == "ar":
            page.goto(f"{url}#page=14", wait_until="domcontentloaded")
            expect(article).to_be_visible()
            button(page, "English").tap()
            english_article = viewport.get_by_role("article", name=editions["en"]["title"], exact=True)
            expect(english_article).to_have_css("direction", "ltr")
            expect(button(page, editions["en"]["spread"])).to_be_visible()
            assert page.url.endswith("#page=14")


def interaction_checks(browser, url, output, last_page, audit):
    context = browser.new_context(viewport={"width": 1440, "height": 900})
    page = context.new_page()
    audit(page)
    open_page(page, url)
    explore = check_landing(page, EXPLORE)
    page.screenshot(path=output / "desktop-intro.png", animations="disabled")
    check_office_interactions(page)
    explore.hover()
    page.wait_for_function("""performance.getEntriesByType('resource')
        .some(entry => new URL(entry.name).pathname.endsWith('/slides/001.svg'))""")
    explore.focus()
    page.keyboard.press("Enter")
    expect(page.locator(".cp-opening")).to_be_visible()
    first = slide(page, 1)
    expect(button(page, "Previous")).to_be_disabled()
    button(page, "Next").click()
    slide(page, 2)
    page.keyboard.press("ArrowRight")
    slide(page, 3)
    button(page, "Previous").click()
    slide(page, 2)
    page.keyboard.press("End")
    slide(page, last_page)
    expect(button(page, "Next")).to_be_disabled()
    page.keyboard.press("Home")
    first.wait_for()
    for _ in range(8):
        page.keyboard.press("ArrowRight")
    slide(page, 9)
    assert page.locator(".cp-slide-frame").count() == 1, "Outgoing frames retained"
    page.reload(wait_until="domcontentloaded")
    slide(page, 9)
    page.go_back(wait_until="domcontentloaded")
    expect(explore).to_be_visible()
    page.go_forward(wait_until="domcontentloaded")
    paper = slide(page, 9)
    width = paper.bounding_box()["width"]
    button(page, "Zoom in").click()
    page.wait_for_function("(w) => document.querySelector('.cp-slide-frame[data-current=true]')?.getBoundingClientRect().width > w * 1.1", arg=width)
    button(page, "Zoom out").click()
    button(page, "Contents").click()
    expect(page.get_by_role("dialog")).to_be_visible()
    page.keyboard.press("Escape")
    expect(page.get_by_role("dialog")).not_to_be_visible()
    button(page, "Contents").click()
    dialog = page.get_by_role("dialog")
    dialog.get_by_role("searchbox").fill("037")
    choices = dialog.locator(".cp-contents-grid button")
    expect(choices).to_have_count(1)
    choices.click()
    slide(page, 37)
    button(page, "Next").click()
    expect(page.locator(".cp-sector-curtain")).to_be_visible()
    slide(page, 38)
    expect(page.locator(".cp-sector-curtain")).to_have_count(0)
    button(page, "Fullscreen").click()
    expect(page.locator(".cp-reader")).to_have_class(re.compile(r"\bis-full\b"))
    if browser.browser_type.name == "chromium":
        page.wait_for_function("!!document.fullscreenElement")
    # The browser handles physical Escape independently of synthetic keyboard events.
    page.keyboard.press("Escape")
    try:
        page.wait_for_function("!document.querySelector('.cp-reader').classList.contains('is-full')", timeout=1500)
    except BrowserTimeout:
        button(page, "Exit fullscreen").click()
    page.wait_for_function("!document.fullscreenElement")
    for _ in range(2):
        button(page, "Close profile").click()
        expect(explore).to_be_focused()
        explore.click()
        slide(page, 1)
    context.close()

    # Exercise bounded deep links and the browser API rejection path.
    context = browser.new_context(reduced_motion="reduce")
    context.add_init_script("Element.prototype.requestFullscreen = () => Promise.reject(new Error('Unavailable'))")
    page = context.new_page()
    audit(page)
    open_page(page, url)
    page.goto(f"{url}#page={last_page + 5}", wait_until="domcontentloaded")
    slide(page, last_page)
    assert page.url.endswith(f"#page={last_page}")
    button(page, "Fullscreen").click()
    expect(button(page, "Exit fullscreen")).to_be_visible()
    page.keyboard.press("Escape")
    expect(button(page, "Fullscreen")).to_be_visible()
    button(page, "Close profile").click()
    expect(button(page, EXPLORE)).to_be_visible()
    context.close()

    # Abort the first request deliberately. Audit resumes after the expected
    # transport error so unexpected errors during recovery still fail the run.
    context = browser.new_context(reduced_motion="reduce")
    page = context.new_page()
    pattern = "**/slides/024.svg"
    page.route(pattern, lambda route: route.abort())
    page.goto(f"{url}#page=24", wait_until="domcontentloaded")
    expect(page.get_by_role("alert")).to_be_visible()
    page.unroute(pattern)
    audit(page)
    button(page, "Try again").click()
    slide(page, 24)
    context.close()

    # Guard against the compact-phone layout pushing the CTA below the fold.
    context = browser.new_context(viewport={"width": 320, "height": 568}, has_touch=True,
                                  is_mobile=True, reduced_motion="reduce")
    page = context.new_page()
    audit(page)
    open_page(page, url)
    check_landing(page, EXPLORE)
    button(page, "العربية").tap()
    check_landing(page, EXPLORE_AR)
    check_office_interactions(page, touch=True)
    page.set_viewport_size({"width": 568, "height": 320})
    page.wait_for_function("innerWidth === 568 && innerHeight === 320")
    page.evaluate("new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))")
    check_office_interactions(page, touch=True)
    context.close()

    for name, width, height in (("iphone", 390, 844), ("android", 360, 780),
                                ("tablet", 820, 1180), ("landscape", 844, 390),
                                ("laptop", 1280, 720)):
        context = browser.new_context(viewport={"width": width, "height": height},
                                      has_touch=True, is_mobile=name != "laptop",
                                      device_scale_factor=1 if name == "laptop" else 2,
                                      reduced_motion="reduce")
        page = context.new_page()
        audit(page)
        paper = open_page(page, url, 24)
        assert_no_overflow(page)
        page.screenshot(path=output / f"{name}-reader.png")
        viewport = page.locator(".cp-viewport")
        if name in ("iphone", "android"):
            expect(button(page, "Left page")).to_be_visible()
            positions = []
            for side in ("Left page", "Right page"):
                button(page, side).tap()
                expect(viewport).to_have_attribute("data-zoom", "2.00")
                expect(paper.locator("image[data-original-src]")).to_have_count(0, timeout=30000)
                # ResizeObserver and state updates can run after the click.
                page.evaluate("new Promise(r => requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(r))))")
                assert viewport.get_attribute("data-zoom") == "2.00"
                positions.append(paper.bounding_box()["x"])
                button(page, "Fit page").tap()
                expect(viewport).to_have_attribute("data-zoom", "1.00")
            assert positions[0] - positions[1] >= width * .8, positions
        box = viewport.bounding_box()
        x, y = box["x"] + box["width"] / 2, box["y"] + box["height"] / 2
        # Chromium exposes native multi-touch input to headless automation.
        # Other engines still exercise layout and real tap navigation.
        if browser.browser_type.name != "chromium":
            button(page, "Next").tap()
            slide(page, 25)
            context.close()
            continue
        client = context.new_cdp_session(page)
        touch_path(client, [[(x + 75, y)], [(x + 30, y + 2)], [(x - 75, y + 5)]])
        paper = slide(page, 25)
        old_width = paper.bounding_box()["width"]
        touch_path(client, [[(x - 25, y), (x + 25, y)],
                            [(x - 40, y), (x + 40, y)],
                            [(x - 65, y), (x + 65, y)]])
        page.wait_for_function("(w) => document.querySelector('.cp-slide-frame[data-current=true]')?.getBoundingClientRect().width > 1.2 * w", arg=old_width)
        # Zoom replaces any fitted photographs with the source-resolution files.
        expect(paper.locator("image[data-original-src]")).to_have_count(0, timeout=30000)
        page.evaluate("new Promise(r => requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(r))))")
        before = paper.bounding_box()["x"]
        touch_path(client, [[(x - 50, y)], [(x, y)], [(x + 80, y)]])
        page.wait_for_function("(x) => document.querySelector('.cp-slide-frame[data-current=true]')?.getBoundingClientRect().x > x + 25", arg=before)
        slide(page, 25)
        assert_no_overflow(page)
        context.close()

    context = browser.new_context(viewport={"width": 390, "height": 844}, has_touch=True,
                                  is_mobile=True, reduced_motion="reduce")
    page = context.new_page()
    audit(page)
    open_page(page, url)
    button(page, "العربية").click()
    check_landing(page, EXPLORE_AR)
    assert page.evaluate("localStorage.getItem('bect-language')") == "ar"
    page.reload(wait_until="domcontentloaded")
    check_landing(page, EXPLORE_AR).tap()
    slide(page, 1)
    button(page, "التالي").click()
    paper = slide(page, 2)
    expect(paper).to_have_attribute("lang", "ar")
    expect(paper).to_have_attribute("data-artwork-src", "/company-profile/ar/slides/002.svg")
    page.keyboard.press("ArrowLeft")
    slide(page, 3)
    page.screenshot(path=output / "arabic-mobile.png")
    check_mobile_project_modes(page, url)
    context.close()


def edition_checks(browser, url, output):
    context = browser.new_context(viewport={"width": 1440, "height": 900})
    page = context.new_page()
    manifests = {lang: context.request.get(url.rstrip("/") + suffix).json()["slides"]
                 for lang, suffix in (("en", "/manifest.json"), ("ar", "/ar/manifest.json"))}

    def check_edition(number, language):
        entry = manifests[language][number - 1]
        frame = page.locator(f'{SETTLED}[lang="{language}"][data-slide-number="{number}"]')
        expect(frame).to_be_visible(timeout=30000)
        expect(frame).to_have_attribute("data-artwork-src", entry["src"])
        expect(frame).to_have_attribute("aria-label", entry["title"])
        expect(page.locator(".cp-reader-caption > span:last-child")).to_have_text(entry["title"])
        expect(page.locator(".cp-edition-transition")).to_have_count(0)
        assert page.url.endswith(f"#page={number}")
        expect(page.locator(".cp-reader-brand img")).to_have_attribute("src",
            "/company-profile/ar/wordmark-white.png" if language == "ar" else "/company-profile/intro/wordmark.png")

    for number in (1, 42, 120):
        open_page(page, url, number)
        if number == 42:
            button(page, "Fullscreen").click()
            expect(page.locator(".cp-reader")).to_have_class(re.compile(r"\bis-full\b"))
            button(page, "Zoom in").click()
            expect(page.locator(".cp-viewport")).to_have_attribute("data-zoom", "1.65")
        button(page, "العربية").click()
        expect(page.get_by_text("جارٍ تجهيز النسخة العربية…")).to_be_visible()
        check_edition(number, "ar")
        if number == 42:
            expect(page.locator(".cp-viewport")).to_have_attribute("data-zoom", "1.65")
            expect(page.locator(".cp-reader")).to_have_class(re.compile(r"\bis-full\b"))
        button(page, "English").click()
        expect(page.get_by_text("Preparing the English edition…")).to_be_visible()
        check_edition(number, "en")
        if number == 42:
            expect(page.locator(".cp-viewport")).to_have_attribute("data-zoom", "1.65")
            button(page, "Exit fullscreen").click()

    # Reverse the destination before a fetch or entry animation has completed.
    open_page(page, url, 37)
    button(page, "Next").click()
    button(page, "العربية").click()
    button(page, "English").click()
    check_edition(38, "en")
    button(page, "العربية").click()
    check_edition(38, "ar")
    button(page, "المحتويات").click()
    dialog = page.get_by_role("dialog")
    dialog.get_by_role("searchbox").fill("٠٤٢")
    item = dialog.locator(".cp-contents-grid button")
    expect(item).to_have_count(1)
    expect(item).to_contain_text(manifests["ar"][41]["title"])
    expect(item.locator("img")).to_have_attribute("src", manifests["ar"][41]["thumbnail"])
    item.click()
    check_edition(42, "ar")
    page.keyboard.press("ArrowLeft")
    check_edition(43, "ar")
    page.keyboard.press("ArrowRight")
    check_edition(42, "ar")
    page.reload(wait_until="domcontentloaded")
    check_edition(42, "ar")
    page.screenshot(path=output / "arabic-desktop.png")

    # A slow or failed edition fetch keeps the previous page available for retry.
    context.close()
    context = browser.new_context(reduced_motion="reduce")
    page = context.new_page()
    try:
        open_page(page, url, 42)
        held = []
        pattern = "**/ar/slides/042.svg"
        page.route(pattern, lambda route: held.append(route))
        with page.expect_request(pattern):
            button(page, "العربية").click()
        expect(page.locator(".cp-edition-transition")).to_be_visible()
        expect(page.locator(f'{CURRENT}[lang="en"]')).to_have_attribute("data-slide-number", "42")
        expect(page.get_by_text("جارٍ تجهيز النسخة العربية…")).to_be_visible()
        held[0].fulfill(status=503, body="temporarily unavailable")
        expect(page.get_by_role("alert")).to_be_visible()
        assert page.evaluate("localStorage.getItem('bect-language')") == "en"
        page.unroute(pattern)
        button(page, "Try again").click()
        check_edition(42, "ar")
    finally:
        context.close()


def reference_pages(pdf, output):
    folder = output / "reference"
    folder.mkdir(exist_ok=True)
    source_hash = hashlib.sha256()
    with pdf.open("rb") as source:
        for block in iter(lambda: source.read(2**20), b""):
            source_hash.update(block)
    signature = source_hash.hexdigest() + " Poppler 96dpi CropBox v1"
    signature_file = folder / "source.txt"
    info = subprocess.check_output(["pdfinfo", str(pdf)], text=True)
    count = int(re.search(r"^Pages:\s+(\d+)", info, re.MULTILINE).group(1))
    expected = [folder / f"page-{n:0{len(str(count))}d}.png" for n in range(1, count + 1)]
    if (not signature_file.exists() or signature_file.read_text() != signature
            or not all(path.exists() for path in expected)):
        subprocess.run(["pdftoppm", "-r", "96", "-cropbox", "-png", str(pdf), str(folder / "page")],
                       check=True)
        signature_file.write_text(signature)
    return expected


def compare(actual, ref_file):
    with Image.open(ref_file) as original:
        ow, oh = original.size
        w, h = actual.size
        assert abs(w - h * ow / oh) <= 4, f"Aspect ratio differs: {ref_file.name} {(w, h)} vs {(ow, oh)}"
        ref = original.convert("RGB").resize(actual.size, Image.Resampling.LANCZOS)
    difference = ImageChops.difference(actual, ref)
    # A one-pixel blur discounts renderer-specific edge antialiasing. Per-tile
    # means additionally flag a missing photo, text block or misplaced logo.
    filtered = ImageChops.difference(actual.filter(ImageFilter.GaussianBlur(1)),
                                     ref.filter(ImageFilter.GaussianBlur(1)))
    pixels = np.asarray(filtered, dtype=np.float32)[2:-2, 2:-2]
    bins = [tile.mean() for row in np.array_split(pixels, 6, axis=0)
            for tile in np.array_split(row, 12, axis=1)]
    return {
        "size": actual.size,
        "mean_rgb_error": round(float(np.asarray(difference).mean()), 3),
        "blurred_mean_rgb_error": round(float(pixels.mean()), 3),
        "worst_tile_blurred_error": round(float(max(bins)), 3),
    }, difference


def visual_checks(browser, url, refs, pages, output, audit, dpr=1):
    context = browser.new_context(viewport={"width": 1600, "height": 1000},
                                  device_scale_factor=dpr, reduced_motion="reduce")
    page = context.new_page()
    audit(page)
    captures = output / "browser"
    differences = output / "differences"
    captures.mkdir(exist_ok=True)
    differences.mkdir(exist_ok=True)
    items = []
    for index, number in enumerate(pages):
        if index and number == pages[index-1] + 1:
            button(page, "Next").click()
            paper = slide(page, number)
        else:
            paper = open_page(page, url, number)
        expect(page.get_by_role("progressbar")).to_have_attribute("aria-valuenow", str(number))
        expect(page.locator(".cp-counter")).to_have_text(f"{number:03} / {len(refs):03}")
        png = paper.screenshot()
        filename = f"page-{number:03}.png"
        (captures / filename).write_bytes(png)
        actual = Image.open(BytesIO(png)).convert("RGB")
        if dpr != 1:
            css_size = (round(actual.width / dpr), round(actual.height / dpr))
            actual = actual.resize(css_size, Image.Resampling.LANCZOS)
        metrics, difference = compare(actual, refs[number - 1])
        difference.point(lambda value: min(255, value * 4)).save(differences / filename)
        passed = metrics["blurred_mean_rgb_error"] < 4 and metrics["worst_tile_blurred_error"] < 18
        items.append({"page": number, **metrics, "passed": passed})
        if not passed or number % 10 == 0:
            print(f"Page {number:03} {metrics}", flush=True)
    context.close()
    return items


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--url", default="http://127.0.0.1:5173/company-profile")
    parser.add_argument("--output", type=Path, help="Directory for captures and metrics (default: a fresh temporary directory)")
    parser.add_argument("--pdf", type=Path)
    parser.add_argument("--only", choices=("visual", "interaction"))
    parser.add_argument("--pages", help="Optional comma-separated page numbers for a focused visual rerun")
    parser.add_argument("--engine", choices=("chromium", "webkit"), default="chromium")
    parser.add_argument("--dpr", type=int, choices=(1, 2), default=1,
                        help="Capture at this device pixel ratio, compare in CSS pixels")
    parser.add_argument("--browser-executable", help="Optional browser binary")
    args = parser.parse_args()
    args.output = args.output or Path(tempfile.mkdtemp(prefix="bect-profile-"))
    args.output.mkdir(parents=True, exist_ok=True)
    print(f"Review files in {args.output.resolve()}", flush=True)
    pdf = args.pdf or next((ROOT / "public/company-profile").glob("*.pdf"))
    refs = reference_pages(pdf, args.output) if args.only != "interaction" else []
    errors = []
    def audit(page):
        page.on("pageerror", lambda error: errors.append(str(error)))
        def console_message(message):
            source = urlsplit(message.location.get("url", "")).netloc
            if message.type == "error" and (not source or source == urlsplit(args.url).netloc):
                errors.append(message.text)
        page.on("console", console_message)
        def response_received(response):
            if response.status >= 400 and urlsplit(response.url).netloc == urlsplit(args.url).netloc:
                errors.append(f"{response.status} {response.url}")
        page.on("response", response_received)
    items = []
    with sync_playwright() as playwright:
        browser = getattr(playwright, args.engine).launch(executable_path=args.browser_executable)
        browser_version = browser.version
        if args.only != "interaction":
            pages = [int(n) for n in args.pages.split(",")] if args.pages else list(range(1, len(refs)+1))
            items = visual_checks(browser, args.url, refs, pages, args.output, audit, args.dpr)
        if args.only != "visual":
            count = int(re.search(r"^Pages:\s+(\d+)", subprocess.check_output(
                ["pdfinfo", str(pdf)], text=True), re.MULTILINE).group(1))
            interaction_checks(browser, args.url, args.output, count, audit)
            edition_checks(browser, args.url, args.output)
        browser.close()
    report = {"engine": args.engine, "version": browser_version,
              "interaction_checks_run": args.only != "visual",
              "visual_dpr": args.dpr, "pages": items, "errors": errors}
    (args.output / "results.json").write_text(json.dumps(report, indent=2))
    failures = [item["page"] for item in items if not item["passed"]]
    if failures or errors:
        raise SystemExit(f"Visual flags {failures}; browser errors {errors}")
    if items:
        print(f"Passed {len(items)} visual comparisons.", flush=True)
    if args.only != "visual":
        print("Interaction and responsive checks passed.", flush=True)
    print(f"Browser errors: {len(errors)}", flush=True)


if __name__ == "__main__":
    main()
