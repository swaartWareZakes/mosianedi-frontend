"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { API_BASE_URL } from "@/lib/config";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  History,
  RefreshCw,
  Calendar,
  Activity,
  Download,
  AlertTriangle,
  FileText,
} from "lucide-react";

type SimulationRun = {
  id: string;
  created_at: string;
  // simulation_results payload shape may vary; keep it flexible
  results_payload?: any;
};

function fmtDate(dt: string) {
  const d = new Date(dt);
  if (Number.isNaN(d.getTime())) return dt;
  return d.toLocaleString();
}

export default function SimulationHistoryPage() {
  const params = useParams();
  const projectId = params.projectId as string;

  const [runs, setRuns] = useState<SimulationRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRuns = async () => {
    if (!projectId) return;
    setError(null);
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      // ✅ Backend endpoint we assume exists (or will exist):
      // GET /api/v1/projects/{projectId}/simulation/runs
      const res = await fetch(
        `${API_BASE_URL}/api/v1/projects/${projectId}/simulation/runs`,
        { headers: { Authorization: `Bearer ${session.access_token}` } }
      );

      if (res.status === 404) {
        setRuns([]);
        return;
      }

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to load simulation history");
      }

      const data = await res.json();

      // Accept either: [{id, created_at, results_payload}] OR something similar
      const mapped: SimulationRun[] = (Array.isArray(data) ? data : []).map((r: any) => ({
        id: r.id,
        created_at: r.created_at || r.createdAt || new Date().toISOString(),
        results_payload: r.results_payload ?? r.resultsPayload ?? r,
      }));

      setRuns(mapped);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load simulation history");
      setRuns([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchRuns();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchRuns();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const latest = useMemo(() => runs?.[0] ?? null, [runs]);

  return (
    <div className="space-y-6 pb-20">
      {/* HEADER */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <Link
            href={`/projects/${projectId}/dashboard`}
            className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-indigo-600 mb-2 transition-colors"
          >
            <ArrowLeft className="w-3 h-3" /> Back to Dashboard
          </Link>

          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <History className="w-6 h-6 text-indigo-500" />
            Simulation History
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Review prior simulation runs for this project. Useful for audit trails and Treasury justification.
          </p>
        </div>

        <button
          onClick={onRefresh}
          disabled={refreshing}
          className={cn(
            "inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border transition-colors",
            "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800",
            "hover:bg-slate-50 dark:hover:bg-slate-700",
            "text-slate-700 dark:text-slate-200 disabled:opacity-60"
          )}
        >
          <RefreshCw className={cn("w-4 h-4", refreshing && "animate-spin")} />
          {refreshing ? "Refreshing…" : "Refresh"}
        </button>
      </header>

      {/* ERROR */}
      {error && (
        <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-300 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 mt-0.5" />
          <div className="text-sm whitespace-pre-wrap">{error}</div>
        </div>
      )}

      {/* EMPTY */}
      {!loading && !error && runs.length === 0 && (
        <div className="p-10 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-center">
          <div className="mx-auto w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <Activity className="w-7 h-7 text-slate-400" />
          </div>
          <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">
            No simulation runs yet
          </h3>
          <p className="mt-2 text-sm text-slate-500 max-w-md mx-auto">
            Run a simulation from the Inputs page to generate a forecast. Once generated, each run will appear here.
          </p>
          <Link
            href={`/projects/${projectId}/config`}
            className="inline-flex mt-5 items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
          >
            <FileText className="w-4 h-4" />
            Go to Inputs
          </Link>
        </div>
      )}

      {/* LOADING */}
      {loading && (
        <div className="flex h-48 items-center justify-center">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* LIST */}
      {!loading && runs.length > 0 && (
        <div className="grid gap-4">
          {/* Latest highlight */}
          {latest && (
            <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950/30 dark:to-slate-950 border border-indigo-100 dark:border-indigo-900/40">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-wider font-bold text-indigo-600 dark:text-indigo-300">
                    Latest run
                  </p>
                  <h3 className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
                    {latest.id}
                  </h3>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    {fmtDate(latest.created_at)}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    // simple export JSON
                    const blob = new Blob([JSON.stringify(latest.results_payload ?? {}, null, 2)], {
                      type: "application/json",
                    });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `simulation_${projectId}_${latest.id}.json`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                >
                  <Download className="w-4 h-4" />
                  Export JSON
                </button>
              </div>
            </div>
          )}

          {/* Table-like cards */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-slate-50 dark:bg-slate-900/40 text-[10px] uppercase tracking-wider font-bold text-slate-500">
              <div className="col-span-5">Run ID</div>
              <div className="col-span-5">Created</div>
              <div className="col-span-2 text-right">Export</div>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {runs.map((r) => (
                <div key={r.id} className="grid grid-cols-12 gap-2 px-4 py-3 bg-white dark:bg-slate-950">
                  <div className="col-span-5">
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                      {r.id}
                    </p>
                  </div>
                  <div className="col-span-5">
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      {fmtDate(r.created_at)}
                    </p>
                  </div>
                  <div className="col-span-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        const blob = new Blob([JSON.stringify(r.results_payload ?? {}, null, 2)], {
                          type: "application/json",
                        });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = `simulation_${projectId}_${r.id}.json`;
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                      className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                    >
                      <Download className="w-3.5 h-3.5" />
                      JSON
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-slate-500">
            Note: This page expects a backend endpoint for run history. If you haven’t added it yet, I’ll give you the FastAPI route + repo SQL next.
          </p>
        </div>
      )}
    </div>
  );
}