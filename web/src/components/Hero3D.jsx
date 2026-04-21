import { lazy, Suspense, useEffect, useRef } from "react";

// Lazy-load the whole 3D payload so the first render doesn't pay for
// Three.js / R3F / drei up front.
const SceneCanvas = lazy(() => import("../three/SceneCanvas.jsx"));
const HeroScene = lazy(() => import("../three/HeroScene.jsx"));

/**
 * Hero3D — full-bleed animated hero with 3D scene + overlaid text/CTAs.
 * Tracks mouse position and scroll progress into refs so the Canvas can read
 * them every frame without triggering React re-renders.
 */
export default function Hero3D({
  eyebrow,
  title,
  subtitle,
  actions,
  variant = "default",
  minHeight = "100vh",
  children,
}) {
  const rootRef = useRef(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const scrollRef = useRef(0);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const onMove = (e) => {
      const rect = el.getBoundingClientRect();
      mouseRef.current.x = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
      mouseRef.current.y = Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height));
    };

    const onTouch = (e) => {
      const t = e.touches?.[0];
      if (!t) return;
      const rect = el.getBoundingClientRect();
      mouseRef.current.x = Math.min(1, Math.max(0, (t.clientX - rect.left) / rect.width));
      mouseRef.current.y = Math.min(1, Math.max(0, (t.clientY - rect.top) / rect.height));
    };

    const onScroll = () => {
      const rect = el.getBoundingClientRect();
      const h = rect.height || 1;
      // 0 at the top of the hero, 1 when the hero is fully scrolled past.
      const progress = Math.min(1, Math.max(0, -rect.top / h));
      scrollRef.current = progress;
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("touchmove", onTouch, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("touchmove", onTouch);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <section
      ref={rootRef}
      className={`hero3d hero3d--${variant}`}
      style={{ minHeight }}
      data-variant={variant}
    >
      <div className="hero3d__canvasWrap" aria-hidden="true">
        <Suspense fallback={<div className="hero3d__fallback" />}>
          <SceneCanvas camera={{ fov: 42, position: [0, 0, 5.5], near: 0.1, far: 50 }}>
            <HeroScene mouse={mouseRef} scroll={scrollRef} variant={variant} />
          </SceneCanvas>
        </Suspense>
      </div>

      <div className="hero3d__overlay">
        <div className="hero3d__content">
          {eyebrow ? <div className="hero3d__eyebrow">{eyebrow}</div> : null}
          {title ? <h1 className="hero3d__title">{title}</h1> : null}
          {subtitle ? <p className="hero3d__subtitle">{subtitle}</p> : null}
          {actions ? <div className="hero3d__actions">{actions}</div> : null}
          {children}
        </div>
      </div>

      <div className="hero3d__scrollHint" aria-hidden="true">
        <span>Scroll</span>
        <span className="hero3d__scrollDot" />
      </div>
    </section>
  );
}
