// app/(app)/projects/[projectId]/config/page.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Zap, Map, RefreshCw, AlertTriangle } from "lucide-react";

import { DataInputCard } from "./DataInputCard";
import { useNetworkSnapshot } from "./hooks/useNetworkSnapshot";

export default function ProjectConfigPage() {
  const params = useParams();
  const projectId = params?.projectId as string;

  const { snapshot, loading, error, refetch } = useNetworkSnapshot(projectId);

  // Local-only scenario assumptions (we'll persist later if needed)
  const [analysisYears, setAnalysisYears] = useState(20);
  const [budgetLevel, setBudgetLevel] = useState(100); // % of "baseline"
  const [policyBias, setPolicyBias] = useState<
    "preventive" | "balanced" | "reactive"
  >("balanced");

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <Link
              href="/projects"
              className="inline-flex items-center gap-1 hover:text-slate-700 dark:hover:text-slate-200"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to projects
            </Link>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Project Configuration
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Project ID:{" "}
            <span className="font-mono bg-slate-100 dark:bg-slate-900/40 px-1.5 py-0.5 rounded">
              {projectId}
            </span>
          </p>
        </div>
      </header>

      {/* Main layout: left = data input, right = snapshot + assumptions */}
      <div className="grid gap-6 lg:grid-cols-[1.7fr,1.3fr]">
        {/* STEP 1 – Master Data Upload */}
        <DataInputCard projectId={projectId} />

        {/* STEP 2 – Network Snapshot + Scenario Assumptions */}
        <div className="space-y-4">
          {/* Network Snapshot */}
          <div className="p-6 bg-[var(--surface-bg)] rounded-2xl shadow-lg border border-slate-200/10 dark:border-slate-800/10 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Map className="h-5 w-5 text-sky-600 dark:text-sky-400" />
                Network Snapshot
              </h2>
              <button
                type="button"
                onClick={refetch}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 px-2.5 py-1 text-[11px] font-medium text-slate-600 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60 disabled:opacity-50"
                disabled={loading}
              >
                <RefreshCw className="h-3 w-3" />
                {loading ? "Refreshing…" : "Refresh"}
              </button>
            </div>

            {loading && (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Calculating network snapshot from the latest master data…
              </p>
            )}

            {!loading && error && (
              <div className="flex items-start gap-2 text-xs text-red-500">
                <AlertTriangle className="h-4 w-4 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {!loading && !error && !snapshot && (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                No snapshot available yet. Once a valid master data file is
                uploaded and processed, the aggregated network metrics will
                appear here.
              </p>
            )}

            {!loading && snapshot && (
              <div className="space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl bg-slate-50 dark:bg-slate-900/40 px-3 py-2.5">
                    <p className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Total Network Length
                    </p>
                    <p className="mt-1 text-lg font-semibold">
                      {snapshot.totalLengthKm.toFixed(1)} km
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                      From latest master dataset
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 dark:bg-slate-900/40 px-3 py-2.5">
                    <p className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Surface Mix
                    </p>
                    <p className="mt-1 text-sm">
                      <span className="font-semibold">
                        {snapshot.pavedLengthKm.toFixed(1)} km
                      </span>{" "}
                      paved
                    </p>
                    <p className="text-sm">
                      <span className="font-semibold">
                        {snapshot.gravelLengthKm.toFixed(1)} km
                      </span>{" "}
                      gravel
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1">
                    Condition split
                  </p>
                  <div className="flex items-center gap-2 text-[11px]">
                    <div className="flex-1 h-2 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-800">
                      <div
                        className="h-full bg-emerald-500"
                        style={{ width: `${snapshot.goodConditionPct}%` }}
                      />
                    </div>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      {snapshot.goodConditionPct.toFixed(0)}% good
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] mt-1">
                    <div className="flex-1 h-2 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-800">
                      <div
                        className="h-full bg-amber-500"
                        style={{ width: `${snapshot.fairConditionPct}%` }}
                      />
                    </div>
                    <span className="font-semibold text-amber-600 dark:text-amber-400">
                      {snapshot.fairConditionPct.toFixed(0)}% fair
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] mt-1">
                    <div className="flex-1 h-2 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-800">
                      <div
                        className="h-full bg-rose-500"
                        style={{ width: `${snapshot.poorConditionPct}%` }}
                      />
                    </div>
                    <span className="font-semibold text-rose-600 dark:text-rose-400">
                      {snapshot.poorConditionPct.toFixed(0)}% poor
                    </span>
                  </div>
                </div>

                <p className="text-[10px] text-slate-500 dark:text-slate-500">
                  Snapshot based on{" "}
                  <span className="font-mono">latest master data upload</span>.
                </p>
              </div>
            )}
          </div>

          {/* Scenario Assumptions */}
          <div className="p-6 bg-[var(--surface-bg)] rounded-2xl shadow-lg border border-slate-200/10 dark:border-slate-800/10 space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              2. Scenario Assumptions
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Configure the high-level assumptions that will drive RONET-style
              scenarios. For now these sliders are local to this session – later
              we can save named scenarios to the backend.
            </p>

            {/* Analysis period */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-700 dark:text-slate-200">
                  Analysis period
                </span>
                <span className="text-slate-500 dark:text-slate-400">
                  {analysisYears} years
                </span>
              </div>
              <input
                type="range"
                min={5}
                max={30}
                step={1}
                value={analysisYears}
                onChange={(e) => setAnalysisYears(Number(e.target.value))}
                className="w-full"
              />
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                Typical RONET analyses use 20 years, but you can shorten or
                lengthen this for “what-if” exploration.
              </p>
            </div>

            {/* Budget level */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-700 dark:text-slate-200">
                  Annual budget level
                </span>
                <span className="text-slate-500 dark:text-slate-400">
                  {budgetLevel}% of baseline
                </span>
              </div>
              <input
                type="range"
                min={50}
                max={150}
                step={5}
                value={budgetLevel}
                onChange={(e) => setBudgetLevel(Number(e.target.value))}
                className="w-full"
              />
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                100% represents the “required” budget; below 100% simulates
                underfunding, above 100% simulates more aggressive investment.
              </p>
            </div>

            {/* Policy bias */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-slate-700 dark:text-slate-200">
                Maintenance policy bias
              </p>
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    {
                      value: "preventive",
                      label: "Preventive heavy",
                      desc: "Prioritise good/fair roads to avoid deterioration.",
                    },
                    {
                      value: "balanced",
                      label: "Balanced",
                      desc: "Mix of preventive + rehabilitation.",
                    },
                    {
                      value: "reactive",
                      label: "Reactive",
                      desc: "Let network deteriorate, fix worst first.",
                    },
                  ] as const
                ).map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setPolicyBias(option.value)}
                    className={[
                      "flex-1 min-w-[90px] px-3 py-2 rounded-xl border text-left transition text-[11px]",
                      policyBias === option.value
                        ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-900 dark:text-yellow-100"
                        : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-200",
                    ].join(" ")}
                  >
                    <div className="font-semibold">{option.label}</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">
                      {option.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* For later: wiring into compute / dashboards */}
            <p className="text-[10px] text-slate-500 dark:text-slate-500">
              These assumptions will feed into the{" "}
              <span className="font-medium">Scenario Results</span> and{" "}
              <span className="font-medium">Board Dashboard</span> views, where
              we’ll show how the network condition and costs evolve over time.
              For now, they’re just live “what-if” controls.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}