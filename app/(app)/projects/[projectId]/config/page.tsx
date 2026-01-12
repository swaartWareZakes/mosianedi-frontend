"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { DataInputCard } from "./DataInputCard";
import { NetworkSnapshotCard } from "./components/NetworkSnapshotCard";
import { ScenarioAssumptionsCard } from "./components/ScenarioAssumptionsCard";
import { RunSimulationCard } from "./components/RunSimulationCard";
import { ProvincialStatsCard } from "./components/ProvincialStatsCard";

export default function ProjectConfigPage() {
  const params = useParams();
  const projectId = Array.isArray(params?.projectId)
    ? params?.projectId[0]
    : params?.projectId;

  if (!projectId) {
    return <div>Error: Project ID not found.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <Link
              href="/projects"
              className="inline-flex items-center gap-1 hover:text-slate-700 dark:hover:text-slate-200"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to projects
            </Link>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Project Configuration
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Project ID:{" "}
            <span className="font-mono bg-slate-100 dark:bg-slate-900/40 px-1.5 py-0.5 rounded">
              {projectId}
            </span>
          </p>
        </div>
      </header>

      {/* Main layout */}
      <div className="grid gap-6 lg:grid-cols-[1.7fr,1.3fr]">
        
        {/* LEFT COLUMN: Inputs */}
        <div className="space-y-6">
            {/* 1. UPLOAD */}
            <DataInputCard projectId={projectId} />

            {/* NEW: Provincial Data Grid */}
          <ProvincialStatsCard projectId={projectId} />

            {/* 2. ASSUMPTIONS */}
            <ScenarioAssumptionsCard projectId={projectId} />
        </div>

        {/* RIGHT COLUMN: Info & Action */}
        <div className="space-y-6">
            {/* Info */}
            <NetworkSnapshotCard projectId={projectId} />

            {/* 3. RUN SIMULATION */}
            <RunSimulationCard projectId={projectId} />
        </div>
      </div>
    </div>
  );
}