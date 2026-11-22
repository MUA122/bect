import React, { useCallback, useEffect, useRef, useState } from "react";
import useSiteLanguage from "../../hooks/useSiteLanguage";
import ProfileIntro, { Opening } from "./ProfileIntro";
import ProfileReader from "./ProfileReader";
import { loadProfileManifest, prepareProfileSlide, preloadProfileNeighbors } from "./profileAssets";
import { profileCopy } from "./profileCopy";
import "./company-profile.css";

function locationPage() {
  const match = /^#page=(\d+)$/.exec(window.location.hash);
  return match ? Math.max(1, Number(match[1])) : null;
}

export default function CompanyProfilePage() {
  const [language, setLanguage] = useSiteLanguage();
  const [intent, setIntent] = useState(() => ({ number: locationPage(), opening: false }));
  const target = useRef(intent.number);
  const [manifest, setManifest] = useState(null);
  const [current, setCurrent] = useState(null);
  const [failed, setFailed] = useState(false);
  const [revealing, setRevealing] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const exploreFocus = useRef(false);
  const text = profileCopy[language];

  const request = useCallback((number, opening = false) => {
    if (target.current === number) return;
    target.current = number;
    setFailed(false);
    setRevealing(false);
    if (number === null) {
      exploreFocus.current = true;
      setCurrent(null);
    }
    setIntent({ number, opening });
  }, []);

  useEffect(() => {
    const sync = () => request(locationPage());
    window.addEventListener("popstate", sync);
    window.addEventListener("hashchange", sync);
    return () => {
      window.removeEventListener("popstate", sync);
      window.removeEventListener("hashchange", sync);
    };
  }, [request]);

  useEffect(() => {
    document.title = `${text.title} | BECT Architects & Engineers`;
  }, [text.title]);

  useEffect(() => {
    let active = true;
    loadProfileManifest().then((data) => { if (active) setManifest(data); }).catch(() => {
      // The intro remains available. Opening the reader retries the request.
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (intent.number === null) return;
    let active = true;
    let timer;
    const cinematic = intent.opening && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const entrance = cinematic ? new Promise((resolve) => { timer = window.setTimeout(resolve, 1650); }) : null;

    async function prepare() {
      try {
        const data = await loadProfileManifest();
        if (!active) return;
        setManifest(data);
        const number = Math.min(data.slides.length, intent.number);
        const slide = await prepareProfileSlide(data.slides[number - 1]);
        if (cinematic) await entrance;
        if (!active) return;
        if (locationPage() !== number || window.location.hash !== `#page=${number}`) {
          window.history.replaceState(window.history.state, "", `#page=${number}`);
        }
        // Normalize out-of-range deep links so the next turn starts at the visible page.
        if (target.current !== number) {
          target.current = number;
          setIntent({ number, opening: false });
        }
        if (cinematic) setRevealing(true);
        setCurrent((previous) => previous?.slide.number === number ? previous : ({
          slide, step: previous && number < previous.slide.number ? -1 : 1,
        }));
        setFailed(false);
      } catch {
        if (active) setFailed(true);
      }
    }
    prepare();
    return () => { active = false; window.clearTimeout(timer); };
  }, [intent, attempt]);

  useEffect(() => {
    if (!current || !manifest) return;
    return preloadProfileNeighbors(manifest.slides, current.slide.number - 1, current.step);
  }, [current, manifest]);

  useEffect(() => {
    if (intent.number !== null || !exploreFocus.current) return;
    document.querySelector(".cp-explore")?.focus({ preventScroll: true });
    exploreFocus.current = false;
  }, [intent.number]);

  const goTo = useCallback((number) => {
    if (!manifest) return;
    const page = Math.max(1, Math.min(manifest.slides.length, number));
    if (page === target.current) return;
    window.history.replaceState(window.history.state, "", `#page=${page}`);
    request(page);
  }, [manifest, request]);

  const turn = useCallback((step) => goTo((target.current ?? 1) + step), [goTo]);
  const enter = () => {
    window.history.pushState({ ...window.history.state, bectProfileReader: true }, "", "#page=1");
    request(1, true);
  };
  const exit = () => {
    if (window.history.state?.bectProfileReader) window.history.back();
    else {
      window.history.replaceState(window.history.state, "", window.location.pathname + window.location.search);
      request(null);
    }
  };
  const warmCover = () => {
    if (navigator.connection?.saveData) return;
    loadProfileManifest().then((data) => {
      if (target.current === null) return prepareProfileSlide(data.slides[0]);
    }).catch(() => {});
  };
  const retry = () => { setFailed(false); setAttempt((n) => n + 1); };
  const shared = { text, language, toggleLanguage: () => setLanguage(language === "ar" ? "en" : "ar") };

  return <div className="cp-publication" dir={language === "ar" ? "rtl" : "ltr"}>
    {current && intent.number !== null ? <ProfileReader {...shared} manifest={manifest} slide={current.slide}
      direction={current.step * (language === "ar" ? -1 : 1)} target={intent.number} turn={turn}
      goTo={goTo} onClose={exit} error={failed} onRetry={retry} /> :
      intent.number !== null && !intent.opening ? <main className="cp-entry">
        <Opening text={text} onClose={exit} error={failed} onRetry={retry} /></main> :
        <ProfileIntro {...shared} opening={intent.number !== null && !failed}
          error={failed} onRetry={retry} onClose={exit} onExplore={enter} onWarm={warmCover} />}
    {current && revealing && <div className="cp-opening-exit" aria-hidden="true" inert
      onAnimationEnd={(event) => { if (event.target === event.currentTarget) setRevealing(false); }}>
      <Opening text={text} onClose={exit} />
    </div>}
  </div>;
}
