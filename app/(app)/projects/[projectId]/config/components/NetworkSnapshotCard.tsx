"use client";

import React from "react";
import { Activity, Coins, Layers, BarChart3, RefreshCw } from "lucide-react";
import { useNetworkSnapshot } from "../hooks/useNetworkSnapshot";

// --- FIX: Safe formatting functions ---
function fmtCurrency(val: any) {
  const v = Number(val); // Convert to number
  if (!Number.isFinite(v)) return "R 0"; // Safety check

  if (v >= 1_000_000_000) return `R ${(v / 1_000_000_000).toFixed(1)} Billion`;
  if (v >= 1_000_000) return `R ${(v / 1_000_000).toFixed(1)} Million`;
  return `R ${v.toLocaleString()}`;
}

function fmtNum(val: any) {
  const v = Number(val);
  if (!Number.isFinite(v)) return "0";
  return v.toLocaleString("en-ZA", { maximumFractionDigits: 0 });
}

export function NetworkSnapshotCard({ projectId }: { projectId: string }) {
  const { data, loading, error, refetch } = useNetworkSnapshot(projectId);

  // Determine health color based on VCI (Default to 0 if data missing)
  const vci = data?.avgVci || 0;
  let healthColor = "bg-rose-500"; 
  let healthText = "Critical";
  
  if (vci > 85) { healthColor = "bg-emerald-500"; healthText = "Excellent"; }
  else if (vci > 70) { healthColor = "bg-green-500"; healthText = "Good"; }
  else if (vci > 50) { healthColor = "bg-amber-500"; healthText = "Fair"; }
  else if (vci > 30) { healthColor = "bg-orange-500"; healthText = "Poor"; }

  // Safe variables for rendering
  const totalLength = data?.totalLengthKm || 0;
  const pavedLength = data?.pavedLengthKm || 0;
  const gravelLength = data?.gravelLengthKm || 0;
  const assetValue = data?.assetValue || 0;

  return (
    <div className="bg-[var(--surface-bg)] rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-800/50 overflow-hidden">
      
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
        <div>
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-500" />
            Asset Health Profile
          </h2>
          <p className="text-xs text-slate-500">Current Replacement Cost & Condition</p>
        </div>
        <button 
          onClick={refetch} 
          disabled={loading}
          className="text-slate-400 hover:text-indigo-500 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {loading ? (
        <div className="p-8 flex justify-center">
            <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin" />
        </div>
      ) : !data || totalLength === 0 ? (
        <div className="p-8 text-center text-sm text-slate-400">
           No network data defined. 
           <br/>Start by entering inputs on the left.
        </div>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
            
            {/* 1. HERO: ASSET VALUE (CRC) */}
            <div className="p-6">
                <div className="flex items-center gap-2 mb-1">
                    <Coins className="w-4 h-4 text-slate-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Net Asset Value (CRC)</span>
                </div>
                <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                    {fmtCurrency(assetValue)}
                </div>
                <p className="text-xs text-slate-400 mt-1">
                    Estimated replacement cost based on {fmtNum(totalLength)} km network.
                </p>
            </div>

            {/* 2. VCI GAUGE */}
            <div className="p-6">
                <div className="flex justify-between items-end mb-2">
                    <div className="flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-slate-400" />
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Network Condition (VCI)</span>
                    </div>
                    <div className="text-right">
                        <span className="text-2xl font-bold text-slate-900 dark:text-white">{vci.toFixed(1)}</span>
                        <span className="text-xs text-slate-400 ml-1">/ 100</span>
                    </div>
                </div>
                
                {/* Progress Bar */}
                <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden relative">
                    <div 
                        className={`h-full ${healthColor} transition-all duration-1000 ease-out`} 
                        style={{ width: `${Math.min(vci, 100)}%` }} 
                    />
                </div>
                <div className="flex justify-between mt-2 text-xs font-medium">
                    <span className="text-slate-400">Critical</span>
                    <span className={healthColor.replace('bg-', 'text-')}>{healthText} Condition</span>
                    <span className="text-slate-400">Perfect</span>
                </div>
            </div>

            {/* 3. ASSET MIX */}
            <div className="p-6 bg-slate-50/30 dark:bg-slate-900/30">
                <div className="flex items-center gap-2 mb-4">
                    <Layers className="w-4 h-4 text-slate-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Asset Composition</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
                        <div className="text-xs text-slate-400 mb-1">Paved Network</div>
                        <div className="text-lg font-bold text-slate-900 dark:text-slate-100">
                            {fmtNum(pavedLength)} <span className="text-xs font-normal text-slate-400">km</span>
                        </div>
                        <div className="h-1 w-full bg-slate-100 dark:bg-slate-700 mt-2 rounded-full overflow-hidden">
                             <div className="h-full bg-indigo-500" style={{ width: `${totalLength > 0 ? (pavedLength / totalLength) * 100 : 0}%` }} />
                        </div>
                    </div>

                    <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
                        <div className="text-xs text-slate-400 mb-1">Gravel Network</div>
                        <div className="text-lg font-bold text-slate-900 dark:text-slate-100">
                            {fmtNum(gravelLength)} <span className="text-xs font-normal text-slate-400">km</span>
                        </div>
                        <div className="h-1 w-full bg-slate-100 dark:bg-slate-700 mt-2 rounded-full overflow-hidden">
                             <div className="h-full bg-amber-500" style={{ width: `${totalLength > 0 ? (gravelLength / totalLength) * 100 : 0}%` }} />
                        </div>
                    </div>
                </div>
            </div>

        </div>
      )}
    </div>
  );
}