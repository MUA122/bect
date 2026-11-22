import React, { useEffect, useRef, useState } from "react";
import CloseOutlined from "@mui/icons-material/CloseOutlined";
import FullscreenOutlined from "@mui/icons-material/FullscreenOutlined";
import FullscreenExitOutlined from "@mui/icons-material/FullscreenExitOutlined";
import AddOutlined from "@mui/icons-material/AddOutlined";
import RemoveOutlined from "@mui/icons-material/RemoveOutlined";
import ChevronLeftOutlined from "@mui/icons-material/ChevronLeftOutlined";
import ChevronRightOutlined from "@mui/icons-material/ChevronRightOutlined";
import GridViewOutlined from "@mui/icons-material/GridViewOutlined";
import { LanguageSwitch, Wordmark } from "./ProfileIntro";
import ProfileContents from "./ProfileContents";
import ProfileSlideStage from "./ProfileSlideStage";
import usePageViewport from "./usePageViewport";
import { formatPage } from "./profileCopy";

function Tool({ label, children, ...props }) {
  return <button type="button" className="cp-icon" title={label} aria-label={label} {...props}>{children}</button>;
}

export default function ProfileReader({ manifest, slide, direction, target, text, language, toggleLanguage, onClose, turn, goTo, error, onRetry }) {
  const root = useRef(null);
  const [contents, setContents] = useState(false);
  const [nativeFull, setNativeFull] = useState(false);
  const [immersive, setImmersive] = useState(false);
  const full = immersive || nativeFull;
  const rtl = language === "ar";
  const { viewport, view, zoom, pan, enlargeHalf, width, height, events } = usePageViewport(slide, turn, rtl);
  const pending = slide.number !== target && !error;
  const total = manifest.slides.length;

  useEffect(() => {
    root.current.focus({ preventScroll: true });
    const change = () => setNativeFull(Boolean(document.fullscreenElement || document.webkitFullscreenElement));
    document.addEventListener("fullscreenchange", change);
    document.addEventListener("webkitfullscreenchange", change);
    return () => {
      document.removeEventListener("fullscreenchange", change);
      document.removeEventListener("webkitfullscreenchange", change);
    };
  }, []);

  async function toggleFullscreen() {
    if (immersive) { setImmersive(false); return; }
    if (nativeFull) {
      const exit = document.exitFullscreen ?? document.webkitExitFullscreen;
      try { await exit?.call(document); } catch { /* Native UI can exit independently. */ }
      return;
    }
    const enter = root.current.requestFullscreen ?? root.current.webkitRequestFullscreen;
    if (!enter) { setImmersive(true); return; }
    try { await enter.call(root.current); } catch { setImmersive(true); }
  }

  useEffect(() => {
    const keydown = (e) => {
      if (contents || e.defaultPrevented || e.altKey || e.metaKey || e.ctrlKey ||
          e.target.closest?.("input, select, textarea, [contenteditable=true]")) return;
      if (e.key === "Escape") {
        if (immersive) { e.preventDefault(); setImmersive(false); }
        return;
      }
      if (view.scale > 1 && e.key.startsWith("Arrow")) {
        const delta = { ArrowLeft: [80, 0], ArrowRight: [-80, 0], ArrowUp: [0, 80], ArrowDown: [0, -80] }[e.key];
        if (delta) { e.preventDefault(); pan(...delta); }
        return;
      }
      switch (e.key) {
        case "ArrowRight": turn(rtl ? -1 : 1); break;
        case "ArrowLeft": turn(rtl ? 1 : -1); break;
        case "PageDown": turn(1); break;
        case "PageUp": turn(-1); break;
        case "Home": goTo(1); break;
        case "End": goTo(total); break;
        case "+": case "=": zoom(view.scale * 1.65); break;
        case "-": zoom(view.scale / 1.65); break;
        case "0": zoom(1); break;
        default: return;
      }
      e.preventDefault();
    };
    window.addEventListener("keydown", keydown);
    return () => window.removeEventListener("keydown", keydown);
  }, [contents, goTo, immersive, pan, rtl, total, turn, view.scale, zoom]);

  const previousIcon = rtl ? <ChevronRightOutlined /> : <ChevronLeftOutlined />;
  const nextIcon = rtl ? <ChevronLeftOutlined /> : <ChevronRightOutlined />;
  return <main className={`cp-reader${full ? " is-full" : ""}`} aria-label={text.reader} ref={root} tabIndex={-1}>
    <header className="cp-reader-head">
      <div className="cp-reader-brand"><Wordmark /><i aria-hidden="true" /><span>{text.title}</span></div>
      <div className="cp-reader-tools">
        <LanguageSwitch {...{ text, toggleLanguage, language }} />
        <Tool label={full ? text.exitFullscreen : text.fullscreen} onClick={toggleFullscreen}>
          {full ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
        </Tool>
        <Tool label={text.closeProfile} onClick={onClose}><CloseOutlined /></Tool>
      </div>
    </header>
    <div className={`cp-gallery${view.scale === 1 ? " is-fit" : ""}`}
      style={{ "--cp-paper-height": `${height}px` }}>
      <div className="cp-reader-caption"><span className="cp-meta">{text.page} <bdi>{formatPage(slide.number)}</bdi></span>
        <span lang="en" dir="auto">{slide.title}</span></div>
      <div className="cp-viewport" ref={viewport} dir="ltr" {...events} data-zoom={view.scale.toFixed(2)}>
        <div className="cp-paper" style={{ width, height, transform: `translate3d(${view.x}px,${view.y}px,0) scale(${view.scale})` }}>
          <ProfileSlideStage slide={slide} direction={direction} fullResolution={full || view.scale > 1} />
        </div>
      </div>
      <div className="cp-reader-hint">{view.scale > 1 ? <>{text.panHint}<span> · {text.keyPan}</span></> :
        <>
          {slide.width / slide.height > 2 && <div className="cp-page-halves" role="group" aria-label={text.enlarge}>
            <span>{text.enlarge}</span>
            {["left", "right"].map((side) => <button type="button" key={side} onClick={() => enlargeHalf(side)}>
              <i aria-hidden="true" className={`cp-pane-glyph ${side}`} />{side === "left" ? text.leftPage : text.rightPage}
            </button>)}
          </div>}
          <span className="cp-touch-hint">{text.touchHint}</span>
        </>}</div>
      {pending && <div className="cp-wait" role="status">{text.loading}</div>}
      {error && <div className="cp-read-error" role="alert">{text.error} <button type="button" onClick={onRetry}>{text.retry}</button></div>}
    </div>
    <footer className="cp-controls">
      <div className="cp-progress" role="progressbar" aria-label={text.progress} aria-valuenow={slide.number} aria-valuemin={1} aria-valuemax={total}>
        <i style={{ transform: `scaleX(${slide.number / total})` }} />
      </div>
      <button className="cp-contents-trigger" type="button" aria-label={text.contents} aria-haspopup="dialog" onClick={() => setContents(true)}>
        <GridViewOutlined /><span>{text.contents}</span></button>
      <div className="cp-zoom-tools" role="group" aria-label={text.zoomReset}>
        <Tool label={text.zoomOut} onClick={() => zoom(view.scale / 1.65)} disabled={view.scale <= 1}><RemoveOutlined /></Tool>
        <button className="cp-scale" type="button" dir="ltr" title={text.zoomReset} aria-label={text.zoomReset} onClick={() => zoom(1)}>{Math.round(view.scale * 100)}%</button>
        <Tool label={text.zoomIn} onClick={() => zoom(view.scale * 1.65)} disabled={view.scale >= 10}><AddOutlined /></Tool>
      </div>
      <div className="cp-turn-tools">
        <Tool label={text.previous} disabled={target <= 1} onClick={() => turn(-1)}>{previousIcon}</Tool>
        <span className="cp-counter" dir="ltr"><b>{formatPage(slide.number)}</b> / {formatPage(total)}</span>
        <Tool label={text.next} disabled={target >= total} onClick={() => turn(1)}>{nextIcon}</Tool>
      </div>
    </footer>
    <span className="cp-sr" role="status">{text.page} {slide.number} / {total}. <span lang="en">{slide.title}</span></span>
    {contents && <ProfileContents slides={manifest.slides} current={slide.number} text={text} language={language}
      onClose={() => setContents(false)} onSelect={(n) => { setContents(false); goTo(n); }} />}
  </main>;
}
