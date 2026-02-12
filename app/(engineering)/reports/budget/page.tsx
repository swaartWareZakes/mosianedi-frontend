"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Wallet, TrendingUp, PieChart as PieIcon, Loader2, FileText, Sheet, ChevronDown, Calendar } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";
import { cn } from "@/lib/utils";

export default function BudgetSummaryPage() {
  // -----------------------------
  // State
  // -----------------------------
  const [loading, setLoading] = useState(true);

  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedProjectName, setSelectedProjectName] = useState("");
  const [selectedProjectProvince, setSelectedProjectProvince] = useState("");

  const [yearlyData, setYearlyData] = useState<any[]>([]);
  const [totalCost, setTotalCost] = useState(0);

  const [exportingPdf, setExportingPdf] = useState(false);
  const [exportingCsv, setExportingCsv] = useState(false);

  const scheduleRef = useRef<HTMLDivElement>(null);

  // -----------------------------
  // Theme-safe tokens (NO dark:)
  // -----------------------------
  const TOKENS = useMemo(() => {
    const BG = "bg-[var(--background)]";
    const SURFACE = "bg-[var(--surface-bg)]";
    const TEXT = "text-[var(--foreground)]";
    const SOFT = "text-[color:color-mix(in_oklab,var(--foreground)_55%,transparent)]";
    const MUTED = "text-[color:color-mix(in_oklab,var(--foreground)_40%,transparent)]";
    const BORDER = "border-[color:color-mix(in_oklab,var(--foreground)_14%,transparent)]";
    const BORDER_SOFT = "border-[color:color-mix(in_oklab,var(--foreground)_10%,transparent)]";

    const PANEL = "bg-[color:color-mix(in_oklab,var(--surface-bg)_92%,transparent)]";
    const SUBTLE = "bg-[color:color-mix(in_oklab,var(--surface-bg)_85%,transparent)]";

    // Hover surface (works in both themes)
    const HOVER = "hover:bg-[color:color-mix(in_oklab,var(--surface-bg)_86%,transparent)]";

    return { BG, SURFACE, TEXT, SOFT, MUTED, BORDER, BORDER_SOFT, PANEL, SUBTLE, HOVER };
  }, []);

  // -----------------------------
  // Helpers
  // -----------------------------
  const formatCurrency = (amount: number) => {
    const v = Number(amount) || 0;
    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(v);
  };

  const fileStem = useMemo(() => {
    const province = selectedProjectProvince?.replace(/\s+/g, "_") || "Province";
    const name = selectedProjectName?.replace(/\s+/g, "_") || "Project";
    const date = new Date().toISOString().slice(0, 10);
    return `Expenditure_Schedule_${province}_${name}_${date}`;
  }, [selectedProjectName, selectedProjectProvince]);

  // Peak funding year derived from data
  const peakFunding = useMemo(() => {
    if (!yearlyData || yearlyData.length === 0) return null;

    let best = yearlyData[0];
    let bestVal = Number(best?.total_maintenance_cost ?? 0);

    for (const row of yearlyData) {
      const val = Number(row?.total_maintenance_cost ?? 0);
      if (val > bestVal) {
        bestVal = val;
        best = row;
      }
    }

    return { year: Number(best?.year ?? 0), value: bestVal };
  }, [yearlyData]);

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const toCsv = (rows: any[]) => {
    const header = [
      "financial_year",
      "avg_condition_index_vci",
      "pct_good",
      "pct_fair",
      "pct_poor",
      "required_budget_zar",
    ];

    const lines = rows.map((y) => {
      const fy = `FY ${y.year}/${y.year + 1}`;
      const safe = (v: any) => {
        const s = String(v ?? "");
        if (s.includes(",") || s.includes('"') || s.includes("\n")) return `"${s.replace(/"/g, '""')}"`;
        return s;
      };

      return [
        safe(fy),
        safe(Number(y.avg_condition_index ?? 0).toFixed(2)),
        safe(Number(y.pct_good ?? 0).toFixed(2)),
        safe(Number(y.pct_fair ?? 0).toFixed(2)),
        safe(Number(y.pct_poor ?? 0).toFixed(2)),
        safe(Number(y.total_maintenance_cost ?? 0).toFixed(2)),
      ].join(",");
    });

    return [header.join(","), ...lines].join("\n");
  };

  // -----------------------------
  // Fetch projects on mount
  // -----------------------------
  useEffect(() => {
    async function fetchProjects() {
      setLoading(true);

      const { data } = await supabase
        .from("projects")
        .select("id, project_name, province")
        .order("updated_at", { ascending: false });

      if (data && data.length > 0) {
        setProjects(data);
        setSelectedProjectId(data[0].id);
        setSelectedProjectName(data[0].project_name);
        setSelectedProjectProvince(data[0].province);
      } else {
        setProjects([]);
        setSelectedProjectId(null);
      }

      setLoading(false);
    }

    fetchProjects();
  }, []);

  // -----------------------------
  // Fetch sim data when project changes
  // -----------------------------
  useEffect(() => {
    async function fetchEngineeringData() {
      if (!selectedProjectId) {
        setYearlyData([]);
        setTotalCost(0);
        return;
      }

      setLoading(true);

      try {
        // update labels from selection
        const proj = projects.find((p) => p.id === selectedProjectId);
        if (proj) {
          setSelectedProjectName(proj.project_name);
          setSelectedProjectProvince(proj.province);
        }

        const { data: sim } = await supabase
          .from("simulation_results")
          .select("results_payload")
          .eq("project_id", selectedProjectId)
          .order("run_at", { ascending: false })
          .limit(1)
          .single();

        const payload = sim?.results_payload;

        if (payload) {
          setYearlyData(payload.yearly_data || []);
          setTotalCost(Number(payload.total_cost_npv || 0));
        } else {
          setYearlyData([]);
          setTotalCost(0);
        }
      } catch (e) {
        console.error(e);
        setYearlyData([]);
        setTotalCost(0);
      } finally {
        setLoading(false);
      }
    }

    fetchEngineeringData();
  }, [selectedProjectId, projects]);

  // -----------------------------
  // Exports
  // -----------------------------
  const handleExportCsv = async () => {
    setExportingCsv(true);
    try {
      const csv = toCsv(yearlyData || []);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      downloadBlob(blob, `${fileStem}.csv`);
    } catch (e) {
      console.error(e);
      alert("Failed to export CSV.");
    } finally {
      setExportingCsv(false);
    }
  };

  const handleExportPdf = async () => {
    if (!scheduleRef.current) return;
    setExportingPdf(true);
    try {
      await new Promise((r) => setTimeout(r, 50));
      const node = scheduleRef.current;

      const dataUrl = await toPng(node, {
        cacheBust: true,
        pixelRatio: 2,
        // Keep white export (best for printing)
        backgroundColor: "#ffffff",
      });

      const img = new Image();
      img.src = dataUrl;
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Failed to load export image"));
      });

      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = pdfWidth;
      const imgHeight = (img.height * imgWidth) / img.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(dataUrl, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position -= pageHeight;
        pdf.addPage();
        pdf.addImage(dataUrl, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${fileStem}.pdf`);
    } catch (e) {
      console.error(e);
      alert("Failed to export PDF.");
    } finally {
      setExportingPdf(false);
    }
  };

  // -----------------------------
  // UI
  // -----------------------------
  const horizonYears = yearlyData?.length ?? 0;
  const finalVci =
    horizonYears > 0 ? Number(yearlyData[horizonYears - 1]?.avg_condition_index ?? 0) : 0;

  return (
    <div className={cn("p-8 pb-20 max-w-7xl mx-auto space-y-8", TOKENS.BG, TOKENS.TEXT)}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Engineering Programme</h1>

          <div className={cn("mt-1 flex items-center gap-2", TOKENS.SOFT)}>
            {/* Project Dropdown */}
            <div className="relative">
              <select
                value={selectedProjectId || ""}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                disabled={projects.length === 0}
                className={cn(
                  "appearance-none bg-transparent border-none pr-7 cursor-pointer font-semibold outline-none",
                  "focus:ring-2 focus:ring-indigo-500 focus:ring-offset-0 rounded-lg",
                  TOKENS.SOFT,
                  "hover:text-[color:color-mix(in_oklab,var(--foreground)_78%,transparent)]"
                )}
              >
                {projects.length === 0 && <option>No Projects Found</option>}
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.province}: {p.project_name}
                  </option>
                ))}
              </select>
              <ChevronDown
                className={cn(
                  "absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none",
                  TOKENS.MUTED
                )}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            disabled={exportingCsv || yearlyData.length === 0}
            className={cn(
              "flex items-center gap-2 px-4 py-2 text-sm font-black rounded-xl transition-all border",
              TOKENS.BORDER,
              "bg-[color:color-mix(in_oklab,var(--surface-bg)_92%,transparent)]",
              TOKENS.HOVER,
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            {exportingCsv ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sheet className="w-4 h-4" />}
            {exportingCsv ? "Exporting..." : "Export CSV"}
          </button>

          <button
            onClick={handleExportPdf}
            disabled={exportingPdf || yearlyData.length === 0}
            className={cn(
              "flex items-center gap-2 px-4 py-2 text-sm font-black rounded-xl transition-all",
              "bg-indigo-600 text-white hover:bg-indigo-700",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            {exportingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
            {exportingPdf ? "Exporting..." : "Export PDF"}
          </button>
        </div>
      </div>

      {loading ? (
        <div className={cn("h-64 flex items-center justify-center rounded-3xl border border-dashed", TOKENS.PANEL, TOKENS.BORDER_SOFT)}>
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
      ) : (
        <>
          {/* KPI Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className={cn("p-6 rounded-2xl border shadow-sm", TOKENS.SURFACE, TOKENS.BORDER)}>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-[color:color-mix(in_oklab,royalblue_18%,transparent)] text-[color:color-mix(in_oklab,royalblue_75%,black)]">
                  <Wallet className="w-5 h-5" />
                </div>
                <span className={cn("text-xs font-black uppercase", TOKENS.SOFT)}>Program Total (NPV)</span>
              </div>
              <div className="text-3xl font-black">{formatCurrency(totalCost)}</div>
              <div className={cn("text-sm mt-1", TOKENS.SOFT)}>{horizonYears} Year Horizon</div>
            </div>

            <div className={cn("p-6 rounded-2xl border shadow-sm", TOKENS.SURFACE, TOKENS.BORDER)}>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-[color:color-mix(in_oklab,emerald_18%,transparent)] text-[color:color-mix(in_oklab,emerald_70%,black)]">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <span className={cn("text-xs font-black uppercase", TOKENS.SOFT)}>Target Condition</span>
              </div>
              <div className="text-3xl font-black">VCI {finalVci.toFixed(0)}</div>
              <div className="text-sm mt-1 font-semibold text-[color:color-mix(in_oklab,emerald_62%,black)]">
                Sustainable Level
              </div>
            </div>

            <div
              className={cn(
                "p-6 rounded-2xl border shadow-sm",
                "bg-[color:color-mix(in_oklab,orange_10%,transparent)]",
                "border-[color:color-mix(in_oklab,orange_22%,transparent)]"
              )}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-[color:color-mix(in_oklab,orange_20%,transparent)] text-[color:color-mix(in_oklab,orange_70%,black)]">
                  <Calendar className="w-5 h-5" />
                </div>
                <span className="text-xs font-black uppercase text-[color:color-mix(in_oklab,orange_72%,black)]">
                  Peak Funding Year
                </span>
              </div>

              <div className="text-3xl font-black text-[color:color-mix(in_oklab,orange_78%,black)]">
                {peakFunding?.year ? peakFunding.year : "—"}
              </div>

              <div className="text-sm mt-1 text-[color:color-mix(in_oklab,orange_62%,black)]">
                {peakFunding?.value ? `Peak ask: ${formatCurrency(peakFunding.value)}` : "No schedule loaded"}
              </div>
            </div>
          </div>

          {/* Schedule Table */}
          <div ref={scheduleRef} className={cn("rounded-2xl border overflow-hidden", TOKENS.SURFACE, TOKENS.BORDER)}>
            <div className={cn("p-6 border-b flex justify-between items-center", TOKENS.BORDER_SOFT)}>
              <h3 className="font-black flex items-center gap-2">
                <PieIcon className={cn("w-4 h-4", TOKENS.MUTED)} />
                Annual Expenditure Schedule
              </h3>
            </div>

            <table className="w-full text-sm text-left">
              <thead
                className={cn(
                  "text-xs uppercase font-black",
                  "bg-[color:color-mix(in_oklab,var(--surface-bg)_86%,transparent)]",
                  TOKENS.SOFT
                )}
              >
                <tr>
                  <th className="px-6 py-4">Financial Year</th>
                  <th className="px-6 py-4">Network Condition (VCI)</th>
                  <th className="px-6 py-4">Good / Fair / Poor (%)</th>
                  <th className="px-6 py-4 text-right">Required Budget</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[color:color-mix(in_oklab,var(--foreground)_10%,transparent)]">
                {yearlyData.map((year: any) => {
                  const vci = Math.max(0, Math.min(100, Number(year.avg_condition_index ?? 0)));
                  return (
                    <tr
                      key={year.year}
                      className={cn(
                        "transition-colors",
                        "hover:bg-[color:color-mix(in_oklab,var(--surface-bg)_84%,transparent)]"
                      )}
                    >
                      <td className="px-6 py-4 font-black">
                        FY {year.year}/{year.year + 1}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 rounded-full overflow-hidden bg-[color:color-mix(in_oklab,var(--foreground)_12%,transparent)]">
                            <div className="h-full bg-emerald-500" style={{ width: `${vci}%` }} />
                          </div>
                          <span className={cn("font-mono", TOKENS.SOFT)}>{vci.toFixed(1)}</span>
                        </div>
                      </td>

                      <td className={cn("px-6 py-4 text-xs", TOKENS.SOFT)}>
                        <span className="text-emerald-600 font-black">{Number(year.pct_good ?? 0).toFixed(0)}%</span> /{" "}
                        <span className="text-amber-600 font-black">{Number(year.pct_fair ?? 0).toFixed(0)}%</span> /{" "}
                        <span className="text-rose-600 font-black">{Number(year.pct_poor ?? 0).toFixed(0)}%</span>
                      </td>

                      <td className="px-6 py-4 text-right font-mono font-black">
                        {formatCurrency(Number(year.total_maintenance_cost ?? 0))}
                      </td>
                    </tr>
                  );
                })}

                {yearlyData.length === 0 && (
                  <tr>
                    <td colSpan={4} className={cn("p-8 text-center", TOKENS.MUTED)}>
                      No schedule available for this project. Try running a simulation first.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}