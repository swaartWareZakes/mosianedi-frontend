import type { ReactNode } from "react";
import Link from "next/link";
import { Landmark, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

const BG = "bg-[var(--background)]";
const SURFACE = "bg-[var(--surface-bg)]";
const TEXT = "text-[var(--foreground)]";
const MUTED = "text-[color:color-mix(in_oklab,var(--foreground)_55%,transparent)]";
const BORDER = "border-[color:color-mix(in_oklab,var(--foreground)_14%,transparent)]";

export default function FinanceLayout({ children }: { children: ReactNode }) {
  return (
    <div className={cn("min-h-screen w-full", BG, TEXT)}>
      {/* Finance-only top bar (simple, no engineering sidebar) */}
      <div className={cn("sticky top-0 z-20 border-b", BORDER, SURFACE)}>
        <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-[color:color-mix(in_oklab,var(--foreground)_6%,transparent)]">
              <Landmark className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <div className="text-sm font-black leading-none">Finance Portal</div>
              <div className={cn("text-[10px] uppercase tracking-widest font-bold mt-1", MUTED)}>
                Review • Sign-off • Export
              </div>
            </div>
          </div>

          <Link
            href="/portal"
            className={cn(
              "inline-flex items-center gap-2 text-sm font-bold px-3 py-2 rounded-xl border transition",
              "hover:bg-[color:color-mix(in_oklab,var(--surface-bg)_92%,transparent)]",
              BORDER
            )}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Portal
          </Link>
        </div>
      </div>

      {/* Page content */}
      <main className="mx-auto max-w-7xl px-6 py-10">{children}</main>
    </div>
  );
}