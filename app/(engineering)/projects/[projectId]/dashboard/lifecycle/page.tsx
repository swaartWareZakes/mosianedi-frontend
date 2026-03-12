"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { PieChart, Layers, Droplets, HardHat, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

const BORDER = "border-[color:color-mix(in_oklab,var(--foreground)_14%,transparent)]";
const TEXT_MUTED = "text-[color:color-mix(in_oklab,var(--foreground)_55%,transparent)]";
const BG_SOFT = "bg-[color:color-mix(in_oklab,var(--foreground)_4%,transparent)]";

export default function ApportionmentPage() {
  const params = useParams();
  const projectId = Array.isArray(params?.projectId) ? params?.projectId[0] : params?.projectId;

  const [loading, setLoading] = useState(true);

  // Simulated apportionment data
  const yearlySpend = [
    { year: 2026, routine: 15, periodic: 35, rehab: 50 },
    { year: 2027, routine: 18, periodic: 30, rehab: 52 },
    { year: 2028, routine: 20, periodic: 25, rehab: 55 },
    { year: 2029, routine: 25, periodic: 20, rehab: 55 },
    { year: 2030, routine: 30, periodic: 15, rehab: 55 },
  ];

  const categories = [
    { id: 'rehab', label: 'Capital Rehab / Recon', desc: 'Heavy structural repairs', color: 'bg-indigo-500' },
    { id: 'periodic', label: 'Periodic Maintenance', desc: 'Reseals & Regravelling', color: 'bg-emerald-500' },
    { id: 'routine', label: 'Routine Maintenance', desc: 'Potholes, patching, grading', color: 'bg-amber-500' },
  ];

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <div className="p-12 flex justify-center"><div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"/></div>;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)] flex items-center gap-3">
          <PieChart className="w-6 h-6 text-[var(--accent-color)]" />
          Budget Apportionment & Lifecycle
        </h1>
        <p className={cn("mt-1 text-sm", TEXT_MUTED)}>
          Analyze the recommended distribution of funds across maintenance categories over the simulation lifecycle.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Summary & Legends */}
        <div className="space-y-6">
            <div className={cn("rounded-2xl border p-6 bg-[var(--surface-bg)] shadow-sm", BORDER)}>
                <h3 className="text-sm font-bold uppercase tracking-wider mb-5 text-[var(--foreground)]">Maintenance Strategy</h3>
                <div className="space-y-4">
                    {categories.map(c => (
                        <div key={c.id} className="flex items-start gap-3">
                            <div className={cn("w-3 h-3 rounded-sm mt-1 shrink-0", c.color)} />
                            <div>
                                <div className="text-sm font-bold text-[var(--foreground)]">{c.label}</div>
                                <div className={cn("text-[10px]", TEXT_MUTED)}>{c.desc}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className={cn("rounded-2xl border p-6 bg-[color:color-mix(in_oklab,var(--accent-color)_5%,transparent)] shadow-sm", "border-[color:color-mix(in_oklab,var(--accent-color)_20%,transparent)]")}>
                <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-[var(--accent-color)]" />
                    <h3 className="text-sm font-bold text-[var(--accent-color)]">Lifecycle Shift</h3>
                </div>
                <p className="text-xs leading-relaxed text-[var(--foreground)] opacity-90 font-medium">
                    Notice how Capital Rehab consumes 50%+ of the budget initially. As the backlog is cleared by 2028, more funds theoretically free up for Routine Maintenance, stabilizing the network.
                </p>
            </div>
        </div>

        {/* Right Column: The Apportionment Stack Chart */}
        <div className="lg:col-span-2 space-y-6">
            <div className={cn("rounded-2xl border p-6 bg-[var(--surface-bg)] shadow-sm h-full flex flex-col", BORDER)}>
                <h2 className="text-base font-bold text-[var(--foreground)] flex items-center gap-2 mb-8">
                    <Layers className="w-4 h-4 text-emerald-500" />
                    5-Year Allocation Breakdown (%)
                </h2>

                <div className="flex-1 relative flex items-end justify-between px-2 pt-6 pb-8 min-h-[300px]">
                    {/* Y-Axis markers */}
                    <div className={cn("absolute left-0 top-0 bottom-8 w-full flex flex-col justify-between text-[10px] font-mono pointer-events-none", TEXT_MUTED)}>
                        <div className="border-t border-dashed border-[color:color-mix(in_oklab,var(--foreground)_10%,transparent)] w-full relative"><span className="absolute -top-2 bg-[var(--surface-bg)] pr-2">100%</span></div>
                        <div className="border-t border-dashed border-[color:color-mix(in_oklab,var(--foreground)_10%,transparent)] w-full relative"><span className="absolute -top-2 bg-[var(--surface-bg)] pr-2">50%</span></div>
                        <div className="border-t border-[color:color-mix(in_oklab,var(--foreground)_20%,transparent)] w-full" />
                    </div>

                    {/* Bars */}
                    {yearlySpend.map((yearData, idx) => (
                        <div key={idx} className="relative w-16 md:w-20 h-full flex flex-col justify-end group z-10">
                            
                            {/* Rehab Block */}
                            <div 
                                className="w-full bg-indigo-500 transition-all duration-500 hover:brightness-110 flex items-center justify-center rounded-t-sm"
                                style={{ height: `${yearData.rehab}%` }}
                                title={`Capital Rehab: ${yearData.rehab}%`}
                            >
                                {yearData.rehab > 10 && <span className="text-[10px] font-bold text-white/90">{yearData.rehab}%</span>}
                            </div>
                            
                            {/* Periodic Block */}
                            <div 
                                className="w-full bg-emerald-500 transition-all duration-500 hover:brightness-110 flex items-center justify-center"
                                style={{ height: `${yearData.periodic}%` }}
                                title={`Periodic: ${yearData.periodic}%`}
                            >
                                {yearData.periodic > 10 && <span className="text-[10px] font-bold text-white/90">{yearData.periodic}%</span>}
                            </div>
                            
                            {/* Routine Block */}
                            <div 
                                className="w-full bg-amber-500 transition-all duration-500 hover:brightness-110 flex items-center justify-center rounded-b-sm"
                                style={{ height: `${yearData.routine}%` }}
                                title={`Routine: ${yearData.routine}%`}
                            >
                                {yearData.routine > 10 && <span className="text-[10px] font-bold text-white/90">{yearData.routine}%</span>}
                            </div>

                            {/* Label */}
                            <div className={cn("absolute -bottom-7 w-full text-center text-[10px] font-bold", TEXT_MUTED)}>
                                {yearData.year}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

      </div>
    </div>
  );
}