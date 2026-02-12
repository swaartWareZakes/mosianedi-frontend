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
  status: "draft" | "backlog" | "planning" | "review" | "published" | "archived";
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

// ---- variable-safe helpers ----
const BORDER_SOFT =
  "border-[color:color-mix(in_oklab,var(--foreground)_14%,transparent)]";
const BORDER_SOFT_2 =
  "border-[color:color-mix(in_oklab,var(--foreground)_10%,transparent)]";
const TEXT_MUTED =
  "text-[color:color-mix(in_oklab,var(--foreground)_60%,transparent)]";
const TEXT_SOFT =
  "text-[color:color-mix(in_oklab,var(--foreground)_45%,transparent)]";
const BG_HOVER =
  "hover:bg-[color:color-mix(in_oklab,var(--foreground)_6%,transparent)]";
const BG_SOFT =
  "bg-[color:color-mix(in_oklab,var(--foreground)_6%,transparent)]";
const BG_SOFT_2 =
  "bg-[color:color-mix(in_oklab,var(--foreground)_10%,transparent)]";
const ACCENT = "text-[var(--accent-color)]";

export function ProjectCard({
  project,
  onDelete,
  isDeleting,
  currentUserId,
}: ProjectCardProps) {
  // Status styling: keep expressive colors but avoid dark:* branching.
  // Use color-mix with a fixed hue so both themes behave consistently.
  const configMap: Record<
    string,
    { chipBg: string; chipText: string; label: string }
  > = {
    draft: {
      chipBg:
        "bg-[color:color-mix(in_oklab,var(--foreground)_8%,transparent)]",
      chipText:
        "text-[color:color-mix(in_oklab,var(--foreground)_65%,transparent)]",
      label: "Draft",
    },
    backlog: {
      chipBg:
        "bg-[color:color-mix(in_oklab,var(--foreground)_8%,transparent)]",
      chipText:
        "text-[color:color-mix(in_oklab,var(--foreground)_65%,transparent)]",
      label: "Backlog",
    },
    planning: {
      chipBg: "bg-[color:color-mix(in_oklab,#3b82f6_18%,transparent)]",
      chipText: "text-[color:color-mix(in_oklab,#3b82f6_82%,black)]",
      label: "Planning",
    },
    review: {
      chipBg: "bg-[color:color-mix(in_oklab,#f59e0b_18%,transparent)]",
      chipText: "text-[color:color-mix(in_oklab,#f59e0b_85%,black)]",
      label: "In Review",
    },
    published: {
      chipBg: "bg-[color:color-mix(in_oklab,#10b981_18%,transparent)]",
      chipText: "text-[color:color-mix(in_oklab,#10b981_85%,black)]",
      label: "Published",
    },
    archived: {
      chipBg:
        "bg-[color:color-mix(in_oklab,var(--foreground)_6%,transparent)]",
      chipText:
        "text-[color:color-mix(in_oklab,var(--foreground)_40%,transparent)]",
      label: "Archived",
    },
  };

  const statusKey = project.status || "draft";
  const statusConfig = configMap[statusKey] || configMap.draft;

  const formattedDate = project.created_at
    ? new Date(project.created_at).toLocaleDateString()
    : "N/A";

  const isOwner = currentUserId === project.user_id;

  return (
    <div className="relative group h-full">
      <Link
        href={`/projects/${project.id}/config`}
        className={cn(
          "block rounded-2xl p-6 transition-all duration-300 flex flex-col h-full border",
          "bg-[var(--surface-bg)]",
          BORDER_SOFT,
          "hover:shadow-xl",
          // border highlight uses accent, but stays subtle
          "hover:border-[var(--accent-color)] hover:shadow-[color:color-mix(in_oklab,var(--accent-color)_22%,transparent)]"
        )}
      >
        {/* Header: Icon + Status */}
        <div className="flex justify-between items-start mb-4">
          <div
            className={cn(
              "p-3 rounded-xl transition-transform duration-300",
              BG_SOFT,
              "group-hover:scale-110",
              "border",
              BORDER_SOFT_2
            )}
          >
            <FileText className={cn("w-6 h-6", ACCENT)} />
          </div>

          <span
            className={cn(
              "px-2.5 py-1 rounded-lg text-[10px] uppercase font-bold tracking-wider border",
              statusConfig.chipBg,
              statusConfig.chipText,
              BORDER_SOFT_2
            )}
          >
            {statusConfig.label}
          </span>
        </div>

        {/* Body: Title + Province */}
        <div className="mb-4 flex-1">
          <h3
            className={cn(
              "font-bold text-lg mb-1 line-clamp-1 transition-colors",
              "text-[var(--foreground)]",
              "group-hover:text-[var(--accent-color)]"
            )}
          >
            {project.project_name}
          </h3>

          <div className={cn("flex items-center gap-2 text-xs", TEXT_MUTED)}>
            <span className={cn("font-medium", "text-[var(--foreground)]")}>
              {project.province}
            </span>
            <span className={TEXT_SOFT}>•</span>
            <span>FY{project.start_year}</span>
          </div>
        </div>

        {/* Footer: Assignee + Date + Delete */}
        <div
          className={cn(
            "pt-4 border-t flex items-center justify-between",
            "border-[color:color-mix(in_oklab,var(--foreground)_10%,transparent)]"
          )}
        >
          <div className="flex items-center gap-4">
            {/* Assignee Avatar */}
            <div className="flex items-center gap-2">
              {project.assignee ? (
                <div
                  className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border",
                    "bg-[color:color-mix(in_oklab,var(--accent-color)_18%,transparent)]",
                    "text-[color:color-mix(in_oklab,var(--accent-color)_90%,black)]",
                    BORDER_SOFT_2
                  )}
                  title={`${project.assignee.first_name} ${project.assignee.last_name}`}
                >
                  {project.assignee.first_name[0]}
                  {project.assignee.last_name[0]}
                </div>
              ) : (
                <div
                  className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center border",
                    BG_SOFT_2,
                    BORDER_SOFT_2,
                    "text-[color:color-mix(in_oklab,var(--foreground)_45%,transparent)]"
                  )}
                >
                  <User className="w-3 h-3" />
                </div>
              )}
            </div>

            <div className={cn("flex items-center gap-1 text-[10px] font-mono", TEXT_SOFT)}>
              <Clock className="w-3 h-3" />
              {formattedDate}
            </div>
          </div>

          {/* Delete button */}
          {isOwner && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDelete(project.id);
              }}
              disabled={isDeleting}
              className={cn(
                "p-2 rounded-lg transition-all border",
                BORDER_SOFT_2,
                "opacity-0 group-hover:opacity-100",
                "text-[color:color-mix(in_oklab,var(--foreground)_45%,transparent)]",
                BG_HOVER,
                "hover:text-rose-500",
                "hover:bg-[color:color-mix(in_oklab,#ef4444_10%,transparent)]"
              )}
              title="Delete Project"
            >
              {isDeleting ? (
                <Loader2 className="w-4 h-4 animate-spin text-rose-500" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
            </button>
          )}
        </div>
      </Link>
    </div>
  );
}