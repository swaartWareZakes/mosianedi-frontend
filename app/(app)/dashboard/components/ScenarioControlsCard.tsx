"use client";

import React from "react";
import { SlidersHorizontal } from "lucide-react";

type PolicyBias = "preventive" | "balanced" | "reactive";

type Props = {
  analysisYears: number;
  budgetLevel: number;
  policyBias: PolicyBias;
  onAnalysisYearsChange: (value: number) => void;
  onBudgetLevelChange: (value: number) => void;
  onPolicyBiasChange: (value: PolicyBias) => void;
};

export function ScenarioControlsCard({
  analysisYears,
  budgetLevel,
  policyBias,
  onAnalysisYearsChange,
  onBudgetLevelChange,
  onPolicyBiasChange,
}: Props) {
  return (
    <div className="p-6 bg-[var(--surface-bg)] rounded-2xl shadow-lg border border-slate-200/10 dark:border-slate-800/10 space-y-4">
      <h2 className="text-sm font-semibold flex items-center gap-2">
        <SlidersHorizontal className="h-4 w-4 text-yellow-500" />
        Scenario controls (presentation only)
      </h2>
      <p className="text-xs text-slate-500 dark:text-slate-400">
        These controls do <span className="font-semibold">not</span> modify
        your underlying data. They only drive this dashboard’s story. When
        you’re happy with a configuration, save it as a named dashboard.
      </p>

      {/* Analysis period */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-slate-200">Analysis period</span>
          <span className="text-slate-400">{analysisYears} years</span>
        </div>
        <input
          type="range"
          min={5}
          max={30}
          step={1}
          value={analysisYears}
          onChange={(e) => onAnalysisYearsChange(Number(e.target.value))}
          className="w-full"
        />
        <p className="text-[10px] text-slate-500 dark:text-slate-400">
          Typical RONET runs use 20 years; adjust to explore shorter or longer
          investment horizons.
        </p>
      </div>

      {/* Budget level */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-slate-200">Annual budget level</span>
          <span className="text-slate-400">{budgetLevel}% of baseline</span>
        </div>
        <input
          type="range"
          min={50}
          max={150}
          step={5}
          value={budgetLevel}
          onChange={(e) => onBudgetLevelChange(Number(e.target.value))}
          className="w-full"
        />
        <p className="text-[10px] text-slate-500 dark:text-slate-400">
          Below 100% simulates underfunding; above 100% simulates more
          aggressive investment. Currently used to scale indicative figures on
          the dashboard.
        </p>
      </div>

      {/* Policy bias */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-slate-200">
          Maintenance policy bias
        </p>
        <div className="flex flex-wrap gap-2">
          {(
            [
              {
                value: "preventive" as const,
                label: "Preventive heavy",
                desc: "Prioritise good/fair roads.",
              },
              {
                value: "balanced" as const,
                label: "Balanced",
                desc: "Mix of preventive + rehab.",
              },
              {
                value: "reactive" as const,
                label: "Reactive",
                desc: "Worst-first; more backlog risk.",
              },
            ] as const
          ).map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => onPolicyBiasChange(o.value)}
              className={[
                "flex-1 min-w-[90px] px-3 py-2 rounded-xl border text-left transition text-[11px]",
                policyBias === o.value
                  ? "border-yellow-500 bg-yellow-50/10 text-yellow-100"
                  : "border-slate-600 hover:bg-slate-800/60 text-slate-300",
              ].join(" ")}
            >
              <div className="font-semibold">{o.label}</div>
              <div className="text-[10px] text-slate-400">{o.desc}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}