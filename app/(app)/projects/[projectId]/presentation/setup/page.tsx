"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { 
  ArrowLeft, 
  Presentation, 
  MapPin, 
  TrendingDown, 
  Wallet, 
  CheckCircle2, 
  Play,
  Settings2,
  AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabaseClient";

const API_BASE = `${process.env.NEXT_PUBLIC_API_URL}`;

const PROVINCES = [
  "Gauteng", "Free State", "KwaZulu-Natal", "Western Cape", 
  "Eastern Cape", "Limpopo", "Mpumalanga", "North West", "Northern Cape"
];

export default function PresentationSetupPage() {
  const params = useParams();
  const projectId = Array.isArray(params?.projectId) ? params?.projectId[0] : params?.projectId;
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<any>(null);

  // Configuration State
  const [config, setConfig] = useState({
    title: "",
    presenter: "",
    province: "Gauteng", // Default, will auto-detect
    includeContext: true,   // Slide: Network Overview
    includeDecay: true,     // Slide: The Problem (Line Charts)
    includeFinancials: true,// Slide: The Ask (Budget)
    includeConclusion: true // Slide: Impact
  });

  // Fetch Project & Auto-Detect Province
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
        
        // Auto-Detect Province from Name/Desc
        const text = (data.project_name + " " + (data.description || "")).toLowerCase();
        const found = PROVINCES.find(p => text.includes(p.toLowerCase())) || "Gauteng";

        setConfig(prev => ({ 
            ...prev, 
            title: `${data.project_name} - Strategic Review`,
            province: found
        }));
      }
      setLoading(false);
    }
    fetchProject();
  }, [projectId]);

  const handleLaunch = () => {
    // Encode config into URL params for the live page
    const query = new URLSearchParams({
        title: config.title,
        province: config.province,
        slides: JSON.stringify({
            context: config.includeContext,
            decay: config.includeDecay,
            finance: config.includeFinancials,
            end: config.includeConclusion
        })
    }).toString();

    router.push(`/projects/${projectId}/presentation/live?${query}`);
  };

  if (loading) return <div className="p-10 text-slate-500 flex items-center gap-2"><div className="w-4 h-4 bg-slate-400 animate-pulse rounded-full"/> Loading mission control...</div>;

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col font-sans">
      
      {/* Navbar */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-[var(--surface-bg)] px-8 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Link href="/presentationmode" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition text-slate-500">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-lg font-semibold flex items-center gap-2 text-slate-900 dark:text-white">
              <Settings2 className="h-5 w-5 text-indigo-500" />
              Presentation Strategy
            </h1>
            <p className="text-xs text-slate-500 font-mono">
              {project?.project_name} • {config.province}
            </p>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full p-8 grid grid-cols-1 lg:grid-cols-[1.5fr,1fr] gap-12">
        
        {/* Left: Configuration */}
        <div className="space-y-10">
            
            {/* 1. Context */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold tracking-tight border-b border-slate-200 dark:border-slate-800 pb-2">1. Narrative Context</h2>
                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-slate-500">Presentation Title</label>
                        <input 
                            type="text" 
                            value={config.title}
                            onChange={(e) => setConfig({...config, title: e.target.value})}
                            className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-slate-500">Target Province (Map Center)</label>
                        <select 
                            value={config.province}
                            onChange={(e) => setConfig({...config, province: e.target.value})}
                            className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
                        >
                            {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {/* 2. Story Modules */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold tracking-tight border-b border-slate-200 dark:border-slate-800 pb-2">2. Story Board</h2>
                <div className="grid grid-cols-1 gap-3">
                    
                    <ModuleCard 
                        icon={<MapPin className="h-5 w-5 text-blue-500" />}
                        title="Network Overview"
                        desc="Start with a high-level view of the province showing current asset value and condition."
                        active={config.includeContext}
                        onClick={() => setConfig({...config, includeContext: !config.includeContext})}
                    />

                    <ModuleCard 
                        icon={<TrendingDown className="h-5 w-5 text-rose-500" />}
                        title="The Threat (Decay Analysis)"
                        desc="Show the 'Consequence of Inaction' line chart. Visualizes how VCI drops if budget is denied."
                        active={config.includeDecay}
                        onClick={() => setConfig({...config, includeDecay: !config.includeDecay})}
                    />

                    <ModuleCard 
                        icon={<Wallet className="h-5 w-5 text-emerald-500" />}
                        title="The Proposal (Financials)"
                        desc="Reveal the required budget (R-Value) and the specific roads it will save."
                        active={config.includeFinancials}
                        onClick={() => setConfig({...config, includeFinancials: !config.includeFinancials})}
                    />

                    <ModuleCard 
                        icon={<CheckCircle2 className="h-5 w-5 text-indigo-500" />}
                        title="Strategic Impact"
                        desc="Conclusion slide summarizing ROI, risk reduction, and service delivery benefits."
                        active={config.includeConclusion}
                        onClick={() => setConfig({...config, includeConclusion: !config.includeConclusion})}
                    />
                </div>
            </div>
        </div>

        {/* Right: Preview Panel */}
        <div className="sticky top-28 h-fit">
            <div className="flex flex-col bg-slate-900 text-white rounded-3xl p-1 shadow-2xl overflow-hidden border border-slate-800">
                
                {/* Mock Screen */}
                <div className="relative aspect-video bg-slate-950 rounded-2xl overflow-hidden flex flex-col">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,#3b0764,transparent)] opacity-50"/>
                    
                    {/* Header Mock */}
                    <div className="p-4 flex justify-between items-center border-b border-white/10 relative z-10">
                        <div className="w-24 h-2 bg-white/20 rounded-full"/>
                        <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/50 flex items-center justify-center">
                            <Play className="w-3 h-3 text-indigo-400 fill-indigo-400" />
                        </div>
                    </div>

                    {/* Content Mock */}
                    <div className="flex-1 flex flex-col items-center justify-center space-y-3 relative z-10 p-8 text-center">
                        <div className="space-y-1">
                            <div className="text-[10px] uppercase tracking-widest text-indigo-400">Boardroom Mode</div>
                            <div className="text-xl font-bold leading-tight">{config.title}</div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 w-full mt-4 opacity-50">
                            <div className="h-16 bg-white/5 rounded-lg border border-white/5"/>
                            <div className="h-16 bg-white/5 rounded-lg border border-white/5"/>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="p-6 space-y-4 bg-slate-900">
                    <div className="flex justify-between text-xs text-slate-400">
                        <span>Slides: <strong className="text-white">{Object.values(config).filter(v => v === true).length - 1}</strong></span>
                        <span>Est. Time: <strong className="text-white">15 min</strong></span>
                    </div>
                    <button 
                        onClick={handleLaunch}
                        className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-900/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                    >
                        <Presentation className="w-4 h-4" />
                        Launch Presentation
                    </button>
                </div>
            </div>
            
            <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-xl flex gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
                    <strong>Tip:</strong> Ensure the project simulation has been run in the Dashboard before presenting. The financial slides rely on cached simulation data.
                </p>
            </div>
        </div>

      </main>
    </div>
  );
}

// Helper
function ModuleCard({ icon, title, desc, active, onClick }: any) {
    return (
        <button 
            onClick={onClick}
            className={cn(
                "flex items-start gap-4 p-4 rounded-xl border text-left transition-all group",
                active 
                    ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/20 ring-1 ring-indigo-500 shadow-sm" 
                    : "border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-slate-50 dark:hover:bg-slate-800"
            )}
        >
            <div className={cn("p-2 rounded-lg transition-colors", active ? "bg-white dark:bg-slate-950 shadow-sm" : "bg-slate-100 dark:bg-slate-800")}>
                {icon}
            </div>
            <div className="flex-1">
                <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center justify-between">
                    {title}
                    <div className={cn("w-5 h-5 rounded-full border flex items-center justify-center transition-all", active ? "bg-indigo-600 border-indigo-600" : "border-slate-300 dark:border-slate-600")}>
                        {active && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                    </div>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed pr-8">
                    {desc}
                </p>
            </div>
        </button>
    );
}