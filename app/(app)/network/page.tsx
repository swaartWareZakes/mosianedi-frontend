"use client";

import React, { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { supabase } from "@/lib/supabaseClient";
import { AlertTriangle, Loader2 } from "lucide-react";
import { useNetworkSnapshot } from "../projects/[projectId]/config/hooks/useNetworkSnapshot";
import { NetworkProjectSelector } from "./components/NetworkProjectSelector";
import { NetworkSnapshotSummary } from "./components/NetworkSnapshotSummary";
import { NetworkBreakdowns } from "./components/NetworkBreakdowns";
import { NetworkInspector } from "./components/NetworkInspector";

// Dynamic Import for Map
const LiveMap = dynamic(() => import("./components/LiveMap"), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full flex items-center justify-center bg-slate-950 text-slate-500">
            <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading GIS Engine...
        </div>
    )
});

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

type Project = {
  id: string;
  project_name: string;
  description?: string;
  province?: string; // Added province field from DB
  created_at?: string; // Added created_at field to fix sorting error
};

export default function NetworkPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [projectsError, setProjectsError] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");

  // --- STATE FOR TWIN SYNC ---
  const [selectedSegmentData, setSelectedSegmentData] = useState<{
      iri: number;
      width: number;
      surface: "paved" | "gravel";
      name: string;
  } | null>(null);

  // --- Fetch projects ---
  useEffect(() => {
    const fetchProjects = async () => {
      setProjectsLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
        if (!token) { setProjectsError("Please log in."); return; }
        
        const res = await fetch(`${API_BASE}/api/v1/projects`, { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) throw new Error("Failed to load projects");
        
        const data: Project[] = await res.json();
        // Sort by newest first
        const sorted = data.sort((a, b) => new Date(b.created_at || "").getTime() - new Date(a.created_at || "").getTime());
        setProjects(sorted);
        
        if (sorted.length > 0 && !selectedProjectId) setSelectedProjectId(sorted[0].id);
      } catch (err: any) { setProjectsError(err.message); } 
      finally { setProjectsLoading(false); }
    };
    fetchProjects();
  }, []); //

  const { data: snapshot, loading: snapshotLoading, error: snapshotError, refetch } = useNetworkSnapshot(selectedProjectId || "");
  const selectedProject = useMemo(() => projects.find((p) => p.id === selectedProjectId) || null, [projects, selectedProjectId]); //
  
  // --- ROBUST PROVINCE DETECTION ---
  const activeProvince = useMemo(() => {
      if (!selectedProject) return "Gauteng";

      // 1. Normalize strings for comparison
      const dbProvince = (selectedProject.province || "").trim();
      const nameText = (selectedProject.project_name || "").toLowerCase();
      const combinedText = `${dbProvince.toLowerCase()} ${nameText}`; //

      // 2. Exact Match Check (DB Field)
      if (dbProvince === "Western Cape") return "Western Cape";
      if (dbProvince === "Eastern Cape") return "Eastern Cape";
      if (dbProvince === "Northern Cape") return "Northern Cape";
      if (dbProvince === "North West") return "North West";
      if (dbProvince === "Free State") return "Free State";
      if (dbProvince === "KwaZulu-Natal") return "KwaZulu-Natal";

      // 3. Fuzzy Match Check (Name Analysis)
      if (combinedText.includes("western")) return "Western Cape";
      if (combinedText.includes("eastern")) return "Eastern Cape";
      if (combinedText.includes("northern")) return "Northern Cape";
      if (combinedText.includes("north west") || combinedText.includes("northwest")) return "North West";
      if (combinedText.includes("free state") || combinedText.includes("freestate")) return "Free State";
      if (combinedText.includes("natal") || combinedText.includes("kzn")) return "KwaZulu-Natal";
      if (combinedText.includes("limpopo")) return "Limpopo";
      if (combinedText.includes("mpumala")) return "Mpumalanga"; 
      
      return "Gauteng"; // Fallback
  }, [selectedProject]); //

  return (
    <div className="space-y-8 pb-20">
      
      {/* HEADER & SELECTOR */}
      <div className="space-y-4">
        <header>
            <h1 className="text-2xl font-semibold tracking-tight">Network Explorer</h1>
            <p className="text-sm text-slate-500">Master data analysis and digital twin simulation.</p>
        </header>
        <NetworkProjectSelector
            projects={projects}
            projectsLoading={projectsLoading}
            projectsError={projectsError}
            selectedProjectId={selectedProjectId}
            onSelectedProjectChange={setSelectedProjectId}
            snapshotLoading={snapshotLoading}
            onRefreshSnapshot={refetch}
            selectedProject={selectedProject}
        />
      </div>

      {selectedProjectId ? (
        <>
          {/* KPI SUMMARY */}
          <NetworkSnapshotSummary snapshot={snapshot} loading={snapshotLoading} error={snapshotError} />

          {/* SECTION A: THE LIVE MAP */}
          <section className="space-y-2">
             <div className="flex items-center justify-between px-1">
                 <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                    Live GIS Network
                 </h3>
                 <span className="text-xs text-slate-500">
                    Displaying Assets for: <strong className="text-indigo-500">{activeProvince}</strong>
                 </span>
             </div>
             
             <div className="h-[550px] w-full rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg overflow-hidden relative">
                 <LiveMap 
                    province={activeProvince} 
                    onSegmentSelect={(seg) => {
                        setSelectedSegmentData({
                            iri: seg.iri,
                            width: seg.width,
                            surface: seg.surface,
                            name: seg.name
                        });
                        document.getElementById('inspector-section')?.scrollIntoView({ behavior: 'smooth' });
                    }} 
                 />
             </div>
          </section>

          {/* SECTION B: THE INSPECTOR */}
          <section id="inspector-section" className="space-y-2">
             <div className="flex items-center justify-between px-1">
                 <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                    Asset Digital Twin
                 </h3>
             </div>
             {/* Height set to 800px for immersive view */}
             <div className="h-[800px] w-full rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg overflow-hidden bg-[var(--surface-bg)]">
                <NetworkInspector selectedSegment={selectedSegmentData} province={activeProvince}/>
             </div>
          </section>

          {/* BREAKDOWNS */}
          <div className="pt-8 border-t border-slate-200 dark:border-slate-800">
             <NetworkBreakdowns snapshot={snapshot} />
          </div>
        </>
      ) : (
        <p className="text-xs text-slate-500 flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Select a project above.</p>
      )}
    </div>
  );
}