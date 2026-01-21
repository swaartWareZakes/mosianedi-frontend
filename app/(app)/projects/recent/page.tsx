"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { 
  Activity, 
  FileText, 
  User, 
  Clock, 
  ArrowLeft,
  CheckCircle2,
  UploadCloud,
  ShieldAlert,
  Plus,
  Settings, // New Icon
  Play      // New Icon
} from "lucide-react";
import { cn } from "@/lib/utils";

// --- TYPES ---
type ActivityLog = {
  id: string;
  project_id: string | null;
  user_id: string | null;
  action_type: string;
  details: any;
  created_at: string;
  // Hydrated fields
  project_name?: string;
  user_name?: string;
  user_email?: string;
};

export default function RecentActivityPage() {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFeed() {
      setLoading(true);

      // 1. Fetch Logs
      const { data: logs, error } = await supabase
        .from("project_activity_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error || !logs) {
        console.error("Error fetching logs", error);
        setLoading(false);
        return;
      }

      // 2. Extract IDs for bulk fetching
      const userIds = [...new Set(logs.map(l => l.user_id).filter(Boolean))];
      const projectIds = [...new Set(logs.map(l => l.project_id).filter(Boolean))];

      // 3. Fetch Related Data
      const [usersRes, projectsRes] = await Promise.all([
        supabase.from("profiles").select("user_id, first_name, last_name, email").in("user_id", userIds),
        supabase.from("projects").select("id, project_name").in("id", projectIds)
      ]);

      // 4. Create Lookup Maps
      const userMap = new Map(usersRes.data?.map(u => [u.user_id, u]));
      const projectMap = new Map(projectsRes.data?.map(p => [p.id, p]));

      // 5. Hydrate Logs
      const hydratedLogs = logs.map(log => {
        const user = userMap.get(log.user_id);
        const project = projectMap.get(log.project_id);
        return {
          ...log,
          user_name: user ? `${user.first_name} ${user.last_name}` : "Unknown User",
          user_email: user?.email,
          project_name: project?.project_name || "Deleted Project"
        };
      });

      setActivities(hydratedLogs);
      setLoading(false);
    }

    loadFeed();
  }, []);

  return (
    <div className="h-full w-full bg-[var(--background)] p-8 overflow-y-auto">
      <div className="max-w-4xl mx-auto space-y-8 pb-12">
        
        {/* HEADER */}
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
                <Link href="/projects" className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <ArrowLeft className="w-5 h-5 text-slate-500" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                        <Activity className="w-6 h-6 text-indigo-500" />
                        Activity Feed
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Real-time audit log of all project actions.</p>
                </div>
            </div>
        </div>

        {/* FEED LIST */}
        <div className="bg-white dark:bg-[var(--surface-bg)] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
            {loading ? (
                <div className="p-12 space-y-4">
                    {[1,2,3,4].map(i => (
                        <div key={i} className="flex gap-4 animate-pulse">
                            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800" />
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-1/3" />
                                <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-1/4" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : activities.length === 0 ? (
                <div className="py-20 text-center flex flex-col items-center">
                    <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 text-slate-400">
                        <Clock className="w-8 h-8" />
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-white">No activity yet</h3>
                    <p className="text-slate-500 text-sm mt-1">Actions taken on projects will appear here.</p>
                </div>
            ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {activities.map((log) => (
                        <LogItem key={log.id} log={log} />
                    ))}
                </div>
            )}
        </div>

      </div>
    </div>
  );
}

// --- SUB COMPONENT: Log Item ---

function LogItem({ log }: { log: ActivityLog }) {
    
    // Determine Icon & Color based on Action Type
    const getConfig = (type: string) => {
        switch(type) {
            case 'create_project': return { icon: <Plus className="w-4 h-4"/>, color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400", text: "created a new program" };
            case 'status_change': return { icon: <CheckCircle2 className="w-4 h-4"/>, color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400", text: "updated status to" };
            case 'data_upload': return { icon: <UploadCloud className="w-4 h-4"/>, color: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400", text: "uploaded new data" };
            case 'assign_lead': return { icon: <User className="w-4 h-4"/>, color: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400", text: "assigned a lead" };
            // NEW ACTIONS:
            case 'config_update': return { icon: <Settings className="w-4 h-4"/>, color: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400", text: "updated configuration" };
            case 'simulation_run': return { icon: <Play className="w-4 h-4"/>, color: "bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400", text: "ran a simulation" };
            
            default: return { icon: <FileText className="w-4 h-4"/>, color: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400", text: "updated" };
        }
    };

    const config = getConfig(log.action_type);
    
    // Format timestamp nicely
    const date = new Date(log.created_at);
    const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateStr = date.toLocaleDateString([], { month: 'short', day: 'numeric' });

    // Extract detail value if available (handling different detail structures)
    const detailText = log.details?.to || log.details?.filename || log.details?.note || "";

    return (
        <div className="group flex items-start gap-4 p-5 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
            
            {/* 1. Icon */}
            <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-1", config.color)}>
                {config.icon}
            </div>

            {/* 2. Content */}
            <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <p className="text-sm text-slate-900 dark:text-slate-200">
                        <span className="font-bold">{log.user_name}</span>{" "}
                        <span className="text-slate-500 dark:text-slate-400">{config.text}</span>{" "}
                        {/* Only show detail chip if not generic "note" or if it is a specific value like "Planning" */}
                        {detailText && detailText !== "User saved new inputs" && (
                            <span className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-300 mx-1">
                                {String(detailText).toUpperCase()}
                            </span>
                        )}
                    </p>
                    <span className="text-[10px] text-slate-400 whitespace-nowrap flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {dateStr} at {timeStr}
                    </span>
                </div>
                
                {log.project_id && (
                    <Link 
                        href={`/projects/${log.project_id}/dashboard`}
                        className="inline-flex items-center gap-1.5 mt-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                        <FileText className="w-3 h-3" />
                        {log.project_name}
                    </Link>
                )}
            </div>
        </div>
    );
}