"use client";

import React from "react";
import Link from "next/link";
import {
  Check,
  Database,
  Activity,
  TrendingUp,
  Play,
  ShieldAlert,
  PlusCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Step = {
  id: number;
  label: string;
  desc: string;
  icon: React.ReactNode;
};

const STEPS: Step[] = [
  { id: 1, label: "Data Inputs", desc: "Inventory & traffic", icon: <Database className="w-4 h-4" /> },
  { id: 2, label: "Network Profile", desc: "Asset valuation", icon: <Activity className="w-4 h-4" /> },
  { id: 3, label: "Forecast Strategy", desc: "Economic variables", icon: <TrendingUp className="w-4 h-4" /> },
  { id: 4, label: "Simulation", desc: "Run analysis", icon: <Play className="w-4 h-4" /> },
];

interface WizardStepperProps {
  currentStep: number;
  onJump: (step: number) => void;
  isUnauthorized?: boolean;
}

/** Theme-stable utility tokens (no dark:*, no slate-*) */
const TEXT = "text-[var(--foreground)]";
const TEXT_MUTED = "text-[color:color-mix(in_oklab,var(--foreground)_60%,transparent)]";
const TEXT_SOFT = "text-[color:color-mix(in_oklab,var(--foreground)_45%,transparent)]";
const BORDER = "border-[color:color-mix(in_oklab,var(--foreground)_14%,transparent)]";
const BORDER_SOFT = "border-[color:color-mix(in_oklab,var(--foreground)_10%,transparent)]";
const BG_WASH = "bg-[color:color-mix(in_oklab,var(--foreground)_6%,transparent)]";

export function WizardStepper({ currentStep, onJump, isUnauthorized }: WizardStepperProps) {
  // --- UNAUTHORIZED BLOCKING STATE ---
  if (isUnauthorized) {
    return (
      <div className="w-full py-8 pr-6 flex flex-col gap-6 sticky top-0 animate-in fade-in duration-500">
        <div className="text-[10px] font-black uppercase tracking-widest mb-2 px-2 flex items-center gap-2 text-rose-500">
          <ShieldAlert className="w-3 h-3" /> Restricted Access
        </div>

        <div
          className={cn(
            "rounded-2xl p-5 space-y-4 border",
            "bg-[color:color-mix(in_oklab,crimson_10%,transparent)]",
            "border-[color:color-mix(in_oklab,crimson_20%,transparent)]"
          )}
        >
          <p className={cn("text-xs font-bold leading-relaxed", TEXT)}>
            You are not a collaborator on this project.
          </p>

          <p className={cn("text-[11px] leading-relaxed", TEXT_MUTED)}>
            To view this data, ask the owner for access or initialize your own environment.
          </p>

          <Link
            href="/projects/new"
            className="flex items-center justify-center gap-2 w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[11px] font-black uppercase tracking-wider transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
          >
            <PlusCircle className="w-3.5 h-3.5" /> Create Project
          </Link>
        </div>
      </div>
    );
  }

  // --- STANDARD STEPPER STATE ---
  return (
    <div className="w-full py-8 pr-8 flex flex-col gap-6 sticky top-0">
      <div className={cn("text-xs font-bold uppercase tracking-wider mb-2 px-2", TEXT_SOFT)}>
        Configuration
      </div>

      <div className="relative flex flex-col gap-0">
        {/* Vertical rail */}
        <div
          className={cn(
            "absolute left-4 top-4 bottom-4 w-px -z-10",
            "bg-[color:color-mix(in_oklab,var(--foreground)_18%,transparent)]"
          )}
        />

        {STEPS.map((step) => {
          const isCompleted = currentStep > step.id;
          const isActive = currentStep === step.id;

          const isDisabled = !isCompleted && !isActive && step.id !== currentStep + 1;

          return (
            <button
              key={step.id}
              onClick={() => onJump(step.id)}
              disabled={isDisabled}
              className={cn(
                "group flex items-start gap-4 py-3 text-left transition-all relative",
                isActive ? "opacity-100" : "opacity-70 hover:opacity-95",
                isDisabled && "cursor-not-allowed hover:opacity-70"
              )}
            >
              {/* Step dot */}
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center border-2 shrink-0 transition-all duration-300 z-10",
                  "bg-[var(--background)]",
                  isActive
                    ? "border-indigo-600 text-indigo-600 shadow-md shadow-indigo-500/20 scale-110"
                    : isCompleted
                    ? "border-indigo-600 bg-indigo-600 text-white"
                    : cn(BORDER, TEXT_SOFT)
                )}
              >
                {isCompleted ? <Check className="w-4 h-4" /> : step.icon}
              </div>

              {/* Labels */}
              <div className="pt-1">
                <div
                  className={cn(
                    "text-sm font-bold transition-colors",
                    isActive ? "text-indigo-600" : cn(TEXT),
                    !isActive && "text-[color:color-mix(in_oklab,var(--foreground)_78%,transparent)]"
                  )}
                >
                  {step.label}
                </div>

                <div className={cn("text-[11px] font-medium", TEXT_MUTED)}>
                  {step.desc}
                </div>
              </div>

              {/* Active indicator */}
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