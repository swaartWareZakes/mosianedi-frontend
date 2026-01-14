"use client";

import React from "react";
import { AlertTriangle, Map, TrendingUp, Coins, Activity } from "lucide-react";
// 👇 Import the NEW type
import type { NetworkProfile } from "../../projects/[projectId]/config/hooks/useNetworkSnapshot";

type Props = {
  snapshot: NetworkProfile | null;
  loading: boolean;
  error: string | null;
};

function fmtCurrency(val: number) {
  if (val >= 1_000_000_000) return `R ${(val / 1_000_000_000).toFixed(1)} bn`;
  if (val >= 1_000_000) return `R ${(val / 1_000_000).toFixed(1)} m`;
  return `R ${val.toLocaleString()}`;
}

export function NetworkSnapshotSummary({ snapshot, loading, error }: Props) {
  if (loading) {
    return (
      <div className="p-6 text-center text-sm text-slate-500 bg-[var(--surface-bg)] rounded-xl border border-slate-200 dark:border-slate-800">
        Loading network profile...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-rose-50 dark:bg-rose-900/20 text-rose-600 rounded-xl border border-rose-200 dark:border-rose-800 flex items-center gap-2 text-sm">
        <AlertTriangle className="h-4 w-4" />
        {error}
      </div>
    );
  }

  if (!snapshot) {
    return (
      <div className="p-6 text-center text-sm text-slate-500 bg-[var(--surface-bg)] rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
        No network data found. Please configure the project inputs first.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      
      {/* 1. Total Network Length */}
      <div className="p-5 bg-[var(--surface-bg)] rounded-xl border border-slate-200/60 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2 text-slate-500 mb-2">
          <Map className="w-4 h-4" />
          <span className="text-xs font-semibold uppercase tracking-wider">Total Network</span>
        </div>
        <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          {snapshot.totalLengthKm.toLocaleString()} <span className="text-sm font-medium text-slate-500">km</span>
        </div>
        <div className="text-xs text-slate-400 mt-1">
           {snapshot.pavedLengthKm.toLocaleString()} km Paved • {snapshot.gravelLengthKm.toLocaleString()} km Gravel
        </div>
      </div>

      {/* 2. Asset Value */}
      <div className="p-5 bg-[var(--surface-bg)] rounded-xl border border-slate-200/60 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2 text-slate-500 mb-2">
          <Coins className="w-4 h-4 text-emerald-500" />
          <span className="text-xs font-semibold uppercase tracking-wider">Asset Value</span>
        </div>
        <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          {fmtCurrency(snapshot.assetValue)}
        </div>
         <div className="text-xs text-slate-400 mt-1">
           Current Replacement Cost (CRC)
        </div>
      </div>

      {/* 3. Avg Condition (VCI) */}
      <div className="p-5 bg-[var(--surface-bg)] rounded-xl border border-slate-200/60 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2 text-slate-500 mb-2">
          <Activity className="w-4 h-4 text-indigo-500" />
          <span className="text-xs font-semibold uppercase tracking-wider">Avg Condition</span>
        </div>
        <div className="flex items-baseline gap-2">
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {snapshot.avgVci.toFixed(1)}
            </div>
            <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${snapshot.avgVci < 50 ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'}`}>
                {snapshot.avgVci < 50 ? 'POOR' : 'FAIR/GOOD'}
            </span>
        </div>
         <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
             <div className={`h-full ${snapshot.avgVci < 50 ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(snapshot.avgVci, 100)}%`}} />
         </div>
      </div>

       {/* 4. Traffic / Utilization */}
       <div className="p-5 bg-[var(--surface-bg)] rounded-xl border border-slate-200/60 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2 text-slate-500 mb-2">
          <TrendingUp className="w-4 h-4 text-amber-500" />
          <span className="text-xs font-semibold uppercase tracking-wider">Traffic Load</span>
        </div>
        <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          {(snapshot.totalVehicleKm / 1_000_000).toFixed(1)} <span className="text-sm font-medium text-slate-500">m</span>
        </div>
         <div className="text-xs text-slate-400 mt-1">
           Annual Vehicle Km
        </div>
      </div>

    </div>
  );
}