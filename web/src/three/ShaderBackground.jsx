import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Animated gradient + simplex-ish noise shader plane.
 * Sits behind the hero; has no geometry cost beyond a single fullscreen quad.
 *
 * Palette defaults match the project accents (--a / --b / --c).
 */
const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  precision highp float;
  varying vec2 vUv;

  uniform float uTime;
  uniform vec2  uResolution;
  uniform vec2  uMouse;
  uniform vec3  uColorA;
  uniform vec3  uColorB;
  uniform vec3  uColorC;
  uniform float uIntensity;

  // 2D hash + value noise — cheap and looks fine for a gradient wash.
  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 5; i++) {
      v += a * noise(p);
      p *= 2.02;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 uv = vUv;
    float aspect = uResolution.x / max(uResolution.y, 1.0);
    vec2 p = vec2((uv.x - 0.5) * aspect, uv.y - 0.5);

    // Slow drift tied to mouse for subtle parallax.
    vec2 mouseOffset = (uMouse - 0.5) * 0.25;
    vec2 q = p + mouseOffset;

    float t = uTime * 0.06;
    float n1 = fbm(q * 1.8 + vec2(t, -t * 0.7));
    float n2 = fbm(q * 2.6 - vec2(t * 0.5, t));

    // Three soft radial plumes with the brand palette.
    float d1 = length(q - vec2(-0.45, 0.25)) - n1 * 0.35;
    float d2 = length(q - vec2( 0.55, 0.10)) - n2 * 0.32;
    float d3 = length(q - vec2(-0.05,-0.40)) - n1 * 0.28;

    float g1 = smoothstep(0.85, 0.0, d1);
    float g2 = smoothstep(0.90, 0.0, d2);
    float g3 = smoothstep(0.95, 0.0, d3);

    vec3 col = vec3(0.027, 0.031, 0.086); // base #070816
    col = mix(col, uColorA, g1 * 0.65 * uIntensity);
    col = mix(col, uColorB, g2 * 0.60 * uIntensity);
    col = mix(col, uColorC, g3 * 0.45 * uIntensity);

    // Film-grain noise so it doesn't look flat.
    float grain = (hash(uv * uResolution + uTime) - 0.5) * 0.03;
    col += grain;

    // Vignette.
    float v = smoothstep(1.3, 0.35, length(p));
    col *= mix(0.78, 1.05, v);

    gl_FragColor = vec4(col, 1.0);
  }
`;

export default function ShaderBackground({
  colorA = "#7c3aed",
  colorB = "#22d3ee",
  colorC = "#fb7185",
  intensity = 1.0,
  mouse,
}) {
  const matRef = useRef(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uColorA: { value: new THREE.Color(colorA) },
      uColorB: { value: new THREE.Color(colorB) },
      uColorC: { value: new THREE.Color(colorC) },
      uIntensity: { value: intensity },
    }),
    [colorA, colorB, colorC, intensity]
  );

  useFrame((state) => {
    if (!matRef.current) return;
    const u = matRef.current.uniforms;
    u.uTime.value = state.clock.elapsedTime;
    const size = state.size;
    u.uResolution.value.set(size.width, size.height);
    if (mouse?.current) {
      u.uMouse.value.set(mouse.current.x, mouse.current.y);
    } else {
      const pointer = state.pointer;
      u.uMouse.value.set((pointer.x + 1) * 0.5, (pointer.y + 1) * 0.5);
    }
  });

  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  );
}
