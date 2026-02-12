"use client";

import { useTheme } from "next-themes";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  MoonStar,
  Sun,
  Bell,
  TrendingUp,
  ArrowLeft,
  HardHat,
  Landmark,
} from "lucide-react";

export function Topbar() {
  const router = useRouter();
  const pathname = usePathname();

  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // resolvedTheme is "light" | "dark" (even when theme === "system")
  const isDark = mounted ? resolvedTheme === "dark" : false;

  const toggleTheme = () => {
    // keep toggle strictly light/dark (even if currently "system")
    setTheme(isDark ? "light" : "dark");
  };

  const usingSystem = theme === "system";

  // Detect workspace based on route (adjust if your routes change)
  const workspace = useMemo<"engineering" | "finance" | "portal" | "other">(() => {
    if (!pathname) return "other";
    if (pathname.startsWith("/finance")) return "finance";
    if (pathname.startsWith("/portal")) return "portal";
    // engineering is everything under (engineering) group (e.g. /projects, /network, /reports, etc.)
    if (
      pathname.startsWith("/projects") ||
      pathname.startsWith("/network") ||
      pathname.startsWith("/reports") ||
      pathname.startsWith("/advisor") ||
      pathname.startsWith("/dashboard") ||
      pathname.startsWith("/presentationmode") ||
      pathname.startsWith("/settings") ||
      pathname.startsWith("/profile")
    )
      return "engineering";
    return "other";
  }, [pathname]);

  const WorkspaceChip = () => {
    if (workspace === "portal" || workspace === "other") return null;

    const isFinance = workspace === "finance";
    return (
      <div
        className="
          hidden md:flex items-center gap-2
          px-3 py-2 rounded-full
          bg-[color:var(--surface-bg)]
          border border-slate-200/50 dark:border-slate-800/50
          text-xs font-bold
          text-[var(--foreground)]
          shadow-sm
        "
        title="Current workspace"
      >
        {isFinance ? (
          <>
            <Landmark className="h-4 w-4 text-emerald-600" />
            Finance
          </>
        ) : (
          <>
            <HardHat className="h-4 w-4 text-indigo-600" />
            Engineering
          </>
        )}
      </div>
    );
  };

  return (
    <header
      className="
        flex items-center gap-6
        px-8 py-3
        bg-[color:var(--surface-bg)]
        backdrop-blur-md
        shadow-lg rounded-2xl
      "
    >
      {/* App Name */}
      <button
        type="button"
        onClick={() => router.push("/portal")}
        className="flex items-center gap-2 group"
        title="Back to Portal"
      >
        <div className="p-1.5 bg-indigo-600 rounded-lg">
          <TrendingUp className="w-4 h-4 text-white" />
        </div>
        <span className="px-2 py-2 text-base font-bold tracking-tight text-[var(--foreground)] group-hover:opacity-80 transition">
          SA Roads Funding Gap Solutions
        </span>
      </button>

      {/* Middle: Workspace controls (replaces Search) */}
      <div className="flex flex-1 items-center justify-center">
        <div className="flex items-center gap-3">
          {/* Back to Portal */}
          <button
            type="button"
            onClick={() => router.push("/portal")}
            className="
              inline-flex items-center gap-2
              px-4 py-2 rounded-full
              bg-[color:var(--surface-bg)]
              border border-slate-200/50 dark:border-slate-800/50
              text-xs font-bold text-[var(--foreground)]
              shadow-sm hover:bg-[color:var(--background)]
              transition
            "
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Portal
          </button>

          {/* Quick switch: only show if you're inside a workspace */}
          {workspace === "engineering" && (
            <button
              type="button"
              onClick={() => router.push("/finance")}
              className="
                hidden lg:inline-flex items-center gap-2
                px-4 py-2 rounded-full
                bg-emerald-600 text-white
                border border-emerald-600/30
                text-xs font-bold
                shadow-sm hover:opacity-90
                transition
              "
              title="Switch to Finance portal"
            >
              <Landmark className="h-4 w-4" />
              Go to Finance
            </button>
          )}

          {workspace === "finance" && (
            <button
              type="button"
              onClick={() => router.push("/projects/recent")}
              className="
                hidden lg:inline-flex items-center gap-2
                px-4 py-2 rounded-full
                bg-indigo-600 text-white
                border border-indigo-600/30
                text-xs font-bold
                shadow-sm hover:opacity-90
                transition
              "
              title="Switch to Engineering portal"
            >
              <HardHat className="h-4 w-4" />
              Go to Engineering
            </button>
          )}

          <WorkspaceChip />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          className="
            h-10 w-10 flex items-center justify-center
            rounded-full
            border border-slate-200/50 dark:border-slate-800/50
            bg-[color:var(--surface-bg)]
            text-[var(--foreground)]
            hover:bg-[color:var(--background)]
            shadow-sm transition
          "
          title="Notifications"
        >
          <Bell className="h-5 w-5" />
        </button>

        {mounted && (
          <button
            onClick={toggleTheme}
            className="
              flex items-center gap-2
              px-4 py-2 rounded-full
              bg-[color:var(--surface-bg)]
              border border-slate-200/50 dark:border-slate-800/50
              text-xs font-medium text-[var(--foreground)]
              shadow-sm hover:bg-[color:var(--background)]
              transition
            "
            title={
              usingSystem
                ? "Using system theme (click to override)"
                : "Manual theme (click to toggle)"
            }
          >
            {isDark ? (
              <>
                <MoonStar className="h-4 w-4" />
                Dark mode
              </>
            ) : (
              <>
                <Sun className="h-4 w-4" />
                Light mode
              </>
            )}
          </button>
        )}
      </div>
    </header>
  );
}