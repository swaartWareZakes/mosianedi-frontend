/* --- app/(app)/projects/ProjectCreateForm.tsx --- */
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { NewProject } from "@/types/project"; 
import { supabase } from "@/lib/supabaseClient";
import { API_BASE_URL } from "@/lib/config"; // <-- IMPORT THIS

// USE THE IMPORTED CONFIG
const PROJECTS_ENDPOINT = `${API_BASE_URL}/api/v1/projects`; 
const getCurrentYear = () => new Date().getFullYear();

export function ProjectCreateForm({ onClose }: { onClose: (success: boolean) => void }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  // State to handle redirect after modal closes
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);

  const [project, setProject] = useState<NewProject>({
    project_name: "",
    description: "",
    start_year: getCurrentYear(),
    forecast_duration: 5,
    discount_rate: 8.0,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProject((prev) => ({
      ...prev,
      [name]:
        name === "start_year" || name === "forecast_duration"
          ? parseInt(value) || 0
          : name === "discount_rate"
          ? parseFloat(value) || 0
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    let success = false;
    let newRedirectUrl: string | null = null;

    try {
        const { data: { session } } = await supabase.auth.getSession(); 
        const token = session?.access_token;

        if (!token) {
             throw new Error("User session expired or unauthorized.");
        }
        
        // USE THE CENTRALIZED ENDPOINT
        const response = await fetch(PROJECTS_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify(project),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || `API error: ${response.status}`);
        }

        // Success: Prepare redirect URL
        const newProjectId = data.project_id;
        newRedirectUrl = `/projects/${newProjectId}/config`;
        success = true;
        
    } catch (err) {
        console.error("Project Creation Failed:", err);
        const msg = err instanceof Error ? err.message : 'Unknown error';
        setErrorMsg(`Failed to create project: ${msg}`);
        success = false; 
        newRedirectUrl = null;
    } finally {
        setLoading(false);
        setRedirectUrl(newRedirectUrl);
        onClose(success); // Signal parent to close modal and refresh list
        
        // Perform redirect ensuring state updates don't conflict with unmounting
        if (success && newRedirectUrl) {
             router.push(newRedirectUrl);
        }
    }
  };

  return (
    <div className="bg-[var(--surface-bg)] rounded-2xl p-6 shadow-xl">
        <h2 className="text-xl font-semibold text-[var(--foreground)] mb-2">Create New Project Scenario</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            Define the scope and planning horizon for your road investment simulation.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Project Name */}
            <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Project Name
                </label>
                <input
                    type="text"
                    name="project_name"
                    required
                    value={project.project_name}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-300 bg-[var(--input-bg)] px-3 py-2 text-sm text-[var(--input-text)] focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:border-slate-700 dark:focus:ring-sky-800/40"
                    placeholder="e.g., 5-Year National Road Maintenance"
                />
            </div>
            
            {/* Description */}
            <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Description / Scope
                </label>
                <textarea
                    name="description"
                    rows={3}
                    required
                    value={project.description}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-300 bg-[var(--input-bg)] px-3 py-2 text-sm text-[var(--input-text)] focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:border-slate-700 dark:focus:ring-sky-800/40"
                    placeholder="Justify this simulation and outline key assumptions."
                />
            </div>

            {/* Start Year / Duration / Discount Rate */}
            <div className="grid grid-cols-3 gap-4">
                <div>
                    <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        Start Year
                    </label>
                    <input
                        type="number"
                        name="start_year"
                        required
                        value={project.start_year}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-slate-300 bg-[var(--input-bg)] px-3 py-2 text-sm text-[var(--input-text)] focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:border-slate-700 dark:focus:ring-sky-800/40"
                    />
                </div>
                <div>
                    <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        Duration (Years)
                    </label>
                    <input
                        type="number"
                        name="forecast_duration"
                        required
                        min={1}
                        max={30}
                        value={project.forecast_duration}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-slate-300 bg-[var(--input-bg)] px-3 py-2 text-sm text-[var(--input-text)] focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100 dark:border-slate-700 dark:focus:ring-sky-800/40"
                    />
                </div>
                <div>
                    <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        Discount Rate (%)
                    </label>
                    <input
                        type="number"
                        name="discount_rate"
                        required
                        step="0.1"
                        min="0"
                        max="100"
                        value={project.discount_rate}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-slate-300 bg-[var(--input-bg)] px-3 py-2 text-sm text-[var(--input-text)] focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100 dark:border-slate-700 dark:focus:ring-sky-800/40"
                    />
                </div>
            </div>

            {errorMsg && (
                <p className="text-xs text-red-500">{errorMsg}</p>
            )}

            <div className="flex justify-end space-x-3 pt-2">
                <button
                    type="button"
                    onClick={() => onClose(false)}
                    className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-[var(--foreground)] transition-colors"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="rounded-xl bg-[var(--accent-color)] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:brightness-110 disabled:opacity-70 transition"
                >
                    {loading ? "Creating..." : "Create Project"}
                </button>
            </div>
        </form>
    </div>
  );
}