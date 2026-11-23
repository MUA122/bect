import React, { useEffect, useLayoutEffect, useRef } from "react";
import { upgradeProfileImages } from "./profileAssets";
import { profileCopy, sectionLabel } from "./profileCopy";
import "./mobile-project-slide.css";

export default function MobileProjectSlide({ slide, language, fullscreen }) {
  const photo = useRef(null);
  const { overview, facts, legend } = slide.project;

  useLayoutEffect(() => {
    // The photo composition is on the right in English and on the left in Arabic.
    const pageWidth = slide.width / 2;
    const photoStart = language === "ar" ? 0 : pageWidth;
    const artwork = document.importNode(slide.artwork.template, true);
    artwork.setAttribute("viewBox", `${photoStart} 0 ${pageWidth} ${slide.height}`);
    artwork.setAttribute("aria-hidden", "true");
    photo.current.replaceChildren(artwork);
  }, [slide, language]);

  useEffect(() => {
    if (!fullscreen) return;
    const controller = new AbortController();
    upgradeProfileImages(photo.current, controller.signal).catch(() => {
      // The fitted artwork stays visible if the full-resolution image fails to load.
    });
    return () => controller.abort();
  }, [slide, fullscreen]);

  return <article className="cp-project-article" aria-labelledby="cp-project-title">
    <header className="cp-project-heading">
      <p>{sectionLabel(slide.sector, language)}</p>
      <h1 id="cp-project-title">{slide.title}</h1>
    </header>
    <figure className="cp-project-figure">
      <div className="cp-project-photo" ref={photo} role="img" aria-label={slide.title}
        style={{ aspectRatio: `${slide.width / 2} / ${slide.height}` }} />
      {legend && <figcaption>
        <strong>{legend[0]}</strong> <bdi>{legend.at(-1)}</bdi>
        <ul>{legend.slice(1, -1).map((item) => <li key={item}>{item}</li>)}</ul>
      </figcaption>}
    </figure>
    <div className="cp-project-details">
      <h2>{profileCopy[language].projectOverview}</h2>
      {overview.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
      <dl>{facts.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
    </div>
  </article>;
}
