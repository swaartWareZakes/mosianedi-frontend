"use client";

import React, { useEffect, useState } from "react";
import { Folder, Clock, ChevronRight, BarChart3, AlertCircle } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export default function ProjectHistory() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProjects() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
            .from("projects")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });
        
        setProjects(data || []);
        setLoading(false);
    }
    loadProjects();
  }, []);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
            <Folder className="w-5 h-5 text-indigo-500" />
            Project Portfolio
        </h3>
        <span className="text-xs font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-500">
            {projects.length} Total
        </span>
      </div>

      {loading ? (
          <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-16 bg-slate-50 rounded-xl animate-pulse" />)}
          </div>
      ) : projects.length === 0 ? (
          <div className="p-8 text-center text-slate-400 border border-dashed border-slate-200 rounded-xl">
              <Folder className="w-8 h-8 mx-auto mb-2 opacity-50" />
              No projects created yet.
          </div>
      ) : (
          <div className="space-y-3">
              {projects.map((project) => (
                  <Link 
                    key={project.id} 
                    href={`/projects/${project.id}/dashboard`}
                    className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-900 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all group"
                  >
                      <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600">
                              <BarChart3 className="w-5 h-5" />
                          </div>
                          <div>
                              <div className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-indigo-600 transition-colors">
                                  {project.project_name}
                              </div>
                              <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                                  <Clock className="w-3 h-3" />
                                  Created {new Date(project.created_at).toLocaleDateString()}
                              </div>
                          </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                          <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded ${project.proposal_status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                              {project.proposal_status || 'Draft'}
                          </span>
                          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                      </div>
                  </Link>
              ))}
          </div>
      )}
    </div>
  );
}