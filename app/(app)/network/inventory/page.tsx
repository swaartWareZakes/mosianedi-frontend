"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { supabase } from "@/lib/supabaseClient";
import { FileText, Map as MapIcon, Database, Activity, Info } from "lucide-react";
import { useNetworkSnapshot } from "../../projects/[projectId]/config/hooks/useNetworkSnapshot";
import { NetworkProjectSelector } from "../components/NetworkProjectSelector";
import { NetworkSnapshotSummary } from "../components/NetworkSnapshotSummary";
import { NetworkBreakdowns } from "../components/NetworkBreakdowns";

const LiveMap = dynamic(() => import("../components/LiveMap"), { ssr: false });
const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export default function InventoryPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [proposalInputs, setProposalInputs] = useState<any>(null);

  useEffect(() => {
    async function getProjects() {
      const { data } = await supabase.from("projects").select("*");
      if (data) setProjects(data);
    }
    getProjects();
  }, []);

  useEffect(() => {
    if (!selectedProjectId) return;
    async function fetchInputs() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const res = await fetch(`${API_BASE}/api/v1/projects/${selectedProjectId}/proposal-data`, {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });
      if (res.ok) setProposalInputs(await res.json());
    }
    fetchInputs();
  }, [selectedProjectId]);

  const { data: snapshot, loading: snapLoading, error: snapshotError, refetch } = useNetworkSnapshot(selectedProjectId);
  const selectedProject = projects.find(p => p.id === selectedProjectId);

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-950 overflow-hidden text-slate-900 dark:text-white">
      {/* 1. TOP SECTION (KPIs) */}
      <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm z-20">
        <div className="flex flex-col xl:flex-row gap-6 items-start">
          <div className="w-full xl:w-1/3">
             <NetworkProjectSelector 
                projects={projects} 
                selectedProjectId={selectedProjectId} 
                onSelectedProjectChange={setSelectedProjectId}
                onRefreshSnapshot={refetch}
                snapshotLoading={snapLoading}
                selectedProject={selectedProject}
                projectsLoading={false}
                projectsError={null}
              />
          </div>
          <div className="flex-1 w-full">
            <NetworkSnapshotSummary snapshot={snapshot} loading={snapLoading} error={snapshotError} />
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* LEFT: COMPOSITION & BASELINE */}
        <div className="w-full lg:w-[400px] border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-y-auto p-6 space-y-6">
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider flex items-center gap-2">
              <Database className="w-3 h-3"/> Network Composition
            </h3>
            <NetworkBreakdowns snapshot={snapshot} />
          </div>

          <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50">
             <h4 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-2 flex items-center gap-2">
               <Info className="w-3 h-3"/> Baseline Intelligence
             </h4>
             {proposalInputs ? (
               <div className="space-y-3">
                 <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Paved (Total)</span>
                    <span className="font-bold">{(Number(proposalInputs.paved_arid || 0) + Number(proposalInputs.paved_humid || 0)).toFixed(0)} km</span>
                 </div>
                 <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Gravel (Total)</span>
                    <span className="font-bold">{Number(proposalInputs.gravel_arid || 0).toFixed(0)} km</span>
                 </div>
                 <div className="pt-2 border-t border-indigo-100 flex justify-between">
                    <span className="text-[11px] font-bold text-slate-500">Target VCI</span>
                    <span className="text-xs font-black text-indigo-600 font-mono">{proposalInputs.avg_vci_used || 45}</span>
                 </div>
               </div>
             ) : <p className="text-[10px] text-slate-400 italic">Select a project to load data</p>}
          </div>
        </div>

        {/* RIGHT: MAP AREA */}
        <div className="flex-1 relative bg-slate-100">
           <div className="absolute top-4 left-4 z-[1000] flex gap-2">
              <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur px-3 py-2 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 flex items-center gap-3">
                <div className="p-1.5 bg-emerald-100 rounded-md text-emerald-600">
                  <Activity className="w-3.5 h-3.5"/>
                </div>
                <div>
                  <div className="text-[9px] uppercase font-bold text-slate-400">Viewing Region</div>
                  <div className="text-xs font-bold">{selectedProject?.province || "National"}</div>
                </div>
              </div>
           </div>

           <LiveMap province={selectedProject?.province || "Gauteng"} onSegmentSelect={() => {}} theme="light" />
        </div>
      </div>
    </div>
  );
}