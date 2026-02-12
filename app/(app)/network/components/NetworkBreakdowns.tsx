"use client";

import React from "react";
import { Layers, Coins } from "lucide-react";
import type { NetworkProfile } from "../../projects/[projectId]/config/hooks/useNetworkSnapshot";

type Props = {
  snapshot: NetworkProfile | null;
};

function fmtMoney(val: number) {
  if (val >= 1_000_000_000) return `R ${(val / 1_000_000_000).toFixed(1)} bn`;
  if (val >= 1_000_000) return `R ${(val / 1_000_000).toFixed(1)} m`;
  return `R ${val.toLocaleString()}`;
}

// Theme-stable helpers (no dark:* variants)
const BORDER = "border-[color:color-mix(in_oklab,var(--foreground)_14%,transparent)]";
const BORDER_SOFT = "border-[color:color-mix(in_oklab,var(--foreground)_10%,transparent)]";
const TEXT = "text-[var(--foreground)]";
const TEXT_MUTED = "text-[color:color-mix(in_oklab,var(--foreground)_60%,transparent)]";
const TEXT_SOFT = "text-[color:color-mix(in_oklab,var(--foreground)_45%,transparent)]";
const BG_TRACK = "bg-[color:color-mix(in_oklab,var(--foreground)_6%,transparent)]";

export function NetworkBreakdowns({ snapshot }: Props) {
  if (!snapshot) return null;

  const totalKm = snapshot.totalLengthKm || 1;

  // 1) Length Percentages
  const pavedPct = (snapshot.pavedLengthKm / totalKm) * 100;
  const gravelPct = (snapshot.gravelLengthKm / totalKm) * 100;

  // 2) Value split (visualization parity with backend)
  const estimatedPavedVal = snapshot.pavedLengthKm * 3_500_000;
  const estimatedGravelVal = snapshot.gravelLengthKm * 250_000;
  const totalEstVal = estimatedPavedVal + estimatedGravelVal || 1;

  const pavedValPct = (estimatedPavedVal / totalEstVal) * 100;
  const gravelValPct = (estimatedGravelVal / totalEstVal) * 100;

  return (
    <div className="space-y-6">
      {/* CARD 1: Surface Composition */}
      <div className={["p-6 bg-[var(--surface-bg)] rounded-2xl shadow-lg border space-y-4", BORDER].join(" ")}>
        <h2 className={["text-sm font-semibold flex items-center gap-2", TEXT].join(" ")}>
          <Layers className="h-4 w-4 text-indigo-500" />
          Network Composition
        </h2>

        {/* Visual Bar */}
        <div className={["h-2 w-full flex rounded-full overflow-hidden", BG_TRACK].join(" ")}>
          <div className="h-full bg-indigo-500" style={{ width: `${pavedPct}%` }} />
          <div className="h-full bg-amber-500" style={{ width: `${gravelPct}%` }} />
        </div>

        <div className="space-y-3 pt-2">
          {/* Paved Row */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                <span className={["font-medium", TEXT_MUTED].join(" ")}>Paved</span>
              </div>
              <span className={["font-mono", TEXT].join(" ")}>
                {snapshot.pavedLengthKm.toLocaleString()} km
              </span>
            </div>
            <div className={["text-[10px] pl-4", TEXT_SOFT].join(" ")}>
              {pavedPct.toFixed(1)}% of network length
            </div>
          </div>

          {/* Gravel Row */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span className={["font-medium", TEXT_MUTED].join(" ")}>Gravel</span>
              </div>
              <span className={["font-mono", TEXT].join(" ")}>
                {snapshot.gravelLengthKm.toLocaleString()} km
              </span>
            </div>
            <div className={["text-[10px] pl-4", TEXT_SOFT].join(" ")}>
              {gravelPct.toFixed(1)}% of network length
            </div>
          </div>
        </div>
      </div>

      {/* CARD 2: Asset Value Distribution */}
      <div className={["p-6 bg-[var(--surface-bg)] rounded-2xl shadow-lg border space-y-4", BORDER].join(" ")}>
        <h2 className={["text-sm font-semibold flex items-center gap-2", TEXT].join(" ")}>
          <Coins className="h-4 w-4 text-emerald-500" />
          Asset Value Distribution
        </h2>

        {/* Visual Bar */}
        <div className={["h-2 w-full flex rounded-full overflow-hidden", BG_TRACK].join(" ")}>
          <div className="h-full bg-emerald-500" style={{ width: `${pavedValPct}%` }} />
          <div className="h-full bg-amber-500/50" style={{ width: `${gravelValPct}%` }} />
        </div>

        <div className="space-y-3 pt-2">
          {/* Paved Value Row */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className={["font-medium", TEXT_MUTED].join(" ")}>Paved Assets</span>
              </div>
              <span className={["font-mono font-semibold", TEXT].join(" ")}>
                {fmtMoney(estimatedPavedVal)}
              </span>
            </div>
            <div className={["text-[10px] pl-4", TEXT_SOFT].join(" ")}>
              Holds {pavedValPct.toFixed(0)}% of total value
            </div>
          </div>

          {/* Gravel Value Row */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500/50" />
                <span className={["font-medium", TEXT_MUTED].join(" ")}>Gravel Assets</span>
              </div>
              <span className={["font-mono font-semibold", TEXT].join(" ")}>
                {fmtMoney(estimatedGravelVal)}
              </span>
            </div>
            <div className={["text-[10px] pl-4", TEXT_SOFT].join(" ")}>
              Holds {gravelValPct.toFixed(0)}% of total value
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}