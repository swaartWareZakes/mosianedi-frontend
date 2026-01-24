"use client";

import React, { useEffect, useState } from "react";
import { Map, Filter, Type, Columns, Layers, Loader2, FileText, Table, Globe, CheckCircle2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { cn } from "@/lib/utils";

export default function ReportFilterSidebar({ config, onConfigChange, selectedTemplate, onTemplateChange }: any) {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const templates = [
    { id: "executive", label: "Executive Summary", icon: <FileText className="w-4 h-4" />, desc: "High-level visual PDF" },
    { id: "engineering", label: "Engineering Schedule", icon: <Table className="w-4 h-4" />, desc: "Detailed Grid View" },
    { id: "gis", label: "GIS Package", icon: <Globe className="w-4 h-4" />, desc: "GeoJSON / KML" },
  ];

  // Load Projects
  useEffect(() => {
    async function loadProjects() {
      const { data } = await supabase.from("projects").select("id, project_name").order("created_at", { ascending: false });
      if (data) {
        setProjects(data);
        if (data.length > 0 && !config.projectId) {
            onConfigChange("projectId", data[0].id);
        }
      }
      setLoading(false);
    }
    loadProjects();
  }, []);

  return (
    <div className="p-4 space-y-8 pb-20">
      
      {/* 1. DATA SOURCE */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider flex items-center gap-2">
            <Map className="w-3 h-3" /> Data Source
        </h3>
        {loading ? <Loader2 className="w-4 h-4 animate-spin text-slate-400"/> : (
            <select 
                value={config.projectId}
                onChange={(e) => onConfigChange("projectId", e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
                {projects.map(p => <option key={p.id} value={p.id}>{p.project_name}</option>)}
            </select>
        )}
      </div>

      <hr className="border-slate-200 dark:border-slate-800" />

      {/* 2. TEMPLATE SELECTION (Moved from Right Panel) */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider flex items-center gap-2">
            <Type className="w-3 h-3" /> Template
        </h3>
        <div className="space-y-2">
          {templates.map((t) => (
            <button
              key={t.id}
              onClick={() => onTemplateChange(t.id)}
              className={cn(
                "w-full flex items-start gap-3 p-2.5 rounded-xl border text-left transition-all",
                selectedTemplate === t.id
                  ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 ring-1 ring-indigo-600"
                  : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
              )}
            >
              <div className={cn(
                  "p-1.5 rounded-lg shrink-0",
                  selectedTemplate === t.id ? "bg-white dark:bg-slate-900 text-indigo-600" : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                )}
              >
                {t.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold truncate">{t.label}</div>
                <div className="text-[10px] text-slate-500 truncate">{t.desc}</div>
              </div>
              {selectedTemplate === t.id && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 ml-auto mt-1" />}
            </button>
          ))}
        </div>
      </div>

      <hr className="border-slate-200 dark:border-slate-800" />

      {/* 3. REPORT HEADER */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider flex items-center gap-2">
            <FileText className="w-3 h-3" /> Header Info
        </h3>
        <div className="space-y-2">
            <label className="text-xs text-slate-500">Report Title</label>
            <input 
                type="text" 
                value={config.title} 
                onChange={(e) => onConfigChange("title", e.target.value)}
                className="w-full text-xs p-2 rounded border bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-700 outline-none focus:border-indigo-500 transition-colors" 
            />
        </div>
      </div>

      <hr className="border-slate-200 dark:border-slate-800" />

      {/* 4. FILTERING */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider flex items-center gap-2">
            <Filter className="w-3 h-3" /> Data Filters
        </h3>
        
        {/* Condition Buttons */}
        <div className="space-y-1">
            <label className="text-xs text-slate-500">Condition Focus</label>
            <div className="grid grid-cols-2 gap-2">
                <FilterButton label="All Assets" active={config.condition === 'all'} onClick={() => onConfigChange("condition", "all")} />
                <FilterButton label="Critical Only" color="bg-rose-500" active={config.condition === 'critical'} onClick={() => onConfigChange("condition", "critical")} />
            </div>
        </div>
      </div>

      {/* 5. COLUMNS TOGGLES (Removed District) */}
      <div className="space-y-3 pt-2">
        <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider flex items-center gap-2">
            <Columns className="w-3 h-3" /> Columns
        </h3>
        <div className="space-y-2">
            <Toggle label="Show Surface Type" checked={config.showSurface} onChange={(v: boolean) => onConfigChange("showSurface", v)} />
            <Toggle label="Show Est. Cost" checked={config.showCost} onChange={(v: boolean) => onConfigChange("showCost", v)} />
        </div>
      </div>

      {/* 6. GROUPING (Removed District) */}
      <div className="space-y-3 pt-2">
        <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider flex items-center gap-2">
            <Layers className="w-3 h-3" /> Grouping
        </h3>
        <div className="flex gap-2 bg-slate-100 dark:bg-slate-900 p-1 rounded-lg">
            {['none', 'criticality'].map(opt => (
                <button 
                    key={opt}
                    onClick={() => onConfigChange("groupBy", opt)} 
                    className={`flex-1 text-[10px] py-1.5 rounded-md capitalize transition ${config.groupBy === opt ? 'bg-white shadow text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    {opt}
                </button>
            ))}
        </div>
      </div>

    </div>
  );
}

// Sub-components
const FilterButton = ({ label, color, active, onClick }: any) => (
    <button 
        onClick={onClick}
        className={`text-[10px] px-2 py-2 rounded border text-center transition-all ${active ? 'border-indigo-500 ring-1 ring-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700' : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-500'}`}
    >
        {color && <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${color}`} />}
        {label}
    </button>
);

const Toggle = ({ label, checked, onChange }: any) => (
    <label className="flex items-center justify-between cursor-pointer group">
        <span className="text-xs text-slate-600 dark:text-slate-300 group-hover:text-indigo-600 transition">{label}</span>
        <div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${checked ? 'bg-indigo-500' : 'bg-slate-300 dark:bg-slate-700'}`} onClick={() => onChange(!checked)}>
            <div className={`w-3 h-3 bg-white rounded-full shadow-sm transition-transform ${checked ? 'translate-x-4' : ''}`} />
        </div>
    </label>
);