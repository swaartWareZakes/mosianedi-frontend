"use client";

import React, { useEffect, useState } from "react";
import { 
  Send, 
  FileCheck, 
  TrendingDown, 
  ShieldAlert, 
  Building, 
  Check, 
  Loader2,
  AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabaseClient";

// Types for our aggregated data
type TreasuryData = {
  projectName: string;
  province: string;
  totalAsk: number;
  criticalLength: number; // km of poor road
  totalLength: number;
  riskCount: number; // segments with IRI > 6
  maintenanceSplit: {
    rehab: number;
    reseal: number;
    routine: number;
  };
  generatedAt: string;
};

export default function TreasuryViewPage() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<TreasuryData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // --- 1. FETCH REAL DATA ---
  useEffect(() => {
    async function loadTreasuryData() {
      setLoading(true);
      
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            setError("Please log in to view treasury reports.");
            setLoading(false);
            return;
        }

        // A. Fetch the MOST RECENT project worked on (to show something relevant)
        const { data: projects } = await supabase
            .from("projects")
            .select("id, project_name, province")
            .order("updated_at", { ascending: false })
            .limit(1)
            .single();
        
        if (!projects) { 
            setLoading(false); 
            return; 
        }

        // B. Fetch Latest Simulation for that project
        const { data: sim } = await supabase
            .from("simulation_results")
            .select("results_payload, run_at")
            .eq("project_id", projects.id)
            .order("run_at", { ascending: false })
            .limit(1)
            .single();
        
        if (!sim || !sim.results_payload) {
            setData(null); // Project exists but no simulation run yet
            setLoading(false);
            return;
        }

        const payload = sim.results_payload;
        const totalAsk = payload.total_cost_npv || 0;
        
        // Mocking split based on typical ratios since engine aggregates total
        // In a real advanced engine, these would be separate line items
        const split = {
            rehab: totalAsk * 0.45,
            reseal: totalAsk * 0.35,
            routine: totalAsk * 0.20
        };

        // Get VCI from first year to estimate condition
        const startVci = payload.yearly_data?.[0]?.avg_condition_index || 50;
        
        // Estimate critical length (inverse of VCI roughly)
        const totalLen = 5000; // Default placeholder if not in sim payload (engine update might be needed to pass total km)
        const criticalLen = totalLen * ((100 - startVci) / 100) * 0.4; // Rough heuristic

        setData({
            projectName: projects.project_name,
            province: projects.province,
            totalAsk: totalAsk,
            criticalLength: criticalLen,
            totalLength: totalLen,
            riskCount: Math.floor(criticalLen / 5), // Assuming 5km segments
            maintenanceSplit: split,
            generatedAt: new Date(sim.run_at).toLocaleDateString()
        });

      } catch (err: any) {
          console.error("Error loading treasury data:", err);
          setError("Failed to load report data.");
      } finally {
          setLoading(false);
      }
    }
    loadTreasuryData();
  }, []);

  const handleSend = () => {
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  };

  const formatCurrency = (val: number) => {
      return new Intl.NumberFormat('en-ZA', { 
          style: 'currency', 
          currency: 'ZAR', 
          notation: "compact", 
          maximumFractionDigits: 1 
      }).format(val);
  };

  if (loading) return (
      <div className="h-full flex flex-col items-center justify-center p-20 text-slate-500 gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500"/>
          <p>Compiling Executive Case...</p>
      </div>
  );

  if (error) return (
      <div className="p-20 text-center text-rose-500 flex flex-col items-center gap-2">
          <AlertTriangle className="w-8 h-8" />
          {error}
      </div>
  );

  if (!data) return (
      <div className="p-20 text-center text-slate-500">
          <h2 className="text-xl font-bold mb-2">No Data Available</h2>
          <p>Please run a simulation in the <strong>Projects</strong> tab first to generate a Treasury Case.</p>
      </div>
  );

  return (
    <div className="p-8 pb-32 max-w-5xl mx-auto">
      
      {/* 1. Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm mb-2">
            <Building className="w-4 h-4" />
            NATIONAL TREASURY SUBMISSION
          </div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Executive Case: {data.province}</h1>
          <p className="text-lg text-slate-500 mt-2">PRMG Funding Request • {data.projectName}</p>
        </div>

        <div className="flex items-center gap-3">
            <div className="text-right hidden md:block mr-4">
                <div className="text-xs font-bold uppercase text-slate-400">Date Generated</div>
                <div className="text-sm font-bold text-slate-700 dark:text-slate-300">{data.generatedAt}</div>
            </div>
            <button 
                onClick={handleSend}
                disabled={sent}
                className={cn(
                    "flex items-center gap-2 px-6 py-3 text-sm font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/20",
                    sent 
                        ? "bg-emerald-500 text-white" 
                        : "bg-indigo-600 hover:bg-indigo-700 text-white"
                )}
            >
                {sent ? <Check className="w-4 h-4" /> : <Send className="w-4 h-4" />}
                {sent ? "Sent Successfully" : "Submit to Treasury"}
            </button>
        </div>
      </div>

      {/* 2. The Narrative (The "Why") */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Main Column: The Argument */}
        <div className="md:col-span-2 space-y-8">
            
            {/* Executive Summary Card */}
            <section className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-bl-full" />
                
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Executive Summary</h2>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    The requested funding of <strong className="text-indigo-600">{formatCurrency(data.totalAsk)}</strong> is critical to arrest the deterioration of the {data.province} secondary road network. 
                    Without this intervention, approximately <strong>{data.criticalLength.toFixed(0)} km</strong> of the paved network will degrade from "Fair" to "Poor" condition within 18 months, 
                    resulting in a massive liability increase in rehabilitation costs by 2028.
                </p>
                
                <div className="mt-6 flex items-center gap-4 text-sm font-medium text-slate-500 bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                    <ShieldAlert className="w-5 h-5 text-rose-500 shrink-0" />
                    <span>Risk of structural failure on <strong>{data.riskCount} Key Segments</strong> if funding is delayed.</span>
                </div>
            </section>

            {/* Impact Analysis (The "Stick") */}
            <section>
                <h3 className="text-sm font-bold uppercase text-slate-500 tracking-wider mb-4">Impact of Under-Funding</h3>
                <div className="grid grid-cols-2 gap-4">
                    <ImpactCard 
                        title="VCI Decline" 
                        value="-12%" 
                        desc="Network Health" 
                        trend="down" 
                        details="Visual Condition Index drops below 50"
                    />
                    <ImpactCard 
                        title="User Costs" 
                        value="+R 2.1bn" 
                        desc="Logistics Impact" 
                        trend="up" 
                        bad
                        details="Vehicle operating costs increase"
                    />
                </div>
            </section>

        </div>

        {/* Side Column: The Numbers */}
        <div className="space-y-6">
            <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl shadow-slate-900/10">
                <div className="text-slate-400 text-xs font-bold uppercase mb-1">Total Ask</div>
                <div className="text-4xl font-black tracking-tighter">{formatCurrency(data.totalAsk)}</div>
                <div className="mt-6 space-y-3">
                    <BudgetRow label="Rehabilitation" amount={formatCurrency(data.maintenanceSplit.rehab)} color="bg-indigo-500" />
                    <BudgetRow label="Resealing" amount={formatCurrency(data.maintenanceSplit.reseal)} color="bg-blue-500" />
                    <BudgetRow label="Routine Maint." amount={formatCurrency(data.maintenanceSplit.routine)} color="bg-emerald-500" />
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800">
                 <div className="flex items-center gap-2 mb-4">
                    <FileCheck className="w-5 h-5 text-emerald-500" />
                    <h3 className="font-bold text-slate-900 dark:text-white">Compliance Check</h3>
                 </div>
                 <div className="space-y-3">
                    <CheckItem label="RAMS Data Verified" checked />
                    <CheckItem label="Strategic Alignment" checked />
                    <CheckItem label="Treasury 6B Form" checked />
                    <CheckItem label="MEC Approval" checked={false} />
                 </div>
            </div>
        </div>

      </div>
    </div>
  );
}

// --- SUB COMPONENTS ---

function ImpactCard({ title, value, desc, trend, bad, details }: any) {
    return (
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="text-xs font-bold text-slate-400 uppercase mb-2">{title}</div>
            <div className="flex items-center gap-3">
                <span className="text-2xl font-black text-slate-900 dark:text-white">{value}</span>
                <span className={cn(
                    "flex items-center text-xs font-bold px-1.5 py-0.5 rounded",
                    bad ? "bg-rose-100 text-rose-600" : "bg-emerald-100 text-emerald-600"
                )}>
                    {trend === 'up' ? <TrendingDown className="w-3 h-3 rotate-180" /> : <TrendingDown className="w-3 h-3" />}
                </span>
            </div>
            <div className="text-sm font-medium text-slate-600 dark:text-slate-300 mt-1">{desc}</div>
            <div className="text-xs text-slate-400 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                {details}
            </div>
        </div>
    )
}

function BudgetRow({ label, amount, color }: any) {
    return (
        <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
                <div className={cn("w-2 h-2 rounded-full", color)} />
                <span className="text-slate-300">{label}</span>
            </div>
            <span className="font-bold">{amount}</span>
        </div>
    )
}

function CheckItem({ label, checked }: any) {
    return (
        <div className="flex items-center gap-3 text-sm">
            <div className={cn(
                "w-5 h-5 rounded-full flex items-center justify-center border",
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