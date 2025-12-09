// app/(app)/network/page.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { AlertTriangle } from "lucide-react";

import { useNetworkSnapshot } from "../projects/[projectId]/config/hooks/useNetworkSnapshot";
import type { NetworkSnapshotUi } from "../projects/[projectId]/config/hooks/useNetworkSnapshot";

import { NetworkProjectSelector } from "./components/NetworkProjectSelector";
import { NetworkSnapshotSummary } from "./components/NetworkSnapshotSummary";
import { NetworkBreakdowns } from "./components/NetworkBreakdowns";

const API_BASE = "http://127.0.0.1:8000";

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

  // --- Fetch projects -------------------------------------------------------
  useEffect(() => {
    const fetchProjects = async () => {
      setProjectsLoading(true);
      setProjectsError(null);

      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const token = session?.access_token;

        if (!token) {
          setProjectsError("Please log in to view your projects.");
          setProjectsLoading(false);
          return;
        }

        const res = await fetch(`${API_BASE}/api/v1/projects`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Network snapshot for selected project -------------------------------
  const {
    snapshot,
    loading: snapshotLoading,
    error: snapshotError,
    refetch,
  } = useNetworkSnapshot(selectedProjectId || "");

  const selectedProject = useMemo(
    () => projects.find((p) => p.id === selectedProjectId) || null,
    [projects, selectedProjectId]
  );

  const totalLengthForRatios: number =
    snapshot?.totalNetworkLengthKm ?? snapshot?.totalLengthKm ?? 0;

  return (
    <div className="space-y-6">
      {/* Header -------------------------------------------------------------- */}
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Network</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Explore your road network across projects. Select a project to see
          aggregated length, surface mix, condition, asset value and unit costs
          from the latest master data upload.
        </p>
      </header>

      {/* Project selector ---------------------------------------------------- */}
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

      {/* Snapshot + breakdowns ---------------------------------------------- */}
      {selectedProjectId ? (
        <section className="grid gap-6 xl:grid-cols-[1.4fr,1.2fr]">
          {/* Left column */}
          <div className="space-y-4">
            <NetworkSnapshotSummary
              snapshot={snapshot as NetworkSnapshotUi | null}
              loading={snapshotLoading}
              error={snapshotError}
            />
          </div>

          {/* Right column */}
          <div className="space-y-4">
            <NetworkBreakdowns
              snapshot={snapshot as NetworkSnapshotUi | null}
              totalLengthForRatios={totalLengthForRatios}
            />
          </div>
        </section>
      ) : (
        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          Select a project above to see network metrics.
        </p>
      )}
    </div>
  );
}