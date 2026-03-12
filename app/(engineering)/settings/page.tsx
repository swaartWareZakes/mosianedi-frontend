"use client";

import React, { useState } from "react";
import { useTheme } from "next-themes";
import { Bell, Moon, Sun, Lock, Shield, Globe, MonitorSmartphone } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState("appearance");

  // Dummy state for toggle switches
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [reportNotifs, setReportNotifs] = useState(false);

  const tabs = [
    { id: "appearance", label: "Appearance", icon: <MonitorSmartphone className="w-4 h-4" /> },
    { id: "notifications", label: "Notifications", icon: <Bell className="w-4 h-4" /> },
    { id: "security", label: "Security", icon: <Shield className="w-4 h-4" /> },
    { id: "preferences", label: "Regional", icon: <Globe className="w-4 h-4" /> },
  ];

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      
      <div>
        <h1 className="text-3xl font-bold text-[var(--foreground)]">Settings</h1>
        <p className="text-[color:color-mix(in_oklab,var(--foreground)_60%,transparent)] mt-1">
          Manage application preferences and system configurations.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Tabs */}
        <aside className="w-full md:w-64 shrink-0 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-colors text-left",
                activeTab === tab.id 
                  ? "bg-[color:color-mix(in_oklab,var(--accent-color)_10%,transparent)] text-[var(--accent-color)]" 
                  : "text-[color:color-mix(in_oklab,var(--foreground)_60%,transparent)] hover:bg-[color:color-mix(in_oklab,var(--foreground)_4%,transparent)] hover:text-[var(--foreground)]"
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 bg-[var(--surface-bg)] border border-[color:color-mix(in_oklab,var(--foreground)_10%,transparent)] rounded-3xl p-8 min-h-[500px] shadow-sm">
          
          {/* APPEARANCE TAB */}
          {activeTab === "appearance" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div>
                <h2 className="text-lg font-bold text-[var(--foreground)]">Theme Preferences</h2>
                <p className="text-sm text-[color:color-mix(in_oklab,var(--foreground)_50%,transparent)] mt-1">Select your preferred visual interface.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                <button 
                  onClick={() => setTheme("light")}
                  className={cn(
                    "flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border-2 transition-all",
                    theme === "light" ? "border-[var(--accent-color)] bg-[color:color-mix(in_oklab,var(--accent-color)_5%,transparent)]" : "border-[color:color-mix(in_oklab,var(--foreground)_10%,transparent)] hover:border-[color:color-mix(in_oklab,var(--foreground)_20%,transparent)]"
                  )}
                >
                  <Sun className={cn("w-8 h-8", theme === "light" ? "text-[var(--accent-color)]" : "text-[color:color-mix(in_oklab,var(--foreground)_50%,transparent)]")} />
                  <span className={cn("font-bold text-sm", theme === "light" ? "text-[var(--foreground)]" : "text-[color:color-mix(in_oklab,var(--foreground)_60%,transparent)]")}>Light Mode</span>
                </button>

                <button 
                  onClick={() => setTheme("dark")}
                  className={cn(
                    "flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border-2 transition-all",
                    theme === "dark" ? "border-[var(--accent-color)] bg-[color:color-mix(in_oklab,var(--accent-color)_5%,transparent)]" : "border-[color:color-mix(in_oklab,var(--foreground)_10%,transparent)] hover:border-[color:color-mix(in_oklab,var(--foreground)_20%,transparent)]"
                  )}
                >
                  <Moon className={cn("w-8 h-8", theme === "dark" ? "text-[var(--accent-color)]" : "text-[color:color-mix(in_oklab,var(--foreground)_50%,transparent)]")} />
                  <span className={cn("font-bold text-sm", theme === "dark" ? "text-[var(--foreground)]" : "text-[color:color-mix(in_oklab,var(--foreground)_60%,transparent)]")}>Dark Mode</span>
                </button>

                <button 
                  onClick={() => setTheme("system")}
                  className={cn(
                    "flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border-2 transition-all",
                    theme === "system" ? "border-[var(--accent-color)] bg-[color:color-mix(in_oklab,var(--accent-color)_5%,transparent)]" : "border-[color:color-mix(in_oklab,var(--foreground)_10%,transparent)] hover:border-[color:color-mix(in_oklab,var(--foreground)_20%,transparent)]"
                  )}
                >
                  <MonitorSmartphone className={cn("w-8 h-8", theme === "system" ? "text-[var(--accent-color)]" : "text-[color:color-mix(in_oklab,var(--foreground)_50%,transparent)]")} />
                  <span className={cn("font-bold text-sm", theme === "system" ? "text-[var(--foreground)]" : "text-[color:color-mix(in_oklab,var(--foreground)_60%,transparent)]")}>System Default</span>
                </button>
              </div>
            </div>
          )}

          {/* NOTIFICATIONS TAB */}
          {activeTab === "notifications" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div>
                <h2 className="text-lg font-bold text-[var(--foreground)]">Alerts & Emails</h2>
                <p className="text-sm text-[color:color-mix(in_oklab,var(--foreground)_50%,transparent)] mt-1">Control how the platform communicates with you.</p>
              </div>

              <div className="space-y-4 pt-4">
                <div className="flex items-center justify-between p-4 border border-[color:color-mix(in_oklab,var(--foreground)_10%,transparent)] rounded-xl">
                  <div>
                    <h3 className="font-bold text-sm text-[var(--foreground)]">Project Updates</h3>
                    <p className="text-xs text-[color:color-mix(in_oklab,var(--foreground)_50%,transparent)] mt-0.5">Receive emails when a project status changes.</p>
                  </div>
                  <button 
                    onClick={() => setEmailNotifs(!emailNotifs)}
                    className={cn("w-12 h-6 rounded-full relative transition-colors duration-300", emailNotifs ? "bg-[var(--accent-color)]" : "bg-[color:color-mix(in_oklab,var(--foreground)_20%,transparent)]")}
                  >
                    <div className={cn("w-4 h-4 bg-white rounded-full absolute top-1 transition-all duration-300", emailNotifs ? "left-7" : "left-1")} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 border border-[color:color-mix(in_oklab,var(--foreground)_10%,transparent)] rounded-xl">
                  <div>
                    <h3 className="font-bold text-sm text-[var(--foreground)]">Simulation Completion</h3>
                    <p className="text-xs text-[color:color-mix(in_oklab,var(--foreground)_50%,transparent)] mt-0.5">Notify me when the RoNET engine finishes a heavy run.</p>
                  </div>
                  <button 
                    onClick={() => setReportNotifs(!reportNotifs)}
                    className={cn("w-12 h-6 rounded-full relative transition-colors duration-300", reportNotifs ? "bg-[var(--accent-color)]" : "bg-[color:color-mix(in_oklab,var(--foreground)_20%,transparent)]")}
                  >
                    <div className={cn("w-4 h-4 bg-white rounded-full absolute top-1 transition-all duration-300", reportNotifs ? "left-7" : "left-1")} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* OTHER TABS (Placeholders) */}
          {(activeTab === "security" || activeTab === "preferences") && (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 animate-in fade-in duration-300 py-20">
              <div className="w-16 h-16 rounded-full bg-[color:color-mix(in_oklab,var(--foreground)_4%,transparent)] flex items-center justify-center text-[color:color-mix(in_oklab,var(--foreground)_30%,transparent)]">
                <Lock className="w-8 h-8" />
              </div>
              <h2 className="text-lg font-bold text-[var(--foreground)]">Section Locked</h2>
              <p className="text-sm text-[color:color-mix(in_oklab,var(--foreground)_50%,transparent)] max-w-sm">
                These settings are managed by your organization's IT administrator via the centralized policies.
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}