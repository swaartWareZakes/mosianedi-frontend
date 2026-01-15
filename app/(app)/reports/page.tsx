"use client";

import React from "react";
import ReportBuilderShell from "./components/ReportBuilderShell";

export default function ReportsPage() {
  return (
    <div className="h-[calc(100vh-64px)] w-full overflow-hidden">
      <ReportBuilderShell />
    </div>
  );
}