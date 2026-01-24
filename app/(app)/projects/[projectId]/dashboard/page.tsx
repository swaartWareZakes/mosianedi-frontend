"use client";

import React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, ArrowLeft, Download, Sparkles, History } from "lucide-react";

import { useSimulationResults } from "./hooks/useSimulationResults";
import { useProjectMeta } from "../config/hooks/useProjectMeta";
import { DashboardMainPanel } from "./components/DashboardMainPanel";
import { useNetworkSnapshot } from "../config/hooks/useNetworkSnapshot";

export default function ProjectDashboardPage() {
  const params = useParams();
  const projectId = params.projectId as string;

  const { data: project } = useProjectMeta(projectId);
  const { results, loading: simLoading } = useSimulationResults(projectId);
  const { data: snapshot, loading: snapLoading } = useNetworkSnapshot(projectId);

  const isLoading = simLoading || snapLoading;

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // No simulation yet
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

          <Link
            href={`/projects/${projectId}/dashboard/advisor`}
            className="px-5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors inline-flex items-center justify-center gap-2"
            title="AI needs a simulation run first"
          >
            <Sparkles className="w-4 h-4 text-indigo-500" />
            AI Advisor (after sim)
          </Link>
        </div>
      </div>
    );
  }

  const startYear = results?.yearly_data?.[0]?.year;
  const endYear = results?.yearly_data?.[results.yearly_data.length - 1]?.year;

  return (
    <div className="space-y-6 pb-20">
      {/* HEADER */}
      <header className="flex flex-col gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <Link
              href={`/projects/${projectId}/config`}
              className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-indigo-600 mb-2 transition-colors"
            >
              <ArrowLeft className="w-3 h-3" /> Back to Inputs
            </Link>

            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100">
              {project?.project_name || "Project"} Strategy
            </h1>

            <p className="text-sm text-slate-500 flex items-center gap-2 mt-1">
              {results.year_count}-Year Forecast {startYear && endYear ? `(${startYear} - ${endYear})` : ""}
            </p>
          </div>

          {/* Primary action: Send user to report builder/share flow */}
          <Link
            href={`/projects/${projectId}/presentation/share`}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            Compile Report
          </Link>
        </div>

        {/* Quick actions row */}
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/projects/${projectId}/dashboard/advisor`}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            AI Advisor Insights
          </Link>

          <Link
            href={`/projects/${projectId}/dashboard/history`}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors"
          >
            <History className="w-3.5 h-3.5 text-slate-500" />
            Simulation History
          </Link>

          <Link
            href={`/projects/${projectId}/presentation/live`}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors"
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-emerald-500" />
            Boardroom View
          </Link>
        </div>
      </header>

      {/* MAIN PANEL */}
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