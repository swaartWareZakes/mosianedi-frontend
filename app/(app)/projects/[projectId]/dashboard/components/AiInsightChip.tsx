"use client";

import React from "react";
import { Sparkles } from "lucide-react";

export function AiInsightChip({ text, loading }: { text?: string; loading: boolean }) {
  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-full animate-pulse">
        <div className="w-3 h-3 bg-slate-300 dark:bg-slate-600 rounded-full" />
        <div className="w-32 h-2 bg-slate-300 dark:bg-slate-600 rounded" />
      </div>
    );
  }

  if (!text) return null;

  return (
    <div className="group relative flex items-center gap-2 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-full cursor-help transition-all hover:bg-indigo-100 dark:hover:bg-indigo-900/40">
      <Sparkles className="w-3 h-3 text-indigo-600 dark:text-indigo-400 animate-pulse" />
      <span className="text-[10px] font-semibold text-indigo-700 dark:text-indigo-300 uppercase tracking-wide">
        AI Insight
      </span>
      
      {/* Tooltip Popup */}
      <div className="absolute bottom-full left-0 mb-2 w-64 p-3 bg-slate-900 text-white text-xs rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none">
        <div className="relative z-10 font-medium leading-relaxed">
            "{text}"
        </div>
        {/* Little triangle arrow */}
        <div className="absolute -bottom-1 left-4 w-2 h-2 bg-slate-900 rotate-45" />
      </div>
    </div>
  );
}