"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { supabase } from "@/lib/supabaseClient";
import { Database, Activity, Info, Map as MapIcon } from "lucide-react";
import { useNetworkSnapshot } from "../../projects/[projectId]/config/hooks/useNetworkSnapshot";
import { NetworkProjectSelector } from "../components/NetworkProjectSelector";
import { NetworkSnapshotSummary } from "../components/NetworkSnapshotSummary";
import { NetworkBreakdowns } from "../components/NetworkBreakdowns";

const LiveMap = dynamic(() => import("../components/LiveMap"), { ssr: false });
const API_BASE = process.env.NEXT_PUBLIC_API_URL;

// -------- System Tokens (no slate/dark) --------------------
const BG = "bg-[var(--background)]";
const SURFACE = "bg-[var(--surface-bg)]";
const TEXT = "text-[var(--foreground)]";
const MUTED = "text-[color:color-mix(in_oklab,var(--foreground)_60%,transparent)]";
const SOFT = "text-[color:color-mix(in_oklab,var(--foreground)_45%,transparent)]";
const FAINT = "text-[color:color-mix(in_oklab,var(--foreground)_30%,transparent)]";
const BORDER = "border-[color:color-mix(in_oklab,var(--foreground)_14%,transparent)]";
const BORDER_SOFT = "border-[color:color-mix(in_oklab,var(--foreground)_10%,transparent)]";
const WASH = "bg-[color:color-mix(in_oklab,var(--foreground)_6%,transparent)]";

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
    if (!selectedProjectId) {
      setProposalInputs(null);
      return;
    }

    async function fetchInputs() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch(`${API_BASE}/api/v1/projects/${selectedProjectId}/proposal-data`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (res.ok) setProposalInputs(await res.json());
      else setProposalInputs(null);
    }

    fetchInputs();
  }, [selectedProjectId]);

  const { data: snapshot, loading: snapLoading, error: snapshotError, refetch } =
    useNetworkSnapshot(selectedProjectId);

  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  // Baseline helpers (safe + consistent)
  const pavedTotal =
    proposalInputs
      ? Number(proposalInputs.paved_arid || 0) +
        Number(proposalInputs.paved_semi_arid || 0) +
        Number(proposalInputs.paved_dry_sub_humid || 0) +
        Number(proposalInputs.paved_moist_sub_humid || 0) +
        Number(proposalInputs.paved_humid || 0)
      : 0;

  const gravelTotal =
    proposalInputs
      ? Number(proposalInputs.gravel_arid || 0) +
        Number(proposalInputs.gravel_semi_arid || 0) +
        Number(proposalInputs.gravel_dry_sub_humid || 0) +
        Number(proposalInputs.gravel_moist_sub_humid || 0) +
        Number(proposalInputs.gravel_humid || 0)
      : 0;

  const targetVci = proposalInputs ? Number(proposalInputs.target_vci || 45) : 45;

  return (
    <div className={`h-full flex flex-col ${BG} ${TEXT} overflow-hidden`}>
      {/* TOP STRIP */}
      <div className={`p-6 border-b ${BORDER} ${SURFACE} shadow-sm z-20`}>
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

      {/* MAIN SPLIT */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* LEFT */}
        <div className={`w-full lg:w-[420px] border-r ${BORDER} ${SURFACE} overflow-y-auto`}>
          <div className="p-6 space-y-6">
            {/* Composition */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3
                  className={`text-[11px] font-black uppercase tracking-widest ${SOFT} flex items-center gap-2`}
                >
                  <Database className="w-3.5 h-3.5" />
                  Network Composition
                </h3>
                <span className={`text-[10px] ${FAINT} font-mono`}>length + value</span>
              </div>

              <div className={`rounded-2xl border ${BORDER_SOFT} ${WASH} p-4`}>
                <NetworkBreakdowns snapshot={snapshot} />
              </div>
            </div>

            {/* Baseline */}
            <div className={`rounded-2xl border ${BORDER} overflow-hidden`}>
              <div className={`px-4 py-3 ${WASH} border-b ${BORDER_SOFT} flex items-center`}>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600/10 flex items-center justify-center">
                    <Info className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div>
                    <div className={`text-xs font-bold ${TEXT}`}>Baseline Intelligence</div>
                    <div className={`text-[11px] ${MUTED}`}>Inputs captured for the selected program.</div>
                  </div>
                </div>
              </div>

              <div className="p-4">
                {proposalInputs ? (
                  <div className="space-y-3">
                    <Row label="Paved (Total)" value={`${pavedTotal.toFixed(0)} km`} />
                    <Row label="Gravel (Total)" value={`${gravelTotal.toFixed(0)} km`} />

                    <div className={`pt-3 mt-3 border-t ${BORDER_SOFT} flex items-center justify-between`}>
                      <span className={`text-[11px] font-bold ${MUTED}`}>Target VCI</span>
                      <span className="text-xs font-black text-indigo-600 font-mono">{targetVci}</span>
                    </div>
                  </div>
                ) : (
                  <p className={`text-[11px] ${FAINT} italic`}>Select a project to load baseline inputs.</p>
                )}
              </div>
            </div>

            {/* Hint */}
            <div className={`rounded-2xl border ${BORDER_SOFT} ${WASH} p-4`}>
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-600/10 flex items-center justify-center shrink-0">
                  <MapIcon className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <div className={`text-xs font-bold ${TEXT}`}>Map Inspector</div>
                  <p className={`text-[11px] ${MUTED} mt-0.5 leading-relaxed`}>
                    Review the region and (later) click segments to open a detail panel.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className={`flex-1 relative ${BG}`}>
          {/* HUD */}
          <div className="absolute top-4 left-4 z-[1000]">
            <div
              className={`backdrop-blur-md rounded-2xl border ${BORDER} shadow-sm ${SURFACE}`}
              style={{
                backgroundColor: "color-mix(in oklab, var(--surface-bg) 92%, transparent)",
              }}
            >
              <div className="flex items-center gap-3 px-4 py-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-600/10 flex items-center justify-center text-emerald-600">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <div className={`text-[10px] uppercase font-black tracking-widest ${SOFT}`}>Viewing Region</div>
                  <div className={`text-sm font-bold ${TEXT}`}>{selectedProject?.province || "National"}</div>
                </div>
              </div>
            </div>
          </div>

          {/* MAP */}
          <div className="absolute inset-0">
            <LiveMap
              province={selectedProject?.province || "Gauteng"}
              onSegmentSelect={() => {}}
              theme="system" // ✅ BEST: auto matches html.dark
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-[12px] text-[color:color-mix(in_oklab,var(--foreground)_60%,transparent)] font-medium">
        {label}
      </span>
      <span className="text-[12px] font-bold text-[var(--foreground)]">{value}</span>
    </div>
  );
}