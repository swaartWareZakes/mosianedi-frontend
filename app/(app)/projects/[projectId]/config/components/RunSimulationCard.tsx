"use client";

import React from "react";
import Link from "next/link";
import { Play, Loader2, BarChart3, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSimulationRun } from "../hooks/useSimulationRun";

export function RunSimulationCard({ projectId }: { projectId: string }) {
  const { runSimulation, isRunning, error, result } = useSimulationRun(projectId);

  return (
    <div className="p-6 bg-[var(--surface-bg)] rounded-2xl shadow-lg border border-slate-200/10 dark:border-slate-800/10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Play className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          3. Run Simulation
        </h2>
      </div>

      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
        Combine your <strong>Master Data</strong> with the{" "}
        <strong>Scenario Assumptions</strong> to forecast network performance over
        the analysis period.
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 rounded-lg text-sm flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" /> {error}
        </div>
      )}

      <div className="flex items-center gap-4">
        <button
          onClick={runSimulation}
          disabled={isRunning}
          className={cn(
            "inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white shadow-sm transition",
            isRunning
              ? "bg-emerald-700 cursor-wait"
              : "bg-emerald-600 hover:bg-emerald-700",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          {isRunning ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Play className="h-4 w-4" />
          )}
          {isRunning ? "Running Engine..." : "Calculate Scenario"}
        </button>
      </div>

      {/* Quick Results Preview */}
      {result && (
        <div className="mt-6 p-4 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-slate-700 dark:text-slate-200">
            <BarChart3 className="h-4 w-4 text-sky-500" />
            Simulation Successful
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-[10px] uppercase tracking-wide text-slate-500">
                Total NPV Cost
              </p>
              <p className="font-mono font-medium text-lg text-[var(--foreground)]">
                {(result.total_cost_npv / 1_000_000).toFixed(1)} M
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wide text-slate-500">
                Final Avg IRI
              </p>
              <p className="font-mono font-medium text-lg text-[var(--foreground)]">
                {result.final_network_condition.toFixed(2)}
              </p>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
            <Link
              href={`/projects/${projectId}/dashboard`}
              className="text-xs font-medium text-[var(--accent-color)] hover:underline flex items-center gap-1"
            >
              Go to Dashboard &rarr;
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}