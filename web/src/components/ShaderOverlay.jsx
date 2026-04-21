import { lazy, Suspense, useEffect, useRef } from "react";

/**
 * ShaderOverlay — a minimal GLSL background layer (no 3D geometry).
 * Intended to sit under page chrome as a subtle "living gradient".
 * Designed to blend with an existing CSS background via opacity/mix-blend-mode.
 */
const SceneCanvas = lazy(() => import("../three/SceneCanvas.jsx"));
const ShaderBackground = lazy(() => import("../three/ShaderBackground.jsx"));

export default function ShaderOverlay({
  colorA = "#7c3aed",
  colorB = "#22d3ee",
  colorC = "#0b1236",
  intensity = 0.7,
  opacity = 0.55,
  blendMode = "screen",
  className,
  style,
}) {
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const rootRef = useRef(null);

  useEffect(() => {
    const onMove = (e) => {
      mouseRef.current.x = e.clientX / window.innerWidth;
      mouseRef.current.y = e.clientY / window.innerHeight;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  return (
    <div
      ref={rootRef}
      className={`shaderOverlay ${className ?? ""}`}
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 0,
        opacity,
        mixBlendMode: blendMode,
        pointerEvents: "none",
        ...style,
      }}
      aria-hidden="true"
    >
      <Suspense fallback={null}>
        <SceneCanvas camera={{ fov: 45, position: [0, 0, 5], near: 0.1, far: 50 }}>
          <ShaderBackground
            colorA={colorA}
            colorB={colorB}
            colorC={colorC}
            intensity={intensity}
            mouse={mouseRef}
          />
        </SceneCanvas>
      </Suspense>
    </div>
  );
}
