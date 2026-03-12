"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  ShieldAlert, 
  Map,
  ChevronDown,
  FolderSync
} from "lucide-react";
import { useProjectMeta } from "../config/hooks/useProjectMeta";

export function ProjectNavBar({ projectId }: { projectId: string }) {
  const pathname = usePathname();
  const router = useRouter();
  
  const { data: projectMeta } = useProjectMeta(projectId);
  const [allProjects, setAllProjects] = useState<any[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    async function loadProjects() {
        const { data } = await supabase.from('projects')
            .select('id, project_name, province')
            .order('updated_at', { ascending: false });
        if (data) setAllProjects(data);
    }
    loadProjects();
  }, []);

  const handleProjectSwitch = (newId: string) => {
      setIsDropdownOpen(false);
      // Try to keep the user on the same sub-tab (e.g. /advisor) when switching projects
      const currentTab = pathname.split('/').pop();
      router.push(`/projects/${newId}/${currentTab}`);
  };

  const tabs = [
    { name: "Proposal", href: `/projects/${projectId}/dashboard`, icon: <LayoutDashboard className="w-4 h-4"/> },
    { name: "Governance & History", href: `/projects/${projectId}/governance`, icon: <ShieldAlert className="w-4 h-4"/> },
  ];

  return (
    <div className="border-b border-slate-200 dark:border-slate-800 bg-[var(--surface-bg)] flex items-center justify-between pr-6 relative z-50">
      
      {/* LEFT: Tabs */}
      <div className="flex items-center gap-6 px-8 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const isActive = pathname.includes(tab.href);
          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={cn(
                "flex items-center gap-2 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                isActive
                  ? "border-[var(--accent-color)] text-[var(--accent-color)]"
                  : "border-transparent text-[color:color-mix(in_oklab,var(--foreground)_60%,transparent)] hover:text-[var(--foreground)] hover:border-[color:color-mix(in_oklab,var(--foreground)_30%,transparent)]"
              )}
            >
              {tab.icon}
              {tab.name}
            </Link>
          );
        })}
      </div>

      {/* RIGHT: Project Switcher */}
      <div className="relative">
          <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[color:color-mix(in_oklab,var(--foreground)_14%,transparent)] bg-[color:color-mix(in_oklab,var(--foreground)_4%,transparent)] hover:bg-[color:color-mix(in_oklab,var(--foreground)_8%,transparent)] transition-colors text-xs font-bold text-[var(--foreground)]"
          >
              <FolderSync className="w-3.5 h-3.5 text-[var(--accent-color)]" />
              <span className="max-w-[150px] truncate">{projectMeta?.project_name || "Loading..."}</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-50" />
          </button>

          {isDropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />
                <div className="absolute right-0 top-full mt-2 w-64 bg-[var(--surface-bg)] border border-[color:color-mix(in_oklab,var(--foreground)_14%,transparent)] rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-[color:color-mix(in_oklab,var(--foreground)_50%,transparent)] bg-[color:color-mix(in_oklab,var(--foreground)_4%,transparent)] border-b border-[color:color-mix(in_oklab,var(--foreground)_10%,transparent)]">
                        Switch Workspace
                    </div>
                    <div className="max-h-[300px] overflow-y-auto">
                        {allProjects.map(p => (
                            <button 
                                key={p.id}
                                onClick={() => handleProjectSwitch(p.id)}
                                className={cn(
                                    "w-full text-left px-4 py-3 text-sm border-b border-[color:color-mix(in_oklab,var(--foreground)_6%,transparent)] transition-colors flex flex-col gap-0.5",
                                    p.id === projectId ? "bg-[color:color-mix(in_oklab,var(--accent-color)_10%,transparent)]" : "hover:bg-[color:color-mix(in_oklab,var(--foreground)_4%,transparent)]"
                                )}
                            >
                                <span className={cn("font-bold truncate", p.id === projectId ? "text-[var(--accent-color)]" : "text-[var(--foreground)]")}>
                                    {p.project_name}
                                </span>
                                <span className="text-[10px] text-[color:color-mix(in_oklab,var(--foreground)_50%,transparent)] uppercase">{p.province}</span>
                            </button>
                        ))}
                    </div>
                </div>
              </>
          )}
      </div>
    </div>
  );
}