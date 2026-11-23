const manifests = new Map();
const CACHE_SIZE = 3;
export const FIT_MEDIA = '(max-width: 900px), (max-height: 520px) and (pointer: coarse)';
const ready = new Map();
const pending = new Map();
const fonts = new Map();

async function getFile(url, signal) {
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(`Unable to load ${url} (${response.status})`);
  return response;
}

export function loadProfileManifest(language = 'en') {
  if (!manifests.has(language)) {
    const base = language === 'ar' ? '/company-profile/ar' : '/company-profile';
    manifests.set(language, getFile(`${base}/manifest.json`)
      .then((response) => response.json())
      .catch((error) => {
        manifests.delete(language);
        throw error;
      }));
  }
  return manifests.get(language);
}

function loadFont({ family, src, weight }) {
  if (!fonts.has(src)) {
    const font = new FontFace(family, `url("${src}")`, weight ? { weight } : {});
    fonts.set(src, font.load().then((loaded) => {
      document.fonts.add(loaded);
    }).catch((error) => {
      fonts.delete(src);
      throw error;
    }));
  }
  return fonts.get(src);
}

function decodeImage(url, signal) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const cleanup = () => {
      image.onload = null;
      image.onerror = null;
      signal.removeEventListener('abort', abort);
    };
    const abort = () => {
      cleanup();
      image.removeAttribute('src');
      reject(new DOMException('Slide request superseded', 'AbortError'));
    };
    if (signal.aborted) return abort();
    signal.addEventListener('abort', abort, { once: true });
    image.onload = async () => {
      try {
        if (image.decode) await image.decode();
        cleanup();
        resolve(image);
      } catch (error) {
        cleanup();
        reject(error);
      }
    };
    image.onerror = () => {
      cleanup();
      reject(new Error(`Unable to load profile image ${url}`));
    };
    image.decoding = 'async';
    image.src = url;
  });
}

async function decodeSources(urls, signal) {
  const sources = [...new Set(urls)];
  // Logo spreads can contain many separate marks. Bound concurrent decoding.
  const images = [];
  let index = 0;
  async function decodeNext() {
    while (index < sources.length) {
      const url = sources[index++];
      images.push(await decodeImage(url, signal));
    }
  }
  await Promise.all(Array.from({ length: Math.min(4, sources.length) }, decodeNext));
  return images;
}

async function readArtwork(slide, signal) {
  const response = await getFile(slide.src, signal);
  const document = new DOMParser().parseFromString(await response.text(), 'image/svg+xml');
  const template = document.documentElement;
  if (template.localName !== 'svg' || document.querySelector('parsererror')) {
    throw new Error(`Invalid profile artwork for page ${slide.number}`);
  }
  // Standalone Arabic SVGs declare their webfont. The inline reader registers
  // the same face once, before the first frame of the transition.
  template.querySelector('style[data-standalone-font]')?.remove();
  if (slide.language === 'ar' && (slide.type === 'project' || slide.type === 'sector')) {
    // Each positioned line needs its own bidi paragraph. Some mobile SVG
    // renderers reorder RTL runs across adjacent tspans despite their fixed x/y.
    for (const block of template.querySelectorAll('text[direction="rtl"]')) {
      const lines = Array.from(block.children);
      if (lines.length < 2 || !lines.every(line => line.matches('tspan[x][y]'))) continue;
      for (const line of lines) {
        const text = block.cloneNode(false);
        text.append(line);
        block.before(text);
      }
      block.remove();
    }
  }
  const fitted = window.matchMedia(FIT_MEDIA).matches;
  const sources = [];
  for (const image of template.querySelectorAll('image')) {
    const original = image.getAttribute('href');
    if (fitted && image.hasAttribute('data-screen-src')) {
      image.setAttribute('data-original-src', original);
      image.setAttribute('href', image.getAttribute('data-screen-src'));
    }
    sources.push(image.getAttribute('href'));
  }
  const [images] = await Promise.all([
    decodeSources(sources, signal),
    ...(slide.fontFaces || []).map(loadFont),
  ]);
  return { ...slide, artwork: { template, images } };
}

/** Swap only the image resources. Text, geometry and running transitions stay put. */
export async function upgradeProfileImages(frame, signal) {
  const nodes = Array.from(frame.querySelectorAll('image[data-original-src]'));
  if (!nodes.length) return;
  await decodeSources(nodes.map((node) => node.getAttribute('data-original-src')), signal);
  if (signal.aborted || !frame.isConnected) return;
  for (const node of nodes) {
    node.setAttribute('href', node.getAttribute('data-original-src'));
    node.removeAttribute('data-original-src');
  }
}

function requestSlide(slide, speculative) {
  const cached = ready.get(slide.src);
  if (cached) {
    ready.delete(slide.src);
    ready.set(slide.src, cached);
    return Promise.resolve(cached);
  }
  const active = pending.get(slide.src);
  if (active) {
    if (!speculative) active.speculative = false;
    return active.promise;
  }
  const controller = new AbortController();
  const request = { controller, speculative };
  request.promise = readArtwork(slide, controller.signal)
    .then((prepared) => {
      if (controller.signal.aborted) throw new DOMException('Slide request superseded', 'AbortError');
      ready.set(slide.src, prepared);
      while (ready.size > CACHE_SIZE) ready.delete(ready.keys().next().value);
      return prepared;
    })
    .catch((error) => {
      controller.abort();
      throw error;
    })
    .finally(() => {
      if (pending.get(slide.src) === request) pending.delete(slide.src);
    });
  pending.set(slide.src, request);
  return request.promise;
}

function cancelRequest(url, request) {
  pending.delete(url);
  request.controller.abort();
}

/** Foreground navigation always takes precedence over a superseded destination. */
export function prepareProfileSlide(slide) {
  for (const [url, request] of pending) {
    if (!request.speculative && url !== slide.src) cancelRequest(url, request);
  }
  return requestSlide(slide, false);
}

export function getPreparedProfileSlide(slide) {
  return slide.artwork ? slide : ready.get(slide.src);
}

/** Warm the nearest spread in the direction of travel first, then its opposite. */
export function preloadProfileNeighbors(slides, index, direction = 1) {
  if (navigator.connection?.saveData) return () => {};
  const step = direction < 0 ? -1 : 1;
  const neighbors = [slides[index + step], slides[index - step]].filter(Boolean);
  let cancelled = false;
  async function warm() {
    for (const slide of neighbors) {
      if (cancelled) break;
      try {
        await requestSlide(slide, true);
      } catch {
        // A foreground request retries any asset that failed during idle time.
      }
    }
  }
  const useIdle = typeof window.requestIdleCallback === 'function';
  const timer = useIdle ? window.requestIdleCallback(warm, { timeout: 500 }) : window.setTimeout(warm, 100);
  return () => {
    cancelled = true;
    if (useIdle) window.cancelIdleCallback(timer);
    else window.clearTimeout(timer);
    for (const slide of neighbors) {
      const request = pending.get(slide.src);
      if (request?.speculative) cancelRequest(slide.src, request);
    }
  };
}
