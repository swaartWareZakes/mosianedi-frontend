"use client";

import React, { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { 
  Text, 
  Float, 
  OrbitControls, 
  PerspectiveCamera, 
  ContactShadows, 
  Environment, 
  Stars 
} from "@react-three/drei";
import * as THREE from "three";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

// --- 3D COMPONENTS ---

function RoadSegment() {
  return (
    <group rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]}>
      {/* Asphalt */}
      <mesh receiveShadow>
        <planeGeometry args={[10, 20]} />
        <meshStandardMaterial 
            color="#1e293b" 
            roughness={0.8} 
            metalness={0.2}
        />
      </mesh>
      {/* Road Markings (Yellow Line) */}
      <mesh position={[0, 0, 0.02]}>
        <planeGeometry args={[0.3, 20]} />
        <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.5} />
      </mesh>
      {/* White Lines */}
      <mesh position={[-3, 0, 0.02]}>
        <planeGeometry args={[0.2, 20]} />
        <meshStandardMaterial color="white" opacity={0.5} transparent />
      </mesh>
      <mesh position={[3, 0, 0.02]}>
        <planeGeometry args={[0.2, 20]} />
        <meshStandardMaterial color="white" opacity={0.5} transparent />
      </mesh>
    </group>
  );
}

function TrafficCone({ position }: { position: [number, number, number] }) {
  const mesh = useRef<THREE.Mesh>(null);
  
  // Subtle bounce animation
  useFrame((state) => {
    if (mesh.current) {
        mesh.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2 + position[0]) * 0.1;
    }
  });

  return (
    <group position={position}>
      <mesh ref={mesh} castShadow>
        <coneGeometry args={[0.4, 1.5, 32]} />
        <meshStandardMaterial color="#f97316" roughness={0.3} />
      </mesh>
      {/* Reflective Strip */}
      <mesh position={[0, 0.4, 0]}>
        <cylinderGeometry args={[0.25, 0.3, 0.3, 32]} />
        <meshStandardMaterial color="white" emissive="white" emissiveIntensity={0.8} />
      </mesh>
      <mesh position={[0, -0.75, 0]}>
        <boxGeometry args={[0.9, 0.1, 0.9]} />
        <meshStandardMaterial color="#1f2937" />
      </mesh>
    </group>
  );
}

function FloatingText() {
  return (
    <Float speed={2} rotationIntensity={0.1} floatIntensity={0.5} floatingRange={[0, 0.5]}>
      <group position={[0, 1.5, -2]}>
        <Text
          fontSize={1.2}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff"
        >
          SYSTEM UPGRADE
        </Text>
        <Text
          position={[0, -0.8, 0]}
          fontSize={0.4}
          color="#94a3b8"
          anchorX="center"
          anchorY="middle"
          font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff"
        >
          We are paving the way for better data.
        </Text>
        <Text
            position={[0, -1.4, 0]}
            fontSize={0.25}
            color="#6366f1"
            anchorX="center"
            anchorY="middle"
        >
            ESTIMATED COMPLETION: 3 Days
        </Text>
      </group>
    </Float>
  );
}

// --- MAIN PAGE COMPONENT ---

export default function MaintenancePage() {
  const router = useRouter();

  return (
    <div className="h-screen w-screen bg-[#020617] text-white overflow-hidden relative">
      
      {/* 3D Canvas */}
      <div className="absolute inset-0 z-0">
        <Canvas shadows dpr={[1, 2]}>
          <PerspectiveCamera makeDefault position={[0, 3, 8]} fov={50} />
          
          {/* Lighting */}
          <ambientLight intensity={0.5} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
          <pointLight position={[-10, -10, -10]} intensity={0.5} color="blue" />

          {/* Environment */}
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
          <Environment preset="city" />

          {/* Objects */}
          <group position={[0, -1, 0]}>
            <RoadSegment />
            <TrafficCone position={[-2, 0, 2]} />
            <TrafficCone position={[2, 0, 4]} />
            <TrafficCone position={[-1.5, 0, 5]} />
            <FloatingText />
          </group>

          {/* Shadows on the floor */}
          <ContactShadows resolution={1024} scale={20} blur={2} opacity={0.5} far={10} color="#000000" />

          {/* Controls (Auto Rotate for cinematic feel) */}
          <OrbitControls 
            enableZoom={false} 
            enablePan={false} 
            autoRotate 
            autoRotateSpeed={0.5} 
            maxPolarAngle={Math.PI / 2.1} 
            minPolarAngle={Math.PI / 3}
          />
        </Canvas>
      </div>

      {/* Overlay UI */}
      <div className="absolute top-0 left-0 w-full p-8 z-10 flex justify-between items-start pointer-events-none">
        <div className="pointer-events-auto">
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-500 animate-pulse"/>
                Maintenance Mode
            </h1>
            <p className="text-xs text-slate-400 font-mono mt-1">
                Server Patch v2.4.1 • Deploying updates
            </p>
        </div>
      </div>

      <div className="absolute bottom-10 w-full text-center z-10 pointer-events-none">
        <div className="pointer-events-auto inline-block">
            <button 
                onClick={() => router.back()}
                className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 rounded-full text-sm font-medium transition-all hover:scale-105"
            >
                <ArrowLeft className="w-4 h-4" /> Go Back
            </button>
        </div>
      </div>

    </div>
  );
}