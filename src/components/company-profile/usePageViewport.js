import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

const fit = { scale: 1, x: 0, y: 0 };
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const midpoint = (a, b) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });

export default function usePageViewport(slide, turn, rtl, reading) {
  const viewport = useRef(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [view, setView] = useState(fit);
  const current = useRef(fit);
  const pointers = useRef(new Map());
  const gesture = useRef(null);
  const frame = useRef(0);
  const ratio = slide.width / slide.height;
  const width = Math.min(size.width, size.height * ratio);
  const height = width / ratio;

  useLayoutEffect(() => {
    const area = viewport.current;
    function measure() { setSize({ width: area.clientWidth, height: area.clientHeight }); }
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(area);
    return () => observer.disconnect();
  }, []);

  const move = useCallback((scale, x, y) => {
    const maxX = Math.max(0, (width * scale - size.width) / 2);
    const maxY = Math.max(0, (height * scale - size.height) / 2);
    current.current = { scale, x: clamp(x, -maxX, maxX), y: clamp(y, -maxY, maxY) };
    if (!frame.current) frame.current = requestAnimationFrame(() => {
      frame.current = 0;
      setView(current.current);
    });
  }, [height, width, size.height, size.width]);

  useLayoutEffect(() => {
    current.current = fit;
    setView(fit);
    pointers.current.clear();
    gesture.current = null;
  }, [slide.number, size.height, size.width, reading]);

  useLayoutEffect(() => {
    viewport.current.scrollTop = 0;
  }, [slide.src, reading]);

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  const zoom = useCallback((value, origin = { x: 0, y: 0 }) => {
    const old = current.current;
    const scale = clamp(value, 1, 10);
    const factor = scale / old.scale;
    move(scale, origin.x - (origin.x - old.x) * factor, origin.y - (origin.y - old.y) * factor);
  }, [move]);

  const enlargeHalf = (side) => {
    const scale = 2;
    move(scale, (side === "left" ? 1 : -1) * width * scale / 4, 0);
  };

  const pan = (x, y) => {
    const old = current.current;
    move(old.scale, old.x + x, old.y + y);
  };

  function relative(clientX, clientY) {
    const rect = viewport.current.getBoundingClientRect();
    return { x: clientX - rect.left - rect.width / 2, y: clientY - rect.top - rect.height / 2 };
  }

  useEffect(() => {
    if (reading) return;
    const element = viewport.current;
    const wheel = (e) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      e.preventDefault();
      zoom(current.current.scale * Math.exp(-e.deltaY * 0.012), relative(e.clientX, e.clientY));
    };
    element.addEventListener("wheel", wheel, { passive: false });
    return () => element.removeEventListener("wheel", wheel);
  }, [zoom, reading]);

  const down = (e) => {
    if (e.button !== 0 || (e.pointerType === "mouse" && current.current.scale === 1) ||
        (reading && window.visualViewport?.scale > 1)) return;
    const points = pointers.current;
    points.set(e.pointerId, relative(e.clientX, e.clientY));
    if (!reading) e.currentTarget.setPointerCapture(e.pointerId);
    const [a, b] = points.values();
    if (points.size === 1) {
      gesture.current = { start: a, view: current.current, swipable: current.current.scale === 1 };
    } else if (points.size === 2) {
      gesture.current = { start: midpoint(a, b), distance: Math.max(1, distance(a, b)), view: current.current };
    }
  };

  const drag = (e) => {
    if (reading) return;
    const points = pointers.current;
    if (!points.has(e.pointerId) || !gesture.current) return;
    points.set(e.pointerId, relative(e.clientX, e.clientY));
    const [a, b] = points.values();
    const g = gesture.current;
    if (b && g.distance) {
      const center = midpoint(a, b);
      const scale = clamp(g.view.scale * distance(a, b) / g.distance, 1, 10);
      const factor = scale / g.view.scale;
      move(scale, center.x - (g.start.x - g.view.x) * factor, center.y - (g.start.y - g.view.y) * factor);
    } else if (!b && !g.swipable) {
      move(g.view.scale, g.view.x + a.x - g.start.x, g.view.y + a.y - g.start.y);
    }
  };

  const end = (e) => {
    const points = pointers.current;
    if (!points.has(e.pointerId)) return;
    const g = gesture.current;
    points.delete(e.pointerId);
    if (points.size) {
      const [a, b] = points.values();
      gesture.current = b
        ? { start: midpoint(a, b), distance: Math.max(1, distance(a, b)), view: current.current }
        : { start: a, view: current.current, swipable: false };
      return;
    }
    gesture.current = null;
    if (g?.swipable && e.type === "pointerup") {
      const point = relative(e.clientX, e.clientY);
      const dx = point.x - g.start.x;
      const dy = point.y - g.start.y;
      if (Math.abs(dx) > Math.max(42, Math.min(size.width * .1, 90)) && Math.abs(dx) > Math.abs(dy) * 1.7) {
        turn((dx < 0 ? 1 : -1) * (rtl ? -1 : 1));
      }
    }
  };

  return { viewport, view, zoom, pan, enlargeHalf, width, height,
    events: { onPointerDown: down, onPointerMove: drag, onPointerUp: end, onPointerCancel: end,
      onLostPointerCapture: end,
      onDoubleClick: reading ? undefined : (e) => zoom(current.current.scale > 1 ? 1 : 3, relative(e.clientX, e.clientY)) } };
}
