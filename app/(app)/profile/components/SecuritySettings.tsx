"use client";

import React, { useState } from "react";
import { Lock, ShieldCheck, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export default function SecuritySettings() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleUpdatePassword = async () => {
    if (password.length < 6) {
        setMessage("Password must be at least 6 characters.");
        return;
    }
    setLoading(true);
    setMessage("");
    
    const { error } = await supabase.auth.updateUser({ password: password });

    if (error) {
        setMessage("Error updating password.");
    } else {
        setMessage("Password updated successfully.");
        setPassword("");
    }
    setLoading(false);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
      <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="p-2 bg-rose-50 dark:bg-rose-900/20 rounded-lg text-rose-600">
            <ShieldCheck className="w-5 h-5" />
        </div>
        <h3 className="font-bold text-slate-900 dark:text-white">Security</h3>
      </div>

      <div className="space-y-3">
        <label className="text-xs font-semibold text-slate-500 uppercase">New Password</label>
        <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 p-2.5 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
            />
        </div>
      </div>

      {message && (
          <div className={`text-xs p-2 rounded ${message.includes("Error") ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600"}`}>
              {message}
          </div>
      )}

      <button 
        onClick={handleUpdatePassword}
        disabled={loading}
        className="w-full py-2.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-lg font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
      >
        {loading && <Loader2 className="w-3 h-3 animate-spin" />}
        Update Password
      </button>
    </div>
  );
}