"use client";

import React, { useEffect, useState } from "react";
import { User, Camera, Save, Loader2, Building } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export default function ProfileHeader() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>({});

  useEffect(() => {
    async function getProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();
      
      // Fallback if no profile record exists yet
      setProfile(data || { 
          first_name: "", 
          last_name: "", 
          email: user.email, 
          title: "", 
          department: "" 
      });
      setLoading(false);
    }
    getProfile();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        const updates = {
            user_id: user.id,
            first_name: profile.first_name,
            last_name: profile.last_name,
            title: profile.title,
            department: profile.department,
            updated_at: new Date().toISOString(),
        };

        const { error } = await supabase.from("profiles").upsert(updates);
        if (error) console.error(error);
        else alert("Profile updated!");
    }
    setSaving(false);
  };

  if (loading) return <div className="h-64 bg-slate-50 rounded-xl animate-pulse" />;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
      
      {/* Avatar Section */}
      <div className="flex flex-col items-center -mt-12 mb-6">
        <div className="relative group">
            <div className="w-24 h-24 rounded-full bg-slate-200 dark:bg-slate-800 border-4 border-white dark:border-slate-950 flex items-center justify-center overflow-hidden">
                {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                    <User className="w-10 h-10 text-slate-400" />
                )}
            </div>
            <button className="absolute bottom-0 right-0 p-2 bg-indigo-600 rounded-full text-white shadow-lg hover:bg-indigo-700 transition-colors">
                <Camera className="w-4 h-4" />
            </button>
        </div>
        <h2 className="mt-3 text-lg font-bold text-slate-900 dark:text-white">
            {profile.first_name} {profile.last_name || "User"}
        </h2>
        <div className="flex items-center gap-1 text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full mt-1">
            <Building className="w-3 h-3" />
            {profile.department || "No Department"}
        </div>
      </div>

      {/* Form Fields */}
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase">First Name</label>
                <input 
                    type="text" 
                    value={profile.first_name || ""}
                    onChange={(e) => setProfile({...profile, first_name: e.target.value})}
                    className="w-full p-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                />
            </div>
            <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase">Last Name</label>
                <input 
                    type="text" 
                    value={profile.last_name || ""}
                    onChange={(e) => setProfile({...profile, last_name: e.target.value})}
                    className="w-full p-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                />
            </div>
        </div>

        <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase">Job Title</label>
            <input 
                type="text" 
                value={profile.title || ""}
                onChange={(e) => setProfile({...profile, title: e.target.value})}
                className="w-full p-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
            />
        </div>

        <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase">Department</label>
            <input 
                type="text" 
                value={profile.department || ""}
                onChange={(e) => setProfile({...profile, department: e.target.value})}
                className="w-full p-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
            />
        </div>

        <button 
            onClick={handleSave}
            disabled={saving}
            className="w-full py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
        >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
        </button>
      </div>

    </div>
  );
}