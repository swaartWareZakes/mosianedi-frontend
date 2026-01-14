"use client";

import React, { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic"; 
import { supabase } from "@/lib/supabaseClient";
import { AlertTriangle, Cuboid } from "lucide-react";

import { useNetworkSnapshot } from "../projects/[projectId]/config/hooks/useNetworkSnapshot";
// 👇 NEW TYPE
import type { NetworkProfile } from "../projects/[projectId]/config/hooks/useNetworkSnapshot";

import { NetworkProjectSelector } from "./components/NetworkProjectSelector";
import { NetworkSnapshotSummary } from "./components/NetworkSnapshotSummary";
import { NetworkBreakdowns } from "./components/NetworkBreakdowns";

// 1. Dynamic Import for the 3D Component (No SSR)
const RoadModel3D = dynamic(
  () => import("./components/RealModel3D"), 
  { 
    ssr: false, 
    loading: () => (
      <div className="h-[500px] w-full bg-slate-950 rounded-2xl flex items-center justify-center text-slate-500 border border-slate-800">
        Initializing 3D Engine...
      </div>
    ) 
  }
);

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

type Project = {
  id: string;
  project_name: string;
  description?: string | null;
  start_year?: number | null;
  forecast_duration?: number | null;
  discount_rate?: number | null;
};

export default function NetworkPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [projectsError, setProjectsError] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");

  // --- 3D State ---
  const [roadWidth, setRoadWidth] = useState(8);
  const [roadIRI, setRoadIRI] = useState(2.5);

  // --- Fetch projects -------------------------------------------------------
  useEffect(() => {
    const fetchProjects = async () => {
      setProjectsLoading(true);
      setProjectsError(null);

      try {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;

        if (!token) {
          setProjectsError("Please log in to view your projects.");
          setProjectsLoading(false);
          return;
        }

        const res = await fetch(`${API_BASE}/api/v1/projects`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.detail || `Failed to load projects (${res.status})`);
        }

        const data: Project[] = await res.json();
        setProjects(data);

        // Auto-select first project if none chosen
        if (data.length > 0 && !selectedProjectId) {
          setSelectedProjectId(data[0].id);
        }
      } catch (err: any) {
        console.error("[NetworkPage] fetchProjects error:", err);
        setProjectsError(err.message || "Could not load projects.");
      } finally {
        setProjectsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // --- Network snapshot for selected project -------------------------------
  const {
    data: snapshot, // Remapped from 'data' to 'snapshot' variable name
    loading: snapshotLoading,
    error: snapshotError,
    refetch,
  } = useNetworkSnapshot(selectedProjectId || "");

  const selectedProject = useMemo(
    () => projects.find((p) => p.id === selectedProjectId) || null,
    [projects, selectedProjectId]
  );

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Network</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Explore your road network across projects. Select a project to see
          aggregated length, surface mix, condition, asset value and unit costs.
        </p>
      </header>

      {/* Project selector */}
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

      {/* Snapshot + breakdowns */}
      {selectedProjectId ? (
        <>
          <section className="grid gap-6 xl:grid-cols-[1.4fr,1.2fr]">
            {/* Left column */}
            <div className="space-y-4">
              <NetworkSnapshotSummary
                snapshot={snapshot}
                loading={snapshotLoading}
                error={snapshotError}
              />
            </div>

            {/* Right column */}
            <div className="space-y-4">
              <NetworkBreakdowns
                snapshot={snapshot}
              />
            </div>
          </section>

          {/* 3D Digital Twin Section */}
          <section className="mt-8 border-t border-slate-200/50 dark:border-slate-800/50 pt-8">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Cuboid className="h-5 w-5 text-indigo-500" />
              Digital Twin Inspector
            </h2>
            <p className="text-sm text-slate-500 mb-6 max-w-3xl">
              Visualize road cross-sections and deterioration mechanics. 
              Adjust the parameters below to see how geometry and condition (IRI) 
              affect the physical model of the asset.
            </p>

            <div className="grid grid-cols-1 xl:grid-cols-[2fr,1fr] gap-6">
              
              {/* 1. The 3D Stage */}
              <RoadModel3D width={roadWidth} length={35} iri={roadIRI} />

              {/* 2. The Engineer's Console */}
              <div className="bg-[var(--surface-bg)] p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm space-y-8 h-fit">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                    <h3 className="font-semibold text-sm uppercase tracking-wide text-slate-500">Parameters</h3>
                    <span className="text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2 py-1 rounded">Interactive</span>
                  </div>
                  
                  {/* Lane Width Control */}
                  <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <label className="text-sm font-medium">Carriageway Width</label>
                        <span className="font-mono text-sm bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded">{roadWidth}m</span>
                      </div>
                      <input 
                          type="range" min={4} max={20} step={0.5} 
                          value={roadWidth} 
                          onChange={(e) => setRoadWidth(Number(e.target.value))}
                          className="w-full accent-indigo-500 cursor-pointer"
                      />
                  </div>

                  {/* Condition Control */}
                  <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <label className="text-sm font-medium">Roughness (IRI)</label>
                        <span className={`font-mono text-sm px-2 py-0.5 rounded ${
                          roadIRI < 3 ? 'bg-emerald-100 text-emerald-700' :
                          roadIRI < 6 ? 'bg-amber-100 text-amber-700' :
                          'bg-rose-100 text-rose-700'
                        }`}>
                          {roadIRI.toFixed(1)}
                        </span>
                      </div>
                      <input 
                          type="range" min={0} max={15} step={0.1} 
                          value={roadIRI} 
                          onChange={(e) => setRoadIRI(Number(e.target.value))}
                          className={`w-full cursor-pointer ${
                            roadIRI < 3 ? 'accent-emerald-500' : 
                            roadIRI < 6 ? 'accent-amber-500' : 'accent-rose-500'
                          }`}
                      />
                  </div>
              </div>
            </div>
          </section>
        </>
      ) : (
        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          Select a project above to see network metrics.
        </p>
      )}
    </div>
  );
}