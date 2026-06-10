import React, { useMemo, useState } from 'react';
import { Box, Container, Typography } from '@mui/material';
import PublicRounded from '@mui/icons-material/PublicRounded';
import worldMap from '../assets/world.json';
import './GlobalPresenceSection.css';

const countries = [
  { id: 'egypt', flagCode: 'eg', geoName: 'Egypt', name: { en: 'Egypt', ar: 'مصر' }, region: { en: 'North Africa', ar: 'شمال أفريقيا' }, lon: 30.8, lat: 26.8 },
  { id: 'saudi', flagCode: 'sa', geoName: 'Saudi Arabia', name: { en: 'Saudi Arabia', ar: 'السعودية' }, region: { en: 'Middle East', ar: 'الشرق الأوسط' }, lon: 45.1, lat: 23.9 },
  { id: 'uae', flagCode: 'ae', geoName: 'United Arab Emirates', name: { en: 'United Arab Emirates', ar: 'الإمارات' }, region: { en: 'Middle East', ar: 'الشرق الأوسط' }, lon: 54.4, lat: 24.3 },
  { id: 'oman', flagCode: 'om', geoName: 'Oman', name: { en: 'Oman', ar: 'عُمان' }, region: { en: 'Middle East', ar: 'الشرق الأوسط' }, lon: 56.1, lat: 20.6 },
  { id: 'kuwait', flagCode: 'kw', geoName: 'Kuwait', name: { en: 'Kuwait', ar: 'الكويت' }, region: { en: 'Middle East', ar: 'الشرق الأوسط' }, lon: 47.5, lat: 29.3 },
  { id: 'iraq', flagCode: 'iq', geoName: 'Iraq', name: { en: 'Iraq', ar: 'العراق' }, region: { en: 'Middle East', ar: 'الشرق الأوسط' }, lon: 43.7, lat: 33.2 },
  { id: 'syria', flagCode: 'sy', geoName: 'Syria', name: { en: 'Syria', ar: 'سوريا' }, region: { en: 'Middle East', ar: 'الشرق الأوسط' }, lon: 38.5, lat: 35.0 },
  { id: 'libya', flagCode: 'ly', geoName: 'Libya', name: { en: 'Libya', ar: 'ليبيا' }, region: { en: 'North Africa', ar: 'شمال أفريقيا' }, lon: 17.2, lat: 26.3 },
  { id: 'morocco', flagCode: 'ma', geoName: 'Morocco', name: { en: 'Morocco', ar: 'المغرب' }, region: { en: 'North Africa', ar: 'شمال أفريقيا' }, lon: -7.1, lat: 31.8 },
  { id: 'algeria', flagCode: 'dz', geoName: 'Algeria', name: { en: 'Algeria', ar: 'الجزائر' }, region: { en: 'North Africa', ar: 'شمال أفريقيا' }, lon: 1.7, lat: 28.0 },
  { id: 'sudan', flagCode: 'sd', geoName: 'Sudan', name: { en: 'Sudan', ar: 'السودان' }, region: { en: 'Africa', ar: 'أفريقيا' }, lon: 30.2, lat: 15.5 },
  { id: 'ethiopia', flagCode: 'et', geoName: 'Ethiopia', name: { en: 'Ethiopia', ar: 'إثيوبيا' }, region: { en: 'Africa', ar: 'أفريقيا' }, lon: 40.5, lat: 9.1 },
  { id: 'mozambique', flagCode: 'mz', geoName: 'Mozambique', name: { en: 'Mozambique', ar: 'موزمبيق' }, region: { en: 'Africa', ar: 'أفريقيا' }, lon: 35.5, lat: -18.7 },
  { id: 'zambia', flagCode: 'zm', geoName: 'Zambia', name: { en: 'Zambia', ar: 'زامبيا' }, region: { en: 'Africa', ar: 'أفريقيا' }, lon: 27.8, lat: -13.1 },
  { id: 'albania', flagCode: 'al', geoName: 'Albania', name: { en: 'Albania', ar: 'ألبانيا' }, region: { en: 'Europe', ar: 'أوروبا' }, lon: 20.2, lat: 41.2 },
  { id: 'northern-cyprus', flagCode: 'tr', geoName: 'Cyprus', name: { en: 'Northern Cyprus', ar: 'شمال قبرص' }, region: { en: 'Mediterranean', ar: 'البحر المتوسط' }, lon: 33.4, lat: 35.2 },
];

const copy = {
  en: {
    eyebrow: 'Across borders',
    title: 'One practice. A world of context.',
    intro: 'Select a country to explore the footprint of BECT expertise across markets, cultures and complex environments.',
    select: 'Select a market',
    active: 'Active market',
    countries: 'markets',
    caption: 'Global experience, locally informed.',
  },
  ar: {
    eyebrow: 'عبر الحدود',
    title: 'خبرة واحدة. وسياقات عالمية.',
    intro: 'اختر دولة لاستكشاف امتداد خبرات BECT عبر الأسواق والثقافات والبيئات المعقدة.',
    select: 'اختر سوقًا',
    active: 'السوق المحدد',
    countries: 'سوقًا',
    caption: 'خبرة عالمية برؤية محلية.',
  },
};

const MAP_WIDTH = 1000;
const MAP_HEIGHT = 500;

const projectPoint = ([longitude, latitude]) => [
  ((longitude + 180) / 360) * MAP_WIDTH,
  ((90 - latitude) / 180) * MAP_HEIGHT,
];

function ringToPath(ring) {
  let previousX = null;
  return ring.map((point, index) => {
    const [x, y] = projectPoint(point);
    const command = index === 0 || (previousX !== null && Math.abs(x - previousX) > MAP_WIDTH / 2) ? 'M' : 'L';
    previousX = x;
    return `${command}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
}

function geometryToPath(geometry) {
  const polygons = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates;
  return polygons.map((polygon) => polygon.map((ring) => `${ringToPath(ring)} Z`).join(' ')).join(' ');
}

function flagUrl(code) {
  return `https://flagcdn.com/${code}.svg`;
}

function WorldMap({ selected, language }) {
  const [markerX, markerY] = projectPoint([selected.lon, selected.lat]);
  const labelWidth = Math.max(92, Math.min(170, selected.name[language].length * (language === 'ar' ? 11 : 7.2) + 48));

  return (
    <svg
      className="presence-map-svg"
      viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={selected.name[language]}
    >
      <defs>
        <linearGradient id="presenceLandGradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2a88aa" stopOpacity=".38" />
          <stop offset="1" stopColor="#65c9e8" stopOpacity=".12" />
        </linearGradient>
        <filter id="presenceGlow" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="7" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="presenceShadow" x="-30%" y="-40%" width="160%" height="190%">
          <feDropShadow dx="0" dy="6" stdDeviation="7" floodColor="#00131f" floodOpacity=".48" />
        </filter>
        <clipPath id="presenceFlagClip">
          <rect x={markerX - labelWidth / 2 + 10} y={markerY - 86} width="27" height="18" rx="3" />
        </clipPath>
      </defs>

      <g className="presence-grid">
        <path d="M0 83.3h1000M0 166.6h1000M0 250h1000M0 333.3h1000M0 416.6h1000" />
        <path d="M166.6 0v500M333.3 0v500M500 0v500M666.6 0v500M833.3 0v500" />
      </g>

      <g className="presence-land">
        {worldMap.features
          .filter((feature) => feature.properties.name !== 'Antarctica')
          .map((feature) => (
            <path
              key={feature.properties.name}
              d={geometryToPath(feature.geometry)}
              className={feature.properties.name === selected.geoName ? 'is-selected' : ''}
              vectorEffect="non-scaling-stroke"
            />
          ))}
      </g>

      <g key={selected.id} className="presence-svg-marker" transform={`translate(${markerX} ${markerY})`}>
        <circle className="presence-svg-pulse" r="18" />
        <path className="presence-pin-shape" d="M0 17c-4.5-6.4-14-15.2-14-27a14 14 0 1 1 28 0c0 11.8-9.5 20.6-14 27Z" />
        <circle className="presence-pin-center" cy="-10" r="4.3" />

        <g className="presence-pin-label" transform={`translate(${-labelWidth / 2} -94)`} filter="url(#presenceShadow)">
          <rect width={labelWidth} height="36" rx="10" />
          <image href={flagUrl(selected.flagCode)} x="10" y="9" width="27" height="18" preserveAspectRatio="xMidYMid slice" />
          <text
            x={language === 'ar' ? labelWidth - 11 : 46}
            y="23"
            textAnchor={language === 'ar' ? 'end' : 'start'}
            direction={language === 'ar' ? 'rtl' : 'ltr'}
          >
            {selected.name[language]}
          </text>
          <path d={`M${labelWidth / 2 - 6} 36h12l-6 7Z`} />
        </g>
      </g>
    </svg>
  );
}

function GlobalPresenceSection({ language = 'en' }) {
  const [selectedId, setSelectedId] = useState('egypt');
  const isArabic = language === 'ar';
  const text = copy[language];
  const selected = useMemo(
    () => countries.find((country) => country.id === selectedId) || countries[0],
    [selectedId],
  );

  return (
    <Box component="section" className="presence-section" dir={isArabic ? 'rtl' : 'ltr'}>
      <Container maxWidth="xl" className="presence-shell">
        <Box className="presence-header">
          <Box>
            <Typography className="presence-eyebrow">{text.eyebrow}</Typography>
            <Typography component="h2" className="presence-title">{text.title}</Typography>
          </Box>
          <Typography className="presence-intro">{text.intro}</Typography>
        </Box>

        <Box className="presence-console">
          <Box className="presence-map">
            <WorldMap selected={selected} language={language} />
            <Box className="presence-coordinate" aria-hidden="true">
              <span>{Math.abs(selected.lat).toFixed(1)}°{selected.lat >= 0 ? 'N' : 'S'}</span>
              <i />
              <span>{Math.abs(selected.lon).toFixed(1)}°{selected.lon >= 0 ? 'E' : 'W'}</span>
            </Box>
            <Typography className="presence-map-caption">{text.caption}</Typography>
          </Box>

          <Box className="presence-panel">
            <Box className="presence-panel-top">
              <PublicRounded />
              <Typography>{countries.length} {text.countries}</Typography>
            </Box>

            <Box className="presence-selected">
              <Typography className="presence-selected-label">{text.active}</Typography>
              <Box
                component="img"
                className="presence-selected-flag"
                src={flagUrl(selected.flagCode)}
                alt=""
              />
              <Typography component="h3">{selected.name[language]}</Typography>
              <Typography>{selected.region[language]}</Typography>
            </Box>

            <Typography className="presence-select-label">{text.select}</Typography>
            <Box className="presence-flags">
              {countries.map((country) => (
                <button
                  type="button"
                  key={country.id}
                  className={selectedId === country.id ? 'is-active' : ''}
                  onClick={() => setSelectedId(country.id)}
                  aria-pressed={selectedId === country.id}
                  aria-label={country.name[language]}
                  title={country.name[language]}
                >
                  <img src={flagUrl(country.flagCode)} alt="" />
                  <small>{country.flagCode.toUpperCase()}</small>
                </button>
              ))}
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

export default GlobalPresenceSection;
