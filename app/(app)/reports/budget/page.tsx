"use client";

import React from "react";
import { 
  Wallet, 
  TrendingUp, 
  AlertCircle, 
  ArrowUpRight, 
  PieChart as PieIcon,
  Download
} from "lucide-react";
import { cn } from "@/lib/utils";

// Mock Data (Replace with Supabase Aggregation later)
const BUDGET_STATS = {
  totalRequested: 4500000000, // 4.5B
  totalAvailable: 3200000000, // 3.2B
  gap: 1300000000,
  riskLevel: "High"
};

const PROVINCIAL_BREAKDOWN = [
  { name: "Gauteng", requested: 1200, allocated: 1200, status: "funded" },
  { name: "Western Cape", requested: 950, allocated: 800, status: "partial" },
  { name: "KwaZulu-Natal", requested: 1100, allocated: 600, status: "risk" },
  { name: "Eastern Cape", requested: 850, allocated: 400, status: "risk" },
  { name: "Limpopo", requested: 400, allocated: 200, status: "risk" },
];

export default function BudgetSummaryPage() {
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR', notation: "compact" }).format(amount);
  };

  return (
    <div className="p-8 pb-20 max-w-7xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">National Budget Summary</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Consolidated view of all provincial funding requests for FY 2026/27.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold rounded-lg hover:opacity-90 transition-opacity">
          <Download className="w-4 h-4" />
          Export Excel
        </button>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Wallet className="w-5 h-5" /></div>
            <span className="text-xs font-bold uppercase text-slate-500">Total Requested</span>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">{formatCurrency(BUDGET_STATS.totalRequested)}</div>
          <div className="text-sm text-slate-500 mt-1">Across 9 Provinces</div>
        </div>

        <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><TrendingUp className="w-5 h-5" /></div>
            <span className="text-xs font-bold uppercase text-slate-500">Treasury Allocation</span>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">{formatCurrency(BUDGET_STATS.totalAvailable)}</div>
          <div className="text-sm text-emerald-600 mt-1 font-medium">Confirmed Ceiling</div>
        </div>

        <div className="p-6 bg-rose-50 dark:bg-rose-900/10 rounded-2xl border border-rose-200 dark:border-rose-800 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-rose-100 text-rose-600 rounded-lg"><AlertCircle className="w-5 h-5" /></div>
            <span className="text-xs font-bold uppercase text-rose-700 dark:text-rose-400">Funding Gap</span>
          </div>
          <div className="text-3xl font-black text-rose-600 dark:text-rose-400">{formatCurrency(BUDGET_STATS.gap)}</div>
          <div className="text-sm text-rose-600/80 mt-1">High Risk to Network Integrity</div>
        </div>
      </div>

      {/* Provincial Breakdown Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-slate-400" />
                Allocation Efficiency
            </h3>
        </div>
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs uppercase font-bold text-slate-500">
            <tr>
              <th className="px-6 py-4">Province</th>
              <th className="px-6 py-4">Ask (ZAR m)</th>
              <th className="px-6 py-4">Allocation (ZAR m)</th>
              <th className="px-6 py-4">Gap</th>
              <th className="px-6 py-4">Impact Risk</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {PROVINCIAL_BREAKDOWN.map((prov) => {
               const gap = prov.requested - prov.allocated;
               const percent = Math.round((prov.allocated / prov.requested) * 100);
               return (
                <tr key={prov.name} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{prov.name}</td>
                  <td className="px-6 py-4 text-slate-500">{prov.requested}</td>
                  <td className="px-6 py-4 text-slate-900 dark:text-white font-medium">{prov.allocated}</td>
                  <td className="px-6 py-4 text-rose-500 font-medium">-{gap} ({percent}%)</td>
                  <td className="px-6 py-4">
                    <span className={cn(
                        "px-2 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider",
                        prov.status === 'funded' ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" :
                        prov.status === 'partial' ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
                        "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                    )}>
                        {prov.status === 'funded' ? 'Low Risk' : prov.status === 'partial' ? 'Moderate' : 'Critical Failure'}
                    </span>
                  </td>
                </tr>
               )
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}