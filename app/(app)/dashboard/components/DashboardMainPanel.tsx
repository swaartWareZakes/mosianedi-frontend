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
import { AlertTriangle, BarChart3, TrendingUp } from "lucide-react";
import type { NetworkSnapshotUi } from "../../projects/[projectId]/config/hooks/useNetworkSnapshot";

type Props = {
  snapshot: NetworkSnapshotUi | null;
  loading: boolean;
  error: string | null;
  adjustedAssetValue: number | null;
};

const SURFACE_COLOURS = ["#38bdf8", "#64748b"]; // paved, gravel
const CONDITION_COLOURS = ["#22c55e", "#fbbf24", "#f97373"]; // good, fair, poor;

export function DashboardMainPanel({
  snapshot,
  loading,
  error,
  adjustedAssetValue,
}: Props) {
  // ----- derived chart data --------------------------------------------------

  const surfaceMixData = useMemo(() => {
    if (!snapshot) return [];
    return [
      { name: "Paved", value: snapshot.pavedLengthKm },
      { name: "Gravel", value: snapshot.gravelLengthKm },
    ];
  }, [snapshot]);

  const conditionData = useMemo(() => {
    if (!snapshot) return [];
    return [
      { name: "Good", value: snapshot.goodConditionPct },
      { name: "Fair", value: snapshot.fairConditionPct },
      { name: "Poor", value: snapshot.poorConditionPct },
    ];
  }, [snapshot]);

  const roadClassData = useMemo(() => {
    if (!snapshot?.lengthByRoadClass) return [];
    return snapshot.lengthByRoadClass.map((row) => ({
      name: row.label,
      km: row.lengthKm,
    }));
  }, [snapshot]);

  const totalLengthKm = snapshot?.totalLengthKm ?? 0;
  const goodShare =
    snapshot && totalLengthKm > 0
      ? (snapshot.goodConditionPct ?? 0)
      : 0;
  const gravelShare =
    snapshot && totalLengthKm > 0
      ? (snapshot.gravelLengthKm / totalLengthKm) * 100
      : 0;

  // --------------------------------------------------------------------------

  return (
    <div className="space-y-4">
      {/* errors / loading */}
      {loading && (
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Loading dashboard data…
        </p>
      )}

      {!loading && error && (
        <div className="flex items-start gap-2 text-xs text-red-500">
          <AlertTriangle className="h-4 w-4 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* nothing yet */}
      {!loading && !error && !snapshot && (
        <p className="text-xs text-slate-500 dark:text-slate-400">
          No snapshot yet. Upload and validate master data for this project on
          the <span className="font-medium">Configuration</span> page to see
          dashboards here.
        </p>
      )}

      {/* main content */}
      {!loading && snapshot && (
        <>
          {/* KPI strip -------------------------------------------------------- */}
          <div className="grid gap-3 md:grid-cols-4">
            {/* Total length */}
            <div className="rounded-2xl border border-slate-200/10 dark:border-slate-800/60 bg-[var(--surface-bg)] px-4 py-3 flex flex-col justify-between">
              <p className="text-[10px] uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Total network length
              </p>
              <div className="mt-1 text-xl font-semibold">
                {snapshot.totalLengthKm.toFixed(1)}{" "}
                <span className="text-xs font-normal text-slate-400">km</span>
              </div>
              <p className="mt-1 text-[10px] text-slate-500 dark:text-slate-500">
                Based on latest master dataset
              </p>
            </div>

            {/* Good share */}
            <div className="rounded-2xl border border-slate-200/10 dark:border-slate-800/60 bg-[var(--surface-bg)] px-4 py-3 flex flex-col justify-between">
              <p className="text-[10px] uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Good condition
              </p>
              <div className="mt-1 text-xl font-semibold text-emerald-400">
                {snapshot.goodConditionPct.toFixed(0)}%
              </div>
              <p className="mt-1 text-[10px] text-slate-500 dark:text-slate-500">
                Share of network length in{" "}
                <span className="font-medium">“good”</span> band
              </p>
            </div>

            {/* Gravel share */}
            <div className="rounded-2xl border border-slate-200/10 dark:border-slate-800/60 bg-[var(--surface-bg)] px-4 py-3 flex flex-col justify-between">
              <p className="text-[10px] uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Gravel share
              </p>
              <div className="mt-1 text-xl font-semibold text-sky-400">
                {gravelShare.toFixed(0)}%
              </div>
              <p className="mt-1 text-[10px] text-slate-500 dark:text-slate-500">
                {snapshot.gravelLengthKm.toFixed(1)} km of{" "}
                {snapshot.totalLengthKm.toFixed(1)} km total
              </p>
            </div>

         {/* Asset value / scenario adjusted */}
            {snapshot.totalAssetValue != null && (
            <div className="rounded-2xl border border-slate-200/10 dark:border-slate-800/60 bg-gradient-to-br from-slate-900/80 to-slate-900/30 px-4 py-3 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                <p className="text-[10px] uppercase tracking-wide text-slate-400">
                    Network asset value
                </p>
                <TrendingUp className="h-4 w-4 text-emerald-400" />
                </div>
                <div className="mt-1 text-xl font-semibold text-slate-50">
                R{" "}
                {(snapshot.totalAssetValue / 1_000_000).toFixed(1)}{" "}
                <span className="text-xs font-normal text-slate-400">m</span>
                </div>
                {adjustedAssetValue != null && (
                <p className="mt-1 text-[10px] text-emerald-300">
                    Scenario envelope:&nbsp;
                    <span className="font-semibold">
                    R {(adjustedAssetValue / 1_000_000).toFixed(1)} m
                    </span>
                </p>
                )}
            </div>
            )}
          </div>

          {/* Charts row ------------------------------------------------------- */}
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Condition split: stacked bar */}
            <div className="p-4 rounded-2xl bg-[var(--surface-bg)] border border-slate-200/10 dark:border-slate-800/60 space-y-2">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-sky-400" />
                  Condition split
                </h2>
                <span className="text-[10px] text-slate-500 dark:text-slate-500">
                  % of total length
                </span>
              </div>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      {
                        name: "Network",
                        Good: snapshot.goodConditionPct,
                        Fair: snapshot.fairConditionPct,
                        Poor: snapshot.poorConditionPct,
                      },
                    ]}
                    stackOffset="expand"
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis dataKey="name" hide />
                    <YAxis hide />
                    <Tooltip
                      formatter={(value: any) => `${value.toFixed(0)}%`}
                    />
                    <Legend
                      wrapperStyle={{
                        fontSize: "10px",
                      }}
                    />
                    <Bar dataKey="Good" stackId="a" fill={CONDITION_COLOURS[0]} />
                    <Bar dataKey="Fair" stackId="a" fill={CONDITION_COLOURS[1]} />
                    <Bar dataKey="Poor" stackId="a" fill={CONDITION_COLOURS[2]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Surface mix donut */}
            <div className="p-4 rounded-2xl bg-[var(--surface-bg)] border border-slate-200/10 dark:border-slate-800/60 space-y-2">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold">Surface mix</h2>
                <span className="text-[10px] text-slate-500 dark:text-slate-500">
                  Paved vs gravel (km)
                </span>
              </div>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={surfaceMixData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={2}
                    >
                      {surfaceMixData.map((_, idx) => (
                        <Cell
                          key={`cell-surface-${idx}`}
                          fill={SURFACE_COLOURS[idx % SURFACE_COLOURS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: any) => `${(value as number).toFixed(1)} km`}
                    />
                    <Legend
                      wrapperStyle={{
                        fontSize: "10px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Road class chart + asset breakdown ----------------------------- */}
          <div className="grid gap-4 lg:grid-cols-[2.1fr,1.2fr]">
            {/* Road class */}
            <div className="p-4 rounded-2xl bg-[var(--surface-bg)] border border-slate-200/10 dark:border-slate-800/60 space-y-2">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold">Length by road class</h2>
                <span className="text-[10px] text-slate-500 dark:text-slate-500">
                  km per class
                </span>
              </div>
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={roadClassData}
                    margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
                  >
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 10 }}
                      tickMargin={4}
                      axisLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 10 }}
                      axisLine={false}
                      width={35}
                    />
                    <Tooltip
                      formatter={(value: any) => `${(value as number).toFixed(1)} km`}
                    />
                    <Bar
                      dataKey="km"
                      radius={[4, 4, 0, 0]}
                      fill="#38bdf8"
                      maxBarSize={36}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Asset value by category */}
            <div className="p-4 rounded-2xl bg-[var(--surface-bg)] border border-slate-200/10 dark:border-slate-800/60 space-y-2">
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-400" />
                Asset value by category
              </h2>
              <div className="space-y-1.5 text-[11px]">
                {snapshot.assetValueByCategory?.map((row) => (
                  <div
                    key={row.label}
                    className="flex items-center justify-between gap-2"
                  >
                    <span className="text-slate-400">{row.label}</span>
                    <span className="font-mono">
                      R {(row.value / 1_000_000).toFixed(1)} m
                    </span>
                  </div>
                ))}
              </div>
              <p className="mt-2 text-[10px] text-slate-500 dark:text-slate-500">
                Snapshot as at{" "}
                <span className="font-mono">
                  {snapshot.calculatedAt
                    ? new Date(snapshot.calculatedAt).toLocaleString("en-ZA")
                    : "latest master data upload"}
                </span>
                .
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}