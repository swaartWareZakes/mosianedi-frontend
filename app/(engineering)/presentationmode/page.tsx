"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { 
  Presentation, 
  Calendar, 
  ChevronRight, 
  Briefcase,
  Map,
  Clock,
  ArrowUpRight,
  AlertCircle,
  CheckCircle2
} from "lucide-react";

const API_BASE = `${process.env.NEXT_PUBLIC_API_URL}`;

// 👇 Updated Interface to handle variations in DB column naming
interface Project {
  id: string;
  project_name: string;
  description: string;
  created_at: string;
  
  // These might vary depending on your exact DB schema, so we make them optional
  // and handle the logic inside the component.
  start_year?: number; 
  start_financial_year?: number; 
  
  duration?: number;
  forecast_duration?: number;
  
  status?: string;
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
      
      {/* Background */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-[var(--background)] bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)]">
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--background)] via-transparent to-transparent opacity-80" />
      </div>

      <div className="max-w-5xl mx-auto py-12 px-6">
        
        {/* Header */}
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

        {/* Project List */}
        <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-4 space-y-10 pb-20">
          
          {loading && (
              <div className="pl-12 flex items-center gap-3 text-slate-500">
                  <div className="h-2 w-2 rounded-full bg-slate-300 animate-pulse"/>
                  <span className="text-sm font-medium">Loading portfolio...</span>
              </div>
          )}

          {!loading && projects.length === 0 && (
              <div className="pl-12 text-slate-500">
                  <div className="p-6 border border-dashed border-slate-300 rounded-xl bg-slate-50/50">
                    No projects found. Go to Projects to create one first.
                  </div>
              </div>
          )}

          {projects.map((project) => {
            // 👇 LOGIC: Normalize Fields
            // Use current year + 1 as fallback if DB field is missing
            const startYear = project.start_year || project.start_financial_year || (new Date().getFullYear() + 1);
            
            // If duration is 0 or null, it implies the project hasn't been configured/simulated yet
            const duration = project.forecast_duration || project.duration || 0;
            const endYear = startYear + duration;
            
            const isReady = duration > 0; // "Ready" if we have a duration

            return (
              <div key={project.id} className="relative pl-10 group">
                
                {/* Node Dot */}
                <div className={`absolute -left-[9px] top-8 h-4 w-4 rounded-full border-4 border-[var(--background)] transition-all duration-300 shadow-sm z-10 ${isReady ? 'bg-purple-500 group-hover:scale-110' : 'bg-slate-300 dark:bg-slate-600'}`} />

                {/* Card */}
                <Link 
                    href={`/projects/${project.id}/presentation/setup`} 
                    className="block group-hover:-translate-y-1 transition-transform duration-300"
                >
                    <div className="bg-[var(--surface-bg)]/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/60 dark:border-slate-800 shadow-sm group-hover:shadow-xl group-hover:border-purple-500/20 transition-all">
                        
                        {/* Title Row */}
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

                        {/* Description */}
                        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed pl-[52px] mb-6 line-clamp-2">
                            {project.description || "No strategic description provided for this scenario."}
                        </p>

                        {/* Metadata Grid */}
                        <div className="pl-[52px] grid grid-cols-2 md:grid-cols-4 gap-4">
                            
                            {/* 1. Horizon */}
                            <div className="flex flex-col">
                              <span className="text-[10px] uppercase text-slate-400 font-semibold tracking-wider">Horizon</span>
                              {isReady ? (
                                <span className="text-xs font-mono text-slate-600 dark:text-slate-300 mt-1 flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {startYear} - {endYear}
                                </span>
                              ) : (
                                <span className="text-xs text-slate-400 mt-1 italic">Pending Config</span>
                              )}
                            </div>

                            {/* 2. Duration */}
                            <div className="flex flex-col">
                              <span className="text-[10px] uppercase text-slate-400 font-semibold tracking-wider">Duration</span>
                              <span className="text-xs font-mono text-slate-600 dark:text-slate-300 mt-1">
                                {isReady ? `${duration} Years` : "-"}
                              </span>
                            </div>

                            {/* 3. Network */}
                            <div className="flex flex-col">
                              <span className="text-[10px] uppercase text-slate-400 font-semibold tracking-wider">Network</span>
                              <span className="text-xs font-mono text-slate-600 dark:text-slate-300 mt-1 flex items-center gap-1">
                                <Map className="h-3 w-3" />
                                Ready
                              </span>
                            </div>

                            {/* 4. Status */}
                            <div className="flex flex-col">
                              <span className="text-[10px] uppercase text-slate-400 font-semibold tracking-wider">Status</span>
                              {isReady ? (
                                <span className="inline-flex w-fit items-center gap-1 rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20 dark:bg-emerald-900/20 dark:text-emerald-400">
                                  <CheckCircle2 className="h-3 w-3" /> Ready
                                </span>
                              ) : (
                                <span className="inline-flex w-fit items-center gap-1 rounded-md bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20 dark:bg-amber-900/20 dark:text-amber-400">
                                  <AlertCircle className="h-3 w-3" /> Draft
                                </span>
                              )}
                            </div>
                        </div>
                    </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}