"use client";

import React, { useEffect, useState } from "react";
import { 
  Wallet, 
  TrendingUp, 
  AlertCircle, 
  PieChart as PieIcon, 
  Download,
  Calendar,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabaseClient";

export default function BudgetSummaryPage() {
  const [loading, setLoading] = useState(true);
  const [yearlyData, setYearlyData] = useState<any[]>([]);
  const [totalCost, setTotalCost] = useState(0);
  const [projectInfo, setProjectInfo] = useState<{name: string, province: string} | null>(null);

  useEffect(() => {
    async function fetchEngineeringData() {
        setLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            // 1. Get Project
            const { data: projects } = await supabase
                .from("projects")
                .select("id, project_name, province")
                .order("updated_at", { ascending: false })
                .limit(1)
                .single();
            
            if (!projects) { setLoading(false); return; }
            setProjectInfo({ name: projects.project_name, province: projects.province });

            // 2. Get Simulation
            const { data: sim } = await supabase
                .from("simulation_results")
                .select("results_payload")
                .eq("project_id", projects.id)
                .order("run_at", { ascending: false })
                .limit(1)
                .single();

            if (sim?.results_payload) {
                setYearlyData(sim.results_payload.yearly_data || []);
                setTotalCost(sim.results_payload.total_cost_npv || 0);
            }

        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }
    fetchEngineeringData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR', notation: "compact" }).format(amount);
  };

  if (loading) return (
      <div className="h-full flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500"/>
      </div>
  );

  return (
    <div className="p-8 pb-20 max-w-7xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Engineering Programme</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            {projectInfo ? `${projectInfo.province}: ${projectInfo.name}` : "Detailed Cost Schedule"}
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold rounded-lg hover:opacity-90 transition-opacity">
          <Download className="w-4 h-4" />
          Export Schedule
        </button>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Wallet className="w-5 h-5" /></div>
            <span className="text-xs font-bold uppercase text-slate-500">Program Total (NPV)</span>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">{formatCurrency(totalCost)}</div>
          <div className="text-sm text-slate-500 mt-1">{yearlyData.length} Year Horizon</div>
        </div>

        <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><TrendingUp className="w-5 h-5" /></div>
            <span className="text-xs font-bold uppercase text-slate-500">Target Condition</span>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            VCI {yearlyData.length > 0 ? yearlyData[yearlyData.length-1].avg_condition_index.toFixed(0) : "0"}
          </div>
          <div className="text-sm text-emerald-600 mt-1 font-medium">Sustainable Level</div>
        </div>

        <div className="p-6 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-200 dark:border-amber-800 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-100 text-amber-600 rounded-lg"><Calendar className="w-5 h-5" /></div>
            <span className="text-xs font-bold uppercase text-amber-700 dark:text-amber-400">Peak Funding Year</span>
          </div>
          <div className="text-3xl font-black text-amber-600 dark:text-amber-400">2027</div>
          <div className="text-sm text-amber-600/80 mt-1">Critical Rehab Phase</div>
        </div>
      </div>

      {/* Yearly Breakdown Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-slate-400" />
                Annual Expenditure Schedule
            </h3>
        </div>
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs uppercase font-bold text-slate-500">
            <tr>
              <th className="px-6 py-4">Financial Year</th>
              <th className="px-6 py-4">Network Condition (VCI)</th>
              <th className="px-6 py-4">Good / Fair / Poor (%)</th>
              <th className="px-6 py-4 text-right">Required Budget</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {yearlyData.map((year: any) => (
                <tr key={year.year} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">FY {year.year}/{year.year+1}</td>
                  <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-500" style={{ width: `${year.avg_condition_index}%` }} />
                          </div>
                          <span className="font-mono text-slate-600 dark:text-slate-300">{year.avg_condition_index.toFixed(1)}</span>
                      </div>
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-xs">
                      <span className="text-emerald-600 font-bold">{year.pct_good.toFixed(0)}%</span> / 
                      <span className="text-amber-600 font-bold"> {year.pct_fair.toFixed(0)}%</span> / 
                      <span className="text-rose-600 font-bold"> {year.pct_poor.toFixed(0)}%</span>
                  </td>
                  <td className="px-6 py-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                      {formatCurrency(year.total_maintenance_cost)}
                  </td>
                </tr>
            ))}
            {yearlyData.length === 0 && (
                <tr>
                    <td colSpan={4} className="p-8 text-center text-slate-400">No schedule generated.</td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}