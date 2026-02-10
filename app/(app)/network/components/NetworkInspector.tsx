"use client";

import React, { useState } from "react";
import { 
  Play, 
  Activity, 
  ShieldAlert, 
  CheckCircle, 
  Database, 
  Zap, 
  HardHat, 
  TrendingDown, 
  DollarSign, 
  Pause, 
  RefreshCcw, 
  MapPin, 
  Layers,
  Info 
} from "lucide-react";
import dynamic from "next/dynamic";

const RoadModel3D = dynamic(() => import("./RealModel3D"), { ssr: false });

export function NetworkInspector({ selectedSegment, projectName, province, proposalName }: any) {
  const [isDriving, setIsDriving] = useState(false);
  const [speedLimit, setSpeedLimit] = useState(80);
  const [potholeIntensity, setPotholeIntensity] = useState(4);
  const [cargoValue, setCargoValue] = useState(1250000);
  const [results, setResults] = useState<any>(null);

  const startIRI = selectedSegment?.iri || 2.5;
  const vciEquivalent = (100 - (startIRI * 10)).toFixed(0);

  return (
    <div className="relative w-full h-full bg-[#020617] flex items-center justify-center overflow-hidden">
      
      {/* TOP LEFT HUD: PROJECT & NETWORK INFO */}
      <div className="absolute top-8 left-8 z-50 pointer-events-none flex flex-col gap-4">
        <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl min-w-[300px]">
          <div className="flex items-center gap-3 mb-3">
             <div className="p-2 bg-sky-500/20 rounded-lg"><HardHat className="text-sky-400 w-5 h-5" /></div>
             <div>
               <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Active Project</p>
               <h1 className="text-white font-bold text-sm truncate max-w-[200px]">{projectName || "SELECT PROJECT"}</h1>
             </div>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-white/5">
            <div className="flex items-center gap-2">
              <MapPin className="text-amber-500 w-3 h-3" />
              <span className="text-[10px] text-slate-300 font-bold uppercase">{province}</span>
            </div>
            <div className="flex items-center gap-2">
              <Layers className="text-emerald-500 w-3 h-3" />
              <span className="text-[10px] text-slate-300 truncate">{proposalName}</span>
            </div>
          </div>
        </div>

        {/* LIVE SIM CONTROL PANEL */}
        {isDriving && (
          <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 p-4 rounded-2xl animate-in slide-in-from-left duration-500 pointer-events-auto shadow-2xl">
            <p className="text-[9px] font-black text-slate-500 uppercase mb-3 flex items-center gap-2">
              <Activity className="w-3 h-3 text-rose-500" /> Overrides
            </p>
            <div className="space-y-3">
              <div className="flex gap-2">
                <button onClick={() => setIsDriving(false)} className="flex-1 flex items-center justify-center gap-2 text-[10px] font-bold text-white bg-white/5 hover:bg-white/10 p-2 rounded-lg transition-colors border border-white/5">
                  <Pause className="w-3 h-3" /> PAUSE
                </button>
                <button onClick={() => { setIsDriving(false); setTimeout(()=>setIsDriving(true), 100); }} className="flex-1 flex items-center justify-center gap-2 text-[10px] font-bold text-white bg-white/5 hover:bg-white/10 p-2 rounded-lg transition-colors border border-white/5">
                  <RefreshCcw className="w-3 h-3" /> RESTART
                </button>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[8px] text-slate-500 uppercase font-black">Intensify Potholes</label>
                  <span className="text-[10px] text-rose-500 font-mono">{potholeIntensity}x</span>
                </div>
                <input type="range" min="1" max="20" value={potholeIntensity} onChange={(e)=>setPotholeIntensity(Number(e.target.value))} className="w-full accent-rose-500 h-1 bg-slate-800 rounded-full appearance-none cursor-pointer" />
              </div>
            </div>
          </div>
        )}
      </div>

      {isDriving && (
        <div className="absolute top-10 right-10 z-20 flex flex-col items-end pointer-events-none animate-in slide-in-from-right duration-700">
           <div className="text-[120px] font-black text-white font-mono leading-none tracking-tighter drop-shadow-[0_0_40px_rgba(0,242,255,0.4)]">
             {speedLimit}
           </div>
           <div className="text-sm font-bold text-sky-400 uppercase tracking-[0.4em] -mt-2">KM/H</div>
        </div>
      )}

      <div className="w-full h-full relative border-y border-white/5">
        <RoadModel3D 
          iri={startIRI} 
          isDriving={isDriving} 
          speedLimit={speedLimit}
          potholeCount={potholeIntensity}
          onDriveComplete={(data) => {
            setIsDriving(false);
            setResults({ ...data, loss: (data.loss * (cargoValue / 1250000)) });
          }}
        />

        {!isDriving && !results && (
          <div className="absolute inset-0 z-30 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-6">
            <div className="text-center space-y-8 w-full max-w-2xl p-10 bg-slate-900/95 rounded-[50px] border border-white/10 shadow-2xl">
              <div className="space-y-2">
                <h2 className="text-5xl font-black text-white tracking-tighter uppercase italic">Digital Twin Ready</h2>
                <p className="text-slate-400 font-medium">Mechanical Stress Simulation Baseline</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-left">
                <div className="bg-white/5 p-6 rounded-[32px] border border-white/10">
                  <div className="text-[9px] font-black text-slate-500 uppercase mb-3 flex items-center gap-2">
                    <Zap className="w-3 h-3 text-amber-500" /> Network Findings
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-white">Segment: <span className="font-bold text-sky-400">{selectedSegment?.name}</span></p>
                    <p className="text-[11px] text-slate-300 font-bold">IRI: {startIRI.toFixed(1)} <span className="text-slate-500 font-normal ml-1"> (VCI {vciEquivalent})</span></p>
                  </div>
                </div>
                <div className="bg-white/5 p-6 rounded-[32px] border border-white/10">
                   <div className="text-[9px] font-black text-slate-500 uppercase mb-3 flex items-center gap-2">
                    <Database className="w-3 h-3 text-sky-500" /> Cargo Config
                  </div>
                  <select 
                    value={cargoValue} 
                    onChange={(e)=>setCargoValue(Number(e.target.value))}
                    className="bg-slate-800 text-xs text-white font-bold outline-none w-full p-2 rounded-xl border border-white/5 cursor-pointer"
                  >
                    <option value={500000}>Produce (Value: R 500k)</option>
                    <option value={1250000}>Machinery (Value: R 1.25m)</option>
                    <option value={3000000}>Electronics (Value: R 3m)</option>
                  </select>
                </div>
              </div>

              <div className="bg-white/5 p-8 rounded-[40px] border border-white/10 shadow-inner">
                <div className="flex justify-between mb-4">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Velocity Target</span>
                    <span className="text-xs font-mono text-sky-400">{speedLimit} km/h</span>
                </div>
                <input type="range" min="60" max="120" step="10" value={speedLimit} onChange={(e)=>setSpeedLimit(Number(e.target.value))} className="w-full accent-sky-500 h-1.5 bg-slate-800 rounded-full appearance-none cursor-pointer" />
              </div>

              <button 
                onClick={() => setIsDriving(true)} 
                disabled={!projectName}
                className="w-full py-6 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-[35px] font-black text-xl flex items-center justify-center gap-4 transition-all shadow-2xl shadow-sky-900/40 active:scale-95"
              >
                <Play className="w-6 h-6 fill-current" /> INITIATE STRESS RUN
              </button>
            </div>
          </div>
        )}

        {results && (
          <div className="absolute inset-0 z-40 bg-slate-950/90 backdrop-blur-2xl flex items-center justify-center p-8">
             <div className="w-full max-w-2xl p-12 bg-slate-900 border border-white/10 rounded-[60px] space-y-10 animate-in zoom-in-95 duration-300">
                <div className="text-center">
                   <div className="inline-flex p-5 bg-emerald-500/10 rounded-full mb-4 border border-emerald-500/20"><CheckCircle className="w-10 h-10 text-emerald-500" /></div>
                   <h3 className="text-4xl font-black text-white uppercase italic tracking-tighter">Simulation Intelligence</h3>
                </div>

                <div className="grid grid-cols-3 gap-6">
                    <div className="bg-white/5 p-6 rounded-[40px] border border-white/10 text-center">
                        <div className="text-[10px] text-slate-500 font-black uppercase mb-2">Integrity</div>
                        <div className="text-5xl font-black text-white font-mono">{results.integrity.toFixed(0)}%</div>
                    </div>
                    <div className="bg-white/5 p-6 rounded-[40px] border border-white/10 text-center">
                        <div className="text-[10px] text-slate-500 font-black uppercase mb-2">Depreciation</div>
                        <div className="text-4xl font-black text-rose-500 font-mono">+{(100 - results.integrity).toFixed(1)}%</div>
                    </div>
                    <div className="bg-white/5 p-6 rounded-[40px] border border-white/10 text-center">
                        <div className="text-[10px] text-slate-500 font-black uppercase mb-2">Loss</div>
                        <div className="text-2xl font-black text-white font-mono leading-tight mt-2">R {Math.floor(results.loss).toLocaleString()}</div>
                    </div>
                </div>

                <div className="bg-sky-500/5 border border-sky-500/20 p-6 rounded-[32px]">
                   <h4 className="text-sky-400 font-black text-[10px] uppercase mb-2 tracking-widest flex items-center gap-2"><Info className="w-3 h-3"/> Analysis Insight</h4>
                   <p className="text-slate-400 text-xs leading-relaxed italic">
                     Simulating {projectName} at {speedLimit}km/h reveals that surface degradation in {province} results in a projected {((100 - results.integrity) * 1.5).toFixed(0)}% reduction in asset lifespan. 
                   </p>
                </div>

                <button onClick={() => setResults(null)} className="w-full py-5 bg-white text-black font-black rounded-[28px] uppercase tracking-widest text-xs hover:bg-slate-200 transition-colors shadow-2xl">
                  Dismiss Briefing
                </button>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}