"use client";

import React from "react";
import Link from "next/link";
import { FileText, User, Clock, Loader2, Trash2, Map, Building2, MapPin, Route as RouteIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Profile = {
  first_name: string;
  last_name: string;
};

export type ProjectScope = "provincial" | "municipal" | "local" | "route";

export type Project = {
  id: string;
  project_name: string;
  province: string;
  scope?: ProjectScope;
  municipality?: string | null;
  local_area?: string | null;
  route_name?: string | null;
  start_point?: string | null;
  end_point?: string | null;
  route_length_km?: number;
  surface_type?: string;
  climate_zone?: string;
  start_year: number;
  status: "draft" | "backlog" | "planning" | "review" | "published" | "archived";
  created_at: string;
  assignee?: Profile;
  owner?: Profile; // CRITICAL FIX: Added owner to the type
  assignee_id: string | null;
  user_id: string;
};

interface ProjectCardProps {
  project: Project;
  onDelete: (id: string) => void;
  isDeleting: boolean;
  currentUserId: string | null;
  viewMode: "grid" | "list";
}

// Variable-safe helpers
const BORDER_SOFT = "border-[color:color-mix(in_oklab,var(--foreground)_14%,transparent)]";
const BORDER_SOFT_2 = "border-[color:color-mix(in_oklab,var(--foreground)_10%,transparent)]";
const TEXT_MUTED = "text-[color:color-mix(in_oklab,var(--foreground)_60%,transparent)]";
const TEXT_SOFT = "text-[color:color-mix(in_oklab,var(--foreground)_45%,transparent)]";
const BG_HOVER = "hover:bg-[color:color-mix(in_oklab,var(--foreground)_6%,transparent)]";
const BG_SOFT = "bg-[color:color-mix(in_oklab,var(--foreground)_6%,transparent)]";
const BG_SOFT_2 = "bg-[color:color-mix(in_oklab,var(--foreground)_10%,transparent)]";
const ACCENT = "text-[var(--accent-color)]";

export function ProjectCard({
  project,
  onDelete,
  isDeleting,
  currentUserId,
  viewMode
}: ProjectCardProps) {
  
  const configMap: Record<string, { chipBg: string; chipText: string; label: string }> = {
    draft: { chipBg: "bg-[color:color-mix(in_oklab,var(--foreground)_8%,transparent)]", chipText: "text-[color:color-mix(in_oklab,var(--foreground)_65%,transparent)]", label: "Draft" },
    backlog: { chipBg: "bg-[color:color-mix(in_oklab,var(--foreground)_8%,transparent)]", chipText: "text-[color:color-mix(in_oklab,var(--foreground)_65%,transparent)]", label: "Backlog" },
    planning: { chipBg: "bg-[color:color-mix(in_oklab,#3b82f6_18%,transparent)]", chipText: "text-[color:color-mix(in_oklab,#3b82f6_82%,black)]", label: "Planning" },
    review: { chipBg: "bg-[color:color-mix(in_oklab,#f59e0b_18%,transparent)]", chipText: "text-[color:color-mix(in_oklab,#f59e0b_85%,black)]", label: "In Review" },
    published: { chipBg: "bg-[color:color-mix(in_oklab,#10b981_18%,transparent)]", chipText: "text-[color:color-mix(in_oklab,#10b981_85%,black)]", label: "Published" },
    archived: { chipBg: "bg-[color:color-mix(in_oklab,var(--foreground)_6%,transparent)]", chipText: "text-[color:color-mix(in_oklab,var(--foreground)_40%,transparent)]", label: "Archived" },
  };

  const statusKey = project.status || "draft";
  const statusConfig = configMap[statusKey] || configMap.draft;
  const formattedDate = project.created_at ? new Date(project.created_at).toLocaleDateString() : "N/A";
  const isOwner = currentUserId === project.user_id;

  // Derive Owner Name
  const creatorName = project.owner ? `${project.owner.first_name} ${project.owner.last_name}` : "System Admin";

  // Format the location string based on scope
  let locationString = project.province;
  if (project.scope === 'route') {
      locationString = project.route_name ? `${project.route_name} (${project.route_length_km}km)` : `Route in ${project.province}`;
  } else if (project.scope === 'local') {
      locationString = `${project.local_area}, ${project.municipality} (${project.province})`;
  } else if (project.scope === 'municipal') {
      locationString = `${project.municipality} (${project.province})`;
  }

  const ScopeIcon = project.scope === 'route' ? RouteIcon : project.scope === 'local' ? MapPin : project.scope === 'municipal' ? Building2 : Map;

  // --- LIST VIEW ---
  if (viewMode === "list") {
    return (
      <Link
        href={`/projects/${project.id}/config`}
        className={cn(
          "flex items-center justify-between p-4 rounded-2xl transition-all duration-300 border group",
          "bg-[var(--surface-bg)]",
          BORDER_SOFT,
          "hover:border-[var(--accent-color)] hover:shadow-[color:color-mix(in_oklab,var(--accent-color)_15%,transparent)]"
        )}
      >
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className={cn("p-2.5 rounded-xl border", BG_SOFT, BORDER_SOFT_2)}>
             <ScopeIcon className={cn("w-5 h-5", ACCENT)} />
          </div>
          <div className="min-w-0 pr-4">
             <h3 className="font-bold text-base text-[var(--foreground)] truncate group-hover:text-[var(--accent-color)] transition-colors">
               {project.project_name}
             </h3>
             <div className={cn("flex items-center gap-2 text-[10px] mt-1 truncate", TEXT_MUTED)}>
                <span className="font-bold uppercase bg-[color:color-mix(in_oklab,var(--accent-color)_10%,transparent)] px-1.5 py-0.5 rounded text-[var(--accent-color)]">By {creatorName}</span>
                <span className={TEXT_SOFT}>•</span>
                <span className="truncate max-w-[250px]">{locationString}</span>
                <span className={TEXT_SOFT}>•</span>
                <span>FY{project.start_year}</span>
             </div>
          </div>
        </div>

        <div className="flex items-center gap-6 shrink-0">
          <span className={cn("px-2.5 py-1 rounded-lg text-[10px] uppercase font-bold tracking-wider border", statusConfig.chipBg, statusConfig.chipText, BORDER_SOFT_2)}>
            {statusConfig.label}
          </span>
          
          <div className={cn("flex items-center gap-2 text-[10px] font-mono w-24", TEXT_SOFT)}>
            <Clock className="w-3 h-3" />
            {formattedDate}
          </div>

          {isOwner ? (
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(project.id); }}
              disabled={isDeleting}
              className={cn("p-2 rounded-lg transition-all border", BORDER_SOFT_2, "opacity-0 group-hover:opacity-100", TEXT_SOFT, BG_HOVER, "hover:text-rose-500")}
              title="Delete Project"
            >
              {isDeleting ? <Loader2 className="w-4 h-4 animate-spin text-rose-500" /> : <Trash2 className="w-4 h-4" />}
            </button>
          ) : <div className="w-8" />}
        </div>
      </Link>
    )
  }

  // --- GRID VIEW ---
  return (
    <div className="relative group h-full">
      <Link
        href={`/projects/${project.id}/config`}
        className={cn(
          "block rounded-2xl p-6 transition-all duration-300 flex flex-col h-full border",
          "bg-[var(--surface-bg)]",
          BORDER_SOFT,
          "hover:shadow-xl hover:border-[var(--accent-color)] hover:shadow-[color:color-mix(in_oklab,var(--accent-color)_15%,transparent)]"
        )}
      >
        <div className="flex justify-between items-start mb-4">
          <div className={cn("p-3 rounded-xl transition-transform duration-300 border group-hover:scale-110", BG_SOFT, BORDER_SOFT_2)}>
            <ScopeIcon className={cn("w-5 h-5", ACCENT)} />
          </div>
          <span className={cn("px-2.5 py-1 rounded-lg text-[10px] uppercase font-bold tracking-wider border", statusConfig.chipBg, statusConfig.chipText, BORDER_SOFT_2)}>
            {statusConfig.label}
          </span>
        </div>

        <div className="mb-4 flex-1">
          <h3 className={cn("font-bold text-lg mb-1 line-clamp-1 transition-colors text-[var(--foreground)] group-hover:text-[var(--accent-color)]")}>
            {project.project_name}
          </h3>
          <div className={cn("flex flex-col gap-1 text-[10px]", TEXT_MUTED)}>
            <span className="font-bold uppercase tracking-wide flex items-center gap-1">
               <User className="w-3 h-3" /> {creatorName}
            </span>
            <span className={cn("font-medium text-[var(--foreground)] line-clamp-1")} title={locationString}>
              {locationString}
            </span>
            <span>FY{project.start_year}</span>
          </div>
        </div>

        <div className={cn("pt-4 border-t flex items-center justify-between border-[color:color-mix(in_oklab,var(--foreground)_10%,transparent)]")}>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {project.assignee ? (
                <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border", "bg-[color:color-mix(in_oklab,var(--accent-color)_18%,transparent)]", "text-[color:color-mix(in_oklab,var(--accent-color)_90%,black)]", BORDER_SOFT_2)} title={`${project.assignee.first_name} ${project.assignee.last_name}`}>
                  {project.assignee.first_name[0]}{project.assignee.last_name[0]}
                </div>
              ) : (
                <div className={cn("w-6 h-6 rounded-full flex items-center justify-center border", BG_SOFT_2, BORDER_SOFT_2, "text-[color:color-mix(in_oklab,var(--foreground)_45%,transparent)]")}>
                  <User className="w-3 h-3" />
                </div>
              )}
            </div>
            <div className={cn("flex items-center gap-1 text-[10px] font-mono", TEXT_SOFT)}>
              <Clock className="w-3 h-3" />
              {formattedDate}
            </div>
          </div>

          {isOwner && (
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(project.id); }}
              disabled={isDeleting}
              className={cn("p-2 rounded-lg transition-all border", BORDER_SOFT_2, "opacity-0 group-hover:opacity-100", TEXT_SOFT, BG_HOVER, "hover:text-rose-500")}
            >
              {isDeleting ? <Loader2 className="w-4 h-4 animate-spin text-rose-500" /> : <Trash2 className="w-4 h-4" />}
            </button>
          )}
        </div>
      </Link>
    </div>
  );
}