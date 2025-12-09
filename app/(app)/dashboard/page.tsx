"use client";

import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  AlertTriangle,
  LayoutDashboard,
  RefreshCw,
  Save,
} from "lucide-react";

import { useNetworkSnapshot } from "../projects/[projectId]/config/hooks/useNetworkSnapshot";
import { useProjectDashboards } from "./hooks/useProjectDashboards";
import type { Dashboard } from "./types";
import { DashboardMainPanel } from "./components/DashboardMainPanel";
import { ScenarioControlsCard } from "./components/ScenarioControlsCard";

// const API_BASE = "http://127.0.0.1:8000";


const API_BASE= `${process.env.NEXT_PUBLIC_API_URL}`;

type Project = {
  id: string;
  project_name: string;
  description?: string | null;
  start_year?: number | null;
  forecast_duration?: number | null;
};

export default function DashboardPage() {
  // -------- Projects ----------
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [projectsError, setProjectsError] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");

  useEffect(() => {
    const fetchProjects = async () => {
      setProjectsLoading(true);
      setProjectsError(null);
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const token = session?.access_token;
        if (!token) {
          setProjectsError("Please log in to view dashboards.");
          setProjectsLoading(false);
          return;
        }

        const res = await fetch(`${API_BASE}/api/v1/projects`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.detail || `Failed to load projects (${res.status})`);
        }

        const data: Project[] = await res.json();
        setProjects(data);
        if (data.length > 0 && !selectedProjectId) {
          setSelectedProjectId(data[0].id);
        }
      } catch (err: any) {
        console.error("[DashboardPage] fetchProjects error:", err);
        setProjectsError(err.message || "Could not load projects.");
      } finally {
        setProjectsLoading(false);
      }
    };

    fetchProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedProject = useMemo(
    () => projects.find((p) => p.id === selectedProjectId) || null,
    [projects, selectedProjectId]
  );

  // -------- Snapshot (base data) ----------
  const {
    snapshot,
    loading: snapshotLoading,
    error: snapshotError,
    refetch: refetchSnapshot,
  } = useNetworkSnapshot(selectedProjectId || "");

  // -------- Dashboards for this project ----------
  const {
    dashboards,
    loading: dashboardsLoading,
    error: dashboardsError,
    createDashboard,
    updateDashboard,
  } = useProjectDashboards(selectedProjectId || "");

  const [selectedDashboardId, setSelectedDashboardId] = useState<string | "">("");

  const selectedDashboard: Dashboard | null = useMemo(
    () => dashboards.find((d) => d.id === selectedDashboardId) || null,
    [dashboards, selectedDashboardId]
  );

  // -------- Local scenario state (what-if) -----------------------------------
  const [analysisYears, setAnalysisYears] = useState(20);
  const [budgetLevel, setBudgetLevel] = useState(100);
  const [policyBias, setPolicyBias] =
    useState<"preventive" | "balanced" | "reactive">("balanced");

  // hydrate scenario controls from selected dashboard overrides
  useEffect(() => {
    if (selectedDashboard?.overrides) {
      const o = selectedDashboard.overrides as any;
      if (typeof o.analysisYears === "number") setAnalysisYears(o.analysisYears);
      if (typeof o.budgetLevel === "number") setBudgetLevel(o.budgetLevel);
      if (typeof o.policyBias === "string") setPolicyBias(o.policyBias);
    }
  }, [selectedDashboardId, selectedDashboard]);

  // simple indicative “envelope” metric
  const adjustedAssetValue =
    snapshot?.totalAssetValue != null
      ? snapshot.totalAssetValue * (budgetLevel / 100)
      : null;

  // -------- Save handlers ----------------------------------------------------
  const handleSaveNew = async () => {
    if (!selectedProjectId) return;
    const name =
      selectedDashboard?.name ||
      `${selectedProject?.project_name || "Project"} – ${budgetLevel}% / ${analysisYears}y`;

    await createDashboard({
      name,
      description: "Presentation dashboard snapshot",
      overrides: { analysisYears, budgetLevel, policyBias },
      layout: {
        version: 1,
        widgets: ["kpiStrip", "conditionChart", "surfaceMix", "roadClass", "assetValue"],
      },
    });
  };

  const handleSaveExisting = async () => {
    if (!selectedProjectId || !selectedDashboardId) return;
    await updateDashboard(selectedDashboardId, {
      overrides: { analysisYears, budgetLevel, policyBias },
    });
  };

  // --------------------------------------------------------------------------

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
          <LayoutDashboard className="h-6 w-6 text-sky-500" />
          Dashboards
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Presentation-ready views of your road network. Use the controls to
          adjust scenarios live in meetings, and save favourite configurations
          as named dashboards per project.
        </p>
      </header>

      {/* Project + dashboard selectors */}
      <section className="p-4 rounded-2xl bg-[var(--surface-bg)] shadow-sm border border-slate-200/10 dark:border-slate-800/40 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Project summary */}
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

          {/* Project select + refresh */}
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={selectedProjectId}
              onChange={(e) => {
                setSelectedProjectId(e.target.value);
                setSelectedDashboardId("");
              }}
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
              onClick={refetchSnapshot}
              disabled={!selectedProjectId || snapshotLoading}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 px-2.5 py-1 text-[11px] font-medium text-slate-600 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60 disabled:opacity-60"
            >
              <RefreshCw className="h-3 w-3" />
              {snapshotLoading ? "Refreshing data…" : "Refresh data"}
            </button>
          </div>
        </div>

        {/* Dashboard selector + actions */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Dashboard
            </span>
            <select
              value={selectedDashboardId}
              onChange={(e) => setSelectedDashboardId(e.target.value)}
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
              onClick={handleSaveNew}
              disabled={!selectedProjectId}
              className="inline-flex items-center gap-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-xs font-medium text-white px-3 py-1.5 disabled:opacity-60"
            >
              <Save className="h-3 w-3" />
              Save as new dashboard
            </button>
            <button
              type="button"
              onClick={handleSaveExisting}
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

      {/* Main layout: left = dashboard, right = scenario controls */}
      {selectedProjectId ? (
        <section className="grid gap-6 2xl:grid-cols-[2fr,1.2fr]">
          {/* Left: KPIs + charts */}
          <DashboardMainPanel
            snapshot={snapshot}
            loading={snapshotLoading}
            error={snapshotError}
            adjustedAssetValue={adjustedAssetValue}
          />

          {/* Right: scenario controls */}
          <div className="space-y-4">
            <ScenarioControlsCard
              analysisYears={analysisYears}
              budgetLevel={budgetLevel}
              policyBias={policyBias}
              onAnalysisYearsChange={setAnalysisYears}
              onBudgetLevelChange={setBudgetLevel}
              onPolicyBiasChange={setPolicyBias}
            />
          </div>
        </section>
      ) : (
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Select a project above to start building dashboards.
        </p>
      )}
    </div>
  );
}