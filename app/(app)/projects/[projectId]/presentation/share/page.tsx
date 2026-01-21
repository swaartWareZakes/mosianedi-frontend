"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { 
  TrendingDown, 
  CheckCircle2, 
  MapPin, 
  Users, 
  School, 
  Tractor,
  Share2,
  Download
} from "lucide-react";
import { useNetworkSnapshot } from "../../config/hooks/useNetworkSnapshot";
import { useSimulationResults } from "../../dashboard/hooks/useSimulationResults";

// Helper for currency formatting
const formatMoney = (val: number) => 
  val >= 1e9 ? `R${(val/1e9).toFixed(1)}bn` : `R${(val/1e6).toFixed(0)}m`;

export default function TreasurySharePage() {
  const params = useParams();
  const projectId = Array.isArray(params?.projectId) ? params?.projectId[0] : params?.projectId;
  const { data: snapshot } = useNetworkSnapshot(projectId || "");
  const { results } = useSimulationResults(projectId || "");

  // Mock Social Impact Data
  const socialImpact = {
    schoolsAccessible: 142,
    clinicsConnected: 18,
    agriJobsSupported: "12,500",
    ruralAccessIndex: "Improved by 45%"
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100">
      
      {/* 1. TOP BAR */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-8 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-4">
            <div className="h-10 w-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">M</div>
            <div>
                {/* 🔴 FIX: Cast to any to avoid TS error until types are updated */}
                <h1 className="text-lg font-bold leading-tight">{(snapshot as any)?.project_name || "Provincial Strategy"}</h1>
                <p className="text-xs text-slate-500 uppercase tracking-wider">Treasury Motivation • FY2026/27</p>
            </div>
        </div>
        <div className="flex gap-3">
             <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition">
                <Download className="w-4 h-4"/> Download PDF
             </button>
             <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition shadow-lg shadow-indigo-500/20">
                <Share2 className="w-4 h-4"/> Share Link
             </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-8 space-y-12">

        {/* 2. EXECUTIVE SUMMARY CARD */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl">
            <div className="flex flex-col md:flex-row gap-12 items-center">
                <div className="flex-1 space-y-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 text-xs font-bold uppercase tracking-wider">
                        <TrendingDown className="w-3 h-3" /> Critical Intervention Required
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
                        Preventing <span className="text-indigo-600">Network Failure</span> in Key Rural Corridors.
                    </h2>
                    <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                        Without the requested <strong>{formatMoney(results?.total_cost_npv || 0)}</strong> allocation, critical access routes in {(snapshot as any)?.province || "the region"} will degrade to gravel standards within 3 years, severing access to markets and essential services.
                    </p>
                </div>
                <div className="w-full md:w-80 bg-slate-50 dark:bg-slate-950 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 text-center">
                    <div className="text-sm text-slate-500 font-bold uppercase tracking-widest mb-2">Budget Ask</div>
                    <div className="text-5xl font-black text-slate-900 dark:text-white mb-2">
                        {formatMoney(results?.total_cost_npv || 0)}
                    </div>
                    <div className="text-xs text-slate-400">Preventive Maintenance (PM)</div>
                    <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-4">
                         <div>
                             <div className="text-2xl font-bold text-emerald-500">40%</div>
                             <div className="text-[10px] text-slate-400 uppercase">Cost Saving</div>
                         </div>
                         <div>
                             <div className="text-2xl font-bold text-indigo-500">{(snapshot?.totalLengthKm || 0).toFixed(0)}km</div>
                             <div className="text-[10px] text-slate-400 uppercase">Network Secured</div>
                         </div>
                    </div>
                </div>
            </div>
        </section>

        {/* 3. SOCIAL IMPACT */}
        <section>
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-500"/> Social & Economic Impact
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <ImpactCard icon={<School className="w-6 h-6 text-blue-500"/>} value={socialImpact.schoolsAccessible} label="Schools Connected" />
                <ImpactCard icon={<ActivityIcon className="w-6 h-6 text-rose-500"/>} value={socialImpact.clinicsConnected} label="Clinics Accessible" />
                <ImpactCard icon={<Tractor className="w-6 h-6 text-emerald-500"/>} value={socialImpact.agriJobsSupported} label="Agri-Jobs Supported" />
                <ImpactCard icon={<MapPin className="w-6 h-6 text-amber-500"/>} value="High" label="Rural Access Index" />
            </div>
        </section>

        {/* 4. TECHNICAL BREAKDOWN */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                <h4 className="font-bold mb-4">Condition Forecast (5-Year)</h4>
                <div className="h-64 flex items-end justify-between gap-2 px-4 border-b border-slate-200 dark:border-slate-700 pb-0">
                     {[65, 62, 58, 54, 48].map((val, i) => (
                         <div key={i} className="w-full bg-rose-100 dark:bg-rose-900/20 rounded-t-lg relative group">
                             <div style={{ height: `${val}%` }} className="absolute bottom-0 w-full bg-rose-500 rounded-t-lg opacity-80 group-hover:opacity-100 transition-all"></div>
                             <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-slate-400">{'2' + (5+i)}</span>
                         </div>
                     ))}
                </div>
                <div className="mt-4 text-center text-xs text-slate-500">
                    <span className="inline-block w-3 h-3 bg-rose-500 rounded-sm mr-2"/>
                    Deterioration Trend (Do Nothing Scenario)
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                <h4 className="font-bold mb-4">Strategic Alignment</h4>
                <ul className="space-y-4">
                    <CheckItem text="Aligns with National Development Plan (NDP 2030) Goals." />
                    <CheckItem text="Prioritizes Scholar Transport Routes." />
                    <CheckItem text="Supports Provincial Agriculture Logistics Corridor." />
                    <CheckItem text="Optimizes Grant Spending (PRMG) Efficiency." />
                </ul>
            </div>
        </section>

      </main>
    </div>
  );
}

// --- SUB-COMPONENTS ---
function ImpactCard({ icon, value, label }: any) {
    return (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col items-center text-center hover:border-indigo-500/50 transition-colors">
            <div className="mb-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-full">{icon}</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">{value}</div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mt-1">{label}</div>
        </div>
    )
}

function CheckItem({ text }: { text: string }) {
    return (
        <li className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <span className="text-sm text-slate-600 dark:text-slate-300">{text}</span>
        </li>
    )
}

function ActivityIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
        </svg>
    )
}