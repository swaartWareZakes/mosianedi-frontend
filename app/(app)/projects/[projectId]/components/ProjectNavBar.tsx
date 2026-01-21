"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  ShieldAlert, 
  Map, 
} from "lucide-react";

export function ProjectNavBar({ projectId }: { projectId: string }) {
  const pathname = usePathname();

  const tabs = [
    { name: "Proposal", href: `/projects/${projectId}/dashboard`, icon: <LayoutDashboard className="w-4 h-4"/> },
    // { name: "Network Map", href: `/projects/${projectId}/network`, icon: <Map className="w-4 h-4"/> },
    { name: "Governance & History", href: `/projects/${projectId}/governance`, icon: <ShieldAlert className="w-4 h-4"/> },
    // Removed Treasury View as requested
  ];

  return (
    <div className="border-b border-slate-200 dark:border-slate-800 bg-[var(--surface-bg)]">
      <div className="flex items-center gap-6 px-8 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={cn(
                "flex items-center gap-2 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                isActive
                  ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
                  : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:border-slate-300"
              )}
            >
              {tab.icon}
              {tab.name}
            </Link>
          );
        })}
      </div>
    </div>
  );
}