"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, LayoutDashboard, Loader2, Check } from "lucide-react";

// Components
import { WizardStepper } from "./components/WizardStepper";
import { ProposalInputsCard } from "./components/ProposalInputsCard";
// import { ProvincialStatsCard } from "./components/ProvincialStatsCard"; // Removed as requested
import { NetworkSnapshotCard } from "./components/NetworkSnapshotCard";
import { NetworkBreakdowns } from "../../../network/components/NetworkBreakdowns"; 
import { ScenarioAssumptionsCard } from "./components/ScenarioAssumptionsCard";
import { RunSimulationCard } from "./components/RunSimulationCard";
import { ProjectNavBar } from "../components/ProjectNavBar";

// Hooks
import { useProposalData } from "./hooks/useProposalData";
import { useProjectMeta } from "./hooks/useProjectMeta";
import { useNetworkSnapshot } from "./hooks/useNetworkSnapshot";

export default function ProjectWizardPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = Array.isArray(params?.projectId) ? params?.projectId[0] : params?.projectId;

  const [step, setStep] = useState(1);
  const [navigating, setNavigating] = useState(false);
  
  // Data Hooks
  const { data: proposal, loading: proposalLoading, patchProposalData } = useProposalData(projectId || "");
  const { data: projectMeta } = useProjectMeta(projectId || "");
  const { data: snapshot, refetch: refreshSnapshot } = useNetworkSnapshot(projectId || "");

  if (!projectId) return null;

  // --- ACTIONS ---

  const handleNext = async () => {
    setNavigating(true);
    
    // Simulate a brief pause for UX confidence (and ensure background saves complete)
    // If we are on Step 1, we force a snapshot refresh to ensure the backend calculation is ready for Step 2
    if (step === 1) {
       // We can trigger an explicit save here if the component wasn't auto-saving, 
       // but your ProposalInputsCard handles it. 
       // We'll just wait for the snapshot calculation.
       await new Promise(r => setTimeout(r, 800)); // Minimal UX delay
       await refreshSnapshot();
    } else {
       await new Promise(r => setTimeout(r, 400));
    }

    setStep((prev) => Math.min(prev + 1, 4));
    window.scrollTo({ top: 0, behavior: "smooth" });
    setNavigating(false);
  };

  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleFinish = () => {
    router.push(`/projects/${projectId}/dashboard`);
  };

  return (
    <div className="h-full w-full bg-[var(--background)] flex flex-col">
      
      {/* 1. Top Nav */}
      <div className="sticky top-0 z-50">
        <ProjectNavBar projectId={projectId} />
      </div>

      <div className="flex flex-1 overflow-hidden">
        
        {/* 2. Left Sidebar (Wizard Stepper) */}
        <aside className="hidden lg:block w-72 bg-[var(--surface-bg)] border-r border-slate-200 dark:border-slate-800 overflow-y-auto">
             <div className="p-6">
                 <Link href="/projects" className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-indigo-600 mb-8 transition-colors">
                    <ArrowLeft className="w-3 h-3" /> Back to List
                 </Link>
                 <div className="mb-2">
                     <h1 className="text-xl font-black text-slate-900 dark:text-white">{projectMeta?.project_name || "Project"}</h1>
                     <span className="text-xs font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-500">
                        {projectMeta?.province || "ZA"} • FY{projectMeta?.start_year}
                     </span>
                 </div>
             </div>
             <WizardStepper currentStep={step} onJump={setStep} />
        </aside>

        {/* 3. Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-[var(--background)]">
            <div className="max-w-4xl mx-auto p-8 space-y-8 pb-32">
            
            {/* --- STEP 1: INPUTS --- */}
            {step === 1 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Data Inputs</h2>
                    <p className="text-slate-500">Define the physical inventory and traffic conditions. This sets the baseline for the simulation.</p>
                </div>
                
                {proposalLoading ? (
                    <div className="h-64 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-slate-400"/></div>
                ) : (
                    <ProposalInputsCard 
                        proposal={proposal} 
                        saving={false} // Hook handles internal saving state now
                        onSave={patchProposalData} 
                    />
                )}
                </div>
            )}

            {/* --- STEP 2: NETWORK PROFILE --- */}
            {step === 2 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Network Profile</h2>
                    <p className="text-slate-500">Review the calculated Asset Value (CRC) and Visual Condition Index (VCI) before forecasting.</p>
                </div>

                <NetworkSnapshotCard projectId={projectId} />
                
                <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-6">Visual Breakdown</h3>
                    <NetworkBreakdowns snapshot={snapshot} />
                </div>
                </div>
            )}

            {/* --- STEP 3: FORECAST SETTINGS --- */}
            {step === 3 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Forecast Strategy</h2>
                    <p className="text-slate-500">Adjust economic variables and deterioration rates to shape the long-term outlook.</p>
                </div>

                <ScenarioAssumptionsCard projectId={projectId} />
                </div>
            )}

            {/* --- STEP 4: SIMULATION --- */}
            {step === 4 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Run Simulation</h2>
                    <p className="text-slate-500">Execute the RoNET engine. This will generate the final budget requirements and condition forecast.</p>
                </div>

                <RunSimulationCard projectId={projectId} />
                </div>
            )}

            </div>
        </main>
      </div>

      {/* 4. Footer Navigation (Fixed) */}
      <div className="sticky bottom-0 bg-[var(--surface-bg)] border-t border-slate-200 dark:border-slate-800 p-6 z-40">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
           <button 
             onClick={handleBack}
             disabled={step === 1 || navigating}
             className="px-6 py-3 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
           >
             Back
           </button>

           {step < 4 ? (
             <button 
               onClick={handleNext}
               disabled={navigating}
               className="group flex items-center gap-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
             >
               {navigating ? <Loader2 className="w-4 h-4 animate-spin"/> : null}
               {navigating ? "Saving..." : "Next Step"}
               {!navigating && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
             </button>
           ) : (
             <button 
               onClick={handleFinish}
               className="flex items-center gap-2 px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95"
             >
               View Results Dashboard
               <LayoutDashboard className="w-4 h-4" />
             </button>
           )}
        </div>
      </div>

    </div>
  );
}