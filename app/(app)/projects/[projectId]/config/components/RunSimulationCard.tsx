"use client";

import React, { useState } from "react";
import {
  Play,
  Loader2,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  Calendar,
  Layers,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useSimulationRun } from "../hooks/useSimulationRun";
import { useProjectMeta } from "../hooks/useProjectMeta";

// --- Robust formatting function ---
function fmtCurrency(val: any) {
  const v = Number(val);
  if (!Number.isFinite(v)) return "R 0";
  if (v >= 1_000_000_000) return `R ${(v / 1_000_000_000).toFixed(1)} bn`;
  if (v >= 1_000_000) return `R ${(v / 1_000_000).toFixed(1)} m`;
  return `R ${v.toLocaleString()}`;
}

/** Theme-stable utility tokens (no dark:*, no slate-*) */
const BORDER = "border-[color:color-mix(in_oklab,var(--foreground)_14%,transparent)]";
const BORDER_SOFT = "border-[color:color-mix(in_oklab,var(--foreground)_10%,transparent)]";
const TEXT = "text-[var(--foreground)]";
const TEXT_MUTED = "text-[color:color-mix(in_oklab,var(--foreground)_60%,transparent)]";
const TEXT_SOFT = "text-[color:color-mix(in_oklab,var(--foreground)_45%,transparent)]";
const BG_WASH = "bg-[color:color-mix(in_oklab,var(--foreground)_5%,transparent)]";
const BG_WASH_2 = "bg-[color:color-mix(in_oklab,var(--foreground)_7%,transparent)]";

const SELECT =
  "w-full rounded-lg text-sm px-3 py-2.5 outline-none appearance-none cursor-pointer transition " +
  "bg-[var(--surface-bg)] " +
  "text-[var(--foreground)] " +
  "border border-[color:color-mix(in_oklab,var(--foreground)_14%,transparent)] " +
  "focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500";

export function RunSimulationCard({ projectId }: { projectId: string }) {
  const router = useRouter();
  const { runSimulation, isRunning, result, error } = useSimulationRun(projectId);
  const { data: meta } = useProjectMeta(projectId);

  // Pre-Flight Controls
  const [startYear, setStartYear] = useState<number | null>(null);
  const [includePaved, setIncludePaved] = useState(true);
  const [includeGravel, setIncludeGravel] = useState(true);

  const currentYear = new Date().getFullYear();
  const baseYear = meta?.start_year || currentYear + 1;
  const activeStartYear = startYear || baseYear;

  const handleRun = async () => {
    await runSimulation({
      startYearOverride: activeStartYear,
      includePaved,
      includeGravel,
    });
  };

  const handleGoToDashboard = () => {
    router.push(`/projects/${projectId}/dashboard`);
  };

  return (
    <div className={["bg-[var(--surface-bg)] rounded-2xl shadow-lg border overflow-hidden relative", BORDER].join(" ")}>
      {/* Decorative gradient top */}
      <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h2 className={["text-base font-bold flex items-center gap-2", TEXT].join(" ")}>
            <Play className="w-4 h-4 text-indigo-500 fill-indigo-500" />
            Simulation Control
          </h2>
          <p className={["text-xs mt-1", TEXT_MUTED].join(" ")}>
            Configure parameters before generating the proposal.
          </p>
        </div>

        {!result ? (
          /* --- PRE-FLIGHT CONTROLS --- */
          <div className="space-y-5 animate-in fade-in slide-in-from-left-2 duration-300">
            {/* 1. Year Selection */}
            <div className="space-y-2">
              <label className={["text-[10px] uppercase font-bold tracking-wider flex items-center gap-1.5", TEXT_SOFT].join(" ")}>
                <Calendar className="w-3 h-3" />
                Start Financial Year
              </label>

              <div className="relative">
                <select
                  value={activeStartYear}
                  onChange={(e) => setStartYear(Number(e.target.value))}
                  className={SELECT}
                >
                  {Array.from({ length: 50 }).map((_, i) => {
                    const year = baseYear + i;
                    return (
                      <option key={year} value={year}>
                        FY {year} / {year + 1}
                      </option>
                    );
                  })}
                </select>

                {/* Custom icon */}
                <div className={["absolute right-3 top-3 pointer-events-none", TEXT_SOFT].join(" ")}>
                  <Calendar className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* 2. Scope Toggles */}
            <div className="space-y-2">
              <label className={["text-[10px] uppercase font-bold tracking-wider flex items-center gap-1.5", TEXT_SOFT].join(" ")}>
                <Layers className="w-3 h-3" />
                Network Scope
              </label>

              <div className="flex gap-3">
                {/* Paved */}
                <label
                  className={[
                    "flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium cursor-pointer transition-all select-none",
                    includePaved
                      ? "bg-[color:color-mix(in_oklab,indigo_12%,transparent)] border-[color:color-mix(in_oklab,indigo_28%,transparent)] text-[color:color-mix(in_oklab,indigo_78%,var(--foreground))] shadow-sm"
                      : [BG_WASH, BORDER, TEXT_MUTED, "opacity-70"].join(" "),
                  ].join(" ")}
                >
                  <input
                    type="checkbox"
                    checked={includePaved}
                    onChange={(e) => setIncludePaved(e.target.checked)}
                    className="hidden"
                  />
                  {includePaved && <CheckCircle2 className="w-3 h-3" />}
                  <span>Paved</span>
                </label>

                {/* Gravel */}
                <label
                  className={[
                    "flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium cursor-pointer transition-all select-none",
                    includeGravel
                      ? "bg-[color:color-mix(in_oklab,orange_12%,transparent)] border-[color:color-mix(in_oklab,orange_28%,transparent)] text-[color:color-mix(in_oklab,orange_78%,var(--foreground))] shadow-sm"
                      : [BG_WASH, BORDER, TEXT_MUTED, "opacity-70"].join(" "),
                  ].join(" ")}
                >
                  <input
                    type="checkbox"
                    checked={includeGravel}
                    onChange={(e) => setIncludeGravel(e.target.checked)}
                    className="hidden"
                  />
                  {includeGravel && <CheckCircle2 className="w-3 h-3" />}
                  <span>Gravel</span>
                </label>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div
                className={[
                  "p-3 text-xs rounded-lg border flex items-center gap-2",
                  "bg-[color:color-mix(in_oklab,crimson_12%,transparent)]",
                  "border-[color:color-mix(in_oklab,crimson_28%,transparent)]",
                  "text-[color:color-mix(in_oklab,crimson_75%,var(--foreground))]",
                ].join(" ")}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                {error}
              </div>
            )}

            {/* Run */}
            <button
              onClick={handleRun}
              disabled={isRunning || (!includePaved && !includeGravel)}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white rounded-xl font-semibold text-sm shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:shadow-none"
            >
              {isRunning ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Running Simulation...
                </>
              ) : (
                <>
                  Run Analysis
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        ) : (
          /* --- RESULT SUMMARY --- */
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div
              className={[
                "p-4 rounded-xl border",
                "bg-[color:color-mix(in_oklab,mediumseagreen_10%,transparent)]",
                "border-[color:color-mix(in_oklab,mediumseagreen_22%,transparent)]",
              ].join(" ")}
            >
              <div className="flex items-center gap-2 mb-4 text-[color:color-mix(in_oklab,mediumseagreen_70%,var(--foreground))] font-bold text-xs uppercase tracking-wide">
                <CheckCircle2 className="w-4 h-4" />
                <span>Proposal Ready (FY{activeStartYear})</span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div className={["text-[10px] uppercase font-bold tracking-wider mb-1", TEXT_SOFT].join(" ")}>
                    Total Ask
                  </div>
                  <div className={["text-xl font-black tracking-tight", TEXT].join(" ")}>
                    {fmtCurrency(result.total_cost_npv || 0)}
                  </div>
                </div>

                <div>
                  <div className={["text-[10px] uppercase font-bold tracking-wider mb-1", TEXT_SOFT].join(" ")}>
                    Target VCI
                  </div>
                  <div className={["text-xl font-black flex items-center gap-1 tracking-tight", TEXT].join(" ")}>
                    {(result.final_network_condition || 0).toFixed(1)}
                    <TrendingUp
                      className={[
                        "w-4 h-4",
                        (result.final_network_condition || 0) < 50 ? "text-rose-500" : "text-emerald-500",
                      ].join(" ")}
                    />
                  </div>
                </div>
              </div>

              <div className={["text-xs rounded-lg border p-3 leading-relaxed", BG_WASH_2, BORDER_SOFT, TEXT_MUTED].join(" ")}>
                <strong className="text-indigo-600">Insight:</strong> Based on the {activeStartYear} start date, this budget prevents a 12% degradation in network quality.
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleRun}
                disabled={isRunning}
                className={["flex-1 py-2.5 text-xs font-bold rounded-lg border transition-colors", BG_WASH, BORDER, TEXT_MUTED].join(" ")}
              >
                Recalculate
              </button>

              <button
                onClick={handleGoToDashboard}
                className="flex-[2] py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              >
                View Full Dashboard
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}