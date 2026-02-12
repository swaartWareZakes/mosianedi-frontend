"use client";

import React, { useMemo, useState, useEffect } from "react";
import {
  Play,
  Activity,
  CheckCircle,
  Database,
  Zap,
  HardHat,
  Pause,
  RefreshCcw,
  MapPin,
  Layers,
  Info,
  AlertTriangle,
} from "lucide-react";
import dynamic from "next/dynamic";

const RoadModel3D = dynamic(() => import("./RealModel3D"), { ssr: false });

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function iriRiskBand(iri: number) {
  if (iri <= 2.5) return { label: "Low", color: "text-emerald-400", chip: "bg-emerald-500/10 border-emerald-500/20" };
  if (iri <= 4.5) return { label: "Moderate", color: "text-amber-400", chip: "bg-amber-500/10 border-amber-500/20" };
  if (iri <= 6.5) return { label: "High", color: "text-rose-400", chip: "bg-rose-500/10 border-rose-500/20" };
  return { label: "Critical", color: "text-rose-300", chip: "bg-rose-500/15 border-rose-500/30" };
}

export function NetworkInspector({ selectedSegment, projectName, province, proposalName }: any) {
  const [isDriving, setIsDriving] = useState(false);
  const [speedLimit, setSpeedLimit] = useState(80);
  const [potholeIntensity, setPotholeIntensity] = useState(4);
  const [cargoValue, setCargoValue] = useState(1250000);
  const [results, setResults] = useState<any>(null);

  const surface = (selectedSegment?.surface || "paved") as "paved" | "gravel";

  // ✅ NEW: IRI override slider state (defaults from project segment)
  const baselineIRI = clamp(Number(selectedSegment?.iri ?? 3.5), 1, 10);
  const [iriOverride, setIriOverride] = useState(baselineIRI);

  // When project/segment changes, reset override to baseline
  useEffect(() => {
    setIriOverride(baselineIRI);
    setResults(null);
    setIsDriving(false);
  }, [baselineIRI]);

  const startIRI = clamp(Number(iriOverride), 1, 10);
  const vciEquivalent = clamp(100 - startIRI * 10, 0, 100).toFixed(0);
  const risk = useMemo(() => iriRiskBand(startIRI), [startIRI]);

  const headline = useMemo(() => {
    if (startIRI <= 2.5) return "Ride quality is stable — low probability of cargo shock events.";
    if (startIRI <= 4.5) return "Moderate roughness — shock events increase at higher speed.";
    if (startIRI <= 6.5) return "High roughness — frequent impacts likely, speed discipline required.";
    return "Critical roughness — impacts are highly likely, accelerated asset + logistics risk.";
  }, [startIRI]);

  return (
    <div className="relative w-full h-full bg-[#020617] flex items-center justify-center overflow-hidden">
      {/* TOP LEFT HUD */}
      <div className="absolute top-8 left-8 z-50 pointer-events-none flex flex-col gap-4">
        <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl min-w-[320px]">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-sky-500/20 rounded-lg">
              <HardHat className="text-sky-400 w-5 h-5" />
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Active Project</p>
              <h1 className="text-white font-bold text-sm truncate max-w-[230px]">
                {projectName || "SELECT PROJECT"}
              </h1>
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

          {/* IRI badge */}
          <div className="pt-3 mt-3 border-t border-white/5 flex items-center justify-between">
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${risk.chip}`}>
              <AlertTriangle className={`w-3 h-3 ${risk.color}`} />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-200/90">
                IRI {startIRI.toFixed(1)} • {risk.label}
              </span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">VCI {vciEquivalent}</span>
          </div>

          {/* ✅ NEW: IRI override slider (HUD quick control) */}
          <div className="pt-4 mt-4 border-t border-white/5 pointer-events-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                Adjust IRI (Override)
              </span>
              <span className="text-[10px] text-sky-300 font-mono">
                base {baselineIRI.toFixed(1)} → {startIRI.toFixed(1)}
              </span>
            </div>

            <input
              type="range"
              min="1"
              max="10"
              step="0.1"
              value={startIRI}
              disabled={isDriving} // keep stable during run
              onChange={(e) => setIriOverride(Number(e.target.value))}
              className="w-full accent-sky-500 h-1.5 bg-slate-800 rounded-full appearance-none cursor-pointer disabled:opacity-50"
            />

            <p className="text-[11px] text-slate-500 mt-2 italic">
              This changes road visuals + impact probability.
            </p>
          </div>
        </div>

        {/* LIVE CONTROL PANEL */}
        {isDriving && (
          <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 p-4 rounded-2xl animate-in slide-in-from-left duration-500 pointer-events-auto shadow-2xl">
            <p className="text-[9px] font-black text-slate-500 uppercase mb-3 flex items-center gap-2">
              <Activity className="w-3 h-3 text-rose-500" /> Overrides
            </p>

            <div className="space-y-3">
              <div className="flex gap-2">
                <button
                  onClick={() => setIsDriving(false)}
                  className="flex-1 flex items-center justify-center gap-2 text-[10px] font-bold text-white bg-white/5 hover:bg-white/10 p-2 rounded-lg transition-colors border border-white/5"
                >
                  <Pause className="w-3 h-3" /> PAUSE
                </button>

                <button
                  onClick={() => {
                    setIsDriving(false);
                    setTimeout(() => setIsDriving(true), 100);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 text-[10px] font-bold text-white bg-white/5 hover:bg-white/10 p-2 rounded-lg transition-colors border border-white/5"
                >
                  <RefreshCcw className="w-3 h-3" /> RESTART
                </button>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[8px] text-slate-500 uppercase font-black">Pothole Density</label>
                  <span className="text-[10px] text-rose-500 font-mono">{potholeIntensity}x</span>
                </div>

                <input
                  type="range"
                  min="1"
                  max="20"
                  value={potholeIntensity}
                  onChange={(e) => setPotholeIntensity(Number(e.target.value))}
                  className="w-full accent-rose-500 h-1 bg-slate-800 rounded-full appearance-none cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SPEED HUD */}
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
          iri={startIRI}                 // ✅ override feeds 3D + sim
          surface={surface}              // ✅ gravel affects visuals + sim
          isDriving={isDriving}
          speedLimit={speedLimit}
          potholeCount={potholeIntensity}
          onDriveComplete={(data: any) => {
            setIsDriving(false);

            const scaledLoss = data.loss * (cargoValue / 1250000);

            setResults({
              ...data,
              loss: scaledLoss,
              cargoValue,
            });
          }}
        />

        {/* START PANEL */}
        {!isDriving && !results && (
          <div className="absolute inset-0 z-30 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-6">
            <div className="text-center space-y-8 w-full max-w-2xl p-10 bg-slate-900/95 rounded-[50px] border border-white/10 shadow-2xl">
              <div className="space-y-2">
                <h2 className="text-5xl font-black text-white tracking-tighter uppercase italic">
                  Network Simulation Ready
                </h2>
                <p className="text-slate-400 font-medium">
                  Mechanical Stress Run — Road visuals + impacts respond to IRI override
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-left">
                <div className="bg-white/5 p-6 rounded-[32px] border border-white/10">
                  <div className="text-[9px] font-black text-slate-500 uppercase mb-3 flex items-center gap-2">
                    <Zap className="w-3 h-3 text-amber-500" /> Network Findings
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs text-white">
                      Segment: <span className="font-bold text-sky-400">{selectedSegment?.name}</span>
                    </p>

                    <p className="text-[11px] text-slate-300 font-bold">
                      IRI: {startIRI.toFixed(1)}{" "}
                      <span className="text-slate-500 font-normal ml-1">(VCI {vciEquivalent})</span>
                    </p>

                    <p className="text-[11px] text-slate-400">
                      Surface: <span className="text-slate-200 font-bold uppercase">{surface}</span>
                    </p>

                    <div className={`mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${risk.chip}`}>
                      <AlertTriangle className={`w-3 h-3 ${risk.color}`} />
                      <span className={`text-[10px] font-black uppercase tracking-widest ${risk.color}`}>
                        Risk: {risk.label}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 mt-2 italic">{headline}</p>
                  </div>
                </div>

                <div className="bg-white/5 p-6 rounded-[32px] border border-white/10">
                  <div className="text-[9px] font-black text-slate-500 uppercase mb-3 flex items-center gap-2">
                    <Database className="w-3 h-3 text-sky-500" /> Cargo Config
                  </div>

                  <select
                    value={cargoValue}
                    onChange={(e) => setCargoValue(Number(e.target.value))}
                    className="bg-slate-800 text-xs text-white font-bold outline-none w-full p-2 rounded-xl border border-white/5 cursor-pointer"
                  >
                    <option value={500000}>Produce (Value: R 500k)</option>
                    <option value={1250000}>Machinery (Value: R 1.25m)</option>
                    <option value={3000000}>Electronics (Value: R 3m)</option>
                  </select>

                  <p className="text-[11px] text-slate-400 mt-3">
                    Loss is scaled to cargo value after the run.
                  </p>
                </div>
              </div>

              <div className="bg-white/5 p-8 rounded-[40px] border border-white/10 shadow-inner">
                <div className="flex justify-between mb-4">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Velocity Target</span>
                  <span className="text-xs font-mono text-sky-400">{speedLimit} km/h</span>
                </div>

                <input
                  type="range"
                  min="60"
                  max="120"
                  step="10"
                  value={speedLimit}
                  onChange={(e) => setSpeedLimit(Number(e.target.value))}
                  className="w-full accent-sky-500 h-1.5 bg-slate-800 rounded-full appearance-none cursor-pointer"
                />
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

        {/* RESULTS PANEL */}
        {results && (
          <div className="absolute inset-0 z-40 bg-slate-950/90 backdrop-blur-2xl flex items-center justify-center p-8">
            <div className="w-full max-w-2xl p-12 bg-slate-900 border border-white/10 rounded-[60px] space-y-10 animate-in zoom-in-95 duration-300">
              <div className="text-center">
                <div className="inline-flex p-5 bg-emerald-500/10 rounded-full mb-4 border border-emerald-500/20">
                  <CheckCircle className="w-10 h-10 text-emerald-500" />
                </div>
                <h3 className="text-4xl font-black text-white uppercase italic tracking-tighter">
                  Simulation Intelligence
                </h3>
              </div>

              <div className="grid grid-cols-3 gap-6">
                <div className="bg-white/5 p-6 rounded-[40px] border border-white/10 text-center">
                  <div className="text-[10px] text-slate-500 font-black uppercase mb-2">Integrity</div>
                  <div className="text-5xl font-black text-white font-mono">
                    {results.integrity.toFixed(0)}%
                  </div>
                </div>

                <div className="bg-white/5 p-6 rounded-[40px] border border-white/10 text-center">
                  <div className="text-[10px] text-slate-500 font-black uppercase mb-2">Impact Events</div>
                  <div className="text-4xl font-black text-sky-300 font-mono">
                    {results.impactCount ?? 0}
                  </div>
                </div>

                <div className="bg-white/5 p-6 rounded-[40px] border border-white/10 text-center">
                  <div className="text-[10px] text-slate-500 font-black uppercase mb-2">Loss</div>
                  <div className="text-2xl font-black text-white font-mono leading-tight mt-2">
                    R {Math.floor(results.loss).toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="bg-sky-500/5 border border-sky-500/20 p-6 rounded-[32px]">
                <h4 className="text-sky-400 font-black text-[10px] uppercase mb-2 tracking-widest flex items-center gap-2">
                  <Info className="w-3 h-3" /> IRI-driven insight
                </h4>
                <p className="text-slate-400 text-xs leading-relaxed italic">
                  Using overridden IRI <strong className="text-white">{startIRI.toFixed(1)}</strong> at{" "}
                  <strong className="text-white">{speedLimit}km/h</strong> with pothole density{" "}
                  <strong className="text-white">{potholeIntensity}x</strong> on{" "}
                  <strong className="text-white">{surface.toUpperCase()}</strong>, the run produced{" "}
                  <strong className="text-white">{results.impactCount ?? 0}</strong> impact events and integrity{" "}
                  <strong className="text-white">{results.integrity.toFixed(0)}%</strong>.
                </p>
              </div>

              <button
                onClick={() => setResults(null)}
                className="w-full py-5 bg-white text-black font-black rounded-[28px] uppercase tracking-widest text-xs hover:bg-slate-200 transition-colors shadow-2xl"
              >
                Dismiss Briefing
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}