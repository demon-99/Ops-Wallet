import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, Lightformer } from "@react-three/drei";
import * as THREE from "three";

const tmpVec = new THREE.Vector3();

/**
 * FloatingGlass — the hero "product" object.
 * A glass-like icosahedron with inner emissive core, mouse-reactive tilt,
 * and a soft orbiting accent sphere. Lights are baked into the component
 * (Lightformers) so the material has interesting reflections without needing
 * an HDRI download.
 */
export default function FloatingGlass({
  scroll,
  mouse,
  color = "#22d3ee",
  accent = "#7c3aed",
}) {
  const rootRef = useRef(null);
  const coreRef = useRef(null);
  const accentRef = useRef(null);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const pointer = mouse?.current ?? { x: state.pointer.x * 0.5 + 0.5, y: state.pointer.y * 0.5 + 0.5 };

    // Normalize mouse to [-1, 1].
    const mx = (pointer.x - 0.5) * 2;
    const my = (pointer.y - 0.5) * 2;

    if (rootRef.current) {
      // Tilt toward the pointer; ease with lerp so it feels inertial.
      tmpVec.set(my * -0.18, mx * 0.32, 0);
      rootRef.current.rotation.x += (tmpVec.x - rootRef.current.rotation.x) * Math.min(1, delta * 4);
      rootRef.current.rotation.y += (tmpVec.y - rootRef.current.rotation.y + t * 0.02) * Math.min(1, delta * 4);

      // Scroll-driven camera pull / zoom out.
      const s = scroll?.current ?? 0;
      rootRef.current.position.y = Math.sin(t * 0.6) * 0.06 - s * 1.4;
      rootRef.current.scale.setScalar(1 - s * 0.25);
    }

    if (coreRef.current) {
      coreRef.current.rotation.x = t * 0.6;
      coreRef.current.rotation.y = t * 0.4;
    }

    if (accentRef.current) {
      const r = 2.2;
      accentRef.current.position.set(
        Math.cos(t * 0.55) * r,
        Math.sin(t * 0.35) * 0.9,
        Math.sin(t * 0.55) * r - 0.5
      );
    }
  });

  return (
    <group ref={rootRef}>
      {/* Ambient + key lights that don't depend on a CDN HDRI. */}
      <ambientLight intensity={0.35} />
      <directionalLight position={[5, 6, 4]} intensity={1.4} color="#ffffff" />
      <directionalLight position={[-4, -2, -3]} intensity={0.6} color={accent} />
      <pointLight position={[0, 0, 3]} intensity={1.1} color={color} />

      {/* In-scene "softbox" lights give the glass nice specular highlights. */}
      <Lightformer form="rect" intensity={2} color="#ffffff" position={[-3, 2, 3]} scale={[5, 3, 1]} />
      <Lightformer form="rect" intensity={1.4} color={color} position={[3, -2, 2]} scale={[4, 2, 1]} />
      <Lightformer form="circle" intensity={1.8} color={accent} position={[0, 4, -2]} scale={[2, 2, 1]} />

      <Float speed={1.1} rotationIntensity={0.5} floatIntensity={0.8} floatingRange={[-0.15, 0.15]}>
        <mesh castShadow receiveShadow>
          <icosahedronGeometry args={[1.35, 2]} />
          <meshPhysicalMaterial
            color={"#dffcff"}
            metalness={0.1}
            roughness={0.08}
            transmission={0.92}
            thickness={1.2}
            ior={1.45}
            clearcoat={1}
            clearcoatRoughness={0.08}
            attenuationColor={color}
            attenuationDistance={2.4}
            envMapIntensity={1.2}
          />
        </mesh>

        {/* Inner glowing core. */}
        <mesh ref={coreRef}>
          <icosahedronGeometry args={[0.55, 1]} />
          <meshStandardMaterial
            color={accent}
            emissive={accent}
            emissiveIntensity={1.6}
            roughness={0.4}
            metalness={0.2}
          />
        </mesh>
      </Float>

      {/* Orbiting accent sphere. */}
      <mesh ref={accentRef}>
        <sphereGeometry args={[0.18, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={2.2}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}
