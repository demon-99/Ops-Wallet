import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import FloatingGlass from "./FloatingGlass.jsx";
import ShaderBackground from "./ShaderBackground.jsx";

/**
 * HeroScene — positions the shader background, the floating glass,
 * and runs a smooth on-load camera intro + scroll-synced dolly.
 */
export default function HeroScene({ mouse, scroll, variant = "default" }) {
  const { camera } = useThree();
  const introRef = useRef({ t: 0 });

  // Shader palette per variant — lets us reuse the scene on different pages.
  const palette =
    variant === "auth"
      ? { a: "#7c3aed", b: "#22d3ee", c: "#111827", intensity: 0.6 }
      : variant === "dashboard"
      ? { a: "#22d3ee", b: "#7c3aed", c: "#0b1020", intensity: 0.35 }
      : { a: "#7c3aed", b: "#22d3ee", c: "#fb7185", intensity: 1.0 };

  useFrame((_, delta) => {
    // Smooth intro: first second, pull the camera in from z=9 → z=5.5.
    introRef.current.t = Math.min(1, introRef.current.t + delta * 0.9);
    const ease = 1 - Math.pow(1 - introRef.current.t, 3);
    const baseZ = 5.5;
    const introZ = baseZ + (1 - ease) * 3.5;

    // Scroll-synced dolly: push the camera back as the user scrolls the hero.
    const s = scroll?.current ?? 0;
    const scrollZ = introZ + s * 1.8;

    camera.position.z += (scrollZ - camera.position.z) * Math.min(1, delta * 4);

    // Subtle parallax look-at offset tied to the mouse.
    const pointer = mouse?.current ?? { x: 0.5, y: 0.5 };
    const targetX = (pointer.x - 0.5) * 0.6;
    const targetY = -(pointer.y - 0.5) * 0.4;
    camera.position.x += (targetX - camera.position.x) * Math.min(1, delta * 3);
    camera.position.y += (targetY - camera.position.y) * Math.min(1, delta * 3);
    camera.lookAt(0, -s * 0.6, 0);
  });

  return (
    <>
      <ShaderBackground
        colorA={palette.a}
        colorB={palette.b}
        colorC={palette.c}
        intensity={palette.intensity}
        mouse={mouse}
      />
      <FloatingGlass scroll={scroll} mouse={mouse} color={palette.b} accent={palette.a} />
    </>
  );
}
