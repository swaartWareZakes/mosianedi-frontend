"use client";

import Link from "next/link";
import { Landmark, FileText, BarChart3, Cuboid, ShieldCheck, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

const BG = "bg-[var(--background)]";
const SURFACE = "bg-[var(--surface-bg)]";
const TEXT = "text-[var(--foreground)]";
const MUTED = "text-[color:color-mix(in_oklab,var(--foreground)_55%,transparent)]";
const BORDER = "border-[color:color-mix(in_oklab,var(--foreground)_14%,transparent)]";
const WASH = "bg-[color:color-mix(in_oklab,var(--foreground)_6%,transparent)]";

export default function FinanceHomePage() {
  return (
    <div className={cn("w-full", BG, TEXT)}>
      <div className="max-w-5xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-6 mb-10">
          <div className="flex items-start gap-4">
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", WASH, "border", BORDER)}>
              <Landmark className="w-6 h-6 text-emerald-600" />
            </div>

            <div>
              <div className={cn("text-xs font-black uppercase tracking-[0.2em]", MUTED)}>
                Finance Portal
              </div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight mt-2">
                Under construction
              </h1>
              <p className={cn("mt-3 max-w-2xl leading-relaxed", MUTED)}>
                This workspace will be used to review, verify, and approve the final submission package.
                For now, it’s a placeholder while we wire the “Send to Finance” workflow from Engineering.
              </p>
            </div>
          </div>

          <div className={cn("hidden md:flex items-center gap-2 px-3 py-2 rounded-xl border", BORDER, WASH)}>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span className={cn("text-xs font-bold", MUTED)}>Authenticated session</span>
          </div>
        </div>

        {/* What's next */}
        <div className={cn("rounded-3xl border p-7", BORDER, SURFACE)}>
          <div className="flex items-start gap-3">
            <div className={cn("w-11 h-11 rounded-2xl flex items-center justify-center", WASH, "border", BORDER)}>
              <Landmark className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <div className="text-xl font-black">What’s coming next</div>
              <p className={cn("mt-1 text-sm", MUTED)}>
                A read-only review layer that receives a completed package from Engineering, tracks sign-off readiness,
                and exports the final bundle.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <MiniCard
              icon={<FileText className="w-4 h-4 text-indigo-600" />}
              title="Final Reports Inbox"
              desc="Receive the business case, schedules, and evidence pack."
            />
            <MiniCard
              icon={<BarChart3 className="w-4 h-4 text-emerald-600" />}
              title="Simulation + Dashboards"
              desc="View results, KPIs, and scenario summaries (read-only)."
            />
            <MiniCard
              icon={<Cuboid className="w-4 h-4 text-rose-600" />}
              title="3D Snapshot"
              desc="Preview the 3D simulation output sent from Engineering."
            />
          </div>

          <div className={cn("mt-6 rounded-2xl border p-4", BORDER, WASH)}>
            <div className={cn("text-xs font-black uppercase tracking-[0.2em]", MUTED)}>Tip</div>
            <p className={cn("mt-2 text-sm", MUTED)}>
              Use the portal to return to Engineering. Once Engineering “publishes” a package, it will appear here automatically.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <Link
              href="/portal"
              className={cn(
                "inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-black text-sm",
                "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20 transition"
              )}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Portal
            </Link>

            <Link
              href="/projects/recent"
              className={cn(
                "inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-black text-sm border",
                "hover:bg-[color:color-mix(in_oklab,var(--surface-bg)_92%,transparent)] transition",
                BORDER
              )}
            >
              Go to Engineering
              <span className={cn("text-[10px] px-2 py-0.5 rounded-full border", BORDER, MUTED)}>for now</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  const BORDER = "border-[color:color-mix(in_oklab,var(--foreground)_14%,transparent)]";
  const WASH = "bg-[color:color-mix(in_oklab,var(--foreground)_6%,transparent)]";
  const MUTED = "text-[color:color-mix(in_oklab,var(--foreground)_55%,transparent)]";

  return (
    <div className={cn("rounded-2xl border p-4", BORDER, WASH)}>
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/60">
          {icon}
        </div>
        <div className="font-black text-sm">{title}</div>
      </div>
      <div className={cn("mt-2 text-xs leading-relaxed", MUTED)}>{desc}</div>
    </div>
  );
}