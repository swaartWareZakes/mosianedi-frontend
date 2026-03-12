"use client";

import React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, ArrowLeft, FileCheck, Sparkles, History, Presentation, Lock } from "lucide-react";

import { useSimulationResults } from "./hooks/useSimulationResults";
import { useProjectMeta } from "../config/hooks/useProjectMeta";
import { DashboardMainPanel } from "./components/DashboardMainPanel";
import { useNetworkSnapshot } from "../config/hooks/useNetworkSnapshot";
import { cn } from "@/lib/utils";

export default function ProjectDashboardPage() {
  const params = useParams();
  const projectId = Array.isArray(params?.projectId) ? params?.projectId[0] : params?.projectId;

  // 1. Pull hasAccess from the meta hook!
  const { data: project, loading: metaLoading, hasAccess } = useProjectMeta(projectId || "");
  const { results, loading: simLoading } = useSimulationResults(projectId || "");
  const { data: snapshot, loading: snapLoading } = useNetworkSnapshot(projectId || "");

  const isLoading = simLoading || snapLoading || metaLoading || hasAccess === null;
  const isReadOnly = hasAccess === false;

  if (!projectId) return null;

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center flex-col gap-4">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-bold uppercase tracking-widest text-slate-500 animate-pulse">
          Loading Dashboard...
        </p>
      </div>
    );
  }

  // 2. Handle missing results securely
  if (!results) {
    return (
      <div className="flex flex-col items-center justify-center h-[65vh] text-center space-y-4 animate-in fade-in duration-500">
        <div className="p-4 bg-[color:color-mix(in_oklab,var(--foreground)_4%,transparent)] rounded-full">
          <LayoutDashboard className="w-8 h-8 text-[color:color-mix(in_oklab,var(--foreground)_40%,transparent)]" />
        </div>

        <h2 className="text-xl font-semibold text-[var(--foreground)]">
          {isReadOnly ? "Simulation Pending" : "No Strategy Generated"}
        </h2>

        <p className="text-[color:color-mix(in_oklab,var(--foreground)_60%,transparent)] max-w-md text-sm">
          {isReadOnly 
            ? "The owner has not run a simulation for this project yet. Dashboard metrics will appear here once an analysis is completed."
            : "You haven't run a simulation for this project yet. Go to Inputs and generate a forecast first."}
        </p>

        {/* Hide the action button if Read Only */}
        {!isReadOnly && (
          <div className="pt-4">
            <Link
              href={`/projects/${projectId}/config`}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2"
            >
              Configure & Run Simulation
            </Link>
          </div>
        )}
      </div>
    );
  }

  const yearlyData = results.yearly_data || [];
  const startYear = yearlyData[0]?.year;
  const endYear = yearlyData[yearlyData.length - 1]?.year;

  return (
    <div className="space-y-6 pb-20 p-6 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <header className="flex flex-col gap-4 border-b border-[color:color-mix(in_oklab,var(--foreground)_10%,transparent)] pb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[color:color-mix(in_oklab,var(--foreground)_50%,transparent)] hover:text-[var(--accent-color)] mb-3 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboards List
            </Link>

            <h1 className="text-2xl md:text-3xl font-bold text-[var(--foreground)] flex items-center gap-3">
              {project?.project_name || "Project"} Strategy
              
              {/* 3. READ-ONLY BADGE */}
              {isReadOnly && (
                 <span className="flex items-center gap-1.5 text-xs font-bold text-amber-600 bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20">
                   <Lock className="w-3.5 h-3.5" /> Read-Only
                 </span>
              )}
            </h1>

            <p className="text-sm text-[color:color-mix(in_oklab,var(--foreground)_60%,transparent)] font-medium flex items-center gap-2 mt-1.5">
              {results.year_count}-Year Forecast {startYear && endYear ? `(${startYear} - ${endYear})` : ""}
            </p>
          </div>

          {/* 4. Hide Compile Report if Read-Only (They shouldn't be able to write to the DB) */}
          {!isReadOnly && (
            <Link
              href="/reports"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-[var(--accent-color)] hover:brightness-110 rounded-xl transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
            >
              <FileCheck className="w-4 h-4" />
              Compile Report
            </Link>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mt-2">
          <Link
            href={`/projects/${projectId}/advisor`}
            className="inline-flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-lg border border-[color:color-mix(in_oklab,var(--foreground)_14%,transparent)] bg-[var(--surface-bg)] hover:bg-[color:color-mix(in_oklab,var(--foreground)_4%,transparent)] text-[var(--foreground)] transition-colors group shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-indigo-500 group-hover:text-indigo-600" />
            AI Advisor Insights
          </Link>

          <Link
            href={`/projects/${projectId}/dashboard/history`}
            className="inline-flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-lg border border-[color:color-mix(in_oklab,var(--foreground)_14%,transparent)] bg-[var(--surface-bg)] hover:bg-[color:color-mix(in_oklab,var(--foreground)_4%,transparent)] text-[var(--foreground)] transition-colors shadow-sm"
          >
            <History className="w-4 h-4 text-[color:color-mix(in_oklab,var(--foreground)_50%,transparent)]" />
            Simulation History
          </Link>

          <Link
            href="/presentationmode"
            className="inline-flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-lg border border-[color:color-mix(in_oklab,var(--foreground)_14%,transparent)] bg-[var(--surface-bg)] hover:bg-[color:color-mix(in_oklab,var(--foreground)_4%,transparent)] text-[var(--foreground)] transition-colors shadow-sm"
          >
            <Presentation className="w-4 h-4 text-emerald-500" />
            Boardroom View
          </Link>
        </div>
      </header>

      {/* MAIN DASHBOARD PANEL */}
      {/* Note: I added readOnly as a prop here. If DashboardMainPanel has editable scenario knobs, you can use this prop inside that component to disable them! */}
      <DashboardMainPanel
        projectId={projectId}
        snapshot={snapshot}
        loading={false}
        error={null}
        adjustedAssetValue={null}
        simulationResults={results}
        readOnly={isReadOnly} 
      />
    </div>
  );
}