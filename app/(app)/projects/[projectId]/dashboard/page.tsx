"use client";

import React, { useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { 
  LayoutDashboard, ArrowLeft, TrendingUp, AlertTriangle, 
  Calendar, Layers, Download, CheckCircle2 
} from "lucide-react";

import { useSimulationResults } from "./hooks/useSimulationResults";
import { useProjectMeta } from "../config/hooks/useProjectMeta";

// Helper for currency formatting
function fmtCurrency(val: number) {
  if (val >= 1_000_000_000) return `R ${(val / 1_000_000_000).toFixed(1)}bn`;
  if (val >= 1_000_000) return `R ${(val / 1_000_000).toFixed(1)}m`;
  return `R ${val.toLocaleString()}`;
}

export default function ProjectDashboardPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  
  const { data: project } = useProjectMeta(projectId);
  const { results, loading } = useSimulationResults(projectId);

  // --- NARRATIVE GENERATOR ---
  const narrative = useMemo(() => {
    if (!results) return null;
    
    const finalVci = results.final_network_condition;
    const initialVci = results.yearly_data[0]?.avg_condition_index || 0;
    const improvement = finalVci - initialVci;
    const costBn = (results.total_cost_npv / 1_000_000_000).toFixed(1);
    
    // Determine tone based on outcome
    if (finalVci < 40) {
        return {
            title: "Critical Intervention Required",
            tone: "text-rose-700 dark:text-rose-300",
            bg: "bg-rose-50 dark:bg-rose-900/10 border-rose-100 dark:border-rose-800",
            text: `Without immediate funding, the network will collapse to a VCI of ${finalVci.toFixed(1)}. The proposed budget of R ${costBn}bn is insufficient to arrest the decline.`
        };
    } else if (improvement > 2) {
        return {
            title: "Strategy for Improvement",
            tone: "text-emerald-700 dark:text-emerald-300",
            bg: "bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-800",
            text: `This investment of R ${costBn}bn successfully improves the network condition from ${initialVci.toFixed(1)} to ${finalVci.toFixed(1)}. This strategy prioritizes asset value growth.`
        };
    } else {
        return {
            title: "Holding Action Strategy",
            tone: "text-indigo-700 dark:text-indigo-300",
            bg: "bg-indigo-50 dark:bg-indigo-900/10 border-indigo-100 dark:border-indigo-800",
            text: `This proposal of R ${costBn}bn is required simply to maintain the status quo. It offsets inflationary pressures (6%) and keeps the VCI stable at ${finalVci.toFixed(1)}.`
        };
    }
  }, [results]);

  if (loading) {
    return (
        <div className="flex h-64 items-center justify-center">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );
  }

  if (!results) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
        <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full">
            <LayoutDashboard className="w-8 h-8 text-slate-400" />
        </div>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">No Strategy Generated</h2>
        <p className="text-slate-500 max-w-md">
          You haven't run a simulation for this project yet. Go to the Configuration page to generate your proposal first.
        </p>
        <Link 
            href={`/projects/${projectId}/config`}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
        >
            Go to Configuration
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      
      {/* HEADER */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
            <Link 
                href={`/projects/${projectId}/config`}
                className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-indigo-600 mb-2 transition-colors"
            >
                <ArrowLeft className="w-3 h-3" /> Back to Inputs
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100">
                {project?.project_name || "Project"} Strategy
            </h1>
            <p className="text-sm text-slate-500 flex items-center gap-2 mt-1">
                <Calendar className="w-3 h-3" />
                {results.year_count}-Year Forecast ({results.yearly_data[0].year} - {results.yearly_data[results.yearly_data.length-1].year})
            </p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
            <Download className="w-4 h-4" />
            Export Report
        </button>
      </header>

      {/* ACT 1: KEY METRICS */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
         {/* Card 1: Cost */}
         <div className="p-6 bg-[var(--surface-bg)] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <TrendingUp className="w-16 h-16" />
            </div>
            <p className="text-xs uppercase font-bold text-slate-400 tracking-wider">Total Ask (NPV)</p>
            <p className="text-3xl font-black text-slate-900 dark:text-slate-100 mt-2">
                {fmtCurrency(results.total_cost_npv)}
            </p>
            <p className="text-xs text-slate-500 mt-1">
                Required over {results.year_count} years
            </p>
         </div>

         {/* Card 2: Condition */}
         <div className="p-6 bg-[var(--surface-bg)] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <p className="text-xs uppercase font-bold text-slate-400 tracking-wider">Terminal VCI</p>
            <div className="flex items-end gap-2 mt-2">
                <p className="text-3xl font-black text-slate-900 dark:text-slate-100">
                    {results.final_network_condition.toFixed(1)}
                </p>
                <span className="text-sm text-slate-400 mb-1">/ 100</span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full mt-3 overflow-hidden">
                <div 
                    className={`h-full ${results.final_network_condition < 50 ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                    style={{ width: `${results.final_network_condition}%` }}
                />
            </div>
         </div>

         {/* Card 3: Status */}
         <div className={`p-6 rounded-xl border shadow-sm flex flex-col justify-center ${narrative?.bg}`}>
            <div className="flex items-center gap-2 mb-2">
                {results.final_network_condition < 50 ? 
                    <AlertTriangle className="w-5 h-5 text-amber-600" /> : 
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                }
                <span className={`font-bold text-sm ${narrative?.tone}`}>{narrative?.title}</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-snug">
                {narrative?.text}
            </p>
         </div>
      </section>

      {/* ACT 2: VISUALIZATION (Simple CSS Charts for now) */}
      <section className="grid lg:grid-cols-2 gap-8">
         
         {/* CHART 1: Condition Forecast */}
         <div className="bg-[var(--surface-bg)] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-500" />
                Network Condition Forecast
            </h3>
            
            <div className="h-64 flex items-end gap-2">
                {results.yearly_data.map((year, i) => (
                    <div key={year.year} className="flex-1 flex flex-col items-center gap-2 group">
                        <div className="relative w-full flex justify-center items-end h-full">
                            {/* Bar */}
                            <div 
                                className={`w-full max-w-[40px] rounded-t-sm transition-all group-hover:opacity-80 ${year.avg_condition_index < 50 ? 'bg-amber-400' : 'bg-emerald-400'}`}
                                style={{ height: `${year.avg_condition_index}%` }}
                            >
                                {/* Tooltip */}
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                    VCI: {year.avg_condition_index}
                                </div>
                            </div>
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium rotate-0">
                            {year.year}
                        </span>
                    </div>
                ))}
            </div>
         </div>

         {/* CHART 2: Budget Breakdown */}
         <div className="bg-[var(--surface-bg)] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-500" />
                Annual Budget Requirement
            </h3>
            
            <div className="h-64 flex items-end gap-2">
                {results.yearly_data.map((year, i) => {
                    // Normalize height for visualization (max height = biggest budget)
                    const maxBudget = Math.max(...results.yearly_data.map(y => y.total_maintenance_cost));
                    const heightPct = (year.total_maintenance_cost / maxBudget) * 100;

                    return (
                        <div key={year.year} className="flex-1 flex flex-col items-center gap-2 group">
                            <div className="relative w-full flex justify-center items-end h-full">
                                <div 
                                    className="w-full max-w-[40px] bg-indigo-500 rounded-t-sm transition-all group-hover:bg-indigo-400"
                                    style={{ height: `${heightPct}%` }}
                                >
                                     <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                        {fmtCurrency(year.total_maintenance_cost)}
                                    </div>
                                </div>
                            </div>
                            <span className="text-[10px] text-slate-400 font-medium">
                                {year.year}
                            </span>
                        </div>
                    );
                })}
            </div>
         </div>
      </section>

      {/* ACT 3: Detailed Data Table */}
      <section className="bg-[var(--surface-bg)] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
         <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                Yearly Breakdown
            </h3>
         </div>
         <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 font-medium">
                    <tr>
                        <th className="px-6 py-3">Financial Year</th>
                        <th className="px-6 py-3">Avg VCI</th>
                        <th className="px-6 py-3">Condition (Good/Fair/Poor)</th>
                        <th className="px-6 py-3 text-right">Budget Required</th>
                        <th className="px-6 py-3 text-right">Asset Value</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {results.yearly_data.map((row) => (
                        <tr key={row.year} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            <td className="px-6 py-3 font-medium text-slate-900 dark:text-slate-100">{row.year}</td>
                            <td className="px-6 py-3">
                                <span className={`px-2 py-1 rounded text-xs font-bold ${row.avg_condition_index < 50 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                    {row.avg_condition_index.toFixed(1)}
                                </span>
                            </td>
                            <td className="px-6 py-3 text-xs text-slate-500">
                                {row.pct_good}% / {row.pct_fair}% / {row.pct_poor}%
                            </td>
                            <td className="px-6 py-3 text-right font-mono">
                                {fmtCurrency(row.total_maintenance_cost)}
                            </td>
                            <td className="px-6 py-3 text-right font-mono text-slate-400">
                                {fmtCurrency(row.asset_value)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
         </div>
      </section>

    </div>
  );
}