import React, { useEffect, useLayoutEffect, useRef } from 'react';
import { FIT_MEDIA, getPreparedProfileSlide, upgradeProfileImages } from './profileAssets';
import { clearSlideStage, presentSlide } from './slideMotion';
import './slide-stage.css';

/** The parent supplies a fitted viewport and changes slides only after preparation. */
export default function ProfileSlideStage({ slide, direction = 1, fullResolution = false }) {
  const host = useRef(null);
  const lastNavigation = useRef(0);
  const lastSize = useRef(null);

  useLayoutEffect(() => {
    const stage = host.current;
    const observer = new ResizeObserver(([entry]) => {
      lastSize.current = entry.contentRect;
    });
    observer.observe(stage);
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const finishMotion = () => {
      if (preference.matches) {
        stage.getAnimations?.({ subtree: true }).forEach((animation) => animation.finish());
      }
    };
    preference.addEventListener('change', finishMotion);
    return () => {
      observer.disconnect();
      preference.removeEventListener('change', finishMotion);
      clearSlideStage(stage);
      lastNavigation.current = 0;
    };
  }, []);

  useLayoutEffect(() => {
    const prepared = slide && getPreparedProfileSlide(slide);
    if (!prepared) return;
    if (host.current.querySelector('.cp-slide-frame[data-current="true"]')?.dataset.artworkSrc === slide.src) return;
    const now = performance.now();
    const rapid = lastNavigation.current > 0 && now - lastNavigation.current < 420;
    lastNavigation.current = now;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    presentSlide(host.current, prepared, direction < 0 ? -1 : 1, rapid, reduced, lastSize.current);
  }, [slide, direction]);

  useEffect(() => {
    const screen = window.matchMedia(FIT_MEDIA);
    const controller = new AbortController();
    const upgrade = () => {
      if (!fullResolution && screen.matches) return;
      const frame = host.current?.querySelector('.cp-slide-frame[data-current="true"]');
      if (frame) {
        upgradeProfileImages(frame, controller.signal).catch(() => {
          // Keep the readable fitted artwork if the higher resolution is unavailable.
        });
      }
    };
    upgrade();
    screen.addEventListener('change', upgrade);
    return () => {
      screen.removeEventListener('change', upgrade);
      controller.abort();
    };
  }, [slide, fullResolution]);

  return <div ref={host} className="cp-slide-stage" dir="ltr" lang={slide.language || "en"} />;
}
