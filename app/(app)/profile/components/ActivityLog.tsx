"use client";

import React, { useEffect, useState } from "react";
import { Activity, PlayCircle, FileText } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export default function ActivityLog() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadActivity() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch recent simulations as a proxy for activity
        const { data } = await supabase
            .from("simulation_results")
            .select("id, run_at, status, projects(project_name)")
            .eq("triggered_by", user.id) // Assuming column exists based on schema
            .order("run_at", { ascending: false })
            .limit(5);
        
        setLogs(data || []);
        setLoading(false);
    }
    loadActivity();
  }, []);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-6 text-slate-900 dark:text-white font-bold text-lg">
          <Activity className="w-5 h-5 text-emerald-500" />
          Recent Activity
      </div>

      <div className="relative border-l-2 border-slate-100 dark:border-slate-800 ml-3 space-y-8 pb-2">
          {loading ? (
              <div className="pl-6 text-sm text-slate-400">Loading activity...</div>
          ) : logs.length === 0 ? (
              <div className="pl-6 text-sm text-slate-400 italic">No recent activity found.</div>
          ) : (
              logs.map((log) => (
                  <div key={log.id} className="relative pl-6 group">
                      {/* Timeline Dot */}
                      <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full border-4 border-white dark:border-slate-900 bg-emerald-500 shadow-sm group-hover:scale-125 transition-transform" />
                      
                      <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                              {new Date(log.run_at).toLocaleString()}
                          </span>
                          <div className="font-medium text-slate-900 dark:text-white text-sm">
                              Executed Simulation Run
                          </div>
                          <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                              <PlayCircle className="w-3 h-3" />
                              Project: <span className="font-semibold text-indigo-500">{(log.projects as any)?.project_name || "Unknown"}</span>
                          </div>
                      </div>
                  </div>
              ))
          )}
      </div>
    </div>
  );
}