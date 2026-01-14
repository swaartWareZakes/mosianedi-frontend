"use client";

import React, { useMemo } from "react";
import {
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid,
} from "recharts";
import { TrendingUp, Activity, Coins, Map, BarChart3 } from "lucide-react";

import type { NetworkProfile } from "../../config/hooks/useNetworkSnapshot";
import type { SimulationOutput } from "../../config/types";
import { SimulationCharts } from "./SimulationCharts";

// 👇 1. Imports for AI Features
import { AiStrategyCard } from "./AiStrategyCard";
import { AiInsightChip } from "./AiInsightChip";
import { useAiAdvisor } from "../hooks/useAiAdvisor";

type Props = {
  // 👇 2. Add projectId here so TypeScript stops complaining
  projectId: string; 
  snapshot: NetworkProfile | null;
  loading: boolean;
  error: string | null;
  adjustedAssetValue: number | null; 
  simulationResults: SimulationOutput | null;
};

const SURFACE_COLOURS = ["#6366f1", "#f59e0b"]; 

function fmtCurrency(val: number) {
  if (val >= 1_000_000_000) return `R ${(val / 1_000_000_000).toFixed(1)} bn`;
  if (val >= 1_000_000) return `R ${(val / 1_000_000).toFixed(1)} m`;
  return `R ${val.toLocaleString()}`;
}

export function DashboardMainPanel({
  projectId, // 👈 3. Destructure it
  snapshot,
  loading,
  error,
  adjustedAssetValue,
  simulationResults,
}: Props) {

  // 👇 4. Initialize AI Hook here to share data with Chips and Card
  const { analysis, loading: aiLoading, error: aiError, generateAnalysis } = useAiAdvisor(projectId);
  
  // ----- Data Prep ----------------------------------------
  const surfaceMixData = useMemo(() => {
    if (!snapshot) return [];
    return [
      { name: "Paved", value: snapshot.pavedLengthKm },
      { name: "Gravel", value: snapshot.gravelLengthKm },
    ];
  }, [snapshot]);

  const assetMixData = useMemo(() => {
    if (!snapshot) return [];
    const pavedVal = snapshot.pavedLengthKm * 3_500_000;
    const gravelVal = snapshot.gravelLengthKm * 250_000;
    return [
      { name: "Paved Assets", value: pavedVal, fill: "#6366f1" },
      { name: "Gravel Assets", value: gravelVal, fill: "#f59e0b" },
    ];
  }, [snapshot]);

  // ---------------------------------------------------------

  if (loading) return <div className="p-8 text-center text-slate-500">Loading dashboard...</div>;
  if (error) return <div className="p-8 text-center text-rose-500">Error: {error}</div>;
  if (!snapshot) return <div className="p-8 text-center text-slate-500">No network data found.</div>;

  return (
    <div className="space-y-6">
      
      {/* --- ROW 1: KPI CARDS --- */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-[var(--surface-bg)]">
          <p className="text-[10px] uppercase tracking-wide text-slate-500 flex items-center gap-2">
            <Map className="w-3 h-3" /> Total Length
          </p>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
            {snapshot.totalLengthKm.toLocaleString()} <span className="text-sm font-medium text-slate-500">km</span>
          </div>
          <div className="mt-1 text-xs text-slate-400">Current Network Size</div>
        </div>

        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-[var(--surface-bg)]">
          <p className="text-[10px] uppercase tracking-wide text-slate-500 flex items-center gap-2">
            <Activity className="w-3 h-3" /> Network VCI
          </p>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-baseline gap-2">
            {snapshot.avgVci.toFixed(1)}
            <span className={`text-xs px-1.5 py-0.5 rounded font-bold ${snapshot.avgVci < 50 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                {snapshot.avgVci < 50 ? 'POOR' : 'FAIR'}
            </span>
          </div>
          <div className="mt-1 text-xs text-slate-400">Weighted Average Condition</div>
        </div>

        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-[var(--surface-bg)] col-span-2 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
          <div className="flex justify-between items-start">
             <div>
                <p className="text-[10px] uppercase tracking-wide text-slate-400 flex items-center gap-2">
                    <Coins className="w-3 h-3 text-emerald-400" /> Current Replacement Cost
                </p>
                <div className="mt-2 text-3xl font-bold">{fmtCurrency(snapshot.assetValue)}</div>
                <div className="mt-1 text-xs text-slate-400">Total Estimated Value</div>
             </div>
             {adjustedAssetValue && (
                 <div className="text-right">
                    <p className="text-[10px] text-slate-400">Scenario Adjusted</p>
                    <p className="font-mono text-emerald-400 font-bold">{fmtCurrency(adjustedAssetValue)}</p>
                 </div>
             )}
          </div>
        </div>
      </div>

      {/* --- ROW 2: VISUAL BREAKDOWNS --- */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="p-6 rounded-2xl bg-[var(--surface-bg)] border border-slate-200 dark:border-slate-800">
          <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
             <BarChart3 className="w-4 h-4 text-indigo-500" />
             Network Surface Composition
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={surfaceMixData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={80} paddingAngle={5}>
                  {surfaceMixData.map((_, idx) => <Cell key={`cell-${idx}`} fill={SURFACE_COLOURS[idx]} />)}
                </Pie>
                <Tooltip formatter={(val: number) => `${val.toLocaleString()} km`} />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-[var(--surface-bg)] border border-slate-200 dark:border-slate-800">
          <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-500"/>
            Estimated Value Distribution
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={assetMixData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 12}} />
                <Tooltip formatter={(val: number) => fmtCurrency(val)} cursor={{fill: 'transparent'}} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* --- ROW 3: SIMULATION RESULTS --- */}
      {simulationResults && (
        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-indigo-500" />
                        Strategic Forecast
                    </h2>
                    <p className="text-sm text-slate-500">
                        Projected performance over the next {simulationResults.year_count} years.
                    </p>
                </div>
                {/* 👇 AI INSIGHT CHIP (Condition) */}
                <AiInsightChip 
                    text={analysis?.chart_insights.condition_forecast} 
                    loading={aiLoading} 
                />
            </div>
            
            <SimulationCharts results={simulationResults} />
            
            <div className="flex justify-end mt-2">
                 {/* 👇 AI INSIGHT CHIP (Budget) */}
                 <AiInsightChip 
                    text={analysis?.chart_insights.budget_impact} 
                    loading={aiLoading} 
                />
            </div>
        </div>
      )}

      {/* 👇 5. AI STRATEGY CARD (Moved to Bottom) */}
      <AiStrategyCard 
         analysis={analysis} 
         loading={aiLoading} 
         error={aiError} 
         onGenerate={generateAnalysis} 
      />
    </div>
  );
}