"use client";

import React from "react";
import Link from "next/link";
import { FileText, User, Clock, Loader2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Profile = {
  first_name: string;
  last_name: string;
};

// --- UPDATED TYPE DEFINITION ---
export type Project = {
  id: string;
  project_name: string;
  province: string;
  start_year: number;
  status: "draft" | "backlog" | "planning" | "review" | "published" | "archived"; // Added 'draft'
  created_at: string;
  assignee?: Profile;
  assignee_id: string | null; 
  user_id: string;
};

interface ProjectCardProps {
  project: Project;
  onDelete: (id: string) => void;
  isDeleting: boolean;
  currentUserId: string | null;
}

export function ProjectCard({ project, onDelete, isDeleting, currentUserId }: ProjectCardProps) {
  
  // 1. Define the config map
  const configMap = {
    draft: { color: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400", label: "Draft" },
    backlog: { color: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400", label: "Backlog" },
    planning: { color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400", label: "Planning" },
    review: { color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400", label: "In Review" },
    published: { color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400", label: "Published" },
    archived: { color: "bg-slate-100 text-slate-400", label: "Archived" },
  };

  // 2. Safe Access with Fallback
  const statusKey = project.status || "draft";
  // @ts-ignore - Keeps TS happy if DB returns a weird string
  const statusConfig = configMap[statusKey] || configMap.draft;

  const formattedDate = project.created_at ? new Date(project.created_at).toLocaleDateString() : "N/A";
  const isOwner = currentUserId === project.user_id;

  return (
    <div className="relative group h-full">
      <Link
        href={`/projects/${project.id}/config`}
        className="block bg-white dark:bg-[var(--surface-bg)] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 hover:border-indigo-500 dark:hover:border-indigo-500 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 flex flex-col h-full"
      >
        {/* Header: Icon + Status */}
        <div className="flex justify-between items-start mb-4">
          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl group-hover:scale-110 transition-transform duration-300">
            <FileText className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <span className={cn("px-2.5 py-1 rounded-lg text-[10px] uppercase font-bold tracking-wider", statusConfig.color)}>
            {statusConfig.label}
          </span>
        </div>

        {/* Body: Title + Province */}
        <div className="mb-4 flex-1">
          <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1 group-hover:text-indigo-600 transition-colors line-clamp-1">
            {project.project_name}
          </h3>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="font-medium text-slate-700 dark:text-slate-300">{project.province}</span>
            <span>•</span>
            <span>FY{project.start_year}</span>
          </div>
        </div>

        {/* Footer: Assignee + Date + DELETE BUTTON */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Assignee Avatar */}
            <div className="flex items-center gap-2">
                {project.assignee ? (
                <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold" title={`${project.assignee.first_name} ${project.assignee.last_name}`}>
                    {project.assignee.first_name[0]}{project.assignee.last_name[0]}
                </div>
                ) : (
                <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
                    <User className="w-3 h-3" />
                </div>
                )}
            </div>

            <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400">
                <Clock className="w-3 h-3" />
                {formattedDate}
            </div>
          </div>

          {/* --- THE BIN IS HERE NOW (Safe Spot) --- */}
          {isOwner && (
            <button
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onDelete(project.id);
                }}
                disabled={isDeleting}
                className="p-2 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all opacity-0 group-hover:opacity-100"
                title="Delete Project"
            >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin text-rose-500" /> : <Trash2 className="w-4 h-4" />}
            </button>
           )}
        </div>
      </Link>
    </div>
  );
}