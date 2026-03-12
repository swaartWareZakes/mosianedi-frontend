"use client";

import React, { useState } from "react";
import { Play, Loader2, TrendingUp, ArrowRight, CheckCircle2, Calendar, Layers, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSimulationRun } from "../hooks/useSimulationRun";
import { useProjectMeta } from "../hooks/useProjectMeta";

function fmtCurrency(val: any) {
  const v = Number(val);
  if (!Number.isFinite(v)) return "R 0";
  if (v >= 1_000_000_000) return `R ${(v / 1_000_000_000).toFixed(1)} bn`;
  if (v >= 1_000_000) return `R ${(v / 1_000_000).toFixed(1)} m`;
  return `R ${v.toLocaleString()}`;
}

const BORDER = "border-[color:color-mix(in_oklab,var(--foreground)_14%,transparent)]";
const TEXT = "text-[var(--foreground)]";
const TEXT_MUTED = "text-[color:color-mix(in_oklab,var(--foreground)_60%,transparent)]";
const TEXT_SOFT = "text-[color:color-mix(in_oklab,var(--foreground)_45%,transparent)]";
const BG_WASH = "bg-[color:color-mix(in_oklab,var(--foreground)_5%,transparent)]";
const BG_WASH_2 = "bg-[color:color-mix(in_oklab,var(--foreground)_7%,transparent)]";

const SELECT =
  "w-full rounded-lg text-sm px-3 py-2.5 outline-none appearance-none transition bg-[var(--surface-bg)] text-[var(--foreground)] border border-[color:color-mix(in_oklab,var(--foreground)_14%,transparent)] focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed";

export function RunSimulationCard({ projectId, readOnly = false }: { projectId: string; readOnly?: boolean }) {
  const router = useRouter();
  const { runSimulation, isRunning, result, error } = useSimulationRun(projectId);
  const { data: meta } = useProjectMeta(projectId);

  const [startYear, setStartYear] = useState<number | null>(null);
  const [includePaved, setIncludePaved] = useState(true);
  const [includeGravel, setIncludeGravel] = useState(true);

  const currentYear = new Date().getFullYear();
  const baseYear = meta?.start_year || currentYear + 1;
  const activeStartYear = startYear || baseYear;

  const handleRun = async () => {
    if (readOnly) return;
    await runSimulation({ startYearOverride: activeStartYear, includePaved, includeGravel });
  };

  return (
    <div className={["bg-[var(--surface-bg)] rounded-2xl shadow-lg border overflow-hidden relative", BORDER].join(" ")}>
      <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
      <div className="p-6">
        <div className="mb-6 flex justify-between items-start">
          <div>
              <h2 className={["text-base font-bold flex items-center gap-2", TEXT].join(" ")}>
                <Play className="w-4 h-4 text-indigo-500 fill-indigo-500" /> Simulation Control
              </h2>
              <p className={["text-xs mt-1", TEXT_MUTED].join(" ")}>Configure parameters before generating the proposal.</p>
          </div>
          {readOnly && (
             <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20">
               <Lock className="w-3.5 h-3.5" /> Read-Only
             </div>
          )}
        </div>

        {!result ? (
          <div className="space-y-5 animate-in fade-in slide-in-from-left-2 duration-300">
            <div className="space-y-2">
              <label className={["text-[10px] uppercase font-bold tracking-wider flex items-center gap-1.5", TEXT_SOFT].join(" ")}>
                <Calendar className="w-3 h-3" /> Start Financial Year
              </label>
              <div className="relative">
                <select disabled={readOnly} value={activeStartYear} onChange={(e) => setStartYear(Number(e.target.value))} className={SELECT}>
                  {Array.from({ length: 50 }).map((_, i) => (
                    <option key={baseYear + i} value={baseYear + i}>FY {baseYear + i} / {baseYear + i + 1}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className={["text-[10px] uppercase font-bold tracking-wider flex items-center gap-1.5", TEXT_SOFT].join(" ")}>
                <Layers className="w-3 h-3" /> Network Scope
              </label>
              <div className="flex gap-3">
                <label className={["flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all select-none", readOnly ? "opacity-50 cursor-not-allowed bg-[var(--surface-bg)]" : "cursor-pointer", includePaved && !readOnly ? "bg-[color:color-mix(in_oklab,indigo_12%,transparent)] border-[color:color-mix(in_oklab,indigo_28%,transparent)] text-indigo-500" : BORDER].join(" ")}>
                  <input type="checkbox" disabled={readOnly} checked={includePaved} onChange={(e) => setIncludePaved(e.target.checked)} className="hidden" />
                  {includePaved && <CheckCircle2 className="w-3 h-3" />}
                  <span>Paved</span>
                </label>
                <label className={["flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all select-none", readOnly ? "opacity-50 cursor-not-allowed bg-[var(--surface-bg)]" : "cursor-pointer", includeGravel && !readOnly ? "bg-[color:color-mix(in_oklab,orange_12%,transparent)] border-[color:color-mix(in_oklab,orange_28%,transparent)] text-orange-500" : BORDER].join(" ")}>
                  <input type="checkbox" disabled={readOnly} checked={includeGravel} onChange={(e) => setIncludeGravel(e.target.checked)} className="hidden" />
                  {includeGravel && <CheckCircle2 className="w-3 h-3" />}
                  <span>Gravel</span>
                </label>
              </div>
            </div>

            {error && <div className="text-xs text-rose-500 p-3 bg-rose-500/10 rounded border border-rose-500/20">{error}</div>}

            {/* IF READ ONLY -> SHOW MESSAGE. ELSE -> SHOW BUTTON */}
            {readOnly ? (
               <div className="p-4 text-center rounded-xl bg-[color:color-mix(in_oklab,var(--foreground)_4%,transparent)] border border-[color:color-mix(in_oklab,var(--foreground)_10%,transparent)] text-sm font-medium text-[color:color-mix(in_oklab,var(--foreground)_60%,transparent)]">
                  Simulation controls are locked. The owner must run an analysis before results can be viewed here.
               </div>
            ) : (
                <button onClick={handleRun} disabled={isRunning || (!includePaved && !includeGravel)} className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white rounded-xl font-semibold text-sm shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed">
                {isRunning ? <><Loader2 className="w-4 h-4 animate-spin" /> Running Simulation...</> : <>Run Analysis <ArrowRight className="w-4 h-4" /></>}
                </button>
            )}
          </div>
        ) : (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="p-4 rounded-xl border bg-[color:color-mix(in_oklab,mediumseagreen_10%,transparent)] border-[color:color-mix(in_oklab,mediumseagreen_22%,transparent)]">
              <div className="flex items-center gap-2 mb-4 text-[color:color-mix(in_oklab,mediumseagreen_70%,var(--foreground))] font-bold text-xs uppercase tracking-wide">
                <CheckCircle2 className="w-4 h-4" /> <span>Proposal Ready (FY{activeStartYear})</span>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div className={["text-[10px] uppercase font-bold tracking-wider mb-1", TEXT_SOFT].join(" ")}>Total Ask</div>
                  <div className={["text-xl font-black tracking-tight", TEXT].join(" ")}>{fmtCurrency(result.total_cost_npv || 0)}</div>
                </div>
                <div>
                  <div className={["text-[10px] uppercase font-bold tracking-wider mb-1", TEXT_SOFT].join(" ")}>Target VCI</div>
                  <div className={["text-xl font-black flex items-center gap-1 tracking-tight", TEXT].join(" ")}>
                    {(result.final_network_condition || 0).toFixed(1)}
                    <TrendingUp className={["w-4 h-4", (result.final_network_condition || 0) < 50 ? "text-rose-500" : "text-emerald-500"].join(" ")} />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              {!readOnly && (
                  <button onClick={handleRun} disabled={isRunning} className={["flex-1 py-2.5 text-xs font-bold rounded-lg border transition-colors", BG_WASH, BORDER, TEXT_MUTED].join(" ")}>
                    Recalculate
                  </button>
              )}
              <button onClick={() => router.push(`/projects/${projectId}/dashboard`)} className="flex-[2] py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-md flex items-center justify-center gap-2 transition-all">
                View Full Dashboard <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}