"use client";

import React from "react";
import { LayoutDashboard } from "lucide-react";

export function DashboardHeader() {
  return (
    <header className="space-y-1.5 pb-4 border-b border-[color:color-mix(in_oklab,var(--foreground)_10%,transparent)]">
      <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2 text-[var(--foreground)]">
        <LayoutDashboard className="h-6 w-6 text-[var(--accent-color)]" />
        Dashboards Workspace
      </h1>
      <p className="text-sm text-[color:color-mix(in_oklab,var(--foreground)_60%,transparent)] max-w-3xl">
        Build presentation-ready dashboards for each project. Adjust scenario
        knobs live for board meetings, and optionally save favourite
        configurations as named views. 
      </p>
    </header>
  );
}