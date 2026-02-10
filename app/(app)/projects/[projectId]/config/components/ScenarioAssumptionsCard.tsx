"use client";

import React from "react";
import { useForecast } from "../hooks/useForecast";
import { TrendingUp, Clock, AlertTriangle, Droplets } from "lucide-react";

export function ScenarioAssumptionsCard({ projectId }: { projectId: string }) {
  const { data, loading, saving, updateField } = useForecast(projectId);

  if (loading) {
    return <div className="h-48 bg-slate-100 dark:bg-slate-900 animate-pulse rounded-xl" />;
  }

  if (!data) return null;

  const currentYear = new Date().getFullYear();
  const projectionEnd = currentYear + 1 + data.analysis_duration;

  return (
    <div className="bg-[var(--surface-bg)] border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
        <div>
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-500" />
            Forecast Strategy
          </h3>
          <p className="text-xs text-slate-500">Define the variables for the 2027/28 projection.</p>
        </div>
        {saving && <span className="text-[10px] text-indigo-500 animate-pulse font-medium">Saving...</span>}
      </div>

      <div className="p-6 grid gap-8 md:grid-cols-3">
        
        {/* COL 1: ECONOMICS */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Economic Reality</h4>
          
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-600 dark:text-slate-300">CPI Inflation</label>
            <div className="flex items-center gap-2">
              <input 
                type="number" 
                value={data.cpi_percentage}
                onChange={(e) => updateField("cpi_percentage", Number(e.target.value))}
                className="w-20 p-1.5 text-sm border rounded bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-700"
              />
              <span className="text-sm text-slate-500">%</span>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Prev. Allocation</label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">R</span>
              <input 
                type="number"
                value={data.previous_allocation}
                onChange={(e) => updateField("previous_allocation", Number(e.target.value))} 
                className="w-full p-1.5 text-sm border rounded bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-700"
              />
            </div>
            <p className="text-[10px] text-slate-400">Used to calculate real budget growth/decline.</p>
          </div>
        </div>

        {/* COL 2: ENGINEERING */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Engineering & Decay</h4>
          
          <div className="space-y-1">
             <label className="text-xs font-medium text-slate-600 dark:text-slate-300 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-amber-500"/> Paved Deterioration
             </label>
             <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                {(["Slow", "Medium", "Fast"] as const).map((opt) => (
                    <button
                        key={opt}
                        onClick={() => updateField("paved_deterioration_rate", opt)}
                        className={`flex-1 text-xs py-1 rounded-md transition-all ${data.paved_deterioration_rate === opt ? 'bg-white dark:bg-slate-700 shadow text-indigo-600 dark:text-indigo-400 font-medium' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        {opt}
                    </button>
                ))}
             </div>
          </div>

           <div className="space-y-1">
            <label className="text-xs font-medium text-slate-600 dark:text-slate-300 flex items-center gap-1">
                <Droplets className="w-3 h-3 text-blue-500"/> Gravel Loss Rate
            </label>
            <div className="flex items-center gap-2">
              <input 
                type="number"
                value={data.gravel_loss_rate}
                onChange={(e) => updateField("gravel_loss_rate", Number(e.target.value))}
                className="w-20 p-1.5 text-sm border rounded bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-700"
              />
              <span className="text-xs text-slate-500">mm / year</span>
            </div>
          </div>
        </div>

        {/* COL 3: TIME - UPDATED LIMITS */}
        <div className="space-y-4">
           <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Time Horizon</h4>
           
           <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4 text-center border border-indigo-100 dark:border-indigo-800/30">
              <Clock className="w-6 h-6 text-indigo-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {data.analysis_duration} <span className="text-sm font-medium text-slate-500">Years</span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="50"  // <--- UPDATED TO 50
                value={data.analysis_duration}
                onChange={(e) => updateField("analysis_duration", Number(e.target.value))}
                className="w-full mt-3 accent-indigo-600 cursor-pointer"
              />
              <p className="text-[10px] text-indigo-600/70 dark:text-indigo-400/70 mt-1 font-mono">
                 Projection until {projectionEnd}
              </p>
           </div>
        </div>

      </div>
    </div>
  );
}