import React, { useEffect, useRef, useState } from "react";
import CloseOutlined from "@mui/icons-material/CloseOutlined";
import FullscreenOutlined from "@mui/icons-material/FullscreenOutlined";
import FullscreenExitOutlined from "@mui/icons-material/FullscreenExitOutlined";
import AddOutlined from "@mui/icons-material/AddOutlined";
import RemoveOutlined from "@mui/icons-material/RemoveOutlined";
import ChevronLeftOutlined from "@mui/icons-material/ChevronLeftOutlined";
import ChevronRightOutlined from "@mui/icons-material/ChevronRightOutlined";
import GridViewOutlined from "@mui/icons-material/GridViewOutlined";
import MenuBookOutlined from "@mui/icons-material/MenuBookOutlined";
import SubjectOutlined from "@mui/icons-material/SubjectOutlined";
import useMediaQuery from "@mui/material/useMediaQuery";
import { LanguageSwitch, Wordmark } from "./ProfileIntro";
import EditionTransition from "./EditionTransition";
import ProfileContents from "./ProfileContents";
import ProfileSlideStage from "./ProfileSlideStage";
import MobileProjectSlide from "./MobileProjectSlide";
import { FIT_MEDIA } from "./profileAssets";
import usePageViewport from "./usePageViewport";
import { formatPage, profileCopy } from "./profileCopy";

function Tool({ label, children, ...props }) {
  return <button type="button" className="cp-icon" title={label} aria-label={label} {...props}>{children}</button>;
}

export default function ProfileReader({ manifest, slide, direction, target, text, language, toggleLanguage, onClose, turn, goTo, error, onRetry, editionChange, onEditionRevealed }) {
  const root = useRef(null);
  const [contents, setContents] = useState(false);
  const [nativeFull, setNativeFull] = useState(false);
  const [immersive, setImmersive] = useState(false);
  const [showReading, setShowReading] = useState(false);
  const full = immersive || nativeFull;
  const rtl = language === "ar";
  const compact = useMediaQuery(FIT_MEDIA, { noSsr: true });
  const compactProject = compact && Boolean(slide.project);
  const reading = compactProject && showReading;
  const { viewport, view, zoom, pan, enlargeHalf, width, height, events } = usePageViewport(slide, turn, rtl, reading);
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
      if (reading && ["+", "=", "-", "0"].includes(e.key)) return;
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
  }, [contents, goTo, immersive, pan, reading, rtl, total, turn, view.scale, zoom]);

  const previousIcon = rtl ? <ChevronRightOutlined /> : <ChevronLeftOutlined />;
  const nextIcon = rtl ? <ChevronLeftOutlined /> : <ChevronRightOutlined />;
  return <main className={`cp-reader${full ? " is-full" : ""}`} aria-label={text.reader} ref={root} tabIndex={-1}>
    <header className="cp-reader-head">
      <div className="cp-reader-brand"><Wordmark language={language} /><i aria-hidden="true" /><span>{text.title}</span></div>
      <div className="cp-reader-tools">
        <LanguageSwitch language={editionChange?.to ?? language} text={profileCopy[editionChange?.to ?? language]} toggleLanguage={toggleLanguage} />
        <Tool label={full ? text.exitFullscreen : text.fullscreen} onClick={toggleFullscreen}>
          {full ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
        </Tool>
        <Tool label={text.closeProfile} onClick={onClose}><CloseOutlined /></Tool>
      </div>
    </header>
    {compactProject && <div className="cp-project-mode">
      {reading && <span className="cp-meta">{text.page} <bdi>{formatPage(slide.number, language)}</bdi></span>}
      <button type="button" className={reading ? undefined : "cp-project-read"} onClick={() => setShowReading(shown => !shown)}>
        {reading ? <MenuBookOutlined /> : <SubjectOutlined />}
        <span>{reading ? text.showSpread : text.readProject}</span>
        {!reading && <span className="cp-project-recommended">{text.recommended}</span>}
      </button>
    </div>}
    <div className={`cp-gallery${view.scale === 1 ? " is-fit" : ""}${reading ? " is-reading" : ""}`}
      style={{ "--cp-paper-height": `${height}px` }}>
      {!reading && <div className="cp-reader-caption"><span className="cp-meta">{text.page} <bdi>{formatPage(slide.number, language)}</bdi></span>
        <span lang={language} dir="auto">{slide.title}</span></div>}
      <div className="cp-viewport" ref={viewport} dir={reading && rtl ? "rtl" : "ltr"} {...events}
        tabIndex={reading ? 0 : undefined} data-zoom={view.scale.toFixed(2)}>
        {reading ? <MobileProjectSlide slide={slide} language={language} fullscreen={full} /> : <div className="cp-paper" style={{ width, height, transform: `translate3d(${view.x}px,${view.y}px,0) scale(${view.scale})` }}>
          <ProfileSlideStage slide={slide} direction={direction} fullResolution={full || view.scale > 1} />
        </div>}
      </div>
      {!reading && <div className="cp-reader-hint">{view.scale > 1 ? <>{text.panHint}<span> · {text.keyPan}</span></> :
        <>
          {slide.width / slide.height > 2 && <div className="cp-page-halves" role="group" aria-label={text.enlarge}>
            <span>{text.enlarge}</span>
            {(rtl ? ["right", "left"] : ["left", "right"]).map((side) => <button type="button" key={side} onClick={() => enlargeHalf(side)}>
              <i aria-hidden="true" className={`cp-pane-glyph ${side}`} />{side === "left" ? text.leftPage : text.rightPage}
            </button>)}
          </div>}
          <span className="cp-touch-hint">{text.touchHint}</span>
        </>}</div>}
      {editionChange && <EditionTransition key={editionChange.to} change={editionChange}
        ready={language === editionChange.to && !pending} onRevealed={onEditionRevealed} />}
      {pending && !editionChange && <div className="cp-wait" role="status">{text.loading}</div>}
      {error && <div className="cp-read-error" role="alert">{text.error} <button type="button" onClick={onRetry}>{text.retry}</button></div>}
    </div>
    <footer className={`cp-controls${reading ? " is-reading" : ""}`}>
      <div className="cp-progress" role="progressbar" aria-label={text.progress} aria-valuenow={slide.number} aria-valuemin={1} aria-valuemax={total}>
        <i style={{ transform: `scaleX(${slide.number / total})` }} />
      </div>
      <button className="cp-contents-trigger" type="button" aria-label={text.contents} aria-haspopup="dialog" onClick={() => setContents(true)}>
        <GridViewOutlined /><span>{text.contents}</span></button>
      {!reading && <div className="cp-zoom-tools" role="group" aria-label={text.zoomReset}>
        <Tool label={text.zoomOut} onClick={() => zoom(view.scale / 1.65)} disabled={view.scale <= 1}><RemoveOutlined /></Tool>
        <button className="cp-scale" type="button" dir="ltr" title={text.zoomReset} aria-label={text.zoomReset} onClick={() => zoom(1)}>{Math.round(view.scale * 100)}%</button>
        <Tool label={text.zoomIn} onClick={() => zoom(view.scale * 1.65)} disabled={view.scale >= 10}><AddOutlined /></Tool>
      </div>}
      <div className="cp-turn-tools">
        <Tool label={text.previous} disabled={target <= 1} onClick={() => turn(-1)}>{previousIcon}</Tool>
        <span className="cp-counter" dir="ltr"><b>{formatPage(slide.number, language)}</b> / {formatPage(total, language)}</span>
        <Tool label={text.next} disabled={target >= total} onClick={() => turn(1)}>{nextIcon}</Tool>
      </div>
    </footer>
    <span className="cp-sr" role="status">{text.page} {slide.number} / {total}. <span lang={language}>{slide.title}</span></span>
    {contents && <ProfileContents slides={manifest.slides} current={slide.number} text={text} language={language}
      onClose={() => setContents(false)} onSelect={(n) => { setContents(false); goTo(n); }} />}
  </main>;
}
