import { useEffect, useRef } from "react";
import bgUrl from "../assets/opswallet-bg.png";

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
const lerp = (a, b, t) => a + (b - a) * t;

export default function Apple3DBackground() {
  const rootRef = useRef(null);
  const sceneRef = useRef(null);
  const lightRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    const scene = sceneRef.current;
    const light = lightRef.current;
    if (!root || !scene || !light) return;

    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
    if (reduceMotion) return;

    const state = {
      // targets
      tx: 0,
      ty: 0,
      // current
      x: 0,
      y: 0,
      // light targets/current (in px, relative to viewport)
      ltx: window.innerWidth * 0.5,
      lty: window.innerHeight * 0.4,
      lx: window.innerWidth * 0.5,
      ly: window.innerHeight * 0.4,
      // scale target/current
      st: 1,
      s: 1,
      // time
      raf: 0,
      lastMoveAt: performance.now(),
    };

    const setTargetsFromPointer = (clientX, clientY) => {
      const cx = window.innerWidth * 0.5;
      const cy = window.innerHeight * 0.5;
      const nx = clamp((clientX - cx) / cx, -1, 1);
      const ny = clamp((clientY - cy) / cy, -1, 1);

      // Apple-ish: small but noticeable rotation.
      state.tx = ny * -10; // rotateX
      state.ty = nx * 12; // rotateY

      state.ltx = clientX;
      state.lty = clientY;

      state.st = 1.03;
      state.lastMoveAt = performance.now();
    };

    const onPointerMove = (e) => setTargetsFromPointer(e.clientX, e.clientY);
    const onTouchMove = (e) => {
      const t = e.touches?.[0];
      if (!t) return;
      setTargetsFromPointer(t.clientX, t.clientY);
    };

    const onBlur = () => {
      state.tx = 0;
      state.ty = 0;
      state.st = 1;
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("blur", onBlur, { passive: true });

    const tick = () => {
      const now = performance.now();
      const idleFor = now - state.lastMoveAt;
      if (idleFor > 900) state.st = lerp(state.st, 1, 0.06);
      if (idleFor > 1600) {
        state.tx = lerp(state.tx, 0, 0.05);
        state.ty = lerp(state.ty, 0, 0.05);
      }

      // Ease current values.
      state.x = lerp(state.x, state.tx, 0.08);
      state.y = lerp(state.y, state.ty, 0.08);
      state.s = lerp(state.s, state.st, 0.07);

      state.lx = lerp(state.lx, state.ltx, 0.12);
      state.ly = lerp(state.ly, state.lty, 0.12);

      // Scene transform (GPU friendly).
      scene.style.transform = `perspective(1200px) rotateX(${state.x.toFixed(3)}deg) rotateY(${state.y.toFixed(
        3
      )}deg) scale(${state.s.toFixed(4)})`;

      // Dynamic light/reflection following cursor.
      light.style.setProperty("--lx", `${state.lx}px`);
      light.style.setProperty("--ly", `${state.ly}px`);
      light.style.opacity = String(clamp(0.18 + Math.abs(state.y) * 0.01 + Math.abs(state.x) * 0.01, 0.18, 0.42));

      state.raf = window.requestAnimationFrame(tick);
    };

    state.raf = window.requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("blur", onBlur);
      window.cancelAnimationFrame(state.raf);
    };
  }, []);

  return (
    <div className="hero__apple3d" ref={rootRef} aria-hidden="true">
      <div className="hero__apple3dScene" ref={sceneRef} aria-hidden="true">
        <div className="hero__apple3dLayer hero__apple3dLayer--bg" aria-hidden="true" />
        <div className="hero__apple3dLayer hero__apple3dLayer--image" aria-hidden="true" style={{ backgroundImage: `url(${bgUrl})` }} />
        <div className="hero__apple3dLayer hero__apple3dLayer--glass" aria-hidden="true" />
        <div className="hero__apple3dLight" ref={lightRef} aria-hidden="true" />
      </div>
    </div>
  );
}

