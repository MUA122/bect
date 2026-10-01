import React, { useEffect, useRef, useState } from "react";
import ArrowForwardRounded from "@mui/icons-material/ArrowForwardRounded";
import CalendarMonthOutlined from "@mui/icons-material/CalendarMonthOutlined";
import LocationOnOutlined from "@mui/icons-material/LocationOnOutlined";
import "./TrialPage.css";

const EVENT_START = new Date("2026-11-16T12:00:00+03:00").getTime();
const ROTATION_INTERVAL = 5000;

const eventCopy = {
  en: {
    announcement: "Cityscape Riyadh 2026 announcement",
    brand: "BECT Architects and Engineers",
    heading: "WE’RE HEADING TO",
    title: "Cityscape",
    cityYear: "RIYADH 2026",
    details: "Event details",
    monthYear: "NOVEMBER 2026",
    city: "RIYADH",
    country: "SAUDI ARABIA",
    countdown: "COUNTDOWN TO CITYSCAPE RIYADH 2026",
    units: { days: "days", hours: "hours", minutes: "minutes", seconds: "seconds" },
    remaining: "remaining",
    pass: "Get Your Free Pass!",
    photos: "BECT at Cityscape event photographs",
    gallery: "From Our Gallery — Cityscape 2025",
  },
  ar: {
    announcement: "إعلان سيتي سكيب الرياض 2026",
    brand: "بيكت للاستشارات الهندسية",
    heading: "نلتقي بكم في",
    title: "سيتي سكيب",
    cityYear: "الرياض 2026",
    details: "تفاصيل الفعالية",
    monthYear: "نوفمبر 2026",
    city: "الرياض",
    country: "المملكة العربية السعودية",
    countdown: "العد التنازلي لسيتي سكيب الرياض 2026",
    units: { days: "أيام", hours: "ساعات", minutes: "دقائق", seconds: "ثوانٍ" },
    remaining: "الوقت المتبقي",
    pass: "احصل على تذكرتك المجانية",
    photos: "صور مشاركة بيكت في سيتي سكيب",
    gallery: "من مشاركتنا في سيتي سكيب 2025",
  },
};

const eventPhotos = [
  {
    src: "/trial/hq/demo-master.png",
    mobileSrc: "/trial/mobile/demo-master.png",
    alt: "BECT representatives demonstrating a project display to a visitor at the Cityscape exhibition booth",
    altAr: "ممثلو بيكت يعرضون أحد المشاريع لزائر في جناح الشركة بمعرض سيتي سكيب",
    position: "45% 52%",
    mobilePosition: "48% 50%",
    overlay: 0.07,
  },
  {
    src: "/trial/hq/team-master.png",
    mobileSrc: "/trial/mobile/team-master.png",
    alt: "BECT team members together at the company Cityscape exhibition booth",
    altAr: "فريق بيكت في جناح الشركة بمعرض سيتي سكيب",
    position: "47% 51%",
    mobilePosition: "47% 50%",
    overlay: 0.09,
  },
  {
    src: "/trial/hq/conversation-master.png",
    mobileSrc: "/trial/mobile/conversation-master.png",
    alt: "BECT representatives in conversation with a visitor at Cityscape",
    altAr: "ممثلو بيكت يتحدثون مع أحد زوار معرض سيتي سكيب",
    position: "52% 45%",
    mobilePosition: "52% 43%",
    overlay: 0.1,
  },
];

function getCountdown() {
  const remaining = Math.max(0, EVENT_START - Date.now());
  return {
    days: Math.floor(remaining / 86_400_000),
    hours: Math.floor((remaining / 3_600_000) % 24),
    minutes: Math.floor((remaining / 60_000) % 60),
    seconds: Math.floor((remaining / 1000) % 60),
  };
}

function useCountdown() {
  const [countdown, setCountdown] = useState(getCountdown);

  useEffect(() => {
    const update = () => setCountdown(getCountdown());
    const timer = window.setInterval(update, 1000);
    update();
    return () => window.clearInterval(timer);
  }, []);

  return countdown;
}

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener?.("change", update);
    return () => media.removeEventListener?.("change", update);
  }, []);

  return reduced;
}

function BrandLockup({ text }) {
  return (
    <div className="trial-brand" aria-label={text.brand}>
      <div className="trial-wordmark trial-wordmark-en" lang="en" dir="ltr">
        <strong>BECT</strong>
        <span>Architects &amp; Engineers</span>
      </div>
      <span className="trial-brand-divider" aria-hidden="true" />
      <div className="trial-wordmark trial-wordmark-ar" lang="ar" dir="rtl">
        <strong aria-label="بيكت">ٮيكت</strong>
        <span>للاستشارات الهندسية</span>
      </div>
    </div>
  );
}

function EventDetails({ text }) {
  return (
    <div className="trial-event-details" aria-label={text.details}>
      <div className="trial-event-detail">
        <CalendarMonthOutlined aria-hidden="true" />
        <span>
          <strong><bdi dir="ltr">16 – 19</bdi></strong>
          <small>{text.monthYear}</small>
        </span>
      </div>
      <span className="trial-detail-divider" aria-hidden="true" />
      <div className="trial-event-detail">
        <LocationOnOutlined aria-hidden="true" />
        <span>
          <strong>{text.city}</strong>
          <small>{text.country}</small>
        </span>
      </div>
    </div>
  );
}

function Countdown({ text }) {
  const countdown = useCountdown();
  const units = [
    ["days", countdown.days],
    ["hours", countdown.hours],
    ["minutes", countdown.minutes],
    ["seconds", countdown.seconds],
  ];

  return (
    <section
      className="trial-countdown"
      aria-label={text.countdown}
    >
      <p>{text.countdown}</p>
      <div className="trial-countdown-row">
        <div
          className="trial-countdown-values"
          role="timer"
          aria-label={`${text.remaining}: ${units.map(([unit, value]) => `${value} ${text.units[unit]}`).join("، ")}`}
        >
          {units.map(([label, value]) => (
            <div className="trial-countdown-unit" key={label}>
              <strong dir="ltr">
                {label === "days" ? value : String(value).padStart(2, "0")}
              </strong>
              <span>{text.units[label]}</span>
            </div>
          ))}
        </div>
        <a
          className="trial-cta"
          href="https://cityscapeglobal.com/visit/tickets"
          target="_blank"
          rel="noreferrer"
        >
          <span>{text.pass}</span>
          <ArrowForwardRounded aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}

function EventPhotoCarousel({ text, isArabic }) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % eventPhotos.length);
    }, ROTATION_INTERVAL);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const preload = (photo) => {
      const image = new Image();
      image.decoding = "async";
      image.src = window.matchMedia("(max-width: 899px)").matches
        ? photo.mobileSrc
        : photo.src;
    };

    preload(eventPhotos[1]);
    const loadRemaining = () => eventPhotos.slice(2).forEach(preload);
    const idleId = window.requestIdleCallback?.(loadRemaining, {
      timeout: 1800,
    });
    const timer = idleId ? null : window.setTimeout(loadRemaining, 1200);

    return () => {
      if (idleId) window.cancelIdleCallback?.(idleId);
      if (timer) window.clearTimeout(timer);
    };
  }, []);

  return (
    <section
      className="trial-photo-stage"
      aria-label={text.photos}
    >
      <div className="trial-photo-stack">
        {eventPhotos.map((photo, index) => (
          <figure
            className={`trial-photo${activeIndex === index ? " is-active" : ""}`}
            aria-hidden={activeIndex !== index}
            key={photo.src}
            style={{
              "--photo-position": photo.position,
              "--photo-mobile-position": photo.mobilePosition,
              "--photo-overlay": photo.overlay,
            }}
          >
            <picture>
              <source media="(max-width: 899px)" srcSet={photo.mobileSrc} />
              <img
                src={photo.src}
                alt={activeIndex === index ? (isArabic ? photo.altAr : photo.alt) : ""}
                loading={index < 2 ? "eager" : "lazy"}
                fetchPriority={index === 0 ? "high" : "auto"}
                decoding={index === 0 ? "sync" : "async"}
                draggable="false"
              />
            </picture>
            <span aria-hidden="true" />
          </figure>
        ))}
      </div>

      <p
        className="trial-gallery-caption"
      >
        {text.gallery}
      </p>
    </section>
  );
}

export default function CityscapeSection({ language = "en" }) {
  const isArabic = language === "ar";
  const text = eventCopy[isArabic ? "ar" : "en"];
  const [ready, setReady] = useState(false);
  const heroRef = useRef(null);
  const frameRef = useRef(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => setReady(true));
    });
    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, []);

  const handlePointerMove = (event) => {
    if (reducedMotion || !heroRef.current) return;
    const bounds = heroRef.current.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    window.cancelAnimationFrame(frameRef.current);
    frameRef.current = window.requestAnimationFrame(() => {
      heroRef.current?.style.setProperty("--parallax-x", x.toFixed(3));
      heroRef.current?.style.setProperty("--parallax-y", y.toFixed(3));
    });
  };

  return (
    <section
      id="cityscape-2026"
      className="trial-page cityscape-home-section"
      aria-label={text.announcement}
      lang={isArabic ? "ar" : "en"}
      dir={isArabic ? "rtl" : "ltr"}
    >
      <section
        className={`trial-hero${ready ? " is-ready" : ""}`}
        ref={heroRef}
        onPointerMove={handlePointerMove}
        onPointerLeave={() => {
          heroRef.current?.style.setProperty("--parallax-x", "0");
          heroRef.current?.style.setProperty("--parallax-y", "0");
        }}
        aria-labelledby="cityscape-title"
      >
        <picture className="trial-city-stage" aria-hidden="true">
          <img
            src="/trial/hq/riyadh-background-v2.png"
            alt=""
            fetchPriority="high"
            decoding="sync"
          />
        </picture>
        <div className="trial-white-plane" aria-hidden="true" />
        <div className="trial-skyline-wash" aria-hidden="true" />

        <div className="trial-content">
          <BrandLockup text={text} />
          <div className="trial-heading-block">
            <p>{text.heading}</p>
            <h1 id="cityscape-title">
              <span>{text.title}</span>
              <strong>{text.cityYear}</strong>
            </h1>
          </div>
          <EventDetails text={text} />
        </div>

        <EventPhotoCarousel text={text} isArabic={isArabic} />

        <Countdown text={text} />
      </section>
    </section>
  );
}
