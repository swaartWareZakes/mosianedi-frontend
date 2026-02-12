"use client";

import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import { TrendingUp, Activity, Coins, Map, BarChart3 } from "lucide-react";

import type { NetworkProfile } from "../../config/hooks/useNetworkSnapshot";
import type { SimulationOutput } from "../../config/types";
import { SimulationCharts } from "./SimulationCharts";

import { AiInsightChip } from "./AiInsightChip";
import { useAiAdvisor } from "../hooks/useAiAdvisor";

type Props = {
  projectId: string;
  snapshot: NetworkProfile | null;
  loading: boolean;
  error: string | null;
  adjustedAssetValue: number | null;
  simulationResults: SimulationOutput | null;
};

const SURFACE_COLOURS = ["#6366f1", "#f59e0b"];

// ---- Theme-stable tokens (no dark:*, no slate-*) ----------
const TEXT = "text-[var(--foreground)]";
const TEXT_MUTED = "text-[color:color-mix(in_oklab,var(--foreground)_60%,transparent)]";
const TEXT_SOFT = "text-[color:color-mix(in_oklab,var(--foreground)_45%,transparent)]";
const TEXT_FAINT = "text-[color:color-mix(in_oklab,var(--foreground)_32%,transparent)]";

const BORDER = "border-[color:color-mix(in_oklab,var(--foreground)_14%,transparent)]";
const BORDER_SOFT = "border-[color:color-mix(in_oklab,var(--foreground)_10%,transparent)]";

const SURFACE = "bg-[var(--surface-bg)]";
const WASH = "bg-[color:color-mix(in_oklab,var(--foreground)_6%,transparent)]";

function fmtCurrency(val: number) {
  if (val >= 1_000_000_000) return `R ${(val / 1_000_000_000).toFixed(1)} bn`;
  if (val >= 1_000_000) return `R ${(val / 1_000_000).toFixed(1)} m`;
  return `R ${val.toLocaleString()}`;
}

export function DashboardMainPanel({
  projectId,
  snapshot,
  loading,
  error,
  adjustedAssetValue,
  simulationResults,
}: Props) {
  const { analysis, loading: aiLoading } = useAiAdvisor(projectId);

  const surfaceMixData = useMemo(() => {
    if (!snapshot) return [];
    return [
      { name: "Paved", value: snapshot.pavedLengthKm },
      { name: "Gravel", value: snapshot.gravelLengthKm },
    ];
  }, [snapshot]);

  const assetMixData = useMemo(() => {
    if (!snapshot) return [];
    const pavedVal = snapshot.pavedLengthKm * 3_500_000;
    const gravelVal = snapshot.gravelLengthKm * 250_000;
    return [
      { name: "Paved Assets", value: pavedVal, fill: "#6366f1" },
      { name: "Gravel Assets", value: gravelVal, fill: "#f59e0b" },
    ];
  }, [snapshot]);

  // ---- States (system tokens) -----------------------------
  if (loading) return <div className={`p-8 text-center ${TEXT_MUTED}`}>Loading dashboard...</div>;
  if (error) return <div className="p-8 text-center text-rose-500">Error: {error}</div>;
  if (!snapshot) return <div className={`p-8 text-center ${TEXT_MUTED}`}>No network data found.</div>;

  const vciBadge =
    snapshot.avgVci < 50
      ? "bg-rose-100 text-rose-700"
      : "bg-emerald-100 text-emerald-700";

  const vciBadgeText = snapshot.avgVci < 50 ? "POOR" : "FAIR";

  return (
    <div className="space-y-6">
      {/* --- ROW 1: KPI CARDS --- */}
      <div className="grid gap-4 md:grid-cols-4">
        {/* Total Length */}
        <div className={`p-4 rounded-2xl border ${BORDER} ${SURFACE}`}>
          <p className={`text-[10px] uppercase tracking-wide flex items-center gap-2 ${TEXT_SOFT}`}>
            <Map className="w-3 h-3" /> Total Length
          </p>
          <div className={`mt-2 text-2xl font-bold ${TEXT}`}>
            {snapshot.totalLengthKm.toLocaleString()}{" "}
            <span className={`text-sm font-medium ${TEXT_SOFT}`}>km</span>
          </div>
          <div className={`mt-1 text-xs ${TEXT_FAINT}`}>Current Network Size</div>
        </div>

        {/* Network VCI */}
        <div className={`p-4 rounded-2xl border ${BORDER} ${SURFACE}`}>
          <p className={`text-[10px] uppercase tracking-wide flex items-center gap-2 ${TEXT_SOFT}`}>
            <Activity className="w-3 h-3" /> Network VCI
          </p>
          <div className={`mt-2 text-2xl font-bold flex items-baseline gap-2 ${TEXT}`}>
            {snapshot.avgVci.toFixed(1)}
            <span className={`text-xs px-1.5 py-0.5 rounded font-bold ${vciBadge}`}>
              {vciBadgeText}
            </span>
          </div>
          <div className={`mt-1 text-xs ${TEXT_FAINT}`}>Weighted Average Condition</div>
        </div>

        {/* Replacement Cost (Hero) */}
        <div
          className={`p-4 rounded-2xl border ${BORDER} ${SURFACE} col-span-2 text-white overflow-hidden relative`}
          style={{
            background:
              "linear-gradient(135deg, color-mix(in oklab, var(--foreground) 88%, transparent), color-mix(in oklab, var(--foreground) 75%, transparent))",
          }}
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] uppercase tracking-wide text-white/70 flex items-center gap-2">
                <Coins className="w-3 h-3 text-emerald-300" /> Current Replacement Cost
              </p>
              <div className="mt-2 text-3xl font-bold">{fmtCurrency(snapshot.assetValue)}</div>
              <div className="mt-1 text-xs text-white/60">Total Estimated Value</div>
            </div>

            {adjustedAssetValue !== null && adjustedAssetValue !== undefined && (
              <div className="text-right">
                <p className="text-[10px] text-white/60">Scenario Adjusted</p>
                <p className="font-mono text-emerald-300 font-bold">
                  {fmtCurrency(adjustedAssetValue)}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- ROW 2: VISUAL BREAKDOWNS --- */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Surface Composition */}
        <div className={`p-6 rounded-2xl ${SURFACE} border ${BORDER}`}>
          <h2 className={`text-sm font-bold mb-4 flex items-center gap-2 ${TEXT}`}>
            <BarChart3 className="w-4 h-4 text-indigo-500" />
            Network Surface Composition
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={surfaceMixData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                >
                  {surfaceMixData.map((_, idx) => (
                    <Cell key={`cell-${idx}`} fill={SURFACE_COLOURS[idx]} />
                  ))}
                </Pie>
                <Tooltip formatter={(val: number) => `${val.toLocaleString()} km`} />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className={`mt-2 text-xs ${TEXT_FAINT}`}>Paved vs gravel share by length.</div>
        </div>

        {/* Value Distribution */}
        <div className={`p-6 rounded-2xl ${SURFACE} border ${BORDER}`}>
          <h2 className={`text-sm font-bold mb-4 flex items-center gap-2 ${TEXT}`}>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            Estimated Value Distribution
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={assetMixData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={false}
                  stroke="color-mix(in oklab, var(--foreground) 18%, transparent)"
                />
                <XAxis type="number" hide />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={110}
                  tick={{ fontSize: 12, fill: "color-mix(in oklab, var(--foreground) 65%, transparent)" }}
                />
                <Tooltip
                  formatter={(val: number) => fmtCurrency(val)}
                  cursor={{ fill: "transparent" }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className={`mt-2 text-xs ${TEXT_FAINT}`}>Replacement-weighted split (paved dominates value).</div>
        </div>
      </div>

      {/* --- ROW 3: SIMULATION RESULTS --- */}
      {simulationResults && (
        <div className={`mt-8 pt-6 border-t ${BORDER_SOFT}`}>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className={`text-lg font-bold flex items-center gap-2 ${TEXT}`}>
                <Activity className="w-5 h-5 text-indigo-500" />
                Strategic Forecast
              </h2>
              <p className={`text-sm ${TEXT_MUTED}`}>
                Projected performance over the next {simulationResults.year_count} years.
              </p>
            </div>

            <AiInsightChip text={analysis?.chart_insights.condition_forecast} loading={aiLoading} />
          </div>

          <SimulationCharts results={simulationResults} />

          <div className="flex justify-end mt-2">
            <AiInsightChip text={analysis?.chart_insights.budget_impact} loading={aiLoading} />
          </div>
        </div>
      )}
    </div>
  );
}