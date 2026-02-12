"use client";

import React, { useMemo, useRef, useState } from "react";
import { FileText, LayoutTemplate, Download, Loader2 } from "lucide-react";
import ReportFilterSidebar from "./ReportFilterSidebar";
import ReportLivePreview from "./ReportLivePreview";
import jsPDF from "jspdf";
import { toPng } from "html-to-image";
import { cn } from "@/lib/utils";

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

  const TOKENS = useMemo(() => {
    const BG = "bg-[var(--background)]";
    const SURFACE = "bg-[var(--surface-bg)]";
    const TEXT = "text-[var(--foreground)]";
    const SOFT = "text-[color:color-mix(in_oklab,var(--foreground)_55%,transparent)]";
    const MUTED = "text-[color:color-mix(in_oklab,var(--foreground)_40%,transparent)]";
    const BORDER = "border-[color:color-mix(in_oklab,var(--foreground)_14%,transparent)]";
    const BORDER_SOFT = "border-[color:color-mix(in_oklab,var(--foreground)_10%,transparent)]";
    const PANEL = "bg-[color:color-mix(in_oklab,var(--surface-bg)_92%,transparent)]";
    const SUBTLE = "bg-[color:color-mix(in_oklab,var(--surface-bg)_86%,transparent)]";
    const HOVER = "hover:bg-[color:color-mix(in_oklab,var(--surface-bg)_84%,transparent)]";
    return { BG, SURFACE, TEXT, SOFT, MUTED, BORDER, BORDER_SOFT, PANEL, SUBTLE, HOVER };
  }, []);

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
      (previewRef.current.querySelector("#report-print-root") as HTMLElement | null) ??
      previewRef.current;

    setDownloading(true);

    try {
      await new Promise((r) => setTimeout(r, 50));
      await waitForImages(reportNode);

      const dataUrl = await toPng(reportNode, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
        filter: (node) => node.nodeName.toLowerCase() !== "svg",
      });

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
    <div className={cn("flex h-full w-full", TOKENS.BG, TOKENS.TEXT)}>
      {/* LEFT PANEL */}
      <aside className={cn("w-80 flex flex-col shrink-0 z-10 border-r", TOKENS.SURFACE, TOKENS.BORDER)}>
        <div className={cn("p-4 flex items-center gap-2 border-b", TOKENS.BORDER_SOFT)}>
          <div className="p-2 rounded-lg bg-[color:color-mix(in_oklab,indigo_16%,transparent)] text-[color:color-mix(in_oklab,indigo_70%,black)]">
            <LayoutTemplate className="w-5 h-5" />
          </div>
          <span className="font-black text-sm">Report Configuration</span>
        </div>

        <div className="flex-1 overflow-y-auto">
          <ReportFilterSidebar config={reportConfig} onConfigChange={updateConfig} />
        </div>
      </aside>

      {/* MAIN PANEL */}
      <main className={cn("flex-1 flex flex-col relative overflow-hidden", TOKENS.PANEL)}>
        <div className={cn("h-16 flex items-center justify-between px-6 shrink-0 border-b", TOKENS.SURFACE, TOKENS.BORDER)}>
          <div className="flex items-center gap-3">
            <FileText className={cn("w-5 h-5", TOKENS.MUTED)} />
            <div>
              <div className="text-sm font-black">Live Preview</div>
              <div className={cn("text-[10px] uppercase tracking-wider font-semibold", TOKENS.SOFT)}>
                A4 Portrait • Strategic Business Case
              </div>
            </div>
          </div>

          <button
            onClick={handleDownload}
            disabled={downloading || !reportConfig.projectId}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black transition-all",
              "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {downloading ? "Publishing..." : "Export PDF"}
          </button>
        </div>

        <div className={cn("flex-1 overflow-y-auto p-8 flex justify-center", TOKENS.PANEL)}>
          <ReportLivePreview previewRef={previewRef} config={reportConfig} />
        </div>
      </main>
    </div>
  );
}