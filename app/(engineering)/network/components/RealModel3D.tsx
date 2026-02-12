"use client";

import React, { useMemo, useRef, Suspense } from "react";
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
export type CargoType = "electronics" | "bricks" | "produce";
export type WeatherType = "sunny" | "rain";

export interface ModelProps {
  iri?: number;
  surface?: SurfaceType;
  isDriving?: boolean;
  onDriveComplete?: (results: { integrity: number; loss: number }) => void;
  speedLimit?: number;
  potholeCount?: number;
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
  // Sit slightly into the road so it doesn't clip
  return <primitive object={scene.clone()} position={[position[0], -0.3, position[2]]} scale={1.2} />;
}

function ModernGameRoad({ speed, isDriving, iri = 2 }: { speed: number; isDriving: boolean; iri: number }) {
  const groupRef = useRef<THREE.Group>(null!);

  const potholes = useMemo(() => {
    const p: { id: number; z: number; x: number }[] = [];
    const count = iri > 4 ? 12 : 4;
    for (let i = 0; i < count; i++) {
      p.push({
        id: i,
        z: Math.random() * 80,
        x: (Math.random() - 0.5) * 8,
      });
    }
    return p;
  }, [iri]);

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
      {[0, 29.8, 59.6, 89.4].map((z) => (
        <group key={z} position={[0, 0, z]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[22, 30.2]} />
            <meshStandardMaterial color="#1f2937" roughness={0.8} metalness={0.1} />
          </mesh>

          {potholes.map((p) => (
            <PotholeModel key={p.id} position={[p.x, 0, (p.z % 30) - 15]} />
          ))}

          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
            <planeGeometry args={[0.3, 8]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.4} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function GameTruck({ isDriving, iri = 2.0, speedLimit = 80, onComplete }: any) {
  const { scene } = useGLTF("/models/truck.glb");
  const groupRef = useRef<THREE.Group>(null!);
  const driveTime = useRef(0);
  const totalSimTime = 10;

  useFrame((state, delta) => {
    if (!isDriving) return;

    driveTime.current += delta;

    const time = state.clock.getElapsedTime();
    const intensity = (iri / 10) * (speedLimit / 100);

    // Keep wheels aligned to asphalt
    groupRef.current.position.y = 1.15 + Math.sin(time * 38) * (intensity * 0.25);
    groupRef.current.rotation.z = Math.sin(time * 22) * (intensity * 0.1);

    if (driveTime.current >= totalSimTime) {
      driveTime.current = 0;
      onComplete?.({ integrity: Math.max(10, 100 - iri * 11), loss: iri * 1650 });
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

          <GameTruck {...props} onComplete={props.onDriveComplete} />
          <ModernGameRoad speed={props.speedLimit || 80} isDriving={!!props.isDriving} iri={props.iri || 2} />
          <Scenery speed={props.speedLimit || 80} isDriving={!!props.isDriving} />

          <ContactShadows opacity={0.6} scale={40} blur={2.5} far={10} color="#000000" />
        </Suspense>

        <PerspectiveCamera makeDefault position={[20, 15, 28]} fov={35} />
        <OrbitControls enablePan={false} maxPolarAngle={Math.PI / 2.1} />
      </Canvas>
    </div>
  );
}