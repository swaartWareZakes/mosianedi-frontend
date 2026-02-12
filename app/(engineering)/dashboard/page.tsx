"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from "@/lib/supabaseClient";
import { LayoutDashboard, ArrowRight, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

// const API_BASE = "http://127.0.0.1:8000";
const API_BASE = process.env.NEXT_PUBLIC_API_URL;

interface Project {
    id: string;
    project_name: string;
    description: string;
    created_at: string;
}

export default function DashboardHub() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProjects = async () => {
            setLoading(true);
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) return;

                const res = await fetch(`${API_BASE}/api/v1/projects`, {
                    headers: { 'Authorization': `Bearer ${session.access_token}` }
                });
                
                if (res.ok) {
                    const data = await res.json();
                    setProjects(data);
                } else {
                    setError("Could not load projects");
                }
            } catch (err) {
                console.error(err);
                setError("Connection failed");
            } finally {
                setLoading(false);
            }
        };
        fetchProjects();
    }, []);

    return (
      <div className="space-y-6">
        <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
                <LayoutDashboard className="h-6 w-6 text-sky-500" />
                Executive Dashboards
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
                Select a project below to view its performance forecast and analytics.
            </p>
        </div>

        {loading && <div className="py-10 text-center text-slate-500">Loading projects...</div>}
        
        {error && <div className="py-10 text-center text-red-500">{error}</div>}

        {!loading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {projects.map((project) => (
                    <Link 
                        key={project.id} 
                        href={`/projects/${project.id}/dashboard`}
                        className="group relative block p-6 bg-[var(--surface-bg)] border border-slate-200/50 dark:border-slate-800/50 rounded-2xl hover:shadow-md transition-all hover:border-sky-500/30"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-2 bg-sky-50 dark:bg-sky-900/20 text-sky-600 rounded-lg group-hover:scale-110 transition-transform">
                                <BarChart3 className="h-5 w-5" />
                            </div>
                            <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-sky-500 transition-colors" />
                        </div>
                        
                        <h3 className="font-semibold text-lg text-[var(--foreground)] mb-1">
                            {project.project_name}
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                            {project.description || "No description provided."}
                        </p>
                        
                        <div className="mt-4 text-xs font-medium text-sky-600 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                            View Dashboard
                        </div>
                    </Link>
                ))}
            </div>
        )}
        
        {!loading && projects.length === 0 && (
            <div className="text-center py-20 bg-[var(--surface-bg)] rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                <p className="text-slate-500">No projects found.</p>
                <Link href="/projects" className="text-sky-500 hover:underline text-sm">Create one in Projects</Link>
            </div>
        )}
      </div>
    );
}