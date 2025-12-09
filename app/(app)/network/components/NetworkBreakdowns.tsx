// app/(app)/network/components/NetworkBreakdowns.tsx
"use client";

import React from "react";
import { Map, Route, TrendingUp } from "lucide-react";
import type { NetworkSnapshotUi } from "../../projects/[projectId]/config/hooks/useNetworkSnapshot";

type Props = {
  snapshot: NetworkSnapshotUi | null;
  totalLengthForRatios: number;
};

export function NetworkBreakdowns({ snapshot, totalLengthForRatios }: Props) {
  if (!snapshot) return null;

  return (
    <>
      {/* Length by road class */}
      {snapshot.lengthByRoadClass?.length > 0 && (
        <div className="p-6 bg-[var(--surface-bg)] rounded-2xl shadow-lg border border-slate-200/10 dark:border-slate-800/10 space-y-3">
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <Route className="h-4 w-4 text-sky-500" />
            Length by road class
          </h2>
          <div className="space-y-2 text-[11px]">
            {snapshot.lengthByRoadClass.map((row) => {
              const pct =
                totalLengthForRatios > 0
                  ? (row.lengthKm / totalLengthForRatios) * 100
                  : 0;

              return (
                <div key={row.label}>
                  <div className="flex justify-between mb-0.5">
                    <span className="text-slate-400">{row.label}</span>
                    <span className="font-mono">
                      {row.lengthKm.toFixed(1)} km
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-sky-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Length by network type (if present from workbook) */}
      {snapshot.lengthByNetworkType?.length > 0 && (
        <div className="p-6 bg-[var(--surface-bg)] rounded-2xl shadow-lg border border-slate-200/10 dark:border-slate-800/10 space-y-3">
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <Map className="h-4 w-4 text-emerald-500" />
            Length by network type
          </h2>
          <div className="space-y-2 text-[11px]">
            {snapshot.lengthByNetworkType.map((row) => {
              const pct =
                totalLengthForRatios > 0
                  ? (row.lengthKm / totalLengthForRatios) * 100
                  : 0;

              return (
                <div key={row.label}>
                  <div className="flex justify-between mb-0.5">
                    <span className="text-slate-400">{row.label}</span>
                    <span className="font-mono">
                      {row.lengthKm.toFixed(1)} km
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Asset value breakdown */}
      {snapshot.assetValueByCategory?.length > 0 && (
        <div className="p-6 bg-[var(--surface-bg)] rounded-2xl shadow-lg border border-slate-200/10 dark:border-slate-800/10 space-y-3">
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-500" />
            Asset value by category
          </h2>
          <div className="space-y-2 text-[11px]">
            {snapshot.assetValueByCategory.map((row) => (
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
        </div>
      )}
    </>
  );
}