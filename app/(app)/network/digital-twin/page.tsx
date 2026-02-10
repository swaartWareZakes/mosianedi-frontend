"use client";

import React, { Suspense, useState, useEffect } from "react";
import { Loader2, ChevronDown } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { NetworkInspector } from "../components/NetworkInspector";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export default function DigitalTwinPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [activeProject, setActiveProject] = useState<any>(null);

  // 1. Fetch Projects List
  useEffect(() => {
    async function fetchProjects() {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${API_BASE}/api/v1/projects`, {
        headers: { Authorization: `Bearer ${session?.access_token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
        if (data.length > 0) setSelectedProjectId(data[0].id);
      }
    }
    fetchProjects();
  }, []);

  // 2. Fetch Project Metadata + Simulation Findings
  useEffect(() => {
    if (!selectedProjectId) return;
    async function fetchProjectDetails() {
      const { data: { session } } = await supabase.auth.getSession();
      
      // Fetching the detailed view which should now include your simulation table data
      const res = await fetch(`${API_BASE}/api/v1/projects/${selectedProjectId}`, {
        headers: { Authorization: `Bearer ${session?.access_token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        setActiveProject(data);
      }
    }
    fetchProjectDetails();
  }, [selectedProjectId]);

  return (
    <div className="h-screen w-full bg-slate-950 overflow-hidden flex flex-col">
      <div className="z-[100] p-5 bg-slate-900/90 backdrop-blur-md border-b border-white/10 flex items-center justify-between">
        <div className="flex flex-col">
          <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Network Project Selector</label>
          <div className="relative">
            <select 
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="bg-slate-800 text-white text-sm font-bold py-2.5 pl-4 pr-12 rounded-2xl appearance-none border border-white/5 hover:border-sky-500 outline-none shadow-xl min-w-[300px]"
            >
              <option value="">Choose Project...</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <ChevronDown className="absolute right-4 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="flex-1 relative">
        <Suspense fallback={<div className="flex h-full items-center justify-center text-white"><Loader2 className="animate-spin mr-2"/> Initializing Engine...</div>}>
          <NetworkInspector 
            // FIXED: Ensuring we pass a fallback name so the "Initiate" button unlocks
            projectName={activeProject?.name || activeProject?.project_name || "Active Simulation"} 
            province={activeProject?.province || "Unknown Province"}
            proposalName={activeProject?.proposal_title || "Simulation Baseline"}
            selectedSegment={{
              // Use simulation table data if available, fallback to 3.5
              iri: activeProject?.avg_vci_used ? (100 - activeProject.avg_vci_used) / 10 : 3.5,
              surface: activeProject?.surface_type || "paved",
              name: activeProject?.segment_name || "Primary Network Segment"
            }}
          />
        </Suspense>
      </div>
    </div>
  );
}