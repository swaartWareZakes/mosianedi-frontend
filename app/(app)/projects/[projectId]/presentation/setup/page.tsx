"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { 
  ArrowLeft, 
  MapPin, 
  TrendingDown, 
  Wallet, 
  CheckCircle2, 
  Play,
  Settings2,
  MonitorPlay
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

  const [config, setConfig] = useState({
    title: "",
    presenter: "",
    province: "Gauteng",
    includeContext: true,
    includeDecay: true,
    includeFinancials: true,
    includeConclusion: true
  });

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
        
        const text = (data.project_name + " " + (data.description || "")).toLowerCase();
        const found = PROVINCES.find(p => text.includes(p.toLowerCase())) || "Gauteng";

        setConfig(prev => ({ 
            ...prev, 
            title: `${data.project_name} Strategic Review`,
            province: found
        }));
      }
      setLoading(false);
    }
    fetchProject();
  }, [projectId]);

  const handleLaunch = () => {
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

  if (loading) return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
  );

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col font-sans">
      
      {/* Navbar */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-[var(--surface-bg)] px-8 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Link href={`/projects/${projectId}/dashboard`} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition text-slate-500">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-lg font-bold flex items-center gap-2 text-slate-900 dark:text-white">
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
            
            <div className="space-y-4">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">1. Context</h2>
                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500">Presentation Title</label>
                        <input 
                            type="text" 
                            value={config.title}
                            onChange={(e) => setConfig({...config, title: e.target.value})}
                            className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500">Target Province</label>
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

            <div className="space-y-4">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">2. Story Board</h2>
                <div className="grid grid-cols-1 gap-3">
                    <ModuleCard 
                        icon={<MapPin className="h-5 w-5 text-blue-500" />}
                        title="Network Overview"
                        desc="High-level map view showing current asset value and condition (VCI)."
                        active={config.includeContext}
                        onClick={() => setConfig({...config, includeContext: !config.includeContext})}
                    />
                    <ModuleCard 
                        icon={<TrendingDown className="h-5 w-5 text-rose-500" />}
                        title="The Risk (Decay)"
                        desc="Visualize the 'Cost of Inaction' with a dramatic deterioration curve."
                        active={config.includeDecay}
                        onClick={() => setConfig({...config, includeDecay: !config.includeDecay})}
                    />
                    <ModuleCard 
                        icon={<Wallet className="h-5 w-5 text-emerald-500" />}
                        title="The Ask (Financials)"
                        desc="Reveal the required budget and investment efficiency metrics."
                        active={config.includeFinancials}
                        onClick={() => setConfig({...config, includeFinancials: !config.includeFinancials})}
                    />
                    <ModuleCard 
                        icon={<CheckCircle2 className="h-5 w-5 text-indigo-500" />}
                        title="Strategic Impact"
                        desc="Comparison graph showing the divergence between funding and failure."
                        active={config.includeConclusion}
                        onClick={() => setConfig({...config, includeConclusion: !config.includeConclusion})}
                    />
                </div>
            </div>
        </div>

        {/* Right: Preview Panel */}
        <div className="sticky top-28 h-fit">
            <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-2xl border border-slate-800 space-y-6">
                <div className="text-center space-y-2">
                    <div className="w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-indigo-500/50">
                        <MonitorPlay className="w-8 h-8 text-indigo-400" />
                    </div>
                    <h3 className="text-xl font-bold">Ready to Present</h3>
                    <p className="text-sm text-slate-400">
                        This will launch a full-screen, cinematic data experience designed for boardrooms.
                    </p>
                </div>

                <div className="bg-slate-950 rounded-xl p-4 border border-slate-800">
                    <div className="flex justify-between text-xs text-slate-400 mb-2">
                        <span>Slides</span>
                        <span className="text-white font-mono">{Object.values(config).filter(v => v === true).length - 1}</span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-400">
                        <span>Est. Duration</span>
                        <span className="text-white font-mono">10-15 min</span>
                    </div>
                </div>

                <button 
                    onClick={handleLaunch}
                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-900/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                >
                    <Play className="w-4 h-4 fill-white" />
                    Launch Live Mode
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