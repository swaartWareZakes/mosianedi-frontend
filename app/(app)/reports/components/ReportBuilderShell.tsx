"use client";

import React, { useState, useRef } from "react";
import { FileText, LayoutTemplate, Download, Loader2 } from "lucide-react";
import ReportFilterSidebar from "./ReportFilterSidebar";
import ReportLivePreview from "./ReportLivePreview";
import jsPDF from "jspdf";
import { toPng } from "html-to-image";

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
    setReportConfig((prev) => ({ ...prev, [key]: value }));
  };

  const waitForImages = async (root: HTMLElement, timeoutMs = 4000) => {
    const imgs = Array.from(root.querySelectorAll("img")) as HTMLImageElement[];
    if (imgs.length === 0) return;

    await Promise.race([
      Promise.all(
        imgs.map(
          (img) =>
            new Promise<void>((resolve) => {
              if (img.complete && img.naturalWidth > 0) return resolve();
              const done = () => resolve();
              img.addEventListener("load", done, { once: true });
              img.addEventListener("error", done, { once: true });
            })
        )
      ),
      new Promise<void>((resolve) => setTimeout(resolve, timeoutMs)),
    ]);
  };

  const handleDownload = async () => {
    if (!previewRef.current) return;

    const reportNode =
      (previewRef.current.querySelector(
        "#report-print-root"
      ) as HTMLElement | null) ?? previewRef.current;

    setDownloading(true);

    try {
      // Give the UI a tick to finish layout
      await new Promise((r) => setTimeout(r, 50));
      await waitForImages(reportNode);

      // Generate PNG from DOM
      const dataUrl = await toPng(reportNode, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "#ffffff",

        // If SVG charts/icons cause issues, keep this filter.
        // Remove it if you want SVGs included (and it works in your case).
        filter: (node) => node.nodeName.toLowerCase() !== "svg",
      });

      // Load image to get natural dimensions
      const img = new Image();
      img.src = dataUrl;
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Failed to load export image."));
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
          <ReportFilterSidebar
            config={reportConfig}
            onConfigChange={updateConfig}
          />
        </div>
      </aside>

      {/* MAIN PANEL: PREVIEW */}
      <main className="flex-1 bg-slate-100 dark:bg-slate-900/50 flex flex-col relative overflow-hidden">
        <div className="h-16 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 bg-[var(--surface-bg)] shrink-0">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-slate-400" />
            <div>
              <div className="text-sm font-bold text-slate-800 dark:text-slate-100">
                Live Preview
              </div>
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
            {downloading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
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