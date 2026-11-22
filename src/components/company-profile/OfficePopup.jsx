import React, { useLayoutEffect, useRef } from "react";
import ArrowForwardRounded from "@mui/icons-material/ArrowForwardRounded";
import CloseRounded from "@mui/icons-material/CloseRounded";
import NearMeOutlined from "@mui/icons-material/NearMeOutlined";
import PhoneOutlined from "@mui/icons-material/PhoneOutlined";
import PlaceOutlined from "@mui/icons-material/PlaceOutlined";
import "./office-popup.css";

function isBackdrop(event) {
  if (event.target !== event.currentTarget) return false;
  const rect = event.currentTarget.getBoundingClientRect();
  return event.clientX < rect.left || event.clientX > rect.right ||
    event.clientY < rect.top || event.clientY > rect.bottom;
}

export default function OfficePopup({ office, language, id, onClose }) {
  const dialog = useRef(null);
  const closeButton = useRef(null);
  const contactLink = useRef(null);
  const backdropPressed = useRef(false);
  const closeTimer = useRef(null);
  const officeId = office?.id;
  const arabic = language === "ar";

  useLayoutEffect(() => {
    if (!officeId) return;
    const node = dialog.current;
    const viewport = window.visualViewport;
    const fitZoom = () => {
      node.toggleAttribute("data-zoomed", viewport.scale > 1);
      if (viewport.scale <= 1) return;
      node.style.setProperty("--zoom-center-x", `${viewport.offsetLeft + viewport.width / 2}px`);
      node.style.setProperty("--zoom-center-y", `${viewport.offsetTop + viewport.height / 2}px`);
      node.style.setProperty("--zoom-width", `${viewport.width}px`);
      node.style.setProperty("--zoom-height", `${viewport.height}px`);
    };
    if (viewport) {
      fitZoom();
      viewport.addEventListener("resize", fitZoom);
      viewport.addEventListener("scroll", fitZoom);
    }
    node.showModal();
    closeButton.current.focus({ preventScroll: true });
    return () => {
      window.clearTimeout(closeTimer.current);
      viewport?.removeEventListener("resize", fitZoom);
      viewport?.removeEventListener("scroll", fitZoom);
      backdropPressed.current = false;
      if (node.open) node.close();
    };
  }, [officeId]);

  if (!office) return null;

  function dismiss() {
    const node = dialog.current;
    if (!node.open || node.dataset.closing) return;
    node.dataset.closing = "true";
    const finish = () => {
      node.close();
      onClose();
    };
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) finish();
    else closeTimer.current = window.setTimeout(finish, 150);
  }

  function handleTab(event) {
    if (event.key !== "Tab") return;
    const first = closeButton.current;
    const last = contactLink.current;
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  const directions = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(office.destination)}`;
  return <dialog key={office.id} id={id} ref={dialog} className="cp-office-popup"
    dir={arabic ? "rtl" : "ltr"} lang={language} aria-modal="true" aria-labelledby={`${id}-title`}
    onKeyDown={handleTab}
    onCancel={event => { event.preventDefault(); dismiss(); }}
    onPointerDown={event => { backdropPressed.current = isBackdrop(event); }}
    onClick={event => { if (backdropPressed.current && isBackdrop(event)) dismiss(); }}>
    <header className="cp-office-header">
      <img className="cp-office-flag" src={`/company-profile/intro/flag-${office.id === "egypt" ? "eg" : "sa"}.svg`}
        width="51" height="34" alt={office.flagAlt} />
      <button ref={closeButton} className="cp-office-close" type="button"
        aria-label={arabic ? "إغلاق" : "Close"} onClick={dismiss}>
        <CloseRounded aria-hidden="true" />
      </button>
    </header>
    <h2 id={`${id}-title`} className="cp-office-title">
      <bdi lang="en" dir="ltr">BECT</bdi><span className="cp-office-dash"> — </span>
      {arabic ? `مكتب ${office.city}` : `${office.city} Office`}
    </h2>
    <address className="cp-office-details">
      <div className="cp-office-address"><PlaceOutlined aria-hidden="true" />
        <bdi>{office.localizedAddress ?? office.address}</bdi>
      </div>
      <a className="cp-office-phone" href={office.phoneUrl}><PhoneOutlined aria-hidden="true" />
        <bdi dir="ltr">{office.phone}</bdi>
      </a>
    </address>
    <footer className="cp-office-actions">
      <a className="cp-office-directions" href={directions} target="_blank" rel="noopener noreferrer">
        <NearMeOutlined aria-hidden="true" />{arabic ? "الاتجاهات" : "Get Directions"}
      </a>
      <a ref={contactLink} className="cp-office-contact" href="/#contact">
        {arabic ? "تواصل معنا" : "Contact Us"}<ArrowForwardRounded aria-hidden="true" />
      </a>
    </footer>
  </dialog>;
}
