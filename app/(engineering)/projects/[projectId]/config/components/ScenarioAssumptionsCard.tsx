"use client";

import React from "react";
import { useForecast } from "../hooks/useForecast";
import { TrendingUp, Clock, AlertTriangle, Droplets, Lock } from "lucide-react";

// Add safe CN import just in case
function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}

const BORDER = "border-[color:color-mix(in_oklab,var(--foreground)_14%,transparent)]";
const BORDER_SOFT = "border-[color:color-mix(in_oklab,var(--foreground)_10%,transparent)]";
const TEXT = "text-[var(--foreground)]";
const TEXT_MUTED = "text-[color:color-mix(in_oklab,var(--foreground)_60%,transparent)]";
const TEXT_SOFT = "text-[color:color-mix(in_oklab,var(--foreground)_45%,transparent)]";
const BG_WASH = "bg-[color:color-mix(in_oklab,var(--foreground)_5%,transparent)]";
const BG_WASH_2 = "bg-[color:color-mix(in_oklab,var(--foreground)_7%,transparent)]";

const INPUT =
  "p-1.5 text-sm border rounded outline-none transition " +
  "bg-[var(--surface-bg)] " +
  "border-[color:color-mix(in_oklab,var(--foreground)_14%,transparent)] " +
  "text-[var(--foreground)] " +
  "focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed";

export function ScenarioAssumptionsCard({ projectId, readOnly = false }: { projectId: string; readOnly?: boolean }) {
  const { data, loading, saving, updateField } = useForecast(projectId);

  if (loading) {
    return <div className={cn("h-48 animate-pulse rounded-xl", BG_WASH)} />;
  }

  if (!data) return null;

  const currentYear = new Date().getFullYear();
  const projectionEnd = currentYear + 1 + data.analysis_duration;

  return (
    <div className={cn("bg-[var(--surface-bg)] border rounded-xl shadow-sm overflow-hidden", BORDER, readOnly && "opacity-90")}>
      <div className={cn("p-4 border-b flex justify-between items-center bg-[color:color-mix(in_oklab,var(--foreground)_4%,transparent)]", BORDER)}>
        <div>
          <h3 className={cn("font-semibold flex items-center gap-2", TEXT)}>
            <TrendingUp className="w-4 h-4 text-indigo-500" />
            Forecast Strategy
          </h3>
          <p className={cn("text-xs", TEXT_MUTED)}>Define the variables for the projection.</p>
        </div>

        {readOnly ? (
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 bg-amber-500/10 px-2 py-1 rounded">
               <Lock className="w-3.5 h-3.5" /> Locked
            </div>
        ) : saving ? (
          <span className="text-[10px] text-indigo-500 animate-pulse font-medium">Saving...</span>
        ) : null}
      </div>

      <div className={cn("p-6 grid gap-8 md:grid-cols-3", readOnly && "pointer-events-none")}>
        {/* COL 1: ECONOMICS */}
        <div className="space-y-4">
          <h4 className={cn("text-xs font-bold uppercase tracking-wider mb-2", TEXT_SOFT)}>Economic Reality</h4>
          <div className="space-y-1">
            <label className={cn("text-xs font-medium", TEXT_MUTED)}>CPI Inflation</label>
            <div className="flex items-center gap-2">
              <input type="number" disabled={readOnly} value={data.cpi_percentage} onChange={(e) => updateField("cpi_percentage", Number(e.target.value))} className={cn("w-20", INPUT)} />
              <span className={cn("text-sm", TEXT_MUTED)}>%</span>
            </div>
          </div>
          <div className="space-y-1">
            <label className={cn("text-xs font-medium", TEXT_MUTED)}>Prev. Allocation</label>
            <div className="flex items-center gap-2">
              <span className={cn("text-sm", TEXT_MUTED)}>R</span>
              <input type="number" disabled={readOnly} value={data.previous_allocation} onChange={(e) => updateField("previous_allocation", Number(e.target.value))} className={cn("w-full", INPUT)} />
            </div>
          </div>
        </div>

        {/* COL 2: ENGINEERING */}
        <div className="space-y-4">
          <h4 className={cn("text-xs font-bold uppercase tracking-wider mb-2", TEXT_SOFT)}>Engineering & Decay</h4>
          <div className="space-y-1">
            <label className={cn("text-xs font-medium flex items-center gap-1", TEXT_MUTED)}><AlertTriangle className="w-3 h-3 text-amber-500" /> Paved Deterioration</label>
            <div className={cn("flex rounded-lg p-1 border", BG_WASH_2, BORDER_SOFT)}>
              {(["Slow", "Medium", "Fast"] as const).map((opt) => {
                const active = data.paved_deterioration_rate === opt;
                return (
                  <button key={opt} disabled={readOnly} onClick={() => updateField("paved_deterioration_rate", opt)} className={cn("flex-1 text-xs py-1 rounded-md transition-all", active ? "bg-[var(--surface-bg)] shadow text-indigo-600 font-medium border" : `${TEXT_MUTED} hover:${TEXT}`, active ? BORDER_SOFT : "border-transparent")}>{opt}</button>
                );
              })}
            </div>
          </div>
          <div className="space-y-1">
            <label className={cn("text-xs font-medium flex items-center gap-1", TEXT_MUTED)}><Droplets className="w-3 h-3 text-blue-500" /> Gravel Loss Rate</label>
            <div className="flex items-center gap-2">
              <input type="number" disabled={readOnly} value={data.gravel_loss_rate} onChange={(e) => updateField("gravel_loss_rate", Number(e.target.value))} className={cn("w-20", INPUT)} />
              <span className={cn("text-xs", TEXT_MUTED)}>mm / year</span>
            </div>
          </div>
        </div>

        {/* COL 3: TIME */}
        <div className="space-y-4">
          <h4 className={cn("text-xs font-bold uppercase tracking-wider mb-2", TEXT_SOFT)}>Time Horizon</h4>
          <div className="rounded-lg p-4 text-center border bg-[color:color-mix(in_oklab,indigo_12%,transparent)] border-[color:color-mix(in_oklab,indigo_22%,transparent)]">
            <Clock className="w-6 h-6 text-indigo-500 mx-auto mb-2" />
            <div className={cn("text-2xl font-bold", TEXT)}>
              {data.analysis_duration} <span className={cn("text-sm font-medium", TEXT_MUTED)}>Years</span>
            </div>
            <input type="range" disabled={readOnly} min="1" max="50" value={data.analysis_duration} onChange={(e) => updateField("analysis_duration", Number(e.target.value))} className="w-full mt-3 accent-indigo-600 cursor-pointer disabled:opacity-50" />
            <p className="text-[10px] mt-1 font-mono text-[color:color-mix(in_oklab,indigo_55%,transparent)]">Projection until {projectionEnd}</p>
          </div>
        </div>
      </div>
    </div>
  );
}