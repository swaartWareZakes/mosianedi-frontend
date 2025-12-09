"use client";

import React from "react";
import { Map, RefreshCw, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNetworkSnapshot } from "../hooks/useNetworkSnapshot";

export function NetworkSnapshotCard({ projectId }: { projectId: string }) {
  const { snapshot, loading, error, refetch } = useNetworkSnapshot(projectId);

  return (
    <div className="p-6 bg-[var(--surface-bg)] rounded-2xl shadow-lg border border-slate-200/10 dark:border-slate-800/10 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Map className="h-5 w-5 text-sky-600 dark:text-sky-400" />
          Network Snapshot
        </h2>
        <button
          type="button"
          onClick={refetch}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 px-2.5 py-1 text-[11px] font-medium text-slate-600 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60 disabled:opacity-50"
        >
          <RefreshCw className={cn("h-3 w-3", loading && "animate-spin")} />
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {!loading && error && (
        <div className="flex items-start gap-2 text-xs text-red-500">
          <AlertTriangle className="h-4 w-4 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {!loading && !error && !snapshot && (
        <p className="text-xs text-slate-500 dark:text-slate-400">
          No snapshot available yet.
        </p>
      )}

      {!loading && snapshot && (
        <div className="space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-slate-50 dark:bg-slate-900/40 px-3 py-2.5">
              <p className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Total Network
              </p>
              <p className="mt-1 text-lg font-semibold">
                {snapshot.totalLengthKm.toLocaleString()} km
              </p>
              <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                Segments: {snapshot.totalSegments.toLocaleString()}
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 dark:bg-slate-900/40 px-3 py-2.5">
              <p className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Surface Mix
              </p>
              <p className="mt-1 text-sm font-medium">
                {snapshot.pavedLengthKm.toLocaleString()} paved
              </p>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                {snapshot.gravelLengthKm.toLocaleString()} gravel
              </p>
            </div>
          </div>
          {/* Condition Bars */}
          <div>
            <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400 mb-1">
              <span>Condition Split (Approx)</span>
              <span>Good / Fair / Poor</span>
            </div>
            <div className="h-2 flex rounded-full overflow-hidden w-full bg-slate-200 dark:bg-slate-800">
              <div
                className="bg-emerald-500"
                style={{ width: `${snapshot.goodConditionPct}%` }}
              />
              <div
                className="bg-amber-500"
                style={{ width: `${snapshot.fairConditionPct}%` }}
              />
              <div
                className="bg-rose-500"
                style={{ width: `${snapshot.poorConditionPct}%` }}
              />
            </div>
            <div className="mt-1 flex justify-between text-[10px] font-medium">
              <span className="text-emerald-600 dark:text-emerald-400">
                {snapshot.goodConditionPct.toFixed(0)}%
              </span>
              <span className="text-amber-600 dark:text-amber-400">
                {snapshot.fairConditionPct.toFixed(0)}%
              </span>
              <span className="text-rose-600 dark:text-rose-400">
                {snapshot.poorConditionPct.toFixed(0)}%
              </span>
            </div>
          </div>

          <p className="text-[10px] text-slate-500 dark:text-slate-500">
            Snapshot calculated at{" "}
            <span className="font-mono">
              {snapshot.calculatedAt
                ? new Date(snapshot.calculatedAt).toLocaleString("en-ZA")
                : "Unknown"}
            </span>
          </p>
        </div>
      )}
    </div>
  );
}