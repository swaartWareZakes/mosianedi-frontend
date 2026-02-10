"use client";

import React from "react";
import { Plus, Search, User, FileText, AlertCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  search: string;
  setSearch: (val: string) => void;
  onNewProject: () => void;
  counts: { planning: number; review: number; backlog: number };
  totalCount: number;
}

export function ProjectListHeader({ activeTab, setActiveTab, search, setSearch, onNewProject, counts, totalCount }: Props) {
  return (
    <div className="space-y-6">
      {/* Top Row: Title + CTA */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Mission Control</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage province-first road programmes and approval workflows.</p>
        </div>
        <button
          onClick={onNewProject}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg hover:shadow-indigo-500/25"
        >
          <Plus className="w-5 h-5" />
          New Provincial Proposal
        </button>
      </div>

      {/* Bottom Row: Tabs + Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-1 gap-4">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto no-scrollbar pb-2 sm:pb-0">
          <TabButton active={activeTab === "all"} onClick={() => setActiveTab("all")} label="All Proposals" count={totalCount} />
          <TabButton active={activeTab === "mine"} onClick={() => setActiveTab("mine")} label="My Assignments" icon={<User className="w-4 h-4" />} />
          <TabButton active={activeTab === "planning"} onClick={() => setActiveTab("planning")} label="Active Planning" icon={<FileText className="w-4 h-4 text-blue-500" />} count={counts.planning} />
          <TabButton active={activeTab === "review"} onClick={() => setActiveTab("review")} label="Needs Review" icon={<AlertCircle className="w-4 h-4 text-amber-500" />} count={counts.review} />
          <TabButton active={activeTab === "backlog"} onClick={() => setActiveTab("backlog")} label="Backlog" icon={<Clock className="w-4 h-4 text-slate-400" />} count={counts.backlog} />
        </div>

        <div className="relative w-full sm:w-64 mt-2 sm:mt-0">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
          />
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
        "flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap rounded-lg",
        active
          ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400"
          : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
      )}
    >
      {icon}
      {label}
      {count !== undefined && (
        <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold ml-1", active ? "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400")}>
          {count}
        </span>
      )}
    </button>
  );
}