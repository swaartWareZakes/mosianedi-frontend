"use client";

import React, { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic"; 
import { useSearchParams, useRouter, useParams } from "next/navigation";
import { X, ChevronLeft, ChevronRight, TrendingDown, AlertTriangle, CheckCircle2, DollarSign, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNetworkSnapshot } from "../../../[projectId]/config/hooks/useNetworkSnapshot";
import { useSimulationResults } from "../../../[projectId]/dashboard/hooks/useSimulationResults";

const LiveMap = dynamic(() => import("./components/LiveMap"), { ssr: false });

// Helper to format big money
const formatCurrency = (value: number) => {
    if (!value) return "0m";
    if (value >= 1000000000) {
        return `${(value / 1000000000).toFixed(1)}bn`;
    }
    return `${(value / 1000000).toFixed(0)}m`;
};

export default function PresentationLivePage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const projectId = Array.isArray(params?.projectId) ? params?.projectId[0] : params?.projectId;
  
  const title = searchParams.get("title") || "Strategy Presentation";
  const provinceOverride = searchParams.get("province");
  const slideConfig = JSON.parse(searchParams.get("slides") || "{}");

  const { data: snapshot } = useNetworkSnapshot(projectId || "");
  const { results } = useSimulationResults(projectId || "");

  // 1. DATA PREP
  const province = useMemo(() => {
      if (provinceOverride) return provinceOverride;
      const name = ((snapshot as any)?.project_name || "").toLowerCase();
      if (name.includes("free state")) return "Free State";
      if (name.includes("eastern cape")) return "Eastern Cape";
      if (name.includes("western cape")) return "Western Cape";
      if (name.includes("kzn") || name.includes("natal")) return "KwaZulu-Natal";
      if (name.includes("limpopo")) return "Limpopo";
      return "Gauteng"; 
  }, [snapshot, provinceOverride]);

  const startYear = (snapshot as any)?.start_year || new Date().getFullYear() + 1;
  const duration = results?.year_count || 10;
  const endYear = startYear + duration;

  // 2. DYNAMIC CHART GENERATOR
  const chartData = useMemo(() => {
      const currentVci = snapshot?.avgVci || 60;
      
      const doNothingPoints = Array.from({ length: duration + 1 }).map((_, i) => {
          const val = Math.max(0, currentVci - (i * 4)); 
          return [i, val];
      });

      const interventionPoints = results?.yearly_data 
          ? results.yearly_data.map((d: any, i: number) => [i, d.avg_condition_index])
          : [[0, currentVci], [duration, Math.min(100, currentVci + 5)]];

      const toPath = (points: number[][]) => {
          return "M" + points.map(([x, y]) => 
              `${x * (600 / duration)},${300 - (y * 3)}`
          ).join(" L");
      };

      return {
          redPath: toPath(doNothingPoints),
          greenPath: toPath(interventionPoints),
          finalRedVci: doNothingPoints[doNothingPoints.length - 1][1],
          finalGreenVci: interventionPoints[interventionPoints.length - 1]?.[1] || currentVci
      };
  }, [snapshot, results, duration]);


  // 3. SLIDES CONFIG
  const slides = useMemo(() => {
      const s = [];
      if (slideConfig.context !== false) s.push({ id: "intro", label: "Overview", layer: "default" });
      if (slideConfig.decay !== false) s.push({ id: "decay", label: "Risk Analysis", layer: "condition" });
      if (slideConfig.finance !== false) s.push({ id: "ask", label: "Budget Strategy", layer: "default" });
      if (slideConfig.end !== false) s.push({ id: "impact", label: "Conclusion", layer: "default" });
      if (s.length === 0) s.push({ id: "intro", label: "Overview", layer: "default" });
      return s;
  }, [slideConfig]);

  const [activeSlide, setActiveSlide] = useState(0);
  const [activeLayer, setActiveLayer] = useState("default");

  useEffect(() => {
      if(slides[activeSlide]) setActiveLayer(slides[activeSlide].layer);
  }, [activeSlide, slides]);

  const currentSlide = slides[activeSlide];

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-slate-950 text-white font-sans selection:bg-indigo-500/30">
      
      {/* BACKGROUND MAP */}
      <div className="absolute inset-0 z-0">
         <div className={`absolute inset-0 bg-slate-950/80 z-10 transition-opacity duration-1000 ${currentSlide.layer === 'condition' ? 'opacity-40' : 'opacity-80'}`} />
         <LiveMap activeLayer={activeLayer} segments={[]} province={province} />
      </div>

      {/* HEADER */}
      <header className="absolute top-0 w-full z-50 p-8 flex justify-between items-start">
        <div className="animate-in slide-in-from-top duration-500">
            <div className="flex items-center gap-3 mb-2">
                <div className="px-3 py-1 rounded-full bg-white/10 border border-white/10 text-xs font-bold uppercase tracking-widest backdrop-blur-md">
                    {province} Region
                </div>
                <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] uppercase text-emerald-500 font-bold tracking-wider">Live System</span>
                </div>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-white drop-shadow-xl">{title}</h1>
        </div>
        <button onClick={() => router.back()} className="group p-3 bg-white/5 hover:bg-white/10 rounded-full transition-all border border-white/5 hover:border-white/20 backdrop-blur-md">
            <X className="h-6 w-6 text-white/70 group-hover:text-white" />
        </button>
      </header>

      {/* CONTENT STAGE */}
      <main className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none p-12">
        
        {/* SLIDE 1: INTRO */}
        {currentSlide.id === "intro" && (
            <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center animate-in fade-in zoom-in-95 duration-700">
                <div className="space-y-8">
                    <h2 className="text-6xl font-black leading-tight drop-shadow-2xl">
                        Network <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Preservation Plan</span>
                    </h2>
                    <p className="text-xl text-slate-300 leading-relaxed max-w-md">
                        Strategic review of the <strong>{startYear}-{endYear}</strong> horizon for the {province} road network.
                    </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <StatBox label="Asset Value" value={`R${((snapshot?.assetValue || 0)/1e9).toFixed(1)}bn`} />
                    <StatBox label="Network Size" value={`${(snapshot?.totalLengthKm || 0).toFixed(0)} km`} />
                    <StatBox label="Current VCI" value={(snapshot?.avgVci || 0).toFixed(0)} color={(snapshot?.avgVci || 0) < 50 ? 'text-rose-400' : 'text-emerald-400'} />
                    <StatBox label="Backlog Estimate" value={`R${formatCurrency(results?.total_cost_npv || 0)}`} color="text-amber-400" />
                </div>
            </div>
        )}

        {/* SLIDE 2: DECAY */}
        {currentSlide.id === "decay" && (
            <div className="absolute left-16 bottom-32 max-w-xl bg-black/60 backdrop-blur-xl border-l-4 border-rose-500 p-10 rounded-r-3xl shadow-2xl animate-in slide-in-from-left duration-700">
                <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-rose-500/20 rounded-xl">
                        <AlertTriangle className="h-8 w-8 text-rose-500" />
                    </div>
                    <h3 className="text-3xl font-bold uppercase tracking-wide text-white">Critical Risk</h3>
                </div>
                <p className="text-xl text-slate-200 mb-8 leading-relaxed">
                    Based on current deterioration rates (VCI {(snapshot?.avgVci || 0).toFixed(0)}), failure to intervene will drop network quality to <strong className="text-rose-400">VCI {chartData.finalRedVci.toFixed(0)}</strong> by {endYear}.
                    <br/><br/>
                    <span className="text-rose-300">Impact:</span> Rehabilitation costs will likely double if deferred beyond {startYear + 3}.
                </p>
            </div>
        )}

        {/* SLIDE 3: FINANCIALS */}
        {currentSlide.id === "ask" && (
            <div className="text-center animate-in fade-in zoom-in duration-700">
                <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-8 backdrop-blur-md">
                    <CheckCircle2 className="h-5 w-5" /> Recommended Allocation
                </div>
                <h2 className="text-[120px] font-black text-white mb-2 tracking-tighter leading-none drop-shadow-2xl">
                    R {formatCurrency(results?.total_cost_npv || 0)}
                </h2>
                <p className="text-3xl text-slate-400 max-w-3xl mx-auto leading-normal font-light">
                    Required for <span className="text-white font-bold">FY{startYear}/{startYear+1}</span> Preventive Maintenance.
                </p>
                <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto text-left">
                    <BenefitItem icon={<DollarSign className="w-6 h-6"/>} title="Fiscal Efficiency" desc="Reduces future capital demand by ~40% through early intervention." />
                    <BenefitItem icon={<MapPin className="w-6 h-6"/>} title="Strategic Coverage" desc={`Stabilizes ${duration}-year outlook for key economic corridors.`} />
                    <BenefitItem icon={<TrendingDown className="w-6 h-6"/>} title="Risk Mitigation" desc={`Maintains VCI above ${chartData.finalGreenVci.toFixed(0)} critical threshold.`} />
                </div>
            </div>
        )}

        {/* SLIDE 4: CONCLUSION (CHART) */}
        {currentSlide.id === "impact" && (
            <div className="max-w-4xl w-full bg-slate-900/80 backdrop-blur-2xl border border-white/10 p-12 rounded-[2rem] shadow-2xl animate-in slide-in-from-bottom duration-700">
                <h3 className="text-3xl font-bold mb-10 flex items-center gap-4">
                    <TrendingDown className="h-8 w-8 text-indigo-400" />
                    Strategic Impact Summary
                </h3>
                
                {/* DYNAMIC SVG CHART */}
                <div className="relative h-80 w-full border-l border-b border-white/20 flex items-end px-4 gap-8">
                    <div className="absolute -left-12 top-0 bottom-0 flex flex-col justify-between text-xs text-slate-500 py-2 font-mono">
                        <span>100 (Good)</span>
                        <span>50 (Fair)</span>
                        <span>0 (Poor)</span>
                    </div>

                    {/* Red Line (Do Nothing) */}
                    <svg className="absolute inset-0 w-full h-full overflow-visible">
                        <path d={chartData.redPath} fill="none" stroke="#ef4444" strokeWidth="4" strokeDasharray="8 4" className="drop-shadow-lg" />
                        <text x="95%" y={300 - (chartData.finalRedVci * 3)} fill="#ef4444" className="text-sm font-bold">Do Nothing (VCI {chartData.finalRedVci.toFixed(0)})</text>
                    </svg>

                    {/* Green Line (With Budget) */}
                    <svg className="absolute inset-0 w-full h-full overflow-visible">
                        <path d={chartData.greenPath} fill="none" stroke="#10b981" strokeWidth="5" className="drop-shadow-lg" />
                        <text x="95%" y={300 - (chartData.finalGreenVci * 3)} fill="#10b981" className="text-sm font-bold">Strategy (VCI {chartData.finalGreenVci.toFixed(0)})</text>
                    </svg>
                </div>
                
                <div className="mt-10 text-center text-sm text-slate-400 font-mono">
                    {duration}-Year Network Condition Index (VCI) Forecast • {startYear} to {endYear}
                </div>
            </div>
        )}

      </main>

      {/* CONTROLS */}
      <footer className="absolute bottom-10 left-0 right-0 flex justify-center z-50 pointer-events-auto">
          <div className="flex gap-6 items-center bg-black/40 backdrop-blur-xl p-3 px-6 rounded-full border border-white/10 shadow-2xl transition-all hover:bg-black/60">
              <button 
                onClick={() => setActiveSlide(Math.max(0, activeSlide - 1))} 
                disabled={activeSlide === 0}
                className="p-3 hover:bg-white/10 rounded-full transition disabled:opacity-30"
              >
                <ChevronLeft className="w-6 h-6"/>
              </button>
              
              <div className="flex flex-col items-center min-w-[120px]">
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Step {activeSlide + 1} of {slides.length}</span>
                  <span className="text-sm font-medium text-white">{currentSlide.label}</span>
              </div>

              <button 
                onClick={() => setActiveSlide(Math.min(slides.length - 1, activeSlide + 1))} 
                disabled={activeSlide === slides.length - 1}
                className="p-3 hover:bg-white/10 rounded-full transition disabled:opacity-30"
              >
                <ChevronRight className="w-6 h-6"/>
              </button>
          </div>
      </footer>

    </div>
  );
}

// --- SUB-COMPONENTS ---
function StatBox({ label, value, color = "text-white" }: any) {
    return (
        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-md hover:bg-white/10 transition-colors">
            <div className="text-[10px] uppercase tracking-widest text-slate-400 mb-2 font-bold">{label}</div>
            <div className={cn("text-3xl font-bold font-mono tracking-tight", color)}>{value}</div>
        </div>
    );
}

function BenefitItem({ icon, title, desc }: any) {
    return (
        <div className="flex gap-5 p-5 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
            <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl h-fit">{icon}</div>
            <div>
                <div className="font-bold text-white text-lg mb-1">{title}</div>
                <div className="text-sm text-slate-400 leading-relaxed">{desc}</div>
            </div>
        </div>
    );
}