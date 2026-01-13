"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Loader2, Save, AlertCircle, CheckCircle2 } from "lucide-react";
import type { ProposalData, ProposalDataPatch } from "../types";

type Props = {
  proposal: ProposalData | null;
  saving: boolean;
  onSave: (patch: ProposalDataPatch) => Promise<void> | void;
};

function n(v: any) {
  const x = Number(v);
  return Number.isFinite(x) ? x : 0;
}

// Cleaner Input Style with transition
const INPUT_BASE =
  "w-full rounded-md border text-right px-3 py-2 text-sm font-mono transition-all duration-200 " +
  "bg-white text-slate-900 border-slate-200 " +
  "placeholder:text-slate-300 " +
  "focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 " +
  "dark:bg-slate-950/50 dark:text-slate-100 dark:border-slate-800 " +
  "dark:placeholder:text-slate-600";

export function ProposalInputsCard({ proposal, saving, onSave }: Props) {
  const [dirty, setDirty] = useState(false);

  // Local form state
  const [form, setForm] = useState<ProposalDataPatch>({
    paved_arid: 0, paved_semi_arid: 0, paved_dry_sub_humid: 0, paved_moist_sub_humid: 0, paved_humid: 0,
    gravel_arid: 0, gravel_semi_arid: 0, gravel_dry_sub_humid: 0, gravel_moist_sub_humid: 0, gravel_humid: 0,
    avg_vci_used: 0, vehicle_km: 0, pct_vehicle_km_used: 0, fuel_sales: 0, pct_fuel_sales_used: 0, fuel_option_selected: 1, target_vci: 45,
  });

  useEffect(() => {
    if (!proposal) return;
    setForm({
      paved_arid: proposal.paved_arid, paved_semi_arid: proposal.paved_semi_arid, paved_dry_sub_humid: proposal.paved_dry_sub_humid, paved_moist_sub_humid: proposal.paved_moist_sub_humid, paved_humid: proposal.paved_humid,
      gravel_arid: proposal.gravel_arid, gravel_semi_arid: proposal.gravel_semi_arid, gravel_dry_sub_humid: proposal.gravel_dry_sub_humid, gravel_moist_sub_humid: proposal.gravel_moist_sub_humid, gravel_humid: proposal.gravel_humid,
      avg_vci_used: proposal.avg_vci_used, vehicle_km: proposal.vehicle_km, pct_vehicle_km_used: proposal.pct_vehicle_km_used, fuel_sales: proposal.fuel_sales, pct_fuel_sales_used: proposal.pct_fuel_sales_used, fuel_option_selected: proposal.fuel_option_selected, target_vci: proposal.target_vci,
    });
    setDirty(false);
  }, [proposal]);

  const totals = useMemo(() => {
    const paved = n(form.paved_arid) + n(form.paved_semi_arid) + n(form.paved_dry_sub_humid) + n(form.paved_moist_sub_humid) + n(form.paved_humid);
    const gravel = n(form.gravel_arid) + n(form.gravel_semi_arid) + n(form.gravel_dry_sub_humid) + n(form.gravel_moist_sub_humid) + n(form.gravel_humid);
    return { paved, gravel, total: paved + gravel };
  }, [form]);

  const setField = (key: keyof ProposalDataPatch, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  };

  const handleSave = async () => {
    await onSave({
      ...form,
      // Ensure numbers are sanitized before sending
      paved_arid: n(form.paved_arid), paved_semi_arid: n(form.paved_semi_arid), paved_dry_sub_humid: n(form.paved_dry_sub_humid), paved_moist_sub_humid: n(form.paved_moist_sub_humid), paved_humid: n(form.paved_humid),
      gravel_arid: n(form.gravel_arid), gravel_semi_arid: n(form.gravel_semi_arid), gravel_dry_sub_humid: n(form.gravel_dry_sub_humid), gravel_moist_sub_humid: n(form.gravel_moist_sub_humid), gravel_humid: n(form.gravel_humid),
      avg_vci_used: n(form.avg_vci_used), vehicle_km: n(form.vehicle_km), pct_vehicle_km_used: n(form.pct_vehicle_km_used), fuel_sales: n(form.fuel_sales), pct_fuel_sales_used: n(form.pct_fuel_sales_used), fuel_option_selected: Number(form.fuel_option_selected ?? 1), target_vci: n(form.target_vci),
    });
    setDirty(false);
  };

  return (
    <div className="rounded-2xl bg-[var(--surface-bg)] shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
      
      {/* Header Bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Proposal Inputs</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Enter base values per climate zone.</p>
        </div>
        
        <button
          onClick={handleSave}
          disabled={saving || !dirty}
          className={`
            inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold shadow-sm transition-all
            ${dirty 
                ? 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-md hover:scale-105' 
                : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-600 cursor-not-allowed'
            }
          `}
        >
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : dirty ? <Save className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5"/>}
          {saving ? "Saving..." : dirty ? "Save Changes" : "Saved"}
        </button>
      </div>

      <div className="p-6 space-y-8">
        
        {/* NETWORK SPLIT SECTION */}
        <div className="grid lg:grid-cols-2 gap-6">
            
            {/* PAVED CARD */}
            <div className="bg-slate-50/50 dark:bg-slate-900/30 rounded-xl border border-slate-200/50 dark:border-slate-800/50 p-5">
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200/50 dark:border-slate-800/50">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Paved</h3>
                    </div>
                    <span className="text-xs font-mono font-medium bg-white dark:bg-slate-950 px-2 py-1 rounded border border-slate-200 dark:border-slate-800">
                        Total: {totals.paved.toFixed(2)} km
                    </span>
                </div>
                <div className="space-y-3">
                    <NumberField label="Arid" value={form.paved_arid} onChange={(v) => setField("paved_arid", v)} unit="km" />
                    <NumberField label="Semi-arid" value={form.paved_semi_arid} onChange={(v) => setField("paved_semi_arid", v)} unit="km" />
                    <NumberField label="Dry sub-humid" value={form.paved_dry_sub_humid} onChange={(v) => setField("paved_dry_sub_humid", v)} unit="km" />
                    <NumberField label="Moist sub-humid" value={form.paved_moist_sub_humid} onChange={(v) => setField("paved_moist_sub_humid", v)} unit="km" />
                    <NumberField label="Humid" value={form.paved_humid} onChange={(v) => setField("paved_humid", v)} unit="km" />
                </div>
            </div>

            {/* GRAVEL CARD */}
            <div className="bg-slate-50/50 dark:bg-slate-900/30 rounded-xl border border-slate-200/50 dark:border-slate-800/50 p-5">
                 <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200/50 dark:border-slate-800/50">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Gravel</h3>
                    </div>
                    <span className="text-xs font-mono font-medium bg-white dark:bg-slate-950 px-2 py-1 rounded border border-slate-200 dark:border-slate-800">
                        Total: {totals.gravel.toFixed(2)} km
                    </span>
                </div>
                <div className="space-y-3">
                    <NumberField label="Arid" value={form.gravel_arid} onChange={(v) => setField("gravel_arid", v)} unit="km" />
                    <NumberField label="Semi-arid" value={form.gravel_semi_arid} onChange={(v) => setField("gravel_semi_arid", v)} unit="km" />
                    <NumberField label="Dry sub-humid" value={form.gravel_dry_sub_humid} onChange={(v) => setField("gravel_dry_sub_humid", v)} unit="km" />
                    <NumberField label="Moist sub-humid" value={form.gravel_moist_sub_humid} onChange={(v) => setField("gravel_moist_sub_humid", v)} unit="km" />
                    <NumberField label="Humid" value={form.gravel_humid} onChange={(v) => setField("gravel_humid", v)} unit="km" />
                </div>
            </div>
        </div>

        {/* INDICATORS SECTION */}
        <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 ml-1">Key Indicators</h3>
            <div className="bg-white dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-slate-800 p-5 grid gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
                <NumberField label="Avg VCI used" value={form.avg_vci_used} onChange={(v) => setField("avg_vci_used", v)} />
                <NumberField label="Vehicle-km" value={form.vehicle_km} onChange={(v) => setField("vehicle_km", v)} unit="km" />
                <NumberField label="% vehicle-km used" value={form.pct_vehicle_km_used} onChange={(v) => setField("pct_vehicle_km_used", v)} unit="%" />
                <NumberField label="Fuel sales" value={form.fuel_sales} onChange={(v) => setField("fuel_sales", v)} unit="L" />
                <NumberField label="% fuel sales used" value={form.pct_fuel_sales_used} onChange={(v) => setField("pct_fuel_sales_used", v)} unit="%" />
                
                <SelectField
                label="Fuel option selected"
                value={String(form.fuel_option_selected ?? 1)}
                onChange={(v) => setField("fuel_option_selected", Number(v))}
                options={[
                    { label: "Option 1", value: "1" },
                    { label: "Option 2", value: "2" },
                    { label: "Option 3", value: "3" },
                ]}
                />

                <NumberField label="Target VCI" value={form.target_vci} onChange={(v) => setField("target_vci", v)} />
            </div>
        </div>
      </div>
      
      {/* Footer Status Bar */}
      <div className="bg-slate-50 dark:bg-slate-900/50 px-6 py-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          {dirty ? (
             <span className="text-[10px] text-amber-600 dark:text-amber-500 font-medium flex items-center gap-1">
                <AlertCircle className="w-3 h-3"/> Unsaved Changes
             </span>
          ) : (
            <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                All changes saved
             </span>
          )}
      </div>
    </div>
  );
}

function NumberField({ label, value, onChange, unit }: { label: string; value: any; onChange: (v: number) => void; unit?: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <label className="text-xs font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">
        {label}
      </label>
      <div className="relative w-28 sm:w-32">
        <input
          type="number"
          inputMode="decimal"
          className={`${INPUT_BASE} ${unit ? 'pr-8' : ''}`} // Make room for unit
          value={value ?? 0}
          onFocus={(e) => e.target.select()} // Auto-select on click
          onChange={(e) => onChange(Number(e.target.value))}
        />
        {unit && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 pointer-events-none">
                {unit}
            </span>
        )}
      </div>
    </div>
  );
}

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { label: string; value: string }[] }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <label className="text-xs font-medium text-slate-500 dark:text-slate-400">
        {label}
      </label>
      <select
        className={`${INPUT_BASE} w-28 sm:w-32 cursor-pointer`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}