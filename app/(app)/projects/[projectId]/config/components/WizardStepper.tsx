"use client";

import React from "react";
import { Check, Circle, Database, Activity, TrendingUp, Play } from "lucide-react";
import { cn } from "@/lib/utils";

type Step = {
  id: number;
  label: string;
  desc: string;
  icon: React.ReactNode;
};

const STEPS: Step[] = [
  { id: 1, label: "Data Inputs", desc: "Inventory & traffic", icon: <Database className="w-4 h-4"/> },
  { id: 2, label: "Network Profile", desc: "Asset valuation", icon: <Activity className="w-4 h-4"/> },
  { id: 3, label: "Forecast Strategy", desc: "Economic variables", icon: <TrendingUp className="w-4 h-4"/> },
  { id: 4, label: "Simulation", desc: "Run analysis", icon: <Play className="w-4 h-4"/> },
];

export function WizardStepper({ currentStep, onJump }: { currentStep: number, onJump: (step: number) => void }) {
  return (
    <div className="w-full py-8 pr-8 flex flex-col gap-6 sticky top-0">
      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">Configuration</div>
      
      <div className="relative flex flex-col gap-0">
        {/* Vertical Line Background */}
        <div className="absolute left-4 top-4 bottom-4 w-px bg-slate-200 dark:bg-slate-800 -z-10" />

        {STEPS.map((step) => {
          const isCompleted = currentStep > step.id;
          const isActive = currentStep === step.id;

          return (
            <button
              key={step.id}
              onClick={() => onJump(step.id)}
              // Allow jumping back, or jumping forward if we've already been there (simple heuristic)
              disabled={!isCompleted && !isActive && step.id !== currentStep + 1} 
              className={cn(
                "group flex items-start gap-4 py-3 text-left transition-all relative",
                isActive ? "opacity-100" : "opacity-60 hover:opacity-90"
              )}
            >
              {/* Dot / Indicator */}
              <div 
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center border-2 shrink-0 transition-all duration-300 z-10 bg-[var(--background)]",
                  isActive 
                    ? "border-indigo-600 text-indigo-600 shadow-md shadow-indigo-500/20 scale-110" 
                    : isCompleted 
                    ? "border-indigo-600 bg-indigo-600 text-white" 
                    : "border-slate-300 dark:border-slate-700 text-slate-400"
                )}
              >
                {isCompleted ? <Check className="w-4 h-4" /> : step.icon}
              </div>

              {/* Text */}
              <div className="pt-1">
                <div className={cn("text-sm font-bold transition-colors", isActive ? "text-indigo-600" : "text-slate-700 dark:text-slate-300")}>
                  {step.label}
                </div>
                <div className="text-[11px] text-slate-500 font-medium">
                    {step.desc}
                </div>
              </div>

              {/* Active Indicator Bar on Right (Optional flair) */}
              {isActive && (
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-indigo-600 rounded-l-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}