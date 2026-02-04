"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import * as React from "react";
import * as THREE from "three";

import type { FlightPhase } from "./useGameSimulation";

function Flamingo({ phase, multiplier }: { phase: FlightPhase; multiplier: number }) {
  const group = React.useRef<THREE.Group>(null);
  const leftWing = React.useRef<THREE.Mesh>(null);
  const rightWing = React.useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const speed = Math.min(2.2, 0.8 + multiplier / 6);

    if (group.current) {
      group.current.position.y = Math.sin(t * 1.6) * 0.15 + 0.4;
      group.current.rotation.z = Math.sin(t * 0.8) * 0.1;
      group.current.rotation.x = Math.sin(t * 0.5) * 0.06;
      group.current.position.x = Math.sin(t * 0.6) * 0.2;

      if (phase === "crashed") {
        group.current.rotation.z = -0.6 + Math.sin(t * 2) * 0.12;
        group.current.rotation.x = 0.4;
      }
    }

    if (leftWing.current && rightWing.current) {
      const flap = Math.sin(t * (3 + speed)) * 0.35;
      leftWing.current.rotation.z = flap + 0.15;
      rightWing.current.rotation.z = -flap - 0.15;
    }
  });

  const bodyColor = phase === "crashed" ? "#ff6aa7" : "#ff4d92";

  return (
    <group ref={group} position={[0, 0.2, 0]}>
      <mesh position={[0, 0.1, 0]}>
        <sphereGeometry args={[0.45, 32, 32]} />
        <meshStandardMaterial color={bodyColor} emissive="#ff2b7a" emissiveIntensity={0.25} />
      </mesh>
      <mesh position={[0, 0.55, 0.1]} rotation={[0.35, 0, 0]}>
        <cylinderGeometry args={[0.08, 0.12, 0.6, 24]} />
        <meshStandardMaterial color="#ff7fb4" />
      </mesh>
      <mesh position={[0, 0.9, 0.15]}>
        <sphereGeometry args={[0.16, 24, 24]} />
        <meshStandardMaterial color="#ffd6e6" />
      </mesh>
      <mesh position={[0.05, 0.88, 0.3]} rotation={[0.2, 0, 0]}>
        <coneGeometry args={[0.07, 0.2, 16]} />
        <meshStandardMaterial color="#1f2937" />
      </mesh>
      <mesh ref={leftWing} position={[-0.5, 0.1, 0]} rotation={[0, 0, 0.2]}>
        <boxGeometry args={[0.5, 0.08, 0.3]} />
        <meshStandardMaterial color="#151c3d" emissive="#151c3d" emissiveIntensity={0.4} />
      </mesh>
      <mesh ref={rightWing} position={[0.5, 0.1, 0]} rotation={[0, 0, -0.2]}>
        <boxGeometry args={[0.5, 0.08, 0.3]} />
        <meshStandardMaterial color="#151c3d" emissive="#151c3d" emissiveIntensity={0.4} />
      </mesh>
      <mesh position={[-0.12, -0.4, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.6, 12]} />
        <meshStandardMaterial color="#1f2937" />
      </mesh>
      <mesh position={[0.12, -0.4, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.6, 12]} />
        <meshStandardMaterial color="#1f2937" />
      </mesh>
    </group>
  );
}

function HorizonRings() {
  const rings = Array.from({ length: 4 }).map((_, index) => ({
    id: index,
    radius: 2 + index * 0.8,
    opacity: 0.08 + index * 0.04
  }));

  return (
    <group rotation={[Math.PI / 2, 0, 0]} position={[0, -1.2, 0]}>
      {rings.map((ring) => (
        <mesh key={ring.id}>
          <torusGeometry args={[ring.radius, 0.02, 16, 60]} />
          <meshStandardMaterial color="#6ff0ff" transparent opacity={ring.opacity} />
        </mesh>
      ))}
    </group>
  );
}

export function FlamingoScene({
  phase,
  multiplier
}: {
  phase: FlightPhase;
  multiplier: number;
}) {
  return (
    <Canvas
      camera={{ position: [0, 1.4, 5], fov: 50 }}
      gl={{ antialias: true, alpha: true }}
    >
      <color attach="background" args={["#050814"]} />
      <fog attach="fog" args={["#050814", 4, 12]} />
      <ambientLight intensity={0.65} />
      <directionalLight intensity={1.2} position={[4, 6, 2]} color="#9eeeff" />
      <pointLight intensity={1} position={[-4, -2, 4]} color="#ff6aa7" />

      <Flamingo phase={phase} multiplier={multiplier} />
      <HorizonRings />
      <Sparkles count={60} size={2} speed={0.4} color="#6ff0ff" scale={[8, 4, 6]} />
    </Canvas>
  );
}
