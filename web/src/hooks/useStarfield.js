import { useEffect, useState } from "react";

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const m = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!m) return;
    const onChange = () => setReduced(!!m.matches);
    onChange();
    m.addEventListener?.("change", onChange);
    return () => m.removeEventListener?.("change", onChange);
  }, []);
  return reduced;
}

function resizeCanvasToDisplaySize(canvas) {
  const { width, height } = canvas.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = Math.max(1, Math.floor(width * dpr));
  const h = Math.max(1, Math.floor(height * dpr));
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
    return { w, h, resized: true };
  }
  return { w: canvas.width, h: canvas.height, resized: false };
}

export function useStarfield(canvasRef) {
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;
    if (reduced) return;

    const rand = (min, max) => min + Math.random() * (max - min);
    const makeStars = (count, w, h) => {
      const arr = [];
      for (let i = 0; i < count; i++) {
        arr.push({
          x: rand(0, w),
          y: rand(0, h),
          r: rand(0.6, 1.8),
          tw: rand(0.4, 1),
          s: rand(0.1, 0.6),
          hue: rand(180, 320),
        });
      }
      return arr;
    };

    let stars = [];
    let raf = 0;
    let last = performance.now();

    const draw = (t) => {
      const dt = Math.min(48, t - last);
      last = t;

      const { w, h, resized } = resizeCanvasToDisplaySize(canvas);
      if (resized || stars.length === 0) {
        const density = Math.min(1.25, Math.max(0.7, (w * h) / (1100 * 800)));
        const count = Math.floor(140 * density);
        stars = makeStars(count, w, h);
      }

      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";

      const time = t * 0.001;
      for (const s of stars) {
        s.y += s.s * (dt * 0.06);
        s.x += Math.sin(time * 0.4 + s.y * 0.002) * 0.12;
        if (s.y - 6 > h) {
          s.y = -6;
          s.x = rand(0, w);
        }

        const pulse = 0.55 + 0.45 * Math.sin(time * (0.8 + s.tw) + s.x * 0.004);
        const alpha = 0.1 + pulse * 0.28;
        ctx.beginPath();
        ctx.fillStyle = `hsla(${s.hue}, 95%, 70%, ${alpha})`;
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalCompositeOperation = "source-over";
      raf = requestAnimationFrame(draw);
    };

    const stop = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    };

    const onVis = () => {
      if (document.hidden) stop();
      else {
        last = performance.now();
        raf = requestAnimationFrame(draw);
      }
    };

    document.addEventListener("visibilitychange", onVis);
    raf = requestAnimationFrame(draw);

    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [canvasRef, reduced]);
}
