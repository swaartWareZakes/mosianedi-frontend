"use client";

import React from "react";
import { AlertTriangle, Map, TrendingUp, Coins, Activity } from "lucide-react";
import type { NetworkProfile } from "../../projects/[projectId]/config/hooks/useNetworkSnapshot";

// -------- System Tokens (no slate/dark) --------------------
const BG = "bg-[var(--background)]";
const SURFACE = "bg-[var(--surface-bg)]";
const TEXT = "text-[var(--foreground)]";
const MUTED = "text-[color:color-mix(in_oklab,var(--foreground)_60%,transparent)]";
const SOFT = "text-[color:color-mix(in_oklab,var(--foreground)_45%,transparent)]";
const FAINT = "text-[color:color-mix(in_oklab,var(--foreground)_30%,transparent)]";
const BORDER = "border-[color:color-mix(in_oklab,var(--foreground)_14%,transparent)]";
const BORDER_SOFT = "border-[color:color-mix(in_oklab,var(--foreground)_10%,transparent)]";
const WASH = "bg-[color:color-mix(in_oklab,var(--foreground)_6%,transparent)]";

// ---------- Types ------------------------------------------
type SummaryProps = {
  snapshot: NetworkProfile | null;
  loading: boolean;
  error: string | null;
};

// ---------- Helpers ----------------------------------------
function fmtCurrency(val: number) {
  if (!Number.isFinite(val)) return "R 0";
  if (val >= 1_000_000_000) return `R ${(val / 1_000_000_000).toFixed(1)} bn`;
  if (val >= 1_000_000) return `R ${(val / 1_000_000).toFixed(1)} m`;
  return `R ${val.toLocaleString()}`;
}

function fmtVehicleKm(val: any) {
  const v = Number(val);
  if (!Number.isFinite(v)) return "0.0";
  return (v / 1_000_000).toFixed(1);
}

export function NetworkSnapshotSummary({ snapshot, loading, error }: SummaryProps) {
  if (loading) {
    return (
      <div className={`h-28 flex items-center justify-center text-sm ${FAINT} ${WASH} rounded-2xl border border-dashed ${BORDER}`}>
        Loading network profile…
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-4 rounded-2xl border ${BORDER} ${SURFACE} shadow-sm`}>
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-rose-600/10 flex items-center justify-center text-rose-600 shrink-0">
            <AlertTriangle className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className={`text-xs font-bold ${TEXT}`}>Network snapshot failed</div>
            <div className={`text-[11px] ${MUTED} mt-0.5 leading-relaxed break-words`}>{error}</div>
          </div>
        </div>
      </div>
    );
  }

  if (!snapshot) return null;

  const vci = Number(snapshot.avgVci || 0);
  const vciBad = vci < 50;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Network */}
      <KpiCard
        icon={<Map className="w-4 h-4" />}
        title="Total Network"
        kicker={`${snapshot.pavedLengthKm.toLocaleString()} Paved • ${snapshot.gravelLengthKm.toLocaleString()} Gravel`}
      >
        <div className="text-2xl font-black tracking-tight">
          {snapshot.totalLengthKm.toLocaleString()}{" "}
          <span className={`text-xs font-medium ${SOFT}`}>km</span>
        </div>
      </KpiCard>

      {/* Asset Value */}
      <KpiCard
        icon={<Coins className="w-4 h-4 text-emerald-600" />}
        title="Asset Value"
        kicker="Current Replacement Cost"
      >
        <div className="text-2xl font-black tracking-tight text-emerald-600">
          {fmtCurrency(snapshot.assetValue)}
        </div>
      </KpiCard>

      {/* Condition (VCI) */}
      <KpiCard
        icon={<Activity className="w-4 h-4 text-indigo-600" />}
        title="Condition (VCI)"
        kicker={vciBad ? "Risk: backlog accelerating" : "Stable: within acceptable band"}
      >
        <div className="flex items-baseline gap-2">
          <div className="text-2xl font-black tracking-tight">{vci.toFixed(1)}</div>
          <span
            className={[
              "text-[9px] font-black px-2 py-1 rounded-full uppercase tracking-widest",
              vciBad ? "bg-rose-600/10 text-rose-700" : "bg-emerald-600/10 text-emerald-700",
            ].join(" ")}
          >
            {vciBad ? "POOR" : "FAIR/GOOD"}
          </span>
        </div>

        <div className={`w-full ${WASH} h-1.5 rounded-full mt-3 overflow-hidden border ${BORDER_SOFT}`}>
          <div
            className={`h-full ${vciBad ? "bg-rose-600" : "bg-emerald-600"}`}
            style={{ width: `${Math.min(vci, 100)}%` }}
          />
        </div>
      </KpiCard>

      {/* Traffic Load */}
      <KpiCard
        icon={<TrendingUp className="w-4 h-4 text-amber-600" />}
        title="Traffic Load"
        kicker="Annual Vehicle-km (Millions)"
      >
        <div className="text-2xl font-black tracking-tight">
          {fmtVehicleKm(snapshot.totalVehicleKm)}{" "}
          <span className={`text-xs font-medium ${SOFT}`}>m</span>
        </div>
      </KpiCard>
    </div>
  );
}

// ---------- Small internal card ----------------------------
function KpiCard({
  icon,
  title,
  kicker,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  kicker?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`rounded-2xl border ${BORDER} ${SURFACE} shadow-sm hover:shadow-md transition-shadow`}>
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className={`w-9 h-9 rounded-xl ${WASH} border ${BORDER_SOFT} flex items-center justify-center`}>
            {icon}
          </div>
          <div className="min-w-0">
            <div className={`text-[10px] font-black uppercase tracking-widest ${SOFT}`}>{title}</div>
            {kicker ? <div className={`text-[11px] ${FAINT} truncate`}>{kicker}</div> : null}
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}