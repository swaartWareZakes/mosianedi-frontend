"use client";

import React, { useEffect, useState } from "react";
import { Map, FileText, Settings2, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export default function ReportFilterSidebar({ config, onConfigChange }: any) {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
            <Map className="w-3 h-3" /> Target Project
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

      {/* 2. REPORT HEADER */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider flex items-center gap-2">
            <FileText className="w-3 h-3" /> Document Details
        </h3>
        <div className="space-y-3">
            <div>
                <label className="text-[10px] text-slate-500 mb-1 block">Document Title</label>
                <input 
                    type="text" 
                    value={config.title} 
                    onChange={(e) => onConfigChange("title", e.target.value)}
                    className="w-full text-xs p-2 rounded border bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-700 outline-none focus:border-indigo-500 transition-colors" 
                />
            </div>
            <div>
                <label className="text-[10px] text-slate-500 mb-1 block">Prepared By</label>
                <input 
                    type="text" 
                    value={config.author} 
                    onChange={(e) => onConfigChange("author", e.target.value)}
                    className="w-full text-xs p-2 rounded border bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-700 outline-none focus:border-indigo-500 transition-colors" 
                />
            </div>
        </div>
      </div>

      <hr className="border-slate-200 dark:border-slate-800" />

      {/* 3. SECTIONS */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider flex items-center gap-2">
            <Settings2 className="w-3 h-3" /> Content Sections
        </h3>
        <div className="space-y-2">
            <Toggle label="Include AI Strategy Narrative" checked={config.showAiNarrative} onChange={(v: boolean) => onConfigChange("showAiNarrative", v)} />
            <Toggle label="Include Financial Schedule" checked={config.showSchedule} onChange={(v: boolean) => onConfigChange("showSchedule", v)} />
        </div>
      </div>
    </div>
  );
}

const Toggle = ({ label, checked, onChange }: any) => (
    <label className="flex items-center justify-between cursor-pointer group p-1">
        <span className="text-xs text-slate-600 dark:text-slate-300 group-hover:text-indigo-600 transition">{label}</span>
        <div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${checked ? 'bg-indigo-500' : 'bg-slate-300 dark:bg-slate-700'}`} onClick={() => onChange(!checked)}>
            <div className={`w-3 h-3 bg-white rounded-full shadow-sm transition-transform ${checked ? 'translate-x-4' : ''}`} />
        </div>
    </label>
);