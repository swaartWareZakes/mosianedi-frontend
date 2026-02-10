"use client";

import React from "react";
import { AlertTriangle, Map, TrendingUp, Coins, Activity } from "lucide-react";
import type { NetworkProfile } from "../../projects/[projectId]/config/hooks/useNetworkSnapshot";

type SummaryProps = {
  snapshot: NetworkProfile | null;
  loading: boolean;
  error: string | null;
};

function fmtCurrency(val: number) {
  if (val >= 1_000_000_000) return `R ${(val / 1_000_000_000).toFixed(1)} bn`;
  if (val >= 1_000_000) return `R ${(val / 1_000_000).toFixed(1)} m`;
  return `R ${val.toLocaleString()}`;
}

export function NetworkSnapshotSummary({ snapshot, loading, error }: SummaryProps) {
  if (loading) {
    return (
      <div className="h-28 flex items-center justify-center text-sm text-slate-400 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-200">
        Loading network profile...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-rose-50 text-rose-600 rounded-xl border border-rose-200 flex items-center gap-2 text-sm">
        <AlertTriangle className="h-4 w-4" />
        {error}
      </div>
    );
  }

  if (!snapshot) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      
      {/* Total Network */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-hover hover:shadow-md">
        <div className="flex items-center gap-2 text-slate-500 mb-2">
          <Map className="w-4 h-4" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Total Network</span>
        </div>
        <div className="text-xl font-bold">
          {snapshot.totalLengthKm.toLocaleString()} <span className="text-xs font-normal text-slate-500">km</span>
        </div>
        <div className="text-[10px] text-slate-400 mt-1 truncate">
           {snapshot.pavedLengthKm.toLocaleString()} Paved • {snapshot.gravelLengthKm.toLocaleString()} Gravel
        </div>
      </div>

      {/* Asset Value */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-hover hover:shadow-md">
        <div className="flex items-center gap-2 text-slate-500 mb-2">
          <Coins className="w-4 h-4 text-emerald-500" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Asset Value</span>
        </div>
        <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
          {fmtCurrency(snapshot.assetValue)}
        </div>
         <div className="text-[10px] text-slate-400 mt-1">Current Replacement Cost</div>
      </div>

      {/* Condition */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-hover hover:shadow-md">
        <div className="flex items-center gap-2 text-slate-500 mb-2">
          <Activity className="w-4 h-4 text-indigo-500" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Condition (VCI)</span>
        </div>
        <div className="flex items-baseline gap-2">
            <div className="text-xl font-bold">{snapshot.avgVci.toFixed(1)}</div>
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${snapshot.avgVci < 50 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                {snapshot.avgVci < 50 ? 'POOR' : 'FAIR/GOOD'}
            </span>
        </div>
         <div className="w-full bg-slate-100 dark:bg-slate-800 h-1 rounded-full mt-2 overflow-hidden">
             <div className={`h-full ${snapshot.avgVci < 50 ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(snapshot.avgVci, 100)}%`}} />
         </div>
      </div>

       {/* Traffic */}
       <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-hover hover:shadow-md">
        <div className="flex items-center gap-2 text-slate-500 mb-2">
          <TrendingUp className="w-4 h-4 text-amber-500" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Traffic Load</span>
        </div>
        <div className="text-xl font-bold">
          {(snapshot.totalVehicleKm / 1_000_000).toFixed(1)} <span className="text-xs font-normal text-slate-500">m</span>
        </div>
         <div className="text-[10px] text-slate-400 mt-1">Annual Vehicle Km</div>
      </div>

    </div>
  );
}