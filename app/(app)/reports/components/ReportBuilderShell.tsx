"use client";

import React, { useState, useRef } from "react";
import { FileText, LayoutTemplate, Download, Loader2 } from "lucide-react";
import ReportFilterSidebar from "./ReportFilterSidebar";
import ReportLivePreview from "./ReportLivePreview";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function ReportBuilderShell() {
  const [downloading, setDownloading] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const [reportConfig, setReportConfig] = useState({
    projectId: "",
    title: "Provincial Business Case",
    author: "Chief Engineer",
    showAiNarrative: true,
    showSchedule: true,
  });

  const updateConfig = (key: string, value: any) => {
    setReportConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleDownload = async () => {
    if (!previewRef.current) return;
    setDownloading(true);

    try {
      const canvas = await html2canvas(previewRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        onclone: (clonedDoc) => {
            const root = clonedDoc.getElementById("report-print-root");
            if (root) {
                root.style.backgroundColor = "#ffffff";
                root.style.color = "#0f172a";
            }
        }
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Business_Case_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (err) {
      console.error("PDF Generation failed", err);
      alert("Failed to generate PDF.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="flex h-full w-full bg-[var(--background)]">
      {/* LEFT PANEL: SETTINGS */}
      <aside className="w-80 border-r border-slate-200 dark:border-slate-800 bg-[var(--surface-bg)] flex flex-col shrink-0 z-10">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
          <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
            <LayoutTemplate className="w-5 h-5" />
          </div>
          <span className="font-bold text-sm">Report Configuration</span>
        </div>
        <div className="flex-1 overflow-y-auto">
            <ReportFilterSidebar config={reportConfig} onConfigChange={updateConfig} />
        </div>
      </aside>

      {/* MAIN PANEL: PREVIEW */}
      <main className="flex-1 bg-slate-100 dark:bg-slate-900/50 flex flex-col relative overflow-hidden">
        <div className="h-16 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 bg-[var(--surface-bg)] shrink-0">
            <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-slate-400" />
                <div>
                    <div className="text-sm font-bold text-slate-800 dark:text-slate-100">Live Preview</div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">
                        A4 Portrait • Strategic Business Case
                    </div>
                </div>
            </div>
            <button 
                onClick={handleDownload}
                disabled={downloading || !reportConfig.projectId}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {downloading ? <Loader2 className="w-4 h-4 animate-spin"/> : <Download className="w-4 h-4"/>}
                {downloading ? "Publishing..." : "Export PDF"}
            </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-8 flex justify-center bg-slate-100 dark:bg-slate-900/50">
            <ReportLivePreview previewRef={previewRef} config={reportConfig} />
        </div>
      </main>
    </div>
  );
}