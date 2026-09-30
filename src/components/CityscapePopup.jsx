import React, { useEffect, useId, useState } from "react";
import referenceArtwork from "../assets/cityscape/reference.jpg";
import "./CityscapePopup.css";

let preparedResources;

function prepareResources() {
  if (!preparedResources) {
    const artwork = new Image();
    artwork.decoding = "async";
    artwork.fetchPriority = "high";
    artwork.src = referenceArtwork;

    const fonts = Promise.all([
      document.fonts.load('650 100px "BectCityscapeOutfit"', "See You"),
      document.fonts.load('750 100px "BectCityscapeInter"', "There"),
      document.fonts.load('400 100px "BectCityscapeInter"', "Join us this November in Riyadh."),
      document.fonts.load('500 100px "BectCityscapeInter"', "MEET US THERE"),
    ]).then((faces) => faces.every((loaded) => loaded.length > 0), () => false);

    // Decode the actual artwork and load only the popup's fonts. No timer or
    // dependency on the site's unrelated image carousel/loading screen.
    preparedResources = Promise.all([artwork.decode(), fonts])
      .then(([, fontsReady]) => fontsReady ? "ready" : "static")
      .catch(() => {
        preparedResources = undefined;
        return "error";
      });
  }
  return preparedResources;
}

// Direct port of the supplied src/announcement.html in embedded mode.
// Keep the artwork, masks and text in the original 1536 × 1024 coordinate system.
export default function CityscapePopup({ onMeetUs, onClose }) {
  const [resourceState, setResourceState] = useState("loading");
  const [actionReady, setActionReady] = useState(false);
  const instanceId = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const id = (name) => `bect-cityscape-${instanceId}-${name}`;
  const href = (name) => `#${id(name)}`;
  const paint = (name) => `url(#${id(name)})`;
  const ready = resourceState === "ready" || resourceState === "static";

  useEffect(() => {
    let mounted = true;
    prepareResources().then((state) => {
      if (mounted) setResourceState(state);
    });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!ready) return undefined;
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const enableReducedMotionAction = () => {
      if (motionPreference.matches) setActionReady(true);
    };
    enableReducedMotionAction();
    motionPreference.addEventListener("change", enableReducedMotionAction);
    return () => motionPreference.removeEventListener("change", enableReducedMotionAction);
  }, [ready]);

  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);

  const closeButton = (
    <button
      className="bect-cityscape-popup__close"
      type="button"
      aria-label="Close Cityscape announcement"
      onClick={onClose}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6 6l12 12M18 6L6 18" />
      </svg>
    </button>
  );

  return (
    <div
      className="bect-cityscape-popup"
      data-embedded=""
      data-ready={ready ? "true" : "false"}
      data-static={resourceState === "static" ? "true" : undefined}
      dir="ltr"
      lang="en"
      role="dialog"
      aria-modal="true"
      aria-labelledby={id("event-heading")}
      aria-describedby={id("event-description")}
      aria-busy={resourceState === "loading"}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      {resourceState === "error" ? (
        <div className="bect-cityscape-popup__load-error" role="alert">
          {closeButton}
          <h2 id={id("event-heading")}>Cityscape Riyadh 2026</h2>
          <p id={id("event-description")}>The announcement image could not load. Visit the banner to meet us in Riyadh.</p>
          <button type="button" onClick={onMeetUs}>MEET US THERE →</button>
        </div>
      ) : (
        <div className="bect-cityscape-popup__viewport">
          {closeButton}
          <section
            className="bect-cityscape-popup__scene"
            aria-labelledby={id("event-heading")}
            onAnimationEnd={(event) => {
              if (event.target === event.currentTarget) setActionReady(true);
            }}
          >
            <svg className="bect-cityscape-popup__artwork" viewBox="0 0 1536 1024" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <defs>
                <image id={id("reference-art")} href={referenceArtwork} width="1536" height="1024" />
                <path id={id("panel-outline")} d="M 49 172 Q 49 139 85 136 L 176 138 L 193 110 Q 204 94 228 95 L 501 103 L 715 119 L 1221 89 Q 1236 87 1246 101 L 1294 163 L 1439 171 Q 1474 172 1474 211 L 1474 901 Q 1473 936 1440 938 L 830 933 Q 819 949 803 947 L 92 907 Q 53 907 53 866 L 53 333 Q 49 321 49 309 Z" />
                <clipPath id={id("announcement-clip")}><use href={href("panel-outline")} /></clipPath>
                <mask id={id("page-only")} maskUnits="userSpaceOnUse" x="0" y="0" width="1536" height="1024">
                  <rect width="1536" height="1024" fill="white" />
                  <use href={href("panel-outline")} fill="black" />
                </mask>
                <filter id={id("feather")} x="-20%" y="-20%" width="140%" height="140%" colorInterpolationFilters="sRGB"><feGaussianBlur stdDeviation="4" /></filter>
                <mask id={id("editable-copy")} maskUnits="userSpaceOnUse" x="0" y="0" width="1536" height="1024">
                  <rect width="1536" height="1024" fill="white" />
                  <g fill="black" filter={paint("feather")}>
                    <rect x="222" y="362" width="473" height="230" rx="10" />
                    <rect x="256" y="624" width="435" height="53" rx="8" />
                    <rect x="256" y="669" width="194" height="56" rx="8" />
                  </g>
                </mask>
                <linearGradient id={id("headline-paper")} x1="225" y1="445" x2="695" y2="475" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#fefefe" /><stop offset=".42" stopColor="#fdfdfd" /><stop offset=".72" stopColor="#fcfafc" /><stop offset="1" stopColor="#f8f4f4" />
                </linearGradient>
                <linearGradient id={id("headline-shade")} x1="0" y1="500" x2="0" y2="598" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#e6e7f0" stopOpacity="0" /><stop offset="1" stopColor="#e6e7f0" stopOpacity=".25" />
                </linearGradient>
                <linearGradient id={id("description-paper")} x1="258" y1="645" x2="695" y2="710" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#fcfcfd" /><stop offset=".45" stopColor="#f5f6fb" /><stop offset="1" stopColor="#e6e6ee" />
                </linearGradient>
                <linearGradient id={id("button-ink")} x1="264" y1="791" x2="754" y2="791" gradientUnits="userSpaceOnUse"><stop stopColor="#042a59" /><stop offset="1" stopColor="#05244c" /></linearGradient>
              </defs>
              <g className="bect-cityscape-popup__mock-page" mask={paint("page-only")}><use href={href("reference-art")} /></g>
              <g clipPath={paint("announcement-clip")}>
                {resourceState === "static" ? (
                  <use href={href("reference-art")} />
                ) : (
                  <>
                    <rect x="200" y="340" width="520" height="270" fill={paint("headline-paper")} />
                    <rect x="200" y="340" width="520" height="270" fill={paint("headline-shade")} />
                    <rect x="235" y="610" width="480" height="130" fill={paint("description-paper")} />
                    <use href={href("reference-art")} mask={paint("editable-copy")} />
                  </>
                )}
              </g>
              {resourceState !== "static" && (
                <>
                  {/* This opaque fill covers the lettering baked into the supplied
                      artwork while the live arrow and CTA label enter. */}
                  <rect x="264" y="741" width="490" height="102" rx="25" fill={paint("button-ink")} />
                  <g className="bect-cityscape-popup__reveal bect-cityscape-popup__headline">
                  <g className="bect-cityscape-popup__editable-type" transform="matrix(1.30281690 0 0 1.34986226 233.58978873 472.54889807)" fill="#031f4d"><text x="0" y="0" fontFamily="BectCityscapeOutfit" fontWeight="650" fontSize="100" letterSpacing="0">See You</text></g>
                  <g className="bect-cityscape-popup__editable-type" transform="matrix(1.14393338 0 0 1.21953164 254.05102944 576.72569053)" fill="#039ffc"><text x="0" y="0" fontFamily="BectCityscapeInter" fontWeight="750" fontSize="100" letterSpacing="0">There</text></g>
                  </g>
                  <g className="bect-cityscape-popup__reveal bect-cityscape-popup__description">
                  <g className="bect-cityscape-popup__editable-type" transform="matrix(0.38988454 0 0 0.37998720 266.09626690 664.55470250)" fill="#09204d"><text x="0" y="0" fontFamily="BectCityscapeInter" fontWeight="400" fontSize="100" letterSpacing="0">Join us this November</text></g>
                  <g className="bect-cityscape-popup__editable-type" transform="matrix(0.37569381 0 0 0.36478372 266.72529137 706.41221374)" fill="#09204d"><text x="0" y="0" fontFamily="BectCityscapeInter" fontWeight="400" fontSize="100" letterSpacing="0">in Riyadh.</text></g>
                  </g>
                  <g
                    className="bect-cityscape-popup__reveal bect-cityscape-popup__action-copy"
                    onAnimationStart={() => setActionReady(true)}
                  >
                  <path d="M652 791.5H679M668 780L679.5 791.5L668 803" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  <g className="bect-cityscape-popup__editable-type" transform="matrix(0.28753926 0 0 0.28026274 361.68507569 801.66390287)" fill="#ffffff"><text x="0" y="0" fontFamily="BectCityscapeInter" fontWeight="500" fontSize="100" letterSpacing="6">MEET US THERE</text></g>
                  </g>
                </>
              )}
            </svg>

            <div className="bect-cityscape-popup__accessible">BECT Architects &amp; Engineers · Cityscape Riyadh 2026</div>
            <h2 id={id("event-heading")} className="bect-cityscape-popup__accessible">See You There</h2>
            <p id={id("event-description")} className="bect-cityscape-popup__accessible">Join us this November in Riyadh.</p>
            <button className="bect-cityscape-popup__meet-button" type="button" aria-label="Meet us there" disabled={!ready || !actionReady} onClick={onMeetUs} />
          </section>
        </div>
      )}
    </div>
  );
}
