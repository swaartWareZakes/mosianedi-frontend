"use client";

import React, { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic"; 
import { useSearchParams, useRouter, useParams } from "next/navigation";
import { X, ChevronLeft, ChevronRight, TrendingDown, AlertTriangle, CheckCircle2, DollarSign, MapPin, Building2, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNetworkSnapshot } from "../../../[projectId]/config/hooks/useNetworkSnapshot";
import { useSimulationResults } from "../../../[projectId]/dashboard/hooks/useSimulationResults";

const LiveMap = dynamic(() => import("./components/LiveMap"), { ssr: false });

// Helper: Format Billions/Millions
const formatCurrency = (value: number) => {
    if (!value) return "0m";
    if (value >= 1000000000) return `${(value / 1000000000).toFixed(2)}bn`;
    return `${(value / 1000000).toFixed(0)}m`;
};

// Helper: Create Smooth SVG Curves
const getPath = (points: number[][], width: number, height: number, maxX: number, maxY: number) => {
    if (points.length === 0) return "";
    const scaleX = width / maxX;
    const scaleY = height / maxY;
    
    // Map points to canvas coordinates
    const P = points.map(([x, y]) => [x * scaleX, height - (y * scaleY)]);

    if (P.length === 2) return `M ${P[0][0]} ${P[0][1]} L ${P[1][0]} ${P[1][1]}`;

    // Catmull-Rom to Bezier conversion for smoothness
    let d = `M ${P[0][0]} ${P[0][1]}`;
    for (let i = 0; i < P.length - 1; i++) {
        const p0 = i > 0 ? P[i - 1] : P[0];
        const p1 = P[i];
        const p2 = P[i + 1];
        const p3 = i !== P.length - 2 ? P[i + 2] : p2;

        const cp1x = p1[0] + (p2[0] - p0[0]) / 6;
        const cp1y = p1[1] + (p2[1] - p0[1]) / 6;
        const cp2x = p2[0] - (p3[0] - p1[0]) / 6;
        const cp2y = p2[1] - (p3[1] - p1[1]) / 6;

        d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2[0]} ${p2[1]}`;
    }
    return d;
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

  // 2. CHART PREP (SMOOTH CURVES)
  const chartConfig = useMemo(() => {
      const currentVci = snapshot?.avgVci || 60;
      
      // Do Nothing (Decay) Data
      const redPoints = Array.from({ length: duration + 1 }).map((_, i) => {
          const val = Math.max(0, currentVci - (i * 3.5)); // Simulated decay
          return [i, val];
      });

      // Funded (Improve) Data
      const greenPoints = results?.yearly_data 
          ? results.yearly_data.map((d: any, i: number) => [i, d.avg_condition_index])
          : [[0, currentVci], [duration, Math.min(100, currentVci + 5)]]; // Fallback

      const redPath = getPath(redPoints, 800, 300, duration, 100);
      const greenPath = getPath(greenPoints, 800, 300, duration, 100);

      const finalRed = redPoints[redPoints.length - 1][1];
      const finalGreen = greenPoints[greenPoints.length - 1][1];

      return { redPath, greenPath, finalRed, finalGreen };
  }, [snapshot, results, duration]);

  // 3. SLIDES
  const slides = useMemo(() => {
      const s = [];
      if (slideConfig.context !== false) s.push({ id: "intro", label: "Baseline", layer: "default" });
      if (slideConfig.decay !== false) s.push({ id: "decay", label: "The Risk", layer: "condition" }); // Map turns colorful
      if (slideConfig.finance !== false) s.push({ id: "ask", label: "Investment", layer: "default" });
      if (slideConfig.end !== false) s.push({ id: "impact", label: "Strategy", layer: "default" });
      return s.length > 0 ? s : [{ id: "intro", label: "Overview", layer: "default" }];
  }, [slideConfig]);

  const [activeSlide, setActiveSlide] = useState(0);
  const currentSlide = slides[activeSlide];

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
        if (e.key === "ArrowRight") setActiveSlide(curr => Math.min(slides.length - 1, curr + 1));
        if (e.key === "ArrowLeft") setActiveSlide(curr => Math.max(0, curr - 1));
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [slides.length]);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-slate-950 text-white font-sans selection:bg-indigo-500/30">
      
      {/* 1. BACKGROUND MAP (Dynamic Opacity) */}
      <div className="absolute inset-0 z-0 transition-all duration-1000">
         <div className={cn(
             "absolute inset-0 bg-slate-950 transition-opacity duration-1000 z-10",
             currentSlide.layer === 'condition' ? 'opacity-40' : 'opacity-80'
         )} />
         <div className={cn(
             "absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950 z-20 transition-opacity duration-1000",
             currentSlide.id === 'decay' ? 'opacity-90 from-slate-950 via-rose-950/20 to-slate-950' : 'opacity-100'
         )} />
         <LiveMap activeLayer={currentSlide.layer} province={province} />
      </div>

      {/* 2. HEADER (Fixed) */}
      <header className="absolute top-0 w-full z-50 p-8 flex justify-between items-start">
        <div className="flex items-center gap-4">
            <div className="w-12 h-1 bg-indigo-500/50 rounded-full backdrop-blur-md" />
            <div>
                <h1 className="text-xl font-bold tracking-tight text-white/90">{title}</h1>
                <div className="text-[10px] uppercase tracking-widest text-slate-400 font-medium">
                    {province} Strategy • {startYear}-{endYear}
                </div>
            </div>
        </div>
        <button onClick={() => router.back()} className="group p-3 bg-white/5 hover:bg-white/10 rounded-full transition-all border border-white/5 hover:border-white/20 backdrop-blur-md">
            <X className="h-5 w-5 text-white/50 group-hover:text-white" />
        </button>
      </header>

      {/* 3. MAIN STAGE */}
      <main className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none p-12">
        
        {/* SLIDE: INTRO (Asset Context) */}
        {currentSlide.id === "intro" && (
            <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-end animate-in fade-in zoom-in-95 duration-1000">
                <div className="space-y-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest">
                        <Layers className="w-3 h-3" /> Current Network Status
                    </div>
                    <h2 className="text-7xl font-black leading-tight tracking-tighter drop-shadow-2xl">
                        Asset <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-100 to-slate-500">Baseline.</span>
                    </h2>
                    <p className="text-xl text-slate-400 max-w-md leading-relaxed">
                        A detailed review of the current engineering inventory and valuation for the {province} region.
                    </p>
                </div>
                
                {/* HUD Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <HudCard label="Replacement Cost" value={`R${((snapshot?.assetValue || 0)/1e9).toFixed(1)}bn`} icon={<Building2 className="w-5 h-5 text-indigo-400"/>} delay={100} />
                    <HudCard label="Network Size" value={`${(snapshot?.totalLengthKm || 0).toLocaleString()} km`} icon={<MapPin className="w-5 h-5 text-blue-400"/>} delay={200} />
                    <HudCard label="Avg Condition" value={`VCI ${(snapshot?.avgVci || 0).toFixed(0)}`} icon={<TrendingDown className="w-5 h-5 text-emerald-400"/>} delay={300} />
                    <HudCard label="Current Backlog" value={`R${formatCurrency(results?.total_cost_npv ? results.total_cost_npv * 0.4 : 0)}`} icon={<AlertTriangle className="w-5 h-5 text-amber-400"/>} delay={400} sub="Est. Immediate Need" />
                </div>
            </div>
        )}

        {/* SLIDE: DECAY (The Risk) */}
        {currentSlide.id === "decay" && (
            <div className="w-full max-w-6xl flex flex-col items-center text-center animate-in slide-in-from-bottom-10 fade-in duration-700">
                <div className="p-4 bg-rose-500/20 rounded-full border border-rose-500/30 mb-6 animate-pulse">
                    <AlertTriangle className="w-12 h-12 text-rose-500" />
                </div>
                <h2 className="text-6xl font-black text-white mb-6 tracking-tight drop-shadow-2xl">
                    The Cost of <span className="text-rose-500">Inaction.</span>
                </h2>
                <div className="max-w-2xl bg-black/60 backdrop-blur-xl border border-rose-500/30 p-8 rounded-3xl">
                    <p className="text-2xl text-slate-200 leading-relaxed font-light">
                        Without intervention, network quality will degrade to <strong className="text-rose-400 font-bold">VCI {chartConfig.finalRed.toFixed(0)}</strong> (Poor) by {endYear}.
                    </p>
                    <div className="mt-6 h-1 w-full bg-gradient-to-r from-rose-900/0 via-rose-500 to-rose-900/0 opacity-50" />
                    <p className="mt-6 text-sm text-rose-300 font-mono uppercase tracking-widest">
                        Liability grows by R{(results?.total_cost_npv ? results.total_cost_npv * 0.12 / 1e6 : 0).toFixed(0)}m annually
                    </p>
                </div>
            </div>
        )}

        {/* SLIDE: FINANCIALS (The Ask) */}
        {currentSlide.id === "ask" && (
            <div className="w-full max-w-5xl text-center animate-in zoom-in-95 duration-700">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-8">
                    <CheckCircle2 className="w-4 h-4" /> Strategic Recommendation
                </div>
                
                <h1 className="text-[140px] font-black text-white leading-[0.9] tracking-tighter drop-shadow-2xl mb-4">
                    R {formatCurrency(results?.total_cost_npv || 0)}
                </h1>
                
                <p className="text-2xl text-slate-400 font-light mb-12">
                    Total investment requirement over the <strong>{duration}-Year</strong> MTEF period.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                    <ValueProp title="Fiscal Efficiency" desc="Reduces long-term capital demand by ~40% vs reactive repairs." delay={100} />
                    <ValueProp title="Service Delivery" desc={`Stabilizes key corridors in the ${province} region.`} delay={200} />
                    <ValueProp title="Asset Security" desc={`Maintains VCI above ${chartConfig.finalGreen.toFixed(0)}, preserving asset value.`} delay={300} />
                </div>
            </div>
        )}

        {/* SLIDE: CONCLUSION (The Graph) */}
        {currentSlide.id === "impact" && (
            <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-[1fr,2fr] gap-12 items-center animate-in slide-in-from-right duration-700">
                <div className="space-y-6">
                    <h2 className="text-5xl font-black text-white leading-none">Strategic <br/> Impact.</h2>
                    <p className="text-lg text-slate-400">
                        Visualizing the divergence between the "Do Nothing" scenario and the "Funded Strategy."
                    </p>
                    <div className="space-y-4 pt-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-1 bg-emerald-500 rounded-full" />
                            <div className="text-sm font-bold text-emerald-400 uppercase tracking-widest">Funded (Safe)</div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-1 bg-rose-500 rounded-full opacity-50" />
                            <div className="text-sm font-bold text-rose-400 uppercase tracking-widest">Do Nothing (Risk)</div>
                        </div>
                    </div>
                </div>

                <div className="relative h-[400px] w-full bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
                    {/* Y-Axis Labels */}
                    <div className="absolute left-4 top-8 bottom-8 flex flex-col justify-between text-xs text-slate-600 font-mono">
                        <span>100 (Good)</span>
                        <span>50 (Fair)</span>
                        <span>0 (Poor)</span>
                    </div>
                    
                    {/* Chart Canvas */}
                    <div className="absolute inset-0 left-16 right-8 top-8 bottom-8">
                        <svg className="w-full h-full overflow-visible" viewBox="0 0 800 300" preserveAspectRatio="none">
                            {/* Grid Lines */}
                            <line x1="0" y1="0" x2="800" y2="0" stroke="white" strokeOpacity="0.05" />
                            <line x1="0" y1="150" x2="800" y2="150" stroke="white" strokeOpacity="0.05" strokeDasharray="4 4" />
                            <line x1="0" y1="300" x2="800" y2="300" stroke="white" strokeOpacity="0.05" />

                            {/* Red Path (Under) */}
                            <path d={chartConfig.redPath} fill="none" stroke="#f43f5e" strokeWidth="4" strokeOpacity="0.6" strokeDasharray="10 5" />
                            
                            {/* Green Path (Top) */}
                            <path d={chartConfig.greenPath} fill="none" stroke="#10b981" strokeWidth="6" strokeLinecap="round" className="drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                            
                            {/* End Points */}
                            <circle cx="800" cy={300 - (chartConfig.finalGreen * 3)} r="6" fill="#10b981" />
                            <circle cx="800" cy={300 - (chartConfig.finalRed * 3)} r="6" fill="#f43f5e" />
                        </svg>
                    </div>
                </div>
            </div>
        )}

      </main>

      {/* 4. CONTROLS (Footer) */}
      <footer className="absolute bottom-8 w-full z-50 flex justify-center pointer-events-auto">
          <div className="flex items-center gap-4 bg-white/5 backdrop-blur-md border border-white/10 p-2 pl-6 pr-2 rounded-full shadow-2xl transition-transform hover:scale-105">
              <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{activeSlide + 1} / {slides.length}</span>
                  <span className="text-sm font-bold text-white">{currentSlide.label}</span>
              </div>
              <div className="h-8 w-px bg-white/10 mx-2" />
              <div className="flex gap-2">
                  <button 
                    onClick={() => setActiveSlide(curr => Math.max(0, curr - 1))}
                    disabled={activeSlide === 0}
                    className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition disabled:opacity-20"
                  >
                      <ChevronLeft className="w-5 h-5 text-white" />
                  </button>
                  <button 
                    onClick={() => setActiveSlide(curr => Math.min(slides.length - 1, curr + 1))}
                    disabled={activeSlide === slides.length - 1}
                    className="p-3 bg-indigo-600 hover:bg-indigo-500 rounded-full transition shadow-lg disabled:opacity-20 disabled:bg-slate-700"
                  >
                      <ChevronRight className="w-5 h-5 text-white" />
                  </button>
              </div>
          </div>
      </footer>

    </div>
  );
}

// --- SUB-COMPONENTS ---

function HudCard({ label, value, icon, delay, sub }: any) {
    return (
        <div 
            className="p-5 bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-xl hover:bg-white/5 transition-colors group animate-in slide-in-from-bottom-4 fade-in fill-mode-backwards"
            style={{ animationDelay: `${delay}ms` }}
        >
            <div className="flex justify-between items-start mb-2">
                <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold group-hover:text-slate-300 transition-colors">{label}</div>
                {icon}
            </div>
            <div className="text-3xl font-bold font-mono text-white tracking-tight">{value}</div>
            {sub && <div className="text-[10px] text-rose-400 mt-1 font-medium">{sub}</div>}
        </div>
    )
}

function ValueProp({ title, desc, delay }: any) {
    return (
        <div 
            className="p-6 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-colors animate-in slide-in-from-bottom-8 fade-in fill-mode-backwards"
            style={{ animationDelay: `${delay}ms` }}
        >
            <div className="w-8 h-1 bg-emerald-500 rounded-full mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
            <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
        </div>
    )
}