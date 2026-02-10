"use client";

import React from "react";
import { Sparkles, BrainCircuit, AlertTriangle, CheckCircle2, TrendingUp, Loader2 } from "lucide-react";
// Import Type only
import type { AiAnalysis } from "../hooks/useAiAdvisor";

// 👇 Props now accept the state from the parent
type Props = {
    analysis: AiAnalysis | null;
    loading: boolean;
    error: string | null;
    onGenerate: () => void;
};

export function AiStrategyCard({ analysis, loading, error, onGenerate }: Props) {

  // 1. Initial State (Call to Action)
  if (!analysis && !loading) {
    return (
      <div className="mt-8 p-1 rounded-2xl bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-900 shadow-sm opacity-80 hover:opacity-100 transition-opacity">
        <div className="bg-white dark:bg-slate-950 rounded-xl p-8 text-center space-y-4">
          <div className="inline-flex p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-full mb-2">
             <Sparkles className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Unlock Strategic Insights
          </h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Ready to finalize your strategy? Ask the <strong>Mosianedi AI</strong> to synthesize your simulation results into a formal motivation.
          </p>
          
          {error && <div className="text-xs text-rose-500">{error}</div>}

          <button
            onClick={onGenerate}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold text-sm hover:scale-105 transition-transform flex items-center gap-2 mx-auto shadow-lg shadow-indigo-500/30"
          >
            <BrainCircuit className="w-4 h-4" />
            Generate Final Report
          </button>
        </div>
      </div>
    );
  }

  // 2. Loading State
  if (loading) {
    return (
      <div className="mt-8 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-[var(--surface-bg)] flex flex-col items-center justify-center text-center space-y-4 min-h-[300px]">
        <div className="relative">
            <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-20 animate-pulse rounded-full" />
            <Loader2 className="w-10 h-10 text-indigo-600 dark:text-indigo-400 animate-spin relative z-10" />
        </div>
        <div>
            <h3 className="text-lg font-semibold animate-pulse">Synthesizing Strategy...</h3>
            <p className="text-xs text-slate-500 mt-1">Analyzing graphs & financial liabilities</p>
        </div>
      </div>
    );
  }

  // 3. Result State (The Report)
  return (
    <div className="mt-8 rounded-2xl border border-indigo-100 dark:border-indigo-900/50 bg-indigo-50/50 dark:bg-indigo-950/10 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header */}
      <div className="bg-indigo-100/80 dark:bg-indigo-900/20 px-6 py-4 border-b border-indigo-200 dark:border-indigo-800 flex items-center justify-between">
         <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="font-bold text-indigo-900 dark:text-indigo-200">Strategic Executive Conclusion</h3>
         </div>
         <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-400 bg-white dark:bg-slate-900 px-2 py-1 rounded">
            AI Generated
         </span>
      </div>

      <div className="p-6 grid gap-6 md:grid-cols-2">
         {/* ... (Keep the rest of your display logic from previous step) ... */}
         <div className="space-y-6">
            <div>
                <h4 className="text-xs uppercase font-bold text-slate-500 mb-2">Executive Overview</h4>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                    {analysis?.executive_summary}
                </p>
            </div>
            {/* ... etc ... */}
             <div className="p-4 bg-rose-50 dark:bg-rose-900/10 rounded-xl border border-rose-100 dark:border-rose-800/30">
                <h4 className="text-xs uppercase font-bold text-rose-600 dark:text-rose-400 mb-2 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Risk Analysis
                </h4>
                <p className="text-xs text-rose-800 dark:text-rose-200 leading-relaxed">
                    {analysis?.risk_analysis}
                </p>
            </div>
         </div>

         <div className="space-y-6">
            <div>
                <h4 className="text-xs uppercase font-bold text-slate-500 mb-2">Recommended Actions</h4>
                <ul className="space-y-2">
                    {analysis?.recommended_action.map((action, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 shadow-sm">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                            {action}
                        </li>
                    ))}
                </ul>
            </div>
             <div>
                 <h4 className="text-xs uppercase font-bold text-slate-500 mb-2 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> Economic Context
                 </h4>
                 <p className="text-xs text-slate-500 italic">
                    "{analysis?.economic_impact}"
                 </p>
            </div>
         </div>
      </div>
    </div>
  );
}