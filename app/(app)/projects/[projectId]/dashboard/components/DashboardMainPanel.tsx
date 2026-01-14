"use client";

import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import { TrendingUp, Activity, Coins, Map, BarChart3 } from "lucide-react";

// 👇 1. Import the CORRECT type from the correct path
import type { NetworkProfile } from "../../config/hooks/useNetworkSnapshot";
import type { SimulationOutput } from "../../config/types";
import { SimulationCharts } from "./SimulationCharts";

type Props = {
  // 👇 2. Update prop type to NetworkProfile
  snapshot: NetworkProfile | null;
  loading: boolean;
  error: string | null;
  adjustedAssetValue: number | null; 
  simulationResults: SimulationOutput | null;
};

const SURFACE_COLOURS = ["#6366f1", "#f59e0b"]; // Indigo (Paved), Amber (Gravel)

function fmtCurrency(val: number) {
  if (val >= 1_000_000_000) return `R ${(val / 1_000_000_000).toFixed(1)} bn`;
  if (val >= 1_000_000) return `R ${(val / 1_000_000).toFixed(1)} m`;
  return `R ${val.toLocaleString()}`;
}

export function DashboardMainPanel({
  snapshot,
  loading,
  error,
  adjustedAssetValue,
  simulationResults,
}: Props) {
  
  // ----- 1. Prepare Data for Charts ----------------------------------------
  
  // Surface Mix (Pie Chart)
  const surfaceMixData = useMemo(() => {
    if (!snapshot) return [];
    return [
      { name: "Paved", value: snapshot.pavedLengthKm },
      { name: "Gravel", value: snapshot.gravelLengthKm },
    ];
  }, [snapshot]);

  // Estimate Asset Split (Simple estimation for visualization)
  const assetMixData = useMemo(() => {
    if (!snapshot) return [];
    // R3.5m/km Paved, R0.25m/km Gravel (Engineering Estimates for viz)
    const pavedVal = snapshot.pavedLengthKm * 3_500_000;
    const gravelVal = snapshot.gravelLengthKm * 250_000;
    return [
      { name: "Paved Assets", value: pavedVal, fill: "#6366f1" },
      { name: "Gravel Assets", value: gravelVal, fill: "#f59e0b" },
    ];
  }, [snapshot]);

  // --------------------------------------------------------------------------

  if (loading) {
    return (
        <div className="p-8 text-center text-sm text-slate-500 bg-[var(--surface-bg)] rounded-xl border border-slate-200 dark:border-slate-800">
            Loading dashboard analytics...
        </div>
    );
  }

  if (error) {
    return (
        <div className="p-8 text-center text-sm text-rose-500 bg-rose-50 dark:bg-rose-900/10 rounded-xl border border-rose-200 dark:border-rose-800">
            Error loading dashboard: {error}
        </div>
    );
  }

  if (!snapshot) {
    return (
        <div className="p-8 text-center text-sm text-slate-500 bg-[var(--surface-bg)] rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
            No network data found. Please go to Configuration to set up your proposal.
        </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* --- ROW 1: KPI CARDS --- */}
      <div className="grid gap-4 md:grid-cols-4">
        
        {/* Total Length */}
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-[var(--surface-bg)]">
          <p className="text-[10px] uppercase tracking-wide text-slate-500 flex items-center gap-2">
            <Map className="w-3 h-3" /> Total Length
          </p>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
            {snapshot.totalLengthKm.toLocaleString()} <span className="text-sm font-medium text-slate-500">km</span>
          </div>
          <div className="mt-1 text-xs text-slate-400">
            Current Network Size
          </div>
        </div>

        {/* Avg Condition */}
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
          <div className="mt-1 text-xs text-slate-400">
            Weighted Average Condition
          </div>
        </div>

        {/* Asset Value */}
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-[var(--surface-bg)] col-span-2 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
          <div className="flex justify-between items-start">
             <div>
                <p className="text-[10px] uppercase tracking-wide text-slate-400 flex items-center gap-2">
                    <Coins className="w-3 h-3 text-emerald-400" /> Current Replacement Cost
                </p>
                <div className="mt-2 text-3xl font-bold">
                    {fmtCurrency(snapshot.assetValue)}
                </div>
                <div className="mt-1 text-xs text-slate-400">
                    Total Estimated Value
                </div>
             </div>
             {adjustedAssetValue && (
                 <div className="text-right">
                    <p className="text-[10px] text-slate-400">Scenario Adjusted</p>
                    <p className="font-mono text-emerald-400 font-bold">
                        {fmtCurrency(adjustedAssetValue)}
                    </p>
                 </div>
             )}
          </div>
        </div>
      </div>

      {/* --- ROW 2: VISUAL BREAKDOWNS --- */}
      <div className="grid gap-4 lg:grid-cols-2">
        
        {/* CHART 1: Surface Mix */}
        <div className="p-6 rounded-2xl bg-[var(--surface-bg)] border border-slate-200 dark:border-slate-800">
          <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
             <BarChart3 className="w-4 h-4 text-indigo-500" />
             Network Surface Composition
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={surfaceMixData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                >
                  {surfaceMixData.map((_, idx) => (
                    <Cell key={`cell-${idx}`} fill={SURFACE_COLOURS[idx]} />
                  ))}
                </Pie>
                <Tooltip 
                    formatter={(val: number) => `${val.toLocaleString()} km`}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 2: Asset Value Split */}
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
                <Tooltip 
                    formatter={(val: number) => fmtCurrency(val)}
                    cursor={{fill: 'transparent'}}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* --- ROW 3: SIMULATION RESULTS --- */}
      {simulationResults && (
        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
            <div className="mb-6">
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-indigo-500" />
                    Strategic Forecast
                </h2>
                <p className="text-sm text-slate-500">
                    Projected performance over the next {simulationResults.year_count} years.
                </p>
            </div>
            <SimulationCharts results={simulationResults} />
        </div>
      )}
    </div>
  );
}