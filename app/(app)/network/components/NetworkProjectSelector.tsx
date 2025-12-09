// app/(app)/network/components/NetworkProjectSelector.tsx
"use client";

import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

type Project = {
  id: string;
  project_name: string;
  description?: string | null;
  start_year?: number | null;
  forecast_duration?: number | null;
  discount_rate?: number | null;
};

type Props = {
  projects: Project[];
  projectsLoading: boolean;
  projectsError: string | null;
  selectedProjectId: string;
  onSelectedProjectChange: (id: string) => void;
  snapshotLoading: boolean;
  onRefreshSnapshot: () => void;
  selectedProject: Project | null;
};

export function NetworkProjectSelector({
  projects,
  projectsLoading,
  projectsError,
  selectedProjectId,
  onSelectedProjectChange,
  snapshotLoading,
  onRefreshSnapshot,
  selectedProject,
}: Props) {
  return (
    <section className="p-4 rounded-2xl bg-[var(--surface-bg)] shadow-sm border border-slate-200/10 dark:border-slate-800/40 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Project
          </p>
          <p className="text-sm font-medium">
            {selectedProject ? selectedProject.project_name : "Select a project"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedProjectId}
            onChange={(e) => onSelectedProjectChange(e.target.value)}
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
            {snapshotLoading ? "Refreshing…" : "Refresh snapshot"}
          </button>
        </div>
      </div>

      {projectsError && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          {projectsError}
        </p>
      )}

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
    </section>
  );
}