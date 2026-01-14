"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Layers, Play, Settings2, Truck, Package, Scale, X, FileText, CheckCircle2, AlertTriangle, RefreshCw, CloudRain, Sun, Gauge } from "lucide-react";
import dynamic from "next/dynamic";
import type { CargoType, WeatherType } from "./RealModel3D"; 

const RoadModel3D = dynamic(() => import("./RealModel3D"), { ssr: false });

interface InspectorProps {
    selectedSegment: {
        iri: number;
        width: number;
        surface: "paved" | "gravel";
        name: string;
    } | null;
    province?: string;
}

// --- SUB-COMPONENT: ADVANCED SIMULATION REPORT ---
function SimulationReport({ iri, cargoType, cargoWeight, onClose, onReplay, weather, speedLimit }: any) {
    
    // 1. COMPLEX RISK ALGORITHM
    const isBadRoad = iri > 4.5;
    const isWet = weather === "rain";
    const isSpeeding = speedLimit > 80;
    const isHeavy = cargoWeight > 30;
    const isFragile = cargoType === "electronics" || cargoType === "produce";

    // Calculate Damage Factors (0-100)
    let roadDamage = (iri / 10) * 40; 
    let weatherDamage = isWet ? 15 : 0; 
    let speedDamage = (speedLimit / 120) * 20; 
    let weightDamage = (cargoWeight / 50) * 25; 

    if (isBadRoad && isSpeeding) speedDamage *= 1.5; 
    if (isWet && isSpeeding) weatherDamage *= 1.5;   
    
    const fragilityFactor = isFragile ? 1.5 : 0.8;

    const rawRisk = (roadDamage + weatherDamage + speedDamage + weightDamage) * fragilityFactor;
    const integrityLost = Math.min(100, Math.max(0, rawRisk));
    const cargoHealth = 100 - integrityLost;

    // Financial Calc
    const cargoValuePerTon = cargoType === "electronics" ? 50000 : cargoType === "produce" ? 15000 : 5000;
    const totalCargoValue = cargoValuePerTon * cargoWeight;
    const financialLoss = (totalCargoValue * (integrityLost / 100)).toLocaleString('en-ZA', { style: 'currency', currency: 'ZAR' });

    // 2. DYNAMIC NARRATIVE ENGINE
    const analysis = useMemo(() => {
        if (cargoHealth > 90) return "Transport completed within optimal safety parameters. Logistics efficiency is high.";
        
        const factors = [];
        if (roadDamage > 20) factors.push(`rough surface (IRI ${iri.toFixed(1)})`);
        if (isWet && isSpeeding) factors.push("traction loss (rain + speed)");
        if (isHeavy && isBadRoad) factors.push("excessive load on poor pavement");
        if (isFragile && integrityLost > 20) factors.push("cargo fragility");
        
        return `Logistics failure detected. Primary failure vectors: ${factors.join(" + ")}. Recommendation: Improve pavement quality or reduce transport speed.`;
    }, [cargoHealth, roadDamage, isWet, isSpeeding, isHeavy, isBadRoad, isFragile, integrityLost, iri]);

    const statusColor = cargoHealth > 90 ? "emerald" : cargoHealth > 60 ? "amber" : "rose";

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in zoom-in-95 duration-300">
            <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                
                {/* Header */}
                <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-start">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <FileText className="w-5 h-5 text-indigo-500" /> Post-Mortem Analysis
                        </h2>
                        <p className="text-xs text-slate-500 mt-1 uppercase tracking-wide font-mono">SIM-ID: {Math.random().toString(36).substr(2, 6).toUpperCase()}</p>
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors">
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6 overflow-y-auto">
                    
                    {/* 1. VERDICT BANNER */}
                    <div className={`p-4 rounded-xl border flex items-start gap-4 bg-${statusColor}-50 dark:bg-${statusColor}-900/10 border-${statusColor}-200 dark:border-${statusColor}-800`}>
                        {cargoHealth > 90 ? <CheckCircle2 className="w-6 h-6 text-emerald-600" /> : <AlertTriangle className={`w-6 h-6 text-${statusColor}-600`} />}
                        <div>
                            <h3 className={`font-bold text-sm text-${statusColor}-700 dark:text-${statusColor}-400`}>
                                {cargoHealth > 90 ? "Delivery Successful" : cargoHealth > 60 ? "Cargo Damaged" : "Catastrophic Failure"}
                            </h3>
                            <p className="text-xs opacity-90 mt-1 leading-relaxed text-slate-700 dark:text-slate-300">
                                {analysis}
                            </p>
                        </div>
                    </div>

                    {/* 2. FINANCIAL IMPACT */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Estimated Loss</span>
                            <div className="text-xl font-mono font-bold text-slate-900 dark:text-white mt-1">{financialLoss}</div>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Cargo Integrity</span>
                            <div className={`text-xl font-mono font-bold mt-1 text-${statusColor}-500`}>
                                {cargoHealth.toFixed(1)}%
                            </div>
                        </div>
                    </div>

                    {/* 3. DETAILED INPUT TELEMETRY */}
                    <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <Settings2 className="w-3 h-3" /> Simulation Inputs & Variables
                        </h4>
                        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-800 p-4 space-y-3">
                            <div className="flex justify-between items-center text-xs border-b border-slate-200 dark:border-slate-800 pb-2">
                                <span className="text-slate-500 flex items-center gap-2"><Layers className="w-3 h-3"/> Surface Condition (IRI)</span>
                                <span className={`font-mono font-medium ${isBadRoad ? "text-rose-500" : "text-emerald-500"}`}>
                                    {iri.toFixed(2)} {isBadRoad ? "(POOR)" : "(GOOD)"}
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-xs border-b border-slate-200 dark:border-slate-800 pb-2">
                                <span className="text-slate-500 flex items-center gap-2"><Package className="w-3 h-3"/> Cargo Config</span>
                                <span className="font-mono text-slate-700 dark:text-slate-300 capitalize">{cargoWeight}t {cargoType}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs pt-1">
                                <span className="text-slate-500 flex items-center gap-2"><Gauge className="w-3 h-3"/> Speed / Weather</span>
                                <span className="font-mono text-slate-700 dark:text-slate-300 capitalize">{speedLimit}km/h | {weather}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex gap-3">
                    <button onClick={onReplay} className="flex-1 flex items-center justify-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium py-2.5 rounded-lg text-xs transition-colors">
                        <RefreshCw className="w-4 h-4" /> Replay Simulation
                    </button>
                    <button onClick={onClose} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg text-xs transition-colors shadow-sm">
                        Dismiss Report
                    </button>
                </div>
            </div>
        </div>
    );
}

// --- MAIN COMPONENT ---
export function NetworkInspector({ selectedSegment, province = "Gauteng" }: InspectorProps) {
  const [year, setYear] = useState(2025);
  const [surfaceOverride, setSurfaceOverride] = useState<"paved" | "gravel" | null>(null);
  const [layersOpen, setLayersOpen] = useState(false);
  
  // Simulation State
  const [isDriving, setIsDriving] = useState(false);
  const [showReport, setShowReport] = useState(false);
  
  // Inputs
  const [cargoType, setCargoType] = useState<CargoType>("electronics");
  const [cargoWeight, setCargoWeight] = useState(20);
  const [weather, setWeather] = useState<WeatherType>("sunny");
  const [speedLimit, setSpeedLimit] = useState(100);

  useEffect(() => {
    if (selectedSegment) { setSurfaceOverride(null); }
  }, [selectedSegment]);

  const activeSurface = surfaceOverride || selectedSegment?.surface || "paved";
  const startIRI = selectedSegment?.iri || 2.5; 
  const roadWidth = selectedSegment?.width || 8;
  const roadName = selectedSegment?.name || "Demo Segment";

  const age = year - 2024;
  const iri = useMemo(() => {
     const degradationRate = activeSurface === "paved" ? 0.4 : 1.2;
     return startIRI + (age * degradationRate);
  }, [age, activeSurface, startIRI]);

  return (
    <div className="flex flex-col h-full bg-[var(--surface-bg)] border-l border-slate-200 dark:border-slate-800 relative">
        
        {/* REPORT MODAL */}
        {showReport && (
            <SimulationReport 
                iri={iri} 
                cargoType={cargoType} 
                cargoWeight={cargoWeight} 
                weather={weather}
                speedLimit={speedLimit}
                onClose={() => setShowReport(false)}
                onReplay={() => { setShowReport(false); setIsDriving(true); }}
            />
        )}

        {/* HEADER */}
        <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center shrink-0">
            <div>
                <h3 className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Active Asset</h3>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate max-w-[200px]" title={roadName}>{roadName}</p>
            </div>
            <button 
                onClick={() => setIsDriving(true)}
                disabled={isDriving}
                className={`text-xs flex items-center gap-2 px-4 py-2 rounded-full font-bold border transition-all shadow-sm ${isDriving ? 'bg-emerald-500 text-white border-emerald-500 cursor-wait' : 'bg-slate-900 text-white hover:bg-slate-800 border-transparent'}`}
            >
                <Truck className="w-3 h-3" />
                {isDriving ? "Simulating..." : "Test Drive"}
            </button>
        </div>

        {/* 3D VIEWPORT - ADJUSTED TO 55% to give Controls more room */}
        <div className="h-[55%] relative border-b border-slate-200 dark:border-slate-800 bg-slate-900 overflow-hidden group">
            <RoadModel3D 
                width={roadWidth} 
                iri={iri} 
                surface={activeSurface} 
                showLayers={layersOpen}
                isDriving={isDriving}
                onDriveComplete={() => { setIsDriving(false); setShowReport(true); }}
                province={province}
                cargoType={cargoType}
                cargoWeight={cargoWeight}
                weather={weather}
                speedLimit={speedLimit}
            />
            <button onClick={() => setLayersOpen(!layersOpen)} className={`absolute bottom-4 right-4 p-2.5 rounded-full border transition-all z-10 shadow-lg ${layersOpen ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-black/50 text-white border-white/20 hover:bg-black/70'}`}>
                <Layers className="w-5 h-5" />
            </button>
        </div>

        {/* CONTROLS - NOW TAKES REMAINING SPACE (Approx 45%) */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-[var(--surface-bg)]">
            
            {/* 1. Timeline */}
            <div className="space-y-2 pb-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex justify-between items-center">
                    <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2"><Play className="w-3 h-3 text-indigo-500"/> Project Timeline</h3>
                    <span className="text-[10px] font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-600 dark:text-slate-400">Year {year}</span>
                </div>
                <input type="range" min={2025} max={2035} step={1} value={year} onChange={(e) => setYear(Number(e.target.value))} className="w-full accent-indigo-500 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer" />
                <div className="flex justify-between text-[10px] text-slate-500">
                    <span>Current IRI: <strong className={iri > 5 ? "text-rose-500" : "text-emerald-500"}>{iri.toFixed(1)}</strong></span>
                    <span>Status: {iri < 3 ? "Good" : iri < 6 ? "Fair" : "Failed"}</span>
                </div>
            </div>

            {/* 2. Simulation Inputs (Grid) */}
            <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2"><Settings2 className="w-3 h-3 text-slate-400"/> Drive Conditions</h3>
                
                <div className="grid grid-cols-2 gap-3">
                    
                    {/* Cargo */}
                    <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1"><Package className="w-3 h-3"/> Payload</label>
                        <select value={cargoType} onChange={(e) => setCargoType(e.target.value as any)} className="w-full text-xs p-2 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-1 focus:ring-indigo-500 outline-none appearance-none">
                            <option value="electronics">Electronics (Fragile)</option>
                            <option value="produce">Fresh Produce (Std)</option>
                            <option value="bricks">Construction (Heavy)</option>
                        </select>
                    </div>

                    {/* Weight */}
                    <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1"><Scale className="w-3 h-3"/> Weight</label>
                        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-2 py-1.5">
                            <input type="range" min={5} max={50} value={cargoWeight} onChange={(e) => setCargoWeight(Number(e.target.value))} className="flex-1 accent-indigo-500 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none" />
                            <span className="text-[10px] font-mono w-5 text-right">{cargoWeight}t</span>
                        </div>
                    </div>

                    {/* Weather Toggle */}
                    <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1"><CloudRain className="w-3 h-3"/> Weather</label>
                        <div className="flex rounded border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-900">
                            <button onClick={() => setWeather("sunny")} className={`flex-1 py-1.5 flex justify-center transition-colors ${weather === 'sunny' ? 'bg-amber-100 text-amber-600' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`} title="Sunny"><Sun className="w-3.5 h-3.5" /></button>
                            <div className="w-px bg-slate-200 dark:bg-slate-700"></div>
                            <button onClick={() => setWeather("rain")} className={`flex-1 py-1.5 flex justify-center transition-colors ${weather === 'rain' ? 'bg-cyan-100 text-cyan-600' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`} title="Raining"><CloudRain className="w-3.5 h-3.5" /></button>
                        </div>
                    </div>

                    {/* Speed Limit */}
                    <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1"><Gauge className="w-3 h-3"/> Speed Limit</label>
                        <select value={speedLimit} onChange={(e) => setSpeedLimit(Number(e.target.value))} className="w-full text-xs p-2 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-1 focus:ring-indigo-500 outline-none appearance-none">
                            <option value={60}>60 km/h (Urban)</option>
                            <option value={80}>80 km/h (Rural)</option>
                            <option value={100}>100 km/h (Highway)</option>
                            <option value={120}>120 km/h (Freeway)</option>
                        </select>
                    </div>

                </div>
            </div>
        </div>
    </div>
  );
}