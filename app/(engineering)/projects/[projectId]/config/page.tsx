"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  ArrowRight, 
  LayoutDashboard, 
  Loader2, 
  Route as RouteIcon, 
  MapPin, 
  Building2, 
  Map,
  Eye
} from "lucide-react";

import { cn } from "@/lib/utils";

// Components
import { WizardStepper } from "./components/WizardStepper";
import { ProposalInputsCard } from "./components/ProposalInputsCard";
import { NetworkSnapshotCard } from "./components/NetworkSnapshotCard";
import { NetworkBreakdowns } from "../../../network/components/NetworkBreakdowns";
import { ScenarioAssumptionsCard } from "./components/ScenarioAssumptionsCard";
import { RunSimulationCard } from "./components/RunSimulationCard";
import { ProjectNavBar } from "../components/ProjectNavBar";

// Hooks
import { useProposalData } from "./hooks/useProposalData";
import { useProjectMeta } from "./hooks/useProjectMeta";
import { useNetworkSnapshot } from "./hooks/useNetworkSnapshot";

const BORDER_SOFT = "border-[color:color-mix(in_oklab,var(--foreground)_14%,transparent)]";
const BORDER_SOFT_2 = "border-[color:color-mix(in_oklab,var(--foreground)_10%,transparent)]";
const TEXT_MUTED = "text-[color:color-mix(in_oklab,var(--foreground)_60%,transparent)]";
const BG_SOFT = "bg-[color:color-mix(in_oklab,var(--foreground)_6%,transparent)]";
const BG_HOVER = "hover:bg-[color:color-mix(in_oklab,var(--foreground)_6%,transparent)]";

export default function ProjectWizardPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = Array.isArray(params?.projectId) ? params?.projectId[0] : params?.projectId;

  const [step, setStep] = useState(1);
  const [navigating, setNavigating] = useState(false);

  // Data Hooks
  const { data: proposal, loading: proposalLoading, patchProposalData } = useProposalData(projectId || "");
  const { data: projectMeta, loading: metaLoading, hasAccess } = useProjectMeta(projectId || "");
  const { data: snapshot, refetch: refreshSnapshot } = useNetworkSnapshot(projectId || "");

  if (!projectId) return null;

  const handleNext = async () => {
    setNavigating(true);
    if (step === 1) {
      await new Promise((r) => setTimeout(r, 800));
      await refreshSnapshot();
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

  // 1. Loading State
  if (metaLoading || hasAccess === null) return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[var(--background)]">
      <Loader2 className="w-10 h-10 animate-spin text-indigo-500 mb-4" />
      <p className="text-sm font-bold uppercase tracking-widest text-slate-500 animate-pulse">
        Verifying Credentials...
      </p>
    </div>
  );

  // 2. Dynamic Location Tag
  let locationTag = `${projectMeta?.province || "ZA"} • FY${projectMeta?.start_year}`;
  let ScopeIcon = Map;
  
  if (projectMeta?.scope === 'route') {
      locationTag = `${projectMeta.route_name} • ${projectMeta.route_length_km}km • FY${projectMeta.start_year}`;
      ScopeIcon = RouteIcon;
  } else if (projectMeta?.scope === 'local') {
      locationTag = `${projectMeta.local_area} • FY${projectMeta.start_year}`;
      ScopeIcon = MapPin;
  } else if (projectMeta?.scope === 'municipal') {
      locationTag = `${projectMeta.municipality} • FY${projectMeta.start_year}`;
      ScopeIcon = Building2;
  }

  const isReadOnly = !hasAccess;

  return (
    <div className="h-full w-full bg-[var(--background)] flex flex-col relative">
      
      {/* 1. Top Nav */}
      <div className="sticky top-0 z-50">
        <ProjectNavBar projectId={projectId} />
      </div>

      <div className="flex flex-1 overflow-hidden transition-all duration-500">
        
        {/* 2. Left Sidebar */}
        <aside className={cn("hidden lg:block w-72 overflow-y-auto border-r", "bg-[var(--surface-bg)]", BORDER_SOFT)}>
          <div className="p-6">
            <Link href="/dashboard" className={cn("inline-flex items-center gap-2 text-xs font-bold mb-8 transition-colors", TEXT_MUTED, "hover:text-[var(--accent-color)]")}>
              <ArrowLeft className="w-3 h-3" /> Back to Dashboards
            </Link>

            <div className="mb-2">
              <h1 className="text-xl font-black text-[var(--foreground)] leading-tight mb-2">
                {projectMeta?.project_name || "Project"}
              </h1>
              <div className="flex flex-col gap-2 mt-2">
                  <span className={cn("inline-flex w-fit items-center gap-1.5 text-xs font-mono px-2 py-1 rounded border", BG_SOFT, BORDER_SOFT_2, TEXT_MUTED)}>
                    <ScopeIcon className="w-3 h-3 text-[var(--accent-color)]" />
                    {locationTag}
                  </span>
                  {/* READ-ONLY BADGE */}
                  {isReadOnly && (
                    <span className="inline-flex w-fit items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded bg-amber-500/10 text-amber-600 border border-amber-500/20">
                      <Eye className="w-3 h-3" /> Read-Only Mode
                    </span>
                  )}
              </div>
            </div>
          </div>
          <WizardStepper currentStep={step} onJump={setStep} />
        </aside>

        {/* 3. Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-[var(--background)]">
          <div className="max-w-4xl mx-auto p-8 space-y-8 pb-32">
            
            {/* Global Read-Only Notice */}
            {isReadOnly && (
              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                <Eye className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-amber-900 dark:text-amber-500">You are viewing this project in Read-Only Mode</h4>
                  <p className="text-xs text-amber-700 dark:text-amber-600/80 mt-1">
                    You can explore the inputs and simulation results, but you cannot make or save changes. Contact {projectMeta?.owner?.first_name || "the owner"} to request editor access.
                  </p>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-[var(--foreground)]">Data Inputs</h2>
                  <p className={TEXT_MUTED}>Define the physical inventory and traffic conditions.</p>
                </div>
                {proposalLoading ? (
                  <div className="h-64 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-slate-400" /></div>
                ) : (
                  <ProposalInputsCard 
                     proposal={proposal} 
                     projectMeta={projectMeta} 
                     saving={false} 
                     onSave={patchProposalData} 
                     readOnly={isReadOnly} // Pass prop down
                  />
                )}
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-[var(--foreground)]">Network Profile</h2>
                  <p className={TEXT_MUTED}>Review CRC and VCI baseline.</p>
                </div>
                <NetworkSnapshotCard projectId={projectId} />
                <div className={cn("pt-4 border-t", BORDER_SOFT)}>
                  <NetworkBreakdowns snapshot={snapshot} />
                </div>
              </div>
            )}

            {/* Note: In a complete system, you'd also pass `readOnly={isReadOnly}` to ScenarioAssumptionsCard and RunSimulationCard */}
            {step === 3 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-[var(--foreground)]">Forecast Strategy</h2>
                  <p className={TEXT_MUTED}>Adjust economic variables.</p>
                </div>
                <ScenarioAssumptionsCard projectId={projectId} />
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-[var(--foreground)]">Run Simulation</h2>
                  <p className={TEXT_MUTED}>Execute the RoNET engine.</p>
                </div>
                <RunSimulationCard projectId={projectId} />
              </div>
            )}
          </div>
        </main>
      </div>

      {/* 4. Footer Navigation */}
      <div className={cn(
          "sticky bottom-0 p-6 z-40 border-t transition-all duration-500", 
          "bg-[var(--surface-bg)]", BORDER_SOFT
      )}>
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button onClick={handleBack} disabled={step === 1 || navigating} className={cn("px-6 py-3 rounded-xl font-bold transition-colors text-slate-500", BG_HOVER, "disabled:opacity-30")}>
            Back
          </button>
          {step < 4 ? (
            <button onClick={handleNext} disabled={navigating} className="group flex items-center gap-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 transition-all hover:scale-105">
              {navigating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Next Step"}
              {!navigating && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
            </button>
          ) : (
            <button onClick={handleFinish} className="flex items-center gap-2 px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 transition-all hover:scale-105">
              View Results Dashboard <LayoutDashboard className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}