"use client";

import React, { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, Sky, Stars } from "@react-three/drei";
import * as THREE from "three";

// --- Types ---
type SurfaceType = "paved" | "gravel";

interface RoadProps {
  width: number;
  length: number;
  condition: number;
  surface: SurfaceType;
  showLayers: boolean;
}

// --- SUB-COMPONENT: DECORATIONS (Trees) ---
function RoadsideDecorations({ roadWidth, length }: { roadWidth: number, length: number }) {
  // Generate random tree positions along the side of the road
  const trees = useMemo(() => {
    const count = Math.floor(length / 3); // One tree every 3 meters roughly
    const items = [];
    for (let i = 0; i < count * 2; i++) {
      const side = Math.random() > 0.5 ? 1 : -1;
      const x = (roadWidth / 2 + 2 + Math.random() * 3) * side; // 2m to 5m from road edge
      const z = (Math.random() - 0.5) * length;
      const scale = 0.5 + Math.random() * 0.5;
      items.push({ x, z, scale });
    }
    return items;
  }, [roadWidth, length]);

  return (
    <group>
      {trees.map((t, i) => (
        <group key={i} position={[t.x, 0, t.z]} scale={[t.scale, t.scale, t.scale]}>
          {/* Trunk */}
          <mesh position={[0, 0.75, 0]} castShadow>
            <cylinderGeometry args={[0.2, 0.3, 1.5, 8]} />
            <meshStandardMaterial color="#5D4037" />
          </mesh>
          {/* Leaves (Low Poly Cone) */}
          <mesh position={[0, 2.25, 0]} castShadow>
             <coneGeometry args={[1, 2.5, 8]} />
             <meshStandardMaterial color="#2E7D32" roughness={0.8} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// --- SUB-COMPONENT: ROAD SEGMENT ---
function RoadSegment({ width, length, condition, surface, showLayers }: RoadProps) {
  const roadColor = surface === "paved" ? "#334155" : "#d97706";
  const roughness = surface === "paved" ? 0.6 : 1.0; // Paved is shinier

  // Potholes Logic
  const potholes = useMemo(() => {
    if (condition < 5) return [];
    const count = Math.floor((condition - 4) * 2); 
    return new Array(count).fill(0).map(() => ({
      x: (Math.random() - 0.5) * (width - 1),
      z: (Math.random() - 0.5) * (length - 4),
      size: 0.3 + Math.random() * 0.4,
    }));
  }, [condition, width, length]);

  const layerGap = showLayers ? 0.6 : 0;

  return (
    <group>
      {/* 1. PAVEMENT */}
      <mesh position={[0, 0.1 + (layerGap * 2), 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow castShadow>
        <planeGeometry args={[width, length, 64, 64]} />
        <meshStandardMaterial color={roadColor} roughness={roughness} />
      </mesh>

      {/* Potholes */}
      {potholes.map((ph, i) => (
         <mesh key={i} position={[ph.x, 0.12 + (layerGap * 2), ph.z]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[ph.size, 16]} />
            <meshStandardMaterial color="#1a1a1a" roughness={1} transparent opacity={0.9} />
         </mesh>
      ))}

      {/* Markings */}
      {surface === "paved" && (
        <mesh position={[0, 0.11 + (layerGap * 2), 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.15, length]} />
            <meshBasicMaterial color="white" />
        </mesh>
      )}

      {/* 2. BASE */}
      <mesh position={[0, -0.25 + layerGap, 0]}>
        <boxGeometry args={[width, 0.5, length]} />
        <meshStandardMaterial color="#8D6E63" />
      </mesh>

      {/* 3. SUBGRADE */}
      <mesh position={[0, -0.75, 0]}>
        <boxGeometry args={[width, 0.5, length]} />
        <meshStandardMaterial color="#5D4037" />
      </mesh>
    </group>
  );
}

// --- MAIN COMPONENT ---
export default function RealModel3D({ width = 8, length = 40, iri = 2.0, surface = "paved", showLayers = false }: any) {
  return (
    <div className="h-full w-full bg-slate-900 relative">
        <Canvas 
            shadows 
            dpr={[1, 2]} // Handle high-res screens
            camera={{ position: [15, 10, 15], fov: 45 }}
            style={{ width: '100%', height: '100%' }}
        >
            {/* --- ENVIRONMENT --- */}
            <Sky sunPosition={[100, 20, 100]} turbidity={0.5} rayleigh={0.5} />
            <ambientLight intensity={0.4} />
            <directionalLight 
                position={[50, 50, 25]} 
                intensity={1.5} 
                castShadow 
                shadow-mapSize={[1024, 1024]} 
            />
            
            {/* The Ground (Grass) */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.8, 0]} receiveShadow>
                <planeGeometry args={[100, 100]} />
                <meshStandardMaterial color="#388E3C" roughness={1} />
            </mesh>

            {/* The Road Asset */}
            <RoadSegment width={width} length={length} condition={iri} surface={surface} showLayers={showLayers} />
            
            {/* Decorations */}
            <RoadsideDecorations roadWidth={width} length={length} />

            {/* Controls */}
            <OrbitControls 
                minPolarAngle={0} 
                maxPolarAngle={Math.PI / 2.1} // Stop going under ground
                maxDistance={50}
            />
        </Canvas>
        
        {/* HUD Info */}
        <div className="absolute top-4 left-4 bg-black/50 backdrop-blur border border-white/20 px-3 py-1.5 rounded text-white text-xs font-mono select-none">
            CONDITION: {iri < 4 ? "GOOD" : iri < 8 ? "FAIR" : "POOR"} | {surface.toUpperCase()}
        </div>
    </div>
  );
}