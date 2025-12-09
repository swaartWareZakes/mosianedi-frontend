// app/(app)/network/components/NetworkSnapshotSummary.tsx
"use client";

import React from "react";
import { AlertTriangle, BarChart3, Map, TrendingUp } from "lucide-react";
import type { NetworkSnapshotUi } from "../../projects/[projectId]/config/hooks/useNetworkSnapshot";

type Props = {
  snapshot: NetworkSnapshotUi | null;
  loading: boolean;
  error: string | null;
};

export function NetworkSnapshotSummary({ snapshot, loading, error }: Props) {
  return (
    <>
      <div className="p-6 bg-[var(--surface-bg)] rounded-2xl shadow-lg border border-slate-200/10 dark:border-slate-800/10 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Map className="h-5 w-5 text-sky-500" />
            Network snapshot
          </h2>
        </div>

        {loading && (
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Loading snapshot…
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
            No snapshot yet. Upload master data for this project on the
            configuration page to see network metrics here.
          </p>
        )}

        {!loading && snapshot && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-slate-50 dark:bg-slate-900/40 px-3 py-2.5">
                <p className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Total network length
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
                  Surface mix
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

            {/* Condition split */}
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

            {snapshot.totalAssetValue != null && (
              <div className="rounded-xl bg-slate-50 dark:bg-slate-900/40 px-3 py-2.5 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Network asset value
                  </p>
                  <p className="mt-1 text-lg font-semibold">
                    R {(snapshot.totalAssetValue / 1_000_000).toFixed(1)} m
                  </p>
                </div>
                <TrendingUp className="h-6 w-6 text-emerald-500" />
              </div>
            )}

            <p className="text-[10px] text-slate-500 dark:text-slate-500">
              Snapshot based on{" "}
              <span className="font-mono">
                {snapshot.calculatedAt
                  ? new Date(snapshot.calculatedAt).toLocaleString("en-ZA")
                  : "latest master data upload"}
              </span>
              .
            </p>
          </div>
        )}
      </div>

      {/* Unit costs card (if present) */}
      {snapshot && snapshot.unitCostsBySurface?.length > 0 && (
        <div className="p-6 bg-[var(--surface-bg)] rounded-2xl shadow-lg border border-slate-200/10 dark:border-slate-800/10 space-y-3">
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-violet-500" />
            Typical unit costs (per km)
          </h2>
          <div className="space-y-1 text-[11px]">
            {snapshot.unitCostsBySurface.map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between gap-2"
              >
                <span className="text-slate-400">{row.label}</span>
                <span className="font-mono text-slate-100">
                  R {row.costPerKm.toFixed(0)}/km
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}