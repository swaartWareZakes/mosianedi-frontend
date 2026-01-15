"use client";

import React, { useState } from "react";
import { Moon, Sun, Monitor } from "lucide-react";

export default function AppearanceTab() {
  const [theme, setTheme] = useState("system");
  const [accent, setAccent] = useState("indigo");

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
      
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Interface Theme</h2>
        <p className="text-sm text-slate-500">Customize how Mosianedi looks on your device.</p>
      </div>

      {/* Mode Selection */}
      <div className="grid grid-cols-3 gap-4">
        {['light', 'dark', 'system'].map((mode) => (
            <button
                key={mode}
                onClick={() => setTheme(mode)}
                className={`group relative p-4 rounded-xl border-2 text-left transition-all ${theme === mode ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/10' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'}`}
            >
                <div className="mb-3">
                    {mode === 'light' && <Sun className={`w-6 h-6 ${theme === mode ? 'text-indigo-600' : 'text-slate-400'}`} />}
                    {mode === 'dark' && <Moon className={`w-6 h-6 ${theme === mode ? 'text-indigo-600' : 'text-slate-400'}`} />}
                    {mode === 'system' && <Monitor className={`w-6 h-6 ${theme === mode ? 'text-indigo-600' : 'text-slate-400'}`} />}
                </div>
                <div className="font-medium text-sm capitalize text-slate-900 dark:text-white">{mode} Mode</div>
            </button>
        ))}
      </div>

      <hr className="border-slate-100 dark:border-slate-800" />

      {/* Brand Color */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Brand Accent</h2>
        <div className="flex gap-4">
            {['indigo', 'violet', 'emerald', 'rose', 'amber'].map((color) => {
                const bgClass = {
                    indigo: 'bg-indigo-500',
                    violet: 'bg-violet-500',
                    emerald: 'bg-emerald-500',
                    rose: 'bg-rose-500',
                    amber: 'bg-amber-500'
                }[color];

                return (
                    <button
                        key={color}
                        onClick={() => setAccent(color)}
                        className={`w-10 h-10 rounded-full ${bgClass} flex items-center justify-center transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${color}-500 ${accent === color ? 'ring-2 ring-offset-2 ring-slate-400' : ''}`}
                    >
                        {accent === color && <div className="w-2 h-2 bg-white rounded-full" />}
                    </button>
                )
            })}
        </div>
      </div>

      {/* Preview Box */}
      <div className="p-6 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 mt-8">
          <div className="flex items-center gap-4 mb-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white bg-${accent}-500 shadow-lg shadow-${accent}-500/30`}>
                  <Sun className="w-5 h-5" />
              </div>
              <div>
                  <div className="font-bold text-sm">Active Project</div>
                  <div className="text-xs text-slate-500">This is how your components will look.</div>
              </div>
              <button className={`ml-auto px-4 py-2 rounded-lg text-xs font-bold text-white bg-${accent}-600`}>
                  Primary Action
              </button>
          </div>
      </div>

    </div>
  );
}