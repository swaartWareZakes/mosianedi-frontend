"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { 
  Presentation, 
  Calendar, 
  User, 
  ChevronRight, 
  GitBranch, 
  Loader2,
  Briefcase,
  Map,
  Clock,
  ArrowUpRight
} from "lucide-react";
import { cn } from "@/lib/utils";

const API_BASE = `${process.env.NEXT_PUBLIC_API_URL}`;

interface Project {
  id: string;
  project_name: string;
  description: string;
  created_at: string;
  start_year: number;
  forecast_duration: number;
}

export default function PresentationHub() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProjects() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const res = await fetch(`${API_BASE}/api/v1/projects`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });

        if (res.ok) {
          const data = await res.json();
          // Sort by newest first
          setProjects(data.sort((a: Project, b: Project) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          ));
        }
      } catch (error) {
        console.error("Failed to load projects", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProjects();
  }, []);

  return (
    <div className="relative min-h-screen w-full">
      
      {/* 1. COOL BACKGROUND (Dot Pattern) */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-[var(--background)] bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)]">
        {/* Gradient Overlay for Fade */}
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--background)] via-transparent to-transparent opacity-80" />
      </div>

      <div className="max-w-5xl mx-auto py-12 px-6">
        
        {/* Header Section */}
        <div className="mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-purple-50 dark:bg-purple-900/20 px-3 py-1 text-xs font-medium text-purple-600 dark:text-purple-300 ring-1 ring-inset ring-purple-500/20">
            <Presentation className="h-3 w-3" /> Executive Suite
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-[var(--foreground)]">
            Presentation Hub
          </h1>
          <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
            Select a strategic initiative below to configure the presentation environment. 
            Prepare your narrative, maps, and financial forecasts for the boardroom.
          </p>
        </div>

        {/* The Tree List */}
        <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-4 space-y-10 pb-20">
          
          {loading && (
              <div className="pl-12 flex items-center gap-3 text-slate-500">
                  <div className="h-2 w-2 rounded-full bg-slate-300 animate-pulse"/>
                  <span className="text-sm font-medium">Loading your portfolio...</span>
              </div>
          )}

          {!loading && projects.length === 0 && (
              <div className="pl-12 text-slate-500">
                  <div className="p-6 border border-dashed border-slate-300 rounded-xl bg-slate-50/50">
                    No projects found. Go to Projects to create one first.
                  </div>
              </div>
          )}

          {projects.map((project) => (
            <div key={project.id} className="relative pl-10 group">
              
              {/* The "Node" Dot on the Tree Line */}
              <div className="absolute -left-[9px] top-8 h-4 w-4 rounded-full border-4 border-[var(--background)] bg-slate-300 dark:bg-slate-600 group-hover:bg-purple-500 group-hover:scale-110 transition-all duration-300 shadow-sm z-10" />

              {/* The Card */}
              <Link 
                  // 👇 POINTS TO THE NEW SETUP PAGE
                  href={`/projects/${project.id}/presentation/setup`} 
                  className="block group-hover:-translate-y-1 transition-transform duration-300"
              >
                  <div className="bg-[var(--surface-bg)]/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/60 dark:border-slate-800 shadow-sm group-hover:shadow-xl group-hover:border-purple-500/20 transition-all">
                      
                      {/* Top Row: Title & Action */}
                      <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-3">
                              <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg group-hover:bg-purple-100 dark:group-hover:bg-purple-900/30 transition-colors">
                                <Briefcase className="h-5 w-5 text-slate-500 group-hover:text-purple-600 dark:group-hover:text-purple-400" />
                              </div>
                              <div>
                                <h2 className="text-lg font-bold text-[var(--foreground)] group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                                    {project.project_name}
                                </h2>
                                <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                                  <Clock className="h-3 w-3" />
                                  <span>Last modified {new Date(project.created_at).toLocaleDateString()}</span>
                                </div>
                              </div>
                          </div>
                          
                          <div className="h-8 w-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-all">
                              <ArrowUpRight className="h-4 w-4" />
                          </div>
                      </div>

                      {/* Middle: Description */}
                      <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed pl-[52px] mb-6 line-clamp-2">
                          {project.description || "No strategic description provided for this scenario."}
                      </p>

                      {/* Bottom: Rich Metadata Grid */}
                      <div className="pl-[52px] grid grid-cols-2 md:grid-cols-4 gap-4">
                          {/* Horizon */}
                          <div className="flex flex-col">
                            <span className="text-[10px] uppercase text-slate-400 font-semibold tracking-wider">Horizon</span>
                            <span className="text-xs font-mono text-slate-600 dark:text-slate-300 mt-1 flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {project.start_year} - {project.start_year + (project.forecast_duration || 20)}
                            </span>
                          </div>

                          {/* Duration */}
                          <div className="flex flex-col">
                            <span className="text-[10px] uppercase text-slate-400 font-semibold tracking-wider">Duration</span>
                            <span className="text-xs font-mono text-slate-600 dark:text-slate-300 mt-1">
                              {project.forecast_duration || 20} Years
                            </span>
                          </div>

                          {/* Assets (Placeholder for now, implies dashboard data) */}
                          <div className="flex flex-col">
                            <span className="text-[10px] uppercase text-slate-400 font-semibold tracking-wider">Network</span>
                            <span className="text-xs font-mono text-slate-600 dark:text-slate-300 mt-1 flex items-center gap-1">
                              <Map className="h-3 w-3" />
                              Full Coverage
                            </span>
                          </div>

                          {/* Status */}
                          <div className="flex flex-col">
                            <span className="text-[10px] uppercase text-slate-400 font-semibold tracking-wider">Status</span>
                            <span className="inline-flex w-fit items-center rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20 dark:bg-emerald-900/20 dark:text-emerald-400">
                              Ready
                            </span>
                          </div>
                      </div>
                  </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}