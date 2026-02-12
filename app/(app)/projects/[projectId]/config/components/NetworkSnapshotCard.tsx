"use client";

import React from "react";
import { Activity, Coins, Layers, BarChart3, RefreshCw, Info } from "lucide-react";
import { useNetworkSnapshot } from "../hooks/useNetworkSnapshot";

// --- Helper Functions ---
function fmtCurrency(val: any) {
  const v = Number(val);
  if (!Number.isFinite(v)) return "R 0";
  if (v >= 1_000_000_000) return `R ${(v / 1_000_000_000).toFixed(1)} Billion`;
  if (v >= 1_000_000) return `R ${(v / 1_000_000).toFixed(1)} Million`;
  return `R ${v.toLocaleString()}`;
}

function fmtNum(val: any) {
  const v = Number(val);
  if (!Number.isFinite(v)) return "0";
  return v.toLocaleString("en-ZA", { maximumFractionDigits: 0 });
}

// Theme-stable helpers (no dark:* variants)
const BORDER = "border-[color:color-mix(in_oklab,var(--foreground)_14%,transparent)]";
const BORDER_SOFT = "border-[color:color-mix(in_oklab,var(--foreground)_10%,transparent)]";
const DIVIDE = "divide-[color:color-mix(in_oklab,var(--foreground)_10%,transparent)]";
const TEXT_MUTED = "text-[color:color-mix(in_oklab,var(--foreground)_60%,transparent)]";
const TEXT_SOFT = "text-[color:color-mix(in_oklab,var(--foreground)_45%,transparent)]";
const BG_TINT = "bg-[color:color-mix(in_oklab,var(--foreground)_4%,transparent)]";
const BG_TINT2 = "bg-[color:color-mix(in_oklab,var(--foreground)_6%,transparent)]";

export function NetworkSnapshotCard({ projectId }: { projectId: string }) {
  const { data, loading, refetch } = useNetworkSnapshot(projectId);

  // VCI Health Logic
  const vci = data?.avgVci || 0;
  let healthColor = "bg-rose-500";
  let healthText = "Critical";

  if (vci > 85) {
    healthColor = "bg-emerald-500";
    healthText = "Excellent";
  } else if (vci > 70) {
    healthColor = "bg-green-500";
    healthText = "Good";
  } else if (vci > 50) {
    healthColor = "bg-amber-500";
    healthText = "Fair";
  } else if (vci > 30) {
    healthColor = "bg-orange-500";
    healthText = "Poor";
  }

  const totalLength = data?.totalLengthKm || 0;
  const pavedLength = data?.pavedLengthKm || 0;
  const gravelLength = data?.gravelLengthKm || 0;
  const assetValue = data?.assetValue || 0;

  return (
    <div
      className={[
        "bg-[var(--surface-bg)] rounded-2xl shadow-lg border overflow-visible relative",
        BORDER,
      ].join(" ")}
    >
      {/* Header */}
      <div
        className={[
          "px-6 py-4 border-b flex justify-between items-center",
          BORDER_SOFT,
          BG_TINT,
        ].join(" ")}
      >
        <div>
          <h2 className="text-base font-bold text-[var(--foreground)] flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-500" />
            Asset Health Profile
          </h2>
          <p className={["text-xs", TEXT_MUTED].join(" ")}>
            Current Replacement Cost &amp; Condition
          </p>
        </div>

        <button
          onClick={refetch}
          disabled={loading}
          className={[
            "transition-colors",
            TEXT_SOFT,
            "hover:text-indigo-500",
          ].join(" ")}
          aria-label="Refresh snapshot"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {loading ? (
        <div className="p-8 flex justify-center">
          <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin" />
        </div>
      ) : !data || totalLength === 0 ? (
        <div className={["p-8 text-center text-sm", TEXT_SOFT].join(" ")}>
          No network data defined.
          <br />
          Start by entering inputs on the left.
        </div>
      ) : (
        <div className={["divide-y", DIVIDE].join(" ")}>
          {/* 1. HERO: ASSET VALUE (CRC) */}
          <div className="p-6">
            <div className="flex items-center gap-2 mb-1 relative">
              <Coins className={["w-4 h-4", TEXT_SOFT].join(" ")} />
              <span className={["text-xs font-bold uppercase tracking-wider", TEXT_MUTED].join(" ")}>
                Net Asset Value (CRC)
              </span>

              {/* Tooltip */}
              <div className="group relative ml-auto cursor-help">
                <Info
                  className={[
                    "w-4 h-4 transition-colors",
                    "text-[color:color-mix(in_oklab,var(--foreground)_30%,transparent)]",
                    "group-hover:text-indigo-500",
                  ].join(" ")}
                />
                <div
                  className={[
                    "absolute right-0 bottom-full mb-2 w-64 p-3 rounded-lg shadow-xl z-50",
                    "opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none",
                    "bg-[var(--surface-bg)] border",
                    BORDER,
                    "text-[10px]",
                    "text-[var(--foreground)]",
                  ].join(" ")}
                >
                  <strong className="text-indigo-500">Methodology:</strong>
                  <br />
                  (Paved km × R3.5m) + (Gravel km × R0.25m)
                  <span className={["mt-1 block italic", TEXT_SOFT].join(" ")}>
                    Based on COTO standard replacement rates.
                  </span>

                  {/* Arrow */}
                  <div
                    className={[
                      "absolute top-full right-1 -mt-1 w-2 h-2 rotate-45",
                      "bg-[var(--surface-bg)] border border-t-0 border-l-0",
                      BORDER,
                    ].join(" ")}
                  />
                </div>
              </div>
            </div>

            <div className="text-3xl font-black text-[var(--foreground)] tracking-tight">
              {fmtCurrency(assetValue)}
            </div>
            <p className={["text-xs mt-1", TEXT_SOFT].join(" ")}>
              Estimated replacement cost based on {fmtNum(totalLength)} km network.
            </p>
          </div>

          {/* 2. VCI GAUGE */}
          <div className="p-6">
            <div className="flex justify-between items-end mb-2 relative">
              <div className="flex items-center gap-2">
                <BarChart3 className={["w-4 h-4", TEXT_SOFT].join(" ")} />
                <span className={["text-xs font-bold uppercase tracking-wider", TEXT_MUTED].join(" ")}>
                  Network Condition (VCI)
                </span>

                {/* Tooltip */}
                <div className="group relative cursor-help">
                  <Info
                    className={[
                      "w-4 h-4 transition-colors",
                      "text-[color:color-mix(in_oklab,var(--foreground)_30%,transparent)]",
                      "group-hover:text-indigo-500",
                    ].join(" ")}
                  />
                  <div
                    className={[
                      "absolute left-0 bottom-full mb-2 w-64 p-3 rounded-lg shadow-xl z-50",
                      "opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none",
                      "bg-[var(--surface-bg)] border",
                      BORDER,
                      "text-[10px]",
                      "text-[var(--foreground)]",
                    ].join(" ")}
                  >
                    <strong className="text-indigo-500">Visual Condition Index:</strong>
                    <br />
                    0-30: Critical/Poor
                    <br />
                    30-50: Warning/Fair
                    <br />
                    50-85: Good
                    <br />
                    85+: Excellent
                    <br />
                    <span className={["mt-1 block italic", TEXT_SOFT].join(" ")}>
                      Calculated as weighted average of all segments.
                    </span>

                    {/* Arrow */}
                    <div
                      className={[
                        "absolute top-full left-1 -mt-1 w-2 h-2 rotate-45",
                        "bg-[var(--surface-bg)] border border-t-0 border-l-0",
                        BORDER,
                      ].join(" ")}
                    />
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="text-2xl font-bold text-[var(--foreground)]">
                  {vci.toFixed(1)}
                </span>
                <span className={["text-xs ml-1", TEXT_SOFT].join(" ")}>/ 100</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className={["h-3 w-full rounded-full overflow-hidden relative", BG_TINT2].join(" ")}>
              <div
                className={`h-full ${healthColor} transition-all duration-1000 ease-out`}
                style={{ width: `${Math.min(vci, 100)}%` }}
              />
            </div>

            <div className="flex justify-between mt-2 text-xs font-medium">
              <span className={TEXT_SOFT}>Critical</span>
              <span className={healthColor.replace("bg-", "text-")}>{healthText} Condition</span>
              <span className={TEXT_SOFT}>Perfect</span>
            </div>
          </div>

          {/* 3. ASSET MIX */}
          <div className={["p-6", BG_TINT].join(" ")}>
            <div className="flex items-center gap-2 mb-4">
              <Layers className={["w-4 h-4", TEXT_SOFT].join(" ")} />
              <span className={["text-xs font-bold uppercase tracking-wider", TEXT_MUTED].join(" ")}>
                Asset Composition
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* PAVED */}
              <div className={["p-3 rounded-xl border shadow-sm bg-[var(--surface-bg)]", BORDER_SOFT].join(" ")}>
                <div className={["text-xs mb-1", TEXT_SOFT].join(" ")}>Paved Network</div>
                <div className="text-lg font-bold text-[var(--foreground)]">
                  {fmtNum(pavedLength)}{" "}
                  <span className={["text-xs font-normal", TEXT_SOFT].join(" ")}>km</span>
                </div>
                <div className={["h-1 w-full mt-2 rounded-full overflow-hidden", BG_TINT2].join(" ")}>
                  <div
                    className="h-full bg-indigo-500"
                    style={{ width: `${totalLength > 0 ? (pavedLength / totalLength) * 100 : 0}%` }}
                  />
                </div>
              </div>

              {/* GRAVEL */}
              <div className={["p-3 rounded-xl border shadow-sm bg-[var(--surface-bg)]", BORDER_SOFT].join(" ")}>
                <div className={["text-xs mb-1", TEXT_SOFT].join(" ")}>Gravel Network</div>
                <div className="text-lg font-bold text-[var(--foreground)]">
                  {fmtNum(gravelLength)}{" "}
                  <span className={["text-xs font-normal", TEXT_SOFT].join(" ")}>km</span>
                </div>
                <div className={["h-1 w-full mt-2 rounded-full overflow-hidden", BG_TINT2].join(" ")}>
                  <div
                    className="h-full bg-amber-500"
                    style={{ width: `${totalLength > 0 ? (gravelLength / totalLength) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}