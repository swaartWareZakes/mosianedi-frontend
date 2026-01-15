"use client";

import React, { useState } from "react";
import { 
  Palette, 
  Shield, 
  Bell, 
  Monitor, 
  Smartphone, 
  LogOut,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import AppearanceTab from "./components/AppearanceTab";
import SecurityTab from "./components/SecurityTab";
import NotificationsTab from "./components/NotificationsTab";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("appearance");

  const menu = [
    { id: "appearance", label: "Appearance", icon: <Palette className="w-4 h-4" /> },
    { id: "security", label: "Security & 2FA", icon: <Shield className="w-4 h-4" /> },
    { id: "notifications", label: "Notifications", icon: <Bell className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-[var(--background)] p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h1>
          <p className="text-slate-500 dark:text-slate-400">Configure your workspace preferences and security.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* LEFT SIDEBAR: NAVIGATION */}
          <aside className="lg:w-64 flex-shrink-0 space-y-8">
            <nav className="space-y-1">
              {menu.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all",
                    activeTab === item.id 
                      ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md" 
                      : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  )}
                >
                  {item.icon}
                  {item.label}
                  {activeTab === item.id && <ChevronRight className="w-3 h-3 ml-auto opacity-50" />}
                </button>
              ))}
            </nav>

            {/* Session Info Box */}
            <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                <h3 className="text-xs font-bold uppercase text-slate-400 mb-3 tracking-wider">Current Session</h3>
                <div className="flex items-center gap-3 mb-2">
                    <Monitor className="w-4 h-4 text-emerald-500" />
                    <div className="text-xs">
                        <div className="font-medium text-slate-700 dark:text-slate-300">Chrome on macOS</div>
                        <div className="text-slate-400">Pretoria, ZA • Just now</div>
                    </div>
                </div>
            </div>
          </aside>

          {/* RIGHT CONTENT: TABS */}
          <main className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm min-h-[500px]">
            {activeTab === "appearance" && <AppearanceTab />}
            {activeTab === "security" && <SecurityTab />}
            {activeTab === "notifications" && <NotificationsTab />}
          </main>

        </div>
      </div>
    </div>
  );
}