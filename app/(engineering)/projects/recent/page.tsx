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
  Plus,
  Settings,
  Play,
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

const BORDER_SOFT =
  "border-[color:color-mix(in_oklab,var(--foreground)_14%,transparent)]";
const TEXT_MUTED =
  "text-[color:color-mix(in_oklab,var(--foreground)_60%,transparent)]";
const TEXT_SOFT =
  "text-[color:color-mix(in_oklab,var(--foreground)_45%,transparent)]";

export default function RecentActivityPage() {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFeed() {
      setLoading(true);

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

      const userIds = [...new Set(logs.map((l) => l.user_id).filter(Boolean))];
      const projectIds = [
        ...new Set(logs.map((l) => l.project_id).filter(Boolean)),
      ];

      const [usersRes, projectsRes] = await Promise.all([
        supabase
          .from("profiles")
          .select("user_id, first_name, last_name, email")
          .in("user_id", userIds),
        supabase
          .from("projects")
          .select("id, project_name")
          .in("id", projectIds),
      ]);

      const userMap = new Map(usersRes.data?.map((u) => [u.user_id, u]));
      const projectMap = new Map(projectsRes.data?.map((p) => [p.id, p]));

      const hydratedLogs = logs.map((log) => {
        const user = userMap.get(log.user_id);
        const project = projectMap.get(log.project_id);
        return {
          ...log,
          user_name: user ? `${user.first_name} ${user.last_name}` : "Unknown User",
          user_email: user?.email,
          project_name: project?.project_name || "Deleted Project",
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
            <Link
              href="/projects"
              className={cn(
                "p-2 rounded-full transition-colors",
                "hover:bg-[color:color-mix(in_oklab,var(--foreground)_8%,transparent)]"
              )}
            >
              <ArrowLeft className={cn("w-5 h-5", TEXT_SOFT)} />
            </Link>

            <div>
              <h1 className="text-2xl font-bold text-[var(--foreground)] tracking-tight flex items-center gap-2">
                <Activity className="w-6 h-6 text-[var(--accent-color)]" />
                Activity Feed
              </h1>
              <p className={cn("text-sm", TEXT_MUTED)}>
                Real-time audit log of all project actions.
              </p>
            </div>
          </div>
        </div>

        {/* FEED LIST */}
        <div
          className={cn(
            "rounded-2xl shadow-sm overflow-hidden",
            "bg-[var(--surface-bg)] border",
            BORDER_SOFT
          )}
        >
          {loading ? (
            <div className="p-12 space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex gap-4 animate-pulse">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full",
                      "bg-[color:color-mix(in_oklab,var(--foreground)_10%,transparent)]"
                    )}
                  />
                  <div className="flex-1 space-y-2">
                    <div
                      className={cn(
                        "h-4 rounded w-1/3",
                        "bg-[color:color-mix(in_oklab,var(--foreground)_10%,transparent)]"
                      )}
                    />
                    <div
                      className={cn(
                        "h-3 rounded w-1/4",
                        "bg-[color:color-mix(in_oklab,var(--foreground)_10%,transparent)]"
                      )}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : activities.length === 0 ? (
            <div className="py-20 text-center flex flex-col items-center">
              <div
                className={cn(
                  "w-16 h-16 rounded-full flex items-center justify-center mb-4",
                  "bg-[color:color-mix(in_oklab,var(--foreground)_8%,transparent)]",
                  TEXT_SOFT
                )}
              >
                <Clock className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-[var(--foreground)]">No activity yet</h3>
              <p className={cn("text-sm mt-1", TEXT_MUTED)}>
                Actions taken on projects will appear here.
              </p>
            </div>
          ) : (
            <div className={cn("divide-y", "divide-[color:color-mix(in_oklab,var(--foreground)_10%,transparent)]")}>
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
  const getConfig = (type: string) => {
    switch (type) {
      case "create_project":
        return {
          icon: <Plus className="w-4 h-4" />,
          color:
            "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
          text: "created a new program",
        };
      case "status_change":
        return {
          icon: <CheckCircle2 className="w-4 h-4" />,
          color:
            "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
          text: "updated status to",
        };
      case "data_upload":
        return {
          icon: <UploadCloud className="w-4 h-4" />,
          color:
            "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
          text: "uploaded new data",
        };
      case "assign_lead":
        return {
          icon: <User className="w-4 h-4" />,
          color:
            "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
          text: "assigned a lead",
        };
      case "config_update":
        return {
          icon: <Settings className="w-4 h-4" />,
          color:
            "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
          text: "updated configuration",
        };
      case "simulation_run":
        return {
          icon: <Play className="w-4 h-4" />,
          color:
            "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
          text: "ran a simulation",
        };
      default:
        return {
          icon: <FileText className="w-4 h-4" />,
          color:
            "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
          text: "updated",
        };
    }
  };

  const config = getConfig(log.action_type);

  const date = new Date(log.created_at);
  const timeStr = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const dateStr = date.toLocaleDateString([], { month: "short", day: "numeric" });

  const detailText = log.details?.to || log.details?.filename || log.details?.note || "";

  return (
    <div
      className={cn(
        "group flex items-start gap-4 p-5 transition-colors",
        "hover:bg-[color:color-mix(in_oklab,var(--foreground)_6%,transparent)]"
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-1",
          config.color
        )}
      >
        {config.icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <p className="text-sm text-[var(--foreground)]">
            <span className="font-bold">{log.user_name}</span>{" "}
            <span className="text-[color:color-mix(in_oklab,var(--foreground)_55%,transparent)]">
              {config.text}
            </span>{" "}
            {detailText && detailText !== "User saved new inputs" && (
              <span
                className={cn(
                  "font-mono text-xs px-1.5 py-0.5 rounded mx-1",
                  "bg-[color:color-mix(in_oklab,var(--foreground)_10%,transparent)]",
                  "text-[color:color-mix(in_oklab,var(--foreground)_70%,transparent)]"
                )}
              >
                {String(detailText).toUpperCase()}
              </span>
            )}
          </p>

          <span
            className={cn(
              "text-[10px] whitespace-nowrap flex items-center gap-1",
              "text-[color:color-mix(in_oklab,var(--foreground)_45%,transparent)]"
            )}
          >
            <Clock className="w-3 h-3" />
            {dateStr} at {timeStr}
          </span>
        </div>

        {log.project_id && (
          <Link
            href={`/projects/${log.project_id}/dashboard`}
            className="inline-flex items-center gap-1.5 mt-1.5 text-xs font-medium text-[var(--accent-color)] hover:underline"
          >
            <FileText className="w-3 h-3" />
            {log.project_name}
          </Link>
        )}
      </div>
    </div>
  );
}