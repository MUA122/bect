import React, { useEffect, useId, useState } from "react";
import referenceArtwork from "../assets/cityscape/reference.jpg";
import "./CityscapePopup.css";

const copy = {
  en: {
    event: "Cityscape Riyadh 2026",
    brand: "BECT Architects & Engineers · Cityscape Riyadh 2026",
    heading: "See You There",
    description: "Join us this November in Riyadh.",
    date: "16–19 November 2026",
    action: "MEET US THERE",
    close: "Close Cityscape announcement",
    loadError: "The announcement image could not load. Visit the banner to meet us in Riyadh.",
  },
  ar: {
    event: "سيتي سكيب الرياض 2026",
    brand: "بيكت للاستشارات الهندسية · سيتي سكيب الرياض 2026",
    heading: "نلتقي بكم هناك",
    description: "انضموا إلينا في نوفمبر في الرياض.",
    date: "\u206619-16\u2069 نوفمبر \u20662026\u2069",
    action: "نلتقي بكم هناك",
    close: "إغلاق إعلان سيتي سكيب",
    loadError: "تعذر تحميل صورة الإعلان. زوروا قسم سيتي سكيب للقاء فريقنا في الرياض.",
  },
};

const preparedResources = new Map();

function prepareResources(language) {
  if (!preparedResources.has(language)) {
    const artwork = new Image();
    artwork.decoding = "async";
    artwork.fetchPriority = "high";
    artwork.src = referenceArtwork;

    const fontRequests = language === "ar" ? [
      document.fonts.load('700 100px "Noto Kufi Arabic"', "نلتقي بكم هناك"),
      document.fonts.load('400 100px "Noto Kufi Arabic"', copy.ar.description),
      document.fonts.load('500 100px "Noto Kufi Arabic"', copy.ar.date),
    ] : [
      document.fonts.load('650 100px "BectCityscapeOutfit"', "See You"),
      document.fonts.load('750 100px "BectCityscapeInter"', "There"),
      document.fonts.load('400 100px "BectCityscapeInter"', copy.en.description),
      document.fonts.load('500 100px "BectCityscapeInter"', copy.en.action),
    ];
    const fonts = Promise.all(fontRequests)
      .then((faces) => faces.every((loaded) => loaded.length > 0), () => false);

    // Decode the artwork and request this language's fonts independently of the
    // site's carousel/loading screen. Missing fonts use the localized fallback.
    preparedResources.set(language, Promise.all([artwork.decode(), fonts])
      .then(([, fontsReady]) => fontsReady ? "ready" : "static")
      .catch(() => {
        preparedResources.delete(language);
        return "error";
      }));
  }
  return preparedResources.get(language);
}

// Direct port of the supplied src/announcement.html in embedded mode.
// Keep the artwork, masks and text in the original 1536 × 1024 coordinate system.
export default function CityscapePopup({ language = "en", onMeetUs, onClose }) {
  const isArabic = language === "ar";
  const popupLanguage = isArabic ? "ar" : "en";
  const text = copy[popupLanguage];
  const [resourceState, setResourceState] = useState("loading");
  const [actionReady, setActionReady] = useState(false);
  const instanceId = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const id = (name) => `bect-cityscape-${instanceId}-${name}`;
  const href = (name) => `#${id(name)}`;
  const paint = (name) => `url(#${id(name)})`;
  const ready = resourceState === "ready" || resourceState === "static";
  // The reference image contains English copy. Arabic always uses editable text,
  // including when its web font is unavailable and the browser uses a fallback.
  const useStaticArtworkCopy = !isArabic && resourceState === "static";

  useEffect(() => {
    let mounted = true;
    setResourceState("loading");
    setActionReady(false);
    prepareResources(popupLanguage).then((state) => {
      if (mounted) setResourceState(state);
    });
    return () => { mounted = false; };
  }, [popupLanguage]);

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
      aria-label={text.close}
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
      dir={isArabic ? "rtl" : "ltr"}
      lang={popupLanguage}
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
          <h2 id={id("event-heading")}>{text.event}</h2>
          <p id={id("event-description")}>{text.loadError}</p>
          <button type="button" onClick={onMeetUs}>{text.action} {isArabic ? "←" : "→"}</button>
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
            <svg className="bect-cityscape-popup__artwork" viewBox="0 0 1536 1024" xmlns="http://www.w3.org/2000/svg" direction="ltr" aria-hidden="true">
              <defs>
                <image id={id("reference-art")} href={referenceArtwork} width="1536" height="1024" />
                <path id={id("panel-outline")} d="M 49 172 Q 49 139 85 136 L 176 138 L 193 110 Q 204 94 228 95 L 501 103 L 715 119 L 1221 89 Q 1236 87 1246 101 L 1294 163 L 1439 171 Q 1474 172 1474 211 L 1474 901 Q 1473 936 1440 938 L 830 933 Q 819 949 803 947 L 92 907 Q 53 907 53 866 L 53 333 Q 49 321 49 309 Z" />
                <clipPath id={id("announcement-clip")}><use href={href("panel-outline")} /></clipPath>
                <mask id={id("page-only")} maskUnits="userSpaceOnUse" x="0" y="0" width="1536" height="1024">
                  <rect width="1536" height="1024" fill="white" />
                  <use href={href("panel-outline")} fill="black" />
                </mask>
                <filter id={id("feather")} x="-20%" y="-20%" width="140%" height="140%" colorInterpolationFilters="sRGB"><feGaussianBlur stdDeviation="4" /></filter>
                <filter id={id("button-glow")} x="-20%" y="-50%" width="140%" height="200%" colorInterpolationFilters="sRGB"><feDropShadow dx="0" dy="10" stdDeviation="12" floodColor="#039ffc" floodOpacity=".4" /></filter>
                {/* Remove the original CTA and glow to leave room around the date. */}
                <mask id={id("button-area")} maskUnits="userSpaceOnUse" x="0" y="0" width="1536" height="1024">
                  <rect width="1536" height="1024" fill="white" />
                  <rect x="239" y="716" width="540" height="154" rx="20" fill="black" filter={paint("feather")} />
                </mask>
                <mask id={id("editable-copy")} maskUnits="userSpaceOnUse" x="0" y="0" width="1536" height="1024">
                  <rect width="1536" height="1024" fill="white" />
                  <g fill="black" filter={paint("feather")}>
                    <rect x="222" y="362" width="473" height="230" rx="10" />
                    <rect x="256" y="624" width="435" height="53" rx="8" />
                    <rect x="256" y="669" width="194" height="56" rx="8" />
                    <rect x="239" y="716" width="540" height="154" rx="20" />
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
                <rect x="235" y="610" width="560" height="280" fill={paint("description-paper")} />
                {useStaticArtworkCopy ? (
                  <use href={href("reference-art")} mask={paint("button-area")} />
                ) : (
                  <>
                    <rect x="200" y="340" width="520" height="270" fill={paint("headline-paper")} />
                    <rect x="200" y="340" width="520" height="270" fill={paint("headline-shade")} />
                    <use href={href("reference-art")} mask={paint("editable-copy")} />
                  </>
                )}
              </g>
              {!useStaticArtworkCopy && (isArabic ? (
                <g className="bect-cityscape-popup__arabic-type" direction="rtl" textAnchor="start">
                  <g className="bect-cityscape-popup__reveal bect-cityscape-popup__headline bect-cityscape-popup__editable-type" fontWeight="700">
                    <text x="682" y="465" fontSize="80" fill="#031f4d">نلتقي بكم</text>
                    <text x="682" y="580" fontSize="100" fill="#039ffc">هناك</text>
                  </g>
                  <g className="bect-cityscape-popup__reveal bect-cityscape-popup__description bect-cityscape-popup__editable-type" fontSize="34" fontWeight="400" fill="#09204d">
                    <text x="690" y="665">انضموا إلينا في نوفمبر</text>
                    <text x="690" y="709">في الرياض.</text>
                  </g>
                </g>
              ) : (
                <>
                  <g className="bect-cityscape-popup__reveal bect-cityscape-popup__headline">
                  <g className="bect-cityscape-popup__editable-type" transform="matrix(1.30281690 0 0 1.34986226 233.58978873 472.54889807)" fill="#031f4d"><text x="0" y="0" fontFamily="BectCityscapeOutfit" fontWeight="650" fontSize="100" letterSpacing="0">See You</text></g>
                  <g className="bect-cityscape-popup__editable-type" transform="matrix(1.14393338 0 0 1.21953164 254.05102944 576.72569053)" fill="#039ffc"><text x="0" y="0" fontFamily="BectCityscapeInter" fontWeight="750" fontSize="100" letterSpacing="0">There</text></g>
                  </g>
                  <g className="bect-cityscape-popup__reveal bect-cityscape-popup__description">
                  <g className="bect-cityscape-popup__editable-type" transform="matrix(0.38988454 0 0 0.37998720 266.09626690 664.55470250)" fill="#09204d"><text x="0" y="0" fontFamily="BectCityscapeInter" fontWeight="400" fontSize="100" letterSpacing="0">Join us this November</text></g>
                  <g className="bect-cityscape-popup__editable-type" transform="matrix(0.37569381 0 0 0.36478372 266.72529137 706.41221374)" fill="#09204d"><text x="0" y="0" fontFamily="BectCityscapeInter" fontWeight="400" fontSize="100" letterSpacing="0">in Riyadh.</text></g>
                  </g>
                </>
              ))}
              <g transform="translate(0 44)">
                <rect x="264" y="741" width="490" height="102" rx="25" fill={paint("button-ink")} filter={paint("button-glow")} />
                <g
                  className="bect-cityscape-popup__reveal bect-cityscape-popup__action-copy"
                  onAnimationStart={() => setActionReady(true)}
                >
                  <path d={isArabic ? "M365 791.5H338M349 780L337.5 791.5L349 803" : "M652 791.5H679M668 780L679.5 791.5L668 803"} fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  {isArabic ? (
                    <g className="bect-cityscape-popup__arabic-type bect-cityscape-popup__editable-type" direction="rtl" fill="#ffffff"><text x="675" y="802" fontWeight="500" fontSize="30">{text.action}</text></g>
                  ) : (
                    <g className="bect-cityscape-popup__editable-type" transform="matrix(0.28753926 0 0 0.28026274 361.68507569 801.66390287)" fill="#ffffff"><text x="0" y="0" fontFamily="BectCityscapeInter, sans-serif" fontWeight="500" fontSize="100" letterSpacing="6">{text.action}</text></g>
                  )}
                </g>
              </g>
              <g className="bect-cityscape-popup__reveal bect-cityscape-popup__description bect-cityscape-popup__editable-type" fill="#09204d">
                {isArabic ? (
                  <text className="bect-cityscape-popup__arabic-type" x="690" y="753" direction="rtl" fontWeight="500" fontSize="24">{text.date}</text>
                ) : (
                  <text x="266.72529137" y="753" fontFamily="BectCityscapeInter, sans-serif" fontWeight="500" fontSize="24">{text.date}</text>
                )}
              </g>
            </svg>

            <div className="bect-cityscape-popup__accessible">{text.brand}</div>
            <h2 id={id("event-heading")} className="bect-cityscape-popup__accessible">{text.heading}</h2>
            <p id={id("event-description")} className="bect-cityscape-popup__accessible">{text.description} {text.date}.</p>
            <button className="bect-cityscape-popup__meet-button" type="button" aria-label={text.action} disabled={!ready || !actionReady} onClick={onMeetUs} />
          </section>
        </div>
      )}
    </div>
  );
}
