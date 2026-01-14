"use client";

import React, { useState } from "react";
import { Play, Loader2, TrendingUp, ArrowRight, CheckCircle2, Calendar, Layers } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSimulationRun } from "../hooks/useSimulationRun";
import { useProjectMeta } from "../hooks/useProjectMeta";

function fmtCurrency(val: number) {
  if (val >= 1_000_000_000) return `R ${(val / 1_000_000_000).toFixed(1)} bn`;
  if (val >= 1_000_000) return `R ${(val / 1_000_000).toFixed(1)} m`;
  return `R ${val.toLocaleString()}`;
}

export function RunSimulationCard({ projectId }: { projectId: string }) {
  const router = useRouter();
  const { runSimulation, isRunning, result, error } = useSimulationRun(projectId);
  const { data: meta } = useProjectMeta(projectId);

  // Pre-Flight Controls State
  const [startYear, setStartYear] = useState<number | null>(null);
  const [includePaved, setIncludePaved] = useState(true);
  const [includeGravel, setIncludeGravel] = useState(true);

  // Default start year to project year if not manually set
  const baseYear = meta?.start_year || new Date().getFullYear() + 1;
  const activeStartYear = startYear || baseYear;

  // FIX: handleRun accesses state directly, doesn't need args
  const handleRun = async () => {
    await runSimulation({
        startYearOverride: activeStartYear,
        includePaved,
        includeGravel
    });
  };

  const handleGoToDashboard = () => {
    router.push(`/projects/${projectId}/dashboard`);
  };

  return (
    <div className="bg-[var(--surface-bg)] rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-800/50 overflow-hidden relative">
      
      {/* Decorative gradient top */}
      <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

      <div className="p-6">
        
        {/* Header */}
        <div className="mb-6">
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Play className="w-4 h-4 text-indigo-500 fill-indigo-500" />
              Simulation Control
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Configure parameters before generating the proposal.
            </p>
        </div>

        {!result ? (
          /* --- PRE-FLIGHT CONTROLS --- */
          <div className="space-y-5">
             
             {/* 1. Year Selection */}
             <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
                    <Calendar className="w-3 h-3" />
                    Start Financial Year
                </label>
                <select 
                    value={activeStartYear}
                    onChange={(e) => setStartYear(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm px-3 py-2 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500"
                >
                    <option value={baseYear}>{baseYear} (Default)</option>
                    <option value={baseYear + 1}>{baseYear + 1}</option>
                    <option value={baseYear + 2}>{baseYear + 2}</option>
                </select>
             </div>

             {/* 2. Scope Toggles */}
             <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
                    <Layers className="w-3 h-3" />
                    Proposal Scope
                </label>
                <div className="flex gap-3">
                    <label className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium cursor-pointer transition-all ${includePaved ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300' : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500'}`}>
                        <input 
                            type="checkbox" 
                            checked={includePaved} 
                            onChange={(e) => setIncludePaved(e.target.checked)}
                            className="hidden"
                        />
                        <span>Paved Network</span>
                    </label>
                    <label className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium cursor-pointer transition-all ${includeGravel ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300' : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500'}`}>
                        <input 
                            type="checkbox" 
                            checked={includeGravel} 
                            onChange={(e) => setIncludeGravel(e.target.checked)}
                            className="hidden"
                        />
                        <span>Gravel Network</span>
                    </label>
                </div>
             </div>

             {error && (
                <div className="p-3 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-200 text-xs rounded-lg border border-rose-100 dark:border-rose-800">
                    {error}
                </div>
             )}

             <button
                onClick={handleRun}
                disabled={isRunning || (!includePaved && !includeGravel)}
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-xl font-semibold text-sm shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
             >
                {isRunning ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Crunching numbers...
                  </>
                ) : (
                  <>
                    Run for {activeStartYear}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
             </button>
          </div>
        ) : (
          /* --- EXECUTIVE SUMMARY --- */
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
            
            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 mb-4 text-emerald-600 dark:text-emerald-400 font-medium text-xs">
                <CheckCircle2 className="w-4 h-4" />
                <span>Proposal Generated ({activeStartYear})</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Total Ask</div>
                  <div className="text-xl font-black text-slate-900 dark:text-slate-100">
                    {fmtCurrency(result.total_cost_npv)}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Final VCI</div>
                  <div className="text-xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-1">
                    {result.final_network_condition.toFixed(1)}
                    <TrendingUp className={`w-4 h-4 ${result.final_network_condition < 50 ? 'text-rose-500' : 'text-emerald-500'}`} />
                  </div>
                </div>
              </div>

               <div className="text-xs text-slate-500 bg-white dark:bg-slate-800 p-2 rounded border border-slate-100 dark:border-slate-700">
                  <span className="font-semibold">Strategy:</span> Based on your inputs, this budget is required to maintain the current VCI profile over the {result.year_count}-year horizon.
               </div>
            </div>

            <div className="flex gap-2">
                <button
                    onClick={handleRun}
                    disabled={isRunning}
                    className="flex-1 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                    Re-Calculate
                </button>
                <button
                    onClick={handleGoToDashboard}
                    className="flex-[2] py-2 text-xs font-bold text-white bg-slate-900 dark:bg-slate-100 dark:text-slate-900 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                >
                    Open Dashboard
                    <ArrowRight className="w-3 h-3" />
                </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}