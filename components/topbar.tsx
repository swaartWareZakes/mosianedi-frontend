"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { MoonStar, Sun, Bell, Search, TrendingUp } from "lucide-react";

export function Topbar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = theme === "dark";
  const toggleTheme = () => setTheme(isDark ? "light" : "dark");
  
  return (
    <header
      className="
        flex items-center gap-6
        px-8 py-3
        bg-[var(--surface-bg)]/95 backdrop-blur-md
        shadow-lg rounded-2xl
      "
    >
      {/* App Name */}
      <div className="flex items-center gap-2">
        <div className="p-1.5 bg-indigo-600 rounded-lg">
            <TrendingUp className="w-4 h-4 text-white" />
        </div>
        <span
          className="
            px-2 py-2
            text-base font-bold tracking-tight
            text-[var(--foreground)]
          "
        >
          SA Roads Funding Gap Solutions
        </span>
      </div>

      {/* Search Section */}
      <div className="flex flex-1 items-center justify-center">
        <div className="relative w-full max-w-lg">
          <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center">
            <Search className="h-5 w-5 text-slate-400 dark:text-slate-500" />
          </span>

          <input
            type="text"
            placeholder="Search projects, roads, KPIs..."
            className="
              w-full
              h-11
              pl-12 pr-4
              rounded-2xl
              text-sm
              shadow-sm
              bg-[var(--background)] border border-slate-200/50 dark:border-slate-800/50
              text-[var(--foreground)]
              placeholder:text-slate-400 dark:placeholder:text-slate-500
              focus:ring-2 focus:ring-sky-300/60 dark:focus:ring-sky-800/40
              focus:border-sky-400
              outline-none
              transition-all
            "
          />
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
            bg-[var(--surface-bg)] 
            text-[var(--foreground)]
            hover:bg-[var(--background)]
            shadow-sm
            transition
          "
        >
          <Bell className="h-5 w-5" />
        </button>

        {mounted && (
          <button
            onClick={toggleTheme}
            className="
              flex items-center gap-2
              px-4 py-2
              rounded-full
              bg-[var(--surface-bg)]
              border border-slate-200/50 dark:border-slate-800/50
              text-xs font-medium
              text-[var(--foreground)]
              shadow-sm
              hover:bg-[var(--background)]
              transition
            "
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