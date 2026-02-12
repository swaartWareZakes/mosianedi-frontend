"use client";

import React from "react";
import { useForecast } from "../hooks/useForecast";
import { TrendingUp, Clock, AlertTriangle, Droplets } from "lucide-react";

const BORDER = "border-[color:color-mix(in_oklab,var(--foreground)_14%,transparent)]";
const BORDER_SOFT = "border-[color:color-mix(in_oklab,var(--foreground)_10%,transparent)]";
const TEXT = "text-[var(--foreground)]";
const TEXT_MUTED = "text-[color:color-mix(in_oklab,var(--foreground)_60%,transparent)]";
const TEXT_SOFT = "text-[color:color-mix(in_oklab,var(--foreground)_45%,transparent)]";
const BG_WASH = "bg-[color:color-mix(in_oklab,var(--foreground)_5%,transparent)]";
const BG_WASH_2 = "bg-[color:color-mix(in_oklab,var(--foreground)_7%,transparent)]";

const INPUT =
  "p-1.5 text-sm border rounded outline-none transition " +
  "bg-[var(--surface-bg)] " +
  "border-[color:color-mix(in_oklab,var(--foreground)_14%,transparent)] " +
  "text-[var(--foreground)] " +
  "focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500";

export function ScenarioAssumptionsCard({ projectId }: { projectId: string }) {
  const { data, loading, saving, updateField } = useForecast(projectId);

  if (loading) {
    return (
      <div
        className={[
          "h-48 animate-pulse rounded-xl",
          "bg-[color:color-mix(in_oklab,var(--foreground)_6%,transparent)]",
        ].join(" ")}
      />
    );
  }

  if (!data) return null;

  const currentYear = new Date().getFullYear();
  const projectionEnd = currentYear + 1 + data.analysis_duration;

  return (
    <div className={["bg-[var(--surface-bg)] border rounded-xl shadow-sm overflow-hidden", BORDER].join(" ")}>
      {/* Header */}
      <div
        className={[
          "p-4 border-b flex justify-between items-center",
          BORDER,
          "bg-[color:color-mix(in_oklab,var(--foreground)_4%,transparent)]",
        ].join(" ")}
      >
        <div>
          <h3 className={["font-semibold flex items-center gap-2", TEXT].join(" ")}>
            <TrendingUp className="w-4 h-4 text-indigo-500" />
            Forecast Strategy
          </h3>
          <p className={["text-xs", TEXT_MUTED].join(" ")}>
            Define the variables for the 2027/28 projection.
          </p>
        </div>

        {saving && (
          <span className="text-[10px] text-indigo-500 animate-pulse font-medium">
            Saving...
          </span>
        )}
      </div>

      <div className="p-6 grid gap-8 md:grid-cols-3">
        {/* COL 1: ECONOMICS */}
        <div className="space-y-4">
          <h4 className={["text-xs font-bold uppercase tracking-wider mb-2", TEXT_SOFT].join(" ")}>
            Economic Reality
          </h4>

          <div className="space-y-1">
            <label className={["text-xs font-medium", TEXT_MUTED].join(" ")}>
              CPI Inflation
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={data.cpi_percentage}
                onChange={(e) => updateField("cpi_percentage", Number(e.target.value))}
                className={["w-20", INPUT].join(" ")}
              />
              <span className={["text-sm", TEXT_MUTED].join(" ")}>%</span>
            </div>
          </div>

          <div className="space-y-1">
            <label className={["text-xs font-medium", TEXT_MUTED].join(" ")}>
              Prev. Allocation
            </label>
            <div className="flex items-center gap-2">
              <span className={["text-sm", TEXT_MUTED].join(" ")}>R</span>
              <input
                type="number"
                value={data.previous_allocation}
                onChange={(e) => updateField("previous_allocation", Number(e.target.value))}
                className={["w-full", INPUT].join(" ")}
              />
            </div>
            <p className={["text-[10px]", TEXT_SOFT].join(" ")}>
              Used to calculate real budget growth/decline.
            </p>
          </div>
        </div>

        {/* COL 2: ENGINEERING */}
        <div className="space-y-4">
          <h4 className={["text-xs font-bold uppercase tracking-wider mb-2", TEXT_SOFT].join(" ")}>
            Engineering & Decay
          </h4>

          <div className="space-y-1">
            <label className={["text-xs font-medium flex items-center gap-1", TEXT_MUTED].join(" ")}>
              <AlertTriangle className="w-3 h-3 text-amber-500" /> Paved Deterioration
            </label>

            <div className={["flex rounded-lg p-1", BG_WASH_2, "border", BORDER_SOFT].join(" ")}>
              {(["Slow", "Medium", "Fast"] as const).map((opt) => {
                const active = data.paved_deterioration_rate === opt;
                return (
                  <button
                    key={opt}
                    onClick={() => updateField("paved_deterioration_rate", opt)}
                    className={[
                      "flex-1 text-xs py-1 rounded-md transition-all",
                      active
                        ? "bg-[var(--surface-bg)] shadow text-indigo-600 font-medium border"
                        : `${TEXT_MUTED} hover:${TEXT}`,
                      active ? BORDER_SOFT : "border-transparent",
                    ].join(" ")}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1">
            <label className={["text-xs font-medium flex items-center gap-1", TEXT_MUTED].join(" ")}>
              <Droplets className="w-3 h-3 text-blue-500" /> Gravel Loss Rate
            </label>

            <div className="flex items-center gap-2">
              <input
                type="number"
                value={data.gravel_loss_rate}
                onChange={(e) => updateField("gravel_loss_rate", Number(e.target.value))}
                className={["w-20", INPUT].join(" ")}
              />
              <span className={["text-xs", TEXT_MUTED].join(" ")}>mm / year</span>
            </div>
          </div>
        </div>

        {/* COL 3: TIME */}
        <div className="space-y-4">
          <h4 className={["text-xs font-bold uppercase tracking-wider mb-2", TEXT_SOFT].join(" ")}>
            Time Horizon
          </h4>

          <div
            className={[
              "rounded-lg p-4 text-center border",
              "bg-[color:color-mix(in_oklab,indigo_12%,transparent)]",
              "border-[color:color-mix(in_oklab,indigo_22%,transparent)]",
            ].join(" ")}
          >
            <Clock className="w-6 h-6 text-indigo-500 mx-auto mb-2" />

            <div className={["text-2xl font-bold", TEXT].join(" ")}>
              {data.analysis_duration}{" "}
              <span className={["text-sm font-medium", TEXT_MUTED].join(" ")}>
                Years
              </span>
            </div>

            <input
              type="range"
              min="1"
              max="50"
              value={data.analysis_duration}
              onChange={(e) => updateField("analysis_duration", Number(e.target.value))}
              className="w-full mt-3 accent-indigo-600 cursor-pointer"
            />

            <p className="text-[10px] mt-1 font-mono text-[color:color-mix(in_oklab,indigo_55%,transparent)]">
              Projection until {projectionEnd}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}