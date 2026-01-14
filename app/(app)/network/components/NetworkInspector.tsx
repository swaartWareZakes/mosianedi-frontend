"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Layers, Play, Settings2, Calculator, AlertTriangle, Maximize, Minimize } from "lucide-react";
import dynamic from "next/dynamic";

const RoadModel3D = dynamic(() => import("./RealModel3D"), { ssr: false });

// 👇 1. Define the Props Interface
interface InspectorProps {
    selectedSegment: {
        iri: number;
        width: number;
        surface: "paved" | "gravel";
        name: string;
    } | null;
}

// 👇 2. Destructure props here
export function NetworkInspector({ selectedSegment }: InspectorProps) {
  const [year, setYear] = useState(2025);
  const [surfaceOverride, setSurfaceOverride] = useState<"paved" | "gravel" | null>(null);
  const [layersOpen, setLayersOpen] = useState(false);
  const [unitRate, setUnitRate] = useState(450); 
  const [isFullscreen, setIsFullscreen] = useState(false);

  // --- SYNC LOGIC ---
  // When the map clicks a new segment, reset local overrides so we see the real data first
  useEffect(() => {
    if (selectedSegment) {
        setSurfaceOverride(null); 
    }
  }, [selectedSegment]);

  // Determine active values (Props > Default)
  const activeSurface = surfaceOverride || selectedSegment?.surface || "paved";
  const startIRI = selectedSegment?.iri || 2.0;
  const roadWidth = selectedSegment?.width || 8;
  const roadName = selectedSegment?.name || "No Segment Selected";

  // Simulation Logic: Degrade from the *starting* IRI
  const age = year - 2024;
  const iri = useMemo(() => {
     const degradationRate = activeSurface === "paved" ? 0.4 : 1.2;
     return startIRI + (age * degradationRate);
  }, [age, activeSurface, startIRI]);

  const totalCost = roadWidth * 1000 * unitRate;

  return (
    <div className="flex flex-col h-full bg-[var(--surface-bg)] border-l border-slate-200 dark:border-slate-800">
        
        {/* Header showing active road */}
        <div className="px-6 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center">
            <div>
                <h3 className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Active Asset</h3>
                <p className="text-sm font-semibold truncate text-slate-900 dark:text-slate-100 max-w-[200px]" title={roadName}>
                    {roadName}
                </p>
            </div>
            {selectedSegment && (
                <span className="text-[10px] bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2 py-1 rounded font-mono">
                    ID: {selectedSegment.name.split(' ')[1] || '---'}
                </span>
            )}
        </div>

        {/* 1. 3D Viewport */}
        <div 
            className={`
                relative transition-all duration-500 ease-in-out border-b border-slate-200 dark:border-slate-800
                ${isFullscreen ? 'fixed inset-0 z-50 h-screen bg-black' : 'h-[50%]'}
            `}
        >
            <RoadModel3D width={roadWidth} length={40} iri={iri} surface={activeSurface} showLayers={layersOpen} />
            
            {/* Overlay Controls */}
            <div className="absolute bottom-6 right-6 flex flex-col gap-2">
                <button 
                    onClick={() => setLayersOpen(!layersOpen)}
                    className={`p-3 rounded-full border shadow-lg backdrop-blur transition-all ${layersOpen ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-black/60 text-white border-white/20 hover:bg-black/80'}`}
                    title="Toggle Layers"
                >
                    <Layers className="w-6 h-6" />
                </button>
                <button 
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    className="p-3 rounded-full border border-white/20 bg-black/60 text-white hover:bg-black/80 shadow-lg backdrop-blur"
                    title={isFullscreen ? "Exit Fullscreen" : "Enter Presentation Mode"}
                >
                    {isFullscreen ? <Minimize className="w-6 h-6" /> : <Maximize className="w-6 h-6" />}
                </button>
            </div>

            {isFullscreen && (
                <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur px-6 py-2 rounded-full border border-white/10 text-white animate-in slide-in-from-top-4">
                    <h2 className="text-sm font-bold tracking-widest uppercase">
                        Digital Twin Simulation • Year {year}
                    </h2>
                </div>
            )}
        </div>

        {/* 2. Controls (Hidden when fullscreen) */}
        {!isFullscreen && (
            <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-[var(--surface-bg)]">
                
                {/* Time Machine */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                            <Play className="w-4 h-4 text-indigo-500" /> Time Machine
                        </h3>
                        <span className="font-mono text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-2 py-1 rounded">Year: {year}</span>
                    </div>
                    <input type="range" min={2025} max={2040} step={1} value={year} onChange={(e) => setYear(Number(e.target.value))} className="w-full accent-indigo-500 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer" />
                    <div className="flex items-center gap-4 text-xs">
                         <div className="flex-1 p-3 rounded bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                             <span className="text-slate-500 block mb-1">Predicted IRI</span>
                             <span className={`text-lg font-bold ${iri > 6 ? 'text-rose-500' : 'text-emerald-500'}`}>{iri.toFixed(1)}</span>
                         </div>
                    </div>
                </div>

                {/* Config */}
                <div className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-800">
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2"><Settings2 className="w-4 h-4 text-slate-400" /> Scenario Overrides</h3>
                    <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => setSurfaceOverride("paved")} className={`px-3 py-2 text-xs font-medium rounded border transition-colors ${activeSurface === 'paved' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-transparent border-slate-200 dark:border-slate-700'}`}>Asphalt</button>
                        <button onClick={() => setSurfaceOverride("gravel")} className={`px-3 py-2 text-xs font-medium rounded border transition-colors ${activeSurface === 'gravel' ? 'bg-amber-600 text-white border-amber-600' : 'bg-transparent border-slate-200 dark:border-slate-700'}`}>Gravel</button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
}