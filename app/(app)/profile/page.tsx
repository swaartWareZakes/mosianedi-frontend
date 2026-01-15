"use client";

import React from "react";
import ProfileHeader from "./components/ProfileHeader";
import SecuritySettings from "./components/SecuritySettings";
import ProjectHistory from "./components/ProjectHistory";
import ActivityLog from "./components/ActivityLog";

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-[var(--background)] p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Page Title */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">User Profile</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage your account settings and view your activity history.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: Identity & Security */}
          <div className="space-y-8 lg:col-span-1">
            <ProfileHeader />
            <SecuritySettings />
          </div>

          {/* RIGHT COLUMN: Work & History */}
          <div className="space-y-8 lg:col-span-2">
            <ProjectHistory />
            <ActivityLog />
          </div>

        </div>
      </div>
    </div>
  );
}