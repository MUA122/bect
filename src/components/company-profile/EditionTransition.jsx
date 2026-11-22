import React, { useLayoutEffect, useRef, useState } from "react";
import { Wordmark } from "./ProfileIntro";
import { profileCopy } from "./profileCopy";

export default function EditionTransition({ change, ready, onRevealed }) {
  const panel = useRef(null);
  const [covered, setCovered] = useState(false);
  useLayoutEffect(() => {
    const node = panel.current;
    const finish = () => { change.cover(); setCovered(true); };
    if (!node.animate || matchMedia("(prefers-reduced-motion: reduce)").matches) {
      finish();
      return;
    }
    const animation = node.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 190, easing: "ease-out" });
    animation.finished.then(finish, () => {});
    return () => animation.cancel();
  }, [change]);

  useLayoutEffect(() => {
    if (!ready || !covered) return;
    const node = panel.current;
    if (!node.animate || matchMedia("(prefers-reduced-motion: reduce)").matches) {
      onRevealed(change);
      return;
    }
    const animation = node.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 260, easing: "ease-in-out", fill: "forwards" });
    animation.finished.then(() => onRevealed(change), () => {});
    return () => animation.cancel();
  }, [change, covered, ready, onRevealed]);

  return <div ref={panel} className="cp-edition-transition" lang={change.to} dir={change.to === "ar" ? "rtl" : "ltr"} role="status">
    <Wordmark language={change.to} alt="" />
    <div className="cp-opening-track" aria-hidden="true" />
    <span>{profileCopy[change.to].preparingEdition}</span>
  </div>;
}
