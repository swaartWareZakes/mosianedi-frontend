"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  FileText,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

// --- TYPES ---
type Profile = {
  user_id: string;
  first_name: string;
  last_name: string;
};

type ProjectGovSummary = {
  id: string;
  project_name: string;
  province: string;
  status: 'backlog' | 'planning' | 'review' | 'published';
  assignee_id: string | null;
  assignee?: Profile; 
  updated_at: string;
};

export default function GlobalGovernancePage() {
  const [projects, setProjects] = useState<ProjectGovSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadGovernanceOverview() {
      // 1. Fetch Projects (No Joins to prevent 400 Error)
      const { data: projectData, error: projError } = await supabase
          .from("projects")
          .select("id, project_name, province, status, updated_at, assignee_id")
          .order("updated_at", { ascending: false });

      if (projError) {
          console.error("Error loading projects:", projError);
          setLoading(false);
          return;
      }

      // 2. Fetch Profiles Separately
      const assigneeIds = [...new Set(projectData?.map(p => p.assignee_id).filter(Boolean))];
      let profileMap = new Map<string, Profile>();
      
      if (assigneeIds.length > 0) {
          const { data: profileData } = await supabase
              .from("profiles")
              .select("user_id, first_name, last_name")
              .in("user_id", assigneeIds);
          
          profileData?.forEach((p: any) => profileMap.set(p.user_id, p));
      }

      // 3. Merge Data
      const combined = (projectData || []).map((p: any) => ({
          ...p,
          status: p.status || 'backlog',
          assignee: p.assignee_id ? profileMap.get(p.assignee_id) : undefined
      }));

      setProjects(combined);
      setLoading(false);
    }
    loadGovernanceOverview();
  }, []);

  // Helper to count projects by status
  const count = (status: string) => projects.filter(p => p.status === status).length;

  return (
    <div className="h-full w-full bg-[var(--background)] p-8 overflow-y-auto">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Governance Oversight</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Monitor compliance, approval workflows, and project lifecycle status.</p>
        </div>

        {/* 1. KPI CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <KpiCard label="In Planning" value={count('planning')} icon={<FileText className="w-5 h-5 text-blue-500"/>} />
            <KpiCard label="Needs Review" value={count('review')} icon={<AlertCircle className="w-5 h-5 text-amber-500"/>} highlight />
            <KpiCard label="Published" value={count('published')} icon={<CheckCircle2 className="w-5 h-5 text-emerald-500"/>} />
            <KpiCard label="Backlog" value={count('backlog')} icon={<Clock className="w-5 h-5 text-slate-500"/>} />
        </div>

        {/* 2. PROJECT TABLE */}
        <section className="bg-white dark:bg-[var(--surface-bg)] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <h3 className="font-bold text-slate-900 dark:text-white">Project Portfolio Status</h3>
            </div>
            
            {loading ? (
                <div className="p-12 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-slate-400"/></div>
            ) : projects.length === 0 ? (
                <div className="p-12 text-center text-slate-500">No projects found.</div>
            ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    <div className="grid grid-cols-12 px-6 py-3 bg-slate-50/50 dark:bg-slate-900/50 text-xs font-bold uppercase tracking-wider text-slate-500">
                        <div className="col-span-4">Project Name</div>
                        <div className="col-span-2">Province</div>
                        <div className="col-span-2">Lead</div>
                        <div className="col-span-2">Status</div>
                        <div className="col-span-2 text-right">Action</div>
                    </div>
                    {projects.map((p) => (
                        <div key={p.id} className="grid grid-cols-12 px-6 py-4 items-center hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                            <div className="col-span-4 font-medium text-slate-900 dark:text-white truncate pr-4">
                                {p.project_name}
                            </div>
                            <div className="col-span-2 text-sm text-slate-500">{p.province}</div>
                            <div className="col-span-2 text-sm text-slate-500">
                                {p.assignee ? `${p.assignee.first_name} ${p.assignee.last_name}` : <span className="text-slate-400 italic">Unassigned</span>}
                            </div>
                            <div className="col-span-2">
                                <StatusBadge status={p.status} />
                            </div>
                            <div className="col-span-2 text-right">
                                <Link 
                                    href={`/projects/${p.id}/governance`} 
                                    className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                                >
                                    Manage <ArrowRight className="w-3 h-3" />
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>

      </div>
    </div>
  );
}

// --- SUB-COMPONENTS (Global View) ---

function KpiCard({ label, value, icon, highlight }: any) {
    return (
        <div className={cn(
            "p-5 rounded-2xl border flex flex-col justify-between h-28",
            highlight 
                ? "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800" 
                : "bg-white dark:bg-[var(--surface-bg)] border-slate-200 dark:border-slate-800"
        )}>
            <div className="flex justify-between items-start">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</span>
                {icon}
            </div>
            <div className="text-3xl font-black text-slate-900 dark:text-white">{value}</div>
        </div>
    )
}

function StatusBadge({ status }: { status: string }) {
    type StatusKey = 'backlog' | 'planning' | 'review' | 'published';
    const config: Record<StatusKey, { color: string; label: string }> = {
        backlog: { color: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400", label: "Backlog" },
        planning: { color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400", label: "Planning" },
        review: { color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400", label: "In Review" },
        published: { color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400", label: "Published" },
    };
    const activeConfig = config[status as StatusKey] || config.backlog;
    return (
        <span className={cn("px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider", activeConfig.color)}>
            {activeConfig.label}
        </span>
    );
}