import { sectionLabel } from './profileCopy';

const REVEAL = 'cubic-bezier(.2,.75,.2,1)';
const LIFT = 'cubic-bezier(.22,.7,.16,1)';
const DEPART = 'cubic-bezier(.4,0,.55,1)';
const EDITORIAL = new Set(['practice', 'contents', 'list']);
const OPENERS = new Set(['cover', 'identity', 'chapter', 'sector', 'closing']);

function animate(element, frames, timing) {
  return element.animate(frames, { easing: REVEAL, fill: 'backwards', ...timing });
}

function removeFrame(frame) {
  frame.getAnimations?.({ subtree: true }).forEach((animation) => animation.cancel());
  frame.remove();
}

function retireFrame(frame, direction, duration) {
  const wasSettled = frame.dataset.settled === 'true';
  frame.dataset.current = 'false';
  frame.dataset.settled = 'false';
  frame.setAttribute('aria-hidden', 'true');
  const current = getComputedStyle(frame);
  const start = { opacity: current.opacity, transform: current.transform };
  frame.getAnimations().forEach((animation) => animation.cancel());
  // The type leads the departure, with the photography drifting in counterpoint.
  // On interrupted entrances keep their existing trajectories until the frame fades.
  if (wasSettled && duration > 200) {
    for (const group of frame.querySelectorAll('g[data-role="title"],g[data-role="text"],g[data-role="image"]')) {
      const image = group.dataset.role === 'image';
      const distance = image ? 6 : group.dataset.role === 'title' ? -11 : -5;
      animate(group, [
        { opacity: 1, transform: 'translateX(0)' },
        { opacity: image ? .85 : .25, transform: `translateX(${distance * direction}px)` },
      ], { duration, easing: DEPART, fill: 'forwards' });
    }
  }
  const departure = animate(frame, [start, { opacity: 0, transform: `translateX(${-1.3 * direction}%)` }], {
    duration, easing: DEPART, fill: 'forwards',
  });
  departure.finished.then(() => {
    if (frame.dataset.current === 'false') removeFrame(frame);
  }, () => {});
}

function revealLayers(frame, slide, direction, delay, fast) {
  const editorial = EDITORIAL.has(slide.type);
  const opener = OPENERS.has(slide.type);
  const layers = frame.querySelectorAll('g[data-role]');
  const timings = [];
  for (const layer of layers) {
    const { role, step } = layer.dataset;
    if (role === 'background') continue;
    const stagger = Math.min(8, Math.max(0, Number(step) || 0)) * (fast ? 5 : 16);
    const timing = { duration: fast ? 230 : 390, delay: delay + stagger };
    let start;
    if (role === 'image') {
      start = { opacity: opener ? .68 : .45 };
      if (!fast && !editorial) {
        start.transform = `translateX(${(opener ? 9 : 17) * direction}px)`;
        start.clipPath = direction > 0 ? 'inset(0 9% 0 0)' : 'inset(0 0 0 9%)';
      }
      timing.duration = fast ? 260 : opener ? 650 : 490;
      timing.delay += opener ? 0 : 35;
    } else if (role === 'title') {
      start = { opacity: 0, transform: opener || editorial ? 'translateY(9px)' : `translateX(${-13 * direction}px)` };
      timing.easing = LIFT;
    } else if (role === 'text') {
      start = { opacity: 0, transform: editorial || opener ? 'translateY(5px)' : `translateX(${-6 * direction}px)` };
      timing.delay += fast ? 12 : 60;
    } else {
      start = { opacity: .42 };
    }
    const finish = { opacity: 1 };
    if (start.transform) finish.transform = 'translate(0, 0)';
    if (start.clipPath) finish.clipPath = 'inset(0 0 0 0)';
    timings.push(animate(layer, [start, finish], timing));
  }
  return timings;
}

function sectorCurtain(stage, slide, direction) {
  const curtain = document.createElement('div');
  curtain.className = 'cp-sector-curtain';
  curtain.setAttribute('aria-hidden', 'true');
  // Borrow an already-decoded photograph from the incoming architecture spread.
  // The source page underneath keeps its original crop and paint order.
  const motions = [];
  if (slide.type === 'sector' || slide.type === 'project') {
    const source = slide.artwork.template;
    const reference = source.querySelector('g[data-role="image"] use')?.getAttribute('href');
    const image = reference && source.ownerDocument.getElementById(reference.slice(1));
    if (image?.localName === 'image') {
      const detail = document.createElement('div');
      detail.className = 'cp-sector-detail';
      detail.style.backgroundImage = `url("${image.getAttribute('href')}")`;
      curtain.append(detail);
      motions.push(animate(detail, [
        { transform: `translateX(${direction * 1.8}%) scale(1.045)`, opacity: .12 },
        { transform: 'translateX(0) scale(1)', opacity: .35 },
      ], { duration: 1040 }));
    }
  }
  const label = document.createElement('span');
  label.lang = stage.ownerDocument.documentElement.lang;
  label.dir = label.lang === 'ar' ? 'rtl' : 'ltr';
  label.textContent = sectionLabel(slide.sector, label.lang);
  curtain.append(label);
  stage.append(curtain);
  const left = 'inset(0 100% 0 0)';
  const right = 'inset(0 0 0 100%)';
  const curtainMotion = animate(curtain, [
    { clipPath: direction > 0 ? left : right, offset: 0, easing: REVEAL },
    { clipPath: 'inset(0)', offset: .25 },
    { clipPath: 'inset(0)', offset: .55, easing: LIFT },
    { clipPath: direction > 0 ? right : left, offset: 1 },
  ], { duration: 1040, easing: 'linear' });
  const labelMotion = animate(label, [
    { opacity: 0, transform: 'translateY(12%)', offset: 0 },
    { opacity: 1, transform: 'translateY(0)', offset: .4 },
    { opacity: 1, transform: 'translateY(0)', offset: .7 },
    { opacity: 0, transform: 'translateY(-7%)', offset: 1 },
  ], { duration: 740, delay: 100 });
  curtainMotion.finished.then(() => curtain.remove(), () => {});
  return [...motions, curtainMotion, labelMotion];
}

function createFrame(slide) {
  const frame = document.createElement('div');
  frame.className = 'cp-slide-frame';
  frame.dataset.slideNumber = slide.number;
  frame.dataset.sector = slide.sector;
  frame.dataset.ratio = slide.width / slide.height;
  frame.setAttribute('role', 'group');
  frame.setAttribute('aria-label', slide.title);
  const svg = document.importNode(slide.artwork.template, true);
  svg.setAttribute('aria-hidden', 'true');
  const transcript = document.createElement('div');
  transcript.className = 'cp-slide-transcript';
  transcript.textContent = svg.querySelector('desc')?.textContent;
  frame.append(svg, transcript);
  return frame;
}

/** The current composition stays mounted until its ready successor can paint. */
export function presentSlide(stage, slide, direction, rapid, reducedMotion, lastSize) {
  const previous = stage.querySelector('.cp-slide-frame[data-current="true"]');
  if (previous?.dataset.slideNumber === String(slide.number)) return;
  const frames = Array.from(stage.querySelectorAll('.cp-slide-frame'));
  const returning = frames.find((frame) => frame.dataset.slideNumber === String(slide.number));
  // An early reversal can reuse the still-visible departing spread, including its
  // SVG definitions. Keep only the most visible other spread as the outgoing frame.
  const others = frames.filter((frame) => frame !== returning);
  const outgoing = others.sort((a, b) => Number(getComputedStyle(b).opacity) - Number(getComputedStyle(a).opacity))[0];
  for (const frame of others) if (frame !== outgoing) removeFrame(frame);
  stage.querySelectorAll('.cp-sector-curtain').forEach(removeFrame);
  const frame = returning || createFrame(slide);
  const generation = String(Number(frame.dataset.generation || 0) + 1);
  frame.dataset.generation = generation;
  const startOpacity = returning ? getComputedStyle(returning).opacity : '0';
  const startTransform = returning ? getComputedStyle(returning).transform : `translateX(${direction * .7}%)`;
  if (returning) {
    frame.getAnimations({ subtree: true }).forEach((animation) => animation.cancel());
    frame.removeAttribute('style');
  }
  frame.dataset.current = 'true';
  frame.dataset.settled = 'false';
  frame.removeAttribute('aria-hidden');
  stage.append(frame);

  if (reducedMotion || typeof frame.animate !== 'function') {
    if (outgoing) removeFrame(outgoing);
    frame.dataset.settled = 'true';
    return;
  }
  const sectionChange = outgoing && slide.sector && outgoing.dataset.sector !== slide.sector && !rapid;
  if (outgoing && lastSize?.width && outgoing.dataset.ratio !== frame.dataset.ratio && !outgoing.style.width) {
    // The covers are single pages. Preserve the departing paper's actual extent
    // while the new spread acquires its wider (or narrower) fitted rectangle.
    Object.assign(outgoing.style, {
      width: `${lastSize.width}px`, height: `${lastSize.height}px`,
      inset: '50% auto auto 50%', translate: '-50% -50%',
    });
  }
  if (outgoing) retireFrame(outgoing, direction, rapid ? 160 : sectionChange ? 320 : 335);
  const delay = sectionChange ? 300 : 0;
  const animations = [
    animate(frame, [
      { opacity: startOpacity, transform: startTransform },
      { opacity: 1, transform: 'translateX(0)' },
    ], { duration: rapid ? 210 : 380, delay }),
  ];
  if (!returning) animations.push(...revealLayers(frame, slide, direction, delay, rapid));
  if (sectionChange) animations.push(...sectorCurtain(stage, slide, direction));
  Promise.allSettled(animations.map((animation) => animation.finished)).then(() => {
    if (frame.dataset.current === 'true' && frame.dataset.generation === generation) {
      frame.dataset.settled = 'true';
    }
  });
}

export function clearSlideStage(stage) {
  Array.from(stage.children).forEach(removeFrame);
}
