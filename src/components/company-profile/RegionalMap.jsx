import React, { useCallback, useEffect, useId, useRef, useState } from "react";
import { officeLocations } from "../../data/officeLocations";
import OfficePopup from "./OfficePopup";
import paths from "./regional-map-paths.json";
import "./regional-map.css";

// Natural Earth v5.1.2, 1:50m Admin 0, rivers and populated places (public domain).
// WGS84 Lambert conformal conic: standard parallels 18°/32°N, origin 25°N, 40°E.
// All shapes, graticules and city-centre anchors share the same 720 × 436 projection.
// https://github.com/nvkelso/natural-earth-vector/tree/v5.1.2
// Terrain: Natural Earth Shaded Relief 1:50m v3.2.0, resampled from its WGS84
// georeferenced TIFF into the same projection. Neutral lowland shading is transparent ink.
// https://www.naturalearthdata.com/downloads/50m-raster-data/50m-shaded-relief/
// Flag artwork: https://flagcdn.com/eg.svg and https://flagcdn.com/sa.svg.
const countries = [
  { code: "EG", officeId: "egypt", city: "cairo", pin: [180.62, 83.78], label: [126, 176] },
  { code: "SA", officeId: "saudi", city: "riyadh", pin: [492.37, 208.64], label: [532, 293] },
];
const content = {
  en: {
    map: "BECT offices. Select a country or city for office details.",
    officeLabel: (city, country) => `Office details for ${city}, ${country}`,
    EG: "Egypt", SA: "Saudi Arabia", sea: "Red Sea",
  },
  ar: {
    map: "مكاتب بكت. اختر البلد أو المدينة لعرض تفاصيل المكتب.",
    officeLabel: (city, country) => `تفاصيل مكتب ${city}، ${country}`,
    EG: "مصر", SA: "السعودية", sea: "البحر الأحمر",
  },
};
const position = (x, y) => ({ left: `${x * 100 / 720}%`, top: `${y * 100 / 436}%` });
const reliefSource = "/company-profile/intro/regional-relief.webp";

export default function RegionalMap({ language }) {
  const [selectedCode, setSelectedCode] = useState(null);
  const invoker = useRef(null);
  const [reliefReady, setReliefReady] = useState(false);
  const unique = useId().replace(/[^A-Za-z0-9_-]/g, "");
  const prefix = `cp-atlas-${unique}`;
  const popupId = `${prefix}-office`;
  const resource = (name) => `url(#${prefix}-${name})`;
  const text = content[language] || content.en;
  const offices = officeLocations[language] || officeLocations.en;
  const locations = countries.map(country => ({
    ...country, office: offices.find(office => office.id === country.officeId),
  }));
  const selected = locations.find(country => country.code === selectedCode);

  const closeAndRestoreFocus = useCallback(() => {
    setSelectedCode(null);
    invoker.current?.focus({ preventScroll: true });
  }, []);

  function activate(event, country) {
    invoker.current = event.currentTarget;
    setSelectedCode(country.code);
  }

  function triggerProps(country) {
    return {
      "data-office-trigger": country.code,
      "data-country": country.code,
      "aria-label": text.officeLabel(country.office.city, text[country.code]),
      "aria-haspopup": "dialog",
      "aria-expanded": selectedCode === country.code,
      "aria-controls": selectedCode === country.code ? popupId : undefined,
      onClick: (event) => activate(event, country),
    };
  }

  useEffect(() => {
    // The optional ink layer enters only after a full image decode. A failed
    // request leaves the map's vector shapes, rivers, and controls available.
    let mounted = true;
    const terrain = new Image();
    terrain.src = reliefSource;
    terrain.decode().then(() => { if (mounted) setReliefReady(true); }).catch(() => {});
    return () => { mounted = false; };
  }, []);

  return <div className="cp-regional-map" role="group" aria-label={text.map} data-selected={selectedCode || undefined}>
    <svg className="cp-atlas-drawing" viewBox="0 0 720 436" role="group" focusable="false">
      <defs>
        <radialGradient id={`${prefix}-fade`} cx="50%" cy="50%" r="50%">
          <stop offset="50%" stopColor="white" /><stop offset="80%" stopColor="white" stopOpacity=".74" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
        <mask id={`${prefix}-extent`} maskUnits="userSpaceOnUse" x="0" y="0" width="720" height="436">
          <rect width="720" height="436" fill={resource("fade")} />
        </mask>
        <linearGradient id={`${prefix}-fill`} x1="0%" x2="100%" y1="0%" y2="100%">
          <stop stopColor="#41687c" /><stop offset=".54" stopColor="#30566d" /><stop offset="1" stopColor="#23465d" />
        </linearGradient>
        <clipPath id={`${prefix}-land`}><path d={paths.coast} /></clipPath>
      </defs>
      <g mask={resource("extent")} aria-hidden="true">
        <path className="cp-map-context" d={paths.context} />
        <path className="cp-map-grid" d={paths.graticule} />
      </g>
      <g className="cp-map-land" fill={resource("fill")}>
        {locations.map(country => <path key={country.code} className="cp-map-country" d={paths[country.officeId]}
          role="button" tabIndex={0} {...triggerProps(country)}
          onKeyDown={event => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              if (!event.repeat) activate(event, country);
            }
          }} />)}
      </g>
      <g mask={resource("extent")} aria-hidden="true">
        <image className="cp-map-relief" href={reliefReady ? reliefSource : undefined}
          width="720" height="436" clipPath={resource("land")} visibility={reliefReady ? "visible" : "hidden"}
          onError={() => setReliefReady(false)} />
        <path className="cp-map-rivers" d={paths.rivers} />
      </g>
      <g className="cp-map-boundaries" aria-hidden="true">
        <path d={paths.egypt} /><path d={paths.saudi} />
      </g>
      <path className="cp-map-connection" pathLength="1" d="M180.62 83.78 Q333 68 492.37 208.64" aria-hidden="true" />
      <text className="cp-map-sea" x="284" y="244" textAnchor="middle" transform="rotate(61 284 244)" direction={language === "ar" ? "rtl" : "ltr"} aria-hidden="true">{text.sea}</text>
    </svg>
    {locations.map(country => <button key={country.code} type="button" className="cp-map-country-label"
      style={position(...country.label)} {...triggerProps(country)}>
      <img className="cp-map-flag" data-country={country.code} src={`/company-profile/intro/flag-${country.code.toLowerCase()}.svg`} width="30" height="20" alt="" />
      <span>{text[country.code]}</span>
    </button>)}
    {locations.map(country => <button key={country.code} className="cp-map-location" type="button"
      data-city={country.city} style={position(...country.pin)} {...triggerProps(country)}>
      <span className="cp-map-pin" aria-hidden="true" /><span className="cp-map-city-label">{country.office.city}</span>
    </button>)}
    <OfficePopup office={selected?.office} language={language} id={popupId} onClose={closeAndRestoreFocus} />
  </div>;
}
