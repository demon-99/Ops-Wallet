import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Float, Lightformer } from "@react-three/drei";
import * as THREE from "three";
import ShaderBackground from "./ShaderBackground.jsx";

/**
 * ShowcaseScene — a 3D "product" locked in place while the page scrolls.
 * Driven by a scalar `progress` ref (0 → 1) set by GSAP ScrollTrigger.
 *
 * The camera orbits the object on a circle in the XZ plane, and three
 * satellite chips orbit the center so that each "step" of the scroll
 * surfaces a different chip in focus.
 */
export default function ShowcaseScene({ progress, mouse }) {
  const { camera } = useThree();
  const groupRef = useRef(null);
  const chipRefs = [useRef(null), useRef(null), useRef(null)];

  useFrame((_, delta) => {
    const p = progress?.current ?? 0;
    const t = _.clock.elapsedTime;

    // Camera orbits around Y axis as we scroll.
    const angle = -Math.PI * 0.25 + p * Math.PI * 1.2; // ~216° sweep
    const radius = 6.2 - p * 0.6;
    const camX = Math.sin(angle) * radius;
    const camZ = Math.cos(angle) * radius;
    const camY = 0.4 - p * 0.25;

    camera.position.x += (camX - camera.position.x) * Math.min(1, delta * 4);
    camera.position.y += (camY - camera.position.y) * Math.min(1, delta * 4);
    camera.position.z += (camZ - camera.position.z) * Math.min(1, delta * 4);

    const pointer = mouse?.current ?? { x: 0.5, y: 0.5 };
    const mx = (pointer.x - 0.5) * 0.4;
    const my = -(pointer.y - 0.5) * 0.25;
    camera.lookAt(mx, my, 0);

    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.15;
    }

    // Each chip orbits at a different phase + height.
    chipRefs.forEach((ref, i) => {
      if (!ref.current) return;
      const phase = (i / chipRefs.length) * Math.PI * 2 + t * 0.4;
      const r = 2.3;
      ref.current.position.set(
        Math.cos(phase) * r,
        Math.sin(phase * 0.7 + i) * 0.45,
        Math.sin(phase) * r
      );
      ref.current.lookAt(0, ref.current.position.y, 0);
    });
  });

  return (
    <>
      <ShaderBackground colorA="#0b1236" colorB="#22d3ee" colorC="#7c3aed" intensity={0.55} />

      <ambientLight intensity={0.45} />
      <directionalLight position={[6, 5, 4]} intensity={1.4} />
      <directionalLight position={[-5, -3, -4]} intensity={0.6} color="#7c3aed" />
      <Lightformer form="rect" intensity={2.2} color="#ffffff" position={[-4, 3, 3]} scale={[5, 3, 1]} />
      <Lightformer form="rect" intensity={1.6} color="#22d3ee" position={[4, -2, 2]} scale={[4, 2, 1]} />

      <group ref={groupRef}>
        <Float speed={0.9} rotationIntensity={0.35} floatIntensity={0.6}>
          <mesh>
            <torusKnotGeometry args={[0.95, 0.32, 220, 32]} />
            <meshPhysicalMaterial
              color={"#e8fcff"}
              metalness={0.15}
              roughness={0.12}
              transmission={0.85}
              thickness={1.0}
              ior={1.42}
              clearcoat={1}
              clearcoatRoughness={0.1}
              attenuationColor={new THREE.Color("#22d3ee")}
              attenuationDistance={2.0}
              envMapIntensity={1.1}
            />
          </mesh>
        </Float>

        {/* Satellite chips. */}
        {chipRefs.map((ref, i) => (
          <mesh key={i} ref={ref}>
            <boxGeometry args={[0.55, 0.34, 0.08]} />
            <meshStandardMaterial
              color={i === 0 ? "#22d3ee" : i === 1 ? "#7c3aed" : "#fb7185"}
              emissive={i === 0 ? "#22d3ee" : i === 1 ? "#7c3aed" : "#fb7185"}
              emissiveIntensity={1.1}
              toneMapped={false}
              roughness={0.3}
              metalness={0.5}
            />
          </mesh>
        ))}
      </group>
    </>
  );
}
