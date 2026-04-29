import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const AUTOPLAY_MS = 4500;

function useReducedMotion() {
  return useMemo(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches,
    [],
  );
}

function AnimatedWords({ text, className, baseDelay = 0, step = 0.045 }) {
  const words = String(text).split(/\s+/).filter(Boolean);
  return (
    <span className={className}>
      {words.map((w, i) => (
        <span
          key={`${i}-${w}`}
          className="intCarousel__word"
          style={{ animationDelay: `${baseDelay + i * step}s` }}
        >
          {w}
          {i < words.length - 1 ? "\u00A0" : ""}
        </span>
      ))}
    </span>
  );
}

export default function IntegrationCarousel({ items, onSelect }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reducedMotion = useReducedMotion();
  const trackRef = useRef(null);
  const dragState = useRef(null);

  const count = items.length;
  const next = useCallback(() => setIndex((i) => (i + 1) % count), [count]);
  const prev = useCallback(
    () => setIndex((i) => (i - 1 + count) % count),
    [count],
  );

  useEffect(() => {
    if (reducedMotion || paused || count <= 1) return;
    const id = window.setInterval(next, AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [next, paused, reducedMotion, count]);

  useEffect(() => {
    const onKey = (e) => {
      if (!trackRef.current?.contains(document.activeElement)) return;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        next();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        prev();
      } else if (e.key === "Enter" || e.key === " ") {
        const item = items[index];
        if (item) {
          e.preventDefault();
          onSelect?.(item);
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev, index, items, onSelect]);

  const onPointerDown = (e) => {
    dragState.current = { x: e.clientX, dx: 0, id: e.pointerId };
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setPaused(true);
  };
  const onPointerMove = (e) => {
    if (!dragState.current) return;
    dragState.current.dx = e.clientX - dragState.current.x;
  };
  const onPointerUp = (e) => {
    if (!dragState.current) return;
    const { dx } = dragState.current;
    e.currentTarget.releasePointerCapture?.(dragState.current.id);
    dragState.current = null;
    setPaused(false);
    if (dx > 60) prev();
    else if (dx < -60) next();
  };

  const cardTransform = (offset) => {
    const dir = Math.sign(offset);
    const abs = Math.abs(offset);
    const tx = offset * 220;
    const ty = -dir * 0;
    const tz = abs === 0 ? 0 : -abs * 180;
    const ry = -offset * 28;
    return `translate3d(${tx}px, ${ty}px, ${tz}px) rotateY(${ry}deg)`;
  };

  return (
    <div
      className="intCarousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <button
        type="button"
        className="intCarousel__nav intCarousel__nav--prev"
        onClick={prev}
        aria-label="Previous integration"
      >
        <span aria-hidden="true">‹</span>
      </button>

      <div
        className="intCarousel__stage"
        ref={trackRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        role="region"
        aria-roledescription="carousel"
        aria-label="Integrations"
        tabIndex={0}
      >
        <div className="intCarousel__track">
          {items.map((item, i) => {
            // Pick the shortest signed distance around the ring so neighbors
            // wrap smoothly instead of snapping across the full list.
            let raw = i - index;
            if (raw > count / 2) raw -= count;
            if (raw < -count / 2) raw += count;
            const visible = Math.abs(raw) <= 2;
            const isActive = raw === 0;
            return (
              <button
                key={item.title}
                type="button"
                className={`intCarousel__card${
                  isActive ? " intCarousel__card--active" : ""
                }`}
                aria-hidden={!visible}
                aria-current={isActive ? "true" : undefined}
                tabIndex={isActive ? 0 : -1}
                style={{
                  transform: cardTransform(raw),
                  opacity: visible ? (isActive ? 1 : 0.55) : 0,
                  pointerEvents: isActive ? "auto" : "none",
                  zIndex: 100 - Math.abs(raw),
                }}
                onClick={() => {
                  if (isActive) onSelect?.(item);
                  else setIndex(i);
                }}
              >
                <div className="intCarousel__cardGlow" aria-hidden="true" />
                <div className="intCarousel__cardSheen" aria-hidden="true" />
                <div
                  className="intCarousel__cardContent"
                  key={isActive ? `active-${index}` : `idle-${i}`}
                  data-active={isActive ? "true" : "false"}
                >
                  <AnimatedWords
                    className="intCarousel__cardTitle"
                    text={item.title}
                    baseDelay={0.05}
                    step={0.06}
                  />
                  <AnimatedWords
                    className="intCarousel__cardBody"
                    text={item.blurb}
                    baseDelay={0.18}
                    step={0.022}
                  />
                  <div
                    className="intCarousel__cardCta"
                    style={{ animationDelay: "0.55s" }}
                  >
                    Open <span aria-hidden="true">→</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <button
        type="button"
        className="intCarousel__nav intCarousel__nav--next"
        onClick={next}
        aria-label="Next integration"
      >
        <span aria-hidden="true">›</span>
      </button>

      <div className="intCarousel__dots" role="tablist" aria-label="Choose integration">
        {items.map((it, i) => (
          <button
            key={it.title}
            type="button"
            role="tab"
            aria-selected={i === index}
            aria-label={`Go to ${it.title}`}
            className={`intCarousel__dot${
              i === index ? " intCarousel__dot--active" : ""
            }`}
            onClick={() => setIndex(i)}
          />
        ))}
      </div>
    </div>
  );
}
