"use client";

import { useTheme } from "next-themes";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { cn } from "@/lib/utils";
import {
  MoonStar,
  Sun,
  Bell,
  TrendingUp,
  ArrowLeft,
  HardHat,
  Landmark,
  ChevronDown,
  Globe,
  FolderKanban
} from "lucide-react";

export function Topbar() {
  const router = useRouter();
  const pathname = usePathname();

  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // Project Switcher State
  const [projects, setProjects] = useState<any[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Extract projectId from URL if present
  const match = pathname?.match(/\/projects\/([a-zA-Z0-9-]+)/);
  const currentProjectId = match ? match[1] : null;

  useEffect(() => {
    setMounted(true);
    async function loadProjects() {
        const { data } = await supabase.from('projects').select('id, project_name, province').order('updated_at', { ascending: false });
        if (data) setProjects(data);
    }
    loadProjects();
  }, []);

  const isDark = mounted ? resolvedTheme === "dark" : false;
  const toggleTheme = () => setTheme(isDark ? "light" : "dark");
  const usingSystem = theme === "system";

  const workspace = useMemo<"engineering" | "finance" | "portal" | "other">(() => {
    if (!pathname) return "other";
    if (pathname.startsWith("/finance")) return "finance";
    if (pathname.startsWith("/portal")) return "portal";
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

  const activeProject = projects.find(p => p.id === currentProjectId);

  const handleContextSwitch = (id: string | null) => {
      setIsDropdownOpen(false);
      if (id) {
          router.push(`/projects/${id}/dashboard`);
      } else {
          router.push(`/dashboard`);
      }
  };

  const WorkspaceChip = () => {
    if (workspace === "portal" || workspace === "other") return null;
    const isFinance = workspace === "finance";
    return (
      <div
        className="hidden md:flex items-center gap-2 px-3 py-2 rounded-full bg-[color:var(--surface-bg)] border border-[color:color-mix(in_oklab,var(--foreground)_10%,transparent)] text-xs font-bold text-[var(--foreground)] shadow-sm"
        title="Current workspace"
      >
        {isFinance ? (
          <><Landmark className="h-4 w-4 text-emerald-600" /> Finance</>
        ) : (
          <><HardHat className="h-4 w-4 text-[var(--accent-color)]" /> Engineering</>
        )}
      </div>
    );
  };

  return (
    <header className="flex items-center gap-6 px-8 py-3 bg-[color:var(--surface-bg)] backdrop-blur-md shadow-lg rounded-2xl relative z-50">
      
      {/* Dynamic Workspace Context Switcher (Replaced Static App Name) */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center gap-3 group hover:bg-[color:color-mix(in_oklab,var(--foreground)_4%,transparent)] p-1.5 pr-3 rounded-xl transition"
        >
          <div className="p-1.5 bg-[var(--accent-color)] rounded-lg">
             {activeProject ? <FolderKanban className="w-5 h-5 text-white" /> : <Globe className="w-5 h-5 text-white" />}
          </div>
          <div className="flex flex-col items-start text-left max-w-[200px] xl:max-w-[300px]">
            <span className="text-sm font-bold tracking-tight text-[var(--foreground)] leading-tight truncate w-full">
              {activeProject ? activeProject.project_name : "Global Portfolio"}
            </span>
            <span className="text-[10px] text-[color:color-mix(in_oklab,var(--foreground)_50%,transparent)] uppercase tracking-wider font-bold leading-none mt-0.5 truncate w-full">
              {activeProject ? activeProject.province : "All Active Projects"}
            </span>
          </div>
          <ChevronDown className={cn("w-4 h-4 text-[color:color-mix(in_oklab,var(--foreground)_40%,transparent)] ml-1 transition-transform", isDropdownOpen && "rotate-180")} />
        </button>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />
            <div className="absolute left-0 top-full mt-2 w-72 bg-[var(--surface-bg)] border border-[color:color-mix(in_oklab,var(--foreground)_14%,transparent)] rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                
                {/* Global Option */}
                <button 
                    onClick={() => handleContextSwitch(null)}
                    className={cn(
                        "w-full text-left px-4 py-3 text-sm border-b border-[color:color-mix(in_oklab,var(--foreground)_10%,transparent)] transition-colors flex items-center gap-3",
                        !currentProjectId ? "bg-[color:color-mix(in_oklab,var(--accent-color)_10%,transparent)]" : "hover:bg-[color:color-mix(in_oklab,var(--foreground)_4%,transparent)]"
                    )}
                >
                    <Globe className={cn("w-4 h-4", !currentProjectId ? "text-[var(--accent-color)]" : "text-[color:color-mix(in_oklab,var(--foreground)_50%,transparent)]")} />
                    <span className={cn("font-bold", !currentProjectId ? "text-[var(--accent-color)]" : "text-[var(--foreground)]")}>Global Portfolio</span>
                </button>

                {/* Project List */}
                <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-[color:color-mix(in_oklab,var(--foreground)_50%,transparent)] bg-[color:color-mix(in_oklab,var(--foreground)_2%,transparent)] border-b border-[color:color-mix(in_oklab,var(--foreground)_6%,transparent)]">
                    Active Projects
                </div>
                <div className="max-h-[350px] overflow-y-auto">
                    {projects.map(p => (
                        <button 
                            key={p.id}
                            onClick={() => handleContextSwitch(p.id)}
                            className={cn(
                                "w-full text-left px-4 py-3 text-sm border-b border-[color:color-mix(in_oklab,var(--foreground)_6%,transparent)] transition-colors flex flex-col gap-0.5",
                                p.id === currentProjectId ? "bg-[color:color-mix(in_oklab,var(--accent-color)_10%,transparent)]" : "hover:bg-[color:color-mix(in_oklab,var(--foreground)_4%,transparent)]"
                            )}
                        >
                            <span className={cn("font-bold truncate w-full", p.id === currentProjectId ? "text-[var(--accent-color)]" : "text-[var(--foreground)]")}>
                                {p.project_name}
                            </span>
                            <span className="text-[10px] text-[color:color-mix(in_oklab,var(--foreground)_50%,transparent)] uppercase font-medium">{p.province}</span>
                        </button>
                    ))}
                </div>
            </div>
          </>
        )}
      </div>

      {/* Middle: Quick Action buttons */}
      <div className="flex flex-1 items-center justify-center">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/portal")}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[color:var(--surface-bg)] border border-[color:color-mix(in_oklab,var(--foreground)_10%,transparent)] text-xs font-bold text-[var(--foreground)] shadow-sm hover:bg-[color:var(--background)] transition"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Portal
          </button>

          {workspace === "engineering" && (
            <button
              type="button"
              onClick={() => router.push("/finance")}
              className="hidden lg:inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-600 text-white border border-emerald-600/30 text-xs font-bold shadow-sm hover:opacity-90 transition"
              title="Switch to Finance portal"
            >
              <Landmark className="h-4 w-4" />
              Go to Finance
            </button>
          )}

          {workspace === "finance" && (
            <button
              type="button"
              onClick={() => router.push("/projects")}
              className="hidden lg:inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--accent-color)] text-white border border-transparent text-xs font-bold shadow-sm hover:brightness-110 transition"
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
          className="h-10 w-10 flex items-center justify-center rounded-full border border-[color:color-mix(in_oklab,var(--foreground)_10%,transparent)] bg-[color:var(--surface-bg)] text-[var(--foreground)] hover:bg-[color:var(--background)] shadow-sm transition"
          title="Notifications"
        >
          <Bell className="h-5 w-5" />
        </button>

        {mounted && (
          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-[color:var(--surface-bg)] border border-[color:color-mix(in_oklab,var(--foreground)_10%,transparent)] text-xs font-medium text-[var(--foreground)] shadow-sm hover:bg-[color:var(--background)] transition"
          >
            {isDark ? <><MoonStar className="h-4 w-4" /> Dark mode</> : <><Sun className="h-4 w-4" /> Light mode</>}
          </button>
        )}
      </div>
    </header>
  );
}