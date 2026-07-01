import React, { useMemo, useState } from 'react';
import { Box, Container, Typography } from '@mui/material';
import PublicRounded from '@mui/icons-material/PublicRounded';
import worldMap from '../assets/world.json';
import './GlobalPresenceSection.css';

const OFFICE_IDS = new Set(['egypt', 'saudi']);

const countries = [
  { id: 'egypt', flagCode: 'eg', geoName: 'Egypt', name: { en: 'Egypt', ar: 'مصر' }, region: { en: 'North Africa', ar: 'شمال أفريقيا' }, lon: 31.2357, lat: 30.0444, label: { dx: -118, dy: -50 }, labelAr: { dx: -128, dy: -54 } },
  { id: 'saudi', flagCode: 'sa', geoName: 'Saudi Arabia', name: { en: 'Saudi Arabia', ar: 'السعودية' }, region: { en: 'Middle East', ar: 'الشرق الأوسط' }, lon: 46.6753, lat: 24.7136, label: { dx: 24, dy: -46 }, labelAr: { dx: 28, dy: 14 } },
  { id: 'uae', flagCode: 'ae', geoName: 'United Arab Emirates', name: { en: 'UAE', ar: 'الإمارات' }, region: { en: 'Middle East', ar: 'الشرق الأوسط' }, lon: 54.3773, lat: 24.4539, label: { dx: 18, dy: 16 }, labelAr: { dx: 18, dy: 28 } },
  { id: 'oman', flagCode: 'om', geoName: 'Oman', name: { en: 'Oman', ar: 'عمان' }, region: { en: 'Middle East', ar: 'الشرق الأوسط' }, lon: 58.4059, lat: 23.588, label: { dx: 18, dy: 28 }, labelAr: { dx: 20, dy: 34 } },
  { id: 'kuwait', flagCode: 'kw', geoName: 'Kuwait', name: { en: 'Kuwait', ar: 'الكويت' }, region: { en: 'Middle East', ar: 'الشرق الأوسط' }, lon: 47.9783, lat: 29.3759, label: { dx: 16, dy: -30 }, labelAr: { dx: 20, dy: -38 } },
  { id: 'iraq', flagCode: 'iq', geoName: 'Iraq', name: { en: 'Iraq', ar: 'العراق' }, region: { en: 'Middle East', ar: 'الشرق الأوسط' }, lon: 44.3661, lat: 33.3152, label: { dx: 16, dy: -16 }, labelAr: { dx: 18, dy: -22 } },
  { id: 'syria', flagCode: 'sy', geoName: 'Syria', name: { en: 'Syria', ar: 'سوريا' }, region: { en: 'Middle East', ar: 'الشرق الأوسط' }, lon: 36.2765, lat: 33.5138, label: { dx: -72, dy: -30 }, labelAr: { dx: -88, dy: -42 } },
  { id: 'libya', flagCode: 'ly', geoName: 'Libya', name: { en: 'Libya', ar: 'ليبيا' }, region: { en: 'North Africa', ar: 'شمال أفريقيا' }, lon: 13.1913, lat: 32.8872, label: { dx: -76, dy: 14 }, labelAr: { dx: -90, dy: 16 } },
  { id: 'morocco', flagCode: 'ma', geoName: 'Morocco', name: { en: 'Morocco', ar: 'المغرب' }, region: { en: 'North Africa', ar: 'شمال أفريقيا' }, lon: -6.8498, lat: 33.9716, label: { dx: -82, dy: -28 }, labelAr: { dx: -96, dy: -34 } },
  { id: 'algeria', flagCode: 'dz', geoName: 'Algeria', name: { en: 'Algeria', ar: 'الجزائر' }, region: { en: 'North Africa', ar: 'شمال أفريقيا' }, lon: 3.0588, lat: 36.7538, label: { dx: -78, dy: 12 }, labelAr: { dx: -94, dy: 12 } },
  { id: 'sudan', flagCode: 'sd', geoName: 'Sudan', name: { en: 'Sudan', ar: 'السودان' }, region: { en: 'Africa', ar: 'أفريقيا' }, lon: 32.5599, lat: 15.5007, label: { dx: -74, dy: 18 }, labelAr: { dx: -96, dy: 20 } },
  { id: 'ethiopia', flagCode: 'et', geoName: 'Ethiopia', name: { en: 'Ethiopia', ar: 'إثيوبيا' }, region: { en: 'Africa', ar: 'أفريقيا' }, lon: 38.7578, lat: 8.9806, label: { dx: 16, dy: 18 }, labelAr: { dx: 18, dy: 20 } },
  { id: 'mozambique', flagCode: 'mz', geoName: 'Mozambique', name: { en: 'Mozambique', ar: 'موزمبيق' }, region: { en: 'Africa', ar: 'أفريقيا' }, lon: 32.5732, lat: -25.9692, label: { dx: 18, dy: 18 }, labelAr: { dx: 18, dy: 20 } },
  { id: 'zambia', flagCode: 'zm', geoName: 'Zambia', name: { en: 'Zambia', ar: 'زامبيا' }, region: { en: 'Africa', ar: 'أفريقيا' }, lon: 28.3228, lat: -15.3875, label: { dx: -76, dy: 16 }, labelAr: { dx: -92, dy: 18 } },
  { id: 'albania', flagCode: 'al', geoName: 'Albania', name: { en: 'Albania', ar: 'ألبانيا' }, region: { en: 'Europe', ar: 'أوروبا' }, lon: 19.8187, lat: 41.3275, label: { dx: -78, dy: -24 }, labelAr: { dx: -94, dy: -30 } },
  { id: 'northern-cyprus', flagCode: 'tr', geoName: 'Cyprus', name: { en: 'Northern Cyprus', ar: 'شمال قبرص' }, region: { en: 'Mediterranean', ar: 'البحر المتوسط' }, lon: 33.3823, lat: 35.1856, label: { dx: 16, dy: -38 }, labelAr: { dx: 20, dy: -54 } },
];

const copy = {
  en: {
    eyebrow: 'Across borders',
    title: 'One practice. A world of context.',
    intro: 'Our offices in Egypt and Saudi Arabia anchor a regional network of active markets, local partnerships and complex delivery environments.',
    offices: 'Our Offices',
    officeLocations: 'Office Locations',
    activeMarkets: 'Active Markets',
    select: 'Explore markets',
    countries: 'markets',
    caption: 'Global experience, locally informed.',
  },
  ar: {
    eyebrow: 'عبر الحدود',
    title: 'خبرة واحدة. وسياقات عالمية.',
    intro: 'ترتكز مكاتبنا في مصر والسعودية على شبكة إقليمية من الأسواق النشطة والشراكات المحلية وبيئات التنفيذ المعقدة.',
    offices: 'مكاتبنا',
    officeLocations: 'مواقع المكاتب',
    activeMarkets: 'الأسواق النشطة',
    select: 'استكشف الأسواق',
    countries: 'سوقاً',
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

function markerLabelWidth(country, language, isOffice) {
  const textLength = country.name[language].length;
  const characterWidth = language === 'ar' ? 9.4 : 6.2;
  return Math.max(isOffice ? 96 : 78, Math.min(isOffice ? 154 : 128, textLength * characterWidth + (isOffice ? 58 : 46)));
}

function WorldMap({ activeId, selectedId, hasSelectedMarket, setHoveredId, setSelectedId, language }) {
  const selectedCountry = countries.find((country) => country.id === selectedId) || countries[0];

  return (
    <svg
      className="presence-map-svg"
      viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={selectedCountry.name[language]}
    >
      <defs>
        <linearGradient id="presenceLandGradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2a88aa" stopOpacity=".38" />
          <stop offset="1" stopColor="#65c9e8" stopOpacity=".12" />
        </linearGradient>
        <filter id="presenceGlow" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="presenceSoftShadow" x="-60%" y="-70%" width="220%" height="240%">
          <feDropShadow dx="0" dy="9" stdDeviation="8" floodColor="#00131f" floodOpacity=".45" />
        </filter>
      </defs>

      <g className="presence-grid">
        <path d="M0 83.3h1000M0 166.6h1000M0 250h1000M0 333.3h1000M0 416.6h1000" />
        <path d="M166.6 0v500M333.3 0v500M500 0v500M666.6 0v500M833.3 0v500" />
      </g>

      <g className="presence-land">
        {worldMap.features
          .filter((feature) => feature.properties.name !== 'Antarctica')
          .map((feature) => {
            const market = countries.find((country) => country.geoName === feature.properties.name);
            const isOffice = market && OFFICE_IDS.has(market.id);
            const isActiveMarket = market && market.id === activeId && !isOffice;

            return (
              <path
                key={feature.properties.name}
                d={geometryToPath(feature.geometry)}
                className={`${isOffice ? 'is-office' : ''} ${isActiveMarket ? 'is-active-market' : ''}`}
                vectorEffect="non-scaling-stroke"
              />
            );
          })}
      </g>

      <g className="presence-markers">
        {countries.map((country) => {
          const isOffice = OFFICE_IDS.has(country.id);
          const isActive = isOffice || activeId === country.id;
          const [x, y] = projectPoint([country.lon, country.lat]);
          const labelWidth = markerLabelWidth(country, language, isOffice);
          const labelHeight = isOffice ? 34 : 24;
          const { dx, dy } = language === 'ar' && country.labelAr ? country.labelAr : country.label;
          const shouldShowLabel = hasSelectedMarket ? country.id === selectedId : isOffice;

          return (
            <g
              key={country.id}
              className={`presence-country-marker ${isOffice ? 'is-office' : 'is-market'} ${isActive ? 'is-active' : ''}`}
              transform={`translate(${x.toFixed(1)} ${y.toFixed(1)})`}
              onMouseEnter={() => setHoveredId(country.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => setSelectedId(country.id)}
              onFocus={() => setHoveredId(country.id)}
              onBlur={() => setHoveredId(null)}
              tabIndex="0"
              role="button"
              aria-label={country.name[language]}
            >
              <circle className="presence-marker-halo" r={isOffice ? 15 : 9} />
              <circle className="presence-marker-ring" r={isOffice ? 8.5 : 5.4} />
              <circle className="presence-marker-dot" r={isOffice ? 4.6 : 3.2} />
              <g
                className={`presence-marker-label ${shouldShowLabel ? 'is-visible' : ''}`}
                transform={`translate(${dx} ${dy})`}
                filter={shouldShowLabel ? 'url(#presenceSoftShadow)' : undefined}
              >
                <foreignObject width={labelWidth} height={labelHeight}>
                  <div
                    className={`presence-label-pill ${isOffice ? 'is-office' : 'is-market'}`}
                    dir={language === 'ar' ? 'rtl' : 'ltr'}
                    xmlns="http://www.w3.org/1999/xhtml"
                  >
                    <img src={flagUrl(country.flagCode)} alt="" />
                    <span>{country.name[language]}</span>
                  </div>
                </foreignObject>
              </g>
            </g>
          );
        })}
      </g>
    </svg>
  );
}

function GlobalPresenceSection({ language = 'en' }) {
  const [selectedId, setSelectedId] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);
  const isArabic = language === 'ar';
  const text = copy[language];
  const activeId = hoveredId || selectedId;
  const hasSelectedMarket = Boolean(selectedId);
  const selected = useMemo(
    () => countries.find((country) => country.id === selectedId) || countries[0],
    [selectedId],
  );
  const officeCountries = useMemo(() => countries.filter((country) => OFFICE_IDS.has(country.id)), []);

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
            <WorldMap
              activeId={activeId}
              selectedId={selectedId}
              hasSelectedMarket={hasSelectedMarket}
              setHoveredId={setHoveredId}
              setSelectedId={setSelectedId}
              language={language}
            />
            <Box className="presence-coordinate" aria-hidden="true">
              <span>{Math.abs(selected.lat).toFixed(1)}°{selected.lat >= 0 ? 'N' : 'S'}</span>
              <i />
              <span>{Math.abs(selected.lon).toFixed(1)}°{selected.lon >= 0 ? 'E' : 'W'}</span>
            </Box>
            <Box className="presence-map-legend" aria-label={text.officeLocations}>
              <span className="presence-legend-dot is-office" />
              <Typography component="span">{text.officeLocations}</Typography>
              <span className="presence-legend-dot is-market" />
              <Typography component="span">{text.activeMarkets}</Typography>
            </Box>
            <Typography className="presence-map-caption">{text.caption}</Typography>
          </Box>

          <Box className="presence-panel">
            <Box className="presence-panel-top">
              <PublicRounded />
              <Typography>{countries.length} {text.countries}</Typography>
            </Box>

            <Box className="presence-office-block">
              <Typography className="presence-selected-label">{text.offices}</Typography>
              <Box className="presence-office-list">
                {officeCountries.map((country) => (
                  <button
                    type="button"
                    key={country.id}
                    className={selectedId === country.id ? 'is-active' : ''}
                    onMouseEnter={() => setHoveredId(country.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    onFocus={() => setHoveredId(country.id)}
                    onBlur={() => setHoveredId(null)}
                    onClick={() => setSelectedId(country.id)}
                  >
                    <img src={flagUrl(country.flagCode)} alt="" />
                    <span>
                      <strong>{country.name[language]}</strong>
                      <small>{country.region[language]}</small>
                    </span>
                  </button>
                ))}
              </Box>
            </Box>

            <Typography className="presence-select-label">{text.select}</Typography>
            <Box className="presence-flags">
              {countries.map((country) => {
                const isOffice = OFFICE_IDS.has(country.id);

                return (
                  <button
                    type="button"
                    key={country.id}
                    className={`${selectedId === country.id ? 'is-active' : ''} ${isOffice ? 'is-office' : ''}`}
                    onMouseEnter={() => setHoveredId(country.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    onFocus={() => setHoveredId(country.id)}
                    onBlur={() => setHoveredId(null)}
                    onClick={() => setSelectedId(country.id)}
                    aria-pressed={selectedId === country.id}
                    aria-label={country.name[language]}
                    title={country.name[language]}
                  >
                    <img src={flagUrl(country.flagCode)} alt="" />
                    <small>{country.flagCode.toUpperCase()}</small>
                  </button>
                );
              })}
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

export default GlobalPresenceSection;
