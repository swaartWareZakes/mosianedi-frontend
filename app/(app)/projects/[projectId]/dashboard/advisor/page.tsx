"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Sparkles, LayoutDashboard } from "lucide-react";

import { useProjectMeta } from "../../config/hooks/useProjectMeta";
import { useNetworkSnapshot } from "../../config/hooks/useNetworkSnapshot";
import { useSimulationResults } from "../hooks/useSimulationResults";

import { useAiAdvisor } from "../hooks/useAiAdvisor";
import { AiStrategyCard } from "../components/AiStrategyCard";
import { DashboardMainPanel } from "../components/DashboardMainPanel";

export default function AdvisorInsightsPage() {
  const params = useParams();
  const projectId = params.projectId as string;

  const { data: project } = useProjectMeta(projectId);
  const { data: snapshot, loading: snapLoading } = useNetworkSnapshot(projectId);
  const { results, loading: simLoading } = useSimulationResults(projectId);

  const { analysis, loading: aiLoading, error: aiError, generateAnalysis } = useAiAdvisor(projectId);

  const loading = snapLoading || simLoading;

  return (
    <div className="space-y-6 pb-20">
      {/* HEADER */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <Link
            href={`/projects/${projectId}/dashboard`}
            className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-indigo-600 mb-2 transition-colors"
          >
            <ArrowLeft className="w-3 h-3" /> Back to Dashboard
          </Link>

          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-indigo-500" />
            AI Advisor Insights
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {project?.project_name || "Project"} — generate a Treasury-ready executive narrative from your simulation.
          </p>
        </div>
      </header>

      {/* If no simulation exists, show a proper call-to-action */}
      {!loading && !results && (
        <div className="flex flex-col items-center justify-center h-[55vh] text-center space-y-4">
          <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full">
            <LayoutDashboard className="w-8 h-8 text-slate-400" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            No Simulation Yet
          </h2>
          <p className="text-slate-500 max-w-md">
            AI insights require a simulation run. Go to Inputs, run your forecast, then return here.
          </p>
          <Link
            href={`/projects/${projectId}/config`}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
          >
            Go to Inputs
          </Link>
        </div>
      )}

      {/* Optional: show context snapshot + charts (same as dashboard) */}
      {loading && (
        <div className="flex h-48 items-center justify-center">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!loading && snapshot && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-[var(--surface-bg)] p-4">
          <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500">
            Context Preview
          </p>
          <p className="text-xs text-slate-500 mt-1">
            This is the same context used in your dashboard (network snapshot + latest simulation).
          </p>

          <div className="mt-4">
            <DashboardMainPanel
              projectId={projectId}
              snapshot={snapshot}
              loading={false}
              error={null}
              adjustedAssetValue={null}
              simulationResults={results}
            />
          </div>
        </div>
      )}

      {/* AI Strategy Card (CTA + Result) */}
      {!loading && results && (
        <AiStrategyCard
          analysis={analysis}
          loading={aiLoading}
          error={aiError}
          onGenerate={generateAnalysis}
        />
      )}
    </div>
  );
}