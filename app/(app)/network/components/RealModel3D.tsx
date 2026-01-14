"use client";

import React, { useMemo, useRef, useState, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Sky, PerspectiveCamera, Cloud } from "@react-three/drei";
import * as THREE from "three";

// --- Types ---
type SurfaceType = "paved" | "gravel";
export type CargoType = "electronics" | "bricks" | "produce";
export type WeatherType = "sunny" | "rain";

interface ModelProps {
  width?: number;
  iri?: number;
  surface?: SurfaceType;
  showLayers?: boolean;
  isDriving?: boolean;
  onDriveComplete?: () => void;
  province?: string;
  cargoWeight?: number;
  cargoType?: CargoType;
  weather?: WeatherType;
  speedLimit?: number;
}

// --- SUB-COMPONENT: RAIN SYSTEM ---
function RainSystem({ active }: { active: boolean }) {
  const count = 2000;

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 100;
      pos[i * 3 + 1] = Math.random() * 40;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 100;
    }
    return pos;
  }, [count]);

  const ref = useRef<THREE.Points>(null);

  useFrame((_, delta) => {
    if (!active) return;
    if (!ref.current) return;

    const posAttribute = ref.current.geometry.getAttribute(
      "position"
    ) as THREE.BufferAttribute;

    const array = posAttribute.array as Float32Array;

    for (let i = 0; i < count; i++) {
      array[i * 3 + 1] -= 25 * delta;
      if (array[i * 3 + 1] < 0) array[i * 3 + 1] = 40;
    }

    posAttribute.needsUpdate = true;
  });

  return (
    <points ref={ref} visible={active}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#a5f3fc"
        size={0.15}
        transparent
        opacity={0.6}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

// --- SUB-COMPONENT: CHASE CAMERA ---
function ChaseCamera({
  targetRef,
  iri,
}: {
  targetRef: React.MutableRefObject<THREE.Group>;
  iri: number;
}) {
  const { camera } = useThree();
  const vec = new THREE.Vector3();

  useFrame((state) => {
    if (!targetRef.current) return;

    const truckPos = targetRef.current.position;
    const targetCamPos = new THREE.Vector3(0, 5, truckPos.z - 18);
    const lookAtPos = new THREE.Vector3(0, 2, truckPos.z + 20);

    const time = state.clock.getElapsedTime();
    const shakeIntensity = (Math.max(0, iri - 3) / 10) * 0.5;

    const noiseX = Math.sin(time * 20) * shakeIntensity;
    const noiseY = Math.cos(time * 25) * shakeIntensity;

    vec.copy(targetCamPos).add(new THREE.Vector3(noiseX, noiseY, 0));
    camera.position.lerp(vec, 0.08);
    camera.lookAt(lookAtPos);
  });

  return null;
}

// --- SUB-COMPONENT: TRUCK ---
function Truck({
  isDriving,
  iri,
  onComplete,
  sharedRef,
  cargoType,
  cargoWeight,
  weather,
  speedLimit,
}: any) {
  const cargoRef = useRef<THREE.Group>(null);
  const [lightTarget, setLightTarget] = useState<THREE.Object3D | null>(null);

  const baseSpeed = (speedLimit || 80) / 3.6;
  const weatherPenalty = weather === "rain" ? 0.7 : 1.0;
  const conditionFactor = Math.max(0.2, 1 - iri / 20);
  const currentSpeed = Math.min(35, baseSpeed * weatherPenalty * conditionFactor);
  const maxDistance = 450;

  useFrame((state, delta) => {
    if (!sharedRef.current) return;
    const group = sharedRef.current;

    if (isDriving) {
      group.position.z += currentSpeed * delta;

      const time = state.clock.getElapsedTime();
      const bounceAmplitude = (iri / 15) * 0.4;
      const yBounce =
        Math.sin(time * 20) * bounceAmplitude +
        Math.cos(time * 35) * (bounceAmplitude * 0.5);
      group.position.y = yBounce;

      if (cargoRef.current) {
        cargoRef.current.rotation.z = Math.sin(time * 12) * (bounceAmplitude * 1.5);
        cargoRef.current.rotation.x = Math.cos(time * 18) * (bounceAmplitude * 1.5);
      }

      if (group.position.z > maxDistance) onComplete();
    } else {
      group.position.z = -20;
      group.position.y = 0;
      if (cargoRef.current) cargoRef.current.rotation.set(0, 0, 0);
    }
  });

  const cargoColor =
    cargoType === "bricks" ? "#7f1d1d" : cargoType === "produce" ? "#65a30d" : "#fbbf24";

  return (
    <group ref={sharedRef} position={[2, 0, -20]}>
      <object3D ref={setLightTarget} position={[0, 0, 20]} />

      {/* ↓↓↓ PERF FIX: in rain, don’t go crazy on spotlight intensity/shadows */}
      {lightTarget && (
        <>
          <spotLight
            position={[0.8, 1.5, 2.5]}
            target={lightTarget}
            angle={0.6}
            penumbra={0.5}
            intensity={weather === "rain" ? 10 : 12}
            color="#fffbeb"
            distance={weather === "rain" ? 60 : 60}
            castShadow={false}
          />
          <spotLight
            position={[-0.8, 1.5, 2.5]}
            target={lightTarget}
            angle={0.6}
            penumbra={0.5}
            intensity={weather === "rain" ? 10 : 12}
            color="#fffbeb"
            distance={weather === "rain" ? 60 : 60}
            castShadow={false}
          />
        </>
      )}

      <mesh position={[0, 0.6, 0]} castShadow>
        <boxGeometry args={[2.2, 0.5, 6]} />
        <meshStandardMaterial color="#b91c1c" roughness={0.4} />
      </mesh>

      <mesh position={[0, 1.8, 2]} castShadow>
        <boxGeometry args={[2.2, 1.8, 1.8]} />
        <meshStandardMaterial color="#991b1b" />
      </mesh>

      <mesh position={[0, 2.2, 2.91]}>
        <planeGeometry args={[2, 0.8]} />
        <meshStandardMaterial color="#1e293b" roughness={0.1} metalness={0.8} />
      </mesh>

      <group ref={cargoRef} position={[0, 0.9, -1]}>
        <mesh position={[0, 0.6, 0]} castShadow>
          <boxGeometry args={[2, 1.2 + cargoWeight / 100, 2]} />
          <meshStandardMaterial color={cargoColor} />
        </mesh>
      </group>

      <mesh position={[-1.2, 0.4, 1.5]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.4, 0.4, 0.4]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      <mesh position={[1.2, 0.4, 1.5]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.4, 0.4, 0.4]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      <mesh position={[-1.2, 0.4, -1.5]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.4, 0.4, 0.4]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      <mesh position={[1.2, 0.4, -1.5]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.4, 0.4, 0.4]} />
        <meshStandardMaterial color="#111" />
      </mesh>
    </group>
  );
}

// --- SUB-COMPONENT: ROAD SEGMENT ---
function RoadSegment({ width, length, condition, surface, showLayers, weather }: any) {
  const isWet = weather === "rain";
  const roadColor = surface === "paved" ? (isWet ? "#1e293b" : "#334155") : "#d97706";
  const roughness = surface === "paved" ? (isWet ? 0.1 : 0.6) : 1.0;

  const potholes = useMemo(() => {
    if (condition < 4) return [];
    return Array.from({ length: Math.floor((condition - 3) * 2) }).map(() => ({
      x: (Math.random() - 0.5) * (width - 1),
      z: (Math.random() - 0.5) * (length - 2),
      size: 0.2 + Math.random() * 0.4,
    }));
  }, [condition, width, length]);

  const layerGap = showLayers ? 0.6 : 0;

  return (
    <group>
      <mesh
        position={[0, 0.1 + layerGap * 2, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[width, length, 16, 16]} />
        <meshStandardMaterial color={roadColor} roughness={roughness} metalness={isWet ? 0.4 : 0.1} />
      </mesh>

      {potholes.map((ph, i) => (
        <mesh
          key={i}
          position={[ph.x, 0.11 + layerGap * 2, ph.z]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <circleGeometry args={[ph.size, 16]} />
          <meshStandardMaterial color={isWet ? "#000" : "#0f172a"} roughness={isWet ? 0 : 1} />
        </mesh>
      ))}

      {surface === "paved" && (
        <mesh position={[0, 0.11 + layerGap * 2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.15, length]} />
          <meshBasicMaterial color="#fff" />
        </mesh>
      )}

      <mesh position={[0, -0.25 + layerGap, 0]}>
        <boxGeometry args={[width, 0.5, length]} />
        <meshStandardMaterial color="#78350f" />
      </mesh>
    </group>
  );
}

// --- ENVIRONMENT ---
function Biome({ province, weather }: { province: string; weather: string }) {
  const isFreeState = province.toLowerCase().includes("free");
  const roughness = weather === "rain" ? 0.2 : 1;
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.8, 0]} receiveShadow>
      <planeGeometry args={[1000, 1000]} />
      <meshStandardMaterial color={isFreeState ? "#eab308" : "#166534"} roughness={roughness} />
    </mesh>
  );
}

export default function RealModel3D({
  width = 8,
  iri = 2.0,
  surface = "paved",
  showLayers = false,
  isDriving = false,
  onDriveComplete,
  province = "Gauteng",
  cargoWeight = 10,
  cargoType = "electronics",
  weather = "sunny",
  speedLimit = 120,
}: ModelProps) {
  const truckRef = useRef<THREE.Group>(null!);

  return (
    <div className="h-full w-full bg-slate-900 relative rounded-xl overflow-hidden shadow-2xl">
      <Canvas
        shadows
        // ↓↓↓ PERF FIX: lower DPR so rain mode doesn’t kill the GPU
        dpr={[1, 1.2]}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        onCreated={({ gl }) => {
          // Avoid the white "blank" look if context drops for a frame
          gl.setClearColor(new THREE.Color("#0b1220"), 1);

          // Optional: prove context loss if it happens
          const el = gl.domElement;
          el.addEventListener("webglcontextlost", (e) => {
            e.preventDefault();
            console.warn("⚠️ WebGL context lost");
          });
        }}
      >
        {/* Force consistent background */}
        <color attach="background" args={["#0b1220"]} />

        <PerspectiveCamera makeDefault position={[15, 10, 15]} fov={50} far={1000} />

        <Sky
          sunPosition={weather === "rain" ? [0, 10, -100] : [100, 20, 100]}
          turbidity={weather === "rain" ? 18 : 10}
          rayleigh={weather === "rain" ? 0.15 : 0.5}
        />

        {/* PERF FIX: make clouds lighter. If it still blanks, comment this out to confirm Cloud is the culprit. */}
        {weather === "rain" && (
          <Suspense fallback={null}>
            <Cloud
              opacity={0.25}
              speed={0.25}
              bounds={[35, 4, 35]}
              segments={10}
              position={[0, 18, 0]}
            />
          </Suspense>
        )}

        <ambientLight intensity={weather === "rain" ? 0.25 : 0.6} />

        <directionalLight
          position={[50, 50, 25]}
          intensity={weather === "rain" ? 0.6 : 1.4}
          castShadow
          shadow-mapSize={[1024, 1024]}
        />

        <Biome province={province} weather={weather} />
        <RainSystem active={weather === "rain"} />

        {/* ROAD LOOP */}
        {Array.from({ length: 15 }).map((_, i) => (
          <group key={i} position={[0, 0, i * 30 - 40]}>
            <RoadSegment
              width={width}
              length={30}
              condition={iri}
              surface={surface}
              showLayers={showLayers}
              weather={weather}
            />
          </group>
        ))}

        <Truck
          sharedRef={truckRef}
          isDriving={isDriving}
          iri={iri}
          onComplete={onDriveComplete}
          cargoType={cargoType}
          cargoWeight={cargoWeight}
          weather={weather}
          speedLimit={speedLimit}
        />

        {isDriving ? (
          <ChaseCamera targetRef={truckRef} iri={iri} />
        ) : (
          <OrbitControls minPolarAngle={0} maxPolarAngle={Math.PI / 2.1} maxDistance={60} />
        )}
      </Canvas>
    </div>
  );
}