"use client";

import React, { useState, useEffect } from "react";
import { 
  Send, 
  FileCheck, 
  Building, 
  Check, 
  Loader2,
  AlertTriangle,
  TrendingUp,
  BrainCircuit,
  Lock,
  Stamp,
  ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useReportData } from "../hooks/useReportData";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { supabase } from "@/lib/supabaseClient";

export default function TreasuryViewPage() {
  // 1. Submission State
  const [status, setStatus] = useState<"draft" | "submitting" | "submitted">("draft");
  const [refNumber, setRefNumber] = useState<string | null>(null);
  
  // 2. Project Context
  const [projects, setProjects] = useState<any[]>([]);
  const [projectId, setProjectId] = useState<string | null>(null);

  // Load Project List
  useEffect(() => {
      const fetchProjects = async () => {
        const { data } = await supabase
            .from("projects")
            .select("id, project_name, province")
            .order("updated_at", {ascending: false});
        
        if(data && data.length > 0) {
            setProjects(data);
            setProjectId(data[0].id); // Default to latest
        }
      };
      fetchProjects();
  }, []);

  const { data, loading, error } = useReportData(projectId);

  // 3. The "Formal Submission" Logic
  const handleSubmit = () => {
    if (!window.confirm("CONFIRM SUBMISSION\n\nThis will lock the project version and notify the Provincial Treasury HOD. This action cannot be undone.\n\nProceed?")) {
        return;
    }
    setStatus("submitting");
    setTimeout(() => {
        setStatus("submitted");
        setRefNumber(`TR-${new Date().getFullYear()}-FS-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 2000);
  };

  const formatMoney = (amount: number) => {
    if (!amount) return "R 0.00";
    if (amount >= 1_000_000_000) return `R ${(amount / 1_000_000_000).toFixed(2)}bn`;
    return `R ${(amount / 1_000_000).toFixed(1)}m`;
  };

  // Loading state for initial project fetch
  if (!projectId && projects.length === 0) return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-slate-400 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500"/>
          <p>Loading Projects...</p>
      </div>
  );

  return (
    <div className="p-8 pb-32 max-w-6xl mx-auto">
      
      {/* 1. Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-12">
        <div>
          {/* Dynamic Status Badge */}
          <div className={cn(
              "inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-3 border",
              status === "submitted" 
                  ? "bg-amber-50 border-amber-200 text-amber-700" 
                  : "bg-indigo-50 border-indigo-100 text-indigo-600"
          )}>
            {status === "submitted" ? <Stamp className="w-3 h-3" /> : <Building className="w-3 h-3" />}
            {status === "submitted" ? `Pending Review • Ref: ${refNumber}` : "Draft Submission"}
          </div>

          <div className="flex items-center gap-4">
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Executive Case</h1>
            
            {/* PROJECT SELECTOR DROPDOWN */}
            <div className="relative group">
                <select 
                    value={projectId || ""}
                    onChange={(e) => setProjectId(e.target.value)}
                    className="appearance-none bg-slate-100 dark:bg-slate-800 border-none text-lg font-bold text-slate-900 dark:text-white py-2 pl-4 pr-10 rounded-xl cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                    {projects.map((p) => (
                        <option key={p.id} value={p.id}>
                            {p.province} — {p.project_name}
                        </option>
                    ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            </div>
          </div>
          
          <p className="text-lg text-slate-500 mt-2">PRMG Funding Motivation • FY 2027/28</p>
        </div>

        <div className="flex flex-col items-end gap-3">
            {data && (
                <div className="text-right hidden md:block">
                    <div className="text-xs font-bold uppercase text-slate-400">Submission Value</div>
                    <div className="text-xl font-black text-slate-900 dark:text-slate-100">{formatMoney(data.summary.budgetAsk)}</div>
                </div>
            )}

            <button 
                onClick={handleSubmit}
                disabled={status !== "draft" || loading}
                className={cn(
                    "flex items-center gap-2 px-6 py-3 text-sm font-bold rounded-xl transition-all shadow-lg",
                    status === "draft" && !loading
                        ? "bg-indigo-600 hover:bg-indigo-700 hover:scale-105 text-white shadow-indigo-500/20"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-200 dark:border-slate-700 shadow-none"
                )}
            >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 
                 status === "submitting" ? <Loader2 className="w-4 h-4 animate-spin" /> :
                 status === "submitted" ? <Lock className="w-4 h-4" /> :
                 <Send className="w-4 h-4" />
                }
                
                {loading ? "Loading Data..." :
                 status === "draft" ? "Submit to Treasury" :
                 status === "submitting" ? "Verifying..." :
                 "Submission Locked"
                }
            </button>
            
            {status === "submitted" && (
                <div className="text-[10px] text-emerald-600 font-medium flex items-center gap-1 animate-in fade-in slide-in-from-top-1">
                    <Check className="w-3 h-3" /> Sent to HOD (2 mins ago)
                </div>
            )}
        </div>
      </div>

      {/* LOADING / ERROR STATES */}
      {loading && (
          <div className="h-96 flex flex-col items-center justify-center text-slate-400 gap-3 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-500"/>
              <p>Compiling Report Data...</p>
          </div>
      )}

      {error && !loading && (
          <div className="p-20 text-center text-slate-500 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
              <AlertTriangle className="w-10 h-10 mx-auto text-rose-400 mb-4"/>
              <h2 className="text-xl font-bold mb-2">Data Unavailable</h2>
              <p>Please ensure you have run a simulation for this project.</p>
          </div>
      )}

      {/* CONTENT */}
      {!loading && !error && data && (
        <div className={cn("grid grid-cols-1 lg:grid-cols-3 gap-8 transition-opacity duration-500", status === "submitted" && "opacity-80 pointer-events-none select-none grayscale-[0.5]")}>
            
            {/* LEFT COL: The Visual Evidence */}
            <div className="lg:col-span-2 space-y-6">
                
                {/* Graph */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-indigo-500"/>
                                Impact of Funding vs. Decay
                            </h3>
                            <p className="text-xs text-slate-500 mt-1">10-Year forecast of Network Condition (VCI)</p>
                        </div>
                        <div className="flex gap-4 text-[10px] font-bold uppercase tracking-wider">
                            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500"/> Funded</div>
                            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-rose-500"/> Do Nothing</div>
                        </div>
                    </div>

                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            {/* FIX: Use data.chartData */}
                            <AreaChart data={data.chartData} margin={{top: 10, right: 0, left: -20, bottom: 0}}>
                                <defs>
                                    <linearGradient id="colorGood" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorBad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="year" fontSize={10} tickLine={false} axisLine={false} />
                                <YAxis fontSize={10} tickLine={false} axisLine={false} domain={[0, 100]} />
                                <Tooltip 
                                    contentStyle={{backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px'}}
                                />
                                <Area type="monotone" dataKey="fundedVCI" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorGood)" name="Funded VCI" />
                                <Area type="monotone" dataKey="doNothingVCI" stroke="#f43f5e" strokeWidth={3} strokeDasharray="5 5" fillOpacity={1} fill="url(#colorBad)" name="Decay VCI" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* AI Narrative */}
                <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-700">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
                            <BrainCircuit className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div className="space-y-2">
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Strategic Assessment</h4>
                            {/* FIX: Use data.narrative */}
                            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                                "{data.narrative.executiveSummary}"
                            </p>
                            <div className="flex items-center gap-2 pt-2 text-rose-600 dark:text-rose-400 text-xs font-bold">
                                <AlertTriangle className="w-3 h-3" />
                                RISK: {data.narrative.riskStatement}
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* RIGHT COL: Compliance & Stats */}
            <div className="space-y-6">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6">
                    <div>
                        <div className="text-xs font-bold text-slate-400 uppercase mb-1">Asset Value At Risk</div>
                        {/* FIX: Use data.summary */}
                        <div className="text-3xl font-black text-slate-900 dark:text-white">{formatMoney(data.summary.assetValue)}</div>
                    </div>
                    <div className="h-px bg-slate-100 dark:bg-slate-800" />
                    <div>
                        <div className="text-xs font-bold text-slate-400 uppercase mb-1">Preventative Ratio</div>
                        <div className="text-3xl font-black text-indigo-600">
                            {data.summary.preservationRatio.toFixed(1)}%
                        </div>
                        <div className="text-xs text-slate-500 mt-1">Target is 2-3% of CRC</div>
                    </div>
                    <div className="h-px bg-slate-100 dark:bg-slate-800" />
                    <div>
                        <div className="text-xs font-bold text-slate-400 uppercase mb-1">Network Health</div>
                        <div className="flex items-center gap-2">
                            <div className="text-3xl font-black text-slate-900 dark:text-white">{data.summary.currentVci.toFixed(0)}</div>
                            <span className={`text-xs px-2 py-1 rounded font-bold ${data.summary.currentVci < 50 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                {data.summary.currentVci < 50 ? 'POOR' : 'FAIR'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2 mb-4">
                        <FileCheck className="w-5 h-5 text-emerald-500" />
                        <h3 className="font-bold text-slate-900 dark:text-white">Compliance Check</h3>
                    </div>
                    <div className="space-y-3">
                        <CheckItem label="RAMS Data Verified" checked />
                        <CheckItem label="Treasury 6B Form" checked />
                        <CheckItem label="MTEF Alignment" checked />
                        <CheckItem label="MEC Approval" checked={status === "submitted"} />
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}

function CheckItem({ label, checked }: any) {
    return (
        <div className="flex items-center gap-3 text-sm">
            <div className={cn(
                "w-5 h-5 rounded-full flex items-center justify-center border transition-all duration-300",
                checked 
                    ? "bg-emerald-500 border-emerald-500 text-white" 
                    : "border-slate-300 text-transparent"
            )}>
                <Check className="w-3 h-3" />
            </div>
            <span className={cn(checked ? "text-slate-700 dark:text-slate-200" : "text-slate-400")}>{label}</span>
        </div>
    )
}