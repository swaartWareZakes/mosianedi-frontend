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

/**
 * Theme-stable helpers (no dark: variants)
 * Uses your CSS variables + color-mix so Mac/Windows render consistently.
 */
const BORDER = "border-[color:color-mix(in_oklab,var(--foreground)_14%,transparent)]";
const BORDER_SOFT = "border-[color:color-mix(in_oklab,var(--foreground)_10%,transparent)]";
const TEXT_MUTED = "text-[color:color-mix(in_oklab,var(--foreground)_60%,transparent)]";
const TEXT_SOFT = "text-[color:color-mix(in_oklab,var(--foreground)_45%,transparent)]";
const BG_SOFT = "bg-[color:color-mix(in_oklab,var(--foreground)_6%,transparent)]";
const BG_SOFT2 = "bg-[color:color-mix(in_oklab,var(--foreground)_4%,transparent)]";

/**
 * Inputs should follow theme variables, NOT slate + dark:
 * - bg: var(--input-bg)
 * - text: var(--input-text)
 * - border: mixed from foreground
 */
const INPUT_BASE =
  [
    "w-full rounded-md border text-right px-3 py-2 text-sm font-mono transition-all duration-200",
    "bg-[var(--input-bg)] text-[var(--input-text)]",
    BORDER,
    "placeholder:text-[color:color-mix(in_oklab,var(--foreground)_35%,transparent)]",
    "focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500",
  ].join(" ");

export function ProposalInputsCard({ proposal, saving, onSave }: Props) {
  const [dirty, setDirty] = useState(false);

  const [form, setForm] = useState<ProposalDataPatch>({
    paved_arid: 0,
    paved_semi_arid: 0,
    paved_dry_sub_humid: 0,
    paved_moist_sub_humid: 0,
    paved_humid: 0,
    gravel_arid: 0,
    gravel_semi_arid: 0,
    gravel_dry_sub_humid: 0,
    gravel_moist_sub_humid: 0,
    gravel_humid: 0,
    avg_vci_used: 0,
    vehicle_km: 0,
    pct_vehicle_km_used: 0,
    fuel_sales: 0,
    pct_fuel_sales_used: 0,
    fuel_option_selected: 1,
    target_vci: 45,
  });

  useEffect(() => {
    if (!proposal) return;
    setForm({
      paved_arid: proposal.paved_arid,
      paved_semi_arid: proposal.paved_semi_arid,
      paved_dry_sub_humid: proposal.paved_dry_sub_humid,
      paved_moist_sub_humid: proposal.paved_moist_sub_humid,
      paved_humid: proposal.paved_humid,
      gravel_arid: proposal.gravel_arid,
      gravel_semi_arid: proposal.gravel_semi_arid,
      gravel_dry_sub_humid: proposal.gravel_dry_sub_humid,
      gravel_moist_sub_humid: proposal.gravel_moist_sub_humid,
      gravel_humid: proposal.gravel_humid,
      avg_vci_used: proposal.avg_vci_used,
      vehicle_km: proposal.vehicle_km,
      pct_vehicle_km_used: proposal.pct_vehicle_km_used,
      fuel_sales: proposal.fuel_sales,
      pct_fuel_sales_used: proposal.pct_fuel_sales_used,
      fuel_option_selected: proposal.fuel_option_selected,
      target_vci: proposal.target_vci,
    });
    setDirty(false);
  }, [proposal]);

  const totals = useMemo(() => {
    const paved =
      n(form.paved_arid) +
      n(form.paved_semi_arid) +
      n(form.paved_dry_sub_humid) +
      n(form.paved_moist_sub_humid) +
      n(form.paved_humid);
    const gravel =
      n(form.gravel_arid) +
      n(form.gravel_semi_arid) +
      n(form.gravel_dry_sub_humid) +
      n(form.gravel_moist_sub_humid) +
      n(form.gravel_humid);
    return { paved, gravel, total: paved + gravel };
  }, [form]);

  const setField = (key: keyof ProposalDataPatch, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  };

  const handleSave = async () => {
    await onSave({
      ...form,
      paved_arid: n(form.paved_arid),
      paved_semi_arid: n(form.paved_semi_arid),
      paved_dry_sub_humid: n(form.paved_dry_sub_humid),
      paved_moist_sub_humid: n(form.paved_moist_sub_humid),
      paved_humid: n(form.paved_humid),
      gravel_arid: n(form.gravel_arid),
      gravel_semi_arid: n(form.gravel_semi_arid),
      gravel_dry_sub_humid: n(form.gravel_dry_sub_humid),
      gravel_moist_sub_humid: n(form.gravel_moist_sub_humid),
      gravel_humid: n(form.gravel_humid),
      avg_vci_used: n(form.avg_vci_used),
      vehicle_km: n(form.vehicle_km),
      pct_vehicle_km_used: n(form.pct_vehicle_km_used),
      fuel_sales: n(form.fuel_sales),
      pct_fuel_sales_used: n(form.pct_fuel_sales_used),
      fuel_option_selected: Number(form.fuel_option_selected ?? 1),
      target_vci: n(form.target_vci),
    });
    setDirty(false);
  };

  return (
    <div className={["rounded-2xl overflow-hidden shadow-sm border bg-[var(--surface-bg)]", BORDER].join(" ")}>
      {/* Header Bar */}
      <div className={["flex items-center justify-between px-6 py-4 border-b", BORDER_SOFT].join(" ")}>
        <div>
          <h2 className="text-base font-semibold text-[var(--foreground)]">Proposal Inputs</h2>
          <p className={["text-xs", TEXT_MUTED].join(" ")}>Enter base values per climate zone.</p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving || !dirty}
          className={[
            "inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold shadow-sm transition-all",
            dirty
              ? "bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-md hover:scale-105"
              : [BG_SOFT, TEXT_SOFT, "cursor-not-allowed"].join(" "),
          ].join(" ")}
        >
          {saving ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : dirty ? (
            <Save className="h-3.5 w-3.5" />
          ) : (
            <CheckCircle2 className="h-3.5 w-3.5" />
          )}
          {saving ? "Saving..." : dirty ? "Save Changes" : "Saved"}
        </button>
      </div>

      <div className="p-6 space-y-8">
        {/* NETWORK SPLIT SECTION */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* PAVED CARD */}
          <div className={["rounded-xl border p-5", BG_SOFT2, BORDER_SOFT].join(" ")}>
            <div className={["flex items-center justify-between mb-4 pb-2 border-b", BORDER_SOFT].join(" ")}>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <h3 className="text-sm font-semibold text-[var(--foreground)]">Paved</h3>
              </div>
              <span className={["text-xs font-mono font-medium px-2 py-1 rounded border", BG_SOFT, BORDER_SOFT, TEXT_MUTED].join(" ")}>
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
          <div className={["rounded-xl border p-5", BG_SOFT2, BORDER_SOFT].join(" ")}>
            <div className={["flex items-center justify-between mb-4 pb-2 border-b", BORDER_SOFT].join(" ")}>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <h3 className="text-sm font-semibold text-[var(--foreground)]">Gravel</h3>
              </div>
              <span className={["text-xs font-mono font-medium px-2 py-1 rounded border", BG_SOFT, BORDER_SOFT, TEXT_MUTED].join(" ")}>
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
          <h3 className={["text-xs font-bold uppercase tracking-wider mb-3 ml-1", TEXT_SOFT].join(" ")}>
            Key Indicators
          </h3>

          <div className={["rounded-xl border p-5 grid gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3", BG_SOFT2, BORDER].join(" ")}>
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
      <div className={["px-6 py-2 border-t flex justify-end", BG_SOFT2, BORDER_SOFT].join(" ")}>
        {dirty ? (
          <span className="text-[10px] text-amber-600 font-medium flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> Unsaved Changes
          </span>
        ) : (
          <span className={["text-[10px] font-medium flex items-center gap-1", TEXT_SOFT].join(" ")}>
            All changes saved
          </span>
        )}
      </div>
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
  unit,
}: {
  label: string;
  value: any;
  onChange: (v: number) => void;
  unit?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <label className={["text-xs font-medium whitespace-nowrap", TEXT_MUTED].join(" ")}>{label}</label>
      <div className="relative w-28 sm:w-32">
        <input
          type="number"
          inputMode="decimal"
          className={`${INPUT_BASE} ${unit ? "pr-8" : ""}`}
          value={value ?? 0}
          onFocus={(e) => e.target.select()}
          onChange={(e) => onChange(Number(e.target.value))}
        />
        {unit && (
          <span className={["absolute right-3 top-1/2 -translate-y-1/2 text-[10px] pointer-events-none", TEXT_SOFT].join(" ")}>
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { label: string; value: string }[];
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <label className={["text-xs font-medium", TEXT_MUTED].join(" ")}>{label}</label>
      <select className={`${INPUT_BASE} w-28 sm:w-32 cursor-pointer`} value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}