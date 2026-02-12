// app/(app)/dashboard/components/DashboardHeader.tsx
"use client";

import React from "react";
import { LayoutDashboard } from "lucide-react";

export function DashboardHeader() {
  return (
    <header className="space-y-1">
      <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
        <LayoutDashboard className="h-6 w-6 text-sky-500" />
        Dashboards
      </h1>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Build presentation-ready dashboards for each project. Adjust scenario
        knobs live for board meetings, and optionally save favourite
        configurations as named dashboards.
      </p>
    </header>
  );
}