// app/(app)/dashboard/components/ScenarioImpactCard.tsx
"use client";

import React from "react";
import { BarChart3 } from "lucide-react";

type Props = {
  adjustedAssetValue: number | null;
};

export function ScenarioImpactCard({ adjustedAssetValue }: Props) {
  if (adjustedAssetValue == null) return null;

  return (
    <div className="p-6 bg-[var(--surface-bg)] rounded-2xl shadow-lg border border-slate-200/10 dark:border-slate-800/10 space-y-2">
      <h2 className="text-sm font-semibold flex items-center gap-2">
        <BarChart3 className="h-4 w-4 text-amber-500" />
        Scenario impact (rough illustrative)
      </h2>
      <p className="text-xs text-slate-500 dark:text-slate-400">
        This uses your live scenario controls on the right (analysis horizon +
        budget level) to estimate an indicative{" "}
        <span className="font-medium">lifetime investment envelope</span>. Later
        we’ll plug in full RONET logic.
      </p>
      <p className="text-lg font-semibold mt-1">
        R {(adjustedAssetValue / 1_000_000).toFixed(1)} m
      </p>
    </div>
  );
}