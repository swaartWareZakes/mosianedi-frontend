"use client";

import React from "react";
import { FileText, Table, Globe, CheckCircle2, Download } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ExportActionsPanel({ activeTemplate, onTemplateChange }: any) {
  
  const templates = [
    { id: "executive", label: "Executive Summary", icon: <FileText className="w-4 h-4"/>, desc: "High-level visual PDF" },
    { id: "engineering", label: "Engineering Schedule", icon: <Table className="w-4 h-4"/>, desc: "Detailed Excel Grid" },
    { id: "gis", label: "GIS Package", icon: <Globe className="w-4 h-4"/>, desc: "GeoJSON / KML" },
  ];

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
                    <div className={cn("p-2 rounded-lg", activeTemplate === t.id ? "bg-white dark:bg-slate-900 text-indigo-600" : "bg-slate-100 dark:bg-slate-800 text-slate-500")}>
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
        <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-500">Estimated Size</span>
                <span className="font-mono font-bold">2.4 MB</span>
            </div>
            <div className="flex justify-between text-xs">
                <span className="text-slate-500">Rows Included</span>
                <span className="font-mono font-bold">1,240</span>
            </div>
        </div>

        <button className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold text-sm shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
            <Download className="w-4 h-4" />
            Generate Report
        </button>
      </div>

    </div>
  );
}