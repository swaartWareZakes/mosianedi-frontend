"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { 
  ArrowLeft, 
  Presentation, 
  Map, 
  BarChart3, 
  FileText, 
  Layers, 
  CheckCircle2, 
  Play,
  Settings2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabaseClient";

const API_BASE = `${process.env.NEXT_PUBLIC_API_URL}`;

export default function PresentationSetupPage() {
  const params = useParams();
  // Handle projectId being string or string[]
  const projectId = Array.isArray(params?.projectId) ? params?.projectId[0] : params?.projectId;
  
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<any>(null);

  // Configuration State
  const [config, setConfig] = useState({
    title: "",
    presenter: "",
    showMap: true,
    showFinancials: true,
    showScenarios: true,
    showRecommendations: false
  });

  // Fetch Project Name for context
  useEffect(() => {
    async function fetchProject() {
      if (!projectId) return;
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch(`${API_BASE}/api/v1/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        setProject(data);
        // Set default title
        setConfig(prev => ({ 
            ...prev, 
            title: `${data.project_name} - Strategic Review` 
        }));
      }
      setLoading(false);
    }
    fetchProject();
  }, [projectId]);

  const handleLaunch = () => {
    // In a real app, we might save this config to the DB or Context.
    // For now, we pass it via query params or just navigate.
    // We will build the 'live' page next.
    router.push(`/projects/${projectId}/presentation/live?title=${encodeURIComponent(config.title)}`);
  };

  if (loading) return <div className="p-10 text-slate-500">Loading configuration...</div>;

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col">
      
      {/* Navbar */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-[var(--surface-bg)] px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link 
            href="/presentationmode"
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition text-slate-500"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-lg font-semibold flex items-center gap-2">
              <Settings2 className="h-5 w-5 text-slate-400" />
              Presentation Setup
            </h1>
            <p className="text-xs text-slate-500">
              {project?.project_name}
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto w-full p-8 grid grid-cols-1 lg:grid-cols-[1.5fr,1fr] gap-12">
        
        {/* Left Col: Narrative Config */}
        <div className="space-y-8">
            <div className="space-y-2">
                <h2 className="text-2xl font-bold tracking-tight">Set the Stage</h2>
                <p className="text-slate-500 dark:text-slate-400">
                    Define the narrative context for your presentation.
                </p>
            </div>

            <div className="space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Session Title</label>
                    <input 
                        type="text" 
                        value={config.title}
                        onChange={(e) => setConfig({...config, title: e.target.value})}
                        className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-purple-500 outline-none text-lg font-medium"
                        placeholder="e.g. Board Meeting Q3"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Presenter Name (Optional)</label>
                    <input 
                        type="text" 
                        value={config.presenter}
                        onChange={(e) => setConfig({...config, presenter: e.target.value})}
                        className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-purple-500 outline-none"
                        placeholder="e.g. Chief Engineer"
                    />
                </div>
            </div>

            <div className="pt-8">
                <h3 className="text-sm font-medium uppercase tracking-wider text-slate-500 mb-4">Modules to Include</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ModuleCard 
                        icon={<Map className="h-5 w-5 text-blue-500" />}
                        title="Interactive Map"
                        desc="GIS view of road conditions"
                        active={config.showMap}
                        onClick={() => setConfig({...config, showMap: !config.showMap})}
                    />
                    <ModuleCard 
                        icon={<BarChart3 className="h-5 w-5 text-emerald-500" />}
                        title="Financial Forecast"
                        desc="20-year budget charts"
                        active={config.showFinancials}
                        onClick={() => setConfig({...config, showFinancials: !config.showFinancials})}
                    />
                    <ModuleCard 
                        icon={<Layers className="h-5 w-5 text-purple-500" />}
                        title="Scenario Compare"
                        desc="Baseline vs. Austerity"
                        active={config.showScenarios}
                        onClick={() => setConfig({...config, showScenarios: !config.showScenarios})}
                    />
                    <ModuleCard 
                        icon={<FileText className="h-5 w-5 text-amber-500" />}
                        title="Recommendations"
                        desc="AI-generated summary"
                        active={config.showRecommendations}
                        onClick={() => setConfig({...config, showRecommendations: !config.showRecommendations})}
                    />
                </div>
            </div>
        </div>

        {/* Right Col: Preview & Action */}
        <div className="flex flex-col h-full bg-[var(--surface-bg)] border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl">
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 opacity-50">
                <div className="w-full aspect-video bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-700">
                    <Presentation className="h-12 w-12 text-slate-400" />
                </div>
                <p className="text-sm text-slate-500">Preview will appear on secondary display</p>
            </div>

            <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-800 space-y-4">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Estimated Duration</span>
                    <span className="font-mono font-medium">15 - 30 mins</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Data Source</span>
                    <span className="font-mono font-medium text-emerald-500">Live & Synced</span>
                </div>

                <button 
                    onClick={handleLaunch}
                    className="w-full group relative flex items-center justify-center gap-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-4 rounded-2xl font-bold text-lg hover:shadow-2xl hover:scale-[1.02] transition-all"
                >
                    <Play className="h-5 w-5 fill-current" />
                    Launch Presentation
                </button>
            </div>
        </div>

      </main>
    </div>
  );
}

function ModuleCard({ icon, title, desc, active, onClick }: any) {
    return (
        <button 
            onClick={onClick}
            className={cn(
                "flex items-start gap-3 p-4 rounded-xl border text-left transition-all",
                active 
                    ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20 ring-1 ring-purple-500" 
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
            )}
        >
            <div className={cn("mt-0.5", !active && "opacity-50")}>{icon}</div>
            <div>
                <div className="font-semibold text-sm flex items-center gap-2">
                    {title}
                    {active && <CheckCircle2 className="h-3 w-3 text-purple-600 dark:text-purple-400" />}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">{desc}</div>
            </div>
        </button>
    );
}