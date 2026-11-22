import React, { lazy, Suspense, useEffect } from "react";
import LanguageOutlined from "@mui/icons-material/LanguageOutlined";
import { useTheme } from "@mui/material/styles";
import "./profile-cover.css";
import "./cover-typography.css";

const media = "/company-profile/intro";
const RegionalMap = lazy(() => import("./RegionalMap"));

export function Wordmark({ className = "", alt = "BECT Architects & Engineers" }) {
  return <img className={`cp-wordmark ${className}`} src={`${media}/wordmark.png`}
    alt={alt} width="705" height="294" />;
}

export function LanguageSwitch({ language, toggleLanguage, text }) {
  return <button className="cp-language" type="button" onClick={toggleLanguage}
    lang={language === "en" ? "ar" : "en"}><LanguageOutlined aria-hidden="true" />{text.languages}</button>;
}

export function Opening({ text, onClose, error, onRetry }) {
  return <div className="cp-opening">
    <button className="cp-opening-back" type="button" onClick={onClose}>{text.backToIntro}</button>
    <Wordmark />
    {error ? <div className="cp-intro-error" role="alert">{text.error}
      <button type="button" onClick={onRetry}>{text.retry}</button></div> :
      <><div className="cp-opening-track" aria-hidden="true" /><span role="status">{text.opening}</span></>}
  </div>;
}

export default function ProfileIntro({ text, language, toggleLanguage, onExplore, onWarm, opening, error, onRetry, onClose }) {
  const { typography } = useTheme();
  useEffect(() => {
    if (opening) document.activeElement?.blur?.();
  }, [opening]);

  return <main className={`cp-intro${opening ? " is-opening" : ""}`} aria-busy={opening}
    style={{ "--cover-font": typography.fontFamily, "--cover-button-weight": typography.button.fontWeight }}>
    <header className="cp-mast" inert={opening || undefined}>
      <a href="/#home" className="cp-brand" aria-label={text.home}><Wordmark /></a>
      <nav className="cp-mast-actions" aria-label={text.title}>
        <a href="/#home" className="cp-home-link">{text.home}</a>
        <span className="cp-divide" aria-hidden="true" />
        <LanguageSwitch {...{language, toggleLanguage, text}} />
      </nav>
    </header>
    <section className="cp-intro-body" aria-labelledby="cp-cover-title" inert={opening || undefined}>
      <div className="cp-intro-copy">
        <p className="cp-edition">{text.publication}<i aria-hidden="true" /><span className="cp-cover-accent">{text.edition}</span></p>
        <h1 id="cp-cover-title"><span>{text.titleLines[0]}</span>{" "}<em>{text.titleLines[1]}</em></h1>
        <p className="cp-deck">{text.intro}</p>
      </div>
      <figure className="cp-cover-map" aria-labelledby="cp-region-title">
        <figcaption><h2 className="cp-region-heading" id="cp-region-title">{text.regionalPresence}</h2></figcaption>
        <Suspense fallback={<div className="cp-map-placeholder" aria-hidden="true" />}>
          <RegionalMap language={language} />
        </Suspense>
      </figure>
      <div className="cp-intro-actions">
        {error ? <div className="cp-intro-error" role="alert">{text.error}
          <button type="button" onClick={onRetry}>{text.retry}</button></div> :
          <button className="cp-explore" type="button" onClick={onExplore}
            onPointerEnter={onWarm} onFocus={onWarm} disabled={opening}>
            <Wordmark className="cp-explore-mark" alt="" />
            <span className="cp-explore-copy">
              <span className="cp-explore-hint" aria-hidden="true">
                <span className="cp-pointer-cue">{text.clickToView}</span>
                <span className="cp-touch-cue">{text.tapToView}</span>
              </span>
              <span className="cp-explore-label">{text.explore}</span>
            </span>
            <span className="cp-explore-arrow" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 12h15m-6-6 6 6-6 6" />
              </svg>
            </span>
          </button>}
      </div>
    </section>
    {opening && <Opening text={text} onClose={onClose} />}
  </main>;
}
