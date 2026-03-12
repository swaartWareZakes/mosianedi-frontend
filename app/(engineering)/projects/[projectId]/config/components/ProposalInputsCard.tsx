"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Loader2, Save, AlertCircle, CheckCircle2, Route as RouteIcon, EyeOff } from "lucide-react";
import type { ProposalData, ProposalDataPatch } from "../types";
import type { ProjectMeta } from "../hooks/useProjectMeta";
import { cn } from "@/lib/utils";

type Props = {
  proposal: ProposalData | null;
  projectMeta?: ProjectMeta | null; 
  saving: boolean;
  onSave: (patch: ProposalDataPatch) => Promise<void> | void;
  readOnly?: boolean; // <--- ADDED PROP
};

function n(v: any) {
  const x = Number(v);
  return Number.isFinite(x) ? x : 0;
}

const BORDER = "border-[color:color-mix(in_oklab,var(--foreground)_14%,transparent)]";
const BORDER_SOFT = "border-[color:color-mix(in_oklab,var(--foreground)_10%,transparent)]";
const TEXT_MUTED = "text-[color:color-mix(in_oklab,var(--foreground)_60%,transparent)]";
const TEXT_SOFT = "text-[color:color-mix(in_oklab,var(--foreground)_45%,transparent)]";
const BG_SOFT = "bg-[color:color-mix(in_oklab,var(--foreground)_6%,transparent)]";
const BG_SOFT2 = "bg-[color:color-mix(in_oklab,var(--foreground)_4%,transparent)]";

export function ProposalInputsCard({ proposal, projectMeta, saving, onSave, readOnly = false }: Props) {
  const [dirty, setDirty] = useState(false);
  
  const isRoute = projectMeta?.scope === 'route';

  const [form, setForm] = useState<ProposalDataPatch>({
    paved_arid: 0, paved_semi_arid: 0, paved_dry_sub_humid: 0, paved_moist_sub_humid: 0, paved_humid: 0,
    gravel_arid: 0, gravel_semi_arid: 0, gravel_dry_sub_humid: 0, gravel_moist_sub_humid: 0, gravel_humid: 0,
    avg_vci_used: 0, vehicle_km: 0, pct_vehicle_km_used: 0, fuel_sales: 0, pct_fuel_sales_used: 0,
    fuel_option_selected: 1, target_vci: 45,
  });

  useEffect(() => {
    if (!proposal) return;
    setForm({
      paved_arid: proposal.paved_arid, paved_semi_arid: proposal.paved_semi_arid,
      paved_dry_sub_humid: proposal.paved_dry_sub_humid, paved_moist_sub_humid: proposal.paved_moist_sub_humid, paved_humid: proposal.paved_humid,
      gravel_arid: proposal.gravel_arid, gravel_semi_arid: proposal.gravel_semi_arid,
      gravel_dry_sub_humid: proposal.gravel_dry_sub_humid, gravel_moist_sub_humid: proposal.gravel_moist_sub_humid, gravel_humid: proposal.gravel_humid,
      avg_vci_used: proposal.avg_vci_used, vehicle_km: proposal.vehicle_km,
      pct_vehicle_km_used: proposal.pct_vehicle_km_used, fuel_sales: proposal.fuel_sales,
      pct_fuel_sales_used: proposal.pct_fuel_sales_used, fuel_option_selected: proposal.fuel_option_selected,
      target_vci: proposal.target_vci,
    });
    setDirty(false);
  }, [proposal]);

  const totals = useMemo(() => {
    const paved = n(form.paved_arid) + n(form.paved_semi_arid) + n(form.paved_dry_sub_humid) + n(form.paved_moist_sub_humid) + n(form.paved_humid);
    const gravel = n(form.gravel_arid) + n(form.gravel_semi_arid) + n(form.gravel_dry_sub_humid) + n(form.gravel_moist_sub_humid) + n(form.gravel_humid);
    return { paved, gravel, total: paved + gravel };
  }, [form]);

  const setField = (key: keyof ProposalDataPatch, value: any) => {
    if (readOnly) return; // Block changes if readOnly
    setForm((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  };

  const handleSave = async () => {
    if (readOnly) return;
    await onSave({
      ...form,
      paved_arid: n(form.paved_arid), paved_semi_arid: n(form.paved_semi_arid),
      paved_dry_sub_humid: n(form.paved_dry_sub_humid), paved_moist_sub_humid: n(form.paved_moist_sub_humid), paved_humid: n(form.paved_humid),
      gravel_arid: n(form.gravel_arid), gravel_semi_arid: n(form.gravel_semi_arid),
      gravel_dry_sub_humid: n(form.gravel_dry_sub_humid), gravel_moist_sub_humid: n(form.gravel_moist_sub_humid), gravel_humid: n(form.gravel_humid),
      avg_vci_used: n(form.avg_vci_used), vehicle_km: n(form.vehicle_km),
      pct_vehicle_km_used: n(form.pct_vehicle_km_used), fuel_sales: n(form.fuel_sales),
      pct_fuel_sales_used: n(form.pct_fuel_sales_used), fuel_option_selected: Number(form.fuel_option_selected ?? 1),
      target_vci: n(form.target_vci),
    });
    setDirty(false);
  };

  return (
    <div className={cn("rounded-2xl overflow-hidden shadow-sm border bg-[var(--surface-bg)]", BORDER, readOnly && "opacity-90")}>
      {/* Header Bar */}
      <div className={cn("flex items-center justify-between px-6 py-4 border-b", BORDER_SOFT)}>
        <div>
          <h2 className="text-base font-semibold text-[var(--foreground)]">Proposal Inputs</h2>
          <p className={cn("text-xs", TEXT_MUTED)}>
            {isRoute ? "Define specific conditions for this route." : "Enter base values per climate zone."}
          </p>
        </div>

        {/* Hide Save button if Read Only */}
        {!readOnly ? (
            <button
            onClick={handleSave}
            disabled={saving || !dirty}
            className={cn(
                "inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold shadow-sm transition-all",
                dirty ? "bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-md hover:scale-105" : cn(BG_SOFT, TEXT_SOFT, "cursor-not-allowed")
            )}
            >
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : dirty ? <Save className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
            {saving ? "Saving..." : dirty ? "Save Changes" : "Saved"}
            </button>
        ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800/50">
               <EyeOff className="w-3.5 h-3.5" /> View Only
            </div>
        )}
      </div>

      <div className={cn("p-6 space-y-8", readOnly && "pointer-events-none")}>
        
        {/* CONDITIONAL RENDER: Route Summary vs Matrix Grid */}
        {isRoute ? (
            <div className={cn("rounded-xl border p-6 bg-indigo-50/30 dark:bg-indigo-950/10 border-indigo-100 dark:border-indigo-900/50", BORDER_SOFT)}>
                <div className="flex items-center gap-2 mb-5">
                    <RouteIcon className="w-5 h-5 text-indigo-500" />
                    <h3 className="text-base font-bold text-indigo-900 dark:text-indigo-400">Linear Asset Locked Parameters</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div>
                        <span className={cn("block text-[10px] uppercase font-bold mb-1", TEXT_MUTED)}>Route Designation</span>
                        <span className="text-sm font-medium text-[var(--foreground)]">{projectMeta?.route_name || "N/A"}</span>
                    </div>
                    <div>
                        <span className={cn("block text-[10px] uppercase font-bold mb-1", TEXT_MUTED)}>Total Length</span>
                        <span className="text-sm font-mono font-medium text-[var(--foreground)]">{projectMeta?.route_length_km || 0} km</span>
                    </div>
                    <div>
                        <span className={cn("block text-[10px] uppercase font-bold mb-1", TEXT_MUTED)}>Surface Type</span>
                        <span className="text-sm font-medium capitalize text-[var(--foreground)]">{projectMeta?.surface_type || "N/A"}</span>
                    </div>
                    <div>
                        <span className={cn("block text-[10px] uppercase font-bold mb-1", TEXT_MUTED)}>Climate Zone</span>
                        <span className="text-sm font-medium capitalize text-[var(--foreground)]">{(projectMeta?.climate_zone || "N/A").replace(/_/g, " ")}</span>
                    </div>
                </div>
            </div>
        ) : (
            <div className="grid lg:grid-cols-2 gap-6">
                {/* PAVED CARD */}
                <div className={cn("rounded-xl border p-5", BG_SOFT2, BORDER_SOFT)}>
                    <div className={cn("flex items-center justify-between mb-4 pb-2 border-b", BORDER_SOFT)}>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        <h3 className="text-sm font-semibold text-[var(--foreground)]">Paved</h3>
                    </div>
                    <span className={cn("text-xs font-mono font-medium px-2 py-1 rounded border", BG_SOFT, BORDER_SOFT, TEXT_MUTED)}>
                        Total: {totals.paved.toFixed(2)} km
                    </span>
                    </div>

                    <div className="space-y-3">
                    <NumberField label="Arid" value={form.paved_arid} onChange={(v) => setField("paved_arid", v)} unit="km" disabled={readOnly} />
                    <NumberField label="Semi-arid" value={form.paved_semi_arid} onChange={(v) => setField("paved_semi_arid", v)} unit="km" disabled={readOnly} />
                    <NumberField label="Dry sub-humid" value={form.paved_dry_sub_humid} onChange={(v) => setField("paved_dry_sub_humid", v)} unit="km" disabled={readOnly} />
                    <NumberField label="Moist sub-humid" value={form.paved_moist_sub_humid} onChange={(v) => setField("paved_moist_sub_humid", v)} unit="km" disabled={readOnly} />
                    <NumberField label="Humid" value={form.paved_humid} onChange={(v) => setField("paved_humid", v)} unit="km" disabled={readOnly} />
                    </div>
                </div>

                {/* GRAVEL CARD */}
                <div className={cn("rounded-xl border p-5", BG_SOFT2, BORDER_SOFT)}>
                    <div className={cn("flex items-center justify-between mb-4 pb-2 border-b", BORDER_SOFT)}>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-400" />
                        <h3 className="text-sm font-semibold text-[var(--foreground)]">Gravel</h3>
                    </div>
                    <span className={cn("text-xs font-mono font-medium px-2 py-1 rounded border", BG_SOFT, BORDER_SOFT, TEXT_MUTED)}>
                        Total: {totals.gravel.toFixed(2)} km
                    </span>
                    </div>

                    <div className="space-y-3">
                    <NumberField label="Arid" value={form.gravel_arid} onChange={(v) => setField("gravel_arid", v)} unit="km" disabled={readOnly} />
                    <NumberField label="Semi-arid" value={form.gravel_semi_arid} onChange={(v) => setField("gravel_semi_arid", v)} unit="km" disabled={readOnly} />
                    <NumberField label="Dry sub-humid" value={form.gravel_dry_sub_humid} onChange={(v) => setField("gravel_dry_sub_humid", v)} unit="km" disabled={readOnly} />
                    <NumberField label="Moist sub-humid" value={form.gravel_moist_sub_humid} onChange={(v) => setField("gravel_moist_sub_humid", v)} unit="km" disabled={readOnly} />
                    <NumberField label="Humid" value={form.gravel_humid} onChange={(v) => setField("gravel_humid", v)} unit="km" disabled={readOnly} />
                    </div>
                </div>
            </div>
        )}

        {/* INDICATORS SECTION (Applies to both) */}
        <div>
          <h3 className={cn("text-xs font-bold uppercase tracking-wider mb-3 ml-1", TEXT_SOFT)}>
            {isRoute ? "Route Conditions" : "Key Indicators"}
          </h3>

          <div className={cn("rounded-xl border p-5 grid gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3", BG_SOFT2, BORDER)}>
            <NumberField label={isRoute ? "Specific VCI" : "Avg VCI used"} value={form.avg_vci_used} onChange={(v) => setField("avg_vci_used", v)} disabled={readOnly} />
            <NumberField label={isRoute ? "Daily Traffic (Veh-km)" : "Vehicle-km"} value={form.vehicle_km} onChange={(v) => setField("vehicle_km", v)} unit="km" disabled={readOnly} />
            
            {!isRoute && (
               <NumberField label="% vehicle-km used" value={form.pct_vehicle_km_used} onChange={(v) => setField("pct_vehicle_km_used", v)} unit="%" disabled={readOnly} />
            )}
            
            <NumberField label="Fuel sales" value={form.fuel_sales} onChange={(v) => setField("fuel_sales", v)} unit="L" disabled={readOnly} />
            
            {!isRoute && (
               <NumberField label="% fuel sales used" value={form.pct_fuel_sales_used} onChange={(v) => setField("pct_fuel_sales_used", v)} unit="%" disabled={readOnly} />
            )}

            <SelectField
              label="Fuel option selected"
              value={String(form.fuel_option_selected ?? 1)}
              onChange={(v) => setField("fuel_option_selected", Number(v))}
              disabled={readOnly}
              options={[{ label: "Option 1", value: "1" }, { label: "Option 2", value: "2" }, { label: "Option 3", value: "3" }]}
            />

            <NumberField label="Target VCI" value={form.target_vci} onChange={(v) => setField("target_vci", v)} disabled={readOnly} />
          </div>
        </div>
      </div>

      {/* Footer Status Bar - Hide if Read Only */}
      {!readOnly && (
        <div className={cn("px-6 py-2 border-t flex justify-end", BG_SOFT2, BORDER_SOFT)}>
          {dirty ? (
            <span className="text-[10px] text-amber-600 font-medium flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> Unsaved Changes
            </span>
          ) : (
            <span className={cn("text-[10px] font-medium flex items-center gap-1", TEXT_SOFT)}>
              All changes saved
            </span>
          )}
        </div>
      )}
    </div>
  );
}

const INPUT_BASE =
  "w-full rounded-md border text-right px-3 py-2 text-sm font-mono transition-all duration-200 bg-[var(--input-bg)] text-[var(--input-text)] border-[color:color-mix(in_oklab,var(--foreground)_14%,transparent)] placeholder:text-[color:color-mix(in_oklab,var(--foreground)_35%,transparent)] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-[color:color-mix(in_oklab,var(--foreground)_4%,transparent)]";

function NumberField({ label, value, onChange, unit, disabled }: { label: string; value: any; onChange: (v: number) => void; unit?: string; disabled?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <label className={cn("text-xs font-medium whitespace-nowrap", TEXT_MUTED)}>{label}</label>
      <div className="relative w-28 sm:w-32">
        <input 
          type="number" 
          inputMode="decimal" 
          className={cn(INPUT_BASE, unit ? "pr-8" : "")} 
          value={value ?? 0} 
          onFocus={(e) => !disabled && e.target.select()} 
          onChange={(e) => onChange(Number(e.target.value))} 
          disabled={disabled}
        />
        {unit && <span className={cn("absolute right-3 top-1/2 -translate-y-1/2 text-[10px] pointer-events-none", TEXT_SOFT)}>{unit}</span>}
      </div>
    </div>
  );
}

function SelectField({ label, value, onChange, options, disabled }: { label: string; value: string; onChange: (v: string) => void; options: { label: string; value: string }[]; disabled?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <label className={cn("text-xs font-medium", TEXT_MUTED)}>{label}</label>
      <select 
         className={cn(INPUT_BASE, "w-28 sm:w-32", !disabled && "cursor-pointer")} 
         value={value} 
         onChange={(e) => onChange(e.target.value)}
         disabled={disabled}
      >
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}