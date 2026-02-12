"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Send,
  FileCheck,
  Building,
  Check,
  Loader2,
  AlertTriangle,
  TrendingUp,
  BrainCircuit,
  Lock,
  Stamp,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useReportData } from "../hooks/useReportData";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { supabase } from "@/lib/supabaseClient";

type SubmissionStatus = "draft" | "submitting" | "submitted";

export default function DecisionMakerViewPage() {
  // 1) Submission State
  const [status, setStatus] = useState<SubmissionStatus>("draft");
  const [refNumber, setRefNumber] = useState<string | null>(null);

  // 2) Project Context
  const [projects, setProjects] = useState<any[]>([]);
  const [projectId, setProjectId] = useState<string | null>(null);

  // ---- Theme-safe tokens (NO dark: classes) ----------------
  const TOKENS = useMemo(() => {
    const BG = "bg-[var(--background)]";
    const SURFACE = "bg-[var(--surface-bg)]";
    const TEXT = "text-[var(--foreground)]";

    const SOFT = "text-[color:color-mix(in_oklab,var(--foreground)_55%,transparent)]";
    const MUTED = "text-[color:color-mix(in_oklab,var(--foreground)_40%,transparent)]";
    const BORDER = "border-[color:color-mix(in_oklab,var(--foreground)_14%,transparent)]";
    const BORDER_SOFT = "border-[color:color-mix(in_oklab,var(--foreground)_10%,transparent)]";
    const SUBTLE_BG = "bg-[color:color-mix(in_oklab,var(--surface-bg)_85%,transparent)]";
    const PANEL = "bg-[color:color-mix(in_oklab,var(--surface-bg)_92%,transparent)]";

    return { BG, SURFACE, TEXT, SOFT, MUTED, BORDER, BORDER_SOFT, SUBTLE_BG, PANEL };
  }, []);

  // ---- Tooltip style that respects light/dark via CSS vars ---
  // IMPORTANT: This hook must run BEFORE any conditional returns.
  const tooltipStyle = useMemo(() => {
    return {
      backgroundColor: "color-mix(in oklab, var(--surface-bg) 92%, transparent)",
      border: "1px solid color-mix(in oklab, var(--foreground) 14%, transparent)",
      borderRadius: "14px",
      color: "var(--foreground)",
      fontSize: 12,
      boxShadow: "0 10px 30px rgba(0,0,0,0.18)",
      backdropFilter: "blur(10px)",
    } as React.CSSProperties;
  }, []);

  // Load Project List
  useEffect(() => {
    const fetchProjects = async () => {
      const { data } = await supabase
        .from("projects")
        .select("id, project_name, province")
        .order("updated_at", { ascending: false });

      if (data && data.length > 0) {
        setProjects(data);
        setProjectId(data[0].id);
      }
    };
    fetchProjects();
  }, []);

  const { data, loading, error } = useReportData(projectId);

  const handleSubmit = () => {
    if (
      !window.confirm(
        "CONFIRM SUBMISSION\n\nThis will lock the project version and notify the account owner for review. This action cannot be undone.\n\nProceed?"
      )
    ) {
      return;
    }
    setStatus("submitting");
    setTimeout(() => {
      setStatus("submitted");
      setRefNumber(
        `DM-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)
          .toString()
          .padStart(3, "0")}`
      );
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 1200);
  };

  const formatMoney = (amount: number) => {
    if (!amount) return "R 0.00";
    if (amount >= 1_000_000_000) return `R ${(amount / 1_000_000_000).toFixed(2)}bn`;
    return `R ${(amount / 1_000_000).toFixed(1)}m`;
  };

  // ✅ Now it’s safe to return early because all hooks above already ran.
  if (!projectId && projects.length === 0) {
    return (
      <div className={cn("h-[60vh] flex flex-col items-center justify-center gap-3", TOKENS.MUTED)}>
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        <p>Loading projects…</p>
      </div>
    );
  }

  return (
    <div className={cn("p-8 pb-32 max-w-6xl mx-auto", TOKENS.BG, TOKENS.TEXT)}>
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-12">
        <div>
          {/* Status Badge */}
          <div
            className={cn(
              "inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-3 border",
              status === "submitted"
                ? "bg-[color:color-mix(in_oklab,orange_12%,transparent)] border-[color:color-mix(in_oklab,orange_35%,transparent)] text-[color:color-mix(in_oklab,orange_85%,black)]"
                : "bg-[color:color-mix(in_oklab,indigo_12%,transparent)] border-[color:color-mix(in_oklab,indigo_28%,transparent)] text-[color:color-mix(in_oklab,indigo_75%,black)]"
            )}
          >
            {status === "submitted" ? <Stamp className="w-3 h-3" /> : <Building className="w-3 h-3" />}
            {status === "submitted" ? `Pending Review • Ref: ${refNumber}` : "Draft Review Pack"}
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <h1 className="text-4xl font-black tracking-tight">Decision Maker View</h1>

            {/* Project Selector */}
            <div className="relative">
              <select
                value={projectId || ""}
                onChange={(e) => setProjectId(e.target.value)}
                className={cn(
                  "appearance-none text-lg font-black py-2 pl-4 pr-10 rounded-xl cursor-pointer transition-colors outline-none",
                  "focus:ring-2 focus:ring-indigo-500",
                  "border",
                  TOKENS.BORDER,
                  "bg-[color:color-mix(in_oklab,var(--surface-bg)_92%,transparent)]",
                  "hover:bg-[color:color-mix(in_oklab,var(--surface-bg)_86%,transparent)]"
                )}
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.province} — {p.project_name}
                  </option>
                ))}
              </select>
              <ChevronDown
                className={cn(
                  "absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none",
                  TOKENS.SOFT
                )}
              />
            </div>
          </div>

          <p className={cn("text-lg mt-2", TOKENS.SOFT)}>
            Funding motivation • FY 2027/28
          </p>
        </div>

        <div className="flex flex-col items-end gap-3">
          {data && (
            <div className="text-right hidden md:block">
              <div className={cn("text-xs font-black uppercase", TOKENS.MUTED)}>Submission Value</div>
              <div className="text-xl font-black">{formatMoney(data.summary.budgetAsk)}</div>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={status !== "draft" || loading}
            className={cn(
              "flex items-center gap-2 px-6 py-3 text-sm font-black rounded-xl transition-all shadow-lg",
              status === "draft" && !loading
                ? "bg-indigo-600 hover:bg-indigo-700 hover:scale-[1.02] text-white shadow-indigo-500/20"
                : cn("cursor-not-allowed shadow-none border", TOKENS.BORDER, TOKENS.SUBTLE_BG, TOKENS.MUTED)
            )}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : status === "submitting" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : status === "submitted" ? (
              <Lock className="w-4 h-4" />
            ) : (
              <Send className="w-4 h-4" />
            )}

            {loading
              ? "Loading Data..."
              : status === "draft"
              ? "Submit for Review"
              : status === "submitting"
              ? "Verifying..."
              : "Locked"}
          </button>

          {status === "submitted" && (
            <div className="text-[10px] text-emerald-600 font-medium flex items-center gap-1 animate-in fade-in slide-in-from-top-1">
              <Check className="w-3 h-3" /> Sent to account holder (just now)
            </div>
          )}
        </div>
      </div>

      {/* LOADING / ERROR */}
      {loading && (
        <div
          className={cn(
            "h-96 flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed",
            TOKENS.PANEL,
            TOKENS.BORDER_SOFT,
            TOKENS.MUTED
          )}
        >
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          <p>Compiling report data…</p>
        </div>
      )}

      {error && !loading && (
        <div
          className={cn(
            "p-20 text-center rounded-3xl border border-dashed",
            TOKENS.PANEL,
            TOKENS.BORDER_SOFT,
            TOKENS.SOFT
          )}
        >
          <AlertTriangle className="w-10 h-10 mx-auto text-rose-400 mb-4" />
          <h2 className="text-xl font-black mb-2">Data unavailable</h2>
          <p>Please ensure you have run a simulation for this project.</p>
        </div>
      )}

      {/* CONTENT */}
      {!loading && !error && data && (
        <div
          className={cn(
            "grid grid-cols-1 lg:grid-cols-3 gap-8 transition-opacity duration-500",
            status === "submitted" && "opacity-80 pointer-events-none select-none grayscale-[0.5]"
          )}
        >
          {/* LEFT COL */}
          <div className="lg:col-span-2 space-y-6">
            {/* Graph */}
            <div className={cn("p-6 rounded-3xl border shadow-sm relative overflow-hidden", TOKENS.SURFACE, TOKENS.BORDER)}>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-black flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-indigo-500" />
                    Impact of Funding vs. Decay
                  </h3>
                  <p className={cn("text-xs mt-1", TOKENS.SOFT)}>
                    10-year forecast of Network Condition (VCI)
                  </p>
                </div>

                <div className={cn("flex gap-4 text-[10px] font-black uppercase tracking-wider", TOKENS.SOFT)}>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" /> Funded
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-rose-500" /> Do Nothing
                  </div>
                </div>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorGood" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.12} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorBad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.12} />
                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                      </linearGradient>
                    </defs>

                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="color-mix(in oklab, var(--foreground) 14%, transparent)"
                    />
                    <XAxis dataKey="year" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis fontSize={10} tickLine={false} axisLine={false} domain={[0, 100]} />

                    <Tooltip contentStyle={tooltipStyle} />

                    <Area
                      type="monotone"
                      dataKey="fundedVCI"
                      stroke="#10b981"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorGood)"
                      name="Funded VCI"
                    />
                    <Area
                      type="monotone"
                      dataKey="doNothingVCI"
                      stroke="#f43f5e"
                      strokeWidth={3}
                      strokeDasharray="5 5"
                      fillOpacity={1}
                      fill="url(#colorBad)"
                      name="Decay VCI"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Narrative */}
            <div className={cn("p-6 rounded-2xl border", TOKENS.PANEL, TOKENS.BORDER_SOFT)}>
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-[color:color-mix(in_oklab,indigo_16%,transparent)]">
                  <BrainCircuit className="w-6 h-6 text-indigo-600" />
                </div>

                <div className="space-y-2">
                  <h4 className={cn("text-sm font-black uppercase tracking-wider", TOKENS.TEXT)}>
                    Strategic Assessment
                  </h4>
                  <p className={cn("text-sm leading-relaxed font-medium", TOKENS.SOFT)}>
                    “{data.narrative.executiveSummary}”
                  </p>
                  <div className="flex items-center gap-2 pt-2 text-rose-600 text-xs font-black">
                    <AlertTriangle className="w-3 h-3" />
                    RISK: {data.narrative.riskStatement}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COL */}
          <div className="space-y-6">
            <div className={cn("p-6 rounded-3xl border space-y-6", TOKENS.SURFACE, TOKENS.BORDER)}>
              <div>
                <div className={cn("text-xs font-black uppercase mb-1", TOKENS.MUTED)}>Asset Value At Risk</div>
                <div className="text-3xl font-black">{formatMoney(data.summary.assetValue)}</div>
              </div>

              <div className={cn("h-px", TOKENS.BORDER_SOFT)} />

              <div>
                <div className={cn("text-xs font-black uppercase mb-1", TOKENS.MUTED)}>Preventative Ratio</div>
                <div className="text-3xl font-black text-indigo-600">{data.summary.preservationRatio.toFixed(1)}%</div>
                <div className={cn("text-xs mt-1", TOKENS.SOFT)}>Target is 2–3% of CRC</div>
              </div>

              <div className={cn("h-px", TOKENS.BORDER_SOFT)} />

              <div>
                <div className={cn("text-xs font-black uppercase mb-1", TOKENS.MUTED)}>Network Health</div>
                <div className="flex items-center gap-2">
                  <div className="text-3xl font-black">{data.summary.currentVci.toFixed(0)}</div>
                  <span
                    className={cn(
                      "text-xs px-2 py-1 rounded font-black",
                      data.summary.currentVci < 50
                        ? "bg-[color:color-mix(in_oklab,crimson_15%,transparent)] text-[color:color-mix(in_oklab,crimson_70%,black)]"
                        : "bg-[color:color-mix(in_oklab,emerald_16%,transparent)] text-[color:color-mix(in_oklab,emerald_70%,black)]"
                    )}
                  >
                    {data.summary.currentVci < 50 ? "POOR" : "FAIR"}
                  </span>
                </div>
              </div>
            </div>

            <div className={cn("p-6 rounded-3xl border", TOKENS.SURFACE, TOKENS.BORDER)}>
              <div className="flex items-center gap-2 mb-4">
                <FileCheck className="w-5 h-5 text-emerald-500" />
                <h3 className="font-black">Compliance Check</h3>
              </div>
              <div className="space-y-3">
                <CheckItem label="RAMS Data Verified" checked />
                <CheckItem label="Decision Pack Ready" checked />
                <CheckItem label="Scenario Aligned" checked />
                <CheckItem label="Account Holder Approval" checked={status === "submitted"} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CheckItem({ label, checked }: { label: string; checked: boolean }) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <div
        className={cn(
          "w-5 h-5 rounded-full flex items-center justify-center border transition-all duration-300",
          checked
            ? "bg-emerald-500 border-emerald-500 text-white"
            : "border-[color:color-mix(in_oklab,var(--foreground)_18%,transparent)] text-transparent"
        )}
      >
        <Check className="w-3 h-3" />
      </div>
      <span
        className={cn(
          "font-medium",
          checked
            ? "text-[color:color-mix(in_oklab,var(--foreground)_80%,transparent)]"
            : "text-[color:color-mix(in_oklab,var(--foreground)_40%,transparent)]"
        )}
      >
        {label}
      </span>
    </div>
  );
}