"use client";

import React, { useMemo } from "react";
import { Activity, Droplets, Map, Truck } from "lucide-react";
import type { ProposalData } from "../types";

function n(v: any) {
  const x = Number(v);
  return Number.isFinite(x) ? x : 0;
}

function fmt2(v: any) {
  return n(v).toLocaleString("en-ZA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function fuelLabel(v: any) {
  const x = Number(v);
  if (x === 1) return "Option 1";
  if (x === 2) return "Option 2";
  if (x === 3) return "Option 3";
  return `Option ${Number.isFinite(x) ? x : 1}`;
}

export function ProposalDataSummaryCard({
  proposal,
}: {
  proposal: ProposalData | null;
}) {
  if (!proposal) return null;

  const totals = useMemo(() => {
    const paved =
      n(proposal.paved_arid) +
      n(proposal.paved_semi_arid) +
      n(proposal.paved_dry_sub_humid) +
      n(proposal.paved_moist_sub_humid) +
      n(proposal.paved_humid);

    const gravel =
      n(proposal.gravel_arid) +
      n(proposal.gravel_semi_arid) +
      n(proposal.gravel_dry_sub_humid) +
      n(proposal.gravel_moist_sub_humid) +
      n(proposal.gravel_humid);

    return { paved, gravel, total: paved + gravel };
  }, [proposal]);

  return (
    <div className="flex flex-col gap-4">
        {/* 1. Hero Stat Card: Network Total */}
        <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-700 p-6 text-white shadow-lg">
            <div className="flex items-center gap-3 opacity-80 mb-2">
                <Map className="w-5 h-5" />
                <span className="text-xs font-semibold uppercase tracking-wider">Network Total</span>
            </div>
            <div className="text-4xl font-bold tracking-tight">
                {fmt2(totals.total)} <span className="text-lg font-medium opacity-60">km</span>
            </div>
            <div className="mt-4 flex gap-4 text-xs font-medium opacity-80">
                <div className="flex items-center gap-1.5 bg-white/10 px-2 py-1 rounded">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    Paved: {fmt2(totals.paved)}
                </div>
                <div className="flex items-center gap-1.5 bg-white/10 px-2 py-1 rounded">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    Gravel: {fmt2(totals.gravel)}
                </div>
            </div>
        </div>

        {/* 2. Details Card */}
        <div className="rounded-2xl bg-[var(--surface-bg)] shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-indigo-500" />
                    Latest Snapshot
                </h3>
                <div className="text-[10px] text-slate-400 uppercase tracking-wide font-medium">
                    {proposal.updated_at ? new Date(proposal.updated_at).toLocaleDateString() : "New"}
                </div>
            </div>

            <div className="p-2">
                <SummaryRow 
                    icon={<Truck className="w-3.5 h-3.5" />} 
                    label="Vehicle Km" 
                    value={fmt2(proposal.vehicle_km)} 
                />
                <SummaryRow 
                    icon={<span className="text-[10px] font-bold">%</span>} 
                    label="Veh/km Used" 
                    value={`${fmt2(proposal.pct_vehicle_km_used)}%`} 
                />
                <div className="h-px bg-slate-100 dark:bg-slate-800 my-1 mx-4" />
                <SummaryRow 
                    icon={<Droplets className="w-3.5 h-3.5" />} 
                    label="Fuel Sales" 
                    value={fmt2(proposal.fuel_sales)} 
                />
                <SummaryRow 
                    icon={<span className="text-[10px] font-bold">%</span>} 
                    label="Fuel Used" 
                    value={`${fmt2(proposal.pct_fuel_sales_used)}%`} 
                />
                 <div className="h-px bg-slate-100 dark:bg-slate-800 my-1 mx-4" />
                <SummaryRow 
                    label="Avg VCI" 
                    value={fmt2(proposal.avg_vci_used)} 
                    highlight 
                />
                 <SummaryRow 
                    label="Target VCI" 
                    value={fmt2(proposal.target_vci)} 
                    highlight 
                />
            </div>
        </div>
    </div>
  );
}

function SummaryRow({ label, value, icon, highlight }: { label: string; value: string; icon?: React.ReactNode, highlight?: boolean }) {
    return (
        <div className={`flex items-center justify-between px-4 py-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${highlight ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400'}`}>
            <div className="flex items-center gap-3">
                {icon && <span className="text-slate-400 dark:text-slate-600">{icon}</span>}
                <span className="text-xs font-medium">{label}</span>
            </div>
            <span className={`text-sm font-mono ${highlight ? 'font-bold' : 'font-medium text-slate-900 dark:text-slate-200'}`}>
                {value}
            </span>
        </div>
    );
}