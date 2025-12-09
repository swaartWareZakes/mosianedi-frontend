"use client";

import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, Grid, Text } from "@react-three/drei";
import * as THREE from "three";

function RoadSegment({ width, length, condition }: { width: number, length: number, condition: number }) {
  const meshRef = useRef<THREE.Mesh>(null);

  // Color logic: Green (Good) -> Red (Bad)
  const color = new THREE.Color().lerpColors(
    new THREE.Color("#34d399"), // Emerald
    new THREE.Color("#ef4444"), // Red
    Math.min(condition / 10, 1) // IRI normalized
  );

  return (
    <group>
      {/* 1. PAVEMENT SURFACE */}
      <mesh ref={meshRef} position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow castShadow>
        <planeGeometry args={[width, length]} />
        <meshStandardMaterial 
            color="#334155" 
            roughness={0.8} 
            metalness={0.1}
        />
      </mesh>

      {/* 2. BASE LAYER (The Dirt Underneath) */}
      <mesh position={[0, -0.25, 0]}>
        <boxGeometry args={[width, 0.5, length]} />
        <meshStandardMaterial color="#78350f" /> {/* Brown Soil */}
      </mesh>

      {/* 3. LANE MARKINGS */}
      <mesh position={[0, 0.11, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.2, length]} />
        <meshBasicMaterial color="#ffffff" side={THREE.DoubleSide} />
      </mesh>

      {/* 4. CONDITION INDICATOR (Floating Sphere) */}
      <mesh position={[0, 2, 0]}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
}

export default function RoadModel3D({ width = 8, length = 20, iri = 2.0 }) {
  return (
    <div className="h-[500px] w-full bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl relative">
        <Canvas shadows camera={{ position: [10, 5, 10], fov: 45 }}>
            <color attach="background" args={["#0f172a"]} />
            <fog attach="fog" args={["#0f172a", 10, 30]} />
            
            {/* Lights */}
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
            <spotLight position={[-10, 10, -5]} intensity={0.5} />

            {/* The Road */}
            <RoadSegment width={width} length={length} condition={iri} />

            {/* Environment */}
            <Grid infiniteGrid fadeDistance={30} sectionColor="#4f46e5" cellColor="#1e293b" />
            <OrbitControls minPolarAngle={0} maxPolarAngle={Math.PI / 2.2} />
            <Environment preset="city" />
        </Canvas>
        
        {/* Overlay Label */}
        <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md px-4 py-2 rounded-lg text-white border border-white/10 pointer-events-none select-none">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/50">3D Inspector</h3>
            <p className="text-xl font-mono">IRI {iri.toFixed(1)}</p>
        </div>
    </div>
  );
}