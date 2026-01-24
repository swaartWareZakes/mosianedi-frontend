"use client";

import React from "react";
import { 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Briefcase, 
  Landmark, 
  ArrowRight 
} from "lucide-react";
import type { AiInsight } from "../hooks/useAdvisor";

export function InsightDisplay({ insight }: { insight: AiInsight }) {
  const { content, simulation_summary } = insight;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in duration-500">
      
      {/* HEADER BANNER */}
      <div className="bg-indigo-600 p-8 text-white">
        <div className="flex items-center gap-2 text-indigo-200 text-xs font-bold uppercase tracking-widest mb-3">
            <SparklesIcon /> AI Strategic Assessment
        </div>
        <h1 className="text-3xl font-bold leading-tight max-w-2xl">
            {content.headline || "Strategic Infrastructure Review"}
        </h1>
        {simulation_summary && (
             <div className="mt-6 inline-flex items-center gap-4 bg-indigo-500/30 border border-indigo-400/30 rounded-lg px-4 py-2 text-sm">
                <span className="font-medium text-indigo-100">Analysis Base:</span>
                <span className="font-bold">{simulation_summary.run_name}</span>
                <span className="opacity-50">|</span>
                <span className="font-bold">{simulation_summary.total_cost}</span>
             </div>
        )}
      </div>

      <div className="p-8 space-y-10">
        
        {/* EXECUTIVE SUMMARY */}
        <section>
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Briefcase className="w-4 h-4" /> Executive Summary
            </h3>
            <p className="text-lg text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                {content.executive_summary}
            </p>
        </section>

        <div className="grid md:grid-cols-2 gap-8">
            {/* FISCAL IMPLICATIONS (RISK) */}
            <div className="bg-rose-50 dark:bg-rose-900/10 p-6 rounded-2xl border border-rose-100 dark:border-rose-800/30">
                <h3 className="text-rose-700 dark:text-rose-400 font-bold flex items-center gap-2 mb-4">
                    <AlertTriangle className="w-5 h-5" /> Fiscal Liabilities
                </h3>
                <div className="space-y-4">
                    <div>
                        <div className="text-xs text-rose-600/70 uppercase font-bold mb-1">Backlog Growth</div>
                        <p className="text-sm text-slate-700 dark:text-slate-300">{content.fiscal_implications?.liability_growth}</p>
                    </div>
                    <div>
                        <div className="text-xs text-rose-600/70 uppercase font-bold mb-1">Economic Risk</div>
                        <p className="text-sm text-slate-700 dark:text-slate-300">{content.fiscal_implications?.economic_risk}</p>
                    </div>
                </div>
            </div>

            {/* ENGINEERING REALITY */}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
                <h3 className="text-slate-700 dark:text-slate-200 font-bold flex items-center gap-2 mb-4">
                    <TrendingUp className="w-5 h-5 text-indigo-500" /> Engineering Reality
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {content.engineering_reality}
                </p>
            </div>
        </div>

        {/* RECOMMENDATION */}
        <section className="border-t border-slate-100 dark:border-slate-800 pt-8">
             <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Landmark className="w-4 h-4" /> Strategic Recommendation
            </h3>
            <div className="flex items-start gap-4">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-full text-emerald-600 shrink-0 mt-1">
                    <CheckCircle2 className="w-5 h-5" />
                </div>
                <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed">
                    {content.recommendation}
                </p>
            </div>
        </section>

      </div>
    </div>
  );
}

function SparklesIcon() {
    return (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 3.214L13 21l-2.286-6.857L5 12l5.714-3.214z" />
        </svg>
    )
}