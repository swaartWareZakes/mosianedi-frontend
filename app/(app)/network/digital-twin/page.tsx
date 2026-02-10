"use client";

import React, { Suspense, useState, useEffect } from "react";
import { Loader2, ChevronDown } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { NetworkInspector } from "../components/NetworkInspector";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

// FIXED: Added 'default' keyword to resolve "is not a module" error
export default function DigitalTwinPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [activeProject, setActiveProject] = useState<any>(null);

  // 1. Fetch the list of projects for the selector
  useEffect(() => {
    async function fetchProjects() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const res = await fetch(`${API_BASE}/api/v1/projects`, {
          headers: { Authorization: `Bearer ${session?.access_token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setProjects(data);
          // Auto-select the first project if list exists but none selected
          if (data.length > 0 && !selectedProjectId) {
            setSelectedProjectId(data[0].id);
          }
        }
      } catch (err) {
        console.error("Failed to load projects:", err);
      }
    }
    fetchProjects();
  }, []);

  // 2. Fetch details when a project is selected
  useEffect(() => {
    if (!selectedProjectId) return;
    async function fetchProjectDetails() {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${API_BASE}/api/v1/projects/${selectedProjectId}`, {
        headers: { Authorization: `Bearer ${session?.access_token}` }
      });
      if (res.ok) setActiveProject(await res.json());
    }
    fetchProjectDetails();
  }, [selectedProjectId]);

  return (
    <div className="h-screen w-full bg-slate-950 overflow-hidden flex flex-col">
      {/* GLOBAL PROJECT SELECTOR */}
      <div className="z-[100] p-5 bg-slate-900/90 backdrop-blur-md border-b border-white/10 flex items-center justify-between">
        <div className="flex flex-col">
          <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">
            Network Project Selector
          </label>
          <div className="relative min-w-[320px]">
            <select 
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full bg-slate-800 text-white text-sm font-bold py-2.5 pl-4 pr-12 rounded-2xl appearance-none cursor-pointer border border-white/5 hover:border-sky-500 transition-all outline-none shadow-xl"
            >
              <option value="" disabled>Select a project to simulate...</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>
        <div className="hidden md:block text-right">
          <p className="text-[10px] text-sky-400 font-black uppercase tracking-widest">Digital Twin Engine</p>
          <p className="text-[9px] text-slate-500 font-mono">Real-time Stress Analysis v2.4</p>
        </div>
      </div>

      <div className="flex-1 relative">
        <Suspense fallback={
          <div className="flex h-full items-center justify-center text-white flex-col gap-4">
            <Loader2 className="animate-spin text-sky-500 w-10 h-10"/> 
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Initializing Physics...</p>
          </div>
        }>
          <NetworkInspector 
            projectName={activeProject?.name}
            province={activeProject?.province || "Gauteng"}
            proposalName={activeProject?.proposal_title || "Network Upgrade Phase 1"}
            selectedSegment={{
              // Fallback to 3.5 if no project data yet
              iri: activeProject?.avg_vci_used ? (100 - activeProject.avg_vci_used) / 10 : 3.5,
              surface: activeProject?.surface_type || "paved",
              name: activeProject?.segment_name || "Baseline Primary Link"
            }}
          />
        </Suspense>
      </div>
    </div>
  );
}