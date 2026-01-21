"use client";

import React, { useState } from "react";
import { FileText, Table, Globe, CheckCircle2, Download, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function ExportActionsPanel({ activeTemplate, onTemplateChange, previewRef }: any) {
  const [downloading, setDownloading] = useState(false);

  const templates = [
    { id: "executive", label: "Executive Summary", icon: <FileText className="w-4 h-4" />, desc: "High-level visual PDF" },
    { id: "engineering", label: "Engineering Schedule", icon: <Table className="w-4 h-4" />, desc: "Detailed Grid View" },
    { id: "gis", label: "GIS Package", icon: <Globe className="w-4 h-4" />, desc: "GeoJSON / KML" },
  ];

  const handleDownload = async () => {
    if (!previewRef?.current) return;
    setDownloading(true);

    try {
      const canvas = await html2canvas(previewRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        onclone: (clonedDoc) => {
          // normalize colors to rgb/hex so html2canvas doesn't choke on lab()/oklch()
          const root = clonedDoc.getElementById("report-print-root");
          if (!root) return;

          const colorProps = [
            "color",
            "backgroundColor",
            "borderTopColor",
            "borderRightColor",
            "borderBottomColor",
            "borderLeftColor",
            "outlineColor",
            "textDecorationColor",
          ] as const;

          const normalize = (val: string) => {
            if (!val) return val;
            const lower = val.toLowerCase();
            if (!lower.includes("lab(") && !lower.includes("oklch(") && !lower.includes("lch(")) return val;

            // try to coerce via browser parser into rgb
            const tmp = clonedDoc.createElement("span");
            tmp.style.color = val;
            tmp.style.position = "fixed";
            tmp.style.left = "-9999px";
            clonedDoc.body.appendChild(tmp);

            const computed = clonedDoc.defaultView?.getComputedStyle(tmp).color || val;
            tmp.remove();
            return computed;
          };

          const all = [root, ...Array.from(root.querySelectorAll<HTMLElement>("*"))];

          all.forEach((el) => {
            const cs = clonedDoc.defaultView?.getComputedStyle(el);
            if (!cs) return;

            colorProps.forEach((prop) => {
              const v = (cs as any)[prop] as string;
              const nv = normalize(v);
              if (nv && nv !== v) {
                (el.style as any)[prop] = nv;
              }
            });
          });

          // hard force white background on root (safe)
          (root as HTMLElement).style.backgroundColor = "#ffffff";
          (root as HTMLElement).style.color = (root as HTMLElement).style.color || "#0f172a";
        },
      });

      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Mosianedi_Report_${activeTemplate}_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (err) {
      console.error("PDF Generation failed", err);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="p-4 flex flex-col h-full">
      <div className="space-y-4 mb-8">
        <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Select Format</h3>
        <div className="space-y-2">
          {templates.map((t) => (
            <button
              key={t.id}
              onClick={() => onTemplateChange(t.id)}
              className={cn(
                "w-full flex items-start gap-3 p-3 rounded-xl border text-left transition-all",
                activeTemplate === t.id
                  ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 ring-1 ring-indigo-600"
                  : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
              )}
            >
              <div
                className={cn(
                  "p-2 rounded-lg",
                  activeTemplate === t.id ? "bg-white dark:bg-slate-900 text-indigo-600" : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                )}
              >
                {t.icon}
              </div>
              <div>
                <div className="text-sm font-bold">{t.label}</div>
                <div className="text-[10px] text-slate-500">{t.desc}</div>
              </div>
              {activeTemplate === t.id && <CheckCircle2 className="w-4 h-4 text-indigo-600 ml-auto" />}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-auto pt-6 border-t border-slate-200 dark:border-slate-800 space-y-4">
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold text-sm shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          {downloading ? "Generating PDF..." : "Download Report"}
        </button>
      </div>
    </div>
  );
}