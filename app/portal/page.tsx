"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, HardHat, Landmark, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const BG = "bg-[var(--background)]";
const SURFACE = "bg-[var(--surface-bg)]";
const TEXT = "text-[var(--foreground)]";
const MUTED = "text-[color:color-mix(in_oklab,var(--foreground)_55%,transparent)]";
const BORDER = "border-[color:color-mix(in_oklab,var(--foreground)_14%,transparent)]";
const WASH = "bg-[color:color-mix(in_oklab,var(--foreground)_6%,transparent)]";

export default function PortalPage() {
  const router = useRouter();

  return (
    <div className={cn("min-h-screen", BG, TEXT)}>
      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex items-start justify-between gap-6 mb-10">
          <div>
            <div className={cn("text-xs font-black uppercase tracking-[0.2em]", MUTED)}>
              Portal
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mt-2">
              Choose your workspace
            </h1>
            <p className={cn("mt-3 max-w-2xl leading-relaxed", MUTED)}>
              Engineering is for building the case (network inventory, scenarios, evidence). Finance is for reviewing
              the final package and sign-off readiness.
            </p>
          </div>

          <div className={cn("hidden md:flex items-center gap-2 px-3 py-2 rounded-xl border", BORDER, WASH)}>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span className={cn("text-xs font-bold", MUTED)}>Authenticated session</span>
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PortalCard
            title="Engineering Portal"
            subtitle="Build the programme, validate the data, run scenarios."
            icon={<HardHat className="w-6 h-6 text-indigo-600" />}
            bullets={[
              "Network inventory & map inspection",
              "Baseline inputs and assumptions",
              "Simulation runs and scenario comparisons",
              "Generate the business case package",
            ]}
            accent="indigo"
            onClick={() => router.push("/projects/recent")}
          />

          <PortalCard
            title="Finance Portal"
            subtitle="Review, verify, and approve the final submission package."
            icon={<Landmark className="w-6 h-6 text-emerald-600" />}
            bullets={[
              "Read-only review of the final report",
              "Compliance checklist & evidence trail",
              "Export PDFs / schedules",
              "Decision notes and sign-off status",
            ]}
            accent="emerald"
            onClick={() => router.push("/finance")}
          />
        </div>

        {/* Footer helper */}
        <div className={cn("mt-10 p-5 rounded-2xl border", BORDER, SURFACE)}>
          <div className={cn("text-xs font-black uppercase tracking-[0.2em]", MUTED)}>Tip</div>
          <p className={cn("mt-2 text-sm leading-relaxed", MUTED)}>
            You can always switch portals later. We’ll add a “Send to Finance” action inside Engineering once the package
            is ready.
          </p>
        </div>
      </div>
    </div>
  );
}

function PortalCard({
  title,
  subtitle,
  icon,
  bullets,
  accent,
  onClick,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  bullets: string[];
  accent: "indigo" | "emerald";
  onClick: () => void;
}) {
  const BORDER = "border-[color:color-mix(in_oklab,var(--foreground)_14%,transparent)]";
  const SURFACE = "bg-[var(--surface-bg)]";
  const MUTED = "text-[color:color-mix(in_oklab,var(--foreground)_55%,transparent)]";
  const HOVER = "hover:bg-[color:color-mix(in_oklab,var(--surface-bg)_92%,transparent)]";

  const accentRing =
    accent === "indigo"
      ? "hover:shadow-indigo-500/10 hover:border-[color:color-mix(in_oklab,indigo_40%,transparent)]"
      : "hover:shadow-emerald-500/10 hover:border-[color:color-mix(in_oklab,emerald_40%,transparent)]";

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group text-left w-full rounded-3xl border p-7 transition-all shadow-sm",
        BORDER,
        SURFACE,
        HOVER,
        accentRing,
        "focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center",
              "bg-[color:color-mix(in_oklab,var(--foreground)_6%,transparent)]"
            )}
          >
            {icon}
          </div>
          <div>
            <div className="text-xl font-black">{title}</div>
            <div className={cn("text-sm mt-1", MUTED)}>{subtitle}</div>
          </div>
        </div>

        <ArrowRight className={cn("w-5 h-5 mt-2 opacity-50 group-hover:opacity-100 transition")} />
      </div>

      <div className="mt-6 space-y-2">
        {bullets.map((b) => (
          <div key={b} className={cn("text-sm flex items-start gap-2", MUTED)}>
            <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[color:color-mix(in_oklab,var(--foreground)_40%,transparent)]" />
            <span>{b}</span>
          </div>
        ))}
      </div>
    </button>
  );
}