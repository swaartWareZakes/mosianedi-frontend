"use client";

import React, { useState, useRef } from "react";
import { FileText, LayoutTemplate, Share2 } from "lucide-react";
import ReportFilterSidebar from "./ReportFilterSidebar";
import ReportLivePreview from "./ReportLivePreview";
import ExportActionsPanel from "./ExportActionsPanel";

export default function ReportBuilderShell() {
  const [selectedTemplate, setSelectedTemplate] = useState("engineering"); 
  
  // Ref to capture the PDF content
  const previewRef = useRef<HTMLDivElement>(null);

  const [reportConfig, setReportConfig] = useState({
    projectId: "",
    title: "Maintenance Priority Report",
    condition: "all",
    district: "All",
    showDistrict: true,
    showSurface: true,
    showCost: true,
    groupBy: "none",
  });

  const updateConfig = (key: string, value: any) => {
    setReportConfig(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="flex h-full w-full bg-[var(--background)]">
      
      {/* 1. LEFT PANEL */}
      <aside className="w-80 border-r border-slate-200 dark:border-slate-800 bg-[var(--surface-bg)] flex flex-col">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
          <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
            <LayoutTemplate className="w-5 h-5" />
          </div>
          <span className="font-bold text-sm">Report Settings</span>
        </div>
        <div className="flex-1 overflow-y-auto">
            <ReportFilterSidebar config={reportConfig} onConfigChange={updateConfig} />
        </div>
      </aside>

      {/* 2. MIDDLE PANEL */}
      <main className="flex-1 bg-slate-100 dark:bg-slate-900/50 flex flex-col relative overflow-hidden">
        <div className="h-14 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 bg-[var(--surface-bg)]">
            <div className="flex items-center gap-2 text-sm text-slate-500">
                <FileText className="w-4 h-4" />
                <span>Live Preview:</span>
                <strong className="text-slate-900 dark:text-slate-100 uppercase tracking-wider text-xs">
                    A4 Portrait • {selectedTemplate}
                </strong>
            </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-8 flex justify-center">
            {/* Pass ref here so we can grab this DIV later */}
            <ReportLivePreview 
                previewRef={previewRef} 
                template={selectedTemplate} 
                config={reportConfig} 
            />
        </div>
      </main>

      {/* 3. RIGHT PANEL */}
      <aside className="w-72 border-l border-slate-200 dark:border-slate-800 bg-[var(--surface-bg)] flex flex-col">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
          <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400">
            <Share2 className="w-5 h-5" />
          </div>
          <span className="font-bold text-sm">Export Actions</span>
        </div>
        <div className="flex-1 overflow-y-auto">
            {/* Pass ref here so the button knows what to print */}
            <ExportActionsPanel 
                previewRef={previewRef}
                activeTemplate={selectedTemplate} 
                onTemplateChange={setSelectedTemplate}
                reportConfig={reportConfig}
            />
        </div>
      </aside>

    </div>
  );
}