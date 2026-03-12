"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { 
  TrendingDown, 
  TrendingUp, 
  AlertTriangle, 
  Scale,
  LineChart,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";

// Theme helpers
const BORDER = "border-[color:color-mix(in_oklab,var(--foreground)_14%,transparent)]";
const BORDER_SOFT = "border-[color:color-mix(in_oklab,var(--foreground)_8%,transparent)]";
const TEXT_MUTED = "text-[color:color-mix(in_oklab,var(--foreground)_55%,transparent)]";
const BG_SOFT = "bg-[color:color-mix(in_oklab,var(--foreground)_4%,transparent)]";

export default function ComparativeAnalysisPage() {
  const params = useParams();
  const projectId = Array.isArray(params?.projectId) ? params?.projectId[0] : params?.projectId;

  const [loading, setLoading] = useState(true);

  // Mocked comparative data for demonstration
  const scenarios = [
    { name: "Scenario A: Do Nothing", budget: "R 0", finalVci: 28, backlog: "R 4.2 bn", color: "bg-rose-500", text: "text-rose-500", light: "bg-rose-500/10" },
    { name: "Scenario B: Current Budget", budget: "R 500 m / yr", finalVci: 45, backlog: "R 1.8 bn", color: "bg-amber-500", text: "text-amber-500", light: "bg-amber-500/10" },
    { name: "Scenario C: Optimal Target", budget: "R 1.2 bn / yr", finalVci: 75, backlog: "R 0", color: "bg-emerald-500", text: "text-emerald-500", light: "bg-emerald-500/10" }
  ];

  const yearlyData = [2026, 2027, 2028, 2029, 2030].map((year, i) => ({
    year,
    scenA: Math.max(28, 58 - (i * 7)), // Rapid decay
    scenB: Math.max(45, 58 - (i * 3)), // Slow decay
    scenC: Math.min(75, 58 + (i * 4)), // Improvement
  }));

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <div className="p-12 flex justify-center"><div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"/></div>;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)] flex items-center gap-3">
          <Scale className="w-6 h-6 text-[var(--accent-color)]" />
          Comparative Analysis
        </h1>
        <p className={cn("mt-1 text-sm", TEXT_MUTED)}>
          Evaluate the 5-year impact of different funding strategies on network condition and unfunded liabilities.
        </p>
      </div>

      {/* Top Cards: Scenario Summaries */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {scenarios.map((s, idx) => (
          <div key={idx} className={cn("rounded-2xl border p-6 flex flex-col justify-between bg-[var(--surface-bg)] shadow-sm", BORDER)}>
            <div>
               <div className={cn("text-xs font-bold uppercase tracking-wider mb-4 px-2.5 py-1 rounded-md inline-block", s.light, s.text)}>
                  {s.name}
               </div>
               <div className="space-y-3">
                  <div className="flex justify-between items-center border-b pb-2 border-[color:color-mix(in_oklab,var(--foreground)_8%,transparent)]">
                      <span className={cn("text-xs font-medium", TEXT_MUTED)}>Annual Budget</span>
                      <span className="font-mono text-sm font-bold text-[var(--foreground)]">{s.budget}</span>
                  </div>
                  <div className="flex justify-between items-center border-b pb-2 border-[color:color-mix(in_oklab,var(--foreground)_8%,transparent)]">
                      <span className={cn("text-xs font-medium", TEXT_MUTED)}>2030 Final VCI</span>
                      <span className={cn("font-bold text-lg", s.text)}>{s.finalVci}</span>
                  </div>
               </div>
            </div>
            <div className="mt-5 pt-4 border-t border-[color:color-mix(in_oklab,var(--foreground)_14%,transparent)]">
               <span className={cn("text-[10px] uppercase font-bold block mb-1", TEXT_MUTED)}>Accumulated Backlog</span>
               <div className="text-xl font-black text-[var(--foreground)]">{s.backlog}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Middle: Divergence Chart (Custom CSS representation) */}
      <div className={cn("rounded-2xl border bg-[var(--surface-bg)] p-6 shadow-sm", BORDER)}>
         <div className="flex items-center justify-between mb-8">
            <h2 className="text-base font-bold text-[var(--foreground)] flex items-center gap-2">
               <LineChart className="w-4 h-4 text-indigo-500" />
               VCI Trajectory Divergence
            </h2>
         </div>

         <div className="relative">
            {/* Y-Axis labels */}
            <div className={cn("absolute left-0 top-0 bottom-6 w-8 flex flex-col justify-between text-[10px] font-mono", TEXT_MUTED)}>
               <span>80</span>
               <span>60</span>
               <span>40</span>
               <span>20</span>
            </div>

            {/* Grid */}
            <div className="ml-10 h-64 flex items-end justify-between relative border-l border-b border-[color:color-mix(in_oklab,var(--foreground)_20%,transparent)]">
                {/* Horizontal grid lines */}
                {[25, 50, 75].map(pct => (
                  <div key={pct} className="absolute left-0 right-0 border-t border-dashed border-[color:color-mix(in_oklab,var(--foreground)_10%,transparent)]" style={{ bottom: `${pct}%` }} />
                ))}

                {yearlyData.map((d, i) => (
                  <div key={i} className="relative flex-1 flex justify-center h-full group">
                     {/* Bars for each scenario */}
                     <div className="absolute bottom-0 flex gap-1 items-end h-full w-full max-w-[40px] px-1">
                        <div className="w-1/3 bg-rose-500 rounded-t-sm transition-all duration-700 hover:brightness-125" style={{ height: `${(d.scenA / 100) * 100}%` }} title={`Do Nothing: ${d.scenA}`} />
                        <div className="w-1/3 bg-amber-500 rounded-t-sm transition-all duration-700 hover:brightness-125" style={{ height: `${(d.scenB / 100) * 100}%` }} title={`Status Quo: ${d.scenB}`} />
                        <div className="w-1/3 bg-emerald-500 rounded-t-sm transition-all duration-700 hover:brightness-125" style={{ height: `${(d.scenC / 100) * 100}%` }} title={`Target: ${d.scenC}`} />
                     </div>
                     <span className={cn("absolute -bottom-6 text-[10px] font-bold", TEXT_MUTED)}>{d.year}</span>
                  </div>
                ))}
            </div>
         </div>
      </div>

      {/* Bottom: Insights Warning */}
      <div className={cn("rounded-2xl p-5 border flex items-start gap-4", "bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400")}>
         <AlertTriangle className="w-6 h-6 shrink-0 mt-0.5" />
         <div>
            <h3 className="text-sm font-bold mb-1">Critical Funding Risk Identified</h3>
            <p className="text-xs leading-relaxed opacity-90 font-medium">
               Maintaining the current budget (Scenario B) will result in a <strong>R 1.8 billion unfunded liability</strong> by 2030. The network will drop from a VCI of 58 down to 45, crossing the critical threshold where light rehabilitation must be replaced by total reconstruction, effectively doubling future repair costs.
            </p>
         </div>
      </div>

    </div>
  );
}