"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { LayoutDashboard, FolderSearch, ArrowRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function GlobalDashboardSelectPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProjects() {
      const { data } = await supabase
        .from("projects")
        .select("id, project_name, province, updated_at")
        .order("updated_at", { ascending: false });
        
      if (data) setProjects(data);
      setLoading(false);
    }
    loadProjects();
  }, []);

  const handleSelect = (id: string) => {
    // Routes exactly to the main project dashboard
    router.push(`/projects/${id}/dashboard`);
  };

  return (
    <div className="h-full w-full flex flex-col items-center justify-center p-8 bg-[var(--background)] animate-in fade-in duration-500">
      <div className="max-w-2xl w-full text-center space-y-6">
        
        {/* Icon & Copy */}
        <div className="w-20 h-20 mx-auto bg-[color:color-mix(in_oklab,var(--accent-color)_10%,transparent)] rounded-full flex items-center justify-center mb-6">
          <LayoutDashboard className="w-10 h-10 text-[var(--accent-color)]" />
        </div>
        
        <h1 className="text-3xl font-bold text-[var(--foreground)]">Project Dashboard</h1>
        <p className="text-[color:color-mix(in_oklab,var(--foreground)_60%,transparent)] max-w-lg mx-auto leading-relaxed">
          To view detailed asset valuations, simulation metrics, and forecast strategies, please select a workspace below.
        </p>

        {/* Project Selector List */}
        <div className="mt-12 text-left bg-[var(--surface-bg)] border border-[color:color-mix(in_oklab,var(--foreground)_14%,transparent)] rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-[color:color-mix(in_oklab,var(--foreground)_4%,transparent)] px-6 py-4 border-b border-[color:color-mix(in_oklab,var(--foreground)_10%,transparent)] flex items-center gap-3">
            <FolderSearch className="w-5 h-5 text-[var(--accent-color)]" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-[color:color-mix(in_oklab,var(--foreground)_60%,transparent)]">
              Select a Workspace
            </h2>
          </div>
          
          <div className="max-h-[300px] overflow-y-auto">
            {loading ? (
              <div className="p-8 flex justify-center text-[color:color-mix(in_oklab,var(--foreground)_50%,transparent)]">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : projects.length === 0 ? (
              <div className="p-8 text-center text-sm text-[color:color-mix(in_oklab,var(--foreground)_50%,transparent)]">
                No active projects found.
              </div>
            ) : (
              projects.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleSelect(p.id)}
                  className="w-full flex items-center justify-between px-6 py-4 border-b border-[color:color-mix(in_oklab,var(--foreground)_6%,transparent)] hover:bg-[color:color-mix(in_oklab,var(--foreground)_4%,transparent)] transition-colors group text-left"
                >
                  <div>
                    <div className="font-bold text-[var(--foreground)] group-hover:text-[var(--accent-color)] transition-colors">
                      {p.project_name}
                    </div>
                    <div className="text-xs text-[color:color-mix(in_oklab,var(--foreground)_50%,transparent)] mt-1">
                      {p.province} • Last updated {new Date(p.updated_at).toLocaleDateString()}
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[color:color-mix(in_oklab,var(--foreground)_30%,transparent)] group-hover:text-[var(--accent-color)] group-hover:translate-x-1 transition-all" />
                </button>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}