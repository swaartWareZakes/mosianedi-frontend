"use client";

import React, { useMemo, useRef, Suspense, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  PerspectiveCamera,
  useGLTF,
  Environment,
  ContactShadows,
  Stars,
  Sky,
} from "@react-three/drei";
import * as THREE from "three";

export type SurfaceType = "paved" | "gravel";

export interface ModelProps {
  iri?: number;
  surface?: SurfaceType;
  isDriving?: boolean;

  // acts as “density multiplier” from the UI
  potholeCount?: number;

  speedLimit?: number;

  onDriveComplete?: (results: {
    iri: number;
    surface: SurfaceType;
    integrity: number;
    loss: number;
    impactCount: number;
    avgShock: number;
    maxShock: number;
  }) => void;
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function Scenery({ speed, isDriving }: { speed: number; isDriving: boolean }) {
  const { scene: treeScene } = useGLTF("/models/tree.glb");
  const { scene: barrierScene } = useGLTF("/models/barrier.glb");
  const groupRef = useRef<THREE.Group>(null!);

  useFrame((_, delta) => {
    if (isDriving && groupRef.current) {
      groupRef.current.children.forEach((child) => {
        child.position.z -= (speed / 7) * delta;
        if (child.position.z < -40) child.position.z = 120;
      });
    }
  });

  return (
    <group ref={groupRef}>
      {[0, 30, 60, 90, 120].map((z) => (
        <React.Fragment key={`trees-${z}`}>
          <primitive object={treeScene.clone()} position={[-15, 0, z]} scale={2.5} />
          <primitive object={treeScene.clone()} position={[15, 0, z + 15]} scale={2.5} />
        </React.Fragment>
      ))}

      {Array.from({ length: 80 }).map((_, i) => (
        <React.Fragment key={`barriers-${i}`}>
          <primitive
            object={barrierScene.clone()}
            position={[11, 0, i * 2.5]}
            scale={[1.5, 1.5, 3]}
            rotation={[0, Math.PI / 2, 0]}
          />
          <primitive
            object={barrierScene.clone()}
            position={[-11, 0, i * 2.5]}
            scale={[1.5, 1.5, 3]}
            rotation={[0, Math.PI / 2, 0]}
          />
        </React.Fragment>
      ))}
    </group>
  );
}

function PotholeModel({ position }: { position: [number, number, number] }) {
  const { scene } = useGLTF("/models/potholes.glb");
  return <primitive object={scene.clone()} position={[position[0], -0.3, position[2]]} scale={1.2} />;
}

/**
 * ✅ NEW: a deformable road tile
 * - increases bumpiness + depressions as IRI rises
 * - adds extra depressions based on density + surface
 */
function DeformRoadTile({
  iri,
  surface,
  potholeDensity,
  tileIndex,
}: {
  iri: number;
  surface: SurfaceType;
  potholeDensity: number;
  tileIndex: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const geomRef = useRef<THREE.PlaneGeometry>(null!);

  // higher segments = smoother deformation (but more CPU)
  const width = 22;
  const height = 30.2;
  const segW = 50;
  const segH = 50;

  // store original positions so we can regenerate quickly
  const base = useRef<Float32Array | null>(null);

  // generate pothole “centers” for deformation (not the GLB visuals)
  const potholeCenters = useMemo(() => {
    const iriFactor = clamp((iri - 1) / 9, 0, 1);
    const densityFactor = clamp(potholeDensity / 4, 0.25, 5);
    const surfaceFactor = surface === "gravel" ? 1.25 : 1.0;

    const count = clamp(Math.round(6 + iriFactor * 14 * densityFactor * surfaceFactor), 4, 40);

    return Array.from({ length: count }).map(() => ({
      x: (Math.random() - 0.5) * (width * 0.75),
      y: (Math.random() - 0.5) * (height * 0.75),
      r: 0.6 + Math.random() * 1.6, // radius
      d: 0.05 + Math.random() * 0.18, // depth
    }));
  }, [iri, surface, potholeDensity]);

  // rebuild deformation whenever IRI/surface/density changes
  useEffect(() => {
    const geom = geomRef.current;
    if (!geom) return;

    const pos = geom.attributes.position.array as Float32Array;

    if (!base.current) {
      base.current = new Float32Array(pos); // snapshot original positions
    } else {
      pos.set(base.current); // restore
    }

    const iriFactor = clamp((iri - 1) / 9, 0, 1);
    const surfaceFactor = surface === "gravel" ? 1.35 : 1.0;

    // bump amplitude scales with IRI
    const bumpAmp = (0.02 + iriFactor * 0.22) * surfaceFactor;

    // procedural bumps: sin/cos noise
    for (let i = 0; i < pos.length; i += 3) {
      const x = pos[i + 0];
      const y = pos[i + 1];

      const n =
        Math.sin(x * 0.65 + tileIndex * 0.4) * 0.55 +
        Math.cos(y * 0.55 + tileIndex * 0.2) * 0.45 +
        Math.sin((x + y) * 0.25) * 0.35;

      pos[i + 2] += n * bumpAmp; // z becomes “up” after mesh rotation
    }

    // pothole depressions
    for (let i = 0; i < pos.length; i += 3) {
      const x = pos[i + 0];
      const y = pos[i + 1];

      let depression = 0;
      for (const p of potholeCenters) {
        const dx = x - p.x;
        const dy = y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < p.r) {
          const t = 1 - dist / p.r;
          depression -= (t * t) * p.d * (0.7 + iriFactor); // stronger when IRI is high
        }
      }

      pos[i + 2] += depression;
    }

    geom.attributes.position.needsUpdate = true;
    geom.computeVertexNormals();
  }, [iri, surface, potholeDensity, tileIndex, potholeCenters]);

  const roadColor = surface === "gravel" ? "#3f2a1d" : "#1f2937";
  const iriFactor = clamp((iri - 1) / 9, 0, 1);

  // roughness/metalness changes by IRI (visual)
  const roughness = clamp(0.78 + iriFactor * 0.18, 0.75, 0.98);
  const metalness = surface === "gravel" ? 0.02 : 0.06;

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry ref={geomRef} args={[width, height, segW, segH]} />
      <meshStandardMaterial color={roadColor} roughness={roughness} metalness={metalness} />
    </mesh>
  );
}

function ModernGameRoad({
  speed,
  isDriving,
  iri = 3.5,
  potholeDensity = 4,
  surface = "paved",
}: {
  speed: number;
  isDriving: boolean;
  iri: number;
  potholeDensity: number;
  surface: SurfaceType;
}) {
  const groupRef = useRef<THREE.Group>(null!);

  // pothole GLB visuals increase with IRI + density + surface
  const potholes = useMemo(() => {
    const iriFactor = clamp(iri / 6, 0.25, 1.7);
    const densityFactor = clamp(potholeDensity / 4, 0.25, 5);
    const surfaceFactor = surface === "gravel" ? 1.35 : 1.0;

    const total = clamp(Math.round(10 * iriFactor * densityFactor * surfaceFactor), 4, 85);

    const p: { id: number; z: number; x: number }[] = [];
    for (let i = 0; i < total; i++) {
      p.push({
        id: i,
        z: Math.random() * 80,
        x: (Math.random() - 0.5) * 8,
      });
    }
    return p;
  }, [iri, potholeDensity, surface]);

  useFrame((_, delta) => {
    if (isDriving && groupRef.current) {
      groupRef.current.children.forEach((child) => {
        child.position.z -= (speed / 7) * delta;
        if (child.position.z < -30) child.position.z = 89.2;
      });
    }
  });

  return (
    <group ref={groupRef}>
      {[0, 29.8, 59.6, 89.4].map((z, idx) => (
        <group key={z} position={[0, 0, z]}>
          {/* ✅ deformable road */}
          <DeformRoadTile iri={iri} surface={surface} potholeDensity={potholeDensity} tileIndex={idx} />

          {/* pothole GLB overlays */}
          {potholes.map((p) => (
            <PotholeModel key={`${z}-${p.id}`} position={[p.x, 0, (p.z % 30) - 15]} />
          ))}

          {/* center line */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
            <planeGeometry args={[0.3, 8]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={surface === "gravel" ? 0.10 : 0.32} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/**
 * Impact model (same as before, but now road looks worse too)
 */
function GameTruck({
  isDriving,
  iri = 3.5,
  surface = "paved",
  potholeCount = 4,
  speedLimit = 80,
  onComplete,
}: {
  isDriving: boolean;
  iri: number;
  surface: SurfaceType;
  potholeCount: number;
  speedLimit: number;
  onComplete?: (r: any) => void;
}) {
  const { scene } = useGLTF("/models/truck.glb");
  const groupRef = useRef<THREE.Group>(null!);

  const driveTime = useRef(0);
  const totalSimTime = 10;

  const impactCount = useRef(0);
  const shockSum = useRef(0);
  const maxShock = useRef(0);
  const damage = useRef(0);
  const jolt = useRef(0);

  useFrame((state, delta) => {
    if (!isDriving) return;

    driveTime.current += delta;

    const t = state.clock.getElapsedTime();

    const iriN = clamp(iri, 1, 10);
    const speedN = clamp(speedLimit / 100, 0.6, 1.4);
    const densityN = clamp(potholeCount / 4, 0.25, 5);
    const surfaceFactor = surface === "gravel" ? 1.35 : 1.0;

    const baseRate =
      0.18 *
      (0.45 + iriN / 7) *
      (0.65 + speedN) *
      (0.55 + densityN / 2.2) *
      surfaceFactor;

    const p = clamp(baseRate * delta, 0, 0.75);

    if (Math.random() < p) {
      const shock =
        (0.35 + iriN / 10) * (0.45 + speedN) * (0.6 + Math.random() * 0.7) * surfaceFactor;

      impactCount.current += 1;
      shockSum.current += shock;
      maxShock.current = Math.max(maxShock.current, shock);

      const damageHit = shock * (0.55 + iriN / 12) * 3.6;
      damage.current += damageHit;

      jolt.current = Math.min(1.2, jolt.current + shock * 0.6);
    }

    jolt.current = Math.max(0, jolt.current - delta * 1.8);

    const intensity = (iriN / 10) * (speedN / 1.1);
    const burst = jolt.current;

    groupRef.current.position.y =
      1.15 + Math.sin(t * 38) * (intensity * 0.18) + burst * 0.22;
    groupRef.current.rotation.z =
      Math.sin(t * 22) * (intensity * 0.08) + burst * 0.12;

    if (driveTime.current >= totalSimTime) {
      const integrity = clamp(100 - damage.current, 5, 100);
      const avgShock = impactCount.current > 0 ? shockSum.current / impactCount.current : 0;

      const loss =
        (impactCount.current * 420 + avgShock * 1800 + (100 - integrity) * 90) *
        (surface === "gravel" ? 1.2 : 1.0);

      driveTime.current = 0;

      const out = {
        iri: iriN,
        surface,
        integrity,
        loss,
        impactCount: impactCount.current,
        avgShock,
        maxShock: maxShock.current,
      };

      impactCount.current = 0;
      shockSum.current = 0;
      maxShock.current = 0;
      damage.current = 0;
      jolt.current = 0;

      onComplete?.(out);
    }
  });

  return (
    <group ref={groupRef} position={[0, 1.15, 10]}>
      <primitive object={scene} scale={2.8} rotation={[0, Math.PI / 2, 0]} />
      <pointLight position={[0, 1.5, 0]} color="#00f2ff" intensity={25} distance={12} />
    </group>
  );
}

export default function RealModel3D(props: ModelProps) {
  const iri = clamp(Number(props.iri ?? 3.5), 1, 10);
  const speed = Number(props.speedLimit ?? 80);
  const potholeDensity = clamp(Number(props.potholeCount ?? 4), 1, 20);
  const surface = (props.surface ?? "paved") as SurfaceType;

  return (
    <div className="w-full h-full bg-[#020617]">
      <Canvas shadows gl={{ antialias: true }}>
        <color attach="background" args={["#0a192f"]} />
        <Sky sunPosition={[100, 10, 100]} turbidity={0.1} rayleigh={2} />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        <fog attach="fog" args={["#0a192f", 20, 90]} />

        <Suspense fallback={null}>
          <Environment preset="city" />
          <ambientLight intensity={0.7} />
          <directionalLight position={[10, 20, 10]} intensity={1.5} castShadow />

          <GameTruck
            isDriving={!!props.isDriving}
            iri={iri}
            surface={surface}
            potholeCount={potholeDensity}
            speedLimit={speed}
            onComplete={props.onDriveComplete}
          />

          <ModernGameRoad
            speed={speed}
            isDriving={!!props.isDriving}
            iri={iri}
            potholeDensity={potholeDensity}
            surface={surface}
          />

          <Scenery speed={speed} isDriving={!!props.isDriving} />

          <ContactShadows opacity={0.6} scale={40} blur={2.5} far={10} color="#000000" />
        </Suspense>

        <PerspectiveCamera makeDefault position={[20, 15, 28]} fov={35} />
        <OrbitControls enablePan={false} maxPolarAngle={Math.PI / 2.1} />
      </Canvas>
    </div>
  );
}