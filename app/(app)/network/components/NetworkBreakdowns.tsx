"use client";

import React from "react";
import { Layers, Coins } from "lucide-react";
// 👇 Import the NEW type we defined in the hook
import type { NetworkProfile } from "../../projects/[projectId]/config/hooks/useNetworkSnapshot";

type Props = {
  snapshot: NetworkProfile | null;
};

// Helper to format large currency numbers
function fmtMoney(val: number) {
  if (val >= 1_000_000_000) return `R ${(val / 1_000_000_000).toFixed(1)} bn`;
  if (val >= 1_000_000) return `R ${(val / 1_000_000).toFixed(1)} m`;
  return `R ${val.toLocaleString()}`;
}

export function NetworkBreakdowns({ snapshot }: Props) {
  if (!snapshot) return null;

  const totalKm = snapshot.totalLengthKm || 1; // Avoid divide by zero
  
  // 1. Calculate Length Percentages
  const pavedPct = (snapshot.pavedLengthKm / totalKm) * 100;
  const gravelPct = (snapshot.gravelLengthKm / totalKm) * 100;

  // 2. Estimate Value Split (Replicating Backend Logic for Visualization)
  // Rates: Paved ~R3.5m/km, Gravel ~R0.25m/km
  const estimatedPavedVal = snapshot.pavedLengthKm * 3_500_000;
  const estimatedGravelVal = snapshot.gravelLengthKm * 250_000;
  const totalEstVal = estimatedPavedVal + estimatedGravelVal || 1;

  const pavedValPct = (estimatedPavedVal / totalEstVal) * 100;
  const gravelValPct = (estimatedGravelVal / totalEstVal) * 100;

  return (
    <div className="space-y-6">
      
      {/* CARD 1: Surface Composition (Physical Length) */}
      <div className="p-6 bg-[var(--surface-bg)] rounded-2xl shadow-lg border border-slate-200/10 dark:border-slate-800/10 space-y-4">
        <h2 className="text-sm font-semibold flex items-center gap-2 text-slate-700 dark:text-slate-200">
          <Layers className="h-4 w-4 text-indigo-500" />
          Network Composition
        </h2>
        
        {/* Visual Bar */}
        <div className="h-2 w-full flex rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800">
          <div className="h-full bg-indigo-500" style={{ width: `${pavedPct}%` }} />
          <div className="h-full bg-amber-500" style={{ width: `${gravelPct}%` }} />
        </div>

        <div className="space-y-3 pt-2">
          {/* Paved Row */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                <span className="text-slate-500 dark:text-slate-400 font-medium">Paved</span>
              </div>
              <span className="font-mono text-slate-700 dark:text-slate-200">
                {snapshot.pavedLengthKm.toLocaleString()} km
              </span>
            </div>
            <div className="text-[10px] text-slate-400 pl-4">
              {pavedPct.toFixed(1)}% of network length
            </div>
          </div>

          {/* Gravel Row */}
          <div>
             <div className="flex justify-between items-center text-xs mb-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="text-slate-500 dark:text-slate-400 font-medium">Gravel</span>
              </div>
              <span className="font-mono text-slate-700 dark:text-slate-200">
                {snapshot.gravelLengthKm.toLocaleString()} km
              </span>
            </div>
            <div className="text-[10px] text-slate-400 pl-4">
              {gravelPct.toFixed(1)}% of network length
            </div>
          </div>
        </div>
      </div>

      {/* CARD 2: Asset Value Distribution (Financial Weight) */}
      <div className="p-6 bg-[var(--surface-bg)] rounded-2xl shadow-lg border border-slate-200/10 dark:border-slate-800/10 space-y-4">
        <h2 className="text-sm font-semibold flex items-center gap-2 text-slate-700 dark:text-slate-200">
          <Coins className="h-4 w-4 text-emerald-500" />
          Asset Value Distribution
        </h2>
        
        {/* Visual Bar */}
        <div className="h-2 w-full flex rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800">
          <div className="h-full bg-emerald-500" style={{ width: `${pavedValPct}%` }} />
          <div className="h-full bg-amber-500/50" style={{ width: `${gravelValPct}%` }} />
        </div>

        <div className="space-y-3 pt-2">
           {/* Paved Value Row */}
           <div>
            <div className="flex justify-between items-center text-xs mb-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-slate-500 dark:text-slate-400 font-medium">Paved Assets</span>
              </div>
              <span className="font-mono text-slate-700 dark:text-slate-200 font-semibold">
                {fmtMoney(estimatedPavedVal)}
              </span>
            </div>
            <div className="text-[10px] text-slate-400 pl-4">
               Holds {pavedValPct.toFixed(0)}% of total value
            </div>
          </div>

          {/* Gravel Value Row */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500/50" />
                <span className="text-slate-500 dark:text-slate-400 font-medium">Gravel Assets</span>
              </div>
              <span className="font-mono text-slate-700 dark:text-slate-200 font-semibold">
                {fmtMoney(estimatedGravelVal)}
              </span>
            </div>
            <div className="text-[10px] text-slate-400 pl-4">
               Holds {gravelValPct.toFixed(0)}% of total value
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}