"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { User, Mail, Briefcase, Building2, ShieldCheck, Loader2, Save, Camera } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Form State matching your 'profiles' schema
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    department: "",
    title: "",
    role: "",
  });

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      setUserId(user.id);

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (profile) {
        setFormData({
          first_name: profile.first_name || "",
          last_name: profile.last_name || "",
          username: profile.username || "",
          email: profile.email || user.email || "",
          department: profile.department || "",
          title: profile.title || "",
          role: profile.role || "engineer",
        });
      }
      setLoading(false);
    }
    loadProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!userId) return;
    setSaving(true);
    
    // Update the profile in the database
    const { error } = await supabase
      .from("profiles")
      .update({
        first_name: formData.first_name,
        last_name: formData.last_name,
        username: formData.username,
        department: formData.department,
        title: formData.title,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);

    if (error) {
      alert("Error saving profile: " + error.message);
    } else {
      // Optional: Show a success toast here
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--accent-color)]" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[var(--foreground)]">My Profile</h1>
        <p className="text-[color:color-mix(in_oklab,var(--foreground)_60%,transparent)] mt-1">
          Manage your personal information and system identity.
        </p>
      </div>

      <div className="bg-[var(--surface-bg)] border border-[color:color-mix(in_oklab,var(--foreground)_10%,transparent)] rounded-2xl p-8 shadow-sm">
        
        {/* Avatar & Role Section */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-10 pb-10 border-b border-[color:color-mix(in_oklab,var(--foreground)_10%,transparent)]">
          <div className="relative group cursor-pointer">
            <div className="w-24 h-24 rounded-full bg-[color:color-mix(in_oklab,var(--accent-color)_15%,transparent)] text-[var(--accent-color)] flex items-center justify-center text-3xl font-bold border-2 border-[var(--surface-bg)] shadow-md">
              {formData.first_name?.[0]}{formData.last_name?.[0]}
            </div>
            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="w-6 h-6 text-white" />
            </div>
          </div>
          
          <div className="flex-1 space-y-2">
             <h2 className="text-xl font-bold text-[var(--foreground)]">{formData.first_name} {formData.last_name}</h2>
             <div className="flex flex-wrap gap-3">
               <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-[color:color-mix(in_oklab,var(--foreground)_6%,transparent)] text-[color:color-mix(in_oklab,var(--foreground)_60%,transparent)]">
                 <ShieldCheck className="w-3.5 h-3.5" />
                 Role: {formData.role.replace('_', ' ')}
               </span>
               <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-[color:color-mix(in_oklab,var(--accent-color)_10%,transparent)] text-[var(--accent-color)]">
                 <Mail className="w-3.5 h-3.5" />
                 {formData.email}
               </span>
             </div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[color:color-mix(in_oklab,var(--foreground)_50%,transparent)] flex items-center gap-2">
               <User className="w-3.5 h-3.5" /> First Name
            </label>
            <input 
              name="first_name" value={formData.first_name} onChange={handleChange}
              className="w-full bg-[color:color-mix(in_oklab,var(--foreground)_2%,transparent)] border border-[color:color-mix(in_oklab,var(--foreground)_10%,transparent)] rounded-xl px-4 py-3 text-sm text-[var(--foreground)] focus:border-[var(--accent-color)] focus:outline-none transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[color:color-mix(in_oklab,var(--foreground)_50%,transparent)] flex items-center gap-2">
               <User className="w-3.5 h-3.5" /> Last Name
            </label>
            <input 
              name="last_name" value={formData.last_name} onChange={handleChange}
              className="w-full bg-[color:color-mix(in_oklab,var(--foreground)_2%,transparent)] border border-[color:color-mix(in_oklab,var(--foreground)_10%,transparent)] rounded-xl px-4 py-3 text-sm text-[var(--foreground)] focus:border-[var(--accent-color)] focus:outline-none transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[color:color-mix(in_oklab,var(--foreground)_50%,transparent)] flex items-center gap-2">
               <User className="w-3.5 h-3.5" /> Username
            </label>
            <input 
              name="username" value={formData.username} onChange={handleChange}
              className="w-full bg-[color:color-mix(in_oklab,var(--foreground)_2%,transparent)] border border-[color:color-mix(in_oklab,var(--foreground)_10%,transparent)] rounded-xl px-4 py-3 text-sm text-[var(--foreground)] focus:border-[var(--accent-color)] focus:outline-none transition-colors"
            />
          </div>

          <div className="space-y-1.5">
             {/* Email is typically read-only as it's tied to Auth */}
            <label className="text-xs font-bold uppercase tracking-wider text-[color:color-mix(in_oklab,var(--foreground)_50%,transparent)] flex items-center gap-2">
               <Mail className="w-3.5 h-3.5" /> Email Address
            </label>
            <input 
              value={formData.email} disabled
              className="w-full bg-[color:color-mix(in_oklab,var(--foreground)_4%,transparent)] border border-[color:color-mix(in_oklab,var(--foreground)_10%,transparent)] rounded-xl px-4 py-3 text-sm text-[color:color-mix(in_oklab,var(--foreground)_50%,transparent)] cursor-not-allowed"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[color:color-mix(in_oklab,var(--foreground)_50%,transparent)] flex items-center gap-2">
               <Building2 className="w-3.5 h-3.5" /> Department
            </label>
            <input 
              name="department" value={formData.department} onChange={handleChange}
              className="w-full bg-[color:color-mix(in_oklab,var(--foreground)_2%,transparent)] border border-[color:color-mix(in_oklab,var(--foreground)_10%,transparent)] rounded-xl px-4 py-3 text-sm text-[var(--foreground)] focus:border-[var(--accent-color)] focus:outline-none transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[color:color-mix(in_oklab,var(--foreground)_50%,transparent)] flex items-center gap-2">
               <Briefcase className="w-3.5 h-3.5" /> Job Title
            </label>
            <input 
              name="title" value={formData.title} onChange={handleChange}
              className="w-full bg-[color:color-mix(in_oklab,var(--foreground)_2%,transparent)] border border-[color:color-mix(in_oklab,var(--foreground)_10%,transparent)] rounded-xl px-4 py-3 text-sm text-[var(--foreground)] focus:border-[var(--accent-color)] focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-10 pt-6 border-t border-[color:color-mix(in_oklab,var(--foreground)_10%,transparent)] flex justify-end">
          <button 
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-[var(--accent-color)] hover:brightness-110 text-white font-bold rounded-xl transition-all disabled:opacity-70"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>

      </div>
    </div>
  );
}