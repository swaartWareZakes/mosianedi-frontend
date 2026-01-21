"use client";

import React, { useState } from "react";
import { 
  Send, 
  FileCheck, 
  ArrowRight, 
  TrendingDown, 
  ShieldAlert,
  Building,
  Check
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function TreasuryViewPage() {
  const [sent, setSent] = useState(false);

  // Mock function to simulate sending
  const handleSend = () => {
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  };

  return (
    <div className="p-8 pb-32 max-w-5xl mx-auto">
      
      {/* 1. Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm mb-2">
            <Building className="w-4 h-4" />
            NATIONAL TREASURY SUBMISSION
          </div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Infrastructure Grant Request</h1>
          <p className="text-lg text-slate-500 mt-2">FY 2026/27 • Provincial Roads Maintenance Grant (PRMG)</p>
        </div>

        <div className="flex items-center gap-3">
            <div className="text-right hidden md:block mr-4">
                <div className="text-xs font-bold uppercase text-slate-400">Status</div>
                <div className="text-sm font-bold text-amber-500">Draft - Reviewing</div>
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
                    The requested funding of <strong>ZAR 4.5bn</strong> is critical to arrest the deterioration of the secondary road network. 
                    Without this intervention, 34% of the paved network will degrade from "Fair" to "Poor" condition within 18 months, 
                    resulting in a <strong>ZAR 12bn liability increase</strong> in rehabilitation costs by 2028.
                </p>
                
                <div className="mt-6 flex items-center gap-4 text-sm font-medium text-slate-500 bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                    <ShieldAlert className="w-5 h-5 text-rose-500 shrink-0" />
                    <span>Risk of catastrophic structural failure on Key Route R-501 if funding is delayed.</span>
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
                <div className="text-4xl font-black tracking-tighter">R 4.5bn</div>
                <div className="mt-6 space-y-3">
                    <BudgetRow label="Rehabilitation" amount="R 2.1bn" color="bg-indigo-500" />
                    <BudgetRow label="Resealing" amount="R 1.2bn" color="bg-blue-500" />
                    <BudgetRow label="Routine Maint." amount="R 0.8bn" color="bg-emerald-500" />
                    <BudgetRow label="Emergency" amount="R 0.4bn" color="bg-rose-500" />
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