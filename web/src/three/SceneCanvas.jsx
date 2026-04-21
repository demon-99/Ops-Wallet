import { Suspense, useEffect, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";

// Returns true once per page if the device can't reasonably run a Three.js scene.
function getPerfProfile() {
  if (typeof window === "undefined") return { ok: false, dprMax: 1 };
  const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
  const mobileLike = window.matchMedia?.("(max-width: 640px)")?.matches ?? false;
  const deviceMemory = Number(navigator.deviceMemory ?? 8);
  const cores = Number(navigator.hardwareConcurrency ?? 4);
  const lowEnd = deviceMemory < 4 || cores < 4;
  const ok = !reduceMotion;
  const dprMax = mobileLike || lowEnd ? 1.25 : 1.75;
  return { ok, dprMax, reduceMotion, mobileLike, lowEnd };
}

/**
 * SceneCanvas — shared Canvas wrapper.
 * - Clamps pixel ratio for perf.
 * - Pauses rendering when the tab isn't visible.
 * - Bails out entirely for reduced-motion users (renders fallback).
 * - pointerEvents can be disabled so the scene stays purely decorative.
 */
export default function SceneCanvas({
  children,
  className,
  style,
  camera = { fov: 45, position: [0, 0, 6], near: 0.1, far: 50 },
  frameloop = "always",
  fallback = null,
  interactive = false,
}) {
  const [perf] = useState(getPerfProfile);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const onVis = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  // When not interactive, the outer wrapper AND the Canvas both need
  // pointer-events: none so clicks pass through to the overlay UI.
  const canvasStyle = useMemo(
    () => ({
      position: "absolute",
      inset: 0,
      width: "100%",
      height: "100%",
      pointerEvents: interactive ? "auto" : "none",
      ...style,
    }),
    [interactive, style]
  );

  if (!perf.ok) {
    // Reduced motion: render the fallback (usually a static gradient).
    return (
      <div className={className} style={canvasStyle} aria-hidden="true">
        {fallback}
      </div>
    );
  }

  return (
    <div className={className} style={canvasStyle} aria-hidden="true">
      <Canvas
        dpr={[1, perf.dprMax]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        camera={camera}
        frameloop={visible ? frameloop : "never"}
        style={{ width: "100%", height: "100%", pointerEvents: interactive ? "auto" : "none" }}
      >
        <Suspense fallback={null}>{children}</Suspense>
      </Canvas>
    </div>
  );
}

export { getPerfProfile };
