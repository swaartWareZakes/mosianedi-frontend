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

// Variable-safe tokens
const BORDER_SOFT =
  "border-[color:color-mix(in_oklab,var(--foreground)_14%,transparent)]";
const BORDER_SOFT_2 =
  "border-[color:color-mix(in_oklab,var(--foreground)_10%,transparent)]";
const TEXT_MUTED =
  "text-[color:color-mix(in_oklab,var(--foreground)_60%,transparent)]";
const TEXT_SOFT =
  "text-[color:color-mix(in_oklab,var(--foreground)_45%,transparent)]";
const BG_HOVER =
  "hover:bg-[color:color-mix(in_oklab,var(--foreground)_6%,transparent)]";
const BG_SOFT =
  "bg-[color:color-mix(in_oklab,var(--foreground)_6%,transparent)]";
const BG_ACCENT_SOFT =
  "bg-[color:color-mix(in_oklab,var(--accent-color)_14%,transparent)]";
const TEXT_ACCENT = "text-[var(--accent-color)]";
const RING_ACCENT = "focus:ring-2 focus:ring-[var(--accent-color)]";

export function ProjectListHeader({
  activeTab,
  setActiveTab,
  search,
  setSearch,
  onNewProject,
  counts,
  totalCount,
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
            Manage province-first road programmes and approval workflows.
          </p>
        </div>

        <button
          onClick={onNewProject}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg text-white bg-[var(--accent-color)] hover:brightness-110"
        >
          <Plus className="w-5 h-5" />
          New Provincial Proposal
        </button>
      </div>

      {/* Bottom Row: Tabs + Search */}
      <div
        className={cn(
          "flex flex-col sm:flex-row items-center justify-between pb-1 gap-4 border-b",
          BORDER_SOFT
        )}
      >
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto no-scrollbar pb-2 sm:pb-0">
          <TabButton
            active={activeTab === "all"}
            onClick={() => setActiveTab("all")}
            label="All Proposals"
            count={totalCount}
          />
          <TabButton
            active={activeTab === "mine"}
            onClick={() => setActiveTab("mine")}
            label="My Assignments"
            icon={<User className="w-4 h-4" />}
          />
          <TabButton
            active={activeTab === "planning"}
            onClick={() => setActiveTab("planning")}
            label="Active Planning"
            icon={
              <FileText className="w-4 h-4 text-[color:color-mix(in_oklab,var(--accent-color)_70%,#3b82f6)]" />
            }
            count={counts.planning}
          />
          <TabButton
            active={activeTab === "review"}
            onClick={() => setActiveTab("review")}
            label="Needs Review"
            icon={<AlertCircle className="w-4 h-4 text-amber-500" />}
            count={counts.review}
          />
          <TabButton
            active={activeTab === "backlog"}
            onClick={() => setActiveTab("backlog")}
            label="Backlog"
            icon={<Clock className="w-4 h-4 text-[color:color-mix(in_oklab,var(--foreground)_35%,transparent)]" />}
            count={counts.backlog}
          />
        </div>

        <div className="relative w-full sm:w-64 mt-2 sm:mt-0">
          <Search
            className={cn(
              "absolute left-3 top-2.5 w-4 h-4",
              "text-[color:color-mix(in_oklab,var(--foreground)_35%,transparent)]"
            )}
          />
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={cn(
              "w-full pl-9 pr-4 py-2 rounded-lg text-sm outline-none",
              "bg-[var(--input-bg)] text-[var(--input-text)]",
              "border",
              BORDER_SOFT_2,
              RING_ACCENT
            )}
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
        "flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap rounded-lg border",
        BORDER_SOFT_2,
        active
          ? cn(BG_ACCENT_SOFT, TEXT_ACCENT)
          : cn(TEXT_MUTED, BG_HOVER)
      )}
    >
      {icon}
      <span className={active ? "font-semibold" : ""}>{label}</span>

      {count !== undefined && (
        <span
          className={cn(
            "px-2 py-0.5 rounded-full text-[10px] font-bold ml-1 border",
            BORDER_SOFT_2,
            active
              ? cn(
                  "bg-[color:color-mix(in_oklab,var(--accent-color)_18%,transparent)]",
                  "text-[color:color-mix(in_oklab,var(--accent-color)_90%,black)]"
                )
              : cn(BG_SOFT, TEXT_SOFT)
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}