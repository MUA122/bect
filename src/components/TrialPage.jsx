import React, { useEffect, useRef, useState } from "react";
import ArrowForwardRounded from "@mui/icons-material/ArrowForwardRounded";
import CalendarMonthOutlined from "@mui/icons-material/CalendarMonthOutlined";
import LocationOnOutlined from "@mui/icons-material/LocationOnOutlined";
import "./TrialPage.css";

const EVENT_START = new Date("2026-11-16T12:00:00+03:00").getTime();
const ROTATION_INTERVAL = 5000;

const eventPhotos = [
  {
    src: "/trial/hq/demo-master.png",
    alt: "BECT representatives demonstrating a project display to a visitor at the Cityscape exhibition booth",
    position: "45% 52%",
    mobilePosition: "48% 50%",
    overlay: 0.07,
  },
  {
    src: "/trial/hq/team-master.png",
    alt: "BECT team members together at the company Cityscape exhibition booth",
    position: "47% 51%",
    mobilePosition: "47% 50%",
    overlay: 0.09,
  },
  {
    src: "/trial/hq/conversation-master.png",
    alt: "BECT representatives in conversation with a visitor at Cityscape",
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

function BrandLockup() {
  return (
    <div className="trial-brand" aria-label="BECT Architects and Engineers">
      <div className="trial-wordmark trial-wordmark-en">
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

function EventDetails() {
  return (
    <div className="trial-event-details" aria-label="Event details">
      <div className="trial-event-detail">
        <CalendarMonthOutlined aria-hidden="true" />
        <span>
          <strong>16 – 19</strong>
          <small>NOVEMBER 2026</small>
        </span>
      </div>
      <span className="trial-detail-divider" aria-hidden="true" />
      <div className="trial-event-detail">
        <LocationOnOutlined aria-hidden="true" />
        <span>
          <strong>RIYADH</strong>
          <small>SAUDI ARABIA</small>
        </span>
      </div>
    </div>
  );
}

function Countdown() {
  const countdown = useCountdown();
  const units = [
    ["days", countdown.days],
    ["hours", countdown.hours],
    ["minutes", countdown.minutes],
    ["seconds", countdown.seconds],
  ];

  return (
    <section className="trial-countdown" aria-label="Countdown to Cityscape Riyadh 2026">
      <p>COUNTDOWN TO CITYSCAPE RIYADH 2026</p>
      <div className="trial-countdown-row">
        <div
          className="trial-countdown-values"
          role="timer"
          aria-label={`${countdown.days} days, ${countdown.hours} hours, ${countdown.minutes} minutes and ${countdown.seconds} seconds remaining`}
        >
          {units.map(([label, value]) => (
            <div className="trial-countdown-unit" key={label}>
              <strong>{label === "days" ? value : String(value).padStart(2, "0")}</strong>
              <span>{label}</span>
            </div>
          ))}
        </div>
        <a
          className="trial-cta"
          href="https://cityscapeglobal.com/visit/tickets"
          target="_blank"
          rel="noreferrer"
        >
          <span>MEET US THERE</span>
          <ArrowForwardRounded aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}

function EventPhotoCarousel() {
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
      image.src = photo.src;
    };

    preload(eventPhotos[1]);
    const loadRemaining = () => eventPhotos.slice(2).forEach(preload);
    const idleId = window.requestIdleCallback?.(loadRemaining, { timeout: 1800 });
    const timer = idleId ? null : window.setTimeout(loadRemaining, 1200);

    return () => {
      if (idleId) window.cancelIdleCallback?.(idleId);
      if (timer) window.clearTimeout(timer);
    };
  }, []);

  return (
    <section
      className="trial-photo-stage"
      aria-label="BECT at Cityscape event photographs"
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
            <img
              src={photo.src}
              alt={activeIndex === index ? photo.alt : ""}
              loading={index < 2 ? "eager" : "lazy"}
              fetchPriority={index === 0 ? "high" : "auto"}
              decoding={index === 0 ? "sync" : "async"}
              draggable="false"
            />
            <span aria-hidden="true" />
          </figure>
        ))}
      </div>

      <p
        className="trial-gallery-caption"
        aria-label="From Our Gallery — Cityscape 2025"
      >
        From Our Gallery — Cityscape 2025
      </p>

    </section>
  );
}

export default function TrialPage() {
  const [ready, setReady] = useState(false);
  const heroRef = useRef(null);
  const frameRef = useRef(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const originalTitle = document.title;
    document.title = "Cityscape Riyadh 2026 | BECT";
    const frame = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => setReady(true));
    });
    return () => {
      document.title = originalTitle;
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
    <main className="trial-page">
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
          <BrandLockup />
          <div className="trial-heading-block">
            <p>WE’RE HEADING TO</p>
            <h1 id="cityscape-title">
              <span>Cityscape</span>
              <strong>RIYADH 2026</strong>
            </h1>
          </div>
          <EventDetails />
        </div>

        <EventPhotoCarousel />

        <Countdown />
      </section>
    </main>
  );
}
