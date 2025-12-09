"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic"; // 1. Use Dynamic Import
import { useSearchParams, useRouter, useParams } from "next/navigation";
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Map as MapIcon, 
  BarChart3, 
  Layers, 
  PlayCircle, 
  PauseCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNetworkSnapshot } from "../../../[projectId]/config/hooks/useNetworkSnapshot";
import { useSimulationResults } from "../../../[projectId]/dashboard/hooks/useSimulationResults";

// --- 2. DYNAMIC MAP COMPONENT ---
// We import the LiveMap component dynamically so it only loads in the browser.
// This fixes "window is not defined" errors common with Leaflet.
const LiveMap = dynamic(
  () => import("./components/LiveMap"),
  { 
    ssr: false, 
    loading: () => <div className="w-full h-full bg-slate-950 animate-pulse flex items-center justify-center text-slate-600 font-mono text-sm">INITIALIZING GIS ENGINE...</div> 
  }
);

// --- 3. DEMO DATA FOR MAP ---
// These segments match the mock coordinates in LiveMap.tsx
const DEMO_SEGMENTS = [
    { segment_id: "S1", road_id: "R101", from_node: "N1", to_node: "N2", iri: 2.1, surface_type: "Paved" }, // Pta -> Centurion
    { segment_id: "S2", road_id: "R101", from_node: "N2", to_node: "N3", iri: 2.8, surface_type: "Paved" }, // Centurion -> Midrand
    { segment_id: "S3", road_id: "P201", from_node: "P1", to_node: "P2", iri: 4.5, surface_type: "Gravel" }, // East -> Rietvlei
    { segment_id: "S4", road_id: "P201", from_node: "P2", to_node: "P3", iri: 6.2, surface_type: "Gravel" }, // Rietvlei -> Clayville
    { segment_id: "S5", road_id: "L305", from_node: "L1", to_node: "L2", iri: 3.2, surface_type: "Paved" }, // West
];

export default function PresentationLivePage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  
  const projectId = Array.isArray(params?.projectId) ? params?.projectId[0] : params?.projectId;
  const title = searchParams.get("title") || "Strategic Review";

  // Data Hooks
  const { snapshot } = useNetworkSnapshot(projectId || "");
  const { results } = useSimulationResults(projectId || "");

  // Presentation State
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeLayer, setActiveLayer] = useState("default"); // default, condition

  // Slides Config
  const slides = [
    { id: "intro", label: "Executive Summary", layer: "default" },
    { id: "current", label: "Current Network State", layer: "condition" },
    { id: "forecast", label: "20-Year Forecast", layer: "investment" },
    { id: "financials", label: "Investment Needs", layer: "default" },
  ];

  // Auto-switch map layer when slide changes
  useEffect(() => {
      setActiveLayer(slides[activeSlide].layer);
  }, [activeSlide, slides]);

  // Auto-play Loop
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setActiveSlide((prev) => (prev + 1) % slides.length);
      }, 6000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, slides.length]);

  const currentSlide = slides[activeSlide];

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-slate-950 text-white font-sans selection:bg-purple-500/30">
      
      {/* 1. BACKGROUND MAP LAYER (Z-INDEX 0) */}
      <div className="absolute inset-0 z-0">
         <LiveMap activeLayer={activeLayer} segments={DEMO_SEGMENTS} />
      </div>

      {/* 2. TOP HEADER */}
      <header className="absolute top-0 left-0 right-0 z-50 p-6 flex justify-between items-start bg-gradient-to-b from-black/90 via-black/40 to-transparent pointer-events-none">
        <div className="pointer-events-auto">
            <h1 className="text-2xl font-bold tracking-tight text-white/90">{title}</h1>
            <p className="text-sm text-white/70 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"/>
                Live Session • {new Date().toLocaleDateString()}
            </p>
        </div>
        <button 
            onClick={() => router.back()}
            className="p-2 bg-black/20 hover:bg-white/20 backdrop-blur-md rounded-full transition-colors text-white pointer-events-auto border border-white/10"
        >
            <X className="h-6 w-6" />
        </button>
      </header>

      {/* 3. MAIN STAGE OVERLAYS (Z-INDEX 10) */}
      <main className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
        
        {/* SLIDE 1: INTRO */}
        {currentSlide.id === "intro" && (
            <div className="text-center space-y-6 animate-in fade-in zoom-in duration-500 bg-black/30 p-12 rounded-3xl backdrop-blur-sm border border-white/5 shadow-2xl">
                <div className="inline-block px-4 py-1.5 rounded-full border border-purple-500/50 bg-purple-500/20 text-purple-300 text-sm font-medium">
                    Mosianedi Strategy Engine
                </div>
                <h2 className="text-6xl font-black tracking-tighter text-white drop-shadow-2xl">
                    Network Master Plan
                </h2>
                <div className="flex gap-8 justify-center text-left pt-8">
                    <StatCard label="Total Asset Value" value={`R ${((snapshot?.totalAssetValue || 0) / 1000000).toFixed(1)}M`} />
                    <StatCard label="Network Size" value={`${snapshot?.totalLengthKm.toFixed(1)} km`} />
                    <StatCard label="Scenario" value={results ? `${results.year_count} Years` : "Baseline"} color="text-emerald-400" />
                </div>
            </div>
        )}

        {/* SLIDE 2: CURRENT STATE */}
        {currentSlide.id === "current" && (
            <div className="absolute left-10 top-32 w-[350px] pointer-events-auto animate-in slide-in-from-left duration-500">
                <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 p-6 rounded-3xl shadow-2xl">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-white">
                        <MapIcon className="h-5 w-5 text-blue-400" /> Condition Map
                    </h3>
                    <p className="text-sm text-slate-300 mb-4">
                        Visualizing IRI (Roughness) across the network. <br/>
                        <span className="text-emerald-400 font-bold">Green</span> is Good, <span className="text-rose-500 font-bold">Red</span> is Critical.
                    </p>
                    <div className="space-y-3 bg-black/30 p-4 rounded-xl border border-white/5">
                        <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500"/> Good</div>
                            <span className="font-mono text-emerald-400">{snapshot?.goodConditionPct.toFixed(0)}%</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-amber-500"/> Fair</div>
                            <span className="font-mono text-amber-400">{snapshot?.fairConditionPct.toFixed(0)}%</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-rose-500"/> Poor</div>
                            <span className="font-mono text-rose-400">{snapshot?.poorConditionPct.toFixed(0)}%</span>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* SLIDE 3: FORECAST */}
        {currentSlide.id === "forecast" && (
             <div className="absolute right-10 bottom-32 w-[500px] pointer-events-auto animate-in slide-in-from-right duration-500">
                <div className="bg-black/60 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl">
                    <h3 className="text-xl font-bold mb-2 flex items-center gap-2 text-white">
                        <BarChart3 className="h-5 w-5 text-purple-400" /> 
                        {results?.year_count || 20}-Year Horizon
                    </h3>
                    <p className="text-sm text-white/60 mb-6">
                        Projected deterioration under current funding levels.
                    </p>
                    
                    {/* Visual Bar Chart (Simplified CSS Bars) */}
                    <div className="h-40 flex items-end gap-1.5 border-b border-white/10 pb-2 mb-4">
                        {results?.yearly_data.map((d, i) => (
                            <div 
                                key={i} 
                                className="flex-1 bg-purple-500/50 hover:bg-purple-400 transition-all rounded-t-sm relative group" 
                                style={{ height: `${Math.min(100, (d.avg_condition_index / 8) * 100)}%` }}
                            >
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-white text-black text-[10px] px-2 py-1 rounded transition-opacity font-bold whitespace-nowrap z-50">
                                    Year {d.year}: IRI {d.avg_condition_index}
                                </div>
                            </div>
                        ))}
                        {!results && <div className="text-xs text-white/40 w-full text-center mt-10">Run simulation to see forecast data.</div>}
                    </div>
                    
                    <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/5">
                        <span className="text-sm text-white/70">Total Lifecycle Liability</span>
                        <span className="text-xl font-mono font-bold text-white">
                            R {((results?.total_cost_npv || 0) / 1000000).toFixed(1)} M
                        </span>
                    </div>
                </div>
             </div>
        )}

        {/* SLIDE 4: FINANCIALS */}
        {currentSlide.id === "financials" && (
            <div className="text-center animate-in fade-in zoom-in duration-500">
                <h2 className="text-4xl font-bold text-white mb-4">Investment Strategy</h2>
                <div className="bg-emerald-900/40 backdrop-blur-md p-8 rounded-3xl border border-emerald-500/30">
                    <p className="text-2xl text-emerald-100">
                        Recommended Annual Budget: <span className="font-bold text-white">R {(snapshot?.totalLengthKm || 0) * 85000}</span>
                    </p>
                </div>
            </div>
        )}

      </main>

      {/* 4. BOTTOM DOCK (Controls) */}
      <footer className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 pointer-events-auto">
        
        {/* Navigation Deck */}
        <div className="bg-black/60 backdrop-blur-xl border border-white/10 p-2 rounded-full flex items-center gap-1 shadow-2xl">
            <button 
                onClick={() => setActiveSlide(Math.max(0, activeSlide - 1))}
                disabled={activeSlide === 0}
                className="p-3 hover:bg-white/10 rounded-full disabled:opacity-30 transition-colors text-white"
            >
                <ChevronLeft className="h-5 w-5" />
            </button>

            <div className="px-6 flex flex-col items-center min-w-[200px]">
                <span className="text-[10px] font-bold tracking-widest uppercase text-white/40">
                    Slide {activeSlide + 1} / {slides.length}
                </span>
                <span className="text-sm font-medium text-white">{currentSlide.label}</span>
            </div>

            <button 
                onClick={() => setActiveSlide(Math.min(slides.length - 1, activeSlide + 1))}
                disabled={activeSlide === slides.length - 1}
                className="p-3 hover:bg-white/10 rounded-full disabled:opacity-30 transition-colors text-white"
            >
                <ChevronRight className="h-5 w-5" />
            </button>
        </div>

        {/* Play/Pause */}
        <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-4 bg-white text-black hover:bg-slate-200 rounded-full shadow-lg transition-transform hover:scale-105"
        >
            {isPlaying ? <PauseCircle className="h-6 w-6" /> : <PlayCircle className="h-6 w-6" />}
        </button>
        
        {/* Layer Toggle */}
        <div className="bg-black/60 backdrop-blur-xl border border-white/10 p-2 rounded-full flex items-center gap-2 shadow-2xl">
            <button 
                onClick={() => setActiveLayer(activeLayer === 'condition' ? 'default' : 'condition')}
                className={cn("p-3 rounded-full transition-colors", activeLayer === "condition" ? "bg-emerald-600 text-white" : "hover:bg-white/10 text-white/50")}
                title="Toggle Condition Map"
            >
                <Layers className="h-5 w-5" />
            </button>
        </div>
      </footer>
    </div>
  );
}

// Helper Component for Stats
function StatCard({ label, value, color = "text-white" }: any) {
    return (
        <div className="bg-black/40 border border-white/10 p-4 rounded-2xl backdrop-blur-md min-w-[160px]">
            <div className="text-[10px] uppercase tracking-wider text-white/60 mb-1">{label}</div>
            <div className={cn("text-2xl font-bold font-mono", color)}>{value}</div>
        </div>
    );
}