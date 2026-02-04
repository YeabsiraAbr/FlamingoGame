"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Trail, Float, Sparkles, Stars } from "@react-three/drei";
import * as React from "react";
import * as THREE from "three";

import type { FlightPhase } from "./useGameSimulation";

function easeOutQuad(t: number): number {
  return 1 - (1 - t) * (1 - t);
}

// Crow component
function Crow({
  x,
  y,
  id,
  phase,
}: {
  x: number;
  y: number;
  id: number;
  phase: FlightPhase;
}) {
  const groupRef = React.useRef<THREE.Group>(null);
  const leftWing = React.useRef<THREE.Mesh>(null);
  const rightWing = React.useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!groupRef.current || phase !== "flying") return;
    const t = state.clock.getElapsedTime();
    const flap = Math.sin(t * 18 + id) * 0.5;
    if (leftWing.current) leftWing.current.rotation.z = flap + 0.3;
    if (rightWing.current) rightWing.current.rotation.z = -flap - 0.3;
    groupRef.current.rotation.z = Math.sin(t * 3 + id) * 0.08;
  });

  if (phase !== "flying") return null;

  return (
    <group ref={groupRef} position={[x, y, 0]} scale={0.38}>
      <mesh>
        <sphereGeometry args={[0.28, 12, 12]} />
        <meshStandardMaterial
          color="#1a1a1a"
          emissive="#222"
          emissiveIntensity={0.3}
        />
      </mesh>
      <mesh position={[0.22, 0.08, 0]}>
        <sphereGeometry args={[0.14, 10, 10]} />
        <meshStandardMaterial
          color="#151515"
          emissive="#1a1a1a"
          emissiveIntensity={0.2}
        />
      </mesh>
      <mesh position={[0.38, 0.05, 0]} rotation={[0, 0, -0.2]}>
        <coneGeometry args={[0.035, 0.14, 6]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <mesh position={[0.28, 0.12, 0.1]}>
        <sphereGeometry args={[0.035, 6, 6]} />
        <meshStandardMaterial
          color="#f00"
          emissive="#f00"
          emissiveIntensity={1.2}
        />
      </mesh>
      <mesh
        ref={leftWing}
        position={[-0.08, 0, -0.18]}
        rotation={[0.15, 0, 0.2]}
      >
        <boxGeometry args={[0.4, 0.02, 0.22]} />
        <meshStandardMaterial
          color="#1f1f1f"
          emissive="#252525"
          emissiveIntensity={0.2}
        />
      </mesh>
      <mesh
        ref={rightWing}
        position={[-0.08, 0, 0.18]}
        rotation={[-0.15, 0, 0.2]}
      >
        <boxGeometry args={[0.4, 0.02, 0.22]} />
        <meshStandardMaterial
          color="#1f1f1f"
          emissive="#252525"
          emissiveIntensity={0.2}
        />
      </mesh>
    </group>
  );
}

interface CrowData {
  id: number;
  x: number;
  y: number;
  speed: number;
}

// Crow manager with collision detection
function CrowManager({
  phase,
  multiplier,
  flamingoY,
  onCollision,
}: {
  phase: FlightPhase;
  multiplier: number;
  flamingoY: React.MutableRefObject<number>;
  onCollision: () => void;
}) {
  const [crows, setCrows] = React.useState<CrowData[]>([]);
  const nextSpawn = React.useRef(0);
  const crowId = React.useRef(0);
  const hasCollided = React.useRef(false);

  React.useEffect(() => {
    if (phase === "flying") {
      setCrows([]);
      crowId.current = 0;
      nextSpawn.current = 0;
      hasCollided.current = false;
    } else {
      setCrows([]);
    }
  }, [phase]);

  useFrame((state) => {
    if (phase !== "flying" || hasCollided.current) return;

    const t = state.clock.getElapsedTime();
    const dt = 1 / 60;
    const interval = Math.max(0.3, 0.8 - multiplier * 0.04);

    if (t > nextSpawn.current) {
      const flamingoCurrentY = flamingoY.current;
      let spawnY: number;

      if (Math.random() < 0.7) {
        if (flamingoCurrentY > 0) {
          spawnY = -Math.random() * 1.5 - 0.5;
        } else {
          spawnY = Math.random() * 1.5 + 0.5;
        }
      } else {
        spawnY = (Math.random() - 0.5) * 3;
      }

      const speed = 3 + multiplier * 0.5 + Math.random() * 1.5;

      setCrows((prev) => [
        ...prev,
        { id: crowId.current++, x: 5, y: spawnY, speed },
      ]);
      nextSpawn.current = t + interval;
    }

    setCrows((prev) => {
      const updated: CrowData[] = [];
      const flamingoX = -0.8;
      const flamingoCurrentY = flamingoY.current;

      for (const crow of prev) {
        const newX = crow.x - crow.speed * dt;
        if (newX < -3) continue;

        if (newX < flamingoX + 0.5 && newX > flamingoX - 0.5) {
          const dy = Math.abs(crow.y - flamingoCurrentY);
          if (dy < 0.45) {
            if (!hasCollided.current) {
              hasCollided.current = true;
              onCollision();
              return prev;
            }
          }
        }
        updated.push({ ...crow, x: newX });
      }
      return updated;
    });
  });

  return (
    <>
      {crows.map((crow) => (
        <Crow key={crow.id} x={crow.x} y={crow.y} id={crow.id} phase={phase} />
      ))}
    </>
  );
}

// Flamingo component
function Flamingo({
  phase,
  multiplier,
  positionY,
}: {
  phase: FlightPhase;
  multiplier: number;
  positionY: React.MutableRefObject<number>;
}) {
  const group = React.useRef<THREE.Group>(null);
  const leftWing = React.useRef<THREE.Group>(null);
  const rightWing = React.useRef<THREE.Group>(null);
  const crashStart = React.useRef<number | null>(null);
  const prevPhase = React.useRef(phase);
  const targetY = React.useRef(0);
  const currentY = React.useRef(0);
  const dodgeTimer = React.useRef(0);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (!group.current) return;

    if (prevPhase.current !== phase) {
      if (phase === "crashed") crashStart.current = t;
      else if (phase === "flying") {
        currentY.current = 0;
        targetY.current = 0;
        crashStart.current = null;
      }
      prevPhase.current = phase;
    }

    if (phase === "waiting") {
      crashStart.current = null;
      const hover = Math.sin(t * 0.8) * 0.08;
      group.current.position.set(-0.8, hover - 0.1, 0);
      group.current.rotation.set(0.05, Math.sin(t * 0.3) * 0.05, 0);
      positionY.current = hover - 0.1;
      if (leftWing.current && rightWing.current) {
        const w = Math.sin(t * 2) * 0.1;
        leftWing.current.rotation.z = w + 0.15;
        rightWing.current.rotation.z = -w - 0.15;
      }
    } else if (phase === "flying") {
      if (t > dodgeTimer.current) {
        const intensity = Math.min(1.8, 0.6 + multiplier * 0.1);
        targetY.current = (Math.random() - 0.5) * 2.5 * intensity;
        dodgeTimer.current =
          t + Math.max(0.2, 0.5 - multiplier * 0.03) + Math.random() * 0.2;
      }
      const moveSpeed = 0.08 + multiplier * 0.008;
      currentY.current += (targetY.current - currentY.current) * moveSpeed;
      group.current.position.set(-0.8, currentY.current, 0);
      positionY.current = currentY.current;
      const tilt = (targetY.current - currentY.current) * 0.4;
      group.current.rotation.set(-0.1 - tilt * 0.2, 0, tilt * 0.5);
      if (leftWing.current && rightWing.current) {
        const flapSpeed = 10 + multiplier * 0.5;
        const flap = Math.sin(t * flapSpeed) * 0.45;
        leftWing.current.rotation.z = flap + 0.2;
        rightWing.current.rotation.z = -flap - 0.2;
      }
    } else if (phase === "crashed") {
      if (!crashStart.current) crashStart.current = t;
      const dur = t - crashStart.current;
      const prog = Math.min(1, dur / 1);
      const e = easeOutQuad(prog);
      const spin = dur * 8;
      group.current.position.set(
        -0.8 - e * 2 + Math.sin(dur * 12) * 0.2 * (1 - e),
        currentY.current - e * 4,
        Math.sin(spin) * 0.2 * (1 - e),
      );
      group.current.rotation.set(spin * 0.7, spin * 0.5, spin);
      if (leftWing.current && rightWing.current) {
        leftWing.current.rotation.z = e;
        rightWing.current.rotation.z = -e;
      }
    }
  });

  const color = phase === "crashed" ? "#c36" : "#ff4d92";
  const wing = phase === "crashed" ? "#0a1020" : "#0d1a30";

  return (
    <group ref={group} scale={0.7}>
      <mesh>
        <sphereGeometry args={[0.45, 24, 24]} />
        <meshStandardMaterial
          color={color}
          emissive="#ff2b7a"
          emissiveIntensity={phase === "flying" ? 0.4 : 0.2}
        />
      </mesh>
      <group position={[0.12, 0.38, 0.02]} rotation={[0.2, 0, -0.25]}>
        <mesh>
          <cylinderGeometry args={[0.065, 0.09, 0.55, 16]} />
          <meshStandardMaterial color="#ff7fb4" />
        </mesh>
      </group>
      <group position={[0.28, 0.78, 0.04]}>
        <mesh>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial color="#ffcce0" />
        </mesh>
        <mesh position={[0.1, -0.02, 0.04]} rotation={[0.1, 0, -0.5]}>
          <coneGeometry args={[0.04, 0.14, 8]} />
          <meshStandardMaterial color="#1a1a2e" />
        </mesh>
        <mesh position={[0.04, 0.025, 0.085]}>
          <sphereGeometry args={[0.022, 8, 8]} />
          <meshStandardMaterial color="#000" />
        </mesh>
      </group>
      <group ref={leftWing} position={[-0.38, 0.05, 0]}>
        <mesh rotation={[0.08, 0.08, 0.18]}>
          <boxGeometry args={[0.5, 0.05, 0.32]} />
          <meshStandardMaterial color={wing} />
        </mesh>
      </group>
      <group ref={rightWing} position={[0.38, 0.05, 0]}>
        <mesh rotation={[0.08, -0.08, -0.18]}>
          <boxGeometry args={[0.5, 0.05, 0.32]} />
          <meshStandardMaterial color={wing} />
        </mesh>
      </group>
      <mesh position={[-0.1, -0.5, 0]}>
        <cylinderGeometry args={[0.018, 0.018, 0.45, 8]} />
        <meshStandardMaterial color="#1a1a2e" />
      </mesh>
      <mesh position={[0.1, -0.5, 0]}>
        <cylinderGeometry args={[0.018, 0.018, 0.45, 8]} />
        <meshStandardMaterial color="#1a1a2e" />
      </mesh>
    </group>
  );
}

function FlightTrail({
  phase,
  flamingoY,
}: {
  phase: FlightPhase;
  flamingoY: React.MutableRefObject<number>;
}) {
  const ref = React.useRef<THREE.Mesh>(null);
  useFrame(() => {
    if (ref.current && phase === "flying")
      ref.current.position.set(-1.2, flamingoY.current, 0);
  });
  if (phase !== "flying") return null;
  return (
    <Trail
      width={1.8}
      length={5}
      color={new THREE.Color("#ff4d92")}
      attenuation={(t) => t * t}
    >
      <mesh ref={ref}>
        <sphereGeometry args={[0.02, 6, 6]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </Trail>
  );
}

function CrashExplosion({ phase }: { phase: FlightPhase }) {
  const [active, setActive] = React.useState(false);
  const light = React.useRef<THREE.PointLight>(null);
  const ring = React.useRef<THREE.Mesh>(null);

  React.useEffect(() => {
    if (phase === "crashed") {
      setActive(true);
      setTimeout(() => setActive(false), 1200);
    }
  }, [phase]);

  useFrame((state) => {
    if (!active) return;
    const e = state.clock.getElapsedTime() % 1.2;
    if (light.current)
      light.current.intensity = Math.max(0, 10 * (1 - e * 0.8));
    if (ring.current) {
      ring.current.scale.setScalar(1 + e * 5);
      (ring.current.material as THREE.MeshBasicMaterial).opacity = Math.max(
        0,
        1 - e,
      );
    }
  });

  if (!active) return null;
  return (
    <group position={[-0.8, 0, 0]}>
      <pointLight ref={light} color="#ff4d92" intensity={10} distance={12} />
      <mesh ref={ring}>
        <ringGeometry args={[0.3, 0.6, 24]} />
        <meshBasicMaterial
          color="#ff6aa7"
          transparent
          opacity={1}
          side={THREE.DoubleSide}
        />
      </mesh>
      <Sparkles
        count={100}
        size={6}
        speed={4}
        color="#ff4d92"
        scale={[6, 6, 6]}
      />
      <Sparkles
        count={50}
        size={4}
        speed={3.5}
        color="#fa0"
        scale={[5, 5, 5]}
      />
    </group>
  );
}

function CameraShake({
  phase,
  multiplier,
}: {
  phase: FlightPhase;
  multiplier: number;
}) {
  const { camera } = useThree();
  const base = React.useRef(new THREE.Vector3(0, 0.2, 5.5));
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (phase === "crashed") {
      const s = Math.sin(t * 40) * 0.12 * Math.max(0, 1 - (t % 1) * 0.7);
      camera.position.set(
        base.current.x + s,
        base.current.y + s * 0.8,
        base.current.z,
      );
    } else if (phase === "flying") {
      camera.position.x =
        base.current.x +
        Math.sin(t * 20) * 0.003 * Math.min(1, multiplier / 10);
    } else camera.position.lerp(base.current, 0.05);
  });
  return null;
}

export function FlamingoScene({
  phase,
  multiplier,
  onCollision,
}: {
  phase: FlightPhase;
  multiplier: number;
  onCollision?: () => void;
}) {
  const flamingoY = React.useRef(0);
  const handleCollision = React.useCallback(() => {
    if (onCollision) onCollision();
  }, [onCollision]);

  return (
    <Canvas
      camera={{ position: [0, 0.2, 5.5], fov: 42 }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 2]}
    >
      <mesh scale={12}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial
          color={phase === "crashed" ? "#1a1018" : "#0a2540"}
          side={THREE.BackSide}
        />
      </mesh>
      <Stars radius={40} depth={25} count={300} factor={2.5} fade speed={0.3} />
      <fog
        attach="fog"
        args={[phase === "crashed" ? "#1a1018" : "#0a2540", 4, 18]}
      />
      <ambientLight intensity={0.6} />
      <directionalLight intensity={1.6} position={[3, 4, 3]} />
      <pointLight intensity={1.1} position={[-3, 2, 3]} color="#ff6aa7" />
      <pointLight intensity={0.5} position={[2, 0, 4]} color="#8af" />
      {phase === "flying" && multiplier > 2 && (
        <pointLight
          intensity={Math.min(1, multiplier / 10)}
          position={[4, 0, 2]}
          color="#f33"
        />
      )}

      <CrowManager
        phase={phase}
        multiplier={multiplier}
        flamingoY={flamingoY}
        onCollision={handleCollision}
      />
      <FlightTrail phase={phase} flamingoY={flamingoY} />
      <CrashExplosion phase={phase} />

      {phase === "waiting" ? (
        <Float speed={1.2} floatIntensity={0.15}>
          <Flamingo
            phase={phase}
            multiplier={multiplier}
            positionY={flamingoY}
          />
        </Float>
      ) : (
        <Flamingo phase={phase} multiplier={multiplier} positionY={flamingoY} />
      )}

      <Sparkles
        count={phase === "flying" ? 30 + multiplier * 3 : 15}
        size={1.5}
        speed={phase === "flying" ? 0.3 + multiplier * 0.05 : 0.1}
        color={phase === "crashed" ? "#ff4d92" : "#6ff0ff"}
        scale={[12, 6, 5]}
        opacity={0.5}
      />
      <CameraShake phase={phase} multiplier={multiplier} />
    </Canvas>
  );
}
