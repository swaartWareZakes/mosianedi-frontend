// app/(app)/dashboard/components/ProjectDashboardSelector.tsx
"use client";

import React from "react";
import { AlertTriangle, RefreshCw, Save } from "lucide-react";
import type { Dashboard, Project } from "../types";

type Props = {
  projects: Project[];
  projectsLoading: boolean;
  projectsError: string | null;
  dashboards: Dashboard[];
  dashboardsLoading: boolean;
  dashboardsError: string | null;

  selectedProjectId: string;
  onProjectChange: (projectId: string) => void;
  selectedProject: Project | null;

  selectedDashboardId: string;
  onDashboardChange: (dashboardId: string) => void;

  snapshotLoading: boolean;
  onRefreshSnapshot: () => void;

  onSaveNew: () => void;
  onSaveExisting: () => void;
};

export function ProjectDashboardSelector({
  projects,
  projectsLoading,
  projectsError,
  dashboards,
  dashboardsLoading,
  dashboardsError,
  selectedProjectId,
  onProjectChange,
  selectedProject,
  selectedDashboardId,
  onDashboardChange,
  snapshotLoading,
  onRefreshSnapshot,
  onSaveNew,
  onSaveExisting,
}: Props) {
  return (
    <section className="p-4 rounded-2xl bg-[var(--surface-bg)] shadow-sm border border-slate-200/10 dark:border-slate-800/40 space-y-4">
      {/* Project row */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Project
          </p>
          <p className="text-sm font-medium">
            {selectedProject ? selectedProject.project_name : "Select a project"}
          </p>
          {selectedProject && (
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {selectedProject.description && (
                <>
                  <span className="font-medium">Overview:</span>{" "}
                  {selectedProject.description}{" "}
                </>
              )}
              {(selectedProject.start_year || selectedProject.forecast_duration) && (
                <>
                  |
                  {selectedProject.start_year && (
                    <> Start year: {selectedProject.start_year}</>
                  )}
                  {selectedProject.forecast_duration && (
                    <> • Horizon: {selectedProject.forecast_duration} years</>
                  )}
                </>
              )}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedProjectId}
            onChange={(e) => onProjectChange(e.target.value)}
            disabled={projectsLoading || projects.length === 0}
            className="min-w-[220px] rounded-lg border border-slate-300/60 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-900/40 px-2.5 py-1.5 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="" disabled>
              {projectsLoading
                ? "Loading projects…"
                : projects.length === 0
                ? "No projects found"
                : "Select project"}
            </option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.project_name}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={onRefreshSnapshot}
            disabled={!selectedProjectId || snapshotLoading}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 px-2.5 py-1 text-[11px] font-medium text-slate-600 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60 disabled:opacity-60"
          >
            <RefreshCw className="h-3 w-3" />
            {snapshotLoading ? "Refreshing data…" : "Refresh data"}
          </button>
        </div>
      </div>

      {/* Dashboard selection row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Dashboard
          </span>
          <select
            value={selectedDashboardId}
            onChange={(e) => onDashboardChange(e.target.value)}
            disabled={!selectedProjectId || dashboardsLoading}
            className="min-w-[220px] rounded-lg border border-slate-300/60 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-900/40 px-2.5 py-1.5 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="">
              {dashboardsLoading
                ? "Loading dashboards…"
                : dashboards.length === 0
                ? "Unsaved view"
                : "Unsaved view (current controls)"}
            </option>
            {dashboards.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
                {d.isFavorite ? " ★" : ""}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onSaveNew}
            disabled={!selectedProjectId}
            className="inline-flex items-center gap-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-xs font-medium text-white px-3 py-1.5 disabled:opacity-60"
          >
            <Save className="h-3 w-3" />
            Save as new dashboard
          </button>
          <button
            type="button"
            onClick={onSaveExisting}
            disabled={!selectedProjectId || !selectedDashboardId}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-200 px-3 py-1.5 hover:bg-slate-800/60 disabled:opacity-60"
          >
            <Save className="h-3 w-3" />
            Update selected
          </button>
        </div>
      </div>

      {(projectsError || dashboardsError) && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          {projectsError || dashboardsError}
        </p>
      )}
    </section>
  );
}