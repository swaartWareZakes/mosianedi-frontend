"use client";

import React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, ArrowLeft, FileCheck, Sparkles, History, Presentation } from "lucide-react";

import { useSimulationResults } from "./hooks/useSimulationResults";
import { useProjectMeta } from "../config/hooks/useProjectMeta";
import { DashboardMainPanel } from "./components/DashboardMainPanel";
import { useNetworkSnapshot } from "../config/hooks/useNetworkSnapshot";

export default function ProjectDashboardPage() {
  const params = useParams();
  const projectId = Array.isArray(params?.projectId) ? params?.projectId[0] : params?.projectId;

  const { data: project } = useProjectMeta(projectId || "");
  const { results, loading: simLoading } = useSimulationResults(projectId || "");
  const { data: snapshot, loading: snapLoading } = useNetworkSnapshot(projectId || "");

  const isLoading = simLoading || snapLoading;

  if (!projectId) return null;

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!results) {
    return (
      <div className="flex flex-col items-center justify-center h-[65vh] text-center space-y-4">
        <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full">
          <LayoutDashboard className="w-8 h-8 text-slate-400" />
        </div>

        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
          No Strategy Generated
        </h2>

        <p className="text-slate-500 max-w-md">
          You haven&apos;t run a simulation for this project yet. Go to Inputs and generate a forecast first.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href={`/projects/${projectId}/config`}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
          >
            Go to Inputs
          </Link>
        </div>
      </div>
    );
  }

  const yearlyData = results.yearly_data || [];
  const startYear = yearlyData[0]?.year;
  const endYear = yearlyData[yearlyData.length - 1]?.year;

  return (
    <div className="space-y-6 pb-20 p-6">
      
      {/* HEADER */}
      <header className="flex flex-col gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            {/* UPDATED: Navigates back to the global list of dashboards */}
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[color:color-mix(in_oklab,var(--foreground)_50%,transparent)] hover:text-[var(--accent-color)] mb-3 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboards List
            </Link>

            <h1 className="text-2xl md:text-3xl font-bold text-[var(--foreground)]">
              {project?.project_name || "Project"} Strategy
            </h1>

            <p className="text-sm text-[color:color-mix(in_oklab,var(--foreground)_60%,transparent)] font-medium flex items-center gap-2 mt-1">
              {results.year_count}-Year Forecast {startYear && endYear ? `(${startYear} - ${endYear})` : ""}
            </p>
          </div>

          <Link
            href="/reports"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-[var(--accent-color)] hover:brightness-110 rounded-lg transition-colors shadow-lg shadow-indigo-500/20"
          >
            <FileCheck className="w-4 h-4" />
            Compile Report
          </Link>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href={`/projects/${projectId}/advisor`}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-lg border border-[color:color-mix(in_oklab,var(--foreground)_14%,transparent)] bg-[var(--surface-bg)] hover:bg-[color:color-mix(in_oklab,var(--foreground)_4%,transparent)] text-[var(--foreground)] transition-colors group"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-500 group-hover:text-indigo-600" />
            AI Advisor Insights
          </Link>

          <Link
            href={`/projects/${projectId}/dashboard/history`}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-lg border border-[color:color-mix(in_oklab,var(--foreground)_14%,transparent)] bg-[var(--surface-bg)] hover:bg-[color:color-mix(in_oklab,var(--foreground)_4%,transparent)] text-[var(--foreground)] transition-colors"
          >
            <History className="w-3.5 h-3.5 text-[color:color-mix(in_oklab,var(--foreground)_50%,transparent)]" />
            Simulation History
          </Link>

          <Link
            href="/presentationmode"
            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-lg border border-[color:color-mix(in_oklab,var(--foreground)_14%,transparent)] bg-[var(--surface-bg)] hover:bg-[color:color-mix(in_oklab,var(--foreground)_4%,transparent)] text-[var(--foreground)] transition-colors"
          >
            <Presentation className="w-3.5 h-3.5 text-emerald-500" />
            Boardroom View
          </Link>
        </div>
      </header>

      {/* MAIN DASHBOARD PANEL */}
      <DashboardMainPanel
        projectId={projectId}
        snapshot={snapshot}
        loading={false}
        error={null}
        adjustedAssetValue={null}
        simulationResults={results}
      />
    </div>
  );
}