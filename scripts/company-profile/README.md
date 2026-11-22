# BECT interactive company profile

## Local preview

From the repository root, run `npm run dev` and open `/company-profile` on the printed local URL. The main navigation and footer link to the same page. A URL ending in `#page=42` opens that page directly. Closing the reader or going back after Explore returns to the introduction.

The generated assets are ready to use. A normal Vite build includes the interactive edition and excludes the 293 MiB source PDF. To review a production build without overwriting the repository's tracked `dist` folder, use a separate output directory.

```sh
npm run build -- --outDir /tmp/bect-profile-preview
npm run preview -- --outDir /tmp/bect-profile-preview
```

## Implementation

| Location | Responsibility |
| --- | --- |
| `src/main.jsx`, `src/App.jsx`, `src/components/SiteFooter.jsx` | Profile route and website entry points |
| `src/hooks/useSiteLanguage.js` | Shared English/Arabic preference |
| `index.html`, `src/styles.css` | Route-specific first paint and resource preloading |
| `src/components/company-profile/` | Introduction, page history, bilingual controls, browser fullscreen, gestures, zoom, contents and layered animation |
| `public/company-profile/` | Original PDF, slide catalog, 120 structured SVG pages, licensed font subsets, images, previews and thumbnails |
| `vite.config.js` | Excludes the authoring PDF from the build output |
| `scripts/company-profile/` | Source extraction, image preparation and browser verification |

The 120 pages comprise two 841.89 × 595.28 pt covers and 118 double-width spreads. The source's project index identifies ten sectors. Each generated SVG retains the page's paint order, clipping and proportions. Its groups distinguish titles, text, imagery, backgrounds and other artwork. There are 3,640 native text runs across 119 pages. Original vector lettering and image-based text retain their appearance where native text reconstruction would lose fidelity. Every page has an English transcript.

Web Animations API timelines coordinate entrances, exits and section changes. Rapid navigation shortens the transition and cancels superseded requests. The reader decodes the destination assets before swapping pages, warms adjacent pages during idle time and caches up to three prepared pages. Fitted mobile images upgrade to their full-resolution source on zoom or fullscreen. The original page stays available while an upgrade loads.

The introduction uses the main website’s typography and a bilingual map of BECT’s offices in Cairo and Riyadh. The country boundaries and city markers use the same Lambert conformal conic projection of Natural Earth’s 1:50m data. Selecting a country, flag or city marker opens a centered office dialog with the corresponding flag, address, telephone link, Google Maps directions and a link to BECT’s Contact page. The close control, backdrop and Escape return to the map.

The centered Explore company profile button uses the official BECT wordmark from the publication cover. Hovering or focusing the button prepares the first page. When that page is ready, the normal opening sequence takes about two seconds including its reveal. Reduced motion bypasses the opening hold. Source page titles and artwork stay in English when the navigation switches to Arabic.

## Regeneration

To rebuild this edition from its original PDF, use Python with PyMuPDF 1.26.5, Pillow 11.3.0, fonttools 4.60.2 and lxml 6.1.3.

```sh
python scripts/company-profile/extract.py
```

The script reads the single PDF in `public/company-profile`. The cover wordmark crop, corporate page titles and transcription of the flattened milestones graphic are specific to this edition. Review those items when replacing the PDF with another edition. The landing map lives in `src/components/company-profile/RegionalMap.jsx`.

## Quality review

Start the site first. The verification script requires Python with Playwright, Pillow and NumPy, installed Playwright browser binaries, and Poppler's `pdfinfo` and `pdftoppm` on PATH. Set `--url` when using a different server or port.

```sh
python scripts/company-profile/verify.py --output /tmp/bect-profile-qa
python scripts/company-profile/verify.py --engine webkit --only interaction
```

The visual test renders the original CropBoxes independently with Poppler and captures the settled slides from the real reader. It checks aspect ratio, page order, counter and progress. It also measures the RGB difference over the whole page and within 72 regions. The output directory contains the reference images, browser screenshots, amplified differences and numerical results.

The November 22, 2026 review covered all 120 pages. All passed the Chromium comparison. Average channel error was 4.16 on a 0–255 scale, or 1.87 after a one-pixel blur to reduce antialiasing differences. In WebKit at standard density, 117 pages met the same tolerance. Pages 2, 36 and 92 passed on repeat at 2× density. Fine dotted contents leaders and detailed photographs show some engine-dependent rasterization at fit-to-screen sizes. The review includes [four side-by-side comparisons](review/comparison.webp) and [per-page measurements](review/visual-comparison.json).

Chromium and WebKit exercised direct links, reload, Back/Forward, repeated close and focus restoration, section transitions, Arabic navigation with English pages, searchable contents, zoom, fullscreen and its fallback, failed asset requests and retry. Chromium also exercised multi-touch pinch, pan and swipe. The responsive review used desktop, laptop, tablet, iPhone-sized and Android-sized viewports in portrait and landscape. Physical handset performance remains unmeasured.

A 1440 × 900 Chromium sample across eight warmed transitions recorded a median frame interval of 16.7 ms and a 95th percentile of 33.3 ms. The Vite production build passed. Vite reports a size warning for the main website bundle. The profile has its own lazy-loaded JavaScript chunk of approximately 12 KiB gzipped. The existing package defines build, development and preview commands and has no separate lint or type-check script.
