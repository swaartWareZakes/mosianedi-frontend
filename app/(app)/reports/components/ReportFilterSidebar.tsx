"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Map, FileText, Settings2, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { cn } from "@/lib/utils";

export default function ReportFilterSidebar({ config, onConfigChange }: any) {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const TOKENS = useMemo(() => {
    const TEXT = "text-[var(--foreground)]";
    const SOFT = "text-[color:color-mix(in_oklab,var(--foreground)_55%,transparent)]";
    const MUTED = "text-[color:color-mix(in_oklab,var(--foreground)_40%,transparent)]";
    const BORDER = "border-[color:color-mix(in_oklab,var(--foreground)_14%,transparent)]";
    const BORDER_SOFT = "border-[color:color-mix(in_oklab,var(--foreground)_10%,transparent)]";
    const PANEL = "bg-[color:color-mix(in_oklab,var(--surface-bg)_92%,transparent)]";
    const INPUT = "bg-[color:color-mix(in_oklab,var(--surface-bg)_88%,transparent)]";
    const HOVER = "hover:bg-[color:color-mix(in_oklab,var(--surface-bg)_84%,transparent)]";
    return { TEXT, SOFT, MUTED, BORDER, BORDER_SOFT, PANEL, INPUT, HOVER };
  }, []);

  useEffect(() => {
    async function loadProjects() {
      setLoading(true);

      const { data } = await supabase
        .from("projects")
        .select("id, project_name")
        .order("created_at", { ascending: false });

      if (data) {
        setProjects(data);
        if (data.length > 0 && !config.projectId) onConfigChange("projectId", data[0].id);
      }

      setLoading(false);
    }

    loadProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="p-4 space-y-8 pb-20">
      {/* 1. DATA SOURCE */}
      <div className="space-y-3">
        <h3 className={cn("text-xs font-black uppercase tracking-wider flex items-center gap-2", TOKENS.MUTED)}>
          <Map className="w-3 h-3" /> Target Project
        </h3>

        {loading ? (
          <Loader2 className={cn("w-4 h-4 animate-spin", TOKENS.MUTED)} />
        ) : (
          <select
            value={config.projectId}
            onChange={(e) => onConfigChange("projectId", e.target.value)}
            className={cn(
              "w-full text-xs p-2.5 rounded-xl border outline-none cursor-pointer",
              "focus:ring-2 focus:ring-indigo-500",
              TOKENS.INPUT,
              TOKENS.BORDER,
              TOKENS.TEXT,
              TOKENS.HOVER
            )}
          >
            {projects.map((p: any) => (
              <option key={p.id} value={p.id}>
                {p.project_name}
              </option>
            ))}
          </select>
        )}
      </div>

      <hr className={cn("border-t", TOKENS.BORDER_SOFT)} />

      {/* 2. REPORT HEADER */}
      <div className="space-y-3">
        <h3 className={cn("text-xs font-black uppercase tracking-wider flex items-center gap-2", TOKENS.MUTED)}>
          <FileText className="w-3 h-3" /> Document Details
        </h3>

        <div className="space-y-3">
          <div>
            <label className={cn("text-[10px] mb-1 block font-semibold", TOKENS.SOFT)}>Document Title</label>
            <input
              type="text"
              value={config.title}
              onChange={(e) => onConfigChange("title", e.target.value)}
              className={cn(
                "w-full text-xs p-2.5 rounded-xl border outline-none transition-colors",
                "focus:ring-2 focus:ring-indigo-500",
                TOKENS.INPUT,
                TOKENS.BORDER,
                TOKENS.TEXT
              )}
            />
          </div>

          <div>
            <label className={cn("text-[10px] mb-1 block font-semibold", TOKENS.SOFT)}>Prepared By</label>
            <input
              type="text"
              value={config.author}
              onChange={(e) => onConfigChange("author", e.target.value)}
              className={cn(
                "w-full text-xs p-2.5 rounded-xl border outline-none transition-colors",
                "focus:ring-2 focus:ring-indigo-500",
                TOKENS.INPUT,
                TOKENS.BORDER,
                TOKENS.TEXT
              )}
            />
          </div>
        </div>
      </div>

      <hr className={cn("border-t", TOKENS.BORDER_SOFT)} />

      {/* 3. SECTIONS */}
      <div className="space-y-3">
        <h3 className={cn("text-xs font-black uppercase tracking-wider flex items-center gap-2", TOKENS.MUTED)}>
          <Settings2 className="w-3 h-3" /> Content Sections
        </h3>

        <div className="space-y-2">
          <Toggle
            label="Include AI Strategy Narrative"
            checked={config.showAiNarrative}
            onChange={(v: boolean) => onConfigChange("showAiNarrative", v)}
          />
          <Toggle
            label="Include Financial Schedule"
            checked={config.showSchedule}
            onChange={(v: boolean) => onConfigChange("showSchedule", v)}
          />
        </div>
      </div>
    </div>
  );
}

const Toggle = ({ label, checked, onChange }: any) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    className="w-full flex items-center justify-between cursor-pointer group p-1"
  >
    <span className="text-xs font-semibold text-[color:color-mix(in_oklab,var(--foreground)_70%,transparent)] group-hover:text-indigo-600 transition">
      {label}
    </span>

    <div
      className={cn(
        "w-9 h-5 rounded-full p-0.5 transition-colors border",
        checked
          ? "bg-indigo-600 border-indigo-600"
          : "bg-[color:color-mix(in_oklab,var(--foreground)_10%,transparent)] border-[color:color-mix(in_oklab,var(--foreground)_18%,transparent)]"
      )}
    >
      <div
        className={cn(
          "w-4 h-4 bg-white rounded-full shadow-sm transition-transform",
          checked ? "translate-x-4" : "translate-x-0"
        )}
      />
    </div>
  </button>
);