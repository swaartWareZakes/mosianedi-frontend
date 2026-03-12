"use client";

import React from "react";
import { Plus, Search, User, FileText, AlertCircle, Clock, LayoutGrid, List, Map, Building2, MapPin, Route as RouteIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProjectScope } from "./ProjectCard";

interface Props {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  search: string;
  setSearch: (val: string) => void;
  onNewProject: () => void;
  counts: { planning: number; review: number; backlog: number };
  totalCount: number;
  viewMode: "grid" | "list";
  setViewMode: (mode: "grid" | "list") => void;
  scopeFilter: ProjectScope | "all";
  setScopeFilter: (scope: ProjectScope | "all") => void;
}

// Variable-safe tokens
const BORDER_SOFT = "border-[color:color-mix(in_oklab,var(--foreground)_14%,transparent)]";
const BORDER_SOFT_2 = "border-[color:color-mix(in_oklab,var(--foreground)_10%,transparent)]";
const TEXT_MUTED = "text-[color:color-mix(in_oklab,var(--foreground)_60%,transparent)]";
const TEXT_SOFT = "text-[color:color-mix(in_oklab,var(--foreground)_45%,transparent)]";
const BG_HOVER = "hover:bg-[color:color-mix(in_oklab,var(--foreground)_6%,transparent)]";
const BG_SOFT = "bg-[color:color-mix(in_oklab,var(--foreground)_6%,transparent)]";
const BG_ACCENT_SOFT = "bg-[color:color-mix(in_oklab,var(--accent-color)_14%,transparent)]";
const TEXT_ACCENT = "text-[var(--accent-color)]";
const RING_ACCENT = "focus:ring-2 focus:ring-[var(--accent-color)]";

export function ProjectListHeader({
  activeTab, setActiveTab,
  search, setSearch,
  onNewProject,
  counts, totalCount,
  viewMode, setViewMode,
  scopeFilter, setScopeFilter
}: Props) {
  return (
    <div className="space-y-6">
      {/* Top Row: Title + CTA */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[var(--foreground)] tracking-tight">
            Mission Control
          </h1>
          <p className={`${TEXT_MUTED} mt-1`}>
            Manage road programmes and workflows across all regional scopes.
          </p>
        </div>

        <button
          onClick={onNewProject}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg text-white bg-[var(--accent-color)] hover:brightness-110"
        >
          <Plus className="w-5 h-5" />
          Create Proposal
        </button>
      </div>

      {/* Main Tabs Row */}
      <div className={cn("flex flex-col sm:flex-row items-center justify-between pb-1 gap-4 border-b", BORDER_SOFT)}>
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto no-scrollbar pb-2 sm:pb-0">
          <TabButton active={activeTab === "all"} onClick={() => setActiveTab("all")} label="All Proposals" count={totalCount} />
          <TabButton active={activeTab === "mine"} onClick={() => setActiveTab("mine")} label="My Assignments" icon={<User className="w-4 h-4" />} />
          <TabButton active={activeTab === "planning"} onClick={() => setActiveTab("planning")} label="Active Planning" icon={<FileText className="w-4 h-4 text-[color:color-mix(in_oklab,var(--accent-color)_70%,#3b82f6)]" />} count={counts.planning} />
          <TabButton active={activeTab === "review"} onClick={() => setActiveTab("review")} label="Needs Review" icon={<AlertCircle className="w-4 h-4 text-amber-500" />} count={counts.review} />
          <TabButton active={activeTab === "backlog"} onClick={() => setActiveTab("backlog")} label="Backlog" icon={<Clock className="w-4 h-4 text-[color:color-mix(in_oklab,var(--foreground)_35%,transparent)]" />} count={counts.backlog} />
        </div>
      </div>

      {/* Secondary Controls Row (Filters & Layout) */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Scope Filters */}
        <div className="flex items-center gap-1.5 bg-[var(--surface-bg)] p-1 rounded-xl border border-[color:color-mix(in_oklab,var(--foreground)_10%,transparent)] shadow-sm overflow-x-auto no-scrollbar">
           <ScopeFilterBtn active={scopeFilter === 'all'} onClick={() => setScopeFilter('all')} label="All Scopes" />
           <div className="w-px h-4 bg-[color:color-mix(in_oklab,var(--foreground)_10%,transparent)] mx-1" />
           <ScopeFilterBtn active={scopeFilter === 'provincial'} onClick={() => setScopeFilter('provincial')} label="Provincial" icon={<Map className="w-3.5 h-3.5"/>} />
           <ScopeFilterBtn active={scopeFilter === 'municipal'} onClick={() => setScopeFilter('municipal')} label="Municipal" icon={<Building2 className="w-3.5 h-3.5"/>} />
           <ScopeFilterBtn active={scopeFilter === 'local'} onClick={() => setScopeFilter('local')} label="Ward" icon={<MapPin className="w-3.5 h-3.5"/>} />
           <ScopeFilterBtn active={scopeFilter === 'route'} onClick={() => setScopeFilter('route')} label="Route" icon={<RouteIcon className="w-3.5 h-3.5"/>} />
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto">
          {/* Search */}
          <div className="relative flex-1 lg:w-64">
            <Search className={cn("absolute left-3 top-2.5 w-4 h-4", "text-[color:color-mix(in_oklab,var(--foreground)_35%,transparent)]")} />
            <input
              type="text"
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={cn(
                "w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none shadow-sm",
                "bg-[var(--surface-bg)] text-[var(--foreground)]",
                "border", BORDER_SOFT_2, RING_ACCENT
              )}
            />
          </div>

          {/* View Toggles */}
          <div className="flex items-center bg-[var(--surface-bg)] p-1 rounded-xl border border-[color:color-mix(in_oklab,var(--foreground)_10%,transparent)] shadow-sm">
             <button 
                onClick={() => setViewMode("grid")}
                className={cn("p-1.5 rounded-lg transition-colors", viewMode === "grid" ? "bg-[var(--foreground)] text-[var(--background)]" : "text-[color:color-mix(in_oklab,var(--foreground)_50%,transparent)] hover:bg-[color:color-mix(in_oklab,var(--foreground)_6%,transparent)]")}
             >
                <LayoutGrid className="w-4 h-4" />
             </button>
             <button 
                onClick={() => setViewMode("list")}
                className={cn("p-1.5 rounded-lg transition-colors", viewMode === "list" ? "bg-[var(--foreground)] text-[var(--background)]" : "text-[color:color-mix(in_oklab,var(--foreground)_50%,transparent)] hover:bg-[color:color-mix(in_oklab,var(--foreground)_6%,transparent)]")}
             >
                <List className="w-4 h-4" />
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, label, count, icon }: any) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap rounded-lg border",
        BORDER_SOFT_2,
        active ? cn(BG_ACCENT_SOFT, TEXT_ACCENT) : cn(TEXT_MUTED, BG_HOVER)
      )}
    >
      {icon}
      <span className={active ? "font-semibold" : ""}>{label}</span>
      {count !== undefined && (
        <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold ml-1 border", BORDER_SOFT_2, active ? cn("bg-[color:color-mix(in_oklab,var(--accent-color)_18%,transparent)]", "text-[color:color-mix(in_oklab,var(--accent-color)_90%,black)]") : cn(BG_SOFT, TEXT_SOFT))}>
          {count}
        </span>
      )}
    </button>
  );
}

function ScopeFilterBtn({ active, onClick, label, icon }: any) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap",
        active ? "bg-[var(--foreground)] text-[var(--background)] shadow-sm" : "text-[color:color-mix(in_oklab,var(--foreground)_60%,transparent)] hover:text-[var(--foreground)] hover:bg-[color:color-mix(in_oklab,var(--foreground)_6%,transparent)]"
      )}
    >
      {icon}
      {label}
    </button>
  )
}