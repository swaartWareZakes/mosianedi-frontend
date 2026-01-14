"use client";

import React, { useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { 
  LayoutDashboard, ArrowLeft, Download 
} from "lucide-react";

import { useSimulationResults } from "./hooks/useSimulationResults";
import { useProjectMeta } from "../config/hooks/useProjectMeta";
// 👇 Import the Panel (which contains the AI Card and Charts)
import { DashboardMainPanel } from "./components/DashboardMainPanel";
// Import Snapshot Hook
import { useNetworkSnapshot } from "../config/hooks/useNetworkSnapshot";

export default function ProjectDashboardPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  
  const { data: project } = useProjectMeta(projectId);
  const { results, loading: simLoading } = useSimulationResults(projectId);
  
  // 👇 Fetch Snapshot too, so we can pass it to the panel
  const { data: snapshot, loading: snapLoading } = useNetworkSnapshot(projectId);

  const isLoading = simLoading || snapLoading;

  if (isLoading) {
    return (
        <div className="flex h-64 items-center justify-center">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );
  }

  // If no simulation results exist, prompt user to run one
  if (!results) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
        <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full">
            <LayoutDashboard className="w-8 h-8 text-slate-400" />
        </div>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">No Strategy Generated</h2>
        <p className="text-slate-500 max-w-md">
          You haven't run a simulation for this project yet. Go to the Configuration page to generate your proposal first.
        </p>
        <Link 
            href={`/projects/${projectId}/config`}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
        >
            Go to Configuration
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      
      {/* HEADER */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
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
                {results.year_count}-Year Forecast ({results.yearly_data[0].year} - {results.yearly_data[results.yearly_data.length-1].year})
            </p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
            <Download className="w-4 h-4" />
            Export Report
        </button>
      </header>

      {/* THE MAIN PANEL 
         This handles:
         1. KPI Cards (Cost, Condition, Value)
         2. Charts with AI Insight Chips
         3. The AI Strategy Card (at the bottom)
      */}
      <DashboardMainPanel 
          projectId={projectId}
          snapshot={snapshot}
          loading={isLoading}
          error={null}
          adjustedAssetValue={null} 
          simulationResults={results}
      />

    </div>
  );
}