"use client";

import React from "react";
import { Zap, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { useScenarioAssumptions } from "../hooks/useScenarioAssumptions";

export function ScenarioAssumptionsCard({ projectId }: { projectId: string }) {
  const { parameters, loading, isSaving, updateParameter } =
    useScenarioAssumptions(projectId);

  return (
    <div className="p-6 bg-[var(--surface-bg)] rounded-2xl shadow-lg border border-slate-200/10 dark:border-slate-800/10 space-y-4 relative">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Zap className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
          2. Scenario Assumptions
        </h2>
        {/* Saving Indicator */}
        <div className="h-4 flex items-center">
          {isSaving && (
            <span className="text-[10px] text-slate-400 flex items-center gap-1">
              <Save className="h-3 w-3 animate-pulse" /> Saving...
            </span>
          )}
        </div>
      </div>

      {loading || !parameters ? (
        <div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400">
          Loading default assumptions...
        </div>
      ) : (
        <>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Configure the high-level assumptions. Changes serve as the "Baseline".
          </p>

          {/* 1. Analysis Period */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-700 dark:text-slate-200">
                Analysis period
              </span>
              <span className="text-slate-500 dark:text-slate-400">
                {parameters.analysis_duration} years
              </span>
            </div>
            <input
              type="range"
              min={5}
              max={30}
              step={1}
              value={parameters.analysis_duration}
              onChange={(e) =>
                updateParameter("analysis_duration", Number(e.target.value))
              }
              className="w-full accent-[var(--accent-color)] cursor-pointer"
            />
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              Typical RONET analyses use 20 years.
            </p>
          </div>

          {/* 2. Budget Level */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-700 dark:text-slate-200">
                Annual budget level
              </span>
              <span className="text-slate-500 dark:text-slate-400">
                {parameters.budget_percent_baseline}% of required
              </span>
            </div>
            <input
              type="range"
              min={50}
              max={150}
              step={5}
              value={parameters.budget_percent_baseline}
              onChange={(e) =>
                updateParameter(
                  "budget_percent_baseline",
                  Number(e.target.value)
                )
              }
              className="w-full accent-[var(--accent-color)] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 px-1">
              <span>Constraint</span>
              <span>Baseline</span>
              <span>Growth</span>
            </div>
          </div>

          {/* 3. Policy Bias */}
          <div className="space-y-2 pt-2">
            <p className="text-xs font-medium text-slate-700 dark:text-slate-200">
              Maintenance policy bias
            </p>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  {
                    value: "preventive",
                    label: "Preventive",
                    desc: "Fix good roads first",
                  },
                  {
                    value: "balanced",
                    label: "Balanced",
                    desc: "Optimal mix",
                  },
                  {
                    value: "reactive",
                    label: "Reactive",
                    desc: "Fix worst first",
                  },
                ] as const
              ).map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => updateParameter("policy_bias", option.value)}
                  className={cn(
                    "flex-1 min-w-[80px] px-3 py-2 rounded-xl border text-left transition text-[11px]",
                    parameters.policy_bias === option.value
                      ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-900 dark:text-yellow-100"
                      : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-200"
                  )}
                >
                  <div className="font-semibold">{option.label}</div>
                  <div className="text-[9px] opacity-80 leading-tight mt-0.5">
                    {option.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}