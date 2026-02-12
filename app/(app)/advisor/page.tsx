"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export default function GlobalAdvisorPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState("");

  useEffect(() => {
    async function fetchProjects() {
      try {
        const { data } = await supabase
          .from("projects")
          .select("id, project_name, province")
          .order("updated_at", { ascending: false });

        if (data) setProjects(data);
      } catch (err) {
        console.error("Error fetching projects:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProjects();
  }, []);

  const handleGo = () => {
    if (selectedId) router.push(`/projects/${selectedId}/advisor`);
  };

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col items-center justify-center bg-[var(--background)] p-6">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Hero Icon */}
        <div className="relative mx-auto w-24 h-24">
          <div className="absolute inset-0 bg-[var(--accent-color)] rounded-full blur-2xl opacity-20 animate-pulse" />
          <div
            className="
              relative w-full h-full rounded-full flex items-center justify-center
              bg-[var(--surface-bg)]
              border border-[color:color-mix(in_oklab,var(--foreground)_14%,transparent)]
              shadow-xl
            "
          >
            <Sparkles className="w-10 h-10 text-[var(--accent-color)]" />
          </div>
        </div>

        <div>
          <h1 className="text-3xl font-bold text-[var(--foreground)]">
            AI Strategic Advisor
          </h1>
          <p className="mt-2 text-[color:color-mix(in_oklab,var(--foreground)_60%,transparent)]">
            Select a project to analyze simulation results and generate a Treasury-ready strategy.
          </p>
        </div>

        {/* Selector Card */}
        <div
          className="
            p-6 rounded-2xl text-left
            bg-[var(--surface-bg)]
            border border-[color:color-mix(in_oklab,var(--foreground)_14%,transparent)]
            shadow-lg
          "
        >
          <label className="text-xs font-bold uppercase tracking-wider mb-2 block text-[color:color-mix(in_oklab,var(--foreground)_55%,transparent)]">
            Select Project Scope
          </label>

          {loading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-5 h-5 animate-spin text-[var(--accent-color)]" />
            </div>
          ) : (
            <div className="space-y-4">
              <select
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                className="
                  w-full p-3 rounded-xl text-sm outline-none
                  bg-[var(--input-bg)]
                  text-[var(--input-text)]
                  border border-[color:color-mix(in_oklab,var(--foreground)_14%,transparent)]
                  focus:ring-2 focus:ring-[var(--accent-color)]/40
                "
              >
                <option value="" disabled>
                  -- Choose a Project --
                </option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.project_name} ({p.province})
                  </option>
                ))}
              </select>

              <button
                onClick={handleGo}
                disabled={!selectedId}
                className="
                  w-full py-3 rounded-xl font-bold
                  bg-[var(--accent-color)] text-white
                  shadow-lg disabled:opacity-50 disabled:cursor-not-allowed
                  flex items-center justify-center gap-2 transition-all active:scale-[0.98]
                  hover:brightness-110
                "
              >
                Launch Advisor <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}