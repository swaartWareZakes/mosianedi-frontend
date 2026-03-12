"use client";

import React, { Suspense, useState, useEffect } from "react";
import { Loader2, ChevronDown } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { NetworkInspector } from "../components/NetworkInspector";
import { API_BASE_URL } from "@/lib/config";

export default function NetworkSimulationPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [activeProject, setActiveProject] = useState<any>(null);

  // 1) Fetch Projects List for Dropdown
  useEffect(() => {
    let cancelled = false;

    async function fetchProjects() {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${API_BASE_URL}/api/v1/projects`, {
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });

      if (!res.ok) return;
      const data = await res.json();
      if (cancelled) return;

      setProjects(data);
      if (data.length > 0) setSelectedProjectId(data[0].id);
    }

    fetchProjects();
    return () => { cancelled = true; };
  }, []);

  // 2) Fetch Project Metadata + Network Snapshot (for VCI)
  useEffect(() => {
    if (!selectedProjectId) return;
    let cancelled = false;

    async function fetchProjectDetails() {
      const { data: { session } } = await supabase.auth.getSession();
      const headers = { Authorization: `Bearer ${session?.access_token}` };

      try {
        // Fetch project metadata AND the aggregated network stats simultaneously
        const [projectRes, snapshotRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/v1/projects/${selectedProjectId}`, { headers }),
          fetch(`${API_BASE_URL}/api/v1/projects/${selectedProjectId}/network/snapshot`, { headers })
        ]);

        if (projectRes.ok && snapshotRes.ok) {
          const projectData = await projectRes.json();
          const snapshotData = await snapshotRes.json();
          
          if (cancelled) return;

          // Merge the name and the VCI into one object for the UI
          setActiveProject({
            ...projectData,
            avg_vci_used: snapshotData.avgVci,
          });
        }
      } catch (err) {
        console.error("Failed to load project details:", err);
      }
    }

    fetchProjectDetails();
    return () => { cancelled = true; };
  }, [selectedProjectId]);

  // Convert VCI (100 to 0) into IRI Roughness (1 to 10) for the 3D Engine
  const segmentIRI = activeProject?.avg_vci_used
    ? Math.max(1, Math.min(10, (100 - activeProject.avg_vci_used) / 10))
    : 3.5;

  return (
    <div className="h-screen w-full bg-slate-950 overflow-hidden flex flex-col">
      <div className="z-[100] p-5 bg-slate-900/90 backdrop-blur-md border-b border-white/10 flex items-center justify-between">
        <div className="flex flex-col">
          <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">
            Network Project Selector
          </label>
          <div className="relative">
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="bg-slate-800 text-white text-sm font-bold py-2.5 pl-4 pr-12 rounded-2xl appearance-none border border-white/5 hover:border-sky-500 outline-none shadow-xl min-w-[300px] cursor-pointer"
            >
              <option value="" disabled>Choose Project...</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.project_name} {/* Explicitly mapping backend field */}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="flex-1 relative">
        <Suspense
          fallback={
            <div className="flex h-full items-center justify-center text-white">
              <Loader2 className="animate-spin mr-2" /> Initializing Simulation...
            </div>
          }
        >
          <NetworkInspector
            // Pass the exact backend keys to unlock the button
            projectName={activeProject?.project_name || "Active Simulation"}
            province={activeProject?.province || "Unknown Province"}
            proposalName={activeProject?.status === "published" ? "Approved Baseline" : "Draft Baseline"}
            selectedSegment={{
              iri: segmentIRI,
              surface: "paved",
              name: "Primary Network Segment",
            }}
          />
        </Suspense>
      </div>
    </div>
  );
}