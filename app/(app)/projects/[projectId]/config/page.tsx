"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Loader2, Calendar, FileText } from "lucide-react";

import { NetworkSnapshotCard } from "./components/NetworkSnapshotCard";
import { ScenarioAssumptionsCard } from "./components/ScenarioAssumptionsCard";
import { RunSimulationCard } from "./components/RunSimulationCard";

// Hooks
import { useProposalData } from "./hooks/useProposalData";
import { useProjectMeta } from "./hooks/useProjectMeta"; 

// Components
import { ProposalInputsCard } from "./components/ProposalInputsCard";
import { ProposalDataSummaryCard } from "./components/ProposalDataSummaryCard";

function ProposalInputsLoadingCard() {
  return (
    <div className="rounded-2xl bg-[var(--surface-bg)] shadow-lg p-6 border border-slate-200/50 dark:border-slate-800/50">
      <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
        <Loader2 className="h-4 w-4 animate-spin" />
        <div className="text-sm font-medium">Loading proposal inputs…</div>
      </div>
      <div className="mt-4 space-y-3">
        <div className="h-4 w-1/2 rounded bg-slate-200/60 dark:bg-slate-800/60" />
        <div className="h-4 w-2/3 rounded bg-slate-200/60 dark:bg-slate-800/60" />
        <div className="h-20 w-full rounded bg-slate-200/60 dark:bg-slate-800/60" />
      </div>
    </div>
  );
}

export default function ProjectConfigPage() {
  const params = useParams();
  const projectId = Array.isArray(params?.projectId)
    ? params?.projectId[0]
    : (params?.projectId as string | undefined);

  if (!projectId) {
    return <div className="p-6 text-rose-500">Error: Project ID not found.</div>;
  }

  // 1. Fetch Data
  const { data, loading, saving, error, patchProposalData } = useProposalData(projectId);
  const { data: projectMeta, loading: metaLoading } = useProjectMeta(projectId);

  return (
    <div className="pb-20">
      
      {/* --- HEADER --- */}
      <header className="border-b border-slate-200 dark:border-slate-800 pb-6 mb-8">
        <div className="space-y-4">
          
          <Link
            href="/projects"
            className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to proposals
          </Link>

          {metaLoading ? (
             <div className="space-y-3 animate-pulse">
               <div className="h-10 w-2/3 bg-slate-200 dark:bg-slate-800 rounded-lg" />
               <div className="h-6 w-1/3 bg-slate-100 dark:bg-slate-800/50 rounded-lg" />
             </div>
          ) : (
            <div className="space-y-2">
              {/* COLOR FIX:
                 text-slate-900 = Blackish (Default/Light Mode)
                 dark:text-white = White (Dark Mode Override)
              */}
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
                Proposal for{" "}
                <span className="text-indigo-600 dark:text-indigo-400">
                  {projectMeta?.province || "Unassigned Province"}
                </span>
              </h1>
              
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm md:text-base font-medium text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                  <span>{projectMeta?.start_year ? `${projectMeta.start_year} Financial Year` : "Year not set"}</span>
                </div>
                
                <div className="hidden sm:block w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                
                <div className="flex items-center gap-1.5">
                   <FileText className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                   <span className="text-slate-700 dark:text-slate-300">
                     {projectMeta?.project_name || "Untitled Proposal"}
                   </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* --- ERROR --- */}
      {error && (
        <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-700">
          <p>Unable to load proposal data:</p>
          <pre className="mt-1 whitespace-pre-wrap text-xs opacity-80">{error}</pre>
        </div>
      )}

      {/* --- CONTENT --- */}
      <div className="grid gap-8 lg:grid-cols-[1.7fr,1.3fr]">
        
        <div className="space-y-8">
          {loading ? (
            <ProposalInputsLoadingCard />
          ) : (
            <>
              <ProposalInputsCard
                proposal={data}
                saving={saving}
                onSave={patchProposalData}
              />
              <ProposalDataSummaryCard proposal={data} />
            </>
          )}
          <ScenarioAssumptionsCard projectId={projectId} />
        </div>

        <div className="space-y-8">
          <NetworkSnapshotCard projectId={projectId} />
          <div className="sticky top-6">
            <RunSimulationCard projectId={projectId} />
          </div>
        </div>
      </div>
    </div>
  );
}