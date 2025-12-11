"use client";

import React, { useRef, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, Grid } from "@react-three/drei";
import * as THREE from "three";

// 1. Separate the Mesh Logic into a Sub-Component
function RoadSegment({ width, length, condition }: { width: number, length: number, condition: number }) {
  // Color logic: Green (Good) -> Red (Bad)
  // We calculate this outside the JSX to avoid re-instantiating objects too often
  const color = new THREE.Color().lerpColors(
    new THREE.Color("#10b981"), // Emerald
    new THREE.Color("#ef4444"), // Red
    Math.min(condition / 10, 1) // Normalized based on IRI max 10
  );

  return (
    <group>
      {/* Pavement Layer */}
      <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow castShadow>
        <planeGeometry args={[width, length]} />
        <meshStandardMaterial 
            color="#334155" 
            roughness={0.9} 
            metalness={0.1}
        />
      </mesh>

      {/* Base Layer (Dirt) */}
      <mesh position={[0, -0.25, 0]}>
        <boxGeometry args={[width, 0.5, length]} />
        <meshStandardMaterial color="#78350f" /> 
      </mesh>

      {/* Lane Markings */}
      <mesh position={[0, 0.11, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.15, length]} />
        <meshBasicMaterial color="#ffffff" side={THREE.DoubleSide} />
      </mesh>

      {/* Condition Sphere (Floating Indicator) */}
      <mesh position={[0, 2, 0]}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} />
      </mesh>
    </group>
  );
}

// 2. Loading Fallback (While 3D assets load)
function Loader() {
  return (
    <mesh visible={false}>
      <boxGeometry />
      <meshBasicMaterial color="white" />
    </mesh>
  );
}

// 3. Main Export
export default function RealModel3D({ width = 8, length = 20, iri = 2.0 }) {
  return (
    // Container must have explicit height for Canvas to render
    <div className="h-[500px] w-full bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl relative">
        
        <Canvas 
            shadows 
            camera={{ position: [12, 8, 12], fov: 45 }}
            style={{ width: '100%', height: '100%' }} // Force size
        >
            {/* Background Color & Fog */}
            <color attach="background" args={["#0f172a"]} />
            <fog attach="fog" args={["#0f172a", 10, 40]} />
            
            {/* Lighting */}
            <ambientLight intensity={0.7} />
            <directionalLight position={[10, 10, 5]} intensity={1.5} castShadow />
            <spotLight position={[-10, 10, -5]} intensity={0.5} />

            {/* Suspense Wrapper handles the async Environment loading */}
            <Suspense fallback={<Loader />}>
                <RoadSegment width={width} length={length} condition={iri} />
                
                {/* Environment adds reflections/realism */}
                <Environment preset="city" />
            </Suspense>

            {/* Helper Grid */}
            <Grid 
                infiniteGrid 
                fadeDistance={30} 
                sectionColor="#4f46e5" 
                cellColor="#1e293b" 
                position={[0, -0.01, 0]}
            />
            
            {/* Controls */}
            <OrbitControls 
                minPolarAngle={0} 
                maxPolarAngle={Math.PI / 2.2} 
                enablePan={false}
                minDistance={5}
                maxDistance={30}
            />
        </Canvas>
        
        {/* HTML Overlay */}
        <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md px-4 py-2 rounded-lg text-white border border-white/10 pointer-events-none select-none z-10">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/50">3D Inspector</h3>
            <p className="text-xl font-mono">IRI {iri.toFixed(1)}</p>
        </div>
    </div>
  );
}