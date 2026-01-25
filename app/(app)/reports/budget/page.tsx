"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Wallet,
  TrendingUp,
  PieChart as PieIcon,
  Loader2,
  FileText,
  Sheet,
  ChevronDown
} from "lucide-react";
import { Calendar } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";

export default function BudgetSummaryPage() {
  const [loading, setLoading] = useState(true);
  
  // State for Projects & Selection
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedProjectName, setSelectedProjectName] = useState("");
  const [selectedProjectProvince, setSelectedProjectProvince] = useState("");

  // Data State
  const [yearlyData, setYearlyData] = useState<any[]>([]);
  const [totalCost, setTotalCost] = useState(0);

  const [exportingPdf, setExportingPdf] = useState(false);
  const [exportingCsv, setExportingCsv] = useState(false);

  const scheduleRef = useRef<HTMLDivElement>(null);

  // 1. Fetch Projects List on Mount
  useEffect(() => {
    async function fetchProjects() {
        const { data } = await supabase
            .from("projects")
            .select("id, project_name, province")
            .order("updated_at", { ascending: false });

        if (data && data.length > 0) {
            setProjects(data);
            setSelectedProjectId(data[0].id); // Default to first
            setSelectedProjectName(data[0].project_name);
            setSelectedProjectProvince(data[0].province);
        } else {
            setLoading(false);
        }
    }
    fetchProjects();
  }, []);

  // 2. Fetch Simulation Data when Project Changes
  useEffect(() => {
    async function fetchEngineeringData() {
      if(!selectedProjectId) return;
      
      setLoading(true);
      try {
        // Update labels based on selection
        const proj = projects.find(p => p.id === selectedProjectId);
        if(proj) {
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

        if (sim?.results_payload) {
          setYearlyData(sim.results_payload.yearly_data || []);
          setTotalCost(sim.results_payload.total_cost_npv || 0);
        } else {
            setYearlyData([]);
            setTotalCost(0);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchEngineeringData();
  }, [selectedProjectId, projects]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
      notation: "compact",
    }).format(amount);
  };

  const fileStem = useMemo(() => {
    const province = selectedProjectProvince?.replace(/\s+/g, "_") ?? "Province";
    const name = selectedProjectName?.replace(/\s+/g, "_") ?? "Project";
    const date = new Date().toISOString().slice(0, 10);
    return `Expenditure_Schedule_${province}_${name}_${date}`;
  }, [selectedProjectName, selectedProjectProvince]);

  // Export functions (CSV/PDF) omitted for brevity as they remain largely the same, 
  // relying on `yearlyData` which is now dynamic.
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
        if (s.includes(",") || s.includes('"') || s.includes("\n")) {
          return `"${s.replace(/"/g, '""')}"`;
        }
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

  return (
    <div className="p-8 pb-20 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Engineering Programme</h1>
          
          <div className="mt-1 flex items-center gap-2">
             {/* PROJECT DROPDOWN */}
             <div className="relative group">
                <select 
                    value={selectedProjectId || ""}
                    onChange={(e) => setSelectedProjectId(e.target.value)}
                    disabled={projects.length === 0}
                    className="appearance-none bg-transparent border-none text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 pr-6 cursor-pointer font-medium focus:ring-0 focus:outline-none"
                >
                    {projects.length === 0 && <option>No Projects Found</option>}
                    {projects.map((p) => (
                        <option key={p.id} value={p.id}>{p.province}: {p.project_name}</option>
                    ))}
                </select>
                <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
             </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            disabled={exportingCsv || yearlyData.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {exportingCsv ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sheet className="w-4 h-4" />}
            {exportingCsv ? "Exporting..." : "Export CSV"}
          </button>

          <button
            onClick={handleExportPdf}
            disabled={exportingPdf || yearlyData.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {exportingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
            {exportingPdf ? "Exporting..." : "Export PDF"}
          </button>
        </div>
      </div>

      {loading ? (
          <div className="h-64 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          </div>
      ) : (
        <>
            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                    <Wallet className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold uppercase text-slate-500">Program Total (NPV)</span>
                </div>
                <div className="text-3xl font-black text-slate-900 dark:text-white">{formatCurrency(totalCost)}</div>
                <div className="text-sm text-slate-500 mt-1">{yearlyData.length} Year Horizon</div>
                </div>

                <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                    <TrendingUp className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold uppercase text-slate-500">Target Condition</span>
                </div>
                <div className="text-3xl font-black text-slate-900 dark:text-white">
                    VCI {yearlyData.length > 0 ? yearlyData[yearlyData.length - 1].avg_condition_index.toFixed(0) : "0"}
                </div>
                <div className="text-sm text-emerald-600 mt-1 font-medium">Sustainable Level</div>
                </div>

                <div className="p-6 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-200 dark:border-amber-800 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                    <Calendar className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold uppercase text-amber-700 dark:text-amber-400">Peak Funding Year</span>
                </div>
                <div className="text-3xl font-black text-amber-600 dark:text-amber-400">2027</div>
                <div className="text-sm text-amber-600/80 mt-1">Critical Rehab Phase</div>
                </div>
            </div>

            {/* Yearly Breakdown Table + “chart bars” */}
            <div
                ref={scheduleRef}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
            >
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <PieIcon className="w-4 h-4 text-slate-400" />
                    Annual Expenditure Schedule
                </h3>
                </div>

                <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs uppercase font-bold text-slate-500">
                    <tr>
                    <th className="px-6 py-4">Financial Year</th>
                    <th className="px-6 py-4">Network Condition (VCI)</th>
                    <th className="px-6 py-4">Good / Fair / Poor (%)</th>
                    <th className="px-6 py-4 text-right">Required Budget</th>
                    </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {yearlyData.map((year: any) => (
                    <tr key={year.year} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">FY {year.year}/{year.year + 1}</td>

                        <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500" style={{ width: `${year.avg_condition_index}%` }} />
                            </div>
                            <span className="font-mono text-slate-600 dark:text-slate-300">
                            {Number(year.avg_condition_index ?? 0).toFixed(1)}
                            </span>
                        </div>
                        </td>

                        <td className="px-6 py-4 text-slate-500 text-xs">
                        <span className="text-emerald-600 font-bold">{Number(year.pct_good ?? 0).toFixed(0)}%</span> /{" "}
                        <span className="text-amber-600 font-bold">{Number(year.pct_fair ?? 0).toFixed(0)}%</span> /{" "}
                        <span className="text-rose-600 font-bold">{Number(year.pct_poor ?? 0).toFixed(0)}%</span>
                        </td>

                        <td className="px-6 py-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                        {formatCurrency(Number(year.total_maintenance_cost ?? 0))}
                        </td>
                    </tr>
                    ))}

                    {yearlyData.length === 0 && (
                    <tr>
                        <td colSpan={4} className="p-8 text-center text-slate-400">
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